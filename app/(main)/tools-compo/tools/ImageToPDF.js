"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileImage,
  FilePlus,
  FlipHorizontal,
  FlipVertical,
  GripVertical,
  LayoutGrid,
  Loader2,
  Plus,
  RotateCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import imageCompression from "browser-image-compression";

const PX_TO_PT = 72 / 96;
const MM_TO_PT = 72 / 25.4;

const COMPRESSIBLE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/bmp",
]);

const PAPER_SIZES_MM = {
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  Square: { width: 210, height: 210 },
};

const COMPRESSION_PROFILES = {
  quality: {
    label: "High quality",
    description: "Best for photos and artwork",
    maxSizeMB: 6,
    maxWidthOrHeight: 3200,
    initialQuality: 0.96,
  },
  balanced: {
    label: "Balanced",
    description: "A strong mix of quality and size",
    maxSizeMB: 3,
    maxWidthOrHeight: 2400,
    initialQuality: 0.9,
  },
  compact: {
    label: "Compact",
    description: "Smaller files for faster sharing",
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1800,
    initialQuality: 0.84,
  },
};

const PRESETS = [
  {
    id: "photo",
    title: "Photo album",
    description: "Full-bleed pages for galleries and portfolios.",
    patch: {
      pageSize: "image",
      fitMode: "contain",
      margin: 0,
      quality: 0.96,
      backgroundColor: "#ffffff",
      colorMode: "color",
      optimizeUploads: true,
      processorProfile: "quality",
      autoRotate: true,
      preserveTransparency: true,
      pageNumbers: false,
    },
  },
  {
    id: "document",
    title: "Document scan",
    description: "Clean pages for notes, forms, and handouts.",
    patch: {
      pageSize: "A4",
      fitMode: "contain",
      margin: 12,
      quality: 0.9,
      backgroundColor: "#ffffff",
      colorMode: "grayscale",
      optimizeUploads: true,
      processorProfile: "balanced",
      autoRotate: true,
      preserveTransparency: true,
      pageNumbers: true,
    },
  },
  {
    id: "compact",
    title: "Compact archive",
    description: "Smaller PDFs for quick delivery and storage.",
    patch: {
      pageSize: "Letter",
      fitMode: "contain",
      margin: 10,
      quality: 0.84,
      backgroundColor: "#f8fafc",
      colorMode: "mono",
      optimizeUploads: true,
      processorProfile: "compact",
      autoRotate: true,
      preserveTransparency: true,
      pageNumbers: true,
    },
  },
  {
    id: "poster",
    title: "Print poster",
    description: "Bigger canvas with cover-fill layout.",
    patch: {
      pageSize: "A3",
      fitMode: "cover",
      margin: 0,
      quality: 0.98,
      backgroundColor: "#ffffff",
      colorMode: "color",
      optimizeUploads: false,
      processorProfile: "quality",
      autoRotate: true,
      preserveTransparency: true,
      pageNumbers: false,
    },
  },
];

const COLOR_SWATCHES = [
  { label: "Paper", value: "#ffffff" },
  { label: "Pearl", value: "#f8fafc" },
  { label: "Sand", value: "#fef3c7" },
  { label: "Sky", value: "#dbeafe" },
  { label: "Midnight", value: "#0f172a" },
];

const DEFAULT_SETTINGS = {
  pageSize: "image",
  customWidth: 210,
  customHeight: 297,
  orientation: "auto",
  fitMode: "contain",
  margin: 0,
  quality: 0.96,
  backgroundColor: "#ffffff",
  colorMode: "color",
  bwThreshold: 175,
  optimizeUploads: true,
  processorProfile: "quality",
  autoRotate: true,
  preserveTransparency: true,
  pageNumbers: false,
  quickPreset: "photo",
  title: "Image to PDF",
  author: "",
  subject: "Converted from images",
  keywords: "image to pdf, browser pdf",
  creator: "ImageToPDF",
  outputName: "image-to-pdf",
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mmToPt(mm) {
  return mm * MM_TO_PT;
}

function pxToPt(px) {
  return px * PX_TO_PT;
}

function sanitizeFilename(value) {
  const cleaned = value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || `image-to-pdf-${Date.now()}`;
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";
  const base = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    sizes.length - 1,
    Math.floor(Math.log(bytes) / Math.log(base)),
  );
  const size = bytes / Math.pow(base, index);
  return `${parseFloat(size.toFixed(size >= 10 ? 1 : 2))} ${sizes[index]}`;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length !== 6) {
    return rgb(1, 1, 1);
  }

  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) {
    return rgb(1, 1, 1);
  }

  return rgb(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  );
}

function waitForFrame() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    window.requestAnimationFrame(() => resolve());
  });
}

function applyThreshold(imageData, threshold) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const luminance =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const value = luminance >= threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  return imageData;
}

function getRotatedDimensions(imageState) {
  const rotation = (((imageState.rotation || 0) % 360) + 360) % 360;
  const quarterTurn = rotation === 90 || rotation === 270;
  return quarterTurn
    ? { width: imageState.height, height: imageState.width }
    : { width: imageState.width, height: imageState.height };
}

function loadImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be read in your browser."));
    };

    img.src = url;
  });
}

