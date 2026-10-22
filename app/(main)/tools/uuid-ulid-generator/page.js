import UuidUlidGenerator from "@/app/(main)/tools-compo/tools/uuid-ulid-generator/UuidUlidGenerator";
import { ID_FAQS } from "@/app/(main)/tools-compo/tools/uuid-ulid-generator/uuidUlidData";
import React from "react";

export const metadata = {
  title: "UUID / ULID Generator - Secure UUID v4, v7, v5 & ULID",
  description:
    "Generate cryptographically secure UUID v4, v7, v1 and v5 values, sortable ULIDs or custom NanoIDs. Format batches of up to 1,000, inspect any UUID or ULID, and copy or download as TXT, JSON or CSV. Free and 100% browser-based.",
  keywords:
    "uuid generator, ulid generator, uuid v4 generator, uuid v7 generator, uuid v5 generator, nanoid generator, secure uuid, bulk uuid generator, generate ulid online, uuid validator, ulid decoder, guid generator, random id generator, sortable id generator, developer id tools",
  openGraph: {
    title: "UUID / ULID Generator - Secure UUID v4, v7, v5 & ULID",
    description:
      "Generate secure UUIDs, ULIDs and NanoIDs in bulk, format them your way and inspect timestamps and versions without an API call.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/uuid-ulid-generator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/uuid-ulid-generator.jpg",
        width: 1200,
        height: 630,
        alt: "UUID / ULID Generator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UUID / ULID Generator - Secure UUID v4, v7, v5 & ULID",
    description:
      "Generate up to 1,000 secure identifiers, choose case and formatting, inspect any UUID or ULID, and export the batch locally.",
    images: ["https://toolstrek.vercel.app/og/uuid-ulid-generator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/uuid-ulid-generator",
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
            name: "UUID / ULID Generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            description:
              "A secure client-side UUID, ULID and NanoID generator with bulk output, formatting controls, version inspection and TXT, JSON or CSV export.",
            url: "https://toolstrek.vercel.app/tools/uuid-ulid-generator",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Cryptographically secure UUID v4, v7, v1 and v5 generation",
              "Sortable ULIDs with optional monotonic batches",
              "Custom NanoID length and alphabet",
              "Batches of up to 1,000 identifiers",
              "Uppercase, hyphen, brace and separator formatting",
              "UUID and ULID version, variant and timestamp inspector",
              "TXT, JSON and CSV downloads plus one-click copy",
              "100% client-side privacy",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: ID_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      <UuidUlidGenerator />
    </div>
  );
};

export default page;
