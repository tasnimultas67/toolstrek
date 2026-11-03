import VideoToGifStudio from "@/app/(main)/tools-compo/tools/video-to-gif/VideoToGifStudio";
import { GIF_FAQS } from "@/app/(main)/tools-compo/tools/video-to-gif/videoGifData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/video-to-gif";

export const metadata = {
  title: "Video to GIF Converter - Free, Private & No Watermark",
  description:
    "Convert MP4, WebM, MOV, MKV or OGG video to GIF in your browser. Trim the exact range, set frame rate, width, speed, dithering and ping-pong loops, then download a clean GIF. No uploads, no watermark, no account.",
  keywords:
    "video to gif, convert video to gif, mp4 to gif, gif converter, video to animated gif, trim video to gif, free gif converter, no watermark gif, video to gif online, webm to gif, high quality gif maker, private gif converter",
  openGraph: {
    title: "Video to GIF Converter - Local & Watermark-Free | ToolsTrek",
    description:
      "Turn any video moment into a looping GIF with frame-accurate trimming, custom FPS, ping-pong loops and local encoding.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Video to GIF Converter by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video to GIF Converter - Local & Watermark-Free | ToolsTrek",
    description: "Trim video and encode GIF entirely in your browser. Free, private and watermark-free.",
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
            name: "Video to GIF Converter",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            description:
              "A free browser-based video to GIF converter. Load an MP4, WebM, MOV, MKV or OGG file, choose a precise start and end point, set the frame rate, width, speed, quality, dithering and loop count, then encode locally with gif.js and download the finished animation.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Frame-accurate start and end points",
              "Timeline scrubber with selection highlighting",
              "Output width presets from 360 to 1080 pixels",
              "Frame rates from 5 to 30 fps",
              "Playback speed from 0.5× to 2×",
              "Ping-pong forward-and-back loops",
              "Floyd–Steinberg dithering and palette quality control",
              "Infinite or custom loop count",
              "Letterbox or fill-frame video fitting",
              "Local GIF preview with file size and frame statistics",
              "Current frame export as PNG",
              "Locally generated demo clip",
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
            mainEntity: GIF_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <VideoToGifStudio />
      </ToolPageShell>
    </div>
  );
};

export default page;
