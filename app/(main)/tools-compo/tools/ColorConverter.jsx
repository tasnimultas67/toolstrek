"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Palette,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "framer-motion";
import ToolPageShell from "../ToolPageShell";

// ─────────────────────────────────────────────
// Color Space Conversions (Pure JS Math)
// ─────────────────────────────────────────────

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r, g, b) {
  const clamp = (v) => Math.min(255, Math.max(0, Math.round(v)));
  r = clamp(r);
  g = clamp(g);
  b = clamp(b);
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function hsvToRgb(h, s, v) {
  h /= 360;
  s /= 100;
  v /= 100;
  let r = 0,
    g = 0,
    b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToCmyk(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

function cmykToRgb(c, m, y, k) {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
}

// ─────────────────────────────────────────────
// Advanced Operations Helpers
// ─────────────────────────────────────────────

function getRelativeLuminance(r, g, b) {
  const f = (val) => {
    val /= 255;
    return val <= 0.03928
      ? val / 12.92
      : Math.pow((val + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function getContrastRatio(rgb1, rgb2) {
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Color blindness simulation (sRGB linear approximation)
function simulateColorBlindness(r, g, b, type) {
  // Matrices for protanopia, deuteranopia, tritanopia, achromatopsia
  const matrices = {
    protanopia: [
      0.56667, 0.43333, 0,
      0.55833, 0.44167, 0,
      0, 0.24167, 0.75833
    ],
    deuteranopia: [
      0.625, 0.375, 0,
      0.7, 0.3, 0,
      0, 0.3, 0.7
    ],
    tritanopia: [
      0.95, 0.05, 0,
      0, 0.43333, 0.56667,
      0, 0.475, 0.525
    ],
    achromatopsia: [
      0.299, 0.587, 0.114,
      0.299, 0.587, 0.114,
      0.299, 0.587, 0.114
    ]
  };

  const m = matrices[type];
  if (!m) return { r, g, b };

  const simR = Math.round(m[0] * r + m[1] * g + m[2] * b);
  const simG = Math.round(m[3] * r + m[4] * g + m[5] * b);
  const simB = Math.round(m[6] * r + m[7] * g + m[8] * b);

  return {
    r: Math.min(255, Math.max(0, simR)),
    g: Math.min(255, Math.max(0, simG)),
    b: Math.min(255, Math.max(0, simB))
  };
}

export default function ColorConverter() {
  // Source of truth color: RGB
  const [rgb, setRgb] = useState({ r: 99, g: 102, b: 241 }); // Violet-ish default

  // Temporary string input values to allow editing/typing
  const [hexInput, setHexInput] = useState("#6366F1");
  const [rInput, setRInput] = useState("99");
  const [gInput, setGInput] = useState("102");
  const [bInput, setBInput] = useState("241");

  const [hInput, setHInput] = useState("239");
  const [sInput, setSInput] = useState("84");
  const [lInput, setLInput] = useState("67");

  const [hsvHInput, setHsvHInput] = useState("239");
  const [hsvSInput, setHsvSInput] = useState("59");
  const [hsvVInput, setHsvVInput] = useState("95");

  const [cmykCInput, setCmykCInput] = useState("59");
  const [cmykMInput, setCmykMInput] = useState("58");
  const [cmykYInput, setCmykYInput] = useState("0");
  const [cmykKInput, setCmykKInput] = useState("5");

  // Advanced options toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // WCAG custom test color background
  const [wcagBgInput, setWcagBgInput] = useState("#FFFFFF");
  const [wcagBg, setWcagBg] = useState({ r: 255, g: 255, b: 255 });

  // Sync inputs when rgb source changes
  useEffect(() => {
    setHexInput(rgbToHex(rgb.r, rgb.g, rgb.b));
    setRInput(rgb.r.toString());
    setGInput(rgb.g.toString());
    setBInput(rgb.b.toString());

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setHInput(hsl.h.toString());
    setSInput(hsl.s.toString());
    setLInput(hsl.l.toString());

    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHsvHInput(hsv.h.toString());
    setHsvSInput(hsv.s.toString());
    setHsvVInput(hsv.v.toString());

    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setCmykCInput(cmyk.c.toString());
    setCmykMInput(cmyk.m.toString());
    setCmykYInput(cmyk.y.toString());
    setCmykKInput(cmyk.k.toString());
  }, [rgb]);

  // Handle HexColorPicker input
  const handlePickerChange = (hex) => {
    const parsed = hexToRgb(hex);
    if (parsed) {
      setRgb(parsed);
    }
  };

  // Input value validators and updates
  const handleHexChange = (val) => {
    setHexInput(val);
    const parsed = hexToRgb(val);
    if (parsed) {
      setRgb(parsed);
    }
  };

  const handleRgbChange = (channel, val) => {
    let num = parseInt(val) || 0;
    if (num < 0) num = 0;
    if (num > 255) num = 255;

    const nextRgb = { ...rgb, [channel]: num };
    if (channel === "r") setRInput(val);
    if (channel === "g") setGInput(val);
    if (channel === "b") setBInput(val);

    setRgb(nextRgb);
  };

  const handleHslChange = (param, val) => {
    let num = parseInt(val) || 0;
    if (param === "h") {
      num = ((num % 360) + 360) % 360;
      setHInput(val);
    } else {
      if (num < 0) num = 0;
      if (num > 100) num = 100;
      if (param === "s") setSInput(val);
      if (param === "l") setLInput(val);
    }

    const currentHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const nextHsl = {
      h: param === "h" ? num : currentHsl.h,
      s: param === "s" ? num : currentHsl.s,
      l: param === "l" ? num : currentHsl.l,
    };

    setRgb(hslToRgb(nextHsl.h, nextHsl.s, nextHsl.l));
  };

  const handleHsvChange = (param, val) => {
    let num = parseInt(val) || 0;
    if (param === "h") {
      num = ((num % 360) + 360) % 360;
      setHsvHInput(val);
    } else {
      if (num < 0) num = 0;
      if (num > 100) num = 100;
      if (param === "s") setHsvSInput(val);
      if (param === "v") setHsvVInput(val);
    }

    const currentHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const nextHsv = {
      h: param === "h" ? num : currentHsv.h,
      s: param === "s" ? num : currentHsv.s,
      v: param === "v" ? num : currentHsv.v,
    };

    setRgb(hsvToRgb(nextHsv.h, nextHsv.s, nextHsv.v));
  };

  const handleCmykChange = (param, val) => {
    let num = parseInt(val) || 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;

    if (param === "c") setCmykCInput(val);
    if (param === "m") setCmykMInput(val);
    if (param === "y") setCmykYInput(val);
    if (param === "k") setCmykKInput(val);

    const currentCmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const nextCmyk = {
      c: param === "c" ? num : currentCmyk.c,
      m: param === "m" ? num : currentCmyk.m,
      y: param === "y" ? num : currentCmyk.y,
      k: param === "k" ? num : currentCmyk.k,
    };

    setRgb(cmykToRgb(nextCmyk.c, nextCmyk.m, nextCmyk.y, nextCmyk.k));
  };

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    setRgb({ r, g, b });
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label || "Color value"} copied to clipboard!`);
  };

  const copyAllFormats = () => {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    const summary = `HEX: ${hex}
RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})
HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)
HSV: hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)
CMYK: cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    copyToClipboard(summary, "All color formats");
  };

  // Harmonies Calculation based on primary color
  const getHarmonies = () => {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Helper to format HSL to HEX
    const hslHex = (h, s, l) => {
      const rgbVal = hslToRgb(h, s, l);
      return rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b);
    };

    return [
      {
        name: "Complementary",
        desc: "Color directly opposite on the color wheel (180° shift).",
        colors: [hex, hslHex((hsl.h + 180) % 360, hsl.s, hsl.l)],
      },
      {
        name: "Analogous",
        desc: "Three adjacent colors on the wheel (30° left/right shifts).",
        colors: [
          hslHex((hsl.h + 330) % 360, hsl.s, hsl.l),
          hex,
          hslHex((hsl.h + 30) % 360, hsl.s, hsl.l),
        ],
      },
      {
        name: "Triadic",
        desc: "Three colors spaced equally at 120° intervals.",
        colors: [
          hex,
          hslHex((hsl.h + 120) % 360, hsl.s, hsl.l),
          hslHex((hsl.h + 240) % 360, hsl.s, hsl.l),
        ],
      },
      {
        name: "Split Complementary",
        desc: "Base color plus the two colors adjacent to its complement (150° and 210° shifts).",
        colors: [
          hex,
          hslHex((hsl.h + 150) % 360, hsl.s, hsl.l),
          hslHex((hsl.h + 210) % 360, hsl.s, hsl.l),
        ],
      },
      {
        name: "Monochromatic",
        desc: "Variations in lightness of the same base hue.",
        colors: [
          hslHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30)),
          hslHex(hsl.h, hsl.s, Math.max(20, hsl.l - 15)),
          hex,
          hslHex(hsl.h, hsl.s, Math.min(90, hsl.l + 15)),
          hslHex(hsl.h, hsl.s, Math.min(95, hsl.l + 30)),
        ],
      },
      {
        name: "Tetradic (Double Complementary)",
        desc: "Four colors arranged in two complementary pairs spaced 90° apart.",
        colors: [
          hex,
          hslHex((hsl.h + 90) % 360, hsl.s, hsl.l),
          hslHex((hsl.h + 180) % 360, hsl.s, hsl.l),
          hslHex((hsl.h + 270) % 360, hsl.s, hsl.l),
        ],
      },
    ];
  };

  // Tints & Shades Calculation
  const getTintsAndShades = () => {
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const shades = [];
    const tints = [];

    // Tints (moving towards pure white - lightness 100%)
    for (let i = 1; i <= 9; i++) {
      const stepL = hsl.l + (100 - hsl.l) * (i / 10);
      const rgbVal = hslToRgb(hsl.h, hsl.s, stepL);
      tints.push(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b));
    }

    // Shades (moving towards pure black - lightness 0%)
    for (let i = 1; i <= 9; i++) {
      const stepL = hsl.l * (1 - i / 10);
      const rgbVal = hslToRgb(hsl.h, hsl.s, stepL);
      shades.push(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b));
    }

    return {
      tints: tints.reverse(), // Lightest first
      shades: shades, // Darkest first
    };
  };

  // Color Blindness Simulations
  const getSimulations = () => {
    const types = [
      { name: "Protanopia", desc: "Red-blind (1% of males)", id: "protanopia" },
      { name: "Deuteranopia", desc: "Green-blind (1% of males)", id: "deuteranopia" },
      { name: "Tritanopia", desc: "Blue-blind (<1% of population)", id: "tritanopia" },
      { name: "Achromatopsia", desc: "Monochromacy (Complete color blindness)", id: "achromatopsia" },
    ];

    return types.map((type) => {
      const simRgb = simulateColorBlindness(rgb.r, rgb.g, rgb.b, type.id);
      return {
        ...type,
        hex: rgbToHex(simRgb.r, simRgb.g, simRgb.b),
        rgb: simRgb,
      };
    });
  };

  // Contrast evaluations
  const contrastRatioBg = getContrastRatio(rgb, wcagBg);
  const contrastRatioWhite = getContrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const contrastRatioBlack = getContrastRatio(rgb, { r: 0, g: 0, b: 0 });

  const getWCAGResult = (ratio, levelRequired) => {
    // levelRequired: AA_normal (4.5), AA_large (3.0), AAA_normal (7.0), AAA_large (4.5)
    return ratio >= levelRequired;
  };

  return (
    <ToolPageShell widthClassName="max-w-6xl" className="px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* ── Title & Intro Header ── */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 self-start">
            <Palette size={12} /> Color Utility
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Color Converter
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Convert color codes seamlessly between HEX, RGB, HSL, HSV, and CMYK formats. Adjust hue, saturation, and brightness sliders in real-time, and expand Advanced Options to check accessibility, harmonies, shades, and visual deficiencies.
          </p>
        </div>

        {/* ── Main Color Workstation ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Color Preview & Pickers */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-6">
              {/* Dynamic Preview Box */}
              <div
                className="w-full h-36 rounded-xl shadow-inner relative overflow-hidden transition-all duration-300 flex items-center justify-center cursor-pointer group"
                style={{ backgroundColor: rgbToHex(rgb.r, rgb.g, rgb.b) }}
                onClick={() => copyToClipboard(rgbToHex(rgb.r, rgb.g, rgb.b), "HEX code")}
              >
                {/* Visual Glass panel inside preview */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 opacity-60 pointer-events-none" />
                <div className="bg-black/45 backdrop-blur-md px-4 py-2 rounded-lg text-white font-mono text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 select-none">
                  <Copy size={14} /> Copy HEX
                </div>
              </div>

              {/* Advanced Color Picker */}
              <div className="w-full flex justify-center py-2 custom-picker">
                <HexColorPicker
                  color={rgbToHex(rgb.r, rgb.g, rgb.b)}
                  onChange={handlePickerChange}
                  className="!w-full !h-48"
                />
              </div>

              {/* Quick Utility Toolbar */}
              <div className="flex gap-2">
                <button
                  onClick={generateRandomColor}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <RefreshCw size={14} /> Random Color
                </button>
                <button
                  onClick={copyAllFormats}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-sm shadow-indigo-600/10"
                >
                  <Sparkles size={14} /> Copy All Formats
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Digital Color Values Inputs & Sliders */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Sliders size={18} className="text-indigo-500" /> Color Space Codes
              </h2>

              {/* Conversion Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* HEX */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">HEX</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={hexInput}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                    />
                    <button
                      onClick={() => copyToClipboard(hexInput, "HEX")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                {/* RGB */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">RGB</label>
                  <div className="relative">
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="R"
                        value={rInput}
                        onChange={(e) => handleRgbChange("r", e.target.value)}
                        className="w-1/3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="G"
                        value={gInput}
                        onChange={(e) => handleRgbChange("g", e.target.value)}
                        className="w-1/3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="B"
                        value={bInput}
                        onChange={(e) => handleRgbChange("b", e.target.value)}
                        className="w-1/3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "RGB")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white/80 dark:bg-gray-900/80 p-1 rounded-md"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                {/* HSL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">HSL</label>
                  <div className="relative">
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="H"
                        value={hInput}
                        onChange={(e) => handleHslChange("h", e.target.value)}
                        className="w-1/3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="S%"
                        value={sInput}
                        onChange={(e) => handleHslChange("s", e.target.value)}
                        className="w-1/3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="L%"
                        value={lInput}
                        onChange={(e) => handleHslChange("l", e.target.value)}
                        className="w-1/3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                        copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "HSL");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white/80 dark:bg-gray-900/80 p-1 rounded-md"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                {/* HSV */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">HSV</label>
                  <div className="relative">
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="H"
                        value={hsvHInput}
                        onChange={(e) => handleHsvChange("h", e.target.value)}
                        className="w-1/3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="S%"
                        value={hsvSInput}
                        onChange={(e) => handleHsvChange("s", e.target.value)}
                        className="w-1/3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="V%"
                        value={hsvVInput}
                        onChange={(e) => handleHsvChange("v", e.target.value)}
                        className="w-1/3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                        copyToClipboard(`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`, "HSV");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white/80 dark:bg-gray-900/80 p-1 rounded-md"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                {/* CMYK */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CMYK</label>
                  <div className="relative">
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="C%"
                        value={cmykCInput}
                        onChange={(e) => handleCmykChange("c", e.target.value)}
                        className="w-1/4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="M%"
                        value={cmykMInput}
                        onChange={(e) => handleCmykChange("m", e.target.value)}
                        className="w-1/4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Y%"
                        value={cmykYInput}
                        onChange={(e) => handleCmykChange("y", e.target.value)}
                        className="w-1/4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="K%"
                        value={cmykKInput}
                        onChange={(e) => handleCmykChange("k", e.target.value)}
                        className="w-1/4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2.5 text-sm font-mono text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
                        copyToClipboard(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, "CMYK");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white/80 dark:bg-gray-900/80 p-1 rounded-md"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Adjustments Sliders */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col gap-5">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Interactive HSL Sliders</h3>
                <div className="flex flex-col gap-4">
                  {/* Hue */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                      <span>Hue</span>
                      <span className="font-mono">{rgbToHsl(rgb.r, rgb.g, rgb.b).h}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={rgbToHsl(rgb.r, rgb.g, rgb.b).h}
                      onChange={(e) => handleHslChange("h", e.target.value)}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0"
                      style={{
                        background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                      }}
                    />
                  </div>

                  {/* Saturation */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                      <span>Saturation</span>
                      <span className="font-mono">{rgbToHsl(rgb.r, rgb.g, rgb.b).s}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rgbToHsl(rgb.r, rgb.g, rgb.b).s}
                      onChange={(e) => handleHslChange("s", e.target.value)}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0"
                      style={{
                        background: `linear-gradient(to right, ${hslToHexStr(rgbToHsl(rgb.r, rgb.g, rgb.b).h, 0, rgbToHsl(rgb.r, rgb.g, rgb.b).l)}, ${hslToHexStr(rgbToHsl(rgb.r, rgb.g, rgb.b).h, 100, rgbToHsl(rgb.r, rgb.g, rgb.b).l)})`,
                      }}
                    />
                  </div>

                  {/* Lightness */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                      <span>Lightness</span>
                      <span className="font-mono">{rgbToHsl(rgb.r, rgb.g, rgb.b).l}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rgbToHsl(rgb.r, rgb.g, rgb.b).l}
                      onChange={(e) => handleHslChange("l", e.target.value)}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0"
                      style={{
                        background: `linear-gradient(to right, #000000, ${hslToHexStr(rgbToHsl(rgb.r, rgb.g, rgb.b).h, rgbToHsl(rgb.r, rgb.g, rgb.b).s, 50)}, #ffffff)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Collapsible Advanced Options Toggle ── */}
        <div className="flex flex-col">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm cursor-pointer select-none group"
          >
            <span className="flex items-center gap-3 text-sm md:text-base">
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Sliders size={18} />
              </span>
              Advanced Options
            </span>
            <span>
              {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-6 flex flex-col gap-8">
                  {/* Grid layout for Advanced Tools */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Harmonies & Shades Panel */}
                    <div className="lg:col-span-7 flex flex-col gap-8">
                      {/* Color Harmonies */}
                      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-6">
                        <div>
                          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Palette size={16} className="text-indigo-500" /> Color Harmonies
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Classic color combination rules generator. Click any block to select it.
                          </p>
                        </div>

                        <div className="flex flex-col gap-5">
                          {getHarmonies().map((harmony) => (
                            <div key={harmony.name} className="flex flex-col gap-2">
                              <div className="flex items-baseline justify-between">
                                <h4 className="text-xs font-extrabold text-gray-700 dark:text-gray-300">{harmony.name}</h4>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 italic max-w-xs text-right hidden sm:inline">
                                  {harmony.desc}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 h-10 w-full rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/30 p-1">
                                {harmony.colors.map((colorHex, idx) => (
                                  <div
                                    key={idx}
                                    className="flex-1 h-full rounded-md cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] border border-black/5 flex items-center justify-center group/swatch relative"
                                    style={{ backgroundColor: colorHex }}
                                    onClick={() => handlePickerChange(colorHex)}
                                  >
                                    <span
                                      className="text-[10px] font-mono font-bold bg-black/60 text-white rounded px-1.5 py-0.5 opacity-0 group-hover/swatch:opacity-100 transition-opacity pointer-events-none"
                                      style={{ color: getContrastRatio(hexToRgb(colorHex), { r: 0, g: 0, b: 0 }) > 4.5 ? "#000" : "#fff", backgroundColor: getContrastRatio(hexToRgb(colorHex), { r: 0, g: 0, b: 0 }) > 4.5 ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)" }}
                                    >
                                      {colorHex}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tints & Shades */}
                      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-6">
                        <div>
                          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Sliders size={16} className="text-indigo-500" /> Tints & Shades
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Lighter variations (tints) and darker variations (shades) in 10% steps.
                          </p>
                        </div>

                        {/* Rendering tints and shades */}
                        {(() => {
                          const { tints, shades } = getTintsAndShades();
                          const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          return (
                            <div className="flex flex-col gap-5">
                              {/* Tints (lighter) */}
                              <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-extrabold text-gray-700 dark:text-gray-300">Tints (Lighter)</h4>
                                <div className="flex gap-1 h-9 bg-gray-50 dark:bg-gray-800/30 p-1 rounded-lg">
                                  {tints.map((hexVal) => (
                                    <div
                                      key={hexVal}
                                      onClick={() => handlePickerChange(hexVal)}
                                      className="flex-1 h-full rounded-md cursor-pointer transition-all hover:scale-105 border border-black/5"
                                      style={{ backgroundColor: hexVal }}
                                      title={`Tint: ${hexVal}`}
                                    />
                                  ))}
                                  <div
                                    className="flex-1 h-full rounded-md border-2 border-indigo-500 shadow-sm shadow-indigo-500/20"
                                    style={{ backgroundColor: currentHex }}
                                    title={`Base: ${currentHex}`}
                                  />
                                </div>
                              </div>

                              {/* Shades (darker) */}
                              <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-extrabold text-gray-700 dark:text-gray-300">Shades (Darker)</h4>
                                <div className="flex gap-1 h-9 bg-gray-50 dark:bg-gray-800/30 p-1 rounded-lg">
                                  <div
                                    className="flex-1 h-full rounded-md border-2 border-indigo-500 shadow-sm shadow-indigo-500/20"
                                    style={{ backgroundColor: currentHex }}
                                    title={`Base: ${currentHex}`}
                                  />
                                  {shades.map((hexVal) => (
                                    <div
                                      key={hexVal}
                                      onClick={() => handlePickerChange(hexVal)}
                                      className="flex-1 h-full rounded-md cursor-pointer transition-all hover:scale-105 border border-black/5"
                                      style={{ backgroundColor: hexVal }}
                                      title={`Shade: ${hexVal}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* WCAG & Color Blindness Simulator Panel */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                      {/* WCAG Contrast Checker */}
                      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-6">
                        <div>
                          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Eye size={16} className="text-indigo-500" /> WCAG Accessibility
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Verify color readability standards (WCAG 2.1 contrast rules).
                          </p>
                        </div>

                        {/* Interactive testing target */}
                        <div className="flex flex-col gap-4">
                          {/* Choose test target */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Test Against Color</label>
                              <span className="text-[10px] font-mono text-gray-400">{wcagBgInput}</span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={wcagBgInput}
                                onChange={(e) => {
                                  setWcagBgInput(e.target.value);
                                  const rgbVal = hexToRgb(e.target.value);
                                  if (rgbVal) setWcagBg(rgbVal);
                                }}
                                className="w-10 h-10 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer p-0.5"
                              />
                              <input
                                type="text"
                                value={wcagBgInput}
                                onChange={(e) => {
                                  setWcagBgInput(e.target.value);
                                  const rgbVal = hexToRgb(e.target.value);
                                  if (rgbVal) setWcagBg(rgbVal);
                                }}
                                className="flex-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-mono text-gray-800 dark:text-white focus:outline-none uppercase"
                              />
                            </div>
                          </div>

                          {/* Preview swatches */}
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            {/* Text on background */}
                            <div
                              className="rounded-xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm border border-black/5"
                              style={{ backgroundColor: rgbToHex(rgb.r, rgb.g, rgb.b), color: wcagBgInput }}
                            >
                              <span className="text-xl font-black">Aa</span>
                              <span className="text-[10px] font-semibold opacity-85">Text Sample</span>
                            </div>
                            {/* Background on text */}
                            <div
                              className="rounded-xl p-4 flex flex-col items-center justify-center gap-1 shadow-sm border border-black/5"
                              style={{ backgroundColor: wcagBgInput, color: rgbToHex(rgb.r, rgb.g, rgb.b) }}
                            >
                              <span className="text-xl font-black">Aa</span>
                              <span className="text-[10px] font-semibold opacity-85">Text Sample</span>
                            </div>
                          </div>

                          {/* Results Badges */}
                          <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Contrast Ratio</span>
                              <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                                {contrastRatioBg.toFixed(2)}:1
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-800/40">
                              {/* AA Normal */}
                              <div className="flex items-center justify-between text-xs bg-white dark:bg-gray-900 p-2 rounded-lg border border-black/5">
                                <span className="font-medium text-gray-600 dark:text-gray-400">AA (Normal)</span>
                                {getWCAGResult(contrastRatioBg, 4.5) ? (
                                  <CheckCircle2 size={14} className="text-emerald-500" />
                                ) : (
                                  <XCircle size={14} className="text-red-500" />
                                )}
                              </div>
                              {/* AA Large */}
                              <div className="flex items-center justify-between text-xs bg-white dark:bg-gray-900 p-2 rounded-lg border border-black/5">
                                <span className="font-medium text-gray-600 dark:text-gray-400">AA (Large)</span>
                                {getWCAGResult(contrastRatioBg, 3.0) ? (
                                  <CheckCircle2 size={14} className="text-emerald-500" />
                                ) : (
                                  <XCircle size={14} className="text-red-500" />
                                )}
                              </div>
                              {/* AAA Normal */}
                              <div className="flex items-center justify-between text-xs bg-white dark:bg-gray-900 p-2 rounded-lg border border-black/5">
                                <span className="font-medium text-gray-600 dark:text-gray-400">AAA (Normal)</span>
                                {getWCAGResult(contrastRatioBg, 7.0) ? (
                                  <CheckCircle2 size={14} className="text-emerald-500" />
                                ) : (
                                  <XCircle size={14} className="text-red-500" />
                                )}
                              </div>
                              {/* AAA Large */}
                              <div className="flex items-center justify-between text-xs bg-white dark:bg-gray-900 p-2 rounded-lg border border-black/5">
                                <span className="font-medium text-gray-600 dark:text-gray-400">AAA (Large)</span>
                                {getWCAGResult(contrastRatioBg, 4.5) ? (
                                  <CheckCircle2 size={14} className="text-emerald-500" />
                                ) : (
                                  <XCircle size={14} className="text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Color Blindness Simulator */}
                      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-6">
                        <div>
                          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Eye size={16} className="text-indigo-500" /> Color Blindness Simulator
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Simulates how the color looks to individuals with color deficiencies.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {getSimulations().map((sim) => (
                            <div
                              key={sim.id}
                              className="bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-850 p-2.5 rounded-xl flex flex-col gap-2 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-800 transition-colors"
                              onClick={() => copyToClipboard(sim.hex, sim.name)}
                            >
                              <div className="w-full h-12 rounded-lg shadow-sm border border-black/5" style={{ backgroundColor: sim.hex }} />
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 leading-tight">{sim.name}</span>
                                <span className="text-[8px] text-gray-400 dark:text-gray-500 font-medium truncate mt-0.5 leading-none">{sim.desc}</span>
                                <span className="text-[9px] font-mono text-gray-500 mt-1">{sim.hex}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Detailed Documentation Card ── */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/30 dark:from-indigo-950/30 dark:to-indigo-900/10 border border-indigo-100 dark:border-indigo-900/40 p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
            <Info size={18} className="text-indigo-500" /> How It Works & Conversions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Choose Color Mode",
                desc: "Type into any color space field, slide HSL values, or interact directly with the wheel color picker.",
              },
              {
                step: "2",
                title: "View Multi-space Outputs",
                desc: "Watch as values sync instantly to HEX, rgb(), hsl(), hsv(), and cmyk() configurations.",
              },
              {
                step: "3",
                title: "Inspect Advanced Profiles",
                desc: "Compare harmonies, tints/shades, color-blind simulations, and calculate live WCAG ratios against custom color backgrounds.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {step}
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-indigo-950 dark:text-indigo-200 text-sm">
                    {title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}

// ─────────────────────────────────────────────
// Secondary Color Code Helpers
// ─────────────────────────────────────────────

function hslToHexStr(h, s, l) {
  const rgbVal = hslToRgb(h, s, l);
  return rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b);
}
