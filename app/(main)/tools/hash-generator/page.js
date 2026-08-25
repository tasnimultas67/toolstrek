import HashGenerator from "@/app/(main)/tools-compo/tools/HashGenerator";

export const metadata = {
  title: "Online Hash Generator & Verifier (SHA-256, MD5, SHA-512, Keccak) | ToolsTrek",
  description:
    "Generate, verify, benchmark, and analyze cryptographic hashes (SHA-256, MD5, SHA-1, SHA-512, SHA-3, Keccak-256, RIPEMD160, CRC32, HMAC, PBKDF2) online. 100% private, client-side, customizable formatting.",
  keywords: [
    "hash generator",
    "sha256 generator",
    "md5 generator",
    "sha512 generator",
    "online checksum calculator",
    "keccak256 generator",
    "hmac generator",
    "file hash verifier",
    "hash identifier",
    "batch hash generator",
    "cryptographic tools",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Online Cryptographic Hash Generator & Verifier | ToolsTrek",
    description:
      "Compute, verify, benchmark, and analyze SHA-256, MD5, SHA-512, Keccak, CRC-32, HMACs, and PBKDF2 hashes instantly. Zero data sent to servers.",
    url: "https://toolstrek.vercel.app/tools/hash-generator",
    siteName: "ToolsTrek",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Cryptographic Hash Generator & Verifier | ToolsTrek",
    description:
      "Compute, verify, benchmark, and analyze SHA-256, MD5, SHA-512, Keccak, CRC-32, HMACs, and PBKDF2 hashes instantly."
  }
};

const page = () => {
  return (
    <div>
      <HashGenerator />
    </div>
  );
};

export default page;
