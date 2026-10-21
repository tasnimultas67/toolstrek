import React from "react";
import PercentageCalculator from "@/app/(main)/tools-compo/tools/PercentageCalculator";

export const metadata = {
  title: "Percentage Calculator - Percent Of, Change & Reverse %",
  description:
    "Free online percentage calculator with five modes: X% of Y, X is what percent of Y, percentage increase or decrease, add or subtract a percentage, and reverse percentage. See every formula, step-by-step working and copy the result instantly.",
  keywords: [
    "percentage calculator",
    "percent calculator",
    "what is x percent of y",
    "x is what percent of y",
    "percentage increase calculator",
    "percentage decrease calculator",
    "percent change calculator",
    "add percentage calculator",
    "subtract percentage calculator",
    "reverse percentage calculator",
    "percentage of a number",
    "percent difference calculator",
    "discount percentage calculator",
    "free percentage calculator",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Percentage Calculator - Five Ways to Solve Percentages",
    description:
      "Calculate X% of Y, percent change, markups, discounts and reverse percentages with a clear formula and step-by-step breakdown. Free, fast and private.",
    url: "https://toolstrek.vercel.app/tools/percentage-calculator",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Percentage Calculator - Percent Of, Change & Reverse % | ToolsTrek",
    description:
      "Five percentage calculators in one: find X% of Y, percent change, add or subtract a percentage, and reverse a percentage — with full working shown.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/percentage-calculator",
  },
};

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Percentage Calculator",
            description:
              "Free online percentage calculator for finding X% of Y, what percent one value is of another, percentage increase and decrease, adding or subtracting a percentage, and reverse percentages. Includes formula breakdowns and step-by-step working.",
            url: "https://toolstrek.vercel.app/tools/percentage-calculator",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Five percentage modes in one calculator",
              "X% of Y calculations with the formula shown",
              "What percent X is of Y",
              "Percentage increase and decrease between two values",
              "Add or subtract a percentage from a base value",
              "Reverse percentage: find the whole from a part",
              "Step-by-step working and substituted formulas",
              "Copy result to clipboard",
              "100% client-side with no data collection",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <PercentageCalculator />
    </div>
  );
};

export default page;
