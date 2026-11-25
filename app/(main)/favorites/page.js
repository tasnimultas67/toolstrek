import React from "react";
import FavoritesClient from "./FavoritesClient";
import { SITE_URL } from "@/lib/siteConfig";

export const metadata = {
  title: "Favorite Tools",
  description:
    "Your curated collection of favorite online tools. Access your most used utilities quickly and easily on ToolsTrek.",
  alternates: { canonical: `${SITE_URL}/favorites` },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Favorite Tools - ToolsTrek",
    description:
      "Your curated collection of favorite online tools on ToolsTrek.",
    url: "https://toolstrek.vercel.app/favorites",
    type: "website",
  },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
