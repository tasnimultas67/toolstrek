import { NextResponse } from "next/server";

// ─────────────────────────────────────────────
// Technology signature databases
// ─────────────────────────────────────────────

const SERVER_SIGNATURES = [
  { name: "Apache", pattern: /apache/i, icon: "🪶", category: "Web Server" },
  { name: "Nginx", pattern: /nginx/i, icon: "🟩", category: "Web Server" },
  { name: "IIS", pattern: /microsoft-iis/i, icon: "🪟", category: "Web Server" },
  { name: "Cloudflare", pattern: /cloudflare/i, icon: "🔶", category: "CDN / Proxy" },
  { name: "LiteSpeed", pattern: /litespeed/i, icon: "⚡", category: "Web Server" },
  { name: "Caddy", pattern: /caddy/i, icon: "🦭", category: "Web Server" },
  { name: "OpenResty", pattern: /openresty/i, icon: "🌙", category: "Web Server" },
  { name: "Gunicorn", pattern: /gunicorn/i, icon: "🦄", category: "Web Server" },
  { name: "Vercel", pattern: /vercel/i, icon: "▲", category: "Hosting" },
  { name: "Netlify", pattern: /netlify/i, icon: "🔷", category: "Hosting" },
];

const CMS_SIGNATURES = [
  { name: "WordPress", patterns: [/wp-content/i, /wp-includes/i, /\/wp-json\//i], icon: "🔵", category: "CMS" },
  { name: "Drupal", patterns: [/drupal/i, /sites\/default\/files/i], icon: "💧", category: "CMS" },
  { name: "Joomla", patterns: [/joomla/i, /\/components\/com_/i], icon: "🟡", category: "CMS" },
  { name: "Ghost", patterns: [/ghost\/core/i, /content\/ghost-theme/i], icon: "👻", category: "CMS" },
  { name: "Wix", patterns: [/wix\.com/i, /wixsite\.com/i, /wixstatic/i], icon: "🌐", category: "Website Builder" },
  { name: "Shopify", patterns: [/cdn\.shopify\.com/i, /shopify\.com\/s\//i], icon: "🛍️", category: "E-Commerce" },
  { name: "Squarespace", patterns: [/squarespace\.com/i, /squarespace-cdn\.com/i], icon: "⬛", category: "Website Builder" },
  { name: "Webflow", patterns: [/webflow\.com/i, /assets\.website-files\.com/i], icon: "🌊", category: "Website Builder" },
  { name: "Magento", patterns: [/mage\/cookies\.js/i, /skin\/frontend\/default\//i], icon: "🔴", category: "E-Commerce" },
  { name: "PrestaShop", patterns: [/prestashop/i, /modules\/ps_/i], icon: "🔵", category: "E-Commerce" },
  { name: "Gatsby", patterns: [/gatsby/i, /___gatsby/i], icon: "🟣", category: "Static Site Generator" },
  { name: "Next.js", patterns: [/__NEXT_DATA__/i, /_next\/static/i], icon: "▲", category: "Framework" },
  { name: "Nuxt.js", patterns: [/__NUXT__/i, /_nuxt\//i], icon: "💚", category: "Framework" },
  { name: "Hugo", patterns: [/hugo.*theme/i, /generator.*hugo/i], icon: "🔴", category: "Static Site Generator" },
  { name: "Jekyll", patterns: [/jekyll/i, /assets\/main\.css.*jekyll/i], icon: "🔮", category: "Static Site Generator" },
];

const JS_FRAMEWORK_SIGNATURES = [
  { name: "React", patterns: [/react\.production\.min\.js/i, /react-dom/i, /data-reactroot/i, /__react/i], icon: "⚛️", category: "JS Framework" },
  { name: "Vue.js", patterns: [/vue\.min\.js/i, /vue\.js/i, /data-v-[a-f0-9]+/i, /__vue__/i], icon: "💚", category: "JS Framework" },
  { name: "Angular", patterns: [/ng-version/i, /angular\.min\.js/i, /angular\.js/i, /ng-app/i], icon: "🔴", category: "JS Framework" },
  { name: "Svelte", patterns: [/svelte/i, /__svelte/i], icon: "🔶", category: "JS Framework" },
  { name: "jQuery", patterns: [/jquery\.min\.js/i, /jquery-[0-9]/i, /\/jquery\//i], icon: "🔵", category: "JS Library" },
  { name: "Bootstrap", patterns: [/bootstrap\.min\.css/i, /bootstrap\.css/i, /bootstrap\.bundle/i], icon: "🅱️", category: "CSS Framework" },
  { name: "Tailwind CSS", patterns: [/tailwind/i, /tailwindcss/i], icon: "🎨", category: "CSS Framework" },
  { name: "Ember.js", patterns: [/ember\.js/i, /ember\.min\.js/i, /ember-application/i], icon: "🔥", category: "JS Framework" },
  { name: "Backbone.js", patterns: [/backbone\.js/i, /backbone\.min\.js/i], icon: "🦴", category: "JS Library" },
  { name: "Alpine.js", patterns: [/alpine\.js/i, /alpinejs/i, /x-data=/i], icon: "❄️", category: "JS Framework" },
  { name: "Htmx", patterns: [/htmx\.org/i, /hx-get/i, /hx-post/i], icon: "🟠", category: "JS Library" },
];

const ANALYTICS_SIGNATURES = [
  { name: "Google Analytics 4", patterns: [/gtag\/js/i, /GA_MEASUREMENT_ID/i, /googletagmanager\.com/i], icon: "📊", category: "Analytics" },
  { name: "Google Analytics (UA)", patterns: [/google-analytics\.com\/analytics\.js/i, /ga\('create'/i], icon: "📈", category: "Analytics" },
  { name: "Hotjar", patterns: [/hotjar\.com/i, /hotjar-[0-9]/i], icon: "🔥", category: "Analytics" },
  { name: "Mixpanel", patterns: [/mixpanel\.com/i, /mixpanel\.init/i], icon: "🟣", category: "Analytics" },
  { name: "Segment", patterns: [/segment\.com\/analytics\.js/i, /analytics\.js.*segment/i], icon: "📡", category: "Analytics" },
  { name: "Facebook Pixel", patterns: [/connect\.facebook\.net/i, /fbq\('init'/i], icon: "🔵", category: "Marketing" },
  { name: "Plausible", patterns: [/plausible\.io\/js/i], icon: "📊", category: "Analytics" },
  { name: "Matomo", patterns: [/matomo\.js/i, /piwik\.js/i], icon: "📊", category: "Analytics" },
  { name: "Clarity", patterns: [/clarity\.ms\/tag/i, /microsoft.*clarity/i], icon: "📊", category: "Analytics" },
  { name: "Intercom", patterns: [/intercom\.com/i, /widget\.intercom\.io/i], icon: "💬", category: "Support" },
  { name: "Zendesk", patterns: [/zendesk\.com/i, /zdassets\.com/i], icon: "🎫", category: "Support" },
  { name: "Crisp", patterns: [/crisp\.chat/i, /client\.crisp\.chat/i], icon: "💬", category: "Support" },
];

const SECURITY_HEADER_CHECKS = [
  { name: "Strict-Transport-Security", header: "strict-transport-security", label: "HSTS", goodValue: true },
  { name: "Content-Security-Policy", header: "content-security-policy", label: "CSP", goodValue: true },
  { name: "X-Frame-Options", header: "x-frame-options", label: "X-Frame-Options", goodValue: true },
  { name: "X-Content-Type-Options", header: "x-content-type-options", label: "X-Content-Type-Options", goodValue: "nosniff" },
  { name: "Referrer-Policy", header: "referrer-policy", label: "Referrer-Policy", goodValue: true },
  { name: "Permissions-Policy", header: "permissions-policy", label: "Permissions-Policy", goodValue: true },
];

// ─────────────────────────────────────────────
// Analyze HTML content for tech signatures
// ─────────────────────────────────────────────
function analyzeHtml(html, url) {
  const detected = [];

  // Check CMS
  for (const tech of CMS_SIGNATURES) {
    const matched = tech.patterns.some((p) => p.test(html));
    if (matched) {
      detected.push({ name: tech.name, icon: tech.icon, category: tech.category, confidence: "High" });
    }
  }

  // Check JS Frameworks
  for (const tech of JS_FRAMEWORK_SIGNATURES) {
    const matched = tech.patterns.some((p) => p.test(html));
    if (matched) {
      detected.push({ name: tech.name, icon: tech.icon, category: tech.category, confidence: "High" });
    }
  }

  // Check Analytics
  for (const tech of ANALYTICS_SIGNATURES) {
    const matched = tech.patterns.some((p) => p.test(html));
    if (matched) {
      detected.push({ name: tech.name, icon: tech.icon, category: tech.category, confidence: "High" });
    }
  }

  return detected;
}

// ─────────────────────────────────────────────
// Analyze response headers for tech
// ─────────────────────────────────────────────
function analyzeHeaders(headers) {
  const detected = [];

  const serverHeader = headers.get("server") || "";
  const xPoweredBy = headers.get("x-powered-by") || "";
  const via = headers.get("via") || "";
  const setCookie = headers.get("set-cookie") || "";

  // Combine all header values for scanning
  const allHeaders = `${serverHeader} ${xPoweredBy} ${via} ${setCookie}`;

  // Server detection
  for (const tech of SERVER_SIGNATURES) {
    if (tech.pattern.test(allHeaders)) {
      detected.push({ name: tech.name, icon: tech.icon, category: tech.category, confidence: "High" });
    }
  }

  // X-Powered-By technologies
  if (/php/i.test(xPoweredBy)) {
    const phpVer = xPoweredBy.match(/php\/([\d.]+)/i);
    detected.push({ name: phpVer ? `PHP ${phpVer[1]}` : "PHP", icon: "🐘", category: "Language", confidence: "High" });
  }
  if (/asp\.net/i.test(xPoweredBy)) {
    detected.push({ name: "ASP.NET", icon: "🔷", category: "Framework", confidence: "High" });
  }
  if (/express/i.test(xPoweredBy)) {
    detected.push({ name: "Express.js", icon: "🟩", category: "Framework", confidence: "High" });
  }
  if (/next\.js/i.test(xPoweredBy)) {
    detected.push({ name: "Next.js", icon: "▲", category: "Framework", confidence: "High" });
  }

  // Cloudflare detection via headers
  if (headers.get("cf-ray") || headers.get("cf-cache-status")) {
    detected.push({ name: "Cloudflare", icon: "🔶", category: "CDN / Proxy", confidence: "High" });
  }

  // Vercel
  if (headers.get("x-vercel-id") || /vercel/i.test(serverHeader)) {
    detected.push({ name: "Vercel", icon: "▲", category: "Hosting", confidence: "High" });
  }

  // AWS
  if (/aws/i.test(serverHeader) || headers.get("x-amz-request-id")) {
    detected.push({ name: "Amazon AWS", icon: "🟡", category: "Cloud / Hosting", confidence: "Medium" });
  }

  // Cookie-based CMS detection
  if (/wordpress_/i.test(setCookie)) {
    detected.push({ name: "WordPress", icon: "🔵", category: "CMS", confidence: "High" });
  }

  return detected;
}

// ─────────────────────────────────────────────
// Extract meta tags from HTML
// ─────────────────────────────────────────────
function extractMeta(html) {
  const meta = {};

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  meta.title = titleMatch ? titleMatch[1].trim() : null;

  // Description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  meta.description = descMatch ? descMatch[1].trim() : null;

  // Generator
  const genMatch = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']generator["']/i);
  meta.generator = genMatch ? genMatch[1].trim() : null;

  // Open Graph
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  meta.ogTitle = ogTitle ? ogTitle[1].trim() : null;

  // Charset
  const charsetMatch = html.match(/<meta[^>]+charset=["']?([^"'\s>]+)/i);
  meta.charset = charsetMatch ? charsetMatch[1].trim() : null;

  // Viewport
  const viewportMatch = html.match(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']+)["']/i);
  meta.viewport = viewportMatch ? viewportMatch[1].trim() : null;

  // Language
  const langMatch = html.match(/<html[^>]+lang=["']?([a-zA-Z-]+)["']?/i);
  meta.language = langMatch ? langMatch[1] : null;

  return meta;
}

// ─────────────────────────────────────────────
// Check security headers
// ─────────────────────────────────────────────
function checkSecurityHeaders(headers) {
  return SECURITY_HEADER_CHECKS.map((check) => {
    const value = headers.get(check.header);
    let status = "missing";
    if (value) {
      if (check.goodValue === true) status = "present";
      else if (typeof check.goodValue === "string" && value.toLowerCase().includes(check.goodValue)) status = "present";
      else status = "present";
    }
    return {
      name: check.label,
      fullName: check.name,
      value: value || null,
      status,
    };
  });
}

// ─────────────────────────────────────────────
// Deduplicate detected technologies
// ─────────────────────────────────────────────
function dedup(arr) {
  const seen = new Set();
  return arr.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─────────────────────────────────────────────
// POST /api/detect-tech
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    let { url, followRedirects = true, timeout = 10000, userAgent = "default" } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalize URL
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const userAgentStrings = {
      default: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      bot: "Googlebot/2.1 (+http://www.google.com/bot.html)",
    };

    const uaString = userAgentStrings[userAgent] || userAgentStrings.default;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": uaString,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
        },
        redirect: followRedirects ? "follow" : "manual",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const finalUrl = response.url || url;
    const statusCode = response.status;
    const headers = response.headers;

    // Read HTML (limit to 500KB to avoid memory issues)
    const textBuffer = await response.text();
    const html = textBuffer.slice(0, 512000);

    // Run all analyses
    const fromHeaders = analyzeHeaders(headers);
    const fromHtml = analyzeHtml(html, finalUrl);

    const allTech = dedup([...fromHeaders, ...fromHtml]);

    // Group by category
    const grouped = {};
    for (const tech of allTech) {
      if (!grouped[tech.category]) grouped[tech.category] = [];
      grouped[tech.category].push(tech);
    }

    // Meta tags
    const meta = extractMeta(html);

    // Generator-based detection
    if (meta.generator) {
      const gen = meta.generator;
      if (/wordpress/i.test(gen)) {
        const wpVer = gen.match(/wordpress\s*([\d.]+)/i);
        if (!allTech.find((t) => t.name === "WordPress")) {
          allTech.unshift({ name: wpVer ? `WordPress ${wpVer[1]}` : "WordPress", icon: "🔵", category: "CMS", confidence: "High" });
        }
      }
    }

    // Security headers
    const securityHeaders = checkSecurityHeaders(headers);
    const securityScore = Math.round(
      (securityHeaders.filter((h) => h.status === "present").length / securityHeaders.length) * 100
    );

    // Response timing is approximate (we can't get exact timing on server side)
    const responseHeaders = {};
    for (const [key, value] of headers.entries()) {
      responseHeaders[key] = value;
    }

    // Detect redirect
    const wasRedirected = finalUrl !== url;

    return NextResponse.json({
      url: parsedUrl.href,
      finalUrl,
      domain: parsedUrl.hostname,
      statusCode,
      wasRedirected,
      technologies: dedup([...fromHeaders, ...fromHtml]),
      grouped,
      meta,
      securityHeaders,
      securityScore,
      serverHeader: headers.get("server") || null,
      xPoweredBy: headers.get("x-powered-by") || null,
      contentType: headers.get("content-type") || null,
      cacheControl: headers.get("cache-control") || null,
      encoding: headers.get("content-encoding") || null,
      responseHeaders: Object.fromEntries(
        Object.entries(responseHeaders).filter(([key]) =>
          ["server", "x-powered-by", "content-type", "cache-control", "content-encoding",
           "strict-transport-security", "content-security-policy", "x-frame-options",
           "x-content-type-options", "referrer-policy", "permissions-policy",
           "cf-ray", "cf-cache-status", "x-vercel-id", "via", "age", "etag"].includes(key)
        )
      ),
    });
  } catch (error) {
    console.error("Tech detection error:", error);

    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out. The website took too long to respond." }, { status: 408 });
    }
    if (error.code === "ENOTFOUND" || error.message?.includes("getaddrinfo")) {
      return NextResponse.json({ error: "Domain not found. Please check the URL." }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to analyze website. Please check the URL and try again." },
      { status: 500 }
    );
  }
}
