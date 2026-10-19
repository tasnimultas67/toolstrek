import CountryVisitedMap from "@/app/(main)/tools-compo/tools/CountryVisitedMap";
import React from "react";

export const metadata = {
  title: "Visited Countries Map - Track Countries You've Been To",
  description:
    "Mark every country you've visited on an interactive world map and see what % of the world you've explored. Build your travel map, track countries automatically, and share it with friends. 100% free, privacy-first, runs entirely in your browser.",
  keywords: [
    "visited countries map",
    "countries visited tracker",
    "world map travel tracker",
    "travel map maker",
    "countries I have been to",
    "percentage of world visited",
    "travel map generator",
    "visited countries checker",
    "world travel map",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Visited Countries Map - Track Countries You've Been To",
    description:
      "Mark every country you've visited on an interactive world map and see what % of the world you've explored. Build your travel map and share it.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/country-visited-map",
    siteName: "ToolsTrek",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/country-visited-map.png",
        width: 1200,
        height: 630,
        alt: "ToolsTrek Visited Countries Map - Track every country you've been to",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visited Countries Map - Track Countries You've Been To",
    description:
      "Mark every country you've visited on an interactive world map and see what % of the world you've explored.",
    images: ["https://toolstrek.vercel.app/og/country-visited-map.png"],
    site: "@toolstrek",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/country-visited-map",
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
  category: "travel",
  authors: [{ name: "Tasnimul Haque" }],
  creator: "ToolsTrek",
  publisher: "ToolsTrek",
  formatDetection: {
    telephone: false,
  },
};

const page = () => {
  return (
    <div>
      {/* Structured data for the tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Visited Countries Map",
            applicationCategory: "Travel",
            description:
              "Interactive world map tracker to mark countries you've visited and see what percentage of the world you've explored.",
            url: "https://toolstrek.vercel.app/tools/country-visited-map",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <CountryVisitedMap />
    </div>
  );
};

export default page;
