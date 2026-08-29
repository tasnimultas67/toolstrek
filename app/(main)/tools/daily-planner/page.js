import DailyPlanner from "@/app/(main)/tools-compo/tools/DailyPlanner";
import React from "react";

export const metadata = {
  title: "Daily Planner & Time-Blocking Studio — ToolsTrek",
  description:
    "Free online customizable Daily Planner and Time-Blocking Studio. Plan your day with hourly time-blocks, Eisenhower Matrix, Top 3 Frog priorities, habit & routine tracking, water & mood logging, integrated Pomodoro timer with ambient sounds, customizable themes, and printable PDF planner sheets.",
  keywords: [
    "daily planner",
    "online daily planner",
    "time blocking planner",
    "daily schedule maker",
    "eisenhower matrix tool",
    "pomodoro daily planner",
    "habit tracker",
    "routine checklist",
    "printable daily planner",
    "daily task organizer",
    "productivity planner",
    "time management dashboard",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Daily Planner & Time-Blocking Studio — ToolsTrek",
    description:
      "Modern, customizable Daily Planner with hourly time-blocking, Eisenhower matrix, habits, hydration, Pomodoro focus timer with ambient soundscapes, and printable PDF export.",
    url: "https://toolstrek.vercel.app/tools/daily-planner",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Planner & Time-Blocking Studio — ToolsTrek",
    description:
      "Supercharge your focus with an all-in-one daily planner: time-blocking, top 3 frog priorities, routines, Pomodoro ambient sounds, and printable sheets.",
  },
};

export default function DailyPlannerPage() {
  return (
    <div>
      <DailyPlanner />
    </div>
  );
}
