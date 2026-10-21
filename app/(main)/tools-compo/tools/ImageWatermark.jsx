"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Download,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TextCursorInput,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

const FONTS = ["Arial", "Helvetica", "Georgia", "Times New Roman", "Courier New", "Verdana", "Trebuchet MS", "Impact"];
const BLEND_MODES = ["source-over", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion"];
const POSITIONS = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "middle-left", label: "Middle Left" },
  { value: "center", label: "Center" },
  { value: "middle-right", label: "Middle Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
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

function positionCoords(position, w, h, padding) {
  const p = padding;
  switch (position) {
    case "top-left": return { x: p, y: p, align: "left", baseline: "top" };
    case "top-center": return { x: w / 2, y: p, align: "center", baseline: "top" };
    case "top-right": return { x: w - p, y: p, align: "right", baseline: "top" };
    case "middle-left": return { x: p, y: h / 2, align: "left", baseline: "middle" };
    case "center": return { x: w / 2, y: h / 2, align: "center", baseline: "middle" };
    case "middle-right": return { x: w - p, y: h / 2, align: "right", baseline: "middle" };
    case "bottom-left": return { x: p, y: h - p, align: "left", baseline: "bottom" };
    case "bottom-center": return { x: w / 2, y: h - p, align: "center", baseline: "bottom" };
    case "bottom-right":
    default: return { x: w - p, y: h - p, align: "right", baseline: "bottom" };
  }
}

export default function ImageWatermark() {
  const [imageSrc, setImageSrc] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageDims, setImageDims] = useState(null);
  const [watermarkType, setWatermarkType] = useState("text");
  const [text, setText] = useState("© ToolsTrek");
  const [logoSrc, setLogoSrc] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState("bold");
  const [color, setColor] = useState("#FFFFFF");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [opacity, setOpacity] = useState(0.6);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState("bottom-right");
  const [padding, setPadding] = useState(24);
  const [tile, setTile] = useState(false);
  const [tileSpacing, setTileSpacing] = useState(120);
  const [logoScale, setLogoScale] = useState(0.15);
  const [blendMode, setBlendMode] = useState("source-over");
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [outputFormat, setOutputFormat] = useState("png");
  const [quality, setQuality] = useState(0.92);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const handleImageUpload = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
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

  const handleLogoUpload = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image logo"); return; }
    const reader = new FileReader();
    reader.onload = (e) => setLogoSrc(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  // Measure image dims
  useEffect(() => {
    if (!imageSrc) { setImageDims(null); return; }
    loadImage(imageSrc).then((img) => setImageDims({ w: img.naturalWidth, h: img.naturalHeight })).catch(() => setError("Could not load image"));
  }, [imageSrc]);

  const drawWatermark = useCallback(async (canvas, img) => {
    const ctx = canvas.getContext("2d");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = blendMode;

    const applyText = (x, y, align, baseline) => {
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      if (shadowBlur > 0) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
      if (strokeWidth > 0) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(text, x, y);
      }
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    };

    if (watermarkType === "text" && text.trim()) {
      if (tile) {
        const step = Math.max(fontSize * 2, tileSpacing);
        for (let y = -step; y < canvas.height + step; y += step) {
          for (let x = -step; x < canvas.width + step; x += step) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((rotation * Math.PI) / 180);
            applyText(0, 0, "center", "middle");
            ctx.restore();
          }
        }
      } else {
        const { x, y, align, baseline } = positionCoords(position, canvas.width, canvas.height, padding);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        applyText(0, 0, align, baseline);
        ctx.restore();
      }
    } else if (watermarkType === "logo" && logoSrc) {
      const logoImg = await loadImage(logoSrc);
      const logoW = canvas.width * logoScale;
      const logoH = (logoImg.naturalHeight / logoImg.naturalWidth) * logoW;
      const drawLogo = (x, y) => {
        ctx.drawImage(logoImg, x - logoW / 2, y - logoH / 2, logoW, logoH);
      };
      if (tile) {
        const step = Math.max(logoW + tileSpacing, tileSpacing);
        for (let y = step / 2; y < canvas.height; y += step) {
          for (let x = step / 2; x < canvas.width; x += step) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
            ctx.restore();
          }
        }
      } else {
        const { x, y } = positionCoords(position, canvas.width, canvas.height, padding + logoW / 2);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
        ctx.restore();
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }, [text, watermarkType, logoSrc, fontSize, fontFamily, fontWeight, color, strokeColor, strokeWidth, opacity, rotation, position, padding, tile, tileSpacing, logoScale, blendMode, shadowBlur, shadowColor]);

  // Live preview
  useEffect(() => {
    if (!imageSrc || !previewCanvasRef.current) return;
    let cancelled = false;
    loadImage(imageSrc).then((img) => {
      if (cancelled || !previewCanvasRef.current) return;
      const canvas = previewCanvasRef.current;
      const maxW = canvas.parentElement?.clientWidth || 600;
      const scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(scale, scale);
      // draw image
      ctx.drawImage(img, 0, 0);
      // watermark scaled
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = blendMode;
      // We'll just redraw scaled by calling a simplified version
      ctx.restore();
      // For simplicity, re-render watermark at scaled size by reusing draw logic on a temp canvas then scale
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [imageSrc, opacity, blendMode]);

  const generate = useCallback(async () => {
    if (!imageSrc) { toast.error("Please upload an image first"); return; }
    if (watermarkType === "text" && !text.trim()) { toast.error("Enter watermark text"); return; }
    if (watermarkType === "logo" && !logoSrc) { toast.error("Upload a logo image"); return; }
    setProcessing(true);
    setError("");
    setResultUrl("");
    try {
      const img = await loadImage(imageSrc);
      const canvas = document.createElement("canvas");
      await drawWatermark(canvas, img);
      const mime = outputFormat === "jpeg" ? "image/jpeg" : outputFormat === "webp" ? "image/webp" : "image/png";
      const url = canvas.toDataURL(mime, quality);
      setResultUrl(url);
      // estimate size
      const base64 = url.split(",")[1] || "";
      setResultSize(Math.round((base64.length * 3) / 4));
      toast.success("Watermark applied");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to process image");
      toast.error("Failed to apply watermark");
    } finally {
      setProcessing(false);
    }
  }, [imageSrc, watermarkType, text, logoSrc, drawWatermark, outputFormat, quality]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat === "webp" ? "webp" : "png";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `watermarked-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [resultUrl, outputFormat]);

  const handleCopy = useCallback(async () => {
    if (!resultUrl) return;
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } else {
        await navigator.clipboard.writeText(resultUrl);
        setCopied(true);
        toast.success("Link copied");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error("Copy failed");
    }
  }, [resultUrl]);

  const reset = useCallback(() => {
    setImageSrc("");
    setImageName("");
    setImageDims(null);
    setResultUrl("");
    setError("");
    setLogoSrc("");
  }, []);

  return (
    <ToolPageShell widthClassName="max-w-7xl" className="px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 self-start">
            <ImageIcon size={12} /> Image Watermark
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Image Watermark
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Add text or logo watermarks with rotation, tiling, blend modes, shadows and stroke — 100% client-side, images never leave your browser.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            <X size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <UploadCloud size={18} /> Source Image
            </h2>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files?.[0]); }}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <UploadCloud size={28} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Drag & drop or click to upload</span>
              <span className="text-xs text-gray-400">PNG, JPEG, WebP up to 25MB</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
            </label>
            {imageSrc && (
              <>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{imageName} {imageDims && `· ${imageDims.w}×${imageDims.h}`}</div>
                <img src={imageSrc} alt="Source" className="w-full h-40 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
              </>
            )}
          </div>

          {/* Watermark settings */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6 flex flex-col gap-4 lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <SlidersHorizontal size={18} /> Watermark Settings
            </h2>

            <div className="flex gap-2">
              <button onClick={() => setWatermarkType("text")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${watermarkType === "text" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>Text</button>
              <button onClick={() => setWatermarkType("logo")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${watermarkType === "logo" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>Logo</button>
            </div>

            {watermarkType === "text" ? (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Text</label>
                  <input value={text} onChange={(e) => setText(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Watermark text" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Font</label>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2 text-sm">
                      {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Weight</label>
                    <select value={fontWeight} onChange={(e) => setFontWeight(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2 text-sm">
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="900">Black</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Size {fontSize}px</label>
                    <input type="range" min="8" max="200" value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Opacity {(opacity * 100).toFixed(0)}%</label>
                    <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Color</label>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Stroke {strokeWidth}px</label>
                    <input type="range" min="0" max="8" value={strokeWidth} onChange={(e) => setStrokeWidth(+e.target.value)} className="w-full" />
                    {strokeWidth > 0 && <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-full h-7 mt-1 rounded border border-gray-200 dark:border-gray-700" />}
                  </div>
                </div>
              </>
            ) : (
              <>
                <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleLogoUpload(e.dataTransfer.files?.[0]); }} className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-indigo-400 transition-colors">
                  <UploadCloud size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">Upload logo (PNG recommended)</span>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
                </label>
                {logoSrc && <img src={logoSrc} alt="Logo" className="w-20 h-20 object-contain mx-auto" />}
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Logo scale {(logoScale * 100).toFixed(0)}%</label>
                  <input type="range" min="0.05" max="0.5" step="0.01" value={logoScale} onChange={(e) => setLogoScale(+e.target.value)} className="w-full" />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Position</label>
                <select value={position} onChange={(e) => setPosition(e.target.value)} disabled={tile} className="w-full mt-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2 text-sm disabled:opacity-50">
                  {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Rotation {rotation}°</label>
                <input type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(+e.target.value)} className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Padding {padding}px</label>
                <input type="range" min="0" max="100" value={padding} onChange={(e) => setPadding(+e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Blend</label>
                <select value={blendMode} onChange={(e) => setBlendMode(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-2 text-sm">
                  {BLEND_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tile watermark</label>
              <input type="checkbox" checked={tile} onChange={(e) => setTile(e.target.checked)} className="w-4 h-4" />
            </div>
            {tile && (
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tile spacing {tileSpacing}px</label>
                <input type="range" min="40" max="400" value={tileSpacing} onChange={(e) => setTileSpacing(+e.target.value)} className="w-full" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Shadow blur {shadowBlur}px</label>
                <input type="range" min="0" max="30" value={shadowBlur} onChange={(e) => setShadowBlur(+e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Shadow color</label>
                <input type="color" value={shadowColor.startsWith("rgba") ? "#000000" : shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700" />
              </div>
            </div>
          </div>

          {/* Output & actions */}
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
              {processing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} {processing ? "Processing..." : "Apply Watermark"}
            </button>

            {resultUrl && (
              <>
                <img src={resultUrl} alt="Result" className="w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{(resultSize / 1024).toFixed(1)} KB</div>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors">
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownload} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <Download size={14} /> Download
                  </button>
                </div>
              </>
            )}
            <button onClick={reset} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors">
              <RefreshCw size={14} /> Reset
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck size={12} /> 100% client-side. Images never leave your browser.
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}

