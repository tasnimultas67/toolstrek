"use client";

import React, { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  Box,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Shuffle,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  Sun,
  Moon,
  Info,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "@/components/BackButton";

// ─── Default Layer Template ──────────────────────────────────────────────────
const createDefaultLayer = (overrides = {}) => ({
  id: Math.random().toString(36).substring(2, 9),
  name: "Layer 1",
  inset: false,
  x: 0,
  y: 10,
  blur: 25,
  spread: -5,
  color: "#000000",
  opacity: 0.1,
  enabled: true,
  ...overrides,
});

// ─── Curated Presets ─────────────────────────────────────────────────────────
const PRESETS = [
  {
    name: "Subtle Elevation",
    description: "Delicate, clean card shadow for modern SaaS interfaces",
    layers: [
      { inset: false, x: 0, y: 1, blur: 3, spread: 0, color: "#000000", opacity: 0.08, enabled: true },
      { inset: false, x: 0, y: 1, blur: 2, spread: -1, color: "#000000", opacity: 0.08, enabled: true },
    ],
  },
  {
    name: "Smooth Floating",
    description: "Dual-layer ambient & directional shadow for floating elements",
    layers: [
      { inset: false, x: 0, y: 10, blur: 25, spread: -5, color: "#000000", opacity: 0.1, enabled: true },
      { inset: false, x: 0, y: 8, blur: 10, spread: -6, color: "#000000", opacity: 0.1, enabled: true },
    ],
  },
  {
    name: "High Modal Pop",
    description: "Deep, realistic elevation for dialogs, modals, and popovers",
    layers: [
      { inset: false, x: 0, y: 20, blur: 40, spread: -10, color: "#000000", opacity: 0.18, enabled: true },
      { inset: false, x: 0, y: 10, blur: 15, spread: -3, color: "#000000", opacity: 0.08, enabled: true },
    ],
  },
  {
    name: "Neo-Brutalism",
    description: "Bold, unblurred retro offset shadow with high graphic punch",
    layers: [
      { inset: false, x: 6, y: 6, blur: 0, spread: 0, color: "#000000", opacity: 1, enabled: true },
    ],
  },
  {
    name: "Inner Depth (Inset)",
    description: "Pressed, recessed appearance for inputs and well panels",
    layers: [
      { inset: true, x: 0, y: 3, blur: 6, spread: 0, color: "#000000", opacity: 0.15, enabled: true },
      { inset: true, x: 0, y: 1, blur: 2, spread: 0, color: "#000000", opacity: 0.08, enabled: true },
    ],
  },
  {
    name: "Violet SaaS Glow",
    description: "Signature modern brand glow for active primary buttons & badges",
    layers: [
      { inset: false, x: 0, y: 10, blur: 25, spread: -3, color: "#7c00fe", opacity: 0.35, enabled: true },
      { inset: false, x: 0, y: 4, blur: 8, spread: -2, color: "#7c00fe", opacity: 0.2, enabled: true },
    ],
  },
  {
    name: "Cyberpunk Cyan",
    description: "High-contrast neon glow for futuristic dark designs",
    layers: [
      { inset: false, x: 0, y: 0, blur: 25, spread: 2, color: "#06b6d4", opacity: 0.45, enabled: true },
      { inset: false, x: 0, y: 12, blur: 30, spread: -8, color: "#0284c7", opacity: 0.3, enabled: true },
    ],
  },
  {
    name: "Warm Sunset",
    description: "Warm, radiant ambient glow ideal for highlight cards",
    layers: [
      { inset: false, x: 0, y: 12, blur: 28, spread: -4, color: "#f97316", opacity: 0.3, enabled: true },
      { inset: false, x: 0, y: 4, blur: 10, spread: -2, color: "#e11d48", opacity: 0.2, enabled: true },
    ],
  },
  {
    name: "Hard Drop Outline",
    description: "Clean directional 2D popout shadow",
    layers: [
      { inset: false, x: 4, y: 4, blur: 0, spread: 2, color: "#1e293b", opacity: 0.9, enabled: true },
    ],
  },
  {
    name: "Subtle Stripe Style",
    description: "3-layer ultra-soft photorealistic elevation",
    layers: [
      { inset: false, x: 0, y: 50, blur: 100, spread: -20, color: "#32325d", opacity: 0.25, enabled: true },
      { inset: false, x: 0, y: 30, blur: 60, spread: -30, color: "#000000", opacity: 0.3, enabled: true },
      { inset: true, x: 0, y: -2, blur: 6, spread: 0, color: "#000000", opacity: 0.04, enabled: true },
    ],
  },
];

// Quick color presets
const COLOR_SWATCHES = [
  { label: "Pure Black", hex: "#000000" },
  { label: "Dark Slate", hex: "#0f172a" },
  { label: "Brand Violet", hex: "#7c00fe" },
  { label: "Indigo", hex: "#4f46e5" },
  { label: "Cyan Neon", hex: "#06b6d4" },
  { label: "Emerald", hex: "#10b981" },
  { label: "Amber Warm", hex: "#f59e0b" },
  { label: "Rose Crimson", hex: "#f43f5e" },
];

// Helper: convert hex + opacity to rgba string
function hexToRgba(hex, opacity) {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  if (cleanHex.length !== 6) {
    return `rgba(0, 0, 0, ${opacity})`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const alpha = Math.max(0, Math.min(1, parseFloat(opacity.toFixed(2))));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Format single layer to CSS string
function layerToCssString(layer) {
  const colorStr = hexToRgba(layer.color, layer.opacity);
  const insetText = layer.inset ? "inset " : "";
  return `${insetText}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${colorStr}`;
}

export default function BoxShadowGenerator() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [layers, setLayers] = useState([
    createDefaultLayer({
      name: "Layer 1",
      x: 0,
      y: 10,
      blur: 25,
      spread: -5,
      color: "#000000",
      opacity: 0.1,
    }),
    createDefaultLayer({
      name: "Layer 2",
      x: 0,
      y: 4,
      blur: 10,
      spread: -2,
      color: "#000000",
      opacity: 0.06,
    }),
  ]);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);

  // Preview options
  const [canvasBg, setCanvasBg] = useState("slate"); // "white" | "slate" | "dark" | "midnight"
  const [boxColor, setBoxColor] = useState("#ffffff");
  const [borderRadius, setBorderRadius] = useState(16);
  const [boxSize, setBoxSize] = useState(200); // 160 to 260
  const [mockContent, setMockContent] = useState(true);
  const [hoverEffect, setHoverEffect] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Code format tab
  const [codeTab, setCodeTab] = useState("css"); // "css" | "tailwind" | "prefixes"
  const [copied, setCopied] = useState(false);

  // Active layer safely
  const activeLayer = layers[activeLayerIndex] || layers[0];

  // Update specific field in current active layer
  const updateActiveLayer = useCallback(
    (key, value) => {
      setLayers((prev) =>
        prev.map((l, idx) => (idx === activeLayerIndex ? { ...l, [key]: value } : l))
      );
    },
    [activeLayerIndex]
  );

  // Add new layer
  const handleAddLayer = () => {
    if (layers.length >= 5) {
      toast.info("Maximum 5 shadow layers allowed to keep CSS clean and fast!");
      return;
    }
    const newLayer = createDefaultLayer({
      name: `Layer ${layers.length + 1}`,
      x: 0,
      y: 15,
      blur: 30,
      spread: 0,
      color: activeLayer ? activeLayer.color : "#000000",
      opacity: 0.12,
    });
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerIndex(layers.length);
    toast.success(`Shadow layer ${layers.length + 1} added!`);
  };

  // Remove layer
  const handleRemoveLayer = (idx, e) => {
    e?.stopPropagation();
    if (layers.length <= 1) {
      toast.error("You must have at least one shadow layer.");
      return;
    }
    const filtered = layers.filter((_, i) => i !== idx);
    setLayers(filtered);
    setActiveLayerIndex(Math.max(0, idx - 1));
    toast.info("Layer removed");
  };

  // Toggle layer enable/disable
  const handleToggleLayer = (idx, e) => {
    e?.stopPropagation();
    setLayers((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, enabled: !l.enabled } : l))
    );
  };

  // Apply Preset
  const handleApplyPreset = (preset) => {
    setLayers(
      preset.layers.map((l, i) =>
        createDefaultLayer({
          ...l,
          name: `Layer ${i + 1}`,
        })
      )
    );
    setActiveLayerIndex(0);
    toast.success(`Preset "${preset.name}" applied!`);
  };

  // Randomize Shadow
  const handleRandomize = () => {
    const randomPresets = [
      {
        x: Math.floor(Math.random() * 30) - 15,
        y: Math.floor(Math.random() * 35) + 5,
        blur: Math.floor(Math.random() * 45) + 10,
        spread: Math.floor(Math.random() * 10) - 5,
        color: COLOR_SWATCHES[Math.floor(Math.random() * COLOR_SWATCHES.length)].hex,
        opacity: Math.round((Math.random() * 0.35 + 0.1) * 100) / 100,
        inset: false,
      },
      {
        x: 0,
        y: Math.floor(Math.random() * 10) + 2,
        blur: Math.floor(Math.random() * 15) + 4,
        spread: -2,
        color: "#000000",
        opacity: Math.round((Math.random() * 0.1 + 0.04) * 100) / 100,
        inset: false,
      },
    ];

    setLayers([
      createDefaultLayer({ ...randomPresets[0], name: "Layer 1" }),
      createDefaultLayer({ ...randomPresets[1], name: "Layer 2" }),
    ]);
    setActiveLayerIndex(0);
    toast.success("Randomized shadow created!");
  };

  // Reset to default
  const handleReset = () => {
    setLayers([
      createDefaultLayer({
        name: "Layer 1",
        x: 0,
        y: 10,
        blur: 25,
        spread: -5,
        color: "#000000",
        opacity: 0.1,
      }),
      createDefaultLayer({
        name: "Layer 2",
        x: 0,
        y: 4,
        blur: 10,
        spread: -2,
        color: "#000000",
        opacity: 0.06,
      }),
    ]);
    setActiveLayerIndex(0);
    setBorderRadius(16);
    setBoxColor("#ffffff");
    setCanvasBg("slate");
    toast.info("Reset to default shadow");
  };

  // Computed CSS box-shadow value
  const fullBoxShadowValue = useMemo(() => {
    const activeLayers = layers.filter((l) => l.enabled);
    if (activeLayers.length === 0) return "none";
    return activeLayers.map((l) => layerToCssString(l)).join(", ");
  }, [layers]);

  // Hover box shadow (lifts Y by -4px and expands blur)
  const hoverBoxShadowValue = useMemo(() => {
    const activeLayers = layers.filter((l) => l.enabled);
    if (activeLayers.length === 0) return "none";
    return activeLayers
      .map((l) => {
        const elevatedY = l.inset ? l.y : l.y + 6;
        const elevatedBlur = l.blur + 8;
        const colorStr = hexToRgba(l.color, Math.min(1, l.opacity * 1.15));
        const insetText = l.inset ? "inset " : "";
        return `${insetText}${l.x}px ${elevatedY}px ${elevatedBlur}px ${l.spread}px ${colorStr}`;
      })
      .join(", ");
  }, [layers]);

  // Tailwind arbitrary CSS class string
  const tailwindClassValue = useMemo(() => {
    const activeLayers = layers.filter((l) => l.enabled);
    if (activeLayers.length === 0) return "shadow-none";
    const parts = activeLayers.map((l) => {
      const colorStr = hexToRgba(l.color, l.opacity).replace(/\s+/g, "");
      const insetText = l.inset ? "inset_" : "";
      return `${insetText}${l.x}px_${l.y}px_${l.blur}px_${l.spread}px_${colorStr}`;
    });
    return `shadow-[${parts.join(",")}]`;
  }, [layers]);

  // Cross-browser snippet
  const crossBrowserCss = useMemo(() => {
    return `-webkit-box-shadow: ${fullBoxShadowValue};\n-moz-box-shadow: ${fullBoxShadowValue};\nbox-shadow: ${fullBoxShadowValue};`;
  }, [fullBoxShadowValue]);

  // Get active code output
  const activeCodeSnippet = useMemo(() => {
    if (codeTab === "tailwind") {
      return tailwindClassValue;
    }
    if (codeTab === "prefixes") {
      return crossBrowserCss;
    }
    return `box-shadow: ${fullBoxShadowValue};`;
  }, [codeTab, tailwindClassValue, crossBrowserCss, fullBoxShadowValue]);

  // Copy to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeCodeSnippet);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code to clipboard.");
    }
  };

  // Canvas background styling
  const canvasBgStyle = useMemo(() => {
    switch (canvasBg) {
      case "white":
        return "bg-white text-gray-900 border-gray-200";
      case "slate":
        return "bg-slate-100 dark:bg-slate-900/60 text-gray-800 dark:text-gray-100 border-slate-200 dark:border-slate-800";
      case "dark":
        return "bg-slate-900 text-white border-slate-800";
      case "midnight":
        return "bg-[#030712] text-white border-gray-800";
      default:
        return "bg-slate-100 dark:bg-slate-900/60";
    }
  }, [canvasBg]);

  // Tool metadata for FavoriteButton
  const toolInfo = {
    title: "Box Shadow Generator",
    link: "/tools/box-shadow-generator",
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      {/* ── Top Bar / Header ── */}
      <div className="flex flex-col gap-6 w-full mx-auto mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BackButton className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 transition-all cursor-pointer" />
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-semibold text-brandColor">Developer & CSS Tools</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Generate random shadow"
            >
              <Shuffle className="w-3.5 h-3.5 text-brandColor" />
              <span>Randomize</span>
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Reset to default"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset</span>
            </button>

            <FavoriteButton
              tool={toolInfo}
              className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850"
            />
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-brandColor/10 dark:bg-brandColor/20 text-brandColor mb-3">
            <Box className="w-3.5 h-3.5 text-brandColor" />
            <span>CSS3 Box Shadow Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            CSS Box Shadow Generator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Visually design smooth, modern CSS box shadows. Adjust blur, spread, offsets, and colors with live preview, multi-layer depth, and instant 1-click CSS & Tailwind copy.
          </p>
        </div>
      </div>

      {/* ── Main Workspace: 2-Column Responsive Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Live Preview & Code Output (Sticky on Desktop) ── */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-5">
          {/* Preview Container */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Preview Toolbar */}
            <div className="p-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2 flex-wrap bg-gray-50/50 dark:bg-gray-950/50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brandColor" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Live Preview
                </span>
              </div>

              {/* Canvas Background Selector */}
              <div className="flex items-center gap-1 bg-gray-200/60 dark:bg-gray-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCanvasBg("white")}
                  className={`w-6 h-6 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                    canvasBg === "white"
                      ? "bg-white text-gray-900 border-gray-300 shadow-xs"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                  title="White background"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasBg("slate")}
                  className={`px-1.5 h-6 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                    canvasBg === "slate"
                      ? "bg-white dark:bg-gray-900 text-brandColor border-gray-300 dark:border-gray-700 shadow-xs"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                  title="Slate canvas"
                >
                  Slate
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasBg("dark")}
                  className={`w-6 h-6 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                    canvasBg === "dark"
                      ? "bg-slate-900 text-white border-slate-700 shadow-xs"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                  title="Dark background"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasBg("midnight")}
                  className={`px-1.5 h-6 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                    canvasBg === "midnight"
                      ? "bg-black text-white border-gray-700 shadow-xs"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                  title="Midnight Black canvas"
                >
                  OLED
                </button>
              </div>
            </div>

            {/* Canvas Viewport */}
            <div
              className={`relative min-h-[340px] sm:min-h-[380px] p-8 flex items-center justify-center transition-colors duration-200 border-b border-gray-200 dark:border-gray-800 ${canvasBgStyle}`}
              style={{
                backgroundImage:
                  canvasBg === "white"
                    ? "radial-gradient(#e5e7eb 1px, transparent 1px)"
                    : canvasBg === "slate"
                    ? "radial-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px)"
                    : "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              {/* Central Box Preview */}
              <div
                onMouseEnter={() => hoverEffect && setIsHovered(true)}
                onMouseLeave={() => hoverEffect && setIsHovered(false)}
                className="transition-all duration-300 ease-out flex flex-col items-center justify-center p-5 text-center select-none"
                style={{
                  width: `${boxSize}px`,
                  minHeight: `${boxSize}px`,
                  backgroundColor: boxColor,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: hoverEffect && isHovered ? hoverBoxShadowValue : fullBoxShadowValue,
                  transform: hoverEffect && isHovered ? "translateY(-4px)" : "translateY(0)",
                }}
              >
                {mockContent ? (
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <div className="w-9 h-9 rounded-xl bg-brandColor/15 text-brandColor flex items-center justify-center font-bold text-sm shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        Modern Card
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[140px]">
                        Smooth shadow preview
                      </span>
                    </div>
                    <div className="mt-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-brandColor text-white shadow-xs">
                      Interactive
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-gray-400 pointer-events-none">
                    <Box className="w-6 h-6 stroke-1" />
                    <span className="text-[11px] font-medium font-mono">
                      {boxSize}×{boxSize}px
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Quick Controls: Box Color, Radius & Mock Content Toggle */}
            <div className="p-4 bg-gray-50 dark:bg-gray-950/70 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {/* Box Color */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Box Color
                </label>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-1">
                  <input
                    type="color"
                    value={boxColor}
                    onChange={(e) => setBoxColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={boxColor.toUpperCase()}
                    onChange={(e) => setBoxColor(e.target.value)}
                    className="w-full text-[11px] font-mono text-gray-800 dark:text-gray-200 uppercase bg-transparent outline-none"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Corner Radius */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  <span>Radius</span>
                  <span className="font-mono text-brandColor">{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brandColor"
                />
              </div>

              {/* Content & Hover Toggles */}
              <div className="col-span-2 sm:col-span-1 flex flex-col justify-between gap-1.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Card Mockup</span>
                  <input
                    type="checkbox"
                    checked={mockContent}
                    onChange={(e) => setMockContent(e.target.checked)}
                    className="w-4 h-4 rounded text-brandColor accent-brandColor cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Hover Lift</span>
                  <input
                    type="checkbox"
                    checked={hoverEffect}
                    onChange={(e) => setHoverEffect(e.target.checked)}
                    className="w-4 h-4 rounded text-brandColor accent-brandColor cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ── Generated CSS Code & Copy Snippet ── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Format Tabs & Copy Button */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2 flex-wrap bg-gray-50/50 dark:bg-gray-950/50">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCodeTab("css")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    codeTab === "css"
                      ? "bg-brandColor text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  CSS
                </button>
                <button
                  type="button"
                  onClick={() => setCodeTab("tailwind")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    codeTab === "tailwind"
                      ? "bg-brandColor text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Tailwind CSS
                </button>
                <button
                  type="button"
                  onClick={() => setCodeTab("prefixes")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    codeTab === "prefixes"
                      ? "bg-brandColor text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Vendor Prefixes
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            {/* Code Box */}
            <div className="p-4 bg-gray-950 font-mono text-xs overflow-x-auto text-gray-200">
              <pre className="whitespace-pre-wrap break-all leading-relaxed">
                <code>{activeCodeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* ── Right Column: Shadow Controls & Layer Manager ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Layer Manager Box */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brandColor" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Shadow Layers ({layers.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddLayer}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brandColor/10 hover:bg-brandColor/20 text-brandColor text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Layer</span>
              </button>
            </div>

            {/* Layer Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {layers.map((layer, idx) => (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerIndex(idx)}
                  className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none shrink-0 ${
                    activeLayerIndex === idx
                      ? "bg-brandColor text-white border-brandColor shadow-xs"
                      : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={layer.enabled}
                    onChange={(e) => handleToggleLayer(idx, e)}
                    className="w-3.5 h-3.5 rounded text-white accent-white cursor-pointer"
                    title={layer.enabled ? "Disable layer" : "Enable layer"}
                  />
                  <span>{layer.name || `Layer ${idx + 1}`}</span>
                  {layer.inset && (
                    <span
                      className={`text-[9px] px-1 py-0.5 rounded uppercase font-bold ${
                        activeLayerIndex === idx
                          ? "bg-white/20 text-white"
                          : "bg-brandColor/10 text-brandColor"
                      }`}
                    >
                      Inset
                    </span>
                  )}
                  {layers.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveLayer(idx, e)}
                      className={`p-0.5 rounded transition-all cursor-pointer ${
                        activeLayerIndex === idx
                          ? "hover:bg-white/20 text-white/80 hover:text-white"
                          : "hover:bg-red-100 text-gray-400 hover:text-red-600"
                      }`}
                      title="Delete layer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Active Layer Controls Container */}
            {activeLayer && (
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-5">
                {/* Type Selection (Drop vs Inset) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Shadow Type
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => updateActiveLayer("inset", false)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        !activeLayer.inset
                          ? "bg-brandColor text-white border-brandColor shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Drop Shadow (Outline)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveLayer("inset", true)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeLayer.inset
                          ? "bg-brandColor text-white border-brandColor shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Inset Shadow (Inner)</span>
                    </button>
                  </div>
                </div>

                {/* Sliders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Horizontal Offset (X) */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-850">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Horizontal Offset (X)
                        </span>
                        <span className="text-[10px] text-gray-400">Left / Right</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={activeLayer.x}
                          onChange={(e) => updateActiveLayer("x", Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 text-right font-mono text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        />
                        <span className="text-[10px] text-gray-400 font-mono">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={activeLayer.x}
                      onChange={(e) => updateActiveLayer("x", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brandColor"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>-100px (Left)</span>
                      <span>0px</span>
                      <span>+100px (Right)</span>
                    </div>
                  </div>

                  {/* Vertical Offset (Y) */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-850">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Vertical Offset (Y)
                        </span>
                        <span className="text-[10px] text-gray-400">Up / Down</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={activeLayer.y}
                          onChange={(e) => updateActiveLayer("y", Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 text-right font-mono text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        />
                        <span className="text-[10px] text-gray-400 font-mono">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={activeLayer.y}
                      onChange={(e) => updateActiveLayer("y", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brandColor"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>-100px (Up)</span>
                      <span>0px</span>
                      <span>+100px (Down)</span>
                    </div>
                  </div>

                  {/* Blur Radius */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-850">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Blur Radius
                        </span>
                        <span className="text-[10px] text-gray-400">Softness</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={activeLayer.blur}
                          onChange={(e) =>
                            updateActiveLayer("blur", Math.max(0, Number(e.target.value)))
                          }
                          className="w-16 px-1.5 py-0.5 text-right font-mono text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        />
                        <span className="text-[10px] text-gray-400 font-mono">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeLayer.blur}
                      onChange={(e) => updateActiveLayer("blur", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brandColor"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>0px (Sharp)</span>
                      <span>50px</span>
                      <span>100px (Very Soft)</span>
                    </div>
                  </div>

                  {/* Spread Radius */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-850">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Spread Radius
                        </span>
                        <span className="text-[10px] text-gray-400">Expansion</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="-50"
                          max="50"
                          value={activeLayer.spread}
                          onChange={(e) => updateActiveLayer("spread", Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 text-right font-mono text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        />
                        <span className="text-[10px] text-gray-400 font-mono">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={activeLayer.spread}
                      onChange={(e) => updateActiveLayer("spread", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brandColor"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>-50px (Shrink)</span>
                      <span>0px</span>
                      <span>+50px (Expand)</span>
                    </div>
                  </div>
                </div>

                {/* Color & Opacity Section */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-850 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Color Swatch & Hex input */}
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Shadow Color
                        </label>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5">
                          <input
                            type="color"
                            value={activeLayer.color}
                            onChange={(e) => updateActiveLayer("color", e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                          />
                          <input
                            type="text"
                            value={activeLayer.color.toUpperCase()}
                            onChange={(e) => updateActiveLayer("color", e.target.value)}
                            className="w-20 text-xs font-mono uppercase text-gray-900 dark:text-white bg-transparent outline-none"
                            maxLength={7}
                          />
                        </div>
                      </div>

                      {/* Opacity slider */}
                      <div className="flex-1 min-w-[160px]">
                        <div className="flex justify-between text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                          <span>Opacity</span>
                          <span className="font-mono text-brandColor">
                            {Math.round(activeLayer.opacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round(activeLayer.opacity * 100)}
                          onChange={(e) =>
                            updateActiveLayer("opacity", Number(e.target.value) / 100)
                          }
                          className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brandColor"
                        />
                      </div>
                    </div>

                    {/* Quick Swatches Palette */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Color Swatches
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {COLOR_SWATCHES.map((swatch) => (
                          <button
                            key={swatch.hex}
                            type="button"
                            onClick={() => updateActiveLayer("color", swatch.hex)}
                            className={`w-6 h-6 rounded-lg border transition-all cursor-pointer hover:scale-110 ${
                              activeLayer.color.toLowerCase() === swatch.hex.toLowerCase()
                                ? "ring-2 ring-brandColor ring-offset-2 dark:ring-offset-gray-900"
                                : "border-gray-300 dark:border-gray-700"
                            }`}
                            style={{ backgroundColor: swatch.hex }}
                            title={swatch.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Presets Library Section ── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brandColor" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Curated Presets Library
                </h2>
              </div>
              <span className="text-xs text-gray-400">1-click to apply</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {PRESETS.map((preset) => {
                const presetShadow = preset.layers.map((l) => layerToCssString(l)).join(", ");
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="group relative flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-gray-850 bg-gray-50/70 dark:bg-gray-950/70 hover:border-brandColor/50 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer text-center"
                  >
                    {/* Miniature preview box */}
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-900 my-2 flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ boxShadow: presetShadow }}
                    >
                      <div className="w-2 h-2 rounded-full bg-brandColor/30" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-brandColor mt-1 line-clamp-1">
                      {preset.name}
                    </span>
                    <span className="text-[9px] text-gray-400 line-clamp-1 mt-0.5">
                      {preset.layers.length} layer{preset.layers.length > 1 ? "s" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Educational Guide & FAQs (SEO Optimized) ── */}
      <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-12">
        {/* How It Works & Properties Guide */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-brandColor/10 dark:bg-brandColor/20 text-brandColor mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>CSS Box-Shadow Anatomy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Understanding CSS Box Shadow Syntax
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A quick reference guide on how each CSS box-shadow property functions under the hood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs mb-3">
                X / Y
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Horizontal & Vertical Offsets
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Controls the directional distance of the shadow. Positive <strong>X</strong> moves the shadow right, negative moves left. Positive <strong>Y</strong> moves it down, mimicking an overhead light source.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-brandColor flex items-center justify-center font-bold text-xs mb-3">
                Blur
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Blur Radius
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Determines shadow sharpness. A value of <code>0px</code> produces a crisp, sharp shadow (ideal for neo-brutalism). Higher values soften and diffuse the shadow edge outward.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
                Spread
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Spread Radius
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Expands or compresses the shadow relative to the box perimeter. Positive spread makes the shadow larger; negative spread pulls the shadow inward for realistic soft elevation.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xs mb-3">
                Inset
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Inset (Inner Shadow)
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Changes the shadow from an outer drop shadow to an inner recessed shadow. Perfect for pressed button states, input form focus fields, and neumorphic depth effects.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Everything you need to know about CSS box shadows and web implementation.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                q: "How do I create realistic multi-layer box shadows?",
                a: "Real-world light sources create two shadows: a tight, sharp ambient occlusion shadow right under the object, and a larger, soft diffuse shadow cast further away. You can recreate this by adding 2 or 3 layers in our tool: Layer 1 with a small Y offset (2-4px) and small blur, and Layer 2 with a larger Y offset (10-25px) and higher blur.",
              },
              {
                q: "How do I use this box shadow in Tailwind CSS?",
                a: "Tailwind CSS supports arbitrary values via brackets. In the Code Output section above, click the 'Tailwind CSS' tab to instantly get the formatted class (e.g., `shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.1)]`). Simply paste it into your JSX or HTML className attribute.",
              },
              {
                q: "What is the difference between CSS box-shadow and drop-shadow?",
                a: "The `box-shadow` property casts a shadow based strictly on the rectangular bounding box (or `border-radius`) of the HTML element. In contrast, CSS `filter: drop-shadow(...)` traces transparent PNG images, SVG paths, or clipped elements. For standard UI cards, buttons, and modals, `box-shadow` is much faster and more flexible.",
              },
              {
                q: "Does box-shadow impact webpage rendering performance?",
                a: "CSS box shadows are rendered on the GPU by modern browsers. However, excessively large blur radii (e.g., >100px) combined with frequent animations or scrolling can trigger paint repaints. For best performance, keep blur values under 50px and animate transforms (`transform: translateY(-4px)`) rather than modifying box-shadow directly on hover.",
              },
              {
                q: "Are vendor prefixes like -webkit-box-shadow still required?",
                a: "Modern web browsers (Chrome, Edge, Safari, Firefox) have fully supported standard un-prefixed `box-shadow` for over a decade. However, if your project targets legacy mobile webviews or older embedded browsers, our tool provides a 'Vendor Prefixes' tab with cross-browser syntax ready to copy.",
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm text-gray-900 dark:text-white">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
