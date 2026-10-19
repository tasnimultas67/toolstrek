// ─────────────────────────────────────────────────────────────────────────────
// Dog & Cat Age Calculator — data, pure calculation engine & share builders
// All dates are handled in UTC so a birthday never shifts a day by timezone.
// ─────────────────────────────────────────────────────────────────────────────

export const PET_TYPES = { DOG: "dog", CAT: "cat" };
export const DOG_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  GIANT: "giant",
};
export const CAT_LIFESTYLES = {
  INDOOR: "indoor",
  MIXED: "mixed",
  OUTDOOR: "outdoor",
};
export const METHODS = {
  MODERN: "modern",
  CLASSIC: "classic",
  CUSTOM: "custom",
};
export const UNITS = { METRIC: "metric", IMPERIAL: "imperial" };

export const TOOL_PATH = "/tools/dog-cat-age-calculator";
export const SITE_URL = "https://toolstrek.vercel.app";
export const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
export const STORAGE_KEY = "toolstrek_pet_age_v1";

export const DECIMAL_OPTIONS = [0, 1, 2];
export const MILESTONE_YEARS = [1, 2, 3, 5, 7, 10, 12, 15, 20];
export const MAX_PET_YEARS = 40;
export const MIN_LIFESPAN = 1;
export const MAX_LIFESPAN = 30;
export const MIN_FACTOR = 0.5;
export const MAX_FACTOR = 15;
export const KG_TO_LB = 2.2046226218;
export const LB_TO_KG = 1 / KG_TO_LB;
export const MS_PER_DAY = 86400000;

// ─────────────────────────────────────────────────────────────────────────────
// Species catalogue
// ─────────────────────────────────────────────────────────────────────────────
export const DOG_SIZE_OPTIONS = [
  {
    id: DOG_SIZES.SMALL,
    label: "Small",
    range: "Up to 10 kg",
    rangeImperial: "Up to 22 lb",
    kgMax: 10,
    examples: "Chihuahua · Pug · Shih Tzu",
    humanRate: 4,
    lifespan: { min: 12, max: 16, avg: 14 },
  },
  {
    id: DOG_SIZES.MEDIUM,
    label: "Medium",
    range: "10–25 kg",
    rangeImperial: "22–55 lb",
    kgMax: 25,
    examples: "Beagle · Border Collie · Cocker Spaniel",
    humanRate: 5,
    lifespan: { min: 11, max: 14, avg: 12.5 },
  },
  {
    id: DOG_SIZES.LARGE,
    label: "Large",
    range: "25–45 kg",
    rangeImperial: "55–99 lb",
    kgMax: 45,
    examples: "Labrador · German Shepherd · Golden Retriever",
    humanRate: 6,
    lifespan: { min: 9, max: 12, avg: 10.5 },
  },
  {
    id: DOG_SIZES.GIANT,
    label: "Giant",
    range: "45 kg and up",
    rangeImperial: "99 lb and up",
    kgMax: Infinity,
    examples: "Great Dane · Mastiff · Saint Bernard",
    humanRate: 7,
    lifespan: { min: 7, max: 10, avg: 8.5 },
  },
];

export const CAT_LIFESTYLE_OPTIONS = [
  {
    id: CAT_LIFESTYLES.INDOOR,
    label: "Indoor",
    hint: "Warm, safe and typically the longest-lived",
    lifespan: { min: 13, max: 17, avg: 15 },
  },
  {
    id: CAT_LIFESTYLES.MIXED,
    label: "Indoor + outdoor",
    hint: "Some supervised or daytime outdoor access",
    lifespan: { min: 10, max: 14, avg: 12 },
  },
  {
    id: CAT_LIFESTYLES.OUTDOOR,
    label: "Outdoor",
    hint: "Lives mostly or entirely outdoors",
    lifespan: { min: 5, max: 10, avg: 7.5 },
  },
];

const DOG_STAGE_THRESHOLDS = {
  small: [1, 2, 6, 9, 12],
  medium: [1, 2, 5, 8, 11],
  large: [1, 2, 5, 7, 9],
  giant: [1, 2, 4, 6, 8],
};
const CAT_STAGE_THRESHOLDS = [1, 2, 7, 11, 15];

