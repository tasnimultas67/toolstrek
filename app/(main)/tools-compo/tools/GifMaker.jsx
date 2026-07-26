"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  UploadCloud,
  Trash2,
  Play,
  Pause,
  Download,
  Settings2,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  RotateCw,
  Shuffle,
  Layers,
  Zap,
  Film,
  Eye,
  SlidersHorizontal,
  Timer,
  Palette,
  Maximize2,
  ArrowUp,
  ArrowDown,
  X,
  Info,
  Sparkles,
  ImageIcon,
  RefreshCw,
  Copy,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (bytes, dec = 1) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(dec)} ${sizes[i]}`;
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ─── Preset Sizes ─────────────────────────────────────────────────────────────
const SIZE_PRESETS = [
  { label: "Original", width: null, height: null },
  { label: "320×240", width: 320, height: 240 },
  { label: "480×360", width: 480, height: 360 },
  { label: "640×480", width: 640, height: 480 },
  { label: "800×600", width: 800, height: 600 },
  { label: "1:1 Square (480)", width: 480, height: 480 },
  { label: "16:9 (640)", width: 640, height: 360 },
];

// ─── Quality Presets ──────────────────────────────────────────────────────────
const QUALITY_PRESETS = [
  { label: "Low", value: 20, color: "text-rose-500" },
  { label: "Medium", value: 10, color: "text-amber-500" },
  { label: "High", value: 5, color: "text-emerald-500" },
  { label: "Best", value: 1, color: "text-violet-500" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GifMaker() {
  // ── Frames state ────────────────────────────────────────────────────────────
  const [frames, setFrames] = useState([]); // { id, src, blob, width, height, name, delay }
  const [selectedFrames, setSelectedFrames] = useState(new Set());
  const [draggingFrame, setDraggingFrame] = useState(null);
  const [dragOverFrame, setDragOverFrame] = useState(null);

  // ── GIF config ──────────────────────────────────────────────────────────────
  const [globalDelay, setGlobalDelay] = useState(100); // ms per frame
  const [loops, setLoops] = useState(0); // 0 = infinite
  const [quality, setQuality] = useState(10); // 1 best → 20 worst
  const [outputWidth, setOutputWidth] = useState(null);
  const [outputHeight, setOutputHeight] = useState(null);
  const [sizePreset, setSizePreset] = useState("Original");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [dither, setDither] = useState(false);
  const [optimizeFrames, setOptimizeFrames] = useState(true);
  const [reverseLoop, setReverseLoop] = useState(false);
  const [pingPong, setPingPong] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [transparency, setTransparency] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewPlaying, setPreviewPlaying] = useState(true);
  const [previewFrameIdx, setPreviewFrameIdx] = useState(0);
  const [gifBlob, setGifBlob] = useState(null);
  const [gifSize, setGifSize] = useState(0);
  const [activeTab, setActiveTab] = useState("frames"); // "frames" | "preview"

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const previewTimerRef = useRef(null);
  const canvasRef = useRef(null);
  const gifWorkerRef = useRef(null);
  const nextId = useRef(0);

  // ── Preview animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!frames.length || !previewPlaying) return;
    previewTimerRef.current = setInterval(() => {
      setPreviewFrameIdx((i) => (i + 1) % frames.length);
    }, frames[previewFrameIdx]?.delay ?? globalDelay);
    return () => clearInterval(previewTimerRef.current);
  }, [frames, previewPlaying, previewFrameIdx, globalDelay]);

  // ── Load images helper ───────────────────────────────────────────────────────
  const loadImageFile = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
          reject(new Error(`"${file.name}" is not an image.`));
          return;
        }
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          resolve({
            id: nextId.current++,
            src: url,
            blob: file,
            width: img.naturalWidth,
            height: img.naturalHeight,
            name: file.name,
            delay: globalDelay,
          });
        };
        img.onerror = () => reject(new Error(`Failed to load "${file.name}".`));
        img.src = url;
      }),
    [globalDelay]
  );

  // ── Add frames ───────────────────────────────────────────────────────────────
  const addFiles = async (files) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!imageFiles.length) {
      toast.error("No valid image files found.");
      return;
    }
    try {
      const loaded = await Promise.all(imageFiles.map(loadImageFile));
      setFrames((prev) => [...prev, ...loaded]);
      toast.success(
        `${loaded.length} frame${loaded.length > 1 ? "s" : ""} added!`
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Frame order DnD ──────────────────────────────────────────────────────────
  const handleFrameDragStart = (id) => setDraggingFrame(id);
  const handleFrameDragOver = (e, id) => {
    e.preventDefault();
    setDragOverFrame(id);
  };
  const handleFrameDrop = (targetId) => {
    if (draggingFrame === null || draggingFrame === targetId) return;
    setFrames((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((f) => f.id === draggingFrame);
      const toIdx = arr.findIndex((f) => f.id === targetId);
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    setDraggingFrame(null);
    setDragOverFrame(null);
  };

  // ── Frame actions ────────────────────────────────────────────────────────────
  const removeFrame = (id) => {
    setFrames((prev) => prev.filter((f) => f.id !== id));
    setSelectedFrames((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const duplicateFrame = (id) => {
    setFrames((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: nextId.current++ };
      const arr = [...prev];
      arr.splice(idx + 1, 0, copy);
      return arr;
    });
    toast.success("Frame duplicated.");
  };

  const moveFrame = (id, dir) => {
    setFrames((prev) => {
      const arr = [...prev];
      const idx = arr.findIndex((f) => f.id === id);
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const updateFrameDelay = (id, delay) => {
    setFrames((prev) =>
      prev.map((f) => (f.id === id ? { ...f, delay: clamp(delay, 20, 5000) } : f))
    );
  };

  const applyGlobalDelay = () => {
    setFrames((prev) => prev.map((f) => ({ ...f, delay: globalDelay })));
    toast.success("Global delay applied to all frames.");
  };

  const reverseFrames = () => {
    setFrames((prev) => [...prev].reverse());
    toast.success("Frames reversed.");
  };

  const shuffleFrames = () => {
    setFrames((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    toast.success("Frames shuffled.");
  };

  const clearAllFrames = () => {
    frames.forEach((f) => URL.revokeObjectURL(f.src));
    setFrames([]);
    setSelectedFrames(new Set());
    setPreviewUrl(null);
    setGifBlob(null);
    setPreviewFrameIdx(0);
    toast.success("All frames cleared.");
  };

  // ── Size preset logic ─────────────────────────────────────────────────────────
  const applySizePreset = (preset) => {
    setSizePreset(preset.label);
    setOutputWidth(preset.width);
    setOutputHeight(preset.height);
    if (preset.width) {
      setCustomWidth(preset.width.toString());
      setCustomHeight(preset.height.toString());
    } else {
      setCustomWidth("");
      setCustomHeight("");
    }
  };

  // ── Generate GIF using gif.js ─────────────────────────────────────────────────
  const generateGif = async () => {
    if (!frames.length) {
      toast.error("Add at least one frame to generate a GIF.");
      return;
    }

    // Load gif.js from local /public folder (avoids CORS issues with CDN workers)
    if (!window.GIF) {
      await new Promise((resolve, reject) => {
        const existing = document.getElementById("gifjs-script");
        if (existing) { resolve(); return; }
        const script = document.createElement("script");
        script.id = "gifjs-script";
        script.src = "/gif.js"; // served from /public/gif.js at same origin
        script.onload = resolve;
        script.onerror = () => reject(new Error("Could not load /gif.js from public folder."));
        document.head.appendChild(script);
      }).catch((err) => {
        toast.error("Failed to load GIF engine: " + err.message);
        return null;
      });
      if (!window.GIF) return;
    }

    setIsGenerating(true);
    setProgress(0);
    setActiveTab("preview");

    try {
      // Build the list of frames to render (with ping-pong if needed)
      let frameList = [...frames];
      if (reverseLoop) frameList = [...frameList].reverse();
      if (pingPong) frameList = [...frameList, ...[...frameList].reverse().slice(1, -1)];

      // Determine output size
      let outW = outputWidth;
      let outH = outputHeight;
      if (!outW || !outH) {
        // Auto: use first frame's size
        outW = frames[0].width;
        outH = frames[0].height;
      }

      const gif = new window.GIF({
        workers: 2,
        quality,
        width: outW,
        height: outH,
        workerScript: "/gif.worker.js", // served from /public/gif.worker.js — same origin, no CORS
        repeat: loops === 0 ? 0 : loops,
        background: transparency ? "transparent" : backgroundColor,
        transparent: transparency ? 0x00 : null,
        dither: dither ? "FloydSteinberg" : false,
      });

      // Draw each frame onto canvas
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");

      for (const frame of frameList) {
        await new Promise((res, rej) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.clearRect(0, 0, outW, outH);
            if (!transparency) {
              ctx.fillStyle = backgroundColor;
              ctx.fillRect(0, 0, outW, outH);
            }
            // Fit the image into the canvas
            const scale = Math.min(outW / img.naturalWidth, outH / img.naturalHeight);
            const dw = img.naturalWidth * scale;
            const dh = img.naturalHeight * scale;
            const dx = (outW - dw) / 2;
            const dy = (outH - dh) / 2;
            ctx.drawImage(img, dx, dy, dw, dh);
            gif.addFrame(canvas, { delay: frame.delay, copy: true });
            res();
          };
          img.onerror = rej;
          img.src = frame.src;
        });
      }

      gif.on("progress", (p) => {
        setProgress(Math.round(p * 100));
      });

      gif.on("finished", (blob) => {
        const url = URL.createObjectURL(blob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
        setGifBlob(blob);
        setGifSize(blob.size);
        setIsGenerating(false);
        setProgress(100);
        toast.success("GIF generated successfully!");
      });

      gif.render();
    } catch (err) {
      console.error(err);
      toast.error("GIF generation failed. " + err.message);
      setIsGenerating(false);
    }
  };

  const downloadGif = () => {
    if (!gifBlob) return;
    const url = URL.createObjectURL(gifBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `animated-gif-${Date.now()}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("GIF downloaded!");
  };

  // ── Estimated output size (rough) ────────────────────────────────────────────
  const estW = outputWidth || frames[0]?.width || 0;
  const estH = outputHeight || frames[0]?.height || 0;
  const estFrames = pingPong ? frames.length * 2 - 2 : frames.length;
  const estSize =
    estW && estH
      ? formatBytes(estW * estH * estFrames * (quality / 20) * 0.15)
      : "—";

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <ToolPageShell widthClassName="max-w-7xl" className="py-6 px-4">
      {/* ── Header ── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-[22px] sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
          GIF Maker
        </h1>
        <p className="text-[12px] sm:text-[14px] text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto leading-relaxed">
          Transform images into animated GIFs entirely in your browser — no uploads, no servers, 100% private.
          Drag &amp; drop frames, set delays, apply effects, and download in seconds.
        </p>

        {/* Info Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {[
            { icon: <Zap className="w-3 h-3" />, text: "Client-Side Only" },
            { icon: <Eye className="w-3 h-3" />, text: "Live Preview" },
            { icon: <Layers className="w-3 h-3" />, text: "Frame Control" },
            { icon: <SlidersHorizontal className="w-3 h-3" />, text: "Advanced Options" },
          ].map((p) => (
            <span
              key={p.text}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-[13px] font-medium px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60"
            >
              {p.icon}
              {p.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* ── LEFT: Frame Manager ─────────────────────────────────────────── */}
        <div className="xl:col-span-8 space-y-5">

          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
              isDragging
                ? "border-violet-500 bg-violet-50/60 dark:border-violet-400 dark:bg-violet-950/20 shadow-inner"
                : "border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm"
            }`}
          >
            {/* Animated background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragging
                  ? "bg-violet-500 shadow-lg shadow-violet-500/40"
                  : "bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/60 dark:to-fuchsia-950/40 group-hover:shadow-md"
              }`}>
                <UploadCloud className={`w-7 h-7 transition-colors ${isDragging ? "text-white" : "text-violet-600 dark:text-violet-400"}`} />
              </div>
              <div>
                <p className="text-[13px] sm:text-[15px] font-semibold text-gray-800 dark:text-gray-200">
                  Drop images here or{" "}
                  <span className="text-violet-600 dark:text-violet-400">Browse Files</span>
                </p>
                <p className="text-[12px] sm:text-[13px] text-gray-400 dark:text-gray-500 mt-1">
                  Supports PNG, JPEG, WebP, GIF frames — Multiple files allowed
                </p>
              </div>
            </div>
          </div>

          {/* Frames Panel */}
          {frames.length > 0 && (
            <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Panel Header */}
              <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-violet-50/60 to-fuchsia-50/30 dark:from-violet-950/20 dark:to-fuchsia-950/10">
                <div className="flex items-center gap-2 flex-1">
                  <Layers className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-[13px] sm:text-[14px] font-bold text-gray-800 dark:text-gray-200">
                    Frames
                  </span>
                  <span className="text-[11px] sm:text-[12px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-semibold">
                    {frames.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    title="Reverse order"
                    onClick={reverseFrames}
                    className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-950/50 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    title="Shuffle frames"
                    onClick={shuffleFrames}
                    className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-950/50 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    title="Clear all"
                    onClick={clearAllFrames}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-gray-500 hover:text-rose-500 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Frame Grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {frames.map((frame, idx) => (
                    <div
                      key={frame.id}
                      draggable
                      onDragStart={() => handleFrameDragStart(frame.id)}
                      onDragOver={(e) => handleFrameDragOver(e, frame.id)}
                      onDrop={() => handleFrameDrop(frame.id)}
                      onDragEnd={() => { setDraggingFrame(null); setDragOverFrame(null); }}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                        dragOverFrame === frame.id
                          ? "border-violet-500 scale-105 shadow-lg shadow-violet-500/20"
                          : "border-gray-100 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600"
                      }`}
                    >
                      {/* Frame index badge */}
                      <div className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {idx + 1}
                      </div>

                      {/* Thumbnail */}
                      <div className="aspect-square bg-gray-50 dark:bg-gray-900">
                        <img
                          src={frame.src}
                          alt={frame.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>

                      {/* Hover Controls */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveFrame(frame.id, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 transition-all cursor-pointer"
                            title="Move up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => duplicateFrame(frame.id)}
                            className="p-1 rounded bg-white/20 hover:bg-violet-500/80 text-white transition-all cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveFrame(frame.id, 1)}
                            disabled={idx === frames.length - 1}
                            className="p-1 rounded bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 transition-all cursor-pointer"
                            title="Move down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFrame(frame.id)}
                          className="p-1 rounded bg-white/20 hover:bg-rose-500/80 text-white transition-all cursor-pointer"
                          title="Remove frame"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Delay input */}
                      <div className="bg-gray-50 dark:bg-gray-900/80 px-2 py-1 flex items-center gap-1">
                        <Timer className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                        <input
                          type="number"
                          value={frame.delay}
                          min={20}
                          max={5000}
                          step={10}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateFrameDelay(frame.id, parseInt(e.target.value) || 100)}
                          className="w-full text-[11px] sm:text-[12px] bg-transparent text-gray-600 dark:text-gray-400 focus:outline-none text-center"
                        />
                        <span className="text-[10px] text-gray-400 flex-shrink-0">ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {frames.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/40 dark:to-fuchsia-950/30 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-violet-400" />
              </div>
              <p className="text-[13px] sm:text-[14px] font-medium text-gray-600 dark:text-gray-400">No frames yet</p>
              <p className="text-[12px] sm:text-[13px] text-gray-400 dark:text-gray-500 mt-1">Upload images above to start building your GIF</p>
            </div>
          )}

          {/* Preview Section (visible on preview tab or when gif exists) */}
          {(previewUrl || (frames.length > 0 && activeTab === "preview")) && (
            <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-emerald-50/60 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10">
                <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[13px] sm:text-[14px] font-bold text-gray-800 dark:text-gray-200 flex-1">
                  GIF Preview
                </span>
                {gifSize > 0 && (
                  <span className="text-[11px] sm:text-[12px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {formatBytes(gifSize)}
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col items-center gap-4">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 rounded-full border-4 border-violet-100 dark:border-violet-900" />
                      <div
                        className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"
                        style={{ animationDuration: "0.8s" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[13px] sm:text-[14px] font-bold text-violet-600 dark:text-violet-400">
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full max-w-xs">
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400">
                      Rendering frames… please wait
                    </p>
                  </div>
                ) : previewUrl ? (
                  <>
                    <div className="rounded-xl overflow-hidden bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23e5e7eb%22%2F%3E%3C/svg%3E')] border border-gray-200 dark:border-gray-700 max-h-72 flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Generated GIF preview"
                        className="max-h-64 max-w-full object-contain"
                      />
                    </div>
                    <button
                      onClick={downloadGif}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-[13px] sm:text-[14px] shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download GIF ({formatBytes(gifSize)})
                    </button>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-[12px] sm:text-[13px] text-gray-400">Click &quot;Generate GIF&quot; to render your animation</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Frame Preview (before generating) */}
          {frames.length > 0 && !previewUrl && !isGenerating && (
            <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <Play className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-[13px] sm:text-[14px] font-bold text-gray-800 dark:text-gray-200 flex-1">Live Frame Preview</span>
                <button
                  onClick={() => setPreviewPlaying((p) => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-950/80 transition-all cursor-pointer"
                >
                  {previewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {previewPlaying ? "Pause" : "Play"}
                </button>
              </div>
              <div className="p-5 flex flex-col items-center gap-3">
                <div className="rounded-xl overflow-hidden bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f3f4f6%22%2F%3E%3C/svg%3E')] dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-h-60 flex items-center justify-center">
                  <img
                    src={frames[previewFrameIdx % frames.length]?.src}
                    alt="Frame preview"
                    className="max-h-56 max-w-full object-contain"
                  />
                </div>
                <p className="text-[11px] sm:text-[12px] text-gray-400">
                  Frame {(previewFrameIdx % frames.length) + 1} / {frames.length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Config Panel ─────────────────────────────────────────── */}
        <div className="xl:col-span-4 space-y-4">

          {/* Generate Button */}
          <button
            onClick={generateGif}
            disabled={!frames.length || isGenerating}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-700 text-white font-bold text-[14px] sm:text-[16px] shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating… {progress}%
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate GIF
                {frames.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[12px] font-semibold">
                    {frames.length} frame{frames.length > 1 ? "s" : ""}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Stats card */}
          {frames.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Frames", value: pingPong ? `${frames.length * 2 - 2}` : frames.length },
                { label: "Est. Size", value: estSize },
                { label: "Output", value: `${estW || "?"}×${estH || "?"}` },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-center">
                  <div className="text-[11px] sm:text-[12px] text-gray-400 uppercase tracking-wider">{s.label}</div>
                  <div className="text-[13px] sm:text-[14px] font-bold text-gray-800 dark:text-gray-200 mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Timing & Delay */}
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-4">
            <h3 className="text-[12px] sm:text-[14px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wider">
              <Timer className="w-4 h-4 text-violet-500" />
              Timing
            </h3>

            {/* Global Delay */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400">
                  Global Delay (ms)
                </label>
                <span className="text-[12px] sm:text-[14px] font-bold text-violet-600 dark:text-violet-400">
                  {globalDelay}ms
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={2000}
                step={10}
                value={globalDelay}
                onChange={(e) => setGlobalDelay(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-violet-200 to-fuchsia-200 dark:from-violet-900 dark:to-fuchsia-900 accent-violet-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>20ms (Fast)</span>
                <span>2000ms (Slow)</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[50, 100, 200, 500].map((v) => (
                  <button
                    key={v}
                    onClick={() => setGlobalDelay(v)}
                    className={`py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold border transition-all cursor-pointer ${
                      globalDelay === v
                        ? "bg-violet-100 dark:bg-violet-950/60 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {v}ms
                  </button>
                ))}
              </div>
              <button
                onClick={applyGlobalDelay}
                className="mt-2 w-full py-2 rounded-xl text-[12px] sm:text-[13px] font-medium bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/60 border border-violet-200 dark:border-violet-800 transition-all cursor-pointer"
              >
                Apply to All Frames
              </button>
            </div>

            {/* Loop Count */}
            <div>
              <label className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 block mb-2">
                Loop Count{" "}
                <span className="text-violet-600 dark:text-violet-400 font-bold">
                  {loops === 0 ? "(∞ Infinite)" : `(${loops}×)`}
                </span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 3, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setLoops(v)}
                    className={`py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold border transition-all cursor-pointer ${
                      loops === v
                        ? "bg-fuchsia-100 dark:bg-fuchsia-950/60 border-fuchsia-300 dark:border-fuchsia-700 text-fuchsia-700 dark:text-fuchsia-300"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {v === 0 ? "∞" : `${v}×`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quality */}
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-4">
            <h3 className="text-[12px] sm:text-[14px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-fuchsia-500" />
              Quality
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {QUALITY_PRESETS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => setQuality(q.value)}
                  className={`py-2.5 px-3 rounded-xl text-[12px] sm:text-[13px] font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                    quality === q.value
                      ? "bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-300 dark:border-fuchsia-700"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className={quality === q.value ? q.color : "text-gray-600 dark:text-gray-400"}>
                    {q.label}
                  </span>
                  {quality === q.value && <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Output Size */}
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-4">
            <h3 className="text-[12px] sm:text-[14px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wider">
              <Maximize2 className="w-4 h-4 text-pink-500" />
              Output Size
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {SIZE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applySizePreset(p)}
                  className={`py-2 px-2.5 rounded-lg text-[11px] sm:text-[12px] font-medium border transition-all cursor-pointer text-left ${
                    sizePreset === p.label
                      ? "bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* Custom Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] sm:text-[12px] text-gray-400 mb-1 block">Width (px)</label>
                <input
                  type="number"
                  value={customWidth}
                  placeholder="e.g. 600"
                  min={1}
                  onChange={(e) => {
                    setCustomWidth(e.target.value);
                    setOutputWidth(parseInt(e.target.value) || null);
                    setSizePreset("Custom");
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[12px] sm:text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                />
              </div>
              <div>
                <label className="text-[11px] sm:text-[12px] text-gray-400 mb-1 block">Height (px)</label>
                <input
                  type="number"
                  value={customHeight}
                  placeholder="e.g. 400"
                  min={1}
                  onChange={(e) => {
                    setCustomHeight(e.target.value);
                    setOutputHeight(parseInt(e.target.value) || null);
                    setSizePreset("Custom");
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[12px] sm:text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                />
              </div>
            </div>
          </div>

          {/* ── Advanced Options Toggle ── */}
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white hover:from-violet-900 hover:to-fuchsia-900 transition-all duration-300 cursor-pointer group shadow-md"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-violet-400 group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-[13px] sm:text-[14px] font-bold">Advanced Options</span>
            </div>
            <div className="flex items-center gap-2">
              {showAdvanced && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600 text-white font-bold">ON</span>
              )}
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-violet-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </button>

          {/* Advanced Options Panel */}
          {showAdvanced && (
            <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-violet-200 dark:border-violet-800/50 shadow-sm p-5 space-y-5 ring-1 ring-violet-500/10">
              {/* Animated accent bar */}
              <div className="h-1 -mt-2 -mx-5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-t-none rounded-b-none" />

              {/* Playback Effects */}
              <div>
                <p className="text-[12px] sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-violet-500" />
                  Playback Effects
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "Ping-Pong Loop", desc: "Plays forward then backward", state: pingPong, setState: setPingPong },
                    { label: "Reverse Loop", desc: "Plays frames in reverse order", state: reverseLoop, setState: setReverseLoop },
                    { label: "Dithering", desc: "Improves color transitions", state: dither, setState: setDither },
                    { label: "Optimize Frames", desc: "Only encode changed pixels", state: optimizeFrames, setState: setOptimizeFrames },
                    { label: "Transparency", desc: "Enable transparent background", state: transparency, setState: setTransparency },
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={opt.state}
                          onChange={(e) => opt.setState(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-fuchsia-500 transition-all" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
                      </div>
                      <div>
                        <p className="text-[12px] sm:text-[13px] font-semibold text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {opt.label}
                        </p>
                        <p className="text-[11px] sm:text-[12px] text-gray-400 dark:text-gray-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              {!transparency && (
                <div>
                  <p className="text-[12px] sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-pink-500" />
                    Background Color
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer bg-transparent"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setBackgroundColor(c)}
                          className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${
                            backgroundColor === c ? "border-violet-500 scale-110" : "border-gray-200 dark:border-gray-700"
                          }`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] sm:text-[12px] text-gray-400 font-mono">{backgroundColor}</span>
                  </div>
                </div>
              )}

              {/* Fine Quality Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-fuchsia-500" />
                    Fine Quality
                  </p>
                  <span className="text-[12px] sm:text-[13px] font-bold text-fuchsia-600 dark:text-fuchsia-400">
                    {quality === 1 ? "Best" : quality <= 5 ? "High" : quality <= 10 ? "Medium" : "Low"} ({quality})
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none accent-fuchsia-600 bg-gradient-to-r from-fuchsia-200 to-gray-200 dark:from-fuchsia-900 dark:to-gray-700 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>1 (Best quality / larger file)</span>
                  <span>20 (Smaller file)</span>
                </div>
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/20 rounded-2xl border border-violet-100 dark:border-violet-900/40 p-5">
            <h3 className="text-[12px] sm:text-[14px] font-bold text-violet-800 dark:text-violet-300 flex items-center gap-2 mb-3">
              <Info className="w-4 h-4" />
              How It Works
            </h3>
            <ol className="space-y-2">
              {[
                "Upload one or more images as frames",
                "Drag to reorder frames in the grid",
                "Set per-frame or global delay (animation speed)",
                "Choose output size and quality",
                "Toggle Advanced Options for effects",
                "Click Generate GIF and download!",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[12px] sm:text-[13px] text-violet-700 dark:text-violet-300 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Pro Tips */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 rounded-2xl border border-amber-200 dark:border-amber-800/40 p-5">
            <h3 className="text-[12px] sm:text-[14px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4" />
              Pro Tips
            </h3>
            <ul className="space-y-2">
              {[
                "Lower delay = faster animation (50ms is snappy)",
                "Enable Ping-Pong for seamless back-and-forth loops",
                "Use Dithering for smoother color gradients",
                "Enable Transparency for overlay-ready GIFs",
                "Drag frames in the grid to reorder instantly",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] sm:text-[13px] text-amber-700 dark:text-amber-300">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">✦</span>
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
