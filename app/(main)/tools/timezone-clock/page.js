import TimezoneClock from "@/app/(main)/tools-compo/tools/TimezoneClock";
import React from "react";

export const metadata = {
  title: "World Timezone Clock & Meeting Planner | ToolsTrek",
  description:
    "Free online timezone converter and world clock. Track real-time clocks for multiple cities, compare times with an interactive meeting planner slider, set local timezone alarms, and check UTC offsets.",
  keywords: [
    "world clock",
    "timezone clock",
    "timezone converter",
    "meeting planner",
    "time zones",
    "time converter",
    "UTC offset",
    "local time",
    "schedule meeting timezone",
    "ToolsTrek",
  ],
  openGraph: {
    title: "World Timezone Clock & Meeting Planner | ToolsTrek",
    description:
      "Track real-time world clocks, compare timezones with an interactive timeline slider, set local alarms, and sync your favorite cities natively and privately in your browser.",
    type: "website",
    url: "https://toolstrek.com/tools/timezone-clock",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "World Timezone Clock & Meeting Planner | ToolsTrek",
    description:
      "Track real-time world clocks, compare timezones with an interactive timeline slider, set local alarms, and sync your favorite cities natively and privately in your browser.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/timezone-clock",
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
            name: "World Timezone Clock & Meeting Planner",
            description:
              "Free online timezone converter and world clock. Track real-time clocks for multiple cities, compare times with an interactive meeting planner slider, set local timezone alarms, and check UTC offsets.",
            url: "https://toolstrek.com/tools/timezone-clock",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Synchronized ticking real-time world clocks for any timezone",
              "Interactive SVG analog clock displays with visual day/night theme updates",
              "Meeting planner slider / timeline tool for future timezone conversions",
              "Custom local alarms and reminders per timezone (with soft chime sound)",
              "Shareable URLs with preset cities",
              "Auto-detect user local timezone",
              "Local storage persistence for customized city lists and preferences",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <TimezoneClock />
    </div>
  );
};

export default page;
