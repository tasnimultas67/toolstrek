import React from "react";
import ImageResizer from "@/app/(main)/tools-compo/tools/ImageResizer";

export const metadata = {
  title: "Image Resizer - Resize Images Online | Free Photo Tool",
  description:
    "Resize images online for free. Adjust image dimensions by pixels or percentage, lock aspect ratio, convert formats (PNG, JPEG, WebP), compress, crop, and apply social media presets. High-quality client-side image processing.",
  keywords: [
    "image resizer",
    "resize image online",
    "resize photo",
    "crop image",
    "social media image sizes",
    "aspect ratio lock",
    "image compressor",
    "convert image",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Image Resizer - Resize Images Online for Free",
    description:
      "Resize and crop your images instantly with professional results. Lock aspect ratio, select social media presets, rotate, flip, and compress.",
    url: "https://toolstrek.vercel.app/tools/image-resizer",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Resizer - Online Photo Tool | ToolsTrek",
    description: "Resize, compress, convert and crop images instantly in your browser.",
  },
};

const page = () => {
  return <ImageResizer />;
};

export default page;
