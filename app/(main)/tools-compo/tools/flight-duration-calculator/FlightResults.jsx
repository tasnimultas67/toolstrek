"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Compass,
  Gauge,
  Globe2,
  Info,
  MapPin,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Route,
  ShieldCheck,
  Timer,
  TrendingUp,
} from "lucide-react";
import {
  MODES,
  formatClock,
  formatDateLabel,
  formatDayShift,
  formatDistance,
  formatDuration,
  formatSpeed,
  formatTimezoneShift,
  formatUtcOffset,
} from "./flightDurationData";

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 dark:border-slate-700/70 dark:bg-slate-900/60">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1.5 text-sm font-extrabold text-slate-900 dark:text-white">{value}</div>
      {hint && (
        <div className="mt-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
          {hint}
        </div>
      )}
    </div>
  );
}

function ErrorPanel({ errors }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/25 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-100">
            We couldn&apos;t calculate this trip yet
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-rose-700/90 dark:text-rose-200/80">
            Fix the highlighted details below. Nothing is lost — your itinerary is still here.
          </p>
          <ul className="mt-3 space-y-2">
            {errors.map((error, index) => (
              <li
                key={`${error.message}-${index}`}
                className="flex items-start gap-2 text-xs leading-relaxed text-rose-800 dark:text-rose-200"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WarningPanel({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20 sm:p-5">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-200">
          Good to know
        </h3>
      </div>
      <ul className="mt-2.5 space-y-2">
        {warnings.map((warning, index) => (
          <li
            key={`${warning.message}-${index}`}
            className="flex items-start gap-2 text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-100/80"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            <span>{warning.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConnectionCard({ connection }) {
  const styles = {
    "below-minimum": {
      wrapper: "border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20",
      badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
      label: "Below minimum",
      icon: AlertTriangle,
    },
    tight: {
      wrapper: "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
      label: "Tight connection",
      icon: Clock3,
    },
    long: {
      wrapper: "border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20",
      badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
      label: "Long layover",
      icon: Timer,
    },
    comfortable: {
      wrapper: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      label: "Comfortable",
      icon: ShieldCheck,
    },
  };
  const style = styles[connection.level] || styles.comfortable;
  const Icon = style.icon;

  return (
    <div className={`rounded-2xl border p-3.5 ${style.wrapper}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-slate-600 shadow-sm dark:bg-slate-900/70 dark:text-slate-300">
            <Route className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
              Layover in {connection.airport.city} ({connection.airport.code})
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatDuration(connection.minutes)} · {connection.isInternational ? "International" : "Domestic"} transfer · minimum {connection.minimumMinutes} min
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${style.badge}`}>
          <Icon className="h-3 w-3" aria-hidden="true" />
          {style.label}
        </span>
      </div>
    </div>
  );
}

function Timeline({ legs, connections, totals, timeFormat }) {
  const items = [];
  legs.forEach((leg, index) => {
    if (index > 0) {
      const connection = connections[index - 1];
      if (connection) items.push({ type: "connection", ...connection });
    }
    items.push({ type: "flight", ...leg });
  });

  const total = Math.max(1, totals.gateToGateMinutes);
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-sky-500" aria-hidden="true" />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Journey timeline</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Gate to gate · {formatDuration(totals.gateToGateMinutes)}
        </span>
      </div>

      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
        {items.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            title={
              item.type === "flight"
                ? `${item.label}: ${formatDuration(item.durationMinutes)}`
                : `Layover: ${formatDuration(item.minutes)}`
            }
            style={{ flexGrow: Math.max(1, item.type === "flight" ? item.durationMinutes : item.minutes), flexBasis: 0 }}
            className={
              item.type === "flight"
                ? "bg-gradient-to-r from-sky-500 to-cyan-400"
                : "bg-amber-400"
            }
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <span>{formatClock(firstLeg.depParts.hour, firstLeg.depParts.minute, timeFormat)}</span>
        <span>{formatClock(lastLeg.arrParts.hour, lastLeg.arrParts.minute, timeFormat)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          Flight time · {formatDuration(totals.flightMinutes)}
        </span>
        {totals.layoverMinutes > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Layovers · {formatDuration(totals.layoverMinutes)}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          {Math.round((totals.flightMinutes / total) * 100)}% airborne
        </span>
      </div>
    </div>
  );
}

function LegCard({ leg, settings, highlight }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              <Plane className="h-3 w-3 -rotate-45" aria-hidden="true" />
              {leg.label}
            </span>
            {leg.airline && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {leg.airline}
                {leg.flightNumber ? ` · ${leg.flightNumber}` : ""}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {leg.depAirport.code}
            </span>
            <ArrowRight className="h-4 w-4 text-sky-500" aria-hidden="true" />
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {leg.arrAirport.code}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {leg.depAirport.city} → {leg.arrAirport.city}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            {formatDuration(leg.durationMinutes)}
          </span>
          {settings.showDistance && leg.distanceKm !== null && (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {formatDistance(leg.distanceKm, settings.units)}
            </span>
          )}
          {leg.dayShift !== 0 && (
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {formatDayShift(leg.dayShift)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className={`rounded-2xl border p-3.5 ${
            highlight === "departure"
              ? "border-sky-300 bg-sky-50 ring-1 ring-sky-200 dark:border-sky-800 dark:bg-sky-950/30 dark:ring-sky-900/60"
              : "border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <PlaneTakeoff className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
            Departs
          </div>
          <div className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {formatClock(leg.depParts.hour, leg.depParts.minute, settings.timeFormat)}
          </div>
          <div className="mt-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {formatDateLabel(leg.depParts)}
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            {leg.depAirport.city} · {leg.depAirport.timezone}
          </div>
          {settings.showTechnicalDetails && (
            <div className="mt-0.5 text-[10px] font-semibold text-sky-600/80 dark:text-sky-400/80">
              {formatUtcOffset(leg.depOffsetMinutes)}
            </div>
          )}
        </div>

        <div
          className={`rounded-2xl border p-3.5 ${
            highlight === "arrival"
              ? "border-sky-300 bg-sky-50 ring-1 ring-sky-200 dark:border-sky-800 dark:bg-sky-950/30 dark:ring-sky-900/60"
              : "border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <PlaneLanding className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            Arrives
          </div>
          <div className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {formatClock(leg.arrParts.hour, leg.arrParts.minute, settings.timeFormat)}
          </div>
          <div className="mt-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {formatDateLabel(leg.arrParts)}
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            {leg.arrAirport.city} · {leg.arrAirport.timezone}
          </div>
          {settings.showTechnicalDetails && (
            <div className="mt-0.5 text-[10px] font-semibold text-sky-600/80 dark:text-sky-400/80">
              {formatUtcOffset(leg.arrOffsetMinutes)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Globe2 className="h-3 w-3" aria-hidden="true" />
          Time-zone shift {formatTimezoneShift(leg.timezoneShiftMinutes)}
        </span>
        {settings.showDistance && leg.distanceKm !== null && (
          <span className="inline-flex items-center gap-1">
            <Compass className="h-3 w-3" aria-hidden="true" />
            Great-circle distance
          </span>
        )}
      </div>
    </div>
  );
}

export default function FlightResults({ result, mode, settings, tripName }) {
  if (!result) return null;

  if (!result.ok) {
    return (
      <div className="space-y-4">
        <ErrorPanel errors={result.errors} />
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-sky-500" aria-hidden="true" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Three quick fixes for most trips
            </h3>
          </div>
          <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              If you land on the next day, move the arrival date forward. The times can look correct while the date is still on the previous day.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              For connections, the next flight must depart after the previous flight lands — including the time needed to change terminals.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              For a custom airport, choose the correct IANA time zone so daylight saving and half-hour offsets are applied properly.
            </li>
          </ul>
        </div>
      </div>
    );
  }

  const { legs, connections, totals, warnings } = result;
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];
  const isArrival = mode === MODES.ARRIVAL;
  const isDeparture = mode === MODES.DEPARTURE;

  let heroValue = formatDuration(totals.headlineMinutes);
  let heroLabel = settings.includeBuffersInHeadline
    ? "Door-to-door journey"
    : "Gate-to-gate journey";
  let heroNote = `${formatDuration(totals.flightMinutes)} in the air${
    totals.layoverMinutes > 0
      ? ` · ${formatDuration(totals.layoverMinutes)} on the ground`
      : " · direct flight"
  }`;
  let HeroIcon = Timer;

  if (isArrival) {
    heroValue = formatClock(lastLeg.arrParts.hour, lastLeg.arrParts.minute, settings.timeFormat);
    heroLabel = "Arrives at destination";
    heroNote = `${formatDateLabel(lastLeg.arrParts)} · ${lastLeg.arrAirport.city}`;
    HeroIcon = PlaneLanding;
  } else if (isDeparture) {
    heroValue = formatClock(firstLeg.depParts.hour, firstLeg.depParts.minute, settings.timeFormat);
    heroLabel = "Departs from origin";
    heroNote = `${formatDateLabel(firstLeg.depParts)} · ${firstLeg.depAirport.city}`;
    HeroIcon = PlaneTakeoff;
  }

  const stopLabel =
    totals.stops === 0
      ? "Direct flight"
      : `${totals.stops} stop${totals.stops === 1 ? "" : "s"}`;

  return (
    <div className="space-y-4">
      <WarningPanel warnings={warnings} />

      <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-teal-50 p-5 shadow-sm dark:border-sky-900/60 dark:from-sky-950/40 dark:via-slate-900 dark:to-teal-950/30 sm:p-6">
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-700/20" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-700 shadow-sm dark:bg-slate-900/70 dark:text-sky-300">
              <HeroIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {heroLabel}
            </span>
            {tripName.trim() && (
              <span className="max-w-[55%] truncate text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {tripName.trim()}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div
                className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl"
                aria-live="polite"
                aria-atomic="true"
              >
                {heroValue}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {heroNote}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Route
              </span>
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                {firstLeg.depAirport.code}
                <span className="mx-1 text-sky-500">→</span>
                {lastLeg.arrAirport.code}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {firstLeg.depAirport.city} → {lastLeg.arrAirport.city}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-200">
              <Plane className="h-3 w-3 text-sky-500" aria-hidden="true" />
              {stopLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-200">
              <Globe2 className="h-3 w-3 text-sky-500" aria-hidden="true" />
              {formatTimezoneShift(totals.timezoneShiftMinutes)} time shift
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-200">
              <Clock3 className="h-3 w-3 text-sky-500" aria-hidden="true" />
              {formatDayShift(totals.dayShift)}
            </span>
            {settings.showDistance && totals.distanceKm !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-200">
                <MapPin className="h-3 w-3 text-sky-500" aria-hidden="true" />
                {formatDistance(totals.distanceKm, settings.units)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={Plane}
          label="Flight time"
          value={formatDuration(totals.flightMinutes)}
          hint={totals.stops === 0 ? "Non-stop" : `Across ${legs.length} flights`}
        />
        <Stat
          icon={Clock3}
          label="Layovers"
          value={totals.layoverMinutes > 0 ? formatDuration(totals.layoverMinutes) : "None"}
          hint={
            totals.layoverMinutes > 0
              ? `${connections.length} connection${connections.length === 1 ? "" : "s"}`
              : "Direct itinerary"
          }
        />
        <Stat
          icon={Globe2}
          label="Time-zone shift"
          value={formatTimezoneShift(totals.timezoneShiftMinutes)}
          hint={`${formatUtcOffset(firstLeg.depOffsetMinutes)} → ${formatUtcOffset(lastLeg.arrOffsetMinutes)}`}
        />
        <Stat
          icon={TrendingUp}
          label="Door-to-door"
          value={formatDuration(totals.doorToDoorMinutes)}
          hint={`${totals.preBufferMinutes} min before · ${totals.postBufferMinutes} min after`}
        />
        {settings.showDistance && totals.distanceKm !== null && (
          <Stat
            icon={MapPin}
            label="Distance"
            value={formatDistance(totals.distanceKm, settings.units)}
            hint="Great-circle estimate"
          />
        )}
        {settings.showDistance && totals.averageSpeedKmh !== null && (
          <Stat
            icon={Gauge}
            label="Average speed"
            value={formatSpeed(totals.averageSpeedKmh, settings.units)}
            hint="Based on airborne time"
          />
        )}
      </div>

      {settings.showTimeline && (
        <Timeline
          legs={legs}
          connections={connections}
          totals={totals}
          timeFormat={settings.timeFormat}
        />
      )}

      <div className="space-y-3">
        {legs.map((leg, index) => (
          <React.Fragment key={leg.id}>
            {index > 0 && connections[index - 1] && (
              <ConnectionCard connection={connections[index - 1]} />
            )}
            <LegCard
              leg={leg}
              settings={settings}
              highlight={isArrival ? "arrival" : isDeparture ? "departure" : null}
            />
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300">
            <Info className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              Every time above is <strong className="font-bold text-slate-800 dark:text-slate-100">local to its airport</strong>. Daylight saving is applied automatically for the travel date.
            </p>
            <p>
              Flight time is wheels-up to wheels-down. Door-to-door adds your {totals.preBufferMinutes}-minute airport buffer before departure and {totals.postBufferMinutes}-minute buffer after arrival.
            </p>
            {settings.showDistance && totals.distanceKm !== null && (
              <p>
                Distance and average speed use great-circle estimates, so real routes may be slightly longer because of airways and air-traffic routing.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
