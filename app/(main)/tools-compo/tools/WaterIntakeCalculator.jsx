"use client";

import React, { useState, useMemo, useEffect } from "react";
import ToolPageShell from "../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  Droplets,
  GlassWater,
  Activity,
  Sun,
  Flame,
  CloudSnow,
  HeartPulse,
  Coffee,
  Utensils,
  Wine,
  Sparkles,
  Copy,
  Download,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  Clock,
  Award,
  Zap,
} from "lucide-react";

// Container presets in ML
const CONTAINER_PRESETS = [
  { id: "glass", name: "Standard Glass", ml: 250, oz: 8.5, icon: GlassWater },
  { id: "bottle_small", name: "Small Bottle", ml: 500, oz: 16.9, icon: Droplets },
  { id: "bottle_large", name: "Large Flask", ml: 750, oz: 25.3, icon: Droplets },
  { id: "jug", name: "Water Jug", ml: 1000, oz: 33.8, icon: Droplets },
];

export default function WaterIntakeCalculator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Water Intake Calculator",
      link: "/tools/water-intake-calculator",
      icon: "Droplets",
    });
  }, [addRecentTool]);

  // ─── CORE FORM STATE ──────────────────────────────────────────────────────
  const [unitSystem, setUnitSystem] = useState("metric"); // "metric" | "imperial"
  const [weight, setWeight] = useState(70); // kg or lbs depending on unitSystem
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState("male"); // male, female, other
  const [activityLevel, setActivityLevel] = useState("moderate"); // sedentary, light, moderate, active, extreme

  // ─── ADVANCED OPTIONS STATE ──────────────────────────────────────────────
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [climate, setClimate] = useState("normal"); // normal, warm, hot_humid, cold_altitude
  const [healthStage, setHealthStage] = useState("none"); // none, pregnant, breastfeeding, sick
  const [caffeineIntake, setCaffeineIntake] = useState(false); // 2+ cups coffee/tea
  const [saltyDiet, setSaltyDiet] = useState(false); // high sodium
  const [highProtein, setHighProtein] = useState(false); // high protein
  const [alcoholIntake, setAlcoholIntake] = useState(false); // alcohol compensation
  const [selectedContainer, setSelectedContainer] = useState("glass");
  const [customContainerMl, setCustomContainerMl] = useState(250);

  // ─── INTERACTIVE INTAKE LOG TRACKER STATE ────────────────────────────────
  const [loggedIntakeMl, setLoggedIntakeMl] = useState(0);

  // ─── UNIT CONVERSION HELPERS ──────────────────────────────────────────────
  const weightInKg = useMemo(() => {
    const w = parseFloat(weight) || 0;
    return unitSystem === "metric" ? w : w * 0.453592;
  }, [weight, unitSystem]);

  // ─── WATER REQUIREMENT CALCULATION LOGIC ──────────────────────────────────
  const calculation = useMemo(() => {
    if (weightInKg <= 0) {
      return {
        baseMl: 0,
        activityMl: 0,
        climateMl: 0,
        healthMl: 0,
        dietMl: 0,
        totalMl: 0,
        totalLiters: 0,
        totalOz: 0,
        totalCups: 0,
        containerCount: 0,
        containerVolume: 250,
      };
    }

    // 1. Base intake rate per kg based on gender
    let baseRate = 33; // ml per kg baseline
    if (gender === "male") baseRate = 35;
    else if (gender === "female") baseRate = 31;

    // Age multiplier
    if (age < 18) baseRate += 2;
    else if (age > 65) baseRate -= 1;

    let baseMl = weightInKg * baseRate;

    // 2. Activity Level Adjustments
    let activityMl = 0;
    switch (activityLevel) {
      case "light":
        activityMl = 350;
        break;
      case "moderate":
        activityMl = 700;
        break;
      case "active":
        activityMl = 1050;
        break;
      case "extreme":
        activityMl = 1400;
        break;
      default:
        activityMl = 0;
    }

    // 3. Climate Adjustments
    let climateMl = 0;
    switch (climate) {
      case "warm":
        climateMl = 350;
        break;
      case "hot_humid":
        climateMl = 700;
        break;
      case "cold_altitude":
        climateMl = 350;
        break;
      default:
        climateMl = 0;
    }

    // 4. Health & Life Stage Adjustments
    let healthMl = 0;
    switch (healthStage) {
      case "pregnant":
        healthMl = 300;
        break;
      case "breastfeeding":
        healthMl = 800;
        break;
      case "sick":
        healthMl = 500;
        break;
      default:
        healthMl = 0;
    }

    // 5. Dietary Adjustments
    let dietMl = 0;
    if (caffeineIntake) dietMl += 250;
    if (saltyDiet) dietMl += 300;
    if (highProtein) dietMl += 300;
    if (alcoholIntake) dietMl += 350;

    const totalMl = Math.round(baseMl + activityMl + climateMl + healthMl + dietMl);
    const totalLiters = (totalMl / 1000).toFixed(2);
    const totalOz = Math.round(totalMl * 0.033814);
    const totalCups = (totalMl / 240).toFixed(1);

    // Container count calculation
    let containerVolume = 250;
    if (selectedContainer === "custom") {
      containerVolume = Math.max(50, customContainerMl || 250);
    } else {
      const preset = CONTAINER_PRESETS.find((p) => p.id === selectedContainer);
      if (preset) containerVolume = preset.ml;
    }

    const containerCount = (totalMl / containerVolume).toFixed(1);

    return {
      baseMl: Math.round(baseMl),
      activityMl,
      climateMl,
      healthMl,
      dietMl,
      totalMl,
      totalLiters,
      totalOz,
      totalCups,
      containerCount,
      containerVolume,
    };
  }, [
    weightInKg,
    age,
    gender,
    activityLevel,
    climate,
    healthStage,
    caffeineIntake,
    saltyDiet,
    highProtein,
    alcoholIntake,
    selectedContainer,
    customContainerMl,
  ]);

  // Active advanced options count badge
  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (climate !== "normal") count++;
    if (healthStage !== "none") count++;
    if (caffeineIntake) count++;
    if (saltyDiet) count++;
    if (highProtein) count++;
    if (alcoholIntake) count++;
    if (selectedContainer !== "glass") count++;
    return count;
  }, [
    climate,
    healthStage,
    caffeineIntake,
    saltyDiet,
    highProtein,
    alcoholIntake,
    selectedContainer,
  ]);

  // ─── DAILY HYDRATION SCHEDULE ────────────────────────────────────────────
  const dailySchedule = useMemo(() => {
    const total = calculation.totalMl;
    if (total <= 0) return [];

    return [
      {
        time: "07:30 AM",
        title: "Morning Rehydration",
        amountMl: Math.round(total * 0.18),
        desc: "Kickstart metabolism right after waking up.",
      },
      {
        time: "10:00 AM",
        title: "Mid-Morning Focus",
        amountMl: Math.round(total * 0.16),
        desc: "Sustain mental energy & brain performance.",
      },
      {
        time: "12:30 PM",
        title: "Pre-Lunch Hydration",
        amountMl: Math.round(total * 0.18),
        desc: "Aids digestion and prevents overeating.",
      },
      {
        time: "03:30 PM",
        title: "Afternoon Boost",
        amountMl: Math.round(total * 0.18),
        desc: "Beats the mid-afternoon fatigue dip.",
      },
      {
        time: "06:30 PM",
        title: "Evening Refresher",
        amountMl: Math.round(total * 0.15),
        desc: "Replenish lost fluids from daily tasks.",
      },
      {
        time: "09:00 PM",
        title: "Night Wind-Down",
        amountMl: Math.round(total * 0.15),
        desc: "Light sip to avoid waking up thirsty.",
      },
    ];
  }, [calculation.totalMl]);

  // ─── INTAKE LOGGING FUNCTIONS ─────────────────────────────────────────────
  const addIntake = (ml) => {
    setLoggedIntakeMl((prev) => Math.max(0, prev + ml));
    toast.success(`Logged +${ml} ml of water!`);
  };

  const resetLoggedIntake = () => {
    setLoggedIntakeMl(0);
    toast.info("Hydration log reset to 0 ml.");
  };

  const loggedPercent = useMemo(() => {
    if (calculation.totalMl <= 0) return 0;
    return Math.min(100, Math.round((loggedIntakeMl / calculation.totalMl) * 100));
  }, [loggedIntakeMl, calculation.totalMl]);

  // ─── RESET ALL INPUTS ────────────────────────────────────────────────────
  const handleResetAll = () => {
    setUnitSystem("metric");
    setWeight(70);
    setAge(28);
    setGender("male");
    setActivityLevel("moderate");
    setClimate("normal");
    setHealthStage("none");
    setCaffeineIntake(false);
    setSaltyDiet(false);
    setHighProtein(false);
    setAlcoholIntake(false);
    setSelectedContainer("glass");
    setCustomContainerMl(250);
    setLoggedIntakeMl(0);
    setShowAdvanced(false);
    toast.success("Calculator inputs reset to defaults!");
  };

  // ─── COPY SUMMARY TO CLIPBOARD ────────────────────────────────────────────
  const handleCopySummary = () => {
    if (calculation.totalMl <= 0) {
      toast.error("Please enter a valid weight first.");
      return;
    }

    const text = `
💦 Water Intake Plan (ToolsTrek)
----------------------------------------
Weight: ${weight} ${unitSystem === "metric" ? "kg" : "lbs"} | Age: ${age} | Gender: ${gender}
Activity Level: ${activityLevel}
----------------------------------------
🎯 Daily Water Goal:
• ${calculation.totalLiters} Liters (${calculation.totalMl} ml)
• ${calculation.totalOz} fl oz
• Approx. ${calculation.totalCups} US Cups
• ${calculation.containerCount} x (${calculation.containerVolume} ml container)

📅 Daily Hydration Schedule:
${dailySchedule.map((s) => `• ${s.time}: ${s.amountMl} ml - ${s.title}`).join("\n")}

Generated with ToolsTrek Water Intake Calculator
https://toolstrek.vercel.app/tools/water-intake-calculator
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success("Hydration summary copied to clipboard!");
  };

  // ─── GENERATE & DOWNLOAD PDF REPORT ──────────────────────────────────────
  const handleDownloadPDF = () => {
    if (calculation.totalMl <= 0) {
      toast.error("Please enter a valid weight first.");
      return;
    }

    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(14, 165, 233);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Personalized Water Intake Plan", 14, 22);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by ToolsTrek Hydration Calculator", 14, 29);

      // User Overview Section
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Profile & Parameters", 14, 48);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Body Weight: ${weight} ${unitSystem === "metric" ? "kg" : "lbs"}`, 14, 56);
      doc.text(`Age: ${age} years`, 14, 62);
      doc.text(`Gender: ${gender.toUpperCase()}`, 14, 68);
      doc.text(`Activity Level: ${activityLevel.toUpperCase()}`, 14, 74);
      doc.text(`Climate / Environment: ${climate.replace("_", " ").toUpperCase()}`, 110, 56);
      doc.text(`Health Status: ${healthStage.toUpperCase()}`, 110, 62);
      doc.text(`Dietary Add-ons: ${caffeineIntake ? "Caffeine, " : ""}${saltyDiet ? "Sodium, " : ""}${highProtein ? "Protein, " : ""}${alcoholIntake ? "Alcohol" : "None"}`, 110, 68);

      // Key Metrics Box
      doc.setFillColor(240, 249, 255);
      doc.setDrawColor(186, 230, 253);
      doc.roundedRect(14, 82, 182, 38, 3, 3, "FD");

      doc.setTextColor(2, 132, 199);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Daily Hydration Target", 20, 92);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(20);
      doc.text(`${calculation.totalLiters} Liters (${calculation.totalMl} ml)`, 20, 104);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`• Imperial: ${calculation.totalOz} fl oz | Standard Cups: ~${calculation.totalCups}`, 20, 114);

      // Hourly Schedule
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. Recommended Daily Schedule", 14, 132);

      let yPos = 142;
      dailySchedule.forEach((item) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(14, 165, 233);
        doc.text(item.time, 14, yPos);

        doc.setTextColor(30, 41, 59);
        doc.text(`${item.title} (${item.amountMl} ml)`, 45, yPos);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(item.desc, 45, yPos + 5);

        yPos += 14;
      });

      // Hydration Tips Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPos + 5, 182, 35, 3, 3, "F");

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Key Hydration Rules:", 20, yPos + 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("1. Drink water consistently throughout the day rather than all at once.", 20, yPos + 22);
      doc.text("2. Increase water intake before, during, and after workouts.", 20, yPos + 28);
      doc.text("3. Check your urine color: Pale straw yellow indicates optimal hydration.", 20, yPos + 34);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("ToolsTrek Water Intake Calculator — https://toolstrek.vercel.app", 14, 285);

      doc.save(`Water_Intake_Plan_${weight}kg.pdf`);
      toast.success("PDF report downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <ToolPageShell>
      <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
        {/* HEADER BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white p-6 sm:p-10 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide text-white uppercase">
              <Droplets className="w-4 h-4 text-cyan-200 animate-pulse" />
              Smart Health Tool
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Water Intake Calculator
            </h1>
            <p className="text-sky-100 max-w-2xl text-sm sm:text-base leading-relaxed">
              Calculate your exact daily water requirements tailored to your weight, activity level, climate, diet, and pregnancy/lifestyle factors.
            </p>
          </div>
        </div>

        {/* MAIN TWO-COLUMN DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: CONTROLS & FORM (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-sky-500" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Calculator Parameters
                  </h2>
                </div>

                {/* Unit Switcher */}
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUnitSystem("metric")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      unitSystem === "metric"
                        ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Metric (kg / ml)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitSystem("imperial")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      unitSystem === "imperial"
                        ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Imperial (lbs / oz)
                  </button>
                </div>
              </div>

              {/* CORE INPUT FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Weight Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Body Weight ({unitSystem === "metric" ? "kg" : "lbs"})</span>
                    <span className="text-sky-500 font-semibold">{weight} {unitSystem === "metric" ? "kg" : "lbs"}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-semibold text-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Age Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Age (Years)</span>
                    <span className="text-sky-500 font-semibold">{age} yrs</span>
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="110"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-semibold text-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Gender Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Gender & Biological Baseline
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "male", label: "Male (~35ml/kg)" },
                    { id: "female", label: "Female (~31ml/kg)" },
                    { id: "other", label: "General (~33ml/kg)" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id)}
                      className={`py-3 px-3 rounded-2xl text-xs font-semibold text-center border transition-all ${
                        gender === g.id
                          ? "bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-bold shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Level Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Physical Activity Level</span>
                  <Activity className="w-4 h-4 text-sky-500" />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "sedentary", label: "Sedentary", detail: "Desk work / Little exercise" },
                    { id: "light", label: "Light Activity", detail: "1-3 days exercise (+350ml)" },
                    { id: "moderate", label: "Moderate", detail: "3-5 days exercise (+700ml)" },
                    { id: "active", label: "Very Active", detail: "6-7 intense days (+1050ml)" },
                    { id: "extreme", label: "Athlete", detail: "Daily hard physical work (+1400ml)" },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActivityLevel(act.id)}
                      className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                        activityLevel === act.id
                          ? "bg-sky-50 dark:bg-sky-950/30 border-sky-500 text-sky-700 dark:text-sky-300 font-bold"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold">{act.label}</span>
                      <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-1">
                        {act.detail}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ADVANCED OPTIONS TOGGLE ACCORDION */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-800 dark:text-slate-100 font-semibold text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>Advanced Options</span>
                    {activeAdvancedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-white">
                        {activeAdvancedCount} active
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
                  <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
                    {/* Climate / Environment */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sun className="w-4 h-4 text-amber-500" />
                        Climate & Weather Environment
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "normal", label: "Normal / AC", icon: Sun },
                          { id: "warm", label: "Warm Heat (+350ml)", icon: Flame },
                          { id: "hot_humid", label: "Hot & Humid (+700ml)", icon: Flame },
                          { id: "cold_altitude", label: "Cold/Altitude (+350ml)", icon: CloudSnow },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setClimate(c.id)}
                            className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                              climate === c.id
                                ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Health & Life Stage */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        Health & Life Stage
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "none", label: "Standard" },
                          { id: "pregnant", label: "Pregnant (+300ml)" },
                          { id: "breastfeeding", label: "Lactating (+800ml)" },
                          { id: "sick", label: "Fever/Sick (+500ml)" },
                        ].map((h) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => setHealthStage(h.id)}
                            className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                              healthStage === h.id
                                ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            {h.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Factors */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Dietary & Lifestyle Additions
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={caffeineIntake}
                            onChange={(e) => setCaffeineIntake(e.target.checked)}
                            className="w-4 h-4 text-sky-500 rounded focus:ring-sky-500"
                          />
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Coffee className="w-4 h-4 text-amber-700" />
                            <span>2+ Cups Coffee/Tea Daily (+250ml)</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saltyDiet}
                            onChange={(e) => setSaltyDiet(e.target.checked)}
                            className="w-4 h-4 text-sky-500 rounded focus:ring-sky-500"
                          />
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Utensils className="w-4 h-4 text-emerald-600" />
                            <span>High Sodium / Salty Diet (+300ml)</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={highProtein}
                            onChange={(e) => setHighProtein(e.target.checked)}
                            className="w-4 h-4 text-sky-500 rounded focus:ring-sky-500"
                          />
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Zap className="w-4 h-4 text-violet-500" />
                            <span>High Protein Diet (+300ml)</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alcoholIntake}
                            onChange={(e) => setAlcoholIntake(e.target.checked)}
                            className="w-4 h-4 text-sky-500 rounded focus:ring-sky-500"
                          />
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Wine className="w-4 h-4 text-purple-600" />
                            <span>Alcohol Intake (+350ml)</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Container Customization */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <GlassWater className="w-4 h-4 text-sky-500" />
                        Preferred Glass / Bottle Size
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {CONTAINER_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedContainer(p.id)}
                            className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                              selectedContainer === p.id
                                ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            <div>{p.name}</div>
                            <div className="text-[11px] opacity-80 mt-0.5">{p.ml} ml</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS (RESET & EXPORTS) */}
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
                    <Copy className="w-4 h-4 text-sky-500" />
                    Copy Summary
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: HERO WATER METRICS & VISUAL RESULTS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* HERO RESULT CARD */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300">
                  Daily Hydration Goal
                </span>

                <div className="flex items-baseline justify-center gap-2 pt-2">
                  <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                    {calculation.totalLiters}
                  </span>
                  <span className="text-2xl font-bold text-sky-500">Liters</span>
                </div>

                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {calculation.totalMl.toLocaleString()} ml &bull; {calculation.totalOz} fl oz
                </div>
              </div>

              {/* CONTAINER BREAKDOWN BADGES */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Glasses (~240ml)
                  </div>
                  <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
                    {calculation.totalCups}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Glasses / day</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Chosen Container
                  </div>
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {calculation.containerCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    x {calculation.containerVolume}ml vessels
                  </div>
                </div>
              </div>

              {/* WATER INTAKE BREAKDOWN CHART */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Calculation Formula Breakdown
                </h3>
                <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span>Baseline Weight Need</span>
                    <span className="font-bold">{calculation.baseMl} ml</span>
                  </div>
                  {calculation.activityMl > 0 && (
                    <div className="flex justify-between p-2 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300">
                      <span>Physical Activity</span>
                      <span className="font-bold">+{calculation.activityMl} ml</span>
                    </div>
                  )}
                  {calculation.climateMl > 0 && (
                    <div className="flex justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                      <span>Climate Adjustment</span>
                      <span className="font-bold">+{calculation.climateMl} ml</span>
                    </div>
                  )}
                  {calculation.healthMl > 0 && (
                    <div className="flex justify-between p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300">
                      <span>Health & Life Stage</span>
                      <span className="font-bold">+{calculation.healthMl} ml</span>
                    </div>
                  )}
                  {calculation.dietMl > 0 && (
                    <div className="flex justify-between p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">
                      <span>Dietary Factors</span>
                      <span className="font-bold">+{calculation.dietMl} ml</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* INTERACTIVE DAILY LOG TRACKER */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-sky-500" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Log Today's Intake
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetLoggedIntake}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Reset Log
                </button>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{loggedIntakeMl} ml logged</span>
                  <span className="text-sky-500">{loggedPercent}% of target</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-sky-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${loggedPercent}%` }}
                  />
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => addIntake(250)}
                  className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  +1 Glass (250ml)
                </button>
                <button
                  type="button"
                  onClick={() => addIntake(500)}
                  className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  +1 Bottle (500ml)
                </button>
                <button
                  type="button"
                  onClick={() => addIntake(750)}
                  className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  +1 Flask (750ml)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: SCHEDULE & URINE CHART */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* HOURLY HYDRATION SCHEDULE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Recommended Daily Schedule
              </h3>
            </div>

            <div className="space-y-4">
              {dailySchedule.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <span className="px-3 py-1 rounded-xl bg-sky-500 text-white font-extrabold text-xs">
                    {item.time}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {item.title}
                      </span>
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        ({item.amountMl} ml)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VISUAL URINE COLOR HYDRATION CHART */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Urine Hydration Color Scale
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Check your urine color throughout the day to visually assess your current hydration level.
            </p>

            <div className="space-y-3">
              {[
                {
                  color: "bg-yellow-100 border-amber-200",
                  status: "Optimal Hydration",
                  desc: "Pale straw / transparent yellow. You are perfectly hydrated!",
                },
                {
                  color: "bg-yellow-300 border-yellow-400",
                  status: "Normal Hydration",
                  desc: "Clear yellow. Healthy level, keep sipping steadily.",
                },
                {
                  color: "bg-amber-400 border-amber-500",
                  status: "Mild Dehydration",
                  desc: "Dark yellow. Drink 1-2 glasses of water now.",
                },
                {
                  color: "bg-amber-600 border-amber-700",
                  status: "Moderate Dehydration",
                  desc: "Amber / Honey. Rehydrate immediately.",
                },
                {
                  color: "bg-amber-800 border-amber-900",
                  status: "Severe Dehydration",
                  desc: "Dark brown / Tea color. Drink water immediately and seek advice if persistent.",
                },
              ].map((scale, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className={`w-8 h-8 rounded-full border-2 ${scale.color} shadow-sm shrink-0`} />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {scale.status}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {scale.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
