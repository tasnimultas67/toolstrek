import FactorialCalculator from "@/app/(main)/tools-compo/tools/factorial-calculator/FactorialCalculator";
import { FACTORIAL_FAQS } from "@/app/(main)/tools-compo/tools/factorial-calculator/factorialData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/factorial-calculator";

export const metadata = {
  title: "Factorial Calculator - Exact n!, Double Factorial & Derangements",
  description:
    "Calculate exact factorials up to 10,000! with no floating-point overflow. Explore n!, n!!, subfactorials, prime factorisation, trailing zeros, Stirling's approximation, permutations and combinations, and export the full result.",
  keywords:
    "factorial calculator, n factorial, calculate factorial, big factorial calculator, 100 factorial, 1000 factorial, double factorial, subfactorial, derangement calculator, trailing zeros factorial, prime factorization factorial, stirling approximation, permutations and combinations, exact factorial",
  openGraph: {
    title: "Factorial Calculator - Exact n! Up to 10,000 | ToolsTrek",
    description:
      "Arbitrary-precision factorials with n!, n!!, derangements, prime factorisation, Stirling comparison and CSV export.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Factorial Calculator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Factorial Calculator | ToolsTrek",
    description:
      "Exact factorials beyond 170! with BigInt, advanced number theory views and a downloadable table.",
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
            name: "Factorial Calculator",
            applicationCategory: "CalculatorApplication",
            operatingSystem: "Any",
            description:
              "An arbitrary-precision factorial calculator with double factorials, derangements, prime factorisation, trailing zeros and Stirling comparison.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Exact BigInt factorials up to 10,000!",
              "Standard n!, double n!! and subfactorial !n",
              "Digit count, leading digits, trailing zeros and log10",
              "Prime factorisation using Legendre's formula",
              "Stirling approximation comparison",
              "Exact permutations and combinations",
              "Factorial reference table with CSV export",
              "Full-value copy and text download",
              "Session history of saved calculations",
              "100% browser-based",
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
            mainEntity: FACTORIAL_FAQS.map((faq) => ({
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
        <FactorialCalculator />
      </ToolPageShell>
    </div>
  );
};

export default page;
