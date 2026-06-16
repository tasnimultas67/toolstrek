import React from "react";
import FavoritesClient from "./FavoritesClient";

export const metadata = {
  title: "Favorite Tools - ToolsTrek",
  description:
    "Your curated collection of favorite online tools. Access your most used utilities quickly and easily on ToolsTrek.",
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
