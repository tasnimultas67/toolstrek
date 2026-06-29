import GradientGenerator from "@/app/(main)/tools-compo/tools/GradientGenerator";
import React from "react";

export const metadata = {
  title: "Gradient Generator | Create CSS & Tailwind Gradients | ToolsTrek",
  description:
    "Free online gradient generator. Create linear, radial, and conic gradients with color stops, custom angles, repeating styles, overlay blend modes, and high-res image exports (PNG/SVG).",
  keywords: [
    "gradient generator",
    "css gradient generator",
    "tailwind gradient generator",
    "linear gradient css",
    "radial gradient css",
    "conic gradient css",
    "export gradient to png",
    "export gradient to svg",
    "repeating gradient css",
    "blend mode gradient",
    "web design tools",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Gradient Generator | Create CSS & Tailwind Gradients | ToolsTrek",
    description:
      "Free online gradient generator. Create linear, radial, and conic gradients with color stops, custom angles, repeating styles, overlay blend modes, and high-res image exports (PNG/SVG).",
    type: "website",
    url: "https://toolstrek.com/tools/gradient-generator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gradient Generator | Create CSS & Tailwind Gradients | ToolsTrek",
    description:
      "Free online gradient generator. Create linear, radial, and conic gradients with color stops, custom angles, repeating styles, overlay blend modes, and high-res image exports (PNG/SVG).",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/gradient-generator",
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
            name: "Gradient Generator",
            description:
              "Create CSS and Tailwind gradients. Customize colors, add multiple stops, choose linear, radial, or conic styles, and access advanced options like PNG/SVG image export.",
            url: "https://toolstrek.com/tools/gradient-generator",
            applicationCategory: "DesignApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Interactive gradient stop editor (add, select, edit, remove, position, opacity)",
              "Three gradient styles: Linear, Radial, Conic",
              "Curated library of beautiful gradient presets",
              "Smart randomized gradient generator",
              "One-click copy for CSS code and Tailwind custom classes",
              "Advanced repeating gradient options",
              "CSS vendor prefix compilation (-webkit- and -moz-)",
              "Export high-quality gradient designs to PNG (1920x1080) and SVG vectors",
              "Simulate blend mode overlays on gradients",
              "100% browser-based & client-side",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <GradientGenerator />
    </div>
  );
};

export default page;
