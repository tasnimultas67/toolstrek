import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = path.join(projectRoot, "README.md");
const registryPath = path.join(projectRoot, "lib", "toolsData.json");
const tools = JSON.parse(await readFile(registryPath, "utf8"));
const readme = await readFile(readmePath, "utf8");

async function countRouteHandlers(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const counts = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return countRouteHandlers(entryPath);
    return entry.name === "route.js" ? 1 : 0;
  }));
  return counts.reduce((total, count) => total + count, 0);
}

const apiRouteCount = await countRouteHandlers(path.join(projectRoot, "app", "(main)", "api"));

const start = readme.indexOf("## 🛠️ Tool Library");
const end = readme.indexOf("## 🔐 Client-Side vs. Server-Side", start);

if (start < 0 || end < 0) {
  throw new Error("README tool catalog boundaries could not be found.");
}

const byCategory = new Map();
for (const tool of tools) {
  const category = tool.categories?.[0] || "Other";
  const entries = byCategory.get(category) || [];
  entries.push(tool);
  byCategory.set(category, entries);
}

const catalog = [
  `## 🛠️ Tool Library (${tools.length} Tools)`,
  "",
  "> The registry in [`lib/toolsData.json`](./lib/toolsData.json) drives the tool directory, global search, sitemap, and AI discovery file. Run `npm run docs:catalog` after changing the registry to refresh this README section.",
  "",
  ...[...byCategory.entries()]
    .map(([category, entries]) => [
      `### ${category} (${entries.length})`,
      "",
      "| Tool | Route | Description |",
      "| :--- | :--- | :--- |",
      ...entries
        .sort((left, right) => left.title.localeCompare(right.title))
        .map((tool) => {
          const title = String(tool.title).replaceAll("|", "\\|");
          const description = String(tool.description || "")
            .replace(/[\r\n]+/g, " ")
            .replaceAll("|", "\\|");
          return `| **${title}** | \`${tool.link}\` | ${description} |`;
        }),
      "",
    ])
    .flat(),
].join("\n");

const updated = readme
  .slice(0, start)
  .concat(catalog, "\n\n", readme.slice(end))
  .replace(/Featuring <strong>\d+ powerful tools<\/strong>/, `Featuring <strong>${tools.length} powerful tools</strong>`)
  .replace(/\b\d+ tool route pages/g, `${tools.length} tool route pages`)
  .replace(/Server-side Route Handlers \(\d+\)/g, `Server-side Route Handlers (${apiRouteCount})`)
  .replace(/Central registry for all \d+ tools/g, `Central registry for all ${tools.length} tools`)
  .replace(/Tools-\d+_Available/g, `Tools-${tools.length}_Available`)
  .replace(/alt="\d+ Tools"/g, `alt="${tools.length} Tools"`);

await writeFile(readmePath, updated, "utf8");
console.log(`Updated README catalog with ${tools.length} tools across ${byCategory.size} primary categories.`);
