import ApiRequestBuilder from "@/app/(main)/tools-compo/tools/ApiRequestBuilder";
import { SITE_URL } from "@/lib/siteConfig";

const PAGE_URL = "https://toolstrek.vercel.app/tools/api-request-builder";

export const metadata = {
  title: "API Request Builder",
  description: "Compose browser-based HTTP requests, configure JSON headers and bodies, and inspect formatted response data, headers, status, and timing.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "API Request Builder | ToolsTrek",
    description: "Send and inspect HTTP requests directly from your browser.",
    url: PAGE_URL,
    type: "website",
  },
};

export default function ApiRequestBuilderPage() {
  return <ApiRequestBuilder />;
}
