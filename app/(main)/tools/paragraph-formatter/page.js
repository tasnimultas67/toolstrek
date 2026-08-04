import ParagraphFormatter from "@/app/(main)/tools-compo/tools/ParagraphFormatter";
import React from "react";

export const metadata = {
  title: "Professional Paragraph Formatter & Text Aligner | ToolsTrek",
  description:
    "Free online paragraph formatter and editor. Align text, adjust line spacing, paragraph margins, indent first lines, convert case types, clean extra spaces, and export to plain text or styled HTML.",
  keywords: [
    "paragraph formatter",
    "paragraph aligner",
    "text alignment",
    "line spacing",
    "paragraph spacing",
    "case converter",
    "clean paragraphs",
    "text editor",
    "justify text",
    "remove extra spaces",
    "writing assistant",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Professional Paragraph Formatter & Text Aligner | ToolsTrek",
    description:
      "Free online paragraph formatter and editor. Align text, adjust line spacing, paragraph margins, indent first lines, convert case types, clean extra spaces, and export to plain text or styled HTML.",
    url: "https://toolstrek.vercel.app/tools/paragraph-formatter",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Paragraph Formatter & Text Aligner | ToolsTrek",
    description:
      "Free online paragraph formatter and editor. Align text, adjust line spacing, paragraph margins, indent first lines, convert case types, clean extra spaces, and export to plain text or styled HTML.",
  },
};

const page = () => {
  return (
    <div>
      <ParagraphFormatter />
    </div>
  );
};

export default page;
