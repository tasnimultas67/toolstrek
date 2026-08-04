import JWTDecoder from "@/app/(main)/tools-compo/tools/JWTDecoder";

export const metadata = {
  title: "JWT Decoder & Debugger | ToolsTrek",
  description:
    "Decode, verify, and analyze JSON Web Tokens (JWT) online. Inspect Header, Payload, Signature, and validate tokens in real-time with signature verification.",
  keywords: [
    "jwt decoder",
    "jwt debugger",
    "decode jwt online",
    "verify jwt signature",
    "json web token parser",
    "jwt editor",
    "jwt claims inspector",
    "token validator",
    "HMAC-SHA256 verification",
    "ToolsTrek"
  ],
  openGraph: {
    title: "JWT Decoder & Debugger | ToolsTrek",
    description:
      "Decode, verify, and analyze JSON Web Tokens (JWT) online. Real-time header and payload claims inspection with signature verification.",
    url: "https://toolstrek.vercel.app/tools/jwt-decoder",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Decoder & Debugger | ToolsTrek",
    description:
      "Decode, verify, and analyze JSON Web Tokens (JWT) online. Real-time header and payload claims inspection with signature verification.",
  },
};

const page = () => {
  return (
    <div>
      <JWTDecoder />
    </div>
  );
};

export default page;
