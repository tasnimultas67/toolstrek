// app/(main)/tools/task-prioritizer/page.js
import TaskPrioritizer from "@/app/(main)/tools-compo/tools/TaskPrioritizer";
import React, { Suspense } from "react";

export const metadata = {
  title: "Task Prioritizer & Eisenhower Decision Matrix Studio",
  description:
    "Free online Task Prioritizer and Eisenhower Decision Matrix Studio. Organize tasks by urgency and importance (Do First, Schedule, Delegate, Eliminate), calculate Action Priority ROI, view Kanban boards, track deadlines, and export to CSV, JSON, PNG, or Markdown.",
  keywords: [
    "task prioritizer",
    "eisenhower matrix",
    "eisenhower matrix online",
    "priority matrix",
    "urgent important matrix",
    "task priority tool",
    "action priority matrix",
    "moscow prioritization",
    "to do prioritizer",
    "productivity matrix",
    "task manager",
    "decision matrix",
    "eisenhower box",
    "time management matrix",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Task Prioritizer & Eisenhower Matrix Studio | ToolsTrek",
    description:
      "Sort tasks into Do First, Schedule, Delegate, or Eliminate. Boost focus, eliminate firefighting, and export high-res matrix cards.",
    url: "https://toolstrek.vercel.app/tools/task-prioritizer",
    siteName: "ToolsTrek",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Task Prioritizer & Eisenhower Matrix Studio | ToolsTrek",
    description:
      "Free online Eisenhower Matrix and Action Priority task prioritizer with client-side persistence and multi-format exports."
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/task-prioritizer"
  }
};

export default function TaskPrioritizerPage() {
  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Task Prioritizer & Eisenhower Matrix Studio",
            description:
              "Free online Task Prioritizer and Eisenhower Decision Matrix Studio. Sort tasks across Urgency vs. Importance (Do First, Schedule, Delegate, Eliminate), Action Priority (Impact vs. Effort), and MoSCoW frameworks with 2×2 grid, Kanban board, and multi-format exports.",
            url: "https://toolstrek.vercel.app/tools/task-prioritizer",
            applicationCategory: "ProductivityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD"
            },
            featureList: [
              "Eisenhower Matrix 2×2 decision grid (Do First, Schedule, Delegate, Eliminate)",
              "Action Priority Matrix (Impact vs. Effort for maximum ROI)",
              "MoSCoW Matrix (Must Have, Should Have, Could Have, Won't Have)",
              "Kanban 4-column flow board and Ranked Priority List views",
              "Executive Matrix Health score & real-time Covey productivity coaching advice",
              "Single-quadrant Zen Focus mode",
              "Subtask checklists and estimated Pomodoro duration counters",
              "Web Audio API sound cues for task addition, completion, moving, and deletion",
              "High-resolution PNG matrix card exporter rendered via HTML5 Canvas",
              "Multi-format export to CSV, JSON, and formatted Markdown",
              "100% private, client-side localStorage persistence with zero server tracking"
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek"
            }
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://toolstrek.vercel.app"
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Productivity",
                item: "https://toolstrek.vercel.app/tools?category=productivity"
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Task Prioritizer",
                item: "https://toolstrek.vercel.app/tools/task-prioritizer"
              }
            ]
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
        <TaskPrioritizer />
      </Suspense>
    </>
  );
}
