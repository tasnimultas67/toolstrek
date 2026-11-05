"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Activity,
  Baby,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HeartPulse,
  Milk,
  Plus,
  Ruler,
  RotateCcw,
  Scale,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Utensils,
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
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import {
  clamp,
  copyText,
  downloadText,
  readStored,
  round,
  toNumber,
  uid,
  writeStored,
} from "../_shared/toolkit/toolUtils";
import {
  BABY_FAQS,
  FEEDING_METHODS,
  GROWTH_STORAGE_KEY,
  METRIC_OPTIONS,
  PERCENTILE_BANDS,
  ageInMonths,
  classify,
  correctedAgeMonths,
  createDemoBabyState,
  createEmptyBabyState,
  describeAge,
  feedingPlan,
  formatLength,
  formatWeight,
  lengthUnit,
  metricLabel,
  percentileFor,
  readinessChecklist,
  recommendedFeeds,
  solidsGuidance,
  toCm,
  toDisplayLength,
  toDisplayWeight,
  toKg,
  weightUnit,
  whoAt,
  zScoreFor,
} from "./babyGrowthData";

const TOOL_META = {
  title: "Baby Growth Percentile & Feeding Calculator",
  link: "/tools/baby-growth-feeding-calculator",
  icon: "Baby",
};
const TONE = "emerald";

function convertInput(value, from, to, kind) {
  if (!value || !String(value).trim()) return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  const metric = kind === "weight" ? toKg(number, from) : toCm(number, from);
  const converted = kind === "weight" ? toDisplayWeight(metric, to) : toDisplayLength(metric, to);
  if (converted === null) return "";
  return String(round(converted, kind === "weight" ? 2 : 1));
}

