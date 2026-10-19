"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Cake,
  CalendarDays,
  Cat,
  Check,
  ChevronDown,
  Copy,
  Dog,
  FileJson,
  FileSpreadsheet,
  Footprints,
  HeartPulse,
  ImageDown,
  Info,
  Link2,
  PawPrint,
  RefreshCw,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Table2,
} from "lucide-react";
import { toast } from "sonner";

import ToolPageShell from "../../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { ComparisonTable, FactList, LifeStageGuide, MilestoneTable, StatGrid } from "./PetViews";
import {
  CAT_LIFESTYLE_OPTIONS,
  CAT_LIFESTYLES,
  DECIMAL_OPTIONS,
  DOG_SIZE_OPTIONS,
  DOG_SIZES,
  KG_TO_LB,
  LB_TO_KG,
  METHODS,
  PET_FAQS,
  PET_TYPES,
  STORAGE_KEY,
  UNITS,
  addMonthsClamped,
  buildCSV,
  buildJSON,
  buildShareText,
  buildShareUrl,
  classifyDogSize,
  computePetReport,
  formatDateUTC,
  formatDayCount,
  formatNumber,
  formatWeight,
  formatYearsMonths,
  parseISODate,
  toISODate,
  todayISO,
  validatePetInput,
} from "./petData";
import { copyText, downloadPetCard, downloadText } from "./petShare";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const TOOL_META = {
  title: "Dog & Cat Age Calculator",
  link: "/tools/dog-cat-age-calculator",
  description:
    "Convert your dog or cat's age into human years with size-aware charts, life stages and lifespan estimates.",
  icon: "PawPrint",
  categories: ["Fun", "Calculator"],
};

const DEFAULT_DECIMALS = 1;
const MAX_NAME_LENGTH = 30;
const MAX_WEIGHT_KG = 150;

const QUICK_PRESETS = [
  {
    id: "puppy",
    label: "8-week puppy",
    type: PET_TYPES.DOG,
    size: DOG_SIZES.MEDIUM,
    months: 2,
  },
  {
    id: "kitten",
    label: "8-week kitten",
    type: PET_TYPES.CAT,
    lifestyle: CAT_LIFESTYLES.INDOOR,
    months: 2,
  },
  {
    id: "adultDog",
    label: "3-year-old dog",
    type: PET_TYPES.DOG,
    size: DOG_SIZES.LARGE,
    months: 36,
  },
  {
    id: "seniorCat",
    label: "12-year-old cat",
    type: PET_TYPES.CAT,
    lifestyle: CAT_LIFESTYLES.INDOOR,
    months: 144,
  },
];

const METHOD_OPTIONS = [
  {
    id: METHODS.MODERN,
    label: "Size-aware",
    hint: "Recommended: 15 human years in year one, 9 more in year two, then 4–7 per year depending on size.",
  },
  {
    id: METHODS.CLASSIC,
    label: "Classic 7×",
    hint: "The traditional shortcut — every pet year counts as seven human years.",
  },
  {
    id: METHODS.CUSTOM,
    label: "Custom",
    hint: "Set your own multiplier, from 0.5 to 15 human years per pet year.",
  },
];

const clampInt = (value, fallback, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const clampFloat = (value, fallback, min, max) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const round1 = (value) => Math.round(value * 10) / 10;

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
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
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
          ? "border-amber-300 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200"
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
        <Label
          htmlFor={id}
          className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          {label}
        </Label>
        {hint ? (
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>
        ) : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero + decorative pieces
// ─────────────────────────────────────────────────────────────────────────────
function ProgressRing({ percent, stageLabel, caption }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, percent || 0));
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="14"
          />
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped)}
            style={{ transition: "stroke-dashoffset 900ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white">{Math.round(clamped * 100)}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
            life lived
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-white">{stageLabel} stage</p>
        <p className="text-[11px] text-white/70">{caption}</p>
      </div>
    </div>
  );
}

