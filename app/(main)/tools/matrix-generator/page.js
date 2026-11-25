import MatrixGenerator from "@/app/(main)/tools-compo/tools/matrix-generator/MatrixGenerator";
import { MATRIX_GENERATOR_FAQS } from "@/app/(main)/tools-compo/tools/matrix-generator/matrixGeneratorData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/matrix-generator";

export const metadata = {
  title: "Matrix Generator - Random, Symmetric, Triangular & Sparse Matrices",
  description:
    "Generate matrices up to 12 × 12 with 12 structures including random, identity, symmetric, skew-symmetric, upper and lower triangular, sparse, banded and Toeplitz. Edit cells, inspect determinant, rank, trace and inverse, and export as CSV, LaTeX, JSON, Python, MATLAB or Markdown.",
  keywords:
    "matrix generator, random matrix generator, symmetric matrix generator, triangular matrix generator, sparse matrix generator, banded matrix generator, toeplitz matrix, diagonal matrix generator, identity matrix generator, matrix creator, matrix maker, matrix template, determinant calculator, matrix rank, matrix inverse, matrix transpose, latex matrix generator, python matrix generator, 3x3 matrix generator",
  openGraph: {
    title: "Matrix Generator - 12 Structures with Live Analysis | ToolsTrek",
    description:
      "Build random, symmetric, triangular, sparse, banded or Toeplitz matrices, edit every cell and export to code, CSV or LaTeX.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Matrix Generator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matrix Generator | ToolsTrek",
    description:
      "Generate matrices with 12 structures, editable cells, live determinant and rank, and eight export formats.",
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
            name: "Matrix Generator",
            applicationCategory: "CalculatorApplication",
            operatingSystem: "Any",
            description:
              "A client-side matrix generator with 12 matrix structures, editable cells, live linear-algebra analysis and eight export formats.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Generate matrices up to 12 × 12",
              "Random, identity, zero, ones, diagonal, upper and lower triangular structures",
              "Symmetric, skew-symmetric, sparse, banded and Toeplitz matrices",
              "Seed-reproducible generation",
              "Editable matrix cells",
              "Live determinant, rank, trace, Frobenius norm and inverse",
              "Transpose and row/column sums",
              "Structure checks including positive definite and orthogonal",
              "Export as brackets, plain text, CSV, LaTeX, JSON, Python, MATLAB or Markdown",
              "100% client-side processing",
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
            mainEntity: MATRIX_GENERATOR_FAQS.map((faq) => ({
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
        <MatrixGenerator />
      </ToolPageShell>
    </div>
  );
};

export default page;
