"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  ClipboardPaste,
  Download,
  Eraser,
  Globe2,
  Info,
  Link2,
  ListFilter,
  Plus,
  RotateCcw,
  ScanSearch,
  Sparkles,
  Table2,
  Trash2,
  Wand2,
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
  Stat,
  ToggleRow,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import {
  MODE_HELP,
  SAMPLE_URLS,
  URL_FAQS,
  REFERENCE_ROWS,
  buildQueryString,
  inspectUrl,
  parseQueryString,
  processText,
  textStats,
} from "./urlCodecData";

const TABS = [
  { value: "codec", label: "Codec", icon: ArrowLeftRight },
  { value: "builder", label: "Query Builder", icon: Table2 },
  { value: "reference", label: "Reference", icon: BookOpen },
];

function makeRow(key = "", value = "") {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return { id, key, value, enabled: true };
}

function ComponentRow({ label, value, mono = true }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-sm font-bold text-slate-400">—</span>
      </div>
      <p
        className={`mt-0.5 break-all text-sm text-slate-900 dark:text-slate-100 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || <span className="text-slate-400">not set</span>}
      </p>
    </div>
  );
}

export default function UrlEncoderDecoder() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("codec");
  const [direction, setDirection] = useState("encode");
  const [mode, setMode] = useState("uri");
  const [input, setInput] = useState(SAMPLE_URLS[0].value);
  const [sampleIndex, setSampleIndex] = useState(0);

  const [spaceAsPlus, setSpaceAsPlus] = useState(false);
  const [strict, setStrict] = useState(false);
  const [lowerHex, setLowerHex] = useState(false);
  const [perLine, setPerLine] = useState(false);
  const [safeChars, setSafeChars] = useState("/:?=&-._~");
  const [preserveReserved, setPreserveReserved] = useState(true);

  const [rows, setRows] = useState([
    makeRow("q", "hello world"),
    makeRow("lang", "en"),
    makeRow("page", "1"),
  ]);
  const [baseUrl, setBaseUrl] = useState("https://example.com/search");
  const [builderForm, setBuilderForm] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
  const [includeEmpty, setIncludeEmpty] = useState(true);

  useEffect(() => {
    addRecentTool({
      title: "URL Encoder / Decoder",
      link: "/tools/url-encoder-decoder",
      icon: "Link",
    });
  }, [addRecentTool]);

  const options = useMemo(
    () => ({
      mode,
      spaceAsPlus,
      strict,
      lowerHex,
      safeChars,
      perLine,
      preserveReserved,
    }),
    [mode, spaceAsPlus, strict, lowerHex, safeChars, perLine, preserveReserved],
  );

  const result = useMemo(() => processText(input, direction, options), [input, direction, options]);
  const inputStats = useMemo(() => textStats(input), [input]);
  const outputStats = useMemo(() => textStats(result.output), [result.output]);
  const inspected = useMemo(() => inspectUrl(input), [input]);

  const queryOptions = useMemo(
    () => ({
      mode: builderForm ? "form" : "component",
      spaceAsPlus: builderForm,
      strict,
      lowerHex,
      sortKeys,
      includeEmpty,
    }),
    [builderForm, strict, lowerHex, sortKeys, includeEmpty],
  );

  const queryString = useMemo(() => buildQueryString(rows, queryOptions), [rows, queryOptions]);
  const fullBuiltUrl = `${baseUrl}${queryString}`;

  const loadSample = () => {
    const next = (sampleIndex + 1) % SAMPLE_URLS.length;
    setSampleIndex(next);
    setInput(SAMPLE_URLS[next].value);
    setDirection("encode");
    toast.success(`Loaded sample: ${SAMPLE_URLS[next].label}`);
  };

  const handleSwap = () => {
    if (!result.output) {
      toast.error("There is nothing to swap yet — add some text first.");
      return;
    }
    setInput(result.output);
    setDirection((current) => (current === "encode" ? "decode" : "encode"));
    toast.success(direction === "encode" ? "Moved the encoded value into the decoder." : "Moved the decoded value into the encoder.");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.error("Your clipboard is empty.");
        return;
      }
      setInput(text);
      toast.success("Pasted from clipboard.");
    } catch {
      toast.error("Clipboard access was blocked. Paste with Ctrl/Cmd + V instead.");
    }
  };

  const handleDownload = () => {
    if (!result.output) {
      toast.error("There is no output to download.");
      return;
    }
    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = direction === "encode" ? "encoded-url.txt" : "decoded-url.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast.success("Text file downloaded.");
  };

  const importFromInput = () => {
    const parsed = parseQueryString(input);
    if (!parsed.length) {
      toast.error("No query parameters were found in the input.");
      return;
    }
    setRows(parsed.map((row) => makeRow(row.key, row.value)));
    toast.success(`Imported ${parsed.length} parameter${parsed.length === 1 ? "" : "s"}.`);
  };

  const applyToCodec = () => {
    if (!queryString) {
      toast.error("Add at least one key before applying the query string.");
      return;
    }
    setInput(fullBuiltUrl);
    setDirection("encode");
    setMode("uri");
    setTab("codec");
    toast.success("Built URL loaded into the codec.");
  };

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone="sky"
        eyebrow="Developer utility"
        icon={Link2}
        title="URL Encoder & Decoder"
        description="Encode or decode URLs, query strings and form data with full control over reserved characters, spaces and percent-escape casing. Includes a live URL inspector, a query-string builder and a malformed-escape-safe decoder — all in your browser."
        badges={[
          "RFC 3986 aware",
          "Malformed input safe",
          "Query builder",
          "URL inspector",
          "100% private",
        ]}
      />

      <div
        role="tablist"
        aria-label="URL tool sections"
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

      {tab === "codec" && (
        <>
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            <SectionCard
              tone="sky"
              icon={ArrowLeftRight}
              title={direction === "encode" ? "Encode" : "Decode"}
              description="Results update live as you type. Nothing is sent to a server."
              actions={
                <div className="flex flex-wrap gap-2">
                  <ActionButton icon={Sparkles} onClick={loadSample}>
                    Sample
                  </ActionButton>
                  <ActionButton
                    icon={ArrowLeftRight}
                    onClick={handleSwap}
                    title="Swap input and output"
                  >
                    Swap
                  </ActionButton>
                </div>
              }
            >
              <Segmented
                label="Direction"
                tone="sky"
                columns={2}
                value={direction}
                onChange={(value) => setDirection(value)}
                options={[
                  { value: "encode", label: "Encode" },
                  { value: "decode", label: "Decode" },
                ]}
              />

              <div className="mt-4">
                <Field
                  label="Treat input as"
                  htmlFor="url-mode"
                  hint={MODE_HELP[mode]}
                  aside={
                    <span className="text-sm font-medium text-slate-400">
                      {inputStats.chars.toLocaleString()} chars
                    </span>
                  }
                >
                  <select
                    id="url-mode"
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
                    className={fieldClass(false, "sky")}
                  >
                    <option value="component">Single component / value</option>
                    <option value="uri">Complete URL</option>
                    <option value="form">Form data (x-www-form-urlencoded)</option>
                    <option value="custom">Custom safe characters</option>
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Input" htmlFor="url-input">
                  <textarea
                    id="url-input"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    spellCheck={false}
                    rows={9}
                    placeholder="Paste a URL, query value or text here…"
                    className={`${fieldClass(false, "sky")} min-h-44 resize-y font-mono leading-relaxed`}
                  />
                </Field>
                {result.error && <FieldError>{result.error}</FieldError>}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ActionButton icon={ClipboardPaste} onClick={handlePaste}>
                  Paste
                </ActionButton>
                <ActionButton
                  icon={Eraser}
                  variant="ghost"
                  onClick={() => {
                    setInput("");
                    toast.success("Input cleared.");
                  }}
                >
                  Clear
                </ActionButton>
                <span className="ml-auto text-sm text-slate-400">
                  Tip: press Ctrl/Cmd + Enter to copy the result
                </span>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <ToggleRow
                  tone="sky"
                  checked={spaceAsPlus}
                  onChange={setSpaceAsPlus}
                  label="Spaces as +"
                  description="Form-style encoding. A literal plus becomes %2B."
                />
                <ToggleRow
                  tone="sky"
                  checked={lowerHex}
                  onChange={setLowerHex}
                  label="Lowercase hex"
                  description="Write %e2%9c%93 instead of %E2%9C%93."
                />
                {direction === "encode" ? (
                  <ToggleRow
                    tone="sky"
                    checked={strict}
                    onChange={setStrict}
                    label="Strict RFC 3986"
                    description="Also escape ! ' ( ) * which encodeURIComponent leaves raw."
                  />
                ) : (
                  <ToggleRow
                    tone="sky"
                    checked={preserveReserved}
                    onChange={setPreserveReserved}
                    label="Preserve reserved escapes"
                    description="Keep %2F, %3F and %23 encoded so the structure stays intact."
                  />
                )}
                <ToggleRow
                  tone="sky"
                  checked={perLine}
                  onChange={setPerLine}
                  label="Process each line"
                  description="Batch mode: encode or decode every line independently."
                />
              </div>

              {mode === "custom" && (
                <div className="mt-4">
                  <Field
                    label="Safe characters to leave unencoded"
                    htmlFor="url-safe"
                    hint="Letters and digits are always safe. Add punctuation that your target API allows raw."
                  >
                    <input
                      id="url-safe"
                      value={safeChars}
                      onChange={(event) => setSafeChars(event.target.value)}
                      spellCheck={false}
                      className={`${fieldClass(false, "sky")} font-mono`}
                    />
                  </Field>
                </div>
              )}
            </SectionCard>

            <SectionCard
              tone="sky"
              icon={ScanSearch}
              title={direction === "encode" ? "Encoded result" : "Decoded result"}
              description={
                result.invalid > 0
                  ? `${result.invalid} malformed escape${result.invalid === 1 ? "" : "s"} preserved unchanged.`
                  : "Ready to copy, share or paste into your request."
              }
              actions={
                <>
                  <CopyButton text={result.output} tone="sky" label="Copy" />
                  <ActionButton icon={Download} onClick={handleDownload}>
                    Download
                  </ActionButton>
                </>
              }
            >
              <textarea
                readOnly
                value={result.output}
                rows={9}
                aria-label="Converted output"
                spellCheck={false}
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && result.output) {
                    event.preventDefault();
                    navigator.clipboard
                      ?.writeText(result.output)
                      .then(() => toast.success("Result copied to clipboard."))
                      .catch(() => toast.error("Copy was blocked by the browser."));
                  }
                }}
                className={`${fieldClass(false, "sky")} min-h-44 resize-y bg-slate-50 font-mono leading-relaxed dark:bg-slate-950/50`}
                placeholder="Your converted result appears here…"
              />

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Stat tone="sky" label="Characters" value={outputStats.chars.toLocaleString()} />
                <Stat tone="sky" label="UTF-8 bytes" value={outputStats.bytes.toLocaleString()} />
                <Stat tone="sky" label="% escapes" value={outputStats.escapes.toLocaleString()} />
                <Stat
                  tone="sky"
                  label="Size change"
                  value={
                    inputStats.bytes === 0
                      ? "—"
                      : `${outputStats.bytes >= inputStats.bytes ? "+" : ""}${(
                          ((outputStats.bytes - inputStats.bytes) / inputStats.bytes) *
                          100
                        ).toFixed(1)}%`
                  }
                />
              </div>

              {result.invalid > 0 && (
                <Callout tone="sky" variant="warning" className="mt-4" title="Tolerant decode">
                  {result.invalid} percent sequence{result.invalid === 1 ? " was" : "s were"} not valid
                  UTF-8 and left exactly as typed. Everything around them still decoded normally.
                </Callout>
              )}

              {result.output && result.output !== input && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip tone="sky">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {direction === "encode" ? "Encoded" : "Decoded"} successfully
                  </Chip>
                  <Chip tone="sky">
                    <Info className="h-3.5 w-3.5" />
                    {perLine ? "Line-by-line mode" : MODE_HELP[mode].split(".")[0]}
                  </Chip>
                </div>
              )}
            </SectionCard>
          </div>

          {inspected && (
            <SectionCard
              tone="sky"
              icon={Globe2}
              title="URL inspector"
              description="A live structural breakdown of the input, including decoded query parameters."
              actions={<CopyButton text={inspected.url} tone="sky" label="Copy full URL" />}
            >
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                <ComponentRow label="Protocol" value={inspected.protocol} />
                <ComponentRow label="Host" value={inspected.hostname} />
                <ComponentRow label="Port" value={inspected.port} />
                <ComponentRow label="Path" value={inspected.pathname} />
                <ComponentRow label="Fragment" value={inspected.hash} />
                <ComponentRow label="Origin" value={inspected.origin} />
              </div>

              {inspected.inferredScheme && (
                <Callout tone="sky" variant="info" className="mt-3">
                  No scheme was supplied, so the inspector assumed <strong>https://</strong> while
                  parsing. The original text was not modified.
                </Callout>
              )}

              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    Query parameters{" "}
                    <span className="font-semibold text-slate-400">({inspected.params.length})</span>
                  </h3>
                  <Chip tone="sky">{inspected.isSecure ? "HTTPS" : "Not HTTPS"}</Chip>
                </div>

                {inspected.params.length ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                        <tr>
                          <th className="px-3 py-2.5 font-bold">Key</th>
                          <th className="px-3 py-2.5 font-bold">Value</th>
                          <th className="px-3 py-2.5 font-bold">Encoded form</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {inspected.params.map((param, index) => (
                          <tr key={`${param.key}-${index}`}>
                            <td className="px-3 py-2.5 font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {param.key}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-300">
                              {param.value || <span className="text-slate-400">empty</span>}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-sky-700 dark:text-sky-300">
                              {encodeURIComponent(param.key)}
                              {param.value ? `=${encodeURIComponent(param.value)}` : "="}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Callout tone="sky" variant="info">
                    This URL has no query parameters. Add a <code className="font-mono">?key=value</code>{" "}
                    pair or use the Query Builder tab to create one.
                  </Callout>
                )}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {tab === "builder" && (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          <SectionCard
            tone="sky"
            icon={ListFilter}
            title="Query string builder"
            description="Build a clean, encoded query string from editable key/value rows."
            className="xl:col-span-7"
            actions={
              <ActionButton icon={Plus} variant="primary" tone="sky" onClick={() => setRows((current) => [...current, makeRow()])}>
                Add parameter
              </ActionButton>
            }
          >
            <Field label="Base URL" htmlFor="builder-base" hint="The query string is appended to this URL when you apply it to the codec.">
              <input
                id="builder-base"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                spellCheck={false}
                className={`${fieldClass(false, "sky")} font-mono`}
              />
            </Field>

            <div className="mt-4 space-y-2.5">
              {rows.length === 0 && (
                <Callout tone="sky" variant="info">
                  No parameters yet. Add a row or import the query string from the codec input.
                </Callout>
              )}
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/30 sm:grid-cols-[auto_1fr_1.4fr_auto] sm:items-center"
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={row.enabled !== false}
                      onChange={(event) => updateRow(row.id, { enabled: event.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 accent-sky-600"
                      aria-label={`Include parameter ${row.key || "row"}`}
                    />
                    <span className="sm:hidden">Include</span>
                  </label>
                  <input
                    value={row.key}
                    onChange={(event) => updateRow(row.id, { key: event.target.value })}
                    placeholder="key"
                    aria-label="Parameter key"
                    spellCheck={false}
                    className={`${fieldClass(false, "sky")} font-mono`}
                  />
                  <input
                    value={row.value}
                    onChange={(event) => updateRow(row.id, { value: event.target.value })}
                    placeholder="value"
                    aria-label="Parameter value"
                    spellCheck={false}
                    className={`${fieldClass(false, "sky")} font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                    className="flex h-10 items-center justify-center rounded-xl px-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    aria-label={`Remove parameter ${row.key || "row"}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              <ToggleRow
                tone="sky"
                checked={builderForm}
                onChange={setBuilderForm}
                label="Form encoding"
                description="Spaces become +, like an HTML form."
              />
              <ToggleRow
                tone="sky"
                checked={sortKeys}
                onChange={setSortKeys}
                label="Sort keys"
                description="Alphabetical order for stable signatures."
              />
              <ToggleRow
                tone="sky"
                checked={includeEmpty}
                onChange={setIncludeEmpty}
                label="Keep empty values"
                description="Emit key= for blank rows."
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton icon={Download} onClick={importFromInput}>
                Import from input
              </ActionButton>
              <ActionButton
                icon={RotateCcw}
                variant="ghost"
                onClick={() => {
                  setRows([makeRow(), makeRow(), makeRow()]);
                  toast.success("Builder cleared.");
                }}
              >
                Clear rows
              </ActionButton>
            </div>
          </SectionCard>

          <div className="space-y-6 xl:col-span-5">
            <SectionCard
              tone="sky"
              icon={Link2}
              title="Built query"
              description={`${rows.filter((row) => row.enabled !== false && row.key.trim()).length} active parameter${
                rows.filter((row) => row.enabled !== false && row.key.trim()).length === 1 ? "" : "s"
              }`}
              actions={<CopyButton text={fullBuiltUrl} tone="sky" label="Copy URL" />}
            >
              <textarea
                readOnly
                rows={5}
                value={queryString}
                aria-label="Built query string"
                spellCheck={false}
                onFocus={(event) => event.target.select()}
                className={`${fieldClass(false, "sky")} resize-y bg-slate-50 font-mono leading-relaxed dark:bg-slate-950/50`}
                placeholder="?key=value"
              />
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Full URL</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-800 dark:text-slate-200">
                  {fullBuiltUrl}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ActionButton icon={Wand2} variant="primary" tone="sky" onClick={applyToCodec}>
                  Open in codec
                </ActionButton>
                <CopyButton text={queryString} tone="sky" label="Copy query" />
              </div>
            </SectionCard>

            <SectionCard tone="sky" icon={Info} title="Builder tips">
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <li>• Duplicate keys are preserved and emitted in row order.</li>
                <li>• Keys are trimmed; values are left exactly as entered.</li>
                <li>• Import decodes an existing query string into editable rows.</li>
                <li>• Sorting produces deterministic strings for API signatures.</li>
              </ul>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === "reference" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard tone="sky" icon={CheckCircle2} title="Unreserved characters">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                These never need encoding and can appear raw in any URL component.
              </p>
              <div className="mt-3 rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-emerald-300 dark:bg-slate-950">
                A–Z a–z 0–9 - . _ ~
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Everything else is either reserved (structural) or unsafe (must be escaped).
              </p>
            </SectionCard>

            <SectionCard tone="sky" icon={Table2} title="Encoding rules" className="lg:col-span-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Component</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Escape everything except unreserved characters. Best for one value.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Full URL</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Keep <span className="font-mono">:/?#&amp;=</span> so the URL structure survives.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Form data</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Spaces become <span className="font-mono">+</span>; literal plus becomes{" "}
                    <span className="font-mono">%2B</span>.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">UTF-8</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Non-ASCII becomes multiple <span className="font-mono">%XX</span> bytes — café is{" "}
                    <span className="font-mono">caf%C3%A9</span>.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard tone="sky" icon={BookOpen} title="Reserved & unsafe character reference">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Character</th>
                    <th className="px-3 py-2.5 font-bold">Encoded</th>
                    <th className="px-3 py-2.5 font-bold">Meaning / rule</th>
                    <th className="px-3 py-2.5 font-bold">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {REFERENCE_ROWS.map((row) => (
                    <tr key={row.encoded}>
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                        {row.char}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-semibold text-sky-700 dark:text-sky-300">
                        {row.encoded}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{row.meaning}</td>
                      <td className="px-3 py-2.5">
                        <Chip tone={row.kind === "reserved" ? "sky" : row.kind === "escape" ? "indigo" : "emerald"}>
                          {row.kind}
                        </Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      <FaqAccordion items={URL_FAQS} tone="sky" title="URL encoding questions, answered" />
    </div>
  );
}
