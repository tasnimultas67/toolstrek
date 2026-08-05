"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Upload,
  Download,
  Copy,
  Check,
  FileCode,
  Trash2,
  Settings,
  ChevronDown,
  Sliders,
  Palette,
  Eye,
  Info,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  FileWarning,
  User,
  Mail,
  Github,
  Linkedin,
  HelpCircle,
  FolderOpen,
  Sparkles,
  Code,
  RotateCcw
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { cn } from "@/lib/utils";

// ─── Default SVG Presets ──────────────────────────────────────────────────────
const PRESETS = [
  {
    id: "home",
    name: "Home",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#7c00fe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <polyline points="9 22 9 12 15 12 15 22"/>
</svg>`
  },
  {
    id: "gear",
    name: "Gear",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 17a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
</svg>`
  },
  {
    id: "heart",
    name: "Heart",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
</svg>`
  },
  {
    id: "star",
    name: "Star",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>`
  },
  {
    id: "cart",
    name: "Cart",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="8" cy="21" r="1" fill="#10b981"/>
  <circle cx="19" cy="21" r="1" fill="#10b981"/>
  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
</svg>`
  },
  {
    id: "wave",
    name: "Wave",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c00fe"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <path fill="url(#wg)" d="M0,35 C25,50 65,15 100,35 L100,100 L0,100 Z"/>
  <circle cx="50" cy="30" r="12" fill="#eab308" opacity="0.9"/>
</svg>`
  }
];

