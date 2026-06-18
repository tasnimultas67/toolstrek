import React from "react";
import CompressPDFTool from "../../tools-compo/tools/CompressPDFTool";

// This object defines the SEO metadata for the page
export const metadata = {
  title: "Compress PDF Online | ToolsTrek",
  description:
    "Easily compress your PDF files without losing quality. ToolsTrek provides a fast, secure, and free way to reduce PDF size online.",
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/compress-pdf", // Update this path to match your actual route
  },
  openGraph: {
    title: "Compress PDF Online | ToolsTrek",
    description: "Shrink your PDF files in seconds.",
    url: "https://toolstrek.vercel.app/",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online | ToolsTrek",
    description: "Reduce PDF file size quickly and easily.",
  },
};

const page = () => {
  return (
    <div className="px-1 pt-20 pb-10">
      <CompressPDFTool />
    </div>
  );
};

export default page;
