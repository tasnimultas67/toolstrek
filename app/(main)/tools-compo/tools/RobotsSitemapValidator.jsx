"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileCheck2, UploadCloud } from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { validateRobotsTxt, validateSitemapXml } from "@/lib/siteFileValidators";

const ROBOTS_SAMPLE = "User-agent: *\nAllow: /\nDisallow: /private/\nSitemap: https://example.com/sitemap.xml\n";
const SITEMAP_SAMPLE = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n</urlset>';
const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

export default function RobotsSitemapValidator() {
  const [mode, setMode] = useState("robots");
  const [content, setContent] = useState(ROBOTS_SAMPLE);
  const [error, setError] = useState("");
  const [validation, setValidation] = useState(null);
  const errors = validation?.findings.filter((finding) => finding.level === "error") || [];
  const warnings = validation?.findings.filter((finding) => finding.level === "warning") || [];

  function chooseMode(nextMode) {
    setMode(nextMode);
    setError("");
    setValidation(null);
    setContent(nextMode === "robots" ? ROBOTS_SAMPLE : SITEMAP_SAMPLE);
  }

  async function loadFile(file) {
    setError("");
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Choose a file smaller than 2 MB.");
      return;
    }
    if (mode === "robots" && !/\.txt$/i.test(file.name) && file.type !== "text/plain") {
      setError("Choose a plain-text robots.txt file.");
      return;
    }
    if (mode === "sitemap" && !/\.(xml|txt)$/i.test(file.name) && !/(xml|text)/i.test(file.type)) {
      setError("Choose an XML sitemap file.");
      return;
    }
    try {
      setContent(await file.text());
      setValidation(null);
    } catch {
      setError("The selected file could not be read.");
    }
  }

  function runValidation() {
    setError("");
    setValidation(mode === "robots" ? validateRobotsTxt(content) : validateSitemapXml(content));
  }

  return (
    <ToolPageShell className="px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-7">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"><FileCheck2 size={14} /> Website utility</div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">Robots.txt &amp; Sitemap Validator</h1>
          <p className="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400 md:text-base">Check robots directives or sitemap XML for common syntax, structure, URL, and duplicate-entry issues. Your file stays in this browser.</p>
        </header>

        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-7">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="File type">
            <button type="button" role="tab" aria-selected={mode === "robots"} onClick={() => chooseMode("robots")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode === "robots" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>robots.txt</button>
            <button type="button" role="tab" aria-selected={mode === "sitemap"} onClick={() => chooseMode("sitemap")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode === "sitemap" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>sitemap.xml</button>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"><UploadCloud size={15} /> Load local file<input type="file" accept={mode === "robots" ? ".txt,text/plain" : ".xml,.txt,application/xml,text/xml,text/plain"} className="sr-only" onChange={(event) => loadFile(event.target.files?.[0])} /></label>

          <label htmlFor="site-file-content" className="block text-sm font-semibold text-gray-800 dark:text-gray-200">{mode === "robots" ? "robots.txt contents" : "Sitemap XML"}</label>
          <textarea id="site-file-content" rows={14} value={content} onChange={(event) => { setContent(event.target.value); setValidation(null); }} className={`${inputClass} min-h-80 resize-y font-mono text-xs leading-5`} spellCheck={false} />

          <button type="button" onClick={runValidation} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">Validate locally</button>

          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}

          <div aria-live="polite" className={`rounded-xl border p-4 ${errors.length ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30" : warnings.length ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"}`}>
            {!validation && <p className="text-sm text-gray-600 dark:text-gray-400">Validate the current text to see format checks.</p>}
            {validation && <>
            <p className={`flex items-center gap-2 text-sm font-bold ${errors.length ? "text-red-800 dark:text-red-300" : warnings.length ? "text-amber-800 dark:text-amber-300" : "text-emerald-800 dark:text-emerald-300"}`}>{errors.length ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}{errors.length ? `${errors.length} error${errors.length === 1 ? "" : "s"}` : warnings.length ? `${warnings.length} warning${warnings.length === 1 ? "" : "s"}` : "No common issues found"}</p>
            {mode === "robots" && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{validation.userAgentCount} user-agent directive{validation.userAgentCount === 1 ? "" : "s"}; {validation.directiveCount} rule{validation.directiveCount === 1 ? "" : "s"}.</p>}
            {mode === "sitemap" && validation.entryCount !== undefined && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{validation.entryCount} {validation.type === "urlset" ? "URL" : "child sitemap"} entr{validation.entryCount === 1 ? "y" : "ies"}.</p>}
            {validation.findings.length > 0 && <ul className="mt-3 space-y-2">{validation.findings.map((finding, index) => <li key={`${finding.line || finding.entry || "doc"}-${index}`} className="text-xs leading-5 text-gray-700 dark:text-gray-300">{finding.line ? `Line ${finding.line}: ` : finding.entry ? `Entry ${finding.entry}: ` : ""}{finding.message}</li>)}</ul>}
            </>}
          </div>

          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">This local validator catches common format issues; crawler behavior and sitemap limits can vary by search engine. It does not fetch the domain or confirm that listed pages are live.</p>
        </section>
      </div>
    </ToolPageShell>
  );
}
