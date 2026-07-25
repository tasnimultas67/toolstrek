"use client";
import React from "react";
import { jsPDF } from "jspdf";

export default function WeddingPdfExport({
  totalBudget,
  guestCount,
  selectedProfileName,
  currencyCode,
  currencySymbol,
  categories,
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
      rose:      [225, 29,  72],    // Primary theme (wedding-themed pink/rose)
      roseMid:   [244, 63,  94],
      roseLt:    [253, 244, 245],
      roseBorder:[251, 207, 214],
      emerald:   [5,   150, 105],
      emeraldLt: [209, 250, 229],
      slate900:  [15,  23,  42],
      slate700:  [51,  65,  85],
      slate500:  [100, 116, 139],
      slate300:  [203, 213, 225],
      slate200:  [226, 232, 240],
      slate100:  [241, 245, 249],
      white:     [255, 255, 255],
    };

    let y = 0; // running Y cursor

    /* ─── Safe text helper – clips at right margin ───── */
    const safeText = (text, x, yy, opts = {}) => {
      try {
        const str = String(text ?? "");
        doc.text(str, x, yy, opts);
      } catch (e) {
        console.error("jsPDF text rendering error:", e);
      }
    };

    /* ─── Safe Currency Symbol Resolver for Helvetica ── */
    const getSafeSymbol = () => {
      if (currencyCode === "BDT") return "TK ";
      if (currencyCode === "INR") return "Rs ";
      if (["USD", "CAD", "AUD"].includes(currencyCode)) return "$";
      if (currencyCode === "EUR") return "EUR ";
      if (currencyCode === "GBP") return "£";
      if (currencyCode === "JPY") return "¥";
      return currencyCode + " ";
    };
    const safeSymbol = getSafeSymbol();

    /* ─── Formatters ─────────────────────────────────── */
    const fmt = (val) =>
      Number(val).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    const fmtFull = (val) =>
      `${safeSymbol}${Number(val).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    // Calculate aggregated totals
    let totalAllocated = 0;
    let totalSpent = 0;
    
    categories.forEach(cat => {
      const isCatActive = cat.active !== false;
      if (isCatActive) {
        const catEst = (totalBudget * (cat.percentage / 100));
        totalAllocated += catEst;
        cat.items.forEach(item => {
          totalSpent += parseFloat(item.actual) || 0;
        });
      }
    });

    const remainingBudget = totalBudget - totalSpent;
    const overallVariance = totalBudget - totalSpent; // Positive is under, negative is over
    const costPerGuest = guestCount > 0 ? totalBudget / guestCount : 0;

    /* ═══════════════════════════════════════════════════
       HEADER BANNER
       ═══════════════════════════════════════════════════ */
    doc.setFillColor(...C.rose);
    doc.rect(0, 0, PW, 34, "F");

    // Accent stripe
    doc.setFillColor(...C.roseMid);
    doc.rect(0, 30, PW, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...C.white);
    safeText("Wedding Budget Allocation & Planner", ML, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.roseLt);
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
    doc.setTextColor(...C.roseLt);
    safeText("Wedding Budget Allocator & Planner", PW - MR, 23, { align: "right" });

    y = 44;

    /* ─── Section heading ─────────────────────────────── */
    const drawSection = (title) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...C.rose);
      safeText(title, ML, y);
      y += 1.5;
      doc.setDrawColor(...C.roseBorder);
      doc.setLineWidth(0.4);
      doc.line(ML, y, ML + CW, y);
      doc.setLineWidth(0.1);
      y += 5.5;
    };

    /* ─── Footer helper ──────────────────────────────── */
    const drawFooter = (pageNum, totalPages) => {
      doc.setFillColor(...C.slate100);
      doc.rect(0, PH - 12, PW, 12, "F");
      doc.setDrawColor(...C.slate200);
      doc.setLineWidth(0.3);
      doc.line(0, PH - 12, PW, PH - 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.slate500);
      safeText(
        `Copyright ${new Date().getFullYear()} ToolsTrek  |  Wedding Budget Planner`,
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
       SECTION 1 – SUMMARY HIGHLIGHTS (2-column layout)
       ═══════════════════════════════════════════════════ */
    drawSection("Wedding Overview");

    // Build overview rows as two columns side by side
    const col1X = ML;
    const col2X = ML + CW / 2 + 4;
    const overviewRows = [
      ["Total Budget",           fmtFull(totalBudget),    "Priority Preset Profile", selectedProfileName],
      ["Estimated Guest Count",  `${guestCount} guests`,  "Total Spent (Actual)",    fmtFull(totalSpent)],
      ["Cost per Guest",         fmtFull(costPerGuest),   "Remaining Buffer",        fmtFull(remainingBudget)],
    ];

    const rowBaseY = y;
    overviewRows.forEach((row, rowIdx) => {
      const rowY = rowBaseY + rowIdx * 7;

      // Left column label + value
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.slate500);
      safeText(row[0] + ":", col1X, rowY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.slate900);
      safeText(row[1], col1X + 48, rowY);

      // Right column label + value
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.slate500);
      safeText(row[2] + ":", col2X, rowY);
      doc.setFont("helvetica", "bold");
      // Color remaining budget green/red
      if (rowIdx === 2) {
        doc.setTextColor(...(remainingBudget < 0 ? [220, 38, 38] : C.emerald));
      } else {
        doc.setTextColor(...C.slate900);
      }
      safeText(row[3], col2X + 48, rowY);
    });

    y = rowBaseY + overviewRows.length * 7 + 6;


    /* ═══════════════════════════════════════════════════
       SECTION 2 – KEY BUDGET SUMMARY CARDS
       ═══════════════════════════════════════════════════ */
    ensureSpace(25);
    // Draw 4 cards: Total, Allocated, Spent, Variance
    const cardW = (CW - 9) / 4;
    const cardH = 16;
    const cardData = [
      { label: "Target Budget", val: fmtFull(totalBudget), col: C.slate900 },
      { label: "Total Estimated", val: fmtFull(totalAllocated), col: C.slate700 },
      { label: "Total Actual Spent", val: fmtFull(totalSpent), col: C.slate700 },
      {
        label: "Overall Variance",
        val: (overallVariance >= 0 ? "+" : "") + fmtFull(overallVariance),
        col: overallVariance >= 0 ? C.emerald : [220, 38, 38]
      }
    ];

    let cx = ML;
    cardData.forEach((card) => {
      doc.setFillColor(...C.slate100);
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, "F");
      doc.setDrawColor(...C.slate200);
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, "D");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.slate500);
      safeText(card.label, cx + 3, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...card.col);
      safeText(card.val, cx + 3, y + 10.5);

      cx += cardW + 3;
    });

    y += cardH + 8;

    /* ═══════════════════════════════════════════════════
       SECTION 3 – DETAILED BUDGET BY CATEGORY
       ═══════════════════════════════════════════════════ */
    ensureSpace(20);
    drawSection("Category & Sub-item Details");

    // Table Header
    const colConfig = [
      { name: "Item / Category Name", width: 82, align: "left" },
      { name: "Target %", width: 22, align: "right" },
      { name: "Estimated", width: 26, align: "right" },
      { name: "Actual Spent", width: 26, align: "right" },
      { name: "Variance", width: 26, align: "right" },
    ];

    const drawTableHeader = () => {
      doc.setFillColor(...C.rose);
      doc.rect(ML, y, CW, 7, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.white);

      let headerCx = ML;
      colConfig.forEach((col) => {
        const tx = col.align === "right" ? headerCx + col.width - 1.5 : headerCx + 1.5;
        safeText(col.name, tx, y + 4.5, { align: col.align === "right" ? "right" : "left" });
        headerCx += col.width;
      });
      y += 7;
    };

    drawTableHeader();

    categories.forEach((cat) => {
      if (cat.active === false) return; // Skip inactive categories

      // ── Compute cat-level estimate from budget & percentage ──
      const catEst = totalBudget * (cat.percentage / 100);

      // ── Compute item-level estimated splits ──
      const sumShares = cat.items.reduce(
        (acc, it) => acc + (parseFloat(it.estimateShare) || 0), 0
      );

      // ── Category Actual Total ──
      let catActual = 0;
      cat.items.forEach((item) => {
        catActual += parseFloat(item.actual) || 0;
      });

      const catVariance = catEst - catActual;

      ensureSpace(20);

      // ── Category Header Row ──
      doc.setFillColor(...C.roseLt);
      doc.rect(ML, y, CW, 6.5, "F");
      doc.setDrawColor(...C.roseBorder);
      doc.setLineWidth(0.3);
      doc.line(ML, y, ML + CW, y);
      doc.line(ML, y + 6.5, ML + CW, y + 6.5);
      doc.setLineWidth(0.1);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.rose);
      safeText(cat.name, ML + 1.5, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.slate900);
      safeText(`${cat.percentage.toFixed(1)}%`,    ML + 82 + 22 - 1.5,             y + 4.5, { align: "right" });
      safeText(fmtFull(catEst),                    ML + 82 + 22 + 26 - 1.5,        y + 4.5, { align: "right" });
      safeText(fmtFull(catActual),                 ML + 82 + 22 + 26 + 26 - 1.5,  y + 4.5, { align: "right" });
      doc.setTextColor(...(catVariance < 0 ? [220, 38, 38] : catVariance > 0 ? C.emerald : C.slate500));
      safeText(fmtFull(catVariance),               ML + 82 + 22 + 26 + 26 + 26 - 1.5, y + 4.5, { align: "right" });

      y += 6.5;

      // ── Sub-item Rows ──
      cat.items.forEach((item, itemIdx) => {
        // Compute item estimate dynamically from its share of catEst
        const shareRatio = sumShares > 0
          ? (parseFloat(item.estimateShare) || 0) / sumShares
          : 1 / Math.max(1, cat.items.length);
        const itemEst = catEst * shareRatio;
        const itemAct = parseFloat(item.actual) || 0;
        const itemVar = itemEst - itemAct;

        // New page guard – redraw table header if page breaks
        const didBreak = ensureSpace(6);
        if (didBreak) {
          drawTableHeader();
        }

        // Zebra stripe
        if (itemIdx % 2 === 1) {
          doc.setFillColor(...C.slate100);
          doc.rect(ML, y, CW, 5.5, "F");
        }
        doc.setDrawColor(...C.slate200);
        doc.setLineWidth(0.1);
        doc.line(ML, y + 5.5, ML + CW, y + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.slate700);
        safeText(`\u2022  ${item.name}`, ML + 3, y + 3.8);

        safeText(fmtFull(itemEst), ML + 82 + 22 + 26 - 1.5,        y + 3.8, { align: "right" });
        safeText(fmtFull(itemAct), ML + 82 + 22 + 26 + 26 - 1.5,  y + 3.8, { align: "right" });
        doc.setTextColor(...(itemVar < 0 ? [220, 38, 38] : itemVar > 0 ? C.emerald : C.slate500));
        safeText(fmtFull(itemVar), ML + 82 + 22 + 26 + 26 + 26 - 1.5, y + 3.8, { align: "right" });

        y += 5.5;
      });

      y += 3; // spacer between categories
    });

    /* ─── Word-wrap helper ───────────────────────────────── */
    const drawWrapped = (text, x, maxW, lineH = 4.2) => {
      doc.setFontSize(7.5);
      const lines = doc.splitTextToSize(String(text), maxW);
      lines.forEach((line) => {
        ensureSpace(lineH + 1);
        safeText(line, x, y);
        y += lineH;
      });
    };

    /* ═══════════════════════════════════════════════════
       SECTION 4 – FORMULAS & PRO TIPS
       ═══════════════════════════════════════════════════ */
    ensureSpace(50);
    y += 4;
    drawSection("Budgeting Formulas & Advice");

    /* ── Formulas ─────────────────────────────────────── */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.rose);
    safeText("Mathematical Formulas", ML, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.slate700);

    const formulas = [
      "Category Estimate  =  Total Budget x (Category Target % / 100)",
      "Item Estimate  =  Category Estimate x (Item Share % / Sum of All Item Shares %)",
      "Cost per Guest  =  Total Budget / Guest Count",
      "Variance  =  Estimated Amount - Actual Spent   (Positive = Under Budget | Negative = Over Budget)",
    ];
    formulas.forEach((f) => {
      doc.setFontSize(7.5);
      const lines = doc.splitTextToSize(f, CW - 6);
      lines.forEach((line) => {
        ensureSpace(5);
        safeText(line, ML + 3, y);
        y += 4;
      });
      y += 1;
    });

    y += 4;

    /* ── Pro Tips ─────────────────────────────────────── */
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.slate900);
    safeText("Pro Wedding Budgeting Tips", ML, y);
    y += 5;

    const tips = [
      {
        num: "1", title: "Always Keep a Buffer",
        body: "Set aside at least 5-10% as an Emergency Buffer. Service charges, overtime fees, vendor tips, and sales tax can easily inflate your bill by 15-20% over the contracted amount."
      },
      {
        num: "2", title: "Prioritize Your Top 2-3 Items",
        body: "Decide what matters most — venue, photos, or music — and allocate heavily there. Cut back on items that matter less to you personally."
      },
      {
        num: "3", title: "Guest Count is the Biggest Lever",
        body: "Food, catering, venue seating, favors, and cards scale directly with guest count. Trimming 20 guests can save TK 40,000 - TK 1,00,000 depending on your venue and menu."
      },
      {
        num: "4", title: "Book Vendors Early & Get Quotes in Writing",
        body: "Top venues and photographers book 12-18 months in advance. Always get itemized written contracts before committing any budget line."
      },
      {
        num: "5", title: "Track Actuals from Day One",
        body: "Enter actual costs as soon as deposits are paid. Early variance tracking lets you reallocate funds before you run out — not after."
      },
    ];

    tips.forEach((tip) => {
      ensureSpace(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.rose);
      safeText(`${tip.num}. ${tip.title}`, ML, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.slate700);
      drawWrapped(tip.body, ML + 4, CW - 4);
      y += 2;
    });

    /* ─── Final footers on all pages ────────────────── */
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(i, totalPages);
    }

    doc.save(`wedding_budget_report_${selectedProfileName.toLowerCase().replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={exportPDF}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 dark:bg-rose-500 dark:hover:bg-rose-600 dark:active:bg-rose-700 text-white font-medium rounded-xl transition-all duration-200 text-sm cursor-pointer shadow-md shadow-rose-500/10 hover:shadow-rose-600/20"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export PDF Report
    </button>
  );
}
