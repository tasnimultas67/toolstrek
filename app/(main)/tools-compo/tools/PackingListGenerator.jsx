"use client";

import React, { useState, useCallback, useEffect } from "react";
import ToolPageShell from "../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid } from "date-fns";
import {
  Luggage,
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
  Pencil,
  X,
  Sparkles,
  Package,
  Settings2,
  FileDown,
  ShieldCheck,
  Shirt,
  Pill,
  BookOpen,
  Laptop,
  Utensils,
  Camera,
  Wallet,
  MapPin,
  Sun,
  Umbrella,
  CalendarDays,
} from "lucide-react";

// ─── ICON CHOICES ─────────────────────────────────────────────────────────────
const ICON_CHOICES = [
  { key: "Shirt", Icon: Shirt },
  { key: "Pill", Icon: Pill },
  { key: "BookOpen", Icon: BookOpen },
  { key: "Laptop", Icon: Laptop },
  { key: "Utensils", Icon: Utensils },
  { key: "Camera", Icon: Camera },
  { key: "Wallet", Icon: Wallet },
  { key: "MapPin", Icon: MapPin },
  { key: "Sun", Icon: Sun },
  { key: "Umbrella", Icon: Umbrella },
  { key: "Package", Icon: Package },
  { key: "Luggage", Icon: Luggage },
];

// ─── DEFAULT CATEGORIES ───────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  {
    id: "cat-clothing",
    name: "Clothing",
    icon: "Shirt",
    color: "#7c00fe",
    collapsed: false,
    items: [
      { id: "item-1", name: "T-Shirts (3×)", checked: false, priority: "high" },
      { id: "item-2", name: "Pants / Jeans (2×)", checked: false, priority: "high" },
      { id: "item-3", name: "Underwear & Socks (5×)", checked: false, priority: "high" },
      { id: "item-4", name: "Jacket / Hoodie", checked: false, priority: "medium" },
      { id: "item-5", name: "Swimwear", checked: false, priority: "low" },
      { id: "item-6", name: "Formal Outfit", checked: false, priority: "low" },
    ],
  },
  {
    id: "cat-toiletries",
    name: "Toiletries",
    icon: "Pill",
    color: "#0ea5e9",
    collapsed: false,
    items: [
      { id: "item-7", name: "Toothbrush & Toothpaste", checked: false, priority: "high" },
      { id: "item-8", name: "Shampoo & Conditioner", checked: false, priority: "high" },
      { id: "item-9", name: "Deodorant", checked: false, priority: "high" },
      { id: "item-10", name: "Sunscreen SPF 50+", checked: false, priority: "medium" },
      { id: "item-11", name: "First Aid Kit", checked: false, priority: "medium" },
      { id: "item-12", name: "Prescription Medications", checked: false, priority: "high" },
    ],
  },
  {
    id: "cat-documents",
    name: "Documents",
    icon: "BookOpen",
    color: "#f59e0b",
    collapsed: false,
    items: [
      { id: "item-13", name: "Passport / National ID", checked: false, priority: "high" },
      { id: "item-14", name: "Visa (if required)", checked: false, priority: "high" },
      { id: "item-15", name: "Flight / Travel Tickets", checked: false, priority: "high" },
      { id: "item-16", name: "Travel Insurance Docs", checked: false, priority: "medium" },
      { id: "item-17", name: "Hotel Reservation", checked: false, priority: "medium" },
    ],
  },
  {
    id: "cat-electronics",
    name: "Electronics",
    icon: "Laptop",
    color: "#10b981",
    collapsed: false,
    items: [
      { id: "item-18", name: "Phone & Charger", checked: false, priority: "high" },
      { id: "item-19", name: "Power Bank", checked: false, priority: "medium" },
      { id: "item-20", name: "Universal Travel Adapter", checked: false, priority: "medium" },
      { id: "item-21", name: "Laptop / Tablet", checked: false, priority: "low" },
      { id: "item-22", name: "Earphones / AirPods", checked: false, priority: "low" },
    ],
  },
  {
    id: "cat-finances",
    name: "Finances",
    icon: "Wallet",
    color: "#f43f5e",
    collapsed: false,
    items: [
      { id: "item-23", name: "Cash (local currency)", checked: false, priority: "high" },
      { id: "item-24", name: "Credit / Debit Cards", checked: false, priority: "high" },
      { id: "item-25", name: "Travel Card / Forex Card", checked: false, priority: "medium" },
    ],
  },
];

