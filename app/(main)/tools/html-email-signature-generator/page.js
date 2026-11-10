import HtmlEmailSignatureGenerator from "@/app/(main)/tools-compo/tools/html-email-signature-generator/HtmlEmailSignatureGenerator";
import { SIGNATURE_FAQS } from "@/app/(main)/tools-compo/tools/html-email-signature-generator/signatureData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/html-email-signature-generator";

export const metadata = {
  title: "HTML Email Signature Generator - Professional Signature Maker",
  description:
    "Create a professional HTML email signature with a live preview. Customize templates, fonts, colours, photos, logos, social icons, CTA buttons and disclaimers, then copy rich HTML into Gmail, Outlook, Apple Mail or Office 365.",
  keywords:
    "html email signature generator, email signature maker, professional email signature, free email signature generator, gmail signature generator, outlook signature maker, email signature template, signature with photo, social media email signature, email signature with logo, html signature code, email signature design",
  openGraph: {
    title: "HTML Email Signature Generator - Professional Signature Maker | ToolsTrek",
    description:
      "Design an email-safe HTML signature with templates, typography, colours, social links and a live desktop/mobile preview.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "HTML Email Signature Generator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML Email Signature Generator | ToolsTrek",
    description:
      "Build a professional email signature and copy it straight into Gmail, Outlook or Apple Mail.",
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
            name: "HTML Email Signature Generator",
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            description:
              "A browser-based email signature studio with email-safe HTML output, live previews, image uploads, social links, CTA buttons and vCard export.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Five signature templates: classic, modern, minimal, card and banner",
              "Photo placement, shape and size controls",
              "Font family, size, weight, casing and line-height controls",
              "Full colour control for text, accent, background and borders",
              "Profile photo and company logo upload or HTTPS URL",
              "Social links in icon, pill or text styles",
              "Custom call-to-action button",
              "Availability pill and credential badge",
              "Legal disclaimer with readable sizing",
              "Live desktop, tablet and mobile preview",
              "Rich copy, HTML source, plain text, .html, .vcf and JSON export",
              "Import saved configurations",
              "100% client-side processing",
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
            mainEntity: SIGNATURE_FAQS.map((faq) => ({
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
        <HtmlEmailSignatureGenerator />
      </ToolPageShell>
    </div>
  );
};

export default page;