function renderFileToCanvas(file, imageState, settings, outputMimeType) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const zoom = clamp(imageState.zoom || 1, 0.3, 3);
        const rotation = (((imageState.rotation || 0) % 360) + 360) % 360;
        const rotatedQuarterTurn = rotation === 90 || rotation === 270;
        const sourceWidth = Math.max(
          1,
          Math.round((img.naturalWidth || img.width) * zoom),
        );
        const sourceHeight = Math.max(
          1,
          Math.round((img.naturalHeight || img.height) * zoom),
        );
        const canvasWidth = rotatedQuarterTurn ? sourceHeight : sourceWidth;
        const canvasHeight = rotatedQuarterTurn ? sourceWidth : sourceHeight;
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext("2d", {
          willReadFrequently: settings.colorMode === "mono",
        });

        if (!ctx) {
          throw new Error("Canvas is not supported in this browser.");
        }

        const needsFlattening =
          outputMimeType === "image/jpeg" ||
          !settings.preserveTransparency ||
          settings.colorMode === "mono";

        if (needsFlattening) {
          ctx.fillStyle = settings.backgroundColor;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        ctx.save();
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        if (rotation) {
          ctx.rotate((rotation * Math.PI) / 180);
        }
        if (imageState.flipH || imageState.flipV) {
          ctx.scale(imageState.flipH ? -1 : 1, imageState.flipV ? -1 : 1);
        }

        if (settings.colorMode === "grayscale") {
          ctx.filter = "grayscale(1) contrast(1.08)";
        } else if (settings.colorMode === "mono") {
          ctx.filter = "grayscale(1) contrast(2.2)";
        }

        ctx.drawImage(
          img,
          -sourceWidth / 2,
          -sourceHeight / 2,
          sourceWidth,
          sourceHeight,
        );
        ctx.restore();
        ctx.filter = "none";

        if (settings.colorMode === "mono") {
          const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
          applyThreshold(imageData, settings.bwThreshold);
          ctx.putImageData(imageData, 0, 0);
        }

        resolve({ canvas, width: canvasWidth, height: canvasHeight });
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image format is not supported by your browser."));
    };

    img.src = url;
  });
}

function getPageSizeInPoints(imageState, settings) {
  const renderedDimensions = getRotatedDimensions(imageState);

  if (settings.pageSize === "image") {
    return {
      width: pxToPt(renderedDimensions.width),
      height: pxToPt(renderedDimensions.height),
    };
  }

  if (settings.pageSize === "custom") {
    let width = mmToPt(Math.max(10, Number(settings.customWidth) || 0));
    let height = mmToPt(Math.max(10, Number(settings.customHeight) || 0));

    if (settings.orientation === "landscape") {
      if (height > width) [width, height] = [height, width];
    } else if (settings.orientation === "portrait") {
      if (width > height) [width, height] = [height, width];
    } else if (settings.orientation === "auto") {
      const imageLandscape = imageState.width >= imageState.height;
      const pageLandscape = width >= height;
      if (imageLandscape !== pageLandscape) [width, height] = [height, width];
    }

    return { width, height };
  }

  const preset = PAPER_SIZES_MM[settings.pageSize] || PAPER_SIZES_MM.A4;
  let width = mmToPt(preset.width);
  let height = mmToPt(preset.height);

  if (settings.orientation === "landscape") {
    if (height > width) [width, height] = [height, width];
  } else if (settings.orientation === "portrait") {
    if (width > height) [width, height] = [height, width];
  } else if (settings.orientation === "auto") {
    const imageLandscape =
      renderedDimensions.width >= renderedDimensions.height;
    const pageLandscape = width >= height;
    if (imageLandscape !== pageLandscape) [width, height] = [height, width];
  }

  return { width, height };
}

function getCompressionOptions(profileKey, quality) {
  const profile =
    COMPRESSION_PROFILES[profileKey] || COMPRESSION_PROFILES.balanced;
  return {
    maxSizeMB: profile.maxSizeMB,
    maxWidthOrHeight: profile.maxWidthOrHeight,
    initialQuality: Math.max(
      0.4,
      Math.min(1, Math.min(profile.initialQuality, quality)),
    ),
    useWebWorker: true,
  };
}

