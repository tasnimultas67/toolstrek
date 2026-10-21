import React from "react";
import ImageCompressor from "@/app/(main)/tools-compo/tools/ImageCompressor";

export const metadata = {
  title: "Image Compressor - Compress JPG, PNG & WebP Online",
  description:
    "Compress images online for free without uploading them. Reduce JPG, PNG, WebP and AVIF file sizes to an exact target, adjust quality and dimensions, batch-compress large photo queues without artificial caps, compare before and after previews, and download individually or as a ZIP. 100% browser-based.",
  keywords: [
    "image compressor",
    "compress image online",
    "compress jpg",
    "compress png",
    "compress webp",
    "reduce image size",
    "image size reducer",
    "compress image to 100kb",
    "compress image to 200kb",
    "bulk image compressor",
    "batch image compressor",
    "photo compressor",
    "optimize images",
    "image optimizer",
    "free image compressor",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Image Compressor - Reduce Image Size in Your Browser",
    description:
      "Compress JPG, PNG, WebP and AVIF images to an exact target size or quality level. Large batch queues with no artificial count or file-size caps, before/after previews and ZIP download — all local and private.",
    url: "https://toolstrek.vercel.app/tools/image-compressor",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Compressor - Compress Images Online | ToolsTrek",
    description:
      "Reduce image file sizes to an exact target without uploading. Batch-compress JPG, PNG, WebP and AVIF queues without artificial caps, with before/after previews and ZIP download.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/image-compressor",
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
            name: "Image Compressor",
            description:
              "Free browser-based image compressor for JPG, PNG, WebP and AVIF files. Target an exact file size, tune quality and dimensions, queue as many images as your browser can handle with no artificial batch or per-file limits, compare before and after, and download individually or as a ZIP.",
            url: "https://toolstrek.vercel.app/tools/image-compressor",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "100% client-side compression with no image uploads",
              "Target an exact file size in KB or MB",
              "Adjustable output quality and maximum width or height",
              "JPG, PNG, WebP and AVIF input support",
              "Optional JPEG, PNG and WebP output conversion",
              "Queue as many images as your browser can handle with per-file progress",
              "No artificial batch-count or per-file size caps",
              "Per-file progress, error reporting and retry",
              "Before and after preview for every image",
              "Download individual images or all results as a ZIP",
              "Automatic EXIF and GPS metadata removal",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <ImageCompressor />
    </div>
  );
};

export default page;
