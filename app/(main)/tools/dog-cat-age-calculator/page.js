import DogCatAgeCalculator from "@/app/(main)/tools-compo/tools/dog-cat-age-calculator/DogCatAgeCalculator";
import {
  PET_FAQS,
  PET_FEATURES,
} from "@/app/(main)/tools-compo/tools/dog-cat-age-calculator/petData";
import React from "react";

export const metadata = {
  title: "Dog & Cat Age Calculator - Convert Pet Years to Human Years",
  description:
    "Find out how old your dog or cat is in human years. Size-aware dog age charts, cat lifestyle options, life stages, typical lifespan, next birthday, milestone dates and fun lifetime stats — plus a shareable report card. Free, private and 100% in your browser.",
  keywords: [
    "dog age calculator",
    "cat age calculator",
    "dog years to human years",
    "cat years to human years",
    "how old is my dog in human years",
    "how old is my cat in human years",
    "pet age calculator",
    "dog years calculator",
    "cat years calculator",
    "puppy age chart",
    "kitten age chart",
    "senior dog age",
    "pet life stages",
    "ToolsTrek",
  ],
  openGraph: {
    title:
      "Dog & Cat Age Calculator | Convert Pet Years to Human Years | ToolsTrek",
    description:
      "Enter your pet's birthday to see their human age with the size-aware chart, life stage, typical lifespan, next birthday, milestone dates and a shareable report card.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/dog-cat-age-calculator",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Dog & Cat Age Calculator | Convert Pet Years to Human Years | ToolsTrek",
    description:
      "Size-aware dog age charts, cat lifestyle options, life stages and lifespan estimates — with share links, a PNG card, CSV and JSON export.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/dog-cat-age-calculator",
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
            name: "Dog & Cat Age Calculator",
            description:
              "Pet age calculator that converts dog and cat ages into human years using size-aware charts, with life stages, typical lifespan estimates, birthday milestones, lifetime statistics and shareable report exports.",
            url: "https://toolstrek.vercel.app/tools/dog-cat-age-calculator",
            applicationCategory: "UtilityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: PET_FEATURES,
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
            mainEntity: PET_FAQS.map((faq) => ({
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
      <DogCatAgeCalculator />
    </div>
  );
};

export default page;
