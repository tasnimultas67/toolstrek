"use client";

import React, { useEffect, useMemo, useState } from "react";
import ToolPageShell from "../../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BadgeDollarSign,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCopy,
  Download,
  Fuel,
  Gauge,
  Info,
  Leaf,
  Lightbulb,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Route,
  Settings2,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Wallet,
} from "lucide-react";
import {
  CURRENCIES,
  DEFAULT_TRIP,
  DRIVING_STYLES,
  EFFICIENCY_UNITS,
  EXTRA_COST_FIELDS,
  FUEL_FAQS,
  FUEL_TIPS,
  FUEL_TYPES,
  LOAD_OPTIONS,
  UNIT_SYSTEMS,
  VEHICLE_PRESETS,
  calculateTrip,
  convertEfficiency,
  efficiencyForPreset,
  formatCurrency,
  formatDurationMinutes,
  formatNumber,
  tripCsv,
  tripSummary,
} from "./fuelCostData";

const FIELD_BASE =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:ring-2 focus:ring-amber-500/30 dark:bg-slate-800/80 dark:text-white [color-scheme:light] dark:[color-scheme:dark]";

function fieldClass(error) {
  return `${FIELD_BASE} ${
    error
      ? "border-rose-400 ring-1 ring-rose-300 dark:border-rose-700 dark:ring-rose-900/60"
      : "border-slate-200 dark:border-slate-700"
  }`;
}

const INPUT_LABEL =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400";

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
      <AlertTriangle className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

