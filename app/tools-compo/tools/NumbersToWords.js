"use client";

import { useState } from "react";

// Utility function to convert numbers to words with Lakh and Crore support
function numberToWords(
  num,
  useIndianSystem = false,
  useLacInsteadOfLakh = false,
  usePaisaInsteadOfPoisha = false,
) {
  if (num === 0) return "zero";

  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  function convertLessThanThousand(n) {
    if (n === 0) return "";

    if (n < 20) {
      return ones[n];
    }

    if (n < 100) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      return tens[ten] + (unit !== 0 ? "-" + ones[unit] : "");
    }

    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    // Remove "and" before the remainder
    if (remainder !== 0) {
      return ones[hundred] + " hundred " + convertLessThanThousand(remainder);
    }
    return ones[hundred] + " hundred";
  }

  // Indian Numbering System (Lakh and Crore)
  if (useIndianSystem) {
    if (num < 100000) {
      // Less than 1 Lakh
      if (num < 1000) {
        return convertLessThanThousand(num);
      }
      const thousand = Math.floor(num / 1000);
      const remainder = num % 1000;
      return (
        convertLessThanThousand(thousand) +
        " thousand" +
        (remainder !== 0 ? " " + convertLessThanThousand(remainder) : "")
      );
    }

    const crore = Math.floor(num / 10000000);
    const remainderAfterCrore = num % 10000000;
    const lakh = Math.floor(remainderAfterCrore / 100000);
    const remainderAfterLakh = remainderAfterCrore % 100000;
    const thousand = Math.floor(remainderAfterLakh / 1000);
    const remainder = remainderAfterLakh % 1000;

    let result = "";

    if (crore > 0) {
      result += convertLessThanThousand(crore) + " crore";
      if (lakh > 0 || thousand > 0 || remainder > 0) result += " ";
    }

    if (lakh > 0) {
      // Use "Lac" or "Lakh" based on user preference
      const lakhTerm = useLacInsteadOfLakh ? "lac" : "lakh";
      result += convertLessThanThousand(lakh) + " " + lakhTerm;
      if (thousand > 0 || remainder > 0) result += " ";
    }

    if (thousand > 0) {
      result += convertLessThanThousand(thousand) + " thousand";
      if (remainder > 0) result += " ";
    }

    if (remainder > 0) {
      result += convertLessThanThousand(remainder);
    }

    return result;
  }

  // Western Numbering System
  if (num < 1000) {
    return convertLessThanThousand(num);
  }

  const million = Math.floor(num / 1000000);
  const remainderMillion = num % 1000000;
  const thousand = Math.floor(remainderMillion / 1000);
  const remainderThousand = remainderMillion % 1000;

  let result = "";

  if (million > 0) {
    result += convertLessThanThousand(million) + " million";
    if (thousand > 0 || remainderThousand > 0) result += " ";
  }

  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + " thousand";
    if (remainderThousand > 0) result += " ";
  }

  if (remainderThousand > 0) {
    result += convertLessThanThousand(remainderThousand);
  }

  return result;
}

// Utility function to convert numbers to currency words
function numberToCurrencyWords(
  num,
  currencyCode,
  useIndianSystem = false,
  useLacInsteadOfLakh = false,
  usePaisaInsteadOfPoisha = false,
  endingText = "only",
  customText = "",
) {
  const mainUnit = Math.floor(num);
  const fractionalUnit = Math.round((num - mainUnit) * 100);

  const mainUnitWords =
    mainUnit === 0
      ? "zero"
      : numberToWords(mainUnit, useIndianSystem, useLacInsteadOfLakh);
  const mainUnitName =
    mainUnit === 1
      ? getCurrencyUnit(currencyCode, "singular")
      : getCurrencyUnit(currencyCode, "plural");

  let result = `${mainUnitWords} ${mainUnitName}`;

  if (fractionalUnit > 0) {
    const fractionalWords = numberToWords(
      fractionalUnit,
      useIndianSystem,
      useLacInsteadOfLakh,
    );
    const fractionalUnitName =
      fractionalUnit === 1
        ? getCentUnit(currencyCode, "singular", usePaisaInsteadOfPoisha)
        : getCentUnit(currencyCode, "plural", usePaisaInsteadOfPoisha);
    result += ` and ${fractionalWords} ${fractionalUnitName}`;
  }

  // Add ending text based on selection
  if (endingText === "only") {
    result += " only";
  } else if (endingText === "exactly") {
    result += " exactly";
  } else if (endingText === "custom" && customText.trim()) {
    result += ` ${customText.trim()}`;
  }

  return result;
}

