import RemoveDuplicateLines from "@/app/(main)/tools-compo/tools/RemoveDuplicateLines";
import React from "react";

export const metadata = {
  title: "Remove Duplicate Lines | ToolsTrek",
  description:
    "Free online tool to remove duplicate lines from text instantly. Supports case-insensitive matching, whitespace trimming, blank line removal, regex filters, sorting (A-Z, length, shuffle), and line-number prepending. Copy or download results in one click.",
  keywords: [
    "remove duplicate lines",
    "deduplicate text",
    "remove duplicates",
    "unique lines",
    "text deduplicator",
    "sort lines",
    "remove blank lines",
    "text cleaner",
    "text",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Remove Duplicate Lines | ToolsTrek",
    description:
      "Free online tool to remove duplicate lines from text instantly. Supports case-insensitive matching, whitespace trimming, blank line removal, regex filters, sorting (A-Z, length, shuffle), and line-number prepending.",
    url: "https://toolstrek.vercel.app/tools/remove-duplicate-lines",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Duplicate Lines | ToolsTrek",
    description:
      "Free online tool to remove duplicate lines from text instantly. Supports case-insensitive matching, whitespace trimming, blank line removal, regex filters, sorting (A-Z, length, shuffle), and line-number prepending.",
  },
};

const page = () => {
  return (
    <div>
      <RemoveDuplicateLines />
    </div>
  );
};

export default page;
