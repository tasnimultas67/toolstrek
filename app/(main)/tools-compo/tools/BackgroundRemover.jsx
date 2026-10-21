"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eraser,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Loader2,
  Palette,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import { useRecentTools } from "@/hooks/useRecentTools";

const TOOL_META = {
  title: "Background Remover",
  link: "/tools/background-remover",
  description:
    "Remove image backgrounds with an AI portrait model or a precise colour key, then add transparent, solid, gradient, blurred or custom backdrops and export in PNG, WebP or JPEG.",
  icon: "Eraser",
  keywords: [
    "background remover",
    "remove background",
    "transparent background",
    "cutout image",
    "ai background remover",
  ],
  categories: ["Media", "Design"],
};

const DEFAULT_SETTINGS = {
  mode: "ai",
  quality: "fast",
  feather: 2,
  contrast: 1,
  edgeShift: 0,
  despill: 18,
  keyColor: "#f1f5f9",
  tolerance: 38,
  softness: 24,
  background: "transparent",
  color1: "#ffffff",
  color2: "#c7d2fe",
  gradientAngle: 135,
  blurAmount: 18,
  shadow: false,
  shadowOpacity: 28,
  shadowBlur: 24,
  shadowOffset: 12,
  padding: 4,
  ratio: "original",
  subjectScale: 100,
  offsetX: 0,
  offsetY: 0,
  format: "png",
  exportScale: 1,
};

const BACKGROUNDS = [
  { value: "transparent", label: "Transparent", icon: Eraser },
  { value: "solid", label: "Solid colour", icon: Palette },
  { value: "gradient", label: "Gradient", icon: Layers },
  { value: "blurred", label: "Blurred original", icon: ImageIcon },
  { value: "custom", label: "Custom image", icon: ImagePlus },
];

const RATIOS = [
  { value: "original", label: "Original" },
  { value: "1:1", label: "Square 1:1" },
  { value: "4:5", label: "Portrait 4:5" },
  { value: "16:9", label: "Landscape 16:9" },
  { value: "9:16", label: "Story 9:16" },
];

const FORMATS = [
  { value: "png", label: "PNG", mime: "image/png", supportsAlpha: true },
  { value: "webp", label: "WebP", mime: "image/webp", supportsAlpha: true },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg", supportsAlpha: false },
];

const MAX_SOURCE_SIDE = 3200;
let loadedPipeline = null;
let loadedPipelineQuality = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function slugify(value, fallback = "cutout") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || fallback;
}

function hexToRgb(hex) {
  const normalized = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image could not be decoded."));
    image.src = src;
  });
}

