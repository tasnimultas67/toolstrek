import BoxShadowGenerator from "@/app/(main)/tools-compo/tools/BoxShadowGenerator";
import React from "react";

export const metadata = {
  title: "CSS Box Shadow Generator | Visual CSS & Tailwind Shadow Maker | ToolsTrek",
  description:
    "Free online CSS box shadow generator. Design smooth, multi-layer box shadows with live visual preview, customizable blur, spread, offsets, opacity, inset shadows, curated presets, and instant CSS/Tailwind code export.",
  keywords: [
    "box shadow generator",
    "css box shadow generator",
    "tailwind box shadow generator",
    "box shadow css",
    "css shadow generator",
    "multi layer box shadow",
    "inset box shadow",
    "box shadow generator online",
    "tailwind arbitrary shadow",
    "drop shadow css generator",
    "web design tools",
    "ToolsTrek",
  ],
  openGraph: {
    title: "CSS Box Shadow Generator | Visual CSS & Tailwind Shadow Maker | ToolsTrek",
    description:
      "Free online CSS box shadow generator. Design smooth, multi-layer box shadows with live visual preview, customizable blur, spread, offsets, opacity, inset shadows, curated presets, and instant CSS/Tailwind code export.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/box-shadow-generator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSS Box Shadow Generator | Visual CSS & Tailwind Shadow Maker | ToolsTrek",
    description:
      "Free online CSS box shadow generator. Design smooth, multi-layer box shadows with live visual preview, customizable blur, spread, offsets, opacity, inset shadows, curated presets, and instant CSS/Tailwind code export.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/box-shadow-generator",
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
            name: "CSS Box Shadow Generator",
            description:
              "Visually design modern, smooth CSS and Tailwind box shadows. Adjust blur, spread, horizontal and vertical offsets, colors, and opacity with multi-layer depth, curated presets, and 1-click CSS code copy.",
            url: "https://toolstrek.vercel.app/tools/box-shadow-generator",
            applicationCategory: "DesignApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Live interactive preview with customizable box and canvas background colors",
              "Multi-layer shadow stacking for realistic photorealistic elevation",
              "Individual controls for horizontal offset, vertical offset, blur radius, and spread radius",
              "Seamless toggle between standard Drop Shadow and Inset (Inner) Shadow",
              "Curated library of designer presets (Subtle, Floating, Modal, Neo-Brutalist, Inset, Neon Glows)",
              "One-click copy for pure CSS, Tailwind arbitrary classes, and vendor-prefixed CSS",
              "Interactive hover state preview to test card elevation transitions",
              "100% client-side, browser-based, and mobile responsive",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <BoxShadowGenerator />
    </div>
  );
};

export default page;
