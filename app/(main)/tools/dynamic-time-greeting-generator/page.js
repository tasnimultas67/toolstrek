import DynamicTimeGreetingGenerator from "@/app/(main)/tools-compo/tools/DynamicTimeGreetingGenerator";
import React, { Suspense } from "react";

export const metadata = {
  title: "Dynamic Time Greeting Generator — Target Timezone & Code Snippets",
  description:
    "Free online dynamic time-based greeting generator. Customize personalized morning, afternoon, evening, and night greetings by target timezone, 24-hour bracket rules, multilingual translations, visual themes, and export copy-pasteable React, JavaScript, HTML, and email template snippets.",
  keywords: [
    "dynamic time greeting generator",
    "time based greeting generator",
    "timezone greeting generator",
    "good morning greeting generator",
    "react dynamic greeting hook",
    "javascript time greeting",
    "email dynamic greeting",
    "custom time greeting",
    "klaviyo dynamic greeting",
    "time of day greeting generator",
    "personalized greeting tool",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Dynamic Time Greeting Generator — Target Timezone & Code Snippets | ToolsTrek",
    description:
      "Generate customizable, real-time contextual greetings for any timezone with multi-language support, custom time brackets, card visualizer, and export-ready React & JavaScript code.",
    url: "https://toolstrek.vercel.app/tools/dynamic-time-greeting-generator",
    siteName: "ToolsTrek",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dynamic Time Greeting Generator | ToolsTrek",
    description:
      "Generate time-based personalized greetings with target timezone selection, custom time slots, and ready-to-use code snippets."
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/dynamic-time-greeting-generator"
  }
};

export default function DynamicTimeGreetingGeneratorPage() {
  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Dynamic Time Greeting Generator",
            description:
              "Free online dynamic time-based greeting generator. Customize personalized morning, afternoon, evening, and night greetings by target timezone, 24-hour bracket rules, multilingual translations, and code export.",
            url: "https://toolstrek.vercel.app/tools/dynamic-time-greeting-generator",
            applicationCategory: "UtilityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD"
            },
            featureList: [
              "Target Timezone selector with instant city/offset search and local detection",
              "Live real-time ticking clock with 12-hour AM/PM and 24-hour toggle",
              "Fully customizable time brackets (Early Morning, Morning, Afternoon, Evening, Night, Late Night)",
              "Dynamic variable interpolation ({name}, {time}, {date}, {day}, {timezone}, {prefix}, {suffix})",
              "11+ Multilingual language packs (English, Spanish, French, German, Japanese, Arabic, Bengali, Hindi, Portuguese, Italian, Chinese)",
              "Personality tone presets (Corporate, Casual, Energetic, Customer Support, Minimalist)",
              "Interactive 24-hour time travel simulator slider",
              "Production-ready code generators (React Next.js Hook, Vanilla JS, HTML widget, Liquid Email, Python, JSON)",
              "High-resolution greeting card PNG download and text/HTML clipboard copy",
              "100% private, client-side LocalStorage configuration persistence"
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek"
            }
          })
        }}
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <DynamicTimeGreetingGenerator />
      </Suspense>
    </>
  );
}
