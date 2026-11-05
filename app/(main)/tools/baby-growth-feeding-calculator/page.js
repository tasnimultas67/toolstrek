import BabyGrowthFeedingCalculator from "@/app/(main)/tools-compo/tools/baby-growth-feeding-calculator/BabyGrowthFeedingCalculator";
import { BABY_FAQS } from "@/app/(main)/tools-compo/tools/baby-growth-feeding-calculator/babyGrowthData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/baby-growth-feeding-calculator";

export const metadata = {
  title: "Baby Growth Percentile & Feeding Calculator - Free WHO Chart Tool",
  description:
    "Track baby weight, length and head circumference with WHO-aligned growth percentiles and z-scores. Use corrected age for premature babies, view a growth chart, calculate milk volumes and formula scoops, plan feeds and export a PDF summary.",
  keywords:
    "baby growth calculator, baby percentile calculator, infant growth chart, who growth percentile, baby weight percentile, baby length percentile, head circumference percentile, corrected age calculator, baby feeding calculator, formula amount calculator, baby milk intake, feeding schedule calculator",
  openGraph: {
    title: "Baby Growth Percentile & Feeding Calculator | ToolsTrek",
    description:
      "WHO-aligned growth percentiles, corrected age, a visual growth chart and a practical feeding plan — all in your browser.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Baby Growth Percentile & Feeding Calculator by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Baby Growth Percentile & Feeding Calculator | ToolsTrek",
    description: "Track growth percentiles and calculate milk volumes, formula scoops and feed times.",
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
            name: "Baby Growth Percentile & Feeding Calculator",
            applicationCategory: "HealthApplication",
            operatingSystem: "Any",
            description:
              "A private baby growth and feeding calculator with WHO-aligned percentiles for weight, length and head circumference, corrected age, growth charts, milk volume estimates, formula scoop maths and feed schedules.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank profile by default with optional demo data",
              "WHO-aligned weight-for-age, length-for-age and head-circumference references for girls and boys",
              "Z-scores and percentiles with plain-language ranges",
              "Corrected age for babies born before 37 weeks",
              "Metric and imperial units",
              "Interactive growth chart with 3rd to 97th percentile band",
              "Measurement history with trend and average daily gain",
              "Daily milk volume and per-feed estimates",
              "Formula powder scoops and energy per feed",
              "Suggested feed schedule with daytime or around-the-clock options",
              "Age-based solids guidance and readiness checklist",
              "PDF summary, CSV growth log and JSON project export",
              "Local autosave with no uploads",
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
            mainEntity: BABY_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <BabyGrowthFeedingCalculator />
      </ToolPageShell>
    </div>
  );
};

export default page;
