"use client";

import React, { useState, useMemo, useEffect } from "react";
import ToolPageShell from "../../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  Moon,
  MoonStar,
  Sunrise,
  Sun,
  AlarmClock,
  Brain,
  Coffee,
  Wine,
  Smartphone,
  Activity,
  Dumbbell,
  Utensils,
  CalendarClock,
  Sparkles,
  Copy,
  Download,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
  HeartPulse,
  Info,
  CheckCircle2,
  BatteryCharging,
  Thermometer,
  Waves,
  Lightbulb,
} from "lucide-react";
import {
  MODES,
  SLEEP_CYCLE_MINUTES,
  AGE_GROUPS,
  FALL_ASLEEP_OPTIONS,
  CHRONOTYPES,
  LIFESTYLE_FACTORS,
  SLEEP_STAGES,
  NAP_GUIDE,
  SLEEP_HYGIENE_TIPS,
  SLEEP_FAQS,
  getAgeGroup,
  getCyclesForAgeGroup,
  calculateSleepQuality,
  getQualityRating,
  parseTimeToMinutes,
  minutesToTime,
  formatTime12,
  formatDuration,
  getNowTimeString,
  wrapMinutes,
} from "./sleepCalculatorData";

// Map string icon names stored in the data file to lucide components
const ICONS = {
  Moon,
  MoonStar,
  Sunrise,
  AlarmClock,
  Brain,
  Coffee,
  Wine,
  Smartphone,
  Activity,
  Dumbbell,
  Utensils,
  CalendarClock,
  BatteryCharging,
  Thermometer,
  Lightbulb,
  HeartPulse,
  Waves,
};

const renderIcon = (name, className) => {
  const Icon = ICONS[name] || Sparkles;
  return <Icon className={className} />;
};

