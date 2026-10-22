"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ToolPageShell from "../../ToolPageShell";
import { useRecentTools } from "@/hooks/useRecentTools";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Crop,
  Download,
  FileImage,
  FileText,
  Info,
  Loader2,
  Maximize2,
  Move,
  RefreshCw,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import {
  BACKGROUNDS,
  DEFAULT_SETTINGS,
  FIELD_BASE,
  PASSPORT_FAQS,
  PHOTO_PRESETS,
  PRINT_SHEETS,
  analyzeRgba,
  clamp,
  computeCropRect,
  evaluateReadiness,
  getBackground,
  getEffectiveDpi,
  getFileError,
  getOutputPixels,
  getSheet,
  getSheetLayout,
  mmToPixels,
  resolvePreset,
  toNumber,
} from "./passportPhotoData";

const QUICK_PRESETS = [
  "us-passport",
  "uk-passport",
  "schengen",
  "india-passport",
];

const EMPTY_ANALYSIS = {
  brightness: 0,
  contrast: 0,
  backgroundUniformity: 0,
  backgroundTint: 0,
};

function fieldClass(invalid = false, extra = "") {
  return `${FIELD_BASE} ${
    invalid
      ? "border-rose-400 ring-1 ring-rose-300 dark:border-rose-700 dark:ring-rose-900/60"
      : "border-slate-200 dark:border-slate-700"
  } ${extra}`;
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div
        className="grid gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`rounded-lg px-2 py-2 text-[11px] font-bold transition sm:text-xs ${
              value === option.value
                ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
  hint,
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
          {label}
        </span>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-extrabold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          {value > 0 && min < 0 ? "+" : ""}
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-indigo-600"
      />
      {hint && (
        <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
      <div>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
          {label}
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function drawPhoto(canvas, image, preset, settings, widthPx, heightPx) {
  if (!canvas || !image) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = widthPx;
  canvas.height = heightPx;
  ctx.clearRect(0, 0, widthPx, heightPx);

  const background = getBackground(settings.backgroundId);
  if (background.color !== "transparent") {
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, widthPx, heightPx);
  }

  const crop = computeCropRect({
    sourceWidth: image.naturalWidth,
    sourceHeight: image.naturalHeight,
    targetWidthMm: preset.widthMm,
    targetHeightMm: preset.heightMm,
    zoom: settings.zoom,
    offsetX: settings.offsetX,
    offsetY: settings.offsetY,
  });
  if (!crop) return;

  ctx.save();
  ctx.filter = `brightness(${100 + settings.brightness}%) contrast(${100 + settings.contrast}%)`;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    widthPx,
    heightPx,
  );
  ctx.restore();
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not create the image file."));
      },
      type,
      quality,
    );
  });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeFileName(name) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 42) || "passport-photo"
  );
}

