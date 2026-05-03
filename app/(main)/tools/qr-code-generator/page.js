import QRCodeGenerator from "@/app/(main)/tools-compo/tools/QRCodeGenerator";
import React from "react";

export const metadata = {
  title: "Free QR Code Generator | Custom Colors & 10+ Data Types | ToolsTrek",
  description:
    "Create custom QR codes instantly. Choose from 10+ destination types (URL, vCard, WiFi, Event, etc.), download in SVG, PNG, or JPG, and customize with any color combination. 100% free and no registration required.",
  keywords: [
    "QR code generator",
    "free QR code maker",
    "custom QR code",
    "vCard QR code",
    "WiFi QR code",
    "colored QR code",
    "download QR code PNG",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Free QR Code Generator | Custom QR Codes with 10+ Data Types",
    description:
      "Generate professional QR codes instantly. Support for URL, vCard, WiFi, Events, and more. Download in high resolution with custom colors. 100% free.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/qr-generator",
    siteName: "ToolsTrek",
    images: [
      {
        url: "https://toolstrek.vercel.app/og-qr-generator.png",
        width: 1200,
        height: 630,
        alt: "ToolsTrek QR Code Generator - Create custom QR codes for any purpose",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free QR Code Generator | Custom QR Codes with 10+ Data Types",
    description:
      "Create professional QR codes instantly. Support for URL, vCard, WiFi, Events, and more. Custom colors & high-resolution downloads.",
    images: ["https://toolstrek.vercel.app/og-qr-generator.png"],
    site: "@toolstrek",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/qr-generator",
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
  verification: {
    google: "your-google-verification-code", // Add if you have Google Search Console
  },
  category: "technology",
  authors: [{ name: "Tasnimul Haque & Oracle Byte" }],
  creator: "ToolsTrek",
  publisher: "ToolsTrek",
  formatDetection: {
    telephone: false,
  },
  manifest: "https://toolstrek.vercel.app/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

const page = () => {
  return (
    <div>
      {/* Add structured data for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "QR Code Generator",
            description:
              "Create custom QR codes with multiple data types and design options",
            url: "https://toolstrek.vercel.app/tools/qr-generator",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "10+ destination types including URL, vCard, WiFi, Events",
              "Custom QR and background colors",
              "Download as SVG, PNG, or JPG",
              "Adjustable margin and error correction",
              "High-resolution downloads up to 1200px",
              "No registration required",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <QRCodeGenerator />
    </div>
  );
};

export default page;
