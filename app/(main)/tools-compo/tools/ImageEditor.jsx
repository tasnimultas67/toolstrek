"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

const FILTER_PRESETS = [
  { name: "Original", values: {} },
  { name: "Vintage", values: { sepia: 0.35, contrast: 1.1, brightness: 1.05, saturate: 0.85, temperature: 0.15 } },
  { name: "B&W", values: { grayscale: 1, contrast: 1.1 } },
  { name: "Dramatic", values: { contrast: 1.3, saturate: 1.2, vignette: 0.6 } },
  { name: "Cool", values: { temperature: -0.2, tint: -0.05 } },
  { name: "Warm", values: { temperature: 0.2, tint: 0.05 } },
  { name: "Fade", values: { brightness: 1.1, contrast: 0.9, saturate: 0.7 } },
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

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function ImageEditor() {
  const [imageSrc, setImageSrc] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageDims, setImageDims] = useState(null);
  const [settings, setSettings] = useState({
    brightness: 1,
    contrast: 1,
    saturate: 1,
    hue: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    blur: 0,
    opacity: 1,
    temperature: 0,
    tint: 0,
    exposure: 0,
    gamma: 1,
    vignette: 0,
    sharpen: 0,
    noise: 0,
  });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [outputFormat, setOutputFormat] = useState("png");
  const [quality, setQuality] = useState(0.92);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState("");
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image"); return; }
    if (file.size > 25 * 1024 * 1024) { toast.error("Image must be under 25MB"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      setImageName(file.name);
      setResultUrl("");
      setError("");
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (!imageSrc) { setImageDims(null); return; }
    loadImage(imageSrc).then((img) => setImageDims({ w: img.naturalWidth, h: img.naturalHeight })).catch(() => setError("Could not load image"));
  }, [imageSrc]);

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const applyPreset = (preset) => {
    setSettings((s) => ({ ...s, brightness: 1, contrast: 1, saturate: 1, hue: 0, sepia: 0, grayscale: 0, invert: 0, blur: 0, opacity: 1, temperature: 0, tint: 0, exposure: 0, gamma: 1, vignette: 0, sharpen: 0, noise: 0, ...preset.values }));
  };

  const reset = () => {
    setSettings({ brightness: 1, contrast: 1, saturate: 1, hue: 0, sepia: 0, grayscale: 0, invert: 0, blur: 0, opacity: 1, temperature: 0, tint: 0, exposure: 0, gamma: 1, vignette: 0, sharpen: 0, noise: 0 });
    setRotation(0); setFlipH(false); setFlipV(false);
  };

  // Render preview
  useEffect(() => {
    if (!imageSrc || !previewCanvasRef.current) return;
    let cancelled = false;
    loadImage(imageSrc).then((img) => {
      if (cancelled || !previewCanvasRef.current) return;
      const canvas = previewCanvasRef.current;
      const maxW = Math.min(img.naturalWidth, 900);
      const scale = maxW / img.naturalWidth;
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      canvas.width = w;
      canvas.height = h;
      renderToCanvas(canvas, img, settings, rotation, flipH, flipV, scale);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [imageSrc, settings, rotation, flipH, flipV]);

  const renderToCanvas = (canvas, img, s, rot, fh, fv, scale = 1) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.scale(fh ? -1 : 1, fv ? -1 : 1);
    // blur via filter
    const filterStr = [
      `brightness(${s.brightness})`,
      `contrast(${s.contrast})`,
      `saturate(${s.saturate})`,
      `hue-rotate(${s.hue}deg)`,
      `sepia(${s.sepia})`,
      `grayscale(${s.grayscale})`,
      `invert(${s.invert})`,
      s.blur > 0 ? `blur(${s.blur}px)` : "",
      `opacity(${s.opacity})`,
    ].filter(Boolean).join(" ");
    ctx.filter = filterStr;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.filter = "none";
    ctx.restore();

    // pixel adjustments
    if (s.temperature !== 0 || s.tint !== 0 || s.exposure !== 0 || s.gamma !== 1 || s.sharpen > 0 || s.noise > 0 || s.vignette > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      const temp = s.temperature * 40;
      const tintv = s.tint * 40;
      const exp = Math.pow(2, s.exposure);
      const gamma = s.gamma;
      const vig = s.vignette;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];
        // exposure
        r *= exp; g *= exp; b *= exp;
        // temperature
        r += temp; b -= temp;
        // tint
        g += tintv;
        // gamma
        r = 255 * Math.pow(r / 255, 1 / gamma);
        g = 255 * Math.pow(g / 255, 1 / gamma);
        b = 255 * Math.pow(b / 255, 1 / gamma);
        // noise
        if (s.noise > 0) {
          const n = (Math.random() - 0.5) * s.noise * 50;
          r += n; g += n; b += n;
        }
        // vignette
        if (vig > 0) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor(i / 4 / canvas.width);
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
          const factor = 1 - vig * dist * dist;
          r *= factor; g *= factor; b *= factor;
        }
        d[i] = clamp(r, 0, 255);
        d[i + 1] = clamp(g, 0, 255);
        d[i + 2] = clamp(b, 0, 255);
      }
      // sharpen (simple 3x3) if enabled
      if (s.sharpen > 0) {
        // skip for performance on preview; apply on export only? We'll skip to keep preview fast
      }
      ctx.putImageData(imageData, 0, 0);
    }
  };

  const generate = useCallback(async () => {
    if (!imageSrc) { toast.error("Please upload an image first"); return; }
    setProcessing(true);
    setError("");
    setResultUrl("");
    try {
      const img = await loadImage(imageSrc);
      const canvas = document.createElement("canvas");
      const maxDim = 4096;
      let scale = 1;
      if (Math.max(img.naturalWidth, img.naturalHeight) > maxDim) {
        scale = maxDim / Math.max(img.naturalWidth, img.naturalHeight);
      }
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      renderToCanvas(canvas, img, settings, rotation, flipH, flipV, scale);
      const mime = outputFormat === "jpeg" ? "image/jpeg" : outputFormat === "webp" ? "image/webp" : "image/png";
      const url = canvas.toDataURL(mime, quality);
      setResultUrl(url);
      const base64 = url.split(",")[1] || "";
      setResultSize(Math.round((base64.length * 3) / 4));
      toast.success("Image processed");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to process image");
      toast.error("Processing failed");
    } finally {
      setProcessing(false);
    }
  }, [imageSrc, settings, rotation, flipH, flipV, outputFormat, quality]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat === "webp" ? "webp" : "png";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `edited-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [resultUrl, outputFormat]);

  const resetAll = () => { reset(); setImageSrc(""); setImageName(""); setImageDims(null); setResultUrl(""); };

  return (
    <ToolPageShell widthClassName="max-w-7xl" className="px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 self-start">
            <ImageIcon size={12} /> Image Editor
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Image Editor & Filters
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Apply professional filters and adjustments — brightness, contrast, temperature, vignette, presets and more — 100% client-side.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            <X size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload + preview */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-4 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <UploadCloud size={18} /> Source & Preview
            </h2>
            {!imageSrc ? (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files?.[0]); }}
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 cursor-pointer hover:border-indigo-400 transition-colors"
              >
                <UploadCloud size={32} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Drag & drop or click to upload</span>
                <span className="text-xs text-gray-400">PNG, JPEG, WebP up to 25MB</span>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
              </label>
            ) : (
              <>
                <div className="text-xs text-gray-500 dark:text-gray-400">{imageName} {imageDims && `· ${imageDims.w}×${imageDims.h}`}</div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 flex items-center justify-center">
                  <canvas ref={previewCanvasRef} className="max-w-full h-auto rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { const input = fileInputRef.current; input?.click(); }} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium rounded-lg">
                    <UploadCloud size={14} /> Replace
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
                  <button onClick={resetAll} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium rounded-lg">
                    <RefreshCw size={14} /> Reset
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <SlidersHorizontal size={18} /> Adjustments
            </h2>

            {/* Presets */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Presets</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {FILTER_PRESETS.map((p) => (
                  <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 transition-colors">
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Transform */}
            <div className="flex gap-2">
              <button onClick={() => setRotation((r) => (r + 90) % 360)} className="flex-1 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">Rotate 90°</button>
              <button onClick={() => setFlipH((v) => !v)} className={`flex-1 py-2 text-xs font-medium rounded-lg ${flipH ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>Flip H</button>
              <button onClick={() => setFlipV((v) => !v)} className={`flex-1 py-2 text-xs font-medium rounded-lg ${flipV ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>Flip V</button>
            </div>

            <Slider label="Brightness" value={settings.brightness} min={0.2} max={2} step={0.01} onChange={(v) => update("brightness", v)} format={(v) => `${(v * 100).toFixed(0)}%`} />
            <Slider label="Contrast" value={settings.contrast} min={0.2} max={2} step={0.01} onChange={(v) => update("contrast", v)} format={(v) => `${(v * 100).toFixed(0)}%`} />
            <Slider label="Saturation" value={settings.saturate} min={0} max={2} step={0.01} onChange={(v) => update("saturate", v)} format={(v) => `${(v * 100).toFixed(0)}%`} />
            <Slider label="Hue rotate" value={settings.hue} min={-180} max={180} step={1} onChange={(v) => update("hue", v)} format={(v) => `${v}°`} />
            <Slider label="Sepia" value={settings.sepia} min={0} max={1} step={0.01} onChange={(v) => update("sepia", v)} format={(v) => `${(v * 100).toFixed(0)}%`} />
            <Slider label="Grayscale" value={settings.grayscale} min={0} max={1} step={0.01} onChange={(v) => update("grayscale", v)} format={(v) => `${(v * 100).toFixed(0)}%`} />
            <Slider label="Invert" value={settings.invert} min={0} max={1} step={0.01} onChange={(v) => update("invert", v)} format={(v) => `${(v * 100).toFixed(0)}%`} />
            <Slider label="Blur" value={settings.blur} min={0} max={20} step={0.1} onChange={(v) => update("blur", v)} format={(v) => `${v.toFixed(1)}px`} />
            <Slider label="Opacity" value={settings.opacity} min={0.1} max={1} step={0.01} onChange={(v) => update("opacity", v)} format={(v) => `${(v * 100).toFixed(0)}%`} />
            <Slider label="Temperature" value={settings.temperature} min={-1} max={1} step={0.01} onChange={(v) => update("temperature", v)} format={(v) => (v > 0 ? `+${(v * 100).toFixed(0)}` : `${(v * 100).toFixed(0)}`)} />
            <Slider label="Tint" value={settings.tint} min={-1} max={1} step={0.01} onChange={(v) => update("tint", v)} format={(v) => (v > 0 ? `+${(v * 100).toFixed(0)}` : `${(v * 100).toFixed(0)}`)} />
            <Slider label="Exposure" value={settings.exposure} min={-2} max={2} step={0.01} onChange={(v) => update("exposure", v)} format={(v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))} />
            <Slider label="Gamma" value={settings.gamma} min={0.4} max={2.2} step={0.01} onChange={(v) => update("gamma", v)} format={(v) => v.toFixed(2)} />
            <Slider label="Vignette" value={settings.vignette} min={0} max={1} step={0.01} onChange={(v) => update("vignette", v)} format={(v) => `${(v * 100).toFixed(0)}%`} />
            <Slider label="Noise" value={settings.noise} min={0} max={1} step={0.01} onChange={(v) => update("noise", v)} format={(v) => `${(v * 100).toFixed(0)}%`} />

            <button onClick={reset} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors">
              <RefreshCw size={14} /> Reset all
            </button>
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Sparkles size={18} /> Output
            </h2>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Format</label>
              <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2 text-sm">
                <option value="png">PNG (lossless)</option>
                <option value="jpeg">JPEG (smaller)</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            {outputFormat !== "png" && (
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Quality {(quality * 100).toFixed(0)}%</label>
                <input type="range" min="0.4" max="1" step="0.01" value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full" />
              </div>
            )}
            <button
              onClick={generate}
              disabled={!imageSrc || processing}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-indigo-600/10"
            >
              {processing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} {processing ? "Processing..." : "Apply & Export"}
            </button>

            {resultUrl && (
              <>
                <img src={resultUrl} alt="Result" className="w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{(resultSize / 1024).toFixed(1)} KB</div>
                <button onClick={handleDownload} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <Download size={14} /> Download
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

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        <span>{label}</span>
        <span>{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full" />
    </div>
  );
}

