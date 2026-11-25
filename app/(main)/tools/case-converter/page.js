import CaseConverterClient from "./CaseConverterClient";
import { SITE_URL } from "@/lib/siteConfig";

const PAGE_URL = "https://toolstrek.vercel.app/tools/case-converter";

export const metadata = {
  title: "Text Case Converter",
  description: "Convert text between uppercase, lowercase, title, sentence, camel, snake, kebab and Pascal case in your browser.",
  alternates: { canonical: PAGE_URL },
};

export default function CaseConverterPage() {
  return <CaseConverterClient />;
}
