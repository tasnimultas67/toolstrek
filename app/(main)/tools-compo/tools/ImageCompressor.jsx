"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import JSZip from "jszip";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileArchive,
  Image as ImageIcon,
  ImageDown,
  Loader2,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import { useRecentTools } from "@/hooks/useRecentTools";

const TOOL_META = {
  title: "Image Compressor",
  link: "/tools/image-compressor",
  description:
    "Compress JPG, PNG, WebP and AVIF images in your browser with target-size, quality and dimension controls — no artificial batch or per-file limits.",
  icon: "ImageDown",
  keywords: [
    "image compressor",
    "compress image",
    "reduce image size",
    "bulk image compressor",
  ],
  categories: ["Media", "Productivity"],
};

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const MIN_TARGET_KB = 10;
const MAX_TARGET_KB = 50 * 1024;
const MAX_DIMENSION = 10_000;

const FORMAT_OPTIONS = [
  { value: "original", label: "Same as original", mime: null },
  { value: "jpeg", label: "JPEG (smallest, no transparency)", mime: "image/jpeg" },
  { value: "webp", label: "WebP (small, keeps transparency)", mime: "image/webp" },
  { value: "png", label: "PNG (lossless, largest)", mime: "image/png" },
];

const TARGET_PRESETS = [
  { label: "50 KB", size: "50", unit: "KB" },
  { label: "100 KB", size: "100", unit: "KB" },
  { label: "200 KB", size: "200", unit: "KB" },
  { label: "500 KB", size: "500", unit: "KB" },
  { label: "1 MB", size: "1", unit: "MB" },
];

const DIMENSION_PRESETS = [
  { label: "Original", value: "0" },
  { label: "1280 px", value: "1280" },
  { label: "1920 px", value: "1920" },
  { label: "2560 px", value: "2560" },
  { label: "3840 px", value: "3840" },
];

const MIME_EXTENSION = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MIME_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

const ENCODE_SUPPORT_CACHE = new Map();

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 2)} ${units[index]}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const MEGABYTE = 1024 * 1024;

function getBatchConcurrency(queue) {
  const totalBytes = queue.reduce(
    (sum, item) => sum + (item.originalSize || 0),
    0,
  );
  const largestFile = queue.reduce(
    (largest, item) => Math.max(largest, item.originalSize || 0),
    0,
  );

  // Large photo queues are processed one at a time so the browser never has
  // to keep multiple full-resolution decodes and canvases alive at once.
  if (largestFile > 8 * MEGABYTE || totalBytes > 64 * MEGABYTE) return 1;
  return 2;
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isSupportedImage(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const typeOk =
    !file.type ||
    file.type.startsWith("image/") ||
    file.type === "application/octet-stream";
  return typeOk && ACCEPTED_EXTENSIONS.includes(extension);
}

function normalizeImageFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const expectedType = MIME_BY_EXTENSION[extension];
  if (!expectedType || file.type === expectedType) return file;

  // Files from some operating systems and Android apps arrive with an empty
  // or non-standard MIME type (for example image/jpg). The compressor rejects
  // those before it ever reaches the browser decoder, so normalize from the
  // extension while keeping the original bytes and filename.
  return new File([file], file.name, {
    type: expectedType,
    lastModified: file.lastModified || Date.now(),
  });
}

function supportsCanvasMime(mime) {
  if (!mime || typeof document === "undefined") return false;
  if (ENCODE_SUPPORT_CACHE.has(mime)) return ENCODE_SUPPORT_CACHE.get(mime);

  let supported = false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    supported = canvas.toDataURL(mime).startsWith(`data:${mime}`);
  } catch {
    supported = false;
  }

  ENCODE_SUPPORT_CACHE.set(mime, supported);
  return supported;
}

function resolveOutputMime(formatMime, sourceType) {
  if (formatMime) {
    if (supportsCanvasMime(formatMime)) return formatMime;
  } else if (sourceType && supportsCanvasMime(sourceType)) {
    return sourceType;
  }

  // AVIF can often be decoded but not encoded by canvas. Fall back to WebP,
  // then JPEG, so selecting an AVIF source never makes the whole batch fail.
  if (supportsCanvasMime("image/webp")) return "image/webp";
  return "image/jpeg";
}

