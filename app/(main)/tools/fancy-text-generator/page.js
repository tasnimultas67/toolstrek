import FancyTextGenerator from "@/app/(main)/tools-compo/tools/FancyTextGenerator";
import React from "react";

export const metadata = {
  title: "Professional Fancy Text Generator | ToolsTrek",
  description:
    "Free online fancy text generator tool. Instantly convert plain text into stylized Unicode fonts, cursive script, bubble letters, double-struck, gothic calligraphy, and glitched Zalgo text.",
  keywords: [
    "fancy text generator",
    "fancy font generator",
    "cool text generator",
    "unicode fonts",
    "social media fonts",
    "cursive text generator",
    "gothic text",
    "bubble letters",
    "zalgo text generator",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Professional Fancy Text Generator | ToolsTrek",
    description:
      "Free online fancy text generator tool. Instantly convert plain text into stylized Unicode fonts, cursive script, bubble letters, double-struck, gothic calligraphy, and glitched Zalgo text.",
    url: "https://toolstrek.vercel.app/tools/fancy-text-generator",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Fancy Text Generator | ToolsTrek",
    description:
      "Free online fancy text generator tool. Instantly convert plain text into stylized Unicode fonts, cursive script, bubble letters, double-struck, gothic calligraphy, and glitched Zalgo text.",
  },
};

const page = () => {
  return (
    <div>
      <FancyTextGenerator />
    </div>
  );
};

export default page;
