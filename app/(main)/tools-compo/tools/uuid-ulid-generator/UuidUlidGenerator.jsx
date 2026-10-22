"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ToolPageShell from "../../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Binary,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  Clock3,
  Copy,
  Download,
  FileJson,
  FileText,
  Fingerprint,
  History,
  Info,
  Link2,
  ListOrdered,
  LockKeyhole,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import {
  DEFAULT_OPTIONS,
  ID_FAQS,
  ID_MODES,
  NANOID_DEFAULT_ALPHABET,
  UUID_NAMESPACES,
  buildOutput,
  formatGeneratedAt,
  formatIdentifier,
  formatInspectDate,
  generateIdentifiers,
  inspectIdentifier,
} from "./uuidUlidData";

const FIELD_BASE =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:ring-2 focus:ring-cyan-500/30 dark:bg-slate-800/80 dark:text-white [color-scheme:light] dark:[color-scheme:dark]";

const INPUT_LABEL =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400";

const MODE_ICONS = {
  uuidv4: Sparkles,
  uuidv7: Clock3,
  uuidv1: History,
  uuidv5: Link2,
  ulid: ListOrdered,
  nanoid: Binary,
};

function fieldClass(error) {
  return `${FIELD_BASE} ${
    error
      ? "border-rose-400 ring-1 ring-rose-300 dark:border-rose-700 dark:ring-rose-900/60"
      : "border-slate-200 dark:border-slate-700"
  }`;
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <div>
        <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{label}</div>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const successful = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!successful) throw new Error("Copy failed");
}

function downloadFileName(mode, quantity, extension) {
  const date = new Date().toISOString().slice(0, 10);
  return `${mode}-${quantity}-ids-${date}.${extension}`;
}

function OutputMetric({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 break-words text-[13px] font-black text-cyan-200">{value}</p>
      {sub && <p className="mt-0.5 text-[9px] text-slate-500">{sub}</p>}
    </div>
  );
}

function AnatomyChip({ children, tone }) {
  const tones = {
    time: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
    version: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/60 dark:text-fuchsia-300",
    variant: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    random: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
  };
  return (
    <span className={`rounded px-1 py-0.5 font-black ${tones[tone]}`}>
      {children}
    </span>
  );
}

function InspectorRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="max-w-[65%] text-right text-[11px] font-semibold text-slate-700 dark:text-slate-200">
        {children}
      </span>
    </div>
  );
}

