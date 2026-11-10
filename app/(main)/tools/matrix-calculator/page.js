import MatrixCalculator from "@/app/(main)/tools-compo/tools/matrix-calculator/MatrixCalculator";
import { MATRIX_FAQS } from "@/app/(main)/tools-compo/tools/matrix-calculator/matrixMath";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/matrix-calculator";

export const metadata = {
  title: "Matrix Calculator - Multiply, Invert, Determinant & RREF",
  description:
    "Free matrix calculator for addition, subtraction, multiplication, Hadamard and Kronecker products, scalar multiplication, transpose, determinant, inverse, rank, trace, adjugate, cofactor, RREF, powers and solving Ax = b. Matrices up to 8 × 8 with live results, precision controls and CSV, TSV, LaTeX or JSON export.",
  keywords:
    "matrix calculator, matrix multiplication calculator, determinant calculator, inverse matrix calculator, matrix rank calculator, transpose matrix, rref calculator, reduced row echelon form, solve linear system, adjugate matrix, cofactor matrix, kronecker product, hadamard product, matrix power calculator, trace calculator, linear algebra calculator, 3x3 matrix calculator, 2x2 inverse",
  openGraph: {
    title: "Matrix Calculator - 16 Linear Algebra Operations | ToolsTrek",
    description:
      "Multiply, invert, reduce and solve matrices up to 8 × 8 with live results, precision controls and CSV, LaTeX or JSON export.",
    type: "website",
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Matrix Calculator by ToolsTrek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matrix Calculator | ToolsTrek",
    description:
      "A complete matrix calculator with determinant, inverse, rank, RREF, powers and linear-system solving.",
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
            name: "Matrix Calculator",
            applicationCategory: "CalculatorApplication",
            operatingSystem: "Any",
            description:
              "A complete client-side matrix calculator supporting 16 operations including matrix multiplication, determinant, inverse, rank, RREF, powers and solving Ax = b, with configurable precision and LaTeX export.",
            url: PAGE_URL,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Matrix addition, subtraction, multiplication and Hadamard product",
              "Kronecker product and scalar multiplication",
              "Transpose, determinant, inverse, rank, trace, adjugate and cofactor matrix",
              "Reduced row echelon form with collected row-operation steps",
              "Integer matrix powers including negative exponents",
              "Solve square linear systems Ax = b with consistency diagnostics",
              "Matrices up to 8 × 8 with live results",
              "Adjustable decimal precision, notation and pivot tolerance",
              "Result properties including rank, determinant, trace and symmetry",
              "Copy as CSV, TSV, LaTeX or JSON",
              "Download results as CSV or JSON",
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
            mainEntity: MATRIX_FAQS.map((faq) => ({
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
        <MatrixCalculator />
      </ToolPageShell>
    </div>
  );
};

export default page;
