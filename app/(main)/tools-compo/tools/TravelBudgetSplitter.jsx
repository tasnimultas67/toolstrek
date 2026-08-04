"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import ToolPageShell from "../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  Wallet,
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  X,
  Sparkles,
  Users,
  AlertTriangle,
  Info,
  Home,
  Plane,
  Utensils,
  Compass,
  ShoppingBag,
  HelpCircle,
  Briefcase,
  Calendar,
  TrendingUp,
  PlusCircle,
  Download,
  RefreshCw,
  Settings,
  FileText,
  CheckCircle2
} from "lucide-react";

// --- CURRENCY PRESETS ---
const CURRENCY_PRESETS = [
  { code: "BDT", symbol: "৳" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
  { code: "JPY", symbol: "¥" },
  { code: "CHF", symbol: "CHF" }
];

// --- INITIAL DEFAULT LOCALIZED DATA ---
const DEFAULT_MEMBERS = [
  { id: "m-1", name: "Abir" },
  { id: "m-2", name: "Tasnim" },
  { id: "m-3", name: "Rafsan" },
  { id: "m-4", name: "Fariha" }
];

const DEFAULT_CATEGORIES = [
  { id: "accommodation", name: "Resort & Hotels", budget: 20000, color: "#3b82f6", icon: "Home" },
  { id: "transportation", name: "Transport (Bus & Jeep)", budget: 15000, color: "#10b981", icon: "Plane" },
  { id: "dining", name: "Food & Meals", budget: 12000, color: "#f59e0b", icon: "Utensils" },
  { id: "activities", name: "Sightseeing & Entry", budget: 5000, color: "#ec4899", icon: "Compass" },
  { id: "shopping", name: "Shopping", budget: 3000, color: "#8b5cf6", icon: "ShoppingBag" },
  { id: "miscellaneous", name: "Miscellaneous", budget: 5000, color: "#6b7280", icon: "HelpCircle" }
];

// Exchange Rates represent: "How many BDT is 1 unit of this Foreign Currency?"
const DEFAULT_RATES = {
  BDT: 1.0,
  USD: 118.0,
  EUR: 128.0,
  INR: 1.41,
  GBP: 152.0,
  AUD: 78.5,
  CAD: 86.0,
  JPY: 0.75,
  CHF: 133.0
};

const DEFAULT_EXPENSES = [
  {
    id: "e-1",
    name: "Sajek Resort Booking",
    amount: 18000,
    currency: "BDT",
    category: "accommodation",
    paidById: "m-1",
    date: "2026-08-01",
    splitType: "equal",
    excludedIds: []
  },
  {
    id: "e-2",
    name: "Dhaka to Khagrachari Bus",
    amount: 6000,
    currency: "BDT",
    category: "transportation",
    paidById: "m-2",
    date: "2026-08-01",
    splitType: "equal",
    excludedIds: []
  },
  {
    id: "e-3",
    name: "Bamboo Chicken Dinner",
    amount: 3200,
    currency: "BDT",
    category: "dining",
    paidById: "m-3",
    date: "2026-08-02",
    splitType: "weights",
    weights: { "m-1": 1, "m-2": 1, "m-3": 1, "m-4": 1 },
    excludedIds: []
  },
  {
    id: "e-4",
    name: "Local Tea & Snacks",
    amount: 450,
    currency: "BDT",
    category: "dining",
    paidById: "m-2",
    date: "2026-08-03",
    splitType: "weights",
    weights: { "m-1": 1, "m-2": 1, "m-3": 1, "m-4": 0 }, // Fariha was sleeping
    excludedIds: []
  },
  {
    id: "e-5",
    name: "Sajek Handicraft Souvenirs",
    amount: 2500,
    currency: "BDT",
    category: "shopping",
    paidById: "m-4",
    date: "2026-08-04",
    splitType: "unequal",
    shares: { "m-1": 500, "m-2": 1000, "m-3": 300, "m-4": 700 },
    excludedIds: []
  }
];

const categoryIcons = {
  Home: Home,
  Plane: Plane,
  Utensils: Utensils,
  Compass: Compass,
  ShoppingBag: ShoppingBag,
  HelpCircle: HelpCircle,
  Briefcase: Briefcase
};

// Custom Dropdown Component
function CustomDropdown({
  label,
  value,
  options,
  onChange,
  renderOption,
  placeholder = "Select Option",
  searchPlaceholder = "Search..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  const filteredOptions = options.filter(opt =>
    (opt.label || opt.name || opt.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value || opt.id === value || opt.code === value);

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      {label && (
        <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm lg:text-base text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition duration-150 ease-in-out text-left cursor-pointer"
      >
        <span className="truncate">
          {selectedOption ? (
            renderOption ? renderOption(selectedOption) : (selectedOption.label || selectedOption.name || selectedOption.code)
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4.5 h-4.5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs lg:text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          )}
          <ul className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50 dark:divide-gray-900/50">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-xs lg:text-sm text-gray-500 text-center">No options found</li>
            ) : (
              filteredOptions.map((opt) => {
                const optKey = opt.value || opt.id || opt.code;
                const isSelected = optKey === value;
                return (
                  <li key={optKey}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(optKey);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full text-left px-3 py-2 text-xs lg:text-sm hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2 transition duration-150 cursor-pointer ${
                        isSelected ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {renderOption ? renderOption(opt) : (opt.label || opt.name || opt.code)}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// Custom Date Selector Component (Day, Month, Year Dropdowns)
function DateSelector({ label, dateStr, onChange }) {
  const parts = (dateStr || "").split("-");
  const year = parts[0] || "2026";
  const month = parts[1] || "08";
  const day = parts[2] || "01";

  const getDaysInMonth = (mStr, yStr) => {
    const m = parseInt(mStr, 10);
    const y = parseInt(yStr, 10);
    if (isNaN(m) || isNaN(y)) return 31;
    return new Date(y, m, 0).getDate();
  };

  const daysCount = getDaysInMonth(month, year);
  const days = Array.from({ length: daysCount }, (_, i) => {
    const dStr = (i + 1).toString().padStart(2, "0");
    return { value: dStr, name: dStr };
  });

  const MONTHS = [
    { value: "01", name: "Jan" },
    { value: "02", name: "Feb" },
    { value: "03", name: "Mar" },
    { value: "04", name: "Apr" },
    { value: "05", name: "May" },
    { value: "06", name: "Jun" },
    { value: "07", name: "Jul" },
    { value: "08", name: "Aug" },
    { value: "09", name: "Sep" },
    { value: "10", name: "Oct" },
    { value: "11", name: "Nov" },
    { value: "12", name: "Dec" }
  ];

  const YEARS = Array.from({ length: 15 }, (_, i) => ({
    value: (2025 + i).toString(),
    name: (2025 + i).toString()
  }));

  const handleYearChange = (newYear) => {
    onChange(`${newYear}-${month}-${day}`);
  };

  const handleMonthChange = (newMonth) => {
    const maxDays = getDaysInMonth(newMonth, year);
    let finalDay = day;
    if (parseInt(day, 10) > maxDays) {
      finalDay = maxDays.toString().padStart(2, "0");
    }
    onChange(`${year}-${newMonth}-${finalDay}`);
  };

  const handleDayChange = (newDay) => {
    onChange(`${year}-${month}-${newDay}`);
  };

  return (
    <div className="w-full text-left">
      {label && (
        <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        <CustomDropdown
          value={day}
          options={days}
          onChange={handleDayChange}
          placeholder="Day"
        />
        <CustomDropdown
          value={month}
          options={MONTHS}
          onChange={handleMonthChange}
          placeholder="Month"
        />
        <CustomDropdown
          value={year}
          options={YEARS}
          onChange={handleYearChange}
          placeholder="Year"
        />
      </div>
    </div>
  );
}

export default function TravelBudgetSplitter() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    if (typeof addRecentTool === "function") {
      addRecentTool({
        title: "Travel Budget Splitter",
        link: "/tools/travel-budget-splitter",
        icon: "Wallet"
      });
    }
  }, [addRecentTool]);

  // --- STATE ---
  const [tripDetails, setTripDetails] = useState({
    name: "",
    baseCurrency: "BDT",
    budgetLimit: 0,
    alertThreshold: 85,
    startDate: "",
    endDate: ""
  });

  const [members, setMembers] = useState([]);

  const [categories, setCategories] = useState([]);

  const [exchangeRates, setExchangeRates] = useState(DEFAULT_RATES);

  const [expenses, setExpenses] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // --- EXPENSE FORM STATE ---
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCurrency, setExpCurrency] = useState("BDT");
  const [expCategory, setExpCategory] = useState("dining");
  const [expPaidBy, setExpPaidBy] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expSplitType, setExpSplitType] = useState("equal");
  
  // Custom split values
  const [expExcluded, setExpExcluded] = useState([]);
  const [expWeights, setExpWeights] = useState({});
  const [expPercentages, setExpPercentages] = useState({});
  const [expShares, setExpShares] = useState({});

  // Filters
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPaidBy, setFilterPaidBy] = useState("all");

  // New item adds in settings
  const [newMemberName, setNewMemberName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatBudget, setNewCatBudget] = useState("");
  const [newCatColor, setNewCatColor] = useState("#3b82f6");
  const [newCatIcon, setNewCatIcon] = useState("Home");
  const [newCurrencyCode, setNewCurrencyCode] = useState("");
  const [newCurrencyRate, setNewCurrencyRate] = useState("");

  // Set default paidBy when member list updates or modal opens
  useEffect(() => {
    if (members.length > 0 && !expPaidBy) {
      setExpPaidBy(members[0].id);
    }
  }, [members, expPaidBy]);

  const currencySymbol = useMemo(() => {
    // If BDT, use TK symbol for custom dropdown compatibility or standard ৳
    if (tripDetails.baseCurrency === "BDT") return "৳";
    const cur = CURRENCY_PRESETS.find(c => c.code === tripDetails.baseCurrency);
    return cur ? cur.symbol : tripDetails.baseCurrency;
  }, [tripDetails.baseCurrency]);

  // --- CALCULATION LOGIC ---
  const memberBalances = useMemo(() => {
    const balances = {};
    members.forEach(m => {
      balances[m.id] = { id: m.id, name: m.name, paid: 0, owed: 0, net: 0 };
    });

    expenses.forEach(exp => {
      const rate = exchangeRates[exp.currency] || 1.0;
      // Multiplying by rate converts Foreign Currency to Base Currency (BDT)
      const baseAmount = exp.amount * rate;

      // Add to paid amount for the person who paid
      if (balances[exp.paidById]) {
        balances[exp.paidById].paid += baseAmount;
      }

      if (exp.splitType === "equal") {
        const excluded = exp.excludedIds || [];
        const splitMembers = members.filter(m => !excluded.includes(m.id));
        const activeCount = splitMembers.length > 0 ? splitMembers.length : members.length;
        const perPerson = baseAmount / activeCount;
        
        const targetMembers = splitMembers.length > 0 ? splitMembers : members;
        targetMembers.forEach(m => {
          balances[m.id].owed += perPerson;
        });
      } else if (exp.splitType === "weights") {
        const weights = exp.weights || {};
        let totalWeight = 0;
        members.forEach(m => {
          totalWeight += parseFloat(weights[m.id] || 0);
        });

        if (totalWeight <= 0) {
          const perPerson = baseAmount / members.length;
          members.forEach(m => {
            balances[m.id].owed += perPerson;
          });
        } else {
          members.forEach(m => {
            const w = parseFloat(weights[m.id] || 0);
            balances[m.id].owed += (baseAmount * w) / totalWeight;
          });
        }
      } else if (exp.splitType === "percentage") {
        const percentages = exp.percentages || {};
        members.forEach(m => {
          const pct = parseFloat(percentages[m.id] || 0);
          balances[m.id].owed += (baseAmount * pct) / 100;
        });
      } else if (exp.splitType === "unequal") {
        const shares = exp.shares || {};
        members.forEach(m => {
          const amt = parseFloat(shares[m.id] || 0);
          balances[m.id].owed += amt * rate;
        });
      }
    });

    members.forEach(m => {
      balances[m.id].net = balances[m.id].paid - balances[m.id].owed;
    });

    return Object.values(balances);
  }, [members, expenses, exchangeRates]);

  const totalSpentBase = useMemo(() => {
    return expenses.reduce((sum, exp) => {
      const rate = exchangeRates[exp.currency] || 1.0;
      return sum + (exp.amount * rate);
    }, 0);
  }, [expenses, exchangeRates]);

  const categorySpentMap = useMemo(() => {
    const map = {};
    categories.forEach(c => { map[c.id] = 0; });
    expenses.forEach(exp => {
      const rate = exchangeRates[exp.currency] || 1.0;
      const baseAmount = exp.amount * rate;
      map[exp.category] = (map[exp.category] || 0) + baseAmount;
    });
    return map;
  }, [categories, expenses, exchangeRates]);

  const simplifiedPayments = useMemo(() => {
    let debtors = memberBalances
      .filter(b => b.net < -0.01)
      .map(b => ({ id: b.id, name: b.name, net: -b.net }))
      .sort((a, b) => b.net - a.net);

    let creditors = memberBalances
      .filter(b => b.net > 0.01)
      .map(b => ({ id: b.id, name: b.name, net: b.net }))
      .sort((a, b) => b.net - a.net);

    const transactions = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const amount = Math.min(debtor.net, creditor.net);

      transactions.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount
      });

      debtor.net -= amount;
      creditor.net -= amount;

      if (debtor.net < 0.01) dIdx++;
      if (creditor.net < 0.01) cIdx++;
    }

    return transactions;
  }, [memberBalances]);

  // --- ACTIONS ---
  const handleOpenAddModal = (expToEdit = null) => {
    if (members.length === 0 && !expToEdit) {
      toast.error("Please add at least one traveler first in the 'Trip & Travelers' tab.");
      setActiveTab("travelers");
      return;
    }
    if (categories.length === 0 && !expToEdit) {
      toast.error("Please add at least one category first in the 'Category Budgets' tab.");
      setActiveTab("categories");
      return;
    }

    if (expToEdit) {
      setEditingExpenseId(expToEdit.id);
      setExpName(expToEdit.name);
      setExpAmount(expToEdit.amount.toString());
      setExpCurrency(expToEdit.currency);
      setExpCategory(expToEdit.category);
      setExpPaidBy(expToEdit.paidById);
      setExpDate(expToEdit.date);
      setExpSplitType(expToEdit.splitType);
      setExpExcluded(expToEdit.excludedIds || []);
      setExpWeights(expToEdit.weights || {});
      setExpPercentages(expToEdit.percentages || {});
      setExpShares(expToEdit.shares || {});
    } else {
      setEditingExpenseId(null);
      setExpName("");
      setExpAmount("");
      setExpCurrency(tripDetails.baseCurrency);
      setExpCategory(categories[0]?.id || "dining");
      setExpPaidBy(members[0]?.id || "");
      setExpDate(new Date().toISOString().split("T")[0]);
      setExpSplitType("equal");
      setExpExcluded([]);
      setExpWeights(members.reduce((acc, m) => ({ ...acc, [m.id]: 1 }), {}));
      setExpPercentages(members.reduce((acc, m) => ({ ...acc, [m.id]: (100 / members.length).toFixed(1) }), {}));
      setExpShares(members.reduce((acc, m) => ({ ...acc, [m.id]: "" }), {}));
    }
    setShowAddModal(true);
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expName.trim()) return toast.error("Please enter expense name.");
    const amt = parseFloat(expAmount);
    if (isNaN(amt) || amt <= 0) return toast.error("Please enter a valid positive amount.");

    // Validation for split parameters
    if (expSplitType === "percentage") {
      const sum = members.reduce((s, m) => s + parseFloat(expPercentages[m.id] || 0), 0);
      if (Math.abs(sum - 100) > 0.1) {
        return toast.error(`Percentages must total exactly 100%. Current sum: ${sum.toFixed(1)}%`);
      }
    } else if (expSplitType === "unequal") {
      const sum = members.reduce((s, m) => s + parseFloat(expShares[m.id] || 0), 0);
      if (Math.abs(sum - amt) > 0.05) {
        return toast.error(`Shares must total exactly expense amount (${amt} ${expCurrency}). Current sum: ${sum.toFixed(2)}`);
      }
    } else if (expSplitType === "weights") {
      const sum = members.reduce((s, m) => s + parseFloat(expWeights[m.id] || 0), 0);
      if (sum <= 0) return toast.error("Total weight must be greater than 0.");
    }

    const payload = {
      id: editingExpenseId || `exp-${Date.now()}`,
      name: expName,
      amount: amt,
      currency: expCurrency,
      category: expCategory,
      paidById: expPaidBy,
      date: expDate || new Date().toISOString().split("T")[0],
      splitType: expSplitType,
      excludedIds: expSplitType === "equal" ? expExcluded : [],
      weights: expSplitType === "weights" ? expWeights : undefined,
      percentages: expSplitType === "percentage" ? expPercentages : undefined,
      shares: expSplitType === "unequal" ? expShares : undefined
    };

    if (editingExpenseId) {
      setExpenses(prev => prev.map(item => item.id === editingExpenseId ? payload : item));
      toast.success("Expense updated successfully!");
    } else {
      setExpenses(prev => [payload, ...prev]);
      toast.success("Expense added successfully!");
    }

    setShowAddModal(false);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success("Expense deleted.");
  };

  // Add Traveler
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    if (members.some(m => m.name.toLowerCase() === newMemberName.trim().toLowerCase())) {
      return toast.error("Traveler name already exists.");
    }
    const newId = `m-${Date.now()}`;
    setMembers(prev => [...prev, { id: newId, name: newMemberName.trim() }]);
    setNewMemberName("");
    toast.success("Traveler added.");
  };

  const handleRemoveMember = (id) => {
    if (expenses.some(e => e.paidById === id)) {
      return toast.error("Cannot remove traveler who has paid expenses. Delete their expenses first.");
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    toast.success("Traveler removed.");
  };

  // Add Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cleanName = newCatName.trim();
    if (categories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      return toast.error("Category name already exists.");
    }
    const newId = cleanName.toLowerCase().replace(/\s+/g, "-");
    const budgetLimit = parseFloat(newCatBudget) || 5000;

    setCategories(prev => [
      ...prev,
      {
        id: newId,
        name: cleanName,
        budget: budgetLimit,
        color: newCatColor,
        icon: newCatIcon
      }
    ]);
    setNewCatName("");
    setNewCatBudget("");
    toast.success("Category added.");
  };

  const handleRemoveCategory = (id) => {
    if (expenses.some(e => e.category === id)) {
      return toast.error("Cannot remove category in use. Reassign or delete expenses first.");
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success("Category removed.");
  };

  // Change base currency and convert rates
  const handleBaseCurrencyChange = (newCode) => {
    const oldCode = tripDetails.baseCurrency;
    if (oldCode === newCode) return;

    // Convert exchange rates relative to new base currency
    const relativeFactor = exchangeRates[newCode] || 1.0;
    const newRates = {};
    Object.keys(exchangeRates).forEach(code => {
      newRates[code] = parseFloat((exchangeRates[code] / relativeFactor).toFixed(4));
    });
    newRates[newCode] = 1.0;

    setExchangeRates(newRates);
    setTripDetails(prev => ({ ...prev, baseCurrency: newCode }));
    toast.success(`Base currency updated to ${newCode}. Rates converted.`);
  };

  const handleUpdateRate = (code, val) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) return;
    setExchangeRates(prev => ({ ...prev, [code]: parsed }));
  };

  const handleAddNewCurrency = (e) => {
    e.preventDefault();
    if (!newCurrencyCode.trim() || newCurrencyCode.length !== 3) {
      return toast.error("Currency code must be exactly 3 characters.");
    }
    const code = newCurrencyCode.toUpperCase();
    const rate = parseFloat(newCurrencyRate);
    if (isNaN(rate) || rate <= 0) {
      return toast.error("Rate must be a positive number.");
    }
    setExchangeRates(prev => ({ ...prev, [code]: rate }));
    setNewCurrencyCode("");
    setNewCurrencyRate("");
    toast.success(`${code} currency rate added.`);
  };

  const handleLoadSample = () => {
    const sampleTrip = {
      name: "Sajek Valley Escape 2026",
      baseCurrency: "BDT",
      budgetLimit: 60000,
      alertThreshold: 85,
      startDate: "2026-08-01",
      endDate: "2026-08-05"
    };
    setTripDetails(sampleTrip);
    setMembers(DEFAULT_MEMBERS);
    setCategories(DEFAULT_CATEGORIES);
    setExchangeRates(DEFAULT_RATES);
    setExpenses(DEFAULT_EXPENSES);
    toast.success("Sample travel data loaded!");
  };

  const handleReset = () => {
    setTripDetails({
      name: "",
      baseCurrency: "BDT",
      budgetLimit: 0,
      alertThreshold: 85,
      startDate: "",
      endDate: ""
    });
    setMembers([]);
    setCategories([]);
    setExchangeRates(DEFAULT_RATES);
    setExpenses([]);
    setShowResetModal(false);
    toast.success("All trip data cleared.");
  };

  // --- PDF EXPORT ---
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const ML = 15;
    const CW = PW - ML * 2;

    const getSafeSymbol = (code) => {
      if (code === "BDT") return "TK ";
      const cur = CURRENCY_PRESETS.find(c => c.code === code);
      return cur ? cur.symbol : code + " ";
    };

    const sym = getSafeSymbol(tripDetails.baseCurrency);
    const fmt = (val) => `${sym}${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let y = 15;

    // Header
    doc.setFillColor(124, 58, 237); // Purple theme
    doc.rect(0, 0, PW, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(tripDetails.name || "Untitled Trip", ML, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Trip Budget Summary & Settlements Report | Generated in browser`, ML, 22);
    doc.text(`Duration: ${tripDetails.startDate || "N/A"} to ${tripDetails.endDate || "N/A"} | Base Currency: ${tripDetails.baseCurrency}`, ML, 27);

    y = 45;

    // Summary KPIs Box
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(ML, y, CW, 25, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text("TOTAL EXPENSES", ML + 10, y + 8);
    doc.text("TRIP BUDGET LIMIT", ML + CW / 3 + 5, y + 8);
    doc.text("AVG PER TRAVELER", ML + (CW / 3) * 2 + 5, y + 8);

    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text(fmt(totalSpentBase), ML + 10, y + 18);
    doc.text(fmt(tripDetails.budgetLimit), ML + CW / 3 + 5, y + 18);
    doc.text(fmt(totalSpentBase / (members.length || 1)), ML + (CW / 3) * 2 + 5, y + 18);

    y += 35;

    // Section 1: Settlements / Debt Simplification
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(124, 58, 237);
    doc.text("Simplified Debt Settlements", ML, y);
    doc.setDrawColor(229, 231, 235);
    doc.line(ML, y + 2, ML + CW, y + 2);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);

    if (simplifiedPayments.length === 0) {
      doc.text("All expenses are balanced! No settlements needed.", ML, y);
      y += 8;
    } else {
      simplifiedPayments.forEach((p) => {
        doc.setFont("helvetica", "bold");
        doc.text(p.fromName, ML, y);
        doc.setFont("helvetica", "normal");
        doc.text(" needs to pay ", ML + 30, y);
        doc.setFont("helvetica", "bold");
        doc.text(p.toName, ML + 55, y);
        doc.text(fmt(p.amount), ML + 100, y);
        y += 6;

        if (y > PH - 25) {
          doc.addPage();
          y = 20;
        }
      });
    }

    y += 10;
    if (y > PH - 25) { doc.addPage(); y = 20; }

    // Section 2: Traveler Net Balances Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(124, 58, 237);
    doc.text("Travelers Ledger & Balances", ML, y);
    doc.line(ML, y + 2, ML + CW, y + 2);

    y += 8;
    // Table Header
    doc.setFillColor(243, 244, 246);
    doc.rect(ML, y, CW, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text("Traveler Name", ML + 2, y + 5.5);
    doc.text("Paid (Total)", ML + 50, y + 5.5);
    doc.text("Owed (Share)", ML + 90, y + 5.5);
    doc.text("Net Balance", ML + 130, y + 5.5);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);

    memberBalances.forEach((bal) => {
      doc.text(bal.name, ML + 2, y + 5);
      doc.text(fmt(bal.paid), ML + 50, y + 5);
      doc.text(fmt(bal.owed), ML + 90, y + 5);
      
      if (bal.net >= 0) {
        doc.setTextColor(16, 185, 129); // Green
        doc.text(`+${fmt(bal.net)}`, ML + 130, y + 5);
      } else {
        doc.setTextColor(239, 68, 68); // Red
        doc.text(`-${fmt(Math.abs(bal.net))}`, ML + 130, y + 5);
      }
      doc.setTextColor(55, 65, 81);
      
      doc.line(ML, y + 8, ML + CW, y + 8);
      y += 8;

      if (y > PH - 25) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10;
    if (y > PH - 25) { doc.addPage(); y = 20; }

    // Section 3: Expenses Log
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(124, 58, 237);
    doc.text("Expenses Detail Log", ML, y);
    doc.line(ML, y + 2, ML + CW, y + 2);

    y += 8;
    doc.setFillColor(243, 244, 246);
    doc.rect(ML, y, CW, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text("Date", ML + 2, y + 5.5);
    doc.text("Expense", ML + 25, y + 5.5);
    doc.text("Paid By", ML + 80, y + 5.5);
    doc.text("Category", ML + 115, y + 5.5);
    doc.text("Amount", ML + 150, y + 5.5);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);

    expenses.forEach((e) => {
      const payer = members.find(m => m.id === e.paidById)?.name || "Unknown";
      const cat = categories.find(c => c.id === e.category)?.name || e.category;
      
      doc.text(e.date, ML + 2, y + 5);
      doc.text(e.name.length > 25 ? e.name.substring(0, 23) + ".." : e.name, ML + 25, y + 5);
      doc.text(payer, ML + 80, y + 5);
      doc.text(cat, ML + 115, y + 5);
      doc.text(`${e.amount} ${e.currency}`, ML + 150, y + 5);

      doc.line(ML, y + 8, ML + CW, y + 8);
      y += 8;

      if (y > PH - 25) {
        doc.addPage();
        y = 20;
      }
    });

    // Add footer copyright on the last page or all pages
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Generated via ToolsTrek (toolstrek.com) | © ToolsTrek - All Rights Reserved", ML, PH - 10);

    // Save
    doc.save(`${(tripDetails.name || "Untitled Trip").toLowerCase().replace(/\s+/g, "-")}-budget-report.pdf`);
    toast.success("PDF exported successfully!");
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const catMatch = filterCategory === "all" || e.category === filterCategory;
      const payerMatch = filterPaidBy === "all" || e.paidById === filterPaidBy;
      return catMatch && payerMatch;
    });
  }, [expenses, filterCategory, filterPaidBy]);

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="min-h-screen text-gray-900 dark:text-gray-100 pb-12 font-sans select-none">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs lg:text-sm font-semibold tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Travel Budget Splitter
              </span>
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs lg:text-sm font-semibold">
                Bangladesh Edition (BDT)
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {tripDetails.name || "Untitled Trip"}
            </h1>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1.5 flex flex-wrap items-center gap-1">
              <Calendar className="w-4 h-4 text-purple-500" />
              {tripDetails.startDate && tripDetails.endDate ? (
                <>
                  <span>{tripDetails.startDate} to {tripDetails.endDate}</span>
                  <span className="mx-1">•</span>
                </>
              ) : null}
              <span>Base Currency: <strong>{tripDetails.baseCurrency} ({currencySymbol})</strong></span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {expenses.length === 0 && (
              <button
                onClick={handleLoadSample}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm lg:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                }}
              >
                <Sparkles className="w-4 h-4" /> Load Sample
              </button>
            )}
            <button
              onClick={() => handleOpenAddModal()}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm lg:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2.5 rounded-lg text-sm lg:text-base font-semibold shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-500" /> Export PDF
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 px-3 py-2.5 rounded-lg text-sm lg:text-base font-semibold transition-all duration-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* QUICK STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute right-4 top-4 bg-purple-500/10 p-2.5 rounded-lg text-purple-600 dark:text-purple-400">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Total Trip Spending</span>
            <h3 className="text-2xl lg:text-3xl font-extrabold mt-1.5 text-gray-900 dark:text-white">
              {currencySymbol}{totalSpentBase.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
              <span>Limit: {currencySymbol}{tripDetails.budgetLimit}</span>
              <span>•</span>
              <span className={totalSpentBase > tripDetails.budgetLimit ? "text-rose-500 font-semibold animate-pulse" : "text-emerald-500 font-semibold"}>
                {tripDetails.budgetLimit > 0 ? ((totalSpentBase / tripDetails.budgetLimit) * 100).toFixed(0) : "0"}% used
              </span>
            </p>
            {/* Limit progress bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalSpentBase > tripDetails.budgetLimit
                    ? "bg-rose-500"
                    : totalSpentBase > (tripDetails.budgetLimit * tripDetails.alertThreshold) / 100
                    ? "bg-amber-500"
                    : "bg-purple-500"
                }`}
                style={{ width: `${Math.min(100, tripDetails.budgetLimit > 0 ? (totalSpentBase / tripDetails.budgetLimit) * 100 : 0)}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 bg-emerald-500/10 p-2.5 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Average Share</span>
            <h3 className="text-2xl lg:text-3xl font-extrabold mt-1.5 text-gray-900 dark:text-white">
              {currencySymbol}{(totalSpentBase / (members.length || 1)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Equally distributed if split perfectly across {members.length} members.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 bg-indigo-500/10 p-2.5 rounded-lg text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">Total Entries / Debts</span>
            <h3 className="text-2xl lg:text-3xl font-extrabold mt-1.5 text-gray-900 dark:text-white">
              {expenses.length} / {simplifiedPayments.length}
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-2">
              {simplifiedPayments.length === 0 ? "All members are balanced!" : `${simplifiedPayments.length} payments simplify all balances.`}
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-sm lg:text-base font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors duration-150 ${
              activeTab === "dashboard"
                ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Dashboard & Settlements
          </button>
          <button
            onClick={() => setActiveTab("travelers")}
            className={`px-4 py-2 text-sm lg:text-base font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors duration-150 ${
              activeTab === "travelers"
                ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Trip & Travelers ({members.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 text-sm lg:text-base font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors duration-150 ${
              activeTab === "categories"
                ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Category Budgets ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("currencies")}
            className={`px-4 py-2 text-sm lg:text-base font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors duration-150 ${
              activeTab === "currencies"
                ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Exchange Rates
          </button>
        </div>

        {/* ACTIVE TAB CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* TAB: DASHBOARD & SETTLEMENTS */}
          {activeTab === "dashboard" && (
            <>
              {/* Left Column: Expenses list */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                    <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" /> Transaction Log
                    </h2>

                    {/* Simple Filters */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <div className="w-36">
                        <CustomDropdown
                          value={filterCategory}
                          options={[
                            { id: "all", name: "All Categories" },
                            ...categories.map(c => ({ id: c.id, name: c.name }))
                          ]}
                          onChange={setFilterCategory}
                          placeholder="Category"
                        />
                      </div>
                      <div className="w-36">
                        <CustomDropdown
                          value={filterPaidBy}
                          options={[
                            { id: "all", name: "All Payers" },
                            ...members.map(m => ({ id: m.id, name: m.name }))
                          ]}
                          onChange={setFilterPaidBy}
                          placeholder="Paid By"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expenses List */}
                  {filteredExpenses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                      <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">No expenses recorded yet.</p>
                      <div className="flex justify-center items-center gap-3 mt-3">
                        <button
                          onClick={() => handleOpenAddModal()}
                          className="text-xs lg:text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                        >
                          Add expense
                        </button>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                          onClick={handleLoadSample}
                          className="text-xs lg:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Load Sample
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredExpenses.map((exp) => {
                        const payer = members.find(m => m.id === exp.paidById);
                        const cat = categories.find(c => c.id === exp.category);
                        const CatIcon = cat && categoryIcons[cat.icon] ? categoryIcons[cat.icon] : HelpCircle;
                        const itemBaseVal = exp.amount * (exchangeRates[exp.currency] || 1.0);

                        return (
                          <div
                            key={exp.id}
                            className="flex items-center justify-between gap-4 p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl hover:bg-gray-100/70 dark:hover:bg-gray-900/80 transition-all border border-gray-150 dark:border-gray-900/60"
                          >
                            <div className="flex items-center gap-3.5 overflow-hidden">
                              {/* Category Icon */}
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                                style={{ backgroundColor: cat?.color || "#6b7280" }}
                              >
                                <CatIcon className="w-5 h-5" />
                              </div>

                              <div className="overflow-hidden">
                                <h4 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white truncate">
                                  {exp.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                                    Paid by {payer?.name || "Unknown"}
                                  </span>
                                  <span>•</span>
                                  <span>{exp.date}</span>
                                  <span>•</span>
                                  <span className="capitalize bg-gray-200/60 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px] lg:text-xs">
                                    {exp.splitType} split
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions & Price */}
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-sm lg:text-base font-bold text-gray-900 dark:text-white block">
                                  {exp.amount.toLocaleString("en-US")} {exp.currency}
                                </span>
                                {exp.currency !== tripDetails.baseCurrency && (
                                  <span className="text-xs lg:text-sm text-gray-400 block font-medium">
                                    ~{currencySymbol}{itemBaseVal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenAddModal(exp)}
                                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                                  title="Edit Expense"
                                >
                                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Delete Expense"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Category Budgets live status */}
                <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-5 shadow-sm">
                  <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" /> Category Budgets Status
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map(cat => {
                      const spent = categorySpentMap[cat.id] || 0;
                      const percent = Math.min(100, cat.budget > 0 ? (spent / cat.budget) * 100 : 0);
                      const isOver = spent > cat.budget;
                      const CatIcon = categoryIcons[cat.icon] || HelpCircle;

                      return (
                        <div key={cat.id} className="p-3.5 border border-gray-100 dark:border-gray-900 rounded-xl bg-gray-50/50 dark:bg-gray-900/20">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span
                                className="w-3.5 h-3.5 rounded-md flex-shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <CatIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="text-xs lg:text-sm font-bold truncate text-gray-700 dark:text-gray-300">
                                {cat.name}
                              </span>
                            </div>
                            <span className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                              {currencySymbol}{spent.toFixed(0)} / {currencySymbol}{cat.budget.toFixed(0)}
                            </span>
                          </div>

                          <div className="w-full bg-gray-150 dark:bg-gray-800 h-2 rounded-full overflow-hidden mb-1">
                            <div
                              className={`h-full rounded-full transition-all duration-300`}
                              style={{ width: `${percent}%`, backgroundColor: cat.color }}
                            />
                          </div>

                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[11px] lg:text-xs text-gray-400 font-medium">
                              {percent.toFixed(0)}% utilized
                            </span>
                            {isOver && (
                              <span className="text-[11px] lg:text-xs text-rose-500 font-bold flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> Over budget!
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Settlement Instructions */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Simplified Settlement Matrix */}
                <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-5 shadow-sm">
                  <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white mb-3.5 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Simplified Settlements
                  </h2>
                  
                  {simplifiedPayments.length === 0 ? (
                    <div className="text-center py-8 bg-purple-500/5 border border-purple-100 dark:border-purple-950/30 rounded-xl">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs lg:text-sm text-purple-700 dark:text-purple-400 font-bold">Trip Balances Clear!</p>
                      <p className="text-xs lg:text-sm text-gray-400 mt-1 px-4">No transactions required. Everyone has paid their fair share.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {simplifiedPayments.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-purple-50/40 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/20 rounded-xl flex items-center gap-2 justify-between"
                        >
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-200 truncate max-w-[80px] sm:max-w-none">
                                {p.fromName}
                              </span>
                              <span className="text-xs lg:text-sm text-gray-400 shrink-0 font-medium">owes</span>
                              <span className="text-xs lg:text-sm font-bold text-purple-600 dark:text-purple-400 truncate max-w-[80px] sm:max-w-none">
                                {p.toName}
                              </span>
                            </div>
                            <span className="text-[11px] lg:text-xs text-gray-400 block font-medium mt-0.5">
                              Transfer direct or split-balance
                            </span>
                          </div>
                          <span className="text-sm lg:text-base font-extrabold text-gray-900 dark:text-white shrink-0 bg-white dark:bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-150 dark:border-gray-800">
                            {currencySymbol}{p.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Traveler Ledger Breakdown */}
                <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-5 shadow-sm">
                  <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" /> Traveler Ledger
                  </h2>

                  <div className="space-y-4">
                    {memberBalances.map((bal) => (
                      <div key={bal.id} className="text-xs lg:text-sm border-b border-gray-100 dark:border-gray-900 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800 dark:text-gray-200">{bal.name}</span>
                          <span className={`font-extrabold ${
                            bal.net >= 0.01
                              ? "text-emerald-600 dark:text-emerald-400"
                              : bal.net < -0.01
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-gray-500"
                          }`}>
                            {bal.net >= 0
                              ? `+${currencySymbol}${bal.net.toFixed(2)}`
                              : `-${currencySymbol}${Math.abs(bal.net).toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-400 font-medium">
                          <span>Paid: {currencySymbol}{bal.paid.toFixed(0)}</span>
                          <span>Owed share: {currencySymbol}{bal.owed.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* TAB: TRIP & TRAVELERS */}
          {activeTab === "travelers" && (
            <div className="lg:col-span-12 space-y-6">
              
              {/* Trip settings detail */}
              <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-6 shadow-sm">
                <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" /> Customize Trip Parameters
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Trip Name
                    </label>
                    <input
                      type="text"
                      value={tripDetails.name}
                      onChange={(e) => setTripDetails(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Sajek Valley Escape 2026"
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm lg:text-base text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Trip Base Currency
                    </label>
                    <CustomDropdown
                      value={tripDetails.baseCurrency}
                      options={CURRENCY_PRESETS.map(c => ({ value: c.code, label: `${c.code} (${c.symbol})` }))}
                      onChange={handleBaseCurrencyChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Trip Budget Limit ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={tripDetails.budgetLimit}
                      onChange={(e) => setTripDetails(prev => ({ ...prev, budgetLimit: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm lg:text-base text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Budget Alert Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={tripDetails.alertThreshold}
                      onChange={(e) => setTripDetails(prev => ({ ...prev, alertThreshold: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm lg:text-base text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <DateSelector
                      label="Trip Start Date"
                      dateStr={tripDetails.startDate}
                      onChange={(newDate) => setTripDetails(prev => ({ ...prev, startDate: newDate }))}
                    />
                    <DateSelector
                      label="Trip End Date"
                      dateStr={tripDetails.endDate}
                      onChange={(newDate) => setTripDetails(prev => ({ ...prev, endDate: newDate }))}
                    />
                  </div>
                </div>
              </div>

              {/* Travelers lists */}
              <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-6 shadow-sm">
                <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" /> Manage Group Travelers
                </h2>

                <form onSubmit={handleAddMember} className="flex gap-3 mb-6 max-w-md">
                  <input
                    type="text"
                    placeholder="Enter traveler's name..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm lg:text-base text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm lg:text-base font-semibold transition cursor-pointer"
                  >
                    Add
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {members.map(m => (
                    <div
                      key={m.id}
                      className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200/50 dark:border-gray-800 flex justify-between items-center gap-2"
                    >
                      <span className="text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-200">{m.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-gray-400 hover:text-rose-500 p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-md transition duration-150 cursor-pointer"
                        title="Remove Traveler"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: CATEGORY BUDGETS */}
          {activeTab === "categories" && (
            <div className="lg:col-span-12 space-y-6">
              <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-6 shadow-sm">
                <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-500" /> Category Allocation & Customization
                </h2>

                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-150 dark:border-gray-900">
                  <div className="sm:col-span-1">
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Flight tickets"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm lg:text-base text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Budget ({currencySymbol})</label>
                    <input
                      type="number"
                      placeholder="Budget"
                      value={newCatBudget}
                      onChange={(e) => setNewCatBudget(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm lg:text-base text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Color / Icon</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
                      />
                      <div className="flex-1">
                        <CustomDropdown
                          value={newCatIcon}
                          options={[
                            { id: "Home", name: "Home" },
                            { id: "Plane", name: "Plane" },
                            { id: "Utensils", name: "Utensils" },
                            { id: "Compass", name: "Compass" },
                            { id: "ShoppingBag", name: "Shopping" },
                            { id: "Briefcase", name: "Luggage" },
                            { id: "HelpCircle", name: "Other" }
                          ]}
                          onChange={setNewCatIcon}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm lg:text-base font-semibold transition cursor-pointer"
                    >
                      Add Category
                    </button>
                  </div>
                </form>

                {/* Categories Table/List */}
                <div className="space-y-4">
                  {categories.map((cat, idx) => {
                    const CatIcon = categoryIcons[cat.icon] || HelpCircle;
                    return (
                      <div
                        key={cat.id}
                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200/50 dark:border-gray-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: cat.color }}
                          >
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs lg:text-sm font-extrabold text-gray-900 dark:text-white block">
                              {cat.name}
                            </span>
                            <span className="text-[11px] lg:text-xs text-gray-400 block mt-0.5">
                              ID: {cat.id}
                            </span>
                          </div>
                        </div>

                        {/* Budget edit inline */}
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div>
                            <label className="block text-[11px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                              Budget Limit
                            </label>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm lg:text-base font-bold text-gray-700 dark:text-gray-300">
                                {currencySymbol}
                              </span>
                              <input
                                type="number"
                                value={cat.budget}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setCategories(prev => prev.map((c, i) => i === idx ? { ...c, budget: val } : c));
                                }}
                                className="w-24 px-2 py-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded text-xs lg:text-sm font-bold text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat.id)}
                            className="text-gray-400 hover:text-rose-500 p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition cursor-pointer self-end"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXCHANGE RATES */}
          {activeTab === "currencies" && (
            <div className="lg:col-span-12 space-y-6">
              <div className="bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-6 shadow-sm">
                <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-500" /> Exchange Rates Manager
                </h2>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Set exchange rates relative to 1 unit of foreign currency. For example, if base currency is BDT and rate for USD is 118, then <strong>1 USD = 118 BDT</strong>. Add new currencies as needed.
                </p>

                {/* Add Custom Rate Form */}
                <form onSubmit={handleAddNewCurrency} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-150 dark:border-gray-900">
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Currency Code (3 Letters)</label>
                    <input
                      type="text"
                      placeholder="e.g. SGD"
                      value={newCurrencyCode}
                      onChange={(e) => setNewCurrencyCode(e.target.value)}
                      maxLength={3}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm lg:text-base text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Rate (units in {tripDetails.baseCurrency})</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 1.45"
                      value={newCurrencyRate}
                      onChange={(e) => setNewCurrencyRate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-sm lg:text-base text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm lg:text-base font-semibold transition cursor-pointer"
                    >
                      Add Currency Rate
                    </button>
                  </div>
                </form>

                {/* Exchange Rates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.keys(exchangeRates).map(code => {
                    const isBase = code === tripDetails.baseCurrency;
                    return (
                      <div
                        key={code}
                        className={`p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border flex flex-col justify-between gap-3 ${
                          isBase ? "border-purple-300 dark:border-purple-900/50 bg-purple-500/5" : "border-gray-200/50 dark:border-gray-800/80"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm lg:text-base font-extrabold text-gray-800 dark:text-gray-200">{code}</span>
                          {isBase && (
                            <span className="text-[11px] lg:text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                              Base Currency
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-[11px] lg:text-xs font-semibold text-gray-400 mb-1">
                            1 {code} =
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="any"
                              value={exchangeRates[code]}
                              disabled={isBase}
                              onChange={(e) => handleUpdateRate(code, e.target.value)}
                              className="w-full px-2 py-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-850 rounded text-xs lg:text-sm font-bold text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none disabled:opacity-50"
                            />
                            <span className="text-xs lg:text-sm font-semibold text-gray-500">{tripDetails.baseCurrency}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* INFO SECTION AFTER MAIN CONTAINER */}
        <div className="mt-12 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white border-b border-gray-150 dark:border-gray-850 pb-3 flex items-center gap-2">
            <Info className="w-5.5 h-5.5 text-purple-500" /> Travel Budgeting & Expense Splitting Guide (Bangladesh Edition)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs lg:text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-2 text-sm lg:text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500" /> 1. Debt Simplification Algorithm
              </h3>
              <p className="leading-relaxed">
                Our splitter uses a <strong>Minimum Cash Flow (Debt Simplification)</strong> engine. Instead of complex peer-to-peer debts (which can result in a confusing circle of transactions), we aggregate net balances. 
                The algorithm matches members with negative balances (debtors) to members with positive balances (creditors), minimizing transactions so that everyone settles up in the fewest steps possible.
              </p>
            </div>
            
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-2 text-sm lg:text-base flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-purple-500" /> 2. Multi-Currency Support (BDT Target)
              </h3>
              <p className="leading-relaxed">
                Bangladeshi travelers frequently cross borders to India, Thailand, or Nepal. By setting exchange rates relative to <strong>BDT</strong> (e.g. 1 USD = 118 BDT, 1 INR = 1.41 BDT), you can enter expenses in the native local currency of your transactions. The splitter converts it back to BDT automatically, keeping your overall budget in sync.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-2 text-sm lg:text-base flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-purple-500" /> 3. Advanced Split Methods
              </h3>
              <p className="leading-relaxed">
                Trips are rarely split 100% equally. With custom weights, you can allocate double shares for couples, or half-shares for children. Exclude members if they sat out of an activity (like tours or dinners), or assign unequal exact shares when a traveler buys their own specific items on a combined ticket.
              </p>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 text-xs lg:text-sm text-purple-800 dark:text-purple-300">
            <span className="font-bold flex items-center gap-1.5 mb-1 text-sm lg:text-base">
              <Info className="w-4.5 h-4.5" /> Best Practices for Group Travel Budgets
            </span>
            <ul className="list-disc pl-5 space-y-1 leading-relaxed">
              <li>Agree on a central base currency (usually BDT for local trips) and sync local exchange rates before starting the trip.</li>
              <li>Establish category limits (e.g. Resort, Transport, Dining) in advance to prevent overspending.</li>
              <li>Use the split weights feature when a member is accompanied by a spouse/child to ensure splits remain fair.</li>
              <li>Export and save the PDF report immediately after settling up to maintain a historical backup of your trip ledger.</li>
            </ul>
          </div>
        </div>

        {/* --- MODAL: ADD/EDIT EXPENSE (Overflow Visible fixed) --- */}
        {showAddModal && (
          <div className="fixed inset-0 z-[1000] flex justify-center items-start p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-visible my-8">
              <div className="flex justify-between items-center p-4 border-b border-gray-150 dark:border-gray-850 bg-gray-50 dark:bg-gray-900 rounded-t-xl">
                <h3 className="text-sm lg:text-base font-extrabold text-gray-900 dark:text-white">
                  {editingExpenseId ? "Modify Expense" : "Log New Expense"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-850 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="p-5 space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Expense Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swiss Chalet Rental"
                    value={expName}
                    onChange={(e) => setExpName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-xs lg:text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Amount & Currency */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0.00"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-xs lg:text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Currency
                    </label>
                    <CustomDropdown
                      value={expCurrency}
                      options={Object.keys(exchangeRates).map(code => ({ value: code, label: code }))}
                      onChange={setExpCurrency}
                    />
                  </div>
                </div>

                {/* Category & Paid By */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Category
                    </label>
                    <CustomDropdown
                      value={expCategory}
                      options={categories.map(c => ({ value: c.id, label: c.name }))}
                      onChange={setExpCategory}
                    />
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Paid By
                    </label>
                    <CustomDropdown
                      value={expPaidBy}
                      options={members.map(m => ({ value: m.id, label: m.name }))}
                      onChange={setExpPaidBy}
                    />
                  </div>
                </div>

                {/* Date & Split Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateSelector
                    label="Transaction Date"
                    dateStr={expDate}
                    onChange={(newDate) => setExpDate(newDate)}
                  />
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Split Type
                    </label>
                    <CustomDropdown
                      value={expSplitType}
                      options={[
                        { id: "equal", name: "Split Equally" },
                        { id: "weights", name: "Split by Weights" },
                        { id: "percentage", name: "Split by Percentages" },
                        { id: "unequal", name: "Split Unequally" }
                      ]}
                      onChange={setExpSplitType}
                    />
                  </div>
                </div>

                {/* ADVANCED SPLIT EDIT DETAILS */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-150 dark:border-gray-850/80">
                  <h4 className="text-xs lg:text-sm font-bold text-gray-900 dark:text-white mb-3">
                    Splitting Configuration & Ratios
                  </h4>

                  {/* EQUAL SPLIT (CHECKBOXES TO EXCLUDE) */}
                  {expSplitType === "equal" && (
                    <div className="space-y-2">
                      <span className="text-[11px] lg:text-xs text-gray-400 block mb-1">
                        Uncheck travelers to exclude them from this expense:
                      </span>
                      {members.map(m => {
                        const included = !expExcluded.includes(m.id);
                        return (
                          <label key={m.id} className="flex items-center gap-2 text-xs lg:text-sm cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={included}
                              onChange={() => {
                                if (included) {
                                  setExpExcluded(prev => [...prev, m.id]);
                                } else {
                                  setExpExcluded(prev => prev.filter(id => id !== m.id));
                                }
                              }}
                              className="rounded border-gray-300 dark:border-gray-800 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{m.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* WEIGHTS SPLIT */}
                  {expSplitType === "weights" && (
                    <div className="space-y-3">
                      <span className="text-[11px] lg:text-xs text-gray-400 block">
                        Specify weight ratios (e.g. 1 share, 2 shares, 0 to exclude):
                      </span>
                      {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between gap-3">
                          <span className="text-xs lg:text-sm font-bold text-gray-700 dark:text-gray-300">{m.name}</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={expWeights[m.id] !== undefined ? expWeights[m.id] : 1}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setExpWeights(prev => ({ ...prev, [m.id]: isNaN(val) ? 0 : val }));
                            }}
                            className="w-24 px-2 py-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded text-xs lg:text-sm font-bold text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PERCENTAGES SPLIT */}
                  {expSplitType === "percentage" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] lg:text-xs text-gray-400">
                          Enter target percentage shares (total must equal 100%):
                        </span>
                        <span className={`text-xs lg:text-sm font-bold ${
                          Math.abs(members.reduce((s, m) => s + parseFloat(expPercentages[m.id] || 0), 0) - 100) < 0.1
                            ? "text-emerald-500"
                            : "text-rose-500 animate-pulse"
                        }`}>
                          Sum: {members.reduce((s, m) => s + parseFloat(expPercentages[m.id] || 0), 0).toFixed(1)}%
                        </span>
                      </div>
                      {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between gap-3">
                          <span className="text-xs lg:text-sm font-bold text-gray-700 dark:text-gray-300">{m.name}</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={expPercentages[m.id] !== undefined ? expPercentages[m.id] : ""}
                              placeholder="0.0"
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setExpPercentages(prev => ({ ...prev, [m.id]: isNaN(val) ? "" : val }));
                              }}
                              className="w-24 px-2 py-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded text-xs lg:text-sm font-bold text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none text-right"
                            />
                            <span className="text-xs lg:text-sm text-gray-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* UNEQUAL SPLIT (CUSTOM AMOUNTS) */}
                  {expSplitType === "unequal" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] lg:text-xs text-gray-400">
                          Enter exact shares (must sum to total: {expAmount || 0} {expCurrency}):
                        </span>
                        <span className={`text-xs lg:text-sm font-bold ${
                          Math.abs(members.reduce((s, m) => s + parseFloat(expShares[m.id] || 0), 0) - (parseFloat(expAmount) || 0)) < 0.05
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }`}>
                          Sum: {members.reduce((s, m) => s + parseFloat(expShares[m.id] || 0), 0).toFixed(2)} / {parseFloat(expAmount) || 0}
                        </span>
                      </div>
                      {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between gap-3">
                          <span className="text-xs lg:text-sm font-bold text-gray-700 dark:text-gray-300">{m.name}</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={expShares[m.id] !== undefined ? expShares[m.id] : ""}
                              placeholder="0.00"
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setExpShares(prev => ({ ...prev, [m.id]: isNaN(val) ? "" : val }));
                              }}
                              className="w-24 px-2 py-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded text-xs lg:text-sm font-bold text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none text-right"
                            />
                            <span className="text-xs lg:text-sm text-gray-500">{expCurrency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Form submit */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-150 dark:border-gray-850">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 text-xs lg:text-sm font-semibold text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs lg:text-sm font-bold shadow-md cursor-pointer"
                  >
                    {editingExpenseId ? "Save Changes" : "Create Transaction"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* --- MODAL: DOUBLE CONFIRM RESET --- */}
        {showResetModal && (
          <div className="fixed inset-0 z-[1000] flex justify-center items-start p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150 overflow-visible my-8">
              <div className="p-5 text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h3 className="text-sm lg:text-base font-extrabold text-gray-900 dark:text-white mb-2">
                  Clear Trip Ledger Data?
                </h3>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  This will permanently clear all travelers, custom currency rates, logged expenses, and category allocations. This action cannot be undone. Are you sure you want to clear all data?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-800 text-xs lg:text-sm font-semibold text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  >
                    Cancel, keep data
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs lg:text-sm font-bold shadow-md cursor-pointer"
                  >
                    Yes, clear data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ToolPageShell>
  );
}
