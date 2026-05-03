import MarkdownPreviewer from "@/app/(main)/tools-compo/tools/MarkdownPreviewer";
import React from "react";

// ToolsTrek SEO Metadata
export const metadata = {
  title: "Markdown Previewer | ToolsTrek",
  description:
    "Free online Markdown editor and real-time previewer. Write GitHub-flavored Markdown and see the live HTML result instantly on ToolsTrek.",
  keywords: [
    "Markdown Previewer",
    "ToolsTrek",
    "Online MD Editor",
    "Markdown to HTML",
    "Developer Tools",
    "Real-time Markdown",
  ],
  openGraph: {
    title: "Markdown Previewer | ToolsTrek",
    description:
      "Write and preview Markdown in real-time with our free developer tool.",
    url: "https://toolstrek.vercel.app/tools/markdown-previewer", // Update this path to match your actual route
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Previewer | ToolsTrek",
    description: "A simple and powerful Markdown editor for developers.",
  },
};

const page = () => {
  return (
    <main>
      <MarkdownPreviewer />
    </main>
  );
};

export default page;
