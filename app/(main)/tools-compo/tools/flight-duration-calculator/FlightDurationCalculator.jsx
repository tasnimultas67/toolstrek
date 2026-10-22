"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ToolPageShell from "../../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Compass,
  Copy,
  Download,
  Gauge,
  Globe2,
  HelpCircle,
  Info,
  Luggage,
  MapPin,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  RotateCcw,
  Route,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import AirportPicker from "./AirportPicker";
import FlightResults from "./FlightResults";
import { createFlightPdf } from "./flightPdf";
import {
  DEFAULT_SETTINGS,
  FLIGHT_FAQS,
  FLIGHT_TIPS,
  MAX_SEGMENTS,
  MODES,
  MODE_META,
  addMinutesToZonedWall,
  calculateArrival,
  calculateDeparture,
  calculateDuration,
  createDefaultSegments,
  formatClock,
  formatDateLabel,
  formatDuration,
  parseDateInput,
  resolveAirport,
} from "./flightDurationData";

const FIELD_BASE =
  "w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-sky-500/30 dark:bg-slate-800/60 dark:text-white [color-scheme:light] dark:[color-scheme:dark]";

const MODE_ICONS = {
  [MODES.DURATION]: Timer,
  [MODES.ARRIVAL]: PlaneLanding,
  [MODES.DEPARTURE]: PlaneTakeoff,
};

const TIP_ICONS = {
  Globe2,
  Route,
  Luggage,
};

function fieldClass(hasError) {
  return `${FIELD_BASE} ${
    hasError
      ? "border-rose-400 ring-1 ring-rose-300 dark:border-rose-700 dark:ring-rose-900/60"
      : "border-slate-200 dark:border-slate-700"
  }`;
}

function addDaysToDateValue(dateValue, days) {
  const parts = parseDateInput(dateValue);
  if (!parts) return dateValue;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return date.toISOString().slice(0, 10);
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
  if (!successful) throw new Error("Copy command failed");
}

function buildSummaryText({ result, mode, settings, tripName }) {
  const { legs, connections, totals, warnings } = result;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];
  const lines = [];

  lines.push("FLIGHT DURATION REPORT - TOOLSTREK");
  if (tripName.trim()) lines.push(tripName.trim());
  lines.push("----------------------------------------");

  if (mode === MODES.ARRIVAL) {
    lines.push(
      `Local arrival: ${formatDateLabel(lastLeg.arrParts)} at ${formatClock(
        lastLeg.arrParts.hour,
        lastLeg.arrParts.minute,
        settings.timeFormat,
      )} (${lastLeg.arrAirport.city}, ${lastLeg.arrAirport.timezone})`,
    );
  } else if (mode === MODES.DEPARTURE) {
    lines.push(
      `Local departure: ${formatDateLabel(firstLeg.depParts)} at ${formatClock(
        firstLeg.depParts.hour,
        firstLeg.depParts.minute,
        settings.timeFormat,
      )} (${firstLeg.depAirport.city}, ${firstLeg.depAirport.timezone})`,
    );
  } else {
    lines.push(
      `${
        settings.includeBuffersInHeadline ? "Door-to-door journey" : "Gate-to-gate journey"
      }: ${formatDuration(totals.headlineMinutes)}`,
    );
  }

  lines.push(`Flight time: ${formatDuration(totals.flightMinutes)}`);
  if (totals.layoverMinutes > 0) {
    lines.push(`Layover time: ${formatDuration(totals.layoverMinutes)}`);
  }
  lines.push(`Gate-to-gate: ${formatDuration(totals.gateToGateMinutes)}`);
  lines.push(`Door-to-door: ${formatDuration(totals.doorToDoorMinutes)}`);
  lines.push(`Route: ${firstLeg.depAirport.code} to ${lastLeg.arrAirport.code}`);
  lines.push("");
  lines.push("ITINERARY");

  legs.forEach((leg, index) => {
    const carrier = [leg.airline, leg.flightNumber].filter(Boolean).join(" ");
    lines.push(
      `Flight ${index + 1}: ${leg.depAirport.code} - ${leg.arrAirport.code}${
        carrier ? ` (${carrier})` : ""
      }`,
    );
    lines.push(
      `  Departs: ${formatDateLabel(leg.depParts)} ${formatClock(
        leg.depParts.hour,
        leg.depParts.minute,
        settings.timeFormat,
      )} ${leg.depAirport.timezone}`,
    );
    lines.push(
      `  Arrives: ${formatDateLabel(leg.arrParts)} ${formatClock(
        leg.arrParts.hour,
        leg.arrParts.minute,
        settings.timeFormat,
      )} ${leg.arrAirport.timezone}`,
    );
    lines.push(`  Duration: ${formatDuration(leg.durationMinutes)}`);
    if (index < connections.length) {
      const connection = connections[index];
      lines.push(
        `  Layover in ${connection.airport.city}: ${formatDuration(connection.minutes)} (${
          connection.isInternational ? "international" : "domestic"
        } transfer, minimum ${connection.minimumMinutes} min)`,
      );
    }
  });

  if (warnings.length > 0) {
    lines.push("");
    lines.push("NOTES");
    warnings.forEach((warning) => lines.push(`- ${warning.message}`));
  }

  lines.push("");
  lines.push(
    `Planning settings: ${settings.preBufferMinutes} min before departure, ${settings.postBufferMinutes} min after arrival, ${settings.minDomesticConnection} min domestic connection minimum, ${settings.minInternationalConnection} min international connection minimum.`,
  );
  lines.push("");
  lines.push("Generated with ToolsTrek Flight Duration Calculator");
  lines.push("https://toolstrek.vercel.app/tools/flight-duration-calculator");
  return lines.join("\n");
}

