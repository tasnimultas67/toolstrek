"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import ToolPageShell from "../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  Cigarette,
  CigaretteOff,
  Coins,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  Copy,
  Download,
  RotateCcw,
  Search,
  Check,
  ChevronDown,
  Info,
  HeartPulse,
  Flame,
  ShoppingBag,
  DollarSign,
  Package,
  Layers,
  Wind,
  ShieldAlert,
  Award,
  Zap,
} from "lucide-react";

// ─── CURRENCY DEFINITIONS ──────────────────────────────────────────────────
const CURRENCIES = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "PKR", symbol: "PKR", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "NPR", symbol: "NPR", name: "Nepalese Rupee", flag: "🇳🇵" },
  { code: "LKR", symbol: "LKR", name: "Sri Lankan Rupee", flag: "🇱🇰" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "KWD", symbol: "KWD", name: "Kuwaiti Dinar", flag: "🇰🇼" },
  { code: "QAR", symbol: "QAR", name: "Qatari Riyal", flag: "🇶🇦" },
  { code: "OMR", symbol: "OMR", name: "Omani Rial", flag: "🇴🇴" },
  { code: "BHD", symbol: "BHD", name: "Bahraini Dinar", flag: "🇧🇭" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
];

// Helper to format currency
function formatMoney(amount, symbol = "৳") {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// ─── MODERN CURRENCY SELECTOR ───────────────────────────────────────────────
function ModernCurrencySelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const selectedCurrency =
    CURRENCIES.find((c) => c.code === value) || CURRENCIES[0];

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return CURRENCIES;
    const term = search.toLowerCase();
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.symbol.toLowerCase().includes(term)
    );
  }, [search]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
        Select Currency
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm hover:border-brandColor focus:outline-none focus:ring-2 focus:ring-brandColor/50 transition-all text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl leading-none">{selectedCurrency.flag}</span>
          <div className="truncate">
            <span className="font-bold text-gray-900 dark:text-white mr-2">
              {selectedCurrency.code} ({selectedCurrency.symbol})
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
              — {selectedCurrency.name}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brandColor" : ""
          }`}
        />
      </button>

      {/* Modern Popover Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box inside dropdown */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search currency or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-brandColor"
              />
            </div>
          </div>

          {/* List of Currencies */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((c) => {
                const isSelected = c.code === value;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brandColor text-white font-medium shadow-sm"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="text-lg">{c.flag}</span>
                      <span className="font-semibold">{c.code}</span>
                      <span
                        className={
                          isSelected
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      >
                        ({c.symbol})
                      </span>
                      <span
                        className={`text-xs truncate ${
                          isSelected
                            ? "text-blue-100"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {c.name}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-gray-500">
                No matching currencies found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function SmokingCostCalculator() {
  const { addRecentTool } = useRecentTools();

  // Active Tab: 'pack' | 'pcs' | 'vape' | 'tobacco'
  const [activeTab, setActiveTab] = useState("pack");

  // Currency (Default BDT)
  const [currencyCode, setCurrencyCode] = useState("BDT");
  const currency = useMemo(
    () => CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0],
    [currencyCode]
  );

  // Core Inputs
  // Tab 1: Pack mode
  const [cigsPerDayPack, setCigsPerDayPack] = useState("20");
  const [pricePerPack, setPricePerPack] = useState("360");
  const [sticksPerPack, setSticksPerPack] = useState("20");

  // Tab 2: Piece mode
  const [cigsPerDayPcs, setCigsPerDayPcs] = useState("15");
  const [pricePerPiece, setPricePerPiece] = useState("18");

  // Tab 3: Vape mode
  const [podsCostMonthly, setPodsCostMonthly] = useState("1500");
  const [liquidCostMonthly, setLiquidCostMonthly] = useState("1200");
  const [coilCostMonthly, setCoilCostMonthly] = useState("800");

  // Tab 4: Other Tobacco mode
  const [dailyTobaccoSpend, setDailyTobaccoSpend] = useState("100");
  const [tobaccoItemName, setTobaccoItemName] = useState("Shisha / Paan / Cigar");

  // Advanced Options
  const [yearsSmokedPast, setYearsSmokedPast] = useState("3");
  const [annualReturnRate, setAnnualReturnRate] = useState("8"); // Investment rate %
  const [annualInflationRate, setAnnualInflationRate] = useState("5"); // Inflation %

  // Register in recent tools on mount
  useEffect(() => {
    addRecentTool({
      title: "Smoking Cost Calculator",
      link: "/tools/smoking-cost-calculator",
      description: "Calculate cigarette, vape & tobacco costs with lifetime investment projection.",
      icon: "CigaretteOff",
      category: "Calculator",
    });
  }, [addRecentTool]);

  // Reset function
  const handleReset = () => {
    setActiveTab("pack");
    setCurrencyCode("BDT");
    setCigsPerDayPack("20");
    setPricePerPack("360");
    setSticksPerPack("20");
    setCigsPerDayPcs("15");
    setPricePerPiece("18");
    setPodsCostMonthly("1500");
    setLiquidCostMonthly("1200");
    setCoilCostMonthly("800");
    setDailyTobaccoSpend("100");
    setYearsSmokedPast("3");
    setAnnualReturnRate("8");
    setAnnualInflationRate("5");
    toast.info("Calculator reset to defaults.");
  };

  // ─── CALCULATION ENGINE ───────────────────────────────────────────────────
  const calculations = useMemo(() => {
    let dailyCost = 0;
    let dailySticks = 0;
    let dailyPacks = 0;

    if (activeTab === "pack") {
      const cpd = parseFloat(cigsPerDayPack) || 0;
      const ppp = parseFloat(pricePerPack) || 0;
      const spp = parseFloat(sticksPerPack) || 20;

      dailySticks = cpd;
      dailyPacks = spp > 0 ? cpd / spp : 0;
      const pricePerSingleStick = spp > 0 ? ppp / spp : 0;
      dailyCost = cpd * pricePerSingleStick;
    } else if (activeTab === "pcs") {
      const cpd = parseFloat(cigsPerDayPcs) || 0;
      const ppp = parseFloat(pricePerPiece) || 0;

      dailySticks = cpd;
      dailyPacks = cpd / 20; // assumed 20 per standard pack
      dailyCost = cpd * ppp;
    } else if (activeTab === "vape") {
      const pods = parseFloat(podsCostMonthly) || 0;
      const liquid = parseFloat(liquidCostMonthly) || 0;
      const coils = parseFloat(coilCostMonthly) || 0;
      const totalMonthly = pods + liquid + coils;

      dailyCost = totalMonthly / 30.4167;
      dailySticks = 0; // vape equivalent
      dailyPacks = 0;
    } else if (activeTab === "tobacco") {
      const spend = parseFloat(dailyTobaccoSpend) || 0;
      dailyCost = spend;
      dailySticks = 0;
      dailyPacks = 0;
    }

    // Timeframes required: 1 day, 7 days, 1 month (30 days), 6 months (180 days), 1 year (365 days), 5 years, 10 years, 20 years
    const timeframes = [
      { id: "1d", label: "1 Day", days: 1 },
      { id: "7d", label: "7 Days (1 Wk)", days: 7 },
      { id: "1m", label: "1 Month (30d)", days: 30 },
      { id: "6m", label: "6 Months", days: 180 },
      { id: "1y", label: "1 Year", days: 365 },
      { id: "5y", label: "5 Years", days: 365 * 5 },
      { id: "10y", label: "10 Years", days: 365 * 10 },
      { id: "20y", label: "20 Years", days: 365 * 20 },
    ];

    const rate = (parseFloat(annualReturnRate) || 0) / 100 / 12; // monthly return rate
    const monthlyContrib = dailyCost * 30.4167;

    const resultsMatrix = timeframes.map((tf) => {
      const cost = dailyCost * tf.days;
      const totalSticks = Math.round(dailySticks * tf.days);
      const totalPacks = (dailyPacks * tf.days).toFixed(1);

      // Investment compound growth if quit and saved:
      // FV = PMT * (((1 + r)^n - 1) / r)
      const totalMonths = (tf.days / 30.4167);
      let investedValue = cost;
      if (rate > 0 && totalMonths >= 1) {
        investedValue =
          monthlyContrib * ((Math.pow(1 + rate, totalMonths) - 1) / rate);
      }

      // Life lost: ~11 mins per cigarette stick according to medical studies
      const minutesLost = totalSticks * 11;
      const hoursLost = minutesLost / 60;
      const daysLost = hoursLost / 24;

      return {
        ...tf,
        cost,
        totalSticks,
        totalPacks,
        investedValue,
        minutesLost,
        hoursLost,
        daysLost,
      };
    });

    // Past Money Wasted Calculation
    const yearsPast = parseFloat(yearsSmokedPast) || 0;
    const pastCost = dailyCost * 365 * yearsPast;

    return {
      dailyCost,
      dailySticks,
      dailyPacks,
      monthlyCost: dailyCost * 30.4167,
      yearlyCost: dailyCost * 365,
      resultsMatrix,
      pastCost,
      yearsPast,
    };
  }, [
    activeTab,
    cigsPerDayPack,
    pricePerPack,
    sticksPerPack,
    cigsPerDayPcs,
    pricePerPiece,
    podsCostMonthly,
    liquidCostMonthly,
    coilCostMonthly,
    dailyTobaccoSpend,
    annualReturnRate,
    yearsSmokedPast,
  ]);

  // ─── COPY SUMMARY ──────────────────────────────────────────────────────────
  const handleCopySummary = () => {
    const s = currency.symbol;
    const text = `🚬 Smoking Cost Summary (${calculations.yearsPast > 0 ? `Smoked for ${calculations.yearsPast} yrs` : "Daily"}):
• Daily Expense: ${formatMoney(calculations.dailyCost, s)}
• 1 Month Expense: ${formatMoney(calculations.monthlyCost, s)}
• 1 Year Expense: ${formatMoney(calculations.yearlyCost, s)}
• 5 Years Expense: ${formatMoney(calculations.resultsMatrix.find(r => r.id === '5y')?.cost, s)}
• 10 Years Expense: ${formatMoney(calculations.resultsMatrix.find(r => r.id === '10y')?.cost, s)}
• Potential 10-Yr Invested Growth (at ${annualReturnRate}% return): ${formatMoney(calculations.resultsMatrix.find(r => r.id === '10y')?.investedValue, s)}

Calculated via ToolsTrek Smoking Cost Calculator`;

    navigator.clipboard.writeText(text);
    toast.success("Summary copied to clipboard!");
  };

  // ─── SAFE PDF MONEY FORMATTER ─────────────────────────────────────────────
  const fmtPDFMoney = (val, code) => {
    if (isNaN(val) || val === null || val === undefined) return `${code} 0`;
    return `${code} ${Number(val).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // ─── DOWNLOAD HIGH-QUALITY PROFESSIONAL PDF REPORT ───────────────────────
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const PW = doc.internal.pageSize.getWidth(); // 210mm
      const PH = doc.internal.pageSize.getHeight(); // 297mm
      const ML = 14; // Margin left
      const MR = 14; // Margin right
      const CW = PW - ML - MR; // Content width = 182mm

      let y = 0;

      // Color Palette
      const C = {
        blue: [37, 99, 235],
        blueDark: [29, 78, 216],
        blueLight: [219, 234, 254],
        red: [220, 38, 38],
        redLight: [254, 226, 226],
        emerald: [5, 150, 105],
        emeraldLight: [209, 250, 229],
        amber: [217, 119, 6],
        amberLight: [254, 243, 199],
        gray900: [17, 24, 39],
        gray800: [31, 41, 55],
        gray700: [55, 65, 81],
        gray600: [75, 85, 99],
        gray500: [107, 114, 128],
        gray200: [229, 231, 235],
        gray100: [243, 244, 246],
        gray50: [249, 250, 251],
        white: [255, 255, 255],
      };

      const safeText = (text, x, yy, opts = {}) => {
        doc.text(String(text ?? ""), x, yy, opts);
      };

      // Header Banner helper
      const drawHeader = (isFirstPage = true) => {
        doc.setFillColor(...C.blue);
        doc.rect(0, 0, PW, 32, "F");

        doc.setFillColor(...C.blueDark);
        doc.rect(0, 28, PW, 4, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...C.white);
        safeText("Smoking Cost & Health Impact Report", ML, 14);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...C.blueLight);
        safeText(
          `Generated on: ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })} | ToolsTrek Calculator`,
          ML,
          22
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...C.white);
        safeText("toolstrek.vercel.app", PW - MR, 14, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.blueLight);
        safeText(`Currency: ${currency.code} | Mode: ${activeTab.toUpperCase()}`, PW - MR, 22, { align: "right" });
      };

      // Page break check helper
      const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > PH - 18) {
          doc.addPage();
          drawHeader(false);
          y = 40;
        }
      };

      // Initial page draw
      drawHeader(true);
      y = 40;

      /* ─── SECTION 1: CONFIGURATION SUMMARY ─── */
      doc.setFillColor(...C.gray50);
      doc.setDrawColor(...C.gray200);
      doc.roundedRect(ML, y, CW, 26, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...C.gray900);
      safeText("INPUT CONFIGURATION SUMMARY", ML + 4, y + 6);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray700);

      let configCol1 = `Selected Currency: ${currency.code} (${currency.name})\nCalculation Mode: ${
        activeTab === "pack"
          ? "Cigarettes Per Pack"
          : activeTab === "pcs"
          ? "Cigarettes Per Piece"
          : activeTab === "vape"
          ? "Vape & Pods"
          : "Other Tobacco"
      }`;

      let configCol2 = "";
      if (activeTab === "pack") {
        configCol2 = `Smoked / Day: ${cigsPerDayPack} sticks | Price / Pack: ${currency.code} ${pricePerPack}\nSticks / Pack: ${sticksPerPack} | Invest Return: ${annualReturnRate}% p.a.`;
      } else if (activeTab === "pcs") {
        configCol2 = `Smoked / Day: ${cigsPerDayPcs} pcs | Price / Piece: ${currency.code} ${pricePerPiece}\nInvest Return: ${annualReturnRate}% p.a. | Past Years: ${yearsSmokedPast} yrs`;
      } else if (activeTab === "vape") {
        configCol2 = `Pods/Mo: ${currency.code} ${podsCostMonthly} | Liquid/Mo: ${currency.code} ${liquidCostMonthly}\nCoils/Mo: ${currency.code} ${coilCostMonthly} | Invest Return: ${annualReturnRate}% p.a.`;
      } else {
        configCol2 = `Item: ${tobaccoItemName}\nDaily Spend: ${currency.code} ${dailyTobaccoSpend} | Invest Return: ${annualReturnRate}% p.a.`;
      }

      doc.text(configCol1, ML + 4, y + 13);
      doc.text(configCol2, ML + 95, y + 13);

      y += 32;

      /* ─── SECTION 2: KEY HIGHLIGHT METRICS ─── */
      checkPageBreak(30);

      const cardW = (CW - 8) / 3;

      // Card 1: Daily Cost
      doc.setFillColor(...C.redLight);
      doc.setDrawColor(...C.red);
      doc.roundedRect(ML, y, cardW, 24, 3, 3, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.red);
      safeText("DAILY SPENDING", ML + 4, y + 5);
      doc.setFontSize(11);
      doc.setTextColor(...C.gray900);
      safeText(fmtPDFMoney(calculations.dailyCost, currency.code), ML + 4, y + 13);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray600);
      safeText(`~${fmtPDFMoney(calculations.monthlyCost, currency.code)} / month`, ML + 4, y + 19);

      // Card 2: 1-Year Cost
      doc.setFillColor(...C.amberLight);
      doc.setDrawColor(...C.amber);
      doc.roundedRect(ML + cardW + 4, y, cardW, 24, 3, 3, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.amber);
      safeText("1-YEAR EXPENSE (365d)", ML + cardW + 4, y + 5);
      doc.setFontSize(11);
      doc.setTextColor(...C.gray900);
      safeText(fmtPDFMoney(calculations.yearlyCost, currency.code), ML + cardW + 4, y + 13);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray600);
      safeText("Direct annual cash burned", ML + cardW + 4, y + 19);

      // Card 3: 10-Year Invested Potential
      const val10y = calculations.resultsMatrix.find((r) => r.id === "10y")?.investedValue || 0;
      doc.setFillColor(...C.emeraldLight);
      doc.setDrawColor(...C.emerald);
      doc.roundedRect(ML + (cardW + 4) * 2, y, cardW, 24, 3, 3, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.emerald);
      safeText(`10-YR INVESTED WEALTH`, ML + (cardW + 4) * 2 + 4, y + 5);
      doc.setFontSize(11);
      doc.setTextColor(...C.emerald);
      safeText(fmtPDFMoney(val10y, currency.code), ML + (cardW + 4) * 2 + 4, y + 13);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray700);
      safeText(`If quit & invested @ ${annualReturnRate}%`, ML + (cardW + 4) * 2 + 4, y + 19);

      y += 30;

      /* ─── SECTION 3: COMPREHENSIVE TIMEFRAME TABLE ─── */
      checkPageBreak(75);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.blueDark);
      safeText("Complete Financial & Life Impact Projections", ML, y);
      y += 2;
      doc.setDrawColor(...C.blue);
      doc.setLineWidth(0.4);
      doc.line(ML, y, ML + CW, y);
      doc.setLineWidth(0.1);
      y += 5;

      // Table Header
      doc.setFillColor(...C.gray100);
      doc.rect(ML, y, CW, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.gray700);

      safeText("Timeframe", ML + 3, y + 5);
      safeText("Smoking Expense", ML + 40, y + 5);
      safeText(`Invested Wealth (@${annualReturnRate}%)`, ML + 90, y + 5);
      safeText("Sticks Smoked", ML + 145, y + 5);
      safeText("Life Impact", ML + 178, y + 5, { align: "right" });

      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      calculations.resultsMatrix.forEach((r, idx) => {
        checkPageBreak(8);

        if (idx % 2 === 1) {
          doc.setFillColor(...C.gray50);
          doc.rect(ML, y, CW, 7, "F");
        }

        doc.setTextColor(...C.gray900);
        doc.setFont("helvetica", "bold");
        safeText(r.label, ML + 3, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.red);
        safeText(fmtPDFMoney(r.cost, currency.code), ML + 40, y + 5);

        doc.setTextColor(...C.emerald);
        doc.setFont("helvetica", "bold");
        safeText(fmtPDFMoney(r.investedValue, currency.code), ML + 90, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.gray700);
        safeText(
          activeTab === "pack" || activeTab === "pcs"
            ? `${r.totalSticks.toLocaleString()} sticks`
            : "N/A",
          ML + 145,
          y + 5
        );

        // Life impact formatting
        let lifeText = "N/A";
        if (r.hoursLost > 0) {
          if (r.daysLost >= 1) {
            lifeText = `-${r.daysLost.toFixed(1)} days`;
          } else {
            lifeText = `-${r.hoursLost.toFixed(1)} hrs`;
          }
        }
        safeText(lifeText, ML + 178, y + 5, { align: "right" });

        y += 7.5;
      });

      y += 5;

      /* ─── SECTION 4: WHAT YOU COULD BUY INSTEAD ─── */
      checkPageBreak(50);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.blueDark);
      safeText("Opportunity Cost - What You Could Buy Instead", ML, y);
      y += 2;
      doc.setDrawColor(...C.blue);
      doc.setLineWidth(0.4);
      doc.line(ML, y, ML + CW, y);
      doc.setLineWidth(0.1);
      y += 6;

      const buyables = [
        {
          period: "1 Month",
          cost: calculations.monthlyCost,
          item: "Gourmet Family Dining & 1 Month Organic Groceries",
        },
        {
          period: "6 Months",
          cost: calculations.monthlyCost * 6,
          item: "Flagship Noise-Canceling Earbuds, Smartwatch, or Tablet",
        },
        {
          period: "1 Year",
          cost: calculations.yearlyCost,
          item: "Latest Flagship Smartphone (iPhone/Galaxy) or High-Spec Laptop",
        },
        {
          period: "5 Years",
          cost: calculations.yearlyCost * 5,
          item: "Brand New Motorbike / Scooter or International Family Vacation",
        },
      ];

      buyables.forEach((b) => {
        checkPageBreak(10);
        doc.setFillColor(...C.gray50);
        doc.roundedRect(ML, y, CW, 8, 1.5, 1.5, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C.blueDark);
        safeText(`${b.period} (${fmtPDFMoney(b.cost, currency.code)}):`, ML + 3, y + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.gray800);
        safeText(b.item, ML + 55, y + 5.5);

        y += 10;
      });

      y += 4;

      /* ─── SECTION 5: HEALTH RECOVERY MILESTONES ─── */
      checkPageBreak(55);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.blueDark);
      safeText("Health & Body Recovery Timeline After Quitting", ML, y);
      y += 2;
      doc.setDrawColor(...C.blue);
      doc.setLineWidth(0.4);
      doc.line(ML, y, ML + CW, y);
      doc.setLineWidth(0.1);
      y += 6;

      const healthMilestones = [
        { time: "20 Minutes", detail: "Blood pressure and pulse rate drop back to normal levels." },
        { time: "12 Hours", detail: "Carbon monoxide level in blood drops to normal, raising oxygen levels." },
        { time: "2 Wks - 3 Mos", detail: "Circulation improves and lung function increases by up to 30%." },
        { time: "1 Year", detail: "Excess risk of coronary heart disease drops by 50% compared to a smoker." },
        { time: "5 Years", detail: "Stroke risk is reduced to that of a non-smoker 5 to 15 years after quitting." },
        { time: "10 Years", detail: "Lung cancer death rate drops by 50% compared to continuing smokers." },
      ];

      healthMilestones.forEach((m) => {
        checkPageBreak(8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C.emerald);
        safeText(`• ${m.time}:`, ML + 3, y + 4);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.gray700);
        safeText(m.detail, ML + 35, y + 4);

        y += 6.5;
      });

      /* ─── FOOTER WITH PAGE NUMBERS ─── */
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.gray500);

        doc.setDrawColor(...C.gray200);
        doc.line(ML, PH - 12, ML + CW, PH - 12);

        safeText("ToolsTrek Free Online Calculators | https://toolstrek.vercel.app", ML, PH - 7);
        safeText(`Page ${p} of ${totalPages}`, PW - MR, PH - 7, { align: "right" });
      }

      doc.save(`Smoking_Cost_Report_${currency.code}_ToolsTrek.pdf`);
      toast.success("Professional PDF report downloaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF report.");
    }
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="pt-6 pb-16 px-3 sm:px-6">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <CigaretteOff className="w-4 h-4" />
            Financial & Health Impact Calculator
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Smoking Cost Calculator
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Calculate the exact money spent on cigarettes, vape, or tobacco over time. See how much wealth you could build if you quit today!
          </p>
        </div>

        {/* TOP CONFIGURATION BAR: CURRENCY SELECT + TAB SWITCHER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 sm:p-6 shadow-xl mb-8 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* Currency Select */}
            <div className="md:col-span-1">
              <ModernCurrencySelect
                value={currencyCode}
                onChange={setCurrencyCode}
              />
            </div>

            {/* Main Tabs Selection */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Calculation Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700/60">
                <button
                  type="button"
                  onClick={() => setActiveTab("pack")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "pack"
                      ? "bg-brandColor text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Per Pack</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("pcs")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "pcs"
                      ? "bg-brandColor text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Cigarette className="w-4 h-4" />
                  <span>Per Piece</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("vape")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "vape"
                      ? "bg-brandColor text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Wind className="w-4 h-4" />
                  <span>Vape & Pods</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("tobacco")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "tobacco"
                      ? "bg-brandColor text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Others</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* INPUT & ACTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* INPUT FORM PANEL (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Coins className="w-5 h-5 text-brandColor" />
                Input Details
              </h2>

              {/* TAB 1: CIGARETTES PER PACK */}
              {activeTab === "pack" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Cigarettes Smoked Per Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={cigsPerDayPack}
                      onChange={(e) => setCigsPerDayPack(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                    />
                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {["5", "10", "15", "20", "30", "40"].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCigsPerDayPack(num)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                            cigsPerDayPack === num
                              ? "bg-brandColor text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {num} {num === "20" ? "(1 Pack)" : "sticks"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Price Per Pack ({currency.symbol})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                        {currency.symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={pricePerPack}
                        onChange={(e) => setPricePerPack(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                      />
                    </div>
                    {currency.code === "BDT" && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {["200", "250", "300", "360", "400"].map((price) => (
                          <button
                            key={price}
                            type="button"
                            onClick={() => setPricePerPack(price)}
                            className={`px-2 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                              pricePerPack === price
                                ? "bg-brandColor text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                            }`}
                          >
                            ৳{price}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Cigarettes Per Pack
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={sticksPerPack}
                      onChange={(e) => setSticksPerPack(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                    />
                    <div className="flex gap-1.5 mt-2">
                      {["10", "12", "20", "25"].map((stk) => (
                        <button
                          key={stk}
                          type="button"
                          onClick={() => setSticksPerPack(stk)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                            sticksPerPack === stk
                              ? "bg-brandColor text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {stk} per pack
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CIGARETTES PER PIECE */}
              {activeTab === "pcs" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Cigarettes Smoked Per Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={cigsPerDayPcs}
                      onChange={(e) => setCigsPerDayPcs(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {["5", "10", "15", "20", "25", "30"].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCigsPerDayPcs(num)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                            cigsPerDayPcs === num
                              ? "bg-brandColor text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {num} pcs
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Price Per Piece / Stick ({currency.symbol})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                        {currency.symbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={pricePerPiece}
                        onChange={(e) => setPricePerPiece(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                      />
                    </div>
                    {currency.code === "BDT" && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {["12", "14", "16", "18", "20"].map((price) => (
                          <button
                            key={price}
                            type="button"
                            onClick={() => setPricePerPiece(price)}
                            className={`px-2 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                              pricePerPiece === price
                                ? "bg-brandColor text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                            }`}
                          >
                            ৳{price} / stick
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: VAPE & PODS */}
              {activeTab === "vape" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Pods / Disposables Cost Per Month ({currency.symbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={podsCostMonthly}
                      onChange={(e) => setPodsCostMonthly(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      E-Liquid Bottles Cost Per Month ({currency.symbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={liquidCostMonthly}
                      onChange={(e) => setLiquidCostMonthly(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Coils & Maintenance Cost Per Month ({currency.symbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={coilCostMonthly}
                      onChange={(e) => setCoilCostMonthly(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: OTHER TOBACCO */}
              {activeTab === "tobacco" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Item Description
                    </label>
                    <input
                      type="text"
                      value={tobaccoItemName}
                      onChange={(e) => setTobaccoItemName(e.target.value)}
                      placeholder="e.g. Shisha / Cigar / Paan Gutka"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Daily Spend ({currency.symbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={dailyTobaccoSpend}
                      onChange={(e) => setDailyTobaccoSpend(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-brandColor/50 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ADVANCED INVESTMENT & HISTORY OPTIONS */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Past Smoking & Investment Return Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Years Smoked in Past
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={yearsSmokedPast}
                      onChange={(e) => setYearsSmokedPast(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Expected Investment Return (% p.a.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={annualReturnRate}
                      onChange={(e) => setAnnualReturnRate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  Copy Summary
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brandColor text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  PDF Report
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                  title="Reset Calculator"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>

          {/* RESULTS DISPLAY PANEL (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* KEY METRICS TOP HIGHLIGHT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 dark:border-red-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Daily Cost
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {formatMoney(calculations.dailyCost, currency.symbol)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ~{formatMoney(calculations.monthlyCost, currency.symbol)} per month
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  1 Year Cost
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {formatMoney(calculations.yearlyCost, currency.symbol)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Direct cash burned in 365 days
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  10-Year Invested Wealth
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatMoney(
                    calculations.resultsMatrix.find((r) => r.id === "10y")
                      ?.investedValue,
                    currency.symbol
                  )}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
                  If quit & invested @ {annualReturnRate}% return
                </div>
              </div>

            </div>

            {/* FULL RESULTS TIMEFRAME MATRIX */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brandColor" />
                  Cost & Savings Projections
                </h2>
                <span className="text-xs font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
                  {currency.code} ({currency.symbol})
                </span>
              </div>

              {/* Table / Grid list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                      <th className="py-3 px-3">Timeframe</th>
                      <th className="py-3 px-3">Smoking Expense</th>
                      <th className="py-3 px-3">Invested Wealth (@{annualReturnRate}%)</th>
                      {(activeTab === "pack" || activeTab === "pcs") && (
                        <th className="py-3 px-3 text-right">Sticks Smoked</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                    {calculations.resultsMatrix.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-3 font-bold text-gray-900 dark:text-white">
                          {row.label}
                        </td>
                        <td className="py-3.5 px-3 text-red-600 dark:text-red-400 font-extrabold">
                          {formatMoney(row.cost, currency.symbol)}
                        </td>
                        <td className="py-3.5 px-3 text-emerald-600 dark:text-emerald-400 font-extrabold">
                          {formatMoney(row.investedValue, currency.symbol)}
                        </td>
                        {(activeTab === "pack" || activeTab === "pcs") && (
                          <td className="py-3.5 px-3 text-right text-gray-500 dark:text-gray-400 text-xs font-bold">
                            {row.totalSticks.toLocaleString()} sticks
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAST MONEY BURNED SUMMARY (IF YEARS SMOKED > 0) */}
            {calculations.yearsPast > 0 && (
              <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-red-500/20 rounded-3xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-bold">
                    🔥
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-red-600 dark:text-red-400">
                      Past Money Burned ({calculations.yearsPast} Years)
                    </div>
                    <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                      {formatMoney(calculations.pastCost, currency.symbol)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-right text-gray-500 dark:text-gray-400 max-w-[150px]">
                  Estimated past expenditure based on current daily habit
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ─── SHOW OTHERS INFORMATION: OPPORTUNITY COST & HEALTH BENEFITS ─── */}
        <div className="space-y-8 mt-12">
          
          {/* SECTION 1: WHAT YOU COULD BUY INSTEAD */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-brandColor" />
                What You Could Buy Instead (Opportunity Cost)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                See real-world items you can afford by redirecting your smoking expenses into savings!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1 Month */}
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-brandColor/50 transition-all">
                <div className="text-xs font-bold text-brandColor uppercase tracking-wider">
                  In 1 Month ({formatMoney(calculations.monthlyCost, currency.symbol)})
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                  🍲 Premium Dining & Groceries
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enjoy multiple gourmet family dinners or stock up on 1 month of high-quality organic groceries.
                </p>
              </div>

              {/* 6 Months */}
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-brandColor/50 transition-all">
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                  In 6 Months ({formatMoney(calculations.monthlyCost * 6, currency.symbol)})
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                  🎧 Flagship Tech Gadgets
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Buy noise-canceling wireless earbuds, a smartwatch, or a modern tablet computer.
                </p>
              </div>

              {/* 1 Year */}
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-brandColor/50 transition-all">
                <div className="text-xs font-bold text-purple-500 uppercase tracking-wider">
                  In 1 Year ({formatMoney(calculations.yearlyCost, currency.symbol)})
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                  📱 iPhone / Laptop / Vacation
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upgrade to a brand new flagship Smartphone, a high-end laptop, or take a domestic holiday trip.
                </p>
              </div>

              {/* 5 Years */}
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-brandColor/50 transition-all">
                <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  In 5 Years ({formatMoney(calculations.yearlyCost * 5, currency.symbol)})
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                  🏍️ Motorbike / Luxury Tour
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Buy a brand-new motorcycle or enjoy an all-inclusive luxury international vacation with family!
                </p>
              </div>

            </div>
          </div>

          {/* SECTION 2: HEALTH & LIFE EXPECTANCY RECOVERY TIMELINE */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HeartPulse className="w-6 h-6 text-red-500" />
                Health Recovery & Life Saved Timeline
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Medical studies show each cigarette stick reduces life expectancy by ~11 minutes. Here is how your body recovers when you quit!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                <Zap className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    20 Minutes After Quitting
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Pulse rate and blood pressure drop back to healthy normal levels.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    12 Hours After Quitting
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Carbon monoxide level in your blood drops to normal, raising oxygen levels.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                <HeartPulse className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    2 Weeks to 3 Months
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Blood circulation and lung capacity improve by up to 30%.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    1 Year After Quitting
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Excess risk of coronary heart disease drops by 50% compared to a smoker.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-3">
                <Award className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    5 Years After Quitting
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Stroke risk is reduced to that of a non-smoker 5 to 15 years after quitting.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    10 Years After Quitting
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Lung cancer death rate drops by ~50% compared to continuing smokers.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: FREQUENTLY ASKED QUESTIONS */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 text-sm">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  How does the Smoking Cost Calculator compute results?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Our calculator takes your daily consumption rate and price per pack or piece, then multiplies across standard intervals (1 day, 7 days, 30 days, 365 days up to 20 years). Additionally, it calculates compound interest growth if you deposit those daily savings into an investment account.
                </p>
              </div>

              <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Why is BDT set as the default currency?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Bangladeshi Taka (BDT ৳) is configured as the default currency for fast local calculations, but you can seamlessly switch to any of 30+ global currencies using our modern searchable dropdown menu!
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  What is the compound interest return feature?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Instead of simply hoarding cash in a piggy bank, quitting smoking allows you to invest your unspent daily cigarette money into stocks, mutual funds, or high-yield savings. Over 10 to 20 years, compound interest significantly amplifies your total wealth.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </ToolPageShell>
  );
}
