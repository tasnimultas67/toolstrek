"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Dices,
  Eye,
  EyeOff,
  Gauge,
  Hash,
  Info,
  KeyRound,
  ListChecks,
  Lock,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Zap,
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
  Hero,
  SectionCard,
  SliderRow,
  Stat,
  ToggleRow,
  accent,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import { downloadText } from "../_shared/toolkit/toolUtils";
import {
  GUESS_RATES,
  PASSPHRASE_WORDS,
  PASSWORD_ENTROPY_FAQS,
  analyzePassword,
  crackLog10Seconds,
  crackTimesFor,
  formatBigDuration,
  formatGuesses,
  generatePassphrase,
  strengthFor,
} from "./entropyData";

const TOOL_META = {
  title: "Password Entropy Calculator",
  link: "/tools/password-entropy-calculator",
  icon: "KeyRound",
};

const TONE = "rose";

const TABS = [
  { value: "analyzer", label: "Analyzer", icon: Gauge },
  { value: "crack", label: "Crack times", icon: Clock },
  { value: "passphrase", label: "Passphrase", icon: Dices },
  { value: "learn", label: "Learn", icon: BookOpen },
];

const EXAMPLES = [
  { label: "Common", value: "password123" },
  { label: "Pattern", value: "Summer2024!" },
  { label: "Random", value: "Tr0ub4dor&3xQ" },
  { label: "Passphrase", value: "correct horse battery staple" },
];

const DEFAULT_OPTIONS = {
  extraPool: 0,
  usePenalties: true,
};

const DEFAULT_PASSPHRASE = {
  count: 6,
  separator: "-",
  randomCase: true,
  addNumber: true,
};

function CompositionBar({ counts, length }) {
  const segments = [
    { key: "lowercase", label: "a–z", count: counts.lowercase, className: "bg-sky-500" },
    { key: "uppercase", label: "A–Z", count: counts.uppercase, className: "bg-indigo-500" },
    { key: "digits", label: "0–9", count: counts.digits, className: "bg-amber-500" },
    { key: "symbols", label: "symbols", count: counts.symbols, className: "bg-rose-500" },
    { key: "extended", label: "unicode", count: counts.extended, className: "bg-violet-500" },
  ].filter((segment) => segment.count > 0);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={segment.className}
            style={{ width: `${(segment.count / Math.max(1, length)) * 100}%` }}
            title={`${segment.label}: ${segment.count}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {segments.length ? (
          segments.map((segment) => (
            <span
              key={segment.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
            >
              <span className={`h-2 w-2 rounded-full ${segment.className}`} />
              {segment.label} · {segment.count}
            </span>
          ))
        ) : (
          <Chip tone={TONE}>No characters yet</Chip>
        )}
        <Chip tone={TONE}>{length} characters</Chip>
        <Chip tone="sky">{new Set(segments.map((segment) => segment.key)).size} character classes</Chip>
      </div>
    </div>
  );
}

function StrengthMeter({ bits, level }) {
  const palette = accent(level.level.tone);
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Adjusted entropy</p>
          <p className="mt-1 text-4xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
            {bits.toFixed(1)}
            <span className="ml-1 text-base font-bold text-slate-400">bits</span>
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-black ${palette.chip}`}>{level.level.label}</span>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-1.5">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className={`h-2.5 rounded-full ${
              index <= level.index ? level.level.bar : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-sm font-semibold text-slate-400 dark:text-slate-500">
        <span>Very weak</span>
        <span>Exceptional</span>
      </div>
    </div>
  );
}

