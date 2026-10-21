"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Check,
  Copy,
  Equal,
  Info,
  Lightbulb,
  Minus,
  Percent,
  Plus,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import { useRecentTools } from "@/hooks/useRecentTools";

const TOOL_META = {
  title: "Percentage Calculator",
  link: "/tools/percentage-calculator",
  description:
    "Calculate percentages, percent change, add or subtract a percentage and reverse percentages with a clear formula breakdown.",
  icon: "Percent",
  keywords: [
    "percentage calculator",
    "percent calculator",
    "percent change",
    "reverse percentage",
  ],
  categories: ["Calculator", "Education"],
};

const MODES = {
  of: {
    tab: "X% of Y",
    icon: Percent,
    title: "What is X% of Y?",
    subtitle: "Find a percentage of any value.",
    aLabel: "Percentage (X)",
    aPlaceholder: "15",
    aSuffix: "%",
    bLabel: "Value (Y)",
    bPlaceholder: "200",
    formula: "(X ÷ 100) × Y",
    example: { a: "15", b: "200" },
  },
  isWhat: {
    tab: "X is what % of Y",
    icon: Equal,
    title: "X is what percent of Y?",
    subtitle: "Turn a part-to-whole ratio into a percentage.",
    aLabel: "Part (X)",
    aPlaceholder: "30",
    bLabel: "Whole (Y)",
    bPlaceholder: "200",
    formula: "(X ÷ Y) × 100",
    example: { a: "30", b: "200" },
  },
  change: {
    tab: "Increase / decrease",
    icon: TrendingUp,
    title: "Percentage increase or decrease",
    subtitle: "Compare an original value with a new value.",
    aLabel: "Original value",
    aPlaceholder: "200",
    bLabel: "New value",
    bPlaceholder: "250",
    formula: "((New − Original) ÷ |Original|) × 100",
    example: { a: "200", b: "250" },
  },
  addSubtract: {
    tab: "Add / subtract %",
    icon: Plus,
    title: "Add or subtract a percentage",
    subtitle: "Apply a percentage markup or discount to a value.",
    aLabel: "Base value",
    aPlaceholder: "200",
    bLabel: "Percentage",
    bPlaceholder: "15",
    bSuffix: "%",
    formula: "Base × (1 ± Percentage ÷ 100)",
    example: { a: "200", b: "15" },
  },
  reverse: {
    tab: "Reverse %",
    icon: ArrowRightLeft,
    title: "Reverse percentage",
    subtitle: "Find the whole when you know a part and its percentage.",
    aLabel: "Known value (X)",
    aPlaceholder: "30",
    bLabel: "Percentage (Y%)",
    bPlaceholder: "15",
    bSuffix: "%",
    formula: "X ÷ (Y ÷ 100)",
    example: { a: "30", b: "15" },
  },
};

const DEFAULT_INPUTS = {
  of: { a: "15", b: "200" },
  isWhat: { a: "30", b: "200" },
  change: { a: "200", b: "250" },
  addSubtract: { a: "200", b: "15" },
  reverse: { a: "30", b: "15" },
};

