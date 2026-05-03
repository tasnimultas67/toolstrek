import PdfToImage from "@/app/(main)/tools-compo/tools/PdfToImage";
import React from "react";

// ToolsTrek SEO Metadata for PDF to Image
export const metadata = {
  title: "Convert PDF to Image | PDF to JPG & PNG | ToolsTrek",
  description:
    "Transform your PDF pages into high-quality images instantly. Support for JPG and PNG formats with no file size limits—fast, secure, and free on ToolsTrek.",
  keywords: [
    "PDF to Image",
    "Convert PDF to JPG",
    "PDF to PNG converter",
    "PDF to Picture",
    "ToolsTrek PDF",
    "Extract images from PDF",
    "High-quality PDF conversion",
  ],
  openGraph: {
    title: "Convert PDF to Image - ToolsTrek",
    description:
      "Easily turn any PDF document into a series of images (JPG/PNG) for free.",
    url: "https://toolstrek.vercel.app/tools/pdf-to-image", // Verify this matches your route
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Image Converter | ToolsTrek",
    description: "High-quality PDF to image conversion in your browser.",
  },
};

const page = () => {
  return (
    <main>
      <PdfToImage />
    </main>
  );
};

export default page;
