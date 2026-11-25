const ROBOTS_DIRECTIVES = new Set([
  "user-agent",
  "allow",
  "disallow",
  "sitemap",
  "crawl-delay",
  "host",
]);

export function validateRobotsTxt(input) {
  const lines = String(input ?? "").split(/\r?\n/);
  const findings = [];
  let currentAgents = [];
  let groupHasDirective = false;
  let userAgentCount = 0;
  let directiveCount = 0;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const cleanLine = rawLine.split("#", 1)[0].trim();
    if (!cleanLine) return;

    const separator = cleanLine.indexOf(":");
    if (separator < 1) {
      findings.push({ level: "error", line: lineNumber, message: "Expected a directive in name: value format." });
      return;
    }

    const name = cleanLine.slice(0, separator).trim().toLowerCase();
    const value = cleanLine.slice(separator + 1).trim();
    if (!ROBOTS_DIRECTIVES.has(name)) {
      findings.push({ level: "warning", line: lineNumber, message: `Unknown directive “${name}”.` });
      return;
    }

    if (name === "user-agent") {
      if (!value) {
        findings.push({ level: "error", line: lineNumber, message: "User-agent requires a crawler name or *." });
        return;
      }
      if (groupHasDirective) {
        currentAgents = [];
        groupHasDirective = false;
      }
      currentAgents.push(value);
      userAgentCount += 1;
      return;
    }

    if (currentAgents.length === 0) {
      findings.push({ level: "error", line: lineNumber, message: "Add a User-agent before this directive." });
      return;
    }

    groupHasDirective = true;
    directiveCount += 1;
    if (["allow", "disallow"].includes(name) && value && !value.startsWith("/")) {
      findings.push({ level: "warning", line: lineNumber, message: `${name} paths usually begin with /.` });
    }

    if (name === "sitemap") {
      try {
        const url = new URL(value);
        if (!/^https?:$/.test(url.protocol)) throw new Error("protocol");
      } catch {
        findings.push({ level: "error", line: lineNumber, message: "Sitemap must be an absolute HTTP or HTTPS URL." });
      }
    }

    if (name === "crawl-delay" && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
      findings.push({ level: "error", line: lineNumber, message: "Crawl-delay must be a non-negative number." });
    }
  });

  if (userAgentCount === 0) {
    if (!findings.some((finding) => /user-agent/i.test(finding.message))) {
      findings.push({ level: "error", line: 1, message: "No User-agent directive was found." });
    }
  } else if (directiveCount === 0) {
    findings.push({ level: "warning", line: 1, message: "The file has no crawler directives." });
  }

  return { findings, userAgentCount, directiveCount };
}

export function validateSitemapXml(input) {
  const xml = String(input ?? "");
  if (!xml.trim()) {
    return { findings: [{ level: "error", message: "Paste or load a sitemap XML document." }], urls: [] };
  }
  if (new TextEncoder().encode(xml).byteLength > 50 * 1024 * 1024) {
    return { findings: [{ level: "error", message: "A sitemap file must not exceed 50 MB uncompressed." }], urls: [] };
  }
  if (typeof DOMParser === "undefined") {
    return { findings: [{ level: "error", message: "XML parsing is unavailable in this environment." }], urls: [] };
  }

  const findings = [];
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const parserError = document.querySelector("parsererror");
  if (parserError) {
    return { findings: [{ level: "error", message: "The document is not well-formed XML." }], urls: [] };
  }

  const rootName = document.documentElement?.localName?.toLowerCase();
  if (!new Set(["urlset", "sitemapindex"]).has(rootName)) {
    return { findings: [{ level: "error", message: "Expected a <urlset> or <sitemapindex> root element." }], urls: [] };
  }

  const entryName = rootName === "urlset" ? "url" : "sitemap";
  const entries = [...document.getElementsByTagNameNS("*", entryName)];
  const urls = [];
  const seen = new Set();

  entries.forEach((entry, index) => {
    const loc = [...entry.getElementsByTagNameNS("*", "loc")][0]?.textContent?.trim();
    if (!loc) {
      findings.push({ level: "error", entry: index + 1, message: `Entry ${index + 1} is missing a <loc> URL.` });
      return;
    }

    try {
      const url = new URL(loc);
      if (!/^https?:$/.test(url.protocol)) throw new Error("protocol");
      url.hash = "";
      if (seen.has(url.href)) {
        findings.push({ level: "warning", entry: index + 1, message: `Duplicate URL: ${url.href}` });
      } else {
        seen.add(url.href);
        urls.push(url.href);
      }
    } catch {
      findings.push({ level: "error", entry: index + 1, message: `Invalid absolute HTTP(S) URL: ${loc}` });
    }
  });

  if (entries.length === 0) {
    findings.push({ level: "error", message: `The <${rootName}> document has no <${entryName}> entries.` });
  }
  if (entries.length > 50_000) {
    findings.push({ level: "error", message: "A sitemap file must not contain more than 50,000 entries." });
  }
  return { findings, urls, entryCount: entries.length, type: rootName };
}
