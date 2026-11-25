import PDFPageRotator from "@/app/(main)/tools-compo/tools/pdf-page-rotator/PDFPageRotator";
import { PDF_ROTATOR_FAQS } from "@/app/(main)/tools-compo/tools/pdf-page-rotator/pdfRotatorData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/pdf-page-rotator";

export const metadata = {
  title: "PDF Page Rotator - Rotate PDF Pages Online Free",
  description:
    "Rotate PDF pages left, right or upside down without losing quality. Rotate individual pages, ranges such as 1-3,5, or every page, preview thumbnails, export selected pages only and keep full control — all locally in your browser.",
  keywords:
    "pdf page rotator, rotate pdf, rotate pdf pages, rotate pdf online, rotate pdf free, pdf rotation tool, turn pdf pages, rotate one pdf page, rotate pdf 90 degrees, rotate pdf 180 degrees, rotate scanned pdf, fix upside down pdf, rotate pdf pages permanently, pdf page orientation, rotate selected pdf pages, lossless pdf rotation, rotate pdf without quality loss, pdf editor",
  openGraph: {
    title: "PDF Page Rotator - Rotate PDF Pages Losslessly | ToolsTrek",
    description:
      "Rotate single pages, ranges or every page in a PDF with live thumbnails and lossless export. No uploads, no watermarks.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "PDF Page Rotator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Page Rotator | ToolsTrek",
    description:
      "Rotate PDF pages left, right or 180° with per-page control, range selection and selected-pages export.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: PAGE_URL,
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
            name: "PDF Page Rotator",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            description:
              "A lossless PDF page rotator with live thumbnails, per-page and range rotation, orientation auditing and selected-pages export.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Rotate individual PDF pages left or right",
              "Rotate page ranges such as 1-3, 5, 8-10",
              "Select all, odd or even pages",
              "Rotate 90°, 180° or 270°",
              "Live page thumbnails",
              "Original and final orientation audit",
              "Download selected pages only",
              "Reset individual pages or the whole document",
              "Lossless page rotation without recompression",
              "100% client-side processing",
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
            mainEntity: PDF_ROTATOR_FAQS.map((faq) => ({
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
      <ToolPageShell widthClassName="max-w-none">
        <PDFPageRotator />
      </ToolPageShell>
    </div>
  );
};

export default page;
