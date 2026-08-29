"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import toolsData from "@/lib/toolsData.json";
import {
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarCheck2,
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Download,
  Upload,
  Printer,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Settings2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Droplets,
  Smile,
  Meh,
  Frown,
  Zap,
  Coffee,
  Heart,
  BookOpen,
  Target,
  BarChart3,
  ListTodo,
  Columns,
  Grid,
  Filter,
  Search,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Play,
  Pause,
  RotateCw,
  Sliders,
  Share2,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Award,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Tag,
  Briefcase,
  Dumbbell,
  GraduationCap,
  Utensils,
  CheckSquare,
  ShieldCheck,
  SlidersHorizontal,
  FolderDown,
  ArrowUpDown,
  CornerDownRight,
  TrendingUp,
  Bookmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
// Audio Synthesizer & Ambient Soundscape Generator (Web Audio API)
// ─────────────────────────────────────────────────────────────
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.ambientNodes = null;
    this.currentAmbientType = null;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTap() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        300,
        this.ctx.currentTime + 0.03,
      );
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.03,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (_) {}
  }

  playCheck() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx.currentTime + idx * 0.04 + 0.15,
        );
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.04);
        osc.stop(this.ctx.currentTime + idx * 0.04 + 0.15);
      });
    } catch (_) {}
  }

  playWaterDrop() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        600,
        this.ctx.currentTime + 0.12,
      );
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.12,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (_) {}
  }

  playTimerFinish() {
    try {
      this.init();
      if (!this.ctx) return;
      const bells = [659.25, 659.25, 659.25, 880];
      bells.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx.currentTime + idx * 0.15 + 0.35,
        );
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.15);
        osc.stop(this.ctx.currentTime + idx * 0.15 + 0.35);
      });
    } catch (_) {}
  }

  playFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx.currentTime + idx * 0.08 + 0.4,
        );
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.4);
      });
    } catch (_) {}
  }

  startAmbient(type = "whitenoise", volume = 0.1) {
    try {
      this.stopAmbient();
      this.init();
      if (!this.ctx) return;

      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(
        1,
        bufferSize,
        this.ctx.sampleRate,
      );
      const output = noiseBuffer.getChannelData(0);

      if (type === "whitenoise") {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      } else if (type === "rain") {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
      } else {
        // Cafe / Lo-Fi warm low-pass
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.5;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      if (type === "rain") {
        filter.type = "lowpass";
        filter.frequency.value = 900;
      } else if (type === "cafe") {
        filter.type = "bandpass";
        filter.frequency.value = 450;
      } else {
        filter.type = "lowpass";
        filter.frequency.value = 1400;
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(0);
      this.ambientNodes = { whiteNoise, gain, filter };
      this.currentAmbientType = type;
    } catch (_) {}
  }

  stopAmbient() {
    try {
      if (this.ambientNodes && this.ambientNodes.whiteNoise) {
        this.ambientNodes.whiteNoise.stop();
        this.ambientNodes.whiteNoise.disconnect();
      }
      this.ambientNodes = null;
      this.currentAmbientType = null;
    } catch (_) {}
  }

  setAmbientVolume(vol) {
    if (this.ambientNodes && this.ambientNodes.gain && this.ctx) {
      this.ambientNodes.gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }
}

const audio = new SoundSynthesizer();

// ─────────────────────────────────────────────────────────────
// Constants, Categories & Color Schemes
// ─────────────────────────────────────────────────────────────

const BLOCK_CATEGORIES = [
  {
    id: "deepwork",
    name: "Deep Work",
    color: "#7c00fe",
    bg: "#7c00fe12",
    border: "#7c00fe30",
    icon: "Zap",
  },
  {
    id: "meetings",
    name: "Meetings & Calls",
    color: "#0284c7",
    bg: "#0284c712",
    border: "#0284c730",
    icon: "Briefcase",
  },
  {
    id: "fitness",
    name: "Fitness & Health",
    color: "#059669",
    bg: "#05966912",
    border: "#05966930",
    icon: "Dumbbell",
  },
  {
    id: "learning",
    name: "Learning & Study",
    color: "#d97706",
    bg: "#d9770612",
    border: "#d9770630",
    icon: "GraduationCap",
  },
  {
    id: "admin",
    name: "Admin & Email",
    color: "#475569",
    bg: "#47556912",
    border: "#47556930",
    icon: "CheckSquare",
  },
  {
    id: "personal",
    name: "Personal & Break",
    color: "#db2777",
    bg: "#db277712",
    border: "#db277730",
    icon: "Coffee",
  },
  {
    id: "creative",
    name: "Creative & Design",
    color: "#0891b2",
    bg: "#0891b212",
    border: "#0891b230",
    icon: "Sparkles",
  },
];

const TASK_CATEGORIES = [
  { id: "work", name: "Work", emoji: "💼" },
  { id: "personal", name: "Personal", emoji: "🧑" },
  { id: "health", name: "Health", emoji: "💪" },
  { id: "study", name: "Study", emoji: "📚" },
  { id: "finance", name: "Finance", emoji: "💰" },
  { id: "home", name: "Home", emoji: "🏡" },
];

const PRIORITIES = {
  p1: {
    id: "p1",
    label: "P1 Urgent",
    color: "#dc2626",
    bg: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40",
    badge: "Urgent",
    rank: 1,
  },
  p2: {
    id: "p2",
    label: "P2 High",
    color: "#ea580c",
    bg: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40",
    badge: "High",
    rank: 2,
  },
  p3: {
    id: "p3",
    label: "P3 Medium",
    color: "#d97706",
    bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
    badge: "Medium",
    rank: 3,
  },
  p4: {
    id: "p4",
    label: "P4 Low",
    color: "#2563eb",
    bg: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40",
    badge: "Low",
    rank: 4,
  },
};

const THEMES = {
  clean: {
    id: "clean",
    name: "Clean Studio",
    accent: "#7c00fe",
    surface:
      "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs",
    card: "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-100",
    cardSubtle:
      "bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/80",
  },
  lavender: {
    id: "lavender",
    name: "Pastel Lavender",
    accent: "#9333ea",
    surface:
      "bg-purple-50/40 dark:bg-slate-900 border-purple-200/70 dark:border-purple-900/40 text-slate-900 dark:text-purple-100 shadow-xs",
    card: "bg-white dark:bg-slate-800/60 border-purple-200/60 dark:border-purple-800/40 text-slate-800 dark:text-purple-100",
    cardSubtle: "bg-purple-50/60 dark:bg-slate-950 border-purple-200/50",
  },
  nordic: {
    id: "nordic",
    name: "Nordic Frost",
    accent: "#0284c7",
    surface:
      "bg-sky-50/40 dark:bg-slate-900 border-sky-200/70 dark:border-sky-900/40 text-slate-900 dark:text-sky-100 shadow-xs",
    card: "bg-white dark:bg-slate-800/60 border-sky-200/60 dark:border-sky-800/40 text-slate-800 dark:text-sky-100",
    cardSubtle: "bg-sky-50/60 dark:bg-slate-950 border-sky-200/50",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Mint",
    accent: "#059669",
    surface:
      "bg-emerald-50/40 dark:bg-slate-900 border-emerald-200/70 dark:border-emerald-900/40 text-slate-900 dark:text-emerald-100 shadow-xs",
    card: "bg-white dark:bg-slate-800/60 border-emerald-200/60 dark:border-emerald-800/40 text-slate-800 dark:text-emerald-100",
    cardSubtle: "bg-emerald-50/60 dark:bg-slate-950 border-emerald-200/50",
  },
  sunset: {
    id: "sunset",
    name: "Sunset Rose",
    accent: "#e11d48",
    surface:
      "bg-rose-50/40 dark:bg-slate-900 border-rose-200/70 dark:border-rose-900/40 text-slate-900 dark:text-rose-100 shadow-xs",
    card: "bg-white dark:bg-slate-800/60 border-rose-200/60 dark:border-rose-800/40 text-slate-800 dark:text-rose-100",
    cardSubtle: "bg-rose-50/60 dark:bg-slate-950 border-rose-200/50",
  },
  espresso: {
    id: "espresso",
    name: "Warm Amber",
    accent: "#d97706",
    surface:
      "bg-amber-50/40 dark:bg-slate-900 border-amber-200/70 dark:border-amber-900/40 text-slate-900 dark:text-amber-100 shadow-xs",
    card: "bg-white dark:bg-slate-800/60 border-amber-200/60 dark:border-amber-800/40 text-slate-800 dark:text-amber-100",
    cardSubtle: "bg-amber-50/60 dark:bg-slate-950 border-amber-200/50",
  },
  parchment: {
    id: "parchment",
    name: "Vintage Paper",
    accent: "#92400e",
    surface:
      "bg-[#fbf7ee] dark:bg-slate-900 border-amber-200/80 dark:border-amber-900/40 text-stone-900 dark:text-stone-100 shadow-xs",
    card: "bg-[#f5eedc] dark:bg-slate-800/60 border-amber-300/60 dark:border-amber-800/40 text-stone-800 dark:text-stone-100",
    cardSubtle: "bg-[#fffcf5] dark:bg-slate-950 border-amber-200/60",
  },
  obsidian: {
    id: "obsidian",
    name: "Midnight Dark",
    accent: "#8b5cf6",
    surface: "bg-slate-900 border-slate-800 text-slate-100 shadow-sm",
    card: "bg-slate-800/60 border-slate-700/60 text-slate-100",
    cardSubtle: "bg-slate-950/40 border-slate-800/80",
  },
};

const TEMPLATES = [
  {
    id: "productive_pro",
    name: "Productive Professional",
    description:
      "Deep work blocks, client reviews, fitness routine, and hydration tracking.",
    icon: "Briefcase",
    data: {
      priorities: [
        {
          id: "tp1",
          text: "Complete Q3 Strategic Roadmap Presentation",
          completed: false,
          isFrog: true,
        },
        {
          id: "tp2",
          text: "Review Pull Requests and System Architecture docs",
          completed: false,
        },
        {
          id: "tp3",
          text: "Conduct 1-on-1 team syncs & clear inbox",
          completed: false,
        },
      ],
      timeBlocks: [
        {
          id: "tb1",
          start: "08:00",
          end: "09:00",
          category: "admin",
          title: "Morning Review & Inbox Zero",
          completed: false,
        },
        {
          id: "tb2",
          start: "09:00",
          end: "11:30",
          category: "deepwork",
          title: "Q3 Strategic Roadmap Deck (Deep Focus)",
          completed: false,
        },
        {
          id: "tb3",
          start: "11:30",
          end: "12:30",
          category: "meetings",
          title: "Cross-functional Product Sync",
          completed: false,
        },
        {
          id: "tb4",
          start: "12:30",
          end: "13:30",
          category: "personal",
          title: "Healthy Lunch & 15m Walk",
          completed: false,
        },
        {
          id: "tb5",
          start: "13:30",
          end: "15:30",
          category: "deepwork",
          title: "Architecture RFC & Code Review",
          completed: false,
        },
        {
          id: "tb6",
          start: "16:00",
          end: "17:00",
          category: "fitness",
          title: "Gym Session / HIIT Cardio",
          completed: false,
        },
      ],
      tasks: [
        {
          id: "tk1",
          text: "Finalize financial projections spreadsheet",
          priority: "p1",
          category: "work",
          completed: false,
          subtasks: [],
        },
        {
          id: "tk2",
          text: "Send follow-up notes from client call",
          priority: "p2",
          category: "work",
          completed: false,
          subtasks: [],
        },
        {
          id: "tk3",
          text: "Schedule dentist appointment",
          priority: "p3",
          category: "personal",
          completed: false,
          subtasks: [],
        },
      ],
      habits: [
        {
          id: "hb1",
          name: "Drink 500ml Water Upon Waking",
          completed: false,
          streak: 8,
        },
        {
          id: "hb2",
          name: "30 Min Focused Workout",
          completed: false,
          streak: 14,
        },
        {
          id: "hb3",
          name: "Read 15 Pages of Non-Fiction",
          completed: false,
          streak: 6,
        },
        {
          id: "hb4",
          name: "Evening Plan for Tomorrow",
          completed: false,
          streak: 12,
        },
      ],
      waterGlasses: 2,
      mood: "good",
      energy: 4,
      sleepHours: 7.5,
      gratitude: [
        "Morning calm and sunny weather",
        "Great supportive teammates",
        "Opportunity to build exciting tools",
      ],
      reflection:
        "Stayed focused during morning deep work session without distractions.",
      brainDump: "Look into Web Audio optimization for mobile browsers.",
    },
  },
  {
    id: "student_study",
    name: "Student & Exam Prep",
    description:
      "Lecture reviews, Pomodoro study sessions, flashcards, and balanced breaks.",
    icon: "GraduationCap",
    data: {
      priorities: [
        {
          id: "tp1",
          text: "Master Calculus Integration by Parts (Chapter 4)",
          completed: false,
          isFrog: true,
        },
        {
          id: "tp2",
          text: "Draft Introduction & Method for Chemistry Lab Report",
          completed: false,
        },
        {
          id: "tp3",
          text: "Review 50 Anki Flashcards for Biology Exam",
          completed: false,
        },
      ],
      timeBlocks: [
        {
          id: "tb1",
          start: "08:30",
          end: "10:00",
          category: "learning",
          title: "Calculus Problem Sets #1 - #20",
          completed: false,
        },
        {
          id: "tb2",
          start: "10:30",
          end: "12:00",
          category: "learning",
          title: "Chemistry Lab Data Synthesis",
          completed: false,
        },
        {
          id: "tb3",
          start: "13:00",
          end: "14:30",
          category: "learning",
          title: "Biology Chapter 7 Lecture Review",
          completed: false,
        },
        {
          id: "tb4",
          start: "15:00",
          end: "16:00",
          category: "fitness",
          title: "Campus Jog / Workout",
          completed: false,
        },
      ],
      tasks: [
        {
          id: "tk1",
          text: "Submit Physics Assignment on portal",
          priority: "p1",
          category: "study",
          completed: false,
          subtasks: [],
        },
        {
          id: "tk2",
          text: "Email Professor about office hours",
          priority: "p2",
          category: "study",
          completed: false,
          subtasks: [],
        },
        {
          id: "tk3",
          text: "Print lecture slides for tomorrow",
          priority: "p4",
          category: "study",
          completed: false,
          subtasks: [],
        },
      ],
      habits: [
        {
          id: "hb1",
          name: "No phone for first 30m of day",
          completed: false,
          streak: 5,
        },
        {
          id: "hb2",
          name: "4 Pomodoro Cycles Completed",
          completed: false,
          streak: 9,
        },
        {
          id: "hb3",
          name: "Review Flashcards Daily",
          completed: false,
          streak: 11,
        },
      ],
      waterGlasses: 3,
      mood: "good",
      energy: 4,
      sleepHours: 8,
      gratitude: [
        "Good cup of coffee",
        "Quiet study corner at the library",
        "Understood a tough physics proof",
      ],
      reflection: "Felt very productive using the 25/5 Pomodoro method.",
      brainDump: "Check library loan due date on Friday.",
    },
  },
  {
    id: "mindful_wellness",
    name: "Mindful & Healthy Living",
    description:
      "Meditation, healthy cooking, outdoor walking, and balanced life goals.",
    icon: "Heart",
    data: {
      priorities: [
        {
          id: "tp1",
          text: "1 Hour Outdoor Nature Walk / Sun Exposure",
          completed: false,
          isFrog: true,
        },
        {
          id: "tp2",
          text: "Prepare Home-Cooked Nutritious Dinner",
          completed: false,
        },
        {
          id: "tp3",
          text: "20 Minutes Guided Mindfulness & Journaling",
          completed: false,
        },
      ],
      timeBlocks: [
        {
          id: "tb1",
          start: "07:30",
          end: "08:30",
          category: "fitness",
          title: "Morning Yoga & Meditation",
          completed: false,
        },
        {
          id: "tb2",
          start: "09:00",
          end: "12:00",
          category: "deepwork",
          title: "Focused Project Creation",
          completed: false,
        },
        {
          id: "tb3",
          start: "14:00",
          end: "15:00",
          category: "fitness",
          title: "Park Walk & Fresh Air",
          completed: false,
        },
        {
          id: "tb4",
          start: "18:00",
          end: "19:30",
          category: "personal",
          title: "Cooking Fresh Dinner with Family",
          completed: false,
        },
      ],
      tasks: [
        {
          id: "tk1",
          text: "Buy organic greens & fresh fruits",
          priority: "p2",
          category: "health",
          completed: false,
          subtasks: [],
        },
        {
          id: "tk2",
          text: "Call grandmother for a weekend chat",
          priority: "p2",
          category: "personal",
          completed: false,
          subtasks: [],
        },
      ],
      habits: [
        {
          id: "hb1",
          name: "15 Min Morning Sunlight",
          completed: false,
          streak: 16,
        },
        { id: "hb2", name: "Drink 2.5L Water", completed: false, streak: 21 },
        { id: "hb3", name: "10,000 Daily Steps", completed: false, streak: 7 },
        {
          id: "hb4",
          name: "No Screens 1 Hour Before Bed",
          completed: false,
          streak: 4,
        },
      ],
      waterGlasses: 4,
      mood: "good",
      energy: 5,
      sleepHours: 8.5,
      gratitude: [
        "Good health and vitality",
        "Crisp morning breeze",
        "A peaceful home environment",
      ],
      reflection:
        "Giving myself permission to slow down improved my focus tremendously.",
      brainDump: "Try new roasted vegetable recipe this weekend.",
    },
  },
];

const DEFAULT_HABITS = [
  { id: "h1", name: "Drink 500ml Water", completed: false, streak: 5 },
  { id: "h2", name: "30 Min Exercise / Walk", completed: false, streak: 12 },
  { id: "h3", name: "Read 15 Mins", completed: false, streak: 3 },
  { id: "h4", name: "No Social Media Before 9AM", completed: false, streak: 7 },
];

const DEFAULT_SETTINGS = {
  theme: "clean",
  customAccent: "#7c00fe",
  fontFamily: "Inter",
  timeFormat: "12h", // "12h" | "24h"
  startHour: 6, // 6 AM
  endHour: 23, // 11 PM
  density: "comfortable", // "compact" | "comfortable" | "spacious"
  soundEnabled: true,
  waterGoalGlasses: 8,
  widgets: {
    priorities: true,
    timeline: true,
    tasks: true,
    habits: true,
    hydration: true,
    wellness: true,
    meals: true,
    gratitude: true,
    reflection: true,
    brainDump: true,
    pomodoro: true,
  },
};

// ─── Helpers ──────────────────────────────────────────────────

function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateStr) {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (_) {
    return dateStr;
  }
}

function getRelativeDateLabel(dateStr) {
  const today = getTodayKey();
  if (dateStr === today) return "Today";

  const [y1, m1, d1] = dateStr.split("-").map(Number);
  const [y2, m2, d2] = today.split("-").map(Number);
  const dt1 = new Date(y1, m1 - 1, d1);
  const dt2 = new Date(y2, m2 - 1, d2);
  const diffDays = Math.round((dt1 - dt2) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

function formatHour(h, format = "12h") {
  if (format === "24h") {
    return `${String(h).padStart(2, "0")}:00`;
  }
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${ampm}`;
}

function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function generateId() {
  return "dp_" + Math.random().toString(36).substring(2, 9);
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function DailyPlanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Current active date (YYYY-MM-DD)
  const [currentDate, setCurrentDate] = useState(getTodayKey);

  // Active Main View
  // "day" (Time-blocking dashboard) | "matrix" (Eisenhower) | "week" (Weekly overview) | "print" (Printable sheet)
  const [activeView, setActiveView] = useState("day");

  // Settings & Customizations
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // Day Data States
  const [priorities, setPriorities] = useState([
    { id: "p_1", text: "Define & Execute Top Priority Goal", completed: false, isFrog: true },
    { id: "p_2", text: "High-impact secondary objective", completed: false },
    { id: "p_3", text: "Essential follow-up or administrative task", completed: false },
  ]);

  const [timeBlocks, setTimeBlocks] = useState([
    { id: "tb_1", start: "08:00", end: "09:00", category: "admin", title: "Morning Planning & Priority Check", completed: false },
    { id: "tb_2", start: "09:30", end: "12:00", category: "deepwork", title: "Deep Work Session (Frog Priority)", completed: false },
    { id: "tb_3", start: "12:00", end: "13:00", category: "personal", title: "Lunch & Refreshment", completed: false },
    { id: "tb_4", start: "13:30", end: "15:30", category: "deepwork", title: "Secondary Focus & Project Execution", completed: false },
    { id: "tb_5", start: "16:00", end: "17:00", category: "fitness", title: "Physical Exercise & Stretching", completed: false },
  ]);

  const [tasks, setTasks] = useState([
    { id: "t_1", text: "Complete core project milestone", priority: "p1", category: "work", completed: false, subtasks: [] },
    { id: "t_2", text: "Organize digital workspace and notes", priority: "p2", category: "work", completed: false, subtasks: [] },
    { id: "t_3", text: "Hydrate and take walking breaks", priority: "p3", category: "health", completed: false, subtasks: [] },
  ]);

  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [mood, setMood] = useState("good"); // "awesome" | "good" | "neutral" | "tired" | "stressed"
  const [energy, setEnergy] = useState(4); // 1 - 5
  const [sleepHours, setSleepHours] = useState(7.5);
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [reflection, setReflection] = useState("");
  const [brainDump, setBrainDump] = useState("");
  const [meals, setMeals] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
    snacks: "",
  });

  // UI Modals & Creation states
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [blockForm, setBlockForm] = useState({
    start: "09:00",
    end: "10:00",
    category: "deepwork",
    title: "",
    notes: "",
  });

  const [newTaskInput, setNewTaskInput] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("p2");
  const [newTaskCategory, setNewTaskCategory] = useState("work");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskFilterCategory, setTaskFilterCategory] = useState("all");
  const [taskFilterStatus, setTaskFilterStatus] = useState("all");

  const [newHabitName, setNewHabitName] = useState("");
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  // Pomodoro State
  const [pomodoroMode, setPomodoroMode] = useState("focus"); // "focus" (25) | "shortBreak" (5) | "longBreak" (15)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState("");
  const [ambientSound, setAmbientSound] = useState("off"); // "off" | "whitenoise" | "rain" | "cafe"
  const [ambientVolume, setAmbientVolume] = useState(0.12);

  // Real-time current time tracker for the timeline indicator
  const [nowMinute, setNowMinute] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

// Load Settings from LocalStorage
useEffect(() => {
  try {
    const savedSettings = localStorage.getItem(
      "toolstrek_daily_planner_settings_v1",
    );
    if (savedSettings) {
      setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  } catch (_) {}
}, []);

const updateSettings = useCallback((newPartial) => {
  setSettings((prev) => {
    const updated = { ...prev, ...newPartial };
    try {
      localStorage.setItem(
        "toolstrek_daily_planner_settings_v1",
        JSON.stringify(updated),
      );
    } catch (_) {}
    return updated;
  });
}, []);

// Load Data for currentDate from LocalStorage
const loadDateData = useCallback((dateKey) => {
  try {
    const raw = localStorage.getItem(`toolstrek_daily_planner_v1_${dateKey}`);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.priorities) setPriorities(data.priorities);
      if (data.timeBlocks) setTimeBlocks(data.timeBlocks);
      if (data.tasks) setTasks(data.tasks);
      if (data.habits) setHabits(data.habits);
      if (typeof data.waterGlasses === "number")
        setWaterGlasses(data.waterGlasses);
      if (data.mood) setMood(data.mood);
      if (typeof data.energy === "number") setEnergy(data.energy);
      if (typeof data.sleepHours === "number") setSleepHours(data.sleepHours);
      if (Array.isArray(data.gratitude)) setGratitude(data.gratitude);
      if (typeof data.reflection === "string") setReflection(data.reflection);
      if (typeof data.brainDump === "string") setBrainDump(data.brainDump);
      if (data.meals) setMeals(data.meals);
    } else {
      if (dateKey === getTodayKey()) {
        // keep initial defaults
      } else {
        setPriorities([
          { id: generateId(), text: "", completed: false, isFrog: true },
          { id: generateId(), text: "", completed: false },
          { id: generateId(), text: "", completed: false },
        ]);
        setTimeBlocks([]);
        setTasks([]);
        setHabits(DEFAULT_HABITS.map((h) => ({ ...h, completed: false })));
        setWaterGlasses(0);
        setMood("good");
        setEnergy(3);
        setSleepHours(7.5);
        setGratitude(["", "", ""]);
        setReflection("");
        setBrainDump("");
        setMeals({ breakfast: "", lunch: "", dinner: "", snacks: "" });
      }
    }
  } catch (_) {}
}, []);

// Save current day's data
useEffect(() => {
  const payload = {
    priorities,
    timeBlocks,
    tasks,
    habits,
    waterGlasses,
    mood,
    energy,
    sleepHours,
    gratitude,
    reflection,
    brainDump,
    meals,
  };
  try {
    localStorage.setItem(
      `toolstrek_daily_planner_v1_${currentDate}`,
      JSON.stringify(payload),
    );
  } catch (_) {}
}, [
  currentDate,
  priorities,
  timeBlocks,
  tasks,
  habits,
  waterGlasses,
  mood,
  energy,
  sleepHours,
  gratitude,
  reflection,
  brainDump,
  meals,
]);

// Date Navigation
const changeDate = useCallback(
  (offsetDays) => {
    if (settings.soundEnabled) audio.playTap();
    const [y, m, d] = currentDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offsetDays);
    const newKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setCurrentDate(newKey);
    loadDateData(newKey);
  },
  [currentDate, loadDateData, settings.soundEnabled],
);

const jumpToDate = useCallback(
  (dateStr) => {
    if (!dateStr) return;
    if (settings.soundEnabled) audio.playTap();
    setCurrentDate(dateStr);
    loadDateData(dateStr);
  },
  [loadDateData, settings.soundEnabled],
);

// Live timer for current time indicator
useEffect(() => {
  const interval = setInterval(() => {
    const d = new Date();
    setNowMinute(d.getHours() * 60 + d.getMinutes());
  }, 30000);
  return () => clearInterval(interval);
}, []);

// Pomodoro Interval Engine
useEffect(() => {
  let timer = null;
  if (isPomodoroRunning && pomodoroSeconds > 0) {
    timer = setInterval(() => {
      setPomodoroSeconds((prev) => prev - 1);
    }, 1000);
  } else if (isPomodoroRunning && pomodoroSeconds === 0) {
    if (settings.soundEnabled) audio.playTimerFinish();
    toast.success(
      pomodoroMode === "focus"
        ? "Focus session complete! Take a break."
        : "Break finished! Ready to focus?",
    );
    setIsPomodoroRunning(false);
    if (pomodoroMode === "focus") {
      setPomodoroMode("shortBreak");
      setPomodoroSeconds(5 * 60);
    } else {
      setPomodoroMode("focus");
      setPomodoroSeconds(25 * 60);
    }
  }
  return () => clearInterval(timer);
}, [isPomodoroRunning, pomodoroSeconds, pomodoroMode, settings.soundEnabled]);

const handleAmbientChange = (type) => {
  setAmbientSound(type);
  if (type === "off") {
    audio.stopAmbient();
  } else {
    audio.startAmbient(type, ambientVolume);
  }
};

// ─── Score & Completion Calculations ─────────────────────────
const completionStats = useMemo(() => {
  let totalItems = 0;
  let completedItems = 0;

  priorities.forEach((p) => {
    if (p.text.trim()) {
      totalItems += 2;
      if (p.completed) completedItems += 2;
    }
  });

  tasks.forEach((t) => {
    totalItems += 1;
    if (t.completed) completedItems += 1;
  });

  habits.forEach((h) => {
    totalItems += 1;
    if (h.completed) completedItems += 1;
  });

  totalItems += 1;
  if (waterGlasses >= settings.waterGoalGlasses) completedItems += 1;
  else completedItems += waterGlasses / settings.waterGoalGlasses;

  timeBlocks.forEach((tb) => {
    totalItems += 1;
    if (tb.completed) completedItems += 1;
  });

  const percent =
    totalItems > 0
      ? Math.min(100, Math.round((completedItems / totalItems) * 100))
      : 0;
  return {
    percent,
    totalItems,
    completedItems: Math.round(completedItems),
  };
}, [
  priorities,
  tasks,
  habits,
  waterGlasses,
  settings.waterGoalGlasses,
  timeBlocks,
]);

// Fanfare on all top 3 completed
const prevPrioritiesDoneRef = useRef(false);
useEffect(() => {
  const allFilled = priorities.every((p) => p.text.trim().length > 0);
  const allDone = allFilled && priorities.every((p) => p.completed);
  if (allDone && !prevPrioritiesDoneRef.current) {
    if (settings.soundEnabled) audio.playFanfare();
    toast.success(
      "🏆 Incredible! You conquered all Top 3 Priorities for today!",
      {
        description: "Consistency is your superpower.",
      },
    );
  }
  prevPrioritiesDoneRef.current = allDone;
}, [priorities, settings.soundEnabled]);

// ─── Priority Handlers ───────────────────────────────────────
const updatePriority = (id, field, value) => {
  setPriorities((prev) =>
    prev.map((p) => {
      if (p.id === id) {
        if (field === "completed" && value === true && settings.soundEnabled) {
          audio.playCheck();
        }
        return { ...p, [field]: value };
      }
      return p;
    }),
  );
};

// ─── Time Blocking Handlers ──────────────────────────────────
const openNewBlockModal = (defaultStart = "09:00") => {
  if (settings.soundEnabled) audio.playTap();
  const [h, m] = defaultStart.split(":").map(Number);
  const endH = (h + 1) % 24;
  const endStr = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  setEditingBlock(null);
  setBlockForm({
    start: defaultStart,
    end: endStr,
    category: "deepwork",
    title: "",
    notes: "",
  });
  setIsAddBlockOpen(true);
};

const openEditBlockModal = (block) => {
  if (settings.soundEnabled) audio.playTap();
  setEditingBlock(block);
  setBlockForm({
    start: block.start,
    end: block.end,
    category: block.category,
    title: block.title,
    notes: block.notes || "",
  });
  setIsAddBlockOpen(true);
};

const saveBlockForm = (e) => {
  e.preventDefault();
  if (!blockForm.title.trim()) {
    toast.error("Please enter a title for the time block");
    return;
  }
  if (settings.soundEnabled) audio.playTap();

  if (editingBlock) {
    setTimeBlocks((prev) =>
      prev.map((b) => (b.id === editingBlock.id ? { ...b, ...blockForm } : b)),
    );
    toast.success("Time block updated");
  } else {
    const newBlock = {
      id: generateId(),
      ...blockForm,
      completed: false,
    };
    setTimeBlocks((prev) =>
      [...prev, newBlock].sort((a, b) => a.start.localeCompare(b.start)),
    );
    toast.success("Time block scheduled");
  }
  setIsAddBlockOpen(false);
};

const toggleBlockCompleted = (id) => {
  setTimeBlocks((prev) =>
    prev.map((b) => {
      if (b.id === id) {
        const next = !b.completed;
        if (next && settings.soundEnabled) audio.playCheck();
        return { ...b, completed: next };
      }
      return b;
    }),
  );
};

const deleteBlock = (id) => {
  if (settings.soundEnabled) audio.playTap();
  setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
  toast.info("Time block removed");
};

// ─── Task Handlers ───────────────────────────────────────────
const addTask = (e) => {
  e?.preventDefault();
  if (!newTaskInput.trim()) return;
  if (settings.soundEnabled) audio.playTap();

  const newTask = {
    id: generateId(),
    text: newTaskInput.trim(),
    priority: newTaskPriority,
    category: newTaskCategory,
    completed: false,
    subtasks: [],
  };
  setTasks((prev) => [newTask, ...prev]);
  setNewTaskInput("");
  toast.success("Task added to list");
};

const toggleTaskCompleted = (id) => {
  setTasks((prev) =>
    prev.map((t) => {
      if (t.id === id) {
        const next = !t.completed;
        if (next && settings.soundEnabled) audio.playCheck();
        return { ...t, completed: next };
      }
      return t;
    }),
  );
};

const deleteTask = (id) => {
  if (settings.soundEnabled) audio.playTap();
  setTasks((prev) => prev.filter((t) => t.id !== id));
  toast.info("Task deleted");
};

// Roll over unfinished tasks
const rollOverUnfinishedTasks = () => {
  const unfinished = tasks.filter((t) => !t.completed);
  if (unfinished.length === 0) {
    toast.info("No unfinished tasks to roll over!");
    return;
  }

  const [y, m, d] = currentDate.split("-").map(Number);
  const tomorrow = new Date(y, m - 1, d);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  try {
    const raw = localStorage.getItem(
      `toolstrek_daily_planner_v1_${tomorrowKey}`,
    );
    let tomorrowData = raw ? JSON.parse(raw) : {};
    const existingTomorrowTasks = tomorrowData.tasks || [];
    const mergedTasks = [
      ...existingTomorrowTasks,
      ...unfinished.map((t) => ({ ...t, id: generateId(), completed: false })),
    ];
    tomorrowData.tasks = mergedTasks;
    localStorage.setItem(
      `toolstrek_daily_planner_v1_${tomorrowKey}`,
      JSON.stringify(tomorrowData),
    );
    if (settings.soundEnabled) audio.playTap();
    toast.success(
      `Rolled over ${unfinished.length} unfinished tasks to ${formatDateDisplay(tomorrowKey)}!`,
    );
  } catch (_) {
    toast.error("Failed to roll over tasks.");
  }
};

// ─── Habit Handlers ──────────────────────────────────────────
const toggleHabit = (id) => {
  setHabits((prev) =>
    prev.map((h) => {
      if (h.id === id) {
        const next = !h.completed;
        if (next && settings.soundEnabled) audio.playCheck();
        const newStreak = next
          ? (h.streak || 0) + 1
          : Math.max(0, (h.streak || 0) - 1);
        return { ...h, completed: next, streak: newStreak };
      }
      return h;
    }),
  );
};

const addCustomHabit = () => {
  if (!newHabitName.trim()) return;
  if (settings.soundEnabled) audio.playTap();
  setHabits((prev) => [
    ...prev,
    {
      id: generateId(),
      name: newHabitName.trim(),
      completed: false,
      streak: 1,
    },
  ]);
  setNewHabitName("");
  setIsAddingHabit(false);
  toast.success("Habit added");
};

const deleteHabit = (id) => {
  if (settings.soundEnabled) audio.playTap();
  setHabits((prev) => prev.filter((h) => h.id !== id));
};

// ─── Hydration Handlers ──────────────────────────────────────
const toggleWaterGlass = (index) => {
  if (settings.soundEnabled) audio.playWaterDrop();
  setWaterGlasses((prev) => (index + 1 === prev ? prev - 1 : index + 1));
};

// ─── Templates & Export / Print Handlers ─────────────────────
const loadTemplate = (template) => {
  if (settings.soundEnabled) audio.playTap();
  const d = template.data;
  setPriorities(d.priorities || []);
  setTimeBlocks(d.timeBlocks || []);
  setTasks(d.tasks || []);
  setHabits(d.habits || []);
  setWaterGlasses(d.waterGlasses || 0);
  setMood(d.mood || "good");
  setEnergy(d.energy || 4);
  setSleepHours(d.sleepHours || 7.5);
  setGratitude(d.gratitude || ["", "", ""]);
  setReflection(d.reflection || "");
  setBrainDump(d.brainDump || "");
  setIsTemplatesOpen(false);
  toast.success(`Loaded "${template.name}" template!`);
};

const exportMarkdown = () => {
  let md = `# Daily Planner — ${formatDateDisplay(currentDate)}\n\n`;
  md += `**Productivity Score:** ${completionStats.percent}% | **Mood:** ${mood} | **Water:** ${waterGlasses * 250}ml\n\n`;

  md += `## 🎯 Top 3 Priorities\n`;
  priorities.forEach((p) => {
    md += `- [${p.completed ? "x" : " "}] ${p.isFrog ? "🐸 " : ""}${p.text || "Untitled"}\n`;
  });

  md += `\n## ⏱️ Time-Blocked Schedule\n`;
  timeBlocks.forEach((tb) => {
    md += `- **${tb.start} - ${tb.end}** [${tb.category.toUpperCase()}]: ${tb.title} ${tb.completed ? "(Completed)" : ""}\n`;
  });

  md += `\n## 📝 Tasks\n`;
  tasks.forEach((t) => {
    md += `- [${t.completed ? "x" : " "}] [${t.priority.toUpperCase()}] ${t.text}\n`;
  });

  md += `\n## 🔥 Habits\n`;
  habits.forEach((h) => {
    md += `- [${h.completed ? "x" : " "}] ${h.name} (Streak: ${h.streak} days)\n`;
  });

  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daily_plan_${currentDate}.md`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Exported Markdown note");
};

const copySummaryToClipboard = () => {
  let text = `📅 Daily Plan (${formatDateDisplay(currentDate)})\n`;
  text += `Score: ${completionStats.percent}% | Water: ${waterGlasses}/${settings.waterGoalGlasses} glasses\n\n`;
  text += `🎯 TOP PRIORITIES:\n`;
  priorities.forEach((p) => {
    if (p.text.trim())
      text += `${p.completed ? "✅" : "⬜"} ${p.isFrog ? "🐸 " : ""}${p.text}\n`;
  });
  text += `\n⏱️ SCHEDULE:\n`;
  timeBlocks.forEach((tb) => {
    text += `• ${tb.start}-${tb.end}: ${tb.title}\n`;
  });
  text += `\n📝 TASKS:\n`;
  tasks.forEach((t) => {
    text += `${t.completed ? "✅" : "⬜"} ${t.text}\n`;
  });

  navigator.clipboard.writeText(text);
  toast.success("Daily summary copied to clipboard!");
};

const handlePrint = () => {
  window.print();
};

// Theme object lookup
const currentTheme = THEMES[settings.theme] || THEMES.clean;

// Filtered Tasks
const filteredTasks = useMemo(() => {
  return tasks.filter((t) => {
    const matchSearch = t.text
      .toLowerCase()
      .includes(taskSearchQuery.toLowerCase());
    const matchCat =
      taskFilterCategory === "all" || t.category === taskFilterCategory;
    const matchStatus =
      taskFilterStatus === "all" ||
      (taskFilterStatus === "active" && !t.completed) ||
      (taskFilterStatus === "completed" && t.completed);
    return matchSearch && matchCat && matchStatus;
  });
}, [tasks, taskSearchQuery, taskFilterCategory, taskFilterStatus]);

// Eisenhower Matrix Task Buckets
const eisenhowerMatrix = useMemo(() => {
  return {
    q1: tasks.filter((t) => t.priority === "p1"),
    q2: tasks.filter((t) => t.priority === "p2"),
    q3: tasks.filter((t) => t.priority === "p3"),
    q4: tasks.filter((t) => t.priority === "p4"),
  };
}, [tasks]);

// Weekly mini strip dates
const weekDays = useMemo(() => {
  const [y, m, d] = currentDate.split("-").map(Number);
  const current = new Date(y, m - 1, d);
  const dayOfWeek = current.getDay();
  const startOffset =
    settings.timeFormat === "24h"
      ? dayOfWeek === 0
        ? -6
        : 1 - dayOfWeek
      : -dayOfWeek;

  const days = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(current);
    dt.setDate(current.getDate() + startOffset + i);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    days.push({
      dateKey: key,
      dayName: dt.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: dt.getDate(),
      isCurrent: key === currentDate,
      isToday: key === getTodayKey(),
    });
  }
  return days;
}, [currentDate, settings.timeFormat]);

// Timeline Hour Slots generator
const timelineHours = useMemo(() => {
  const slots = [];
  for (let h = settings.startHour; h <= settings.endHour; h++) {
    slots.push(h);
  }
  return slots;
}, [settings.startHour, settings.endHour]);

// ─────────────────────────────────────────────────────────────
// JSX Rendering
// ─────────────────────────────────────────────────────────────

return (
  <ToolPageShell widthClassName="max-w-7xl">
    <style jsx global>{`
      .daily-planner-root {
        font-family: ${settings.fontFamily === "Inter"
          ? "var(--font-sans), Inter, sans-serif"
          : settings.fontFamily + ", sans-serif"};
      }
      @media print {
        body * {
          visibility: hidden;
        }
        #printable-planner-sheet,
        #printable-planner-sheet * {
          visibility: visible;
        }
        #printable-planner-sheet {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
          padding: 20px;
        }
        .no-print {
          display: none !important;
        }
      }
    `}</style>

    <div className="daily-planner-root space-y-6 text-slate-800 dark:text-slate-100">
      {/* ── TOP BREADCRUMB & HEADER CONTROLS ── */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-brandColor transition-colors shadow-xs flex items-center gap-2 text-sm font-medium" />
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-brandColor">
              <CalendarCheck2 className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Productivity Suite
            </span>
          </div>
        </div>

        {/* Action Tools (Templates, Audio, Export, Settings, Favorite) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTemplatesOpen(true)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Load Ready-Made Templates"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button
            onClick={copySummaryToClipboard}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Copy Summary"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            onClick={exportMarkdown}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Export as Markdown"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Markdown</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={() =>
              updateSettings({ soundEnabled: !settings.soundEnabled })
            }
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              settings.soundEnabled
                ? "bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-brandColor"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
            }`}
            title={
              settings.soundEnabled ? "Sound FX Enabled" : "Sound FX Muted"
            }
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brandColor text-slate-700 dark:text-slate-300 transition-all shadow-xs cursor-pointer"
            title="Customize Planner Theme & Layout"
          >
            <Settings2 className="w-4 h-4 text-brandColor" />
          </button>

          <FavoriteButton
            tool={
              toolsData.find((t) => t.link === "/tools/daily-planner") || {
                link: "/tools/daily-planner",
                title: "Daily Planner",
              }
            }
          />
        </div>
      </div>

      {/* ── HERO BANNER & DATE NAVIGATOR ── */}
      <div className="no-print rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden border transition-all bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/60 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-950 border-purple-200/80 dark:border-purple-900/30 text-slate-900 dark:text-white">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Date Controls */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Daily Execution Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {getRelativeDateLabel(currentDate)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
                title="Previous Day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                {formatDateDisplay(currentDate)}
              </h1>

              <button
                onClick={() => changeDate(1)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
                title="Next Day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Jump Date Input */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <button
                onClick={() => jumpToDate(getTodayKey())}
                className="px-3 py-1 rounded-lg bg-brandColor hover:bg-brandColorHover text-white font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Today
              </button>
              <span>or pick date:</span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => jumpToDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer shadow-xs"
              />
            </div>
          </div>

          {/* Productivity Ring & Quick Stats */}
          <div className="flex items-center gap-6 bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            {/* Circular Progress Meter */}
            <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brandColor transition-all duration-700 ease-out"
                  strokeDasharray={`${completionStats.percent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {completionStats.percent}%
                </span>
                <span className="text-[9px] uppercase tracking-tighter text-slate-500 dark:text-slate-400 font-bold">
                  Score
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>
                  Priorities:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {priorities.filter((p) => p.completed).length}/3
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Tasks:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {tasks.filter((t) => t.completed).length}/{tasks.length}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span>
                  Habits:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {habits.filter((h) => h.completed).length}/{habits.length}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>
                  Water:{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {waterGlasses * 250}ml
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── VIEW SWITCHER TAB BAR ── */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setActiveView("day")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeView === "day"
                  ? "bg-brandColor text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Time Blocking Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView("matrix")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeView === "matrix"
                  ? "bg-brandColor text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Eisenhower Matrix (4Q)</span>
            </button>

            <button
              onClick={() => setActiveView("week")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeView === "week"
                  ? "bg-brandColor text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Weekly Glance</span>
            </button>

            <button
              onClick={() => setActiveView("print")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeView === "print"
                  ? "bg-brandColor text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Printable Sheet</span>
            </button>
          </div>

          {/* Quick Unfinished Tasks Roll-over button */}
          <button
            onClick={rollOverUnfinishedTasks}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Copy unfinished tasks to tomorrow"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-500" />
            <span>Roll Over to Tomorrow</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
            VIEW 1: TIME BLOCKING DASHBOARD (MAIN DAY VIEW)
        ───────────────────────────────────────────────────────────── */}
      {activeView === "day" && (
        <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT COLUMN: TOP 3 PRIORITIES + HOURLY TIME-BLOCKING (7 Cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* TOP 3 MUST-WIN PRIORITIES (RULE OF 3 / FROG OF THE DAY) */}
            {settings.widgets.priorities && (
              <div
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${currentTheme.surface}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Top 3 Must-Win Priorities
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Complete your #1 Golden Frog first to win the entire
                        day.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    Rule of 3
                  </span>
                </div>

                <div className="space-y-3">
                  {priorities.map((p, index) => {
                    const isFrog = p.isFrog || index === 0;
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                          p.completed
                            ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50 opacity-80"
                            : isFrog
                              ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-700/50 shadow-xs"
                              : currentTheme.card
                        }`}
                      >
                        <button
                          onClick={() =>
                            updatePriority(p.id, "completed", !p.completed)
                          }
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                            p.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-brandColor bg-white dark:bg-slate-800"
                          }`}
                        >
                          {p.completed && (
                            <Check className="w-4 h-4 stroke-[3]" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isFrog ? (
                              <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                🐸 Frog #1
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                Priority #{index + 1}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={p.text}
                            onChange={(e) =>
                              updatePriority(p.id, "text", e.target.value)
                            }
                            placeholder={
                              isFrog
                                ? "Write your biggest, most important goal for today..."
                                : `Priority #${index + 1} objective...`
                            }
                            className={`w-full bg-transparent text-sm sm:text-base font-semibold focus:outline-none border-b border-transparent focus:border-brandColor py-0.5 text-slate-900 dark:text-white placeholder:text-slate-400 ${
                              p.completed
                                ? "line-through text-slate-400 dark:text-slate-500"
                                : ""
                            }`}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* HOURLY TIME-BLOCKING TIMELINE */}
            {settings.widgets.timeline && (
              <div
                className={`p-5 sm:p-6 rounded-3xl border ${currentTheme.surface}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-brandColor flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Hourly Schedule & Time-Blocks
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatHour(settings.startHour, settings.timeFormat)} to{" "}
                        {formatHour(settings.endHour, settings.timeFormat)} •
                        Click any hour to add a block
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openNewBlockModal("09:00")}
                    className="px-3.5 py-1.5 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Block</span>
                  </button>
                </div>

                {/* Visual Hourly Timeline Grid */}
                <div className="space-y-2 relative">
                  {mounted &&
                    currentDate === getTodayKey() &&
                    nowMinute >= settings.startHour * 60 &&
                    nowMinute <= (settings.endHour + 1) * 60 && (
                      <div
                        className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                        style={{
                          top: `${
                            ((nowMinute - settings.startHour * 60) /
                              ((settings.endHour - settings.startHour + 1) *
                                60)) *
                            100
                          }%`,
                        }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-500/20 animate-pulse" />
                        <div className="flex-1 h-0.5 bg-red-500 shadow-xs" />
                        <span className="px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold">
                          Now (
                          {formatTime12h(
                            `${Math.floor(nowMinute / 60)}:${String(nowMinute % 60).padStart(2, "0")}`,
                          )}
                          )
                        </span>
                      </div>
                    )}

                  {timelineHours.map((hour) => {
                    const hourStr = `${String(hour).padStart(2, "0")}:00`;
                    const blocksInThisHour = timeBlocks.filter((b) => {
                      const blockHour = parseInt(b.start.split(":")[0], 10);
                      return blockHour === hour;
                    });
                    return (
                      <div
                        key={hour}
                        className="group/hour flex items-start gap-3 py-1.5 border-b border-slate-200/60 dark:border-slate-800 min-h-[56px]"
                      >
                        <div className="w-16 sm:w-20 flex-shrink-0 text-right pr-2">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {formatHour(hour, settings.timeFormat)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {blocksInThisHour.length > 0 ? (
                            blocksInThisHour.map((b) => {
                              const cat =
                                BLOCK_CATEGORIES.find(
                                  (c) => c.id === b.category,
                                ) || BLOCK_CATEGORIES[0];
                              return (
                                <div
                                  key={b.id}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 group/block transition-all ${
                                    b.completed
                                      ? "opacity-60 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 line-through"
                                      : ""
                                  }`}
                                  style={{
                                    backgroundColor: !b.completed
                                      ? cat.bg
                                      : undefined,
                                    borderColor: !b.completed
                                      ? cat.border
                                      : undefined,
                                  }}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <button
                                      onClick={() => toggleBlockCompleted(b.id)}
                                      className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                                        b.completed
                                          ? "bg-emerald-500 border-emerald-500 text-white"
                                          : "border-slate-400 hover:border-brandColor bg-white dark:bg-slate-800"
                                      }`}
                                    >
                                      {b.completed && (
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      )}
                                    </button>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded"
                                          style={{ color: cat.color }}
                                        >
                                          {cat.name}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                          {formatTime12h(b.start)} –{" "}
                                          {formatTime12h(b.end)}
                                        </span>
                                      </div>
                                      <p className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-white">
                                        {b.title}
                                      </p>
                                      {b.notes && (
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                                          {b.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-80 group-hover/block:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        setPomodoroTask(b.title);
                                        toast.success(
                                          `Linked Pomodoro to "${b.title}"`,
                                        );
                                      }}
                                      className="p-1 rounded-md hover:bg-white/60 dark:hover:bg-slate-800 text-slate-500 hover:text-brandColor transition-colors"
                                      title="Focus with Pomodoro"
                                    >
                                      <Play className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => openEditBlockModal(b)}
                                      className="p-1 rounded-md hover:bg-white/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                      title="Edit Block"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteBlock(b.id)}
                                      className="p-1 rounded-md hover:bg-white/60 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
                                      title="Delete Block"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <button
                              onClick={() => openNewBlockModal(hourStr)}
                              className="w-full text-left px-3 py-1.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs text-slate-400 opacity-0 group-hover/hour:opacity-100 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>
                                Schedule event at{" "}
                                {formatHour(hour, settings.timeFormat)}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: TASKS, HABITS, WELLNESS, POMODORO, REFLECTION (5 Cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* POMODORO FOCUS TIMER WIDGET */}
            {settings.widgets.pomodoro && (
              <div className="p-5 rounded-3xl border shadow-xs transition-all bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/70 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-950 border-purple-200 dark:border-purple-900/30 text-slate-900 dark:text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs uppercase tracking-wider font-bold text-purple-700 dark:text-purple-300">
                      Pomodoro Focus Session
                    </span>
                  </div>
                  {/* Ambient Sound Selector */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        handleAmbientChange(
                          ambientSound === "rain" ? "off" : "rain",
                        )
                      }
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        ambientSound === "rain"
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                      title="Rain Soundscape"
                    >
                      🌧️ Rain
                    </button>
                    <button
                      onClick={() =>
                        handleAmbientChange(
                          ambientSound === "whitenoise"
                            ? "off"
                            : "whitenoise",
                        )
                      }
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        ambientSound === "whitenoise"
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                      title="White Noise Focus"
                    >
                      📻 Static
                    </button>
                  </div>
                </div>

                {/* Mode switcher tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl mb-4 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setPomodoroMode("focus");
                      setPomodoroSeconds(25 * 60);
                      setIsPomodoroRunning(false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      pomodoroMode === "focus"
                        ? "bg-brandColor text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Focus (25m)
                  </button>
                  <button
                    onClick={() => {
                      setPomodoroMode("shortBreak");
                      setPomodoroSeconds(5 * 60);
                      setIsPomodoroRunning(false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      pomodoroMode === "shortBreak"
                        ? "bg-brandColor text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Short (5m)
                  </button>
                  <button
                    onClick={() => {
                      setPomodoroMode("longBreak");
                      setPomodoroSeconds(15 * 60);
                      setIsPomodoroRunning(false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      pomodoroMode === "longBreak"
                        ? "bg-brandColor text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Long (15m)
                  </button>
                </div>

                {/* Big Timer Display */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 dark:from-amber-300 dark:via-white dark:to-purple-200">
                      {String(Math.floor(pomodoroSeconds / 60)).padStart(
                        2,
                        "0",
                      )}
                      :{String(pomodoroSeconds % 60).padStart(2, "0")}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-purple-300 mt-1 truncate max-w-[200px] font-medium">
                      {pomodoroTask
                        ? `🎯 ${pomodoroTask}`
                        : "Select a task or stay in flow"}
                    </p>
                  </div>

                  {/* Timer controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (settings.soundEnabled) audio.playTap();
                        setIsPomodoroRunning(!isPomodoroRunning);
                      }}
                      className={`p-3 rounded-2xl font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isPomodoroRunning
                          ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                          : "bg-brandColor hover:bg-brandColorHover text-white shadow-md shadow-purple-500/20"
                      }`}
                    >
                      {isPomodoroRunning ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (settings.soundEnabled) audio.playTap();
                        setIsPomodoroRunning(false);
                        setPomodoroSeconds(
                          pomodoroMode === "focus"
                            ? 25 * 60
                            : pomodoroMode === "shortBreak"
                              ? 5 * 60
                              : 15 * 60,
                        );
                      }}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TASK CHECKLIST & MATRIX */}
            {settings.widgets.tasks && (
              <div
                className={`p-5 rounded-3xl border ${currentTheme.surface}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <ListTodo className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      To-Do List
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {tasks.filter((t) => t.completed).length}/{tasks.length}{" "}
                    Done
                  </span>
                </div>

                {/* Quick Add Task Input */}
                <form onSubmit={addTask} className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      placeholder="Add a new task & press Enter..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-brandColor hover:bg-brandColorHover text-white font-bold text-sm cursor-pointer transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Priority & Category Pickers */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                      {Object.values(PRIORITIES).map((pr) => (
                        <button
                          key={pr.id}
                          type="button"
                          onClick={() => setNewTaskPriority(pr.id)}
                          className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                            newTaskPriority === pr.id
                              ? pr.bg + " shadow-xs font-bold"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          {pr.badge}
                        </button>
                      ))}
                    </div>

                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      {TASK_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>

                {/* Task List Items */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((t) => {
                      const pr = PRIORITIES[t.priority] || PRIORITIES.p2;
                      const cat = TASK_CATEGORIES.find(
                        (c) => c.id === t.category,
                      );
                      return (
                        <div
                          key={t.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                            t.completed
                              ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 line-through"
                              : currentTheme.card
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => toggleTaskCompleted(t.id)}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                                t.completed
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-slate-300 dark:border-slate-600 hover:border-brandColor bg-white dark:bg-slate-800"
                              }`}
                            >
                              {t.completed && (
                                <Check className="w-3 h-3 stroke-[3]" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold truncate text-slate-900 dark:text-white">
                                {t.text}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${pr.bg}`}
                                >
                                  {pr.badge}
                                </span>
                                {cat && (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {cat.emoji} {cat.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setPomodoroTask(t.text);
                                toast.success(
                                  `Pomodoro focused on: "${t.text}"`,
                                );
                              }}
                              className="p-1 text-slate-400 hover:text-brandColor rounded-md"
                              title="Focus in Pomodoro"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-md"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center py-4 text-xs text-slate-400">
                      No tasks match criteria. Add one above!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* DAILY HABITS & ROUTINES */}
            {settings.widgets.habits && (
              <div
                className={`p-5 rounded-3xl border ${currentTheme.surface}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Habits & Routines
                    </h3>
                  </div>

                  <button
                    onClick={() => setIsAddingHabit(!isAddingHabit)}
                    className="p-1 text-xs text-brandColor font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                {isAddingHabit && (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      placeholder="e.g. Read 20 mins, 10k steps..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                      onKeyDown={(e) => e.key === "Enter" && addCustomHabit()}
                    />
                    <button
                      onClick={addCustomHabit}
                      className="px-3 py-1.5 rounded-xl bg-brandColor text-white text-xs font-bold cursor-pointer shadow-xs"
                    >
                      Add
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {habits.map((h) => (
                    <div
                      key={h.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        h.completed
                          ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                          : currentTheme.card
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => toggleHabit(h.id)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                            h.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {h.completed && (
                            <Check className="w-3 h-3 stroke-[3]" />
                          )}
                        </button>
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate text-slate-900 dark:text-white ${
                            h.completed
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : ""
                          }`}
                        >
                          {h.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" />
                          {h.streak || 0}d
                        </span>
                        <button
                          onClick={() => deleteHabit(h.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-md"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HYDRATION & WELLNESS TRACKER */}
            {settings.widgets.hydration && (
              <div
                className={`p-5 rounded-3xl border ${currentTheme.surface}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Hydration & Wellness
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">
                    {waterGlasses * 250} / {settings.waterGoalGlasses * 250}{" "}
                    ml
                  </span>
                </div>

                {/* Water Glasses Clicker */}
                <div className="grid grid-cols-8 gap-1.5 mb-4">
                  {Array.from({ length: settings.waterGoalGlasses }).map(
                    (_, idx) => {
                      const isFilled = idx < waterGlasses;
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleWaterGlass(idx)}
                          className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isFilled
                              ? "bg-gradient-to-t from-cyan-500 to-sky-400 border-cyan-400 text-white shadow-xs scale-105"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-cyan-400"
                          }`}
                          title={`Glass ${idx + 1} (250ml)`}
                        >
                          <Droplets
                            className={`w-4 h-4 ${isFilled ? "fill-white" : ""}`}
                          />
                        </button>
                      );
                    },
                  )}
                </div>

                {/* Mood Selector */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Today's Mood:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: "awesome", emoji: "🤩", label: "Awesome" },
                      { id: "good", emoji: "😊", label: "Good" },
                      { id: "neutral", emoji: "😐", label: "Neutral" },
                      { id: "tired", emoji: "🥱", label: "Tired" },
                      { id: "stressed", emoji: "😫", label: "Stressed" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          if (settings.soundEnabled) audio.playTap();
                          setMood(m.id);
                        }}
                        className={`text-lg p-1 rounded-lg transition-transform ${
                          mood === m.id
                            ? "scale-125 bg-purple-100 dark:bg-purple-950/50 ring-2 ring-brandColor"
                            : "opacity-60 hover:opacity-100"
                        }`}
                        title={m.label}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GRATITUDE, DAILY WINS & BRAIN DUMP */}
            {settings.widgets.gratitude && (
              <div
                className={`p-5 rounded-3xl border ${currentTheme.surface} space-y-4`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Gratitude & Daily Wins
                  </h3>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    3 Things I&apos;m Grateful For:
                  </p>
                  {gratitude.map((g, i) => (
                    <input
                      key={i}
                      type="text"
                      value={g}
                      onChange={(e) => {
                        const updated = [...gratitude];
                        updated[i] = e.target.value;
                        setGratitude(updated);
                      }}
                      placeholder={`${i + 1}. What brings you joy today?`}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                    />
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Evening Reflection & Wins:
                  </p>
                  <textarea
                    rows={2}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="What went well today? What can I improve tomorrow?"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none shadow-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === "matrix" && (
            <div className="no-print space-y-6">
              <div className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs">
                <h2 className="text-xl font-bold mb-1">
                  Eisenhower Priority Matrix
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Organize your tasks by Urgency and Importance to stop putting
                  out fires and focus on high-leverage growth.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Q1: Do First (Urgent & Important) */}
                <div className="p-5 rounded-3xl bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <h3 className="font-extrabold text-sm sm:text-base text-red-700 dark:text-red-400">
                        Q1: DO FIRST (Urgent & Important)
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                      P1
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Crises, strict deadlines, and pressing roadblocks.
                  </p>
                  <div className="space-y-2">
                    {eisenhowerMatrix.q1.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border-red-200 dark:border-red-900/40 shadow-xs"
                      >
                        <span
                          className={`text-xs font-semibold text-slate-900 dark:text-white ${t.completed ? "line-through text-slate-400 dark:text-slate-500" : ""}`}
                        >
                          {t.text}
                        </span>
                        <button
                          onClick={() => toggleTaskCompleted(t.id)}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer ${
                            t.completed
                              ? "bg-red-500 border-red-500 text-white"
                              : "border-slate-400 bg-white dark:bg-slate-700"
                          }`}
                        >
                          {t.completed && <Check className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q2: Schedule (Not Urgent & Important) */}
                <div className="p-5 rounded-3xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500" />
                      <h3 className="font-extrabold text-sm sm:text-base text-orange-700 dark:text-orange-400">
                        Q2: SCHEDULE (Important, Not Urgent)
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                      P2
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Strategic planning, deep learning, exercise, and
                    relationship building.
                  </p>
                  <div className="space-y-2">
                    {eisenhowerMatrix.q2.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-900/40 shadow-xs"
                      >
                        <span
                          className={`text-xs font-semibold text-slate-900 dark:text-white ${t.completed ? "line-through text-slate-400 dark:text-slate-500" : ""}`}
                        >
                          {t.text}
                        </span>
                        <button
                          onClick={() => toggleTaskCompleted(t.id)}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer ${
                            t.completed
                              ? "bg-orange-500 border-orange-500 text-white"
                              : "border-slate-400 bg-white dark:bg-slate-700"
                          }`}
                        >
                          {t.completed && <Check className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q3: Delegate (Urgent, Not Important) */}
                <div className="p-5 rounded-3xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <h3 className="font-extrabold text-sm sm:text-base text-amber-700 dark:text-amber-400">
                        Q3: DELEGATE (Urgent, Not Important)
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      P3
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Interruptions, trivial emails, and routine admin tasks.
                  </p>
                  <div className="space-y-2">
                    {eisenhowerMatrix.q3.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/40 shadow-xs"
                      >
                        <span
                          className={`text-xs font-semibold text-slate-900 dark:text-white ${t.completed ? "line-through text-slate-400 dark:text-slate-500" : ""}`}
                        >
                          {t.text}
                        </span>
                        <button
                          onClick={() => toggleTaskCompleted(t.id)}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer ${
                            t.completed
                              ? "bg-amber-500 border-amber-500 text-white"
                              : "border-slate-400 bg-white dark:bg-slate-700"
                          }`}
                        >
                          {t.completed && <Check className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q4: Eliminate (Not Urgent & Not Important) */}
                <div className="p-5 rounded-3xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      <h3 className="font-extrabold text-sm sm:text-base text-blue-700 dark:text-blue-400">
                        Q4: ELIMINATE (Neither)
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      P4
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Mindless scrolling, time-wasters, and unnecessary busywork.
                  </p>
                  <div className="space-y-2">
                    {eisenhowerMatrix.q4.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/40 shadow-xs"
                      >
                        <span
                          className={`text-xs font-semibold text-slate-900 dark:text-white ${t.completed ? "line-through text-slate-400 dark:text-slate-500" : ""}`}
                        >
                          {t.text}
                        </span>
                        <button
                          onClick={() => toggleTaskCompleted(t.id)}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer ${
                            t.completed
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "border-slate-400 bg-white dark:bg-slate-700"
                          }`}
                        >
                          {t.completed && <Check className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "week" && (
            <div className="no-print space-y-6">
              <div className="p-6 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs">
                <h2 className="text-xl font-bold mb-1">
                  Weekly Momentum & Progress
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Click any day below to jump directly into its time-blocks,
                  habits, and tasks.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weekDays.map((w) => {
                  return (
                    <button
                      key={w.dateKey}
                      onClick={() => jumpToDate(w.dateKey)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
                        w.isCurrent
                          ? "bg-brandColor text-white border-purple-400 shadow-md scale-105"
                          : w.isToday
                            ? "bg-purple-50 dark:bg-purple-950/30 border-brandColor text-slate-900 dark:text-white font-bold"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brandColor hover:bg-purple-50/50"
                      }`}
                    >
                      <div className="text-xs font-bold opacity-80">
                        {w.dayName}
                      </div>
                      <div className="text-2xl font-black mt-1">{w.dayNum}</div>
                      <div className="mt-3 pt-2 border-t border-current/20 text-[10px] font-bold">
                        {w.isToday ? "Today" : w.dateKey}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div
            id="printable-planner-sheet"
            className={`${activeView === "print" ? "block" : "hidden"} bg-white text-slate-900 p-8 rounded-3xl border border-slate-300 shadow-sm space-y-6`}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900">
                  Daily Focus & Schedule
                </h2>
                <p className="text-sm font-semibold text-slate-600">
                  {formatDateDisplay(currentDate)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  ToolsTrek Planner
                </span>
                <p className="text-sm font-bold text-slate-900">
                  Score: {completionStats.percent}%
                </p>
              </div>
            </div>

            {/* Printable Top 3 */}
            <div className="border border-slate-400 p-4 rounded-xl space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                🎯 Top 3 Must-Win Goals
              </h3>
              {priorities.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm py-1 border-b border-slate-200"
                >
                  <span className="w-4 h-4 border border-slate-600 rounded inline-block" />
                  <span className="font-bold text-slate-900">#{i + 1}:</span>
                  <span className="text-slate-800">
                    {p.text || "_________________________________"}
                  </span>
                </div>
              ))}
            </div>

            {/* Printable Time-Blocks & Tasks Columns */}
            <div className="grid grid-cols-2 gap-6">
              <div className="border border-slate-400 p-4 rounded-xl space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  ⏱️ Hourly Schedule
                </h3>
                {timelineHours.map((h) => {
                  const block = timeBlocks.find(
                    (b) => parseInt(b.start.split(":")[0], 10) === h,
                  );
                  return (
                    <div
                      key={h}
                      className="flex items-center gap-2 text-xs py-1 border-b border-slate-200"
                    >
                      <span className="w-14 font-mono font-bold text-slate-800">
                        {formatHour(h, settings.timeFormat)}
                      </span>
                      <span className="flex-1 truncate text-slate-700">
                        {block ? block.title : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-6">
                <div className="border border-slate-400 p-4 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    📝 Action Checklist
                  </h3>
                  {tasks.slice(0, 8).map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs py-1 border-b border-slate-200"
                    >
                      <span className="w-3.5 h-3.5 border border-slate-600 rounded inline-block" />
                      <span className="text-slate-800">{t.text}</span>
                    </div>
                  ))}
                </div>

                <div className="border border-slate-400 p-4 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    💧 Water & Habits
                  </h3>
                  <div className="flex items-center gap-2 py-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-5 h-5 border border-slate-600 rounded-full inline-block text-center text-[10px]"
                      >
                        {i < waterGlasses ? "✓" : ""}
                      </span>
                    ))}
                  </div>
                  {habits.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs py-0.5"
                    >
                      <span className="w-3 h-3 border border-slate-600 rounded inline-block" />
                      <span className="text-slate-800">{h.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── TIME BLOCK MODAL ── */}
          <AnimatePresence>
            {isAddBlockOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {editingBlock ? "Edit Time Block" : "Schedule Time Block"}
                    </h3>
                    <button
                      onClick={() => setIsAddBlockOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={saveBlockForm} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Block Title
                      </label>
                      <input
                        type="text"
                        required
                        value={blockForm.title}
                        onChange={(e) =>
                          setBlockForm({ ...blockForm, title: e.target.value })
                        }
                        placeholder="e.g. Deep Work: System Architecture"
                        className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Start Time
                        </label>
                        <input
                          type="time"
                          required
                          value={blockForm.start}
                          onChange={(e) =>
                            setBlockForm({
                              ...blockForm,
                              start: e.target.value,
                            })
                          }
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          End Time
                        </label>
                        <input
                          type="time"
                          required
                          value={blockForm.end}
                          onChange={(e) =>
                            setBlockForm({ ...blockForm, end: e.target.value })
                          }
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Category & Tag
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                        {BLOCK_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              setBlockForm({ ...blockForm, category: cat.id })
                            }
                            className={`p-2 rounded-xl border text-xs font-bold text-left transition-all ${
                              blockForm.category === cat.id
                                ? "ring-2 ring-brandColor shadow-xs"
                                : "opacity-80 hover:opacity-100"
                            }`}
                            style={{
                              backgroundColor: cat.bg,
                              borderColor: cat.border,
                              color: cat.color,
                            }}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Notes / Checklist
                      </label>
                      <textarea
                        rows={2}
                        value={blockForm.notes}
                        onChange={(e) =>
                          setBlockForm({ ...blockForm, notes: e.target.value })
                        }
                        placeholder="Optional notes, meeting link, or sub-goals..."
                        className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none shadow-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddBlockOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                      >
                        {editingBlock ? "Save Changes" : "Schedule Block"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── TEMPLATES MODAL ── */}
          <AnimatePresence>
            {isTemplatesOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Curated Day Templates
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Choose a pre-configured workflow tailored to your daily
                        objectives.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsTemplatesOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {TEMPLATES.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 hover:border-brandColor flex flex-col justify-between gap-4 transition-all shadow-xs"
                      >
                        <div className="space-y-2">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-brandColor flex items-center justify-center font-bold">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {tmpl.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {tmpl.description}
                          </p>
                        </div>
                        <button
                          onClick={() => loadTemplate(tmpl)}
                          className="w-full py-2 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          Apply Template
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CUSTOMIZATION & SETTINGS MODAL ── */}
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Settings2 className="w-5 h-5 text-brandColor" />
                      <h3 className="font-black text-xl text-slate-900 dark:text-white">
                        Planner Customization
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Color Themes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Aesthetic Palette Presets
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.values(THEMES).map((th) => (
                        <button
                          key={th.id}
                          onClick={() => updateSettings({ theme: th.id })}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                            settings.theme === th.id
                              ? "ring-2 ring-brandColor bg-purple-50 dark:bg-purple-950/40 shadow-xs"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full mx-auto mb-1 border border-black/10"
                            style={{ backgroundColor: th.accent }}
                          />
                          <span className="text-[11px] truncate block text-slate-800 dark:text-slate-200">
                            {th.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family & Time Format */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Typography Font
                      </label>
                      <select
                        value={settings.fontFamily}
                        onChange={(e) =>
                          updateSettings({ fontFamily: e.target.value })
                        }
                        className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="Inter">Inter (Modern Clean)</option>
                        <option value="Outfit">Outfit (Geometric Bold)</option>
                        <option value="Poppins">
                          Poppins (Friendly Round)
                        </option>
                        <option value="Roboto">
                          Roboto (Technical Standard)
                        </option>
                        <option value="Playfair Display">
                          Playfair Display (Editorial Serif)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Time Format
                      </label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => updateSettings({ timeFormat: "12h" })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            settings.timeFormat === "12h"
                              ? "bg-brandColor text-white border-brandColor shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          12-Hour (AM/PM)
                        </button>
                        <button
                          onClick={() => updateSettings({ timeFormat: "24h" })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            settings.timeFormat === "24h"
                              ? "bg-brandColor text-white border-brandColor shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          24-Hour (Military)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Day Starts At
                      </label>
                      <select
                        value={settings.startHour}
                        onChange={(e) =>
                          updateSettings({ startHour: Number(e.target.value) })
                        }
                        className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                      >
                        {[4, 5, 6, 7, 8, 9].map((h) => (
                          <option key={h} value={h}>
                            {formatHour(h, settings.timeFormat)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Day Ends At
                      </label>
                      <select
                        value={settings.endHour}
                        onChange={(e) =>
                          updateSettings({ endHour: Number(e.target.value) })
                        }
                        className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                      >
                        {[20, 21, 22, 23, 24].map((h) => (
                          <option key={h} value={h}>
                            {formatHour(h, settings.timeFormat)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Module Visibility Toggles */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Dashboard Modules Toggle
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(settings.widgets).map(
                        ([key, isEnabled]) => (
                          <button
                            key={key}
                            onClick={() =>
                              updateSettings({
                                widgets: {
                                  ...settings.widgets,
                                  [key]: !isEnabled,
                                },
                              })
                            }
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                              isEnabled
                                ? "bg-purple-50 dark:bg-purple-950/40 border-brandColor text-brandColor"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                            }`}
                          >
                            <span className="capitalize">{key}</span>
                            {isEnabled ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="px-6 py-2.5 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Done & Save
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── EDUCATIONAL GUIDE & SEO FAQ ── */}
          <div className="no-print mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Mastering Modern Daily Planning & Time-Blocking
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                The science-backed framework for eliminating decision fatigue,
                maintaining laser focus, and achieving maximum daily output.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-brandColor flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Time-Blocking Method
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Assigning dedicated hours to specific activities prevents
                  multitasking and Parkinson&apos;s Law (work expanding to fill
                  available time).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  The &quot;Eat That Frog&quot; Rule
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tackle your hardest, highest-leverage task (#1 Golden Frog)
                  first thing in the morning when mental willpower and cognitive
                  clarity are peak.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <Droplets className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Holistic Energy & Habit Stacking
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  True productivity is energy management, not just time
                  management. Staying hydrated and tracking daily habits creates
                  compounding momentum.
                </p>
              </div>
            </div>

            {/* Interactive FAQ Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions (FAQ)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brandColor" />
                    Is my daily planner data saved automatically?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Yes! All tasks, time-blocks, habits, water logs, and notes
                    are automatically saved to your browser&apos;s local storage
                    per date. You can switch dates and retrieve historical
                    entries anytime.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brandColor" />
                    Can I print my daily plan or save it as a PDF?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Yes! Click the &quot;Print&quot; button in the header or
                    switch to &quot;Printable Sheet&quot; view to generate a
                    clean A4/Letter planner ready for physical paper or digital
                    PDF annotation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brandColor" />
                    What is the Eisenhower Matrix view?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    The Eisenhower Matrix divides tasks into four quadrants
                    based on Urgency and Importance: Do First (Q1), Schedule
                    (Q2), Delegate (Q3), and Eliminate (Q4).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brandColor" />
                    How do the built-in ambient sounds work?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Our Pomodoro timer uses real-time Web Audio API signal
                    generators to synthesize soft rain and white noise directly
                    on your device with zero bandwidth and zero audio file
                    downloads.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ToolPageShell>
    );
}


