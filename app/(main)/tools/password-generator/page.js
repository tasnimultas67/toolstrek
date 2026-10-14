import React from "react";
import PasswordFunc from "./PasswordFunc";

export const metadata = {
  title: "Password Generator — Create Strong, Secure Passwords Instantly",
  keywords: ["password generator", "strong password", "random password", "secure password maker", "free password tool", "ToolsTrek"],
  description:
    "Generate strong, random passwords instantly. Customize length, character types, and complexity. 100% client-side — your passwords never leave your browser.",
  openGraph: {
    title: "Free Password Generator — Strong & Secure | ToolsTrek",
    description: "Create strong, random passwords with custom length and character options. Completely private — no data sent to servers.",
    url: "https://toolstrek.vercel.app/tools/password-generator",
    type: "website",
    siteName: "ToolsTrek",
    images: [{ url: "https://toolstrek.vercel.app/toolstrek-logo.png", width: 1200, height: 630, alt: "Password Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Password Generator | ToolsTrek",
    description: "Generate strong passwords instantly. Fully private, runs in your browser.",
    images: ["https://toolstrek.vercel.app/toolstrek-logo.png"],
    site: "@toolstrek",
  },
  alternates: { canonical: "https://toolstrek.vercel.app/tools/password-generator" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

const page = () => {
  return (
    <div>
      <PasswordFunc></PasswordFunc>
    </div>
  );
};

export default page;
