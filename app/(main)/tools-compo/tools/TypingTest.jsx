"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Keyboard as KeyboardIcon,
  Volume2,
  VolumeX,
  RotateCcw,
  Award,
  Download,
  Sparkles,
  Clock,
  Settings,
  Flame,
  ShieldAlert,
  Moon,
  Sun,
  History,
  User,
  Copy,
  Check,
  CheckCircle2,
  ChevronDown,
  Info
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { cn } from "@/lib/utils";

// Dictionary lists for classic modes
const STANDARD_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "create", "design", "code", "develop", "system", "program", "function", "variable", "object", "array",
  "string", "number", "boolean", "async", "await", "import", "export", "class", "style", "page",
  "web", "app", "online", "tool", "site", "speed", "test", "type", "keyboard", "input",
  "react", "next", "state", "effect", "render", "hook", "context", "props", "event", "click",
  "sound", "theme", "color", "canvas", "image", "file", "download", "share", "stats", "chart",
  "heatmap", "wpm", "accuracy", "error", "zen", "mode", "sudden", "death", "trial", "limit",
  "time", "word", "character", "index", "current", "target", "correct", "wrong", "missed", "active",
  "gold", "silver", "neon", "cyber", "terminal", "retro", "emerald", "obsidian", "lavender", "cosmic",
  "prestige", "classic", "modern", "clean", "beautiful", "smooth", "animate", "transition", "glow", "shadow"
];

// Code snippets by language
const CODE_SNIPPETS = {
  javascript: [
    "const calculateWpm = (chars, time) => {\n  const words = chars / 5;\n  return Math.round(words / (time / 60));\n};",
    "useEffect(() => {\n  const handleKeyDown = (e) => {\n    if (e.key === 'Backspace') {\n      handleBackspace();\n    }\n  };\n  window.addEventListener('keydown', handleKeyDown);\n  return () => window.removeEventListener('keydown', handleKeyDown);\n}, [index]);",
    "const getAudioCtx = () => {\n  if (!audioCtx) {\n    audioCtx = new AudioContext();\n  }\n  return audioCtx;\n};",
    "const downloadPng = () => {\n  const canvas = canvasRef.current;\n  const dataUrl = canvas.toDataURL('image/png');\n  const link = document.createElement('a');\n  link.download = 'certificate.png';\n  link.href = dataUrl;\n  link.click();\n};"
  ],
  html: [
    "<div className=\"flex flex-col gap-4 p-6\">\n  <h1 className=\"text-2xl font-bold\">Typing Test</h1>\n  <p className=\"text-slate-500\">Test your speed!</p>\n  <button onClick={resetTest}>Reset</button>\n</div>",
    "<section className=\"tool-page-shell\">\n  <div className=\"max-w-7xl mx-auto px-4\">\n    <header className=\"text-center mb-8\">\n      <h2>Speed Typing Challenge</h2>\n    </header>\n  </div>\n</section>"
  ],
  css: [
    ".typing-caret {\n  width: 2px;\n  height: 1.2em;\n  background-color: var(--cursor);\n  animation: blink 1s infinite;\n}",
    "@keyframes blink {\n  0%, 100% { opacity: 1; }\n  50% { opacity: 0; }\n}",
    ".keyboard-key {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 0.375rem;\n  transition: all 0.1s ease;\n}"
  ]
};

// Available Themes mapping
const THEMES = {
  slate: {
    id: "slate",
    name: "Dark Slate",
    bg: "bg-slate-950 text-slate-100 border-slate-800",
    textMuted: "text-slate-500",
    textTyped: "text-emerald-400",
    textWrong: "text-rose-500 bg-rose-500/10 border-rose-500/30",
    cursor: "bg-emerald-400",
    panel: "bg-slate-900/40 border-slate-800",
    accent: "text-emerald-400 border-emerald-500/30",
    btn: "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800",
    btnActive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    bg: "bg-zinc-950 text-yellow-400 border-yellow-500/10",
    textMuted: "text-yellow-800",
    textTyped: "text-cyan-400",
    textWrong: "text-pink-500 bg-pink-950/20 border-pink-500/30",
    cursor: "bg-cyan-400",
    panel: "bg-black/40 border-yellow-500/20",
    accent: "text-cyan-400 border-cyan-500/30",
    btn: "bg-zinc-900 hover:bg-zinc-800 text-yellow-500 border-yellow-500/20",
    btnActive: "bg-cyan-500/10 text-cyan-400 border-cyan-500/40",
  },
  terminal: {
    id: "terminal",
    name: "Retro Terminal",
    bg: "bg-black text-green-500 border-green-950 font-mono",
    textMuted: "text-green-900",
    textTyped: "text-green-400 font-bold drop-shadow-[0_0_2px_rgba(74,222,128,0.5)]",
    textWrong: "text-red-500 bg-red-950/20 border-red-500/30",
    cursor: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse",
    panel: "bg-black border-green-950",
    accent: "text-green-400 border-green-500/30",
    btn: "bg-neutral-950 hover:bg-neutral-900 text-green-500 border-green-950",
    btnActive: "bg-green-500/10 text-green-400 border-green-500/40",
  },
  lavender: {
    id: "lavender",
    name: "Lavender Dream",
    bg: "bg-indigo-950/90 text-purple-200 border-purple-900/30",
    textMuted: "text-indigo-500",
    textTyped: "text-fuchsia-300",
    textWrong: "text-rose-400 bg-rose-950/20 border-rose-400/30",
    cursor: "bg-fuchsia-300",
    panel: "bg-indigo-950/40 border-purple-900/20",
    accent: "text-fuchsia-300 border-fuchsia-400/30",
    btn: "bg-indigo-950 hover:bg-indigo-900 text-purple-300 border-purple-900/30",
    btnActive: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/40",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Prestige",
    bg: "bg-stone-950 text-stone-100 border-stone-850",
    textMuted: "text-stone-600",
    textTyped: "text-amber-400",
    textWrong: "text-rose-500 bg-rose-950/20 border-rose-500/30",
    cursor: "bg-amber-400",
    panel: "bg-stone-900/40 border-stone-800",
    accent: "text-amber-400 border-amber-500/30",
    btn: "bg-stone-900 hover:bg-stone-850 text-stone-300 border-stone-800",
    btnActive: "bg-amber-500/10 text-amber-400 border-amber-500/40",
  },
};

