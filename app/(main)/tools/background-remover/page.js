import React from "react";
import BackgroundRemover from "@/app/(main)/tools-compo/tools/BackgroundRemover";

export const metadata = {
  title: "Background Remover - Transparent Cutouts in Your Browser",
  description:
    "Remove image backgrounds online for free without uploading your photos. Use an AI portrait model for people and pets or a precise colour key for products and screenshots, refine edges and despill colour fringes, then build transparent, solid, gradient, blurred or custom backdrops with padding, shadows, aspect-ratio presets and PNG, WebP or JPEG export. 100% browser-based.",
  keywords: [
    "background remover",
    "remove background",
    "remove image background",
    "transparent background maker",
    "cutout image",
    "ai background remover",
    "product background remover",
    "portrait cutout",
    "change photo background",
    "transparent png maker",
    "background eraser",
    "remove white background",
    "image cutout tool",
    "free background remover",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Background Remover - AI & Colour Cutouts Without Uploads",
    description:
      "Remove backgrounds locally with an AI portrait model or precise colour key. Add transparent, studio, gradient, blurred or custom backdrops, refine edges and shadows, and export PNG, WebP or JPEG.",
    url: "https://toolstrek.vercel.app/tools/background-remover",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Background Remover - AI Cutouts | ToolsTrek",
    description:
      "Create transparent cutouts in your browser. AI portrait removal, colour-key mode for products, edge refinement, shadows, aspect ratios and custom backdrops.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/background-remover",
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
            name: "Background Remover",
            description:
              "Free browser-based background remover with an AI portrait model and a colour-key studio. Refine edges, despill colour fringes, compose transparent or custom backdrops, and export PNG, WebP or JPEG without uploading images.",
            url: "https://toolstrek.vercel.app/tools/background-remover",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "AI portrait cutout with the MODNet model running locally",
              "Offline colour-key removal for products and screenshots",
              "Sample background colour from image corners",
              "Alpha feather, contrast, edge shift and colour despill",
              "Transparent, solid, gradient, blurred and custom backgrounds",
              "Aspect-ratio presets for square, portrait, landscape and stories",
              "Padding, subject scale, position and drop-shadow controls",
              "PNG, WebP and JPEG export at 1×, 1.5× or 2×",
              "No image uploads, accounts or watermarks",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <BackgroundRemover />
    </div>
  );
};

export default page;
