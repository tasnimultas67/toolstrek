"use client";
import React, { useState, useMemo } from "react";
import ToolPageShell from "../../ToolPageShell";
import WeddingPdfExport from "./WeddingPdfExport";
import {
  Heart,
  DollarSign,
  Users,
  Plus,
  Trash2,
  RotateCcw,
  HelpCircle,
  Coins,
  ChevronDown,
  ChevronUp,
  Percent,
  AlertTriangle,
  Info
} from "lucide-react";

// Default currency configurations
const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
  { code: "INR", symbol: "₹" },
  { code: "BDT", symbol: "৳" },
  { code: "AED", symbol: "د.إ" },
  { code: "JPY", symbol: "¥" }
];

// Default categories and sub-items template
const DEFAULT_CATEGORIES = [
  {
    id: "venue-catering",
    name: "Venue & Catering",
    percentage: 45,
    active: true,
    color: "#EC4899", // Rose 500
    items: [
      { id: "v-rental", name: "Venue Rental Fee", estimateShare: 30, estimate: 0, actual: "" },
      { id: "v-food", name: "Food & Catering Services", estimateShare: 50, estimate: 0, actual: "" },
      { id: "v-bar", name: "Bar & Drinks", estimateShare: 15, estimate: 0, actual: "" },
      { id: "v-cake", name: "Wedding Cake & Desserts", estimateShare: 5, estimate: 0, actual: "" }
    ]
  },
  {
    id: "photo-video",
    name: "Photography & Video",
    percentage: 12,
    active: true,
    color: "#8B5CF6", // Violet 500
    items: [
      { id: "p-photo", name: "Main Photographer", estimateShare: 60, estimate: 0, actual: "" },
      { id: "p-video", name: "Videographer & Teaser", estimateShare: 40, estimate: 0, actual: "" }
    ]
  },
  {
    id: "attire-rings",
    name: "Attire, Beauty & Rings",
    percentage: 10,
    active: true,
    color: "#3B82F6", // Blue 500
    items: [
      { id: "a-dress", name: "Wedding Dress & Alterations", estimateShare: 40, estimate: 0, actual: "" },
      { id: "a-suit", name: "Suit / Tuxedo Rental", estimateShare: 15, estimate: 0, actual: "" },
      { id: "a-makeup", name: "Hair & Makeup Services", estimateShare: 15, estimate: 0, actual: "" },
      { id: "a-rings", name: "Wedding Rings / Bands", estimateShare: 30, estimate: 0, actual: "" }
    ]
  },
  {
    id: "flowers-decor",
    name: "Flowers & Decor",
    percentage: 8,
    active: true,
    color: "#10B981", // Emerald 500
    items: [
      { id: "f-florals", name: "Bouquets & Ceremony Florals", estimateShare: 40, estimate: 0, actual: "" },
      { id: "f-center", name: "Reception Centerpieces", estimateShare: 30, estimate: 0, actual: "" },
      { id: "f-light", name: "Ambient Lighting & Signage", estimateShare: 30, estimate: 0, actual: "" }
    ]
  },
  {
    id: "music-entertainment",
    name: "Music & Entertainment",
    percentage: 7,
    active: true,
    color: "#F59E0B", // Amber 500
    items: [
      { id: "e-ceremony", name: "Ceremony Musicians", estimateShare: 30, estimate: 0, actual: "" },
      { id: "e-reception", name: "Reception DJ / Live Band", estimateShare: 70, estimate: 0, actual: "" }
    ]
  },
  {
    id: "stationery-gifts",
    name: "Invitations & Stationery",
    percentage: 3,
    active: true,
    color: "#06B6D4", // Cyan 500
    items: [
      { id: "s-invites", name: "Wedding Invitations & RSVPs", estimateShare: 50, estimate: 0, actual: "" },
      { id: "s-postage", name: "Postage & Digital Invites", estimateShare: 20, estimate: 0, actual: "" },
      { id: "s-favors", name: "Guest Favors & Gifts", estimateShare: 30, estimate: 0, actual: "" }
    ]
  },
  {
    id: "planning-legal",
    name: "Planning & Officiant",
    percentage: 10,
    active: true,
    color: "#6366F1", // Indigo 500
    items: [
      { id: "l-planner", name: "Wedding Coordinator / Planner", estimateShare: 80, estimate: 0, actual: "" },
      { id: "l-legal", name: "Marriage License & Officiant Fee", estimateShare: 20, estimate: 0, actual: "" }
    ]
  },
  {
    id: "emergency-buffer",
    name: "Emergency Buffer",
    percentage: 5,
    active: true,
    color: "#EF4444", // Red 500
    items: [
      { id: "em-buffer", name: "Unforeseen Costs Buffer", estimateShare: 100, estimate: 0, actual: "" }
    ]
  }
];

