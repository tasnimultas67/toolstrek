import React from "react";
import FAQCon from "../tools-compo/FAQCon";
import { SITE_URL, TOOL_COUNT } from "@/lib/siteConfig";

export const metadata = {
  title: "Frequently Asked Questions",
  alternates: { canonical: `${SITE_URL}/faq` },
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
    `Find answers about ToolsTrek, browser privacy, and our ${TOOL_COUNT} free online tools.`,
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
