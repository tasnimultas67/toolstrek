"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import ToolPageShell from "../ToolPageShell";
import {
  Percent,
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
  DollarSign,
  History,
  Download,
  Trash2,
  Plus,
  Minus,
  Scale,
  ShoppingCart,
  Tag,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Currencies mapping for the custom dropdown
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", country: "US" },
  { code: "EUR", name: "Euro", symbol: "€", country: "FR" },
  { code: "GBP", name: "British Pound", symbol: "£", country: "GB" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", country: "BD" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "IN" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", country: "SA" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", country: "AE" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", country: "CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", country: "AU" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "JP" },
];

// Coupon Code presets simulator
const COUPONS = [
  { code: "SAVE10", rate: 10, type: "percent", minSpend: 50, maxDiscount: 20, desc: "10% off for purchases over $50 (Max $20 discount)" },
  { code: "FLASH25", rate: 25, type: "percent", minSpend: 100, maxDiscount: 50, desc: "25% off for purchases over $100 (Max $50 discount)" },
  { code: "SUPER50", rate: 50, type: "amount", minSpend: 200, maxDiscount: 50, desc: "$50 off flat for purchases over $200" },
  { code: "WELCOME5", rate: 5, type: "percent", minSpend: 0, maxDiscount: 1000, desc: "5% off for new customers (No minimum spend)" }
];

