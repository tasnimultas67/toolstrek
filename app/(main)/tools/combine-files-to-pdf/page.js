import React from "react";
import CombineFilesToPDFTool from "../../tools-compo/tools/CombineFilesToPDFTool";

// SEO Metadata for the Combine Files to PDF Tool
export const metadata = {
  title: "Combine Files into PDF | ToolsTrek",
  description:
    "Merge multiple images or documents into a single high-quality PDF. ToolsTrek makes it easy to combine files online without any installation.",
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/combine-files-to-pdf", // Adjust path based on your folder structure
  },
  openGraph: {
    title: "Combine Multiple Files into One PDF | ToolsTrek",
    description:
      "The simplest way to merge your documents and images into a single PDF file.",
    url: "https://toolstrek.vercel.app/",
    siteName: "ToolsTrek",
    images: [
      {
        url: "/og-image-combine.jpg", // Optional: link to a specific OG image if you have one
        width: 1200,
        height: 630,
        alt: "Combine Files to PDF Tool",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Combine Files to PDF | ToolsTrek",
    description: "Merge multiple files into one PDF document in seconds.",
  },
};

const page = () => {
  return (
    <main>
      <CombineFilesToPDFTool />
    </main>
  );
};

export default page;