// Helper functions for currency units
function getCurrencyUnit(currencyCode, form) {
  const units = {
    USD: { singular: "dollar", plural: "dollars" },
    EUR: { singular: "euro", plural: "euros" },
    GBP: { singular: "pound", plural: "pounds" },
    JPY: { singular: "yen", plural: "yen" },
    INR: { singular: "rupee", plural: "rupees" },
    BDT: { singular: "taka", plural: "taka" },
    CAD: { singular: "dollar", plural: "dollars" },
    AUD: { singular: "dollar", plural: "dollars" },
    CHF: { singular: "franc", plural: "francs" },
    CNY: { singular: "yuan", plural: "yuan" },
    RUB: { singular: "ruble", plural: "rubles" },
  };

  return units[currencyCode]?.[form] || units.USD[form];
}

function getCentUnit(currencyCode, form, usePaisaInsteadOfPoisha = false) {
  const cents = {
    USD: { singular: "cent", plural: "cents" },
    EUR: { singular: "cent", plural: "cents" },
    GBP: { singular: "penny", plural: "pence" },
    JPY: { singular: "sen", plural: "sen" },
    INR: { singular: "paisa", plural: "paise" },
    BDT: {
      singular: usePaisaInsteadOfPoisha ? "paisa" : "poisha",
      plural: usePaisaInsteadOfPoisha ? "paisa" : "poisha",
    },
    CAD: { singular: "cent", plural: "cents" },
    AUD: { singular: "cent", plural: "cents" },
    CHF: { singular: "rappen", plural: "rappen" },
    CNY: { singular: "fen", plural: "fen" },
    RUB: { singular: "kopek", plural: "kopeks" },
  };

  return cents[currencyCode]?.[form] || cents.USD[form];
}

// Apply letter case transformation
function applyLetterCase(text, letterCase) {
  switch (letterCase) {
    case "lowercase":
      return text.toLowerCase();
    case "uppercase":
      return text.toUpperCase();
    case "titlecase":
      return text.replace(/\b\w/g, (char) => char.toUpperCase());
    default:
      return text;
  }
}

// Toast Component
function Toast({ message, show }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2 duration-300">
      {message}
    </div>
  );
}

