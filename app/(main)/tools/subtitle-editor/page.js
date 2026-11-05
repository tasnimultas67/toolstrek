import SubtitleEditor from "@/app/(main)/tools-compo/tools/subtitle-editor/SubtitleEditor";
import { SUBTITLE_FAQS } from "@/app/(main)/tools-compo/tools/subtitle-editor/subtitleData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/subtitle-editor";

export const metadata = {
  title: "Subtitle Editor - Edit, Sync & Convert SRT / VTT Files",
  description:
    "Edit SRT and VTT subtitles online. Import a file, fix timing, shift or scale the timeline, correct frame-rate drift, replace text, validate reading speed, preview with a local video and export SRT, VTT, CSV or transcript.",
  keywords:
    "subtitle editor, srt editor, vtt editor, subtitle sync, srt sync tool, vtt converter, subtitle timing, subtitle converter, fix subtitle sync, fps subtitle converter, subtitle validator, srt to vtt, online subtitle editor",
  openGraph: {
    title: "Subtitle Editor - Edit, Sync & Convert SRT / VTT | ToolsTrek",
    description:
      "A private subtitle studio: import, retime, validate and export SRT or VTT with optional local video preview.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Subtitle Editor by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Subtitle Editor | ToolsTrek",
    description: "Edit, sync and convert SRT/VTT subtitles without uploading anything.",
    images: [OG_IMAGE],
  },
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
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
            name: "Subtitle (SRT/VTT) Editor & Sync",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            description:
              "A browser-based subtitle editor for SRT and WebVTT files with cue editing, timeline shifting, scaling, frame-rate conversion, find and replace, validation, local video preview and multi-format export.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank editor by default with optional demo data",
              "Import SRT, VTT or JSON",
              "Edit cue start, end and text",
              "Shift and scale the whole timeline",
              "Frame-rate conversion for 23.976, 24, 25, 29.97, 30 and more",
              "Find and replace across cues",
              "Overlap, duration, reading-speed and line-length validation",
              "Optional local video preview with cue overlay",
              "Export SRT, VTT, CSV, transcript and JSON",
              "Local autosave with no uploads",
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
            mainEntity: SUBTITLE_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <SubtitleEditor />
      </ToolPageShell>
    </div>
  );
};

export default page;
