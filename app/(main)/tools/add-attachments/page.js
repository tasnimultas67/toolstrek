import React from "react";
import AddAttachmentsTool from "../../tools-compo/tools/AddAttachmentsTool";

// SEO Metadata for the Add Attachments Tool
export const metadata = {
  title: "Add Attachments to PDF Online | ToolsTrek",
  description:
    "Attach files, documents, or images directly to your PDF. ToolsTrek offers a secure and easy way to manage PDF attachments online for free.",
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/add-attachments", // Ensure this matches your actual folder path
  },
  openGraph: {
    title: "Add Attachments to PDF Online | ToolsTrek",
    description: "Easily attach extra files and documents to your PDF online.",
    url: "https://toolstrek.vercel.app/",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Attachments to PDF | ToolsTrek",
    description:
      "Fast and secure tool to add file attachments to any PDF document.",
  },
};

const page = () => {
  return (
    <main>
      <AddAttachmentsTool />
    </main>
  );
};

export default page;
