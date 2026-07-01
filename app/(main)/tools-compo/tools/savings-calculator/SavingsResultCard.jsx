"use client";
import React, { useState, useMemo } from "react";
import SavingsPdfExport from "./SavingsPdfExport";

export default function SavingsResultCard({
  initialDeposit,
  monthlyContribution,
  contributionFrequency,
  interestRate,
  years,
  currencySymbol,
  currencyCode,
  compoundFrequency,
  contributionTiming,
  taxRate,
  inflationRate,
  annualIncrease,
  calculations,
  yearlyData,
}) {
  const [showFullTable, setShowFullTable] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Formatter helper
  const fmt = (val, maxDecimals = 2) => {
    return Number(val).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
    });
  };

  // SVG Chart Dimensions
  const SVG_W = 600;
  const SVG_H = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 65 };
  
  const chartW = SVG_W - padding.left - padding.right;
  const chartH = SVG_H - padding.top - padding.bottom;

  // Chart Calculations
  const chartPoints = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) return [];
    
    // Add year 0 starting point
    const allData = [
      {
        year: 0,
        balance: initialDeposit,
        totalContributions: 0,
        interestAccumulated: 0,
        taxAccumulated: 0,
        realBalance: initialDeposit,
      },
      ...yearlyData,
    ];

    const maxVal = Math.max(...allData.map(d => d.balance), 1);
    const maxYear = allData.length - 1;

    return allData.map((d, index) => {
      const x = padding.left + (d.year / maxYear) * chartW;
      
      // Balance (Nominal) Y Coordinate
      const yBalance = padding.top + chartH - (d.balance / maxVal) * chartH;
      
      // Contributions Y Coordinate
      const totalContr = d.totalContributions + initialDeposit;
      const yContrib = padding.top + chartH - (totalContr / maxVal) * chartH;
      
      // Real Balance Y Coordinate
      const yReal = padding.top + chartH - (d.realBalance / maxVal) * chartH;

      return {
        ...d,
        x,
        yBalance,
        yContrib,
        yReal,
        totalDeposited: totalContr,
      };
    });
  }, [yearlyData, initialDeposit, chartW, chartH, padding.left, padding.top]);

  // Max value for Y labels
  const maxBalance = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) return 0;
    return Math.max(...yearlyData.map(d => d.balance), 1);
  }, [yearlyData]);

  // Generate Y axis grid lines (4 lines)
  const yGridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 4; i++) {
      const pct = i / 4;
      const val = maxBalance * pct;
      const y = padding.top + chartH - pct * chartH;
      lines.push({ y, val });
    }
    return lines;
  }, [maxBalance, chartH, padding.top]);

  // Generate X axis grid lines
  const xGridLines = useMemo(() => {
    if (chartPoints.length === 0) return [];
    const lines = [];
    const count = chartPoints.length;
    const interval = Math.ceil(count / 6); // Up to 6 grid lines
    
    for (let i = 0; i < count; i += interval) {
      lines.push(chartPoints[i]);
    }
    // Always add the last point if it's not already added
    if ((count - 1) % interval !== 0) {
      lines.push(chartPoints[count - 1]);
    }
    return lines;
  }, [chartPoints]);

  // Generate Area Path for Total Balance (Green)
  const balancePath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    let path = `M ${chartPoints[0].x} ${chartPoints[0].yBalance}`;
    for (let i = 1; i < chartPoints.length; i++) {
      path += ` L ${chartPoints[i].x} ${chartPoints[i].yBalance}`;
    }
    path += ` L ${chartPoints[chartPoints.length - 1].x} ${padding.top + chartH}`;
    path += ` L ${chartPoints[0].x} ${padding.top + chartH} Z`;
    return path;
  }, [chartPoints, chartH, padding.top]);

  // Generate Area Path for Total Contributions (Violet)
  const contributionPath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    let path = `M ${chartPoints[0].x} ${chartPoints[0].yContrib}`;
    for (let i = 1; i < chartPoints.length; i++) {
      path += ` L ${chartPoints[i].x} ${chartPoints[i].yContrib}`;
    }
    path += ` L ${chartPoints[chartPoints.length - 1].x} ${padding.top + chartH}`;
    path += ` L ${chartPoints[0].x} ${padding.top + chartH} Z`;
    return path;
  }, [chartPoints, chartH, padding.top]);

  // Line paths
  const balanceLinePath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    return chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yBalance}`).join(" ");
  }, [chartPoints]);

  const contributionLinePath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    return chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yContrib}`).join(" ");
  }, [chartPoints]);

  // Real balance (inflation adjusted) path
  const realBalanceLinePath = useMemo(() => {
    if (chartPoints.length === 0 || inflationRate === 0) return "";
    return chartPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yReal}`).join(" ");
  }, [chartPoints, inflationRate]);

  return (
    <div className="space-y-8">
      
      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Final Balance */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/5 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
              Future Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              {currencySymbol}
            </div>
          </div>
          <h3 className="text-3xl font-black text-emerald-900 dark:text-emerald-350 tracking-tight">
            {currencySymbol}
            {fmt(calculations.finalBalance)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            Nominal savings value after {years} years.
          </p>
        </div>

        {/* Card 2: Contributions vs Interest */}
        <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 dark:from-violet-950/20 dark:to-indigo-950/5 border border-violet-100 dark:border-violet-900/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-violet-850 dark:text-violet-400">
              Total Interest (Net)
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              %
            </div>
          </div>
          <h3 className="text-3xl font-black text-violet-900 dark:text-violet-350 tracking-tight">
            {currencySymbol}
            {fmt(calculations.totalInterestNet)}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            Interest earned, net of {taxRate}% tax.
          </p>
        </div>

        {/* Card 3: Real Value (Adjusted for Inflation) or Total Deposited */}
        <div className="bg-gradient-to-br from-blue-500/10 to-sky-500/5 dark:from-blue-950/20 dark:to-sky-950/5 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm">
          {inflationRate > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-450">
                  Real Value (Inflation Adj.)
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  Real
                </div>
              </div>
              <h3 className="text-3xl font-black text-blue-900 dark:text-blue-350 tracking-tight">
                {currencySymbol}
                {fmt(calculations.realBalance)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                Purchasing power today ({inflationRate}% annual inflation).
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-850 dark:text-blue-400">
                  Total Deposits
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  ↓
                </div>
              </div>
              <h3 className="text-3xl font-black text-blue-900 dark:text-blue-350 tracking-tight">
                {currencySymbol}
                {fmt(calculations.totalContributions + initialDeposit)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                Principal amount invested over time.
              </p>
            </>
          )}
        </div>

      </div>

      {/* Additional Stats Row */}
      {(taxRate > 0 || inflationRate > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-150 dark:border-gray-700/60">
          {taxRate > 0 && (
            <div className="flex justify-between items-center px-2">
              <span className="text-gray-500 dark:text-gray-400">Gross Interest Earned:</span>
              <span className="text-gray-850 dark:text-gray-200">
                {currencySymbol}
                {fmt(calculations.totalInterestGross)}
              </span>
              <span className="text-red-500 dark:text-red-400">
                Estimated Tax Paid: {currencySymbol}
                {fmt(calculations.totalTaxPaid)}
              </span>
            </div>
          )}
          {inflationRate > 0 && (
            <div className="flex justify-between items-center px-2">
              <span className="text-gray-500 dark:text-gray-400">Inflation Effect Loss:</span>
              <span className="text-amber-600 dark:text-amber-500 font-bold">
                -{currencySymbol}
                {fmt(calculations.finalBalance - calculations.realBalance)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── SVG Chart Segment ── */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-750 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-250 mb-1">
          Wealth Composition Over Time
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          See how compound interest builds wealth compared to your raw deposits.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-bold mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-gray-700 dark:text-gray-300">Total Balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-violet-600"></span>
            <span className="text-gray-700 dark:text-gray-300">Total Deposits</span>
          </div>
          {inflationRate > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 border-t-2 border-dashed border-blue-500"></span>
              <span className="text-gray-700 dark:text-gray-300">Real Value (Inflation Adjusted)</span>
            </div>
          )}
        </div>

        {/* SVG Area Chart */}
        <div className="relative">
          <svg className="w-full h-auto select-none" viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            {/* Grid Lines Y */}
            {yGridLines.map((line, idx) => (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={line.y}
                  x2={SVG_W - padding.right}
                  y2={line.y}
                  stroke="currentColor"
                  className="text-gray-150 dark:text-gray-800"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={line.y + 3}
                  textAnchor="end"
                  fontSize="9 font-bold"
                  className="fill-gray-400 dark:fill-gray-500 font-sans"
                >
                  {currencySymbol}
                  {line.val >= 1000000
                    ? `${(line.val / 1000000).toFixed(1)}M`
                    : line.val >= 1000
                    ? `${(line.val / 1000).toFixed(0)}k`
                    : line.val.toFixed(0)}
                </text>
              </g>
            ))}

            {/* Grid Lines X */}
            {xGridLines.map((pt, idx) => (
              <g key={idx}>
                <line
                  x1={pt.x}
                  y1={padding.top}
                  x2={pt.x}
                  y2={padding.top + chartH}
                  stroke="currentColor"
                  className="text-gray-100 dark:text-gray-800"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={pt.x}
                  y={padding.top + chartH + 14}
                  textAnchor="middle"
                  fontSize="9 font-bold"
                  className="fill-gray-400 dark:fill-gray-500"
                >
                  Yr {pt.year}
                </text>
              </g>
            ))}

            {/* Fills */}
            {/* Balance Fill (Larger - background) */}
            <path
              d={balancePath}
              className="fill-emerald-500/10 dark:fill-emerald-500/5"
            />
            {/* Contributions Fill (Smaller - foreground) */}
            <path
              d={contributionPath}
              className="fill-violet-600/15 dark:fill-violet-600/10"
            />

            {/* Lines */}
            <path
              d={balanceLinePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d={contributionLinePath}
              fill="none"
              stroke="#6d28d9"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {inflationRate > 0 && (
              <path
                d={realBalanceLinePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            )}

            {/* Hover Indicators / Interactive Dots */}
            {chartPoints.map((pt, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g key={idx}>
                  {/* Invisible broad column for hover detection */}
                  <rect
                    x={pt.x - (chartW / chartPoints.length) / 2}
                    y={padding.top}
                    width={chartW / chartPoints.length}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {isHovered && (
                    <>
                      {/* Vertical line indicator */}
                      <line
                        x1={pt.x}
                        y1={padding.top}
                        x2={pt.x}
                        y2={padding.top + chartH}
                        stroke="#8b5cf6"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      {/* Balance dot */}
                      <circle cx={pt.x} cy={pt.yBalance} r="5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                      {/* Contributions dot */}
                      <circle cx={pt.x} cy={pt.yContrib} r="5" fill="#6d28d9" stroke="#fff" strokeWidth="1.5" />
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredIndex !== null && chartPoints[hoveredIndex] && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 md:left-[70px] md:translate-x-0 bg-gray-900/95 dark:bg-gray-950/95 text-white p-3 rounded-xl shadow-lg border border-gray-800 text-[11px] leading-relaxed z-10 w-44 pointer-events-none transition-all duration-150">
              <div className="font-bold text-gray-400 mb-1 border-b border-gray-800 pb-1">
                Year {chartPoints[hoveredIndex].year}
              </div>
              <div className="flex justify-between">
                <span>Total Balance:</span>
                <span className="font-bold text-emerald-400">
                  {currencySymbol}
                  {fmt(chartPoints[hoveredIndex].balance, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Deposited:</span>
                <span className="font-bold text-violet-400">
                  {currencySymbol}
                  {fmt(chartPoints[hoveredIndex].totalDeposited, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Interest (Net):</span>
                <span className="font-bold text-purple-300">
                  {currencySymbol}
                  {fmt(chartPoints[hoveredIndex].interestAccumulated, 0)}
                </span>
              </div>
              {inflationRate > 0 && (
                <div className="flex justify-between text-blue-300 border-t border-gray-800/60 mt-1 pt-1">
                  <span>Real Value:</span>
                  <span className="font-bold">
                    {currencySymbol}
                    {fmt(chartPoints[hoveredIndex].realBalance, 0)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Year-by-Year Table ── */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-150 dark:border-gray-750 p-6 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-250">
              Yearly Projections Breakdown
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              A comprehensive year-by-year analysis of your wealth growth.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setShowFullTable(!showFullTable)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors cursor-pointer"
          >
            {showFullTable ? "Collapse Table" : "Show All Years"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold bg-gray-50/50 dark:bg-gray-800/10">
                <th className="py-3 px-3">Year</th>
                <th className="py-3 px-3">Total Deposited</th>
                <th className="py-3 px-3">Interest Earned (Net)</th>
                {taxRate > 0 && <th className="py-3 px-3">Tax Deducted</th>}
                <th className="py-3 px-3">Future Value (Nominal)</th>
                {inflationRate > 0 && <th className="py-3 px-3">Real Value (Inflation Adj.)</th>}
              </tr>
            </thead>
            <tbody>
              {yearlyData
                .slice(0, showFullTable ? yearlyData.length : 5)
                .map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-gray-850 dark:text-gray-200">
                      Year {row.year}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                      {currencySymbol}
                      {fmt(row.totalContributions + initialDeposit, 0)}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-medium">
                      +{currencySymbol}
                      {fmt(row.interestAccumulated, 0)}
                    </td>
                    {taxRate > 0 && (
                      <td className="py-3 px-3 text-red-500 dark:text-red-400">
                        -{currencySymbol}
                        {fmt(row.taxAccumulated, 0)}
                      </td>
                    )}
                    <td className="py-3 px-3 text-gray-900 dark:text-gray-100 font-bold">
                      {currencySymbol}
                      {fmt(row.balance, 0)}
                    </td>
                    {inflationRate > 0 && (
                      <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-semibold">
                        {currencySymbol}
                        {fmt(row.realBalance, 0)}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!showFullTable && yearlyData.length > 5 && (
          <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setShowFullTable(true)}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
            >
              Show all {yearlyData.length} years...
            </button>
          </div>
        )}
      </div>

      {/* Export & Sharing Button Box */}
      <div className="flex flex-wrap items-center justify-end gap-4 pt-4">
        <SavingsPdfExport
          initialDeposit={initialDeposit}
          monthlyContribution={monthlyContribution}
          contributionFrequency={contributionFrequency}
          interestRate={interestRate}
          years={years}
          currencyCode={currencyCode}
          currencySymbol={currencySymbol}
          compoundFrequency={compoundFrequency}
          contributionTiming={contributionTiming}
          taxRate={taxRate}
          inflationRate={inflationRate}
          annualIncrease={annualIncrease}
          calculations={calculations}
          yearlyData={yearlyData}
        />
      </div>

    </div>
  );
}
