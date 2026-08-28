import HealthCheckupRecommender from "@/app/(main)/tools-compo/tools/HealthCheckupRecommender";
import React from "react";

export const metadata = {
  title: "Health Checkup Recommender – Get Personalized Medical Test Suggestions | ToolsTrek",
  description:
    "Discover which medical checkups you need based on your age, gender, lifestyle, family history, and existing conditions. Generate a personalized health screening plan and download a professional PDF report.",
  keywords:
    "health checkup recommender, medical test recommendations, health screening tool, personalized health checkup, preventive health tests, medical checkup schedule, health risk assessment, doctor visit guide, annual health checkup list, free health tool",
  openGraph: {
    title: "Health Checkup Recommender – Personalized Medical Screening Plan",
    description:
      "Find out exactly which medical tests you should get based on your age, gender, lifestyle, and health history. Download a professional PDF health report.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/health-checkup-recommender",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/health-checkup-recommender.jpg",
        width: 1200,
        height: 630,
        alt: "Health Checkup Recommender Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Checkup Recommender – Personalized Medical Screening",
    description:
      "Get a personalized list of medical checkups based on your profile. Free tool with downloadable PDF report.",
    images: ["https://toolstrek.vercel.app/og/health-checkup-recommender.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/health-checkup-recommender",
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
  return <HealthCheckupRecommender />;
};

export default page;
