// app/(main)/tools-compo/tools/TaskPrioritizer.jsx
"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } from "react";
import ToolPageShell from "../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import toolsData from "@/lib/toolsData.json";
import {
  LayoutGrid,
  Columns3,
  ListOrdered,
  Maximize2,
  Minimize2,
  Plus,
  Search,
  Trash2,
  Edit3,
  Check,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  Upload,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Info,
  HelpCircle,
  Briefcase,
  X,
  FileSpreadsheet,
  FileCode,
  Printer,
  PieChart,
  BrainCircuit,
  Eye,
  CheckSquare,
  Square,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  FRAMEWORKS,
  FRAMEWORK_CONFIGS,
  TASK_CATEGORIES,
  THEMES,
  PRESET_TEMPLATES,
  INITIAL_TASKS,
  taskSoundEngine,
  evaluateMatrixHealth,
  exportToMarkdown,
  exportToCSV,
  generateMatrixImage,
  EDUCATIONAL_GUIDE,
  TASK_PRIORITIZER_FAQS
} from "./task-prioritizer/taskPrioritizerData";

const STORAGE_KEY = "toolstrek_task_prioritizer_state_v1";

// ─── Persisted state external store (localStorage) ───────────────────────────
const DEFAULT_PERSISTED_STATE = {
  tasks: INITIAL_TASKS,
  framework: FRAMEWORKS.EISENHOWER,
  theme: THEMES[0].id,
  soundEnabled: true,
};

let cachedStateRaw = null;
let cachedState = DEFAULT_PERSISTED_STATE;
const persistedStateListeners = new Set();

function readPersistedState() {
  if (typeof window === "undefined") return DEFAULT_PERSISTED_STATE;
  let raw;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return DEFAULT_PERSISTED_STATE;
  }
  if (raw === cachedStateRaw) return cachedState;
  cachedStateRaw = raw;
  if (!raw) {
    cachedState = DEFAULT_PERSISTED_STATE;
    return cachedState;
  }
  try {
    const parsed = JSON.parse(raw);
    cachedState = {
      tasks: Array.isArray(parsed?.tasks) ? parsed.tasks : INITIAL_TASKS,
      framework:
        parsed?.framework && FRAMEWORK_CONFIGS[parsed.framework]
          ? parsed.framework
          : FRAMEWORKS.EISENHOWER,
      theme: parsed?.theme || THEMES[0].id,
      soundEnabled:
        parsed?.soundEnabled !== undefined
          ? parsed.soundEnabled
          : true,
    };
  } catch {
    cachedState = DEFAULT_PERSISTED_STATE;
  }
  return cachedState;
}

function getServerPersistedState() {
  return DEFAULT_PERSISTED_STATE;
}

function subscribePersistedState(listener) {
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) listener();
  };
  persistedStateListeners.add(listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    persistedStateListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function writePersistedState(next) {
  cachedState = next;
  cachedStateRaw = JSON.stringify(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, cachedStateRaw);
  } catch {
    // Storage quota exceeded or disabled
  }
  persistedStateListeners.forEach((listener) => listener());
}

