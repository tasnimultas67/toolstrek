// app/(main)/tools-compo/tools/age-on-other-planets/planetData.js
// Static planetary reference data + the pure calculation engine behind the
// "Age on Other Planets" tool. Keeping every table, helper and FAQ here keeps
// the UI component focused on state, layout and exports.
//
// Astronomy notes:
//   • yearDays  – mean sidereal orbital period, in Earth days (NASA fact sheets)
//   • solarDayDays – one noon-to-noon solar day on the surface, in Earth days
//   • gravity   – surface gravity in m/s², gravityG – the same as a ratio of g
//   • orbitKm   – mean distance travelled in one full orbit around the Sun
// Those four figures power every number the calculator shows.

export const MS_PER_DAY = 86400000;

// A Julian year (365.25 d) is used for the "Earth years" readout so that the
// planet comparisons stay internally consistent; the standard Gregorian mean
// year (365.2425 d) is used for the calendar age shown in the hero card.
export const EARTH_YEAR_DAYS = 365.25;
export const CALENDAR_YEAR_DAYS = 365.2425;

export const STORAGE_KEY = "toolstrek_planet_age_v1";
export const TOOL_PATH = "/tools/age-on-other-planets";
export const SITE_URL = "https://toolstrek.vercel.app";
export const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;

export const UNITS = Object.freeze({ METRIC: "metric", IMPERIAL: "imperial" });
export const DECIMAL_OPTIONS = [0, 1, 2, 3];
export const MILESTONE_PRESETS = [10, 25, 50, 100, 500, 1000];
export const DEFAULT_MILESTONE = 100;
export const MIN_BIRTH_YEAR = 1000;

// Mass / length conversion constants for the imperial display option.
export const KG_TO_LB = 2.2046226218;
export const KM_TO_MI = 0.6213711922;
export const CM_TO_IN = 0.3937007874;
export const LB_TO_KG = 0.45359237;
export const IN_TO_CM = 2.54;

