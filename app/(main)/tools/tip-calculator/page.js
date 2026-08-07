import TipCalculator from "@/app/(main)/tools-compo/tools/TipCalculator";
import React from "react";

export const metadata = {
  title: "Tip Calculator - Split Bills & Calculate Tips Instantly | ToolsTrek",
  description:
    "Free online Advanced Tip Calculator. Calculate tip amounts, split bills among multiple people, set custom tip percentages, apply service charge, round up amounts, and view your calculation history. Perfect for restaurants, delivery, and group dining.",
  keywords:
    "Tip Calculator, Bill Splitter, Restaurant Tip, Split Bill Calculator, Gratuity Calculator, Group Dining Calculator, Service Charge Calculator, Custom Tip Calculator",
  openGraph: {
    title: "Tip Calculator - Split Bills & Calculate Tips Instantly",
    description:
      "Calculate tips, split bills among friends, apply custom tip percentages, and track your dining history with our free professional tip calculator.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/tip-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/tip-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Tip Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tip Calculator - Split Bills & Calculate Tips Instantly",
    description:
      "Calculate tips, split bills among friends, and track your dining history. Free online tool with advanced features.",
    images: ["https://toolstrek.vercel.app/og/tip-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/tip-calculator",
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
  return <TipCalculator />;
};

export default page;