export default function TaskPrioritizer() {
  // ─── Core State ───
  const persistedState = useSyncExternalStore(
    subscribePersistedState,
    readPersistedState,
    getServerPersistedState
  );
  const { tasks, framework, activeTheme, soundEnabled } = persistedState;

  const [viewMode, setViewMode] = useState("matrix"); // matrix | kanban | list | focus
  const [focusQuadrant, setFocusQuadrant] = useState("q1");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | completed
  const [sortBy, setSortBy] = useState("default"); // default | deadline | title | est
  const [isZenMode, setIsZenMode] = useState(false);

  // Drop-in replacements for the persisted pieces of state: each write merges
  // into the stored snapshot so the localStorage format stays unchanged.
  const setTasks = useCallback((updater) => {
    const current = readPersistedState();
    const nextTasks =
      typeof updater === "function" ? updater(current.tasks) : updater;
    writePersistedState({ ...current, tasks: nextTasks });
  }, []);

  const setFramework = useCallback((nextFramework) => {
    writePersistedState({ ...readPersistedState(), framework: nextFramework });
  }, []);

  const setActiveTheme = useCallback((nextTheme) => {
    writePersistedState({ ...readPersistedState(), theme: nextTheme });
  }, []);

  const setSoundEnabled = useCallback((nextSoundEnabled) => {
    writePersistedState({
      ...readPersistedState(),
      soundEnabled: nextSoundEnabled,
    });
  }, []);

  // Keep the sound engine in sync with the persisted preference
  useEffect(() => {
    taskSoundEngine.muted = !soundEnabled;
  }, [soundEnabled]);

  // ─── Modal / Drawer States ───
  const [editingTask, setEditingTask] = useState(null); // task object or null
  const [quickAddQuadrant, setQuickAddQuadrant] = useState("q1");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHealthDrawerOpen, setIsHealthDrawerOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // ─── Quick Add Form State ───
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("work");
  const [newDueDate, setNewDueDate] = useState("");
  const [newEst, setNewEst] = useState(1);
  const [newNotes, setNewNotes] = useState("");

  const fileInputRef = useRef(null);

  // ─── Sound Toggle ───
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    taskSoundEngine.muted = !next;
    toast.success(next ? "Sound effects enabled" : "Sound effects muted");
  };

  // Current Framework Configuration
  const currentConfig = useMemo(() => {
    return FRAMEWORK_CONFIGS[framework] || FRAMEWORK_CONFIGS[FRAMEWORKS.EISENHOWER];
  }, [framework]);

  // Current Theme
  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === activeTheme) || THEMES[0];
  }, [activeTheme]);

  // Matrix Health & Productivity Diagnostics
  const healthStats = useMemo(() => {
    return evaluateMatrixHealth(tasks, framework);
  }, [tasks, framework]);

  // ─── Filter & Sort Tasks ───
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (statusFilter === "completed") {
      result = result.filter((t) => t.completed);
    }

    // Sorting
    if (sortBy === "deadline") {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "est") {
      result.sort((a, b) => (b.estimatedPomodoros || 0) - (a.estimatedPomodoros || 0));
    }

    return result;
  }, [tasks, searchQuery, categoryFilter, statusFilter, sortBy]);

  // ─── Task Handlers ───
  const handleAddTask = (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: newTitle.trim(),
      quadrant: quickAddQuadrant,
      category: newCategory,
      dueDate: newDueDate,
      estimatedPomodoros: Number(newEst) || 1,
      notes: newNotes.trim(),
      completed: false,
      subtasks: []
    };

    setTasks((prev) => [newTask, ...prev]);
    taskSoundEngine.playAdd();
    toast.success("Task added to matrix");

    // Reset input fields
    setNewTitle("");
    setNewNotes("");
    setIsQuickAddOpen(false);
  };

  const handleToggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.completed;
          if (next) taskSoundEngine.playComplete();
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const handleMoveTask = (id, targetQuadrant) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, quadrant: targetQuadrant } : t))
    );
    taskSoundEngine.playMove();
    const qInfo = currentConfig.quadrants.find((q) => q.id === targetQuadrant);
    toast.info(`Moved to ${qInfo ? qInfo.name : targetQuadrant}`);
  };

  const handleDeleteTask = (id) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));
    taskSoundEngine.playDelete();

    toast.success(`Deleted "${taskToDelete.title.slice(0, 24)}..."`, {
      action: {
        label: "Undo",
        onClick: () => {
          setTasks((prev) => [taskToDelete, ...prev]);
          toast.success("Task restored");
        }
      }
    });
  };

  const handleClearAll = () => {
    if (tasks.length === 0) return;
    if (window.confirm("Are you sure you want to clear all tasks from the matrix?")) {
      const backup = [...tasks];
      setTasks([]);
      taskSoundEngine.playDelete();
      toast.success("All tasks cleared", {
        action: {
          label: "Undo",
          onClick: () => {
            setTasks(backup);
            toast.success("Tasks restored");
          }
        }
      });
    }
  };

  const handleLoadTemplate = (templateId) => {
    const tmpl = PRESET_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    if (tasks.length > 0) {
      if (!window.confirm(`Load preset "${tmpl.name}"? This will replace your current matrix tasks.`)) {
        return;
      }
    }

    setFramework(tmpl.framework);
    setTasks(tmpl.tasks);
    taskSoundEngine.playAdd();
    toast.success(`Loaded "${tmpl.name}" preset`);
  };

  // ─── Subtask Handling inside Edit Modal ───
  const handleAddSubtask = (taskId, text) => {
    if (!text.trim()) return;
    const newSub = {
      id: `st-${Date.now()}`,
      text: text.trim(),
      completed: false
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, subtasks: [...(t.subtasks || []), newSub] };
        }
        return t;
      })
    );

    if (editingTask && editingTask.id === taskId) {
      setEditingTask((prev) => ({
        ...prev,
        subtasks: [...(prev.subtasks || []), newSub]
      }));
    }
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updated };
        }
        return t;
      })
    );

    if (editingTask && editingTask.id === taskId) {
      setEditingTask((prev) => ({
        ...prev,
        subtasks: (prev.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        )
      }));
    }
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId)
          };
        }
        return t;
      })
    );

    if (editingTask && editingTask.id === taskId) {
      setEditingTask((prev) => ({
        ...prev,
        subtasks: (prev.subtasks || []).filter((s) => s.id !== subtaskId)
      }));
    }
  };

  const handleSaveEdit = (e) => {
    if (e) e.preventDefault();
    if (!editingTask) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === editingTask.id ? { ...editingTask } : t))
    );
    toast.success("Task updated");
    setEditingTask(null);
  };

  // ─── Export & Backup Handlers ───
  const handleDownloadImage = async () => {
    setIsGeneratingImage(true);
    try {
      const dataUrl = await generateMatrixImage(tasks, currentConfig, currentTheme);
      if (!dataUrl) {
        toast.error("Failed to render matrix image");
        return;
      }
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `toolstrek-task-matrix-${framework}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      toast.success("High-res PNG image downloaded!");
    } catch {
      toast.error("Error generating matrix card image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportToCSV(tasks, currentConfig);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toolstrek-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded!");
  };

  const handleCopyMarkdown = () => {
    const md = exportToMarkdown(tasks, currentConfig);
    navigator.clipboard.writeText(md);
    toast.success("Formatted Markdown copied to clipboard!");
  };

  const handleDownloadJSON = () => {
    const exportData = {
      version: "1.0",
      framework,
      theme: activeTheme,
      exportedAt: new Date().toISOString(),
      tasks
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toolstrek-task-prioritizer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON backup downloaded!");
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
          if (data.framework && FRAMEWORK_CONFIGS[data.framework]) {
            setFramework(data.framework);
          }
          toast.success(`Imported ${data.tasks.length} tasks successfully!`);
        } else {
          toast.error("Invalid task backup file format");
        }
      } catch {
        toast.error("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className={`space-y-6 ${isZenMode ? "fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 overflow-y-auto" : ""}`}>
        {/* ─── Top Header & Controls ─── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Task Prioritizer
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Pro Studio
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Eisenhower Decision Matrix & Action Priority Studio with local client-side persistence
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FavoriteButton
              tool={{
                title: "Task Prioritizer & Eisenhower Matrix Studio",
                link: "/tools/task-prioritizer",
                icon: "LayoutGrid",
                categories: ["Productivity"]
              }}
            />

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shadow-sm"
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Zen Fullscreen Mode */}
            <button
              onClick={() => setIsZenMode(!isZenMode)}
              title={isZenMode ? "Exit Fullscreen" : "Zen Focus Mode"}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shadow-sm"
              aria-label="Toggle Fullscreen"
            >
              {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Export & Share Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export & Share</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={() => {
                setQuickAddQuadrant("q1");
                setIsQuickAddOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </header>

        {/* ─── Framework & Preset Bar ─── */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Framework Switcher */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Prioritization Framework
              </label>
              <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {Object.values(FRAMEWORK_CONFIGS).map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => {
                      setFramework(fw.id);
                      taskSoundEngine.playMove();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      framework === fw.id
                        ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {fw.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets & Templates */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quick Presets:</span>
              {PRESET_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleLoadTemplate(tmpl.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-800 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {tmpl.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block lg:text-right">
                View Layout
              </label>
              <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode("matrix")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "matrix"
                      ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="2×2 Matrix Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Matrix</span>
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "kanban"
                      ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="4-Column Kanban Board"
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Ranked Priority List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Ranked</span>
                </button>
                <button
                  onClick={() => setViewMode("focus")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "focus"
                      ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Single Quadrant Focus Mode"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Focus</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Search, Filter, Sort & Health Strip ─── */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {TASK_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="inline-flex rounded-xl p-0.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${
                  statusFilter === "all" ? "bg-gray-100 dark:bg-gray-800 text-purple-600 font-bold" : "text-gray-500"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${
                  statusFilter === "active" ? "bg-gray-100 dark:bg-gray-800 text-purple-600 font-bold" : "text-gray-500"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-2.5 py-1.5 rounded-lg font-medium ${
                  statusFilter === "completed" ? "bg-gray-100 dark:bg-gray-800 text-purple-600 font-bold" : "text-gray-500"
                }`}
              >
                Done
              </button>
            </div>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="default">Default Order</option>
              <option value="deadline">Due Date</option>
              <option value="title">Alphabetical</option>
              <option value="est">Estimated Time</option>
            </select>
          </div>

          {/* Matrix Health Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHealthDrawerOpen(!isHealthDrawerOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-purple-400 text-gray-700 dark:text-gray-300 font-medium transition-colors shadow-sm"
            >
              <PieChart className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>
                Matrix Health: <strong className={healthStats.color}>{healthStats.score}%</strong>
              </span>
              {isHealthDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {tasks.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Clear all tasks"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* ─── Expandable Matrix Health & Advice Drawer ─── */}
        {isHealthDrawerOpen && (
          <div className="bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-white dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-gray-900 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-4 sm:p-5 space-y-3 transition-all animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Executive Matrix Health & Coaching Diagnostics
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 ${healthStats.color} border border-gray-200 dark:border-gray-700`}>
                    {healthStats.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-3xl leading-relaxed">
                  {healthStats.advice}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div>
                  <span className="text-gray-400 block text-[10px]">TOTAL TASKS</span>
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">
                    {tasks.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">COMPLETION</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {healthStats.completionRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Distribution Percentage Bar */}
            <div className="space-y-1">
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${healthStats.breakdown.q1}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                  title={`Q1: ${healthStats.breakdown.q1}%`}
                />
                <div
                  style={{ width: `${healthStats.breakdown.q2}%` }}
                  className="bg-indigo-500 h-full transition-all duration-500"
                  title={`Q2: ${healthStats.breakdown.q2}%`}
                />
                <div
                  style={{ width: `${healthStats.breakdown.q3}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Q3: ${healthStats.breakdown.q3}%`}
                />
                <div
                  style={{ width: `${healthStats.breakdown.q4}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Q4: ${healthStats.breakdown.q4}%`}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Q1: {healthStats.breakdown.q1}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Q2: {healthStats.breakdown.q2}% (Target: &gt;45%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Q3: {healthStats.breakdown.q3}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Q4: {healthStats.breakdown.q4}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Main View Renderer ─── */}
        {viewMode === "matrix" && (
          <div className="space-y-2">
            {/* Horizontal Axis Indicators */}
            <div className="flex justify-between items-center px-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              <span>← {currentConfig.xAxis.left}</span>
              <span>{currentConfig.xAxis.right} →</span>
            </div>

            {/* 2x2 Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentConfig.quadrants.map((quadrant) => {
                const quadTasks = filteredTasks.filter((t) => t.quadrant === quadrant.id);
                return (
                  <QuadrantCard
                    key={quadrant.id}
                    quadrant={quadrant}
                    tasks={quadTasks}
                    allQuadrants={currentConfig.quadrants}
                    onToggleComplete={handleToggleComplete}
                    onMoveTask={handleMoveTask}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={setEditingTask}
                    onOpenQuickAdd={() => {
                      setQuickAddQuadrant(quadrant.id);
                      setIsQuickAddOpen(true);
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentConfig.quadrants.map((quadrant) => {
              const quadTasks = filteredTasks.filter((t) => t.quadrant === quadrant.id);
              return (
                <QuadrantCard
                  key={quadrant.id}
                  quadrant={quadrant}
                  tasks={quadTasks}
                  allQuadrants={currentConfig.quadrants}
                  onToggleComplete={handleToggleComplete}
                  onMoveTask={handleMoveTask}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={setEditingTask}
                  onOpenQuickAdd={() => {
                    setQuickAddQuadrant(quadrant.id);
                    setIsQuickAddOpen(true);
                  }}
                  isColumn
                />
              );
            })}
          </div>
        )}

        {viewMode === "list" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Ranked Tasks ({filteredTasks.length})
              </h2>
              <span className="text-xs text-gray-400">
                Sorted by {sortBy === "default" ? "Quadrant Priority" : sortBy}
              </span>
            </div>

            {filteredTasks.length === 0 ? (
              <p className="text-center py-12 text-sm text-gray-400 italic">
                No tasks match current search or filters.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTasks.map((task, idx) => {
                  const quad = currentConfig.quadrants.find((q) => q.id === task.quadrant);
                  return (
                    <div
                      key={task.id}
                      className="py-3 flex items-start gap-3 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-2 rounded-xl transition-colors"
                    >
                      <span className="text-xs font-bold text-gray-400 w-6 pt-0.5">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className={`pt-1 text-gray-400 hover:${quad?.accentText || "text-purple-600"}`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              quad?.badgeBg || "bg-gray-500"
                            } text-white`}
                          >
                            {quad?.code || task.quadrant.toUpperCase()}
                          </span>
                          <span
                            className={`text-sm font-semibold break-words ${
                              task.completed
                                ? "line-through text-gray-400 dark:text-gray-500"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3" />
                              {task.dueDate}
                            </span>
                          )}
                        </div>
                        {task.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {task.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                          title="Edit task"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {viewMode === "focus" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Zen Focus Quadrant:
                </span>
              </div>
              <div className="flex items-center gap-2">
                {currentConfig.quadrants.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setFocusQuadrant(q.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      focusQuadrant === q.id
                        ? `${q.badgeBg} text-white shadow-sm`
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {q.code}: {q.name}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const selectedQuadrant =
                currentConfig.quadrants.find((q) => q.id === focusQuadrant) ||
                currentConfig.quadrants[0];
              const quadTasks = filteredTasks.filter((t) => t.quadrant === focusQuadrant);
              return (
                <div className="max-w-3xl mx-auto">
                  <QuadrantCard
                    quadrant={selectedQuadrant}
                    tasks={quadTasks}
                    allQuadrants={currentConfig.quadrants}
                    onToggleComplete={handleToggleComplete}
                    onMoveTask={handleMoveTask}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={setEditingTask}
                    onOpenQuickAdd={() => {
                      setQuickAddQuadrant(focusQuadrant);
                      setIsQuickAddOpen(true);
                    }}
                    isFocus
                  />
                </div>
              );
            })()}
          </div>
        )}

        {/* ─── Quick Add Task Modal ─── */}
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Add Task to Matrix
                  </h3>
                </div>
                <button
                  onClick={() => setIsQuickAddOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fix checkout bug, finalize pitch deck..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Target Quadrant
                    </label>
                    <select
                      value={quickAddQuadrant}
                      onChange={(e) => setQuickAddQuadrant(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs focus:outline-none"
                    >
                      {currentConfig.quadrants.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.code}: {q.name} ({q.subtitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Category Tag
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs focus:outline-none"
                    >
                      {TASK_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Due Date (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Today, Friday 5 PM"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Estimated Pomodoros (25m)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={newEst}
                      onChange={(e) => setNewEst(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Notes / Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Context, blockers, or links..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── Task Edit & Subtasks Modal ─── */}
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Edit Task Details
                  </h3>
                </div>
                <button
                  onClick={() => setEditingTask(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Quadrant
                    </label>
                    <select
                      value={editingTask.quadrant}
                      onChange={(e) => setEditingTask({ ...editingTask, quadrant: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs"
                    >
                      {currentConfig.quadrants.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.code}: {q.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <select
                      value={editingTask.category || "work"}
                      onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs"
                    >
                      {TASK_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Due Date
                    </label>
                    <input
                      type="text"
                      value={editingTask.dueDate || ""}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Est. Pomodoros
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={editingTask.estimatedPomodoros || 1}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, estimatedPomodoros: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editingTask.notes || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs"
                  />
                </div>

                {/* Subtasks Section */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Subtasks Checklist</span>
                    <span className="text-[10px] text-gray-400">
                      {(editingTask.subtasks || []).filter((s) => s.completed).length}/
                      {(editingTask.subtasks || []).length} Done
                    </span>
                  </label>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {(editingTask.subtasks || []).map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(editingTask.id, sub.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {sub.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                          <span
                            className={
                              sub.completed
                                ? "line-through text-gray-400"
                                : "text-gray-800 dark:text-gray-200"
                            }
                          >
                            {sub.text}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(editingTask.id, sub.id)}
                          className="text-gray-400 hover:text-rose-500 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Subtask Input */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      id="new-subtask-input"
                      type="text"
                      placeholder="Add subtask step..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubtask(editingTask.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("new-subtask-input");
                        if (input && input.value) {
                          handleAddSubtask(editingTask.id, input.value);
                          input.value = "";
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteTask(editingTask.id);
                      setEditingTask(null);
                    }}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Task</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── Export & Backup Modal ─── */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Export & Backup Matrix
                  </h3>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {/* PNG Card */}
                <button
                  onClick={handleDownloadImage}
                  disabled={isGeneratingImage}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-left group"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block group-hover:text-purple-600">
                      Download Visual PNG Card
                    </span>
                    <span className="text-[11px] text-gray-500">
                      High-resolution 2×2 matrix rendered via HTML5 Canvas
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                </button>

                {/* CSV */}
                <button
                  onClick={handleDownloadCSV}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-left group"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block group-hover:text-purple-600">
                      Download CSV Spreadsheet
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Compatible with Microsoft Excel, Apple Numbers & Google Sheets
                    </span>
                  </div>
                  <FileSpreadsheet className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                </button>

                {/* Copy Markdown */}
                <button
                  onClick={handleCopyMarkdown}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-left group"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block group-hover:text-purple-600">
                      Copy Formatted Markdown
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Ready to paste into Notion, Slack, Jira, or GitHub issues
                    </span>
                  </div>
                  <Copy className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                </button>

                {/* JSON Backup */}
                <button
                  onClick={handleDownloadJSON}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-left group"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block group-hover:text-purple-600">
                      Export JSON Backup
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Complete state snapshot for restoration or device transfer
                    </span>
                  </div>
                  <FileCode className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                </button>

                {/* Import JSON */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-left group"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block group-hover:text-purple-600">
                      Restore / Import JSON
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Load tasks previously exported from ToolsTrek
                    </span>
                  </div>
                  <Upload className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />

                {/* Print View */}
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-left group"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block group-hover:text-purple-600">
                      Print Matrix Sheet
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Clean print-formatted layout optimized for paper review
                    </span>
                  </div>
                  <Printer className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Educational Guide Section ─── */}
        <section className="mt-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
                How to Master the Eisenhower Matrix & Task Prioritization
              </h2>
              <p className="text-xs text-gray-500">
                Cognitive psychology, executive time management, and the science of proactive flow
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EDUCATIONAL_GUIDE.map((guide, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 space-y-2"
              >
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 text-xs font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {guide.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {guide.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ Accordion Section ─── */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 pb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-gray-500">
                Common questions regarding privacy, decision frameworks, and offline persistence
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {TASK_PRIORITIZER_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-3">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-3 py-1 text-sm font-bold text-gray-800 dark:text-gray-200 hover:text-purple-600 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-purple-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed pl-1">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </ToolPageShell>
  );
}

// ─── Reusable Quadrant Card Component ───
function QuadrantCard({
  quadrant,
  tasks,
  allQuadrants,
  onToggleComplete,
  onMoveTask,
  onDeleteTask,
  onEditTask,
  onOpenQuickAdd,
  isColumn = false,
  isFocus = false
}) {
  const [inlineInput, setInlineInput] = useState("");

  const handleInlineSubmit = (e) => {
    e.preventDefault();
    if (!inlineInput.trim()) return;

    // Trigger quick add with custom title
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: inlineInput.trim(),
      quadrant: quadrant.id,
      category: "work",
      dueDate: "",
      estimatedPomodoros: 1,
      notes: "",
      completed: false,
      subtasks: []
    };

    // Dispatch global event or call prop
    setInlineInput("");
    onMoveTask(newTask.id, quadrant.id); // fallback trigger
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div
      className={`rounded-2xl border-2 transition-all flex flex-col ${quadrant.lightBg} ${quadrant.lightBorder} ${
        isFocus ? "p-6 min-h-[500px]" : isColumn ? "p-4 min-h-[420px]" : "p-4 sm:p-5 min-h-[380px]"
      } shadow-xs hover:shadow-md`}
    >
      {/* Quadrant Header */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full text-white ${quadrant.badgeBg} shadow-xs`}
          >
            {quadrant.code}
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
              {quadrant.name}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              {quadrant.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-gray-400 bg-white/70 dark:bg-gray-900/60 px-2 py-0.5 rounded-full border border-gray-200/50 dark:border-gray-700/50">
            {completedCount}/{tasks.length}
          </span>
          <button
            onClick={onOpenQuickAdd}
            className={`p-1 rounded-lg bg-white/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:${quadrant.accentText} transition-colors border border-gray-200/60 dark:border-gray-700`}
            title={`Add task to ${quadrant.name}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Guidance Cue */}
      <div className="py-2 text-[11px] text-gray-500 dark:text-gray-400 italic">
        Action: <strong className={quadrant.accentText}>{quadrant.action}</strong> — {quadrant.guidance}
      </div>

      {/* Task List Container */}
      <div className="flex-1 space-y-2 py-2 overflow-y-auto max-h-[320px] pr-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 text-center text-gray-400">
            <p className="text-xs italic">No tasks in this quadrant</p>
            <button
              onClick={onOpenQuickAdd}
              className={`mt-2 text-[11px] font-semibold ${quadrant.accentText} hover:underline`}
            >
              + Add a task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`group relative rounded-xl p-3 border transition-all ${
                task.completed
                  ? "bg-white/40 dark:bg-gray-900/30 border-gray-200/40 dark:border-gray-800/40 opacity-70"
                  : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Complete Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleComplete(task.id)}
                  className="pt-0.5 text-gray-400 hover:text-emerald-500 shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs font-semibold break-words ${
                        task.completed
                          ? "line-through text-gray-400 dark:text-gray-500"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {/* Metadata Chips: Due date, Category, Subtasks */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {task.category && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {task.category.toUpperCase()}
                      </span>
                    )}

                    {task.dueDate && (
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {task.dueDate}
                      </span>
                    )}

                    {task.subtasks && task.subtasks.length > 0 && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <CheckSquare className="w-2.5 h-2.5" />
                        {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                      </span>
                    )}

                    {task.estimatedPomodoros > 0 && (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                        {task.estimatedPomodoros}🍅
                      </span>
                    )}
                  </div>

                  {task.notes && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic">
                      {task.notes}
                    </p>
                  )}
                </div>

                {/* Quick Actions (Move & Edit & Delete) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Move Dropdown */}
                  <div className="relative">
                    <select
                      value={task.quadrant}
                      onChange={(e) => onMoveTask(task.id, e.target.value)}
                      className="text-[10px] font-bold py-0.5 px-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer"
                      title="Move to another quadrant"
                    >
                      {allQuadrants.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    title="Edit task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 rounded text-gray-400 hover:text-rose-500"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Quick Add Input */}
      <div className="pt-2 border-t border-gray-200/50 dark:border-gray-800/50">
        <button
          onClick={onOpenQuickAdd}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-400 text-xs font-semibold text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add task to {quadrant.name}</span>
        </button>
      </div>
    </div>
  );
}
