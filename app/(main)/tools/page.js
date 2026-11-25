import React, { Suspense } from "react";
import ParentTools from "../tools-compo/ParentTools";
import { SITE_URL } from "@/lib/siteConfig";

// Metadata for the Tools directory page
export const metadata = {
  title: "All Tools",
  description:
    "Browse our complete collection of online tools at ToolsTrek. Find everything from developer utilities to productivity helpers in one place.",
  alternates: { canonical: `${SITE_URL}/tools` },
  openGraph: {
    title: "All Tools - ToolsTrek",
    description:
      "Access the full suite of online utilities available on ToolsTrek.",
    url: `${SITE_URL}/tools`,
    type: "website",
  },
};

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <ParentTools />
      </Suspense>
    </div>
  );
};

export default page;
