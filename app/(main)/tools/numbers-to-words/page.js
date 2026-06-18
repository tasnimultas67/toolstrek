import NumbersToWords from "@/app/(main)/tools-compo/tools/NumbersToWords";
import React from "react";

export const metadata = {
  title: "Number to Words Converter | ToolsTrek",
  description:
    "Convert numbers into words instantly and securely with this free, privacy-focused online utility. Designed for performance and clean visual clarity.",
  keywords: [
    "number to words",
    "number converter",
    "online utility",
    "ToolsTrek",
    "privacy-focused",
  ],
  metadataBase: new URL("https://toolstrek.vercel.app"),
  openGraph: {
    title: "Number to Words Converter | ToolsTrek",
    description:
      "Convert numbers into words instantly and securely with this free, privacy-focused online utility.",
    url: "/",
    siteName: "ToolsTrek",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Number to Words Converter | ToolsTrek",
    description:
      "Convert numbers into words instantly and securely with this free, privacy-focused online utility.",
  },
};

const Page = () => {
  return (
    <div className="">
      <NumbersToWords />
    </div>
  );
};

export default Page;
