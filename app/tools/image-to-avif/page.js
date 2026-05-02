import ImageToAvifConverter from "@/app/tools-compo/tools/ImageToAvifConverter";
import React from "react";

// 1. Define the Metadata object
export const metadata = {
  title: "Image to AVIF Converter | ToolsTrek",
  description:
    "Convert your JPG, PNG, and WebP images to high-performance AVIF format instantly with ToolsTrek. Fast, secure, and browser-based conversion.",
  keywords: [
    "image to avif",
    "avif converter",
    "convert to avif",
    "online image tools",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Image to AVIF Converter | ToolsTrek",
    description:
      "High-quality image conversion to AVIF for better web performance.",
    url: "https://toolstrek.vercel.app/",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image to AVIF Converter | ToolsTrek",
    description: "Convert images to AVIF format for free on ToolsTrek.",
  },
};

const page = () => {
  return (
    <div>
      <ImageToAvifConverter />
    </div>
  );
};

export default page;
