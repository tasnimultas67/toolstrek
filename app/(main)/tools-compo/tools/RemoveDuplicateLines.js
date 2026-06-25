"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Copy,
  Download,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  Settings2,
  CheckCircle2,
  FileText,
  ArrowUpDown,
  Filter,
  Hash,
  AlignLeft,
  Shuffle,
  Eye,
  EyeOff,
  ClipboardPaste,
  BarChart2,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

/* ─── helpers ─────────────────────────────────────────────────── */
function processLines(input, opts) {
  if (!input.trim()) return { output: "", removed: 0, kept: 0, total: 0, duplicateCount: 0 };

  let lines = input.split("\n");
  const total = lines.length;

  // Trim individual lines if requested
  if (opts.trimLines) {
    lines = lines.map((l) => l.trimEnd());
    if (opts.trimLeading) lines = lines.map((l) => l.trimStart());
  }

  // Optionally remove blank lines before dedup
  if (opts.removeBlank) {
    lines = lines.filter((l) => l.trim() !== "");
  }

  // Filter lines matching a pattern
  if (opts.filterPattern) {
    try {
      const flags = opts.filterCaseSensitive ? "" : "i";
      const re = new RegExp(opts.filterPattern, flags);
      if (opts.filterMode === "keep") {
        lines = lines.filter((l) => re.test(l));
      } else {
        lines = lines.filter((l) => !re.test(l));
      }
    } catch {
      /* invalid regex – skip */
    }
  }

  // Deduplicate
  const seen = new Set();
  const duplicateLines = new Set();
  const result = [];

  for (const line of lines) {
    const key = opts.caseSensitive ? line : line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    } else {
      duplicateLines.add(key);
    }
  }

  let processed = result;

  // Sort
  if (opts.sort === "asc") {
    processed = [...processed].sort((a, b) =>
      opts.caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase())
    );
  } else if (opts.sort === "desc") {
    processed = [...processed].sort((a, b) =>
      opts.caseSensitive ? b.localeCompare(a) : b.toLowerCase().localeCompare(a.toLowerCase())
    );
  } else if (opts.sort === "length-asc") {
    processed = [...processed].sort((a, b) => a.length - b.length);
  } else if (opts.sort === "length-desc") {
    processed = [...processed].sort((a, b) => b.length - a.length);
  } else if (opts.sort === "random") {
    processed = [...processed].sort(() => Math.random() - 0.5);
  } else if (opts.sort === "reverse") {
    processed = [...processed].reverse();
  }

  // Add line numbers
  if (opts.lineNumbers) {
    const pad = String(processed.length).length;
    processed = processed.map(
      (l, i) => `${String(i + 1).padStart(pad, " ")}. ${l}`
    );
  }

  const output = processed.join("\n");
  const kept = result.length;
  const removed = total - kept;

  return { output, removed, kept, total, duplicateCount: duplicateLines.size };
}