// ─── Helper: Format XML ───────────────────────────────────────────────────────
function formatXml(xmlStr) {
  let formatted = "";
  let pad = 0;
  let clean = xmlStr.replace(/>\s*</g, "><");
  clean = clean.replace(/(>)(<)(\/*)/g, "$1\r\n$2$3");
  const lines = clean.split("\r\n");
  const indentChar = "  ";
  lines.forEach((line) => {
    let indentLevel = 0;
    if (line.match(/^\s*<!/)) {
      // Comments / doctype — no change
    } else if (line.match(/^\s*<\/\w/)) {
      if (pad !== 0) pad -= 1;
    } else if (line.match(/^\s*<\w[^>]*[^/]>$/)) {
      indentLevel = 1;
    }
    formatted += indentChar.repeat(pad) + line.trim() + "\n";
    pad += indentLevel;
  });
  return formatted.trim();
}

export default function SVGEditor() {
  const [svgText, setSvgText] = useState(PRESETS[0].code);
  const [parseError, setParseError] = useState(null);

  // Preview blob URL — rebuilt whenever svgText changes
  const [previewUrl, setPreviewUrl] = useState(null);

  // UI state
  const [copiedType, setCopiedType] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [activeTab, setActiveTab] = useState("attributes");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Editor gutter
  const lineGutterRef = useRef(null);
  const fileInputRef = useRef(null);

  // Preview controls
  const [zoom, setZoom] = useState(80);
  const [bgType, setBgType] = useState("grid");
  const [customBgColor, setCustomBgColor] = useState("#2563eb");

  // Extracted SVG attributes
  const [svgProps, setSvgProps] = useState({
    width: "24", height: "24",
    minX: "0", minY: "0", vbWidth: "24", vbHeight: "24",
    title: "", desc: "", colors: []
  });
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Export options
  const [exportWidth, setExportWidth] = useState(512);
  const [exportHeight, setExportHeight] = useState(512);
  const [exportFormat, setExportFormat] = useState("png");
  const [exportQuality, setExportQuality] = useState(95);

  // ── Line count ───────────────────────────────────────────────────────────────
  const lineCount = useMemo(() => svgText.split("\n").length, [svgText]);

  const handleScroll = (e) => {
    if (lineGutterRef.current) lineGutterRef.current.scrollTop = e.target.scrollTop;
  };

  // ── Build blob preview URL whenever source changes ───────────────────────────
  useEffect(() => {
    // Revoke previous object URL to prevent memory leaks
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    if (!svgText.trim()) {
      setParseError("SVG source code is empty.");
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");

      if (parserError) {
        // Extract a readable error message from the parsererror node
        const errText = parserError.textContent?.trim() || "XML syntax error.";
        setParseError(errText);
        return;
      }

      setParseError(null);
      const root = doc.documentElement;

      // Ensure root has xmlns (required for blob rendering as image/svg+xml)
      if (!root.getAttribute("xmlns")) {
        root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }

      const serializer = new XMLSerializer();
      const fixedSvg = serializer.serializeToString(doc);

      // Build a blob URL for safe, reliable preview rendering
      const blob = new Blob([fixedSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Extract properties for controls
      const w = root.getAttribute("width") || "24";
      const h = root.getAttribute("height") || "24";
      let minX = "0", minY = "0", vbW = "24", vbH = "24";
      const vb = root.getAttribute("viewBox");
      if (vb) {
        const parts = vb.trim().split(/[\s,]+/);
        if (parts.length === 4) {
          [minX, minY, vbW, vbH] = parts;
        }
      } else {
        const pw = parseFloat(w), ph = parseFloat(h);
        if (!isNaN(pw) && pw > 0) vbW = String(pw);
        if (!isNaN(ph) && ph > 0) vbH = String(ph);
      }

      const ar = parseFloat(vbW) / parseFloat(vbH);
      if (!isNaN(ar) && ar > 0) setAspectRatio(ar);

      const titleEl = root.querySelector("title");
      const descEl = root.querySelector("desc");

      // Collect all fill/stroke colors
      const colorsSet = new Set();
      const scanColors = (node) => {
        if (node.nodeType === 1) {
          const fill = node.getAttribute("fill");
          const stroke = node.getAttribute("stroke");
          const stop = node.getAttribute("stop-color");
          [fill, stroke, stop].forEach((c) => {
            if (c && c !== "none" && c !== "currentColor" && c !== "inherit" && !c.startsWith("url(")) {
              colorsSet.add(c.trim());
            }
          });
          const style = node.getAttribute("style");
          if (style) {
            const matches = [...style.matchAll(/(fill|stroke|stop-color)\s*:\s*([^;]+)/gi)];
            matches.forEach((m) => {
              const val = m[2].trim();
              if (val && val !== "none" && val !== "currentColor" && val !== "inherit" && !val.startsWith("url(")) {
                colorsSet.add(val);
              }
            });
          }
        }
        node.childNodes.forEach(scanColors);
      };
      scanColors(root);

      setSvgProps({
        width: w, height: h, minX, minY, vbWidth: vbW, vbHeight: vbH,
        title: titleEl?.textContent || "",
        desc: descEl?.textContent || "",
        colors: Array.from(colorsSet)
      });

    } catch (err) {
      setParseError(err.message || "Failed to parse SVG.");
    }

    // Cleanup on unmount
    return () => {
      setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    };
  }, [svgText]);

  // ── Attribute mutation helper ────────────────────────────────────────────────
  const mutateSvg = useCallback((mutatorFn) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error("Fix syntax errors first.");
      const root = doc.documentElement;
      mutatorFn(root, doc);
      const serializer = new XMLSerializer();
      setSvgText(formatXml(serializer.serializeToString(doc)));
    } catch (err) {
      setParseError(err.message);
    }
  }, [svgText]);

  // ── Format / Minify ──────────────────────────────────────────────────────────
  const handleFormat = () => {
    try { setSvgText(formatXml(svgText)); } catch { setParseError("Cannot format: invalid syntax."); }
  };

  const handleMinify = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error();
      // Strip comments
      const strip = (n) => {
        [...n.childNodes].forEach((c) => {
          if (c.nodeType === 8) n.removeChild(c);
          else strip(c);
        });
      };
      strip(doc);
      let out = new XMLSerializer().serializeToString(doc);
      out = out.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
      setSvgText(out);
    } catch { setParseError("Cannot minify: invalid syntax."); }
  };

  // ── Dimension & viewBox changes ──────────────────────────────────────────────
  const handleDimensionChange = (key, value) => {
    mutateSvg((root) => {
      root.setAttribute(key, value);
      if (lockAspect && aspectRatio > 0) {
        const num = parseFloat(value);
        if (!isNaN(num) && num > 0) {
          if (key === "width") root.setAttribute("height", String(Math.round(num / aspectRatio)));
          else root.setAttribute("width", String(Math.round(num * aspectRatio)));
        }
      }
    });
  };

  const handleViewBoxChange = (param, value) => {
    mutateSvg((root) => {
      const parts = { minX: svgProps.minX, minY: svgProps.minY, vbWidth: svgProps.vbWidth, vbHeight: svgProps.vbHeight };
      parts[param] = value;
      root.setAttribute("viewBox", `${parts.minX} ${parts.minY} ${parts.vbWidth} ${parts.vbHeight}`);
    });
  };

  // ── A11y title/desc update ───────────────────────────────────────────────────
  const handleA11yUpdate = (tagName, value) => {
    mutateSvg((root, doc) => {
      let el = root.querySelector(tagName);
      if (value.trim()) {
        if (!el) { el = doc.createElementNS("http://www.w3.org/2000/svg", tagName); root.insertBefore(el, root.firstChild); }
        el.textContent = value;
      } else if (el) el.remove();
    });
  };

  // ── Global color replace ─────────────────────────────────────────────────────
  const handleColorReplace = (oldColor, newColor) => {
    mutateSvg((root) => {
      const replace = (node) => {
        if (node.nodeType === 1) {
          ["fill", "stroke", "stop-color"].forEach((attr) => {
            const v = node.getAttribute(attr);
            if (v && v.toLowerCase().trim() === oldColor.toLowerCase()) node.setAttribute(attr, newColor);
          });
          const style = node.getAttribute("style");
          if (style) {
            const esc = oldColor.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            node.setAttribute("style",
              style
                .replace(new RegExp(`(fill\\s*:\\s*)${esc}(?=[;\\s]|$)`, "gi"), `$1${newColor}`)
                .replace(new RegExp(`(stroke\\s*:\\s*)${esc}(?=[;\\s]|$)`, "gi"), `$1${newColor}`)
                .replace(new RegExp(`(stop-color\\s*:\\s*)${esc}(?=[;\\s]|$)`, "gi"), `$1${newColor}`)
            );
          }
        }
        node.childNodes.forEach(replace);
      };
      replace(root);
    });
  };

  // ── File upload handlers ─────────────────────────────────────────────────────
  const loadFile = (file) => {
    if (!file) return;
    const name = file.name || "";
    const isSvg = file.type === "image/svg+xml" || file.type === "text/xml" || file.type === "application/xml" || name.toLowerCase().endsWith(".svg");
    if (!isSvg) { setParseError("Please upload a valid .svg file."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setSvgText(ev.target.result || "");
    reader.readAsText(file);
    // Reset input so same file can be re-loaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    loadFile(e.dataTransfer.files[0]);
  };

  const handleFileUpload = (e) => loadFile(e.target.files[0]);

  // ── Clipboard helpers ────────────────────────────────────────────────────────
  const handleCopy = (type, text) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const getReactJsx = () => {
    const jsxReplacements = [
      [/\bclass=/g, "className="],
      [/stroke-width=/g, "strokeWidth="],
      [/stroke-linecap=/g, "strokeLinecap="],
      [/stroke-linejoin=/g, "strokeLinejoin="],
      [/stroke-miterlimit=/g, "strokeMiterlimit="],
      [/stroke-dasharray=/g, "strokeDasharray="],
      [/stroke-dashoffset=/g, "strokeDashoffset="],
      [/stroke-opacity=/g, "strokeOpacity="],
      [/fill-rule=/g, "fillRule="],
      [/fill-opacity=/g, "fillOpacity="],
      [/clip-rule=/g, "clipRule="],
      [/clip-path=/g, "clipPath="],
      [/font-size=/g, "fontSize="],
      [/font-family=/g, "fontFamily="],
      [/stop-color=/g, "stopColor="],
      [/stop-opacity=/g, "stopOpacity="],
      [/xmlns:xlink=/g, "xmlnsXlink="],
      [/xlink:href=/g, "xlinkHref="],
    ];
    let code = svgText;
    jsxReplacements.forEach(([from, to]) => { code = code.replace(from, to); });
    const indented = code.split("\n").map((l) => "    " + l).join("\n");
    return `import React from 'react';\n\nexport default function SvgIcon({ size = 24, ...props }) {\n  return (\n${indented}\n  );\n}`;
  };

  const getBase64Uri = () => {
    try { return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`; }
    catch { return ""; }
  };

  // ── SVG file download ────────────────────────────────────────────────────────
  const downloadSvg = () => {
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "icon.svg";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ── Raster export via canvas ─────────────────────────────────────────────────
  const handleRasterExport = () => {
    const uri = getBase64Uri();
    if (!uri) { setParseError("Cannot export: invalid SVG."); return; }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = exportWidth; canvas.height = exportHeight;
      const ctx = canvas.getContext("2d");
      if (exportFormat === "jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, exportWidth, exportHeight); }
      ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
      const mime = exportFormat === "jpeg" ? "image/jpeg" : `image/${exportFormat}`;
      const url = canvas.toDataURL(mime, exportQuality / 100);
      const a = document.createElement("a");
      a.href = url; a.download = `export.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    img.onerror = () => setParseError("Raster export failed. Check SVG validity.");
    img.src = uri;
  };

  // ── Background style helper ──────────────────────────────────────────────────
  const bgStyle = useMemo(() => {
    if (bgType === "grid") return {
      backgroundImage: "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
      backgroundSize: "16px 16px",
      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
      backgroundColor: "#f9fafb"
    };
    if (bgType === "dark-grid") return {
      backgroundImage: "linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)",
      backgroundSize: "16px 16px",
      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
      backgroundColor: "#18181b"
    };
    if (bgType === "light") return { backgroundColor: "#ffffff" };
    if (bgType === "dark") return { backgroundColor: "#09090b" };
    return { backgroundColor: customBgColor };
  }, [bgType, customBgColor]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="flex flex-col gap-5 w-full animate-fadeIn">

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 bg-brandColor/10 text-brandColor px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Developer Utility
            </span>
            <h1 className="text-[20px] md:text-[26px] font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
              <FileCode className="w-6 md:w-7 h-6 md:h-7 text-brandColor shrink-0" />
              SVG Editor &amp; Live Visualizer
            </h1>
            <p className="text-[12px] md:text-[14px] text-gray-500 dark:text-gray-400 max-w-2xl font-medium leading-relaxed">
              Upload or paste SVG markup, edit live, adjust viewBox &amp; dimensions, replace colors globally, and export to SVG, React JSX, Base64, PNG, JPEG, or WebP.
            </p>
          </div>
          <div className="flex gap-2.5 flex-shrink-0 flex-wrap">
            <div className="bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-center min-w-[60px]">
              <span className="block text-[10px] text-gray-400 uppercase font-black tracking-wider">Lines</span>
              <span className="text-[13px] md:text-[14px] font-black text-gray-700 dark:text-gray-300 font-mono">{lineCount}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-center min-w-[70px]">
              <span className="block text-[10px] text-gray-400 uppercase font-black tracking-wider">Size</span>
              <span className="text-[13px] md:text-[14px] font-black text-gray-700 dark:text-gray-300 font-mono">
                {(new Blob([svgText]).size / 1024).toFixed(1)}KB
              </span>
            </div>
          </div>
        </div>

        {/* ── Upload / Presets Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Dropzone */}
          <label
            htmlFor="svg-file-upload"
            onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleFileDrop}
            className={cn(
              "lg:col-span-2 flex flex-col items-center justify-center gap-3 p-7 border-2 border-dashed rounded-3xl transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900",
              isDraggingFile
                ? "border-brandColor bg-brandColor/5 scale-[1.01]"
                : "border-gray-200 dark:border-gray-800 hover:border-brandColor/60 hover:bg-brandColor/[0.03]"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="svg-file-upload"
              accept=".svg,image/svg+xml"
              className="sr-only"
              onChange={handleFileUpload}
            />
            <div className={cn("p-3.5 rounded-2xl transition-colors", isDraggingFile ? "bg-brandColor/20 text-brandColor" : "bg-brandColor/10 text-brandColor")}>
              <Upload className="w-5 md:w-6 h-5 md:h-6" />
            </div>
            <div className="text-center">
              <p className="text-[13px] md:text-[14px] font-extrabold text-gray-800 dark:text-gray-200">
                {isDraggingFile ? "Drop your SVG file here" : "Drag & Drop SVG file or click to browse"}
              </p>
              <p className="text-[11px] md:text-[12px] text-gray-400 mt-0.5 font-medium">Supports .svg files &bull; All SVG specifications</p>
            </div>
          </label>

          {/* Presets */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-xs flex flex-col gap-3">
            <div>
              <h2 className="text-[12px] md:text-[13px] font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-brandColor" />
                Sample Templates
              </h2>
              <p className="text-[11px] md:text-[12px] text-gray-400 font-medium mt-0.5">Click any preset to load it instantly.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSvgText(p.code)}
                  className="px-2 py-2 text-[11px] md:text-[12px] font-bold rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 hover:border-brandColor/40 hover:bg-brandColor/5 text-gray-700 dark:text-gray-300 transition duration-150 cursor-pointer truncate"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Editor + Preview Split ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* LEFT: Code Editor */}
          <div className="lg:col-span-7 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xs">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-150 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/30 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-brandColor" />
                <span className="text-[12px] md:text-[14px] font-black text-gray-800 dark:text-gray-200">SVG Source Code</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={handleFormat} title="Prettify" className="px-2.5 py-1 text-[11px] md:text-[12px] font-bold text-brandColor bg-brandColor/10 rounded-lg hover:bg-brandColor hover:text-white transition cursor-pointer">Prettify</button>
                <button onClick={handleMinify} title="Minify" className="px-2.5 py-1 text-[11px] md:text-[12px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-750 transition cursor-pointer">Minify</button>
                <button onClick={() => setSvgText("")} title="Clear" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Parse error banner */}
            {parseError && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-950/40 text-red-700 dark:text-red-400 flex-shrink-0">
                <FileWarning className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] md:text-[12px] font-mono font-medium leading-normal break-all">{parseError}</p>
              </div>
            )}

            {/* Code textarea with gutter */}
            <div className="flex overflow-hidden" style={{ height: "440px" }}>
              {/* Line numbers */}
              <div
                ref={lineGutterRef}
                className="w-10 py-4 select-none border-r border-gray-800 text-right pr-2.5 text-gray-600 bg-gray-950 overflow-hidden shrink-0"
                style={{ fontSize: "11px", lineHeight: "1.625rem" }}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Textarea */}
              <textarea
                value={svgText}
                onChange={(e) => setSvgText(e.target.value)}
                onScroll={handleScroll}
                placeholder="Paste or type SVG markup here…"
                spellCheck={false}
                className="flex-1 p-4 bg-gray-950 text-gray-100 resize-none border-none outline-none font-mono overflow-y-auto placeholder-gray-700 focus:ring-0"
                style={{ fontSize: "12px", lineHeight: "1.625rem" }}
              />
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="lg:col-span-5 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xs">
            {/* Preview toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-150 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/30 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brandColor" />
                <span className="text-[12px] md:text-[14px] font-black text-gray-800 dark:text-gray-200">Live Preview</span>
              </div>
              <button
                onClick={() => setZoom(80)}
                title="Reset zoom"
                className="text-[11px] font-black text-gray-400 hover:text-brandColor transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> {zoom}%
              </button>
            </div>

            {/* Preview canvas */}
            <div
              className="relative flex-1 flex items-center justify-center overflow-hidden"
              style={{ ...bgStyle, minHeight: "300px" }}
            >
              {parseError ? (
                /* Error state */
                <div className="absolute inset-0 bg-gray-900/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-2 z-10">
                  <FileWarning className="w-8 h-8 text-red-400" />
                  <p className="text-[13px] md:text-[14px] font-bold text-white">Render Blocked</p>
                  <p className="text-[11px] md:text-[12px] text-gray-400 max-w-[220px]">Fix the XML error shown in the editor to update the preview.</p>
                </div>
              ) : previewUrl ? (
                /* SVG rendered safely via blob URL — works for ALL uploaded SVGs */
                <img
                  src={previewUrl}
                  alt="SVG Preview"
                  className="transition-all duration-150 ease-out select-none"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "center center",
                    maxWidth: "90%",
                    maxHeight: "90%",
                    width: "auto",
                    height: "auto",
                    display: "block",
                  }}
                  draggable={false}
                />
              ) : (
                <div className="text-gray-400 text-[12px] font-medium">Loading preview…</div>
              )}
            </div>

            {/* Preview controls */}
            <div className="p-3.5 border-t border-gray-150 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/30 flex flex-col gap-3 flex-shrink-0">
              {/* Zoom + background row */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                {/* Zoom */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-1 hover:text-brandColor hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range" min="10" max="300" step="5" value={zoom}
                    onChange={(e) => setZoom(parseInt(e.target.value))}
                    className="w-20 md:w-24 accent-brandColor cursor-pointer"
                    style={{ height: "4px" }}
                  />
                  <button onClick={() => setZoom(Math.min(300, zoom + 10))} className="p-1 hover:text-brandColor hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Background toggle */}
                <div className="flex items-center gap-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-0.5 rounded-xl overflow-hidden">
                  {["grid", "light", "dark", "dark-grid", "custom"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setBgType(t)}
                      className={cn(
                        "px-2 py-1 text-[10px] md:text-[11px] font-bold rounded-lg capitalize transition cursor-pointer whitespace-nowrap",
                        bgType === t ? "bg-brandColor text-white" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom color picker */}
              {bgType === "custom" && (
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl animate-fadeIn">
                  <input type="color" value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer bg-transparent" />
                  <input type="text" value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} className="flex-1 bg-transparent border-none text-[11px] md:text-[12px] font-mono focus:ring-0 text-gray-700 dark:text-gray-300" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Advanced Controls Tabs ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xs overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-150 dark:border-gray-800 overflow-x-auto bg-gray-50/50 dark:bg-gray-950/20">
            {[
              { id: "attributes", label: "Properties & ViewBox", icon: Sliders },
              { id: "colors", label: "Color Palette", icon: Palette },
              { id: "a11y", label: "Optimize & A11y", icon: Settings },
              { id: "export", label: "Export Hub", icon: Download },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3.5 border-b-2 font-bold text-[12px] md:text-[13px] whitespace-nowrap transition cursor-pointer",
                  activeTab === id ? "border-brandColor text-brandColor" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5 md:p-6">

            {/* TAB: Properties & ViewBox */}
            {activeTab === "attributes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Dimensions */}
                <div className="p-4 bg-gray-50 dark:bg-gray-950/30 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] md:text-[13px] font-black text-gray-700 dark:text-gray-300">Width &amp; Height Attributes</span>
                    <button
                      onClick={() => setLockAspect(!lockAspect)}
                      className={cn("flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer", lockAspect ? "bg-brandColor/10 text-brandColor" : "bg-gray-100 dark:bg-gray-800 text-gray-400")}
                    >
                      {lockAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {lockAspect ? "Locked" : "Free"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["width", "height"].map((k) => (
                      <div key={k}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{k}</label>
                        <input
                          type="text"
                          value={svgProps[k]}
                          onChange={(e) => handleDimensionChange(k, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl text-[12px] md:text-[13px] font-mono focus:border-brandColor focus:outline-none text-gray-700 dark:text-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ViewBox */}
                <div className="p-4 bg-gray-50 dark:bg-gray-950/30 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-4">
                  <span className="block text-[12px] md:text-[13px] font-black text-gray-700 dark:text-gray-300">viewBox Parameters</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[["minX", "Min-X"], ["minY", "Min-Y"], ["vbWidth", "W"], ["vbHeight", "H"]].map(([k, lbl]) => (
                      <div key={k}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{lbl}</label>
                        <input
                          type="number"
                          value={svgProps[k]}
                          onChange={(e) => handleViewBoxChange(k, e.target.value)}
                          className="w-full px-2 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl text-[12px] font-mono text-center focus:border-brandColor focus:outline-none text-gray-700 dark:text-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Current: <code className="font-mono text-brandColor">{`${svgProps.minX} ${svgProps.minY} ${svgProps.vbWidth} ${svgProps.vbHeight}`}</code>
                  </p>
                </div>
              </div>
            )}

            {/* TAB: Colors */}
            {activeTab === "colors" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[13px] md:text-[14px] font-black text-gray-800 dark:text-gray-200">Global Color Palette Replacer</h3>
                  <p className="text-[11px] md:text-[12px] text-gray-400 font-medium mt-0.5">All colors detected in fill, stroke, and stop-color attributes are listed below. Click the color swatch to pick a replacement.</p>
                </div>
                {svgProps.colors.length === 0 ? (
                  <div className="p-8 text-center text-[12px] md:text-[13px] text-gray-400 font-bold bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-2xl">
                    No color attributes detected in the current SVG markup.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {svgProps.colors.map((color, i) => (
                      <div key={`${color}-${i}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950/30 border border-gray-150 dark:border-gray-800 rounded-2xl">
                        <div className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0 shadow-inner" style={{ backgroundColor: color }} />
                        <span className="flex-1 text-[11px] md:text-[12px] font-mono text-gray-600 dark:text-gray-400 truncate">{color}</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            title={`Replace ${color}`}
                            defaultValue={/^#[0-9a-f]{6}$/i.test(color) ? color : "#7c00fe"}
                            onChange={(e) => handleColorReplace(color, e.target.value)}
                            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer bg-transparent shrink-0"
                          />
                          <span className="text-[10px] text-gray-400 font-bold hidden md:block">Replace</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Optimize & A11y */}
            {activeTab === "a11y" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 bg-gray-50 dark:bg-gray-950/30 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-3">
                  <span className="block text-[12px] md:text-[13px] font-black text-gray-700 dark:text-gray-300">XML Optimization</span>
                  <button onClick={handleFormat} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-brandColor/50 hover:text-brandColor text-gray-700 dark:text-gray-300 text-[12px] md:text-[13px] font-bold rounded-xl transition cursor-pointer text-left flex items-center justify-between">
                    Prettify &amp; Indent XML <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                  </button>
                  <button onClick={handleMinify} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-brandColor/50 hover:text-brandColor text-gray-700 dark:text-gray-300 text-[12px] md:text-[13px] font-bold rounded-xl transition cursor-pointer text-left flex items-center justify-between">
                    Minify &amp; Strip Comments <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                  </button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-950/30 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-3">
                  <span className="block text-[12px] md:text-[13px] font-black text-gray-700 dark:text-gray-300">Accessibility Metadata (A11y)</span>
                  {[["title", "Document Title (<title>)", "e.g., Home navigation icon"], ["desc", "Description (<desc>)", "e.g., Navigates user to the home page"]].map(([k, lbl, ph]) => (
                    <div key={k}>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{lbl}</label>
                      <input
                        type="text"
                        value={svgProps[k]}
                        onChange={(e) => handleA11yUpdate(k, e.target.value)}
                        placeholder={ph}
                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl text-[12px] md:text-[13px] focus:border-brandColor focus:outline-none text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Export Hub */}
            {activeTab === "export" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Vector/code exports */}
                <div className="space-y-3">
                  <span className="block text-[12px] md:text-[13px] font-black text-gray-700 dark:text-gray-300">Vector & Code Formats</span>
                  {[
                    { type: "svg", label: "SVG File", desc: "Download raw .svg file", action: downloadSvg, isDownload: true },
                    { type: "xml", label: "Copy SVG Markup", desc: "Copy raw XML code to clipboard", action: () => handleCopy("xml", svgText) },
                    { type: "react", label: "React JSX Component", desc: "camelCase attributes, ready to import", action: () => handleCopy("react", getReactJsx()) },
                    { type: "base64", label: "Base64 Data URI", desc: "For inline CSS/HTML embedding", action: () => handleCopy("base64", getBase64Uri()) },
                  ].map(({ type, label, desc, action, isDownload }) => (
                    <div key={type} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-2xl gap-3">
                      <div className="min-w-0">
                        <span className="block text-[12px] md:text-[13px] font-extrabold text-gray-800 dark:text-gray-200 truncate">{label}</span>
                        <span className="text-[11px] text-gray-400">{desc}</span>
                      </div>
                      <button
                        onClick={action}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-xl transition cursor-pointer shrink-0",
                          isDownload ? "bg-brandColor hover:bg-brandColorHover text-white" : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {isDownload
                          ? <><Download className="w-3.5 h-3.5" /> Download</>
                          : copiedType === type
                            ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                            : <><Copy className="w-3.5 h-3.5" /> Copy</>
                        }
                      </button>
                    </div>
                  ))}
                </div>

                {/* Raster export */}
                <div className="p-4 bg-gray-50 dark:bg-gray-950/30 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-4">
                  <span className="block text-[12px] md:text-[13px] font-black text-gray-700 dark:text-gray-300">Raster Image Export (Canvas)</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl text-[12px] font-bold text-gray-700 dark:text-gray-300 focus:border-brandColor focus:outline-none"
                      >
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpeg">JPEG (Solid BG)</option>
                        <option value="webp">WebP (Modern)</option>
                      </select>
                    </div>
                    {exportFormat !== "png" && (
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Quality ({exportQuality}%)</label>
                        <input type="range" min="20" max="100" value={exportQuality} onChange={(e) => setExportQuality(+e.target.value)} className="w-full accent-brandColor mt-2 cursor-pointer" style={{ height: "6px" }} />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[["exportWidth", "Width (px)"], ["exportHeight", "Height (px)"]].map(([k, lbl]) => (
                      <div key={k}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{lbl}</label>
                        <input
                          type="number"
                          value={k === "exportWidth" ? exportWidth : exportHeight}
                          onChange={(e) => k === "exportWidth" ? setExportWidth(Math.max(1, +e.target.value)) : setExportHeight(Math.max(1, +e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl text-[12px] font-mono focus:border-brandColor focus:outline-none text-gray-700 dark:text-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleRasterExport}
                    className="w-full py-3 bg-brandColor hover:bg-brandColorHover text-white text-[12px] md:text-[13px] font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export {exportWidth}×{exportHeight} {exportFormat.toUpperCase()}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Professional SVG Guide ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-5">
            <h2 className="text-[14px] md:text-[16px] font-black text-gray-850 dark:text-gray-150 flex items-center gap-2">
              <Info className="w-5 h-5 text-brandColor" />
              Professional SVG Integration Guide
            </h2>
            <p className="text-[12px] md:text-[13px] text-gray-400 mt-1 font-medium">Best practices for high-performance, accessible SVG assets on modern web interfaces.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                num: "01", title: "viewBox-Driven Scaling",
                body: "Always define a viewBox attribute and set width/height to 100% or percentages. This lets browsers scale the vector natively within any CSS flex/grid container without distortion."
              },
              {
                num: "02", title: "Semantic A11y Nodes",
                body: "Include <title> and <desc> child elements immediately after the root <svg>. Reference them via aria-labelledby to provide screen-readers and SEO crawlers with proper semantic context."
              },
              {
                num: "03", title: "Inline & Minified Loading",
                body: "Minifying removes comments, metadata, and whitespace — reducing file size by up to 60%. Inline SVG placement eliminates extra HTTP requests and allows CSS/JS targeting of individual paths."
              }
            ].map(({ num, title, body }) => (
              <div key={num} className="space-y-2">
                <span className="inline-block text-[11px] font-black uppercase tracking-widest text-brandColor bg-brandColor/10 px-2.5 py-1 rounded-md">{num}</span>
                <h3 className="text-[13px] md:text-[14px] font-extrabold text-gray-800 dark:text-white">{title}</h3>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 md:p-6 shadow-xs">
          <h2 className="text-[14px] md:text-[16px] font-black text-gray-850 dark:text-gray-150 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <HelpCircle className="w-5 h-5 text-brandColor" />
            SVG Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-2.5">
            {[
              { q: "What makes SVG files scalable without losing quality?", a: "Unlike raster formats (PNG, JPEG), SVGs describe graphics through XML coordinates — paths, lines, polygons and curves. Browsers interpret these instructions at render time and draw them at any resolution, producing crisp output on Retina and 4K screens alike." },
              { q: "When should I use SVG over HTML Canvas?", a: "SVGs live in the DOM making them styleable with CSS, inspectable in dev-tools, and crawlable by search engines. Canvas is a pixel buffer best suited for game engines or thousands of animated particles. For icons, illustrations, charts, and logos, SVG is the professional choice." },
              { q: "Can SVG be animated with CSS?", a: "Yes — SVG elements support CSS keyframe animations. You can animate stroke-dashoffset for path-drawing effects, transform for rotations and scaling, fill and opacity for color transitions, and much more without any JavaScript." },
              { q: "Is inline SVG safe for user-uploaded content?", a: "Raw SVG files can embed <script> tags, which is an XSS vector. Never render untrusted SVG with dangerouslySetInnerHTML. Use a server-side sanitizer (like DOMPurify), or display via an <img> tag or sandboxed <iframe> — exactly how this editor handles preview rendering." },
            ].map((faq, idx) => (
              <div key={idx} className="border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 font-bold text-gray-800 dark:text-gray-200 hover:text-brandColor transition-colors flex justify-between items-center cursor-pointer text-[12px] md:text-[14px]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform shrink-0 ml-3", openFaqIndex === idx && "rotate-180")} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-4 text-[12px] md:text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium border-t border-gray-100 dark:border-gray-800 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Professional Creator Card ────────────────────────────────────── */}
        <div className="bg-linear-to-tr from-slate-900 via-slate-950 to-violet-950/30 border border-slate-800/80 rounded-3xl p-5 md:p-6 text-white shadow-lg mb-2">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brandColor/20 border border-brandColor/30 text-brandColor rounded-2xl shrink-0">
                <User className="w-6 md:w-8 h-6 md:h-8" />
              </div>
              <div>
                <span className="text-[10px] text-violet-400 font-black uppercase tracking-widest block mb-0.5">About the Tool Author</span>
                <h3 className="text-[15px] md:text-[17px] font-black text-white">ToolsTrek Engineering Team</h3>
                <p className="text-[12px] md:text-[13px] text-slate-400 font-medium leading-relaxed mt-1 max-w-lg">
                  We craft production-quality developer tools, visual asset editors, and optimization utilities designed around performance, accessibility, and premium user experience.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Full-Stack Dev", "SVG & Canvas", "Web Performance", "A11y Standards", "UI/UX Design", "Open Source"].map((s) => (
                    <span key={s} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-400">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-px bg-slate-800/60 my-5" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[11px] md:text-[12px] text-slate-500 font-medium">Found this tool helpful? Explore more or get in touch with the team.</p>
            <div className="flex flex-wrap gap-2.5">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[12px] font-bold text-slate-200 transition cursor-pointer">
                <Github className="w-3.5 h-3.5" /> GitHub
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[12px] font-bold text-slate-200 transition cursor-pointer">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
              <a href="mailto:support@toolstrek.com" className="flex items-center gap-1.5 px-3.5 py-2 bg-brandColor hover:bg-brandColorHover text-white text-[12px] font-bold rounded-xl transition cursor-pointer">
                <Mail className="w-3.5 h-3.5" /> Contact Team
              </a>
            </div>
          </div>
        </div>

      </div>
    </ToolPageShell>
  );
}