export default function PasswordEntropyCalculator() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("analyzer");
  const [password, setPassword] = useState("Tr0ub4dor&3xQ");
  const [showPassword, setShowPassword] = useState(true);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [rateValue, setRateValue] = useState("sha256");
  const [customRate, setCustomRate] = useState("1000000000");
  const [phraseSettings, setPhraseSettings] = useState(DEFAULT_PASSPHRASE);
  const [phrase, setPhrase] = useState(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const analysis = useMemo(() => analyzePassword(password, options), [password, options]);
  const rates = useMemo(() => {
    const custom = Math.max(1, Number(customRate) || 1);
    const base = crackTimesFor(analysis, custom);
    const log10Seconds = crackLog10Seconds(analysis.bits, custom);
    return [
      ...base,
      {
        value: "custom",
        label: "Custom rate",
        rate: custom,
        detail: `${custom.toLocaleString()} guesses / second`,
        log10Seconds,
        display: formatBigDuration(log10Seconds),
      },
    ];
  }, [analysis, customRate]);

  const selectedRate = rates.find((entry) => entry.value === rateValue) || rates[3];
  const palette = accent(analysis.level.level.tone);

  const copySummary = () => {
    const summary = [
      "ToolsTrek Password Entropy Report",
      `Password length: ${analysis.length}`,
      `Character pool: ${analysis.pool}`,
      `Base entropy: ${analysis.baseBits.toFixed(2)} bits`,
      `Pattern penalty: ${analysis.penalty.toFixed(2)} bits`,
      `Adjusted entropy: ${analysis.adjustedBits.toFixed(2)} bits`,
      `Strength: ${analysis.level.level.label}`,
      `Guesses: ${formatGuesses(analysis.adjustedBits)}`,
      "",
      ...rates.map((rate) => `${rate.label} (${rate.detail}): ${rate.display}`),
    ].join("\n");
    downloadText(summary, "password-entropy-report.txt");
    toast.success("Entropy report downloaded.");
  };

  const makePhrase = () => {
    const generated = generatePassphrase(phraseSettings);
    setPhrase(generated);
    toast.success(`${generated.words}-word passphrase generated.`);
  };

  const phraseStrength = phrase ? strengthFor(phrase.bits) : strengthFor(0);

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Credential strength lab"
        icon={KeyRound}
        title="Password Entropy Calculator"
        description="See how many bits of real randomness your password contains. Detect dictionary words, keyboard walks, repeats and years, then compare crack times across realistic attack speeds — all without sending your password anywhere."
        badges={[
          "Real entropy estimate",
          "Pattern penalties",
          "Six attack models",
          "Passphrase planner",
          "100% offline",
          "No password storage",
        ]}
      />

      <div
        role="tablist"
        aria-label="Password entropy sections"
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

      {tab === "analyzer" && (
        <>
          <SectionCard
            tone={TONE}
            icon={Lock}
            title="Enter a password"
            description="The value stays in this tab. Nothing is transmitted, saved or logged."
            actions={
              <ActionButton icon={RefreshCw} variant="ghost" onClick={() => setPassword("")}>
                Clear
              </ActionButton>
            }
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Type or paste a password to analyze…"
                autoComplete="off"
                spellCheck={false}
                aria-label="Password to analyze"
                className={`${fieldClass(false, TONE)} h-16 px-4 pr-32 font-mono text-lg font-bold tracking-wide`}
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <CopyButton text={password} tone={TONE} label="Copy" />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Try:</span>
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setPassword(example.value)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                >
                  {example.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <StrengthMeter bits={analysis.adjustedBits} level={analysis.level} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Stat tone={TONE} label="Length" value={`${analysis.length} chars`} icon={Hash} />
              <Stat tone={TONE} label="Character pool" value={analysis.pool || "—"} icon={SlidersHorizontal} />
              <Stat tone={TONE} label="Base entropy" value={`${analysis.baseBits.toFixed(1)} bits`} icon={Sparkles} />
              <Stat tone={TONE} label="Pattern penalty" value={analysis.penalty > 0 ? `−${analysis.penalty.toFixed(1)} bits` : "0.0 bits"} icon={AlertTriangle} />
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <SectionCard
                tone={TONE}
                icon={ListChecks}
                title="What we detected"
                description={
                  analysis.length === 0
                    ? "Type a password to see pattern analysis."
                    : analysis.findings.length
                      ? `${analysis.findings.length} pattern${analysis.findings.length === 1 ? "" : "s"} reduced the effective entropy.`
                      : "No predictable patterns were found. The full search space is available to an attacker."
                }
              >
                {analysis.length === 0 ? (
                  <Callout tone={TONE} variant="info" title="Waiting for input">
                    Enter a password above. Even a single character will produce a live estimate.
                  </Callout>
                ) : analysis.findings.length ? (
                  <div className="space-y-2.5">
                    {analysis.findings.map((finding, index) => (
                      <div
                        key={`${finding.label}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{finding.label}</p>
                            <p className="mt-0.5 text-sm leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                              {finding.detail}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-sm font-black tabular-nums text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          −{finding.penalty.toFixed(1)} bits
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        No common pattern detected
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
                        This password does not match the built-in dictionary, keyboard walks, repeats or date
                        patterns. Remember that pattern checks are a safety net, not proof of randomness.
                      </p>
                    </div>
                  </div>
                )}

                {analysis.isCommon && (
                  <div className="mt-3">
                    <Callout tone="rose" variant="warning" title="This password is in public breach lists">
                      Change it everywhere it is used. Reusing a breached password is the single most common way
                      accounts are compromised.
                    </Callout>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                tone={TONE}
                icon={SlidersHorizontal}
                title="Character composition"
                description={`${analysis.uniqueCharacters} unique character${analysis.uniqueCharacters === 1 ? "" : "s"} across ${analysis.length} positions.`}
              >
                <CompositionBar counts={analysis.counts} length={analysis.length} />
              </SectionCard>

              <SectionCard
                tone={TONE}
                icon={Clock}
                title="Estimated time to crack"
                description="Based on the adjusted entropy and the average number of guesses (2^(bits−1))."
                actions={
                  <ActionButton icon={ArrowRight} onClick={() => setTab("crack")}>
                    All attack speeds
                  </ActionButton>
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-2xl border p-4 ${palette.soft}`}>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {selectedRate.label}
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      {selectedRate.display}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedRate.detail}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Search space
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      {formatGuesses(analysis.adjustedBits)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">possible guesses</p>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6 xl:col-span-4">
              <SectionCard tone={TONE} icon={ShieldCheck} title="Estimator options">
                <div className="space-y-4">
                  <ToggleRow
                    tone={TONE}
                    checked={options.usePenalties}
                    onChange={(value) => setOptions((current) => ({ ...current, usePenalties: value }))}
                    label="Apply pattern penalties"
                    description="Deduct bits for repeats, sequences, dictionary words and dates."
                  />
                  <Field
                    label="Extra custom pool"
                    htmlFor="entropy-extra-pool"
                    hint="Add characters if your password uses a policy-specific set, emoji or a custom alphabet."
                  >
                    <input
                      id="entropy-extra-pool"
                      type="number"
                      min={0}
                      max={10000}
                      value={options.extraPool}
                      onChange={(event) =>
                        setOptions((current) => ({
                          ...current,
                          extraPool: Math.max(0, Number(event.target.value) || 0),
                        }))
                      }
                      className={`${fieldClass(false, TONE)} tabular-nums`}
                    />
                  </Field>
                  <div>
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Primary attack model
                    </span>
                    <select
                      value={rateValue}
                      onChange={(event) => setRateValue(event.target.value)}
                      className={fieldClass(false, TONE)}
                      aria-label="Primary attack model"
                    >
                      {GUESS_RATES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">How it works</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      Raw entropy is {analysis.length} × log₂({analysis.pool || 0}) ={" "}
                      {analysis.baseBits.toFixed(1)} bits. After penalties the estimate is{" "}
                      {analysis.adjustedBits.toFixed(1)} bits.
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Sparkles} title="Quick wins">
                <div className="space-y-2.5">
                  <Callout tone={TONE} variant="tip" title={`Add ${analysis.extraCharacters || 4} more random characters`}>
                    At a pool of {analysis.pool || 0}, every extra character adds about{" "}
                    {analysis.perCharacter.toFixed(2)} bits. Adding {analysis.extraCharacters || 4} characters can
                    reach roughly 80 bits.
                  </Callout>
                  <Callout tone="sky" variant="info" title="Use a password manager">
                    A manager lets every account have a unique 20+ character random password, so one breach cannot
                    unlock the rest.
                  </Callout>
                  <Callout tone="emerald" variant="success" title="Check breach exposure">
                    If a password has appeared in a breach list, its theoretical entropy no longer matters — attackers
                    already have it.
                  </Callout>
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Info} title="Privacy">
                <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  <li>• No network requests are made with your password.</li>
                  <li>• Nothing is written to localStorage or cookies.</li>
                  <li>• Refreshing the page clears everything.</li>
                  <li>• Disconnect after loading and the calculator still works.</li>
                </ul>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {tab === "crack" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={Timer}
            title="Crack-time comparison"
            description="The same password against six attacker profiles. Faster hardware reduces the time, not the entropy."
            actions={
              <>
                <ActionButton icon={RefreshCw} variant="ghost" onClick={() => setPassword("")}>
                  Clear password
                </ActionButton>
                <ActionButton icon={Hash} onClick={copySummary}>
                  Download report
                </ActionButton>
              </>
            }
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3.5 py-3 font-bold">Attack model</th>
                    <th className="px-3.5 py-3 font-bold">Guessing rate</th>
                    <th className="px-3.5 py-3 font-bold">Average time to crack</th>
                    <th className="px-3.5 py-3 font-bold">Log₁₀ seconds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rates.map((rate) => (
                    <tr
                      key={rate.value}
                      className={`transition hover:bg-rose-50/40 dark:hover:bg-rose-950/20 ${
                        rate.value === rateValue ? "bg-rose-50/60 dark:bg-rose-950/20" : ""
                      }`}
                    >
                      <td className="px-3.5 py-3">
                        <p className="font-bold text-slate-900 dark:text-white">{rate.label}</p>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                          {rate.value === "online-throttled"
                            ? "Lockouts and rate limits make this the realistic web scenario."
                            : rate.value === "bcrypt"
                              ? "Slow password hashes are deliberately expensive."
                              : "Fast hashes and GPUs test enormous candidate lists."}
                        </p>
                      </td>
                      <td className="px-3.5 py-3 tabular-nums text-slate-600 dark:text-slate-300">{rate.detail}</td>
                      <td className="px-3.5 py-3 text-base font-black text-slate-900 dark:text-white">{rate.display}</td>
                      <td className="px-3.5 py-3 tabular-nums text-slate-500 dark:text-slate-400">
                        {rate.log10Seconds.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Field
                label="Custom guesses per second"
                htmlFor="entropy-custom-rate"
                hint="Use a benchmark from your own hardware or a threat model."
              >
                <div className="flex gap-2">
                  <input
                    id="entropy-custom-rate"
                    value={customRate}
                    onChange={(event) => setCustomRate(event.target.value.replace(/[^0-9]/g, ""))}
                    inputMode="numeric"
                    className={`${fieldClass(false, TONE)} tabular-nums`}
                  />
                  <ActionButton
                    icon={Zap}
                    variant="primary"
                    tone={TONE}
                    onClick={() => {
                      const value = Math.max(1, Number(customRate) || 1);
                      const log10 = (analysis.adjustedBits - 1) * Math.log10(2) - Math.log10(value);
                      setRateValue("custom");
                      toast.success(`At ${value.toLocaleString()} guesses/second: ${formatBigDuration(log10)}`);
                    }}
                  >
                    Test
                  </ActionButton>
                </div>
              </Field>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current password</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-600 dark:text-slate-300">
                  {password ? (showPassword ? password : "•".repeat(analysis.length)) : "Empty"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Chip tone={TONE}>{analysis.adjustedBits.toFixed(1)} bits</Chip>
                  <Chip tone="sky">{analysis.level.level.label}</Chip>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {rates.map((rate) => (
                <button
                  key={rate.value}
                  type="button"
                  onClick={() => setRateValue(rate.value)}
                  className={`rounded-xl border p-3 text-left transition ${
                    rate.value === rateValue
                      ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">{rate.label}</span>
                  <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{rate.display}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <Callout tone="amber" variant="warning" title="These are averages">
              Attackers may get lucky and find the password after one guess. The table shows the expected halfway
              point of the search space.
            </Callout>
            <Callout tone={TONE} variant="tip" title="Entropy is not the whole story">
              Reused passwords, phishing and server breaches bypass guessing entirely. Unique passwords and
              two-factor authentication still matter.
            </Callout>
            <Callout tone="emerald" variant="success" title="Slow hashing helps">
              If a service uses bcrypt, scrypt or Argon2, the offline attack rate drops by orders of magnitude.
            </Callout>
          </div>
        </div>
      )}

      {tab === "passphrase" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={Dices}
            title="Passphrase planner"
            description="Combine random words for a long, memorable password. The built-in list is smaller than a full Diceware list, so the entropy shown is conservative."
            actions={
              <ActionButton icon={Dices} variant="primary" tone={TONE} onClick={makePhrase}>
                Generate passphrase
              </ActionButton>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SliderRow
                tone={TONE}
                label="Words"
                min={3}
                max={12}
                step={1}
                value={phraseSettings.count}
                onChange={(value) => setPhraseSettings((current) => ({ ...current, count: value }))}
                format={(value) => `${value} words`}
                hint="6–8 words is a good target for master passwords."
              />
              <Field label="Separator" htmlFor="phrase-separator">
                <select
                  id="phrase-separator"
                  value={phraseSettings.separator}
                  onChange={(event) =>
                    setPhraseSettings((current) => ({ ...current, separator: event.target.value }))
                  }
                  className={fieldClass(false, TONE)}
                >
                  <option value="-">Hyphen — word-word</option>
                  <option value=".">Dot — word.word</option>
                  <option value="_">Underscore — word_word</option>
                  <option value=" ">Space — word word</option>
                  <option value="">None — wordword</option>
                </select>
              </Field>
              <ToggleRow
                tone={TONE}
                checked={phraseSettings.randomCase}
                onChange={(value) => setPhraseSettings((current) => ({ ...current, randomCase: value }))}
                label="Random capitalisation"
                description="Adds about 1 bit per word."
              />
              <ToggleRow
                tone={TONE}
                checked={phraseSettings.addNumber}
                onChange={(value) => setPhraseSettings((current) => ({ ...current, addNumber: value }))}
                label="Append a random number"
                description="Adds about 6.6 bits with a two-digit number."
              />
            </div>

            <div className="mt-5">
              {phrase ? (
                <>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
                    <p className="break-all font-mono text-lg font-bold leading-relaxed text-slate-900 dark:text-white">
                      {phrase.phrase}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <CopyButton text={phrase.phrase} tone={TONE} label="Copy passphrase" />
                    <Chip tone={TONE}>{phrase.bits.toFixed(1)} bits</Chip>
                    <Chip tone="sky">{phrase.words} words</Chip>
                    <Chip tone="emerald">{strengthFor(phrase.bits).level.label}</Chip>
                  </div>
                  <div className="mt-4">
                    <StrengthMeter bits={phrase.bits} level={phraseStrength} />
                  </div>
                </>
              ) : (
                <Callout tone={TONE} variant="info" title="No passphrase yet">
                  Press Generate passphrase to draw random words using the browser&apos;s cryptographic random number
                  generator.
                </Callout>
              )}
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard tone={TONE} icon={Gauge} title="The maths">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-rose-300 dark:bg-slate-950">
                entropy = words × log₂(word list size)
                <br />
                {phraseSettings.count} × log₂({PASSPHRASE_WORDS.length}) ≈{" "}
                {(phraseSettings.count * Math.log2(PASSPHRASE_WORDS.length)).toFixed(1)} bits
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                The built-in list contains {PASSPHRASE_WORDS.length} words, so each word adds about{" "}
                {Math.log2(PASSPHRASE_WORDS.length).toFixed(2)} bits before capitalisation and number bonuses. A
                full 7,776-word Diceware list adds about 12.9 bits per word, so this calculator stays on the safe
                side.
              </p>
            </SectionCard>

            <SectionCard tone={TONE} icon={CheckCircle2} title="Why passphrases work">
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <li>• Long strings are hard to brute-force even when made of words.</li>
                <li>• Random words are easier to remember than random symbols.</li>
                <li>• Word order must be random — song lyrics and quotes are not random.</li>
                <li>• Use a separator and at least six words for important accounts.</li>
                <li>• Store the result in a password manager, not in a note.</li>
              </ul>
            </SectionCard>
          </div>

          <FaqAccordion items={PASSWORD_ENTROPY_FAQS.slice(0, 3)} tone={TONE} title="Passphrase questions" />
        </div>
      )}

      {tab === "learn" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard tone={TONE} icon={Gauge} title="Entropy in one line">
              <div className="rounded-xl bg-slate-900 p-4 text-center font-mono text-base leading-relaxed text-rose-300 dark:bg-slate-950">
                H = L × log₂(P)
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                L is the number of characters and P is the size of the character pool. Doubling the pool adds one bit
                per character; doubling the length doubles the total bits.
              </p>
            </SectionCard>

            <SectionCard tone={TONE} icon={Hash} title="Pool sizes" className="lg:col-span-2">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">Characters used</th>
                      <th className="px-3 py-2.5 font-bold">Pool</th>
                      <th className="px-3 py-2.5 font-bold">Bits per character</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      ["Digits only", 10],
                      ["Lowercase", 26],
                      ["Upper + lowercase", 52],
                      ["Letters + digits", 62],
                      ["Letters + digits + symbols", 95],
                      ["Unicode / emoji", 100],
                    ].map(([label, size]) => (
                      <tr key={label}>
                        <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{label}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">{size}</td>
                        <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">
                          {Math.log2(size).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          <SectionCard tone={TONE} icon={ListChecks} title="Strength bands used by this tool" description="These are practical bands, not a formal standard. Offline attacks need far more entropy than online logins.">
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Very weak", "under 28 bits", "Cracked almost instantly"],
                ["Weak", "28–35 bits", "Fine only for throwaway accounts"],
                ["Fair", "36–59 bits", "Okay online, weak against fast hashes"],
                ["Strong", "60–79 bits", "Comfortable for most online accounts"],
                ["Very strong", "80–127 bits", "Suitable for password managers"],
                ["Exceptional", "128+ bits", "Long passphrases and high-security keys"],
              ].map(([label, range, note]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{range}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{note}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <Callout tone={TONE} variant="tip" title="Length beats symbols">
              Adding two random characters usually adds more entropy than swapping letters for symbols.
            </Callout>
            <Callout tone="amber" variant="warning" title="Predictable substitutions">
              “p@ssw0rd” is still “password”. Attackers apply the same substitution rules automatically.
            </Callout>
            <Callout tone="emerald" variant="success" title="NIST guidance">
              NIST SP 800-63B recommends long passwords, blocks common ones and avoids forced composition rules and
              frequent rotation.
            </Callout>
          </div>

          <FaqAccordion items={PASSWORD_ENTROPY_FAQS} tone={TONE} title="Password entropy questions, answered" />
        </div>
      )}
    </div>
  );
}
