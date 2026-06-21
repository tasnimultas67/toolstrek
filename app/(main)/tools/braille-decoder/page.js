import BrailleDecoder from "@/app/(main)/tools-compo/tools/BrailleDecoder";

export const metadata = {
  title: "Braille Encoder & Decoder | ToolsTrek",
  description:
    "Free online Braille Encoder and Decoder supporting Bangla (Bengali Braille) and English (Grade 1 Braille). Instantly convert text to Braille or decode Braille back to readable text with a full visual reference chart — all client-side, no uploads needed.",
  keywords: [
    "braille decoder",
    "braille encoder",
    "bangla braille",
    "bengali braille",
    "braille translator",
    "text to braille",
    "braille to text",
    "braille converter",
    "english braille",
    "grade 1 braille",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Braille Encoder & Decoder | ToolsTrek",
    description:
      "Convert text to Braille or decode Braille back to text. Supports Bengali Braille and English Grade 1 Braille with a full visual reference chart.",
    url: "https://toolstrek.vercel.app/tools/braille-decoder",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Braille Encoder & Decoder | ToolsTrek",
    description:
      "Convert text to Braille or decode Braille back to text. Supports Bengali Braille and English Grade 1 Braille.",
  },
};

const page = () => {
  return (
    <div>
      <BrailleDecoder />
    </div>
  );
};

export default page;
