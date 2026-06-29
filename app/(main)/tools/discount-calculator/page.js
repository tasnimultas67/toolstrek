import DiscountCalculator from "@/app/(main)/tools-compo/tools/DiscountCalculator";
import React from "react";

export const metadata = {
  title: "Discount Calculator - Calculate Sale Price & Savings | ToolsTrek",
  description:
    "Free online Advanced Discount Calculator. Calculate sale prices, savings, double stacked discounts, sales tax, buy-one-get-one (BOGO) deals, and compare unit prices. Keep a history of your calculations and export reports to PDF.",
  keywords:
    "Discount Calculator, Sale Price Calculator, Savings Calculator, Double Discount Calculator, BOGO Calculator, Coupon Code Calculator, Price Comparer, Unit Price Calculator",
  openGraph: {
    title: "Advanced Discount Calculator - Calculate Sale Price & Savings",
    description:
      "Calculate discount percentages, stackable coupon codes, tax-inclusive prices, BOGO deals, and compare unit prices with our free professional calculator.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/discount-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/discount-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Discount Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced Discount Calculator - Calculate Sale Price & Savings",
    description:
      "Calculate discount percentages, stackable coupon codes, tax-inclusive prices, BOGO deals, and compare unit prices with our free professional calculator.",
    images: ["https://toolstrek.vercel.app/og/discount-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/discount-calculator",
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
  return <DiscountCalculator />;
};

export default page;
