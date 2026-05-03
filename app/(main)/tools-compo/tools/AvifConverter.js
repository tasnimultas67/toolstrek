"use client";

import React, { useState, useCallback } from "react";

const AvifConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("png");
  const [imageDimensions, setImageDimensions] = useState(null);
  const [quality, setQuality] = useState(92); // For JPG and WEBP quality

  // Available formats
  const formats = [
    { id: "png", name: "PNG", icon: "🖼️", extension: "png", mime: "image/png" },
    {
      id: "jpg",
      name: "JPEG",
      icon: "📷",
      extension: "jpg",
      mime: "image/jpeg",
    },
    {
      id: "webp",
      name: "WEBP",
      icon: "🌐",
      extension: "webp",
      mime: "image/webp",
    },
  ];

  // Error handling helper
  const handleError = useCallback(
    (err, customMessage = "An unexpected error occurred") => {
      console.error(err);
      let errorMessage = customMessage;

      if (err.message) {
        if (err.message.includes("decode")) {
          errorMessage =
            "Failed to decode AVIF image. Please ensure the file is a valid AVIF.";
        } else if (err.message.includes("memory")) {
          errorMessage =
            "Image is too large. Please try a smaller file (max 10MB).";
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
    setSelectedFile(null);
    setPreviewUrl(null);
    setConvertedUrl(null);
    setError(null);
    setIsConverting(false);
    setImageDimensions(null);
  }, []);

  // Handle file selection
  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      resetStates();

      if (!file) return;

      // Validate file type
      if (
        !file.type.includes("avif") &&
        !file.name.toLowerCase().endsWith(".avif")
      ) {
        handleError(
          new Error("Invalid file type"),
          "Please select a valid AVIF image file (.avif)",
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

      // Create preview URL for AVIF
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);

        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        handleError(
          new Error("Failed to read file"),
          "Unable to read the selected file. Please try again.",
        );
      };
      reader.readAsDataURL(file);
    },
    [resetStates, handleError],
  );

  // Convert AVIF to selected format
  const convertImage = useCallback(async () => {
    if (!selectedFile) {
      handleError(
        new Error("No file selected"),
        "Please select an AVIF file first",
      );
      return;
    }

    setIsConverting(true);
    setError(null);
    setConvertedUrl(null);

    try {
      // Create image element to decode AVIF
      const img = new Image();
      const objectUrl = URL.createObjectURL(selectedFile);

      // Promise wrapper for image loading
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () =>
          reject(
            new Error(
              "Failed to load AVIF image. The file might be corrupted.",
            ),
          );
        img.src = objectUrl;
      });

      await imageLoadPromise;

      // Create canvas for conversion
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Get format details
      const format = formats.find((f) => f.id === selectedFormat);
      let convertedDataUrl;

      // Convert based on selected format
      switch (selectedFormat) {
        case "png":
          convertedDataUrl = canvas.toDataURL("image/png");
          break;
        case "jpg":
          convertedDataUrl = canvas.toDataURL("image/jpeg", quality / 100);
          break;
        case "webp":
          convertedDataUrl = canvas.toDataURL("image/webp", quality / 100);
          break;
        default:
          convertedDataUrl = canvas.toDataURL("image/png");
      }

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);

      setConvertedUrl(convertedDataUrl);
    } catch (err) {
      handleError(
        err,
        "Conversion failed. Please check your AVIF file and try again.",
      );
    } finally {
      setIsConverting(false);
    }
  }, [selectedFile, selectedFormat, quality, handleError]);

  // Download the converted image
  const downloadImage = useCallback(() => {
    if (!convertedUrl) return;

    try {
      const link = document.createElement("a");
      const originalName =
        selectedFile?.name.replace(/\.avif$/i, "") || "converted";
      const format = formats.find((f) => f.id === selectedFormat);
      link.download = `${originalName}.${format.extension}`;
      link.href = convertedUrl;
      link.click();
    } catch (err) {
      handleError(err, "Failed to download the converted image");
    }
  }, [convertedUrl, selectedFile, selectedFormat, handleError]);

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
      if (
        file &&
        (file.type.includes("avif") ||
          file.name.toLowerCase().endsWith(".avif"))
      ) {
        const event = { target: { files: [file] } };
        handleFileChange(event);
      } else {
        handleError(
          new Error("Invalid file type"),
          "Please drop a valid AVIF file",
        );
      }
    },
    [handleFileChange, handleError],
  );

  // Get file size for display
  const getFileSize = (dataUrl) => {
    if (!dataUrl) return "0 KB";
    const size = Math.round((dataUrl.length * 3) / 4);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 pt-24 px-2">
      <div className="max-w-7xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              AVIF Converter
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Convert AVIF images to PNG, JPEG, or WEBP format instantly
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideDown">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="flex-1 text-red-700 text-sm font-medium">
                  {error}
                </p>
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
              onClick={() => document.getElementById("avif-file-input").click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">
                  🎨
                </div>
                <div>
                  <p className="text-lg md:text-xl font-semibold text-gray-700">
                    Drag & drop an AVIF file here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
                <input
                  id="avif-file-input"
                  type="file"
                  accept=".avif,image/avif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all hover:shadow-md">
                  Choose File
                </button>
                <p className="text-xs text-gray-400">
                  Supports AVIF files up to 10MB
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
                        <strong>
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </strong>
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
                {/* Original AVIF Panel */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Original AVIF
                    </span>
                    <span className="text-sm text-gray-600 truncate flex-1">
                      {selectedFile.name}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center min-h-[300px] border border-gray-100">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="AVIF preview"
                        className="max-w-full max-h-[300px] object-contain rounded"
                      />
                    )}
                  </div>
                </div>

                {/* Conversion Controls & Result Panel */}
                <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                  {/* Format Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select output format:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {formats.map((format) => (
                        <button
                          key={format.id}
                          onClick={() => {
                            setSelectedFormat(format.id);
                            setConvertedUrl(null); // Clear previous conversion
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedFormat === format.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <div className="text-2xl mb-1">{format.icon}</div>
                          <div className="text-sm font-medium">
                            {format.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Slider (for JPG and WEBP) */}
                  {(selectedFormat === "jpg" || selectedFormat === "webp") && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality: {quality}%
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={quality}
                        onChange={(e) => {
                          setQuality(parseInt(e.target.value));
                          setConvertedUrl(null); // Clear previous conversion
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Smaller file</span>
                        <span>Better quality</span>
                      </div>
                    </div>
                  )}

                  {/* Convert Button */}
                  {!convertedUrl ? (
                    <button
                      onClick={convertImage}
                      disabled={isConverting}
                      className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConverting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Converting...
                        </span>
                      ) : (
                        `Convert to ${formats.find((f) => f.id === selectedFormat)?.name}`
                      )}
                    </button>
                  ) : (
                    <div className="mb-4">
                      <div className="bg-white rounded-lg p-4 mb-3 flex items-center justify-center min-h-[200px] border border-gray-100">
                        <img
                          src={convertedUrl}
                          alt="Converted preview"
                          className="max-w-full max-h-[200px] object-contain rounded"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={convertImage}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
                        >
                          Convert Again
                        </button>
                        <button
                          onClick={downloadImage}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                        >
                          Download{" "}
                          {formats.find((f) => f.id === selectedFormat)?.name}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Converted size: {getFileSize(convertedUrl)}
                      </p>
                    </div>
                  )}

                  {/* Info Text */}
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-600 text-center">
                      💡 Tip: PNG is best for quality, JPG for photos, WEBP for
                      balance of quality and size
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
                <span>Multiple output formats</span>
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
                <span className="text-xl">🎨</span>
                <span>Adjustable quality for JPG/WEBP</span>
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

export default AvifConverter;
