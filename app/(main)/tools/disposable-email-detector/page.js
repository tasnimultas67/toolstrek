import DisposableEmailDetector from "@/app/(main)/tools-compo/tools/DisposableEmailDetector";
import React from "react";

export const metadata = {
  title: "Disposable Email Detector | Verify Temporary Email Domains | ToolsTrek",
  description:
    "Free online disposable email detector and validator. Instantly verify syntax, check live MX records, identify role-based addresses, detect typos, and bulk scan lists of emails.",
  keywords: [
    "disposable email detector",
    "temporary email checker",
    "temp mail finder",
    "check fake email address",
    "bulk email validator",
    "dns mx record checker",
    "email verification tool",
    "email reputation score",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Disposable Email Detector | Verify Temporary Email Domains | ToolsTrek",
    description:
      "Detect temporary, disposable, and fake emails instantly. Run syntax validation, live DNS MX lookup, role checks, and bulk lists verification. Free & server-side checks.",
    type: "website",
    url: "https://toolstrek.com/tools/disposable-email-detector",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disposable Email Detector | Verify Temporary Email Domains | ToolsTrek",
    description:
      "Detect temporary, disposable, and fake emails instantly. Run syntax validation, live DNS MX lookup, role checks, and bulk lists verification. Free & server-side checks.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/disposable-email-detector",
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
            name: "Disposable Email Detector",
            description:
              "Identify temporary, disposable, and fake email addresses. Check syntax, MX records, role accounts, typos, and perform bulk scan verifications.",
            url: "https://toolstrek.com/tools/disposable-email-detector",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Standard email syntax validation",
              "Check against database of 74,000+ disposable domains",
              "Live DNS MX records lookup and verification",
              "Dynamic mail server hostname check for custom temp domains",
              "Role-based email prefix identification",
              "Common provider typo corrections and suggestions",
              "Bulk file uploads (CSV, TXT) with visual SVG charts",
              "Sandbox testing playground for domains"
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <DisposableEmailDetector />
    </div>
  );
};

export default page;
