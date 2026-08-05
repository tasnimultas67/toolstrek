"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Laptop,
  Tv,
  Watch,
  Plus,
  X,
  Copy,
  Check,
  RotateCcw,
  Settings2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Info,
  Ruler,
  Grid3x3,
  Layout,
  Globe,
  Sliders,
  ZoomIn,
  ZoomOut,
  Eye,
  Code2,
  ScreenShare,
  Boxes,
  AlertCircle,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { cn } from "@/lib/utils";

// ─── Device Database ──────────────────────────────────────────────────────────
const DEVICE_PRESETS = {
  "Mobile Phones": [
    { name: "iPhone SE (2022)", width: 375, height: 667, icon: "phone", dpr: 2 },
    { name: "iPhone 14", width: 390, height: 844, icon: "phone", dpr: 3 },
    { name: "iPhone 14 Pro Max", width: 430, height: 932, icon: "phone", dpr: 3 },
    { name: "iPhone 16", width: 393, height: 852, icon: "phone", dpr: 3 },
    { name: "Samsung Galaxy S23", width: 360, height: 780, icon: "phone", dpr: 3 },
    { name: "Samsung Galaxy S24 Ultra", width: 412, height: 915, icon: "phone", dpr: 3.5 },
    { name: "Google Pixel 8", width: 412, height: 915, icon: "phone", dpr: 2.6 },
    { name: "Google Pixel 8 Pro", width: 448, height: 998, icon: "phone", dpr: 3 },
    { name: "OnePlus 12", width: 412, height: 919, icon: "phone", dpr: 3 },
    { name: "Xiaomi 14", width: 393, height: 851, icon: "phone", dpr: 3 },
    { name: "Nokia G60", width: 360, height: 800, icon: "phone", dpr: 2 },
  ],
  Tablets: [
    { name: "iPad Mini (6th Gen)", width: 744, height: 1133, icon: "tablet", dpr: 2 },
    { name: "iPad (10th Gen)", width: 820, height: 1180, icon: "tablet", dpr: 2 },
    { name: "iPad Air (M2)", width: 820, height: 1180, icon: "tablet", dpr: 2 },
    { name: "iPad Pro 11\"", width: 834, height: 1194, icon: "tablet", dpr: 2 },
    { name: "iPad Pro 13\"", width: 1024, height: 1366, icon: "tablet", dpr: 2 },
    { name: "Samsung Galaxy Tab S9", width: 800, height: 1340, icon: "tablet", dpr: 2.5 },
    { name: "Samsung Galaxy Tab S9 Ultra", width: 960, height: 1600, icon: "tablet", dpr: 2 },
    { name: "Google Pixel Tablet", width: 1280, height: 800, icon: "tablet", dpr: 2 },
    { name: "Amazon Fire HD 10", width: 800, height: 1280, icon: "tablet", dpr: 1.5 },
    { name: "Microsoft Surface Pro 9", width: 1368, height: 912, icon: "tablet", dpr: 2 },
  ],
  Laptops: [
    { name: "MacBook Air 13\"", width: 1280, height: 800, icon: "laptop", dpr: 2 },
    { name: "MacBook Pro 14\"", width: 1512, height: 982, icon: "laptop", dpr: 2 },
    { name: "MacBook Pro 16\"", width: 1728, height: 1117, icon: "laptop", dpr: 2 },
    { name: "Dell XPS 13", width: 1920, height: 1200, icon: "laptop", dpr: 1 },
    { name: "HP Spectre x360 14", width: 1920, height: 1280, icon: "laptop", dpr: 1 },
    { name: "Lenovo ThinkPad X1 Carbon", width: 1920, height: 1200, icon: "laptop", dpr: 1 },
    { name: "Surface Laptop 5 (13.5\")", width: 2256, height: 1504, icon: "laptop", dpr: 1.5 },
    { name: "ASUS ZenBook 14", width: 1920, height: 1080, icon: "laptop", dpr: 1 },
  ],
  Desktops: [
    { name: "HD (1366×768)", width: 1366, height: 768, icon: "monitor", dpr: 1 },
    { name: "Full HD (1920×1080)", width: 1920, height: 1080, icon: "monitor", dpr: 1 },
    { name: "QHD (2560×1440)", width: 2560, height: 1440, icon: "monitor", dpr: 1 },
    { name: "4K UHD (3840×2160)", width: 3840, height: 2160, icon: "monitor", dpr: 1 },
    { name: "iMac 24\"", width: 4480, height: 2520, icon: "monitor", dpr: 2 },
    { name: "Apple Studio Display", width: 5120, height: 2880, icon: "monitor", dpr: 2 },
    { name: "Ultrawide (3440×1440)", width: 3440, height: 1440, icon: "monitor", dpr: 1 },
    { name: "Super Ultrawide (5120×1440)", width: 5120, height: 1440, icon: "monitor", dpr: 1 },
  ],
  "Smart TV & Large": [
    { name: "1080p TV (Full HD)", width: 1920, height: 1080, icon: "tv", dpr: 1 },
    { name: "4K TV (Ultra HD)", width: 3840, height: 2160, icon: "tv", dpr: 1 },
    { name: "Samsung Smart TV 55\"", width: 3840, height: 2160, icon: "tv", dpr: 1 },
    { name: "LG OLED C3", width: 3840, height: 2160, icon: "tv", dpr: 1 },
  ],
  "Wearables & Small": [
    { name: "Apple Watch Ultra 2", width: 205, height: 251, icon: "watch", dpr: 2 },
    { name: "Apple Watch Series 9 (45mm)", width: 198, height: 242, icon: "watch", dpr: 2 },
    { name: "Samsung Galaxy Watch 6", width: 196, height: 196, icon: "watch", dpr: 2 },
    { name: "Fitbit Sense 2", width: 336, height: 336, icon: "watch", dpr: 1 },
  ],
  "Responsive Breakpoints": [
    { name: "XS (320px)", width: 320, height: 568, icon: "phone", dpr: 1 },
    { name: "SM (480px)", width: 480, height: 800, icon: "phone", dpr: 1 },
    { name: "MD (768px)", width: 768, height: 1024, icon: "tablet", dpr: 1 },
    { name: "LG (1024px)", width: 1024, height: 768, icon: "laptop", dpr: 1 },
    { name: "XL (1280px)", width: 1280, height: 800, icon: "laptop", dpr: 1 },
    { name: "2XL (1536px)", width: 1536, height: 864, icon: "monitor", dpr: 1 },
    { name: "Tailwind SM (640px)", width: 640, height: 900, icon: "tablet", dpr: 1 },
    { name: "Tailwind MD (768px)", width: 768, height: 1024, icon: "tablet", dpr: 1 },
    { name: "Tailwind LG (1024px)", width: 1024, height: 768, icon: "laptop", dpr: 1 },
    { name: "Tailwind XL (1280px)", width: 1280, height: 800, icon: "laptop", dpr: 1 },
    { name: "Tailwind 2XL (1536px)", width: 1536, height: 864, icon: "monitor", dpr: 1 },
  ],
};

