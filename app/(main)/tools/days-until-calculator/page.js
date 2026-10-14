import CountdownTimer from "@/app/(main)/tools-compo/tools/CountdownTimer";
import React, { Suspense } from "react";

export const metadata = {
  title: "Days Until Calculator — Exact Days, Business Days & Date Duration | ToolsTrek",
  description:
    "Free online Days Until Calculator. Calculate exact calendar days, working/business days, full weeks, and hours until any date. Features custom weekend modes, leap year calculations, and live milestone countdowns.",
  keywords: [
    "days until calculator",
    "days until",
    "how many days until",
    "business days calculator",
    "working days until",
    "days between dates",
    "date duration calculator",
    "days until christmas",
    "days until new year",
    "calendar days counter",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Days Until Calculator — Exact Days & Business Days | ToolsTrek",
    description:
      "Calculate the exact number of days, business days, weeks, and hours between two dates or until any future milestone.",
    url: "https://toolstrek.vercel.app/tools/days-until-calculator",
    siteName: "ToolsTrek",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Days Until Calculator | ToolsTrek",
    description:
      "Calculate exact days, working business days, and duration between dates with instant breakdown."
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/countdown-timer"
  }
};

export default function DaysUntilCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Days Until Calculator",
            description:
              "Calculate the exact number of calendar days, working business days, full weeks, and hours until any future event, deadline, or holiday.",
            url: "https://toolstrek.vercel.app/tools/days-until-calculator",
            applicationCategory: "UtilityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD"
            },
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
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CountdownTimer defaultTab="days-until" />
      </Suspense>
    </>
  );
}
