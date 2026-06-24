"use client";
import React, { useState } from "react";
import { formatCurrency } from "./VatResultCard";

export default function ShareActions({
  mode,
  currencyCode,
  currencySymbol,
  decimals,
  useSeparator,
  originalAmount,
  taxRate,
  taxAmount,
  finalAmount,
  countryName,
  reverseCalc,
}) {
  const [copied, setCopied] = useState(false);

  const getReportText = () => {
    let modeStr = "Add Tax";
    if (mode === "remove") modeStr = "Remove Tax";
    else if (mode === "only") modeStr = "Tax Amount Only";

    if (reverseCalc && mode !== "only") {
      modeStr += " (Reverse)";
    }

    const fmt = (val) => formatCurrency(val, currencySymbol, decimals, useSeparator);

    return `VAT / GST Calculation Report (Toolstrek)
----------------------------------------
Country Preset    : ${countryName}
Calculation Mode  : ${modeStr}
Currency          : ${currencyCode} (${currencySymbol})
Base Price        : ${fmt(originalAmount)}
VAT / GST Rate    : ${taxRate}%
Tax Portion       : ${fmt(taxAmount)}
Total Price       : ${fmt(finalAmount)}
----------------------------------------
Calculate instantly at: https://toolstrek.vercel.app/tools/vat-gst-calculator`;
  };

  const handleCopy = () => {
    const text = getReportText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = getReportText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "VAT / GST Calculation Report",
          text: text,
          url: "https://toolstrek.vercel.app/tools/vat-gst-calculator",
        });
      } catch (err) {
        // Fallback to copy if sharing was cancelled or failed
        handleCopy();
      }
    } else {
      // Fallback
      handleCopy();
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Copy Results Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-sm flex items-center gap-2 cursor-pointer focus:outline-none"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Results Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy Results
          </>
        )}
      </button>

      {/* Print Report Button */}
      <button
        type="button"
        onClick={handlePrint}
        className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-sm flex items-center gap-2 cursor-pointer focus:outline-none"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        Print Report
      </button>

      {/* Share Results Button */}
      <button
        type="button"
        onClick={handleShare}
        className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-sm flex items-center gap-2 cursor-pointer focus:outline-none"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 10.742l4.636-2.318m0 4.152l-4.636-2.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-2-4a2 2 0 11-4 0 2 2 0 014 0zM7 16a2 2 0 11-4 0 2 2 0 014 0zm12 0a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Share Results
      </button>
    </div>
  );
}
