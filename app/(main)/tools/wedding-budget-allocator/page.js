import WeddingBudgetAllocator from "@/app/(main)/tools-compo/tools/wedding-budget-allocator/WeddingBudgetAllocator";
import React from "react";

export const metadata = {
  title: "Wedding Budget Allocator & Expense Tracker | ToolsTrek",
  description:
    "Free online Wedding Budget Allocator and Expense Tracker. Estimate costs, adjust sliders, track estimated vs. actual expenses with variance calculations, choose budget presets (Foodie, Photogenic, Party), view dynamic SVG charts, and download complete PDF reports.",
  keywords:
    "wedding budget allocator, wedding cost calculator, wedding cost estimator, wedding budget planner, budget planner, wedding expense tracker, export wedding budget pdf, free wedding planning tools",
  openGraph: {
    title: "Wedding Budget Allocator & Expense Tracker",
    description:
      "Instantly estimate and track your wedding budget. Adjust categories, track actual vs estimated costs, and generate customizable PDF expense reports.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/wedding-budget-allocator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/wedding-budget-allocator.jpg",
        width: 1200,
        height: 630,
        alt: "Wedding Budget Allocator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Budget Allocator & Expense Tracker",
    description:
      "Instantly estimate and track your wedding budget. Adjust categories, track actual vs estimated costs, and generate customizable PDF expense reports.",
    images: ["https://toolstrek.vercel.app/og/wedding-budget-allocator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/wedding-budget-allocator",
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
  return <WeddingBudgetAllocator />;
};

export default page;
