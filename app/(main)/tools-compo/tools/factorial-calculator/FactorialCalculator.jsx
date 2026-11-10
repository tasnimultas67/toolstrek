"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  Download,
  Hash,
  History,
  ListOrdered,
  Percent,
  RotateCcw,
  Save,
  Sigma,
  Sparkles,
  Table2,
  Trash2,
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
  FACTORIAL_FAQS,
  MAX_INPUT,
  MODES,
  NOTATIONS,
  PRESETS,
  approximateLog10,
  buildFactorialReport,
  buildSteps,
  combinations,
  computeValue,
  countTrailingZeros,
  factorialBigInt,
  factorialTrailingZeros,
  formatBigNumber,
  formatProduct,
  groupDigits,
  leadingDigits,
  parseFactorialInput,
  permutations,
  primeFactorizationFactorial,
  stirlingLog10,
  stirlingRelativeError,
  toScientific,
} from "./factorialData";

const TOOL_META = {
  title: "Factorial Calculator",
  link: "/tools/factorial-calculator",
  icon: "Calculator",
};

const TONE = "emerald";

const TABS = [
  { value: "calculator", label: "Calculator", icon: Calculator },
  { value: "table", label: "Table", icon: Table2 },
  { value: "learn", label: "Learn", icon: BookOpen },
];

const MODE_LABELS = {
  standard: (n) => `${groupDigits(String(n), ",")}!`,
  double: (n) => `${groupDigits(String(n), ",")}!!`,
  subfactorial: (n) => `!${groupDigits(String(n), ",")}`,
};

function modeLabel(n, mode) {
  return (MODE_LABELS[mode] || MODE_LABELS.standard)(n);
}

function formatHistoryTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function FactorialCalculator() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("calculator");
  const [input, setInput] = useState("10");
  const [mode, setMode] = useState("standard");
  const [notation, setNotation] = useState("full");
  const [separator, setSeparator] = useState(",");
  const [maxDigits, setMaxDigits] = useState(500);
  const [showFull, setShowFull] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [showFactors, setShowFactors] = useState(true);
  const [showStirling, setShowStirling] = useState(true);
  const [showRelated, setShowRelated] = useState(true);
  const [rInput, setRInput] = useState("3");
  const [history, setHistory] = useState([]);
  const [tableMode, setTableMode] = useState("standard");
  const [tableFrom, setTableFrom] = useState("0");
  const [tableTo, setTableTo] = useState("25");

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const parsed = useMemo(() => parseFactorialInput(input), [input]);

  const result = useMemo(() => {
    if (!parsed.ok) return parsed;
    try {
      const n = parsed.n;
      const value = computeValue(n, mode);
      const formatted = formatBigNumber(value, {
        notation,
        separator,
        maxDigits: showFull ? Number.MAX_SAFE_INTEGER : maxDigits,
        precision: 10,
      });
      const log10 = approximateLog10(value);
      const stirling = stirlingLog10(n);
      const r = Number.parseInt(rInput, 10);
      const rValid = Number.isInteger(r) && r >= 0 && r <= n;
      return {
        ok: true,
        n,
        mode,
        modeLabel: modeLabel(n, mode),
        value,
        ...formatted,
        trailingZeros: countTrailingZeros(value),
        legendaryZeros: mode === "standard" ? factorialTrailingZeros(n) : null,
        leading: leadingDigits(value, 18),
        log10,
        stirling,
        stirlingDiff: log10 - stirling,
        stirlingRelative: stirlingRelativeError(n),
        factors: mode === "standard" ? primeFactorizationFactorial(n) : [],
        steps: buildSteps(n, mode),
        rValid,
        r,
        permutations: rValid ? permutations(n, r) : null,
        combinations: rValid ? combinations(n, r) : null,
        scientific: toScientific(value, 10),
      };
    } catch (error) {
      return { ok: false, error: error.message || "Something went wrong while calculating." };
    }
  }, [parsed, mode, notation, separator, maxDigits, showFull, rInput]);

  const setPreset = (n) => {
    setInput(String(n));
    setShowFull(false);
    toast.success(`Loaded ${n.toLocaleString()} into the calculator.`);
  };

  const saveToHistory = () => {
    if (!result.ok) {
      toast.error("Fix the input before saving a calculation.");
      return;
    }
    setHistory((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        n: result.n,
        mode: result.mode,
        label: result.modeLabel,
        digits: result.digits,
        value: result.value.toString(),
        at: Date.now(),
      },
      ...current,
    ].slice(0, 8));
    toast.success("Added to your calculation history.");
  };

  const reset = () => {
    setInput("10");
    setMode("standard");
    setNotation("full");
    setSeparator(",");
    setMaxDigits(500);
    setShowFull(false);
    setShowSteps(true);
    setShowFactors(true);
    setShowStirling(true);
    setShowRelated(true);
    setRInput("3");
    toast.success("Calculator options reset.");
  };

  const tableRows = useMemo(() => {
    const from = Math.max(0, Math.min(200, Number.parseInt(tableFrom, 10) || 0));
    const to = Math.max(from, Math.min(200, Number.parseInt(tableTo, 10) || from));
    const rows = [];
    for (let n = from; n <= to; n += 1) {
      try {
        const value = computeValue(n, tableMode);
        const text = value.toString();
        const formatted = formatBigNumber(value, { notation: "full", separator: ",", maxDigits: 120, precision: 10 });
        rows.push({
          n,
          display: text.length > 120 ? `${text.slice(0, 60)}…${text.slice(-18)}` : formatted.text,
          digits: text.length,
          zeros: countTrailingZeros(value),
          log10: approximateLog10(value),
          full: text,
        });
      } catch {
        // A row that cannot be computed is skipped rather than breaking the table.
      }
    }
    return rows;
  }, [tableFrom, tableTo, tableMode]);

  const downloadTableCsv = () => {
    if (!tableRows.length) {
      toast.error("Choose a valid table range first.");
      return;
    }
    const header = "n,value,digits,trailing_zeros,log10";
    const lines = tableRows.map((row) =>
      [row.n, `"${row.full.replace(/"/g, '""')}"`, row.digits, row.zeros, row.log10.toFixed(8)].join(","),
    );
    downloadText([header, ...lines].join("\r\n"), `factorial-table-${tableFrom}-${tableTo}.csv`, "text/csv;charset=utf-8");
    toast.success("Table downloaded as CSV.");
  };

  const effectiveValueText = result.ok ? result.text : "";

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Math utility"
        icon={Sigma}
        title="Factorial Calculator"
        description="Calculate exact factorials with arbitrary-precision integers — no 170! overflow. Explore double factorials, derangements, prime factorisation, trailing zeros, Stirling's approximation, permutations and combinations, then copy or download the full result."
        badges={[
          "Exact BigInt results",
          "Up to 10,000!",
          "n!, n!! and !n",
          "Prime factorisation",
          "Permutations & combinations",
          "100% private",
        ]}
      />

      <div
        role="tablist"
        aria-label="Factorial calculator sections"
        className="grid grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
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
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <Icon className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {tab === "calculator" && (
        <>
          <SectionCard
            tone={TONE}
            icon={Calculator}
            title="Calculate a factorial"
            description="Enter a whole number from 0 to 10,000. The exact result is computed with BigInt in your browser."
            actions={
              <ActionButton icon={RotateCcw} variant="ghost" onClick={reset}>
                Reset
              </ActionButton>
            }
          >
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Field
                  label="Number (n)"
                  htmlFor="factorial-input"
                  hint="Commas, spaces and underscores are ignored. Negative numbers and decimals are rejected."
                >
                  <input
                    id="factorial-input"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="10"
                    className={`${fieldClass(!parsed.ok, TONE)} text-lg font-black tabular-nums`}
                  />
                </Field>
                {!parsed.ok && <FieldError>{parsed.error}</FieldError>}
              </div>
              <div className="lg:col-span-7">
                <Segmented label="Operation" tone={TONE} columns={3} value={mode} onChange={setMode} options={MODES} />
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPreset(preset.n)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {parsed.ok && parsed.n > 170 && mode === "standard" && (
              <Callout tone="emerald" variant="success" className="mt-4" title="Beyond floating-point limits">
                {parsed.n.toLocaleString()}! is far beyond the largest IEEE-754 double. A normal calculator returns
                Infinity at 171!, but this result is exact.
              </Callout>
            )}
          </SectionCard>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              {!result.ok ? (
                <SectionCard tone={TONE} icon={AlertTriangle} title="Result">
                  <Callout tone="amber" variant="warning" title="Cannot calculate yet">
                    {result.error}
                  </Callout>
                </SectionCard>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    <Stat tone={TONE} label="Exact digits" value={result.digits.toLocaleString()} icon={Hash} />
                    <Stat tone={TONE} label="Trailing zeros" value={result.trailingZeros.toLocaleString()} icon={Sigma} />
                    <Stat tone={TONE} label="log₁₀" value={Number.isFinite(result.log10) ? result.log10.toFixed(4) : "—"} icon={Percent} />
                    <Stat tone={TONE} label="Raw size" value={`${(result.value.toString().length / 1024).toFixed(1)} KB`} icon={ListOrdered} />
                  </div>

                  <SectionCard
                    tone={TONE}
                    icon={Hash}
                    title={`${result.modeLabel} = exact result`}
                    description={`${result.digits.toLocaleString()} digits · leading digits ${result.leading}…`}
                    actions={
                      <>
                        <CopyButton text={result.value.toString()} tone={TONE} label="Copy full value" />
                        <ActionButton
                          icon={Download}
                          onClick={() => {
                            downloadText(buildFactorialReport(result), `factorial-${result.n}.txt`);
                            toast.success("Full result downloaded.");
                          }}
                        >
                          Download
                        </ActionButton>
                      </>
                    }
                  >
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100">
                      {effectiveValueText}
                    </pre>

                    {result.truncated && (
                      <Callout tone="amber" variant="warning" className="mt-3" title={`Showing the first ${maxDigits.toLocaleString()} digits`}>
                        The exact value has {result.digits.toLocaleString()} digits. The full value is still stored and
                        available via Copy or Download.
                        <button
                          type="button"
                          onClick={() => setShowFull(true)}
                          className="ml-1 font-bold text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
                        >
                          Render every digit
                        </button>
                        .
                      </Callout>
                    )}
                    {showFull && result.digits > 20000 && (
                      <Callout tone="amber" variant="warning" className="mt-3">
                        Rendering {result.digits.toLocaleString()} digits can make the page sluggish on older devices.
                        Copy or download the value for the best experience.
                      </Callout>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip tone={TONE}>{result.mode === "standard" ? "n!" : result.mode === "double" ? "n!!" : "derangement"}</Chip>
                      <Chip tone="sky">{notation} notation</Chip>
                      {result.legendaryZeros !== null && <Chip tone="emerald">Legendre: {result.legendaryZeros} zeros</Chip>}
                      {result.scientific && <Chip tone="violet">{result.scientific.text}</Chip>}
                    </div>
                  </SectionCard>

                  {showSteps && (
                    <SectionCard tone={TONE} icon={ListOrdered} title="Step by step" description="The definition written out, exact for small inputs and symbolic for large ones.">
                      <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100">
                        {result.steps}
                      </pre>
                    </SectionCard>
                  )}

                  {showFactors && result.mode === "standard" && (
                    <SectionCard
                      tone={TONE}
                      icon={Sparkles}
                      title="Prime factorisation"
                      description={
                        result.factors.length
                          ? `${result.factors.length} distinct prime factors, computed with Legendre's formula.`
                          : "No prime factors for 0! or 1!."
                      }
                    >
                      {result.factors.length === 0 ? (
                        <Callout tone={TONE} variant="info">
                          0! and 1! both equal 1, which has no prime factors.
                        </Callout>
                      ) : (
                        <>
                          <div className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
                            <p className="break-words font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                              {formatProduct(result.factors, 120)}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {result.factors.slice(0, 40).map((factor) => (
                              <Chip key={factor.prime} tone="emerald">
                                {factor.prime}
                                <sup className="font-mono">{factor.exponent}</sup>
                              </Chip>
                            ))}
                            {result.factors.length > 40 && (
                              <Chip tone="sky">+{result.factors.length - 40} more</Chip>
                            )}
                          </div>
                        </>
                      )}
                    </SectionCard>
                  )}

                  {showStirling && (
                    <SectionCard tone={TONE} icon={Percent} title="Stirling comparison" description="How close the asymptotic approximation is to the exact value.">
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <Stat tone={TONE} label="Exact log₁₀" value={Number.isFinite(result.log10) ? result.log10.toFixed(6) : "—"} />
                        <Stat tone={TONE} label="Stirling log₁₀" value={result.stirling.toFixed(6)} />
                        <Stat tone="amber" label="Difference" value={Number.isFinite(result.stirlingDiff) ? result.stirlingDiff.toFixed(6) : "—"} />
                        <Stat tone="sky" label="Estimated rel. error" value={`${(result.stirlingRelative * 100).toFixed(4)}%`} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        Stirling&apos;s formula gives n! ≈ √(2πn)·(n/e)ⁿ. The relative error is roughly 1/(12n), so it becomes
                        extraordinarily accurate as n grows. It is ideal for logarithms and asymptotics, not for
                        extracting exact digits.
                      </p>
                    </SectionCard>
                  )}

                  {showRelated && (
                    <SectionCard tone={TONE} icon={Sigma} title="Permutations & combinations" description="How many ordered arrangements or unordered selections of r items exist from n items?">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Choose r items" htmlFor="factorial-r" hint={`0 ≤ r ≤ ${result.n}`}>
                          <input
                            id="factorial-r"
                            value={rInput}
                            onChange={(event) => setRInput(event.target.value)}
                            inputMode="numeric"
                            className={`${fieldClass(!result.rValid, TONE)} tabular-nums`}
                          />
                        </Field>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {result.rValid
                              ? `nPr = ${result.permutations?.toString() ?? "—"}`
                              : "Enter a whole number between 0 and n."}
                          </p>
                          <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                            {result.rValid
                              ? `nCr = ${result.combinations?.toString() ?? "—"}`
                              : "Combinations require the same range."}
                          </p>
                        </div>
                      </div>
                      {result.rValid && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <CopyButton text={result.permutations?.toString() || ""} tone={TONE} label="Copy nPr" />
                          <CopyButton text={result.combinations?.toString() || ""} tone={TONE} label="Copy nCr" />
                          <Chip tone={TONE}>nPr = n! / (n − r)!</Chip>
                          <Chip tone="sky">nCr = n! / (r!(n − r)!)</Chip>
                        </div>
                      )}
                    </SectionCard>
                  )}
                </>
              )}
            </div>

            <div className="space-y-6 xl:col-span-4">
              <SectionCard tone={TONE} icon={Sparkles} title="Display options" description="Control how the exact value is presented. Computation is always exact.">
                <div className="space-y-4">
                  <Segmented label="Notation" tone={TONE} columns={3} value={notation} onChange={setNotation} options={NOTATIONS} />
                  <Field label="Grouping separator" htmlFor="factorial-separator">
                    <select id="factorial-separator" value={separator} onChange={(event) => setSeparator(event.target.value)} className={fieldClass(false, TONE)}>
                      <option value=",">Comma — 1,234,567</option>
                      <option value=" ">Space — 1 234 567</option>
                      <option value="'">Apostrophe — 1&apos;234&apos;567</option>
                      <option value="_">Underscore — 1_234_567</option>
                      <option value="">None — 1234567</option>
                    </select>
                  </Field>
                  <SliderRow
                    tone={TONE}
                    label="Digits before truncation"
                    min={50}
                    max={5000}
                    step={50}
                    value={maxDigits}
                    onChange={(value) => {
                      setMaxDigits(value);
                      setShowFull(false);
                    }}
                    format={(value) => value.toLocaleString()}
                    hint="Only affects the on-screen preview. Copy and download always include every digit."
                    onReset={() => {
                      setMaxDigits(500);
                      setShowFull(false);
                    }}
                  />
                  <ToggleRow tone={TONE} checked={showFull} onChange={setShowFull} label="Render the full value" description="Show every digit in the preview, even for very large results." />
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={AlertTriangle} title="Include in report">
                <div className="space-y-2.5">
                  <ToggleRow tone={TONE} checked={showSteps} onChange={setShowSteps} label="Step-by-step definition" />
                  <ToggleRow tone={TONE} checked={showFactors} onChange={setShowFactors} label="Prime factorisation (n!)" />
                  <ToggleRow tone={TONE} checked={showStirling} onChange={setShowStirling} label="Stirling comparison" />
                  <ToggleRow tone={TONE} checked={showRelated} onChange={setShowRelated} label="Permutations & combinations" />
                </div>
              </SectionCard>

              <SectionCard
                tone={TONE}
                icon={History}
                title={`History (${history.length})`}
                description="Saved locally in this session. Click an entry to recalculate it."
                actions={
                  history.length ? (
                    <ActionButton icon={Trash2} variant="ghost" onClick={() => { setHistory([]); toast.success("History cleared."); }}>
                      Clear
                    </ActionButton>
                  ) : null
                }
              >
                {history.length === 0 ? (
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Press <strong>Save to history</strong> after a calculation to keep it here for quick comparison.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {history.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => {
                          setInput(String(entry.n));
                          setMode(entry.mode);
                          toast.success(`Restored ${entry.label}.`);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{entry.label}</span>
                          <span className="text-sm font-medium text-slate-400">{formatHistoryTime(entry.at)}</span>
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                          {entry.digits.toLocaleString()} digits
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <ActionButton icon={Save} variant="primary" tone={TONE} onClick={saveToHistory} className="mt-3 w-full" disabled={!result.ok}>
                  Save to history
                </ActionButton>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {tab === "table" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={Table2}
            title="Factorial table"
            description="Generate a reference table with exact digits, trailing zeros and log₁₀. Range is capped at 200 for readability."
            actions={
              <ActionButton icon={Download} onClick={downloadTableCsv}>
                Download CSV
              </ActionButton>
            }
          >
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <Segmented label="Operation" tone={TONE} columns={3} value={tableMode} onChange={setTableMode} options={MODES} />
              </div>
              <div className="lg:col-span-3">
                <Field label="From n" htmlFor="table-from">
                  <input id="table-from" value={tableFrom} onChange={(event) => setTableFrom(event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
                </Field>
              </div>
              <div className="lg:col-span-3">
                <Field label="To n" htmlFor="table-to" hint="Maximum 200">
                  <input id="table-to" value={tableTo} onChange={(event) => setTableTo(event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
                </Field>
              </div>
              <div className="flex items-end lg:col-span-2">
                <ActionButton icon={RotateCcw} variant="ghost" onClick={() => { setTableFrom("0"); setTableTo("25"); }} className="w-full">
                  Reset range
                </ActionButton>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "0–10", from: "0", to: "10" },
                { label: "0–25", from: "0", to: "25" },
                { label: "0–50", from: "0", to: "50" },
                { label: "0–100", from: "0", to: "100" },
                { label: "100–200", from: "100", to: "200" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => { setTableFrom(preset.from); setTableTo(preset.to); }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard tone={TONE} icon={ListOrdered} title={`${tableRows.length} rows`} description={`Displaying ${tableMode === "standard" ? "n!" : tableMode === "double" ? "n!!" : "!n"} values. Long values are shortened in the table; the CSV contains the exact digits.`}>
            {tableRows.length === 0 ? (
              <Callout tone="amber" variant="warning">
                No rows to show. Check that the range starts at or below the end value.
              </Callout>
            ) : (
              <div className="max-h-[620px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">n</th>
                      <th className="px-3 py-2.5 font-bold">Value</th>
                      <th className="px-3 py-2.5 font-bold">Digits</th>
                      <th className="px-3 py-2.5 font-bold">Trailing zeros</th>
                      <th className="px-3 py-2.5 font-bold">log₁₀</th>
                      <th className="px-3 py-2.5 font-bold" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tableRows.map((row) => (
                      <tr key={row.n} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-900 dark:text-white">{row.n}</td>
                        <td className="max-w-[360px] px-3 py-2.5">
                          <span className="block truncate font-mono text-slate-700 dark:text-slate-200" title={row.full.slice(0, 300)}>
                            {row.display}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">{row.digits.toLocaleString()}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">{row.zeros.toLocaleString()}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">{Number.isFinite(row.log10) ? row.log10.toFixed(4) : "—"}</td>
                        <td className="px-3 py-2.5 text-right">
                          <CopyButton text={row.full} tone={TONE} label="Copy" />
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

      {tab === "learn" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard tone={TONE} icon={Sigma} title="The definition">
              <div className="rounded-xl bg-slate-900 p-4 text-center font-mono text-lg leading-relaxed text-emerald-300 dark:bg-slate-950">
                n! = n × (n − 1) × … × 2 × 1
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                For a positive integer n, the factorial is the product of every positive integer up to n. By
                convention, 0! = 1 because there is exactly one way to arrange zero objects.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip tone={TONE}>0! = 1</Chip>
                <Chip tone={TONE}>1! = 1</Chip>
                <Chip tone={TONE}>2! = 2</Chip>
                <Chip tone={TONE}>3! = 6</Chip>
                <Chip tone={TONE}>4! = 24</Chip>
                <Chip tone={TONE}>5! = 120</Chip>
              </div>
            </SectionCard>

            <SectionCard tone={TONE} icon={Percent} title="Trailing zeros" className="lg:col-span-2">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-emerald-300 dark:bg-slate-950">
                Z(n) = ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                A trailing zero needs one factor of 2 and one factor of 5. Factorials contain far more 2s, so counting
                factors of 5 is enough. For 100!, the count is 20 + 4 = 24 zeros — and indeed 100! ends in 24 zeros.
              </p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Growth</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Factorials grow faster than exponentials. 10! is 3,628,800, while 20! is already 2,432,902,008,176,640,000.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Precision</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    This tool never rounds. Every digit shown is part of the exact integer, and downloads include the
                    complete value.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard tone={TONE} icon={ListOrdered} title="Reference values" description="Exact factorials from 0! to 20!.">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">n</th>
                    <th className="px-3 py-2.5 font-bold">n!</th>
                    <th className="px-3 py-2.5 font-bold">Digits</th>
                    <th className="px-3 py-2.5 font-bold">Trailing zeros</th>
                    <th className="px-3 py-2.5 font-bold">n!!</th>
                    <th className="px-3 py-2.5 font-bold">!n</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.from({ length: 21 }, (_, n) => {
                    const value = factorialBigInt(n);
                    return (
                      <tr key={n}>
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-900 dark:text-white">{n}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-200">{value.toLocaleString()}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">{value.toString().length}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">{factorialTrailingZeros(n)}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-300">{computeValue(n, "double").toLocaleString()}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-300">{computeValue(n, "subfactorial").toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <Callout tone="emerald" variant="success" title="Exact by design">
              Every calculation uses JavaScript BigInt, so 10,000! returns all 35,660 digits instead of Infinity.
            </Callout>
            <Callout tone="amber" variant="warning" title="Input guardrails">
              Negative numbers, decimals and values above {MAX_INPUT.toLocaleString()} are rejected with a clear
              explanation rather than an overflow or a frozen tab.
            </Callout>
            <Callout tone={TONE} variant="tip" title="Try the advanced views">
              Enable prime factorisation and Stirling comparison in Display options to see both the exact structure and
              the asymptotic behaviour.
            </Callout>
          </div>

          <FaqAccordion items={FACTORIAL_FAQS} tone={TONE} title="Factorial questions, answered" />
        </div>
      )}
    </div>
  );
}
