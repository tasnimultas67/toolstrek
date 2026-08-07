"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ToolPageShell from "../ToolPageShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  Users,
  Percent,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  History,
  Trash2,
  Info,
  Settings2,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Star,
  TrendingUp,
  Wallet,
  Clock,
  Plus,
  Minus,
  Share2,
  DollarSign,
  Calculator,
  HelpCircle,
  Lightbulb,
  Globe,
  FlaskConical,
} from "lucide-react";

// ─── Currency Data ────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
];

// ─── Preset Tip Percentages ───────────────────────────────────────────────────
const TIP_PRESETS = [
  { value: 5, label: "5%", desc: "Below Average" },
  { value: 10, label: "10%", desc: "Average" },
  { value: 15, label: "15%", desc: "Good" },
  { value: 18, label: "18%", desc: "Very Good" },
  { value: 20, label: "20%", desc: "Excellent" },
  { value: 25, label: "25%", desc: "Outstanding" },
];

// ─── Service Quality Labels ───────────────────────────────────────────────────
const SERVICE_LEVELS = [
  { emoji: "😤", label: "Poor", tip: 5, color: "#ef4444" },
  { emoji: "😐", label: "Fair", tip: 10, color: "#f97316" },
  { emoji: "🙂", label: "Good", tip: 15, color: "#eab308" },
  { emoji: "😊", label: "Great", tip: 20, color: "#22c55e" },
  { emoji: "🤩", label: "Amazing", tip: 25, color: "#7c00fe" },
];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What is the standard tip percentage?",
    a: "In the US, the standard tip is 15–20% of the pre-tax bill. For excellent service, 20–25% is common. In other countries, tipping customs vary significantly — some don't tip at all.",
  },
  {
    q: "Should I tip on the pre-tax or post-tax amount?",
    a: "Traditionally, tips are calculated on the pre-tax subtotal. However, many people tip on the total including tax, and either approach is acceptable.",
  },
  {
    q: "How do I split a bill fairly among multiple people?",
    a: "Divide the total bill (including tip) by the number of people. Our calculator does this automatically. For unequal splits, use the custom share feature in Advanced Options.",
  },
  {
    q: "What is a service charge vs. a tip?",
    a: "A service charge is a mandatory fee added by the establishment, while a tip is voluntary. If a service charge is already included, you generally don't need to tip additionally.",
  },
  {
    q: "How does rounding work in bill splitting?",
    a: "When splitting bills, individual amounts often have decimals. The 'Round Up' feature rounds each person's share up to the nearest dollar, ensuring the restaurant is never short-changed.",
  },
  {
    q: "Is tipping mandatory?",
    a: "No, tipping is generally voluntary. However, in service industries (restaurants, taxis, salons), tips are an important part of workers' income. Always consider the quality of service provided.",
  },
];

// ─── Tips & Insights ─────────────────────────────────────────────────────────
const TIPPING_FACTS = [
  { icon: "🍽️", title: "Restaurant Standard", desc: "15–20% is the standard tip range at full-service restaurants in the US." },
  { icon: "🚕", title: "Taxi & Rideshare", desc: "Tip 15–20% for taxi rides. For rideshare apps, 10–15% is common." },
  { icon: "💈", title: "Hair & Beauty", desc: "15–20% is standard for hairdressers, barbers, and beauty services." },
  { icon: "🏨", title: "Hotel Services", desc: "Tip $1–5 per bag for porters, $2–5/day for housekeeping." },
  { icon: "🍕", title: "Food Delivery", desc: "Tip at least $3–5, or 15–20% of the order total for delivery drivers." },
  { icon: "☕", title: "Coffee Shops", desc: "10–15% or $1 per drink is common at coffee shops with counter service." },
];

// ─── localStorage key ─────────────────────────────────────────────────────────
const HISTORY_KEY = "tip_calculator_history";

