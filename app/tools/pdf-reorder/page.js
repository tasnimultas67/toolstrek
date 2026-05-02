import PDFReorderPages from "@/app/tools-compo/tools/PDFReorderPages";
import React from "react";

// ToolsTrek SEO Metadata for PDF Reorder
export const metadata = {
  title: "Rearrange PDF Pages Online | Organize PDF | ToolsTrek",
  description:
    "Easily reorder, move, or delete pages in your PDF document. Use our intuitive drag-and-drop interface to organize your PDF exactly how you want it on ToolsTrek.",
  keywords: [
    "Reorder PDF pages",
    "Rearrange PDF",
    "Organize PDF online",
    "Move PDF pages",
    "ToolsTrek PDF",
    "PDF page organizer",
    "Sort PDF pages",
  ],
  openGraph: {
    title: "Rearrange & Organize PDF Pages - ToolsTrek",
    description:
      "Drag and drop to reorder PDF pages instantly in your browser. No file uploads to a server required.",
    url: "https://toolstrek.vercel.app/tools/pdf-reorder", // Adjust path to your actual route
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reorder PDF Pages Instantly | ToolsTrek",
    description:
      "The simplest way to rearrange your PDF documents online for free.",
  },
};

const page = () => {
  return (
    <main>
      <PDFReorderPages />
    </main>
  );
};

export default page;