async function decodeImageFile(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Safari and some hardware-accelerated decoders need the <img> path.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(new Error("The image could not be decoded by this browser."));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compressWithCanvas(file, { maxDimension, mime, quality = 0.82 }) {
  const source = await decodeImageFile(file);
  let canvas;

  try {
    let width = source.width || source.naturalWidth || 0;
    let height = source.height || source.naturalHeight || 0;
    if (!width || !height) {
      throw new Error("The image has no readable dimensions.");
    }

    if (Number.isFinite(maxDimension) && maxDimension >= 100) {
      const scale = Math.min(1, maxDimension / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }

    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", {
      alpha: mime !== "image/jpeg",
    });
    if (!context) throw new Error("The browser could not create a canvas.");

    if (mime === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(source, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, mime, clamp(quality, 0.1, 1)),
    );
    if (!blob || blob.size === 0) {
      throw new Error("The browser could not encode the image.");
    }

    return { blob, mime: blob.type || mime, width, height };
  } finally {
    if (typeof source.close === "function") source.close();
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}

function outputExtension(mime, originalName) {
  if (MIME_EXTENSION[mime]) return MIME_EXTENSION[mime];
  const extension = originalName.split(".").pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : "jpg";
}

function buildOutputName(originalName, mime) {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  return `${base}-compressed.${outputExtension(mime, originalName)}`;
}

function getImageDimensions(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

function friendlyError(error) {
  const name = String(error?.name || "").toLowerCase();
  const rawMessage =
    error?.message || error?.error?.message || error?.reason?.message || "";
  const message = String(rawMessage).toLowerCase();
  const details = `${name} ${message}`.trim();

  if (!details) {
    return "This image could not be decoded. It may be corrupted or use a format this browser does not support.";
  }
  if (details.includes("memory") || details.includes("allocation")) {
    return "This image is too large for your browser memory. Try a smaller file or lower the max dimension.";
  }
  if (
    details.includes("cannot be compressed further") ||
    details.includes("could not reach")
  ) {
    return "The compressor could not reach that target size. Try a larger target or convert to WebP/JPEG.";
  }
  if (
    details.includes("not an image") ||
    details.includes("not an instance of blob") ||
    details.includes("no readable dimensions")
  ) {
    return "This file could not be read as an image. Try selecting the original JPG, PNG, WebP or AVIF file.";
  }
  if (
    details.includes("security") ||
    details.includes("tainted") ||
    details.includes("not allowed")
  ) {
    return "The browser blocked local image processing. Disable strict site restrictions and try again.";
  }
  if (
    details.includes("unsupported") ||
    details.includes("decode") ||
    details.includes("invalid") ||
    details.includes("format") ||
    details.includes("corrupt")
  ) {
    return "This image could not be decoded. Try a JPG, PNG, WebP or AVIF file.";
  }
  return "Compression failed. Try re-saving the image as JPG, PNG, WebP or AVIF, then retry it.";
}

function StatCard({ label, value, hint, accent = "emerald" }) {
  const accentClasses = {
    emerald:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
    sky: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30",
    violet:
      "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30",
    amber:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-4 shadow-sm sm:p-5">
      <span
        className={`inline-flex rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wider sm:text-xs ${accentClasses[accent]}`}
      >
        {label}
      </span>
      <p className="mt-2 text-xl font-black tracking-tight text-gray-900 sm:text-2xl dark:text-white">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default function ImageCompressor() {
  const { addRecentTool } = useRecentTools();
  const fileInputRef = useRef(null);
  const dimensionQueueRef = useRef(Promise.resolve());

  const [items, setItems] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [settings, setSettings] = useState({
    mode: "target",
    targetSize: "200",
    targetUnit: "KB",
    quality: 80,
    maxDimension: "1920",
    format: "original",
  });

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const doneItems = useMemo(
    () => items.filter((item) => item.status === "done" && item.result),
    [items],
  );

  const totals = useMemo(() => {
    const original = doneItems.reduce(
      (sum, item) => sum + item.originalSize,
      0,
    );
    const compressed = doneItems.reduce(
      (sum, item) => sum + item.result.size,
      0,
    );
    const saved = original - compressed;
    return {
      original,
      compressed,
      saved,
      percent: original > 0 ? (saved / original) * 100 : 0,
    };
  }, [doneItems]);

  const overallProgress = useMemo(() => {
    if (!items.length) return 0;
    const total = items.reduce((sum, item) => {
      if (item.status === "done") return sum + 100;
      if (item.status === "processing") return sum + (item.progress || 0);
      return sum;
    }, 0);
    return Math.round(total / items.length);
  }, [items]);

  // Keep queue and settings locked during batch compression and single retries.
  const busy =
    processing || items.some((item) => item.status === "processing");

  const setSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const addFiles = useCallback(
    (fileList) => {
      if (busy) {
        toast.error("Wait for the current compression to finish before adding more images.");
        return;
      }

      const incoming = Array.from(fileList || []);
      if (!incoming.length) return;

      const accepted = [];
      let rejectedType = 0;

      incoming.forEach((file) => {
        if (!isSupportedImage(file)) {
          rejectedType += 1;
          return;
        }
        accepted.push(normalizeImageFile(file));
      });

      if (rejectedType) {
        toast.error(
          `${rejectedType} file${rejectedType === 1 ? " was" : "s were"} skipped. Use JPG, PNG, WebP or AVIF images.`,
        );
      }
      if (!accepted.length) return;

      const newItems = accepted.map((file) => ({
        id: makeId(),
        file,
        name: file.name,
        originalSize: file.size,
        originalUrl: URL.createObjectURL(file),
        originalType: file.type || "image/jpeg",
        width: 0,
        height: 0,
        status: "ready",
        progress: 0,
        error: null,
        result: null,
        resultUrl: null,
        outputName: "",
        keptOriginal: false,
      }));

      setItems((current) => [...current, ...newItems]);
      toast.success(
        `${newItems.length} image${newItems.length === 1 ? "" : "s"} added.`,
      );

      // Read dimensions one file at a time. Decoding nine phone photos in
      // parallel creates a large memory spike before compression even starts.
      dimensionQueueRef.current = newItems.reduce(
        (queue, item) =>
          queue.then(async () => {
            const dimensions = await getImageDimensions(item.file);
            setItems((current) =>
              current.map((entry) =>
                entry.id === item.id ? { ...entry, ...dimensions } : entry,
              ),
            );
          }),
        dimensionQueueRef.current.catch(() => {}),
      );
    },
    [busy],
  );

  const removeItem = (id) => {
    if (busy) return;
    const target = items.find((item) => item.id === id);
    if (target) {
      if (target.originalUrl) URL.revokeObjectURL(target.originalUrl);
      if (target.resultUrl) URL.revokeObjectURL(target.resultUrl);
    }
    setItems((current) => current.filter((item) => item.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const clearAll = () => {
    if (busy) return;
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    setItems([]);
    setExpandedId(null);
    toast.info("Image queue cleared.");
  };

  const validateSettings = useCallback(() => {
    if (settings.mode === "target") {
      const target = Number(settings.targetSize);
      if (!Number.isFinite(target) || target <= 0) {
        return "Enter a valid target file size.";
      }
      const targetKb =
        settings.targetUnit === "MB" ? target * 1024 : target;
      if (targetKb < MIN_TARGET_KB) {
        return `Choose a target of at least ${MIN_TARGET_KB} KB.`;
      }
      if (targetKb > MAX_TARGET_KB) {
        return "Choose a target below 50 MB.";
      }
    }

    if (settings.mode === "quality") {
      const quality = Number(settings.quality);
      if (!Number.isFinite(quality) || quality < 5 || quality > 100) {
        return "Quality must be between 5 and 100.";
      }
    }

    if (settings.maxDimension !== "" && settings.maxDimension !== "0") {
      const dimension = Number(settings.maxDimension);
      if (
        !Number.isFinite(dimension) ||
        dimension < 100 ||
        dimension > MAX_DIMENSION
      ) {
        return `Max dimension must be 0 (original) or between 100 and ${MAX_DIMENSION} px.`;
      }
    }

    return null;
  }, [settings]);

  const compressOne = useCallback(
    async (item) => {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "processing", progress: 0, error: null }
            : entry,
        ),
      );

      try {
        const { default: imageCompression } = await import(
          "browser-image-compression"
        );

        const format = FORMAT_OPTIONS.find(
          (option) => option.value === settings.format,
        );
        const maxDimension = Number(settings.maxDimension);
        const hasDimensionLimit =
          Number.isFinite(maxDimension) &&
          maxDimension >= 100 &&
          maxDimension <= MAX_DIMENSION;
        let outputMime = resolveOutputMime(format?.mime, item.originalType);
        const quality = clamp(Number(settings.quality) / 100, 0.05, 1);

        let sourceWidth = item.width;
        let sourceHeight = item.height;
        if (!sourceWidth || !sourceHeight) {
          const dimensions = await getImageDimensions(item.file);
          sourceWidth = dimensions.width;
          sourceHeight = dimensions.height;
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, ...dimensions } : entry,
            ),
          );
        }

        const targetKb =
          settings.mode === "target"
            ? Number(settings.targetSize) *
              (settings.targetUnit === "MB" ? 1024 : 1)
            : null;

        const options = {
          useWebWorker: true,
          maxIteration: 10,
          preserveExif: false,
          fileType: outputMime,
          onProgress: (progress) => {
            setItems((current) =>
              current.map((entry) =>
                entry.id === item.id
                  ? {
                      ...entry,
                      progress: clamp(Math.round(progress), 0, 99),
                    }
                  : entry,
              ),
            );
          },
        };

        if (settings.mode === "target") {
          options.maxSizeMB = targetKb / 1024;
        } else {
          options.initialQuality = quality;
        }

        if (hasDimensionLimit) {
          options.maxWidthOrHeight = maxDimension;
        }

        let output;
        try {
          output = await imageCompression(item.file, options);
        } catch (workerError) {
          // Web workers can be blocked by strict browser policies and the
          // library can reject a valid file on some platforms. Retry on the
          // main thread, then use a native canvas encoder as a final fallback
          // so one problematic file cannot take down the whole batch.
          console.warn(
            "Worker compression failed, retrying on the main thread.",
            workerError,
          );
          try {
            output = await imageCompression(item.file, {
              ...options,
              useWebWorker: false,
            });
          } catch (mainThreadError) {
            console.warn(
              "Library compression failed, using the native canvas fallback.",
              mainThreadError,
            );
            const fallback = await compressWithCanvas(item.file, {
              maxDimension: hasDimensionLimit ? maxDimension : null,
              mime: outputMime,
              quality: settings.mode === "quality" ? quality : 0.8,
            });
            output = fallback.blob;
            outputMime = fallback.mime || outputMime;
          }
        }

        if (!output || output.size === 0) {
          throw new Error("The compressor returned an empty file.");
        }

        const actualOutputMime = output.type || outputMime || item.originalType;
        const requestedConversion = actualOutputMime !== item.originalType;
        // Only treat the dimension setting as a real resize when the source is
        // actually larger (or its dimensions are not known yet). The library
        // never upscales, so a re-encode of an already-small image can
        // otherwise inflate its file size.
        const needsResize =
          hasDimensionLimit &&
          (sourceWidth === 0 ||
            sourceHeight === 0 ||
            sourceWidth > maxDimension ||
            sourceHeight > maxDimension);

        let keptOriginal = false;
        if (
          !requestedConversion &&
          !needsResize &&
          output.size >= item.file.size
        ) {
          output = item.file;
          keptOriginal = true;
        }

        const dimensions = await getImageDimensions(output);
        const resultUrl = URL.createObjectURL(output);
        const outputName = buildOutputName(item.name, actualOutputMime);

        if (item.resultUrl) {
          URL.revokeObjectURL(item.resultUrl);
        }

        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: "done",
                  progress: 100,
                  error: null,
                  keptOriginal,
                  resultUrl,
                  outputName,
                  result: {
                    blob: output,
                    size: output.size,
                    type: actualOutputMime,
                    width: dimensions.width,
                    height: dimensions.height,
                  },
                }
              : entry,
          ),
        );

        return true;
      } catch (error) {
        console.error("Image compression failed:", error);
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: "error",
                  progress: 0,
                  error: friendlyError(error),
                }
              : entry,
          ),
        );
        return false;
      }
    },
    [settings],
  );

  const compressAll = async () => {
    if (!items.length || busy) return;
    const validationError = validateSettings();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setProcessing(true);

    // Let any in-flight dimension reads finish before compression starts, so
    // the batch does not decode the same photos twice at the same time.
    await dimensionQueueRef.current.catch(() => {});

    const queue = [...items];
    let cursor = 0;
    let success = 0;
    let failed = 0;
    const concurrency = getBatchConcurrency(queue);

    const worker = async () => {
      while (cursor < queue.length) {
        const item = queue[cursor];
        cursor += 1;
        const ok = await compressOne(item);
        if (ok) success += 1;
        else failed += 1;
      }
    };

    try {
      await Promise.all(
        Array.from({ length: concurrency }, () => worker()),
      );
    } finally {
      setProcessing(false);
    }

    if (success && !failed) {
      toast.success(
        `${success} image${success === 1 ? "" : "s"} compressed successfully.`,
      );
    } else if (success && failed) {
      toast.error(
        `${success} image${success === 1 ? "" : "s"} compressed, ${failed} failed. Check the cards below.`,
      );
    } else if (failed) {
      toast.error(
        "Compression failed. Check the file format and your settings, then try again.",
      );
    }
  };

  const downloadZip = async () => {
    if (!doneItems.length || zipping) return;
    setZipping(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const usedNames = new Set();

      doneItems.forEach((item) => {
        if (!item.result?.blob) return;

        let name = item.outputName || buildOutputName(item.name, item.result.type);
        if (usedNames.has(name)) {
          const dot = name.lastIndexOf(".");
          const base = dot > 0 ? name.slice(0, dot) : name;
          const extension = dot > 0 ? name.slice(dot) : "";
          let index = 2;
          while (usedNames.has(`${base}-${index}${extension}`)) index += 1;
          name = `${base}-${index}${extension}`;
        }
        usedNames.add(name);
        zip.file(name, item.result.blob);
      });

      const archive = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        },
        (metadata) => setZipProgress(Math.round(metadata.percent)),
      );

      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      link.href = url;
      link.download = "toolstrek-compressed-images.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(
        `ZIP created with ${doneItems.length} compressed image${doneItems.length === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      console.error("ZIP creation failed:", error);
      toast.error("Could not build the ZIP archive. Try downloading the images individually.");
    } finally {
      setZipping(false);
      setZipProgress(0);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    if (!busy) addFiles(event.dataTransfer.files);
  };

  const handleFileInput = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const activeFormat = FORMAT_OPTIONS.find(
    (option) => option.value === settings.format,
  );

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BackButton className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:bg-gray-800" />
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Image &amp; Media Tools
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 sm:inline-flex dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            100% local processing
          </span>
          <FavoriteButton
            tool={TOOL_META}
            className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 sm:text-sm dark:bg-emerald-950/40 dark:text-emerald-300">
          <ImageDown className="h-3.5 w-3.5" />
          Free Image Compressor
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
          Compress images{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            without the upload.
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
          Hit an exact file-size target or fine-tune quality and dimensions for
          JPG, PNG, WebP and AVIF images. Batch-compress as many photos as your
          browser can handle and download them individually or as one ZIP —
          everything happens in your browser.
        </p>
      </div>

      {doneItems.length > 0 ? (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Compressed"
            value={doneItems.length}
            hint={`${items.length} in queue`}
          />
          <StatCard
            label="Original size"
            value={formatBytes(totals.original)}
            hint="Before compression"
            accent="sky"
          />
          <StatCard
            label="New size"
            value={formatBytes(totals.compressed)}
            hint="After compression"
            accent="violet"
          />
          <StatCard
            label={totals.saved >= 0 ? "Space saved" : "Size increase"}
            value={formatBytes(Math.abs(totals.saved))}
            hint={`${Math.abs(totals.percent).toFixed(1)}% ${totals.saved >= 0 ? "smaller" : "larger"}`}
            accent="amber"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-24 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/40">
            <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-gray-900 sm:text-base dark:text-white">
              Compression settings
            </h2>
          </div>

          <fieldset
            disabled={busy}
            className="m-0 min-w-0 space-y-5 border-0 p-5 disabled:opacity-60"
          >
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 sm:text-sm dark:text-gray-400">
                Compression mode
              </span>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setSetting("mode", "target")}
                  aria-pressed={settings.mode === "target"}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:py-2.5 sm:text-sm ${
                    settings.mode === "target"
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-gray-900 dark:text-emerald-300"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Target size
                </button>
                <button
                  type="button"
                  onClick={() => setSetting("mode", "quality")}
                  aria-pressed={settings.mode === "quality"}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:py-2.5 sm:text-sm ${
                    settings.mode === "quality"
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-gray-900 dark:text-emerald-300"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  Quality
                </button>
              </div>
            </div>

            {settings.mode === "target" ? (
              <div>
                <label
                  htmlFor="target-size"
                  className="mb-1.5 block text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300"
                >
                  Target file size
                </label>
                <div className="flex gap-2">
                  <input
                    id="target-size"
                    type="number"
                    min="1"
                    step="1"
                    value={settings.targetSize}
                    onChange={(event) =>
                      setSetting("targetSize", event.target.value)
                    }
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold sm:text-base text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />
                  <select
                    aria-label="Target size unit"
                    value={settings.targetUnit}
                    onChange={(event) =>
                      setSetting("targetUnit", event.target.value)
                    }
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold sm:text-base text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                  >
                    <option value="KB">KB</option>
                    <option value="MB">MB</option>
                  </select>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TARGET_PRESETS.map((preset) => {
                    const active =
                      settings.targetSize === preset.size &&
                      settings.targetUnit === preset.unit;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setSetting("targetSize", preset.size);
                          setSetting("targetUnit", preset.unit);
                        }}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition sm:px-3 sm:py-1.5 sm:text-sm ${
                          active
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="quality"
                    className="text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300"
                  >
                    Output quality
                  </label>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 sm:text-sm dark:bg-emerald-950/40 dark:text-emerald-300">
                    {settings.quality}%
                  </span>
                </div>
                <input
                  id="quality"
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={settings.quality}
                  onChange={(event) =>
                    setSetting("quality", Number(event.target.value))
                  }
                  className="h-2 w-full cursor-pointer accent-emerald-600"
                />
                <div className="mt-1 flex justify-between text-[11px] sm:text-xs font-medium uppercase tracking-wide text-gray-400">
                  <span>Smaller</span>
                  <span>Better quality</span>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="max-dimension"
                className="mb-1.5 block text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300"
              >
                Max width / height
              </label>
              <input
                id="max-dimension"
                type="number"
                min="0"
                max={MAX_DIMENSION}
                step="1"
                value={settings.maxDimension}
                onChange={(event) =>
                  setSetting("maxDimension", event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold sm:text-base text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DIMENSION_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setSetting("maxDimension", preset.value)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition sm:px-3 sm:py-1.5 sm:text-sm ${
                      settings.maxDimension === preset.value
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-gray-400 dark:text-gray-500">
                Use 0 to keep the original dimensions. Aspect ratio is always preserved.
              </p>
            </div>

            <div>
              <label
                htmlFor="output-format"
                className="mb-1.5 block text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300"
              >
                Output format
              </label>
              <select
                id="output-format"
                value={settings.format}
                onChange={(event) => setSetting("format", event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold sm:text-base text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
              >
                {FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {activeFormat?.value === "png" ? (
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-amber-600 dark:text-amber-400">
                  PNG is lossless, so target-size compression works best with JPEG or WebP.
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs sm:text-sm leading-relaxed text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
              <div className="mb-1 flex items-center gap-1.5 font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                Privacy built in
              </div>
              Files never leave your device. Re-encoding also removes EXIF and GPS metadata.
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={compressAll}
                disabled={!items.length || busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:py-3.5 sm:text-base disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Compressing… {overallProgress}%
                  </>
                ) : doneItems.length ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Recompress all ({items.length})
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Compress {items.length ? `${items.length} ` : ""}
                    image{items.length === 1 ? "" : "s"}
                  </>
                )}
              </button>

              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-rose-600 sm:py-3 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear all images
                </button>
              ) : null}
            </div>
          </fieldset>
        </aside>

        <div className="space-y-4">
          <div
            role="button"
            tabIndex={busy ? -1 : 0}
            aria-label="Add images to compress"
            aria-disabled={busy}
            onClick={() => {
              if (!busy) fileInputRef.current?.click();
            }}
            onKeyDown={(event) => {
              if (busy) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!busy) setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
              dragActive
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                : "border-gray-300 bg-white/70 hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-gray-700 dark:bg-gray-900/70 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/10"
            } ${busy ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold text-gray-800 sm:text-base dark:text-gray-100">
              Drop images here or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              JPG, PNG, WebP or AVIF · no batch or file-size limits · add as many as your browser can handle
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm sm:px-4 sm:py-2.5 sm:text-sm">
              <ImageIcon className="h-3.5 w-3.5" />
              Choose images
            </span>
          </div>

          {items.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 sm:text-base dark:text-white">
                  Your images ({items.length})
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {doneItems.length} compressed ·{" "}
                  {totals.saved >= 0
                    ? `${formatBytes(totals.saved)} saved`
                    : `${formatBytes(-totals.saved)} larger`}
                </p>
              </div>
              <button
                type="button"
                onClick={downloadZip}
                disabled={!doneItems.length || zipping || busy}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 sm:px-4 sm:py-2.5 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {zipping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileArchive className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
                {zipping ? `Zipping ${zipProgress}%` : "Download ZIP"}
              </button>
            </div>
          ) : null}

          <div className="space-y-3">
            {items.map((item) => {
              const reduction =
                item.result && item.originalSize > 0
                  ? ((item.originalSize - item.result.size) / item.originalSize) * 100
                  : 0;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex gap-3 p-4">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((current) =>
                          current === item.id ? null : item.id,
                        )
                      }
                      disabled={item.status !== "done"}
                      className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 disabled:cursor-default dark:border-gray-800 dark:bg-gray-950"
                      title={
                        item.status === "done"
                          ? "Toggle before / after preview"
                          : "Compress this image to compare before and after"
                      }
                      aria-label={`Preview ${item.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview; next/image adds no benefit */}
                      <img
                        src={item.originalUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className="truncate text-sm font-bold text-gray-900 sm:text-base dark:text-white"
                            title={item.name}
                          >
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {formatBytes(item.originalSize)}
                            {item.width && item.height
                              ? ` · ${item.width} × ${item.height} px`
                              : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={busy}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {item.status === "ready" ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Ready to compress
                        </div>
                      ) : null}

                      {item.status === "processing" ? (
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                            <span className="inline-flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Compressing
                            </span>
                            <span>{item.progress || 0}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${item.progress || 2}%` }}
                            />
                          </div>
                        </div>
                      ) : null}

                      {item.status === "error" ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {item.error}
                          </span>
                          <button
                            type="button"
                            onClick={() => compressOne(item)}
                            disabled={busy}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-600 transition hover:bg-gray-50 sm:px-2.5 sm:py-1.5 sm:text-xs disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            Retry
                          </button>
                        </div>
                      ) : null}

                      {item.status === "done" && item.result ? (
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                          <span className="inline-flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            {formatBytes(item.result.size)}
                          </span>
                          <span className="text-gray-400">
                            from {formatBytes(item.originalSize)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-bold ${
                              reduction > 0
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                            }`}
                          >
                            {item.keptOriginal
                              ? "Already optimized"
                              : reduction > 0
                                ? `−${reduction.toFixed(1)}%`
                                : "No reduction"}
                          </span>
                          {item.result.width && item.result.height ? (
                            <span className="text-gray-400">
                              {item.result.width} × {item.result.height} px
                            </span>
                          ) : null}
                          <a
                            href={item.resultUrl}
                            download={item.outputName}
                            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs sm:text-sm font-bold text-white transition hover:bg-emerald-700"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {expandedId === item.id && item.status === "done" ? (
                    <div className="grid grid-cols-2 gap-3 border-t border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-950/30">
                      <figure>
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                          <img
                            src={item.originalUrl}
                            alt={`Original preview of ${item.name}`}
                            className="h-32 w-full object-contain"
                          />
                        </div>
                        <figcaption className="mt-1.5 text-center text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
                          Original · {formatBytes(item.originalSize)}
                        </figcaption>
                      </figure>
                      <figure>
                        <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-gray-900">
                          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                          <img
                            src={item.resultUrl}
                            alt={`Compressed preview of ${item.name}`}
                            className="h-32 w-full object-contain"
                          />
                        </div>
                        <figcaption className="mt-1.5 text-center text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          Compressed · {formatBytes(item.result.size)}
                        </figcaption>
                      </figure>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 py-10 text-center dark:border-gray-800 dark:bg-gray-900/40">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <ImageDown className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700 sm:text-base dark:text-gray-200">
                Your compressed images will appear here
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500 sm:text-sm dark:text-gray-400">
                Add a few photos, choose a target size or quality level, then
                hit compress. Metadata is stripped automatically for extra privacy.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/60">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-xs font-bold text-gray-800 sm:text-sm dark:text-gray-100">
            Private by design
          </p>
          <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            ToolsTrek compresses images with Web Workers and the Canvas API
            inside your browser. Nothing is uploaded, logged or stored. The
            compressed files are created as temporary blob URLs and discarded
            when you leave or clear the page.
          </p>
        </div>
      </div>
    </ToolPageShell>
  );
}
