"use client";

import React, { useCallback, useMemo, useState } from "react";
import ToolPageShell from "../../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  Globe2,
  Info,
  MapPin,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Users,
  Wand2,
  X,
} from "lucide-react";
import {
  DEFAULT_MEETING,
  DEFAULT_PARTICIPANTS,
  DEFAULT_SETTINGS,
  HORIZONS,
  MAX_PARTICIPANTS,
  MEETING_FAQS,
  MEETING_TIPS,
  MIN_PARTICIPANTS,
  PARTICIPANT_COLORS,
  TIMEZONE_OPTIONS,
  WEEKDAYS,
  addDaysToISO,
  buildMeetingIcs,
  buildMeetingPlan,
  buildMeetingSummary,
  formatDateLong,
  formatDateShort,
  formatDuration,
  formatGmtOffset,
  formatTime,
  getBestByHour,
  getInitials,
  getLocalTimeZone,
  getScoreTone,
  getTimeZoneCity,
  getTimeZoneLabel,
  pad,
} from "./meetingTimeData";

const FIELD_BASE =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-teal-500/30 dark:bg-slate-800/80 dark:text-white [color-scheme:light] dark:[color-scheme:dark]";

const SCORE_CELL = {
  emerald: "bg-emerald-500 hover:bg-emerald-400",
  teal: "bg-teal-500 hover:bg-teal-400",
  amber: "bg-amber-400 hover:bg-amber-300",
  rose: "bg-rose-400 hover:bg-rose-300",
  slate: "bg-slate-200 dark:bg-slate-700",
};

