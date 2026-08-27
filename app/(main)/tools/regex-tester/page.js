import RegexTester from "@/app/(main)/tools-compo/tools/RegexTester";
import React from "react";

export const metadata = {
  title: "Regex Tester & Debugger - Online Regular Expression Tool | ToolsTrek",
  description:
    "Free online Regex Tester & Debugger. Test, match, replace, split, and explain regular expressions in real-time. Features interactive capture group tree, AST syntax explanation, customizable themes, zero demo data by default, and multi-language code generator (JS, Python, PHP, Java, C#, Go, Rust, Ruby, Swift, Bash).",
  keywords: [
    "regex tester",
    "regex debugger",
    "regular expression tester",
    "online regex tool",
    "regex match online",
    "regex replace online",
    "regex explainer",
    "regex ast breakdown",
    "regex code generator",
    "javascript regex tester",
    "python regex tester",
    "pcre regex tester",
    "regex cheatsheet",
    "developer tools",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Regex Tester & Debugger - Online Regular Expression Tool | ToolsTrek",
    description:
      "Free online Regex Tester & Debugger. Test, match, replace, split, and explain regular expressions in real-time with zero initial demo data, AST explanation, and multi-language code export.",
    url: "https://toolstrek.vercel.app/tools/regex-tester",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regex Tester & Debugger - Online Regular Expression Tool | ToolsTrek",
    description:
      "Free online Regex Tester & Debugger. Real-time matching, substitution, AST explainer, and multi-language code generator.",
  },
};

const page = () => {
  return (
    <div>
      <RegexTester />
    </div>
  );
};

export default page;
