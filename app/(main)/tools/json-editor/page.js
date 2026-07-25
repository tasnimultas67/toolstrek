import JSONEditor from "@/app/(main)/tools-compo/tools/JSONEditor";
import React from "react";

export const metadata = {
  title: "Advanced JSON Editor & Visual Tree Viewer | ToolsTrek",
  description:
    "Free online advanced JSON editor, formatter, and viewer. Edit JSON as text or interactively using a visual tree. Beautify, minify, sort, query with JSONPath, compare with JSON Diff, validate schema, and convert JSON to XML, YAML, and CSV.",
  keywords: [
    "json editor",
    "json viewer",
    "json tree viewer",
    "beautify json",
    "minify json",
    "json validator",
    "json path",
    "json diff",
    "json comparison",
    "json schema validation",
    "json to xml",
    "json to yaml",
    "json to csv",
    "developer tools",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Advanced JSON Editor & Visual Tree Viewer | ToolsTrek",
    description:
      "Free online advanced JSON editor, formatter, and viewer. Edit JSON as text or interactively using a visual tree. Beautify, minify, sort, query with JSONPath, compare with JSON Diff, validate schema, and convert JSON to XML, YAML, and CSV.",
    url: "https://toolstrek.vercel.app/tools/json-editor",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced JSON Editor & Visual Tree Viewer | ToolsTrek",
    description:
      "Free online advanced JSON editor, formatter, and viewer. Edit JSON as text or interactively using a visual tree. Beautify, minify, sort, query with JSONPath, compare with JSON Diff, validate schema, and convert JSON to XML, YAML, and CSV.",
  },
};

const page = () => {
  return (
    <div>
      <JSONEditor />
    </div>
  );
};

export default page;
