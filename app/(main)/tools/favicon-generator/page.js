import FaviconGenerator from "@/app/(main)/tools-compo/tools/FaviconGenerator";

export const metadata = {
  title: "Free Favicon Generator | Create Favicon Pack (PNG + ICO) | ToolsTrek",
  description:
    "Generate a professional favicon pack in seconds. Upload any image, apply rounded corners, background color, and padding — then download all standard sizes (16×16 to 512×512) as a ZIP. 100% client-side, no uploads.",
  keywords: [
    "favicon generator",
    "free favicon maker",
    "favicon ico creator",
    "png favicon",
    "apple touch icon",
    "pwa icon generator",
    "favicon pack download",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Free Favicon Generator | Create Favicon Pack (PNG + ICO)",
    description:
      "Upload an image and get a complete favicon pack — 16×16, 32×32, 48×48, 192×192, 512×512 PNG files plus a favicon.ico, all in one ZIP download.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/favicon-generator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Favicon Generator | Create Favicon Pack (PNG + ICO)",
    description:
      "Upload an image and instantly generate a professional favicon pack for your website. Rounded corners, backgrounds, and custom padding supported.",
    site: "@toolstrek",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/favicon-generator",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  authors: [{ name: "ToolsTrek" }],
  creator: "ToolsTrek",
  publisher: "ToolsTrek",
};

export default function FaviconGeneratorPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Favicon Generator",
            description:
              "Generate a complete favicon pack from any image. Supports rounded corners, background color, and custom padding. Downloads all standard sizes as a ZIP.",
            url: "https://toolstrek.vercel.app/tools/favicon-generator",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Generate PNG favicons at 16×16, 32×32, 48×48, 192×192, 512×512",
              "Export favicon.ico for legacy browser support",
              "Adjustable corner radius (sharp to full circle)",
              "Optional background color fill for transparent images",
              "Image padding control",
              "Live real-time canvas preview",
              "Download as ZIP with HTML snippet included",
              "100% client-side — no image uploads",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <FaviconGenerator />
    </div>
  );
}
