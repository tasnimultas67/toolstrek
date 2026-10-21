import React from "react";
import PDFUnlocker from "@/app/(main)/tools-compo/tools/PDFUnlocker";

export const metadata = {
  title: "PDF Unlocker - Remove PDF Passwords & Restrictions",
  description:
    "Unlock password-protected PDFs online for free without uploading your document. Audit AES-256, AES-128 and RC4 encryption, page counts and print/copy/edit permissions, then remove passwords and restrictions with a lossless qpdf engine or rebuild protected pages as a compatibility fallback. Optional linearization, metadata scrubbing and annotation flattening. 100% browser-based.",
  keywords: [
    "pdf unlocker",
    "unlock pdf",
    "remove pdf password",
    "pdf password remover",
    "decrypt pdf",
    "pdf restrictions remover",
    "remove pdf restrictions",
    "pdf security audit",
    "aes 256 pdf",
    "unlock protected pdf",
    "pdf permission remover",
    "pdf unlocker online",
    "free pdf unlocker",
    "ToolsTrek",
  ],
  openGraph: {
    title: "PDF Unlocker - Remove Passwords Locally",
    description:
      "Audit PDF encryption and permission flags, then remove passwords with a lossless qpdf engine or rebuild pages as a compatibility fallback. Optional linearization, metadata scrubbing and annotation flattening.",
    url: "https://toolstrek.vercel.app/tools/pdf-unlocker",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Unlocker - Remove PDF Passwords | ToolsTrek",
    description:
      "Unlock PDFs you own without uploading. AES-256/AES-128/RC4 audit, permission matrix, lossless decryption, verified output and a rebuild fallback.",
  },
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/pdf-unlocker",
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
            name: "PDF Unlocker",
            description:
              "Free browser-based PDF unlocker with a qpdf 12.2.0 WebAssembly lossless engine. Audit AES-256, AES-128 and RC4 encryption, inspect print/copy/edit permissions, remove passwords, linearize, scrub metadata, flatten annotations or rebuild pages as a fallback.",
            url: "https://toolstrek.vercel.app/tools/pdf-unlocker",
            applicationCategory: "SecurityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "100% client-side PDF processing with no file uploads",
              "AES-256, AES-128 and RC4 encryption detection",
              "Page-count and document permission audit",
              "Lossless password removal with qpdf 12.2.0",
              "Print, copy, form, annotation and edit restriction matrix",
              "Output structure verification before download",
              "Optional linearization for fast web view",
              "Optional Info and XMP metadata scrubbing",
              "Optional annotation and form flattening",
              "Raster page-rebuild fallback for maximum compatibility",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <PDFUnlocker />
    </div>
  );
};

export default page;