export default function DiscountCalculator() {
  // Tabs: "discount" | "bogo" | "compare"
  const [activeTab, setActiveTab] = useState("discount");

  // Common Currency State
  const [selectedCurrency, setSelectedCurrency] = useState(
    CURRENCIES.find(c => c.code === "BDT") || CURRENCIES[0]
  );
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currencyRef = useRef(null);

  // --- TAB 1: STANDARD & ADVANCED DISCOUNT CALCULATOR STATES ---
  const [originalPrice, setOriginalPrice] = useState("100");
  const [discountType, setDiscountType] = useState("percent"); // "percent" | "amount"
  const [discountValue, setDiscountValue] = useState("20");
  
  // Advanced options toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced variables
  const [secondDiscountType, setSecondDiscountType] = useState("percent"); // "percent" | "amount"
  const [secondDiscountValue, setSecondDiscountValue] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [taxType, setTaxType] = useState("exclusive"); // "exclusive" (added) | "inclusive" (included)
  const [quantity, setQuantity] = useState("1");
  const [cashBackType, setCashBackType] = useState("amount"); // "percent" | "amount"
  const [cashBackValue, setCashBackValue] = useState("0");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // --- TAB 2: BOGO (Buy X Get Y) CALCULATOR STATES ---
  const [bogoBuy, setBogoBuy] = useState("2");
  const [bogoGet, setBogoGet] = useState("1");
  const [bogoDiscount, setBogoDiscount] = useState("100"); // 100% free, 50% off get item, etc.
  const [bogoPrice, setBogoPrice] = useState("15");
  const [bogoTotalItems, setBogoTotalItems] = useState("3"); // How many total items user wants to buy

  // --- TAB 3: UNIT PRICE COMPARER STATES ---
  const [packAPrice, setPackAPrice] = useState("10");
  const [packAQty, setPackAQty] = useState("500");
  const [packAUnit, setPackAUnit] = useState("g");
  const [packADiscount, setPackADiscount] = useState("0");

  const [packBPrice, setPackBPrice] = useState("14");
  const [packBQty, setPackBQty] = useState("800");
  const [packBUnit, setPackBUnit] = useState("g");
  const [packBDiscount, setPackBDiscount] = useState("15"); // 15% off Pack B

  // --- HISTORY STATE ---
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("discount_calculator_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history from local storage", e);
    }
  }, []);

  // Save history helper
  const saveToLocalStorage = (newHistory) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("discount_calculator_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history to local storage", e);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync coupon when couponInput changes or originalPrice changes
  useEffect(() => {
    if (!couponInput.trim()) {
      setAppliedCoupon(null);
      return;
    }
    const found = COUPONS.find(c => c.code.toUpperCase() === couponInput.toUpperCase().trim());
    if (found) {
      // Check min spend based on originalPrice * quantity
      const baseSubtotal = (parseFloat(originalPrice) || 0) * (parseInt(quantity) || 1);
      if (baseSubtotal >= found.minSpend) {
        setAppliedCoupon(found);
      } else {
        setAppliedCoupon({ ...found, error: `Requires min spend of ${selectedCurrency.symbol}${found.minSpend}` });
      }
    } else {
      setAppliedCoupon({ error: "Invalid coupon code" });
    }
  }, [couponInput, originalPrice, quantity, selectedCurrency]);

  // Quick Preset Handlers
  const handleApplyPresetCoupon = (code) => {
    setCouponInput(code);
  };

  const handleClearCoupon = () => {
    setCouponInput("");
    setAppliedCoupon(null);
  };

  // --- CALCULATIONS FOR TAB 1 (STANDARD / ADVANCED DISCOUNT) ---
  const discountCalcs = useMemo(() => {
    const orig = parseFloat(originalPrice) || 0;
    const val = parseFloat(discountValue) || 0;
    const qty = Math.max(1, parseInt(quantity) || 1);
    
    const subtotalOrig = orig * qty;

    // 1st Discount
    let primarySavings = 0;
    if (discountType === "percent") {
      primarySavings = subtotalOrig * (val / 100);
    } else {
      primarySavings = Math.min(subtotalOrig, val * qty);
    }
    let afterFirst = subtotalOrig - primarySavings;

    // 2nd Discount (Double discount)
    let secondSavings = 0;
    if (showAdvanced) {
      const val2 = parseFloat(secondDiscountValue) || 0;
      if (secondDiscountType === "percent") {
        secondSavings = afterFirst * (val2 / 100);
      } else {
        secondSavings = Math.min(afterFirst, val2 * qty);
      }
    }
    let afterSecond = afterFirst - secondSavings;

    // Coupon Discount
    let couponSavings = 0;
    if (showAdvanced && appliedCoupon && !appliedCoupon.error) {
      if (appliedCoupon.type === "percent") {
        couponSavings = afterSecond * (appliedCoupon.rate / 100);
      } else {
        couponSavings = appliedCoupon.rate;
      }
      // Apply max coupon discount cap
      if (appliedCoupon.maxDiscount) {
        couponSavings = Math.min(couponSavings, appliedCoupon.maxDiscount);
      }
      couponSavings = Math.min(afterSecond, couponSavings);
    }
    let afterCoupon = afterSecond - couponSavings;

    // Cash Back
    let cashbackVal = 0;
    if (showAdvanced) {
      const cb = parseFloat(cashBackValue) || 0;
      if (cashBackType === "percent") {
        cashbackVal = afterCoupon * (cb / 100);
      } else {
        cashbackVal = Math.min(afterCoupon, cb * qty);
      }
    }

    // Taxes
    const taxPct = parseFloat(taxRate) || 0;
    let taxAmount = 0;
    let finalPaid = 0;

    if (taxType === "exclusive") {
      taxAmount = afterCoupon * (taxPct / 100);
      finalPaid = afterCoupon + taxAmount;
    } else {
      // Inclusive tax: The afterCoupon already includes tax.
      // We calculate how much of it was tax.
      taxAmount = afterCoupon - (afterCoupon / (1 + taxPct / 100));
      finalPaid = afterCoupon;
    }

    const netCost = finalPaid - cashbackVal;
    const totalSavings = subtotalOrig - finalPaid + cashbackVal;
    const totalDiscountPercent = subtotalOrig > 0 ? (totalSavings / subtotalOrig) * 100 : 0;

    return {
      subtotalOriginal: subtotalOrig,
      primaryDiscountAmount: primarySavings,
      secondDiscountAmount: secondSavings,
      couponDiscountAmount: couponSavings,
      taxAmount: taxAmount,
      cashBackAmount: cashbackVal,
      preTaxSubtotal: afterCoupon,
      finalAmountPaid: finalPaid,
      netCost: Math.max(0, netCost),
      totalSavings: Math.max(0, totalSavings),
      totalDiscountPercent: Math.min(100, Math.max(0, totalDiscountPercent)),
    };
  }, [
    originalPrice,
    discountType,
    discountValue,
    showAdvanced,
    secondDiscountType,
    secondDiscountValue,
    taxRate,
    taxType,
    quantity,
    cashBackType,
    cashBackValue,
    appliedCoupon,
  ]);

  // --- CALCULATIONS FOR TAB 2 (BOGO CALCULATOR) ---
  const bogoCalcs = useMemo(() => {
    const buy = Math.max(1, parseInt(bogoBuy) || 1);
    const get = Math.max(0, parseInt(bogoGet) || 0);
    const discPct = Math.min(100, Math.max(0, parseFloat(bogoDiscount) || 0));
    const price = parseFloat(bogoPrice) || 0;
    const desiredTotal = Math.max(1, parseInt(bogoTotalItems) || 1);

    const dealSetSize = buy + get;
    
    // How many complete deals sets fits?
    const sets = Math.floor(desiredTotal / dealSetSize);
    const remainder = desiredTotal % dealSetSize;

    // Calculate items in the sets
    const paidInSets = sets * buy;
    const discountedInSets = sets * get;

    // In the remainder: the first `buy` items are fully paid.
    // The rest (up to remainder - buy) are discounted.
    let paidInRemainder = 0;
    let discountedInRemainder = 0;

    if (remainder <= buy) {
      paidInRemainder = remainder;
    } else {
      paidInRemainder = buy;
      discountedInRemainder = remainder - buy;
    }

    const totalPaidItems = paidInSets + paidInRemainder;
    const totalDiscountedItems = discountedInSets + discountedInRemainder;

    const baseCostFull = desiredTotal * price;
    const costForPaid = totalPaidItems * price;
    const costForDiscounted = totalDiscountedItems * price * (1 - discPct / 100);
    
    const finalCost = costForPaid + costForDiscounted;
    const totalSavings = baseCostFull - finalCost;
    const effectiveDiscountPercent = baseCostFull > 0 ? (totalSavings / baseCostFull) * 100 : 0;
    const averageUnitPrice = desiredTotal > 0 ? finalCost / desiredTotal : 0;

    return {
      subtotalOriginal: baseCostFull,
      finalAmountPaid: finalCost,
      totalSavings: totalSavings,
      effectiveDiscountPercent: effectiveDiscountPercent,
      averageUnitPrice: averageUnitPrice,
      paidCount: totalPaidItems,
      discountedCount: totalDiscountedItems,
    };
  }, [bogoBuy, bogoGet, bogoDiscount, bogoPrice, bogoTotalItems]);

  // --- CALCULATIONS FOR TAB 3 (UNIT PRICE COMPARER) ---
  const comparerCalcs = useMemo(() => {
    const pA = parseFloat(packAPrice) || 0;
    const qA = parseFloat(packAQty) || 1;
    const dA = parseFloat(packADiscount) || 0;

    const pB = parseFloat(packBPrice) || 0;
    const qB = parseFloat(packBQty) || 1;
    const dB = parseFloat(packBDiscount) || 0;

    const finalPA = pA * (1 - dA / 100);
    const finalPB = pB * (1 - dB / 100);

    const unitPriceA = qA > 0 ? finalPA / qA : 0;
    const unitPriceB = qB > 0 ? finalPB / qB : 0;

    let betterOption = "";
    let differencePct = 0;

    if (unitPriceA > 0 && unitPriceB > 0) {
      if (unitPriceA < unitPriceB) {
        betterOption = "A";
        differencePct = ((unitPriceB - unitPriceA) / unitPriceB) * 100;
      } else if (unitPriceB < unitPriceA) {
        betterOption = "B";
        differencePct = ((unitPriceA - unitPriceB) / unitPriceA) * 100;
      } else {
        betterOption = "equal";
      }
    }

    return {
      unitPriceA,
      unitPriceB,
      finalPA,
      finalPB,
      betterOption,
      differencePct,
    };
  }, [packAPrice, packAQty, packADiscount, packBPrice, packBQty, packBDiscount]);

  // --- RATING BADGE HELPER ---
  const getBargainLabel = (percent) => {
    if (percent >= 50) return { label: "Mega Deal! 🔥", color: "bg-rose-500 text-white" };
    if (percent >= 30) return { label: "Excellent Bargain! 💎", color: "bg-amber-500 text-white" };
    if (percent >= 15) return { label: "Solid Deal! 👍", color: "bg-emerald-500 text-white" };
    if (percent > 0) return { label: "Decent Saving! 🏷️", color: "bg-blue-500 text-white" };
    return { label: "Regular Price 🛍️", color: "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200" };
  };

  // --- AUTO SAVE TO HISTORY EFFECT ---
  useEffect(() => {
    let isValid = false;
    let details = "";
    let savings = 0;
    let finalPrice = 0;
    let type = "";
    let isCompare = false;
    let better = "";

    if (activeTab === "discount") {
      const activeAmt = parseFloat(originalPrice) || 0;
      if (activeAmt > 0) {
        isValid = true;
        type = "Discount";
        details = `${quantity}x ${selectedCurrency.symbol}${originalPrice} @ ${discountValue}% off ${showAdvanced ? `(stacked ${secondDiscountValue}%)` : ""}`;
        savings = discountCalcs.totalSavings;
        finalPrice = discountCalcs.netCost;
      }
    } else if (activeTab === "bogo") {
      const activeAmt = parseFloat(bogoPrice) || 0;
      if (activeAmt > 0) {
        isValid = true;
        type = "BOGO";
        details = `Buy ${bogoBuy} Get ${bogoGet} @ ${bogoDiscount}% Off (${bogoTotalItems} total items)`;
        savings = bogoCalcs.totalSavings;
        finalPrice = bogoCalcs.finalAmountPaid;
      }
    } else if (activeTab === "compare") {
      const activeAmtA = parseFloat(packAPrice) || 0;
      const activeAmtB = parseFloat(packBPrice) || 0;
      if (activeAmtA > 0 && activeAmtB > 0) {
        isValid = true;
        type = "Compare";
        details = `Pack A (${packAQty}${packAUnit}) vs Pack B (${packBQty}${packBUnit})`;
        savings = comparerCalcs.betterOption === "A" ? (comparerCalcs.unitPriceB - comparerCalcs.unitPriceA) * parseFloat(packAQty) : (comparerCalcs.unitPriceA - comparerCalcs.unitPriceB) * parseFloat(packBQty);
        finalPrice = comparerCalcs.betterOption === "A" ? comparerCalcs.finalPA : comparerCalcs.finalPB;
        isCompare = true;
        better = comparerCalcs.betterOption === "A" ? "Pack A" : comparerCalcs.betterOption === "B" ? "Pack B" : "Equal Price";
      }
    }

    if (!isValid) return;

    const timer = setTimeout(() => {
      setHistory((prevHistory) => {
        if (prevHistory.length > 0) {
          const last = prevHistory[0];
          if (
            last.type === type &&
            last.details === details &&
            last.currencyCode === selectedCurrency.code &&
            Math.abs(last.finalPrice - finalPrice) < 0.01
          ) {
            return prevHistory;
          }
        }

        const newItem = {
          id: Date.now(),
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString(),
          currencySymbol: selectedCurrency.symbol,
          currencyCode: selectedCurrency.code,
          type,
          details,
          savings,
          finalPrice,
          isCompare,
          better,
        };

        const updatedHistory = [newItem, ...prevHistory].slice(0, 10);
        try {
          localStorage.setItem("discount_calculator_history", JSON.stringify(updatedHistory));
        } catch (e) {
          console.error("Failed to save history to local storage", e);
        }
        return updatedHistory;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    activeTab,
    originalPrice, discountValue, quantity, showAdvanced, secondDiscountValue, taxRate, taxType, cashBackValue, cashBackType, appliedCoupon,
    bogoPrice, bogoTotalItems, bogoBuy, bogoGet, bogoDiscount,
    packAPrice, packBPrice, packAQty, packBQty, packAUnit, packBUnit, packADiscount, packBDiscount,
    selectedCurrency,
    discountCalcs, bogoCalcs, comparerCalcs
  ]);

  const handleClearHistory = () => {
    saveToLocalStorage([]);
  };

  const handleDeleteHistoryItem = (id) => {
    const filtered = history.filter(item => item.id !== id);
    saveToLocalStorage(filtered);
  };

  // --- RESET ALL INPUTS ---
  const handleReset = () => {
    setOriginalPrice("100");
    setDiscountValue("20");
    setDiscountType("percent");
    setSecondDiscountValue("0");
    setTaxRate("0");
    setTaxType("exclusive");
    setQuantity("1");
    setCashBackValue("0");
    setCouponInput("");
    setAppliedCoupon(null);

    setBogoBuy("2");
    setBogoGet("1");
    setBogoDiscount("100");
    setBogoPrice("15");
    setBogoTotalItems("3");

    setPackAPrice("10");
    setPackAQty("500");
    setPackADiscount("0");
    setPackBPrice("14");
    setPackBQty("800");
    setPackBDiscount("15");
  };


  return (
    <ToolPageShell widthClassName="max-w-6xl">
      <div className="font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        {/* ── Outer Shell Card ── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-gray-900/40 overflow-hidden border border-gray-100 dark:border-gray-700/60">
          
          {/* ── Hero / Header Block ── */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 px-6 py-8 sm:px-10 text-white relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-white/20 rounded-2xl backdrop-blur-md shadow-lg border border-white/20">
                  <Percent className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Discount & Savings Calculator
                  </h1>
                  <p className="text-orange-100 mt-1 text-sm sm:text-base max-w-xl">
                    Calculate sale price, double stack coupon discounts, compute bulk tax-adjusted prices, estimate BOGO savings, and find the absolute best unit price deals.
                  </p>
                </div>
              </div>
              
              {/* Currency Selector */}
              <div className="relative self-start md:self-center" ref={currencyRef}>
                <button
                  type="button"
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-white"
                >
                  <span className="text-lg">{selectedCurrency.symbol}</span>
                  <span>{selectedCurrency.code} ({selectedCurrency.name})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {currencyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-72 overflow-y-auto"
                    >
                      {CURRENCIES.map((cur) => (
                        <button
                          key={cur.code}
                          onClick={() => {
                            setSelectedCurrency(cur);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left ${
                            selectedCurrency.code === cur.code ? 'bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-6 text-center font-bold text-gray-400 dark:text-gray-500">{cur.symbol}</span>
                            <span>{cur.name}</span>
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{cur.code}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Navigation Tabs ── */}
          <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-2 gap-2">
            {[
              { id: "discount", label: "Standard / Double Discount", icon: Tag },
              { id: "bogo", label: "BOGO Deals Calculator", icon: ShoppingCart },
              { id: "compare", label: "Unit Price Comparer", icon: Scale }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-md border-b-2 border-orange-500"
                      : "text-gray-500 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Core Workspace (Grid) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700/60 bg-gray-50/20 dark:bg-gray-900/10">
            
            {/* Left Column: Input Form (lg:col-span-7) */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              
              {/* Reset Quick Action */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {activeTab === "discount" ? "Discount Settings" : activeTab === "bogo" ? "BOGO Settings" : "Compare Packages"}
                </h3>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Fields
                </button>
              </div>

              {/* ──── TAB 1: DISCOUNT INPUTS ──── */}
              {activeTab === "discount" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Original Price */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Original Unit Price
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 dark:text-gray-500 font-bold">{selectedCurrency.symbol}</span>
                        </div>
                        <input
                          type="number"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="0.00"
                          className="block w-full pl-8 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-600 focus:outline-none text-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Primary Discount */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                        <span>Discount Value</span>
                        <div className="flex gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setDiscountType("percent")}
                            className={`font-semibold cursor-pointer ${discountType === "percent" ? "text-orange-500" : "text-gray-400"}`}
                          >
                            Percent (%)
                          </button>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <button
                            type="button"
                            onClick={() => setDiscountType("amount")}
                            className={`font-semibold cursor-pointer ${discountType === "amount" ? "text-orange-500" : "text-gray-400"}`}
                          >
                            Amount ({selectedCurrency.symbol})
                          </button>
                        </div>
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 dark:text-gray-500 font-semibold">
                            {discountType === "percent" ? "%" : selectedCurrency.code}
                          </span>
                        </div>
                        <input
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder="0"
                          className="block w-full pr-12 pl-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-600 focus:outline-none text-sm transition-all"
                        />
                      </div>
                    </div>

                  </div>

                  {/* ADVANCED TOGGLE */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full flex items-center justify-between p-3.5 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/30 rounded-xl text-orange-600 dark:text-orange-400 text-sm font-semibold transition-all duration-200 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {showAdvanced ? "Hide Advanced Savings Options" : "Reveal Advanced Savings Options"}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {/* EXPANDABLE ADVANCED OPTIONS PANEL */}
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-4 pt-1"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700/60 pt-4">
                          
                          {/* Stacked 2nd Discount */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 flex justify-between">
                              <span>Stacked 2nd Discount</span>
                              <div className="flex gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => setSecondDiscountType("percent")}
                                  className={`font-semibold cursor-pointer ${secondDiscountType === "percent" ? "text-orange-500" : "text-gray-400"}`}
                                >
                                  %
                                </button>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <button
                                  type="button"
                                  onClick={() => setSecondDiscountType("amount")}
                                  className={`font-semibold cursor-pointer ${secondDiscountType === "amount" ? "text-orange-500" : "text-gray-400"}`}
                                >
                                  {selectedCurrency.symbol}
                                </button>
                              </div>
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                              <input
                                type="number"
                                value={secondDiscountValue}
                                onChange={(e) => setSecondDiscountValue(e.target.value)}
                                placeholder="0"
                                className="block w-full pr-12 pl-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-sm transition-all"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 dark:text-gray-500 text-xs font-semibold">
                                  {secondDiscountType === "percent" ? "% Extra" : "Flat Extra"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Purchase Quantity */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400">
                              Quantity (Units)
                            </label>
                            <div className="flex rounded-xl shadow-sm">
                              <button
                                type="button"
                                onClick={() => setQuantity(String(Math.max(1, (parseInt(quantity) || 1) - 1)))}
                                className="px-3 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-l-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-bold cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="block w-full py-3 border-y border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none text-center text-sm font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => setQuantity(String((parseInt(quantity) || 1) + 1))}
                                className="px-3 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-r-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-bold cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Sales Tax Rate */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 flex justify-between">
                              <span>Sales Tax Rate</span>
                              <div className="flex gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => setTaxType("exclusive")}
                                  className={`font-semibold cursor-pointer ${taxType === "exclusive" ? "text-orange-500" : "text-gray-400"}`}
                                >
                                  Exclusive (Add)
                                </button>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <button
                                  type="button"
                                  onClick={() => setTaxType("inclusive")}
                                  className={`font-semibold cursor-pointer ${taxType === "inclusive" ? "text-orange-500" : "text-gray-400"}`}
                                >
                                  Inclusive
                                </button>
                              </div>
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                              <input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                placeholder="0"
                                className="block w-full pr-10 pl-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-sm transition-all"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 dark:text-gray-500 font-semibold">%</span>
                              </div>
                            </div>
                          </div>

                          {/* Cash Back & Rebates */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 flex justify-between">
                              <span>Cash Back / Rebate</span>
                              <div className="flex gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => setCashBackType("percent")}
                                  className={`font-semibold cursor-pointer ${cashBackType === "percent" ? "text-orange-500" : "text-gray-400"}`}
                                >
                                  %
                                </button>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <button
                                  type="button"
                                  onClick={() => setCashBackType("amount")}
                                  className={`font-semibold cursor-pointer ${cashBackType === "amount" ? "text-orange-500" : "text-gray-400"}`}
                                >
                                  Flat
                                </button>
                              </div>
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                              <input
                                type="number"
                                value={cashBackValue}
                                onChange={(e) => setCashBackValue(e.target.value)}
                                placeholder="0"
                                className="block w-full pr-12 pl-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-sm transition-all"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 dark:text-gray-500 text-xs font-semibold">
                                  {cashBackType === "percent" ? "% back" : "rebate"}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Promo / Coupon Code Simulator */}
                        <div className="space-y-2 border-t border-gray-100 dark:border-gray-700/60 pt-4">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400">
                              Simulated Coupon Code
                            </label>
                            {couponInput && (
                              <button
                                type="button"
                                onClick={handleClearCoupon}
                                className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                              >
                                Clear Coupon
                              </button>
                            )}
                          </div>
                          <div className="relative rounded-xl shadow-sm">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value)}
                              placeholder="Type code e.g. SAVE10, FLASH25"
                              className="block w-full pl-3 pr-24 py-3 uppercase bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-sm transition-all font-mono"
                            />
                            <div className="absolute inset-y-0 right-2 flex items-center">
                              <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">
                                {couponInput ? (appliedCoupon && !appliedCoupon.error ? "VALID!" : "INVALID") : "COUPON"}
                              </span>
                            </div>
                          </div>

                          {/* Coupon feedback alert */}
                          {couponInput && appliedCoupon && (
                            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                              appliedCoupon.error
                                ? "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
                                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            }`}>
                              {appliedCoupon.error ? (
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              ) : (
                                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                              )}
                              <div>
                                <span className="font-bold uppercase font-mono">{couponInput}</span>:{" "}
                                {appliedCoupon.error ? appliedCoupon.error : appliedCoupon.desc}
                              </div>
                            </div>
                          )}

                          {/* Presets List */}
                          <div className="space-y-1 pt-1">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                              Try these Active Promo Codes (Click to apply):
                            </span>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {COUPONS.map((cp) => (
                                <button
                                  key={cp.code}
                                  type="button"
                                  onClick={() => handleApplyPresetCoupon(cp.code)}
                                  className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg text-xs font-mono font-bold text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
                                >
                                  {cp.code}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              )}

              {/* ──── TAB 2: BOGO INPUTS ──── */}
              {activeTab === "bogo" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Item Unit Price */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Item Unit Price
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 dark:text-gray-500 font-bold">{selectedCurrency.symbol}</span>
                        </div>
                        <input
                          type="number"
                          value={bogoPrice}
                          onChange={(e) => setBogoPrice(e.target.value)}
                          placeholder="0.00"
                          className="block w-full pl-8 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Total desired quantity */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Total Quantity Desired
                      </label>
                      <input
                        type="number"
                        value={bogoTotalItems}
                        onChange={(e) => setBogoTotalItems(e.target.value)}
                        placeholder="e.g. 3"
                        className="block w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-sm transition-all"
                      />
                    </div>

                  </div>

                  {/* BOGO Rules Config */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    
                    {/* Buy X */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Buy (Quantity)
                      </label>
                      <input
                        type="number"
                        value={bogoBuy}
                        onChange={(e) => setBogoBuy(e.target.value)}
                        placeholder="2"
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-sm transition-all font-semibold"
                      />
                    </div>

                    {/* Get Y */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Get (Quantity)
                      </label>
                      <input
                        type="number"
                        value={bogoGet}
                        onChange={(e) => setBogoGet(e.target.value)}
                        placeholder="1"
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-sm transition-all font-semibold"
                      />
                    </div>

                    {/* Discount on Y */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Get Discount %
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <input
                          type="number"
                          value={bogoDiscount}
                          onChange={(e) => setBogoDiscount(e.target.value)}
                          placeholder="100"
                          className="block w-full pr-8 pl-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none text-sm transition-all font-semibold"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 dark:text-gray-500 font-semibold text-xs">%</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Common Presets */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Standard BOGO Presets (Click to apply):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setBogoBuy("1"); setBogoGet("1"); setBogoDiscount("100"); }}
                        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer transition-all"
                      >
                        Buy 1 Get 1 Free (BOGO)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBogoBuy("1"); setBogoGet("1"); setBogoDiscount("50"); }}
                        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer transition-all"
                      >
                        Buy 1 Get 2nd at 50% Off
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBogoBuy("2"); setBogoGet("1"); setBogoDiscount("100"); }}
                        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer transition-all"
                      >
                        Buy 2 Get 1 Free
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBogoBuy("3"); setBogoGet("1"); setBogoDiscount("100"); }}
                        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer transition-all"
                      >
                        Buy 3 Get 1 Free
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* ──── TAB 3: UNIT PRICE COMPARER INPUTS ──── */}
              {activeTab === "compare" && (
                <div className="space-y-6">
                  
                  {/* Package A Card */}
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-orange-500 text-white rounded-full text-xs font-bold">A</span>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Package A</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Price */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Price</label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-xs font-bold">{selectedCurrency.symbol}</span>
                          </div>
                          <input
                            type="number"
                            value={packAPrice}
                            onChange={(e) => setPackAPrice(e.target.value)}
                            placeholder="0.00"
                            className="block w-full pl-6 pr-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs transition-all font-semibold"
                          />
                        </div>
                      </div>

                      {/* Weight/Volume */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Size / Qty</label>
                        <input
                          type="number"
                          value={packAQty}
                          onChange={(e) => setPackAQty(e.target.value)}
                          placeholder="e.g. 500"
                          className="block w-full px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs transition-all font-semibold"
                        />
                      </div>

                      {/* Unit */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Unit Type</label>
                        <input
                          type="text"
                          value={packAUnit}
                          onChange={(e) => {
                            setPackAUnit(e.target.value);
                            setPackBUnit(e.target.value); // Sync unit for simplicity
                          }}
                          placeholder="g, ml, count"
                          className="block w-full px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs transition-all font-semibold"
                        />
                      </div>

                      {/* Discount % */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Discount Applied</label>
                        <div className="relative rounded-xl shadow-sm">
                          <input
                            type="number"
                            value={packADiscount}
                            onChange={(e) => setPackADiscount(e.target.value)}
                            placeholder="0"
                            className="block w-full pr-6 pl-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs transition-all font-semibold"
                          />
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-semibold text-xs">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package B Card */}
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-orange-500 text-white rounded-full text-xs font-bold">B</span>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Package B</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Price */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Price</label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-xs font-bold">{selectedCurrency.symbol}</span>
                          </div>
                          <input
                            type="number"
                            value={packBPrice}
                            onChange={(e) => setPackBPrice(e.target.value)}
                            placeholder="0.00"
                            className="block w-full pl-6 pr-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs transition-all font-semibold"
                          />
                        </div>
                      </div>

                      {/* Weight/Volume */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Size / Qty</label>
                        <input
                          type="number"
                          value={packBQty}
                          onChange={(e) => setPackBQty(e.target.value)}
                          placeholder="e.g. 800"
                          className="block w-full px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs transition-all font-semibold"
                        />
                      </div>

                      {/* Unit */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Unit Type</label>
                        <input
                          type="text"
                          value={packBUnit}
                          disabled
                          className="block w-full px-2 py-2 bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-400"
                        />
                      </div>

                      {/* Discount % */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Discount Applied</label>
                        <div className="relative rounded-xl shadow-sm">
                          <input
                            type="number"
                            value={packBDiscount}
                            onChange={(e) => setPackBDiscount(e.target.value)}
                            placeholder="0"
                            className="block w-full pr-6 pl-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs transition-all font-semibold"
                          />
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-semibold text-xs">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Right Column: Visualization & Results (lg:col-span-5) */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-gray-50/50 dark:bg-gray-800/10 flex flex-col justify-between gap-6">
              
              <div>
                {/* Section title */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700/60 pb-3 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  Calculation Results
                </h3>

                {/* ──── TAB 1 RESULTS CARD ──── */}
                {activeTab === "discount" && (
                  <div className="space-y-6">
                    {/* Visual Donut representation */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E5E7EB" strokeWidth="3" className="dark:stroke-gray-700" />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke="#F97316"
                            strokeWidth="3.5"
                            strokeDasharray={`${discountCalcs.totalDiscountPercent} ${100 - discountCalcs.totalDiscountPercent}`}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black text-gray-800 dark:text-white">
                            {discountCalcs.totalDiscountPercent.toFixed(0)}%
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Saved</span>
                        </div>
                      </div>

                      {/* Deal Rating Badge */}
                      <div className="mt-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${getBargainLabel(discountCalcs.totalDiscountPercent).color}`}>
                          {getBargainLabel(discountCalcs.totalDiscountPercent).label}
                        </span>
                      </div>
                    </div>

                    {/* Numeric breakdown */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Original Subtotal ({quantity} item{parseInt(quantity) > 1 ? 's' : ''})</span>
                        <span className="font-bold text-gray-600 dark:text-gray-300 font-mono">
                          {selectedCurrency.symbol}{discountCalcs.subtotalOriginal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Primary Discount</span>
                        <span className="font-bold text-rose-500 font-mono">
                          -{selectedCurrency.symbol}{discountCalcs.primaryDiscountAmount.toFixed(2)}
                        </span>
                      </div>

                      {showAdvanced && (
                        <>
                          {(parseFloat(secondDiscountValue) > 0) && (
                            <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-100 dark:border-gray-700/60 pt-2">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">Stacked Discount</span>
                              <span className="font-bold text-rose-500 font-mono">
                                -{selectedCurrency.symbol}{discountCalcs.secondDiscountAmount.toFixed(2)}
                              </span>
                            </div>
                          )}

                          {appliedCoupon && !appliedCoupon.error && (
                            <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-100 dark:border-gray-700/60 pt-2">
                              <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                                Coupon ({appliedCoupon.code})
                              </span>
                              <span className="font-bold text-rose-500 font-mono">
                                -{selectedCurrency.symbol}{discountCalcs.couponDiscountAmount.toFixed(2)}
                              </span>
                            </div>
                          )}

                          {parseFloat(taxRate) > 0 && (
                            <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-100 dark:border-gray-700/60 pt-2">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">
                                Tax ({taxRate}% {taxType === "inclusive" ? "inclusive" : "exclusive"})
                              </span>
                              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                                +{selectedCurrency.symbol}{discountCalcs.taxAmount.toFixed(2)}
                              </span>
                            </div>
                          )}

                          {parseFloat(cashBackValue) > 0 && (
                            <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-100 dark:border-gray-700/60 pt-2">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">Cash Back / Rebate</span>
                              <span className="font-bold text-emerald-500 font-mono">
                                +{selectedCurrency.symbol}{discountCalcs.cashBackAmount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Total Savings Highlight */}
                      <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700/60 pt-3 text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Total Savings</span>
                        <span className="text-lg font-black text-emerald-500 font-mono">
                          {selectedCurrency.symbol}{discountCalcs.totalSavings.toFixed(2)}
                        </span>
                      </div>

                      {/* Final Net Cost */}
                      <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3 text-base">
                        <span className="text-gray-900 dark:text-white font-extrabold">Final Price (Paid)</span>
                        <span className="text-2xl font-black text-orange-500 font-mono">
                          {selectedCurrency.symbol}{discountCalcs.netCost.toFixed(2)}
                        </span>
                      </div>

                    </div>
                  </div>
                )}

                {/* ──── TAB 2 RESULTS CARD (BOGO) ──── */}
                {activeTab === "bogo" && (
                  <div className="space-y-6">
                    {/* Visual Progress Ratio */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E5E7EB" strokeWidth="3" className="dark:stroke-gray-700" />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke="#F97316"
                            strokeWidth="3.5"
                            strokeDasharray={`${bogoCalcs.effectiveDiscountPercent} ${100 - bogoCalcs.effectiveDiscountPercent}`}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black text-gray-800 dark:text-white">
                            {bogoCalcs.effectiveDiscountPercent.toFixed(0)}%
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Net Discount</span>
                        </div>
                      </div>

                      {/* Deal Rating Badge */}
                      <div className="mt-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${getBargainLabel(bogoCalcs.effectiveDiscountPercent).color}`}>
                          {getBargainLabel(bogoCalcs.effectiveDiscountPercent).label}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-4 shadow-sm space-y-3">
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal Without Deal</span>
                        <span className="font-bold text-gray-600 dark:text-gray-300 font-mono">
                          {selectedCurrency.symbol}{bogoCalcs.subtotalOriginal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">BOGO Items Breakdowns</span>
                        <span className="font-bold text-gray-600 dark:text-gray-300">
                          {bogoCalcs.paidCount} Paid / {bogoCalcs.discountedCount} Disc
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Effective Average Unit Price</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {selectedCurrency.symbol}{bogoCalcs.averageUnitPrice.toFixed(2)} /unit
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700/60 pt-3 text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Total Savings</span>
                        <span className="text-lg font-black text-emerald-500 font-mono">
                          {selectedCurrency.symbol}{bogoCalcs.totalSavings.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3 text-base">
                        <span className="text-gray-900 dark:text-white font-extrabold">Final Price Paid</span>
                        <span className="text-2xl font-black text-orange-500 font-mono">
                          {selectedCurrency.symbol}{bogoCalcs.finalAmountPaid.toFixed(2)}
                        </span>
                      </div>

                    </div>
                  </div>
                )}

                {/* ──── TAB 3 RESULTS CARD (COMPARE) ──── */}
                {activeTab === "compare" && (
                  <div className="space-y-6">
                    
                    <div className="space-y-4">
                      {/* Comparison Badges */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-4 rounded-2xl border text-center relative overflow-hidden transition-all ${
                          comparerCalcs.betterOption === "A" ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-700 dark:text-emerald-400 shadow-md scale-105" : "bg-white dark:bg-gray-800 border-gray-150 dark:border-gray-800 text-gray-500"
                        }`}>
                          {comparerCalcs.betterOption === "A" && (
                            <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-bl-lg">Better Value!</span>
                          )}
                          <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Pack A Unit Cost</span>
                          <span className="block text-xl font-black font-mono mt-1">
                            {selectedCurrency.symbol}{comparerCalcs.unitPriceA.toFixed(4)}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">per {packAUnit || 'unit'}</span>
                        </div>

                        <div className={`p-4 rounded-2xl border text-center relative overflow-hidden transition-all ${
                          comparerCalcs.betterOption === "B" ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-700 dark:text-emerald-400 shadow-md scale-105" : "bg-white dark:bg-gray-800 border-gray-150 dark:border-gray-800 text-gray-500"
                        }`}>
                          {comparerCalcs.betterOption === "B" && (
                            <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-bl-lg">Better Value!</span>
                          )}
                          <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Pack B Unit Cost</span>
                          <span className="block text-xl font-black font-mono mt-1">
                            {selectedCurrency.symbol}{comparerCalcs.unitPriceB.toFixed(4)}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">per {packBUnit || 'unit'}</span>
                        </div>
                      </div>

                      {/* Recommendation Summary */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 shadow-sm text-center">
                        {comparerCalcs.betterOption === "A" && (
                          <div>
                            <span className="text-emerald-500 text-3xl font-extrabold">Pack A 🔥</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Pack A is cheaper by <strong className="text-emerald-600 dark:text-emerald-400">{comparerCalcs.differencePct.toFixed(1)}%</strong> compared to Pack B.
                            </p>
                          </div>
                        )}
                        {comparerCalcs.betterOption === "B" && (
                          <div>
                            <span className="text-emerald-500 text-3xl font-extrabold">Pack B 🔥</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Pack B is cheaper by <strong className="text-emerald-600 dark:text-emerald-400">{comparerCalcs.differencePct.toFixed(1)}%</strong> compared to Pack A.
                            </p>
                          </div>
                        )}
                        {comparerCalcs.betterOption === "equal" && (
                          <div>
                            <span className="text-orange-500 text-2xl font-extrabold">Equal Value 🤝</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Both options offer the exact same price-to-size value.
                            </p>
                          </div>
                        )}
                        {!comparerCalcs.betterOption && (
                          <p className="text-xs text-gray-400 font-medium">Enter values for both packages to get comparison recommendations.</p>
                        )}
                      </div>

                      {/* Package cost breakdowns */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-4 shadow-sm space-y-2 text-sm">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase pb-1 border-b border-gray-50 dark:border-gray-700">
                          <span>Package Detail</span>
                          <span>Final Total Price</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-gray-600 dark:text-gray-400">Pack A Cost</span>
                          <span className="font-bold font-mono">{selectedCurrency.symbol}{comparerCalcs.finalPA.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Pack B Cost</span>
                          <span className="font-bold font-mono">{selectedCurrency.symbol}{comparerCalcs.finalPB.toFixed(2)}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>



            </div>

          </div>

          {/* ── Calculations History List (Bottom) ── */}
          {history.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-6 sm:p-8 bg-gray-50/20 dark:bg-gray-900/5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-orange-500" />
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                    Recent Calculations History
                  </h3>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>

              {/* Table / Grid for History items */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
                <table className="w-full text-left border-collapse bg-white dark:bg-gray-800">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Inputs</th>
                      <th className="px-4 py-3">Total Savings</th>
                      <th className="px-4 py-3 text-right">Final Price</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-sm">
                    {history.map((hist) => (
                      <tr key={hist.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-400 font-medium whitespace-nowrap">{hist.date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            hist.type === "Discount" ? "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" :
                            hist.type === "BOGO" ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" :
                            "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                          }`}>
                            {hist.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {hist.details} {hist.isCompare && <strong className="text-emerald-500 font-bold">({hist.better} is cheaper)</strong>}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-500 font-mono">
                          {hist.currencySymbol}{hist.savings.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-white font-mono">
                          {hist.currencySymbol}{hist.finalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteHistoryItem(hist.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </ToolPageShell>
  );
}
