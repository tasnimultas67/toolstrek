import React from "react";
import TimeConverter from "@/app/(main)/tools-compo/TimeConverter";

export const metadata = {
  title: "Time Converter - Convert Seconds, Minutes, Hours & More | Toolstrek",
  description:
    "Free online time converter. Instantly convert between nanoseconds, microseconds, milliseconds, seconds, minutes, hours, days, weeks, months, years, decades, and centuries.",
  keywords: [
    "time converter",
    "seconds to minutes",
    "minutes to hours",
    "hours to seconds",
    "time unit converter",
    "milliseconds to seconds",
    "days to hours",
    "weeks to days",
    "online time calculator",
    "toolstrek",
  ],
  openGraph: {
    title: "Time Converter - Convert Seconds, Minutes, Hours & More | Toolstrek",
    description:
      "Free online time converter. Instantly convert between nanoseconds, milliseconds, seconds, minutes, hours, days, weeks, months, years, and more.",
    url: "https://toolstrek.com/tools/time-converter",
    siteName: "Toolstrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Time Converter - Convert Seconds, Minutes, Hours & More | Toolstrek",
    description:
      "Free online time converter. Instantly convert between nanoseconds, milliseconds, seconds, minutes, hours, days, weeks, months, years, and more.",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Time Converter - Toolstrek",
    url: "https://toolstrek.com/tools/time-converter",
    description:
      "Free online time converter. Instantly convert between nanoseconds, milliseconds, seconds, minutes, hours, days, weeks, months, and years.",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TimeConverter />
    </>
  );
}