// Profile Preset Distributions
const PRIORITY_PROFILES = [
  {
    id: "standard",
    name: "Balanced Standard",
    description: "Traditional balanced distribution across all categories.",
    splits: {
      "venue-catering": 45,
      "photo-video": 12,
      "attire-rings": 10,
      "flowers-decor": 8,
      "music-entertainment": 7,
      "stationery-gifts": 3,
      "planning-legal": 10,
      "emergency-buffer": 5
    }
  },
  {
    id: "foodie",
    name: "Foodie & Venue Focus",
    description: "Prioritizes premium dining experiences and stunning venue rentals.",
    splits: {
      "venue-catering": 60,
      "photo-video": 8,
      "attire-rings": 7,
      "flowers-decor": 6,
      "music-entertainment": 6,
      "stationery-gifts": 2,
      "planning-legal": 7,
      "emergency-buffer": 4
    }
  },
  {
    id: "photo",
    name: "Photogenic Focus",
    description: "Prioritizes top-tier wedding photography and cinematic videography.",
    splits: {
      "venue-catering": 40,
      "photo-video": 22,
      "attire-rings": 9,
      "flowers-decor": 7,
      "music-entertainment": 6,
      "stationery-gifts": 2,
      "planning-legal": 9,
      "emergency-buffer": 5
    }
  },
  {
    id: "party",
    name: "Party & Music Focus",
    description: "Invests in exceptional live music, DJs, sound systems, and an open bar.",
    splits: {
      "venue-catering": 40,
      "photo-video": 10,
      "attire-rings": 8,
      "flowers-decor": 6,
      "music-entertainment": 20,
      "stationery-gifts": 2,
      "planning-legal": 9,
      "emergency-buffer": 5
    }
  }
];

