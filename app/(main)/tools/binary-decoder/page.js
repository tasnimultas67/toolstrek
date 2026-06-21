import BinaryDecoder from "@/app/(main)/tools-compo/tools/BinaryDecoder";

export const metadata = {
  title: "Binary Code Decoder & Encoder | ToolsTrek",
  description:
    "Free online Binary Code Decoder and Encoder. Instantly convert text to binary code and decode binary back to plain text. Features real-time translation, customizable spacing/separators, a bit-level interactive byte editor, and an ASCII binary chart.",
  keywords: [
    "binary code decoder",
    "binary encoder",
    "binary to text",
    "text to binary",
    "binary translator",
    "binary converter",
    "ascii to binary",
    "binary to ascii",
    "binary editor",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Binary Code Decoder & Encoder | ToolsTrek",
    description:
      "Free online Binary Code Decoder and Encoder. Instantly convert text to binary code and decode binary back to plain text with real-time translation and a bit-level byte editor.",
    url: "https://toolstrek.vercel.app/tools/binary-decoder",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Binary Code Decoder & Encoder | ToolsTrek",
    description:
      "Free online Binary Code Decoder and Encoder. Instantly convert text to binary code and decode binary back to plain text with real-time translation.",
  },
};

const page = () => {
  return (
    <div>
      <BinaryDecoder />
    </div>
  );
};

export default page;
