"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ToolPageShell from "../ToolPageShell";
import {
  Shuffle,
  Dice5,
  RotateCcw,
  Copy,
  Check,
  Download,
  Share2,
  History,
  Trash2,
  Play,
  Volume2,
  VolumeX,
  Settings2,
  BarChart3,
  HelpCircle,
  Sliders,
  ShieldCheck,
  Binary,
  Hash,
  Award,
  Flame,
  RefreshCw,
  Filter,
  Layers,
  FileSpreadsheet,
  FileCode,
  Grid,
  ListFilter,
  Zap,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Info,
  ExternalLink,
  BookmarkPlus,
  BookmarkCheck,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Trophy,
  Dices,
  Maximize2,
  Minimize2,
  TableProperties
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
// Sound FX Synthesizer (Native Web Audio API - Zero Dependencies)
// ─────────────────────────────────────────────────────────────
class SoundEffects {
  constructor() {
    this.ctx = null;
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

  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (_) {}
  }

  playRollTick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(900 + Math.random() * 400, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (_) {}
  }

  playFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + 0.25);
      });
    } catch (_) {}
  }
}

const sfx = new SoundEffects();

// ─────────────────────────────────────────────────────────────
// Pure Math & PRNG / CSPRNG Core Algorithms
// ─────────────────────────────────────────────────────────────

// Mulberry32 PRNG with string/number seed hasher
function createSeededPRNG(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (h >>> 0);

  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// True Cryptographic Random in [0, 1)
function cryptoRandom() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    return buf[0] / (0xffffffff + 1);
  }
  return Math.random();
}

