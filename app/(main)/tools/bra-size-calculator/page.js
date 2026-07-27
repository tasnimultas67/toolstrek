import BraSizeCalculator from "@/app/(main)/tools-compo/tools/BraSizeCalculator";
import React from "react";

export const metadata = {
  title: "Bra Size Calculator - Find Your Perfect Fit | Accurate Sizing Tool",
  description:
    "Calculate your exact, comfortable bra size using the gold-standard r/ABraThatFits 6-measurement algorithm or standard basic sizing. Supports US, UK, EU, AU, FR, and JP systems, sister sizes, breast shape adjustments, and trans-inclusive sizing.",
  keywords:
    "bra size calculator, bra fitting tool, a bra that fits calculator, cup size calculator, breast size finder, sister sizes chart, international bra conversion, shape adjustments, transgender bra fitting, professional lingerie fit, measurement guide",
  openGraph: {
    title: "Bra Size Calculator - Find Your Perfect Fit",
    description:
      "Get a professional bra fitting at home. Use the advanced 6-measurement calculator to find your true band and cup size with global conversions.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/bra-size-calculator",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/bra-size-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Bra Size Calculator Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bra Size Calculator - Find Your True Bra Size",
    description:
      "Calculate your true bra size instantly. Professional 6-measurement calculator with international conversion & sister sizing.",
    images: ["https://toolstrek.vercel.app/og/bra-size-calculator.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/bra-size-calculator",
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
  return <BraSizeCalculator />;
};

export default page;
