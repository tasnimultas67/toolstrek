// app/(main)/tools-compo/tools/PomodoroTimer.jsx
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import ToolPageShell from "../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import toolsData from "@/lib/toolsData.json";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
  Sliders,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Maximize2,
  Minimize2,
  Settings2,
  BarChart3,
  ListTodo,
  Headphones,
  Flame,
  Clock,
  Calendar,
  Share2,
  Copy,
  Download,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  ShieldCheck,
  Coffee,
  Brain,
  Layers,
  ArrowRight,
  Edit3,
  Bookmark,
  CheckSquare,
  Square,
  TrendingUp,
  FileSpreadsheet,
  FileJson,
  Keyboard,
  Award,
  RefreshCw,
  Sun,
  Moon
} from "lucide-react";
import { toast } from "sonner";
import {
  TIMER_MODES,
  DEFAULT_SETTINGS,
  PRESETS,
  THEMES,
  TASK_CATEGORIES,
  INITIAL_TASKS,
  MOTIVATIONAL_QUOTES,
  soundEngine,
  POMODORO_GUIDE_STEPS,
  SCIENTIFIC_BENEFITS,
  POMODORO_FAQS
} from "./pomodoro-timer/pomodoroData";

const STORAGE_KEY = "toolstrek_pomodoro_state_v1";

