"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import ToolPageShell from "../ToolPageShell";
import ReactCountryFlag from "react-country-flag";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Search,
  Check,
  ChevronDown,
  AlertCircle,
  Sparkles,
  Calculator,
  Banknote,
  Copy,
  RefreshCw,
  Globe,
  Zap,
  RotateCcw,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Data ────────────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", country: "US" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", country: "BD" },
  { code: "EUR", name: "Euro", symbol: "€", country: "FR" },
  { code: "GBP", name: "British Pound", symbol: "£", country: "GB" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "JP" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", country: "AU" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", country: "CA" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", country: "CH" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", country: "CN" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "IN" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SR", country: "SA" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", country: "AE" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", country: "PK" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$", country: "SG" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "$", country: "NZ" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$", country: "HK" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", country: "SE" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", country: "NO" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", country: "DK" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", country: "TR" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", country: "RU" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "BR" },
  { code: "ZAR", name: "South African Rand", symbol: "R", country: "ZA" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", country: "MX" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", country: "PH" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", country: "MY" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", country: "ID" },
  { code: "THB", name: "Thai Baht", symbol: "฿", country: "TH" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", country: "KR" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD", country: "KW" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD", country: "BH" },
  { code: "OMR", name: "Omani Rial", symbol: "OMR", country: "OM" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR", country: "QA" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", country: "EG" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", country: "LK" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs", country: "NP" },
];

const FALLBACK = {
  USD: 1,
  BDT: 120.45,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 157.3,
  AUD: 1.5,
  CAD: 1.37,
  CHF: 0.89,
  CNY: 7.25,
  INR: 83.5,
  SAR: 3.75,
  AED: 3.67,
  PKR: 278.5,
  SGD: 1.35,
  NZD: 1.63,
  HKD: 7.8,
  SEK: 10.5,
  NOK: 10.6,
  DKK: 6.87,
  TRY: 32.5,
  RUB: 89,
  BRL: 5.35,
  ZAR: 18.2,
  MXN: 18.4,
  PHP: 58.7,
  MYR: 4.71,
  IDR: 16400,
  THB: 36.7,
  KRW: 1380,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  QAR: 3.64,
  EGP: 47.8,
  LKR: 302,
  NPR: 133.6,
};

const MARKUP_FEES = [
  { id: "0", label: "0% — No markup (Interbank rate)", value: 0 },
  { id: "0.5", label: "0.5% — Online broker / Wise", value: 0.005 },
  { id: "1.0", label: "1.0% — Remittance platform", value: 0.01 },
  { id: "2.0", label: "2.0% — Standard credit card", value: 0.02 },
  { id: "3.0", label: "3.0% — Traditional bank transfer", value: 0.03 },
  { id: "5.0", label: "5.0% — Airport exchange kiosk", value: 0.05 },
];

const COMPARE_CODES = [
  "EUR",
  "GBP",
  "JPY",
  "INR",
  "AUD",
  "CAD",
  "SAR",
  "AED",
  "SGD",
  "PKR",
  "CNY",
  "CHF",
];

