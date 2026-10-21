import React from "react";
import ImageEditor from "@/app/(main)/tools-compo/tools/ImageEditor";

export const metadata = {
  title: "Image Editor - Professional Photo Filters & Adjustments Online",
  description:
    "Edit images in your browser with brightness, contrast, saturation, hue, temperature, vignette, presets and more. Rotate, flip and export as PNG, JPEG or WebP. 100% client-side.",
  keywords: ["image editor", "photo filter", "apply filter to photo", "image effects", "photo editing", "image enhancer", "ToolsTrek"],
  openGraph: {
    title: "Image Editor - Edit Photos in Your Browser",
    description: "Professional photo filters and adjustments. 100% client-side.",
    url: "https://toolstrek.vercel.app/tools/image-editor",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Editor | ToolsTrek",
    description: "Edit photos with filters and adjustments in your browser.",
  },
  alternates: { canonical: "https://toolstrek.vercel.app/tools/image-editor" },
};

const page = () => (
  <div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "WebApplication", name: "Image Editor",
      description: "Free browser-based image editor with filters and adjustments.",
      url: "https://toolstrek.vercel.app/tools/image-editor", applicationCategory: "MultimediaApplication", operatingSystem: "All",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      creator: { "@type": "Organization", name: "ToolsTrek" },
    }) }} />
    <ImageEditor />
  </div>
);

export default page;
