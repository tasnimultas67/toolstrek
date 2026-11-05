/* -------------------------------------------------------------------------- */
/*  Baby Growth & Feeding — WHO-aligned reference tables and calculations.    */
/*  Values are monthly medians (M) and standard deviations (SD) for healthy   */
/*  children, interpolated linearly between months. Educational use only.     */
/* -------------------------------------------------------------------------- */

import { clamp, percentileFromZ } from "../_shared/toolkit/toolUtils";

export const GROWTH_STORAGE_KEY = "toolstrek_baby_growth_v1";

export const METRIC_OPTIONS = [
  { id: "weight", label: "Weight", unit: "kg", imperial: "lb" },
  { id: "length", label: "Length", unit: "cm", imperial: "in" },
  { id: "head", label: "Head circumference", unit: "cm", imperial: "in" },
];

const KG_TO_LB = 2.2046226218;
const CM_TO_IN = 0.3937007874;

function numeric(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function toDisplayWeight(kg, unit) {
  const value = numeric(kg);
  if (value === null) return null;
  return unit === "imperial" ? value * KG_TO_LB : value;
}

export function toKg(value, unit) {
  const number = numeric(value);
  if (number === null) return null;
  return unit === "imperial" ? number / KG_TO_LB : number;
}

export function toDisplayLength(cm, unit) {
  const value = numeric(cm);
  if (value === null) return null;
  return unit === "imperial" ? value * CM_TO_IN : value;
}

export function toCm(value, unit) {
  const number = numeric(value);
  if (number === null) return null;
  return unit === "imperial" ? number / CM_TO_IN : number;
}

export function weightUnit(unit) {
  return unit === "imperial" ? "lb" : "kg";
}

export function lengthUnit(unit) {
  return unit === "imperial" ? "in" : "cm";
}

export function formatWeight(kg, unit, digits = 2) {
  const value = toDisplayWeight(kg, unit);
  if (value === null) return "—";
  return `${value.toFixed(digits)} ${weightUnit(unit)}`;
}

export function formatLength(cm, unit, digits = 1) {
  const value = toDisplayLength(cm, unit);
  if (value === null) return "—";
  return `${value.toFixed(digits)} ${lengthUnit(unit)}`;
}

/* ------------------------------- WHO tables ------------------------------- */

function table(rows) {
  return rows.map(([m, sd]) => ({ m, sd }));
}

const BOYS = {
  weight: table([
    [3.3, 0.45], [4.5, 0.55], [5.6, 0.65], [6.4, 0.72], [7.0, 0.78],
    [7.5, 0.82], [7.9, 0.86], [8.3, 0.9], [8.6, 0.94], [8.9, 0.97],
    [9.2, 1.0], [9.4, 1.03], [9.6, 1.06], [9.9, 1.09], [10.1, 1.11],
    [10.3, 1.14], [10.5, 1.16], [10.7, 1.18], [10.9, 1.2], [11.1, 1.22],
    [11.3, 1.24], [11.5, 1.26], [11.8, 1.28], [12.0, 1.3], [12.2, 1.32],
  ]),
  length: table([
    [49.9, 1.9], [54.7, 1.9], [58.4, 2.0], [61.4, 2.0], [63.9, 2.1],
    [65.9, 2.1], [67.6, 2.2], [69.2, 2.2], [70.6, 2.2], [72.0, 2.3],
    [73.3, 2.3], [74.5, 2.4], [75.7, 2.4], [76.7, 2.5], [77.7, 2.5],
    [78.7, 2.6], [79.7, 2.6], [80.7, 2.7], [81.7, 2.7], [82.7, 2.8],
    [83.6, 2.8], [84.5, 2.9], [85.3, 2.9], [86.2, 3.0], [87.1, 3.0],
  ]),
  head: table([
    [34.5, 1.5], [37.3, 1.3], [39.1, 1.2], [40.5, 1.2], [41.6, 1.1],
    [42.6, 1.1], [43.3, 1.1], [44.0, 1.1], [44.5, 1.1], [45.0, 1.1],
    [45.4, 1.1], [45.8, 1.1], [46.1, 1.1], [46.3, 1.1], [46.6, 1.1],
    [46.8, 1.1], [47.0, 1.1], [47.2, 1.1], [47.4, 1.1], [47.5, 1.1],
    [47.7, 1.1], [47.8, 1.1], [48.0, 1.1], [48.1, 1.1], [48.3, 1.1],
  ]),
};

const GIRLS = {
  weight: table([
    [3.2, 0.42], [4.2, 0.52], [5.1, 0.6], [5.8, 0.66], [6.4, 0.72],
    [6.9, 0.76], [7.3, 0.8], [7.6, 0.84], [7.9, 0.88], [8.2, 0.91],
    [8.5, 0.94], [8.7, 0.97], [8.9, 1.0], [9.2, 1.03], [9.4, 1.06],
    [9.6, 1.08], [9.8, 1.1], [10.0, 1.12], [10.2, 1.14], [10.4, 1.16],
    [10.6, 1.18], [10.9, 1.2], [11.1, 1.22], [11.3, 1.24], [11.5, 1.26],
  ]),
  length: table([
    [49.1, 1.9], [53.7, 1.9], [57.1, 2.0], [59.8, 2.0], [62.1, 2.1],
    [64.0, 2.1], [65.7, 2.2], [67.3, 2.2], [68.7, 2.2], [70.1, 2.3],
    [71.5, 2.3], [72.8, 2.4], [74.0, 2.4], [75.2, 2.5], [76.4, 2.5],
    [77.5, 2.6], [78.6, 2.6], [79.7, 2.7], [80.7, 2.7], [81.7, 2.8],
    [82.7, 2.8], [83.7, 2.9], [84.6, 2.9], [85.5, 3.0], [86.4, 3.0],
  ]),
  head: table([
    [33.9, 1.4], [36.5, 1.2], [38.3, 1.2], [39.5, 1.1], [40.6, 1.1],
    [41.5, 1.1], [42.2, 1.1], [42.8, 1.1], [43.4, 1.1], [43.8, 1.1],
    [44.2, 1.1], [44.6, 1.1], [44.9, 1.1], [45.2, 1.1], [45.4, 1.1],
    [45.6, 1.1], [45.8, 1.1], [46.0, 1.1], [46.2, 1.1], [46.3, 1.1],
    [46.5, 1.1], [46.6, 1.1], [46.8, 1.1], [46.9, 1.1], [47.2, 1.1],
  ]),
};

export const WHO = { male: BOYS, female: GIRLS };

export const PERCENTILE_BANDS = [
  { z: -1.8808, label: "3rd" },
  { z: -1.0364, label: "15th" },
  { z: 0, label: "50th" },
  { z: 1.0364, label: "85th" },
  { z: 1.8808, label: "97th" },
];

/** Median and SD at an age in months, interpolated between monthly rows. */
export function whoAt(sex, metric, ageMonths) {
  const source = WHO[sex === "male" ? "male" : "female"][metric];
  if (!source) return null;
  const age = clamp(Number(ageMonths) || 0, 0, 24);
  const lower = Math.floor(age);
  const upper = Math.min(24, lower + 1);
  const fraction = age - lower;
  const a = source[lower];
  const b = source[upper];
  return {
    m: a.m + (b.m - a.m) * fraction,
    sd: a.sd + (b.sd - a.sd) * fraction,
  };
}

export function zScoreFor(value, sex, metric, ageMonths) {
  const reference = whoAt(sex, metric, ageMonths);
  if (!reference || !Number.isFinite(value)) return null;
  return (value - reference.m) / reference.sd;
}

export function percentileFor(z) {
  if (z === null || !Number.isFinite(z)) return null;
  return percentileFromZ(z);
}

export function classify(metric, z) {
  if (z === null || !Number.isFinite(z)) return null;
  if (metric === "weight") {
    if (z < -3) return { label: "Well below typical", tone: "rose" };
    if (z < -2) return { label: "Below typical", tone: "amber" };
    if (z <= 1) return { label: "Typical range", tone: "emerald" };
    if (z <= 2) return { label: "Above typical", tone: "sky" };
    return { label: "Well above typical", tone: "amber" };
  }
  if (metric === "length") {
    if (z < -3) return { label: "Well below typical", tone: "rose" };
    if (z < -2) return { label: "Below typical", tone: "amber" };
    if (z <= 2) return { label: "Typical range", tone: "emerald" };
    return { label: "Above typical", tone: "sky" };
  }
  if (z < -3) return { label: "Well below typical", tone: "rose" };
  if (z < -2) return { label: "Below typical", tone: "amber" };
  if (z <= 2) return { label: "Typical range", tone: "emerald" };
  return { label: "Above typical", tone: "amber" };
}

export function metricLabel(metric) {
  return (METRIC_OPTIONS.find((item) => item.id === metric) || METRIC_OPTIONS[0]).label;
}

export function metricReferenceUnit(metric) {
  return metric === "weight" ? "kg" : "cm";
}

/* --------------------------------- Ages ---------------------------------- */

export const MS_PER_MONTH = 30.4375;

export function ageInMonths(dob, at) {
  if (!dob) return null;
  const start = new Date(`${dob}T00:00:00`);
  const end = at ? new Date(`${at}T00:00:00`) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * MS_PER_MONTH);
  return months >= 0 ? months : null;
}

