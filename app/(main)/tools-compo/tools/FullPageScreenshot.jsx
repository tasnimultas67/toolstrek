"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Globe,
  Settings2,
  Sliders,
  FileText,
  Image as ImageIcon,
  FileImage,
  Crop,
  Pipette,
  ZoomIn,
  ZoomOut,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  AlertCircle,
  Info,
  ShieldAlert,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  Trash2,
  RefreshCw,
  X,
  Layers,
  Shield,
  Maximize2,
  Download,
  History,
  Wand2,
  RotateCcw,
  ScanLine,
  BadgeCheck,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEVICE_PRESETS = [
  {
    id: "desktop",
    label: "Desktop",
    width: 1920,
    height: 1080,
    icon: Monitor,
    dpr: 1,
    isMobile: false,
  },
  {
    id: "laptop",
    label: "Laptop",
    width: 1440,
    height: 900,
    icon: Laptop,
    dpr: 1,
    isMobile: false,
  },
  {
    id: "tablet",
    label: "Tablet",
    width: 768,
    height: 1024,
    icon: Tablet,
    dpr: 2,
    isMobile: true,
  },
  {
    id: "mobile",
    label: "Mobile",
    width: 390,
    height: 844,
    icon: Smartphone,
    dpr: 3,
    isMobile: true,
  },
  {
    id: "custom",
    label: "Custom",
    width: 1280,
    height: 800,
    icon: Settings2,
    dpr: 1,
    isMobile: false,
  },
];

/** Minimum font-size px based on viewport class */
const minFontPx = (isMobile) => (isMobile ? 12 : 14);

/** CSS injected into the captured page to enforce minimum font sizes */
const buildFontCSS = (minPx) => `
p, span, a, li, button, td, th, label, input, select, textarea,
h1, h2, h3, h4, h5, h6, small, caption, figcaption, cite, abbr,
blockquote, q, code, pre, kbd, samp, var, del, ins, mark, sub, sup,
div, section, article, aside, header, footer, nav, main {
  font-size: ${minPx}px !important;
  line-height: 1.5 !important;
}
`.trim();

/** CSS to hide common cookie / consent banners */
const COOKIE_BLOCK_CSS = `
[class*="cookie" i], [id*="cookie" i],
[class*="consent" i], [id*="consent" i],
[class*="gdpr" i], [id*="gdpr" i],
[class*="privacy-banner" i],
#onetrust-consent-sdk, #cookie-law-info-bar,
.cc-window, .cookie-banner, .consent-banner,
.cookie-notice, .cookie-policy-banner,
[data-testid*="cookie"], [aria-label*="cookie" i] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
`.trim();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProto).href;
  } catch {
    return "";
  }
}

