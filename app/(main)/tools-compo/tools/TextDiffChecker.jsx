"use client";

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createTwoFilesPatch,
  diffChars,
  diffLines,
  diffWords,
  diffWordsWithSpace,
} from "diff";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  Columns2,
  Copy,
  Download,
  Equal,
  FileDiff,
  FileText,
  GitCompareArrows,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Rows3,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import { useRecentTools } from "@/hooks/useRecentTools";

const TOOL_META = {
  title: "Text Diff Checker",
  link: "/tools/text-diff",
  description:
    "Compare two texts and highlight added, removed and unchanged lines, words or characters with unified and split views.",
  icon: "FileDiff",
  keywords: [
    "text diff",
    "diff checker",
    "compare text",
    "text comparison",
    "find differences",
  ],
  categories: ["Developer", "Text"],
};

const MAX_DIFF_CHARS = 250_000;
const MAX_RENDER_ROWS = 3_000;
const MAX_RENDER_PARTS = 4_000;

const SAMPLE_OLD = `# ToolsTrek release notes

Version 2.21.0 — October 2026
- 113 browser-first tools
- Image Resizer
- PDF Merger
- Watch for the percentage calculator

This release focuses on privacy.
Every file stays in your browser.`;

const SAMPLE_NEW = `# ToolsTrek release notes

Version 2.22.0 — October 2026
- 116 browser-first tools
- Image Resizer
- PDF Merger
- New image compressor
- New percentage calculator
- New text diff checker

This release focuses on privacy and speed.
Every file stays in your browser.`;

const VIEW_OPTIONS = [
  { value: "unified", label: "Unified", icon: Rows3 },
  { value: "split", label: "Split", icon: Columns2 },
];

const MODE_OPTIONS = [
  { value: "lines", label: "Lines" },
  { value: "words", label: "Words" },
  { value: "chars", label: "Characters" },
];

function normalizeText(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n");
}

function splitLines(value) {
  if (!value) return [];
  const lines = value.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function countUnits(value, mode) {
  if (!value) return 0;
  if (mode === "lines") return splitLines(value).length;
  if (mode === "words") {
    const trimmed = value.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }
  return value.length;
}

function buildStats(parts, mode, oldValue, newValue) {
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  let commonLength = 0;

  parts.forEach((part) => {
    const units = countUnits(part.value, mode);
    if (part.added) {
      added += units;
    } else if (part.removed) {
      removed += units;
    } else {
      unchanged += units;
      commonLength += part.value.length;
    }
  });

  const total = oldValue.length + newValue.length;
  const similarity =
    total === 0 ? 100 : Math.max(0, Math.min(100, (2 * commonLength * 100) / total));

  return { added, removed, unchanged, similarity };
}

function buildUnifiedRows(parts) {
  const rows = [];
  let oldLine = 1;
  let newLine = 1;

  parts.forEach((part) => {
    const lines = splitLines(part.value);
    lines.forEach((text) => {
      if (part.added) {
        rows.push({
          type: "added",
          oldNo: null,
          newNo: newLine,
          text,
        });
        newLine += 1;
      } else if (part.removed) {
        rows.push({
          type: "removed",
          oldNo: oldLine,
          newNo: null,
          text,
        });
        oldLine += 1;
      } else {
        rows.push({
          type: "same",
          oldNo: oldLine,
          newNo: newLine,
          text,
        });
        oldLine += 1;
        newLine += 1;
      }
    });
  });

  return rows;
}

function buildSplitRows(parts) {
  const rows = [];
  let oldLine = 1;
  let newLine = 1;
  let removed = [];
  let added = [];

  const flush = () => {
    const length = Math.max(removed.length, added.length);
    for (let index = 0; index < length; index += 1) {
      rows.push({
        left: removed[index]
          ? { type: "removed", no: oldLine++, text: removed[index] }
          : null,
        right: added[index]
          ? { type: "added", no: newLine++, text: added[index] }
          : null,
      });
    }
    removed = [];
    added = [];
  };

  parts.forEach((part) => {
    const lines = splitLines(part.value);
    if (part.added) {
      added.push(...lines);
    } else if (part.removed) {
      removed.push(...lines);
    } else {
      flush();
      lines.forEach((text) => {
        rows.push({
          left: { type: "same", no: oldLine++, text },
          right: { type: "same", no: newLine++, text },
        });
      });
    }
  });
  flush();

  return rows;
}

function computeDiff(oldText, newText, mode, options) {
  const oldValue = normalizeText(oldText);
  const newValue = normalizeText(newText);
  const diffOptions = {
    ignoreCase: options.ignoreCase,
  };

  let parts;
  if (mode === "lines") {
    parts = diffLines(oldValue, newValue, {
      ...diffOptions,
      ignoreWhitespace: options.ignoreWhitespace,
    });
  } else if (mode === "words") {
    parts = options.ignoreWhitespace
      ? diffWords(oldValue, newValue, diffOptions)
      : diffWordsWithSpace(oldValue, newValue, diffOptions);
  } else {
    parts = diffChars(oldValue, newValue, diffOptions);
  }

  const stats = buildStats(parts, mode, oldValue, newValue);

  return {
    parts,
    stats,
    unifiedRows: mode === "lines" ? buildUnifiedRows(parts) : [],
    splitRows: mode === "lines" ? buildSplitRows(parts) : [],
    oldValue,
    newValue,
  };
}

function NoDifferences() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
        <Check className="h-6 w-6" />
      </span>
      <p className="text-base font-bold text-gray-800 sm:text-lg dark:text-gray-100">
        No differences found
      </p>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        Both sides match exactly under the current comparison options. Try
        turning off “Ignore case” or “Ignore whitespace”, or switch to Words /
        Characters for a finer comparison.
      </p>
    </div>
  );
}

