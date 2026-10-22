// Meeting Time Planner — time-zone catalogue, working-hour scoring and calendar
// export helpers. Everything is deterministic and runs in the browser; Intl
// supplies the IANA time-zone database so DST changes are handled automatically.

export const MINUTE_MS = 60_000;
export const MIN_PARTICIPANTS = 2;
export const MAX_PARTICIPANTS = 8;

export const PARTICIPANT_COLORS = [
  "#0f766e",
  "#2563eb",
  "#c026d3",
  "#ea580c",
  "#0891b2",
  "#7c3aed",
  "#be123c",
  "#4d7c0f",
];

export const TIMEZONE_CITIES = [
  { timezone: "UTC", city: "UTC", country: "Coordinated Universal Time" },
  { timezone: "America/New_York", city: "New York", country: "United States" },
  { timezone: "America/Chicago", city: "Chicago", country: "United States" },
  { timezone: "America/Denver", city: "Denver", country: "United States" },
  { timezone: "America/Los_Angeles", city: "Los Angeles", country: "United States" },
  { timezone: "America/Anchorage", city: "Anchorage", country: "United States" },
  { timezone: "Pacific/Honolulu", city: "Honolulu", country: "United States" },
  { timezone: "America/Toronto", city: "Toronto", country: "Canada" },
  { timezone: "America/Vancouver", city: "Vancouver", country: "Canada" },
  { timezone: "America/Mexico_City", city: "Mexico City", country: "Mexico" },
  { timezone: "America/Bogota", city: "Bogotá", country: "Colombia" },
  { timezone: "America/Lima", city: "Lima", country: "Peru" },
  { timezone: "America/Santiago", city: "Santiago", country: "Chile" },
  { timezone: "America/Sao_Paulo", city: "São Paulo", country: "Brazil" },
  { timezone: "America/Argentina/Buenos_Aires", city: "Buenos Aires", country: "Argentina" },
  { timezone: "Europe/London", city: "London", country: "United Kingdom" },
  { timezone: "Europe/Dublin", city: "Dublin", country: "Ireland" },
  { timezone: "Europe/Lisbon", city: "Lisbon", country: "Portugal" },
  { timezone: "Europe/Paris", city: "Paris", country: "France" },
  { timezone: "Europe/Berlin", city: "Berlin", country: "Germany" },
  { timezone: "Europe/Madrid", city: "Madrid", country: "Spain" },
  { timezone: "Europe/Rome", city: "Rome", country: "Italy" },
  { timezone: "Europe/Amsterdam", city: "Amsterdam", country: "Netherlands" },
  { timezone: "Europe/Brussels", city: "Brussels", country: "Belgium" },
  { timezone: "Europe/Zurich", city: "Zurich", country: "Switzerland" },
  { timezone: "Europe/Vienna", city: "Vienna", country: "Austria" },
  { timezone: "Europe/Stockholm", city: "Stockholm", country: "Sweden" },
  { timezone: "Europe/Oslo", city: "Oslo", country: "Norway" },
  { timezone: "Europe/Copenhagen", city: "Copenhagen", country: "Denmark" },
  { timezone: "Europe/Helsinki", city: "Helsinki", country: "Finland" },
  { timezone: "Europe/Warsaw", city: "Warsaw", country: "Poland" },
  { timezone: "Europe/Prague", city: "Prague", country: "Czechia" },
  { timezone: "Europe/Budapest", city: "Budapest", country: "Hungary" },
  { timezone: "Europe/Athens", city: "Athens", country: "Greece" },
  { timezone: "Europe/Bucharest", city: "Bucharest", country: "Romania" },
  { timezone: "Europe/Istanbul", city: "Istanbul", country: "Türkiye" },
  { timezone: "Europe/Kyiv", city: "Kyiv", country: "Ukraine" },
  { timezone: "Europe/Moscow", city: "Moscow", country: "Russia" },
  { timezone: "Africa/Cairo", city: "Cairo", country: "Egypt" },
  { timezone: "Africa/Lagos", city: "Lagos", country: "Nigeria" },
  { timezone: "Africa/Nairobi", city: "Nairobi", country: "Kenya" },
  { timezone: "Africa/Johannesburg", city: "Johannesburg", country: "South Africa" },
  { timezone: "Africa/Casablanca", city: "Casablanca", country: "Morocco" },
  { timezone: "Asia/Jerusalem", city: "Jerusalem", country: "Israel" },
  { timezone: "Asia/Riyadh", city: "Riyadh", country: "Saudi Arabia" },
  { timezone: "Asia/Dubai", city: "Dubai", country: "United Arab Emirates" },
  { timezone: "Asia/Tehran", city: "Tehran", country: "Iran" },
  { timezone: "Asia/Karachi", city: "Karachi", country: "Pakistan" },
  { timezone: "Asia/Kolkata", city: "New Delhi", country: "India" },
  { timezone: "Asia/Colombo", city: "Colombo", country: "Sri Lanka" },
  { timezone: "Asia/Kathmandu", city: "Kathmandu", country: "Nepal" },
  { timezone: "Asia/Dhaka", city: "Dhaka", country: "Bangladesh" },
  { timezone: "Asia/Bangkok", city: "Bangkok", country: "Thailand" },
  { timezone: "Asia/Jakarta", city: "Jakarta", country: "Indonesia" },
  { timezone: "Asia/Singapore", city: "Singapore", country: "Singapore" },
  { timezone: "Asia/Kuala_Lumpur", city: "Kuala Lumpur", country: "Malaysia" },
  { timezone: "Asia/Manila", city: "Manila", country: "Philippines" },
  { timezone: "Asia/Hong_Kong", city: "Hong Kong", country: "Hong Kong" },
  { timezone: "Asia/Shanghai", city: "Shanghai", country: "China" },
  { timezone: "Asia/Taipei", city: "Taipei", country: "Taiwan" },
  { timezone: "Asia/Seoul", city: "Seoul", country: "South Korea" },
  { timezone: "Asia/Tokyo", city: "Tokyo", country: "Japan" },
  { timezone: "Australia/Perth", city: "Perth", country: "Australia" },
  { timezone: "Australia/Adelaide", city: "Adelaide", country: "Australia" },
  { timezone: "Australia/Brisbane", city: "Brisbane", country: "Australia" },
  { timezone: "Australia/Sydney", city: "Sydney", country: "Australia" },
  { timezone: "Australia/Melbourne", city: "Melbourne", country: "Australia" },
  { timezone: "Pacific/Auckland", city: "Auckland", country: "New Zealand" },
  { timezone: "Pacific/Fiji", city: "Suva", country: "Fiji" },
];

