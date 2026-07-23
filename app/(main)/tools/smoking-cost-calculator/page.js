import SmokingCostCalculator from "@/app/(main)/tools-compo/tools/SmokingCostCalculator";
import React from "react";

export const metadata = {
  title: "Smoking Cost Calculator - Calculate Cigarette, Vape & Tobacco Expenses | ToolsTrek",
  description:
    "Free online Smoking Cost Calculator. Calculate how much money you spend on cigarettes per day, month, 1 year, 5 years, 10 years, and 20 years. Includes BDT default & global currencies, tabs for Per Pack, Per Piece, Vape, and compound interest investment projections.",
  keywords:
    "smoking cost calculator, cigarette cost calculator, vape cost calculator, tobacco expense calculator, smoking money saved calculator, cigarette pack calculator bdt, quit smoking financial savings, compound interest quit smoking, free finance tools",
  openGraph: {
    title: "Smoking Cost Calculator - Calculate Cigarette, Vape & Tobacco Expenses",
    description:
      "Calculate your smoking expenses over 1 day, 7 days, 1 month, 6 months, 1 year, 5 years, 10 years, and 20 years. Explore BDT & global currencies, per pack / per piece tabs, health recovery milestones, and investment return projections.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/smoking-cost-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/smoking-cost-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Smoking Cost Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smoking Cost Calculator - Calculate Cigarette, Vape & Tobacco Expenses",
    description:
      "Calculate cigarette & vape spending over 1 day to 20 years. See wealth accumulation if you quit today. BDT default currency support.",
    images: ["https://toolstrek.vercel.app/og/smoking-cost-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/smoking-cost-calculator",
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
  return <SmokingCostCalculator />;
};

export default page;
