"use client";
import React from "react";
import { jsPDF } from "jspdf";
import { formatCurrency } from "./VatResultCard";

export default function PdfExportButton({
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
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const ML = 14, MR = 14;
    const CW = PW - ML - MR;

    const C = {
      violet: [109, 40, 217],
      violetBg: [245, 243, 255],
      violetLt: [196, 181, 253],
      gray900: [17, 24, 39],
      gray700: [55, 65, 81],
      gray500: [107, 114, 128],
      gray200: [229, 231, 235],
      gray100: [243, 244, 246],
      gray50: [249, 250, 251],
      white: [255, 255, 255],
      emerald: [4, 120, 87],
      rose: [225, 29, 72],
    };

    let yPos = 0;

    // Draw header block
    doc.setFillColor(...C.violet);
    doc.rect(0, 0, PW, 32, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.white);
    doc.text("VAT / GST Calculation Report", ML, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.violetLt);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      ML,
      22
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.white);
    doc.text("toolstrek.vercel.app", PW - MR, 13, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.violetLt);
    doc.text("Free Professional Tools", PW - MR, 22, { align: "right" });

    yPos = 44;

    // Section Helper
    const drawSection = (label) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.violet);
      doc.text(label, ML, yPos);
      yPos += 1.5;
      doc.setDrawColor(...C.violetLt);
      doc.setLineWidth(0.4);
      doc.line(ML, yPos, ML + CW, yPos);
      doc.setLineWidth(0.1);
      yPos += 6;
    };

    // Formatter (formats number cleanly without Unicode symbol and appends currency code)
    const fmtPDF = (val) => {
      const formatted = formatCurrency(val, "", decimals, useSeparator);
      return `${formatted} ${currencyCode}`;
    };

    // Calculate Input Amount from mode and reverseCalc
    let inputAmount = originalAmount;
    if (mode === "add") {
      inputAmount = reverseCalc ? finalAmount : originalAmount;
    } else if (mode === "remove") {
      inputAmount = reverseCalc ? originalAmount : finalAmount;
    }

    // Section 1: Parameters
    drawSection("Calculation Information");

    let calcTypeStr = "Add Tax Mode";
    if (mode === "remove") calcTypeStr = "Remove Tax Mode";
    else if (mode === "only") calcTypeStr = "Tax Amount Only Mode";

    if (reverseCalc && mode !== "only") {
      calcTypeStr += " (Reverse)";
    }

    const infoGrid = [
      [["Country Preset", countryName], ["Calculation Mode", calcTypeStr]],
      [["Input Amount", fmtPDF(inputAmount)], ["VAT / GST Rate", `${taxRate}%`]],
      [["Currency Code", currencyCode], ["Reverse Calc", reverseCalc ? "Enabled" : "Disabled"]],
    ];

    const kL = ML + 2;
    const vL = ML + 36;
    const kM = ML + CW / 2 + 2;
    const vM = ML + CW / 2 + 38;

    infoGrid.forEach(([left, right]) => {
      [[left, kL, vL], [right, kM, vM]].forEach(([[lbl, val], kx, vx]) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...C.gray500);
        doc.text(lbl, kx, yPos);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.gray900);
        doc.text(val, vx, yPos);
      });
      yPos += 8;
    });

    yPos += 4;

    // Section 2: Results
    drawSection("Calculation Results");

    const results = [
      ["Base Price (Tax Exclusive)", fmtPDF(originalAmount)],
      [`Tax Portion (${taxRate}%)`, fmtPDF(taxAmount)],
      ["Total Price (Tax Inclusive)", fmtPDF(finalAmount)],
    ];

    results.forEach(([lbl, val], idx) => {
      // Background shading for results rows
      if (idx % 2 === 1) {
        doc.setFillColor(...C.gray50);
        doc.rect(ML, yPos - 3.5, CW, 7, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.gray700);
      doc.text(lbl, ML + 2, yPos + 1.5);

      doc.setFont("helvetica", "bold");
      if (idx === 1) {
        doc.setTextColor(...C.rose);
      } else if (idx === 2) {
        doc.setTextColor(...C.emerald);
      } else {
        doc.setTextColor(...C.gray900);
      }
      doc.text(val, PW - MR - 2, yPos + 1.5, { align: "right" });
      yPos += 7.5;
    });

    yPos += 8;

    // Section 3: Visual Repayment/Tax Bar
    drawSection("Price Composition");

    const total = finalAmount || 1;
    const basePct = originalAmount / total;
    const taxPct = taxAmount / total;

    // Background bar
    const barX = ML + 2;
    const barW = CW - 4;
    const barH = 4;
    const barY = yPos;

    doc.setFillColor(...C.gray200);
    doc.rect(barX, barY, barW, barH, "F");

    // Base segment
    if (basePct > 0.001) {
      doc.setFillColor(...C.violet);
      doc.rect(barX, barY, barW * basePct, barH, "F");
    }
    // Tax segment
    if (taxPct > 0.001) {
      doc.setFillColor(...C.rose);
      doc.rect(barX + barW * basePct, barY, barW * taxPct, barH, "F");
    }

    yPos += 12;

    // Legend
    doc.setFillColor(...C.violet);
    doc.circle(ML + 4, yPos, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.gray700);
    doc.text(`Base Price: ${(basePct * 100).toFixed(1)}%`, ML + 8, yPos + 1);

    doc.setFillColor(...C.rose);
    doc.circle(ML + 54, yPos, 1.5, "F");
    doc.text(`Tax Portion: ${(taxPct * 100).toFixed(1)}%`, ML + 58, yPos + 1);

    // Footer (ASCII characters to prevent rendering artifacts)
    doc.setFillColor(...C.gray100);
    doc.rect(0, PH - 12, PW, 12, "F");
    doc.setDrawColor(...C.violetLt);
    doc.setLineWidth(0.35);
    doc.line(0, PH - 12, PW, PH - 12);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.gray500);
    doc.text(`Copyright ${new Date().getFullYear()} ToolsTrek | Generated by Toolstrek`, ML, PH - 4.5);
    doc.text("Page 1 of 1", PW - MR, PH - 4.5, { align: "right" });

    doc.save("vat-gst-calculation-report.pdf");
  };

  return (
    <button
      type="button"
      onClick={exportPDF}
      className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all duration-200 text-sm cursor-pointer shadow-md shadow-violet-500/20 hover:shadow-violet-600/30 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Download PDF
    </button>
  );
}
