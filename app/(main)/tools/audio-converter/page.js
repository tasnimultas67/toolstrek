import React from "react";
import AudioConverter from "@/app/(main)/tools-compo/tools/AudioConverter";

export const metadata = {
  title: "Audio Converter - Convert MP3, WAV & OGG in Your Browser",
  description:
    "Convert audio files between MP3, WAV and OGG formats with bitrate, sample rate and channel settings. Trim, normalize and add fade in/out — all 100% client-side, no uploads.",
  keywords: [
    "audio converter",
    "convert mp3",
    "convert wav",
    "convert ogg",
    "audio format converter",
    "trim audio",
    "normalize audio",
    "audio fade in out",
    "reduce audio size",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Audio Converter - Convert MP3, WAV & OGG in Your Browser",
    description:
      "Convert audio files between MP3, WAV and OGG formats with bitrate, sample rate and channel settings. Trim, normalize and add fade in/out — all 100% client-side, no uploads.",
    url: "https://toolstrek.vercel.app/tools/audio-converter",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Audio Converter - Convert MP3, WAV & OGG | ToolsTrek",
    description:
      "Convert audio files between MP3, WAV and OGG formats with bitrate, sample rate and channel settings. Trim, normalize and add fade in/out — all 100% client-side, no uploads.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/audio-converter",
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
            name: "Audio Converter",
            description:
              "Convert audio files between MP3, WAV and OGG formats with bitrate, sample rate and channel settings. Trim, normalize and add fade in/out — all 100% client-side, no uploads.",
            url: "https://toolstrek.vercel.app/tools/audio-converter",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "100% client-side audio conversion with no uploads",
              "MP3, WAV and OGG format support",
              "Bitrate selection (32 kbps – 320 kbps)",
              "Sample rate and channel configuration",
              "Trim start/end silence",
              "Peak normalization to 95%",
              "Fade in / fade out effects",
              "Download converted file instantly",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <AudioConverter />
    </div>
  );
};

export default page;