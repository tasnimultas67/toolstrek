"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  ImageIcon,
  Sliders,
  X,
  CheckCircle,
  Loader2,
  RefreshCw,
  Package,
  Eye,
  Sparkles,
  AlertCircle,
  Type,
  Bold,
  AlignCenter,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─── Constants ────────────────────────────────────────────────────────────────
const FAVICON_SIZES = [16, 32, 48, 192, 512];

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
];

const FONT_WEIGHTS = [
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "SemiBold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Black", value: "900" },
];

const GRADIENT_PRESETS = [
  {
    label: "Purple",
    value: "linear-gradient(135deg, #7c00fe, #c84bfe)",
    css: ["#7c00fe", "#c84bfe"],
  },
  {
    label: "Ocean",
    value: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
    css: ["#0ea5e9", "#06b6d4"],
  },
  {
    label: "Sunset",
    value: "linear-gradient(135deg, #f97316, #ef4444)",
    css: ["#f97316", "#ef4444"],
  },
  {
    label: "Emerald",
    value: "linear-gradient(135deg, #10b981, #059669)",
    css: ["#10b981", "#059669"],
  },
  {
    label: "Rose",
    value: "linear-gradient(135deg, #f43f5e, #ec4899)",
    css: ["#f43f5e", "#ec4899"],
  },
  {
    label: "Midnight",
    value: "linear-gradient(135deg, #1e1b4b, #312e81)",
    css: ["#1e1b4b", "#312e81"],
  },
  {
    label: "Gold",
    value: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    css: ["#f59e0b", "#fbbf24"],
  },
  {
    label: "Slate",
    value: "linear-gradient(135deg, #334155, #64748b)",
    css: ["#334155", "#64748b"],
  },
];

// ─── Rounded rect clip helper ─────────────────────────────────────────────────
function clipRoundedRect(ctx, size, cornerRadiusPct) {
  const r = Math.min((cornerRadiusPct / 100) * size, size / 2);
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
}

// ─── Draw image favicon ───────────────────────────────────────────────────────
function drawImageFavicon(
  sourceImg,
  size,
  cornerRadiusPct,
  bgColor,
  paddingPct,
) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const pad = (paddingPct / 100) * size;

  ctx.clearRect(0, 0, size, size);
  clipRoundedRect(ctx, size, cornerRadiusPct);
  ctx.save();
  ctx.clip();

  if (bgColor && bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  }

  const drawW = size - pad * 2;
  const drawH = size - pad * 2;
  if (drawW > 0 && drawH > 0) {
    const imgAspect = sourceImg.naturalWidth / sourceImg.naturalHeight;
    let finalW = drawW,
      finalH = drawH,
      finalX = pad,
      finalY = pad;
    if (imgAspect > 1) {
      finalH = drawW / imgAspect;
      finalY = pad + (drawH - finalH) / 2;
    } else {
      finalW = drawH * imgAspect;
      finalX = pad + (drawW - finalW) / 2;
    }
    ctx.drawImage(sourceImg, finalX, finalY, finalW, finalH);
  }
  ctx.restore();
  return canvas;
}

