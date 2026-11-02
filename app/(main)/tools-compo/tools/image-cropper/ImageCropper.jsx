"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Crop,
  Crosshair,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  Hand,
  Image as ImageIcon,
  ImageDown,
  Info,
  LayoutGrid,
  Lock,
  Maximize2,
  MousePointer2,
  Move,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Ruler,
  ScanLine,
  SlidersHorizontal,
  Trash2,
  Unlock,
  UploadCloud,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  FaqAccordion,
  Field,
  Hero,
  SectionCard,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import {
  ASPECT_PRESETS,
  CROP_FAQS,
  FORMAT_OPTIONS,
  GRID_OPTIONS,
  MATTE_SWATCHES,
  SOCIAL_PRESETS,
} from "./cropperData";
import {
  buildOrientedCanvas,
  canvasToBlob,
  centeredView,
  clamp,
  clampPan,
  cropForAspect,
  defaultCrop,
  downloadBlob,
  fitScale,
  formatBytes,
  imageRect,
  moveCrop,
  resizeCrop,
  safeFileName,
  visibleBounds,
} from "./cropEngine";

const HANDLES = [
  { type: "nw", left: 0, top: 0, cursor: "nwse-resize" },
  { type: "n", left: 50, top: 0, cursor: "ns-resize" },
  { type: "ne", left: 100, top: 0, cursor: "nesw-resize" },
  { type: "e", left: 100, top: 50, cursor: "ew-resize" },
  { type: "se", left: 100, top: 100, cursor: "nwse-resize" },
  { type: "s", left: 50, top: 100, cursor: "ns-resize" },
  { type: "sw", left: 0, top: 100, cursor: "nesw-resize" },
  { type: "w", left: 0, top: 50, cursor: "ew-resize" },
];

const GRID_LINES = {
  thirds: [100 / 3, 200 / 3],
  golden: [38.2, 61.8],
  fine: [12.5, 25, 37.5, 50, 62.5, 75, 87.5],
};

function GridOverlay({ grid }) {
  const lines = GRID_LINES[grid];
  if (!lines) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {lines.map((position) => (
        <span
          key={`v-${position}`}
          className="absolute inset-y-0 w-px bg-white/60"
          style={{ left: `${position}%` }}
        />
      ))}
      {lines.map((position) => (
        <span
          key={`h-${position}`}
          className="absolute inset-x-0 h-px bg-white/60"
          style={{ top: `${position}%` }}
        />
      ))}
    </div>
  );
}

function formatExtension(type) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  return "png";
}

