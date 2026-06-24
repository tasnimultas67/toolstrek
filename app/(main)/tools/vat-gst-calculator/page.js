import VatCalculator from "@/app/(main)/tools-compo/tools/vat-calculator/VatCalculator";
import React from "react";

export const metadata = {
  title: "VAT & GST Calculator - Calculate Tax Online Worldwide | ToolsTrek",
  description:
    "Free online VAT and GST calculator. Add tax, remove tax, calculate tax amounts, download PDF reports, and use country-specific tax presets.",
  keywords:
    "VAT Calculator, GST Calculator, Sales Tax Calculator, Tax Calculator Online, VAT Calculator UK, GST Calculator India, VAT Calculator Bangladesh, tax calculator, add tax, remove tax",
  openGraph: {
    title: "VAT & GST Calculator - Calculate Tax Online Worldwide",
    description:
      "Calculate VAT, GST, Sales Tax, and Tax-Inclusive Prices instantly. Add or remove tax, use country presets, and download PDF reports.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/vat-gst-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/vat-gst-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "VAT & GST Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VAT & GST Calculator - Calculate Tax Online Worldwide",
    description:
      "Instantly calculate VAT/GST, add or remove tax, use country-specific tax rates, and download PDF reports.",
    images: ["https://toolstrek.vercel.app/og/vat-gst-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/vat-gst-calculator",
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
  return <VatCalculator />;
};

export default page;
