import React from "react";
import TextDiffChecker from "@/app/(main)/tools-compo/tools/TextDiffChecker";

export const metadata = {
  title: "Text Diff Checker - Compare Two Texts Online",
  description:
    "Compare two texts online and highlight every added, removed and unchanged line, word or character. Switch between unified and split views, ignore case and whitespace, see similarity statistics, and copy or download a standard .diff patch. Free and 100% browser-based.",
  keywords: [
    "text diff",
    "diff checker",
    "compare text",
    "text compare",
    "difference checker",
    "text comparison tool",
    "compare two texts",
    "find differences between texts",
    "code diff",
    "file diff",
    "line diff",
    "word diff",
    "character diff",
    "unified diff",
    "side by side diff",
    "online diff checker",
    "text diff checker",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Text Diff Checker - Compare Text & Find Differences",
    description:
      "Paste two texts and see every change highlighted by line, word or character. Unified and split views, ignore case/whitespace, similarity stats and .diff export.",
    url: "https://toolstrek.vercel.app/tools/text-diff",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Text Diff Checker - Compare Two Texts Online | ToolsTrek",
    description:
      "Compare two texts side by side and highlight additions, deletions and unchanged content. Line, word and character modes with unified or split views and .diff export.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/text-diff",
  },
};

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Text Diff Checker",
            description:
              "Free online text diff checker for comparing two documents, code snippets or essays. Highlights added, removed and unchanged content by line, word or character, with unified and split views, ignore-case and ignore-whitespace options, similarity statistics and .diff patch export.",
            url: "https://toolstrek.vercel.app/tools/text-diff",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Compare two texts side by side",
              "Line, word and character diff modes",
              "Unified and split diff views",
              "Ignore case and ignore whitespace options",
              "Added, removed and unchanged statistics",
              "Similarity percentage",
              "Copy or download a standard .diff patch",
              "Large-input safeguards for responsive comparisons",
              "100% client-side with no text uploads",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <TextDiffChecker />
    </div>
  );
};

export default page;
