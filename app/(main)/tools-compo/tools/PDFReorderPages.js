"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as PDFLib from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import ToolPageShell from "../ToolPageShell";

// Set up the worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PDFReorderPages = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedPages, setSelectedPages] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [originalPdfBuffer, setOriginalPdfBuffer] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate real PDF preview using PDF.js
  const generatePreview = async (pdfProxy, pageIndex) => {
    try {
      const page = await pdfProxy.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: 0.4 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      return canvas.toDataURL();
    } catch (err) {
      console.error(`Error creating preview for page ${pageIndex + 1}:`, err);
      return null;
    }
  };

  // Simulate progress for better UX
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    setError(null);
    setLoading(true);
    setFileName(file.name);

    const progressInterval = simulateProgress();

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Store a copy of the original buffer
      const bufferCopy = arrayBuffer.slice(0);
      setOriginalPdfBuffer(bufferCopy);

      // Load for Rendering (PDF.js)
      const pdfProxy = await pdfjsLib.getDocument({ data: arrayBuffer })
        .promise;
      const pageCount = pdfProxy.numPages;

      setTotalPages(pageCount);
      setUploadProgress(100);

      const pagesArray = [];
      for (let i = 0; i < pageCount; i++) {
        const preview = await generatePreview(pdfProxy, i);
        pagesArray.push({
          id: `page-${i}`,
          index: i,
          pageNumber: i + 1,
          originalPageNumber: i + 1,
          thumbnail: preview,
        });
      }

      setPages(pagesArray);
      setPdfFile(arrayBuffer);
    } catch (err) {
      setError("Failed to load PDF. Please try again.");
      console.error(err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Handle drag and drop reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, idx) => ({
      ...item,
      index: idx,
      pageNumber: idx + 1,
    }));

    setPages(updatedItems);
    setSelectedPages([]);
  };

  // Handle page selection
  const togglePageSelection = (pageId) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId],
    );
  };

  // Select all pages
  const selectAllPages = () => {
    setSelectedPages(
      selectedPages.length === pages.length ? [] : pages.map((p) => p.id),
    );
  };

  // Delete selected pages
  const deleteSelectedPages = () => {
    if (selectedPages.length === 0) return;

    const remainingPages = pages.filter(
      (page) => !selectedPages.includes(page.id),
    );
    const updatedPages = remainingPages.map((page, idx) => ({
      ...page,
      index: idx,
      pageNumber: idx + 1,
    }));

    setPages(updatedPages);
    setSelectedPages([]);
    setShowDeleteConfirm(false);
  };

  // Move selected pages
  const moveSelectedPages = (direction) => {
    if (selectedPages.length === 0) return;

    const selectedIndices = selectedPages
      .map((id) => pages.findIndex((p) => p.id === id))
      .sort((a, b) => a - b);

    const newPages = [...pages];

    if (direction === "up" && selectedIndices[0] > 0) {
      const targetIndex = selectedIndices[0] - 1;
      for (let i = 0; i < selectedIndices.length; i++) {
        const temp = newPages[targetIndex + i];
        newPages[targetIndex + i] = newPages[selectedIndices[i]];
        newPages[selectedIndices[i]] = temp;
      }
    } else if (
      direction === "down" &&
      selectedIndices[selectedIndices.length - 1] < pages.length - 1
    ) {
      const targetIndex = selectedIndices[selectedIndices.length - 1] + 1;
      for (let i = selectedIndices.length - 1; i >= 0; i--) {
        const temp = newPages[targetIndex - (selectedIndices.length - 1 - i)];
        newPages[targetIndex - (selectedIndices.length - 1 - i)] =
          newPages[selectedIndices[i]];
        newPages[selectedIndices[i]] = temp;
      }
    }

    const updatedPages = newPages.map((page, idx) => ({
      ...page,
      index: idx,
      pageNumber: idx + 1,
    }));

    setPages(updatedPages);
    setSelectedPages([]);
  };

  // Handle save/reorder PDF
  const handleReorderAndSave = async () => {
    if (!originalPdfBuffer || pages.length === 0) {
      setError("No PDF file loaded or no pages to save.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a fresh copy of the original buffer
      const freshBuffer = new Uint8Array(originalPdfBuffer);
      const pdfDoc = await PDFLib.PDFDocument.load(freshBuffer);
      const newPdfDoc = await PDFLib.PDFDocument.create();

      // Get the indices of pages to include (in the new order)
      const pageIndices = pages.map((page) => page.index);

      // Validate indices are within range
      const totalOriginalPages = pdfDoc.getPageCount();
      const validIndices = pageIndices.every(
        (idx) => idx >= 0 && idx < totalOriginalPages,
      );

      if (!validIndices) {
        throw new Error(
          "Invalid page indices detected. Please reload the PDF.",
        );
      }

      // Copy pages in new order
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach((page) => newPdfDoc.addPage(page));

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `reordered_${fileName || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to reorder PDF. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset everything
  const handleReset = () => {
    setPdfFile(null);
    setPages([]);
    setError(null);
    setFileName("");
    setLoading(false);
    setSelectedPages([]);
    setShowDeleteConfirm(false);
    setTotalPages(0);
    setOriginalPdfBuffer(null);
  };

  if (!mounted) {
    return (
      <ToolPageShell widthClassName="max-w-7xl">
        <div className="flex items-center justify-center rounded-[2rem] border border-slate-200 bg-white/85 py-20 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading PDF tools...</p>
        </div>
        </div>
      </ToolPageShell>
    );
  }

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            PDF Page Reorder
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Drag and drop pages to reorganize your PDF document with live
            previews
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all duration-300">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-blue-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="bg-linear-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg">
                  Choose PDF File
                </div>
              </label>
              <p className="text-gray-500 mt-4 text-sm">
                Supported format: PDF (Max 100MB)
              </p>
            </div>
          </div>
        )}

        {/* Loading Modal */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {uploadProgress < 100
                    ? "Processing PDF..."
                    : "Generating Previews..."}
                </h3>
                <p className="text-gray-600 mb-4">
                  {uploadProgress < 100
                    ? "Loading your document"
                    : "Creating page thumbnails, please wait"}
                </p>
                {uploadProgress > 0 && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-linear-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {uploadProgress}%
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8">
            <p>{error}</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Delete Pages
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong className="text-red-600">{selectedPages.length}</strong>{" "}
                selected {selectedPages.length === 1 ? "page" : "pages"}? This
                action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteSelectedPages}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium"
                >
                  Delete Pages
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Pages Reorder Interface */}
        {pdfFile && pages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Toolbar */}
            <div className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="bg-linear-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-sm">
                    {pages.length} {pages.length === 1 ? "Page" : "Pages"}
                  </div>
                  {totalPages > pages.length && (
                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold">
                      {totalPages - pages.length} deleted
                    </div>
                  )}
                  <div className="text-gray-600 text-sm truncate max-w-xs flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
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
                    {fileName}
                  </div>
                  {selectedPages.length > 0 && (
                    <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold animate-pulse">
                      {selectedPages.length} selected
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {/* View Mode Toggle */}
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                    title="Grid View"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                    title="List View"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>

                  {/* Select All */}
                  <button
                    onClick={selectAllPages}
                    className="px-3 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                  >
                    {selectedPages.length === pages.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>

                  {/* Batch Operations */}
                  {selectedPages.length > 0 && (
                    <>
                      <button
                        onClick={() => moveSelectedPages("up")}
                        className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all duration-200"
                        title="Move Up"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveSelectedPages("down")}
                        className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all duration-200"
                        title="Move Down"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200"
                        title="Delete Selected"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                  >
                    Upload New
                  </button>
                  <button
                    onClick={handleReorderAndSave}
                    disabled={loading}
                    className="px-6 py-2 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Download PDF"}
                  </button>
                </div>
              </div>
            </div>

            {/* Drag and Drop Area */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="pages"
                direction={viewMode === "grid" ? "horizontal" : "vertical"}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-6 transition-all duration-200 max-h-[70vh] overflow-y-auto ${
                      snapshot.isDraggingOver ? "bg-blue-50" : ""
                    }`}
                  >
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                          : "space-y-3"
                      }
                    >
                      {pages.map((page, index) => (
                        <Draggable
                          key={page.id}
                          draggableId={page.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative group transition-all duration-200 ${
                                snapshot.isDragging
                                  ? "opacity-50 scale-95 rotate-1"
                                  : ""
                              } ${
                                selectedPages.includes(page.id)
                                  ? "ring-2 ring-blue-500 ring-offset-2 rounded-lg"
                                  : ""
                              }`}
                            >
                              {/* Selection Checkbox */}
                              <div className="absolute top-2 left-2 z-10">
                                <input
                                  type="checkbox"
                                  checked={selectedPages.includes(page.id)}
                                  onChange={() => togglePageSelection(page.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                              </div>

                              {/* Current Page Number Badge */}
                              <div className="absolute top-2 right-2 z-10 bg-linear-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                {page.pageNumber}
                              </div>

                              {/* Drag Handle Indicator */}
                              <div className="absolute bottom-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/50 backdrop-blur-sm p-1 rounded-full">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 8h16M4 16h16"
                                    />
                                  </svg>
                                </div>
                              </div>

                              {/* Page Content */}
                              {viewMode === "grid" ? (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-move">
                                  <div className="relative bg-gray-50">
                                    <img
                                      src={page.thumbnail}
                                      alt={`Page ${page.pageNumber}`}
                                      className="w-full h-auto object-contain"
                                      loading="lazy"
                                    />
                                    {page.originalPageNumber !==
                                      page.pageNumber && (
                                      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent pointer-events-none"></div>
                                    )}
                                  </div>
                                  <div className="p-3 text-center bg-white border-t border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800">
                                      Page {page.pageNumber}
                                    </p>
                                    {page.originalPageNumber !==
                                      page.pageNumber && (
                                      <p className="text-xs text-amber-600 mt-1 font-medium">
                                        Originally page{" "}
                                        {page.originalPageNumber}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-4 cursor-move p-3">
                                  <div className="shrink-0 relative">
                                    <img
                                      src={page.thumbnail}
                                      alt={`Page ${page.pageNumber}`}
                                      className="w-16 h-auto rounded border border-gray-200"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-gray-800">
                                        Page {page.pageNumber}
                                      </p>
                                      {page.originalPageNumber !==
                                        page.pageNumber && (
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                          Originally #{page.originalPageNumber}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg
                                      className="w-6 h-6"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 8h16M4 16h16"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* Instructions */}
        {pdfFile && (
          <div className="mt-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-2 text-blue-800">
              <svg
                className="w-5 h-5 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm">
                <p className="font-semibold mb-1">Quick Tips:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>
                    • <strong>Drag & Drop</strong> - Click and drag any page
                    card to reorder
                  </li>
                  <li>
                    • <strong>Track Changes</strong> - Pages show &quot;Was
                    #X&quot; badge when moved
                  </li>
                  <li>
                    • <strong>Batch Select</strong> - Use checkboxes to select
                    multiple pages
                  </li>
                  <li>
                    • <strong>Bulk Actions</strong> - Move or delete multiple
                    pages at once
                  </li>
                  <li>
                    • <strong>View Modes</strong> - Switch between Grid and List
                    view
                  </li>
                  <li>
                    • <strong>Save PDF</strong> - Download your reorganized PDF
                    anytime
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default PDFReorderPages;
