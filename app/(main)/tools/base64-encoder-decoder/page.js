import Base64Nexus from "@/app/(main)/tools-compo/tools/Base64Nexus";

export const metadata = {
  title: "Base64 Nexus - Base64 Encoder & Decoder | ToolsTrek",
  description:
    "Free online Base64 Encoder & Decoder. Convert text or files to Base64 (including URL-safe and custom alphabets), decode Base64 back to plain text or binary files, preview decoded images/PDFs in real-time, view byte density maps, and browse code examples.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 converter",
    "base64 translator",
    "urlsafe base64",
    "custom base64",
    "base64 to image",
    "image to base64",
    "base64 file encoder",
    "base64 file decoder",
    "base64 examples",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Base64 Nexus - Base64 Encoder & Decoder | ToolsTrek",
    description:
      "Free online Base64 Encoder & Decoder. Convert text or files to Base64 (including URL-safe and custom alphabets), decode Base64 back to plain text or binary files, and view media previews in real-time.",
    url: "https://toolstrek.vercel.app/tools/base64-encoder-decoder",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base64 Nexus - Base64 Encoder & Decoder | ToolsTrek",
    description:
      "Free online Base64 Encoder & Decoder. Convert text or files to Base64, decode back, preview media in real-time, and analyze byte structure.",
  },
};

const page = () => {
  return (
    <div>
      <Base64Nexus />
    </div>
  );
};

export default page;
