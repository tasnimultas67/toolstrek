"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardPaste,
  Download,
  Eraser,
  FileJson,
  FileSpreadsheet,
  Fingerprint,
  Gauge,
  Globe2,
  Info,
  Link2,
  ListChecks,
  Lock,
  RotateCcw,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  CopyButton,
  FaqAccordion,
  Field,
  FieldError,
  Hero,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import { downloadText } from "../_shared/toolkit/toolUtils";
import {
  DETECTOR_GROUPS,
  DETECTORS,
  DEFAULT_OPTIONS,
  SHORTENER_HOSTS,
  STRICTNESS_OPTIONS,
  SUSPICIOUS_TLDS,
  URL_FAQS,
  URL_SAMPLES,
  analyzeUrl,
  buildBulkCsv,
  buildReportText,
  levelMeta,
  severityTone,
} from "./urlRiskData";

const TABS = [
  { value: "analyze", label: "Analyze", icon: ScanSearch },
  { value: "bulk", label: "Bulk scan", icon: ListChecks },
  { value: "rules", label: "Rules", icon: SlidersHorizontal },
  { value: "guide", label: "Guide", icon: BookOpen },
];

const TOOL_META = {
  title: "Suspicious URL Analyzer",
  link: "/tools/suspicious-url-analyzer",
  icon: "ShieldAlert",
};

const TONE = "rose";

function ScoreGauge({ score, level }) {
  const meta = levelMeta(level);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label={`Risk score ${score} out of 100`}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-700" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={meta.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 500ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tabular-nums text-slate-900 dark:text-white">{score}</span>
          <span className="text-sm font-bold text-slate-400">out of 100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <Chip tone={meta.tone}>
          <ShieldAlert className="h-3.5 w-3.5" />
          {meta.label}
        </Chip>
        <p className="mt-2 max-w-xs text-sm leading-snug text-slate-500 dark:text-slate-400">{meta.description}</p>
      </div>
    </div>
  );
}

function ComponentRow({ label, value, mono = true, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-0.5 break-all text-sm font-medium ${tone || "text-slate-900 dark:text-slate-100"} ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-slate-400">not set</span>}
      </p>
    </div>
  );
}

