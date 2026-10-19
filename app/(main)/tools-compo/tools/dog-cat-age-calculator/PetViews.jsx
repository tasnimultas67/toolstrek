"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Dog & Cat Age Calculator — presentational views
// Stat grid · life-stage guide · milestone table · species comparison · facts
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import {
  CalendarClock,
  CalendarDays,
  Check,
  HeartPulse,
  Moon,
  PawPrint,
  Sparkles,
  Wind,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  formatCompact,
  formatDateUTC,
  formatNumber,
  lifeStageRanges,
  ordinal,
} from "./petData";

const STAT_ICONS = {
  days: CalendarDays,
  weeks: CalendarClock,
  sleep: Moon,
  heartbeats: HeartPulse,
  breaths: Wind,
  moons: Sparkles,
};

// ─────────────────────────────────────────────────────────────────────────────
// Statistics
// ─────────────────────────────────────────────────────────────────────────────
export function StatGrid({ stats, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = STAT_ICONS[stat.id] || Sparkles;
        return (
          <div
            key={stat.id}
            className={cn(
              "rounded-2xl border px-3 py-2.5",
              dark
                ? "border-white/10 bg-white/5 backdrop-blur-sm"
                : "border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60"
            )}
          >
            <p
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                dark ? "text-white/60" : "text-slate-400 dark:text-slate-500"
              )}
            >
              <Icon className="size-3" />
              {stat.label}
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-bold",
                dark ? "text-white" : "text-slate-800 dark:text-slate-100"
              )}
            >
              {formatCompact(stat.value, 0)}
              {stat.approximate ? (
                <span
                  className={cn(
                    "ml-1 text-[10px] font-semibold",
                    dark ? "text-white/50" : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  approx
                </span>
              ) : null}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Life-stage guide
// ─────────────────────────────────────────────────────────────────────────────
export function LifeStageGuide({ report }) {
  const ranges = lifeStageRanges(report.type, report.dogSize);
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {ranges.map((stage, index) => {
          const current = stage.id === report.stage.id;
          const passed = index < report.stage.index;
          const rangeLabel = stage.end
            ? `${formatNumber(stage.start, 0)}–${formatNumber(stage.end, 0)} yrs`
            : `${formatNumber(stage.start, 0)}+ yrs`;
          return (
            <div
              key={stage.id}
              className={cn(
                "rounded-2xl border p-3.5 transition-colors",
                current
                  ? "border-amber-300 bg-amber-50/80 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10"
                  : passed
                    ? "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-sm font-bold",
                    current
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-slate-700 dark:text-slate-200"
                  )}
                >
                  {stage.label}
                </p>
                {current ? (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Now
                  </span>
                ) : passed ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : null}
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {rangeLabel}
              </p>
              {current ? (
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-amber-200/70 dark:bg-amber-500/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-[width] duration-700"
                    style={{ width: `${Math.round(report.stage.progress * 100)}%` }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-rose-500/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Currently in the {report.stage.label.toLowerCase()} stage
          </p>
          {report.stage.nextLabel ? (
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {report.stage.nextLabel} in about {formatNumber(report.stage.nextInYears, 1)} years
            </p>
          ) : (
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              The final stage — enjoy every day
            </p>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {report.stage.description}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone birthdays
// ─────────────────────────────────────────────────────────────────────────────
export function MilestoneTable({ report, decimals }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              <th className="px-4 py-3">Pet birthday</th>
              <th className="px-4 py-3">Human age</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {report.milestones.map((milestone) => (
              <tr
                key={milestone.petYears}
                className={cn(
                  "border-b border-slate-100 last:border-0 dark:border-slate-800/60",
                  !milestone.reached && !milestone.beyond
                    ? "bg-amber-50/50 dark:bg-amber-500/5"
                    : "bg-white dark:bg-slate-900/40"
                )}
              >
                <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200">
                  {ordinal(milestone.petYears)} birthday
                </td>
                <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-100">
                  {formatNumber(milestone.humanYears, decimals)}
                  <span className="ml-1 text-[11px] font-medium text-slate-400">yrs</span>
                </td>
                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                  {formatDateUTC(milestone.date)}
                </td>
                <td className="px-4 py-2.5">
                  {milestone.reached ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <Check className="size-3" />
                      Reached
                    </span>
                  ) : milestone.beyond ? (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Beyond typical range
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                      In {formatNumber(milestone.daysUntil / 365.2425, 1)} yrs
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        Human ages use the {report.human.methodLabel}. Dates are calendar birthdays — pets born on
        February 29 celebrate on February 28 in non-leap years.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Same age, different species
// ─────────────────────────────────────────────────────────────────────────────
export function ComparisonTable({ report, decimals }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[580px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              <th className="px-4 py-3">If they were a…</th>
              <th className="px-4 py-3">Human age</th>
              <th className="px-4 py-3">Life stage</th>
              <th className="px-4 py-3">Typical lifespan</th>
            </tr>
          </thead>
          <tbody>
            {report.comparison.map((row) => (
              <tr
                key={row.key}
                className={cn(
                  "border-b border-slate-100 last:border-0 dark:border-slate-800/60",
                  row.current
                    ? "bg-amber-50/70 dark:bg-amber-500/10"
                    : "bg-white dark:bg-slate-900/40"
                )}
              >
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                    {row.label}
                    {row.current ? (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        This pet
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{row.detail}</span>
                </td>
                <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-100">
                  {formatNumber(row.humanYears, decimals)}
                  <span className="ml-1 text-[11px] font-medium text-slate-400">yrs</span>
                </td>
                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{row.stage.label}</td>
                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                  {formatNumber(row.lifespan.min, 1)}–{formatNumber(row.lifespan.max, 1)} yrs
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        Every row converts the same real age with the size-aware chart, so the species and sizes are
        compared fairly. Lifespans are typical ranges for healthy pets.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fun facts
// ─────────────────────────────────────────────────────────────────────────────
export function FactList({ facts }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {facts.map((fact, index) => (
        <div
          key={fact}
          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            {index === 0 ? <PawPrint className="size-4" /> : <Sparkles className="size-4" />}
          </span>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{fact}</p>
        </div>
      ))}
    </div>
  );
}
