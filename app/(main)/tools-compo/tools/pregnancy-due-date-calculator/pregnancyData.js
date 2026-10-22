export const PREGNANCY_MODES = [
  {
    id: "lmp",
    label: "Last period",
    short: "LMP",
    tagline: "Naegele's rule",
    description: "Add 280 days to the first day of your last menstrual period, adjusted for your cycle length.",
    icon: "CalendarDays",
  },
  {
    id: "conception",
    label: "Conception date",
    short: "Conception",
    tagline: "38 weeks",
    description: "Add 266 days to a known conception date. Useful when ovulation or insemination timing is known.",
    icon: "Heart",
  },
  {
    id: "ultrasound",
    label: "Ultrasound scan",
    short: "Scan",
    tagline: "Scan dating",
    description: "Use the gestational age measured at an ultrasound scan to estimate the remaining 40 weeks.",
    icon: "ScanLine",
  },
  {
    id: "ivf",
    label: "IVF transfer",
    short: "IVF",
    tagline: "Transfer dating",
    description: "Date from a day-3, day-5 or day-6 embryo transfer with the standard IVF due-date offsets.",
    icon: "TestTube2",
  },
];

export const EMBRYO_DAYS = [
  { value: 3, label: "Day 3 embryo (cleavage stage)" },
  { value: 5, label: "Day 5 blastocyst" },
  { value: 6, label: "Day 6 blastocyst" },
];

export const DEFAULT_PREGNANCY = {
  mode: "lmp",
  lmpDate: "2026-02-01",
  cycleLength: 28,
  conceptionDate: "2026-01-15",
  scanDate: "2026-03-01",
  scanWeeks: 8,
  scanDays: 2,
  transferDate: "2026-01-20",
  embryoDay: 5,
};

export const MILESTONE_DEFINITIONS = [
  {
    id: "screening",
    label: "First-trimester screening",
    startWeek: 11,
    startDay: 0,
    endWeek: 13,
    endDay: 6,
    description: "The usual window for combined screening and nuchal translucency assessment.",
  },
  {
    id: "second-trimester",
    label: "Second trimester begins",
    startWeek: 14,
    startDay: 0,
    endWeek: 14,
    endDay: 0,
    description: "Many people share their news and begin planning the mid-pregnancy check-up.",
  },
  {
    id: "anatomy",
    label: "Anatomy scan window",
    startWeek: 18,
    startDay: 0,
    endWeek: 22,
    endDay: 6,
    description: "A detailed ultrasound usually checks growth, organs, placenta and amniotic fluid.",
  },
  {
    id: "viability",
    label: "Viability milestone",
    startWeek: 24,
    startDay: 0,
    endWeek: 24,
    endDay: 0,
    description: "A clinical reference point, not a guarantee; care and outcomes vary widely.",
  },
  {
    id: "third-trimester",
    label: "Third trimester begins",
    startWeek: 28,
    startDay: 0,
    endWeek: 28,
    endDay: 0,
    description: "Growth checks often become more frequent and birth preparation starts in earnest.",
  },
  {
    id: "term",
    label: "Full-term window opens",
    startWeek: 37,
    startDay: 0,
    endWeek: 37,
    endDay: 0,
    description: "Babies born from 37 weeks are considered early term rather than premature.",
  },
  {
    id: "due",
    label: "Estimated due date",
    startWeek: 40,
    startDay: 0,
    endWeek: 40,
    endDay: 0,
    description: "Only around 4% of babies arrive exactly on their estimated due date.",
  },
  {
    id: "post-term",
    label: "Post-term threshold",
    startWeek: 42,
    startDay: 0,
    endWeek: 42,
    endDay: 0,
    description: "Care teams usually discuss closer monitoring or induction around this point.",
  },
];

export function parseISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
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

export function dateToISO(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function localTodayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return "";
  date.setUTCDate(date.getUTCDate() + Math.round(days));
  return dateToISO(date);
}

