"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarClock, Orbit, PartyPopper, Ruler, Scale, Sparkles, Weight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UNITS,
  formatDateUTC,
  formatDayCount,
  formatDistanceKm,
  formatJump,
  formatNumber,
  formatWeight,
  ordinal,
} from "./planetData";

// ─────────────────────────────────────────────────────────────────────────────
// Visual planet orb — a pure-CSS sphere with an optional ring and cloud bands.
// ─────────────────────────────────────────────────────────────────────────────
export function PlanetOrb({ planet, size = 44, className }) {
  const { core, mid, edge, glow } = planet.accent;

  return (
    <span
      className={cn("relative inline-block shrink-0 rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, ${core} 0%, ${mid} 55%, ${edge} 100%)`,
        boxShadow: `0 0 ${Math.round(size / 2)}px ${glow}55, inset -${Math.round(size / 8)}px -${Math.round(size / 6)}px ${Math.round(size / 3)}px rgba(15,23,42,0.45)`,
      }}
      aria-hidden="true"
    >
      {planet.bands && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "repeating-linear-gradient(100deg, rgba(120,53,15,0.30) 0 3px, rgba(255,255,255,0.08) 3px 8px)",
          }}
        />
      )}
      {planet.ring && (
        <span
          className="absolute left-1/2 top-1/2 rounded-[50%] border-2"
          style={{
            width: size * 1.85,
            height: size * 0.6,
            borderColor: mid,
            transform: "translate(-50%, -50%) rotate(-18deg)",
            opacity: 0.85,
            boxShadow: `0 0 6px ${glow}66`,
          }}
        />
      )}
    </span>
  );
}

function Chip({ icon: Icon, children, tone = "default" }) {
  const tones = {
    default:
      "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300",
    success:
      "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    brand:
      "border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
        tones[tone]
      )}
    >
      {Icon ? <Icon className="size-3" /> : null}
      {children}
    </span>
  );
}

