"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  ArrowUpRight,
  BadgeDollarSign,
  Briefcase,
  Calculator,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileJson,
  FileText,
  Gauge,
  Info,
  Layers,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  Wallet,
  Wand2,
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
  SliderRow,
  Stat,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import {
  copyText,
  downloadText,
  parseJsonFile,
  readStored,
  toNumber,
  uid,
  writeStored,
} from "../_shared/toolkit/toolUtils";
import {
  CURRENCIES,
  EXPENSE_FREQUENCIES,
  FREELANCE_STORAGE_KEY,
  RATE_FAQS,
  annualExpenseTotal,
  calculateRateModel,
  createDemoFreelanceState,
  formatMoney,
  formatNumber,
  rateLadder,
} from "./freelanceRateData";

const TOOL_META = {
  title: "Freelance / Hourly Rate Calculator",
  link: "/tools/freelance-rate-calculator",
  icon: "BadgeDollarSign",
};
const TONE = "emerald";

const DEFAULT_STATE = {
  currency: "USD",
  targetIncome: "",
  taxRate: "25",
  retirementRate: "0",
  insurance: "",
  hoursPerWeek: "",
  weeksPerYear: "46",
  utilisation: "80",
  hoursPerDay: "8",
  margin: "12",
  marketRate: "",
  riskBuffer: "15",
  expenses: [],
  phases: [],
};

const UTILISATION_LEVELS = [50, 60, 70, 80, 90, 100];
const LADDER_MARGINS = [10, 20, 30, 40];

