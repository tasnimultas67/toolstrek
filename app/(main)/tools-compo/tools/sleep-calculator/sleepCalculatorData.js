// app/(main)/tools-compo/tools/sleep-calculator/sleepCalculatorData.js
// Static reference data + pure helpers for the Sleep Calculator tool.
// Keeping every table, tip and FAQ here keeps the calculator component
// focused on state, UI and exports.

// ─────────────────────────────────────────────────────────────
// Core constants
// ─────────────────────────────────────────────────────────────
export const SLEEP_CYCLE_MINUTES = 90; // Average length of one full sleep cycle
export const MINUTES_IN_DAY = 1440;

export const MODES = {
  WAKE: "wake", // "I want to wake up at ..."
  BED: "bed", // "I am going to bed at ..."
};

// ─────────────────────────────────────────────────────────────
// Time helpers — all maths runs on minutes from midnight so it
// stays timezone safe and never overflows a Date object.
// ─────────────────────────────────────────────────────────────
export function parseTimeToMinutes(value) {
  if (!value || typeof value !== "string") return 0;
  const [h = 0, m = 0] = value.split(":").map((n) => parseInt(n, 10) || 0);
  return ((h % 24) * 60 + (m % 60) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
}

export function wrapMinutes(minutes) {
  return ((Math.round(minutes) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
}

export function minutesToTime(minutes) {
  const total = wrapMinutes(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTime12(minutes) {
  const total = wrapMinutes(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDuration(totalMinutes) {
  const safe = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getNowTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────
// Time to fall asleep (sleep onset latency)
// ─────────────────────────────────────────────────────────────
export const FALL_ASLEEP_OPTIONS = [
  { id: 0, label: "Instant", detail: "I drift off immediately" },
  { id: 10, label: "10 min", detail: "Fast sleeper" },
  { id: 15, label: "15 min", detail: "Healthy average" },
  { id: 20, label: "20 min", detail: "Slightly restless" },
  { id: 30, label: "30 min", detail: "Takes a while" },
  { id: 45, label: "45 min", detail: "Mind won't switch off" },
];

// ─────────────────────────────────────────────────────────────
// Age based sleep needs (National Sleep Foundation guidance)
// idealCycles = the cycle count used as the scheduling anchor
// ─────────────────────────────────────────────────────────────
export const AGE_GROUPS = [
  { id: "newborn", label: "Newborn", range: "0–3 months", minHours: 14, maxHours: 17, idealCycles: 8, recommended: "14–17 hours", note: "Sleep is split across many naps." },
  { id: "infant", label: "Infant", range: "4–11 months", minHours: 12, maxHours: 16, idealCycles: 8, recommended: "12–16 hours", note: "Includes 2–3 daytime naps." },
  { id: "toddler", label: "Toddler", range: "1–2 years", minHours: 11, maxHours: 14, idealCycles: 7, recommended: "11–14 hours", note: "One long nap plus night sleep." },
  { id: "preschool", label: "Preschool", range: "3–5 years", minHours: 10, maxHours: 13, idealCycles: 6, recommended: "10–13 hours", note: "Naps begin to fade out." },
  { id: "school", label: "School-age", range: "6–13 years", minHours: 9, maxHours: 11, idealCycles: 6, recommended: "9–11 hours", note: "Critical window for memory & growth." },
  { id: "teen", label: "Teenager", range: "14–17 years", minHours: 8, maxHours: 10, idealCycles: 6, recommended: "8–10 hours", note: "Body clock naturally shifts later." },
  { id: "adult", label: "Adult", range: "18–64 years", minHours: 7, maxHours: 9, idealCycles: 5, recommended: "7–9 hours", note: "The most common reference range." },
  { id: "senior", label: "Older Adult", range: "65+ years", minHours: 7, maxHours: 8, idealCycles: 5, recommended: "7–8 hours", note: "Sleep gets lighter with age." },
];

export function getAgeGroup(id) {
  return AGE_GROUPS.find((g) => g.id === id) || AGE_GROUPS[6];
}

export function getCyclesForAgeGroup(ageGroup) {
  const ideal = ageGroup?.idealCycles ?? 5;
  const max = Math.min(8, ideal + 1);
  const min = Math.max(3, ideal - 2);
  const cycles = [];
  for (let c = max; c >= min; c -= 1) cycles.push(c);
  return cycles;
}

// ─────────────────────────────────────────────────────────────
// Chronotypes — used for personalised coaching copy
// ─────────────────────────────────────────────────────────────
export const CHRONOTYPES = [
  {
    id: "lion",
    label: "Lion",
    subtitle: "Early bird",
    detail: "Wakes before sunrise and peaks in the morning.",
    advice: "Protect an early night — aim to be asleep before 10:30 PM.",
  },
  {
    id: "bear",
    label: "Bear",
    subtitle: "Solar match",
    detail: "Follows the sun and mirrors a normal 9-to-5 rhythm.",
    advice: "Keep bedtime within one hour of the same time each night.",
  },
  {
    id: "wolf",
    label: "Wolf",
    subtitle: "Night owl",
    detail: "Slow to wake and most alert late in the evening.",
    advice: "Shift bedtime 15 minutes earlier each week to avoid sleep debt.",
  },
  {
    id: "dolphin",
    label: "Dolphin",
    subtitle: "Light sleeper",
    detail: "Easily disturbed, often with a racing mind at night.",
    advice: "Use a wind-down ritual and keep the room cool, dark and quiet.",
  },
];

// ─────────────────────────────────────────────────────────────
// Lifestyle factors — each nudges sleep onset and quality
// ─────────────────────────────────────────────────────────────
export const LIFESTYLE_FACTORS = [
  {
    id: "caffeine",
    label: "Caffeine after 2 PM",
    detail: "Coffee, tea or energy drinks late in the day",
    icon: "Coffee",
    latencyDelta: 20,
    qualityDelta: -8,
  },
  {
    id: "alcohol",
    label: "Alcohol in the evening",
    detail: "Sedates you quickly but fragments deep & REM sleep",
    icon: "Wine",
    latencyDelta: -5,
    qualityDelta: -15,
  },
  {
    id: "screen",
    label: "Screens 1 hour before bed",
    detail: "Blue light and stimulation delay melatonin release",
    icon: "Smartphone",
    latencyDelta: 15,
    qualityDelta: -7,
  },
  {
    id: "stress",
    label: "High stress or racing thoughts",
    detail: "An over-active mind keeps you in light sleep",
    icon: "Brain",
    latencyDelta: 25,
    qualityDelta: -12,
  },
  {
    id: "heavyMeal",
    label: "Heavy meal within 2 hours",
    detail: "Digestion competes with overnight physical repair",
    icon: "Utensils",
    latencyDelta: 10,
    qualityDelta: -6,
  },
  {
    id: "lateExercise",
    label: "Intense workout late at night",
    detail: "Raises core temperature and adrenaline before bed",
    icon: "Dumbbell",
    latencyDelta: 10,
    qualityDelta: -5,
  },
  {
    id: "regularExercise",
    label: "Regular daytime exercise",
    detail: "Deepens slow-wave sleep and shortens sleep onset",
    icon: "Activity",
    latencyDelta: -5,
    qualityDelta: 8,
  },
  {
    id: "consistentSchedule",
    label: "Consistent sleep & wake times",
    detail: "Anchors your body clock for easier mornings",
    icon: "CalendarClock",
    latencyDelta: -5,
    qualityDelta: 10,
  },
];

// ─────────────────────────────────────────────────────────────
// Sleep architecture (share of a healthy night)
// ─────────────────────────────────────────────────────────────
export const SLEEP_STAGES = [
  {
    id: "n1",
    name: "N1 · Drowsiness",
    percent: 5,
    color: "bg-sky-300",
    text: "text-sky-700 dark:text-sky-300",
    description: "The brief doorway into sleep where muscles relax and you drift off.",
  },
  {
    id: "n2",
    name: "N2 · Light Sleep",
    percent: 45,
    color: "bg-indigo-400",
    text: "text-indigo-700 dark:text-indigo-300",
    description: "Heart rate and temperature drop; motor skills and facts consolidate.",
  },
  {
    id: "n3",
    name: "N3 · Deep Sleep",
    percent: 25,
    color: "bg-violet-600",
    text: "text-violet-700 dark:text-violet-300",
    description: "The restorative phase for immunity, hormones and physical repair.",
  },
  {
    id: "rem",
    name: "REM · Dream Sleep",
    percent: 25,
    color: "bg-fuchsia-500",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    description: "Where emotions, memory and creativity are woven together.",
  },
];

// ─────────────────────────────────────────────────────────────
// Sleep quality scoring + rating bands
// ─────────────────────────────────────────────────────────────
export function calculateSleepQuality({ hours, ageGroup, latencyMinutes, activeFactors = [] }) {
  let score = 100;

  if (hours < ageGroup.minHours) {
    score -= (ageGroup.minHours - hours) * 14;
  } else if (hours > ageGroup.maxHours) {
    score -= (hours - ageGroup.maxHours) * 6;
  }

  if (latencyMinutes > 30) {
    score -= (latencyMinutes - 30) * 0.6;
  }

  activeFactors.forEach((factor) => {
    score += factor.qualityDelta;
  });

  return Math.max(15, Math.min(100, Math.round(score)));
}

export function getQualityRating(score) {
  if (score >= 85) {
    return {
      label: "Excellent",
      badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
      bar: "from-emerald-400 to-teal-500",
      message: "This plan lines up beautifully with your body clock. Keep the routine consistent.",
    };
  }
  if (score >= 70) {
    return {
      label: "Good",
      badge: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300",
      bar: "from-sky-400 to-blue-500",
      message: "Solid, restorative sleep. Trim one or two habits below to push it higher.",
    };
  }
  if (score >= 55) {
    return {
      label: "Fair",
      badge: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
      bar: "from-amber-400 to-orange-500",
      message: "Your sleep is functional but fragmented. Prioritise the highest-impact fixes.",
    };
  }
  return {
    label: "Needs Work",
    badge: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
    bar: "from-rose-400 to-red-500",
    message: "Sleep is under pressure. Start with your wake time and caffeine cut-off this week.",
  };
}

// ─────────────────────────────────────────────────────────────
// Power nap guide
// ─────────────────────────────────────────────────────────────
export const NAP_GUIDE = [
  {
    id: "power",
    name: "Power Nap",
    duration: "10–20 min",
    bestFor: "Instant alertness reset",
    detail: "Ends before deep sleep begins, so you wake up instantly refreshed.",
  },
  {
    id: "coffee",
    name: "Caffeine Nap",
    duration: "20 min",
    bestFor: "Beating the afternoon slump",
    detail: "Sip coffee then nap 20 minutes — caffeine peaks exactly as you wake.",
  },
  {
    id: "short",
    name: "Short Nap",
    duration: "30–45 min",
    bestFor: "Restoring focus after a poor night",
    detail: "Adds some light sleep but risks a little grogginess on waking.",
  },
  {
    id: "full",
    name: "Full Cycle Nap",
    duration: "90 min",
    bestFor: "Recovering from real sleep debt",
    detail: "Completes a whole cycle including REM — good after a very short night.",
  },
];

// ─────────────────────────────────────────────────────────────
// Sleep hygiene tips
// ─────────────────────────────────────────────────────────────
export const SLEEP_HYGIENE_TIPS = [
  { icon: "AlarmClock", title: "Anchor your wake time", detail: "A fixed wake-up time every single day is the strongest lever for better sleep." },
  { icon: "MoonStar", title: "Build a 30-minute wind-down", detail: "Dim the lights, stretch and read to signal the brain that the day is done." },
  { icon: "Smartphone", title: "Go screen-free before bed", detail: "Blue light can push melatonin back by up to 90 minutes. Park devices out of reach." },
  { icon: "Thermometer", title: "Cool, dark, quiet room", detail: "Around 18–19°C with blackout curtains is the ideal environment for deep sleep." },
  { icon: "Coffee", title: "Cut caffeine after 2 PM", detail: "Caffeine has a 5–6 hour half-life and lingers long into the night." },
  { icon: "Dumbbell", title: "Move earlier in the day", detail: "Morning or afternoon exercise deepens deep sleep without delaying bedtime." },
  { icon: "Utensils", title: "Lighten the evening meal", detail: "Finish eating 2–3 hours before bed so digestion never competes with sleep." },
  { icon: "BatteryCharging", title: "Keep naps short and early", detail: "Naps longer than 30 minutes, or after 3 PM, steal pressure from night sleep." },
];

// ─────────────────────────────────────────────────────────────
// FAQ content
// ─────────────────────────────────────────────────────────────
export const SLEEP_FAQS = [
  {
    question: "How does the sleep calculator work?",
    answer:
      "It counts backwards (or forwards) in 90-minute blocks — the length of one full sleep cycle — from the time you choose. It then adds the time you typically need to fall asleep, so every suggested time marks the end of a complete cycle rather than the middle of deep sleep.",
  },
  {
    question: "Why are sleep cycles 90 minutes?",
    answer:
      "A complete cycle of N1, N2, N3 and REM sleep averages about 90 minutes in adults, though it ranges roughly from 70 to 120 minutes. Waking at the end of a cycle feels far easier than being pulled out of deep sleep.",
  },
  {
    question: "Is 6 hours of sleep enough?",
    answer:
      "For most adults, no — 7 to 9 hours is the recommended range. Four cycles (6 hours) works as an occasional minimum, but regularly sleeping under 7 hours builds sleep debt that affects mood, focus and immunity.",
  },
  {
    question: "Should I choose 5 or 6 cycles?",
    answer:
      "Aim for the option that lands inside your age group's recommended range and still fits your schedule. Five cycles (7.5 hours) suits most adults; six cycles (9 hours) is better after intense training, illness or recovery.",
  },
  {
    question: "How long does it take to fall asleep?",
    answer:
      "The average healthy sleep onset latency is 10 to 20 minutes. If it consistently takes you longer than 30 minutes, that is a sign to review caffeine, screens and stress — the calculator accounts for this in the latency slider.",
  },
  {
    question: "Can I catch up on lost sleep at the weekend?",
    answer:
      "Only partially. Weekend lie-ins recover some debt but disrupt your body clock, making Monday mornings harder. A steadier schedule with a short early nap is usually more effective than a long lie-in.",
  },
  {
    question: "Does it work for children and teenagers?",
    answer:
      "Yes. Pick the matching age group and the calculator adjusts both the recommended hours and the number of cycles. Note that babies and toddlers sleep in several segments, so their night-time window is shorter than their total daily need.",
  },
];
