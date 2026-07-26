"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  ChevronDown,
  Check,
  Download,
  AlertCircle,
  RotateCw,
  Settings2,
  Maximize2,
  Crop,
  Layers,
  ArrowRight,
  Sparkles,
  Smartphone,
  Video,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  FileSpreadsheet
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { toast } from "sonner";

// Social media presets configuration
const SOCIAL_PRESETS = [
  {
    platform: "Instagram",
    icon: Instagram,
    color: "from-pink-500 via-red-500 to-yellow-500",
    presets: [
      { name: "Square Post (1:1)", width: 1080, height: 1080, ratio: "1:1" },
      { name: "Portrait Post (4:5)", width: 1080, height: 1350, ratio: "4:5" },
      { name: "Landscape Post (1.91:1)", width: 1080, height: 566, ratio: "1.91:1" },
      { name: "Instagram Story (9:16)", width: 1080, height: 1920, ratio: "9:16" },
      { name: "Profile Photo (1:1)", width: 320, height: 320, ratio: "1:1" },
    ]
  },
  {
    platform: "YouTube",
    icon: Youtube,
    color: "from-red-600 to-red-700",
    presets: [
      { name: "Thumbnail (16:9)", width: 1280, height: 720, ratio: "16:9" },
      { name: "Banner Image", width: 2560, height: 1440, ratio: "16:9" },
      { name: "Channel Profile Picture (1:1)", width: 800, height: 800, ratio: "1:1" },
    ]
  },
  {
    platform: "Facebook",
    icon: Facebook,
    color: "from-blue-600 to-blue-700",
    presets: [
      { name: "Post Image (1.91:1)", width: 1200, height: 630, ratio: "1.91:1" },
      { name: "Cover Photo (820x312)", width: 820, height: 312, ratio: "2.63:1" },
      { name: "Story (9:16)", width: 1080, height: 1920, ratio: "9:16" },
      { name: "Page Profile Picture (1:1)", width: 180, height: 180, ratio: "1:1" },
    ]
  },
  {
    platform: "Twitter / X",
    icon: Twitter,
    color: "from-slate-800 to-slate-950 dark:from-slate-700 dark:to-slate-900",
    presets: [
      { name: "Post Image (16:9)", width: 1600, height: 900, ratio: "16:9" },
      { name: "Header Photo (3:1)", width: 1500, height: 500, ratio: "3:1" },
      { name: "Profile Photo (1:1)", width: 400, height: 400, ratio: "1:1" },
    ]
  },
  {
    platform: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-700 to-blue-800",
    presets: [
      { name: "Post Image (1.91:1)", width: 1200, height: 627, ratio: "1.91:1" },
      { name: "Profile Banner (4:1)", width: 1584, height: 396, ratio: "4:1" },
      { name: "Profile Photo (1:1)", width: 400, height: 400, ratio: "1:1" },
      { name: "Company Cover (1128x191)", width: 1128, height: 191, ratio: "5.9:1" },
    ]
  },
  {
    platform: "Pinterest",
    icon: FileSpreadsheet,
    color: "from-red-500 to-red-600",
    presets: [
      { name: "Standard Pin (2:3)", width: 1000, height: 1500, ratio: "2:3" },
      { name: "Profile Photo (1:1)", width: 165, height: 165, ratio: "1:1" },
    ]
  }
];