const STATUS_PILL = {
  emerald:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const QUALITY_TONE = {
  Excellent: "emerald",
  Good: "teal",
  Fair: "amber",
  Challenging: "rose",
};

function fieldClass(invalid = false, extra = "") {
  return `${FIELD_BASE} ${
    invalid
      ? "border-rose-400 ring-1 ring-rose-300 dark:border-rose-700 dark:ring-rose-900/60"
      : "border-slate-200 dark:border-slate-700"
  } ${extra}`;
}

function toLocalISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function safeFileName(value) {
  return (
    String(value || "meeting")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 42) || "meeting"
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

function Segmented({ label, value, options, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div
        className="grid gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`rounded-lg px-2 py-2 text-[11px] font-bold transition sm:text-xs ${
              value === option.value
                ? "bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <div>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{label}</div>
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
          checked ? "bg-teal-600" : "bg-slate-300 dark:bg-slate-600"
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

function ScoreRing({ score, size = 74 }) {
  const tone = getScoreTone(score);
  const stroke = {
    emerald: "stroke-emerald-500",
    teal: "stroke-teal-500",
    amber: "stroke-amber-500",
    rose: "stroke-rose-500",
  }[tone];
  const text = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    teal: "text-teal-600 dark:text-teal-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  }[tone];
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-live="polite">
      <svg viewBox="0 0 64 64" className="-rotate-90" style={{ width: size, height: size }}>
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={stroke}
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${text}`}>
        <span className="text-lg font-black leading-none">{score}</span>
        <span className="text-[8px] font-bold uppercase tracking-wider">score</span>
      </div>
    </div>
  );
}

function StatusPill({ participant, compact = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
        STATUS_PILL[participant.tone] || STATUS_PILL.slate
      }`}
    >
      {compact ? participant.statusShort : participant.statusLabel}
    </span>
  );
}

function TimeZoneSelect({ value, onChange, label, zones }) {
  const missing = !zones.some((zone) => zone.timezone === value);
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className={fieldClass(false, "text-[12px] sm:text-xs")}
    >
      {missing && (
        <option value={value}>{getTimeZoneLabel(value)}</option>
      )}
      {zones.map((zone) => (
        <option key={zone.timezone} value={zone.timezone}>
          {zone.label}
        </option>
      ))}
    </select>
  );
}

function ParticipantTimeline({ participant, timeFormat }) {
  const workStartPct = (participant.workStart / 1440) * 100;
  const workWidthPct = ((participant.workEnd - participant.workStart) / 1440) * 100;
  const markerPct = (participant.parts.minutesOfDay / 1440) * 100;
  const dayLabel =
    participant.dayOffset === 1
      ? "+1 day"
      : participant.dayOffset === -1
        ? "−1 day"
        : participant.dayOffset !== 0
          ? `${participant.dayOffset > 0 ? "+" : ""}${participant.dayOffset} days`
          : "";

  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: participant.color }}
          />
          <span className="truncate text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
            {participant.name}
          </span>
          <span className="hidden truncate text-[10px] text-slate-400 sm:inline">
            {getTimeZoneCity(participant.timezone)}
          </span>
          {dayLabel && (
            <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {dayLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
            {formatTime(participant.parts.minutesOfDay, timeFormat)}
          </span>
          <StatusPill participant={participant} compact />
        </div>
      </div>
      <div className="relative h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="absolute inset-y-0 rounded-sm bg-emerald-200/80 dark:bg-emerald-800/60"
          style={{ left: `${workStartPct}%`, width: `${workWidthPct}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 rounded-full bg-slate-500/50 dark:bg-slate-400/50"
          style={{ left: "50%" }}
        />
        <span
          className="absolute top-1/2 h-3.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-slate-900 shadow-sm dark:border-slate-950 dark:bg-white"
          style={{ left: `${markerPct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-0.5 flex justify-between text-[8px] font-semibold text-slate-400">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}

export default function MeetingTimePlanner() {
  const { addRecentTool } = useRecentTools();
  const [title, setTitle] = useState(DEFAULT_MEETING.title);
  const [date, setDate] = useState(DEFAULT_MEETING.date);
  const [durationMinutes, setDurationMinutes] = useState(
    DEFAULT_MEETING.durationMinutes,
  );
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [selectedUtc, setSelectedUtc] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  React.useEffect(() => {
    addRecentTool({
      title: "Meeting Time Planner",
      link: "/tools/meeting-time-planner",
      icon: "CalendarClock",
    });
  }, [addRecentTool]);

  const plan = useMemo(
    () =>
      buildMeetingPlan({
        title,
        date,
        durationMinutes,
        settings,
        participants,
      }),
    [title, date, durationMinutes, settings, participants],
  );

  const visibleSlots = useMemo(
    () =>
      settings.onlyWorkable
        ? plan.slots.filter((slot) => slot.allInHours)
        : plan.slots,
    [plan.slots, settings.onlyWorkable],
  );

  const selected = useMemo(
    () =>
      visibleSlots.find((slot) => slot.utcMs === selectedUtc) ||
      visibleSlots[0] ||
      null,
    [visibleSlots, selectedUtc],
  );

  const bestByHour = useMemo(
    () => getBestByHour(plan.slots, selected?.organizer?.iso || date),
    [plan.slots, selected?.organizer?.iso, date],
  );

  const zones = TIMEZONE_OPTIONS.popular;
  const organizerZone = participants[0]?.timezone || "UTC";
  const allHoursLabel = `${settings.workStart}–${settings.workEnd}`;
  const error = plan.error;
  const offsetReference = selected?.utcMs || Date.UTC(2026, 0, 15, 12, 0);

  const updateParticipant = (id, patch) =>
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id ? { ...participant, ...patch } : participant,
      ),
    );

  const addParticipant = (name = "", timezone = "") => {
    if (participants.length >= MAX_PARTICIPANTS) {
      toast.error(`This planner supports up to ${MAX_PARTICIPANTS} participants.`);
      return;
    }
    const used = new Set(participants.map((participant) => participant.timezone));
    const nextZone =
      timezone ||
      zones.find((zone) => !used.has(zone.timezone))?.timezone ||
      zones[participants.length % zones.length].timezone;
    const participant = {
      id: `participant-${Date.now()}-${participants.length}`,
      name: name || `Guest ${participants.length + 1}`,
      timezone: nextZone,
      color: PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length],
    };
    setParticipants((current) => [...current, participant]);
    toast.success(`${participant.name} added.`);
  };

  const addLocalParticipant = () => {
    const zone = getLocalTimeZone();
    const existing = participants.find((participant) => participant.timezone === zone);
    if (existing) {
      toast.info(`${existing.name} already uses your local time zone.`);
      return;
    }
    addParticipant("You", zone);
  };

  const removeParticipant = (id) => {
    if (participants.length <= MIN_PARTICIPANTS) {
      toast.error("Keep at least two participants to compare time zones.");
      return;
    }
    setParticipants((current) =>
      current.filter((participant) => participant.id !== id),
    );
  };

  const updateSettings = (patch) =>
    setSettings((current) => ({ ...current, ...patch }));

  const toggleWorkday = (value) => {
    setSettings((current) => ({
      ...current,
      workdays: current.workdays.includes(value)
        ? current.workdays.filter((day) => day !== value)
        : [...current.workdays, value].sort(),
    }));
  };

  const chooseQuickDate = (days) => {
    const next = new Date();
    next.setDate(next.getDate() + days);
    setDate(toLocalISO(next));
  };

  const chooseNextMonday = () => {
    const next = new Date();
    const delta = (8 - next.getDay()) % 7 || 7;
    next.setDate(next.getDate() + delta);
    setDate(toLocalISO(next));
  };

  const shiftDate = (days) => setDate(addDaysToISO(date, days));

  const resetAll = () => {
    setTitle(DEFAULT_MEETING.title);
    setDate(DEFAULT_MEETING.date);
    setDurationMinutes(DEFAULT_MEETING.durationMinutes);
    setParticipants(DEFAULT_PARTICIPANTS);
    setSettings(DEFAULT_SETTINGS);
    setSelectedUtc(null);
    setShowAdvanced(false);
    toast.success("Meeting planner reset to the sample team.");
  };

  const copySummary = useCallback(async () => {
    if (!selected) return;
    const text = buildMeetingSummary({ slot: selected, settings, participants });
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Meeting summary copied.");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.remove();
      if (ok) toast.success("Meeting summary copied.");
      else toast.error("Copy failed. Select the times manually.");
    }
  }, [selected, settings, participants]);

  const downloadInvite = useCallback(() => {
    if (!selected) return;
    try {
      const ics = buildMeetingIcs({ slot: selected, settings, participants });
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      downloadBlob(blob, `${safeFileName(title)}-${selected.organizer.iso}.ics`);
      toast.success("Calendar invite downloaded.");
    } catch {
      toast.error("The calendar invite could not be created.");
    }
  }, [selected, settings, participants, title]);

  const activeTone = selected ? getScoreTone(selected.score) : "slate";
  const visibleDateLabel = selected
    ? formatDateLong(selected.organizer)
    : formatDateLong(plan.dates?.[0]);

  return (
    <ToolPageShell>
      <div className="mx-auto w-full max-w-6xl space-y-7 pb-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-emerald-700 to-cyan-700 p-6 text-white shadow-xl shadow-teal-500/15 sm:p-9">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          <svg
            className="pointer-events-none absolute right-8 top-8 hidden h-40 w-40 text-white/25 sm:block"
            viewBox="0 0 160 160"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="1.5" />
            <circle
              cx="80"
              cy="80"
              r="57"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 9"
            />
            <path
              d="M80 80V38"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M80 80L114 97"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="80" cy="80" r="4" fill="currentColor" />
          </svg>
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-50 backdrop-blur-sm">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Team scheduling studio
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Meeting Time Planner
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-emerald-50/90 sm:text-base">
              Find the least inconvenient hour for a team spread across the world.
              Compare every slot against each person&apos;s working hours, see the
              trade-offs in plain local time, and send a calendar invite without
              uploading a single detail.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Up to 8 participants",
                "DST-aware",
                "Work-hour scoring",
                "Day-by-day map",
                "ICS export",
                "100% private",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-emerald-50 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-3 w-3 text-cyan-200" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Controls */}
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white sm:text-base">
                      Meeting setup
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
                      The date is read in the organiser&apos;s time zone.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {plan.dates?.length || 0} day{(plan.dates?.length || 0) === 1 ? "" : "s"} searched
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Meeting name
                  </span>
                  <input
                    type="text"
                    value={title}
                    maxLength={80}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Weekly product sync"
                    className={fieldClass()}
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Start date
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => shiftDate(-1)}
                          aria-label="Previous day"
                          className="rounded-xl border border-slate-200 px-2.5 text-sm font-bold text-slate-500 transition hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-teal-300"
                        >
                          ‹
                        </button>
                        <input
                          type="date"
                          value={date}
                          onChange={(event) => setDate(event.target.value)}
                          className={fieldClass()}
                        />
                        <button
                          type="button"
                          onClick={() => shiftDate(1)}
                          aria-label="Next day"
                          className="rounded-xl border border-slate-200 px-2.5 text-sm font-bold text-slate-500 transition hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-teal-300"
                        >
                          ›
                        </button>
                      </div>
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {[
                        ["Today", () => chooseQuickDate(0)],
                        ["Tomorrow", () => chooseQuickDate(1)],
                        ["Next Monday", chooseNextMonday],
                      ].map(([label, action]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={action}
                          className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500 transition hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-teal-950/40 dark:hover:text-teal-300"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Duration
                      </span>
                      <select
                        value={durationMinutes}
                        onChange={(event) =>
                          setDurationMinutes(Number(event.target.value))
                        }
                        className={fieldClass()}
                      >
                        {[15, 25, 30, 45, 60, 90, 120].map((minutes) => (
                          <option key={minutes} value={minutes}>
                            {formatDuration(minutes)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Search window
                      </span>
                      <select
                        value={settings.horizon}
                        onChange={(event) =>
                          updateSettings({ horizon: event.target.value })
                        }
                        className={fieldClass()}
                      >
                        {HORIZONS.map((horizon) => (
                          <option key={horizon.value} value={horizon.value}>
                            {horizon.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                  <Clock3 className="h-3.5 w-3.5 text-teal-500" aria-hidden="true" />
                  <span>
                    Working window:{" "}
                    <strong className="text-slate-700 dark:text-slate-200">
                      {allHoursLabel}
                    </strong>{" "}
                    · {settings.workdays.length} day
                    {settings.workdays.length === 1 ? "" : "s"} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(true)}
                    className="ml-auto font-bold text-teal-700 hover:underline dark:text-teal-300"
                  >
                    Adjust
                  </button>
                </div>

                {/* Participants */}
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-teal-500" aria-hidden="true" />
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        Participants ({participants.length}/{MAX_PARTICIPANTS})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={addLocalParticipant}
                        className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[10px] font-bold text-teal-700 transition hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300"
                      >
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        Use my time zone
                      </button>
                      <button
                        type="button"
                        onClick={() => addParticipant()}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-teal-700"
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                        Add person
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {participants.map((participant, index) => (
                      <div
                        key={participant.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/30"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-white shadow-sm"
                            style={{ backgroundColor: participant.color }}
                            aria-hidden="true"
                          >
                            {getInitials(participant.name)}
                          </span>
                          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
                            <input
                              type="text"
                              value={participant.name}
                              maxLength={32}
                              aria-label={`Participant ${index + 1} name`}
                              placeholder={`Guest ${index + 1}`}
                              onChange={(event) =>
                                updateParticipant(participant.id, {
                                  name: event.target.value,
                                })
                              }
                              className={fieldClass()}
                            />
                            <TimeZoneSelect
                              label={`Participant ${index + 1} time zone`}
                              value={participant.timezone}
                              zones={zones}
                              onChange={(timezone) =>
                                updateParticipant(participant.id, { timezone })
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeParticipant(participant.id)}
                            disabled={participants.length <= MIN_PARTICIPANTS}
                            aria-label={`Remove ${participant.name || `participant ${index + 1}`}`}
                            className="mt-0.5 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-10 text-[10px] text-slate-400 dark:text-slate-500">
                          {index === 0 && (
                            <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                              Organiser
                            </span>
                          )}
                          <span>{getTimeZoneLabel(participant.timezone)}</span>
                          <span>·</span>
                          <span>
                            {formatGmtOffset(offsetReference, participant.timezone)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-snug text-slate-400 dark:text-slate-500">
                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-teal-400" aria-hidden="true" />
                    Every time is converted for the selected date, so daylight saving
                    and half-hour offsets are handled automatically.
                  </p>
                </div>

                {/* Advanced */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((current) => !current)}
                    aria-expanded={showAdvanced}
                    className="flex w-full items-center justify-between gap-2 bg-slate-50/80 px-4 py-3 text-left transition hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                  >
                    <span className="flex items-center gap-2 text-[13px] font-extrabold text-slate-800 dark:text-slate-100 sm:text-sm">
                      <Sparkles className="h-4 w-4 text-teal-500" aria-hidden="true" />
                      Advanced scheduling options
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        showAdvanced ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 border-t border-slate-200 p-4 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Workday starts
                          </span>
                          <input
                            type="time"
                            value={settings.workStart}
                            onChange={(event) =>
                              updateSettings({ workStart: event.target.value })
                            }
                            className={fieldClass()}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Workday ends
                          </span>
                          <input
                            type="time"
                            value={settings.workEnd}
                            onChange={(event) =>
                              updateSettings({ workEnd: event.target.value })
                            }
                            className={fieldClass()}
                          />
                        </label>
                      </div>

                      <div>
                        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Working days
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {WEEKDAYS.map((day) => {
                            const active = settings.workdays.includes(day.value);
                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => toggleWorkday(day.value)}
                                aria-pressed={active}
                                className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-extrabold transition ${
                                  active
                                    ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-teal-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                                }`}
                              >
                                {day.short}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Segmented
                          label="Search every"
                          value={String(settings.stepMinutes)}
                          options={[
                            { value: "15", label: "15 min" },
                            { value: "30", label: "30 min" },
                            { value: "60", label: "60 min" },
                          ]}
                          onChange={(value) =>
                            updateSettings({ stepMinutes: Number(value) })
                          }
                        />
                        <Segmented
                          label="Clock format"
                          value={settings.timeFormat}
                          options={[
                            { value: "24", label: "24-hour" },
                            { value: "12", label: "12-hour" },
                          ]}
                          onChange={(value) =>
                            updateSettings({ timeFormat: value })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Toggle
                          label="Only perfect overlaps"
                          description="Hide every slot where someone is outside their working hours."
                          checked={settings.onlyWorkable}
                          onChange={(value) => updateSettings({ onlyWorkable: value })}
                        />
                        <Toggle
                          label="Prioritise organiser"
                          description="Give the first participant's working hours extra weight when ranking."
                          checked={settings.prioritizeOrganizer}
                          onChange={(value) =>
                            updateSettings({ prioritizeOrganizer: value })
                          }
                        />
                      </div>

                      <p className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                        <Info className="mt-0.5 h-3 w-3 shrink-0 text-teal-400" aria-hidden="true" />
                        {HORIZONS.find((horizon) => horizon.value === settings.horizon)?.hint}{" "}
                        Weekend days are still shown when you search seven days, but they
                        receive a penalty in the score.
                      </p>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setSettings((current) => ({
                              ...DEFAULT_SETTINGS,
                              horizon: current.horizon,
                              timeFormat: current.timeFormat,
                            }))
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-teal-300"
                        >
                          <RotateCcw className="h-3 w-3" aria-hidden="true" />
                          Reset options
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reset planner
                  </button>
                  <button
                    type="button"
                    onClick={copySummary}
                    disabled={!selected}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-xs font-extrabold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    Copy summary
                  </button>
                </div>
              </div>
            </section>

            {/* Day map */}
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-teal-500" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Your day at a glance
                    </h2>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {visibleDateLabel} · organiser time ({getTimeZoneCity(organizerZone)})
                  </p>
                </div>
                {selected && (
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                    Selected {formatTime(selected.organizerMinutes, settings.timeFormat)}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Hourly opportunities</span>
                  <span className="text-slate-300 dark:text-slate-600">Tap a block</span>
                </div>
                <div
                  className="grid gap-0.5"
                  style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
                >
                  {bestByHour.map((slot, hour) => {
                    const tone = slot ? getScoreTone(slot.score) : "slate";
                    const active = selected && slot && selected.utcMs === slot.utcMs;
                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={!slot}
                        onClick={() => slot && setSelectedUtc(slot.utcMs)}
                        aria-label={
                          slot
                            ? `${formatTime(hour * 60, settings.timeFormat)} — best score ${slot.score}`
                            : `${formatTime(hour * 60, settings.timeFormat)} — no slot`
                        }
                        title={
                          slot
                            ? `${formatTime(hour * 60, settings.timeFormat)} · ${slot.score}/100 · ${slot.inHoursCount}/${slot.participants.length} in hours`
                            : `${formatTime(hour * 60, settings.timeFormat)} · no slot`
                        }
                        className={`h-8 rounded-sm transition ${SCORE_CELL[tone]} ${
                          active ? "ring-2 ring-slate-900 ring-offset-1 dark:ring-white dark:ring-offset-slate-900" : ""
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      />
                    );
                  })}
                </div>
                <div className="mt-1 flex justify-between text-[9px] font-semibold text-slate-400">
                  <span>00</span>
                  <span>06</span>
                  <span>12</span>
                  <span>18</span>
                  <span>24</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Excellent
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-teal-500" /> Good
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-amber-400" /> Fair
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-rose-400" /> Poor
                  </span>
                  <span className="ml-auto hidden items-center gap-1 sm:flex">
                    <span className="h-2 w-4 rounded-sm bg-emerald-200 dark:bg-emerald-800" /> Work window
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-2 dark:border-slate-800">
                {selected ? (
                  selected.participants.map((participant) => (
                    <ParticipantTimeline
                      key={participant.id}
                      participant={participant}
                      timeFormat={settings.timeFormat}
                    />
                  ))
                ) : (
                  <p className="py-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
                    Choose a slot to see each participant&apos;s working window.
                  </p>
                )}
              </div>

              {settings.onlyWorkable && visibleSlots.length === 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  No slot puts everyone inside {allHoursLabel}. Turn off the perfect-overlap
                  filter to compare the best compromises.
                  <button
                    type="button"
                    onClick={() => updateSettings({ onlyWorkable: false })}
                    className="font-extrabold underline"
                  >
                    Show all slots
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:col-span-5">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Wand2 className="h-4 w-4 text-teal-500" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Best time to meet
                    </h2>
                  </div>
                  {selected && <ScoreRing score={selected.score} />}
                </div>
              </div>

              {error ? (
                <div className="m-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-extrabold text-rose-700 dark:text-rose-300">
                        We need a little more information
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-rose-600 dark:text-rose-300/90">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : selected ? (
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
                        Recommended slot
                      </span>
                      <div className="mt-1 flex items-end gap-2">
                        <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                          {formatTime(selected.organizerMinutes, settings.timeFormat)}
                        </span>
                        <span className="pb-1 text-[11px] font-bold text-slate-400">
                          {selected.organizerOffset}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {formatDateLong(selected.organizer)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                          STATUS_PILL[QUALITY_TONE[selected.quality]]
                        }`}
                      >
                        {selected.quality}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {selected.inHoursCount}/{selected.participants.length} in working hours
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDuration(selected.durationMinutes)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Globe2 className="h-3 w-3" aria-hidden="true" />
                      {selected.organizerTimeZone.replace(/_/g, " ")}
                    </span>
                    {selected.dateShifts > 0 && (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Date changes for {selected.dateShifts} participant
                        {selected.dateShifts === 1 ? "" : "s"}
                      </span>
                    )}
                    {selected.allInHours && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        Perfect overlap
                      </span>
                    )}
                  </div>

                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                    {selected.participants.map((participant) => {
                      const dayLabel =
                        participant.dayOffset === 1
                          ? "next day"
                          : participant.dayOffset === -1
                            ? "previous day"
                            : participant.dayOffset !== 0
                              ? `${participant.dayOffset > 0 ? "+" : ""}${participant.dayOffset} days`
                              : "";
                      return (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between gap-2 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: participant.color }}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
                                {participant.name}
                              </p>
                              <p className="truncate text-[9px] text-slate-400">
                                {getTimeZoneLabel(participant.timezone)}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-0.5">
                            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
                              {formatTime(participant.parts.minutesOfDay, settings.timeFormat)}
                            </span>
                            <div className="flex items-center gap-1">
                              {dayLabel && (
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                  {dayLabel}
                                </span>
                              )}
                              <StatusPill participant={participant} compact />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!selected.allInHours && (
                    <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                      <strong>No perfect overlap.</strong> This slot keeps{" "}
                      {selected.inHoursCount} of {selected.participants.length} people inside
                      working hours. The ranking weighs the organiser most heavily by default.
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={copySummary}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-[11px] font-extrabold text-teal-700 transition hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      Copy times
                    </button>
                    <button
                      type="button"
                      onClick={downloadInvite}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2.5 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-teal-700"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Calendar .ics
                    </button>
                  </div>

                  <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-snug text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" aria-hidden="true" />
                    Times are calculated locally. Nothing is uploaded or stored.
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Globe2 className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                  <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    No slot fits the current filters
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Turn off the perfect-overlap filter or widen the working window to see
                    the best compromises.
                  </p>
                  <button
                    type="button"
                    onClick={() => updateSettings({ onlyWorkable: false })}
                    className="mt-3 rounded-xl bg-teal-600 px-3 py-2 text-[11px] font-extrabold text-white hover:bg-teal-700"
                  >
                    Show all slots
                  </button>
                </div>
              )}
            </section>

            {/* Ranked alternatives */}
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Timer className="h-4 w-4 text-teal-500" aria-hidden="true" />
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Ranked alternatives
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {visibleSlots.length} slot{visibleSlots.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {visibleSlots.slice(0, 8).map((slot) => {
                  const active = selected?.utcMs === slot.utcMs;
                  return (
                    <button
                      key={slot.utcMs}
                      type="button"
                      onClick={() => setSelectedUtc(slot.utcMs)}
                      aria-pressed={active}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                        active
                          ? "border-teal-400 bg-teal-50/70 dark:border-teal-700 dark:bg-teal-950/20"
                          : "border-slate-200 bg-slate-50/50 hover:border-teal-300 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-teal-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-baseline gap-x-1.5">
                          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                            {formatTime(slot.organizerMinutes, settings.timeFormat)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateShort(slot.organizer)}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            {slot.organizerOffset}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            STATUS_PILL[getScoreTone(slot.score)]
                          }`}
                        >
                          {slot.score}
                          <span className="hidden sm:inline">/100</span>
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-semibold text-slate-400">
                        <span>{slot.inHoursCount}/{slot.participants.length} in working hours</span>
                        <span>·</span>
                        <span>{slot.quality}</span>
                        {slot.dateShifts > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 dark:text-amber-400">
                              date shift
                            </span>
                          </>
                        )}
                        <span className="ml-auto flex items-center gap-1">
                          {slot.participants.map((participant) => (
                            <span
                              key={participant.id}
                              title={`${participant.name}: ${formatTime(
                                participant.parts.minutesOfDay,
                                settings.timeFormat,
                              )} (${participant.statusLabel})`}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: participant.color }}
                            />
                          ))}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {visibleSlots.length === 0 && !error && (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400">
                    No slots to rank yet. Widen the working hours or turn off the
                    perfect-overlap filter.
                  </p>
                )}
              </div>

              <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-snug text-slate-400 dark:text-slate-500">
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-teal-400" aria-hidden="true" />
                Scores combine working-hour penalties, night hours, weekends and date
                shifts. A high score is a planning aid, not a guarantee of attendance.
              </p>
            </section>
          </div>
        </div>

        {/* Tips */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MEETING_TIPS.map((tip, index) => {
            const Icon = [CalendarClock, Globe2, Copy][index] || Sparkles;
            return (
              <div
                key={tip.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-2.5 text-xs font-extrabold text-slate-900 dark:text-white">
                  {tip.title}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {tip.text}
                </p>
              </div>
            );
          })}
        </section>

        {/* FAQ */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-teal-500" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Meeting planning questions
            </h2>
          </div>
          <div className="mt-4 space-y-2.5">
            {MEETING_FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                  >
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 sm:text-[13px]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {open && (
                    <div className="bg-white px-4 py-3 text-[11px] leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-300 sm:text-xs">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <strong>Tip:</strong> time-zone rules come from your browser&apos;s IANA
            database. Governments occasionally change them, so confirm unusual zones
            before sending a critical invitation.
          </p>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Need a world clock instead?</span>
          <a
            href="/tools/timezone-clock"
            className="inline-flex items-center gap-1 font-bold text-teal-600 hover:underline dark:text-teal-300"
          >
            Open the timezone clock
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <a
            href="/tools/time-converter"
            className="inline-flex items-center gap-1 font-bold text-teal-600 hover:underline dark:text-teal-300"
          >
            Convert a duration
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </ToolPageShell>
  );
}