function EmptyState({ onPreset }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-500/10" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-500/10" />
      <div className="relative">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30">
          <PawPrint className="size-9" />
        </div>
        <h2 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          How old is your dog or cat in human years?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Add a birthday to see the human-age equivalent, life stage, expected lifespan, next
          birthday, milestone dates and playful lifetime statistics — for dogs and cats alike.
        </p>
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Or start with a typical pet
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {QUICK_PRESETS.map((preset) => (
              <ChipButton key={preset.id} onClick={() => onPreset(preset)}>
                {preset.label}
              </ChipButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultHero({ report, name, decimals, showStats }) {
  const label = name?.trim() || (report.type === PET_TYPES.DOG ? "Your dog" : "Your cat");
  const typeLabel =
    report.type === PET_TYPES.DOG
      ? `${report.size.label.toLowerCase()} dog`
      : `${report.lifestyle.label.toLowerCase()} cat`;

  return (
    <div
      data-testid="pet-hero"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-2xl sm:p-8"
    >
      <PawPrint className="pointer-events-none absolute -right-6 -top-8 size-40 rotate-12 text-white/10" />
      <PawPrint className="pointer-events-none absolute right-24 top-28 size-14 -rotate-12 text-white/10" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div aria-live="polite">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
            <PawPrint className="size-3" />
            Pet age report
          </span>
          <p className="mt-4 text-sm font-medium text-white/85">{label} is about</p>
          <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="text-5xl font-black tracking-tight sm:text-6xl">
              {formatNumber(report.human.years, decimals)}
            </span>
            <span className="pb-2 text-lg font-bold text-white/90">human years old</span>
          </div>
          <p className="mt-2 text-sm text-white/80">
            {formatYearsMonths(report.petAge)} as a {typeLabel} ·{" "}
            {formatNumber(report.petAge.totalDays, 0)} days alive
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-semibold">
              <Cake className="size-3.5 text-amber-100" />
              Born {formatDateUTC(report.dob)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-semibold">
              <CalendarDays className="size-3.5 text-amber-100" />
              {report.birthday.isToday ? (
                "Birthday today — happy birthday!"
              ) : (
                <>
                  Next birthday {formatDateUTC(report.birthday.date)}
                  <span className="font-medium text-white/60">
                    ({formatDayCount(report.birthday.days)})
                  </span>
                </>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-semibold">
              <HeartPulse className="size-3.5 text-amber-100" />
              Typical lifespan {formatNumber(report.lifespan.min, 1)}–
              {formatNumber(report.lifespan.max, 1)} yrs
              {!report.pastTypical ? (
                <span className="font-medium text-white/60">
                  · ~{formatNumber(report.remainingYears, 1)} yrs typical remaining
                </span>
              ) : (
                <span className="font-medium text-white/60">· already beyond the typical range</span>
              )}
            </span>
            {report.together ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-semibold">
                <PawPrint className="size-3.5 text-amber-100" />
                Together {report.together.label}
              </span>
            ) : null}
            {report.method !== METHODS.CLASSIC ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-semibold">
                <Sparkles className="size-3.5 text-amber-100" />
                Classic 7× rule would say {formatNumber(report.humanClassic, decimals)} yrs
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <ProgressRing
            percent={report.lifespanPercent}
            stageLabel={report.stage.label}
            caption={`${formatNumber(report.lifespan.min, 1)}–${formatNumber(
              report.lifespan.max,
              1
            )} yr typical lifespan`}
          />
        </div>
      </div>

      {showStats ? (
        <div className="relative mt-7">
          <StatGrid stats={report.stats} tone="dark" />
        </div>
      ) : null}
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
          How dog and cat ages, life stages and lifespan estimates are calculated.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {PET_FAQS.map((faq, index) => {
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
              {open ? (
                <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {faq.a}
                </p>
              ) : null}
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
export default function DogCatAgeCalculator() {
  const [hydrated, setHydrated] = useState(false);
  const [type, setType] = useState(PET_TYPES.DOG);
  const [dogSize, setDogSize] = useState(DOG_SIZES.MEDIUM);
  const [catLifestyle, setCatLifestyle] = useState(CAT_LIFESTYLES.INDOOR);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gotcha, setGotcha] = useState("");
  const [asOf, setAsOf] = useState("");
  const [method, setMethod] = useState(METHODS.MODERN);
  const [customFactor, setCustomFactor] = useState("7");
  const [lifespanOverride, setLifespanOverride] = useState("");
  const [units, setUnits] = useState(UNITS.METRIC);
  const [decimals, setDecimals] = useState(DEFAULT_DECIMALS);
  const [weightInput, setWeightInput] = useState("");
  const [showFacts, setShowFacts] = useState(true);
  const [showCompare, setShowCompare] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [tab, setTab] = useState("stages");
  const [openFaq, setOpenFaq] = useState(0);
  const [todayValue, setTodayValue] = useState(null);
  const [agePanelOpen, setAgePanelOpen] = useState(false);
  const [ageYears, setAgeYears] = useState("3");
  const [ageMonths, setAgeMonths] = useState("0");
  const initializedRef = useRef(false);

  // ── Restore from localStorage + URL params (URL wins), once on mount ──
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let stored = {};
    try {
      stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      stored = {};
    }

    const params = new URLSearchParams(window.location.search);
    const sizeIds = DOG_SIZE_OPTIONS.map((option) => option.id);
    const lifestyleIds = CAT_LIFESTYLE_OPTIONS.map((option) => option.id);

    const urlType = params.get("t");
    const nextType =
      urlType === PET_TYPES.CAT || urlType === PET_TYPES.DOG
        ? urlType
        : stored.type === PET_TYPES.CAT
          ? PET_TYPES.CAT
          : PET_TYPES.DOG;

    const urlSize = params.get("s");
    const nextSize = sizeIds.includes(urlSize)
      ? urlSize
      : sizeIds.includes(stored.dogSize)
        ? stored.dogSize
        : DOG_SIZES.MEDIUM;

    const urlLifestyle = params.get("l");
    const nextLifestyle = lifestyleIds.includes(urlLifestyle)
      ? urlLifestyle
      : lifestyleIds.includes(stored.catLifestyle)
        ? stored.catLifestyle
        : CAT_LIFESTYLES.INDOOR;

    const urlDob = params.get("dob");
    const nextDob = parseISODate(urlDob)
      ? urlDob
      : typeof stored.dob === "string"
        ? stored.dob
        : "";

    const urlAsOf = params.get("as");
    const nextAsOf = parseISODate(urlAsOf)
      ? urlAsOf
      : typeof stored.asOf === "string" && stored.asOf
        ? stored.asOf
        : todayISO();

    const urlGotcha = params.get("g");
    const nextGotcha = parseISODate(urlGotcha)
      ? urlGotcha
      : typeof stored.gotcha === "string"
        ? stored.gotcha
        : "";

    const urlName = params.get("n");
    const nextName = String(urlName ?? stored.name ?? "").slice(0, MAX_NAME_LENGTH);

    const nextUnits =
      params.get("u") === "i" ? UNITS.IMPERIAL : stored.units === UNITS.IMPERIAL ? UNITS.IMPERIAL : UNITS.METRIC;

    const nextDecimals = params.has("d")
      ? clampInt(params.get("d"), DEFAULT_DECIMALS, 0, 2)
      : clampInt(stored.decimals, DEFAULT_DECIMALS, 0, 2);

    const urlMethod = params.get("m");
    const nextMethod = Object.values(METHODS).includes(urlMethod)
      ? urlMethod
      : Object.values(METHODS).includes(stored.method)
        ? stored.method
        : METHODS.MODERN;

    const nextFactor = params.has("f")
      ? clampFloat(params.get("f"), 7, 0.5, 15)
      : clampFloat(stored.customFactor, 7, 0.5, 15);

    let nextLifespan = "";
    if (params.has("e")) {
      const parsed = Number.parseFloat(params.get("e"));
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 30) {
        nextLifespan = String(round1(parsed));
      }
    } else if (
      stored.lifespanOverride !== undefined &&
      stored.lifespanOverride !== null &&
      stored.lifespanOverride !== ""
    ) {
      const parsed = Number.parseFloat(stored.lifespanOverride);
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 30) {
        nextLifespan = String(round1(parsed));
      }
    }

    let nextWeightInput =
      typeof stored.weightInput === "string" ? stored.weightInput : "";
    if (params.has("w")) {
      const parsedKg = Number.parseFloat(params.get("w"));
      if (Number.isFinite(parsedKg) && parsedKg > 0) {
        nextWeightInput = String(
          round1(nextUnits === UNITS.IMPERIAL ? parsedKg * KG_TO_LB : parsedKg)
        );
      }
    }

    const nextShowFacts = params.get("ff") !== "0" && stored.showFacts !== false;
    const nextShowCompare = params.get("cmp") !== "0" && stored.showCompare !== false;
    const nextShowStats = params.get("st") !== "0" && stored.showStats !== false;

    setType(nextType);
    setDogSize(nextSize);
    setCatLifestyle(nextLifestyle);
    setDob(nextDob);
    setAsOf(nextAsOf);
    setGotcha(nextGotcha);
    setName(nextName);
    setUnits(nextUnits);
    setDecimals(nextDecimals);
    setMethod(nextMethod);
    setCustomFactor(String(nextFactor));
    setLifespanOverride(nextLifespan);
    setWeightInput(nextWeightInput);
    setShowFacts(nextShowFacts);
    setShowCompare(nextShowCompare);
    setShowStats(nextShowStats);
    setTodayValue(todayISO());
    setHydrated(true);

    if (urlDob && !parseISODate(urlDob)) {
      toast.error("That share link's birthday isn't a valid date.");
    } else if (urlDob) {
      toast.success("Shared pet report loaded — tweak anything to make it yours.");
    }
  }, []);

  // ── Persist preferences ──
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          type,
          dogSize,
          catLifestyle,
          name,
          dob,
          gotcha,
          asOf,
          method,
          customFactor,
          lifespanOverride,
          units,
          decimals,
          weightInput,
          showFacts,
          showCompare,
          showStats,
        })
      );
    } catch {
      // Storage can be unavailable in private mode — the tool still works.
    }
  }, [
    hydrated,
    type,
    dogSize,
    catLifestyle,
    name,
    dob,
    gotcha,
    asOf,
    method,
    customFactor,
    lifespanOverride,
    units,
    decimals,
    weightInput,
    showFacts,
    showCompare,
    showStats,
  ]);

  // ── Derived values ──
  const parsedWeight = Number.parseFloat(weightInput);
  const weightKg = useMemo(() => {
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) return null;
    const kg = units === UNITS.IMPERIAL ? parsedWeight * LB_TO_KG : parsedWeight;
    if (kg < 0.3 || kg > MAX_WEIGHT_KG) return null;
    return kg;
  }, [parsedWeight, units]);

  const weightHint = useMemo(() => {
    if (!weightInput.trim()) return undefined;
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      return "Enter a positive number, or leave it blank.";
    }
    if (!weightKg) {
      return `Enter a weight between 0.3 and ${MAX_WEIGHT_KG} kg (about 330 lb).`;
    }
    return undefined;
  }, [weightInput, parsedWeight, weightKg]);

  const suggestedSize = useMemo(
    () => (type === PET_TYPES.DOG ? classifyDogSize(weightKg) : null),
    [type, weightKg]
  );

  const validation = useMemo(
    () =>
      validatePetInput({
        dobValue: dob,
        asOfValue: asOf,
        method,
        customFactor,
        lifespanOverride,
      }),
    [dob, asOf, method, customFactor, lifespanOverride]
  );

  const hasInput = Boolean(dob);
  const dobError = hasInput && !validation.ok && validation.field === "dob" ? validation.message : "";
  const asOfError = !validation.ok && validation.field === "asOf" ? validation.message : "";
  const factorError = !validation.ok && validation.field === "factor" ? validation.message : "";
  const lifespanError =
    !validation.ok && validation.field === "lifespan" ? validation.message : "";

  const report = useMemo(() => {
    if (!hasInput) return null;
    return computePetReport({
      type,
      dogSize,
      catLifestyle,
      dobValue: dob,
      asOfValue: asOf,
      gotchaValue: gotcha,
      method,
      customFactor,
      lifespanOverride,
      weightKg,
    });
  }, [
    hasInput,
    type,
    dogSize,
    catLifestyle,
    dob,
    asOf,
    gotcha,
    method,
    customFactor,
    lifespanOverride,
    weightKg,
  ]);

  const isReady = Boolean(report?.ok);
  const selectedSize =
    DOG_SIZE_OPTIONS.find((option) => option.id === dogSize) || DOG_SIZE_OPTIONS[1];
  const selectedLifestyle =
    CAT_LIFESTYLE_OPTIONS.find((option) => option.id === catLifestyle) ||
    CAT_LIFESTYLE_OPTIONS[0];
  const defaultLifespan = type === PET_TYPES.DOG ? selectedSize.lifespan : selectedLifestyle.lifespan;
  const weightUnitLabel = units === UNITS.IMPERIAL ? "lb" : "kg";

  // ── Handlers ──
  const handlePreset = (preset) => {
    const base = parseISODate(asOf) || parseISODate(todayISO());
    const baseISO = toISODate(base);
    setType(preset.type);
    if (preset.size) setDogSize(preset.size);
    if (preset.lifestyle) setCatLifestyle(preset.lifestyle);
    setAsOf(baseISO);
    setDob(toISODate(addMonthsClamped(base, -preset.months)));
    setGotcha("");
    setAgePanelOpen(false);
  };

  const handleUseEstimatedAge = () => {
    const years = clampInt(ageYears, 0, 0, 40);
    const months = clampInt(ageMonths, 0, 0, 11);
    if (years === 0 && months === 0) {
      toast.error("Enter an age of at least one month.");
      return;
    }
    const base = parseISODate(asOf) || parseISODate(todayISO());
    const estimate = addMonthsClamped(base, -(years * 12 + months));
    setAsOf(toISODate(base));
    setDob(toISODate(estimate));
    const parsedGotcha = parseISODate(gotcha);
    if (parsedGotcha && parsedGotcha < estimate) setGotcha("");
    setAgePanelOpen(false);
    toast.success("Estimated birthday applied — fine-tune the exact date any time.");
  };

  const handleUnitsChange = (nextUnit) => {
    if (nextUnit === units) return;
    setUnits(nextUnit);
    if (Number.isFinite(parsedWeight) && parsedWeight > 0) {
      const converted =
        nextUnit === UNITS.IMPERIAL ? parsedWeight * KG_TO_LB : parsedWeight * LB_TO_KG;
      setWeightInput(String(round1(converted)));
    }
  };

  const handleReset = () => {
    setType(PET_TYPES.DOG);
    setDogSize(DOG_SIZES.MEDIUM);
    setCatLifestyle(CAT_LIFESTYLES.INDOOR);
    setName("");
    setDob("");
    setGotcha("");
    setAsOf(todayISO());
    setMethod(METHODS.MODERN);
    setCustomFactor("7");
    setLifespanOverride("");
    setUnits(UNITS.METRIC);
    setDecimals(DEFAULT_DECIMALS);
    setWeightInput("");
    setShowFacts(true);
    setShowCompare(true);
    setShowStats(true);
    setTab("stages");
    setAgePanelOpen(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
    toast.success("Everything is back to the defaults.");
  };

  const handleCopySummary = async () => {
    if (!isReady) return;
    const copied = await copyText(buildShareText(report, { name, units, decimals }));
    if (copied) toast.success("Pet age summary copied to the clipboard.");
    else toast.error("Copying failed — your browser blocked clipboard access.");
  };

  const handleCopyLink = async () => {
    if (!isReady) return;
    const url = buildShareUrl({
      type: report.type,
      dogSize: report.dogSize,
      catLifestyle: report.catLifestyle,
      dob: toISODate(report.dob),
      gotcha: report.gotcha ? toISODate(report.gotcha) : "",
      asOf: toISODate(report.asOf),
      name,
      method,
      customFactor,
      lifespanOverride,
      units,
      decimals,
      weightKg: report.weightKg,
      showFacts,
      showCompare,
      showStats,
    });
    const copied = await copyText(url);
    if (copied) toast.success("Share link copied — it restores every setting.");
    else toast.error("Copying failed — your browser blocked clipboard access.");
  };

  const handleDownloadCSV = () => {
    if (!isReady) return;
    try {
      const filename = `toolstrek-pet-age-${toISODate(report.asOf)}.csv`;
      downloadText(filename, buildCSV(report, { name, units, decimals }), "text/csv;charset=utf-8");
      toast.success(`CSV saved as ${filename}`);
    } catch {
      toast.error("The CSV could not be downloaded in this browser.");
    }
  };

  const handleDownloadJSON = () => {
    if (!isReady) return;
    try {
      const filename = `toolstrek-pet-age-${toISODate(report.asOf)}.json`;
      downloadText(filename, buildJSON(report, { name, units, decimals }), "application/json");
      toast.success(`JSON saved as ${filename}`);
    } catch {
      toast.error("The JSON file could not be downloaded in this browser.");
    }
  };

  const handleDownloadCard = async () => {
    if (!isReady) return;
    try {
      const filename = await downloadPetCard(report, { name, units, decimals });
      toast.success(`Report card saved as ${filename}`);
    } catch {
      toast.error("The PNG card could not be generated in this browser.");
    }
  };

  // ── Render ──
  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="mx-auto w-full max-w-7xl">
        {/* Tool header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              <PawPrint className="size-3" />
              Fun · Pet calculator
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Dog &amp; Cat Age Calculator
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Convert your dog or cat&apos;s real age into human years with the size-aware chart, then
              explore their life stage, typical lifespan, next birthday, milestone dates and fun
              lifetime statistics. Fully customisable — with share links, a branded PNG card, CSV
              and JSON export, all 100% in your browser.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton tool={TOOL_META} />
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* ── Settings column ── */}
          <aside className="min-w-0 space-y-6 lg:col-span-4">
            <SectionCard title="Your pet" icon={PawPrint}>
              <div className="space-y-4">
                <Field
                  label="Pet name (optional)"
                  hint="Adds a personal touch to the report card and share text."
                  htmlFor="pet-name"
                >
                  <Input
                    id="pet-name"
                    type="text"
                    value={name}
                    maxLength={MAX_NAME_LENGTH}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Bella"
                    autoComplete="off"
                    className="h-10"
                  />
                </Field>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Pet type
                  </p>
                  <SegmentedControl
                    ariaLabel="Pet type"
                    value={type}
                    onChange={setType}
                    options={[
                      { value: PET_TYPES.DOG, label: "Dog", icon: Dog },
                      { value: PET_TYPES.CAT, label: "Cat", icon: Cat },
                    ]}
                  />
                </div>

                {type === PET_TYPES.DOG ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Adult size
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {DOG_SIZE_OPTIONS.map((size) => {
                        const active = dogSize === size.id;
                        return (
                          <button
                            key={size.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setDogSize(size.id)}
                            className={cn(
                              "rounded-2xl border px-3 py-2.5 text-left transition-all",
                              active
                                ? "border-amber-300 bg-amber-50 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10"
                                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-600"
                            )}
                          >
                            <span
                              className={cn(
                                "block text-xs font-bold",
                                active
                                  ? "text-amber-700 dark:text-amber-300"
                                  : "text-slate-700 dark:text-slate-200"
                              )}
                            >
                              {size.label}
                            </span>
                            <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              {units === UNITS.IMPERIAL ? size.rangeImperial : size.range}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                      Examples: {selectedSize.examples}
                    </p>

                    <Field
                      label={`Weight (optional, ${weightUnitLabel})`}
                      hint={
                        weightHint ||
                        "Add a weight and we'll suggest the right size class automatically."
                      }
                      htmlFor="pet-weight"
                    >
                      <div className="flex gap-2">
                        <Input
                          id="pet-weight"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.1"
                          value={weightInput}
                          onChange={(event) => setWeightInput(event.target.value)}
                          placeholder={units === UNITS.IMPERIAL ? "e.g. 40" : "e.g. 18"}
                          className="h-10 flex-1"
                        />
                        <span className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                          {weightUnitLabel}
                        </span>
                      </div>
                    </Field>

                    {suggestedSize && suggestedSize !== dogSize && weightKg ? (
                      <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-500/30 dark:bg-amber-500/10">
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                        <p className="flex-1 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                          At {formatWeight(weightKg, units)}, your dog usually counts as a{" "}
                          <strong>
                            {DOG_SIZE_OPTIONS.find((option) => option.id === suggestedSize)?.label.toLowerCase()}
                          </strong>{" "}
                          breed.
                        </p>
                        <button
                          type="button"
                          onClick={() => setDogSize(suggestedSize)}
                          className="shrink-0 text-xs font-bold text-amber-700 underline decoration-amber-400 underline-offset-2 dark:text-amber-300"
                        >
                          Apply
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Lifestyle
                    </p>
                    <div className="space-y-2">
                      {CAT_LIFESTYLE_OPTIONS.map((lifestyle) => {
                        const active = catLifestyle === lifestyle.id;
                        return (
                          <button
                            key={lifestyle.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setCatLifestyle(lifestyle.id)}
                            className={cn(
                              "w-full rounded-2xl border px-3.5 py-2.5 text-left transition-all",
                              active
                                ? "border-amber-300 bg-amber-50 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10"
                                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-600"
                            )}
                          >
                            <span
                              className={cn(
                                "block text-xs font-bold",
                                active
                                  ? "text-amber-700 dark:text-amber-300"
                                  : "text-slate-700 dark:text-slate-200"
                              )}
                            >
                              {lifestyle.label}
                            </span>
                            <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              {lifestyle.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Field
                  label="Birthday"
                  htmlFor="pet-dob"
                  error={dobError}
                  hint={!dobError ? "Everything is calculated from this date, in your local calendar." : undefined}
                >
                  <Input
                    id="pet-dob"
                    type="date"
                    value={dob}
                    min="1950-01-01"
                    max={asOf || todayValue || undefined}
                    aria-invalid={Boolean(dobError)}
                    onChange={(event) => setDob(event.target.value)}
                    className="h-10 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </Field>

                <div>
                  <button
                    type="button"
                    onClick={() => setAgePanelOpen((open) => !open)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                  >
                    <Sparkles className="size-3" />
                    Not sure of the exact date? Estimate from age
                    <ChevronDown
                      className={cn("size-3 transition-transform", agePanelOpen && "rotate-180")}
                    />
                  </button>
                  {agePanelOpen ? (
                    <div className="mt-2.5 space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-950/40">
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        We&apos;ll work backwards from your &ldquo;as of&rdquo; date to build an
                        approximate birthday.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Years" htmlFor="pet-age-years">
                          <Input
                            id="pet-age-years"
                            type="number"
                            min="0"
                            max="40"
                            value={ageYears}
                            onChange={(event) => setAgeYears(event.target.value)}
                            className="h-10"
                          />
                        </Field>
                        <Field label="Months" htmlFor="pet-age-months">
                          <Input
                            id="pet-age-months"
                            type="number"
                            min="0"
                            max="11"
                            value={ageMonths}
                            onChange={(event) => setAgeMonths(event.target.value)}
                            className="h-10"
                          />
                        </Field>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleUseEstimatedAge}
                        className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600"
                      >
                        <Sparkles className="size-3.5" />
                        Use estimated birthday
                      </Button>
                    </div>
                  ) : null}
                </div>

                <Field
                  label="Gotcha day (optional)"
                  htmlFor="pet-gotcha"
                  error={report?.gotchaError || ""}
                  hint={
                    !report?.gotchaError
                      ? "The day you adopted or brought them home — we'll track your time together."
                      : undefined
                  }
                >
                  <Input
                    id="pet-gotcha"
                    type="date"
                    value={gotcha}
                    min={dob || undefined}
                    max={asOf || todayValue || undefined}
                    aria-invalid={Boolean(report?.gotchaError)}
                    onChange={(event) => setGotcha(event.target.value)}
                    className="h-10 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </Field>

                <Field
                  label="Calculate as of"
                  htmlFor="pet-asof"
                  error={asOfError}
                  hint={
                    !asOfError
                      ? "Leave it on today — or move it forward to project future ages."
                      : undefined
                  }
                >
                  <div className="flex gap-2">
                    <Input
                      id="pet-asof"
                      type="date"
                      value={asOf}
                      min={dob || undefined}
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
              </div>
            </SectionCard>

            <SectionCard title="Customise the report" icon={SlidersHorizontal}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Conversion method
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {METHOD_OPTIONS.map((option) => (
                      <ChipButton
                        key={option.id}
                        active={method === option.id}
                        onClick={() => setMethod(option.id)}
                      >
                        {method === option.id ? <Check className="size-3" /> : null}
                        {option.label}
                      </ChipButton>
                    ))}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                    {METHOD_OPTIONS.find((option) => option.id === method)?.hint}
                  </p>
                </div>

                {method === METHODS.CUSTOM ? (
                  <Field
                    label="Human years per pet year"
                    htmlFor="pet-factor"
                    error={factorError}
                    hint={!factorError ? "Between 0.5 and 15 — the classic rule uses 7." : undefined}
                  >
                    <Input
                      id="pet-factor"
                      type="number"
                      min="0.5"
                      max="15"
                      step="0.5"
                      value={customFactor}
                      aria-invalid={Boolean(factorError)}
                      onChange={(event) => setCustomFactor(event.target.value)}
                      className="h-10"
                    />
                  </Field>
                ) : null}

                <Field
                  label="Expected lifespan (optional)"
                  htmlFor="pet-lifespan"
                  error={lifespanError}
                  hint={
                    !lifespanError
                      ? lifespanOverride
                        ? "Your estimate drives the life-lived percentage, remaining years and comparison."
                        : `Typical for a ${type === PET_TYPES.DOG ? selectedSize.label.toLowerCase() + " dog" : selectedLifestyle.label.toLowerCase() + " cat"}: ${formatNumber(
                            defaultLifespan.min,
                            1
                          )}–${formatNumber(defaultLifespan.max, 1)} years (about ${formatNumber(
                            defaultLifespan.avg,
                            1
                          )}).`
                      : undefined
                  }
                >
                  <div className="flex gap-2">
                    <Input
                      id="pet-lifespan"
                      type="number"
                      min="1"
                      max="30"
                      step="0.5"
                      value={lifespanOverride}
                      aria-invalid={Boolean(lifespanError)}
                      onChange={(event) => setLifespanOverride(event.target.value)}
                      placeholder={String(defaultLifespan.avg)}
                      className="h-10 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLifespanOverride("")}
                      disabled={!lifespanOverride}
                      className="h-10 shrink-0"
                    >
                      <RefreshCw className="size-3.5" />
                      Typical
                    </Button>
                  </div>
                </Field>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Units
                  </p>
                  <SegmentedControl
                    ariaLabel="Units"
                    value={units}
                    onChange={handleUnitsChange}
                    options={[
                      { value: UNITS.METRIC, label: "Metric (kg)", icon: Ruler },
                      { value: UNITS.IMPERIAL, label: "Imperial (lb)", icon: Ruler },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Decimal places
                  </p>
                  <div className="flex gap-2">
                    {DECIMAL_OPTIONS.map((option) => (
                      <ChipButton
                        key={option}
                        active={decimals === option}
                        onClick={() => setDecimals(option)}
                        title={`Show ${option} decimal places`}
                      >
                        {option}
                      </ChipButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <ToggleRow
                    id="pet-show-stats"
                    label="Lifetime statistics"
                    hint="Days, sleep hours, heartbeats, breaths and full moons."
                    checked={showStats}
                    onCheckedChange={setShowStats}
                  />
                  <ToggleRow
                    id="pet-show-facts"
                    label="Fun facts"
                    hint="A couple of curated facts for your species and size."
                    checked={showFacts}
                    onCheckedChange={setShowFacts}
                  />
                  <ToggleRow
                    id="pet-show-compare"
                    label="Dog vs cat comparison"
                    hint="The same age converted for every species and size."
                    checked={showCompare}
                    onCheckedChange={setShowCompare}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    Runs 100% in your browser
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
          <div className="min-w-0 space-y-8 lg:col-span-8">
            {isReady ? (
              <ResultHero report={report} name={name} decimals={decimals} showStats={showStats} />
            ) : hasInput ? (
              <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50/80 p-5 dark:border-rose-500/30 dark:bg-rose-500/10">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-500" />
                <div>
                  <h2 className="text-sm font-bold text-rose-700 dark:text-rose-300">
                    That date needs a second look
                  </h2>
                  <p className="mt-1 text-sm text-rose-600/90 dark:text-rose-200/80">
                    {validation.ok ? "Something looks off." : validation.message}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState onPreset={handlePreset} />
            )}

            {isReady ? (
              <>
                <section className="min-w-0 space-y-4">
                  <div className="flex flex-col gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                        <PawPrint className="size-5 text-amber-500" />
                        Your pet&apos;s age report
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {formatYearsMonths(report.petAge)} old ·{" "}
                        {formatNumber(report.human.years, decimals)} human years via{" "}
                        {report.human.methodLabel}
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
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleDownloadCard}
                        className="bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600"
                      >
                        <ImageDown className="size-3.5" />
                        PNG card
                      </Button>
                    </div>
                  </div>

                  {showFacts ? <FactList facts={report.facts} /> : null}
                </section>

                <section className="min-w-0 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div
                      role="tablist"
                      aria-label="Report views"
                      className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={tab === "stages"}
                        onClick={() => setTab("stages")}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
                          tab === "stages"
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                      >
                        <Footprints className="size-3.5" />
                        Life stages
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
                        <Cake className="size-3.5" />
                        Birthday milestones
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {report.stage.nextLabel
                        ? `${report.stage.nextLabel} in about ${formatNumber(report.stage.nextInYears, 1)} years`
                        : "Enjoying the golden years"}
                    </p>
                  </div>

                  {tab === "stages" ? (
                    <LifeStageGuide report={report} />
                  ) : (
                    <MilestoneTable report={report} decimals={decimals} />
                  )}
                </section>

                {showCompare ? (
                  <section className="min-w-0 space-y-4">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                      <Table2 className="size-5 text-amber-500" />
                      Same age, different species
                    </h2>
                    <ComparisonTable report={report} decimals={decimals} />
                  </section>
                ) : null}

                <p className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-sky-500" />
                  Pet-age charts are approximations based on published veterinary guidance, and every
                  pet is an individual. Lifespan ranges describe typical healthy pets, and heartbeat,
                  breath and sleep figures are friendly estimates — talk to your vet for health
                  decisions.
                </p>
              </>
            ) : hasInput ? null : (
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Sparkles className="size-4 text-amber-500" />
                  What you&apos;ll get
                </h2>
                <ul className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                  <li className="flex items-start gap-2">
                    <Dog className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                    Size-aware human age for dogs and lifestyle-aware cats
                  </li>
                  <li className="flex items-start gap-2">
                    <HeartPulse className="mt-0.5 size-3.5 shrink-0 text-rose-400" />
                    Life-stage guide with typical lifespan and remaining years
                  </li>
                  <li className="flex items-start gap-2">
                    <Cake className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
                    Next birthday countdown plus milestone birthdays
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
