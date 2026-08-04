"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Hash,
  ArrowLeftRight,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Info,
  Clock,
  Trash2,
  Sparkles,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─── Roman Numeral Conversion Data & Helpers ─────────────────────────────────

const ARABIC_TO_ROMAN_MAP = [
  { value: 1000, symbol: "M", name: "One Thousand" },
  { value: 900, symbol: "CM", name: "Nine Hundred (100 before 1000)" },
  { value: 500, symbol: "D", name: "Five Hundred" },
  { value: 400, symbol: "CD", name: "Four Hundred (100 before 500)" },
  { value: 100, symbol: "C", name: "One Hundred" },
  { value: 90, symbol: "XC", name: "Ninety (10 before 100)" },
  { value: 50, symbol: "L", name: "Fifty" },
  { value: 40, symbol: "XL", name: "Forty (10 before 50)" },
  { value: 10, symbol: "X", name: "Ten" },
  { value: 9, symbol: "IX", name: "Nine (1 before 10)" },
  { value: 5, symbol: "V", name: "Five" },
  { value: 4, symbol: "IV", name: "Four (1 before 5)" },
  { value: 1, symbol: "I", name: "One" },
];

const ROMAN_CHAR_VALUES = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

const ROMAN_TO_ARABIC_MAP = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XL: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1,
};

// Validates standard Roman numeral syntax using regex (Range 1 to 3999)
function validateRomanString(str) {
  const sanitized = str.trim().toUpperCase();
  if (!sanitized) return { isValid: false, message: "Please enter a Roman numeral." };
  
  if (!/^[IVXLCDM]+$/.test(sanitized)) {
    return { 
      isValid: false, 
      message: "Invalid characters detected. Roman numerals only contain letters: I, V, X, L, C, D, M." 
    };
  }

  // Regex matches standard Roman numerals up to 3999
  const standardRegex = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  if (!standardRegex.test(sanitized)) {
    return {
      isValid: false,
      message: "Incorrect structure. Ensure letters are repeated at most 3 times (e.g. write IV, not IIII) and are in descending value order except for valid subtractive pairs (e.g., IX, XL)."
    };
  }
  
  return { isValid: true, message: "" };
}

// Convert Arabic to Roman
function arabicToRoman(numStr) {
  const num = parseInt(numStr, 10);
  if (isNaN(num)) {
    return { output: "", error: "Please enter a valid number.", breakdown: [] };
  }
  if (num < 1 || num > 3999) {
    return { 
      output: "", 
      error: "Value must be between 1 and 3,999 for standard Roman numerals.", 
      breakdown: [] 
    };
  }

  let temp = num;
  let roman = "";
  const breakdown = [];

  for (const item of ARABIC_TO_ROMAN_MAP) {
    while (temp >= item.value) {
      roman += item.symbol;
      breakdown.push({
        symbol: item.symbol,
        value: item.value,
        name: item.name,
      });
      temp -= item.value;
    }
  }

  return { output: roman, error: "", breakdown };
}

// Convert Roman to Arabic
function romanToArabic(romanStr) {
  const sanitized = romanStr.trim().toUpperCase();
  const validation = validateRomanString(sanitized);
  
  if (!validation.isValid) {
    return { output: "", error: validation.message, breakdown: [] };
  }

  let arabic = 0;
  const breakdown = [];
  let i = 0;

  while (i < sanitized.length) {
    const doubleChar = sanitized.substring(i, i + 2);
    const singleChar = sanitized.substring(i, i + 1);

    if (doubleChar.length === 2 && ROMAN_TO_ARABIC_MAP[doubleChar] !== undefined) {
      const val = ROMAN_TO_ARABIC_MAP[doubleChar];
      arabic += val;
      breakdown.push({
        symbol: doubleChar,
        value: val,
        explanation: `${doubleChar} = ${ROMAN_CHAR_VALUES[doubleChar[1]]} - ${ROMAN_CHAR_VALUES[doubleChar[0]]} = ${val}`,
        name: `${doubleChar[0]} subtracted from ${doubleChar[1]}`
      });
      i += 2;
    } else {
      const val = ROMAN_CHAR_VALUES[singleChar];
      arabic += val;
      breakdown.push({
        symbol: singleChar,
        value: val,
        explanation: `${singleChar} = ${val}`,
        name: ARABIC_TO_ROMAN_MAP.find(x => x.symbol === singleChar)?.name || "Single Digit"
      });
      i += 1;
    }
  }

  return { output: arabic.toString(), error: "", breakdown };
}

