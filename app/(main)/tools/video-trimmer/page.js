import VideoTrimmer from "@/app/(main)/tools-compo/tools/video-trimmer/VideoTrimmer";
import { TRIM_FAQS } from "@/app/(main)/tools-compo/tools/video-trimmer/videoTrimData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/video-trimmer";

export const metadata = {
  title: "Video Trimmer - Cut Video & Audio Online Without Uploading",
  description:
    "Trim MP4, WebM, MKV, MOV, MP3, M4A, WAV, OGG or FLAC with frame-accurate in and out points. Preview the selection, resize or mute, then export MP4, WebM, MKV or audio-only files locally with WebCodecs. No upload, no watermark.",
  keywords:
    "video trimmer, trim video online, cut video, mp4 trimmer, webm trimmer, audio trimmer, trim mp3, video cutter, frame accurate trim, free video trimmer, no watermark video cutter, local video editing, webcodecs trimmer, video clipper",
  openGraph: {
    title: "Video Trimmer - Frame-Accurate Local Cuts | ToolsTrek",
    description:
      "Cut video and audio with precise in and out points, resize, mute and export locally. Your files never leave your device.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Video Trimmer by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Trimmer - Frame-Accurate Local Cuts | ToolsTrek",
    description: "Trim video and audio in your browser with WebCodecs. Private, free and watermark-free.",
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
            name: "Video Trimmer",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            description:
              "A free browser-based video and audio trimmer powered by MediaBunny and WebCodecs. Set precise in and out points, preview the selection, optionally resize, set bitrate or mute audio, and export MP4, WebM, MKV, M4A, MP3, WAV or OGG without uploading the source file.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Frame-accurate in and out points",
              "Scrubbable timeline with selection overlay",
              "Set in and out from the playhead",
              "Quick trim presets and 0.1-second nudging",
              "Loop the selected range in preview",
              "Export MP4, WebM or MKV video",
              "Export M4A, MP3, WAV or OGG audio",
              "Resolution presets from 360p to 4K",
              "Video bitrate control and audio removal",
              "Real-time export progress and cancellation",
              "Locally generated 10-second demo clip",
              "100% client-side processing with no uploads",
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
            mainEntity: TRIM_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <VideoTrimmer />
      </ToolPageShell>
    </div>
  );
};

export default page;
