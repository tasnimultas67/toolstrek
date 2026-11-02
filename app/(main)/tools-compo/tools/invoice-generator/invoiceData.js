/**
 * Invoice domain model, calculations and formatting for ToolsTrek.
 * Everything is pure so the preview, PDF and exports always agree.
 */

export const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar", locale: "en-US" },
  { code: "EUR", label: "EUR — Euro", locale: "de-DE" },
  { code: "GBP", label: "GBP — British Pound", locale: "en-GB" },
  { code: "CAD", label: "CAD — Canadian Dollar", locale: "en-CA" },
  { code: "AUD", label: "AUD — Australian Dollar", locale: "en-AU" },
  { code: "NZD", label: "NZD — New Zealand Dollar", locale: "en-NZ" },
  { code: "JPY", label: "JPY — Japanese Yen", locale: "ja-JP" },
  { code: "CNY", label: "CNY — Chinese Yuan", locale: "zh-CN" },
  { code: "INR", label: "INR — Indian Rupee", locale: "en-IN" },
  { code: "BDT", label: "BDT — Bangladeshi Taka", locale: "bn-BD" },
  { code: "PKR", label: "PKR — Pakistani Rupee", locale: "en-PK" },
  { code: "LKR", label: "LKR — Sri Lankan Rupee", locale: "en-LK" },
  { code: "NPR", label: "NPR — Nepalese Rupee", locale: "ne-NP" },
  { code: "SGD", label: "SGD — Singapore Dollar", locale: "en-SG" },
  { code: "MYR", label: "MYR — Malaysian Ringgit", locale: "ms-MY" },
  { code: "IDR", label: "IDR — Indonesian Rupiah", locale: "id-ID" },
  { code: "PHP", label: "PHP — Philippine Peso", locale: "en-PH" },
  { code: "THB", label: "THB — Thai Baht", locale: "th-TH" },
  { code: "VND", label: "VND — Vietnamese Dong", locale: "vi-VN" },
  { code: "KRW", label: "KRW — South Korean Won", locale: "ko-KR" },
  { code: "AED", label: "AED — UAE Dirham", locale: "en-AE" },
  { code: "SAR", label: "SAR — Saudi Riyal", locale: "en-SA" },
  { code: "QAR", label: "QAR — Qatari Riyal", locale: "en-QA" },
  { code: "TRY", label: "TRY — Turkish Lira", locale: "tr-TR" },
  { code: "CHF", label: "CHF — Swiss Franc", locale: "de-CH" },
  { code: "SEK", label: "SEK — Swedish Krona", locale: "sv-SE" },
  { code: "NOK", label: "NOK — Norwegian Krone", locale: "nb-NO" },
  { code: "DKK", label: "DKK — Danish Krone", locale: "da-DK" },
  { code: "PLN", label: "PLN — Polish Zloty", locale: "pl-PL" },
  { code: "CZK", label: "CZK — Czech Koruna", locale: "cs-CZ" },
  { code: "BRL", label: "BRL — Brazilian Real", locale: "pt-BR" },
  { code: "MXN", label: "MXN — Mexican Peso", locale: "es-MX" },
  { code: "ZAR", label: "ZAR — South African Rand", locale: "en-ZA" },
  { code: "NGN", label: "NGN — Nigerian Naira", locale: "en-NG" },
  { code: "KES", label: "KES — Kenyan Shilling", locale: "en-KE" },
  { code: "EGP", label: "EGP — Egyptian Pound", locale: "en-EG" },
  { code: "ILS", label: "ILS — Israeli New Shekel", locale: "he-IL" },
  { code: "COP", label: "COP — Colombian Peso", locale: "es-CO" },
  { code: "ARS", label: "ARS — Argentine Peso", locale: "es-AR" },
  { code: "CLP", label: "CLP — Chilean Peso", locale: "es-CL" },
  { code: "RUB", label: "RUB — Russian Ruble", locale: "ru-RU" },
];

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export const STATUS_STYLES = {
  draft: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  },
  unpaid: {
    label: "Unpaid",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
  },
  paid: {
    label: "Paid",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60",
  },
  overdue: {
    label: "Overdue",
    className:
      "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60",
  },
};