function buildTimeZoneOptions() {
  const popular = TIMEZONE_CITIES.map((item) => ({
    ...item,
    label: `${item.city}, ${item.country}`,
  }));
  const known = new Set(TIMEZONE_CITIES.map((item) => item.timezone));
  let others = [];

  try {
    const supported =
      typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("timeZone")
        : [];
    others = supported
      .filter((zone) => !known.has(zone))
      .map((zone) => ({
        timezone: zone,
        city: zone.split("/").pop().replace(/_/g, " "),
        country: zone.split("/")[0].replace(/_/g, " "),
        label: zone.replace(/_/g, " "),
      }));
  } catch {
    others = [];
  }

  return { popular, others };
}

export const TIMEZONE_OPTIONS = buildTimeZoneOptions();

export const DEFAULT_PARTICIPANTS = [
  {
    id: "participant-1",
    name: "Amara",
    timezone: "America/New_York",
    color: PARTICIPANT_COLORS[0],
  },
  {
    id: "participant-2",
    name: "Leo",
    timezone: "Europe/London",
    color: PARTICIPANT_COLORS[1],
  },
  {
    id: "participant-3",
    name: "Priya",
    timezone: "Asia/Dubai",
    color: PARTICIPANT_COLORS[2],
  },
  {
    id: "participant-4",
    name: "Sofia",
    timezone: "Europe/Berlin",
    color: PARTICIPANT_COLORS[3],
  },
];