function DiffStat({ type, value, unit }) {
  const styles =
    type === "added"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
      : type === "removed"
        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs sm:text-sm font-bold ${styles}`}
    >
      {type === "added" ? (
        <Plus className="h-3 w-3" />
      ) : type === "removed" ? (
        <Minus className="h-3 w-3" />
      ) : (
        <Equal className="h-3 w-3" />
      )}
      {value} {unit}
    </span>
  );
}

export default function TextDiffChecker() {
  const { addRecentTool } = useRecentTools();
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [mode, setMode] = useState("lines");
  const [view, setView] = useState("unified");
  const [options, setOptions] = useState({
    ignoreCase: false,
    ignoreWhitespace: false,
  });
  const [copied, setCopied] = useState(false);

  const deferredOld = useDeferredValue(oldText);
  const deferredNew = useDeferredValue(newText);
  const isStale = oldText !== deferredOld || newText !== deferredNew;

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const tooLarge =
    deferredOld.length > MAX_DIFF_CHARS || deferredNew.length > MAX_DIFF_CHARS;

  const diffState = useMemo(() => {
    if (tooLarge) {
      return {
        error: `Each side is limited to ${MAX_DIFF_CHARS.toLocaleString("en-US")} characters to keep the diff responsive. Trim the text or compare it in smaller sections.`,
      };
    }

    try {
      return computeDiff(deferredOld, deferredNew, mode, options);
    } catch (error) {
      console.error("Text diff failed:", error);
      return {
        error:
          "The comparison failed unexpectedly. Try a smaller block of text or switch the diff mode.",
      };
    }
  }, [deferredOld, deferredNew, mode, options, tooLarge]);

  const patchText = useMemo(() => {
    if (tooLarge || (!deferredOld && !deferredNew)) return "";
    try {
      return createTwoFilesPatch(
        "original.txt",
        "modified.txt",
        normalizeText(deferredOld),
        normalizeText(deferredNew),
        "",
        "",
        {
          context: 3,
          ignoreCase: options.ignoreCase,
          ignoreWhitespace: options.ignoreWhitespace,
        },
      );
    } catch (error) {
      console.error("Patch creation failed:", error);
      return "";
    }
  }, [deferredOld, deferredNew, options, tooLarge]);

  const stats = diffState.stats;
  const hasDifference = Boolean(
    stats && (stats.added > 0 || stats.removed > 0),
  );
  const bothEmpty = !deferredOld && !deferredNew;
  const canExportPatch = Boolean(patchText) && hasDifference;
  const unit =
    mode === "lines" ? "lines" : mode === "words" ? "words" : "chars";

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    if (nextMode !== "lines") setView("unified");
  };

  const swapTexts = () => {
    setOldText(newText);
    setNewText(oldText);
    toast.info("Original and modified text swapped.");
  };

  const loadSample = () => {
    setOldText(SAMPLE_OLD);
    setNewText(SAMPLE_NEW);
    setMode("lines");
    setView("unified");
    toast.success("Sample text loaded — scroll down to inspect the diff.");
  };

  const clearAll = () => {
    setOldText("");
    setNewText("");
    toast.info("Both text panes cleared.");
  };

  const copyPatch = async () => {
    if (!canExportPatch) return;
    try {
      await navigator.clipboard.writeText(patchText);
      setCopied(true);
      toast.success("Unified diff copied to clipboard.");
    } catch {
      toast.error("Could not copy the patch. Use the download button instead.");
    }
  };

  const downloadPatch = () => {
    if (!canExportPatch) return;
    try {
      const blob = new Blob([patchText], {
        type: "text/x-diff;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "toolstrek-text-diff.diff";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Diff patch downloaded.");
    } catch (error) {
      console.error("Patch download failed:", error);
      toast.error("Could not download the patch.");
    }
  };

  const renderUnifiedDiff = () => {
    if (!stats || !hasDifference) return null;

    const rows = diffState.unifiedRows.slice(0, MAX_RENDER_ROWS);
    const hiddenRows = diffState.unifiedRows.length - rows.length;

    return (
      <>
        <div className="min-w-0 overflow-x-auto">
          <div className="min-w-[560px] font-mono text-sm sm:min-w-[680px] sm:text-[15px]">
            {rows.map((row, index) => {
              const isAdded = row.type === "added";
              const isRemoved = row.type === "removed";
              return (
                <div
                  key={`unified-${index}-${row.oldNo ?? "x"}-${row.newNo ?? "x"}`}
                  className={`grid grid-cols-[2.75rem_2.75rem_1.75rem_minmax(0,1fr)] items-start border-b border-transparent sm:grid-cols-[3.5rem_3.5rem_2rem_minmax(0,1fr)] ${
                    isAdded
                      ? "bg-emerald-50/80 dark:bg-emerald-950/20"
                      : isRemoved
                        ? "bg-rose-50/80 dark:bg-rose-950/20"
                        : "bg-transparent"
                  }`}
                >
                  <span className="select-none border-r border-gray-100 px-2 py-1 text-right text-[11px] leading-6 text-gray-400 sm:text-xs dark:border-gray-800 dark:text-gray-500">
                    {row.oldNo ?? ""}
                  </span>
                  <span className="select-none border-r border-gray-100 px-2 py-1 text-right text-[11px] leading-6 text-gray-400 sm:text-xs dark:border-gray-800 dark:text-gray-500">
                    {row.newNo ?? ""}
                  </span>
                  <span
                    className={`select-none px-1.5 py-1 text-center text-base font-bold leading-6 ${
                      isAdded
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isRemoved
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-gray-300 dark:text-gray-700"
                    }`}
                  >
                    {isAdded ? "+" : isRemoved ? "−" : " "}
                  </span>
                  <code
                    className={`whitespace-pre-wrap break-words px-2 py-1 leading-6 ${
                      isAdded
                        ? "text-emerald-900 dark:text-emerald-200"
                        : isRemoved
                          ? "text-rose-900 dark:text-rose-200"
                          : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {row.text || "\u00A0"}
                  </code>
                </div>
              );
            })}
          </div>
        </div>
        {hiddenRows > 0 ? (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">
            Showing the first {MAX_RENDER_ROWS.toLocaleString("en-US")} diff rows.
            {hiddenRows.toLocaleString("en-US")} more rows are hidden to keep the
            page responsive.
          </div>
        ) : null}
      </>
    );
  };

  const renderSplitDiff = () => {
    if (!stats || !hasDifference) return null;
    const rows = diffState.splitRows.slice(0, MAX_RENDER_ROWS);
    const hiddenRows = diffState.splitRows.length - rows.length;

    return (
      <>
        <div className="hidden grid-cols-2 border-b border-gray-200 bg-gray-50 px-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 sm:text-xs md:grid dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400">
          <span className="border-r border-gray-200 px-3 py-2.5 dark:border-gray-800">
            Original
          </span>
          <span className="px-3 py-2.5">Modified</span>
        </div>
        <div className="font-mono text-sm sm:text-[15px]">
          {rows.map((row, index) => (
            <div
              key={`split-${index}`}
              className="grid grid-cols-1 border-b border-gray-100 last:border-b-0 md:grid-cols-2 md:border-b-0 dark:border-gray-800"
            >
              {["left", "right"].map((side) => {
                const cell = row[side];
                const isAdded = cell?.type === "added";
                const isRemoved = cell?.type === "removed";
                return (
                  <div
                    key={side}
                    className={`grid grid-cols-[3rem_1.75rem_minmax(0,1fr)] items-start border-b border-gray-100 sm:grid-cols-[3.5rem_2rem_minmax(0,1fr)] md:border-b-0 dark:border-gray-800 ${
                      isAdded
                        ? "bg-emerald-50/80 dark:bg-emerald-950/20"
                        : isRemoved
                          ? "bg-rose-50/80 dark:bg-rose-950/20"
                          : "bg-transparent"
                    } ${side === "left" ? "md:border-r md:border-gray-200 md:dark:border-gray-800" : ""}`}
                  >
                    <span className="select-none px-2 py-1 text-right text-[11px] leading-6 text-gray-400 sm:text-xs dark:text-gray-500">
                      {cell?.no ?? ""}
                    </span>
                    <span
                      className={`select-none py-1 text-center text-base font-bold leading-6 ${
                        isAdded
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isRemoved
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-gray-300 dark:text-gray-700"
                      }`}
                    >
                      {isAdded ? "+" : isRemoved ? "−" : " "}
                    </span>
                    <code
                      className={`min-w-0 whitespace-pre-wrap break-words px-1.5 py-1 leading-6 ${
                        isAdded
                          ? "text-emerald-900 dark:text-emerald-200"
                          : isRemoved
                            ? "text-rose-900 dark:text-rose-200"
                            : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {cell?.text || "\u00A0"}
                    </code>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {hiddenRows > 0 ? (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">
            Showing the first {MAX_RENDER_ROWS.toLocaleString("en-US")} diff rows.
            {hiddenRows.toLocaleString("en-US")} more rows are hidden to keep the
            page responsive.
          </div>
        ) : null}
      </>
    );
  };

  const renderInlineDiff = () => {
    if (!stats) return null;
    const parts = diffState.parts.slice(0, MAX_RENDER_PARTS);
    const hiddenParts = diffState.parts.length - parts.length;

    return (
      <>
        <pre className="max-h-[36rem] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-7 text-gray-700 sm:p-5 sm:text-[15px] dark:text-gray-300">
          {parts.map((part, index) => (
            <span
              key={`inline-${index}`}
              className={
                part.added
                  ? "rounded-sm bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200"
                  : part.removed
                    ? "rounded-sm bg-rose-100 text-rose-900 line-through decoration-rose-400/70 dark:bg-rose-900/40 dark:text-rose-200"
                    : ""
              }
            >
              {part.value}
            </span>
          ))}
        </pre>
        {hiddenParts > 0 ? (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">
            Showing the first {MAX_RENDER_PARTS.toLocaleString("en-US")} diff
            segments. Switch to Lines for a more compact view.
          </div>
        ) : null}
      </>
    );
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BackButton className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:bg-gray-800" />
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Developer &amp; Text Tools
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700 sm:inline-flex dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Nothing leaves your browser
          </span>
          <FavoriteButton
            tool={TOOL_META}
            className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 sm:text-sm dark:bg-indigo-950/40 dark:text-indigo-300">
          <FileDiff className="h-3.5 w-3.5" />
          Free Text Diff Checker
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
          Compare text,{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            line by line.
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
          Paste an original and a revised version to see exactly what changed.
          Switch between line, word and character granularity, flip between
          unified and split views, and export the result as a standard{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs sm:text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            .diff
          </code>{" "}
          patch.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
          <GitCompareArrows className="h-4 w-4 text-indigo-500" />
          Paste into both panes — or load a sample to explore the tool.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-gray-600 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Load sample
          </button>
          <button
            type="button"
            onClick={swapTexts}
            disabled={!oldText && !newText}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-gray-600 transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Swap
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={!oldText && !newText}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-gray-500 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-rose-900 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear both
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[
          {
            key: "original",
            label: "Original text",
            value: oldText,
            setter: setOldText,
            accent: "rose",
            placeholder:
              "Paste the original version here…\n\nTip: keep line breaks to get a cleaner line-by-line diff.",
          },
          {
            key: "modified",
            label: "Modified text",
            value: newText,
            setter: setNewText,
            accent: "emerald",
            placeholder:
              "Paste the revised version here…\n\nAdded lines appear in green and removed lines in red.",
          },
        ].map((pane) => {
          const lines = normalizeText(pane.value).length
            ? normalizeText(pane.value).split("\n").length
            : 0;
          const words = pane.value.trim()
            ? pane.value.trim().split(/\s+/).length
            : 0;
          const isOriginal = pane.key === "original";

          return (
            <section
              key={pane.key}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs sm:text-sm font-black ${
                      isOriginal
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
                    }`}
                  >
                    {isOriginal ? "A" : "B"}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 sm:text-base dark:text-gray-100">
                      {pane.label}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
                      {lines.toLocaleString("en-US")} lines ·{" "}
                      {words.toLocaleString("en-US")} words ·{" "}
                      {pane.value.length.toLocaleString("en-US")} chars
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => pane.setter("")}
                  disabled={!pane.value}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                  aria-label={`Clear ${pane.label.toLowerCase()}`}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              <textarea
                aria-label={pane.label}
                value={pane.value}
                onChange={(event) => pane.setter(event.target.value)}
                placeholder={pane.placeholder}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                className="h-72 w-full resize-y bg-transparent p-4 font-mono text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:bg-white sm:h-80 sm:p-5 sm:text-[15px] lg:h-96 dark:text-gray-200 dark:placeholder:text-gray-600 dark:focus:bg-gray-950"
              />
            </section>
          );
        })}
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/40">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleModeChange(option.value)}
                  aria-pressed={mode === option.value}
                  className={`rounded-lg px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-bold transition ${
                    mode === option.value
                      ? "bg-white text-indigo-700 shadow-sm dark:bg-gray-900 dark:text-indigo-300"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="hidden h-5 w-px bg-gray-200 sm:block dark:bg-gray-700" />

            <label className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={options.ignoreCase}
                onChange={(event) =>
                  setOptions((current) => ({
                    ...current,
                    ignoreCase: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 accent-indigo-600 dark:border-gray-600"
              />
              Ignore case
            </label>

            <label
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${
                mode === "chars"
                  ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              title={
                mode === "chars"
                  ? "Whitespace filtering is available in Lines and Words modes."
                  : "Ignore whitespace differences"
              }
            >
              <input
                type="checkbox"
                checked={options.ignoreWhitespace}
                disabled={mode === "chars"}
                onChange={(event) =>
                  setOptions((current) => ({
                    ...current,
                    ignoreWhitespace: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 accent-indigo-600 disabled:opacity-50 dark:border-gray-600"
              />
              Ignore whitespace
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mode === "lines" ? (
              <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                {VIEW_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setView(option.value)}
                      aria-pressed={view === option.value}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-bold transition ${
                        view === option.value
                          ? "bg-white text-indigo-700 shadow-sm dark:bg-gray-900 dark:text-indigo-300"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <button
              type="button"
              onClick={copyPatch}
              disabled={!canExportPatch}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-bold text-gray-600 transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy .diff"}
            </button>
            <button
              type="button"
              onClick={downloadPatch}
              disabled={!canExportPatch}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-bold text-gray-600 transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          {stats ? (
            <>
              <DiffStat type="added" value={stats.added} unit={unit} />
              <DiffStat type="removed" value={stats.removed} unit={unit} />
              <DiffStat type="same" value={stats.unchanged} unit={unit} />
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs sm:text-sm font-bold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
                <GitCompareArrows className="h-3 w-3" />
                {stats.similarity.toFixed(1)}% similar
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500">
              Add text to both panes to see comparison statistics.
            </span>
          )}
          {isStale ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Updating…
            </span>
          ) : null}
        </div>

        <div className="min-h-[16rem]">
          {diffState.error ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <p className="text-base font-bold text-gray-800 sm:text-lg dark:text-gray-100">
                This comparison is too large
              </p>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {diffState.error}
              </p>
            </div>
          ) : bothEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-300">
                <FileText className="h-6 w-6" />
              </span>
              <p className="text-base font-bold text-gray-800 sm:text-lg dark:text-gray-100">
                Your diff will appear here
              </p>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Paste two versions of a document, contract, essay, config file
                or code snippet — or press “Load sample” to see the tool in
                action.
              </p>
            </div>
          ) : !hasDifference ? (
            <NoDifferences />
          ) : mode === "lines" && view === "split" ? (
            renderSplitDiff()
          ) : mode === "lines" ? (
            renderUnifiedDiff()
          ) : (
            renderInlineDiff()
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 bg-gray-50/60 px-4 py-2.5 text-[11px] sm:text-xs font-semibold text-gray-500 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            Added
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" />
            Removed
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-gray-300 dark:bg-gray-600" />
            Unchanged
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <Settings2 className="h-3 w-3" />
            {mode === "lines"
              ? "Line diff"
              : mode === "words"
                ? "Word diff"
                : "Character diff"}
          </span>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            title: "Lines vs words vs characters",
            body: "Use Lines for code and documents, Words for prose edits, and Characters for the smallest punctuation-level changes.",
          },
          {
            title: "Ignore noise",
            body: "Ignore case or whitespace when formatting changes should not count as real differences. The comparison updates instantly.",
          },
          {
            title: "Take the patch with you",
            body: "Copy or download a standard unified .diff patch for code review, version control and documentation workflows.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60"
          >
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {item.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {item.body}
            </p>
          </div>
        ))}
      </section>
    </ToolPageShell>
  );
}