export default function SleepCalculator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Sleep Calculator",
      link: "/tools/sleep-calculator",
      icon: "Moon",
    });
  }, [addRecentTool]);

  // ─── CORE FORM STATE ──────────────────────────────────────────────────────
  const [mode, setMode] = useState(MODES.WAKE); // "wake" | "bed"
  const [wakeTime, setWakeTime] = useState("07:00");
  const [bedTime, setBedTime] = useState("23:00");
  const [ageGroupId, setAgeGroupId] = useState("adult");
  const [fallAsleepMinutes, setFallAsleepMinutes] = useState(15);
  const [chronotypeId, setChronotypeId] = useState("bear");

  // ─── ADVANCED / LIFESTYLE STATE ───────────────────────────────────────────
  const [factors, setFactors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ─── UI STATE ─────────────────────────────────────────────────────────────
  const [openFaq, setOpenFaq] = useState(0);
  const [nowString, setNowString] = useState("");

  // Lightweight live clock so "Use current time" is always accurate
  useEffect(() => {
    const tick = () => setNowString(getNowTimeString());
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── DERIVED REFERENCE DATA ───────────────────────────────────────────────
  const ageGroup = useMemo(() => getAgeGroup(ageGroupId), [ageGroupId]);
  const chronotype = useMemo(
    () => CHRONOTYPES.find((c) => c.id === chronotypeId) || CHRONOTYPES[1],
    [chronotypeId],
  );

  const activeFactors = useMemo(
    () => LIFESTYLE_FACTORS.filter((f) => factors[f.id]),
    [factors],
  );

  // Time to fall asleep = personal baseline + the habits selected
  const effectiveLatency = useMemo(() => {
    const delta = activeFactors.reduce((sum, f) => sum + f.latencyDelta, 0);
    return Math.max(0, Math.min(120, fallAsleepMinutes + delta));
  }, [activeFactors, fallAsleepMinutes]);

  const anchorTime = mode === MODES.WAKE ? wakeTime : bedTime;

  // ─── SCHEDULE CALCULATION ─────────────────────────────────────────────────
  const recommendations = useMemo(() => {
    const anchor = parseTimeToMinutes(anchorTime);
    const cyclesList = getCyclesForAgeGroup(ageGroup);

    return cyclesList.map((cycles) => {
      const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES;
      const offset = sleepMinutes + effectiveLatency;
      const target =
        mode === MODES.WAKE
          ? wrapMinutes(anchor - offset)
          : wrapMinutes(anchor + offset);

      const asleepAt =
        mode === MODES.WAKE
          ? wrapMinutes(target + effectiveLatency)
          : wrapMinutes(anchor + effectiveLatency);

      const hours = sleepMinutes / 60;

      return {
        cycles,
        sleepMinutes,
        hours,
        sleepLabel: formatDuration(sleepMinutes),
        time: minutesToTime(target),
        time12: formatTime12(target),
        asleepTime12: formatTime12(asleepAt),
        withinRange: hours >= ageGroup.minHours && hours <= ageGroup.maxHours,
      };
    });
  }, [anchorTime, mode, ageGroup, effectiveLatency]);

  const primary = useMemo(() => {
    const ideal =
      recommendations.find(
        (r) => r.cycles === ageGroup.idealCycles && r.withinRange,
      ) || recommendations.find((r) => r.withinRange);
    return ideal || recommendations[0];
  }, [recommendations, ageGroup]);

  // ─── SLEEP QUALITY ESTIMATE ───────────────────────────────────────────────
  const qualityScore = useMemo(() => {
    if (!primary) return 0;
    return calculateSleepQuality({
      hours: primary.hours,
      ageGroup,
      latencyMinutes: effectiveLatency,
      activeFactors,
    });
  }, [primary, ageGroup, effectiveLatency, activeFactors]);

  const qualityRating = useMemo(() => getQualityRating(qualityScore), [qualityScore]);

  // ─── INTERACTIONS ─────────────────────────────────────────────────────────
  const handleFactorToggle = (id) => {
    setFactors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const useCurrentTime = () => {
    const value = getNowTimeString();
    setNowString(value);
    if (mode === MODES.WAKE) setWakeTime(value);
    else setBedTime(value);
    toast.success("Time set to right now.");
  };

  const handleResetAll = () => {
    setMode(MODES.WAKE);
    setWakeTime("07:00");
    setBedTime("23:00");
    setAgeGroupId("adult");
    setFallAsleepMinutes(15);
    setChronotypeId("bear");
    setFactors({});
    setShowAdvanced(false);
    toast.success("Sleep Calculator reset to defaults!");
  };

  // ─── EXPORT: COPY SUMMARY ─────────────────────────────────────────────────
  const handleCopySummary = () => {
    if (!primary) {
      toast.error("Please choose a valid time first.");
      return;
    }

    const heading =
      mode === MODES.WAKE
        ? `To wake up at ${formatTime12(parseTimeToMinutes(wakeTime))}`
        : `To go to bed at ${formatTime12(parseTimeToMinutes(bedTime))}`;

    const text = `
🌙 Sleep Plan (ToolsTrek)
----------------------------------------
Age Group: ${ageGroup.label} (${ageGroup.range})
Recommended Sleep: ${ageGroup.recommended}
Chronotype: ${chronotype.label} (${chronotype.subtitle})
Time to fall asleep: ${effectiveLatency} min
${heading}
----------------------------------------
🎯 Best Option — ${primary.cycles} Cycles (${primary.sleepLabel})
• Get in bed: ${
      mode === MODES.WAKE
        ? primary.time12
        : formatTime12(parseTimeToMinutes(bedTime))
    }
• Fall asleep: ${primary.asleepTime12}
• Wake up: ${
      mode === MODES.WAKE
        ? formatTime12(parseTimeToMinutes(wakeTime))
        : primary.time12
    }
Sleep quality estimate: ${qualityScore}/100 (${qualityRating.label})

📋 All Options:
${recommendations
  .map(
    (r) =>
      `• ${r.cycles} cycles (${r.sleepLabel}) → ${
        mode === MODES.WAKE ? `bed at ${r.time12}` : `wake at ${r.time12}`
      }${r.withinRange ? "  ✅ within target" : ""}`,
  )
  .join("\n")}

Generated with ToolsTrek Sleep Calculator
https://toolstrek.vercel.app/tools/sleep-calculator
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success("Sleep plan copied to clipboard!");
  };

  // ─── EXPORT: PDF REPORT ───────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!primary) {
      toast.error("Please choose a valid time first.");
      return;
    }

    try {
      const doc = new jsPDF();

      // Header banner
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Personalized Sleep Plan", 14, 22);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by ToolsTrek Sleep Calculator", 14, 29);

      // Profile
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Your Profile", 14, 48);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Age Group: ${ageGroup.label} (${ageGroup.range})`, 14, 56);
      doc.text(`Recommended Sleep: ${ageGroup.recommended}`, 14, 62);
      doc.text(`Chronotype: ${chronotype.label} (${chronotype.subtitle})`, 14, 68);
      doc.text(`Time to fall asleep: ${effectiveLatency} minutes`, 110, 56);
      doc.text(`Target wake / bed: ${mode === MODES.WAKE ? formatTime12(parseTimeToMinutes(wakeTime)) : formatTime12(parseTimeToMinutes(bedTime))}`, 110, 62);

      // Key recommendation box
      doc.setFillColor(238, 242, 255);
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(14, 78, 182, 40, 3, 3, "FD");

      doc.setTextColor(67, 56, 202);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        mode === MODES.WAKE ? "Recommended Bedtime" : "Recommended Wake-up Time",
        20,
        88,
      );

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(20);
      doc.text(primary.time12, 20, 100);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Sleep at ${primary.asleepTime12}  •  ${primary.cycles} cycles  •  ${primary.sleepLabel} of sleep`,
        20,
        111,
      );
      doc.text(
        `Estimated sleep quality: ${qualityScore}/100 (${qualityRating.label})`,
        20,
        117,
      );

      // All options
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. Cycle Options", 14, 132);

      let yPos = 142;
      recommendations.forEach((item) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(79, 70, 229);
        doc.text(`${item.cycles} cycles`, 14, yPos);

        doc.setTextColor(30, 41, 59);
        doc.text(
          mode === MODES.WAKE ? `Bed at ${item.time12}` : `Wake at ${item.time12}`,
          55,
          yPos,
        );

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(
          `${item.sleepLabel}${item.withinRange ? "  •  within recommended range" : ""}`,
          110,
          yPos,
        );

        yPos += 9;
      });

      // Tips
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPos + 4, 182, 44, 3, 3, "F");

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("3. Tonight's Priorities", 20, yPos + 14);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`• ${SLEEP_HYGIENE_TIPS[0].title}: ${SLEEP_HYGIENE_TIPS[0].detail}`, 20, yPos + 22);
      doc.text(`• ${SLEEP_HYGIENE_TIPS[1].title}: ${SLEEP_HYGIENE_TIPS[1].detail}`, 20, yPos + 30);
      doc.text(`• ${SLEEP_HYGIENE_TIPS[2].title}: ${SLEEP_HYGIENE_TIPS[2].detail}`, 20, yPos + 38);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "ToolsTrek Sleep Calculator — https://toolstrek.vercel.app/tools/sleep-calculator",
        14,
        286,
      );

      doc.save(`Sleep_Plan_${primary.cycles}_cycles.pdf`);
      toast.success("Sleep report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const activeFactorCount = activeFactors.length;

  return (
    <ToolPageShell>
      <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
        {/* HEADER BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white p-6 sm:p-10 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-52 h-52 bg-fuchsia-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide text-white uppercase">
              <MoonStar className="w-4 h-4 text-violet-100 animate-pulse" />
              Smart Sleep Tool
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Sleep Calculator
            </h1>
            <p className="text-indigo-100 max-w-2xl text-sm sm:text-base leading-relaxed">
              Find the perfect bedtime or wake-up time based on 90-minute sleep
              cycles, your age, how long you take to fall asleep and the habits
              that shape your night.
            </p>
          </div>
        </div>

        {/* MAIN TWO-COLUMN DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: CONTROLS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Sleep Parameters
                  </h2>
                </div>

                {/* Mode switcher */}
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMode(MODES.WAKE)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      mode === MODES.WAKE
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Wake up at
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(MODES.BED)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      mode === MODES.BED
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Go to bed at
                  </button>
                </div>
              </div>

              {/* TIME INPUT */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>
                    {mode === MODES.WAKE
                      ? "I want to wake up at"
                      : "I am going to bed at"}
                  </span>
                  <button
                    type="button"
                    onClick={useCurrentTime}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline normal-case tracking-normal"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Use current time
                  </button>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="time"
                    value={anchorTime}
                    onChange={(e) =>
                      mode === MODES.WAKE
                        ? setWakeTime(e.target.value)
                        : setBedTime(e.target.value)
                    }
                    className="w-full sm:flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-semibold text-2xl tracking-wide focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                  <div className="flex sm:flex-col gap-2 sm:w-44">
                    <div className="flex-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl px-4 py-2 text-center">
                      <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-300 uppercase tracking-wider">
                        12-hour
                      </div>
                      <div className="text-sm font-extrabold text-indigo-700 dark:text-indigo-200">
                        {formatTime12(parseTimeToMinutes(anchorTime))}
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-2 text-center">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Right now
                      </div>
                      <div className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                        {nowString ? formatTime12(parseTimeToMinutes(nowString)) : "--:--"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AGE GROUP */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Age Group &amp; Sleep Need</span>
                  <span className="text-indigo-500 font-semibold normal-case tracking-normal">
                    {ageGroup.recommended}
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AGE_GROUPS.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setAgeGroupId(group.id)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        ageGroupId === group.id
                          ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="text-xs font-bold">{group.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          ageGroupId === group.id
                            ? "text-indigo-100"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {group.range}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-400" />
                  {ageGroup.note}
                </p>
              </div>

              {/* TIME TO FALL ASLEEP */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>How long to fall asleep?</span>
                  <span className="text-indigo-500 font-semibold normal-case tracking-normal">
                    {effectiveLatency} min
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {FALL_ASLEEP_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFallAsleepMinutes(option.id)}
                      title={option.detail}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        fallAsleepMinutes === option.id
                          ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {effectiveLatency !== fallAsleepMinutes && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Adjusted to {effectiveLatency} min by your selected lifestyle
                    habits.
                  </p>
                )}
              </div>

              {/* CHRONOTYPE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Chronotype</span>
                  <Sun className="w-4 h-4 text-amber-500" />
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CHRONOTYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setChronotypeId(type.id)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        chronotypeId === type.id
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{type.label}</div>
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {type.subtitle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ADVANCED OPTIONS ACCORDION */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-800 dark:text-slate-100 font-semibold text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Lifestyle &amp; Habits</span>
                    {activeFactorCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white">
                        {activeFactorCount} active
                      </span>
                    )}
                  </div>
                  {showAdvanced ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Tell us what tonight looks like. Each habit fine-tunes your
                      sleep-onset time and the estimated quality of your night.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {LIFESTYLE_FACTORS.map((factor) => {
                        const checked = !!factors[factor.id];
                        return (
                          <label
                            key={factor.id}
                            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              checked
                                ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleFactorToggle(factor.id)}
                              className="mt-0.5 w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                                {renderIcon(
                                  factor.icon,
                                  "w-4 h-4 text-indigo-500 shrink-0",
                                )}
                                <span>{factor.label}</span>
                              </div>
                              <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 leading-snug">
                                {factor.detail}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Form
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <Copy className="w-4 h-4 text-indigo-500" />
                    Copy Summary
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* HERO RESULT CARD */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300">
                  {mode === MODES.WAKE ? (
                    <MoonStar className="w-3.5 h-3.5" />
                  ) : (
                    <Sunrise className="w-3.5 h-3.5" />
                  )}
                  {mode === MODES.WAKE ? "Recommended Bedtime" : "Recommended Wake-up"}
                </span>

                <div className="flex items-baseline justify-center gap-2 pt-2">
                  <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                    {primary ? primary.time12.split(" ")[0] : "--:--"}
                  </span>
                  <span className="text-2xl font-bold text-indigo-500">
                    {primary ? primary.time12.split(" ")[1] : ""}
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {primary ? primary.cycles : 0} cycles &bull;{" "}
                  {primary ? primary.sleepLabel : "0h"} of sleep
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  In bed by {primary ? primary.time12 : "--"} &bull; asleep around{" "}
                  {primary ? primary.asleepTime12 : "--"}
                </p>
              </div>

              {/* QUALITY SCORE */}
              <div className="relative space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Estimated Sleep Quality
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${qualityRating.badge}`}
                  >
                    {qualityRating.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${qualityRating.bar} transition-all duration-500`}
                      style={{ width: `${qualityScore}%` }}
                    />
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-white shrink-0">
                    {qualityScore}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {qualityRating.message}
                </p>
              </div>
            </div>

            {/* ALL CYCLE OPTIONS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <AlarmClock className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {mode === MODES.WAKE ? "Bedtime Options" : "Wake-up Options"}
                </h3>
              </div>

              <div className="space-y-2.5">
                {recommendations.map((item) => {
                  const isPrimary = primary && item.cycles === primary.cycles;
                  return (
                    <div
                      key={item.cycles}
                      className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                        isPrimary
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                            isPrimary
                              ? "bg-indigo-500 text-white"
                              : "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {item.cycles}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {item.time12}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.cycles} cycles &bull; {item.sleepLabel} asleep
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isPrimary && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Best
                          </span>
                        )}
                        {item.withinRange && !isPrimary && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            In range
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CHRONOTYPE COACH */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-3xl p-6 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {chronotype.label} Coach
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {chronotype.detail}
              </p>
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 leading-relaxed">
                {chronotype.advice}
              </p>
            </div>
          </div>
        </div>

        {/* SLEEP ARCHITECTURE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Your Night&apos;s Sleep Architecture
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Based on {primary ? primary.sleepLabel : "0h"} of sleep
            </span>
          </div>

          {/* Stacked stage bar */}
          <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            {SLEEP_STAGES.map((stage) => (
              <div
                key={stage.id}
                className={stage.color}
                style={{ width: `${stage.percent}%` }}
                title={`${stage.name} · ${stage.percent}%`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SLEEP_STAGES.map((stage) => (
              <div
                key={stage.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {stage.name}
                    </span>
                  </div>
                  <span className={`text-xs font-black ${stage.text}`}>
                    {stage.percent}%
                  </span>
                </div>
                {primary && (
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    ≈ {formatDuration((primary.sleepMinutes * stage.percent) / 100)}{" "}
                    tonight
                  </div>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AGE REFERENCE TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              How Much Sleep Do You Really Need?
            </h3>
          </div>

          <div className="overflow-x-auto -mx-1">
            <div className="min-w-[560px] px-1">
              <div className="grid grid-cols-12 gap-2 px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Age Group</div>
                <div className="col-span-3">Age Range</div>
                <div className="col-span-3">Recommended Sleep</div>
                <div className="col-span-2 text-right">Full Cycles</div>
              </div>
              <div className="space-y-1.5">
                {AGE_GROUPS.map((group) => {
                  const active = group.id === ageGroupId;
                  return (
                    <div
                      key={group.id}
                      className={`grid grid-cols-12 gap-2 items-center px-3 py-3 rounded-xl border text-xs transition-all ${
                        active
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
                          : "bg-slate-50 dark:bg-slate-800/40 border-transparent"
                      }`}
                    >
                      <div className="col-span-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {group.label}
                        {active && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500 text-white">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 text-slate-500 dark:text-slate-400">
                        {group.range}
                      </div>
                      <div className="col-span-3 font-semibold text-slate-700 dark:text-slate-200">
                        {group.recommended}
                      </div>
                      <div className="col-span-2 text-right font-black text-indigo-600 dark:text-indigo-400">
                        {Math.floor(group.minHours / 1.5)}–
                        {Math.ceil(group.maxHours / 1.5)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-400" />
            Full cycles are calculated at {SLEEP_CYCLE_MINUTES} minutes each.
            Babies and toddlers meet their total need across naps, not one long
            night.
          </p>
        </div>

        {/* NAP GUIDE + TIPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* NAP GUIDE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Smart Nap Guide
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Short, well-timed naps restore alertness without stealing from
              tonight&apos;s sleep. Keep naps before 3 PM.
            </p>
            <div className="space-y-3">
              {NAP_GUIDE.map((nap) => (
                <div
                  key={nap.id}
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-extrabold text-[11px] whitespace-nowrap">
                    {nap.duration}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {nap.name}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {nap.bestFor}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {nap.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLEEP HYGIENE TIPS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Sleep Hygiene Essentials
              </h3>
            </div>
            <div className="space-y-3">
              {SLEEP_HYGIENE_TIPS.map((tip) => (
                <div
                  key={tip.title}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <span className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {renderIcon(tip.icon, "w-4 h-4 text-indigo-500")}
                  </span>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {tip.title}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {tip.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Sleep Calculator FAQ
            </h3>
          </div>

          <div className="space-y-3">
            {SLEEP_FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all"
                  >
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {faq.question}
                    </span>
                    {open ? (
                      <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {open && (
                    <div className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
            This Sleep Calculator provides general wellness guidance based on
            average sleep-cycle research. It is not medical advice — if you
            regularly struggle to sleep, please consult a healthcare
            professional.
          </p>
        </div>
      </div>
    </ToolPageShell>
  );
}
