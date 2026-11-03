"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Clipboard,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileJson,
  ImagePlus,
  Layers,
  Maximize,
  MousePointer2,
  Palette,
  Plus,
  Redo2,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
  Undo2,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  FaqAccordion,
  Hero,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import {
  MEME_BACKGROUNDS,
  MEME_DEFAULT_PROJECT,
  MEME_FAQS,
  MEME_FONTS,
  MEME_SIZES,
  MEME_STORAGE_KEY,
  cloneProject,
  createLayer,
  fontStack,
  makeId,
} from "./memeData";

const TOOL_META = { title: "Meme Generator", link: "/tools/meme-generator", icon: "Laugh" };

const TEXT_ALIGNS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const INSPECTOR_TABS = [
  { value: "canvas", label: "Canvas", icon: <Maximize className="h-4 w-4" /> },
  { value: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
  { value: "image", label: "Image", icon: <ImagePlus className="h-4 w-4" /> },
  { value: "export", label: "Export", icon: <Download className="h-4 w-4" /> },
];

let measureCanvas = null;
function measureContext() {
  if (!measureCanvas && typeof document !== "undefined") {
    measureCanvas = document.createElement("canvas");
  }
  return measureCanvas?.getContext("2d") || null;
}

function measureLayer(layer, projectWidth) {
  const context = measureContext();
  if (!context) return { lines: [], width: 0, height: 0, lineHeight: layer.size * layer.lineHeight };
  const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;
  const maxWidth = Math.max(40, (layer.maxWidth / 100) * projectWidth);
  context.font = `800 ${layer.size}px ${fontStack(layer.font)}`;
  if ("letterSpacing" in context) context.letterSpacing = `${layer.letterSpacing}px`;
  const paragraphs = text.length ? text.split("\n") : [""];
  const lines = [];
  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push("");
      return;
    }
    const words = paragraph.split(/\s+/);
    let line = "";
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    lines.push(line);
  });
  const width = Math.max(0, ...lines.map((line) => context.measureText(line).width));
  const lineHeight = layer.size * layer.lineHeight;
  return { lines, width, height: lines.length * lineHeight, lineHeight, maxWidth };
}

function drawScene(context, project, image) {
  const { width, height } = project;
  context.clearRect(0, 0, width, height);

  if (project.background.type === "gradient") {
    const angle = ((project.background.angle - 90) * Math.PI) / 180;
    const length = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
    const x0 = width / 2 - (Math.cos(angle) * length) / 2;
    const y0 = height / 2 - (Math.sin(angle) * length) / 2;
    const x1 = width / 2 + (Math.cos(angle) * length) / 2;
    const y1 = height / 2 + (Math.sin(angle) * length) / 2;
    const gradient = context.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, project.background.from);
    gradient.addColorStop(1, project.background.to);
    context.fillStyle = gradient;
  } else {
    context.fillStyle = project.background.color;
  }
  context.fillRect(0, 0, width, height);

  if (image && project.image) {
    const fit =
      project.imageFit === "contain"
        ? Math.min(width / image.naturalWidth, height / image.naturalHeight)
        : Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const scale = fit * project.imageScale;
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const x = width / 2 - drawWidth / 2 + project.imageX;
    const y = height / 2 - drawHeight / 2 + project.imageY;
    context.save();
    context.globalAlpha = Math.max(0, Math.min(1, project.imageOpacity));
    if (project.imageBlur > 0) context.filter = `blur(${project.imageBlur}px)`;
    context.drawImage(image, x, y, drawWidth, drawHeight);
    context.restore();
  }

  if (project.background.overlay > 0) {
    context.save();
    context.fillStyle = `rgba(0,0,0,${project.background.overlay / 100})`;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  project.layers.forEach((layer) => {
    if (!layer.visible || !layer.text) return;
    const metrics = measureLayer(layer, width);
    context.save();
    context.translate(layer.x, layer.y);
    context.rotate((layer.rotation * Math.PI) / 180);
    context.globalAlpha = Math.max(0, Math.min(1, layer.opacity));
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.font = `800 ${layer.size}px ${fontStack(layer.font)}`;
    if ("letterSpacing" in context) context.letterSpacing = `${layer.letterSpacing}px`;

    const left = -metrics.width / 2;
    const top = -metrics.height / 2;

    if (layer.highlight) {
      const padX = layer.size * 0.22;
      const padY = layer.size * 0.08;
      context.save();
      context.fillStyle = layer.highlightColor;
      context.fillRect(left - padX, top - padY, metrics.width + padX * 2, metrics.height + padY * 2);
      context.restore();
    }

    let fill = layer.color;
    if (layer.fillType === "gradient") {
      const gradient = context.createLinearGradient(left, 0, left + metrics.width, 0);
      gradient.addColorStop(0, layer.gradientFrom);
      gradient.addColorStop(1, layer.gradientTo);
      fill = gradient;
    }

    if (layer.shadow) {
      context.shadowColor = "rgba(0,0,0,0.55)";
      context.shadowBlur = layer.size * 0.12;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = layer.size * 0.04;
    }

    metrics.lines.forEach((line, index) => {
      const lineWidth = line ? context.measureText(line).width : 0;
      let x = left;
      if (layer.align === "center") x = left + (metrics.width - lineWidth) / 2;
      if (layer.align === "right") x = left + (metrics.width - lineWidth);
      const y = top + metrics.lineHeight * (index + 0.5);
      if (layer.strokeWidth > 0 && line) {
        context.lineJoin = "round";
        context.lineWidth = layer.strokeWidth;
        context.strokeStyle = layer.strokeColor;
        context.strokeText(line, x, y);
      }
      if (line) {
        context.fillStyle = fill;
        context.fillText(line, x, y);
      }
    });
    context.restore();
  });

  if (project.watermark) {
    context.save();
    context.font = `700 ${Math.round(width * 0.022)}px ui-sans-serif, system-ui, sans-serif`;
    context.textAlign = "right";
    context.textBaseline = "bottom";
    context.fillStyle = "rgba(255,255,255,0.72)";
    context.shadowColor = "rgba(0,0,0,0.45)";
    context.shadowBlur = 6;
    context.fillText("Made with ToolsTrek", width - width * 0.03, height - height * 0.02);
    context.restore();
  }
}

