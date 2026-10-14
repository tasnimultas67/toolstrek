import { AgeCal } from "@/app/(main)/tools-compo/AgeCal";
import React from "react";

export const metadata = {
  title: "Age Calculator — Find Your Exact Age in Years, Months & Days",
  description:
    "Calculate your exact age in years, months, weeks, and days instantly. Free online age calculator — enter your date of birth and get precise results.",
  keywords: [
    "age calculator",
    "how old am I",
    "exact age calculator",
    "date of birth calculator",
    "age in years months days",
    "online age calculator",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Age Calculator — Find Your Exact Age | ToolsTrek",
    description:
      "Calculate your exact age in years, months, weeks, and days instantly. Free, no sign-up required.",
    url: "https://toolstrek.vercel.app/tools/age-calculate",
    type: "website",
    siteName: "ToolsTrek",
    images: [
      {
        url: "https://toolstrek.vercel.app/Age-Calculator-icon.svg",
        width: 1200,
        height: 630,
        alt: "ToolsTrek Age Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Age Calculator | ToolsTrek",
    description: "Find your exact age in years, months & days. Free & instant.",
    images: ["https://toolstrek.vercel.app/Age-Calculator-icon.svg"],
    site: "@toolstrek",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/age-calculate",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const page = () => {
  return <AgeCal />;
};

export default page;
