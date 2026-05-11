import CGPACalculator from "@/app/(main)/tools-compo/tools/CGPACalculator";

export const metadata = {
  title: "NU CGPA Calculator - ToolsTrek",
  description:
    "Calculate National University Bangladesh CGPA with subject-wise grades, credits, optional subjects, and a downloadable result.",
  keywords: [
    "NU CGPA Calculator",
    "National University CGPA",
    "Bangladesh CGPA Calculator",
    "Honours CGPA Calculator",
    "ToolsTrek",
    "CGPA Calculation",
    "Subject-wise CGPA",
  ],
  // Facebook / Open Graph
  openGraph: {
    title: "NU CGPA Calculator - ToolsTrek",
    description:
      "Easily calculate your National University CGPA with subject-wise grades and credits.",
    url: "https://toolstrek.vercel.app/tools/cgpa-calculator", // Replace with your actual tool path
    siteName: "ToolsTrek",
    images: [
      {
        url: "/NU-CGPA-Calculator-toolstrek.jpg", // Path to your image in the public folder
        width: 1200,
        height: 630,
        alt: "National University CGPA Calculator Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // Twitter (also used by some Messenger previews)
  twitter: {
    card: "summary_large_image",
    title: "NU CGPA Calculator - ToolsTrek",
    description:
      "Fast and accurate CGPA calculation for National University students.",
    images: ["/NU-CGPA-Calculator-toolstrek.jpg"],
  },
};

export default function Page() {
  return <CGPACalculator />;
}
