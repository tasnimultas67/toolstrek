import FunnelChartGenerator from "@/app/(main)/tools-compo/tools/funnel-chart-generator/FunnelChartGenerator";
import { FUNNEL_FAQS } from "@/app/(main)/tools-compo/tools/funnel-chart-generator/funnelChartData";
import React from "react";

export const metadata = {
  title: "Funnel Chart Generator | Free Online Funnel & Conversion Chart Maker",
  description:
    "Free online funnel chart generator and conversion chart maker. Enter your stages to instantly build customizable funnel charts with live preview, curated colour palettes, conversion and drop-off labels, adjustable shapes, labels, legends and one-click PNG or SVG export.",
  keywords: [
    "funnel chart generator",
    "funnel chart maker",
    "funnel diagram maker",
    "conversion funnel generator",
    "sales funnel chart",
    "marketing funnel chart",
    "create funnel chart online",
    "free funnel chart maker",
    "funnel chart with percentages",
    "drop off chart",
    "conversion rate chart",
    "data visualization tool",
    "funnel chart png export",
    "funnel chart svg",
    "online chart builder",
    "ToolsTrek",
  ],
  openGraph: {
    title:
      "Funnel Chart Generator | Free Online Funnel & Conversion Chart Maker | ToolsTrek",
    description:
      "Create conversion funnel charts in seconds. Live preview, curated palettes, conversion and drop-off labels, adjustable shapes, labels and legends, and instant PNG/SVG export — 100% in your browser.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/funnel-chart-generator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Funnel Chart Generator | Free Online Funnel & Conversion Chart Maker | ToolsTrek",
    description:
      "Create funnel and conversion charts in seconds with live preview, conversion labels, curated palettes, labels, legends, and one-click PNG/SVG export.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/funnel-chart-generator",
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
            name: "Funnel Chart Generator",
            description:
              "Free online funnel and conversion chart generator with live preview, curated colour palettes, adjustable funnel, bar and step shapes, conversion and drop-off labels, customisable labels, legends and PNG and SVG export.",
            url: "https://toolstrek.vercel.app/tools/funnel-chart-generator",
            applicationCategory: "BusinessApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Live SVG preview that updates as you type",
              "Funnel, bar and step chart shapes",
              "Vertical and horizontal orientations",
              "Linear or square-root value scaling",
              "Unlimited stages with adjustable minimum width",
              "Conversion and drop-off markers between every stage",
              "Percentage basis of first, previous or total stage",
              "Ten curated colour palettes plus per-stage colour pickers",
              "Adjustable stage gap, base taper, corner radius, opacity and gradients",
              "Inside labels or outside labels with leader lines",
              "Value, percentage, combined or stage-name labels",
              "Custom value prefixes, suffixes, decimals and compact notation",
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
            mainEntity: FUNNEL_FAQS.map((faq) => ({
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
      <FunnelChartGenerator />
    </div>
  );
};

export default page;
