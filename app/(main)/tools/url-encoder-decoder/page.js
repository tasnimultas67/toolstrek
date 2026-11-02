import UrlEncoderDecoder from "@/app/(main)/tools-compo/tools/url-encoder-decoder/UrlEncoderDecoder";
import { URL_FAQS } from "@/app/(main)/tools-compo/tools/url-encoder-decoder/urlCodecData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/url-encoder-decoder";

export const metadata = {
  title: "URL Encoder & Decoder - Encode URLs, Query Strings & Form Data",
  description:
    "Encode or decode URLs, query strings and form data online for free. Switch between component, full-URL and form encoding, choose uppercase or lowercase hex, process values line by line, inspect every URL part and build query strings — all locally in your browser.",
  keywords:
    "url encoder, url decoder, urlencode, urldecode, encode url online, decode url online, percent encoding, encodeuricomponent, encodeuri, query string encoder, form urlencoded, url escape, url unescape, utf-8 url encoding, url parser, query string builder",
  openGraph: {
    title: "URL Encoder & Decoder - Encode URLs, Query Strings & Form Data",
    description:
      "Full control over percent-encoding: component, full-URL and form modes, safe characters, batch processing, URL inspection and a query builder.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "URL Encoder & Decoder by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Encoder & Decoder - Encode URLs, Query Strings & Form Data",
    description:
      "Encode or decode URLs, query strings and form data with RFC 3986 options, batch mode and a URL inspector.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: PAGE_URL,
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
            name: "URL Encoder & Decoder",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            description:
              "A browser-based URL encoder and decoder with component, full-URL and form-data modes, RFC 3986 strictness, custom safe characters, tolerant decoding of malformed escapes, URL structure inspection and a query-string builder.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Encode and decode with encodeURIComponent, encodeURI or form semantics",
              "Custom safe-character sets for vendor APIs and slugs",
              "Spaces as %20 or +, uppercase or lowercase hex",
              "Strict RFC 3986 mode for ! ' ( ) *",
              "Tolerant decoding that preserves malformed escapes instead of throwing",
              "Line-by-line batch processing",
              "Live URL inspector with protocol, host, port, path, fragment and query table",
              "Query-string builder with sorting, empty-value control and import",
              "Reserved and unsafe character reference table",
              "100% client-side privacy",
            ],
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
            mainEntity: URL_FAQS.map((faq) => ({
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
      <ToolPageShell widthClassName="max-w-none">
        <UrlEncoderDecoder />
      </ToolPageShell>
    </div>
  );
};

export default page;
