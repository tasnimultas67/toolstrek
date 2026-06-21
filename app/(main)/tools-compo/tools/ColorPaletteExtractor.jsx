"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Upload,
  Copy,
  Download,
  CheckCircle,
  Palette,
  Pipette,
  RefreshCw,
  Info,
  ChevronDown,
  FileJson,
  FileText,
  Code,
  Layers,
  X,
  Eye,
  AlertTriangle,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─────────────────────────────────────────────
// Pure colour helpers (no external deps)
// ─────────────────────────────────────────────

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function hexToRgb(hex) {
  const m = hex.replace("#", "").match(/.{2}/g);
  return m
    ? { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) }
    : null;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function getLuminance(r, g, b) {
  const toLinear = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(r, g, b) {
  const lum = getLuminance(r, g, b);
  const white = 1.0;
  const black = 0.0;
  const contrastWhite = (white + 0.05) / (lum + 0.05);
  const contrastBlack = (lum + 0.05) / (black + 0.05);
  return { white: contrastWhite, black: contrastBlack, lum };
}

function getWCAGLevel(ratio) {
  if (ratio >= 7) return { level: "AAA", color: "text-emerald-500" };
  if (ratio >= 4.5) return { level: "AA", color: "text-green-500" };
  if (ratio >= 3) return { level: "AA Large", color: "text-yellow-500" };
  return { level: "Fail", color: "text-red-500" };
}

function buildColorInfo(r, g, b) {
  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  const contrast = getContrastRatio(r, g, b);
  const useWhiteText = contrast.white > contrast.black;
  const bestContrast = useWhiteText ? contrast.white : contrast.black;
  const wcag = getWCAGLevel(bestContrast);
  return {
    hex,
    rgb: { r, g, b },
    hsl,
    textColor: useWhiteText ? "#FFFFFF" : "#000000",
    contrastRatio: bestContrast.toFixed(2),
    wcag,
  };
}

// ─────────────────────────────────────────────
// Median-cut colour quantisation (replaces color-thief)
// ─────────────────────────────────────────────

function getPixels(imgEl, sampleSize = 10) {
  const canvas = document.createElement("canvas");
  const scale = Math.min(
    1,
    200 / Math.max(imgEl.naturalWidth, imgEl.naturalHeight),
  );
  canvas.width = Math.round(imgEl.naturalWidth * scale);
  canvas.height = Math.round(imgEl.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const pixels = [];
  for (let i = 0; i < data.length; i += 4 * sampleSize) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];
    if (
      a > 128 &&
      !(r > 250 && g > 250 && b > 250) &&
      !(r < 5 && g < 5 && b < 5)
    ) {
      pixels.push([r, g, b]);
    }
  }
  return pixels;
}

function medianCut(pixels, depth) {
  if (depth === 0 || pixels.length === 0) {
    const avg = pixels.reduce(
      ([ar, ag, ab], [r, g, b]) => [ar + r, ag + g, ab + b],
      [0, 0, 0],
    );
    const n = pixels.length || 1;
    return [
      [Math.round(avg[0] / n), Math.round(avg[1] / n), Math.round(avg[2] / n)],
    ];
  }
  const ranges = [0, 1, 2].map((c) => {
    const vals = pixels.map((p) => p[c]);
    return Math.max(...vals) - Math.min(...vals);
  });
  const channel = ranges.indexOf(Math.max(...ranges));
  pixels.sort((a, b) => a[channel] - b[channel]);
  const mid = Math.floor(pixels.length / 2);
  return [
    ...medianCut(pixels.slice(0, mid), depth - 1),
    ...medianCut(pixels.slice(mid), depth - 1),
  ];
}

function extractPalette(imgEl, count = 10) {
  const pixels = getPixels(imgEl, 4);
  const depth = Math.ceil(Math.log2(count));
  const palette = medianCut(pixels, depth).slice(0, count);
  return palette.map(([r, g, b]) => buildColorInfo(r, g, b));
}