export default function ImageResizer() {
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageMeta, setImageMeta] = useState({
    name: "",
    size: 0,
    type: "",
    width: 0,
    height: 0,
    aspectRatio: 1
  });

  // Resizing options
  const [resizeUnit, setResizeUnit] = useState("px"); // "px" | "%"
  const [targetWidth, setTargetWidth] = useState("");
  const [targetHeight, setTargetHeight] = useState("");
  const [percentage, setPercentage] = useState(100);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [resizeMode, setResizeMode] = useState("fill"); // "stretch" | "fit" | "fill"
  const [bgColor, setBgColor] = useState("transparent"); // "transparent", "#ffffff", "#000000", custom
  const [customBgColor, setCustomBgColor] = useState("#ffffff");
  const [outputFormat, setOutputFormat] = useState("original"); // "original" | "png" | "jpeg" | "webp"
  const [quality, setQuality] = useState(90);
  
  // Transformations
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Processing status
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // DOM References
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    setIsProcessing(true);
    const objectUrl = URL.createObjectURL(file);
    
    const img = new Image();
    img.onload = () => {
      setImageFile(file);
      setImageSrc(objectUrl);
      
      const meta = {
        name: file.name,
        size: file.size,
        type: file.type.split("/")[1]?.toUpperCase() || "UNKNOWN",
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      };
      setImageMeta(meta);

      // Set initial sizing inputs
      setTargetWidth(img.naturalWidth.toString());
      setTargetHeight(img.naturalHeight.toString());
      setPercentage(100);
      setResizeUnit("px");
      
      // Reset transformations
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      
      setIsProcessing(false);
      toast.success("Image loaded successfully!");
    };
    img.onerror = () => {
      setIsProcessing(false);
      toast.error("Failed to load image. It might be corrupted.");
    };
    img.src = objectUrl;
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  // Width / Height change calculations
  const handleWidthChange = (val) => {
    setTargetWidth(val);
    if (!val || isNaN(val)) return;

    if (lockAspectRatio && imageMeta.aspectRatio) {
      // Calculate height based on current transformations
      // If rotated 90 or 270 deg, aspect ratio is inverted
      const isRotated = rotation === 90 || rotation === 270;
      const currentRatio = isRotated ? 1 / imageMeta.aspectRatio : imageMeta.aspectRatio;
      
      const newHeight = Math.round(parseFloat(val) / currentRatio);
      setTargetHeight(isNaN(newHeight) ? "" : newHeight.toString());
    }
  };

  const handleHeightChange = (val) => {
    setTargetHeight(val);
    if (!val || isNaN(val)) return;

    if (lockAspectRatio && imageMeta.aspectRatio) {
      const isRotated = rotation === 90 || rotation === 270;
      const currentRatio = isRotated ? 1 / imageMeta.aspectRatio : imageMeta.aspectRatio;

      const newWidth = Math.round(parseFloat(val) * currentRatio);
      setTargetWidth(isNaN(newWidth) ? "" : newWidth.toString());
    }
  };

  // Percentage slider / input change
  const handlePercentageChange = (pct) => {
    setPercentage(pct);
    if (imageMeta.width && imageMeta.height) {
      const isRotated = rotation === 90 || rotation === 270;
      const sourceW = isRotated ? imageMeta.height : imageMeta.width;
      const sourceH = isRotated ? imageMeta.width : imageMeta.height;

      const newWidth = Math.round((sourceW * pct) / 100);
      const newHeight = Math.round((sourceH * pct) / 100);
      setTargetWidth(newWidth.toString());
      setTargetHeight(newHeight.toString());
    }
  };

  // Unit changes (pixels vs percentage)
  const handleUnitChange = (unit) => {
    setResizeUnit(unit);
    if (unit === "%") {
      handlePercentageChange(percentage);
    }
  };

  // Rotate clockwise
  const handleRotateCw = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);

    // Swap target width and height inputs if lock aspect ratio is on or if we just rotated
    if (targetWidth && targetHeight) {
      setTargetWidth(targetHeight);
      setTargetHeight(targetWidth);
    }
  };

  // Apply social media preset
  const applyPreset = (preset) => {
    setResizeUnit("px");
    setLockAspectRatio(false); // Disable lock to allow custom preset dimensions
    setTargetWidth(preset.width.toString());
    setTargetHeight(preset.height.toString());
    toast.success(`Preset "${preset.name}" applied: ${preset.width}x${preset.height}`);
  };

  // Reset tool state
  const resetImage = () => {
    setImageFile(null);
    setImageSrc(null);
    setImageMeta({
      name: "",
      size: 0,
      type: "",
      width: 0,
      height: 0,
      aspectRatio: 1
    });
    setTargetWidth("");
    setTargetHeight("");
    setPercentage(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setResizeUnit("px");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get active background color
  const getSelectedBgColor = () => {
    if (bgColor === "transparent") return "transparent";
    return bgColor === "custom" ? customBgColor : bgColor;
  };

  // Resize and download canvas logic
  const handleResizeAndDownload = () => {
    if (!imageSrc || !targetWidth || !targetHeight) {
      toast.error("Please load an image and specify valid dimensions.");
      return;
    }

    const w = parseInt(targetWidth);
    const h = parseInt(targetHeight);

    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      toast.error("Please enter positive integer dimensions.");
      return;
    }

    if (w > 16384 || h > 16384) {
      toast.error("Dimensions are too large. Maximum size is 16,384 pixels.");
      return;
    }

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      try {
        // Step 1: Draw transformed image (rotation & flip) onto a helper canvas
        const transCanvas = document.createElement("canvas");
        const transCtx = transCanvas.getContext("2d");

        const isRotated = rotation === 90 || rotation === 270;
        const transW = isRotated ? img.naturalHeight : img.naturalWidth;
        const transH = isRotated ? img.naturalWidth : img.naturalHeight;

        transCanvas.width = transW;
        transCanvas.height = transH;

        // Apply transformations
        transCtx.translate(transW / 2, transH / 2);
        transCtx.rotate((rotation * Math.PI) / 180);
        transCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        transCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        // Step 2: Render onto the final sized canvas based on the Resize Mode
        const finalCanvas = document.createElement("canvas");
        const finalCtx = finalCanvas.getContext("2d");

        finalCanvas.width = w;
        finalCanvas.height = h;

        const currentBgColor = getSelectedBgColor();

        // Fill background color
        if (currentBgColor === "transparent") {
          finalCtx.clearRect(0, 0, w, h);
        } else {
          finalCtx.fillStyle = currentBgColor;
          finalCtx.fillRect(0, 0, w, h);
        }

        // Enable high-quality scaling
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = "high";

        if (resizeMode === "stretch") {
          // Stretch to exactly fill
          finalCtx.drawImage(transCanvas, 0, 0, w, h);
        } else if (resizeMode === "fit") {
          // Maintain aspect ratio, fit inside, pad background
          const transRatio = transW / transH;
          const targetRatio = w / h;
          let drawW = w;
          let drawH = h;
          let dx = 0;
          let dy = 0;

          if (transRatio > targetRatio) {
            drawH = w / transRatio;
            dy = (h - drawH) / 2;
          } else {
            drawW = h * transRatio;
            dx = (w - drawW) / 2;
          }

          finalCtx.drawImage(transCanvas, dx, dy, drawW, drawH);
        } else {
          // "fill" (crop) - Cover entire canvas, cropping overflow centered
          const transRatio = transW / transH;
          const targetRatio = w / h;
          let drawW = w;
          let drawH = h;
          let dx = 0;
          let dy = 0;

          if (transRatio > targetRatio) {
            drawW = h * transRatio;
            dx = (w - drawW) / 2;
          } else {
            drawH = w / transRatio;
            dy = (h - drawH) / 2;
          }

          finalCtx.drawImage(transCanvas, dx, dy, drawW, drawH);
        }

        // Step 3: Export format and download
        let exportFormat = "image/png";
        let extension = "png";
        
        if (outputFormat === "png") {
          exportFormat = "image/png";
          extension = "png";
        } else if (outputFormat === "jpeg") {
          exportFormat = "image/jpeg";
          extension = "jpg";
        } else if (outputFormat === "webp") {
          exportFormat = "image/webp";
          extension = "webp";
        } else {
          // "original"
          const origType = imageFile.type;
          if (["image/jpeg", "image/png", "image/webp"].includes(origType)) {
            exportFormat = origType;
            extension = origType.split("/")[1] === "jpeg" ? "jpg" : origType.split("/")[1];
          } else {
            // fallback
            exportFormat = "image/png";
            extension = "png";
          }
        }

        const qVal = quality / 100;
        const dataUrl = finalCanvas.toDataURL(exportFormat, qVal);
        
        // Trigger download
        const link = document.createElement("a");
        const originalBaseName = imageMeta.name.substring(0, imageMeta.name.lastIndexOf(".")) || imageMeta.name;
        link.download = `${originalBaseName}_resized_${w}x${h}.${extension}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Image resized and downloaded successfully!");
        setIsProcessing(false);
      } catch (err) {
        console.error(err);
        toast.error("An error occurred during image resizing.");
        setIsProcessing(false);
      }
    };
    img.onerror = () => {
      toast.error("Failed to re-render the image file.");
      setIsProcessing(false);
    };
    img.src = imageSrc;
  };

  // Human readable file size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <ToolPageShell widthClassName="max-w-6xl" className="py-6 px-4">
      {/* Header Info */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <ImageIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Image Resizer
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          Professionally resize, crop, rotate and convert your images. All operations run 100% in your browser for absolute privacy and maximum speed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Upload & Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!imageSrc ? (
            // Drag and drop uploader
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[350px] ${
                isDragging
                  ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/20 shadow-inner"
                  : "border-gray-300 hover:border-indigo-500 dark:border-gray-700 dark:hover:border-indigo-400 bg-white/50 dark:bg-gray-800/40 backdrop-blur-sm"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full mb-4">
                <UploadCloud className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                Drag and drop your image here
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                Supports JPEG, PNG, WebP, SVG, GIF, AVIF (Max 25MB)
              </p>
              <button
                type="button"
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Browse Files
              </button>
            </div>
          ) : (
            // Preview Section
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="max-w-[200px] sm:max-w-sm truncate">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {imageMeta.name}
                    </h3>
                    <p className="text-[12px] sm:text-[13px] text-gray-400">
                      {imageMeta.type} • {formatBytes(imageMeta.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetImage}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Real Interactive Preview Screen */}
              <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center p-4 min-h-[300px] max-h-[500px]">
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Original image preview"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    transition: "transform 0.3s ease",
                    maxHeight: "350px",
                    objectFit: "contain"
                  }}
                  className="rounded shadow-sm max-w-full"
                />
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center border border-gray-100 dark:border-gray-800">
                  <span className="text-[12px] sm:text-[13px] text-gray-400 uppercase tracking-wider block">
                    Original Resolution
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mt-1 block">
                    {imageMeta.width} x {imageMeta.height} px
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center border border-gray-100 dark:border-gray-800">
                  <span className="text-[12px] sm:text-[13px] text-gray-400 uppercase tracking-wider block">
                    Target Output
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                    {targetWidth || "?"} x {targetHeight || "?"} px
                  </span>
                </div>
              </div>

              {/* Rotation & Flip Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRotateCw}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                  Rotate 90°
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    flipH
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Flip H
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    flipV
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Flip V
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Settings & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            
            {/* Dimensions Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Dimensions
                </h3>

                {/* Units tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg border border-gray-200/50 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => handleUnitChange("px")}
                    className={`px-2.5 py-1 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
                      resizeUnit === "px"
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    Pixels
                  </button>
                  <button
                    type="button"
                    disabled={!imageSrc}
                    onClick={() => handleUnitChange("%")}
                    className={`px-2.5 py-1 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
                      !imageSrc ? "opacity-50 cursor-not-allowed" : ""
                    } ${
                      resizeUnit === "%"
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    Percent
                  </button>
                </div>
              </div>

              {resizeUnit === "px" ? (
                /* Pixel input controls */
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <label className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 block mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      disabled={!imageSrc}
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      placeholder="Width"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="col-span-2 flex justify-center pt-5">
                    <button
                      type="button"
                      disabled={!imageSrc}
                      onClick={() => setLockAspectRatio(!lockAspectRatio)}
                      className={`p-2 rounded-xl transition-all border cursor-pointer ${
                        lockAspectRatio
                          ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-400"
                          : "bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-900 dark:border-gray-700 hover:text-gray-600"
                      }`}
                      title={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                    >
                      {lockAspectRatio ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="col-span-5">
                    <label className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 block mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      disabled={!imageSrc}
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      placeholder="Height"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              ) : (
                /* Percentage inputs */
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400">
                      Scale Percentage
                    </label>
                    <span className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {percentage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    disabled={!imageSrc}
                    value={percentage}
                    onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400 disabled:opacity-50"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        disabled={!imageSrc}
                        onClick={() => handlePercentageChange(val)}
                        className={`py-1 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                          percentage === val
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400"
                            : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Social Media Presets */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Social Media Presets
              </h3>
              
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-gray-50/50 dark:bg-gray-900/30">
                {SOCIAL_PRESETS.map((group) => {
                  const PlatformIcon = group.icon;
                  return (
                    <div key={group.platform} className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                        <span className={`p-1 rounded text-white bg-gradient-to-tr ${group.color}`}>
                          <PlatformIcon className="w-3.5 h-3.5" />
                        </span>
                        {group.platform}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pl-5">
                        {group.presets.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            disabled={!imageSrc}
                            onClick={() => applyPreset(preset)}
                            className="text-left px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50/10 dark:hover:border-indigo-500 rounded-lg transition-all text-[12px] sm:text-[13px] text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                          >
                            <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {preset.name}
                            </span>
                            <span className="text-[11px] sm:text-[12px] text-gray-400 block">
                              {preset.width} × {preset.height} px
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advanced Options Accordion */}
            <div className="border border-gray-150 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Settings2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                  Advanced Options
                </span>
                <ChevronDown
                  className={`w-4.5 h-4.5 text-gray-400 transition-transform duration-300 ${
                    showAdvanced ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showAdvanced ? "max-h-[800px] border-t border-gray-150 dark:border-gray-700 p-4 space-y-5" : "max-h-0"
                }`}
              >
                {/* Scale Mode */}
                <div className="space-y-2">
                  <label className="text-[12px] sm:text-[13px] font-semibold text-gray-600 dark:text-gray-400 block">
                    Resize Aspect-Ratio Fill Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "fill", name: "Fill & Crop", desc: "Zoom & crop center" },
                      { id: "fit", name: "Fit (Pad)", desc: "Maintain ratio with margins" },
                      { id: "stretch", name: "Stretch", desc: "Forced exact sizes" }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setResizeMode(mode.id)}
                        className={`px-2.5 py-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                          resizeMode === mode.id
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400"
                            : "bg-white dark:bg-gray-800 border-gray-250 dark:border-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-[12px] sm:text-[13px] font-semibold block">{mode.name}</span>
                        <span className="text-[10px] sm:text-[11px] text-gray-400 block mt-0.5 leading-tight">
                          {mode.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pad Background Color - only active when fit mode selected */}
                {resizeMode === "fit" && (
                  <div className="space-y-2">
                    <label className="text-[12px] sm:text-[13px] font-semibold text-gray-600 dark:text-gray-400 block">
                      Canvas Padding Background Color
                    </label>
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => setBgColor("transparent")}
                        className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                          bgColor === "transparent"
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400"
                            : "bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        Transparent
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgColor("#ffffff")}
                        className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                          bgColor === "#ffffff"
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400"
                            : "bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        White
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgColor("#000000")}
                        className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                          bgColor === "#000000"
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400"
                            : "bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        Black
                      </button>
                      <div className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 bg-white dark:bg-gray-800">
                        <input
                          type="color"
                          value={customBgColor}
                          onChange={(e) => {
                            setBgColor("custom");
                            setCustomBgColor(e.target.value);
                          }}
                          className="w-6 h-6 border-0 rounded cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={customBgColor}
                          onChange={(e) => {
                            setBgColor("custom");
                            setCustomBgColor(e.target.value);
                          }}
                          className="w-16 text-center text-xs bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Output Format */}
                <div className="space-y-2">
                  <label className="text-[12px] sm:text-[13px] font-semibold text-gray-600 dark:text-gray-400 block">
                    Export Output Format
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "original", name: "Original" },
                      { id: "png", name: "PNG" },
                      { id: "jpeg", name: "JPEG" },
                      { id: "webp", name: "WebP" }
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setOutputFormat(fmt.id)}
                        className={`py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          outputFormat === fmt.id
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {fmt.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compression Quality Slider */}
                {(outputFormat === "jpeg" || outputFormat === "webp" || (outputFormat === "original" && imageFile && ["image/jpeg", "image/webp"].includes(imageFile.type))) && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] sm:text-[13px] font-semibold text-gray-600 dark:text-gray-400">
                        Compression Quality
                      </label>
                      <span className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {quality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                    />
                    <p className="text-[11px] sm:text-[12px] text-gray-400">
                      Lower quality results in smaller file sizes, higher quality preserves details.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resize & Download CTA */}
            <button
              type="button"
              disabled={!imageSrc || isProcessing}
              onClick={handleResizeAndDownload}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing Image...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Resize & Download Image
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Guide Card / Info */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-250 flex items-center gap-2 text-sm sm:text-base">
          <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Pro Resizing Tips
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <div className="space-y-1">
            <span className="font-semibold text-gray-800 dark:text-gray-300 block">Aspect Ratio Lock</span>
            <p>Keep the lock closed to prevent stretching/distortion. If you must set exact different dimensions, choose Fill & Crop or Fit (Pad) under Advanced Options.</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-gray-800 dark:text-gray-300 block">Scaling Modes</span>
            <p><strong>Fill & Crop</strong> is perfect for social media posts where you want the photo to fill the exact size without black borders. <strong>Fit (Pad)</strong> ensures no parts of the photo are cut off.</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-gray-800 dark:text-gray-300 block">Optimizing Output</span>
            <p>Convert PNGs with heavy graphics to WebP or JPEG with 80-90% quality to dramatically reduce web payload sizes without noticeable losses.</p>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
