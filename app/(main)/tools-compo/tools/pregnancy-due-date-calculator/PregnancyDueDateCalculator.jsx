"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import ToolPageShell from "../../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Baby,
  CalendarCheck2,
  CalendarDays,
  CalendarHeart,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  Download,
  Heart,
  HeartPulse,
  HelpCircle,
  Info,
  Milestone,
  RotateCcw,
  ScanLine,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  TestTube2,
  Timer,
} from "lucide-react";
import {
  DEFAULT_PREGNANCY,
  EMBRYO_DAYS,
  PREGNANCY_FAQS,
  PREGNANCY_MODES,
  PREGNANCY_TIPS,
  buildPregnancyIcs,
  calculatePregnancy,
  formatDateLong,
  formatDateRange,
  formatDateShort,
  formatWeeksDays,
  localTodayISO,
  pregnancySummary,
} from "./pregnancyData";

const FIELD_BASE =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:ring-2 focus:ring-rose-500/30 dark:bg-slate-800/80 dark:text-white [color-scheme:light] dark:[color-scheme:dark]";

const INPUT_LABEL =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400";

const DEFAULT_DISPLAY = {
  showRing: true,
  showMilestones: true,
  showDating: true,
  showFullTerm: true,
};

const MODE_ICONS = {
  CalendarDays,
  Heart,
  ScanLine,
  TestTube2,
};

const TIP_ICONS = [ScanLine, CalendarHeart, Stethoscope];

const subscribeToClient = () => () => {};

const STATUS_STYLES = {
  passed: {
    dot: "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
    chip: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    label: "Passed",
  },
  current: {
    dot: "border-rose-500 bg-rose-500",
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    label: "Now",
  },
  upcoming: {
    dot: "border-sky-300 bg-white dark:border-sky-700 dark:bg-slate-900",
    chip: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    label: "Upcoming",
  },
};

function fieldClass(error, compact = false) {
  return `${FIELD_BASE} ${compact ? "text-sm" : ""} ${
    error
      ? "border-rose-400 ring-1 ring-rose-300 dark:border-rose-700 dark:ring-rose-900/60"
      : "border-slate-200 dark:border-slate-700"
  }`;
}

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p
      id={id}
      className="mt-1.5 flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400"
    >
      <AlertTriangle className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <div>
        <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
          {label}
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
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
          checked ? "bg-rose-500" : "bg-slate-300 dark:bg-slate-600"
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

function ProgressRing({ percent, label, trimester }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dash = (circumference * Math.min(100, Math.max(0, percent))) / 100;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="pregnancy-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="55%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-rose-100 dark:text-slate-800"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#pregnancy-ring)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          data-testid="gestational-age"
          className="text-lg font-black leading-none text-slate-900 dark:text-white"
        >
          {label}
        </span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {trimester.short} trimester
        </span>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, sub, tone = "rose" }) {
  const tones = {
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    pink: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="flex items-center gap-1.5">
        <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-3 w-3" aria-hidden="true" />
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-black leading-tight text-slate-900 dark:text-white">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
          {sub}
        </p>
      )}
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