export function daysBetweenISO(startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function formatDateLong(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateShort(isoDate, includeYear = true) {
  const date = parseISODate(isoDate);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(date);
}

export function formatDateRange(startISO, endISO) {
  if (!endISO || startISO === endISO) return formatDateShort(startISO);
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (!start || !end) return "—";
  if (start.getUTCFullYear() === end.getUTCFullYear()) {
    return `${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(start)} – ${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(end)}`;
  }
  return `${formatDateShort(startISO)} – ${formatDateShort(endISO)}`;
}

export function formatWeeksDays(totalDays) {
  if (!Number.isFinite(totalDays)) return "—";
  if (totalDays < 0) return "—";
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return `${weeks}w ${days}d`;
}

export function getTrimester(gaDays) {
  if (!Number.isFinite(gaDays) || gaDays < 0) {
    return { number: 0, label: "Not yet pregnant", short: "—" };
  }
  if (gaDays < 14 * 7) return { number: 1, label: "First trimester", short: "1st" };
  if (gaDays < 28 * 7) return { number: 2, label: "Second trimester", short: "2nd" };
  return { number: 3, label: "Third trimester", short: "3rd" };
}

function dateInAllowedRange(isoDate, referenceISO) {
  if (!parseISODate(isoDate)) return false;
  if (referenceISO && isoDate > referenceISO) return false;
  return isoDate >= "1900-01-01" && isoDate <= "2100-12-31";
}

function buildMilestones(dueDate, assessmentDate) {
  return MILESTONE_DEFINITIONS.map((definition) => {
    const startDaysFromDue = definition.startWeek * 7 + definition.startDay - 280;
    const endDaysFromDue = definition.endWeek * 7 + definition.endDay - 280;
    const startDate = addDaysISO(dueDate, startDaysFromDue);
    const endDate = addDaysISO(dueDate, endDaysFromDue);
    let status = "upcoming";
    if (assessmentDate) {
      if (assessmentDate > endDate) status = "passed";
      else if (assessmentDate >= startDate) status = "current";
    }
    return {
      ...definition,
      startDate,
      endDate,
      status,
    };
  });
}

export function calculatePregnancy(input, referenceDate) {
  const errors = {};
  const reference = referenceDate || localTodayISO();
  if (!parseISODate(reference)) {
    errors.referenceDate = "Enter a valid assessment date.";
  } else if (reference < "1900-01-01" || reference > "2100-12-31") {
    errors.referenceDate = "Assessment date must be between 1900 and 2100.";
  }

  let dueDate = "";
  let methodLabel = "";
  let methodDetail = "";
  let extra = {};

  if (input.mode === "lmp") {
    if (!parseISODate(input.lmpDate)) {
      errors.lmpDate = "Choose the first day of your last period.";
    } else if (input.lmpDate > reference) {
      errors.lmpDate = "Last period date cannot be after the assessment date.";
    } else if (input.lmpDate < "1900-01-01") {
      errors.lmpDate = "Last period date is too far in the past.";
    }
    const cycle = Number(input.cycleLength);
    if (!Number.isInteger(cycle) || cycle < 20 || cycle > 45) {
      errors.cycleLength = "Cycle length must be a whole number from 20 to 45 days.";
    }

    if (!errors.lmpDate && !errors.cycleLength) {
      const adjustment = cycle - 28;
      dueDate = addDaysISO(input.lmpDate, 280 + adjustment);
      methodLabel = `Last menstrual period · ${cycle}-day cycle`;
      methodDetail = `LMP + 280 days${adjustment === 0 ? "" : ` ${adjustment > 0 ? "+" : "−"} ${Math.abs(adjustment)} day${Math.abs(adjustment) === 1 ? "" : "s"} for cycle length`}`;
      extra = { cycleLength: cycle, cycleAdjustment: adjustment };
    }
  } else if (input.mode === "conception") {
    if (!parseISODate(input.conceptionDate)) {
      errors.conceptionDate = "Choose a valid conception date.";
    } else if (input.conceptionDate > reference) {
      errors.conceptionDate = "Conception date cannot be after the assessment date.";
    } else if (input.conceptionDate < "1900-01-01") {
      errors.conceptionDate = "Conception date is too far in the past.";
    }

    if (!errors.conceptionDate) {
      dueDate = addDaysISO(input.conceptionDate, 266);
      methodLabel = "Known conception date";
      methodDetail = "Conception date + 266 days (38 weeks)";
      extra = { conceptionDate: input.conceptionDate };
    }
  } else if (input.mode === "ultrasound") {
    if (!parseISODate(input.scanDate)) {
      errors.scanDate = "Choose a valid ultrasound scan date.";
    } else if (input.scanDate > reference) {
      errors.scanDate = "Scan date cannot be after the assessment date.";
    } else if (input.scanDate < "1900-01-01") {
      errors.scanDate = "Scan date is too far in the past.";
    }
    const weeks = Number(input.scanWeeks);
    const days = Number(input.scanDays);
    if (!Number.isInteger(weeks) || weeks < 4 || weeks > 42) {
      errors.scanWeeks = "Scan age must be between 4 and 42 weeks.";
    }
    if (!Number.isInteger(days) || days < 0 || days > 6) {
      errors.scanDays = "Scan days must be a whole number from 0 to 6.";
    }

    if (!errors.scanDate && !errors.scanWeeks && !errors.scanDays) {
      const scanAgeDays = weeks * 7 + days;
      dueDate = addDaysISO(input.scanDate, 280 - scanAgeDays);
      methodLabel = "Ultrasound dating scan";
      methodDetail = `${formatDateShort(input.scanDate)} scan at ${weeks}w ${days}d + remaining ${formatWeeksDays(280 - scanAgeDays)}`;
      extra = { scanAgeDays };
    }
  } else if (input.mode === "ivf") {
    if (!parseISODate(input.transferDate)) {
      errors.transferDate = "Choose a valid embryo transfer date.";
    } else if (input.transferDate > reference) {
      errors.transferDate = "Transfer date cannot be after the assessment date.";
    } else if (input.transferDate < "1900-01-01") {
      errors.transferDate = "Transfer date is too far in the past.";
    }
    const embryoDay = Number(input.embryoDay);
    if (![3, 5, 6].includes(embryoDay)) {
      errors.embryoDay = "Choose a day-3, day-5 or day-6 embryo transfer.";
    }

    if (!errors.transferDate && !errors.embryoDay) {
      dueDate = addDaysISO(input.transferDate, 266 - embryoDay);
      methodLabel = `IVF · day-${embryoDay} embryo transfer`;
      methodDetail = `Transfer date + ${266 - embryoDay} days`;
      extra = { embryoDay };
    }
  } else {
    errors.mode = "Choose how you would like to date the pregnancy.";
  }

  if (dueDate && (dueDate < "1900-01-01" || dueDate > "2100-12-31")) {
    errors.dueDate = "The calculated due date falls outside the supported date range.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, referenceDate: reference, mode: input.mode };
  }

  const dueDays = daysBetweenISO(reference, dueDate);
  const gaDays = 280 - dueDays;
  const lmpEquivalent = addDaysISO(dueDate, -280);
  const conceptionEstimate = addDaysISO(dueDate, -266);
  const implantationStart = addDaysISO(conceptionEstimate, 6);
  const implantationEnd = addDaysISO(conceptionEstimate, 12);
  const fullTermStart = addDaysISO(dueDate, -21);
  const fullTermEnd = addDaysISO(dueDate, 14);
  const trimester = getTrimester(gaDays);
  const progressPercent = Math.min(100, Math.max(0, (gaDays / 280) * 100));
  const milestones = buildMilestones(dueDate, reference);
  const currentMilestone = milestones.find((milestone) => milestone.status === "current");
  const nextMilestone = milestones.find((milestone) => milestone.status === "upcoming");
  const weeks = gaDays >= 0 ? Math.floor(gaDays / 7) : 0;
  const days = gaDays >= 0 ? gaDays % 7 : 0;
  const fetalAgeDays = gaDays - 14;

  return {
    ok: true,
    errors: {},
    referenceDate: reference,
    dueDate,
    dueDay: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "UTC",
    }).format(parseISODate(dueDate)),
    dueDays,
    daysToDue: dueDays,
    isOverdue: dueDays < 0,
    gaDays,
    gaWeeks: weeks,
    gaRemainderDays: days,
    gaLabel: formatWeeksDays(gaDays),
    trimester,
    progressPercent,
    conceptionEstimate,
    implantationStart,
    implantationEnd,
    fullTermStart,
    fullTermEnd,
    lmpEquivalent,
    fetalAgeDays,
    fetalAgeLabel: fetalAgeDays >= 0 ? formatWeeksDays(fetalAgeDays) : "—",
    milestones,
    currentMilestone,
    nextMilestone,
    methodLabel,
    methodDetail,
    mode: input.mode,
    ...extra,
  };
}

