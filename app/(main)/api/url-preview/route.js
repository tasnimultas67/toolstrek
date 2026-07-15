import { NextResponse } from "next/server";

// Helper to resolve relative URLs to absolute ones
function resolveUrl(baseUrl, targetUrl) {
  if (!targetUrl) return "";
  try {
    return new URL(targetUrl, baseUrl).href;
  } catch (e) {
    return targetUrl;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    let { url, userAgent = "default" } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Add protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: "Please enter a valid URL (e.g., https://example.com)" },
        { status: 400 }
      );
    }

    // User-Agents map for testing different crawlers
    const uaMap = {
      default: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      twitterbot: "Twitterbot/1.0",
      facebook: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_codedoc.php)",
      discord: "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)"
    };

    const selectedUa = uaMap[userAgent.toLowerCase()] || uaMap.default;

    // Fetch site HTML
    let response;
    try {
      response = await fetch(url, {
        headers: {
          "User-Agent": selectedUa,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
        next: { revalidate: 0 }, // Disable server caching in Next.js
        signal: AbortSignal.timeout(8000), // 8 seconds timeout
      });
    } catch (fetchError) {
      console.error("Network fetch failed:", fetchError);
      return NextResponse.json(
        { 
          error: "Connection failed. Please check the URL or try another link. Many websites block automated scrapers.",
          details: fetchError.message
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `Website responded with HTTP status ${response.status}. Access might be restricted.`,
          status: response.status
        },
        { status: 400 }
      );
    }

    const htmlText = await response.text();

    const rawTags = {};

    // 1. Title Parsing
    const titleMatch = htmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      rawTags.title = titleMatch[1].replace(/\s+/g, " ").trim();
    }

    // 2. Meta Tags Extraction
    const metaTagRegex = /<meta\s+([^>]*)\/?>/gi;
    let match;
    while ((match = metaTagRegex.exec(htmlText)) !== null) {
      const attributesStr = match[1];
      const attributes = {};
      
      // Extract all key-value attributes like name="description", content="...", etc.
      const attrRegex = /(\b[\w:-]+)\s*=\s*["']([^"']*)["']/gi;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
        attributes[attrMatch[1].toLowerCase()] = attrMatch[2];
      }

      const key = attributes.property || attributes.name || attributes["http-equiv"];
      const content = attributes.content;

      if (key && content !== undefined) {
        rawTags[key.toLowerCase()] = content;
      }
    }

    // 3. Links Extraction (Canonical & Favicon)
    let canonical = "";
    let favicon = "";

    const linkTagRegex = /<link\s+([^>]*)\/?>/gi;
    let linkMatch;
    while ((linkMatch = linkTagRegex.exec(htmlText)) !== null) {
      const attributesStr = linkMatch[1];
      const attributes = {};
      const attrRegex = /(\b[\w:-]+)\s*=\s*["']([^"']*)["']/gi;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
        attributes[attrMatch[1].toLowerCase()] = attrMatch[2];
      }

      const rel = (attributes.rel || "").toLowerCase();
      const href = attributes.href;

      if (rel === "canonical" && href) {
        canonical = resolveUrl(url, href);
      }
      if ((rel === "icon" || rel === "shortcut icon" || rel.includes("apple-touch-icon")) && href) {
        // Keep the best icon or first icon
        if (!favicon || rel.includes("apple-touch-icon")) {
          favicon = resolveUrl(url, href);
        }
      }
    }

    // Fallback standard favicon if none found
    if (!favicon) {
      favicon = `${parsedUrl.protocol}//${parsedUrl.hostname}/favicon.ico`;
    }

    // 4. JSON-LD Extraction
    const jsonLdData = [];
    const jsonLdRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let ldMatch;
    while ((ldMatch = jsonLdRegex.exec(htmlText)) !== null) {
      try {
        const rawJson = ldMatch[1].trim();
        const parsed = JSON.parse(rawJson);
        jsonLdData.push(parsed);
      } catch (e) {
        // Skip invalid JSON-LD blocks
      }
    }

    // Map extracted tags into standard keys
    const title = rawTags["og:title"] || rawTags["twitter:title"] || rawTags.title || "";
    const description = rawTags.description || rawTags["og:description"] || rawTags["twitter:description"] || "";
    const image = rawTags["og:image"] || rawTags["twitter:image"] || "";
    const siteName = rawTags["og:site_name"] || "";
    const type = rawTags["og:type"] || "website";

    return NextResponse.json({
      success: true,
      url: url,
      domain: parsedUrl.hostname,
      title: title,
      description: description,
      image: resolveUrl(url, image),
      siteName: siteName,
      type: type,
      icon: favicon,
      canonical: canonical || url,
      rawTags: rawTags,
      jsonLd: jsonLdData,
    });

  } catch (error) {
    console.error("Scraper API Error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing URL", details: error.message },
      { status: 500 }
    );
  }
}