function ProgressToNext({ planet, decimals }) {
  const percent = Math.min(100, Math.max(0, planet.progress * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span>Progress to next birthday</span>
        <span>{formatNumber(percent, decimals === 0 ? 0 : 1)}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${planet.accent.mid}, ${planet.accent.edge})`,
          }}
        />
      </div>
    </div>
  );
}

export function PlanetCard({ planet, settings, index = 0 }) {
  const { decimals, units, milestoneYears, showFacts, showWeightModule } = settings;
  const localLabel = planet.id === "mars" ? "sols" : "local days";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70"
    >
      {/* Accent glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
        style={{ background: planet.accent.glow }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlanetOrb planet={planet} size={46} />
          <div>
            <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-white">
              {planet.name}
              <span className="text-sm text-slate-400 dark:text-slate-500">{planet.symbol}</span>
            </h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {planet.type} · {planet.moons} {planet.moons === 1 ? "moon" : "moons"}
            </p>
          </div>
        </div>
        <Chip tone={planet.id === "earth" ? "success" : "default"}>{planet.tagline}</Chip>
      </div>

      <div className="relative mt-4 flex items-end gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {formatNumber(planet.years, decimals)}
        </span>
        <span className="pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {planet.name} years
        </span>
      </div>
      <p className="relative mt-1 text-xs text-slate-500 dark:text-slate-400">
        {formatNumber(planet.localDays, 0)} {localLabel} lived · {formatDistanceKm(planet.distanceKm, units, 2)}{" "}
        travelled around the Sun
      </p>

      <div className="relative mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <ProgressToNext planet={planet} decimals={decimals} />

        <div className="flex flex-wrap items-center gap-1.5">
          <Chip icon={CalendarClock}>
            Next: {formatDateUTC(planet.nextDate)} ({formatDayCount(planet.nextInDays)})
          </Chip>
          <Chip icon={PartyPopper} tone={planet.milestoneReached ? "success" : "brand"}>
            {ordinal(milestoneYears)} birthday: {formatDateUTC(planet.milestoneDate)}
          </Chip>
        </div>

        {showWeightModule && (planet.weight !== null || planet.jump !== null) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {planet.weight !== null && (
              <Chip icon={Weight}>
                You&apos;d weigh {formatWeight(planet.weight, units, 1)}
              </Chip>
            )}
            {planet.jump !== null && (
              <Chip icon={Ruler}>Jump {formatJump(planet.jump, units, 2)}</Chip>
            )}
          </div>
        )}

        {showFacts && (
          <p className="flex gap-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
            <span>{planet.fact}</span>
          </p>
        )}
      </div>
    </motion.article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparison table
// ─────────────────────────────────────────────────────────────────────────────
export function ComparisonTable({ planets, settings, earthDays }) {
  const { decimals, units, milestoneYears, showWeightModule } = settings;
  const distanceUnit = units === UNITS.IMPERIAL ? "Miles" : "Kilometres";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Your age, next birthday and orbital statistics on every selected planet
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
              <th scope="col" className="px-4 py-3 font-semibold">Planet</th>
              <th scope="col" className="px-4 py-3 font-semibold">Your age</th>
              <th scope="col" className="px-4 py-3 font-semibold">Local days</th>
              <th scope="col" className="px-4 py-3 font-semibold">Earth days lived</th>
              <th scope="col" className="px-4 py-3 font-semibold">Next birthday</th>
              <th scope="col" className="px-4 py-3 font-semibold">{ordinal(milestoneYears)} birthday</th>
              <th scope="col" className="px-4 py-3 font-semibold">{distanceUnit} orbited</th>
              <th scope="col" className="px-4 py-3 font-semibold">Gravity</th>
              {showWeightModule && <th scope="col" className="px-4 py-3 font-semibold">Weight</th>}
              {showWeightModule && <th scope="col" className="px-4 py-3 font-semibold">Jump</th>}
            </tr>
          </thead>
          <tbody>
            {planets.map((planet) => (
              <tr
                key={planet.id}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70 dark:border-slate-800/70 dark:hover:bg-slate-800/30"
              >
                <th scope="row" className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <PlanetOrb planet={planet} size={26} />
                    <div>
                      <span className="block font-semibold text-slate-900 dark:text-white">{planet.name}</span>
                      <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">
                        {planet.type}
                      </span>
                    </div>
                  </div>
                </th>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {formatNumber(planet.years, decimals)} yrs
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {formatNumber(planet.localDays, 0)}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {formatNumber(earthDays, 0)}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {formatDateUTC(planet.nextDate)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "font-medium",
                      planet.milestoneReached
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-600 dark:text-slate-300"
                    )}
                  >
                    {formatDateUTC(planet.milestoneDate)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Orbit className="size-3.5 text-slate-400" />
                    {formatDistanceKm(planet.distanceKm, units, 2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {formatNumber(planet.gravityG, 3)} g
                </td>
                {showWeightModule && (
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {planet.weight !== null ? formatWeight(planet.weight, units, 1) : "—"}
                  </td>
                )}
                {showWeightModule && (
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {planet.jump !== null ? formatJump(planet.jump, units, 2) : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone planner
// ─────────────────────────────────────────────────────────────────────────────
export function MilestoneGrid({ planets, settings }) {
  const { milestoneYears, decimals } = settings;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {planets.map((planet) => {
        const percent = Math.min(100, (planet.years / milestoneYears) * 100);
        const reached = planet.milestoneReached;

        return (
          <div
            key={planet.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <PlanetOrb planet={planet} size={30} />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {ordinal(milestoneYears)} {planet.name} birthday
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateUTC(planet.milestoneDate)}
                  </p>
                </div>
              </div>
              <Chip tone={reached ? "success" : "brand"}>
                {reached ? "Reached" : `In ${formatNumber(milestoneYears - planet.years, Math.max(1, decimals))} yrs`}
              </Chip>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percent}%`,
                  background: reached
                    ? "linear-gradient(90deg,#34d399,#10b981)"
                    : `linear-gradient(90deg, ${planet.accent.mid}, ${planet.accent.edge})`,
                }}
              />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <Scale className="size-3" />
              {reached
                ? "Already in the history books — scroll to the table for the exact date."
                : `${formatNumber(percent, 1)}% of the way there on ${planet.name}.`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
