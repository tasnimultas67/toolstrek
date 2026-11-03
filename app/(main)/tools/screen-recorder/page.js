import ScreenRecorder from "@/app/(main)/tools-compo/tools/screen-recorder/ScreenRecorder";
import { RECORDER_FAQS } from "@/app/(main)/tools-compo/tools/screen-recorder/recorderData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/screen-recorder";

export const metadata = {
  title: "Screen Recorder - Free Online Screen Capture with Audio",
  description:
    "Record your screen, a window or a browser tab with system audio and microphone narration. Add a webcam bubble, timer or watermark, choose WebM or MP4, and download instantly. No uploads, no account and no time limit.",
  keywords:
    "screen recorder, free screen recorder, online screen recording, record screen with audio, tab recorder, webcam screen recorder, browser screen capture, no watermark screen recorder, record chrome tab, screen recording tool, webm recorder, mp4 screen recorder",
  openGraph: {
    title: "Screen Recorder - Free Local Screen Capture | ToolsTrek",
    description:
      "Capture your screen, window or tab with mic and system audio, webcam overlay and local WebM or MP4 export.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Screen Recorder by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Screen Recorder - Free Local Screen Capture | ToolsTrek",
    description: "Record screen or tab with audio, webcam bubble and overlays. 100% local, no uploads.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: PAGE_URL,
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
            name: "Screen Recorder",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            description:
              "A free browser-based screen recorder using getDisplayMedia and MediaRecorder. Records a screen, window or tab with system and microphone audio, optional webcam picture-in-picture, clock and watermark overlays, resolution and bitrate controls, and local WebM or MP4 download.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Record entire screen, application window or browser tab",
              "System audio and microphone capture mixed into one track",
              "Optional circular webcam overlay with size and corner controls",
              "Optional live clock and watermark overlays",
              "Resolution presets from 480p to 4K",
              "Frame rate and video bitrate controls",
              "WebM VP9, VP8, H.264 and MP4 output where supported",
              "Pause, resume and countdown before recording",
              "In-memory recording list with preview and download",
              "Optional automatic pause when the tab is hidden",
              "100% client-side privacy with no uploads",
            ],
            creator: { "@type": "Organization", name: "ToolsTrek" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: RECORDER_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <ScreenRecorder />
      </ToolPageShell>
    </div>
  );
};

export default page;
