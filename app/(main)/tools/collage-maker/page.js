import React from "react";
import CollageMaker from "@/app/(main)/tools-compo/tools/CollageMaker";

export const metadata = {
  title: "Collage Maker - Combine Photos into Grids & Layouts Online",
  description:
    "Create beautiful photo collages in your browser. Grid, masonry and polaroid layouts with customizable spacing, corners, backgrounds and shadows. Drag to reorder. 100% client-side.",
  keywords: ["collage maker", "photo collage", "combine images", "image grid", "photo grid maker", "create collage", "ToolsTrek"],
  openGraph: {
    title: "Collage Maker - Build Photo Collages in Your Browser",
    description: "Combine multiple images into grids, masonry and polaroid layouts. Fully customizable.",
    url: "https://toolstrek.vercel.app/tools/collage-maker",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collage Maker | ToolsTrek",
    description: "Combine photos into beautiful collages in your browser.",
  },
  alternates: { canonical: "https://toolstrek.vercel.app/tools/collage-maker" },
};

const page = () => (
  <div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "WebApplication", name: "Collage Maker",
      description: "Free browser-based collage maker with grid, masonry and polaroid layouts.",
      url: "https://toolstrek.vercel.app/tools/collage-maker", applicationCategory: "MultimediaApplication", operatingSystem: "All",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      creator: { "@type": "Organization", name: "ToolsTrek" },
    }) }} />
    <CollageMaker />
  </div>
);

export default page;