export function correctedAgeMonths(ageMonths, gestationalWeeks) {
  if (ageMonths === "" || ageMonths === null || ageMonths === undefined) return null;
  const age = Number(ageMonths);
  const weeks = Number(gestationalWeeks);
  if (!Number.isFinite(age)) return null;
  if (!Number.isFinite(weeks) || weeks <= 0 || weeks >= 40) return age;
  return Math.max(0, age - (40 - weeks) / 4.345);
}

export function describeAge(months) {
  if (months === null || !Number.isFinite(months)) return "—";
  if (months < 1) return `${Math.round(months * MS_PER_MONTH)} days`;
  if (months < 24) {
    const whole = Math.floor(months);
    const weeks = Math.round((months - whole) * 4.345);
    return weeks > 0 ? `${whole} mo ${weeks} wk` : `${whole} mo`;
  }
  const years = Math.floor(months / 12);
  const rest = Math.round(months % 12);
  return rest ? `${years} yr ${rest} mo` : `${years} yr`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* -------------------------------- Feeding -------------------------------- */

export const FEEDING_METHODS = [
  { value: "formula", label: "Formula" },
  { value: "breast", label: "Breastfeeding" },
  { value: "mixed", label: "Mixed" },
];

export function recommendedFeeds(ageMonths) {
  const age = Number(ageMonths) || 0;
  if (age < 1) return 10;
  if (age < 3) return 8;
  if (age < 6) return 6;
  if (age < 9) return 5;
  if (age < 12) return 4;
  return 3;
}

export function solidsGuidance(ageMonths) {
  const age = Number(ageMonths) || 0;
  if (age < 4) {
    return {
      stage: "Milk only",
      meals: "No solids yet",
      detail:
        "Exclusive milk feeding is recommended. Solids are not appropriate before about 4 months, and most babies are not ready until closer to 6 months.",
    };
  }
  if (age < 6) {
    return {
      stage: "Watch for readiness",
      meals: "0 meals — milk only",
      detail:
        "Signs of readiness include sitting with support and good head control, reaching for food, and losing the tongue-thrust reflex. Wait for the signs rather than the calendar.",
    };
  }
  if (age < 8) {
    return {
      stage: "First tastes",
      meals: "1–2 small meals",
      detail:
        "Start with iron-rich purées or soft finger foods. Offer a few teaspoons after a milk feed and increase gradually. Milk remains the main source of nutrition.",
    };
  }
  if (age < 10) {
    return {
      stage: "Building meals",
      meals: "2–3 meals",
      detail:
        "Offer a variety of textures and iron-rich foods. Introduce common allergens one at a time, and keep offering vegetables even when they are refused.",
    };
  }
  if (age < 12) {
    return {
      stage: "Three meals",
      meals: "3 meals + 1 snack",
      detail:
        "Most babies can manage three meals plus a snack. Continue breast milk or formula, and offer water in an open cup with meals.",
    };
  }
  if (age < 24) {
    return {
      stage: "Family food",
      meals: "3 meals + 2 snacks",
      detail:
        "Family meals with age-appropriate textures. Avoid added salt, sugar and whole nuts; cut round foods lengthways. Whole milk is suitable from 12 months unless advised otherwise.",
    };
  }
  return {
    stage: "Toddler pattern",
    meals: "3 meals + 2 snacks",
    detail:
      "Offer a balanced family diet with iron-rich foods, dairy and fruit. Appetite varies day to day — look at the week rather than a single meal.",
  };
}

export function feedingPlan(profile) {
  const weightKg = Number(profile.weightKg);
  const age = Number(profile.ageMonths) || 0;
  const feeds = Math.max(1, Math.round(Number(profile.feedsPerDay) || recommendedFeeds(age)));
  const mlPerKg = Number(profile.mlPerKg) || 150;
  const scoopMl = Number(profile.scoopMl) || 30;
  const kcalPer100 = Number(profile.kcalPer100) || 67;

  const dailyMl = Number.isFinite(weightKg) && weightKg > 0 ? weightKg * mlPerKg : null;
  const perFeed = dailyMl ? dailyMl / feeds : null;
  const waterPerFeed = perFeed ? Math.round(perFeed / 5) * 5 : null;
  const scoops = perFeed && scoopMl ? perFeed / scoopMl : null;
  const kcalPerFeed = perFeed && kcalPer100 ? (perFeed / 100) * kcalPer100 : null;

  const start = profile.startTime || "07:00";
  const [startHour, startMinute] = start.split(":").map(Number);
  const startMinutes = (Number.isFinite(startHour) ? startHour : 7) * 60 + (Number.isFinite(startMinute) ? startMinute : 0);
  const windowHours = profile.nightFeeds ? 24 : 14;
  const interval = windowHours / feeds;

  const schedule = Array.from({ length: feeds }, (_, index) => {
    const total = (startMinutes + index * interval * 60) % (24 * 60);
    const hours = Math.floor(total / 60);
    const minutes = Math.round(total % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  });

  const solids = solidsGuidance(age);

  return {
    age,
    feeds,
    mlPerKg,
    dailyMl,
    perFeed,
    waterPerFeed,
    scoops,
    kcalPerFeed,
    kgPerDay: weightKg > 0 ? weightKg : null,
    schedule,
    intervalHours: interval,
    solids,
  };
}

export function readinessChecklist() {
  return [
    "Holds head steady and sits with minimal support",
    "Reaches for food and opens mouth when offered a spoon",
    "Has lost the tongue-thrust reflex that pushes food out",
    "Shows real interest in what others are eating",
    "Can move food to the back of the mouth and swallow",
  ];
}

/* -------------------------------- Storage -------------------------------- */

export function createEmptyBabyState() {
  return {
    view: "growth",
    unit: "metric",
    profile: {
      name: "",
      sex: "female",
      ageMode: "dob",
      dob: "",
      measuredOn: todayISO(),
      ageMonths: "",
      gaWeeks: "",
      birthWeight: "",
      birthLength: "",
      useCorrected: true,
    },
    entry: { weight: "", length: "", head: "", date: todayISO() },
    log: [],
    feeding: {
      method: "formula",
      weight: "",
      feedsPerDay: "",
      mlPerKg: "150",
      startTime: "07:00",
      nightFeeds: false,
      scoopMl: "30",
      kcalPer100: "67",
      showSchedule: true,
    },
    chart: { metric: "weight", showBands: true, showPoints: true },
  };
}

export function createDemoBabyState() {
  const empty = createEmptyBabyState();
  return {
    ...empty,
    profile: {
      ...empty.profile,
      name: "Demo baby",
      sex: "female",
      ageMode: "dob",
      dob: "2026-03-14",
      measuredOn: todayISO(),
      gaWeeks: "38",
      birthWeight: "3.1",
      birthLength: "49.5",
      useCorrected: true,
    },
    entry: { weight: "7.9", length: "68.4", head: "43.2", date: todayISO() },
    log: [
      { id: "demo-1", date: "2026-03-14", ageMonths: 0, weightKg: 3.1, lengthCm: 49.5, headCm: 34.2 },
      { id: "demo-2", date: "2026-05-14", ageMonths: 2, weightKg: 4.7, lengthCm: 56.2, headCm: 37.6 },
      { id: "demo-3", date: "2026-07-14", ageMonths: 4, weightKg: 6.1, lengthCm: 62.0, headCm: 40.1 },
      { id: "demo-4", date: "2026-09-14", ageMonths: 6, weightKg: 7.2, lengthCm: 66.4, headCm: 42.2 },
      { id: "demo-5", date: "2026-11-01", ageMonths: 7.6, weightKg: 7.9, lengthCm: 68.4, headCm: 43.2 },
    ],
    feeding: {
      ...empty.feeding,
      method: "mixed",
      weight: "7.9",
      feedsPerDay: "5",
      mlPerKg: "150",
      startTime: "07:00",
      nightFeeds: false,
    },
  };
}

/* --------------------------------- FAQs ---------------------------------- */

export const BABY_FAQS = [
  {
    question: "How are the percentiles calculated?",
    answer:
      "Each measurement is compared with a WHO-aligned monthly reference for the baby's sex. The z-score is (measurement − median) ÷ standard deviation, and the percentile is the area under the normal curve below that z-score. Values between months are interpolated linearly. The tables are simplified for education, so your paediatrician's own charts remain the authority.",
  },
  {
    question: "What does the 50th percentile mean?",
    answer:
      "The 50th percentile is the median: half of healthy children of the same age and sex are above it and half are below. A baby on the 15th percentile who tracks along that line is growing normally. The trend over time matters far more than a single number.",
  },
  {
    question: "Should I use corrected age for a premature baby?",
    answer:
      "For babies born before 37 weeks, corrected age subtracts the weeks they were early from their chronological age. Many clinicians use corrected age for growth and development until about 24 months. The calculator shows both and lets you switch which one drives the percentiles.",
  },
  {
    question: "How much milk does a baby need?",
    answer:
      "A common guide is about 150 ml per kilogram per day, split across the number of feeds. Breastfed babies feed on demand and do not need measured volumes; the figure is an estimate of intake, not a target to force. Formula is mixed according to the tin — never add extra powder.",
  },
  {
    question: "When should solids start?",
    answer:
      "Around 6 months, and not before about 4 months. Readiness matters more than the date: good head control, sitting with support, reaching for food and losing the tongue-thrust reflex. Milk stays the main source of nutrition for the first year.",
  },
  {
    question: "Is this tool medical advice?",
    answer:
      "No. It is an educational calculator that helps you understand growth trends and feeding arithmetic. Always discuss concerns with a paediatrician, health visitor or dietitian, especially if a baby is losing weight, crossing two percentile lines, or has feeding difficulties.",
  },
  {
    question: "Is my baby's data uploaded?",
    answer:
      "No. The profile, measurements and feeding settings are stored only in your browser's local storage. Exports are generated on your device, and clearing the tool removes the saved data.",
  },
];