async function decodeImageFile(file) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close?.(),
      };
    } catch {
      // Fall through to the image element path for older browsers.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageElement(url);
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => {},
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawCover(context, image, width, height) {
  const imageWidth = image.width || image.naturalWidth || 1;
  const imageHeight = image.height || image.naturalHeight || 1;
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function getBaseDimensions(width, height, ratio) {
  if (ratio === "original") return { width, height };
  if (ratio === "1:1") {
    const side = Math.max(width, height);
    return { width: side, height: side };
  }

  const [ratioWidth, ratioHeight] = ratio.split(":").map(Number);
  const target = ratioWidth / ratioHeight;
  if (target >= 1) {
    const canvasWidth = Math.max(width, height * target);
    return { width: canvasWidth, height: canvasWidth / target };
  }
  const canvasHeight = Math.max(height, width / target);
  return { width: canvasHeight * target, height: canvasHeight };
}

function sampleCornerColor(canvas) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "#ffffff";
  const points = [
    [0, 0],
    [canvas.width - 1, 0],
    [0, canvas.height - 1],
    [canvas.width - 1, canvas.height - 1],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  const size = Math.max(2, Math.min(12, Math.floor(Math.min(canvas.width, canvas.height) / 30)));
  points.forEach(([x, y]) => {
    const startX = clamp(x - size, 0, Math.max(0, canvas.width - size * 2));
    const startY = clamp(y - size, 0, Math.max(0, canvas.height - size * 2));
    const data = context.getImageData(startX, startY, size * 2, size * 2).data;
    for (let index = 0; index < data.length; index += 4) {
      r += data[index];
      g += data[index + 1];
      b += data[index + 2];
      count += 1;
    }
  });
  if (!count) return "#ffffff";
  return rgbToHex(r / count, g / count, b / count);
}

function applyColorKey(sourceCanvas, keyColor, tolerance, softness) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const sourceContext = sourceCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  const outputContext = output.getContext("2d");
  if (!sourceContext || !outputContext) {
    throw new Error("Canvas processing is not available in this browser.");
  }

  const imageData = sourceContext.getImageData(0, 0, width, height);
  const data = imageData.data;
  const key = hexToRgb(keyColor);
  const inner = clamp(Number(tolerance) || 0, 0, 255);
  const fade = Math.max(1, Number(softness) || 1);
  const outer = inner + fade;

  for (let index = 0; index < data.length; index += 4) {
    const distance = Math.sqrt(
      (data[index] - key.r) ** 2 +
        (data[index + 1] - key.g) ** 2 +
        (data[index + 2] - key.b) ** 2,
    );
    if (distance <= inner) {
      data[index + 3] = 0;
    } else if (distance < outer) {
      const amount = (distance - inner) / fade;
      data[index + 3] = Math.round(data[index + 3] * amount);
    }
  }

  outputContext.putImageData(imageData, 0, 0);
  return output;
}

function boxBlurAlpha(alpha, width, height, radius) {
  if (radius <= 0) return alpha;
  const temp = new Float32Array(alpha.length);
  const windowSize = radius * 2 + 1;

  for (let y = 0; y < height; y += 1) {
    let sum = 0;
    const row = y * width;
    for (let x = -radius; x <= radius; x += 1) {
      sum += alpha[row + clamp(x, 0, width - 1)];
    }
    for (let x = 0; x < width; x += 1) {
      temp[row + x] = sum / windowSize;
      sum -= alpha[row + clamp(x - radius, 0, width - 1)];
      sum += alpha[row + clamp(x + radius + 1, 0, width - 1)];
    }
  }

  for (let x = 0; x < width; x += 1) {
    let sum = 0;
    for (let y = -radius; y <= radius; y += 1) {
      sum += temp[clamp(y, 0, height - 1) * width + x];
    }
    for (let y = 0; y < height; y += 1) {
      alpha[y * width + x] = sum / windowSize;
      sum -= temp[clamp(y - radius, 0, height - 1) * width + x];
      sum += temp[clamp(y + radius + 1, 0, height - 1) * width + x];
    }
  }

  return alpha;
}

function applyAlphaEffects(rawCanvas, settings) {
  const width = rawCanvas.width;
  const height = rawCanvas.height;
  const rawContext = rawCanvas.getContext("2d", { willReadFrequently: true });
  if (!rawContext) return rawCanvas;
  const imageData = rawContext.getImageData(0, 0, width, height);
  const data = imageData.data;
  const alpha = new Float32Array(width * height);

  for (let pixel = 0; pixel < alpha.length; pixel += 1) {
    alpha[pixel] = data[pixel * 4 + 3];
  }

  const feather = Math.round(clamp(Number(settings.feather) || 0, 0, 14));
  if (feather > 0) boxBlurAlpha(alpha, width, height, feather);

  const contrast = clamp(Number(settings.contrast) || 1, 0.4, 3);
  const edgeShift = clamp(Number(settings.edgeShift) || 0, -12, 12) * 9;
  const despill = clamp(Number(settings.despill) || 0, 0, 100) / 100;

  for (let pixel = 0; pixel < alpha.length; pixel += 1) {
    let value = (alpha[pixel] / 255 - 0.5) * contrast + 0.5;
    value = value * 255 + edgeShift;
    value = clamp(value, 0, 255);
    const index = pixel * 4;
    data[index + 3] = Math.round(value);

    if (despill > 0 && value > 1 && value < 254) {
      const luminance =
        data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
      const edgeAmount = despill * (1 - Math.abs(value / 255 - 0.5) * 1.35);
      if (edgeAmount > 0) {
        data[index] = Math.round(data[index] * (1 - edgeAmount) + luminance * edgeAmount);
        data[index + 1] = Math.round(data[index + 1] * (1 - edgeAmount) + luminance * edgeAmount);
        data[index + 2] = Math.round(data[index + 2] * (1 - edgeAmount) + luminance * edgeAmount);
      }
    }
  }

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  output.getContext("2d").putImageData(imageData, 0, 0);
  return output;
}

function buildCompositeCanvas({
  sourceCanvas,
  cutoutCanvas,
  settings,
  customBackground,
  scale = 1,
  forceOpaque = false,
}) {
  const base = getBaseDimensions(
    sourceCanvas.width,
    sourceCanvas.height,
    settings.ratio,
  );
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(base.width * scale));
  output.height = Math.max(1, Math.round(base.height * scale));
  const context = output.getContext("2d");
  if (!context) throw new Error("Canvas rendering is not available.");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.scale(scale, scale);
  const width = base.width;
  const height = base.height;
  const transparent =
    settings.background === "transparent" && !forceOpaque;
  const solidColor =
    settings.background === "solid" || transparent ? settings.color1 : null;

  if (!transparent) {
    if (settings.background === "solid" || settings.background === "transparent") {
      context.fillStyle = solidColor || "#ffffff";
      context.fillRect(0, 0, width, height);
    } else if (settings.background === "gradient") {
      const angle = (Number(settings.gradientAngle) * Math.PI) / 180;
      const length = Math.hypot(width, height);
      const x = Math.cos(angle) * length * 0.5;
      const y = Math.sin(angle) * length * 0.5;
      const gradient = context.createLinearGradient(
        width / 2 - x,
        height / 2 - y,
        width / 2 + x,
        height / 2 + y,
      );
      gradient.addColorStop(0, settings.color1);
      gradient.addColorStop(1, settings.color2);
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    } else if (settings.background === "blurred") {
      context.save();
      context.filter = `blur(${Math.max(0, Number(settings.blurAmount) || 0) * scale}px) saturate(1.05)`;
      drawCover(context, sourceCanvas, width, height);
      context.restore();
      context.fillStyle = `rgba(15,23,42,${clamp(Number(settings.blurAmount) / 80, 0, 0.25)})`;
      context.fillRect(0, 0, width, height);
    } else if (settings.background === "custom" && customBackground) {
      context.fillStyle = "#f8fafc";
      context.fillRect(0, 0, width, height);
      drawCover(context, customBackground, width, height);
    } else {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
  }

  const padding = (Math.min(width, height) * clamp(Number(settings.padding) || 0, 0, 30)) / 100;
  const availableWidth = Math.max(1, width - padding * 2);
  const availableHeight = Math.max(1, height - padding * 2);
  const fit = Math.min(
    availableWidth / cutoutCanvas.width,
    availableHeight / cutoutCanvas.height,
  );
  const subjectScale = clamp(Number(settings.subjectScale) || 100, 50, 140) / 100;
  const drawWidth = cutoutCanvas.width * fit * subjectScale;
  const drawHeight = cutoutCanvas.height * fit * subjectScale;
  const offsetX = (clamp(Number(settings.offsetX) || 0, -45, 45) / 100) * width;
  const offsetY = (clamp(Number(settings.offsetY) || 0, -45, 45) / 100) * height;
  const drawX = (width - drawWidth) / 2 + offsetX;
  const drawY = (height - drawHeight) / 2 + offsetY;

  if (settings.shadow) {
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = Math.round(width * scale);
    shadowCanvas.height = Math.round(height * scale);
    const shadowContext = shadowCanvas.getContext("2d");
    if (shadowContext) {
      shadowContext.scale(scale, scale);
      shadowContext.shadowColor = `rgba(15,23,42,${clamp(Number(settings.shadowOpacity) / 100, 0, 0.7)})`;
      shadowContext.shadowBlur = Math.max(0, Number(settings.shadowBlur) || 0) * scale;
      shadowContext.shadowOffsetY = (Number(settings.shadowOffset) || 0) * scale;
      shadowContext.drawImage(cutoutCanvas, drawX, drawY, drawWidth, drawHeight);
      context.drawImage(shadowCanvas, 0, 0, width, height);
    }
  }

  context.drawImage(cutoutCanvas, drawX, drawY, drawWidth, drawHeight);
  return output;
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not encode this image format."));
      },
      mime,
      quality,
    );
  });
}

