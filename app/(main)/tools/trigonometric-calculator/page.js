import TrigonometricCalculator from "@/app/(main)/tools-compo/tools/trigonometric-calculator/TrigonometricCalculator";
import { TRIG_FAQS } from "@/app/(main)/tools-compo/tools/trigonometric-calculator/trigData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/trigonometric-calculator";

export const metadata = {
  title: "Trigonometric Function Calculator - Sin, Cos, Tan & Triangles",
  description:
    "Evaluate sine, cosine, tangent, cotangent, secant and cosecant in degrees, radians, gradians or turns. See exact values for special angles, use inverse trig and atan2, solve right triangles and explore the unit circle. Free and 100% client-side.",
  keywords:
    "trigonometric calculator, trigonometry calculator, sin cos tan calculator, sine calculator, cosine calculator, tangent calculator, inverse trig calculator, arcsin calculator, arccos calculator, arctan calculator, atan2 calculator, right triangle calculator, unit circle calculator, reference angle calculator, radians to degrees, cot sec csc calculator, special angles, trigonometry table",
  openGraph: {
    title: "Trigonometric Function Calculator - Angles & Triangles | ToolsTrek",
    description:
      "All six trig functions, exact special-angle values, inverse functions and a right-triangle solver with a live unit circle.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Trigonometric Function Calculator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trigonometric Function Calculator | ToolsTrek",
    description:
      "Six trig functions, four angle units, exact values, inverse trig and a right-triangle solver.",
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
            name: "Trigonometric Function Calculator",
            applicationCategory: "CalculatorApplication",
            operatingSystem: "Any",
            description:
              "A complete trigonometry calculator with six functions, four angle units, exact special values, inverse functions and a right-triangle solver.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Sine, cosine, tangent, cotangent, secant and cosecant",
              "Degrees, radians, gradians and turns",
              "Exact values for every special angle",
              "Hyperbolic functions",
              "arcsin, arccos, arctan and atan2",
              "Principal and secondary inverse solutions",
              "Right-triangle solver with area, perimeter and radii",
              "Reference angle, quadrant, DMS and co-terminal angles",
              "Unit circle diagram",
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
            mainEntity: TRIG_FAQS.map((faq) => ({
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
        <TrigonometricCalculator />
      </ToolPageShell>
    </div>
  );
};

export default page;
