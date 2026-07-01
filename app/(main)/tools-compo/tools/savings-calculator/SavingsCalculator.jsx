"use client";
import React, { useState, useMemo } from "react";
import ToolPageShell from "../../ToolPageShell";
import SavingsAdvancedOptions from "./SavingsAdvancedOptions";
import SavingsResultCard from "./SavingsResultCard";
import { CURRENCIES } from "./SavingsAdvancedOptions";

export default function SavingsCalculator() {
  // Core states
  const [initialDeposit, setInitialDeposit] = useState("10000");
  const [contribution, setContribution] = useState("500");
  const [contributionFrequency, setContributionFrequency] = useState(12); // 12 = monthly, 1 = annually, 52 = weekly, 26 = bi-weekly
  const [interestRate, setInterestRate] = useState("6");
  const [years, setYears] = useState("10");

  // Advanced States
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("BDT");
  const [compoundFrequency, setCompoundFrequency] = useState(12); // 12 = monthly
  const [contributionTiming, setContributionTiming] = useState("beginning");
  const [taxRate, setTaxRate] = useState(0);
  const [inflationRate, setInflationRate] = useState(0);
  const [annualIncrease, setAnnualIncrease] = useState(0);

  // Sync currency symbol
  const selectedCurrency = useMemo(() => {
    return CURRENCIES.find((c) => c.code === selectedCurrencyCode) || CURRENCIES[0];
  }, [selectedCurrencyCode]);

  // Calculations
  const simulation = useMemo(() => {
    const principal = parseFloat(initialDeposit) || 0;
    const initialContrib = parseFloat(contribution) || 0;
    const rate = parseFloat(interestRate) || 0;
    const termYears = parseInt(years, 10) || 1;

    let balance = principal;
    let totalContributions = 0;
    let totalInterestGross = 0;
    let totalTaxPaid = 0;
    let currentContribution = initialContrib;

    const yearlyData = [];

    // Monthly compounding interest rate equivalent
    // interestFactorPerMonth = (1 + r / compoundFrequency) ^ (compoundFrequency / 12) - 1
    const r = rate / 100;
    const m = compoundFrequency;
    const i_month = Math.pow(1 + r / m, m / 12) - 1;

    for (let year = 1; year <= termYears; year++) {
      // Step-up increase starting in year 2
      if (year > 1 && annualIncrease > 0) {
        currentContribution = currentContribution * (1 + annualIncrease / 100);
      }

      for (let month = 1; month <= 12; month++) {
        // Calculate contribution for the month
        let monthlyContrib = 0;
        if (contributionFrequency === 12) {
          monthlyContrib = currentContribution;
        } else if (contributionFrequency === 52) {
          monthlyContrib = (currentContribution * 52) / 12;
        } else if (contributionFrequency === 26) {
          monthlyContrib = (currentContribution * 26) / 12;
        } else if (contributionFrequency === 1) {
          if (month === 12) {
            monthlyContrib = currentContribution;
          }
        }

        // Timing: Beginning of period
        if (contributionTiming === "beginning" && monthlyContrib > 0) {
          balance += monthlyContrib;
          totalContributions += monthlyContrib;
        }

        // Compound interest calculation
        const interestEarned = balance * i_month;
        const taxDeducted = interestEarned * (taxRate / 100);
        const netInterest = interestEarned - taxDeducted;

        balance += netInterest;
        totalInterestGross += interestEarned;
        totalTaxPaid += taxDeducted;

        // Timing: End of period
        if (contributionTiming === "end" && monthlyContrib > 0) {
          balance += monthlyContrib;
          totalContributions += monthlyContrib;
        }
      }

      // Inflation adjustment
      const realBalance = balance / Math.pow(1 + inflationRate / 100, year);

      yearlyData.push({
        year,
        balance,
        realBalance,
        totalContributions, // Excludes initial deposit
        interestAccumulated: balance - (principal + totalContributions),
        taxAccumulated: totalTaxPaid,
      });
    }

    const finalBalance = balance;
    const totalInterestNet = finalBalance - (principal + totalContributions);

    return {
      calculations: {
        finalBalance,
        totalContributions,
        totalInterestGross,
        totalInterestNet,
        totalTaxPaid,
        realBalance: finalBalance / Math.pow(1 + inflationRate / 100, termYears),
      },
      yearlyData,
    };
  }, [
    initialDeposit,
    contribution,
    contributionFrequency,
    interestRate,
    years,
    compoundFrequency,
    contributionTiming,
    taxRate,
    inflationRate,
    annualIncrease,
  ]);

  const handleReset = () => {
    setInitialDeposit("10000");
    setContribution("500");
    setContributionFrequency(12);
    setInterestRate("6");
    setYears("10");

    setSelectedCurrencyCode("BDT");
    setCompoundFrequency(12);
    setContributionTiming("beginning");
    setTaxRate(0);
    setInflationRate(0);
    setAnnualIncrease(0);
  };

  const hasInputs = parseFloat(initialDeposit) > 0 || parseFloat(contribution) > 0;

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="font-sans">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
          
          {/* ── Header Banner ── */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-8 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Savings Calculator
                </h1>
                <p className="text-violet-200 mt-1 text-base">
                  Model compound interest, tax impact, inflation adjustments, and track your long-term wealth projection.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* ── Main Form Inputs ── */}
            <div className="grid sm:grid-cols-2 gap-6">
              
              {/* Initial Deposit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Initial Deposit ({selectedCurrency.symbol})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                    {selectedCurrency.symbol}
                  </div>
                  <input
                    type="number"
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 dark:border-gray-655 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 bg-white dark:bg-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200 outline-none shadow-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-550"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Regular Contribution */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Regular Deposit ({selectedCurrency.symbol})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                    {selectedCurrency.symbol}
                  </div>
                  <input
                    type="number"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 dark:border-gray-655 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 bg-white dark:bg-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200 outline-none shadow-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-550"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Contribution Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Deposit Frequency
                </label>
                <select
                  value={contributionFrequency}
                  onChange={(e) => setContributionFrequency(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-655 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-200 outline-none hover:border-gray-300 dark:hover:border-gray-550 cursor-pointer"
                >
                  <option value={12}>Monthly</option>
                  <option value={52}>Weekly</option>
                  <option value={26}>Bi-Weekly</option>
                  <option value={1}>Annually</option>
                </select>
              </div>

              {/* APY Interest Rate */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Annual APY (Interest Rate)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full pr-8 pl-4 py-2.5 border border-gray-200 dark:border-gray-655 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 bg-white dark:bg-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200 outline-none shadow-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-550"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                    %
                  </div>
                </div>
              </div>

              {/* Savings Duration */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Savings Duration (Years)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="w-full pr-14 pl-4 py-2.5 border border-gray-200 dark:border-gray-655 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 bg-white dark:bg-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200 outline-none shadow-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-550"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400 font-semibold text-xs">
                    Years
                  </div>
                </div>
              </div>

            </div>

            {/* ── Advanced Options Accordion Panel ── */}
            <SavingsAdvancedOptions
              selectedCurrencyCode={selectedCurrencyCode}
              onCurrencyChange={(c) => setSelectedCurrencyCode(c.code)}
              compoundFrequency={compoundFrequency}
              onCompoundFrequencyChange={setCompoundFrequency}
              contributionTiming={contributionTiming}
              onContributionTimingChange={setContributionTiming}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              inflationRate={inflationRate}
              onInflationRateChange={setInflationRate}
              annualIncrease={annualIncrease}
              onAnnualIncreaseChange={setAnnualIncrease}
            />

            {/* ── Reset Trigger Button ── */}
            <div className="flex flex-wrap gap-3 border-t border-gray-150 dark:border-gray-700 pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-55 dark:hover:bg-gray-700 transition-all duration-200 text-sm cursor-pointer"
              >
                Reset Calculator
              </button>
            </div>

            {/* ── Results block ── */}
            {hasInputs ? (
              <div className="border-t border-gray-150 dark:border-gray-700 pt-6">
                <SavingsResultCard
                  initialDeposit={parseFloat(initialDeposit) || 0}
                  monthlyContribution={parseFloat(contribution) || 0}
                  contributionFrequency={contributionFrequency}
                  interestRate={parseFloat(interestRate) || 0}
                  years={parseInt(years, 10) || 1}
                  currencySymbol={selectedCurrency.symbol}
                  currencyCode={selectedCurrency.code}
                  compoundFrequency={compoundFrequency}
                  contributionTiming={contributionTiming}
                  taxRate={taxRate}
                  inflationRate={inflationRate}
                  annualIncrease={annualIncrease}
                  calculations={simulation.calculations}
                  yearlyData={simulation.yearlyData}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-55/30 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700/60">
                <div className="text-5xl mb-4">🐷</div>
                <p className="text-base font-medium">Enter an initial deposit or regular contribution to see your projections.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
