import TextRepeater from "@/app/(main)/tools-compo/tools/TextRepeater";
import React from "react";

export const metadata = {
  title: "Text Repeater - Repeat Text Online | ToolsTrek",
  description:
    "Free online text repeater tool to repeat any text multiple times. Customize with separators, prefixes, suffixes. Copy or download repeated text instantly.",
  keywords:
    "text repeater, repeat text, text generator, text tool, online text tool, repeat words, copy text multiple times",
  authors: [{ name: "ToolsTrek" }],
  openGraph: {
    title: "Text Repeater - Repeat Text Online | ToolsTrek",
    description:
      "Free online text repeater tool to repeat any text multiple times. Customize with separators, prefixes, suffixes.",
    url: "https://toolstrek.vercel.app/text-repeater",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Text Repeater - Repeat Text Online | ToolsTrek",
    description:
      "Free online text repeater tool to repeat any text multiple times.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/text-repeater",
  },
};

const page = () => {
  return (
    <div>
      <TextRepeater />
    </div>
  );
};

export default page;