const NOTE_MAP = {
  USD: [100, 50, 20, 10, 5, 1],
  EUR: [200, 100, 50, 20, 10, 5],
  GBP: [50, 20, 10, 5],
  BDT: [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  INR: [500, 200, 100, 50, 20, 10],
  SAR: [500, 100, 50, 10, 5, 1],
  AED: [500, 200, 100, 50, 20, 10, 5],
  JPY: [10000, 5000, 1000],
};

const fmt = (n, d = 2) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

// ─── Currency Picker Modal ──────────────────────────────────────────────────
function CurrencyPicker({ label, value, open, onToggle, onSelect, wrapRef }) {
  const [q, setQ] = useState("");
  const filtered = q.trim()
    ? CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(q.toLowerCase()) ||
          c.name.toLowerCase().includes(q.toLowerCase()),
      )
    : CURRENCIES;

  return (
    <div ref={wrapRef}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
        {label}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brandColor/40 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all shadow-sm cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-6 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 shadow-sm">
            <ReactCountryFlag
              countryCode={value.country}
              svg
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </span>
          <div className="min-w-0 text-left">
            <p className="font-extrabold text-gray-900 dark:text-white text-sm leading-tight">
              {value.code}
              <span className="ml-2 text-gray-400 dark:text-gray-500 font-normal text-xs">
                {value.symbol}
              </span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {value.name}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-brandColor" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5 bg-gray-50 dark:bg-gray-800/60">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search currency…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-gray-800 dark:text-white placeholder-gray-400"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center py-6 text-xs text-gray-400">
                  No results
                </p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onSelect(c);
                      setQ("");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-800/60 last:border-0 ${
                      value.code === c.code
                        ? "bg-brandColor/5 dark:bg-brandColor/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-4.5 rounded overflow-hidden shadow-xs shrink-0">
                        <ReactCountryFlag
                          countryCode={c.country}
                          svg
                          style={{ objectFit: "cover" }}
                        />
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white text-sm">
                        {c.code}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {value.code === c.code && (
                        <Check className="w-3.5 h-3.5 text-brandColor" />
                      )}
                      <span className="text-xs font-semibold text-gray-400">
                        {c.symbol}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState(CURRENCIES[0]); // USD
  const [to, setTo] = useState(CURRENCIES[1]); // BDT
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  const [showAdv, setShowAdv] = useState(false);
  const [markup, setMarkup] = useState(MARKUP_FEES[0]);
  const [precision, setPrecision] = useState(2);

  const [rates, setRates] = useState(FALLBACK);
  const [isLive, setIsLive] = useState(false);
  const [lastUp, setLastUp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [swapDeg, setSwapDeg] = useState(0);
  const [copied, setCopied] = useState(false);

  // ── outside click ──────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target))
        setFromOpen(false);
      if (toRef.current && !toRef.current.contains(e.target)) setToOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── fetch rates ────────────────────────────────────────────────────────────
  const fetchRates = async (base) => {
    setLoading(true);
    setHasError(false);
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      const data = await res.json();
      if (data.result === "success") {
        setRates(data.rates);
        setIsLive(true);
        const d = new Date(data.time_last_update_utc);
        setLastUp(
          d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        );
      } else throw new Error();
    } catch {
      const usdRates = { ...FALLBACK };
      const baseToUsd = 1 / (usdRates[base] || 1);
      const r = {};
      Object.keys(usdRates).forEach((c) => (r[c] = usdRates[c] * baseToUsd));
      setRates(r);
      setIsLive(false);
      setHasError(true);
      setLastUp("offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(from.code);
  }, [from]);

  // ── calculations ───────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const raw = parseFloat(amount) || 0;
    const rawRate =
      rates[to.code] ?? FALLBACK[to.code] / FALLBACK[from.code] ?? 1;
    const netRate = rawRate * (1 - markup.value);
    const fee = raw * markup.value;
    return {
      raw,
      rawRate,
      netRate,
      converted: raw * netRate,
      fee,
      inverse: netRate > 0 ? 1 / netRate : 0,
    };
  }, [amount, to, rates, markup, from]);

  // ── historical mock ────────────────────────────────────────────────────────
  const history = useMemo(() => {
    const seed = `${from.code}-${to.code}`;
    let h = 0;
    for (let i = 0; i < seed.length; i++)
      h = seed.charCodeAt(i) + ((h << 5) - h);
    return Array.from({ length: 30 }, (_, i) => {
      const f = Math.sin(h + i * 0.6) * 0.02 + Math.cos(h - i * 0.4) * 0.01;
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        rate: calc.netRate * (1 + f),
        label: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      };
    });
  }, [from.code, to.code, calc.netRate]);

  const chart = useMemo(() => {
    const vals = history.map((d) => d.rate);
    const min = Math.min(...vals) * 0.997;
    const max = Math.max(...vals) * 1.003;
    const W = 560,
      H = 110;
    const pts = history.map((d, i) => {
      const x = (i / 29) * W;
      const y = H - ((d.rate - min) / (max - min || 1)) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const line = `M ${pts.join(" L ")}`;
    const trend = vals[29] >= vals[0] ? "up" : "down";
    return { line, area: `${line} L ${W},${H} L 0,${H} Z`, min, max, trend };
  }, [history]);

  // ── note breakdown ─────────────────────────────────────────────────────────
  const notes = useMemo(() => {
    const denoms = NOTE_MAP[to.code] || [100, 50, 20, 10, 5, 1];
    let rem = Math.floor(calc.converted);
    const rows = [];
    for (const d of denoms) {
      if (rem >= d) {
        rows.push({ d, n: Math.floor(rem / d) });
        rem %= d;
      }
    }
    return { rows, leftover: rem };
  }, [to.code, calc.converted]);

  // ── swap ───────────────────────────────────────────────────────────────────
  const handleSwap = () => {
    setSwapDeg((p) => p + 180);
    const tmp = from;
    setFrom(to);
    setTo(tmp);
  };

  // ── copy ───────────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${calc.raw} ${from.code} = ${calc.converted.toFixed(precision)} ${to.code} · Rate: 1 ${from.code} = ${calc.netRate.toFixed(4)} ${to.code}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ToolPageShell widthClassName="max-w-6xl">
      <div className="font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* ═══════════ OUTER SHELL CARD ═══════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden border border-gray-100 dark:border-gray-700/60">
          {/* ── GRADIENT HERO HEADER ── */}
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 px-6 py-8 sm:px-10 text-white overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left: title */}
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
                  <RefreshCw className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Currency Converter
                  </h1>
                  <p className="text-violet-200 mt-1 text-sm sm:text-base max-w-lg">
                    Live interbank rates · 36 major currencies · Bank markup
                    simulator · Cash note estimator
                  </p>
                </div>
              </div>

              {/* Right: live status pill */}
              <div
                className={`self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border backdrop-blur-sm cursor-pointer select-none transition-all ${
                  loading
                    ? "bg-white/10 border-white/20 text-white"
                    : hasError
                      ? "bg-amber-500/20 border-amber-400/40 text-amber-200"
                      : "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                }`}
                onClick={() => fetchRates(from.code)}
                title="Click to refresh rates"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    loading
                      ? "bg-white animate-pulse"
                      : hasError
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                />
                {loading
                  ? "Fetching rates…"
                  : isLive
                    ? `Live rates · updated ${lastUp}`
                    : "Offline mode · click to retry"}
              </div>
            </div>
          </div>

          {/* ═══════════ MAIN WORKSPACE: L/R SPLIT ═══════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700/60">
            {/* ── LEFT: Inputs (8 cols) ── */}
            <div className="lg:col-span-8 p-6 sm:p-8 space-y-6">
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-4">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                  Conversion Settings
                </h3>
                <button
                  onClick={() => {
                    setAmount("1000");
                    setFrom(CURRENCIES[0]);
                    setTo(CURRENCIES[1]);
                    setMarkup(MARKUP_FEES[0]);
                    setPrecision(2);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-brandColor dark:text-gray-500 dark:hover:text-brandColor transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              {/* ── Amount + Currency Row ── */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-start">
                {/* Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Amount
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-gray-400 dark:text-gray-500 text-sm pointer-events-none select-none">
                      {from.symbol}
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      className="block w-full pl-9 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brandColor/30 focus:border-brandColor focus:outline-none text-lg font-extrabold text-gray-900 dark:text-white transition-all"
                    />
                  </div>
                  {/* Quick chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[10, 100, 500, 1000, 5000, 10000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAmount(v.toString())}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          amount === String(v)
                            ? "bg-brandColor text-white border-brandColor"
                            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brandColor/40 hover:text-brandColor"
                        }`}
                      >
                        {from.symbol}
                        {v.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Swap button */}
                <div className="flex justify-center items-center h-full py-5 md:py-0">
                  <button
                    type="button"
                    onClick={handleSwap}
                    title="Swap currencies"
                    className="md:-mt-10 w-10 h-10 flex items-center justify-center rounded-full bg-brandColor hover:bg-brandColorHover text-white hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <motion.div
                      animate={{ rotate: swapDeg }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </motion.div>
                  </button>
                </div>

                {/* To label (no input, just shows the result currency) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Converts To
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-gray-400 dark:text-gray-500 text-sm pointer-events-none select-none">
                      {to.symbol}
                    </span>
                    <div className="block w-full pl-9 pr-3 py-3 bg-brandColor/5 dark:bg-brandColor/10 border border-brandColor/20 rounded-xl text-lg font-extrabold text-brandColor">
                      {fmt(calc.converted, precision)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 pt-0.5">
                    1 {from.code} ={" "}
                    <strong className="text-gray-600 dark:text-gray-300">
                      {calc.netRate.toFixed(4)} {to.code}
                    </strong>
                    &ensp;·&ensp; 1 {to.code} ={" "}
                    <strong className="text-gray-600 dark:text-gray-300">
                      {calc.inverse.toFixed(5)} {from.code}
                    </strong>
                  </p>
                </div>
              </div>

              {/* ── Currency Pickers ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                <div className="relative">
                  <CurrencyPicker
                    label="From Currency"
                    value={from}
                    open={fromOpen}
                    onToggle={() => {
                      setFromOpen((p) => !p);
                      setToOpen(false);
                    }}
                    onSelect={(c) => {
                      setFrom(c);
                      setFromOpen(false);
                    }}
                    wrapRef={fromRef}
                  />
                </div>
                <div className="relative">
                  <CurrencyPicker
                    label="To Currency"
                    value={to}
                    open={toOpen}
                    onToggle={() => {
                      setToOpen((p) => !p);
                      setFromOpen(false);
                    }}
                    onSelect={(c) => {
                      setTo(c);
                      setToOpen(false);
                    }}
                    wrapRef={toRef}
                  />
                </div>
              </div>

              {/* ── Advanced Toggle ── */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdv((p) => !p)}
                  className="w-full flex items-center justify-between p-4 bg-brandColor/5 dark:bg-brandColor/10 border border-brandColor/20 hover:bg-brandColor/8 hover:border-brandColor/35 rounded-xl text-brandColor text-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {showAdv
                      ? "Hide Advanced Options"
                      : "Show Advanced Options"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${showAdv ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* ── Advanced Options Expandable ── */}
              <AnimatePresence>
                {showAdv && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-5 pt-1">
                      {/* Markup Fee */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Calculator className="w-4 h-4 text-amber-500" />
                            Markup / Service Fee
                          </label>
                          <div className="relative">
                            <select
                              value={markup.id}
                              onChange={(e) =>
                                setMarkup(
                                  MARKUP_FEES.find(
                                    (f) => f.id === e.target.value,
                                  ) || MARKUP_FEES[0],
                                )
                              }
                              className="block w-full appearance-none pl-3 pr-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brandColor/30 focus:border-brandColor focus:outline-none text-sm text-gray-800 dark:text-white transition-all cursor-pointer"
                            >
                              {MARKUP_FEES.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          {markup.value > 0 && (
                            <div className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 rounded-lg px-3 py-2 mt-1">
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                Fee estimate:
                              </span>
                              <strong>
                                {from.symbol}
                                {fmt(calc.fee)}
                              </strong>
                            </div>
                          )}
                        </div>

                        {/* Precision */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-indigo-500" />
                            Result Precision
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[2, 3, 4, 5].map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setPrecision(d)}
                                className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                  precision === d
                                    ? "bg-brandColor border-brandColor text-white shadow-sm shadow-brandColor/20"
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brandColor/30 hover:text-brandColor"
                                }`}
                              >
                                {d}dp
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-2 font-mono mt-1">
                            Result preview:{" "}
                            <span className="font-bold text-gray-800 dark:text-white">
                              {to.symbol}
                              {fmt(calc.converted, precision)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Trend Chart */}
                      <div className="p-5 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {chart.trend === "up" ? (
                              <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                            ) : (
                              <TrendingDown className="w-4.5 h-4.5 text-rose-500" />
                            )}
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                              30-Day Rate Simulation
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-3 py-1">
                            1 {from.code} → {to.code}
                          </span>
                        </div>

                        <div className="relative">
                          <svg
                            className="w-full"
                            style={{ height: 120 }}
                            viewBox="0 0 560 110"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient
                                id="cGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#7c00fe"
                                  stopOpacity={
                                    chart.trend === "up" ? "0.22" : "0.12"
                                  }
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#7c00fe"
                                  stopOpacity="0.00"
                                />
                              </linearGradient>
                            </defs>
                            {[22, 55, 88].map((y) => (
                              <line
                                key={y}
                                x1="0"
                                y1={y}
                                x2="560"
                                y2={y}
                                stroke="currentColor"
                                className="text-gray-200 dark:text-gray-700"
                                strokeDasharray="4 3"
                                strokeWidth="0.8"
                              />
                            ))}
                            <path d={chart.area} fill="url(#cGrad)" />
                            <path
                              d={chart.line}
                              fill="none"
                              stroke="#7c00fe"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {[0, 14, 29].map((i) => {
                              const d = history[i];
                              if (!d) return null;
                              const x = (i / 29) * 560;
                              const y =
                                110 -
                                ((d.rate - chart.min) /
                                  (chart.max - chart.min || 1)) *
                                  110;
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r="4" fill="#7c00fe" />
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="7"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    className="dark:stroke-gray-800"
                                  />
                                </g>
                              );
                            })}
                          </svg>
                          {/* Min/Max labels */}
                          <div className="absolute right-0 top-0 flex flex-col justify-between h-full text-[9px] text-gray-400 dark:text-gray-600 font-mono pointer-events-none py-1">
                            <span>{chart.max.toFixed(4)}</span>
                            <span>
                              {((chart.max + chart.min) / 2).toFixed(4)}
                            </span>
                            <span>{chart.min.toFixed(4)}</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-600 font-semibold select-none">
                          <span>{history[0]?.label}</span>
                          <span>{history[14]?.label}</span>
                          <span>{history[29]?.label}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT: Results Panel (4 cols) ── */}
            <div className="lg:col-span-4 p-6 sm:p-8 space-y-6 bg-gray-50/60 dark:bg-gray-900/20">
              {/* Big Result */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Result
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-3">
                  {/* From row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-5.5 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 shadow-sm">
                        <ReactCountryFlag
                          countryCode={from.country}
                          svg
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </span>
                      <span className="font-semibold text-gray-500 dark:text-gray-400">
                        {from.code}
                      </span>
                    </div>
                    <span className="font-extrabold text-gray-800 dark:text-gray-200 tabular-nums">
                      {from.symbol}
                      {fmt(calc.raw)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300 dark:text-gray-600">
                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                    <ArrowLeftRight className="w-3.5 h-3.5 text-brandColor" />
                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                  </div>

                  {/* To row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-5.5 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 shadow-sm">
                        <ReactCountryFlag
                          countryCode={to.country}
                          svg
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </span>
                      <span className="font-bold text-brandColor">
                        {to.code}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-brandColor tabular-nums">
                      {fmt(calc.converted, precision)}
                    </span>
                  </div>

                  {/* Rates */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 space-y-1 text-xs text-gray-400 dark:text-gray-500">
                    <div className="flex justify-between">
                      <span>1 {from.code}</span>
                      <strong className="text-gray-700 dark:text-gray-300 tabular-nums">
                        {calc.netRate.toFixed(5)} {to.code}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>1 {to.code}</span>
                      <strong className="text-gray-700 dark:text-gray-300 tabular-nums">
                        {calc.inverse.toFixed(6)} {from.code}
                      </strong>
                    </div>
                    {markup.value > 0 && (
                      <div className="flex justify-between text-amber-600 dark:text-amber-400 pt-1">
                        <span>Fee ({(markup.value * 100).toFixed(1)}%)</span>
                        <strong>
                          −{from.symbol}
                          {fmt(calc.fee)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:border-brandColor/30 hover:text-brandColor transition-all cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied to clipboard!" : "Copy Conversion"}
                </button>
              </div>

              {/* Multi-Currency Grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brandColor" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Major Currencies
                  </p>
                </div>
                <div className="space-y-1.5">
                  {COMPARE_CODES.filter((c) => c !== from.code && c !== to.code)
                    .slice(0, 8)
                    .map((code) => {
                      const cur = CURRENCIES.find((x) => x.code === code);
                      if (!cur) return null;
                      const r =
                        rates[code] ?? FALLBACK[code] / FALLBACK[from.code];
                      const net = r * (1 - markup.value);
                      const val = calc.raw * net;
                      return (
                        <div
                          key={code}
                          className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-brandColor/20 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-4 rounded overflow-hidden shadow-xs border border-gray-200 dark:border-gray-700 shrink-0">
                              <ReactCountryFlag
                                countryCode={cur.country}
                                svg
                                style={{ objectFit: "cover" }}
                              />
                            </span>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                              {cur.code}
                            </span>
                          </div>
                          <span className="text-sm font-extrabold text-gray-800 dark:text-white tabular-nums">
                            {cur.symbol}
                            {fmt(val, 2)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Cash Note Estimator */}
              {showAdv && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-brandColor" />
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Cash Notes ({to.code})
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {notes.rows.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">
                        Amount too small for notes
                      </p>
                    ) : (
                      <>
                        {notes.rows.map(({ d, n }) => (
                          <div
                            key={d}
                            className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60"
                          >
                            <span className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                              <span className="px-1.5 py-0.5 rounded-md bg-brandColor/10 dark:bg-brandColor/20 text-brandColor text-[9px] font-black">
                                {to.code}
                              </span>
                              {to.symbol}
                              {d.toLocaleString()}
                            </span>
                            <span className="text-sm font-black text-gray-800 dark:text-white">
                              ×{n}
                            </span>
                          </div>
                        ))}
                        {notes.leftover > 0 && (
                          <p className="text-right text-[10px] text-gray-400 pt-1">
                            Coin change: {to.symbol}
                            {notes.leftover.toFixed(2)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── FOOTER FAQ ── */}
          <div className="border-t border-gray-100 dark:border-gray-700/60 px-6 sm:px-10 py-6 bg-gray-50/40 dark:bg-gray-900/20">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-brandColor" />
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                About This Tool
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {[
                {
                  title: "Live Exchange Rates",
                  body: "Rates are fetched from open.er-api.com on page load and whenever you change the source currency. Refresh manually by clicking the status pill in the header.",
                },
                {
                  title: "Markup / Service Fee",
                  body: "Banks and payment providers add a hidden spread (1–5%) on top of interbank rates. Use the advanced option to simulate your real-world conversion cost.",
                },
                {
                  title: "Rate Trend Chart",
                  body: "The 30-day chart is a seeded simulation for illustrative purposes. For real historical rates, consult a financial data provider like Bloomberg or Reuters.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="space-y-1">
                  <p className="font-bold text-gray-700 dark:text-gray-200 text-xs">
                    {title}
                  </p>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
