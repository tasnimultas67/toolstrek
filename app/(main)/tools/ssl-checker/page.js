import SSLChecker from "@/app/(main)/tools-compo/tools/SSLChecker";
import React from "react";

export const metadata = {
  title: "SSL Certificate Checker | Inspect TLS/SSL Certs Online | ToolsTrek",
  description:
    "Free online SSL certificate checker. Instantly inspect any domain's SSL/TLS certificate — view validity dates, issuer, Subject Alternative Names (SANs), certificate type (DV/OV/EV), security score, cipher suites, SHA fingerprints, and full chain of trust.",
  keywords: [
    "ssl certificate checker",
    "tls certificate checker",
    "ssl cert validator",
    "ssl expiry checker",
    "ssl checker online",
    "check ssl certificate",
    "ssl certificate details",
    "certificate chain checker",
    "wcag contrast checker",
    "https certificate checker",
    "tls version checker",
    "cipher suite checker",
    "ToolsTrek",
  ],
  openGraph: {
    title: "SSL Certificate Checker | Inspect TLS/SSL Certs Online | ToolsTrek",
    description:
      "Inspect any domain's SSL certificate — validity, issuer, SANs, certificate type, cipher suites, fingerprints, and full certificate chain. Free & instant.",
    type: "website",
    url: "https://toolstrek.com/tools/ssl-checker",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSL Certificate Checker | Inspect TLS/SSL Certs Online | ToolsTrek",
    description:
      "Inspect any domain's SSL certificate — validity, issuer, SANs, certificate type, cipher suites, fingerprints, and full certificate chain. Free & instant.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/ssl-checker",
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
            name: "SSL Certificate Checker",
            description:
              "Inspect any domain's SSL/TLS certificate. View validity dates, issuer, SANs, certificate type, cipher suites, security score, fingerprints, and full certificate chain.",
            url: "https://toolstrek.com/tools/ssl-checker",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Check SSL certificate validity and expiry",
              "View issuer and subject details",
              "Inspect Subject Alternative Names (SANs)",
              "Certificate type detection (DV/OV/EV)",
              "Security score with actionable checks",
              "TLS protocol and cipher suite analysis",
              "SHA-1 and SHA-256 fingerprints",
              "Full certificate chain visualization",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <SSLChecker />
    </div>
  );
};

export default page;
