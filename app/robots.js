import { SITE_URL } from "../lib/siteConfig";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      // Allow search discovery while keeping private app endpoints off-limits.
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      // Preserve the existing opt-out from training and bulk dataset crawlers.
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "ClaudeBot",
          "anthropic-ai",
          "Claude-Web",
          "Google-Extended",
          "cohere-ai",
          "Omgilibot",
          "Diffbot",
          "YouBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
