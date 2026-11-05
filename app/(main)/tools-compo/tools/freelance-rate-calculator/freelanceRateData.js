/* -------------------------------------------------------------------------- */
/*  Freelance Rate Calculator — pricing models, currencies and helpers.       */
/* -------------------------------------------------------------------------- */

export const FREELANCE_STORAGE_KEY = "toolstrek_freelance_rate_v1";

export const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "BDT", label: "BDT — Bangladeshi Taka" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "PKR", label: "PKR — Pakistani Rupee" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "BRL", label: "BRL — Brazilian Real" },
  { code: "MXN", label: "MXN — Mexican Peso" },
  { code: "PHP", label: "PHP — Philippine Peso" },
  { code: "IDR", label: "IDR — Indonesian Rupiah" },
  { code: "MYR", label: "MYR — Malaysian Ringgit" },
  { code: "TRY", label: "TRY — Turkish Lira" },
  { code: "PLN", label: "PLN — Polish Zloty" },
];

export const EXPENSE_FREQUENCIES = [
  { value: "monthly", label: "per month" },
  { value: "yearly", label: "per year" },
  { value: "one-off", label: "one-off / year" },
];

export const RATE_FAQS = [
  {
    question: "How is a freelance hourly rate calculated?",
    answer:
      "Start with the take-home income you need, add business expenses, insurance and retirement contributions, then gross up for tax and profit. Divide that required revenue by the number of hours you can actually bill in a year. The result is the floor, not the ceiling.",
    },
  {
    question: "Should I bill 40 hours a week as a freelancer?",
    answer:
      "Almost never. Sales, admin, invoicing, learning and unbillable revisions consume a large part of the week. Many freelancers bill 20–30 hours out of a 40-hour week. The calculator lets you model your real capacity instead of a fantasy one.",
  },
  {
    question: "What profit margin should a freelancer add?",
    answer:
      "A 10–20% margin is a healthy starting range. It absorbs scope creep, late payments, sick days and equipment replacement, and gives you room to invest in the business. Service businesses with high expertise or scarcity often sustain 25–40%.",
  },
  {
    question: "Why does a day rate cost more than hourly × 8?",
    answer:
      "A day rate should include the same overheads and margin as your hourly rate, plus the opportunity cost of reserving a full day you cannot sell elsewhere. Many freelancers add 10–20% to the straight multiplication.",
  },
  {
    question: "How do I quote a fixed-price project?",
    answer:
      "Estimate hours by phase, multiply by your hourly rate, then add a risk buffer for ambiguity and revision rounds. Use the project quote builder to keep the phase breakdown visible, and state what is out of scope in writing.",
  },
  {
    question: "What is utilisation and why does it matter?",
    answer:
      "Utilisation is the share of your available hours that you actually bill. At 80% utilisation you need a higher hourly rate than at 100% for the same income. The sensitivity table shows the rate required at each level.",
  },
  {
    question: "Does the calculator include currency conversion?",
    answer:
      "No. It formats values in the currency you select but does not fetch exchange rates, because live rates would require a network request. Use the Currency Converter tool if you need to translate a rate into another currency.",
  },
  {
    question: "Is my financial data uploaded anywhere?",
    answer:
      "No. Income targets, expenses and client rates stay in your browser's local storage. Nothing is sent to a server.",
  },
];

export function formatMoney(value, currency = "USD", digits = 0) {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(digits)}`;
  }
}

export function formatNumber(value, digits = 0) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

export function annualExpenseTotal(expenses) {
  return (expenses || []).reduce((total, expense) => {
    const amount = Number(expense.amount) || 0;
    if (expense.frequency === "monthly") return total + amount * 12;
    return total + amount;
  }, 0);
}

/**
 * Core pricing model.
 * `revenue` is the gross business revenue needed before profit margin.
 */
export function calculateRateModel({
  targetIncome = 0,
  taxRate = 0,
  retirementRate = 0,
  insurance = 0,
  expenses = [],
  margin = 0,
  hoursPerWeek = 0,
  weeksPerYear = 0,
  hoursPerDay = 8,
}) {
  const annualExpenses = annualExpenseTotal(expenses);
  const retirement = (targetIncome * (Number(retirementRate) || 0)) / 100;
  const taxFactor = 1 - (Number(taxRate) || 0) / 100;
  const marginFactor = 1 - (Number(margin) || 0) / 100;
  const netNeed = targetIncome + annualExpenses + (Number(insurance) || 0) + retirement;
  const baseRevenue = taxFactor > 0 ? netNeed / taxFactor : NaN;
  const revenue = marginFactor > 0 ? baseRevenue / marginFactor : NaN;
  const billableHours = (Number(hoursPerWeek) || 0) * (Number(weeksPerYear) || 0);
  const hourly = billableHours > 0 ? revenue / billableHours : NaN;
  const profit = Number.isFinite(revenue) ? revenue - netNeed : NaN;

  return {
    annualExpenses,
    retirement,
    netNeed,
    baseRevenue,
    revenue,
    profit,
    billableHours,
    hourly,
    dayRate: Number.isFinite(hourly) ? hourly * (Number(hoursPerDay) || 8) : NaN,
    weekRate: Number.isFinite(hourly) ? hourly * (Number(hoursPerWeek) || 0) : NaN,
    monthlyRetainer: Number.isFinite(revenue) ? revenue / 12 : NaN,
    monthlyHours: billableHours > 0 ? billableHours / 12 : NaN,
  };
}

export function rateLadder(model, margins = [10, 20, 30]) {
  if (!Number.isFinite(model.baseRevenue) || !model.billableHours) return [];
  return margins.map((margin) => {
    const revenue = model.baseRevenue / (1 - margin / 100);
    return { margin, revenue, hourly: revenue / model.billableHours };
  });
}

export function utilisationSensitivity(model, levels = [60, 70, 80, 90, 100]) {
  if (!Number.isFinite(model.revenue)) return [];
  return levels.map((level) => ({
    level,
    hours: (model.billableHours * level) / 100,
    hourly: model.billableHours ? model.revenue / ((model.billableHours * level) / 100) : NaN,
  }));
}

export function createDemoFreelanceState() {
  return {
    currency: "USD",
    targetIncome: "72000",
    taxRate: "25",
    retirementRate: "5",
    insurance: "4800",
    hoursPerWeek: "24",
    weeksPerYear: "46",
    hoursPerDay: "8",
    margin: "12",
    marketRate: "95",
    riskBuffer: "15",
    expenses: [
      { id: "exp-1", label: "Software & subscriptions", amount: "140", frequency: "monthly" },
      { id: "exp-2", label: "Accounting & legal", amount: "1800", frequency: "yearly" },
      { id: "exp-3", label: "Equipment replacement", amount: "1500", frequency: "one-off" },
    ],
    phases: [
      { id: "phase-1", name: "Discovery & strategy", hours: "10", multiplier: "1" },
      { id: "phase-2", name: "Design", hours: "38", multiplier: "1.1" },
      { id: "phase-3", name: "Build", hours: "64", multiplier: "1" },
      { id: "phase-4", name: "QA & handover", hours: "14", multiplier: "1" },
    ],
  };
}

export const DEMO_EXPENSE = { label: "", amount: "", frequency: "monthly" };
export const DEMO_PHASE = { name: "", hours: "", multiplier: "1" };
