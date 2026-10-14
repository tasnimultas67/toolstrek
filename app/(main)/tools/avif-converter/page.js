import AvifConverter from "@/app/(main)/tools-compo/tools/AvifConverter";
import React from "react";

export const metadata = {
  title: "AVIF to JPG/PNG Converter — Free Online Image Converter",
  description:
    "Convert AVIF images to high-quality JPG or PNG formats instantly in your browser. Free, secure, no upload required — 100% client-side processing.",
  keywords: [
    "AVIF converter",
    "AVIF to JPG",
    "AVIF to PNG",
    "image converter",
    "online image converter",
    "free image conversion",
    "ToolsTrek",
  ],
  openGraph: {
    title: "AVIF to JPG/PNG Converter | ToolsTrek",
    description: "Convert AVIF images to JPG or PNG in seconds. Free, browser-based, no sign-up.",
    url: "https://toolstrek.vercel.app/tools/avif-converter",
    type: "website",
    siteName: "ToolsTrek",
    images: [{ url: "https://toolstrek.vercel.app/toolstrek-logo.png", width: 1200, height: 630, alt: "AVIF Converter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AVIF Image Converter | ToolsTrek",
    description: "Convert AVIF to JPG/PNG instantly. Free & private.",
    images: ["https://toolstrek.vercel.app/toolstrek-logo.png"],
    site: "@toolstrek",
  },
  alternates: { canonical: "https://toolstrek.vercel.app/tools/avif-converter" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

const page = () => {
  return (
    <div>
      <AvifConverter />
    </div>
  );
};

export default page;
