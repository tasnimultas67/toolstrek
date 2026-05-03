import AvifConverter from "@/app/(main)/tools-compo/tools/AvifConverter";
import React from "react";

// Metadata for SEO
export const metadata = {
  title: "AVIF to JPG/PNG Converter | ToolsTrek",
  description:
    "Easily convert your AVIF images to high-quality JPG or PNG formats for free. Fast, secure, and browser-based conversion at ToolsTrek — Your Online Utility Hub.",
  keywords: [
    "AVIF converter",
    "image converter",
    "ToolsTrek",
    "AVIF to JPG",
    "online tools",
  ],
};

const page = () => {
  return (
    <div>
      <AvifConverter />
    </div>
  );
};

export default page;