export default function PomodoroTimer() {
  // ─── Settings & Preferences State ───
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // ─── Timer State ───
  const [mode, setMode] = useState(TIMER_MODES.FOCUS);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0); // overall completed focus sessions
  const [cycleIndex, setCycleIndex] = useState(1); // 1 to longBreakInterval

  // ─── Task Management State ───
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTaskId, setActiveTaskId] = useState("task-1");
  const [taskFilter, setTaskFilter] = useState("all"); // all | active | completed
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("work");
  const [newTaskEst, setNewTaskEst] = useState(4);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // ─── Analytics & History State ───
  const [sessionHistory, setSessionHistory] = useState([]);
  const [streakDays, setStreakDays] = useState(1);
  const [dailyFocusMinutes, setDailyFocusMinutes] = useState(25);

  // ─── UI & View State ───
  const [activeTab, setActiveTab] = useState("timer"); // timer | tasks | sounds | analytics | settings
  const [isZenMode, setIsZenMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);

  // ─── Drift-Free Interval Tracking Refs ───
  const timerEndTimestampRef = useRef(null);
  const intervalRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const zenContainerRef = useRef(null);
  // Latest timeLeft, kept outside deps so the timer engine interval isn't
  // re-created on every tick.
  const timeLeftRef = useRef(timeLeft);

  // ─── Current Theme Lookup ───
  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === settings.themeId) || THEMES[0];
  }, [settings.themeId]);

  // ─── Active Task Lookup ───
  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [tasks, activeTaskId]);

  // ─── Total duration for current mode in seconds ───
  const totalModeDuration = useMemo(() => {
    const mins = settings.durations[mode] || 25;
    return mins * 60;
  }, [mode, settings.durations]);

  // ─── Progress Percentage ───
  const progressPercent = useMemo(() => {
    if (totalModeDuration <= 0) return 0;
    const elapsed = totalModeDuration - timeLeft;
    return Math.min(100, Math.max(0, (elapsed / totalModeDuration) * 100));
  }, [totalModeDuration, timeLeft]);

  // ─── LocalStorage Persistence ───
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration of persisted Pomodoro state from localStorage; must run post-mount to avoid an SSR hydration mismatch
        if (parsed.settings) setSettings((prev) => ({ ...prev, ...parsed.settings }));
        if (parsed.tasks && Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
        if (parsed.activeTaskId) setActiveTaskId(parsed.activeTaskId);
        if (parsed.sessionHistory && Array.isArray(parsed.sessionHistory)) setSessionHistory(parsed.sessionHistory);
        if (parsed.completedCycles !== undefined) setCompletedCycles(parsed.completedCycles);
        if (parsed.cycleIndex !== undefined) setCycleIndex(parsed.cycleIndex);
        if (parsed.streakDays !== undefined) setStreakDays(parsed.streakDays);
        if (parsed.dailyFocusMinutes !== undefined) setDailyFocusMinutes(parsed.dailyFocusMinutes);
      }
    } catch (e) {
      console.warn("Could not load saved Pomodoro state", e);
    }
  }, []);

  const saveToStorage = useCallback(
    (overrides = {}) => {
      try {
        const data = {
          settings,
          tasks,
          activeTaskId,
          sessionHistory,
          completedCycles,
          cycleIndex,
          streakDays,
          dailyFocusMinutes,
          ...overrides
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn("Could not save Pomodoro state", e);
      }
    },
    [settings, tasks, activeTaskId, sessionHistory, completedCycles, cycleIndex, streakDays, dailyFocusMinutes]
  );

  // ─── Confetti Burst Animation ───
  const triggerConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#f43f5e", "#10b981", "#6366f1", "#f59e0b", "#8b5cf6", "#38bdf8"];
    const particles = Array.from({ length: 60 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1
    }));

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.vRot;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    render();
  }, []);

  // ─── Request Desktop Notification Permission ───
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          toast.success("Desktop notifications enabled!");
        }
      }
    }
  }, []);

  // ─── Switch Modes ───
  const switchMode = useCallback(
    (newMode, autoStart = false) => {
      setIsRunning(false);
      clearInterval(intervalRef.current);
      setMode(newMode);
      const newDurationSec = (settings.durations[newMode] || 25) * 60;
      setTimeLeft(newDurationSec);

      // Stop ambient sound if switching out of focus and user requested ambient only during focus
      if (settings.ambientOnlyDuringFocus && newMode !== TIMER_MODES.FOCUS) {
        soundEngine.stopAmbient();
      }

      if (autoStart) {
        setTimeout(() => {
          setIsRunning(true);
        }, 150);
      }
    },
    [settings.durations, settings.ambientOnlyDuringFocus]
  );

  // ─── Handle Session Completion ───
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);

    // 1. Play alert sound
    if (!isMuted && settings.alarmSound !== "mute") {
      soundEngine.playAlarm(settings.alarmSound, settings.alarmVolume);
    }

    // 2. Browser Desktop Notification
    if (settings.desktopNotifications && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        const title =
          mode === TIMER_MODES.FOCUS
            ? "🍅 Focus Session Complete!"
            : "☕ Break Finished! Ready to focus?";
        const body =
          mode === TIMER_MODES.FOCUS
            ? "Fantastic work! Step away, stretch, and recharge."
            : "Break is over. Let's get into the flow state!";
        try {
          new Notification(title, {
            body,
            icon: "/favicon.ico"
          });
        } catch (_) {}
      }
    }

    // 3. Update Session History & Analytics
    const now = new Date();
    const durationMins = settings.durations[mode] || 25;
    const newLogItem = {
      id: `log-${Date.now()}`,
      mode,
      durationMins,
      timestamp: now.toISOString(),
      taskTitle: activeTask ? activeTask.title : "Unassigned Sprint"
    };

    setSessionHistory((prev) => [newLogItem, ...prev.slice(0, 99)]);

    if (mode === TIMER_MODES.FOCUS) {
      triggerConfetti();
      toast.success("Focus Pomodoro Completed! Well done!", {
        description: `Logged +${durationMins} minutes of pure concentration.`
      });

      const nextCycles = completedCycles + 1;
      setCompletedCycles(nextCycles);
      setDailyFocusMinutes((prev) => prev + durationMins);

      // 4. Increment Active Task Pomodoros
      if (activeTaskId) {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === activeTaskId) {
              const updatedCompleted = (t.completedPomodoros || 0) + 1;
              const isGoalReached = updatedCompleted >= t.estimatedPomodoros;
              if (isGoalReached && !t.isCompleted) {
                toast.success(`🎉 Target reached for "${t.title}"!`);
              }
              return {
                ...t,
                completedPomodoros: updatedCompleted
              };
            }
            return t;
          })
        );
      }

      // Check if long break is due
      const isLongBreak = cycleIndex >= settings.longBreakInterval;
      if (isLongBreak) {
        setCycleIndex(1);
        switchMode(TIMER_MODES.LONG_BREAK, settings.autoStartBreaks);
      } else {
        setCycleIndex((prev) => prev + 1);
        switchMode(TIMER_MODES.SHORT_BREAK, settings.autoStartBreaks);
      }

      saveToStorage({
        completedCycles: nextCycles,
        dailyFocusMinutes: dailyFocusMinutes + durationMins
      });
    } else {
      // Break Finished
      toast.info("Break complete! Time to crush your next objective.");
      switchMode(TIMER_MODES.FOCUS, settings.autoStartPomodoros);
    }
  }, [
    mode,
    isMuted,
    settings,
    activeTask,
    activeTaskId,
    completedCycles,
    cycleIndex,
    dailyFocusMinutes,
    switchMode,
    triggerConfetti,
    saveToStorage
  ]);

  // Keep the latest timeLeft readable by the timer engine without adding it to deps
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // ─── Timer Action Handlers ───
  const handleReset = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    soundEngine.stopAmbient();
    const newSec = (settings.durations[mode] || 25) * 60;
    setTimeLeft(newSec);
    toast.info("Timer reset to standard duration.");
  }, [settings.durations, mode]);

  const handleSkip = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    soundEngine.stopAmbient();

    if (mode === TIMER_MODES.FOCUS) {
      const isLong = cycleIndex >= settings.longBreakInterval;
      if (isLong) {
        setCycleIndex(1);
        switchMode(TIMER_MODES.LONG_BREAK);
      } else {
        setCycleIndex((prev) => prev + 1);
        switchMode(TIMER_MODES.SHORT_BREAK);
      }
    } else {
      switchMode(TIMER_MODES.FOCUS);
    }
    toast.info("Skipped to next cycle phase.");
  }, [mode, cycleIndex, settings.longBreakInterval, switchMode]);

  // ─── High-Precision Timer Engine (Drift-Resistant with Date.now()) ───
  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      timerEndTimestampRef.current = null;
      return;
    }

    // Set target finish timestamp
    const now = Date.now();
    timerEndTimestampRef.current = now + timeLeftRef.current * 1000;

    // Start ticking sound if configured
    if (!isMuted && settings.tickingSound !== "none") {
      soundEngine.playTick(settings.tickingSound, settings.tickingVolume);
    }

    // Start ambient focus sound if enabled
    if (!isMuted && settings.ambientSound !== "none") {
      if (!settings.ambientOnlyDuringFocus || mode === TIMER_MODES.FOCUS) {
        soundEngine.startAmbient(settings.ambientSound, settings.ambientVolume);
      }
    }

    intervalRef.current = setInterval(() => {
      const current = Date.now();
      const remainingMs = timerEndTimestampRef.current - current;
      const remainingSec = Math.ceil(remainingMs / 1000);

      if (remainingSec <= 0) {
        setTimeLeft(0);
        handleSessionComplete();
      } else {
        setTimeLeft(remainingSec);

        // Optional clock tick sound
        if (!isMuted && settings.tickingSound !== "none") {
          soundEngine.playTick(settings.tickingSound, settings.tickingVolume);
        }
      }
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isRunning, handleSessionComplete, isMuted, settings.tickingSound, settings.tickingVolume, settings.ambientSound, settings.ambientVolume, settings.ambientOnlyDuringFocus, mode]);

  // Stop ambient sound when timer stops
  useEffect(() => {
    if (!isRunning) {
      soundEngine.stopAmbient();
    }
  }, [isRunning]);

  // ─── Dynamic Tab Title Live Countdown ───
  useEffect(() => {
    if (typeof document === "undefined") return;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    const iconPrefix =
      mode === TIMER_MODES.FOCUS ? "🍅" : mode === TIMER_MODES.SHORT_BREAK ? "☕" : "🌿";
    const modeLabel =
      mode === TIMER_MODES.FOCUS
        ? activeTask
          ? activeTask.title.slice(0, 18)
          : "Focus"
        : mode === TIMER_MODES.SHORT_BREAK
        ? "Short Break"
        : "Long Break";

    if (isRunning) {
      document.title = `(${formatted}) ${iconPrefix} ${modeLabel} • ToolsTrek Pomodoro`;
    } else {
      document.title = "Pomodoro Timer — Productivity & Deep Work Studio | ToolsTrek";
    }
  }, [timeLeft, isRunning, mode, activeTask]);

  // ─── Keyboard Shortcuts Listener ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      } else if (e.code === "KeyS" && e.altKey) {
        e.preventDefault();
        handleSkip();
      } else if (e.code === "KeyR" && e.altKey) {
        e.preventDefault();
        handleReset();
      } else if (e.code === "KeyF" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
      } else if (e.code === "KeyM") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleReset, handleSkip]);

  // ─── Timer Action Handlers ───
  const handleTogglePlay = () => {
    if (!isRunning) {
      requestNotificationPermission();
    }
    setIsRunning((prev) => !prev);
  };

  const handleAddMinutes = (extraMinutes) => {
    setTimeLeft((prev) => prev + extraMinutes * 60);
    if (timerEndTimestampRef.current) {
      timerEndTimestampRef.current += extraMinutes * 60 * 1000;
    }
    toast.success(`Added +${extraMinutes} minute${extraMinutes > 1 ? "s" : ""} to timer.`);
  };

  const handleApplyPreset = (preset) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        durations: {
          [TIMER_MODES.FOCUS]: preset.focus,
          [TIMER_MODES.SHORT_BREAK]: preset.shortBreak,
          [TIMER_MODES.LONG_BREAK]: preset.longBreak
        },
        longBreakInterval: preset.interval
      };
      saveToStorage({ settings: updated });
      return updated;
    });

    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(preset.focus * 60);
    setMode(TIMER_MODES.FOCUS);
    toast.success(`Applied "${preset.name}" preset (${preset.focus}/${preset.shortBreak}m).`);
  };

  // ─── Task Management Handlers ───
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      estimatedPomodoros: Math.max(1, Number(newTaskEst) || 1),
      completedPomodoros: 0,
      isCompleted: false,
      notes: ""
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    if (!activeTaskId) setActiveTaskId(newTask.id);
    setNewTaskTitle("");
    setIsAddingTask(false);
    saveToStorage({ tasks: updatedTasks });
    toast.success("Task added to sprint queue!");
  };

  const handleToggleTaskCompleted = (taskId) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.isCompleted;
          if (nextState) {
            triggerConfetti();
            toast.success(`Completed: "${t.title}"!`);
          }
          return { ...t, isCompleted: nextState };
        }
        return t;
      });
      saveToStorage({ tasks: updated });
      return updated;
    });
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      if (activeTaskId === taskId) {
        setActiveTaskId(updated.length > 0 ? updated[0].id : null);
      }
      saveToStorage({ tasks: updated });
      return updated;
    });
    toast.info("Task removed.");
  };

  const handleClearCompletedTasks = () => {
    setTasks((prev) => {
      const updated = prev.filter((t) => !t.isCompleted);
      saveToStorage({ tasks: updated });
      return updated;
    });
    toast.success("Cleared all completed tasks.");
  };

  // ─── Analytics Export Handlers ───
  const handleExportCSV = () => {
    if (sessionHistory.length === 0) {
      toast.error("No session history recorded yet.");
      return;
    }

    const headers = "Session ID,Phase,Duration (Minutes),Timestamp,Task Title\n";
    const rows = sessionHistory
      .map(
        (s) =>
          `"${s.id}","${s.mode}",${s.durationMins},"${s.timestamp}","${(s.taskTitle || "").replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `toolstrek_pomodoro_sessions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported session logs to CSV.");
  };

  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      completedPomodoros: completedCycles,
      dailyFocusMinutes,
      streakDays,
      tasks,
      sessionHistory
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `toolstrek_pomodoro_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported complete Pomodoro state as JSON.");
  };

  // ─── Format Time Helper ───
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ─── Filtered Tasks List ───
  const filteredTasks = useMemo(() => {
    if (taskFilter === "active") return tasks.filter((t) => !t.isCompleted);
    if (taskFilter === "completed") return tasks.filter((t) => t.isCompleted);
    return tasks;
  }, [tasks, taskFilter]);

  // ─── Motivational Quote Rotator ───
  const nextQuote = () => {
    setCurrentQuoteIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  // ─── Share URL ───
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Tool link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // ─── SVG Progress Ring Dimensions ───
  const strokeWidth = 8;
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <ToolPageShell widthClassName="max-w-6xl">
      {/* Hidden Confetti Canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* ─── Top Header & Breadcrumbs ─── */}
      <header className="mb-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3"
        >
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <a href="/tools" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Tools
          </a>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Pomodoro Timer</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Timer className="w-3.5 h-3.5" />
                Productivity & Focus
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Brain className="w-3.5 h-3.5" />
                Timeboxing & Flow State
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                100% Client-Side Private
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Pomodoro Timer & Deep Work Studio
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
              Eliminate distractions, conquer procrastination, and enter peak flow with high-precision
              timeboxing, synthesized ambient focus audio, integrated task estimation, and daily streak analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <FavoriteButton
              tool={
                toolsData.find((t) => t.link === "/tools/pomodoro-timer") || {
                  title: "Pomodoro Timer",
                  link: "/tools/pomodoro-timer",
                  description: "Professional Pomodoro focus timer with ambient soundscapes and task tracking.",
                  icon: "Timer"
                }
              }
            />
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-xs"
              title="Share Pomodoro Timer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copied" : "Share"}</span>
            </button>
            <button
              onClick={() => setIsZenMode(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
              title="Enter Fullscreen Zen Mode (HotKey: F)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Zen Mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Productivity Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── LEFT COLUMN: Timer Display & Controls (7 Cols) ─── */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl relative overflow-hidden transition-all duration-300">
            {/* Ambient background glow */}
            <div
              className={`absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none bg-linear-to-br ${currentTheme.gradient}`}
            />

            {/* Mode Switcher Pills */}
            <div className="flex items-center justify-center gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-2xl max-w-md mx-auto mb-6 border border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={() => switchMode(TIMER_MODES.FOCUS)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  mode === TIMER_MODES.FOCUS
                    ? `${currentTheme.btnPrimary} shadow-sm`
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🍅</span>
                <span>Focus</span>
                <span className="text-[11px] opacity-75 font-mono">({settings.durations.focus}m)</span>
              </button>

              <button
                onClick={() => switchMode(TIMER_MODES.SHORT_BREAK)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  mode === TIMER_MODES.SHORT_BREAK
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-500/25"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>☕</span>
                <span>Short Break</span>
                <span className="text-[11px] opacity-75 font-mono">({settings.durations.shortBreak}m)</span>
              </button>

              <button
                onClick={() => switchMode(TIMER_MODES.LONG_BREAK)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  mode === TIMER_MODES.LONG_BREAK
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🌿</span>
                <span>Long Break</span>
                <span className="text-[11px] opacity-75 font-mono">({settings.durations.longBreak}m)</span>
              </button>
            </div>

            {/* Circular Progress & Countdown Center */}
            <div className="relative flex flex-col items-center justify-center my-4">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
                  {/* Background Track */}
                  <circle
                    cx="150"
                    cy="150"
                    r={radius}
                    className="stroke-gray-100 dark:stroke-gray-800/80"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Animated Progress Ring */}
                  <circle
                    cx="150"
                    cy="150"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth + 1}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-linear ${
                      mode === TIMER_MODES.FOCUS
                        ? currentTheme.ringClass
                        : mode === TIMER_MODES.SHORT_BREAK
                        ? "text-teal-500"
                        : "text-indigo-500"
                    }`}
                  />
                </svg>

                {/* Inside Ring Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  {/* Cycle Dot Counter */}
                  <div className="flex items-center gap-1.5 mb-2 bg-gray-100/80 dark:bg-gray-800/80 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    <span>Round {cycleIndex} of {settings.longBreakInterval}</span>
                    <div className="flex items-center gap-1 ml-1">
                      {Array.from({ length: settings.longBreakInterval }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx < cycleIndex
                              ? mode === TIMER_MODES.FOCUS
                                ? "bg-rose-500"
                                : "bg-teal-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Big Digital Countdown */}
                  <div
                    className={`text-5xl sm:text-6xl font-black tracking-tight font-mono select-none drop-shadow-sm ${
                      mode === TIMER_MODES.FOCUS
                        ? "text-gray-900 dark:text-white"
                        : mode === TIMER_MODES.SHORT_BREAK
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </div>

                  {/* Active Task Name Banner */}
                  <div className="mt-2 max-w-[200px] sm:max-w-[230px] truncate text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    <TargetIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {activeTask ? activeTask.title : "No task selected (Free Flow)"}
                    </span>
                  </div>

                  {/* Progress percentage pill */}
                  <span className="mt-1 text-[11px] font-mono text-gray-400 dark:text-gray-500">
                    {Math.round(progressPercent)}% elapsed
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Extend Buttons (+1m / +5m) */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => handleAddMinutes(1)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Add 1 minute"
              >
                +1 min
              </button>
              <button
                onClick={() => handleAddMinutes(5)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Add 5 minutes"
              >
                +5 min
              </button>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  isMuted
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title={isMuted ? "Unmute audio alerts" : "Mute audio alerts"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Primary Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-all active:scale-95"
                title="Reset Timer (Alt+R)"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={handleTogglePlay}
                className={`px-8 sm:px-10 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg transition-all duration-200 active:scale-95 ${
                  mode === TIMER_MODES.FOCUS
                    ? `${currentTheme.btnPrimary} ${currentTheme.glow}`
                    : mode === TIMER_MODES.SHORT_BREAK
                    ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/25"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-6 h-6 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current" />
                    <span>Start Focus</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSkip}
                className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-all active:scale-95"
                title="Skip to next phase (Alt+S)"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Motivational Quote Banner */}
            {settings.showMotivationalQuotes && (
              <div
                onClick={nextQuote}
                className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 cursor-pointer group"
                title="Click for another quote"
              >
                <p className="italic text-center flex-1 transition-colors group-hover:text-gray-800 dark:group-hover:text-gray-200">
                  &ldquo;{MOTIVATIONAL_QUOTES[currentQuoteIdx].quote}&rdquo; —{" "}
                  <span className="font-semibold not-italic">
                    {MOTIVATIONAL_QUOTES[currentQuoteIdx].author}
                  </span>
                </p>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform shrink-0 ml-2" />
              </div>
            )}
          </div>

          {/* Preset Buttons Row */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Proven Workflow Presets
              </span>
              <span className="text-[11px] text-gray-400">Click to load</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 hover:border-rose-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-rose-500 transition-colors">
                      {preset.focus}/{preset.shortBreak}m
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                    {preset.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── RIGHT COLUMN: Integrated Tabs (Tasks, Sounds, Analytics, Settings) (5 Cols) ─── */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          {/* Navigation Sub-Tabs Header */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === "tasks"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-rose-500" />
              <span>Tasks</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {tasks.filter((t) => !t.isCompleted).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sounds")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === "sounds"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-indigo-500" />
              <span>Audio</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === "analytics"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Stats</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Customize</span>
            </button>
          </div>

          {/* ─── TAB 1: Task Management ─── */}
          {activeTab === "tasks" && (
            <div className="p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>Active Sprint Tasks</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select a task to link your pomodoro session.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Done</option>
                  </select>
                  <button
                    onClick={() => setIsAddingTask((prev) => !prev)}
                    className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs flex items-center gap-1 transition-colors"
                    title="Add task"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Add Task Collapsible Form */}
              {isAddingTask && (
                <form
                  onSubmit={handleAddTask}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3 animate-fadeIn"
                >
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What are you working on?"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value)}
                        className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300"
                      >
                        {TASK_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>Est:</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={newTaskEst}
                          onChange={(e) => setNewTaskEst(e.target.value)}
                          className="w-12 px-1.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center font-mono text-xs"
                        />
                        <span>🍅</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setIsAddingTask(false)}
                        className="px-2.5 py-1 rounded-lg text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold"
                      >
                        Save Task
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Task Items List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    No tasks found. Click &apos;+&apos; to schedule your first sprint!
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isSelected = activeTaskId === task.id;
                    const catObj = TASK_CATEGORIES.find((c) => c.id === task.category);

                    return (
                      <div
                        key={task.id}
                        onClick={() => setActiveTaskId(task.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                          isSelected
                            ? "border-rose-500/50 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs"
                            : "border-gray-200 dark:border-gray-800/80 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTaskCompleted(task.id);
                              }}
                              className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                                task.isCompleted
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-gray-300 dark:border-gray-600 hover:border-rose-500"
                              }`}
                            >
                              {task.isCompleted && <Check className="w-3 h-3 stroke-3" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs font-semibold ${
                                    task.isCompleted
                                      ? "line-through text-gray-400 dark:text-gray-500"
                                      : "text-gray-900 dark:text-gray-100"
                                  }`}
                                >
                                  {task.title}
                                </span>
                                {catObj && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-medium border ${catObj.bg}`}
                                  >
                                    {catObj.name}
                                  </span>
                                )}
                              </div>

                              {/* Pomodoro count progress badge */}
                              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                                <span className="font-mono">
                                  🍅 {task.completedPomodoros || 0} / {task.estimatedPomodoros}
                                </span>
                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-rose-500 rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        ((task.completedPomodoros || 0) / task.estimatedPomodoros) * 100
                                      )}%`
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {tasks.some((t) => t.isCompleted) && (
                <button
                  onClick={handleClearCompletedTasks}
                  className="w-full text-center text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors pt-2"
                >
                  Clear completed tasks
                </button>
              )}
            </div>
          )}

          {/* ─── TAB 2: Ambient Soundscapes & Alert Chimes ─── */}
          {activeTab === "sounds" && (
            <div className="p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg space-y-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-indigo-500" />
                  <span>Synthesized Ambient Focus Audio</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Client-side Web Audio API sound generator. 100% offline, zero lag.
                </p>
              </div>

              {/* Ambient Focus Generator Selector */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "none", name: "None / Silent", desc: "No background audio" },
                    { id: "brownNoise", name: "Brown Noise", desc: "Deep rumble focus mask" },
                    { id: "pinkNoise", name: "Pink Noise", desc: "Balanced soothing slope" },
                    { id: "whiteNoise", name: "White Noise", desc: "Crisp steady static" },
                    { id: "rain", name: "Gentle Rain", desc: "Synthesized raindrops" },
                    { id: "gamma40Hz", name: "40Hz Gamma Tone", desc: "Cognitive flow frequency" }
                  ].map((amb) => {
                    const isSelected = settings.ambientSound === amb.id;
                    return (
                      <button
                        key={amb.id}
                        onClick={() => {
                          setSettings((prev) => {
                            const updated = { ...prev, ambientSound: amb.id };
                            saveToStorage({ settings: updated });
                            return updated;
                          });
                          if (isRunning) {
                            soundEngine.startAmbient(amb.id, settings.ambientVolume);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200"
                            : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">{amb.name}</div>
                        <div className="text-[10px] opacity-75">{amb.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Ambient Volume Slider */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Ambient Volume: {Math.round(settings.ambientVolume * 100)}%</span>
                    <button
                      onClick={() => {
                        soundEngine.startAmbient(settings.ambientSound, settings.ambientVolume);
                        setTimeout(() => soundEngine.stopAmbient(), 2500);
                        toast.info("Playing 2.5s sample...");
                      }}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Sample Sound
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={settings.ambientVolume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      setSettings((prev) => {
                        const updated = { ...prev, ambientVolume: vol };
                        saveToStorage({ settings: updated });
                        return updated;
                      });
                      if (isRunning) soundEngine.startAmbient(settings.ambientSound, vol);
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Alert Chime Settings */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Session Completion Alarm
                    </h4>
                    <p className="text-[11px] text-gray-400">Chime sounded when timer reaches 00:00</p>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playAlarm(settings.alarmSound, settings.alarmVolume);
                      toast.info("Testing alarm chime...");
                    }}
                    className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                  >
                    Test Alarm
                  </button>
                </div>

                <select
                  value={settings.alarmSound}
                  onChange={(e) => {
                    const sound = e.target.value;
                    setSettings((prev) => {
                      const updated = { ...prev, alarmSound: sound };
                      saveToStorage({ settings: updated });
                      return updated;
                    });
                    soundEngine.playAlarm(sound, settings.alarmVolume);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white"
                >
                  <option value="zenBowl">Zen Tibetan Singing Bowl (Harmonic)</option>
                  <option value="bell">Digital Modern Bell</option>
                  <option value="marimba">Melodic Marimba (3-Tone)</option>
                  <option value="digital">Digital Double Beep</option>
                  <option value="chime">Celestial Harp Chime</option>
                  <option value="mechanical">Twin-Bell Mechanical Alarm</option>
                  <option value="mute">Mute / Silent Pulse Only</option>
                </select>
              </div>

              {/* Ticking Sound */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Countdown Ticking:</span>
                  <select
                    value={settings.tickingSound}
                    onChange={(e) => {
                      const tick = e.target.value;
                      setSettings((prev) => {
                        const updated = { ...prev, tickingSound: tick };
                        saveToStorage({ settings: updated });
                        return updated;
                      });
                      if (tick !== "none") soundEngine.playTick(tick, settings.tickingVolume);
                    }}
                    className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300"
                  >
                    <option value="none">Off (Silent)</option>
                    <option value="soft">Soft Sine</option>
                    <option value="classic">Classic Quartz</option>
                    <option value="woodblock">Woodblock Metronome</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 3: Productivity Analytics & Streak Tracker ─── */}
          {activeTab === "analytics" && (
            <div className="p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    <span>Productivity Analytics</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Track your daily focus metrics and completed sprints.
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleExportCSV}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs transition-colors"
                    title="Export logs to CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs transition-colors"
                    title="Export backup to JSON"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Metric Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-500/20 text-center">
                  <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Pomodoros</span>
                  <div className="text-xl font-bold text-rose-700 dark:text-rose-300 font-mono mt-0.5">
                    {completedCycles} 🍅
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-500/20 text-center">
                  <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">Focused</span>
                  <div className="text-xl font-bold text-teal-700 dark:text-teal-300 font-mono mt-0.5">
                    {Math.floor(dailyFocusMinutes / 60)}h {dailyFocusMinutes % 60}m
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 text-center">
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Daily Streak</span>
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-300 font-mono mt-0.5 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{streakDays}d</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/20 text-center">
                  <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">Done Tasks</span>
                  <div className="text-xl font-bold text-purple-700 dark:text-purple-300 font-mono mt-0.5">
                    {tasks.filter((t) => t.isCompleted).length}
                  </div>
                </div>
              </div>

              {/* Daily Target Progress Bar */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Daily Goal: {completedCycles} / {settings.targetDailyPomodoros} Pomodoros
                  </span>
                  <span className="font-mono text-gray-500">
                    {Math.round((completedCycles / settings.targetDailyPomodoros) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-rose-500 to-amber-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (completedCycles / settings.targetDailyPomodoros) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Recent Sessions List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Recent Session Log
                </span>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {sessionHistory.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs">
                      Complete a focus session to record your first log.
                    </div>
                  ) : (
                    sessionHistory.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{log.mode === TIMER_MODES.FOCUS ? "🍅" : "☕"}</span>
                          <span className="truncate font-medium text-gray-800 dark:text-gray-200">
                            {log.taskTitle}
                          </span>
                        </div>
                        <div className="text-right shrink-0 font-mono text-[11px] text-gray-400">
                          +{log.durationMins}m • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 4: Customization & Advance Settings ─── */}
          {activeTab === "settings" && (
            <div className="p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-amber-500" />
                  <span>Timer Preferences & Automation</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tailor durations, auto-switches, themes, and notifications.
                </p>
              </div>

              {/* Duration Customization */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                    Focus (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={settings.durations.focus}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 25);
                      setSettings((prev) => {
                        const updated = {
                          ...prev,
                          durations: { ...prev.durations, focus: val }
                        };
                        saveToStorage({ settings: updated });
                        return updated;
                      });
                      if (mode === TIMER_MODES.FOCUS && !isRunning) setTimeLeft(val * 60);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                    Short Break (m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.durations.shortBreak}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 5);
                      setSettings((prev) => {
                        const updated = {
                          ...prev,
                          durations: { ...prev.durations, shortBreak: val }
                        };
                        saveToStorage({ settings: updated });
                        return updated;
                      });
                      if (mode === TIMER_MODES.SHORT_BREAK && !isRunning) setTimeLeft(val * 60);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                    Long Break (m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={settings.durations.longBreak}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 15);
                      setSettings((prev) => {
                        const updated = {
                          ...prev,
                          durations: { ...prev.durations, longBreak: val }
                        };
                        saveToStorage({ settings: updated });
                        return updated;
                      });
                      if (mode === TIMER_MODES.LONG_BREAK && !isRunning) setTimeLeft(val * 60);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Long Break Interval */}
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Long Break Every:
                </span>
                <select
                  value={settings.longBreakInterval}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 4;
                    setSettings((prev) => {
                      const updated = { ...prev, longBreakInterval: val };
                      saveToStorage({ settings: updated });
                      return updated;
                    });
                  }}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 text-xs"
                >
                  <option value={2}>2 Pomodoros</option>
                  <option value={3}>3 Pomodoros</option>
                  <option value={4}>4 Pomodoros (Standard)</option>
                  <option value={5}>5 Pomodoros</option>
                  <option value={6}>6 Pomodoros</option>
                </select>
              </div>

              {/* Automation Toggles */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2.5 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700 dark:text-gray-300">Auto-start Breaks</span>
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setSettings((prev) => {
                        const updated = { ...prev, autoStartBreaks: val };
                        saveToStorage({ settings: updated });
                        return updated;
                      });
                    }}
                    className="accent-rose-600 rounded-sm w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700 dark:text-gray-300">Auto-start Pomodoros</span>
                  <input
                    type="checkbox"
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setSettings((prev) => {
                        const updated = { ...prev, autoStartPomodoros: val };
                        saveToStorage({ settings: updated });
                        return updated;
                      });
                    }}
                    className="accent-rose-600 rounded-sm w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700 dark:text-gray-300">Desktop Web Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.desktopNotifications}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setSettings((prev) => {
                        const updated = { ...prev, desktopNotifications: val };
                        saveToStorage({ settings: updated });
                        return updated;
                      });
                      if (val) requestNotificationPermission();
                    }}
                    className="accent-rose-600 rounded-sm w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              {/* Color Theme Selector */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Visual Palette
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => {
                        setSettings((prev) => {
                          const updated = { ...prev, themeId: th.id };
                          saveToStorage({ settings: updated });
                          return updated;
                        });
                        toast.success(`Theme set to ${th.name}`);
                      }}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                        settings.themeId === th.id
                          ? "border-gray-900 dark:border-white ring-2 ring-rose-500/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: th.color }} />
                      <span className="truncate font-medium">{th.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ─── Zen / Fullscreen Overlay ─── */}
      {isZenMode && (
        <div
          ref={zenContainerRef}
          className="fixed inset-0 z-50 bg-gray-950 text-white flex flex-col items-center justify-between p-6 sm:p-12 animate-fadeIn"
        >
          {/* Zen Top Bar */}
          <div className="w-full flex items-center justify-between max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>🍅</span>
                <span>ToolsTrek Zen</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300">
                Focus Mode
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsZenMode(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit Zen (Esc/F)</span>
              </button>
            </div>
          </div>

          {/* Zen Center Display */}
          <div className="flex flex-col items-center justify-center my-auto text-center space-y-6">
            <div className="text-xs tracking-widest uppercase font-semibold text-rose-400">
              {mode === TIMER_MODES.FOCUS
                ? "Deep Work Interval"
                : mode === TIMER_MODES.SHORT_BREAK
                ? "Restorative Short Break"
                : "Mind Reboot Long Break"}
            </div>

            <div className="text-7xl sm:text-9xl font-black font-mono tracking-tight select-none drop-shadow-2xl text-white">
              {formatTime(timeLeft)}
            </div>

            {activeTask && (
              <div className="max-w-md mx-auto text-sm sm:text-base font-medium text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                Active Objective: <span className="text-white font-bold">{activeTask.title}</span>
              </div>
            )}

            {/* Zen Controls */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleReset}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                title="Reset"
              >
                <RotateCcw className="w-6 h-6" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="px-12 py-5 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xl shadow-2xl shadow-rose-600/40 transition-all active:scale-95 flex items-center gap-3"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-7 h-7 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-7 h-7 fill-current" />
                    <span>Start</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSkip}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                title="Skip"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Zen Footer Shortcuts Note */}
          <div className="text-xs text-gray-400 flex items-center gap-4 font-mono">
            <span>[Space] Start / Pause</span>
            <span>•</span>
            <span>[F] Toggle Zen</span>
            <span>•</span>
            <span>[M] Mute</span>
          </div>
        </div>
      )}

      {/* ─── EDUCATIONAL GUIDE: The Science of Pomodoro ─── */}
      <section className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-3 border border-rose-500/20">
            <Brain className="w-3.5 h-3.5" />
            <span>Mastery Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            The Science of the Pomodoro Technique
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Why breaking demanding intellectual tasks into 25-minute sprints protects executive
            decision-making, eliminates mental friction, and accelerates output.
          </p>
        </div>

        {/* 5 Core Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {POMODORO_GUIDE_STEPS.map((s) => (
            <div
              key={s.step}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black text-rose-500/80 font-mono block mb-2">
                  {s.step}
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">{s.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cognitive Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {SCIENTIFIC_BENEFITS.map((b, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-start gap-4"
            >
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold font-mono text-lg shrink-0">
                {b.metric}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {b.description}
                </p>
                <span className="inline-block mt-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  {b.metricLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Frequently Asked Questions (FAQ) Accordion ─── */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Everything you need to know about timeboxing, audio synthesis, and privacy.
            </p>
          </div>

          <div className="space-y-3">
            {POMODORO_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-gray-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ToolPageShell>
  );
}

// Icon helper
function TargetIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
