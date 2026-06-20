"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Ruler,
  Scale,
  Thermometer,
  Layers,
  Box,
  Gauge,
  Clock,
  Database,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  History,
  Share2,
  Trash2,
  Sparkles,
  Info,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ToolPageShell from "./ToolPageShell";

// 1. Conversion configuration and logic
const conversionConfig = {
  length: {
    name: "Length",
    icon: Ruler,
    base: "m",
    units: {
      mm: { name: "Millimeter", symbol: "mm", factor: 0.001 },
      cm: { name: "Centimeter", symbol: "cm", factor: 0.01 },
      m: { name: "Meter", symbol: "m", factor: 1.0 },
      km: { name: "Kilometer", symbol: "km", factor: 1000.0 },
      in: { name: "Inch", symbol: "in", factor: 0.0254 },
      ft: { name: "Foot", symbol: "ft", factor: 0.3048 },
      yd: { name: "Yard", symbol: "yd", factor: 0.9144 },
      mi: { name: "Mile", symbol: "mi", factor: 1609.344 },
    },
    formulas: {
      "m to ft": "ft = m * 3.28084",
      "ft to m": "m = ft * 0.3048",
      "km to mi": "mi = km * 0.621371",
      "mi to km": "km = mi * 1.60934",
    },
  },
  weight: {
    name: "Weight",
    icon: Scale,
    base: "g",
    units: {
      mg: { name: "Milligram", symbol: "mg", factor: 0.001 },
      g: { name: "Gram", symbol: "g", factor: 1.0 },
      kg: { name: "Kilogram", symbol: "kg", factor: 1000.0 },
      ton: { name: "Ton (Metric)", symbol: "ton", factor: 1000000.0 },
      oz: { name: "Ounce", symbol: "oz", factor: 28.349523125 },
      lb: { name: "Pound", symbol: "lb", factor: 453.59237 },
    },
    formulas: {
      "kg to lb": "lb = kg * 2.20462",
      "lb to kg": "kg = lb * 0.453592",
      "g to oz": "oz = g * 0.035274",
      "oz to g": "g = oz * 28.3495",
    },
  },
  temperature: {
    name: "Temperature",
    icon: Thermometer,
    isSpecial: true,
    units: {
      c: { name: "Celsius", symbol: "°C" },
      f: { name: "Fahrenheit", symbol: "°F" },
      k: { name: "Kelvin", symbol: "K" },
    },
    convert: (val, from, to) => {
      let celsius;
      if (from === "c") celsius = val;
      else if (from === "f") celsius = ((val - 32) * 5) / 9;
      else if (from === "k") celsius = val - 273.15;

      if (to === "c") return celsius;
      else if (to === "f") return (celsius * 9) / 5 + 32;
      else if (to === "k") return celsius + 273.15;
      return val;
    },
    formulas: {
      "c to f": "°F = (°C * 9/5) + 32",
      "f to c": "°C = (°F - 32) * 5/9",
      "c to k": "K = °C + 273.15",
      "k to c": "°C = K - 273.15",
    },
  },
  area: {
    name: "Area",
    icon: Layers,
    base: "sqm",
    units: {
      sqm: { name: "Square Meter", symbol: "m²", factor: 1.0 },
      sqkm: { name: "Square Kilometer", symbol: "km²", factor: 1000000.0 },
      sqft: { name: "Square Foot", symbol: "ft²", factor: 0.09290304 },
      acre: { name: "Acre", symbol: "ac", factor: 4046.8564224 },
      hectare: { name: "Hectare", symbol: "ha", factor: 10000.0 },
    },
    formulas: {
      "sqm to sqft": "ft² = m² * 10.7639",
      "sqft to sqm": "m² = ft² * 0.092903",
      "hectare to acre": "ac = ha * 2.47105",
      "acre to hectare": "ha = ac * 0.404686",
    },
  },
  volume: {
    name: "Volume",
    icon: Box,
    base: "l",
    units: {
      ml: { name: "Milliliter", symbol: "ml", factor: 0.001 },
      l: { name: "Liter", symbol: "L", factor: 1.0 },
      cum: { name: "Cubic Meter", symbol: "m³", factor: 1000.0 },
      gal: { name: "Gallon", symbol: "gal", factor: 3.785411784 },
    },
    formulas: {
      "l to gal": "gal = L * 0.264172",
      "gal to l": "L = gal * 3.78541",
      "ml to l": "L = ml / 1000",
      "cum to l": "L = m³ * 1000",
    },
  },
  speed: {
    name: "Speed",
    icon: Gauge,
    base: "ms",
    units: {
      ms: { name: "Meter per Second", symbol: "m/s", factor: 1.0 },
      kmh: { name: "Kilometer per Hour", symbol: "km/h", factor: 1 / 3.6 },
      mph: { name: "Mile per Hour", symbol: "mph", factor: 0.44704 },
    },
    formulas: {
      "ms to kmh": "km/h = m/s * 3.6",
      "kmh to mph": "mph = km/h * 0.621371",
      "mph to kmh": "km/h = mph * 1.60934",
    },
  },
  time: {
    name: "Time",
    icon: Clock,
    base: "s",
    units: {
      s: { name: "Second", symbol: "s", factor: 1.0 },
      min: { name: "Minute", symbol: "min", factor: 60.0 },
      hr: { name: "Hour", symbol: "h", factor: 3600.0 },
      day: { name: "Day", symbol: "d", factor: 86400.0 },
      wk: { name: "Week", symbol: "w", factor: 604800.0 },
      month: { name: "Month", symbol: "mo", factor: 2629746.0 }, // Gregorian average (365.2425 days / 12)
      year: { name: "Year", symbol: "yr", factor: 31556952.0 }, // Gregorian average (365.2425 days)
    },
    formulas: {
      "hr to s": "s = h * 3600",
      "day to hr": "h = d * 24",
      "yr to day": "d = yr * 365.24",
      "min to s": "s = min * 60",
    },
  },
  data: {
    name: "Data Storage",
    icon: Database,
    base: "b",
    units: {
      b: { name: "Byte", symbol: "B", factor: 1.0 },
      kb: { name: "Kilobyte", symbol: "KB", factor: 1024.0 },
      mb: { name: "Megabyte", symbol: "MB", factor: 1048576.0 },
      gb: { name: "Gigabyte", symbol: "GB", factor: 1073741824.0 },
      tb: { name: "Terabyte", symbol: "TB", factor: 1099511627776.0 },
    },
    formulas: {
      "kb to b": "B = KB * 1024",
      "mb to kb": "KB = MB * 1024",
      "gb to mb": "MB = GB * 1024",
      "tb to gb": "GB = TB * 1024",
    },
  },
};

