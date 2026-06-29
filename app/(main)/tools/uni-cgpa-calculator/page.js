import UniCGPACalculator from "@/app/(main)/tools-compo/tools/UniCGPACalculator";

export const metadata = {
  title: "University CGPA Calculator (Private & Public) - ToolsTrek",
  description:
    "Calculate GPA/CGPA for Private and Public Universities in Bangladesh. Includes presets for BUET, NSU, BRAC, UIU, AIUB, AUST, custom grading scales, semester CGPA calculator, target GPA planning, and downloadable image results.",
  keywords: [
    "University CGPA Calculator",
    "Private University CGPA Bangladesh",
    "Public University CGPA",
    "NSU CGPA Calculator",
    "BRAC CGPA Calculator",
    "BUET CGPA Calculator",
    "UIU CGPA Calculator",
    "AIUB CGPA Calculator",
    "AUST CGPA Calculator",
    "GPA Calculator Bangladesh",
    "ToolsTrek",
    "Semester GPA Calculator",
    "Cumulative CGPA",
  ],
  // Facebook / Open Graph
  openGraph: {
    title: "University CGPA Calculator (Private & Public) - ToolsTrek",
    description:
      "Easily calculate GPA/CGPA with presets for BUET, NSU, BRAC, UIU, AIUB, and AUST, or configure custom grading scales.",
    url: "https://toolstrek.vercel.app/tools/uni-cgpa-calculator",
    siteName: "ToolsTrek",
    images: [
      {
        url: "/University-CGPA-Calculator-toolstrek.jpg",
        width: 1200,
        height: 630,
        alt: "University CGPA Calculator Tool for Private and Public Universities",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "University CGPA Calculator (Private & Public) - ToolsTrek",
    description:
      "Advanced GPA/CGPA calculation and target planning for all Bangladeshi universities.",
    images: ["/University-CGPA-Calculator-toolstrek.jpg"],
  },
};

export default function Page() {
  return <UniCGPACalculator />;
}