export function pregnancySummary(input, result) {
  const lines = [
    "PREGNANCY DUE DATE SUMMARY — TOOLSTREK",
    "----------------------------------------",
    `Estimated due date: ${formatDateLong(result.dueDate)}`,
    `Method: ${result.methodLabel}`,
    `Calculation: ${result.methodDetail}`,
    `Assessment date: ${formatDateLong(result.referenceDate)}`,
    `Gestational age: ${result.gaLabel} (${result.trimester.label})`,
    result.isOverdue
      ? `Due date passed ${Math.abs(result.daysToDue)} day${Math.abs(result.daysToDue) === 1 ? "" : "s"} ago`
      : `${result.daysToDue} day${result.daysToDue === 1 ? "" : "s"} to the estimated due date`,
    `Conception estimate: ${formatDateShort(result.conceptionEstimate)}`,
    `Implantation window estimate: ${formatDateRange(result.implantationStart, result.implantationEnd)}`,
    `Full-term window: ${formatDateRange(result.fullTermStart, result.fullTermEnd)}`,
    "",
    "MILESTONES",
  ];

  result.milestones.forEach((milestone) => {
    lines.push(
      `${milestone.label}: ${formatDateRange(milestone.startDate, milestone.endDate)} (${milestone.status})`,
    );
  });

  lines.push("", "This is an estimate, not medical advice. Your care team's dating scan is the best guide.");
  lines.push("Generated with ToolsTrek Pregnancy Due Date Calculator");
  lines.push("https://toolstrek.vercel.app/tools/pregnancy-due-date-calculator");
  return lines.join("\n");
}

