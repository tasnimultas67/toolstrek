import React from "react";
import UnitConverter from "@/app/(main)/tools-compo/UnitConverter";

export const metadata = {
  title: "Unit Converter - Convert Length, Weight, Temperature & More | Toolstrek",
  description: "Free online unit converter. Convert length, weight, temperature, area, volume, speed, time and data storage units instantly.",
  keywords: [
    "unit converter",
    "metric converter",
    "convert length",
    "convert weight",
    "temperature converter",
    "area converter",
    "volume converter",
    "speed converter",
    "time converter",
    "data storage converter",
    "toolstrek"
  ],
  openGraph: {
    title: "Unit Converter - Convert Length, Weight, Temperature & More | Toolstrek",
    description: "Free online unit converter. Convert length, weight, temperature, area, volume, speed, time and data storage units instantly.",
    url: "https://toolstrek.com/tools/unit-converter",
    siteName: "Toolstrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unit Converter - Convert Length, Weight, Temperature & More | Toolstrek",
    description: "Free online unit converter. Convert length, weight, temperature, area, volume, speed, time and data storage units instantly.",
  }
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Unit Converter - Toolstrek",
    "url": "https://toolstrek.com/tools/unit-converter",
    "description": "Free online unit converter. Convert length, weight, temperature, area, volume, speed, time and data storage units instantly.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="pt-24 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="px-1 py-3">
        <UnitConverter />
      </div>
    </div>
  );
}
