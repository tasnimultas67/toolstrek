import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

const tools = JSON.parse(
  readFileSync(new URL("../lib/toolsData.json", import.meta.url), "utf8"),
);
const siteUrl = "https://toolstrek.vercel.app";

test("sitemap, robots.txt, and llms.txt stay aligned with the tool registry", async ({
  request,
}) => {
  const [sitemapResponse, robotsResponse, llmsResponse] = await Promise.all([
    request.get("/sitemap.xml"),
    request.get("/robots.txt"),
    request.get("/llms.txt"),
  ]);

  expect(sitemapResponse.ok()).toBeTruthy();
  expect(robotsResponse.ok()).toBeTruthy();
  expect(llmsResponse.ok()).toBeTruthy();

  const sitemap = await sitemapResponse.text();
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const locationSet = new Set(locations);
  expect(locationSet.size).toBe(locations.length);
  for (const tool of tools) {
    expect(locationSet.has(`${siteUrl}${tool.link}`), tool.link).toBeTruthy();
  }
  expect(sitemap).not.toContain("/favorites");
  expect(sitemap).not.toContain("/recent");

  const robots = await robotsResponse.text();
  expect(robots).toContain("OAI-SearchBot");
  expect(robots).toContain("GPTBot");
  expect(robots).toContain("Disallow: /");
  expect(robots).toContain("/sitemap.xml");

  const llms = await llmsResponse.text();
  expect(llms).toContain(`# ToolsTrek`);
  expect(llms).toContain(`collection of ${tools.length} browser-first utilities`);
  for (const tool of tools) {
    expect(llms).toContain(`${siteUrl}${tool.link}`);
  }

  const invalidDomain = await request.post("/api/dns-lookup", {
    data: { domain: "127.0.0.1" },
  });
  expect(invalidDomain.status()).toBe(400);
  expect((await invalidDomain.json()).error).toMatch(/valid public domain/i);

  const invalidSelector = await request.post("/api/dns-lookup", {
    data: { domain: "example.com", selector: "bad.selector" },
  });
  expect(invalidSelector.status()).toBe(400);
  expect((await invalidSelector.json()).error).toMatch(/DKIM selector/i);
});
