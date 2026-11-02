import {
  ACCENT_THEMES,
  formatDate,
  formatMoneyPdf,
  getCurrency,
} from "./invoiceData";

function getAccent(settings) {
  return ACCENT_THEMES.find((theme) => theme.value === settings?.accent) || ACCENT_THEMES[0];
}

const INK = [15, 23, 42];
const MUTED = [100, 116, 139];
const LINE = [226, 232, 240];

/**
 * Build a vector PDF invoice (text stays selectable and searchable).
 * @returns {Promise<import("jspdf").jsPDF>}
 */
export async function buildInvoicePdf(invoice, totals) {
  const { jsPDF } = await import("jspdf");
  const accent = getAccent(invoice.settings);
  const paper = invoice.settings?.paper === "letter" ? "letter" : "a4";
  const doc = new jsPDF({ unit: "pt", format: paper, compress: true });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 44;
  const contentW = pageW - margin * 2;
  const currency = getCurrency(invoice.meta?.currency);

  let y = margin;

  const setFont = (size, style = "normal", color = INK) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const text = (value, x, yPos, options = {}) => {
    const { size = 9, style = "normal", color = INK, align = "left" } = options;
    setFont(size, style, color);
    doc.text(String(value ?? ""), x, yPos, { align });
  };

  const wrap = (value, width) => doc.splitTextToSize(String(value ?? ""), width);

  const rule = (x1, yPos, x2, color = LINE, width = 0.6) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(width);
    doc.line(x1, yPos, x2, yPos);
  };

  /* ------------------------------- header -------------------------------- */

  if (invoice.settings?.showLogo && invoice.sender?.logo) {
    try {
      const ratio =
        invoice.sender.logoWidth && invoice.sender.logoHeight
          ? invoice.sender.logoWidth / invoice.sender.logoHeight
          : 3;
      const height = 44;
      const width = Math.min(112, Math.max(28, height * ratio));
      doc.addImage(invoice.sender.logo, "PNG", margin, y, width, height);
      y = margin;
    } catch {
      // A malformed logo must never block the invoice.
    }
  }

  const logoOffset = invoice.settings?.showLogo && invoice.sender?.logo ? 128 : 0;
  const identityX = margin + logoOffset;

  text(invoice.sender?.name || "Your business", identityX, y + 13, {
    size: 15,
    style: "bold",
    color: INK,
  });

  const identityLines = [
    invoice.sender?.address,
    invoice.sender?.email,
    invoice.sender?.phone,
    invoice.sender?.taxId,
  ]
    .filter(Boolean)
    .flatMap((line) => String(line).split("\n"))
    .filter(Boolean);

  let identityY = y + 28;
  identityLines.slice(0, 4).forEach((line) => {
    text(line, identityX, identityY, { size: 8.5, color: MUTED });
    identityY += 10.5;
  });

  const rightX = pageW - margin;
  text("INVOICE", rightX, y + 18, {
    size: 24,
    style: "bold",
    color: accent.pdf,
    align: "right",
  });
  text(`# ${invoice.meta?.number || "—"}`, rightX, y + 33, {
    size: 9.5,
    style: "bold",
    color: INK,
    align: "right",
  });

  const statusLabel = String(invoice.meta?.status || "unpaid").toUpperCase();
  text(statusLabel, rightX, y + 47, { size: 8, style: "bold", color: MUTED, align: "right" });

  y = Math.max(identityY, y + 56) + 12;
  rule(margin, y, pageW - margin, accent.pdf, 2);
  y += 22;

  /* ------------------------------ bill + meta ----------------------------- */

  const columnGap = 28;
  const leftW = contentW * 0.52;
  const rightColX = margin + leftW + columnGap;

  text("BILL TO", margin, y, { size: 8, style: "bold", color: accent.pdf });

  let billY = y + 14;
  text(invoice.client?.name || "Client name", margin, billY, {
    size: 10.5,
    style: "bold",
    color: INK,
  });
  billY += 13;

  [invoice.client?.contact, invoice.client?.address, invoice.client?.email, invoice.client?.phone, invoice.client?.taxId]
    .filter(Boolean)
    .flatMap((line) => String(line).split("\n"))
    .slice(0, 6)
    .forEach((line) => {
      text(line, margin, billY, { size: 8.5, color: MUTED });
      billY += 10.5;
    });

  let metaY = y;
  const metaRow = (label, value) => {
    text(label, rightColX, metaY, { size: 8.5, color: MUTED });
    text(value, pageW - margin, metaY, {
      size: 8.5,
      style: "bold",
      color: INK,
      align: "right",
    });
    metaY += 14;
  };

  metaRow("Issue date", formatDate(invoice.meta?.issueDate, currency.locale));
  metaRow("Due date", formatDate(invoice.meta?.dueDate, currency.locale));
  metaRow("Currency", `${currency.code} — ${currency.label.split("— ")[1] || currency.code}`);
  metaRow(
    "Tax mode",
    invoice.meta?.taxMode === "inclusive"
      ? `Inclusive (${invoice.meta?.taxLabel || "Tax"})`
      : `Exclusive (${invoice.meta?.taxLabel || "Tax"})`,
  );

  y = Math.max(billY, metaY) + 16;

  /* -------------------------------- table -------------------------------- */

  const showTax = Boolean(invoice.settings?.showTax);
  const showDiscount = Boolean(invoice.settings?.showDiscount);
  const rowPadding = invoice.settings?.compact ? 5 : 7;
  const amountW = 76;
  const rateW = 58;
  const taxW = showTax ? 42 : 0;
  const amountX = pageW - margin;
  const rateX = amountX - amountW - 4;
  const taxX = rateX - rateW - 4;
  const qtyX = taxX - taxW;
  const descX = margin + 18;
  const descW = qtyX - descX - 12;

  const drawTableHeader = () => {
    doc.setFillColor(accent.pdfSoft[0], accent.pdfSoft[1], accent.pdfSoft[2]);
    doc.rect(margin, y, contentW, 23, "F");

    text("#", margin + 7, y + 15, { size: 8, style: "bold", color: accent.pdf });
    text("DESCRIPTION", descX, y + 15, { size: 8, style: "bold", color: accent.pdf });
    text("QTY", qtyX, y + 15, { size: 8, style: "bold", color: accent.pdf, align: "right" });
    if (showTax) {
      text("TAX", taxX, y + 15, { size: 8, style: "bold", color: accent.pdf, align: "right" });
    }
    text("RATE", rateX, y + 15, { size: 8, style: "bold", color: accent.pdf, align: "right" });
    text("AMOUNT", amountX, y + 15, { size: 8, style: "bold", color: accent.pdf, align: "right" });
    y += 23;
  };

  drawTableHeader();

  totals.lines.forEach((line, index) => {
    const description = line.description || "Item";
    const descriptionLines = wrap(description, descW);
    const extraLines = [];
    if (showDiscount && line.discountPct > 0) extraLines.push(`Discount ${line.discountPct}%`);

    const lines = [...descriptionLines, ...extraLines];
    const rowH = Math.max(24, lines.length * 10 + rowPadding * 2);

    if (y + rowH > pageH - margin - 170) {
      doc.addPage();
      y = margin;
      drawTableHeader();
    }

    let rowTextY = y + rowPadding + 8;
    descriptionLines.forEach((lineText) => {
      text(lineText, descX, rowTextY, { size: 9, color: INK });
      rowTextY += 10;
    });
    extraLines.forEach((lineText) => {
      text(lineText, descX, rowTextY, { size: 7.5, color: accent.pdf });
      rowTextY += 9;
    });

    text(index + 1, margin + 7, y + rowPadding + 8, { size: 8.5, color: MUTED });
    text(line.qty, qtyX, y + rowPadding + 8, {
      size: 9,
      color: INK,
      align: "right",
    });
    if (showTax) {
      text(line.taxRate > 0 ? `${line.taxRate}%` : "—", taxX, y + rowPadding + 8, {
        size: 8.5,
        color: MUTED,
        align: "right",
      });
    }
    text(formatMoneyPdf(line.rate, invoice), rateX, y + rowPadding + 8, {
      size: 8.5,
      color: MUTED,
      align: "right",
    });
    text(formatMoneyPdf(line.amount, invoice), amountX, y + rowPadding + 8, {
      size: 9,
      style: "bold",
      color: INK,
      align: "right",
    });

    rule(margin, y + rowH, pageW - margin, LINE, 0.5);
    y += rowH;
  });

  y += 14;

  /* -------------------------------- totals -------------------------------- */

  const totalsRows = [{ label: "Subtotal", value: totals.subtotal }];
  if (totals.itemDiscountTotal > 0) {
    totalsRows.push({ label: "Item discounts", value: -totals.itemDiscountTotal });
  }
  if (totals.invoiceDiscount > 0) {
    totalsRows.push({ label: "Invoice discount", value: -totals.invoiceDiscount });
  }
  if (totals.shipping > 0) totalsRows.push({ label: "Shipping", value: totals.shipping });
  if (totals.taxTotal > 0) {
    if (totals.inclusive) {
      totalsRows.push({ label: `Includes ${invoice.meta?.taxLabel || "tax"}`, value: totals.taxTotal });
    } else {
      totals.taxBreakdown.forEach((entry) => {
        totalsRows.push({
          label: `${invoice.meta?.taxLabel || "Tax"} ${entry.rate}%`,
          value: entry.amount,
        });
      });
    }
  }
  if (totals.rounding !== 0) totalsRows.push({ label: "Rounding", value: totals.rounding });

  const totalsBlockH = totalsRows.length * 14 + 76;
  if (y + totalsBlockH > pageH - margin - 90) {
    doc.addPage();
    y = margin;
  }

  const totalsW = 236;
  const totalsX = pageW - margin - totalsW;
  let totalsY = y + 4;

  totalsRows.forEach((row) => {
    text(row.label, totalsX, totalsY, { size: 8.5, color: MUTED });
    text(formatMoneyPdf(row.value, invoice), pageW - margin, totalsY, {
      size: 8.5,
      color: INK,
      align: "right",
    });
    totalsY += 14;
  });

  totalsY += 2;
  rule(totalsX, totalsY, pageW - margin, LINE, 0.7);
  totalsY += 14;

  text("TOTAL", totalsX, totalsY, { size: 9, style: "bold", color: accent.pdf });
  text(formatMoneyPdf(totals.total, invoice), pageW - margin, totalsY, {
    size: 12,
    style: "bold",
    color: accent.pdf,
    align: "right",
  });
  totalsY += 16;

  if (totals.paid > 0) {
    text("Amount paid", totalsX, totalsY, { size: 8.5, color: MUTED });
    text(`- ${formatMoneyPdf(totals.paid, invoice)}`, pageW - margin, totalsY, {
      size: 8.5,
      color: INK,
      align: "right",
    });
    totalsY += 14;
  }

  if (totals.paid > 0 || totals.balance !== totals.total) {
    const balanceTone = totals.balance > 0 ? accent.pdf : [5, 150, 105];
    doc.setFillColor(accent.pdfSoft[0], accent.pdfSoft[1], accent.pdfSoft[2]);
    doc.roundedRect(totalsX, totalsY - 2, totalsW, 22, 4, 4, "F");
    text("BALANCE DUE", totalsX + 8, totalsY + 12, {
      size: 8.5,
      style: "bold",
      color: balanceTone,
    });
    text(formatMoneyPdf(totals.balance, invoice), pageW - margin - 8, totalsY + 12, {
      size: 10,
      style: "bold",
      color: balanceTone,
      align: "right",
    });
    totalsY += 28;
  }

  y = totalsY + 8;

  /* --------------------------- payment and notes ------------------------- */

  const payment = invoice.payment || {};
  const paymentEntries = [
    ["Bank", payment.bankName],
    ["Account name", payment.accountName],
    ["Account number", payment.accountNumber],
    ["SWIFT / BIC", payment.swift],
    ["IBAN", payment.iban],
    ["Payment link", payment.link],
  ].filter(([, value]) => String(value || "").trim());

  const needsPayment = invoice.settings?.showPayment && paymentEntries.length > 0;

  if (needsPayment || invoice.notes || invoice.terms) {
    if (y > pageH - margin - 150) {
      doc.addPage();
      y = margin;
    }

    const blockTop = y;

    if (needsPayment) {
      text("PAYMENT DETAILS", margin, y, { size: 8, style: "bold", color: accent.pdf });
      y += 14;
      paymentEntries.forEach(([label, value]) => {
        text(label, margin, y, { size: 8.5, color: MUTED });
        const valueLines = wrap(value, 190);
        text(valueLines[0], margin + 88, y, { size: 8.5, color: INK });
        valueLines.slice(1).forEach((line) => {
          y += 10.5;
          text(line, margin + 88, y, { size: 8.5, color: INK });
        });
        y += 12;
      });
      if (payment.notes) {
        const noteLines = wrap(payment.notes, contentW * 0.55);
        noteLines.forEach((line) => {
          text(line, margin, y, { size: 7.5, color: MUTED });
          y += 9.5;
        });
      }
    }

    if (invoice.notes || invoice.terms) {
      let noteY = blockTop;
      const noteX = pageW / 2 + 10;
      const noteW = contentW / 2 - 10;

      if (invoice.notes) {
        text("NOTES", noteX, noteY, { size: 8, style: "bold", color: accent.pdf });
        noteY += 13;
        wrap(invoice.notes, noteW)
          .slice(0, 8)
          .forEach((line) => {
            text(line, noteX, noteY, { size: 8, color: MUTED });
            noteY += 10;
          });
        noteY += 6;
      }

      if (invoice.terms) {
        if (noteY > pageH - margin - 60) {
          doc.addPage();
          noteY = margin;
        }
        text("TERMS", noteX, noteY, { size: 8, style: "bold", color: accent.pdf });
        noteY += 13;
        wrap(invoice.terms, noteW)
          .slice(0, 10)
          .forEach((line) => {
            text(line, noteX, noteY, { size: 8, color: MUTED });
            noteY += 10;
          });
      }
    }
  }

  /* -------------------------------- footer -------------------------------- */

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const footerY = pageH - 26;
    rule(margin, footerY - 10, pageW - margin, LINE, 0.5);
    text(
      `${invoice.sender?.name || "ToolsTrek"} · Invoice ${invoice.meta?.number || ""} · Generated with ToolsTrek`,
      margin,
      footerY,
      { size: 7.5, color: MUTED },
    );
    text(`Page ${page} of ${pageCount}`, pageW - margin, footerY, {
      size: 7.5,
      color: MUTED,
      align: "right",
    });
  }

  return doc;
}

export async function invoicePdfBlob(invoice, totals) {
  const doc = await buildInvoicePdf(invoice, totals);
  return doc.output("blob");
}

export function invoicePdfFileName(invoice) {
  const safe = String(invoice.meta?.number || "invoice")
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${safe || "invoice"}.pdf`;
}