function hitTest(layer, x, y, projectWidth) {
  if (!layer.visible || !layer.text) return false;
  const metrics = measureLayer(layer, projectWidth);
  const pad = layer.size * 0.2;
  const halfWidth = metrics.width / 2 + pad;
  const halfHeight = metrics.height / 2 + pad;
  const angle = (-layer.rotation * Math.PI) / 180;
  const dx = x - layer.x;
  const dy = y - layer.y;
  const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
  const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
  return Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight;
}

function safeFileName(value, extension) {
  const base = (value || "meme").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "") || "meme";
  return `${base}.${extension}`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function ColorField({ label, value, onChange, className = "" }) {
  return (
    <div className={className}>
      <span className={labelClass}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClass(false, "violet")}
          aria-label={`${label} hex value`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export default function MemeGeneratorStudio() {
  const { addRecentTool } = useRecentTools();
  const [project, setProject] = useState(() => cloneProject(MEME_DEFAULT_PROJECT));
  const [selectedId, setSelectedId] = useState(null);
  const [inspector, setInspector] = useState("canvas");
  const [hydrated, setHydrated] = useState(false);
  const [exportFormat, setExportFormat] = useState("image/png");
  const [exportScale, setExportScale] = useState(2);
  const [exportQuality, setExportQuality] = useState(0.92);
  const [fileName, setFileName] = useState("my-meme");
  const [imageName, setImageName] = useState("");
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef(null);
  const projectRef = useRef(project);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const dragRef = useRef(null);
  const imageInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const wrapperRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});

  const selectedLayer = useMemo(
    () => project.layers.find((layer) => layer.id === selectedId) || null,
    [project.layers, selectedId],
  );

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(MEME_STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved?.project?.layers) {
            const next = { ...cloneProject(MEME_DEFAULT_PROJECT), ...saved.project };
            next.background = { ...MEME_DEFAULT_PROJECT.background, ...(saved.project.background || {}) };
            next.layers = saved.project.layers.map((layer) => ({ ...createLayer(next), ...layer }));
            setProject(next);
            projectRef.current = next;
            if (saved.exportFormat) setExportFormat(saved.exportFormat);
            if (saved.exportScale) setExportScale(saved.exportScale);
          }
        }
      } catch {
        // Corrupt or oversized storage is ignored; the canvas stays blank.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          MEME_STORAGE_KEY,
          JSON.stringify({ project, exportFormat, exportScale }),
        );
      } catch {
        // Images can exceed the storage quota; the editor still works.
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [project, exportFormat, exportScale, hydrated]);

  const commit = useCallback((updater) => {
    const previous = projectRef.current;
    const next = typeof updater === "function" ? updater(previous) : updater;
    if (!next || next === previous) return;
    setPast((items) => [...items.slice(-29), cloneProject(previous)]);
    setFuture([]);
    projectRef.current = next;
    setProject(next);
  }, []);

  const applyTransient = useCallback((updater) => {
    const previous = projectRef.current;
    const next = typeof updater === "function" ? updater(previous) : updater;
    if (!next) return;
    projectRef.current = next;
    setProject(next);
  }, []);

  const undo = useCallback(() => {
    if (!past.length) return;
    const previous = past[past.length - 1];
    setPast((items) => items.slice(0, -1));
    setFuture((items) => [cloneProject(projectRef.current), ...items].slice(0, 30));
    projectRef.current = previous;
    setProject(previous);
  }, [past]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    setPast((items) => [...items.slice(-29), cloneProject(projectRef.current)]);
    setFuture((items) => items.slice(1));
    projectRef.current = next;
    setProject(next);
  }, [future]);

  const patchLayer = useCallback(
    (id, patch, { history = true } = {}) => {
      const update = (current) => ({
        ...current,
        layers: current.layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)),
      });
      if (history) commit(update);
      else applyTransient(update);
    },
    [applyTransient, commit],
  );

  const imageElement = project.image ? loadedImages[project.image] || null : null;

  useEffect(() => {
    if (!project.image) return;
    if (loadedImages[project.image]) return;
    const image = new Image();
    image.onload = () => {
      setLoadedImages((current) => ({ ...current, [image.src]: image }));
    };
    image.onerror = () => toast.error("That image could not be loaded.");
    image.src = project.image;
  }, [project.image, loadedImages]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== project.width || canvas.height !== project.height) {
      canvas.width = project.width;
      canvas.height = project.height;
    }
    const context = canvas.getContext("2d");
    drawScene(context, project, imageElement);
  }, [project, imageElement]);

  const loadImageFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a PNG, JPEG, WebP, GIF or AVIF image.");
      return;
    }
    if (file.size > 24 * 1024 * 1024) {
      toast.error("Images up to 24 MB are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || "");
      commit((current) => ({
        ...current,
        image: source,
        imageX: 0,
        imageY: 0,
        imageScale: 1,
      }));
      setImageName(file.name);
      setInspector("image");
      toast.success("Image added to the canvas");
    };
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
  }, [commit]);

  useEffect(() => {
    const onPaste = (event) => {
      const item = Array.from(event.clipboardData?.items || []).find((entry) => entry.type.startsWith("image/"));
      if (!item) return;
      const file = item.getAsFile();
      if (file) loadImageFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadImageFile]);

  const addLayer = useCallback(
    (overrides = {}) => {
      const layer = createLayer(projectRef.current, overrides);
      commit((current) => ({ ...current, layers: [...current.layers, layer] }));
      setSelectedId(layer.id);
      setInspector("text");
      return layer;
    },
    [commit],
  );

  const addClassicCaptions = useCallback(() => {
    const current = projectRef.current;
    const top = createLayer(current, {
      text: "TOP TEXT",
      y: current.height * 0.14,
      size: Math.round(current.width * 0.085),
      maxWidth: 90,
    });
    const bottom = createLayer(current, {
      text: "BOTTOM TEXT",
      y: current.height * 0.86,
      size: Math.round(current.width * 0.085),
      maxWidth: 90,
    });
    commit((state) => ({ ...state, layers: [...state.layers, top, bottom] }));
    setSelectedId(top.id);
    setInspector("text");
    toast.success("Top and bottom caption layers added");
  }, [commit]);

  const duplicateLayer = useCallback(
    (id) => {
      const source = projectRef.current.layers.find((layer) => layer.id === id);
      if (!source) return;
      const copy = { ...source, id: makeId(), x: source.x + 24, y: source.y + 24 };
      commit((current) => ({ ...current, layers: [...current.layers, copy] }));
      setSelectedId(copy.id);
      setInspector("text");
    },
    [commit],
  );

  const deleteLayer = useCallback(
    (id) => {
      commit((current) => ({ ...current, layers: current.layers.filter((layer) => layer.id !== id) }));
      if (selectedId === id) setSelectedId(null);
    },
    [commit, selectedId],
  );

  const moveLayer = (id, direction) => {
    commit((current) => {
      const index = current.layers.findIndex((layer) => layer.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.layers.length) return current;
      const layers = [...current.layers];
      const [moved] = layers.splice(index, 1);
      layers.splice(nextIndex, 0, moved);
      return { ...current, layers };
    });
  };

  const loadDemo = useCallback(() => {
    const next = cloneProject(MEME_DEFAULT_PROJECT);
    next.width = 1080;
    next.height = 1080;
    next.background = { ...next.background, type: "gradient", from: "#f97316", to: "#db2777", angle: 135 };
    next.layers = [
      createLayer(next, {
        text: "WHEN THE DEMO DATA\nIS OPTIONAL",
        y: next.height * 0.23,
        size: Math.round(next.width * 0.075),
        maxWidth: 82,
        strokeWidth: Math.round(next.width * 0.007),
        color: "#ffffff",
      }),
      createLayer(next, {
        text: "AND THE TOOL\nSTILL SLAPS",
        y: next.height * 0.78,
        size: Math.round(next.width * 0.068),
        maxWidth: 84,
        strokeWidth: Math.round(next.width * 0.007),
        color: "#fde047",
        rotation: -2,
      }),
    ];
    next.watermark = true;
    setPast((items) => [...items.slice(-29), cloneProject(projectRef.current)]);
    setFuture([]);
    projectRef.current = next;
    setProject(next);
    setSelectedId(next.layers[0].id);
    setInspector("text");
    toast.success("Demo meme loaded");
  }, []);

  const resetCanvas = useCallback(() => {
    if (typeof window !== "undefined" && !window.confirm("Clear the canvas, image and every text layer?")) return;
    const next = cloneProject(MEME_DEFAULT_PROJECT);
    next.width = projectRef.current.width;
    next.height = projectRef.current.height;
    commit(next);
    setSelectedId(null);
    setImageName("");
    toast.success("Canvas cleared");
  }, [commit]);

  /* ------------------------------ Pointer ------------------------------ */

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * projectRef.current.width,
      y: ((event.clientY - rect.top) / rect.height) * projectRef.current.height,
    };
  };

  const handlePointerDown = (event) => {
    const point = pointFromEvent(event);
    const current = projectRef.current;
    const hit = [...current.layers]
      .reverse()
      .find((layer) => hitTest(layer, point.x, point.y, current.width));
    if (!hit) {
      setSelectedId(null);
      return;
    }
    setSelectedId(hit.id);
    setInspector("text");
    setPast((items) => [...items.slice(-29), cloneProject(current)]);
    setFuture([]);
    dragRef.current = { id: hit.id, dx: point.x - hit.x, dy: point.y - hit.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const point = pointFromEvent(event);
    const current = projectRef.current;
    applyTransient((state) => ({
      ...state,
      layers: state.layers.map((layer) =>
        layer.id === dragRef.current.id
          ? {
              ...layer,
              x: Math.round(Math.min(current.width, Math.max(0, point.x - dragRef.current.dx))),
              y: Math.round(Math.min(current.height, Math.max(0, point.y - dragRef.current.dy))),
            }
          : layer,
      ),
    }));
  };

  const handlePointerUp = () => {
    if (dragRef.current) {
      dragRef.current = null;
    }
  };

  const handleKeyDown = (event) => {
    if (!selectedLayer) return;
    const step = event.shiftKey ? 10 : 1;
    const map = {
      ArrowUp: { y: selectedLayer.y - step },
      ArrowDown: { y: selectedLayer.y + step },
      ArrowLeft: { x: selectedLayer.x - step },
      ArrowRight: { x: selectedLayer.x + step },
    };
    if (map[event.key]) {
      event.preventDefault();
      patchLayer(selectedLayer.id, map[event.key]);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteLayer(selectedLayer.id);
    } else if (event.key === "Escape") {
      setSelectedId(null);
    }
  };

  /* ------------------------------ Export ------------------------------- */

  const renderExportCanvas = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(project.width * exportScale);
    canvas.height = Math.round(project.height * exportScale);
    const context = canvas.getContext("2d");
    context.scale(exportScale, exportScale);
    drawScene(context, project, imageElement);
    return canvas;
  }, [project, exportScale, imageElement]);

  const exportMeme = useCallback(async () => {
    setExporting(true);
    try {
      const canvas = renderExportCanvas();
      const extension = exportFormat === "image/jpeg" ? "jpg" : exportFormat === "image/webp" ? "webp" : "png";
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, exportFormat, exportQuality));
      if (!blob) throw new Error("The browser could not encode this image.");
      downloadBlob(blob, safeFileName(fileName, extension));
      toast.success(`${extension.toUpperCase()} exported at ${exportScale}×`);
    } catch (error) {
      toast.error(error.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  }, [exportFormat, exportQuality, exportScale, fileName, renderExportCanvas]);

  const copyMeme = useCallback(async () => {
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error("Image clipboard is not supported in this browser.");
      }
      const canvas = renderExportCanvas();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Meme copied to the clipboard");
    } catch (error) {
      toast.error(error.message || "Could not copy the image.");
    }
  }, [renderExportCanvas]);

  const saveProjectJson = useCallback(() => {
    const payload = { app: "toolstrek-meme", version: 1, exportedAt: new Date().toISOString(), project };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    downloadBlob(blob, safeFileName(fileName, "json"));
    toast.success("Project JSON exported");
  }, [fileName, project]);

  const importProjectJson = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const incoming = parsed.project || parsed;
        if (!incoming || !Array.isArray(incoming.layers)) throw new Error("This file is not a meme project.");
        const next = { ...cloneProject(MEME_DEFAULT_PROJECT), ...incoming };
        next.background = { ...MEME_DEFAULT_PROJECT.background, ...(incoming.background || {}) };
        next.layers = incoming.layers.map((layer) => ({ ...createLayer(next), ...layer }));
        commit(next);
        setSelectedId(null);
        toast.success("Project imported");
      } catch (error) {
        toast.error(error.message || "Could not read that project file.");
      }
    };
    reader.readAsText(file);
  }, [commit]);

  const applySize = (size) => {
    commit((current) => ({ ...current, width: size.width, height: size.height }));
  };

  const activeSize = `${project.width}x${project.height}`;
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return (
    <div className="tool-page-content space-y-5">
      <Hero
        eyebrow="Meme studio"
        icon={Sparkles}
        title="Meme Generator"
        description="Build sharp, shareable memes with a real canvas editor. Add unlimited text layers, drag them into place, style every detail and export at up to three times the resolution — entirely in your browser."
        badges={["Blank by default", "Drag & style text", "Up to 3× export", "No uploads"]}
        tone="amber"
      />

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton variant="primary" tone="amber" icon={Plus} onClick={() => addLayer({ text: "New text" })}>
          Add text
        </ActionButton>
        <ActionButton icon={Type} onClick={addClassicCaptions}>
          Classic captions
        </ActionButton>
        <ActionButton icon={Undo2} onClick={undo} disabled={!canUndo}>
          Undo
        </ActionButton>
        <ActionButton icon={Redo2} onClick={redo} disabled={!canRedo}>
          Redo
        </ActionButton>
        <ActionButton icon={Wand2} onClick={loadDemo}>
          Load demo data
        </ActionButton>
        <ActionButton variant="ghost" icon={RotateCcw} onClick={resetCanvas} className="ml-auto">
          Reset canvas
        </ActionButton>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-5">
          <SectionCard
            icon={Palette}
            title="Canvas"
            description="Drag any text layer to position it. Click empty space to deselect."
            tone="amber"
            actions={
              <>
                <Chip tone="amber">{activeSize}</Chip>
                <Chip tone="violet">{project.layers.length} layers</Chip>
              </>
            }
          >
            <div
              ref={wrapperRef}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = Array.from(event.dataTransfer.files || []).find((entry) => entry.type.startsWith("image/"));
                if (file) loadImageFile(file);
              }}
              className="relative flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#f8fafc_0%_50%)] bg-[length:24px_24px] p-3 dark:border-slate-700 dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] sm:min-h-[420px]"
            >
              <canvas
                ref={canvasRef}
                tabIndex={0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={handleKeyDown}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const file = Array.from(event.dataTransfer.files || []).find((entry) => entry.type.startsWith("image/"));
                  if (file) loadImageFile(file);
                }}
                className="block max-h-[64vh] w-auto max-w-full touch-none rounded-xl shadow-2xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-amber-500 dark:ring-offset-slate-900"
                aria-label="Meme canvas. Select and drag text layers, or drop an image."
              />

              {!project.image && project.layers.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/80 text-white shadow-lg">
                    <ImagePlus className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-black text-slate-800 dark:text-white">Blank canvas</p>
                  <p className="max-w-xs text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                    Drop an image here, paste from the clipboard, or add your first text layer. Nothing is pre-filled.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <MousePointer2 className="h-3.5 w-3.5" /> Drag to move
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ArrowUp className="h-3.5 w-3.5" /> Arrow keys nudge
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Delete removes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clipboard className="h-3.5 w-3.5" /> Ctrl/Cmd + V pastes an image
              </span>
            </div>
          </SectionCard>

          <SectionCard
            icon={Layers}
            title="Text layers"
            description="Top of the list is drawn on top. Select a layer to edit it."
            tone="violet"
            actions={
              <ActionButton icon={Plus} onClick={() => addLayer({ text: "New text" })}>
                Add layer
              </ActionButton>
            }
          >
            {project.layers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">No text layers</p>
                <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Add a layer, or start from a blank top-and-bottom caption layout. The demo button fills a complete example
                  only when you ask for it.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <ActionButton variant="primary" tone="amber" icon={Plus} onClick={() => addLayer({ text: "New text" })}>
                    Add text layer
                  </ActionButton>
                  <ActionButton icon={Wand2} onClick={loadDemo}>
                    Load demo data
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {[...project.layers].reverse().map((layer) => {
                  const active = layer.id === selectedId;
                  return (
                    <div
                      key={layer.id}
                      className={`flex flex-wrap items-center gap-2 rounded-xl border p-2.5 transition ${
                        active
                          ? "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(layer.id);
                          setInspector("text");
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                          {layer.text ? layer.text.split("\n")[0] : "Empty text layer"}
                        </span>
                        <span className="block text-[13px] text-slate-500 dark:text-slate-400">
                          {layer.font} · {layer.size}px · {layer.align}
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => patchLayer(layer.id, { visible: !layer.visible })}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
                          aria-label={layer.visible ? `Hide ${layer.text || "layer"}` : `Show ${layer.text || "layer"}`}
                        >
                          {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLayer(layer.id, 1)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
                          aria-label="Bring layer forward"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLayer(layer.id, -1)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
                          aria-label="Send layer backward"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateLayer(layer.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
                          aria-label="Duplicate layer"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLayer(layer.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          aria-label="Delete layer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-5">
          <Segmented value={inspector} onChange={setInspector} options={INSPECTOR_TABS} columns={2} tone="amber" />

          {inspector === "text" && (
            <SectionCard
              icon={Type}
              title={selectedLayer ? "Selected text" : "Text controls"}
              description={
                selectedLayer
                  ? "Every option updates the canvas instantly."
                  : "Select a layer on the canvas or in the list to unlock its controls."
              }
              tone="amber"
            >
              {!selectedLayer ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center dark:border-slate-700 dark:bg-slate-800/30">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">No layer selected</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Add a text layer or click one on the canvas. Text fields start empty — type your own caption.
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <ActionButton variant="primary" tone="amber" icon={Plus} onClick={() => addLayer({ text: "New text" })}>
                      Add text layer
                    </ActionButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass} htmlFor="meme-layer-text">
                      Caption text
                    </label>
                    <textarea
                      id="meme-layer-text"
                      value={selectedLayer.text}
                      onChange={(event) => patchLayer(selectedLayer.id, { text: event.target.value })}
                      rows={3}
                      placeholder="Type your caption…"
                      className={`${fieldClass(false, "amber")} resize-y`}
                    />
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Line breaks are preserved.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} htmlFor="meme-layer-font">
                        Font
                      </label>
                      <select
                        id="meme-layer-font"
                        className={fieldClass(false, "amber")}
                        value={selectedLayer.font}
                        onChange={(event) => patchLayer(selectedLayer.id, { font: event.target.value })}
                      >
                        {MEME_FONTS.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className={labelClass}>Alignment</span>
                      <Segmented
                        value={selectedLayer.align}
                        onChange={(value) => patchLayer(selectedLayer.id, { align: value })}
                        options={TEXT_ALIGNS}
                        columns={3}
                        tone="amber"
                      />
                    </div>
                  </div>

                  <SliderRow
                    label="Font size"
                    value={selectedLayer.size}
                    min={12}
                    max={Math.round(project.width * 0.3)}
                    step={1}
                    onChange={(value) => patchLayer(selectedLayer.id, { size: value })}
                    format={(value) => `${value}px`}
                    tone="amber"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Text colour"
                      value={selectedLayer.color}
                      onChange={(value) => patchLayer(selectedLayer.id, { color: value })}
                    />
                    <ColorField
                      label="Outline"
                      value={selectedLayer.strokeColor}
                      onChange={(value) => patchLayer(selectedLayer.id, { strokeColor: value })}
                    />
                  </div>

                  <ToggleRow
                    checked={selectedLayer.fillType === "gradient"}
                    onChange={(value) => patchLayer(selectedLayer.id, { fillType: value ? "gradient" : "solid" })}
                    label="Gradient fill"
                    description="Blend two colours across the text instead of a solid colour."
                    tone="amber"
                  />

                  {selectedLayer.fillType === "gradient" && (
                    <div className="grid grid-cols-2 gap-3">
                      <ColorField
                        label="Gradient start"
                        value={selectedLayer.gradientFrom}
                        onChange={(value) => patchLayer(selectedLayer.id, { gradientFrom: value })}
                      />
                      <ColorField
                        label="Gradient end"
                        value={selectedLayer.gradientTo}
                        onChange={(value) => patchLayer(selectedLayer.id, { gradientTo: value })}
                      />
                    </div>
                  )}

                  <SliderRow
                    label="Outline width"
                    value={selectedLayer.strokeWidth}
                    min={0}
                    max={Math.round(project.width * 0.03)}
                    step={1}
                    onChange={(value) => patchLayer(selectedLayer.id, { strokeWidth: value })}
                    format={(value) => `${value}px`}
                    tone="amber"
                  />

                  <SliderRow
                    label="Opacity"
                    value={Math.round(selectedLayer.opacity * 100)}
                    min={10}
                    max={100}
                    step={1}
                    onChange={(value) => patchLayer(selectedLayer.id, { opacity: value / 100 })}
                    format={(value) => `${value}%`}
                    tone="amber"
                  />

                  <SliderRow
                    label="Rotation"
                    value={selectedLayer.rotation}
                    min={-45}
                    max={45}
                    step={1}
                    onChange={(value) => patchLayer(selectedLayer.id, { rotation: value })}
                    format={(value) => `${value}°`}
                    tone="amber"
                  />

                  <SliderRow
                    label="Line height"
                    value={selectedLayer.lineHeight}
                    min={0.8}
                    max={1.8}
                    step={0.02}
                    onChange={(value) => patchLayer(selectedLayer.id, { lineHeight: value })}
                    format={(value) => value.toFixed(2)}
                    tone="amber"
                  />

                  <SliderRow
                    label="Letter spacing"
                    value={selectedLayer.letterSpacing}
                    min={-6}
                    max={24}
                    step={1}
                    onChange={(value) => patchLayer(selectedLayer.id, { letterSpacing: value })}
                    format={(value) => `${value}px`}
                    tone="amber"
                  />

                  <SliderRow
                    label="Max line width"
                    value={selectedLayer.maxWidth}
                    min={20}
                    max={100}
                    step={1}
                    onChange={(value) => patchLayer(selectedLayer.id, { maxWidth: value })}
                    format={(value) => `${value}%`}
                    hint="Long captions wrap automatically at this width."
                    tone="amber"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className={labelClass}>Horizontal position</span>
                      <input
                        type="number"
                        value={Math.round(selectedLayer.x)}
                        min={0}
                        max={project.width}
                        onChange={(event) => patchLayer(selectedLayer.id, { x: Number(event.target.value) })}
                        className={fieldClass(false, "amber")}
                        aria-label="Horizontal position"
                      />
                    </div>
                    <div>
                      <span className={labelClass}>Vertical position</span>
                      <input
                        type="number"
                        value={Math.round(selectedLayer.y)}
                        min={0}
                        max={project.height}
                        onChange={(event) => patchLayer(selectedLayer.id, { y: Number(event.target.value) })}
                        className={fieldClass(false, "amber")}
                        aria-label="Vertical position"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <ToggleRow
                      checked={selectedLayer.uppercase}
                      onChange={(value) => patchLayer(selectedLayer.id, { uppercase: value })}
                      label="Uppercase"
                      description="Classic meme styling — convert every character to capitals."
                      tone="amber"
                    />
                    <ToggleRow
                      checked={selectedLayer.shadow}
                      onChange={(value) => patchLayer(selectedLayer.id, { shadow: value })}
                      label="Drop shadow"
                      description="Improves readability over busy photos."
                      tone="amber"
                    />
                    <ToggleRow
                      checked={selectedLayer.highlight}
                      onChange={(value) => patchLayer(selectedLayer.id, { highlight: value })}
                      label="Highlight box"
                      description="Draws a solid box behind the caption."
                      tone="amber"
                    />
                  </div>

                  {selectedLayer.highlight && (
                    <ColorField
                      label="Highlight colour"
                      value={selectedLayer.highlightColor}
                      onChange={(value) => patchLayer(selectedLayer.id, { highlightColor: value })}
                    />
                  )}

                  <div className="flex flex-wrap gap-2">
                    <ActionButton icon={Copy} onClick={() => duplicateLayer(selectedLayer.id)}>
                      Duplicate
                    </ActionButton>
                    <ActionButton variant="danger" icon={Trash2} onClick={() => deleteLayer(selectedLayer.id)}>
                      Delete
                    </ActionButton>
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {inspector === "canvas" && (
            <SectionCard icon={Maximize} title="Canvas & background" description="Set the output size and the backdrop." tone="violet">
              <div className="space-y-4">
                <div>
                  <span className={labelClass}>Aspect preset</span>
                  <div className="grid grid-cols-2 gap-2">
                    {MEME_SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => applySize(size)}
                        aria-pressed={activeSize === size.value}
                        className={`rounded-xl border p-2.5 text-left transition ${
                          activeSize === size.value
                            ? "border-violet-400 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/40"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50"
                        }`}
                      >
                        <span className="block text-sm font-black text-slate-900 dark:text-white">{size.label}</span>
                        <span className="block text-[13px] text-slate-500 dark:text-slate-400">{size.blurb}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="meme-width">
                      Width
                    </label>
                    <input
                      id="meme-width"
                      type="number"
                      min={320}
                      max={4096}
                      value={project.width}
                      onChange={(event) =>
                        commit((current) => ({ ...current, width: Math.min(4096, Math.max(320, Number(event.target.value) || 320)) }))
                      }
                      className={fieldClass(false, "violet")}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="meme-height">
                      Height
                    </label>
                    <input
                      id="meme-height"
                      type="number"
                      min={320}
                      max={4096}
                      value={project.height}
                      onChange={(event) =>
                        commit((current) => ({ ...current, height: Math.min(4096, Math.max(320, Number(event.target.value) || 320)) }))
                      }
                      className={fieldClass(false, "violet")}
                    />
                  </div>
                </div>

                <div>
                  <span className={labelClass}>Background presets</span>
                  <div className="grid grid-cols-4 gap-2">
                    {MEME_BACKGROUNDS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          commit((current) => ({
                            ...current,
                            background:
                              preset.type === "solid"
                                ? { ...current.background, type: "solid", color: preset.color }
                                : { ...current.background, type: "gradient", from: preset.from, to: preset.to, angle: preset.angle },
                          }))
                        }
                        className="group overflow-hidden rounded-xl border border-slate-200 text-left dark:border-slate-700"
                        aria-label={`Use ${preset.name} background`}
                      >
                        <span
                          className="block h-10 w-full"
                          style={{
                            background:
                              preset.type === "solid"
                                ? preset.color
                                : `linear-gradient(${preset.angle}deg, ${preset.from}, ${preset.to})`,
                          }}
                        />
                        <span className="block px-1.5 py-1 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Segmented
                  value={project.background.type}
                  onChange={(value) => commit((current) => ({ ...current, background: { ...current.background, type: value } }))}
                  options={[
                    { value: "solid", label: "Solid" },
                    { value: "gradient", label: "Gradient" },
                  ]}
                  columns={2}
                  tone="violet"
                />

                {project.background.type === "solid" ? (
                  <ColorField
                    label="Background colour"
                    value={project.background.color}
                    onChange={(value) =>
                      commit((current) => ({ ...current, background: { ...current.background, color: value } }))
                    }
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <ColorField
                        label="Gradient start"
                        value={project.background.from}
                        onChange={(value) =>
                          commit((current) => ({ ...current, background: { ...current.background, from: value } }))
                        }
                      />
                      <ColorField
                        label="Gradient end"
                        value={project.background.to}
                        onChange={(value) =>
                          commit((current) => ({ ...current, background: { ...current.background, to: value } }))
                        }
                      />
                    </div>
                    <SliderRow
                      label="Gradient angle"
                      value={project.background.angle}
                      min={0}
                      max={360}
                      step={1}
                      onChange={(value) =>
                        commit((current) => ({ ...current, background: { ...current.background, angle: value } }))
                      }
                      format={(value) => `${value}°`}
                      tone="violet"
                    />
                  </>
                )}

                <SliderRow
                  label="Dark overlay"
                  value={project.background.overlay}
                  min={0}
                  max={80}
                  step={1}
                  onChange={(value) =>
                    commit((current) => ({ ...current, background: { ...current.background, overlay: value } }))
                  }
                  format={(value) => `${value}%`}
                  hint="Darkens photos so white captions stay readable."
                  tone="violet"
                />

                <ToggleRow
                  checked={project.watermark}
                  onChange={(value) => commit((current) => ({ ...current, watermark: value }))}
                  label="ToolsTrek credit"
                  description="Adds a small, subtle credit in the bottom-right corner."
                  tone="violet"
                />
              </div>
            </SectionCard>
          )}

          {inspector === "image" && (
            <SectionCard icon={ImagePlus} title="Background image" description="Upload, paste or drop a photo, then fine-tune the framing." tone="sky">
              <div className="space-y-4">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    loadImageFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    loadImageFile(event.dataTransfer.files?.[0]);
                  }}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center transition hover:border-sky-400 hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:border-sky-600"
                >
                  <Upload className="h-6 w-6 text-sky-600 dark:text-sky-300" />
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">Upload an image</span>
                  <span className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                    PNG, JPEG, WebP, GIF or AVIF · up to 24 MB · or paste with Ctrl/Cmd + V
                  </span>
                </button>

                {project.image ? (
                  <>
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{imageName || "Pasted image"}</p>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400">Loaded in memory only</p>
                      </div>
                      <ActionButton
                        variant="danger"
                        icon={Trash2}
                        onClick={() => {
                          commit((current) => ({ ...current, image: "" }));
                          setImageName("");
                        }}
                      >
                        Remove
                      </ActionButton>
                    </div>

                    <Segmented
                      value={project.imageFit}
                      onChange={(value) => commit((current) => ({ ...current, imageFit: value }))}
                      options={[
                        { value: "cover", label: "Fill frame" },
                        { value: "contain", label: "Fit inside" },
                      ]}
                      columns={2}
                      tone="sky"
                    />

                    <SliderRow
                      label="Zoom"
                      value={project.imageScale}
                      min={0.2}
                      max={3}
                      step={0.02}
                      onChange={(value) => commit((current) => ({ ...current, imageScale: value }))}
                      format={(value) => `${value.toFixed(2)}×`}
                      tone="sky"
                    />

                    <SliderRow
                      label="Horizontal offset"
                      value={project.imageX}
                      min={-Math.round(project.width / 2)}
                      max={Math.round(project.width / 2)}
                      step={2}
                      onChange={(value) => commit((current) => ({ ...current, imageX: value }))}
                      format={(value) => `${value}px`}
                      tone="sky"
                    />

                    <SliderRow
                      label="Vertical offset"
                      value={project.imageY}
                      min={-Math.round(project.height / 2)}
                      max={Math.round(project.height / 2)}
                      step={2}
                      onChange={(value) => commit((current) => ({ ...current, imageY: value }))}
                      format={(value) => `${value}px`}
                      tone="sky"
                    />

                    <SliderRow
                      label="Image opacity"
                      value={Math.round(project.imageOpacity * 100)}
                      min={10}
                      max={100}
                      step={1}
                      onChange={(value) => commit((current) => ({ ...current, imageOpacity: value / 100 }))}
                      format={(value) => `${value}%`}
                      tone="sky"
                    />

                    <SliderRow
                      label="Blur"
                      value={project.imageBlur}
                      min={0}
                      max={24}
                      step={1}
                      onChange={(value) => commit((current) => ({ ...current, imageBlur: value }))}
                      format={(value) => `${value}px`}
                      tone="sky"
                    />
                  </>
                ) : (
                  <Callout tone="sky" variant="info" title="No image yet">
                    Add a photo or keep the generated background. Images are read locally with the File API and never leave
                    your device.
                  </Callout>
                )}
              </div>
            </SectionCard>
          )}

          {inspector === "export" && (
            <SectionCard icon={Download} title="Export & project" description="Download an image or save the editable project." tone="emerald">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Canvas" value={`${project.width} × ${project.height}`} tone="violet" />
                  <Stat label="Output" value={`${Math.round(project.width * exportScale)} × ${Math.round(project.height * exportScale)}`} tone="emerald" />
                </div>

                <Segmented
                  value={exportFormat}
                  onChange={setExportFormat}
                  options={[
                    { value: "image/png", label: "PNG" },
                    { value: "image/jpeg", label: "JPEG" },
                    { value: "image/webp", label: "WebP" },
                  ]}
                  columns={3}
                  tone="emerald"
                />

                <Segmented
                  value={String(exportScale)}
                  onChange={(value) => setExportScale(Number(value))}
                  options={[
                    { value: "1", label: "1×" },
                    { value: "2", label: "2×" },
                    { value: "3", label: "3×" },
                  ]}
                  columns={3}
                  tone="emerald"
                />

                {exportFormat !== "image/png" && (
                  <SliderRow
                    label="Quality"
                    value={Math.round(exportQuality * 100)}
                    min={50}
                    max={100}
                    step={1}
                    onChange={(value) => setExportQuality(value / 100)}
                    format={(value) => `${value}%`}
                    tone="emerald"
                  />
                )}

                <div>
                  <label className={labelClass} htmlFor="meme-file-name">
                    File name
                  </label>
                  <input
                    id="meme-file-name"
                    value={fileName}
                    onChange={(event) => setFileName(event.target.value)}
                    className={fieldClass(false, "emerald")}
                    placeholder="my-meme"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <ActionButton variant="primary" tone="emerald" icon={Download} onClick={exportMeme} disabled={exporting}>
                    {exporting ? "Rendering…" : "Download image"}
                  </ActionButton>
                  <ActionButton icon={Clipboard} onClick={copyMeme}>
                    Copy PNG
                  </ActionButton>
                </div>

                <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Editable project</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                    Export a JSON project to keep text, layers, settings and the embedded image. Import it later on any
                    device — the file never touches a server.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <ActionButton icon={FileJson} onClick={saveProjectJson}>
                      Export JSON
                    </ActionButton>
                    <ActionButton icon={Upload} onClick={() => jsonInputRef.current?.click()}>
                      Import JSON
                    </ActionButton>
                    <input
                      ref={jsonInputRef}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(event) => {
                        importProjectJson(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </div>
                </div>

                <Callout tone="emerald" variant="success" title="Autosaved locally">
                  Your canvas is restored from this browser when you return. Clearing site data removes it permanently.
                </Callout>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      <FaqAccordion items={MEME_FAQS} tone="amber" />
    </div>
  );
}
