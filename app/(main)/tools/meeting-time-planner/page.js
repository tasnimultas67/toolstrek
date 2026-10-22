import MeetingTimePlanner from "@/app/(main)/tools-compo/tools/meeting-time-planner/MeetingTimePlanner";
import { MEETING_FAQS } from "@/app/(main)/tools-compo/tools/meeting-time-planner/meetingTimeData";
import React from "react";

export const metadata = {
  title: "Meeting Time Planner - Find the Best Time Across Time Zones",
  description:
    "Find the best meeting time for teams in different time zones. Compare every slot against each participant's working hours, handle daylight saving automatically, see local times and date shifts, then copy the schedule or download an .ics calendar invite. Free and 100% private.",
  keywords:
    "meeting time planner, time zone meeting planner, best meeting time calculator, world clock meeting planner, schedule across time zones, international meeting planner, time zone converter for meetings, dst meeting planner, team meeting scheduler, calendar invite generator, ics meeting invite, global team scheduling",
  openGraph: {
    title: "Meeting Time Planner - Find the Best Time Across Time Zones",
    description:
      "Score every possible meeting slot against each participant's working hours, compare local times and send a calendar invite without uploading anything.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/meeting-time-planner",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/meeting-time-planner.jpg",
        width: 1200,
        height: 630,
        alt: "Meeting Time Planner by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meeting Time Planner - Find the Best Time Across Time Zones",
    description:
      "Compare working hours, daylight saving and date shifts for up to eight participants, then export a ready-to-send calendar invite.",
    images: ["https://toolstrek.vercel.app/og/meeting-time-planner.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/meeting-time-planner",
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
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Meeting Time Planner",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            description:
              "A time-zone-aware meeting planner that scores every slot against participant working hours, handles daylight saving and exports .ics calendar invites.",
            url: "https://toolstrek.vercel.app/tools/meeting-time-planner",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Up to eight participants with individual IANA time zones",
              "Working-hour, night, weekend and date-shift scoring",
              "Automatic daylight-saving and half-hour offset handling",
              "Hourly opportunity map and per-participant day timelines",
              "Search one day, five working days or a full week",
              "Configurable working window, weekdays and slot interval",
              "Copyable local-time summary and downloadable .ics invite",
              "100% client-side privacy",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: MEETING_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      <MeetingTimePlanner />
    </div>
  );
};

export default page;