/* ─── component ───────────────────────────────────────────────── */
export default function RemoveDuplicateLines() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Basic options
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [trimLeading, setTrimLeading] = useState(false);
  const [removeBlank, setRemoveBlank] = useState(false);

  // Advanced options
  const [sort, setSort] = useState("none");
  const [lineNumbers, setLineNumbers] = useState(false);
  const [filterPattern, setFilterPattern] = useState("");
  const [filterMode, setFilterMode] = useState("remove");
  const [filterCaseSensitive, setFilterCaseSensitive] = useState(false);

  const opts = useMemo(
    () => ({
      caseSensitive,
      trimLines,
      trimLeading,
      removeBlank,
      sort,
      lineNumbers,
      filterPattern,
      filterMode,
      filterCaseSensitive,
    }),
    [
      caseSensitive,
      trimLines,
      trimLeading,
      removeBlank,
      sort,
      lineNumbers,
      filterPattern,
      filterMode,
      filterCaseSensitive,
    ]
  );

  const { output, removed, kept, total, duplicateCount } = useMemo(
    () => processLines(input, opts),
    [input, opts]
  );

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unique-lines.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      /* permission denied */
    }
  }, []);

  const handleClear = useCallback(() => setInput(""), []);

  /* stat color helper */
  const pct = total > 0 ? Math.round(((total - kept) / total) * 100) : 0;

  const sortOptions = [
    { value: "none", label: "Original order" },
    { value: "asc", label: "A \u2192 Z (ascending)" },
    { value: "desc", label: "Z \u2192 A (descending)" },
    { value: "length-asc", label: "Shortest first" },
    { value: "length-desc", label: "Longest first" },
    { value: "reverse", label: "Reverse order" },
    { value: "random", label: "Shuffle randomly" },
  ];

  return (
    <ToolPageShell widthClassName="max-w-7xl px-1 pt-20 pb-10">
      <div className="dark:text-slate-100">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-3 dark:from-violet-400 dark:to-indigo-400">
            Remove Duplicate Lines
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto dark:text-slate-400">
            Instantly deduplicate text with sorting, filtering, trimming, and more advanced controls.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ── Left panel ──────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Input card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden dark:bg-slate-800/80 dark:border-slate-700/50">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-violet-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                    Input
                  </span>
                  {total > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">
                      {total} lines
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    id="rdl-paste-btn"
                    onClick={handlePaste}
                    title="Paste from clipboard"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:text-violet-400 dark:hover:bg-violet-900/30 transition-all"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </button>
                  {input && (
                    <button
                      id="rdl-clear-btn"
                      onClick={handleClear}
                      title="Clear input"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                id="rdl-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={14}
                placeholder={"Paste your lines here, one per line...\n\napple\nbanana\napple\ncherry\nbanana"}
                className="w-full p-5 text-sm bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 outline-none resize-none font-mono leading-relaxed"
              />
            </div>

            {/* Basic options */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5 dark:bg-slate-800/80 dark:border-slate-700/50">
              <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-4">
                Options
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "rdl-case-sensitive",
                    checked: caseSensitive,
                    onChange: setCaseSensitive,
                    label: "Case-sensitive comparison",
                    hint: "apple \u2260 Apple",
                    color: "text-violet-500",
                  },
                  {
                    id: "rdl-trim-trailing",
                    checked: trimLines,
                    onChange: setTrimLines,
                    label: "Trim trailing spaces",
                    hint: "Remove ending whitespace",
                    color: "text-violet-500",
                  },
                  {
                    id: "rdl-trim-leading",
                    checked: trimLeading,
                    onChange: setTrimLeading,
                    label: "Trim leading spaces",
                    hint: "Remove starting whitespace",
                    color: "text-indigo-500",
                  },
                  {
                    id: "rdl-remove-blank",
                    checked: removeBlank,
                    onChange: setRemoveBlank,
                    label: "Remove blank lines",
                    hint: "Delete empty lines",
                    color: "text-indigo-500",
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    htmlFor={opt.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-violet-50/40 dark:hover:bg-violet-900/10 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      id={opt.id}
                      checked={opt.checked}
                      onChange={(e) => opt.onChange(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-violet-600 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {opt.hint}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced options toggle */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden dark:bg-slate-800/80 dark:border-slate-700/50">
              <button
                id="rdl-advanced-toggle"
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-violet-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                    Advanced Options
                  </span>
                  {(sort !== "none" || lineNumbers || filterPattern) && (
                    <span className="text-xs px-2 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-full font-medium">
                      Active
                    </span>
                  )}
                </div>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showAdvanced && (
                <div className="px-5 pb-5 space-y-5 border-t border-slate-100 dark:border-slate-700/60 pt-4">
                  {/* Sort */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                      <ArrowUpDown className="w-4 h-4 text-violet-500" />
                      Sort Output
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {sortOptions.map((s) => (
                        <button
                          key={s.value}
                          id={`rdl-sort-${s.value}`}
                          onClick={() => setSort(s.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                            sort === s.value
                              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600 dark:hover:border-violet-500"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line numbers */}
                  <label
                    htmlFor="rdl-line-numbers"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-violet-50/40 dark:hover:bg-violet-900/10 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      id="rdl-line-numbers"
                      checked={lineNumbers}
                      onChange={(e) => setLineNumbers(e.target.checked)}
                      className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-violet-500" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Prepend line numbers
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Adds &quot;1. 2. 3.&quot; before each line
                      </p>
                    </div>
                  </label>

                  {/* Filter by pattern */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                      <Shuffle className="w-4 h-4 text-violet-500" />
                      Filter Lines by Pattern (Regex)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        id="rdl-filter-remove"
                        onClick={() => setFilterMode("remove")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          filterMode === "remove"
                            ? "bg-red-500 text-white border-transparent"
                            : "bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        Remove matching lines
                      </button>
                      <button
                        id="rdl-filter-keep"
                        onClick={() => setFilterMode("keep")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          filterMode === "keep"
                            ? "bg-emerald-500 text-white border-transparent"
                            : "bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        Keep matching lines
                      </button>
                    </div>
                    <input
                      id="rdl-filter-input"
                      type="text"
                      value={filterPattern}
                      onChange={(e) => setFilterPattern(e.target.value)}
                      placeholder="e.g. ^# or TODO or \d+"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all font-mono"
                    />
                    <label
                      htmlFor="rdl-filter-case"
                      className="flex items-center gap-2 mt-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        id="rdl-filter-case"
                        checked={filterCaseSensitive}
                        onChange={(e) => setFilterCaseSensitive(e.target.checked)}
                        className="w-3.5 h-3.5 accent-violet-600"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Case-sensitive filter
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right panel ─────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Stats bar */}
            {total > 0 && (
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-violet-200 dark:shadow-violet-900/30">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 opacity-80" />
                  <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                    Results
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total", value: total },
                    { label: "Kept", value: kept, sub: `${100 - pct}%` },
                    { label: "Removed", value: removed, sub: `${pct}%` },
                    { label: "Unique dupes", value: duplicateCount },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wider opacity-70">
                        {s.label}
                      </p>
                      {s.sub && (
                        <p className="text-xs font-semibold opacity-60">{s.sub}</p>
                      )}
                    </div>
                  ))}
                </div>
                {removed > 0 && (
                  <div className="mt-4">
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs opacity-60 mt-1 text-right">
                      {pct}% duplicates removed
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Output card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden dark:bg-slate-800/80 dark:border-slate-700/50">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                    Output
                  </span>
                  {kept > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                      {kept} unique lines
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    id="rdl-toggle-preview"
                    onClick={() => setShowPreview((v) => !v)}
                    title={showPreview ? "Hide preview" : "Show preview"}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:text-violet-400 dark:hover:bg-violet-900/30 transition-all"
                  >
                    {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    id="rdl-copy-btn"
                    onClick={handleCopy}
                    disabled={!output}
                    title="Copy output"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:text-violet-400 dark:hover:bg-violet-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    id="rdl-download-btn"
                    onClick={handleDownload}
                    disabled={!output}
                    title="Download as .txt"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:text-violet-400 dark:hover:bg-violet-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {showPreview ? (
                output ? (
                  <pre className="p-5 text-sm font-mono text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto">
                    {output}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
                    <Layers className="w-12 h-12 mb-3" />
                    <p className="text-sm">Unique lines will appear here</p>
                    <p className="text-xs mt-1 opacity-70">
                      Start typing or paste text on the left
                    </p>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center py-12 text-slate-300 dark:text-slate-600">
                  <EyeOff className="w-6 h-6 mr-2" />
                  <span className="text-sm">Preview hidden</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                id="rdl-copy-full-btn"
                onClick={handleCopy}
                disabled={!output}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Output
                  </>
                )}
              </button>
              <button
                id="rdl-download-full-btn"
                onClick={handleDownload}
                disabled={!output}
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600/60 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <Download className="w-4 h-4" /> Download .txt
              </button>
            </div>

            {/* Tips */}
            <div className="bg-violet-50/60 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-3">
                Tips
              </h3>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <li>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Case sensitivity:</span>{" "}
                  By default &quot;Apple&quot; and &quot;apple&quot; are treated as duplicates.
                </li>
                <li>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Trimming:</span>{" "}
                  &quot;hello &quot; and &quot;hello&quot; become the same line when trim is on.
                </li>
                <li>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Filter patterns:</span>{" "}
                  Use regex like <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">^#</code> to target comment lines.
                </li>
                <li>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Sorting:</span>{" "}
                  Applied after deduplication for predictable results.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