// ─── Draw text favicon ────────────────────────────────────────────────────────
function drawTextFavicon(
  text,
  size,
  cornerRadiusPct,
  bgType,
  bgSolid,
  bgGradientColors,
  textColor,
  fontFamily,
  fontWeight,
  paddingPct,
) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const pad = (paddingPct / 100) * size;

  ctx.clearRect(0, 0, size, size);
  clipRoundedRect(ctx, size, cornerRadiusPct);
  ctx.save();
  ctx.clip();

  // Background
  if (bgType === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, bgGradientColors[0]);
    grad.addColorStop(1, bgGradientColors[1]);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = bgSolid;
  }
  ctx.fillRect(0, 0, size, size);

  // Text
  const displayText = (text || "A").slice(0, 2).toUpperCase();
  const availableSize = size - pad * 2;
  const fontSize = availableSize * (displayText.length === 1 ? 0.58 : 0.44);
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(displayText, size / 2, size / 2 + fontSize * 0.04);

  ctx.restore();
  return canvas;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FaviconGenerator() {
  const [activeTab, setActiveTab] = useState("upload");

  // Upload tab state
  const [sourceImage, setSourceImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  // Text tab state
  const [iconText, setIconText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [fontWeight, setFontWeight] = useState("700");
  const [bgType, setBgType] = useState("gradient"); // "gradient" | "solid"
  const [bgSolid, setBgSolid] = useState("#7c00fe");
  const [bgGradientPreset, setBgGradientPreset] = useState(0);

  // Shared config
  const [cornerRadius, setCornerRadius] = useState(20);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgEnabled, setBgEnabled] = useState(false);
  const [padding, setPadding] = useState(8);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);

  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Determine if we have something to preview / download ─────────────────
  const hasContent =
    activeTab === "upload" ? !!sourceImage : iconText.trim().length > 0 || true;

  // ── Unified redraw ───────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 128, 128);

    let result;
    if (activeTab === "upload" && sourceImage) {
      result = drawImageFavicon(
        sourceImage.img,
        128,
        cornerRadius,
        bgEnabled ? bgColor : "transparent",
        padding,
      );
    } else if (activeTab === "text") {
      result = drawTextFavicon(
        iconText || "A",
        128,
        cornerRadius,
        bgType,
        bgSolid,
        GRADIENT_PRESETS[bgGradientPreset].css,
        textColor,
        fontFamily,
        fontWeight,
        padding,
      );
    }
    if (result) ctx.drawImage(result, 0, 0, 128, 128);
    setDownloadReady(false);
  }, [
    activeTab,
    sourceImage,
    cornerRadius,
    bgEnabled,
    bgColor,
    padding,
    iconText,
    bgType,
    bgSolid,
    bgGradientPreset,
    textColor,
    fontFamily,
    fontWeight,
  ]);

  useEffect(() => {
    redraw();
  }, [
    activeTab,
    sourceImage,
    cornerRadius,
    bgEnabled,
    bgColor,
    padding,
    iconText,
    bgType,
    bgSolid,
    bgGradientPreset,
    textColor,
    fontFamily,
    fontWeight,
  ]);

  // ── File handling ────────────────────────────────────────────────────────
  const handleFile = useCallback((file) => {
    setError(null);
    setDownloadReady(false);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, SVG, WEBP…).");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setSourceImage({ img, name: file.name, url });
    img.onerror = () => {
      setError("Failed to load image.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile],
  );
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleInputChange = useCallback(
    (e) => {
      handleFile(e.target.files?.[0]);
      e.target.value = "";
    },
    [handleFile],
  );
  const clearImage = useCallback(() => {
    if (sourceImage?.url) URL.revokeObjectURL(sourceImage.url);
    setSourceImage(null);
    setDownloadReady(false);
    setError(null);
    const canvas = previewCanvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, 128, 128);
  }, [sourceImage]);

  // ── Download ZIP ─────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (activeTab === "upload" && !sourceImage) return;
    setIsGenerating(true);
    setError(null);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder("favicons");

      const genCanvas = (size) => {
        if (activeTab === "upload") {
          return drawImageFavicon(
            sourceImage.img,
            size,
            cornerRadius,
            bgEnabled ? bgColor : "transparent",
            padding,
          );
        }
        return drawTextFavicon(
          iconText || "A",
          size,
          cornerRadius,
          bgType,
          bgSolid,
          GRADIENT_PRESETS[bgGradientPreset].css,
          textColor,
          fontFamily,
          fontWeight,
          padding,
        );
      };

      for (const size of FAVICON_SIZES) {
        const c = genCanvas(size);
        folder.file(
          `favicon-${size}x${size}.png`,
          c.toDataURL("image/png").split(",")[1],
          { base64: true },
        );
      }
      const ico = genCanvas(32);
      folder.file("favicon.ico", ico.toDataURL("image/png").split(",")[1], {
        base64: true,
      });
      folder.file(
        "html-snippet.html",
        `<!-- Paste into your <head> -->\n<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">\n<link rel="icon" type="image/x-icon" href="/favicon.ico">\n<link rel="apple-touch-icon" sizes="192x192" href="/favicons/favicon-192x192.png">\n<link rel="icon" type="image/png" sizes="512x512" href="/favicons/favicon-512x512.png">\n`,
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "favicon-pack.zip";
      a.click();
      URL.revokeObjectURL(a.href);
      setDownloadReady(true);
    } catch (err) {
      console.error(err);
      setError("Failed to generate favicon pack. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [
    activeTab,
    sourceImage,
    cornerRadius,
    bgEnabled,
    bgColor,
    padding,
    iconText,
    bgType,
    bgSolid,
    bgGradientPreset,
    textColor,
    fontFamily,
    fontWeight,
  ]);

  const cornerLabel =
    cornerRadius === 0
      ? "Sharp (0%)"
      : cornerRadius === 50
        ? "Full Circle (50%)"
        : `${cornerRadius}%`;
  const sizePills = FAVICON_SIZES.map((s) => ({
    label: `${s}×${s}`,
    note:
      s === 16
        ? "Browser tab"
        : s === 32
          ? "Taskbar"
          : s === 48
            ? "Windows"
            : s === 192
              ? "Android"
              : "PWA / Splash",
  }));

  // ── Mini preview data for the right panel ────────────────────────────────
  const getMiniCanvas = (size) => {
    if (activeTab === "upload" && sourceImage) {
      return drawImageFavicon(
        sourceImage.img,
        size,
        cornerRadius,
        bgEnabled ? bgColor : "transparent",
        padding,
      );
    }
    if (activeTab === "text") {
      return drawTextFavicon(
        iconText || "A",
        size,
        cornerRadius,
        bgType,
        bgSolid,
        GRADIENT_PRESETS[bgGradientPreset].css,
        textColor,
        fontFamily,
        fontWeight,
        padding,
      );
    }
    return null;
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      {/* ── Page Header ── */}
      <div className="px-4  pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#7c00fe]/10 text-[#7c00fe] dark:bg-[#7c00fe]/20 dark:text-purple-300 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          Favicon Generator
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
          Advanced Favicon Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
          Upload an image or craft a text icon, fine-tune shape and style, then
          download a complete favicon pack — all in your browser.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="px-4 pb-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* ═══ LEFT: Input + Config ═══ */}
        <div className="flex flex-col gap-5">
          {/* Tabs */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Tab row */}
            <div className="flex border-b border-gray-200 dark:border-zinc-800">
              {[
                {
                  id: "upload",
                  label: "Upload Image",
                  icon: <Upload className="w-4 h-4" />,
                },
                {
                  id: "text",
                  label: "Text Icon",
                  icon: <Type className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setDownloadReady(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "text-[#7c00fe] border-b-2 border-[#7c00fe] bg-[#7c00fe]/5"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab 1: Upload ── */}
            {activeTab === "upload" && (
              <div className="p-5">
                {!sourceImage ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-10 select-none ${
                      isDragging
                        ? "border-[#7c00fe] bg-[#7c00fe]/8 scale-[1.01]"
                        : "border-gray-200 dark:border-zinc-700 hover:border-[#7c00fe]/60 hover:bg-[#7c00fe]/4 bg-gray-50 dark:bg-zinc-800/50"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-[#7c00fe]/20" : "bg-gray-100 dark:bg-zinc-800"}`}
                    >
                      <Upload
                        className={`w-7 h-7 transition-colors ${isDragging ? "text-[#7c00fe]" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-700 dark:text-gray-200">
                        {isDragging
                          ? "Release to upload"
                          : "Drop your image here"}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        or{" "}
                        <span className="text-[#7c00fe] font-medium">
                          click to browse
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                        PNG, JPG, SVG, WEBP, GIF — transparent PNGs work great!
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#7c00fe]/5 border border-[#7c00fe]/20">
                    <div
                      className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-zinc-700"
                      style={{
                        backgroundImage:
                          "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)",
                        backgroundSize: "12px 12px",
                      }}
                    >
                      <img
                        src={sourceImage.url}
                        alt="source"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 truncate text-sm">
                        {sourceImage.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {sourceImage.img.naturalWidth} ×{" "}
                        {sourceImage.img.naturalHeight} px
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Ready to generate
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={clearImage}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {error && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 2: Text Icon ── */}
            {activeTab === "text" && (
              <div className="p-5 flex flex-col gap-5">
                {/* Text input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon Text{" "}
                    <span className="text-gray-400 font-normal">
                      (1–2 characters recommended)
                    </span>
                  </label>
                  <div className="relative">
                    <AlignCenter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={iconText}
                      onChange={(e) => setIconText(e.target.value.slice(0, 3))}
                      placeholder="AB"
                      maxLength={3}
                      className="w-full pl-9 pr-14 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 font-bold text-lg placeholder-gray-300 dark:placeholder-zinc-600 focus:outline-none focus:border-[#7c00fe] transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-zinc-600 font-mono">
                      {iconText.length}/3
                    </span>
                  </div>
                </div>

                {/* Font family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Family
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_OPTIONS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFontFamily(f.value)}
                        className={`py-2 px-3 rounded-lg border text-xs transition-all ${
                          fontFamily === f.value
                            ? "border-[#7c00fe] bg-[#7c00fe]/10 text-[#7c00fe] font-semibold"
                            : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-[#7c00fe]/40"
                        }`}
                        style={{ fontFamily: f.value }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Bold className="w-3.5 h-3.5 inline mr-1" />
                    Font Weight
                  </label>
                  <div className="flex gap-2">
                    {FONT_WEIGHTS.map((w) => (
                      <button
                        key={w.value}
                        onClick={() => setFontWeight(w.value)}
                        className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                          fontWeight === w.value
                            ? "border-[#7c00fe] bg-[#7c00fe]/10 text-[#7c00fe]"
                            : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:border-[#7c00fe]/40"
                        }`}
                        style={{ fontWeight: w.value }}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => {
                        if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                          setTextColor(e.target.value);
                      }}
                      className="flex-1 text-xs font-mono bg-transparent text-gray-700 dark:text-gray-200 outline-none border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:border-[#7c00fe] transition-colors"
                      maxLength={7}
                    />
                    <div className="flex gap-1.5">
                      {["#ffffff", "#111827", "#fde68a", "#a5f3fc"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setTextColor(c)}
                          title={c}
                          className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${textColor === c ? "border-[#7c00fe] scale-110" : "border-gray-200 dark:border-zinc-600"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Background type */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Background
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 text-xs">
                      {[
                        { id: "gradient", label: "Gradient" },
                        { id: "solid", label: "Solid" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setBgType(t.id)}
                          className={`px-3 py-1.5 font-medium transition-colors ${
                            bgType === t.id
                              ? "bg-[#7c00fe] text-white"
                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {bgType === "gradient" ? (
                    <div className="grid grid-cols-4 gap-2">
                      {GRADIENT_PRESETS.map((g, i) => (
                        <button
                          key={g.label}
                          onClick={() => setBgGradientPreset(i)}
                          title={g.label}
                          className={`h-10 rounded-xl transition-all ${bgGradientPreset === i ? "ring-2 ring-[#7c00fe] ring-offset-2 dark:ring-offset-zinc-900 scale-105" : "hover:scale-105"}`}
                          style={{ background: g.value }}
                        >
                          {bgGradientPreset === i && (
                            <CheckCircle className="w-4 h-4 text-white mx-auto drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                      <input
                        type="color"
                        value={bgSolid}
                        onChange={(e) => setBgSolid(e.target.value)}
                        className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={bgSolid}
                        onChange={(e) => {
                          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                            setBgSolid(e.target.value);
                        }}
                        className="flex-1 text-xs font-mono bg-transparent text-gray-700 dark:text-gray-200 outline-none border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:border-[#7c00fe] transition-colors"
                        maxLength={7}
                      />
                      <div className="flex gap-1.5">
                        {["#7c00fe", "#0ea5e9", "#10b981", "#f43f5e"].map(
                          (c) => (
                            <button
                              key={c}
                              onClick={() => setBgSolid(c)}
                              title={c}
                              className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${bgSolid === c ? "border-[#7c00fe] scale-110" : "border-gray-200 dark:border-zinc-600"}`}
                              style={{ backgroundColor: c }}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Shared Configuration Panel ── */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
              <Sliders className="w-4 h-4 text-[#7c00fe]" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                Shape & Layout
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-6">
              {/* Corner Radius */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Corner Radius
                  </label>
                  <span className="text-xs font-semibold text-[#7c00fe] bg-[#7c00fe]/10 px-2.5 py-1 rounded-full">
                    {cornerLabel}
                  </span>
                </div>
                <div className="flex gap-2 mb-3">
                  {[
                    { v: 0, l: "Sharp" },
                    { v: 20, l: "Soft" },
                    { v: 30, l: "Rounded" },
                    { v: 50, l: "Circle" },
                  ].map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => setCornerRadius(v)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${cornerRadius === v ? "border-[#7c00fe] bg-[#7c00fe]/10 text-[#7c00fe]" : "border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:border-[#7c00fe]/40"}`}
                    >
                      <div
                        className="w-5 h-5 border-2 border-current mx-auto mb-1.5"
                        style={{ borderRadius: `${v * 2}%` }}
                      />
                      {l}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={cornerRadius}
                  onChange={(e) => setCornerRadius(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#7c00fe] bg-gray-200 dark:bg-zinc-700"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0% — Sharp</span>
                  <span>50% — Circle</span>
                </div>
              </div>

              {/* Upload-only: Background Color */}
              {activeTab === "upload" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Background Color
                    </label>
                    <button
                      onClick={() => setBgEnabled((v) => !v)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${bgEnabled ? "bg-[#7c00fe]" : "bg-gray-300 dark:bg-zinc-700"}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${bgEnabled ? "translate-x-4.5" : "translate-x-0.5"}`}
                      />
                    </button>
                  </div>
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${bgEnabled ? "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50" : "border-gray-100 dark:border-zinc-800 opacity-50 pointer-events-none"}`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg border-2 border-gray-200 dark:border-zinc-600 flex-shrink-0 overflow-hidden shadow-sm"
                      style={{
                        backgroundImage:
                          "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)",
                        backgroundSize: "8px 8px",
                      }}
                    >
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: bgColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-7 h-7 rounded-md cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => {
                            if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                              setBgColor(e.target.value);
                          }}
                          className="flex-1 text-xs font-mono bg-transparent text-gray-700 dark:text-gray-200 outline-none border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:border-[#7c00fe] transition-colors"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {["#ffffff", "#000000", "#7c00fe", "#10b981"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setBgColor(c)}
                          title={c}
                          className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${bgColor === c ? "border-[#7c00fe] scale-110" : "border-gray-200 dark:border-zinc-600"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  {!bgEnabled && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1.5">
                      Enable to fill transparent areas with a background color.
                    </p>
                  )}
                </div>
              )}

              {/* Padding */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {activeTab === "text" ? "Text Padding" : "Image Padding"}
                  </label>
                  <span className="text-xs font-semibold text-[#7c00fe] bg-[#7c00fe]/10 px-2.5 py-1 rounded-full">
                    {padding}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#7c00fe] bg-gray-200 dark:bg-zinc-700"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0% — Full bleed</span>
                  <span>30% — Large margin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Preview + Download ═══ */}
        <div className="flex flex-col gap-5">
          {/* Live Preview */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
              <Eye className="w-4 h-4 text-[#7c00fe]" />
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                Live Preview
              </h2>
            </div>
            <div className="p-6">
              {/* Main 128px preview */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div
                    className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-zinc-700"
                    style={{
                      backgroundImage:
                        "repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%)",
                      backgroundSize: "16px 16px",
                    }}
                  >
                    <canvas
                      ref={previewCanvasRef}
                      width={128}
                      height={128}
                      className="w-full h-full"
                    />
                  </div>
                  {(activeTab === "upload" ? !!sourceImage : true) && (
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {activeTab === "upload" && !sourceImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-zinc-700 rounded-2xl">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-size mini previews */}
              <div className="flex items-end justify-center gap-4 mb-5">
                {[64, 32, 16].map((previewSize) => (
                  <div
                    key={previewSize}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="rounded overflow-hidden border border-gray-200 dark:border-zinc-700 flex-shrink-0"
                      style={{
                        width: previewSize,
                        height: previewSize,
                        backgroundImage:
                          "repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%)",
                        backgroundSize: "8px 8px",
                      }}
                    >
                      <MiniPreviewCanvas
                        genFn={() => getMiniCanvas(previewSize)}
                        size={previewSize}
                        deps={[
                          activeTab,
                          sourceImage,
                          cornerRadius,
                          bgEnabled,
                          bgColor,
                          padding,
                          iconText,
                          bgType,
                          bgSolid,
                          bgGradientPreset,
                          textColor,
                          fontFamily,
                          fontWeight,
                        ]}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                      {previewSize}px
                    </span>
                  </div>
                ))}
              </div>

              {/* Files list */}
              <div className="rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  Files in your pack
                </p>
                <div className="flex flex-col gap-2">
                  {sizePills.map(({ label, note }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7c00fe]" />
                        <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">
                          favicon-{label}.png
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {note}
                      </span>
                    </div>
                  ))}
                  {[
                    {
                      name: "favicon.ico",
                      note: "Legacy browsers",
                      dot: "bg-[#7c00fe]",
                    },
                    {
                      name: "html-snippet.html",
                      note: "<head> tags",
                      dot: "bg-emerald-500",
                    },
                  ].map(({ name, note, dot }) => (
                    <div
                      key={name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">
                          {name}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={(activeTab === "upload" && !sourceImage) || isGenerating}
            className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-base transition-all duration-200 shadow-sm ${
              activeTab === "upload" && !sourceImage
                ? "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed"
                : isGenerating
                  ? "bg-[#7c00fe]/80 text-white cursor-wait"
                  : downloadReady
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-md"
                    : "bg-[#7c00fe] hover:bg-[#6500d4] text-white shadow-[#7c00fe]/20 hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Pack…
              </>
            ) : downloadReady ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Pack Downloaded!
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Download Favicon Pack
              </>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              setCornerRadius(20);
              setBgColor("#ffffff");
              setBgEnabled(false);
              setPadding(8);
              setDownloadReady(false);
              setIconText("");
              setTextColor("#ffffff");
              setFontFamily(FONT_OPTIONS[0].value);
              setFontWeight("700");
              setBgType("gradient");
              setBgGradientPreset(0);
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset all settings
          </button>

          {/* Tips */}
          <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 p-5">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">
              Tips
            </p>
            <ul className="flex flex-col gap-2.5">
              {(activeTab === "upload"
                ? [
                    "Use a transparent PNG for the best results.",
                    "512×512 source image recommended for sharp output.",
                    "Enable background color to fill transparent areas.",
                    "Set padding to ~10% for an airy, card-style look.",
                  ]
                : [
                    "1–2 characters work best for readability at small sizes.",
                    "Use the Circle preset for a classic app icon look.",
                    "White text on a gradient background looks stunning.",
                    "Bold or Black font weight reads better at 16px.",
                  ]
              ).map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-500"
                >
                  <span className="text-[#7c00fe] font-bold mt-0.5">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}

// ─── Mini canvas that re-renders when deps change ─────────────────────────────
function MiniPreviewCanvas({ genFn, size, deps }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const result = genFn();
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    if (result) ctx.drawImage(result, 0, 0, size, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ display: "block", width: size, height: size }}
    />
  );
}