// ─────────────────────────────────────────────
// Download helpers
// ─────────────────────────────────────────────

function downloadFile(content, filename, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildJSON(palette) {
  return JSON.stringify(
    palette.map((c) => ({
      hex: c.hex,
      rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
      hsl: `hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`,
    })),
    null,
    2,
  );
}

function buildTXT(palette) {
  return palette
    .map(
      (c, i) =>
        `Color ${i + 1}:\n  HEX: ${c.hex}\n  RGB: rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})\n  HSL: hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`,
    )
    .join("\n\n");
}

function buildCSS(palette) {
  const vars = palette
    .map(
      (c, i) =>
        `  --color-${i + 1}: ${c.hex};\n  --color-${i + 1}-rgb: ${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b};\n  --color-${i + 1}-hsl: ${c.hsl.h}deg ${c.hsl.s}% ${c.hsl.l}%;`,
    )
    .join("\n");
  return `:root {\n${vars}\n}`;
}

function buildTailwind(palette) {
  const colors = palette
    .map((c, i) => `    'extracted-${i + 1}': '${c.hex}',`)
    .join("\n");
  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      },\n    },\n  },\n};\n`;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function ColorCard({ color, index }) {
  const [copied, setCopied] = useState(null);

  const copy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      toast.success(`Copied ${label}!`, { duration: 1800 });
      setTimeout(() => setCopied(null), 1800);
    });
  };

  const { hex, rgb, hsl, textColor, contrastRatio, wcag } = color;

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-white/10 dark:border-white/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900">
      {/* Swatch */}
      <div
        className="relative h-24 flex items-center justify-center cursor-pointer"
        style={{ backgroundColor: hex }}
        onClick={() => copy(hex, "HEX")}
        title="Click to copy HEX"
      >
        <span
          className="text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm"
          style={{ color: textColor }}
        >
          {hex}
        </span>
        <span
          className="absolute top-2 right-2 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm"
          style={{ color: textColor }}
        >
          {index + 1}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        {/* HEX row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
              HEX
            </p>
            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">
              {hex}
            </p>
          </div>
          <button
            onClick={() => copy(hex, "HEX")}
            className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Copy HEX"
          >
            {copied === "HEX" ? (
              <CheckCircle size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

        {/* RGB row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
              RGB
            </p>
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
              {rgb.r}, {rgb.g}, {rgb.b}
            </p>
          </div>
          <button
            onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "RGB")}
            className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Copy RGB"
          >
            {copied === "RGB" ? (
              <CheckCircle size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

        {/* HSL row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
              HSL
            </p>
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
              {hsl.h}° {hsl.s}% {hsl.l}%
            </p>
          </div>
          <button
            onClick={() => copy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "HSL")}
            className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Copy HSL"
          >
            {copied === "HSL" ? (
              <CheckCircle size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

        {/* WCAG badge */}
        <div className="pt-1 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: hex, color: textColor }}
          >
            {textColor === "#FFFFFF" ? "Aa White" : "Aa Black"}
          </span>
          <span className={`text-[10px] font-bold ${wcag.color}`}>
            {wcag.level}
          </span>
          <span className="text-[10px] text-gray-400 ml-auto">
            {contrastRatio}:1
          </span>
        </div>
      </div>
    </div>
  );
}

function ClickColorPreview({ color, position }) {
  if (!color) return null;
  const { hex, rgb, hsl, textColor } = color;
  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{ left: position.x + 10, top: position.y - 80 }}
    >
      <div className="rounded-xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm bg-gray-900/90 text-white text-xs font-mono p-2 space-y-0.5 min-w-[130px]">
        <div
          className="w-full h-8 rounded-lg mb-1.5"
          style={{ backgroundColor: hex }}
        />
        <p
          className="font-bold text-sm"
          style={{ color: textColor === "#FFFFFF" ? "#A78BFA" : "#7C3AED" }}
        >
          {hex}
        </p>
        <p className="text-gray-300">
          rgb({rgb.r}, {rgb.g}, {rgb.b})
        </p>
        <p className="text-gray-400">
          hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)
        </p>
      </div>
      {/* Arrow */}
      <div className="w-2 h-2 bg-gray-900/90 rotate-45 mx-auto -mt-1 border-r border-b border-white/20" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function ColorPaletteExtractor() {
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [palette5, setPalette5] = useState([]);
  const [palette10, setPalette10] = useState([]);
  const [activeTab, setActiveTab] = useState("5");
  const [clickedColor, setClickedColor] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isExtracting, setIsExtracting] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const downloadMenuRef = useRef(null);

  // Close download menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(e.target)
      ) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const processImage = useCallback((src, imgEl) => {
    setIsExtracting(true);
    // Use rAF to let the img render first
    requestAnimationFrame(() => {
      try {
        const p10 = extractPalette(imgEl, 10);
        const p5 = extractPalette(imgEl, 5);
        setPalette10(p10);
        setPalette5(p5);
      } catch (e) {
        toast.error("Could not extract palette from this image.");
      } finally {
        setIsExtracting(false);
      }
    });
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setClickedColor(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target.result;
        setImageSrc(src);
        setImageFile(file);
        const img = new Image();
        img.onload = () => processImage(src, img);
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    [processImage],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    multiple: false,
  });

  // Canvas click → pick pixel
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext("2d");
    const px = ctx.getImageData(x, y, 1, 1).data;
    const color = buildColorInfo(px[0], px[1], px[2]);
    setClickedColor(color);
    setClickPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  // Draw image to canvas when imageSrc changes
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      // Maintain aspect ratio, max 700px wide
      const maxW = 700;
      const scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const clearAll = () => {
    setImageFile(null);
    setImageSrc(null);
    setPalette5([]);
    setPalette10([]);
    setClickedColor(null);
  };

  const activePalette = activeTab === "5" ? palette5 : palette10;

  const downloadActions = [
    {
      label: "Download JSON",
      icon: FileJson,
      action: () =>
        downloadFile(
          buildJSON(activePalette),
          "palette.json",
          "application/json",
        ),
    },
    {
      label: "Download TXT",
      icon: FileText,
      action: () => downloadFile(buildTXT(activePalette), "palette.txt"),
    },
    {
      label: "Download CSS Variables",
      icon: Code,
      action: () =>
        downloadFile(buildCSS(activePalette), "palette.css", "text/css"),
    },
    {
      label: "Download Tailwind Config",
      icon: Layers,
      action: () =>
        downloadFile(buildTailwind(activePalette), "tailwind-colors.js"),
    },
  ];

  return (
    <ToolPageShell widthClassName="max-w-7xl overflow-x-hidden">
      <div className="pb-8 px-3 sm:px-6 space-y-6 sm:space-y-8">
        {/* ── Hero Header ── */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4">
            <Palette size={15} />
            Color Palette Extractor
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Extract Beautiful Palettes{" "}
            <span className="bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
              from Any Image
            </span>
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
            Upload a photo and instantly extract dominant colours, pick pixels
            by clicking, and export your palette in JSON, CSS, or Tailwind
            format — all in your browser. No uploads. No server.
          </p>
        </div>

        {/* ── Upload Zone ── */}
        {!imageSrc && (
          <div
            {...getRootProps()}
            className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-6 sm:p-12 text-center
              ${
                isDragActive
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-[1.01]"
                  : "border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 bg-white dark:bg-gray-900 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
              }`}
          >
            <input {...getInputProps()} id="color-palette-upload" />
            <div className="flex flex-col items-center gap-4">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive ? "bg-purple-100 dark:bg-purple-800/40 scale-110" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                {isDragActive ? (
                  <Palette
                    size={36}
                    className="text-purple-500 animate-bounce"
                  />
                ) : (
                  <Upload
                    size={36}
                    className="text-gray-400 dark:text-gray-500 group-hover:text-purple-500 transition-colors"
                  />
                )}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {isDragActive
                    ? "Drop it like it's hot 🎨"
                    : "Drag & drop your image here"}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                  or{" "}
                  <span className="text-purple-600 dark:text-purple-400 font-semibold underline underline-offset-2">
                    click to browse
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {["JPG", "PNG", "WEBP"].map((fmt) => (
                  <span
                    key={fmt}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Main Workspace (after image loaded) ── */}
        {imageSrc && (
          <div className="space-y-6">
            {/* Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {imageFile?.name || "Uploaded image"}
                </span>
              </div>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
              >
                <X size={14} /> Remove image
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* ── Left: Canvas + Click Picker ── */}
              <div className="lg:col-span-3 space-y-4">
                <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <Pipette size={16} className="text-purple-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Click anywhere to pick a colour
                    </span>
                  </div>
                  <div className="relative" ref={containerRef}>
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      className="w-full cursor-crosshair block"
                      style={{ maxHeight: "480px", objectFit: "contain" }}
                    />
                    {clickedColor && (
                      <ClickColorPreview
                        color={clickedColor}
                        position={clickPosition}
                      />
                    )}
                  </div>
                </div>

                {/* Clicked colour panel */}
                {clickedColor && (
                  <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <Eye size={16} className="text-purple-500" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Picked Colour
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div
                          className="w-full h-14 sm:w-16 sm:h-16 rounded-xl shadow-md flex-shrink-0 border border-white/20"
                          style={{ backgroundColor: clickedColor.hex }}
                        />
                        <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3">
                          {[
                            {
                              label: "HEX",
                              value: clickedColor.hex,
                              copyVal: clickedColor.hex,
                            },
                            {
                              label: "RGB",
                              value: `rgb(${clickedColor.rgb.r}, ${clickedColor.rgb.g}, ${clickedColor.rgb.b})`,
                              copyVal: `rgb(${clickedColor.rgb.r}, ${clickedColor.rgb.g}, ${clickedColor.rgb.b})`,
                            },
                            {
                              label: "HSL",
                              value: `hsl(${clickedColor.hsl.h}°, ${clickedColor.hsl.s}%, ${clickedColor.hsl.l}%)`,
                              copyVal: `hsl(${clickedColor.hsl.h}, ${clickedColor.hsl.s}%, ${clickedColor.hsl.l}%)`,
                            },
                          ].map(({ label, value, copyVal }) => (
                            <button
                              key={label}
                              onClick={() => {
                                navigator.clipboard.writeText(copyVal);
                                toast.success(`Copied ${label}!`);
                              }}
                              className="text-left p-2 sm:p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all group"
                            >
                              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                                {label}
                              </p>
                              <p className="text-xs sm:text-sm font-mono font-semibold text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors truncate">
                                {value}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Contrast / WCAG info */}
                      <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex flex-wrap gap-3 items-center text-sm">
                        <Info
                          size={14}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="text-gray-600 dark:text-gray-400">
                          Best text colour:{" "}
                          <strong className="text-gray-800 dark:text-white">
                            {clickedColor.textColor === "#FFFFFF"
                              ? "White"
                              : "Black"}
                          </strong>
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Contrast ratio:{" "}
                          <strong className="text-gray-800 dark:text-white">
                            {clickedColor.contrastRatio}:1
                          </strong>
                        </span>
                        <span
                          className={`font-bold text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 ${clickedColor.wcag.color}`}
                        >
                          WCAG {clickedColor.wcag.level}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: Palette ── */}
              <div className="lg:col-span-2 space-y-4">
                {/* Palette header */}
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Palette size={16} className="text-purple-500" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Dominant Palette
                      </span>
                    </div>
                    {/* Tab switch */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-xs font-bold">
                      {["5", "10"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setActiveTab(t)}
                          className={`px-3 py-1.5 transition-all ${activeTab === t ? "bg-purple-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                        >
                          {t} Colors
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Palette strip */}
                  {activePalette.length > 0 && (
                    <div className="flex h-10">
                      {activePalette.map((c, i) => (
                        <div
                          key={i}
                          className="flex-1 cursor-pointer hover:flex-[2] transition-all duration-300"
                          style={{ backgroundColor: c.hex }}
                          title={c.hex}
                          onClick={() => {
                            navigator.clipboard.writeText(c.hex);
                            toast.success(`Copied ${c.hex}!`);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Loading */}
                {isExtracting && (
                  <div className="flex items-center justify-center gap-3 py-12 text-gray-500 dark:text-gray-400">
                    <RefreshCw
                      size={20}
                      className="animate-spin text-purple-500"
                    />
                    <span className="font-medium">Extracting palette…</span>
                  </div>
                )}

                {/* Color cards grid */}
                {!isExtracting && activePalette.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {activePalette.map((color, i) => (
                      <ColorCard
                        key={`${activeTab}-${i}`}
                        color={color}
                        index={i}
                      />
                    ))}
                  </div>
                )}

                {/* Download menu */}
                {!isExtracting && activePalette.length > 0 && (
                  <div className="relative" ref={downloadMenuRef}>
                    <button
                      onClick={() => setShowDownloadMenu((v) => !v)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 transition-all duration-200 hover:shadow-purple-500/30 hover:-translate-y-0.5"
                    >
                      <Download size={16} />
                      Export Palette
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${showDownloadMenu ? "rotate-180" : ""}`}
                      />
                    </button>
                    {showDownloadMenu && (
                      <div className="absolute top-full mt-2 left-0 right-0 z-30 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
                        {downloadActions.map(
                          ({ label, icon: Icon, action }) => (
                            <button
                              key={label}
                              onClick={() => {
                                action();
                                setShowDownloadMenu(false);
                                toast.success(`${label} ready!`);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                            >
                              <Icon size={15} className="text-gray-400" />
                              {label}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Info / How it works ── */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/10 border border-purple-100 dark:border-purple-800/30 p-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Info size={16} className="text-purple-500" /> How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Upload an image",
                desc: "Drag & drop or click to choose a JPG, PNG, or WEBP photo.",
              },
              {
                step: "2",
                title: "Extract or pick",
                desc: "Get 5 or 10 auto-extracted dominant colours, or click anywhere on the image to pick exact pixel colours.",
              },
              {
                step: "3",
                title: "Export your palette",
                desc: "Copy individual hex/rgb/hsl values or download the full palette as JSON, CSS, or a Tailwind config.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">
                    {title}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── WCAG explanation ── */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> WCAG Contrast
            Levels
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              {
                level: "AAA",
                ratio: "≥ 7:1",
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                desc: "Enhanced",
              },
              {
                level: "AA",
                ratio: "≥ 4.5:1",
                color: "text-green-600 dark:text-green-400",
                bg: "bg-green-50 dark:bg-green-900/20",
                desc: "Normal text",
              },
              {
                level: "AA Large",
                ratio: "≥ 3:1",
                color: "text-yellow-600 dark:text-yellow-400",
                bg: "bg-yellow-50 dark:bg-yellow-900/20",
                desc: "Large text",
              },
              {
                level: "Fail",
                ratio: "< 3:1",
                color: "text-red-600 dark:text-red-400",
                bg: "bg-red-50 dark:bg-red-900/20",
                desc: "Not accessible",
              },
            ].map(({ level, ratio, color, bg, desc }) => (
              <div key={level} className={`rounded-xl p-3 ${bg}`}>
                <p className={`font-bold ${color}`}>{level}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono mt-0.5">
                  {ratio}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
