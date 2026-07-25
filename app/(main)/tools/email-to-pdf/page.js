import React from "react";
import EmailToPDF from "../../tools-compo/tools/EmailToPDF";

export const metadata = {
  title: "Convert Email to PDF Online | ToolsTrek",
  description:
    "Convert EML email files to high-quality PDF documents for free. Customize paper size (A4, Letter, A3), orientation, margins, headers, colors, fonts, and extract attachments in your browser safely.",
  keywords: [
    "email to pdf",
    "eml to pdf converter",
    "convert eml to pdf",
    "eml parser online",
    "print email to pdf",
    "email attachments extractor",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Convert Email to PDF Online - ToolsTrek",
    description:
      "Transform your email EML files into professional PDF documents in seconds, locally in your browser.",
    url: "https://toolstrek.vercel.app/tools/email-to-pdf",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Email to PDF Converter | ToolsTrek",
    description: "Fast, private, and free web-based Email to PDF conversion.",
  },
};

const page = () => {
  return (
    <div>
      <EmailToPDF />
    </div>
  );
};

export default page;
