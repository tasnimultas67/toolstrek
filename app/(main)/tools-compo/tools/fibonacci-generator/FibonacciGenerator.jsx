"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  FileText,
  Hash,
  Info,
  Layers,
  ListOrdered,
  Percent,
  RotateCcw,
  Search,
  Sparkles,
  XCircle,
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
  DELIMITERS,
  FIB_FAQS,
  MAX_INDEX,
  MAX_TERMS,
  OUTPUT_FORMATS,
  SERIES_MODES,
  buildFibReport,
  buildSequence,
  buildSequenceCsv,
  checkFibonacci,
  countDigits,
  fibBigInt,
  formatSequence,
  formatTerm,
  formatZeckendorf,
  groupDigits,
  zeckendorf,
} from "./fibonacciData";

const TOOL_META = {
  title: "Fibonacci Generator",
  link: "/tools/fibonacci-generator",
  icon: "ListOrdered",
};

const TONE = "sky";

const TABS = [
  { value: "generator", label: "Generator", icon: ListOrdered },
  { value: "checker", label: "Checker", icon: Search },
  { value: "learn", label: "Learn", icon: BookOpen },
];

const DEFAULT_OPTIONS = {
  mode: "count",
  count: "20",
  rangeStart: "0",
  rangeEnd: "19",
  nth: "50",
  maxValue: "1000000",
  includeZero: true,
  step: "1",
  reverse: false,
  allowNegative: false,
  seedA: "0",
  seedB: "1",
};

const DEFAULT_DISPLAY = {
  format: "list",
  delimiter: "comma",
  customDelimiter: " ",
  maxDigits: 60,
  separator: ",",
  showIndex: true,
  indexBase: "0",
  prefix: "",
  suffix: "",
};