// ─────────────────────────────────────────────────────────────────────────────
// Planet catalogue — ordered outward from the Sun.
// ─────────────────────────────────────────────────────────────────────────────
export const PLANETS = [
  {
    id: "mercury",
    name: "Mercury",
    symbol: "☿",
    type: "Terrestrial planet",
    tagline: "The swiftest world",
    yearDays: 87.969,
    solarDayDays: 175.94,
    gravity: 3.7,
    gravityG: 0.378,
    orbitKm: 3.6e8,
    moons: 0,
    tempC: "−173 °C to 427 °C",
    distanceAu: 0.39,
    fact: "A Mercury year lasts 88 Earth days, but one sunrise-to-sunrise day takes 176 days — two whole Mercury years.",
    accent: { core: "#f8fafc", mid: "#cbd5e1", edge: "#64748b", glow: "#94a3b8" },
    ring: false,
    bands: false,
  },
  {
    id: "venus",
    name: "Venus",
    symbol: "♀",
    type: "Terrestrial planet",
    tagline: "Earth's scorching twin",
    yearDays: 224.701,
    solarDayDays: 116.75,
    gravity: 8.87,
    gravityG: 0.907,
    orbitKm: 6.8e8,
    moons: 0,
    tempC: "465 °C average",
    distanceAu: 0.72,
    fact: "Venus spins backwards, and its day is longer than its year — you could celebrate a Venus birthday before noon arrives.",
    accent: { core: "#fff7ed", mid: "#fbbf24", edge: "#c2410c", glow: "#f59e0b" },
    ring: false,
    bands: false,
  },
  {
    id: "earth",
    name: "Earth",
    symbol: "⊕",
    type: "Terrestrial planet",
    tagline: "Your home world",
    yearDays: EARTH_YEAR_DAYS,
    solarDayDays: 1,
    gravity: 9.807,
    gravityG: 1,
    orbitKm: 9.398e8,
    moons: 1,
    tempC: "−89 °C to 57 °C",
    distanceAu: 1,
    fact: "Earth is the only world in the catalogue where the sunrise feels exactly like it always has.",
    accent: { core: "#e0f2fe", mid: "#38bdf8", edge: "#1d4ed8", glow: "#3b82f6" },
    ring: false,
    bands: false,
  },
  {
    id: "mars",
    name: "Mars",
    symbol: "♂",
    type: "Terrestrial planet",
    tagline: "The red planet",
    yearDays: 686.98,
    solarDayDays: 1.027491,
    gravity: 3.71,
    gravityG: 0.379,
    orbitKm: 1.4287e9,
    moons: 2,
    tempC: "−143 °C to 35 °C",
    distanceAu: 1.52,
    fact: "A Mars sol is only 39 minutes longer than an Earth day, so your daily routine would survive the move — your calendar would not.",
    accent: { core: "#fee2e2", mid: "#f87171", edge: "#b91c1c", glow: "#ef4444" },
    ring: false,
    bands: false,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    symbol: "♃",
    type: "Gas giant",
    tagline: "The giant of the solar system",
    yearDays: 4332.589,
    solarDayDays: 0.41354,
    gravity: 24.79,
    gravityG: 2.528,
    orbitKm: 4.8926e9,
    moons: 95,
    tempC: "−145 °C cloud tops",
    distanceAu: 5.2,
    fact: "Jupiter is so large that 1,321 Earths could fit inside it — and it spins fast enough that a Jovian day lasts under 10 hours.",
    accent: { core: "#fef3c7", mid: "#f59e0b", edge: "#92400e", glow: "#f59e0b" },
    ring: false,
    bands: true,
  },
  {
    id: "saturn",
    name: "Saturn",
    symbol: "♄",
    type: "Gas giant",
    tagline: "Lord of the rings",
    yearDays: 10759.22,
    solarDayDays: 0.44401,
    gravity: 10.44,
    gravityG: 1.065,
    orbitKm: 9.0078e9,
    moons: 146,
    tempC: "−178 °C cloud tops",
    distanceAu: 9.58,
    fact: "Saturn is less dense than water — put it in a big enough ocean and the planet would float. Its rings are almost pure ice.",
    accent: { core: "#fefce8", mid: "#facc15", edge: "#a16207", glow: "#eab308" },
    ring: true,
    bands: false,
  },
  {
    id: "uranus",
    name: "Uranus",
    symbol: "♅",
    type: "Ice giant",
    tagline: "The sideways world",
    yearDays: 30688.5,
    solarDayDays: 0.71833,
    gravity: 8.87,
    gravityG: 0.886,
    orbitKm: 1.8056e10,
    moons: 28,
    tempC: "−224 °C (coldest atmosphere)",
    distanceAu: 19.2,
    fact: "Uranus is tipped over 98°, so it rolls around the Sun on its side — each pole gets 42 years of continuous sunlight.",
    accent: { core: "#ecfeff", mid: "#67e8f9", edge: "#0e7490", glow: "#22d3ee" },
    ring: false,
    bands: false,
  },
  {
    id: "neptune",
    name: "Neptune",
    symbol: "♆",
    type: "Ice giant",
    tagline: "The windiest world",
    yearDays: 60190,
    solarDayDays: 0.67125,
    gravity: 11.15,
    gravityG: 1.14,
    orbitKm: 2.8238e10,
    moons: 16,
    tempC: "−214 °C cloud tops",
    distanceAu: 30.05,
    fact: "Neptune's storms tear along at more than 2,000 km/h — and one Neptune year lasts almost 165 Earth years.",
    accent: { core: "#eff6ff", mid: "#60a5fa", edge: "#1e40af", glow: "#3b82f6" },
    ring: false,
    bands: false,
  },
  {
    id: "pluto",
    name: "Pluto",
    symbol: "♇",
    type: "Dwarf planet",
    tagline: "The far frontier",
    yearDays: 90560,
    solarDayDays: 6.3872,
    gravity: 0.62,
    gravityG: 0.063,
    orbitKm: 3.7088e10,
    moons: 5,
    tempC: "−229 °C average",
    distanceAu: 39.48,
    fact: "Pluto is smaller than Earth's Moon and its year is 248 Earth years long — it has not finished one orbit since it was discovered in 1930.",
    accent: { core: "#faf5ff", mid: "#d8b4fe", edge: "#7e22ce", glow: "#a855f7" },
    ring: false,
    bands: false,
  },
];

export const PLANET_IDS = PLANETS.map((planet) => planet.id);

