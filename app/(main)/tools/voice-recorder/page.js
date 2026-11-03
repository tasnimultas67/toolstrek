import VoiceRecorderStudio from "@/app/(main)/tools-compo/tools/voice-recorder/VoiceRecorderStudio";
import { VOICE_FAQS } from "@/app/(main)/tools-compo/tools/voice-recorder/voiceRecorderData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/voice-recorder";

export const metadata = {
  title: "Voice Recorder, Mic Test & Camera Test - Free Online",
  description:
    "Record voice notes, test your microphone with a live dB meter and oscilloscope, and check your webcam with snapshots. Choose format, bitrate and audio processing, then download privately. No uploads, no account.",
  keywords:
    "voice recorder, online voice recorder, free voice recorder, microphone test, mic test online, camera test, webcam test, record audio in browser, voice memo online, mic level meter, webcam snapshot, audio recorder no upload, private voice recorder",
  openGraph: {
    title: "Voice Recorder, Mic Test & Camera Test | ToolsTrek",
    description:
      "Record voice notes, measure microphone quality and preview your webcam entirely in your browser. Private, free and fast.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Voice Recorder by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice Recorder, Mic Test & Camera Test | ToolsTrek",
    description: "Local voice recording, live microphone analysis and webcam snapshots with no uploads.",
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
            name: "Voice Recorder, Mic Test & Camera Test",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            description:
              "A private browser studio for recording voice notes with MediaRecorder, testing microphone levels with Web Audio, and checking a webcam with snapshots. Supports WebM, OGG, M4A and WAV output with bitrate, sample rate, channel and processing controls.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Voice recording with WebM, OGG, M4A and WAV output",
              "Pause, resume, countdown and rename takes",
              "Live waveform, level meter, peak and channel controls",
              "Microphone test with dB, noise floor, clipping and quality score",
              "Camera test with resolution selection and device switching",
              "Rule-of-thirds framing guides and mirrored preview",
              "Webcam snapshots as PNG downloads",
              "Synthetic demo audio and demo camera feed",
              "All media processed locally with no uploads",
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
            mainEntity: VOICE_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <VoiceRecorderStudio />
      </ToolPageShell>
    </div>
  );
};

export default page;
