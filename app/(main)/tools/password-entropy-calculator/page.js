import PasswordEntropyCalculator from "@/app/(main)/tools-compo/tools/password-entropy-calculator/PasswordEntropyCalculator";
import { PASSWORD_ENTROPY_FAQS } from "@/app/(main)/tools-compo/tools/password-entropy-calculator/entropyData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/password-entropy-calculator";

export const metadata = {
  title: "Password Entropy Calculator - Bits, Strength & Crack Time",
  description:
    "Calculate real password entropy in bits, detect dictionary words, keyboard walks, repeats and dates, and compare crack times across online, bcrypt, GPU and nation-state attack models. Includes a passphrase planner and 100% offline processing.",
  keywords:
    "password entropy calculator, password strength calculator, password bits, entropy of a password, password crack time, how long to crack my password, password security checker, passphrase generator, diceware passphrase, password search space, bcrypt crack time, password pattern analyzer, strong password checker, password entropy formula",
  openGraph: {
    title: "Password Entropy Calculator - Bits & Crack Time | ToolsTrek",
    description:
      "Measure password entropy, detect weak patterns and see realistic crack times — all locally in your browser.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Password Entropy Calculator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Password Entropy Calculator | ToolsTrek",
    description:
      "See the real entropy behind any password, with pattern penalties, crack-time tables and a passphrase planner.",
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
            name: "Password Entropy Calculator",
            applicationCategory: "SecurityApplication",
            operatingSystem: "Any",
            description:
              "A privacy-first password entropy calculator with pattern detection, crack-time comparison and a passphrase planner.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Entropy in bits based on the detected character pool",
              "Pattern penalties for repeats, sequences, keyboard walks, years and dictionary words",
              "Breach-list check against common passwords",
              "Crack times for six realistic attack models",
              "Custom guesses-per-second benchmark",
              "Passphrase planner with word-count entropy",
              "Character composition breakdown",
              "100% client-side analysis",
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
            mainEntity: PASSWORD_ENTROPY_FAQS.map((faq) => ({
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
      <ToolPageShell widthClassName="max-w-none">
        <PasswordEntropyCalculator />
      </ToolPageShell>
    </div>
  );
};

export default page;