const ICON_MAP = {
  phone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  monitor: Monitor,
  tv: Tv,
  watch: Watch,
};

const CATEGORY_COLORS = {
  "Mobile Phones": "from-pink-500 to-rose-500",
  Tablets: "from-orange-500 to-amber-500",
  Laptops: "from-violet-500 to-purple-500",
  Desktops: "from-blue-500 to-cyan-500",
  "Smart TV & Large": "from-emerald-500 to-teal-500",
  "Wearables & Small": "from-slate-500 to-gray-500",
  "Responsive Breakpoints": "from-indigo-500 to-blue-500",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDeviceIcon(iconKey) {
  return ICON_MAP[iconKey] || Monitor;
}

function getBreakpointLabel(width) {
  if (width < 480) return { label: "XS", color: "bg-rose-500" };
  if (width < 640) return { label: "SM", color: "bg-orange-500" };
  if (width < 768) return { label: "MD", color: "bg-amber-500" };
  if (width < 1024) return { label: "LG", color: "bg-emerald-500" };
  if (width < 1280) return { label: "XL", color: "bg-blue-500" };
  if (width < 1536) return { label: "2XL", color: "bg-violet-500" };
  return { label: "3XL", color: "bg-purple-600" };
}

function pxToPt(px) { return Math.round(px * 0.75 * 10) / 10; }
function pxToEm(px, base = 16) { return Math.round((px / base) * 100) / 100; }
function pxToRem(px, base = 16) { return Math.round((px / base) * 100) / 100; }
function pxToCm(px, ppi = 96) { return Math.round((px / ppi) * 2.54 * 100) / 100; }
function pxToInch(px, ppi = 96) { return Math.round((px / ppi) * 100) / 100; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function ResponsiveViewport() {
  // Main state
  const [url, setUrl] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const [width, setWidth] = useState(390);
  const [height, setHeight] = useState(844);
  const [zoom, setZoom] = useState(0.5);
  const [orientation, setOrientation] = useState("portrait"); // portrait | landscape
  const [selectedDevice, setSelectedDevice] = useState("iPhone 14");
  const [selectedCategory, setSelectedCategory] = useState("Mobile Phones");
  const [isLoading, setIsLoading] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customDevices, setCustomDevices] = useState([]);
  const [newCustomName, setNewCustomName] = useState("");
  const [newCustomWidth, setNewCustomWidth] = useState("");
  const [newCustomHeight, setNewCustomHeight] = useState("");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [dpr, setDpr] = useState(3);
  const [userAgent, setUserAgent] = useState("default");
  const [showGrid, setShowGrid] = useState(false);
  const [outlineMode, setOutlineMode] = useState(false);
  const [rulerVisible, setRulerVisible] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [iframeError, setIframeError] = useState(false);
  const [baseFont, setBaseFont] = useState(16);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const iframeRef = useRef(null);
  const widthInputRef = useRef(null);
  const heightInputRef = useRef(null);

  // Derived
  const bpLabel = getBreakpointLabel(width);
  const effectiveW = orientation === "landscape" ? height : width;
  const effectiveH = orientation === "landscape" ? width : height;
  const allDevices = { ...DEVICE_PRESETS, "My Custom Devices": customDevices };
  const visibleCategories = showAllCategories ? Object.keys(allDevices) : Object.keys(allDevices).slice(0, 5);

  const USER_AGENTS = {
    default: "Default",
    mobile_ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    mobile_android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    tablet: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    desktop_chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    desktop_firefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    bot_googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  };

  // Normalize URL
  const normalizeUrl = (raw) => {
    const t = raw.trim();
    if (!t) return "";
    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    return "https://" + t;
  };

  const handleLoad = () => {
    const norm = normalizeUrl(url);
    if (!norm) { setUrlError("Please enter a URL."); return; }
    setUrlError("");
    setIframeError(false);
    setIsLoading(true);
    setActiveUrl(norm);
    setIframeKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeError(false);
    setIframeKey((k) => k + 1);
  };

  const selectDevice = (device) => {
    setSelectedDevice(device.name);
    setWidth(device.width);
    setHeight(device.height);
    setDpr(device.dpr || 1);
    setOrientation("portrait");
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const addCustomDevice = () => {
    const w = parseInt(newCustomWidth);
    const h = parseInt(newCustomHeight);
    const n = newCustomName.trim();
    if (!n || isNaN(w) || isNaN(h) || w < 1 || h < 1) return;
    const device = { name: n, width: w, height: h, icon: "monitor", dpr: 1 };
    setCustomDevices((prev) => [...prev, device]);
    setNewCustomName("");
    setNewCustomWidth("");
    setNewCustomHeight("");
    setShowAddCustom(false);
    selectDevice(device);
  };

  const removeCustomDevice = (name) => {
    setCustomDevices((prev) => prev.filter((d) => d.name !== name));
  };

  const handleZoom = (delta) => {
    setZoom((z) => Math.min(1, Math.max(0.1, parseFloat((z + delta).toFixed(2)))));
  };

  // Info computations
  const infoItems = [
    { label: "Width", value: `${effectiveW}px`, key: "w" },
    { label: "Height", value: `${effectiveH}px`, key: "h" },
    { label: "Aspect Ratio", value: (() => {
      const gcd = (a, b) => b ? gcd(b, a % b) : a;
      const g = gcd(effectiveW, effectiveH);
      return `${effectiveW / g}:${effectiveH / g}`;
    })(), key: "ar" },
    { label: "Breakpoint", value: bpLabel.label, key: "bp" },
    { label: "DPR", value: `${dpr}x`, key: "dpr" },
    { label: "Physical px (W)", value: `${Math.round(effectiveW * dpr)}`, key: "ppx" },
    { label: "Viewport em (W)", value: `${pxToEm(effectiveW, baseFont)}em`, key: "em" },
    { label: "Viewport rem (W)", value: `${pxToRem(effectiveW, baseFont)}rem`, key: "rem" },
    { label: "Width in pt", value: `${pxToPt(effectiveW)}pt`, key: "pt" },
    { label: "Width in cm", value: `${pxToCm(effectiveW)}cm`, key: "cm" },
    { label: "Width in inch", value: `${pxToInch(effectiveW)}in`, key: "in" },
    { label: "CSS min-font (mobile)", value: effectiveW < 768 ? "12px" : "14px", key: "minfont" },
  ];

  return (
    <ToolPageShell widthClassName="max-w-screen-2xl">
      {/* ── Header ── */}
      <div className="flex flex-col gap-6 w-full mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <ScreenShare className="w-3.5 h-3.5" />
            Developer Tools
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-400 dark:to-emerald-400">
            Responsive Viewport Tester
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
            Preview any website across 80+ real device viewports. Test responsive layouts, check breakpoints, measure dimensions, and inspect pixel density — all in one place.
          </p>
        </div>

        {/* ── URL Bar ── */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-5">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLoad()}
                  placeholder="https://example.com"
                  className={cn(
                    "w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none transition-all",
                    urlError
                      ? "border-red-400 focus:ring-2 focus:ring-red-500/30"
                      : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                  )}
                />
              </div>
              {urlError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{urlError}</p>}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleLoad}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all shadow-md shadow-violet-500/20 active:scale-95"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              {activeUrl && (
                <button
                  onClick={handleRefresh}
                  title="Refresh"
                  className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <RefreshCw className={cn("w-4 h-4 text-slate-500", isLoading && "animate-spin")} />
                </button>
              )}
              {activeUrl && (
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in new tab"
                  className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="flex flex-col xl:flex-row gap-4">

          {/* ── Left Sidebar: Device Selector ── */}
          <aside className="w-full xl:w-72 flex-shrink-0 flex flex-col gap-3">

            {/* Quick Controls */}
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Quick Controls
              </p>

              {/* Width / Height inputs */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Width (px)</label>
                  <input
                    ref={widthInputRef}
                    type="number"
                    min={100}
                    max={7680}
                    value={width}
                    onChange={(e) => setWidth(Math.max(100, parseInt(e.target.value) || 100))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Height (px)</label>
                  <input
                    ref={heightInputRef}
                    type="number"
                    min={100}
                    max={4320}
                    value={height}
                    onChange={(e) => setHeight(Math.max(100, parseInt(e.target.value) || 100))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
              </div>

              {/* Orientation */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setOrientation("portrait")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    orientation === "portrait"
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation("landscape")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    orientation === "landscape"
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Tablet className="w-3.5 h-3.5 rotate-90" />
                  Landscape
                </button>
              </div>

              {/* Zoom */}
              <div className="mb-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-500 dark:text-slate-400">Zoom: {Math.round(zoom * 100)}%</label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleZoom(-0.05)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title="Zoom out">
                      <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button onClick={() => setZoom(0.5)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs text-slate-400 font-mono">50%</button>
                    <button onClick={() => handleZoom(0.05)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title="Zoom in">
                      <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(zoom * 100)}
                  onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
                  className="w-full accent-violet-600 cursor-pointer"
                />
              </div>

              {/* View Toggles */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowGrid((v) => !v)}
                  title="Grid overlay"
                  className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    showGrid ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                  Grid
                </button>
                <button
                  onClick={() => setRulerVisible((v) => !v)}
                  title="Rulers"
                  className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    rulerVisible ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Ruler
                </button>
                <button
                  onClick={() => setOutlineMode((v) => !v)}
                  title="Element outlines"
                  className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    outlineMode ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  Outline
                </button>
              </div>
            </div>

            {/* Device Categories */}
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex-1 min-h-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5" /> Devices
              </p>

              {/* Category tabs (scrollable) */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all whitespace-nowrap",
                      selectedCategory === cat
                        ? "bg-violet-600 text-white border-violet-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {cat}
                  </button>
                ))}
                {Object.keys(allDevices).length > 5 && (
                  <button
                    onClick={() => setShowAllCategories((v) => !v)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                  >
                    {showAllCategories ? "Less" : `+${Object.keys(allDevices).length - 5} more`}
                  </button>
                )}
              </div>

              {/* Device List */}
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1 xl:max-h-none xl:overflow-visible">
                {(allDevices[selectedCategory] || []).length === 0 && selectedCategory === "My Custom Devices" && (
                  <p className="text-xs text-slate-400 italic py-2 text-center">No custom devices yet.</p>
                )}
                {(allDevices[selectedCategory] || []).map((device) => {
                  const Icon = getDeviceIcon(device.icon);
                  const isActive = selectedDevice === device.name;
                  return (
                    <div key={device.name} className="flex items-center gap-1">
                      <button
                        onClick={() => selectDevice(device)}
                        className={cn(
                          "flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all group",
                          isActive
                            ? "bg-violet-600 text-white shadow-sm"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-violet-500")} />
                        <span className="flex-1 text-xs font-medium truncate">{device.name}</span>
                        <span className={cn("text-[10px] font-mono flex-shrink-0", isActive ? "text-violet-200" : "text-slate-400")}>
                          {device.width}×{device.height}
                        </span>
                      </button>
                      {selectedCategory === "My Custom Devices" && (
                        <button
                          onClick={() => removeCustomDevice(device.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Device */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {showAddCustom ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      placeholder="Device name"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newCustomWidth}
                        onChange={(e) => setNewCustomWidth(e.target.value)}
                        placeholder="Width"
                        min={1}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                      <input
                        type="number"
                        value={newCustomHeight}
                        onChange={(e) => setNewCustomHeight(e.target.value)}
                        placeholder="Height"
                        min={1}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addCustomDevice}
                        className="flex-1 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-all"
                      >
                        Add Device
                      </button>
                      <button
                        onClick={() => setShowAddCustom(false)}
                        className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowAddCustom(true); setSelectedCategory("My Custom Devices"); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-xs font-medium hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Custom Device
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main Content: Viewport + Info ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm px-4 py-2.5">
              <div className="flex items-center gap-3">
                {/* Breakpoint badge */}
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white", bpLabel.color)}>
                  {bpLabel.label}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {effectiveW} <span className="text-slate-400">×</span> {effectiveH} <span className="text-slate-400 font-normal text-xs">px</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400">
                  <span>DPR: {dpr}x</span>
                  <span className="opacity-50">·</span>
                  <span>{orientation === "portrait" ? "Portrait" : "Landscape"}</span>
                  <span className="opacity-50">·</span>
                  <span>Zoom: {Math.round(zoom * 100)}%</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[160px]">{selectedDevice}</span>
                {activeUrl && (
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                )}
              </div>
            </div>

            {/* Viewport Frame */}
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 overflow-hidden">
              <div className="relative w-full overflow-auto flex justify-center" style={{ minHeight: 400 }}>
                {/* Ruler - Horizontal */}
                {rulerVisible && (
                  <div className="absolute top-0 left-0 right-0 h-5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10 overflow-hidden flex items-end">
                    {Array.from({ length: Math.ceil(effectiveW / 50) + 1 }).map((_, i) => (
                      <div key={i} className="absolute flex flex-col items-center" style={{ left: i * 50 * zoom }}>
                        <span className="text-[8px] text-slate-400 font-mono leading-none mb-0.5">{i * 50}</span>
                        <div className="w-px bg-slate-300 dark:bg-slate-600" style={{ height: i % 2 === 0 ? 6 : 3 }} />
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="relative flex-shrink-0 transition-all duration-300"
                  style={{
                    width: effectiveW * zoom,
                    height: effectiveH * zoom,
                    marginTop: rulerVisible ? 20 : 0,
                    boxShadow: "0 4px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  {/* Grid Overlay */}
                  {showGrid && (
                    <div
                      className="absolute inset-0 pointer-events-none z-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(124,0,254,0.08) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(124,0,254,0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
                      }}
                    />
                  )}

                  {activeUrl ? (
                    <iframe
                      key={iframeKey}
                      ref={iframeRef}
                      src={activeUrl}
                      title="Responsive Viewport Preview"
                      onLoad={() => setIsLoading(false)}
                      onError={() => { setIsLoading(false); setIframeError(true); }}
                      style={{
                        width: effectiveW,
                        height: effectiveH,
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left",
                        border: "none",
                        display: "block",
                        outline: outlineMode ? "1px solid rgba(124,0,254,0.4)" : "none",
                      }}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900/50">
                      <div className="p-4 rounded-2xl bg-violet-500/10">
                        <Layout className="w-10 h-10 text-violet-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No page loaded</p>
                        <p className="text-xs text-slate-400 mt-1">Enter a URL above and click Preview</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {["https://example.com", "https://github.com", "https://vercel.com"].map((demo) => (
                          <button
                            key={demo}
                            onClick={() => { setUrl(demo); }}
                            className="px-3 py-1 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all font-mono"
                          >
                            {demo.replace("https://", "")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {iframeError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/95 dark:bg-slate-900/95 z-30">
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                      <div className="text-center px-4">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cannot load this page</p>
                        <p className="text-xs text-slate-400 mt-1">This site may block embedding via <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">X-Frame-Options</code></p>
                      </div>
                      <a href={activeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 underline">
                        <ExternalLink className="w-3.5 h-3.5" /> Open directly
                      </a>
                    </div>
                  )}

                  {isLoading && !iframeError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-30 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-6 h-6 text-violet-500 animate-spin" />
                        <span className="text-xs text-slate-500">Loading…</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Advanced Options ── */}
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Advanced Options</span>
                  <span className="text-xs text-slate-400">DPR, User-Agent, Base Font & more</span>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showAdvanced && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* DPR */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                        Device Pixel Ratio (DPR)
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDpr(d)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all",
                              dpr === d
                                ? "bg-violet-600 text-white border-violet-600"
                                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                            {d}x
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Physical px width: <strong className="text-slate-600 dark:text-slate-300">{Math.round(effectiveW * dpr)}</strong></p>
                    </div>

                    {/* User Agent */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                        User Agent
                      </label>
                      <select
                        value={userAgent}
                        onChange={(e) => setUserAgent(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      >
                        {Object.entries(USER_AGENTS).map(([key, label]) => (
                          <option key={key} value={key}>{key === "default" ? label : label.slice(0, 60) + "..."}</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-400 mt-1 italic">* Visual reference only; iframe uses browser UA</p>
                    </div>

                    {/* Base Font */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                        Base Font Size
                      </label>
                      <div className="flex gap-1.5">
                        {[12, 14, 16, 18, 20].map((f) => (
                          <button
                            key={f}
                            onClick={() => setBaseFont(f)}
                            className={cn(
                              "flex-1 py-1 rounded-lg text-xs font-mono font-medium border transition-all",
                              baseFont === f
                                ? "bg-violet-600 text-white border-violet-600"
                                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                            {f}px
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Rem base: <strong className="text-slate-600 dark:text-slate-300">{baseFont}px</strong> · Min font:&nbsp;
                        <strong className={cn(effectiveW < 768 ? "text-rose-500" : "text-emerald-500")}>
                          {effectiveW < 768 ? "12px (mobile)" : "14px (desktop)"}
                        </strong>
                      </p>
                    </div>

                    {/* CSS Media Query */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5" /> Generated CSS Media Query
                      </label>
                      <div className="relative">
                        <pre className="bg-slate-900 dark:bg-slate-950 text-emerald-400 text-xs rounded-xl p-4 font-mono overflow-x-auto leading-relaxed">
{`@media (max-width: ${effectiveW}px) {
  /* Styles for ${selectedDevice} */
  /* Width: ${effectiveW}px · Height: ${effectiveH}px · DPR: ${dpr}x */
  body {
    font-size: ${effectiveW < 768 ? 12 : 14}px; /* min-font rule */
  }
}`}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(`@media (max-width: ${effectiveW}px) {\n  /* ${selectedDevice} */\n  body { font-size: ${effectiveW < 768 ? 12 : 14}px; }\n}`, "css")}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 transition-all"
                          title="Copy CSS"
                        >
                          {copied === "css" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Viewport Information Section ── */}
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-violet-500/10 rounded-lg">
                  <Info className="w-4 h-4 text-violet-500" />
                </div>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Viewport Information</h2>
                <span className="ml-auto text-xs text-slate-400">{selectedDevice}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {infoItems.map((item) => (
                  <div
                    key={item.key}
                    className="group relative flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-default"
                  >
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">{item.value}</span>
                    <button
                      onClick={() => copyToClipboard(item.value, item.key)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all shadow-sm"
                      title="Copy"
                    >
                      {copied === item.key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── About / Features Section ── */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <Layout className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">About This Tool</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Smartphone className="w-5 h-5 text-pink-500" />,
                title: "80+ Real Devices",
                desc: "Preview across iPhones, Android phones, tablets, laptops, desktops, smart TVs, and wearables — all with accurate viewport dimensions and DPR.",
                color: "bg-pink-500/10",
              },
              {
                icon: <Plus className="w-5 h-5 text-violet-500" />,
                title: "Custom Devices",
                desc: "Define your own custom viewport sizes. Name it, set width and height, and it'll appear in your personal device list instantly.",
                color: "bg-violet-500/10",
              },
              {
                icon: <Ruler className="w-5 h-5 text-blue-500" />,
                title: "Multi-Unit Conversion",
                desc: "Get viewport dimensions in px, pt, em, rem, cm, and inches simultaneously. Understand physical vs. CSS pixels through DPR.",
                color: "bg-blue-500/10",
              },
              {
                icon: <Grid3x3 className="w-5 h-5 text-emerald-500" />,
                title: "Visual Overlays",
                desc: "Toggle a grid overlay, pixel rulers, and element outline mode to help debug layout issues and understand spacing at a glance.",
                color: "bg-emerald-500/10",
              },
              {
                icon: <Code2 className="w-5 h-5 text-orange-500" />,
                title: "CSS Media Query Generator",
                desc: "Instantly generates a ready-to-copy CSS media query for the active viewport, including the correct min-font-size rule for mobile vs. desktop.",
                color: "bg-orange-500/10",
              },
              {
                icon: <ZoomIn className="w-5 h-5 text-teal-500" />,
                title: "Zoom & Scale",
                desc: "Scale the preview from 10% to 100% with a smooth slider. See large desktop viewports on any screen without horizontal scrolling.",
                color: "bg-teal-500/10",
              },
            ].map((feat) => (
              <div key={feat.title} className="flex gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className={cn("p-2 rounded-lg flex-shrink-0 h-fit", feat.color)}>
                  {feat.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">{feat.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Min Font Info */}
          <div className="mt-6 p-4 rounded-xl border border-violet-200 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-900/10 flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex-shrink-0 p-2 bg-violet-500/10 rounded-lg w-fit">
              <Info className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-1">Minimum Font Size Rules</p>
              <p className="text-xs text-violet-600/80 dark:text-violet-400/80 leading-relaxed">
                Per WCAG and best-practice guidelines, this tool enforces <strong>12px minimum font size for mobile viewports (&lt;768px)</strong> and <strong>14px minimum for laptop/desktop viewports (≥768px)</strong>. These limits are reflected in the generated CSS media queries.
              </p>
            </div>
          </div>

          {/* Breakpoints Reference */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Breakpoint Reference</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "XS", range: "< 480px", color: "bg-rose-500" },
                { label: "SM", range: "480–639px", color: "bg-orange-500" },
                { label: "MD", range: "640–767px", color: "bg-amber-500" },
                { label: "LG", range: "768–1023px", color: "bg-emerald-500" },
                { label: "XL", range: "1024–1279px", color: "bg-blue-500" },
                { label: "2XL", range: "1280–1535px", color: "bg-violet-500" },
                { label: "3XL", range: "≥ 1536px", color: "bg-purple-600" },
              ].map((bp) => (
                <div key={bp.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className={cn("w-2 h-2 rounded-full", bp.color)} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{bp.label}</span>
                  <span className="text-xs text-slate-400 font-mono">{bp.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How to use */}
          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">How to Use</p>
            <ol className="flex flex-col gap-2">
              {[
                "Enter any website URL in the input bar and click Preview to load it inside the viewport.",
                "Select a device category from the sidebar (phones, tablets, laptops, etc.) and click any device to apply its dimensions.",
                "Use orientation buttons to switch between Portrait and Landscape modes.",
                "Adjust Zoom to fit large viewports on your screen without losing fidelity.",
                "Toggle Grid, Ruler, or Outline overlays to debug layout and spacing.",
                "Click Advanced Options to configure DPR, User Agent, base font size, and copy generated CSS.",
                "Add custom devices with your own width/height for non-standard testing environments.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 items-start text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold text-[10px] flex items-center justify-center">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
