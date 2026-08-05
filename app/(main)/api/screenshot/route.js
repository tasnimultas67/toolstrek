import { NextResponse } from "next/server";

const MICROLINK_BASE = "https://api.microlink.io/";
// Parameters that are private to our proxy and must NOT be forwarded to Microlink
const PROXY_ONLY_PARAMS = new Set(["image_url"]);

/**
 * GET /api/screenshot
 *
 * Mode 1 – Image proxy: ?image_url=<cdnUrl>
 *   Fetches a remote image on the server side and streams it back same-origin.
 *   Bypasses browser CORS tainting and client-side adblockers.
 *
 * Mode 2 – Capture proxy: all other params forwarded to Microlink JSON API.
 *   Returns the full Microlink JSON response so the client can read screenshot.url.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // ── Mode 1: Raw image proxy ───────────────────────────────────────────────
    const imageUrl = searchParams.get("image_url");
    if (imageUrl) {
      // Basic allow-list: only proxy microlink CDN URLs
      let parsedImageUrl;
      try {
        parsedImageUrl = new URL(imageUrl);
      } catch {
        return NextResponse.json({ error: "Invalid image_url" }, { status: 400 });
      }
      if (!parsedImageUrl.hostname.endsWith("microlink.io") && !parsedImageUrl.hostname.endsWith("cdn.microlink.io")) {
        return NextResponse.json({ error: "Forbidden image host" }, { status: 403 });
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);
      try {
        const imgRes = await fetch(imageUrl, { signal: controller.signal });
        clearTimeout(timer);
        if (!imgRes.ok) {
          return new Response(`CDN error: ${imgRes.statusText}`, { status: imgRes.status });
        }
        const blob = await imgRes.arrayBuffer();
        return new Response(blob, {
          headers: {
            "Content-Type": imgRes.headers.get("Content-Type") ?? "image/png",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        clearTimeout(timer);
        if (err.name === "AbortError") {
          return NextResponse.json({ error: "Image download timed out" }, { status: 504 });
        }
        throw err;
      }
    }

    // ── Mode 2: Microlink capture proxy ──────────────────────────────────────
    const targetUrl = searchParams.get("url");
    if (!targetUrl) {
      return NextResponse.json({ error: "Missing required 'url' parameter." }, { status: 400 });
    }

    // Build Microlink URL, stripping our private-only params
    const microlinkUrl = new URL(MICROLINK_BASE);
    searchParams.forEach((value, key) => {
      if (!PROXY_ONLY_PARAMS.has(key)) {
        microlinkUrl.searchParams.set(key, value);
      }
    });

    const controller = new AbortController();
    // Microlink can take 30-60 s for a full-page capture with delay
    const timer = setTimeout(() => controller.abort(), 90_000);

    let mlResponse;
    try {
      mlResponse = await fetch(microlinkUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      });
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        return NextResponse.json(
          { error: "Capture timed out. Try reducing the render delay or capturing a simpler page." },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timer);

    if (!mlResponse.ok) {
      const text = await mlResponse.text().catch(() => mlResponse.statusText);
      return NextResponse.json(
        { error: `Screenshot engine error (${mlResponse.status}): ${text}` },
        { status: mlResponse.status }
      );
    }

    const data = await mlResponse.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });

  } catch (error) {
    console.error("[screenshot/route] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error?.message ?? "unknown") },
      { status: 500 }
    );
  }
}
