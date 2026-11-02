"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  Building2,
  CheckCircle2,
  Copy,
  Download,
  FileJson,
  FileUp,
  ImagePlus,
  Landmark,
  Layers3,
  ListPlus,
  Loader2,
  Palette,
  Printer,
  ReceiptText,
  RotateCcw,
  Settings2,
  Trash2,
  User2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  FaqAccordion,
  Field,
  Hero,
  SectionCard,
  Segmented,
  Stat,
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import InvoicePreview from "./InvoicePreview";
import { invoicePdfBlob, invoicePdfFileName } from "./invoicePdf";
import {
  ACCENT_THEMES,
  CURRENCIES,
  INVOICE_FAQS,
  PAPERS,
  PAYMENT_TERM_DAYS,
  ROUNDING_OPTIONS,
  STATUS_OPTIONS,
  TEMPLATES,
  addDaysISO,
  calcInvoice,
  formatDate,
  formatMoney,
  invoiceToJson,
  makeDefaultInvoice,
  makeItem,
  nextInvoiceNumber,
  normalizeInvoice,
  todayISO,
} from "./invoiceData";

const DRAFT_KEY = "toolstrek_invoice_draft_v1";

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function MiniTotal({ label, value, strong = false, negative = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className={strong ? "font-extrabold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}>
        {label}
      </span>
      <span
        className={`shrink-0 tabular-nums ${
          strong
            ? "text-base font-black text-slate-900 dark:text-white"
            : negative
              ? "font-semibold text-rose-600 dark:text-rose-400"
              : "font-semibold text-slate-700 dark:text-slate-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function InvoiceGenerator() {
  const { addRecentTool } = useRecentTools();
  const [invoice, setInvoice] = useState(() => makeDefaultInvoice());
  const [pane, setPane] = useState("edit");
  const [busy, setBusy] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const logoInputRef = useRef(null);
  const importInputRef = useRef(null);

  useEffect(() => {
    addRecentTool({
      title: "Invoice Generator",
      link: "/tools/invoice-generator",
      icon: "FileText",
    });
  }, [addRecentTool]);

  // Fill today's dates on first mount.
  useEffect(() => {
    // Dates must be filled after hydration so the server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInvoice((current) => {
      if (current.meta.issueDate && current.meta.dueDate) return current;
      const issue = todayISO();
      return {
        ...current,
        meta: {
          ...current.meta,
          issueDate: current.meta.issueDate || issue,
          dueDate: current.meta.dueDate || addDaysISO(issue, 14),
        },
      };
    });
  }, []);

  // Restore the local draft once.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DRAFT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.invoice) {
          // Restoring the saved draft is intentionally a one-time post-hydration read.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setInvoice(normalizeInvoice(parsed.invoice));
          setSavedAt(parsed.savedAt || null);
        }
      }
    } catch {
      // A corrupt draft should never block the tool.
    }
    setHydrated(true);
  }, []);

  // Debounced autosave.
  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => {
      try {
        const stamp = Date.now();
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: stamp, invoice }));
        setSavedAt(stamp);
      } catch {
        // Private mode or quota exceeded — keep working in memory.
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [invoice, hydrated]);

  const totals = useMemo(() => calcInvoice(invoice), [invoice]);
  const currency = CURRENCIES.find((item) => item.code === invoice.meta.currency) || CURRENCIES[0];

  const updateMeta = (patch) =>
    setInvoice((current) => ({ ...current, meta: { ...current.meta, ...patch } }));
  const updateSender = (patch) =>
    setInvoice((current) => ({ ...current, sender: { ...current.sender, ...patch } }));
  const updateClient = (patch) =>
    setInvoice((current) => ({ ...current, client: { ...current.client, ...patch } }));
  const updateAdjustments = (patch) =>
    setInvoice((current) => ({ ...current, adjustments: { ...current.adjustments, ...patch } }));
  const updatePayment = (patch) =>
    setInvoice((current) => ({ ...current, payment: { ...current.payment, ...patch } }));
  const updateSettings = (patch) =>
    setInvoice((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  const updateItem = (id, patch) =>
    setInvoice((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));

  const addItem = () => {
    setInvoice((current) => ({ ...current, items: [...current.items, makeItem({ description: "New item" })] }));
    toast.success("Line item added.");
  };

  const duplicateItem = (id) => {
    setInvoice((current) => {
      const index = current.items.findIndex((item) => item.id === id);
      if (index === -1) return current;
      const copy = { ...makeItem(), ...current.items[index], id: makeItem().id };
      const items = [...current.items];
      items.splice(index + 1, 0, copy);
      return { ...current, items };
    });
    toast.success("Line item duplicated.");
  };

  const removeItem = (id) => {
    setInvoice((current) => ({
      ...current,
      items: current.items.length > 1 ? current.items.filter((item) => item.id !== id) : current.items,
    }));
  };

  const moveItem = (id, direction) => {
    setInvoice((current) => {
      const index = current.items.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.items.length) return current;
      const items = [...current.items];
      const [moved] = items.splice(index, 1);
      items.splice(target, 0, moved);
      return { ...current, items };
    });
  };

  const applyTerm = (days) => {
    const issue = invoice.meta.issueDate || todayISO();
    updateMeta({ dueDate: addDaysISO(issue, days) });
    toast.success(`Due date set to ${days} days after issue.`);
  };

  const handleLogo = (file) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type)) {
      toast.error("Use a PNG, JPEG, WebP or SVG logo.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Logo must be smaller than 4 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 420;
        const ratio = image.naturalHeight / image.naturalWidth || 1;
        const width = Math.min(maxWidth, image.naturalWidth || maxWidth);
        const height = Math.max(1, Math.round(width * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        try {
          const png = canvas.toDataURL("image/png");
          updateSender({ logo: png, logoWidth: width, logoHeight: height });
          toast.success("Logo added to the invoice.");
        } catch {
          toast.error("That logo could not be processed.");
        }
      };
      image.onerror = () => toast.error("That image could not be read.");
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePdf = async ({ print = false } = {}) => {
    setBusy(print ? "print" : "pdf");
    try {
      const blob = await invoicePdfBlob(invoice, totals);
      if (print) {
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");
        if (!win) {
          toast.error("Your browser blocked the print tab. Download the PDF instead.");
        } else {
          toast.success("Print view opened in a new tab.");
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
      } else {
        downloadBlob(blob, invoicePdfFileName(invoice));
        toast.success("Invoice PDF downloaded.");
      }
    } catch (error) {
      console.error(error);
      toast.error("The PDF could not be generated. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const handleExportJson = () => {
    downloadBlob(
      new Blob([invoiceToJson(invoice)], { type: "application/json" }),
      `${invoicePdfFileName(invoice).replace(/\.pdf$/, "")}-draft.json`,
    );
    toast.success("Invoice draft exported as JSON.");
  };

  const handleImportJson = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const next = normalizeInvoice(parsed?.invoice || parsed);
        setInvoice(next);
        toast.success("Invoice draft imported.");
      } catch {
        toast.error("That file is not a valid ToolsTrek invoice draft.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const fresh = makeDefaultInvoice();
    const issue = todayISO();
    fresh.meta.issueDate = issue;
    fresh.meta.dueDate = addDaysISO(issue, 14);
    fresh.meta.number = nextInvoiceNumber(invoice.meta.number);
    fresh.sender = { ...invoice.sender };
    fresh.settings = { ...invoice.settings };
    setInvoice(fresh);
    toast.success("Started a fresh invoice with the next number.");
  };

  const handleClearDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore storage failures.
    }
    setSavedAt(null);
    toast.success("Saved draft cleared from this browser.");
  };

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone="emerald"
        eyebrow="Billing studio"
        icon={ReceiptText}
        title="Invoice Generator"
        description="Create a polished, itemised invoice in minutes. Live totals, per-item tax and discounts, multiple currencies, your own logo and a print-ready vector PDF — free, private and entirely in your browser."
        badges={["Vector PDF", "40 currencies", "Tax inclusive & exclusive", "Auto-saved draft", "100% private"]}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ActionButton
          variant="primary"
          tone="emerald"
          icon={busy === "pdf" ? Loader2 : Download}
          onClick={() => handlePdf()}
          disabled={Boolean(busy)}
        >
          {busy === "pdf" ? "Building PDF…" : "Download PDF"}
        </ActionButton>
        <ActionButton
          icon={busy === "print" ? Loader2 : Printer}
          onClick={() => handlePdf({ print: true })}
          disabled={Boolean(busy)}
        >
          Print view
        </ActionButton>
        <ActionButton icon={FileJson} onClick={handleExportJson}>
          Export draft
        </ActionButton>
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          <FileUp className="h-4 w-4" aria-hidden="true" />
          Import draft
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            handleImportJson(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <ActionButton icon={RotateCcw} variant="ghost" onClick={handleReset}>
          New invoice
        </ActionButton>
        <span className="ml-auto flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          {savedAt ? `Draft saved locally at ${new Date(savedAt).toLocaleTimeString()}` : "Draft saves automatically"}
        </span>
      </div>

      <Segmented
        className="xl:hidden"
        tone="emerald"
        columns={2}
        label="View"
        value={pane}
        onChange={setPane}
        options={[
          { value: "edit", label: "Edit invoice" },
          { value: "preview", label: "Preview" },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className={`${pane === "edit" ? "block" : "hidden"} space-y-6 xl:col-span-7 xl:block`}>
          {/* Invoice details */}
          <SectionCard
            tone="emerald"
            icon={ReceiptText}
            title="Invoice details"
            description="The number, dates and tax behaviour that appear on the document."
            actions={
              <ActionButton
                icon={Copy}
                onClick={() => {
                  updateMeta({ number: nextInvoiceNumber(invoice.meta.number) });
                  toast.success("Invoice number advanced.");
                }}
              >
                Next number
              </ActionButton>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Invoice number" htmlFor="inv-number" required>
                <input
                  id="inv-number"
                  value={invoice.meta.number}
                  onChange={(event) => updateMeta({ number: event.target.value })}
                  className={`${fieldClass(false, "emerald")} font-mono`}
                />
              </Field>
              <Field label="Currency" htmlFor="inv-currency">
                <select
                  id="inv-currency"
                  value={invoice.meta.currency}
                  onChange={(event) => updateMeta({ currency: event.target.value })}
                  className={fieldClass(false, "emerald")}
                >
                  {CURRENCIES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Issue date" htmlFor="inv-issue">
                <input
                  id="inv-issue"
                  type="date"
                  value={invoice.meta.issueDate}
                  onChange={(event) => updateMeta({ issueDate: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Due date" htmlFor="inv-due">
                <input
                  id="inv-due"
                  type="date"
                  value={invoice.meta.dueDate}
                  onChange={(event) => updateMeta({ dueDate: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Status" htmlFor="inv-status">
                <select
                  id="inv-status"
                  value={invoice.meta.status}
                  onChange={(event) => updateMeta({ status: event.target.value })}
                  className={fieldClass(false, "emerald")}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tax label" htmlFor="inv-tax-label" hint="VAT, GST, Sales tax, IVA — your choice.">
                <input
                  id="inv-tax-label"
                  value={invoice.meta.taxLabel}
                  onChange={(event) => updateMeta({ taxLabel: event.target.value })}
                  className={fieldClass(false, "emerald")}
                  maxLength={18}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Segmented
                tone="emerald"
                label="Tax handling"
                columns={2}
                value={invoice.meta.taxMode}
                onChange={(value) => updateMeta({ taxMode: value })}
                options={[
                  { value: "exclusive", label: "Add tax on top" },
                  { value: "inclusive", label: "Tax included in price" },
                ]}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Payment terms:</span>
              {PAYMENT_TERM_DAYS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => applyTerm(days)}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm font-bold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                >
                  Net {days}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Sender */}
          <SectionCard
            tone="emerald"
            icon={Building2}
            title="Your business"
            description="Shown at the top of the invoice. Your details never leave this device."
          >
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
                {invoice.sender.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- locally generated data URL
                  <img src={invoice.sender.logo} alt="Your logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <ImagePlus className="h-5 w-5 text-slate-400" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Business logo</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">PNG, JPEG, WebP or SVG · up to 4 MB</p>
              </div>
              <div className="ml-auto flex gap-2">
                <ActionButton icon={ImagePlus} onClick={() => logoInputRef.current?.click()}>
                  {invoice.sender.logo ? "Replace" : "Upload"}
                </ActionButton>
                {invoice.sender.logo && (
                  <ActionButton
                    variant="danger"
                    icon={Trash2}
                    onClick={() => updateSender({ logo: "", logoWidth: 0, logoHeight: 0 })}
                  >
                    Remove
                  </ActionButton>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(event) => {
                  handleLogo(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Business name" htmlFor="sender-name" required>
                <input
                  id="sender-name"
                  value={invoice.sender.name}
                  onChange={(event) => updateSender({ name: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Tax / VAT ID" htmlFor="sender-tax">
                <input
                  id="sender-tax"
                  value={invoice.sender.taxId}
                  onChange={(event) => updateSender({ taxId: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Billing email" htmlFor="sender-email">
                <input
                  id="sender-email"
                  type="email"
                  value={invoice.sender.email}
                  onChange={(event) => updateSender({ email: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Phone" htmlFor="sender-phone">
                <input
                  id="sender-phone"
                  value={invoice.sender.phone}
                  onChange={(event) => updateSender({ phone: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Business address" htmlFor="sender-address" hint="One line per row — it keeps its line breaks on the invoice.">
                <textarea
                  id="sender-address"
                  rows={3}
                  value={invoice.sender.address}
                  onChange={(event) => updateSender({ address: event.target.value })}
                  className={`${fieldClass(false, "emerald")} resize-y leading-relaxed`}
                />
              </Field>
            </div>
          </SectionCard>

          {/* Client */}
          <SectionCard
            tone="emerald"
            icon={User2}
            title="Bill to"
            description="Who receives the invoice. Add a contact name for accounts-payable teams."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Client / company" htmlFor="client-name" required>
                <input
                  id="client-name"
                  value={invoice.client.name}
                  onChange={(event) => updateClient({ name: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Contact person" htmlFor="client-contact">
                <input
                  id="client-contact"
                  value={invoice.client.contact}
                  onChange={(event) => updateClient({ contact: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Email" htmlFor="client-email">
                <input
                  id="client-email"
                  type="email"
                  value={invoice.client.email}
                  onChange={(event) => updateClient({ email: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Phone" htmlFor="client-phone">
                <input
                  id="client-phone"
                  value={invoice.client.phone}
                  onChange={(event) => updateClient({ phone: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Tax / VAT ID" htmlFor="client-tax" className="sm:col-span-2">
                <input
                  id="client-tax"
                  value={invoice.client.taxId}
                  onChange={(event) => updateClient({ taxId: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Billing address" htmlFor="client-address">
                <textarea
                  id="client-address"
                  rows={3}
                  value={invoice.client.address}
                  onChange={(event) => updateClient({ address: event.target.value })}
                  className={`${fieldClass(false, "emerald")} resize-y leading-relaxed`}
                />
              </Field>
            </div>
          </SectionCard>

          {/* Line items */}
          <SectionCard
            tone="emerald"
            icon={Layers3}
            title="Line items"
            description="Quantity, rate, tax and discount are calculated per line. Use the arrows to reorder."
            actions={
              <ActionButton icon={ListPlus} variant="primary" tone="emerald" onClick={addItem}>
                Add item
              </ActionButton>
            }
          >
            <div className="space-y-3">
              {invoice.items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/25"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-slate-600 dark:text-slate-300">
                      Item {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(item.id, -1)}
                        disabled={index === 0}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-white"
                        aria-label={`Move item ${index + 1} up`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(item.id, 1)}
                        disabled={index === invoice.items.length - 1}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-700 dark:hover:text-white"
                        aria-label={`Move item ${index + 1} down`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateItem(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                        aria-label={`Duplicate item ${index + 1}`}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={invoice.items.length === 1}
                        className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 disabled:opacity-30 dark:hover:bg-rose-950/30"
                        aria-label={`Remove item ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Field label="Description" htmlFor={`item-desc-${item.id}`}>
                      <input
                        id={`item-desc-${item.id}`}
                        value={item.description}
                        onChange={(event) => updateItem(item.id, { description: event.target.value })}
                        placeholder="What are you billing for?"
                        className={fieldClass(false, "emerald")}
                      />
                    </Field>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
                    <Field label="Qty" htmlFor={`item-qty-${item.id}`}>
                      <input
                        id={`item-qty-${item.id}`}
                        type="number"
                        min="0"
                        step="any"
                        value={item.qty}
                        onChange={(event) => updateItem(item.id, { qty: event.target.value })}
                        className={fieldClass(false, "emerald")}
                      />
                    </Field>
                    <Field label="Unit" htmlFor={`item-unit-${item.id}`}>
                      <input
                        id={`item-unit-${item.id}`}
                        value={item.unit}
                        onChange={(event) => updateItem(item.id, { unit: event.target.value })}
                        placeholder="hrs"
                        className={fieldClass(false, "emerald")}
                      />
                    </Field>
                    <Field label="Rate" htmlFor={`item-rate-${item.id}`}>
                      <input
                        id={`item-rate-${item.id}`}
                        type="number"
                        min="0"
                        step="any"
                        value={item.rate}
                        onChange={(event) => updateItem(item.id, { rate: event.target.value })}
                        className={fieldClass(false, "emerald")}
                      />
                    </Field>
                    <Field label={`${invoice.meta.taxLabel || "Tax"} %`} htmlFor={`item-tax-${item.id}`}>
                      <input
                        id={`item-tax-${item.id}`}
                        type="number"
                        min="0"
                        step="any"
                        value={item.taxRate}
                        onChange={(event) => updateItem(item.id, { taxRate: event.target.value })}
                        className={fieldClass(false, "emerald")}
                      />
                    </Field>
                    <Field label="Discount %" htmlFor={`item-disc-${item.id}`}>
                      <input
                        id={`item-disc-${item.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={item.discount}
                        onChange={(event) => updateItem(item.id, { discount: event.target.value })}
                        className={fieldClass(false, "emerald")}
                      />
                    </Field>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2 text-sm dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">
                      Line amount {totals.inclusive ? "(tax included)" : "(before tax)"}
                    </span>
                    <span className="text-base font-black tabular-nums text-slate-900 dark:text-white">
                      {formatMoney(totals.lines[index]?.amount ?? 0, invoice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Adjustments */}
          <SectionCard
            tone="emerald"
            icon={Wallet}
            title="Discounts, shipping & payments"
            description="Apply an invoice-level discount, add shipping, record a deposit and choose how the total is rounded."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Discount type">
                <Segmented
                  tone="emerald"
                  columns={2}
                  value={invoice.adjustments.discountType}
                  onChange={(value) => updateAdjustments({ discountType: value })}
                  options={[
                    { value: "percent", label: "Percent" },
                    { value: "flat", label: "Fixed" },
                  ]}
                />
              </Field>
              <Field
                label={invoice.adjustments.discountType === "percent" ? "Discount %" : `Discount (${currency.code})`}
                htmlFor="adj-discount"
              >
                <input
                  id="adj-discount"
                  type="number"
                  min="0"
                  step="any"
                  value={invoice.adjustments.discountValue}
                  onChange={(event) => updateAdjustments({ discountValue: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label={`Shipping (${currency.code})`} htmlFor="adj-shipping">
                <input
                  id="adj-shipping"
                  type="number"
                  min="0"
                  step="any"
                  value={invoice.adjustments.shipping}
                  onChange={(event) => updateAdjustments({ shipping: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label={`Amount paid (${currency.code})`} htmlFor="adj-paid">
                <input
                  id="adj-paid"
                  type="number"
                  min="0"
                  step="any"
                  value={invoice.adjustments.amountPaid}
                  onChange={(event) => updateAdjustments({ amountPaid: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Rounding" htmlFor="adj-round" className="sm:col-span-2">
                <select
                  id="adj-round"
                  value={invoice.adjustments.roundTo}
                  onChange={(event) => updateAdjustments({ roundTo: event.target.value })}
                  className={fieldClass(false, "emerald")}
                >
                  {ROUNDING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="space-y-1.5">
                <MiniTotal label="Subtotal" value={formatMoney(totals.subtotal, invoice)} />
                {totals.discountTotal > 0 && (
                  <MiniTotal
                    label="Discounts"
                    value={`- ${formatMoney(totals.discountTotal, invoice)}`}
                    negative
                  />
                )}
                {totals.shipping > 0 && (
                  <MiniTotal label="Shipping" value={formatMoney(totals.shipping, invoice)} />
                )}
                {totals.taxTotal > 0 && (
                  <MiniTotal
                    label={`${invoice.meta.taxLabel || "Tax"}${totals.inclusive ? " (included)" : ""}`}
                    value={formatMoney(totals.taxTotal, invoice)}
                  />
                )}
                <div className="border-t border-slate-200 pt-1.5 dark:border-slate-700">
                  <MiniTotal label="Total" value={formatMoney(totals.total, invoice)} strong />
                </div>
                {totals.paid > 0 && (
                  <MiniTotal label="Paid" value={`- ${formatMoney(totals.paid, invoice)}`} negative />
                )}
                <MiniTotal label="Balance due" value={formatMoney(totals.balance, invoice)} strong />
              </div>
            </div>
          </SectionCard>

          {/* Payment details */}
          <SectionCard
            tone="emerald"
            icon={Landmark}
            title="Payment details"
            description="Bank transfer, IBAN or a payment link — shown beside the notes on the invoice."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Bank name" htmlFor="pay-bank">
                <input
                  id="pay-bank"
                  value={invoice.payment.bankName}
                  onChange={(event) => updatePayment({ bankName: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Account name" htmlFor="pay-name">
                <input
                  id="pay-name"
                  value={invoice.payment.accountName}
                  onChange={(event) => updatePayment({ accountName: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Account number" htmlFor="pay-account">
                <input
                  id="pay-account"
                  value={invoice.payment.accountNumber}
                  onChange={(event) => updatePayment({ accountNumber: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="SWIFT / BIC" htmlFor="pay-swift">
                <input
                  id="pay-swift"
                  value={invoice.payment.swift}
                  onChange={(event) => updatePayment({ swift: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="IBAN" htmlFor="pay-iban">
                <input
                  id="pay-iban"
                  value={invoice.payment.iban}
                  onChange={(event) => updatePayment({ iban: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
              <Field label="Payment link" htmlFor="pay-link">
                <input
                  id="pay-link"
                  value={invoice.payment.link}
                  onChange={(event) => updatePayment({ link: event.target.value })}
                  className={fieldClass(false, "emerald")}
                />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Payment note" htmlFor="pay-note">
                <textarea
                  id="pay-note"
                  rows={2}
                  value={invoice.payment.notes}
                  onChange={(event) => updatePayment({ notes: event.target.value })}
                  className={`${fieldClass(false, "emerald")} resize-y leading-relaxed`}
                />
              </Field>
            </div>
            <div className="mt-3">
              <ToggleRow
                tone="emerald"
                checked={invoice.settings.showPayment}
                onChange={(value) => updateSettings({ showPayment: value })}
                label="Show payment details on the invoice"
                description="Turn off for a cleaner one-page summary."
              />
            </div>
          </SectionCard>

          {/* Notes and terms */}
          <SectionCard
            tone="emerald"
            icon={Banknote}
            title="Notes & terms"
            description="A thank-you note and your payment terms appear at the bottom of the invoice."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Notes" htmlFor="inv-notes">
                <textarea
                  id="inv-notes"
                  rows={4}
                  value={invoice.notes}
                  onChange={(event) => setInvoice((current) => ({ ...current, notes: event.target.value }))}
                  className={`${fieldClass(false, "emerald")} resize-y leading-relaxed`}
                />
              </Field>
              <Field label="Terms" htmlFor="inv-terms">
                <textarea
                  id="inv-terms"
                  rows={4}
                  value={invoice.terms}
                  onChange={(event) => setInvoice((current) => ({ ...current, terms: event.target.value }))}
                  className={`${fieldClass(false, "emerald")} resize-y leading-relaxed`}
                />
              </Field>
            </div>
          </SectionCard>

          {/* Appearance */}
          <SectionCard
            tone="emerald"
            icon={Palette}
            title="Design & layout"
            description="Match the invoice to your brand. Every change is reflected in the preview and the PDF."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Segmented
                tone="emerald"
                label="Template"
                columns={2}
                value={invoice.settings.template}
                onChange={(value) => updateSettings({ template: value })}
                options={TEMPLATES}
              />
              <Segmented
                tone="emerald"
                label="Paper size"
                columns={2}
                value={invoice.settings.paper}
                onChange={(value) => updateSettings({ paper: value })}
                options={PAPERS.map((paper) => ({ value: paper.value, label: paper.label }))}
              />
            </div>

            <div className="mt-4">
              <span className={labelClass}>Accent colour</span>
              <div className="flex flex-wrap gap-2">
                {ACCENT_THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => updateSettings({ accent: theme.value })}
                    aria-pressed={invoice.settings.accent === theme.value}
                    aria-label={`${theme.label} accent`}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                      invoice.settings.accent === theme.value
                        ? "border-slate-900 bg-white text-slate-900 shadow-sm dark:border-white dark:bg-slate-800 dark:text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full ring-2 ring-white ring-offset-1"
                      style={{ backgroundColor: theme.hex, boxShadow: `0 0 0 1px ${theme.hex}` }}
                    />
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <ToggleRow
                tone="emerald"
                checked={invoice.settings.showLogo}
                onChange={(value) => updateSettings({ showLogo: value })}
                label="Show logo"
                description="Hide the uploaded logo without deleting it."
              />
              <ToggleRow
                tone="emerald"
                checked={invoice.settings.showTax}
                onChange={(value) => updateSettings({ showTax: value })}
                label="Tax column"
                description="Show each line's tax rate."
              />
              <ToggleRow
                tone="emerald"
                checked={invoice.settings.showUnit}
                onChange={(value) => updateSettings({ showUnit: value })}
                label="Units"
                description="Show hrs, pcs, kg beside quantities."
              />
              <ToggleRow
                tone="emerald"
                checked={invoice.settings.showDiscount}
                onChange={(value) => updateSettings({ showDiscount: value })}
                label="Line discounts"
                description="Show the discount percentage under an item."
              />
              <ToggleRow
                tone="emerald"
                checked={invoice.settings.compact}
                onChange={(value) => updateSettings({ compact: value })}
                label="Compact layout"
                description="Tighter spacing for long invoices."
              />
              <ToggleRow
                tone="emerald"
                checked={showAdvanced}
                onChange={setShowAdvanced}
                label="Show advanced tips"
                description="Display calculation and privacy notes below."
              />
            </div>

            {showAdvanced && (
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <Callout tone="emerald" variant="tip" title="How totals are rounded">
                  Item discounts apply first, then the invoice discount is shared proportionally across
                  lines before tax, so every tax band stays accurate.
                </Callout>
                <Callout tone="emerald" variant="info" title="Draft storage">
                  This invoice is auto-saved in your browser only. Use Export draft for a portable JSON
                  backup before clearing site data.
                </Callout>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <ActionButton icon={Trash2} variant="danger" onClick={handleClearDraft}>
                Clear saved draft
              </ActionButton>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {savedAt ? `Last saved ${new Date(savedAt).toLocaleTimeString()}` : "Not saved yet"}
              </span>
            </div>
          </SectionCard>

          <SectionCard tone="emerald" icon={Settings2} title="Quick totals">
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <Stat tone="emerald" label="Subtotal" value={formatMoney(totals.subtotal, invoice)} />
              <Stat tone="emerald" label="Tax" value={formatMoney(totals.taxTotal, invoice)} />
              <Stat tone="emerald" label="Total" value={formatMoney(totals.total, invoice)} />
              <Stat tone="emerald" label="Balance" value={formatMoney(totals.balance, invoice)} />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Issued {formatDate(invoice.meta.issueDate, currency.locale)} · Due{" "}
              {formatDate(invoice.meta.dueDate, currency.locale)} · {totals.lines.length} line item
              {totals.lines.length === 1 ? "" : "s"}
            </p>
          </SectionCard>
        </div>

        {/* Preview */}
        <div className={`${pane === "preview" ? "block" : "hidden"} xl:col-span-5 xl:block`}>
          <div className="space-y-3 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:pr-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Live preview</h2>
              <Chip tone="emerald">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Updates instantly
              </Chip>
            </div>
            <InvoicePreview invoice={invoice} totals={totals} />
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={Download} variant="primary" tone="emerald" onClick={() => handlePdf()} disabled={Boolean(busy)}>
                Download PDF
              </ActionButton>
              <ActionButton icon={Printer} onClick={() => handlePdf({ print: true })} disabled={Boolean(busy)}>
                Print
              </ActionButton>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Export creates a vector PDF with selectable text, repeated table headers, page numbers
              and a currency code that renders in every reader.
            </p>
          </div>
        </div>
      </div>

      <FaqAccordion items={INVOICE_FAQS} tone="emerald" title="Invoice questions, answered" />
    </div>
  );
}
