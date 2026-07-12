"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  ArrowRightLeft,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Sparkles,
  History,
  Trash2,
  Share2,
  Info,
  Zap,
  Timer,
  CalendarDays,
  AlarmClock,
  Hash,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ToolPageShell from "./ToolPageShell";

// ─────────────────────────────────────────────────────────────
//  Conversion config
// ─────────────────────────────────────────────────────────────
const TIME_UNITS = [
  { key: "ns",  label: "Nanosecond",   symbol: "ns",  toSeconds: 1e-9 },
  { key: "us",  label: "Microsecond",  symbol: "µs",  toSeconds: 1e-6 },
  { key: "ms",  label: "Millisecond",  symbol: "ms",  toSeconds: 0.001 },
  { key: "s",   label: "Second",       symbol: "s",   toSeconds: 1 },
  { key: "min", label: "Minute",       symbol: "min", toSeconds: 60 },
  { key: "h",   label: "Hour",         symbol: "h",   toSeconds: 3600 },
  { key: "d",   label: "Day",          symbol: "d",   toSeconds: 86400 },
  { key: "wk",  label: "Week",         symbol: "wk",  toSeconds: 604800 },
  { key: "mo",  label: "Month (avg)",  symbol: "mo",  toSeconds: 2629800 },
  { key: "yr",  label: "Year",         symbol: "yr",  toSeconds: 31557600 },
  { key: "dec", label: "Decade",       symbol: "dec", toSeconds: 315576000 },
  { key: "cen", label: "Century",      symbol: "cen", toSeconds: 3155760000 },
];

const UNIT_MAP = Object.fromEntries(TIME_UNITS.map((u) => [u.key, u]));

function convertTime(value, from, to) {
  if (!value || isNaN(value)) return "";
  const inSeconds = parseFloat(value) * UNIT_MAP[from].toSeconds;
  const result = inSeconds / UNIT_MAP[to].toSeconds;
  if (Math.abs(result) >= 1e15 || (Math.abs(result) < 1e-10 && result !== 0)) {
    return result.toExponential(6);
  }
  if (Number.isInteger(result)) return result.toString();
  return parseFloat(result.toPrecision(10)).toString();
}

// ─────────────────────────────────────────────────────────────
//  Popular quick-converts
// ─────────────────────────────────────────────────────────────
const POPULAR = [
  { label: "Min → Sec",  from: "min", to: "s",   amount: "1" },
  { label: "Hr → Min",   from: "h",   to: "min", amount: "1" },
  { label: "Hr → Sec",   from: "h",   to: "s",   amount: "1" },
  { label: "Day → Hr",   from: "d",   to: "h",   amount: "1" },
  { label: "Sec → Min",  from: "s",   to: "min", amount: "60" },
  { label: "Week → Day", from: "wk",  to: "d",   amount: "1" },
];