export default function FreelanceRateCalculator() {
  const { addRecentTool } = useRecentTools();
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const jsonRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      const saved = readStored(FREELANCE_STORAGE_KEY, null);
      if (saved && typeof saved === "object") {
        setState((current) => ({
          ...current,
          ...saved,
          expenses: Array.isArray(saved.expenses) ? saved.expenses : [],
          phases: Array.isArray(saved.phases) ? saved.phases : [],
        }));
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => writeStored(FREELANCE_STORAGE_KEY, state), 500);
    return () => window.clearTimeout(timer);
  }, [state, hydrated]);

  const update = (patch) => setState((current) => ({ ...current, ...patch }));

  const currency = state.currency || "USD";
  const taxRate = toNumber(state.taxRate, 0);
  const utilisation = toNumber(state.utilisation, 100);
  const hoursPerWeek = toNumber(state.hoursPerWeek, 0);
  const weeksPerYear = toNumber(state.weeksPerYear, 0);
  const marketRate = toNumber(state.marketRate, null);

  const billableHoursPerWeek = (hoursPerWeek * utilisation) / 100;
  const availableHours = hoursPerWeek * weeksPerYear;

  const model = useMemo(
    () =>
      calculateRateModel({
        targetIncome: toNumber(state.targetIncome, 0),
        taxRate,
        retirementRate: toNumber(state.retirementRate, 0),
        insurance: toNumber(state.insurance, 0),
        expenses: state.expenses,
        margin: toNumber(state.margin, 0),
        hoursPerWeek: billableHoursPerWeek,
        weeksPerYear,
        hoursPerDay: toNumber(state.hoursPerDay, 8),
      }),
    [
      state.targetIncome,
      state.retirementRate,
      state.insurance,
      state.expenses,
      state.margin,
      billableHoursPerWeek,
      weeksPerYear,
      state.hoursPerDay,
      taxRate,
    ],
  );

  const valid = Number.isFinite(model.hourly) && model.hourly > 0;
  const ladder = useMemo(() => rateLadder(model, LADDER_MARGINS), [model]);
  const expensesTotal = annualExpenseTotal(state.expenses);

  const marketGap =
    valid && Number.isFinite(marketRate) && marketRate > 0
      ? ((model.hourly - marketRate) / marketRate) * 100
      : null;

  const quote = useMemo(() => {
    const phases = state.phases.map((phase) => ({
      ...phase,
      hoursNum: toNumber(phase.hours, 0) || 0,
      multiplierNum: toNumber(phase.multiplier, 1) || 0,
    }));
    const totalHours = phases.reduce((total, phase) => total + phase.hoursNum, 0);
    const weightedHours = phases.reduce(
      (total, phase) => total + phase.hoursNum * phase.multiplierNum,
      0,
    );
    const base = valid ? weightedHours * model.hourly : NaN;
    const buffer = toNumber(state.riskBuffer, 0);
    const total = Number.isFinite(base) ? base * (1 + buffer / 100) : NaN;
    return {
      phases,
      totalHours,
      weightedHours,
      base,
      buffer,
      total,
      effectiveHourly: totalHours ? total / totalHours : NaN,
    };
  }, [state.phases, state.riskBuffer, model.hourly, valid]);

  const sensitivity = useMemo(() => {
    if (!Number.isFinite(model.revenue) || !availableHours) return [];
    return UTILISATION_LEVELS.map((level) => {
      const hours = (availableHours * level) / 100;
      return { level, hours, hourly: hours ? model.revenue / hours : NaN };
    });
  }, [model.revenue, availableHours]);

  const hourly = (value, digits = 2) => formatMoney(value, currency, digits);

  const rateSummary = useMemo(() => {
    if (!valid) return "";
    return [
      "ToolsTrek freelance rate plan",
      `Currency: ${currency}`,
      "",
      `Required hourly rate: ${hourly(model.hourly)}`,
      `Day rate (${state.hoursPerDay || 8}h): ${hourly(model.dayRate)}`,
      `Week rate: ${hourly(model.weekRate)}`,
      `Monthly retainer: ${hourly(model.monthlyRetainer)}`,
      "",
      `Target take-home income: ${hourly(toNumber(state.targetIncome, 0))}`,
      `Business expenses: ${hourly(model.annualExpenses)}`,
      `Retirement contribution: ${hourly(model.retirement)}`,
      `Insurance: ${hourly(toNumber(state.insurance, 0))}`,
      `Tax rate: ${taxRate}%`,
      `Profit margin: ${state.margin}%`,
      "",
      `Annual revenue required: ${hourly(model.revenue)}`,
      `Annual profit after costs: ${hourly(model.profit)}`,
      `Billable hours per year: ${formatNumber(model.billableHours)}`,
      `Billable hours per week: ${formatNumber(billableHoursPerWeek, 1)}`,
    ].join("\n");
  }, [
    valid,
    currency,
    model,
    state.hoursPerDay,
    state.targetIncome,
    state.insurance,
    taxRate,
    state.margin,
    billableHoursPerWeek,
  ]);

  const quoteSummary = useMemo(() => {
    if (!valid || !quote.totalHours) return "";
    return [
      "ToolsTrek project quote",
      `Currency: ${currency}`,
      "",
      ...quote.phases
        .filter((phase) => phase.hoursNum > 0)
        .map((phase) => {
          const amount = phase.hoursNum * phase.multiplierNum * model.hourly * (1 + quote.buffer / 100);
          return `${phase.name || "Untitled phase"}: ${formatNumber(phase.hoursNum, 1)}h × ${phase.multiplierNum} = ${hourly(amount)}`;
        }),
      "",
      `Total hours: ${formatNumber(quote.totalHours, 1)}`,
      `Weighted hours: ${formatNumber(quote.weightedHours, 1)}`,
      `Risk buffer: ${quote.buffer}%`,
      `Project total: ${hourly(quote.total)}`,
      `Effective hourly: ${hourly(quote.effectiveHourly)}`,
    ].join("\n");
  }, [valid, quote, currency, model.hourly, hourly]);

  const copyRateCard = async () => {
    if (!valid) {
      toast.error("Add an income target and billable hours first.");
      return;
    }
    const ok = await copyText(rateSummary);
    if (ok) toast.success("Rate card copied");
    else toast.error("Could not copy the rate card");
  };

  const copyQuote = async () => {
    if (!quoteSummary) {
      toast.error("Add phases with hours to build a quote.");
      return;
    }
    const ok = await copyText(quoteSummary);
    if (ok) toast.success("Quote copied");
    else toast.error("Could not copy the quote");
  };

  const exportCsv = () => {
    if (!valid) {
      toast.error("Add your numbers first.");
      return;
    }
    const rows = [
      ["Metric", "Value"],
      ["Currency", currency],
      ["Target income", toNumber(state.targetIncome, 0).toFixed(2)],
      ["Annual expenses", model.annualExpenses.toFixed(2)],
      ["Retirement", model.retirement.toFixed(2)],
      ["Insurance", toNumber(state.insurance, 0).toFixed(2)],
      ["Tax rate (%)", taxRate],
      ["Profit margin (%)", state.margin],
      ["Net need", model.netNeed.toFixed(2)],
      ["Revenue required", model.revenue.toFixed(2)],
      ["Profit", model.profit.toFixed(2)],
      ["Billable hours", model.billableHours.toFixed(1)],
      ["Hourly rate", model.hourly.toFixed(2)],
      ["Day rate", model.dayRate.toFixed(2)],
      ["Week rate", model.weekRate.toFixed(2)],
      ["Monthly retainer", model.monthlyRetainer.toFixed(2)],
      ["Project total", Number.isFinite(quote.total) ? quote.total.toFixed(2) : ""],
    ];
    downloadText(
      rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n"),
      "toolstrek-freelance-rate.csv",
      "text/csv;charset=utf-8",
    );
    toast.success("CSV exported");
  };

  const exportPdf = () => {
    if (!valid) {
      toast.error("Add your numbers first.");
      return;
    }
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFillColor(236, 253, 245);
    doc.rect(0, 0, 210, 38, "F");
    doc.setTextColor(4, 120, 87);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.text("Freelance Rate Plan", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Generated with ToolsTrek — private, browser-based pricing maths", 14, 29);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Required rates", 14, 50);

    let y = 60;
    const rateRows = [
      ["Hourly rate", hourly(model.hourly)],
      ["Day rate", hourly(model.dayRate)],
      ["Week rate", hourly(model.weekRate)],
      ["Monthly retainer", hourly(model.monthlyRetainer)],
      ["Annual revenue required", hourly(model.revenue)],
      ["Annual profit", hourly(model.profit)],
    ];
    rateRows.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(label, 14, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(value, 92, y);
      y += 7;
    });

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Cost breakdown", 14, y);
    y += 10;

    const costRows = [
      ["Target take-home income", hourly(toNumber(state.targetIncome, 0))],
      ["Business expenses", hourly(model.annualExpenses)],
      ["Retirement contribution", hourly(model.retirement)],
      ["Insurance", hourly(toNumber(state.insurance, 0))],
      ["Tax rate", `${taxRate}%`],
      ["Profit margin", `${state.margin}%`],
      ["Billable hours per year", formatNumber(model.billableHours)],
    ];
    costRows.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(label, 14, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(value, 92, y);
      y += 7;
    });

    if (Number.isFinite(quote.total) && quote.totalHours > 0) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Project quote", 14, y);
      y += 10;
      doc.setFontSize(9);
      quote.phases
        .filter((phase) => phase.hoursNum > 0)
        .forEach((phase) => {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(`${phase.name || "Untitled phase"} — ${phase.hoursNum}h × ${phase.multiplierNum}`, 14, y);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          const amount =
            phase.hoursNum * phase.multiplierNum * model.hourly * (1 + quote.buffer / 100);
          doc.text(hourly(amount), 140, y);
          y += 6;
        });
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(4, 120, 87);
      doc.text(`Project total (incl. ${quote.buffer}% risk buffer)`, 14, y);
      doc.text(hourly(quote.total), 140, y);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Estimates only. Confirm tax, insurance and pension rules with a qualified adviser.", 14, 285);
    doc.save("toolstrek-freelance-rate.pdf");
    toast.success("PDF rate plan downloaded");
  };

  const exportJson = () => {
    downloadText(
      JSON.stringify({ app: "toolstrek-freelance-rate", version: 1, exportedAt: new Date().toISOString(), state }, null, 2),
      "toolstrek-freelance-rate-plan.json",
      "application/json",
    );
  };

  const importJson = async (file) => {
    const parsed = await parseJsonFile(file);
    const imported = parsed?.state || parsed;
    if (!imported || typeof imported !== "object") {
      toast.error("That file does not contain a pricing plan.");
      return;
    }
    setState((current) => ({
      ...current,
      ...imported,
      expenses: Array.isArray(imported.expenses) ? imported.expenses : [],
      phases: Array.isArray(imported.phases) ? imported.phases : [],
    }));
    toast.success("Pricing plan imported");
  };

  const addExpense = () => {
    update({
      expenses: [
        ...state.expenses,
        { id: uid("expense"), label: "", amount: "", frequency: "monthly" },
      ],
    });
  };

  const updateExpense = (id, patch) => {
    update({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...patch } : expense,
      ),
    });
  };

  const removeExpense = (id) => {
    update({ expenses: state.expenses.filter((expense) => expense.id !== id) });
  };

  const addPhase = () => {
    update({
      phases: [...state.phases, { id: uid("phase"), name: "", hours: "", multiplier: "1" }],
    });
  };

  const updatePhase = (id, patch) => {
    update({
      phases: state.phases.map((phase) => (phase.id === id ? { ...phase, ...patch } : phase)),
    });
  };

  const removePhase = (id) => {
    update({ phases: state.phases.filter((phase) => phase.id !== id) });
  };

  const loadDemo = () => {
    setState((current) => ({ ...current, ...createDemoFreelanceState() }));
    toast.success("Demo plan loaded — replace every value with your own");
  };

  const clearAll = () => {
    setState({ ...DEFAULT_STATE, expenses: [], phases: [] });
    toast.success("All fields cleared");
  };

  const resetExpenses = () => {
    update({ expenses: [] });
    toast.success("Expense list cleared");
  };

  const resetPhases = () => {
    update({ phases: [] });
    toast.success("Quote phases cleared");
  };

  return (
    <div className="freelance-tool space-y-6 pb-10">
      <style>{`.freelance-tool .text-xs { font-size: 13px !important; }`}</style>

      <Hero
        tone={TONE}
        eyebrow="Freelance pricing"
        icon={BadgeDollarSign}
        title="Freelance / Hourly Rate Calculator"
        description="Work out the hourly, day and project rate your business actually needs — after expenses, tax, retirement, insurance and unbillable time. Model market positioning, utilisation sensitivity and phase-based quotes, then export a rate card."
        badges={["Blank by default", "Expense & phase CRUD", "Utilisation sensitivity", "No uploads"]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <SectionCard
            icon={Wallet}
            tone={TONE}
            title="1 · Income, costs & tax"
            description="Start from what you need to take home, then add the costs of running the business."
            actions={<Chip tone={TONE}>{currency}</Chip>}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Currency">
                  <select
                    value={state.currency}
                    onChange={(event) => update({ currency: event.target.value })}
                    className={fieldClass(false, TONE)}
                  >
                    {CURRENCIES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Target take-home income" hint="Your desired personal income per year, before tax.">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={state.targetIncome}
                    onChange={(event) => update({ targetIncome: event.target.value })}
                    placeholder="e.g. 72000"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label="Insurance & fixed cover" hint="Health, liability, professional indemnity — per year.">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={state.insurance}
                    onChange={(event) => update({ insurance: event.target.value })}
                    placeholder="e.g. 4800"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <SliderRow
                  label="Income tax rate"
                  value={taxRate}
                  min={0}
                  max={60}
                  step={0.5}
                  tone={TONE}
                  onChange={(value) => update({ taxRate: String(value) })}
                  format={(value) => `${value}%`}
                  hint="Your effective marginal rate, not the headline bracket. Self-employment taxes count here."
                />
                <SliderRow
                  label="Retirement contribution"
                  value={toNumber(state.retirementRate, 0)}
                  min={0}
                  max={30}
                  step={0.5}
                  tone={TONE}
                  onChange={(value) => update({ retirementRate: String(value) })}
                  format={(value) => `${value}% of income`}
                  hint="Nobody matches a freelancer's pension — budget for it yourself."
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Business expenses</p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      Software, equipment, accounting, coworking, marketing and anything else you deduct.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton tone={TONE} icon={Plus} onClick={addExpense}>
                      Add expense
                    </ActionButton>
                    {state.expenses.length > 0 && (
                      <ActionButton tone="rose" variant="danger" icon={Trash2} onClick={resetExpenses}>
                        Clear
                      </ActionButton>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {state.expenses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-[13px] text-slate-500 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400">
                      No expenses yet. Add your first line item — nothing is pre-filled.
                    </div>
                  ) : (
                    state.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/30"
                      >
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              value={expense.label}
                              onChange={(event) => updateExpense(expense.id, { label: event.target.value })}
                              placeholder="Expense name"
                              aria-label="Expense name"
                              className={fieldClass(false, TONE)}
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={expense.amount}
                              onChange={(event) => updateExpense(expense.id, { amount: event.target.value })}
                              placeholder={`Amount (${currency})`}
                              aria-label="Expense amount"
                              className={fieldClass(false, TONE)}
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <select
                              value={expense.frequency}
                              onChange={(event) => updateExpense(expense.id, { frequency: event.target.value })}
                              aria-label="Expense frequency"
                              className={fieldClass(false, TONE)}
                            >
                              {EXPENSE_FREQUENCIES.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center justify-end sm:col-span-1">
                            <button
                              type="button"
                              onClick={() => removeExpense(expense.id)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              aria-label={`Delete ${expense.label || "expense"}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {state.expenses.length > 0 && (
                  <p className="mt-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                    Annual expense total: {hourly(expensesTotal)}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <ActionButton tone={TONE} variant="primary" icon={Wand2} onClick={loadDemo}>
                  Load demo data
                </ActionButton>
                <ActionButton tone={TONE} icon={RotateCcw} onClick={clearAll}>
                  Clear all
                </ActionButton>
                <ActionButton tone={TONE} icon={FileJson} onClick={exportJson}>
                  Export plan
                </ActionButton>
                <ActionButton tone={TONE} icon={Upload} onClick={() => jsonRef.current?.click()}>
                  Import plan
                </ActionButton>
                <input
                  ref={jsonRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) importJson(file);
                    event.target.value = "";
                  }}
                />
                <span className="text-[13px] font-medium text-slate-400">
                  Nothing is pre-filled — demo data is optional.
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Clock}
            tone={TONE}
            title="2 · Real capacity"
            description="You cannot bill every hour you work. Model the hours you can realistically sell."
            actions={<Chip tone={TONE}>{formatNumber(billableHoursPerWeek, 1)} billable h/wk</Chip>}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <SliderRow
                  label="Working hours per week"
                  value={hoursPerWeek}
                  min={0}
                  max={80}
                  step={1}
                  tone={TONE}
                  onChange={(value) => update({ hoursPerWeek: String(value) })}
                  format={(value) => `${value} h`}
                  hint="Total hours you are willing to work, including admin and sales."
                />
                <SliderRow
                  label="Weeks worked per year"
                  value={weeksPerYear}
                  min={0}
                  max={52}
                  step={1}
                  tone={TONE}
                  onChange={(value) => update({ weeksPerYear: String(value) })}
                  format={(value) => `${value} wk`}
                  hint="Subtract holidays, public holidays and sick days."
                />
                <SliderRow
                  label="Billable utilisation"
                  value={utilisation}
                  min={0}
                  max={100}
                  step={1}
                  tone={TONE}
                  onChange={(value) => update({ utilisation: String(value) })}
                  format={(value) => `${value}%`}
                  hint="The share of working hours you actually invoice. 70–80% is realistic."
                />
                <SliderRow
                  label="Hours in a billable day"
                  value={toNumber(state.hoursPerDay, 8)}
                  min={1}
                  max={16}
                  step={0.5}
                  tone={TONE}
                  onChange={(value) => update({ hoursPerDay: String(value) })}
                  format={(value) => `${value} h`}
                  hint="Used to turn the hourly rate into a day rate."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  tone={TONE}
                  label="Billable week"
                  value={`${formatNumber(billableHoursPerWeek, 1)} h`}
                  icon={Clock}
                />
                <Stat
                  tone={TONE}
                  label="Billable year"
                  value={`${formatNumber(model.billableHours)} h`}
                  icon={Calculator}
                />
                <Stat
                  tone={TONE}
                  label="Available year"
                  value={`${formatNumber(availableHours)} h`}
                  icon={Gauge}
                  hint="Before utilisation"
                />
                <Stat
                  tone={TONE}
                  label="Unbilled year"
                  value={`${formatNumber(Math.max(0, availableHours - model.billableHours))} h`}
                  icon={Info}
                  hint="Admin, sales and time off"
                />
              </div>

              <Callout tone={TONE} variant="tip" title="The utilisation trap">
                Quoting a rate based on a 40-hour billable week is the most common freelancer pricing mistake. At 70%
                utilisation, you need roughly <strong>43% more per hour</strong> than the same income at 100%.
              </Callout>
            </div>
          </SectionCard>

          <SectionCard
            icon={TrendingUp}
            tone={TONE}
            title="3 · Profit, market position & rate ladder"
            description="Set the margin you want to keep, then compare your floor rate with what the market pays."
            actions={<Chip tone={TONE}>{state.margin}% margin</Chip>}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <SliderRow
                  label="Profit margin"
                  value={toNumber(state.margin, 0)}
                  min={0}
                  max={60}
                  step={1}
                  tone={TONE}
                  onChange={(value) => update({ margin: String(value) })}
                  format={(value) => `${value}%`}
                  hint="Covers scope creep, late payment, equipment and reinvestment."
                />
                <Field
                  label="Comparable market rate"
                  hint="What peers charge for the same work. Leave blank if you do not want a comparison."
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={state.marketRate}
                      onChange={(event) => update({ marketRate: event.target.value })}
                      placeholder={`e.g. 95 ${currency}/h`}
                      className={fieldClass(false, TONE)}
                    />
                    {marketGap !== null && (
                      <Chip tone={marketGap > 0 ? "amber" : "emerald"}>
                        {marketGap > 0 ? "+" : ""}
                        {marketGap.toFixed(0)}%
                      </Chip>
                    )}
                  </div>
                </Field>
              </div>

              {marketGap !== null && (
                <Callout
                  tone={marketGap > 20 ? "amber" : "emerald"}
                  variant={marketGap > 20 ? "warning" : "success"}
                  title={marketGap > 0 ? "Your floor is above the market" : "Your floor fits the market"}
                >
                  {marketGap > 20
                    ? `Your required rate is ${marketGap.toFixed(0)}% above the comparison. Either raise your prices with a stronger offer, cut overheads, or accept a lower profit margin.`
                    : marketGap > 0
                      ? `Your required rate is ${marketGap.toFixed(0)}% above the comparison — defensible if your speed or specialism is higher than average.`
                      : `Your required rate sits ${Math.abs(marketGap).toFixed(0)}% below the comparison, leaving room to invest in the business or move upmarket.`}
                </Callout>
              )}

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-3 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Margin
                      </th>
                      <th className="px-3 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Annual revenue
                      </th>
                      <th className="px-3 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Hourly
                      </th>
                      <th className="px-3 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Day
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ladder.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-[13px] text-slate-500 dark:text-slate-400">
                          Add income and capacity to build the ladder.
                        </td>
                      </tr>
                    ) : (
                      ladder.map((row) => (
                        <tr
                          key={row.margin}
                          className={row.margin === toNumber(state.margin, 0) ? "bg-emerald-50/70 dark:bg-emerald-950/30" : ""}
                        >
                          <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-100">{row.margin}%</td>
                          <td className="px-3 py-2 tabular-nums text-slate-600 dark:text-slate-300">
                            {hourly(row.revenue)}
                          </td>
                          <td className="px-3 py-2 font-bold tabular-nums text-slate-900 dark:text-white">
                            {hourly(row.hourly)}
                          </td>
                          <td className="px-3 py-2 tabular-nums text-slate-600 dark:text-slate-300">
                            {hourly(row.hourly * toNumber(state.hoursPerDay, 8))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                Your current margin of <strong>{state.margin}%</strong> is highlighted. A higher margin is not greed —
                it is the buffer that keeps a solo business solvent through quiet months.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            icon={Layers}
            tone={TONE}
            title="4 · Phase-based project quote"
            description="Break a fixed-price project into phases, weight the harder ones, and add a risk buffer for ambiguity."
            actions={
              <div className="flex flex-wrap gap-2">
                <ActionButton tone={TONE} icon={Plus} onClick={addPhase}>
                  Add phase
                </ActionButton>
                {state.phases.length > 0 && (
                  <ActionButton tone="rose" variant="danger" icon={Trash2} onClick={resetPhases}>
                    Clear
                  </ActionButton>
                )}
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Risk buffer" hint="Extra percentage for unclear scope, revisions and unknowns.">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={state.riskBuffer}
                    onChange={(event) => update({ riskBuffer: event.target.value })}
                    placeholder="e.g. 15"
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <div className="rounded-xl bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
                  Hourly rate used for quoting:{" "}
                  <strong>{valid ? hourly(model.hourly) : "add income and capacity first"}</strong>. Multipliers let you
                  charge more for specialist or high-risk phases.
                </div>
              </div>

              <div className="space-y-2">
                {state.phases.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-[13px] text-slate-500 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400">
                    No phases yet. Add discovery, design, build and handover phases — or your own workflow.
                  </div>
                ) : (
                  state.phases.map((phase, index) => {
                    const amount =
                      (toNumber(phase.hours, 0) || 0) *
                      (toNumber(phase.multiplier, 1) || 0) *
                      (valid ? model.hourly : 0) *
                      (1 + quote.buffer / 100);
                    return (
                      <div
                        key={phase.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/30"
                      >
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              value={phase.name}
                              onChange={(event) => updatePhase(phase.id, { name: event.target.value })}
                              placeholder={`Phase ${index + 1} name`}
                              aria-label={`Phase ${index + 1} name`}
                              className={fieldClass(false, TONE)}
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={phase.hours}
                              onChange={(event) => updatePhase(phase.id, { hours: event.target.value })}
                              placeholder="Hours"
                              aria-label={`Phase ${index + 1} hours`}
                              className={fieldClass(false, TONE)}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="number"
                              min="0"
                              step="0.05"
                              value={phase.multiplier}
                              onChange={(event) => updatePhase(phase.id, { multiplier: event.target.value })}
                              placeholder="×1"
                              aria-label={`Phase ${index + 1} multiplier`}
                              className={fieldClass(false, TONE)}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2 sm:col-span-2">
                            <span className="truncate text-[13px] font-bold tabular-nums text-slate-700 dark:text-slate-200">
                              {valid ? hourly(amount) : "—"}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePhase(phase.id)}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              aria-label={`Delete phase ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {valid && quote.totalHours > 0 && (
                <div className="flex flex-wrap gap-2">
                  <ActionButton tone={TONE} icon={Copy} onClick={copyQuote}>
                    Copy quote
                  </ActionButton>
                  <ActionButton tone={TONE} icon={FileText} onClick={exportPdf}>
                    PDF quote
                  </ActionButton>
                  <ActionButton tone={TONE} icon={Printer} onClick={() => window.print()}>
                    Print
                  </ActionButton>
                </div>
              )}

              <Callout tone="amber" variant="warning" title="Fixed-price discipline">
                State the number of revision rounds and what is out of scope in the proposal. The risk buffer protects
                you, but a written boundary protects the relationship too.
              </Callout>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-24">
            <SectionCard
              icon={Target}
              tone={TONE}
              title="Your required rate"
              description="The floor, not the ceiling. Price above it whenever the value allows."
            >
              {!valid ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
                  <BadgeDollarSign className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No rate yet</p>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                    Add a target income and billable hours, or load the demo plan to see how it works.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white shadow-lg shadow-emerald-500/20">
                    <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-white/80">Hourly rate</p>
                    <p className="mt-1 text-4xl font-black tracking-tight">{hourly(model.hourly)}</p>
                    <p className="mt-1 text-sm font-semibold text-white/85">
                      {currency} · {state.margin}% profit · {taxRate}% tax
                    </p>
                    <p className="mt-2 text-[13px] text-white/75">
                      {formatNumber(model.billableHours)} billable hours per year
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Stat tone={TONE} label="Day rate" value={hourly(model.dayRate)} icon={Briefcase} />
                    <Stat tone={TONE} label="Week rate" value={hourly(model.weekRate)} icon={Clock} />
                    <Stat tone={TONE} label="Monthly retainer" value={hourly(model.monthlyRetainer)} icon={Receipt} />
                    <Stat tone={TONE} label="Annual revenue" value={hourly(model.revenue)} icon={TrendingUp} />
                  </div>

                  <div className="space-y-1.5 text-[13px]">
                    {[
                      ["Take-home target", hourly(toNumber(state.targetIncome, 0))],
                      ["Expenses", hourly(model.annualExpenses)],
                      ["Retirement", hourly(model.retirement)],
                      ["Insurance", hourly(toNumber(state.insurance, 0))],
                      ["Tax + profit", hourly(model.revenue - model.netNeed)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
                      >
                        <span className="font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                        <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <ActionButton tone={TONE} icon={Copy} onClick={copyRateCard}>
                      Copy
                    </ActionButton>
                    <ActionButton tone={TONE} icon={Download} onClick={exportCsv}>
                      CSV
                    </ActionButton>
                    <ActionButton tone={TONE} icon={FileText} onClick={exportPdf}>
                      PDF
                    </ActionButton>
                    <ActionButton tone={TONE} icon={Printer} onClick={() => window.print()}>
                      Print
                    </ActionButton>
                  </div>
                </div>
              )}
            </SectionCard>

            {valid && quote.totalHours > 0 && (
              <SectionCard
                icon={Layers}
                tone={TONE}
                title="Project quote"
                description="Weighted hours plus your risk buffer."
              >
                <div className="space-y-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <p className="text-[13px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      Project total
                    </p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-emerald-900 dark:text-emerald-100">
                      {hourly(quote.total)}
                    </p>
                    <p className="mt-1 text-[13px] text-emerald-700/80 dark:text-emerald-300/80">
                      {formatNumber(quote.totalHours, 1)} h · {formatNumber(quote.weightedHours, 1)} weighted ·{" "}
                      {quote.buffer}% buffer
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Stat tone={TONE} label="Base" value={hourly(quote.base)} />
                    <Stat
                      tone={TONE}
                      label="Effective hourly"
                      value={hourly(quote.effectiveHourly)}
                      hint="After buffer"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton tone={TONE} icon={Copy} onClick={copyQuote}>
                      Copy quote
                    </ActionButton>
                    <ActionButton tone={TONE} icon={FileText} onClick={exportPdf}>
                      PDF
                    </ActionButton>
                  </div>
                </div>
              </SectionCard>
            )}

            <SectionCard
              icon={Gauge}
              tone={TONE}
              title="Utilisation sensitivity"
              description="The hourly rate needed at each billable share of your available year."
            >
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-3 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Utilisation
                      </th>
                      <th className="px-3 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Hours
                      </th>
                      <th className="px-3 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sensitivity.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-3 text-[13px] text-slate-500 dark:text-slate-400">
                          Add capacity to see sensitivity.
                        </td>
                      </tr>
                    ) : (
                      sensitivity.map((row) => (
                        <tr
                          key={row.level}
                          className={
                            row.level === utilisation ? "bg-emerald-50/70 dark:bg-emerald-950/30" : ""
                          }
                        >
                          <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">{row.level}%</td>
                          <td className="px-3 py-2 tabular-nums text-slate-600 dark:text-slate-300">
                            {formatNumber(row.hours)}
                          </td>
                          <td className="px-3 py-2 font-bold tabular-nums text-slate-900 dark:text-white">
                            {hourly(row.hourly)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Every unbillable hour has to be paid for by the hours you do bill.
              </p>
            </SectionCard>

            <SectionCard icon={ShieldCheck} tone={TONE} title="Sanity checks">
              <ul className="space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Does the rate cover a 3-month dry spell without new work?
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Have you included software, hardware replacement and accounting?
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Is the profit margin enough to fund marketing and learning?
                </li>
                <li className="flex gap-2">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Quote fixed prices with a written scope and revision limit.
                </li>
                <li className="flex gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  Raise prices for existing clients at renewal, not mid-project.
                </li>
              </ul>
            </SectionCard>
          </div>
        </div>
      </div>

      <FaqAccordion tone={TONE} items={RATE_FAQS} title="Freelance rate questions" />
    </div>
  );
}
