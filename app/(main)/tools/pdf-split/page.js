import PDFSplitPage from "@/app/(main)/tools-compo/tools/PDFSplitPage";
import React from "react";

// ToolsTrek SEO Metadata for PDF Splitter
export const metadata = {
  title: "Split PDF Online | Fast & Secure | ToolsTrek",
  description:
    "Split PDF files into separate pages or extract specific ranges instantly. Secure, browser-based processing—your files never leave your device.",
  keywords: [
    "Split PDF",
    "Extract PDF pages",
    "PDF Splitter",
    "ToolsTrek PDF",
    "Online PDF Tool",
    "Free PDF Editor",
  ],
  openGraph: {
    title: "Split PDF Online - ToolsTrek",
    description:
      "The easiest way to split PDF files into individual pages for free.",
    url: "https://toolstrek.vercel.app/tools/pdf-splitter", // Update to your actual route
    siteName: "ToolsTrek",
    images: [
      {
        url: "/og-pdf-splitter.png", // If you have a specific social image
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Files Instantly | ToolsTrek",
    description:
      "Extract pages from your PDF documents for free using ToolsTrek.",
  },
};

const page = () => {
  return <PDFSplitPage />;
};

export default page;
