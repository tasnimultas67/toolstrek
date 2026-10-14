// app/(main)/tools-compo/tools/CountdownTimer.jsx
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ToolPageShell from "../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import toolsData from "@/lib/toolsData.json";
import {
  Hourglass,
  Clock,
  Calendar,
  Sparkles,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Share2,
  Copy,
  Check,
  Download,
  CalendarPlus,
  Code,
  Palette,
  Settings,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Minus,
  Briefcase,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle2,
  X,
  ExternalLink,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  THEMES,
  getCountdownPresets,
  WORLD_TIMEZONES,
  countdownSoundEngine,
  calculateBusinessDays,
  generateIcsContent,
  COUNTDOWN_FAQS,
  triggerConfetti,
} from "./countdown-timer/countdownData";

const STORAGE_KEY = "toolstrek_countdown_state_v1";

// Helper: Format Date for datetime-local input (YYYY-MM-DDTHH:mm)
const formatToDateTimeLocal = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CountdownTimer({ defaultTab = "countdown" }) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // ─── Active Tab State ───
  const [activeTab, setActiveTab] = useState(defaultTab); // "countdown" | "days-until" | "presets"

  // ─── Core Countdown State ───
  const [title, setTitle] = useState("New Year 2027");
  const [emoji, setEmoji] = useState("🎆");
  const [targetDateStr, setTargetDateStr] = useState(() => {
    const nextYear = new Date().getFullYear() + 1;
    return `${nextYear}-01-01T00:00`;
  });
  const [startDateStr, setStartDateStr] = useState(() => formatToDateTimeLocal(new Date()));
  const [timezone, setTimezone] = useState("LOCAL");
  const [themeId, setThemeId] = useState("sapphire");
  const [recurrence, setRecurrence] = useState("none"); // "none" | "yearly" | "monthly" | "weekly"
  const [completionMessage, setCompletionMessage] = useState("🎉 The wait is over! Milestone achieved!");

  // ─── Preferences & Advanced Options ───
  const [unitMode, setUnitMode] = useState("standard"); // "standard" | "compact" | "expanded" | "days-only"
  const [showMilliseconds, setShowMilliseconds] = useState(false);
  const [workingDaysOnly, setWorkingDaysOnly] = useState(false);
  const [weekendMode, setWeekendMode] = useState("sat-sun"); // "sat-sun" | "fri-sat" | "sun-only"
  const [soundAlert, setSoundAlert] = useState("chime"); // "chime" | "fanfare" | "bowl" | "digital" | "bell" | "harp" | "none"
  const [volume, setVolume] = useState(0.7);
  const [confettiEnabled, setConfettiEnabled] = useState(true);

  // ─── UI & Presentation Modals ───
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [presetCategory, setPresetCategory] = useState("All");
  const [activeFaq, setActiveFaq] = useState(null);

  // ─── Days Until Calculator Secondary Tool State ───
  const [calcStartDate, setCalcStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [calcTargetDate, setCalcTargetDate] = useState(() => {
    const nextYear = new Date().getFullYear() + 1;
    return `${nextYear}-01-01`;
  });
  const [addDaysInput, setAddDaysInput] = useState(30);
  const [addDaysType, setAddDaysType] = useState("calendar"); // "calendar" | "business"

  // ─── Audio & Confetti Trigger Guard ───
  const hasTriggeredEndRef = useRef(false);
  const timerCardRef = useRef(null);

  // Presets dynamic list
  const presets = useMemo(() => getCountdownPresets(), []);

  // Current Theme definition
  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === themeId) || THEMES[0];
  }, [themeId]);

  // ─── Mount & URL Query Param Hydration ───
  useEffect(() => {
    setMounted(true);

    // Read query params if provided
    const qTitle = searchParams.get("title");
    const qDate = searchParams.get("date");
    const qEmoji = searchParams.get("emoji");
    const qTheme = searchParams.get("theme");
    const qTz = searchParams.get("tz");
    const qMode = searchParams.get("mode");

    if (qTitle) setTitle(qTitle);
    if (qDate) setTargetDateStr(qDate);
    if (qEmoji) setEmoji(qEmoji);
    if (qTheme && THEMES.some((t) => t.id === qTheme)) setThemeId(qTheme);
    if (qTz) setTimezone(qTz);
    if (qMode === "days-until" || defaultTab === "days-until") {
      setActiveTab("days-until");
    }

    // Try reading saved settings from LocalStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !qTitle && !qDate) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.emoji) setEmoji(parsed.emoji);
        if (parsed.targetDateStr) setTargetDateStr(parsed.targetDateStr);
        if (parsed.themeId) setThemeId(parsed.themeId);
        if (parsed.soundAlert) setSoundAlert(parsed.soundAlert);
        if (parsed.unitMode) setUnitMode(parsed.unitMode);
        if (typeof parsed.volume === "number") setVolume(parsed.volume);
      }
    } catch {
      // Ignore local storage error
    }
  }, [searchParams, defaultTab]);

  // ─── Save Settings on Change ───
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          title,
          emoji,
          targetDateStr,
          themeId,
          soundAlert,
          unitMode,
          volume,
        })
      );
    } catch {
      // Ignore write error
    }
  }, [mounted, title, emoji, targetDateStr, themeId, soundAlert, unitMode, volume]);

  // ─── Fullscreen 'F' Key & Escape Listener ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // ─── Live Real-Time Ticking Engine ───
  const [timeRemaining, setTimeRemaining] = useState({
    totalMs: 0,
    isPast: false,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    totalDays: 0,
    totalHours: 0,
    totalMinutes: 0,
    totalSeconds: 0,
    progressPercent: 0,
  });

  useEffect(() => {
    if (!mounted) return;

    let animId;
    const intervalTime = showMilliseconds ? 33 : 500; // 30fps for millis or 2fps for standard

    const updateTimer = () => {
      const now = new Date();
      const target = new Date(targetDateStr);
      const start = new Date(startDateStr);

      const targetMs = target.getTime();
      const nowMs = now.getTime();
      const diffMs = targetMs - nowMs;
      const isPast = diffMs <= 0;
      const absDiff = Math.abs(diffMs);

      // Trigger Celebration once when timer crosses zero
      if (isPast && !hasTriggeredEndRef.current && diffMs > -5000) {
        hasTriggeredEndRef.current = true;
        if (confettiEnabled) {
          triggerConfetti();
        }
        if (soundAlert !== "none") {
          countdownSoundEngine.setVolume(volume);
          countdownSoundEngine.playAlert(soundAlert);
        }
        toast.success(`🎉 ${title}: Countdown Finished!`);
      } else if (!isPast) {
        hasTriggeredEndRef.current = false;
      }

      // Elapsed Progress calculation
      const totalSpan = targetMs - start.getTime();
      let progress = 0;
      if (totalSpan > 0) {
        const elapsed = nowMs - start.getTime();
        progress = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));
      } else {
        progress = isPast ? 100 : 0;
      }

      // Breakdown calculations
      const d = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const h = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((absDiff % (1000 * 60)) / 1000);
      const ms = Math.floor((absDiff % 1000) / 10); // Tenths

      const totDays = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const totHours = Math.floor(absDiff / (1000 * 60 * 60));
      const totMins = Math.floor(absDiff / (1000 * 60));
      const totSecs = Math.floor(absDiff / 1000);

      setTimeRemaining({
        totalMs: diffMs,
        isPast,
        days: d,
        hours: h,
        minutes: m,
        seconds: s,
        milliseconds: ms,
        totalDays: totDays,
        totalHours: totHours,
        totalMinutes: totMins,
        totalSeconds: totSecs,
        progressPercent: progress,
      });

      // Browser Tab Title live countdown updater
      if (!isPast) {
        document.title = `[${d}d ${h}h ${m}m] ${title} | ToolsTrek`;
      } else {
        document.title = `[Finished] ${title} | ToolsTrek`;
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, intervalTime);

    return () => {
      clearInterval(interval);
      document.title = "Countdown Timer & Days Until Calculator | ToolsTrek";
    };
  }, [
    mounted,
    targetDateStr,
    startDateStr,
    showMilliseconds,
    title,
    confettiEnabled,
    soundAlert,
    volume,
  ]);

  // ─── Business Days Calculation for Active Countdown ───
  const activeBusinessDaysInfo = useMemo(() => {
    const now = new Date();
    const target = new Date(targetDateStr);
    return calculateBusinessDays(now, target, weekendMode);
  }, [targetDateStr, weekendMode]);

  // ─── Days Until Calculation Engine (Tab 2) ───
  const daysUntilReport = useMemo(() => {
    const s = new Date(calcStartDate);
    const t = new Date(calcTargetDate);

    s.setHours(0, 0, 0, 0);
    t.setHours(0, 0, 0, 0);

    const diffTime = t.getTime() - s.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const isPast = diffDays < 0;
    const absDays = Math.abs(diffDays);

    const weeks = Math.floor(absDays / 7);
    const remDays = absDays % 7;
    const totalHours = absDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    const bDays = calculateBusinessDays(s, t, weekendMode);

    // Target day of week name
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDayName = dayNames[t.getDay()];

    // Percent of year
    const startOfYear = new Date(t.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((t - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const isLeapYear = (t.getFullYear() % 4 === 0 && t.getFullYear() % 100 !== 0) || t.getFullYear() % 400 === 0;
    const totalDaysInYear = isLeapYear ? 366 : 365;
    const percentOfYear = ((dayOfYear / totalDaysInYear) * 100).toFixed(1);

    return {
      diffDays,
      isPast,
      absDays,
      weeks,
      remDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      businessDays: Math.abs(bDays.businessDays),
      weekendDays: Math.abs(bDays.weekendDays),
      targetDayName,
      dayOfYear,
      totalDaysInYear,
      percentOfYear,
    };
  }, [calcStartDate, calcTargetDate, weekendMode]);

  // ─── Add Days Calculation Result ───
  const addDaysResult = useMemo(() => {
    const start = new Date(calcStartDate);
    const num = parseInt(addDaysInput) || 0;

    if (addDaysType === "calendar") {
      const res = new Date(start);
      res.setDate(res.getDate() + num);
      return res.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      // Business Days addition
      let cur = new Date(start);
      let added = 0;
      const step = num >= 0 ? 1 : -1;
      const absNum = Math.abs(num);

      while (added < absNum) {
        cur.setDate(cur.getDate() + step);
        const day = cur.getDay();
        const isWeekend = weekendMode === "sat-sun" ? day === 0 || day === 6 : day === 5 || day === 6;
        if (!isWeekend) {
          added++;
        }
      }
      return cur.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }, [calcStartDate, addDaysInput, addDaysType, weekendMode]);

  // ─── Shareable Link Generator ───
  const generateShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const url = new URL("/tools/countdown-timer", window.location.origin);
    url.searchParams.set("title", title);
    url.searchParams.set("date", targetDateStr);
    url.searchParams.set("emoji", emoji);
    url.searchParams.set("theme", themeId);
    if (timezone !== "LOCAL") url.searchParams.set("tz", timezone);
    return url.toString();
  }, [title, targetDateStr, emoji, themeId, timezone]);

  const handleCopyShareLink = () => {
    const url = generateShareUrl();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        toast.success("Shareable Countdown Link copied to clipboard!");
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  // ─── Export iCalendar (.ics) File ───
  const handleExportIcs = () => {
    const icsString = generateIcsContent({
      title: `${emoji} ${title}`,
      description: `Target date milestone for ${title}. Tracked on ToolsTrek Countdown Timer.`,
      targetDate: new Date(targetDateStr),
      url: generateShareUrl(),
    });

    const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-countdown.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported .ics event for Google / Apple / Outlook Calendar!");
  };

  // ─── Export Visual PNG Image Card via Canvas ───
  const handleExportPng = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
      bgGrad.addColorStop(0, "#090d16");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // Accent Aura Glow
      const glowGrad = ctx.createRadialGradient(600, 315, 50, 600, 315, 500);
      glowGrad.addColorStop(0, currentTheme.previewColor + "33");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // Title & Emoji
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px Inter, system-ui, sans-serif";
      ctx.fillText(`${emoji}  ${title}`, 600, 120);

      // Subtitle / Target Date
      const targetDateFormatted = new Date(targetDateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      ctx.fillStyle = "#94a3b8";
      ctx.font = "22px Inter, system-ui, sans-serif";
      ctx.fillText(targetDateFormatted, 600, 170);

      // Digit Flip Cards (Days, Hours, Minutes, Seconds)
      const boxWidth = 200;
      const boxHeight = 190;
      const gap = 30;
      const startX = 600 - (boxWidth * 4 + gap * 3) / 2;
      const startY = 240;

      const units = [
        { label: "DAYS", val: timeRemaining.days },
        { label: "HOURS", val: timeRemaining.hours },
        { label: "MINUTES", val: timeRemaining.minutes },
        { label: "SECONDS", val: timeRemaining.seconds },
      ];

      units.forEach((u, i) => {
        const x = startX + i * (boxWidth + gap);

        // Card Box
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = currentTheme.previewColor + "80";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, startY, boxWidth, boxHeight, 20);
        ctx.fill();
        ctx.stroke();

        // Digit Value
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 72px 'Courier New', monospace, sans-serif";
        ctx.fillText(String(u.val).padStart(2, "0"), x + boxWidth / 2, startY + 110);

        // Unit Label
        ctx.fillStyle = currentTheme.previewColor;
        ctx.font = "bold 16px Inter, system-ui, sans-serif";
        ctx.fillText(u.label, x + boxWidth / 2, startY + 155);
      });

      // Footer Branding
      ctx.fillStyle = "#64748b";
      ctx.font = "18px Inter, system-ui, sans-serif";
      ctx.fillText("Created with toolstrek.vercel.app — Live Countdown Timer", 600, 560);

      // Download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-countdown.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Countdown image card downloaded!");
    } catch {
      toast.error("Failed to generate image.");
    }
  };

  // ─── Apply Preset ───
  const applyPreset = (preset) => {
    setTitle(preset.title);
    setEmoji(preset.emoji);
    setTargetDateStr(formatToDateTimeLocal(preset.targetDate));
    if (preset.theme) setThemeId(preset.theme);
    if (preset.repeat) setRecurrence(preset.repeat);
    setStartDateStr(formatToDateTimeLocal(new Date()));
    setActiveTab("countdown");
    toast.success(`Loaded preset: ${preset.emoji} ${preset.title}`);
  };

  // ─── Adjust Date Quick Helpers (+/- 1 Day, +1 Week, etc.) ───
  const adjustTargetDate = (days) => {
    const cur = new Date(targetDateStr);
    cur.setDate(cur.getDate() + days);
    setTargetDateStr(formatToDateTimeLocal(cur));
  };

  // ─── Test Sound Alert ───
  const handleTestSound = () => {
    countdownSoundEngine.setVolume(volume);
    countdownSoundEngine.playAlert(soundAlert);
    toast.info(`Playing sound: ${soundAlert.toUpperCase()}`);
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl pt-20 pb-16">
      {/* ─── Breadcrumb & Favorite Header ─── */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Productivity & Time
            </span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Drift-Free Precision Engine
            </span>
          </div>

          {/* Quick Actions (Share, Fullscreen, Favorite) */}
          <div className="flex items-center gap-2">
            <FavoriteButton
              tool={
                toolsData.find((t) => t.link === "/tools/countdown-timer") || {
                  title: "Countdown Timer & Days Until Calculator",
                  link: "/tools/countdown-timer",
                  description: "Professional, customizable live countdown timer and days until calculator.",
                  icon: "Hourglass",
                }
              }
            />

            <button
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-xs"
              title="Copy Shareable Countdown URL"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share"}</span>
            </button>

            <button
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors"
              title="Enter Fullscreen Presentation Mode (HotKey: F)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen [F]</span>
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 inline-flex">
                <Hourglass className="w-8 h-8 animate-pulse" />
              </span>
              <span>Countdown Timer &amp; Days Until</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
              Professional, fully customizable live countdown clock and milestone calculator. Track holidays,
              business days, launches, and personal events with timezone precision, alert chimes, confetti celebrations,
              and calendar exports.
            </p>
          </div>

          {/* Core Tab Navigation */}
          <div className="flex items-center p-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("countdown")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === "countdown"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>Live Countdown</span>
            </button>
            <button
              onClick={() => setActiveTab("days-until")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === "days-until"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Days Until &amp; Business Days</span>
            </button>
            <button
              onClick={() => setActiveTab("presets")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === "presets"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Presets</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          TAB 1: LIVE COUNTDOWN TIMER DISPLAY & WORKSPACE
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "countdown" && (
        <div className="space-y-8">
          {/* Main Countdown Display Canvas Card */}
          <div
            ref={timerCardRef}
            className={`relative overflow-hidden rounded-3xl border ${currentTheme.cardBg} backdrop-blur-xl p-6 sm:p-10 shadow-2xl transition-all duration-300`}
            style={{
              boxShadow: `0 25px 60px -15px ${currentTheme.glowColor}`,
            }}
          >
            {/* Background Ambient Glow */}
            <div
              className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none bg-gradient-to-br ${currentTheme.gradient}`}
            />
            <div
              className={`absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-tr ${currentTheme.gradient}`}
            />

            {/* Top Event Title Bar & Status */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl select-none">{emoji}</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>{title}</span>
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(targetDateStr).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {timezone !== "LOCAL" && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200/80 dark:border-white/10 font-mono text-[10px]">
                        {timezone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {timeRemaining.isPast ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                    <span>⏱️</span>
                    <span>Count-Up (Passed)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                    <span>Live Countdown</span>
                  </span>
                )}

                {/* Recurrence Indicator */}
                {recurrence !== "none" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    <span className="capitalize">{recurrence}</span>
                  </span>
                )}
              </div>
            </div>

            {/* ─── BIG DIGIT FLIP CARDS GRID ─── */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 my-6">
              {/* DAYS */}
              <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-gray-50/90 dark:bg-black/40 border border-gray-200/80 dark:border-white/10 backdrop-blur-md shadow-xs dark:shadow-inner group hover:border-blue-400 dark:hover:border-white/20 transition-all">
                <span className={`text-4xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight ${currentTheme.digitColor}`}>
                  {String(timeRemaining.days).padStart(2, "0")}
                </span>
                <span className={`mt-2 text-xs sm:text-sm font-bold tracking-wider uppercase ${currentTheme.labelColor}`}>
                  Days
                </span>
                {workingDaysOnly && (
                  <span className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ({activeBusinessDaysInfo.businessDays} business days)
                  </span>
                )}
              </div>

              {/* HOURS */}
              <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-gray-50/90 dark:bg-black/40 border border-gray-200/80 dark:border-white/10 backdrop-blur-md shadow-xs dark:shadow-inner group hover:border-blue-400 dark:hover:border-white/20 transition-all">
                <span className={`text-4xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight ${currentTheme.digitColor}`}>
                  {String(timeRemaining.hours).padStart(2, "0")}
                </span>
                <span className={`mt-2 text-xs sm:text-sm font-bold tracking-wider uppercase ${currentTheme.labelColor}`}>
                  Hours
                </span>
              </div>

              {/* MINUTES */}
              <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-gray-50/90 dark:bg-black/40 border border-gray-200/80 dark:border-white/10 backdrop-blur-md shadow-xs dark:shadow-inner group hover:border-blue-400 dark:hover:border-white/20 transition-all">
                <span className={`text-4xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight ${currentTheme.digitColor}`}>
                  {String(timeRemaining.minutes).padStart(2, "0")}
                </span>
                <span className={`mt-2 text-xs sm:text-sm font-bold tracking-wider uppercase ${currentTheme.labelColor}`}>
                  Minutes
                </span>
              </div>

              {/* SECONDS (+ optional Milliseconds) */}
              <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-gray-50/90 dark:bg-black/40 border border-gray-200/80 dark:border-white/10 backdrop-blur-md shadow-xs dark:shadow-inner group hover:border-blue-400 dark:hover:border-white/20 transition-all relative">
                <div className="flex items-baseline">
                  <span className={`text-4xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight ${currentTheme.digitColor}`}>
                    {String(timeRemaining.seconds).padStart(2, "0")}
                  </span>
                  {showMilliseconds && (
                    <span className="text-xl sm:text-2xl font-mono text-cyan-600 dark:text-cyan-400 font-bold ml-1">
                      .{String(timeRemaining.milliseconds).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <span className={`mt-2 text-xs sm:text-sm font-bold tracking-wider uppercase ${currentTheme.labelColor}`}>
                  Seconds
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10 mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-2">
                <span>Timeline Elapsed Progress</span>
                <span className="font-mono font-semibold">{timeRemaining.progressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentTheme.progressBar} transition-all duration-300`}
                  style={{ width: `${timeRemaining.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Unit Total Stats Banner */}
            <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs text-gray-600 dark:text-gray-300 bg-gray-50/90 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5">
              <div>
                <span className="block font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {timeRemaining.totalDays.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Total Days</span>
              </div>
              <div>
                <span className="block font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {timeRemaining.totalHours.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Total Hours</span>
              </div>
              <div>
                <span className="block font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {timeRemaining.totalMinutes.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Total Minutes</span>
              </div>
              <div>
                <span className="block font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {timeRemaining.totalSeconds.toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Total Seconds</span>
              </div>
            </div>

            {/* Action Bar Beneath Display */}
            <div className="relative z-10 mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportIcs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white border border-gray-200/80 dark:border-transparent text-xs font-semibold transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                <button
                  onClick={handleExportPng}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white border border-gray-200/80 dark:border-transparent text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Export Image (PNG)</span>
                </button>

                <button
                  onClick={() => setShowEmbedModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white border border-gray-200/80 dark:border-transparent text-xs font-semibold transition-colors"
                >
                  <Code className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                  <span>Embed</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerConfetti()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 hover:from-amber-500/20 hover:to-rose-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/40 dark:border-amber-500/30 text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Celebrate!</span>
                </button>

                <button
                  onClick={() => setShowSettingsDrawer((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${showSettingsDrawer
                      ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white shadow-md shadow-blue-500/20"
                      : "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white border border-gray-200/80 dark:border-transparent"
                    }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showSettingsDrawer ? "Close Customizer" : "Customize & Tune"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── CUSTOMIZATION DRAWER / ACCORDION ─── */}
          {showSettingsDrawer && (
            <div className="p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Customize Countdown Settings
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Event Title & Emoji */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Event Title &amp; Emoji
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      maxLength={4}
                      className="w-14 text-center text-xl p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                      title="Emoji Icon"
                    />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                      placeholder="e.g. Wedding Day"
                    />
                  </div>
                  {/* Quick Emoji Buttons */}
                  <div className="flex gap-1.5 pt-1">
                    {["🎉", "🎆", "🎄", "💍", "🏖️", "🚀", "🎂", "🎓", "✈️"].map((em) => (
                      <button
                        key={em}
                        onClick={() => setEmoji(em)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm transition-transform active:scale-90"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Date & Time */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Target Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={targetDateStr}
                    onChange={(e) => setTargetDateStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                  {/* Quick adjust buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      onClick={() => adjustTargetDate(1)}
                      className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      +1 Day
                    </button>
                    <button
                      onClick={() => adjustTargetDate(7)}
                      className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      +1 Week
                    </button>
                    <button
                      onClick={() => adjustTargetDate(30)}
                      className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      +1 Month
                    </button>
                    <button
                      onClick={() => adjustTargetDate(365)}
                      className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      +1 Year
                    </button>
                  </div>
                </div>

                {/* Target Timezone */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Target Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    {WORLD_TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label} ({tz.offset})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500">
                    Computes target relative to chosen world timezone.
                  </p>
                </div>

                {/* Designer Theme Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Designer Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => setThemeId(th.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${themeId === th.id
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-xs"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: th.previewColor }}
                        />
                        <span className="truncate">{th.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio Alert Chime */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Alert Chime on Finish
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={soundAlert}
                      onChange={(e) => setSoundAlert(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="chime">Harmonic Chime</option>
                      <option value="fanfare">Triumphant Fanfare</option>
                      <option value="bowl">Zen Tibetan Bowl</option>
                      <option value="digital">Digital Pulse</option>
                      <option value="bell">Modern Bell</option>
                      <option value="harp">Celestial Harp</option>
                      <option value="none">Mute (No Sound)</option>
                    </select>
                    {soundAlert !== "none" && (
                      <button
                        onClick={handleTestSound}
                        className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold"
                        title="Test sound"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Recurrence Repeat */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Recurrence Interval
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    <option value="none">None (One-time event)</option>
                    <option value="yearly">Yearly (Birthdays, Anniversaries, New Year)</option>
                    <option value="monthly">Monthly (Billing, Invoices, Rent)</option>
                    <option value="weekly">Weekly (Sprint Reviews, Weekends)</option>
                  </select>
                </div>
              </div>

              {/* Toggles Row */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMilliseconds}
                    onChange={(e) => setShowMilliseconds(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                      Show Milliseconds
                    </span>
                    <span className="text-xs text-gray-500">Live high-speed tenths ticking</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workingDaysOnly}
                    onChange={(e) => setWorkingDaysOnly(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                      Show Working Days
                    </span>
                    <span className="text-xs text-gray-500">Excludes Saturday &amp; Sunday</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confettiEnabled}
                    onChange={(e) => setConfettiEnabled(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                      Confetti Blast
                    </span>
                    <span className="text-xs text-gray-500">Celebration explosion on zero</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: DAYS UNTIL & BUSINESS DAYS CALCULATOR
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "days-until" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>Days Until &amp; Date Duration Calculator</span>
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Calculate total calendar days, working/business days, full weeks, and exact elapsed percentages between any two dates.
              </p>
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Start Date (From)
                </label>
                <input
                  type="date"
                  value={calcStartDate}
                  onChange={(e) => setCalcStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <button
                  onClick={() => {
                    const today = new Date();
                    setCalcStartDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Set to Today
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Target Date (To)
                </label>
                <input
                  type="date"
                  value={calcTargetDate}
                  onChange={(e) => setCalcTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const nextYear = new Date().getFullYear() + 1;
                      setCalcTargetDate(`${nextYear}-01-01`);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    New Year
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    onClick={() => {
                      const curYear = new Date().getFullYear();
                      setCalcTargetDate(`${curYear}-12-25`);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Christmas
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Weekend Schedule
                </label>
                <select
                  value={weekendMode}
                  onChange={(e) => setWeekendMode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="sat-sun">Saturday &amp; Sunday (Standard 5-day)</option>
                  <option value="fri-sat">Friday &amp; Saturday (Middle East)</option>
                  <option value="sun-only">Sunday Only (6-day work week)</option>
                </select>
                <p className="text-[11px] text-gray-500">
                  Controls business day exclusion logic.
                </p>
              </div>
            </div>

            {/* ─── Hero Results Display Banner ─── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-purple-50/80 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-blue-200 dark:border-blue-500/30 text-gray-900 dark:text-white relative overflow-hidden shadow-sm dark:shadow-none">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    {daysUntilReport.isPast ? "Days Since Target Date" : "Days Remaining Until Target"}
                  </span>
                  <div className="flex items-baseline justify-center md:justify-start gap-3 mt-1">
                    <span className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-gray-900 dark:text-white">
                      {daysUntilReport.absDays.toLocaleString()}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-200">
                      Calendar Days
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-blue-200/80">
                    Target falls on <strong className="text-gray-900 dark:text-white">{daysUntilReport.targetDayName}</strong> (Day {daysUntilReport.dayOfYear} of {daysUntilReport.totalDaysInYear}, {daysUntilReport.percentOfYear}% of year).
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <div className="px-5 py-3 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-md border border-gray-200/80 dark:border-white/10 text-center shadow-xs dark:shadow-none">
                    <span className="block text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-300">
                      {daysUntilReport.businessDays.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Working / Business Days</span>
                  </div>
                  <div className="px-5 py-2.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-center shadow-xs dark:shadow-none">
                    <span className="block text-lg font-bold font-mono text-indigo-600 dark:text-indigo-200">
                      {daysUntilReport.weeks} wks, {daysUntilReport.remDays} days
                    </span>
                    <span className="text-[11px] text-gray-600 dark:text-gray-300">Full Weeks Equivalent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-center">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  Business Days
                </span>
                <span className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                  {daysUntilReport.businessDays}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Mon-Fri (Working)</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-center">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  Weekend Days
                </span>
                <span className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                  {daysUntilReport.weekendDays}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Sat &amp; Sun rest</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-center">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  Work Hours (8h/d)
                </span>
                <span className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                  {(daysUntilReport.businessDays * 8).toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Estimated sprint</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-center">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  Total Hours
                </span>
                <span className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                  {daysUntilReport.totalHours.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Clock hours</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-center">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  Total Minutes
                </span>
                <span className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                  {daysUntilReport.totalMinutes.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Elapsed mins</span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 text-center">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                  Total Seconds
                </span>
                <span className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                  {daysUntilReport.totalSeconds.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Full seconds</span>
              </div>
            </div>

            {/* ─── ADD/SUBTRACT DAYS TO DATE CALCULATOR ─── */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Calculate Target Date by Adding/Subtracting Days</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Number of Days to Add (+) or Subtract (-)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={addDaysInput}
                      onChange={(e) => setAddDaysInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Day Counting Mode
                  </label>
                  <select
                    value={addDaysType}
                    onChange={(e) => setAddDaysType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    <option value="calendar">Calendar Days (All consecutive days)</option>
                    <option value="business">Business Days Only (Skips weekends)</option>
                  </select>
                </div>

                {/* Result Pill */}
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block uppercase">
                    Resulting Target Date
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
                    {addDaysResult}
                  </span>
                </div>
              </div>

              {/* Quick Presets for Days Addition */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-gray-500 font-medium">Quick Jumps:</span>
                {[
                  { label: "+14 Days (2 Wks)", val: 14 },
                  { label: "+30 Days (1 Mo)", val: 30 },
                  { label: "+60 Days (2 Mo)", val: 60 },
                  { label: "+90 Days (Quarter)", val: 90 },
                  { label: "+100 Business Days", val: 100, type: "business" },
                  { label: "+180 Days (Half Year)", val: 180 },
                  { label: "+365 Days (1 Yr)", val: 365 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setAddDaysInput(item.val);
                      if (item.type) setAddDaysType(item.type);
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 text-gray-700 dark:text-gray-300 transition-colors shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 3: PRESETS LIBRARY (1-CLICK LOAD)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "presets" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <span>Countdown Presets &amp; Milestone Catalog</span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                1-Click launch upcoming holidays, seasonal solstices, and personal life milestones.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              {["All", "Holidays", "Seasons", "Milestones", "Personal"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPresetCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${presetCategory === cat
                      ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Presets Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets
              .filter((p) => presetCategory === "All" || p.category === presetCategory)
              .map((p) => {
                const now = new Date();
                const diffMs = p.targetDate.getTime() - now.getTime();
                const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl p-2 rounded-xl bg-gray-50 dark:bg-gray-800">{p.emoji}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {p.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {p.description}
                      </p>
                      <div className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-300">
                        {p.targetDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {daysLeft > 0 ? `${daysLeft} Days Left` : "Happening Today!"}
                      </span>
                      <button
                        onClick={() => applyPreset(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          FULLSCREEN ZEN / PRESENTATION PROJECTION MODE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{emoji}</span>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{title}</h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  {new Date(targetDateStr).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit Fullscreen [Esc]</span>
            </button>
          </div>

          {/* Gigantic Digits Center */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-6xl mx-auto w-full my-auto">
            <div className="p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl">
              <span className="text-6xl sm:text-8xl lg:text-9xl font-black font-mono tracking-tight text-white block">
                {String(timeRemaining.days).padStart(2, "0")}
              </span>
              <span className="text-sm sm:text-base font-bold tracking-widest uppercase text-blue-300 mt-2 block">
                Days
              </span>
            </div>

            <div className="p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl">
              <span className="text-6xl sm:text-8xl lg:text-9xl font-black font-mono tracking-tight text-white block">
                {String(timeRemaining.hours).padStart(2, "0")}
              </span>
              <span className="text-sm sm:text-base font-bold tracking-widest uppercase text-blue-300 mt-2 block">
                Hours
              </span>
            </div>

            <div className="p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl">
              <span className="text-6xl sm:text-8xl lg:text-9xl font-black font-mono tracking-tight text-white block">
                {String(timeRemaining.minutes).padStart(2, "0")}
              </span>
              <span className="text-sm sm:text-base font-bold tracking-widest uppercase text-blue-300 mt-2 block">
                Minutes
              </span>
            </div>

            <div className="p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl">
              <div className="flex items-baseline justify-center">
                <span className="text-6xl sm:text-8xl lg:text-9xl font-black font-mono tracking-tight text-cyan-300">
                  {String(timeRemaining.seconds).padStart(2, "0")}
                </span>
                {showMilliseconds && (
                  <span className="text-3xl font-mono text-cyan-400 ml-1">
                    .{String(timeRemaining.milliseconds).padStart(2, "0")}
                  </span>
                )}
              </div>
              <span className="text-sm sm:text-base font-bold tracking-widest uppercase text-blue-300 mt-2 block">
                Seconds
              </span>
            </div>
          </div>

          {/* Bottom Fullscreen Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/10 pt-4">
            <span>ToolsTrek High-Precision Presentation Countdown</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => triggerConfetti()}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Celebrate</span>
              </button>
              <span>Press [F] or [Esc] to exit</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          EMBED CODE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Embed Countdown Widget
                </h3>
              </div>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Copy and paste this clean HTML snippet into your Notion page, Obsidian notebook, WordPress blog, or web application.
            </p>

            <textarea
              readOnly
              rows={4}
              value={`<iframe src="${generateShareUrl()}" width="100%" height="450" frameborder="0" style="border-radius: 16px; overflow: hidden;" title="${title} Countdown"></iframe>`}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono text-gray-900 dark:text-white select-all"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<iframe src="${generateShareUrl()}" width="100%" height="450" frameborder="0" style="border-radius: 16px; overflow: hidden;" title="${title} Countdown"></iframe>`
                  );
                  toast.success("Embed HTML snippet copied!");
                  setShowEmbedModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
              >
                Copy Embed Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          EDUCATIONAL / SEO DOCUMENTATION & FAQ SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 space-y-12">
        {/* Key Features Overview */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Why Choose ToolsTrek Countdown Timer &amp; Days Until Calculator?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Drift-Free Precision
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Unlike standard `setInterval` scripts throttled by browsers in background tabs, ToolsTrek continuously benchmarks absolute timestamp deltas (`Date.now()`), ensuring exact frame-perfect synchronization down to the millisecond.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Working &amp; Business Days
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Project managers and teams can isolate true working days, skip custom weekend models (Mon-Fri or Sun-Thu), and compute exact billable 8-hour sprint work hours between any two milestone dates.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-3">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Shareable &amp; Export Ready
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Generate live synchronized URLs, download RFC 5545 `.ics` calendar events for Google and Apple Calendar, export high-res PNG visual cards, or embed the live clock directly in Notion and websites.
              </p>
            </div>
          </div>
        </div>

        {/* Calculation Methodology Guide */}
        <div className="p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>How the Days Until &amp; Business Days Formula Operates</span>
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              <strong>1. Calendar Days vs. Business Days:</strong> A calendar day count represents all 24-hour periods elapsed between two dates ($D = \lfloor \Delta T / 86,400,000 \rfloor$). In contrast, a <em>business day calculation</em> iterates through each date in the interval, evaluating the day of the week via ISO-8601 definitions. Saturdays and Sundays are excluded (or Friday/Saturday depending on your chosen regional weekend format).
            </p>
            <p>
              <strong>2. Timezone Normalization:</strong> Universal Coordinated Time (UTC) and IANA timezone offsets are evaluated against target timestamps, guaranteeing that daylight saving time shifts (e.g. EST to EDT) do not disrupt countdown accuracy.
            </p>
            <p>
              <strong>3. Count-Up Mode:</strong> When the countdown reaches $0$, ToolsTrek seamlessly transitions into positive delta accumulation ($| \Delta T |$), displaying the elapsed time since the historical event took place.
            </p>
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {COUNTDOWN_FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ToolPageShell>
  );
}
