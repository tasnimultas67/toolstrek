"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightLeft,
  Baby,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileJson,
  Footprints,
  Info,
  Plus,
  Printer,
  RotateCcw,
  Ruler,
  Settings2,
  Shirt,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  FaqAccordion,
  Field,
  Hero,
  SectionCard,
  Segmented,
  Stat,
  ToggleRow,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import { downloadText, parseJsonFile, readStored, toNumber, writeStored } from "../_shared/toolkit/toolUtils";
import {
  AUDIENCES,
  GROUPS,
  SIZE_CHARTS,
  SIZE_FAQS,
  SIZE_STORAGE_KEY,
  chartKeyFor,
  createDemoState,
  findByMeasurement,
  findBySystem,
} from "./sizeConverterData";

const TOOL_META = { title: "Shoe & Clothing Size Converter", link: "/tools/shoe-clothing-size-converter", icon: "Ruler" };
const TONE = "sky";

const DEFAULT_STATE = {
  group: "shoes",
  audience: "men",
  mode: "measure",
  unit: "cm",
  measurement: "",
  sizeSystem: "eu",
  sizeValue: "",
  width: "standard",
  fit: "regular",
  allowance: false,
  offset: 0,
  customCharts: {},
};

const WIDTH_OPTIONS = [
  { value: "narrow", label: "Narrow" },
  { value: "standard", label: "Standard" },
  { value: "wide", label: "Wide" },
];

const FIT_OPTIONS = [
  { value: "slim", label: "Slim" },
  { value: "regular", label: "Regular" },
  { value: "relaxed", label: "Relaxed" },
];

const OFFSET_OPTIONS = [
  { value: -1, label: "Size down" },
  { value: 0, label: "True size" },
  { value: 1, label: "Size up" },
];

