import RomanNumeralConverter from "@/app/(main)/tools-compo/tools/RomanNumeralConverter";

export const metadata = {
  title: "Roman Numeral Converter | ToolsTrek",
  description:
    "Convert standard numbers to Roman numerals and back with ease. Real-time conversion, step-by-step mathematical breakdown, interactive Roman keyboard, and full reference guide.",
  keywords: [
    "roman numeral converter",
    "roman numerals",
    "arabic to roman",
    "roman to arabic",
    "roman numeral translator",
    "roman numbers",
    "roman digit calculator",
    "roman numeral reference table",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Roman Numeral Converter | ToolsTrek",
    description:
      "Convert standard numbers to Roman numerals and back with ease. Real-time conversion, step-by-step mathematical breakdown, interactive Roman keyboard, and full reference guide.",
    url: "https://toolstrek.vercel.app/tools/roman-numeral-converter",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roman Numeral Converter | ToolsTrek",
    description:
      "Convert standard numbers to Roman numerals and back with ease. Real-time conversion, step-by-step mathematical breakdown, interactive Roman keyboard, and full reference guide.",
  },
};

const page = () => {
  return (
    <div>
      <RomanNumeralConverter />
    </div>
  );
};

export default page;
