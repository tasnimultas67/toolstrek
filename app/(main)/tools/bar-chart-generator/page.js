import BarChartGenerator from "@/app/(main)/tools-compo/tools/bar-chart-generator/BarChartGenerator";
import React from "react";

export const metadata = {
  title: "Bar Chart Generator | Free Online Bar & Column Chart Maker",
  description:
    "Free online bar chart generator and column chart maker. Enter your data to instantly build grouped or stacked bar charts with live preview, multiple data series, curated colour palettes, adjustable axes, gridlines, labels, legends and one-click PNG or SVG export.",
  keywords: [
    "bar chart generator",
    "bar chart maker",
    "column chart generator",
    "column chart maker",
    "stacked bar chart generator",
    "grouped bar chart maker",
    "create bar chart online",
    "free bar chart maker",
    "horizontal bar chart",
    "vertical bar chart",
    "data visualization tool",
    "bar chart with values",
    "bar chart png export",
    "bar chart svg",
    "online chart builder",
    "ToolsTrek",
  ],
  openGraph: {
    title:
      "Bar Chart Generator | Free Online Bar & Column Chart Maker | ToolsTrek",
    description:
      "Create grouped or stacked bar and column charts in seconds. Live preview, multiple series, curated palettes, custom axes, labels and legends, and instant PNG/SVG export — 100% in your browser.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/bar-chart-generator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Bar Chart Generator | Free Online Bar & Column Chart Maker | ToolsTrek",
    description:
      "Create grouped or stacked bar and column charts in seconds with live preview, multiple series, custom axes, labels, legends, and one-click PNG/SVG export.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/bar-chart-generator",
  },
};

const faqs = [
  {
    question: "How do I make a bar chart online for free?",
    answer:
      "Enter your categories and numbers in the data table, or load a ready-made sample dataset, then add extra series to build grouped or stacked bars. Customise colours, axes, gridlines, labels and legend, and the chart updates instantly in your browser. Click Download PNG or Download SVG to save a high-resolution image — no sign-up or upload required.",
  },
  {
    question: "What is the difference between a bar chart and a column chart?",
    answer:
      "They are the same chart rotated. A column chart (vertical bars) grows upward from a horizontal category axis and suits ordered categories such as months or quarters. A bar chart (horizontal bars) extends sideways from a vertical axis and reads better for long category names. Switch instantly with the Orientation toggle.",
  },
  {
    question: "What is the difference between grouped and stacked bars?",
    answer:
      "Grouped bars place each series side by side within a category, making individual values easy to compare. Stacked bars place series on top of each other, emphasising the category total and each series' share of it. Toggle Bar mode and the axis scale and value labels are recalculated automatically.",
  },
  {
    question: "Can I export the chart as a PNG or SVG image?",
    answer:
      "Yes. Download PNG for a pixel-perfect raster image at up to 4× resolution (perfect for slides and documents), or Download SVG for infinitely scalable vector artwork ideal for print, Figma and the web. You can also copy the raw SVG markup, or download the data as CSV or JSON.",
  },
  {
    question: "Does this bar chart generator keep my data private?",
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
            name: "Bar Chart Generator",
            description:
              "Free online bar and column chart generator with live preview, multiple data series, grouped and stacked modes, curated colour palettes, custom axes and gridlines, labels, legends, and PNG and SVG export.",
            url: "https://toolstrek.vercel.app/tools/bar-chart-generator",
            applicationCategory: "DesignApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Live SVG preview that updates as you type",
              "Vertical column and horizontal bar orientations",
              "Grouped and stacked bar modes",
              "Multiple data series with per-series colours and names",
              "Unlimited categories with live totals and percentages",
              "Ten curated colour palettes plus per-series colour pickers",
              "Adjustable bar width, group gap, corner radius and opacity",
              "Optional gradient fills and drop shadows on bars",
              "Automatic nice-number value axis with configurable tick count",
              "Zero-baseline toggle, gridlines and axis titles",
              "Value labels with value, percent or both, plus prefixes and suffixes",
              "Customisable legend on the top, right, bottom or left",
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
      <BarChartGenerator />
    </div>
  );
};

export default page;
