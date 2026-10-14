import ShortenerForm from "@/app/(main)/tools-compo/ShortenerForm";
import React from "react";
export const metadata = {
  title: "Free URL Shortener — Shorten Any Link Instantly",
  description:
    "Shorten long URLs into clean, shareable short links for free. No sign-up required. Perfect for social media, emails, and marketing campaigns.",
  keywords: [
    "URL shortener",
    "link shortener",
    "free link shortener",
    "short URL",
    "shorten link",
    "custom short link",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Free URL Shortener — Shorten Any Link Instantly | ToolsTrek",
    description:
      "Turn long URLs into short, clean links instantly. Free, no registration, works for social media, emails, and marketing.",
    url: "https://toolstrek.vercel.app/tools/link-shortner",
    type: "website",
    siteName: "ToolsTrek",
    images: [
      {
        url: "https://toolstrek.vercel.app/Link-shortener.svg",
        width: 1200,
        height: 630,
        alt: "ToolsTrek Free URL Shortener",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free URL Shortener | ToolsTrek",
    description: "Shorten any URL instantly, free & no sign-up required.",
    images: ["https://toolstrek.vercel.app/Link-shortener.svg"],
    site: "@toolstrek",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/link-shortner",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const page = () => {
  return <ShortenerForm />;
};

export default page;