export const DEFAULT_SETTINGS = {
  workStart: "09:00",
  workEnd: "17:00",
  workdays: [1, 2, 3, 4, 5],
  stepMinutes: 30,
  horizon: "day",
  timeFormat: "24",
  onlyWorkable: false,
  prioritizeOrganizer: true,
};

export const DEFAULT_MEETING = {
  title: "Global product sync",
  date: "2026-11-10",
  durationMinutes: 45,
};

export const WEEKDAYS = [
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
  { value: 0, short: "Sun", label: "Sunday" },
];

export const HORIZONS = [
  { value: "day", label: "This day only", hint: "Search every slot on the chosen date." },
  {
    value: "next5",
    label: "Next 5 working days",
    hint: "Include the chosen date and the following working days.",
  },
  {
    value: "next7",
    label: "Next 7 days",
    hint: "Include weekends so you can compare every option.",
  },
];

export const STATUS_META = {
  work: {
    label: "Working hours",
    short: "Work",
    penalty: 0,
    tone: "emerald",
  },
  early: {
    label: "Before hours",
    short: "Early",
    penalty: 22,
    tone: "amber",
  },
  late: {
    label: "After hours",
    short: "Late",
    penalty: 22,
    tone: "amber",
  },
  outside: {
    label: "Outside hours",
    short: "Outside",
    penalty: 45,
    tone: "rose",
  },
  night: {
    label: "Night",
    short: "Night",
    penalty: 65,
    tone: "rose",
  },
  weekend: {
    label: "Weekend",
    short: "Weekend",
    penalty: 42,
    tone: "rose",
  },
};

export const MEETING_FAQS = [
  {
    question: "How does the Meeting Time Planner find the best time?",
    answer:
      "For every candidate slot it converts the same instant into each participant's local time using the IANA time-zone database. A slot earns the highest score when everybody is inside their working hours, loses points when someone is early, late, outside hours, asleep or on a weekend, and loses a small amount when the meeting lands on a different calendar date for part of the group. The highest-scoring slots are ranked, and the day map highlights the best option in every hour.",
  },
  {
    question: "Does it handle daylight saving time and half-hour offsets?",
    answer:
      "Yes. The conversion uses each participant's IANA zone for the actual meeting date, so daylight saving, half-hour offsets such as India, 45-minute offsets such as Nepal, and date-line crossings are all applied automatically. If a local wall time does not exist because of a spring-forward change, the planner moves to the nearest valid instant and still returns a usable slot.",
  },
  {
    question: "What should I do when no time works for everyone?",
    answer:
      "That is common for genuinely global teams. Turn off the 'Only perfect overlaps' filter, then compare the ranked compromises: the score, the number of people inside working hours, and the local time for each participant make the trade-off visible. Rotating the inconvenient slot between regions, shortening the meeting, or recording it for one participant are all fairer long-term solutions than asking the same person to join at midnight every time.",
  },
  {
    question: "How do working hours and weekends affect the score?",
    answer:
      "You can set a shared working window such as 09:00–17:00, choose which weekdays count, and use the meeting duration when checking the end time. A meeting that starts inside working hours but runs past the end is marked late. Weekends and nights carry larger penalties. The default sample deliberately spans New York, London, Dubai and Berlin, so it often has no perfect overlap and shows how the tool surfaces the best compromise instead of hiding it.",
  },
  {
    question: "Can I export the meeting to my calendar?",
    answer:
      "Yes. Select a slot and download a standards-compliant .ics invite with the correct UTC start and end times, participants, local times and a description. It imports into Google Calendar, Outlook, Apple Calendar and most other calendar apps. You can also copy a plain-text summary for chat or email.",
  },
  {
    question: "Is my meeting information private?",
    answer:
      "Completely. Participant names, time zones, dates and results are processed in your browser with the built-in Intl APIs. Nothing is uploaded, logged or saved on a server, and there is no account or tracking. Closing the tab clears the meeting.",
  },
];