// Keyboard mechanical layout configuration
const KEYBOARD_ROWS = [
  [
    { key: "q", label: "Q" }, { key: "w", label: "W" }, { key: "e", label: "E" },
    { key: "r", label: "R" }, { key: "t", label: "T" }, { key: "y", label: "Y" },
    { key: "u", label: "U" }, { key: "i", label: "I" }, { key: "o", label: "O" },
    { key: "p", label: "P" }, { key: "[", label: "{" }, { key: "]", label: "}" }
  ],
  [
    { key: "a", label: "A" }, { key: "s", label: "S" }, { key: "d", label: "D" },
    { key: "f", label: "F" }, { key: "g", label: "G" }, { key: "h", label: "H" },
    { key: "j", label: "J" }, { key: "k", label: "K" }, { key: "l", label: "L" },
    { key: ";", label: ":" }, { key: "'", label: '"' }
  ],
  [
    { key: "z", label: "Z" }, { key: "x", label: "X" }, { key: "c", label: "C" },
    { key: "v", label: "V" }, { key: "b", label: "B" }, { key: "n", label: "N" },
    { key: "m", label: "M" }, { key: ",", label: "<" }, { key: ".", label: ">" },
    { key: "/", label: "?" }
  ],
  [
    { key: "space", label: "Spacebar", isSpace: true }
  ]
];

