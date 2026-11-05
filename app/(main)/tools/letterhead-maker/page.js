import LetterheadMaker from "@/app/(main)/tools-compo/tools/letterhead-maker/LetterheadMaker";
import { LETTERHEAD_FAQS } from "@/app/(main)/tools-compo/tools/_shared/business-identity/businessIdentityData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/letterhead-maker";

export const metadata = {
  title: "Letterhead Maker - Free Print-Ready Letterhead Designer",
  description:
    "Create a professional letterhead online. Four layouts, A4, US Letter, A5 and custom paper sizes, logo upload, brand colours and typefaces, bleed, safe areas, letter content and 300 DPI PNG/PDF export.",
  keywords:
    "letterhead maker, letterhead generator, free letterhead template, company letterhead, printable letterhead, business letterhead design, letterhead pdf, official letterhead, corporate stationery, letterhead designer, custom letterhead, a4 letterhead",
  openGraph: {
    title: "Letterhead Maker - Print-Ready Stationery | ToolsTrek",
    description:
      "Design a professional company letterhead in your browser with layouts, custom paper sizes, logos, brand colours, bleed preview and high-resolution exports.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Letterhead Maker by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Letterhead Maker | ToolsTrek",
    description: "Create print-ready letterheads with logos, brand colours and letter content.",
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
            name: "Letterhead Maker",
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            description:
              "A private browser-based letterhead designer with four layouts, A4, US Letter, A5 and custom paper sizes, logo upload, brand controls, letter content and high-resolution PNG/PDF export.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank inputs by default with optional demo data",
              "Four letterhead layouts",
              "A4, US Letter, A5 and custom paper sizes",
              "Logo upload with local processing",
              "Brand colour, ink colour and typeface controls",
              "Bleed, safe area and crop mark preview",
              "Recipient block, subject, body, closing and signature",
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
            mainEntity: LETTERHEAD_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <LetterheadMaker />
      </ToolPageShell>
    </div>
  );
};

export default page;
