import PdfOcrExtractor from "@/app/(main)/tools-compo/tools/PdfOcrExtractor";
import { SITE_URL } from "@/lib/siteConfig";

const PAGE_URL = "https://toolstrek.vercel.app/tools/pdf-ocr-text-extractor";

export const metadata = {
  title: "PDF OCR & Text Extractor",
  description: "Extract selectable PDF text and recognize English text in scanned pages locally in your browser. Download the result as a text file.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "PDF OCR & Text Extractor | ToolsTrek",
    description: "Extract text from regular and scanned PDFs in your browser.",
    url: PAGE_URL,
    type: "website",
  },
};

export default function PdfOcrExtractorPage() {
  return <PdfOcrExtractor />;
}