function parseNumber(raw) {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : NaN;
  const cleaned = String(raw ?? "")
    .trim()
    .replace(/[,\s_]/g, "")
    .replace(/[$€£¥₹৳%]/g, "");
  if (!cleaned) return NaN;
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return NaN;
  return Number(cleaned);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "—";
  const absolute = Math.abs(value);
  if (absolute !== 0 && (absolute >= 1e12 || absolute < 1e-6)) {
    return value.toExponential(4);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(value);
}

function computeResult(mode, a, b, direction) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { error: "Enter valid numbers in both fields to see the result." };
  }

  if (mode === "of") {
    const value = (a / 100) * b;
    return {
      value,
      suffix: "",
      label: `${formatNumber(a)}% of ${formatNumber(b)}`,
      formula: `(${formatNumber(a)} ÷ 100) × ${formatNumber(b)}`,
      steps: [
        `${formatNumber(a)} ÷ 100 = ${formatNumber(a / 100)}`,
        `${formatNumber(a / 100)} × ${formatNumber(b)} = ${formatNumber(value)}`,
      ],
      tone: "neutral",
    };
  }

  if (mode === "isWhat") {
    if (b === 0) {
      return { error: "The whole value cannot be zero — division by zero is undefined." };
    }
    const value = (a / b) * 100;
    return {
      value,
      suffix: "%",
      label: `${formatNumber(a)} out of ${formatNumber(b)}`,
      formula: `(${formatNumber(a)} ÷ ${formatNumber(b)}) × 100`,
      steps: [
        `${formatNumber(a)} ÷ ${formatNumber(b)} = ${formatNumber(a / b)}`,
        `${formatNumber(a / b)} × 100 = ${formatNumber(value)}%`,
      ],
      tone: "neutral",
    };
  }

  if (mode === "change") {
    if (a === 0) {
      return { error: "The original value cannot be zero. Percent change needs a non-zero starting point." };
    }
    const value = ((b - a) / Math.abs(a)) * 100;
    const difference = b - a;
    const tone = value > 0 ? "up" : value < 0 ? "down" : "neutral";
    return {
      value,
      suffix: "%",
      difference,
      label:
        tone === "up"
          ? `Increase from ${formatNumber(a)} to ${formatNumber(b)}`
          : tone === "down"
            ? `Decrease from ${formatNumber(a)} to ${formatNumber(b)}`
            : `No change from ${formatNumber(a)} to ${formatNumber(b)}`,
      formula: `((${formatNumber(b)} − ${formatNumber(a)}) ÷ |${formatNumber(a)}|) × 100`,
      steps: [
        `Difference: ${formatNumber(b)} − ${formatNumber(a)} = ${formatNumber(difference)}`,
        `${formatNumber(difference)} ÷ ${formatNumber(Math.abs(a))} = ${formatNumber(difference / Math.abs(a))}`,
        `${formatNumber(difference / Math.abs(a))} × 100 = ${formatNumber(value)}%`,
      ],
      tone,
    };
  }

  if (mode === "addSubtract") {
    const sign = direction === "add" ? 1 : -1;
    const change = a * (b / 100) * sign;
    const value = a + change;
    return {
      value,
      suffix: "",
      difference: change,
      label: `${direction === "add" ? "Adding" : "Subtracting"} ${formatNumber(b)}% ${direction === "add" ? "to" : "from"} ${formatNumber(a)}`,
      formula: `${formatNumber(a)} ${sign > 0 ? "+" : "−"} (${formatNumber(a)} × ${formatNumber(b)} ÷ 100)`,
      steps: [
        `${formatNumber(a)} × ${formatNumber(b)}% = ${formatNumber(Math.abs(change))}`,
        `${formatNumber(a)} ${sign > 0 ? "+" : "−"} ${formatNumber(Math.abs(change))} = ${formatNumber(value)}`,
      ],
      tone: sign > 0 ? "up" : "down",
    };
  }

  // reverse
  if (b === 0) {
    return { error: "The percentage cannot be zero. A part cannot represent 0% of a whole." };
  }
  const value = a / (b / 100);
  return {
    value,
    suffix: "",
    label: `${formatNumber(a)} is ${formatNumber(b)}% of what?`,
    formula: `${formatNumber(a)} ÷ (${formatNumber(b)} ÷ 100)`,
    steps: [
      `${formatNumber(b)} ÷ 100 = ${formatNumber(b / 100)}`,
      `${formatNumber(a)} ÷ ${formatNumber(b / 100)} = ${formatNumber(value)}`,
    ],
    tone: "neutral",
  };
}

