import SleepCalculator from "@/app/(main)/tools-compo/tools/sleep-calculator/SleepCalculator";
import React from "react";

export const metadata = {
  title: "Sleep Calculator - Best Bedtime & Wake-Up Time",
  description:
    "Free online Sleep Calculator. Find the perfect bedtime or wake-up time using 90-minute sleep cycles. Personalised for your age, time to fall asleep, chronotype, caffeine, screen time and other habits. Includes sleep stage breakdown, nap guide and downloadable PDF report.",
  keywords:
    "sleep calculator, bedtime calculator, wake up time calculator, sleep cycle calculator, best time to sleep, what time should i go to bed, what time should i wake up, 90 minute sleep cycle, sleep quality calculator, chronotype calculator, sleep hygiene, free sleep tool",
  openGraph: {
    title: "Sleep Calculator - Find Your Perfect Bedtime & Wake-Up Time",
    description:
      "Calculate the ideal bedtime or wake-up time based on 90-minute sleep cycles, age-specific sleep needs and your daily habits. See your sleep stage breakdown and download a personal sleep plan.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/sleep-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/sleep-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Sleep Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sleep Calculator - Best Bedtime & Wake-Up Time",
    description:
      "Find your ideal bedtime or wake-up time with a 90-minute sleep cycle calculator tuned to your age and lifestyle habits.",
    images: ["https://toolstrek.vercel.app/og/sleep-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/sleep-calculator",
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
  return <SleepCalculator />;
};

export default page;
