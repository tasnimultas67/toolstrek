import DummyTextGenerator from "@/app/(main)/tools-compo/tools/DummyTextGenerator";
import React from "react";

export const metadata = {
  title: "Advanced Dummy Text Generator | ToolsTrek",
  description:
    "Free online dummy text generator tool. Instantly generate Lorem Ipsum, Tech Speak, or Sci-Fi Space placeholder text by words, characters, or paragraphs with HTML formatting.",
  keywords: [
    "dummy text generator",
    "lorem ipsum generator",
    "placeholder text",
    "lorem ipsum",
    "text generator",
    "lipsum",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Advanced Dummy Text Generator | ToolsTrek",
    description:
      "Free online dummy text generator tool. Instantly generate Lorem Ipsum, Tech Speak, or Sci-Fi Space placeholder text by words, characters, or paragraphs with HTML formatting.",
    url: "https://toolstrek.vercel.app/tools/dummy-text-generator",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced Dummy Text Generator | ToolsTrek",
    description:
      "Free online dummy text generator tool. Instantly generate Lorem Ipsum, Tech Speak, or Sci-Fi Space placeholder text by words, characters, or paragraphs with HTML formatting.",
  },
};

const page = () => {
  return (
    <div>
      <DummyTextGenerator />
    </div>
  );
};

export default page;
