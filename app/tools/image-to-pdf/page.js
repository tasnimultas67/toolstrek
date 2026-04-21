// components/ImageToPDF.jsx
"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileImage,
  X,
  Download,
  Loader2,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  Image as ImageIcon,
  FilePlus,
  AlertCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import imageCompression from "browser-image-compression";

const ImageToPDF = () => {
  const [images, setImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pageSize, setPageSize] = useState("image");
  const [margin, setMargin] = useState(0);
  const [quality, setQuality] = useState(0.95);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [fitMode, setFitMode] = useState("contain");
  const [uploadingImages, setUploadingImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const pageSizes = {
    A4: [595, 842],
    A5: [420, 595],
    Letter: [612, 792],
    Legal: [612, 1008],
    A3: [842, 1191],
  };

  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/bmp",
    ];

    // Track uploading files
    const newUploadingFiles = files.map((file) => ({
      id: Date.now() + Math.random() + Math.random(),
      name: file.name,
      size: file.size,
      status: "uploading",
      progress: 0,
    }));

    setUploadingImages((prev) => [...prev, ...newUploadingFiles]);

    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadingId = newUploadingFiles[i].id;

      if (validTypes.includes(file.type)) {
        try {
          // Update progress for this file
          setUploadProgress((prev) => ({ ...prev, [uploadingId]: 10 }));

          // Compress image before processing
          const options = {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            onProgress: (progress) => {
              const percent = Math.round(progress);
              setUploadProgress((prev) => ({
                ...prev,
                [uploadingId]: 10 + percent * 0.8,
              }));
            },
          };

          setUploadProgress((prev) => ({ ...prev, [uploadingId]: 30 }));
          const compressedFile = await imageCompression(file, options);

          setUploadProgress((prev) => ({ ...prev, [uploadingId]: 70 }));

          // Get original image dimensions
          const imgDimensions = await getImageDimensions(compressedFile);

          setUploadProgress((prev) => ({ ...prev, [uploadingId]: 85 }));
          const preview = URL.createObjectURL(compressedFile);

          setUploadProgress((prev) => ({ ...prev, [uploadingId]: 95 }));

          newImages.push({
            id: Date.now() + Math.random() + Math.random(),
            file: compressedFile,
            preview,
            name: file.name,
            size: compressedFile.size,
            originalSize: file.size,
            type: file.type,
            rotation: 0,
            flipH: false,
            flipV: false,
            zoom: 1,
            width: imgDimensions.width,
            height: imgDimensions.height,
          });

          // Mark this file as completed
          setUploadingImages((prev) =>
            prev.map((img) =>
              img.id === uploadingId
                ? { ...img, status: "completed", progress: 100 }
                : img,
            ),
          );

          setUploadProgress((prev) => ({ ...prev, [uploadingId]: 100 }));

          // Remove from uploading after a short delay
          setTimeout(() => {
            setUploadingImages((prev) =>
              prev.filter((img) => img.id !== uploadingId),
            );
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[uploadingId];
              return newProgress;
            });
          }, 1000);
        } catch (error) {
          console.error("Error compressing image:", error);
          setUploadingImages((prev) =>
            prev.map((img) =>
              img.id === uploadingId
                ? { ...img, status: "error", error: error.message }
                : img,
            ),
          );
        }
      } else {
        // Invalid file type
        setUploadingImages((prev) =>
          prev.map((img) =>
            img.id === uploadingId
              ? { ...img, status: "error", error: "Invalid file type" }
              : img,
          ),
        );
      }
    }

    setImages((prev) => [...prev, ...newImages]);

    // Clear input to allow re-uploading same files
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const clearAllImages = () => {
    images.forEach((image) => {
      if (image.preview) URL.revokeObjectURL(image.preview);
    });
    setImages([]);
  };

  const rotateImage = (id) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img,
      ),
    );
  };

  const flipImage = (id, axis) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [axis]: !img[axis] } : img)),
    );
  };

  const zoomImage = (id, direction) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              zoom: Math.max(
                0.3,
                Math.min(3, img.zoom + (direction === "in" ? 0.1 : -0.1)),
              ),
            }
          : img,
      ),
    );
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null) return;

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    setImages(newImages);
    setDraggedIndex(null);
  };

  const loadImageAsCanvas = async (imageFile, rotation, flipH, flipV, zoom) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");

        let width = img.width * zoom;
        let height = img.height * zoom;

        const isRotated = rotation === 90 || rotation === 270;
        const canvasWidth = isRotated ? height : width;
        const canvasHeight = isRotated ? width : height;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext("2d");

        ctx.save();
        ctx.translate(canvasWidth / 2, canvasHeight / 2);

        if (rotation) {
          ctx.rotate((rotation * Math.PI) / 180);
        }

        if (flipH) ctx.scale(-1, 1);
        if (flipV) ctx.scale(1, -1);

        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();

        resolve({ canvas, width: canvasWidth, height: canvasHeight });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const convertToPDF = async () => {
    if (images.length === 0) return;

    setIsConverting(true);

    try {
      const pdfDoc = await PDFDocument.create();
      let conversionProgress = 0;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const {
          canvas,
          width: imgWidth,
          height: imgHeight,
        } = await loadImageAsCanvas(
          image.file,
          image.rotation,
          image.flipH,
          image.flipV,
          image.zoom,
        );

        const imageDataURL = canvas.toDataURL(
          image.type.includes("png") ? "image/png" : "image/jpeg",
          quality,
        );

        let embeddedImage;
        if (image.type.includes("png")) {
          embeddedImage = await pdfDoc.embedPng(imageDataURL);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageDataURL);
        }

        let pageWidth, pageHeight;

        if (pageSize === "image") {
          pageWidth = imgWidth * 0.75;
          pageHeight = imgHeight * 0.75;
        } else {
          [pageWidth, pageHeight] = pageSizes[pageSize];
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        let drawWidth = embeddedImage.width;
        let drawHeight = embeddedImage.height;
        let x = 0;
        let y = 0;

        if (pageSize === "image") {
          const marginPoints = margin * 0.75;
          const availableWidth = pageWidth - marginPoints * 2;
          const availableHeight = pageHeight - marginPoints * 2;

          const widthRatio = availableWidth / embeddedImage.width;
          const heightRatio = availableHeight / embeddedImage.height;

          if (fitMode === "contain") {
            const ratio = Math.min(widthRatio, heightRatio);
            drawWidth = embeddedImage.width * ratio;
            drawHeight = embeddedImage.height * ratio;
            x = (pageWidth - drawWidth) / 2;
            y = (pageHeight - drawHeight) / 2;
          } else {
            const ratio = Math.max(widthRatio, heightRatio);
            drawWidth = embeddedImage.width * ratio;
            drawHeight = embeddedImage.height * ratio;
            x = (pageWidth - drawWidth) / 2;
            y = (pageHeight - drawHeight) / 2;
          }
        } else {
          const marginPoints = margin * 0.75;
          const availableWidth = pageWidth - marginPoints * 2;
          const availableHeight = pageHeight - marginPoints * 2;

          const widthRatio = availableWidth / embeddedImage.width;
          const heightRatio = availableHeight / embeddedImage.height;

          if (fitMode === "contain") {
            const ratio = Math.min(widthRatio, heightRatio);
            drawWidth = embeddedImage.width * ratio;
            drawHeight = embeddedImage.height * ratio;
            x = marginPoints + (availableWidth - drawWidth) / 2;
            y = marginPoints + (availableHeight - drawHeight) / 2;
          } else {
            const ratio = Math.max(widthRatio, heightRatio);
            drawWidth = embeddedImage.width * ratio;
            drawHeight = embeddedImage.height * ratio;
            x = marginPoints + (availableWidth - drawWidth) / 2;
            y = marginPoints + (availableHeight - drawHeight) / 2;
          }
        }

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        conversionProgress = ((i + 1) / images.length) * 100;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `converted-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error converting to PDF:", error);
      alert("Error converting images to PDF. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const addMoreImages = () => {
    fileInputRef.current?.click();
  };

  // Upload Status Component
  const UploadStatus = () => {
    if (uploadingImages.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-4 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
      >
        <div className="bg-indigo-600 text-white px-4 py-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading Images (
            {uploadingImages.filter((u) => u.status === "completed").length}/
            {uploadingImages.length})
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {uploadingImages.map((upload) => (
            <div key={upload.id} className="p-3 border-b border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(upload.size)}
                  </p>
                </div>
                {upload.status === "uploading" && (
                  <Clock className="w-4 h-4 text-indigo-500 animate-pulse" />
                )}
                {upload.status === "completed" && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {upload.status === "error" && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>

              {upload.status === "uploading" && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress[upload.id] || 0}%` }}
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(uploadProgress[upload.id] || 0)}% - Compressing
                    & processing...
                  </p>
                </div>
              )}

              {upload.status === "error" && (
                <p className="text-xs text-red-500 mt-1">{upload.error}</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <UploadStatus />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Image to PDF Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert your images to PDF files - supports multiple images, custom
            sizes, and image adjustments
          </p>
        </motion.div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-5 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">
                Settings
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="image">
                      📐 Match Image Size (Each page = image dimensions)
                    </option>
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="A5">A5 (148 × 210 mm)</option>
                    <option value="A3">A3 (297 × 420 mm)</option>
                    <option value="Letter">Letter (216 × 279 mm)</option>
                    <option value="Legal">Legal (216 × 356 mm)</option>
                  </select>
                  {pageSize === "image" && (
                    <p className="mt-1 text-xs text-green-600">
                      ✓ Each PDF page will match its image&apos;s exact
                      dimensions
                    </p>
                  )}
                </div>

                {pageSize !== "image" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fit Mode
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFitMode("contain")}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-all text-sm ${
                          fitMode === "contain"
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 text-gray-700 hover:border-indigo-300"
                        }`}
                      >
                        Contain (Fit whole image)
                      </button>
                      <button
                        onClick={() => setFitMode("cover")}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-all text-sm ${
                          fitMode === "cover"
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 text-gray-700 hover:border-indigo-300"
                        }`}
                      >
                        Cover (Fill page)
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margin (px): {margin}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {margin === 0
                      ? "No margins, image fills the page"
                      : `${margin}px margin around image`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Quality: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.01"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher quality = larger file size
                  </p>
                </div>
              </div>

              {/* Upload Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={addMoreImages}
                  disabled={uploadingImages.length > 0}
                  className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    uploadingImages.length > 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:from-indigo-700 hover:to-indigo-800"
                  }`}
                >
                  {uploadingImages.length > 0 ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading {uploadingImages.length} images...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add Images
                    </>
                  )}
                </button>

                {images.length > 0 && (
                  <>
                    <button
                      onClick={clearAllImages}
                      disabled={isConverting}
                      className="w-full bg-red-50 text-red-600 py-2.5 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All ({images.length})
                    </button>

                    <button
                      onClick={convertToPDF}
                      disabled={isConverting || uploadingImages.length > 0}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-5 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Converting {images.length} images...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Convert to PDF ({images.length}{" "}
                          {images.length === 1 ? "image" : "images"})
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Stats */}
              {images.length > 0 && (
                <div className="mt-5 p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>📸 Total Images:</strong> {images.length}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>💾 Total Size:</strong>{" "}
                    {formatFileSize(
                      images.reduce((acc, img) => acc + img.size, 0),
                    )}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>📦 Saved Space:</strong>{" "}
                    {formatFileSize(
                      images.reduce(
                        (acc, img) => acc + (img.originalSize - img.size),
                        0,
                      ),
                    )}
                  </p>
                  {pageSize === "image" && (
                    <p className="text-xs text-gray-500 mt-2">
                      ℹ️ Each page will be created with its image&apos;s
                      original dimensions
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Images Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {images.length === 0 && uploadingImages.length === 0 ? (
              <div
                onClick={addMoreImages}
                className="bg-white rounded-2xl shadow-xl p-12 text-center cursor-pointer hover:shadow-2xl transition-all border-2 border-dashed border-gray-300 hover:border-indigo-400"
              >
                <FileImage className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Images Added
                </h3>
                <p className="text-gray-500 mb-4">
                  Click the button above to upload images
                </p>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Images
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    💡 Drag and drop images to reorder
                  </p>
                  <button
                    onClick={addMoreImages}
                    disabled={uploadingImages.length > 0}
                    className={`text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      uploadingImages.length > 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-indigo-100"
                    }`}
                  >
                    <FilePlus className="w-4 h-4" />
                    Add More
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <AnimatePresence>
                    {images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-move"
                      >
                        <div className="relative group">
                          <div
                            className="relative overflow-hidden bg-gray-100"
                            style={{ height: "220px" }}
                          >
                            <img
                              src={image.preview}
                              alt={image.name}
                              style={{
                                transform: `rotate(${image.rotation}deg) scale(${image.zoom}) scaleX(${image.flipH ? -1 : 1}) scaleY(${image.flipV ? -1 : 1})`,
                                transition: "transform 0.2s ease",
                              }}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Image Number Badge */}
                          <div className="absolute top-2 left-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                            {index + 1}
                          </div>

                          {/* Image Controls Overlay */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => rotateImage(image.id)}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                              title="Rotate"
                            >
                              <RotateCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => flipImage(image.id, "flipH")}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                              title="Flip Horizontal"
                            >
                              <FlipHorizontal className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => flipImage(image.id, "flipV")}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                              title="Flip Vertical"
                            >
                              <FlipVertical className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeImage(image.id)}
                              className="p-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Zoom Controls */}
                          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => zoomImage(image.id, "out")}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                              title="Zoom Out"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="px-2 py-1 bg-white/90 rounded-lg text-xs font-medium shadow-md">
                              {Math.round(image.zoom * 100)}%
                            </span>
                            <button
                              onClick={() => zoomImage(image.id, "in")}
                              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                              title="Zoom In"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {image.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              {formatFileSize(image.size)}
                            </p>
                            {image.width && image.height && (
                              <p className="text-xs text-gray-400">
                                {image.width} × {image.height}
                              </p>
                            )}
                          </div>
                          {image.originalSize && (
                            <p className="text-xs text-green-600 mt-1">
                              Saved{" "}
                              {formatFileSize(image.originalSize - image.size)}
                            </p>
                          )}
                          <div className="mt-1 flex gap-2 text-xs text-gray-400">
                            <span>Rotate: {image.rotation}°</span>
                            <span>•</span>
                            <span>
                              Flip: {image.flipH ? "H" : ""}
                              {image.flipV ? "V" : ""}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Tips */}
            {images.length > 0 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Tips:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • <strong>Image Size Mode:</strong> Each PDF page will
                        match its image&apos;s exact dimensions
                      </li>
                      <li>
                        • <strong>Standard Sizes:</strong> Use A4, Letter, etc.
                        for consistent page sizes
                      </li>
                      <li>
                        • <strong>Drag & Drop:</strong> Reorder images by
                        dragging them
                      </li>
                      <li>
                        • <strong>Adjustments:</strong> Hover over images to
                        rotate, flip, or zoom
                      </li>
                      <li>
                        • <strong>Multiple Images:</strong> Add as many images
                        as you want
                      </li>
                      <li>
                        • <strong>Large Files:</strong> Images are automatically
                        compressed to save space
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDF;
