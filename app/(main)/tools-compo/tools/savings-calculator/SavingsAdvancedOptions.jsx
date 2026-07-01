"use client";
import React, { useState, useEffect, useRef } from "react";

export const CURRENCIES = [
  { symbol: "৳", code: "BDT", label: "BDT – Bangladeshi Taka" },
  { symbol: "$", code: "USD", label: "USD – US Dollar" },
  { symbol: "€", code: "EUR", label: "EUR – Euro" },
  { symbol: "£", code: "GBP", label: "GBP – British Pound" },
  { symbol: "₹", code: "INR", label: "INR – Indian Rupee" },
  { symbol: "$", code: "AUD", label: "AUD – Australian Dollar" },
  { symbol: "$", code: "CAD", label: "CAD – Canadian Dollar" },
  { symbol: "$", code: "SGD", label: "SGD – Singapore Dollar" },
  { symbol: "د.إ", code: "AED", label: "AED – UAE Dirham" },
  { symbol: "ر.س", code: "SAR", label: "SAR – Saudi Riyal" },
  { symbol: "¥", code: "JPY", label: "JPY – Japanese Yen" },
];

export const COMPOUND_FREQUENCIES = [
  { value: 365, label: "Daily" },
  { value: 12, label: "Monthly" },
  { value: 4, label: "Quarterly" },
  { value: 2, label: "Semi-Annually" },
  { value: 1, label: "Annually" },
];

// ─── Reusable Modern Dropdown ──────────────────────────────────────────────
function ModernDropdown({ label, value, onChange, options, renderOption, renderSelected }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value || o.code === value);

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 shadow-sm hover:border-violet-400 dark:hover:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-200 cursor-pointer"
      >
        <span className="flex items-center gap-2.5 truncate">
          {renderSelected ? renderSelected(selected) : <span>{selected?.label}</span>}
        </span>
        <svg
          className={`w-4 h-4 ml-2 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1 scrollbar-thin">
            {options.map((opt) => {
              const optVal = opt.value ?? opt.code;
              const isSelected = optVal === value;
              return (
                <button
                  key={optVal}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-150 ${isSelected
                    ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"
                    }`}
                >
                  {renderOption ? renderOption(opt, isSelected) : <span>{opt.label}</span>}
                  {isSelected && (
                    <svg className="w-4 h-4 ml-auto text-violet-600 dark:text-violet-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Number Input with % suffix ────────────────────────────────────────────
function PercentInput({ label, value, onChange, min = 0, max = 100, step = 1, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full pl-4 pr-9 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm hover:border-violet-400 dark:hover:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-200"
          placeholder="0"
        />
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
          %
        </div>
      </div>
      {hint && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SavingsAdvancedOptions({
  selectedCurrencyCode,
  onCurrencyChange,
  compoundFrequency,
  onCompoundFrequencyChange,
  contributionTiming,
  onContributionTimingChange,
  taxRate,
  onTaxRateChange,
  inflationRate,
  onInflationRateChange,
  annualIncrease,
  onAnnualIncreaseChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Currency dropdown options – value = code
  const currencyOptions = CURRENCIES.map((c) => ({ ...c, value: c.code }));
  const compoundOptions = COMPOUND_FREQUENCIES.map((f) => ({ ...f }));
  const timingOptions = [
    { value: "beginning", label: "Beginning of Month" },
    { value: "end", label: "End of Month" },
  ];

  return (
    <div className="border border-violet-100 dark:border-violet-900/30 rounded-2xl  bg-white dark:bg-gray-800">
      {/* Header / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-violet-700 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-900/10 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all cursor-pointer"
      >
        <span className="flex items-center gap-2.5">
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <svg className="w-4 h-4 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Advanced Options
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${isOpen ? "bg-violet-200 dark:bg-violet-800/50 text-violet-700 dark:text-violet-300" : "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300"}`}>
          {isOpen ? "Hide" : "Customize"}
        </span>
      </button>

      {/* Accordion Body */}
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? "border-t border-violet-100 dark:border-violet-900/30" : "overflow-hidden max-h-0 opacity-0 pointer-events-none"
          }`}
        style={isOpen ? {} : { maxHeight: 0 }}
      >
        <div className="p-5 bg-gradient-to-br from-white to-violet-50/20 dark:from-gray-800 dark:to-violet-950/10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Currency */}
            <ModernDropdown
              label="Currency"
              value={selectedCurrencyCode}
              onChange={(opt) => onCurrencyChange(opt)}
              options={currencyOptions}
              renderSelected={(opt) => (
                <>
                  <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold text-xs shrink-0">
                    {opt?.symbol}
                  </span>
                  <span className="font-medium truncate">{opt?.label}</span>
                </>
              )}
              renderOption={(opt, isSel) => (
                <>
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg font-bold text-xs shrink-0 ${isSel ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300" : "bg-gray-100 dark:bg-gray-750 text-gray-500 dark:text-gray-400"}`}>
                    {opt.symbol}
                  </span>
                  <span>{opt.label}</span>
                </>
              )}
            />

            {/* Compounding Interval */}
            <ModernDropdown
              label="Compounding Interval"
              value={compoundFrequency}
              onChange={(opt) => onCompoundFrequencyChange(opt.value)}
              options={compoundOptions}
              renderSelected={(opt) => (
                <>
                  <svg className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-medium">{opt?.label}</span>
                </>
              )}
              renderOption={(opt) => <span>{opt.label}</span>}
            />

            {/* Contribution Timing */}
            <ModernDropdown
              label="Contribution Timing"
              value={contributionTiming}
              onChange={(opt) => onContributionTimingChange(opt.value)}
              options={timingOptions}
              renderSelected={(opt) => (
                <>
                  <svg className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{opt?.label}</span>
                </>
              )}
              renderOption={(opt) => <span>{opt.label}</span>}
            />

            {/* Tax Rate */}
            <PercentInput
              label="Tax Rate (on Interest)"
              value={taxRate}
              onChange={onTaxRateChange}
              min={0} max={90} step={1}
              hint="Set 0 to skip tax deduction"
            />

            {/* Inflation Rate */}
            <PercentInput
              label="Annual Inflation Rate"
              value={inflationRate}
              onChange={onInflationRateChange}
              min={0} max={30} step={0.1}
              hint="Set 0 to skip inflation adjustment"
            />

            {/* Annual Step-up */}
            <PercentInput
              label="Annual Step-up (Increase)"
              value={annualIncrease}
              onChange={onAnnualIncreaseChange}
              min={0} max={50} step={0.5}
              hint="Set 0 for flat contributions each year"
            />

          </div>
        </div>
      </div>
    </div>
  );
}
