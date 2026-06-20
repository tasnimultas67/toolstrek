"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  UploadCloud,
  FileCode,
  Download,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  ChevronDown,
  Check,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

export default function SvgConverter() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [svgText, setSvgText] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Dimensions state
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [aspectRatio, setAspectRatio] = useState(1);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  
  // Format state
  const [selectedFormat, setSelectedFormat] = useState("png"); // png | jpeg | webp
  const [quality, setQuality] = useState(90); // For jpeg / webp
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  
  // Status states
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Available output formats
  const formats = [
    { id: "png", name: "PNG", icon: "🖼️", desc: "Lossless, transparent background", extension: "png" },
    { id: "jpeg", name: "JPEG", icon: "📷", desc: "High compatibility, white background", extension: "jpg" },
    { id: "webp", name: "WebP", icon: "🌐", desc: "Modern web format, optimal compression", extension: "webp" }
  ];

  const selectedFormatObj = formats.find((f) => f.id === selectedFormat);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFormatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Parse SVG string to retrieve dimensions and aspect ratio
  const parseSvgDimensions = (xmlText) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, "image/svg+xml");
      
      // Check for parsing errors
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Invalid XML/SVG syntax.");
      }

      const svgElement = doc.documentElement;
      let widthAttr = svgElement.getAttribute("width");
      let heightAttr = svgElement.getAttribute("height");
      const viewBoxAttr = svgElement.getAttribute("viewBox");

      let parsedWidth = parseFloat(widthAttr);
      let parsedHeight = parseFloat(heightAttr);

      // Parse viewBox as fallback
      let vbWidth = null;
      let vbHeight = null;
      if (viewBoxAttr) {
        const parts = viewBoxAttr.trim().split(/\s+/);
        if (parts.length === 4) {
          const w = parseFloat(parts[2]);
          const h = parseFloat(parts[3]);
          if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
            vbWidth = w;
            vbHeight = h;
          }
        }
      }

      // If dimensions are percentages or missing, fallback to viewBox or standard defaults
      if (isNaN(parsedWidth) || parsedWidth <= 0 || (widthAttr && widthAttr.includes("%"))) {
        parsedWidth = vbWidth || 800;
      }
      if (isNaN(parsedHeight) || parsedHeight <= 0 || (heightAttr && heightAttr.includes("%"))) {
        parsedHeight = vbHeight || 600;
      }

      return {
        width: parsedWidth,
        height: parsedHeight,
        aspect: parsedWidth / parsedHeight
      };
    } catch (e) {
      console.error("Error parsing SVG metadata: ", e);
      return { width: 800, height: 600, aspect: 800 / 600 };
    }
  };

  // Process selected file
  const processFile = useCallback((file) => {
    setError(null);
    if (!file) return;

    // Validate if file is an SVG
    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    if (!isSvg) {
      setError("Please select a valid SVG file (.svg). Only vector SVG formats are supported.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setSvgText(text);

      // Create preview blob url from original content
      const blob = new Blob([text], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Extract original and preset customizable dimensions
      const dims = parseSvgDimensions(text);
      setOriginalWidth(dims.width);
      setOriginalHeight(dims.height);
      setCustomWidth(Math.round(dims.width));
      setCustomHeight(Math.round(dims.height));
      setAspectRatio(dims.aspect);
    };
    reader.onerror = () => {
      setError("Unable to read the uploaded SVG file. Please try again.");
    };
    reader.readAsText(file);
  }, []);

  // Handle file input selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    processFile(file);
    event.target.value = ""; // Reset input so same file can be uploaded again
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Reset file/converter state
  const handleReset = () => {
    setSelectedFile(null);
    setSvgText("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setCustomWidth("");
    setCustomHeight("");
    setAspectRatio(1);
    setError(null);
    setIsConverting(false);
  };

  // Handle custom width adjustment
  const handleWidthChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setCustomWidth("");
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) return;

    setCustomWidth(num);
    if (lockAspectRatio && aspectRatio) {
      setCustomHeight(Math.round(num / aspectRatio));
    }
  };

  // Handle custom height adjustment
  const handleHeightChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setCustomHeight("");
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) return;

    setCustomHeight(num);
    if (lockAspectRatio && aspectRatio) {
      setCustomWidth(Math.round(num * aspectRatio));
    }
  };

  // Handle toggle for aspect ratio locking
  const handleLockToggle = () => {
    setLockAspectRatio((prev) => {
      const newVal = !prev;
      if (newVal && customWidth && aspectRatio) {
        setCustomHeight(Math.round(customWidth / aspectRatio));
      }
      return newVal;
    });
  };

  // Dynamic SVG blob injection to guarantee high-resolution canvas render
  const getModifiedSvgBlobUrl = (svgContent, targetWidth, targetHeight) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = doc.documentElement;
      
      // Explicitly set width, height and viewBox to match the requested output sizes
      svgElement.setAttribute("width", targetWidth.toString());
      svgElement.setAttribute("height", targetHeight.toString());
      
      // If viewBox isn't set, build one from original or target dimensions
      if (!svgElement.getAttribute("viewBox")) {
        svgElement.setAttribute("viewBox", `0 0 ${originalWidth || targetWidth} ${originalHeight || targetHeight}`);
      }

      const serializer = new XMLSerializer();
      const modifiedText = serializer.serializeToString(doc);
      const blob = new Blob([modifiedText], { type: "image/svg+xml;charset=utf-8" });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Failed to construct scaled SVG Blob. Using fallback.", e);
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      return URL.createObjectURL(blob);
    }
  };

  // Trigger Client-Side Conversion and Download
  const handleConvert = async () => {
    if (!svgText || !customWidth || !customHeight) {
      setError("Please ensure you have loaded an SVG and entered valid dimensions.");
      return;
    }

    setIsConverting(true);
    setError(null);

    // Keep track of modified URL to revoke later
    let modifiedBlobUrl = null;

    try {
      // 1. Create a modified SVG blob that explicitly specifies target width and height.
      // This is crucial because standard canvas drawImage uses default SVG sizes which
      // causes severe scaling pixelation or partial rendering issues.
      modifiedBlobUrl = getModifiedSvgBlobUrl(svgText, customWidth, customHeight);

      // 2. Load the SVG blob into an Image object
      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Unable to parse the SVG image for rendering."));
        img.src = modifiedBlobUrl;
      });

      await loadPromise;

      // 3. Setup dynamic in-memory Canvas
      const canvas = document.createElement("canvas");
      canvas.width = customWidth;
      canvas.height = customHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to initialize canvas context.");
      }

      // 4. Fill with white background if output format is JPEG (no transparency support)
      if (selectedFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, customWidth, customHeight);
      } else {
        // Clear canvas explicitly (default transparency)
        ctx.clearRect(0, 0, customWidth, customHeight);
      }

      // 5. Draw the loaded SVG image onto the canvas at target dimensions
      ctx.drawImage(img, 0, 0, customWidth, customHeight);

      // 6. Generate the image data URL
      const mimeType = `image/${selectedFormat}`;
      const qualityFactor = selectedFormat === "png" ? undefined : quality / 100;
      const dataUrl = canvas.toDataURL(mimeType, qualityFactor);

      if (!dataUrl || dataUrl === "data:,") {
        throw new Error("Canvas render produced an empty image. The SVG content might be too complex or secure.");
      }

      // 7. Create a download link and trigger automatic browser download
      const originalBaseName = selectedFile.name.replace(/\.svg$/i, "");
      const outputExt = selectedFormatObj ? selectedFormatObj.extension : "png";
      const filename = `${originalBaseName}_converted.${outputExt}`;

      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

    } catch (err) {
      console.error(err);
      setError(
        err.message || 
        "Failed to convert the SVG. Please make sure the SVG file is valid and contains no external dependencies."
      );
    } finally {
      // Clean up modified blob URL if it was created
      if (modifiedBlobUrl) {
        URL.revokeObjectURL(modifiedBlobUrl);
      }
      setIsConverting(false);
    }
  };

  // Formatter for display size
  const getDisplaySize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <ToolPageShell widthClassName="max-w-6xl px-4 pt-24 pb-12">
      <div className="mx-auto flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
            SVG Converter
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Convert SVG vector graphics to PNG, JPEG, or WebP format instantly in your browser. Complete local privacy, no server uploads.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-xl flex items-start gap-3 shadow-sm animate-fadeIn">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                Conversion Error
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-400/90 mt-1">
                {error}
              </p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors text-sm font-bold px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Initial Upload State */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-12 md:p-20 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-6 group ${
              isDragging 
                ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/15 scale-[1.01]" 
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-950/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <UploadCloud className="h-10 w-10 md:h-12 md:w-12" />
            </div>

            <div className="space-y-2">
              <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                Drag & drop your SVG here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or <span className="text-blue-600 dark:text-blue-400 font-semibold underline decoration-2 underline-offset-4 group-hover:text-blue-700 dark:group-hover:text-blue-300">browse files</span> from your device
              </p>
            </div>
            
            <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400">
              <FileCode className="h-4 w-4" />
              Supports standard vector SVG files
            </div>
          </div>
        ) : (
          /* Active Editing & Conversion Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            
            {/* Left Column: Preview Board */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
                
                {/* Board Action Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px] sm:max-w-xs">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>

                {/* SVG Live Preview Screen */}
                <div className="relative aspect-video rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-950/50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] min-h-[320px]">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="SVG preview"
                      className="max-w-full max-h-[300px] object-contain p-4 drop-shadow-sm select-none"
                    />
                  )}
                </div>

                {/* Technical Meta Information */}
                <div className="grid grid-cols-3 gap-4 text-center mt-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800/80 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                      Original Width
                    </p>
                    <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 mt-0.5">
                      {originalWidth ? `${Math.round(originalWidth)}px` : "Auto"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800/80 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                      Original Height
                    </p>
                    <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 mt-0.5">
                      {originalHeight ? `${Math.round(originalHeight)}px` : "Auto"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800/80 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">
                      File Size
                    </p>
                    <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 mt-0.5">
                      {getDisplaySize(selectedFile.size)}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Settings & Controls */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                
                <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                  Conversion Settings
                </h2>

                {/* 1. Custom Format Dropdown */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Output Format
                  </label>
                  
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-white dark:hover:bg-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{selectedFormatObj?.icon}</span>
                        <div className="text-left">
                          <span className="block text-sm font-bold text-gray-850 dark:text-white">
                            {selectedFormatObj?.name}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isFormatDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isFormatDropdownOpen && (
                      <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden py-1.5 animate-fadeIn">
                        {formats.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setSelectedFormat(f.id);
                              setIsFormatDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-colors ${
                              selectedFormat === f.id ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{f.icon}</span>
                              <div>
                                <span className="block text-sm font-bold text-gray-850 dark:text-white">
                                  {f.name}
                                </span>
                                <span className="block text-[11px] text-gray-400 dark:text-gray-500">
                                  {f.desc}
                                </span>
                              </div>
                            </div>
                            {selectedFormat === f.id && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Custom Dimensions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Output Dimensions (px)
                    </label>
                    <button
                      onClick={handleLockToggle}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        lockAspectRatio
                          ? "bg-blue-50/70 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      }`}
                      title={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                    >
                      {lockAspectRatio ? (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>Locked</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3.5 w-3.5" />
                          <span>Unlocked</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-450 dark:text-gray-500">Width</span>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={customWidth}
                        onChange={handleWidthChange}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-450 dark:text-gray-500">Height</span>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={customHeight}
                        onChange={handleHeightChange}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Quality Factor Slider (Visible for JPEG & WebP only) */}
                {selectedFormat !== "png" && (
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-850 animate-slideDown">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <span>Compression Quality</span>
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400 focus:outline-none"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                      <span>Smaller File</span>
                      <span>Best Quality</span>
                    </div>
                  </div>
                )}

                {/* 4. Action Convert and Download Button */}
                <button
                  type="button"
                  disabled={isConverting || !customWidth || !customHeight}
                  onClick={handleConvert}
                  className="w-full mt-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-3.5 transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none select-none relative overflow-hidden group"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Rasterizing vector elements...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 group-hover:translate-y-0.5 transition-transform duration-200" />
                      <span>Convert & Download</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 font-semibold mt-1">
                  100% Client-Side. Converting vector path nodes directly onto canvas raster cells.
                </p>

              </div>
            </div>

          </div>
        )}
      </div>
    </ToolPageShell>
  );
}
