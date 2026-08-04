import CodeFormatter from "@/app/(main)/tools-compo/tools/CodeFormatter";
import React from "react";

export const metadata = {
  title: "Advanced Code Formatter & Beautifier | ToolsTrek",
  description:
    "Free online advanced code formatter and beautifier. Prettify and clean up JavaScript, TypeScript, HTML, CSS, JSON, XML, and SQL. Customize indentation styles, preserve line breaks, and download or upload files directly.",
  keywords: [
    "code formatter",
    "code beautifier",
    "javascript formatter",
    "html beautifier",
    "css formatter",
    "json formatter",
    "sql beautifier",
    "xml formatter",
    "prettify code",
    "minify javascript",
    "minify css",
    "developer tools",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Advanced Code Formatter & Beautifier | ToolsTrek",
    description:
      "Free online advanced code formatter and beautifier. Prettify and clean up JavaScript, TypeScript, HTML, CSS, JSON, XML, and SQL.",
    url: "https://toolstrek.vercel.app/tools/code-formatter",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced Code Formatter & Beautifier | ToolsTrek",
    description:
      "Free online advanced code formatter and beautifier. Prettify and clean up JavaScript, TypeScript, HTML, CSS, JSON, XML, and SQL.",
  },
};

const page = () => {
  return (
    <div>
      <CodeFormatter />
    </div>
  );
};

export default page;
