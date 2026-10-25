import BrandKitContent from "./BrandKitContent";

const BASE_URL = "https://toolstrek.vercel.app";
const PAGE_URL = `${BASE_URL}/brand-kit`;
const PAGE_TITLE = "Brand & Media Kit";
const PAGE_DESCRIPTION =
  "Download the official ToolsTrek brand assets — logos, monogram, app icon, social card, colour palette, typography, usage guidelines and press contact details.";

export const metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ToolsTrek brand kit",
    "ToolsTrek media kit",
    "ToolsTrek logo",
    "ToolsTrek logo download",
    "brand guidelines",
    "logo assets",
    "press kit",
    "media kit",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PAGE_URL,
    siteName: "ToolsTrek",
    title: `${PAGE_TITLE} — ToolsTrek`,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: `${BASE_URL}/brand/toolstrek-social-card.png`,
        width: 1200,
        height: 630,
        alt: "ToolsTrek brand and media kit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@toolstrek",
    creator: "@toolstrek",
    title: `${PAGE_TITLE} — ToolsTrek`,
    description: PAGE_DESCRIPTION,
    images: [`${BASE_URL}/brand/toolstrek-social-card.png`],
  },
};

const brandSchema = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "ToolsTrek Brand & Media Kit",
  url: PAGE_URL,
  description: PAGE_DESCRIPTION,
  about: {
    "@type": "Organization",
    name: "ToolsTrek",
    url: BASE_URL,
    logo: `${BASE_URL}/brand/toolstrek-logo-primary.svg`,
    sameAs: ["https://github.com/tasnimultas67/toolstrek"],
  },
};

export default function BrandKitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      <BrandKitContent />
    </>
  );
}