async function loadTransformers() {
  const importer = new Function("url", "return import(url)");
  return importer("/transformers/transformers.min.js");
}

function fallbackPipeline() {
  throw new Error(
    "The AI model could not be loaded. Check your internet connection and try again, or switch to Colour studio mode, which works fully offline.",
  );
}

export default function BackgroundRemover() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceInfo, setSourceInfo] = useState(null);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState("");
  const [cutoutReady, setCutoutReady] = useState(false);
  const [processedRevision, setProcessedRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [busyStage, setBusyStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState("result");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [busyStartedAt, setBusyStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const sourceCanvasRef = useRef(null);
  const rawCutoutRef = useRef(null);
  const cutoutRef = useRef(null);
  const originalFileRef = useRef(null);
  const customBackgroundRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const previewWrapRef = useRef(null);
  const fileInputRef = useRef(null);
  const sourceUrlRef = useRef("");
  const customBackgroundUrlRef = useRef("");
  const { addRecentTool } = useRecentTools();

  const updateSetting = useCallback((key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  useEffect(() => {
    if (!busy) return undefined;
    const timer = window.setInterval(() => {
      setElapsed(Math.max(0, Math.round((Date.now() - busyStartedAt) / 1000)));
    }, 500);
    return () => window.clearInterval(timer);
  }, [busy, busyStartedAt]);

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (customBackgroundUrlRef.current) URL.revokeObjectURL(customBackgroundUrlRef.current);
    };
  }, []);

  const resetOutput = useCallback(() => {
    rawCutoutRef.current = null;
    cutoutRef.current = null;
    setCutoutReady(false);
    setProcessedRevision((value) => value + 1);
    setPreviewMode("result");
    setError("");
  }, []);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/") && !/\.(png|jpe?g|webp|avif|bmp|gif)$/i.test(file.name)) {
        toast.error("Choose a PNG, JPEG, WebP, AVIF, BMP or GIF image.");
        return;
      }
      if (file.size > 40 * 1024 * 1024) {
        toast.error("That image is larger than 40 MB. Resize it first, then try again.");
        return;
      }

      setBusy(true);
      setBusyStartedAt(Date.now());
      setElapsed(0);
      setBusyStage("Decoding image…");
      setProgress(8);
      setError("");
      resetOutput();

      try {
        const decoded = await decodeImageFile(file);
        const ratio = Math.min(
          1,
          MAX_SOURCE_SIDE / Math.max(decoded.width, decoded.height),
        );
        const width = Math.max(1, Math.round(decoded.width * ratio));
        const height = Math.max(1, Math.round(decoded.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas rendering is not available in this browser.");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(decoded.source, 0, 0, width, height);
        decoded.close?.();
        sourceCanvasRef.current = canvas;
        originalFileRef.current = file;

        if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
        const nextUrl = URL.createObjectURL(file);
        sourceUrlRef.current = nextUrl;
        setSourceUrl(nextUrl);
        setSourceName(file.name);
        setSourceInfo({
          width,
          height,
          originalWidth: decoded.width,
          originalHeight: decoded.height,
          bytes: file.size,
          resized: ratio < 1,
        });

        const cornerColor = sampleCornerColor(canvas);
        updateSetting("keyColor", cornerColor);
        setPreviewMode("result");
        setProgress(100);
        toast.success(
          ratio < 1
            ? `${file.name} loaded and optimized to ${width} × ${height}px for stable processing.`
            : `${file.name} loaded.`,
        );
      } catch (fileError) {
        console.error("Image load failed:", fileError);
        setError(
          "That image could not be decoded. Try a different PNG, JPEG or WebP file.",
        );
        toast.error("Could not open that image. Try a different file.");
      } finally {
        setBusy(false);
        setBusyStage("");
        setProgress(0);
      }
    },
    [resetOutput, updateSetting],
  );

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    if (!busy) handleFile(event.dataTransfer.files?.[0]);
  };

  const handleInput = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) handleFile(file);
  };

  const handleCustomBackground = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image for the custom backdrop.");
      return;
    }
    try {
      const url = URL.createObjectURL(file);
      const image = await loadImageElement(url);
      if (customBackgroundUrlRef.current) URL.revokeObjectURL(customBackgroundUrlRef.current);
      customBackgroundUrlRef.current = url;
      customBackgroundRef.current = image;
      setCustomBackgroundUrl(url);
      updateSetting("background", "custom");
      toast.success("Custom backdrop loaded.");
    } catch (backgroundError) {
      console.error("Custom background failed:", backgroundError);
      toast.error("Could not load that background image.");
    }
  };

  const sampleBackgroundColor = () => {
    const canvas = sourceCanvasRef.current;
    if (!canvas) {
      toast.error("Load an image first.");
      return;
    }
    const color = sampleCornerColor(canvas);
    updateSetting("keyColor", color);
    toast.success(`Sampled background colour ${color} from the image corners.`);
  };

  const processColorCutout = async () => {
    const source = sourceCanvasRef.current;
    if (!source) {
      toast.error("Load an image first.");
      return;
    }
    setBusy(true);
    setBusyStartedAt(Date.now());
    setElapsed(0);
    setBusyStage("Separating the background…");
    setProgress(20);
    setError("");
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 30));
      const result = applyColorKey(
        source,
        settings.keyColor,
        settings.tolerance,
        settings.softness,
      );
      rawCutoutRef.current = result;
      setCutoutReady(true);
      setPreviewMode("result");
      setBusyStage("Applying edge refinement…");
      setProgress(75);
      await new Promise((resolve) => window.setTimeout(resolve, 20));
      setProcessedRevision((value) => value + 1);
      setProgress(100);
      toast.success("Background removed with the colour key. Fine-tune the edges or add a backdrop.");
    } catch (processingError) {
      console.error("Colour key failed:", processingError);
      setError("The colour cutout could not finish. Try a smaller image or a different key colour.");
      toast.error("Could not remove the background with this colour key.");
    } finally {
      setBusy(false);
      setBusyStage("");
      setProgress(0);
    }
  };

  const processAiCutout = async () => {
    const source = sourceCanvasRef.current;
    if (!source) {
      toast.error("Load an image first.");
      return;
    }
    setBusy(true);
    setBusyStartedAt(Date.now());
    setElapsed(0);
    setBusyStage("Preparing the portrait AI model…");
    setProgress(3);
    setError("");

    try {
      const transformers = await loadTransformers();
      if (!transformers?.pipeline) {
        fallbackPipeline();
      }

      if (!loadedPipeline || loadedPipelineQuality !== settings.quality) {
        loadedPipeline = await transformers.pipeline(
          "background-removal",
          "Xenova/modnet",
          {
            dtype: settings.quality === "best" ? "fp32" : "q8",
            device: "wasm",
            progress_callback: (event) => {
              if (event?.status === "progress" && Number.isFinite(event.progress)) {
                setBusyStage(
                  `Downloading AI model — ${Math.round(event.progress)}%`,
                );
                setProgress(Math.min(70, Math.round(event.progress * 0.7)));
              } else if (event?.status === "ready") {
                setBusyStage("Model ready — analysing the portrait…");
                setProgress(78);
              } else if (event?.status === "done") {
                setProgress((current) => Math.max(current, 70));
              }
            },
          },
        );
        loadedPipelineQuality = settings.quality;
      }

      setBusyStage("Removing the background with AI…");
      setProgress((current) => Math.max(78, current));
      const rawResult = await loadedPipeline(source);
      const raw = Array.isArray(rawResult) ? rawResult[0] : rawResult;
      if (!raw?.data || !raw?.width || !raw?.height) {
        throw new Error("The AI model returned an empty cutout.");
      }

      const temp = document.createElement("canvas");
      temp.width = raw.width;
      temp.height = raw.height;
      const tempContext = temp.getContext("2d");
      const channels = raw.channels || 4;
      let rgba;
      if (channels === 4) {
        rgba = new Uint8ClampedArray(raw.data.length);
        rgba.set(raw.data);
      } else {
        rgba = new Uint8ClampedArray(raw.width * raw.height * 4);
        for (let pixel = 0; pixel < raw.width * raw.height; pixel += 1) {
          const sourceIndex = pixel * channels;
          rgba[pixel * 4] = raw.data[sourceIndex] ?? 0;
          rgba[pixel * 4 + 1] = raw.data[sourceIndex + 1] ?? 0;
          rgba[pixel * 4 + 2] = raw.data[sourceIndex + 2] ?? 0;
          rgba[pixel * 4 + 3] = channels === 1 ? raw.data[sourceIndex] ?? 0 : 255;
        }
      }
      tempContext.putImageData(
        new ImageData(rgba, raw.width, raw.height),
        0,
        0,
      );

      const cutout = document.createElement("canvas");
      cutout.width = source.width;
      cutout.height = source.height;
      const cutoutContext = cutout.getContext("2d");
      cutoutContext.imageSmoothingEnabled = true;
      cutoutContext.imageSmoothingQuality = "high";
      cutoutContext.clearRect(0, 0, cutout.width, cutout.height);
      cutoutContext.drawImage(temp, 0, 0, cutout.width, cutout.height);

      rawCutoutRef.current = cutout;
      setCutoutReady(true);
      setPreviewMode("result");
      setBusyStage("Refining edges…");
      setProgress(92);
      setProcessedRevision((value) => value + 1);
      setProgress(100);
      toast.success("AI portrait cutout ready. Add a backdrop, refine edges or export.");
      setBusyStage("Cutout ready");
    } catch (aiError) {
      console.error("AI background removal failed:", aiError);
      const message =
        aiError?.message?.includes("fetch") || aiError?.message?.includes("network")
          ? "The AI model could not be downloaded. Check your connection and try again, or use Colour studio mode."
          : "The AI cutout could not finish with this image. Try a smaller photo, or switch to Colour studio mode.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
      setBusyStage("");
      setProgress(0);
    }
  };

  const handleRemove = () => {
    if (settings.mode === "color") processColorCutout();
    else processAiCutout();
  };

  useEffect(() => {
    if (!sourceCanvasRef.current || !cutoutReady) return undefined;
    if (!rawCutoutRef.current) return undefined;
    const timer = window.setTimeout(() => {
      const previewCanvas = previewCanvasRef.current;
      const source = sourceCanvasRef.current;
      if (!previewCanvas || !source || !rawCutoutRef.current) return;
      try {
        const effectiveCutout = applyAlphaEffects(rawCutoutRef.current, settings);
        cutoutRef.current = effectiveCutout;
        const composite = buildCompositeCanvas({
          sourceCanvas: source,
          cutoutCanvas: effectiveCutout,
          settings,
          customBackground: customBackgroundRef.current,
          scale: 1,
          forceOpaque: settings.format === "jpeg" && settings.background === "transparent",
        });
        const maxPreview = 1280;
        const previewScale = Math.min(
          1,
          maxPreview / Math.max(composite.width, composite.height),
        );
        previewCanvas.width = Math.max(1, Math.round(composite.width * previewScale));
        previewCanvas.height = Math.max(1, Math.round(composite.height * previewScale));
        const context = previewCanvas.getContext("2d");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        context.drawImage(composite, 0, 0, previewCanvas.width, previewCanvas.height);
      } catch (previewError) {
        console.error("Preview composition failed:", previewError);
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [
    cutoutReady,
    processedRevision,
    settings,
    settings.background,
    settings.ratio,
    settings.padding,
    settings.subjectScale,
    settings.offsetX,
    settings.offsetY,
    settings.shadow,
    settings.shadowOpacity,
    settings.shadowBlur,
    settings.shadowOffset,
    settings.color1,
    settings.color2,
    settings.gradientAngle,
    settings.blurAmount,
    settings.format,
  ]);

  const handleExport = async () => {
    const source = sourceCanvasRef.current;
    if (!source || !rawCutoutRef.current) {
      toast.error("Remove the background before exporting.");
      return;
    }
    setExporting(true);
    try {
      const cutout = applyAlphaEffects(rawCutoutRef.current, settings);
      const formatMeta =
        FORMATS.find((item) => item.value === settings.format) || FORMATS[0];
      const forceOpaque =
        !formatMeta.supportsAlpha || settings.background === "transparent" && settings.format === "jpeg";
      const output = buildCompositeCanvas({
        sourceCanvas: source,
        cutoutCanvas: cutout,
        settings,
        customBackground: customBackgroundRef.current,
        scale: settings.exportScale,
        forceOpaque,
      });
      const blob = await canvasToBlob(
        output,
        formatMeta.mime,
        settings.format === "png" ? undefined : 0.92,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugify(sourceName)}-toolstrek.${formatMeta.value === "jpeg" ? "jpg" : formatMeta.value}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast.success(
        `${formatMeta.label} cutout downloaded at ${output.width} × ${output.height}px.`,
      );
    } catch (exportError) {
      console.error("Cutout export failed:", exportError);
      toast.error("Could not export the cutout. Try a smaller output scale or PNG format.");
    } finally {
      setExporting(false);
    }
  };

  const resetAll = () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    if (customBackgroundUrlRef.current) URL.revokeObjectURL(customBackgroundUrlRef.current);
    sourceUrlRef.current = "";
    customBackgroundUrlRef.current = "";
    sourceCanvasRef.current = null;
    rawCutoutRef.current = null;
    cutoutRef.current = null;
    originalFileRef.current = null;
    customBackgroundRef.current = null;
    setSourceUrl("");
    setSourceName("");
    setSourceInfo(null);
    setCustomBackgroundUrl("");
    setSettings(DEFAULT_SETTINGS);
    resetOutput();
    toast.success("Studio cleared. Load a new image to start again.");
  };

  const activeBackground = BACKGROUNDS.find(
    (item) => item.value === settings.background,
  );
  const transparentPreview =
    settings.background === "transparent" && previewMode === "result";
  const displayedScale = settings.exportScale;

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BackButton className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:bg-gray-800" />
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            Image &amp; Design Tools
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Images never leave your browser
          </span>
          <FavoriteButton
            tool={TOOL_META}
            className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700 sm:text-sm dark:bg-rose-950/40 dark:text-rose-300">
          <Eraser className="h-3.5 w-3.5" />
          Free Background Remover
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
          Cut out the subject.{" "}
          <span className="text-rose-600 dark:text-rose-400">Design the backdrop.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
          Use a portrait AI model for hair-level detail or a precise colour key for
          products and screenshots. Then build a transparent cutout, studio solid,
          gradient, blurred scene or custom backdrop — with edge, shadow and aspect-ratio controls.
        </p>
      </div>

      {!sourceUrl ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`mx-auto mb-6 max-w-3xl rounded-3xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
            dragActive
              ? "border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/20"
              : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/bmp,image/gif"
            className="sr-only"
            onChange={handleInput}
            aria-label="Upload an image for background removal"
          />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Drop a photo here
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            PNG, JPEG, WebP, AVIF, BMP or GIF up to 40 MB. Images are resized to a
            3200 px working edge for stable in-browser processing.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {busy ? busyStage : "Choose an image"}
          </button>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            No account, no upload and no watermark.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mx-auto mb-5 flex max-w-3xl items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,355px)_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-24 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/40">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <h2 className="text-sm font-bold text-gray-900 sm:text-base dark:text-white">
                Cutout studio
              </h2>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <fieldset disabled={busy} className="m-0 min-w-0 space-y-5 border-0 p-5 disabled:opacity-60">
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Removal method
              </span>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    updateSetting("mode", "ai");
                    resetOutput();
                  }}
                  aria-pressed={settings.mode === "ai"}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:py-2.5 ${
                    settings.mode === "ai"
                      ? "bg-white text-rose-700 shadow-sm dark:bg-gray-900 dark:text-rose-300"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI portrait
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSetting("mode", "color");
                    resetOutput();
                  }}
                  aria-pressed={settings.mode === "color"}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:py-2.5 ${
                    settings.mode === "color"
                      ? "bg-white text-rose-700 shadow-sm dark:bg-gray-900 dark:text-rose-300"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Palette className="h-3.5 w-3.5" />
                  Colour studio
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {settings.mode === "ai"
                  ? "Best for people, pets and complex scenes. The model runs in your browser; the first run downloads 6–26 MB and is cached."
                  : "Best for product shots, screenshots and flat backgrounds. No AI download and fully offline."}
              </p>
            </div>

            {settings.mode === "ai" ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Model quality
                </span>
                <select
                  value={settings.quality}
                  onChange={(event) => {
                    updateSetting("quality", event.target.value);
                    resetOutput();
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                >
                  <option value="fast">Fast — quantized 6.6 MB model</option>
                  <option value="best">High detail — 25.9 MB model</option>
                </select>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Background colour
                    </span>
                    <input
                      type="color"
                      value={settings.keyColor}
                      onChange={(event) => updateSetting("keyColor", event.target.value)}
                      className="h-10 w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-950"
                      aria-label="Background colour to remove"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={sampleBackgroundColor}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <ScanLine className="h-3.5 w-3.5" />
                    Sample
                  </button>
                </div>
                <label className="block">
                  <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Tolerance</span>
                    <span className="font-mono text-gray-500">{settings.tolerance}</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="160"
                    value={settings.tolerance}
                    onChange={(event) => updateSetting("tolerance", Number(event.target.value))}
                    className="w-full accent-rose-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Soft edge</span>
                    <span className="font-mono text-gray-500">{settings.softness}</span>
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={settings.softness}
                    onChange={(event) => updateSetting("softness", Number(event.target.value))}
                    className="w-full accent-rose-600"
                  />
                </label>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Edge refinement
              </span>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Feather</span>
                    <span className="font-mono text-gray-500">{settings.feather}px</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    value={settings.feather}
                    onChange={(event) => updateSetting("feather", Number(event.target.value))}
                    className="w-full accent-rose-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Edge contrast</span>
                    <span className="font-mono text-gray-500">{Number(settings.contrast).toFixed(1)}×</span>
                  </span>
                  <input
                    type="range"
                    min="0.4"
                    max="3"
                    step="0.1"
                    value={settings.contrast}
                    onChange={(event) => updateSetting("contrast", Number(event.target.value))}
                    className="w-full accent-rose-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Edge shift</span>
                    <span className="font-mono text-gray-500">{settings.edgeShift > 0 ? "+" : ""}{settings.edgeShift}</span>
                  </span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={settings.edgeShift}
                    onChange={(event) => updateSetting("edgeShift", Number(event.target.value))}
                    className="w-full accent-rose-600"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Colour despill</span>
                    <span className="font-mono text-gray-500">{settings.despill}%</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.despill}
                    onChange={(event) => updateSetting("despill", Number(event.target.value))}
                    className="w-full accent-rose-600"
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Backdrop
              </span>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                {BACKGROUNDS.map((background) => {
                  const Icon = background.icon;
                  return (
                    <button
                      key={background.value}
                      type="button"
                      onClick={() => updateSetting("background", background.value)}
                      aria-pressed={settings.background === background.value}
                      className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold transition-all ${
                        settings.background === background.value
                          ? "bg-white text-rose-700 shadow-sm dark:bg-gray-900 dark:text-rose-300"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {background.label}
                    </button>
                  );
                })}
              </div>

              {settings.background === "solid" ? (
                <label className="mt-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.color1}
                    onChange={(event) => updateSetting("color1", event.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-950"
                    aria-label="Studio background colour"
                  />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Studio colour</span>
                </label>
              ) : null}

              {settings.background === "gradient" ? (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <input
                        type="color"
                        value={settings.color1}
                        onChange={(event) => updateSetting("color1", event.target.value)}
                        className="h-9 w-10 cursor-pointer rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-950"
                        aria-label="Gradient start colour"
                      />
                      Start
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <input
                        type="color"
                        value={settings.color2}
                        onChange={(event) => updateSetting("color2", event.target.value)}
                        className="h-9 w-10 cursor-pointer rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-950"
                        aria-label="Gradient end colour"
                      />
                      End
                    </label>
                  </div>
                  <div
                    className="h-8 rounded-lg border border-black/5"
                    style={{
                      background: `linear-gradient(${settings.gradientAngle}deg, ${settings.color1}, ${settings.color2})`,
                    }}
                  />
                  <label className="block">
                    <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <span>Angle</span>
                      <span className="font-mono text-gray-500">{settings.gradientAngle}°</span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={settings.gradientAngle}
                      onChange={(event) => updateSetting("gradientAngle", Number(event.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </label>
                </div>
              ) : null}

              {settings.background === "blurred" ? (
                <label className="mt-3 block">
                  <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span>Blur amount</span>
                    <span className="font-mono text-gray-500">{settings.blurAmount}px</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={settings.blurAmount}
                    onChange={(event) => updateSetting("blurAmount", Number(event.target.value))}
                    className="w-full accent-rose-600"
                  />
                </label>
              ) : null}

              {settings.background === "custom" ? (
                <div className="mt-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                    <ImagePlus className="h-3.5 w-3.5" />
                    {customBackgroundUrl ? "Replace backdrop" : "Upload backdrop"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif,image/bmp"
                      className="sr-only"
                      onChange={handleCustomBackground}
                    />
                  </label>
                  {customBackgroundUrl ? (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={customBackgroundUrl} alt="Custom backdrop preview" className="h-9 w-12 rounded object-cover" />
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">Backdrop loaded</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (customBackgroundUrlRef.current) URL.revokeObjectURL(customBackgroundUrlRef.current);
                          customBackgroundUrlRef.current = "";
                          customBackgroundRef.current = null;
                          setCustomBackgroundUrl("");
                          updateSetting("background", "transparent");
                        }}
                        className="ml-auto text-gray-400 hover:text-red-500"
                        aria-label="Remove custom backdrop"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Composition
              </span>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Aspect ratio</span>
                  <select
                    value={settings.ratio}
                    onChange={(event) => updateSetting("ratio", event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-rose-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  >
                    {RATIOS.map((ratio) => (
                      <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <span>Padding</span>
                      <span className="font-mono text-gray-500">{settings.padding}%</span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={settings.padding}
                      onChange={(event) => updateSetting("padding", Number(event.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <span>Subject</span>
                      <span className="font-mono text-gray-500">{settings.subjectScale}%</span>
                    </span>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={settings.subjectScale}
                      onChange={(event) => updateSetting("subjectScale", Number(event.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <span>Horizontal</span>
                      <span className="font-mono text-gray-500">{settings.offsetX}</span>
                    </span>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={settings.offsetX}
                      onChange={(event) => updateSetting("offsetX", Number(event.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <span>Vertical</span>
                      <span className="font-mono text-gray-500">{settings.offsetY}</span>
                    </span>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={settings.offsetY}
                      onChange={(event) => updateSetting("offsetY", Number(event.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </label>
                </div>
                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 dark:bg-gray-950 dark:text-gray-300">
                  Subject shadow
                  <input
                    type="checkbox"
                    checked={settings.shadow}
                    onChange={(event) => updateSetting("shadow", event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                </label>
                {settings.shadow ? (
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-950">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold text-gray-500">Opacity</span>
                      <input type="range" min="0" max="70" value={settings.shadowOpacity} onChange={(event) => updateSetting("shadowOpacity", Number(event.target.value))} className="w-full accent-rose-600" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold text-gray-500">Blur</span>
                      <input type="range" min="0" max="60" value={settings.shadowBlur} onChange={(event) => updateSetting("shadowBlur", Number(event.target.value))} className="w-full accent-rose-600" />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold text-gray-500">Offset</span>
                      <input type="range" min="-20" max="40" value={settings.shadowOffset} onChange={(event) => updateSetting("shadowOffset", Number(event.target.value))} className="w-full accent-rose-600" />
                    </label>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Export
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Format</span>
                  <select
                    value={settings.format}
                    onChange={(event) => updateSetting("format", event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-rose-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  >
                    {FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Size</span>
                  <select
                    value={settings.exportScale}
                    onChange={(event) => updateSetting("exportScale", Number(event.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-rose-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  >
                    <option value="1">1×</option>
                    <option value="1.5">1.5×</option>
                    <option value="2">2×</option>
                  </select>
                </label>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                {settings.format === "jpeg"
                  ? "JPEG does not support transparency, so transparent areas are exported on white."
                  : "PNG and WebP preserve transparency."}
              </p>
            </div>
          </fieldset>
        </aside>

        <main className="min-w-0 space-y-5">
          {sourceUrl ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5 dark:border-gray-800 dark:bg-gray-950/40">
                  <div className="flex min-w-0 items-center gap-2">
                    <ImageIcon className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {sourceName}
                      </h2>
                      <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                        {sourceInfo ? `${sourceInfo.width} × ${sourceInfo.height}px · ${formatBytes(sourceInfo.bytes)}` : ""}
                        {sourceInfo?.resized ? " · optimized for stability" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("result")}
                        className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold ${previewMode === "result" ? "bg-rose-600 text-white" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        Cutout
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("original")}
                        className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold ${previewMode === "original" ? "bg-rose-600 text-white" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        Original
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      Replace
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif,image/bmp,image/gif"
                      className="sr-only"
                      onChange={handleInput}
                      aria-label="Upload an image for background removal"
                    />
                    <button type="button" onClick={resetAll} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800" aria-label="Remove image">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div
                    ref={previewWrapRef}
                    className={`relative flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-gray-100 p-3 sm:min-h-96 sm:p-6 dark:border-gray-800 ${
                      transparentPreview
                        ? "bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] dark:bg-none dark:bg-gray-950"
                        : "bg-gray-50 dark:bg-gray-950"
                    }`}
                  >
                    {previewMode === "original" || !cutoutReady ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sourceUrl}
                        alt="Original uploaded image"
                        className="max-h-[600px] max-w-full rounded-lg object-contain shadow-sm"
                      />
                    ) : (
                      <canvas
                        ref={previewCanvasRef}
                        className="max-h-[600px] max-w-full rounded-lg object-contain shadow-sm"
                        aria-label="Background-removed preview"
                      />
                    )}
                    {busy ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-gray-950/55 p-6 text-center backdrop-blur-[2px]">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                        <p className="text-sm font-bold text-white">{busyStage || "Working…"}</p>
                        <div className="h-2 w-52 max-w-full overflow-hidden rounded-full bg-white/20">
                          <div className="h-full rounded-full bg-rose-400 transition-all" style={{ width: `${Math.max(4, progress)}%` }} />
                        </div>
                        <p className="text-xs text-white/75">
                          {elapsed}s elapsed{settings.mode === "ai" && elapsed < 20 ? " · first run downloads the model" : ""}
                        </p>
                      </div>
                    ) : !cutoutReady ? (
                      <div className="pointer-events-none absolute inset-x-3 bottom-3 mx-auto max-w-md rounded-xl border border-white/60 bg-white/90 px-4 py-3 text-center shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/90">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          Ready when you are — click “Remove background” to create the cutout.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {cutoutReady ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Cutout ready
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        {activeBackground?.label || "Transparent"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        {settings.mode === "ai" ? "AI portrait" : "Colour key"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleRemove}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        {busy ? "Working…" : cutoutReady ? "Re-run cutout" : "Remove background"}
                      </button>
                      <button
                        type="button"
                        onClick={handleExport}
                        disabled={!cutoutReady || busy || exporting}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Download {FORMATS.find((item) => item.value === settings.format)?.label}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Working resolution</p>
                  <p className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">
                    {sourceInfo ? `${sourceInfo.width} × ${sourceInfo.height}` : "—"}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{sourceInfo?.resized ? "Optimized from the original" : "Full source resolution"}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Export size</p>
                  <p className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">{displayedScale}× · {FORMATS.find((item) => item.value === settings.format)?.label}</p>
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Built at export time, not uploaded</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Privacy</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                    100% local
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Your image is never uploaded</p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Two ways to cut out a subject</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
                  <Sparkles className="h-5 w-5 text-rose-600 dark:text-rose-300" />
                  <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">AI portrait model</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    Great for people, pets and cluttered scenes. The first run downloads a compact model; subsequent runs load from cache.
                  </p>
                </div>
                <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
                  <Palette className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                  <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Colour studio</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    Instant, offline cutouts for product photos, screenshots and flat backgrounds. Sample a corner or choose the exact colour.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                AI inference runs through WebAssembly inside this tab. Only the model files are downloaded; your photo is never sent anywhere.
              </div>
            </div>
          )}
        </main>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        AI cutouts use the MODNet portrait model via Transformers.js. Colour-studio mode is fully offline. Always check fine hair and product edges before publishing.
      </p>
    </ToolPageShell>
  );
}
