import ColorPaletteExtractor from "@/app/(main)/tools-compo/tools/ColorPaletteExtractor";
import React from "react";

export const metadata = {
  title: "Color Palette Extractor | Extract Dominant Colors from Any Image | ToolsTrek",
  description:
    "Upload any image and instantly extract its dominant color palette. Pick exact pixel colors by clicking on the image, copy HEX, RGB & HSL values, and export palettes as JSON, CSS variables, or Tailwind config. Free, browser-only, no uploads.",
  keywords: [
    "color palette extractor",
    "image color picker",
    "dominant color extraction",
    "hex color picker",
    "rgb color extractor",
    "color thief online",
    "palette from image",
    "WCAG contrast checker",
    "CSS color variables",
    "Tailwind color palette",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Color Palette Extractor | Extract Colors from Any Image | ToolsTrek",
    description:
      "Extract beautiful color palettes from any image. Click to pick pixel-perfect colors, copy HEX/RGB/HSL values, and export as CSS or Tailwind config. 100% free and browser-based.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/color-palette-extractor",
    siteName: "ToolsTrek",
    images: [
      {
        url: "https://toolstrek.vercel.app/og-color-palette.png",
        width: 1200,
        height: 630,
        alt: "ToolsTrek Color Palette Extractor - Extract colors from any image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Palette Extractor | Extract Colors from Any Image",
    description:
      "Extract dominant colors from any image instantly. Pick pixels, copy values, and export palettes in JSON, CSS, or Tailwind format. Free & browser-based.",
    images: ["https://toolstrek.vercel.app/og-color-palette.png"],
    site: "@toolstrek",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/color-palette-extractor",
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
  category: "technology",
  authors: [{ name: "Tasnimul Haque & Oracle Byte" }],
  creator: "ToolsTrek",
  publisher: "ToolsTrek",
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
            name: "Color Palette Extractor",
            description:
              "Extract dominant color palettes from any image. Click to pick pixel colors, copy HEX, RGB & HSL values, and export as JSON, CSS variables, or Tailwind config.",
            url: "https://toolstrek.vercel.app/tools/color-palette-extractor",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Extract 5 or 10 dominant colors from any image",
              "Click-to-pick pixel color on image canvas",
              "HEX, RGB, and HSL color values",
              "One-click copy for all color formats",
              "WCAG contrast ratio and accessibility check",
              "Export as JSON, TXT, CSS variables, or Tailwind config",
              "100% client-side — no server, no uploads",
              "Dark mode support",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <ColorPaletteExtractor />
    </div>
  );
};

export default page;
