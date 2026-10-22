import FlightDurationCalculator from "@/app/(main)/tools-compo/tools/flight-duration-calculator/FlightDurationCalculator";
import { FLIGHT_FAQS } from "@/app/(main)/tools-compo/tools/flight-duration-calculator/flightDurationData";
import React from "react";

export const metadata = {
  title: "Flight Duration Calculator - Flight Time, Arrival & Layover Planner",
  description:
    "Calculate exact flight duration between any two airports with automatic time zone and daylight-saving handling. Switch between duration, arrival and departure modes, add up to six connecting flights, check layover risks, include door-to-door airport buffers, and export a PDF report. Free, private and 100% browser-based.",
  keywords:
    "flight duration calculator, flight time calculator, flight arrival time calculator, flight departure time calculator, time zone flight calculator, layover calculator, connection time calculator, how long is my flight, multi city flight calculator, airport time difference, door to door travel time, flight duration with time zones, daylight saving flight time",
  openGraph: {
    title: "Flight Duration Calculator - Flight Time, Arrival & Layover Planner",
    description:
      "Work out airborne time, local arrival time and full journey time with time zones, daylight saving, connections and airport buffers handled automatically.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/flight-duration-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/flight-duration-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Flight Duration Calculator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flight Duration Calculator - Flight Time, Arrival & Layover Planner",
    description:
      "Calculate flight time, local arrival time, layovers and door-to-door journey time for any route — with automatic daylight-saving handling.",
    images: ["https://toolstrek.vercel.app/og/flight-duration-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/flight-duration-calculator",
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
            name: "Flight Duration Calculator",
            applicationCategory: "TravelApplication",
            operatingSystem: "Any",
            description:
              "A time-zone-aware flight duration, arrival time and layover calculator with multi-city support, door-to-door buffers, connection risk scoring and PDF export.",
            url: "https://toolstrek.vercel.app/tools/flight-duration-calculator",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Flight duration, arrival time and departure time modes",
              "Up to six connecting flights in one itinerary",
              "Automatic IANA time zone and daylight-saving conversion",
              "Domestic and international layover risk scoring",
              "Pre-departure and post-arrival airport buffers",
              "Distance, average speed and door-to-door journey time",
              "Copyable itinerary summary and downloadable PDF report",
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
            mainEntity: FLIGHT_FAQS.map((faq) => ({
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
      <FlightDurationCalculator />
    </div>
  );
};

export default page;
