"use client";
import React, { useState, useEffect, useRef } from "react";

export const CURRENCIES = [
  { symbol: "$", code: "USD", label: "USD – US Dollar" },
  { symbol: "€", code: "EUR", label: "EUR – Euro" },
  { symbol: "£", code: "GBP", label: "GBP – British Pound" },
  { symbol: "৳", code: "BDT", label: "BDT – Bangladeshi Taka" },
  { symbol: "₹", code: "INR", label: "INR – Indian Rupee" },
  { symbol: "$", code: "AUD", label: "AUD – Australian Dollar" },
  { symbol: "$", code: "CAD", label: "CAD – Canadian Dollar" },
  { symbol: "$", code: "SGD", label: "SGD – Singapore Dollar" },
  { symbol: "د.إ", code: "AED", label: "AED – UAE Dirham" },
  { symbol: "ر.س", code: "SAR", label: "SAR – Saudi Riyal" },
  { symbol: "¥", code: "JPY", label: "JPY – Japanese Yen" },
];

export default function AdvancedOptions({
  selectedCurrencyCode,
  onCurrencyChange,
  decimals,
  onDecimalsChange,
  useSeparator,
  onSeparatorToggle,
  onApplyPreset,
  reverseCalc,
  onReverseCalcToggle,
  mode,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCurrency =
    CURRENCIES.find((c) => c.code === selectedCurrencyCode) || CURRENCIES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presets = [5, 10, 15, 18, 20, 25];

  return (
    <div className="border border-violet-100 dark:border-violet-900/30 rounded-2xl overflow-hidden bg-white dark:bg-gray-805">
      {/* Header / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-violet-700 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-900/10 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Options
        </span>
        <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-full font-semibold">
          {isOpen ? "Hide" : "Customize"}
        </span>
      </button>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[1000px] opacity-100 border-t border-violet-100 dark:border-violet-900/30" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-5 space-y-6 bg-gradient-to-br from-white to-violet-50/10 dark:from-gray-800 dark:to-violet-950/5">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Currency Selector */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Currency
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-200 outline-none hover:border-gray-300 dark:hover:border-gray-500"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 font-bold text-xs">
                    {selectedCurrency.symbol}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {selectedCurrency.label}
                  </span>
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute z-40 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-56 overflow-y-auto py-1">
                  {CURRENCIES.map((c) => {
                    const isSelected = c.code === selectedCurrencyCode;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          onCurrencyChange(c);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors text-left ${
                          isSelected
                            ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-lg font-bold text-xs ${
                              isSelected
                                ? "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {c.symbol}
                          </span>
                          <span>{c.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Decimal Places */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Decimal Places
              </label>
              <div className="grid grid-cols-4 gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                {[0, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDecimalsChange(d)}
                    className={`py-2 rounded-lg font-medium text-xs transition-all duration-200 text-center ${
                      decimals === d
                        ? "bg-white dark:bg-gray-600 text-violet-600 dark:text-violet-400 shadow-sm font-bold"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {d} {d === 2 ? "(Default)" : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            {/* Thousands Separator Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/40">
              <div>
                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Thousands Separator
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Format values like {useSeparator ? "1,000,000" : "1000000"}
                </span>
              </div>
              <button
                type="button"
                onClick={onSeparatorToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  useSeparator ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    useSeparator ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Reverse Calculation Toggle */}
            {mode !== "only" && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/40 animate-fadeIn">
                <div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Reverse Calculation
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Calculate base price from final price or vice versa
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onReverseCalcToggle}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    reverseCalc ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      reverseCalc ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quick Tax Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onApplyPreset(p)}
                  className="px-4 py-2 text-xs font-semibold border border-violet-100 dark:border-violet-900/30 text-violet-600 dark:text-violet-400 bg-violet-50/30 dark:bg-violet-900/10 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-xl transition-all cursor-pointer"
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