function cell(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function clampIndex(index, length) {
  return Math.min(length - 1, Math.max(0, index));
}

export default function ShoeClothingSizeConverter() {
  const { addRecentTool } = useRecentTools();
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      const saved = readStored(SIZE_STORAGE_KEY, null);
      if (saved && typeof saved === "object") {
        setState((current) => ({
          ...current,
          ...saved,
          customCharts: saved.customCharts && typeof saved.customCharts === "object" ? saved.customCharts : {},
        }));
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => writeStored(SIZE_STORAGE_KEY, state), 500);
    return () => window.clearTimeout(timer);
  }, [state, hydrated]);

  const chartKey = chartKeyFor(state.group, state.audience);
  const chart = SIZE_CHARTS[chartKey];
  const rows = useMemo(() => {
    const custom = state.customCharts?.[chartKey];
    return Array.isArray(custom) && custom.length ? custom : chart.rows;
  }, [state.customCharts, chartKey, chart]);

  const activeSystem = chart.systems.some((system) => system.key === state.sizeSystem)
    ? state.sizeSystem
    : chart.systems[0].key;

  const update = (patch) => setState((current) => ({ ...current, ...patch }));

  const measurementValue = toNumber(state.measurement, null);
  const ease = state.allowance ? (chart.group === "shoes" ? 0.5 : 2) : 0;
  const fitDelta = chart.group === "clothing" ? (state.fit === "slim" ? -2 : state.fit === "relaxed" ? 4 : 0) : 0;
  const adjustedMeasurement = Number.isFinite(measurementValue)
    ? (state.unit === "in" ? measurementValue * 2.54 : measurementValue) + ease + fitDelta
    : null;

  const result = useMemo(() => {
    if (state.mode === "measure") {
      if (!Number.isFinite(adjustedMeasurement)) return { index: -1, exact: false, valid: false };
      const found = findByMeasurement(rows, chart.anchorKey, adjustedMeasurement);
      return { ...found, valid: Boolean(found.row) };
    }
    if (!String(state.sizeValue).trim()) return { index: -1, exact: false, valid: false };
    const found = findBySystem(rows, activeSystem, state.sizeValue);
    return { ...found, valid: Boolean(found.row) };
  }, [state.mode, state.sizeValue, adjustedMeasurement, rows, chart.anchorKey, activeSystem]);

  const displayIndex = result.valid ? clampIndex(result.index + Number(state.offset || 0), rows.length) : -1;
  const displayRow = displayIndex >= 0 ? rows[displayIndex] : null;
  const isCustomChart = Array.isArray(state.customCharts?.[chartKey]) && state.customCharts[chartKey].length > 0;

  const resultSystems = chart.systems;

  const copySummary = async () => {
    if (!displayRow) {
      toast.error("Add a measurement or a size first.");
      return;
    }
    const lines = [
      `ToolsTrek ${chart.label} conversion`,
      `Reference chart: ${isCustomChart ? "Custom saved chart" : "Standard guide"}`,
      state.mode === "measure"
        ? `Measurement: ${state.measurement} ${state.unit}${ease ? ` (+${ease} cm allowance)` : ""}${fitDelta ? ` (${state.fit} fit ${fitDelta > 0 ? "+" : ""}${fitDelta} cm)` : ""}`
        : `Input: ${chart.systems.find((system) => system.key === activeSystem)?.label} ${state.sizeValue}`,
      "",
      ...resultSystems.map((system) => `${system.label}: ${cell(displayRow[system.key])}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Conversion copied");
    } catch {
      toast.error("Could not copy the summary");
    }
  };

  const exportCsv = () => {
    const columns = chart.fields;
    const csv = [
      columns.map((field) => `"${field.label}"`).join(","),
      ...rows
        .map((row) => columns.map((field) => `"${cell(row[field.key])}"`).join(","))
        .join("\n"),
    ].join("\n");
    downloadText(csv, `toolstrek-${chartKey}-chart.csv`, "text/csv;charset=utf-8");
    toast.success("Size chart exported as CSV");
  };

  const exportChartJson = () => {
    const payload = {
      app: "toolstrek-size-chart",
      version: 1,
      chart: chartKey,
      label: chart.label,
      exportedAt: new Date().toISOString(),
      fields: chart.fields,
      rows: isCustomChart ? state.customCharts[chartKey] : chart.rows,
    };
    downloadText(JSON.stringify(payload, null, 2), `toolstrek-${chartKey}-chart.json`, "application/json");
  };

  const importChartJson = async (file) => {
    const parsed = await parseJsonFile(file);
    const imported = Array.isArray(parsed) ? parsed : parsed?.rows;
    if (!Array.isArray(imported) || !imported.length) {
      toast.error("That file does not contain a size chart.");
      return;
    }
    const normalised = imported.map((row) => {
      const next = {};
      chart.fields.forEach((field) => {
        const raw = row[field.key];
        next[field.key] = field.type === "number" ? (raw === "" || raw === null || raw === undefined ? null : Number(raw)) : String(raw ?? "");
      });
      return next;
    });
    setState((current) => ({
      ...current,
      customCharts: { ...current.customCharts, [chartKey]: normalised },
    }));
    toast.success("Custom chart imported");
  };

  const startEditing = () => {
    setEditorOpen(true);
    if (isCustomChart) return;
    setState((current) => ({
      ...current,
      customCharts: { ...current.customCharts, [chartKey]: chart.rows.map((row) => ({ ...row })) },
    }));
  };

  const updateCustomRow = (index, fieldKey, raw, type) => {
    setState((current) => {
      const source = current.customCharts[chartKey] || chart.rows.map((row) => ({ ...row }));
      const next = source.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, [fieldKey]: type === "number" ? (raw === "" ? null : Number(raw)) : raw }
          : row,
      );
      return { ...current, customCharts: { ...current.customCharts, [chartKey]: next } };
    });
  };

  const addCustomRow = () => {
    setState((current) => {
      const source = current.customCharts[chartKey] || chart.rows.map((row) => ({ ...row }));
      const blank = {};
      chart.fields.forEach((field) => {
        blank[field.key] = field.type === "number" ? null : "";
      });
      return {
        ...current,
        customCharts: { ...current.customCharts, [chartKey]: [...source, blank] },
      };
    });
    toast.success("Blank row added — fill in your brand's sizes");
  };

  const removeCustomRow = (index) => {
    setState((current) => {
      const source = current.customCharts[chartKey] || [];
      const next = source.filter((_, rowIndex) => rowIndex !== index);
      return { ...current, customCharts: { ...current.customCharts, [chartKey]: next } };
    });
  };

  const resetChart = () => {
    if (typeof window !== "undefined" && !window.confirm("Remove your custom chart and restore the standard chart?")) return;
    setState((current) => {
      const next = { ...current.customCharts };
      delete next[chartKey];
      return { ...current, customCharts: next };
    });
    toast.success("Standard chart restored");
  };

  const clearInputs = () => {
    setState((current) => ({
      ...current,
      measurement: "",
      sizeValue: "",
      offset: 0,
      width: "standard",
      fit: "regular",
      allowance: false,
    }));
    toast.success("Inputs cleared");
  };

  const loadDemo = () => {
    const demo = createDemoState(chartKey);
    setState((current) => ({
      ...current,
      ...demo,
      group: chart.group,
      audience: chart.audience,
    }));
    toast.success("Demo measurements loaded — replace them with your own");
  };

  const widthNote =
    chart.group === "shoes"
      ? state.width === "wide"
        ? "A wide fit usually needs a half size up, or a shoe sold in a wide width."
        : state.width === "narrow"
          ? "A narrow fit often sits better a half size down, or in a narrow-width shoe."
          : "Standard width — most brands' regular (D / standard) fitting should work."
      : state.fit === "relaxed"
        ? "Relaxed fit adds ease to the measurement, so the chart may move you up one size."
        : state.fit === "slim"
          ? "Slim fit removes ease, so the chart may move you down one size."
          : "Regular fit keeps the measurement close to the body without extra ease.";

  const nearby = useMemo(() => {
    if (displayIndex < 0) return [];
    return [displayIndex - 1, displayIndex, displayIndex + 1]
      .filter((index) => index >= 0 && index < rows.length)
      .map((index) => ({ index, row: rows[index] }));
  }, [displayIndex, rows]);

  return (
    <div className="space-y-6 pb-10">
      <style>{`
        .size-converter text-xs, .size-converter .text-xs { font-size: 13px !important; }
      `}</style>

      <div className="size-converter space-y-6">
        <Hero
          tone={TONE}
          eyebrow="Shoe & clothing sizing"
          icon={Ruler}
          title="Shoe & Clothing Size Converter"
          description="Convert shoes and clothing between US, UK, EU, AU, BR and JP sizing, or find your size from a measurement. Build your own brand chart, account for fit and width, and export the result — all locally."
          badges={["Blank by default", "Custom brand charts", "Metric & imperial", "No uploads"]}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <SectionCard
              icon={Shirt}
              tone={TONE}
              title="1 · What are you converting?"
              description="Shoes and clothing use different scales, so each category has its own chart."
              actions={
                <Chip tone={TONE}>
                  {chart.label}
                </Chip>
              }
            >
              <div className="space-y-5">
                <Segmented
                  label="Category"
                  tone={TONE}
                  value={state.group}
                  options={GROUPS}
                  onChange={(value) => update({ group: value, sizeValue: "", offset: 0 })}
                  columns={2}
                />
                <Segmented
                  label="Audience"
                  tone={TONE}
                  value={state.audience}
                  options={AUDIENCES.map((item) => ({
                    ...item,
                    icon:
                      item.value === "kids" ? <Baby className="h-4 w-4" /> : item.value === "women" ? <Shirt className="h-4 w-4" /> : <Footprints className="h-4 w-4" />,
                  }))}
                  onChange={(value) => update({ audience: value, sizeValue: "", offset: 0 })}
                  columns={3}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={ArrowRightLeft}
              tone={TONE}
              title="2 · How do you want to convert?"
              description="Use a body or foot measurement for the most reliable result, or translate a size you already wear."
            >
              <div className="space-y-5">
                <Segmented
                  label="Conversion mode"
                  tone={TONE}
                  value={state.mode}
                  options={[
                    { value: "measure", label: "From a measurement" },
                    { value: "size", label: "From a size I wear" },
                  ]}
                  onChange={(value) => update({ mode: value })}
                  columns={2}
                />

                {state.mode === "measure" ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label={`${chart.anchorLabel} (${state.unit})`}
                      hint={
                        chart.group === "shoes"
                          ? "Stand on paper, mark heel and longest toe, then measure the distance."
                          : "Keep the tape level and snug against the body."
                      }
                    >
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          inputMode="decimal"
                          value={state.measurement}
                          onChange={(event) => update({ measurement: event.target.value })}
                          placeholder={chart.group === "shoes" ? "e.g. 26.5" : "e.g. 92"}
                          className={fieldClass(false, TONE)}
                          aria-label={`${chart.anchorLabel} in ${state.unit}`}
                        />
                        <div className="inline-flex shrink-0 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                          {["cm", "in"].map((unit) => (
                            <button
                              key={unit}
                              type="button"
                              onClick={() => update({ unit })}
                              className={`rounded-lg px-3 text-sm font-bold transition ${
                                state.unit === unit
                                  ? "bg-white text-sky-700 shadow-sm dark:bg-slate-700 dark:text-sky-300"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                              aria-pressed={state.unit === unit}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Field>

                    <Field
                      label="Fit preference"
                      hint={chart.group === "shoes" ? "Compensate for your preferred width." : "Adds or removes wearing ease before matching."}
                    >
                      <Segmented
                        tone={TONE}
                        value={chart.group === "shoes" ? state.width : state.fit}
                        options={chart.group === "shoes" ? WIDTH_OPTIONS : FIT_OPTIONS}
                        onChange={(value) => update(chart.group === "shoes" ? { width: value } : { fit: value })}
                        columns={3}
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <ToggleRow
                        tone={TONE}
                        checked={state.allowance}
                        onChange={(checked) => update({ allowance: checked })}
                        label={chart.group === "shoes" ? "Add 0.5 cm toe room" : "Add 2 cm comfort ease"}
                        description={
                          chart.group === "shoes"
                            ? "Recommended for closed shoes, thick socks and growing children."
                            : "Useful for woven fabrics and relaxed silhouettes; skip it for stretch fabrics."
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Size system" hint="Pick the system printed on the label you already own.">
                      <select
                        value={activeSystem}
                        onChange={(event) => update({ sizeSystem: event.target.value })}
                        className={fieldClass(false, TONE)}
                      >
                        {chart.systems.map((system) => (
                          <option key={system.key} value={system.key}>
                            {system.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Size you wear" hint="Ranges such as 8-10 are matched on their first number.">
                      <input
                        type="text"
                        value={state.sizeValue}
                        onChange={(event) => update({ sizeValue: event.target.value })}
                        placeholder={chart.audience === "kids" ? "e.g. 3T" : "e.g. 9.5"}
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Neighbouring size" hint="Charts round differently — compare the size either side.">
                    <Segmented
                      tone={TONE}
                      value={Number(state.offset)}
                      options={OFFSET_OPTIONS}
                      onChange={(value) => update({ offset: value })}
                      columns={3}
                    />
                  </Field>
                  <div className="space-y-3">
                    <Stat
                      tone={TONE}
                      label="Chart used"
                      value={isCustomChart ? "Custom" : "Standard guide"}
                      hint={isCustomChart ? "Saved in this browser" : "Editable below"}
                      icon={isCustomChart ? Settings2 : CheckCircle2}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <ActionButton tone={TONE} variant="primary" icon={Wand2} onClick={loadDemo}>
                    Load demo data
                  </ActionButton>
                  <ActionButton tone={TONE} icon={RotateCcw} onClick={clearInputs}>
                    Clear inputs
                  </ActionButton>
                  <ActionButton tone={TONE} icon={Settings2} onClick={startEditing}>
                    Customize chart
                  </ActionButton>
                  <span className="text-[13px] font-medium text-slate-400">
                    Nothing is pre-filled — demo data is optional.
                  </span>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={Settings2}
              tone={TONE}
              title="Custom brand chart"
              description="Replace the standard guide with the exact chart from your favourite brand. Rows are saved locally and can be imported or exported."
              actions={
                <div className="flex flex-wrap gap-2">
                  <ActionButton tone={TONE} variant="secondary" icon={ChevronDown} onClick={() => (editorOpen ? setEditorOpen(false) : startEditing())}>
                    {editorOpen ? "Hide editor" : "Open editor"}
                  </ActionButton>
                  <ActionButton tone={TONE} icon={Upload} onClick={() => importRef.current?.click()}>
                    Import
                  </ActionButton>
                  <ActionButton tone={TONE} icon={FileJson} onClick={exportChartJson}>
                    Export JSON
                  </ActionButton>
                </div>
              }
            >
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) importChartJson(file);
                  event.target.value = "";
                }}
              />

              {!editorOpen ? (
                <Callout tone={TONE} variant="info">
                  The standard {chart.label.toLowerCase()} chart is active. Open the editor to change any value, add your own
                  rows, or paste a brand chart you trust.
                </Callout>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone={TONE}>{rows.length} rows</Chip>
                    <Chip tone={isCustomChart ? "amber" : "emerald"}>{isCustomChart ? "Custom chart active" : "Standard chart"}</Chip>
                    <span className="text-[13px] font-medium text-slate-400">
                      Changes apply instantly to the converter on this page.
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          {chart.fields.map((field) => (
                            <th key={field.key} className="px-2 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {field.label}
                            </th>
                          ))}
                          <th className="px-2 py-2 text-right text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Row
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {rows.map((row, index) => (
                          <tr key={index} className={index === displayIndex ? "bg-sky-50/70 dark:bg-sky-950/30" : ""}>
                            {chart.fields.map((field) => (
                              <td key={field.key} className="px-1.5 py-1.5">
                                <input
                                  type={field.type === "number" ? "number" : "text"}
                                  step={field.step || "any"}
                                  value={row[field.key] ?? ""}
                                  onChange={(event) => updateCustomRow(index, field.key, event.target.value, field.type)}
                                  aria-label={`${field.label} row ${index + 1}`}
                                  className="w-full min-w-[64px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                              </td>
                            ))}
                            <td className="px-1.5 py-1.5 text-right">
                              <button
                                type="button"
                                onClick={() => removeCustomRow(index)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                                aria-label={`Delete row ${index + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ActionButton tone={TONE} icon={Plus} onClick={addCustomRow}>
                      Add row
                    </ActionButton>
                    <ActionButton tone={TONE} icon={Download} onClick={exportChartJson}>
                      Download chart
                    </ActionButton>
                    <ActionButton tone="rose" variant="danger" icon={RotateCcw} onClick={resetChart} disabled={!isCustomChart}>
                      Restore standard chart
                    </ActionButton>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <SectionCard
                icon={Sparkles}
                tone={TONE}
                title="Your conversion"
                description={
                  state.mode === "measure"
                    ? "Matching your measurement against the active chart."
                    : "Translating the size you already wear."
                }
              >
                {!result.valid ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
                    <Ruler className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No size yet</p>
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                      {state.mode === "measure"
                        ? "Enter a measurement, or load the demo data to see how the converter works."
                        : "Choose a system and enter the size printed on your label."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-600 p-5 text-white shadow-lg shadow-sky-500/20">
                      <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-white/80">
                        {state.offset === 0 ? "Your size" : state.offset > 0 ? "One size up" : "One size down"}
                      </p>
                      <p className="mt-1 text-4xl font-black tracking-tight">
                        {cell(displayRow[chart.systems[0].key])}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white/85">
                        {chart.systems[0].label} · {chart.label}
                      </p>
                      <p className="mt-2 text-[13px] text-white/75">
                        {chart.anchorLabel}: {cell(displayRow[chart.anchorKey])}
                        {Number.isFinite(displayRow[`${chart.anchorKey.replace(/Min$/, "")}Max`])
                          ? `–${displayRow[`${chart.anchorKey.replace(/Min$/, "")}Max`]}`
                          : ""}{" "}
                        {chart.anchorUnit}
                        {state.mode === "measure" ? " (chart range)" : ""}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      {resultSystems.slice(1).map((system) => (
                        <div
                          key={system.key}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40"
                        >
                          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{system.label}</span>
                          <span className="text-sm font-black tabular-nums text-slate-900 dark:text-white">
                            {cell(displayRow[system.key])}
                          </span>
                        </div>
                      ))}
                    </div>

                    {!result.exact && (
                      <Callout tone="amber" variant="warning" title="Closest match">
                        That value sits between two chart rows. The closest size is shown — compare the neighbouring size
                        before ordering.
                      </Callout>
                    )}

                    {state.mode === "measure" && Number.isFinite(adjustedMeasurement) && (
                      <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Matched against <strong>{adjustedMeasurement.toFixed(1)} cm</strong>
                        {ease ? ` (includes ${ease} cm allowance)` : ""}
                        {fitDelta ? ` (includes ${fitDelta > 0 ? "+" : ""}${fitDelta} cm ${state.fit} fit)` : ""}.
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <ActionButton tone={TONE} icon={Copy} onClick={copySummary}>
                        Copy
                      </ActionButton>
                      <ActionButton tone={TONE} icon={Download} onClick={exportCsv}>
                        CSV
                      </ActionButton>
                      <ActionButton tone={TONE} icon={Printer} onClick={() => window.print()}>
                        Print
                      </ActionButton>
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard icon={Info} tone={TONE} title="Nearby sizes" description="Same chart, one step either way.">
                <div className="space-y-2">
                  {nearby.length === 0 ? (
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">Add a measurement to compare neighbouring sizes.</p>
                  ) : (
                    nearby.map((entry) => (
                      <button
                        key={entry.index}
                        type="button"
                        onClick={() => update({ offset: entry.index - result.index })}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${
                          entry.index === displayIndex
                            ? "border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40"
                            : "border-slate-200 hover:border-sky-300 dark:border-slate-700 dark:hover:border-sky-700"
                        }`}
                      >
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {cell(entry.row[chart.systems[0].key])}
                        </span>
                        <span className="text-[13px] text-slate-500 dark:text-slate-400">
                          {chart.anchorLabel} {cell(entry.row[chart.anchorKey])} {chart.anchorUnit}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </SectionCard>

              <SectionCard icon={Shirt} tone={TONE} title="Fit guidance" description="Small adjustments that make a real difference.">
                <div className="space-y-3 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                  <p>{widthNote}</p>
                  <p>
                    {chart.group === "shoes"
                      ? "Measure both feet late in the day, and leave 0.5–1 cm between your longest toe and the shoe's end."
                      : "If you are between sizes, size up for woven or non-stretch fabrics and consider your preferred layering."}
                  </p>
                  <p className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    Brand tolerance can move a size either way. When a shop offers free returns, order both neighbouring
                    sizes and keep the better fit.
                  </p>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>

        <FaqAccordion tone={TONE} items={SIZE_FAQS} title="Shoe & clothing size questions" />
      </div>
    </div>
  );
}
