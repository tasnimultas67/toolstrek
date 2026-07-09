import MediaFormatConverter from "@/app/(main)/tools-compo/tools/MediaFormatConverter";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

export const metadata = {
  title: "Media Format Converter | ToolsTrek",
  description:
    "Convert video and audio files (MP4, WebM, MKV, MOV, MP3, WAV, OGG, FLAC) directly in your browser. Local, private, and hardware-accelerated transcoding powered by MediaBunny.",
  keywords: [
    "media format converter",
    "video format converter",
    "audio converter",
    "transcode mp4",
    "webm converter",
    "extract audio from video",
    "trim video online",
    "convert wav to mp3",
    "local transcoding",
    "webcodecs",
    "developer tools",
  ],
  openGraph: {
    title: "Media Format Converter — High-Performance Local Transcoding | ToolsTrek",
    description:
      "Convert, trim, crop, and adjust video or audio files directly in your browser using hardware-accelerated WebCodecs. 100% private, zero uploads.",
    url: "https://toolstrek.vercel.app/tools/media-format-converter",
    type: "website",
  },
};

const page = () => {
  return (
    <ToolPageShell>
      <MediaFormatConverter />
    </ToolPageShell>
  );
};

export default page;