export default function WeddingBudgetAllocator() {
  const [totalBudget, setTotalBudget] = useState("1500000");
  const [guestCount, setGuestCount] = useState("300");
  const [currencyCode, setCurrencyCode] = useState("BDT");
  const [selectedProfile, setSelectedProfile] = useState("standard");

  // Custom categories state
  const [categories, setCategories] = useState(() => JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)));
  const [expandedCategories, setExpandedCategories] = useState({});
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(null);

  // New Category & Item Form Inputs
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryPercentage, setNewCategoryPercentage] = useState("5");
  const [newItemsName, setNewItemsName] = useState({});

  // Sync with currency symbol
  const currencySymbol = useMemo(() => {
    const curr = CURRENCIES.find((c) => c.code === currencyCode);
    return curr ? curr.symbol : "$";
  }, [currencyCode]);

  // Compute values
  const budgetNum = parseFloat(totalBudget) || 0;
  const guestNum = parseInt(guestCount, 10) || 0;
  const costPerGuest = guestNum > 0 ? budgetNum / guestNum : 0;

  // Toggle Category Expand/Collapse
  const toggleExpand = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Profile presets handler
  const handleProfileChange = (profileId) => {
    setSelectedProfile(profileId);
    if (profileId === "custom") return;

    const profile = PRIORITY_PROFILES.find((p) => p.id === profileId);
    if (!profile) return;

    setCategories((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));

      // Update splits from preset
      cloned.forEach((cat) => {
        if (profile.splits[cat.id] !== undefined) {
          cat.percentage = profile.splits[cat.id];
          cat.active = true;
        } else {
          // If custom categories are present, set them to 0 or shrink
          cat.percentage = 0;
          cat.active = false;
        }
      });

      // Normalize to sum up to 100% just in case of differences
      let sum = cloned.reduce((acc, cat) => acc + (cat.active ? cat.percentage : 0), 0);
      if (sum > 0) {
        cloned.forEach((cat) => {
          if (cat.active) {
            cat.percentage = (cat.percentage / sum) * 100;
          }
        });
      }
      return cloned;
    });
  };

  // Helper to redistribute percentages among active categories
  const distributeChange = (clonedCats, targetId, delta) => {
    const activeOthers = clonedCats.filter((c) => c.id !== targetId && c.active);
    const sumOthers = activeOthers.reduce((acc, c) => acc + c.percentage, 0);

    if (sumOthers > 0) {
      activeOthers.forEach((c) => {
        // Redistribute delta proportionally
        const ratio = c.percentage / sumOthers;
        c.percentage = Math.max(0, c.percentage - delta * ratio);
      });
    } else if (activeOthers.length > 0) {
      // If others are all 0, distribute evenly
      const share = -delta / activeOthers.length;
      activeOthers.forEach((c) => {
        c.percentage = Math.max(0, c.percentage + share);
      });
    }

    // Double check sum is exactly 100
    let totalSum = clonedCats.reduce((acc, c) => acc + (c.active ? c.percentage : 0), 0);
    if (Math.abs(totalSum - 100) > 0.001 && activeOthers.length > 0) {
      const diff = 100 - totalSum;
      // Adjust the first other active category
      activeOthers[0].percentage = Math.max(0, activeOthers[0].percentage + diff);
    }
  };

  // Handle Slider / Percentage Change
  const handlePercentageChange = (catId, newPctVal) => {
    setSelectedProfile("custom");
    const newPct = Math.min(100, Math.max(0, parseFloat(newPctVal) || 0));

    setCategories((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = cloned.find((c) => c.id === catId);
      if (!target || !target.active) return prev;

      const delta = newPct - target.percentage;
      target.percentage = newPct;

      distributeChange(cloned, catId, delta);
      return cloned;
    });
  };

  // Toggle Category Active status
  const handleToggleCategory = (catId) => {
    setSelectedProfile("custom");
    setCategories((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = cloned.find((c) => c.id === catId);
      if (!target) return prev;

      if (target.active) {
        // Turning OFF: distribute its percentage to others
        const delta = -target.percentage;
        target.percentage = 0;
        target.active = false;
        distributeChange(cloned, catId, delta);
      } else {
        // Turning ON: give it a default 5%, shrinking others
        const initialVal = 5;
        target.active = true;
        target.percentage = initialVal;
        distributeChange(cloned, catId, initialVal);
      }
      return cloned;
    });
  };

  // Add Custom Category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSelectedProfile("custom");
    const pct = Math.min(50, Math.max(1, parseFloat(newCategoryPercentage) || 5));
    const newId = `custom-${Date.now()}`;
    const colors = ["#EC4899", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#06B6D4", "#6366F1", "#EF4444", "#14B8A6", "#F43F5E"];
    const randColor = colors[categories.length % colors.length];

    const newCatObj = {
      id: newId,
      name: newCategoryName,
      percentage: pct,
      active: true,
      color: randColor,
      items: [
        { id: `item-${Date.now()}`, name: "General Expense", estimateShare: 100, estimate: 0, actual: "" }
      ]
    };

    setCategories((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      // Add custom category
      cloned.push(newCatObj);
      // Redistribute percentages to accommodate new one
      distributeChange(cloned, newId, pct);
      return cloned;
    });

    setNewCategoryName("");
    setNewCategoryPercentage("5");
    toggleExpand(newId);
  };

  // Delete Custom Category
  const handleDeleteCategory = (catId) => {
    setSelectedProfile("custom");
    setCategories((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const targetIdx = cloned.findIndex((c) => c.id === catId);
      if (targetIdx === -1) return prev;

      const target = cloned[targetIdx];
      const delta = -target.percentage;
      cloned.splice(targetIdx, 1);

      // Re-distribute the removed percentage among active categories
      distributeChange(cloned, null, delta);
      return cloned;
    });
  };

  // Add Item to Category
  const handleAddItem = (catId) => {
    const itemName = newItemsName[catId] || "";
    if (!itemName.trim()) return;

    setCategories((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = cloned.find((c) => c.id === catId);
      if (!target) return prev;

      // Add item
      target.items.push({
        id: `item-${Date.now()}`,
        name: itemName,
        estimateShare: 0, // Will recalculate
        estimate: 0,
        actual: ""
      });

      // Recalculate estimateShare to split equally
      const totalItems = target.items.length;
      target.items.forEach((item) => {
        item.estimateShare = 100 / totalItems;
      });

      return cloned;
    });

    setNewItemsName((prev) => ({ ...prev, [catId]: "" }));
  };

  // Delete Item from Category
  const handleDeleteItem = (catId, itemId) => {
    setCategories((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = cloned.find((c) => c.id === catId);
      if (!target) return prev;

      target.items = target.items.filter((item) => item.id !== itemId);

      // Re-distribute estimateShare
      const totalItems = target.items.length;
      if (totalItems > 0) {
        target.items.forEach((item) => {
          item.estimateShare = 100 / totalItems;
        });
      }

      return cloned;
    });
  };

  // Update Item Actual Spent or Custom Estimate Share
  const handleItemValChange = (catId, itemId, field, value) => {
    setCategories((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = cloned.find((c) => c.id === catId);
      if (!target) return prev;

      const item = target.items.find((it) => it.id === itemId);
      if (!item) return prev;

      if (field === "actual") {
        // Clean actual input
        item.actual = value;
      } else if (field === "name") {
        item.name = value;
      } else if (field === "estimateShare") {
        item.estimateShare = parseFloat(value) || 0;
      }

      return cloned;
    });
  };

  // Reset calculator
  const handleReset = () => {
    setTotalBudget("1500000");
    setGuestCount("300");
    setCurrencyCode("BDT");
    setSelectedProfile("standard");
    setCategories(JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)));
    setExpandedCategories({});
    setNewCategoryName("");
    setNewCategoryPercentage("5");
    setNewItemsName({});
  };

  // Pre-calculate items estimated values dynamically based on category percentage and budget
  const finalCategories = useMemo(() => {
    return categories.map((cat) => {
      const catBudget = budgetNum * (cat.percentage / 100);

      // Sum of current estimateShares
      const sumShare = cat.items.reduce((acc, item) => acc + (parseFloat(item.estimateShare) || 0), 0);

      const items = cat.items.map((item) => {
        // If shares are not matching, compute proportion
        const shareRatio = sumShare > 0 ? (parseFloat(item.estimateShare) || 0) / sumShare : 1 / cat.items.length;
        const estimate = catBudget * shareRatio;
        const actualVal = parseFloat(item.actual) || 0;
        const variance = estimate - actualVal; // Positive is under, negative is over budget

        return {
          ...item,
          estimate,
          variance
        };
      });

      // Category totals
      const actualSum = items.reduce((acc, item) => acc + (parseFloat(item.actual) || 0), 0);
      const estSum = catBudget;
      const varianceSum = estSum - actualSum;

      return {
        ...cat,
        items,
        estSum,
        actualSum,
        varianceSum
      };
    });
  }, [categories, budgetNum]);

  // Aggregated calculations
  const totalAllocated = useMemo(() => {
    return finalCategories.reduce((acc, cat) => acc + (cat.active ? cat.estSum : 0), 0);
  }, [finalCategories]);

  const totalSpent = useMemo(() => {
    return finalCategories.reduce((acc, cat) => acc + (cat.active ? cat.actualSum : 0), 0);
  }, [finalCategories]);

  const remainingBudget = budgetNum - totalSpent;
  const totalVariance = totalAllocated - totalSpent;

  // Donut chart: use stroke-dasharray on <circle> elements (reliable, no arc-path bugs)
  // SVG circle: cx=50 cy=50 r=38 => circumference = 2*PI*38 = 238.76
  const DONUT_R = 38;
  const DONUT_CIRC = 2 * Math.PI * DONUT_R; // ≈ 238.76

  const donutData = useMemo(() => {
    const activeCats = finalCategories.filter((c) => c.active && c.percentage > 0);
    // Normalize percentages to sum exactly to 100
    const totalPct = activeCats.reduce((acc, c) => acc + c.percentage, 0);
    let cumulativeOffset = 0;

    return activeCats.map((cat) => {
      const pct = totalPct > 0 ? (cat.percentage / totalPct) * 100 : 0;
      // dasharray: the filled arc length, then gap
      const dashArray = `${(pct / 100) * DONUT_CIRC} ${DONUT_CIRC}`;
      // dashoffset: rotate so slice starts at the right position
      const dashOffset = DONUT_CIRC - (cumulativeOffset / 100) * DONUT_CIRC;
      cumulativeOffset += pct;

      return {
        ...cat,
        pct,
        dashArray,
        dashOffset,
      };
    });
  }, [finalCategories]);

  // Hover details for center of donut
  const donutHoveredInfo = useMemo(() => {
    if (hoveredCategoryIndex !== null && donutData[hoveredCategoryIndex]) {
      return donutData[hoveredCategoryIndex];
    }
    return null;
  }, [donutData, hoveredCategoryIndex]);

  return (
    <ToolPageShell className="px-4 py-8">
      {/* Container wrapper */}
      <div className="space-y-8 max-w-7xl mx-auto">

        {/* Header Block */}
        <div className="text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Wedding Budget Allocator
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl">
              Plan, distribute, and track your wedding budget with interactive category allocation, custom sliders, estimated vs. actual itemized trackers, and beautiful PDF exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-all duration-200 text-sm cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
            <WeddingPdfExport
              totalBudget={budgetNum}
              guestCount={guestNum}
              selectedProfileName={PRIORITY_PROFILES.find((p) => p.id === selectedProfile) ? PRIORITY_PROFILES.find((p) => p.id === selectedProfile).name : "Custom Plan"}
              currencyCode={currencyCode}
              currencySymbol={currencySymbol}
              categories={categories}
            />
          </div>
        </div>

        {/* Quick Settings Panel & Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Coins className="w-5 h-5 text-rose-500" />
              Budget Parameters
            </h2>

            {/* Total Budget Input */}
            <div className="space-y-2">
              <label htmlFor="total-budget" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Budget Allocation
              </label>
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center px-4 py-2.5 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition-all duration-200">
                <span className="text-slate-400 dark:text-slate-600 font-medium mr-2">{currencySymbol}</span>
                <input
                  id="total-budget"
                  type="number"
                  min="0"
                  step="500"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-slate-800 dark:text-slate-100 font-bold focus:ring-0 focus:outline-none"
                  placeholder="30000"
                />
              </div>
            </div>

            {/* Guest Count Slider & Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="guest-count" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estimated Guest Count
                </label>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{guestCount} guests</span>
              </div>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
                />
                <input
                  id="guest-count"
                  type="number"
                  min="0"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-20 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-center text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
              <label htmlFor="currency" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Preferred Currency
              </label>
              <select
                id="currency"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 cursor-pointer"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Presets */}
            <div className="space-y-2">
              <label htmlFor="preset-profile" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Priority Preset Profile
              </label>
              <select
                id="preset-profile"
                value={selectedProfile}
                onChange={(e) => handleProfileChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-200 cursor-pointer"
              >
                {PRIORITY_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value="custom">Custom Manual Distribution</option>
              </select>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                {PRIORITY_PROFILES.find((p) => p.id === selectedProfile)?.description || "Adjust sliders below to create your customized budget distribution."}
              </p>
            </div>
          </div>

          {/* Cards & Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* KPI 1: Cost per Guest */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Cost Per Guest
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">
                  {currencySymbol}{costPerGuest.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Based on {guestNum} guests and {currencySymbol}{budgetNum.toLocaleString()} budget.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2: Total Spent Variance */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Total Spent (Actual)
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">
                  {currencySymbol}{totalSpent.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${remainingBudget < 0 ? "bg-red-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
                  <span className={`text-xs font-semibold ${remainingBudget < 0 ? "text-red-500" : "text-emerald-500"}`}>
                    {remainingBudget < 0 ? "Over Budget" : "Within Budget"} ({currencySymbol}{Math.abs(remainingBudget).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })})
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Budget Progress Bar Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget Utilisation</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currencySymbol}{totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })} of {currencySymbol}{budgetNum.toLocaleString("en-US", { maximumFractionDigits: 0 })} spent
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(100, budgetNum > 0 ? (totalSpent / budgetNum) * 100 : 0)}%`,
                    background: totalSpent > budgetNum
                      ? "linear-gradient(90deg, #ef4444, #f87171)"
                      : "linear-gradient(90deg, #ec4899, #8b5cf6)"
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-semibold text-slate-400">
                <span>{budgetNum > 0 ? ((totalSpent / budgetNum) * 100).toFixed(1) : "0.0"}% used</span>
                <span className={remainingBudget >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {remainingBudget >= 0 ? `${currencySymbol}${remainingBudget.toLocaleString("en-US", { maximumFractionDigits: 0 })} remaining` : `${currencySymbol}${Math.abs(remainingBudget).toLocaleString("en-US", { maximumFractionDigits: 0 })} over budget`}
                </span>
              </div>
            </div>

            {/* Donut Chart and Interactive Breakdown Card */}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8">

              {/* Dynamic SVG Donut Chart */}
              <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                {donutData.length === 0 ? (
                  <div className="text-center text-slate-400 dark:text-slate-500 space-y-1">
                    <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
                    <p className="text-xs font-medium">No active categories</p>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {donutData.map((slice, index) => (
                        <circle
                          key={slice.id}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth={hoveredCategoryIndex === index ? 9 : 7}
                          strokeDasharray={slice.dashArray}
                          strokeDashoffset={slice.dashOffset}
                          className="transition-all duration-300 cursor-pointer"
                          style={{
                            transformOrigin: "50px 50px",
                            transform: hoveredCategoryIndex === index ? "scale(1.02)" : "none"
                          }}
                          onMouseEnter={() => setHoveredCategoryIndex(index)}
                          onMouseLeave={() => setHoveredCategoryIndex(null)}
                        />
                      ))}
                    </svg>

                    {/* Donut Center */}
                    <div className="absolute inset-8 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center p-2 shadow-inner border border-slate-50 dark:border-slate-950 pointer-events-none">
                      {donutHoveredInfo ? (
                        <>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider truncate max-w-full"
                            style={{ color: donutHoveredInfo.color }}
                          >
                            {donutHoveredInfo.name}
                          </span>
                          <span className="text-base font-black text-slate-800 dark:text-slate-100">
                            {currencySymbol}{donutHoveredInfo.estSum.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {donutHoveredInfo.percentage.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Total Est
                          </span>
                          <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                            {currencySymbol}{totalAllocated.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            of {currencySymbol}{budgetNum.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Chart Legend List */}
              <div className="grow w-full space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Allocation Breakdown
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Total: {totalAllocated === budgetNum ? "100%" : `${((totalAllocated / (budgetNum || 1)) * 100).toFixed(1)}%`}
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pr-2 custom-scrollbar">
                  {finalCategories.map((cat, idx) => (
                    <div
                      key={cat.id}
                      className={`flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-all duration-150 ${cat.active ? "opacity-100" : "opacity-40"} ${hoveredCategoryIndex === idx ? "bg-slate-50 dark:bg-slate-800/50" : ""}`}
                      onMouseEnter={() => cat.active && setHoveredCategoryIndex(idx)}
                      onMouseLeave={() => setHoveredCategoryIndex(null)}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
                        {cat.active ? `${cat.percentage.toFixed(0)}%` : "Off"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Interactive Sliders and Spend Tracking Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-rose-500" />
              Category Allocators & Item Tracker
            </h2>

            {/* Warning if total doesn't add up to 100% */}
            {Math.abs(totalAllocated - budgetNum) > 1 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-200 dark:border-amber-900/50 rounded-full text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Budget split variance: {currencySymbol}{(budgetNum - totalAllocated).toLocaleString()} unbalanced.
              </div>
            )}
          </div>

          <div className="space-y-4">
            {finalCategories.map((cat, idx) => {
              const isExpanded = expandedCategories[cat.id];
              return (
                <div
                  key={cat.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden transition-all duration-300 ${cat.active ? "border-slate-200 dark:border-slate-800 shadow-sm" : "border-slate-100 dark:border-slate-900 opacity-60"}`}
                >

                  {/* Category Header Row */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">

                    {/* Toggle and Label */}
                    <div className="flex items-center gap-3 min-w-0 md:w-1/4">
                      <input
                        type="checkbox"
                        checked={cat.active}
                        onChange={() => handleToggleCategory(cat.id)}
                        className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500 cursor-pointer accent-rose-500"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm md:text-base">
                            {cat.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {cat.items.length} itemized {cat.items.length === 1 ? "expense" : "expenses"}
                        </p>
                      </div>
                    </div>

                    {/* Percentage Slider (hidden if category is inactive) */}
                    <div className="grow flex items-center gap-3 min-w-0">
                      {cat.active ? (
                        <>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={cat.percentage}
                            onChange={(e) => handlePercentageChange(cat.id, e.target.value)}
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-rose-500 bg-slate-100 dark:bg-slate-800"
                            style={{ "--accent-color": cat.color }}
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={cat.percentage.toFixed(1)}
                              onChange={(e) => handlePercentageChange(cat.id, e.target.value)}
                              className="w-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-center text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                            />
                            <span className="text-xs font-semibold text-slate-400">%</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">Category Disabled</span>
                      )}
                    </div>

                    {/* Quick Budget summary fields */}
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 shrink-0 md:w-1/3">

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Estimated</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {cat.active ? `${currencySymbol}${cat.estSum.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `${currencySymbol}0`}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Spent (Act)</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {cat.active ? `${currencySymbol}${cat.actualSum.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `${currencySymbol}0`}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Variance</span>
                        <span className={`font-bold text-sm ${cat.varianceSum < 0 ? "text-red-500" : cat.varianceSum > 0 ? "text-emerald-500" : "text-slate-400"}`}>
                          {cat.active ? `${cat.varianceSum >= 0 ? "+" : ""}${currencySymbol}${cat.varianceSum.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `${currencySymbol}0`}
                        </span>
                      </div>

                      {/* Expand / Collapse items tracker */}
                      {cat.active && (
                        <button
                          onClick={() => toggleExpand(cat.id)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      )}

                      {/* Delete Custom Category option */}
                      {cat.id.startsWith("custom-") && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 text-red-400 hover:text-red-600 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                    </div>

                  </div>

                  {/* Category sub-items list (Spend tracker) */}
                  {cat.active && isExpanded && (
                    <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 space-y-4 pt-4">

                      {/* Grid Header */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <div className="col-span-5">Sub-item Name</div>
                        <div className="col-span-2 text-right">Est. Share (%)</div>
                        <div className="col-span-2 text-right">Estimated</div>
                        <div className="col-span-2 text-right">Actual Spent ({currencySymbol})</div>
                        <div className="col-span-1 text-center">Action</div>
                      </div>

                      {/* Items loop */}
                      <div className="space-y-2">
                        {cat.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 md:p-2 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center"
                          >
                            {/* Item Name Input */}
                            <div className="col-span-1 md:col-span-5 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleItemValChange(cat.id, item.id, "name", e.target.value)}
                                className="w-full bg-transparent border-0 focus:ring-0 focus:border-0 outline-none text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-950 rounded px-1.5 py-0.5"
                                placeholder="Expense Name"
                              />
                            </div>

                            {/* Estimate Share Input */}
                            <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                              <span className="md:hidden text-xs text-slate-400 font-bold">Est Share %</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={item.estimateShare.toFixed(0)}
                                  onChange={(e) => handleItemValChange(cat.id, item.id, "estimateShare", e.target.value)}
                                  className="w-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1 text-center text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                                />
                                <span className="text-[10px] text-slate-400 font-semibold">%</span>
                              </div>
                            </div>

                            {/* Estimated Display */}
                            <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                              <span className="md:hidden text-xs text-slate-400 font-bold">Estimated Cost</span>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                {currencySymbol}{item.estimate.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Actual Spent Input */}
                            <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                              <span className="md:hidden text-xs text-slate-400 font-bold">Actual Spent</span>
                              <div className="relative rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center px-2 py-1 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition-all duration-200 w-32 md:w-full">
                                <span className="text-[10px] text-slate-400 font-bold mr-1">{currencySymbol}</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.actual}
                                  onChange={(e) => handleItemValChange(cat.id, item.id, "actual", e.target.value)}
                                  className="bg-transparent border-0 outline-none w-full text-xs font-bold text-slate-800 dark:text-slate-100 text-right focus:ring-0"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                            {/* Actions (Delete) */}
                            <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                              <button
                                onClick={() => handleDeleteItem(cat.id, item.id)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>

                      {/* Add Item form */}
                      <div className="flex gap-2 max-w-md pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <input
                          type="text"
                          value={newItemsName[cat.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewItemsName((prev) => ({ ...prev, [cat.id]: val }));
                          }}
                          placeholder="Add new item, e.g., Open Bar"
                          className="grow text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 outline-none focus:border-rose-500"
                        />
                        <button
                          onClick={() => handleAddItem(cat.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all duration-150"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Add custom Category Block */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-rose-500" />
              Add Custom Budget Category
            </h3>
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label htmlFor="custom-cat-name" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Category Name
                </label>
                <input
                  id="custom-cat-name"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Honeymoon Fund"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="custom-cat-pct" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Initial Allocation %
                </label>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus-within:border-rose-500 transition-colors duration-150">
                  <input
                    id="custom-cat-pct"
                    type="number"
                    min="1"
                    max="50"
                    value={newCategoryPercentage}
                    onChange={(e) => setNewCategoryPercentage(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-xs font-bold text-slate-700 dark:text-slate-300"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">%</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition-colors duration-150 cursor-pointer"
              >
                Create Category
              </button>
            </form>
          </div>

        </div>

        {/* Informational Guidelines, Formulas & Advice */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">

          {/* Detailed Budget Breakdown Advice */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-rose-500" />
              How to Budget For Your Wedding
            </h3>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
              <p>
                Wedding planners typically recommend allocating the bulk of your budget to <strong>Venue & Catering</strong> (approx. 40-50%) as this contains the primary costs like renting the space, dinner service, and beverages which scale directly with your guest count.
              </p>
              <p>
                <strong>Photography & Videography</strong> (approx. 10-15%) is widely considered a high-value area since photos are the primary lasting memory of the celebration. Invest here if details and cinematic captures are important to you.
              </p>
              <p>
                <strong>Attire & Rings</strong> and <strong>Flowers & Decor</strong> (each approx. 8-10%) define the visual theme and style. Consider purchasing multi-use rings or repurposing ceremony flowers for the reception to save on decor costs.
              </p>
              <p>
                <strong>Hidden Costs to Watch Out For:</strong> Don't forget that taxes, service charges, tips, vendor meals, setup/teardown fees, and potential overtime fees can inflate vendor contracts by 20-30%. Always keep the <strong>Emergency Buffer</strong> category active to cover these unexpected bills.
              </p>
            </div>
          </div>

          {/* Formulas and Maths */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-rose-500" />
              Mathematical Formula Reference
            </h3>
            <div className="space-y-3">
              {[
                {
                  metric: "Category Estimate",
                  color: "#EC4899",
                  formula: "Category Estimate = Total Budget × (Category Target % ÷ 100)",
                  example: "e.g. ৳15,00,000 × (45 ÷ 100) = ৳6,75,000"
                },
                {
                  metric: "Item Estimate",
                  color: "#8B5CF6",
                  formula: "Item Estimate = Category Estimate × (Item Share % ÷ Σ All Item Shares %)",
                  example: "e.g. ৳6,75,000 × (50 ÷ 100) = ৳3,37,500 for Catering"
                },
                {
                  metric: "Cost Per Guest",
                  color: "#3B82F6",
                  formula: "Cost per Guest = Total Budget ÷ Guest Count",
                  example: "e.g. ৳15,00,000 ÷ 300 guests = ৳5,000 per person"
                },
                {
                  metric: "Variance (Item / Category)",
                  color: "#10B981",
                  formula: "Variance = Estimated Amount − Actual Spent",
                  example: "Positive = Under Budget  |  Negative = Over Budget"
                }
              ].map((row) => (
                <div key={row.metric} className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
                    style={{ backgroundColor: row.color }}
                  >
                    {row.metric}
                  </div>
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 space-y-1">
                    <code className="block text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 break-words">
                      {row.formula}
                    </code>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">{row.example}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-900 text-[11px] text-slate-500 leading-relaxed">
              <strong>Note on Variance:</strong> A positive variance indicates that you are <em>under budget</em> (saving money), while a negative variance indicates that you have <em>exceeded</em> your allocation for that particular item.
            </div>

          </div>

        </div>

        {/* ── Rich Information Section ─────────────────────────────────────── */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">

          {/* Section Title */}
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-full mb-3">
              Expert Budgeting Guide
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Everything You Need to Know About Wedding Costs
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
              Data-driven insights, expert tips, and planning advice to help you spend smart on your big day.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "৳15,00,000", label: "Average BD Wedding Cost", sub: "Source: Local industry estimates", color: "#EC4899" },
              { stat: "45%", label: "Venue & Catering Cost", sub: "Largest single budget item", color: "#8B5CF6" },
              { stat: "6–12 months", label: "Typical Planning Time", sub: "Time from engagement to wedding", color: "#3B82F6" },
              { stat: "৳1,500–৳3,000", label: "Average Cost per Guest", sub: "Community center & catering cost", color: "#10B981" }
            ].map((s) => (
              <div key={s.stat} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-1 shadow-sm">
                <span className="block text-2xl md:text-3xl font-black" style={{ color: s.color }}>{s.stat}</span>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{s.label}</span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500">{s.sub}</span>
              </div>
            ))}
          </div>

          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Money Saving Tips */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <span className="w-7 h-7 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-base">💰</span>
                Money-Saving Tips
              </h3>
              <ul className="space-y-2">
                {[
                  "Book during the off-season (Monsoon or summer months) — convention halls offer discounts up to 30%.",
                  "Opt for a standard Kacchi Biryani menu instead of a multi-course continental buffet to save per-plate catering costs.",
                  "Combine Holud and Mehendi into a single day event instead of booking separate venue slots.",
                  "Rent premium wedding attire (Lehenga/Sherwani) from boutiques instead of purchasing for one-time wear.",
                  "Use digital invitation cards via WhatsApp/Facebook for friends to save on printing and distribution costs.",
                  "Buy decor flowers directly from wholesale markets like Shahbagh in Dhaka to save on floral markups.",
                  "Host smaller pre-wedding events (like Akd or Mehendi) at home or on a rooftop to save on venue rent."
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vendor Checklist */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <span className="w-7 h-7 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-base">📋</span>
                Key Vendors to Book Early
              </h3>
              <ul className="space-y-2">
                {[
                  { vendor: "Venue", tip: "Book 12–18 months in advance — top venues fill fast." },
                  { vendor: "Photographer", tip: "8–12 months out. The best ones are booked solid." },
                  { vendor: "Caterer", tip: "6–9 months, especially for in-demand cuisine styles." },
                  { vendor: "Live Band / DJ", tip: "6–9 months — popular bands get reserved fast." },
                  { vendor: "Wedding Planner", tip: "As soon as you set a date. Planners fill early." },
                  { vendor: "Florist", tip: "4–6 months for detailed floral arrangements." },
                  { vendor: "Hair & Makeup", tip: "4–6 months, especially for trial runs." },
                  { vendor: "Officiant", tip: "6 months minimum, preferably earlier." }
                ].map((v) => (
                  <li key={v.vendor} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{v.vendor}:</span> {v.tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Planning Timeline */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <span className="w-7 h-7 rounded-xl flex items-center justify-center bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-base">📅</span>
                Budget Planning Timeline
              </h3>
              <div className="space-y-3">
                {[
                  { phase: "12–18 Months Before", tasks: ["Set overall budget & priorities", "Begin venue research", "Create guest list draft"], color: "#EC4899" },
                  { phase: "9–12 Months Before", tasks: ["Book venue & caterer", "Hire photographer & planner", "Set all category allocations"], color: "#8B5CF6" },
                  { phase: "6–9 Months Before", tasks: ["Purchase attire", "Book florist, DJ, officiants", "Send save-the-dates"], color: "#3B82F6" },
                  { phase: "3–6 Months Before", tasks: ["Finalize menus & decor details", "Track actual spend vs estimates", "Review buffer and adjust"], color: "#F59E0B" },
                  { phase: "1–3 Months Before", tasks: ["Confirm all vendors & payments", "Finalize seating & invites", "Settle final balances"], color: "#10B981" }
                ].map((phase) => (
                  <div key={phase.phase} className="border-l-2 pl-3" style={{ borderColor: phase.color }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: phase.color }}>{phase.phase}</span>
                    {phase.tasks.map((task, i) => (
                      <p key={i} className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{task}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* FAQ Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-5 flex items-center gap-2">
              <span className="text-rose-500">💬</span>
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  q: "How accurate is the cost-per-guest estimate?",
                  a: "The cost-per-guest metric gives you a ballpark based on your total budget divided by guest count. Keep in mind that catering and community center rent usually drive 45–60% of the per-person cost in Bangladesh — larger guest lists also benefit from economies of scale."
                },
                {
                  q: "Should I include honeymoon costs in my wedding budget?",
                  a: "It's best to track them separately. Add a custom 'Honeymoon & Travel' category if you want to include it in your total planning view. Many couples treat honeymoon savings as a separate financial goal to avoid conflating the two."
                },
                {
                  q: "How much buffer / emergency fund should I keep?",
                  a: "Most wedding planners recommend at least 5–10% of your total budget as an emergency buffer. Unexpected costs such as gate decoration additions, community center overtime charges, service staff tips, extra plates, and VAT can easily add up to 15–20% extra."
                },
                {
                  q: "What does 'variance' mean in this calculator?",
                  a: "Variance = Estimated Cost − Actual Spent. A positive number means you are under budget for that item (good!). A negative number means you've overspent your allocated estimate and may need to reduce spending elsewhere to stay within your total budget."
                },
                {
                  q: "Which priority preset should I choose?",
                  a: "Start with 'Balanced Standard' as a benchmark. Then switch to 'Foodie & Venue Focus' if memorable dining is your priority, 'Photogenic Focus' if lasting photo/video memories matter most, or 'Party & Music Focus' if you want an unforgettable dance floor atmosphere."
                },
                {
                  q: "How do I track expenses as I spend?",
                  a: "Expand any category card by clicking the arrow, then enter your actual spend amounts in the 'Actual Spent' column for each sub-item. The variance column automatically updates, and the header shows your running total spent vs. estimated budget."
                }
              ].map((faq) => (
                <div key={faq.q} className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{faq.q}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4">
            <span className="text-amber-500 shrink-0 mt-0.5">⚠️</span>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              <strong>Disclaimer:</strong> All budget estimates, allocations, and statistics shown in this tool are for informational and planning purposes only. Actual wedding costs vary significantly based on your geographic location, season, specific vendor choices, package tiers, and personal preferences. Always get written quotes from vendors before finalizing your budget.
            </p>
          </div>

        </div>
        {/* ── End Rich Information Section ──────────────────────────────────── */}

      </div>
    </ToolPageShell>

  );
}
