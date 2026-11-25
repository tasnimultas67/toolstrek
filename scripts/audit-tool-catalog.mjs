import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tools = JSON.parse(readFileSync(join(root, "lib/toolsData.json"), "utf8"));
const siteConfig = readFileSync(join(root, "lib/siteConfig.js"), "utf8");
const siteUrl = siteConfig.match(/SITE_URL\s*=\s*["']([^"']+)["']/)?.[1];
const errors = [];
const seen = new Set();

function readMetadataUrl(source, property) {
  const match = source.match(new RegExp(`${property}:\\s*(?:["']([^"']+)["']|([A-Z][A-Z0-9_]*))`));
  if (!match) return null;
  if (match[1]) return match[1];

  const declaration = source.match(
    new RegExp("(?:const|let)\\s+" + match[2] + "\\s*=\\s*(?:\"([^\"]+)\"|'([^']+)'|`([^`]+)`)")
  );
  return declaration?.[1] ?? declaration?.[2] ?? declaration?.[3] ?? null;
}

if (!siteUrl) errors.push("lib/siteConfig.js must export a literal SITE_URL.");

for (const [index, tool] of tools.entries()) {
  const label = `toolsData.json item ${index + 1}`;
  if (!tool.title || !tool.description) errors.push(`${label} is missing a title or description.`);
  if (!/^\/tools\/[a-z0-9-]+$/.test(tool.link ?? "")) {
    errors.push(`${label} has an invalid tool path: ${tool.link}`);
    continue;
  }
  if (seen.has(tool.link)) errors.push(`Duplicate tool path: ${tool.link}`);
  seen.add(tool.link);

  const slug = tool.link.slice("/tools/".length);
  const pagePath = join(root, "app/(main)/tools", slug, "page.js");
  if (!existsSync(pagePath)) {
    errors.push(`${tool.link} is registered but has no page.js route.`);
    continue;
  }

  const source = readFileSync(pagePath, "utf8");
  const expectedUrl = new URL(tool.link, siteUrl).toString();
  const canonical = readMetadataUrl(source, "canonical");
  if (!canonical) errors.push(`${tool.link} has no statically readable canonical URL.`);
  else if (new URL(canonical, siteUrl).toString() !== expectedUrl) {
    errors.push(`${tool.link} canonical points to ${canonical}.`);
  }

  const openGraph = source.match(/openGraph:\s*\{([\s\S]*?)\n\s{2}\},\s*(?:twitter:|alternates:|robots:|category:)/)?.[1];
  const openGraphUrl = openGraph?.match(/^\s{4}url:\s*["']([^"']+)["']/m)?.[1];
  if (openGraphUrl && new URL(openGraphUrl, siteUrl).toString() !== expectedUrl) {
    errors.push(`${tool.link} Open Graph URL points to ${openGraphUrl}.`);
  }
}

if (errors.length) {
  console.error(`Catalog audit failed (${errors.length} issue${errors.length === 1 ? "" : "s"}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Catalog audit passed: ${tools.length} unique tools have route pages and self-referencing canonicals.`);
}
