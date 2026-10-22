"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Plane, Search, X } from "lucide-react";
import {
  AIRPORTS,
  AIRPORT_MAP,
  CUSTOM_AIRPORT_CODE,
  TIME_ZONES,
} from "./flightDurationData";

const MAX_VISIBLE_AIRPORTS = 80;

const inputBase =
  "w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-[15px] lg:text-base text-slate-900 outline-none transition focus:ring-2 focus:ring-sky-500/30 dark:bg-slate-800/60 dark:text-white";

function normalise(value) {
  return String(value || "").toLowerCase();
}

export default function AirportPicker({
  id,
  label,
  value,
  onChange,
  customLabel = "",
  customTimeZone = "UTC",
  onCustomLabelChange,
  onCustomTimeZoneChange,
  invalid = false,
  hint,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const selectedAirport = value === CUSTOM_AIRPORT_CODE ? null : AIRPORT_MAP.get(value);
  const isCustom = value === CUSTOM_AIRPORT_CODE;

  const filteredAirports = useMemo(() => {
    const term = normalise(query).trim();
    if (!term) return AIRPORTS;
    return AIRPORTS.filter((airport) =>
      [airport.code, airport.city, airport.name, airport.country]
        .map(normalise)
        .some((field) => field.includes(term)),
    );
  }, [query]);

  const visibleAirports = filteredAirports.slice(0, MAX_VISIBLE_AIRPORTS);
  const showCustomOption = useMemo(() => {
    const term = normalise(query).trim();
    if (!term) return true;
    return ["custom", "manual", "other", "timezone"].some((word) => word.includes(term) || term.includes(word));
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 20);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const choose = (code) => {
    onChange(code);
    setQuery("");
    setOpen(false);
  };

  const errorClasses = invalid
    ? "border-rose-400 ring-1 ring-rose-300 dark:border-rose-700 dark:ring-rose-900/60"
    : "border-slate-200 dark:border-slate-700";

  const displayCode = isCustom ? "CUSTOM" : selectedAirport?.code || "—";
  const displayCity = isCustom
    ? customLabel.trim() || "Custom airport"
    : selectedAirport?.city || "Select airport";
  const displayTimezone = isCustom
    ? customTimeZone
    : selectedAirport?.timezone || "Time zone detected automatically";

  return (
    <div className="relative w-full min-w-0" ref={containerRef}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs lg:text-[13px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>

      <button
        id={id}
        type="button"
        onClick={() => {
          setQuery("");
          setOpen((current) => !current);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-slate-50 px-3 py-2.5 text-left shadow-sm transition hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30 dark:bg-slate-800/60 dark:hover:border-sky-700 ${errorClasses}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm dark:bg-slate-900 dark:text-sky-400">
            <Plane className="h-4 w-4 -rotate-45" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="flex items-baseline gap-2">
              <span className="truncate text-[15px] lg:text-base font-extrabold text-slate-900 dark:text-white">
                {displayCity}
              </span>
              <span className="text-[11px] lg:text-xs font-bold tracking-wider text-sky-600 dark:text-sky-400">
                {displayCode}
              </span>
            </span>
            <span className="mt-0.5 flex items-center gap-1 truncate text-[11px] lg:text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              {displayTimezone}
            </span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {hint && (
        <p className="mt-1.5 text-[11px] lg:text-xs leading-snug text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}

      {open && (
        <div className="absolute left-0 right-auto z-[80] mt-2 w-full max-w-[20rem] origin-top-left overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40">
          <div className="border-b border-slate-100 p-2.5 dark:border-slate-800">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by city, code, airport or country..."
                aria-label={`Search ${label.toLowerCase()}`}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-[13px] lg:text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear airport search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <ul role="listbox" aria-label={label} className="max-h-72 overflow-y-auto py-1">
            {showCustomOption && (
              <li role="option" aria-selected={isCustom}>
                <button
                  type="button"
                  onClick={() => choose(CUSTOM_AIRPORT_CODE)}
                  className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-sky-50 dark:hover:bg-sky-950/30 ${
                    isCustom ? "bg-sky-50 dark:bg-sky-950/40" : ""
                  }`}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-dashed border-sky-300 text-sky-600 dark:border-sky-700 dark:text-sky-400">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[13px] lg:text-sm font-bold text-slate-800 dark:text-slate-100">
                      Custom airport
                      {isCustom && <Check className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />}
                    </span>
                    <span className="mt-0.5 block text-[11px] lg:text-xs leading-snug text-slate-500 dark:text-slate-400">
                      Enter any airport and choose its time zone manually.
                    </span>
                  </span>
                </button>
              </li>
            )}

            {visibleAirports.map((airport) => {
              const selected = airport.code === value;
              return (
                <li key={airport.code} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => choose(airport.code)}
                    className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-sky-50 dark:hover:bg-sky-950/30 ${
                      selected ? "bg-sky-50 dark:bg-sky-950/40" : ""
                    }`}
                  >
                    <span className="mt-0.5 flex h-7 min-w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-1.5 text-[11px] lg:text-xs font-black tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {airport.code}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[13px] lg:text-sm font-bold text-slate-800 dark:text-slate-100">
                        {airport.city}
                        {selected && <Check className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] lg:text-xs text-slate-500 dark:text-slate-400">
                        {airport.name} · {airport.country}
                      </span>
                      <span className="mt-0.5 block text-[11px] lg:text-xs font-medium text-sky-600/80 dark:text-sky-400/80">
                        {airport.timezone}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}

            {visibleAirports.length === 0 && !showCustomOption && (
              <li className="px-4 py-5 text-center text-[13px] lg:text-sm text-slate-500 dark:text-slate-400">
                No airports match “{query}”. Try a city, code or country.
              </li>
            )}
          </ul>

          {filteredAirports.length > MAX_VISIBLE_AIRPORTS && (
            <p className="border-t border-slate-100 px-3 py-2 text-[11px] lg:text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Showing {MAX_VISIBLE_AIRPORTS} of {filteredAirports.length} airports. Refine your search to narrow the list.
            </p>
          )}
        </div>
      )}

      {isCustom && (
        <div className="mt-2.5 grid grid-cols-1 gap-2 rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-2.5 dark:border-sky-900/60 dark:bg-sky-950/20 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${id}-label`}
              className="mb-1 block text-[11px] lg:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Airport / city
            </label>
            <input
              id={`${id}-label`}
              type="text"
              value={customLabel}
              onChange={(event) => onCustomLabelChange?.(event.target.value)}
              placeholder="e.g. Sylhet, Bangladesh"
              maxLength={48}
              className={`${inputBase} border-slate-200 py-2 text-[13px] lg:text-sm dark:border-slate-700`}
            />
          </div>
          <div>
            <label
              htmlFor={`${id}-tz`}
              className="mb-1 block text-[11px] lg:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Time zone
            </label>
            <select
              id={`${id}-tz`}
              value={customTimeZone}
              onChange={(event) => onCustomTimeZoneChange?.(event.target.value)}
              className={`${inputBase} border-slate-200 py-2 text-[13px] lg:text-sm dark:border-slate-700`}
            >
              {TIME_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
