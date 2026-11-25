import BijoyUnicodeConverterClient from "./BijoyUnicodeConverterClient";
import { SITE_URL } from "@/lib/siteConfig";

const PAGE_URL = "https://toolstrek.vercel.app/tools/bijoy-unicode-converter";

export const metadata = {
  title: "Bijoy ⇄ Unicode Bangla Converter",
  description: "Convert Bangla text between Bijoy ANSI and Unicode formats, with keyboard guidance and local conversion history.",
  alternates: { canonical: PAGE_URL },
};

export default function BijoyUnicodeConverterPage() {
  return <BijoyUnicodeConverterClient />;
}
