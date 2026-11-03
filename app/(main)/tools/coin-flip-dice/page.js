import CoinFlipDice from "@/app/(main)/tools-compo/tools/coin-flip-dice/CoinFlipDice";
import { COIN_DICE_FAQS } from "@/app/(main)/tools-compo/tools/coin-flip-dice/coinDiceData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/coin-flip-dice";

export const metadata = {
  title: "Coin Flip & Dice Roller - Free Secure Random Coin and Dice",
  description:
    "Flip custom coins and roll d4, d6, d8, d10, d12, d20, d100 or any number of sides. Add weights, roll pools with modifiers, use advantage or disadvantage, and keep a private history. Crypto-secure randomness with no ads or uploads.",
  keywords:
    "coin flip, flip a coin, coin toss, dice roller, roll dice online, d20 roller, dnd dice, random dice, coin flip online, virtual dice, weighted coin, advantage disadvantage dice, dice simulator, free dice roller",
  openGraph: {
    title: "Coin Flip & Dice Roller - Secure Random Flips and Rolls | ToolsTrek",
    description:
      "Flip custom coins and roll any dice with weights, modifiers, advantage and disadvantage. Secure, local and free.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Coin Flip & Dice by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coin Flip & Dice Roller - Secure Random Flips and Rolls | ToolsTrek",
    description: "Custom coins, d4–d100 dice, weighted sides, modifiers and advantage — all in your browser.",
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
            name: "Coin Flip & Dice",
            applicationCategory: "GameApplication",
            operatingSystem: "Any",
            description:
              "A free browser-based coin flipper and dice roller. Customise coin faces and weights, roll up to 20 dice with any number of sides, add modifiers, use advantage or disadvantage, and export a local session history.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Editable coin faces with colours and weights",
              "Fair or weighted coin probability",
              "Flip up to 20 coins at once",
              "d4, d6, d8, d10, d12, d20 and d100 presets",
              "Custom dice from 2 to 1000 sides",
              "Dice pools with flat modifiers",
              "Advantage and disadvantage rolls",
              "Animated coin and dice results",
              "Local history, distribution stats and CSV export",
              "JSON configuration import and export",
              "Cryptographically secure randomness",
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
            mainEntity: COIN_DICE_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <CoinFlipDice />
      </ToolPageShell>
    </div>
  );
};

export default page;
