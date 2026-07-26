import TravelBudgetSplitter from "@/app/(main)/tools-compo/tools/TravelBudgetSplitter";
import React from "react";

export const metadata = {
  title: "Travel Budget Splitter – Split Trip Costs & Track Group Expenses | ToolsTrek",
  description:
    "An advanced and fully customizable travel expense splitter. Add group members, customize splitting ratios (equally, custom weights, percentages, unequal amounts), handle multi-currency conversions with custom exchange rates, set category-wise budget limits, simplify debts, and export complete reports to PDF. 100% browser-based and free.",
  keywords:
    "travel budget splitter, trip expense calculator, group bill splitter, travel cost planner, debt simplifier, travel budget tracker, split expenses, travel budget calculator, multi currency bill splitter, trip financial planner",
  openGraph: {
    title: "Travel Budget Splitter – Split Trip Costs & Track Group Expenses",
    description:
      "Coordinate group trip budgets and split bills with ease. Features custom currencies, advanced split algorithms, debt simplification, and PDF downloads.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/travel-budget-splitter",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/travel-budget-splitter.jpg",
        width: 1200,
        height: 630,
        alt: "Travel Budget Splitter Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Budget Splitter – Split Trip Costs & Track Group Expenses",
    description:
      "Coordinate group trip budgets and split bills with ease. Features custom currencies, advanced split algorithms, debt simplification, and PDF downloads.",
    images: ["https://toolstrek.vercel.app/og/travel-budget-splitter.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/travel-budget-splitter",
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
  return <TravelBudgetSplitter />;
};

export default page;