// Prime check helper
function isPrime(num) {
  const n = Math.abs(Math.round(num));
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// Built-in Quick Templates
const QUICK_PRESETS = [
  { label: "1 to 100", mode: "range", min: 1, max: 100, count: 1, unique: false, decimals: 0 },
  { label: "1 to 10", mode: "range", min: 1, max: 10, count: 1, unique: false, decimals: 0 },
  { label: "Coin Flip (1-2)", mode: "range", min: 1, max: 2, count: 1, unique: false, decimals: 0 },
  { label: "D20 RPG Roll", mode: "dice", diceType: "d20", diceCount: 1, modifier: 0 },
  { label: "4-Digit PIN", mode: "range", min: 1000, max: 9999, count: 1, unique: false, decimals: 0, padZeros: 4 },
  { label: "6-Digit OTP", mode: "range", min: 100000, max: 999999, count: 1, unique: false, decimals: 0, padZeros: 6 },
  { label: "Lottery 6/49", mode: "range", min: 1, max: 49, count: 6, unique: true, decimals: 0, sort: "asc" },
  { label: "Powerball Draw", mode: "lottery", lotteryType: "powerball" },
  { label: "Normal (IQ: 100±15)", mode: "distribution", distType: "normal", mean: 100, stdDev: 15, count: 20 },
  { label: "Hex Byte (0-255)", mode: "range", min: 0, max: 255, count: 8, unique: false, base: "hex" }
];

export default function RandomNumberGenerator() {
  // ── Mode Selection: "range" | "dice" | "distribution" | "lottery" | "sequence" ──
  const [mode, setMode] = useState("range");

  // ── Engine & Reproducibility Settings ──
  const [engine, setEngine] = useState("crypto"); // "crypto" | "seeded"
  const [seed, setSeed] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ── Mode 1: Range Generator State ──
  const [minVal, setMinVal] = useState("1");
  const [maxVal, setMaxVal] = useState("100");
  const [quantity, setQuantity] = useState("1");
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [sortOrder, setSortOrder] = useState("none"); // "none" | "asc" | "desc" | "shuffle"
  const [stepSize, setStepSize] = useState("1");
  const [decimalPlaces, setDecimalPlaces] = useState("0");
  const [excludeInput, setExcludeInput] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "even" | "odd" | "prime" | "multiple"
  const [multipleOf, setMultipleOf] = useState("5");

  // ── Mode 2: Polyhedral Dice Studio State ──
  const [diceCount, setDiceCount] = useState(1);
  const [selectedDie, setSelectedDie] = useState("d20"); // "d4", "d6", "d8", "d10", "d12", "d20", "d100", "custom"
  const [customDieSides, setCustomDieSides] = useState("24");
  const [diceModifier, setDiceModifier] = useState(0);
  const [diceRollType, setDiceRollType] = useState("normal"); // "normal" | "advantage" | "disadvantage" | "dropLowest" | "dropHighest"
  const [diceResults, setDiceResults] = useState([]);

  // ── Mode 3: Statistical Probability Distribution State ──
  const [distType, setDistType] = useState("normal"); // "normal" | "uniform" | "binomial" | "poisson" | "exponential"
  const [distCount, setDistCount] = useState("100");
  const [distMean, setDistMean] = useState("100");
  const [distStdDev, setDistStdDev] = useState("15");
  const [distTrials, setDistTrials] = useState("20");
  const [distProb, setDistProb] = useState("0.5");
  const [distLambda, setDistLambda] = useState("4");
  const [distDecimals, setDistDecimals] = useState("2");

  // ── Mode 4: Lucky Draw / Raffle / Lottery State ──
  const [lotteryPreset, setLotteryPreset] = useState("powerball"); // "powerball" | "megamillions" | "euromillions" | "customLottery" | "raffle"
  const [customMainCount, setCustomMainCount] = useState("6");
  const [customMainMax, setCustomMainMax] = useState("49");
  const [customBonusCount, setCustomBonusCount] = useState("1");
  const [customBonusMax, setCustomBonusMax] = useState("10");
  const [raffleList, setRaffleList] = useState("Alex\nBeatrix\nCharlie\nDiana\nEthan\nFiona\nGabriel\nHannah");
  const [rafflePicks, setRafflePicks] = useState("1");
  const [lotteryDrawResult, setLotteryDrawResult] = useState(null);

  // ── Mode 5: Sequence & Matrix State ──
  const [matrixRows, setMatrixRows] = useState("3");
  const [matrixCols, setMatrixCols] = useState("3");
  const [matrixMin, setMatrixMin] = useState("1");
  const [matrixMax, setMatrixMax] = useState("99");

  // ── Output Formatting & Customization ──
  const [outputFormat, setOutputFormat] = useState("comma"); // "comma" | "space" | "newline" | "tab" | "custom" | "json" | "python" | "js" | "sql"
  const [customDelimiter, setCustomDelimiter] = useState(", ");
  const [padZeros, setPadZeros] = useState("0");
  const [numberPrefix, setNumberPrefix] = useState("");
  const [numberSuffix, setNumberSuffix] = useState("");
  const [baseSystem, setBaseSystem] = useState("dec"); // "dec" | "hex" | "bin" | "oct"
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "text" | "stats" | "matrix"

  // ── Core Results & Presentation States ──
  const [results, setResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [animatedIndex, setAnimatedIndex] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fullscreenSpotlight, setFullscreenSpotlight] = useState(false);
  const [spotlightValue, setSpotlightValue] = useState(null);

  // ── History & Saved Presets ──
  const [history, setHistory] = useState([]);
  const [savedPresets, setSavedPresets] = useState([]);
  const [activeTab, setActiveTab] = useState("generator"); // "generator" | "analytics" | "history" | "docs"

  const canvasRef = useRef(null);

  // Load history & presets from localStorage on mount
  useEffect(() => {
    try {
      const savedHist = localStorage.getItem("toolstrek_rng_history");
      if (savedHist) setHistory(JSON.parse(savedHist));
      const savedPre = localStorage.getItem("toolstrek_rng_presets");
      if (savedPre) setSavedPresets(JSON.parse(savedPre));
    } catch (_) {}
  }, []);

  // Save history to localStorage
  const saveToHistory = useCallback((entry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev.slice(0, 39)];
      try {
        localStorage.setItem("toolstrek_rng_history", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  }, []);

  // Keyboard shortcut listener (Space or Enter to re-generate when not focusing an input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const targetTag = e.target.tagName.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || targetTag === "select") return;
      if (e.code === "Space" || e.code === "KeyR") {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Confetti Particle Animation
  useEffect(() => {
    if (!showConfetti) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 85 }, () => ({
      x: width * (0.3 + Math.random() * 0.4),
      y: height * 0.4,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.9) * 20,
      size: Math.random() * 8 + 4,
      color: ["#7c00fe", "#00d26a", "#ff9f1c", "#3a86ff", "#ff006e", "#8338ec"][
        Math.floor(Math.random() * 6)
      ],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      opacity: 1
    }));

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.vx *= 0.98;
        p.rotation += p.vRot;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(render);
      } else {
        setShowConfetti(false);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [showConfetti]);

  // ─────────────────────────────────────────────────────────────
  // Main Generation Handler
  // ─────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    if (soundEnabled) sfx.playRollTick();
    setIsGenerating(true);

    // Pick random generator function
    const randFn =
      engine === "seeded" && seed.trim().length > 0
        ? createSeededPRNG(seed)
        : cryptoRandom;

    let generatedItems = [];
    let historyDetails = "";

    try {
      if (mode === "range") {
        const min = parseFloat(minVal) || 0;
        const max = parseFloat(maxVal) || 100;
        const qty = Math.max(1, Math.min(10000, parseInt(quantity, 10) || 1));
        const step = Math.max(0.0000001, parseFloat(stepSize) || 1);
        const dec = Math.max(0, Math.min(10, parseInt(decimalPlaces, 10) || 0));

        if (min > max) {
          toast.error("Minimum value cannot be greater than maximum value.");
          setIsGenerating(false);
          return;
        }

        // Parse exclusions
        const excludedSet = new Set(
          excludeInput
            .split(/[\s,]+/)
            .map((s) => parseFloat(s.trim()))
            .filter((n) => !isNaN(n))
        );

        // Filter predicate
        const filterCheck = (val) => {
          if (excludedSet.has(val)) return false;
          if (filterType === "even" && Math.round(val) % 2 !== 0) return false;
          if (filterType === "odd" && Math.round(val) % 2 === 0) return false;
          if (filterType === "prime" && !isPrime(val)) return false;
          if (filterType === "multiple") {
            const m = parseFloat(multipleOf) || 1;
            if (m !== 0 && Math.abs(val % m) > 0.00001) return false;
          }
          return true;
        };

        // If step is discrete and bounds are reasonable, we can build a candidate pool
        const rangeSpan = max - min;
        const totalSteps = Math.floor(rangeSpan / step) + 1;

        if (!allowDuplicates && totalSteps <= 20000) {
          // Generate pool of valid step values
          const pool = [];
          for (let i = 0; i < totalSteps; i++) {
            const v = Number((min + i * step).toFixed(dec));
            if (v <= max && filterCheck(v)) pool.push(v);
          }

          if (pool.length === 0) {
            toast.error("No valid numbers available with the current filter and exclusions.");
            setIsGenerating(false);
            return;
          }

          if (qty > pool.length) {
            toast.warning(
              `Requested ${qty} unique numbers, but only ${pool.length} candidates match criteria. Outputting ${pool.length}.`
            );
          }

          // Fisher-Yates shuffle sample
          const actualQty = Math.min(qty, pool.length);
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(randFn() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }
          generatedItems = pool.slice(0, actualQty);
        } else {
          // Continuous / With replacement or huge pool
          const uniqueSet = new Set();
          let attempts = 0;
          const maxAttempts = qty * 200;

          while (generatedItems.length < qty && attempts < maxAttempts) {
            attempts++;
            const raw = min + randFn() * (max - min);
            const stepped = min + Math.round((raw - min) / step) * step;
            const finalVal = Number(Math.min(max, Math.max(min, stepped)).toFixed(dec));

            if (!filterCheck(finalVal)) continue;

            if (!allowDuplicates) {
              if (uniqueSet.has(finalVal)) continue;
              uniqueSet.add(finalVal);
            }
            generatedItems.push(finalVal);
          }

          if (generatedItems.length < qty && !allowDuplicates) {
            toast.warning(`Found ${generatedItems.length} unique values before search limit.`);
          }
        }

        // Sorting
        if (sortOrder === "asc") generatedItems.sort((a, b) => a - b);
        else if (sortOrder === "desc") generatedItems.sort((a, b) => b - a);
        else if (sortOrder === "shuffle") {
          for (let i = generatedItems.length - 1; i > 0; i--) {
            const j = Math.floor(randFn() * (i + 1));
            [generatedItems[i], generatedItems[j]] = [generatedItems[j], generatedItems[i]];
          }
        }

        historyDetails = `Range [${min} to ${max}], Qty: ${generatedItems.length}`;
      } else if (mode === "dice") {
        // Mode 2: Polyhedral Dice Roller
        let sides = 20;
        if (selectedDie === "d4") sides = 4;
        else if (selectedDie === "d6") sides = 6;
        else if (selectedDie === "d8") sides = 8;
        else if (selectedDie === "d10") sides = 10;
        else if (selectedDie === "d12") sides = 12;
        else if (selectedDie === "d20") sides = 20;
        else if (selectedDie === "d100") sides = 100;
        else if (selectedDie === "custom") sides = Math.max(2, parseInt(customDieSides, 10) || 6);

        const count = Math.max(1, Math.min(100, diceCount));
        const rawRolls = [];

        for (let i = 0; i < count; i++) {
          const roll = Math.floor(randFn() * sides) + 1;
          rawRolls.push(roll);
        }

        let effectiveRolls = [...rawRolls];
        let droppedIndexes = [];

        if (diceRollType === "advantage" && count >= 2) {
          // keep highest
          const maxValInRoll = Math.max(...rawRolls);
          let kept = false;
          droppedIndexes = rawRolls.map((v, idx) => {
            if (v === maxValInRoll && !kept) {
              kept = true;
              return false;
            }
            return true;
          });
        } else if (diceRollType === "disadvantage" && count >= 2) {
          // keep lowest
          const minValInRoll = Math.min(...rawRolls);
          let kept = false;
          droppedIndexes = rawRolls.map((v, idx) => {
            if (v === minValInRoll && !kept) {
              kept = true;
              return false;
            }
            return true;
          });
        } else if (diceRollType === "dropLowest" && count > 1) {
          const minValInRoll = Math.min(...rawRolls);
          const minIdx = rawRolls.indexOf(minValInRoll);
          droppedIndexes = rawRolls.map((_, idx) => idx === minIdx);
        } else if (diceRollType === "dropHighest" && count > 1) {
          const maxValInRoll = Math.max(...rawRolls);
          const maxIdx = rawRolls.indexOf(maxValInRoll);
          droppedIndexes = rawRolls.map((_, idx) => idx === maxIdx);
        }

        const modifier = parseInt(diceModifier, 10) || 0;
        const total =
          rawRolls.reduce((acc, v, idx) => (droppedIndexes[idx] ? acc : acc + v), 0) + modifier;

        setDiceResults({
          rolls: rawRolls,
          dropped: droppedIndexes,
          sides,
          modifier,
          total,
          isNat20: sides === 20 && rawRolls.includes(20),
          isNat1: sides === 20 && rawRolls.includes(1)
        });

        generatedItems = rawRolls;
        historyDetails = `${count}d${sides}${modifier >= 0 ? "+" + modifier : modifier} = ${total}`;

        if (sides === 20 && rawRolls.includes(20)) {
          setShowConfetti(true);
          if (soundEnabled) sfx.playFanfare();
        }
      } else if (mode === "distribution") {
        // Mode 3: Statistical Probability Distributions
        const count = Math.max(1, Math.min(5000, parseInt(distCount, 10) || 100));
        const dec = Math.max(0, Math.min(8, parseInt(distDecimals, 10) || 2));

        if (distType === "normal") {
          // Gaussian / Box-Muller Transform
          const mu = parseFloat(distMean) || 0;
          const sigma = Math.max(0.0001, parseFloat(distStdDev) || 1);

          for (let i = 0; i < count; i += 2) {
            let u1 = randFn();
            let u2 = randFn();
            while (u1 <= 0.0000001) u1 = randFn();
            const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

            generatedItems.push(Number((z0 * sigma + mu).toFixed(dec)));
            if (generatedItems.length < count) {
              generatedItems.push(Number((z1 * sigma + mu).toFixed(dec)));
            }
          }
          historyDetails = `Gaussian (μ=${mu}, σ=${sigma}), Qty: ${count}`;
        } else if (distType === "uniform") {
          const mu = parseFloat(distMean) || 0;
          const span = Math.max(1, parseFloat(distStdDev) * 2 || 10);
          const min = mu - span / 2;
          const max = mu + span / 2;
          for (let i = 0; i < count; i++) {
            generatedItems.push(Number((min + randFn() * (max - min)).toFixed(dec)));
          }
          historyDetails = `Uniform [${min}, ${max}], Qty: ${count}`;
        } else if (distType === "binomial") {
          const n = Math.max(1, parseInt(distTrials, 10) || 10);
          const p = Math.max(0, Math.min(1, parseFloat(distProb) || 0.5));
          for (let i = 0; i < count; i++) {
            let successes = 0;
            for (let t = 0; t < n; t++) {
              if (randFn() < p) successes++;
            }
            generatedItems.push(successes);
          }
          historyDetails = `Binomial (n=${n}, p=${p}), Qty: ${count}`;
        } else if (distType === "poisson") {
          const lambda = Math.max(0.01, parseFloat(distLambda) || 4);
          const L = Math.exp(-lambda);
          for (let i = 0; i < count; i++) {
            let k = 0;
            let p = 1.0;
            do {
              k++;
              p *= randFn();
            } while (p > L);
            generatedItems.push(k - 1);
          }
          historyDetails = `Poisson (λ=${lambda}), Qty: ${count}`;
        } else if (distType === "exponential") {
          const lambda = Math.max(0.001, parseFloat(distLambda) || 1);
          for (let i = 0; i < count; i++) {
            let u = randFn();
            while (u <= 0.0000001) u = randFn();
            const val = -Math.log(1 - u) / lambda;
            generatedItems.push(Number(val.toFixed(dec)));
          }
          historyDetails = `Exponential (λ=${lambda}), Qty: ${count}`;
        }
      } else if (mode === "lottery") {
        // Mode 4: Lucky Draw / Raffle / Lottery
        if (lotteryPreset === "raffle") {
          const items = raffleList
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

          if (items.length === 0) {
            toast.error("Please provide at least 1 name or ticket in the raffle list.");
            setIsGenerating(false);
            return;
          }

          const picksCount = Math.min(items.length, Math.max(1, parseInt(rafflePicks, 10) || 1));
          const pool = [...items];
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(randFn() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
          }
          const winners = pool.slice(0, picksCount);

          setLotteryDrawResult({
            type: "raffle",
            winners,
            poolSize: items.length
          });
          generatedItems = winners;
          historyDetails = `Raffle Winner: ${winners.join(", ")}`;
          setShowConfetti(true);
          if (soundEnabled) sfx.playFanfare();
        } else {
          // Lottery Draw
          let mainCount = 5;
          let mainMax = 69;
          let bonusCount = 1;
          let bonusMax = 26;
          let lottoName = "Powerball";

          if (lotteryPreset === "megamillions") {
            mainCount = 5;
            mainMax = 70;
            bonusCount = 1;
            bonusMax = 25;
            lottoName = "Mega Millions";
          } else if (lotteryPreset === "euromillions") {
            mainCount = 5;
            mainMax = 50;
            bonusCount = 2;
            bonusMax = 12;
            lottoName = "EuroMillions";
          } else if (lotteryPreset === "customLottery") {
            mainCount = Math.max(1, parseInt(customMainCount, 10) || 6);
            mainMax = Math.max(mainCount, parseInt(customMainMax, 10) || 49);
            bonusCount = Math.max(0, parseInt(customBonusCount, 10) || 0);
            bonusMax = Math.max(bonusCount, parseInt(customBonusMax, 10) || 10);
            lottoName = `Custom ${mainCount}/${mainMax}`;
          }

          // Main balls (unique)
          const mainPool = Array.from({ length: mainMax }, (_, i) => i + 1);
          for (let i = mainPool.length - 1; i > 0; i--) {
            const j = Math.floor(randFn() * (i + 1));
            [mainPool[i], mainPool[j]] = [mainPool[j], mainPool[i]];
          }
          const mainBalls = mainPool.slice(0, mainCount).sort((a, b) => a - b);

          // Bonus balls
          let bonusBalls = [];
          if (bonusCount > 0) {
            const bonusPool = Array.from({ length: bonusMax }, (_, i) => i + 1);
            for (let i = bonusPool.length - 1; i > 0; i--) {
              const j = Math.floor(randFn() * (i + 1));
              [bonusPool[i], bonusPool[j]] = [bonusPool[j], bonusPool[i]];
            }
            bonusBalls = bonusPool.slice(0, bonusCount).sort((a, b) => a - b);
          }

          setLotteryDrawResult({
            type: "lottery",
            name: lottoName,
            mainBalls,
            bonusBalls
          });

          generatedItems = [...mainBalls, ...(bonusBalls.length ? [`(Bonus: ${bonusBalls.join(",")})`] : [])];
          historyDetails = `${lottoName}: [${mainBalls.join(", ")}] ${bonusBalls.length ? "+ [" + bonusBalls.join(", ") + "]" : ""}`;
          setShowConfetti(true);
          if (soundEnabled) sfx.playFanfare();
        }
      } else if (mode === "sequence") {
        // Mode 5: Sequence & Matrix
        const rows = Math.max(1, Math.min(20, parseInt(matrixRows, 10) || 3));
        const cols = Math.max(1, Math.min(20, parseInt(matrixCols, 10) || 3));
        const min = parseFloat(matrixMin) || 0;
        const max = parseFloat(matrixMax) || 100;

        const grid = [];
        for (let r = 0; r < rows; r++) {
          const rowArr = [];
          for (let c = 0; c < cols; c++) {
            rowArr.push(Math.floor(min + randFn() * (max - min + 1)));
          }
          grid.push(rowArr);
        }
        generatedItems = grid.flat();
        historyDetails = `Matrix ${rows}×${cols} [${min} to ${max}]`;
      }

      setResults(generatedItems);

      // Spotlight single number animation if quantity === 1
      if (generatedItems.length === 1) {
        setSpotlightValue(generatedItems[0]);
      }

      // Save to History Log
      if (generatedItems.length > 0) {
        saveToHistory({
          id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          mode,
          details: historyDetails,
          engine,
          seed: engine === "seeded" ? seed : "CSPRNG",
          sample: generatedItems.slice(0, 5).join(", ") + (generatedItems.length > 5 ? "..." : ""),
          count: generatedItems.length
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during number generation.");
    } finally {
      setIsGenerating(false);
    }
  }, [
    mode,
    engine,
    seed,
    soundEnabled,
    minVal,
    maxVal,
    quantity,
    allowDuplicates,
    sortOrder,
    stepSize,
    decimalPlaces,
    excludeInput,
    filterType,
    multipleOf,
    diceCount,
    selectedDie,
    customDieSides,
    diceModifier,
    diceRollType,
    distType,
    distCount,
    distMean,
    distStdDev,
    distTrials,
    distProb,
    distLambda,
    distDecimals,
    lotteryPreset,
    customMainCount,
    customMainMax,
    customBonusCount,
    customBonusMax,
    raffleList,
    rafflePicks,
    matrixRows,
    matrixCols,
    matrixMin,
    matrixMax,
    saveToHistory
  ]);

  // Run on mount
  useEffect(() => {
    handleGenerate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────
  // Output String Formatter
  // ─────────────────────────────────────────────────────────────
  const formattedString = useMemo(() => {
    if (!results || results.length === 0) return "";

    const padCount = Math.max(0, parseInt(padZeros, 10) || 0);

    const formatSingle = (val) => {
      if (typeof val !== "number") return String(val);

      let str = "";
      if (baseSystem === "hex") {
        str = "0x" + Math.floor(Math.abs(val)).toString(16).toUpperCase();
      } else if (baseSystem === "bin") {
        str = "0b" + Math.floor(Math.abs(val)).toString(2);
      } else if (baseSystem === "oct") {
        str = "0o" + Math.floor(Math.abs(val)).toString(8);
      } else {
        str = String(val);
      }

      if (padCount > 0 && baseSystem === "dec") {
        const parts = str.split(".");
        const isNeg = parts[0].startsWith("-");
        const cleanInt = isNeg ? parts[0].substring(1) : parts[0];
        const paddedInt = cleanInt.padStart(padCount, "0");
        str = (isNeg ? "-" : "") + paddedInt + (parts[1] ? "." + parts[1] : "");
      }

      return `${numberPrefix}${str}${numberSuffix}`;
    };

    const formattedList = results.map(formatSingle);

    if (outputFormat === "comma") return formattedList.join(", ");
    if (outputFormat === "space") return formattedList.join(" ");
    if (outputFormat === "newline") return formattedList.join("\n");
    if (outputFormat === "tab") return formattedList.join("\t");
    if (outputFormat === "custom") return formattedList.join(customDelimiter);
    if (outputFormat === "json") return JSON.stringify(formattedList, null, 2);
    if (outputFormat === "python") return `numbers = [${formattedList.join(", ")}]`;
    if (outputFormat === "js") return `const numbers = [${formattedList.join(", ")}];`;
    if (outputFormat === "sql") return `IN (${formattedList.join(", ")})`;

    return formattedList.join(", ");
  }, [results, outputFormat, customDelimiter, padZeros, numberPrefix, numberSuffix, baseSystem]);

  // ─────────────────────────────────────────────────────────────
  // Live Statistics & Analytics Computations
  // ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const numericList = results
      .filter((v) => typeof v === "number" && !isNaN(v))
      .map(Number);

    if (numericList.length === 0) return null;

    const count = numericList.length;
    const sum = numericList.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    const sorted = [...numericList].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;

    // Median
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Variance & StdDev
    const variance = numericList.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    // Mode calculation
    const freqMap = {};
    let maxFreq = 0;
    numericList.forEach((n) => {
      freqMap[n] = (freqMap[n] || 0) + 1;
      if (freqMap[n] > maxFreq) maxFreq = freqMap[n];
    });
    const modes = Object.keys(freqMap)
      .filter((k) => freqMap[k] === maxFreq && maxFreq > 1)
      .map(Number);

    // Even / Odd / Prime counts
    let evenCount = 0;
    let oddCount = 0;
    let primeCount = 0;

    numericList.forEach((n) => {
      const rounded = Math.round(n);
      if (rounded % 2 === 0) evenCount++;
      else oddCount++;
      if (isPrime(n)) primeCount++;
    });

    // Histogram Bins (up to 12 bins)
    const numBins = Math.min(12, Math.max(4, Math.ceil(Math.sqrt(count))));
    const binWidth = range === 0 ? 1 : range / numBins;
    const bins = Array.from({ length: numBins }, (_, i) => {
      const binMin = min + i * binWidth;
      const binMax = i === numBins - 1 ? max : min + (i + 1) * binWidth;
      return {
        label: `${binMin.toFixed(1)}-${binMax.toFixed(1)}`,
        min: binMin,
        max: binMax,
        count: 0
      };
    });

    numericList.forEach((n) => {
      let placed = false;
      for (let i = 0; i < bins.length; i++) {
        if (n >= bins[i].min && (i === bins.length - 1 ? n <= bins[i].max : n < bins[i].max)) {
          bins[i].count++;
          placed = true;
          break;
        }
      }
      if (!placed && bins.length > 0) bins[bins.length - 1].count++;
    });

    const maxBinCount = Math.max(...bins.map((b) => b.count), 1);

    return {
      count,
      sum,
      mean,
      median,
      min,
      max,
      range,
      variance,
      stdDev,
      modes,
      evenCount,
      oddCount,
      primeCount,
      bins,
      maxBinCount
    };
  }, [results]);

  // ─────────────────────────────────────────────────────────────
  // Clipboard Copy & Download Exporters
  // ─────────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (!formattedString) return;
    navigator.clipboard.writeText(formattedString);
    setCopied(true);
    toast.success("Numbers copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (formatType) => {
    if (!results || results.length === 0) {
      toast.error("No numbers to download.");
      return;
    }

    let content = "";
    let mimeType = "text/plain";
    let filename = `random-numbers-${Date.now()}`;

    if (formatType === "csv") {
      content = "Index,Value\n" + results.map((v, i) => `${i + 1},${v}`).join("\n");
      mimeType = "text/csv;charset=utf-8;";
      filename += ".csv";
    } else if (formatType === "json") {
      content = JSON.stringify({ metadata: { generatedAt: new Date().toISOString(), mode, engine }, numbers: results }, null, 2);
      mimeType = "application/json";
      filename += ".json";
    } else {
      content = formattedString;
      mimeType = "text/plain;charset=utf-8;";
      filename += ".txt";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    url.searchParams.set("min", minVal);
    url.searchParams.set("max", maxVal);
    url.searchParams.set("qty", quantity);
    if (engine === "seeded" && seed) url.searchParams.set("seed", seed);
    navigator.clipboard.writeText(url.toString());
    toast.success("Shareable URL with current configuration copied!");
  };

  const handleSavePreset = () => {
    const presetName = prompt("Enter a name for this custom preset:", `Preset ${savedPresets.length + 1}`);
    if (!presetName) return;
    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      mode,
      minVal,
      maxVal,
      quantity,
      stepSize,
      decimalPlaces,
      sortOrder,
      allowDuplicates,
      engine,
      seed
    };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    try {
      localStorage.setItem("toolstrek_rng_presets", JSON.stringify(updated));
    } catch (_) {}
    toast.success(`Preset "${presetName}" saved!`);
  };

  const applyPreset = (preset) => {
    if (preset.mode) setMode(preset.mode);
    if (preset.min !== undefined) setMinVal(String(preset.min));
    if (preset.minVal !== undefined) setMinVal(String(preset.minVal));
    if (preset.max !== undefined) setMaxVal(String(preset.max));
    if (preset.maxVal !== undefined) setMaxVal(String(preset.maxVal));
    if (preset.count !== undefined) setQuantity(String(preset.count));
    if (preset.quantity !== undefined) setQuantity(String(preset.quantity));
    if (preset.stepSize !== undefined) setStepSize(String(preset.stepSize));
    if (preset.decimals !== undefined) setDecimalPlaces(String(preset.decimals));
    if (preset.decimalPlaces !== undefined) setDecimalPlaces(String(preset.decimalPlaces));
    if (preset.unique !== undefined) setAllowDuplicates(!preset.unique);
    if (preset.allowDuplicates !== undefined) setAllowDuplicates(preset.allowDuplicates);
    if (preset.sort !== undefined) setSortOrder(preset.sort);
    if (preset.padZeros !== undefined) setPadZeros(String(preset.padZeros));
    if (preset.base !== undefined) setBaseSystem(preset.base);
    if (preset.diceType) setSelectedDie(preset.diceType);
    if (preset.diceCount) setDiceCount(preset.diceCount);
    if (preset.distType) setDistType(preset.distType);
    if (preset.mean) setDistMean(String(preset.mean));
    if (preset.stdDev) setDistStdDev(String(preset.stdDev));
    if (preset.lotteryType) setLotteryPreset(preset.lotteryType);

    toast.info(`Applied preset: ${preset.label || preset.name}`);
    setTimeout(() => handleGenerate(), 50);
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      {/* Canvas for Win/Celebration Confetti */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ display: showConfetti ? "block" : "none" }}
      />

      <div className="space-y-6">
        {/* ── TOP HERO BANNER & STATUS ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-purple-50/40 to-indigo-50/30 dark:from-gray-900/90 dark:via-purple-950/20 dark:to-gray-950/80 border border-purple-100 dark:border-purple-900/30 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-purple-500/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brandColor/10 text-brandColor dark:bg-brandColor/20 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Random Number Generator (RNG Studio)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Random Number <span className="text-brandColor">Generator</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
                CSPRNG Cryptographic & Seeded PRNG studio. Customizable ranges, polyhedral RPG dice, probability distributions, lottery & raffle picker, live histogram, and export tools.
              </p>
            </div>

            {/* Quick Engine & Audio Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white/70 dark:bg-gray-800/80 p-2 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
              <button
                onClick={() => setEngine(engine === "crypto" ? "seeded" : "crypto")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  engine === "crypto"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                }`}
                title="Toggle between Cryptographically Secure CSPRNG and Reproducible Seeded PRNG"
              >
                {engine === "crypto" ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>CSPRNG Secure</span>
                  </>
                ) : (
                  <>
                    <Hash className="w-3.5 h-3.5" />
                    <span>Seeded PRNG</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  soundEnabled
                    ? "text-brandColor bg-brandColor/10 dark:bg-brandColor/20"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
                title={soundEnabled ? "Sound Effects ON" : "Sound Effects Muted"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={handleShareLink}
                className="p-2 text-gray-500 hover:text-brandColor hover:bg-brandColor/10 rounded-xl transition-colors cursor-pointer"
                title="Share link with configuration"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets Pills */}
          <div className="mt-5 pt-4 border-t border-purple-100/70 dark:border-purple-900/20">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Presets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-brandColor hover:text-white dark:hover:bg-brandColor border border-gray-200/80 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MODE TABS (Range, Dice, Probability, Lottery, Matrix) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-2">
          <div className="flex flex-wrap gap-1 sm:gap-2 p-1 bg-gray-100/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/60 dark:border-gray-800">
            {[
              { id: "range", label: "Range & Batch", icon: Sliders },
              { id: "dice", label: "RPG Dice Roller", icon: Dices },
              { id: "distribution", label: "Probability & Gaussian", icon: BarChart3 },
              { id: "lottery", label: "Lottery & Raffle", icon: Trophy },
              { id: "sequence", label: "2D Matrix & Grid", icon: Grid }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMode(tab.id);
                    if (soundEnabled) sfx.playClick();
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-gray-800 text-brandColor dark:text-purple-300 shadow-md shadow-purple-500/10 border border-gray-200/70 dark:border-gray-700"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brandColor dark:text-purple-400" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Generator vs Analytics vs History Views */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("generator")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "generator"
                  ? "bg-brandColor text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Generator View
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-brandColor text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Analytics & Stats
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-brandColor text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              History ({history.length})
            </button>
          </div>
        </div>

        {/* ── MAIN WORKSPACE GRID: CONTROLS (LEFT) + RESULTS & PREVIEW (RIGHT) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL: CONFIGURATION PARAMETERS (5 COLS) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 p-5 sm:p-6 shadow-sm space-y-5">
              {/* ── MODE 1: RANGE CONTROLS ── */}
              {mode === "range" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Range Parameters
                    </h2>
                    <span className="text-xs text-brandColor font-semibold">Min / Max Bounds</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Minimum (Min)
                      </label>
                      <input
                        type="number"
                        value={minVal}
                        onChange={(e) => setMinVal(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brandColor focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Maximum (Max)
                      </label>
                      <input
                        type="number"
                        value={maxVal}
                        onChange={(e) => setMaxVal(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brandColor focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Quantity (1-10k)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brandColor focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Step / Increment
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={stepSize}
                        onChange={(e) => setStepSize(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brandColor focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Decimals (Precision)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={decimalPlaces}
                        onChange={(e) => setDecimalPlaces(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brandColor focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Sort Order
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brandColor focus:outline-none"
                      >
                        <option value="none">Original (None)</option>
                        <option value="asc">Ascending (1 → 9)</option>
                        <option value="desc">Descending (9 → 1)</option>
                        <option value="shuffle">Shuffle Random</option>
                      </select>
                    </div>
                  </div>

                  {/* Duplicate switch */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/60">
                    <div>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                        Allow Duplicates
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {allowDuplicates ? "Values can repeat (with replacement)" : "Unique numbers only"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowDuplicates(!allowDuplicates)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        allowDuplicates ? "bg-brandColor" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          allowDuplicates ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-brandColor dark:hover:text-purple-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-brandColor" />
                        Advanced Exclusions & Filters
                      </span>
                      {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showAdvanced && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Exclude Specific Numbers (comma or space separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 13, 4, 7"
                            value={excludeInput}
                            onChange={(e) => setExcludeInput(e.target.value)}
                            className="w-full h-9 px-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono focus:ring-2 focus:ring-brandColor focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                              Filter Rule
                            </label>
                            <select
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                              className="w-full h-9 px-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                            >
                              <option value="all">All Numbers</option>
                              <option value="even">Even Numbers Only</option>
                              <option value="odd">Odd Numbers Only</option>
                              <option value="prime">Primes Only</option>
                              <option value="multiple">Multiples of N</option>
                            </select>
                          </div>
                          {filterType === "multiple" && (
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                                Multiple of:
                              </label>
                              <input
                                type="number"
                                value={multipleOf}
                                onChange={(e) => setMultipleOf(e.target.value)}
                                className="w-full h-9 px-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── MODE 2: POLYHEDRAL RPG DICE CONTROLS ── */}
              {mode === "dice" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Tabletop RPG Dice Studio
                    </h2>
                    <span className="text-xs text-brandColor font-semibold">D&D 5e / TTRPG</span>
                  </div>

                  {/* Dice Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Choose Die Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {["d4", "d6", "d8", "d10", "d12", "d20", "d100", "custom"].map((die) => (
                        <button
                          key={die}
                          onClick={() => setSelectedDie(die)}
                          className={`py-2 px-1 text-xs font-extrabold uppercase rounded-xl border transition-all cursor-pointer ${
                            selectedDie === die
                              ? "bg-brandColor text-white border-brandColor shadow-sm shadow-purple-500/20 scale-105"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brandColor/50"
                          }`}
                        >
                          {die}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDie === "custom" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Custom Die Sides (e.g. 24, 30, 1000)
                      </label>
                      <input
                        type="number"
                        min="2"
                        value={customDieSides}
                        onChange={(e) => setCustomDieSides(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Dice Count (Number of dice)
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                          className="w-10 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={diceCount}
                          onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full h-11 px-2 text-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-sm"
                        />
                        <button
                          onClick={() => setDiceCount(Math.min(100, diceCount + 1))}
                          className="w-10 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Modifier (+ / - Bonus)
                      </label>
                      <input
                        type="number"
                        value={diceModifier}
                        onChange={(e) => setDiceModifier(parseInt(e.target.value) || 0)}
                        placeholder="e.g. +5 or -2"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Roll Mode & Rules
                    </label>
                    <select
                      value={diceRollType}
                      onChange={(e) => setDiceRollType(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm"
                    >
                      <option value="normal">Standard Sum</option>
                      <option value="advantage">Advantage (Keep Highest of 2+)</option>
                      <option value="disadvantage">Disadvantage (Keep Lowest of 2+)</option>
                      <option value="dropLowest">Drop Lowest Die (Stat Generation 4d6)</option>
                      <option value="dropHighest">Drop Highest Die</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── MODE 3: PROBABILITY DISTRIBUTIONS CONTROLS ── */}
              {mode === "distribution" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Distribution Parameters
                    </h2>
                    <span className="text-xs text-brandColor font-semibold">Statistical Modeling</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Distribution Type
                    </label>
                    <select
                      value={distType}
                      onChange={(e) => setDistType(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm"
                    >
                      <option value="normal">Normal / Gaussian (Bell Curve)</option>
                      <option value="uniform">Uniform Distribution</option>
                      <option value="binomial">Binomial Distribution</option>
                      <option value="poisson">Poisson Distribution</option>
                      <option value="exponential">Exponential Distribution</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Sample Size (Count)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        value={distCount}
                        onChange={(e) => setDistCount(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Decimals
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="8"
                        value={distDecimals}
                        onChange={(e) => setDistDecimals(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                      />
                    </div>
                  </div>

                  {distType === "normal" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Mean (μ)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={distMean}
                          onChange={(e) => setDistMean(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Std Deviation (σ)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={distStdDev}
                          onChange={(e) => setDistStdDev(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {distType === "binomial" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Trials (n)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={distTrials}
                          onChange={(e) => setDistTrials(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Success Prob (p)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={distProb}
                          onChange={(e) => setDistProb(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {(distType === "poisson" || distType === "exponential") && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Rate Parameter (λ)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.001"
                        value={distLambda}
                        onChange={(e) => setDistLambda(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ── MODE 4: LOTTERY & RAFFLE CONTROLS ── */}
              {mode === "lottery" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Lottery & Raffle Studio
                    </h2>
                    <span className="text-xs text-brandColor font-semibold">Lucky Picks</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Lottery / Draw Type
                    </label>
                    <select
                      value={lotteryPreset}
                      onChange={(e) => setLotteryPreset(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm"
                    >
                      <option value="powerball">Powerball (5/69 + 1/26 Powerball)</option>
                      <option value="megamillions">Mega Millions (5/70 + 1/25 Mega Ball)</option>
                      <option value="euromillions">EuroMillions (5/50 + 2/12 Lucky Stars)</option>
                      <option value="customLottery">Custom K-out-of-N Lottery</option>
                      <option value="raffle">Custom Names / Ticket Raffle Draw</option>
                    </select>
                  </div>

                  {lotteryPreset === "customLottery" && (
                    <div className="space-y-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Main Balls Count
                          </label>
                          <input
                            type="number"
                            value={customMainCount}
                            onChange={(e) => setCustomMainCount(e.target.value)}
                            className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Main Balls Pool Max
                          </label>
                          <input
                            type="number"
                            value={customMainMax}
                            onChange={(e) => setCustomMainMax(e.target.value)}
                            className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Bonus Balls Count
                          </label>
                          <input
                            type="number"
                            value={customBonusCount}
                            onChange={(e) => setCustomBonusCount(e.target.value)}
                            className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Bonus Pool Max
                          </label>
                          <input
                            type="number"
                            value={customBonusMax}
                            onChange={(e) => setCustomBonusMax(e.target.value)}
                            className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {lotteryPreset === "raffle" && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Participant Names / Ticket IDs (one per line)
                        </label>
                        <textarea
                          rows={5}
                          value={raffleList}
                          onChange={(e) => setRaffleList(e.target.value)}
                          placeholder="Paste participants here..."
                          className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Number of Winners to Pick
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={rafflePicks}
                          onChange={(e) => setRafflePicks(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── MODE 5: SEQUENCE & MATRIX CONTROLS ── */}
              {mode === "sequence" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      2D Matrix & Grid Studio
                    </h2>
                    <span className="text-xs text-brandColor font-semibold">Row × Col Grid</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Rows (M)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={matrixRows}
                        onChange={(e) => setMatrixRows(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Columns (N)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={matrixCols}
                        onChange={(e) => setMatrixCols(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Cell Min
                      </label>
                      <input
                        type="number"
                        value={matrixMin}
                        onChange={(e) => setMatrixMin(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Cell Max
                      </label>
                      <input
                        type="number"
                        value={matrixMax}
                        onChange={(e) => setMatrixMax(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── SEED PRNG INPUT (IF SEEDED MODE) ── */}
              {engine === "seeded" && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      Seed for Reproducibility
                    </label>
                    <button
                      onClick={() => setSeed("seed-" + Math.random().toString(36).substring(2, 8))}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                    >
                      Random Seed
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter any text, timestamp or number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-indigo-700/80 dark:text-indigo-300/70">
                    The same seed produces the exact identical sequence of numbers across any device.
                  </p>
                </div>
              )}

              {/* ── BIG GENERATE ACTION BUTTON ── */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 px-6 rounded-2xl bg-brandColor hover:bg-brandColorHover text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>Generate Numbers</span>
                  <span className="text-xs font-normal opacity-80 ml-1">(Space / Enter)</span>
                </button>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={handleSavePreset}
                    className="flex-1 py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-brandColor" />
                    <span>Save as Preset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE STUDIO VIEWER, RESULTS, STATS, & EXPORT (7 COLS) */}
          <div className="lg:col-span-7 space-y-5">
            {/* ── TAB CONTENT: GENERATOR VIEW ── */}
            {activeTab === "generator" && (
              <div className="space-y-5">
                {/* Result Spotlight Card (Single Number or Roll Total) */}
                {results.length === 1 && typeof results[0] === "number" && (
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-gray-950 p-6 sm:p-8 text-white shadow-2xl border border-purple-500/30 flex flex-col items-center justify-center text-center">
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => setFullscreenSpotlight(true)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                        title="Fullscreen Spotlight View"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-xs uppercase font-bold tracking-widest text-purple-300/80 mb-1">
                      Generated Result
                    </span>

                    <motion.div
                      key={results[0]}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="my-3 text-6xl sm:text-8xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-purple-200 drop-shadow-sm select-all"
                    >
                      {formattedString}
                    </motion.div>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={handleCopy}
                        className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied!" : "Copy Result"}</span>
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="px-4 py-1.5 rounded-full bg-brandColor hover:bg-brandColorHover text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-500/50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-roll</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Dice Roller Visualizer Card (if in Dice Mode) */}
                {mode === "dice" && diceResults && diceResults.rolls && (
                  <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Tabletop Dice Roll Result
                        </span>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>Total: </span>
                          <span className="text-brandColor font-mono text-2xl">{diceResults.total}</span>
                          {diceResults.modifier !== 0 && (
                            <span className="text-xs font-normal text-gray-500">
                              (Rolls: {diceResults.rolls.reduce((a, b, idx) => (diceResults.dropped[idx] ? a : a + b), 0)}{" "}
                              {diceResults.modifier >= 0 ? "+" + diceResults.modifier : diceResults.modifier})
                            </span>
                          )}
                        </h3>
                      </div>

                      {diceResults.isNat20 && (
                        <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs animate-bounce flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" />
                          <span>NATURAL 20! CRITICAL HIT</span>
                        </div>
                      )}
                      {diceResults.isNat1 && (
                        <div className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>NATURAL 1! CRITICAL FAIL</span>
                        </div>
                      )}
                    </div>

                    {/* Visual Dice Tokens */}
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {diceResults.rolls.map((roll, idx) => {
                        const isDropped = diceResults.dropped[idx];
                        const isMax = roll === diceResults.sides;
                        const isMin = roll === 1;

                        return (
                          <motion.div
                            key={idx}
                            initial={{ rotate: -20, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-base shadow-sm border transition-all ${
                              isDropped
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-dashed border-gray-300 dark:border-gray-700 line-through opacity-50"
                                : isMax
                                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-300 shadow-amber-500/30 shadow-md scale-105"
                                : isMin
                                ? "bg-gradient-to-br from-rose-500 to-rose-700 text-white border-rose-400 shadow-rose-500/20"
                                : "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 text-gray-800 dark:text-gray-100 border-purple-200 dark:border-gray-700"
                            }`}
                          >
                            <span>{roll}</span>
                            {isDropped && (
                              <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-rose-500 text-white px-1 rounded-full no-underline">
                                drop
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Lottery & Raffle Visualizer (if in Lottery Mode) */}
                {mode === "lottery" && lotteryDrawResult && (
                  <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          {lotteryDrawResult.type === "raffle" ? "Raffle Winner(s)" : "Official Lottery Ticket Simulation"}
                        </span>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                          {lotteryDrawResult.name || "Live Draw"}
                        </h3>
                      </div>
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>

                    {lotteryDrawResult.type === "lottery" ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          {lotteryDrawResult.mainBalls.map((num, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, y: 15 }}
                              animate={{ scale: 1, y: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-mono font-black text-lg flex items-center justify-center shadow-lg"
                            >
                              {num}
                            </motion.div>
                          ))}

                          {lotteryDrawResult.bonusBalls && lotteryDrawResult.bonusBalls.length > 0 && (
                            <>
                              <span className="text-gray-400 font-bold text-lg">+</span>
                              {lotteryDrawResult.bonusBalls.map((num, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0, y: 15 }}
                                  animate={{ scale: 1, y: 0 }}
                                  transition={{ delay: 0.5 + i * 0.08 }}
                                  className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 border-2 border-rose-400 text-white font-mono font-black text-lg flex items-center justify-center shadow-lg shadow-rose-500/30"
                                >
                                  {num}
                                </motion.div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {lotteryDrawResult.winners.map((winner, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              <span className="font-extrabold text-gray-900 dark:text-white text-base">
                                {winner}
                              </span>
                            </div>
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase">
                              Winner
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── MAIN NUMBERS OUTPUT CONTAINER ── */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm space-y-4">
                  {/* View Controls & Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                      <button
                        onClick={() => setViewMode("cards")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          viewMode === "cards"
                            ? "bg-white dark:bg-gray-700 text-brandColor dark:text-white shadow-2xs"
                            : "text-gray-500"
                        }`}
                      >
                        Cards View
                      </button>
                      <button
                        onClick={() => setViewMode("text")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          viewMode === "text"
                            ? "bg-white dark:bg-gray-700 text-brandColor dark:text-white shadow-2xs"
                            : "text-gray-500"
                        }`}
                      >
                        Formatted Text
                      </button>
                      {mode === "sequence" && (
                        <button
                          onClick={() => setViewMode("matrix")}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "matrix"
                              ? "bg-white dark:bg-gray-700 text-brandColor dark:text-white shadow-2xs"
                              : "text-gray-500"
                          }`}
                        >
                          Matrix Grid
                        </button>
                      )}
                    </div>

                    {/* Copy & Export Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy all output to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>

                      {/* Download Dropdown */}
                      <button
                        onClick={() => handleDownload("txt")}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                        title="Download as TXT"
                      >
                        .TXT
                      </button>
                      <button
                        onClick={() => handleDownload("csv")}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                        title="Download as CSV"
                      >
                        .CSV
                      </button>
                      <button
                        onClick={() => handleDownload("json")}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                        title="Download as JSON"
                      >
                        .JSON
                      </button>
                    </div>
                  </div>

                  {/* CARDS VIEW */}
                  {viewMode === "cards" && (
                    <div className="max-h-96 overflow-y-auto pr-1">
                      <div className="flex flex-wrap gap-2">
                        {results.map((val, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: Math.min(idx * 0.015, 0.4) }}
                            onClick={() => {
                              navigator.clipboard.writeText(String(val));
                              toast.success(`Copied: ${val}`);
                            }}
                            className="group relative px-3.5 py-2 rounded-2xl bg-gray-50 dark:bg-gray-800/70 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-gray-200/80 dark:border-gray-700/80 hover:border-brandColor/50 transition-all text-center cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono block text-[10px] leading-tight">
                              #{idx + 1}
                            </span>
                            <span className="font-mono font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100 group-hover:text-brandColor dark:group-hover:text-purple-300">
                              {val}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FORMATTED TEXT VIEW */}
                  {viewMode === "text" && (
                    <div className="space-y-3">
                      <textarea
                        readOnly
                        rows={8}
                        value={formattedString}
                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 focus:outline-none select-all"
                      />
                    </div>
                  )}

                  {/* MATRIX VIEW */}
                  {viewMode === "matrix" && mode === "sequence" && (
                    <div className="overflow-x-auto p-2">
                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${parseInt(matrixCols) || 3}, minmax(40px, 1fr))`
                        }}
                      >
                        {results.map((val, idx) => (
                          <div
                            key={idx}
                            className="h-12 rounded-xl bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-gray-700 flex items-center justify-center font-mono font-bold text-sm text-gray-900 dark:text-white"
                          >
                            {val}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Output Formatting Preferences Bar */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Delimiter:</span>
                        <select
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value)}
                          className="h-8 px-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                        >
                          <option value="comma">Comma (1, 2, 3)</option>
                          <option value="space">Space (1 2 3)</option>
                          <option value="newline">New Line (\n)</option>
                          <option value="tab">Tab (\t)</option>
                          <option value="custom">Custom String</option>
                          <option value="json">JSON Array</option>
                          <option value="python">Python List</option>
                          <option value="js">JavaScript Array</option>
                          <option value="sql">SQL IN (...)</option>
                        </select>
                      </div>

                      {outputFormat === "custom" && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Custom:</span>
                          <input
                            type="text"
                            value={customDelimiter}
                            onChange={(e) => setCustomDelimiter(e.target.value)}
                            className="w-16 h-8 px-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Format Base:</span>
                        <select
                          value={baseSystem}
                          onChange={(e) => setBaseSystem(e.target.value)}
                          className="h-8 px-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                        >
                          <option value="dec">Decimal</option>
                          <option value="hex">Hex (0x)</option>
                          <option value="bin">Binary (0b)</option>
                          <option value="oct">Octal (0o)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Pad Zeros:</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={padZeros}
                          onChange={(e) => setPadZeros(e.target.value)}
                          placeholder="0"
                          className="w-12 h-8 px-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: ANALYTICS & STATS VIEW ── */}
            {activeTab === "analytics" && stats && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-brandColor" />
                      Live Statistical Analysis
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Real-time metrics calculated over the generated dataset ({stats.count} items)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const summary = `Statistical Summary:\nCount: ${stats.count}\nSum: ${stats.sum}\nMean (Average): ${stats.mean.toFixed(4)}\nMedian: ${stats.median}\nMin: ${stats.min}\nMax: ${stats.max}\nRange: ${stats.range}\nStdDev: ${stats.stdDev.toFixed(4)}\nVariance: ${stats.variance.toFixed(4)}`;
                      navigator.clipboard.writeText(summary);
                      toast.success("Copied statistics summary!");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Stats</span>
                  </button>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase">Mean (Average)</span>
                    <span className="block text-lg font-extrabold text-brandColor font-mono">
                      {stats.mean.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase">Median</span>
                    <span className="block text-lg font-extrabold text-gray-900 dark:text-white font-mono">
                      {stats.median}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase">Min / Max</span>
                    <span className="block text-lg font-extrabold text-gray-900 dark:text-white font-mono">
                      {stats.min} / {stats.max}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase">Std Deviation (σ)</span>
                    <span className="block text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                      {stats.stdDev.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Sum Total:</span>
                    <span className="font-bold text-gray-900 dark:text-white block font-mono">
                      {stats.sum.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Range:</span>
                    <span className="font-bold text-gray-900 dark:text-white block font-mono">{stats.range}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Even / Odd:</span>
                    <span className="font-bold text-gray-900 dark:text-white block font-mono">
                      {stats.evenCount} / {stats.oddCount}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Prime Numbers:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                      {stats.primeCount}
                    </span>
                  </div>
                </div>

                {/* Interactive SVG Histogram Chart */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Empirical Frequency Distribution Histogram
                  </span>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                    <div className="h-44 flex items-end gap-1.5 sm:gap-2">
                      {stats.bins.map((bin, i) => {
                        const heightPct = (bin.count / stats.maxBinCount) * 100;
                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center justify-end h-full group relative"
                          >
                            <span className="text-[10px] font-mono text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {bin.count}
                            </span>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(4, heightPct)}%` }}
                              transition={{ duration: 0.4, delay: i * 0.03 }}
                              className="w-full rounded-t-lg bg-gradient-to-t from-brandColor to-purple-400 dark:from-purple-900 dark:to-brandColor hover:brightness-110 transition-all cursor-pointer"
                            />
                            <span className="text-[9px] text-gray-400 truncate w-full text-center mt-1.5 font-mono">
                              {bin.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: HISTORY VIEW ── */}
            {activeTab === "history" && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-brandColor" />
                      Generation Run History
                    </h3>
                    <p className="text-xs text-gray-500">Snapshots of your recent generation sessions</p>
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={() => {
                        setHistory([]);
                        try {
                          localStorage.removeItem("toolstrek_rng_history");
                        } catch (_) {}
                        toast.success("History cleared!");
                      }}
                      className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    No generation history yet. Press &quot;Generate Numbers&quot; to begin!
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto pr-1">
                    {history.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{item.details}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/50 text-brandColor text-[10px] font-semibold uppercase">
                              {item.mode}
                            </span>
                          </div>
                          <span className="text-gray-400 block font-mono text-[11px] truncate">
                            {item.sample}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.time}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.sample);
                              toast.success("Copied sample from history!");
                            }}
                            className="p-1.5 text-gray-400 hover:text-brandColor rounded-lg cursor-pointer"
                            title="Copy Sample"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── FULLSCREEN BIG SPOTLIGHT MODAL ── */}
        <AnimatePresence>
          {fullscreenSpotlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white"
            >
              <button
                onClick={() => setFullscreenSpotlight(false)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <Minimize2 className="w-6 h-6" />
              </button>

              <span className="text-sm uppercase tracking-widest text-purple-400 font-bold mb-4">
                Spotlight Display
              </span>

              <div className="text-7xl sm:text-9xl md:text-[14rem] font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-purple-300 drop-shadow-2xl">
                {spotlightValue !== null ? spotlightValue : results[0]}
              </div>

              <div className="flex items-center gap-4 mt-8">
                <button
                  onClick={() => {
                    handleGenerate();
                  }}
                  className="px-8 py-3.5 rounded-2xl bg-brandColor hover:bg-brandColorHover text-white font-bold text-lg flex items-center gap-2 shadow-xl shadow-purple-500/40 cursor-pointer"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Re-roll (Space)</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(String(spotlightValue !== null ? spotlightValue : results[0]));
                    toast.success("Copied to clipboard!");
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-lg flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copy</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── EDUCATIONAL GUIDE & FAQ SECTION ── */}
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Understanding True Randomness vs Pseudo-Randomness
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              A comprehensive guide to cryptographic randomness (CSPRNG), seeded mathematical generators (PRNG), and probability distributions.
            </p>
          </div>

          {/* 3 Feature Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-brandColor flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                CSPRNG (Cryptographic)
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Uses the operating system&apos;s cryptographic entropy pool via <code className="text-brandColor font-mono">window.crypto.getRandomValues()</code>. Unbiased, statistically independent, and suitable for high-stakes draws, security keys, and lotteries.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Hash className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Seeded Reproducibility
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Uses deterministic algorithms (Mulberry32). Passing the exact same seed allows teachers, researchers, and game developers to reproduce identical random sequences anywhere in the world.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Continuous Distributions
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Simulate standard normal curves with the Box-Muller transformation, binomial coin tosses, or Poisson arrival queues with real-time empirical histogram rendering.
              </p>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions (FAQ)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brandColor" />
                  Are the generated numbers truly random?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  In CSPRNG mode, the generator relies on hardware entropy (mouse movements, thermal noise, and hardware clock jitter) collected by your operating system, providing the highest standard of mathematical randomness possible on modern computers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brandColor" />
                  Can I export the numbers directly into programming languages?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Yes! Use the delimiter selector to immediately output as a Python list <code className="font-mono text-brandColor">[1, 2, 3]</code>, JavaScript array, SQL <code className="font-mono text-brandColor">IN (...)</code> clause, JSON, CSV, or custom separated values.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brandColor" />
                  How do RPG Advantage and Disadvantage rolls work?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Following Dungeons & Dragons 5e rules, Advantage rolls multiple dice and automatically keeps the highest roll while crossing out the rest. Disadvantage keeps the lowest roll.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brandColor" />
                  Can I generate negative and floating-point numbers?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Yes! You can set negative minimums (e.g. -50 to +50), specify arbitrary decimal precision (0 to 10 decimals), and configure any fractional step increment like 0.05 or 0.1.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
