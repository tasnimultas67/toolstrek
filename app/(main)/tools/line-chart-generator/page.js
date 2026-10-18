import LineChartGenerator from "@/app/(main)/tools-compo/tools/line-chart-generator/LineChartGenerator";
import { LINE_FAQS } from "@/app/(main)/tools-compo/tools/line-chart-generator/lineChartData";
import React from "react";

export const metadata = {
  title: "Line Chart Generator | Free Online Line & Area Chart Maker",
  description:
    "Free online line chart generator and area chart maker. Enter your data to instantly build straight, smooth or step line charts and stacked area charts with multiple series, curated colour palettes, markers, adjustable axes, gridlines, labels, legends and one-click PNG or SVG export.",
  keywords: [
    "line chart generator",
    "line chart maker",
    "line graph maker",
    "area chart generator",
    "area chart maker",
    "stacked area chart generator",
    "smooth line chart maker",
    "multi series line chart",
    "create line chart online",
    "free line chart maker",
    "time series chart maker",
    "trend chart generator",
    "data visualization tool",
    "line chart png export",
    "line chart svg",
    "online chart builder",
    "ToolsTrek",
  ],
  openGraph: {
    title:
      "Line Chart Generator | Free Online Line & Area Chart Maker | ToolsTrek",
    description:
      "Create line and area charts in seconds. Live preview, multiple series, straight, smooth and step lines, markers, stacked areas, curated palettes, custom axes, labels and legends, and instant PNG/SVG export — 100% in your browser.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/line-chart-generator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Line Chart Generator | Free Online Line & Area Chart Maker | ToolsTrek",
    description:
      "Create line and area charts in seconds with live preview, multiple series, smooth or step lines, markers, stacked areas, custom axes, labels, legends, and one-click PNG/SVG export.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/line-chart-generator",
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
            name: "Line Chart Generator",
            description:
              "Free online line and area chart generator with live preview, multiple data series, straight, smooth and step lines, markers, stacked area charts, curated colour palettes, custom axes and gridlines, labels, legends, and PNG and SVG export.",
            url: "https://toolstrek.vercel.app/tools/line-chart-generator",
            applicationCategory: "DesignApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Live SVG preview that updates as you type",
              "Straight, smooth curved and step line styles",
              "Monotone-safe smoothing so curves never overshoot the data",
              "Multiple data series with per-series colours, dash patterns and visibility",
              "Overlaid or stacked area charts",
              "Optional gradient area fills with adjustable opacity",
              "Point markers in five shapes with adjustable size and fill",
              "Solid, dashed, dotted, dash-dot and long-dash line patterns",
              "Automatic nice-number value axis with configurable tick count",
              "Auto or manual value scale, zero-baseline toggle and gridlines",
              "Editable category and value axis titles plus label rotation",
              "Value labels with value, percent or both, above, below or on the line",
              "Customisable legend on the top, right, bottom or left",
              "Interactive hover guide with a per-series tooltip",
              "Ten curated colour palettes plus per-series colour pickers",
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
            mainEntity: LINE_FAQS.map((faq) => ({
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
      <LineChartGenerator />
    </div>
  );
};

export default page;
