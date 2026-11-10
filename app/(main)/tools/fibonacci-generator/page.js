import FibonacciGenerator from "@/app/(main)/tools-compo/tools/fibonacci-generator/FibonacciGenerator";
import { FIB_FAQS } from "@/app/(main)/tools-compo/tools/fibonacci-generator/fibonacciData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/fibonacci-generator";

export const metadata = {
  title: "Fibonacci Generator - Exact Sequence, Nth Term & Number Checker",
  description:
    "Generate Fibonacci sequences with exact BigInt precision up to index 100,000. Choose custom seeds, index ranges, steps and negative indices, check whether a number is Fibonacci, and export as text, CSV or JSON.",
  keywords:
    "fibonacci generator, fibonacci sequence, fibonacci calculator, nth fibonacci number, fibonacci checker, is this a fibonacci number, golden ratio calculator, zeckendorf representation, fibonacci table, large fibonacci numbers, negative fibonacci, custom fibonacci sequence",
  openGraph: {
    title: "Fibonacci Generator - Exact Sequences & Number Checker | ToolsTrek",
    description:
      "Build exact Fibonacci sequences with custom seeds, ranges and steps, check any number and export CSV or JSON.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Fibonacci Generator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fibonacci Generator | ToolsTrek",
    description:
      "Generate exact Fibonacci terms up to index 100,000 and check any number with a BigInt perfect-square test.",
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
            name: "Fibonacci Generator",
            applicationCategory: "CalculatorApplication",
            operatingSystem: "Any",
            description:
              "An exact BigInt Fibonacci sequence generator with custom seeds, ranges, negative indices, a Fibonacci number checker and Zeckendorf decompositions.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Generate the first N terms, an index range, all terms up to a value, or a single nth term",
              "Exact BigInt arithmetic with fast doubling",
              "Custom seed values",
              "Negative indices using the negafibonacci extension",
              "Step and reverse controls",
              "List, table, CSV and JSON output formats",
              "Configurable delimiters, grouping, prefixes and suffixes",
              "Fibonacci number checker with exact perfect-square test",
              "Zeckendorf decomposition",
              "Digit statistics, parity, prime terms and golden-ratio convergence",
              "TXT, CSV and JSON export",
              "100% client-side processing",
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
            mainEntity: FIB_FAQS.map((faq) => ({
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
        <FibonacciGenerator />
      </ToolPageShell>
    </div>
  );
};

export default page;
