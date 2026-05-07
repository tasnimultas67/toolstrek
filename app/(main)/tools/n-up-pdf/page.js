import React from "react";
import NUpPDFTool from "../../tools-compo/tools/NUpPDFTool";

// SEO Metadata for the N-Up PDF Tool
export const metadata = {
  title: "N-Up PDF - Multiple Pages Per Sheet Online | ToolsTrek",
  description:
    "Rearrange your PDF layout to print multiple pages on a single sheet. Customize your N-Up grid for efficient printing and document viewing with ToolsTrek.",
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/n-up-pdf", // Ensure this matches your actual route
  },
  openGraph: {
    title: "N-Up PDF Layout Tool | ToolsTrek",
    description:
      "Convert your PDF to a multi-page per sheet layout (2-up, 4-up, etc.) instantly.",
    url: "https://toolstrek.vercel.app/",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "N-Up PDF Online | ToolsTrek",
    description:
      "Easily arrange multiple PDF pages onto one sheet for easier printing.",
  },
};

const page = () => {
  return (
    <main>
      <NUpPDFTool />
    </main>
  );
};

export default page;