function Segmented({ value, onChange, options, label }) {
  return (
    <div>
      <span className={INPUT_LABEL}>{label}</span>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`rounded-lg px-2 py-2 text-xs font-extrabold transition ${
              value === option.value
                ? "bg-white text-amber-700 shadow-sm dark:bg-slate-700 dark:text-amber-300"
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

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <div>
        <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{label}</div>
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
          checked ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"
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

function Metric({ icon: Icon, label, value, sub, tone = "amber" }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    teal: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-2 text-lg font-black leading-none text-slate-900 dark:text-white">{value}</p>
      {sub && (
        <p className="mt-1.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">{sub}</p>
      )}
    </div>
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
  if (!successful) throw new Error("Copy failed");
}

function safeFileName(value) {
  return (
    String(value || "road-trip")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 42) || "road-trip"
  );
}

export default function FuelCostCalculator() {
  const { addRecentTool } = useRecentTools();
  const [trip, setTrip] = useState({ ...DEFAULT_TRIP });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const result = useMemo(() => calculateTrip(trip), [trip]);

  useEffect(() => {
    addRecentTool({
      title: "Fuel Cost & Road Trip Calculator",
      link: "/tools/fuel-cost-calculator",
      icon: "Fuel",
    });
  }, [addRecentTool]);

  const currency = CURRENCIES.find((item) => item.code === trip.currency) || CURRENCIES[0];
  const errors = result.errors || {};
  const errorList = Object.values(errors);
  const tradeoffLabel = trip.roundTrip ? "Round trip" : "One way";
  const economyLabel =
    result.unitSystem === "metric" ? "L/100 km" : "mpg (US)";
  const costPer100Label = result.unitSystem === "metric" ? "per 100 km" : "per 100 mi";
  const tankfuls = result.ok ? result.totalDistance / result.fullTankRange : 0;

  const update = (patch) => setTrip((current) => ({ ...current, ...patch }));

  const handleUnitSystem = (nextSystem) => {
    if (nextSystem === trip.unitSystem) return;
    setTrip((current) => ({
      ...current,
      ...(() => {
        const converted = convertEfficiency(
          Number(current.efficiency) || 0,
          current.efficiencyUnit,
          UNIT_SYSTEMS[nextSystem].efficiencyUnits[0],
        );
        return {
          unitSystem: nextSystem,
          distance:
            nextSystem === "imperial"
              ? Math.round(((Number(current.distance) || 0) / 1.609344) * 100) / 100
              : Math.round(((Number(current.distance) || 0) * 1.609344) * 100) / 100,
          fuelPrice:
            nextSystem === "imperial"
              ? Math.round(((Number(current.fuelPrice) || 0) * 3.785411784) * 1000) / 1000
              : Math.round(((Number(current.fuelPrice) || 0) / 3.785411784) * 1000) / 1000,
          averageSpeed:
            nextSystem === "imperial"
              ? Math.round(((Number(current.averageSpeed) || 0) / 1.609344) * 10) / 10
              : Math.round(((Number(current.averageSpeed) || 0) * 1.609344) * 10) / 10,
          tankSize:
            nextSystem === "imperial"
              ? Math.round(((Number(current.tankSize) || 0) / 3.785411784) * 100) / 100
              : Math.round(((Number(current.tankSize) || 0) * 3.785411784) * 100) / 100,
          efficiency: Math.round(converted * 100) / 100,
          efficiencyUnit: UNIT_SYSTEMS[nextSystem].efficiencyUnits[0],
        };
      })(),
    }));
    toast.success(`Switched to ${UNIT_SYSTEMS[nextSystem].label.toLowerCase()} units.`);
  };

  const handleEfficiencyUnit = (nextUnit) => {
    setTrip((current) => ({
      ...current,
      efficiencyUnit: nextUnit,
      efficiency: Math.round(
        convertEfficiency(Number(current.efficiency) || 0, current.efficiencyUnit, nextUnit) * 100,
      ) / 100,
    }));
  };

  const handlePreset = (presetId) => {
    const preset = VEHICLE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setTrip((current) => ({
      ...current,
      vehiclePreset: presetId,
      efficiency: efficiencyForPreset(preset.l100, current.efficiencyUnit),
      tankSize:
        current.unitSystem === "metric"
          ? preset.tankLitres
          : Math.round((preset.tankLitres / 3.785411784) * 100) / 100,
    }));
  };

  const handleReset = () => {
    setTrip({ ...DEFAULT_TRIP });
    setShowAdvanced(false);
    setOpenFaq(0);
    toast.success("Trip reset to the sample weekend drive.");
  };

  const handleCopy = async () => {
    if (!result.ok) {
      toast.error("Fix the highlighted trip details before copying a summary.");
      return;
    }
    const text = tripSummary(trip, result);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      toast.success("Trip summary copied to clipboard.");
    } catch {
      toast.error("Copy failed. Your browser may be blocking clipboard access.");
    }
  };

  const handleDownload = () => {
    if (!result.ok) {
      toast.error("Fix the highlighted trip details before downloading a CSV.");
      return;
    }
    const csv = tripCsv(trip, result);
    downloadBlob(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
      `${safeFileName(trip.tripName)}-fuel-cost.csv`,
    );
    toast.success("CSV trip sheet downloaded.");
  };

  return (
    <ToolPageShell>
      <div className="mx-auto w-full max-w-6xl space-y-7 pb-12">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-xl shadow-orange-500/15 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-yellow-200/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-rose-300/20 blur-2xl" />
          <div className="pointer-events-none absolute right-8 top-8 hidden h-20 w-36 rounded-full border border-dashed border-white/25 lg:block" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-amber-50 backdrop-blur-sm">
              <Route className="h-3.5 w-3.5" aria-hidden="true" />
              Road-trip budget studio
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Fuel Cost &amp; Road Trip Calculator
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-amber-50/95 sm:text-base">
              Turn distance, fuel economy and pump prices into a complete road-trip budget.
              See what the drive really costs, split it fairly between passengers, and plan
              fuel stops before you leave the driveway.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Fuel + extras",
                "Metric & imperial",
                "Cost per person",
                "Range & fuel stops",
                "100% private",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-amber-50 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-3 w-3 text-yellow-100" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-2 right-4 hidden w-72 opacity-95 lg:block xl:right-10">
            <svg viewBox="0 0 300 150" role="img" aria-label="Illustration of a car on a winding road">
              <path d="M0 125 C55 125 70 60 130 68 S230 122 300 58" fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="34" strokeLinecap="round" />
              <path d="M0 125 C55 125 70 60 130 68 S230 122 300 58" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeDasharray="10 12" strokeLinecap="round" />
              <g transform="translate(96 35) rotate(-6)">
                <rect x="0" y="18" width="106" height="32" rx="13" fill="white" opacity="0.96" />
                <path d="M20 20 L37 4 H72 L89 20 Z" fill="white" opacity="0.9" />
                <rect x="41" y="8" width="17" height="12" rx="3" fill="#fb923c" opacity="0.75" />
                <rect x="63" y="8" width="16" height="12" rx="3" fill="#fb923c" opacity="0.75" />
                <circle cx="25" cy="50" r="9" fill="#7c2d12" opacity="0.8" />
                <circle cx="25" cy="50" r="4" fill="#fde68a" />
                <circle cx="83" cy="50" r="9" fill="#7c2d12" opacity="0.8" />
                <circle cx="83" cy="50" r="4" fill="#fde68a" />
                <rect x="90" y="28" width="11" height="5" rx="2.5" fill="#fbbf24" />
              </g>
              <circle cx="230" cy="28" r="15" fill="#fef3c7" opacity="0.9" />
            </svg>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                    <Route className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white lg:text-base">
                      Plan the drive
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 lg:text-xs">
                      Results update live as you type.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-700 dark:hover:text-amber-300"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Reset sample
                </button>
              </div>

              <div className="mt-4">
                <label htmlFor="fuel-trip-name" className={INPUT_LABEL}>
                  Trip name <span className="font-medium normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="fuel-trip-name"
                  type="text"
                  value={trip.tripName}
                  maxLength={60}
                  onChange={(event) => update({ tripName: event.target.value })}
                  placeholder="e.g. Pacific coast weekend"
                  className={fieldClass(false)}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="fuel-from" className={INPUT_LABEL}>
                    From <span className="font-medium normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    id="fuel-from"
                    type="text"
                    value={trip.from}
                    maxLength={50}
                    onChange={(event) => update({ from: event.target.value })}
                    placeholder="Home"
                    className={fieldClass(false)}
                  />
                </div>
                <div>
                  <label htmlFor="fuel-to" className={INPUT_LABEL}>
                    To <span className="font-medium normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    id="fuel-to"
                    type="text"
                    value={trip.to}
                    maxLength={50}
                    onChange={(event) => update({ to: event.target.value })}
                    placeholder="Destination"
                    className={fieldClass(false)}
                  />
                </div>
              </div>

              <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_1.1fr]">
                <div>
                  <label htmlFor="fuel-distance" className={INPUT_LABEL}>
                    One-way distance ({UNIT_SYSTEMS[trip.unitSystem].distanceLabel})
                  </label>
                  <input
                    id="fuel-distance"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={trip.distance}
                    aria-invalid={Boolean(errors.distance)}
                    aria-describedby={errors.distance ? "fuel-distance-error" : undefined}
                    onChange={(event) => update({ distance: event.target.value })}
                    className={fieldClass(errors.distance)}
                  />
                  <FieldError id="fuel-distance-error">{errors.distance}</FieldError>
                </div>
                <Segmented
                  label="Distance entry"
                  value={trip.roundTrip ? "round" : "oneway"}
                  onChange={(value) => update({ roundTrip: value === "round" })}
                  options={[
                    { value: "oneway", label: "One way" },
                    { value: "round", label: "Round trip" },
                  ]}
                />
              </div>

              <div className="mt-3">
                <Segmented
                  label="Unit system"
                  value={trip.unitSystem}
                  onChange={handleUnitSystem}
                  options={[
                    { value: "metric", label: "Metric · km / L" },
                    { value: "imperial", label: "Imperial · mi / gal" },
                  ]}
                />
              </div>

              <div className="mt-4">
                <Toggle
                  checked={Boolean(trip.roundTrip)}
                  onChange={(checked) => update({ roundTrip: checked })}
                  label="Include the return journey"
                  description="Doubles the entered distance for fuel, time, emissions and cost."
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
                  <Car className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white lg:text-base">
                    Vehicle &amp; fuel
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 lg:text-xs">
                    Use the label figure or enter your own real-world economy.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="fuel-vehicle-preset" className={INPUT_LABEL}>
                  Vehicle preset
                </label>
                <select
                  id="fuel-vehicle-preset"
                  value={trip.vehiclePreset}
                  onChange={(event) => handlePreset(event.target.value)}
                  className={fieldClass(false)}
                >
                  {VEHICLE_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label} — {preset.l100} L/100 km
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Choosing a preset fills the efficiency and tank size. You can still fine-tune both below.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="fuel-efficiency" className={INPUT_LABEL}>
                    Fuel efficiency
                  </label>
                  <div className="grid grid-cols-[1fr_118px] gap-2">
                    <input
                      id="fuel-efficiency"
                      type="number"
                      min="0"
                      step="0.1"
                      inputMode="decimal"
                      value={trip.efficiency}
                      aria-invalid={Boolean(errors.efficiency)}
                      aria-describedby={errors.efficiency ? "fuel-efficiency-error" : undefined}
                      onChange={(event) => update({ efficiency: event.target.value })}
                      className={fieldClass(errors.efficiency)}
                    />
                    <select
                      aria-label="Efficiency unit"
                      value={trip.efficiencyUnit}
                      onChange={(event) => handleEfficiencyUnit(event.target.value)}
                      className={fieldClass(false)}
                    >
                      {UNIT_SYSTEMS[trip.unitSystem].efficiencyUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {EFFICIENCY_UNITS[unit].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FieldError id="fuel-efficiency-error">{errors.efficiency}</FieldError>
                </div>

                <div>
                  <label htmlFor="fuel-price" className={INPUT_LABEL}>
                    Fuel price (per {UNIT_SYSTEMS[trip.unitSystem].volumeLabel})
                  </label>
                  <div className="grid grid-cols-[1fr_104px] gap-2">
                    <input
                      id="fuel-price"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={trip.fuelPrice}
                      aria-invalid={Boolean(errors.fuelPrice)}
                      aria-describedby={errors.fuelPrice ? "fuel-price-error" : undefined}
                      onChange={(event) => update({ fuelPrice: event.target.value })}
                      className={fieldClass(errors.fuelPrice)}
                    />
                    <select
                      aria-label="Currency"
                      value={trip.currency}
                      onChange={(event) => update({ currency: event.target.value })}
                      className={fieldClass(false)}
                    >
                      {CURRENCIES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FieldError id="fuel-price-error">{errors.fuelPrice}</FieldError>
                  <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                    Displayed in {currency.label} ({currency.symbol}).
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <span className={INPUT_LABEL}>Passengers</span>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800/80">
                    <button
                      type="button"
                      onClick={() => update({ passengers: Math.max(1, Number(trip.passengers) - 1) })}
                      disabled={Number(trip.passengers) <= 1}
                      aria-label="Remove passenger"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-amber-100 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                      <Users className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                      {trip.passengers}
                    </span>
                    <button
                      type="button"
                      onClick={() => update({ passengers: Math.min(12, Number(trip.passengers) + 1) })}
                      disabled={Number(trip.passengers) >= 12}
                      aria-label="Add passenger"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-amber-100 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <FieldError id="fuel-passengers-error">{errors.passengers}</FieldError>
                </div>

                <div>
                  <label htmlFor="fuel-type" className={INPUT_LABEL}>
                    Fuel type
                  </label>
                  <select
                    id="fuel-type"
                    value={trip.fuelType}
                    onChange={(event) => update({ fuelType: event.target.value })}
                    className={fieldClass(false)}
                  >
                    {FUEL_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Fuel cost covers every litre consumed, including from the tank you start with.
                Starting fuel only changes when you need to stop.
              </p>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setShowAdvanced((current) => !current)}
                aria-expanded={showAdvanced}
                aria-controls="fuel-advanced-panel"
                className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:p-5"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Settings2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-slate-900 dark:text-white">
                      Advanced trip options
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                      Tank, reserve, driving conditions, extra costs and budget.
                    </span>
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition ${showAdvanced ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {showAdvanced && (
                <div id="fuel-advanced-panel" className="border-t border-slate-100 p-4 dark:border-slate-800 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="fuel-driving-style" className={INPUT_LABEL}>
                        Driving style
                      </label>
                      <select
                        id="fuel-driving-style"
                        value={trip.drivingStyle}
                        onChange={(event) => update({ drivingStyle: event.target.value })}
                        className={fieldClass(false)}
                      >
                        {DRIVING_STYLES.map((style) => (
                          <option key={style.id} value={style.id}>
                            {style.label} ({style.adjustment >= 0 ? "+" : ""}
                            {style.adjustment}% fuel)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="fuel-load" className={INPUT_LABEL}>
                        Load & terrain
                      </label>
                      <select
                        id="fuel-load"
                        value={trip.load}
                        onChange={(event) => update({ load: event.target.value })}
                        className={fieldClass(false)}
                      >
                        {LOAD_OPTIONS.map((load) => (
                          <option key={load.id} value={load.id}>
                            {load.label} ({load.adjustment >= 0 ? "+" : ""}
                            {load.adjustment}% fuel)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="fuel-tank-size" className={INPUT_LABEL}>
                        Tank size ({UNIT_SYSTEMS[trip.unitSystem].volumeLabel})
                      </label>
                      <input
                        id="fuel-tank-size"
                        type="number"
                        min="0"
                        step="0.1"
                        inputMode="decimal"
                        value={trip.tankSize}
                        aria-invalid={Boolean(errors.tankSize)}
                        onChange={(event) => update({ tankSize: event.target.value })}
                        className={fieldClass(errors.tankSize)}
                      />
                      <FieldError id="fuel-tank-error">{errors.tankSize}</FieldError>
                    </div>
                    <div>
                      <label htmlFor="fuel-average-speed" className={INPUT_LABEL}>
                        Average speed ({UNIT_SYSTEMS[trip.unitSystem].speedLabel})
                      </label>
                      <input
                        id="fuel-average-speed"
                        type="number"
                        min="0"
                        step="1"
                        inputMode="decimal"
                        value={trip.averageSpeed}
                        aria-invalid={Boolean(errors.averageSpeed)}
                        onChange={(event) => update({ averageSpeed: event.target.value })}
                        className={fieldClass(errors.averageSpeed)}
                      />
                      <FieldError id="fuel-speed-error">{errors.averageSpeed}</FieldError>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <label htmlFor="fuel-starting" className={INPUT_LABEL}>
                        Starting fuel (%)
                      </label>
                      <input
                        id="fuel-starting"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        inputMode="decimal"
                        value={trip.startingFuel}
                        aria-invalid={Boolean(errors.startingFuel)}
                        onChange={(event) => update({ startingFuel: event.target.value })}
                        className={fieldClass(errors.startingFuel)}
                      />
                      <FieldError id="fuel-starting-error">{errors.startingFuel}</FieldError>
                    </div>
                    <div>
                      <label htmlFor="fuel-reserve" className={INPUT_LABEL}>
                        Reserve (%)
                      </label>
                      <input
                        id="fuel-reserve"
                        type="number"
                        min="0"
                        max="50"
                        step="1"
                        inputMode="decimal"
                        value={trip.reserve}
                        aria-invalid={Boolean(errors.reserve)}
                        onChange={(event) => update({ reserve: event.target.value })}
                        className={fieldClass(errors.reserve)}
                      />
                      <FieldError id="fuel-reserve-error">{errors.reserve}</FieldError>
                    </div>
                    <div>
                      <label htmlFor="fuel-break-minutes" className={INPUT_LABEL}>
                        Break time (min)
                      </label>
                      <input
                        id="fuel-break-minutes"
                        type="number"
                        min="0"
                        step="5"
                        inputMode="numeric"
                        value={trip.breakMinutes}
                        aria-invalid={Boolean(errors.breakMinutes)}
                        onChange={(event) => update({ breakMinutes: event.target.value })}
                        className={fieldClass(errors.breakMinutes)}
                      />
                      <FieldError id="fuel-break-error">{errors.breakMinutes}</FieldError>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      <Wallet className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                      Extra costs &amp; budget
                    </h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {EXTRA_COST_FIELDS.map((field) => (
                        <div key={field.key}>
                          <label htmlFor={`fuel-extra-${field.key}`} className={INPUT_LABEL}>
                            {field.label} ({trip.currency})
                          </label>
                          <input
                            id={`fuel-extra-${field.key}`}
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={trip[field.key]}
                            aria-invalid={Boolean(errors[field.key])}
                            onChange={(event) => update({ [field.key]: event.target.value })}
                            className={fieldClass(errors[field.key])}
                          />
                          <FieldError id={`fuel-${field.key}-error`}>{errors[field.key]}</FieldError>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <label htmlFor="fuel-budget" className={INPUT_LABEL}>
                        Trip budget ({trip.currency}, optional)
                      </label>
                      <input
                        id="fuel-budget"
                        type="number"
                        min="0"
                        step="1"
                        inputMode="decimal"
                        value={trip.budget}
                        aria-invalid={Boolean(errors.budget)}
                        onChange={(event) => update({ budget: event.target.value })}
                        className={fieldClass(errors.budget)}
                      />
                      <FieldError id="fuel-budget-error">{errors.budget}</FieldError>
                      <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Set to 0 to hide the budget comparison.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-5 lg:col-span-5 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm dark:border-amber-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Your road-trip estimate
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>

                {!result.ok ? (
                  <div role="alert" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-rose-800 dark:text-rose-200">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      Check the trip details
                    </div>
                    <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                      {errorList.slice(0, 4).map((error) => (
                        <li key={error} className="flex gap-1.5">
                          <span aria-hidden="true">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                    {errorList.length > 4 && (
                      <p className="mt-2 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                        Plus {errorList.length - 4} more field{errorList.length - 4 === 1 ? "" : "s"} to check.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-100 bg-white/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-slate-800 dark:text-slate-100">
                            {trip.from.trim() || "Start"}
                          </p>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                            {trip.roundTrip ? "Round trip" : "One way"}
                          </p>
                        </div>
                      </div>
                      <div className="relative h-px min-w-8 flex-1 border-t-2 border-dashed border-amber-300 dark:border-amber-800">
                        <Car className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      </div>
                      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-slate-800 dark:text-slate-100">
                            {trip.to.trim() || "Destination"}
                          </p>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                            {formatNumber(result.totalDistance)} {result.distanceUnit}
                          </p>
                        </div>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        Total trip cost
                      </p>
                      <p data-testid="total-trip-cost" className="mt-1 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        {formatCurrency(result.totalCost, trip.currency)}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Fuel {formatCurrency(result.fuelCost, trip.currency)}
                        {result.extraCosts > 0
                          ? ` + ${formatCurrency(result.extraCosts, trip.currency)} extras`
                          : " + no extra costs"}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-800/60">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Per person
                        </p>
                        <p data-testid="per-person-cost" className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                          {formatCurrency(result.perPerson, trip.currency)}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          split {result.passengers} way{result.passengers === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-800/60">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Fuel used
                        </p>
                        <p data-testid="fuel-used" className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                          {formatNumber(result.litres)} L
                        </p>
                        <p className="text-[9px] text-slate-400">
                          ≈ {formatNumber(result.gallons)} US gal
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        {tradeoffLabel}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {result.adjustmentPercent === 0
                          ? "No fuel adjustment"
                          : `${result.adjustmentPercent > 0 ? "+" : ""}${result.adjustmentPercent}% conditions`}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {result.driveMinutes > 0 ? formatDurationMinutes(result.driveMinutes) : "—"} driving
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-white px-2.5 py-2.5 text-[11px] font-extrabold text-amber-800 transition hover:bg-amber-50 dark:border-amber-900/60 dark:bg-slate-800 dark:text-amber-200 dark:hover:bg-slate-700"
                      >
                        <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" />
                        Copy summary
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-2.5 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        Download CSV
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {result.ok && (
              <>
                <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Cost breakdown</h2>
                    <span className="text-[10px] font-bold text-slate-400">{result.passengers} passenger{result.passengers === 1 ? "" : "s"}</span>
                  </div>

                  <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-amber-500"
                      style={{
                        width: `${result.totalCost > 0 ? (result.fuelCost / result.totalCost) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="h-full bg-teal-500"
                      style={{
                        width: `${result.totalCost > 0 ? (result.extraCosts / result.totalCost) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        Fuel
                      </span>
                      <span data-testid="fuel-cost" className="font-black text-slate-900 dark:text-white">
                        {formatCurrency(result.fuelCost, trip.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
                        <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                        Extra costs
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatCurrency(result.extraCosts, trip.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5 text-sm dark:border-slate-800">
                      <span className="font-extrabold text-slate-900 dark:text-white">Total</span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatCurrency(result.totalCost, trip.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-800/50">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Cost per {result.distanceUnit}</span>
                      <span className="mt-0.5 block text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        {formatCurrency(result.costPerDistance, trip.currency)}
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-800/50">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Cost {costPer100Label}</span>
                      <span className="mt-0.5 block text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        {formatCurrency(
                          result.unitSystem === "metric" ? result.costPer100Km : result.costPer100Miles,
                          trip.currency,
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Range & fuel plan</h2>
                  <div className="mt-3">
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Full-tank usable range
                        </p>
                        <p className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">
                          {formatNumber(result.fullTankRange)} {result.distanceUnit}
                        </p>
                      </div>
                      <p className="text-right text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {formatNumber(tankfuls, 1)} tankful{tankfuls >= 1 && tankfuls < 2 ? "" : "s"} for this trip
                      </p>
                    </div>
                    <div className="relative mt-3 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
                        style={{ width: `${Math.min(100, Math.max(2, tankfuls * 100))}%` }}
                      />
                      {tankfuls > 1 && (
                        <div className="absolute inset-0 flex">
                          {Array.from({ length: Math.min(8, Math.floor(tankfuls)) }).map((_, index) => (
                            <span
                              key={index}
                              className="h-full border-r border-white/60"
                              style={{ width: `${100 / Math.max(1, Math.min(8, Math.ceil(tankfuls)))}%` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Based on a {formatNumber(Number(trip.reserve))}% reserve. Starting level:
                      {" "}{formatNumber(Number(trip.startingFuel))}% of the tank.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Metric
                      icon={Fuel}
                      label="Need to buy"
                      value={`${formatNumber(result.fuelToBuy)} L`}
                      sub={`${formatNumber(result.refuelStops)} fuel stop${result.refuelStops === 1 ? "" : "s"} planned`}
                    />
                    <Metric
                      icon={Gauge}
                      label="Start range"
                      value={`${formatNumber(result.startingRange)} ${result.distanceUnit}`}
                      sub="Before your first fill-up"
                      tone="teal"
                    />
                  </div>

                  <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-[10px] leading-relaxed text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                    <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Estimates assume each stop fills the usable tank. Check station spacing before remote or overnight drives.
                  </p>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                  <div className="grid grid-cols-2 gap-2">
                    <Metric
                      icon={Route}
                      label="Trip distance"
                      value={`${formatNumber(result.totalDistance)} ${result.distanceUnit}`}
                      sub={trip.roundTrip ? "There and back" : "One way"}
                    />
                    <Metric
                      icon={Timer}
                      label="Drive time"
                      value={formatDurationMinutes(result.driveMinutes)}
                      sub={`Includes ${formatNumber(Number(trip.breakMinutes))} min of breaks`}
                      tone="sky"
                    />
                    <Metric
                      icon={Leaf}
                      label="CO₂ estimate"
                      value={`${formatNumber(result.co2Kg, 1)} kg`}
                      sub={`${result.fuelType.label} · ${formatNumber(result.litres)} L`}
                      tone="teal"
                    />
                    <Metric
                      icon={BadgeDollarSign}
                      label="Cost per passenger"
                      value={formatCurrency(result.perPerson, trip.currency)}
                      sub={`${formatCurrency(result.fuelPerPerson, trip.currency)} of that is fuel`}
                      tone="rose"
                    />
                  </div>
                </section>

                {result.budget > 0 && (
                  <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Budget check</h2>
                        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                          Budget {formatCurrency(result.budget, trip.currency)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold ${
                          result.budgetDifference >= 0
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                        }`}
                      >
                        {result.budgetDifference >= 0 ? (
                          <Check className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        )}
                        {result.budgetDifference >= 0 ? "Under budget" : "Over budget"}
                      </span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          result.budgetDifference >= 0 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, result.budgetPercent)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      You are{" "}
                      <strong className="font-extrabold text-slate-800 dark:text-slate-100">
                        {formatCurrency(Math.abs(result.budgetDifference), trip.currency)}{" "}
                        {result.budgetDifference >= 0 ? "under" : "over"}
                      </strong>{" "}
                      budget ({formatNumber(result.budgetPercent)}% used).
                    </p>
                  </section>
                )}
              </>
            )}

            <section className="rounded-3xl border border-teal-100 bg-teal-50/70 p-4 dark:border-teal-900/40 dark:bg-teal-950/20 sm:p-5">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <div>
                  <h2 className="text-xs font-extrabold text-teal-900 dark:text-teal-100">Private by design</h2>
                  <p className="mt-1 text-[10px] leading-relaxed text-teal-800/80 dark:text-teal-200/80">
                    Your route, fuel prices and budget stay in this tab. Nothing is uploaded,
                    logged or stored, and there is no account or tracking.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300">
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Make the estimate work harder</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Three habits that keep road-trip budgets honest.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {FUEL_TIPS.map((tip, index) => (
              <div key={tip.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-[10px] font-black text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                  {index + 1}
                </span>
                <h3 className="mt-2 text-xs font-extrabold text-slate-900 dark:text-white">{tip.title}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{tip.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Fuel Cost &amp; Road Trip FAQ</h2>
          </div>
          <div className="mt-4 space-y-2">
            {FUEL_FAQS.map((faq, index) => {
              const expanded = openFaq === index;
              return (
                <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(expanded ? null : index)}
                    aria-expanded={expanded}
                    aria-controls={`fuel-faq-${index}`}
                    className="flex w-full items-center justify-between gap-3 bg-slate-50/60 px-4 py-3 text-left text-xs font-extrabold text-slate-800 transition hover:bg-amber-50/60 dark:bg-slate-800/40 dark:text-slate-100 dark:hover:bg-slate-800/70 sm:text-[13px]"
                  >
                    {faq.question}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {expanded && (
                    <p id={`fuel-faq-${index}`} className="bg-white px-4 py-3 text-[11px] leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-300 sm:text-xs">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          Fuel prices vary by station, region and day. Treat this estimate as a planning guide, not a quote.
          <ArrowRight className="hidden h-3.5 w-3.5 sm:block" aria-hidden="true" />
        </div>
      </div>
    </ToolPageShell>
  );
}
