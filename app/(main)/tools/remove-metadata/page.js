import RemoveMetadata from "@/app/(main)/tools-compo/tools/RemoveMetadata";
import React from "react";

export const metadata = {
  title: "Remove Metadata & EXIF Cleaner | Free Online Photo & PDF Privacy Scrubber",
  description:
    "Free online metadata remover and EXIF privacy cleaner. Strip GPS location coordinates, camera models, device serial numbers, author names, timestamps, and hidden tags from images (JPG, PNG, WebP) and PDF documents with 100% private in-browser batch processing.",
  keywords: [
    "remove metadata",
    "strip metadata",
    "exif remover",
    "remove exif data",
    "photo metadata cleaner",
    "remove gps from photo",
    "strip image metadata",
    "pdf metadata remover",
    "clean exif online",
    "image privacy scrubber",
    "photo location remover",
    "batch exif remover",
    "free metadata cleaner",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Remove Metadata & EXIF Cleaner | 1-Click Privacy Scrubber | ToolsTrek",
    description:
      "Strip sensitive GPS coordinates, camera serial numbers, author names, and hidden tracking metadata from photos and PDF documents. 100% private client-side batch processing.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/remove-metadata",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Metadata & EXIF Cleaner | 1-Click Privacy Scrubber | ToolsTrek",
    description:
      "Strip sensitive GPS coordinates, camera serial numbers, author names, and hidden tracking metadata from photos and PDF documents. 100% private client-side batch processing.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/remove-metadata",
  },
};

const page = () => {
  return (
    <div>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Remove Metadata & EXIF Cleaner",
            description:
              "Free online metadata remover and EXIF privacy cleaner. Strip GPS location tags, camera models, serial numbers, author details, and tracking footprints from images and PDF documents directly in your browser with zero server uploads.",
            url: "https://toolstrek.vercel.app/tools/remove-metadata",
            applicationCategory: "SecurityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "100% client-side privacy with zero cloud file uploads",
              "Lossless JPEG segment stripping without re-encoding compression artifacts",
              "Canvas pixel extraction for PNG, WebP, and other image formats",
              "Purges GPS coordinates (latitude, longitude, altitude) to prevent location tracking",
              "Removes camera make, model, lens profile, and body serial numbers",
              "Clears author, copyright, user comments, and software signatures",
              "PDF document metadata cleaner (Title, Author, Subject, Creator, Producer)",
              "Multi-file drag-and-drop batch processing with 1-click ZIP export",
              "Interactive metadata inspector before and after sanitization",
              "Sample demo photo generator with simulated EXIF/GPS tags",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <RemoveMetadata />
    </div>
  );
};

export default page;
