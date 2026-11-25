"use client";

import { useState } from "react";
import { CalendarClock, Check, Copy, Play, RotateCcw } from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { describeCronExpression, getNextCronRuns, parseCronExpression } from "@/lib/cronExpression";

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Weekdays at 9:00", value: "0 9 * * 1-5" },
  { label: "Daily at midnight", value: "0 0 * * *" },
];

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

export default function CronExpressionBuilder() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const [timezone, setTimezone] = useState("local");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function preview() {
    try {
      const parsed = parseCronExpression(expression);
      setResult({
        fields: describeCronExpression(parsed),
        runs: getNextCronRuns(parsed, { count: 8, timezone }),
      });
      setError("");
    } catch (previewError) {
      setResult(null);
      setError(previewError.message);
    }
  }

  async function copyExpression() {
    try {
      await navigator.clipboard.writeText(expression.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard access was denied. Select the expression and copy it manually.");
    }
  }

  return (
    <ToolPageShell className="px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-7">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            <CalendarClock size={14} /> Developer utility
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">Cron Expression Builder</h1>
          <p className="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400 md:text-base">
            Explain standard five-field cron expressions and preview the next scheduled times. Parsing and previewing happen in your browser.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-7">
          <label htmlFor="cron-expression" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Five-field expression</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input id="cron-expression" value={expression} onChange={(event) => setExpression(event.target.value)} className={`${inputClass} font-mono sm:flex-1`} placeholder="minute hour day-of-month month day-of-week" spellCheck={false} />
            <button type="button" onClick={preview} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"><Play size={15} /> Preview schedule</button>
            <button type="button" onClick={copyExpression} aria-label="Copy cron expression" className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((preset) => <button key={preset.value} type="button" onClick={() => { setExpression(preset.value); setResult(null); setError(""); }} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-gray-700 dark:text-gray-300 dark:hover:text-indigo-300">{preset.label}</button>)}
          </div>

          <div className="mt-5 max-w-xs">
            <label htmlFor="cron-timezone" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Interpret times in</label>
            <select id="cron-timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} className={inputClass}>
              <option value="local">Your browser&apos;s local timezone</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">Supports numbers, lists, ranges, wildcards and steps, such as <code className="font-mono">1-5</code> or <code className="font-mono">*/15</code>. Names, macros and Quartz six/seven-field syntax are not supported.</p>
        </section>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

        {result && (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Field breakdown</h2>
                <button type="button" onClick={() => { setResult(null); setError(""); }} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"><RotateCcw size={13} /> Clear</button>
              </div>
              <dl className="divide-y divide-gray-100 dark:divide-gray-800">
                {result.fields.map((field) => <div key={field.name} className="grid grid-cols-[1fr_auto] gap-4 py-3"><dt className="text-sm text-gray-600 dark:text-gray-400">{field.name}<span className="ml-2 font-mono text-xs text-gray-400">{field.source}</span></dt><dd className="text-right text-sm font-medium text-gray-900 dark:text-gray-100">{field.description}</dd></div>)}
              </dl>
              <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">When both day-of-month and day-of-week are restricted, standard cron uses either match.</p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Next scheduled runs</h2>
              {result.runs.length ? <ol className="space-y-2">{result.runs.map((run) => <li key={run.toISOString()} className="rounded-lg bg-gray-50 px-3 py-2.5 font-mono text-sm text-gray-800 dark:bg-gray-800/60 dark:text-gray-200">{run.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", ...(timezone === "UTC" ? { timeZone: "UTC" } : {}) })}{timezone === "UTC" ? " UTC" : ""}</li>)}</ol> : <p className="text-sm text-gray-600 dark:text-gray-400">No run was found in the next five years for this expression.</p>}
              <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">Cron engines can differ in how they handle daylight-saving changes and day fields. Confirm the target scheduler&apos;s rules before deploying critical jobs.</p>
            </section>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
}
