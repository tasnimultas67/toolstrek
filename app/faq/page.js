import React from "react";
import FAQCon from "../tools-compo/FAQCon";

export const metadata = {
  title: "FAQ — ToolsTrek",
  keywords: ["faq", "questions", "tools", "frequently asked question"],
  description:
    "Find answers to common questions about ToolsTrek and our free online tools",
};

const page = () => {
  return (
    <div className="m-auto">
      <div className="w-full md:w-[800px] m-auto">
        <FAQCon></FAQCon>
      </div>
    </div>
  );
};

export default page;
