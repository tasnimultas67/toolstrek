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
  ],
};

export default function Page() {
  return <CGPACalculator />;
}
