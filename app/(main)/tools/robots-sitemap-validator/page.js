import RobotsSitemapValidator from "@/app/(main)/tools-compo/tools/RobotsSitemapValidator";
import { SITE_URL } from "@/lib/siteConfig";

const PAGE_URL = "https://toolstrek.vercel.app/tools/robots-sitemap-validator";

export const metadata = {
  title: "Robots.txt & Sitemap Validator",
  description: "Validate robots.txt directives and sitemap XML structure, URLs, and duplicate entries locally without uploading or fetching your files.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Robots.txt & Sitemap Validator | ToolsTrek",
    description: "Check robots.txt rules and sitemap XML for common errors in your browser.",
    url: PAGE_URL,
    type: "website",
  },
};

export default function RobotsSitemapValidatorPage() {
  return <RobotsSitemapValidator />;
}