// Lazy Audio Context Initializer
let audioCtx = null;
const getAudioCtx = () => {
  if (!audioCtx && typeof window !== "undefined") {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

// Web Audio API Sound Synthesizer function
const playClickSound = (soundProfile, isSpace = false) => {
  if (soundProfile === "silent") return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (soundProfile === "mechanical") {
      // Mechanical switch simulator (click & clack)
      const isIncorrect = soundProfile === "error";
      osc.type = "triangle";
      
      const pitch = isSpace ? 150 : 280 + Math.random() * 80;
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch / 2, ctx.currentTime + 0.03);
      
      gain.gain.setValueAtTime(isSpace ? 0.35 : 0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (soundProfile === "bubble") {
      // Water bubble pop
      osc.type = "sine";
      const pitch = isSpace ? 400 : 700 + Math.random() * 300;
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 2.2, ctx.currentTime + 0.06);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } else if (soundProfile === "beep") {
      // Retro synthetic beep
      osc.type = "sine";
      osc.frequency.setValueAtTime(isSpace ? 600 : 980, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (soundProfile === "error") {
      // Warning detuned buzz
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.14);
      
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    console.warn("Audio Context synthesis failure:", e);
  }
};

// Beautiful Glassmorphic Custom Dropdown Component
function CustomDropdown({ label, icon: Icon, value, options, onChange, themeClass }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = useMemo(() => {
    return options.find(opt => opt.value === value) || options[0];
  }, [options, value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm duration-200 cursor-pointer min-w-[125px]",
          themeClass
        )}
      >
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
          <span>{selectedOption?.label}</span>
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-lg shadow-xl border bg-slate-900 border-slate-800 text-slate-100 z-50 overflow-hidden transform origin-top-right transition-all duration-200">
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center w-full px-4 py-2 text-xs text-left transition-colors cursor-pointer",
                  value === option.value
                    ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Certificate Drawing Utility
const drawCertificate = (canvas, name, wpm, accuracy, date, theme, certId) => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.clearRect(0, 0, w, h);
  
  if (theme === "classic") {
    // Ivory / Gold
    ctx.fillStyle = "#FDFBF7";
    ctx.fillRect(0, 0, w, h);
    
    ctx.strokeStyle = "#C5A880";
    ctx.lineWidth = 14;
    ctx.strokeRect(15, 15, w - 30, h - 30);
    
    ctx.strokeStyle = "#8A6D3B";
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, w - 52, h - 52);
    
    ctx.fillStyle = "#8A6D3B";
    ctx.fillRect(15, 15, 30, 30);
    ctx.fillRect(w - 45, 15, 30, 30);
    ctx.fillRect(15, h - 45, 30, 30);
    ctx.fillRect(w - 45, h - 45, 30, 30);
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#333333";
    ctx.font = "italic bold 16px Georgia, serif";
    ctx.fillText("T O O L S T R E K   T Y P I N G   A C A D E M Y", w / 2, 85);
    
    ctx.fillStyle = "#8A6D3B";
    ctx.font = "bold 34px Georgia, serif";
    ctx.fillText("CERTIFICATE OF ACHIEVEMENT", w / 2, 135);
    
    ctx.fillStyle = "#666666";
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText("THIS IS PROUDLY PRESENTED TO", w / 2, 190);
    
    ctx.fillStyle = "#1E1E1E";
    ctx.font = "italic bold 40px Georgia, serif";
    ctx.fillText(name || "Eminent Typist", w / 2, 255);
    
    ctx.strokeStyle = "#8A6D3B";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 200, 275);
    ctx.lineTo(w / 2 + 200, 275);
    ctx.stroke();
    
    ctx.fillStyle = "#444444";
    ctx.font = "16px Georgia, serif";
    ctx.fillText("for successfully demonstrating exceptional keyboard proficiency", w / 2, 320);
    ctx.fillText("in the Speed Typing Challenge. Recording performance metrics of:", w / 2, 345);
    
    // Stats
    ctx.fillStyle = "#F7F5EE";
    ctx.fillRect(w / 2 - 180, 375, 360, 75);
    ctx.strokeStyle = "#E0DACB";
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 180, 375, 360, 75);
    
    ctx.fillStyle = "#8A6D3B";
    ctx.font = "bold 26px Arial, sans-serif";
    ctx.fillText(`${wpm} WPM`, w / 2 - 90, 415);
    ctx.fillStyle = "#666666";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText("TYPING SPEED", w / 2 - 90, 435);
    
    ctx.fillStyle = "#8A6D3B";
    ctx.font = "bold 26px Arial, sans-serif";
    ctx.fillText(`${accuracy}%`, w / 2 + 90, 415);
    ctx.fillStyle = "#666666";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText("ACCURACY RATE", w / 2 + 90, 435);
    
    ctx.beginPath();
    ctx.moveTo(w / 2, 385);
    ctx.lineTo(w / 2, 440);
    ctx.stroke();
    
    ctx.fillStyle = "#666666";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText(`Date: ${date}`, w / 2 - 180, 500);
    ctx.fillText(`Certificate ID: ${certId}`, w / 2 - 180, 520);
    
    // Seal
    ctx.save();
    ctx.translate(w / 2 + 180, 505);
    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8A6D3B";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial, sans-serif";
    ctx.fillText("★", 0, 6);
    ctx.restore();
    
    // Sign
    ctx.fillStyle = "#1E1E1E";
    ctx.font = "italic 20px 'Georgia', serif";
    ctx.fillText("ToolsTrek Verification", w / 2 + 180, 485);
    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 + 100, 490);
    ctx.lineTo(w / 2 + 260, 490);
    ctx.stroke();
    ctx.fillStyle = "#666666";
    ctx.font = "9px Arial, sans-serif";
    ctx.fillText("AUTHORIZED SIGNATURE", w / 2 + 180, 505);
    
  } else if (theme === "cyberpunk") {
    // Cyber Neon
    ctx.fillStyle = "#0A0A0F";
    ctx.fillRect(0, 0, w, h);
    
    ctx.strokeStyle = "#1A1A2F";
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 35) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let j = 0; j < h; j += 35) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(w, j);
      ctx.stroke();
    }
    
    ctx.strokeStyle = "#FF007F";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.strokeStyle = "#00F0FF";
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, w - 52, h - 52);
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#00F0FF";
    ctx.font = "bold 13px monospace";
    ctx.fillText("// SECURE NEURAL INTERFACE STATUS: VERIFIED", w / 2, 75);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px 'Arial Black', sans-serif";
    ctx.fillText("TYPING LICENSE CERTIFICATION", w / 2, 130);
    
    ctx.fillStyle = "#FF007F";
    ctx.font = "bold 12px monospace";
    ctx.fillText("ISSUED TO AGENT", w / 2, 185);
    
    ctx.fillStyle = "#00F0FF";
    ctx.font = "bold 36px monospace";
    ctx.fillText(`[ ${name.toUpperCase() || "AGENT_UNKNOWN"} ]`, w / 2, 245);
    
    ctx.fillStyle = "#8E8EA8";
    ctx.font = "14px monospace";
    ctx.fillText("Subject has successfully executed high-speed terminal key entries", w / 2, 305);
    ctx.fillText("achieving computational throughput benchmarks:", w / 2, 330);
    
    ctx.fillStyle = "rgba(0, 240, 255, 0.05)";
    ctx.fillRect(w / 2 - 200, 365, 400, 90);
    ctx.strokeStyle = "#00F0FF";
    ctx.strokeRect(w / 2 - 200, 365, 400, 90);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 30px 'Arial Black', sans-serif";
    ctx.fillText(`${wpm} WPM`, w / 2 - 100, 415);
    ctx.fillStyle = "#00F0FF";
    ctx.font = "10px monospace";
    ctx.fillText("DATA TRANSMISSION RATE", w / 2 - 100, 435);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 30px 'Arial Black', sans-serif";
    ctx.fillText(`${accuracy}%`, w / 2 + 100, 415);
    ctx.fillStyle = "#FF007F";
    ctx.font = "10px monospace";
    ctx.fillText("ACCURACY RATING", w / 2 + 100, 435);
    
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
    ctx.moveTo(w / 2, 375);
    ctx.lineTo(w / 2, 445);
    ctx.stroke();
    
    ctx.fillStyle = "#FF007F";
    ctx.font = "11px monospace";
    ctx.fillText(`TIMESTAMP: ${date}`, w / 2 - 190, 500);
    ctx.fillText(`LICENSE_ID: ${certId}`, w / 2 - 190, 520);
    
    ctx.fillStyle = "#00F0FF";
    ctx.font = "bold 13px monospace";
    ctx.fillText("SYSTEM_AUTH: SIGNED", w / 2 + 170, 490);
    ctx.font = "9px monospace";
    ctx.fillStyle = "#8E8EA8";
    ctx.fillText("HASH VERIFICATION HASH", w / 2 + 170, 510);
    ctx.fillText("EF" + certId.slice(7), w / 2 + 170, 525);
    
  } else if (theme === "emerald") {
    // Jade Green Luxury
    ctx.fillStyle = "#062217";
    ctx.fillRect(0, 0, w, h);
    
    ctx.strokeStyle = "#BF953F";
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, w - 30, h - 30);
    
    ctx.strokeStyle = "#0E4E35";
    ctx.lineWidth = 3;
    ctx.strokeRect(25, 25, w - 50, h - 50);
    
    ctx.fillStyle = "#BF953F";
    ctx.fillRect(15, 15, 40, 5);
    ctx.fillRect(15, 15, 5, 40);
    ctx.fillRect(w - 55, 15, 40, 5);
    ctx.fillRect(w - 20, 15, 5, 40);
    ctx.fillRect(15, h - 20, 40, 5);
    ctx.fillRect(15, h - 55, 5, 40);
    ctx.fillRect(w - 55, h - 20, 40, 5);
    ctx.fillRect(w - 20, h - 55, 5, 40);
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#BF953F";
    ctx.font = "bold 14px Georgia, serif";
    ctx.fillText("P R E S T I G E   K E Y B O A R D   S O C I E T Y", w / 2, 85);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px 'Georgia', serif";
    ctx.fillText("CERTIFICATE OF EXCELLENCE", w / 2, 135);
    
    ctx.fillStyle = "#8CAE9E";
    ctx.font = "italic 15px Georgia, serif";
    ctx.fillText("is hereby awarded to", w / 2, 190);
    
    ctx.fillStyle = "#BF953F";
    ctx.font = "italic bold 40px 'Georgia', serif";
    ctx.fillText(name || "Eminent Typist", w / 2, 250);
    
    ctx.fillStyle = "#D4E2DB";
    ctx.font = "15px Georgia, serif";
    ctx.fillText("for registering outstanding performance and rapid speed metrics", w / 2, 310);
    ctx.fillText("in the professional typing speed assessment program.", w / 2, 335);
    
    ctx.fillStyle = "rgba(191, 149, 63, 0.08)";
    ctx.fillRect(w / 2 - 180, 370, 360, 80);
    ctx.strokeStyle = "#BF953F";
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 180, 370, 360, 80);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText(`${wpm} WPM`, w / 2 - 90, 412);
    ctx.fillStyle = "#BF953F";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText("ASSESSMENT SPEED", w / 2 - 90, 432);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText(`${accuracy}%`, w / 2 + 90, 412);
    ctx.fillStyle = "#BF953F";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText("ACCURACY INDEX", w / 2 + 90, 432);
    
    ctx.beginPath();
    ctx.strokeStyle = "rgba(191, 149, 63, 0.3)";
    ctx.moveTo(w / 2, 380);
    ctx.lineTo(w / 2, 440);
    ctx.stroke();
    
    ctx.fillStyle = "#8CAE9E";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText(`Issued: ${date}`, w / 2 - 180, 500);
    ctx.fillText(`Verification: ${certId}`, w / 2 - 180, 520);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillText("ToolsTrek Registry", w / 2 + 180, 490);
    ctx.strokeStyle = "#BF953F";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 + 100, 495);
    ctx.lineTo(w / 2 + 260, 495);
    ctx.stroke();
    ctx.fillStyle = "#BF953F";
    ctx.font = "9px Arial, sans-serif";
    ctx.fillText("VERIFYING OFFICIAL", w / 2 + 180, 510);
    
  } else {
    // Cosmic Lavender
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#191535");
    grad.addColorStop(1, "#36214C");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc((i * 197) % w, (i * 123) % h, (i % 3) + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 12;
    ctx.strokeRect(15, 15, w - 30, h - 30);
    ctx.strokeStyle = "#C084FC";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26, 26, w - 52, h - 52);
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#E9D5FF";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("★   T Y P I N G   F L U E N C Y   C E R T I F I C A T E   ★", w / 2, 85);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px 'Arial Black', sans-serif";
    ctx.fillText("CERTIFICATE OF COMPLETION", w / 2, 135);
    
    ctx.fillStyle = "#D8B4FE";
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText("This is to verify that the following user completed the challenge", w / 2, 185);
    
    ctx.fillStyle = "#F5F3FF";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(name.toUpperCase() || "COSMIC TYPIST", w / 2, 245);
    
    ctx.strokeStyle = "#C084FC";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 150, 265);
    ctx.lineTo(w / 2 + 150, 265);
    ctx.stroke();
    
    ctx.fillStyle = "#E9D5FF";
    ctx.font = "15px Arial, sans-serif";
    ctx.fillText("for demonstrating high speed keyboarding abilities under cosmic criteria.", w / 2, 315);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(w / 2 - 180, 365, 360, 85);
    ctx.strokeStyle = "rgba(192, 132, 252, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w / 2 - 180, 365, 360, 85);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px Arial, sans-serif";
    ctx.fillText(`${wpm} WPM`, w / 2 - 90, 412);
    ctx.fillStyle = "#D8B4FE";
    ctx.font = "10px Arial, sans-serif";
    ctx.fillText("WORDS PER MINUTE", w / 2 - 90, 432);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px Arial, sans-serif";
    ctx.fillText(`${accuracy}%`, w / 2 + 90, 412);
    ctx.fillStyle = "#D8B4FE";
    ctx.font = "10px Arial, sans-serif";
    ctx.fillText("ACCURACY LEVEL", w / 2 + 90, 432);
    
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.moveTo(w / 2, 375);
    ctx.lineTo(w / 2, 440);
    ctx.stroke();
    
    ctx.fillStyle = "#D8B4FE";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText(`Assessment Date: ${date}`, w / 2 - 180, 500);
    ctx.fillText(`Security Verification ID: ${certId}`, w / 2 - 180, 520);
    
    ctx.fillStyle = "#F5F3FF";
    ctx.font = "italic 20px Georgia, serif";
    ctx.fillText("ToolsTrek Evaluator", w / 2 + 180, 485);
    ctx.strokeStyle = "#C084FC";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 + 100, 490);
    ctx.lineTo(w / 2 + 260, 490);
    ctx.stroke();
    ctx.fillStyle = "#D8B4FE";
    ctx.font = "9px Arial, sans-serif";
    ctx.fillText("AUTHORIZED SEAL", w / 2 + 180, 505);
  }
};