export default function NumbersToWords() {
  const [state, setState] = useState({
    inputNumber: "",
    outputWords: [],
    currency: "BDT",
    letterCase: "titlecase",
    numberingSystem: "indian",
    lakhSpelling: "lac",
    paisaSpelling: "paisa",
    endingText: "only",
    customEndingText: "",
    numberOfResults: 1,
    isAdvancedOpen: false,
  });

  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  };

  const generateMultipleResults = (num, count) => {
    const results = [];
    const useIndianSystem = state.numberingSystem === "indian";
    const useLacInsteadOfLakh = state.lakhSpelling === "lac";
    const usePaisaInsteadOfPoisha = state.paisaSpelling === "paisa";

    for (let i = 0; i < count; i++) {
      let customEnding = state.customEndingText;

      // For multiple results, add variation number if custom text exists
      if (state.endingText === "custom" && customEnding && count > 1) {
        customEnding = `${customEnding} (${i + 1})`;
      }

      let words;
      if (state.currency === "none") {
        words = numberToWords(num, useIndianSystem, useLacInsteadOfLakh);
        if (state.endingText === "only") {
          words += " only";
        } else if (state.endingText === "exactly") {
          words += " exactly";
        } else if (state.endingText === "custom" && customEnding.trim()) {
          words += ` ${customEnding.trim()}`;
        }
      } else {
        words = numberToCurrencyWords(
          num,
          state.currency,
          useIndianSystem,
          useLacInsteadOfLakh,
          usePaisaInsteadOfPoisha,
          state.endingText,
          customEnding,
        );
      }

      const formattedWords = applyLetterCase(words, state.letterCase);
      results.push(formattedWords);
    }

    return results;
  };

  const handleCalculate = () => {
    const num = parseFloat(state.inputNumber);

    if (isNaN(num)) {
      setState((prev) => ({
        ...prev,
        outputWords: ["Please enter a valid number"],
      }));
      return;
    }

    if (num < 0) {
      setState((prev) => ({
        ...prev,
        outputWords: ["Please enter a positive number"],
      }));
      return;
    }

    if (num > 999999999) {
      setState((prev) => ({
        ...prev,
        outputWords: ["Number too large (max 999,999,999)"],
      }));
      return;
    }

    const results = generateMultipleResults(num, state.numberOfResults);
    setState((prev) => ({ ...prev, outputWords: results }));
  };

  const handleReset = () => {
    setState({
      inputNumber: "",
      outputWords: [],
      currency: "BDT",
      letterCase: "titlecase",
      numberingSystem: "indian",
      lakhSpelling: "lac",
      paisaSpelling: "paisa",
      endingText: "only",
      customEndingText: "",
      numberOfResults: 1,
      isAdvancedOpen: false,
    });
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    // Remove any non-numeric characters except decimal point and minus sign
    // This allows pasting from Excel which might include commas, spaces, etc.
    let cleanedValue = value.replace(/[^0-9.-]/g, "");

    // Handle multiple decimal points - keep only first one
    const parts = cleanedValue.split(".");
    if (parts.length > 2) {
      cleanedValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Allow empty or valid number pattern
    if (cleanedValue === "" || /^-?\d*\.?\d*$/.test(cleanedValue)) {
      setState((prev) => ({ ...prev, inputNumber: cleanedValue }));
    }
  };

  const handlePaste = (e) => {
    // Get pasted text
    const pastedText = e.clipboardData.getData("text");

    // Clean the pasted text: remove commas, spaces, and extract number
    let cleanedValue = pastedText.replace(/[^0-9.-]/g, "");

    // Handle multiple decimal points - keep only first one
    const parts = cleanedValue.split(".");
    if (parts.length > 2) {
      cleanedValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Update the input value
    if (cleanedValue === "" || /^-?\d*\.?\d*$/.test(cleanedValue)) {
      e.preventDefault();
      setState((prev) => ({ ...prev, inputNumber: cleanedValue }));
    }
  };

  const handleCurrencyChange = (e) => {
    setState((prev) => ({ ...prev, currency: e.target.value }));
  };

  const handleLetterCaseChange = (e) => {
    setState((prev) => ({ ...prev, letterCase: e.target.value }));
  };

  const handleNumberingSystemChange = (e) => {
    setState((prev) => ({ ...prev, numberingSystem: e.target.value }));
  };

  const handleLakhSpellingChange = (e) => {
    setState((prev) => ({ ...prev, lakhSpelling: e.target.value }));
  };

  const handlePaisaSpellingChange = (e) => {
    setState((prev) => ({ ...prev, paisaSpelling: e.target.value }));
  };

  const handleEndingTextChange = (e) => {
    setState((prev) => ({ ...prev, endingText: e.target.value }));
  };

  const handleCustomEndingChange = (e) => {
    setState((prev) => ({ ...prev, customEndingText: e.target.value }));
  };

  const handleNumberOfResultsChange = (e) => {
    const value = Math.min(3, Math.max(1, parseInt(e.target.value) || 1));
    setState((prev) => ({ ...prev, numberOfResults: value }));
  };

  const toggleAdvancedOptions = () => {
    setState((prev) => ({ ...prev, isAdvancedOpen: !prev.isAdvancedOpen }));
  };

  // Check if BDT is selected
  const isBDTSelected = state.currency === "BDT";

  return (
    <div className="max-w-6xl mx-auto px-2 pb-10 pt-26">
      <Toast show={toast.show} message={toast.message} />

      {/* Page Header with Information */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Numbers to Words Converter
        </h1>
        <p className="text-gray-600 mb-4">
          Convert any number to words in multiple currencies and numbering
          systems
        </p>
      </div>

      {/* Two Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b border-gray-200 pb-2">
            Input Settings
          </h2>

          <div className="space-y-5">
            {/* Number Input */}
            <div>
              <label
                htmlFor="number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Number
              </label>
              <input
                id="number"
                type="text"
                value={state.inputNumber}
                onChange={handleInputChange}
                onPaste={handlePaste}
                placeholder="Enter a number (e.g., 2345.78)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: 2345.78 will convert to "Two Thousand Three Hundred
                Forty-Five Taka And Seventy-Eight Paisa Only"
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ✓ Supports pasting from Excel, Google Sheets, and other sources
                (automatically removes commas and spaces)
              </p>
            </div>

            {/* Currency Selection */}
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Currency
              </label>
              <select
                id="currency"
                value={state.currency}
                onChange={handleCurrencyChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
              >
                <option value="BDT">🇧🇩 BDT - Bangladeshi Taka</option>
                <option value="none">None (Just Number)</option>
                <option value="USD">🇺🇸 USD - US Dollar</option>
                <option value="EUR">🇪🇺 EUR - Euro</option>
                <option value="GBP">🇬🇧 GBP - British Pound</option>
                <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                <option value="INR">🇮🇳 INR - Indian Rupee</option>
                <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                <option value="CHF">🇨🇭 CHF - Swiss Franc</option>
                <option value="CNY">🇨🇳 CNY - Chinese Yuan</option>
                <option value="RUB">🇷🇺 RUB - Russian Ruble</option>
              </select>
            </div>

            {/* Advanced Options Accordion - Always visible */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={toggleAdvancedOptions}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center text-left font-medium text-gray-700"
              >
                <span>⚙️ Advanced Options</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${state.isAdvancedOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {state.isAdvancedOpen && (
                <div className="p-4 bg-white space-y-4 animate-in slide-in-from-top-2 duration-200">
                  {/* Numbering System - Always visible */}
                  <div>
                    <label
                      htmlFor="numberingSystem"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Numbering System
                    </label>
                    <select
                      id="numberingSystem"
                      value={state.numberingSystem}
                      onChange={handleNumberingSystemChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
                    >
                      <option value="indian">
                        Bangladeshi/Indian (Crore, Lac)
                      </option>
                      <option value="western">
                        Western (Million, Thousand)
                      </option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {state.numberingSystem === "indian"
                        ? "1 Crore = 10,000,000 | 1 Lac = 100,000"
                        : "1 Million = 10 Lac | 1 Thousand = 1000"}
                    </p>
                  </div>

                  {/* Letter Case Selection */}
                  <div>
                    <label
                      htmlFor="letterCase"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Letter Case
                    </label>
                    <select
                      id="letterCase"
                      value={state.letterCase}
                      onChange={handleLetterCaseChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
                    >
                      <option value="titlecase">Title Case</option>
                      <option value="lowercase">lowercase</option>
                      <option value="uppercase">UPPERCASE</option>
                    </select>
                  </div>

                  {/* Ending Text Selection */}
                  <div>
                    <label
                      htmlFor="endingText"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Ending Text
                    </label>
                    <select
                      id="endingText"
                      value={state.endingText}
                      onChange={handleEndingTextChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
                    >
                      <option value="only">Only</option>
                      <option value="exactly">Exactly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {/* Custom Ending Text Input - Shows only when 'custom' is selected */}
                  {state.endingText === "custom" && (
                    <div className="animate-in fade-in duration-200">
                      <label
                        htmlFor="customText"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Custom Ending Text
                      </label>
                      <input
                        id="customText"
                        type="text"
                        value={state.customEndingText}
                        onChange={handleCustomEndingChange}
                        placeholder="e.g., only, exactly, payable, received, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter custom text to append at the end
                      </p>
                    </div>
                  )}

                  {/* Number of Results - Always visible */}
                  <div>
                    <label
                      htmlFor="numberOfResults"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Number of Results (1-3)
                    </label>
                    <input
                      id="numberOfResults"
                      type="number"
                      min="1"
                      max="3"
                      value={state.numberOfResults}
                      onChange={handleNumberOfResultsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Generate up to 3 different formatted results
                    </p>
                  </div>

                  {/* BDT Specific Options - Only show when BDT is selected */}
                  {isBDTSelected && (
                    <>
                      {/* Lakh Spelling Preference */}
                      <div>
                        <label
                          htmlFor="lakhSpelling"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Lakh Spelling Preference
                        </label>
                        <select
                          id="lakhSpelling"
                          value={state.lakhSpelling}
                          onChange={handleLakhSpellingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
                        >
                          <option value="lac">Lac (Default)</option>
                          <option value="lakh">Lakh (Alternative)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Choose between "Lac" or "Lakh" spelling
                        </p>
                      </div>

                      {/* Paisa Spelling Preference */}
                      <div>
                        <label
                          htmlFor="paisaSpelling"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Paisa/Poisha Spelling Preference
                        </label>
                        <select
                          id="paisaSpelling"
                          value={state.paisaSpelling}
                          onChange={handlePaisaSpellingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
                        >
                          <option value="paisa">Paisa (Default)</option>
                          <option value="poisha">Poisha (Alternative)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Choose between "Paisa" or "Poisha" spelling
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCalculate}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-semibold"
              >
                Calculate
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Result Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col justify-start h-fit md:sticky top-20">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b border-gray-200 pb-2">
            Converted Results
          </h2>

          <div className="flex-1 flex flex-col justify-start items-center">
            {state.outputWords.length > 0 &&
            state.outputWords[0] !== "Please enter a valid number" &&
            state.outputWords[0] !== "Please enter a positive number" &&
            state.outputWords[0] !== "Number too large (max 999,999,999)" ? (
              <div className="w-full space-y-4">
                {state.outputWords.map((result, index) => (
                  <div
                    key={index}
                    className="bg-blue-700 rounded-lg p-4 border border-blue-800 relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-semibold text-white opacity-80">
                        Result {index + 1}
                      </p>
                      <button
                        onClick={() => copyToClipboard(result)}
                        className="text-white transition-colors bg-blue-800 p-1 rounded-full cursor-pointer"
                        title="Copy to clipboard"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="text-white font-medium leading-relaxed break-words">
                      {result}
                    </div>
                  </div>
                ))}

                {/* Additional Info */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-4">
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-semibold">Input Number:</span>{" "}
                      {state.inputNumber}
                    </p>
                    <p>
                      <span className="font-semibold">Currency:</span>{" "}
                      {state.currency === "none" ? "None" : state.currency}
                    </p>
                    <p>
                      <span className="font-semibold">Numbering System:</span>{" "}
                      {state.numberingSystem === "indian"
                        ? "Bangladeshi/Indian (Crore, Lac)"
                        : "Western (Million, Thousand)"}
                    </p>
                    <p>
                      <span className="font-semibold">Letter Case:</span>{" "}
                      {state.letterCase}
                    </p>
                    <p>
                      <span className="font-semibold">Ending Text:</span>{" "}
                      {state.endingText === "custom"
                        ? state.customEndingText || "Not set"
                        : state.endingText}
                    </p>
                    <p>
                      <span className="font-semibold">Number of Results:</span>{" "}
                      {state.numberOfResults}
                    </p>
                    {isBDTSelected && (
                      <>
                        <p>
                          <span className="font-semibold">Lakh Spelling:</span>{" "}
                          {state.lakhSpelling === "lac" ? "Lac" : "Lakh"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Paisa/Poisha Spelling:
                          </span>{" "}
                          {state.paisaSpelling === "paisa" ? "Paisa" : "Poisha"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <svg
                  className="w-20 h-20 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg text-gray-500">No results yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Enter a number and click Calculate
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Example: 2345.78 → Two Thousand Three Hundred Forty-Five Taka
                  And Seventy-Eight Paisa Only
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
        <p>
          🇧🇩 Supports Bangladeshi Taka (BDT) with Crore and Lac numbering system
        </p>
        <p className="text-xs mt-1">
          1 Crore = 10,000,000 | 1 Lac = 100,000 | 1 Thousand = 1,000
        </p>
        <p className="text-xs mt-2 text-gray-400">
          Note: Numbers are converted without the word "and" between hundred and
          tens (e.g., "Three Hundred Forty-Five" instead of "Three Hundred And
          Forty-Five")
        </p>
      </div>
    </div>
  );
}
