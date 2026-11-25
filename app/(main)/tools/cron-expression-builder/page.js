import CronExpressionBuilder from "@/app/(main)/tools-compo/tools/CronExpressionBuilder";
import { SITE_URL } from "@/lib/siteConfig";

const PAGE_URL = "https://toolstrek.vercel.app/tools/cron-expression-builder";

export const metadata = {
  title: "Cron Expression Builder & Explainer",
  description: "Build and explain five-field cron expressions, validate lists, ranges and steps, and preview the next scheduled run times in local time or UTC.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cron Expression Builder & Explainer | ToolsTrek",
    description: "Explain five-field cron syntax and preview upcoming scheduled times in your browser.",
    url: PAGE_URL,
    type: "website",
  },
};

export default function CronExpressionBuilderPage() {
  return <CronExpressionBuilder />;
}
