import ColorContrastChecker from "@/app/(main)/tools-compo/tools/color-contrast-checker/ColorContrastChecker";
import { COLOR_CONTRAST_FAQS } from "@/app/(main)/tools-compo/tools/color-contrast-checker/contrastData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/color-contrast-checker";

export const metadata = {
  title: "Color Contrast Checker - WCAG AA, AAA & APCA",
  description:
    "Check any text and background color against WCAG 2.2 AA and AAA, score APCA contrast, simulate color-vision deficiency and generate accessible color fixes. Supports hex, RGB and HSL with a live interface preview.",
  keywords:
    "color contrast checker, contrast ratio checker, WCAG contrast checker, WCAG AA checker, WCAG AAA checker, accessible color checker, APCA contrast, color accessibility, text contrast, background contrast, color contrast calculator, web accessibility tool, color blindness simulator, accessible color palette, contrast checker hex rgb hsl",
  openGraph: {
    title: "Color Contrast Checker - WCAG & APCA | ToolsTrek",
    description:
      "Test WCAG AA/AAA and APCA contrast, preview real text, simulate color-vision deficiency and auto-fix inaccessible pairs.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Color Contrast Checker by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Contrast Checker | ToolsTrek",
    description:
      "WCAG 2.2 and APCA contrast with automatic accessible color suggestions and color-vision simulation.",
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
            name: "Color Contrast Checker",
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            description:
              "A WCAG 2.2 and APCA color contrast checker with accessible color suggestions and color-vision simulation.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "WCAG 2.2 AA and AAA contrast checks",
              "APCA Lc score with usage guidance",
              "Normal and large text thresholds",
              "Live interface text preview",
              "Automatic accessible foreground and background suggestions",
              "Custom contrast target",
              "Protanopia, deuteranopia and tritanopia simulation",
              "Hex, RGB and HSL input and output",
              "Relative luminance and CSS variable export",
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
            mainEntity: COLOR_CONTRAST_FAQS.map((faq) => ({
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
        <ColorContrastChecker />
      </ToolPageShell>
    </div>
  );
};

export default page;
