import RandomPicker from "@/app/(main)/tools-compo/tools/random-picker/RandomPicker";
import { PICKER_FAQS } from "@/app/(main)/tools-compo/tools/random-picker/pickerData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/random-picker";

export const metadata = {
  title: "Random Picker - Pick a Random Name, Number or Team",
  description:
    "Pick one winner, draw multiple names, shuffle a list, split people into balanced teams or generate unique random numbers. Weighted draws, duplicate filtering, secure randomness, local history and CSV exports. Your list starts empty.",
  keywords:
    "random picker, random name picker, pick a random name, random number generator, shuffle list, team generator, random draw, raffle picker, giveaway winner, weighted random picker, random choice, classroom picker, fair draw",
  openGraph: {
    title: "Random Picker - Random Name, Number & Team Generator | ToolsTrek",
    description:
      "Draw one or many winners, shuffle lists, build balanced teams and generate random numbers with crypto-secure randomness.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Random Picker by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Picker - Random Name, Number & Team Generator | ToolsTrek",
    description: "Fair draws, shuffles, team building and random number ranges — private, weighted and free.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: PAGE_URL,
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
            name: "Random Picker",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Any",
            description:
              "A free browser-based random picker for names, tickets and tasks. Supports single and multi-winner draws, weighted or equal probability, shuffling, snake-draft teams, number ranges, duplicate filtering, local history and CSV or JSON export.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Pick one or many winners",
              "Weighted probability with editable per-item weights",
              "Full list shuffle",
              "Balanced team generation with a snake draft",
              "Random number ranges with optional uniqueness",
              "Duplicate label filtering",
              "Cryptographically secure randomness",
              "Configurable reveal animation and sound",
              "Local draw history and CSV export",
              "JSON pool import and export",
              "Empty by default with an explicit demo data button",
            ],
            creator: { "@type": "Organization", name: "ToolsTrek" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: PICKER_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <RandomPicker />
      </ToolPageShell>
    </div>
  );
};

export default page;