const popularConversions = [
  { label: "Feet to Meters", cat: "length", from: "ft", to: "m" },
  { label: "Meters to Feet", cat: "length", from: "m", to: "ft" },
  { label: "KG to Pounds", cat: "weight", from: "kg", to: "lb" },
  { label: "Pounds to KG", cat: "weight", from: "lb", to: "kg" },
  { label: "Celsius to Fahrenheit", cat: "temperature", from: "c", to: "f" },
  { label: "Fahrenheit to Celsius", cat: "temperature", from: "f", to: "c" },
  { label: "KM to Miles", cat: "length", from: "km", to: "mi" },
  { label: "Miles to KM", cat: "length", from: "mi", to: "km" },
];

const faqs = [
  {
    question: "How does the Toolstrek Unit Converter work?",
    answer:
      "Our Unit Converter operates entirely in your browser using high-precision client-side JavaScript. This ensures instant conversions as you type with zero network lag.",
  },
  {
    question: "Is my converted data secure?",
    answer:
      "Yes, 100%. Since all calculations are done locally in your browser, no conversion data or input amounts are sent to any server. Your privacy is fully guaranteed.",
  },
  {
    question: "What is the basis for the Data Storage conversion ratios?",
    answer:
      "Our Data Storage conversions use the binary system (base-1024) which is standard in operating systems (1 KB = 1024 Bytes, 1 MB = 1024 KB, etc.) rather than the decimal base-1000 system.",
  },
  {
    question: "Can I use the tool offline?",
    answer:
      "Yes! Once you load the Toolstrek Unit Converter page, it has all the mathematical functions and UI components needed to continue working without an active internet connection.",
  },
  {
    question: "How is calculation precision managed?",
    answer:
      "We perform all conversion math using standard double-precision floating-point numbers. To prevent floating-point rounding errors (e.g. 0.1 + 0.2 = 0.30000000004), results are dynamically normalized to 8 decimal places and trimmed of trailing zeros.",
  },
];

