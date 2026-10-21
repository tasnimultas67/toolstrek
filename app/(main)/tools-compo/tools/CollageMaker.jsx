"use client";

import React, { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Palette,
  RefreshCw,
  ShieldCheck,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

const LAYOUTS = [
  { value: "grid", label: "Grid" },
  { value: "masonry", label: "Masonry" },
  { value: "polaroid", label: "Polaroid" },
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

export default function CollageMaker() {
  const [images, setImages] = useState([]); // {id, src, name}
  const [layout, setLayout] = useState("grid");
  const [columns, setColumns] = useState(3);
  const [spacing, setSpacing] = useState(12);
  const [radius, setRadius] = useState(8);
  const [bgType, setBgType] = useState("solid");
  const [bgColor, setBgColor] = useState("#1a1a1a");
  const [bgColor2, setBgColor2] = useState("#4f46e5");
  const [shadow, setShadow] = useState(true);
  const [fit, setFit] = useState("cover");
  const [maxWidth, setMaxWidth] = useState(1200);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const dragIndexRef = useRef(null);

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const accepted = files.filter((f) => f.type.startsWith("image/"));
    if (accepted.length !== files.length) toast.error("Some files were not images and were skipped");
    if (accepted.length === 0) return;
    if (images.length + accepted.length > 36) { toast.error("Maximum 36 images"); return; }
    accepted.forEach((file) => {
      if (file.size > 20 * 1024 * 1024) { toast.error(`${file.name} too large (max 20MB)`); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, src: e.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const removeImage = useCallback((id) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    setResultUrl("");
  }, []);

  const shuffle = useCallback(() => {
    setImages((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }, []);

  const onDragStart = (idx) => { dragIndexRef.current = idx; };
  const onDragOver = (e, idx) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === idx) return;
    setImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(idx, 0, moved);
      dragIndexRef.current = idx;
      return arr;
    });
  };
  const onDragEnd = () => { dragIndexRef.current = null; };

  const generate = useCallback(async () => {
    if (images.length === 0) { toast.error("Upload at least one image"); return; }
    setProcessing(true);
    setError("");
    setResultUrl("");
    try {
      const loaded = await Promise.all(images.map((i) => loadImage(i.src)));
      const canvas = document.createElement("canvas");
      await buildCollage(canvas, loaded, { layout, columns, spacing, radius, bgType, bgColor, bgColor2, shadow, fit, maxWidth });
      const url = canvas.toDataURL("image/png");
      setResultUrl(url);
      const base64 = url.split(",")[1] || "";
      setResultSize(Math.round((base64.length * 3) / 4));
      toast.success("Collage created");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to build collage");
      toast.error("Failed to build collage");
    } finally {
      setProcessing(false);
    }
  }, [images, layout, columns, spacing, radius, bgType, bgColor, bgColor2, shadow, fit, maxWidth]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `collage-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [resultUrl]);

  const reset = useCallback(() => {
    setImages([]);
    setResultUrl("");
    setError("");
  }, []);

  return (
    <ToolPageShell widthClassName="max-w-7xl" className="px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 self-start">
            <ImageIcon size={12} /> Collage Maker
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Collage Maker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Combine multiple images into beautiful collages with grid, masonry and polaroid layouts — drag to reorder, fully customizable, 100% client-side.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            <X size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload + list */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <UploadCloud size={18} /> Images ({images.length})
            </h2>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-5 cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <UploadCloud size={24} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Drag & drop images or click</span>
              <span className="text-xs text-gray-400">Up to 36 images, 20MB each</span>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>

            <div className="flex gap-2">
              <button onClick={shuffle} disabled={images.length < 2} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium rounded-lg disabled:opacity-50">
                <Shuffle size={14} /> Shuffle
              </button>
              <button onClick={reset} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium rounded-lg">
                <RefreshCw size={14} /> Reset
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragEnd={onDragEnd}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 cursor-move"
                >
                  <GripVertical size={14} className="text-gray-400" />
                  <img src={img.src} alt={img.name} className="w-10 h-10 object-cover rounded" />
                  <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{img.name}</span>
                  <button onClick={() => removeImage(img.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <SlidersHorizontal size={18} /> Layout Settings
            </h2>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Layout</label>
              <div className="flex gap-2 mt-1">
                {LAYOUTS.map((l) => (
                  <button key={l.value} onClick={() => setLayout(l.value)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${layout === l.value ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {layout === "grid" && (
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Columns {columns}</label>
                <input type="range" min="1" max="6" value={columns} onChange={(e) => setColumns(+e.target.value)} className="w-full" />
              </div>
            )}
            {layout === "masonry" && (
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Columns {columns}</label>
                <input type="range" min="2" max="5" value={columns} onChange={(e) => setColumns(+e.target.value)} className="w-full" />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Spacing {spacing}px</label>
              <input type="range" min="0" max="40" value={spacing} onChange={(e) => setSpacing(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Corner radius {radius}px</label>
              <input type="range" min="0" max="40" value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Image fit</label>
              <select value={fit} onChange={(e) => setFit(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2 text-sm">
                <option value="cover">Cover (crop)</option>
                <option value="contain">Contain (letterbox)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Max width {maxWidth}px</label>
              <input type="range" min="600" max="2400" step="100" value={maxWidth} onChange={(e) => setMaxWidth(+e.target.value)} className="w-full" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Background</label>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setBgType("solid")} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${bgType === "solid" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>Solid</button>
                <button onClick={() => setBgType("gradient")} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${bgType === "gradient" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>Gradient</button>
              </div>
            </div>
            <div className="flex gap-2">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-gray-700" />
              {bgType === "gradient" && (
                <input type="color" value={bgColor2} onChange={(e) => setBgColor2(e.target.value)} className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-gray-700" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Drop shadow</label>
              <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} className="w-4 h-4" />
            </div>
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Sparkles size={18} /> Output
            </h2>
            <button
              onClick={generate}
              disabled={images.length === 0 || processing}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-indigo-600/10"
            >
              {processing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} {processing ? "Building..." : "Build Collage"}
            </button>

            {resultUrl && (
              <>
                <img src={resultUrl} alt="Collage result" className="w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{(resultSize / 1024).toFixed(1)} KB</div>
                <button onClick={handleDownload} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <Download size={14} /> Download PNG
                </button>
              </>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck size={12} /> 100% client-side. Images never leave your browser.
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}

// ---- collage builder ----
async function buildCollage(canvas, imgs, opts) {
  const { layout, columns, spacing, radius, bgType, bgColor, bgColor2, shadow, fit, maxWidth } = opts;
  const count = imgs.length;
  const cols = Math.max(1, Math.min(columns, count));

  // compute cell dimensions
  let cellW, cellH;
  if (layout === "masonry") {
    cellW = Math.floor((maxWidth - spacing * (cols + 1)) / cols);
    // variable heights
  } else {
    cellW = Math.floor((maxWidth - spacing * (cols + 1)) / cols);
    cellH = Math.round(cellW * 0.75);
  }

  // determine canvas size
  let canvasW = maxWidth;
  let canvasH;
  if (layout === "masonry") {
    // compute per-column heights
    const colHeights = new Array(cols).fill(spacing);
    const placements = imgs.map((img) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const h = Math.round(cellW * (img.naturalHeight / img.naturalWidth));
      const y = colHeights[col];
      colHeights[col] += h + spacing;
      return { img, col, y, h };
    });
    canvasH = Math.max(...colHeights) + spacing;
    canvas.width = canvasW;
    canvas.height = canvasH;
  } else if (layout === "polaroid") {
    const rows = Math.ceil(count / cols);
    canvasH = rows * (cellH + spacing + 40) + spacing;
    canvas.width = canvasW;
    canvas.height = canvasH;
  } else {
    const rows = Math.ceil(count / cols);
    canvasH = rows * (cellH + spacing) + spacing;
    canvas.width = canvasW;
    canvas.height = canvasH;
  }

  const ctx = canvas.getContext("2d");

  // background
  if (bgType === "gradient") {
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, bgColor);
    g.addColorStop(1, bgColor2);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = bgColor;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawRoundedImage = (img, x, y, w, h) => {
    ctx.save();
    if (shadow) {
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
    }
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, radius);
    ctx.clip();
    // fit
    if (fit === "cover") {
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const sw = w / scale;
      const sh = h / scale;
      const sx = (img.naturalWidth - sw) / 2;
      const sy = (img.naturalHeight - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    } else {
      const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, h);
      ctx.drawImage(img, dx, dy, dw, dh);
    }
    ctx.restore();
  };

  if (layout === "masonry") {
    const colHeights = new Array(cols).fill(spacing);
    imgs.forEach((img) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const h = Math.round(cellW * (img.naturalHeight / img.naturalWidth));
      const x = spacing + col * (cellW + spacing);
      const y = colHeights[col];
      drawRoundedImage(img, x, y, cellW, h);
      colHeights[col] += h + spacing;
    });
  } else if (layout === "polaroid") {
    imgs.forEach((img, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = spacing + col * (cellW + spacing);
      const y = spacing + row * (cellH + spacing + 40);
      // polaroid frame
      ctx.save();
      ctx.fillStyle = "#ffffff";
      if (shadow) { ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4; }
      roundRect(ctx, x - 8, y - 8, cellW + 16, cellH + 50, radius);
      ctx.fill();
      ctx.restore();
      drawRoundedImage(img, x, y, cellW, cellH);
    });
  } else {
    imgs.forEach((img, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = spacing + col * (cellW + spacing);
      const y = spacing + row * (cellH + spacing);
      drawRoundedImage(img, x, y, cellW, cellH);
    });
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

