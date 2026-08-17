"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  StarOff,
  Calendar,
  Tag,
  Clock,
  BarChart2,
  Layers,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Download,
  Upload,
  Sparkles,
  ListTodo,
  Target,
  Flame,
  TrendingUp,
  Palette,
  Settings,
  Bell,
  Archive,
  Eye,
  EyeOff,
  Award,
  BookOpen,
  RotateCcw,
  FileText,
} from "lucide-react";
import ToolPageShell from "./ToolPageShell";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ───────────────────────────────────────────────────────────────

const PRIORITIES = {
  urgent: { label: "Urgent", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", icon: <Flame size={12} /> },
  high: { label: "High", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: <ArrowUp size={12} /> },
  medium: { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: <ArrowRight size={12} /> },
  low: { label: "Low", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: <ArrowDown size={12} /> },
};

const CATEGORIES = [
  { id: "work", label: "Work", color: "#7c00fe", emoji: "💼" },
  { id: "personal", label: "Personal", color: "#06b6d4", emoji: "🧑" },
  { id: "health", label: "Health", color: "#22c55e", emoji: "💪" },
  { id: "learning", label: "Learning", color: "#f59e0b", emoji: "📚" },
  { id: "finance", label: "Finance", color: "#8b5cf6", emoji: "💰" },
  { id: "creative", label: "Creative", color: "#ec4899", emoji: "🎨" },
  { id: "social", label: "Social", color: "#f97316", emoji: "👥" },
  { id: "other", label: "Other", color: "#6b7280", emoji: "📌" },
];

const ACCENT_COLORS = [
  { id: "violet", label: "Violet", value: "#7c00fe" },
  { id: "blue", label: "Ocean", value: "#2563eb" },
  { id: "emerald", label: "Emerald", value: "#059669" },
  { id: "rose", label: "Rose", value: "#e11d48" },
  { id: "amber", label: "Amber", value: "#d97706" },
  { id: "indigo", label: "Indigo", value: "#4f46e5" },
];

const SORT_OPTIONS = [
  { id: "created_desc", label: "Newest First" },
  { id: "created_asc", label: "Oldest First" },
  { id: "priority", label: "Priority" },
  { id: "due_date", label: "Due Date" },
  { id: "title", label: "Alphabetical" },
  { id: "completion", label: "Completion" },
];

const SAMPLE_TODOS = [
  {
    id: "s1", title: "Review Q3 project proposal", desc: "Analyze the project scope, timeline, and budget allocations for Q3 initiatives.", priority: "urgent", category: "work",
    completed: false, starred: true, dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split("T")[0],
    tags: ["proposal", "Q3", "budget"], subtasks: [
      { id: "st1", title: "Read executive summary", done: true },
      { id: "st2", title: "Review budget allocation", done: false },
      { id: "st3", title: "Prepare feedback notes", done: false },
    ], createdAt: new Date().toISOString(), color: null,
  },
  {
    id: "s2", title: "Morning workout routine", desc: "30 minutes cardio + strength training as per the weekly fitness plan.", priority: "high", category: "health",
    completed: false, starred: false, dueDate: new Date().toISOString().split("T")[0],
    tags: ["fitness", "routine"], subtasks: [
      { id: "st4", title: "10 min warm-up", done: true },
      { id: "st5", title: "20 min cardio", done: true },
      { id: "st6", title: "Strength training", done: false },
    ], createdAt: new Date().toISOString(), color: null,
  },
  {
    id: "s3", title: "Complete Next.js tutorial", desc: "Finish chapters 8-12 of the Advanced Next.js course on app router and server components.", priority: "medium", category: "learning",
    completed: false, starred: true, dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    tags: ["nextjs", "coding", "course"], subtasks: [
      { id: "st7", title: "Chapter 8 - Server Components", done: true },
      { id: "st8", title: "Chapter 9 - Client Components", done: false },
      { id: "st9", title: "Chapter 10 - Data Fetching", done: false },
      { id: "st10", title: "Chapter 11 - Caching", done: false },
    ], createdAt: new Date().toISOString(), color: null,
  },
  {
    id: "s4", title: "Call family members", desc: "Weekly family check-in call with parents and siblings.", priority: "medium", category: "social",
    completed: true, starred: false, dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
    tags: ["family", "call"], subtasks: [], createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), color: null,
  },
  {
    id: "s5", title: "Update monthly budget spreadsheet", desc: "Record all expenses, review savings goal progress, and plan for next month.", priority: "high", category: "finance",
    completed: false, starred: false, dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    tags: ["budget", "monthly", "savings"], subtasks: [
      { id: "st11", title: "Record all income", done: false },
      { id: "st12", title: "Log expenses by category", done: false },
      { id: "st13", title: "Calculate savings rate", done: false },
    ], createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), color: null,
  },
  {
    id: "s6", title: "Design new logo concepts", desc: "Create 3-5 initial logo concepts for the personal brand refresh project.", priority: "low", category: "creative",
    completed: false, starred: false, dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    tags: ["design", "branding", "logo"], subtasks: [
      { id: "st14", title: "Research competitor logos", done: true },
      { id: "st15", title: "Sketch initial concepts", done: false },
      { id: "st16", title: "Digitize in Figma", done: false },
    ], createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), color: null,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().split("T")[0];

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return dueDate < todayStr();
};