export default function PassportPhotoMaker() {
  const { addRecentTool } = useRecentTools();
  const [photo, setPhoto] = useState(null);
  const [presetId, setPresetId] = useState("us-passport");
  const [custom, setCustom] = useState({
    widthMm: 35,
    heightMm: 45,
    headMinPct: 60,
    headMaxPct: 75,
  });
  const [adjustments, setAdjustments] = useState({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [analysis, setAnalysis] = useState(EMPTY_ANALYSIS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exporting, setExporting] = useState("");
  const [loadError, setLoadError] = useState("");
  const fileInputRef = useRef(null);
  const changeInputRef = useRef(null);
  const canvasRef = useRef(null);
  const objectUrlRef = useRef("");
  const photoRef = useRef(null);

  useEffect(() => {
    addRecentTool({
      title: "Passport / ID Photo Maker",
      link: "/tools/passport-photo-maker",
      icon: "ScanFace",
    });
  }, [addRecentTool]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const preset = useMemo(
    () => resolvePreset(presetId, custom),
    [presetId, custom],
  );
  const sheet = useMemo(() => getSheet(settings.sheetId), [settings.sheetId]);
  const sheetDimensions = useMemo(() => {
    if (settings.sheetId !== "custom-sheet") {
      return { widthMm: sheet.widthMm, heightMm: sheet.heightMm };
    }
    return {
      widthMm: clamp(toNumber(settings.customSheetWidth, 200), 50, 500),
      heightMm: clamp(toNumber(settings.customSheetHeight, 250), 50, 500),
    };
  }, [
    settings.sheetId,
    settings.customSheetWidth,
    settings.customSheetHeight,
    sheet,
  ]);

  const output = useMemo(
    () =>
      getOutputPixels({
        widthMm: preset.widthMm,
        heightMm: preset.heightMm,
        dpi: settings.dpi,
      }),
    [preset.widthMm, preset.heightMm, settings.dpi],
  );

  const effectiveDpi = useMemo(() => {
    if (!photo) return 0;
    return getEffectiveDpi({
      sourceWidth: photo.width,
      sourceHeight: photo.height,
      widthMm: preset.widthMm,
      heightMm: preset.heightMm,
      zoom: adjustments.zoom,
    });
  }, [photo, preset.widthMm, preset.heightMm, adjustments.zoom]);

  const readiness = useMemo(
    () =>
      evaluateReadiness({
        image: photo,
        preset,
        zoom: adjustments.zoom,
        offsetX: adjustments.offsetX,
        offsetY: adjustments.offsetY,
        analysis,
        dpi: settings.dpi,
      }),
    [photo, preset, adjustments, analysis, settings.dpi],
  );

  const layout = useMemo(
    () =>
      getSheetLayout({
        sheetWidthMm: sheetDimensions.widthMm,
        sheetHeightMm: sheetDimensions.heightMm,
        photoWidthMm: preset.widthMm,
        photoHeightMm: preset.heightMm,
        marginMm: settings.marginMm,
        gapMm: settings.gapMm,
        requestedCopies: settings.copies,
      }),
    [
      sheetDimensions,
      preset.widthMm,
      preset.heightMm,
      settings.marginMm,
      settings.gapMm,
      settings.copies,
    ],
  );

  // Draw the live preview and measure the visible crop's edges.
  useEffect(() => {
    if (!photo || !canvasRef.current) return undefined;
    const crop = computeCropRect({
      sourceWidth: photo.width,
      sourceHeight: photo.height,
      targetWidthMm: preset.widthMm,
      targetHeightMm: preset.heightMm,
      zoom: adjustments.zoom,
      offsetX: adjustments.offsetX,
      offsetY: adjustments.offsetY,
    });
    if (!crop) return undefined;

    const previewWidth = 900;
    const previewHeight = Math.max(
      1,
      Math.round(previewWidth / (preset.widthMm / preset.heightMm)),
    );
    drawPhoto(
      canvasRef.current,
      photoRef.current,
      preset,
      { ...settings, ...adjustments },
      previewWidth,
      previewHeight,
    );

    const sampleWidth = 220;
    const sampleHeight = Math.max(
      1,
      Math.round(sampleWidth / (preset.widthMm / preset.heightMm)),
    );
    const sample = document.createElement("canvas");
    sample.width = sampleWidth;
    sample.height = sampleHeight;
    const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
    if (!sampleCtx) return undefined;
    sampleCtx.drawImage(
      photoRef.current,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      sampleWidth,
      sampleHeight,
    );

    let nextAnalysis = EMPTY_ANALYSIS;
    try {
      const pixels = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight);
      nextAnalysis = analyzeRgba(pixels.data, sampleWidth, sampleHeight);
    } catch {
      nextAnalysis = EMPTY_ANALYSIS;
    }

    // Defer the state update so measuring pixels never blocks the canvas paint.
    const frame = requestAnimationFrame(() => setAnalysis(nextAnalysis));
    return () => cancelAnimationFrame(frame);
  }, [photo, preset, adjustments, settings]);

  const updateAdjustment = (patch) =>
    setAdjustments((current) => ({ ...current, ...patch }));
  const updateSettings = (patch) =>
    setSettings((current) => ({ ...current, ...patch }));

  const loadFile = useCallback((file) => {
    setLoadError("");
    const error = getFileError(file);
    if (error) {
      setLoadError(error);
      toast.error(error);
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth < 200 || image.naturalHeight < 200) {
        setLoadError(
          "That image is too small to make a print-quality document photo. Please use at least 600 × 600 pixels.",
        );
        toast.error("The image is too small for a print-quality photo.");
        URL.revokeObjectURL(url);
        objectUrlRef.current = "";
        return;
      }
      photoRef.current = image;
      setPhoto({
        name: file.name,
        width: image.naturalWidth,
        height: image.naturalHeight,
        url,
        bytes: file.size,
      });
      setAdjustments({ zoom: 1, offsetX: 0, offsetY: 0 });
      toast.success("Photo loaded. Align the head and eye guides.");
    };
    image.onerror = () => {
      setLoadError(
        "This image could not be decoded. Try a JPEG, PNG or WebP file.",
      );
      toast.error("The image could not be opened. Please try another file.");
      URL.revokeObjectURL(url);
      objectUrlRef.current = "";
    };
    image.src = url;
  }, []);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file) loadFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const removePhoto = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = "";
    photoRef.current = null;
    setPhoto(null);
    setAnalysis(EMPTY_ANALYSIS);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    toast.success("Photo removed.");
  };

  const resetAll = () => {
    removePhoto();
    setPresetId("us-passport");
    setCustom({ widthMm: 35, heightMm: 45, headMinPct: 60, headMaxPct: 75 });
    setAdjustments({ zoom: 1, offsetX: 0, offsetY: 0 });
    setSettings(DEFAULT_SETTINGS);
    setShowAdvanced(false);
    setOpenFaq(0);
    setLoadError("");
    toast.success("Photo studio reset to defaults.");
  };

  const buildSheetCanvas = () => {
    if (!photo) throw new Error("Add a photo first.");
    const pxPerMm = settings.dpi / 25.4;
    const canvas = document.createElement("canvas");
    canvas.width = mmToPixels(sheetDimensions.widthMm, settings.dpi);
    canvas.height = mmToPixels(sheetDimensions.heightMm, settings.dpi);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    layout.slots.forEach((slot) => {
      const x = Math.round(slot.x * pxPerMm);
      const y = Math.round(slot.y * pxPerMm);
      const width = mmToPixels(slot.width, settings.dpi);
      const height = mmToPixels(slot.height, settings.dpi);
      const photoCanvas = document.createElement("canvas");
      drawPhoto(
        photoCanvas,
        photoRef.current,
        preset,
        { ...settings, ...adjustments },
        width,
        height,
      );
      if (settings.backgroundId === "transparent") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, width, height);
      }
      ctx.drawImage(photoCanvas, x, y);

      if (settings.cutLines) {
        ctx.save();
        ctx.strokeStyle = "rgba(71, 85, 105, 0.55)";
        ctx.lineWidth = Math.max(1, Math.round(settings.dpi / 300));
        ctx.setLineDash([
          Math.round(settings.dpi / 75),
          Math.round(settings.dpi / 75),
        ]);
        ctx.strokeRect(x, y, width, height);
        ctx.restore();
      }
    });

    return canvas;
  };

  const handleDownloadPhoto = async () => {
    if (!photo) {
      toast.error("Add a photo before exporting.");
      return;
    }
    setExporting("photo");
    try {
      const canvas = document.createElement("canvas");
      drawPhoto(
        canvas,
        photoRef.current,
        preset,
        { ...settings, ...adjustments },
        output.width,
        output.height,
      );
      const base = `${safeFileName(photo.name.replace(/\.[^.]+$/, ""))}-${preset.id}-${preset.widthMm}x${preset.heightMm}mm`;

      if (settings.format === "pdf") {
        const pdf = new jsPDF({
          orientation:
            preset.widthMm > preset.heightMm ? "landscape" : "portrait",
          unit: "mm",
          format: [preset.widthMm, preset.heightMm],
          compress: true,
        });
        const dataUrl = canvas.toDataURL("image/jpeg", settings.quality);
        pdf.addImage(dataUrl, "JPEG", 0, 0, preset.widthMm, preset.heightMm);
        pdf.save(`${base}.pdf`);
      } else {
        const type = settings.format === "png" ? "image/png" : "image/jpeg";
        const blob = await canvasToBlob(canvas, type, settings.quality);
        downloadBlob(blob, `${base}.${settings.format}`);
      }
      toast.success("Document photo downloaded.");
    } catch (error) {
      console.error(error);
      toast.error(
        "The photo could not be exported. Try a smaller DPI or another format.",
      );
    } finally {
      setExporting("");
    }
  };

  const handleDownloadSheet = async () => {
    if (!photo) {
      toast.error("Add a photo before creating a print sheet.");
      return;
    }
    if (!layout.fits) {
      toast.error(
        "This photo is too large for the selected sheet. Choose a larger sheet or smaller margins.",
      );
      return;
    }
    if (layout.copies < 1) {
      toast.error(
        "No copies fit on this sheet with the current margin and gap.",
      );
      return;
    }

    setExporting("sheet");
    try {
      const canvas = buildSheetCanvas();
      const base = `${safeFileName(photo.name.replace(/\.[^.]+$/, ""))}-${preset.widthMm}x${preset.heightMm}mm-sheet`;

      if (settings.format === "pdf") {
        const pdf = new jsPDF({
          orientation:
            sheetDimensions.widthMm > sheetDimensions.heightMm
              ? "landscape"
              : "portrait",
          unit: "mm",
          format: [sheetDimensions.widthMm, sheetDimensions.heightMm],
          compress: true,
        });
        const dataUrl = canvas.toDataURL("image/jpeg", settings.quality);
        pdf.addImage(
          dataUrl,
          "JPEG",
          0,
          0,
          sheetDimensions.widthMm,
          sheetDimensions.heightMm,
        );
        pdf.save(`${base}.pdf`);
      } else {
        const type = settings.format === "png" ? "image/png" : "image/jpeg";
        const blob = await canvasToBlob(canvas, type, settings.quality);
        downloadBlob(blob, `${base}.${settings.format}`);
      }
      toast.success(
        `Print sheet with ${layout.copies} ${layout.copies === 1 ? "copy" : "copies"} downloaded.`,
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "The print sheet could not be created. Try a lower DPI or a smaller sheet.",
      );
    } finally {
      setExporting("");
    }
  };

  const scoreColor =
    readiness.tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : readiness.tone === "amber"
        ? "text-amber-600 dark:text-amber-400"
        : readiness.tone === "rose"
          ? "text-rose-600 dark:text-rose-400"
          : "text-slate-400";
  const ringColor =
    readiness.tone === "emerald"
      ? "stroke-emerald-500"
      : readiness.tone === "amber"
        ? "stroke-amber-500"
        : readiness.tone === "rose"
          ? "stroke-rose-500"
          : "stroke-slate-300";

  return (
    <ToolPageShell widthClassName="max-w-none">
      <div className="mx-auto w-full space-y-7 pb-12 lg:w-11/12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-6 text-white shadow-xl shadow-indigo-500/15 sm:p-9">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute right-12 top-10 hidden h-28 w-44 rounded-[2rem] border border-dashed border-white/20 sm:block" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-50 backdrop-blur-sm">
              <ScanFace className="h-3.5 w-3.5" aria-hidden="true" />
              Document photo studio
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Passport / ID Photo Maker
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-blue-50/90 sm:text-base">
              Turn a phone photo into a correctly sized passport, visa or ID
              picture. Choose a document preset, align the face guides, check
              the measurable print requirements, and export a single photo or a
              multi-copy print sheet — all privately in your browser.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "10 document presets",
                "Head & eye guides",
                "Readiness checks",
                "300 DPI exports",
                "Print sheets",
                "100% private",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-blue-50 backdrop-blur-sm"
                >
                  <CheckCircle2
                    className="h-3 w-3 text-cyan-200"
                    aria-hidden="true"
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Controls */}
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white sm:text-base">
                    Photo & document setup
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
                    Results and checks update live as you adjust the crop.
                  </p>
                </div>
              </div>

              {/* Upload / loaded photo */}
              <div className="mt-4">
                {!photo ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ")
                        fileInputRef.current?.click();
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-10 text-center transition ${
                      dragging
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                        : "border-slate-300 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
                    }`}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300">
                      <UploadCloud className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      Drop a portrait here, or click to browse
                    </p>
                    <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      JPEG, PNG or WebP · up to 25 MB · at least 600 × 600 px
                      recommended. The image is never uploaded.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-700">
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                      Choose a photo
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/20">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300">
                        <FileImage className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-slate-800 dark:text-slate-100">
                          {photo.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {photo.width} × {photo.height} px ·{" "}
                          {formatFileSize(photo.bytes)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => changeInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={removePhoto}
                        aria-label="Remove photo"
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-rose-300"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
                <input
                  ref={changeInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
                {loadError && (
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-300">
                    <AlertTriangle
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {loadError}
                  </p>
                )}
              </div>

              {/* Presets */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Document format
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-300">
                    {preset.widthMm} × {preset.heightMm} mm
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {QUICK_PRESETS.map((id) => {
                    const item = PHOTO_PRESETS.find((entry) => entry.id === id);
                    const active = presetId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPresetId(id)}
                        className={`rounded-xl border px-2.5 py-2 text-left transition ${
                          active
                            ? "border-indigo-500 bg-indigo-50 text-indigo-800 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                            : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:border-indigo-800"
                        }`}
                        aria-pressed={active}
                      >
                        <span className="block text-[11px] font-extrabold">
                          {item.label}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                          {item.widthMm} × {item.heightMm} mm
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      More document formats
                    </span>
                    <select
                      value={presetId}
                      onChange={(event) => setPresetId(event.target.value)}
                      className={fieldClass()}
                    >
                      {PHOTO_PRESETS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label} — {item.widthMm} × {item.heightMm} mm
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      {preset.region}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                      {preset.note}
                    </p>
                  </div>
                </div>

                {presetId === "custom" && (
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30 sm:grid-cols-4">
                    {[
                      ["widthMm", "Width (mm)", 20, 100],
                      ["heightMm", "Height (mm)", 20, 120],
                      ["headMinPct", "Min head %", 30, 90],
                      ["headMaxPct", "Max head %", 35, 95],
                    ].map(([key, label, min, max]) => (
                      <label key={key} className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {label}
                        </span>
                        <input
                          type="number"
                          min={min}
                          max={max}
                          value={custom[key]}
                          onChange={(event) =>
                            setCustom((current) => ({
                              ...current,
                              [key]: event.target.value,
                            }))
                          }
                          className={fieldClass()}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Framing */}
              <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Crop
                      className="h-4 w-4 text-indigo-500"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      Crop & framing
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateAdjustment({ zoom: 1, offsetX: 0, offsetY: 0 })
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-indigo-300"
                  >
                    <Move className="h-3 w-3" aria-hidden="true" />
                    Centre photo
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <RangeControl
                    label="Zoom"
                    value={Number(adjustments.zoom.toFixed(2))}
                    min={1}
                    max={2.5}
                    step={0.05}
                    suffix="×"
                    onChange={(value) => updateAdjustment({ zoom: value })}
                    hint="Zoom in to make the head larger inside the frame. Watch the print-resolution check."
                  />
                  <RangeControl
                    label="Horizontal framing"
                    value={adjustments.offsetX}
                    min={-100}
                    max={100}
                    step={1}
                    suffix="%"
                    onChange={(value) => updateAdjustment({ offsetX: value })}
                    hint="Move the crop window left or right to centre the face."
                  />
                  <RangeControl
                    label="Vertical framing"
                    value={adjustments.offsetY}
                    min={-100}
                    max={100}
                    step={1}
                    suffix="%"
                    onChange={(value) => updateAdjustment({ offsetY: value })}
                    hint="Leave a little space above the head and keep the shoulders visible."
                  />
                </div>
              </div>

              {/* Advanced */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((current) => !current)}
                  aria-expanded={showAdvanced}
                  className="flex w-full items-center justify-between gap-2 bg-slate-50/80 px-4 py-3 text-left transition hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                >
                  <span className="flex items-center gap-2 text-[13px] font-extrabold text-slate-800 dark:text-slate-100 sm:text-sm">
                    <Sparkles
                      className="h-4 w-4 text-indigo-500"
                      aria-hidden="true"
                    />
                    Advanced photo options
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {showAdvanced && (
                  <div className="space-y-5 border-t border-slate-200 p-4 dark:border-slate-800">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Segmented
                        label="Output DPI"
                        value={String(settings.dpi)}
                        options={[
                          { value: "200", label: "200" },
                          { value: "300", label: "300" },
                          { value: "600", label: "600" },
                        ]}
                        onChange={(value) =>
                          updateSettings({ dpi: Number(value) })
                        }
                      />
                      <Segmented
                        label="File format"
                        value={settings.format}
                        options={[
                          { value: "jpeg", label: "JPEG" },
                          { value: "png", label: "PNG" },
                          { value: "pdf", label: "PDF" },
                        ]}
                        onChange={(value) => updateSettings({ format: value })}
                      />
                    </div>

                    {settings.format === "jpeg" && (
                      <RangeControl
                        label="JPEG quality"
                        value={Math.round(settings.quality * 100)}
                        min={60}
                        max={100}
                        step={1}
                        suffix="%"
                        onChange={(value) =>
                          updateSettings({ quality: value / 100 })
                        }
                        hint="Higher quality keeps more detail but increases the file size."
                      />
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <RangeControl
                        label="Brightness"
                        value={settings.brightness}
                        min={-35}
                        max={35}
                        step={1}
                        suffix="%"
                        onChange={(value) =>
                          updateSettings({ brightness: value })
                        }
                        hint="Small corrections only. The passport office expects natural skin tones."
                      />
                      <RangeControl
                        label="Contrast"
                        value={settings.contrast}
                        min={-25}
                        max={25}
                        step={1}
                        suffix="%"
                        onChange={(value) =>
                          updateSettings({ contrast: value })
                        }
                        hint="Adds gentle separation between the face and the background."
                      />
                    </div>

                    <div>
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Matte behind transparent images
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {BACKGROUNDS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updateSettings({ backgroundId: item.id })
                            }
                            title={item.label}
                            aria-label={item.label}
                            aria-pressed={settings.backgroundId === item.id}
                            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition ${
                              settings.backgroundId === item.id
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600"
                              style={{
                                backgroundColor:
                                  item.color === "transparent"
                                    ? "transparent"
                                    : item.color,
                                backgroundImage:
                                  item.color === "transparent"
                                    ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, #fff 25%, #fff 75%, #ccc 75%)"
                                    : undefined,
                                backgroundSize:
                                  item.color === "transparent"
                                    ? "6px 6px"
                                    : undefined,
                                backgroundPosition:
                                  item.color === "transparent"
                                    ? "0 0, 3px 3px"
                                    : undefined,
                              }}
                            />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Print sheet
                        </span>
                        <select
                          value={settings.sheetId}
                          onChange={(event) =>
                            updateSettings({ sheetId: event.target.value })
                          }
                          className={fieldClass()}
                        >
                          {PRINT_SHEETS.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Requested copies
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={40}
                          value={settings.copies}
                          onChange={(event) =>
                            updateSettings({ copies: event.target.value })
                          }
                          className={fieldClass()}
                        />
                      </label>
                    </div>

                    {settings.sheetId === "custom-sheet" && (
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Sheet width (mm)
                          </span>
                          <input
                            type="number"
                            min={50}
                            max={500}
                            value={settings.customSheetWidth}
                            onChange={(event) =>
                              updateSettings({
                                customSheetWidth: event.target.value,
                              })
                            }
                            className={fieldClass()}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Sheet height (mm)
                          </span>
                          <input
                            type="number"
                            min={50}
                            max={500}
                            value={settings.customSheetHeight}
                            onChange={(event) =>
                              updateSettings({
                                customSheetHeight: event.target.value,
                              })
                            }
                            className={fieldClass()}
                          />
                        </label>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <RangeControl
                        label="Sheet margin"
                        value={settings.marginMm}
                        min={0}
                        max={30}
                        step={1}
                        suffix="mm"
                        onChange={(value) =>
                          updateSettings({ marginMm: value })
                        }
                      />
                      <RangeControl
                        label="Gap between photos"
                        value={settings.gapMm}
                        min={0}
                        max={20}
                        step={1}
                        suffix="mm"
                        onChange={(value) => updateSettings({ gapMm: value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Toggle
                        label="Cut guides"
                        description="Dashed lines around each photo on the print sheet."
                        checked={settings.cutLines}
                        onChange={(value) =>
                          updateSettings({ cutLines: value })
                        }
                      />
                      <Toggle
                        label="Show face guides"
                        description="Head-height and eye-line lines on the live preview only."
                        checked={settings.showGuides}
                        onChange={(value) =>
                          updateSettings({ showGuides: value })
                        }
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                        <Info
                          className="mt-0.5 h-3 w-3 shrink-0 text-indigo-400"
                          aria-hidden="true"
                        />
                        Always check the latest photo rules with the issuing
                        authority. Presets are practical guides, not legal
                        guarantees.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setSettings((current) => ({
                            ...DEFAULT_SETTINGS,
                            sheetId: current.sheetId,
                            copies: current.copies,
                          }))
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-indigo-300"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Reset options
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset studio
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                >
                  <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
                  Upload another photo
                </button>
              </div>
            </section>
          </div>

          {/* Preview and results */}
          <div className="space-y-6 lg:col-span-5">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Maximize2
                    className="h-4 w-4 text-indigo-500"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="text-[13px] font-extrabold text-slate-900 dark:text-white sm:text-sm">
                      Live preview
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-[11px]">
                      {preset.label} · {preset.widthMm} × {preset.heightMm} mm
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {settings.dpi} DPI
                </span>
              </div>

              <div className="p-4">
                <div
                  className="relative mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800"
                  style={{
                    aspectRatio: `${preset.widthMm} / ${preset.heightMm}`,
                    maxWidth: "420px",
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    className="h-full w-full object-cover"
                    aria-label="Passport photo preview"
                  />
                  {!photo && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 p-6 text-center dark:bg-slate-800">
                      <Camera
                        className="h-8 w-8 text-slate-400"
                        aria-hidden="true"
                      />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Your photo appears here
                      </p>
                      <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                        Upload a portrait to start framing.
                      </p>
                    </div>
                  )}

                  {photo && settings.showGuides && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      aria-hidden="true"
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-[2px] bg-indigo-500/70"
                        style={{ top: `${(100 - preset.headMaxPct) / 2}%` }}
                      />
                      <div
                        className="absolute inset-x-0 h-[2px] bg-indigo-500/70"
                        style={{
                          top: `${100 - (100 - preset.headMaxPct) / 2}%`,
                        }}
                      />
                      <div
                        className="absolute inset-x-0 h-px bg-amber-400/80"
                        style={{
                          top: `${(preset.eyeMinPct + preset.eyeMaxPct) / 2}%`,
                        }}
                      />
                      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/50" />
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded bg-slate-900/60 px-1.5 py-0.5 text-[8px] font-bold text-white">
                        HEAD
                      </span>
                      <span className="absolute right-1.5 top-1/2 -translate-y-[calc(50%+14px)] rounded bg-amber-500/80 px-1.5 py-0.5 text-[8px] font-bold text-white">
                        EYES
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 px-2 py-2 dark:bg-slate-800/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pixels
                    </div>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {output.width} × {output.height}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-2 py-2 dark:bg-slate-800/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Effective DPI
                    </div>
                    <div
                      className={`text-xs font-extrabold ${effectiveDpi >= settings.dpi * 0.95 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                    >
                      {effectiveDpi || "—"}
                    </div>
                  </div>
                </div>
                {photo && settings.showGuides && (
                  <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                    <Info
                      className="mt-0.5 h-3 w-3 shrink-0 text-indigo-400"
                      aria-hidden="true"
                    />
                    Guide lines are not exported. Head target{" "}
                    {preset.headMinPct}–{preset.headMaxPct}% of photo height;
                    eyes around {(preset.eyeMinPct + preset.eyeMaxPct) / 2}%.
                  </p>
                )}
              </div>
            </section>

            {/* Readiness */}
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ClipboardCheck
                      className="h-4 w-4 text-indigo-500"
                      aria-hidden="true"
                    />
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Readiness check
                    </h2>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    Digital checks only — final acceptance is up to the document
                    office.
                  </p>
                </div>
                <div className="relative h-16 w-16 shrink-0" aria-live="polite">
                  <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="27"
                      fill="none"
                      strokeWidth="6"
                      className="stroke-slate-100 dark:stroke-slate-800"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="27"
                      fill="none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(readiness.score / 100) * 169.65} 169.65`}
                      className={ringColor}
                    />
                  </svg>
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center ${scoreColor}`}
                  >
                    <span className="text-lg font-black leading-none">
                      {readiness.score}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider">
                      score
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                    readiness.tone === "emerald"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : readiness.tone === "amber"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : readiness.tone === "rose"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {readiness.score >= 85 ? (
                    <BadgeCheck className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {readiness.label}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {readiness.checks.length} checks
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {readiness.checks.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-400">
                    Upload a photo to run the print-resolution, background,
                    lighting, contrast and framing checks.
                  </p>
                ) : (
                  readiness.checks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/30"
                    >
                      {check.status === "pass" ? (
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                          aria-hidden="true"
                        />
                      ) : check.status === "warn" ? (
                        <AlertTriangle
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500"
                          aria-hidden="true"
                        />
                      ) : (
                        <X
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500"
                          aria-hidden="true"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
                            {check.label}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wide ${check.status === "pass" ? "text-emerald-600 dark:text-emerald-400" : check.status === "warn" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}
                          >
                            {check.status === "pass"
                              ? "Pass"
                              : check.status === "warn"
                                ? "Check"
                                : "Fix"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                          {check.detail}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Export */}
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center gap-1.5">
                <Download
                  className="h-4 w-4 text-indigo-500"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Export & print
                </h2>
              </div>

              <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50/80 p-3 text-[11px] dark:bg-slate-800/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Document
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {preset.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Print size
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {preset.widthMm} × {preset.heightMm} mm
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Pixel size
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {output.width} × {output.height} px
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Print sheet
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {layout.copies} {layout.copies === 1 ? "copy" : "copies"}{" "}
                    fit
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPhoto}
                  disabled={!photo || Boolean(exporting)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {exporting === "photo" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileImage className="h-3.5 w-3.5" />
                  )}
                  Download {settings.format.toUpperCase()} photo
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSheet}
                  disabled={!photo || Boolean(exporting) || !layout.fits}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                >
                  {exporting === "sheet" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  Download {layout.copies}-copy{" "}
                  {settings.format === "pdf" ? "PDF" : "print sheet"}
                </button>
              </div>

              <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                <ShieldCheck
                  className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"
                  aria-hidden="true"
                />
                Files are created locally. Nothing is uploaded, stored or
                shared.
              </p>
            </section>
          </div>
        </div>

        {/* Info strip */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: ScanFace,
              title: "Frame the face first",
              text: "Use the head and eye guides, then check that the crop includes the top of the head and the shoulders.",
            },
            {
              icon: ShieldCheck,
              title: "Plain, even background",
              text: "Stand about an arm's length from a plain wall, face a window or soft lamp, and avoid hard shadows.",
            },
            {
              icon: FileText,
              title: "Print at the right size",
              text: "Export at 300 DPI and print at 100% scale. A print sheet with several copies makes lab printing easier.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="mt-2.5 text-xs font-extrabold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Passport photo questions
            </h2>
          </div>
          <div className="mt-4 space-y-2.5">
            {PASSPORT_FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                  >
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 sm:text-[13px]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {open && (
                    <div className="bg-white px-4 py-3 text-[11px] leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-300 sm:text-xs">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <strong>Important:</strong> passport and visa photo requirements can
            change. This tool helps you prepare a technically sound photo but
            does not replace the official guidance of the passport office,
            embassy or consulate.
          </p>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Ready for a different document?</span>
          <a
            href="/tools/image-resizer"
            className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline dark:text-indigo-300"
          >
            Resize an image
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <a
            href="/tools/image-compressor"
            className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline dark:text-indigo-300"
          >
            Compress a photo
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </ToolPageShell>
  );
}
