"use client";
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import ToolPageShell from "../ToolPageShell";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n, decimals = 2) =>
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const fmtCurrency = (n, symbol = "₹") => `${symbol}${fmt(n)}`;

const CURRENCIES = [
  { symbol: "৳", label: "BDT – Bangladeshi Taka" },
  { symbol: "₹", label: "INR – Indian Rupee" },
  { symbol: "$", label: "USD – US Dollar" },
  { symbol: "€", label: "EUR – Euro" },
  { symbol: "£", label: "GBP – British Pound" },
  { symbol: "¥", label: "JPY – Japanese Yen" },
];

// ─── EMI calculation ────────────────────────────────────────────────────────

function calcEMI({ principal, annualRate, months, processingFee = 0, insurancePct = 0, prepayMonths = [] }) {
  const P = parseFloat(principal);
  const annualR = parseFloat(annualRate);
  const n = parseInt(months, 10);
  const fee = parseFloat(processingFee) || 0;
  const insuranceMonthly = (P * (parseFloat(insurancePct) || 0)) / 100 / 12;

  if (!P || !annualR || !n) return null;

  const r = annualR / 100 / 12;

  let emi;
  if (r === 0) {
    emi = P / n;
  } else {
    const pow = Math.pow(1 + r, n);
    emi = (P * r * pow) / (pow - 1);
  }

  const emiWithInsurance = emi + insuranceMonthly;
  const totalPayment = emi * n + fee + insuranceMonthly * n;
  const totalInterest = totalPayment - P - fee;
  const effectiveRate = (totalInterest / (P * (n / 12))) * 100;

  // Build amortization table
  let balance = P;
  const schedule = [];
  let runningInterest = 0;
  let runningPrincipal = 0;

  for (let month = 1; month <= n; month++) {
    const interest = balance * r;
    let principalPaid = emi - interest;
    if (month === n) principalPaid = balance; // last payment closes balance

    const isPrepay = prepayMonths.includes(month);
    const prepayAmount = isPrepay ? balance * 0.05 : 0; // 5% extra on prepay month (illustrative)

    balance -= principalPaid + prepayAmount;
    if (balance < 0) balance = 0;
    runningInterest += interest;
    runningPrincipal += principalPaid;

    schedule.push({
      month,
      emi: emi + insuranceMonthly,
      principal: principalPaid,
      interest,
      prepay: prepayAmount,
      balance: Math.max(balance, 0),
      cumulativeInterest: runningInterest,
      cumulativePrincipal: runningPrincipal,
    });

    if (balance === 0) break;
  }

  return {
    emi,
    emiWithInsurance,
    totalPayment,
    totalInterest,
    effectiveRate,
    schedule,
    loanAmount: P,
    processingFee: fee,
    insuranceMonthly,
    months: n,
    annualRate: annualR,
  };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function InputField({ label, value, onChange, suffix, placeholder, min, max, step, id }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-4 pr-14 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent outline-none transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-sm"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function CurrencySelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = CURRENCIES.find((c) => c.symbol === value) || CURRENCIES[0];

  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-64" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-200 outline-none hover:border-gray-300 dark:hover:border-gray-500"
      >
        <span className="flex items-center gap-2.5">
          <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 font-bold text-xs flex-shrink-0">
            {selected.symbol}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{selected.label}</span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180 text-violet-500" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-35 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl dark:shadow-gray-900/40 overflow-hidden animate-fadeIn py-1">
          {CURRENCIES.map((c) => {
            const isSelected = c.symbol === value;
            return (
              <button
                key={c.symbol}
                type="button"
                onClick={() => {
                  onChange(c.symbol);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${isSelected
                    ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg font-bold text-xs flex-shrink-0 ${isSelected
                      ? "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}>
                    {c.symbol}
                  </span>
                  <span className="truncate">{c.label}</span>
                </span>
                {isSelected && (
                  <svg className="w-4.5 h-4.5 text-violet-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  const colors = {
    violet: "bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/40",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40",
    rose: "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/40",
    amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/40",
  };
  const textColors = {
    violet: "text-violet-700 dark:text-violet-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    rose: "text-rose-700 dark:text-rose-300",
    amber: "text-amber-700 dark:text-amber-300",
    blue: "text-blue-700 dark:text-blue-300",
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[accent]}`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-xl font-bold ${textColors[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// Donut chart (pure SVG)
function DonutChart({ principal, totalInterest, currency }) {
  const total = principal + totalInterest;
  const pPct = (principal / total) * 100;
  const iPct = (totalInterest / total) * 100;

  const r = 60;
  const cx = 80;
  const cy = 80;
  const circ = 2 * Math.PI * r;

  const pDash = (pPct / 100) * circ;
  const iDash = (iPct / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 160" className="w-44 h-44">
        {/* Interest arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="22"
          strokeDasharray={`${iDash} ${circ - iDash}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="butt"
        />
        {/* Principal arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="22"
          strokeDasharray={`${pDash} ${circ - pDash}`}
          strokeDashoffset={circ * 0.25 - iDash}
          strokeLinecap="butt"
        />
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-600 dark:fill-gray-300" fontSize="10" fontWeight="600">Total</text>
        <text x={cx} y={cy + 6} textAnchor="middle" className="fill-gray-800 dark:fill-gray-100" fontSize="9" fontWeight="700">
          {currency}{fmt(total, 0)}
        </text>
      </svg>
      <div className="flex gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-violet-600 inline-block" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Principal ({pPct.toFixed(1)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Interest ({iPct.toFixed(1)}%)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

const EMICalculator = () => {
  // Basic inputs
  const [loanAmount, setLoanAmount] = useState("500000");
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(60);
  const [tenureType, setTenureType] = useState("months"); // "months" | "years"
  const [currency, setCurrency] = useState("৳");

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [processingFee, setProcessingFee] = useState("");
  const [insurancePct, setInsurancePct] = useState("");
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UI
  const [activeTab, setActiveTab] = useState("summary"); // "summary" | "schedule"
  const [showRows, setShowRows] = useState(12);

  const months = tenureType === "years" ? tenure * 12 : tenure;

  const result = useMemo(
    () =>
      calcEMI({
        principal: loanAmount,
        annualRate: interestRate,
        months,
        processingFee,
        insurancePct,
      }),
    [loanAmount, interestRate, months, processingFee, insurancePct]
  );

  const resetAll = () => {
    setLoanAmount("500000");
    setInterestRate(8.5);
    setTenure(60);
    setTenureType("months");
    setProcessingFee("");
    setInsurancePct("");
    setStartMonth(new Date().toISOString().slice(0, 7));
  };

  // Build month label from startMonth + offset
  const monthLabel = useCallback(
    (offset) => {
      if (!startMonth) return `Month ${offset}`;
      const [year, month] = startMonth.split("-").map(Number);
      const d = new Date(year, month - 1 + offset - 1);
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    },
    [startMonth]
  );

  const exportPDF = () => {
    if (!result) return;

    const getCurrencyCode = (s) =>
      ({ "\u09F3": "BDT", "\u20B9": "INR", "$": "USD", "\u20AC": "EUR", "\u00A3": "GBP", "\u00A5": "JPY" }[s] || s);
    const currCode = getCurrencyCode(currency);
    const fmtPDF = (n) => `${fmt(n)} ${currCode}`;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const ML = 14, MR = 14;
    const CW = PW - ML - MR;
    const FOOTER_H = 12;
    const BOTTOM = PH - FOOTER_H - 2;

    const C = {
      violet: [124, 58, 237], violetBg: [245, 243, 255],
      violetMid: [109, 40, 217], violetLt: [196, 181, 253],
      rose: [225, 29, 72], emerald: [4, 120, 87],
      gray900: [17, 24, 39], gray700: [55, 65, 81],
      gray500: [107, 114, 128], gray400: [156, 163, 175],
      gray200: [229, 231, 235], gray100: [243, 244, 246],
      gray50: [249, 250, 251], white: [255, 255, 255],
    };

    let yPos = 0, pageNum = 0;

    const newPage = () => { if (pageNum > 0) doc.addPage(); pageNum++; yPos = 0; };

    const drawHeader = () => {
      doc.setFillColor(109, 40, 217); doc.rect(0, 0, PW, 32, "F");
      doc.setFillColor(124, 58, 237); doc.rect(0, 0, PW * 0.65, 32, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(255, 255, 255);
      doc.text("EMI Loan Calculation Report", ML, 13);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(196, 181, 253);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, ML, 22);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
      doc.text("toolstrek.vercel.app", PW - MR, 13, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(196, 181, 253);
      doc.text("Free Professional Tools", PW - MR, 22, { align: "right" });
      yPos = 40;
    };

    const drawFooter = (p, total) => {
      doc.setFillColor(...C.gray100); doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, "F");
      doc.setDrawColor(...C.violetLt); doc.setLineWidth(0.35);
      doc.line(0, PH - FOOTER_H, PW, PH - FOOTER_H);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...C.gray500);
      doc.text(`\u00A9 ${new Date().getFullYear()} ToolsTrek \u2022 EMI Report`, ML, PH - 3.5);
      doc.text(`Page ${p} of ${total}`, PW - MR, PH - 3.5, { align: "right" });
    };

    const drawSection = (label) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5);
      doc.setTextColor(...C.violet); doc.text(label, ML, yPos);
      yPos += 1.5;
      doc.setDrawColor(...C.violetLt); doc.setLineWidth(0.4);
      doc.line(ML, yPos, ML + CW, yPos); doc.setLineWidth(0.1);
      yPos += 6;
    };

    // Donut chart using triangle fans
    const drawDonut = (cx, cy, outerR, innerR, segments) => {
      let angle = -Math.PI / 2;
      segments.forEach(({ pct, color }) => {
        if (pct < 0.002) return;
        const sweep = 2 * Math.PI * pct;
        const steps = Math.max(4, Math.round(sweep * 36));
        doc.setFillColor(...color);
        for (let i = 0; i < steps; i++) {
          const a1 = angle + sweep * i / steps;
          const a2 = angle + sweep * (i + 1) / steps;
          doc.triangle(cx, cy, cx + outerR * Math.cos(a1), cy + outerR * Math.sin(a1), cx + outerR * Math.cos(a2), cy + outerR * Math.sin(a2), "F");
        }
        angle += sweep;
      });
      doc.setFillColor(...C.white); doc.circle(cx, cy, innerR, "F");
    };

    // Horizontal progress bar
    const drawBar = (x, y, w, h, pct, color) => {
      doc.setFillColor(...C.gray200); doc.roundedRect(x, y, w, h, 1, 1, "F");
      if (pct > 0.005) {
        doc.setFillColor(...color); doc.roundedRect(x, y, w * pct, h, 1, 1, "F");
        if (pct < 0.98) doc.rect(x + w * pct - 2, y, 2, h, "F");
      }
    };

    // ── PAGE 1: Parameters + Summary + Chart ──────────────────────────────
    newPage(); drawHeader();

    const loanStart = (() => {
      if (!startMonth) return "N/A";
      const [yr, mo] = startMonth.split("-").map(Number);
      return new Date(yr, mo - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    })();

    drawSection("Loan Parameters");
    const kL = ML + 2, kM = ML + 2 + CW / 2, vL = ML + 54, vM = ML + 54 + CW / 2;
    const params = [
      [["Loan Amount", fmtPDF(result.loanAmount)], ["Loan Tenure", `${months} months (${(months / 12).toFixed(1)} yrs)`]],
      [["Annual Rate", `${result.annualRate}%`], ["Monthly Rate", `${(result.annualRate / 12).toFixed(4)}%`]],
      [["Start Month", loanStart], ["End Month", monthLabel(months)]],
    ];
    params.forEach(([left, right]) => {
      [[left, kL, vL], [right, kM, vM]].forEach(([[lbl, val], kx, vx]) => {
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.gray500); doc.text(lbl, kx, yPos);
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C.gray900); doc.text(val, vx, yPos);
      });
      yPos += 8;
    });
    yPos += 4;

    drawSection("Calculation Summary");
    const summary = [
      [["Monthly EMI", fmtPDF(result.emiWithInsurance)], ["Total Payment", fmtPDF(result.totalPayment)]],
      [["Total Principal", fmtPDF(result.loanAmount)], ["Total Interest", fmtPDF(result.totalInterest)]],
      [["Effective Rate", `${result.effectiveRate.toFixed(2)}%`], ["Interest Ratio", `${((result.totalInterest / result.loanAmount) * 100).toFixed(1)}%`]],
    ];
    summary.forEach(([left, right]) => {
      [[left, kL, vL], [right, kM, vM]].forEach(([[lbl, val], kx, vx]) => {
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...C.gray500); doc.text(lbl, kx, yPos);
        doc.setFont("helvetica", "bold"); doc.setTextColor(...C.gray900); doc.text(val, vx, yPos);
      });
      yPos += 8;
    });
    yPos += 6;

    drawSection("Repayment Breakdown");
    const pPct = result.loanAmount / result.totalPayment;
    const iPct = result.totalInterest / result.totalPayment;
    const fPct = result.processingFee > 0 ? result.processingFee / result.totalPayment : 0;
    const chartTopY = yPos, cx = ML + 33, cy = chartTopY + 32;
    const outerR = 28, innerR = 15;

    drawDonut(cx, cy, outerR, innerR, [
      { pct: pPct, color: C.violet },
      { pct: iPct, color: C.rose },
      ...(fPct > 0 ? [{ pct: fPct, color: [251, 191, 36] }] : []),
    ]);
    doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(...C.gray500);
    doc.text("TOTAL", cx, cy - 3, { align: "center" });
    doc.setFontSize(6.5); doc.setTextColor(...C.gray700);
    doc.text(`${fmt(result.totalPayment, 0)} ${currCode}`, cx, cy + 3, { align: "center" });

    const legX = ML + 74, legColors = [C.violet, C.rose, [251, 191, 36]];
    const legendItems = [
      { label: "Principal", pct: pPct, amount: fmtPDF(result.loanAmount) },
      { label: "Total Interest", pct: iPct, amount: fmtPDF(result.totalInterest) },
      ...(fPct > 0 ? [{ label: "Processing Fee", pct: fPct, amount: fmtPDF(result.processingFee) }] : []),
    ];
    let legY = chartTopY + 6;
    legendItems.forEach((item, idx) => {
      const col = legColors[idx];
      doc.setFillColor(...col); doc.roundedRect(legX, legY, 4, 4, 0.7, 0.7, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...C.gray900);
      doc.text(item.label, legX + 7, legY + 3.2);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...C.gray500);
      doc.text(`${item.amount}  (${(item.pct * 100).toFixed(1)}%)`, legX + 7, legY + 9.5);
      drawBar(legX + 7, legY + 12, CW - 74 - 4, 4, item.pct, col);
      legY += 22;
    });
    yPos = Math.max(cy + outerR + 6, legY + 4);
    drawFooter(1, "??");

    // ── PAGE(S): Full Amortization Schedule ──────────────────────────────
    const ROW_H = 6;
    let rowIdx = 0;

    const drawTableHead = (isFirst) => {
      drawSection(isFirst
        ? `Amortization Schedule \u2014 Full ${result.schedule.length} Month Breakdown`
        : "Amortization Schedule (continued)");
      doc.setFillColor(...C.violet); doc.rect(ML, yPos - 4, CW, 8, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
      doc.text("#", ML + 2, yPos);
      doc.text("Period", ML + 12, yPos);
      doc.text("EMI", ML + 50, yPos);
      doc.text("Principal", ML + 87, yPos);
      doc.text("Interest", ML + 124, yPos);
      doc.text("Balance", ML + 158, yPos);
      yPos += 7;
    };

    newPage(); drawHeader(); drawTableHead(true);

    for (let i = 0; i < result.schedule.length; i++) {
      const row = result.schedule[i];
      if (yPos + ROW_H > BOTTOM) {
        drawFooter(pageNum, "??");
        newPage(); drawHeader(); drawTableHead(false);
        rowIdx = 0;
      }
      if (rowIdx % 2 === 1) {
        doc.setFillColor(...C.gray50); doc.rect(ML, yPos - 3.5, CW, ROW_H, "F");
      }
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.setTextColor(...C.gray400); doc.text(String(row.month), ML + 2, yPos);
      doc.setTextColor(...C.gray700); doc.text(monthLabel(row.month), ML + 12, yPos);
      doc.setTextColor(...C.violetMid); doc.text(fmtPDF(row.emi), ML + 50, yPos);
      doc.setTextColor(...C.emerald); doc.text(fmtPDF(row.principal), ML + 87, yPos);
      doc.setTextColor(...C.rose); doc.text(fmtPDF(row.interest), ML + 124, yPos);
      doc.setTextColor(...C.gray700); doc.text(fmtPDF(row.balance), ML + 158, yPos);
      yPos += ROW_H;
      doc.setDrawColor(...C.gray100); doc.setLineWidth(0.1);
      doc.line(ML, yPos - 0.5, ML + CW, yPos - 0.5);
      rowIdx++;
    }

    // Totals row
    if (yPos + 10 > BOTTOM) { drawFooter(pageNum, "??"); newPage(); drawHeader(); yPos += 4; }
    yPos += 3;
    doc.setFillColor(...C.violetBg); doc.rect(ML, yPos - 3.5, CW, 8, "F");
    doc.setDrawColor(...C.violetLt); doc.setLineWidth(0.4); doc.rect(ML, yPos - 3.5, CW, 8, "S");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.violet);
    doc.text("TOTALS", ML + 2, yPos + 1);
    doc.text(fmtPDF(result.totalPayment), ML + 50, yPos + 1);
    doc.text(fmtPDF(result.loanAmount), ML + 87, yPos + 1);
    doc.text(fmtPDF(result.totalInterest), ML + 124, yPos + 1);

    const totalPages = pageNum;
    drawFooter(totalPages, totalPages);

    // Patch all previous pages with correct "total"
    for (let p = 1; p < totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(...C.gray100); doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, "F");
      doc.setDrawColor(...C.violetLt); doc.setLineWidth(0.35);
      doc.line(0, PH - FOOTER_H, PW, PH - FOOTER_H);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...C.gray500);
      doc.text(`\u00A9 ${new Date().getFullYear()} ToolsTrek \u2022 EMI Report`, ML, PH - 3.5);
      doc.text(`Page ${p} of ${totalPages}`, PW - MR, PH - 3.5, { align: "right" });
    }

    doc.save(`EMI_Report_${new Date().getFullYear()}.pdf`);
  };

  const hasResult = result !== null;

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="font-sans">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">

          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-8 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a1 1 0 001-1V6a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">EMI Calculator</h1>
                <p className="text-violet-200 mt-1 text-base">
                  Equated Monthly Installment — plan your loan repayment instantly
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* ── Currency ── */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Currency
              </label>
              <CurrencySelector value={currency} onChange={setCurrency} />
            </div>

            {/* ── Inputs Stacked vertically in one single column, using full-width ── */}
            <div className="space-y-6 mb-6">
              <InputField
                id="loan-amount"
                label={`Loan Amount (${currency})`}
                value={loanAmount}
                onChange={setLoanAmount}
                suffix={currency}
                placeholder="e.g. 500000"
                min="1000"
                step="1000"
              />
              <InputField
                id="interest-rate"
                label="Annual Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                suffix="%"
                placeholder="e.g. 8.5"
                min="0.1"
                max="36"
                step="0.1"
              />

              {/* ── Tenure ── */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Loan Tenure
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 w-full sm:w-auto">
                    {["months", "years"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          if (t !== tenureType) {
                            setTenure(t === "years" ? Math.round(tenure / 12) || 1 : tenure * 12);
                            setTenureType(t);
                          }
                        }}
                        className={`flex-1 px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 capitalize ${tenureType === t
                            ? "bg-white dark:bg-gray-600 text-violet-600 dark:text-violet-400 shadow-sm ring-1 ring-violet-200 dark:ring-violet-700"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={tenureType === "years" ? 30 : 360}
                    step={1}
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    placeholder={`Tenure in ${tenureType}`}
                    className="w-full pl-4 pr-14 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent outline-none transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium pointer-events-none">
                    {tenureType === "years" ? "years" : "months"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  = {months} months total
                </p>
              </div>

              {/* ── Advanced Options Toggle ── */}
              <div>
                <button
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 font-medium text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-200 cursor-pointer"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                  <span className="ml-1 text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-full font-semibold">
                    {showAdvanced ? "▲" : "3 options"}
                  </span>
                </button>

                {/* Advanced Panel */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${showAdvanced ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/40 rounded-xl">
                    {/* Processing Fee */}
                    <InputField
                      id="processing-fee"
                      label={`Processing Fee (${currency})`}
                      value={processingFee}
                      onChange={setProcessingFee}
                      suffix={currency}
                      placeholder="e.g. 5000"
                      min="0"
                      step="100"
                    />

                    {/* Insurance */}
                    <InputField
                      id="insurance-pct"
                      label="Annual Insurance (% of loan)"
                      value={insurancePct}
                      onChange={setInsurancePct}
                      suffix="%"
                      placeholder="e.g. 0.5"
                      min="0"
                      max="10"
                      step="0.1"
                    />

                    {/* Start Month */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Loan Start Month
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3 h-12 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-200 outline-none hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 text-left font-normal"
                            )}
                          >
                            <span className="flex items-center gap-2.5">
                              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {startMonth ? (
                                  (() => {
                                    const [year, month] = startMonth.split("-").map(Number);
                                    const d = new Date(year, month - 1);
                                    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                                  })()
                                ) : (
                                  "Select Month"
                                )}
                              </span>
                            </span>
                            <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold bg-violet-50 dark:bg-violet-900/30 px-2.5 py-0.5 rounded-full">
                              Change
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl" align="start">
                          <Calendar
                            mode="single"
                            selected={(() => {
                              if (!startMonth) return new Date();
                              const [year, month] = startMonth.split("-").map(Number);
                              return new Date(year, month - 1, 1);
                            })()}
                            onSelect={(date) => {
                              if (date) {
                                const y = date.getFullYear();
                                const m = String(date.getMonth() + 1).padStart(2, "0");
                                setStartMonth(`${y}-${m}`);
                              }
                            }}
                            captionLayout="dropdown-buttons"
                            fromYear={2020}
                            toYear={2050}
                            className="rounded-2xl"
                            classNames={{
                              caption_dropdowns: "flex justify-center gap-1.5 w-full px-2",
                            }}
                            components={{
                              Dropdown: ({ value, onChange, children, ...props }) => {
                                const options = React.Children.toArray(children);
                                const selected = options.find((child) => child.props.value === value);
                                const handleChange = (value) => {
                                  const changeEvent = {
                                    target: { value },
                                  };
                                  onChange?.(changeEvent);
                                };
                                return (
                                  <Select
                                    value={value?.toString()}
                                    onValueChange={(val) => {
                                      handleChange(val);
                                    }}
                                  >
                                    <SelectTrigger className="h-8 min-w-[75px] max-w-[110px] px-2 py-1 pr-1.5 focus:ring-0 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                      <SelectValue>{selected?.props?.children}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-[9999]">
                                      {options.map((option, id) => (
                                        <SelectItem
                                          key={`${option.props.value}-${id}`}
                                          value={option.props.value?.toString() ?? ""}
                                          className="text-xs hover:bg-violet-50 dark:hover:bg-violet-900/30 text-gray-700 dark:text-gray-200 rounded-md cursor-pointer"
                                        >
                                          {option.props.children}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                );
                              },
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Used to label the amortization schedule
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={resetAll}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm cursor-pointer"
              >
                Reset
              </button>
              {hasResult && (
                <button
                  type="button"
                  onClick={exportPDF}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all duration-200 text-sm cursor-pointer shadow-md shadow-violet-500/20 hover:shadow-violet-600/30 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </button>
              )}
            </div>

            {/* ── Results ── */}
            {hasResult && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-8 animate-fadeIn">

                {/* EMI Hero */}
                <div className="text-center mb-8">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                    Monthly EMI
                  </p>
                  <div className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {fmtCurrency(result.emiWithInsurance, currency)}
                  </div>
                  {result.insuranceMonthly > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      (includes {fmtCurrency(result.insuranceMonthly, currency)} insurance / month)
                    </p>
                  )}
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard
                    accent="violet"
                    label="Loan Amount"
                    value={fmtCurrency(result.loanAmount, currency)}
                  />
                  <StatCard
                    accent="rose"
                    label="Total Interest"
                    value={fmtCurrency(result.totalInterest, currency)}
                    sub={`${result.effectiveRate.toFixed(2)}% effective rate`}
                  />
                  <StatCard
                    accent="emerald"
                    label="Total Payment"
                    value={fmtCurrency(result.totalPayment, currency)}
                  />
                  {result.processingFee > 0 && (
                    <StatCard
                      accent="amber"
                      label="Processing Fee"
                      value={fmtCurrency(result.processingFee, currency)}
                    />
                  )}
                  <StatCard
                    accent="blue"
                    label="Loan Tenure"
                    value={`${months} months`}
                    sub={`${(months / 12).toFixed(1)} years`}
                  />
                </div>

                {/* Donut + Interest Saved Block */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <DonutChart
                    principal={result.loanAmount}
                    totalInterest={result.totalInterest}
                    currency={currency}
                  />
                  <div className="flex-1 w-full">
                    {/* Interest Breakdown Bar */}
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Repayment Breakdown
                    </p>
                    {[
                      {
                        label: "Principal",
                        amount: result.loanAmount,
                        total: result.totalPayment,
                        color: "bg-violet-600",
                        textColor: "text-violet-700 dark:text-violet-300",
                      },
                      {
                        label: "Total Interest",
                        amount: result.totalInterest,
                        total: result.totalPayment,
                        color: "bg-rose-500",
                        textColor: "text-rose-700 dark:text-rose-300",
                      },
                      ...(result.processingFee > 0
                        ? [
                          {
                            label: "Processing Fee",
                            amount: result.processingFee,
                            total: result.totalPayment,
                            color: "bg-amber-400",
                            textColor: "text-amber-700 dark:text-amber-300",
                          },
                        ]
                        : []),
                    ].map((row) => {
                      const pct = (row.amount / row.total) * 100;
                      return (
                        <div key={row.label} className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">{row.label}</span>
                            <span className={`font-semibold ${row.textColor}`}>
                              {fmtCurrency(row.amount, currency)} ({pct.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${row.color} rounded-full transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                  <div className="flex gap-1">
                    {[
                      { id: "summary", label: "📊 Summary" },
                      { id: "schedule", label: "📅 Amortization Schedule" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 -mb-px ${activeTab === tab.id
                            ? "border-violet-600 text-violet-700 dark:text-violet-400"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Tab */}
                {activeTab === "summary" && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-5 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/40 rounded-xl">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                          <span className="text-violet-600 dark:text-violet-400">💰</span> Loan Summary
                        </h3>
                        {[
                          ["Principal Amount", fmtCurrency(result.loanAmount, currency)],
                          ["Annual Rate", `${result.annualRate}%`],
                          ["Monthly Rate", `${(result.annualRate / 12).toFixed(4)}%`],
                          ["Tenure", `${months} months (${(months / 12).toFixed(1)} yrs)`],
                          ["Base EMI", fmtCurrency(result.emi, currency)],
                          ...(result.insuranceMonthly > 0
                            ? [["Insurance / month", fmtCurrency(result.insuranceMonthly, currency)]]
                            : []),
                          ["Total EMI (incl. insurance)", fmtCurrency(result.emiWithInsurance, currency)],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1.5 border-b border-violet-100 dark:border-violet-800/30 last:border-0 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{k}</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{v}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-5 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 border border-rose-100 dark:border-rose-800/40 rounded-xl">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                          <span className="text-rose-500">📈</span> Cost Breakdown
                        </h3>
                        {[
                          ["Total Interest Paid", fmtCurrency(result.totalInterest, currency)],
                          [
                            "Processing Fee",
                            result.processingFee > 0
                              ? fmtCurrency(result.processingFee, currency)
                              : "—",
                          ],
                          ["Total Cost of Loan", fmtCurrency(result.totalPayment, currency)],
                          [
                            "Interest-to-Principal Ratio",
                            `${((result.totalInterest / result.loanAmount) * 100).toFixed(1)}%`,
                          ],
                          ["Effective Annual Rate", `${result.effectiveRate.toFixed(2)}%`],
                          [
                            "Interest Saved vs. 1yr loan",
                            (() => {
                              const r1 = calcEMI({
                                principal: result.loanAmount,
                                annualRate: result.annualRate,
                                months: 12,
                              });
                              return r1
                                ? fmtCurrency(
                                  Math.abs(result.totalInterest - r1.totalInterest),
                                  currency
                                ) + " more"
                                : "—";
                            })(),
                          ],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1.5 border-b border-rose-100 dark:border-rose-800/30 last:border-0 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{k}</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tip box */}
                    <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl text-sm">
                      <span className="text-blue-500 text-lg flex-shrink-0">💡</span>
                      <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                        <strong>Tip:</strong> Making even one extra EMI payment per year can reduce your loan tenure by{" "}
                        <strong>
                          {Math.round(months * 0.06)} months
                        </strong>{" "}
                        and save approximately{" "}
                        <strong>{fmtCurrency(result.totalInterest * 0.06, currency)}</strong> in interest.
                      </p>
                    </div>
                  </div>
                )}

                {/* Schedule Tab */}
                {activeTab === "schedule" && (
                  <div>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-violet-50 dark:bg-violet-900/30">
                            {["#", "Period", "EMI", "Principal", "Interest", "Balance"].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.schedule.slice(0, showRows).map((row, i) => (
                            <tr
                              key={row.month}
                              className={`border-t border-gray-100 dark:border-gray-700 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/30"
                                }`}
                            >
                              <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 font-medium">{row.month}</td>
                              <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                {monthLabel(row.month)}
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-violet-700 dark:text-violet-300 whitespace-nowrap">
                                {fmtCurrency(row.emi, currency)}
                              </td>
                              <td className="px-4 py-2.5 text-emerald-700 dark:text-emerald-400 font-medium whitespace-nowrap">
                                {fmtCurrency(row.principal, currency)}
                              </td>
                              <td className="px-4 py-2.5 text-rose-600 dark:text-rose-400 font-medium whitespace-nowrap">
                                {fmtCurrency(row.interest, currency)}
                              </td>
                              <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-semibold whitespace-nowrap">
                                {fmtCurrency(row.balance, currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Show more / less */}
                    {result.schedule.length > 12 && (
                      <div className="flex justify-center gap-3 mt-4">
                        {showRows < result.schedule.length && (
                          <button
                            onClick={() => setShowRows((v) => Math.min(v + 12, result.schedule.length))}
                            className="px-5 py-2 text-sm font-semibold text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all cursor-pointer"
                          >
                            Show 12 more
                          </button>
                        )}
                        {showRows > 12 && (
                          <button
                            onClick={() => setShowRows(12)}
                            className="px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
                          >
                            Collapse
                          </button>
                        )}
                        {showRows < result.schedule.length && (
                          <button
                            onClick={() => setShowRows(result.schedule.length)}
                            className="px-5 py-2 text-sm font-semibold text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all cursor-pointer"
                          >
                            Show all {result.schedule.length}
                          </button>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                      Showing {Math.min(showRows, result.schedule.length)} of{" "}
                      {result.schedule.length} months
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* Placeholder when no result (should rarely show since calc is instant) */}
            {!hasResult && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <div className="text-5xl mb-4">🧮</div>
                <p className="text-base">Enter a valid loan amount, rate, and tenure to see your EMI breakdown.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </ToolPageShell>
  );
};

export default EMICalculator;
