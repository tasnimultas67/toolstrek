import React from "react";
import PDFMerger from "../../tools-compo/PDFMerger";

export const metadata = {
  title: "Merge PDF Files Online - Free PDF Merger Tool",
  description:
    "Combine multiple PDF files into one document easily. Free, fast, and secure PDF merger tool. No uploads required - all processing happens in your browser.",
  keywords:
    "merge PDF, combine PDF, PDF merger, join PDF files, PDF combiner, free PDF tool",
  openGraph: {
    title: "Merge PDF Files Online - Free PDF Merger Tool",
    description:
      "Combine multiple PDF files into one document easily. Free, fast, and secure PDF merger tool.",
    url: "https://toolstrek.vercel.app/tools/pdf-merger",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Files Online - Free PDF Merger Tool",
    description:
      "Combine multiple PDF files into one document easily. Free, fast, and secure PDF merger tool.",
  },
};

const page = () => {
  return (
    <div>
      <PDFMerger />
    </div>
  );
};

export default page;
