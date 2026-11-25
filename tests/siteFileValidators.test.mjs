import assert from "node:assert/strict";
import test from "node:test";
import { validateRobotsTxt, validateSitemapXml } from "../lib/siteFileValidators.js";

test("accepts a robots file with crawler groups and an absolute sitemap", () => {
  const result = validateRobotsTxt(
    "User-agent: *\nDisallow: /private/\nAllow: /\nSitemap: https://example.com/sitemap.xml",
  );

  assert.equal(result.findings.some((finding) => finding.level === "error"), false);
  assert.equal(result.userAgentCount, 1);
  assert.equal(result.directiveCount, 3);
});

test("reports robots directives without a user agent and malformed sitemap URLs", () => {
  const missingAgent = validateRobotsTxt("Disallow: /private");

  assert.equal(missingAgent.findings.filter((finding) => finding.level === "error").length, 1);
  assert.match(missingAgent.findings[0].message, /user-agent/i);

  const badSitemap = validateRobotsTxt("User-agent: *\nSitemap: /sitemap.xml");
  assert.match(badSitemap.findings[0].message, /absolute HTTP/i);
});

test("returns a clear result when XML parsing is unavailable", () => {
  const result = validateSitemapXml("<urlset></urlset>");

  assert.equal(result.urls.length, 0);
  assert.match(result.findings[0].message, /unavailable/i);
});
