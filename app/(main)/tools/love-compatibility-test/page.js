import LoveCompatibilityTest from "@/app/(main)/tools-compo/tools/LoveCompatibilityTest";
import React from "react";

export const metadata = {
  title: "Love Compatibility Test — Zodiac, Numerology & More | ToolsTrek",
  description:
    "Discover how compatible you are with your partner using our free Love Compatibility Test. Combines name numerology, zodiac astrology, love languages, MBTI personality types, and relationship goals for a deep, multi-dimensional compatibility analysis.",
  keywords:
    "love compatibility test, zodiac compatibility, name numerology love, love calculator, relationship compatibility, MBTI compatibility, love language test, couple compatibility, astrology love match, soulmate test",
  openGraph: {
    title: "Love Compatibility Test — Zodiac, Numerology & More",
    description:
      "Find out how compatible you and your partner are using name numerology, zodiac signs, love languages, and personality types.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/love-compatibility-test",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/love-compatibility-test.jpg",
        width: 1200,
        height: 630,
        alt: "Love Compatibility Test Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Compatibility Test — Zodiac, Numerology & More",
    description:
      "Find out how compatible you and your partner are using name numerology, zodiac signs, love languages, and personality types.",
    images: ["https://toolstrek.vercel.app/og/love-compatibility-test.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/love-compatibility-test",
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
  return <LoveCompatibilityTest />;
};

export default page;
