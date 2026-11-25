import DnsEmailAuthChecker from "@/app/(main)/tools-compo/tools/DnsEmailAuthChecker";
import { SITE_URL } from "@/lib/siteConfig";

const PAGE_URL = "https://toolstrek.vercel.app/tools/dns-email-auth-checker";

export const metadata = {
  title: "DNS & Email Authentication Checker",
  description: "Look up public DNS records and inspect SPF, DMARC, and selected DKIM records for a domain with a clear browser-based report.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "DNS & Email Authentication Checker | ToolsTrek",
    description: "Inspect DNS records and email authentication records for a domain.",
    url: PAGE_URL,
    type: "website",
  },
};

export default function DnsEmailAuthCheckerPage() {
  return <DnsEmailAuthChecker />;
}
