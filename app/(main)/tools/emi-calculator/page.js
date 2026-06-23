import EMICalculator from "@/app/(main)/tools-compo/tools/EMICalculator";
import React from "react";

export const metadata = {
  title: "EMI Calculator — Loan Repayment Planner | ToolsTrek",
  description:
    "Calculate your Equated Monthly Installment (EMI) instantly. Get a full amortization schedule, interest breakdown, processing fee, insurance, and repayment chart for home, car, or personal loans.",
  keywords:
    "EMI calculator, loan EMI calculator, home loan EMI, car loan EMI, personal loan calculator, amortization schedule, loan repayment planner, interest calculator, monthly installment",
  openGraph: {
    title: "EMI Calculator — Loan Repayment Planner",
    description:
      "Calculate your monthly loan installment with a full amortization schedule, interest breakdown, and advanced options like processing fee and insurance.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/emi-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/emi-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "EMI Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EMI Calculator — Loan Repayment Planner",
    description:
      "Instantly calculate your monthly loan EMI with a full amortization schedule and advanced options.",
    images: ["https://toolstrek.vercel.app/og/emi-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/emi-calculator",
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
  return <EMICalculator />;
};

export default page;
