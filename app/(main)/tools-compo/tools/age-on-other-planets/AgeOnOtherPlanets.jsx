"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Copy,
  FileJson,
  FileSpreadsheet,
  ImageDown,
  Info,
  Link2,
  Orbit,
  RefreshCw,
  Rocket,
  Ruler,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Trophy,
  User,
} from "lucide-react";
import { toast } from "sonner";

import ToolPageShell from "../../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { ComparisonTable, MilestoneGrid, PlanetCard } from "./PlanetCard";
import {
  CM_TO_IN,
  DECIMAL_OPTIONS,
  DEFAULT_MILESTONE,
  IN_TO_CM,
  KG_TO_LB,
  LB_TO_KG,
  MILESTONE_PRESETS,
  PLANETS,
  PLANET_FAQS,
  PLANET_IDS,
  PRESET_DATES,
  STORAGE_KEY,
  UNITS,
  buildCSV,
  buildJSON,
  buildShareText,
  buildShareUrl,
  computeCosmicReport,
  formatCompact,
  formatDateUTC,
  formatDayCount,
  formatNumber,
  ordinal,
  parseISODate,
  todayISO,
  validateDates,
} from "./planetData";
import { copyText, downloadPlanetCard, downloadText } from "./planetShare";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const TOOL_META = {
  title: "Age on Other Planets",
  link: "/tools/age-on-other-planets",
  description:
    "Find out how old you are on Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto.",
  icon: "Rocket",
  categories: ["Fun", "Calculator"],
};

const DEFAULT_DECIMALS = 2;
const DEFAULT_JUMP_CM = 50;
const MAX_MILESTONE = 1000;
const MAX_NAME_LENGTH = 40;

const allPlanetsEnabled = () =>
  Object.fromEntries(PLANET_IDS.map((id) => [id, true]));

const clampInt = (value, fallback, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

// ─────────────────────────────────────────────────────────────────────────────
// Small UI primitives
// ─────────────────────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children, className }) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70",
        className
      )}
    >
      {title ? (
        <header className="mb-4 flex items-center gap-2.5">
          {Icon ? (
            <span className="flex size-8 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <Icon className="size-4" />
            </span>
          ) : null}
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
            {title}
          </h2>
        </header>
      ) : null}
      {children}
    </section>
  );
}

function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
      >
        {label}
      </Label>
      {children}
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function SegmentedControl({ options, value, onChange, ariaLabel }) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950/60"
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
              active
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ChipButton({ active, onClick, children, title, className }) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
        active
          ? "border-violet-300 bg-violet-50 text-violet-700 shadow-sm dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-200"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );
}

