import React from "react";
import BarcodeGenerator from "@/app/(main)/tools-compo/tools/BarcodeGenerator";

export const metadata = {
  title: "Barcode Generator - Create EAN, UPC & Code 128 Barcodes",
  description:
    "Generate barcodes online for free without uploading your data. Create EAN-13, EAN-8, UPC-A, Code 128, Code 39, ITF-14, MSI and Codabar barcodes, repair check digits, audit quiet zones and contrast, verify with a real scanner, export print-ready PNG, SVG, JPEG and PDF labels, and batch-generate CSV label sheets. 100% browser-based.",
  keywords: [
    "barcode generator",
    "free barcode generator",
    "ean 13 generator",
    "ean 8 barcode",
    "upc barcode generator",
    "code 128 generator",
    "code 39 barcode",
    "itf 14 barcode",
    "barcode label maker",
    "barcode maker online",
    "bulk barcode generator",
    "barcode csv to labels",
    "barcode pdf labels",
    "print barcode labels",
    "barcode check digit",
    "retail barcode generator",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Barcode Generator - Print-Ready Labels in Your Browser",
    description:
      "Create retail and logistics barcodes in nine formats with check-digit repair, quiet-zone and contrast audits, scan verification, batch CSV labels and PDF label sheets. Your values never leave your browser.",
    url: "https://toolstrek.vercel.app/tools/barcode-generator",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barcode Generator - EAN, UPC & Code 128 | ToolsTrek",
    description:
      "Generate scan-ready barcodes locally. Nine symbologies, GS1 check-digit repair, print DPI controls, ZXing scan checks, batch CSV import and PDF label sheets.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/barcode-generator",
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
            name: "Barcode Generator",
            description:
              "Free browser-based barcode generator for EAN-13, EAN-8, UPC-A, Code 128, Code 39, ITF-14, MSI and Codabar. Repair check digits, audit quiet zones and contrast, verify with ZXing, and export PNG, SVG, JPEG, PDF labels or batch label sheets.",
            url: "https://toolstrek.vercel.app/tools/barcode-generator",
            applicationCategory: "DesignApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "100% client-side barcode generation with no uploads",
              "EAN-13, EAN-8, UPC-A, Code 128, Code 39, ITF-14, MSI and Codabar",
              "Automatic GS1 check-digit calculation and repair",
              "Quiet-zone, contrast, bar-width and print-height audit",
              "Real ZXing scan verification in the browser",
              "Print-width and 203/300/600 DPI controls",
              "PNG, SVG, JPEG and print-ready PDF label export",
              "Batch CSV input with per-value validation",
              "ZIP export with one PNG per label and a CSV manifest",
              "A4 PDF label sheets with 2, 3 or 4 columns",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <BarcodeGenerator />
    </div>
  );
};

export default page;
