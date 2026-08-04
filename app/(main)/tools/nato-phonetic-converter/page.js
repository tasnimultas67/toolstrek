import NATOPhoneticConverter from "@/app/(main)/tools-compo/tools/NATOPhoneticConverter";

export const metadata = {
  title: "NATO Phonetic Alphabet Converter | ToolsTrek",
  description:
    "Convert any text to the NATO phonetic alphabet instantly. Used by military, aviation, and emergency services worldwide. Features real-time conversion, character-by-character breakdown, and a full reference chart with pronunciations.",
  keywords: [
    "nato phonetic alphabet",
    "nato alphabet converter",
    "phonetic alphabet translator",
    "military alphabet converter",
    "alpha bravo charlie",
    "icao phonetic alphabet",
    "text to nato phonetic",
    "nato decoder",
    "phonetic spelling converter",
    "aviation phonetic alphabet",
    "ToolsTrek",
  ],
  openGraph: {
    title: "NATO Phonetic Alphabet Converter | ToolsTrek",
    description:
      "Convert any text to the NATO phonetic alphabet instantly. Real-time conversion with character breakdown and full reference chart.",
    url: "https://toolstrek.vercel.app/tools/nato-phonetic-converter",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NATO Phonetic Alphabet Converter | ToolsTrek",
    description:
      "Convert any text to the NATO phonetic alphabet instantly. Real-time conversion with character breakdown and full reference chart.",
  },
};

const page = () => {
  return (
    <div>
      <NATOPhoneticConverter />
    </div>
  );
};

export default page;