function ReferenceCard({ mode, active, onSelect }) {
  const config = MODES[mode];
  const Icon = config.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={`group rounded-2xl border p-4 text-left transition-all sm:p-5 ${
        active
          ? "border-violet-300 bg-violet-50 shadow-sm dark:border-violet-800 dark:bg-violet-950/30"
          : "border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-violet-900 dark:hover:bg-violet-950/20"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
            active
              ? "bg-violet-600 text-white"
              : "bg-gray-100 text-gray-500 group-hover:bg-violet-100 group-hover:text-violet-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-bold text-gray-900 sm:text-base dark:text-white">
          {config.tab}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm dark:text-gray-400">
        {config.subtitle}
      </p>
      <code className="mt-2 block rounded-lg bg-gray-50 px-2 py-1.5 text-xs font-semibold text-violet-700 sm:text-sm dark:bg-gray-950 dark:text-violet-300">
        {config.formula}
      </code>
    </button>
  );
}

export default function PercentageCalculator() {
  const { addRecentTool } = useRecentTools();
  const [mode, setMode] = useState("of");
  const [direction, setDirection] = useState("add");
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const config = MODES[mode];
  const ActiveIcon = config.icon;
  const current = inputs[mode];
  const a = parseNumber(current.a);
  const b = parseNumber(current.b);

  const result = useMemo(
    () => computeResult(mode, a, b, direction),
    [mode, a, b, direction],
  );

  const displayValue = result.error
    ? "—"
    : `${mode === "change" && result.value > 0 ? "+" : ""}${formatNumber(result.value)}${result.suffix}`;

  const updateInput = (field, value) => {
    setInputs((currentInputs) => ({
      ...currentInputs,
      [mode]: { ...currentInputs[mode], [field]: value },
    }));
    setCopied(false);
  };

  const swapValues = () => {
    setInputs((currentInputs) => ({
      ...currentInputs,
      [mode]: {
        a: currentInputs[mode].b,
        b: currentInputs[mode].a,
      },
    }));
    setCopied(false);
  };

  const loadExample = () => {
    setInputs((currentInputs) => ({
      ...currentInputs,
      [mode]: { ...config.example },
    }));
    setCopied(false);
  };

  const resetCurrent = () => {
    setInputs((currentInputs) => ({
      ...currentInputs,
      [mode]: { a: "", b: "" },
    }));
    setCopied(false);
  };

  const copyResult = async () => {
    if (result.error) return;
    const text = `${displayValue}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Result copied to clipboard.");
    } catch {
      toast.error("Could not copy the result. Select it manually instead.");
    }
  };

  const toneClasses =
    result.tone === "up"
      ? "text-emerald-300"
      : result.tone === "down"
        ? "text-rose-300"
        : "text-white";

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BackButton className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:bg-gray-800" />
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
            Calculator Tools
          </span>
        </div>
        <FavoriteButton
          tool={TOOL_META}
          className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        />
      </div>

      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 sm:text-sm dark:bg-violet-950/40 dark:text-violet-300">
          <Percent className="h-3.5 w-3.5" />
          Free Percentage Calculator
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
          Percentages,{" "}
          <span className="text-violet-600 dark:text-violet-400">
            minus the guesswork.
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
          Five calculators in one: find X% of Y, work out what percent one number
          is of another, measure increase or decrease, add or subtract a
          percentage, and reverse a percentage. Every answer comes with the
          formula and step-by-step working.
        </p>
      </div>

      <div className="mb-6 overflow-x-auto pb-1">
        <div className="mx-auto flex w-max min-w-full gap-1.5 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm sm:min-w-0 sm:w-fit dark:border-gray-800 dark:bg-gray-900">
          {Object.entries(MODES).map(([key, item]) => {
            const Icon = item.icon;
            const active = mode === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all sm:px-3.5 sm:py-2.5 sm:text-sm ${
                  active
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-violet-50 hover:text-violet-700 dark:text-gray-400 dark:hover:bg-violet-950/20 dark:hover:text-violet-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-6 dark:border-gray-800 dark:bg-gray-950/40">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                <ActiveIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                  {config.title}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                  {config.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {mode === "addSubtract" ? (
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 sm:text-sm dark:text-gray-400">
                  Operation
                </span>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setDirection("add")}
                    aria-pressed={direction === "add"}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition sm:py-2.5 sm:text-sm ${
                      direction === "add"
                        ? "bg-white text-emerald-700 shadow-sm dark:bg-gray-900 dark:text-emerald-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("subtract")}
                    aria-pressed={direction === "subtract"}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition sm:py-2.5 sm:text-sm ${
                      direction === "subtract"
                        ? "bg-white text-rose-700 shadow-sm dark:bg-gray-900 dark:text-rose-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                    Subtract percentage
                  </button>
                </div>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="percentage-input-a"
                className="mb-1.5 flex items-center justify-between text-xs font-bold text-gray-700 sm:text-sm dark:text-gray-300"
              >
                <span>{config.aLabel}</span>
                {config.aSuffix ? (
                  <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] sm:text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {config.aSuffix}
                  </span>
                ) : null}
              </label>
              <input
                id="percentage-input-a"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={current.a}
                onChange={(event) => updateInput("a", event.target.value)}
                placeholder={config.aPlaceholder}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-4 text-2xl font-bold text-gray-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 sm:text-3xl dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:bg-gray-950"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-x-0 top-1/2 h-px bg-gray-100 dark:bg-gray-800" />
              <button
                type="button"
                onClick={swapValues}
                className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition hover:border-violet-300 hover:text-violet-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 dark:hover:border-violet-800 dark:hover:text-violet-300"
                aria-label="Swap the two values"
                title="Swap values"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label
                htmlFor="percentage-input-b"
                className="mb-1.5 flex items-center justify-between text-xs font-bold text-gray-700 sm:text-sm dark:text-gray-300"
              >
                <span>{config.bLabel}</span>
                {config.bSuffix ? (
                  <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] sm:text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {config.bSuffix}
                  </span>
                ) : null}
              </label>
              <input
                id="percentage-input-b"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={current.b}
                onChange={(event) => updateInput("b", event.target.value)}
                placeholder={config.bPlaceholder}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-4 text-2xl font-bold text-gray-900 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 sm:text-3xl dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:bg-gray-950"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadExample}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-violet-200 hover:text-violet-700 sm:px-3.5 sm:py-2.5 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-violet-800 dark:hover:text-violet-300"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Try an example
              </button>
              <button
                type="button"
                onClick={resetCurrent}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-800 sm:px-3.5 sm:py-2.5 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/40">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 sm:text-sm dark:text-gray-400">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                Formula for this mode
              </div>
              <code className="mt-2 block text-sm font-semibold text-gray-800 sm:text-base dark:text-gray-200">
                {config.formula}
              </code>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-fuchsia-700 to-pink-600 p-6 text-white shadow-xl shadow-violet-900/20">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <Percent className="h-3 w-3" />
                  Result
                </span>
                <button
                  type="button"
                  onClick={copyResult}
                  disabled={Boolean(result.error)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-white/25 sm:px-3 sm:py-2 sm:text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/60 sm:text-sm">
                {result.error ? "Waiting for valid input" : result.label}
              </p>
              <p
                data-testid="percentage-result"
                aria-live="polite"
                className={`mt-1 break-words text-4xl font-black tracking-tight sm:text-5xl ${toneClasses}`}
              >
                {displayValue}
              </p>

              {mode === "change" && !result.error && result.difference !== undefined ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold sm:text-sm">
                  {result.tone === "up" ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                  ) : result.tone === "down" ? (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-300" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                  Difference: {result.difference > 0 ? "+" : ""}
                  {formatNumber(result.difference)}
                </p>
              ) : null}

              <div className="mt-6 rounded-2xl bg-black/15 p-4 backdrop-blur-sm">
                {result.error ? (
                  <div className="flex items-start gap-2 text-xs leading-relaxed text-white/85 sm:text-sm">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <span>{result.error}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/50">
                      Step by step
                    </p>
                    <ol className="mt-2 space-y-2">
                      {result.steps.map((step, index) => (
                        <li
                          key={`${step}-${index}`}
                          className="flex items-start gap-2 text-xs leading-relaxed text-white/85 sm:text-sm"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold sm:text-[11px]">
                            {index + 1}
                          </span>
                          <code className="break-words">{step}</code>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 border-t border-white/15 pt-3">
                      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/50">
                        Substituted formula
                      </p>
                      <code className="mt-1 block break-words text-xs font-semibold text-white/90 sm:text-sm">
                        {result.formula}
                      </code>
                    </div>
                  </>
                )}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-white/50 sm:text-sm">
                Results update instantly as you type. Commas, currency symbols
                and trailing % signs are accepted.
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs leading-relaxed text-gray-500 sm:text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            <span className="font-bold text-gray-700 dark:text-gray-200">
              Quick tip:
            </span>{" "}
            use the swap button to flip the two values without retyping them —
            handy for “X is what % of Y” and reverse percentage questions.
          </div>
        </aside>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Percent className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 sm:text-base dark:text-gray-200">
            All percentage formulas
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.keys(MODES).map((key) => (
            <ReferenceCard
              key={key}
              mode={key}
              active={mode === key}
              onSelect={setMode}
            />
          ))}
        </div>
      </section>
    </ToolPageShell>
  );
}
