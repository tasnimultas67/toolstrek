import ResponsiveViewport from "@/app/(main)/tools-compo/tools/ResponsiveViewport";
import React from "react";

export const metadata = {
  title: "Responsive Viewport Tester | Preview Any Website on Any Device | ToolsTrek",
  description:
    "Test your website across 80+ real device viewports including iPhones, Android phones, tablets, laptops, desktops, TVs, and wearables. Check breakpoints, measure dimensions in px/em/rem/cm, inspect DPR, generate CSS media queries, and add custom device sizes. 100% free, runs in your browser.",
  keywords: [
    "responsive viewport tester",
    "responsive design checker",
    "mobile preview tool",
    "device viewport simulator",
    "screen size tester",
    "breakpoint checker",
    "responsive web design tool",
    "iPhone viewport simulator",
    "Android screen preview",
    "tablet viewport tester",
    "CSS media query generator",
    "device pixel ratio checker",
    "DPR tester",
    "viewport dimensions",
    "web developer tools",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Responsive Viewport Tester | Preview Any Website on Any Device | ToolsTrek",
    description:
      "Preview any website across 80+ real device viewports. Test responsive layouts, check breakpoints, measure dimensions, and inspect pixel density — all in one place.",
    type: "website",
    url: "https://toolstrek.com/tools/responsive-viewport",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Responsive Viewport Tester | Preview Any Website on Any Device | ToolsTrek",
    description:
      "Preview any website across 80+ real device viewports. Test responsive layouts, check breakpoints, measure dimensions, and inspect pixel density.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/responsive-viewport",
  },
};

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Responsive Viewport Tester",
            description:
              "Preview any website across 80+ real device viewports. Test responsive layouts, check breakpoints, measure dimensions, and inspect pixel density.",
            url: "https://toolstrek.com/tools/responsive-viewport",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "80+ real device viewport presets (phones, tablets, laptops, desktops, TVs, wearables)",
              "Custom device creation with user-defined dimensions",
              "Portrait and landscape orientation toggle",
              "Smooth zoom control from 10% to 100%",
              "Grid overlay, pixel rulers, and element outline overlays",
              "Multi-unit dimension display: px, pt, em, rem, cm, inch",
              "Device Pixel Ratio (DPR) configuration",
              "User agent reference switcher",
              "CSS media query generator with min-font-size rules",
              "Breakpoint detection (XS, SM, MD, LG, XL, 2XL, 3XL)",
              "Minimum 12px font for mobile, 14px for desktop enforcement",
              "100% client-side, no data leaves your browser",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <ResponsiveViewport />
    </div>
  );
};

export default page;
