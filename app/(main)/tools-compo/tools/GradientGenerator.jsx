"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Maximize2,
  Minimize2,
  Trash2,
  Shuffle,
  Layers,
  FileCode,
  ArrowRightLeft,
  Settings
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "framer-motion";
import ToolPageShell from "../ToolPageShell";

// ─────────────────────────────────────────────
// Color Helpers & Parsing (Self-contained)
// ─────────────────────────────────────────────

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  if (hex.length !== 6) return { r: 0, g: 0, b: 0 };
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r, g, b) {
  const clamp = (v) => Math.min(255, Math.max(0, Math.round(v)));
  r = clamp(r);
  g = clamp(g);
  b = clamp(b);
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Convert any format to format CSS string
const formatColorString = (hexColor, opacity, format) => {
  const { r, g, b } = hexToRgb(hexColor);
  if (format === "rgb") {
    return opacity === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (format === "hsl") {
    const { h, s, l } = rgbToHsl(r, g, b);
    return opacity === 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
  }
  // HEX
  if (opacity === 1) return hexColor.toUpperCase();
  const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, "0").toUpperCase();
  return `${hexColor}${alphaHex}`.toUpperCase();
};

const DEFAULT_PRESETS = [
  {
    name: "Sunset Glow",
    type: "linear",
    angle: 135,
    stops: [
      { id: "1", color: "#FF512F", position: 0, opacity: 1 },
      { id: "2", color: "#F09819", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Ocean Breeze",
    type: "linear",
    angle: 90,
    stops: [
      { id: "1", color: "#00c6ff", position: 0, opacity: 1 },
      { id: "2", color: "#0072ff", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Midnight City",
    type: "linear",
    angle: 135,
    stops: [
      { id: "1", color: "#3A1C71", position: 0, opacity: 1 },
      { id: "2", color: "#D76D77", position: 50, opacity: 1 },
      { id: "3", color: "#FFAF7B", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Lush Grass",
    type: "linear",
    angle: 45,
    stops: [
      { id: "1", color: "#56ab2f", position: 0, opacity: 1 },
      { id: "2", color: "#a8ff78", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Cyberpunk Pink",
    type: "linear",
    angle: 225,
    stops: [
      { id: "1", color: "#F107A3", position: 0, opacity: 1 },
      { id: "2", color: "#7B2CBF", position: 50, opacity: 1 },
      { id: "3", color: "#00F5D4", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Cosmic Dust",
    type: "radial",
    radialShape: "circle",
    radialPosition: "center",
    stops: [
      { id: "1", color: "#1F1C2C", position: 0, opacity: 1 },
      { id: "2", color: "#928DAB", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Lemon Squeeze",
    type: "linear",
    angle: 180,
    stops: [
      { id: "1", color: "#f8ff00", position: 0, opacity: 1 },
      { id: "2", color: "#3ad59f", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Cotton Candy",
    type: "linear",
    angle: 135,
    stops: [
      { id: "1", color: "#ff9a9e", position: 0, opacity: 1 },
      { id: "2", color: "#fecfef", position: 99, opacity: 1 },
      { id: "3", color: "#a1c4fd", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Conic Radar",
    type: "conic",
    conicAngle: 0,
    conicPosition: "center",
    stops: [
      { id: "1", color: "#3B82F6", position: 0, opacity: 1 },
      { id: "2", color: "#10B981", position: 33, opacity: 1 },
      { id: "3", color: "#F59E0B", position: 66, opacity: 1 },
      { id: "4", color: "#3B82F6", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Dark Velvet",
    type: "linear",
    angle: 135,
    stops: [
      { id: "1", color: "#0F2027", position: 0, opacity: 1 },
      { id: "2", color: "#203A43", position: 50, opacity: 1 },
      { id: "3", color: "#2C5364", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Sweet Aurora",
    type: "linear",
    angle: 45,
    stops: [
      { id: "1", color: "#ff758c", position: 0, opacity: 1 },
      { id: "2", color: "#ff7eb3", position: 100, opacity: 1 }
    ]
  },
  {
    name: "Deep Purple",
    type: "radial",
    radialShape: "ellipse",
    radialPosition: "top left",
    stops: [
      { id: "1", color: "#8E2DE2", position: 0, opacity: 1 },
      { id: "2", color: "#4A00E0", position: 100, opacity: 1 }
    ]
  }
];

export default function GradientGenerator() {
  const [stops, setStops] = useState([
    { id: "1", color: "#3B82F6", position: 0, opacity: 1 },
    { id: "2", color: "#8B5CF6", position: 100, opacity: 1 }
  ]);
  const [activeStopId, setActiveStopId] = useState("1");
  const [type, setType] = useState("linear"); // 'linear', 'radial', 'conic'
  const [angle, setAngle] = useState(135);
  const [radialShape, setRadialShape] = useState("circle"); // 'circle', 'ellipse'
  const [radialPosition, setRadialPosition] = useState("center");
  const [conicAngle, setConicAngle] = useState(0);
  const [conicPosition, setConicPosition] = useState("center");
  
  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [colorFormat, setColorFormat] = useState("hex"); // 'hex', 'rgb', 'hsl'
  const [isRepeating, setIsRepeating] = useState(false);
  const [prefixes, setPrefixes] = useState({ webkit: false, moz: false });
  const [fallbackColor, setFallbackColor] = useState(true);
  const [mixBlendMode, setMixBlendMode] = useState("normal");
  const [blendColor, setBlendColor] = useState("#000000");
  const [blendOpacity, setBlendOpacity] = useState(0.2);

  // Previews
  const [previewType, setPreviewType] = useState("box"); // 'box', 'button', 'text', 'fullscreen'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedType, setCopiedType] = useState(null); // 'css', 'tailwind'

  const sliderTrackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStopIdRef = useRef(null);

  // Active Stop helper
  const activeStop = stops.find((s) => s.id === activeStopId) || stops[0] || null;

  // Sorting stops by position
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  // Calculate Gradient Value String
  const generateGradientValue = useCallback((overrideType = null, forTailwind = false) => {
    const activeType = overrideType || type;
    const isRepeat = isRepeating;
    
    // Format stops string
    const stopsStr = sortedStops
      .map((s) => {
        const colorStr = formatColorString(s.color, s.opacity, forTailwind ? "hex" : colorFormat);
        // Conic gradient uses degrees or percentages. We use percentages for consistency or degrees if custom, but % works in CSS stops.
        return `${colorStr} ${s.position}%`;
      })
      .join(", ");

    if (activeType === "linear") {
      const repeatPrefix = isRepeat ? "repeating-linear-gradient" : "linear-gradient";
      return `${repeatPrefix}(${angle}deg, ${stopsStr})`;
    } else if (activeType === "radial") {
      const repeatPrefix = isRepeat ? "repeating-radial-gradient" : "radial-gradient";
      const posStr = radialPosition === "center" ? "" : ` at ${radialPosition}`;
      return `${repeatPrefix}(${radialShape}${posStr}, ${stopsStr})`;
    } else if (activeType === "conic") {
      const repeatPrefix = isRepeat ? "repeating-conic-gradient" : "conic-gradient";
      const posStr = conicPosition === "center" ? "" : ` at ${conicPosition}`;
      return `${repeatPrefix}(from ${conicAngle}deg${posStr}, ${stopsStr})`;
    }
    return "";
  }, [stops, type, angle, radialShape, radialPosition, conicAngle, conicPosition, isRepeating, colorFormat, sortedStops]);

  // Full CSS styling block
  const generateFullCss = useCallback(() => {
    const gradVal = generateGradientValue();
    const primaryStop = sortedStops[0] || { color: "#ffffff", opacity: 1 };
    const fbColor = formatColorString(primaryStop.color, primaryStop.opacity, colorFormat);

    let output = "";

    if (fallbackColor) {
      output += `background-color: ${fbColor};\n`;
    }

    if (prefixes.webkit) {
      output += `background-image: -webkit-${gradVal};\n`;
    }
    if (prefixes.moz) {
      output += `background-image: -moz-${gradVal};\n`;
    }

    output += `background-image: ${gradVal};`;

    return output;
  }, [generateGradientValue, fallbackColor, prefixes, colorFormat, sortedStops]);

  // Interpolate color at a specific position (for adding stops)
  const interpolateColorAtPosition = (pos) => {
    if (stops.length === 0) return "#3B82F6";
    if (stops.length === 1) return stops[0].color;

    const sorted = [...stops].sort((a, b) => a.position - b.position);
    
    // Outside boundary positions
    if (pos <= sorted[0].position) return sorted[0].color;
    if (pos >= sorted[sorted.length - 1].position) return sorted[sorted.length - 1].color;

    // Find the two surrounding stops
    let leftStop = sorted[0];
    let rightStop = sorted[sorted.length - 1];

    for (let i = 0; i < sorted.length - 1; i++) {
      if (pos >= sorted[i].position && pos <= sorted[i + 1].position) {
        leftStop = sorted[i];
        rightStop = sorted[i + 1];
        break;
      }
    }

    const range = rightStop.position - leftStop.position;
    const factor = range === 0 ? 0 : (pos - leftStop.position) / range;

    const rgbL = hexToRgb(leftStop.color);
    const rgbR = hexToRgb(rightStop.color);

    const r = Math.round(rgbL.r + factor * (rgbR.r - rgbL.r));
    const g = Math.round(rgbL.g + factor * (rgbR.g - rgbL.g));
    const b = Math.round(rgbL.b + factor * (rgbR.b - rgbL.b));

    return rgbToHex(r, g, b);
  };

  // Add stop on track click
  const handleTrackClick = (e) => {
    if (!sliderTrackRef.current || isDraggingRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));

    // Generate new stop
    const newColor = interpolateColorAtPosition(percent);
    const newId = Date.now().toString();
    const newStop = {
      id: newId,
      color: newColor,
      position: percent,
      opacity: 1
    };

    setStops((prev) => [...prev, newStop].sort((a, b) => a.position - b.position));
    setActiveStopId(newId);
  };

  // Mouse drag handlers
  const handleStopMouseDown = (e, stopId) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStopIdRef.current = stopId;
    setActiveStopId(stopId);

    window.addEventListener("mousemove", handleStopMouseMove);
    window.addEventListener("mouseup", handleStopMouseUp);
  };

  const handleStopMouseMove = (e) => {
    if (!isDraggingRef.current || !dragStopIdRef.current || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));

    setStops((prev) =>
      prev.map((s) => (s.id === dragStopIdRef.current ? { ...s, position: percent } : s))
    );
  };

  const handleStopMouseUp = () => {
    isDraggingRef.current = false;
    dragStopIdRef.current = null;
    window.removeEventListener("mousemove", handleStopMouseMove);
    window.removeEventListener("mouseup", handleStopMouseUp);
  };

  // Drag Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleStopMouseMove);
      window.removeEventListener("mouseup", handleStopMouseUp);
    };
  }, []);

  // Update active stop settings
  const updateActiveStop = (key, value) => {
    setStops((prev) =>
      prev.map((s) => (s.id === activeStopId ? { ...s, [key]: value } : s))
    );
  };

  // Delete Stop
  const deleteStop = (idToDelete) => {
    if (stops.length <= 2) {
      toast.error("Gradients require at least 2 color stops.");
      return;
    }
    const newStops = stops.filter((s) => s.id !== idToDelete);
    setStops(newStops);
    if (activeStopId === idToDelete) {
      setActiveStopId(newStops[0].id);
    }
    toast.success("Color stop removed.");
  };

  // Distribute stops evenly
  const distributeStops = () => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const count = sorted.length;
    const distributed = sorted.map((s, idx) => ({
      ...s,
      position: Math.round((idx / (count - 1)) * 100)
    }));
    setStops(distributed);
    toast.success("Color stops distributed evenly.");
  };

  // Reverse stops
  const reverseStops = () => {
    const reversed = [...stops].map((s) => ({
      ...s,
      position: 100 - s.position
    }));
    setStops(reversed);
    toast.success("Gradient stops direction reversed.");
  };

  // Randomize Gradients
  const randomizeGradient = () => {
    const numStops = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4 stops
    const newStops = [];
    const themeHue = Math.floor(Math.random() * 360);
    
    for (let i = 0; i < numStops; i++) {
      const h = (themeHue + i * (Math.floor(Math.random() * 60) + 30)) % 360;
      const s = Math.floor(Math.random() * 25) + 65; 
      const l = Math.floor(Math.random() * 20) + 45; 
      const color = rgbToHex(...Object.values(hslToRgb(h, s, l)));
      
      let position;
      if (i === 0) position = 0;
      else if (i === numStops - 1) position = 100;
      else position = Math.round((i / (numStops - 1)) * 100);

      newStops.push({
        id: `${i}-${Date.now()}`,
        color,
        position,
        opacity: 1
      });
    }

    const randomTypes = ["linear", "linear", "linear", "radial"];
    const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
    setType(randomType);
    
    if (randomType === "linear") {
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      setAngle(angles[Math.floor(Math.random() * angles.length)]);
    }

    setStops(newStops);
    setActiveStopId(newStops[0].id);
    toast.success("Generated random aesthetic gradient!");
  };

  // Load Preset
  const loadPreset = (preset) => {
    setType(preset.type);
    if (preset.angle !== undefined) setAngle(preset.angle);
    if (preset.radialShape !== undefined) setRadialShape(preset.radialShape);
    if (preset.radialPosition !== undefined) setRadialPosition(preset.radialPosition);
    if (preset.conicAngle !== undefined) setConicAngle(preset.conicAngle);
    if (preset.conicPosition !== undefined) setConicPosition(preset.conicPosition);
    
    const formattedStops = preset.stops.map((s, idx) => ({
      id: `${idx}-${Date.now()}`,
      color: s.color,
      position: s.position,
      opacity: s.opacity || 1
    }));
    
    setStops(formattedStops);
    setActiveStopId(formattedStops[0].id);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  // Copy CSS Action
  const copyCssCode = () => {
    const cssCode = generateFullCss();
    navigator.clipboard.writeText(cssCode);
    setCopiedType("css");
    setTimeout(() => setCopiedType(null), 2000);
    toast.success("CSS copied to clipboard!");
  };

  // Copy Tailwind class Action
  const copyTailwindCode = () => {
    const rawGradVal = generateGradientValue(null, true);
    const twClass = `bg-[${rawGradVal.replace(/\s+/g, "")}]`;
    navigator.clipboard.writeText(twClass);
    setCopiedType("tailwind");
    setTimeout(() => setCopiedType(null), 2000);
    toast.success("Tailwind CSS class copied!");
  };

  // Export as SVG File
  const exportAsSvg = () => {
    const gradVal = generateGradientValue();
    let gradDef = "";

    const svgStopsMarkup = sortedStops
      .map((s) => {
        const opacityAttr = s.opacity < 1 ? ` stop-opacity="${s.opacity}"` : "";
        return `<stop offset="${s.position}%" stop-color="${s.color}"${opacityAttr} />`;
      })
      .join("\n    ");

    if (type === "linear") {
      const rad = (angle * Math.PI) / 180;
      const x1 = Math.round(50 - Math.cos(rad) * 50);
      const y1 = Math.round(50 + Math.sin(rad) * 50);
      const x2 = Math.round(50 + Math.cos(rad) * 50);
      const y2 = Math.round(50 - Math.sin(rad) * 50);

      gradDef = `<linearGradient id="gradient" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">\n    ${svgStopsMarkup}\n  </linearGradient>`;
    } else if (type === "radial") {
      let cx = "50%", cy = "50%";
      if (radialPosition.includes("left")) cx = "0%";
      if (radialPosition.includes("right")) cx = "100%";
      if (radialPosition.includes("top")) cy = "0%";
      if (radialPosition.includes("bottom")) cy = "100%";
      
      gradDef = `<radialGradient id="gradient" cx="${cx}" cy="${cy}" r="50%">\n    ${svgStopsMarkup}\n  </radialGradient>`;
    } else {
      gradDef = `<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">\n    ${svgStopsMarkup}\n  </linearGradient>`;
    }

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    ${gradDef}
  </defs>
  <rect width="100%" height="100%" fill="url(#gradient)" />
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `toolstrek-gradient-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("SVG image downloaded successfully!");
  };

  // Export as PNG File
  const exportAsPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let canvasGrad;

    if (type === "linear") {
      const rad = ((angle - 90) * Math.PI) / 180;
      const r = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const x1 = cx - Math.cos(rad) * r;
      const y1 = cy - Math.sin(rad) * r;
      const x2 = cx + Math.cos(rad) * r;
      const y2 = cy + Math.sin(rad) * r;

      canvasGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    } else {
      let cx = canvas.width / 2;
      let cy = canvas.height / 2;

      if (radialPosition.includes("left")) cx = 0;
      if (radialPosition.includes("right")) cx = canvas.width;
      if (radialPosition.includes("top")) cy = 0;
      if (radialPosition.includes("bottom")) cy = canvas.height;

      const r = Math.max(canvas.width, canvas.height);
      canvasGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    }

    sortedStops.forEach((s) => {
      const { r, g, b } = hexToRgb(s.color);
      canvasGrad.addColorStop(s.position / 100, `rgba(${r}, ${g}, ${b}, ${s.opacity})`);
    });

    ctx.fillStyle = canvasGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `toolstrek-gradient-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("PNG image (1920x1080 HD) downloaded!");
  };

  const previewGradientValue = generateGradientValue();

  return (
    <ToolPageShell widthClassName="max-w-7xl" className="px-4 py-8">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brandColor/15 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Gradient Generator
        </h1>
        <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-400">
          Create, edit, copy, and export beautiful CSS and Tailwind CSS gradients with color stops, custom angles, repeating designs, and blend controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Preview & Preset Gradients */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-950 transition-all duration-300">
            <div 
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #ccc 25%, transparent 25%), 
                  linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #ccc 75%), 
                  linear-gradient(-45deg, transparent 75%, #ccc 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            />

            <div 
              className="h-64 sm:h-80 md:h-96 w-full flex items-center justify-center transition-all duration-300 relative"
              style={{ 
                backgroundImage: previewGradientValue,
                mixBlendMode: mixBlendMode !== "normal" ? mixBlendMode : undefined
              }}
            >
              {mixBlendMode !== "normal" && (
                <div 
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    backgroundColor: blendColor,
                    opacity: blendOpacity,
                  }}
                />
              )}

              <AnimatePresence mode="wait">
                {previewType === "button" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col gap-4 items-center p-6 bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-xl"
                  >
                    <button 
                      className="px-6 py-3 rounded-xl font-bold text-white shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                      style={{ backgroundImage: previewGradientValue }}
                    >
                      Call to Action
                    </button>
                    <div className="flex gap-2">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow"
                        style={{ backgroundImage: previewGradientValue }}
                      >
                        Badge 1
                      </span>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow"
                        style={{ backgroundImage: previewGradientValue }}
                      >
                        Badge 2
                      </span>
                    </div>
                  </motion.div>
                )}

                {previewType === "text" && (
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-4xl sm:text-5xl font-black tracking-tight text-center px-4 select-none drop-shadow-sm"
                    style={{
                      backgroundImage: previewGradientValue,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    PREVIEW TEXT
                  </motion.h2>
                )}
              </AnimatePresence>

              {previewType === "box" && (
                <span className="text-white font-medium text-sm drop-shadow-md select-none bg-black/35 px-4 py-2 rounded-full backdrop-blur-sm pointer-events-none">
                  Live View Screen
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-lg p-1 border border-white/10 z-10">
              <button
                onClick={() => setPreviewType("box")}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  previewType === "box" ? "bg-white text-gray-900" : "text-white hover:bg-white/10"
                }`}
              >
                Default
              </button>
              <button
                onClick={() => setPreviewType("button")}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  previewType === "button" ? "bg-white text-gray-900" : "text-white hover:bg-white/10"
                }`}
              >
                Buttons
              </button>
              <button
                onClick={() => setPreviewType("text")}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  previewType === "text" ? "bg-white text-gray-900" : "text-white hover:bg-white/10"
                }`}
              >
                Text
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-lg border border-white/10 transition-all cursor-pointer"
              title="View fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={randomizeGradient}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-sm"
            >
              <Sparkles className="h-4 w-4" />
              Random Gradient
            </button>
            
            <button
              onClick={reverseStops}
              className="px-4 py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-sm"
              title="Reverse Stops Order"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Reverse
            </button>

            <button
              onClick={distributeStops}
              className="px-4 py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-sm"
              title="Distribute Stops Evenly"
            >
              <Sliders className="h-4 w-4" />
              Even Space
            </button>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-indigo-500" />
              Curated Presets
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {DEFAULT_PRESETS.map((preset) => {
                let presetGradVal = "";
                const sortedPresetStops = [...preset.stops].sort((a, b) => a.position - b.position);
                const presetStopsStr = sortedPresetStops
                  .map((s) => `${s.color} ${s.position}%`)
                  .join(", ");
                
                if (preset.type === "linear") {
                  presetGradVal = `linear-gradient(${preset.angle}deg, ${presetStopsStr})`;
                } else if (preset.type === "radial") {
                  presetGradVal = `radial-gradient(${preset.radialShape} at ${preset.radialPosition || "center"}, ${presetStopsStr})`;
                } else {
                  presetGradVal = `conic-gradient(from ${preset.conicAngle || 0}deg at ${preset.conicPosition || "center"}, ${presetStopsStr})`;
                }

                return (
                  <button
                    key={preset.name}
                    onClick={() => loadPreset(preset)}
                    className="flex flex-col items-center gap-1.5 p-1 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
                  >
                    <div 
                      className="w-full aspect-square rounded-lg shadow-inner"
                      style={{ backgroundImage: presetGradVal }}
                    />
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate max-w-full text-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Stops Editor & Configuration Panels */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          <div className="bg-white/85 dark:bg-gray-900/85 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-500" />
              Adjust Color Stops
            </h2>

            <div className="relative pt-6 pb-8 px-3">
              <div className="absolute top-0 left-0 right-0 flex justify-between text-[11px] text-gray-400 dark:text-gray-500 select-none px-1">
                <span>Click track to add new stops</span>
                <span>Drag pointers to move stops</span>
              </div>

              <div 
                ref={sliderTrackRef}
                onClick={handleTrackClick}
                className="h-7 w-full rounded-lg shadow-inner border border-gray-200 dark:border-gray-800 cursor-copy relative overflow-visible"
                style={{ backgroundImage: `linear-gradient(to right, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')})` }}
              >
                <div 
                  className="absolute inset-0 -z-10 opacity-10 rounded-lg"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #000 25%, transparent 25%), 
                      linear-gradient(-45deg, #000 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #000 75%), 
                      linear-gradient(-45deg, transparent 75%, #000 75%)
                    `,
                    backgroundSize: '10px 10px',
                  }}
                />
              </div>

              {stops.map((stop) => {
                const isActive = stop.id === activeStopId;
                return (
                  <button
                    key={stop.id}
                    onMouseDown={(e) => handleStopMouseDown(e, stop.id)}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      isDraggingRef.current = true;
                      dragStopIdRef.current = stop.id;
                      setActiveStopId(stop.id);
                      
                      const touchMoveHandler = (evt) => {
                        const t = evt.touches[0];
                        handleStopMouseMove(t);
                      };
                      const touchEndHandler = () => {
                        isDraggingRef.current = false;
                        dragStopIdRef.current = null;
                        window.removeEventListener("touchmove", touchMoveHandler);
                        window.removeEventListener("touchend", touchEndHandler);
                      };
                      
                      window.addEventListener("touchmove", touchMoveHandler);
                      window.addEventListener("touchend", touchEndHandler);
                    }}
                    className={`absolute bottom-3 transform -translate-x-1/2 w-6 h-8 flex flex-col items-center group cursor-grab active:cursor-grabbing z-20 outline-none`}
                    style={{ left: `calc(${stop.position}% + 12px)` }}
                  >
                    <div 
                      className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] transition-colors duration-150 ${
                        isActive ? "border-b-blue-600 dark:border-b-blue-400" : "border-b-gray-400 dark:border-b-gray-600 group-hover:border-b-gray-300"
                      }`}
                    />
                    <div 
                      className={`w-5 h-5 rounded-full border-2 shadow-md transition-all ${
                        isActive ? "border-blue-600 dark:border-blue-400 scale-110 ring-2 ring-blue-500/20" : "border-white dark:border-gray-800"
                      }`}
                      style={{ backgroundColor: stop.color }}
                    />
                    <span className="absolute -top-3 scale-0 group-hover:scale-100 bg-gray-900 text-white text-[9px] px-1 py-0.5 rounded font-mono transition-transform duration-100">
                      {stop.position}%
                    </span>
                  </button>
                );
              })}
            </div>

            {activeStop && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="md:col-span-5 flex flex-col items-center justify-center gap-3">
                  <div className="w-full max-w-[200px] color-picker-wrapper">
                    <HexColorPicker 
                      color={activeStop.color} 
                      onChange={(color) => updateActiveStop("color", color)} 
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Drag picker to change stop color
                  </span>
                </div>

                <div className="md:col-span-7 flex flex-col justify-between gap-4">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Color Value
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={activeStop.color.toUpperCase()}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith("#")) val = "#" + val;
                            if (val.length <= 7) {
                              updateActiveStop("color", val);
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-mono text-gray-900 dark:text-white uppercase focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          maxLength={7}
                        />
                        <div 
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-gray-200 dark:border-gray-800"
                          style={{ backgroundColor: activeStop.color }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => deleteStop(activeStop.id)}
                      disabled={stops.length <= 2}
                      className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-red-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title="Delete Stop"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      <span>Stop Position</span>
                      <span className="font-mono">{activeStop.position}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={activeStop.position}
                      onChange={(e) => updateActiveStop("position", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 dark:bg-gray-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      <span>Stop Opacity</span>
                      <span className="font-mono">{Math.round(activeStop.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={activeStop.opacity * 100}
                      onChange={(e) => updateActiveStop("opacity", parseFloat(e.target.value) / 100)}
                      className="w-full h-1.5 bg-gray-100 dark:bg-gray-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                </div>
              </div>
            )}
          </div>

          <div className="bg-white/85 dark:bg-gray-900/85 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              Style & Orientation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Gradient Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["linear", "radial", "conic"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all cursor-pointer ${
                        type === t
                          ? "bg-brandColor text-white border-brandColor shadow-md shadow-brandColor/15"
                          : "bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-850"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {type === "linear" && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      <span>Angle (Degrees)</span>
                      <span className="font-mono">{angle}°</span>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={angle}
                        onChange={(e) => setAngle(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      
                      <div className="grid grid-cols-4 gap-1 w-24">
                        {[0, 90, 180, 270].map((deg) => (
                          <button
                            key={deg}
                            onClick={() => setAngle(deg)}
                            className={`p-1 rounded text-[10px] font-mono border text-center transition-all cursor-pointer ${
                              angle === deg
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-850 hover:bg-gray-100"
                            }`}
                          >
                            {deg}°
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {type === "radial" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Shape
                      </label>
                      <select
                        value={radialShape}
                        onChange={(e) => setRadialShape(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="circle">Circle</option>
                        <option value="ellipse">Ellipse</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Position
                      </label>
                      <select
                        value={radialPosition}
                        onChange={(e) => setRadialPosition(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="top right">Top Right</option>
                        <option value="right">Right</option>
                        <option value="bottom right">Bottom Right</option>
                        <option value="bottom">Bottom</option>
                        <option value="bottom left">Bottom Left</option>
                        <option value="left">Left</option>
                        <option value="top left">Top Left</option>
                      </select>
                    </div>
                  </div>
                )}

                {type === "conic" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        <span>Start Angle</span>
                        <span className="font-mono">{conicAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={conicAngle}
                        onChange={(e) => setConicAngle(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 dark:bg-gray-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        Position
                      </label>
                      <select
                        value={conicPosition}
                        onChange={(e) => setConicPosition(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="right">Right</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="top left">Top Left</option>
                        <option value="top right">Top Right</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/85 dark:bg-gray-900/85 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileCode className="h-5 w-5 text-green-500" />
                CSS Code Output
              </h2>
              
              <div className="flex gap-2">
                <button
                  onClick={copyCssCode}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === "css" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedType === "css" ? "Copied" : "Copy CSS"}
                </button>
                
                <button
                  onClick={copyTailwindCode}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  title="Copy custom arbitrary Tailwind configuration helper class"
                >
                  {copiedType === "tailwind" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedType === "tailwind" ? "Copied" : "Copy Tailwind"}
                </button>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-gray-950 border border-gray-900 p-4 font-mono text-xs text-gray-300 select-all overflow-x-auto shadow-inner leading-relaxed">
              <pre className="whitespace-pre">{generateFullCss()}</pre>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-5 py-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl flex justify-between items-center text-sm font-bold text-gray-800 dark:text-gray-200 transition-all hover:bg-white dark:hover:bg-gray-900 cursor-pointer shadow"
            >
              <span className="flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-indigo-500" />
                Advanced Options
              </span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg flex flex-col gap-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            Color Output Format
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["hex", "rgb", "hsl"].map((fmt) => (
                              <button
                                key={fmt}
                                onClick={() => setColorFormat(fmt)}
                                className={`px-2 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                                  colorFormat === fmt
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                    : "bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100"
                                }`}
                              >
                                {fmt.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-xl">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                              Repeating Gradient
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Create infinite striped pattern
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isRepeating}
                            onChange={(e) => setIsRepeating(e.target.checked)}
                            className="w-4.5 h-4.5 rounded bg-gray-250 border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          CSS Compatibility Prefixes
                        </span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-xl cursor-pointer">
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">-webkit-</span>
                            <input
                              type="checkbox"
                              checked={prefixes.webkit}
                              onChange={(e) => setPrefixes({ ...prefixes, webkit: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 accent-indigo-600"
                            />
                          </label>

                          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-xl cursor-pointer">
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">-moz-</span>
                            <input
                              type="checkbox"
                              checked={prefixes.moz}
                              onChange={(e) => setPrefixes({ ...prefixes, moz: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 accent-indigo-600"
                            />
                          </label>
                        </div>

                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-xl cursor-pointer">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Fallback Background Color</span>
                            <span className="text-[10px] text-gray-400">Adds background-color fallback</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={fallbackColor}
                            onChange={(e) => setFallbackColor(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 accent-indigo-600"
                          />
                        </label>
                      </div>

                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                          Blend Overlay Mode
                        </label>
                        <select
                          value={mixBlendMode}
                          onChange={(e) => setMixBlendMode(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-800 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="normal">Normal (None)</option>
                          <option value="multiply">Multiply</option>
                          <option value="screen">Screen</option>
                          <option value="overlay">Overlay</option>
                          <option value="darken">Darken</option>
                          <option value="lighten">Lighten</option>
                          <option value="color-dodge">Color Dodge</option>
                          <option value="color-burn">Color Burn</option>
                          <option value="hard-light">Hard Light</option>
                          <option value="soft-light">Soft Light</option>
                          <option value="difference">Difference</option>
                          <option value="exclusion">Exclusion</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                          Overlay Color
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={blendColor}
                            onChange={(e) => setBlendColor(e.target.value)}
                            disabled={mixBlendMode === "normal"}
                            className="w-10 h-9 p-0 border-0 bg-transparent rounded-lg cursor-pointer disabled:opacity-30"
                          />
                          <input
                            type="text"
                            value={blendColor.toUpperCase()}
                            onChange={(e) => setBlendColor(e.target.value)}
                            disabled={mixBlendMode === "normal"}
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-mono uppercase focus:outline-none disabled:opacity-30"
                            maxLength={7}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                          <span>Overlay Opacity</span>
                          <span className="font-mono">{Math.round(blendOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={blendOpacity * 100}
                          onChange={(e) => setBlendOpacity(parseFloat(e.target.value) / 100)}
                          disabled={mixBlendMode === "normal"}
                          className="w-full h-1.5 bg-gray-100 dark:bg-gray-950 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
                        Export High-Resolution Image
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={exportAsPng}
                          className="px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-850 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                        >
                          <Download className="h-4.5 w-4.5 text-blue-500" />
                          Download PNG (1920x1080)
                        </button>
                        
                        <button
                          onClick={exportAsSvg}
                          className="px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-850 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                        >
                          <Download className="h-4.5 w-4.5 text-purple-500" />
                          Download SVG (Vector)
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            style={{ backgroundImage: previewGradientValue }}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 bg-black/60 hover:bg-black/85 backdrop-blur-md text-white rounded-xl border border-white/10 transition-all cursor-pointer shadow-2xl"
              title="Close Fullscreen"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
            <div className="text-center p-6 rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 select-none max-w-sm mx-4">
              <h2 className="text-white text-lg font-bold">Fullscreen Preview</h2>
              <p className="text-white/70 text-xs mt-1">Press ESC or click the minimize button to return.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolPageShell>
  );
}