function SegmentedControl({ label, value, options, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
              value === option.value
                ? "bg-white text-sky-700 shadow-sm dark:bg-slate-700 dark:text-sky-300"
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

function RangeSetting({ label, value, min, max, step, suffix, onChange, hint }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
          {value} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-sky-600"
      />
      {hint && (
        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <div>
        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{label}</div>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
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
          checked ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-600"
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

export default function FlightDurationCalculator() {
  const { addRecentTool } = useRecentTools();
  const [mode, setMode] = useState(MODES.DURATION);
  const [segments, setSegments] = useState(createDefaultSegments);
  const [duration, setDuration] = useState({ hours: 4, minutes: 45 });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tripName, setTripName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const idRef = useRef(2);

  useEffect(() => {
    addRecentTool({
      title: "Flight Duration Calculator",
      link: "/tools/flight-duration-calculator",
      icon: "Plane",
    });
  }, [addRecentTool]);

  const durationMinutes = (Number(duration.hours) || 0) * 60 + (Number(duration.minutes) || 0);

  const result = useMemo(() => {
    if (mode === MODES.DURATION) {
      return calculateDuration({ segments, settings });
    }
    if (mode === MODES.ARRIVAL) {
      return calculateArrival({ segments, durationMinutes, settings });
    }
    return calculateDeparture({ segments, durationMinutes, settings });
  }, [mode, segments, settings, durationMinutes]);

  const activeSettingCount = Object.keys(DEFAULT_SETTINGS).filter(
    (key) => settings[key] !== DEFAULT_SETTINGS[key],
  ).length;

  const fieldHasError = (segmentId, field) =>
    result.errors.some((error) => error.segmentId === segmentId && error.field === field);

  const durationHasError = result.errors.some((error) => error.field === "duration");

  const updateSegment = (id, patch) => {
    setSegments((current) =>
      current.map((segment) => (segment.id === id ? { ...segment, ...patch } : segment)),
    );
  };

  const updateSettings = (patch) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    if (nextMode !== MODES.DURATION && segments.length > 1) {
      toast.info("Arrival and departure modes use Flight 1. Your connections stay saved for Duration mode.");
    }
    setMode(nextMode);
  };

  const handleAddConnection = () => {
    if (segments.length >= MAX_SEGMENTS) {
      toast.error(`You can add up to ${MAX_SEGMENTS} flights in one itinerary.`);
      return;
    }

    const last = segments[segments.length - 1];
    const lastArrivalAirport = resolveAirport(
      last.arrCode,
      last.arrCustomLabel,
      last.arrCustomTz,
    );

    if (!lastArrivalAirport) {
      toast.error("Set a valid arrival airport on the last flight first.");
      return;
    }

    const departure = addMinutesToZonedWall(
      last.arrDate,
      last.arrTime,
      lastArrivalAirport.timezone,
      120,
      lastArrivalAirport.timezone,
    ) || { date: last.arrDate, time: last.arrTime };

    const preferred = ["LHR", "DXB", "SIN", "IST", "BKK", "JFK", "SYD"];
    const nextCode = preferred.find((code) => code !== last.arrCode) || "LHR";
    const nextAirport = resolveAirport(nextCode, "", "UTC");
    const arrival = nextAirport
      ? addMinutesToZonedWall(
          departure.date,
          departure.time,
          lastArrivalAirport.timezone,
          420,
          nextAirport.timezone,
        ) || departure
      : departure;

    const newSegment = {
      id: `seg-${idRef.current}`,
      airline: "",
      flightNumber: "",
      depCode: last.arrCode,
      depCustomLabel: last.arrCustomLabel,
      depCustomTz: last.arrCustomTz,
      arrCode: nextCode,
      arrCustomLabel: "",
      arrCustomTz: nextAirport?.timezone || "UTC",
      depDate: departure.date,
      depTime: departure.time,
      arrDate: arrival.date,
      arrTime: arrival.time,
    };
    idRef.current += 1;
    setSegments((current) => [...current, newSegment]);
    toast.success("Connection added. Set the next flight's details.");
  };

  const handleRemoveSegment = (id) => {
    if (segments.length <= 1) {
      toast.error("Keep at least one flight in the itinerary.");
      return;
    }
    setSegments((current) => current.filter((segment) => segment.id !== id));
    toast.success("Flight removed.");
  };

  const handleMoveSegment = (index, direction) => {
    setSegments((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleReset = () => {
    setMode(MODES.DURATION);
    setSegments(createDefaultSegments());
    setDuration({ hours: 4, minutes: 45 });
    setSettings(DEFAULT_SETTINGS);
    setTripName("");
    setShowAdvanced(false);
    setOpenFaq(0);
    toast.success("Calculator reset to the sample trip.");
  };

  const handleCopy = async () => {
    if (!result.ok) {
      toast.error("Fix the highlighted details before copying a summary.");
      return;
    }
    const text = buildSummaryText({ result, mode, settings, tripName });
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      toast.success("Itinerary copied to clipboard.");
    } catch {
      toast.error("Copy failed. Your browser may be blocking clipboard access.");
    }
  };

  const handleDownload = () => {
    if (!result.ok) {
      toast.error("Fix the highlighted details before downloading a report.");
      return;
    }
    try {
      const doc = createFlightPdf({ result, mode, settings, tripName });
      const safeName =
        tripName
          .trim()
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 42) || "flight-duration";
      doc.save(`${safeName}-toolstrek.pdf`);
      toast.success("PDF report downloaded.");
    } catch {
      toast.error("The report could not be generated. Please check the itinerary and try again.");
    }
  };

  const visibleSegments = mode === MODES.DURATION ? segments : segments.slice(0, 1);
  const isArrivalMode = mode === MODES.ARRIVAL;
  const isDepartureMode = mode === MODES.DEPARTURE;

  return (
    <ToolPageShell>
      <div className="mx-auto w-full max-w-6xl space-y-7 pb-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-600 p-6 text-white shadow-xl shadow-sky-500/10 sm:p-9">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-teal-300/20 blur-2xl" />
          <div className="pointer-events-none absolute right-10 top-10 hidden h-24 w-40 rounded-full border border-dashed border-white/20 sm:block" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-50 backdrop-blur-sm">
              <Plane className="h-3.5 w-3.5 -rotate-45" aria-hidden="true" />
              Travel timing studio
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Flight Duration Calculator
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sky-50/90 sm:text-base">
              Work out exactly how long you&apos;ll be in the air, when you&apos;ll land in local
              time, and how much of your trip is spent flying, waiting and clearing the airport.
              Time zones, daylight saving and connections are handled for you.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "3 solve modes",
                "Multi-city itineraries",
                "DST-aware time zones",
                "Door-to-door buffers",
                "100% private",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-sky-50 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-3 w-3 text-teal-200" aria-hidden="true" />
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
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Plan your journey
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Results update live as you type.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
                {Object.entries(MODE_META).map(([key, meta]) => {
                  const Icon = MODE_ICONS[key];
                  const active = mode === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleModeChange(key)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[10px] font-extrabold transition sm:flex-row sm:justify-center sm:gap-1.5 sm:text-[11px] ${
                        active
                          ? "bg-white text-sky-700 shadow-sm dark:bg-slate-700 dark:text-sky-300"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {meta.shortLabel}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {MODE_META[mode].description}
              </p>

              <div className="mt-4">
                <label
                  htmlFor="flight-trip-name"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Trip name <span className="font-medium normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="flight-trip-name"
                  type="text"
                  value={tripName}
                  onChange={(event) => setTripName(event.target.value)}
                  placeholder="e.g. Winter escape to Dubai"
                  maxLength={60}
                  className={fieldClass(false)}
                />
              </div>

              <div className="mt-5 space-y-4">
                {visibleSegments.map((segment, index) => {
                  const depAirport = resolveAirport(
                    segment.depCode,
                    segment.depCustomLabel,
                    segment.depCustomTz,
                  );
                  const arrAirport = resolveAirport(
                    segment.arrCode,
                    segment.arrCustomLabel,
                    segment.arrCustomTz,
                  );
                  const previewLeg = result.ok
                    ? result.legs.find((leg) => leg.id === segment.id)
                    : null;

                  return (
                    <div
                      key={segment.id}
                      className={`rounded-2xl border p-4 transition sm:p-5 ${
                        fieldHasError(segment.id, "depCode") ||
                        fieldHasError(segment.id, "arrCode") ||
                        fieldHasError(segment.id, "depDate") ||
                        fieldHasError(segment.id, "arrDate")
                          ? "border-rose-200 bg-rose-50/30 dark:border-rose-900/60 dark:bg-rose-950/10"
                          : "border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-800/20"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                            <Plane className="h-3 w-3 -rotate-45" aria-hidden="true" />
                            Flight {index + 1}
                          </span>
                          {mode === MODES.DURATION && segments.length > 1 && (
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              {index === 0 ? "Origin" : index === segments.length - 1 ? "Final leg" : "Connection"}
                            </span>
                          )}
                        </div>

                        {mode === MODES.DURATION && segments.length > 1 && (
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveSegment(index, -1)}
                              disabled={index === 0}
                              aria-label={`Move flight ${index + 1} up`}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSegment(index, 1)}
                              disabled={index === segments.length - 1}
                              aria-label={`Move flight ${index + 1} down`}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSegment(segment.id)}
                              aria-label={`Remove flight ${index + 1}`}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor={`${segment.id}-airline`}
                            className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                          >
                            Airline (optional)
                          </label>
                          <input
                            id={`${segment.id}-airline`}
                            type="text"
                            value={segment.airline}
                            onChange={(event) =>
                              updateSegment(segment.id, { airline: event.target.value })
                            }
                            placeholder="e.g. Emirates"
                            maxLength={40}
                            className={fieldClass(false)}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`${segment.id}-flight-number`}
                            className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                          >
                            Flight number (optional)
                          </label>
                          <input
                            id={`${segment.id}-flight-number`}
                            type="text"
                            value={segment.flightNumber}
                            onChange={(event) =>
                              updateSegment(segment.id, { flightNumber: event.target.value })
                            }
                            placeholder="e.g. EK 585"
                            maxLength={20}
                            className={fieldClass(false)}
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <AirportPicker
                          id={`${segment.id}-dep-airport`}
                          label="From"
                          value={segment.depCode}
                          onChange={(code) => updateSegment(segment.id, { depCode: code })}
                          customLabel={segment.depCustomLabel}
                          customTimeZone={segment.depCustomTz}
                          onCustomLabelChange={(value) =>
                            updateSegment(segment.id, { depCustomLabel: value })
                          }
                          onCustomTimeZoneChange={(value) =>
                            updateSegment(segment.id, { depCustomTz: value })
                          }
                          invalid={fieldHasError(segment.id, "depCode")}
                          hint={depAirport ? `Time zone: ${depAirport.timezone}` : undefined}
                        />
                        <AirportPicker
                          id={`${segment.id}-arr-airport`}
                          label="To"
                          value={segment.arrCode}
                          onChange={(code) => updateSegment(segment.id, { arrCode: code })}
                          customLabel={segment.arrCustomLabel}
                          customTimeZone={segment.arrCustomTz}
                          onCustomLabelChange={(value) =>
                            updateSegment(segment.id, { arrCustomLabel: value })
                          }
                          onCustomTimeZoneChange={(value) =>
                            updateSegment(segment.id, { arrCustomTz: value })
                          }
                          invalid={fieldHasError(segment.id, "arrCode")}
                          hint={arrAirport ? `Time zone: ${arrAirport.timezone}` : undefined}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {!isArrivalMode && (
                          <div>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Departure
                              </span>
                              {!isDepartureMode && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                  Local time at origin
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 [&>div]:min-w-0">
                              <div>
                                <label htmlFor={`${segment.id}-dep-date`} className="sr-only">
                                  Flight {index + 1} departure date
                                </label>
                                <input
                                  id={`${segment.id}-dep-date`}
                                  type="date"
                                  value={segment.depDate}
                                  onChange={(event) =>
                                    updateSegment(segment.id, { depDate: event.target.value })
                                  }
                                  aria-label={`Flight ${index + 1} departure date`}
                                  className={fieldClass(fieldHasError(segment.id, "depDate"))}
                                />
                              </div>
                              <div>
                                <label htmlFor={`${segment.id}-dep-time`} className="sr-only">
                                  Flight {index + 1} departure time
                                </label>
                                <input
                                  id={`${segment.id}-dep-time`}
                                  type="time"
                                  value={segment.depTime}
                                  onChange={(event) =>
                                    updateSegment(segment.id, { depTime: event.target.value })
                                  }
                                  aria-label={`Flight ${index + 1} departure time`}
                                  className={fieldClass(fieldHasError(segment.id, "depDate"))}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {!isDepartureMode && (
                          <div>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Arrival
                              </span>
                              {!isArrivalMode && !isDepartureMode && (
                                <span className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateSegment(segment.id, {
                                        arrDate: addDaysToDateValue(segment.depDate, 0),
                                      })
                                    }
                                    className="rounded-md px-1.5 py-0.5 text-[9px] font-bold text-slate-400 transition hover:bg-white hover:text-sky-600 dark:hover:bg-slate-800 dark:hover:text-sky-300"
                                  >
                                    Same day
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateSegment(segment.id, {
                                        arrDate: addDaysToDateValue(segment.depDate, 1),
                                      })
                                    }
                                    className="rounded-md px-1.5 py-0.5 text-[9px] font-bold text-slate-400 transition hover:bg-white hover:text-sky-600 dark:hover:bg-slate-800 dark:hover:text-sky-300"
                                  >
                                    +1 day
                                  </button>
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 [&>div]:min-w-0">
                              <div>
                                <label htmlFor={`${segment.id}-arr-date`} className="sr-only">
                                  Flight {index + 1} arrival date
                                </label>
                                <input
                                  id={`${segment.id}-arr-date`}
                                  type="date"
                                  value={segment.arrDate}
                                  onChange={(event) =>
                                    updateSegment(segment.id, { arrDate: event.target.value })
                                  }
                                  aria-label={`Flight ${index + 1} arrival date`}
                                  className={fieldClass(fieldHasError(segment.id, "arrDate"))}
                                />
                              </div>
                              <div>
                                <label htmlFor={`${segment.id}-arr-time`} className="sr-only">
                                  Flight {index + 1} arrival time
                                </label>
                                <input
                                  id={`${segment.id}-arr-time`}
                                  type="time"
                                  value={segment.arrTime}
                                  onChange={(event) =>
                                    updateSegment(segment.id, { arrTime: event.target.value })
                                  }
                                  aria-label={`Flight ${index + 1} arrival time`}
                                  className={fieldClass(fieldHasError(segment.id, "arrDate"))}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                          <Globe2 className="h-3 w-3 text-sky-500" aria-hidden="true" />
                          {depAirport ? depAirport.timezone : "Choose origin"} →{" "}
                          {arrAirport ? arrAirport.timezone : "choose destination"}
                        </p>
                        {previewLeg && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-sky-700 shadow-sm dark:bg-slate-900 dark:text-sky-300">
                            <Clock3 className="h-3 w-3" aria-hidden="true" />
                            {formatDuration(previewLeg.durationMinutes)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {mode === MODES.DURATION && (
                <button
                  type="button"
                  onClick={handleAddConnection}
                  disabled={segments.length >= MAX_SEGMENTS}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-sky-300 bg-sky-50/50 px-4 py-3 text-xs font-extrabold text-sky-700 transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-800 dark:bg-sky-950/20 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:bg-sky-950/40"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {segments.length >= MAX_SEGMENTS
                    ? `Maximum ${MAX_SEGMENTS} flights reached`
                    : "Add connection"}
                </button>
              )}

              {mode !== MODES.DURATION && (
                <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                        <Timer className="h-3.5 w-3.5" aria-hidden="true" />
                        Flight duration
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                        Time from take-off to landing, not including airport buffers.
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-sky-700 shadow-sm dark:bg-slate-900 dark:text-sky-300">
                      {formatDuration(durationMinutes)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="flight-duration-hours"
                        className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                      >
                        Hours
                      </label>
                      <input
                        id="flight-duration-hours"
                        type="number"
                        min={0}
                        max={72}
                        step={1}
                        value={duration.hours}
                        onChange={(event) =>
                          setDuration((current) => ({
                            ...current,
                            hours: event.target.value,
                          }))
                        }
                        className={fieldClass(durationHasError)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="flight-duration-minutes"
                        className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                      >
                        Minutes
                      </label>
                      <input
                        id="flight-duration-minutes"
                        type="number"
                        min={0}
                        max={59}
                        step={1}
                        value={duration.minutes}
                        onChange={(event) =>
                          setDuration((current) => ({
                            ...current,
                            minutes: event.target.value,
                          }))
                        }
                        className={fieldClass(durationHasError)}
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {[60, 180, 360].map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() =>
                          setDuration({
                            hours: Math.floor(minutes / 60),
                            minutes: minutes % 60,
                          })
                        }
                        className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm transition hover:text-sky-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-sky-300"
                      >
                        {formatDuration(minutes)}
                      </button>
                    ))}
                  </div>

                  {durationHasError && (
                    <p className="mt-2 text-[10px] font-semibold text-rose-600 dark:text-rose-300">
                      Enter a duration between 10 minutes and 72 hours.
                    </p>
                  )}
                </div>
              )}

              {mode !== MODES.DURATION && segments.length > 1 && (
                <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-snug text-amber-700 dark:text-amber-300">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  This mode uses Flight 1. Switch back to Duration to calculate all connections.
                </p>
              )}

              {/* Advanced options */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((current) => !current)}
                  aria-expanded={showAdvanced}
                  className="flex w-full items-center justify-between gap-2 bg-slate-50/80 px-4 py-3 text-left transition hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                >
                  <span className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-100">
                    <Settings2 className="h-4 w-4 text-sky-500" aria-hidden="true" />
                    Advanced options
                    {activeSettingCount > 0 && (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-extrabold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                        {activeSettingCount} changed
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {showAdvanced && (
                  <div className="space-y-5 border-t border-slate-200 p-4 dark:border-slate-800">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <SegmentedControl
                        label="Clock format"
                        value={settings.timeFormat}
                        onChange={(value) => updateSettings({ timeFormat: value })}
                        options={[
                          { value: "24h", label: "24-hour" },
                          { value: "12h", label: "12-hour" },
                        ]}
                      />
                      <SegmentedControl
                        label="Distance units"
                        value={settings.units}
                        onChange={(value) => updateSettings({ units: value })}
                        options={[
                          { value: "km", label: "Kilometres" },
                          { value: "mi", label: "Miles" },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <RangeSetting
                        label="Pre-departure buffer"
                        value={settings.preBufferMinutes}
                        min={0}
                        max={300}
                        step={15}
                        suffix="min"
                        onChange={(value) => updateSettings({ preBufferMinutes: value })}
                        hint="Time at the airport before departure — check-in, bags and security."
                      />
                      <RangeSetting
                        label="Post-arrival buffer"
                        value={settings.postBufferMinutes}
                        min={0}
                        max={180}
                        step={15}
                        suffix="min"
                        onChange={(value) => updateSettings({ postBufferMinutes: value })}
                        hint="Time after landing for immigration, baggage claim and onward transport."
                      />
                      <RangeSetting
                        label="Minimum domestic connection"
                        value={settings.minDomesticConnection}
                        min={20}
                        max={180}
                        step={5}
                        suffix="min"
                        onChange={(value) => updateSettings({ minDomesticConnection: value })}
                        hint="Used to score layovers within the same country."
                      />
                      <RangeSetting
                        label="Minimum international connection"
                        value={settings.minInternationalConnection}
                        min={30}
                        max={240}
                        step={5}
                        suffix="min"
                        onChange={(value) =>
                          updateSettings({ minInternationalConnection: value })
                        }
                        hint="Used when the next flight departs from another country."
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <ToggleSetting
                        label="Include buffers in headline"
                        description="Show door-to-door time in the large result. Turn off for gate-to-gate only."
                        checked={settings.includeBuffersInHeadline}
                        onChange={(value) =>
                          updateSettings({ includeBuffersInHeadline: value })
                        }
                      />
                      <ToggleSetting
                        label="Show distance & speed"
                        description="Great-circle distance and average airborne speed estimates."
                        checked={settings.showDistance}
                        onChange={(value) => updateSettings({ showDistance: value })}
                      />
                      <ToggleSetting
                        label="Show journey timeline"
                        description="A proportional bar showing flights and layovers at a glance."
                        checked={settings.showTimeline}
                        onChange={(value) => updateSettings({ showTimeline: value })}
                      />
                      <ToggleSetting
                        label="Show technical time zones"
                        description="Display IANA zone names and exact UTC offsets in each leg."
                        checked={settings.showTechnicalDetails}
                        onChange={(value) => updateSettings({ showTechnicalDetails: value })}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                        These settings never change the underlying times — they only change how the
                        itinerary is presented and scored.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSettings(DEFAULT_SETTINGS)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:text-sky-300"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Reset settings
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!result.ok}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-[11px] font-extrabold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:bg-sky-950/50"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copy summary
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!result.ok}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2.5 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  PDF report
                </button>
              </div>

              <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Everything runs in your browser — no itinerary data is uploaded.
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-500" aria-hidden="true" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Built for real itineraries
                </h2>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                <p className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                  <strong className="block text-slate-800 dark:text-slate-100">
                    Departure & arrival
                  </strong>
                  Enter local airport times and get the true airborne duration.
                </p>
                <p className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                  <strong className="block text-slate-800 dark:text-slate-100">
                    Connections
                  </strong>
                  Compare layovers with realistic domestic and international minimums.
                </p>
                <p className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                  <strong className="block text-slate-800 dark:text-slate-100">
                    Door-to-door
                  </strong>
                  Add airport buffers to see the time your day actually needs.
                </p>
              </div>
            </section>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:col-span-5">
            <FlightResults result={result} mode={mode} settings={settings} tripName={tripName} />

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Layover rule of thumb
                </h2>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Allow <strong className="text-slate-800 dark:text-slate-100">45 minutes</strong> for
                a domestic connection and <strong className="text-slate-800 dark:text-slate-100">90
                minutes</strong> for an international one. Add more time if you need to clear
                immigration, collect checked bags, change terminals or re-check in with a different
                airline.
              </p>
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                A tight connection is not automatically a bad booking — but it leaves less room for
                delays. Use the Advanced options to match your own comfort level.
              </div>
            </div>
          </div>
        </div>

        {/* Editorial */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FLIGHT_TIPS.map((tip) => {
            const Icon = TIP_ICONS[tip.icon] || Info;
            return (
              <div
                key={tip.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="mt-3 text-sm font-extrabold text-slate-900 dark:text-white">
                  {tip.title}
                </h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {tip.detail}
                </p>
              </div>
            );
          })}
        </section>

        {/* Formula */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-sky-500" aria-hidden="true" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              How flight duration is calculated
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xs">
            Local clock times cannot be subtracted directly because every airport sits in a
            different time zone. The calculator converts each time to UTC first, then subtracts the
            instants. That is why a 2-hour time difference never makes a 4-hour flight look like a
            6-hour one.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                01 · Localise
              </span>
              <h3 className="mt-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                Read both clocks
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Departure is interpreted in the origin airport&apos;s time zone and arrival in the
                destination&apos;s time zone, with daylight saving applied for the exact date.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                02 · Normalise
              </span>
              <h3 className="mt-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                Convert to UTC
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Both instants move onto the same universal timeline. This removes time-zone
                confusion, date-line crossings and overnight flights from the maths.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                03 · Compare
              </span>
              <h3 className="mt-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                Add the ground time
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Subtract the UTC instants to get airborne time, then add each layover and your
                airport buffers to reveal the full journey.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 font-mono text-[11px] text-sky-200 dark:bg-black/50 sm:text-xs">
            <div>flight_minutes = arrival_utc - departure_utc</div>
            <div className="mt-1">journey_minutes = last_arrival_utc - first_departure_utc</div>
            <div className="mt-1">door_to_door = journey_minutes + pre_buffer + post_buffer</div>
          </div>
        </section>

        {/* FAQ */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-7">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-sky-500" aria-hidden="true" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Flight Duration Calculator FAQ
              </h2>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-xs">
              The details that matter when you are comparing flights, checking a connection or
              planning a long-haul day.
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {FLIGHT_FAQS.map((faq, index) => {
              const expanded = openFaq === index;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(expanded ? null : index)}
                    aria-expanded={expanded}
                    aria-controls={`flight-faq-${index}`}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:px-7"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
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
                      id={`flight-faq-${index}`}
                      className="px-5 pb-4 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 sm:px-7 sm:text-xs"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <p className="mx-auto max-w-3xl text-center text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
          Flight schedules, aircraft routings and airport procedures change. Use these results as a
          planning estimate and confirm the final timings, connection minimums and terminal
          transfer times with your airline or travel agent before booking. Distances are
          great-circle estimates; actual flown tracks are usually slightly longer.
        </p>
      </div>
    </ToolPageShell>
  );
}
