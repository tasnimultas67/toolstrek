import MorseCodeDecoder from "@/app/(main)/tools-compo/tools/MorseCodeDecoder";

export const metadata = {
  title: "Morse Code Decoder & Encoder | ToolsTrek",
  description:
    "Free online Morse Code Decoder and Encoder. Instantly translate text to Morse code and Morse code to text. Features real-time translation, audio playback, and a complete Morse code reference chart.",
  keywords: [
    "morse code decoder",
    "morse code encoder",
    "morse code translator",
    "text to morse code",
    "morse code to text",
    "morse code converter",
    "learn morse code",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Morse Code Decoder & Encoder | ToolsTrek",
    description:
      "Free online Morse Code Decoder and Encoder. Instantly translate text to Morse code and Morse code to text with audio playback.",
    url: "https://toolstrek.vercel.app/tools/morse-code-decoder",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Morse Code Decoder & Encoder | ToolsTrek",
    description:
      "Free online Morse Code Decoder and Encoder. Instantly translate text to Morse code and Morse code to text with audio playback.",
  },
};

const page = () => {
  return (
    <div>
      <MorseCodeDecoder />
    </div>
  );
};

export default page;
