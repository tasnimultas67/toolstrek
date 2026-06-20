import SvgConverter from "@/app/(main)/tools-compo/tools/SvgConverter";
import React from "react";

// Metadata for SEO
export const metadata = {
  title: "SVG to PNG/JPG/WebP Converter | ToolsTrek",
  description:
    "Convert SVG vector images to high-quality PNG, JPEG, or WebP formats completely client-side. Free, fast, secure, and customizable dimensions at ToolsTrek.",
  keywords: [
    "SVG converter",
    "SVG to PNG",
    "SVG to JPG",
    "SVG to WebP",
    "vector converter",
    "rasterize SVG",
    "online tools",
    "ToolsTrek",
  ],
};

const page = () => {
  return (
    <div>
      <SvgConverter />
    </div>
  );
};

export default page;
