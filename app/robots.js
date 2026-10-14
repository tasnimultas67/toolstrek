export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/favorites",
          "/recent",
        ],
      },
      // Block aggressive AI scrapers and data harvesters
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
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
    sitemap: "https://toolstrek.vercel.app/sitemap.xml",
    host: "https://toolstrek.vercel.app",
  };
}