export default function UuidUlidGenerator() {
  const { addRecentTool } = useRecentTools();
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS });
  const [result, setResult] = useState({
    values: [],
    error: "",
    mode: "uuidv4",
    modeLabel: "UUID v4",
    quantity: 0,
    entropyBits: 122,
    collision: "—",
    generatedAt: null,
    timeOrdered: false,
  });
  const [generating, setGenerating] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [inspectValue, setInspectValue] = useState("");
  const requestRef = useRef(0);

  useEffect(() => {
    addRecentTool({
      title: "UUID / ULID Generator",
      link: "/tools/uuid-ulid-generator",
      icon: "Fingerprint",
    });

    let active = true;
    const initialRequest = requestRef.current + 1;
    requestRef.current = initialRequest;
    generateIdentifiers(DEFAULT_OPTIONS).then((next) => {
      if (!active || requestRef.current !== initialRequest) return;
      setResult(next);
      setGenerating(false);
    });
    return () => {
      active = false;
      requestRef.current += 1;
    };
  }, [addRecentTool]);

  const mode = ID_MODES.find((item) => item.id === options.mode) || ID_MODES[0];
  const resultMode = result.mode || options.mode;
  const isUuid = resultMode.startsWith("uuid");
  const isV5 = options.mode === "uuidv5";
  const isNano = options.mode === "nanoid";
  const isUlid = options.mode === "ulid";

  const formattedValues = useMemo(
    () =>
      result.values.map((value) =>
        formatIdentifier(value, { ...options, mode: result.mode || options.mode }),
      ),
    [result.values, result.mode, options],
  );
  const output = useMemo(
    () => buildOutput(formattedValues, options),
    [formattedValues, options],
  );
  const inspection = useMemo(() => inspectIdentifier(inspectValue), [inspectValue]);

  const runGeneration = async (nextOptions, announce = false) => {
    const request = requestRef.current + 1;
    requestRef.current = request;
    setGenerating(true);
    const next = await generateIdentifiers(nextOptions);
    if (request !== requestRef.current) return;
    setResult(next);
    setGenerating(false);
    if (next.error) {
      toast.error(next.error);
    } else if (announce) {
      toast.success(`${next.quantity} secure ${next.quantity === 1 ? "identifier" : "identifiers"} generated.`);
    }
  };

  const handleMode = (nextMode) => {
    const next = {
      ...options,
      mode: nextMode,
      quantity: Number(options.quantity) || 5,
    };
    setOptions(next);
    setShowAdvanced(false);
    runGeneration(next);
  };

  const handleReset = () => {
    setOptions({ ...DEFAULT_OPTIONS });
    setInspectValue("");
    setShowAdvanced(false);
    setOpenFaq(0);
    runGeneration(DEFAULT_OPTIONS);
    toast.success("Generator reset to UUID v4.");
  };

  const handleCopy = async () => {
    if (!result.values.length) {
      toast.error("Generate at least one identifier before copying.");
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(output);
      } else {
        fallbackCopy(output);
      }
      toast.success("Identifiers copied to clipboard.");
    } catch {
      toast.error("Copy failed. Your browser may be blocking clipboard access.");
    }
  };

  const handleDownload = (format) => {
    if (!result.values.length) {
      toast.error("Generate at least one identifier before downloading.");
      return;
    }
    let content = output;
    let mime = "text/plain;charset=utf-8";
    let extension = "txt";
    if (format === "json") {
      content = JSON.stringify(formattedValues, null, 2);
      mime = "application/json;charset=utf-8";
      extension = "json";
    } else if (format === "csv") {
      content = ["identifier", ...formattedValues]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join("\r\n");
      mime = "text/csv;charset=utf-8";
      extension = "csv";
    }
    downloadBlob(
      new Blob([content], { type: mime }),
      downloadFileName(result.mode, result.values.length, extension),
    );
    toast.success(`${extension.toUpperCase()} file downloaded.`);
  };

  return (
    <ToolPageShell widthClassName="max-w-none">
      <div className="mx-auto w-full space-y-7 pb-12 lg:w-11/12">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-indigo-500/15 sm:p-9">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-cyan-50 backdrop-blur-sm">
              <Fingerprint className="h-3.5 w-3.5" aria-hidden="true" />
              Identity engineering lab
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              UUID / ULID Generator
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-cyan-50/95 sm:text-base">
              Generate cryptographically secure UUID v4, v7, v1 and v5 values, sortable
              ULIDs or compact NanoIDs. Format a whole batch, inspect any identifier and
              understand exactly what is inside it — without sending a byte anywhere.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "6 identifier formats",
                "Up to 1,000 at once",
                "CSPRNG only",
                "Built-in inspector",
                "100% private",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-cyan-50 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-3 w-3 text-cyan-100" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute right-8 top-8 hidden w-64 rotate-3 rounded-2xl border border-white/15 bg-slate-950/30 p-4 font-mono text-[10px] leading-relaxed text-cyan-100/80 shadow-2xl backdrop-blur-sm xl:block">
            <p><span className="text-cyan-300/60">const</span> id = <span className="text-lime-300">&quot;0198c5d0-7a3b-7c4d-8e9f-a1b2c3d4e5f6&quot;</span>;</p>
            <p className="mt-2 text-slate-400">{"// 48-bit time · 74-bit random"}</p>
            <p className="mt-2"><span className="text-cyan-300/60">crypto</span>.randomUUID()</p>
            <p className="mt-1 text-lime-300/80">{"✓ 122 bits of entropy"}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white lg:text-base">
                      Choose an identifier
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 lg:text-xs">
                      Every value comes from the browser&apos;s secure random generator.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Reset
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ID_MODES.map((item) => {
                  const Icon = MODE_ICONS[item.id] || Fingerprint;
                  const selected = options.mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMode(item.id)}
                      aria-pressed={selected}
                      className={`group rounded-2xl border p-3 text-left transition ${
                        selected
                          ? "border-cyan-400 bg-cyan-50 shadow-sm ring-1 ring-cyan-300 dark:border-cyan-600 dark:bg-cyan-950/30 dark:ring-cyan-900"
                          : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-cyan-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                            selected
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:text-cyan-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        {selected && <Check className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />}
                      </div>
                      <p className="mt-2 text-xs font-black text-slate-900 dark:text-white">{item.label}</p>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">{item.tagline}</p>
                      <p className="mt-1 line-clamp-2 text-[9px] leading-snug text-slate-500 dark:text-slate-400">{item.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-cyan-900 dark:text-cyan-200">
                  <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="font-extrabold">{mode.label}:</strong> {mode.description}{" "}
                    {mode.timeOrdered ? "This format embeds a creation timestamp." : "No timestamp is embedded."}
                  </span>
                </p>
              </div>

              {isV5 && (
                <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30 sm:p-4">
                  <div>
                    <label htmlFor="uuid-namespace" className={INPUT_LABEL}>
                      Namespace
                    </label>
                    <select
                      id="uuid-namespace"
                      value={options.namespace}
                      onChange={(event) => setOptions((current) => ({ ...current, namespace: event.target.value }))}
                      className={fieldClass(false)}
                    >
                      {UUID_NAMESPACES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      {UUID_NAMESPACES.find((item) => item.id === options.namespace)?.hint}
                    </p>
                  </div>

                  {options.namespace === "custom" && (
                    <div>
                      <label htmlFor="uuid-custom-namespace" className={INPUT_LABEL}>
                        Custom namespace UUID
                      </label>
                      <input
                        id="uuid-custom-namespace"
                        type="text"
                        value={options.customNamespace}
                        onChange={(event) => setOptions((current) => ({ ...current, customNamespace: event.target.value }))}
                        placeholder="e.g. 6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                        spellCheck={false}
                        className={`${fieldClass(false)} font-mono`}
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="uuid-name" className={INPUT_LABEL}>
                      Name to hash
                    </label>
                    <input
                      id="uuid-name"
                      type="text"
                      value={options.name}
                      maxLength={2048}
                      onChange={(event) => setOptions((current) => ({ ...current, name: event.target.value }))}
                      placeholder="e.g. example.com"
                      className={fieldClass(false)}
                    />
                    <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                      The same namespace and exact name always produce the same UUID. Press Generate UUID when ready.
                    </p>
                  </div>

                  <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    UUID v5 is deterministic and predictable. Never use it as a secret, password-reset token or session ID.
                  </p>
                </div>
              )}

              {isNano && (
                <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30 sm:p-4">
                  <div>
                    <label htmlFor="nano-length" className={INPUT_LABEL}>
                      NanoID length
                    </label>
                    <input
                      id="nano-length"
                      type="number"
                      min="1"
                      max="256"
                      step="1"
                      inputMode="numeric"
                      value={options.nanoLength}
                      onChange={(event) => setOptions((current) => ({ ...current, nanoLength: event.target.value }))}
                      className={fieldClass(false)}
                    />
                  </div>
                  <div>
                    <label htmlFor="nano-alphabet" className={INPUT_LABEL}>
                      Custom alphabet
                    </label>
                    <input
                      id="nano-alphabet"
                      type="text"
                      value={options.nanoAlphabet}
                      onChange={(event) => setOptions((current) => ({ ...current, nanoAlphabet: event.target.value }))}
                      spellCheck={false}
                      className={`${fieldClass(false)} font-mono`}
                    />
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Duplicate characters are ignored. At least two unique characters are required.
                      </p>
                      <button
                        type="button"
                        onClick={() => setOptions((current) => ({ ...current, nanoAlphabet: NANOID_DEFAULT_ALPHABET }))}
                        className="shrink-0 text-[10px] font-bold text-cyan-700 hover:underline dark:text-cyan-300"
                      >
                        Restore URL-safe
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
                {!isV5 && (
                  <div>
                    <label htmlFor="identifier-quantity" className={INPUT_LABEL}>
                      How many identifiers?
                    </label>
                    <input
                      id="identifier-quantity"
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      inputMode="numeric"
                      value={options.quantity}
                      onChange={(event) => setOptions((current) => ({ ...current, quantity: event.target.value }))}
                      className={fieldClass(false)}
                    />
                    <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      Generate between 1 and 1,000 values per batch.
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => runGeneration(options, true)}
                  disabled={generating}
                  className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 text-xs font-black text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[180px]"
                >
                  <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} aria-hidden="true" />
                  {generating ? "Generating…" : isV5 ? "Generate UUID" : "Generate IDs"}
                </button>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setShowAdvanced((current) => !current)}
                aria-expanded={showAdvanced}
                aria-controls="id-format-panel"
                className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:p-5"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Braces className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-slate-900 dark:text-white">
                      Formatting &amp; output options
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                      Case, hyphens, braces, ordering and separators.
                    </span>
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition ${showAdvanced ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {showAdvanced && (
                <div id="id-format-panel" className="border-t border-slate-100 p-4 dark:border-slate-800 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {isUuid && (
                      <>
                        <Toggle
                          checked={Boolean(options.uppercase)}
                          onChange={(checked) => setOptions((current) => ({ ...current, uppercase: checked }))}
                          label="Uppercase hex"
                          description="Display UUID letters A–F in uppercase."
                        />
                        <Toggle
                          checked={Boolean(options.hyphens)}
                          onChange={(checked) => setOptions((current) => ({ ...current, hyphens: checked }))}
                          label="Include hyphens"
                          description="Use the standard 8-4-4-4-12 UUID layout."
                        />
                        <Toggle
                          checked={Boolean(options.braces)}
                          onChange={(checked) => setOptions((current) => ({ ...current, braces: checked }))}
                          label="Wrap in braces"
                          description="Add {curly braces} around each UUID."
                        />
                      </>
                    )}
                    {isUlid && (
                      <Toggle
                        checked={Boolean(options.monotonic)}
                        onChange={(checked) => setOptions((current) => ({ ...current, monotonic: checked }))}
                        label="Monotonic ULIDs"
                        description="Increment the random tail within the same millisecond so the batch sorts."
                      />
                    )}
                  </div>

                  <div className={`${isUuid || isUlid ? "mt-3" : ""}`}>
                    <label htmlFor="id-separator" className={INPUT_LABEL}>
                      Output layout
                    </label>
                    <select
                      id="id-separator"
                      value={options.separator}
                      onChange={(event) => setOptions((current) => ({ ...current, separator: event.target.value }))}
                      className={fieldClass(false)}
                    >
                      <option value="newline">One per line</option>
                      <option value="comma">Comma separated</option>
                      <option value="space">Space separated</option>
                      <option value="json">JSON array</option>
                    </select>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Layout changes apply instantly to the current batch. Regenerate to create new values.
                    </p>
                  </div>

                  {isUlid && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-cyan-50 px-3 py-2 text-[10px] leading-relaxed text-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-200">
                      <ListOrdered className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      ULIDs are canonically uppercase and are always emitted that way. Lowercase input is accepted by the inspector.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-5 lg:col-span-5 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/20">
              <div className="border-b border-white/10 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-white">
                      <ScanLine className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                      Generated output
                    </h2>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {result.quantity > 0
                        ? `${result.quantity} ${result.quantity === 1 ? "identifier" : "identifiers"} · ${result.modeLabel}`
                        : "Ready when you are"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-300">
                    <LockKeyhole className="h-2.5 w-2.5" aria-hidden="true" />
                    Secure CSPRNG
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                {result.error ? (
                  <div role="alert" className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-extrabold text-rose-300">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      Could not generate
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-rose-200/80">{result.error}</p>
                  </div>
                ) : null}

                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                      {result.mode}.ids
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px] text-cyan-300/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      live
                    </span>
                  </div>
                  <textarea
                    aria-label="Generated identifiers"
                    readOnly
                    value={output}
                    placeholder={generating ? "Generating secure identifiers…" : "Your identifiers will appear here."}
                    rows={12}
                    spellCheck={false}
                    className="block min-h-[240px] w-full resize-y bg-transparent px-3 py-3 font-mono text-[11px] leading-relaxed text-lime-200 outline-none placeholder:text-slate-600 sm:text-xs"
                  />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!result.values.length}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-cyan-500 px-2 py-2 text-[10px] font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ClipboardCopy className="h-3 w-3" aria-hidden="true" />
                    Copy all
                  </button>
                  <button
                    type="button"
                    onClick={() => runGeneration(options, true)}
                    disabled={generating}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2 py-2 text-[10px] font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RefreshCw className={`h-3 w-3 ${generating ? "animate-spin" : ""}`} aria-hidden="true" />
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("txt")}
                    disabled={!result.values.length}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2 py-2 text-[10px] font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Download className="h-3 w-3" aria-hidden="true" />
                    .txt
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload("json")}
                    disabled={!result.values.length}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 px-2 py-1.5 text-[9px] font-bold text-slate-400 transition hover:bg-white/5 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FileJson className="h-3 w-3" aria-hidden="true" />
                    Download .json
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("csv")}
                    disabled={!result.values.length}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 px-2 py-1.5 text-[9px] font-bold text-slate-400 transition hover:bg-white/5 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FileText className="h-3 w-3" aria-hidden="true" />
                    Download .csv
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <OutputMetric
                    label="Entropy"
                    value={`${result.entropyBits || 0} bits`}
                    sub={result.timeOrdered ? "Time-ordered format" : "Random format"}
                  />
                  <OutputMetric
                    label="Batch collision risk"
                    value={result.collision}
                    sub={`${result.quantity || 0} generated`}
                  />
                </div>

                <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Generated</span>
                    <span className="text-[10px] font-semibold text-slate-300">
                      {formatGeneratedAt(result.generatedAt)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Source</span>
                    <span className="text-[10px] font-semibold text-cyan-300">crypto.getRandomValues()</span>
                  </div>
                </div>

                <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-slate-500">
                  <ShieldCheck className="mt-px h-3 w-3 shrink-0 text-emerald-400/70" aria-hidden="true" />
                  Values are generated locally. Nothing is sent to a server, saved or logged.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-cyan-100 bg-cyan-50/60 p-4 dark:border-cyan-900/40 dark:bg-cyan-950/20 sm:p-5">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                <div>
                  <h2 className="text-xs font-extrabold text-cyan-900 dark:text-cyan-100">Which format should I choose?</h2>
                  <p className="mt-1 text-[10px] leading-relaxed text-cyan-800/80 dark:text-cyan-200/80">
                    Choose <strong>v4</strong> for opaque public IDs, <strong>v7</strong> or <strong>ULID</strong> for sortable database keys, and <strong>v5</strong> only for repeatable mappings. Use NanoID when you need a specific length and alphabet.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-2 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Search className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Inspect an identifier</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Paste a UUID or ULID to reveal its version, timestamp and structure.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="identifier-inspect" className={INPUT_LABEL}>
                Identifier to inspect
              </label>
              <input
                id="identifier-inspect"
                type="text"
                value={inspectValue}
                onChange={(event) => setInspectValue(event.target.value)}
                placeholder="e.g. cfbff0d1-9375-5685-968c-48ce8b15ae17"
                spellCheck={false}
                className={`${fieldClass(false)} font-mono`}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setInspectValue("cfbff0d1-9375-5685-968c-48ce8b15ae17")}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-800"
                >
                  Sample UUID
                </button>
                <button
                  type="button"
                  onClick={() => setInspectValue("01ARZ3NDEKTSV4RRFFQ69G5FAV")}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-800"
                >
                  Sample ULID
                </button>
                {inspectValue && (
                  <button
                    type="button"
                    onClick={() => setInspectValue("")}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
                  >
                    <X className="h-2.5 w-2.5" aria-hidden="true" />
                    Clear
                  </button>
                )}
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                The inspector accepts UUIDs with or without hyphens or braces, and ULIDs in upper or lower case. Values are checked locally and never stored.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            {inspection.status === "empty" && (
              <div className="flex h-full min-h-[190px] flex-col items-center justify-center text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800">
                  <Fingerprint className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-xs font-extrabold text-slate-700 dark:text-slate-200">Nothing to inspect yet</p>
                <p className="mt-1 max-w-xs text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Paste an identifier or try one of the samples to see its version, variant and embedded time.
                </p>
              </div>
            )}

            {inspection.status === "invalid" && (
              <div role="status" className="flex h-full min-h-[190px] flex-col items-center justify-center text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-xs font-extrabold text-rose-700 dark:text-rose-300">Not a valid UUID or ULID</p>
                <p className="mt-1 max-w-xs text-[10px] leading-relaxed text-rose-600/80 dark:text-rose-300/80">
                  {inspection.message}
                </p>
              </div>
            )}

            {inspection.status === "valid" && (
              <div role="status">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    Valid {inspection.kind}
                  </span>
                  {inspection.versionLabel && (
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200">
                      {inspection.versionLabel}
                    </span>
                  )}
                </div>

                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Canonical form</p>
                  <p className="mt-1 break-all font-mono text-[11px] font-bold text-slate-800 dark:text-slate-100">
                    {inspection.canonical}
                  </p>
                </div>

                <div className="mt-3">
                  <InspectorRow label="Kind">{inspection.kind}</InspectorRow>
                  {inspection.versionLabel && <InspectorRow label="Version">{inspection.versionLabel}</InspectorRow>}
                  <InspectorRow label="Variant">{inspection.variant}</InspectorRow>
                  {inspection.timestamp && (
                    <InspectorRow label="Embedded time">{formatInspectDate(inspection.timestamp)}</InspectorRow>
                  )}
                  <InspectorRow label="Random bits">
                    {inspection.randomBits === 0 ? "Deterministic" : inspection.randomBits ? `${inspection.randomBits} bits` : "—"}
                  </InspectorRow>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {inspection.notes.map((note) => (
                    <li key={note} className="flex gap-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-cyan-500" aria-hidden="true" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300">
              <ScanLine className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">What&apos;s inside an identifier?</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Colour-coded anatomy of time-ordered UUIDs and ULIDs.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">UUID v7</p>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">128 bits · 36 chars</span>
              </div>
              <p className="mt-3 break-all font-mono text-sm font-bold leading-loose">
                <AnatomyChip tone="time">0198c5d0-7a3b</AnatomyChip>
                <span className="text-slate-300 dark:text-slate-600">-</span>
                <AnatomyChip tone="version">7</AnatomyChip>
                <AnatomyChip tone="random">c4d</AnatomyChip>
                <span className="text-slate-300 dark:text-slate-600">-</span>
                <AnatomyChip tone="variant">8</AnatomyChip>
                <span className="text-slate-300 dark:text-slate-600">e9f-a1b2c3d4e5f6</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400" /> 48-bit timestamp</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-fuchsia-400" /> version</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> variant</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-400" /> 74-bit random</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">ULID</p>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">128 bits · 26 chars</span>
              </div>
              <p className="mt-3 break-all font-mono text-sm font-bold leading-loose">
                <AnatomyChip tone="time">01ARZ3NDEK</AnatomyChip>
                <AnatomyChip tone="random">TSV4RRFFQ69G5FAV</AnatomyChip>
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400" /> 10-char timestamp</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-400" /> 16-char random tail</span>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                Crockford Base32 avoids I, L, O and U so the value is easier to read aloud and less likely to be mistyped.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Opaque by default",
                body: "UUID v4 and NanoID carry no creation time. Use them for public URLs and tokens where you do not want to reveal when a record was made.",
                icon: LockKeyhole,
                tone: "text-indigo-600 dark:text-indigo-300",
              },
              {
                title: "Sortable at the source",
                body: "UUID v7 and ULID start with a millisecond timestamp, so database indexes stay local and recent records sort naturally.",
                icon: ListOrdered,
                tone: "text-cyan-600 dark:text-cyan-300",
              },
              {
                title: "Repeatable mappings",
                body: "UUID v5 hashes a namespace and name into the same UUID every time. Great for integration keys, never for secrets.",
                icon: Link2,
                tone: "text-fuchsia-600 dark:text-fuchsia-300",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
                  <Icon className={`h-4 w-4 ${card.tone}`} aria-hidden="true" />
                  <p className="mt-1.5 text-[11px] font-extrabold text-slate-900 dark:text-white">{card.title}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">{card.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
              <Search className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">UUID / ULID Generator FAQ</h2>
          </div>
          <div className="mt-4 space-y-2">
            {ID_FAQS.map((faq, index) => {
              const expanded = openFaq === index;
              return (
                <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(expanded ? null : index)}
                    aria-expanded={expanded}
                    aria-controls={`id-faq-${index}`}
                    className="flex w-full items-center justify-between gap-3 bg-slate-50/60 px-4 py-3 text-left text-xs font-extrabold text-slate-800 transition hover:bg-cyan-50/60 dark:bg-slate-800/40 dark:text-slate-100 dark:hover:bg-slate-800/70 sm:text-[13px]"
                  >
                    {faq.question}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {expanded && (
                    <p id={`id-faq-${index}`} className="bg-white px-4 py-3 text-[11px] leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-300 sm:text-xs">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" aria-hidden="true" />
          All identifiers are generated and inspected in your browser. No uploads, accounts or tracking.
          <ArrowRight className="hidden h-3.5 w-3.5 sm:block" aria-hidden="true" />
        </div>
      </div>
    </ToolPageShell>
  );
}