export const ACCENT_THEMES = [
  {
    value: "emerald",
    label: "Emerald",
    hex: "#059669",
    soft: "#ecfdf5",
    border: "#a7f3d0",
    pdf: [5, 150, 105],
    pdfSoft: [236, 253, 245],
  },
  {
    value: "indigo",
    label: "Indigo",
    hex: "#4f46e5",
    soft: "#eef2ff",
    border: "#c7d2fe",
    pdf: [79, 70, 229],
    pdfSoft: [238, 242, 255],
  },
  {
    value: "sky",
    label: "Ocean",
    hex: "#0284c7",
    soft: "#f0f9ff",
    border: "#bae6fd",
    pdf: [2, 132, 199],
    pdfSoft: [240, 249, 255],
  },
  {
    value: "rose",
    label: "Rose",
    hex: "#e11d48",
    soft: "#fff1f2",
    border: "#fecdd3",
    pdf: [225, 29, 72],
    pdfSoft: [255, 241, 242],
  },
  {
    value: "amber",
    label: "Amber",
    hex: "#d97706",
    soft: "#fffbeb",
    border: "#fde68a",
    pdf: [217, 119, 6],
    pdfSoft: [255, 251, 235],
  },
  {
    value: "slate",
    label: "Graphite",
    hex: "#334155",
    soft: "#f8fafc",
    border: "#e2e8f0",
    pdf: [51, 65, 85],
    pdfSoft: [248, 250, 252],
  },
];

export const TEMPLATES = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
];

export const PAPERS = [
  { value: "a4", label: "A4", width: 595.28, height: 841.89, ratio: 210 / 297 },
  { value: "letter", label: "Letter", width: 612, height: 792, ratio: 8.5 / 11 },
];

export const ROUNDING_OPTIONS = [
  { value: "0", label: "No rounding" },
  { value: "0.01", label: "Nearest 0.01" },
  { value: "0.05", label: "Nearest 0.05" },
  { value: "0.1", label: "Nearest 0.10" },
  { value: "0.5", label: "Nearest 0.50" },
  { value: "1", label: "Nearest 1.00" },
];

export const PAYMENT_TERM_DAYS = [7, 14, 30, 60];