const isDueSoon = (dueDate) => {
  if (!dueDate) return false;
  const diff = (new Date(dueDate) - new Date()) / 86400000;
  return diff >= 0 && diff <= 2;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const p = PRIORITIES[priority];
  if (!p) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${p.color} ${p.bg} border ${p.border}`}>
      {p.icon} {p.label}
    </span>
  );
};

const CategoryBadge = ({ categoryId }) => {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400">
      {cat.emoji} {cat.label}
    </span>
  );
};

const ProgressBar = ({ value, accent = "#7c00fe" }) => (
  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{ width: `${value}%`, background: accent }}
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function TodoTool() {
  // ── State ──
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_desc");
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [showCompleted, setShowCompleted] = useState(true);
  const [addingTodo, setAddingTodo] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [notification, setNotification] = useState(null);

  const blankForm = { title: "", desc: "", priority: "medium", category: "work", dueDate: "", tags: "", color: null };
  const [form, setForm] = useState(blankForm);
  const [newSubtask, setNewSubtask] = useState("");
  const [formSubtasks, setFormSubtasks] = useState([]);

  const [settings, setSettings] = useState({
    showDesc: true,
    showSubtasks: true,
    showTags: true,
    showDueDate: true,
    compactMode: false,
  });

  const titleRef = useRef(null);

  // ── Persistence ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tt_todos_v2");
      if (saved) setTodos(JSON.parse(saved));
      const savedAcc = localStorage.getItem("tt_accent_v2");
      if (savedAcc) {
        const found = ACCENT_COLORS.find((a) => a.id === savedAcc);
        if (found) setAccentColor(found);
      }
      const savedSettings = localStorage.getItem("tt_settings_v2");
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("tt_todos_v2", JSON.stringify(todos)); } catch {}
  }, [todos]);

  useEffect(() => {
    try {
      localStorage.setItem("tt_accent_v2", accentColor.id);
      localStorage.setItem("tt_settings_v2", JSON.stringify(settings));
    } catch {}
  }, [accentColor, settings]);

  const notify = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // ── Stats ──
  const stats = React.useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const overdue = todos.filter((t) => !t.completed && isOverdue(t.dueDate)).length;
    const urgent = todos.filter((t) => !t.completed && t.priority === "urgent").length;
    const dueSoon = todos.filter((t) => !t.completed && isDueSoon(t.dueDate)).length;
    const starred = todos.filter((t) => t.starred).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const subtaskTotal = todos.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0);
    const subtaskDone = todos.reduce((acc, t) => acc + (t.subtasks?.filter((s) => s.done).length || 0), 0);
    return { total, completed, overdue, urgent, dueSoon, starred, completionRate, subtaskTotal, subtaskDone };
  }, [todos]);

  // ── Filter & Sort ──
  const filteredTodos = React.useMemo(() => {
    let list = [...todos];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.desc?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (filter === "active") list = list.filter((t) => !t.completed);
    else if (filter === "completed") list = list.filter((t) => t.completed);
    else if (filter === "starred") list = list.filter((t) => t.starred);
    else if (filter === "overdue") list = list.filter((t) => !t.completed && isOverdue(t.dueDate));
    else if (filter === "duesoon") list = list.filter((t) => !t.completed && isDueSoon(t.dueDate));

    if (categoryFilter !== "all") list = list.filter((t) => t.category === categoryFilter);
    if (priorityFilter !== "all") list = list.filter((t) => t.priority === priorityFilter);
    if (!showCompleted) list = list.filter((t) => !t.completed);

    list.sort((a, b) => {
      switch (sortBy) {
        case "created_asc": return new Date(a.createdAt) - new Date(b.createdAt);
        case "priority": {
          const order = { urgent: 0, high: 1, medium: 2, low: 3 };
          return order[a.priority] - order[b.priority];
        }
        case "due_date": {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        case "title": return a.title.localeCompare(b.title);
        case "completion": return (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return list;
  }, [todos, searchQuery, filter, categoryFilter, priorityFilter, showCompleted, sortBy]);

  // ── CRUD ──
  const addTodo = () => {
    if (!form.title.trim()) return;
    const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const newTodo = {
      id: genId(),
      title: form.title.trim(),
      desc: form.desc.trim(),
      priority: form.priority,
      category: form.category,
      dueDate: form.dueDate || null,
      tags,
      subtasks: formSubtasks,
      completed: false,
      starred: false,
      color: form.color,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    resetForm();
    notify("Task added successfully! 🎉");
  };

  const updateTodo = (id) => {
    if (!form.title.trim()) return;
    const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, title: form.title.trim(), desc: form.desc.trim(), priority: form.priority, category: form.category, dueDate: form.dueDate || null, tags, subtasks: formSubtasks, color: form.color }
          : t
      )
    );
    resetForm();
    notify("Task updated! ✅");
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    if (expandedId === id) setExpandedId(null);
    if (editingId === id) resetForm();
    notify("Task deleted.", "info");
  };

  const toggleComplete = (id) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newCompleted = !t.completed;
        const newSubtasks = newCompleted ? t.subtasks.map((s) => ({ ...s, done: true })) : t.subtasks;
        return { ...t, completed: newCompleted, subtasks: newSubtasks };
      })
    );
  };

  const toggleStar = (id) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t)));
  };

  const toggleSubtask = (todoId, subtaskId) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)) }
          : t
      )
    );
  };

  const deleteSubtask = (todoId, subtaskId) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
          : t
      )
    );
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
    notify("Completed tasks cleared.", "info");
  };

  const loadSampleData = () => {
    setTodos(SAMPLE_TODOS);
    notify("Sample data loaded! 🚀");
  };

  // ── Form helpers ──
  const startEdit = (todo) => {
    setForm({
      title: todo.title,
      desc: todo.desc || "",
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate || "",
      tags: (todo.tags || []).join(", "),
      color: todo.color,
    });
    setFormSubtasks(todo.subtasks || []);
    setEditingId(todo.id);
    setAddingTodo(true);
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const resetForm = () => {
    setForm(blankForm);
    setFormSubtasks([]);
    setNewSubtask("");
    setEditingId(null);
    setAddingTodo(false);
  };

  const addFormSubtask = () => {
    if (!newSubtask.trim()) return;
    setFormSubtasks((prev) => [...prev, { id: genId(), title: newSubtask.trim(), done: false }]);
    setNewSubtask("");
  };

  // ── Reset Filters ──
  const resetFilters = () => {
    setFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setSearchQuery("");
    setSortBy("created_desc");
    setShowCompleted(true);
    notify("Filters reset! 🔄", "info");
  };

  // ── Export PDF ──
  const exportPdf = async () => {
    if (filteredTodos.length === 0) { notify("No tasks to export.", "info"); return; }
    notify("Generating PDF...", "info");

    try {
      const { jsPDF } = await import("jspdf");

      // ── Pure ASCII helpers (no emoji/unicode — Helvetica can't render them) ──
      const priorityLabel = (p) => ({ urgent: "URGENT", high: "HIGH", medium: "MEDIUM", low: "LOW" }[p] || p.toUpperCase());
      const priorityColor = (p) => ({
        urgent: [220, 38, 38],
        high:   [234, 88, 12],
        medium: [161, 98, 7],
        low:    [29, 78, 216],
      }[p] || [75, 85, 99]);
      // Light background for priority badge: blend color with white at 85% white
      const priorityBg = (p) => {
        const [r, g, b] = priorityColor(p);
        return [Math.round(r * 0.15 + 255 * 0.85), Math.round(g * 0.15 + 255 * 0.85), Math.round(b * 0.15 + 255 * 0.85)];
      };

      const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id;
      const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";

      const hexRgb = (hex) => [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ];
      const [ar, ag, ab] = hexRgb(accentColor.value);
      // Light accent bg (10% accent + 90% white)
      const accentBg = [Math.round(ar * 0.1 + 255 * 0.9), Math.round(ag * 0.1 + 255 * 0.9), Math.round(ab * 0.1 + 255 * 0.9)];

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentW = pageW - margin * 2;
      const SITE_NAME = "ToolsTrek";
      const SITE_URL  = "toolstrek.vercel.app";
      const TOOL_NAME = "Task Manager";
      let y = 0;

      // ─────────────────────────────────────────────────────────────────────
      // HEADER BAND
      // ─────────────────────────────────────────────────────────────────────
      // Accent band across full width
      doc.setFillColor(ar, ag, ab);
      doc.rect(0, 0, pageW, 28, "F");

      // Site name (top-left, white, small)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(SITE_NAME + "  |  " + SITE_URL, margin, 7);

      // Tool name (large title)
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(TOOL_NAME + " - Export", margin, 18);

      // Export date on the right
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("Exported: " + new Date().toLocaleString(), pageW - margin, 18, { align: "right" });

      y = 34;

      // ─────────────────────────────────────────────────────────────────────
      // STATS ROW
      // ─────────────────────────────────────────────────────────────────────
      const statItems = [
        { label: "Total Tasks",   value: String(stats.total) },
        { label: "Completed",     value: String(stats.completed) },
        { label: "Progress",      value: stats.completionRate + "%" },
        { label: "Overdue",       value: String(stats.overdue) },
        { label: "Urgent",        value: String(stats.urgent) },
        { label: "Starred",       value: String(stats.starred) },
      ];
      const statW = contentW / statItems.length;
      statItems.forEach((s, i) => {
        const sx = margin + i * statW;
        doc.setFillColor(...accentBg);
        doc.setDrawColor(ar, ag, ab);
        doc.roundedRect(sx + 0.5, y, statW - 1.5, 17, 2, 2, "FD");
        doc.setTextColor(ar, ag, ab);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(s.value, sx + statW / 2 - 0.75, y + 8, { align: "center" });
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.text(s.label, sx + statW / 2 - 0.75, y + 13.5, { align: "center" });
      });
      y += 21;

      // ─────────────────────────────────────────────────────────────────────
      // PROGRESS BAR
      // ─────────────────────────────────────────────────────────────────────
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(margin, y, contentW, 3.5, 1.5, 1.5, "F");
      if (stats.completionRate > 0) {
        doc.setFillColor(ar, ag, ab);
        doc.roundedRect(margin, y, (contentW * stats.completionRate) / 100, 3.5, 1.5, 1.5, "F");
      }
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text("Overall completion: " + stats.completionRate + "%", margin, y + 7);
      y += 11;

      // ─────────────────────────────────────────────────────────────────────
      // TABLE
      // ─────────────────────────────────────────────────────────────────────
      const cols = [
        { label: "Task Title",  w: contentW * 0.36 },
        { label: "Priority",    w: contentW * 0.12 },
        { label: "Category",    w: contentW * 0.15 },
        { label: "Due Date",    w: contentW * 0.15 },
        { label: "Subtasks",    w: contentW * 0.11 },
        { label: "Status",      w: contentW * 0.11 },
      ];

      const drawTableHeader = (startY) => {
        doc.setFillColor(ar, ag, ab);
        doc.rect(margin, startY, contentW, 7.5, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        let hx = margin + 2;
        cols.forEach((col) => { doc.text(col.label, hx, startY + 5); hx += col.w; });
        return startY + 7.5;
      };

      y = drawTableHeader(y);

      filteredTodos.forEach((t, idx) => {
        const rowH = 13;

        // Page break
        if (y + rowH > pageH - 16) {
          doc.addPage();
          y = 10;
          y = drawTableHeader(y);
        }

        // Alternating row bg
        doc.setFillColor(idx % 2 === 0 ? 255 : 247, idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 252);
        doc.rect(margin, y, contentW, rowH, "F");

        // Left status stripe
        if (t.completed) {
          doc.setFillColor(22, 163, 74);   // green
          doc.rect(margin, y, 2.5, rowH, "F");
        } else if (isOverdue(t.dueDate)) {
          doc.setFillColor(220, 38, 38);   // red
          doc.rect(margin, y, 2.5, rowH, "F");
        } else {
          doc.setFillColor(200, 200, 200);
          doc.rect(margin, y, 2.5, rowH, "F");
        }

        let cx = margin + 4;

        // ── Title ──
        const titleClr = t.completed ? [130, 130, 130] : [20, 20, 20];
        doc.setTextColor(...titleClr);
        doc.setFont("helvetica", t.starred ? "bolditalic" : "bold");
        doc.setFontSize(8);
        const starPrefix = t.starred ? "[*] " : "";
        const titleLine = doc.splitTextToSize(starPrefix + t.title, cols[0].w - 5)[0];
        doc.text(titleLine, cx, y + 5);
        if (t.desc) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(130, 130, 130);
          doc.setFontSize(6);
          const descLine = doc.splitTextToSize(t.desc, cols[0].w - 5)[0];
          doc.text(descLine, cx, y + 10);
        }
        cx += cols[0].w;

        // ── Priority badge ──
        const [pr, pg, pb] = priorityColor(t.priority);
        const [pbr, pbg, pbb] = priorityBg(t.priority);
        doc.setFillColor(pbr, pbg, pbb);
        doc.setDrawColor(pr, pg, pb);
        doc.roundedRect(cx, y + 2, cols[1].w - 3, 6, 1.5, 1.5, "FD");
        doc.setTextColor(pr, pg, pb);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.text(priorityLabel(t.priority), cx + (cols[1].w - 3) / 2, y + 6.2, { align: "center" });
        cx += cols[1].w;

        // ── Category ──
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(categoryLabel(t.category), cx + 1, y + 5);
        cx += cols[2].w;

        // ── Due date ──
        const isOvr = !t.completed && isOverdue(t.dueDate);
        doc.setTextColor(isOvr ? 200 : 60, isOvr ? 30 : 60, isOvr ? 30 : 60);
        doc.setFont("helvetica", isOvr ? "bold" : "normal");
        doc.setFontSize(7.5);
        doc.text(formatDate(t.dueDate), cx + 1, y + 5);
        if (isOvr) {
          doc.setFontSize(6);
          doc.text("OVERDUE", cx + 1, y + 10);
        }
        cx += cols[3].w;

        // ── Subtasks ──
        const stTotal = t.subtasks?.length || 0;
        const stDone  = t.subtasks?.filter((s) => s.done).length || 0;
        const stTxt   = stTotal > 0 ? stDone + "/" + stTotal : "-";
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(stTxt, cx + cols[4].w / 2, y + 5, { align: "center" });
        if (stTotal > 0) {
          // mini progress bar
          const barW = cols[4].w - 6;
          doc.setFillColor(210, 210, 210);
          doc.roundedRect(cx + 3, y + 7, barW, 2, 1, 1, "F");
          if (stDone > 0) {
            doc.setFillColor(ar, ag, ab);
            doc.roundedRect(cx + 3, y + 7, (barW * stDone) / stTotal, 2, 1, 1, "F");
          }
        }
        cx += cols[4].w;

        // ── Status ──
        if (t.completed) {
          doc.setFillColor(220, 252, 231);
          doc.setDrawColor(22, 163, 74);
          doc.roundedRect(cx, y + 2, cols[5].w - 3, 6, 1.5, 1.5, "FD");
          doc.setTextColor(22, 163, 74);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.5);
          doc.text("DONE", cx + (cols[5].w - 3) / 2, y + 6.2, { align: "center" });
        } else {
          doc.setFillColor(243, 244, 246);
          doc.setDrawColor(180, 180, 180);
          doc.roundedRect(cx, y + 2, cols[5].w - 3, 6, 1.5, 1.5, "FD");
          doc.setTextColor(130, 130, 130);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.text("PENDING", cx + (cols[5].w - 3) / 2, y + 6.2, { align: "center" });
        }

        // Row divider
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, y + rowH, margin + contentW, y + rowH);

        y += rowH;
      });

      // ─────────────────────────────────────────────────────────────────────
      // FOOTER — on every page
      // ─────────────────────────────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);

        // Footer separator line
        doc.setDrawColor(ar, ag, ab);
        doc.setLineWidth(0.4);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        doc.setLineWidth(0.2);

        // Left: site name + tool
        doc.setTextColor(ar, ag, ab);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text(SITE_NAME, margin, pageH - 7.5);

        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.text("  " + SITE_URL + "  |  " + TOOL_NAME, margin + doc.getTextWidth(SITE_NAME), pageH - 7.5);

        // Right: page number
        doc.setTextColor(130, 130, 130);
        doc.setFontSize(6.5);
        doc.text("Page " + p + " of " + totalPages, pageW - margin, pageH - 7.5, { align: "right" });

        // Center: date
        doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), pageW / 2, pageH - 7.5, { align: "center" });
      }

      // ── Instant download ──
      doc.save("ToolsTrek-Tasks-" + new Date().toISOString().split("T")[0] + ".pdf");
      notify("PDF downloaded!");
    } catch (err) {
      console.error("PDF export error:", err);
      notify("PDF export failed. Try again.", "error");
    }
  };

  // ── Export / Import ──
  const exportData = () => {
    const data = JSON.stringify({ todos, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todos-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Exported successfully! 📥");
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.todos && Array.isArray(parsed.todos)) {
          setTodos(parsed.todos);
          notify(`Imported ${parsed.todos.length} tasks! 📤`);
        } else {
          notify("Invalid file format.", "error");
        }
      } catch {
        notify("Could not parse file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const subtaskProgress = (todo) => {
    if (!todo.subtasks?.length) return null;
    const done = todo.subtasks.filter((s) => s.done).length;
    return { done, total: todo.subtasks.length, pct: Math.round((done / todo.subtasks.length) * 100) };
  };

  const accent = accentColor.value;

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-2"
            style={{ background: notification.type === "error" ? "#ef4444" : notification.type === "info" ? "#6b7280" : accent }}
          >
            {notification.type === "error" ? <AlertCircle size={16} /> : <Sparkles size={16} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-0 sm:px-2">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}>
                <ListTodo size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  Task Manager
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.total} tasks · {stats.completed} done · {stats.completionRate}% complete
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {todos.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={loadSampleData}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 border-dashed transition-all"
                  style={{ borderColor: `${accent}60`, color: accent }}
                  id="load-sample-data-btn"
                >
                  <Sparkles size={14} /> Load Sample Data
                </motion.button>
              )}

              {todos.length > 0 && (
                <>
                  <button
                    onClick={exportData}
                    className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Export JSON"
                    id="export-todos-btn"
                  >
                    <Download size={16} />
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportPdf}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white shadow-md transition-all"
                    style={{ background: `linear-gradient(135deg, #e11d48, #f43f5e)` }}
                    title="Export as PDF"
                    id="export-pdf-btn"
                  >
                    <FileText size={14} /> PDF
                  </motion.button>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title="Reset all filters"
                id="reset-filters-btn"
              >
                <RotateCcw size={14} /> Reset
              </motion.button>

              <label className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" title="Import todos">
                <Upload size={16} />
                <input type="file" accept=".json" onChange={importData} className="hidden" id="import-todos-input" />
              </label>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-colors ${showSettings ? "text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                style={showSettings ? { background: accent } : {}}
                id="settings-toggle-btn"
              >
                <Settings size={16} />
              </button>

              {!addingTodo && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setAddingTodo(true); setTimeout(() => titleRef.current?.focus(), 50); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                  id="add-task-btn"
                >
                  <Plus size={16} /> Add Task
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* ── Settings Panel ── */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-5">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Palette size={16} style={{ color: accent }} /> Customization
                </h3>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Accent Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {ACCENT_COLORS.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => setAccentColor(col)}
                        className="w-8 h-8 rounded-full transition-all shadow-md"
                        style={{
                          background: col.value,
                          outline: accentColor.id === col.id ? `3px solid ${col.value}` : "none",
                          outlineOffset: "2px",
                          transform: accentColor.id === col.id ? "scale(1.2)" : "scale(1)",
                        }}
                        title={col.label}
                        id={`accent-${col.id}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Display Options</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: "showDesc", label: "Descriptions" },
                      { key: "showSubtasks", label: "Subtasks" },
                      { key: "showTags", label: "Tags" },
                      { key: "showDueDate", label: "Due Dates" },
                      { key: "compactMode", label: "Compact Mode" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${settings[key] ? "border-transparent text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"}`}
                        style={settings[key] ? { background: accent } : {}}
                        id={`setting-${key}`}
                      >
                        {settings[key] ? <Eye size={12} /> : <EyeOff size={12} />} {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => { setTodos([]); notify("All tasks cleared.", "info"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" id="clear-all-btn">
                    <Trash2 size={12} /> Clear All Tasks
                  </button>
                  {todos.some((t) => t.completed) && (
                    <button onClick={clearCompleted} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-orange-500 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors" id="clear-completed-btn">
                      <Archive size={12} /> Clear Completed
                    </button>
                  )}
                  <button onClick={loadSampleData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white transition-colors" style={{ background: accent }} id="load-sample-settings-btn">
                    <Sparkles size={12} /> {todos.length === 0 ? "Load Sample Data" : "Reset to Sample"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Panel ── */}
        {stats.total > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-3"
              id="toggle-stats-btn"
            >
              <BarChart2 size={12} /> Statistics {showStats ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                    {[
                      { label: "Total", value: stats.total, icon: <Layers size={14} />, color: "text-gray-600 dark:text-gray-400" },
                      { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={14} />, color: "text-emerald-500" },
                      { label: "Overdue", value: stats.overdue, icon: <AlertCircle size={14} />, color: "text-red-500" },
                      { label: "Urgent", value: stats.urgent, icon: <Flame size={14} />, color: "text-orange-500" },
                      { label: "Due Soon", value: stats.dueSoon, icon: <Clock size={14} />, color: "text-yellow-500" },
                      { label: "Starred", value: stats.starred, icon: <Star size={14} />, color: "text-amber-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-center">
                        <div className={`flex items-center justify-center gap-1 text-xs mb-1 ${s.color}`}>
                          {s.icon} {s.label}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <TrendingUp size={14} style={{ color: accent }} /> Overall Progress
                      </span>
                      <span className="text-sm font-bold" style={{ color: accent }}>{stats.completionRate}%</span>
                    </div>
                    <ProgressBar value={stats.completionRate} accent={accent} />
                    {stats.subtaskTotal > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Subtasks: {stats.subtaskDone}/{stats.subtaskTotal}</span>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{Math.round((stats.subtaskDone / stats.subtaskTotal) * 100)}%</span>
                        </div>
                        <ProgressBar value={Math.round((stats.subtaskDone / stats.subtaskTotal) * 100)} accent={accent} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Add / Edit Form ── */}
        <AnimatePresence>
          {addingTodo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 shadow-xl p-5 space-y-4" style={{ borderColor: accent }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{editingId ? "Edit Task" : "New Task"}</h3>
                  <button onClick={resetForm} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" id="close-form-btn">
                    <X size={16} />
                  </button>
                </div>

                <input
                  ref={titleRef}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) editingId ? updateTodo(editingId) : addTodo(); }}
                  placeholder="Task title *"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none"
                  id="task-title-input"
                />

                <textarea
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none resize-none"
                  id="task-desc-input"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none"
                      id="task-priority-select"
                    >
                      {Object.entries(PRIORITIES).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none"
                      id="task-category-select"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Due Date</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none"
                      id="task-duedate-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="e.g. important, work, review"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none"
                    id="task-tags-input"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Subtasks</label>
                  <div className="space-y-1.5 mb-2">
                    {formSubtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Circle size={14} className="text-gray-400" />
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{st.title}</span>
                        <button onClick={() => setFormSubtasks((p) => p.filter((s) => s.id !== st.id))} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFormSubtask(); } }}
                      placeholder="Add a subtask..."
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none"
                      id="subtask-input"
                    />
                    <button onClick={addFormSubtask} className="px-3 py-2 rounded-xl text-white text-sm" style={{ background: accent }} id="add-subtask-btn">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button onClick={resetForm} className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" id="cancel-form-btn">
                    Cancel
                  </button>
                  <button
                    onClick={() => editingId ? updateTodo(editingId) : addTodo()}
                    disabled={!form.title.trim()}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                    style={{ background: accent }}
                    id="save-task-btn"
                  >
                    {editingId ? "Update Task" : "Add Task"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search & Filter Bar ── */}
        <div className="mb-5 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, tags, descriptions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none"
              id="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {[
              { id: "all", label: "All", icon: <Layers size={12} /> },
              { id: "active", label: "Active", icon: <Circle size={12} /> },
              { id: "starred", label: "Starred", icon: <Star size={12} /> },
              { id: "overdue", label: "Overdue", icon: <AlertCircle size={12} /> },
              { id: "duesoon", label: "Due Soon", icon: <Clock size={12} /> },
              { id: "completed", label: "Completed", icon: <CheckCircle2 size={12} /> },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === f.id ? "text-white shadow-md" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"}`}
                style={filter === f.id ? { background: accent } : {}}
                id={`filter-${f.id}`}
              >
                {f.icon} {f.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs outline-none"
                id="category-filter-select"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs outline-none"
                id="priority-filter-select"
              >
                <option value="all">All Priorities</option>
                {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs outline-none"
                id="sort-select"
              >
                {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>

              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors"
                title={showCompleted ? "Hide completed" : "Show completed"}
                id="toggle-completed-btn"
              >
                {showCompleted ? <Eye size={14} className="text-gray-500 dark:text-gray-400" /> : <EyeOff size={14} className="text-gray-500 dark:text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Todo List ── */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredTodos.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <ListTodo size={28} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {todos.length === 0 ? "No tasks yet" : "No tasks match your filters"}
                </p>
                <p className="text-gray-300 dark:text-gray-600 text-sm mb-6">
                  {todos.length === 0 ? "Add your first task or load sample data to get started" : "Try adjusting your search or filters"}
                </p>
                {todos.length === 0 && (
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => { setAddingTodo(true); setTimeout(() => titleRef.current?.focus(), 50); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
                      style={{ background: accent }}
                      id="empty-add-task-btn"
                    >
                      <Plus size={14} /> Add First Task
                    </button>
                    <button
                      onClick={loadSampleData}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 border-dashed"
                      style={{ borderColor: `${accent}60`, color: accent }}
                      id="empty-sample-btn"
                    >
                      <Sparkles size={14} /> Load Sample Data
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              filteredTodos.map((todo) => {
                const sp = subtaskProgress(todo);
                const overdue = !todo.completed && isOverdue(todo.dueDate);
                const dueSoon = !todo.completed && isDueSoon(todo.dueDate);
                const isExpanded = expandedId === todo.id;
                const cat = CATEGORIES.find((c) => c.id === todo.category);

                return (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                    className={`group bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-200 ${settings.compactMode ? "p-3" : "p-4"} ${overdue ? "border-red-200 dark:border-red-900/50" : "border-gray-200 dark:border-gray-800"} hover:shadow-md`}
                    style={todo.completed ? { opacity: 0.65 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleComplete(todo.id)}
                        className="mt-0.5 flex-shrink-0 transition-all hover:scale-110"
                        id={`complete-${todo.id}`}
                      >
                        {todo.completed
                          ? <CheckCircle2 size={20} style={{ color: accent }} />
                          : <Circle size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500" />
                        }
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <span
                            className={`font-medium text-gray-900 dark:text-white leading-snug cursor-pointer text-sm ${todo.completed ? "line-through opacity-50" : ""}`}
                            onClick={() => setExpandedId(isExpanded ? null : todo.id)}
                          >
                            {todo.title}
                          </span>
                          {overdue && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20">
                              <AlertCircle size={10} /> Overdue
                            </span>
                          )}
                          {!overdue && dueSoon && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20">
                              <Bell size={10} /> Due Soon
                            </span>
                          )}
                        </div>

                        {!settings.compactMode && (
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <PriorityBadge priority={todo.priority} />
                            <CategoryBadge categoryId={todo.category} />
                            {settings.showDueDate && todo.dueDate && (
                              <span className={`inline-flex items-center gap-1 text-xs ${overdue ? "text-red-500" : dueSoon ? "text-yellow-600 dark:text-yellow-500" : "text-gray-400 dark:text-gray-500"}`}>
                                <Calendar size={11} />
                                {new Date(todo.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            )}
                            {sp && settings.showSubtasks && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                <CheckCircle2 size={11} /> {sp.done}/{sp.total}
                              </span>
                            )}
                          </div>
                        )}

                        {sp && sp.total > 0 && !settings.compactMode && (
                          <div className="mt-2">
                            <ProgressBar value={sp.pct} accent={accent} />
                          </div>
                        )}

                        {settings.showTags && todo.tags?.length > 0 && !settings.compactMode && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {todo.tags.map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => toggleStar(todo.id)} className={`p-1.5 rounded-lg transition-colors ${todo.starred ? "text-amber-400" : "text-gray-300 dark:text-gray-600 hover:text-amber-400"}`} id={`star-${todo.id}`}>
                          {todo.starred ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                        </button>
                        <button onClick={() => startEdit(todo)} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-blue-500 transition-colors" id={`edit-${todo.id}`}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors" id={`delete-${todo.id}`}>
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => setExpandedId(isExpanded ? null : todo.id)} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" id={`expand-${todo.id}`}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                            {settings.showDesc && todo.desc && (
                              <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium uppercase tracking-wide">Description</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{todo.desc}</p>
                              </div>
                            )}

                            {settings.showSubtasks && todo.subtasks?.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium uppercase tracking-wide">
                                  Subtasks ({todo.subtasks.filter((s) => s.done).length}/{todo.subtasks.length})
                                </p>
                                <div className="space-y-1.5">
                                  {todo.subtasks.map((st) => (
                                    <div key={st.id} className="flex items-center gap-2 group/st">
                                      <button onClick={() => toggleSubtask(todo.id, st.id)} className="flex-shrink-0 transition-all hover:scale-110" id={`subtask-${st.id}`}>
                                        {st.done
                                          ? <CheckCircle2 size={16} style={{ color: accent }} />
                                          : <Circle size={16} className="text-gray-300 dark:text-gray-600" />
                                        }
                                      </button>
                                      <span className={`flex-1 text-sm ${st.done ? "line-through text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"}`}>
                                        {st.title}
                                      </span>
                                      <button onClick={() => deleteSubtask(todo.id, st.id)} className="opacity-0 group-hover/st:opacity-100 p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-all" id={`del-subtask-${st.id}`}>
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <input
                                placeholder="Add subtask (press Enter)..."
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && e.target.value.trim()) {
                                    const val = e.target.value.trim();
                                    setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, subtasks: [...(t.subtasks || []), { id: genId(), title: val, done: false }] } : t));
                                    e.target.value = "";
                                    notify("Subtask added!");
                                  }
                                }}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-xs outline-none"
                                id={`inline-subtask-${todo.id}`}
                              />
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500 pt-1">
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> Created {new Date(todo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              {todo.dueDate && (
                                <span className={`flex items-center gap-1 ${overdue ? "text-red-400" : ""}`}>
                                  <Calendar size={11} /> Due {new Date(todo.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Tag size={11} /> {cat?.label}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer summary ── */}
        {filteredTodos.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 px-1">
            <span>{filteredTodos.length} task{filteredTodos.length !== 1 ? "s" : ""} shown</span>
            {todos.some((t) => t.completed) && (
              <button onClick={clearCompleted} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1" id="footer-clear-completed-btn">
                <Archive size={11} /> Clear completed ({stats.completed})
              </button>
            )}
          </div>
        )}

        {/* ── Feature Info Cards ── */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: <Target size={18} />, title: "Smart Prioritization",
              desc: "Assign Urgent, High, Medium, or Low priority to each task. The priority system helps you focus on what matters most, with color-coded visual indicators so you never miss a critical item.",
              gradient: "from-red-500/10 to-orange-500/10",
            },
            {
              icon: <Layers size={18} />, title: "Subtask Breakdown",
              desc: "Break complex tasks into manageable subtasks. Track progress with visual progress bars and completion percentages. Completing a parent task auto-marks all subtasks as done.",
              gradient: "from-blue-500/10 to-cyan-500/10",
            },
            {
              icon: <Tag size={18} />, title: "Categories & Tags",
              desc: "Organize tasks with 8 built-in categories (Work, Health, Finance, etc.) and unlimited custom tags. Combine filters for laser-focused task views.",
              gradient: "from-emerald-500/10 to-teal-500/10",
            },
            {
              icon: <Download size={18} />, title: "Export & Import",
              desc: "Your data is always yours. Export all tasks to a JSON file for backup. Import previously exported data to restore your workspace on any device instantly.",
              gradient: "from-violet-500/10 to-purple-500/10",
            },
            {
              icon: <Palette size={18} />, title: "Full Customization",
              desc: "Choose from 6 accent colors, toggle compact mode, show/hide descriptions, subtasks, tags, and due dates. Personalize every aspect of the tool to match your workflow.",
              gradient: "from-pink-500/10 to-rose-500/10",
            },
            {
              icon: <Award size={18} />, title: "Progress Dashboard",
              desc: "Real-time statistics track total tasks, completion rate, overdue items, and subtask progress. Stay motivated with clear visual progress indicators and streaks.",
              gradient: "from-amber-500/10 to-yellow-500/10",
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-2xl border border-gray-100 dark:border-gray-800 p-5 bg-gradient-to-br ${item.gradient}`}>
              <div className="flex items-center gap-2 mb-2" style={{ color: accent }}>
                {item.icon}
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Tips ── */}
        <div className="mt-6 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2 mb-3">
            <BookOpen size={16} style={{ color: accent }} /> Keyboard Shortcuts & Power Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { shortcut: "Enter", desc: "Save task while title field is focused" },
              { shortcut: "Enter (subtask field)", desc: "Add subtask instantly" },
              { shortcut: "Click task title", desc: "Expand/collapse task details" },
              { shortcut: "Hover over card", desc: "Show action buttons (star, edit, delete)" },
              { shortcut: "# in search", desc: "Search by tag name" },
              { shortcut: "Due Date filter", desc: "\"Due Soon\" shows tasks due within 2 days" },
            ].map((tip) => (
              <div key={tip.shortcut} className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">
                  {tip.shortcut}
                </span>
                <span className="text-gray-500 dark:text-gray-400">{tip.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
