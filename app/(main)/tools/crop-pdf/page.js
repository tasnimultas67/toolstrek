import CropPDF from "../../tools-compo/tools/CropPDF";

export const metadata = {
  title: "Crop PDF — Remove Margins & Trim PDF Pages Online",
  description:
    "Crop and trim unwanted margins from PDF pages instantly in your browser. Free, secure, 100% client-side — your files never leave your device.",
  keywords: ["crop PDF", "trim PDF", "PDF margin remover", "PDF editor online", "ToolsTrek"],
  openGraph: {
    title: "Crop PDF Online — Free PDF Margin Remover | ToolsTrek",
    description: "Remove unwanted margins and crop PDF pages instantly. Free & private — files stay in your browser.",
    url: "https://toolstrek.vercel.app/tools/crop-pdf",
    type: "website",
    siteName: "ToolsTrek",
    images: [{ url: "https://toolstrek.vercel.app/toolstrek-logo.png", width: 1200, height: 630, alt: "Crop PDF Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crop PDF Online | ToolsTrek",
    description: "Trim PDF margins instantly. Free, no sign-up, files never leave your device.",
    images: ["https://toolstrek.vercel.app/toolstrek-logo.png"],
    site: "@toolstrek",
  },
  alternates: { canonical: "https://toolstrek.vercel.app/tools/crop-pdf" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export default function CropPDFPage() {
  return <CropPDF />;
}
