import ShoeClothingSizeConverter from "@/app/(main)/tools-compo/tools/shoe-clothing-size-converter/ShoeClothingSizeConverter";
import { SIZE_FAQS } from "@/app/(main)/tools-compo/tools/shoe-clothing-size-converter/sizeConverterData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/shoe-clothing-size-converter";

export const metadata = {
  title: "Shoe & Clothing Size Converter - US, UK, EU, AU & JP",
  description:
    "Convert shoe and clothing sizes between US, UK, EU, AU, BR and JP systems, or find your size from a measurement. Custom brand charts, fit and width adjustments, CSV and JSON export, and no uploads.",
  keywords:
    "shoe size converter, clothing size converter, us to eu shoe size, uk to us shoe size, eu to us clothing size, international size chart, kids shoe size conversion, women's clothing size chart, men's size converter, foot length to shoe size, bra size alternative, size chart maker",
  openGraph: {
    title: "Shoe & Clothing Size Converter - International Charts | ToolsTrek",
    description:
      "Translate shoe and clothing sizes across US, UK, EU, AU, BR and JP, or convert a foot, chest, waist or hip measurement into a size. Build a custom brand chart.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Shoe & Clothing Size Converter by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shoe & Clothing Size Converter | ToolsTrek",
    description: "Convert international shoe and clothing sizes or find your size from a measurement.",
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
            name: "Shoe & Clothing Size Converter",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Any",
            description:
              "A private international shoe and clothing size converter with measurement matching, custom brand charts, fit and width adjustments and local exports.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank inputs by default with optional demo data",
              "Men's, women's and kids' shoe conversion",
              "Women's, men's and kids' clothing conversion",
              "US, UK, EU, AU, BR and JP sizing systems",
              "Foot length, chest, waist and hip measurement matching",
              "Custom brand size charts with add, edit and delete",
              "JSON chart import and export",
              "Narrow, standard and wide fit guidance",
              "Metric and imperial measurement input",
              "CSV export and printable summaries",
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
            mainEntity: SIZE_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <ShoeClothingSizeConverter />
      </ToolPageShell>
    </div>
  );
};

export default page;
