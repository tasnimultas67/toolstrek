"use client";
import React from "react";
import { jsPDF } from "jspdf";

export default function SavingsPdfExport({
  initialDeposit,
  monthlyContribution,
  contributionFrequency,
  interestRate,
  years,
  currencyCode,
  currencySymbol,
  compoundFrequency,
  contributionTiming,
  taxRate,
  inflationRate,
  annualIncrease,
  calculations,
  yearlyData,
}) {
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();   // 210
    const PH = doc.internal.pageSize.getHeight();  // 297
    const ML = 14;
    const MR = 14;
    const CW = PW - ML - MR; // usable width = 182

    /* ─── Color palette ──────────────────────────────── */
    const C = {
      violet:    [109, 40,  217],
      violetMid: [139, 92,  246],
      violetLt:  [196, 181, 253],
      violetBg:  [245, 243, 255],
      emerald:   [5,   150, 105],
      emeraldLt: [167, 243, 208],
      rose:      [225, 29,  72],
      sky:       [14,  165, 233],
      gray900:   [17,  24,  39],
      gray700:   [55,  65,  81],
      gray500:   [107, 114, 128],
      gray300:   [209, 213, 219],
      gray200:   [229, 231, 235],
      gray100:   [243, 244, 246],
      gray50:    [249, 250, 251],
      white:     [255, 255, 255],
    };

    let y = 0; // running Y cursor

    /* ─── Safe text helper – clips at right margin ───── */
    const safeText = (text, x, yy, opts = {}) => {
      const str = String(text ?? "");
      doc.text(str, x, yy, opts);
    };

    /* ─── Formatter ──────────────────────────────────── */
    const fmt = (val) =>
      Number(val).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    const fmtFull = (val) =>
      `${currencyCode} ${Number(val).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    /* ─── Label maps ─────────────────────────────────── */
    const freqLabel = { 12: "Monthly", 1: "Annually", 52: "Weekly", 26: "Bi-Weekly" };
    const compLabel = { 365: "Daily", 12: "Monthly", 4: "Quarterly", 2: "Semi-Annually", 1: "Annually" };

    /* ═══════════════════════════════════════════════════
       HEADER BANNER
    ═══════════════════════════════════════════════════ */
    doc.setFillColor(...C.violet);
    doc.rect(0, 0, PW, 34, "F");

    // Accent stripe
    doc.setFillColor(...C.violetMid);
    doc.rect(0, 30, PW, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...C.white);
    safeText("Savings & Wealth Growth Report", ML, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.violetLt);
    safeText(
      `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      ML, 23
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    safeText("toolstrek.vercel.app", PW - MR, 14, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.violetLt);
    safeText("Savings Calculator", PW - MR, 23, { align: "right" });

    y = 44;

    /* ─── Section heading ─────────────────────────────── */
    const drawSection = (title) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...C.violet);
      safeText(title, ML, y);
      y += 1.5;
      doc.setDrawColor(...C.violetLt);
      doc.setLineWidth(0.4);
      doc.line(ML, y, ML + CW, y);
      doc.setLineWidth(0.1);
      y += 5.5;
    };

    /* ─── Footer helper ──────────────────────────────── */
    const drawFooter = (pageNum, totalPages) => {
      doc.setFillColor(...C.gray100);
      doc.rect(0, PH - 12, PW, 12, "F");
      doc.setDrawColor(...C.gray200);
      doc.setLineWidth(0.3);
      doc.line(0, PH - 12, PW, PH - 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.gray500);
      safeText(
        `Copyright ${new Date().getFullYear()} ToolsTrek  |  Savings & Wealth Growth Calculator`,
        ML, PH - 4.5
      );
      safeText(`Page ${pageNum} of ${totalPages}`, PW - MR, PH - 4.5, { align: "right" });
    };

    /* ─── Check & add page ───────────────────────────── */
    const ensureSpace = (needed) => {
      if (y + needed > PH - 18) {
        const total = doc.internal.getNumberOfPages();
        drawFooter(total, total + 1);
        doc.addPage();
        y = 18;
        return true;
      }
      return false;
    };

    /* ═══════════════════════════════════════════════════
       SECTION 1 – PARAMETERS (2-column grid)
    ═══════════════════════════════════════════════════ */
    drawSection("Savings Configuration & Parameters");

    const paramRows = [
      ["Initial Principal",    fmtFull(initialDeposit)],
      ["Regular Contribution", `${fmtFull(monthlyContribution)} / ${freqLabel[contributionFrequency] ?? "Monthly"}`],
      ["Annual APY",           `${interestRate}%`],
      ["Compounding",          compLabel[compoundFrequency] ?? "Monthly"],
      ["Duration",             `${years} Years`],
      ["Contribution Timing",  contributionTiming === "beginning" ? "Beginning of Period" : "End of Period"],
      ["Tax on Interest",      `${taxRate}%`],
      ["Inflation Rate",       `${inflationRate}%`],
      ["Annual Step-up",       `${annualIncrease}%`],
      ["Currency",             currencyCode],
    ];

    const colW = CW / 2 - 2; // ~89mm each column
    const colLabelW = 38;     // label column width inside each half

    // Draw 2-col grid rows (pair rows)
    for (let i = 0; i < paramRows.length; i += 2) {
      ensureSpace(8);
      const rowBg = Math.floor(i / 2) % 2 === 0 ? C.white : C.gray50;
      doc.setFillColor(...rowBg);
      doc.rect(ML, y - 1.5, CW, 7, "F");

      // Left column
      const [lLbl, lVal] = paramRows[i];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.gray500);
      safeText(lLbl + ":", ML + 1, y + 3);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.gray900);
      safeText(lVal, ML + 1 + colLabelW, y + 3);

      // Right column (if exists)
      if (paramRows[i + 1]) {
        const [rLbl, rVal] = paramRows[i + 1];
        const rx = ML + colW + 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...C.gray500);
        safeText(rLbl + ":", rx, y + 3);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.gray900);
        safeText(rVal, rx + colLabelW, y + 3);
      }
      y += 7;
    }

    y += 5;

    /* ═══════════════════════════════════════════════════
       SECTION 2 – KEY RESULTS
    ═══════════════════════════════════════════════════ */
    ensureSpace(60);
    drawSection("Growth Summary Results");

    const resultRows = [
      { label: "Total Contributions (Principal)",  value: fmtFull(calculations.totalContributions + initialDeposit), color: C.gray900 },
      { label: "Gross Interest Earned",            value: fmtFull(calculations.totalInterestGross),                  color: C.emerald },
      ...(taxRate > 0 ? [{ label: "Estimated Tax Deducted", value: fmtFull(calculations.totalTaxPaid), color: C.rose }] : []),
      { label: "Net Interest Earned (After Tax)",  value: fmtFull(calculations.totalInterestNet),                    color: C.emerald },
      { label: "Final Balance (Nominal)",          value: fmtFull(calculations.finalBalance),                        color: C.violet },
      ...(inflationRate > 0 ? [{ label: `Real Value (${inflationRate}% Inflation Adjusted)`, value: fmtFull(calculations.realBalance), color: C.sky }] : []),
    ];

    const resultLabelX = ML + 2;
    const resultValX   = PW - MR - 2;

    resultRows.forEach(({ label, value, color }, idx) => {
      ensureSpace(9);
      // Alternating row background
      if (idx % 2 === 0) {
        doc.setFillColor(...C.violetBg);
        doc.rect(ML, y - 1.5, CW, 8, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.gray700);
      safeText(label, resultLabelX, y + 4);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...color);
      safeText(value, resultValX, y + 4, { align: "right" });
      y += 8;
    });

    y += 5;

    /* ═══════════════════════════════════════════════════
       SECTION 3 – VISUAL BAR CHART (Year-by-Year)
    ═══════════════════════════════════════════════════ */
    // How many years fit in a chart that's ~80mm tall?
    ensureSpace(90);
    drawSection("Savings Growth Chart");

    const chartData = yearlyData;
    const maxBalance = Math.max(...chartData.map((d) => d.balance), 1);
    const chartH = 60;   // chart area height in mm
    const chartW = CW;
    const chartX = ML;
    const chartY = y;

    // Draw background
    doc.setFillColor(248, 248, 252);
    doc.rect(chartX, chartY, chartW, chartH, "F");
    doc.setDrawColor(...C.gray200);
    doc.setLineWidth(0.2);
    doc.rect(chartX, chartY, chartW, chartH);

    // Horizontal grid lines (5 lines)
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const lineY = chartY + chartH - (i / gridLines) * chartH;
      doc.setDrawColor(...C.gray200);
      doc.setLineWidth(0.15);
      doc.line(chartX, lineY, chartX + chartW, lineY);

      // Y-axis label
      const labelVal = (maxBalance * i) / gridLines;
      const labelStr =
        labelVal >= 1000000
          ? `${currencyCode} ${(labelVal / 1000000).toFixed(1)}M`
          : labelVal >= 1000
          ? `${currencyCode} ${(labelVal / 1000).toFixed(0)}K`
          : `${currencyCode} ${labelVal.toFixed(0)}`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...C.gray500);
      safeText(labelStr, chartX - 1, lineY + 1, { align: "right" });
    }

    // Draw area/bars for each year
    const n = chartData.length;
    const barGroupW = chartW / n;
    const barPad = Math.min(barGroupW * 0.15, 1.2);

    chartData.forEach((row, idx) => {
      const bx = chartX + idx * barGroupW + barPad;
      const bw = barGroupW - barPad * 2;

      const totalDeposited = row.totalContributions + initialDeposit;
      const hDeposit  = (totalDeposited / maxBalance) * chartH;
      const hBalance  = (row.balance / maxBalance) * chartH;
      const hInterest = hBalance - hDeposit;

      // Deposits bar (violet)
      doc.setFillColor(...C.violetLt);
      doc.rect(bx, chartY + chartH - hDeposit, bw, hDeposit, "F");

      // Interest stack (emerald)
      if (hInterest > 0) {
        doc.setFillColor(...C.emerald);
        doc.rect(bx, chartY + chartH - hBalance, bw, hInterest, "F");
      }

      // X-axis labels – every N years to avoid crowding
      const labelEvery = n <= 10 ? 1 : n <= 20 ? 2 : n <= 30 ? 5 : 10;
      if ((idx + 1) % labelEvery === 0 || idx === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...C.gray500);
        safeText(`Yr ${row.year}`, bx + bw / 2, chartY + chartH + 5, { align: "center" });
      }
    });

    y = chartY + chartH + 10;

    // Chart legend
    doc.setFillColor(...C.violetLt);
    doc.rect(ML, y, 6, 3, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.gray700);
    safeText("Deposited Principal", ML + 8, y + 2.5);

    doc.setFillColor(...C.emerald);
    doc.rect(ML + 52, y, 6, 3, "F");
    safeText("Interest Growth", ML + 60, y + 2.5);

    y += 8;

    // Composition percentage bar
    const total = calculations.finalBalance || 1;
    const depositPct = Math.min(1, (calculations.totalContributions + initialDeposit) / total);
    const interestPct = Math.max(0, 1 - depositPct);

    const compBarX = ML;
    const compBarW = CW;
    const compBarH = 4;

    doc.setFillColor(...C.gray200);
    doc.rect(compBarX, y, compBarW, compBarH, "F");
    doc.setFillColor(...C.violetLt);
    doc.rect(compBarX, y, compBarW * depositPct, compBarH, "F");
    if (interestPct > 0.001) {
      doc.setFillColor(...C.emerald);
      doc.rect(compBarX + compBarW * depositPct, y, compBarW * interestPct, compBarH, "F");
    }

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.gray700);
    safeText(`Principal: ${(depositPct * 100).toFixed(1)}%`, ML, y + 2);
    safeText(`Interest: ${(interestPct * 100).toFixed(1)}%`, ML + CW, y + 2, { align: "right" });

    y += 10;

    /* ═══════════════════════════════════════════════════
       SECTION 4 – YEARLY PROJECTION TABLE
    ═══════════════════════════════════════════════════ */

    // Decide step for filtering (avoid too many rows)
    let step = 1;
    if (years > 25) step = 5;
    else if (years > 12) step = 2;

    const filteredRows = yearlyData.filter(
      (_, idx) => (idx + 1) % step === 0 || idx === yearlyData.length - 1
    );

    // Columns definition – fixed widths that sum to CW (182)
    // Year | Total Deposited | Interest (Net) | Tax | Balance | Real Balance
    const hasTax = taxRate > 0;
    const hasReal = inflationRate > 0;

    // Build columns dynamically
    const cols = [
      { header: "Year",         width: 14,  align: "left"  },
      { header: "Deposited",    width: 37,  align: "right" },
      { header: "Interest Net", width: 37,  align: "right" },
    ];
    if (hasTax)  cols.push({ header: "Tax Paid", width: 32, align: "right" });
    if (hasReal) cols.push({ header: "Real Value", width: 32, align: "right" });
    cols.push({ header: "Balance", width: hasTax || hasReal ? 30 : 46, align: "right" });

    // Normalise widths to exactly CW
    const totalW = cols.reduce((s, c) => s + c.width, 0);
    const scaleFactor = CW / totalW;
    cols.forEach((c) => { c.width = c.width * scaleFactor; });

    ensureSpace(18 + filteredRows.length * 6.5);

    drawSection("Yearly Projection Table");

    // Table header row
    doc.setFillColor(...C.violet);
    doc.rect(ML, y, CW, 6.5, "F");

    let cx = ML;
    cols.forEach((col) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.white);
      const tx = col.align === "right" ? cx + col.width - 1.5 : cx + 1.5;
      safeText(col.header, tx, y + 4.5, { align: col.align === "right" ? "right" : "left" });
      cx += col.width;
    });
    y += 6.5;

    // Table rows
    filteredRows.forEach((row, idx) => {
      ensureSpace(7);

      if (idx % 2 === 0) {
        doc.setFillColor(...C.gray50);
        doc.rect(ML, y, CW, 6.5, "F");
      }

      const vals = [
        `Year ${row.year}`,
        `${currencyCode} ${fmt(row.totalContributions + initialDeposit)}`,
        `${currencyCode} ${fmt(row.interestAccumulated)}`,
      ];
      if (hasTax)  vals.push(`${currencyCode} ${fmt(row.taxAccumulated)}`);
      if (hasReal) vals.push(`${currencyCode} ${fmt(row.realBalance)}`);
      vals.push(`${currencyCode} ${fmt(row.balance)}`);

      cx = ML;
      vals.forEach((val, vi) => {
        const col = cols[vi];
        const isBalance = vi === vals.length - 1;
        const isInterest = vi === 2;

        doc.setFont("helvetica", isBalance ? "bold" : "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(
          ...(isBalance ? C.violet : isInterest ? C.emerald : C.gray700)
        );
        const tx = col.align === "right" ? cx + col.width - 1.5 : cx + 1.5;
        safeText(val, tx, y + 4.5, { align: col.align === "right" ? "right" : "left" });
        cx += col.width;
      });
      y += 6.5;
    });

    /* ─── Final footers on all pages ────────────────── */
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(i, totalPages);
    }

    doc.save(`savings-report-${years}yr.pdf`);
  };

  return (
    <button
      type="button"
      onClick={exportPDF}
      className="px-6 py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold rounded-xl transition-all duration-200 text-sm cursor-pointer shadow-md shadow-violet-500/20 hover:shadow-violet-600/30 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Download PDF Report
    </button>
  );
}
