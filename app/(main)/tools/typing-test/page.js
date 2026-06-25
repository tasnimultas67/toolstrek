import TypingTest from "@/app/(main)/tools-compo/tools/TypingTest";
import React from "react";

export const metadata = {
  title: "Professional Typing Test | Check WPM & Accuracy | ToolsTrek",
  description:
    "Free online typing test. Measure your typing speed (WPM) and accuracy with our interactive test. Features mechanical sound effects, key heatmap analysis, sudden death mode, coding typing tests, and dynamic certificate downloads.",
  keywords: [
    "typing test",
    "typing speed test",
    "wpm calculator",
    "accuracy checker",
    "typing certificate",
    "mechanical keyboard sound typing",
    "coding typing practice",
    "typing test with certificate",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Professional Typing Test | Check WPM & Accuracy | ToolsTrek",
    description:
      "Measure your typing speed and accuracy with this interactive tool. Features live stats, real-time WPM graphs, key-by-key response heatmap, and free dynamic certificate downloads.",
    type: "website",
    url: "https://toolstrek.com/tools/typing-test",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Typing Test | Check WPM & Accuracy | ToolsTrek",
    description:
      "Measure your typing speed and accuracy with this interactive tool. Features live stats, real-time WPM graphs, key-by-key response heatmap, and free dynamic certificate downloads.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/typing-test",
  },
};

const page = () => {
  return (
    <div>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Professional Typing Test",
            description:
              "Measure your typing speed (WPM) and accuracy with our interactive test. Features mechanical sound effects, key heatmap analysis, sudden death mode, coding typing tests, and dynamic certificate downloads.",
            url: "https://toolstrek.com/tools/typing-test",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Real-time speed WPM and accuracy metrics tracker",
              "Multiple modes including Time Trial, Word Limit, Sudden Death, and Zen",
              "Code snippets typing test for JavaScript, HTML, and CSS",
              "Synthesized retro mechanical keyboard sound effects",
              "Visual keyboard with post-test error and speed heatmap",
              "Downloadable high-resolution dynamic certificate of completion",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <TypingTest />
    </div>
  );
};

export default page;
