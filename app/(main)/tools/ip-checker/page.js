import IPChecker from "@/app/(main)/tools-compo/tools/IPChecker";
import React from "react";

export const metadata = {
  title: "IP Checker & Geolocation - Find IP Details Online | ToolsTrek",
  description:
    "Check your public IP address or look up any IP address/domain to get detailed geolocation, network provider (ISP), timezone, local time, security flags, and map location instantly. 100% free and client-side safe.",
  keywords:
    "ip checker, ip geolocation, ip lookup, my ip address, dns lookup, ip details, find ip location, network asn, internet service provider, developer tools, whois lookup",
  openGraph: {
    title: "IP Checker & Geolocation - Find IP Details Online",
    description:
      "Inspect your public IP address or scan any IP/domain to extract location coordinates, ISP routing, timezone offsets, active local clock, and security indicators.",
    type: "website",
    url: "https://toolstrek.vercel.app/tools/ip-checker",
    images: [
      {
        url: "https://toolstrek.vercel.app/og/ip-checker.jpg",
        width: 1200,
        height: 630,
        alt: "IP Checker & Geolocation Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Checker & Geolocation - Find IP Details Online",
    description:
      "Inspect your public IP address or scan any IP/domain to extract location coordinates, ISP routing, timezone offsets, and map location.",
    images: ["https://toolstrek.vercel.app/og/ip-checker.jpg"],
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/ip-checker",
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
  return <IPChecker />;
};

export default page;