function ToggleRow({ id, label, hint, checked, onCheckedChange }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
      <div>
        <Label htmlFor={id} className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </Label>
        {hint ? <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero + decorative pieces
// ─────────────────────────────────────────────────────────────────────────────
function OrbitArt({ compact = false }) {
  const size = compact ? "size-40" : "size-52";
  return (
    <div className={cn("relative mx-auto", size)} aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 size-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
      <div className="absolute left-1/2 top-1/2 size-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="absolute left-1/2 top-1/2 size-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 shadow-[0_0_36px_rgba(251,191,36,0.65)]" />
      <span
        className="absolute left-1/2 top-1/2 size-3.5 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.9)]"
        style={{ transform: "translate(74px, -18px)" }}
      />
      <span
        className="absolute left-1/2 top-1/2 size-4 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]"
        style={{ transform: "translate(-54px, 34px)" }}
      />
      <span
        className="absolute left-1/2 top-1/2 size-2.5 rounded-full bg-rose-300 shadow-[0_0_12px_rgba(253,164,175,0.9)]"
        style={{ transform: "translate(28px, 44px)" }}
      />
    </div>
  );
}

function EmptyState({ onPreset }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-500/10" />
      <div className="relative">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-violet-500/30">
          <Rocket className="size-9" />
        </div>
        <h2 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Your cosmic birthday report is one date away
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Enter your date of birth and this page will show exactly how old you are on all eight
          planets — plus Pluto — with birthdays, milestones, weight and jump heights included.
        </p>
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Or try a famous moment in space history
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {PRESET_DATES.map((preset) => (
              <ChipButton key={preset.date} onClick={() => onPreset(preset.date)} title={preset.detail}>
                {preset.label}
              </ChipButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultHero({ report, name, planets }) {
  const list = planets && planets.length ? planets : report.planets;
  const earth = report.planets.find((planet) => planet.id === "earth");
  const oldest = list.reduce((best, planet) => (planet.years > best.years ? planet : best));
  const youngest = list.reduce((best, planet) => (planet.years < best.years ? planet : best));
  const greeting = name?.trim() ? `Here's your life across the solar system, ${name.trim()}` : "Here's your life across the solar system";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-[#150b38] to-[#041230] p-6 text-white shadow-2xl sm:p-8">
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 size-80 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div aria-live="polite">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-200">
            <Sparkles className="size-3" />
            Cosmic birthday report
          </span>
          <p className="mt-4 text-sm font-medium text-slate-300">{greeting}</p>
          <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="bg-gradient-to-r from-white via-violet-100 to-sky-200 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
              {formatNumber(report.calendarYears, 1)}
            </span>
            <span className="pb-2 text-lg font-bold text-slate-200">Earth years old</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {formatNumber(report.earthDaysWhole, 0)} days · {report.earthOrbits} full orbits of the
            Sun · next Earth birthday {formatDateUTC(report.earthNextBirthday)}{" "}
            <span className="text-slate-500">({formatDayCount(earth.nextInDays)})</span>
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-slate-200">
              <User className="size-3.5 text-violet-300" />
              Born {formatDateUTC(report.dob)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-slate-200">
              <CalendarDays className="size-3.5 text-sky-300" />
              As of {formatDateUTC(report.asOf)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-slate-200">
              <Trophy className="size-3.5 text-amber-300" />
              Oldest on {oldest.name} ({formatNumber(oldest.years, 1)} yrs)
            </span>
            {youngest.id !== oldest.id ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-slate-200">
                <Orbit className="size-3.5 text-emerald-300" />
                Youngest on {youngest.name} ({formatNumber(youngest.years, 2)} yrs)
              </span>
            ) : null}
          </div>
        </div>

        <div className="hidden lg:block">
          <OrbitArt />
        </div>
      </div>

      <div className="relative mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {report.earthStats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>
            <p className="mt-1 text-sm font-bold text-white">
              {stat.id === "orbits" ? formatNumber(stat.value, 1) : formatCompact(stat.value, 1)}
              {stat.approximate ? <span className="ml-1 text-[10px] font-semibold text-slate-400">approx</span> : null}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqSection({ openFaq, setOpenFaq }) {
  return (
    <section className="mx-auto mt-14 max-w-4xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Frequently asked questions
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          How planetary ages, birthdays and gravity comparisons are calculated.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {PLANET_FAQS.map((faq, index) => {
          const open = openFaq === index;
          return (
            <div
              key={faq.q}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(open ? -1 : index)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-slate-400 transition-transform duration-300",
                    open && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {faq.a}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function AgeOnOtherPlanets() {
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState("");
  const [units, setUnits] = useState(UNITS.METRIC);
  const [decimals, setDecimals] = useState(DEFAULT_DECIMALS);
  const [milestone, setMilestone] = useState(DEFAULT_MILESTONE);
  const [enabled, setEnabled] = useState(allPlanetsEnabled);
  const [showWeight, setShowWeight] = useState(false);
  const [showFacts, setShowFacts] = useState(true);
  const [weightInput, setWeightInput] = useState("");
  const [jumpInput, setJumpInput] = useState(String(DEFAULT_JUMP_CM));
  const [tab, setTab] = useState("table");
  const [openFaq, setOpenFaq] = useState(0);
  const [todayValue, setTodayValue] = useState(null);
  const initializedRef = useRef(false);

  // ── Restore saved settings, then let a share link win over them ────────────
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let stored = {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) || {};
    } catch {
      stored = {};
    }

    const params = new URLSearchParams(window.location.search);
    const urlDob = params.get("dob");
    const urlDobValid = Boolean(urlDob && parseISODate(urlDob));

    const nextName =
      (typeof params.get("n") === "string" ? params.get("n") : "") ||
      (typeof stored.name === "string" ? stored.name : "");

    const nextDob = urlDobValid
      ? urlDob
      : typeof stored.dob === "string"
      ? stored.dob
      : "";

    const urlAs = params.get("as");
    const nextAsOf =
      urlAs && parseISODate(urlAs)
        ? urlAs
        : typeof stored.asOf === "string" && stored.asOf
        ? stored.asOf
        : todayISO();

    const nextUnits =
      params.get("u") === "i"
        ? UNITS.IMPERIAL
        : stored.units === UNITS.IMPERIAL
        ? UNITS.IMPERIAL
        : UNITS.METRIC;

    const nextDecimals = params.has("d")
      ? clampInt(params.get("d"), DEFAULT_DECIMALS, 0, 3)
      : clampInt(stored.decimals, DEFAULT_DECIMALS, 0, 3);

    const nextMilestone = params.has("m")
      ? clampInt(params.get("m"), DEFAULT_MILESTONE, 1, MAX_MILESTONE)
      : clampInt(stored.milestone, DEFAULT_MILESTONE, 1, MAX_MILESTONE);

    let nextEnabled = allPlanetsEnabled();
    if (stored.enabled && typeof stored.enabled === "object") {
      PLANET_IDS.forEach((id) => {
        nextEnabled[id] = stored.enabled[id] !== false;
      });
    }
    const urlPlanets = params.get("p");
    if (urlPlanets !== null && urlPlanets.trim() !== "") {
      const list = urlPlanets
        .split(",")
        .map((id) => id.trim().toLowerCase())
        .filter((id) => PLANET_IDS.includes(id));
      if (list.length > 0) {
        nextEnabled = Object.fromEntries(PLANET_IDS.map((id) => [id, list.includes(id)]));
      }
    }

    const urlWeight = Number.parseFloat(params.get("w"));
    const urlJump = Number.parseFloat(params.get("j"));
    const storedWeight = typeof stored.weightInput === "string" ? stored.weightInput : "";
    const storedJump =
      typeof stored.jumpInput === "string" && stored.jumpInput
        ? stored.jumpInput
        : String(DEFAULT_JUMP_CM);

    setHydrated(true);
    setTodayValue(todayISO());
    setName(nextName.slice(0, MAX_NAME_LENGTH));
    setDob(nextDob);
    setAsOf(nextAsOf);
    setUnits(nextUnits);
    setDecimals(nextDecimals);
    setMilestone(nextMilestone);
    setEnabled(nextEnabled);
    // Share links carry canonical kg/cm values; convert them when the link's units are imperial.
    const round1 = (value) => String(Math.round(value * 10) / 10);
    const fromUrlWeight = Number.isFinite(urlWeight) && urlWeight > 0;
    const fromUrlJump = Number.isFinite(urlJump) && urlJump > 0;
    setWeightInput(
      fromUrlWeight
        ? round1(nextUnits === UNITS.IMPERIAL ? urlWeight * KG_TO_LB : urlWeight)
        : storedWeight
    );
    setJumpInput(
      fromUrlJump
        ? round1(nextUnits === UNITS.IMPERIAL ? urlJump * CM_TO_IN : urlJump)
        : storedJump
    );
    setShowWeight(
      (Number.isFinite(urlWeight) && urlWeight > 0) ||
        (params.has("j") && Number.isFinite(urlJump)) ||
        stored.showWeight === true
    );
    setShowFacts(stored.showFacts !== false);

    if (urlDob && !urlDobValid) {
      toast.error("That share link's birth date wasn't valid — showing your saved settings instead.");
    } else if (urlDobValid) {
      toast.success("Shared cosmic report loaded — tweak anything to make it yours.");
    }
  }, []);

  // ── Persist everything, but only after the restore pass finished ───────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name,
          dob,
          asOf,
          units,
          decimals,
          milestone,
          enabled,
          showWeight,
          showFacts,
          weightInput,
          jumpInput,
        })
      );
    } catch {
      // Storage being unavailable (private mode, quota) never breaks the tool.
    }
  }, [hydrated, name, dob, asOf, units, decimals, milestone, enabled, showWeight, showFacts, weightInput, jumpInput]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const validation = useMemo(() => validateDates(dob, asOf), [dob, asOf]);
  const hasInput = Boolean(dob);
  const dobError = hasInput && !validation.ok && validation.field === "dob" ? validation.message : "";
  const asOfError = hasInput && !validation.ok && validation.field === "asOf" ? validation.message : "";

  const weightKg = useMemo(() => {
    const value = Number.parseFloat(weightInput);
    if (!Number.isFinite(value) || value <= 0) return null;
    return units === UNITS.IMPERIAL ? value * LB_TO_KG : value;
  }, [weightInput, units]);

  const jumpCm = useMemo(() => {
    const value = Number.parseFloat(jumpInput);
    if (!Number.isFinite(value) || value <= 0) return null;
    return units === UNITS.IMPERIAL ? value * IN_TO_CM : value;
  }, [jumpInput, units]);

  const report = useMemo(() => {
    if (!hasInput) return null;
    return computeCosmicReport({
      dobValue: dob,
      asOfValue: asOf,
      milestone,
      weightKg: showWeight ? weightKg : null,
      jumpCm: showWeight ? jumpCm : null,
    });
  }, [hasInput, dob, asOf, milestone, showWeight, weightKg, jumpCm]);

  const visiblePlanets = useMemo(
    () => (report?.ok ? report.planets.filter((planet) => enabled[planet.id]) : []),
    [report, enabled]
  );

  const enabledIds = useMemo(() => PLANET_IDS.filter((id) => enabled[id]), [enabled]);

  const settings = useMemo(
    () => ({ units, decimals, milestoneYears: milestone, showFacts, showWeightModule: showWeight }),
    [units, decimals, milestone, showFacts, showWeight]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUnitsChange = (nextUnits) => {
    if (nextUnits === units) return;
    const toImperial = nextUnits === UNITS.IMPERIAL;
    const convert = (raw, factor) => {
      const value = Number.parseFloat(raw);
      if (!Number.isFinite(value) || value <= 0) return raw;
      const converted = toImperial ? value * factor : value / factor;
      return String(Math.round(converted * 10) / 10);
    };
    setWeightInput((prev) => convert(prev, KG_TO_LB));
    setJumpInput((prev) => convert(prev, CM_TO_IN));
    setUnits(nextUnits);
  };

  const togglePlanet = (id) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllPlanets = (value) => {
    setEnabled(Object.fromEntries(PLANET_IDS.map((id) => [id, value])));
  };

  const handleReset = () => {
    setName("");
    setDob("");
    setAsOf(todayISO());
    setUnits(UNITS.METRIC);
    setDecimals(DEFAULT_DECIMALS);
    setMilestone(DEFAULT_MILESTONE);
    setEnabled(allPlanetsEnabled());
    setShowWeight(false);
    setShowFacts(true);
    setWeightInput("");
    setJumpInput(String(DEFAULT_JUMP_CM));
    setTab("table");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors on reset.
    }
    toast.success("Everything is back to the defaults.");
  };

  const requireReport = () => {
    if (!report?.ok) {
      toast.error("Add a valid birth date first.");
      return false;
    }
    if (visiblePlanets.length === 0) {
      toast.error("Turn on at least one planet to export a report.");
      return false;
    }
    return true;
  };

  const exportReport = useMemo(
    () => (report?.ok ? { ...report, planets: visiblePlanets.length ? visiblePlanets : report.planets } : report),
    [report, visiblePlanets]
  );

  const handleCopySummary = async () => {
    if (!requireReport()) return;
    const ok = await copyText(buildShareText(exportReport, { units, milestone }));
    if (ok) toast.success("Text summary copied to your clipboard.");
    else toast.error("The clipboard is unavailable in this browser — try the CSV or PNG export.");
  };

  const handleCopyLink = async () => {
    if (!requireReport()) return;
    const url = buildShareUrl({
      dob,
      asOf,
      units,
      decimals,
      milestone,
      weightKg,
      jumpCm,
      enabledIds,
      name,
    });
    const ok = await copyText(url);
    if (ok) toast.success("Share link copied — it restores this exact report.");
    else toast.error("The clipboard is unavailable in this browser.");
  };

  const handleDownloadCard = async () => {
    if (!requireReport()) return;
    try {
      toast.info("Rendering your branded report card…");
      const filename = await downloadPlanetCard(report, { enabledIds, name, units });
      toast.success(`Report card saved as ${filename}`);
    } catch {
      toast.error("The PNG card could not be generated — try the CSV or JSON export instead.");
    }
  };

  const handleDownloadCSV = () => {
    if (!requireReport()) return;
    downloadText(
      `toolstrek-planet-age-${asOf || "report"}.csv`,
      buildCSV(exportReport, { units, milestone }),
      "text/csv;charset=utf-8"
    );
    toast.success("CSV export downloaded.");
  };

  const handleDownloadJSON = () => {
    if (!requireReport()) return;
    downloadText(
      `toolstrek-planet-age-${asOf || "report"}.json`,
      buildJSON(exportReport, { units, decimals, weightKg, jumpCm }),
      "application/json;charset=utf-8"
    );
    toast.success("JSON export downloaded.");
  };

  const handlePreset = (date) => {
    setDob(date);
    if (!asOf || parseISODate(asOf) < parseISODate(date)) setAsOf(todayISO());
  };

  const isReady = Boolean(report?.ok);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="mx-auto w-full max-w-7xl">
        {/* Tool header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
              <Rocket className="size-3" />
              Fun · Space calculator
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Age on Other Planets
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Type your birth date and instantly see your exact age on Mercury, Venus, Earth, Mars,
              Jupiter, Saturn, Uranus, Neptune and Pluto — with your next planetary birthday, a
              milestone planner, weight and jump heights, and a shareable report card. Everything
              runs 100% in your browser.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton tool={TOOL_META} />
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* ── Settings column ── */}
          <aside className="space-y-6 lg:col-span-4">
            <SectionCard title="Your details" icon={User}>
              <div className="space-y-4">
                <Field
                  label="Your name (optional)"
                  hint="Adds a personal touch to the report card and share text."
                  htmlFor="planet-age-name"
                >
                  <Input
                    id="planet-age-name"
                    type="text"
                    value={name}
                    maxLength={MAX_NAME_LENGTH}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Alex"
                    autoComplete="off"
                    className="h-10"
                  />
                </Field>

                <Field
                  label="Date of birth"
                  htmlFor="planet-age-dob"
                  error={dobError}
                  hint={!dobError ? "Everything is calculated from this date, in your local calendar." : undefined}
                >
                  <Input
                    id="planet-age-dob"
                    type="date"
                    value={dob}
                    min="1000-01-01"
                    max={todayValue || undefined}
                    aria-invalid={Boolean(dobError)}
                    onChange={(event) => setDob(event.target.value)}
                    className="h-10 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </Field>

                <Field
                  label="Calculate as of"
                  htmlFor="planet-age-asof"
                  error={asOfError}
                  hint={!asOfError ? "Leave it on today — or move it into the future to project your cosmic age." : undefined}
                >
                  <div className="flex gap-2">
                    <Input
                      id="planet-age-asof"
                      type="date"
                      value={asOf}
                      min={dob || "1000-01-01"}
                      aria-invalid={Boolean(asOfError)}
                      onChange={(event) => setAsOf(event.target.value)}
                      className="h-10 flex-1 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAsOf(todayISO())}
                      className="h-10 shrink-0"
                    >
                      <CalendarDays className="size-4" />
                      Today
                    </Button>
                  </div>
                </Field>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Try a famous moment
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRESET_DATES.map((preset) => (
                      <ChipButton
                        key={preset.date}
                        active={dob === preset.date}
                        onClick={() => handlePreset(preset.date)}
                        title={`${preset.detail} · ${preset.date}`}
                      >
                        <Sparkles className="size-3" />
                        {preset.label}
                      </ChipButton>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Customise your report" icon={SlidersHorizontal}>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Units
                  </p>
                  <SegmentedControl
                    ariaLabel="Measurement units"
                    value={units}
                    onChange={handleUnitsChange}
                    options={[
                      { value: UNITS.METRIC, label: "Metric", icon: Ruler },
                      { value: UNITS.IMPERIAL, label: "Imperial", icon: Scale },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Decimal places
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DECIMAL_OPTIONS.map((option) => (
                      <ChipButton
                        key={option}
                        active={decimals === option}
                        onClick={() => setDecimals(option)}
                        title={`Show ${option} decimal place${option === 1 ? "" : "s"}`}
                      >
                        {option}
                      </ChipButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Planetary milestone
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MILESTONE_PRESETS.map((option) => (
                      <ChipButton
                        key={option}
                        active={milestone === option}
                        onClick={() => setMilestone(option)}
                        title={`Track your ${ordinal(option)} birthday on every planet`}
                      >
                        {option}
                      </ChipButton>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Label
                      htmlFor="planet-age-milestone"
                      className="text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                    >
                      Custom
                    </Label>
                    <Input
                      id="planet-age-milestone"
                      type="number"
                      min={1}
                      max={MAX_MILESTONE}
                      value={milestone}
                      onChange={(event) =>
                        setMilestone(clampInt(event.target.value, DEFAULT_MILESTONE, 1, MAX_MILESTONE))
                      }
                      className="h-9 w-28"
                    />
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {ordinal(milestone)} birthday · 1–{MAX_MILESTONE}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Planets shown
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAllPlanets(true)}
                        className="text-[11px] font-bold text-violet-600 hover:underline dark:text-violet-300"
                      >
                        All
                      </button>
                      <span className="text-[11px] text-slate-300 dark:text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={() => setAllPlanets(false)}
                        className="text-[11px] font-bold text-violet-600 hover:underline dark:text-violet-300"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PLANETS.map((planet) => (
                      <ChipButton
                        key={planet.id}
                        active={enabled[planet.id]}
                        onClick={() => togglePlanet(planet.id)}
                        title={`Toggle ${planet.name}`}
                      >
                        <span
                          className="size-2.5 rounded-full"
                          style={{ background: planet.accent.mid }}
                          aria-hidden="true"
                        />
                        {planet.name}
                      </ChipButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <ToggleRow
                    id="planet-age-facts"
                    label="Planet fun facts"
                    hint="Show a short astronomy fact inside every planet card."
                    checked={showFacts}
                    onCheckedChange={setShowFacts}
                  />
                  <ToggleRow
                    id="planet-age-weight-module"
                    label="Weight & jump module"
                    hint="See what you would weigh and how high you could jump on each world."
                    checked={showWeight}
                    onCheckedChange={setShowWeight}
                  />
                </div>

                {showWeight ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-2 gap-3 overflow-hidden"
                  >
                    <Field
                      label={`Weight (${units === UNITS.IMPERIAL ? "lb" : "kg"})`}
                      htmlFor="planet-age-weight"
                    >
                      <Input
                        id="planet-age-weight"
                        type="number"
                        min={0}
                        step="0.1"
                        inputMode="decimal"
                        value={weightInput}
                        onChange={(event) => setWeightInput(event.target.value)}
                        placeholder={units === UNITS.IMPERIAL ? "e.g. 155" : "e.g. 70"}
                        className="h-10"
                      />
                    </Field>
                    <Field
                      label={`Earth jump (${units === UNITS.IMPERIAL ? "in" : "cm"})`}
                      htmlFor="planet-age-jump"
                    >
                      <Input
                        id="planet-age-jump"
                        type="number"
                        min={0}
                        step="0.5"
                        inputMode="decimal"
                        value={jumpInput}
                        onChange={(event) => setJumpInput(event.target.value)}
                        placeholder={units === UNITS.IMPERIAL ? "e.g. 20" : "e.g. 50"}
                        className="h-10"
                      />
                    </Field>
                  </motion.div>
                ) : null}

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    Private by design — nothing leaves your device.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="size-3.5" />
                    Reset
                  </Button>
                </div>
              </div>
            </SectionCard>
          </aside>

          {/* ── Results column ── */}
          <div className="space-y-8 lg:col-span-8">
            {!hasInput ? (
              <EmptyState onPreset={handlePreset} />
            ) : !isReady ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 dark:border-rose-500/30 dark:bg-rose-500/10">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-500" />
                  <div>
                    <h2 className="text-sm font-bold text-rose-700 dark:text-rose-300">
                      We can&apos;t read that date yet
                    </h2>
                    <p className="mt-1 text-sm text-rose-600/90 dark:text-rose-200/80">
                      {validation.ok ? "Something looks off." : validation.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <ResultHero report={report} name={name} planets={visiblePlanets} />
            )}

            {isReady ? (
              <>
                <section className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                        <Orbit className="size-5 text-violet-500" />
                        Your age on every world
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {visiblePlanets.length} of {PLANET_IDS.length} worlds selected ·{" "}
                        {formatNumber(report.calendarYears, 1)} Earth years old
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={handleCopySummary}>
                        <Copy className="size-3.5" />
                        Copy summary
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleCopyLink}>
                        <Link2 className="size-3.5" />
                        Share link
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleDownloadCSV}>
                        <FileSpreadsheet className="size-3.5" />
                        CSV
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleDownloadJSON}>
                        <FileJson className="size-3.5" />
                        JSON
                      </Button>
                      <Button type="button" size="sm" onClick={handleDownloadCard}>
                        <ImageDown className="size-3.5" />
                        PNG card
                      </Button>
                    </div>
                  </div>

                  {visiblePlanets.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                      <Orbit className="mx-auto size-8 text-slate-300 dark:text-slate-600" />
                      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Every planet is switched off — turn at least one back on to see your cosmic
                        ages.
                      </p>
                      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setAllPlanets(true)}>
                        Select all planets
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {visiblePlanets.map((planet, index) => (
                        <PlanetCard key={planet.id} planet={planet} settings={settings} index={index} />
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div
                      role="tablist"
                      aria-label="Report views"
                      className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === "table"}
                        onClick={() => setTab("table")}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
                          tab === "table"
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                      >
                        <Table2 className="size-3.5" />
                        Comparison table
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === "milestones"}
                        onClick={() => setTab("milestones")}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
                          tab === "milestones"
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                      >
                        <Trophy className="size-3.5" />
                        Milestone planner
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tracking your {ordinal(milestone)} planetary birthday on every selected world.
                    </p>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tab === "table" ? (
                        <ComparisonTable
                          planets={visiblePlanets}
                          settings={settings}
                          earthDays={report.earthDays}
                        />
                      ) : (
                        <MilestoneGrid planets={visiblePlanets} settings={settings} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </section>

                <p className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-sky-500" />
                  Orbital periods are mean sidereal values from NASA planetary fact sheets, and
                  ages assume a constant orbital rate — perfect for fun, not for mission planning.
                  Heartbeat, breath and sleep figures are friendly estimates.
                </p>
              </>
            ) : hasInput ? null : (
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Sparkles className="size-4 text-violet-500" />
                  What you&apos;ll get
                </h2>
                <ul className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                  <li className="flex items-start gap-2">
                    <Orbit className="mt-0.5 size-3.5 shrink-0 text-violet-400" />
                    Exact age in planet years on nine worlds
                  </li>
                  <li className="flex items-start gap-2">
                    <Trophy className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                    Next planetary birthday with a live countdown
                  </li>
                  <li className="flex items-start gap-2">
                    <Scale className="mt-0.5 size-3.5 shrink-0 text-sky-400" />
                    Optional weight & jump comparison on every planet
                  </li>
                  <li className="flex items-start gap-2">
                    <ImageDown className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                    Share link, PNG card, CSV and JSON exports
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <FaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />
      </div>
    </ToolPageShell>
  );
}
