import VideoDownloader from "@/app/(main)/tools-compo/tools/VideoDownloader";
import React from "react";

export const metadata = {
  title: "Free Video Downloader | YouTube, Facebook, TikTok & 20+ Sites | ToolsTrek",
  description:
    "Download videos from YouTube, Facebook, Instagram, TikTok, Twitter, Vimeo, Reddit and 20+ other platforms for free. Paste any video URL and save it as MP4 or audio-only MP3. No signup, no watermark.",
  keywords: [
    "video downloader",
    "youtube downloader",
    "facebook video downloader",
    "instagram video downloader",
    "tiktok downloader",
    "twitter video downloader",
    "mp4 download",
    "download video online",
    "free video downloader",
    "audio extractor",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Free Video Downloader | YouTube, Facebook, TikTok & 20+ Sites",
    description:
      "Download videos from 20+ platforms including YouTube, Facebook, TikTok, and Instagram. Choose quality, extract audio, and save instantly — 100% free.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/video-downloader",
    siteName: "ToolsTrek",
    images: [
      {
        url: "https://toolstrek.vercel.app/og-video-downloader.png",
        width: 1200,
        height: 630,
        alt: "ToolsTrek Video Downloader – Download from YouTube, Facebook, TikTok and more",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Downloader | YouTube, Facebook, TikTok & 20+ Sites",
    description:
      "Download videos from 20+ platforms. Choose quality up to 8K or extract audio as MP3. Paste URL and go — no login required.",
    images: ["https://toolstrek.vercel.app/og-video-downloader.png"],
    site: "@toolstrek",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/video-downloader",
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
  category: "technology",
  authors: [{ name: "Tasnimul Haque & Oracle Byte" }],
  creator: "ToolsTrek",
  publisher: "ToolsTrek",
};

const page = () => {
  return (
    <div>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Video Downloader",
            description:
              "Download videos from YouTube, Facebook, Instagram, TikTok, Twitter and 20+ other platforms. Choose quality up to 8K or extract audio as MP3, WAV, FLAC.",
            url: "https://toolstrek.vercel.app/tools/video-downloader",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Download from YouTube, Facebook, Instagram, TikTok, Twitter and 20+ platforms",
              "Video quality selection up to 8K (4320p)",
              "Audio-only extraction in MP3, WAV, OGG, FLAC, OPUS",
              "Automatic platform detection from URL",
              "No registration or login required",
              "No watermarks added",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <VideoDownloader />
    </div>
  );
};

export default page;
