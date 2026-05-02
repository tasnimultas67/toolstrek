"use client";

import React, { useState, useCallback, useEffect } from "react";
import { encode as encodeAvif } from "@jsquash/avif";

const ImageToAvifConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [quality, setQuality] = useState(0.8);
  const [convertedSize, setConvertedSize] = useState(null);
  const [isAvifSupported, setIsAvifSupported] = useState(true);
  const [isModuleLoaded, setIsModuleLoaded] = useState(false);

  // Check if AVIF encoding is supported
  useEffect(() => {
    const checkSupport = async () => {
      try {
        // Try to load the module
        await encodeAvif;
        setIsModuleLoaded(true);
        setIsAvifSupported(true);
      } catch (err) {
        console.error("AVIF module not supported:", err);
        setIsAvifSupported(false);
        setIsModuleLoaded(false);
        setError(
          "AVIF encoding is not supported in this browser. Please use Chrome, Edge, or Firefox.",
        );
      }
    };
    checkSupport();
  }, []);

  // Quality presets
  const qualityPresets = [
    {
      label: "High Quality",
      value: 0.95,
      description: "Best quality, larger file",
    },
    { label: "Balanced", value: 0.8, description: "Good quality and size" },
    {
      label: "Small File",
      value: 0.6,
      description: "Smaller file, reduced quality",
    },
  ];

  // Error handling helper
  const handleError = useCallback(
    (err, customMessage = "An unexpected error occurred") => {
      console.error("Error details:", err);
      let errorMessage = customMessage;

      if (err.message) {
        if (err.message.includes("decode") || err.message.includes("load")) {
          errorMessage =
            "Failed to load image. Please ensure the file is a valid image.";
        } else if (err.message.includes("memory")) {
          errorMessage =
            "Image is too large. Please try a smaller file (max 10MB).";
        } else if (
          err.message.includes("encode") ||
          err.message.includes("avif")
        ) {
          errorMessage =
            "Failed to encode to AVIF. Please try a different image or lower quality.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setIsConverting(false);

      setTimeout(() => setError(null), 5000);
    },
    [],
  );

  // Reset all states
  const resetStates = useCallback(() => {
    if (convertedUrl) {
      URL.revokeObjectURL(convertedUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setConvertedUrl(null);
    setError(null);
    setIsConverting(false);
    setImageDimensions(null);
    setConvertedSize(null);
  }, [convertedUrl]);

  // Validate file type
  const isValidImageType = (file) => {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    const validExtensions = [".png", ".jpg", ".jpeg", ".webp"];
    const extension = "." + file.name.split(".").pop().toLowerCase();

    return (
      validTypes.includes(file.type) || validExtensions.includes(extension)
    );
  };

  // Get format name from file
  const getFileFormat = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "png") return "PNG";
    if (ext === "jpg" || ext === "jpeg") return "JPEG";
    if (ext === "webp") return "WEBP";
    return "Image";
  };

  // Convert image to ImageData
  const getImageData = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);

          URL.revokeObjectURL(objectUrl);
          resolve({
            imageData,
            width: img.width,
            height: img.height,
          });
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image"));
      };

      img.src = objectUrl;
    });
  };

  // Handle file selection
  const handleFileChange = useCallback(
    async (event) => {
      const file = event.target.files[0];
      resetStates();

      if (!file) return;

      // Validate file type
      if (!isValidImageType(file)) {
        handleError(
          new Error("Invalid file type"),
          "Please select a valid image file (PNG, JPEG, or WEBP)",
        );
        event.target.value = "";
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        handleError(
          new Error("File too large"),
          "File size exceeds 10MB limit. Please choose a smaller file.",
        );
        event.target.value = "";
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.onerror = () => {
        handleError(
          new Error("Failed to read file"),
          "Unable to read the selected file. Please try again.",
        );
      };
      reader.readAsDataURL(file);

      // Get image dimensions
      try {
        const { width, height } = await getImageData(file);
        setImageDimensions({ width, height });
      } catch (err) {
        console.error("Failed to get image dimensions:", err);
      }
    },
    [resetStates, handleError],
  );

  // Convert image to AVIF
  const convertToAvif = useCallback(async () => {
    if (!selectedFile) {
      handleError(
        new Error("No file selected"),
        "Please select an image file first",
      );
      return;
    }

    if (!isModuleLoaded) {
      handleError(
        new Error("AVIF module not loaded"),
        "AVIF encoder is still loading. Please wait and try again.",
      );
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      // Get image data from the selected file
      const { imageData } = await getImageData(selectedFile);

      // Encode to AVIF
      const avifBuffer = await encodeAvif(imageData, {
        quality: quality,
        effort: 4, // Balanced effort
      });

      // Check if we got a valid buffer
      if (!avifBuffer || !(avifBuffer instanceof ArrayBuffer)) {
        throw new Error("Invalid AVIF data received");
      }

      // Create blob from buffer
      const avifBlob = new Blob([avifBuffer], { type: "image/avif" });

      // Check if blob is valid
      if (!avifBlob || avifBlob.size === 0) {
        throw new Error("Created blob is empty or invalid");
      }

      // Clean up old URL if exists
      if (convertedUrl) {
        URL.revokeObjectURL(convertedUrl);
      }

      // Create object URL
      const url = URL.createObjectURL(avifBlob);
      setConvertedUrl(url);
      setConvertedSize(avifBlob.size);
    } catch (err) {
      console.error("AVIF conversion error:", err);
      handleError(
        err,
        "Failed to convert image to AVIF. Please try a different image or lower quality.",
      );
    } finally {
      setIsConverting(false);
    }
  }, [selectedFile, quality, isModuleLoaded, convertedUrl, handleError]);

  // Download the converted image
  const downloadImage = useCallback(() => {
    if (!convertedUrl) return;

    try {
      const link = document.createElement("a");
      const originalName =
        selectedFile?.name.replace(/\.[^/.]+$/, "") || "converted";
      link.download = `${originalName}.avif`;
      link.href = convertedUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      handleError(err, "Failed to download the converted image");
    }
  }, [convertedUrl, selectedFile, handleError]);

  // Export as alternative format using canvas
  const exportAsAlternative = useCallback(
    async (format) => {
      if (!selectedFile) return;

      setIsConverting(true);
      setError(null);

      try {
        // Load image
        const img = new Image();
        const objectUrl = URL.createObjectURL(selectedFile);

        const imageLoadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = objectUrl;
        });

        const loadedImg = await imageLoadPromise;

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = loadedImg.width;
        canvas.height = loadedImg.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(loadedImg, 0, 0);

        // Convert to format
        let mimeType;
        let extension;
        switch (format) {
          case "png":
            mimeType = "image/png";
            extension = "png";
            break;
          case "jpeg":
            mimeType = "image/jpeg";
            extension = "jpg";
            break;
          case "webp":
            mimeType = "image/webp";
            extension = "webp";
            break;
          default:
            mimeType = "image/png";
            extension = "png";
        }

        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Download
        const link = document.createElement("a");
        const originalName =
          selectedFile.name.replace(/\.[^/.]+$/, "") || "converted";
        link.download = `${originalName}.${extension}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        console.error(`${format.toUpperCase()} conversion error:`, err);
        handleError(
          err,
          `Failed to convert to ${format.toUpperCase()}. Please try again.`,
        );
      } finally {
        setIsConverting(false);
      }
    },
    [selectedFile, quality, handleError],
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file && isValidImageType(file)) {
        const event = { target: { files: [file] } };
        handleFileChange(event);
      } else {
        handleError(
          new Error("Invalid file type"),
          "Please drop a valid image file (PNG, JPEG, or WEBP)",
        );
      }
    },
    [handleFileChange, handleError],
  );

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (convertedUrl) {
        URL.revokeObjectURL(convertedUrl);
      }
    };
  }, [convertedUrl]);

  return (
    <div className="min-h-screen bg-gray-50 pb-10 pt-24 px-2">
      <div className="max-w-6xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Image to AVIF Converter
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Convert PNG, JPEG, or WEBP images to modern AVIF format
            </p>
          </div>

          {/* Loading State */}
          {!isModuleLoaded && !error && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-blue-700">Loading AVIF encoder...</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {convertedUrl && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-slideDown">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <p className="text-green-700 text-sm font-medium">
                    Successfully converted to AVIF!
                  </p>
                  {convertedSize && (
                    <p className="text-green-600 text-xs mt-1">
                      Output size: {formatFileSize(convertedSize)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
                    setConvertedUrl(null);
                    setConvertedSize(null);
                  }}
                  className="text-gray-400 hover:text-green-500 transition-colors text-xl"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideDown">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium whitespace-pre-line">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-xl"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          {!selectedFile ? (
            <div
              onClick={() =>
                isModuleLoaded &&
                document.getElementById("image-file-input").click()
              }
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 text-center transition-all ${
                isModuleLoaded
                  ? "cursor-pointer hover:border-blue-500 hover:bg-blue-50 group"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="text-5xl md:text-6xl transition-transform group-hover:scale-110">
                  🖼️ → 🎨
                </div>
                <div>
                  <p className="text-lg md:text-xl font-semibold text-gray-700">
                    Drag & drop an image here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
                <input
                  id="image-file-input"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={!isModuleLoaded}
                />
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all hover:shadow-md disabled:opacity-50"
                  disabled={!isModuleLoaded}
                >
                  Choose Image
                </button>
                <p className="text-xs text-gray-400">
                  Supports PNG, JPEG, WEBP • Max 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {/* Image Info Bar */}
              {imageDimensions && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-700">
                        📏 Dimensions:{" "}
                        <strong>
                          {imageDimensions.width} x {imageDimensions.height}px
                        </strong>
                      </span>
                      <span className="text-gray-700">
                        📦 Original:{" "}
                        <strong>{formatFileSize(selectedFile.size)}</strong>
                      </span>
                      <span className="text-gray-700">
                        🏷️ Format:{" "}
                        <strong>{getFileFormat(selectedFile)}</strong>
                      </span>
                    </div>
                    <button
                      onClick={resetStates}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Choose different file →
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Image Panel */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Original Image
                    </span>
                    <span className="text-sm text-gray-600 truncate flex-1">
                      {selectedFile.name}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center min-h-[300px] border border-gray-100">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Original preview"
                        className="max-w-full max-h-[300px] object-contain rounded"
                      />
                    )}
                  </div>

                  {/* Alternative Format Export */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">
                      Also available as:
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportAsAlternative("png")}
                        disabled={isConverting}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        PNG
                      </button>
                      <button
                        onClick={() => exportAsAlternative("jpeg")}
                        disabled={isConverting}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        JPEG
                      </button>
                      <button
                        onClick={() => exportAsAlternative("webp")}
                        disabled={isConverting}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        WEBP
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conversion Controls & Result Panel */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                  {/* Quality Presets */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quality Settings:
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {qualityPresets.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setQuality(preset.value)}
                          className={`p-2 rounded-lg border transition-all ${
                            quality === preset.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <div className="text-sm font-medium">
                            {preset.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {preset.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Slider */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.01"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Smaller file</span>
                      <span>Better quality</span>
                    </div>
                  </div>

                  {/* Convert Button */}
                  {!convertedUrl ? (
                    <button
                      onClick={convertToAvif}
                      disabled={isConverting || !isModuleLoaded}
                      className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConverting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Converting to AVIF...
                        </span>
                      ) : (
                        "Convert to AVIF"
                      )}
                    </button>
                  ) : (
                    <div className="mb-4">
                      <div className="bg-white rounded-lg p-4 mb-3 flex items-center justify-center min-h-[200px] border border-gray-100">
                        <img
                          src={convertedUrl}
                          alt="Converted AVIF preview"
                          className="max-w-full max-h-[200px] object-contain rounded"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={convertToAvif}
                          disabled={isConverting}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
                        >
                          Convert Again
                        </button>
                        <button
                          onClick={downloadImage}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                        >
                          Download AVIF
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-700 text-center">
                      ✨ <strong>AVIF Benefits:</strong> Up to 50% smaller than
                      JPEG • Better quality than WebP • Supports transparency •
                      Modern compression
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔄</span>
                <span>Convert to AVIF format</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span>Fast client-side processing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <span>Your files stay private (no uploads)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <span>Adjustable quality compression</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📥</span>
                <span>Export as PNG, JPEG, or WEBP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease;
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease;
        }
      `}</style>
    </div>
  );
};

export default ImageToAvifConverter;
