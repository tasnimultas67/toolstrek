import tools from "../lib/toolsData.json";
import { SITE_URL } from "../lib/siteConfig";

const INDEXABLE_PAGES = [
  "/",
  "/tools",
  "/about-us",
  "/brand-kit",
  "/faq",
  "/privacy-policy",
];

export default function sitemap() {
  const entries = [
    ...INDEXABLE_PAGES.map((pathname) => ({
      url: new URL(pathname, SITE_URL).toString(),
    })),
    ...tools
      .filter((tool) => typeof tool.link === "string" && /^\/tools\/[a-z0-9-]+$/.test(tool.link))
      .map((tool) => ({
        url: new URL(tool.link, SITE_URL).toString(),
      })),
  ];

  // Keep this route derived from the same catalog as the tools directory so
  // new tools are discoverable without maintaining a second slug list.
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
