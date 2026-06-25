import ZakatCalculator from "@/app/(main)/tools-compo/tools/ZakatCalculator";
import React from "react";

export const metadata = {
  title: "Zakat Calculator — Calculate Your Zakat Instantly | ToolsTrek",
  description:
    "Calculate your Zakat easily and accurately. Input your assets (gold, silver, cash, investments) and liabilities to determine your payable Zakat based on current Nisab rates.",
  keywords:
    "Zakat calculator, Islamic Zakat, Zakat on gold, Zakat on cash, Nisab, calculate Zakat online, Zakat savings, custom nisab, silver nisab, gold nisab",
  openGraph: {
    title: "Zakat Calculator — Calculate Your Zakat Instantly",
    description:
      "Calculate your yearly Zakat obligation instantly. Input cash, gold, silver, investments, and liabilities with advanced options for custom Nisab benchmarks and calendar rate systems.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/zakat-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/zakat-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Zakat Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zakat Calculator — Calculate Your Zakat Instantly",
    description:
      "Instantly calculate your Zakat obligation. Features advanced customization for Nisab values, solar/lunar calendars, and multiple assets.",
    images: ["https://toolstrek.vercel.app/og/zakat-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/zakat-calculator",
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
  return <ZakatCalculator />;
};

export default page;
