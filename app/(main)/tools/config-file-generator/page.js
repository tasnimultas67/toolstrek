import ConfigFileGenerator from "@/app/(main)/tools-compo/tools/config-file-generator/ConfigFileGenerator";
import { CONFIG_FAQS } from "@/app/(main)/tools-compo/tools/config-file-generator/configGeneratorData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/config-file-generator";

export const metadata = {
  title: "Config File Generator - .gitignore, robots.txt, Meta & .htaccess",
  description:
    "Generate .gitignore, robots.txt, meta tags and .htaccess files from selectable, explained options. Framework presets, crawl rules, Open Graph, security headers, caching and a combined ZIP download. Free and private.",
  keywords:
    "gitignore generator, robots.txt generator, meta tag generator, htaccess generator, open graph generator, twitter card generator, security headers htaccess, apache config generator, gitignore template, seo meta tags, robots txt maker, config file generator",
  openGraph: {
    title: "Config File Generator - .gitignore, robots.txt, Meta & .htaccess | ToolsTrek",
    description:
      "Build four essential project files with explained options, validation checks and a one-click ZIP bundle.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Config File Generator by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Config File Generator | ToolsTrek",
    description: "Generate .gitignore, robots.txt, meta tags and .htaccess with confidence.",
    images: [OG_IMAGE],
  },
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
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
            name: ".gitignore, robots.txt, Meta Tag & .htaccess Generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            description:
              "A browser-based generator for .gitignore, robots.txt, HTML meta tags and Apache .htaccess files with selectable option groups, validation and ZIP export.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank inputs by default with optional demo data",
              "Gitignore groups for operating systems, editors, Node, Python, PHP, Java, .NET, Go, Rust, secrets, Docker and Terraform",
              "Robots.txt presets with allow, disallow, crawl delay and sitemap directives",
              "Meta tag generation for SEO, Open Graph, Twitter cards, icons and custom tags",
              "Htaccess rules for HTTPS, HSTS, security headers, compression, caching, sensitive files, error pages, hotlink protection and maintenance mode",
              "Pre-flight validation checks",
              "Reusable local presets",
              "Copy and download each file",
              "Combined ZIP bundle",
              "No uploads and no server processing",
            ],
            creator: { "@type": "Organization", name: "ToolsTrek" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: CONFIG_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <ConfigFileGenerator />
      </ToolPageShell>
    </div>
  );
};

export default page;