const PRIORITY_CONFIG = {
  high: { label: "High", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  low: { label: "Low", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

const PRESET_COLORS = [
  "#7c00fe", "#0ea5e9", "#f59e0b", "#10b981",
  "#f43f5e", "#8b5cf6", "#ec4899", "#06b6d4",
  "#84cc16", "#f97316",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--muted-foreground)",
  marginBottom: "0.35rem",
  letterSpacing: "0.02em",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "0.55rem 0.875rem",
  borderRadius: "8px",
  border: "1.5px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  fontSize: "14.5px",
  outline: "none",
  transition: "border-color 0.15s ease",
  boxSizing: "border-box",
};

const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "none",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.18s ease",
  whiteSpace: "nowrap",
};

const btnPrimary = {
  ...btnBase,
  background: "linear-gradient(135deg, #7c00fe, #a855f7)",
  color: "#fff",
  boxShadow: "0 2px 8px rgba(124,0,254,0.3)",
};

const btnSecondary = {
  ...btnBase,
  background: "var(--muted)",
  color: "var(--foreground)",
  border: "1.5px solid var(--border)",
};

const btnDanger = {
  ...btnBase,
  background: "rgba(239,68,68,0.1)",
  color: "#ef4444",
  border: "1.5px solid rgba(239,68,68,0.25)",
};

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "0.3rem",
  borderRadius: "6px",
  color: "var(--muted-foreground)",
  display: "flex",
  alignItems: "center",
  transition: "all 0.15s ease",
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function PackingListGenerator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Packing List Generator",
      link: "/tools/packing-list-generator",
      icon: "Luggage",
    });
  }, [addRecentTool]);

  // ─── TRIP SETTINGS ─────────────────────────────────────────────────────────
  const [tripName, setTripName] = useState("Summer Vacation 2025");
  const [destination, setDestination] = useState("Bali, Indonesia");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelerCount, setTravelerCount] = useState(1);
  const [tripType, setTripType] = useState("Leisure");
  const [showSettings, setShowSettings] = useState(false);

  // ─── CATEGORIES ────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState(deepClone(DEFAULT_CATEGORIES));

  // ─── ADD CATEGORY MODAL ────────────────────────────────────────────────────
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Package");
  const [newCatColor, setNewCatColor] = useState("#7c00fe");

  // ─── EDIT CATEGORY ─────────────────────────────────────────────────────────
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatIcon, setEditCatIcon] = useState("Package");
  const [editCatColor, setEditCatColor] = useState("#7c00fe");

  // ─── ADD / EDIT ITEM ───────────────────────────────────────────────────────
  const [addingItemCatId, setAddingItemCatId] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPriority, setNewItemPriority] = useState("medium");
  const [editingItemKey, setEditingItemKey] = useState(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemPriority, setEditItemPriority] = useState("medium");

  // ─── FILTER ────────────────────────────────────────────────────────────────
  const [filterMode, setFilterMode] = useState("all");

  // ─── RESET MODAL ───────────────────────────────────────────────────────────
  const [showResetModal, setShowResetModal] = useState(false);

  // ─── STATS ─────────────────────────────────────────────────────────────────
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const packedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0
  );
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  // ─── ICON RESOLVER ─────────────────────────────────────────────────────────
  const resolveIcon = (iconKey) => {
    const found = ICON_CHOICES.find((ic) => ic.key === iconKey);
    return found ? found.Icon : Package;
  };

  // ─── CATEGORY OPERATIONS ───────────────────────────────────────────────────
  const toggleCategory = useCallback((catId) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, collapsed: !c.collapsed } : c))
    );
  }, []);

  const deleteCategory = useCallback((catId) => {
    if (!window.confirm("Delete this category and all its items?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    toast.success("Category removed");
  }, []);

  const addCategory = useCallback(() => {
    if (!newCatName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    setCategories((prev) => [
      ...prev,
      { id: uid(), name: newCatName.trim(), icon: newCatIcon, color: newCatColor, collapsed: false, items: [] },
    ]);
    setNewCatName("");
    setNewCatIcon("Package");
    setNewCatColor("#7c00fe");
    setShowAddCat(false);
    toast.success("Category added");
  }, [newCatName, newCatIcon, newCatColor]);

  const startEditCategory = useCallback((cat) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatIcon(cat.icon);
    setEditCatColor(cat.color);
  }, []);

  const saveEditCategory = useCallback(() => {
    if (!editCatName.trim()) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingCatId
          ? { ...c, name: editCatName.trim(), icon: editCatIcon, color: editCatColor }
          : c
      )
    );
    setEditingCatId(null);
    toast.success("Category updated");
  }, [editingCatId, editCatName, editCatIcon, editCatColor]);

  // ─── ITEM OPERATIONS ───────────────────────────────────────────────────────
  const toggleItem = useCallback((catId, itemId) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)) }
          : c
      )
    );
  }, []);

  const deleteItem = useCallback((catId, itemId) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      )
    );
  }, []);

  const addItem = useCallback(
    (catId) => {
      if (!newItemName.trim()) { toast.error("Please enter an item name"); return; }
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId
            ? { ...c, items: [...c.items, { id: uid(), name: newItemName.trim(), checked: false, priority: newItemPriority }] }
            : c
        )
      );
      setNewItemName("");
      setNewItemPriority("medium");
      setAddingItemCatId(null);
      toast.success("Item added");
    },
    [newItemName, newItemPriority]
  );

  const startEditItem = useCallback((catId, item) => {
    setEditingItemKey(`${catId}::${item.id}`);
    setEditItemName(item.name);
    setEditItemPriority(item.priority || "medium");
  }, []);

  const saveEditItem = useCallback(
    (catId, itemId) => {
      if (!editItemName.trim()) return;
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId
            ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, name: editItemName.trim(), priority: editItemPriority } : i)) }
            : c
        )
      );
      setEditingItemKey(null);
      toast.success("Item updated");
    },
    [editItemName, editItemPriority]
  );

  // ─── MARK ALL / CLEAR ALL ──────────────────────────────────────────────────
  const markAll = useCallback((checked) => {
    setCategories((prev) => prev.map((c) => ({ ...c, items: c.items.map((i) => ({ ...i, checked })) })));
    toast.success(checked ? "All items marked as packed" : "All items cleared");
  }, []);

  // ─── RESET ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const confirmReset = useCallback(() => {
    setCategories(deepClone(DEFAULT_CATEGORIES));
    setTripName("Summer Vacation 2025");
    setDestination("Bali, Indonesia");
    setStartDate("");
    setEndDate("");
    setTravelerCount(1);
    setTripType("Leisure");
    setFilterMode("all");
    setShowSettings(false);
    setShowResetModal(false);
    toast.success("Packing list reset to defaults");
  }, []);

  // ─── EXPORT PDF ────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(() => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = margin;

      const checkPageBreak = (needed = 8) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Header block
      doc.setFillColor(124, 0, 254);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 4, 4, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("Packing List", margin + 6, y + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(tripName || "My Trip", margin + 6, y + 18);
      doc.text(`${destination || ""}  |  ${tripType}  |  ${travelerCount} Traveler${travelerCount > 1 ? "s" : ""}`, margin + 6, y + 25);
      if (startDate && endDate) {
        doc.text(`${startDate} — ${endDate}`, pageWidth - margin - 50, y + 25);
      }
      y += 36;

      // Progress summary
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Progress: ${packedItems} / ${totalItems} packed  (${progressPercent}%)`, margin, y);
      y += 7;

      doc.setFillColor(220, 220, 235);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 4, 2, 2, "F");
      if (progressPercent > 0) {
        doc.setFillColor(124, 0, 254);
        const bw = Math.max(4, ((pageWidth - margin * 2) * progressPercent) / 100);
        doc.roundedRect(margin, y, bw, 4, 2, 2, "F");
      }
      y += 10;

      // Categories
      categories.forEach((cat) => {
        checkPageBreak(16);
        const hex = cat.color || "#7c00fe";
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        doc.setFillColor(r, g, b);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 9, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const catPacked = cat.items.filter((i) => i.checked).length;
        doc.text(`${cat.name}   (${catPacked}/${cat.items.length} packed)`, margin + 4, y + 6.2);
        y += 12;

        if (cat.items.length === 0) {
          checkPageBreak(7);
          doc.setTextColor(160, 160, 160);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.text("No items", margin + 4, y + 4);
          y += 8;
          return;
        }

        cat.items.forEach((item) => {
          checkPageBreak(8);
          // Checkbox square
          if (item.checked) {
            doc.setFillColor(124, 0, 254);
            doc.roundedRect(margin + 2, y + 0.8, 4.5, 4.5, 1, 1, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.text("✓", margin + 3.3, y + 4.6);
          } else {
            doc.setDrawColor(190, 190, 190);
            doc.roundedRect(margin + 2, y + 0.8, 4.5, 4.5, 1, 1, "S");
          }

          // Priority dot
          const pCfg = PRIORITY_CONFIG[item.priority || "medium"];
          const pr = parseInt(pCfg.color.slice(1, 3), 16);
          const pg = parseInt(pCfg.color.slice(3, 5), 16);
          const pb = parseInt(pCfg.color.slice(5, 7), 16);
          doc.setFillColor(pr, pg, pb);
          doc.circle(margin + 10.5, y + 3.2, 1.3, "F");

          // Item text
          const textC = item.checked ? 160 : 30;
          doc.setTextColor(textC, textC, textC);
          doc.setFont("helvetica", item.checked ? "italic" : "normal");
          doc.setFontSize(9.5);
          doc.text(item.name, margin + 14, y + 4.5);

          // Priority label right
          doc.setFontSize(7.5);
          doc.setTextColor(pr, pg, pb);
          doc.text(pCfg.label, pageWidth - margin - 14, y + 4.5);
          y += 7.5;
        });
        y += 4;
      });

      // Footer
      checkPageBreak(12);
      y += 4;
      doc.setDrawColor(200, 200, 220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
      doc.setTextColor(150, 150, 170);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text(
        `Generated by ToolsTrek Packing List Generator  ·  ${new Date().toLocaleDateString()}`,
        margin, y
      );

      const filename = `packing-list-${(tripName || "trip").toLowerCase().replace(/\s+/g, "-")}.pdf`;
      doc.save(filename);
      toast.success("PDF exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF. Please try again.");
    }
  }, [categories, tripName, destination, startDate, endDate, travelerCount, tripType, packedItems, totalItems, progressPercent]);

  // ─── FILTER ITEMS ──────────────────────────────────────────────────────────
  const getFilteredItems = useCallback(
    (items) => {
      if (filterMode === "packed") return items.filter((i) => i.checked);
      if (filterMode === "unpacked") return items.filter((i) => !i.checked);
      return items;
    },
    [filterMode]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", fontSize: "15px" }}>

        {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.5rem" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "13px",
              background: "linear-gradient(135deg, #7c00fe, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 18px rgba(124,0,254,0.35)", flexShrink: 0
            }}>
              <Luggage size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--foreground)", lineHeight: 1.2, margin: 0 }}>
                Packing List Generator
              </h1>
              <p style={{ fontSize: "14px", color: "var(--muted-foreground)", margin: "0.2rem 0 0" }}>
                Build, customize & export your perfect travel checklist
              </p>
            </div>
          </div>
        </div>

        {/* ── TRIP SETTINGS CARD ──────────────────────────────────────────── */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "14px", marginBottom: "1.25rem", overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}>
          <button
            onClick={() => setShowSettings((p) => !p)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "1rem 1.25rem",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--foreground)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Settings2 size={18} color="#7c00fe" />
              <span style={{ fontWeight: 700, fontSize: "15px" }}>Trip Settings</span>
              {(tripName || destination) && (
                <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                  — {[tripName, destination].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
            {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showSettings && (
            <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid var(--border)" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "1rem", paddingTop: "1rem"
              }}>
                <FieldBlock label="Trip Name">
                  <input
                    type="text" value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g. Summer Vacation" style={inputStyle}
                  />
                </FieldBlock>
                <FieldBlock label="Destination">
                  <input
                    type="text" value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Paris, France" style={inputStyle}
                  />
                </FieldBlock>
                <FieldBlock label="Start Date">
                  <ModernDatePicker
                    dateStr={startDate}
                    onChange={setStartDate}
                    placeholder="Pick start date"
                  />
                </FieldBlock>
                <FieldBlock label="End Date">
                  <ModernDatePicker
                    dateStr={endDate}
                    onChange={setEndDate}
                    placeholder="Pick end date"
                  />
                </FieldBlock>
                <FieldBlock label="Travelers">
                  <input
                    type="number" min={1} max={20} value={travelerCount}
                    onChange={(e) => setTravelerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    style={inputStyle}
                  />
                </FieldBlock>
                <FieldBlock label="Trip Type">
                  <select value={tripType} onChange={(e) => setTripType(e.target.value)} style={inputStyle}>
                    {["Leisure", "Business", "Adventure", "Beach", "Ski", "Camping", "Backpacking", "Family", "Honeymoon"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </FieldBlock>
              </div>
            </div>
          )}
        </div>

        {/* ── PROGRESS + ACTION BAR ───────────────────────────────────────── */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "14px", padding: "1.25rem", marginBottom: "1.25rem",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.25rem" }}>
            {/* Progress */}
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)" }}>
                  Packing Progress
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#7c00fe" }}>
                  {packedItems}/{totalItems} · {progressPercent}%
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "999px", background: "var(--muted)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "999px",
                  width: `${progressPercent}%`,
                  background: "linear-gradient(90deg, #7c00fe, #a855f7)",
                  transition: "width 0.45s cubic-bezier(0.4,0,0.2,1)"
                }} />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button onClick={() => markAll(true)} style={{ ...btnSecondary, fontSize: "14px" }}>
                <Check size={15} /> Mark All
              </button>
              <button onClick={() => markAll(false)} style={{ ...btnSecondary, fontSize: "14px" }}>
                <X size={15} /> Clear All
              </button>
              <button onClick={handleExportPDF} style={{ ...btnPrimary, fontSize: "14px" }}>
                <FileDown size={15} /> Export PDF
              </button>
              <button onClick={handleReset} style={{ ...btnDanger, fontSize: "14px" }}>
                <RotateCcw size={15} /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          marginBottom: "1.25rem", flexWrap: "wrap"
        }}>
          <span style={{ fontSize: "14px", color: "var(--muted-foreground)", fontWeight: 600 }}>Filter:</span>
          {["all", "packed", "unpacked"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              style={{
                padding: "0.4rem 1rem", borderRadius: "8px",
                border: `1.5px solid ${filterMode === mode ? "#7c00fe" : "var(--border)"}`,
                background: filterMode === mode ? "rgba(124,0,254,0.1)" : "var(--card)",
                color: filterMode === mode ? "#7c00fe" : "var(--muted-foreground)",
                fontWeight: filterMode === mode ? 700 : 400,
                fontSize: "14px", cursor: "pointer", transition: "all 0.18s ease",
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
            <span style={{
              padding: "0.35rem 0.8rem", borderRadius: "8px",
              background: "rgba(124,0,254,0.1)", color: "#7c00fe",
              fontSize: "13px", fontWeight: 700
            }}>
              {totalItems} Items
            </span>
            <span style={{
              padding: "0.35rem 0.8rem", borderRadius: "8px",
              background: "rgba(16,185,129,0.1)", color: "#10b981",
              fontSize: "13px", fontWeight: 700
            }}>
              {packedItems} Packed
            </span>
          </div>
        </div>

        {/* ── CATEGORIES LIST ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {categories.map((cat) => {
            const CatIcon = resolveIcon(cat.icon);
            const filteredItems = getFilteredItems(cat.items);
            const catPacked = cat.items.filter((i) => i.checked).length;
            const isEditing = editingCatId === cat.id;

            return (
              <div key={cat.id} style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: "14px", overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
              }}>
                {/* Category Header */}
                <div style={{
                  display: "flex", alignItems: "center",
                  padding: "0.9rem 1.125rem", gap: "0.75rem",
                  borderBottom: cat.collapsed ? "none" : "1px solid var(--border)",
                  background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}06)`
                }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: cat.color, display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                    boxShadow: `0 3px 10px ${cat.color}50`
                  }}>
                    <CatIcon size={18} color="#fff" />
                  </div>

                  {isEditing ? (
                    /* Edit mode */
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <input
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        style={{ ...inputStyle, flex: 1, minWidth: "120px", padding: "0.35rem 0.65rem", fontSize: "14px" }}
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveEditCategory()}
                      />
                      <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                        {ICON_CHOICES.map(({ key, Icon }) => (
                          <button
                            key={key} onClick={() => setEditCatIcon(key)} title={key}
                            style={{
                              width: "30px", height: "30px", borderRadius: "7px",
                              border: `1.5px solid ${editCatIcon === key ? "#7c00fe" : "var(--border)"}`,
                              background: editCatIcon === key ? "rgba(124,0,254,0.12)" : "var(--card)",
                              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                              color: editCatIcon === key ? "#7c00fe" : "var(--foreground)"
                            }}
                          >
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
                        {PRESET_COLORS.map((c) => (
                          <button key={c} onClick={() => setEditCatColor(c)}
                            style={{
                              width: "22px", height: "22px", borderRadius: "50%", background: c, cursor: "pointer",
                              border: editCatColor === c ? "3px solid var(--foreground)" : "2px solid transparent",
                            }}
                          />
                        ))}
                        <input type="color" value={editCatColor} onChange={(e) => setEditCatColor(e.target.value)}
                          style={{ width: "26px", height: "26px", borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }}
                          title="Custom color"
                        />
                      </div>
                      <button onClick={saveEditCategory} style={{ ...btnPrimary, padding: "0.35rem 0.75rem", fontSize: "13px" }}>
                        <Check size={13} /> Save
                      </button>
                      <button onClick={() => setEditingCatId(null)} style={{ ...btnSecondary, padding: "0.35rem 0.65rem", fontSize: "13px" }}>
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--foreground)" }}>{cat.name}</div>
                        <div style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                          {catPacked}/{cat.items.length} packed
                          {cat.items.length > 0 && (
                            <span style={{ marginLeft: "0.5rem" }}>
                              · {Math.round((catPacked / cat.items.length) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Mini progress */}
                      <div style={{ width: "70px" }}>
                        <div style={{ height: "4px", borderRadius: "999px", background: "var(--muted)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: "999px",
                            width: `${cat.items.length > 0 ? (catPacked / cat.items.length) * 100 : 0}%`,
                            background: cat.color, transition: "width 0.35s ease"
                          }} />
                        </div>
                      </div>
                      <button onClick={() => startEditCategory(cat)} style={iconBtn} title="Edit category">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteCategory(cat.id)} style={{ ...iconBtn, color: "#ef4444" }} title="Delete category">
                        <Trash2 size={15} />
                      </button>
                      <button onClick={() => toggleCategory(cat.id)} style={iconBtn}>
                        {cat.collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                      </button>
                    </>
                  )}
                </div>

                {/* Items */}
                {!cat.collapsed && (
                  <div style={{ padding: "0.75rem 1.125rem" }}>
                    {filteredItems.length === 0 && (
                      <p style={{ fontSize: "14px", color: "var(--muted-foreground)", textAlign: "center", padding: "1rem 0", fontStyle: "italic" }}>
                        {filterMode !== "all" ? `No ${filterMode} items in this category.` : "No items yet — add one below."}
                      </p>
                    )}

                    {filteredItems.map((item) => {
                      const itemKey = `${cat.id}::${item.id}`;
                      const isEditingItem = editingItemKey === itemKey;
                      const pCfg = PRIORITY_CONFIG[item.priority || "medium"];

                      return (
                        <div key={item.id} style={{
                          display: "flex", alignItems: "center", gap: "0.7rem",
                          padding: "0.55rem 0", borderBottom: "1px solid var(--border)",
                        }}>
                          {isEditingItem ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, flexWrap: "wrap" }}>
                              <input
                                value={editItemName} onChange={(e) => setEditItemName(e.target.value)}
                                style={{ ...inputStyle, flex: 1, minWidth: "130px", padding: "0.3rem 0.6rem", fontSize: "14px" }}
                                autoFocus onKeyDown={(e) => e.key === "Enter" && saveEditItem(cat.id, item.id)}
                              />
                              <select value={editItemPriority} onChange={(e) => setEditItemPriority(e.target.value)}
                                style={{ ...inputStyle, width: "130px", padding: "0.3rem 0.55rem", fontSize: "14px" }}>
                                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                                  <option key={k} value={k}>{v.label} Priority</option>
                                ))}
                              </select>
                              <button onClick={() => saveEditItem(cat.id, item.id)} style={{ ...btnPrimary, padding: "0.3rem 0.7rem", fontSize: "13px" }}>
                                <Check size={13} /> Save
                              </button>
                              <button onClick={() => setEditingItemKey(null)} style={{ ...btnSecondary, padding: "0.3rem 0.65rem", fontSize: "13px" }}>
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => toggleItem(cat.id, item.id)}
                                style={{
                                  width: "22px", height: "22px", flexShrink: 0, borderRadius: "6px",
                                  border: `2px solid ${item.checked ? "#7c00fe" : "var(--border)"}`,
                                  background: item.checked ? "#7c00fe" : "transparent",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  cursor: "pointer", transition: "all 0.15s ease"
                                }}
                              >
                                {item.checked && <Check size={13} color="#fff" strokeWidth={3} />}
                              </button>
                              <span style={{
                                flex: 1, fontSize: "14.5px",
                                color: item.checked ? "var(--muted-foreground)" : "var(--foreground)",
                                textDecoration: item.checked ? "line-through" : "none",
                                transition: "all 0.15s ease"
                              }}>
                                {item.name}
                              </span>
                              <span style={{
                                padding: "0.2rem 0.55rem", borderRadius: "6px",
                                fontSize: "12px", fontWeight: 700,
                                color: pCfg.color, background: pCfg.bg, flexShrink: 0
                              }}>
                                {pCfg.label}
                              </span>
                              <button onClick={() => startEditItem(cat.id, item)} style={{ ...iconBtn, padding: "0.2rem" }} title="Edit item">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => deleteItem(cat.id, item.id)} style={{ ...iconBtn, padding: "0.2rem", color: "#ef4444" }} title="Delete item">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* Add item row */}
                    {addingItemCatId === cat.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.8rem", flexWrap: "wrap" }}>
                        <input
                          value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="New item name…"
                          style={{ ...inputStyle, flex: 1, minWidth: "150px", padding: "0.4rem 0.7rem", fontSize: "14px" }}
                          autoFocus onKeyDown={(e) => e.key === "Enter" && addItem(cat.id)}
                        />
                        <select value={newItemPriority} onChange={(e) => setNewItemPriority(e.target.value)}
                          style={{ ...inputStyle, width: "140px", padding: "0.4rem 0.55rem", fontSize: "14px" }}>
                          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label} Priority</option>
                          ))}
                        </select>
                        <button onClick={() => addItem(cat.id)} style={{ ...btnPrimary, fontSize: "14px" }}>
                          <Check size={15} /> Add
                        </button>
                        <button onClick={() => { setAddingItemCatId(null); setNewItemName(""); }} style={{ ...btnSecondary, fontSize: "14px" }}>
                          <X size={15} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingItemCatId(cat.id); setNewItemName(""); setNewItemPriority("medium"); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          gap: "0.4rem", marginTop: "0.7rem", padding: "0.5rem 0.85rem",
                          borderRadius: "8px", border: "1.5px dashed var(--border)",
                          background: "none", color: "var(--muted-foreground)",
                          fontSize: "14px", cursor: "pointer", width: "100%",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#7c00fe";
                          e.currentTarget.style.color = "#7c00fe";
                          e.currentTarget.style.background = "rgba(124,0,254,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.color = "var(--muted-foreground)";
                          e.currentTarget.style.background = "none";
                        }}
                      >
                        <Plus size={15} /> Add Item
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── ADD CATEGORY BUTTON / FORM ────────────────────────────────── */}
          {!showAddCat ? (
            <button
              onClick={() => setShowAddCat(true)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "0.5rem", padding: "0.9rem",
                borderRadius: "14px", border: "2px dashed var(--border)",
                background: "none", color: "var(--muted-foreground)",
                fontSize: "15px", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#7c00fe";
                e.currentTarget.style.color = "#7c00fe";
                e.currentTarget.style.background = "rgba(124,0,254,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--muted-foreground)";
                e.currentTarget.style.background = "none";
              }}
            >
              <Plus size={18} /> Add New Category
            </button>
          ) : (
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "14px", padding: "1.25rem",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
            }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "1rem", color: "var(--foreground)", margin: "0 0 1rem" }}>
                Add New Category
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <FieldBlock label="Category Name">
                  <input
                    value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Camping Gear" style={inputStyle}
                    autoFocus onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  />
                </FieldBlock>

                <FieldBlock label="Icon">
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {ICON_CHOICES.map(({ key, Icon }) => (
                      <button key={key} onClick={() => setNewCatIcon(key)} title={key}
                        style={{
                          width: "38px", height: "38px", borderRadius: "9px",
                          border: `1.5px solid ${newCatIcon === key ? "#7c00fe" : "var(--border)"}`,
                          background: newCatIcon === key ? "rgba(124,0,254,0.1)" : "var(--card)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "all 0.15s ease",
                          color: newCatIcon === key ? "#7c00fe" : "var(--foreground)"
                        }}>
                        <Icon size={17} />
                      </button>
                    ))}
                  </div>
                </FieldBlock>

                <FieldBlock label="Color">
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                    {PRESET_COLORS.map((c) => (
                      <button key={c} onClick={() => setNewCatColor(c)}
                        style={{
                          width: "26px", height: "26px", borderRadius: "50%", background: c,
                          cursor: "pointer",
                          border: newCatColor === c ? "3px solid var(--foreground)" : "2px solid transparent",
                          transition: "border 0.15s ease"
                        }}
                      />
                    ))}
                    <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)}
                      style={{ width: "28px", height: "28px", borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }}
                      title="Custom color"
                    />
                    {/* Preview */}
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "9px",
                      background: newCatColor, marginLeft: "0.5rem",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {(() => { const I = resolveIcon(newCatIcon); return <I size={16} color="#fff" />; })()}
                    </div>
                  </div>
                </FieldBlock>

                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button onClick={addCategory} style={{ ...btnPrimary, fontSize: "14px" }}>
                    <Plus size={15} /> Add Category
                  </button>
                  <button onClick={() => { setShowAddCat(false); setNewCatName(""); }} style={{ ...btnSecondary, fontSize: "14px" }}>
                    <X size={15} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── TIPS SECTION ─────────────────────────────────────────────────── */}
        <div style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "0.875rem"
        }}>
          {[
            { icon: <Sparkles size={16} color="#7c00fe" />, title: "Smart Priorities", desc: "Mark items High / Medium / Low to focus on what matters most first." },
            { icon: <ShieldCheck size={16} color="#10b981" />, title: "100% Private", desc: "Everything stays in your browser. No data is ever sent to a server." },
            { icon: <FileDown size={16} color="#f59e0b" />, title: "PDF Export", desc: "Download a beautifully formatted packing checklist to print or share." },
          ].map((tip, i) => (
            <div key={i} style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "12px", padding: "1rem 1.1rem",
              display: "flex", gap: "0.75rem", alignItems: "flex-start"
            }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "9px", background: "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {tip.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "0.2rem", color: "var(--foreground)" }}>
                  {tip.title}
                </div>
                <div style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.55 }}>
                  {tip.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── RESET CONFIRMATION MODAL ─────────────────────────────────────── */}
        {showResetModal && (
          <div
            onClick={() => setShowResetModal(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1rem",
              animation: "fadeIn 0.18s ease",
            }}
          >
            <style>{`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes slideUp { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "18px",
                padding: "2rem",
                maxWidth: "420px",
                width: "100%",
                boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              {/* Icon */}
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px",
                background: "rgba(239,68,68,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.25rem",
              }}>
                <RotateCcw size={26} color="#ef4444" />
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: "1.2rem", fontWeight: 800,
                color: "var(--foreground)", margin: "0 0 0.5rem",
              }}>
                Reset Packing List?
              </h2>

              {/* Description */}
              <p style={{
                fontSize: "14.5px", color: "var(--muted-foreground)",
                lineHeight: 1.6, margin: "0 0 0.75rem",
              }}>
                This will remove all your custom categories and items, and restore the
                default packing list. Your trip settings will also be cleared.
              </p>

              {/* Warning chip */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.35rem 0.75rem", borderRadius: "8px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                marginBottom: "1.5rem",
              }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444" }}>
                  ⚠ This action cannot be undone
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setShowResetModal(false)}
                  style={{
                    flex: 1, padding: "0.65rem 1rem", borderRadius: "10px",
                    border: "1.5px solid var(--border)",
                    background: "var(--muted)", color: "var(--foreground)",
                    fontSize: "14.5px", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  style={{
                    flex: 1, padding: "0.65rem 1rem", borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #ef4444, #f87171)",
                    color: "#fff",
                    fontSize: "14.5px", fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(239,68,68,0.35)",
                    transition: "all 0.15s ease",
                    display: "inline-flex", alignItems: "center",
                    justifyContent: "center", gap: "0.4rem",
                  }}
                >
                  <RotateCcw size={15} /> Yes, Reset
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ToolPageShell>
  );
}

// ─── FIELD BLOCK HELPER ───────────────────────────────────────────────────────
function FieldBlock({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─── MODERN DATE PICKER WITH MONTH/YEAR DROPDOWNS ─────────────────────────────
function ModernDatePicker({ dateStr, onChange, placeholder = "Select date" }) {
  const dateVal = dateStr ? new Date(dateStr) : undefined;
  const [open, setOpen] = React.useState(false);
  const [displayMonth, setDisplayMonth] = React.useState(
    () => dateVal ?? new Date()
  );

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const curYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => curYear - 2 + i);

  const dropdownSelectStyle = {
    height: "32px",
    padding: "0 0.4rem",
    borderRadius: "8px",
    border: "1.5px solid var(--border)",
    background: "var(--card)",
    color: "var(--foreground)",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    minWidth: "0",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          style={{
            ...inputStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ color: dateStr ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {dateStr && isValid(dateVal) ? format(dateVal, "PPP") : placeholder}
          </span>
          <CalendarDays size={16} style={{ opacity: 0.6, flexShrink: 0 }} />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none z-50">
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "0.75rem 0.5rem 0.5rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
          minWidth: "280px",
        }}>

          {/* ── Month / Year dropdowns ── */}
          <div style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginBottom: "0.5rem",
            padding: "0 0.5rem",
          }}>
            <select
              value={displayMonth.getMonth()}
              onChange={(e) =>
                setDisplayMonth(new Date(displayMonth.getFullYear(), parseInt(e.target.value)))
              }
              style={{ ...dropdownSelectStyle, flex: "1 1 auto" }}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>

            <select
              value={displayMonth.getFullYear()}
              onChange={(e) =>
                setDisplayMonth(new Date(parseInt(e.target.value), displayMonth.getMonth()))
              }
              style={{ ...dropdownSelectStyle, flex: "0 0 72px" }}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* ── Calendar grid ── */}
          <Calendar
            mode="single"
            selected={dateVal}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            onSelect={(date) => {
              if (date) {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, "0");
                const d = String(date.getDate()).padStart(2, "0");
                onChange(`${y}-${m}-${d}`);
                setOpen(false);
              } else {
                onChange("");
              }
            }}
            className="rounded-xl border-0 pt-0"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
