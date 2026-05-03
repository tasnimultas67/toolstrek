import FakeInfoGenerator from "@/app/(main)/tools-compo/tools/FakeInfoGenerator";
import React from "react";

export const metadata = {
  title: "Fake Info Generator | ToolsTrek",
  description:
    "Generate random and realistic fake user data, personal info, and test data quickly for your development and testing needs with ToolsTrek.",
  keywords: [
    "fake info generator",
    "random user generator",
    "test data generator",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Fake Info Generator | ToolsTrek",
    description:
      "Generate random and realistic fake user data, personal info, and test data quickly for your development and testing needs with ToolsTrek.",
    url: "https://toolstrek.vercel.app", // Update with your specific route path if needed, e.g., /fake-info
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fake Info Generator | ToolsTrek",
    description:
      "Generate random and realistic fake user data, personal info, and test data quickly for your development and testing needs with ToolsTrek.",
  },
};

const page = () => {
  return (
    <div>
      {/* Fake user data generator */}
      <FakeInfoGenerator />
    </div>
  );
};

export default page;
