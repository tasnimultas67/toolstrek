import BusinessCardMaker from "@/app/(main)/tools-compo/tools/business-card-maker/BusinessCardMaker";
import { CARD_FAQS } from "@/app/(main)/tools-compo/tools/_shared/business-identity/businessIdentityData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/business-card-maker";

export const metadata = {
  title: "Business Card Maker - Free Print-Ready Card Designer",
  description:
    "Design a professional business card online. Five layouts, US, European, square, slim and custom sizes, logo upload, QR codes, card back, bleed, safe areas, sheet imposition and 300 DPI PNG/PDF export.",
  keywords:
    "business card maker, business card generator, free business card design, printable business card, qr code business card, print ready business card, business card template, business card pdf, custom business card, double sided business card, business card designer, card imposition",
  openGraph: {
    title: "Business Card Maker - Print-Ready Design | ToolsTrek",
    description:
      "Create a print-ready business card in your browser with custom sizes, logos, QR codes, bleed preview, sheet imposition and high-resolution exports.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Business Card Maker by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Card Maker | ToolsTrek",
    description: "Design print-ready business cards with logos, QR codes and bleed controls.",
    images: [OG_IMAGE],
  },
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Business Card Maker",
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            description:
              "A private browser-based business card designer with five layouts, custom sizes, logo upload, QR codes, card backs, bleed and safe areas, sheet imposition and high-resolution PNG/PDF export.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank inputs by default with optional demo data",
              "Five business card layouts",
              "US, European, square, slim and custom card sizes",
              "Logo upload with local processing",
              "Locally generated QR codes",
              "Optional card back design",
              "Brand colour and typeface controls",
              "Bleed, safe area and crop mark preview",
              "Sheet imposition with cards per sheet",
              "300 DPI PNG and print-ready PDF export",
              "JSON project import and export",
              "Local autosave with no uploads",
            ],
            creator: { "@type": "Organization", name: "ToolsTrek" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: CARD_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <BusinessCardMaker />
      </ToolPageShell>
    </div>
  );
};

export default page;
