import React from "react";
import GifMaker from "@/app/(main)/tools-compo/tools/GifMaker";

export const metadata = {
  title: "GIF Maker - Create Animated GIFs Online | Free Tool",
  description:
    "Create animated GIFs from images directly in your browser. Upload frames, set delays, control loops, apply effects like ping-pong and dithering, and download high-quality GIFs instantly. 100% private — no uploads to servers.",
  keywords: [
    "gif maker",
    "create gif",
    "animated gif",
    "gif creator online",
    "image to gif",
    "free gif maker",
    "animated image maker",
    "gif from photos",
    "ToolsTrek",
  ],
  openGraph: {
    title: "GIF Maker - Create Animated GIFs Online Free",
    description:
      "Upload images, arrange frames, set animation speed and effects — download your animated GIF in seconds. All processing happens in your browser.",
    url: "https://toolstrek.vercel.app/tools/gif-maker",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIF Maker - Online Animated GIF Creator | ToolsTrek",
    description:
      "Create animated GIFs from images instantly in your browser. No signup required.",
  },
};

const page = () => {
  return <GifMaker />;
};

export default page;
