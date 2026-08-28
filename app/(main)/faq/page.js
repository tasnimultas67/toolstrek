import React from "react";
import FAQCon from "../tools-compo/FAQCon";

export const metadata = {
  title: "Frequently Asked Questions — ToolsTrek",
  keywords: [
    "faq",
    "frequently asked questions",
    "toolstrek help",
    "online tools documentation",
    "free web utilities questions",
    "pdf tools guide",
    "developer tools faq",
    "privacy questions",
  ],
  description:
    "Find answers to common questions about ToolsTrek, client-side privacy, and our 92 free online web tools.",
};

const page = () => {
  return (
    <div className="m-auto">
      <div className="w-full md:w-11/12 m-auto">
        <FAQCon></FAQCon>
      </div>
    </div>
  );
};

export default page;
