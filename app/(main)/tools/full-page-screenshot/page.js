import FullPageScreenshot from "@/app/(main)/tools-compo/tools/FullPageScreenshot";
import React from "react";

export const metadata = {
  title: "Full Page Screenshot Tool | Capture Webpages Online | ToolsTrek",
  description:
    "Capture high-resolution, full-page screenshots of any website for free. Enforce mobile 12px or laptop 14px minimum font sizes, emulate dark mode, block cookie banners, and download as PNG, JPG, PDF, or WebP. 100% browser-based screenshot exporter.",
  keywords: [
    "full page screenshot",
    "website screenshot generator",
    "webpage capture tool",
    "export website to pdf",
    "convert website to image",
    "screenshot API",
    "responsive screen capture",
    "capture entire website",
    "save webpage as image",
    "cookie banner blocker screenshot",
    "minimum font size screenshot",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Full Page Screenshot Tool | Capture Webpages Online | ToolsTrek",
    description:
      "Capture high-resolution, full-page screenshots of any website for free. Enforce minimum font sizes, emulate dark mode, block cookie banners, and download as PNG, JPG, PDF, or WebP.",
    type: "website",
    url: "https://toolstrek.com/tools/full-page-screenshot",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Full Page Screenshot Tool | Capture Webpages Online | ToolsTrek",
    description:
      "Capture high-resolution, full-page screenshots of any website for free. Enforce minimum font sizes, emulate dark mode, block cookie banners, and download as PNG, JPG, PDF, or WebP.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/full-page-screenshot",
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
            name: "Full Page Screenshot Tool",
            description:
              "Capture high-resolution, full-page screenshots of any website for free. Enforce mobile 12px or laptop 14px minimum font sizes, emulate dark mode, block cookie banners, and download as PNG, JPG, PDF, or WebP.",
            url: "https://toolstrek.com/tools/full-page-screenshot",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Capture entire webpage height (full-page) or above-the-fold viewports",
              "Custom viewport dimensions and device emulation presets (Desktop, Laptop, Tablet, Mobile)",
              "Minimum font size enforcement (12px on mobile viewports, 14px on desktop/laptop viewports)",
              "Download in multiple formats: PNG, JPG, WebP, and PDF",
              "Advanced options: Block ads and cookie consent banners, adjust capture load delays, emulate dark mode",
              "Interactive preview with zoom, color pixel inspector, and client-side image cropper",
              "Session history gallery to access and download previous captures",
              "Detailed metadata dashboard (dimensions, file size, response speed, SEO readability checks)",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <FullPageScreenshot />
    </div>
  );
};

export default page;
