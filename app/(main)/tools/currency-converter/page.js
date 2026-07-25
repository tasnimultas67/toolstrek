import CurrencyConverter from "@/app/(main)/tools-compo/tools/CurrencyConverter";
import React from "react";

export const metadata = {
  title: "Currency Converter — Real-Time Exchange Rates | ToolsTrek",
  description:
    "Convert 36+ major currencies in real-time with live exchange rates. Compare rates, analyze historical trends, calculate bank fees/markup, and view cash breakdowns.",
  keywords:
    "currency converter, live exchange rates, usd to bdt, money converter, currency exchange calculator, foreign exchange, travel finance, exchange rate markup, bdt converter",
  openGraph: {
    title: "Currency Converter — Real-Time Exchange Rates | ToolsTrek",
    description:
      "Instantly calculate and convert between 36 major global currencies. Includes advanced custom fee markup calculations, multi-currency grids, and traveler note breakdowns.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/currency-converter",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/currency-converter.jpg",
        width: 1200,
        height: 630,
        alt: "Currency Converter Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Currency Converter — Real-Time Exchange Rates | ToolsTrek",
    description:
      "Convert currencies instantly with live API data and offline fallbacks. Customize rounding precision, bank markup, and browse traveler cash guides.",
    images: ["https://toolstrek.vercel.app/og/currency-converter.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/currency-converter",
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
  return <CurrencyConverter />;
};

export default page;
