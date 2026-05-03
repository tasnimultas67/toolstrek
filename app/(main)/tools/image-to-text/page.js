import ImageToText from "@/app/(main)/tools-compo/tools/ImageToText";
import React from "react";

// ToolsTrek SEO Metadata for Image to Text (OCR)
export const metadata = {
  title: "Image to Text Converter | Free Online OCR | ToolsTrek",
  description:
    "Extract text from images accurately with our free online OCR tool. Convert JPG, PNG, and scanned documents to editable text instantly on ToolsTrek.",
  keywords: [
    "Image to Text",
    "OCR Online",
    "Extract text from image",
    "Photo to text converter",
    "ToolsTrek OCR",
    "Optical Character Recognition",
    "JPG to Text",
  ],
  openGraph: {
    title: "Image to Text Converter - ToolsTrek",
    description:
      "Instantly extract text from any image with high accuracy using our free OCR tool.",
    url: "https://toolstrek.vercel.app/tools/image-to-text", // Ensure this matches your route
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image to Text Converter | ToolsTrek",
    description:
      "Convert images to editable text in seconds with ToolsTrek's OCR tool.",
  },
};

const page = () => {
  return (
    <main>
      <ImageToText />
    </main>
  );
};

export default page;
