import PrintSizeCalculator from "@/app/(main)/tools-compo/tools/print-size-calculator/PrintSizeCalculator";
import { PRINT_FAQS } from "@/app/(main)/tools-compo/tools/print-size-calculator/printSizeData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/print-size-calculator";

export const metadata = {
  title: "Print Size Calculator - Pixels to Inches, DPI & Paper Sizes",
  description:
    "Convert pixels to print size or print size to pixels at any DPI. Check resolution quality, add bleed and safe margins, preview crop marks, and work out how many cards fit on a sheet. Free, private and browser-based.",
  keywords:
    "print size calculator, pixels to inches, dpi calculator, 300 dpi print size, paper size calculator, a4 dimensions, letter size, bleed calculator, safe margin, crop marks, business card imposition, how many cards per sheet, print resolution checker",
  openGraph: {
    title: "Print Size Calculator - Pixels, DPI, Paper & Bleed | ToolsTrek",
    description:
      "Know exactly how large your file will print, what DPI it delivers, and how many copies fit on a sheet. Includes bleed, safe area, crop marks and PNG/JPEG/PDF-ready specifications.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Print Size Calculator by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Print Size Calculator | ToolsTrek",
    description: "Pixels to print size, DPI checks, paper sizes, bleed, safe margins and sheet imposition.",
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
            name: "Print Size Calculator",
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            description:
              "A browser-based print size calculator for pixel-to-print conversions, effective DPI checks, paper standards, bleed, safe margins, crop marks and sheet imposition.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank inputs by default with optional demo data",
              "Pixels to print size at any DPI",
              "Print size to required pixels",
              "Effective DPI from a pixel size and physical size",
              "ISO A, B and C paper sizes plus US and photo formats",
              "Custom paper dimensions and orientation",
              "Bleed and safe margin preview",
              "Optional crop marks",
              "Sheet imposition with copies per sheet",
              "Saved print presets",
              "CSV, PDF and printed specification export",
              "100% client-side processing",
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
            mainEntity: PRINT_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <PrintSizeCalculator />
      </ToolPageShell>
    </div>
  );
};

export default page;