// ─── Utility ──────────────────────────────────────────────────────────────────
function fmt(value, symbol) {
  if (isNaN(value) || value === null) return `${symbol}0.00`;
  return `${symbol}${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NumberStepper({ value, onChange, min = 1, max = 100, label }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--accent)] transition-all"
        aria-label={`Decrease ${label}`}
      >
        <Minus size={14} />
      </button>
      <span className="w-10 text-center font-semibold text-base tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--accent)] transition-all"
        aria-label={`Increase ${label}`}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function ResultCard({ label, value, highlight = false, sub }) {
  return (
    <div
      className={`rounded-2xl p-4 flex flex-col gap-1 ${
        highlight
          ? "bg-gradient-to-br from-[#7c00fe] to-[#4635b1] text-white shadow-lg shadow-purple-500/20"
          : "bg-[var(--card)] border border-[var(--border)]"
      }`}
    >
      <span
        className={`text-xs font-medium uppercase tracking-widest ${
          highlight ? "text-purple-200" : "text-[var(--muted-foreground)]"
        }`}
      >
        {label}
      </span>
      <span className={`text-2xl font-bold tracking-tight ${highlight ? "text-white" : ""}`}>
        {value}
      </span>
      {sub && (
        <span className={`text-xs ${highlight ? "text-purple-200" : "text-[var(--muted-foreground)]"}`}>
          {sub}
        </span>
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-all"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--accent)] transition-colors"
      >
        <span className="font-medium text-sm">{q}</span>
        <span className="shrink-0 text-[var(--muted-foreground)]">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TipCalculator() {
  // ── Core Inputs ──
  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState(18);
  const [customTip, setCustomTip] = useState("");
  const [useCustomTip, setUseCustomTip] = useState(false);
  const [numPeople, setNumPeople] = useState(1);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef(null);

  // ── Advanced Options ──
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [taxRate, setTaxRate] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [roundUp, setRoundUp] = useState(false);
  const [tipOnTax, setTipOnTax] = useState(false);
  const [splitEqually, setSplitEqually] = useState(true);
  const [customShares, setCustomShares] = useState([100]);
  const [discountAmount, setDiscountAmount] = useState("");
  const [serviceQuality, setServiceQuality] = useState(null);

  // ── UI State ──
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [activeFaqTab, setActiveFaqTab] = useState("faq");
  const [resultCopied, setResultCopied] = useState(false);

  // ─── Load History from LocalStorage ──────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  // ─── Close currency dropdown on outside click ─────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Sync custom shares array length with numPeople ───────────────────────
  useEffect(() => {
    if (!splitEqually) {
      setCustomShares((prev) => {
        if (prev.length === numPeople) return prev;
        const newShares = Array.from({ length: numPeople }, (_, i) =>
          i < prev.length ? prev[i] : Math.round(100 / numPeople)
        );
        return newShares;
      });
    }
  }, [numPeople, splitEqually]);

  // ─── Calculations ─────────────────────────────────────────────────────────
  const calculations = React.useMemo(() => {
    const bill = parseFloat(billAmount) || 0;
    const discount = parseFloat(discountAmount) || 0;
    const tax = parseFloat(taxRate) || 0;
    const svcCharge = parseFloat(serviceCharge) || 0;
    const activeTip = useCustomTip
      ? parseFloat(customTip) || 0
      : serviceQuality !== null
      ? SERVICE_LEVELS[serviceQuality].tip
      : tipPercent;

    const discountedBill = Math.max(0, bill - discount);
    const taxAmount = discountedBill * (tax / 100);
    const svcChargeAmount = discountedBill * (svcCharge / 100);
    const tipBase = tipOnTax ? discountedBill + taxAmount : discountedBill;
    const tipAmount = tipBase * (activeTip / 100);
    const totalBill = discountedBill + taxAmount + svcChargeAmount + tipAmount;

    let perPerson = totalBill / (numPeople || 1);
    if (roundUp) perPerson = Math.ceil(perPerson);

    const effectiveTotal = roundUp ? perPerson * numPeople : totalBill;

    // Custom split shares
    const shareTotal = customShares.reduce((a, b) => a + b, 0) || 1;
    const personAmounts = customShares.map((s) => {
      const amt = (s / shareTotal) * effectiveTotal;
      return roundUp ? Math.ceil(amt) : amt;
    });

    return {
      bill,
      discountedBill,
      discount,
      taxAmount,
      svcChargeAmount,
      tipAmount,
      totalBill,
      perPerson,
      effectiveTotal,
      activeTip,
      personAmounts,
    };
  }, [
    billAmount,
    tipPercent,
    customTip,
    useCustomTip,
    numPeople,
    taxRate,
    serviceCharge,
    roundUp,
    tipOnTax,
    discountAmount,
    serviceQuality,
    customShares,
  ]);

  // ─── Load Sample Data ─────────────────────────────────────────────────────
  const loadSampleData = () => {
    setBillAmount("2450.00");
    setTipPercent(15);
    setUseCustomTip(false);
    setNumPeople(4);
    setCurrency(CURRENCIES[0]);
    setTaxRate("5");
    setServiceCharge("10");
    setDiscountAmount("250.00");
    setRoundUp(true);
    setTipOnTax(false);
    setSplitEqually(true);
    setServiceQuality(3);
    setShowAdvanced(true);
  };

  // ─── Reset ────────────────────────────────────────────────────────────────
  const resetAll = () => {
    setBillAmount("");
    setTipPercent(18);
    setCustomTip("");
    setUseCustomTip(false);
    setNumPeople(1);
    setTaxRate("");
    setServiceCharge("");
    setRoundUp(false);
    setTipOnTax(false);
    setSplitEqually(true);
    setCustomShares([100]);
    setDiscountAmount("");
    setServiceQuality(null);
    setShowAdvanced(false);
  };

  // ─── Save to History ──────────────────────────────────────────────────────
  const saveToHistory = () => {
    if (!billAmount || parseFloat(billAmount) <= 0) return;
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      bill: billAmount,
      tip: calculations.activeTip,
      tipAmount: calculations.tipAmount,
      total: calculations.totalBill,
      perPerson: calculations.perPerson,
      people: numPeople,
      currency: currency.code,
      symbol: currency.symbol,
    };
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    setShowHistory(true);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {}
  };

  // ─── Clear History ────────────────────────────────────────────────────────
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  };

  // ─── Copy Summary ─────────────────────────────────────────────────────────
  const copySummary = () => {
    const sym = currency.symbol;
    const text = [
      `=== Tip Calculator Summary ===`,
      `Bill Amount: ${fmt(calculations.discountedBill, sym)}`,
      calculations.discount > 0 ? `Discount Applied: -${fmt(calculations.discount, sym)}` : null,
      calculations.taxAmount > 0 ? `Tax: +${fmt(calculations.taxAmount, sym)}` : null,
      calculations.svcChargeAmount > 0 ? `Service Charge: +${fmt(calculations.svcChargeAmount, sym)}` : null,
      `Tip (${calculations.activeTip}%): +${fmt(calculations.tipAmount, sym)}`,
      `Total Bill: ${fmt(calculations.effectiveTotal, sym)}`,
      numPeople > 1 ? `Per Person (${numPeople} people): ${fmt(calculations.perPerson, sym)}` : null,
      `Generated by ToolsTrek Tip Calculator`,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setResultCopied(true);
      setTimeout(() => setResultCopied(false), 2500);
    });
  };

  const sym = currency.symbol;
  const hasBill = parseFloat(billAmount) > 0;

  return (
    <ToolPageShell widthClassName="max-w-6xl">
      {/* ── Page Header ── */}
      <div className="text-center mb-10 px-2">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-sm font-medium text-[var(--muted-foreground)] mb-4"
        >
          <Sparkles size={14} className="text-[var(--color-brandColor)]" />
          Smart Dining Companion
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3"
        >
          Tip <span className="text-[var(--color-brandColor)]">Calculator</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[var(--muted-foreground)] max-w-xl mx-auto text-sm sm:text-base"
        >
          Calculate tips, split bills, apply taxes & service charges — the
          smartest tip calculator on the web.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ═══════════════════════════ LEFT COLUMN ═════════════════════════════ */}
        <div className="space-y-5">
          {/* ── Main Calculator Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-sm"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c00fe] to-[#4635b1] flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <UtensilsCrossed size={16} className="text-white" />
                </div>
                <span className="font-semibold text-base">Bill Details</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadSampleData}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] border border-[var(--border)] transition-all"
                >
                  <FlaskConical size={12} />
                  Sample
                </button>
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] border border-[var(--border)] transition-all"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
            </div>

            {/* Currency + Bill Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 mb-5">
              {/* Currency Dropdown */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Currency
                </label>
                <div ref={currencyRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCurrencyOpen(!currencyOpen)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--accent)] transition-all text-sm font-medium"
                  >
                    <span>
                      {currency.symbol} {currency.code}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {currencyOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 z-50 w-56 bg-[var(--popover)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto"
                      >
                        {CURRENCIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCurrency(c);
                              setCurrencyOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--accent)] transition-colors ${
                              currency.code === c.code ? "bg-[var(--accent)]" : ""
                            }`}
                          >
                            <span className="font-bold text-[var(--color-brandColor)] w-6">{c.symbol}</span>
                            <span>{c.code}</span>
                            <span className="text-[var(--muted-foreground)] text-xs ml-auto">{c.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bill Amount */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Bill Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] font-bold text-sm pointer-events-none">
                    {currency.symbol}
                  </span>
                  <input
                    id="tip-bill-amount"
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brandColor)]/40 focus:border-[var(--color-brandColor)] text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ── Service Quality ── */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">
                Service Quality
                <span className="ml-2 text-[var(--muted-foreground)] font-normal">
                  (auto-selects tip%)
                </span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {SERVICE_LEVELS.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setServiceQuality(serviceQuality === i ? null : i);
                      if (serviceQuality !== i) {
                        setTipPercent(s.tip);
                        setUseCustomTip(false);
                      }
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-center ${
                      serviceQuality === i
                        ? "border-[var(--color-brandColor)] bg-[var(--color-brandColor)]/10"
                        : "border-[var(--border)] hover:border-[var(--color-brandColor)]/40 bg-[var(--muted)]"
                    }`}
                  >
                    <span className="text-xl leading-none">{s.emoji}</span>
                    <span className="text-[10px] font-medium leading-none">{s.label}</span>
                    <span className="text-[9px] text-[var(--muted-foreground)] leading-none">{s.tip}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tip % Presets ── */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Tip Percentage
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomTip(!useCustomTip)}
                  className="text-xs text-[var(--color-brandColor)] font-medium hover:underline"
                >
                  {useCustomTip ? "Use Preset" : "Custom %"}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {useCustomTip ? (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <input
                        id="tip-custom-percent"
                        type="number"
                        inputMode="decimal"
                        placeholder="Enter custom tip %"
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                        min="0"
                        max="100"
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brandColor)]/40 focus:border-[var(--color-brandColor)] text-sm transition-all"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                        <Percent size={14} />
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="presets"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-3 sm:grid-cols-6 gap-2"
                  >
                    {TIP_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => {
                          setTipPercent(p.value);
                          setServiceQuality(null);
                        }}
                        className={`flex flex-col items-center py-2.5 px-1 rounded-xl border-2 transition-all ${
                          tipPercent === p.value && serviceQuality === null
                            ? "border-[var(--color-brandColor)] bg-[var(--color-brandColor)]/10 text-[var(--color-brandColor)]"
                            : "border-[var(--border)] hover:border-[var(--color-brandColor)]/40 bg-[var(--muted)]"
                        }`}
                      >
                        <span className="font-bold text-sm">{p.label}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{p.desc}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Number of People ── */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">
                Number of People
              </label>
              <div className="flex items-center gap-4">
                <NumberStepper
                  value={numPeople}
                  onChange={setNumPeople}
                  min={1}
                  max={50}
                  label="people"
                />
                <div className="flex items-center gap-2 ml-2">
                  <Users size={14} className="text-[var(--muted-foreground)]" />
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {numPeople === 1 ? "1 person" : `${numPeople} people`}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Advanced Options Toggle ── */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                showAdvanced
                  ? "border-[var(--color-brandColor)] bg-[var(--color-brandColor)]/5"
                  : "border-[var(--border)] hover:border-[var(--color-brandColor)]/40 bg-[var(--muted)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings2
                  size={15}
                  className={showAdvanced ? "text-[var(--color-brandColor)]" : "text-[var(--muted-foreground)]"}
                />
                <span className="text-sm font-medium">Advanced Options</span>
                {showAdvanced && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--color-brandColor)] text-white">
                    ON
                  </span>
                )}
              </div>
              <ChevronDown
                size={15}
                className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              />
            </button>

            {/* ── Advanced Options Panel ── */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-[var(--border)]" />
                      <span className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                        Advanced Settings
                      </span>
                      <div className="h-px flex-1 bg-[var(--border)]" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Tax Rate */}
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                          Tax Rate (%)
                        </label>
                        <div className="relative">
                          <input
                            id="tip-tax-rate"
                            type="number"
                            inputMode="decimal"
                            placeholder="e.g. 8.5"
                            value={taxRate}
                            onChange={(e) => setTaxRate(e.target.value)}
                            min="0"
                            max="100"
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brandColor)]/40 focus:border-[var(--color-brandColor)] text-sm transition-all"
                          />
                          <Percent size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        </div>
                      </div>

                      {/* Service Charge */}
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                          Service Charge (%)
                        </label>
                        <div className="relative">
                          <input
                            id="tip-service-charge"
                            type="number"
                            inputMode="decimal"
                            placeholder="e.g. 10"
                            value={serviceCharge}
                            onChange={(e) => setServiceCharge(e.target.value)}
                            min="0"
                            max="100"
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brandColor)]/40 focus:border-[var(--color-brandColor)] text-sm transition-all"
                          />
                          <Percent size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        </div>
                      </div>

                      {/* Discount Amount */}
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                          Discount Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] font-bold text-sm pointer-events-none">
                            {currency.symbol}
                          </span>
                          <input
                            id="tip-discount"
                            type="number"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            min="0"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brandColor)]/40 focus:border-[var(--color-brandColor)] text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-2">
                      {[
                        {
                          id: "tip-on-tax",
                          label: "Calculate tip on tax-inclusive amount",
                          sub: "Tip is calculated after tax is added",
                          state: tipOnTax,
                          toggle: () => setTipOnTax(!tipOnTax),
                        },
                        {
                          id: "round-up",
                          label: "Round up per-person amount",
                          sub: "Each person pays rounded-up amount",
                          state: roundUp,
                          toggle: () => setRoundUp(!roundUp),
                        },
                        {
                          id: "split-equally",
                          label: "Split bill equally",
                          sub: "Toggle off for custom split percentages",
                          state: splitEqually,
                          toggle: () => setSplitEqually(!splitEqually),
                        },
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          htmlFor={opt.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] cursor-pointer hover:bg-[var(--accent)] transition-colors"
                        >
                          <div>
                            <div className="text-sm font-medium">{opt.label}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">{opt.sub}</div>
                          </div>
                          <button
                            id={opt.id}
                            type="button"
                            role="switch"
                            aria-checked={opt.state}
                            onClick={opt.toggle}
                            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                              opt.state ? "bg-[var(--color-brandColor)]" : "bg-[var(--border)]"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                opt.state ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </label>
                      ))}
                    </div>

                    {/* Custom Split Shares */}
                    <AnimatePresence>
                      {!splitEqually && numPeople > 1 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-1">
                            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">
                              Custom Split Percentages
                              <span className="ml-1 text-[var(--color-brandColor)]">
                                (total:{" "}
                                {customShares.reduce((a, b) => a + Number(b), 0)}%)
                              </span>
                            </label>
                            <div className="space-y-2">
                              {customShares.map((share, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <span className="text-xs text-[var(--muted-foreground)] w-16 shrink-0">
                                    Person {i + 1}
                                  </span>
                                  <input
                                    type="number"
                                    value={share}
                                    onChange={(e) => {
                                      const updated = [...customShares];
                                      updated[i] = Math.max(0, Number(e.target.value));
                                      setCustomShares(updated);
                                    }}
                                    min="0"
                                    max="100"
                                    className="w-20 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brandColor)]/40"
                                  />
                                  <span className="text-xs text-[var(--muted-foreground)]">%</span>
                                  <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[var(--color-brandColor)] transition-all"
                                      style={{
                                        width: `${Math.min(100, share)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Informational Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm"
          >
            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]">
              {[
                { id: "facts", label: "Tipping Guide", icon: <Lightbulb size={14} /> },
                { id: "faq", label: "FAQ", icon: <HelpCircle size={14} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFaqTab(tab.id)}
                  className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                    activeFaqTab === tab.id
                      ? "border-[var(--color-brandColor)] text-[var(--color-brandColor)]"
                      : "border-transparent text-[var(--muted-foreground)] hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {activeFaqTab === "facts" ? (
                  <motion.div
                    key="facts"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {TIPPING_FACTS.map((fact, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--muted)] border border-[var(--border)]"
                      >
                        <span className="text-2xl shrink-0">{fact.icon}</span>
                        <div>
                          <div className="font-semibold text-sm mb-0.5">{fact.title}</div>
                          <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">{fact.desc}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="faq"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {FAQS.map((f, i) => (
                      <FAQItem key={i} q={f.q} a={f.a} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════ RIGHT COLUMN ════════════════════════════ */}
        <div className="space-y-5">
          {/* ── Results Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-sm"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c00fe] to-[#4635b1] flex items-center justify-center shadow-md shadow-purple-500/25">
                  <Calculator size={14} className="text-white" />
                </div>
                <span className="font-semibold text-sm">Your Results</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copySummary}
                  disabled={!hasBill}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {resultCopied ? (
                    <Check size={11} className="text-green-500" />
                  ) : (
                    <Copy size={11} />
                  )}
                  {resultCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Result Cards */}
            <div className="space-y-3 mb-5">
              <ResultCard
                label="Tip Amount"
                value={fmt(hasBill ? calculations.tipAmount : 0, sym)}
                sub={`${calculations.activeTip}% tip rate`}
              />
              <ResultCard
                label="Total Bill"
                value={fmt(hasBill ? calculations.effectiveTotal : 0, sym)}
                highlight
                sub={`${roundUp ? "Rounded up" : "Exact"} amount`}
              />
              {numPeople > 1 && (
                <ResultCard
                  label={`Per Person (÷${numPeople})`}
                  value={fmt(hasBill ? calculations.perPerson : 0, sym)}
                  sub={`${numPeople} people splitting`}
                />
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Breakdown
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>

              {[
                {
                  label: "Bill Amount",
                  value: fmt(hasBill ? calculations.bill : 0, sym),
                  show: true,
                },
                {
                  label: "Discount",
                  value: `-${fmt(hasBill ? calculations.discount : 0, sym)}`,
                  show: hasBill && calculations.discount > 0,
                  color: "text-green-500",
                },
                {
                  label: `Tax (${taxRate || 0}%)`,
                  value: `+${fmt(hasBill ? calculations.taxAmount : 0, sym)}`,
                  show: hasBill && calculations.taxAmount > 0,
                  color: "text-orange-500",
                },
                {
                  label: `Service Charge (${serviceCharge || 0}%)`,
                  value: `+${fmt(hasBill ? calculations.svcChargeAmount : 0, sym)}`,
                  show: hasBill && calculations.svcChargeAmount > 0,
                  color: "text-blue-500",
                },
                {
                  label: `Tip (${calculations.activeTip}%)`,
                  value: `+${fmt(hasBill ? calculations.tipAmount : 0, sym)}`,
                  show: true,
                  color: "text-[var(--color-brandColor)]",
                },
              ]
                .filter((r) => r.show)
                .map((row, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <span className="text-[var(--muted-foreground)]">{row.label}</span>
                    <span className={`font-medium tabular-nums ${row.color || ""}`}>
                      {row.value}
                    </span>
                  </div>
                ))}

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <span className="font-semibold text-sm">Total</span>
                <span className="font-bold text-base text-[var(--color-brandColor)] tabular-nums">
                  {fmt(hasBill ? calculations.effectiveTotal : 0, sym)}
                </span>
              </div>
            </div>

            {/* Custom Split Breakdown */}
            <AnimatePresence>
              {!splitEqually && numPeople > 1 && hasBill && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mb-5"
                >
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-[var(--border)]" />
                      <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Custom Split
                      </span>
                      <div className="h-px flex-1 bg-[var(--border)]" />
                    </div>
                    <div className="space-y-1">
                      {calculations.personAmounts.map((amt, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1">
                          <span className="text-[var(--muted-foreground)]">
                            Person {i + 1} ({customShares[i] || 0}%)
                          </span>
                          <span className="font-semibold tabular-nums">{fmt(amt, sym)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save to History Button */}
            <button
              onClick={saveToHistory}
              disabled={!hasBill}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#7c00fe] to-[#4635b1] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
            >
              <History size={15} />
              Save to History
            </button>

            {/* Empty State */}
            <AnimatePresence>
              {!hasBill && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[var(--card)]/90 backdrop-blur-sm"
                >
                  <div className="text-center px-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
                      <DollarSign size={24} className="text-[var(--muted-foreground)]" />
                    </div>
                    <p className="font-semibold mb-1">Enter Bill Amount</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Your results will appear here
                    </p>
                    <button
                      onClick={loadSampleData}
                      className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-brandColor)]/10 text-[var(--color-brandColor)] text-sm font-medium hover:bg-[var(--color-brandColor)]/20 transition-all mx-auto"
                    >
                      <FlaskConical size={14} />
                      Try Sample Data
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── History Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm"
          >
            {/* History Header */}
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--accent)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <History size={16} className="text-[var(--color-brandColor)]" />
                <span className="font-semibold text-sm">Recent History</span>
                {history.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[var(--color-brandColor)]/10 text-[var(--color-brandColor)]">
                    {history.length}
                  </span>
                )}
              </div>
              <ChevronDown
                size={15}
                className={`transition-transform text-[var(--muted-foreground)] ${showHistory ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[var(--border)]">
                    {history.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                          <Clock size={18} className="text-[var(--muted-foreground)]" />
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          No history yet. Save a calculation to see it here.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-end px-5 py-2 border-b border-[var(--border)]">
                          <button
                            onClick={clearHistory}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={11} />
                            Clear All
                          </button>
                        </div>
                        <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
                          {history.map((entry, i) => (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="px-5 py-3 hover:bg-[var(--accent)] transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-[var(--muted)] border border-[var(--border)]">
                                    {entry.tip}%
                                  </span>
                                  <span className="text-xs text-[var(--muted-foreground)]">
                                    {entry.people > 1 ? `${entry.people} ppl` : "1 person"}
                                  </span>
                                </div>
                                <span className="text-xs text-[var(--muted-foreground)]">
                                  {entry.date}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-[var(--muted-foreground)]">
                                  Bill: <span className="font-medium text-foreground">{entry.symbol}{Number(entry.bill).toFixed(2)}</span>
                                  &nbsp;+&nbsp;tip: <span className="font-medium text-[var(--color-brandColor)]">{entry.symbol}{Number(entry.tipAmount).toFixed(2)}</span>
                                </div>
                                <span className="font-bold text-sm tabular-nums">
                                  {entry.symbol}{Number(entry.total).toFixed(2)}
                                </span>
                              </div>
                              {entry.people > 1 && (
                                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                  Each pays:{" "}
                                  <span className="font-semibold text-foreground">
                                    {entry.symbol}{Number(entry.perPerson).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Tip Rate Visual Guide ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-gradient-to-br from-[#7c00fe]/5 to-[#4635b1]/5 rounded-2xl border border-[var(--color-brandColor)]/20 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-[var(--color-brandColor)]" />
              <span className="font-semibold text-sm">Tip Rate Guide</span>
            </div>
            <div className="space-y-2">
              {TIP_PRESETS.map((p) => (
                <div key={p.value} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-8 text-[var(--color-brandColor)] tabular-nums">
                    {p.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--border)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.value / 25) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + p.value * 0.01 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#7c00fe] to-[#4635b1]"
                    />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] w-20 text-right">
                    {p.desc}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Info Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            icon: <Globe size={18} className="text-[var(--color-brandColor)]" />,
            title: "Global Currencies",
            desc: "Supports 12+ world currencies for dining anywhere",
          },
          {
            icon: <Users size={18} className="text-[var(--color-brandColor)]" />,
            title: "Group Split",
            desc: "Split bills equally or with custom percentages per person",
          },
          {
            icon: <Star size={18} className="text-[var(--color-brandColor)]" />,
            title: "Smart Suggestions",
            desc: "Rate service quality and get instant tip recommendations",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--color-brandColor)]/10 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <div className="font-semibold text-sm mb-0.5">{item.title}</div>
              <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">{item.desc}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </ToolPageShell>
  );
}
