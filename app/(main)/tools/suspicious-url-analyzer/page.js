import SuspiciousUrlAnalyzer from "@/app/(main)/tools-compo/tools/suspicious-url-analyzer/SuspiciousUrlAnalyzer";
import { URL_FAQS } from "@/app/(main)/tools-compo/tools/suspicious-url-analyzer/urlRiskData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/suspicious-url-analyzer";

export const metadata = {
  title: "Suspicious URL Analyzer - Check a Link for Phishing & Scam Risk",
  description:
    "Analyze any URL for phishing, look-alike domains, punycode, open redirects, dangerous file types and other scam signals. Get a live risk score, plain-language explanations, bulk scanning and custom detection rules — all locally in your browser.",
  keywords:
    "suspicious url analyzer, check url safety, phishing link checker, scam url checker, url risk score, malicious link scanner, lookalike domain checker, punycode checker, homograph attack detector, open redirect checker, check link before clicking, url reputation check, bulk url scanner, suspicious link detector",
  openGraph: {
    title: "Suspicious URL Analyzer - Check a Link Before You Click | ToolsTrek",
    description:
      "A private, browser-based URL risk analyzer with 27 detectors, live scoring, bulk scanning and fully customizable rules.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Suspicious URL Analyzer by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suspicious URL Analyzer | ToolsTrek",
    description:
      "Check any link for phishing, homograph domains, redirects and malware-delivery patterns without opening it.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: PAGE_URL,
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
};

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Suspicious URL Analyzer",
            applicationCategory: "SecurityApplication",
            operatingSystem: "Any",
            description:
              "A browser-based URL risk analyzer that inspects phishing, homograph, redirect and malware-delivery patterns without visiting the destination.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "27 structural and reputation detectors",
              "Live weighted risk score with five risk levels",
              "Punycode and mixed-script homograph detection",
              "Brand impersonation checks against official domains",
              "Open-redirect, dangerous file type and double-extension detection",
              "URL anatomy breakdown with registrable domain",
              "Bulk scanning with filtering and CSV/JSON export",
              "Individually toggleable detectors and sensitivity control",
              "Custom risky TLD, keyword, allow and block lists",
              "No URL is opened, uploaded or requested",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: URL_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      <ToolPageShell widthClassName="max-w-none">
        <SuspiciousUrlAnalyzer />
      </ToolPageShell>
    </div>
  );
};

export default page;
