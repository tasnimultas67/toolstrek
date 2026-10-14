import CalendarGenerator from "@/app/(main)/tools-compo/tools/CalendarGenerator";
import React, { Suspense } from "react";

export const metadata = {
  title: "Custom Calendar Generator — Print & Download PDF/PNG (2027 & Beyond) | ToolsTrek",
  description:
    "Free online advanced custom calendar generator. Design and download full-year or monthly calendars with custom paper sizes (A4, A3, US Letter, custom mm/in), official holidays for 10+ countries, custom personal events, astronomical moon phases, ISO week numbers, designer themes, and crisp PDF & image exports.",
  keywords: [
    "calendar generator",
    "custom calendar maker",
    "time and date custom calendar",
    "printable calendar 2027",
    "2027 calendar pdf",
    "free printable calendar",
    "custom page size calendar",
    "annual calendar generator",
    "wall calendar maker",
    "monthly desk calendar",
    "holiday calendar",
    "moon phase calendar",
    "iso week number calendar",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Custom Calendar Generator — Build, Customize & Export PDF/PNG",
    description:
      "Design personalized calendars with custom page sizes, official holidays, personal events, moon phases, and instant high-res PDF & PNG download.",
    url: "https://toolstrek.vercel.app/tools/calendar-generator",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Calendar Generator — Print & Download PDF/PNG",
    description:
      "Advanced custom calendar studio: custom page sizes, holidays, personal events, moon phases, and PDF/image export.",
  },
};

export default function CalendarGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CalendarGenerator />
    </Suspense>
  );
}