// Preset list for quick selection
const PRESETS = [
  { label: "Current Year", arabic: "2026", roman: "MMXXVI" },
  { label: "Y2K Millennium", arabic: "2000", roman: "MM" },
  { label: "Classic 1994", arabic: "1994", roman: "MCMXCIV" },
  { label: "Super Bowl LX", arabic: "60", roman: "LX" },
  { label: "Magna Carta", arabic: "1215", roman: "MCCXV" },
  { label: "Lucky Number", arabic: "7", roman: "VII" },
];

export default function RomanNumeralConverter() {
  const [mode, setMode] = useState("arabicToRoman"); // "arabicToRoman" | "romanToArabic"
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [breakdown, setBreakdown] = useState([]);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("cheat-sheet"); // "cheat-sheet" | "rules" | "symbols"

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("roman_numeral_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  // Save history helper
  const saveHistory = useCallback((inputVal, outputVal, currentMode) => {
    if (!inputVal.trim() || !outputVal.trim()) return;
    setHistory((prev) => {
      const isDuplicate = prev.some(
        (item) => item.input === inputVal && item.mode === currentMode
      );
      if (isDuplicate) return prev;

      const newHistory = [
        {
          id: Date.now(),
          input: inputVal,
          output: outputVal,
          mode: currentMode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 9), // limit to 10 items
      ];
      try {
        localStorage.setItem("roman_numeral_history", JSON.stringify(newHistory));
      } catch (_) {}
      return newHistory;
    });
  }, []);

  // Perform translation on input change
  useEffect(() => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setOutputText("");
      setError("");
      setBreakdown([]);
      return;
    }

    let result;
    if (mode === "arabicToRoman") {
      result = arabicToRoman(trimmed);
    } else {
      result = romanToArabic(trimmed);
    }

    setOutputText(result.output);
    setError(result.error);
    setBreakdown(result.breakdown);

    if (result.output && !result.error) {
      // Debounce history addition to avoid cluttering on every single keypress
      const handler = setTimeout(() => {
        saveHistory(trimmed, result.output, mode);
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [inputText, mode, saveHistory]);

  const handleSwap = useCallback(() => {
    setMode((prev) => (prev === "arabicToRoman" ? "romanToArabic" : "arabicToRoman"));
    setInputText(outputText);
    setOutputText(inputText);
    setError("");
    setBreakdown([]);
  }, [inputText, outputText]);

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setError("");
    setBreakdown([]);
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handlePresetClick = (preset) => {
    if (mode === "arabicToRoman") {
      setInputText(preset.arabic);
    } else {
      setInputText(preset.roman);
    }
  };

  const handleHistoryClick = (item) => {
    setMode(item.mode);
    setInputText(item.input);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("roman_numeral_history");
    } catch (_) {}
  };

  // Virtual Roman Keyboard insertion
  const handleKeypress = (char) => {
    if (mode !== "romanToArabic") return;
    setInputText((prev) => {
      const sanitized = (prev + char).toUpperCase();
      return sanitized;
    });
  };

  // Backspace key for Virtual Keyboard
  const handleBackspace = () => {
    setInputText((prev) => prev.slice(0, -1));
  };

  return (
    <ToolPageShell>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="text-center mb-10 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
          <Hash size={14} />
          Math & Antiquity
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          Roman Numeral{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandColor to-indigo-500">
            Converter
          </span>
        </h1>
        <p className="mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Convert standard integers (Arabic digits) to ancient Roman numerals and vice versa.
          Explore the step-by-step addition and subtraction formulas instantly.
        </p>
      </div>

      {/* ── Presets Grid ────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center items-center">
        <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Sparkles size={14} className="text-yellow-500 animate-pulse" /> Quick Presets:
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            className="px-3 py-1 text-xs md:text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-brandColor hover:text-white dark:hover:bg-brandColor border border-gray-200 dark:border-gray-700 transition duration-200 cursor-pointer shadow-xs"
          >
            {preset.label} ({mode === "arabicToRoman" ? preset.arabic : preset.roman})
          </button>
        ))}
      </div>

      {/* ── Main Workspace Panel ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input / Output Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-md transition duration-300 relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brandColor/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50/5 rounded-full blur-2xl" />

            {/* Mode Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 dark:border-gray-850 pb-4">
              <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-brandColor rounded-full animate-pulse" />
                {mode === "arabicToRoman" ? "Convert Arabic to Roman" : "Convert Roman to Arabic"}
              </h2>
              <button
                onClick={handleSwap}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-brandColor/10 dark:bg-brandColor/20 text-brandColor hover:bg-brandColor hover:text-white transition duration-200 text-xs md:text-sm font-semibold cursor-pointer border border-brandColor/20"
                title="Swap translation mode"
              >
                <ArrowLeftRight size={14} />
                Swap Direction
              </button>
            </div>

            {/* Input Box */}
            <div className="mb-4">
              <label htmlFor="num-input" className="block text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">
                {mode === "arabicToRoman" ? "Enter Number (Arabic / 1 - 3999)" : "Enter Roman Numeral"}
              </label>
              <div className="relative">
                <input
                  id="num-input"
                  type={mode === "arabicToRoman" ? "number" : "text"}
                  min="1"
                  max="3999"
                  value={inputText}
                  onChange={(e) => setInputText(mode === "arabicToRoman" ? e.target.value : e.target.value.toUpperCase())}
                  placeholder={mode === "arabicToRoman" ? "e.g., 2026, 1994, 49" : "e.g., MMXXVI, MCMXCIV, XLIX"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-hidden focus:ring-2 focus:ring-brandColor text-sm md:text-base font-mono tracking-wider transition"
                />
                {inputText && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Clear input"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
              
              {/* Live Error Warnings */}
              {error && (
                <div className="mt-3 flex items-start gap-2 p-3 text-xs md:text-sm text-red-700 dark:text-red-300 bg-red-55/50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 animate-fadeIn">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Virtual Roman Keyboard (ONLY for Roman to Arabic mode) */}
            {mode === "romanToArabic" && (
              <div className="mb-6 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Interactive Roman Keyboard
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {Object.keys(ROMAN_CHAR_VALUES).map((char) => (
                    <button
                      key={char}
                      onClick={() => handleKeypress(char)}
                      className="py-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-mono font-bold hover:bg-brandColor hover:text-white dark:hover:bg-brandColor transition duration-150 text-xs md:text-sm cursor-pointer shadow-xs active:scale-95 flex flex-col items-center justify-center"
                    >
                      <span>{char}</span>
                      <span className="text-[10px] font-sans font-normal opacity-60">
                        {ROMAN_CHAR_VALUES[char]}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={handleBackspace}
                    disabled={!inputText}
                    className="col-span-2 sm:col-span-1 py-2.5 rounded-lg bg-gray-150 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-650 transition duration-150 text-xs md:text-sm cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:pointer-events-none flex items-center justify-center font-semibold"
                    title="Backspace"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Output Box */}
            <div className="bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400">
                  Result
                </span>
                {outputText && !error && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs md:text-sm text-brandColor hover:bg-brandColor/10 rounded-lg transition duration-150 cursor-pointer border-0"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-green-500" />
                        <span className="text-green-500 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span className="font-medium">Copy Result</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="min-h-12 flex items-center justify-start py-2 border-b border-gray-200 dark:border-gray-800">
                {outputText && !error ? (
                  <div className="text-2xl md:text-4xl font-mono font-extrabold text-brandColor tracking-wider select-all break-all leading-tight">
                    {outputText}
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-600 text-xs md:text-sm italic">
                    {error ? "Awaiting correct input..." : "Result will appear here..."}
                  </span>
                )}
              </div>

              {/* Character Details in Output */}
              {outputText && !error && (
                <div className="mt-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    <strong>Length:</strong> {outputText.length} {outputText.length === 1 ? "char" : "chars"}
                  </span>
                  <span>
                    <strong>System:</strong> {mode === "arabicToRoman" ? "Roman Numerals" : "Arabic Decimals"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* History Panel */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-850 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  Recent Conversions
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1 rounded-md transition text-xs flex items-center gap-1 cursor-pointer font-semibold border-0"
                >
                  <Trash2 size={12} />
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistoryClick(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 hover:bg-brandColor/5 dark:hover:bg-brandColor/10 hover:border-brandColor/30 dark:hover:border-brandColor/30 transition text-gray-700 dark:text-gray-300 font-mono cursor-pointer"
                  >
                    <span>{item.input}</span>
                    <span className="text-gray-400 dark:text-gray-600 text-xs">→</span>
                    <span className="text-brandColor font-bold">{item.output}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Math Breakdown & Reference Manual */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* STEP-BY-STEP MATHEMATICAL BREAKDOWN */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-md transition duration-300 relative overflow-hidden flex-1">
            <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-brandColor" />
              Calculation Breakdown
            </h2>

            {inputText && outputText && !error ? (
              <div className="space-y-4">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  How standard {mode === "arabicToRoman" ? "Arabic" : "Roman"} value is constructed:
                </p>

                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl p-4 space-y-3 font-mono">
                  {/* Calculation Visual Loop */}
                  {mode === "arabicToRoman" ? (
                    // Arabic to Roman Breakdown
                    <div className="space-y-3">
                      <div className="text-xs md:text-sm font-semibold border-b border-gray-200 dark:border-gray-800 pb-2 text-gray-700 dark:text-gray-300">
                        {inputText} = {breakdown.map(b => b.value).join(" + ")}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm">
                        {breakdown.map((item, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && <span className="text-gray-400 font-sans">+</span>}
                            <span
                              className="px-2.5 py-1.5 rounded bg-brandColor/10 dark:bg-brandColor/25 text-brandColor font-bold border border-brandColor/20 group relative cursor-help flex flex-col items-center"
                              title={item.name}
                            >
                              <span>{item.symbol}</span>
                              <span className="text-[10px] font-sans font-normal text-gray-500 dark:text-gray-400 text-center">
                                {item.value}
                              </span>
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Roman to Arabic Breakdown
                    <div className="space-y-3">
                      <div className="text-xs md:text-sm font-semibold border-b border-gray-200 dark:border-gray-800 pb-2 text-gray-700 dark:text-gray-300">
                        {breakdown.map(b => b.value).join(" + ")} = {outputText}
                      </div>
                      <div className="space-y-2">
                        {breakdown.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs md:text-sm border-b border-dashed border-gray-200 dark:border-gray-800 pb-1.5">
                            <span className="font-bold text-brandColor bg-brandColor/5 dark:bg-brandColor/15 px-1.5 py-0.5 rounded">
                              {item.symbol}
                            </span>
                            <span className="text-gray-400 text-xs italic">{item.name}</span>
                            <span className="text-gray-800 dark:text-gray-200 font-semibold">{item.explanation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-center text-brandColor text-sm md:text-base font-bold border-t border-gray-200 dark:border-gray-800">
                    Total = {mode === "arabicToRoman" ? outputText : outputText}
                  </div>
                </div>

                <div className="flex gap-2 items-start text-xs text-gray-500 bg-blue-50/50 dark:bg-blue-950/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Roman Numerals are written from left to right using subtraction rules for letters preceding higher values (e.g. IV = 4, IX = 9, XL = 40).
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20">
                <HelpCircle size={32} className="text-gray-300 dark:text-gray-700 mb-2" />
                <span className="text-gray-400 text-xs md:text-sm">
                  {error ? "Resolve current errors to see math calculation." : "Enter a value on the left to see the step-by-step math breakdown."}
                </span>
              </div>
            )}
          </div>

          {/* INTERACTIVE REFERENCE & CHEAT SHEET TABS */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-850 p-5 shadow-md flex-1">
            {/* Tabs Trigger Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 overflow-x-auto gap-2">
              {[
                { id: "cheat-sheet", label: "Cheat Sheet", icon: Hash },
                { id: "symbols", label: "All Symbols", icon: Sparkles },
                { id: "rules", label: "Key Rules", icon: Info },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition duration-200 border-none cursor-pointer shrink-0 ${
                      activeTab === tab.id
                        ? "bg-brandColor text-white"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850"
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            {activeTab === "cheat-sheet" && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-gray-500">
                  Quick-click any numeral to copy it or check it in the input area:
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {[
                    { a: "1", r: "I" }, { a: "2", r: "II" }, { a: "3", r: "III" }, { a: "4", r: "IV" },
                    { a: "5", r: "V" }, { a: "6", r: "VI" }, { a: "7", r: "VII" }, { a: "8", r: "VIII" },
                    { a: "9", r: "IX" }, { a: "10", r: "X" }, { a: "20", r: "XX" }, { a: "40", r: "XL" },
                    { a: "50", r: "L" }, { a: "90", r: "XC" }, { a: "100", r: "C" }, { a: "400", r: "CD" },
                    { a: "500", r: "D" }, { a: "900", r: "CM" }, { a: "1000", r: "M" }, { a: "2026", r: "MMXXVI" }
                  ].map((pair) => (
                    <button
                      key={pair.a}
                      onClick={() => setInputText(mode === "arabicToRoman" ? pair.a : pair.r)}
                      className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 text-xs md:text-sm hover:border-brandColor hover:bg-brandColor/5 hover:text-brandColor transition duration-150 cursor-pointer font-mono font-medium text-left"
                    >
                      <span className="text-gray-500 dark:text-gray-400 font-sans text-xs">{pair.a}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-100">{pair.r}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "symbols" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-2 bg-gray-50/30 dark:bg-gray-950/20">
                    <span className="block font-bold text-brandColor font-mono text-sm md:text-base border-b border-gray-200 dark:border-gray-800 pb-1 mb-1">Standard Symbols</span>
                    {Object.entries(ROMAN_CHAR_VALUES).map(([sym, val]) => (
                      <div key={sym} className="flex justify-between font-mono py-0.5 border-b border-gray-100 dark:border-gray-850 last:border-0 text-gray-700 dark:text-gray-300">
                        <span>{sym}</span>
                        <span>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-2 bg-gray-50/30 dark:bg-gray-950/20">
                    <span className="block font-bold text-indigo-500 font-mono text-sm md:text-base border-b border-gray-200 dark:border-gray-800 pb-1 mb-1">Subtractive Pairs</span>
                    {[
                      { s: "IV", v: 4 }, { s: "IX", v: 9 },
                      { s: "XL", v: 40 }, { s: "XC", v: 90 },
                      { s: "CD", v: 400 }, { s: "CM", v: 900 }
                    ].map((pair) => (
                      <div key={pair.s} className="flex justify-between font-mono py-0.5 border-b border-gray-100 dark:border-gray-850 last:border-0 text-gray-700 dark:text-gray-300">
                        <span>{pair.s}</span>
                        <span>{pair.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rules" && (
              <div className="space-y-3 animate-fadeIn text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-brandColor rounded-full mt-1.5 shrink-0" />
                  <p>
                    <strong>Additive Rule:</strong> When a smaller symbol appears after a larger symbol, they are added together. (e.g., VI = 5 + 1 = 6).
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-brandColor rounded-full mt-1.5 shrink-0" />
                  <p>
                    <strong>Subtractive Rule:</strong> When a smaller symbol appears before a larger symbol, it is subtracted. (e.g., IV = 5 - 1 = 4, IX = 10 - 1 = 9).
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-brandColor rounded-full mt-1.5 shrink-0" />
                  <p>
                    <strong>Repetition Limit:</strong> Standard Roman characters (I, X, C, M) can be repeated up to 3 times in a row. V, L, D cannot be repeated.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-brandColor rounded-full mt-1.5 shrink-0" />
                  <p>
                    <strong>Maximum Range:</strong> The standard system handles values up to 3,999 (MMMCMXCIX) because we don't have symbols larger than M (1000).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
