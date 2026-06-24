"use client";
import React, { useState } from "react";

export const formatCurrency = (value, symbol, decimalPlaces = 2, useSeparator = true) => {
  if (value === undefined || value === null || isNaN(value)) return "—";
  const num = Number(value);
  const rounded = num.toFixed(decimalPlaces);
  if (!useSeparator) {
    return `${symbol}${rounded}`;
  }
  const parts = rounded.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${symbol}${parts.join(".")}`;
};

function ResultRow({ label, value, rawValue, currencySymbol, isHero = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (rawValue !== undefined && rawValue !== null) {
      navigator.clipboard.writeText(rawValue.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (isHero) {
    return (
      <div className="text-center py-6 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl text-white shadow-lg relative overflow-hidden mb-6 group">
        {/* Subtle background glow effect */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />

        <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-violet-100 mb-1">
          {label}
        </p>
        <div className="text-4xl sm:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-2">
          <span>{value}</span>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy value"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white focus:outline-none flex items-center justify-center"
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/30 transition-all hover:border-violet-100 dark:hover:border-violet-900/20 group">
      <div>
        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </span>
        <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{value}</span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy value"
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition-all text-gray-400 focus:outline-none flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        {copied ? (
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function VatResultCard({
  mode,
  currencySymbol,
  decimals,
  useSeparator,
  originalAmount,
  taxRate,
  taxAmount,
  finalAmount,
  reverseCalc,
}) {
  const formattedOriginal = formatCurrency(originalAmount, currencySymbol, decimals, useSeparator);
  const formattedTax = formatCurrency(taxAmount, currencySymbol, decimals, useSeparator);
  const formattedFinal = formatCurrency(finalAmount, currencySymbol, decimals, useSeparator);

  // Decide what value is shown in the Hero (the prominent header)
  let heroLabel = "Total Including Tax (Final Price)";
  let heroValue = formattedFinal;
  let heroRawValue = finalAmount;

  if (mode === "remove") {
    heroLabel = "Tax Exclusive Amount (Base Price)";
    heroValue = formattedOriginal;
    heroRawValue = originalAmount;
  } else if (mode === "only") {
    heroLabel = "Tax Amount Only";
    heroValue = formattedTax;
    heroRawValue = taxAmount;
  }

  // Override hero if reverse calculation is active
  if (reverseCalc) {
    if (mode === "add") {
      heroLabel = "Tax Exclusive Amount (Base Price)";
      heroValue = formattedOriginal;
      heroRawValue = originalAmount;
    } else if (mode === "remove") {
      heroLabel = "Total Including Tax (Final Price)";
      heroValue = formattedFinal;
      heroRawValue = finalAmount;
    }
  }

  return (
    <div className="pt-6 animate-fadeIn">
      {/* Hero highlight card */}
      <ResultRow
        label={heroLabel}
        value={heroValue}
        rawValue={heroRawValue}
        currencySymbol={currencySymbol}
        isHero
      />

      {/* Grid of details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ResultRow
          label="Base Price"
          value={formattedOriginal}
          rawValue={originalAmount}
          currencySymbol={currencySymbol}
        />
        <ResultRow
          label={`Tax Portion (${taxRate}%)`}
          value={formattedTax}
          rawValue={taxAmount}
          currencySymbol={currencySymbol}
        />
        <ResultRow
          label="Total Price"
          value={formattedFinal}
          rawValue={finalAmount}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Quick summary line */}
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed bg-gray-50 dark:bg-gray-800/20 py-2.5 px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700/60">
        Calculation summary: A base amount of <strong>{formattedOriginal}</strong> with a tax rate of{" "}
        <strong>{taxRate}%</strong> results in a tax portion of <strong>{formattedTax}</strong>, making the
        total <strong>{formattedFinal}</strong>.
      </p>
    </div>
  );
}
