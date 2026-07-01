import SavingsCalculator from "@/app/(main)/tools-compo/tools/savings-calculator/SavingsCalculator";
import React from "react";

export const metadata = {
  title: "Savings Calculator - Calculate Wealth Growth & Compound Interest | ToolsTrek",
  description:
    "Free online Savings Calculator with compound interest. Calculate how your investments grow over time. Explore advanced options like inflation adjustment, tax deduction, annual step-up contribution, and download professional PDF reports.",
  keywords:
    "savings calculator, compound interest calculator, interest calculator, wealth calculator, financial calculator, inflation savings calculator, after tax savings calculator, download savings pdf, free finance tools",
  openGraph: {
    title: "Savings Calculator - Calculate Wealth Growth & Compound Interest",
    description:
      "Instantly calculate how your savings grow over time. Plan with initial deposits, recurring contributions, compound interest intervals, and advanced options like inflation, taxes, and annual step-up increases.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/savings-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/savings-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Savings Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Savings Calculator - Calculate Wealth Growth & Compound Interest",
    description:
      "Instantly calculate savings growth with compound interest. Adjust for inflation, taxes, annual step-up contributions, and download PDF reports.",
    images: ["https://toolstrek.vercel.app/og/savings-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/savings-calculator",
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
  return <SavingsCalculator />;
};

export default page;
