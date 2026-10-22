import PregnancyDueDateCalculator from "@/app/(main)/tools-compo/tools/pregnancy-due-date-calculator/PregnancyDueDateCalculator";
import { PREGNANCY_FAQS } from "@/app/(main)/tools-compo/tools/pregnancy-due-date-calculator/pregnancyData";
import React from "react";

export const metadata = {
  title: "Pregnancy Due Date Calculator - Due Date, Weeks & Milestones",
  description:
    "Calculate your pregnancy due date from your last period, conception date, ultrasound scan or IVF transfer. See gestational age, trimester progress, days to go, conception and implantation estimates, full-term and milestone windows, then copy a summary or download an .ics calendar. Free, private and 100% browser-based.",
  keywords:
    "pregnancy due date calculator, due date calculator, pregnancy calculator, estimated due date, gestational age calculator, pregnancy weeks calculator, lmp calculator, conception date calculator, ultrasound due date calculator, ivf due date calculator, naegele rule calculator, pregnancy milestone calendar, how many weeks pregnant, full term pregnancy dates",
  openGraph: {
    title: "Pregnancy Due Date Calculator - Due Date, Weeks & Milestones",
    description:
      "Estimate your due date from LMP, conception, an ultrasound scan or an IVF transfer. Track gestational age, trimester progress and milestone windows privately in your browser.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/pregnancy-due-date-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/pregnancy-due-date-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Pregnancy Due Date Calculator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pregnancy Due Date Calculator - Due Date, Weeks & Milestones",
    description:
      "Four dating methods, gestational age, trimester progress, milestone windows and .ics export — free, private and entirely in your browser.",
    images: ["https://toolstrek.vercel.app/og/pregnancy-due-date-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/pregnancy-due-date-calculator",
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
            name: "Pregnancy Due Date Calculator",
            applicationCategory: "HealthApplication",
            operatingSystem: "Any",
            description:
              "A private pregnancy due-date calculator with LMP, conception, ultrasound and IVF dating methods, gestational age, trimester progress, milestone windows and calendar export.",
            url: "https://toolstrek.vercel.app/tools/pregnancy-due-date-calculator",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Due date from last menstrual period with cycle-length adjustment",
              "Due date from a known conception date",
              "Due date from an ultrasound scan's gestational age",
              "Due date from day-3, day-5 or day-6 IVF embryo transfers",
              "Gestational age, fetal age and trimester progress",
              "Conception, implantation and full-term windows",
              "Screening, anatomy scan and trimester milestone calendar",
              "Copyable summary and downloadable .ics calendar",
              "100% client-side privacy",
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
            mainEntity: PREGNANCY_FAQS.map((faq) => ({
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
      <PregnancyDueDateCalculator />
    </div>
  );
};

export default page;