export default function PregnancyDueDateCalculator() {
  const { addRecentTool } = useRecentTools();
  const [form, setForm] = useState({ ...DEFAULT_PREGNANCY });
  const [assessmentDate, setAssessmentDate] = useState(() => localTodayISO());
  const [display, setDisplay] = useState({ ...DEFAULT_DISPLAY });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );

  useEffect(() => {
    addRecentTool({
      title: "Pregnancy Due Date Calculator",
      link: "/tools/pregnancy-due-date-calculator",
      icon: "Baby",
    });
  }, [addRecentTool]);

  const result = useMemo(
    () => calculatePregnancy(form, assessmentDate),
    [form, assessmentDate],
  );

  const activeMode = PREGNANCY_MODES.find((mode) => mode.id === form.mode) || PREGNANCY_MODES[0];
  const errors = result.errors || {};
  const errorList = Object.values(errors);
  const activeSettingCount =
    Object.keys(DEFAULT_DISPLAY).filter((key) => display[key] !== DEFAULT_DISPLAY[key])
      .length + (assessmentDate !== localTodayISO() ? 1 : 0);

  const update = (patch) => setForm((current) => ({ ...current, ...patch }));
  const updateDisplay = (patch) =>
    setDisplay((current) => ({ ...current, ...patch }));

  const handleModeChange = (modeId) => {
    if (modeId === form.mode) return;
    update({ mode: modeId });
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_PREGNANCY });
    setAssessmentDate(localTodayISO());
    setDisplay({ ...DEFAULT_DISPLAY });
    setShowAdvanced(false);
    setOpenFaq(0);
    toast.success("Calculator reset to the sample pregnancy.");
  };

  const handleCopy = async () => {
    if (!result.ok) {
      toast.error("Fix the highlighted dates before copying a summary.");
      return;
    }
    const text = pregnancySummary(form, result);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      toast.success("Pregnancy summary copied to clipboard.");
    } catch {
      toast.error("Copy failed. Your browser may be blocking clipboard access.");
    }
  };

  const handleDownloadIcs = () => {
    if (!result.ok) {
      toast.error("Fix the highlighted dates before exporting a calendar.");
      return;
    }
    const ics = buildPregnancyIcs(result, form);
    downloadBlob(
      new Blob([ics], { type: "text/calendar;charset=utf-8" }),
      `pregnancy-milestones-${result.dueDate}.ics`,
    );
    toast.success("Milestone calendar downloaded.");
  };

  const focusMilestone = result.ok
    ? result.currentMilestone || result.nextMilestone
    : null;
  const daysToDueText = result.ok
    ? result.daysToDue === 0
      ? "Estimated due today"
      : result.daysToDue > 0
        ? `${result.daysToDue} day${result.daysToDue === 1 ? "" : "s"} to go`
        : `${Math.abs(result.daysToDue)} day${Math.abs(result.daysToDue) === 1 ? "" : "s"} past the estimate`
    : "";

  return (
    <ToolPageShell>
      <div className="mx-auto w-full max-w-6xl space-y-7 pb-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 p-6 text-white shadow-xl shadow-rose-500/15 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-fuchsia-300/20 blur-2xl" />
          <div className="pointer-events-none absolute right-8 top-8 hidden h-24 w-40 rounded-full border border-dashed border-white/25 lg:block" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-rose-50 backdrop-blur-sm">
              <Baby className="h-3.5 w-3.5" aria-hidden="true" />
              Pregnancy timing studio
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Pregnancy Due Date Calculator
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-rose-50/95 sm:text-base">
              Estimate your due date from your last period, conception, an ultrasound scan or
              an IVF transfer. See gestational age, trimester progress, milestone windows and
              a complete week-by-week timeline — all calculated privately in your browser.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "4 dating methods",
                "Gestational age",
                "Milestone calendar",
                "Calendar export",
                "100% private",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-rose-50 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-3 w-3 text-rose-100" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-4 right-5 hidden w-64 opacity-95 lg:block xl:right-10">
            <svg viewBox="0 0 260 150" role="img" aria-label="Illustration of a heart and calendar">
              <circle cx="160" cy="72" r="58" fill="rgba(255,255,255,0.12)" />
              <circle cx="160" cy="72" r="42" fill="none" stroke="rgba(255,255,255,0.32)" strokeDasharray="4 6" />
              <g transform="translate(128 34) rotate(-4)">
                <rect x="0" y="12" width="66" height="60" rx="12" fill="white" opacity="0.95" />
                <rect x="0" y="12" width="66" height="17" rx="8" fill="#fecdd3" />
                <rect x="12" y="4" width="5" height="15" rx="2.5" fill="#e11d48" />
                <rect x="49" y="4" width="5" height="15" rx="2.5" fill="#e11d48" />
                <circle cx="18" cy="39" r="4" fill="#fb7185" />
                <circle cx="33" cy="39" r="4" fill="#f9a8d4" />
                <circle cx="48" cy="39" r="4" fill="#e9d5ff" />
                <circle cx="18" cy="54" r="4" fill="#f9a8d4" />
                <circle cx="33" cy="54" r="4" fill="#e9d5ff" />
                <circle cx="48" cy="54" r="4" fill="#fb7185" />
              </g>
              <path
                d="M61 100c-14-14-27-25-27-39a16 16 0 0 1 28-10 16 16 0 0 1 28 10c0 14-13 25-27 39l-1 1z"
                fill="white"
                opacity="0.9"
              />
              <path
                d="M61 95c-10-10-19-19-19-29a9 9 0 0 1 16-5 9 9 0 0 1 16 5c0 10-9 19-19 29l-1 1z"
                fill="#fb7185"
                opacity="0.55"
              />
              <circle cx="217" cy="30" r="10" fill="#fce7f3" opacity="0.9" />
              <circle cx="93" cy="23" r="6" fill="#fbcfe8" opacity="0.8" />
            </svg>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Controls */}
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white lg:text-base">
                      Date your pregnancy
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 lg:text-xs">
                      Choose the clue you trust most. Results update live.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-700 dark:hover:text-rose-300"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Reset sample
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800 sm:grid-cols-4">
                {PREGNANCY_MODES.map((mode) => {
                  const Icon = MODE_ICONS[mode.icon] || CalendarDays;
                  const active = form.mode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleModeChange(mode.id)}
                      aria-label={`Use ${mode.label}`}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-extrabold transition sm:flex-row sm:justify-center sm:gap-1.5 ${
                        active
                          ? "bg-white text-rose-700 shadow-sm dark:bg-slate-700 dark:text-rose-300"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {mode.short}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl bg-rose-50/70 px-3 py-2 text-[11px] leading-relaxed text-rose-800 dark:bg-rose-950/25 dark:text-rose-200 sm:text-xs">
                <strong className="font-extrabold">{activeMode.tagline}:</strong>{" "}
                {activeMode.description}
              </div>

              {form.mode === "lmp" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <label htmlFor="pregnancy-lmp-date" className={INPUT_LABEL}>
                      First day of last period
                    </label>
                    <input
                      id="pregnancy-lmp-date"
                      type="date"
                      value={form.lmpDate}
                      min="1900-01-01"
                      max="2100-12-31"
                      onChange={(event) => update({ lmpDate: event.target.value })}
                      aria-invalid={Boolean(errors.lmpDate)}
                      aria-describedby={errors.lmpDate ? "pregnancy-lmp-error" : undefined}
                      className={fieldClass(errors.lmpDate)}
                    />
                    <FieldError id="pregnancy-lmp-error">{errors.lmpDate}</FieldError>
                  </div>
                  <div>
                    <label htmlFor="pregnancy-cycle-length" className={INPUT_LABEL}>
                      Average cycle length (days)
                    </label>
                    <input
                      id="pregnancy-cycle-length"
                      type="number"
                      min={20}
                      max={45}
                      step={1}
                      inputMode="numeric"
                      value={form.cycleLength}
                      onChange={(event) => update({ cycleLength: event.target.value })}
                      aria-invalid={Boolean(errors.cycleLength)}
                      aria-describedby={
                        errors.cycleLength ? "pregnancy-cycle-error" : undefined
                      }
                      className={fieldClass(errors.cycleLength)}
                    />
                    <FieldError id="pregnancy-cycle-error">{errors.cycleLength}</FieldError>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[26, 28, 30, 32].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => update({ cycleLength: days })}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                            Number(form.cycleLength) === days
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-slate-100 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                          }`}
                        >
                          {days} days
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 sm:col-span-2">
                    Naegele&apos;s rule adds 280 days to the first day of your last period,
                    then adjusts for cycles longer or shorter than 28 days. Not sure? Leave
                    it at 28; an early dating scan can refine the estimate.
                  </p>
                </div>
              )}

              {form.mode === "conception" && (
                <div className="mt-4">
                  <label htmlFor="pregnancy-conception-date" className={INPUT_LABEL}>
                    Conception date
                  </label>
                  <input
                    id="pregnancy-conception-date"
                    type="date"
                    value={form.conceptionDate}
                    min="1900-01-01"
                    max="2100-12-31"
                    onChange={(event) => update({ conceptionDate: event.target.value })}
                    aria-invalid={Boolean(errors.conceptionDate)}
                    aria-describedby={
                      errors.conceptionDate ? "pregnancy-conception-error" : undefined
                    }
                    className={fieldClass(errors.conceptionDate)}
                  />
                  <FieldError id="pregnancy-conception-error">
                    {errors.conceptionDate}
                  </FieldError>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Use a known ovulation, insemination or embryo-creation date. Conception
                    typically happens about two weeks after the first day of your last period.
                  </p>
                </div>
              )}

              {form.mode === "ultrasound" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="pregnancy-scan-date" className={INPUT_LABEL}>
                      Ultrasound scan date
                    </label>
                    <input
                      id="pregnancy-scan-date"
                      type="date"
                      value={form.scanDate}
                      min="1900-01-01"
                      max="2100-12-31"
                      onChange={(event) => update({ scanDate: event.target.value })}
                      aria-invalid={Boolean(errors.scanDate)}
                      aria-describedby={errors.scanDate ? "pregnancy-scan-error" : undefined}
                      className={fieldClass(errors.scanDate)}
                    />
                    <FieldError id="pregnancy-scan-error">{errors.scanDate}</FieldError>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="pregnancy-scan-weeks" className={INPUT_LABEL}>
                        Weeks at scan
                      </label>
                      <input
                        id="pregnancy-scan-weeks"
                        type="number"
                        min={4}
                        max={42}
                        step={1}
                        inputMode="numeric"
                        value={form.scanWeeks}
                        onChange={(event) => update({ scanWeeks: event.target.value })}
                        aria-invalid={Boolean(errors.scanWeeks)}
                        aria-describedby={
                          errors.scanWeeks ? "pregnancy-scan-weeks-error" : undefined
                        }
                        className={fieldClass(errors.scanWeeks)}
                      />
                      <FieldError id="pregnancy-scan-weeks-error">
                        {errors.scanWeeks}
                      </FieldError>
                    </div>
                    <div>
                      <label htmlFor="pregnancy-scan-days" className={INPUT_LABEL}>
                        Days at scan
                      </label>
                      <input
                        id="pregnancy-scan-days"
                        type="number"
                        min={0}
                        max={6}
                        step={1}
                        inputMode="numeric"
                        value={form.scanDays}
                        onChange={(event) => update({ scanDays: event.target.value })}
                        aria-invalid={Boolean(errors.scanDays)}
                        aria-describedby={
                          errors.scanDays ? "pregnancy-scan-days-error" : undefined
                        }
                        className={fieldClass(errors.scanDays)}
                      />
                      <FieldError id="pregnancy-scan-days-error">
                        {errors.scanDays}
                      </FieldError>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Copy the gestational age printed on the scan report exactly. The
                    calculator adds the remaining weeks needed to reach 40w 0d.
                  </p>
                </div>
              )}

              {form.mode === "ivf" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pregnancy-transfer-date" className={INPUT_LABEL}>
                      Embryo transfer date
                    </label>
                    <input
                      id="pregnancy-transfer-date"
                      type="date"
                      value={form.transferDate}
                      min="1900-01-01"
                      max="2100-12-31"
                      onChange={(event) => update({ transferDate: event.target.value })}
                      aria-invalid={Boolean(errors.transferDate)}
                      aria-describedby={
                        errors.transferDate ? "pregnancy-transfer-error" : undefined
                      }
                      className={fieldClass(errors.transferDate)}
                    />
                    <FieldError id="pregnancy-transfer-error">
                      {errors.transferDate}
                    </FieldError>
                  </div>
                  <div>
                    <label htmlFor="pregnancy-embryo-day" className={INPUT_LABEL}>
                      Embryo stage at transfer
                    </label>
                    <select
                      id="pregnancy-embryo-day"
                      value={form.embryoDay}
                      onChange={(event) => update({ embryoDay: event.target.value })}
                      aria-invalid={Boolean(errors.embryoDay)}
                      aria-describedby={
                        errors.embryoDay ? "pregnancy-embryo-error" : undefined
                      }
                      className={fieldClass(errors.embryoDay)}
                    >
                      {EMBRYO_DAYS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FieldError id="pregnancy-embryo-error">{errors.embryoDay}</FieldError>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 sm:col-span-2">
                    Day-5 blastocyst transfers use 261 days, day-3 transfers use 263 and
                    day-6 transfers use 260. Your fertility clinic&apos;s embryology report
                    is the best source for the transfer date and stage.
                  </p>
                </div>
              )}

              {/* Advanced */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((current) => !current)}
                  aria-expanded={showAdvanced}
                  aria-controls="pregnancy-advanced-panel"
                  className="flex w-full items-center justify-between gap-2 bg-slate-50/80 px-4 py-3 text-left transition hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                >
                  <span className="flex flex-wrap items-center gap-2 text-[13px] font-extrabold text-slate-800 dark:text-slate-100">
                    <Settings2 className="h-4 w-4 text-rose-500" aria-hidden="true" />
                    Advanced options
                    {activeSettingCount > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {activeSettingCount} changed
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {showAdvanced && (
                  <div
                    id="pregnancy-advanced-panel"
                    className="space-y-4 border-t border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <label htmlFor="pregnancy-assessment-date" className={INPUT_LABEL}>
                          Calculate progress as of
                        </label>
                        <button
                          type="button"
                          onClick={() => setAssessmentDate(localTodayISO())}
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                        >
                          Today
                        </button>
                      </div>
                      <input
                        id="pregnancy-assessment-date"
                        type="date"
                        value={assessmentDate}
                        min="1900-01-01"
                        max="2100-12-31"
                        onChange={(event) => setAssessmentDate(event.target.value)}
                        aria-invalid={Boolean(errors.referenceDate)}
                        aria-describedby={
                          errors.referenceDate ? "pregnancy-assessment-error" : undefined
                        }
                        className={fieldClass(errors.referenceDate)}
                      />
                      <FieldError id="pregnancy-assessment-error">
                        {errors.referenceDate}
                      </FieldError>
                      <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Changes gestational age, days-to-go and milestone status. It does
                        not move the estimated due date.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Toggle
                        checked={display.showRing}
                        onChange={(value) => updateDisplay({ showRing: value })}
                        label="Show progress ring"
                        description="A circular summary of how far you are through the 40-week timeline."
                      />
                      <Toggle
                        checked={display.showMilestones}
                        onChange={(value) => updateDisplay({ showMilestones: value })}
                        label="Show milestone calendar"
                        description="Screening windows, trimester starts, full term and post-term dates."
                      />
                      <Toggle
                        checked={display.showDating}
                        onChange={(value) => updateDisplay({ showDating: value })}
                        label="Show conception & dating details"
                        description="LMP equivalent, conception estimate, implantation window and fetal age."
                      />
                      <Toggle
                        checked={display.showFullTerm}
                        onChange={(value) => updateDisplay({ showFullTerm: value })}
                        label="Show full-term window"
                        description="The 37 to 42-week range when most babies are born."
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                        Display options change the layout only. The due-date maths stays the
                        same.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDisplay({ ...DEFAULT_DISPLAY })}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-700 dark:hover:text-rose-300"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Reset display
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-rose-50/70 px-3 py-2 text-[10px] leading-relaxed text-rose-800 dark:bg-rose-950/25 dark:text-rose-200">
                <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Every date is calculated locally. Nothing you enter is uploaded, stored or
                shared.
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-500" aria-hidden="true" />
                <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white lg:text-base">
                  Four ways to date a pregnancy
                </h2>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                  <strong className="block text-slate-800 dark:text-slate-100">
                    Last period
                  </strong>
                  280 days from LMP, adjusted for cycle length.
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                  <strong className="block text-slate-800 dark:text-slate-100">
                    Conception
                  </strong>
                  266 days from a known conception or ovulation date.
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                  <strong className="block text-slate-800 dark:text-slate-100">
                    Ultrasound
                  </strong>
                  Scan date plus the remaining days to 40 weeks.
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                  <strong className="block text-slate-800 dark:text-slate-100">
                    IVF transfer
                  </strong>
                  Transfer date plus a fixed embryo-age offset.
                </div>
              </div>
            </section>
          </div>

          {/* Results */}
          <div className="space-y-5 lg:col-span-5 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-fuchsia-50 shadow-sm dark:border-rose-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/20">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Your pregnancy timeline
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>

                {!mounted ? (
                  <div className="mt-4 animate-pulse space-y-3" aria-hidden="true">
                    <div className="h-28 rounded-2xl bg-rose-100/70 dark:bg-slate-800" />
                    <div className="h-16 rounded-2xl bg-rose-100/50 dark:bg-slate-800/60" />
                  </div>
                ) : !result.ok ? (
                  <div
                    role="alert"
                    className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30"
                  >
                    <div className="flex items-center gap-2 text-sm font-extrabold text-rose-800 dark:text-rose-200">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      Check the dates
                    </div>
                    <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                      {errorList.slice(0, 4).map((error) => (
                        <li key={error} className="flex gap-1.5">
                          <span aria-hidden="true">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                    {errorList.length > 4 && (
                      <p className="mt-2 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                        Plus {errorList.length - 4} more field
                        {errorList.length - 4 === 1 ? "" : "s"} to check.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                      {display.showRing ? (
                        <ProgressRing
                          percent={result.progressPercent}
                          label={result.gaLabel}
                          trimester={result.trimester}
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          <HeartPulse className="h-5 w-5" aria-hidden="true" />
                          <span className="mt-0.5 text-[9px] font-black">
                            {Math.round(result.progressPercent)}%
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                          Estimated due date
                        </p>
                        <p
                          data-testid="due-date"
                          className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-[27px]"
                        >
                          {formatDateLong(result.dueDate)}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                          {result.dueDay} · {daysToDueText}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            {result.trimester.label}
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                            {result.methodLabel}
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                            As of {formatDateShort(result.referenceDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Metric
                        icon={Timer}
                        label="Gestational age"
                        value={result.gaLabel}
                        sub={`${result.trimester.short} trimester on ${formatDateShort(result.referenceDate)}`}
                      />
                      <Metric
                        icon={CalendarCheck2}
                        label={result.isOverdue ? "Past due" : "Days to due"}
                        value={
                          result.isOverdue
                            ? `${Math.abs(result.daysToDue)} days`
                            : `${result.daysToDue} days`
                        }
                        sub={result.isOverdue ? "After the estimate" : "Calendar days"}
                        tone="pink"
                      />
                      <Metric
                        icon={Activity}
                        label="Fetal age"
                        value={result.fetalAgeLabel}
                        sub="From conception"
                        tone="violet"
                      />
                      <Metric
                        icon={CalendarRange}
                        label={display.showFullTerm ? "Full-term window" : "Due day"}
                        value={
                          display.showFullTerm
                            ? formatDateRange(result.fullTermStart, result.fullTermEnd)
                            : result.dueDay
                        }
                        sub={display.showFullTerm ? "37 to 42 weeks" : "Estimated date"}
                        tone="amber"
                      />
                    </div>

                    {result.methodDetail && (
                      <p className="mt-3 rounded-xl bg-white/75 px-3 py-2 text-[10px] leading-relaxed text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                        <strong className="font-bold text-slate-700 dark:text-slate-200">
                          Calculation:
                        </strong>{" "}
                        {result.methodDetail}
                      </p>
                    )}

                    {display.showMilestones && (
                      <div className="mt-3 rounded-2xl border border-rose-100 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                        {focusMilestone ? (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                                <Milestone className="h-3 w-3" aria-hidden="true" />
                                {result.currentMilestone ? "Happening now" : "Next milestone"}
                              </span>
                              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                                {formatDateRange(focusMilestone.startDate, focusMilestone.endDate)}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                              {focusMilestone.label}
                            </p>
                            <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                              {focusMilestone.description}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                              All listed milestones have passed
                            </p>
                            <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                              Your estimated due date has passed. Your care team can advise on
                              monitoring and next steps.
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-2.5 py-2.5 text-[11px] font-extrabold text-rose-800 transition hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-800 dark:text-rose-200 dark:hover:bg-slate-700"
                      >
                        <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" />
                        Copy summary
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadIcs}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-2.5 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-slate-800 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        Download .ics
                      </button>
                    </div>

                    <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                      <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
                      This is an educational estimate, not medical advice. Your care team&apos;s
                      dating scan and clinical judgement are the best guide.
                    </p>
                  </>
                )}
              </div>
            </section>

            {result.ok && display.showDating && (
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-rose-500" aria-hidden="true" />
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Dating details
                  </h2>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/40">
                    <dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      LMP equivalent
                    </dt>
                    <dd className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">
                      {formatDateShort(result.lmpEquivalent)}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/40">
                    <dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Conception estimate
                    </dt>
                    <dd className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">
                      {formatDateShort(result.conceptionEstimate)}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/40">
                    <dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Implantation window
                    </dt>
                    <dd className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">
                      {formatDateRange(result.implantationStart, result.implantationEnd)}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/40">
                    <dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Fetal age
                    </dt>
                    <dd className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">
                      {result.fetalAgeLabel}
                    </dd>
                  </div>
                </dl>
                {display.showFullTerm && (
                  <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] leading-relaxed text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Full-term window:{" "}
                    <strong className="font-extrabold">
                      {formatDateRange(result.fullTermStart, result.fullTermEnd)}
                    </strong>{" "}
                    — about {formatWeeksDays(259)} to {formatWeeksDays(294)} of pregnancy.
                  </p>
                )}
              </section>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-rose-500" aria-hidden="true" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  A due date is a window
                </h2>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Only about <strong className="text-slate-800 dark:text-slate-100">4%</strong> of
                babies arrive on their exact estimated due date. Most are born within two
                weeks either side, and the 37 to 42-week full-term range matters more than a
                single day.
              </p>
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Bring the dates and method you used to your first antenatal visit so your care
                team can confirm or adjust the estimate.
              </div>
            </div>
          </div>
        </div>

        {/* Milestone calendar */}
        {result.ok && display.showMilestones && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Milestone className="h-5 w-5 text-rose-500" aria-hidden="true" />
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Milestone calendar
                  </h2>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Typical care windows based on your estimated due date. Your care team may
                  schedule these differently.
                </p>
              </div>
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                {formatDateRange(result.milestones[0].startDate, result.dueDate)}
              </span>
            </div>

            <ol className="relative mt-4 space-y-2.5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
              {result.milestones.map((milestone) => {
                const status = STATUS_STYLES[milestone.status] || STATUS_STYLES.upcoming;
                return (
                  <li key={milestone.id} className="relative pl-6">
                    <span
                      className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 ${status.dot}`}
                      aria-hidden="true"
                    />
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                          {milestone.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${status.chip}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-300">
                        {formatDateRange(milestone.startDate, milestone.endDate)}
                      </p>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {milestone.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Tips */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PREGNANCY_TIPS.map((tip, index) => {
            const Icon = TIP_ICONS[index] || Heart;
            return (
              <div
                key={tip.title}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="mt-3 text-[15px] font-extrabold text-slate-900 dark:text-white">
                  {tip.title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {tip.body}
                </p>
              </div>
            );
          })}
        </section>

        {/* Formula */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex items-center gap-2">
            <CalendarHeart className="h-5 w-5 text-rose-500" aria-hidden="true" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              How the due date is calculated
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            Every method answers the same question from a different starting clue. The
            calculator converts the clue into a 40-week gestational timeline, then derives
            your current week, trimester and milestone dates from it.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                01 · Last period
              </span>
              <h3 className="mt-1.5 text-[13px] font-extrabold text-slate-900 dark:text-white">
                Naegele&apos;s rule
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                LMP + 280 days, shifted by the difference between your cycle and 28 days.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                02 · Conception
              </span>
              <h3 className="mt-1.5 text-[13px] font-extrabold text-slate-900 dark:text-white">
                38 weeks
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Conception date + 266 days, because gestational age starts about two weeks
                earlier.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                03 · Ultrasound
              </span>
              <h3 className="mt-1.5 text-[13px] font-extrabold text-slate-900 dark:text-white">
                Scan dating
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Scan date + (280 days − the scan&apos;s gestational age in days).
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                04 · IVF
              </span>
              <h3 className="mt-1.5 text-[13px] font-extrabold text-slate-900 dark:text-white">
                Transfer dating
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Transfer date + (266 days − embryo age in days): 263, 261 or 260 days.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-rose-200 dark:bg-black/50 sm:text-xs">
            <div>due = lmp + 280 + (cycle_length - 28)</div>
            <div className="mt-1">due = conception + 266</div>
            <div className="mt-1">due = scan_date + (280 - scan_age_days)</div>
            <div className="mt-1">due = transfer_date + (266 - embryo_day)</div>
          </div>
        </section>

        {/* FAQ */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-7">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-rose-500" aria-hidden="true" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Pregnancy Due Date Calculator FAQ
              </h2>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              The questions people ask most about dating a pregnancy, scan accuracy and what
              the milestone dates really mean.
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {PREGNANCY_FAQS.map((faq, index) => {
              const expanded = openFaq === index;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(expanded ? null : index)}
                    aria-expanded={expanded}
                    aria-controls={`pregnancy-faq-${index}`}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:px-7"
                  >
                    <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 sm:text-sm">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {expanded && (
                    <div
                      id={`pregnancy-faq-${index}`}
                      className="px-5 pb-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:px-7"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <p className="mx-auto max-w-3xl text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Due dates are estimates, not diagnoses. Ultrasound dating, IVF protocols and
          antenatal schedules vary by country and clinic. Always confirm your due date,
          screening windows and care plan with a qualified healthcare professional.
        </p>
      </div>
    </ToolPageShell>
  );
}
