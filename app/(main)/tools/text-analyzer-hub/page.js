import React from "react";
import TextAnalyzerHub from "@/app/(main)/tools-compo/tools/TextAnalyzerHub";

export const metadata = {
  title: "All-in-One Text Analyzer Hub | ToolsTrek",
  description:
    "An all-in-one text utility toolkit to count characters, words, sentences, and lines. Perform advanced case conversions, clean duplicate lines/HTML markup, find and replace with regex, and run base64/hex/binary codecs.",
  keywords: [
    "text analyzer",
    "word counter",
    "character count tool",
    "line counter",
    "case converter",
    "camelcase converter",
    "text cleaner",
    "find and replace text",
    "base64 encoder decoder",
    "html entity encoder",
    "binary encoder decoder",
    "hex converter",
    "productivity tools",
    "developer tools"
  ],
  openGraph: {
    title: "All-in-One Text Analyzer Hub — Parse & Transform Text | ToolsTrek",
    description:
      "A clean, responsive, client-side utility toolkit. Analyze statistics, adjust casing styles, clean whitespace, execute pattern matching, and run standard encodings.",
    url: "https://toolstrek.vercel.app/tools/text-analyzer-hub",
    type: "website",
  },
};

const page = () => {
  return <TextAnalyzerHub />;
};

export default page;
