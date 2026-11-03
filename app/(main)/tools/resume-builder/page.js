import ResumeBuilderStudio from "@/app/(main)/tools-compo/tools/resume-builder/ResumeBuilderStudio";
import { RESUME_FAQS } from "@/app/(main)/tools-compo/tools/resume-builder/resumeData";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

const OG_IMAGE = "https://toolstrek.vercel.app/brand/toolstrek-social-card.png";
const PAGE_URL = "https://toolstrek.vercel.app/tools/resume-builder";

export const metadata = {
  title: "Resume / CV Builder - Free ATS-Friendly Resume Maker",
  description:
    "Build a professional resume or CV online with a live A4 or US Letter preview. Four templates, custom colours, reorderable sections, ATS-friendly text, job-advert keyword matching and clean PDF printing. Everything stays in your browser.",
  keywords:
    "resume builder, cv builder, free resume maker, online cv maker, ats friendly resume, professional resume template, resume pdf generator, cv template free, resume maker no signup, private resume builder, job application resume, resume editor",
  openGraph: {
    title: "Resume / CV Builder - ATS-Friendly & Private | ToolsTrek",
    description:
      "Create a polished resume with live preview, four templates, reorderable sections and vector PDF printing. No account and no uploads.",
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Resume / CV Builder by ToolsTrek" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume / CV Builder - ATS-Friendly & Private | ToolsTrek",
    description: "Build, tailor and print a professional resume entirely in your browser.",
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
            name: "Resume / CV Builder",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            description:
              "A private, browser-based resume and CV builder with a live A4 or US Letter preview, four templates, custom accent colours, reorderable and hideable sections, profile photo support, keyword matching against a job advert, JSON project export and clean vector PDF printing.",
            url: PAGE_URL,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Blank resume by default with optional demo data",
              "Live A4 and US Letter page preview",
              "Modern, Classic, Minimal and Executive templates",
              "Custom accent colour and typeface selection",
              "Text scale, section spacing and margin controls",
              "Reorderable and hideable sections",
              "Experience, education, skills, projects and more",
              "Profile photo upload with circular or rounded framing",
              "Job advert keyword matching",
              "Resume completeness and page-count feedback",
              "Print to vector PDF or download standalone HTML",
              "JSON project export and import with local autosave",
              "100% client-side processing with no uploads",
            ],
            creator: { "@type": "Organization", name: "ToolsTrek" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: RESUME_FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <ToolPageShell>
        <ResumeBuilderStudio />
      </ToolPageShell>
    </div>
  );
};

export default page;
