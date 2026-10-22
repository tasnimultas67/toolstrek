import PassportPhotoMaker from "@/app/(main)/tools-compo/tools/passport-photo-maker/PassportPhotoMaker";
import { PASSPORT_FAQS, PASSPORT_FEATURES } from "@/app/(main)/tools-compo/tools/passport-photo-maker/passportPhotoData";
import React from "react";

export const metadata = {
  title: "Passport / ID Photo Maker - Free, Private & Print-Ready",
  description:
    "Create a correctly sized passport, visa or ID photo from any portrait. Choose from 10 international presets, align head and eye guides, run print-resolution and background checks, and export a 300 DPI JPEG, PNG or PDF print sheet — all privately in your browser.",
  keywords:
    "passport photo maker, id photo maker, passport photo size, visa photo maker, 2x2 passport photo, 35x45 photo, passport photo print sheet, passport photo checker, crop passport photo, free passport photo online, print passport photos at home, baby passport photo",
  openGraph: {
    title: "Passport / ID Photo Maker - Free, Private & Print-Ready",
    description:
      "Crop a portrait to official passport, visa and ID sizes, check print readiness and download a single photo or multi-copy print sheet without uploading anything.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/passport-photo-maker",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/passport-photo-maker.jpg",
        width: 1200,
        height: 630,
        alt: "Passport / ID Photo Maker by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Passport / ID Photo Maker - Free, Private & Print-Ready",
    description:
      "Make a passport, visa or ID photo at the right size with live framing guides, quality checks and print-ready exports.",
    images: ["https://toolstrek.vercel.app/og/passport-photo-maker.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/passport-photo-maker",
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
            name: "Passport / ID Photo Maker",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            description:
              "A private, browser-based passport and ID photo maker with international size presets, live framing guides, print-readiness checks and 300 DPI JPEG, PNG and PDF exports.",
            url: "https://toolstrek.vercel.app/tools/passport-photo-maker",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: PASSPORT_FEATURES,
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
            mainEntity: PASSPORT_FAQS.map((faq) => ({
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
      <PassportPhotoMaker />
    </div>
  );
};

export default page;
