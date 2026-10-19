import RadarChartGenerator from "@/app/(main)/tools-compo/tools/radar-chart-generator/RadarChartGenerator";
import { RADAR_FAQS } from "@/app/(main)/tools-compo/tools/radar-chart-generator/radarChartData";
import React from "react";

export const metadata = {
  title: "Radar Chart Generator | Free Online Spider & Polar Chart Maker",
  description:
    "Free online radar chart generator and spider chart maker. Import a CSV or Excel file, or type your data, to instantly build clean radial charts with multiple series, curated colour palettes, adjustable grid shape, scale, rotation, vertex points, labels and legends, plus one-click PNG or SVG export — 100% in your browser.",
  keywords: [
    "radar chart generator",
    "radar chart maker",
    "spider chart generator",
    "spider chart maker",
    "web chart generator",
    "polar chart maker",
    "star plot generator",
    "kiviat diagram",
    "create radar chart online",
    "free radar chart maker",
    "radar chart with multiple series",
    "csv to radar chart",
    "excel to radar chart",
    "upload csv chart maker",
    "data visualization tool",
    "radar chart png export",
    "radar chart svg",
    "online chart builder",
    "ToolsTrek",
  ],
  openGraph: {
    title:
      "Radar Chart Generator | Free Online Spider & Polar Chart Maker | ToolsTrek",
    description:
      "Create radar and spider charts in seconds. Import a CSV or Excel file or type your data — live preview, multiple series, curated palettes, polygon or circle grids, custom scale and rotation, labels and legends, and instant PNG/SVG export — 100% in your browser.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/radar-chart-generator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Radar Chart Generator | Free Online Spider & Polar Chart Maker | ToolsTrek",
    description:
      "Create radar and spider charts in seconds — import CSV or Excel data, or type it in. Live preview, multiple series, polygon or circle grids, custom scale, labels, legends, and one-click PNG/SVG export.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/radar-chart-generator",
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
            name: "Radar Chart Generator",
            description:
              "Free online radar, spider and polar chart generator. Import a CSV or Excel file or type your data, then use the live preview, multiple data series, polygon and circular grids, adjustable scale and rotation, vertex points, labels, legends, and PNG and SVG export.",
            url: "https://toolstrek.vercel.app/tools/radar-chart-generator",
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
              "Automatic delimiter and header detection with multi-series column mapping",
              "Radar (spider) charts with unlimited axes",
              "Multiple data series drawn as overlapping polygons",
              "Show or hide any series without deleting it",
              "Polygon web or rounded circular grid shapes",
              "Adjustable number of concentric grid levels",
              "Auto fit, fixed 0–100 and custom value scales",
              "Rotatable start angle and clockwise or counter-clockwise direction",
              "Straight or smooth curved series outlines",
              "Optional translucent or gradient area fills",
              "Optional vertex point markers with adjustable size",
              "Ten curated colour palettes plus per-series colour pickers",
              "Optional vertex value labels with value, percent or both",
              "Decimal precision, thousands separators and compact notation (K, M, B)",
              "Custom value prefixes and suffixes",
              "Toggleable grid rings, outer ring, axis spokes and radial tick values",
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
            mainEntity: RADAR_FAQS.map((faq) => ({
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
      <RadarChartGenerator />
    </div>
  );
};

export default page;