// ─────────────────────────────────────────────────────────────
//  Custom Dropdown
// ─────────────────────────────────────────────────────────────
function TimeUnitDropdown({ value, onChange, id, label }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  const selected = UNIT_MAP[value];
  const filtered = TIME_UNITS.filter(
    (u) =>
      u.label.toLowerCase().includes(search.toLowerCase()) ||
      u.symbol.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </span>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border border-border bg-muted/50 hover:bg-muted text-foreground font-semibold text-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brandColor/40"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-brandColor/10 text-brandColor font-bold text-xs shrink-0">
            {selected?.symbol}
          </span>
          <span className="truncate">{selected?.label}</span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full min-w-[220px] rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
          >
            {/* Search bar */}
            <div className="p-2 border-b border-border bg-muted/30">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search units…"
                className="w-full px-3 py-1.5 text-sm rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-brandColor/40 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {/* Options list */}
            <ul
              role="listbox"
              className="max-h-60 overflow-y-auto py-1"
              style={{ scrollbarWidth: "thin" }}
            >
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                  No units found
                </li>
              )}
              {filtered.map((u) => {
                const isActive = u.key === value;
                return (
                  <li
                    key={u.key}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      onChange(u.key);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors duration-150 ${
                      isActive
                        ? "bg-brandColor/10 text-brandColor font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-8 h-7 rounded-lg text-xs font-bold shrink-0 ${
                        isActive
                          ? "bg-brandColor text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {u.symbol}
                    </span>
                    <span>{u.label}</span>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 ml-auto shrink-0" />
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────
export default function TimeConverter() {
  const [fromUnit, setFromUnit] = useState("min");
  const [toUnit, setToUnit] = useState("s");
  const [amount, setAmount] = useState("1");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recent, setRecent] = useState([]);
  const [multiOutput, setMultiOutput] = useState([]);

  // Main conversion
  useEffect(() => {
    if (amount === "" || amount === "-" || amount === ".") {
      setOutput("");
      return;
    }
    setOutput(convertTime(amount, fromUnit, toUnit));
  }, [amount, fromUnit, toUnit]);

  // Multi-unit conversion for advanced panel
  useEffect(() => {
    if (!showAdvanced || !amount || isNaN(parseFloat(amount))) {
      setMultiOutput([]);
      return;
    }
    const results = TIME_UNITS.filter((u) => u.key !== fromUnit).map((u) => ({
      ...u,
      result: convertTime(amount, fromUnit, u.key),
    }));
    setMultiOutput(results);
  }, [amount, fromUnit, showAdvanced]);

  // Load recent from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("toolstrek_time_recent");
      if (saved) setRecent(JSON.parse(saved));
    } catch (_) {}
  }, []);

  // Save recent conversion
  useEffect(() => {
    if (!amount || !output || isNaN(parseFloat(amount))) return;
    const timer = setTimeout(() => {
      const record = {
        id: Date.now(),
        fromUnit,
        toUnit,
        amount,
        output,
        fromLabel: UNIT_MAP[fromUnit]?.label,
        toLabel: UNIT_MAP[toUnit]?.label,
        fromSymbol: UNIT_MAP[fromUnit]?.symbol,
        toSymbol: UNIT_MAP[toUnit]?.symbol,
      };
      setRecent((prev) => {
        const deduped = [
          record,
          ...prev.filter(
            (r) =>
              !(
                r.fromUnit === fromUnit &&
                r.toUnit === toUnit &&
                r.amount === amount
              )
          ),
        ].slice(0, 6);
        try {
          localStorage.setItem(
            "toolstrek_time_recent",
            JSON.stringify(deduped)
          );
        } catch (_) {}
        return deduped;
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [amount, output, fromUnit, toUnit]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleClear = () => {
    setAmount("");
    setOutput("");
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator
        .share({
          title: "Time Converter – Toolstrek",
          text: `I converted ${amount} ${UNIT_MAP[fromUnit]?.label} = ${output} ${UNIT_MAP[toUnit]?.label} using Toolstrek!`,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handlePopular = (p) => {
    setFromUnit(p.from);
    setToUnit(p.to);
    setAmount(p.amount);
  };

  const handleRecentClick = (r) => {
    setFromUnit(r.fromUnit);
    setToUnit(r.toUnit);
    setAmount(r.amount);
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem("toolstrek_time_recent");
    } catch (_) {}
  };

  const fromU = UNIT_MAP[fromUnit];
  const toU = UNIT_MAP[toUnit];

  const formulaRatio =
    fromU && toU
      ? parseFloat(
          (fromU.toSeconds / toU.toSeconds).toPrecision(6)
        ).toString()
      : "";

  const inputSeconds = parseFloat(amount) * (fromU?.toSeconds || 1);

  function humanBreakdown(totalSeconds) {
    const s = Math.abs(totalSeconds);
    const sign = totalSeconds < 0 ? "-" : "";
    const years   = Math.floor(s / 31557600);
    const days    = Math.floor((s % 31557600) / 86400);
    const hours   = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const secs    = Math.floor(s % 60);
    const ms      = Math.round((s % 1) * 1000);
    const parts = [];
    if (years)   parts.push(`${years}yr`);
    if (days)    parts.push(`${days}d`);
    if (hours)   parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}min`);
    if (secs)    parts.push(`${secs}s`);
    if (ms && parts.length === 0) parts.push(`${ms}ms`);
    return parts.length > 0 ? sign + parts.join(" ") : "0s";
  }

  const humanReadable =
    !isNaN(inputSeconds) && amount ? humanBreakdown(inputSeconds) : null;

  return (
    <ToolPageShell widthClassName="max-w-4xl" className="py-8 px-4">
      {/* ── Header ── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brandColor/10 border border-brandColor/20 text-brandColor text-xs font-bold uppercase tracking-widest mb-4">
          <Clock className="w-3.5 h-3.5" />
          Time Converter
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
          Convert{" "}
          <span className="bg-gradient-to-r from-brandColor to-violet-500 bg-clip-text text-transparent">
            Time Units
          </span>
        </h1>
        <p className="text-muted-foreground text-md md:text-lg max-w-xl mx-auto">
          Instantly convert between nanoseconds, seconds, minutes, hours, days,
          weeks, months, years, and more.
        </p>
      </div>

      {/* ── Quick Presets ── */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {POPULAR.map((p) => (
          <button
            key={p.label}
            onClick={() => handlePopular(p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
              fromUnit === p.from && toUnit === p.to
                ? "bg-brandColor text-white border-brandColor shadow-md shadow-brandColor/25"
                : "bg-card hover:bg-muted border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-3 h-3" />
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Main Converter Card ── */}
      <div className="relative bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/20 dark:shadow-none mb-6">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-brandColor/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
          {/* FROM */}
          <div className="space-y-3">
            <TimeUnitDropdown
              id="fromUnit"
              label="From Unit"
              value={fromUnit}
              onChange={setFromUnit}
            />
            <div>
              <label
                htmlFor="fromAmount"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5"
              >
                Value
              </label>
              <div className="relative">
                <input
                  id="fromAmount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || v === "-" || /^-?\d*\.?\d*$/.test(v))
                      setAmount(v);
                  }}
                  placeholder="Enter value…"
                  className="w-full px-4 py-3.5 pr-14 text-2xl font-black rounded-2xl border border-border bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-brandColor/40 transition-all placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:text-base"
                />
                {fromU && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg pointer-events-none">
                    {fromU.symbol}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Swap */}
          <div className="flex flex-row md:flex-col items-center justify-center gap-2 md:pb-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={handleSwap}
              id="swapUnitsBtn"
              className="p-3 rounded-2xl bg-brandColor/10 hover:bg-brandColor text-brandColor hover:text-white border border-brandColor/20 hover:border-brandColor transition-all duration-200 cursor-pointer shadow-sm"
              title="Swap units"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </motion.button>
          </div>

          {/* TO */}
          <div className="space-y-3">
            <TimeUnitDropdown
              id="toUnit"
              label="To Unit"
              value={toUnit}
              onChange={setToUnit}
            />
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Result
              </label>
              <div className="relative">
                <div
                  className={`w-full px-4 py-3.5 pr-14 text-2xl font-black rounded-2xl border transition-all duration-300 min-h-[60px] flex items-center ${
                    output
                      ? "border-brandColor/40 bg-brandColor/5 text-brandColor"
                      : "border-border bg-muted/20 text-muted-foreground"
                  }`}
                >
                  <span className="break-all">
                    {output || (
                      <span className="text-base font-normal opacity-40">
                        —
                      </span>
                    )}
                  </span>
                </div>
                {toU && output && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold bg-brandColor/10 text-brandColor px-2 py-1 rounded-lg pointer-events-none">
                    {toU.symbol}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formula + breakdown pills */}
        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-5 flex flex-wrap items-center gap-2"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted/60 border border-border text-xs text-muted-foreground font-mono flex-wrap">
                <Info className="w-3.5 h-3.5 shrink-0 text-brandColor" />
                <span>
                  1 {fromU?.label} ={" "}
                  <strong className="text-foreground">{formulaRatio}</strong>{" "}
                  {toU?.label}
                </span>
              </div>
              {humanReadable && fromUnit !== "s" && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-500/8 border border-violet-500/20 text-xs text-violet-600 dark:text-violet-400 font-medium">
                  <Timer className="w-3.5 h-3.5 shrink-0" />
                  <span>{humanReadable}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            id="copyResultBtn"
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            id="clearInputBtn"
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
          <button
            id="shareResultBtn"
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            {copiedShare ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            {copiedShare ? "Copied link!" : "Share"}
          </button>
        </div>
      </div>

      {/* ── Advanced Options ── */}
      <div className="mb-6">
        <button
          id="toggleAdvancedBtn"
          onClick={() => setShowAdvanced((p) => !p)}
          className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl border border-border bg-card hover:bg-muted/50 text-foreground font-semibold transition-all duration-200 cursor-pointer group"
        >
          <span className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-brandColor" />
            Advanced Options
            <span className="text-xs text-muted-foreground font-normal hidden sm:inline">
              — multi-unit table, breakdown, precision control
            </span>
          </span>
          <motion.span
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="text-muted-foreground group-hover:text-foreground shrink-0"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.span>
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-5">
                {/* Multi-unit table */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                    <Hash className="w-4 h-4 text-brandColor" />
                    All Units at Once
                    {amount && fromU && (
                      <span className="ml-auto text-xs font-normal text-muted-foreground">
                        {amount} {fromU.label} =
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-3">
                    Click any row to set it as the target unit.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {multiOutput.map((u) => (
                      <div
                        key={u.key}
                        onClick={() => setToUnit(u.key)}
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all duration-150 ${
                          toUnit === u.key
                            ? "border-brandColor/50 bg-brandColor/8 text-brandColor"
                            : "border-border bg-muted/30 hover:bg-muted text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-6 rounded-lg text-xs font-bold shrink-0 ${
                              toUnit === u.key
                                ? "bg-brandColor text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {u.symbol}
                          </span>
                          <span className="truncate">{u.label}</span>
                        </span>
                        <span className="font-mono text-sm font-semibold shrink-0 max-w-[130px] truncate text-right">
                          {u.result || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Human-readable breakdown */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                    Human-Readable Breakdown
                  </h2>
                  {humanReadable && !isNaN(inputSeconds) ? (
                    <div className="flex flex-wrap gap-3">
                      {(() => {
                        const s = Math.abs(inputSeconds);
                        const years   = Math.floor(s / 31557600);
                        const days    = Math.floor((s % 31557600) / 86400);
                        const hours   = Math.floor((s % 86400) / 3600);
                        const minutes = Math.floor((s % 3600) / 60);
                        const secs    = Math.floor(s % 60);
                        const ms      = Math.round((s % 1) * 1000);
                        return [
                          { label: "Years",    value: years,   icon: CalendarDays },
                          { label: "Days",     value: days,    icon: CalendarDays },
                          { label: "Hours",    value: hours,   icon: Clock },
                          { label: "Minutes",  value: minutes, icon: AlarmClock },
                          { label: "Seconds",  value: secs,    icon: Timer },
                          { label: "Millisec", value: ms,      icon: Zap },
                        ]
                          .filter((item) => item.value > 0)
                          .map(({ label, value, icon: Icon }) => (
                            <div
                              key={label}
                              className="flex flex-col items-center justify-center px-5 py-4 rounded-2xl bg-muted/60 border border-border min-w-[90px] text-center"
                            >
                              <Icon className="w-4 h-4 text-brandColor mb-1" />
                              <span className="text-2xl font-black text-foreground">
                                {value.toLocaleString()}
                              </span>
                              <span className="text-xs text-muted-foreground mt-0.5">
                                {label}
                              </span>
                            </div>
                          ));
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter a value above to see the breakdown.
                    </p>
                  )}
                </div>

                {/* Precision control */}
                <PrecisionPanel
                  amount={amount}
                  fromUnit={fromUnit}
                  toUnit={toUnit}
                />

                {/* Quick reference table */}
                <QuickReferenceTable />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Recent Conversions ── */}
      {recent.length > 0 && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <History className="w-4 h-4 text-brandColor" />
              Recent Conversions
            </h2>
            <button
              onClick={clearRecent}
              id="clearRecentBtn"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {recent.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRecentClick(r)}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-border bg-muted/30 hover:bg-muted text-sm text-left transition-all duration-150 cursor-pointer group w-full"
              >
                <span className="text-muted-foreground group-hover:text-foreground transition-colors min-w-0 truncate">
                  <span className="font-semibold text-foreground">
                    {r.amount}
                  </span>{" "}
                  {r.fromLabel}
                </span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors text-right min-w-0 truncate">
                  <span className="font-semibold text-brandColor">
                    {r.output}
                  </span>{" "}
                  {r.toLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </ToolPageShell>
  );
}

// ─────────────────────────────────────────────────────────────
//  Precision Panel
// ─────────────────────────────────────────────────────────────
function PrecisionPanel({ amount, fromUnit, toUnit }) {
  const [precision, setPrecision] = useState(6);
  const fromU = UNIT_MAP[fromUnit];
  const toU   = UNIT_MAP[toUnit];

  const val = parseFloat(amount);
  const raw =
    !isNaN(val) && fromU && toU
      ? (val * fromU.toSeconds) / toU.toSeconds
      : null;

  const formatted =
    raw !== null
      ? Number.isInteger(raw)
        ? raw.toLocaleString()
        : raw.toFixed(precision)
      : "—";

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
        <Sparkles className="w-4 h-4 text-amber-500" />
        Precision Control
      </h2>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground font-medium block mb-1">
            Decimal places:{" "}
            <strong className="text-foreground">{precision}</strong>
          </label>
          <input
            type="range"
            min={0}
            max={15}
            value={precision}
            onChange={(e) => setPrecision(Number(e.target.value))}
            className="w-full accent-[#7c00fe] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>15</span>
          </div>
        </div>
        <div className="flex-1 px-5 py-4 rounded-2xl bg-muted/60 border border-border">
          <p className="text-xs text-muted-foreground mb-1 font-medium">
            {amount || "—"} {fromU?.label} =
          </p>
          <p className="text-lg font-black text-foreground font-mono break-all">
            {formatted}
            {raw !== null && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {toU?.label}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Quick Reference Table
// ─────────────────────────────────────────────────────────────
const REFERENCE_ROWS = [
  { from: "1 minute",    to: "60 seconds" },
  { from: "1 hour",      to: "60 minutes = 3,600 seconds" },
  { from: "1 day",       to: "24 hours = 1,440 min = 86,400 sec" },
  { from: "1 week",      to: "7 days = 168 hours = 604,800 sec" },
  { from: "1 month",     to: "≈ 30.44 days = ≈ 2,629,800 sec" },
  { from: "1 year",      to: "365.25 days = 8,766 hours = 31,557,600 sec" },
  { from: "1 decade",    to: "10 years = ≈ 315,576,000 sec" },
  { from: "1 century",   to: "100 years = ≈ 3,155,760,000 sec" },
  { from: "1 millisec",  to: "0.001 seconds = 1,000 microseconds" },
  { from: "1 microsec",  to: "0.000001 seconds = 1,000 nanoseconds" },
];

function QuickReferenceTable() {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
        <BookOpen className="w-4 h-4 text-emerald-500" />
        Quick Reference
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Unit
              </th>
              <th className="text-left py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Equivalent
              </th>
            </tr>
          </thead>
          <tbody>
            {REFERENCE_ROWS.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-2.5 pr-6 font-semibold text-foreground whitespace-nowrap">
                  {row.from}
                </td>
                <td className="py-2.5 text-muted-foreground font-mono text-xs">
                  {row.to}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
