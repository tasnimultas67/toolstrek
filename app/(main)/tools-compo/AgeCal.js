"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  addYears,
  addMonths,
  addDays,
  addHours,
  addMinutes,
  isValid,
} from "date-fns";
import {
  Timer,
  Cake,
  Calendar as CalIcon,
  Users,
  Clock,
  Heart,
  Moon,
  Coffee,
  Sparkles,
  Wind,
  Flame,
  Droplet,
  Compass
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ToolPageShell from "./ToolPageShell";
import CustomDatePicker from "./CustomDatePicker";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Helper for Zodiac Sign
const getZodiacSign = (date) => {
  if (!date || !isValid(date)) return null;
  const day = date.getDate();
  const month = date.getMonth() + 1; // 1-indexed

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: "Aries", symbol: "♈", element: "Fire", traits: "Energetic, courageous, enthusiastic", color: "from-rose-500 to-orange-500" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: "Taurus", symbol: "♉", element: "Earth", traits: "Reliable, patient, practical", color: "from-emerald-500 to-teal-500" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: "Gemini", symbol: "♊", element: "Air", traits: "Adaptable, outgoing, intelligent", color: "from-cyan-500 to-blue-500" };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: "Cancer", symbol: "♋", element: "Water", traits: "Intuitive, emotional, protective", color: "from-indigo-500 to-purple-500" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: "Leo", symbol: "♌", element: "Fire", traits: "Generous, warmhearted, creative", color: "from-amber-500 to-red-500" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: "Virgo", symbol: "♍", element: "Earth", traits: "Loyal, analytical, kind", color: "from-teal-600 to-emerald-600" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: "Libra", symbol: "♎", element: "Air", traits: "Diplomatic, artistic, social", color: "from-sky-400 to-indigo-500" };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: "Scorpio", symbol: "♏", element: "Water", traits: "Passionate, stubborn, resourceful", color: "from-purple-600 to-pink-600" };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: "Sagittarius", symbol: "♐", element: "Fire", traits: "Extroverted, optimistic, funny", color: "from-orange-500 to-rose-600" };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: "Capricorn", symbol: "♑", element: "Earth", traits: "Serious, disciplined, independent", color: "from-stone-600 to-neutral-700" };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: "Aquarius", symbol: "♒", element: "Air", traits: "Deep, imaginative, original", color: "from-blue-400 to-cyan-500" };
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: "Pisces", symbol: "♓", element: "Water", traits: "Compassionate, artistic, intuitive", color: "from-violet-500 to-indigo-600" };
  return null;
};

// Helper for Chinese Zodiac
const getChineseZodiac = (year) => {
  const animals = [
    { name: "Rat", symbol: "🐀", traits: "Quick-witted, resourceful, versatile" },
    { name: "Ox", symbol: "🐂", traits: "Diligent, dependable, strong" },
    { name: "Tiger", symbol: "🐅", traits: "Brave, confident, competitive" },
    { name: "Rabbit", symbol: "🐇", traits: "Quiet, elegant, kind" },
    { name: "Dragon", symbol: "🐉", traits: "Confident, intelligent, enthusiastic" },
    { name: "Snake", symbol: "🐍", traits: "Enigmatic, intelligent, wise" },
    { name: "Horse", symbol: "🐎", traits: "Animated, active, energetic" },
    { name: "Goat", symbol: "🐐", traits: "Calm, gentle, sympathetic" },
    { name: "Monkey", symbol: "🐒", traits: "Sharp, smart, curious" },
    { name: "Rooster", symbol: "🐓", traits: "Observant, hardworking, courageous" },
    { name: "Dog", symbol: "🐕", traits: "Lovely, honest, prudent" },
    { name: "Pig", symbol: "🐖", traits: "Compassionate, generous, diligent" }
  ];
  const idx = (year - 4) % 12;
  return animals[idx < 0 ? idx + 12 : idx] || animals[0];
};