function ToggleSwitch({
  label,
  description,
  checked,
  onToggle,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`
        flex w-full items-center justify-between gap-4 
        rounded-2xl border px-4 py-3 text-left 
        transition-all duration-200
        ${
          checked
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
        } 
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>

      <div
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 
          items-center rounded-full border-0 
          transition-colors duration-200 ease-in-out
          ${checked ? "bg-emerald-500" : "bg-slate-200"}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full 
            bg-white shadow-sm ring-0 transition-all 
            duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0.5"}
          `}
        />
      </div>
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  help,
  disabled = false,
  min,
  max,
  step,
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      {help ? <p className="text-xs text-slate-500">{help}</p> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  description,
  disabled = false,
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {description ? (
        <p className="text-xs leading-relaxed text-slate-500">{description}</p>
      ) : null}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-white shadow-lg shadow-slate-950/10 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-sm text-slate-300">{hint}</p> : null}
        </div>
        <div className="rounded-2xl bg-white/10 p-2 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function UploadStatus({ items, progress }) {
  if (items.length === 0) return null;

  const completedCount = items.filter(
    (item) => item.status === "completed",
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
    >
      <div className="bg-slate-950 px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin" />
            Upload queue
          </h3>
          <span className="text-xs text-slate-300">
            {completedCount}/{items.length}
          </span>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {items.map((upload) => {
          const barValue = progress[upload.id] || 0;

          return (
            <div
              key={upload.id}
              className="border-b border-slate-100 p-3 last:border-b-0"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {upload.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(upload.size)}
                  </p>
                </div>
                {upload.status === "uploading" ? (
                  <Clock className="h-4 w-4 flex-none text-indigo-500" />
                ) : null}
                {upload.status === "completed" ? (
                  <CheckCircle className="h-4 w-4 flex-none text-emerald-500" />
                ) : null}
                {upload.status === "error" ? (
                  <AlertTriangle className="h-4 w-4 flex-none text-red-500" />
                ) : null}
              </div>

              {upload.status === "uploading" ? (
                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barValue}%` }}
                      className="h-2 rounded-full bg-indigo-600"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {Math.round(barValue)}% - preparing image
                  </p>
                </div>
              ) : null}

              {upload.status === "error" ? (
                <p className="text-xs text-red-600">{upload.error}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function ImageToPDF() {
  const fileInputRef = useRef(null);
  const imagesRef = useRef([]);
  const uploadTimeoutsRef = useRef([]);

  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState("");
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
  const [showMetadataOptions, setShowMetadataOptions] = useState(false);
  const [notice, setNotice] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
      uploadTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const showNotice = (kind, text) => {
    setNotice({ kind, text });
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setShowAdvanceOptions(false);
    setShowMetadataOptions(false);
    showNotice("info", "Settings reset to defaults.");
  };

  const applyPreset = (preset) => {
    setSettings((prev) => ({
      ...prev,
      ...preset.patch,
      quickPreset: preset.id,
    }));
    showNotice("info", `Applied ${preset.title} preset.`);
  };

  const handleQuickPresetChange = (event) => {
    const preset = PRESETS.find((item) => item.id === event.target.value);
    if (!preset) return;
    applyPreset(preset);
  };

  const parseFiles = async (files) => {
    if (isConverting || hasActiveUploads) {
      showNotice(
        "info",
        "Wait for the current queue to finish before adding more images.",
      );
      return;
    }

    const acceptedFiles = Array.from(files || []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (acceptedFiles.length === 0) {
      showNotice("error", "Please add at least one supported image file.");
      return;
    }

    const queuedItems = acceptedFiles.map((file) => ({
      id: createId(),
      name: file.name,
      size: file.size,
      status: "uploading",
      progress: 0,
    }));

    setUploadingImages((prev) => [...prev, ...queuedItems]);

    const nextImages = [];

    for (let index = 0; index < acceptedFiles.length; index += 1) {
      const file = acceptedFiles[index];
      const uploadId = queuedItems[index].id;

      try {
        setUploadProgress((prev) => ({ ...prev, [uploadId]: 6 }));

        let workingFile = file;
        if (settings.optimizeUploads && COMPRESSIBLE_TYPES.has(file.type)) {
          const compressionOptions = getCompressionOptions(
            settings.processorProfile,
            settings.quality,
          );
          const normalizedFileType =
            file.type === "image/jpg" ? "image/jpeg" : file.type;

          const exifOrientation =
            typeof imageCompression.getExifOrientation === "function"
              ? await imageCompression.getExifOrientation(file).catch(() => 1)
              : 1;

          setUploadProgress((prev) => ({ ...prev, [uploadId]: 20 }));

          try {
            workingFile = await imageCompression(file, {
              ...compressionOptions,
              exifOrientation,
              fileType: normalizedFileType,
              onProgress: (progress) => {
                setUploadProgress((prev) => ({
                  ...prev,
                  [uploadId]: clamp(10 + progress * 0.7, 10, 92),
                }));
              },
            });
          } catch (compressionError) {
            console.warn(
              "Image compression failed, continuing with original file:",
              compressionError,
            );
            workingFile = file;
          }
        }

        setUploadProgress((prev) => ({ ...prev, [uploadId]: 78 }));

        const dimensions = await loadImageDimensions(workingFile);
        const preview = URL.createObjectURL(workingFile);

        nextImages.push({
          id: createId(),
          file: workingFile,
          preview,
          name: file.name,
          size: workingFile.size,
          originalSize: file.size,
          type: file.type,
          rotation: 0,
          flipH: false,
          flipV: false,
          zoom: 1,
          width: dimensions.width,
          height: dimensions.height,
        });

        setUploadingImages((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, status: "completed", progress: 100 }
              : item,
          ),
        );

        setUploadProgress((prev) => ({ ...prev, [uploadId]: 100 }));

        const timeoutId = window.setTimeout(() => {
          setUploadingImages((prev) =>
            prev.filter((item) => item.id !== uploadId),
          );
          setUploadProgress((prev) => {
            const copy = { ...prev };
            delete copy[uploadId];
            return copy;
          });
          uploadTimeoutsRef.current = uploadTimeoutsRef.current.filter(
            (timeout) => timeout !== timeoutId,
          );
        }, 1200);
        uploadTimeoutsRef.current.push(timeoutId);
      } catch (error) {
        console.error("Error preparing image:", error);
        setUploadingImages((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? {
                  ...item,
                  status: "error",
                  error: error?.message || "Failed to process this image.",
                }
              : item,
          ),
        );
        setUploadProgress((prev) => ({ ...prev, [uploadId]: 100 }));

        const timeoutId = window.setTimeout(() => {
          setUploadingImages((prev) =>
            prev.filter((item) => item.id !== uploadId),
          );
          setUploadProgress((prev) => {
            const copy = { ...prev };
            delete copy[uploadId];
            return copy;
          });
          uploadTimeoutsRef.current = uploadTimeoutsRef.current.filter(
            (timeout) => timeout !== timeoutId,
          );
        }, 4500);
        uploadTimeoutsRef.current.push(timeoutId);
      }
    }

    setImages((prev) => [...prev, ...nextImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    await parseFiles(files);
  };

  const openFilePicker = () => {
    if (!isConverting && !hasActiveUploads && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = (id) => {
    if (isConverting || hasActiveUploads) return;

    setImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((image) => image.id !== id);
    });
  };

  const clearAllImages = () => {
    if (isConverting || hasActiveUploads) return;
    imagesRef.current.forEach((image) => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setImages([]);
    setUploadingImages([]);
    setUploadProgress({});
    uploadTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    uploadTimeoutsRef.current = [];
    setDraggedIndex(null);
    showNotice("info", "All images and queue items were cleared.");
  };

  const rotateImage = (id) => {
    if (isConverting || hasActiveUploads) return;
    setImages((prev) =>
      prev.map((image) =>
        image.id === id
          ? { ...image, rotation: (image.rotation + 90) % 360 }
          : image,
      ),
    );
  };

  const flipImage = (id, axis) => {
    if (isConverting || hasActiveUploads) return;
    setImages((prev) =>
      prev.map((image) =>
        image.id === id ? { ...image, [axis]: !image[axis] } : image,
      ),
    );
  };

  const zoomImage = (id, direction) => {
    if (isConverting || hasActiveUploads) return;
    setImages((prev) =>
      prev.map((image) =>
        image.id === id
          ? {
              ...image,
              zoom: clamp(
                image.zoom + (direction === "in" ? 0.1 : -0.1),
                0.3,
                3,
              ),
            }
          : image,
      ),
    );
  };

  const sortImagesByName = () => {
    if (isConverting || hasActiveUploads) return;
    setImages((prev) =>
      [...prev].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      ),
    );
    showNotice("info", "Images sorted by filename.");
  };

  const reverseImages = () => {
    if (isConverting || hasActiveUploads) return;
    setImages((prev) => [...prev].reverse());
    showNotice("info", "Image order reversed.");
  };

  const handleDragStart = (index) => {
    if (isConverting || hasActiveUploads) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (isConverting || hasActiveUploads || draggedIndex === null) return;

    setImages((prev) => {
      const next = [...prev];
      const [dragged] = next.splice(draggedIndex, 1);
      next.splice(dropIndex, 0, dragged);
      return next;
    });

    setDraggedIndex(null);
  };

  const handleFilesDrop = async (event) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    const files = event.dataTransfer?.files
      ? Array.from(event.dataTransfer.files)
      : [];
    if (files.length) {
      await parseFiles(files);
    }
  };

  const handleDragEnterFiles = (event) => {
    event.preventDefault();
    setIsDraggingFiles(true);
  };

  const handleDragLeaveFiles = (event) => {
    event.preventDefault();
    if (event.currentTarget === event.target) {
      setIsDraggingFiles(false);
    }
  };

  const convertToPDF = async () => {
    if (hasActiveUploads) {
      showNotice(
        "error",
        "Wait for image processing to finish before exporting.",
      );
      return;
    }

    if (images.length === 0) {
      showNotice("error", "Add at least one image before converting.");
      return;
    }

    setIsConverting(true);
    setExportProgress(0);
    setExportStage("Preparing PDF");

    try {
      const pdfDoc = await PDFDocument.create();
      const now = new Date();
      const title = settings.title.trim();
      const author = settings.author.trim();
      const subject = settings.subject.trim();
      const creator = settings.creator.trim();
      const keywordList = settings.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);

      if (title) pdfDoc.setTitle(title);
      if (author) pdfDoc.setAuthor(author);
      if (subject) pdfDoc.setSubject(subject);
      if (creator) pdfDoc.setCreator(creator);
      if (keywordList.length) pdfDoc.setKeywords(keywordList);
      pdfDoc.setCreationDate(now);
      pdfDoc.setModificationDate(now);

      const pageBackground = hexToRgb(settings.backgroundColor);

      for (let index = 0; index < images.length; index += 1) {
        const imageState = images[index];
        const pageSize = getPageSizeInPoints(imageState, settings);
        const previewDimensions = getRotatedDimensions(imageState);

        let renderRotation = imageState.rotation;
        if (
          settings.autoRotate &&
          settings.pageSize !== "image" &&
          settings.fitMode !== "stretch" &&
          renderRotation % 180 === 0
        ) {
          const pageLandscape = pageSize.width >= pageSize.height;
          const imageLandscape =
            previewDimensions.width >= previewDimensions.height;
          if (pageLandscape !== imageLandscape) {
            renderRotation = (renderRotation + 90) % 360;
          }
        }

        const renderItem = { ...imageState, rotation: renderRotation };
        const usePng =
          settings.colorMode === "mono" ||
          (settings.preserveTransparency &&
            ["image/png", "image/webp", "image/svg+xml", "image/gif"].includes(
              imageState.type,
            ));
        const outputMimeType = usePng ? "image/png" : "image/jpeg";

        setExportStage(`Rendering page ${index + 1} of ${images.length}`);

        const { canvas } = await renderFileToCanvas(
          imageState.file,
          renderItem,
          settings,
          outputMimeType,
        );

        const bytes = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Could not encode the rendered image."));
                return;
              }
              blob.arrayBuffer().then(resolve).catch(reject);
            },
            outputMimeType,
            settings.quality,
          );
        });

        const embeddedImage =
          outputMimeType === "image/png"
            ? await pdfDoc.embedPng(bytes)
            : await pdfDoc.embedJpg(bytes);

        const page = pdfDoc.addPage([pageSize.width, pageSize.height]);
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pageSize.width,
          height: pageSize.height,
          color: pageBackground,
        });

        const marginPt = mmToPt(settings.margin);
        const footerSpace = settings.pageNumbers ? 24 : 0;
        const availableWidth = Math.max(1, pageSize.width - marginPt * 2);
        const availableHeight = Math.max(
          1,
          pageSize.height - marginPt * 2 - footerSpace,
        );

        let drawWidth = embeddedImage.width;
        let drawHeight = embeddedImage.height;

        if (settings.fitMode === "contain") {
          const ratio = Math.min(
            availableWidth / embeddedImage.width,
            availableHeight / embeddedImage.height,
          );
          drawWidth = embeddedImage.width * ratio;
          drawHeight = embeddedImage.height * ratio;
        } else if (settings.fitMode === "cover") {
          const ratio = Math.max(
            availableWidth / embeddedImage.width,
            availableHeight / embeddedImage.height,
          );
          drawWidth = embeddedImage.width * ratio;
          drawHeight = embeddedImage.height * ratio;
        } else {
          drawWidth = availableWidth;
          drawHeight = availableHeight;
        }

        const x = marginPt + (availableWidth - drawWidth) / 2;
        const y = marginPt + footerSpace + (availableHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        if (settings.pageNumbers) {
          const badgeText = `${index + 1} / ${images.length}`;
          const badgeWidth = Math.max(60, badgeText.length * 5.2 + 16);
          const badgeHeight = 16;
          const badgeX = pageSize.width - badgeWidth - Math.max(8, marginPt);
          const badgeY = Math.max(8, marginPt * 0.7);

          page.drawRectangle({
            x: badgeX,
            y: badgeY,
            width: badgeWidth,
            height: badgeHeight,
            color: rgb(1, 1, 1),
            opacity: 0.88,
          });
          page.drawText(badgeText, {
            x: badgeX + 8,
            y: badgeY + 4,
            size: 8.5,
            color: rgb(0.12, 0.12, 0.12),
          });
        }

        setExportProgress(Math.round(((index + 1) / images.length) * 100));
        await waitForFrame();
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadName = `${sanitizeFilename(settings.outputName)}.pdf`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1200);

      showNotice("success", `PDF exported as ${downloadName}.`);
      setExportStage("Done");
      setExportProgress(100);
    } catch (error) {
      console.error("Error converting to PDF:", error);
      showNotice(
        "error",
        error?.message || "There was a problem creating the PDF.",
      );
      setExportStage("Export failed");
    } finally {
      setIsConverting(false);
    }
  };

  const totalOriginalSize = images.reduce(
    (sum, image) => sum + (image.originalSize || image.size || 0),
    0,
  );
  const totalOptimizedSize = images.reduce(
    (sum, image) => sum + (image.size || 0),
    0,
  );
  const activeUploadCount = uploadingImages.filter(
    (item) => item.status === "uploading",
  ).length;
  const hasActiveUploads = activeUploadCount > 0;
  const savedBytes = Math.max(0, totalOriginalSize - totalOptimizedSize);
  const currentPresetLabel =
    PRESETS.find((preset) => preset.id === settings.quickPreset)?.title ||
    "Custom";

  const NoticeIcon =
    notice?.kind === "success"
      ? CheckCircle
      : notice?.kind === "error"
        ? AlertTriangle
        : AlertCircle;

  const dragDropHint = isDraggingFiles
    ? "Drop the files to add them to the queue."
    : "Drag files here or use the button to start the queue.";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <UploadStatus items={uploadingImages} progress={uploadProgress} />

      <section className="relative overflow-hidden bg-slate-950 text-white min-h-screen flex items-center pt-16 md:pt-0">
        <div className="absolute inset-0">
          <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute right-0 top-14 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Browser-only
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Private by design
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Metadata aware
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Batch friendly
            </span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Image to PDF, rebuilt for a more polished workflow.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Convert images into professional PDFs with presets, metadata,
                smarter compression, page numbers, custom sizes, and a cleaner
                layout that feels like a real production tool instead of a form.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={hasActiveUploads || isConverting}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  Add images
                </button>
                <button
                  type="button"
                  onClick={convertToPDF}
                  disabled={
                    isConverting || hasActiveUploads || images.length === 0
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConverting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Convert to PDF
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <StatCard
                icon={FileImage}
                label="Images"
                value={images.length.toString().padStart(2, "0")}
                hint="Ready to place in the PDF."
              />
              <StatCard
                icon={ShieldCheck}
                label="Saved"
                value={formatBytes(savedBytes)}
                hint="Potential space saved by preprocessing."
              />
              <StatCard
                icon={LayoutGrid}
                label="Preset"
                value={currentPresetLabel}
                hint="Switch between photo, document, compact, and poster."
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {notice ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 flex items-start justify-between gap-4 rounded-3xl border px-4 py-3 ${
              notice.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : notice.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-sky-200 bg-sky-50 text-sky-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <NoticeIcon className="mt-0.5 h-5 w-5 flex-none" />
              <p className="text-sm font-medium">{notice.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded-full p-1 transition hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="sticky top-6 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Settings
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Tune the basics here, then open Advance Options for the
                      rest.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetSettings}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-semibold text-slate-900">
                        Layout
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="block space-y-1.5">
                        <span className="text-sm font-semibold text-slate-900">
                          PDF filename
                        </span>
                        <input
                          type="text"
                          value={settings.outputName}
                          onChange={(event) =>
                            updateSetting("outputName", event.target.value)
                          }
                          placeholder="image-to-pdf"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </label>

                      <label className="block space-y-1.5">
                        <span className="text-sm font-semibold text-slate-900">
                          Page size
                        </span>
                        <select
                          value={settings.pageSize}
                          onChange={(event) =>
                            updateSetting("pageSize", event.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        >
                          <option value="image">Match image dimensions</option>
                          <option value="A4">A4</option>
                          <option value="A5">A5</option>
                          <option value="A3">A3</option>
                          <option value="Letter">Letter</option>
                          <option value="Legal">Legal</option>
                          <option value="Square">Square</option>
                          <option value="custom">Custom size</option>
                        </select>
                        <p className="text-xs text-slate-500">
                          PDFCraft-inspired page sizing with image-match and
                          print-ready presets.
                        </p>
                      </label>

                      {settings.pageSize === "custom" ? (
                        <div className="grid grid-cols-2 gap-3">
                          <TextField
                            label="Width (mm)"
                            type="number"
                            value={settings.customWidth}
                            min={10}
                            step={1}
                            onChange={(event) =>
                              updateSetting(
                                "customWidth",
                                Number(event.target.value),
                              )
                            }
                          />
                          <TextField
                            label="Height (mm)"
                            type="number"
                            value={settings.customHeight}
                            min={10}
                            step={1}
                            onChange={(event) =>
                              updateSetting(
                                "customHeight",
                                Number(event.target.value),
                              )
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-semibold text-slate-900">
                        Basics
                      </p>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-sm font-semibold text-slate-900">
                        Margin: {settings.margin} mm
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={settings.margin}
                        onChange={(event) =>
                          updateSetting("margin", Number(event.target.value))
                        }
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500">
                        Creates breathing room around the image and page number
                        footer.
                      </p>
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-sm font-semibold text-slate-900">
                        Quality: {Math.round(settings.quality * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.01"
                        value={settings.quality}
                        onChange={(event) =>
                          updateSetting("quality", Number(event.target.value))
                        }
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500">
                        Affects upload compression and JPEG export quality.
                      </p>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowAdvanceOptions((prev) => !prev)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-900">
                          Advance Options
                        </p>
                        <p className="text-xs text-slate-500">
                          Orientation, fit, color, compression, metadata, and
                          PDF extras.
                        </p>
                      </div>
                      {showAdvanceOptions ? (
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      )}
                    </button>

                    {showAdvanceOptions ? (
                      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <SelectField
                          label="Quick presets"
                          description="Pick a ready-made setup, then adjust the details below."
                          value={settings.quickPreset}
                          onChange={handleQuickPresetChange}
                          options={PRESETS.map((preset) => ({
                            value: preset.id,
                            label: preset.title,
                          }))}
                        />

                        <SelectField
                          label="Orientation"
                          description="Use auto to match the page to the image whenever possible."
                          value={settings.orientation}
                          onChange={(event) =>
                            updateSetting("orientation", event.target.value)
                          }
                          disabled={settings.pageSize === "image"}
                          options={[
                            {
                              value: "auto",
                              label: "Auto",
                            },
                            {
                              value: "portrait",
                              label: "Portrait",
                            },
                            {
                              value: "landscape",
                              label: "Landscape",
                            },
                          ]}
                        />

                        <SelectField
                          label="Fit mode"
                          description="Contain keeps the full image. Cover fills the page. Stretch can distort."
                          value={settings.fitMode}
                          onChange={(event) =>
                            updateSetting("fitMode", event.target.value)
                          }
                          options={[
                            {
                              value: "contain",
                              label: "Contain",
                            },
                            {
                              value: "cover",
                              label: "Cover",
                            },
                            {
                              value: "stretch",
                              label: "Stretch",
                            },
                          ]}
                        />

                        <SelectField
                          label="Color mode"
                          description="Color, grayscale, or mono for document-style exports."
                          value={settings.colorMode}
                          onChange={(event) =>
                            updateSetting("colorMode", event.target.value)
                          }
                          options={[
                            {
                              value: "color",
                              label: "Color",
                            },
                            {
                              value: "grayscale",
                              label: "Gray",
                            },
                            {
                              value: "mono",
                              label: "Mono",
                            },
                          ]}
                        />

                        {settings.colorMode === "mono" ? (
                          <label className="block space-y-1.5">
                            <span className="text-sm font-semibold text-slate-900">
                              Mono threshold: {settings.bwThreshold}
                            </span>
                            <input
                              type="range"
                              min="80"
                              max="220"
                              value={settings.bwThreshold}
                              onChange={(event) =>
                                updateSetting(
                                  "bwThreshold",
                                  Number(event.target.value),
                                )
                              }
                              className="w-full"
                            />
                            <p className="text-xs text-slate-500">
                              Lower values keep more ink; higher values sharpen
                              the background.
                            </p>
                          </label>
                        ) : null}

                        <SelectField
                          label="Compression profile"
                          description="Choose how hard the browser should optimize the images before export."
                          value={settings.processorProfile}
                          onChange={(event) =>
                            updateSetting(
                              "processorProfile",
                              event.target.value,
                            )
                          }
                          options={[
                            {
                              value: "quality",
                              label: "High",
                            },
                            {
                              value: "balanced",
                              label: "Balanced",
                            },
                            {
                              value: "compact",
                              label: "Compact",
                            },
                          ]}
                        />

                        <ToggleSwitch
                          label="Auto compress uploads"
                          description="Resize and compress images in the browser before PDF generation."
                          checked={settings.optimizeUploads}
                          onToggle={() =>
                            updateSetting(
                              "optimizeUploads",
                              !settings.optimizeUploads,
                            )
                          }
                        />

                        <ToggleSwitch
                          label="Auto rotate"
                          description="Rotate images to better match the chosen page orientation."
                          checked={settings.autoRotate}
                          onToggle={() =>
                            updateSetting("autoRotate", !settings.autoRotate)
                          }
                        />

                        <ToggleSwitch
                          label="Page transparency"
                          description="Keep PNG alpha when possible instead of flattening everything."
                          checked={settings.preserveTransparency}
                          onToggle={() =>
                            updateSetting(
                              "preserveTransparency",
                              !settings.preserveTransparency,
                            )
                          }
                        />

                        <ToggleSwitch
                          label="Page numbers"
                          description="Add a small footer badge on every PDF page."
                          checked={settings.pageNumbers}
                          onToggle={() =>
                            updateSetting("pageNumbers", !settings.pageNumbers)
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowMetadataOptions((prev) => !prev)
                          }
                          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50"
                        >
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900">
                              PDF metadata
                            </p>
                            <p className="text-xs text-slate-500">
                              Add title, author, subject, keywords, and creator.
                            </p>
                          </div>
                          {showMetadataOptions ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          )}
                        </button>

                        {showMetadataOptions ? (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="grid gap-3">
                              <TextField
                                label="Title"
                                value={settings.title}
                                onChange={(event) =>
                                  updateSetting("title", event.target.value)
                                }
                                placeholder="Image to PDF"
                              />
                              <TextField
                                label="Author"
                                value={settings.author}
                                onChange={(event) =>
                                  updateSetting("author", event.target.value)
                                }
                                placeholder="Your name"
                              />
                              <TextField
                                label="Subject"
                                value={settings.subject}
                                onChange={(event) =>
                                  updateSetting("subject", event.target.value)
                                }
                                placeholder="Document subject"
                              />
                              <TextField
                                label="Keywords"
                                value={settings.keywords}
                                onChange={(event) =>
                                  updateSetting("keywords", event.target.value)
                                }
                                placeholder="image, pdf, archive"
                              />
                              <TextField
                                label="Creator"
                                value={settings.creator}
                                onChange={(event) =>
                                  updateSetting("creator", event.target.value)
                                }
                                placeholder="ImageToPDF"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={hasActiveUploads || isConverting}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {hasActiveUploads ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Uploading {activeUploadCount} image(s)...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        Add images
                      </>
                    )}
                  </button>

                  {images.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={clearAllImages}
                        disabled={isConverting || hasActiveUploads}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear all ({images.length})
                      </button>

                      <button
                        type="button"
                        onClick={convertToPDF}
                        disabled={isConverting || hasActiveUploads}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isConverting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Converting {images.length} page(s)...
                          </>
                        ) : (
                          <>
                            <Download className="h-5 w-5" />
                            Convert to PDF
                          </>
                        )}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {isConverting ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {exportStage || "Exporting"}
                    </p>
                    <p className="text-xs text-slate-500">
                      This stays local in your browser. No uploads.
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {exportProgress}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${exportProgress}%` }}
                    className="h-2 rounded-full bg-emerald-600"
                  />
                </div>
              </div>
            ) : null}

            <div
              onDragEnter={handleDragEnterFiles}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={handleDragLeaveFiles}
              onDrop={handleFilesDrop}
              className={`rounded-3xl border-2 border-dashed p-6 shadow-xl shadow-slate-900/5 transition-all ${
                isDraggingFiles
                  ? "border-cyan-400 bg-cyan-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              {images.length === 0 && uploadingImages.length === 0 ? (
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      {dragDropHint}
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                      Drop images here or use the button on the left.
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      Build a PDF page by page, reorder your images, add
                      document metadata, and choose whether you want print-ready
                      output or compact sharing files.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Local processing
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Drag to reorder
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Page numbers
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Metadata
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Start a batch
                        </p>
                        <p className="text-xs text-slate-500">
                          Supports JPG, PNG, WebP, BMP, GIF, and SVG in modern
                          browsers.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      <FilePlus className="h-4 w-4" />
                      Choose images
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {images.length} image{images.length === 1 ? "" : "s"}{" "}
                        ready
                      </p>
                      <p className="text-xs text-slate-500">
                        Drag cards to reorder, then export when you are ready.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={openFilePicker}
                        disabled={hasActiveUploads || isConverting}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FilePlus className="h-4 w-4" />
                        Add more
                      </button>
                      <button
                        type="button"
                        onClick={sortImagesByName}
                        disabled={isConverting || hasActiveUploads}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <LayoutGrid className="h-4 w-4" />
                        Sort A-Z
                      </button>
                      <button
                        type="button"
                        onClick={reverseImages}
                        disabled={isConverting || hasActiveUploads}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCw className="h-4 w-4" />
                        Reverse
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <AnimatePresence>
                      {images.map((image, index) => (
                        <motion.div
                          key={image.id}
                          layout
                          draggable={!isConverting && !hasActiveUploads}
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(index)}
                          onDragEnd={() => setDraggedIndex(null)}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.01 }}
                          className={`group overflow-hidden rounded-3xl border bg-white shadow-lg shadow-slate-900/5 transition ${
                            draggedIndex === index
                              ? "ring-2 ring-indigo-500"
                              : "border-slate-200"
                          } ${isConverting ? "cursor-not-allowed opacity-70" : "cursor-move"}`}
                        >
                          <div className="relative bg-slate-100">
                            <div className="relative h-56 overflow-hidden">
                              <img
                                src={image.preview}
                                alt={image.name}
                                className="h-full w-full object-contain"
                                style={{
                                  transform: `rotate(${image.rotation}deg) scale(${image.zoom}) scaleX(${
                                    image.flipH ? -1 : 1
                                  }) scaleY(${image.flipV ? -1 : 1})`,
                                  transition: "transform 0.2s ease",
                                }}
                              />
                            </div>

                            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                              <GripVertical className="h-3.5 w-3.5" />
                              {index + 1}
                            </div>

                            <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => rotateImage(image.id)}
                                disabled={isConverting || hasActiveUploads}
                                className="rounded-xl bg-white p-2 shadow-md transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Rotate"
                              >
                                <RotateCw className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => flipImage(image.id, "flipH")}
                                disabled={isConverting || hasActiveUploads}
                                className="rounded-xl bg-white p-2 shadow-md transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Flip horizontal"
                              >
                                <FlipHorizontal className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => flipImage(image.id, "flipV")}
                                disabled={isConverting || hasActiveUploads}
                                className="rounded-xl bg-white p-2 shadow-md transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Flip vertical"
                              >
                                <FlipVertical className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                disabled={isConverting || hasActiveUploads}
                                className="rounded-xl bg-red-500 p-2 text-white shadow-md transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Remove"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => zoomImage(image.id, "out")}
                                disabled={isConverting || hasActiveUploads}
                                className="rounded-xl bg-white p-2 shadow-md transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Zoom out"
                              >
                                <ZoomOut className="h-4 w-4" />
                              </button>
                              <span className="rounded-xl bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-md">
                                {Math.round(image.zoom * 100)}%
                              </span>
                              <button
                                type="button"
                                onClick={() => zoomImage(image.id, "in")}
                                disabled={isConverting || hasActiveUploads}
                                className="rounded-xl bg-white p-2 shadow-md transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Zoom in"
                              >
                                <ZoomIn className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {image.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatBytes(image.size)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                              <p>
                                {image.width} x {image.height}
                              </p>
                              {image.originalSize ? (
                                <p className="text-emerald-600">
                                  Saved{" "}
                                  {formatBytes(
                                    Math.max(
                                      0,
                                      image.originalSize - image.size,
                                    ),
                                  )}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                              <span className="rounded-full bg-slate-100 px-2 py-1">
                                Rotate {image.rotation}deg
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-1">
                                Flip {image.flipH ? "H" : ""}
                                {image.flipV ? "V" : ""}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-1">
                                Zoom {Math.round(image.zoom * 100)}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {images.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Images
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{images.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Total size
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatBytes(totalOptimizedSize)}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Page mode
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {settings.pageSize === "image"
                      ? "Image match"
                      : settings.pageSize}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-sky-700" />
                <div>
                  <p className="text-sm font-semibold text-sky-950">Tips</p>
                  <ul className="mt-2 space-y-1 text-sm text-sky-900">
                    <li>
                      Use the document preset for notes, scans, and forms.
                    </li>
                    <li>
                      Use mono mode with page numbers for clean archive PDFs.
                    </li>
                    <li>
                      Try custom sizes when you need exact print dimensions.
                    </li>
                    <li>
                      Metadata is written into the PDF properties before
                      download.
                    </li>
                    <li>
                      All processing stays in the browser, which matches the
                      PDFCraft approach.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.main>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
