"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import ToolPageShell from "../ToolPageShell";
import ReactCountryFlag from "react-country-flag";
import {
  Coins,
  Info,
  ChevronDown,
  Check,
  RotateCcw,
  AlertCircle,
  Sparkles,
  TrendingUp,
  HelpCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  DollarSign
} from "lucide-react";

// Currencies mapping for the custom dropdown
const CURRENCIES = [
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", country: "BD" },
  { code: "USD", name: "US Dollar", symbol: "$", country: "US" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", country: "PK" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "IN" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", country: "SA" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", country: "AE" },
  { code: "EUR", name: "Euro", symbol: "€", country: "FR" },
  { code: "GBP", name: "British Pound", symbol: "£", country: "GB" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", country: "CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", country: "AU" },
];

// Nisab presets
const NISAB_PRESETS = [
  { id: "silver_std", label: "Silver Nisab (612.36g)", weight: 612.36, type: "silver", desc: "Standard Nisab based on Silver. Recommended for maximum charity outreach." },
  { id: "gold_std", label: "Gold Nisab (87.48g)", weight: 87.48, type: "gold", desc: "Standard Nisab based on Gold." },
  { id: "silver_alt", label: "Silver Nisab (595.00g)", weight: 595.00, type: "silver", desc: "Alternative Silver Nisab weight used by some scholars." },
  { id: "gold_alt", label: "Gold Nisab (85.00g)", weight: 85.00, type: "gold", desc: "Alternative Gold Nisab weight (85g) used by some scholars." },
  { id: "custom", label: "Custom Nisab Value", weight: 0, type: "custom", desc: "Define your own Nisab currency value directly." },
];

// Calendar Presets
const CALENDARS = [
  { id: "hijri", label: "Hijri / Lunar Year (2.50%)", rate: 2.50, desc: "Traditional lunar year calculation (354 days). Rate is exactly 2.5%." },
  { id: "gregorian", label: "Gregorian / Solar Year (2.577%)", rate: 2.577, desc: "Solar calendar year calculation (365 days) which adjusts for the extra 11 days. Rate is 2.577%." },
];

export default function ZakatCalculator() {
  // Main assets states
  const [cash, setCash] = useState("");
  const [goldWeight, setGoldWeight] = useState("");
  const [goldPrice, setGoldPrice] = useState("8800"); // default estimate per gram in BDT
  const [silverWeight, setSilverWeight] = useState("");
  const [silverPrice, setSilverPrice] = useState("110"); // default estimate per gram in BDT
  const [investments, setInvestments] = useState("");
  const [receivables, setReceivables] = useState("");
  const [liabilities, setLiabilities] = useState("");

  // Advanced Mode State
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced inputs
  const [crypto, setCrypto] = useState("");
  const [pension, setPension] = useState("");
  const [businessInventory, setBusinessInventory] = useState("");
  const [realEstateEquity, setRealEstateEquity] = useState("");
  const [customNisabValue, setCustomNisabValue] = useState("");
  const [customZakatRate, setCustomZakatRate] = useState("");
  const [isCustomRateActive, setIsCustomRateActive] = useState(false);

  // Custom Dropdowns open states
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [nisabDropdownOpen, setNisabDropdownOpen] = useState(false);
  const [calendarDropdownOpen, setCalendarDropdownOpen] = useState(false);

  // Dropdown selections
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [selectedNisab, setSelectedNisab] = useState(NISAB_PRESETS[0]);
  const [selectedCalendar, setSelectedCalendar] = useState(CALENDARS[0]);

  // Dropdown Refs for Click Outside
  const currencyRef = useRef(null);
  const nisabRef = useRef(null);
  const calendarRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyDropdownOpen(false);
      }
      if (nisabRef.current && !nisabRef.current.contains(event.target)) {
        setNisabDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick preset actions for Gold/Silver prices depending on Currency
  useEffect(() => {
    // Basic approximate values for different currencies to make it dynamic
    const prices = {
      USD: { gold: 75, silver: 0.95 },
      BDT: { gold: 8800, silver: 110 },
      PKR: { gold: 21000, silver: 260 },
      INR: { gold: 6200, silver: 78 },
      SAR: { gold: 280, silver: 3.5 },
      AED: { gold: 275, silver: 3.4 },
      EUR: { gold: 70, silver: 0.88 },
      GBP: { gold: 60, silver: 0.75 },
      CAD: { gold: 100, silver: 1.25 },
      AUD: { gold: 112, silver: 1.40 },
    };
    const currentPrice = prices[selectedCurrency.code] || prices.USD;
    setGoldPrice(currentPrice.gold.toString());
    setSilverPrice(currentPrice.silver.toString());
  }, [selectedCurrency]);

  // Reset all fields
  const handleReset = () => {
    setCash("");
    setGoldWeight("");
    setSilverWeight("");
    setInvestments("");
    setReceivables("");
    setLiabilities("");

    // Advanced fields
    setCrypto("");
    setPension("");
    setBusinessInventory("");
    setRealEstateEquity("");
    setCustomNisabValue("");
    setCustomZakatRate("");
    setIsCustomRateActive(false);

    // Selectors
    setSelectedCurrency(CURRENCIES[0]);
    setSelectedNisab(NISAB_PRESETS[0]);
    setSelectedCalendar(CALENDARS[0]);
    setShowAdvanced(false);
  };

  // Perform Calculations
  const results = useMemo(() => {
    const cashVal = parseFloat(cash) || 0;
    const gWeight = parseFloat(goldWeight) || 0;
    const gPrice = parseFloat(goldPrice) || 0;
    const sWeight = parseFloat(silverWeight) || 0;
    const sPrice = parseFloat(silverPrice) || 0;
    const invVal = parseFloat(investments) || 0;
    const recVal = parseFloat(receivables) || 0;
    const liabVal = parseFloat(liabilities) || 0;

    // Advanced fields (only included if showAdvanced is true, or always compute for accuracy)
    const cryptoVal = showAdvanced ? (parseFloat(crypto) || 0) : 0;
    const pensionVal = showAdvanced ? (parseFloat(pension) || 0) : 0;
    const businessVal = showAdvanced ? (parseFloat(businessInventory) || 0) : 0;
    const realEstateVal = showAdvanced ? (parseFloat(realEstateEquity) || 0) : 0;

    const goldTotal = gWeight * gPrice;
    const silverTotal = sWeight * sPrice;

    const totalAssets = cashVal + goldTotal + silverTotal + invVal + recVal + cryptoVal + pensionVal + businessVal + realEstateVal;
    const netWealth = Math.max(0, totalAssets - liabVal);

    // Calculate Nisab Threshold Value
    let nisabThreshold = 0;
    if (selectedNisab.type === "gold") {
      nisabThreshold = selectedNisab.weight * gPrice;
    } else if (selectedNisab.type === "silver") {
      nisabThreshold = selectedNisab.weight * sPrice;
    } else if (selectedNisab.type === "custom") {
      nisabThreshold = parseFloat(customNisabValue) || 0;
    }

    // Determine Rate
    const currentRate = (showAdvanced && isCustomRateActive)
      ? (parseFloat(customZakatRate) || 0)
      : selectedCalendar.rate;

    const isEligible = netWealth >= nisabThreshold && totalAssets > 0;
    const zakatPayable = isEligible ? netWealth * (currentRate / 100) : 0;

    return {
      goldTotal,
      silverTotal,
      totalAssets,
      netWealth,
      nisabThreshold,
      zakatRate: currentRate,
      isEligible,
      zakatPayable,
      breakdown: [
        { name: "Cash & Savings", value: cashVal, color: "bg-emerald-500 text-emerald-500" },
        { name: "Gold Holdings", value: goldTotal, color: "bg-amber-400 text-amber-400" },
        { name: "Silver Holdings", value: silverTotal, color: "bg-slate-300 text-slate-300" },
        { name: "Investments", value: invVal, color: "bg-blue-500 text-blue-500" },
        { name: "Receivables", value: recVal, color: "bg-indigo-400 text-indigo-400" },
        ...(showAdvanced ? [
          { name: "Crypto Holdings", value: cryptoVal, color: "bg-purple-500 text-purple-500" },
          { name: "Pension / Retirement", value: pensionVal, color: "bg-pink-500 text-pink-500" },
          { name: "Business Inventory", value: businessVal, color: "bg-orange-400 text-orange-400" },
          { name: "Real Estate Equity", value: realEstateVal, color: "bg-teal-500 text-teal-500" },
        ] : []),
      ].filter(item => item.value > 0),
    };
  }, [
    cash, goldWeight, goldPrice, silverWeight, silverPrice, investments, receivables, liabilities,
    showAdvanced, crypto, pension, businessInventory, realEstateEquity, selectedNisab, customNisabValue,
    selectedCalendar, customZakatRate, isCustomRateActive
  ]);

  const hasInputs = parseFloat(cash) > 0 || parseFloat(goldWeight) > 0 || parseFloat(silverWeight) > 0 || parseFloat(investments) > 0 || parseFloat(receivables) > 0;

  return (
    <ToolPageShell widthClassName="max-w-7xl px-2 py-8">
      <div className="font-sans text-gray-900 dark:text-gray-100">

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-full mb-3 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Islamic Finance Tool</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 dark:from-emerald-400 dark:via-teal-400 dark:to-amber-400 bg-clip-text text-transparent">
            Zakat Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-base sm:text-lg leading-relaxed">
            Calculate your yearly Zakat obligation easily and accurately. Input your assets and liabilities, select Nisab preferences, and generate a detailed wealth distribution report.
          </p>
        </div>

        {/* Top Control Bar: Currency Selector & Reset */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Custom Currency Dropdown */}
          <div className="relative w-full sm:w-72" ref={currencyRef}>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Calculation Currency
            </label>
            <button
              type="button"
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-850 dark:text-gray-200 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-left"
            >
              <span className="flex items-center gap-2.5">
                <span className="w-6 h-4 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-xs">
                  <ReactCountryFlag
                    countryCode={selectedCurrency.country}
                    svg
                    style={{ width: "1.2rem", height: "0.9rem", objectFit: "cover" }}
                    title={selectedCurrency.name}
                  />
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedCurrency.code} ({selectedCurrency.symbol})
                </span>
                <span className="text-gray-400 dark:text-gray-400 text-xs truncate max-w-[100px]">
                  — {selectedCurrency.name}
                </span>
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${currencyDropdownOpen ? "rotate-180 text-emerald-500" : ""}`} />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto">
                {CURRENCIES.map((curr) => {
                  const isSel = curr.code === selectedCurrency.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => {
                        setSelectedCurrency(curr);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${isSel
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-gray-700 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-5 h-3.5 flex items-center justify-center rounded overflow-hidden shadow-2xs">
                          <ReactCountryFlag countryCode={curr.country} svg style={{ objectFit: "cover" }} />
                        </span>
                        <span>{curr.code} ({curr.symbol})</span>
                        <span className="text-xs text-gray-400">— {curr.name}</span>
                      </span>
                      {isSel && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Info & Reset */}
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-100 dark:hover:border-red-900/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Inputs
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Input Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Cash and Liquid Assets Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 px-6 py-4 flex items-center gap-3 text-white">
                <Coins className="w-5 h-5" />
                <h2 className="font-bold text-lg">Cash & Financial Assets</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Cash & Bank Balances
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-medium">
                      {selectedCurrency.symbol}
                    </div>
                    <input
                      type="number"
                      value={cash}
                      onChange={(e) => setCash(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Include physical cash, savings, checking accounts, and emergency funds.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Stocks, Mutual Funds & Bonds
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-medium">
                      {selectedCurrency.symbol}
                    </div>
                    <input
                      type="number"
                      value={investments}
                      onChange={(e) => setInvestments(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Value of your active investment portfolios at current market rates.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Receivables (Money owed to you)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-medium">
                      {selectedCurrency.symbol}
                    </div>
                    <input
                      type="number"
                      value={receivables}
                      onChange={(e) => setReceivables(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Include loans given out or business funds you are guaranteed to recover.
                  </p>
                </div>
              </div>
            </div>

            {/* Gold & Silver Assets Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center gap-3 text-white">
                <Sparkles className="w-5 h-5 text-yellow-250" />
                <h2 className="font-bold text-lg">Precious Metals</h2>
              </div>
              <div className="p-6 space-y-6">

                {/* Gold section */}
                <div className="p-4 bg-amber-500/5 dark:bg-amber-500/2 rounded-2xl border border-amber-500/10">
                  <h3 className="font-bold text-sm text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Gold Holdings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Weight (Grams)
                      </label>
                      <input
                        type="number"
                        value={goldWeight}
                        onChange={(e) => setGoldWeight(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Price (per Gram)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                          {selectedCurrency.symbol}
                        </div>
                        <input
                          type="number"
                          value={goldPrice}
                          onChange={(e) => setGoldPrice(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                  {parseFloat(goldWeight) > 0 && (
                    <div className="mt-2.5 text-xs text-amber-700 dark:text-amber-400 font-semibold flex justify-between">
                      <span>Estimated Gold Value:</span>
                      <span>{selectedCurrency.symbol}{results.goldTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                {/* Silver section */}
                <div className="p-4 bg-slate-500/5 dark:bg-slate-500/2 rounded-2xl border border-slate-500/10">
                  <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Silver Holdings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Weight (Grams)
                      </label>
                      <input
                        type="number"
                        value={silverWeight}
                        onChange={(e) => setSilverWeight(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-slate-400/30 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Price (per Gram)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                          {selectedCurrency.symbol}
                        </div>
                        <input
                          type="number"
                          value={silverPrice}
                          onChange={(e) => setSilverPrice(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-slate-400/30 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                  {parseFloat(silverWeight) > 0 && (
                    <div className="mt-2.5 text-xs text-gray-600 dark:text-gray-400 font-semibold flex justify-between">
                      <span>Estimated Silver Value:</span>
                      <span>{selectedCurrency.symbol}{results.silverTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Liabilities & Debts Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 flex items-center gap-3 text-white">
                <AlertCircle className="w-5 h-5" />
                <h2 className="font-bold text-lg">Liabilities & Debts</h2>
              </div>
              <div className="p-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Short-Term Debts & Bills Due
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-medium">
                      {selectedCurrency.symbol}
                    </div>
                    <input
                      type="number"
                      value={liabilities}
                      onChange={(e) => setLiabilities(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium text-red-650 dark:text-red-400"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Subtract immediate household bills, loans due this month, or commercial liabilities.
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Option Toggle Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${showAdvanced
                  ? "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/35 text-emerald-700 dark:text-emerald-400 font-bold"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-750 dark:text-gray-300 font-semibold"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Advanced Calculation Settings</span>
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-350 ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Advanced Options Section (Visible when clicked) */}
            {showAdvanced && (
              <div className="p-6 bg-slate-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-3xl space-y-6 transition-all duration-300">

                {/* Visual Section Indicator as user requested */}
                <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-black text-gray-800 dark:text-gray-150 text-base tracking-wide uppercase">
                    Advanced options are:
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Customize your Nisab levels, calendar rates, custom rate, and advanced wealth holdings.</p>
                </div>

                {/* Dropdowns group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Nisab Selector Dropdown */}
                  <div className="relative" ref={nisabRef}>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      Nisab Benchmark
                    </label>
                    <button
                      type="button"
                      onClick={() => setNisabDropdownOpen(!nisabDropdownOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-200 shadow-xs outline-none text-left"
                    >
                      <span className="truncate">{selectedNisab.label}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 ml-1.5" />
                    </button>
                    {nisabDropdownOpen && (
                      <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden text-xs">
                        {NISAB_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedNisab(p);
                              setNisabDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 border-b border-gray-50 dark:border-gray-750 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-755 transition-colors ${p.id === selectedNisab.id ? "text-emerald-500 font-bold" : "text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            <div className="font-bold">{p.label}</div>
                            <div className="text-[10px] text-gray-400">{p.desc}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Calendar Selector Dropdown */}
                  <div className="relative" ref={calendarRef}>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      Calendar & Zakat Rate
                    </label>
                    <button
                      type="button"
                      onClick={() => setCalendarDropdownOpen(!calendarDropdownOpen)}
                      className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-200 shadow-xs outline-none text-left"
                    >
                      <span className="truncate">{selectedCalendar.label}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 ml-1.5" />
                    </button>
                    {calendarDropdownOpen && (
                      <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden text-xs">
                        {CALENDARS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCalendar(c);
                              setCalendarDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 border-b border-gray-50 dark:border-gray-750 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-755 transition-colors ${c.id === selectedCalendar.id ? "text-emerald-500 font-bold" : "text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            <div className="font-bold">{c.label}</div>
                            <div className="text-[10px] text-gray-400">{c.desc}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Custom inputs based on dropdown selections */}
                {selectedNisab.id === "custom" && (
                  <div className="p-4 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl animate-in fade-in duration-200">
                    <label className="block text-xs font-semibold text-gray-650 dark:text-gray-300 mb-1.5">
                      Custom Nisab Value ({selectedCurrency.code})
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                        {selectedCurrency.symbol}
                      </div>
                      <input
                        type="number"
                        value={customNisabValue}
                        onChange={(e) => setCustomNisabValue(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full pl-7 pr-3 py-2 border border-gray-200 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* Custom rate override */}
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-750 dark:text-gray-350">
                      Override Standard Rate
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomRateActive(!isCustomRateActive)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${isCustomRateActive ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-750"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${isCustomRateActive ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>
                  {isCustomRateActive && (
                    <div className="relative mt-2 animate-in fade-in duration-200">
                      <input
                        type="number"
                        value={customZakatRate}
                        onChange={(e) => setCustomZakatRate(e.target.value)}
                        placeholder="Enter percentage (e.g. 2.5)"
                        step="0.001"
                        className="w-full pr-7 pl-3 py-2 border border-gray-200 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                        %
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced asset categories */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider">
                    Advanced / Non-Standard Wealth Categories
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1">
                        Cryptocurrency Portfolio Value
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                          {selectedCurrency.symbol}
                        </div>
                        <input
                          type="number"
                          value={crypto}
                          onChange={(e) => setCrypto(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2.5 border border-gray-205 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1">
                        Provident Fund / Pension (Retrievable)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                          {selectedCurrency.symbol}
                        </div>
                        <input
                          type="number"
                          value={pension}
                          onChange={(e) => setPension(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2.5 border border-gray-205 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1">
                        Business Goods & Merchandise Value
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                          {selectedCurrency.symbol}
                        </div>
                        <input
                          type="number"
                          value={businessInventory}
                          onChange={(e) => setBusinessInventory(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2.5 border border-gray-205 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-755 dark:text-gray-300 mb-1">
                        Real Estate Investment Equity
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xs">
                          {selectedCurrency.symbol}
                        </div>
                        <input
                          type="number"
                          value={realEstateEquity}
                          onChange={(e) => setRealEstateEquity(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2.5 border border-gray-205 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Results & Analytics (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

            {/* Calculation Output Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 rounded-3xl shadow-md p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/0 rounded-bl-full pointer-events-none"></div>

              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Zakat Summary
              </h2>

              <div className="space-y-4">
                {/* Zakat Payable display */}
                <div className="text-center py-6 bg-emerald-550/5 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/15">
                  <span className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-450 uppercase tracking-widest mb-1.5">
                    Zakat Payable Due
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {selectedCurrency.symbol}
                    {results.zakatPayable.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  {results.isEligible ? (
                    <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Nisab Threshold Reached
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold">
                      <Info className="w-3.5 h-3.5" />
                      Below Nisab Threshold
                    </div>
                  )}
                </div>

                {/* Sub calculations breakdown */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Capital Assets:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {selectedCurrency.symbol}
                      {results.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Deductions / Liabilities:</span>
                    <span className="font-semibold text-red-500 dark:text-red-400">
                      -{selectedCurrency.symbol}
                      {parseFloat(liabilities) ? (parseFloat(liabilities)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Net Wealth (Eligible Wealth):</span>
                    <span className="font-bold text-gray-800 dark:text-white">
                      {selectedCurrency.symbol}
                      {results.netWealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      Nisab Limit:
                      <span className="group relative cursor-pointer text-gray-400 hover:text-emerald-500">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 w-48 p-2 mb-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-md hidden group-hover:block leading-normal font-normal">
                          Zakat is only payable if your Net Wealth exceeds this threshold and stays above it for a full year.
                        </span>
                      </span>
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {selectedCurrency.symbol}
                      {results.nisabThreshold.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Zakat Rate Utilized:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {results.zakatRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Breakdown Chart (SVG Representation) */}
            {hasInputs && results.breakdown.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 rounded-3xl shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Asset Concentration
                </h3>
                <div className="space-y-3">
                  {results.breakdown.map((item, idx) => {
                    const percent = results.totalAssets ? (item.value / results.totalAssets) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-650 dark:text-gray-350">{item.name}</span>
                          <span className="text-gray-500">{percent.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color.split(" ")[0]}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Zakat Knowledge / FAQ Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-emerald-800 dark:text-emerald-450 flex items-center gap-2 text-sm sm:text-base">
                <BookOpen className="w-4.5 h-4.5" />
                Quick Zakat Rules Guide
              </h3>
              <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <div>
                  <h4 className="font-bold text-gray-755 dark:text-gray-250 mb-0.5">What is Nisab?</h4>
                  <p>Nisab is the minimum wealth a Muslim must possess before they are obligated to pay Zakat. It is benchmarked against either 87.48 grams of Gold or 612.36 grams of Silver.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-755 dark:text-gray-250 mb-0.5">What is the Lunar vs Solar rate difference?</h4>
                  <p>Standard lunar calculations require exactly 2.5%. If you calculate using solar/gregorian days, Zakat increases to 2.577% to account for the additional 11 calendar days.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-755 dark:text-gray-250 mb-0.5">Who receives Zakat?</h4>
                  <p>Zakat must be distributed to specific categories mentioned in Quran 9:60, primarily the poor, the needy, those in debt, and wayfarers.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </ToolPageShell>
  );
}
