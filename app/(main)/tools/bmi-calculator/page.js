import BMICal from "@/app/(main)/tools-compo/tools/BMICal";
import React from "react";

export const metadata = {
  title: "BMI Calculator - Check Your Body Mass Index | Free Health Tool",
  description:
    "Calculate your BMI instantly with our free online BMI calculator. Get personalized health insights based on your age, gender, and body measurements. Includes ideal weight range, health risk assessment, and personalized tips.",
  keywords:
    "BMI calculator, body mass index, health calculator, weight assessment, fitness tool, BMI check, health risk assessment, ideal weight, wellness tool",
  openGraph: {
    title: "BMI Calculator - Check Your Body Mass Index",
    description:
      "Calculate your BMI with personalized health insights based on age, gender, and measurements. Free online tool with health recommendations.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/bmi-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/bmi-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "BMI Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BMI Calculator - Check Your Body Mass Index",
    description:
      "Calculate your BMI with personalized health insights. Free online tool with health recommendations.",
    images: ["https://toolstrek.vercel.app/og/bmi-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/bmi-calculator",
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
  return <BMICal />;
};

export default page;