export const INVOICE_FAQS = [
  {
    question: "Is this invoice generator really free?",
    answer:
      "Yes. Every feature — unlimited invoices, PDF export, printing, multiple currencies, logos and JSON drafts — is free and requires no account. The page runs entirely in your browser, so your client details never reach a server.",
  },
  {
    question: "Can I save an invoice and edit it later?",
    answer:
      "ToolsTrek automatically keeps a draft of the invoice you are working on in this browser using localStorage. You can also export the whole invoice as a JSON file and import it later on any device, which is the safest way to archive or move a draft.",
  },
  {
    question: "What is the difference between exclusive and inclusive tax?",
    answer:
      "Exclusive tax is added on top of your line prices: a 100.00 line with 20% VAT becomes 120.00. Inclusive tax extracts the tax from the price you entered: a 120.00 line at 20% already contains 20.00 of VAT. Switch modes in the Invoice settings card and every total updates instantly.",
  },
  {
    question: "Can I use my own logo and brand colour?",
    answer:
      "Yes. Upload a PNG, JPEG or WebP logo (it is converted to print-safe PNG locally) and choose from six accent themes. The logo and accent colour appear in the live preview and the generated PDF.",
  },
  {
    question: "Does the PDF support many line items and page breaks?",
    answer:
      "Yes. The PDF engine paginates automatically, repeats the table header on every new page, and keeps totals, payment details and notes together. Page numbers are added to the footer.",
  },
  {
    question: "Which currencies and number formats are supported?",
    answer:
      "Forty currencies with locale-aware symbols, grouping and decimal rules — from USD, EUR and GBP to BDT, INR, NGN and JPY. The PDF uses ISO currency codes so it renders correctly in any PDF reader.",
  },
  {
    question: "Is the generated invoice legally valid?",
    answer:
      "The document includes the usual fields — unique invoice number, issue and due dates, seller and buyer details, tax IDs, itemised lines, tax breakdown and payment terms — but tax rules differ by country. Check your local requirements and keep your own records.",
  },
];

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function addDaysISO(isoDate, days) {
  const base = isoDate ? new Date(`${isoDate}T00:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return "";
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function makeItem(overrides = {}) {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description: "",
    qty: 1,
    unit: "pcs",
    rate: 0,
    taxRate: 0,
    discount: 0,
    ...overrides,
  };
}

export function makeDefaultInvoice() {
  return {
    meta: {
      number: "INV-2026-0042",
      issueDate: "",
      dueDate: "",
      currency: "USD",
      status: "unpaid",
      taxMode: "exclusive",
      taxLabel: "VAT",
    },
    sender: {
      name: "Northstar Studio",
      email: "billing@northstar.studio",
      phone: "+1 (415) 555-0134",
      address: "18 Harbor Lane, Suite 400\nSan Francisco, CA 94107\nUnited States",
      taxId: "VAT US-92-1847362",
      logo: "",
      logoWidth: 0,
      logoHeight: 0,
    },
    client: {
      name: "Acme Retail Ltd.",
      contact: "Jordan Lee",
      email: "accounts@acmeretail.com",
      phone: "+1 (206) 555-0188",
      address: "2400 Market Street\nSeattle, WA 98101\nUnited States",
      taxId: "EIN 84-2201983",
    },
    items: [
      makeItem({
        description: "Brand identity design",
        qty: 1,
        unit: "project",
        rate: 2400,
        taxRate: 0,
      }),
      makeItem({
        description: "Landing page development",
        qty: 32,
        unit: "hrs",
        rate: 85,
        taxRate: 10,
      }),
      makeItem({
        description: "Stock photography licence",
        qty: 6,
        unit: "images",
        rate: 45,
        taxRate: 10,
        discount: 10,
      }),
    ],
    adjustments: {
      shipping: 0,
      discountType: "percent",
      discountValue: 5,
      amountPaid: 1000,
      roundTo: "0",
    },
    payment: {
      bankName: "First Harbor Bank",
      accountName: "Northstar Studio LLC",
      accountNumber: "0001 2345 6789",
      swift: "FHBKUS33",
      iban: "",
      link: "https://pay.northstar.studio/inv-2026-0042",
      notes: "Please include the invoice number with your transfer.",
    },
    notes:
      "Thank you for trusting Northstar Studio with your brand. We are delighted to build this launch with your team.",
    terms:
      "Payment is due within 14 days of the issue date. Late payments may incur a 1.5% monthly service charge. All amounts are in the invoice currency.",
    settings: {
      template: "modern",
      accent: "emerald",
      paper: "a4",
      showLogo: true,
      showTax: true,
      showUnit: true,
      showDiscount: true,
      compact: false,
      showPayment: true,
    },
  };
}

export function normalizeInvoice(raw) {
  const base = makeDefaultInvoice();
  if (!raw || typeof raw !== "object") return base;

  const merge = (fallback, value) =>
    value && typeof value === "object" ? { ...fallback, ...value } : fallback;

  return {
    ...base,
    ...raw,
    meta: merge(base.meta, raw.meta),
    sender: merge(base.sender, raw.sender),
    client: merge(base.client, raw.client),
    adjustments: merge(base.adjustments, raw.adjustments),
    payment: merge(base.payment, raw.payment),
    settings: merge(base.settings, raw.settings),
    items: Array.isArray(raw.items) && raw.items.length
      ? raw.items.map((item) => ({ ...makeItem(), ...item, id: item.id || makeItem().id }))
      : base.items,
  };
}

export function calcInvoice(invoice) {
  const items = (invoice.items || []).map((item) => {
    const qty = num(item.qty);
    const rate = num(item.rate);
    const taxRate = Math.max(0, num(item.taxRate));
    const discountPct = Math.min(100, Math.max(0, num(item.discount)));
    const gross = round2(qty * rate);
    const discount = round2((gross * discountPct) / 100);
    const net = round2(gross - discount);
    return { ...item, qty, rate, taxRate, discountPct, gross, discount, net };
  });

  const subtotal = round2(items.reduce((sum, item) => sum + item.gross, 0));
  const itemDiscountTotal = round2(items.reduce((sum, item) => sum + item.discount, 0));
  const afterItemDiscounts = round2(subtotal - itemDiscountTotal);

  const discountType = invoice.adjustments?.discountType === "flat" ? "flat" : "percent";
  const rawDiscount = Math.max(0, num(invoice.adjustments?.discountValue));
  const invoiceDiscount =
    afterItemDiscounts <= 0
      ? 0
      : discountType === "percent"
        ? round2((afterItemDiscounts * Math.min(100, rawDiscount)) / 100)
        : round2(Math.min(rawDiscount, afterItemDiscounts));

  const discountRatio = afterItemDiscounts > 0 ? invoiceDiscount / afterItemDiscounts : 0;
  const inclusive = invoice.meta?.taxMode === "inclusive";
  const breakdown = new Map();
  let taxTotal = 0;

  const lines = items.map((item) => {
    const allocatedDiscount = round2(item.net * discountRatio);
    const taxable = round2(item.net - allocatedDiscount);
    let tax = 0;
    let amount = taxable;

    if (item.taxRate > 0) {
      if (inclusive) {
        tax = round2(taxable - taxable / (1 + item.taxRate / 100));
        amount = taxable;
      } else {
        tax = round2((taxable * item.taxRate) / 100);
        amount = round2(taxable + tax);
      }
      taxTotal = round2(taxTotal + tax);
      breakdown.set(item.taxRate, round2((breakdown.get(item.taxRate) || 0) + tax));
    }

    return { ...item, allocatedDiscount, taxable, tax, amount };
  });

  const shipping = round2(Math.max(0, num(invoice.adjustments?.shipping)));
  const netSubtotal = round2(afterItemDiscounts - invoiceDiscount);
  const preRound = round2(netSubtotal + shipping + (inclusive ? 0 : taxTotal));
  const roundTo = Math.max(0, num(invoice.adjustments?.roundTo));
  const total = roundTo > 0 ? round2(Math.round(preRound / roundTo) * roundTo) : preRound;
  const rounding = round2(total - preRound);
  const paid = round2(num(invoice.adjustments?.amountPaid));
  const balance = round2(total - paid);
  const discountTotal = round2(itemDiscountTotal + invoiceDiscount);

  return {
    lines,
    subtotal,
    itemDiscountTotal,
    invoiceDiscount,
    discountTotal,
    netSubtotal,
    shipping,
    taxTotal,
    taxBreakdown: Array.from(breakdown.entries())
      .map(([rate, amount]) => ({ rate, amount }))
      .sort((a, b) => a.rate - b.rate),
    preRound,
    rounding,
    total,
    paid,
    balance,
    inclusive,
    dueNow: balance > 0 ? balance : 0,
    effectiveTaxRate: netSubtotal > 0 ? round2((taxTotal / netSubtotal) * 100) : 0,
  };
}

export function getCurrency(code) {
  return CURRENCIES.find((currency) => currency.code === code) || CURRENCIES[0];
}

export function formatMoney(amount, invoice, { useCode = false, decimals } = {}) {
  const currency = getCurrency(invoice?.meta?.currency);
  const value = num(amount);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      currencyDisplay: useCode ? "code" : "symbol",
      ...(decimals !== undefined
        ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
        : {}),
    }).format(value);
  } catch {
    return `${currency.code} ${value.toFixed(2)}`;
  }
}

/** PDF-safe: always uses the ISO code so every glyph exists in the base font. */
export function formatMoneyPdf(amount, invoice) {
  return formatMoney(amount, invoice, { useCode: true });
}

export function formatDate(isoDate, locale = "en-US") {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(year, month - 1, day));
  } catch {
    return isoDate;
  }
}

export function nextInvoiceNumber(current) {
  const value = String(current || "");
  const match = value.match(/(\d+)(?!.*\d)/);
  if (!match) return `${value}-0002`;
  const digits = match[1];
  const next = String(Number(digits) + 1).padStart(digits.length, "0");
  return `${value.slice(0, match.index)}${next}${value.slice(match.index + digits.length)}`;
}

export function invoiceToJson(invoice) {
  return JSON.stringify({ app: "ToolsTrek", type: "invoice", version: 1, invoice }, null, 2);
}