const DOG_STAGES = [
  {
    id: "puppy",
    label: "Puppy",
    description:
      "Rapid growth and vaccination season. Socialise gently, start short training sessions and keep playtime safe.",
  },
  {
    id: "junior",
    label: "Junior",
    description:
      "The body is nearly grown but the energy is endless. Keep training consistent, fun and reward-based.",
  },
  {
    id: "adult",
    label: "Adult",
    description:
      "Prime health years. Lock in daily exercise, dental care, healthy weight and an annual vet check.",
  },
  {
    id: "mature",
    label: "Mature",
    description:
      "Middle age. Metabolism slows a little — watch weight and joints, and mention any stiffness at check-ups.",
  },
  {
    id: "senior",
    label: "Senior",
    description:
      "Senior bloodwork, joint support and shorter, gentler walks help. Twice-yearly vet visits are worthwhile.",
  },
  {
    id: "geriatric",
    label: "Geriatric",
    description:
      "Comfort-first care: soft bedding, warmth, easy access to food and water, and frequent check-ins.",
  },
];

const CAT_STAGES = [
  {
    id: "kitten",
    label: "Kitten",
    description:
      "Growing fast. Vaccinations, gentle handling and several short play sessions a day build confidence.",
  },
  {
    id: "junior",
    label: "Junior",
    description:
      "Full of energy and curiosity. Play, scratching posts and a steady routine keep them happy.",
  },
  {
    id: "adult",
    label: "Adult",
    description:
      "Prime years. Watch weight, dental health and enrich their environment with climbing and puzzle play.",
  },
  {
    id: "mature",
    label: "Mature",
    description:
      "Middle age. Weight and kidney health deserve a closer look at the yearly check-up.",
  },
  {
    id: "senior",
    label: "Senior",
    description:
      "Senior bloodwork, joint comfort, warm resting spots and low-stress routines make a difference.",
  },
  {
    id: "geriatric",
    label: "Geriatric",
    description:
      "Gentle routines, easy litter access, warmth and frequent vet checks keep them comfortable.",
  },
];

const DOG_GENERAL_FACT =
  "A dog's nose print is as unique as a human fingerprint — no two are alike.";
const CAT_GENERAL_FACT =
  "Cats spend around 70% of their lives asleep — roughly 14 hours a day.";

