import TrekGlyphEncoderDecoder from "@/app/(main)/tools-compo/tools/TrekGlyphEncoderDecoder";

export const metadata = {
  title: "TrekGlyph Encoder & Decoder | ToolsTrek",
  description:
    "Free online TrekGlyph Encoder and Decoder. Instantly translate plain text to custom geometric code and decode TrekGlyph symbols back to readable English in real-time.",
  keywords: [
    "trekglyph encoder",
    "trekglyph decoder",
    "trekglyph translator",
    "text to trekglyph",
    "trekglyph to text",
    "geometric cipher decoder",
    "ToolsTrek",
  ],
  openGraph: {
    title: "TrekGlyph Encoder & Decoder | ToolsTrek",
    description:
      "Free online TrekGlyph Encoder and Decoder. Instantly translate plain text to custom geometric code and decode TrekGlyph symbols back to readable English in real-time.",
    url: "https://toolstrek.vercel.app/tools/trekglyph-encoder-decoder",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrekGlyph Encoder & Decoder | ToolsTrek",
    description:
      "Free online TrekGlyph Encoder and Decoder. Instantly translate plain text to custom geometric code and decode TrekGlyph symbols back to readable English in real-time.",
  },
};

const page = () => {
  return (
    <div>
      <TrekGlyphEncoderDecoder />
    </div>
  );
};

export default page;