export function AgeCal() {
  const [activeTab, setActiveTab] = useState("calculator");
  
  // Tab 1 States
  const [birthDate, setBirthDate] = useState(null);
  const [ageAtDate, setAgeAtDate] = useState(new Date());
  const [result, setResult] = useState(null);
  const [liveAge, setLiveAge] = useState(null);

  // Tab 2 States
  const [personAName, setPersonAName] = useState("");
  const [personABirthDate, setPersonABirthDate] = useState(null);
  const [personBName, setPersonBName] = useState("");
  const [personBBirthDate, setPersonBBirthDate] = useState(null);
  const [diffResult, setDiffResult] = useState(null);

  const handleCalculateAge = (e) => {
    if (e) e.preventDefault();
    if (!birthDate) return;

    const bDate = new Date(birthDate);
    const aDate = new Date(ageAtDate || new Date());

    const years = differenceInYears(aDate, bDate);
    const bDatePlusYears = addYears(bDate, years);
    const months = differenceInMonths(aDate, bDatePlusYears);
    const bDatePlusMonths = addMonths(bDatePlusYears, months);
    const days = differenceInDays(aDate, bDatePlusMonths);

    let nextBdayYear = aDate.getFullYear();
    let nextBday = new Date(nextBdayYear, bDate.getMonth(), bDate.getDate());
    if (nextBday < aDate) {
      nextBdayYear += 1;
      nextBday = new Date(nextBdayYear, bDate.getMonth(), bDate.getDate());
    }

    const zodiac = getZodiacSign(bDate);
    const chineseZodiac = getChineseZodiac(bDate.getFullYear());
    const isToday = Math.abs(aDate.getTime() - new Date().getTime()) < 60000;

    setResult({
      years,
      months,
      days,
      isLive: isToday,
      rawBirthDate: bDate,
      rawAgeAtDate: aDate,
      rawNextBirthday: nextBday,
      zodiac,
      chineseZodiac,
      formattedBirthDate: format(bDate, "PPPP"),
      formattedAgeAtDate: format(aDate, "PPPP"),
      formattedNextBirthday: format(nextBday, "PPP")
    });
  };

  useEffect(() => {
    if (!result || !result.isLive) {
      setLiveAge(null);
      return;
    }

    const updateTicker = () => {
      const now = new Date();
      const bDate = new Date(result.rawBirthDate);

      const years = differenceInYears(now, bDate);
      const bDatePlusYears = addYears(bDate, years);
      const months = differenceInMonths(now, bDatePlusYears);
      const bDatePlusMonths = addMonths(bDatePlusYears, months);
      const days = differenceInDays(now, bDatePlusMonths);
      const bDatePlusDays = addDays(bDatePlusMonths, days);
      const hours = differenceInHours(now, bDatePlusDays);
      const bDatePlusHours = addHours(bDatePlusDays, hours);
      const minutes = differenceInMinutes(now, bDatePlusHours);
      const bDatePlusMinutes = addMinutes(bDatePlusHours, minutes);
      const seconds = differenceInSeconds(now, bDatePlusMinutes);

      const nextBday = new Date(result.rawNextBirthday);
      let countdownMs = nextBday.getTime() - now.getTime();
      if (countdownMs < 0) {
        const nextBdayYear = now.getFullYear() + 1;
        const newNextBday = new Date(nextBdayYear, bDate.getMonth(), bDate.getDate());
        countdownMs = newNextBday.getTime() - now.getTime();
      }

      const countdown = {
        days: Math.floor(countdownMs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((countdownMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((countdownMs % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((countdownMs % (1000 * 60)) / 1000),
      };

      const totalMs = now.getTime() - bDate.getTime();
      const totalSeconds = Math.floor(totalMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);
      const totalWeeks = Math.floor(totalDays / 7);
      const totalMonths = (years * 12) + months;

      setLiveAge({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        countdown,
        totalMonths,
        totalWeeks,
        totalDays,
        totalHours,
        totalMinutes,
        totalSeconds
      });
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const handleCalculateDifference = (e) => {
    if (e) e.preventDefault();
    if (!personABirthDate || !personBBirthDate) return;

    const dateA = new Date(personABirthDate);
    const dateB = new Date(personBBirthDate);
    const nameA = personAName.trim() || "Person A";
    const nameB = personBName.trim() || "Person B";

    let olderName = nameA;
    let youngerName = nameB;
    let olderDate = dateA;
    let youngerDate = dateB;

    if (dateA.getTime() === dateB.getTime()) {
      setDiffResult({
        equal: true,
        nameA,
        nameB,
        formattedDateA: format(dateA, "PP"),
        formattedDateB: format(dateB, "PP"),
      });
      return;
    }

    if (dateA.getTime() > dateB.getTime()) {
      olderName = nameB;
      youngerName = nameA;
      olderDate = dateB;
      youngerDate = dateA;
    }

    const diffYears = differenceInYears(youngerDate, olderDate);
    const olderDatePlusYears = addYears(olderDate, diffYears);
    const diffMonths = differenceInMonths(youngerDate, olderDatePlusYears);
    const olderDatePlusMonths = addMonths(olderDatePlusYears, diffMonths);
    const diffDays = differenceInDays(youngerDate, olderDatePlusMonths);
    const totalDays = differenceInDays(youngerDate, olderDate);

    setDiffResult({
      equal: false,
      olderName,
      youngerName,
      years: diffYears,
      months: diffMonths,
      days: diffDays,
      totalDays,
      olderBirthDateStr: format(olderDate, "PPPP"),
      youngerBirthDateStr: format(youngerDate, "PPPP"),
    });
  };

  const staticStats = result ? {
    totalMonths: (result.years * 12) + result.months,
    totalWeeks: Math.floor(differenceInDays(result.rawAgeAtDate, result.rawBirthDate) / 7),
    totalDays: differenceInDays(result.rawAgeAtDate, result.rawBirthDate),
    totalHours: differenceInDays(result.rawAgeAtDate, result.rawBirthDate) * 24,
    totalMinutes: differenceInDays(result.rawAgeAtDate, result.rawBirthDate) * 24 * 60,
    totalSeconds: differenceInDays(result.rawAgeAtDate, result.rawBirthDate) * 24 * 60 * 60,
  } : null;

  const displayAge = liveAge || {
    years: result?.years,
    months: result?.months,
    days: result?.days,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ...staticStats
  };

  return (
    <ToolPageShell widthClassName="max-w-5xl pt-24 pb-12">
      {/* Hero Header Area */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl flex items-center justify-center gap-3">
          <Timer className="w-9 h-9 text-blue-600" />
          Age <span className="text-blue-600">Dashboard</span>
        </h1>
        <p className="mt-2.5 text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Highly precise age analysis & celestial milestones
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
          <Cake className="w-4 h-4" />
          Age Calculator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("difference")}
          className={cn(
            "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeTab === "difference"
              ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          )}
        >
          <Users className="w-4 h-4" />
          Age Difference
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "calculator" ? (
          /* Tab 1 Layout: Calculator */
          <motion.div
            key="calculator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10 font-sans"
          >
            {/* Horizontal Input Panel at top */}
            <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-gray-800/50 p-6 md:p-8">
              <form onSubmit={handleCalculateAge} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-5">
                  <CustomDatePicker
                    selected={birthDate}
                    onSelect={setBirthDate}
                    disabled={(date) => date > new Date()}
                    label="Date of Birth"
                    placeholder="When were you born?"
                    presetsType="birthDate"
                  />
                </div>
                <div className="md:col-span-4">
                  <CustomDatePicker
                    selected={ageAtDate}
                    onSelect={setAgeAtDate}
                    label="Age at the Date of"
                    placeholder="Target calculation date"
                    presetsType="any"
                  />
                </div>
                <div className="md:col-span-3">
                  <Button
                    type="submit"
                    disabled={!birthDate}
                    className="w-full h-15 text-base font-black uppercase tracking-wider text-white rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 cursor-pointer"
                  >
                    Calculate Age
                  </Button>
                </div>
              </form>
            </Card>

            {/* Results dashboard below */}
            {result ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                {/* Main Results Column (span 8) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Large Unified Age Board */}
                  <Card className="bg-linear-to-br from-slate-900 via-slate-950 to-black text-white rounded-3xl border-none shadow-2xl p-8 md:p-10 relative overflow-hidden">
                    {/* Glowing Accent Circle */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between mb-8 z-10 relative">
                      <span className="text-xs font-black uppercase text-blue-400 tracking-widest">
                        Exact Duration
                      </span>
                      {result.isLive && (
                        <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Realtime Ticking
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-4 z-10 relative">
                      <div>
                        <span className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">{displayAge.years}</span>
                        <span className="text-sm font-black uppercase tracking-wider text-slate-400 ml-2">Years</span>
                      </div>
                      <div>
                        <span className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">{displayAge.months}</span>
                        <span className="text-sm font-black uppercase tracking-wider text-slate-400 ml-2">Months</span>
                      </div>
                      <div>
                        <span className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight">{displayAge.days}</span>
                        <span className="text-sm font-black uppercase tracking-wider text-slate-400 ml-2">Days</span>
                      </div>
                    </div>

                    {/* Clock ticking below */}
                    {result.isLive && liveAge && (
                      <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 relative">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-400" /> Time Lived
                        </span>
                        <div className="flex gap-4 text-center font-mono">
                          <div>
                            <span className="text-2xl font-black text-slate-100 block">{String(liveAge.hours).padStart(2, "0")}</span>
                            <span className="text-[8px] uppercase tracking-wider text-slate-500">hours</span>
                          </div>
                          <span className="text-2xl font-bold text-slate-600">:</span>
                          <div>
                            <span className="text-2xl font-black text-slate-100 block">{String(liveAge.minutes).padStart(2, "0")}</span>
                            <span className="text-[8px] uppercase tracking-wider text-slate-500">minutes</span>
                          </div>
                          <span className="text-2xl font-bold text-slate-600">:</span>
                          <div>
                            <span className="text-2xl font-black text-blue-400 block tracking-widest">{String(liveAge.seconds).padStart(2, "0")}</span>
                            <span className="text-[8px] uppercase tracking-wider text-slate-500">seconds</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Next Birthday & Celestial Widget Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Countdown Banner */}
                    <Card className="bg-linear-to-br from-blue-600 to-indigo-750 text-white rounded-3xl p-6 shadow-xl border-none flex flex-col justify-between relative overflow-hidden min-h-[200px]">
                      <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                        <Cake size={130} />
                      </div>
                      <div className="flex items-center gap-4 z-10">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                          <Cake className="w-6 h-6 text-pink-300" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Next Birthday</p>
                          <p className="text-sm font-extrabold">{result.formattedNextBirthday}</p>
                        </div>
                      </div>

                      {result.isLive && liveAge?.countdown ? (
                        <div className="mt-8 pt-4 border-t border-white/10 grid grid-cols-4 gap-2 text-center z-10">
                          <div>
                            <span className="text-2xl font-black block">{liveAge.countdown.days}</span>
                            <span className="text-[8px] uppercase font-bold text-blue-200">Days</span>
                          </div>
                          <div>
                            <span className="text-2xl font-black block">{liveAge.countdown.hours}</span>
                            <span className="text-[8px] uppercase font-bold text-blue-200">Hours</span>
                          </div>
                          <div>
                            <span className="text-2xl font-black block">{liveAge.countdown.minutes}</span>
                            <span className="text-[8px] uppercase font-bold text-blue-200">Mins</span>
                          </div>
                          <div>
                            <span className="text-2xl font-black block font-mono text-emerald-300">{liveAge.countdown.seconds}</span>
                            <span className="text-[8px] uppercase font-bold text-blue-200">Secs</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 text-[10px] text-blue-100 font-bold bg-white/5 p-3 rounded-xl text-center">
                          Birthday countdown runs live for &ldquo;Today&rdquo; calculations.
                        </div>
                      )}
                    </Card>

                    {/* Zodiac Profile */}
                    {result.zodiac && (
                      <Card className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100/50 dark:border-gray-800/50 shadow-xl flex flex-col justify-between min-h-[200px]">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl" role="img" aria-label={result.zodiac.name}>
                              {result.zodiac.symbol}
                            </span>
                            <div>
                              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block leading-none mb-1">
                                Astrology Sign
                              </span>
                              <span className="text-base font-extrabold text-gray-800 dark:text-gray-150">
                                {result.zodiac.name}
                              </span>
                            </div>
                          </div>
                          <span className={cn(
                            "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border border-transparent flex items-center gap-1",
                            result.zodiac.element === "Fire" && "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400",
                            result.zodiac.element === "Water" && "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
                            result.zodiac.element === "Earth" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
                            result.zodiac.element === "Air" && "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400"
                          )}>
                            {result.zodiac.element === "Fire" && <Flame className="w-3.5 h-3.5" />}
                            {result.zodiac.element === "Water" && <Droplet className="w-3.5 h-3.5" />}
                            {result.zodiac.element === "Earth" && <Compass className="w-3.5 h-3.5" />}
                            {result.zodiac.element === "Air" && <Wind className="w-3.5 h-3.5" />}
                            {result.zodiac.element}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 italic mt-3 font-semibold">
                          &ldquo;{result.zodiac.traits}&rdquo;
                        </p>

                        <div className="mt-4 pt-3.5 border-t border-gray-50 dark:border-gray-850 flex items-center gap-2">
                          <span className="text-xl">{result.chineseZodiac.symbol}</span>
                          <div>
                            <span className="text-[8px] font-bold uppercase text-gray-400 tracking-widest block leading-none">
                              Chinese Zodiac
                            </span>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              Year of the {result.chineseZodiac.name}
                            </span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Right Side Column (span 4) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Heartbeats and Life statistics */}
                  <Card className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 shadow-xl p-6">
                    <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-555 tracking-wider mb-5">
                      Life Milestones (Est.)
                    </h4>
                    <div className="space-y-4.5">
                      {/* Heart */}
                      <div className="flex items-center gap-4 p-3.5 bg-rose-50/30 dark:bg-rose-950/10 rounded-2xl border border-rose-100/10">
                        <Heart className="w-5 h-5 text-rose-500 animate-pulse shrink-0" />
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block leading-none mb-1">Heart Beats</span>
                          <span className="text-sm font-black text-gray-800 dark:text-gray-100">
                            {((displayAge.totalMinutes || 0) * 80).toLocaleString()} times
                          </span>
                        </div>
                      </div>

                      {/* Breaths */}
                      <div className="flex items-center gap-4 p-3.5 bg-sky-50/30 dark:bg-sky-950/10 rounded-2xl border border-sky-100/10">
                        <Wind className="w-5 h-5 text-sky-500 shrink-0" />
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block leading-none mb-1">Breaths Taken</span>
                          <span className="text-sm font-black text-gray-800 dark:text-gray-100">
                            {((displayAge.totalMinutes || 0) * 16).toLocaleString()} breaths
                          </span>
                        </div>
                      </div>

                      {/* Sleep */}
                      <div className="flex items-center gap-4 p-3.5 bg-indigo-50/30 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/10">
                        <Moon className="w-5 h-5 text-indigo-500 shrink-0" />
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block leading-none mb-1">Sleep Logged</span>
                          <span className="text-sm font-black text-gray-800 dark:text-gray-100">
                            {((displayAge.totalDays || 0) * 8).toLocaleString()} hours
                          </span>
                        </div>
                      </div>

                      {/* Meals */}
                      <div className="flex items-center gap-4 p-3.5 bg-amber-50/30 dark:bg-amber-950/10 rounded-2xl border border-amber-100/10">
                        <Coffee className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block leading-none mb-1">Meals Eaten</span>
                          <span className="text-sm font-black text-gray-800 dark:text-gray-100">
                            {((displayAge.totalDays || 0) * 3).toLocaleString()} meals
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Alternative Units */}
                  <Card className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 shadow-xl p-6">
                    <h4 className="text-xs font-black uppercase text-gray-400 dark:text-gray-555 tracking-wider mb-4">
                      Alternative Units
                    </h4>
                    <div className="space-y-2.5 text-xs font-bold">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                        <span className="text-gray-400">Total Months</span>
                        <span className="text-gray-700 dark:text-gray-250">
                          {(displayAge.totalMonths || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                        <span className="text-gray-400">Total Weeks</span>
                        <span className="text-gray-700 dark:text-gray-250">
                          {(displayAge.totalWeeks || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                        <span className="text-gray-400">Total Days</span>
                        <span className="text-gray-700 dark:text-gray-250">
                          {(displayAge.totalDays || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                        <span className="text-gray-400">Total Hours</span>
                        <span className="text-gray-700 dark:text-gray-250">
                          {(displayAge.totalHours || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                        <span className="text-gray-400">Total Minutes</span>
                        <span className="text-gray-700 dark:text-gray-250">
                          {(displayAge.totalMinutes || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                        <span className="text-gray-400">Total Seconds</span>
                        <span className="text-blue-500 font-mono">
                          {(displayAge.totalSeconds || 0).toLocaleString()}
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
                  Ready to Calculate
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                  Provide your date of birth and hit calculate to unlock detailed, real-time age analysis.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          /* Tab 2 Layout: Age Difference */
          <motion.div
            key="difference"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10 font-sans"
          >
            {/* Input card for two dates */}
            <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100/50 dark:border-gray-800/50 p-6 md:p-8">
              <form onSubmit={handleCalculateDifference} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Person A */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-black uppercase text-gray-400 dark:text-gray-555 tracking-widest">
                        First Person Name
                      </span>
                      <input
                        type="text"
                        value={personAName}
                        onChange={(e) => setPersonAName(e.target.value)}
                        placeholder="Person A"
                        className="w-full h-14 px-4 rounded-2xl border text-sm font-semibold transition-all outline-none bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/80 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500/80 dark:focus:border-blue-600/80 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10"
                      />
                    </div>

                    <CustomDatePicker
                      selected={personABirthDate}
                      onSelect={setPersonABirthDate}
                      placeholder="Select birthday for first person"
                      presetsType="birthDate"
                    />
                  </div>

                  {/* Person B */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-black uppercase text-gray-400 dark:text-gray-555 tracking-widest">
                        Second Person Name
                      </span>
                      <input
                        type="text"
                        value={personBName}
                        onChange={(e) => setPersonBName(e.target.value)}
                        placeholder="Person B"
                        className="w-full h-14 px-4 rounded-2xl border text-sm font-semibold transition-all outline-none bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/80 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500/80 dark:focus:border-blue-600/80 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10"
                      />
                    </div>

                    <CustomDatePicker
                      selected={personBBirthDate}
                      onSelect={setPersonBBirthDate}
                      placeholder="Select birthday for second person"
                      presetsType="birthDate"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!personABirthDate || !personBBirthDate}
                  className="w-full h-14 text-base font-black uppercase tracking-wider text-white rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 cursor-pointer"
                >
                  Compare Ages
                </Button>
              </form>
            </Card>

            {/* Results Block */}
            {diffResult ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto"
              >
                <Card className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 shadow-xl p-8 relative overflow-hidden">
                  <h3 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-6">
                    Age Gap Analysis
                  </h3>

                  {diffResult.equal ? (
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
                      <Cake className="w-10 h-10 text-pink-500 mx-auto mb-3" />
                      <h4 className="text-lg font-extrabold text-gray-800 dark:text-white">
                        It&apos;s a tie!
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Both <strong>{diffResult.nameA}</strong> and <strong>{diffResult.nameB}</strong> share the exact same birth date of <strong>{diffResult.formattedDateA}</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Older Person banner */}
                      <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/30 dark:border-blue-900/20 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">
                            Older Individual
                          </p>
                          <h4 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
                            {diffResult.olderName}
                          </h4>
                        </div>
                        <span className="px-3 py-1 bg-white dark:bg-gray-800 text-[10px] font-bold rounded-lg border border-gray-100 dark:border-gray-800 text-gray-500">
                          Born {diffResult.olderBirthDateStr}
                        </span>
                      </div>

                      {/* Precise difference widgets */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                          Age difference
                        </span>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl text-center">
                            <span className="text-3xl font-black text-gray-800 dark:text-white block">
                              {diffResult.years}
                            </span>
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mt-1 block">
                              Years
                            </span>
                          </div>
                          <div className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl text-center">
                            <span className="text-3xl font-black text-gray-800 dark:text-white block">
                              {diffResult.months}
                            </span>
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mt-1 block">
                              Months
                            </span>
                          </div>
                          <div className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl text-center">
                            <span className="text-3xl font-black text-gray-800 dark:text-white block">
                              {diffResult.days}
                            </span>
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mt-1 block">
                              Days
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Narrative text block */}
                      <div className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                        <strong>{diffResult.olderName}</strong> is older than <strong>{diffResult.youngerName}</strong> by exactly{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          {diffResult.years} {diffResult.years === 1 ? "year" : "years"}, {diffResult.months} {diffResult.months === 1 ? "month" : "months"}, and {diffResult.days} {diffResult.days === 1 ? "day" : "days"}
                        </span>.
                        <div className="mt-2 pt-2.5 border-t border-gray-200/40 dark:border-gray-800/40">
                          Total difference: <strong>{diffResult.totalDays.toLocaleString()} calendar days</strong>.
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ) : (
              <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/10 dark:bg-gray-900/10">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-center mb-4 shadow-xs">
                  <Users className="text-gray-300 dark:text-gray-600 w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-500 dark:text-gray-400">
                  Compare Age Gap
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                  Provide the birth dates of two individuals to see who is older, how much the gap is, and other interesting milestones.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageShell>
  );
}
