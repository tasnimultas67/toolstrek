import AgeOnOtherPlanets from "@/app/(main)/tools-compo/tools/age-on-other-planets/AgeOnOtherPlanets";
import { PLANET_FAQS, PLANET_FEATURES } from "@/app/(main)/tools-compo/tools/age-on-other-planets/planetData";
import React from "react";

export const metadata = {
  title: "Age on Other Planets - How Old Am I on Mars, Jupiter & Beyond?",
  description:
    "Find out how old you are on every planet in the solar system. Enter your birth date to see your exact age on Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto, plus your next planetary birthday, weight and jump heights, and a shareable report card. 100% free, private and in your browser.",
  keywords: [
    "age on other planets",
    "how old am i on mars",
    "age on mars calculator",
    "planetary age calculator",
    "how old would i be on jupiter",
    "age on venus calculator",
    "age on saturn",
    "age on neptune",
    "space age calculator",
    "how old am i in space",
    "birthday on other planets",
    "planet years calculator",
    "weight on other planets",
    "ToolsTrek",
  ],
  openGraph: {
    title:
      "Age on Other Planets | How Old Am I on Mars, Jupiter & Beyond? | ToolsTrek",
    description:
      "Enter your birth date to see your exact age on all eight planets — plus Pluto — with your next planetary birthday, milestone planner, weight and jump heights, and a shareable report card.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/age-on-other-planets",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Age on Other Planets | How Old Am I on Mars, Jupiter & Beyond? | ToolsTrek",
    description:
      "See your exact age on Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto — with birthdays, milestones, weight and jump heights in one cosmic report.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/age-on-other-planets",
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
  category: "fun",
  authors: [{ name: "Tasnimul Haque" }],
  creator: "ToolsTrek",
  publisher: "ToolsTrek",
  formatDetection: {
    telephone: false,
  },
};

const page = () => {
  return (
    <div>
      {/* Structured data for the tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Age on Other Planets",
            description:
              "Planetary age calculator that shows how old you are on Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto, with next planetary birthdays, milestone dates, weight and jump comparisons, and shareable report exports.",
            url: "https://toolstrek.vercel.app/tools/age-on-other-planets",
            applicationCategory: "EntertainmentApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: PLANET_FEATURES,
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      {/* FAQ structured data — mirrors the on-page accordion */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: PLANET_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />
      <AgeOnOtherPlanets />
    </div>
  );
};

export default page;
