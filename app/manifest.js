export default function manifest() {
  return {
    name: "ToolsTrek — Your Online Utility Hub",
    short_name: "ToolsTrek",
    description:
      "100+ free online tools — QR codes, PDF utilities, calculators, converters, text tools, and more. No sign-up, 100% in-browser privacy.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    orientation: "portrait-primary",
    categories: ["utilities", "productivity", "tools"],
    lang: "en",
    scope: "/",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/toolstrek-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/toolstrek-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    screenshots: [
      {
        src: "/toolstrek-logo.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "ToolsTrek — Online Utility Hub",
      },
    ],
    shortcuts: [
      {
        name: "QR Code Generator",
        short_name: "QR Generator",
        description: "Create QR codes instantly",
        url: "/tools/qr-code-generator",
        icons: [{ src: "/QR-Generator.svg", sizes: "96x96" }],
      },
      {
        name: "Link Shortener",
        short_name: "Short URL",
        description: "Shorten any URL for free",
        url: "/tools/link-shortner",
        icons: [{ src: "/Link-shortener.svg", sizes: "96x96" }],
      },
      {
        name: "All Tools",
        short_name: "Tools",
        description: "Browse 100+ free utilities",
        url: "/tools",
        icons: [{ src: "/tools.svg", sizes: "96x96" }],
      },
    ],
  };
}
