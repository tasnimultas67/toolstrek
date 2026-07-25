import ZodiacSignCalculator from "@/app/(main)/tools-compo/tools/ZodiacSignCalculator";
import React from "react";

export const metadata = {
  title: "Zodiac Sign Calculator — Accurate Sun Sign, Vedic Rashi & Chinese Zodiac | ToolsTrek",
  description:
    "Calculate your exact Zodiac Sun Sign, Vedic Rashi, Chinese Zodiac animal, Decan sub-ruler, Cusp traits, and love compatibility with our free, professional Zodiac Sign Calculator.",
  keywords: [
    "zodiac sign calculator",
    "zodiac sign finder",
    "what is my zodiac sign",
    "astrology calculator",
    "vedic rashi calculator",
    "chinese zodiac calculator",
    "zodiac decan calculator",
    "zodiac cusp detector",
    "zodiac compatibility test",
    "sun sign finder",
    "horoscope calculator"
  ],
  openGraph: {
    title: "Zodiac Sign Calculator — Accurate Sun Sign, Vedic & Chinese Zodiac",
    description:
      "Find your exact Zodiac sign, Vedic Rashi, Chinese Zodiac, Decans, Cusps, and full astrological personality profile.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/zodiac-sign-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/zodiac-sign-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Zodiac Sign Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zodiac Sign Calculator — Accurate Astrological Blueprint",
    description:
      "Calculate your Zodiac Sun Sign, Vedic Rashi, Chinese Zodiac, Decan sub-ruler, and compatibility.",
    images: ["https://toolstrek.vercel.app/og/zodiac-sign-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/zodiac-sign-calculator",
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
  return <ZodiacSignCalculator />;
};

export default page;
