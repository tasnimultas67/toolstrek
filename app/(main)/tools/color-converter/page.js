import ColorConverter from "@/app/(main)/tools-compo/tools/ColorConverter";
import React from "react";

export const metadata = {
  title: "Color Converter | Convert HEX, RGB, HSL, HSV, CMYK | ToolsTrek",
  description:
    "Free online color converter tool. Convert between HEX, RGB, HSL, HSV, CMYK color spaces instantly. Generate color harmonies, verify WCAG contrast compliance, simulate color blindness, and inspect tints & shades.",
  keywords: [
    "color converter",
    "hex to rgb",
    "rgb to hsl",
    "color code converter",
    "cmyk converter",
    "hsv converter",
    "color palette generator",
    "wcag contrast checker",
    "color blindness simulator",
    "color harmonies",
    "tints and shades",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Color Converter | Convert HEX, RGB, HSL, HSV, CMYK | ToolsTrek",
    description:
      "Free online color converter tool. Convert between HEX, RGB, HSL, HSV, CMYK color spaces instantly. Generate color harmonies, verify WCAG contrast compliance, simulate color blindness, and inspect tints & shades.",
    type: "website",
    url: "https://toolstrek.com/tools/color-converter",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Converter | Convert HEX, RGB, HSL, HSV, CMYK | ToolsTrek",
    description:
      "Free online color converter tool. Convert between HEX, RGB, HSL, HSV, CMYK color spaces instantly. Generate color harmonies, verify WCAG contrast compliance, simulate color blindness, and inspect tints & shades.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/color-converter",
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
            name: "Color Converter",
            description:
              "Convert between HEX, RGB, HSL, HSV, CMYK color spaces instantly. Generate color harmonies, check WCAG contrast ratio, simulate color blindness, and view tints & shades.",
            url: "https://toolstrek.com/tools/color-converter",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Convert between HEX, RGB, HSL, HSV, CMYK color spaces",
              "Interactive color picker and range adjustments",
              "Generate color harmonies (Complementary, Triadic, Analogous, etc.)",
              "WCAG contrast checker for text accessibility",
              "Tints and Shades generator in 9 increments",
              "Color blindness simulator for Protanopia, Deuteranopia, Tritanopia, Achromatopsia",
              "One-click copy for all formats",
              "100% browser-based & client-side",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <ColorConverter />
    </div>
  );
};

export default page;
