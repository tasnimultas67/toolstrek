import React from "react";
import ParentTools from "../tools-compo/ParentTools";

// Metadata for the Tools directory page
export const metadata = {
  title: "All Tools - ToolsTrek",
  description:
    "Browse our complete collection of online tools at ToolsTrek. Find everything from developer utilities to productivity helpers in one place.",
  openGraph: {
    title: "All Tools - ToolsTrek",
    description:
      "Access the full suite of online utilities available on ToolsTrek.",
    url: "https://toolstrek.vercel.app/",
    type: "website",
  },
};

const page = () => {
  return (
    <div>
      <ParentTools />
    </div>
  );
};

export default page;
