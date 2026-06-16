import React from "react";
import RecentClient from "./RecentClient";

export const metadata = {
  title: "Recently Used Tools - ToolsTrek",
  description:
    "View your recently accessed utilities and tools on ToolsTrek. Jump back in quickly or clear your history anytime.",
  openGraph: {
    title: "Recently Used Tools - ToolsTrek",
    description:
      "Access your recently used utilities quickly and easily on ToolsTrek.",
    url: "https://toolstrek.vercel.app/recent",
    type: "website",
  },
};

export default function RecentPage() {
  return <RecentClient />;
}
