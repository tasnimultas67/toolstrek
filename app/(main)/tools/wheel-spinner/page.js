import WheelSpinner from "@/app/(main)/tools-compo/tools/wheel-spinner/WheelSpinner";
import { WHEEL_FAQS } from "@/app/(main)/tools-compo/tools/wheel-spinner/wheelData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/wheel-spinner";

export const metadata = {
  title: "Wheel Spinner - Free Random Picker Wheel with Weighted Options",
  description:
    "Spin a customisable prize wheel with your own options, colours and weights. Cryptographically secure results, editable bulk lists, sound, confetti, elimination mode, local history and JSON or CSV export. Empty by default, private and free.",
  keywords:
    "wheel spinner, spin the wheel, random wheel picker, prize wheel, decision wheel, weighted wheel, raffle picker, random name picker, spinner wheel online, classroom wheel, giveaway picker, custom wheel, free wheel spinner",
  openGraph: {
    title: "Wheel Spinner - Free Random Picker Wheel | ToolsTrek",
    description:
      "Build a weighted wheel from your own options and spin it with secure randomness. Sound, confetti, elimination, history and exports.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Wheel Spinner by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wheel Spinner - Free Random Picker Wheel | ToolsTrek",
    description: "Custom weighted wheel, secure spins, sound, confetti, history and CSV export — all in your browser.",
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
            name: "Wheel Spinner",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Any",
            description:
              "A free browser-based wheel spinner with fully editable options, per-option weights and colours, secure random selection, six palettes, sound and confetti, winner removal, spin history and JSON or CSV export.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Fully editable options with per-item weight and colour",
              "Cryptographically secure winner selection",
              "Weighted or equal probability modes",
              "Bulk list editor with optional weight syntax",
              "Six colour palettes",
              "Synthesised spin and win sounds plus confetti",
              "Remove winner mode for elimination rounds",
              "Full-screen wheel and keyboard activation",
              "Local spin history with CSV export",
              "JSON import and export for wheels",
              "100% client-side privacy with no uploads",
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
            mainEntity: WHEEL_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <WheelSpinner />
      </ToolPageShell>
    </div>
  );
};

export default page;
