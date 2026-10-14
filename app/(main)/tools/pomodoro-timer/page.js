import PomodoroTimer from "@/app/(main)/tools-compo/tools/PomodoroTimer";
import React, { Suspense } from "react";

export const metadata = {
  title: "Pomodoro Timer — Productivity & Deep Work Studio | ToolsTrek",
  description:
    "Free online Pomodoro focus timer with customizable intervals, synthesized ambient audio (brown noise, rain, 40Hz gamma tone), integrated task sprint estimation, daily streak analytics, and distraction-free Zen mode.",
  keywords: [
    "pomodoro timer",
    "online pomodoro timer",
    "pomodoro technique",
    "focus timer",
    "study timer",
    "deep work timer",
    "productivity timer",
    "ambient focus sounds",
    "brown noise timer",
    "timeboxing timer",
    "task timer",
    "tomato timer",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Pomodoro Timer — Productivity & Deep Work Studio | ToolsTrek",
    description:
      "Boost cognitive focus and crush procrastination with high-precision timeboxing, offline ambient soundscapes, sprint task management, and streak tracking.",
    url: "https://toolstrek.vercel.app/tools/pomodoro-timer",
    siteName: "ToolsTrek",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Pomodoro Timer | ToolsTrek",
    description:
      "Free online Pomodoro focus timer with synthesized ambient noise, task estimation, and distraction-free Zen mode."
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/pomodoro-timer"
  }
};

export default function PomodoroTimerPage() {
  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Pomodoro Timer",
            description:
              "Free online Pomodoro focus timer with customizable intervals, synthesized ambient soundscapes (brown noise, rain, 40Hz gamma tone), task sprint management, daily streak analytics, and Zen fullscreen mode.",
            url: "https://toolstrek.vercel.app/tools/pomodoro-timer",
            applicationCategory: "UtilityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD"
            },
            featureList: [
              "Customizable Focus (1-120m), Short Break (1-60m), and Long Break (1-90m) intervals",
              "Drift-resistant timestamp delta countdown engine that never slows down in background tabs",
              "Integrated Sprint Task Manager with Pomodoro estimation and active task linkage",
              "Synthesized ambient focus audio (Brown noise, Pink noise, White noise, Rain, 40Hz Gamma focus tone)",
              "Web Audio API harmonic alert chimes (Zen Tibetan singing bowl, modern bell, marimba, digital beep)",
              "Distraction-free Fullscreen Zen Mode with dark backdrop and keyboard navigation",
              "Keyboard hotkeys ([Space] Start/Pause, [Alt+S] Skip, [Alt+R] Reset, [F] Zen Fullscreen, [M] Mute)",
              "Productivity Analytics, daily focus time tracking, and streak counter",
              "Multi-format session history export to CSV and JSON",
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
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <PomodoroTimer />
      </Suspense>
    </>
  );
}