export default function TypingTest() {
  // Option selection states
  const [mode, setMode] = useState("time"); // time | words | sudden | zen | code
  const [timeLimit, setTimeLimit] = useState(30); // 15 | 30 | 60
  const [wordLimit, setWordLimit] = useState(25); // 10 | 25 | 50
  const [codeLang, setCodeLang] = useState("javascript"); // javascript | html | css
  const [soundProfile, setSoundProfile] = useState("mechanical"); // mechanical | bubble | beep | silent
  const [themeId, setThemeId] = useState("slate"); // slate | cyberpunk | terminal | lavender | emerald

  // Typing engine states
  const [textToType, setTextToType] = useState("");
  const [currCharIndex, setCurrCharIndex] = useState(0);
  const [isCharCorrect, setIsCharCorrect] = useState([]);
  const [testStatus, setTestStatus] = useState("idle"); // idle | typing | completed | failed
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [wpmHistory, setWpmHistory] = useState([]);
  
  // Audio state
  const [audioMuted, setAudioMuted] = useState(false);

  // Key-by-key stats
  const [keyStats, setKeyStats] = useState({}); // { 'a': { totalTime: 1200, count: 4, errors: 1 } }
  const [activeKeys, setActiveKeys] = useState({}); // { 'a': true }
  const [lastKeyPressTime, setLastKeyPressTime] = useState(null);
  
  // Results
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);

  // Certificate customization states
  const [certificateName, setCertificateName] = useState("");
  const [certTheme, setCertTheme] = useState("classic"); // classic | cyberpunk | emerald | cosmic
  const [certId, setCertId] = useState("");
  
  // High scores in localStorage
  const [highScores, setHighScores] = useState([]);

  // Client-only state to track focus and avoid hydration mismatches
  const [isFocused, setIsFocused] = useState(false);

  // Refs
  const typingAreaRef = useRef(null);
  const canvasRef = useRef(null);
  const timerIntervalRef = useRef(null);
  // Timestamp ref for precise elapsed time (avoids stale state in closures)
  const startTimeRef = useRef(null);
  // Mirror refs for always-current values inside interval/callback closures
  const correctCharsRef = useRef(0);
  const currCharIndexRef = useRef(0);
  const isCharCorrectRef = useRef([]);
  // Timestamps of each correctly-typed char for rolling-window WPM (industry standard)
  const correctCharTimestampsRef = useRef([]);
  // EMA ref for smoothing live WPM display
  const smoothedWpmRef = useRef(0);

  // Active styles based on theme selection
  const theme = useMemo(() => THEMES[themeId], [themeId]);

  // Load High Scores on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("toolstrek_typing_highscores");
      if (stored) {
        try {
          setHighScores(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse high scores", e);
        }
      }
    }
  }, []);

  // Save high scores to state and storage
  const saveHighScore = (wpm, accuracy) => {
    if (typeof window === "undefined") return;
    const newScore = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString(),
      wpm,
      accuracy,
      mode: `${mode} (${mode === "time" ? timeLimit + "s" : mode === "words" ? wordLimit + "w" : mode === "code" ? codeLang : mode})`,
    };
    
    const updated = [newScore, ...highScores].slice(0, 5); // Keep top 5
    setHighScores(updated);
    localStorage.setItem("toolstrek_typing_highscores", JSON.stringify(updated));
  };

  // Generate words to type
  const generateText = useCallback(() => {
    if (mode === "code") {
      const list = CODE_SNIPPETS[codeLang];
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    }
    
    // Choose length
    let count = 40;
    if (mode === "words") count = wordLimit;
    else if (mode === "time") count = timeLimit * 3.5; // roughly estimate density
    else if (mode === "sudden") count = 30; // short for sudden death
    else if (mode === "zen") count = 100; // start size
    
    const selected = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * STANDARD_WORDS.length);
      selected.push(STANDARD_WORDS[randomIndex]);
    }
    return selected.join(" ");
  }, [mode, timeLimit, wordLimit, codeLang]);

  // Reset the Typing Test
  const resetTest = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    // Reset all refs
    startTimeRef.current = null;
    correctCharsRef.current = 0;
    currCharIndexRef.current = 0;
    isCharCorrectRef.current = [];
    correctCharTimestampsRef.current = [];
    smoothedWpmRef.current = 0;

    const text = generateText();
    setTextToType(text);
    setCurrCharIndex(0);
    setIsCharCorrect(new Array(text.length).fill(null));
    setTestStatus("idle");
    setTimeRemaining(mode === "time" ? timeLimit : 0);
    setTimeElapsed(0);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setWpmHistory([]);
    setKeyStats({});
    setActiveKeys({});
    setLastKeyPressTime(null);
    setTotalErrors(0);
    setFinalWpm(0);
    setFinalAccuracy(0);
    
    // Refocus
    setTimeout(() => {
      if (typingAreaRef.current) {
        typingAreaRef.current.focus();
      }
    }, 50);
  }, [generateText, mode, timeLimit]);

  // Re-generate text when modes change
  useEffect(() => {
    resetTest();
  }, [mode, timeLimit, wordLimit, codeLang, resetTest]);

  // End assessment calculations — reads from refs to get always-current values
  const completeTest = useCallback((isImmediateFail = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (isImmediateFail) {
      setTestStatus("failed");
      setFinalWpm(0);
      setFinalAccuracy(0);
      return;
    }

    // Use refs for current values — not stale state
    const totalCharsTyped = currCharIndexRef.current;
    const correctChars = correctCharsRef.current;
    // Precise elapsed time from start timestamp
    const elapsedMs = startTimeRef.current ? Date.now() - startTimeRef.current : 1000;
    const finalTimeSec = Math.max(elapsedMs / 1000, 1);

    let wpm = 0;
    let acc = 0;

    if (totalCharsTyped > 0) {
      // Standard: WPM = (correct characters / 5) / (time in minutes)
      wpm = Math.round((correctChars / 5) / (finalTimeSec / 60));
      acc = Math.round((correctChars / totalCharsTyped) * 100);
    }

    setFinalWpm(wpm);
    setFinalAccuracy(acc);
    setTestStatus("completed");
    
    // Generate Certification ID
    const randomHash = "TT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setCertId(randomHash);
    
    // Save to high score board
    saveHighScore(wpm, acc);

    // Play completion sound
    playClickSound("beep");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, timeLimit, wordLimit, codeLang, highScores]);

  // Handle timer tick — reads from refs, 5-second rolling window WPM
  useEffect(() => {
    if (testStatus === "typing") {
      // Track the last whole second we recorded for sparkline / countdown
      let lastRecordedSec = -1;

      timerIntervalRef.current = setInterval(() => {
        if (!startTimeRef.current) return;

        const now = Date.now();
        const elapsedMs = now - startTimeRef.current;
        const elapsedSec = elapsedMs / 1000;
        const flooredSec = Math.floor(elapsedSec);

        // Update elapsed display every tick (smooth)
        setTimeElapsed(flooredSec);

        // --- Rolling 5-second window WPM (industry standard) ---
        // Purge timestamps older than 5 seconds
        const windowMs = 5000;
        const cutoff = now - windowMs;
        correctCharTimestampsRef.current = correctCharTimestampsRef.current.filter(
          (t) => t >= cutoff
        );
        const charsInWindow = correctCharTimestampsRef.current.length;
        // Use the smaller of elapsed time or 5s window for the denominator
        const windowSec = Math.min(elapsedSec, windowMs / 1000);
        let rawWpm = 0;
        if (windowSec >= 1) {
          rawWpm = Math.round((charsInWindow / 5) / (windowSec / 60));
        } else if (elapsedSec >= 0.5 && correctCharsRef.current > 0) {
          // Fallback for the first second: cumulative
          rawWpm = Math.round((correctCharsRef.current / 5) / (elapsedSec / 60));
        }

        // EMA smoothing: blend 70% previous + 30% new (stable, not sluggish)
        const smoothed = elapsedSec < 2
          ? rawWpm // no smoothing for the first 2s
          : Math.round(smoothedWpmRef.current * 0.7 + rawWpm * 0.3);
        smoothedWpmRef.current = smoothed;
        setLiveWpm(smoothed);

        // Only record sparkline + decrement countdown once per full second
        if (flooredSec > lastRecordedSec) {
          lastRecordedSec = flooredSec;
          setWpmHistory(hist => [...hist, smoothed]);

          if (mode === "time") {
            setTimeRemaining(prev => {
              if (prev <= 1) {
                completeTest();
                return 0;
              }
              return prev - 1;
            });
          }
        }
      }, 250); // 250ms tick for snappy display
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testStatus, mode, completeTest]);

  // Core typing key input listener
  const handleKeyDown = (e) => {
    // Avoid interrupting default actions unless we are actively typing
    if (testStatus === "completed" || testStatus === "failed") return;

    // Focus validation
    if (document.activeElement !== typingAreaRef.current) {
      return;
    }

    const key = e.key;

    // Block Tab from stealing focus
    if (key === "Tab") {
      e.preventDefault();
      return;
    }

    // Visual active key mapping
    const keyLower = key.toLowerCase();
    setActiveKeys(prev => ({ ...prev, [keyLower]: true }));

    // Start timer on first keypress — record exact start timestamp in ref
    if (testStatus === "idle" && key.length === 1) {
      startTimeRef.current = Date.now();
      setTestStatus("typing");
      setLastKeyPressTime(Date.now());
    }

    // 1. Backspace logic
    if (key === "Backspace") {
      e.preventDefault();
      if (currCharIndex === 0) return;
      
      const prevIndex = currCharIndex - 1;
      
      // If erasing a correct character: decrement ref + remove its timestamp
      if (isCharCorrectRef.current[prevIndex] === true) {
        correctCharsRef.current = Math.max(0, correctCharsRef.current - 1);
        // Remove the most recent correct-char timestamp (the one we're un-typing)
        correctCharTimestampsRef.current.pop();
      }
      // Clear the ref slot and update index ref
      isCharCorrectRef.current[prevIndex] = null;
      currCharIndexRef.current = prevIndex;

      setCurrCharIndex(prevIndex);
      setIsCharCorrect(arr => {
        const newArr = [...arr];
        newArr[prevIndex] = null;
        return newArr;
      });

      // Recompute live accuracy
      if (prevIndex > 0) {
        setLiveAccuracy(Math.round((correctCharsRef.current / prevIndex) * 100));
      } else {
        setLiveAccuracy(100);
      }
      
      if (!audioMuted) {
        playClickSound(soundProfile === "silent" ? "silent" : "mechanical", false);
      }
      return;
    }

    // 2. Character validation
    if (key.length === 1 || key === "Enter") {
      e.preventDefault();
      
      let typedChar = key;
      if (key === "Enter") {
        typedChar = "\n";
      }

      const targetChar = textToType[currCharIndex];
      const isCorrect = typedChar === targetChar;

      // Update character states
      setIsCharCorrect(arr => {
        const newArr = [...arr];
        newArr[currCharIndex] = isCorrect;
        return newArr;
      });

      // Keep mirror refs in sync for use in interval/callback closures
      const nextIdx = currCharIndex + 1;
      currCharIndexRef.current = nextIdx;
      isCharCorrectRef.current[currCharIndex] = isCorrect;
      if (isCorrect) {
        correctCharsRef.current = correctCharsRef.current + 1;
        // Record timestamp for rolling-window WPM
        correctCharTimestampsRef.current.push(Date.now());
      }

      // Update live accuracy on every keystroke (no expensive .filter())
      if (nextIdx > 0) {
        const acc = Math.round((correctCharsRef.current / nextIdx) * 100);
        setLiveAccuracy(acc);
      }

      // Sound play
      if (!audioMuted) {
        if (isCorrect) {
          playClickSound(soundProfile, typedChar === " ");
        } else {
          playClickSound("error", false);
        }
      }

      // Track key metrics
      const now = Date.now();
      const timeDiff = lastKeyPressTime ? now - lastKeyPressTime : 0;
      setLastKeyPressTime(now);

      const targetCharLower = targetChar?.toLowerCase();
      if (targetCharLower) {
        setKeyStats(prev => {
          const stats = prev[targetCharLower] || { totalTime: 0, count: 0, errors: 0 };
          return {
            ...prev,
            [targetCharLower]: {
              totalTime: stats.totalTime + (isCorrect && timeDiff > 0 && timeDiff < 2000 ? timeDiff : 250),
              count: stats.count + (isCorrect ? 1 : 0),
              errors: stats.errors + (isCorrect ? 0 : 1)
            }
          };
        });
      }

      if (!isCorrect) {
        setTotalErrors(prev => prev + 1);
        
        // Sudden Death check
        if (mode === "sudden") {
          completeTest(true);
          return;
        }
      }

      // Increment position
      const nextIndex = currCharIndex + 1;
      setCurrCharIndex(nextIndex);

      // Check if finished
      if (nextIndex >= textToType.length) {
        if (mode === "zen") {
          // Zen mode append more words
          const extraText = " " + generateText();
          setTextToType(prev => prev + extraText);
          setIsCharCorrect(arr => [...arr, ...new Array(extraText.length).fill(null)]);
        } else {
          completeTest();
        }
      }
    }
  };

  const handleKeyUp = (e) => {
    const keyLower = e.key.toLowerCase();
    setActiveKeys(prev => ({ ...prev, [keyLower]: false }));
  };

  // Re-draw canvas certificate when variables update
  useEffect(() => {
    if (testStatus === "completed" && canvasRef.current) {
      const today = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      drawCertificate(
        canvasRef.current,
        certificateName,
        finalWpm,
        finalAccuracy,
        today,
        certTheme,
        certId
      );
    }
  }, [testStatus, certificateName, certTheme, finalWpm, finalAccuracy, certId]);

  // Download certificate PNG helper
  const handleDownloadCertificate = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `ToolsTrek-Typing-Cert-${certificateName.replace(/\s+/g, "-") || "Typist"}.png`;
    link.href = url;
    link.click();
  };

  // Weakest Keys calculator
  const weakestKeys = useMemo(() => {
    if (Object.keys(keyStats).length === 0) return [];
    
    return Object.entries(keyStats)
      .map(([keyName, data]) => {
        const avgSpeed = data.count > 0 ? Math.round(data.totalTime / data.count) : 0;
        const accuracy = (data.count / (data.count + data.errors)) * 100 || 0;
        return { keyName, avgSpeed, accuracy, errors: data.errors };
      })
      // Sort by accuracy ascending, then speed descending (slowest)
      .sort((a, b) => {
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
        return b.avgSpeed - a.avgSpeed;
      })
      .filter(item => item.errors > 0 || item.avgSpeed > 300) // only include keys with issues
      .slice(0, 3);
  }, [keyStats]);

  // Clean layout mode options
  const modeOptions = [
    { value: "time", label: "⏱ Time Trial" },
    { value: "words", label: "📝 Word Count" },
    { value: "sudden", label: "💀 Sudden Death" },
    { value: "code", label: "💻 Code Snippet" },
    { value: "zen", label: "🧘 Zen Mode" },
  ];

  const soundOptions = [
    { value: "mechanical", label: "Mechanical" },
    { value: "bubble", label: "Bubble Pop" },
    { value: "beep", label: "Retro Beep" },
    { value: "silent", label: "Silent" },
  ];

  const themeOptions = [
    { value: "slate", label: "Dark Slate" },
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "terminal", label: "Retro Terminal" },
    { value: "lavender", label: "Lavender Dream" },
    { value: "emerald", label: "Emerald Prestige" },
  ];

  const codeLangOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "html", label: "HTML Structure" },
    { value: "css", label: "CSS Styling" },
  ];

  // SVG speed chart renderer
  const sparklinePoints = useMemo(() => {
    if (wpmHistory.length < 2) return "";
    const w = 500;
    const h = 100;
    const padding = 15;
    const max = Math.max(...wpmHistory, 60);
    const min = Math.min(...wpmHistory, 0);
    const range = max - min || 1;
    
    return wpmHistory.map((val, idx) => {
      const x = padding + (idx / (wpmHistory.length - 1)) * (w - 2 * padding);
      const y = h - padding - ((val - min) / range) * (h - 2 * padding);
      return `${x},${y}`;
    }).join(" ");
  }, [wpmHistory]);

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-emerald-400">
              Interactive Typing Test
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Analyze speed, map your key latency heatmap, and download a custom credentials certificate.
            </p>
          </div>

          {/* Settings Control Panel with relative z-30 to overlay absolute dropdowns */}
          <div className="flex flex-wrap items-center justify-center gap-2 bg-white/50 dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm relative z-30">
            
            {/* Mode Select */}
            <CustomDropdown
              label="Mode"
              icon={KeyboardIcon}
              value={mode}
              options={modeOptions}
              onChange={(val) => {
                setMode(val);
                if (val === "time") setTimeRemaining(timeLimit);
              }}
              themeClass="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
            />

            {/* Time Trials values */}
            {mode === "time" && (
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
                {[15, 30, 60].map(sec => (
                  <button
                    key={sec}
                    onClick={() => {
                      setTimeLimit(sec);
                      setTimeRemaining(sec);
                    }}
                    className={cn(
                      "px-2 py-1 text-2xs font-semibold rounded cursor-pointer transition-all",
                      timeLimit === sec
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    )}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            )}

            {/* Word Limits values */}
            {mode === "words" && (
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
                {[10, 25, 50].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setWordLimit(cnt)}
                    className={cn(
                      "px-2 py-1 text-2xs font-semibold rounded cursor-pointer transition-all",
                      wordLimit === cnt
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    )}
                  >
                    {cnt}w
                  </button>
                ))}
              </div>
            )}

            {/* Coding Snippets Language values */}
            {mode === "code" && (
              <CustomDropdown
                label="Language"
                value={codeLang}
                options={codeLangOptions}
                onChange={setCodeLang}
                themeClass="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
              />
            )}

            {/* Sound Selector */}
            <CustomDropdown
              label="Sounds"
              icon={audioMuted ? VolumeX : Volume2}
              value={soundProfile}
              options={soundOptions}
              onChange={setSoundProfile}
              themeClass="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
            />

            {/* Theme Select */}
            <CustomDropdown
              label="Theme"
              icon={Settings}
              value={themeId}
              options={themeOptions}
              onChange={setThemeId}
              themeClass="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
            />

            {/* Audio Quick Mute */}
            <button
              onClick={() => setAudioMuted(!audioMuted)}
              title={audioMuted ? "Unmute Typing Audio" : "Mute Typing Audio"}
              className="p-1.5 rounded-lg border text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:border-slate-750"
            >
              {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
            </button>

          </div>
        </div>

        {/* Live Typing Container */}
        {testStatus !== "completed" && testStatus !== "failed" && (
          <div className="flex flex-col gap-4">
            
            {/* Live Metrics Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <div>
                    <span className="text-2xs font-semibold text-slate-400 block uppercase">WPM</span>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                      {liveWpm}
                    </span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-2xs font-semibold text-slate-400 block uppercase">Accuracy</span>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                      {liveAccuracy}%
                    </span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-2xs font-semibold text-slate-400 block uppercase">
                      {mode === "time" ? "Remaining" : "Elapsed"}
                    </span>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                      {mode === "time" ? `${timeRemaining}s` : `${timeElapsed}s`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reset shortcut */}
              <button
                onClick={resetTest}
                className="flex items-center gap-1 text-2xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded bg-slate-50 dark:bg-slate-850 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restart</span>
              </button>
            </div>

            {/* Main Interactive Text Board */}
            <div
              ref={typingAreaRef}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "p-8 rounded-3xl border-2 transition-all relative min-h-[180px] text-lg leading-relaxed focus:outline-none focus:ring-4 focus:ring-violet-500/10 cursor-text select-none z-10",
                theme.bg,
                theme.panel
              )}
            >
              {/* Blur focus message using client focus state to avoid SSR hydration mismatches */}
              {!isFocused && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[3px] rounded-3xl flex items-center justify-center z-20 flex-col gap-2 transition-all">
                  <button 
                    className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce cursor-pointer"
                    onClick={() => typingAreaRef.current?.focus()}
                  >
                    <KeyboardIcon className="w-4 h-4 text-emerald-400" />
                    <span>Click or Press Here to Focus & Type</span>
                  </button>
                </div>
              )}

              {/* Words Render block */}
              <div className="whitespace-pre-wrap select-none font-mono tracking-wide text-left">
                {textToType.split("").map((char, idx) => {
                  let charClass = theme.textMuted;
                  if (idx < currCharIndex) {
                    charClass = isCharCorrect[idx] ? theme.textTyped : theme.textWrong;
                  } else if (idx === currCharIndex) {
                    // Highlights active character with custom background and pulsing border accent
                    charClass = "bg-white/15 text-white font-bold px-0.5 rounded border-b-2 border-emerald-450";
                  }
                  
                  return (
                    <span
                      key={idx}
                      className={cn(
                        "relative transition-colors duration-75 inline-block font-mono",
                        charClass
                      )}
                    >
                      {idx === currCharIndex && (
                        <span className={cn("absolute -left-[1px] top-0.5 w-[2px] h-[1.15em] animate-pulse rounded", theme.cursor)} />
                      )}
                      {char === " " ? (
                        <span className="opacity-30 font-bold">·</span>
                      ) : char === "\n" ? (
                        <span className="opacity-40 text-xs">↵{"\n"}</span>
                      ) : (
                        char
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Visual Keyboard - Typing feedback */}
            <div className="bg-slate-900/90 border border-slate-800/80 p-6 rounded-3xl shadow-lg mt-2">
              <div className="flex flex-col gap-2.5 max-w-[700px] mx-auto">
                {KEYBOARD_ROWS.map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-1.5 w-full">
                    {row.map((key) => {
                      const isPressed = activeKeys[key.key];
                      
                      return (
                        <div
                          key={key.key}
                          className={cn(
                            "h-10 border rounded-lg text-xs font-semibold flex items-center justify-center transition-all select-none duration-75 uppercase",
                            key.isSpace ? "w-60" : "w-10",
                            isPressed
                              ? "bg-emerald-500 border-emerald-400 text-slate-950 scale-95 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                              : "bg-slate-800 border-slate-700 text-slate-300"
                          )}
                        >
                          {key.label}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="text-center text-3xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                <Info className="w-3 h-3 text-slate-600" /> Key hits sync dynamically with mechanical sound synthesis
              </p>
            </div>

          </div>
        )}

        {/* Failed Sudden Death block */}
        {testStatus === "failed" && (
          <div className="bg-rose-500/10 border-2 border-rose-500/30 p-8 rounded-3xl text-center shadow-lg flex flex-col items-center justify-center gap-4">
            <ShieldAlert className="w-12 h-12 text-rose-500 animate-pulse" />
            <h2 className="text-2xl font-black text-rose-500">Assessments Failed</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md">
              Sudden Death Mode was active! You triggered a typing error and the speed trial has stopped. Try again to get a perfect score!
            </p>
            <button
              onClick={resetTest}
              className="mt-2 flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer hover:scale-102"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Completion & Analysis dashboard */}
        {testStatus === "completed" && (
          <div className="flex flex-col gap-6">
            
            {/* Dashboard grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Speed Board */}
              <div className="bg-white/80 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest">Typing Speed</span>
                <span className="text-5xl font-black text-emerald-500 my-1">{finalWpm}</span>
                <span className="text-xs font-semibold text-slate-500">WORDS PER MINUTE</span>
              </div>

              {/* Accuracy Board */}
              <div className="bg-white/80 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
                <span className="text-5xl font-black text-violet-500 my-1">{finalAccuracy}%</span>
                <span className="text-xs font-semibold text-slate-500">ACCURACY RATE</span>
              </div>

              {/* Errors Board */}
              <div className="bg-white/80 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest">Errors</span>
                <span className="text-5xl font-black text-rose-500 my-1">{totalErrors}</span>
                <span className="text-xs font-semibold text-slate-500">TOTAL TYPOS</span>
              </div>

              {/* Time Board */}
              <div className="bg-white/80 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest">Time Elapsed</span>
                <span className="text-5xl font-black text-amber-500 my-1">{timeElapsed}s</span>
                <span className="text-xs font-semibold text-slate-500">SECONDS SPENT</span>
              </div>
            </div>

            {/* Speed Real-time Graph */}
            {wpmHistory.length > 1 && (
              <div className="bg-white/80 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 block mb-4 uppercase">WPM Progression Chart</span>
                <div className="relative w-full h-28 flex items-center justify-center">
                  <svg className="w-full h-full text-emerald-400 dark:text-emerald-500/80" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                      </linearGradient>
                    </defs>
                    
                    {/* Gridlines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
                    <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
                    
                    {/* Shadow Area under Curve */}
                    {sparklinePoints && (
                      <path
                        fill="url(#wpmGrad)"
                        d={`M 15,100 L ${sparklinePoints} L 485,100 Z`}
                      />
                    )}

                    {/* Sparkline curve */}
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={sparklinePoints}
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Keyboard Heatmap and Analytics */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
              <span className="text-xs font-semibold text-slate-400 block mb-4 uppercase">Assessment Keyboard Heatmap</span>
              
              <div className="flex flex-col gap-2.5 max-w-[700px] mx-auto">
                {KEYBOARD_ROWS.map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-1.5 w-full">
                    {row.map((key) => {
                      const stats = keyStats[key.key];
                      let heatmapStyle = "bg-slate-800 border-slate-700 text-slate-400";
                      let tooltipText = "";

                      if (stats) {
                        const avgTime = stats.count > 0 ? Math.round(stats.totalTime / stats.count) : 0;
                        const acc = (stats.count / (stats.count + stats.errors)) * 100 || 0;
                        
                        tooltipText = `${avgTime}ms | ${Math.round(acc)}%`;
                        
                        if (acc < 80 || avgTime > 400) {
                          heatmapStyle = "bg-rose-500/20 border-rose-500 text-rose-400 font-bold";
                        } else if (acc < 93 || avgTime > 250) {
                          heatmapStyle = "bg-amber-500/20 border-amber-500 text-amber-400 font-bold";
                        } else {
                          heatmapStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                        }
                      }

                      return (
                        <div
                          key={key.key}
                          title={tooltipText || "Not used"}
                          className={cn(
                            "h-10 border rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all select-none uppercase group relative",
                            key.isSpace ? "w-60" : "w-10",
                            heatmapStyle
                          )}
                        >
                          <span>{key.label}</span>
                          {stats && (
                            <span className="text-[7px] font-normal opacity-85 block mt-0.5">
                              {Math.round(stats.totalTime / stats.count || 0)}ms
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 text-3xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" />
                  <span>Fast & Accurate (&lt;250ms)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500" />
                  <span>Moderate Latency (250-400ms)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500" />
                  <span>Slow or Typing Errors (&gt;400ms)</span>
                </div>
              </div>

              {/* Key diagnostics comments */}
              {weakestKeys.length > 0 && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <h4 className="text-2xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" /> Actionable Analytics: Areas to Improve
                  </h4>
                  <ul className="text-xs text-slate-300 flex flex-col gap-1.5">
                    {weakestKeys.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
                        <span>Key <strong className="uppercase text-amber-400 font-mono">"{item.keyName}"</strong></span>
                        <span className="text-slate-400">
                          Avg: <strong className="text-slate-200">{item.avgSpeed}ms</strong> | Accuracy: <strong className="text-slate-200">{Math.round(item.accuracy)}%</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Certificate Builder Module */}
            <div className="bg-white/80 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-6">
              
              {/* Form panel */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    Image Certificate Generator
                  </h3>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Customize and export a credentials certificate to showcase your achievement. Your name will update in real-time.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-3xs font-bold text-slate-400 uppercase">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter name for certificate"
                      value={certificateName}
                      onChange={(e) => setCertificateName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-3xs font-bold text-slate-400 uppercase">Certificate Style</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "classic", label: "Classic Gold" },
                      { id: "cyberpunk", label: "Obsidian Cyberpunk" },
                      { id: "emerald", label: "Emerald Prestige" },
                      { id: "cosmic", label: "Cosmic Lavender" }
                    ].map(style => (
                      <button
                        key={style.id}
                        onClick={() => setCertTheme(style.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                          certTheme === style.id
                            ? "bg-violet-500/10 text-violet-600 border-violet-500/40 dark:text-violet-400"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                        )}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDownloadCertificate}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer hover:scale-102 mt-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Certificate PNG</span>
                </button>
              </div>

              {/* Preview canvas */}
              <div className="flex-1 flex items-center justify-center">
                <div className="border border-slate-200 dark:border-slate-800 p-2 rounded-2xl bg-slate-900/5 shadow-inner w-full max-w-[420px]">
                  {/* The actual high-res render canvas */}
                  <canvas
                    ref={canvasRef}
                    width={1000}
                    height={650}
                    className="w-full h-auto rounded-xl shadow-xl border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resetTest}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-750 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer hover:scale-102"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start New Assessment</span>
              </button>
            </div>

          </div>
        )}

        {/* Local progression high score board */}
        {highScores.length > 0 && (
          <div className="bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm mt-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-1.5 uppercase">
              <History className="w-4 h-4 text-violet-500" /> Recent Top Assessments
            </h3>
            <div className="flex flex-col gap-2">
              {highScores.map((score, index) => (
                <div key={score.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850">
                  <div className="flex items-center gap-3">
                    <span className="text-2xs font-bold text-slate-400">#0{index + 1}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{score.wpm} WPM</span>
                      <span className="text-3xs text-slate-400 block">{score.mode} • {score.date}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-500">{score.accuracy}% Acc</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </ToolPageShell>
  );
}
