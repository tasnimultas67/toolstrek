import DomainAgeChecker from "@/app/(main)/tools-compo/tools/DomainAgeChecker";
import React from "react";

export const metadata = {
  title: "Domain Age Checker | Check Domain Registration Date | ToolsTrek",
  description:
    "Free online domain age checker. Instantly check any domain name's age, registration date, last updated date, expiration date, registrar, status, nameservers, registrant organization, and country.",
  keywords: [
    "domain age checker",
    "check domain age",
    "domain registration date",
    "website age checker",
    "domain whois lookup",
    "domain creation date",
    "website registration checker",
    "domain age checker online",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Domain Age Checker | Check Domain Registration Date | ToolsTrek",
    description:
      "Check any domain's age, registration date, last updated date, expiration date, registrar, nameservers, registrant organization, and country. Free & instant.",
    type: "website",
    url: "https://toolstrek.com/tools/domain-age-checker",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Domain Age Checker | Check Domain Registration Date | ToolsTrek",
    description:
      "Check any domain's age, registration date, last updated date, expiration date, registrar, nameservers, registrant organization, and country. Free & instant.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/domain-age-checker",
  },
};

const page = () => {
  return (
    <div>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Domain Age Checker",
            description:
              "Check any domain name's age, registration date, last updated date, expiration date, registrar, status, nameservers, registrant organization, and country.",
            url: "https://toolstrek.com/tools/domain-age-checker",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Calculate domain age in years, months, and days",
              "Retrieve domain creation date",
              "Show registrar and nameservers",
              "Check domain registration status",
              "View last updated and expiry dates",
              "Retrieve registrant organization and country where available",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <DomainAgeChecker />
    </div>
  );
};

export default page;