function GrowthChart({ sex, metric, unit, points, live, showBands, showPoints }) {
  const width = 660;
  const height = 340;
  const pad = { left: 58, right: 18, top: 18, bottom: 40 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;

  const curves = PERCENTILE_BANDS.map((band) => ({
    ...band,
    values: Array.from({ length: 25 }, (_, age) => {
      const reference = whoAt(sex, metric, age);
      return { age, value: reference.m + reference.sd * band.z };
    }),
  }));

  const allValues = curves.flatMap((curve) => curve.values.map((point) => point.value));
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const padding = (rawMax - rawMin) * 0.08 || 1;
  const domainMin = rawMin - padding;
  const domainMax = rawMax + padding;

  const x = (age) => pad.left + (clamp(age, 0, 24) / 24) * innerWidth;
  const y = (value) => pad.top + innerHeight - ((value - domainMin) / (domainMax - domainMin)) * innerHeight;

  const toPath = (values) =>
    values.map((point, index) => `${index ? "L" : "M"}${x(point.age).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");

  const bandPath = `${toPath(curves[4].values)} ${curves[0].values
    .slice()
    .reverse()
    .map((point) => `L${x(point.age).toFixed(1)},${y(point.value).toFixed(1)}`)
    .join(" ")} Z`;

  const formatTick = (value) => {
    const display = metric === "weight" ? toDisplayWeight(value, unit) : toDisplayLength(value, unit);
    return display === null ? "" : display.toFixed(metric === "weight" ? 1 : 0);
  };

  const yTicks = Array.from({ length: 5 }, (_, index) => domainMin + ((domainMax - domainMin) / 4) * index);
  const xTicks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
  const markerPoints = points.filter((point) => Number.isFinite(point.ageMonths) && Number.isFinite(point.value));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${metricLabel(metric)} growth chart from birth to 24 months`}
    >
      <rect width={width} height={height} fill="#ffffff" rx="12" />

      {yTicks.map((tick) => (
        <g key={`y-${tick}`}>
          <line x1={pad.left} y1={y(tick)} x2={width - pad.right} y2={y(tick)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#64748b">
            {formatTick(tick)}
          </text>
        </g>
      ))}

      {xTicks.map((tick) => (
        <g key={`x-${tick}`}>
          <line
            x1={x(tick)}
            y1={pad.top}
            x2={x(tick)}
            y2={pad.top + innerHeight}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
          <text x={x(tick)} y={height - 18} textAnchor="middle" fontSize="11" fill="#64748b">
            {tick}
          </text>
        </g>
      ))}
      <text x={pad.left + innerWidth / 2} y={height - 3} textAnchor="middle" fontSize="11" fill="#94a3b8">
        Age (months)
      </text>
      <text x={14} y={pad.top + innerHeight / 2} textAnchor="middle" fontSize="11" fill="#94a3b8" transform={`rotate(-90 14 ${pad.top + innerHeight / 2})`}>
        {metricLabel(metric)} ({metric === "weight" ? weightUnit(unit) : lengthUnit(unit)})
      </text>

      {showBands && <path d={bandPath} fill="#10b981" fillOpacity="0.08" />}

      {curves.map((curve) => (
        <path
          key={curve.label}
          d={toPath(curve.values)}
          fill="none"
          stroke={curve.label === "50th" ? "#059669" : "#34d399"}
          strokeWidth={curve.label === "50th" ? 2.4 : 1.2}
          strokeDasharray={curve.label === "50th" ? "0" : "4 4"}
          strokeOpacity={curve.label === "50th" ? 1 : 0.75}
        >
          <title>{`${curve.label} percentile`}</title>
        </path>
      ))}

      {["3rd", "50th", "97th"].map((label) => {
        const curve = curves.find((item) => item.label === label);
        const last = curve.values[curve.values.length - 1];
        return (
          <text key={label} x={x(24) - 4} y={y(last.value) - 4} textAnchor="end" fontSize="10" fontWeight="700" fill="#059669">
            {label}
          </text>
        );
      })}

      {showPoints &&
        markerPoints.map((point, index) => (
          <circle key={`${point.ageMonths}-${index}`} cx={x(point.ageMonths)} cy={y(point.value)} r="4" fill="#0f766e" stroke="#ffffff" strokeWidth="1.5">
            <title>{`${describeAge(point.ageMonths)} · ${formatTick(point.value)} ${metric === "weight" ? weightUnit(unit) : lengthUnit(unit)}`}</title>
          </circle>
        ))}

      {live && Number.isFinite(live.ageMonths) && Number.isFinite(live.value) && (
        <g>
          <circle cx={x(live.ageMonths)} cy={y(live.value)} r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2">
            <title>{`Current entry · ${describeAge(live.ageMonths)} · ${formatTick(live.value)}`}</title>
          </circle>
        </g>
      )}
    </svg>
  );
}

export default function BabyGrowthFeedingCalculator() {
  const { addRecentTool } = useRecentTools();
  const [state, setState] = useState(() => createEmptyBabyState());
  const [hydrated, setHydrated] = useState(false);
  const jsonRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      const saved = readStored(GROWTH_STORAGE_KEY, null);
      if (saved && typeof saved === "object") {
        const empty = createEmptyBabyState();
        setState({
          ...empty,
          ...saved,
          profile: { ...empty.profile, ...(saved.profile || {}) },
          entry: { ...empty.entry, ...(saved.entry || {}) },
          feeding: { ...empty.feeding, ...(saved.feeding || {}) },
          chart: { ...empty.chart, ...(saved.chart || {}) },
          log: Array.isArray(saved.log)
            ? saved.log
                .filter((item) => item && typeof item === "object")
                .map((item) => ({
                  id: item.id || uid("measure"),
                  date: item.date || "",
                  ageMonths: Number(item.ageMonths) || 0,
                  weightKg: Number.isFinite(Number(item.weightKg)) ? Number(item.weightKg) : null,
                  lengthCm: Number.isFinite(Number(item.lengthCm)) ? Number(item.lengthCm) : null,
                  headCm: Number.isFinite(Number(item.headCm)) ? Number(item.headCm) : null,
                }))
            : [],
        });
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => writeStored(GROWTH_STORAGE_KEY, state), 500);
    return () => window.clearTimeout(timer);
  }, [state, hydrated]);

  const update = (patch) => setState((current) => ({ ...current, ...patch }));
  const updateProfile = (patch) =>
    setState((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
  const updateEntry = (patch) =>
    setState((current) => ({ ...current, entry: { ...current.entry, ...patch } }));
  const updateFeeding = (patch) =>
    setState((current) => ({ ...current, feeding: { ...current.feeding, ...patch } }));
  const updateChart = (patch) =>
    setState((current) => ({ ...current, chart: { ...current.chart, ...patch } }));

  const { profile, entry, feeding, chart, unit, log } = state;
  const sex = profile.sex === "male" ? "male" : "female";

  const chronologicalAge = useMemo(() => {
    if (profile.ageMode === "dob") {
      const fromDob = ageInMonths(profile.dob, profile.measuredOn || undefined);
      return fromDob === null ? null : fromDob;
    }
    return toNumber(profile.ageMonths, null);
  }, [profile.ageMode, profile.dob, profile.measuredOn, profile.ageMonths]);

  const gaWeeks = toNumber(profile.gaWeeks, null);
  const isPreterm = Number.isFinite(gaWeeks) && gaWeeks > 0 && gaWeeks < 37;
  const correctedAge =
    isPreterm && profile.useCorrected ? correctedAgeMonths(chronologicalAge, gaWeeks) : chronologicalAge;
  const effectiveAge = correctedAge;

  const entryAge = useMemo(() => {
    if (profile.ageMode === "dob") {
      const age = ageInMonths(profile.dob, entry.date || profile.measuredOn || undefined);
      if (age === null) return null;
      return isPreterm && profile.useCorrected ? correctedAgeMonths(age, gaWeeks) : age;
    }
    const manual = toNumber(profile.ageMonths, null);
    if (manual === null) return null;
    return isPreterm && profile.useCorrected ? correctedAgeMonths(manual, gaWeeks) : manual;
  }, [profile.ageMode, profile.dob, profile.ageMonths, profile.useCorrected, entry.date, profile.measuredOn, isPreterm, gaWeeks]);

  const entryValues = useMemo(
    () => ({
      weight: toKg(entry.weight, unit),
      length: toCm(entry.length, unit),
      head: toCm(entry.head, unit),
    }),
    [entry.weight, entry.length, entry.head, unit],
  );

  const entryResults = useMemo(() => {
    const validAge = entryAge !== null && entryAge >= 0;
    return METRIC_OPTIONS.map((metric) => {
      const value = entryValues[metric.id];
      const inRange = validAge && entryAge <= 24;
      const z = inRange && Number.isFinite(value) ? zScoreFor(value, sex, metric.id, entryAge) : null;
      const percentile = percentileFor(z);
      return {
        ...metric,
        value,
        inRange,
        z,
        percentile,
        classification: classify(metric.id, z),
      };
    });
  }, [entryValues, entryAge, sex]);

  const sortedLog = useMemo(
    () => [...log].sort((a, b) => (a.ageMonths || 0) - (b.ageMonths || 0)),
    [log],
  );

  const latestLogWeight = useMemo(() => {
    const withWeight = sortedLog.filter((item) => Number.isFinite(item.weightKg));
    return withWeight.length ? withWeight[withWeight.length - 1].weightKg : null;
  }, [sortedLog]);

  const feedingWeightKg = useMemo(() => {
    const direct = toKg(feeding.weight, unit);
    if (Number.isFinite(direct) && direct > 0) return direct;
    if (Number.isFinite(latestLogWeight) && latestLogWeight > 0) return latestLogWeight;
    if (Number.isFinite(entryValues.weight) && entryValues.weight > 0) return entryValues.weight;
    return null;
  }, [feeding.weight, unit, latestLogWeight, entryValues.weight]);

  const plan = useMemo(
    () =>
      feedingPlan({
        weightKg: feedingWeightKg,
        ageMonths: chronologicalAge ?? 0,
        feedsPerDay: feeding.feedsPerDay || "", 
        mlPerKg: feeding.mlPerKg,
        scoopMl: feeding.scoopMl,
        kcalPer100: feeding.kcalPer100,
        startTime: feeding.startTime,
        nightFeeds: feeding.nightFeeds,
      }),
    [feedingWeightKg, chronologicalAge, feeding.feedsPerDay, feeding.mlPerKg, feeding.scoopMl, feeding.kcalPer100, feeding.startTime, feeding.nightFeeds],
  );

  const solids = useMemo(() => solidsGuidance(chronologicalAge ?? 0), [chronologicalAge]);

  const chartPoints = useMemo(
    () =>
      sortedLog
        .filter((item) => item.ageMonths <= 24)
        .map((item) => ({
          ageMonths: item.ageMonths,
          value:
            chart.metric === "weight"
              ? item.weightKg
              : chart.metric === "length"
                ? item.lengthCm
                : item.headCm,
        }))
        .filter((item) => Number.isFinite(item.value)),
    [sortedLog, chart.metric],
  );

  const livePoint = useMemo(
    () => ({
      ageMonths: entryAge,
      value: entryValues[chart.metric],
    }),
    [entryAge, entryValues, chart.metric],
  );

  const trend = useMemo(() => {
    const withWeight = sortedLog.filter(
      (item) => Number.isFinite(item.weightKg) && Number.isFinite(item.ageMonths),
    );
    if (withWeight.length < 2) return null;
    const first = withWeight[0];
    const last = withWeight[withWeight.length - 1];
    const delta = last.weightKg - first.weightKg;
    const start = new Date(`${first.date}T00:00:00`).getTime();
    const end = new Date(`${last.date}T00:00:00`).getTime();
    const days = Number.isFinite(start) && Number.isFinite(end) && end > start
      ? (end - start) / (1000 * 60 * 60 * 24)
      : Math.max(1, (last.ageMonths - first.ageMonths) * 30.4375);
    const gramsPerDay = days > 0 ? (delta * 1000) / days : null;
    const firstZ = zScoreFor(first.weightKg, sex, "weight", isPreterm && profile.useCorrected ? correctedAgeMonths(first.ageMonths, gaWeeks) : first.ageMonths);
    const lastZ = zScoreFor(last.weightKg, sex, "weight", isPreterm && profile.useCorrected ? correctedAgeMonths(last.ageMonths, gaWeeks) : last.ageMonths);
    return {
      delta,
      gramsPerDay,
      days,
      firstZ,
      lastZ,
      shift: firstZ !== null && lastZ !== null ? lastZ - firstZ : null,
    };
  }, [sortedLog, sex, isPreterm, profile.useCorrected, gaWeeks]);

  const handleUnitChange = (nextUnit) => {
    if (nextUnit === unit) return;
    setState((current) => ({
      ...current,
      unit: nextUnit,
      entry: {
        ...current.entry,
        weight: convertInput(current.entry.weight, current.unit, nextUnit, "weight"),
        length: convertInput(current.entry.length, current.unit, nextUnit, "length"),
        head: convertInput(current.entry.head, current.unit, nextUnit, "head"),
      },
      feeding: {
        ...current.feeding,
        weight: convertInput(current.feeding.weight, current.unit, nextUnit, "weight"),
      },
      profile: {
        ...current.profile,
        birthWeight: convertInput(current.profile.birthWeight, current.unit, nextUnit, "weight"),
        birthLength: convertInput(current.profile.birthLength, current.unit, nextUnit, "length"),
      },
    }));
  };

  const saveMeasurement = () => {
    if (entryAge === null || entryAge < 0 || entryAge > 24) {
      toast.error("Add a date of birth (or an age under 24 months) before saving.");
      return;
    }
    const weightKg = toKg(entry.weight, unit);
    const lengthCm = toCm(entry.length, unit);
    const headCm = toCm(entry.head, unit);
    if (![weightKg, lengthCm, headCm].some((value) => Number.isFinite(value) && value > 0)) {
      toast.error("Enter at least one measurement to save.");
      return;
    }
    const measurement = {
      id: uid("measure"),
      date: entry.date || todayISO(),
      ageMonths: round(entryAge, 2),
      weightKg: Number.isFinite(weightKg) && weightKg > 0 ? weightKg : null,
      lengthCm: Number.isFinite(lengthCm) && lengthCm > 0 ? lengthCm : null,
      headCm: Number.isFinite(headCm) && headCm > 0 ? headCm : null,
    };
    setState((current) => ({
      ...current,
      log: [...current.log, measurement].sort((a, b) => a.ageMonths - b.ageMonths),
      feeding: current.feeding.weight
        ? current.feeding
        : { ...current.feeding, weight: toDisplayWeight(weightKg, current.unit) !== null ? String(round(toDisplayWeight(weightKg, current.unit), 2)) : "" },
    }));
    toast.success("Measurement added to the growth log");
  };

  const removeMeasurement = (id) =>
    setState((current) => ({ ...current, log: current.log.filter((item) => item.id !== id) }));

  const useLatestWeight = () => {
    if (!Number.isFinite(feedingWeightKg)) {
      toast.error("Add a weight first — from a measurement or the feeding field.");
      return;
    }
    const display = toDisplayWeight(feedingWeightKg, unit);
    updateFeeding({ weight: display === null ? "" : String(round(display, 2)) });
    toast.success("Feeding volume now uses the latest weight");
  };

  const loadDemo = () => {
    setState(createDemoBabyState());
    toast.success("Demo baby loaded — replace every field with your own data");
  };

  const clearAll = () => {
    setState(createEmptyBabyState());
    toast.success("All baby data cleared");
  };

  const summaryLines = () => {
    const lines = ["Baby growth & feeding summary", ""];
    if (profile.name) lines.push(`Name: ${profile.name}`);
    lines.push(`Age: ${describeAge(chronologicalAge)}${isPreterm ? ` (corrected ${describeAge(correctedAge)})` : ""}`);
    lines.push(`Sex: ${sex === "male" ? "Boy" : "Girl"}`);
    lines.push("");
    lines.push("Latest measurements:");
    entryResults.forEach((result) => {
      if (Number.isFinite(result.value) && result.percentile !== null) {
        lines.push(
          `${result.label}: ${result.id === "weight" ? formatWeight(result.value, unit) : formatLength(result.value, unit)} · ${result.percentile.toFixed(0)}th percentile · ${result.classification?.label || "—"}`,
        );
      }
    });
    lines.push("");
    lines.push("Feeding estimate:");
    lines.push(`Daily milk volume: ${plan.dailyMl ? `${Math.round(plan.dailyMl)} ml` : "Add a weight"}`);
    lines.push(`Feeds per day: ${plan.feeds}`);
    lines.push(`Per feed: ${plan.perFeed ? `${Math.round(plan.perFeed)} ml` : "—"}`);
    lines.push(`Formula scoops per feed: ${plan.scoops ? plan.scoops.toFixed(1) : "—"}`);
    lines.push(`Solids: ${plan.solids.meals} — ${plan.solids.stage}`);
    if (feeding.showSchedule) lines.push(`Suggested times: ${plan.schedule.join(", ")}`);
    lines.push("");
    lines.push("Educational estimate only. Always follow your clinician's advice.");
    return lines;
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 16;
    let cursor = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("ToolsTrek — Baby growth & feeding summary", margin, cursor);
    cursor += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated ${new Date().toLocaleDateString()} · toolstrek.vercel.app`, margin, cursor);
    cursor += 8;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    summaryLines().forEach((line) => {
      if (cursor > 278) {
        doc.addPage();
        cursor = 20;
      }
      const wrapped = doc.splitTextToSize(line || " ", 178);
      wrapped.forEach((part) => {
        if (cursor > 278) {
          doc.addPage();
          cursor = 20;
        }
        doc.text(part, margin, cursor);
        cursor += 5.4;
      });
      if (!line) cursor += 1;
    });
    doc.save("toolstrek-baby-growth-feeding.pdf");
    toast.success("PDF summary downloaded");
  };

  const exportCsv = () => {
    if (!sortedLog.length) {
      toast.error("Add a measurement before exporting the growth log.");
      return;
    }
    const header = ["Date", "Age (months)", "Weight (kg)", "Length (cm)", "Head (cm)"];
    const rows = sortedLog.map((item) => [
      item.date,
      item.ageMonths.toFixed(2),
      item.weightKg !== null ? item.weightKg.toFixed(3) : "",
      item.lengthCm !== null ? item.lengthCm.toFixed(2) : "",
      item.headCm !== null ? item.headCm.toFixed(2) : "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    downloadText(csv, "toolstrek-baby-growth-log.csv", "text/csv;charset=utf-8");
    toast.success("Growth log exported as CSV");
  };

  const exportJson = () => {
    downloadText(
      JSON.stringify({ app: "toolstrek-baby-growth", version: 1, exportedAt: new Date().toISOString(), state }, null, 2),
      "toolstrek-baby-growth.json",
      "application/json",
    );
    toast.success("Project exported as JSON");
  };

  const importJson = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        const imported = parsed?.state || parsed;
        if (!imported || typeof imported !== "object") throw new Error("invalid");
        const empty = createEmptyBabyState();
        setState({
          ...empty,
          ...imported,
          profile: { ...empty.profile, ...(imported.profile || {}) },
          entry: { ...empty.entry, ...(imported.entry || {}) },
          feeding: { ...empty.feeding, ...(imported.feeding || {}) },
          chart: { ...empty.chart, ...(imported.chart || {}) },
          log: Array.isArray(imported.log) ? imported.log : [],
        });
        toast.success("Baby project imported");
      } catch {
        toast.error("That file is not a ToolsTrek baby project.");
      }
    };
    reader.onerror = () => toast.error("Could not read that file.");
    reader.readAsText(file);
  };

  const copySummary = async () => {
    const ok = await copyText(summaryLines().join("\n"));
    if (ok) toast.success("Summary copied");
    else toast.error("Could not copy the summary");
  };

  const ageText = describeAge(chronologicalAge);
  const correctedText = describeAge(correctedAge);
  const inRangeAge = chronologicalAge !== null && chronologicalAge <= 24;

  return (
    <div className="baby-growth space-y-6 pb-10">
      <style>{`.baby-growth .text-xs { font-size: 13px !important; }`}</style>

      <Hero
        tone={TONE}
        eyebrow="Growth & feeding tracker"
        icon={Baby}
        title="Baby Growth Percentile & Feeding Calculator"
        description="Track weight, length and head circumference against WHO-aligned references, see z-scores and percentiles on a growth chart, and turn your baby's weight into a practical milk and feeding plan. Everything stays in your browser."
        badges={["Blank by default", "Corrected age", "Growth chart", "Feeding schedule"]}
      />

      <Segmented
        tone={TONE}
        value={state.view}
        options={[
          { value: "growth", label: "Growth & percentiles" },
          { value: "feeding", label: "Feeding planner" },
        ]}
        onChange={(value) => update({ view: value })}
        columns={2}
        className="max-w-lg"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <SectionCard
            icon={Baby}
            tone={TONE}
            title="1 · Baby profile"
            description="Everything is optional until you calculate. Nothing is uploaded or shared."
            actions={
              <div className="flex flex-wrap gap-2">
                <Chip tone={TONE}>{sex === "male" ? "Boy" : "Girl"}</Chip>
                <Chip tone={TONE}>{ageText}</Chip>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Baby's name or nickname" hint="Optional — used only in exports and the summary.">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(event) => updateProfile({ name: event.target.value })}
                    placeholder="e.g. Aria"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Sex</span>
                  <Segmented
                    tone={TONE}
                    value={profile.sex}
                    options={[
                      { value: "female", label: "Girl" },
                      { value: "male", label: "Boy" },
                    ]}
                    onChange={(value) => updateProfile({ sex: value })}
                    columns={2}
                  />
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Age source</span>
                <Segmented
                  tone={TONE}
                  value={profile.ageMode}
                  options={[
                    { value: "dob", label: "Date of birth" },
                    { value: "manual", label: "Age in months" },
                  ]}
                  onChange={(value) => updateProfile({ ageMode: value })}
                  columns={2}
                />
              </div>

              {profile.ageMode === "dob" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Date of birth">
                    <input
                      type="date"
                      value={profile.dob}
                      max={todayISO()}
                      onChange={(event) => updateProfile({ dob: event.target.value })}
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                  <Field label="Measurement date" hint="Age is calculated at this date.">
                    <input
                      type="date"
                      value={profile.measuredOn}
                      max={todayISO()}
                      onChange={(event) => updateProfile({ measuredOn: event.target.value })}
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Age (months)" hint="Use decimals for part months, e.g. 7.5.">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.1"
                      value={profile.ageMonths}
                      onChange={(event) => updateProfile({ ageMonths: event.target.value })}
                      placeholder="e.g. 7.5"
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                  <Field label="Measurement date" hint="Used for the log and exports.">
                    <input
                      type="date"
                      value={profile.measuredOn}
                      max={todayISO()}
                      onChange={(event) => updateProfile({ measuredOn: event.target.value })}
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Gestational age at birth" hint="Weeks, if known.">
                  <input
                    type="number"
                    min="22"
                    max="42"
                    step="1"
                    value={profile.gaWeeks}
                    onChange={(event) => updateProfile({ gaWeeks: event.target.value })}
                    placeholder="e.g. 39"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label={`Birth weight (${weightUnit(unit)})`}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={profile.birthWeight}
                    onChange={(event) => updateProfile({ birthWeight: event.target.value })}
                    placeholder={unit === "imperial" ? "e.g. 6.8" : "e.g. 3.1"}
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label={`Birth length (${lengthUnit(unit)})`}>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={profile.birthLength}
                    onChange={(event) => updateProfile({ birthLength: event.target.value })}
                    placeholder={unit === "imperial" ? "e.g. 19.5" : "e.g. 49.5"}
                    className={fieldClass(false, TONE)}
                  />
                </Field>
              </div>

              <Segmented
                label="Units"
                tone={TONE}
                value={unit}
                options={[
                  { value: "metric", label: "kg / cm" },
                  { value: "imperial", label: "lb / in" },
                ]}
                onChange={handleUnitChange}
                columns={2}
              />

              {isPreterm && (
                <ToggleRow
                  tone={TONE}
                  checked={profile.useCorrected}
                  onChange={(checked) => updateProfile({ useCorrected: checked })}
                  label="Use corrected age"
                  description={`Born at ${gaWeeks} weeks. Corrected age is ${correctedText} instead of ${ageText}. Many clinicians use this until about 24 months.`}
                />
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <ActionButton tone={TONE} variant="primary" icon={Wand2} onClick={loadDemo}>
                  Load demo data
                </ActionButton>
                <ActionButton tone={TONE} icon={RotateCcw} onClick={clearAll}>
                  Clear all
                </ActionButton>
                <ActionButton tone={TONE} icon={FileText} onClick={exportJson}>
                  Export project
                </ActionButton>
                <ActionButton tone={TONE} icon={Plus} onClick={() => jsonRef.current?.click()}>
                  Import project
                </ActionButton>
                <input
                  ref={jsonRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) importJson(file);
                    event.target.value = "";
                  }}
                />
                <span className="text-[13px] font-medium text-slate-400">Nothing is pre-filled by default.</span>
              </div>
            </div>
          </SectionCard>

          {state.view === "growth" && (
            <>
              <SectionCard
                icon={Scale}
                tone={TONE}
                title="2 · Current measurements"
                description="Enter the latest measurements in your chosen units. Percentiles update as you type."
                actions={<Chip tone={TONE}>{entryAge === null ? "Age needed" : describeAge(entryAge)}</Chip>}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label={`Weight (${weightUnit(unit)})`}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.weight}
                        onChange={(event) => updateEntry({ weight: event.target.value })}
                        placeholder={unit === "imperial" ? "e.g. 17.4" : "e.g. 7.9"}
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label={`Length / height (${lengthUnit(unit)})`}>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={entry.length}
                        onChange={(event) => updateEntry({ length: event.target.value })}
                        placeholder={unit === "imperial" ? "e.g. 26.9" : "e.g. 68.4"}
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label={`Head circumference (${lengthUnit(unit)})`}>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={entry.head}
                        onChange={(event) => updateEntry({ head: event.target.value })}
                        placeholder={unit === "imperial" ? "e.g. 17.0" : "e.g. 43.2"}
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Measurement date" hint="Saved with the log entry.">
                      <input
                        type="date"
                        value={entry.date}
                        max={todayISO()}
                        onChange={(event) => updateEntry({ date: event.target.value })}
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <div className="flex items-end">
                      <ActionButton tone={TONE} variant="primary" icon={Plus} onClick={saveMeasurement} className="w-full">
                        Add to growth log
                      </ActionButton>
                    </div>
                  </div>

                  <Callout tone={TONE} variant="info" title="Measuring tips">
                    Weigh without clothes and at the same time of day. Measure length lying down under 2 years, and
                    keep the tape snug but not tight for head circumference. One measurement is a snapshot — the trend
                    across visits is what matters.
                  </Callout>
                </div>
              </SectionCard>

              <SectionCard
                icon={TrendingUp}
                tone={TONE}
                title="3 · Growth log"
                description="Saved entries feed the chart and the trend summary. Only the latest 24 months are charted."
                actions={<Chip tone={TONE}>{sortedLog.length} measurements</Chip>}
              >
                {sortedLog.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
                    <TrendingUp className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No measurements saved yet</p>
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                      Add the latest measurement, or load the demo to see a full chart and history.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-[13px] uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                          <th className="py-2 pr-2 font-bold">Date</th>
                          <th className="py-2 pr-2 font-bold">Age</th>
                          <th className="py-2 pr-2 font-bold">Weight</th>
                          <th className="py-2 pr-2 font-bold">Length</th>
                          <th className="py-2 pr-2 font-bold">Head</th>
                          <th className="py-2 text-right font-bold"> </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedLog.map((item) => {
                          const ageForZ = isPreterm && profile.useCorrected ? correctedAgeMonths(item.ageMonths, gaWeeks) : item.ageMonths;
                          const z = Number.isFinite(item.weightKg) ? zScoreFor(item.weightKg, sex, "weight", ageForZ) : null;
                          const pct = percentileFor(z);
                          return (
                            <tr key={item.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                              <td className="py-2.5 pr-2 font-medium text-slate-700 dark:text-slate-200">{item.date || "—"}</td>
                              <td className="py-2.5 pr-2 text-slate-500 dark:text-slate-400">{describeAge(item.ageMonths)}</td>
                              <td className="py-2.5 pr-2 font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                                {item.weightKg !== null ? formatWeight(item.weightKg, unit) : "—"}
                                {pct !== null && (
                                  <span className="ml-1.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[13px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                    {pct.toFixed(0)}th
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 pr-2 tabular-nums text-slate-600 dark:text-slate-300">
                                {item.lengthCm !== null ? formatLength(item.lengthCm, unit) : "—"}
                              </td>
                              <td className="py-2.5 pr-2 tabular-nums text-slate-600 dark:text-slate-300">
                                {item.headCm !== null ? formatLength(item.headCm, unit) : "—"}
                              </td>
                              <td className="py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeMeasurement(item.id)}
                                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                                  aria-label={`Delete measurement from ${item.date || describeAge(item.ageMonths)}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {state.view === "feeding" && (
            <>
              <SectionCard
                icon={Milk}
                tone={TONE}
                title="2 · Feeding inputs"
                description="Adjust the volume guide, feed count and schedule to match your routine. Breastfed babies feed on demand — this is an estimate, not a target."
                actions={<Chip tone={TONE}>{feeding.method}</Chip>}
              >
                <div className="space-y-4">
                  <Segmented
                    label="Feeding method"
                    tone={TONE}
                    value={feeding.method}
                    options={FEEDING_METHODS}
                    onChange={(value) => updateFeeding({ method: value })}
                    columns={3}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label={`Weight for the estimate (${weightUnit(unit)})`} hint="Leave blank to use the latest log weight.">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={feeding.weight}
                        onChange={(event) => updateFeeding({ weight: event.target.value })}
                        placeholder={unit === "imperial" ? "e.g. 17.4" : "e.g. 7.9"}
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label="Feeds per day" hint={`Suggested for this age: ${plan.feeds}`}>
                      <input
                        type="number"
                        min="1"
                        max="16"
                        step="1"
                        value={feeding.feedsPerDay}
                        onChange={(event) => updateFeeding({ feedsPerDay: event.target.value })}
                        placeholder={String(recommendedFeeds(chronologicalAge ?? 0))}
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label="First feed time">
                      <input
                        type="time"
                        value={feeding.startTime}
                        onChange={(event) => updateFeeding({ startTime: event.target.value })}
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                  </div>

                  <SliderRow
                    label="Daily volume guide"
                    value={toNumber(feeding.mlPerKg, 150) || 150}
                    min={100}
                    max={220}
                    step={5}
                    tone={TONE}
                    onChange={(value) => updateFeeding({ mlPerKg: String(value) })}
                    format={(value) => `${value} ml/kg/day`}
                    hint="About 150 ml/kg/day is a common guide for healthy babies. Follow your clinician's plan for preterm, growth-restricted or unwell babies."
                    onReset={() => updateFeeding({ mlPerKg: "150" })}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ToggleRow
                      tone={TONE}
                      checked={feeding.nightFeeds}
                      onChange={(checked) => updateFeeding({ nightFeeds: checked })}
                      label="Include night feeds"
                      description="When off, feeds are spread across a 14-hour daytime window."
                    />
                    <ToggleRow
                      tone={TONE}
                      checked={feeding.showSchedule}
                      onChange={(checked) => updateFeeding({ showSchedule: checked })}
                      label="Show suggested feed times"
                      description="A simple evenly spaced routine you can adapt."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Formula scoop size (ml water)" hint="Check the tin — most scoops make 30 ml.">
                      <input
                        type="number"
                        min="15"
                        max="60"
                        step="1"
                        value={feeding.scoopMl}
                        onChange={(event) => updateFeeding({ scoopMl: event.target.value })}
                        placeholder="30"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label="Energy per 100 ml (kcal)" hint="Most standard formulas are 66–68 kcal/100 ml.">
                      <input
                        type="number"
                        min="40"
                        max="120"
                        step="1"
                        value={feeding.kcalPer100}
                        onChange={(event) => updateFeeding({ kcalPer100: event.target.value })}
                        placeholder="67"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <ActionButton tone={TONE} icon={Scale} onClick={useLatestWeight}>
                      Use latest measured weight
                    </ActionButton>
                    <ActionButton
                      tone={TONE}
                      icon={Utensils}
                      onClick={() => {
                        updateFeeding({ feedsPerDay: String(recommendedFeeds(chronologicalAge ?? 0)) });
                        toast.success("Feed count set to the age-based suggestion");
                      }}
                    >
                      Use suggested feed count
                    </ActionButton>
                  </div>

                  <Callout tone="amber" variant="warning" title="Safe formula preparation">
                    Always follow the tin: add powder to water, never the reverse, and never add extra powder. Use cooled
                    boiled water for babies under 6 months, discard unfinished bottles, and do not prop bottles.
                  </Callout>
                </div>
              </SectionCard>

              <SectionCard
                icon={Utensils}
                tone={TONE}
                title="3 · Solids readiness"
                description="A checklist and age-based guide. Milk remains the main source of nutrition through the first year."
                actions={<Chip tone={TONE}>{solids.stage}</Chip>}
              >
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{solids.meals}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-emerald-800/90 dark:text-emerald-200/90">{solids.detail}</p>
                  </div>
                  <ul className="space-y-2">
                    {readinessChecklist().map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Callout tone={TONE} variant="tip" title="Allergens">
                    Introduce common allergens such as egg, peanut, dairy and wheat one at a time, in age-appropriate
                    textures, and keep offering them regularly. Ask your clinician first if your baby has severe eczema
                    or a known allergy.
                  </Callout>
                </div>
              </SectionCard>
            </>
          )}
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-24">
            {state.view === "growth" ? (
              <>
                <SectionCard
                  icon={HeartPulse}
                  tone={TONE}
                  title="Live percentiles"
                  description={entryAge === null ? "Add a date of birth or an age to calculate." : `Calculated at ${describeAge(entryAge)}${isPreterm && profile.useCorrected ? " (corrected)" : ""}.`}
                  actions={<Chip tone={TONE}>{sex === "male" ? "WHO boys" : "WHO girls"}</Chip>}
                >
                  <div className="space-y-3">
                    {entryResults.map((result) => (
                      <div key={result.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                            {result.id === "weight" ? <Scale className="h-4 w-4" /> : result.id === "length" ? <Ruler className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                            {result.label}
                          </span>
                          {result.classification ? (
                            <Chip tone={result.classification.tone}>{result.classification.label}</Chip>
                          ) : (
                            <Chip tone="slate">No value</Chip>
                          )}
                        </div>
                        <div className="mt-2 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-2xl font-black leading-none tabular-nums text-slate-900 dark:text-white">
                              {result.percentile !== null ? `${result.percentile.toFixed(0)}th` : "—"}
                            </p>
                            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                              {result.z !== null ? `z-score ${result.z.toFixed(2)}` : "Add a measurement"}
                            </p>
                          </div>
                          <p className="text-right text-[13px] font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                            {Number.isFinite(result.value)
                              ? result.id === "weight"
                                ? formatWeight(result.value, unit)
                                : formatLength(result.value, unit)
                              : "—"}
                          </p>
                        </div>
                        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                            style={{ width: `${result.percentile === null ? 0 : clamp(result.percentile, 1, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {!inRangeAge && chronologicalAge !== null && (
                    <p className="mt-3 text-[13px] font-semibold text-amber-600 dark:text-amber-400">
                      The reference tables cover 0–24 months. Older ages are outside this tool&apos;s range.
                    </p>
                  )}
                </SectionCard>

                <SectionCard
                  icon={TrendingUp}
                  tone={TONE}
                  title="Growth chart"
                  description="Shaded band is the 3rd–97th percentile range. The amber dot is the current entry."
                  actions={
                    <Chip tone={TONE}>{describeAge(entryAge)}</Chip>
                  }
                >
                  <div className="rounded-2xl border border-slate-200 p-2 dark:border-slate-800">
                    <GrowthChart
                      sex={sex}
                      metric={chart.metric}
                      unit={unit}
                      points={chartPoints}
                      live={livePoint}
                      showBands={chart.showBands}
                      showPoints={chart.showPoints}
                    />
                  </div>
                  <div className="mt-3">
                    <Segmented
                      tone={TONE}
                      value={chart.metric}
                      options={METRIC_OPTIONS.map((metric) => ({ value: metric.id, label: metric.label }))}
                      onChange={(value) => updateChart({ metric: value })}
                      columns={3}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateChart({ showBands: !chart.showBands })}
                      aria-pressed={chart.showBands}
                      className={`rounded-full border px-3 py-1.5 text-sm font-bold transition ${
                        chart.showBands
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                      }`}
                    >
                      3rd–97th band
                    </button>
                    <button
                      type="button"
                      onClick={() => updateChart({ showPoints: !chart.showPoints })}
                      aria-pressed={chart.showPoints}
                      className={`rounded-full border px-3 py-1.5 text-sm font-bold transition ${
                        chart.showPoints
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                      }`}
                    >
                      Logged points
                    </button>
                  </div>
                </SectionCard>

                <SectionCard icon={TrendingUp} tone={TONE} title="Trend check">
                  {trend ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Stat tone={TONE} label="Weight change" value={`${trend.delta >= 0 ? "+" : ""}${formatWeight(trend.delta, unit)}`} hint={`Over ${trend.days.toFixed(0)} days`} />
                        <Stat tone={TONE} label="Average gain" value={trend.gramsPerDay !== null ? `${trend.gramsPerDay.toFixed(0)} g/day` : "—"} hint="Between first and last" />
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {trend.shift === null
                          ? "Add weights at two ages to compare percentile positions."
                          : Math.abs(trend.shift) > 1
                            ? `The weight percentile moved by ${trend.shift > 0 ? "+" : ""}${trend.shift.toFixed(1)} z-scores since the first entry. Crossing more than one band is worth mentioning at the next visit.`
                            : "The weight percentile has stayed broadly stable between the first and latest entries, which is usually a reassuring pattern."}
                      </p>
                      <Callout tone="amber" variant="warning" title="When to ask for help">
                        Seek advice if a baby loses weight, crosses two percentile lines downward, feeds poorly, or has
                        fewer wet nappies. This tool cannot detect or rule out a health problem.
                      </Callout>
                    </div>
                  ) : (
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Save two or more weight measurements to see the average gain and whether the percentile position
                      is stable.
                    </p>
                  )}
                </SectionCard>
              </>
            ) : (
              <>
                <SectionCard
                  icon={Milk}
                  tone={TONE}
                  title="Feeding estimate"
                  description={Number.isFinite(feedingWeightKg) ? `Based on ${formatWeight(feedingWeightKg, unit)} and ${plan.mlPerKg} ml/kg/day.` : "Add a weight to calculate volumes."}
                  actions={<Chip tone={TONE}>{plan.feeds} feeds</Chip>}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Stat
                      tone={TONE}
                      label="Daily milk"
                      value={plan.dailyMl ? `${Math.round(plan.dailyMl)} ml` : "—"}
                      hint={`${plan.mlPerKg} ml/kg/day`}
                    />
                    <Stat
                      tone={TONE}
                      label="Per feed"
                      value={plan.perFeed ? `${Math.round(plan.perFeed)} ml` : "—"}
                      hint={`${plan.feeds} feeds per day`}
                    />
                    <Stat
                      tone={TONE}
                      label="Water per bottle"
                      value={plan.waterPerFeed ? `${plan.waterPerFeed} ml` : "—"}
                      hint="Rounded to 5 ml"
                    />
                    <Stat
                      tone={TONE}
                      label="Formula powder"
                      value={plan.scoops ? `${plan.scoops.toFixed(1)} scoops` : "—"}
                      hint={`${feeding.scoopMl || 30} ml scoop`}
                    />
                    <Stat
                      tone={TONE}
                      label="Energy per feed"
                      value={plan.kcalPerFeed ? `${Math.round(plan.kcalPerFeed)} kcal` : "—"}
                      hint={`${feeding.kcalPer100 || 67} kcal/100 ml`}
                    />
                    <Stat
                      tone={TONE}
                      label="Feed interval"
                      value={`${plan.intervalHours.toFixed(1)} h`}
                      hint={feeding.nightFeeds ? "Around the clock" : "14-hour window"}
                    />
                  </div>
                  {!Number.isFinite(feedingWeightKg) && (
                    <p className="mt-3 text-[13px] font-semibold text-amber-600 dark:text-amber-400">
                      No weight available. Add one above, save a measurement, or load the demo.
                    </p>
                  )}
                </SectionCard>

                {feeding.showSchedule && (
                  <SectionCard
                    icon={Clock}
                    tone={TONE}
                    title="Suggested feed times"
                    description={`${plan.feeds} feeds starting at ${feeding.startTime || "07:00"}, ${feeding.nightFeeds ? "including nights" : "daytime only"}. Shift times to suit your baby.`}
                    actions={<Chip tone={TONE}>{plan.intervalHours.toFixed(1)} h apart</Chip>}
                  >
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {plan.schedule.map((time, index) => (
                        <div
                          key={`${time}-${index}`}
                          className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-2 text-center dark:border-slate-800 dark:bg-slate-800/30"
                        >
                          <p className="text-[13px] font-semibold text-slate-400">Feed {index + 1}</p>
                          <p className="text-base font-black tabular-nums text-slate-800 dark:text-slate-100">{time}</p>
                          <p className="text-[13px] text-slate-500 dark:text-slate-400">
                            {plan.perFeed ? `${Math.round(plan.perFeed)} ml` : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Responsive feeding beats a rigid clock: watch for early hunger cues such as rooting, hand-to-mouth
                      movements and smacking lips. Never force a baby to finish a bottle.
                    </p>
                  </SectionCard>
                )}

                <SectionCard icon={Utensils} tone={TONE} title="Solids at this age" actions={<Chip tone={TONE}>{solids.stage}</Chip>}>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{solids.meals}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{solids.detail}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Offer water in an open cup with meals from 6 months. Avoid honey before 12 months, added salt and
                    sugar, and whole nuts for under-fives.
                  </p>
                </SectionCard>
              </>
            )}

            <SectionCard icon={Download} tone={TONE} title="Export & share">
              <div className="flex flex-wrap gap-2">
                <ActionButton tone={TONE} variant="primary" icon={Download} onClick={exportPdf}>
                  PDF summary
                </ActionButton>
                <ActionButton tone={TONE} icon={FileText} onClick={exportCsv}>
                  CSV log
                </ActionButton>
                <ActionButton tone={TONE} icon={FileText} onClick={copySummary}>
                  Copy summary
                </ActionButton>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                The PDF includes the profile, latest percentiles, feeding estimate and schedule. The CSV contains the
                full growth log in metric units for sharing with a clinician.
              </p>
            </SectionCard>

            <SectionCard icon={ShieldCheck} tone={TONE} title="Good to know">
              <div className="space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Reference data:</strong> simplified WHO-aligned monthly medians and standard deviations for
                  0–24 months, interpolated between months.
                </p>
                <p>
                  <strong>Percentiles are positions, not grades.</strong> A healthy baby can sit on the 3rd or 97th
                  percentile as long as the trend is steady.
                </p>
                <p>
                  <strong>Privacy:</strong> all data stays in this browser. Clearing the tool removes the saved profile.
                </p>
              </div>
              <Callout tone="amber" variant="warning" className="mt-3">
                Educational use only. This is not a diagnosis and does not replace your paediatrician, health visitor
                or dietitian.
              </Callout>
            </SectionCard>
          </div>
        </div>
      </div>

      <FaqAccordion tone={TONE} items={BABY_FAQS} title="Baby growth & feeding questions" />
    </div>
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
