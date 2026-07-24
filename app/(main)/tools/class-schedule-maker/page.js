import ClassScheduleMaker from "@/app/(main)/tools-compo/tools/ClassScheduleMaker";
import React from "react";

export const metadata = {
  title: "Class Schedule Maker — Build & Export Your Weekly Timetable | ToolsTrek",
  description:
    "Create your perfect weekly class schedule with our free Class Schedule Maker. Add classes, choose from 6 stunning themes, and export as PDF or PNG image. Includes live preview, advanced settings, and customizable time slots.",
  keywords:
    "class schedule maker, weekly timetable maker, student schedule planner, college class schedule, timetable generator, schedule PDF export, academic planner, university timetable, course schedule builder",
  openGraph: {
    title: "Class Schedule Maker — Build & Export Your Weekly Timetable",
    description:
      "Build, customize, and export your weekly class schedule with live preview, 6 themes, and PDF/image export.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/class-schedule-maker",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/class-schedule-maker.jpg",
        width: 1200,
        height: 630,
        alt: "Class Schedule Maker Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Class Schedule Maker — Build & Export Your Weekly Timetable",
    description:
      "Build, customize, and export your weekly class schedule with live preview, 6 themes, and PDF/image export.",
    images: ["https://toolstrek.vercel.app/og/class-schedule-maker.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/class-schedule-maker",
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
  return <ClassScheduleMaker />;
};

export default page;
