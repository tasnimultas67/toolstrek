"use client";

import React, { useState } from "react";
import {
  format,
  addDays,
  subDays,
  addBusinessDays,
  differenceInCalendarDays,
  differenceInBusinessDays,
  isValid
} from "date-fns";
import {
  History,
  Calendar as CalendarIcon,
  ArrowRightCircle,
  Plus,
  Minus,
  Briefcase,
  CalendarDays,
  Clock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ToolPageShell from "./ToolPageShell";
import CustomDatePicker from "./CustomDatePicker";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Helper to determine meteorological season
const getSeason = (date) => {
  if (!date || !isValid(date)) return "";
  const month = date.getMonth() + 1;
  if (month === 12 || month === 1 || month === 2) return "Winter ❄️";
  if (month >= 3 && month <= 5) return "Spring 🌸";
  if (month >= 6 && month <= 8) return "Summer ☀️";
  return "Autumn / Fall 🍂";
};

// Helper to get day of the year
const getDayOfYear = (date) => {
  if (!date || !isValid(date)) return 0;
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Helper for leap year
const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// ISO-8601 week number calculation
const getWeekNumber = (date) => {
  if (!date || !isValid(date)) return 0;
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

export default function DaysTracker() {
  const [activeTab, setActiveTab] = useState("calculator");
  
  // Tab 1 States (Add/Subtract Days)
  const [startDate, setStartDate] = useState(new Date());
  const [operation, setOperation] = useState("add");
  const [daysCount, setDaysCount] = useState("");
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [calcResult, setCalcResult] = useState(null);

  // Tab 2 States (Duration between dates)
  const [durationStart, setDurationStart] = useState(new Date());
  const [durationEnd, setDurationEnd] = useState(null);
  const [durationResult, setDurationResult] = useState(null);

  const handleCalculateDate = (e) => {
    if (e) e.preventDefault();
    if (!startDate || !daysCount) return;

    const start = new Date(startDate);
    const count = parseInt(daysCount, 10);
    if (isNaN(count)) return;

    let target;
    const finalDays = operation === "add" ? count : -count;

    if (excludeWeekends) {
      target = addBusinessDays(start, finalDays);
    } else {
      target = operation === "add" ? addDays(start, count) : subDays(start, count);
    }

    const weekNumber = getWeekNumber(target);
    const season = getSeason(target);
    const dayOfYear = getDayOfYear(target);
    const leap = isLeapYear(target.getFullYear());

    setCalcResult({
      targetDate: target,
      formattedTarget: format(target, "PPPP"),
      dayOfWeek: format(target, "EEEE"),
      weekNumber,
      season,
      dayOfYear,
      isLeap: leap,
      daysLived: count,
      excludeWeekends,
      operation
    });
  };

  const handleCalculateDuration = (e) => {
    if (e) e.preventDefault();
    if (!durationStart || !durationEnd) return;

    const start = new Date(durationStart);
    const end = new Date(durationEnd);

    let isReversed = false;
    let sDate = start;
    let eDate = end;
    if (start > end) {
      sDate = end;
      eDate = start;
      isReversed = true;
    }

    const totalDays = differenceInCalendarDays(eDate, sDate);
    const workingDays = differenceInBusinessDays(eDate, sDate);
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    setDurationResult({
      totalDays,
      workingDays,
      weeks,
      remainingDays,
      isReversed,
      formattedStart: format(start, "PP"),
      formattedEnd: format(end, "PP")
    });
  };

  const presets = [7, 14, 30, 60, 90, 180, 365];

  return (
    <ToolPageShell widthClassName="max-w-5xl pt-24 pb-12">
      {/* Hero Header Area */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl flex items-center justify-center gap-3">
          <History className="w-9 h-9 text-blue-600" />
          Days <span className="text-blue-600">Dashboard</span>
        </h1>
        <p className="mt-2.5 text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Offset calculation & date duration analyzer
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-gray-100/60 dark:bg-gray-800/30 p-1.5 rounded-2xl w-full max-w-sm mx-auto mb-10 border border-gray-100/10 shadow-inner backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setActiveTab("calculator")}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeTab === "calculator"
              ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          )}
        >
          <CalendarDays className="w-4 h-4" />
          Add/Subtract Days
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("duration")}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeTab === "duration"
              ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          )}
        >
          <Clock className="w-4 h-4" />
          Days Between
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "calculator" ? (
          /* Tab 1 Layout: Add/Subtract Days */
          <motion.div
            key="calculator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10 font-sans"
          >
            {/* Unified Input Panel */}
            <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-gray-800/50 p-6 md:p-8">
              <form onSubmit={handleCalculateDate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  {/* Start Date */}
                  <div className="md:col-span-4">
                    <CustomDatePicker
                      selected={startDate}
                      onSelect={setStartDate}
                      label="Start Date"
                      placeholder="Choose start date"
                      presetsType="any"
                    />
                  </div>

                  {/* Operation & Amount */}
                  <div className="md:col-span-5 flex flex-col gap-2">
                    <span className="text-sm font-black uppercase text-gray-400 tracking-widest">
                      Offset duration
                    </span>
                    <div className="flex gap-2">
                      {/* Operation mini toggle */}
                      <div className="flex bg-gray-50 dark:bg-gray-800/30 p-1 rounded-2xl border border-gray-100/10 shrink-0">
                        <button
                          type="button"
                          onClick={() => setOperation(operation === "add" ? "subtract" : "add")}
                          className={cn(
                            "w-12 h-12 text-sm font-black rounded-xl transition-all flex items-center justify-center cursor-pointer",
                            operation === "add"
                              ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                              : "bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 shadow-sm"
                          )}
                        >
                          {operation === "add" ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Number Input */}
                      <input
                        type="number"
                        min="1"
                        value={daysCount}
                        onChange={(e) => setDaysCount(e.target.value)}
                        placeholder="e.g. 30 days"
                        className="w-full h-14 px-4 rounded-2xl border text-base font-bold transition-all outline-none bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/80 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500/80 dark:focus:border-blue-600/80 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10"
                      />
                    </div>
                  </div>

                  {/* Exclude Weekends Switch & Button */}
                  <div className="md:col-span-3 space-y-2">
                    <div className="flex items-center justify-between px-3 h-14 bg-gray-50 dark:bg-gray-800/30 border border-gray-100/30 dark:border-gray-800/50 rounded-2xl">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                          Workdays
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 scale-90">
                        <input
                          type="checkbox"
                          checked={excludeWeekends}
                          onChange={(e) => setExcludeWeekends(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Presets and Action bottom row */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-50 dark:border-gray-850">
                  {/* Preset days */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center mr-2">Presets:</span>
                    {presets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDaysCount(String(preset))}
                        className={cn(
                          "px-3.5 py-2 text-xs font-black rounded-xl border border-transparent transition-all cursor-pointer",
                          "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                          daysCount === String(preset) && "bg-blue-600 text-white dark:bg-blue-600"
                        )}
                      >
                        {preset} Days
                      </button>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={!startDate || !daysCount}
                    className="w-full sm:w-auto h-14 px-8 text-base font-black uppercase tracking-wider text-white rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    Find Target Date
                  </Button>
                </div>
              </form>
            </Card>

            {/* Results Block */}
            {calcResult ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                {/* Left Card: Target Date (span 8) */}
                <div className="lg:col-span-8 space-y-6">
                  <Card className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 shadow-xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-3 dark:opacity-[0.02] text-gray-800 dark:text-white pointer-events-none">
                      <ArrowRightCircle size={160} />
                    </div>

                    <h3 className="text-xs font-black uppercase text-gray-400 dark:text-gray-505 tracking-wider mb-6">
                      Calculated Offset
                    </h3>

                    <div className="p-8 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-900/20 rounded-3xl text-center mb-6">
                      <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1.5 block">
                        Target Date
                      </span>
                      <p className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-normal">
                        {calcResult.formattedTarget}
                      </p>
                    </div>

                    {/* Metadata indicators */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl text-center">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-1">
                          Day of Week
                        </span>
                        <span className="text-sm font-extrabold text-gray-700 dark:text-gray-200">
                          {calcResult.dayOfWeek}
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl text-center">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-1">
                          Week of Year
                        </span>
                        <span className="text-sm font-extrabold text-gray-700 dark:text-gray-200">
                          Week {calcResult.weekNumber}
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl text-center">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-1">
                          Day of Year
                        </span>
                        <span className="text-sm font-extrabold text-gray-700 dark:text-gray-200">
                          {calcResult.dayOfYear}th Day
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl text-center">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-1">
                          Leap Year Status
                        </span>
                        <span className="text-sm font-extrabold text-gray-700 dark:text-gray-200">
                          {calcResult.isLeap ? "Leap Year" : "Normal Year"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Card: Details Sidebar (span 4) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Climate Season Card */}
                  <Card className="bg-linear-to-br from-blue-600 to-indigo-750 text-white rounded-3xl p-6 shadow-xl border-none flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                      <Sparkles size={110} />
                    </div>
                    <div className="flex items-center gap-4 z-10">
                      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <Sparkles className="w-5.5 h-5.5 text-amber-300" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-blue-200 leading-none mb-1">
                          Climatic Season
                        </p>
                        <p className="text-sm font-bold">
                          {calcResult.season}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-blue-100/80 font-bold z-10 pt-4 border-t border-white/10 mt-4 leading-relaxed">
                      Determined based on meteorological definitions of seasons.
                    </p>
                  </Card>

                  {/* Offset Logs */}
                  <Card className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 shadow-xl p-6">
                    <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-555 tracking-wider mb-4">
                      Calculation Parameters
                    </h4>
                    <div className="space-y-3.5 text-xs font-bold">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                        <span className="text-gray-400">Start Point</span>
                        <span className="text-gray-700 dark:text-gray-250">
                          {format(startDate, "PP")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                        <span className="text-gray-400">Offset Added</span>
                        <span className={cn(
                          "font-black text-sm",
                          calcResult.operation === "add" ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {calcResult.operation === "add" ? "+" : "-"}{calcResult.daysLived} {calcResult.excludeWeekends ? "Workdays" : "Calendar Days"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ) : (
              <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/10 dark:bg-gray-900/10">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
                  <Sparkles className="text-gray-300 dark:text-gray-600 w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-500 dark:text-gray-400">
                  Target Date Ready
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                  Set a base date, operation, and number of days to jump into future or past dates.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          /* Tab 2 Layout: Days Between Dates */
          <motion.div
            key="duration"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10 font-sans"
          >
            {/* Dual date inputs card */}
            <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-gray-800/50 p-6 md:p-8">
              <form onSubmit={handleCalculateDuration} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-5">
                  <CustomDatePicker
                    selected={durationStart}
                    onSelect={setDurationStart}
                    label="Start Date"
                    placeholder="Choose first date"
                    presetsType="any"
                  />
                </div>
                <div className="md:col-span-4">
                  <CustomDatePicker
                    selected={durationEnd}
                    onSelect={setDurationEnd}
                    label="End Date"
                    placeholder="Choose second date"
                    presetsType="any"
                  />
                </div>
                <div className="md:col-span-3">
                  <Button
                    type="submit"
                    disabled={!durationStart || !durationEnd}
                    className="w-full h-15 text-base font-black uppercase tracking-wider text-white rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 cursor-pointer"
                  >
                    Calculate Span
                  </Button>
                </div>
              </form>
            </Card>

            {/* Results widgets */}
            {durationResult ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto"
              >
                <Card className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 shadow-xl p-8 relative overflow-hidden">
                  <h3 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-6">
                    Duration Breakdown
                  </h3>

                  {durationResult.isReversed && (
                    <div className="mb-5 px-4 py-2.5 text-xs font-bold text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border border-amber-100/30 rounded-xl">
                      ⚠️ End date was before start date. Span is computed as absolute positive duration.
                    </div>
                  )}

                  {/* Giant stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    {/* Calendar days */}
                    <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-900/20 rounded-3xl text-center">
                      <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1 block">
                        Calendar Days Span
                      </span>
                      <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                        {durationResult.totalDays.toLocaleString()}
                      </p>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1 block">
                        Total Days
                      </span>
                    </div>

                    {/* Working days */}
                    <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/40 dark:border-emerald-900/20 rounded-3xl text-center">
                      <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-1 block">
                        Business Days Span
                      </span>
                      <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {durationResult.workingDays.toLocaleString()}
                      </p>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1 block">
                        Working Days (Mon-Fri)
                      </span>
                    </div>
                  </div>

                  {/* Weeks + Days list */}
                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-850">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                      Calendar Weeks Conversion
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl text-center">
                        <span className="text-2xl font-black text-gray-800 dark:text-white block">
                          {durationResult.weeks}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          Full Weeks
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl text-center">
                        <span className="text-2xl font-black text-gray-800 dark:text-white block">
                          {durationResult.remainingDays}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          Remaining Days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary footer */}
                  <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-850 mt-6 text-xs font-bold">
                    <div className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                      <span className="text-gray-400">From Date</span>
                      <span className="text-gray-700 dark:text-gray-250">
                        {durationResult.formattedStart}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                      <span className="text-gray-400">To Date</span>
                      <span className="text-gray-700 dark:text-gray-250">
                        {durationResult.formattedEnd}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/10 dark:bg-gray-900/10">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
                  <Clock className="text-gray-300 dark:text-gray-600 w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-500 dark:text-gray-400">
                  Compare Date Span
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                  Provide a start date and an end date to calculate the calendar and business days span between them.
                  </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageShell>
  );
}
