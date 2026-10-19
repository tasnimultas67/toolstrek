import PieChartGenerator from "@/app/(main)/tools-compo/tools/pie-chart-generator/PieChartGenerator";
import React from "react";

export const metadata = {
  title: "Pie Chart Generator | Free Online Pie & Donut Chart Maker",
  description:
    "Free online pie chart generator and donut chart maker. Import a CSV or Excel file, or type your data, to instantly create beautiful, customizable pie and donut charts with live preview, curated colour palettes, adjustable labels, legends, exploded slices, and one-click PNG or SVG export.",
  keywords: [
    "pie chart generator",
    "pie chart maker",
    "donut chart generator",
    "doughnut chart maker",
    "create pie chart online",
    "free pie chart maker",
    "pie chart with percentages",
    "csv to pie chart",
    "excel to pie chart",
    "upload csv chart maker",
    "circle graph maker",
    "data visualization tool",
    "donut chart with total",
    "pie chart png export",
    "pie chart svg",
    "online chart builder",
    "ToolsTrek",
  ],
  openGraph: {
    title:
      "Pie Chart Generator | Free Online Pie & Donut Chart Maker | ToolsTrek",
    description:
      "Create beautiful pie and donut charts in seconds. Import a CSV or Excel file or type your data — live preview, curated palettes, custom labels and legends, exploded slices, and instant PNG/SVG export — 100% in your browser.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/pie-chart-generator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Pie Chart Generator | Free Online Pie & Donut Chart Maker | ToolsTrek",
    description:
      "Create beautiful pie and donut charts in seconds — import CSV or Excel data, or type it in. Live preview, curated palettes, labels, legends, and one-click PNG/SVG export.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/pie-chart-generator",
  },
};

const faqs = [
  {
    question: "How do I make a pie chart online for free?",
    answer:
      "Enter your categories and numeric values in the data table, or load a ready-made sample dataset, then customise colours, labels and legend. The chart updates instantly in your browser. Click Download PNG or Download SVG to save a high-resolution image — no sign-up or upload required.",
  },
  {
    question: "What is the difference between a pie chart and a donut chart?",
    answer:
      "A pie chart is a full circle divided into slices whose angles are proportional to each value's share of the total. A donut chart is the same chart with the centre removed, creating a hole that can display a total or KPI. Switch between them instantly with the Chart Type toggle and adjust the inner radius slider.",
  },
  {
    question: "Can I export the chart as a PNG or SVG image?",
    answer:
      "Yes. Download PNG for a pixel-perfect raster image at up to 4× resolution (perfect for slides and documents), or Download SVG for infinitely scalable vector artwork ideal for print, Figma and the web. You can also copy the raw SVG markup or the data as CSV and JSON.",
  },
  {
    question: "Does this pie chart generator keep my data private?",
    answer:
      "The entire tool runs 100% client-side using SVG and the HTML canvas. Your labels and numbers never leave your device and are never uploaded or stored, making it safe for confidential business, financial and survey data.",
  },
];

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
            name: "Pie Chart Generator",
            description:
              "Free online pie and donut chart generator. Import a CSV or Excel file or type your data, then use the live preview, curated colour palettes, customizable labels, legends and exploded slices, plus PNG and SVG export.",
            url: "https://toolstrek.vercel.app/tools/pie-chart-generator",
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
              "Pie and donut (doughnut) chart modes with adjustable inner radius",
              "Unlimited data rows with live totals and percentage calculations",
              "Ten curated colour palettes plus per-slice custom colour pickers",
              "Adjustable slice gap, rounded corners, rotation and direction",
              "Exploded (pulled-out) slices for highlighting key values",
              "Inside labels or outside labels with leader lines",
              "Customisable legend on the right, left, top or bottom",
              "Optional donut centre total with custom caption",
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
            mainEntity: faqs.map((faq) => ({
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
      <PieChartGenerator />
    </div>
  );
};

export default page;
