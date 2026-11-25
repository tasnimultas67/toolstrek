import tools from "../../lib/toolsData.json";
import { SITE_NAME, SITE_URL, TOOL_COUNT } from "../../lib/siteConfig";

export const dynamic = "force-static";

const PUBLIC_LINKS = [
  ["Homepage", "/"],
  ["Browse all tools", "/tools"],
  ["About ToolsTrek", "/about-us"],
  ["Frequently asked questions", "/faq"],
  ["Privacy policy", "/privacy-policy"],
  ["Sitemap", "/sitemap.xml"],
];

function markdownSafe(value) {
  return String(value ?? "").replace(/[\r\n]+/g, " ").trim();
}

export function GET() {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_NAME} is a free collection of ${TOOL_COUNT} browser-first utilities for developers, students, and everyday tasks.`,
    "",
    "Most file, text, and calculator tools process data locally in the browser. Live lookup tools send the requested domain, IP address, email address, or URL to the service needed to complete that lookup. No account is required.",
    "",
    "## Site information",
    ...PUBLIC_LINKS.map(([label, path]) => `- [${label}](${new URL(path, SITE_URL).toString()})`),
    "",
    "## Tools",
    ...[...tools]
      .sort((left, right) => left.title.localeCompare(right.title))
      .map((tool) => {
        const title = markdownSafe(tool.title);
        const description = markdownSafe(tool.description);
        const url = new URL(tool.link, SITE_URL).toString();
        return `- [${title}](${url}): ${description}`;
      }),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