function fmtBytes(b) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(2)} MB`;
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FullPageScreenshot() {
  // ── Input / config state ──────────────────────────────────────────────────
  const [url, setUrl] = useState("");
  const [preset, setPreset] = useState("desktop");
  const [customW, setCustomW] = useState(1280);
  const [customH, setCustomH] = useState(800);

  // ── Advanced options ─────────────────────────────────────────────────────
  const [showAdv, setShowAdv] = useState(false);
  const [enforceFont, setEnforceFont] = useState(true);
  const [blockCookies, setBlockCookies] = useState(true);
  const [fullPage, setFullPage] = useState(true);
  const [scheme, setScheme] = useState("light"); // "light" | "dark"
  const [delayS, setDelayS] = useState(2);
  const [customCSS, setCustomCSS] = useState("");
  const [imgQuality, setImgQuality] = useState(92);

  // ── Capture state ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState("");
  const [progress, setProgress] = useState(0); // 0-100
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  // ── Result state ──────────────────────────────────────────────────────────
  const [imgBlobUrl, setImgBlobUrl] = useState(null);
  const [imgEl, setImgEl] = useState(null);
  const [meta, setMeta] = useState(null);

  // ── Viewer / tool state ───────────────────────────────────────────────────
  const [zoom, setZoom] = useState("fit"); // "fit" | number (%)
  const [colorMode, setColorMode] = useState(false);
  const [pickedColor, setPickedColor] = useState(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropBox, setCropBox] = useState(null);
  const [dragging, setDragging] = useState(false);

  // ── History ───────────────────────────────────────────────────────────────
  const [history, setHistory] = useState([]);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // ── Derived preset values ─────────────────────────────────────────────────
  const activePreset = DEVICE_PRESETS.find((p) => p.id === preset);
  const vpW = preset === "custom" ? customW : activePreset.width;
  const vpH = preset === "custom" ? customH : activePreset.height;
  const isMobile = preset === "custom" ? vpW < 768 : activePreset.isMobile;
  const minFontSize = minFontPx(isMobile);

  // Sync custom dimensions when preset changes
  useEffect(() => {
    if (preset !== "custom") {
      const p = DEVICE_PRESETS.find((d) => d.id === preset);
      setCustomW(p.width);
      setCustomH(p.height);
    }
  }, [preset]);

  // Progress bar animation during loading
  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(v + Math.random() * 4, 88);
      setProgress(v);
    }, 400);
    return () => clearInterval(id);
  }, [loading]);

  // Elapsed timer
  useEffect(() => {
    if (!loading) { setElapsed(0); return; }
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(((Date.now() - t0) / 1000).toFixed(1)), 200);
    return () => clearInterval(id);
  }, [loading]);

  // ─── Canvas helper ──────────────────────────────────────────────────────
  const drawToCanvas = useCallback(() => {
    if (!imgEl || !canvasRef.current) return null;
    const c = canvasRef.current;
    c.width = imgEl.naturalWidth;
    c.height = imgEl.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(imgEl, 0, 0);
    return ctx;
  }, [imgEl]);

  // ─── Capture ───────────────────────────────────────────────────────────
  const handleCapture = async (e) => {
    e?.preventDefault();
    const cleanUrl = normalizeUrl(url);
    if (!cleanUrl) {
      setError("Please enter a valid URL, e.g. example.com");
      return;
    }

    // Cancel previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError("");
    setImgBlobUrl(null);
    setImgEl(null);
    setMeta(null);
    setPickedColor(null);
    setCropBox(null);
    setCropMode(false);
    setColorMode(false);
    setLoading(true);

    const t0 = Date.now();

    try {
      // ── Build CSS injection ─────────────────────────────────────────────
      let css = "";
      if (blockCookies) css += COOKIE_BLOCK_CSS + "\n";
      if (enforceFont) css += buildFontCSS(minFontSize) + "\n";
      if (customCSS.trim()) css += customCSS.trim();

      // ── Build API params ────────────────────────────────────────────────
      const params = new URLSearchParams();
      params.set("url", cleanUrl);
      params.set("screenshot", "true");
      params.set("screenshot.type", "png");
      params.set("viewport.width", String(vpW));
      // For full-page capture we pass a large viewport height so Microlink
      // renders beyond the fold, then screenshot.fullPage stitches the rest.
      params.set("viewport.height", fullPage ? "768" : String(vpH));
      params.set("viewport.deviceScaleFactor", String(activePreset?.dpr ?? 1));
      params.set("viewport.isMobile", String(isMobile));
      if (fullPage) {
        params.set("screenshot.fullPage", "true");
        params.set("screenshot.scrollPage", "true"); // Microlink alternative full-page trigger
      }
      if (scheme !== "light") params.set("colorScheme", scheme);
      // waitUntil=networkidle2 ensures lazy-loaded images are rendered
      params.set("waitUntil", "networkidle2");
      if (delayS > 0) params.set("waitForTimeout", String(delayS * 1000));
      if (blockCookies) params.set("adblock", "true");
      if (css.trim()) params.set("styles", css.trim());

      setLoadStep("Launching headless Chromium engine…");
      await new Promise((r) => setTimeout(r, 300));

      setLoadStep(`Emulating ${vpW}×${vpH}px ${isMobile ? "mobile" : "desktop"} viewport…`);
      await new Promise((r) => setTimeout(r, 300));

      if (enforceFont) {
        setLoadStep(`Applying ${minFontSize}px minimum font enforcement…`);
        await new Promise((r) => setTimeout(r, 300));
      }

      setLoadStep("Rendering page with Headless Chrome…");

      const apiRes = await fetch(`/api/screenshot?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!apiRes.ok) {
        let msg = `Server error ${apiRes.status}`;
        try { const j = await apiRes.json(); msg = j.error ?? msg; } catch {}
        throw new Error(msg);
      }

      const apiJson = await apiRes.json();

      if (apiJson.status !== "success" || !apiJson.data?.screenshot?.url) {
        const hint = apiJson.data?.message ?? apiJson.error ?? "Unknown render failure";
        throw new Error(`Render failed: ${hint}`);
      }

      const cdnUrl = apiJson.data.screenshot.url;
      setLoadStep("Downloading rendered image via secure proxy…");
      setProgress(90);

      // Fetch the image through our server proxy so the canvas is never tainted
      const imgRes = await fetch(
        `/api/screenshot?image_url=${encodeURIComponent(cdnUrl)}`,
        { signal: controller.signal }
      );
      if (!imgRes.ok) throw new Error("Failed to download the screenshot image.");

      const blob = await imgRes.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Load into an Image element for canvas operations
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = blobUrl;
      await new Promise((res, rej) => {
        image.onload = res;
        image.onerror = () => rej(new Error("Image element failed to load."));
      });

      const domain = new URL(cleanUrl).hostname;
      const captureMeta = {
        domain,
        url: cleanUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,
        sizeBytes: blob.size,
        timeMs: Date.now() - t0,
        preset,
        isMobile,
        minFont: enforceFont ? minFontSize : null,
        scheme,
        fullPage,
      };

      setImgBlobUrl(blobUrl);
      setImgEl(image);
      setMeta(captureMeta);
      setProgress(100);
      setZoom("fit");

      // Persist to session history
      setHistory((prev) => [
        { id: Date.now(), blobUrl, image, meta: captureMeta },
        ...prev,
      ].slice(0, 8));

      toast.success(`Screenshot captured — ${image.naturalWidth}×${image.naturalHeight}px`);
    } catch (err) {
      if (err.name === "AbortError") return; // user cancelled
      console.error("[capture]", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setLoading(false);
    setError("");
  };

  // ─── Reset ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    abortRef.current?.abort();
    setUrl("");
    setPreset("desktop");
    setCustomW(1280);
    setCustomH(800);
    setEnforceFont(true);
    setBlockCookies(true);
    setFullPage(true);
    setScheme("light");
    setDelayS(2);
    setCustomCSS("");
    setImgQuality(92);
    setImgBlobUrl(null);
    setImgEl(null);
    setMeta(null);
    setError("");
    setPickedColor(null);
    setCropBox(null);
    setCropMode(false);
    setColorMode(false);
    setLoading(false);
  };

  // ─── Downloads ─────────────────────────────────────────────────────────
  const download = (dataUrl, name) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name;
    a.click();
  };

  const handleDownload = (fmt) => {
    if (!imgEl) return;
    const ctx = drawToCanvas();
    if (!ctx) return;
    const c = canvasRef.current;
    const domain = meta?.domain ?? "screenshot";
    const q = imgQuality / 100;
    const fname = `toolstrek-${domain}`;

    if (fmt === "png") {
      download(c.toDataURL("image/png"), `${fname}.png`);
    } else if (fmt === "jpg") {
      download(c.toDataURL("image/jpeg", q), `${fname}.jpg`);
    } else if (fmt === "webp") {
      download(c.toDataURL("image/webp", q), `${fname}.webp`);
    } else if (fmt === "pdf") {
      const ow = imgEl.naturalWidth;
      const oh = imgEl.naturalHeight;
      const pdf = new jsPDF({ orientation: ow > oh ? "l" : "p", unit: "px", format: [ow, oh] });
      pdf.addImage(c.toDataURL("image/png"), "PNG", 0, 0, ow, oh);
      pdf.save(`${fname}.pdf`);
    }
    toast.success(`Downloaded as ${fmt.toUpperCase()}`);
  };

  // ─── Color Picker ──────────────────────────────────────────────────────
  const handleImageClick = (e) => {
    if (!colorMode || !imgEl || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const sx = imgEl.naturalWidth / rect.width;
    const sy = imgEl.naturalHeight / rect.height;
    const ctx = drawToCanvas();
    if (!ctx) return;
    try {
      const px = ctx.getImageData(Math.floor(cx * sx), Math.floor(cy * sy), 1, 1).data;
      const hex = rgbToHex(px[0], px[1], px[2]);
      setPickedColor({ hex, rgb: `rgb(${px[0]}, ${px[1]}, ${px[2]})` });
      navigator.clipboard.writeText(hex).then(() => toast.success(`Copied ${hex}`));
    } catch {
      toast.error("Could not read pixel — canvas may be restricted.");
    }
  };

  // ─── Cropper ───────────────────────────────────────────────────────────
  const getImgRelativePos = (e) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const r = imgRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - r.left, r.width)),
      y: Math.max(0, Math.min(e.clientY - r.top, r.height)),
    };
  };

  const onCropDown = (e) => {
    if (!cropMode || !imgEl) return;
    e.preventDefault();
    const pos = getImgRelativePos(e);
    setCropStart(pos);
    setCropBox(null);
    setDragging(true);
  };

  const onCropMove = (e) => {
    if (!dragging || !cropMode) return;
    const pos = getImgRelativePos(e);
    const x = Math.min(pos.x, cropStart.x);
    const y = Math.min(pos.y, cropStart.y);
    const w = Math.abs(pos.x - cropStart.x);
    const h = Math.abs(pos.y - cropStart.y);
    setCropBox({ x, y, w, h });
  };

  const onCropUp = () => setDragging(false);

  const executeCrop = () => {
    if (!cropBox || cropBox.w < 4 || cropBox.h < 4 || !imgEl || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const sx = imgEl.naturalWidth / rect.width;
    const sy = imgEl.naturalHeight / rect.height;
    const srcX = Math.floor(cropBox.x * sx);
    const srcY = Math.floor(cropBox.y * sy);
    const srcW = Math.floor(cropBox.w * sx);
    const srcH = Math.floor(cropBox.h * sy);
    const cv = document.createElement("canvas");
    cv.width = srcW; cv.height = srcH;
    cv.getContext("2d").drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    download(cv.toDataURL("image/png"), `toolstrek-crop-${meta?.domain ?? "img"}.png`);
    setCropMode(false);
    setCropBox(null);
    toast.success("Cropped region downloaded!");
  };

  // ─── Zoom helpers ───────────────────────────────────────────────────────
  const zoomStyle =
    zoom === "fit"
      ? { maxWidth: "100%", height: "auto" }
      : { width: `${zoom}%`, maxWidth: "none", height: "auto" };

  const bumpZoom = (dir) => {
    const steps = ["fit", 50, 75, 100, 125, 150, 200];
    const cur = zoom === "fit" ? 0 : steps.indexOf(zoom);
    const next = Math.min(Math.max(cur + dir, 0), steps.length - 1);
    setZoom(steps[next]);
  };

  // ─── Cursor for image ───────────────────────────────────────────────────
  const imgCursor = colorMode ? "crosshair" : cropMode ? "crosshair" : "default";

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ToolPageShell widthClassName="max-w-7xl pt-24 pb-14">
      <div className="flex flex-col gap-6">

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-brandColor/20 bg-gradient-to-br from-brandColor/5 via-transparent to-purple-500/5 dark:from-brandColor/10 dark:to-purple-500/10 p-6 md:p-8">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brandColor/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brandColor/10 text-brandColor shadow-lg shadow-brandColor/20 dark:bg-brandColor/20">
                <Camera size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white md:text-3xl">
                  Full Page <span className="text-brandColor">Screenshot</span>
                </h1>
                <p className="mt-0.5 max-w-lg text-sm text-gray-500 dark:text-gray-400">
                  Capture any website at pixel-perfect resolution. Enforce font guidelines, block cookie banners, and export as PNG, JPG, WebP, or PDF.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <BadgeCheck size={12} /> Free · No Login
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brandColor/20 bg-brandColor/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brandColor">
                <Shield size={12} /> Headless Chrome
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* ─ LEFT PANEL (Controls) ───────────────────────────────────── */}
          <div className="flex flex-col gap-5 lg:col-span-5">

            {/* URL Input Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-gray-400">
                Target Website
              </p>
              <form onSubmit={handleCapture} className="flex flex-col gap-3">
                <div className="relative">
                  <Globe
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="screenshot-url-input"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCapture()}
                    placeholder="e.g. github.com or https://..."
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-3 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-brandColor focus:ring-2 focus:ring-brandColor/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !url.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brandColor py-2.5 text-sm font-bold text-white shadow-md shadow-brandColor/30 transition hover:bg-brandColorHover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Camera size={15} />
                    )}
                    {loading ? "Capturing…" : "Capture Screenshot"}
                  </button>
                  {loading && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <X size={13} /> Cancel
                    </button>
                  )}
                  {imgBlobUrl && !loading && (
                    <button
                      type="button"
                      onClick={handleReset}
                      title="Reset everything"
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <RotateCcw size={13} /> Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Viewport Presets Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Viewport Preset
                </p>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {vpW} × {vpH} px
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {DEVICE_PRESETS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreset(p.id)}
                      disabled={loading}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border py-2.5 text-[11px] font-bold transition ${
                        preset === p.id
                          ? "border-brandColor bg-brandColor/10 text-brandColor dark:bg-brandColor/20"
                          : "border-gray-200 bg-gray-50/50 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/30 dark:text-gray-400 dark:hover:bg-gray-800/70"
                      }`}
                    >
                      <Icon size={15} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
              {preset === "custom" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[["Width (px)", customW, setCustomW], ["Height (px)", customH, setCustomH]].map(
                    ([lbl, val, setter]) => (
                      <label key={lbl} className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-gray-400">{lbl}</span>
                        <input
                          type="number"
                          min={200}
                          max={3840}
                          value={val}
                          onChange={(e) => setter(Number(e.target.value) || 1280)}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs font-bold text-gray-800 outline-none focus:border-brandColor dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </label>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => setShowAdv((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
                  <Sliders size={15} className="text-brandColor" />
                  Advanced Options
                </span>
                {showAdv ? (
                  <ChevronUp size={15} className="text-gray-400" />
                ) : (
                  <ChevronDown size={15} className="text-gray-400" />
                )}
              </button>

              {showAdv && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-gray-800">
                  <div className="flex flex-col gap-4">

                    {/* Font Enforcer */}
                    <div className="flex items-start justify-between gap-3 rounded-xl border border-brandColor/15 bg-brandColor/5 p-3.5 dark:bg-brandColor/10">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-100">
                          <Wand2 size={13} className="text-brandColor" />
                          Enforce Minimum Font Size
                        </p>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                          Upscales fonts below <strong>{minFontSize}px</strong> on this{" "}
                          {isMobile ? "mobile" : "desktop"} viewport (WCAG 1.4.4).
                        </p>
                      </div>
                      <Toggle checked={enforceFont} onChange={setEnforceFont} />
                    </div>

                    {/* Cookie Blocker */}
                    <ToggleRow
                      label="Block Cookie Banners"
                      sub="Hides GDPR / consent overlays before capture."
                      checked={blockCookies}
                      onChange={setBlockCookies}
                    />

                    {/* Full page */}
                    <ToggleRow
                      label="Full-Page Capture"
                      sub="Captures the entire scrollable document, not just the visible viewport."
                      checked={fullPage}
                      onChange={setFullPage}
                    />

                    {/* Color scheme */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Prefer Color Scheme
                      </label>
                      <select
                        value={scheme}
                        onChange={(e) => setScheme(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs font-bold text-gray-800 outline-none focus:border-brandColor dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="light">Light (default)</option>
                        <option value="dark">Dark Mode</option>
                      </select>
                    </div>

                    {/* Render delay */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Render Delay
                        </label>
                        <span className="text-[10px] font-bold text-brandColor">{delayS}s</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={delayS}
                        onChange={(e) => setDelayS(Number(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brandColor dark:bg-gray-700"
                      />
                      <p className="text-[9px] text-gray-400">Wait for lazy-loaded images and animations.</p>
                    </div>

                    {/* Custom CSS */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Custom CSS Injection
                      </label>
                      <textarea
                        rows={3}
                        value={customCSS}
                        onChange={(e) => setCustomCSS(e.target.value)}
                        placeholder=".ads { display: none !important; }"
                        className="rounded-lg border border-gray-200 bg-gray-50 p-2 font-mono text-[11px] text-gray-800 outline-none placeholder-gray-300 focus:border-brandColor focus:ring-1 focus:ring-brandColor/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export Card — only when result exists */}
            {imgBlobUrl && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Export
                </p>

                {/* Quality slider (for JPG / WebP) */}
                <div className="mb-3 flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      JPG / WebP Quality
                    </label>
                    <span className="text-[10px] font-bold text-brandColor">{imgQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={2}
                    value={imgQuality}
                    onChange={(e) => setImgQuality(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brandColor dark:bg-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { fmt: "png", label: "Download PNG", color: "text-blue-500", icon: ImageIcon },
                    { fmt: "jpg", label: "Download JPG", color: "text-amber-500", icon: FileImage },
                    { fmt: "webp", label: "Download WebP", color: "text-teal-500", icon: ImageIcon },
                    { fmt: "pdf", label: "Download PDF", color: "text-red-500", icon: FileText },
                  ].map(({ fmt, label, color, icon: Icon }) => (
                    <button
                      key={fmt}
                      onClick={() => handleDownload(fmt)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-white hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <Icon size={13} className={color} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata / SEO advisor — only when result exists */}
            {meta && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-3 flex items-center gap-1.5">
                  <Info size={14} className="text-brandColor" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                    Capture Info & Advisor
                  </p>
                </div>

                {/* Stat grid */}
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {[
                    ["Resolution", `${meta.width} × ${meta.height}`],
                    ["File Size", fmtBytes(meta.sizeBytes)],
                    ["Render Time", `${(meta.timeMs / 1000).toFixed(2)}s`],
                    ["Viewport", `${vpW} × ${vpH}`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-gray-100 bg-gray-50/60 p-2.5 dark:border-gray-800 dark:bg-gray-800/30">
                      <p className="text-[9px] font-black uppercase text-gray-400">{k}</p>
                      <p className="mt-0.5 text-xs font-bold text-gray-800 dark:text-gray-100">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Font advice */}
                {meta.minFont ? (
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                    <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        Font Guideline Enforced
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Fonts upscaled to min {meta.minFont}px — WCAG 1.4.4 compliant.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-500" />
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                      Font enforcement is off. Enable it in Advanced Options to meet WCAG 1.4.4.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─ RIGHT PANEL (Preview) ─────────────────────────────────── */}
          <div className="flex flex-col gap-5 lg:col-span-7">
            {/* Browser Frame */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">

              {/* Browser chrome bar */}
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/60">
                <div className="flex items-center gap-1.5">
                  {["bg-red-400", "bg-yellow-400", "bg-emerald-400"].map((c) => (
                    <div key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
                  ))}
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <div className="max-w-xs truncate rounded-md border border-gray-200 bg-white px-3 py-1 text-center font-mono text-[11px] text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    {meta ? meta.url : url ? normalizeUrl(url) || "about:blank" : "about:blank"}
                  </div>
                </div>
                <div className="shrink-0 rounded-md bg-gray-200 px-2 py-0.5 font-mono text-[10px] font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {meta ? `${meta.width}×${meta.height}` : `${vpW}×${vpH}`}
                </div>
              </div>

              {/* Progress bar */}
              {loading && (
                <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full bg-brandColor transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Viewport area — scrollable so full-page captures are visible */}
              <div
                ref={containerRef}
                className="relative flex min-h-[460px] max-h-[78vh] flex-col items-center justify-start overflow-auto bg-[#f0f2f5] p-4 dark:bg-[#111]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              >
                {/* Loading state */}
                {loading && (
                  <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/60 bg-white/80 px-10 py-8 text-center shadow-2xl backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/80">
                    <div className="relative">
                      <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-brandColor dark:border-gray-700" />
                      <Camera className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brandColor" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                        Processing…
                      </p>
                      <p className="mt-0.5 max-w-[200px] text-[11px] text-gray-500 dark:text-gray-400">
                        {loadStep}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
                      <Clock size={11} className="text-gray-400" />
                      <span className="font-mono text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        {elapsed}s elapsed
                      </span>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!loading && !imgBlobUrl && (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-5 text-gray-300 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-700">
                      <ScanLine size={44} strokeWidth={1.2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
                        No Capture Yet
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">
                        Enter a URL and click Capture Screenshot
                      </p>
                    </div>
                  </div>
                )}

                {/* Screenshot result */}
                {!loading && imgBlobUrl && (
                  <div
                    className="relative select-none overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700"
                    onMouseDown={onCropDown}
                    onMouseMove={onCropMove}
                    onMouseUp={onCropUp}
                    onMouseLeave={onCropUp}
                  >
                    <img
                      ref={imgRef}
                      src={imgBlobUrl}
                      alt="Website Screenshot"
                      style={{ ...zoomStyle, cursor: imgCursor, display: "block" }}
                      onClick={handleImageClick}
                      draggable={false}
                    />

                    {/* Color picker tooltip */}
                    {colorMode && pickedColor && (
                      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-white/40 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm dark:bg-gray-900/90">
                        <div
                          className="h-5 w-5 rounded-md border border-gray-200 shadow"
                          style={{ background: pickedColor.hex }}
                        />
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-400">Sampled</p>
                          <p className="font-mono text-xs font-bold text-gray-800 dark:text-gray-100">
                            {pickedColor.hex}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Crop selection box */}
                    {cropMode && cropBox && cropBox.w > 2 && (
                      <>
                        {/* Overlay darken */}
                        <div className="pointer-events-none absolute inset-0 bg-black/40" />
                        {/* Selection cutout */}
                        <div
                          className="absolute border-2 border-brandColor bg-transparent ring-2 ring-white/30 pointer-events-none"
                          style={{
                            left: cropBox.x,
                            top: cropBox.y,
                            width: cropBox.w,
                            height: cropBox.h,
                            boxShadow: `0 0 0 9999px rgba(0,0,0,0.45)`,
                          }}
                        />
                        {!dragging && (
                          <div
                            className="absolute flex gap-1.5 pointer-events-auto"
                            style={{ left: cropBox.x, top: cropBox.y + cropBox.h + 6 }}
                          >
                            <button
                              onClick={executeCrop}
                              className="flex items-center gap-1 rounded-lg bg-brandColor px-2.5 py-1 text-[10px] font-bold text-white shadow-lg"
                            >
                              <Download size={10} /> Save Crop
                            </button>
                            <button
                              onClick={() => { setCropMode(false); setCropBox(null); }}
                              className="rounded-lg bg-gray-800 px-2 py-1 text-[10px] font-bold text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Toolbar — visible only when screenshot exists */}
              {imgBlobUrl && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-800/40">
                  {/* Tools */}
                  <div className="flex items-center gap-1">
                    <ToolBtn
                      active={colorMode}
                      onClick={() => { setColorMode((v) => !v); setCropMode(false); }}
                      title="Color Picker — click any pixel"
                      icon={<Pipette size={13} />}
                      label="Pick Color"
                    />
                    <ToolBtn
                      active={cropMode}
                      onClick={() => { setCropMode((v) => !v); setColorMode(false); setCropBox(null); }}
                      title="Crop Tool — drag to select region"
                      icon={<Crop size={13} />}
                      label="Crop"
                    />
                    {pickedColor && colorMode && (
                      <div className="ml-1 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 dark:border-gray-700 dark:bg-gray-800">
                        <div
                          className="h-3.5 w-3.5 rounded border border-gray-200"
                          style={{ background: pickedColor.hex }}
                        />
                        <span className="font-mono text-[11px] font-bold text-gray-700 dark:text-gray-200">
                          {pickedColor.hex}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pickedColor.hex);
                            toast.success("Copied!");
                          }}
                          className="text-gray-400 hover:text-brandColor"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => bumpZoom(-1)}
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400"
                    >
                      <ZoomOut size={13} />
                    </button>
                    <select
                      value={zoom}
                      onChange={(e) => setZoom(e.target.value === "fit" ? "fit" : Number(e.target.value))}
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700 outline-none focus:border-brandColor dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value="fit">Fit</option>
                      {[50, 75, 100, 125, 150, 200].map((v) => (
                        <option key={v} value={v}>{v}%</option>
                      ))}
                    </select>
                    <button
                      onClick={() => bumpZoom(1)}
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400"
                    >
                      <ZoomIn size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Session History */}
            {history.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <History size={14} className="text-brandColor" />
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      Session History ({history.length})
                    </p>
                  </div>
                  <button
                    onClick={() => setHistory([])}
                    className="flex items-center gap-1 text-[11px] font-bold text-red-400 transition hover:text-red-600"
                  >
                    <Trash2 size={11} /> Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setImgBlobUrl(item.blobUrl);
                        setImgEl(item.image);
                        setMeta(item.meta);
                        setUrl(item.meta.url);
                        setZoom("fit");
                        setPickedColor(null);
                        setCropBox(null);
                      }}
                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition hover:border-brandColor/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/40"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={item.blobUrl}
                          alt={item.meta.domain}
                          className="h-full w-full object-cover object-top transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2">
                        <p className="truncate text-[10px] font-bold text-gray-700 dark:text-gray-200">
                          {item.meta.domain}
                        </p>
                        <p className="text-[9px] text-gray-400">
                          {item.meta.width}×{item.meta.height}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistory((prev) => prev.filter((h) => h.id !== item.id));
                        }}
                        className="absolute right-1.5 top-1.5 rounded-md bg-white/80 p-1 opacity-0 shadow transition group-hover:opacity-100 dark:bg-gray-900/80"
                      >
                        <X size={10} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </ToolPageShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${
        checked ? "bg-brandColor" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{label}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ToolBtn({ active, onClick, title, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
        active
          ? "border-brandColor bg-brandColor/10 text-brandColor dark:bg-brandColor/20"
          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