export function getPlanet(id) {
  return PLANETS.find((planet) => planet.id === id) || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Curated preset dates — famous moments in space history plus a couple of
// playful edge cases (a leap day, a millennium New Year).
// ─────────────────────────────────────────────────────────────────────────────
export const PRESET_DATES = [
  { label: "Moon landing", detail: "Apollo 11, 1969", date: "1969-07-20" },
  { label: "First human in space", detail: "Yuri Gagarin, 1961", date: "1961-04-12" },
  { label: "Halley's Comet", detail: "1986 apparition", date: "1986-02-09" },
  { label: "Y2K New Year", detail: "1 Jan 2000", date: "2000-01-01" },
  { label: "Leap day baby", detail: "29 Feb 2000", date: "2000-02-29" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers — everything is parsed and compared in UTC so a birthday never
// slips a day because of the visitor's timezone.
// ─────────────────────────────────────────────────────────────────────────────
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 100 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return valid ? date : null;
}

export function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date, days) {
  if (!(date instanceof Date) || !Number.isFinite(days)) return null;
  const time = date.getTime() + days * MS_PER_DAY;
  // The ECMAScript Date range ends at ±8.64e15 ms (≈ ±273,790 years).
  if (!Number.isFinite(time) || Math.abs(time) > 8.64e15) return null;
  return new Date(time);
}

export function daysBetween(from, to) {
  return (to.getTime() - from.getTime()) / MS_PER_DAY;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation — returns a field-aware result the UI can render inline.
// ─────────────────────────────────────────────────────────────────────────────
export function validateDates(dobValue, asOfValue) {
  if (!dobValue) {
    return {
      ok: false,
      field: "dob",
      message: "Enter your date of birth to generate your cosmic report.",
    };
  }

  const dob = parseISODate(dobValue);
  if (!dob) {
    return {
      ok: false,
      field: "dob",
      message: "That date doesn't look valid — please pick a real calendar date.",
    };
  }

  if (dob.getUTCFullYear() < MIN_BIRTH_YEAR) {
    return {
      ok: false,
      field: "dob",
      message: `Please use a birth year from ${MIN_BIRTH_YEAR} onwards.`,
    };
  }

  const asOf = asOfValue ? parseISODate(asOfValue) : parseISODate(todayISO());
  if (!asOf) {
    return {
      ok: false,
      field: "asOf",
      message: "The “as of” date doesn't look valid — enter it as YYYY-MM-DD.",
    };
  }

  if (asOf.getTime() < dob.getTime()) {
    return {
      ok: false,
      field: "asOf",
      message: "The “as of” date can't be earlier than your date of birth.",
    };
  }

  return { ok: true, dob, asOf, earthDays: daysBetween(dob, asOf) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────
export function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompact(value, decimals = 2) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${formatNumber(value / 1e12, decimals)} trillion`;
  if (abs >= 1e9) return `${formatNumber(value / 1e9, decimals)} billion`;
  if (abs >= 1e6) return `${formatNumber(value / 1e6, decimals)} million`;
  if (abs >= 1e3) return new Intl.NumberFormat("en-US").format(Math.round(value));
  return formatNumber(value, abs < 10 ? decimals : 0);
}

export function formatDateUTC(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
  const year = date.getUTCFullYear();
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = date.getUTCDate();
  if (year > 9999) return `${month} ${day}, ${new Intl.NumberFormat("en-US").format(year)}`;
  return `${month} ${day}, ${year}`;
}

export function formatDayCount(days) {
  if (!Number.isFinite(days)) return "—";
  const rounded = Math.max(0, Math.round(days));
  if (rounded === 0) return "today";
  if (rounded === 1) return "1 day";
  return `${new Intl.NumberFormat("en-US").format(rounded)} days`;
}

export function formatYearsDuration(earthDays) {
  if (!Number.isFinite(earthDays) || earthDays < 0) return "—";
  const years = earthDays / CALENDAR_YEAR_DAYS;
  if (years < 1) {
    const days = Math.round(earthDays);
    return `${new Intl.NumberFormat("en-US").format(days)} days`;
  }
  if (years < 2) return "1 year";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(years)} years`;
}

export function ordinal(value) {
  const n = Math.abs(Math.round(value));
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

// Unit-aware formatters for the optional weight & jump module.
export function formatWeight(kg, units, decimals = 1) {
  if (!Number.isFinite(kg)) return "—";
  if (units === UNITS.IMPERIAL) return `${formatNumber(kg * KG_TO_LB, decimals)} lb`;
  return `${formatNumber(kg, decimals)} kg`;
}

export function formatDistanceKm(km, units, decimals = 2) {
  if (!Number.isFinite(km)) return "—";
  if (units === UNITS.IMPERIAL) {
    const miles = km * KM_TO_MI;
    return `${formatCompact(miles, decimals)} mi`;
  }
  return `${formatCompact(km, decimals)} km`;
}

export function formatJump(cm, units, decimals = 2) {
  if (!Number.isFinite(cm)) return "—";
  if (units === UNITS.IMPERIAL) return `${formatNumber(cm * CM_TO_IN, decimals)} in`;
  return `${formatNumber(cm, decimals)} cm`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cosmic report engine
// ─────────────────────────────────────────────────────────────────────────────
export function computeCosmicReport({
  dobValue,
  asOfValue,
  milestone = DEFAULT_MILESTONE,
  weightKg = null,
  jumpCm = null,
} = {}) {
  const validation = validateDates(dobValue, asOfValue);
  if (!validation.ok) {
    return { ok: false, field: validation.field, message: validation.message };
  }

  const { dob, asOf } = validation;
  const earthDays = validation.earthDays;
  const milestoneYears = Math.max(1, Math.round(milestone));

  const planets = PLANETS.map((planet) => {
    const years = earthDays / planet.yearDays;
    const wholeYears = Math.floor(years);
    const progress = years - wholeYears;

    const nextInDays = (wholeYears + 1) * planet.yearDays - earthDays;
    const nextDate = addDays(asOf, nextInDays);

    const localDays = earthDays / planet.solarDayDays;

    const milestoneDays = milestoneYears * planet.yearDays;
    const milestoneDate = addDays(dob, milestoneDays);
    const milestoneReached = earthDays >= milestoneDays;
    const milestoneInDays = milestoneDays - earthDays;

    const distanceKm = years * planet.orbitKm;
    const weight = Number.isFinite(weightKg) && weightKg > 0 ? weightKg * planet.gravityG : null;
    const jump = Number.isFinite(jumpCm) && jumpCm > 0 ? jumpCm / planet.gravityG : null;

    return {
      ...planet,
      years,
      wholeYears,
      progress,
      nextInDays,
      nextDate,
      localDays,
      milestoneDate,
      milestoneReached,
      milestoneInDays,
      distanceKm,
      weight,
      jump,
    };
  });

  const oldest = planets.reduce((best, planet) =>
    planet.years > best.years ? planet : best
  );
  const youngest = planets.reduce((best, planet) =>
    planet.years < best.years ? planet : best
  );

  return {
    ok: true,
    dob,
    asOf,
    earthDays,
    earthDaysWhole: Math.floor(earthDays),
    earthYears: earthDays / EARTH_YEAR_DAYS,
    calendarYears: earthDays / CALENDAR_YEAR_DAYS,
    earthOrbits: Math.floor(earthDays / EARTH_YEAR_DAYS),
    milestoneYears,
    planets,
    oldestId: oldest.id,
    youngestId: youngest.id,
    earthStats: buildEarthStats(earthDays),
    earthNextBirthday: addDays(asOf, planets.find((p) => p.id === "earth").nextInDays),
  };
}

export function buildEarthStats(earthDays) {
  const days = Math.max(0, earthDays);
  return [
    { id: "days", label: "Days lived", value: days, decimals: 0, approximate: false },
    { id: "hours", label: "Hours lived", value: days * 24, decimals: 0, approximate: false },
    { id: "minutes", label: "Minutes lived", value: days * 1440, decimals: 0, approximate: false },
    { id: "seconds", label: "Seconds lived", value: days * 86400, decimals: 0, approximate: false },
    { id: "orbits", label: "Earth orbits completed", value: days / EARTH_YEAR_DAYS, decimals: 1, approximate: false },
    { id: "heartbeats", label: "Heartbeats (≈80 bpm)", value: days * 115200, decimals: 0, approximate: true },
    { id: "breaths", label: "Breaths taken (≈16/min)", value: days * 23040, decimals: 0, approximate: true },
    { id: "moons", label: "Full moons seen (≈29.53 d)", value: days / 29.53059, decimals: 0, approximate: true },
    { id: "sleep", label: "Days asleep (≈8 h/night)", value: days / 3, decimals: 0, approximate: true },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Share / export builders
// ─────────────────────────────────────────────────────────────────────────────
export function buildShareText(report, { units = UNITS.METRIC, milestone = DEFAULT_MILESTONE } = {}) {
  if (!report?.ok) return "";

  const lines = [
    "🚀 My age across the solar system",
    `Born ${formatDateUTC(report.dob)} · calculated as of ${formatDateUTC(report.asOf)}`,
    "",
  ];

  report.planets.forEach((planet) => {
    lines.push(`${planet.symbol} ${planet.name}: ${formatNumber(planet.years, 2)} years`);
  });

  lines.push(
    "",
    `Earth: ${formatNumber(report.calendarYears, 1)} years · ${new Intl.NumberFormat("en-US").format(report.earthDaysWhole)} days lived`,
    `Made with ToolsTrek — Age on Other Planets`,
    TOOL_URL
  );

  return lines.join("\n");
}

export function buildShareUrl({
  dob,
  asOf,
  name,
  units,
  decimals,
  milestone,
  weightKg,
  jumpCm,
  enabledIds,
}) {
  const params = new URLSearchParams();
  if (dob) params.set("dob", dob);
  if (asOf) params.set("as", asOf);
  if (typeof name === "string" && name.trim()) params.set("n", name.trim().slice(0, 40));
  if (units && units !== UNITS.METRIC) params.set("u", "i");
  if (Number.isFinite(decimals) && decimals !== 2) params.set("d", String(decimals));
  if (Number.isFinite(milestone) && milestone !== DEFAULT_MILESTONE) params.set("m", String(milestone));
  if (Number.isFinite(weightKg) && weightKg > 0) params.set("w", weightKg.toFixed(1));
  if (Number.isFinite(jumpCm) && jumpCm > 0) params.set("j", jumpCm.toFixed(1));
  if (
    Array.isArray(enabledIds) &&
    enabledIds.length > 0 &&
    enabledIds.length !== PLANET_IDS.length
  ) {
    params.set("p", enabledIds.join(","));
  }
  const query = params.toString();
  return query ? `${TOOL_URL}?${query}` : TOOL_URL;
}

export function buildCSV(report, { units = UNITS.METRIC, milestone = DEFAULT_MILESTONE } = {}) {
  if (!report?.ok) return "";

  const header = [
    "Planet",
    "Type",
    "Your age (planet years)",
    "Local solar days lived",
    "Earth days lived",
    "Next planetary birthday",
    "Days until next birthday",
    `${ordinal(milestone)} planetary birthday`,
    `Orbital distance travelled (${units === UNITS.IMPERIAL ? "mi" : "km"})`,
    "Relative gravity (g)",
    "Weight",
    "Jump height",
  ];

  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;

  const rows = report.planets.map((planet) => [
    planet.name,
    planet.type,
    formatNumber(planet.years, 4),
    formatNumber(planet.localDays, 2),
    formatNumber(report.earthDays, 0),
    formatDateUTC(planet.nextDate),
    formatNumber(planet.nextInDays, 1),
    formatDateUTC(planet.milestoneDate),
    units === UNITS.IMPERIAL ? formatNumber(planet.distanceKm * KM_TO_MI, 0) : formatNumber(planet.distanceKm, 0),
    formatNumber(planet.gravityG, 3),
    Number.isFinite(planet.weight) ? formatWeight(planet.weight, units, 1) : "",
    Number.isFinite(planet.jump) ? formatJump(planet.jump, units, 1) : "",
  ]);

  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
}

export function buildJSON(report, settings) {
  if (!report?.ok) return "";
  return JSON.stringify(
    {
      tool: "ToolsTrek Age on Other Planets",
      url: TOOL_URL,
      generatedAt: new Date().toISOString(),
      settings: {
        units: settings.units,
        decimals: settings.decimals,
        milestone: report.milestoneYears,
        weightKg: settings.weightKg ?? null,
        jumpCm: settings.jumpCm ?? null,
      },
      earth: {
        birthDate: toISODate(report.dob),
        asOfDate: toISODate(report.asOf),
        earthDays: Number(report.earthDays.toFixed(4)),
        calendarYears: Number(report.calendarYears.toFixed(4)),
      },
      planets: report.planets.map((planet) => ({
        id: planet.id,
        name: planet.name,
        ageYears: Number(planet.years.toFixed(6)),
        localDays: Number(planet.localDays.toFixed(3)),
        nextBirthday: toISODate(planet.nextDate),
        daysUntilNextBirthday: Number(planet.nextInDays.toFixed(3)),
        milestone: report.milestoneYears,
        milestoneDate: planet.milestoneDate ? toISODate(planet.milestoneDate) : null,
        milestoneReached: planet.milestoneReached,
        orbitalDistanceKm: Math.round(planet.distanceKm),
        gravityG: planet.gravityG,
        weightKg: planet.weight === null ? null : Number(planet.weight.toFixed(3)),
        jumpCm: planet.jump === null ? null : Number(planet.jump.toFixed(3)),
      })),
    },
    null,
    2
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ content — reused by the in-page accordion and the FAQPage JSON-LD.
// ─────────────────────────────────────────────────────────────────────────────
export const PLANET_FAQS = [
  {
    q: "How is my age on other planets calculated?",
    a: "Every planet takes a different amount of time to complete one orbit around the Sun. The calculator first works out exactly how many Earth days you have been alive — from your birth date to the “as of” date you choose — then divides that number by each planet's orbital period: Mercury 87.97 days, Venus 224.70 days, Earth 365.25 days, Mars 686.98 days, Jupiter 4,332.59 days, Saturn 10,759.22 days, Uranus 30,688.5 days, Neptune 60,190 days and Pluto 90,560 days.",
  },
  {
    q: "How old am I on Mars?",
    a: "A Mars year lasts about 687 Earth days — nearly two Earth years — so your Martian age is roughly half your Earth age. If you are 30 on Earth you are about 15.9 Mars years old, and you have lived around 10,600 Martian sols, because one sol is only 39 minutes longer than an Earth day.",
  },
  {
    q: "Why is my age different on every planet?",
    a: "A “year” is simply one full trip around the Sun, and each planet completes that trip at a different speed and distance. Mercury races around in 88 days while Neptune takes almost 165 Earth years, so your age in planet-years measures how many orbits you have completed on that world.",
  },
  {
    q: "Where am I oldest and where am I youngest?",
    a: "You are “oldest” on Mercury, the fast inner planet, because you have completed the most orbits there — about 4.15 Mercury years for every Earth year. You are “youngest” on Neptune, where one year takes 164.8 Earth years, so decades pass between planetary birthdays.",
  },
  {
    q: "What is a planetary birthday and when is my next one?",
    a: "A planetary birthday — also called a solar return — happens when the planet returns to the position it held when you were born, completing another full orbit. The tool tracks your progress toward the next one on every world, shows the exact Earth date it falls on, and gives you a countdown in days.",
  },
  {
    q: "How do you estimate my weight and jump height on each planet?",
    a: "Surface gravity ranges from 0.063 g on Pluto to 2.53 g on Jupiter. Your weight is your Earth weight multiplied by the planet's gravity — about 2.5× heavier on Jupiter and roughly 16× lighter on Pluto. Jump height works the opposite way: with weaker gravity you would jump higher, so the tool divides your Earth jump by the planet's gravity.",
  },
  {
    q: "Is Pluto treated as a planet?",
    a: "Pluto is included as a dwarf planet so you can see how long its 248-Earth-year orbit really is. The main eight worlds follow the International Astronomical Union definition, and every world — Pluto included — can be toggled on or off, with the cards, table and exports all following your selection.",
  },
  {
    q: "Does the calculator handle leap-day birthdays and future dates?",
    a: "Yes. The maths runs on whole Earth days rather than calendar years, so a February 29 birthday needs no special handling. You can also move the “as of” date to any day after your birth — including a future date — to project your cosmic age at that moment.",
  },
  {
    q: "Can I share my cosmic birthday report?",
    a: "Absolutely. Copy a ready-made text summary, copy a share link that restores your dates and settings, download a branded PNG report card, or export the full comparison as CSV or JSON. Every file is generated in your browser in seconds.",
  },
  {
    q: "Is my birth date uploaded or stored anywhere?",
    a: "Never. The calculator runs 100% client-side. Your birth date and preferences are stored only in your own browser's localStorage so the tool can remember them, and a share link keeps the dates in the URL you control. Nothing is ever sent to a server, logged or tracked.",
  },
];

export const PLANET_FEATURES = [
  "Exact age in planet years on Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto",
  "Planetary birthday tracker with a live progress bar and a countdown to your next solar return",
  "Milestone planner for your 10th, 50th, 100th or custom planetary birthday",
  "Surface days (sols) lived on every world, plus orbital distance travelled around the Sun",
  "Optional weight and jump-height comparison using real surface gravity",
  "Earth statistics: days, hours, minutes, seconds, heartbeats, breaths, full moons and sleep",
  "Fully customisable units, decimal precision, visible planets and shareable links",
  "Branded PNG report card, text summary, CSV and JSON export — 100% in your browser",
];
