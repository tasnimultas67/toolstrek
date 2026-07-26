import PackingListGenerator from "@/app/(main)/tools-compo/tools/PackingListGenerator";
import React from "react";

export const metadata = {
  title: "Packing List Generator – Build & Export Your Travel Checklist | ToolsTrek",
  description:
    "Create a fully customizable travel packing list with priority levels, collapsible categories, and PDF export. Add, edit, and organize items across categories like Clothing, Toiletries, Documents, Electronics, and more. 100% free and browser-based.",
  keywords:
    "packing list generator, travel checklist, travel packing list, trip packing planner, packing list PDF, travel organizer, luggage checklist, vacation packing list, customizable packing list, travel tool",
  openGraph: {
    title: "Packing List Generator – Build & Export Your Travel Checklist",
    description:
      "Create a customizable packing checklist with priority labels, category management, and one-click PDF export. Perfect for any trip.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/packing-list-generator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/packing-list-generator.jpg",
        width: 1200,
        height: 630,
        alt: "Packing List Generator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Packing List Generator – Build & Export Your Travel Checklist",
    description:
      "Create a customizable packing checklist with priority labels, category management, and PDF export.",
    images: ["https://toolstrek.vercel.app/og/packing-list-generator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/packing-list-generator",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const page = () => {
  return <PackingListGenerator />;
};

export default page;
