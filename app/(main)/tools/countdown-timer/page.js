import CountdownTimer from "@/app/(main)/tools-compo/tools/CountdownTimer";
import React, { Suspense } from "react";

export const metadata = {
  title: "Countdown Timer & Days Until Calculator | ToolsTrek",
  description:
    "Free online Countdown Timer and Days Until Calculator. Track upcoming events, holidays, product launches, and milestones with timezone precision, business days calculation, full-screen mode, audio alerts, confetti celebrations, and calendar exports.",
  keywords: [
    "countdown timer",
    "days until calculator",
    "countdown clock",
    "online countdown timer",
    "days until",
    "days until christmas",
    "days until new year",
    "event countdown",
    "holiday countdown",
    "working days calculator",
    "business days until",
    "date countdown",
    "milestone tracker",
    "fullscreen countdown",
    "embed countdown",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Countdown Timer & Days Until Calculator | ToolsTrek",
    description:
      "Precision live countdown clock and days until calculator. Customize themes, calculate business days, export to Google/Apple Calendar, and share live countdowns.",
    url: "https://toolstrek.vercel.app/tools/countdown-timer",
    siteName: "ToolsTrek",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Countdown Timer & Days Until Calculator | ToolsTrek",
    description:
      "Precision live countdown clock and days until calculator with customizable themes, audio alerts, and calendar exports."
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/countdown-timer"
  }
};

export default function CountdownTimerPage() {
  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Countdown Timer & Days Until Calculator",
            description:
              "Free online Countdown Timer and Days Until Calculator. Track upcoming events, holidays, deadlines, and milestones with timezone precision, business days calculations, full-screen presentation mode, Web Audio alerts, confetti celebration, and .ics calendar exports.",
            url: "https://toolstrek.vercel.app/tools/countdown-timer",
            applicationCategory: "UtilityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD"
            },
            featureList: [
              "High-precision, drift-resistant millisecond timestamp delta countdown engine",
              "Days Until & Business Days duration calculator (excluding weekends)",
              "Curated catalog of upcoming holiday and milestone presets (New Year, Christmas, Solstices, Weekends)",
              "Global timezone support across 60+ world locations",
              "6 designer themes (Electric Sapphire, Sunset Ember, Emerald Forest, Cyber Violet, Golden Luxury, Midnight Stealth)",
              "In-browser synthesized Web Audio alert chimes (Fanfare, Harmonic Chime, Tibetan Bowl, Digital Beep)",
              "Celebration confetti particle explosion on timer completion",
              "Export to standard RFC 5545 iCalendar (.ics) format for Google Calendar, Apple Calendar, and Outlook",
              "Export stylish visual countdown card as high-resolution PNG image via HTML5 Canvas",
              "Embeddable HTML iframe code generator for Notion, Obsidian, and websites",
              "Distraction-free Fullscreen presentation projection mode [F]",
              "Shareable live URL synchronization with custom parameters",
              "100% client-side privacy with zero server logging"
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
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CountdownTimer defaultTab="countdown" />
      </Suspense>
    </>
  );
}
