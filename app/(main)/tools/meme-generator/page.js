import MemeGeneratorStudio from "@/app/(main)/tools-compo/tools/meme-generator/MemeGeneratorStudio";
import { MEME_FAQS } from "@/app/(main)/tools-compo/tools/meme-generator/memeData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/meme-generator";

export const metadata = {
  title: "Meme Generator - Free Online Meme Maker with Custom Text",
  description:
    "Create memes online with a real canvas editor. Upload a photo or use a gradient background, add unlimited text layers, drag captions, style fonts, outlines and gradients, then export PNG, JPEG or WebP up to 3× resolution. No uploads.",
  keywords:
    "meme generator, free meme maker, online meme creator, meme editor, add text to image, impact font meme, meme caption generator, custom meme, image to meme, social media meme maker, meme generator no watermark, private meme maker",
  openGraph: {
    title: "Meme Generator - Canvas Meme Editor | ToolsTrek",
    description:
      "Unlimited text layers, draggable captions, gradients, outlines and 3× export. Your images never leave your device.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Meme Generator by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meme Generator - Canvas Meme Editor | ToolsTrek",
    description: "Build and export memes locally with full text styling and no watermarks.",
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
            name: "Meme Generator",
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            description:
              "A browser-based meme editor with unlimited draggable text layers, custom fonts, gradient fills, outlines, shadows, highlight boxes, image framing and high-resolution PNG, JPEG or WebP export.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank canvas by default with optional demo data",
              "Unlimited draggable text layers",
              "Impact, Arial Black, serif, monospace and comic fonts",
              "Gradient text fill, outline, shadow and highlight box",
              "Rotation, opacity, line height and letter spacing",
              "Image upload, clipboard paste and drag-and-drop",
              "Cover or contain framing with zoom, offset, blur and opacity",
              "Square, portrait, landscape and story canvas presets",
              "PNG, JPEG and WebP export at 1×, 2× or 3×",
              "Copy the finished meme straight to the clipboard",
              "JSON project export and import with local autosave",
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
            mainEntity: MEME_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <MemeGeneratorStudio />
      </ToolPageShell>
    </div>
  );
};

export default page;