const DOG_SIZE_FACTS = {
  small:
    "Small breeds often live years longer than giant breeds — adult size is one of the strongest predictors of canine lifespan.",
  medium:
    "Medium-sized dogs tend to hit a sweet spot between energy and longevity, often living well into their early teens.",
  large:
    "Large dogs age faster: most reach senior status around 7–8, while small breeds may not until 9–10.",
  giant:
    "Giant breeds can be senior by age 6. Their hearts work harder and their lives are shorter — but every year is big.",
};
const CAT_LIFESTYLE_FACTS = {
  indoor:
    "Indoor cats commonly live into their late teens, with many reaching 18 or more with good veterinary care.",
  mixed:
    "Cats with outdoor access need a microchip, a curfew and regular parasite checks to stay safe.",
  outdoor:
    "Outdoor cats face traffic, weather and predators, which is why their average lifespan is much shorter.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers (UTC)
// ─────────────────────────────────────────────────────────────────────────────
export function parseISODate(value) {
  if (!value || typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

export function todayISO() {
  const now = new Date();
  return toISODate(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  );
}

export function daysInMonthUTC(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function addDays(date, days) {
  if (!(date instanceof Date)) return null;
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function addMonthsClamped(date, months) {
  if (!(date instanceof Date)) return null;
  const total = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
  const year = Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  const day = Math.min(date.getUTCDate(), daysInMonthUTC(year, month));
  return new Date(Date.UTC(year, month, day));
}

export function addYearsClamped(date, years) {
  return addMonthsClamped(date, years * 12);
}

export function daysBetween(start, end) {
  if (!(start instanceof Date) || !(end instanceof Date)) return 0;
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

export function formatDateUTC(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDayCount(days) {
  if (!Number.isFinite(days)) return "—";
  if (days === 0) return "today";
  if (days === 1) return "in 1 day";
  if (days > 1) return `in ${formatNumber(days, 0)} days`;
  if (days === -1) return "1 day ago";
  return `${formatNumber(Math.abs(days), 0)} days ago`;
}

export function getPetAge(dob, asOf) {
  const totalDays = Math.max(0, daysBetween(dob, asOf));
  let years = asOf.getUTCFullYear() - dob.getUTCFullYear();
  if (asOf < birthdayInYear(dob, asOf.getUTCFullYear())) years -= 1;
  years = Math.max(0, years);
  const anchor = addYearsClamped(dob, years);
  let months = 0;
  while (months < 11 && addMonthsClamped(anchor, months + 1) <= asOf) {
    months += 1;
  }
  return {
    years,
    months,
    totalDays,
    exactYears: totalDays / 365.2425,
  };
}

export function formatYearsMonths(age) {
  const years = age.years;
  const months = age.months;
  if (years <= 0) {
    if (months <= 0) return `${formatNumber(age.totalDays, 0)} days`;
    return `${months} ${months === 1 ? "month" : "months"}`;
  }
  const yearLabel = `${years} ${years === 1 ? "year" : "years"}`;
  if (months <= 0) return yearLabel;
  return `${yearLabel} ${months} ${months === 1 ? "month" : "months"}`;
}

export function birthdayInYear(dob, year) {
  const month = dob.getUTCMonth();
  const day = Math.min(dob.getUTCDate(), daysInMonthUTC(year, month));
  return new Date(Date.UTC(year, month, day));
}

export function nextBirthday(dob, asOf) {
  const candidate = birthdayInYear(dob, asOf.getUTCFullYear());
  const isToday = sameUTCDay(candidate, asOf);
  const next =
    isToday || candidate < asOf
      ? birthdayInYear(dob, asOf.getUTCFullYear() + 1)
      : candidate;
  return {
    isToday,
    date: next,
    days: Math.max(0, daysBetween(asOf, next)),
  };
}

export function sameUTCDay(a, b) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────
export function formatNumber(value, decimals = 1) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: Math.max(0, Math.min(3, decimals)),
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value, decimals = 1) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e12) {
    return `${formatNumber(value / 1e12, decimals)} trillion`;
  }
  if (abs >= 1e9) {
    return `${formatNumber(value / 1e9, decimals)} billion`;
  }
  if (abs >= 1e6) {
    return `${formatNumber(value / 1e6, decimals)} million`;
  }
  if (abs >= 1e3) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
      Math.round(value)
    );
  }
  return formatNumber(value, abs < 10 ? Math.max(decimals, 1) : 0);
}

export function ordinal(value) {
  const n = Math.round(Number(value));
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

export function formatWeight(kg, units, decimals = 1) {
  if (!Number.isFinite(kg) || kg <= 0) return "—";
  return units === UNITS.IMPERIAL
    ? `${formatNumber(kg * KG_TO_LB, decimals)} lb`
    : `${formatNumber(kg, decimals)} kg`;
}

export function dogSizeLabel(id) {
  return DOG_SIZE_OPTIONS.find((size) => size.id === id)?.label || "Medium";
}

export function catLifestyleLabel(id) {
  return (
    CAT_LIFESTYLE_OPTIONS.find((lifestyle) => lifestyle.id === id)?.label ||
    "Indoor"
  );
}

export function classifyDogSize(kg) {
  if (!Number.isFinite(kg) || kg <= 0) return null;
  if (kg <= 10) return DOG_SIZES.SMALL;
  if (kg <= 25) return DOG_SIZES.MEDIUM;
  if (kg <= 45) return DOG_SIZES.LARGE;
  return DOG_SIZES.GIANT;
}

// ─────────────────────────────────────────────────────────────────────────────
// Age conversion engine
// ─────────────────────────────────────────────────────────────────────────────
export function computeHumanAge(petYears, { type, dogSize, method, customFactor }) {
  const years = Math.max(0, petYears);
  if (method === METHODS.CLASSIC) {
    return {
      years: years * 7,
      methodLabel: "classic 7-year rule",
      description:
        "The traditional shortcut: every pet year counts as seven human years.",
      rate: 7,
    };
  }
  if (method === METHODS.CUSTOM) {
    const rate = Number(customFactor);
    return {
      years: years * rate,
      methodLabel: `custom ${formatNumber(rate, 1)}× multiplier`,
      description: `Your own rule: each pet year counts as ${formatNumber(
        rate,
        1
      )} human years.`,
      rate,
    };
  }

  const size = DOG_SIZE_OPTIONS.find((option) => option.id === dogSize);
  const rate = type === PET_TYPES.DOG ? size?.humanRate ?? 5 : 4;
  let human;
  if (years <= 1) {
    human = years * 15;
  } else if (years <= 2) {
    human = 15 + (years - 1) * 9;
  } else {
    human = 24 + (years - 2) * rate;
  }
  return {
    years: human,
    methodLabel: "size-aware chart",
    description:
      type === PET_TYPES.DOG
        ? `The first year counts as 15 human years, the second adds 9, then about ${rate} per year for a ${(
            size?.label || "medium"
          ).toLowerCase()} dog.`
        : "The first year counts as 15 human years, the second adds 9, then about 4 per year for a cat.",
    rate,
  };
}

export function getLifeStage(type, dogSize, petYears) {
  const isDog = type === PET_TYPES.DOG;
  const thresholds = isDog
    ? DOG_STAGE_THRESHOLDS[dogSize] || DOG_STAGE_THRESHOLDS.medium
    : CAT_STAGE_THRESHOLDS;
  const defs = isDog ? DOG_STAGES : CAT_STAGES;
  let index = thresholds.findIndex((threshold) => petYears < threshold);
  if (index === -1) index = thresholds.length;
  const start = index === 0 ? 0 : thresholds[index - 1];
  const end = index < thresholds.length ? thresholds[index] : null;
  const next = index < thresholds.length ? defs[index + 1] : null;
  return {
    ...defs[index],
    index,
    start,
    end,
    nextLabel: next?.label || null,
    nextInYears:
      end === null ? null : Math.max(0, Math.round((end - petYears) * 10) / 10),
    progress:
      end === null
        ? 1
        : Math.max(0, Math.min(1, (petYears - start) / (end - start))),
  };
}

export function lifeStageRanges(type, dogSize) {
  const isDog = type === PET_TYPES.DOG;
  const thresholds = isDog
    ? DOG_STAGE_THRESHOLDS[dogSize] || DOG_STAGE_THRESHOLDS.medium
    : CAT_STAGE_THRESHOLDS;
  const defs = isDog ? DOG_STAGES : CAT_STAGES;
  return defs.map((stage, index) => ({
    ...stage,
    start: index === 0 ? 0 : thresholds[index - 1],
    end: index < thresholds.length ? thresholds[index] : null,
  }));
}

export function validatePetInput({
  dobValue,
  asOfValue,
  method,
  customFactor,
  lifespanOverride,
}) {
  const dob = parseISODate(dobValue);
  if (!dob) {
    return {
      ok: false,
      field: "dob",
      message: dobValue
        ? "That birthday doesn't look like a real date — please check it."
        : "Enter your pet's birthday to see their report.",
    };
  }
  const asOf = asOfValue ? parseISODate(asOfValue) : parseISODate(todayISO());
  if (!asOf) {
    return {
      ok: false,
      field: "asOf",
      message: "That “as of” date isn't valid. Use the date picker or tap Today.",
    };
  }
  if (asOf < dob) {
    return {
      ok: false,
      field: "asOf",
      message: "The “as of” date must be on or after your pet's birthday.",
    };
  }
  if (daysBetween(dob, asOf) > 365.2425 * MAX_PET_YEARS) {
    return {
      ok: false,
      field: "dob",
      message: `That would make your pet over ${MAX_PET_YEARS} years old — double-check the date.`,
    };
  }
  if (method === METHODS.CUSTOM) {
    const factor = Number(customFactor);
    if (!Number.isFinite(factor) || factor < MIN_FACTOR || factor > MAX_FACTOR) {
      return {
        ok: false,
        field: "factor",
        message: `Use a multiplier between ${MIN_FACTOR} and ${MAX_FACTOR}.`,
      };
    }
  }
  if (
    lifespanOverride !== "" &&
    lifespanOverride !== null &&
    lifespanOverride !== undefined
  ) {
    const value = Number(lifespanOverride);
    if (!Number.isFinite(value) || value < MIN_LIFESPAN || value > MAX_LIFESPAN) {
      return {
        ok: false,
        field: "lifespan",
        message: `Expected lifespan must be between ${MIN_LIFESPAN} and ${MAX_LIFESPAN} years.`,
      };
    }
  }
  return { ok: true, dob, asOf };
}

export function computePetReport({
  type,
  dogSize,
  catLifestyle,
  dobValue,
  asOfValue,
  gotchaValue,
  method,
  customFactor,
  lifespanOverride,
  weightKg,
}) {
  const validation = validatePetInput({
    dobValue,
    asOfValue,
    method,
    customFactor,
    lifespanOverride,
  });
  if (!validation.ok) return validation;
  const { dob, asOf } = validation;

  const isDog = type === PET_TYPES.DOG;
  const size =
    DOG_SIZE_OPTIONS.find((option) => option.id === dogSize) ||
    DOG_SIZE_OPTIONS[1];
  const lifestyle =
    CAT_LIFESTYLE_OPTIONS.find((option) => option.id === catLifestyle) ||
    CAT_LIFESTYLE_OPTIONS[0];
  const baseLifespan = isDog ? size.lifespan : lifestyle.lifespan;
  const overrideValue =
    lifespanOverride === "" || lifespanOverride === null || lifespanOverride === undefined
      ? null
      : Number(lifespanOverride);
  const lifespan =
    Number.isFinite(overrideValue) && overrideValue > 0
      ? {
          min: overrideValue,
          max: overrideValue,
          avg: overrideValue,
          custom: true,
          source: "your estimate",
        }
      : {
          ...baseLifespan,
          custom: false,
          source: isDog ? `${size.label} dog average` : `${lifestyle.label} cat average`,
        };

  const petAge = getPetAge(dob, asOf);
  const human = computeHumanAge(petAge.exactYears, {
    type,
    dogSize,
    method,
    customFactor,
  });
  const humanClassic = petAge.exactYears * 7;
  const stage = getLifeStage(type, dogSize, petAge.exactYears);
  const lifespanPercent = Math.max(
    0,
    Math.min(1, petAge.exactYears / lifespan.avg)
  );
  const remainingYears = Math.max(0, lifespan.avg - petAge.exactYears);
  const pastTypical = petAge.exactYears > lifespan.max;
  const birthday = nextBirthday(dob, asOf);

  const milestones = MILESTONE_YEARS.map((years) => {
    const date = addYearsClamped(dob, years);
    const reached = date <= asOf;
    return {
      petYears: years,
      humanYears: computeHumanAge(years, {
        type,
        dogSize,
        method,
        customFactor,
      }).years,
      date,
      reached,
      beyond: years > lifespan.max,
      daysUntil: reached ? 0 : daysBetween(asOf, date),
    };
  });

  const rates = isDog
    ? { heart: 100, breath: 20, sleep: 13 }
    : { heart: 180, breath: 25, sleep: 14 };
  const days = petAge.totalDays;
  const stats = [
    {
      id: "days",
      label: "Days alive",
      value: days,
      approximate: false,
    },
    {
      id: "weeks",
      label: "Weeks alive",
      value: days / 7,
      approximate: false,
    },
    {
      id: "sleep",
      label: "Sleep hours",
      value: days * rates.sleep,
      approximate: true,
    },
    {
      id: "heartbeats",
      label: "Heartbeats",
      value: days * 1440 * rates.heart,
      approximate: true,
    },
    {
      id: "breaths",
      label: "Breaths",
      value: days * 1440 * rates.breath,
      approximate: true,
    },
    {
      id: "moons",
      label: "Full moons",
      value: days / 29.53059,
      approximate: false,
    },
  ];

  const comparisonCat = isDog ? CAT_LIFESTYLE_OPTIONS[0] : lifestyle;
  const comparison = [
    {
      key: "cat",
      label: "Cat",
      detail: comparisonCat.label,
      humanYears: computeHumanAge(petAge.exactYears, {
        type: PET_TYPES.CAT,
        method: METHODS.MODERN,
        dogSize,
        customFactor,
      }).years,
      stage: getLifeStage(PET_TYPES.CAT, dogSize, petAge.exactYears),
      lifespan: comparisonCat.lifespan,
      current: !isDog,
    },
    ...DOG_SIZE_OPTIONS.map((option) => ({
      key: `dog-${option.id}`,
      label: `${option.label} dog`,
      detail: option.range,
      humanYears: computeHumanAge(petAge.exactYears, {
        type: PET_TYPES.DOG,
        dogSize: option.id,
        method: METHODS.MODERN,
        customFactor,
      }).years,
      stage: getLifeStage(PET_TYPES.DOG, option.id, petAge.exactYears),
      lifespan: option.lifespan,
      current: isDog && option.id === size.id,
    })),
  ];

  let gotcha = null;
  let gotchaError = null;
  let together = null;
  if (gotchaValue) {
    const parsed = parseISODate(gotchaValue);
    if (!parsed) {
      gotchaError = "That gotcha day isn't a valid date.";
    } else if (parsed < dob) {
      gotchaError = "Gotcha day can't be before your pet's birthday.";
    } else if (parsed > asOf) {
      gotchaError = "Gotcha day can't be in the future.";
    } else {
      gotcha = parsed;
      const togetherAge = getPetAge(parsed, asOf);
      together = {
        ...togetherAge,
        label: formatYearsMonths(togetherAge),
      };
    }
  }

  const facts = [
    isDog ? DOG_GENERAL_FACT : CAT_GENERAL_FACT,
    isDog ? DOG_SIZE_FACTS[size.id] : CAT_LIFESTYLE_FACTS[lifestyle.id],
  ];

  return {
    ok: true,
    type,
    dogSize: size.id,
    catLifestyle: lifestyle.id,
    size,
    lifestyle,
    dob,
    asOf,
    gotcha,
    gotchaError,
    together,
    weightKg: Number.isFinite(weightKg) && weightKg > 0 ? weightKg : null,
    petAge,
    human,
    humanClassic,
    stage,
    lifespan,
    lifespanPercent,
    remainingYears,
    pastTypical,
    birthday,
    milestones,
    stats,
    comparison,
    facts,
    method,
    customFactor,
    suggestedSize:
      isDog && Number.isFinite(weightKg) && weightKg > 0
        ? classifyDogSize(weightKg)
        : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Share / export builders
// ─────────────────────────────────────────────────────────────────────────────
export function buildShareText(report, { name, units, decimals }) {
  const label =
    name?.trim() || (report.type === PET_TYPES.DOG ? "My dog" : "My cat");
  const typeLabel =
    report.type === PET_TYPES.DOG
      ? `${report.size.label} dog`
      : `${report.lifestyle.label} cat`;
  const lines = [
    `🐾 ${label} — pet age report`,
    `${typeLabel} · born ${formatDateUTC(report.dob)}`,
    "",
    `${formatYearsMonths(report.petAge)} old · ${formatNumber(
      report.petAge.totalDays,
      0
    )} days alive`,
    `Human equivalent: ${formatNumber(report.human.years, decimals)} years (${
      report.human.methodLabel
    })`,
    `Life stage: ${report.stage.label}`,
    `Typical lifespan: ${formatNumber(report.lifespan.min, 1)}–${formatNumber(
      report.lifespan.max,
      1
    )} years · ${Math.round(report.lifespanPercent * 100)}% lived`,
    report.birthday.isToday
      ? "Birthday: today! 🎂"
      : `Next birthday: ${formatDateUTC(report.birthday.date)} (${formatDayCount(
          report.birthday.days
        )})`,
  ];
  if (report.together) {
    lines.push(
      `Together since ${formatDateUTC(report.gotcha)} · ${report.together.label}`
    );
  }
  if (report.weightKg) {
    lines.push(`Weight: ${formatWeight(report.weightKg, units)}`);
  }
  lines.push(
    "",
    `Fun fact: ${report.facts[0]}`,
    "",
    `Made with ToolsTrek — ${TOOL_URL}`
  );
  return lines.join("\n");
}

export function buildShareUrl({
  type,
  dogSize,
  catLifestyle,
  dob,
  gotcha,
  asOf,
  name,
  method,
  customFactor,
  lifespanOverride,
  units,
  decimals,
  weightKg,
  showFacts,
  showCompare,
  showStats,
}) {
  const params = new URLSearchParams();
  if (type) params.set("t", type);
  if (type === PET_TYPES.DOG && dogSize) params.set("s", dogSize);
  if (type === PET_TYPES.CAT && catLifestyle) params.set("l", catLifestyle);
  if (dob) params.set("dob", dob);
  if (gotcha) params.set("g", gotcha);
  if (asOf) params.set("as", asOf);
  if (typeof name === "string" && name.trim()) {
    params.set("n", name.trim().slice(0, 30));
  }
  if (method && method !== METHODS.MODERN) params.set("m", method);
  if (method === METHODS.CUSTOM && Number.isFinite(customFactor)) {
    params.set("f", String(customFactor));
  }
  if (
    lifespanOverride !== "" &&
    lifespanOverride !== null &&
    lifespanOverride !== undefined &&
    Number.isFinite(Number(lifespanOverride))
  ) {
    params.set("e", String(Number(lifespanOverride)));
  }
  if (units === UNITS.IMPERIAL) params.set("u", "i");
  if (Number.isInteger(decimals) && decimals !== 1) params.set("d", String(decimals));
  if (Number.isFinite(weightKg) && weightKg > 0) {
    params.set("w", weightKg.toFixed(1));
  }
  if (showFacts === false) params.set("ff", "0");
  if (showCompare === false) params.set("cmp", "0");
  if (showStats === false) params.set("st", "0");
  const query = params.toString();
  return query ? `${TOOL_URL}?${query}` : TOOL_URL;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCSV(report, { units, decimals, name }) {
  const label =
    name?.trim() || (report.type === PET_TYPES.DOG ? "My dog" : "My cat");
  const rows = [
    ["Pet age report", label],
    ["Type", report.type === PET_TYPES.DOG ? "Dog" : "Cat"],
    [
      "Size / lifestyle",
      report.type === PET_TYPES.DOG ? report.size.label : report.lifestyle.label,
    ],
    ["Birthday", formatDateUTC(report.dob)],
    ["As of", formatDateUTC(report.asOf)],
    ["Age", formatYearsMonths(report.petAge)],
    ["Days alive", report.petAge.totalDays],
    [
      "Human age",
      `${formatNumber(report.human.years, decimals)} (${report.human.methodLabel})`,
    ],
    ["Life stage", report.stage.label],
    [
      "Typical lifespan",
      `${formatNumber(report.lifespan.min, 1)}–${formatNumber(report.lifespan.max, 1)} years`,
    ],
    ["Life lived", `${Math.round(report.lifespanPercent * 100)}%`],
    ["Next birthday", formatDateUTC(report.birthday.date)],
  ];
  if (report.weightKg) {
    rows.push(["Weight", formatWeight(report.weightKg, units)]);
  }
  rows.push([]);
  rows.push(["Pet years", "Human years", "Date reached", "Status"]);
  report.milestones.forEach((milestone) => {
    rows.push([
      milestone.petYears,
      formatNumber(milestone.humanYears, decimals),
      formatDateUTC(milestone.date),
      milestone.reached
        ? "Reached"
        : milestone.beyond
          ? "Beyond typical lifespan"
          : `In ${formatNumber(milestone.daysUntil / 365.2425, 1)} years`,
    ]);
  });
  return rows
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");
}

export function buildJSON(report, { name, units, decimals }) {
    return JSON.stringify(
    {
      tool: "ToolsTrek Dog & Cat Age Calculator",
      url: TOOL_URL,
      generatedAt: new Date().toISOString(),
      pet: {
        name: name?.trim() || null,
        type: report.type,
        size: report.type === PET_TYPES.DOG ? report.dogSize : null,
        lifestyle: report.type === PET_TYPES.CAT ? report.catLifestyle : null,
        birthday: toISODate(report.dob),
        asOf: toISODate(report.asOf),
        gotchaDay: report.gotcha ? toISODate(report.gotcha) : null,
        weight: report.weightKg
          ? units === UNITS.IMPERIAL
            ? `${formatNumber(report.weightKg * KG_TO_LB, 1)} lb`
            : `${formatNumber(report.weightKg, 1)} kg`
          : null,
      },
      age: {
        years: report.petAge.years,
        months: report.petAge.months,
        totalDays: report.petAge.totalDays,
        label: formatYearsMonths(report.petAge),
      },
      humanEquivalent: {
        years: Number(report.human.years.toFixed(decimals)),
        method: report.method,
        methodLabel: report.human.methodLabel,
        description: report.human.description,
        classicYears: Number(report.humanClassic.toFixed(decimals)),
      },
      lifeStage: {
        id: report.stage.id,
        label: report.stage.label,
        description: report.stage.description,
        nextStage: report.stage.nextLabel,
        nextStageInYears: report.stage.nextInYears,
      },
      lifespan: {
        min: report.lifespan.min,
        max: report.lifespan.max,
        average: report.lifespan.avg,
        custom: report.lifespan.custom,
        percentLived: Math.round(report.lifespanPercent * 100),
        remainingYears: Number(report.remainingYears.toFixed(1)),
      },
      nextBirthday: {
        date: toISODate(report.birthday.date),
        days: report.birthday.days,
        isToday: report.birthday.isToday,
      },
      milestones: report.milestones.map((milestone) => ({
        petYears: milestone.petYears,
        humanYears: Number(milestone.humanYears.toFixed(decimals)),
        date: toISODate(milestone.date),
        reached: milestone.reached,
        beyondTypicalLifespan: milestone.beyond,
      })),
      statistics: report.stats.map((stat) => ({
        id: stat.id,
        label: stat.label,
        value: Math.round(stat.value),
        approximate: stat.approximate,
      })),
      timeTogether: report.together
        ? {
            since: toISODate(report.gotcha),
            days: report.together.totalDays,
            label: report.together.label,
          }
        : null,
    },
    null,
    2
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO / FAQ content
// ─────────────────────────────────────────────────────────────────────────────
export const PET_FEATURES = [
  "Size-aware dog age conversion using the 15 + 9 + size-rate chart",
  "Cat age conversion with indoor, indoor-outdoor and outdoor lifestyle options",
  "Pet age in years and months, total days, weeks and full moons lived",
  "Human-equivalent age with a choice of size-aware, classic 7-year or custom methods",
  "Life-stage guide from puppy or kitten through adult, senior and geriatric",
  "Typical lifespan ranges by dog size and cat lifestyle, with an optional custom override",
  "Next birthday countdown, birthday milestones and optional gotcha-day tracking",
  "Estimated sleep hours, heartbeats and breaths over your pet's lifetime",
  "Dog vs cat comparison at the same age, across every dog size",
  "Shareable link, branded PNG report card, text summary, CSV and JSON export — 100% in your browser",
];

export const PET_FAQS = [
  {
    q: "How does the dog & cat age calculator work?",
    a: "It works out exactly how many Earth days your pet has been alive — from their birthday to the “as of” date you choose — then converts that real age into human years using the method you select. The default size-aware chart gives 15 human years for the first pet year, adds 9 for the second, then adds a yearly rate that depends on species: 4 per year for cats and small dogs, 5 for medium dogs, 6 for large dogs and 7 for giant dogs. The result is shown in years and months, alongside their life stage, expected lifespan and next birthday.",
  },
  {
    q: "How old is my dog in human years?",
    a: "A medium dog is roughly 24 human years old at age two, then gains about five human years for every additional dog year — so a 5-year-old medium dog is around 39 in human years. Size matters a lot: small breeds gain about four years per dog year, while giant breeds gain closer to seven. Choose your dog's size (or enter their weight and let the calculator suggest it) for an accurate conversion.",
  },
  {
    q: "Why do small dogs live longer than large dogs?",
    a: "Adult size is one of the strongest predictors of canine lifespan. Small breeds commonly live 12–16 years, medium breeds 11–14, large breeds 9–12 and giant breeds 7–10. Larger bodies age faster at a cellular level and put more strain on the heart and joints, which is why giant breeds are often considered senior by age six while a small dog may not be senior until nine or ten.",
  },
  {
    q: "How old is my cat in human years?",
    a: "Cats follow a similar early curve: the first year counts as about 15 human years and the second brings them to roughly 24. After that, each cat year adds around four human years, so a 10-year-old cat is about 56 in human years and a 15-year-old cat is about 76. Indoor cats commonly live 13–17 years, while outdoor-only cats average far less.",
  },
  {
    q: "Is the “multiply by 7” rule accurate?",
    a: "No — it is a handy shortcut, not a scientific formula. Pets mature much faster than humans in their first two years, and lifespan varies enormously with species, adult size and lifestyle. The calculator keeps the classic 7× rule as an option for comparison, but the default size-aware chart is a much better reflection of how dogs and cats actually age.",
  },
  {
    q: "When does my pet become a senior?",
    a: "It depends on species and size. Small dogs are typically senior from about 9, medium dogs from 8, large dogs from 7 and giant dogs from 6. Cats usually enter their senior years around 11. The life-stage guide highlights your pet's current stage and shows how many years remain until the next one, along with practical care notes for that stage.",
  },
  {
    q: "Can I change the expected lifespan?",
    a: "Yes. The calculator uses typical ranges by dog size and cat lifestyle, but you can override the expected lifespan anywhere from 1 to 30 years. That is useful for a breed with known longevity, a rescue with an uncertain history, or a pet under veterinary care. The life-lived percentage, remaining years and comparison panels all update to match your estimate.",
  },
  {
    q: "Does indoor or outdoor lifestyle really matter for cats?",
    a: "It is one of the biggest factors in feline life expectancy. Indoor cats commonly reach 13–17 years, cats with some outdoor access average around 10–14, and outdoor-only cats often live only 5–10 years because of traffic, predators, weather and infectious disease. Choosing the right lifestyle keeps the lifespan estimate honest without changing the age conversion itself.",
  },
  {
    q: "Is my pet's information stored or uploaded anywhere?",
    a: "No. The calculator runs entirely in your browser. Names, birthdays and preferences are saved only in your own browser's localStorage so the tool can remember them, and a share link keeps the details in the URL you create. Nothing is sent to a server, logged or tracked.",
  },
];