export default function FibonacciGenerator() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("generator");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [display, setDisplay] = useState(DEFAULT_DISPLAY);
  const [showStats, setShowStats] = useState(true);
  const [showPrimes, setShowPrimes] = useState(true);
  const [showRatio, setShowRatio] = useState(true);
  const [showZeckendorf, setShowZeckendorf] = useState(true);
  const [checkInput, setCheckInput] = useState("6765");

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const setOption = (key, value) => setOptions((current) => ({ ...current, [key]: value }));
  const setDisplayOption = (key, value) => setDisplay((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => buildSequence(options), [options]);

  const formatted = useMemo(
    () => (result.ok ? formatSequence(result.terms, display) : ""),
    [result, display],
  );

  const check = useMemo(() => checkFibonacci(checkInput), [checkInput]);

  const reset = () => {
    setOptions(DEFAULT_OPTIONS);
    setDisplay(DEFAULT_DISPLAY);
    setShowStats(true);
    setShowPrimes(true);
    setShowRatio(true);
    setShowZeckendorf(true);
    toast.success("Generator settings reset.");
  };

  const downloadTextFile = () => {
    if (!result.ok) {
      toast.error("Fix the sequence settings before downloading.");
      return;
    }
    const report = buildFibReport(result, formatted, { mode: options.mode, format: display.format });
    downloadText(report, `fibonacci-${result.stats.minIndex}-${result.stats.maxIndex}.txt`);
    toast.success("Sequence downloaded as text.");
  };

  const downloadCsv = () => {
    if (!result.ok) {
      toast.error("Fix the sequence settings before downloading.");
      return;
    }
    downloadText(
      buildSequenceCsv(result.terms, display.showIndex, Number(display.indexBase)),
      "fibonacci-sequence.csv",
      "text/csv;charset=utf-8",
    );
    toast.success("Sequence downloaded as CSV.");
  };

  const downloadJson = () => {
    if (!result.ok) {
      toast.error("Fix the sequence settings before downloading.");
      return;
    }
    downloadText(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          options,
          stats: {
            count: result.stats.count,
            minIndex: result.stats.minIndex,
            maxIndex: result.stats.maxIndex,
            lastDigits: result.stats.lastDigits,
            sumDigits: result.stats.sumDigits,
          },
          terms: result.terms.map((term) => ({ index: term.index, value: term.value.toString() })),
        },
        null,
        2,
      ),
      "fibonacci-sequence.json",
      "application/json;charset=utf-8",
    );
    toast.success("Sequence downloaded as JSON.");
  };

  const indexBase = Number(display.indexBase) === 1 ? 1 : 0;

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Number sequence studio"
        icon={ListOrdered}
        title="Fibonacci Generator"
        description="Generate exact Fibonacci sequences with BigInt — from the first few terms to the 100,000th index. Choose your seeds, index range, step and output format, then inspect digit counts, golden-ratio convergence, prime terms and Zeckendorf decompositions."
        badges={[
          "Exact BigInt terms",
          "Up to index 100,000",
          "Custom seeds",
          "Negative indices",
          "Number checker",
          "CSV / JSON export",
        ]}
      />

      <div
        role="tablist"
        aria-label="Fibonacci generator sections"
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
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <Icon className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {tab === "generator" && (
        <>
          <SectionCard
            tone={TONE}
            icon={Sparkles}
            title="Sequence settings"
            description="Pick how the sequence should be built. Results update as you type."
            actions={
              <ActionButton icon={RotateCcw} variant="ghost" onClick={reset}>
                Reset
              </ActionButton>
            }
          >
            <Segmented
              label="Generation mode"
              tone={TONE}
              columns={4}
              value={options.mode}
              onChange={(value) => setOption("mode", value)}
              options={SERIES_MODES}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {options.mode === "count" && (
                <>
                  <Field label="Number of terms" htmlFor="fib-count" hint={`1 to ${MAX_TERMS.toLocaleString()}`}>
                    <input id="fib-count" value={options.count} onChange={(event) => setOption("count", event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
                  </Field>
                  <Field label="Step" htmlFor="fib-step" hint="Every k-th index">
                    <input id="fib-step" value={options.step} onChange={(event) => setOption("step", event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
                  </Field>
                </>
              )}

              {options.mode === "range" && (
                <>
                  <Field label="Start index" htmlFor="fib-start" hint={options.allowNegative ? "Negative indices allowed" : `0 to ${MAX_INDEX.toLocaleString()}`}>
                    <input id="fib-start" value={options.rangeStart} onChange={(event) => setOption("rangeStart", event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
                  </Field>
                  <Field label="End index" htmlFor="fib-end">
                    <input id="fib-end" value={options.rangeEnd} onChange={(event) => setOption("rangeEnd", event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
                  </Field>
                  <Field label="Step" htmlFor="fib-range-step">
                    <input id="fib-range-step" value={options.step} onChange={(event) => setOption("step", event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
                  </Field>
                </>
              )}

              {options.mode === "max" && (
                <Field label="Generate terms up to" htmlFor="fib-max" hint="Inclusive upper bound" className="sm:col-span-2">
                  <input id="fib-max" value={options.maxValue} onChange={(event) => setOption("maxValue", event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
                </Field>
              )}

              {options.mode === "nth" && (
                <Field label="Index of the term" htmlFor="fib-nth" hint={options.allowNegative ? "Negative indices allowed" : `0 to ${MAX_INDEX.toLocaleString()}`} className="sm:col-span-2">
                  <input id="fib-nth" value={options.nth} onChange={(event) => setOption("nth", event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
                </Field>
              )}

              <Field label="Seed A (F0)" htmlFor="fib-seed-a" hint="Standard sequence uses 0">
                <input id="fib-seed-a" value={options.seedA} onChange={(event) => setOption("seedA", event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
              </Field>
              <Field label="Seed B (F1)" htmlFor="fib-seed-b" hint="Standard sequence uses 1">
                <input id="fib-seed-b" value={options.seedB} onChange={(event) => setOption("seedB", event.target.value)} inputMode="numeric" className={`${fieldClass(false, TONE)} tabular-nums`} />
              </Field>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              <ToggleRow tone={TONE} checked={options.includeZero} onChange={(value) => setOption("includeZero", value)} label="Include the zero term" description="Start at index 0 instead of index 1." />
              <ToggleRow tone={TONE} checked={options.reverse} onChange={(value) => setOption("reverse", value)} label="Reverse output" description="Show the same terms from last to first." />
              <ToggleRow tone={TONE} checked={options.allowNegative} onChange={(value) => setOption("allowNegative", value)} label="Allow negative indices" description="Negafibonacci: F(−n) = (−1)^(n+1)·F(n)." />
              <ToggleRow tone={TONE} checked={display.showIndex} onChange={(value) => setDisplayOption("showIndex", value)} label="Show indices" description="Include the index beside every value." />
            </div>

            <Callout tone="sky" variant="info" className="mt-4" title="Custom seeds">
              Seeds other than 0 and 1 produce a valid linear recurrence, but the negative-index rule only applies to
              the standard sequence. Negative indices are therefore disabled when custom seeds are used.
            </Callout>
          </SectionCard>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              {!result.ok ? (
                <SectionCard tone={TONE} icon={AlertTriangle} title="Sequence">
                  <Callout tone="amber" variant="warning" title="Cannot generate this sequence">
                    {result.error}
                  </Callout>
                </SectionCard>
              ) : (
                <>
                  {showStats && (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      <Stat tone={TONE} label="Terms" value={result.stats.count.toLocaleString()} icon={Layers} />
                      <Stat tone={TONE} label="Index range" value={`${result.stats.minIndex} … ${result.stats.maxIndex}`} icon={ListOrdered} />
                      <Stat tone={TONE} label="Last term digits" value={result.stats.lastDigits.toLocaleString()} icon={Hash} />
                      <Stat tone={TONE} label="Sum digits" value={result.stats.sumDigits.toLocaleString()} icon={Percent} />
                    </div>
                  )}

                  <SectionCard
                    tone={TONE}
                    icon={ListOrdered}
                    title="Generated sequence"
                    description={`${result.stats.count.toLocaleString()} term${result.stats.count === 1 ? "" : "s"} · ${display.format} output · indices start at ${
                      indexBase === 1 ? 1 : 0
                    }.`}
                    actions={
                      <>
                        <CopyButton text={formatted} tone={TONE} label="Copy output" />
                        <ActionButton icon={FileText} onClick={downloadTextFile}>
                          TXT
                        </ActionButton>
                        <ActionButton icon={FileSpreadsheet} onClick={downloadCsv}>
                          CSV
                        </ActionButton>
                        <ActionButton icon={FileJson} onClick={downloadJson}>
                          JSON
                        </ActionButton>
                      </>
                    }
                  >
                    {display.format === "table" ? (
                      <div className="max-h-[460px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full min-w-[460px] border-collapse text-left text-sm">
                          <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <tr>
                              <th className="px-3 py-2.5 font-bold">Index</th>
                              <th className="px-3 py-2.5 font-bold">F(index)</th>
                              <th className="px-3 py-2.5 font-bold">Digits</th>
                              <th className="px-3 py-2.5 font-bold" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {result.terms.slice(0, 300).map((term) => (
                              <tr key={term.index} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                                <td className="px-3 py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                                  {groupDigits(String(term.index + indexBase), display.separator)}
                                </td>
                                <td className="max-w-[420px] px-3 py-2.5">
                                  <span className="block truncate font-mono text-slate-700 dark:text-slate-200" title={term.value.toString()}>
                                    {formatTerm(term.value, display.maxDigits, display.separator)}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 tabular-nums text-slate-500 dark:text-slate-400">{countDigits(term.value).toLocaleString()}</td>
                                <td className="px-3 py-2.5 text-right">
                                  <CopyButton text={term.value.toString()} tone={TONE} label="Copy" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {result.terms.length > 300 && (
                          <p className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                            Showing the first 300 of {result.terms.length.toLocaleString()} rows. Copy or download for
                            the complete sequence.
                          </p>
                        )}
                      </div>
                    ) : (
                      <pre className="max-h-[460px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100">
                        {formatted}
                      </pre>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip tone={TONE}>{display.format}</Chip>
                      <Chip tone="sky">step {options.step}</Chip>
                      {options.seedA !== "0" || options.seedB !== "1" ? <Chip tone="violet">custom seeds</Chip> : <Chip tone="emerald">standard seeds</Chip>}
                      {options.allowNegative && <Chip tone="amber">negative enabled</Chip>}
                    </div>
                  </SectionCard>

                  {showRatio && (
                    <SectionCard tone={TONE} icon={Percent} title="Golden-ratio convergence" description="Consecutive Fibonacci ratios approach φ ≈ 1.618033988749895.">
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <Stat tone={TONE} label="Last ratio" value={result.stats.ratio ? result.stats.ratio.toFixed(12) : "not available"} />
                        <Stat tone={TONE} label="Golden ratio φ" value={result.stats.golden.toFixed(12)} />
                        <Stat tone={TONE} label="Difference" value={result.stats.ratio ? Math.abs(result.stats.ratio - result.stats.golden).toExponential(4) : "—"} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        The ratio is only computed when consecutive terms are small enough to convert safely. For very
                        large terms, the theoretical convergence is still the same, but a floating-point ratio would
                        lose all precision.
                      </p>
                    </SectionCard>
                  )}

                  {showPrimes && (
                    <SectionCard
                      tone={TONE}
                      icon={Sparkles}
                      title="Fibonacci primes"
                      description={
                        result.stats.checkedPrimes
                          ? `Deterministic Miller–Rabin was applied to ${result.stats.checkedPrimes.toLocaleString()} term(s) that fit within 64-bit arithmetic.`
                          : "All terms are too large for deterministic 64-bit primality testing."
                      }
                    >
                      {result.stats.primeTerms.length ? (
                        <div className="flex flex-wrap gap-2">
                          {result.stats.primeTerms.slice(0, 60).map((term) => (
                            <Chip key={term.index} tone="emerald">
                              F({term.index}) = {groupDigits(term.value.toString(), display.separator)}
                            </Chip>
                          ))}
                          {result.stats.primeTerms.length > 60 && <Chip tone="sky">+{result.stats.primeTerms.length - 60} more</Chip>}
                        </div>
                      ) : (
                        <Callout tone={TONE} variant="info">
                          No prime terms were found among the values small enough to test. This is normal — Fibonacci
                          primes become extremely rare as the sequence grows.
                        </Callout>
                      )}
                    </SectionCard>
                  )}

                  {showZeckendorf && (
                    <SectionCard tone={TONE} icon={Layers} title="Zeckendorf decomposition" description="Every positive integer is a unique sum of non-consecutive Fibonacci numbers.">
                      {result.terms[result.terms.length - 1]?.value > 0n ? (
                        <>
                          <p className="break-words font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                            {formatZeckendorf(zeckendorf(result.terms[result.terms.length - 1].value))}
                          </p>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Last term: F({result.stats.lastIndex}) with {result.stats.lastDigits.toLocaleString()} digit
                            {result.stats.lastDigits === 1 ? "" : "s"}.
                          </p>
                        </>
                      ) : (
                        <Callout tone={TONE} variant="info">
                          The last term is zero or negative, so it has no positive Zeckendorf decomposition. Generate a
                          positive term to see one.
                        </Callout>
                      )}
                    </SectionCard>
                  )}

                  <SectionCard tone={TONE} icon={Info} title="Sequence summary">
                    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                      <Stat tone={TONE} label="Even terms" value={result.stats.evenCount.toLocaleString()} />
                      <Stat tone={TONE} label="Odd terms" value={result.stats.oddCount.toLocaleString()} />
                      <Stat tone={TONE} label="Zeros" value={result.stats.zeroCount.toLocaleString()} />
                      <Stat tone={TONE} label="Negative terms" value={result.stats.negativeCount.toLocaleString()} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <CopyButton text={result.stats.sum.toString()} tone={TONE} label="Copy exact sum" />
                      <Chip tone={TONE}>Sum has {result.stats.sumDigits.toLocaleString()} digits</Chip>
                      <Chip tone="sky">Last value leading digits {result.stats.lastValue.toString().slice(0, 18)}…</Chip>
                    </div>
                  </SectionCard>
                </>
              )}
            </div>

            <div className="space-y-6 xl:col-span-4">
              <SectionCard tone={TONE} icon={Layers} title="Output options" description="Control the preview and exports without changing the numbers.">
                <div className="space-y-4">
                  <Segmented label="Format" tone={TONE} columns={4} value={display.format} onChange={(value) => setDisplayOption("format", value)} options={OUTPUT_FORMATS} />
                  <Field label="Delimiter (list format)" htmlFor="fib-delimiter">
                    <select id="fib-delimiter" value={display.delimiter} onChange={(event) => setDisplayOption("delimiter", event.target.value)} className={fieldClass(false, TONE)}>
                      {DELIMITERS.map((delimiter) => (
                        <option key={delimiter.value} value={delimiter.value}>
                          {delimiter.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {display.delimiter === "custom" && (
                    <Field label="Custom delimiter" htmlFor="fib-custom-delimiter">
                      <input id="fib-custom-delimiter" value={display.customDelimiter} onChange={(event) => setDisplayOption("customDelimiter", event.target.value)} className={`${fieldClass(false, TONE)} font-mono`} />
                    </Field>
                  )}
                  <Field label="Grouping separator" htmlFor="fib-separator">
                    <select id="fib-separator" value={display.separator} onChange={(event) => setDisplayOption("separator", event.target.value)} className={fieldClass(false, TONE)}>
                      <option value=",">Comma — 1,234</option>
                      <option value=" ">Space — 1 234</option>
                      <option value="'">Apostrophe — 1&apos;234</option>
                      <option value="_">Underscore — 1_234</option>
                      <option value="">None — 1234</option>
                    </select>
                  </Field>
                  <SliderRow
                    tone={TONE}
                    label="Digits per term in preview"
                    min={10}
                    max={500}
                    step={10}
                    value={display.maxDigits}
                    onChange={(value) => setDisplayOption("maxDigits", value)}
                    format={(value) => value.toLocaleString()}
                    hint="Long terms are shortened with an ellipsis. Copy and download always use the exact value."
                    onReset={() => setDisplayOption("maxDigits", 60)}
                  />
                  <Segmented
                    label="Index base"
                    tone={TONE}
                    columns={2}
                    value={display.indexBase}
                    onChange={(value) => setDisplayOption("indexBase", value)}
                    options={[
                      { value: "0", label: "Start at 0" },
                      { value: "1", label: "Start at 1" },
                    ]}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Prefix" htmlFor="fib-prefix" hint="List format only">
                      <input id="fib-prefix" value={display.prefix} onChange={(event) => setDisplayOption("prefix", event.target.value)} className={`${fieldClass(false, TONE)} font-mono`} />
                    </Field>
                    <Field label="Suffix" htmlFor="fib-suffix" hint="List format only">
                      <input id="fib-suffix" value={display.suffix} onChange={(event) => setDisplayOption("suffix", event.target.value)} className={`${fieldClass(false, TONE)} font-mono`} />
                    </Field>
                  </div>
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Sparkles} title="Report sections">
                <div className="space-y-2.5">
                  <ToggleRow tone={TONE} checked={showStats} onChange={setShowStats} label="Summary statistics" />
                  <ToggleRow tone={TONE} checked={showRatio} onChange={setShowRatio} label="Golden-ratio convergence" />
                  <ToggleRow tone={TONE} checked={showPrimes} onChange={setShowPrimes} label="Fibonacci primes" />
                  <ToggleRow tone={TONE} checked={showZeckendorf} onChange={setShowZeckendorf} label="Zeckendorf decomposition" />
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Info} title="Good to know">
                <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  <li>• The standard sequence starts 0, 1, 1, 2, 3, 5, 8…</li>
                  <li>• Indices are capped at {MAX_INDEX.toLocaleString()} and output at {MAX_TERMS.toLocaleString()} terms.</li>
                  <li>• BigInt keeps every digit exact — no rounding.</li>
                  <li>• Prime checks stop at 10¹⁵ to avoid false claims on huge values.</li>
                  <li>• CSV and JSON downloads always contain the full values.</li>
                </ul>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {tab === "checker" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={Search}
            title="Is this a Fibonacci number?"
            description="Enter a non-negative integer. The checker uses the perfect-square identity with exact BigInt arithmetic."
          >
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <Field label="Number to check" htmlFor="fib-check-input" hint="Commas, spaces and underscores are ignored. Up to 5,000 digits.">
                  <input
                    id="fib-check-input"
                    value={checkInput}
                    onChange={(event) => setCheckInput(event.target.value)}
                    inputMode="numeric"
                    spellCheck={false}
                    className={`${fieldClass(!check.ok, TONE)} font-mono text-lg font-bold`}
                  />
                </Field>
                {!check.ok && <FieldError>{check.error}</FieldError>}
              </div>
              <div className="flex items-end gap-2 lg:col-span-4">
                <ActionButton
                  icon={Sparkles}
                  variant="primary"
                  tone={TONE}
                  onClick={() => {
                    const sample = String(fibBigInt(20));
                    setCheckInput(sample);
                    toast.success("Loaded F(20) = 6765.");
                  }}
                >
                  Load F(20)
                </ActionButton>
                <ActionButton
                  icon={RotateCcw}
                  variant="ghost"
                  onClick={() => {
                    setCheckInput("");
                    toast.success("Checker cleared.");
                  }}
                >
                  Clear
                </ActionButton>
              </div>
            </div>
          </SectionCard>

          {check.ok ? (
            <>
              <SectionCard
                tone={check.isFibonacci ? "emerald" : "amber"}
                icon={check.isFibonacci ? CheckCircle2 : XCircle}
                title={check.isFibonacci ? "Yes — this is a Fibonacci number" : "No — this is not a Fibonacci number"}
                description={
                  check.isFibonacci
                    ? check.index !== null
                      ? `It is exactly F(${check.index}).`
                      : "The perfect-square test matched, but the index could not be located within the configured cap."
                    : "It cannot be written as a single term of the standard Fibonacci sequence."
                }
                actions={<CopyButton text={check.value.toString()} tone={TONE} label="Copy number" />}
              >
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <Stat tone={check.isFibonacci ? "emerald" : "amber"} label="Fibonacci?" value={check.isFibonacci ? "Yes" : "No"} />
                  <Stat tone={TONE} label="Fibonacci index" value={check.index !== null ? `F(${check.index})` : "—"} />
                  <Stat tone={TONE} label="Digits" value={check.digits.toLocaleString()} />
                  <Stat tone={TONE} label="log₁₀" value={check.log10.toFixed(4)} />
                </div>
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Value</p>
                  <p className="mt-1 break-all font-mono text-sm text-slate-800 dark:text-slate-100">
                    {groupDigits(check.value.toString(), ",")}
                  </p>
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Layers} title="Zeckendorf representation" description="Every positive integer has a unique decomposition into non-consecutive Fibonacci numbers.">
                {check.zeckendorf.length ? (
                  <>
                    <p className="break-words font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                      {formatZeckendorf(check.zeckendorf)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {check.zeckendorf.map((part) => (
                        <Chip key={part.index} tone="sky">
                          F({part.index}) = {groupDigits(part.value.toString(), ",")}
                        </Chip>
                      ))}
                    </div>
                    <div className="mt-3">
                      <CopyButton text={formatZeckendorf(check.zeckendorf)} tone={TONE} label="Copy decomposition" />
                    </div>
                  </>
                ) : (
                  <Callout tone={TONE} variant="info">
                    Zero has no positive Zeckendorf decomposition. Every positive integer does.
                  </Callout>
                )}
              </SectionCard>

              <SectionCard tone={TONE} icon={Info} title="How the check works">
                <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-sky-300 dark:bg-slate-950">
                  N is Fibonacci ⇔ 5N² + 4 or 5N² − 4 is a perfect square
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  The tool computes 5N² ± 4 with BigInt, takes an exact integer square root, then binary-searches the
                  index using fast doubling. No approximation is involved, so the answer is exact for every value
                  within the digit limit.
                </p>
              </SectionCard>
            </>
          ) : (
            <SectionCard tone={TONE} icon={AlertTriangle} title="Checker">
              <Callout tone="amber" variant="warning" title="Waiting for a valid number">
                {check.error}
              </Callout>
            </SectionCard>
          )}
        </div>
      )}

      {tab === "learn" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard tone={TONE} icon={ListOrdered} title="The recurrence">
              <div className="rounded-xl bg-slate-900 p-4 text-center font-mono text-base leading-relaxed text-sky-300 dark:bg-slate-950">
                F(0) = 0, F(1) = 1
                <br />
                F(n) = F(n − 1) + F(n − 2)
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Each term is the sum of the previous two. The sequence appears in rabbit populations, sunflower spirals,
                leaf arrangements, recursive algorithms and the golden ratio.
              </p>
            </SectionCard>

            <SectionCard tone={TONE} icon={Percent} title="Binet's formula" className="lg:col-span-2">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-sky-300 dark:bg-slate-950">
                F(n) = (φⁿ − ψⁿ) / √5
                <br />
                φ = (1 + √5) / 2 ≈ 1.6180339887
                <br />
                ψ = (1 − √5) / 2 ≈ −0.6180339887
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Binet&apos;s formula gives the nth term directly. For large n the ψⁿ term becomes negligible, so F(n) is
                extremely close to φⁿ / √5. This is why consecutive ratios converge so quickly to φ.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone={TONE}>F(10) = 55</Chip>
                <Chip tone={TONE}>F(20) = 6,765</Chip>
                <Chip tone={TONE}>F(30) = 832,040</Chip>
                <Chip tone={TONE}>F(50) = 12,586,269,025</Chip>
              </div>
            </SectionCard>
          </div>

          <SectionCard tone={TONE} icon={BookOpen} title="Reference table" description="The first 25 Fibonacci numbers with digit counts and parity.">
            <div className="max-h-[560px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">n</th>
                    <th className="px-3 py-2.5 font-bold">F(n)</th>
                    <th className="px-3 py-2.5 font-bold">Digits</th>
                    <th className="px-3 py-2.5 font-bold">Parity</th>
                    <th className="px-3 py-2.5 font-bold">Ratio to previous</th>
                    <th className="px-3 py-2.5 font-bold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.from({ length: 26 }, (_, n) => {
                    const value = fibBigInt(n);
                    const previous = n > 0 ? fibBigInt(n - 1) : null;
                    return (
                      <tr key={n} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-900 dark:text-white">{n}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-200">{value.toLocaleString()}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">{countDigits(value)}</td>
                        <td className="px-3 py-2.5">
                          <Chip tone={value % 2n === 0n ? "emerald" : "sky"}>{value % 2n === 0n ? "even" : "odd"}</Chip>
                        </td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">
                          {previous && previous !== 0n ? (Number(value) / Number(previous)).toFixed(8) : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <CopyButton text={value.toString()} tone={TONE} label="Copy" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <Callout tone="sky" variant="success" title="Exact, not approximate">
              Fast doubling computes F(n) with about log₂(n) BigInt multiplications, so even F(100,000) is exact.
            </Callout>
            <Callout tone="amber" variant="warning" title="Watch the term cap">
              Output is capped at {MAX_TERMS.toLocaleString()} terms and indices at {MAX_INDEX.toLocaleString()} so the
              page remains responsive on mobile devices.
            </Callout>
            <Callout tone="sky" variant="tip" title="Try negative indices">
              Enable negative indices in range or nth mode to explore the negafibonacci mirror: 0, 1, −1, 2, −3, 5, −8…
            </Callout>
          </div>

          <FaqAccordion items={FIB_FAQS} tone={TONE} title="Fibonacci questions, answered" />
        </div>
      )}
    </div>
  );
}
