import PolarChartGenerator from "@/app/(main)/tools-compo/tools/polar-chart-generator/PolarChartGenerator";
import { POLAR_FAQS } from "@/app/(main)/tools-compo/tools/polar-chart-generator/polarChartData";
import React from "react";

export const metadata = {
  title: "Polar Chart Generator | Free Online Rose & Radial Bar Chart Maker",
  description:
    "Free online polar chart generator and rose chart maker. Import a CSV or Excel file, or type your data, to instantly build clean radial charts with area-accurate square-root scaling, polar area or radial bar shapes, a centre hole, adjustable rings, rotation, gaps, labels and legends, plus one-click PNG or SVG export — 100% in your browser.",
  keywords: [
    "polar chart generator",
    "polar chart maker",
    "rose chart generator",
    "rose diagram maker",
    "nightingale rose chart",
    "coxcomb chart generator",
    "radial bar chart maker",
    "circular bar chart generator",
    "wind rose generator",
    "polar area chart",
    "create polar chart online",
    "free rose chart maker",
    "polar chart with percentages",
    "csv to polar chart",
    "excel to polar chart",
    "upload csv chart maker",
    "data visualization tool",
    "polar chart png export",
    "polar chart svg",
    "online chart builder",
    "ToolsTrek",
  ],
  openGraph: {
    title:
      "Polar Chart Generator | Free Online Rose & Radial Bar Chart Maker | ToolsTrek",
    description:
      "Create polar area, rose and radial bar charts in seconds. Import a CSV or Excel file or type your data, with a live preview, area-accurate square-root scaling, an optional centre hole, adjustable rings, rotation, gaps, labels and legends, and instant PNG/SVG export — 100% in your browser.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/polar-chart-generator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Polar Chart Generator | Free Online Rose & Radial Bar Chart Maker | ToolsTrek",
    description:
      "Create polar area, rose and radial bar charts in seconds — import CSV or Excel data, or type it in. Live preview, square-root or linear scaling, a centre hole, adjustable rings, labels, legends and one-click PNG/SVG export.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/polar-chart-generator",
  },
};

const page = () => {
  return (
    <div>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Polar Chart Generator",
            description:
              "Free online polar chart, rose chart and radial bar chart generator. Import a CSV or Excel file or type your data, then use the live preview, area-accurate square-root scaling, polar area and radial bar shapes, an optional centre hole, adjustable ring levels, rotation, gaps and corner radius, labels, legends, and PNG and SVG export.",
            url: "https://toolstrek.vercel.app/tools/polar-chart-generator",
            applicationCategory: "DesignApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Interactive SVG preview with hover tooltips that updates as you type",
              "Import data from CSV, TSV and Excel (.xlsx) files, or paste text",
              "Automatic delimiter and header detection with category/value column mapping",
              "Interactive hover tooltip with category, value and percentage",
              "Linked highlighting between legend, data table and chart",
              "Polar area (rose / Nightingale) and radial bar chart shapes",
              "Area-accurate square-root scaling or a direct linear radius",
              "Optional centre hole with a live total in the middle",
              "Adjustable number of concentric ring levels",
              "Auto fit, fixed 0–100 and custom ring scales",
              "Rotatable start angle and clockwise or counter-clockwise direction",
              "Adjustable slice gap and rounded radial bar caps",
              "Ten curated colour palettes plus per-category colour pickers",
              "Optional radial gradient fills, outlines, opacity and drop shadow",
              "Value labels with value, percent or combined formats and 0–4 decimals",
              "Decimal precision, thousands separators and compact notation (K, M, B)",
              "Custom value prefixes and suffixes",
              "Toggleable grid rings, category spokes, category labels and radial ticks",
              "Customisable legend on the top, right, bottom or left",
              "Light, dark and transparent canvas themes with editable colours",
              "Adjustable export width and height for slide, print and social sizes",
              "High-resolution PNG export up to 4× and scalable SVG export",
              "Copy SVG markup, and download data as CSV or JSON",
              "100% client-side, private and mobile responsive",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      {/* FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: POLAR_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />
      <PolarChartGenerator />
    </div>
  );
};

export default page;
