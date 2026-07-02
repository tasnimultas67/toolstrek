import WebTechDetector from "@/app/(main)/tools-compo/tools/WebTechDetector";
import React from "react";

export const metadata = {
  title: "Website Technology Detector | Detect Tech Stack Online | ToolsTrek",
  description:
    "Free online website technology detector. Instantly discover the tech stack powering any website — CMS, JavaScript frameworks, web servers, CDNs, analytics tools, security headers, and more.",
  keywords: [
    "website technology detector",
    "tech stack detector",
    "cms detector",
    "website framework detector",
    "what cms is this website using",
    "detect website technology",
    "web server detector",
    "javascript framework detector",
    "website stack checker",
    "wappalyzer alternative",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Website Technology Detector | Detect Tech Stack Online | ToolsTrek",
    description:
      "Instantly detect the tech stack behind any website — frameworks, CMS, servers, CDNs, analytics, and security headers. Free & instant.",
    type: "website",
    url: "https://toolstrek.com/tools/website-tech-detector",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Technology Detector | Detect Tech Stack Online | ToolsTrek",
    description:
      "Instantly detect the tech stack behind any website — frameworks, CMS, servers, CDNs, analytics, and security headers. Free & instant.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/website-tech-detector",
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
            name: "Website Technology Detector",
            description:
              "Detect the full technology stack of any website. Identifies CMS, JavaScript frameworks, web servers, CDNs, analytics platforms, security headers, and more.",
            url: "https://toolstrek.com/tools/website-tech-detector",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Detect CMS (WordPress, Drupal, Joomla, Ghost, etc.)",
              "Identify JavaScript frameworks (React, Vue, Angular, Next.js, Nuxt.js)",
              "Detect web servers (Apache, Nginx, IIS, LiteSpeed)",
              "Identify CDN and proxy services (Cloudflare, Vercel, Netlify)",
              "Detect analytics tools (Google Analytics, Hotjar, Mixpanel)",
              "Analyze HTTP security headers with scoring",
              "Extract page meta information (title, description, generator)",
              "Advanced scan options: user-agent, timeout, redirect control",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <WebTechDetector />
    </div>
  );
};

export default page;
