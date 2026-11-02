import InvoiceGenerator from "@/app/(main)/tools-compo/tools/invoice-generator/InvoiceGenerator";
import { INVOICE_FAQS } from "@/app/(main)/tools-compo/tools/invoice-generator/invoiceData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/invoice-generator";

export const metadata = {
  title: "Free Invoice Generator - Create & Download PDF Invoices Online",
  description:
    "Create professional invoices online for free. Add your logo, line items, per-item tax and discounts, 40 currencies, payment details and notes, then download a vector PDF or print instantly. Drafts auto-save in your browser and never leave your device.",
  keywords:
    "invoice generator, free invoice generator, online invoice maker, invoice template, pdf invoice generator, billing invoice, freelance invoice, small business invoice, invoice with logo, tax invoice generator, vat invoice, receipt maker, invoice creator, downloadable invoice pdf, printable invoice",
  openGraph: {
    title: "Free Invoice Generator - Create & Download PDF Invoices Online",
    description:
      "Build a polished, itemised invoice with live totals, taxes, discounts, your logo and a print-ready vector PDF — free and private.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Invoice Generator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Invoice Generator - Create & Download PDF Invoices Online",
    description:
      "Create itemised invoices with tax, discounts, 40 currencies, logos and instant vector PDF export.",
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
            name: "Invoice Generator",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            description:
              "A free browser-based invoice generator with line items, per-item tax and discounts, inclusive or exclusive tax modes, 40 currencies, logo upload, live preview, print-ready vector PDF export and local draft storage.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Live invoice preview with instant recalculation",
              "Unlimited line items with quantity, unit, rate, tax and discount",
              "Tax inclusive or exclusive modes with per-rate breakdown",
              "Invoice-level percentage or fixed discount, shipping, deposits and rounding",
              "Forty currencies with locale-aware formatting",
              "Logo upload converted to print-safe PNG",
              "Six accent themes, modern and classic templates, A4 or Letter paper",
              "Payment details, notes, terms and configurable columns",
              "Vector PDF download and print view with automatic pagination",
              "Auto-saved local draft plus JSON import and export",
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
            mainEntity: INVOICE_FAQS.map((faq) => ({
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
        <InvoiceGenerator />
      </ToolPageShell>
    </div>
  );
};

export default page;
