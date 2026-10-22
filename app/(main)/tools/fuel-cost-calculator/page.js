import FuelCostCalculator from "@/app/(main)/tools-compo/tools/fuel-cost-calculator/FuelCostCalculator";
import { FUEL_FAQS } from "@/app/(main)/tools-compo/tools/fuel-cost-calculator/fuelCostData";
import React from "react";

export const metadata = {
  title: "Fuel Cost & Road Trip Calculator - Trip Cost, MPG & Fuel Stops",
  description:
    "Calculate fuel cost for any road trip in metric or imperial units. Include round trips, real-world fuel economy, passengers, tolls, parking, accommodation, food, budget, fuel stops and CO₂, then copy a summary or download a CSV. Free and 100% private.",
  keywords:
    "fuel cost calculator, road trip calculator, gas cost calculator, trip fuel calculator, fuel consumption calculator, mpg calculator, cost per mile, cost per km, road trip budget, split fuel cost, fuel stop calculator, towing fuel cost, car trip cost, diesel cost calculator, petrol cost calculator",
  openGraph: {
    title: "Fuel Cost & Road Trip Calculator - Trip Cost, MPG & Fuel Stops",
    description:
      "Turn distance, fuel economy and pump prices into a complete road-trip budget with passenger splits, extra costs, range and fuel stops.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/fuel-cost-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/fuel-cost-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Fuel Cost & Road Trip Calculator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fuel Cost & Road Trip Calculator - Trip Cost, MPG & Fuel Stops",
    description:
      "Plan fuel, tolls, stops and the per-person cost of any drive in metric or imperial units.",
    images: ["https://toolstrek.vercel.app/og/fuel-cost-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/fuel-cost-calculator",
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
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Fuel Cost & Road Trip Calculator",
            applicationCategory: "TravelApplication",
            operatingSystem: "Any",
            description:
              "A road-trip cost calculator with fuel economy adjustments, passenger splitting, extra costs, range and fuel-stop planning, emissions estimates and CSV export.",
            url: "https://toolstrek.vercel.app/tools/fuel-cost-calculator",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Metric and imperial distance, efficiency and fuel price units",
              "L/100 km, km/L, US MPG and UK MPG efficiency conversion",
              "Round-trip distance, vehicle presets and real-world fuel adjustments",
              "Tolls, parking, accommodation, food and budget tracking",
              "Per-person cost split for up to twelve passengers",
              "Full-tank range, starting range and refuel-stop planning",
              "Petrol, diesel, E10, E85 and LPG CO₂ estimates",
              "Copyable summary and downloadable CSV trip sheet",
              "100% client-side privacy",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FUEL_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      <FuelCostCalculator />
    </div>
  );
};

export default page;