export default function SuspiciousUrlAnalyzer() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("analyze");
  const [url, setUrl] = useState(URL_SAMPLES[0].value);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [bulkInput, setBulkInput] = useState(
    [
      "https://www.example.com/help/contact",
      "https://bit.ly/3xYzAbC",
      "http://192.168.10.24:8080/login/verify-account",
      "https://paypa1-secure-login.verify-account.xyz/signin?redirect=https://evil.example",
      "https://docs.github.com/en/get-started",
      "javascript:alert(document.cookie)",
    ].join("\n"),
  );
  const [bulkFilter, setBulkFilter] = useState("all");

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const result = useMemo(() => analyzeUrl(url, options), [url, options]);

  const bulkRows = useMemo(() => {
    const lines = bulkInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 200);
    return lines.map((line) => {
      const analysis = analyzeUrl(line, options);
      return {
        url: line,
        ...(analysis.ok
          ? {
              ok: true,
              score: analysis.score,
              level: analysis.level,
              host: analysis.hostname,
              findings: analysis.findings,
              passed: analysis.passedChecks.length,
            }
          : { ok: false, error: analysis.error }),
      };
    });
  }, [bulkInput, options]);

  const bulkSummary = useMemo(() => {
    const analyzed = bulkRows.filter((row) => row.ok);
    return {
      total: bulkRows.length,
      risky: analyzed.filter((row) => ["high", "critical"].includes(row.level)).length,
      moderate: analyzed.filter((row) => row.level === "moderate").length,
      safe: analyzed.filter((row) => ["safe", "low"].includes(row.level)).length,
      invalid: bulkRows.filter((row) => !row.ok).length,
    };
  }, [bulkRows]);

  const visibleBulkRows = useMemo(() => {
    if (bulkFilter === "all") return bulkRows;
    if (bulkFilter === "risky") return bulkRows.filter((row) => row.ok && ["moderate", "high", "critical"].includes(row.level));
    if (bulkFilter === "safe") return bulkRows.filter((row) => row.ok && ["safe", "low"].includes(row.level));
    return bulkRows.filter((row) => !row.ok);
  }, [bulkRows, bulkFilter]);

  const updateEnabled = (id, value) => {
    setOptions((current) => ({
      ...current,
      enabled: { ...current.enabled, [id]: value },
    }));
  };

  const loadSample = () => {
    const next = (sampleIndex + 1) % URL_SAMPLES.length;
    setSampleIndex(next);
    setUrl(URL_SAMPLES[next].value);
    toast.success(`Loaded sample: ${URL_SAMPLES[next].label}`);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("Your clipboard is empty.");
        return;
      }
      setUrl(text.trim());
      toast.success("URL pasted from the clipboard.");
    } catch {
      toast.error("Clipboard access was blocked. Use Ctrl/Cmd + V instead.");
    }
  };

  const resetRules = () => {
    setOptions(DEFAULT_OPTIONS);
    toast.success("All detection rules were reset to their defaults.");
  };

  const reportText = result?.ok
    ? buildReportText({ ...result, strictness: options.strictness })
    : "";

  const downloadReport = () => {
    if (!result?.ok) {
      toast.error("Analyze a valid URL before downloading a report.");
      return;
    }
    downloadText(reportText, "suspicious-url-report.txt");
    toast.success("Report downloaded.");
  };

  const downloadBulkJson = () => {
    if (!bulkRows.length) {
      toast.error("Add at least one URL to the bulk scan.");
      return;
    }
    const payload = {
      generatedAt: new Date().toISOString(),
      strictness: options.strictness,
      sensitivity: options.sensitivity,
      total: bulkRows.length,
      results: bulkRows,
    };
    downloadText(JSON.stringify(payload, null, 2), "url-scan-results.json", "application/json;charset=utf-8");
    toast.success("JSON report downloaded.");
  };

  const downloadBulkCsv = () => {
    if (!bulkRows.length) {
      toast.error("Add at least one URL to the bulk scan.");
      return;
    }
    downloadText(buildBulkCsv(bulkRows), "url-scan-results.csv", "text/csv;charset=utf-8");
    toast.success("CSV report downloaded.");
  };

  const inspectBulkRow = (row) => {
    setUrl(row.url);
    setTab("analyze");
    toast.success("Loaded into the analyzer.");
  };

  const enabledCount = Object.values(options.enabled).filter(Boolean).length;

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Security utility"
        icon={ShieldAlert}
        title="Suspicious URL Analyzer"
        description="Inspect a link before you click it. This analyzer breaks the URL into its real parts, checks it against phishing, homograph, redirect and malware-delivery patterns, and explains every risk in plain language — entirely on your device."
        badges={[
          "27 detection rules",
          "Live risk score",
          "Bulk scanning",
          "Custom rules",
          "No link is opened",
          "100% private",
        ]}
      />

      <div
        role="tablist"
        aria-label="Suspicious URL Analyzer sections"
        className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4"
      >
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-bold transition ${
              tab === value
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <Icon className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {tab === "analyze" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={Link2}
            title="Check a URL"
            description="Paste a complete link or a bare domain. Results update as you type."
            actions={
              <div className="flex flex-wrap gap-2">
                <ActionButton icon={Sparkles} onClick={loadSample}>
                  Sample
                </ActionButton>
                <ActionButton icon={ClipboardPaste} onClick={handlePaste}>
                  Paste
                </ActionButton>
              </div>
            }
          >
            <Field
              label="URL or domain"
              htmlFor="analyzer-url"
              hint="Nothing is requested from the destination. The link is parsed as text only."
              aside={
                <span className="text-sm font-medium text-slate-400">
                  {url.length.toLocaleString()} characters
                </span>
              }
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="analyzer-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="https://example.com/login?next=…"
                  className={`${fieldClass(!result.ok && !result.empty, TONE)} font-mono`}
                />
                <div className="flex gap-2">
                  <ActionButton
                    icon={Eraser}
                    variant="ghost"
                    onClick={() => {
                      setUrl("");
                      toast.success("Input cleared.");
                    }}
                  >
                    Clear
                  </ActionButton>
                </div>
              </div>
            </Field>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <Segmented
                label="Strictness"
                tone={TONE}
                columns={3}
                value={options.strictness}
                onChange={(value) => setOptions((current) => ({ ...current, strictness: value }))}
                options={STRICTNESS_OPTIONS}
              />
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {enabledCount} of {DETECTORS.length} detectors active
                </p>
                <p className="mt-0.5 text-sm leading-snug text-slate-500 dark:text-slate-400">
                  Fine-tune each rule and the score weighting in the Rules tab.
                </p>
              </div>
            </div>

            {!result.ok && !result.empty && result.error && <FieldError>{result.error}</FieldError>}
          </SectionCard>

          {!result.ok && result.empty && (
            <SectionCard tone={TONE} icon={ScanSearch} title="Waiting for a URL">
              <Callout tone={TONE} variant="info">
                Paste a link above, or load one of the built-in samples to see how the report looks.
              </Callout>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {URL_SAMPLES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setUrl(sample.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left transition hover:border-rose-300 hover:bg-rose-50/60 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-rose-800 dark:hover:bg-rose-950/20"
                  >
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{sample.label}</span>
                    <span className="mt-0.5 block truncate font-mono text-sm text-slate-500 dark:text-slate-400">
                      {sample.value}
                    </span>
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {result.ok && (
            <>
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
                <SectionCard
                  tone={TONE}
                  icon={Gauge}
                  title="Risk assessment"
                  description={`Scored with ${options.strictness} thresholds and a sensitivity of ${options.sensitivity}/10.`}
                  className="xl:col-span-4"
                  actions={
                    <CopyButton text={reportText} tone={TONE} label="Copy report" />
                  }
                >
                  <ScoreGauge score={result.score} level={result.level} />
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <Stat tone={TONE} label="Critical" value={result.counts.critical} icon={ShieldAlert} />
                    <Stat tone={TONE} label="High" value={result.counts.high} icon={AlertTriangle} />
                    <Stat tone={TONE} label="Medium" value={result.counts.medium} icon={Info} />
                    <Stat tone={TONE} label="Passed" value={result.counts.passed} icon={CheckCircle2} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <ActionButton icon={Download} onClick={downloadReport} className="w-full">
                      Download text report
                    </ActionButton>
                    <ActionButton
                      icon={FileJson}
                      onClick={() => {
                        downloadText(JSON.stringify(result, null, 2), "url-analysis.json", "application/json;charset=utf-8");
                        toast.success("JSON analysis downloaded.");
                      }}
                      className="w-full"
                    >
                      Download JSON
                    </ActionButton>
                  </div>
                </SectionCard>

                <SectionCard
                  tone={TONE}
                  icon={ShieldAlert}
                  title={`Findings (${result.findings.length})`}
                  description={
                    result.allowlisted
                      ? "This host is on your allowlist, so the score was capped at 8."
                      : result.findings.length
                        ? "Ordered by weight. Each finding explains why it matters and what to do next."
                        : "No active detector was triggered for this URL."
                  }
                  className="xl:col-span-8"
                >
                  {result.findings.length === 0 ? (
                    <Callout tone="emerald" variant="success" title="No red flags detected">
                      The structure of this link looks ordinary. That does not guarantee the site is trustworthy —
                      a well-built phishing page can live on a clean-looking domain. Verify the sender and the
                      exact spelling of the domain before entering credentials.
                    </Callout>
                  ) : (
                    <div className="space-y-2.5">
                      {result.findings.map((finding) => (
                        <div
                          key={finding.id}
                          className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex min-w-0 items-start gap-2.5">
                              <span
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                  ["critical", "high"].includes(finding.severity)
                                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                                    : finding.severity === "medium"
                                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                                      : "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300"
                                }`}
                              >
                                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-extrabold text-slate-900 dark:text-white">{finding.label}</p>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                  {finding.detail}
                                </p>
                              </div>
                            </div>
                            <Chip tone={severityTone(finding.severity)}>
                              {finding.severity} · +{finding.weight}
                            </Chip>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.disabledFindings.length > 0 && (
                    <Callout tone="amber" variant="warning" className="mt-4" title="Muted findings">
                      {result.disabledFindings.length} detector
                      {result.disabledFindings.length === 1 ? " was" : "s were"} triggered but disabled in your rules,
                      so {result.disabledFindings.length === 1 ? "it was" : "they were"} excluded from the score:{" "}
                      {result.disabledFindings.map((item) => item.label).join(", ")}.
                    </Callout>
                  )}

                  {result.passedChecks.length > 0 && (
                    <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                      <summary className="cursor-pointer list-none text-sm font-bold text-slate-700 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
                        {result.passedChecks.length} checks passed — show details
                      </summary>
                      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {result.passedChecks.map((check) => (
                          <li key={check.id} className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                            {check.label}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </SectionCard>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <SectionCard
                  tone={TONE}
                  icon={Fingerprint}
                  title="URL anatomy"
                  description="What the browser actually parses. The registrable domain is the part you should verify."
                  className="xl:col-span-7"
                  actions={<CopyButton text={result.href} tone={TONE} label="Copy full URL" />}
                >
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    <ComponentRow label="Protocol" value={result.protocol} />
                    <ComponentRow label="Hostname" value={result.hostname} />
                    <ComponentRow label="Port" value={result.port || "default"} />
                    <ComponentRow label="Registrable domain" value={result.registrableDomain} />
                    <ComponentRow label="Top-level domain" value={result.tld ? `.${result.tld}` : ""} />
                    <ComponentRow label="Path" value={result.pathname} />
                    <ComponentRow label="Query" value={result.search} />
                    <ComponentRow label="Fragment" value={result.hash} />
                    <ComponentRow label="Subdomain depth" value={`${Math.max(0, result.labels.length - 2)} label(s)`} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip tone={result.isHttps ? "emerald" : "amber"}>
                      {result.isHttps ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      {result.isHttps ? "HTTPS" : result.protocol === "http" ? "Not encrypted" : result.protocol}
                    </Chip>
                    <Chip tone={result.blocklisted ? "rose" : "sky"}>
                      {result.blocklisted ? "On your blocklist" : "Not blocklisted"}
                    </Chip>
                    <Chip tone={result.allowlisted ? "emerald" : "sky"}>
                      {result.allowlisted ? "Allowlisted host" : "Not allowlisted"}
                    </Chip>
                    {result.inferredScheme && <Chip tone="amber">https:// assumed</Chip>}
                  </div>

                  {result.decoded !== result.href && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/25">
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Decoded view</p>
                      <p className="mt-1 break-all font-mono text-sm text-amber-900 dark:text-amber-100">
                        {result.decoded}
                      </p>
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  tone={TONE}
                  icon={Info}
                  title="What to do next"
                  description="Practical steps based on the risk level."
                  className="xl:col-span-5"
                >
                  <ul className="space-y-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {result.level === "safe" || result.level === "low" ? (
                      <>
                        <li>• Confirm the domain spelling character by character before signing in.</li>
                        <li>• Type the official address yourself instead of following an unexpected link.</li>
                        <li>• Check that the padlock is present, though HTTPS alone does not prove trust.</li>
                        <li>• Never enter a one-time code that arrived in the same message as the link.</li>
                      </>
                    ) : (
                      <>
                        <li>• Do not open the link from the message or document that delivered it.</li>
                        <li>• Reach the organisation through a bookmark or by typing its official domain.</li>
                        <li>• Report the message to your email provider or IT team.</li>
                        <li>• If you already signed in, change the password and revoke active sessions.</li>
                        <li>• Turn on multi-factor authentication for the affected account.</li>
                      </>
                    )}
                  </ul>

                  <Callout tone="amber" variant="warning" className="mt-4" title="Heuristic, not a verdict">
                    A low score cannot prove a site is safe. A high score cannot prove intent. Use this report to ask
                    better questions, not as a replacement for cautious browsing.
                  </Callout>
                </SectionCard>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "bulk" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={ListChecks}
            title="Bulk URL scan"
            description="Paste up to 200 URLs, one per line. Every line is analyzed locally with the same rules."
            actions={
              <div className="flex flex-wrap gap-2">
                <ActionButton icon={FileSpreadsheet} onClick={downloadBulkCsv}>
                  CSV
                </ActionButton>
                <ActionButton icon={FileJson} onClick={downloadBulkJson}>
                  JSON
                </ActionButton>
              </div>
            }
          >
            <Field
              label="URL list"
              htmlFor="bulk-urls"
              hint={`${bulkRows.length} of 200 possible lines analyzed. Invalid lines are reported, not silently dropped.`}
            >
              <textarea
                id="bulk-urls"
                value={bulkInput}
                onChange={(event) => setBulkInput(event.target.value)}
                rows={9}
                spellCheck={false}
                placeholder={"https://example.com\nhttps://bit.ly/abc123\nhttp://192.168.1.10/login"}
                className={`${fieldClass(false, TONE)} min-h-44 resize-y font-mono leading-relaxed`}
              />
            </Field>

            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton
                icon={ClipboardPaste}
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (!text.trim()) {
                      toast.error("Your clipboard is empty.");
                      return;
                    }
                    setBulkInput(text);
                    toast.success("Clipboard pasted into the list.");
                  } catch {
                    toast.error("Clipboard access was blocked. Use Ctrl/Cmd + V instead.");
                  }
                }}
              >
                Paste list
              </ActionButton>
              <ActionButton
                icon={Trash2}
                variant="ghost"
                onClick={() => {
                  setBulkInput("");
                  toast.success("Bulk list cleared.");
                }}
              >
                Clear list
              </ActionButton>
              <ActionButton
                icon={Sparkles}
                variant="ghost"
                onClick={() => {
                  setBulkInput(URL_SAMPLES.map((sample) => sample.value).join("\n"));
                  toast.success("Loaded every sample URL.");
                }}
              >
                Load samples
              </ActionButton>
            </div>
          </SectionCard>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            <Stat tone="sky" label="Lines" value={bulkSummary.total} />
            <Stat tone="rose" label="High / critical" value={bulkSummary.risky} />
            <Stat tone="amber" label="Moderate" value={bulkSummary.moderate} />
            <Stat tone="emerald" label="Safe / low" value={bulkSummary.safe} />
            <Stat tone="rose" label="Invalid" value={bulkSummary.invalid} />
          </div>

          <SectionCard
            tone={TONE}
            icon={ScanSearch}
            title={`Results (${visibleBulkRows.length})`}
            actions={
              <Segmented
                tone={TONE}
                columns={4}
                value={bulkFilter}
                onChange={setBulkFilter}
                options={[
                  { value: "all", label: "All" },
                  { value: "risky", label: "Risky" },
                  { value: "safe", label: "Safe" },
                  { value: "invalid", label: "Invalid" },
                ]}
              />
            }
          >
            {visibleBulkRows.length === 0 ? (
              <Callout tone={TONE} variant="info">
                No rows match this filter. Add more URLs above or choose a different filter.
              </Callout>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">#</th>
                      <th className="px-3 py-2.5 font-bold">URL</th>
                      <th className="px-3 py-2.5 font-bold">Host</th>
                      <th className="px-3 py-2.5 font-bold">Score</th>
                      <th className="px-3 py-2.5 font-bold">Risk</th>
                      <th className="px-3 py-2.5 font-bold">Top finding</th>
                      <th className="px-3 py-2.5 font-bold" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {visibleBulkRows.map((row, index) => (
                      <tr
                        key={`${row.url}-${index}`}
                        className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                      >
                        <td className="px-3 py-2.5 text-slate-400">{index + 1}</td>
                        <td className="max-w-[280px] px-3 py-2.5">
                          <span className="block truncate font-mono text-slate-700 dark:text-slate-200" title={row.url}>
                            {row.url}
                          </span>
                          {!row.ok && <span className="text-rose-600 dark:text-rose-400">{row.error}</span>}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-500 dark:text-slate-400">{row.host || "—"}</td>
                        <td className="px-3 py-2.5 font-black tabular-nums text-slate-900 dark:text-white">
                          {row.ok ? row.score : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.ok ? (
                            <Chip tone={levelMeta(row.level).tone}>{levelMeta(row.level).label}</Chip>
                          ) : (
                            <Chip tone="rose">Invalid</Chip>
                          )}
                        </td>
                        <td className="max-w-[220px] px-3 py-2.5">
                          <span className="block truncate text-slate-600 dark:text-slate-300" title={row.ok ? row.findings[0]?.label : row.error}>
                            {row.ok ? row.findings[0]?.label || "No active finding" : "Could not parse"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <ActionButton
                            variant="ghost"
                            onClick={() => inspectBulkRow(row)}
                            aria-label={`Inspect ${row.url}`}
                          >
                            Inspect
                          </ActionButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {tab === "rules" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={SlidersHorizontal}
            title="Scoring behaviour"
            description="Choose how cautious the analyzer should be. These settings apply to both single and bulk scans."
            actions={
              <ActionButton icon={RotateCcw} variant="ghost" onClick={resetRules}>
                Reset all rules
              </ActionButton>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Segmented
                label="Strictness"
                tone={TONE}
                columns={3}
                value={options.strictness}
                onChange={(value) => setOptions((current) => ({ ...current, strictness: value }))}
                options={STRICTNESS_OPTIONS}
              />
              <SliderRow
                tone={TONE}
                label="Sensitivity multiplier"
                min={1}
                max={10}
                step={1}
                value={options.sensitivity}
                onChange={(value) => setOptions((current) => ({ ...current, sensitivity: value }))}
                format={(value) => `${value}/10`}
                hint="Higher values amplify every triggered rule. Lower values are more forgiving."
                onReset={() => setOptions((current) => ({ ...current, sensitivity: 5 }))}
              />
            </div>
            <Callout tone={TONE} variant="info" className="mt-4" title="How strictness changes labels">
              Strictness only moves the score boundaries, not the checks themselves. Lenient labels a link safe until
              25 points; strict does so below 8 points. Balanced sits between them.
            </Callout>
          </SectionCard>

          <SectionCard
            tone={TONE}
            icon={ShieldCheck}
            title={`Detectors (${enabledCount}/${DETECTORS.length} active)`}
            description="Turn individual checks on or off. Disabled checks are still reported as muted findings, but they do not affect the score."
          >
            <div className="space-y-5">
              {DETECTOR_GROUPS.map((group) => {
                const groupDetectors = DETECTORS.filter((detector) => detector.group === group);
                const active = groupDetectors.filter((detector) => options.enabled[detector.id] !== false).length;
                return (
                  <div key={group}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                        {group}
                      </h3>
                      <span className="text-sm font-semibold text-slate-400">
                        {active}/{groupDetectors.length} active
                      </span>
                    </div>
                    <div className="grid gap-2.5 lg:grid-cols-2">
                      {groupDetectors.map((detector) => (
                        <ToggleRow
                          key={detector.id}
                          tone={TONE}
                          checked={options.enabled[detector.id] !== false}
                          onChange={(value) => updateEnabled(detector.id, value)}
                          label={detector.label}
                          description={detector.description}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            tone={TONE}
            icon={Fingerprint}
            title="Custom lists"
            description="Add your own watch lists. One entry per line, or separate entries with commas."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Extra risky TLDs"
                htmlFor="custom-tlds"
                hint={`Built-in list includes ${[...SUSPICIOUS_TLDS].slice(0, 12).join(", ")} and more.`}
              >
                <textarea
                  id="custom-tlds"
                  rows={4}
                  value={options.customTlds}
                  onChange={(event) => setOptions((current) => ({ ...current, customTlds: event.target.value }))}
                  placeholder={"exampletld\nbadzone"}
                  spellCheck={false}
                  className={`${fieldClass(false, TONE)} resize-y font-mono`}
                />
              </Field>

              <Field
                label="Watch-list keywords"
                htmlFor="custom-keywords"
                hint="Matched against the host, path and query. Useful for your company name or a campaign you are tracking."
              >
                <textarea
                  id="custom-keywords"
                  rows={4}
                  value={options.customKeywords}
                  onChange={(event) => setOptions((current) => ({ ...current, customKeywords: event.target.value }))}
                  placeholder={"your-company\nbrand-name"}
                  spellCheck={false}
                  className={`${fieldClass(false, TONE)} resize-y font-mono`}
                />
              </Field>

              <Field
                label="Trusted / allowlisted hosts"
                htmlFor="allowlist"
                hint="Matches the host and all of its subdomains. Allowlisted results are capped at a score of 8."
              >
                <textarea
                  id="allowlist"
                  rows={4}
                  value={options.allowlist}
                  onChange={(event) => setOptions((current) => ({ ...current, allowlist: event.target.value }))}
                  placeholder={"example.com\nintranet.mycompany.com"}
                  spellCheck={false}
                  className={`${fieldClass(false, TONE)} resize-y font-mono`}
                />
              </Field>

              <Field
                label="Blocked hosts"
                htmlFor="blocklist"
                hint="Any match forces a critical score of 100, regardless of other rules."
              >
                <textarea
                  id="blocklist"
                  rows={4}
                  value={options.blocklist}
                  onChange={(event) => setOptions((current) => ({ ...current, blocklist: event.target.value }))}
                  placeholder={"known-bad.example\n*.phishing.test"}
                  spellCheck={false}
                  className={`${fieldClass(false, TONE)} resize-y font-mono`}
                />
              </Field>
            </div>

            <Callout tone="amber" variant="warning" className="mt-4" title="Wildcards">
              A leading <code className="font-mono">*.</code> is accepted and ignored, because a listed host already
              matches its subdomains. Do not include a path or protocol.
            </Callout>
          </SectionCard>
        </div>
      )}

      {tab === "guide" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard tone={TONE} icon={Gauge} title="How the score is built">
              <ol className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <li>1. The URL is parsed into protocol, host, path and query.</li>
                <li>2. Every enabled detector runs against those parts.</li>
                <li>3. Triggered weights are added together.</li>
                <li>4. The total is multiplied by your sensitivity (0.6×–1.4×).</li>
                <li>5. The result is capped at 100 and mapped to a level.</li>
              </ol>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Allowlisted hosts are capped at 8. Blocklisted hosts are forced to 100.
              </p>
            </SectionCard>

            <SectionCard tone={TONE} icon={Globe2} title="Anatomy of a link" className="lg:col-span-2">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-slate-100 dark:bg-slate-950">
                <span className="text-rose-300">https</span>
                <span className="text-slate-500">://</span>
                <span className="text-amber-300">paypa1-secure-login</span>
                <span className="text-slate-500">.</span>
                <span className="text-sky-300">verify-account</span>
                <span className="text-slate-500">.</span>
                <span className="text-emerald-300">xyz</span>
                <span className="text-slate-500">/</span>
                <span className="text-violet-300">signin</span>
                <span className="text-slate-500">?</span>
                <span className="text-cyan-300">redirect=https://evil.example</span>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Subdomain tricks</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Only the registrable domain (here <span className="font-mono">verify-account.xyz</span>) belongs to
                    the site owner. The words before it can say anything.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Redirect parameters</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    A <span className="font-mono">redirect=</span> value can bounce you to a second site after the first
                    one earns trust.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Look-alike letters</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    <span className="font-mono">paypa1</span> uses the digit one. Cyrillic “а” looks identical to Latin
                    “a” in many fonts.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Hidden destinations</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Shorteners and <span className="font-mono">user@host</span> syntax both hide where you will actually
                    land.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            tone={TONE}
            icon={ListChecks}
            title="Detector reference"
            description="Every rule, its group, and the weight it contributes when triggered."
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Detector</th>
                    <th className="px-3 py-2.5 font-bold">Group</th>
                    <th className="px-3 py-2.5 font-bold">Severity</th>
                    <th className="px-3 py-2.5 font-bold">Weight</th>
                    <th className="px-3 py-2.5 font-bold">What it looks for</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {DETECTORS.map((detector) => (
                    <tr key={detector.id}>
                      <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">{detector.label}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{detector.group}</td>
                      <td className="px-3 py-2.5">
                        <Chip tone={severityTone(detector.severity)}>{detector.severity}</Chip>
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                        +{detector.weight}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{detector.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              <Callout tone="emerald" variant="success" title="Good habit">
                Type the domain yourself when a message asks you to sign in.
              </Callout>
              <Callout tone="amber" variant="warning" title="Pressure is a signal">
                Urgency, threats and “verify within 24 hours” are social-engineering tactics.
              </Callout>
              <Callout tone={TONE} variant="tip" title="Check the sender too">
                Display names are easy to fake. Expand the address and compare the domain.
              </Callout>
            </div>
          </SectionCard>

          <SectionCard tone={TONE} icon={Info} title="Shortener and high-abuse TLD lists">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Known shorteners</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {[...SHORTENER_HOSTS].slice(0, 40).join(", ")} and more.
                </p>
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">High-abuse TLDs</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {[...SUSPICIOUS_TLDS].join(", ")}.
                </p>
              </div>
            </div>
          </SectionCard>

          <FaqAccordion items={URL_FAQS} tone={TONE} title="Suspicious URL questions, answered" />
        </div>
      )}
    </div>
  );
}
