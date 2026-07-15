import React from "react";
import SocialPreview from "./SocialPreview";

export const metadata = {
  title: "Social Media URL Preview Generator & Editor — ToolsTrek",
  keywords: [
    "social media preview",
    "url preview generator",
    "meta tag generator",
    "og tag tester",
    "open graph simulator",
    "twitter card preview",
    "facebook link preview",
    "seo metadata validator",
    "slack preview tester",
    "discord rich embed designer",
    "developer tools"
  ],
  description:
    "An advanced social media URL preview simulator and editor. Paste any link to parse metadata, or customize titles, descriptions, and images in real-time. View interactive card layouts for Facebook, X/Twitter, LinkedIn, Slack, Discord, and Google with advanced SEO audits and tag generation.",
};

const page = () => {
  return (
    <div>
      <SocialPreview />
    </div>
  );
};

export default page;
