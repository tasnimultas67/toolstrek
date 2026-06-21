"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import ToolPageShell from "../ToolPageShell";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const BASE_SCALE = 1.5;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const MIN_CROP_SIZE = 20;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const CropPDF = () => {
  const [fileName, setFileName] = useState("");
  const [pdfDocument, setPdfDocument] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [cropArea, setCropArea] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [dragHandle, setDragHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCropArea, setInitialCropArea] = useState(null);

  const [pageImages, setPageImages] = useState({});
  const [croppedImages, setCroppedImages] = useState({});
  const [croppedAreas, setCroppedAreas] = useState({});
  const [applyToAll, setApplyToAll] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  const pageImagesRef = useRef({});
  const croppedImagesRef = useRef({});
  const croppedAreasRef = useRef({});
  const renderTokenRef = useRef(0);

  useEffect(() => {
    pageImagesRef.current = pageImages;
  }, [pageImages]);

  useEffect(() => {
    croppedImagesRef.current = croppedImages;
  }, [croppedImages]);

  useEffect(() => {
    croppedAreasRef.current = croppedAreas;
  }, [croppedAreas]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      renderTokenRef.current += 1;
    };
  }, []);

  const showToast = useCallback((message, type = "info") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
    }, 3000);
  }, []);

  const clearDocumentState = useCallback(() => {
    setFileName("");
    setPdfDocument(null);
    setNumPages(0);
    setCurrentPage(1);
    setZoom(1);
    setCropArea(null);
    setOriginalDimensions({ width: 0, height: 0 });
    setIsDragging(false);
    setIsMoving(false);
    setDragHandle(null);
    setDragStart({ x: 0, y: 0 });
    setInitialCropArea(null);
    setPageImages({});
    setCroppedImages({});
    setCroppedAreas({});
    setApplyToAll(false);

    pageImagesRef.current = {};
    croppedImagesRef.current = {};
    croppedAreasRef.current = {};

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = 1;
      canvas.height = 1;
      ctx?.clearRect(0, 0, 1, 1);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const loadImage = useCallback((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = src;
    });
  }, []);

  const getCropMetaFromArea = useCallback((area, dimensions) => {
    if (!area || !dimensions?.width || !dimensions?.height) return null;

    return {
      xRatio: area.x / dimensions.width,
      yRatio: area.y / dimensions.height,
      widthRatio: area.width / dimensions.width,
      heightRatio: area.height / dimensions.height,
    };
  }, []);

  const getCropAreaFromMeta = useCallback((meta, dimensions) => {
    if (!meta || !dimensions?.width || !dimensions?.height) return null;

    const width = Math.max(
      1,
      Math.min(
        Math.round(meta.widthRatio * dimensions.width),
        dimensions.width,
      ),
    );
    const height = Math.max(
      1,
      Math.min(
        Math.round(meta.heightRatio * dimensions.height),
        dimensions.height,
      ),
    );

    const x = clamp(
      Math.round(meta.xRatio * dimensions.width),
      0,
      Math.max(0, dimensions.width - width),
    );
    const y = clamp(
      Math.round(meta.yRatio * dimensions.height),
      0,
      Math.max(0, dimensions.height - height),
    );

    return {
      x,
      y,
      width,
      height,
    };
  }, []);

  const renderPageToData = useCallback(async (pdf, pageNum, zoomLevel) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: BASE_SCALE * zoomLevel });

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = Math.round(viewport.width);
    tempCanvas.height = Math.round(viewport.height);

    const ctx = tempCanvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    return {
      src: tempCanvas.toDataURL("image/png"),
      width: tempCanvas.width,
      height: tempCanvas.height,
    };
  }, []);

  const drawPageDataToCanvas = useCallback(
    async (pageData, cropMeta = null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = pageData.width;
      canvas.height = pageData.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      const img = await loadImage(pageData.src);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, pageData.width, pageData.height);

      setOriginalDimensions({
        width: pageData.width,
        height: pageData.height,
      });

      const nextCropArea = cropMeta
        ? getCropAreaFromMeta(cropMeta, pageData)
        : {
            x: 0,
            y: 0,
            width: pageData.width,
            height: pageData.height,
          };

      setCropArea(nextCropArea);
    },
    [getCropAreaFromMeta, loadImage],
  );

  const renderDocumentAtZoom = useCallback(
    async (pdf, zoomLevel, focusPage = 1) => {
      const token = ++renderTokenRef.current;
      setIsLoading(true);

      try {
        const pageOrder = [
          focusPage,
          ...Array.from({ length: pdf.numPages }, (_, i) => i + 1).filter(
            (page) => page !== focusPage,
          ),
        ];

        const cache = {};
        for (const pageNum of pageOrder) {
          if (renderTokenRef.current !== token) return;

          const pageData = await renderPageToData(pdf, pageNum, zoomLevel);
          if (renderTokenRef.current !== token) return;

          cache[pageNum] = pageData;
        }

        if (renderTokenRef.current !== token) return;

        setPageImages(cache);
        pageImagesRef.current = cache;

        const focusData =
          croppedImagesRef.current[focusPage] || cache[focusPage];
        const focusMeta = croppedAreasRef.current[focusPage] || null;

        if (focusData) {
          setCurrentPage(focusPage);
          await drawPageDataToCanvas(focusData, focusMeta);
        }
      } catch (error) {
        console.error(error);
        showToast("Error rendering PDF pages.", "error");
      } finally {
        if (renderTokenRef.current === token) {
          setIsLoading(false);
        }
      }
    },
    [drawPageDataToCanvas, renderPageToData, showToast],
  );

  const handleFileUpload = useCallback(
    async (file) => {
      if (
        !file ||
        (!file.type?.includes("pdf") &&
          !file.name.toLowerCase().endsWith(".pdf"))
      ) {
        showToast("Please upload a valid PDF file.", "error");
        return;
      }

      try {
        clearDocumentState();
        setFileName(file.name);
        setIsLoading(true);

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer.slice(0),
        });
        const pdf = await loadingTask.promise;

        setPdfDocument(pdf);
        setNumPages(pdf.numPages);

        await renderDocumentAtZoom(pdf, 1, 1);
        showToast("PDF loaded successfully!", "success");
      } catch (error) {
        console.error("Error loading PDF:", error);
        clearDocumentState();
        showToast("Error loading PDF. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [clearDocumentState, renderDocumentAtZoom, showToast],
  );

  const showPage = useCallback(
    async (pageNum) => {
      if (!pdfDocument || pageNum < 1 || pageNum > numPages) return;

      setCurrentPage(pageNum);

      const cropped = croppedImagesRef.current[pageNum];
      const original = pageImagesRef.current[pageNum];
      const pageData = cropped || original;
      const pageMeta = croppedAreasRef.current[pageNum] || null;

      if (pageData) {
        await drawPageDataToCanvas(pageData, pageMeta);
        return;
      }

      setIsLoading(true);
      try {
        const rendered = await renderPageToData(pdfDocument, pageNum, zoom);
        const nextPageImages = {
          ...pageImagesRef.current,
          [pageNum]: rendered,
        };
        setPageImages(nextPageImages);
        pageImagesRef.current = nextPageImages;

        const current = croppedImagesRef.current[pageNum] || rendered;
        const currentMeta = croppedAreasRef.current[pageNum] || null;
        await drawPageDataToCanvas(current, currentMeta);
      } catch (error) {
        console.error(error);
        showToast("Could not open that page.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      drawPageDataToCanvas,
      numPages,
      pdfDocument,
      renderPageToData,
      showToast,
      zoom,
    ],
  );

  const handleZoomChange = useCallback(
    async (nextZoom) => {
      const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      if (clampedZoom === zoom) return;

      setZoom(clampedZoom);

      if (pdfDocument) {
        await renderDocumentAtZoom(pdfDocument, clampedZoom, currentPage);
      }
    },
    [currentPage, pdfDocument, renderDocumentAtZoom, zoom],
  );

  const handlePageChange = useCallback(
    (direction) => {
      if (!pdfDocument) return;

      const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;
      if (nextPage >= 1 && nextPage <= numPages) {
        showPage(nextPage);
      }
    },
    [currentPage, numPages, pdfDocument, showPage],
  );

  const getMouseCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const point = e.touches ? e.touches[0] : e;
    const clientX = point.clientX;
    const clientY = point.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return {
      x: clamp(x, 0, canvas.width),
      y: clamp(y, 0, canvas.height),
    };
  };

  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cropArea) return;

    const coords = getMouseCoordinates(e);

    if (handle === "move") {
      setIsMoving(true);
      setDragStart({ x: coords.x - cropArea.x, y: coords.y - cropArea.y });
      return;
    }

    setIsDragging(true);
    setDragHandle(handle);
    setInitialCropArea({ ...cropArea });
    setDragStart({ x: coords.x, y: coords.y });
  };

  const buildResizedCrop = useCallback(
    (handle, deltaX, deltaY) => {
      const start = initialCropArea || cropArea;
      if (!start) return cropArea;

      const rightEdge = start.x + start.width;
      const bottomEdge = start.y + start.height;

      let x = start.x;
      let y = start.y;
      let right = rightEdge;
      let bottom = bottomEdge;

      switch (handle) {
        case "top-left":
          x = clamp(start.x + deltaX, 0, rightEdge - MIN_CROP_SIZE);
          y = clamp(start.y + deltaY, 0, bottomEdge - MIN_CROP_SIZE);
          break;
        case "top":
          y = clamp(start.y + deltaY, 0, bottomEdge - MIN_CROP_SIZE);
          break;
        case "top-right":
          y = clamp(start.y + deltaY, 0, bottomEdge - MIN_CROP_SIZE);
          right = clamp(
            start.x + start.width + deltaX,
            start.x + MIN_CROP_SIZE,
            originalDimensions.width,
          );
          break;
        case "left":
          x = clamp(start.x + deltaX, 0, rightEdge - MIN_CROP_SIZE);
          break;
        case "right":
          right = clamp(
            start.x + start.width + deltaX,
            start.x + MIN_CROP_SIZE,
            originalDimensions.width,
          );
          break;
        case "bottom-left":
          x = clamp(start.x + deltaX, 0, rightEdge - MIN_CROP_SIZE);
          bottom = clamp(
            start.y + start.height + deltaY,
            start.y + MIN_CROP_SIZE,
            originalDimensions.height,
          );
          break;
        case "bottom":
          bottom = clamp(
            start.y + start.height + deltaY,
            start.y + MIN_CROP_SIZE,
            originalDimensions.height,
          );
          break;
        case "bottom-right":
          right = clamp(
            start.x + start.width + deltaX,
            start.x + MIN_CROP_SIZE,
            originalDimensions.width,
          );
          bottom = clamp(
            start.y + start.height + deltaY,
            start.y + MIN_CROP_SIZE,
            originalDimensions.height,
          );
          break;
        default:
          break;
      }

      x = clamp(x, 0, originalDimensions.width - MIN_CROP_SIZE);
      y = clamp(y, 0, originalDimensions.height - MIN_CROP_SIZE);
      right = clamp(right, x + MIN_CROP_SIZE, originalDimensions.width);
      bottom = clamp(bottom, y + MIN_CROP_SIZE, originalDimensions.height);

      return {
        x,
        y,
        width: right - x,
        height: bottom - y,
      };
    },
    [
      cropArea,
      initialCropArea,
      originalDimensions.height,
      originalDimensions.width,
    ],
  );

  const handleMouseMove = (e) => {
    if ((!isDragging && !isMoving) || !cropArea || !canvasRef.current) return;

    const coords = getMouseCoordinates(e);

    if (isMoving) {
      const canvas = canvasRef.current;
      const nextX = clamp(
        coords.x - dragStart.x,
        0,
        canvas.width - cropArea.width,
      );
      const nextY = clamp(
        coords.y - dragStart.y,
        0,
        canvas.height - cropArea.height,
      );

      setCropArea({
        ...cropArea,
        x: nextX,
        y: nextY,
      });
      return;
    }

    if (isDragging && dragHandle) {
      const deltaX = coords.x - dragStart.x;
      const deltaY = coords.y - dragStart.y;
      setCropArea(buildResizedCrop(dragHandle, deltaX, deltaY));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsMoving(false);
    setDragHandle(null);
    setInitialCropArea(null);
  };

  const cropCurrentCanvas = (canvas, area) => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = Math.max(1, Math.round(area.width));
    tempCanvas.height = Math.max(1, Math.round(area.height));

    const ctx = tempCanvas.getContext("2d");
    if (!ctx) throw new Error("Could not create crop canvas");

    ctx.drawImage(
      canvas,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height,
    );

    return {
      src: tempCanvas.toDataURL("image/png"),
      width: tempCanvas.width,
      height: tempCanvas.height,
    };
  };

  const ensureOriginalPageData = useCallback(
    async (pageNum) => {
      const cached = pageImagesRef.current[pageNum];
      if (cached) return cached;

      if (!pdfDocument) throw new Error("No PDF loaded");

      const rendered = await renderPageToData(pdfDocument, pageNum, zoom);
      const next = {
        ...pageImagesRef.current,
        [pageNum]: rendered,
      };
      setPageImages(next);
      pageImagesRef.current = next;

      return rendered;
    },
    [pdfDocument, renderPageToData, zoom],
  );

  const applyCrop = useCallback(async () => {
    const canvas = canvasRef.current;

    if (!canvas || !cropArea || !pdfDocument) {
      showToast("Please select a crop area first.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const currentCropped = cropCurrentCanvas(canvas, cropArea);
      const cropMeta = getCropMetaFromArea(cropArea, originalDimensions);

      if (applyToAll) {
        const nextCropped = {};
        const nextCroppedAreas = { ...croppedAreasRef.current };

        const currentSourceWidth = canvas.width;
        const currentSourceHeight = canvas.height;
        const outputWidth = currentCropped.width;
        const outputHeight = currentCropped.height;

        for (let i = 1; i <= numPages; i++) {
          const pageData = await ensureOriginalPageData(i);
          const img = await loadImage(pageData.src);

          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = outputWidth;
          tempCanvas.height = outputHeight;

          const ctx = tempCanvas.getContext("2d");
          if (!ctx) throw new Error("Could not create crop canvas");

          const scaleX = pageData.width / currentSourceWidth;
          const scaleY = pageData.height / currentSourceHeight;

          ctx.drawImage(
            img,
            cropArea.x * scaleX,
            cropArea.y * scaleY,
            cropArea.width * scaleX,
            cropArea.height * scaleY,
            0,
            0,
            outputWidth,
            outputHeight,
          );

          nextCropped[i] = {
            src: tempCanvas.toDataURL("image/png"),
            width: outputWidth,
            height: outputHeight,
          };

          nextCroppedAreas[i] = cropMeta;
        }

        setCroppedImages(nextCropped);
        croppedImagesRef.current = nextCropped;

        setCroppedAreas(nextCroppedAreas);
        croppedAreasRef.current = nextCroppedAreas;

        await drawPageDataToCanvas(nextCropped[currentPage], cropMeta);
        showToast(`Crop applied to all ${numPages} pages!`, "success");
        return;
      }

      const nextCropped = {
        ...croppedImagesRef.current,
        [currentPage]: currentCropped,
      };

      const nextCroppedAreas = {
        ...croppedAreasRef.current,
        [currentPage]: cropMeta,
      };

      setCroppedImages(nextCropped);
      croppedImagesRef.current = nextCropped;

      setCroppedAreas(nextCroppedAreas);
      croppedAreasRef.current = nextCroppedAreas;

      await drawPageDataToCanvas(currentCropped, cropMeta);
      showToast("Crop applied to current page!", "success");
    } catch (error) {
      console.error(error);
      showToast("Could not apply crop.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [
    applyToAll,
    cropArea,
    currentPage,
    drawPageDataToCanvas,
    ensureOriginalPageData,
    getCropMetaFromArea,
    loadImage,
    numPages,
    originalDimensions,
    pdfDocument,
    showToast,
  ]);

  const resetCrop = useCallback(async () => {
    if (!pdfDocument) {
      showToast("No PDF loaded.", "warning");
      return;
    }

    const nextCropped = { ...croppedImagesRef.current };
    const nextCroppedAreas = { ...croppedAreasRef.current };

    delete nextCropped[currentPage];
    delete nextCroppedAreas[currentPage];

    setCroppedImages(nextCropped);
    croppedImagesRef.current = nextCropped;

    setCroppedAreas(nextCroppedAreas);
    croppedAreasRef.current = nextCroppedAreas;

    try {
      await showPage(currentPage);
      showToast("Reset to full page.", "info");
    } catch (error) {
      console.error(error);
      showToast("Could not reset crop.", "error");
    }
  }, [currentPage, pdfDocument, showPage, showToast]);

  const downloadCroppedPDF = useCallback(async () => {
    if (!pdfDocument) {
      showToast("No PDF loaded.", "warning");
      return;
    }

    if (Object.keys(croppedImagesRef.current).length === 0) {
      showToast("Please apply a crop first.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const pages = [];

      for (let i = 1; i <= numPages; i++) {
        const pageData =
          croppedImagesRef.current[i] ||
          pageImagesRef.current[i] ||
          (await ensureOriginalPageData(i));
        pages.push(pageData);
      }

      const first = pages[0];
      const output = new jsPDF({
        orientation: first.width >= first.height ? "landscape" : "portrait",
        unit: "px",
        format: [first.width, first.height],
      });

      output.addImage(first.src, "PNG", 0, 0, first.width, first.height);

      for (let i = 1; i < pages.length; i++) {
        const page = pages[i];
        output.addPage(
          [page.width, page.height],
          page.width >= page.height ? "landscape" : "portrait",
        );
        output.addImage(page.src, "PNG", 0, 0, page.width, page.height);
      }

      const safeName = (fileName || "document").replace(/\.pdf$/i, "");
      output.save(`cropped_${safeName}.pdf`);
      showToast("PDF downloaded successfully!", "success");
    } catch (error) {
      console.error("Error creating PDF:", error);
      showToast("Error creating PDF. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [ensureOriginalPageData, fileName, numPages, pdfDocument, showToast]);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file) await handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const cropRect =
    cropArea && originalDimensions.width > 0 && originalDimensions.height > 0
      ? {
          left: (cropArea.x / originalDimensions.width) * 100,
          top: (cropArea.y / originalDimensions.height) * 100,
          width: (cropArea.width / originalDimensions.width) * 100,
          height: (cropArea.height / originalDimensions.height) * 100,
        }
      : null;

  return (
    <ToolPageShell widthClassName="max-w-7xl px-1 pt-20 pb-10">
      <div className="dark:text-slate-100">
        {toast.show && (
          <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
            <div
              className={`min-w-70 max-w-md rounded-lg px-4 py-3 text-white shadow-lg ${
                toast.type === "success"
                  ? "bg-emerald-600 dark:bg-emerald-500"
                  : toast.type === "error"
                    ? "bg-red-600 dark:bg-red-500"
                    : toast.type === "warning"
                      ? "bg-amber-500 dark:bg-amber-400"
                      : "bg-blue-600 dark:bg-blue-500"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        <div className="mx-auto w-full md:w-11/12">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Crop PDF Tool
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Upload a PDF, choose a crop area, and export the trimmed result.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-800">
            <div className="p-6 md:p-8">
              {!pdfDocument ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center transition hover:border-blue-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700/50 dark:hover:border-blue-400 dark:hover:bg-slate-700"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleFileUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <svg
                        className="h-10 w-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      Upload PDF File
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Drag and drop a PDF here, or click to browse
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        File:
                      </span>
                      <span className="max-w-xs truncate text-sm text-slate-600 dark:text-slate-400">
                        {fileName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
                        <button
                          onClick={() => handleZoomChange(zoom - ZOOM_STEP)}
                          disabled={zoom <= MIN_ZOOM || isLoading}
                          className="rounded-md bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          -
                        </button>
                        <span className="min-w-16 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={() => handleZoomChange(zoom + ZOOM_STEP)}
                          disabled={zoom >= MAX_ZOOM || isLoading}
                          className="rounded-md bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleZoomChange(1)}
                          disabled={zoom === 1 || isLoading}
                          className="rounded-md bg-white px-3 py-2 text-xs shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          Reset
                        </button>
                      </div>

                      {numPages > 0 && (
                        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
                          <button
                            onClick={() => handlePageChange("prev")}
                            disabled={currentPage === 1 || isLoading}
                            className="rounded-md bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            Prev
                          </button>
                          <span className="min-w-22.5 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                            Page {currentPage} / {numPages}
                          </span>
                          <button
                            onClick={() => handlePageChange("next")}
                            disabled={currentPage === numPages || isLoading}
                            className="rounded-md bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            Next
                          </button>
                        </div>
                      )}

                      {numPages > 1 && (
                        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={applyToAll}
                            onChange={(e) => setApplyToAll(e.target.checked)}
                            className="dark:bg-slate-700"
                          />
                          Apply to all pages
                        </label>
                      )}

                      <button
                        onClick={resetCrop}
                        disabled={isLoading}
                        className="rounded-md bg-slate-500 px-4 py-2 text-sm text-white shadow-sm transition hover:bg-slate-600 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
                      >
                        Reset Crop
                      </button>

                      <button
                        onClick={() => {
                          clearDocumentState();
                        }}
                        className="rounded-md bg-red-500 px-4 py-2 text-sm text-white shadow-sm transition hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        Remove PDF
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800/40 dark:bg-blue-950/30">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Drag the crop box or its handles to choose what to keep.
                      Then click Apply Crop.
                    </p>
                  </div>

                  <div className="relative flex min-h-125 justify-center overflow-auto rounded-lg bg-slate-100 p-4 dark:bg-slate-700/50">
                    {isLoading && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 dark:bg-slate-800/75">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400" />
                      </div>
                    )}

                    <div
                      className="relative inline-block"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <canvas
                        ref={canvasRef}
                        className="block max-w-full rounded border border-slate-300 shadow-lg dark:border-slate-600"
                      />

                      {cropRect && !isLoading && (
                        <>
                          <div className="absolute inset-0 z-10 pointer-events-none">
                            <div
                              className="absolute bg-black/50"
                              style={{
                                left: 0,
                                top: 0,
                                width: "100%",
                                height: `${cropRect.top}%`,
                              }}
                            />
                            <div
                              className="absolute bg-black/50"
                              style={{
                                left: 0,
                                top: `${cropRect.top}%`,
                                width: `${cropRect.left}%`,
                                height: `${cropRect.height}%`,
                              }}
                            />
                            <div
                              className="absolute bg-black/50"
                              style={{
                                left: `${cropRect.left + cropRect.width}%`,
                                top: `${cropRect.top}%`,
                                width: `${Math.max(
                                  0,
                                  100 - cropRect.left - cropRect.width,
                                )}%`,
                                height: `${cropRect.height}%`,
                              }}
                            />
                            <div
                              className="absolute bg-black/50"
                              style={{
                                left: 0,
                                top: `${cropRect.top + cropRect.height}%`,
                                width: "100%",
                                height: `${Math.max(
                                  0,
                                  100 - cropRect.top - cropRect.height,
                                )}%`,
                              }}
                            />
                          </div>

                          <div
                            className="absolute z-20 cursor-move border-2 border-blue-500 dark:border-blue-400"
                            style={{
                              left: `${cropRect.left}%`,
                              top: `${cropRect.top}%`,
                              width: `${cropRect.width}%`,
                              height: `${cropRect.height}%`,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, "move")}
                          />

                          {[
                            ["top-left", "nw-resize", 0, 0],
                            ["top", "n-resize", 50, 0],
                            ["top-right", "ne-resize", 100, 0],
                            ["left", "w-resize", 0, 50],
                            ["right", "e-resize", 100, 50],
                            ["bottom-left", "sw-resize", 0, 100],
                            ["bottom", "s-resize", 50, 100],
                            ["bottom-right", "se-resize", 100, 100],
                          ].map(([handle, cursor, x, y]) => (
                            <div
                              key={handle}
                              className="absolute z-30 h-3 w-3 rounded-full border-2 border-blue-500 bg-white dark:border-blue-400 dark:bg-slate-800"
                              style={{
                                left: `calc(${cropRect.left + (cropRect.width * x) / 100}% - 6px)`,
                                top: `calc(${cropRect.top + (cropRect.height * y) / 100}% - 6px)`,
                                cursor,
                              }}
                              onMouseDown={(e) => handleMouseDown(e, handle)}
                            />
                          ))}

                          <div
                            className="absolute z-30 pointer-events-none rounded bg-blue-600 px-2 py-1 text-xs text-white shadow dark:bg-blue-500"
                            style={{
                              left: `calc(${cropRect.left + cropRect.width / 2}% )`,
                              top: `calc(${cropRect.top}% - 28px)`,
                              transform: "translateX(-50%)",
                            }}
                          >
                            {Math.round(cropArea.width)} ×{" "}
                            {Math.round(cropArea.height)} px
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {numPages > 1 && (
                    <div className="mt-6 overflow-x-auto">
                      <div className="flex justify-center gap-2 pb-2">
                        {Array.from({ length: numPages }, (_, i) => i + 1).map(
                          (pageNum) => {
                            const preview =
                              croppedImages[pageNum]?.src ||
                              pageImages[pageNum]?.src;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => showPage(pageNum)}
                                className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                  pageNum === currentPage
                                    ? "scale-105 border-blue-500 shadow-lg dark:border-blue-400"
                                    : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
                                }`}
                              >
                                {preview ? (
                                  <img
                                    src={preview}
                                    alt={`Page ${pageNum}`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                                    {pageNum}
                                  </div>
                                )}

                                {croppedImages[pageNum] && (
                                  <div className="absolute right-0 top-0 rounded-bl bg-emerald-500 px-1 text-xs text-white dark:bg-emerald-400">
                                    ✓
                                  </div>
                                )}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-center gap-4">
                    <button
                      onClick={applyCrop}
                      disabled={isLoading || !cropArea}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Apply Crop
                    </button>

                    <button
                      onClick={downloadCroppedPDF}
                      disabled={
                        isLoading || Object.keys(croppedImages).length === 0
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    >
                      Download PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              Why Choose Our Crop PDF Tool?
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg dark:bg-slate-800 dark:shadow-slate-900/30">
                <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Precise Cropping
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Drag and resize the crop box with 8 handles for pixel-perfect
                  accuracy.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg dark:bg-slate-800 dark:shadow-slate-900/30">
                <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Multi-Page Support
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Navigate through pages with thumbnails and apply crops to all
                  pages at once.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg dark:bg-slate-800 dark:shadow-slate-900/30">
                <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Privacy First
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  All processing happens locally in your browser. Your files
                  never leave your device.
                </p>
              </div>
            </div>
          </div>

          {/* How to Use Guide */}
          <div className="mt-12 rounded-2xl bg-white p-8 shadow-md dark:bg-slate-800 dark:shadow-slate-900/30">
            <h2 className="mb-6 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              How to Use
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white dark:bg-blue-500">
                  1
                </div>
                <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  Upload PDF
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click or drag & drop your PDF file to get started
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white dark:bg-blue-500">
                  2
                </div>
                <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  Select Area
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Drag the blue box or its corners to choose what to keep
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white dark:bg-blue-500">
                  3
                </div>
                <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  Apply Crop
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click &quot;Apply Crop&quot; to trim your selected area
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white dark:bg-blue-500">
                  4
                </div>
                <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  Download
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Save your cropped PDF with one click
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="mt-12 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 p-8 shadow-md dark:from-blue-950/30 dark:to-indigo-950/30">
            <h2 className="mb-6 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              Common Use Cases
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-5 dark:bg-slate-800">
                <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-400">
                  📄 Remove Margins
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Trim excessive whitespace from scanned documents or PDFs with
                  large borders
                </p>
              </div>
              <div className="rounded-lg bg-white p-5 dark:bg-slate-800">
                <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-400">
                  🎯 Focus Content
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Highlight specific content areas by removing headers, footers,
                  or sidebars
                </p>
              </div>
              <div className="rounded-lg bg-white p-5 dark:bg-slate-800">
                <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-400">
                  📐 Standardize Pages
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Make all pages the same size by cropping to uniform dimensions
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 rounded-2xl bg-white p-8 shadow-md dark:bg-slate-800 dark:shadow-slate-900/30">
            <h2 className="mb-6 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Does cropping permanently remove content?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes, cropping removes content outside the selected area. Keep
                  a backup of your original file if needed.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Can I crop different pages differently?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes! You can crop each page individually. Simply navigate to
                  each page and apply different crop settings.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Will cropping affect text/image quality?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  No, cropping only removes areas outside the crop boundary. The
                  remaining content maintains its original quality.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Is my data secure?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Absolutely! All processing happens locally in your browser.
                  Your PDF files never leave your computer.
                </p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </ToolPageShell>
  );
};

export default CropPDF;