export const MEETING_TIPS = [
  {
    title: "Protect focus time",
    text: "A 45-minute slot leaves room for the context switch on either side. Prefer 25 or 45 minutes over a full hour when the agenda is small.",
  },
  {
    title: "Rotate the pain",
    text: "If one region always takes the late slot, rotate the inconvenient time between meetings so the same people are not repeatedly disadvantaged.",
  },
  {
    title: "Share the local times",
    text: "Paste the copied summary into the invite so every participant sees their own clock, including the day shift, before accepting.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Date and time-zone helpers
// ─────────────────────────────────────────────────────────────────────────────

const zonedFormatterCache = new Map();

function getZonedFormatter(timeZone) {
  if (!zonedFormatterCache.has(timeZone)) {
    zonedFormatterCache.set(
      timeZone,
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
    );
  }
  return zonedFormatterCache.get(timeZone);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function pad(value) {
  return String(value).padStart(2, "0");
}

export function parseClock(value, fallback = 0) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || ""));
  if (!match) return fallback;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return fallback;
  return hour * 60 + minute;
}

export function formatTime(minutesOfDay, timeFormat = "24") {
  const normalized = ((Math.round(minutesOfDay) % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  if (timeFormat === "12") {
    const suffix = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${pad(minute)} ${suffix}`;
  }
  return `${pad(hour)}:${pad(minute)}`;
}

export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return {
    year,
    month,
    day,
    weekday: check.getUTCDay(),
    iso: `${year}-${pad(month)}-${pad(day)}`,
    dateUTC: check.getTime(),
  };
}

export function addDaysToISO(dateValue, days) {
  const parts = parseISODate(dateValue);
  if (!parts) return dateValue;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return date.toISOString().slice(0, 10);
}

export function formatDateLong(parts) {
  if (!parts) return "";
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    },
  );
}

export function formatDateShort(parts) {
  if (!parts) return "";
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
  );
}

export function formatDuration(minutes) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (!hours) return `${mins} min`;
  if (!mins) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export function daysBetweenParts(a, b) {
  if (!a || !b) return 0;
  return Math.round(
    (Date.UTC(a.year, a.month - 1, a.day) -
      Date.UTC(b.year, b.month - 1, b.day)) /
      86_400_000,
  );
}

export function getZonedParts(utcMs, timeZone) {
  const parts = getZonedFormatter(timeZone).formatToParts(new Date(utcMs));
  const map = {};
  parts.forEach((part) => {
    if (part.type !== "literal") map[part.type] = part.value;
  });
  const year = Number(map.year);
  const month = Number(map.month);
  const day = Number(map.day);
  const hour = Number(map.hour) % 24;
  const minute = Number(map.minute);
  return {
    year,
    month,
    day,
    hour,
    minute,
    minutesOfDay: hour * 60 + minute,
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
    iso: `${year}-${pad(month)}-${pad(day)}`,
    dateUTC: Date.UTC(year, month - 1, day),
  };
}

/**
 * Convert a wall-clock date and time in a specific IANA zone into a UTC
 * timestamp. Two correction passes handle daylight-saving transitions.
 */
export function zonedWallToUtc({ year, month, day, hour, minute }, timeZone) {
  const targetMinutes = hour * 60 + minute;
  let guess = Date.UTC(year, month - 1, day, hour, minute);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = getZonedParts(guess, timeZone);
    const actualMinutes = actual.minutesOfDay;
    const dayDifference = daysBetweenParts({ year, month, day }, actual);
    const difference = targetMinutes - actualMinutes + dayDifference * 1440;
    if (difference === 0) break;
    guess += difference * MINUTE_MS;
  }

  return guess;
}

export function formatGmtOffset(utcMs, timeZone) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    });
    const name = formatter
      .formatToParts(new Date(utcMs))
      .find((part) => part.type === "timeZoneName")?.value;
    return name || "GMT";
  } catch {
    return "GMT";
  }
}

export function getTimeZoneLabel(timeZone) {
  const known = TIMEZONE_CITIES.find((item) => item.timezone === timeZone);
  if (known) return `${known.city}, ${known.country}`;
  const segments = String(timeZone || "UTC").split("/");
  return segments[segments.length - 1].replace(/_/g, " ");
}

export function getTimeZoneCity(timeZone) {
  const known = TIMEZONE_CITIES.find((item) => item.timezone === timeZone);
  if (known) return known.city;
  const segments = String(timeZone || "UTC").split("/");
  return segments[segments.length - 1].replace(/_/g, " ");
}

export function getLocalTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Planning engine
// ─────────────────────────────────────────────────────────────────────────────

export function getHorizonDates(dateValue, horizon, workdays) {
  const base = parseISODate(dateValue);
  if (!base) return [];

  if (horizon === "next7") {
    return Array.from({ length: 7 }, (_, index) => {
      const iso = addDaysToISO(dateValue, index);
      return parseISODate(iso);
    }).filter(Boolean);
  }

  if (horizon === "next5") {
    if (!workdays.length) return [];
    const dates = [];
    let offset = 0;
    while (dates.length < 5 && offset < 21) {
      const date = parseISODate(addDaysToISO(dateValue, offset));
      if (date && workdays.includes(date.weekday)) dates.push(date);
      offset += 1;
    }
    return dates;
  }

  return [base];
}

function getParticipantStatus(parts, durationMinutes, settings) {
  const start = parseClock(settings.workStart, 9 * 60);
  const end = parseClock(settings.workEnd, 17 * 60);
  const meetingStart = parts.minutesOfDay;
  const meetingEnd = meetingStart + durationMinutes;
  const isWorkday = settings.workdays.includes(parts.weekday);

  let status = "outside";

  if (!isWorkday) {
    status = "weekend";
  } else if (meetingStart >= start && meetingEnd <= end) {
    status = "work";
  } else if (
    meetingStart < start &&
    meetingStart >= start - 120 &&
    meetingEnd <= end
  ) {
    status = "early";
  } else if (
    meetingStart >= start &&
    meetingStart < end &&
    meetingEnd > end &&
    meetingEnd <= end + 120
  ) {
    status = "late";
  } else if (meetingStart >= 22 * 60 || meetingStart < 6 * 60) {
    status = "night";
  } else {
    status = "outside";
  }

  const meta = STATUS_META[status];
  const edge =
    status === "work" &&
    (meetingStart - start < 60 || end - meetingEnd < 60);

  return {
    status,
    statusLabel: meta.label,
    statusShort: meta.short,
    tone: meta.tone,
    penalty: meta.penalty + (edge ? 5 : 0),
    edge,
    inHours: status === "work",
    workStart: start,
    workEnd: end,
  };
}

function buildSlot({
  utcMs,
  title,
  durationMinutes,
  settings,
  participants,
  organizerTimeZone,
}) {
  const organizer = getZonedParts(utcMs, organizerTimeZone);
  const participantStates = participants.map((participant) => {
    const parts = getZonedParts(utcMs, participant.timezone);
    const evaluation = getParticipantStatus(parts, durationMinutes, settings);
    return {
      id: participant.id,
      name: participant.name.trim() || "Guest",
      timezone: participant.timezone,
      color: participant.color,
      parts,
      dayOffset: daysBetweenParts(parts, organizer),
      ...evaluation,
    };
  });

  // The first participant is the organiser. When organiser priority is on,
  // their local comfort carries much more weight than the rest of the group.
  const organizerWeight = settings.prioritizeOrganizer === false ? 1 : 3.5;
  const weightedPenalty = participantStates.reduce(
    (sum, participant, index) =>
      sum + participant.penalty * (index === 0 ? organizerWeight : 1),
    0,
  );
  const totalWeight = organizerWeight + Math.max(0, participantStates.length - 1);
  const inHoursCount = participantStates.filter((item) => item.inHours).length;
  const dateShifts = participantStates.filter((item) => item.dayOffset !== 0).length;
  const score = Math.round(
    clamp(
      100 - weightedPenalty / Math.max(1, totalWeight) - dateShifts * 2,
      0,
      100,
    ),
  );

  return {
    utcMs,
    title,
    durationMinutes,
    organizer,
    organizerMinutes: organizer.minutesOfDay,
    organizerTimeZone,
    organizerOffset: formatGmtOffset(utcMs, organizerTimeZone),
    participants: participantStates,
    inHoursCount,
    organizerInHours: Boolean(participantStates[0]?.inHours),
    allInHours: inHoursCount === participantStates.length,
    dateShifts,
    score,
    quality:
      inHoursCount === participantStates.length && score >= 88
        ? "Excellent"
        : score >= 80
          ? "Good"
          : score >= 55
            ? "Fair"
            : "Challenging",
  };
}

export function buildMeetingPlan({
  title,
  date,
  durationMinutes,
  settings,
  participants,
}) {
  const safeParticipants = Array.isArray(participants) ? participants : [];
  const dateParts = parseISODate(date);

  if (!dateParts) {
    return { error: "Choose a valid meeting date.", slots: [], dates: [] };
  }
  if (safeParticipants.length < MIN_PARTICIPANTS) {
    return {
      error: "Add at least two participants to compare time zones.",
      slots: [],
      dates: [],
    };
  }
  if (safeParticipants.some((participant) => !participant.timezone)) {
    return {
      error: "Every participant needs a time zone.",
      slots: [],
      dates: [],
    };
  }
  if (!settings.workdays.length) {
    return {
      error: "Choose at least one working day so the planner knows where to look.",
      slots: [],
      dates: [],
    };
  }

  const start = parseClock(settings.workStart, 9 * 60);
  const end = parseClock(settings.workEnd, 17 * 60);
  if (end <= start) {
    return {
      error: "The working day must end after it starts.",
      slots: [],
      dates: [],
    };
  }

  const duration = clamp(Math.round(Number(durationMinutes) || 45), 5, 480);
  const step = clamp(
    Math.round(Number(settings.stepMinutes) || 30),
    15,
    120,
  );
  const organizerTimeZone = safeParticipants[0].timezone;
  const dates = getHorizonDates(date, settings.horizon, settings.workdays);

  if (!dates.length) {
    return {
      error: "No dates match the selected working days. Try a different horizon.",
      slots: [],
      dates: [],
    };
  }

  const slots = [];
  const seen = new Set();

  dates.forEach((day) => {
    for (let minutes = 0; minutes < 1440; minutes += step) {
      const utcMs = zonedWallToUtc(
        {
          year: day.year,
          month: day.month,
          day: day.day,
          hour: Math.floor(minutes / 60),
          minute: minutes % 60,
        },
        organizerTimeZone,
      );
      if (seen.has(utcMs)) continue;
      seen.add(utcMs);
      slots.push(
        buildSlot({
          utcMs,
          title: String(title || "Untitled meeting").trim(),
          durationMinutes: duration,
          settings,
          participants: safeParticipants,
          organizerTimeZone,
        }),
      );
    }
  });

  slots.sort(
    (a, b) =>
      (settings.prioritizeOrganizer === false
        ? 0
        : Number(b.organizerInHours) - Number(a.organizerInHours)) ||
      b.score - a.score ||
      Number(b.allInHours) - Number(a.allInHours) ||
      a.utcMs - b.utcMs,
  );

  return {
    error: "",
    slots,
    dates,
    bestSlot: slots[0] || null,
    workableCount: slots.filter((slot) => slot.allInHours).length,
  };
}

export function getBestByHour(slots, dateValue) {
  const base = parseISODate(dateValue);
  const map = new Map();
  if (!base) return Array.from({ length: 24 }, () => null);

  slots.forEach((slot) => {
    if (slot.organizer.iso !== base.iso) return;
    const hour = slot.organizer.hour;
    const current = map.get(hour);
    if (!current || slot.score > current.score) map.set(hour, slot);
  });

  return Array.from({ length: 24 }, (_, hour) => map.get(hour) || null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Summaries and calendar export
// ─────────────────────────────────────────────────────────────────────────────

export function buildMeetingSummary({ slot, settings, participants }) {
  if (!slot) return "";
  const lines = [];
  lines.push("MEETING TIME PLAN - TOOLSTREK");
  lines.push(slot.title || "Untitled meeting");
  lines.push("----------------------------------------");
  lines.push(
    `${formatDateLong(slot.organizer)} at ${formatTime(
      slot.organizerMinutes,
      settings.timeFormat,
    )} (${getTimeZoneLabel(slot.organizerTimeZone)}, ${slot.organizerOffset})`,
  );
  lines.push(
    `Duration: ${formatDuration(slot.durationMinutes)} · Fit score: ${slot.score}/100 (${slot.quality})`,
  );
  lines.push(
    `Working hours: ${settings.workStart}–${settings.workEnd} · ${slot.inHoursCount}/${slot.participants.length} participants in hours`,
  );
  lines.push("");
  lines.push("LOCAL TIMES");
  slot.participants.forEach((participant) => {
    const dayLabel =
      participant.dayOffset === 1
        ? " (next day)"
        : participant.dayOffset === -1
          ? " (previous day)"
          : participant.dayOffset !== 0
            ? ` (${participant.dayOffset > 0 ? "+" : ""}${participant.dayOffset} days)`
            : "";
    lines.push(
      `- ${participant.name}: ${formatTime(
        participant.parts.minutesOfDay,
        settings.timeFormat,
      )} ${formatDateShort(participant.parts)}${dayLabel} · ${participant.statusLabel} · ${getTimeZoneLabel(
        participant.timezone,
      )}`,
    );
  });
  lines.push("");
  lines.push(
    `Generated locally with ToolsTrek Meeting Time Planner. Participant count: ${participants.length}.`,
  );
  return lines.join("\n");
}

function escapeIcs(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsUtc(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildMeetingIcs({ slot, settings, participants }) {
  if (!slot) return "";
  const now = new Date();
  const stamp = toIcsUtc(now.getTime());
  const uid = `toolstrek-${slot.utcMs}-${now.getTime()}@toolstrek.vercel.app`;
  const localLines = slot.participants
    .map(
      (participant) =>
        `${participant.name}: ${formatTime(
          participant.parts.minutesOfDay,
          settings.timeFormat,
        )} ${formatDateShort(participant.parts)} (${getTimeZoneLabel(
          participant.timezone,
        )}) - ${participant.statusLabel}`,
    )
    .join("\n");

  const description = [
    `Scheduled with ToolsTrek Meeting Time Planner.`,
    `Fit score: ${slot.score}/100 (${slot.quality}).`,
    `Working hours: ${settings.workStart}-${settings.workEnd}.`,
    ``,
    `Local times:`,
    localLines,
    ``,
    `Participants: ${participants.map((participant) => participant.name).join(", ")}.`,
  ].join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ToolsTrek//Meeting Time Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsUtc(slot.utcMs)}`,
    `DTEND:${toIcsUtc(slot.utcMs + slot.durationMinutes * MINUTE_MS)}`,
    `SUMMARY:${escapeIcs(slot.title || "Meeting")}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "LOCATION:Online",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function getInitials(name) {
  const clean = String(name || "Guest").trim();
  if (!clean) return "G";
  const parts = clean.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase();
}

export function getScoreTone(score) {
  if (score >= 88) return "emerald";
  if (score >= 72) return "teal";
  if (score >= 55) return "amber";
  return "rose";
}
