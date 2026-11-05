import FreelanceRateCalculator from "@/app/(main)/tools-compo/tools/freelance-rate-calculator/FreelanceRateCalculator";
import { RATE_FAQS } from "@/app/(main)/tools-compo/tools/freelance-rate-calculator/freelanceRateData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/freelance-rate-calculator";

export const metadata = {
  title: "Freelance Rate Calculator - Hourly, Day & Project Rates",
  description:
    "Calculate the hourly, day and project rate your freelance business needs after expenses, tax, retirement and unbillable time. Model utilisation, profit margin and fixed-price quotes with a free private calculator.",
  keywords:
    "freelance rate calculator, hourly rate calculator, freelance hourly rate, day rate calculator, project quote calculator, contractor rate calculator, consulting rate calculator, billable hours calculator, freelance pricing, profit margin calculator, retainer calculator, rate card generator",
  openGraph: {
    title: "Freelance Rate Calculator - Hourly, Day & Project Rates | ToolsTrek",
    description:
      "Work out the rate your business actually needs, compare it with the market, stress-test utilisation and build a phase-based project quote.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Freelance Rate Calculator by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Rate Calculator | ToolsTrek",
    description: "Hourly, day, retainer and project rates built from real costs and real capacity.",
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
            name: "Freelance / Hourly Rate Calculator",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            description:
              "A private freelance pricing calculator that derives hourly, day, retainer and project rates from income targets, business expenses, tax, profit margin and realistic billable capacity.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank inputs by default with optional demo data",
              "Target take-home income and annual business expenses",
              "Tax, retirement and insurance modelling",
              "Billable-hours capacity and utilisation sensitivity",
              "Profit margin and market rate comparison",
              "Hourly, day, week and monthly retainer rates",
              "Rate ladder at 10, 20, 30 and 40 percent margins",
              "Phase-based fixed-price project quotes",
              "Risk buffer and effective hourly rate",
              "CSV, PDF, JSON and printed exports",
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
            mainEntity: RATE_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <FreelanceRateCalculator />
      </ToolPageShell>
    </div>
  );
};

export default page;