export default function ImageCropper() {
  const { addRecentTool } = useRecentTools();

  const [image, setImage] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [transform, setTransform] = useState({
    rotation: 0,
    straighten: 0,
    flipH: false,
    flipV: false,
  });
  const [orientedSize, setOrientedSize] = useState({ w: 0, h: 0 });
  const [stage, setStage] = useState({ w: 760, h: 500 });
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [aspect, setAspect] = useState("free");
  const [socialId, setSocialId] = useState("");
  const [grid, setGrid] = useState("thirds");
  const [panMode, setPanMode] = useState("crop");
  const [format, setFormat] = useState("original");
  const [quality, setQuality] = useState(92);
  const [matte, setMatte] = useState("#ffffff");
  const [outWidth, setOutWidth] = useState("");
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const orientedRef = useRef(null);
  const dragRef = useRef(null);
  const prevStageRef = useRef({ w: 0, h: 0 });
  const fileInputRef = useRef(null);

  const baseScale = useMemo(() => fitScale(orientedSize, stage), [orientedSize, stage]);
  const baseScaleRef = useRef(baseScale);

  const socialPreset = SOCIAL_PRESETS.find((preset) => preset.id === socialId) || null;
  const activeRatio = socialPreset?.ratio ?? ASPECT_PRESETS.find((preset) => preset.value === aspect)?.ratio ?? null;

  const layoutRef = useRef({ stage, oriented: orientedSize });
  const activeRatioRef = useRef(activeRatio);

  useEffect(() => {
    baseScaleRef.current = baseScale;
  }, [baseScale]);

  useEffect(() => {
    layoutRef.current = { stage, oriented: orientedSize };
  }, [stage, orientedSize]);

  useEffect(() => {
    activeRatioRef.current = activeRatio;
  }, [activeRatio]);

  useEffect(() => {
    addRecentTool({
      title: "Image Cropper",
      link: "/tools/image-cropper",
      icon: "Crop",
    });
  }, [addRecentTool]);

  /* ------------------------------ stage size ------------------------------ */

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return undefined;

    const measure = () => {
      const width = Math.max(240, element.clientWidth);
      const height = Math.round(clamp(width * 0.66, 300, 620));
      setStage((current) =>
        current.w === width && current.h === height ? current : { w: width, h: height },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [image]);

  useEffect(() => {
    const previous = prevStageRef.current;
    prevStageRef.current = stage;
    if (!previous.w || !previous.h) return;
    if (previous.w === stage.w && previous.h === stage.h) return;
    const { oriented } = layoutRef.current;
    if (!oriented.w || !oriented.h) return;

    // Re-fit rather than scale: a scaled crop drifts away from the image when
    // the stage is first measured (it starts at a placeholder size).
    const nextView = centeredView(oriented, stage);
    setView(nextView);
    const bounds = visibleBounds(nextView, oriented, fitScale(oriented, stage), stage);
    setCrop(defaultCrop(bounds, activeRatioRef.current));
  }, [stage]);

  /* --------------------------- oriented canvas ---------------------------- */
  /* Built inside the image loader and the transform handlers so the canvas   */
  /* stays in sync without a render-phase side effect.                        */

  /* -------------------------------- draw --------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(stage.w * ratio));
    canvas.height = Math.max(1, Math.round(stage.h * ratio));
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, stage.w, stage.h);

    const source = orientedRef.current;
    if (source) {
      const rect = imageRect(view, orientedSize, baseScale);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(source, rect.x, rect.y, rect.w, rect.h);
    }
  }, [view, orientedSize, baseScale, stage]);

  /* -------------------------------- wheel -------------------------------- */

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return undefined;

    const handleWheel = (event) => {
      if (!orientedRef.current) return;
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const pointerX = clamp(event.clientX - rect.left, 0, rect.width);
      const pointerY = clamp(event.clientY - rect.top, 0, rect.height);

      setView((current) => {
        const base = baseScaleRef.current;
        const nextZoom = clamp(current.zoom * (event.deltaY > 0 ? 0.9 : 1.1), 1, 5);
        if (Math.abs(nextZoom - current.zoom) < 0.001) return current;
        const currentScale = base * current.zoom;
        const nextScale = base * nextZoom;
        const worldX = (pointerX - current.x) / currentScale;
        const worldY = (pointerY - current.y) / currentScale;
        return clampPan(
          {
            zoom: nextZoom,
            x: pointerX - worldX * nextScale,
            y: pointerY - worldY * nextScale,
          },
          layoutRef.current.oriented,
          layoutRef.current.stage,
        );
      });
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, []);

  /* ------------------------------ file input ----------------------------- */

  const loadFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      toast.error("That image is larger than 40 MB. Try a smaller file.");
      return;
    }

    const url = URL.createObjectURL(file);
    const nextImage = new Image();
    nextImage.decoding = "async";
    nextImage.onload = () => {
      URL.revokeObjectURL(url);
      setImage(nextImage);
      setFileMeta({
        name: file.name || "pasted-image.png",
        size: file.size,
        type: file.type,
      });
      setTransform({ rotation: 0, straighten: 0, flipH: false, flipV: false });
      setAspect("free");
      setSocialId("");
      setOutWidth("");
      setLastExport(null);
      setPanMode("crop");

      const canvas = buildOrientedCanvas(nextImage, {
        rotation: 0,
        straighten: 0,
        flipH: false,
        flipV: false,
      });
      orientedRef.current = canvas;
      const oriented = { w: canvas.width, h: canvas.height };
      setOrientedSize(oriented);

      const nextView = centeredView(oriented, stage);
      setView(nextView);
      const bounds = visibleBounds(nextView, oriented, fitScale(oriented, stage), stage);
      setCrop(defaultCrop(bounds, null));

      toast.success(`Loaded ${file.name || "image"} — ${nextImage.naturalWidth} × ${nextImage.naturalHeight}px`);
    };
    nextImage.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("That image could not be decoded by your browser.");
    };
    nextImage.src = url;
  }, [stage]);

  useEffect(() => {
    const handlePaste = (event) => {
      const item = Array.from(event.clipboardData?.items || []).find((entry) =>
        entry.type.startsWith("image/"),
      );
      if (!item) return;
      const file = item.getAsFile();
      if (file) {
        event.preventDefault();
        loadFile(file);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadFile]);

  const resetImage = () => {
    setImage(null);
    setFileMeta(null);
    orientedRef.current = null;
    setOrientedSize({ w: 0, h: 0 });
    setCrop({ x: 0, y: 0, w: 0, h: 0 });
    setView({ zoom: 1, x: 0, y: 0 });
    setLastExport(null);
    setAspect("free");
    setSocialId("");
    setOutWidth("");
    setPanMode("crop");
    toast.success("Image removed. Drop another to continue.");
  };

  /* ------------------------------- geometry ------------------------------- */

  const currentBounds = () => visibleBounds(view, orientedSize, baseScale, stage);

  const sourceCrop = useMemo(() => {
    const scale = baseScale * view.zoom || 1;
    return {
      x: clamp((crop.x - view.x) / scale, 0, Math.max(0, orientedSize.w)),
      y: clamp((crop.y - view.y) / scale, 0, Math.max(0, orientedSize.h)),
      w: clamp(crop.w / scale, 0, orientedSize.w),
      h: clamp(crop.h / scale, 0, orientedSize.h),
    };
  }, [crop, view, baseScale, orientedSize]);

  const nativeWidth = Math.max(1, Math.round(sourceCrop.w));
  const nativeHeight = Math.max(1, Math.round(sourceCrop.h));
  const outputWidth = Math.max(
    1,
    Math.min(10000, Math.round(Number(outWidth) || nativeWidth)),
  );
  const outputHeight = Math.max(1, Math.round(outputWidth * (nativeHeight / nativeWidth)));

  const resolvedFormat =
    format === "original"
      ? fileMeta && ["image/jpeg", "image/png", "image/webp"].includes(fileMeta.type)
        ? fileMeta.type
        : "image/png"
      : `image/${format}`;

  const needsMatte = resolvedFormat === "image/jpeg";

  const setViewZoom = (nextZoom) => {
    setView((current) => {
      const base = baseScaleRef.current;
      const zoom = clamp(nextZoom, 1, 5);
      const currentScale = base * current.zoom;
      const nextScale = base * zoom;
      const centerX = stage.w / 2;
      const centerY = stage.h / 2;
      const worldX = (centerX - current.x) / currentScale;
      const worldY = (centerY - current.y) / currentScale;
      return clampPan(
        {
          zoom,
          x: centerX - worldX * nextScale,
          y: centerY - worldY * nextScale,
        },
        orientedSize,
        stage,
      );
    });
  };

  const fitStage = () => {
    if (!orientedSize.w) return;
    const nextView = centeredView(orientedSize, stage);
    setView(nextView);
    const bounds = visibleBounds(nextView, orientedSize, fitScale(orientedSize, stage), stage);
    setCrop(defaultCrop(bounds, activeRatio));
  };

  /**
   * Rebuild the oriented canvas and re-centre the view in one pass.
   * Running this from the event handlers keeps the canvas in sync without
   * mutating refs or calling setState during render.
   */
  const applyTransform = (nextTransform) => {
    if (!image) return;
    const canvas = buildOrientedCanvas(image, nextTransform);
    orientedRef.current = canvas;
    const oriented = { w: canvas.width, h: canvas.height };
    setOrientedSize(oriented);
    setTransform(nextTransform);

    const nextView = centeredView(oriented, stage);
    setView(nextView);
    const bounds = visibleBounds(nextView, oriented, fitScale(oriented, stage), stage);
    setCrop(defaultCrop(bounds, activeRatio));
  };

  const handleAspect = (value) => {
    setAspect(value);
    setSocialId("");
    const ratio = ASPECT_PRESETS.find((preset) => preset.value === value)?.ratio ?? null;
    if (!ratio || !orientedSize.w) return;
    setCrop(
      cropForAspect(ratio, currentBounds(), {
        x: crop.x + crop.w / 2,
        y: crop.y + crop.h / 2,
      }),
    );
  };

  const handleSocialPreset = (value) => {
    setSocialId(value);
    const preset = SOCIAL_PRESETS.find((item) => item.id === value);
    if (!preset) {
      setOutWidth("");
      return;
    }
    setOutWidth(String(preset.width));
    if (orientedSize.w) {
      setCrop(
        cropForAspect(preset.ratio, currentBounds(), {
          x: crop.x + crop.w / 2,
          y: crop.y + crop.h / 2,
        }),
      );
    }
  };

  const updateSourceCrop = (field, rawValue) => {
    const value = Number(rawValue);
    if (!Number.isFinite(value) || !orientedSize.w) return;

    const next = {
      x: Math.round(sourceCrop.x),
      y: Math.round(sourceCrop.y),
      w: Math.max(1, Math.round(sourceCrop.w)),
      h: Math.max(1, Math.round(sourceCrop.h)),
    };

    if (field === "w") next.w = Math.max(1, value);
    if (field === "h") next.h = Math.max(1, value);
    if (field === "x") next.x = value;
    if (field === "y") next.y = value;

    if (activeRatio && (field === "w" || field === "h")) {
      if (field === "w") next.h = next.w / activeRatio;
      else next.w = next.h * activeRatio;
    }

    next.w = Math.min(next.w, orientedSize.w);
    next.h = Math.min(next.h, orientedSize.h);

    if (activeRatio) {
      const maxW = orientedSize.w - next.x;
      const maxH = orientedSize.h - next.y;
      if (next.w > maxW) {
        next.w = maxW;
        next.h = next.w / activeRatio;
      }
      if (next.h > maxH) {
        next.h = maxH;
        next.w = next.h * activeRatio;
      }
    }

    next.x = clamp(next.x, 0, Math.max(0, orientedSize.w - next.w));
    next.y = clamp(next.y, 0, Math.max(0, orientedSize.h - next.h));

    const scale = baseScale * view.zoom || 1;
    setCrop({
      x: view.x + next.x * scale,
      y: view.y + next.y * scale,
      w: next.w * scale,
      h: next.h * scale,
    });
  };

  /* ------------------------------ pointer UX ------------------------------ */

  const stagePoint = (event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clamp(event.clientX - rect.left, 0, rect.width),
      y: clamp(event.clientY - rect.top, 0, rect.height),
    };
  };

  const beginDrag = (event, type) => {
    if (!image || panMode === "pan") return;
    event.preventDefault();
    event.stopPropagation();
    const point = stagePoint(event);
    dragRef.current = {
      mode: "crop",
      type,
      startX: point.x,
      startY: point.y,
      crop: { ...crop },
      bounds: currentBounds(),
    };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const beginPan = (event) => {
    if (!image || panMode !== "pan") return;
    event.preventDefault();
    const point = stagePoint(event);
    dragRef.current = {
      mode: "pan",
      startX: point.x,
      startY: point.y,
      view: { ...view },
    };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || !image) return;
    const point = stagePoint(event);
    const dx = point.x - drag.startX;
    const dy = point.y - drag.startY;

    if (drag.mode === "pan") {
      setView(
        clampPan(
          { ...drag.view, x: drag.view.x + dx, y: drag.view.y + dy },
          orientedSize,
          stage,
        ),
      );
      return;
    }

    if (drag.type === "move") {
      setCrop(moveCrop(drag.crop, dx, dy, drag.bounds));
    } else {
      setCrop(resizeCrop(drag.type, drag.crop, dx, dy, drag.bounds, activeRatio));
    }
  };

  const endDrag = (event) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    try {
      event?.currentTarget?.releasePointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture may already be released.
    }
  };

  const nudgeCrop = (event) => {
    if (!image || !crop.w) return;
    const step = event.shiftKey ? 10 : 1;
    const deltas = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    setCrop((current) => moveCrop(current, delta[0], delta[1], currentBounds()));
  };

  /* -------------------------------- export -------------------------------- */

  const handleExport = async (copyOnly = false) => {
    if (!image || !orientedRef.current || !crop.w) {
      toast.error("Load an image and select a crop first.");
      return;
    }

    setExporting(true);
    try {
      const scale = baseScale * view.zoom || 1;
      const sourceX = clamp((crop.x - view.x) / scale, 0, orientedSize.w - 1);
      const sourceY = clamp((crop.y - view.y) / scale, 0, orientedSize.h - 1);
      const sourceWidth = clamp(crop.w / scale, 1, orientedSize.w - sourceX);
      const sourceHeight = clamp(crop.h / scale, 1, orientedSize.h - sourceY);

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");

      if (needsMatte) {
        context.fillStyle = matte;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        orientedRef.current,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      if (copyOnly) {
        if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
          throw new Error("This browser cannot copy images to the clipboard.");
        }
        const pngBlob = await canvasToBlob(canvas, "image/png");
        await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
        toast.success("Cropped PNG copied to the clipboard.");
      } else {
        const blob = await canvasToBlob(
          canvas,
          resolvedFormat,
          resolvedFormat === "image/png" ? undefined : quality / 100,
        );
        const extension = formatExtension(resolvedFormat);
        const fileName = `${safeFileName(fileMeta?.name)}-crop-${outputWidth}x${outputHeight}.${extension}`;
        downloadBlob(blob, fileName);
        setLastExport({
          width: outputWidth,
          height: outputHeight,
          size: blob.size,
          type: resolvedFormat,
          name: fileName,
        });
        toast.success(`Cropped image downloaded (${formatBytes(blob.size)}).`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "The crop could not be exported. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  /* -------------------------------- render -------------------------------- */

  const hasImage = Boolean(image);

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone="indigo"
        eyebrow="Image studio"
        icon={Crop}
        title="Image Cropper"
        description="Crop, straighten, rotate and resize photos with pixel-perfect control. Lock any aspect ratio, preview social presets, zoom into fine details and export at full source resolution — all locally, with nothing uploaded."
        badges={[
          "Pixel-perfect crop",
          "Social presets",
          "Rotate & straighten",
          "Full-resolution export",
          "100% private",
        ]}
      />

      {!hasImage ? (
        <section className="space-y-6">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              loadFile(event.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-5 py-14 text-center transition sm:px-8 sm:py-20 ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-950/30"
                : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                loadFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <UploadCloud className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
              Drop an image to start cropping
            </h2>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Drag and drop, browse your device, or press{" "}
              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-800">
                Ctrl/Cmd + V
              </kbd>{" "}
              to paste a screenshot. JPEG, PNG, WebP, GIF and AVIF up to 40 MB.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
              Choose an image
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Crosshair,
                title: "Precise selection",
                text: "Drag the box, resize any edge and nudge by a single pixel with the arrow keys.",
              },
              {
                icon: LayoutGrid,
                title: "Guides that help",
                text: "Rule-of-thirds, golden-ratio and fine grids keep compositions balanced.",
              },
              {
                icon: ScanLine,
                title: "Full resolution",
                text: "The export is rendered from the original file, never from the on-screen preview.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-2.5 text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          {/* Stage */}
          <div className="space-y-6 xl:col-span-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                      {fileMeta?.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {fileMeta ? formatBytes(fileMeta.size) : ""} · {orientedSize.w} × {orientedSize.h}px
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <ActionButton icon={RefreshCw} onClick={() => fileInputRef.current?.click()}>
                    Replace
                  </ActionButton>
                  <ActionButton icon={Trash2} variant="ghost" onClick={resetImage}>
                    Remove
                  </ActionButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      loadFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>

              <div
                ref={stageRef}
                role="application"
                aria-label="Crop area. Drag the crop box or its handles. Use arrow keys to nudge the selection; hold Shift for larger steps."
                tabIndex={0}
                onKeyDown={nudgeCrop}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  loadFile(event.dataTransfer.files?.[0]);
                }}
                className={`relative mt-3 w-full touch-none select-none overflow-hidden rounded-2xl border outline-none ${
                  dragActive
                    ? "border-indigo-500 ring-2 ring-indigo-400/40"
                    : "border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700"
                }`}
                style={{
                  height: stage.h,
                  backgroundColor: "#f1f5f9",
                  backgroundImage:
                    "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                  backgroundSize: "18px 18px",
                  backgroundPosition: "0 0, 0 9px, 9px -9px, -9px 0",
                }}
              >
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

                <div
                  className="absolute inset-0"
                  onPointerDown={beginPan}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  style={{ cursor: panMode === "pan" ? (dragging ? "grabbing" : "grab") : "default" }}
                >
                  {crop.w > 0 && (
                    <div
                      role="presentation"
                      onPointerDown={(event) => beginDrag(event, "move")}
                      className={`absolute border border-white/95 ${
                        panMode === "pan" ? "pointer-events-none" : "cursor-move"
                      }`}
                      style={{
                        left: crop.x,
                        top: crop.y,
                        width: crop.w,
                        height: crop.h,
                        boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.55)",
                      }}
                    >
                      <GridOverlay grid={grid} />
                      <span className="absolute bottom-1.5 right-1.5 rounded-md bg-slate-950/70 px-1.5 py-0.5 text-sm font-bold tabular-nums text-white">
                        {nativeWidth} × {nativeHeight}
                      </span>
                      {panMode === "crop" &&
                        HANDLES.map((handle) => (
                          <div
                            key={handle.type}
                            role="presentation"
                            onPointerDown={(event) => beginDrag(event, handle.type)}
                            aria-label={`Resize crop from ${handle.type}`}
                            className="absolute z-20 flex h-4.5 w-4.5 items-center justify-center rounded-md border-2 border-white bg-indigo-600 shadow-md"
                            style={{
                              left: `${handle.left}%`,
                              top: `${handle.top}%`,
                              transform: "translate(-50%, -50%)",
                              cursor: handle.cursor,
                            }}
                          >
                            <span className="h-1 w-1 rounded-full bg-white/90" />
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1.5">
                  <span className="rounded-lg bg-slate-950/70 px-2 py-1 text-sm font-bold text-white backdrop-blur-sm">
                    {Math.round(view.zoom * 100)}%
                  </span>
                  {activeRatio && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-950/70 px-2 py-1 text-sm font-bold text-white backdrop-blur-sm">
                      <Lock className="h-3.5 w-3.5" />
                      {socialPreset ? socialPreset.label : aspect}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  {[
                    { value: "crop", label: "Crop", icon: MousePointer2 },
                    { value: "pan", label: "Pan image", icon: Hand },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPanMode(value)}
                      aria-pressed={panMode === value}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition ${
                        panMode === value
                          ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewZoom(view.zoom - 0.15)}
                    disabled={view.zoom <= 1}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-white"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">
                    {Math.round(view.zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewZoom(view.zoom + 0.15)}
                    disabled={view.zoom >= 5}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-white"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={fitStage}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
                    aria-label="Fit image to the stage"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <label htmlFor="crop-grid" className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Grid
                  </label>
                  <select
                    id="crop-grid"
                    value={grid}
                    onChange={(event) => setGrid(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {GRID_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Stat tone="indigo" icon={Crop} label="Source crop" value={`${nativeWidth} × ${nativeHeight}`} />
              <Stat tone="indigo" icon={ImageDown} label="Output" value={`${outputWidth} × ${outputHeight}`} />
              <Stat tone="indigo" icon={Ruler} label="Original" value={`${orientedSize.w} × ${orientedSize.h}`} />
              <Stat
                tone="indigo"
                icon={Move}
                label="View"
                value={`${Math.round(view.zoom * 100)}%`}
                hint={panMode === "pan" ? "Drag to pan" : "Crop mode"}
              />
            </div>

            {showAdvanced && (
              <SectionCard
                tone="indigo"
                icon={Info}
                title="How the crop maps to your file"
                description="Everything is calculated from the original pixels, not the zoomed preview."
              >
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Callout tone="indigo" variant="tip" title="Zoom and pan are only for selection">
                    Zooming magnifies the working canvas so you can place the box on fine detail. The
                    exported crop still comes from the full-resolution source.
                  </Callout>
                  <Callout tone="indigo" variant="info" title="Rotation is baked in first">
                    Rotate, straighten and flip are applied to the working canvas before the crop, so
                    the result never contains empty corners.
                  </Callout>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-6 xl:col-span-4">
            <SectionCard
              tone="indigo"
              icon={Crop}
              title="Crop shape"
              description="Pick a ratio, a social preset, or keep it free."
            >
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 xl:grid-cols-3">
                {ASPECT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleAspect(preset.value)}
                    aria-pressed={!socialId && aspect === preset.value}
                    className={`rounded-xl border px-2 py-2 text-sm font-bold transition ${
                      !socialId && aspect === preset.value
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <Field
                  label="Social & print preset"
                  htmlFor="crop-social"
                  hint="Sets the ratio and a recommended output width. You can still fine-tune both."
                >
                  <select
                    id="crop-social"
                    value={socialId}
                    onChange={(event) => handleSocialPreset(event.target.value)}
                    className={fieldClass(false, "indigo")}
                  >
                    <option value="">Custom crop</option>
                    {SOCIAL_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label} — {preset.width} × {preset.height}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className={labelClass}>Position &amp; size</span>
                  <Chip tone="indigo">
                    {activeRatio ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    {activeRatio ? "Ratio locked" : "Free"}
                  </Chip>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "x", label: "X" },
                    { key: "y", label: "Y" },
                    { key: "w", label: "Width" },
                    { key: "h", label: "Height" },
                  ].map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {field.label} <span className="font-normal">(px)</span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          field.key === "x"
                            ? Math.round(sourceCrop.x)
                            : field.key === "y"
                              ? Math.round(sourceCrop.y)
                              : field.key === "w"
                                ? Math.round(sourceCrop.w)
                                : Math.round(sourceCrop.h)
                        }
                        onChange={(event) => updateSourceCrop(field.key, event.target.value)}
                        className={fieldClass(false, "indigo")}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <ActionButton icon={RefreshCw} onClick={fitStage}>
                  Reset crop
                </ActionButton>
                <ActionButton
                  icon={SlidersHorizontal}
                  variant="ghost"
                  onClick={() => setShowAdvanced((current) => !current)}
                >
                  {showAdvanced ? "Hide details" : "Show details"}
                </ActionButton>
              </div>
            </SectionCard>

            <SectionCard
              tone="indigo"
              icon={RotateCw}
              title="Rotate, flip & straighten"
              description="Transformations are applied before the crop for clean edges."
            >
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTransform({ ...transform, rotation: (transform.rotation + 270) % 360 })}
                  className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-2 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                  aria-label="Rotate 90 degrees counter-clockwise"
                >
                  <RotateCcw className="h-4 w-4" />
                  −90°
                </button>
                <button
                  type="button"
                  onClick={() => applyTransform({ ...transform, rotation: (transform.rotation + 90) % 360 })}
                  className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-2 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                  aria-label="Rotate 90 degrees clockwise"
                >
                  <RotateCw className="h-4 w-4" />
                  +90°
                </button>
                <button
                  type="button"
                  onClick={() => applyTransform({ ...transform, flipH: !transform.flipH })}
                  aria-pressed={transform.flipH}
                  className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-sm font-bold transition ${
                    transform.flipH
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                  }`}
                  aria-label="Flip horizontally"
                >
                  <FlipHorizontal2 className="h-4 w-4" />
                  Flip H
                </button>
                <button
                  type="button"
                  onClick={() => applyTransform({ ...transform, flipV: !transform.flipV })}
                  aria-pressed={transform.flipV}
                  className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-sm font-bold transition ${
                    transform.flipV
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                  }`}
                  aria-label="Flip vertically"
                >
                  <FlipVertical2 className="h-4 w-4" />
                  Flip V
                </button>
              </div>

              <div className="mt-4">
                <SliderRow
                  tone="indigo"
                  label="Straighten"
                  min={-15}
                  max={15}
                  step={1}
                  value={transform.straighten}
                  onChange={(value) => applyTransform({ ...transform, straighten: value })}
                  format={(value) => `${value}°`}
                  hint="Rotates the canvas by a small angle and expands it to avoid transparent corners."
                  onReset={() => applyTransform({ ...transform, straighten: 0 })}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>
                  Rotation {transform.rotation}° · {transform.flipH ? "H flipped" : "H normal"} ·{" "}
                  {transform.flipV ? "V flipped" : "V normal"}
                </span>
                <ActionButton
                  variant="ghost"
                  icon={RefreshCw}
                  onClick={() => {
                    applyTransform({ rotation: 0, straighten: 0, flipH: false, flipV: false });
                    toast.success("Rotation and flips reset.");
                  }}
                >
                  Reset
                </ActionButton>
              </div>
            </SectionCard>

            <SectionCard
              tone="indigo"
              icon={ImageDown}
              title="Export"
              description="Choose the format, quality and output size."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Field label="Format" htmlFor="crop-format">
                  <select
                    id="crop-format"
                    value={format}
                    onChange={(event) => setFormat(event.target.value)}
                    className={fieldClass(false, "indigo")}
                  >
                    {FORMAT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Output width (px)"
                  htmlFor="crop-out-width"
                  hint={`Native crop width is ${nativeWidth}px. Leave blank to keep it.`}
                  aside={
                    outWidth ? (
                      <button
                        type="button"
                        onClick={() => setOutWidth("")}
                        className="text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-300"
                      >
                        Use native
                      </button>
                    ) : null
                  }
                >
                  <input
                    id="crop-out-width"
                    type="number"
                    min="1"
                    max="10000"
                    value={outWidth}
                    placeholder={String(nativeWidth)}
                    onChange={(event) => setOutWidth(event.target.value)}
                    className={fieldClass(false, "indigo")}
                  />
                </Field>
              </div>

              {outputWidth > nativeWidth && (
                <Callout tone="indigo" variant="warning" className="mt-3">
                  This output is larger than the crop ({nativeWidth}px wide), so the image will be
                  upscaled. Use a larger crop for maximum sharpness.
                </Callout>
              )}

              {resolvedFormat !== "image/png" && (
                <div className="mt-3">
                  <SliderRow
                    tone="indigo"
                    label="Quality"
                    min={40}
                    max={100}
                    step={1}
                    value={quality}
                    onChange={setQuality}
                    format={(value) => `${value}%`}
                    hint="Higher quality means a larger file. 90–95% is a good balance."
                  />
                </div>
              )}

              {needsMatte && (
                <div className="mt-3">
                  <span className={labelClass}>JPEG background</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {MATTE_SWATCHES.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setMatte(color)}
                        aria-label={`Use ${color} as the JPEG background`}
                        aria-pressed={matte.toLowerCase() === color.toLowerCase()}
                        className={`h-8 w-8 rounded-lg border-2 transition ${
                          matte.toLowerCase() === color.toLowerCase()
                            ? "border-indigo-600 ring-2 ring-indigo-500/30"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={matte}
                      onChange={(event) => setMatte(event.target.value)}
                      aria-label="Custom JPEG background colour"
                      className="h-8 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/30">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Output size</p>
                  <p className="text-sm font-black tabular-nums text-slate-900 dark:text-white">
                    {outputWidth} × {outputHeight}px
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/30">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Format</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {formatExtension(resolvedFormat).toUpperCase()}
                </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <ActionButton
                  variant="primary"
                  tone="indigo"
                  icon={exporting ? RefreshCw : Download}
                  onClick={() => handleExport(false)}
                  disabled={exporting || !crop.w}
                  className="w-full"
                >
                  {exporting ? "Rendering…" : `Download ${formatExtension(resolvedFormat).toUpperCase()}`}
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  icon={Copy}
                  onClick={() => handleExport(true)}
                  disabled={exporting || !crop.w}
                  className="w-full"
                >
                  Copy PNG to clipboard
                </ActionButton>
              </div>

              {lastExport && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-bold">Last export</p>
                    <p>
                      {lastExport.width} × {lastExport.height}px · {formatBytes(lastExport.size)} ·{" "}
                      {lastExport.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <ToggleRow
                  tone="indigo"
                  checked={showAdvanced}
                  onChange={setShowAdvanced}
                  label="Show calculation notes"
                  description="Explain how zoom, rotation and crop size interact."
                />
              </div>

              <Callout tone="indigo" variant="success" className="mt-3" title="Private by design">
                The image is decoded locally with a canvas and never uploaded. Closing the tab clears
                it from memory.
              </Callout>
            </SectionCard>
          </div>
        </div>
      )}

      <FaqAccordion items={CROP_FAQS} tone="indigo" title="Image cropping questions, answered" />
    </div>
  );
}
