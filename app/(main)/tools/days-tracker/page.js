import React from "react";
import DaysTracker from "../../tools-compo/DaysTracker";

export const metadata = {
  title: "Days Tracker — Calculate End Date & Count Days Between Dates",
  keywords: ["days tracker", "date calculator", "count days", "days between dates", "deadline calculator", "ToolsTrek"],
  description: "Calculate end dates, count days between two dates, or track deadlines easily. Free online days tracker with instant results.",
  openGraph: {
    title: "Days Tracker — Date & Deadline Calculator | ToolsTrek",
    description: "Count days between dates or calculate end dates instantly. Perfect for tracking deadlines and events.",
    url: "https://toolstrek.vercel.app/tools/days-tracker",
    type: "website",
    siteName: "ToolsTrek",
    images: [{ url: "https://toolstrek.vercel.app/toolstrek-logo.png", width: 1200, height: 630, alt: "Days Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Days Tracker | ToolsTrek",
    description: "Count days between dates or track deadlines. Free online calculator.",
    images: ["https://toolstrek.vercel.app/toolstrek-logo.png"],
    site: "@toolstrek",
  },
  alternates: { canonical: "https://toolstrek.vercel.app/tools/days-tracker" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

const page = () => {
  return (
    <div>
      <DaysTracker></DaysTracker>
    </div>
  );
};

export default page;