function escapeIcsText(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function addOneDay(isoDate) {
  return addDaysISO(isoDate, 1);
}

export function buildPregnancyIcs(result, input) {
  const dtstamp = `${(result.referenceDate || localTodayISO()).replaceAll("-", "")}T000000Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ToolsTrek//Pregnancy Due Date Calculator//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Pregnancy milestones",
  ];

  const events = [
    {
      uid: "estimated-due-date",
      start: result.dueDate,
      end: addOneDay(result.dueDate),
      summary: "Estimated due date",
      description: `Based on ${result.methodLabel}. ${result.methodDetail}.`,
    },
    ...result.milestones
      .filter((milestone) => milestone.id !== "due")
      .map((milestone) => ({
        uid: milestone.id,
        start: milestone.startDate,
        end: addOneDay(milestone.endDate),
        summary: milestone.label,
        description: milestone.description,
      })),
  ];

  events.forEach((event) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:pregnancy-${event.uid}-${result.dueDate.replaceAll("-", "")}@toolstrek`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${event.start.replaceAll("-", "")}`,
      `DTEND;VALUE=DATE:${event.end.replaceAll("-", "")}`,
      `SUMMARY:${escapeIcsText(event.summary)}`,
      `DESCRIPTION:${escapeIcsText(event.description)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export const PREGNANCY_TIPS = [
  {
    title: "Your scan is the strongest dating clue",
    body: "Early ultrasound measurements are generally more accurate than LMP dating, especially when cycles are irregular. If your care team changes the due date after a scan, use their date for appointments and decisions.",
  },
  {
    title: "A due date is a window, not an appointment",
    body: "Only about 4% of babies are born on the estimated date. Most arrive within two weeks either side. The 37–42 week full-term window matters more than a single day.",
  },
  {
    title: "Bring the estimate to your first visit",
    body: "Write down the LMP, cycle length or transfer date you used. Your midwife or doctor can check the calculation and decide whether a dating scan should adjust it.",
  },
];

export const PREGNANCY_FAQS = [
  {
    question: "How is the pregnancy due date calculated?",
    answer:
      "The most common method is Naegele's rule: add 280 days (40 weeks) to the first day of your last menstrual period. If your cycle is longer or shorter than 28 days, the calculator adjusts the date by the difference. A known conception date uses 266 days, an ultrasound uses the measured gestational age, and IVF uses a fixed offset based on embryo age.",
  },
  {
    question: "Why does my cycle length change the due date?",
    answer:
      "Naegele's rule assumes ovulation on day 14 of a 28-day cycle. If your cycle is 32 days, ovulation is typically later, so the calculator adds 4 days. A 26-day cycle moves the due date 2 days earlier. This is still an estimate; an early dating scan can refine it.",
  },
  {
    question: "What is the difference between gestational age and fetal age?",
    answer:
      "Gestational age is counted from the first day of the last period, even though conception happens about two weeks later. Fetal or embryonic age is counted from conception, so it is usually about 14 days less than gestational age. Pregnancy care almost always uses gestational age.",
  },
  {
    question: "How accurate is an ultrasound due date?",
    answer:
      "An early first-trimester scan is usually accurate to within about 5–7 days, and sometimes closer. Later scans are less precise for dating because babies grow at different rates. This calculator simply converts the scan's reported weeks and days into an estimated 40-week due date.",
  },
  {
    question: "How does IVF transfer dating work?",
    answer:
      "For a day-5 blastocyst transfer, the due date is 261 days after the transfer (266 minus 5). Day-3 and day-6 transfers use 263 and 260 days. This relies on the transfer date and embryo age provided by your fertility clinic, which is usually more precise than LMP dating.",
  },
  {
    question: "What do the milestone dates mean?",
    answer:
      "Milestones are typical gestational windows for screening, scans and trimester boundaries, not personalised medical instructions. Your care team may schedule appointments differently based on your history, local guidelines and the results of earlier tests.",
  },
  {
    question: "Is my information private and is this medical advice?",
    answer:
      "Yes, every date is calculated in your browser and nothing is uploaded. This tool provides educational estimates only and does not replace medical advice. Always confirm your due date and care schedule with a qualified healthcare professional.",
  },
];