// A custom modern and smooth animated dropdown component matching the CGPA Calculator UX
const CustomSelect = ({ id, value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative w-full">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-border bg-card px-4 text-md font-medium text-foreground transition-all duration-200 hover:border-brandColor/50 focus:border-brandColor focus:ring-2 focus:ring-brandColor/10 dark:focus:ring-brandColor/20 cursor-pointer text-left shadow-xs"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : value}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop overlay for closing dropdown on click outside */}
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => {
              setIsOpen(false);
              setSearchTerm("");
            }}
          />

          {/* Dropdown Menu Container */}
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-border bg-card shadow-xl animate-in slide-in-from-top-2 duration-200 scroll-smooth">
            {/* Search Input when there are more than 4 options */}
            {options.length > 4 && (
              <div className="sticky top-0 bg-card p-2 border-b border-border z-10">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search unit..."
                  className="w-full rounded-xl border border-border bg-muted/40 dark:bg-muted/20 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brandColor focus:outline-none focus:ring-2 focus:ring-brandColor/10 dark:focus:ring-brandColor/20"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-brandColor/10 dark:bg-brandColor/20 text-brandColor"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-brandColor shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  No units found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [amount, setAmount] = useState("1");
  const [fromUnit, setFromUnit] = useState("ft");
  const [toUnit, setToUnit] = useState("m");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [recentConversions, setRecentConversions] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);

  const tabContainerRef = useRef(null);

  // Initialize Category default units on category change
  useEffect(() => {
    const config = conversionConfig[category];
    const unitKeys = Object.keys(config.units);
    if (category === "length") {
      setFromUnit("ft");
      setToUnit("m");
    } else if (category === "weight") {
      setFromUnit("kg");
      setToUnit("lb");
    } else if (category === "temperature") {
      setFromUnit("c");
      setToUnit("f");
    } else {
      setFromUnit(unitKeys[0]);
      setToUnit(unitKeys[1] || unitKeys[0]);
    }
  }, [category]);

  // Handle calculation in real time
  useEffect(() => {
    const numericAmount = parseFloat(amount);
    if (amount === "" || isNaN(numericAmount)) {
      setOutput("");
      return;
    }

    const config = conversionConfig[category];

    // Safety guard to prevent calculations with out-of-sync units during category transitions
    if (!config.units[fromUnit] || !config.units[toUnit]) {
      return;
    }

    let result;

    if (config.isSpecial) {
      result = config.convert(numericAmount, fromUnit, toUnit);
    } else {
      const fromFactor = config.units[fromUnit].factor;
      const toFactor = config.units[toUnit].factor;
      // Convert to base unit then to target unit
      const baseValue = numericAmount * fromFactor;
      result = baseValue / toFactor;
    }

    // Format output
    if (result === 0) {
      setOutput("0");
    } else {
      const absResult = Math.abs(result);
      if (absResult < 1e-8 || absResult > 1e12) {
        setOutput(result.toExponential(6));
      } else {
        // Strip trailing zeros after parsing float of fixed precision
        const formatted = parseFloat(result.toFixed(8));
        setOutput(formatted.toString());
      }
    }
  }, [amount, fromUnit, toUnit, category]);

  // Load recent conversions on mount
  useEffect(() => {
    const saved = localStorage.getItem("toolstrek_recent_conversions");
    if (saved) {
      try {
        setRecentConversions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent conversions", e);
      }
    }
  }, []);

  // Save to recent conversions when calculation is stable (debounce user input slightly)
  useEffect(() => {
    if (!amount || !output || amount === "." || amount === "-") return;

    const timer = setTimeout(() => {
      const activeConfig = conversionConfig[category];
      const fromSym = activeConfig.units[fromUnit]?.symbol || fromUnit;
      const toSym = activeConfig.units[toUnit]?.symbol || toUnit;

      const newRecord = {
        id: Date.now(),
        category,
        amount,
        fromUnit,
        toUnit,
        fromSymbol: fromSym,
        toSymbol: toSym,
        output,
      };

      setRecentConversions((prev) => {
        // Prevent exact duplicates next to each other
        if (prev.length > 0) {
          const last = prev[0];
          if (
            last.category === category &&
            last.amount === amount &&
            last.fromUnit === fromUnit &&
            last.toUnit === toUnit
          ) {
            return prev;
          }
        }

        const updated = [
          newRecord,
          ...prev.filter(
            (item) =>
              !(
                item.category === category &&
                item.fromUnit === fromUnit &&
                item.toUnit === toUnit &&
                item.amount === amount
              ),
          ),
        ].slice(0, 5);

        localStorage.setItem(
          "toolstrek_recent_conversions",
          JSON.stringify(updated),
        );
        return updated;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [amount, output, fromUnit, toUnit, category]);

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
      typeof window !== "undefined"
        ? window.location.href
        : "https://toolstrek.com/tools/unit-converter";
    if (navigator.share) {
      navigator
        .share({
          title: "Unit Converter - Toolstrek",
          text: `Check out this free Unit Converter on Toolstrek! I converted ${amount} ${fromUnit} to ${output} ${toUnit} instantly.`,
          url,
        })
        .catch((err) => console.error("Error sharing", err));
    } else {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handlePopularClick = (pop) => {
    setCategory(pop.cat);
    // Setting units directly (timeout is used because category useEffect also writes fromUnit/toUnit)
    setTimeout(() => {
      setFromUnit(pop.from);
      setToUnit(pop.to);
      setAmount("1");
    }, 50);
  };

  const handleRecentClick = (record) => {
    setCategory(record.category);
    setTimeout(() => {
      setFromUnit(record.fromUnit);
      setToUnit(record.toUnit);
      setAmount(record.amount);
    }, 50);
  };

  const clearRecents = () => {
    setRecentConversions([]);
    localStorage.removeItem("toolstrek_recent_conversions");
  };

  const unitOptions = Object.entries(conversionConfig[category].units).map(
    ([key, u]) => ({
      value: key,
      label: `${u.name} (${u.symbol})`,
    }),
  );

  return (
    <ToolPageShell widthClassName="" className="py-8 px-4">
      {/* 1. Header Banner */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4">
          Unit <span className="text-brandColor">Converter</span>
        </h1>
        <p className="text-muted-foreground text-md md:text-lg max-w-xl mx-auto">
          Convert length, weight, temperature, area, volume, speed, time, and
          data storage units instantly in your browser.
        </p>
      </div>

      {/* 2. Responsive Category Tab Selector */}
      <div className="relative mb-6">
        <div
          ref={tabContainerRef}
          className="flex overflow-x-auto gap-2 pb-3 pt-1 scroll-smooth tool-chip-scroller snap-x snap-mandatory"
        >
          {Object.entries(conversionConfig).map(([key, value]) => {
            const Icon = value.icon;
            const isActive = category === key;
            return (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`snap-start flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-brandColor text-white border-brandColor shadow-md shadow-brandColor/20 scale-[1.02]"
                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{value.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Calculator Card */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/20 dark:shadow-none mb-8 relative ">
        {/* Decorative subtle background gradient blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brandColor/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* FROM Panel */}
          <div className="space-y-2">
            <label
              htmlFor="fromAmount"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              From Amount
            </label>
            <div className="relative">
              <input
                id="fromAmount"
                type="text"
                inputMode="decimal"
                pattern="[0-9.-]*"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow numbers, negative sign, and decimal point
                  if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
                    setAmount(val);
                  }
                }}
                placeholder="Enter value..."
                className="w-full text-2xl font-bold bg-muted/40 dark:bg-muted/20 border border-border rounded-2xl px-4 py-4 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-brandColor/50 focus:border-brandColor transition-all"
              />
              {amount && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground transition-all cursor-pointer"
                  title="Clear input"
                  aria-label="Clear input"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-1 pt-1">
              <label
                htmlFor="fromUnitSelect"
                className="text-xs font-semibold text-muted-foreground"
              >
                From Unit
              </label>
              <CustomSelect
                id="fromUnitSelect"
                value={fromUnit}
                onChange={setFromUnit}
                options={unitOptions}
                label="From Unit"
              />
            </div>
          </div>

          {/* SWAP Button */}
          <div className="flex justify-center md:pt-4">
            <button
              onClick={handleSwap}
              className="p-4 rounded-full bg-brandColor/10 dark:bg-brandColor/20 border border-brandColor/20 text-brandColor hover:bg-brandColor hover:text-white transition-all duration-300 hover:scale-110 cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
              title="Swap Units"
              aria-label="Swap Units"
            >
              <RefreshCw className="w-5 h-5 transition-transform duration-500 hover:rotate-180" />
            </button>
          </div>

          {/* TO Panel */}
          <div className="space-y-2">
            <label
              htmlFor="toAmount"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              To Result
            </label>
            <div className="relative">
              <input
                id="toAmount"
                type="text"
                readOnly
                value={output}
                placeholder="Result"
                className="w-full text-2xl font-bold bg-muted/60 dark:bg-muted/30 border border-border/80 rounded-2xl px-4 py-4 pr-12 text-foreground font-sans select-all"
              />
              {output && (
                <button
                  onClick={handleCopy}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all cursor-pointer ${
                    copied
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
                  }`}
                  title="Copy result"
                  aria-label="Copy result"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            <div className="space-y-1 pt-1">
              <label
                htmlFor="toUnitSelect"
                className="text-xs font-semibold text-muted-foreground"
              >
                To Unit
              </label>
              <CustomSelect
                id="toUnitSelect"
                value={toUnit}
                onChange={setToUnit}
                options={unitOptions}
                label="To Unit"
              />
            </div>
          </div>
        </div>

        {/* Clear & Share & Status Footer */}
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">
              Real-time instant client-side conversion active
            </span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleClear}
              disabled={!amount && !output}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-card transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={handleShare}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                copiedShare
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-brandColor/10 dark:bg-brandColor/20 border-brandColor/20 text-brandColor hover:bg-brandColor hover:text-white"
              }`}
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4" />
                  URL Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share Tool
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Recent & Popular Section (Stacked or Split Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Popular Conversions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brandColor" />
            Popular Conversions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {popularConversions.map((pop, i) => (
              <button
                key={i}
                onClick={() => handlePopularClick(pop)}
                className="text-left p-3 rounded-xl border border-border/80 bg-card hover:bg-muted hover:border-brandColor/30 text-xs font-semibold text-foreground transition-all duration-200 flex flex-col justify-between h-16 shadow-xs hover:shadow-sm cursor-pointer"
              >
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  {pop.cat}
                </span>
                <span className="truncate">{pop.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-brandColor" />
              Recent Conversions
            </h2>
            {recentConversions.length > 0 && (
              <button
                onClick={clearRecents}
                className="text-xs font-semibold text-destructive hover:underline cursor-pointer flex items-center gap-1"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="space-y-2">
            {recentConversions.length === 0 ? (
              <div className="h-[140px] flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border p-4 bg-muted/20">
                <History className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">
                  Your recent conversions will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[342px] overflow-y-auto pr-1">
                {recentConversions.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => handleRecentClick(rec)}
                    className="w-full text-left p-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted hover:border-brandColor/20 text-xs font-medium text-foreground transition-all flex justify-between items-center cursor-pointer"
                  >
                    <span className="font-semibold text-muted-foreground text-[10px] uppercase">
                      {rec.category}
                    </span>
                    <span className="truncate max-w-[200px]">
                      {rec.amount} {rec.fromSymbol} ={" "}
                      <span className="font-bold text-brandColor">
                        {rec.output}
                      </span>{" "}
                      {rec.toSymbol}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Formulas Section */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 mb-8 shadow-xs">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-brandColor" />
          Conversion Formulas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(conversionConfig[category].formulas).map(
            ([key, formula]) => (
              <div
                key={key}
                className="p-4 rounded-2xl bg-muted/40 border border-border/80"
              >
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                  {key.replace("to", "➞")}
                </span>
                <code className="text-sm font-mono font-bold text-brandColor bg-background px-2.5 py-1 rounded-lg border border-border/40 inline-block">
                  {formula}
                </code>
              </div>
            ),
          )}
        </div>
      </div>

      {/* 6. FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-brandColor" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border border-border/80 rounded-2xl bg-card overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left px-5 py-4 font-semibold text-foreground hover:text-brandColor transition-colors flex justify-between items-center cursor-pointer text-sm md:text-base"
                >
                  <span>{faq.question}</span>
                  <span
                    className={`text-muted-foreground transform transition-transform duration-300 font-sans ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 text-sm md:text-base text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </ToolPageShell>
  );
}
