import React from "react";
import ImageToPDF from "../../tools-compo/tools/ImageToPDF";

export const metadata = {
  title: "Convert Image to PDF | ToolsTrek",
  description:
    "Easily convert JPG, PNG, and other images to high-quality PDF documents for free on ToolsTrek. Fast, secure, and browser-based conversion.",
  keywords: [
    "image to pdf",
    "convert jpg to pdf",
    "png to pdf converter",
    "online pdf tools",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Convert Image to PDF Online - ToolsTrek",
    description:
      "Transform your photos into professional PDF files in seconds.",
    url: "https://toolstrek.vercel.app/tools/image-to-pdf",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image to PDF Converter | ToolsTrek",
    description: "Fast and free web-based image to PDF conversion.",
  },
};

const page = () => {
  return (
    <div>
      <ImageToPDF />
    </div>
  );
};

export default page;
