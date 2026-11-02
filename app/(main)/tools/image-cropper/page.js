import ImageCropper from "@/app/(main)/tools-compo/tools/image-cropper/ImageCropper";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import { CROP_FAQS } from "@/app/(main)/tools-compo/tools/image-cropper/cropperData";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/image-cropper";

export const metadata = {
  title: "Image Cropper - Crop, Resize, Rotate & Straighten Photos Online",
  description:
    "Crop images online for free with pixel-perfect control. Lock any aspect ratio, use social media presets, zoom and pan, rotate, flip and straighten, then export at full source resolution as PNG, JPEG or WebP. All processing happens in your browser — nothing is uploaded.",
  keywords:
    "image cropper, crop image online, free image cropper, photo cropper, crop photo, aspect ratio cropper, instagram crop, youtube thumbnail cropper, rotate image, straighten photo, flip image, crop png, crop jpeg, crop webp, image crop tool, circle crop, social media image resizer",
  openGraph: {
    title: "Image Cropper - Crop, Resize, Rotate & Straighten Photos Online",
    description:
      "Pixel-perfect cropping with aspect ratio locks, social presets, rotate, flip, straighten and full-resolution export — entirely in your browser.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Image Cropper by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Cropper - Crop, Resize, Rotate & Straighten Photos Online",
    description:
      "Crop, straighten, rotate and resize photos with social presets and full-resolution local export.",
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
            name: "Image Cropper",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            description:
              "A browser-based image cropper with aspect ratio locks, social media presets, zoom and pan, rotate, flip, straighten, grids and full-resolution export as PNG, JPEG or WebP.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Drag, resize and nudge the crop box with pixel precision",
              "Aspect ratio lock with ten common ratios",
              "Social and print presets for Instagram, YouTube, LinkedIn, X and more",
              "Zoom and pan the image beneath a fixed crop box",
              "Rotate in 90 degree steps, flip horizontally or vertically, straighten by ±15 degrees",
              "Rule-of-thirds, golden-ratio and fine grids",
              "Numeric crop position and size fields",
              "Export as PNG, JPEG or WebP with quality control",
              "Native or custom output width with upscale warnings",
              "Drag-and-drop, file picker and clipboard paste",
              "100% client-side privacy",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: CROP_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      <ToolPageShell widthClassName="max-w-none">
        <ImageCropper />
      </ToolPageShell>
    </div>
  );
};

export default page;
