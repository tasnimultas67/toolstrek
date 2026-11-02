"use client";

import React from "react";
import {
  ACCENT_THEMES,
  STATUS_STYLES,
  formatDate,
  formatMoney,
  getCurrency,
} from "./invoiceData";

function TotalsRow({ label, value, tone = "muted", bold = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className={
          bold
            ? "text-sm font-extrabold text-slate-900"
            : tone === "muted"
              ? "text-sm text-slate-500"
              : "text-sm font-semibold text-slate-700"
        }
      >
        {label}
      </span>
      <span
        className={`shrink-0 text-sm tabular-nums ${
          bold ? "font-extrabold text-slate-900" : "font-semibold text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function InvoicePreview({ invoice, totals }) {
  const accent = ACCENT_THEMES.find((theme) => theme.value === invoice.settings?.accent) || ACCENT_THEMES[0];
  const currency = getCurrency(invoice.meta?.currency);
  const status = STATUS_STYLES[invoice.meta?.status] || STATUS_STYLES.unpaid;
  const modern = invoice.settings?.template !== "classic";
  const showTax = Boolean(invoice.settings?.showTax);
  const showUnit = Boolean(invoice.settings?.showUnit);
  const showDiscount = Boolean(invoice.settings?.showDiscount);
  const compact = Boolean(invoice.settings?.compact);
  const showPayment = Boolean(invoice.settings?.showPayment);

  const paymentRows = [
    ["Bank", invoice.payment?.bankName],
    ["Account name", invoice.payment?.accountName],
    ["Account number", invoice.payment?.accountNumber],
    ["SWIFT / BIC", invoice.payment?.swift],
    ["IBAN", invoice.payment?.iban],
    ["Payment link", invoice.payment?.link],
  ].filter(([, value]) => String(value || "").trim());

  return (
    <article
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-900/5"
      aria-label="Live invoice preview"
    >
      {modern && <div className="h-2 w-full" style={{ backgroundColor: accent.hex }} />}

      <div className={compact ? "p-4 sm:p-6" : "p-5 sm:p-7"}>
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-3">
            {invoice.settings?.showLogo && invoice.sender?.logo && (
              // eslint-disable-next-line @next/next/no-img-element -- locally generated data URL
              <img
                src={invoice.sender.logo}
                alt="Business logo"
                className="h-12 w-auto max-w-28 shrink-0 object-contain"
              />
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-black leading-tight tracking-tight">
                {invoice.sender?.name || "Your business"}
              </h2>
              <div className="mt-1 space-y-0.5 text-sm leading-snug text-slate-500">
                {String(invoice.sender?.address || "")
                  .split("\n")
                  .filter(Boolean)
                  .map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                {invoice.sender?.email && <p>{invoice.sender.email}</p>}
                {invoice.sender?.phone && <p>{invoice.sender.phone}</p>}
                {invoice.sender?.taxId && <p>{invoice.sender.taxId}</p>}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p
              className="text-2xl font-black leading-none tracking-tight sm:text-3xl"
              style={{ color: accent.hex }}
            >
              INVOICE
            </p>
            <p className="mt-1.5 text-sm font-bold">#{invoice.meta?.number || "—"}</p>
            <span
              className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold ring-1 ring-inset ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </header>

        {modern ? (
          <div
            className="mt-5 grid grid-cols-2 gap-3 rounded-xl p-3.5 sm:grid-cols-4"
            style={{ backgroundColor: accent.soft }}
          >
            <div>
              <p className="text-sm font-semibold text-slate-500">Issue date</p>
              <p className="mt-0.5 text-sm font-bold">{formatDate(invoice.meta?.issueDate, currency.locale)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Due date</p>
              <p className="mt-0.5 text-sm font-bold">{formatDate(invoice.meta?.dueDate, currency.locale)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Currency</p>
              <p className="mt-0.5 text-sm font-bold">{currency.code}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{invoice.meta?.taxLabel || "Tax"} mode</p>
              <p className="mt-0.5 text-sm font-bold capitalize">
                {invoice.meta?.taxMode === "inclusive" ? "Included" : "Added"}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="mt-5 grid grid-cols-2 gap-3 border-y py-3 sm:grid-cols-4"
            style={{ borderColor: accent.border }}
          >
            <div>
              <p className="text-sm font-semibold text-slate-500">Issued</p>
              <p className="text-sm font-bold">{formatDate(invoice.meta?.issueDate, currency.locale)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Due</p>
              <p className="text-sm font-bold">{formatDate(invoice.meta?.dueDate, currency.locale)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Currency</p>
              <p className="text-sm font-bold">{currency.code}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Reference</p>
              <p className="text-sm font-bold">{invoice.meta?.number || "—"}</p>
            </div>
          </div>
        )}

        {/* Bill to */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide" style={{ color: accent.hex }}>
              Bill to
            </p>
            <p className="mt-1.5 text-sm font-black">{invoice.client?.name || "Client name"}</p>
            {invoice.client?.contact && (
              <p className="text-sm text-slate-500">Attn: {invoice.client.contact}</p>
            )}
            <div className="mt-0.5 space-y-0.5 text-sm leading-snug text-slate-500">
              {String(invoice.client?.address || "")
                .split("\n")
                .filter(Boolean)
                .map((line) => (
                  <p key={line}>{line}</p>
                ))}
              {invoice.client?.email && <p>{invoice.client.email}</p>}
              {invoice.client?.phone && <p>{invoice.client.phone}</p>}
              {invoice.client?.taxId && <p>{invoice.client.taxId}</p>}
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-sm font-extrabold uppercase tracking-wide" style={{ color: accent.hex }}>
              Amount due
            </p>
            <p className="mt-1.5 text-2xl font-black tabular-nums" style={{ color: accent.hex }}>
              {formatMoney(totals.balance, invoice)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {invoice.meta?.status === "paid" || totals.balance <= 0
                ? "Paid in full — thank you."
                : `Due by ${formatDate(invoice.meta?.dueDate, currency.locale)}`}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: accent.soft, color: accent.hex }}>
                <th className="px-2 py-2.5 text-left font-extrabold">#</th>
                <th className="px-2 py-2.5 text-left font-extrabold">Description</th>
                <th className="hidden px-2 py-2.5 text-right font-extrabold sm:table-cell">Qty</th>
                <th className="hidden px-2 py-2.5 text-right font-extrabold sm:table-cell">Rate</th>
                {showTax && (
                  <th className="hidden px-2 py-2.5 text-right font-extrabold md:table-cell">Tax</th>
                )}
                <th className="px-2 py-2.5 text-right font-extrabold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {totals.lines.map((line, index) => (
                <tr key={line.id} className="align-top">
                  <td className="px-2 py-2.5 text-slate-400">{index + 1}</td>
                  <td className="px-2 py-2.5">
                    <p className="font-semibold">{line.description || "Item"}</p>
                    <p className="text-slate-500 sm:hidden">
                      {line.qty}
                      {showUnit && line.unit ? ` ${line.unit}` : ""} × {formatMoney(line.rate, invoice)}
                    </p>
                    {showDiscount && line.discountPct > 0 && (
                      <p className="text-slate-500">Discount {line.discountPct}%</p>
                    )}
                  </td>
                  <td className="hidden px-2 py-2.5 text-right tabular-nums text-slate-600 sm:table-cell">
                    {line.qty}
                    {showUnit && line.unit ? ` ${line.unit}` : ""}
                  </td>
                  <td className="hidden px-2 py-2.5 text-right tabular-nums text-slate-600 sm:table-cell">
                    {formatMoney(line.rate, invoice)}
                  </td>
                  {showTax && (
                    <td className="hidden px-2 py-2.5 text-right tabular-nums text-slate-500 md:table-cell">
                      {line.taxRate > 0 ? `${line.taxRate}%` : "—"}
                    </td>
                  )}
                  <td className="px-2 py-2.5 text-right font-bold tabular-nums">
                    {formatMoney(line.amount, invoice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-full space-y-1.5 sm:w-80">
            <TotalsRow label="Subtotal" value={formatMoney(totals.subtotal, invoice)} />
            {totals.itemDiscountTotal > 0 && (
              <TotalsRow
                label="Item discounts"
                value={`- ${formatMoney(totals.itemDiscountTotal, invoice)}`}
              />
            )}
            {totals.invoiceDiscount > 0 && (
              <TotalsRow
                label="Invoice discount"
                value={`- ${formatMoney(totals.invoiceDiscount, invoice)}`}
              />
            )}
            {totals.shipping > 0 && (
              <TotalsRow label="Shipping" value={formatMoney(totals.shipping, invoice)} />
            )}
            {totals.taxTotal > 0 &&
              (totals.inclusive ? (
                <TotalsRow
                  label={`Includes ${invoice.meta?.taxLabel || "tax"}`}
                  value={formatMoney(totals.taxTotal, invoice)}
                />
              ) : (
                totals.taxBreakdown.map((entry) => (
                  <TotalsRow
                    key={entry.rate}
                    label={`${invoice.meta?.taxLabel || "Tax"} ${entry.rate}%`}
                    value={formatMoney(entry.amount, invoice)}
                  />
                ))
              ))}
            {totals.rounding !== 0 && (
              <TotalsRow label="Rounding" value={formatMoney(totals.rounding, invoice)} />
            )}
            <div className="border-t border-slate-200 pt-2">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-extrabold">Total</span>
                <span className="text-base font-black tabular-nums">
                  {formatMoney(totals.total, invoice)}
                </span>
              </div>
            </div>
            {totals.paid > 0 && (
              <TotalsRow label="Amount paid" value={`- ${formatMoney(totals.paid, invoice)}`} />
            )}
            <div
              className="mt-1 flex items-baseline justify-between gap-4 rounded-lg px-2.5 py-2"
              style={{ backgroundColor: accent.soft }}
            >
              <span className="text-sm font-extrabold" style={{ color: accent.hex }}>
                Balance due
              </span>
              <span className="text-base font-black tabular-nums" style={{ color: accent.hex }}>
                {formatMoney(totals.balance, invoice)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment + notes */}
        {(showPayment && paymentRows.length > 0) || invoice.notes || invoice.terms ? (
          <div className="mt-6 grid gap-5 border-t border-slate-200 pt-4 sm:grid-cols-2">
            {showPayment && paymentRows.length > 0 && (
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide" style={{ color: accent.hex }}>
                  Payment details
                </p>
                <dl className="mt-1.5 space-y-1">
                  {paymentRows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[auto_1fr] gap-2 text-sm">
                      <dt className="font-semibold text-slate-500">{label}</dt>
                      <dd className="break-words text-slate-700">{value}</dd>
                    </div>
                  ))}
                </dl>
                {invoice.payment?.notes && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{invoice.payment.notes}</p>
                )}
              </div>
            )}

            <div className="space-y-3">
              {invoice.notes && (
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide" style={{ color: accent.hex }}>
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide" style={{ color: accent.hex }}>
                    Terms
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-sm text-slate-400">
          <span>Thank you for your business.</span>
          <span>Created with ToolsTrek</span>
        </footer>
      </div>
    </article>
  );
}
