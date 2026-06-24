"use client";
import React from "react";

export default function VatInputForm({
  amount,
  onAmountChange,
  taxRate,
  onTaxRateChange,
  mode,
  onSwapMode,
  currencySymbol,
  isRateCustomized,
}) {
  const handleAmountChange = (val) => {
    // Prevent negative numbers
    if (val === "" || parseFloat(val) >= 0) {
      onAmountChange(val);
    }
  };

  const handleRateChange = (val) => {
    // Prevent negative numbers
    if (val === "" || parseFloat(val) >= 0) {
      onTaxRateChange(val);
    }
  };

  let amountLabel = "Amount";
  let rateLabel = "VAT / GST Rate";
  let amountPlaceholder = "e.g. 1000";

  if (mode === "add") {
    amountLabel = "Amount (Tax Exclusive)";
    amountPlaceholder = "Enter base price (e.g. 1000)";
  } else if (mode === "remove") {
    amountLabel = "Amount (Tax Inclusive)";
    amountPlaceholder = "Enter final price (e.g. 1150)";
  } else if (mode === "only") {
    amountLabel = "Amount";
    amountPlaceholder = "Enter amount (e.g. 1000)";
    rateLabel = "Tax Rate";
  }

  return (
    <div className="space-y-6">
      {/* Amount Input Field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="vat-amount"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {amountLabel}
          </label>
          {mode !== "only" && (
            <button
              type="button"
              onClick={onSwapMode}
              title="Swap Add / Remove Tax Mode"
              className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors focus:outline-none"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              Swap Mode
            </button>
          )}
        </div>
        <div className="relative">
          <input
            id="vat-amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={amountPlaceholder}
            className="w-full pl-4 pr-14 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent outline-none transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium pointer-events-none">
            {currencySymbol}
          </span>
        </div>
      </div>

      {/* Tax Rate Input Field */}
      <div>
        <label
          htmlFor="vat-rate"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {rateLabel}
        </label>
        <div className="relative">
          <input
            id="vat-rate"
            type="number"
            min="0"
            max="100"
            step="any"
            value={taxRate}
            onChange={(e) => handleRateChange(e.target.value)}
            placeholder="e.g. 15"
            className="w-full pl-4 pr-14 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent outline-none transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium pointer-events-none">
            %
          </span>
        </div>
        {isRateCustomized ? (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Tax rate customized.
          </p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            Default tax rate loaded. You can customize it.
          </p>
        )}
      </div>
    </div>
  );
}
