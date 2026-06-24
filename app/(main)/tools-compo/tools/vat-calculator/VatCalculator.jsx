"use client";
import React, { useState, useMemo, useEffect } from "react";
import ToolPageShell from "../../ToolPageShell";
import CountrySelector, { COUNTRIES } from "./CountrySelector";
import VatInputForm from "./VatInputForm";
import AdvancedOptions, { CURRENCIES } from "./AdvancedOptions";
import VatResultCard from "./VatResultCard";
import PdfExportButton from "./PdfExportButton";
import ShareActions from "./ShareActions";

export default function VatCalculator() {
  // Main states
  const [mode, setMode] = useState("add"); // "add" | "remove" | "only"
  const [amount, setAmount] = useState("1000");
  const [taxRate, setTaxRate] = useState(15);
  const [selectedCountryCode, setSelectedCountryCode] = useState("BD");
  
  // Customization trackers
  const [isRateCustomized, setIsRateCustomized] = useState(false);

  // Advanced States
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("BDT");
  const [decimals, setDecimals] = useState(2);
  const [useSeparator, setUseSeparator] = useState(true);
  const [reverseCalc, setReverseCalc] = useState(false);

  // Sync currency automatically if country preset matches
  const countryToCurrencyMap = {
    BD: "BDT",
    IN: "INR",
    GB: "GBP",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    CA: "CAD",
    AU: "AUD",
    NZ: "NZD", // will map to NZD if in list, otherwise fallback. Let's see: CURRENCIES has USD, EUR, GBP, BDT, INR, AUD, CAD, SGD, AED, SAR, JPY.
    // If not in currencies, we fallback to USD. Let's map NZ -> AUD or USD. Let's map to USD for others, or AUD for NZ.
    NZ: "AUD", 
    UAE: "AED",
    AE: "AED",
    SA: "SAR",
    SG: "SGD",
    ZA: "USD", // fallback
    JP: "JPY",
    PK: "INR", // fallback
    US: "USD",
  };

  // Find country name
  const countryName = useMemo(() => {
    const found = COUNTRIES.find((c) => c.code === selectedCountryCode);
    return found ? found.name : "Custom";
  }, [selectedCountryCode]);

  // Find selected currency symbol
  const selectedCurrency = useMemo(() => {
    return CURRENCIES.find((c) => c.code === selectedCurrencyCode) || CURRENCIES[0];
  }, [selectedCurrencyCode]);

  // Handle country selection
  const handleSelectCountry = (country) => {
    setSelectedCountryCode(country.code);
    setTaxRate(country.rate);
    setIsRateCustomized(false);
    
    // Auto sync currency code if mapped
    const mappedCurrency = countryToCurrencyMap[country.code];
    if (mappedCurrency && CURRENCIES.some((c) => c.code === mappedCurrency)) {
      setSelectedCurrencyCode(mappedCurrency);
    }
  };

  // Handle rate customization
  const handleTaxRateChange = (rate) => {
    setTaxRate(rate);
    setIsRateCustomized(true);
  };

  // Quick preset application
  const handleApplyPreset = (presetRate) => {
    setTaxRate(presetRate);
    setIsRateCustomized(true);
  };

  // Mode swapping
  const handleSwapMode = () => {
    if (mode === "add") {
      setMode("remove");
    } else if (mode === "remove") {
      setMode("add");
    }
  };

  // Reset functionality
  const handleReset = () => {
    setMode("add");
    setAmount("1000");
    
    // Reset to Bangladesh default
    setSelectedCountryCode("BD");
    setTaxRate(15);
    setIsRateCustomized(false);
    setSelectedCurrencyCode("BDT");
    
    setDecimals(2);
    setUseSeparator(true);
    setReverseCalc(false);
  };

  // Calculations
  const calculations = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const rate = parseFloat(taxRate) || 0;

    let original = 0;
    let tax = 0;
    let final = 0;

    if (mode === "add") {
      if (reverseCalc) {
        // Reverse Add: Treat input amount as Final Price
        final = amt;
        original = final / (1 + rate / 100);
        tax = final - original;
      } else {
        // Normal Add: Treat input amount as Base Price
        original = amt;
        tax = original * (rate / 100);
        final = original + tax;
      }
    } else if (mode === "remove") {
      if (reverseCalc) {
        // Reverse Remove: Treat input amount as Base Price
        original = amt;
        tax = original * (rate / 100);
        final = original + tax;
      } else {
        // Normal Remove: Treat input amount as Final Price
        final = amt;
        original = final / (1 + rate / 100);
        tax = final - original;
      }
    } else if (mode === "only") {
      // Tax Amount Only: Treat amount as base price and compute tax component
      original = amt;
      tax = amt * (rate / 100);
      final = amt + tax;
    }

    return {
      originalAmount: original,
      taxAmount: tax,
      finalAmount: final,
    };
  }, [mode, amount, taxRate, reverseCalc]);

  const hasResult = parseFloat(amount) > 0;

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="font-sans">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
          
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-8 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a1 1 0 001-1V6a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  VAT / GST Calculator
                </h1>
                <p className="text-violet-200 mt-1 text-base">
                  Calculate VAT, GST, Sales Tax, and Tax-Inclusive Prices instantly for users worldwide.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* ── Country Preset dropdown ── */}
            <div className="pb-2">
              <CountrySelector
                selectedCountryCode={selectedCountryCode}
                onSelectCountry={handleSelectCountry}
              />
            </div>

            {/* ── Mode Selection Tabs ── */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "add", label: "➕ Add Tax" },
                  { id: "remove", label: "➖ Remove Tax" },
                  { id: "only", label: "🎯 Tax Amount Only" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMode(tab.id)}
                    className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 -mb-px ${
                      mode === tab.id
                        ? "border-violet-600 text-violet-700 dark:text-violet-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Inputs ── */}
            <VatInputForm
              amount={amount}
              onAmountChange={setAmount}
              taxRate={taxRate}
              onTaxRateChange={handleTaxRateChange}
              mode={mode}
              onSwapMode={handleSwapMode}
              currencySymbol={selectedCurrency.symbol}
              isRateCustomized={isRateCustomized}
            />

            {/* ── Advanced Options Accordion ── */}
            <AdvancedOptions
              selectedCurrencyCode={selectedCurrencyCode}
              onCurrencyChange={(c) => setSelectedCurrencyCode(c.code)}
              decimals={decimals}
              onDecimalsChange={setDecimals}
              useSeparator={useSeparator}
              onSeparatorToggle={() => setUseSeparator(!useSeparator)}
              onApplyPreset={handleApplyPreset}
              reverseCalc={reverseCalc}
              onReverseCalcToggle={() => setReverseCalc(!reverseCalc)}
              mode={mode}
            />

            {/* ── Action Buttons (Reset) ── */}
            <div className="flex flex-wrap gap-3 border-t border-gray-100 dark:border-gray-700 pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm cursor-pointer"
              >
                Reset Calculator
              </button>
            </div>

            {/* ── Results block ── */}
            {hasResult ? (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-6">
                <VatResultCard
                  mode={mode}
                  currencySymbol={selectedCurrency.symbol}
                  decimals={decimals}
                  useSeparator={useSeparator}
                  originalAmount={calculations.originalAmount}
                  taxRate={taxRate}
                  taxAmount={calculations.taxAmount}
                  finalAmount={calculations.finalAmount}
                  reverseCalc={reverseCalc}
                />

                {/* Export & Sharing Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/60">
                  <ShareActions
                    mode={mode}
                    currencyCode={selectedCurrency.code}
                    currencySymbol={selectedCurrency.symbol}
                    decimals={decimals}
                    useSeparator={useSeparator}
                    originalAmount={calculations.originalAmount}
                    taxRate={taxRate}
                    taxAmount={calculations.taxAmount}
                    finalAmount={calculations.finalAmount}
                    countryName={countryName}
                    reverseCalc={reverseCalc}
                  />

                  <PdfExportButton
                    mode={mode}
                    currencyCode={selectedCurrency.code}
                    currencySymbol={selectedCurrency.symbol}
                    decimals={decimals}
                    useSeparator={useSeparator}
                    originalAmount={calculations.originalAmount}
                    taxRate={taxRate}
                    taxAmount={calculations.taxAmount}
                    finalAmount={calculations.finalAmount}
                    countryName={countryName}
                    reverseCalc={reverseCalc}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700/60">
                <div className="text-5xl mb-4">🧮</div>
                <p className="text-base font-medium">Enter an amount greater than zero to see calculation results.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
