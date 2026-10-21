import React from "react";
import ImageWatermark from "@/app/(main)/tools-compo/tools/ImageWatermark";

export const metadata = {
  title: "Image Watermark - Add Text or Logo Watermarks Online",
  description:
    "Add custom text or logo watermarks to images instantly in your browser. Control opacity, font, color, position, rotation, tiling and blend modes. 100% client-side, no uploads.",
  keywords: ["image watermark", "add watermark to photo", "photo watermarker", "text watermark", "logo watermark", "tile watermark", "ToolsTrek"],
  openGraph: {
    title: "Image Watermark - Watermark Images in Your Browser",
    description: "Add text or logo watermarks with rotation, tiling, blend modes and shadows. 100% client-side.",
    url: "https://toolstrek.vercel.app/tools/image-watermark",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Watermark | ToolsTrek",
    description: "Add text or logo watermarks to images instantly in your browser.",
  },
  alternates: { canonical: "https://toolstrek.vercel.app/tools/image-watermark" },
};

const page = () => (
  <div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "WebApplication", name: "Image Watermark",
      description: "Free browser-based image watermark tool with text and logo watermarks, tiling, rotation and blend modes.",
      url: "https://toolstrek.vercel.app/tools/image-watermark", applicationCategory: "MultimediaApplication", operatingSystem: "All",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      creator: { "@type": "Organization", name: "ToolsTrek" },
    }) }} />
    <ImageWatermark />
  </div>
);

export default page;
