import WaterIntakeCalculator from "@/app/(main)/tools-compo/tools/WaterIntakeCalculator";
import React from "react";

export const metadata = {
  title: "Water Intake Calculator - Daily Hydration & Fluid Requirements | ToolsTrek",
  description:
    "Free online Water Intake Calculator. Calculate your daily fluid requirements based on body weight, age, activity level, climate, pregnancy/lactation, caffeine, and diet. Features metric & imperial units, hourly intake schedules, interactive logger, and PDF reports.",
  keywords:
    "water intake calculator, daily water calculator, hydration calculator, fluid intake calculator, how much water should i drink, water calculator by weight, hydration plan, daily fluid requirement, water intake schedule, free health calculator",
  openGraph: {
    title: "Water Intake Calculator - Personalized Daily Hydration Target",
    description:
      "Calculate your exact daily water intake needs based on weight, activity, climate, and dietary factors. Download personalized hydration schedules and PDF reports.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/water-intake-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/water-intake-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Water Intake Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Water Intake Calculator - Daily Hydration & Fluid Target",
    description:
      "Calculate personalized daily water intake, hourly hydration schedules, and track daily intake with advanced environmental & dietary options.",
    images: ["https://toolstrek.vercel.app/og/water-intake-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/water-intake-calculator",
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
  return <WaterIntakeCalculator />;
};

export default page;
