"use client";

import React, { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export default function PDFSplitPage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [splitMode, setSplitMode] = useState("range");
  const [pageRange, setPageRange] = useState("");
  const [extractPages, setExtractPages] = useState("");
  const [splitStatus, setSplitStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState([]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setFileName(file.name.replace(".pdf", ""));
      setSplitStatus("");
      setDownloadedFiles([]);
    } else {
      setSplitStatus("Please upload a valid PDF file.");
      setPdfFile(null);
    }
  }, []);

  const processPageRange = (rangeStr, totalPages) => {
    const pages = new Set();
    const parts = rangeStr.split(",");

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map(Number);
        const startPage = Math.max(1, start);
        const endPage = Math.min(totalPages, end);
        for (let i = startPage; i <= endPage; i++) {
          pages.add(i);
        }
      } else {
        const pageNum = Number(trimmed);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pages.add(pageNum);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const extractPagesFromPDF = async () => {
    if (!pdfFile) {
      setSplitStatus("Please select a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setSplitStatus("Processing...");
    setDownloadedFiles([]);

    try {
      const sourcePdfBytes = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(sourcePdfBytes);
      const totalPages = sourcePdf.getPageCount();

      let pagesToExtract = [];

      if (splitMode === "range") {
        if (!pageRange.trim()) {
          setSplitStatus("Please enter page range.");
          setIsProcessing(false);
          return;
        }
        pagesToExtract = processPageRange(pageRange, totalPages);
        if (pagesToExtract.length === 0) {
          setSplitStatus("Invalid page range. Please check your input.");
          setIsProcessing(false);
          return;
        }
      } else if (splitMode === "extract") {
        if (!extractPages.trim()) {
          setSplitStatus("Please enter page numbers to extract.");
          setIsProcessing(false);
          return;
        }
        pagesToExtract = processPageRange(extractPages, totalPages);
        if (pagesToExtract.length === 0) {
          setSplitStatus("Invalid page numbers. Please check your input.");
          setIsProcessing(false);
          return;
        }
      } else if (splitMode === "each") {
        pagesToExtract = Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      if (splitMode === "each") {
        // Create separate PDF for each page
        const files = [];
        for (const pageNum of pagesToExtract) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();

          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          files.push({
            url,
            name: `${fileName}_page_${pageNum}.pdf`,
            pageNumber: pageNum,
            blob: blob, // Store blob for ZIP creation
          });
        }
        setDownloadedFiles(files);
        setSplitStatus(
          `Successfully split ${totalPages} pages into ${files.length} separate PDF files.`,
        );
      } else {
        // Create single PDF with selected pages
        const newPdf = await PDFDocument.create();
        const pagesToCopy = pagesToExtract.map((pageNum) => pageNum - 1);
        const copiedPages = await newPdf.copyPages(sourcePdf, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();

        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const rangeText = pagesToExtract.length === 1 ? "page" : "pages";
        setDownloadedFiles([
          {
            url,
            name: `${fileName}_extracted_${pagesToExtract.length}_${rangeText}.pdf`,
            pageCount: pagesToExtract.length,
            blob: blob, // Store blob for ZIP creation
          },
        ]);
        setSplitStatus(
          `Successfully extracted ${pagesToExtract.length} ${rangeText}.`,
        );
      }
    } catch (error) {
      console.error("Error splitting PDF:", error);
      setSplitStatus(
        `Error: ${error.message || "Failed to process PDF. Please try again."}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplit = () => {
    extractPagesFromPDF();
  };

  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (downloadedFiles.length === 0) return;

    // If only one file, download it directly
    if (downloadedFiles.length === 1) {
      handleDownload(downloadedFiles[0]);
      return;
    }

    // Show downloading status
    setSplitStatus("Creating ZIP archive...");

    try {
      const zip = new JSZip();

      // Add each file to the ZIP
      for (const file of downloadedFiles) {
        // Use blob if available, otherwise fetch from URL
        if (file.blob) {
          zip.file(file.name, file.blob);
        } else {
          const response = await fetch(file.url);
          const blob = await response.blob();
          zip.file(file.name, blob);
        }
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link for ZIP
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = `${fileName}_split_files.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(zipUrl);

      setSplitStatus(
        `Successfully created ZIP archive with ${downloadedFiles.length} files!`,
      );

      // Clear status after 3 seconds
      setTimeout(() => {
        if (splitStatus.includes("ZIP archive")) {
          setSplitStatus("");
        }
      }, 3000);
    } catch (error) {
      console.error("Error creating ZIP:", error);
      setSplitStatus(`Error creating ZIP: ${error.message}`);
    }
  };

  const clearAll = () => {
    // Clean up object URLs
    downloadedFiles.forEach((file) => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });
    setPdfFile(null);
    setFileName("");
    setPageRange("");
    setExtractPages("");
    setSplitStatus("");
    setDownloadedFiles([]);
    setSplitMode("range");
    const fileInput = document.getElementById("pdf-upload");
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            PDF Split Tool
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Split your PDF files by page range, extract specific pages, or split
            each page into separate files
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            {/* File Upload Section */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📄 Upload PDF File
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                    pdfFile
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {pdfFile ? (
                      <>
                        <svg
                          className="w-12 h-12 mb-3 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        <p className="text-sm text-green-600 font-medium">
                          File ready!
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          ></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF files only (Max 50MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="pdf-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                </label>
              </div>
              {pdfFile && (
                <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center flex-1 min-w-0">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 truncate">
                      {pdfFile.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-400 flex-shrink-0">
                      ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={clearAll}
                    className="ml-3 text-red-500 hover:text-red-700 text-sm font-medium flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Split Mode Selection */}
            {pdfFile && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ⚙️ Select Split Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSplitMode("range")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      splitMode === "range"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">
                      📖 Page Range
                    </div>
                    <div className="text-sm text-gray-600">
                      Split by range (e.g., 1-5, 8, 10-15)
                    </div>
                  </button>
                  <button
                    onClick={() => setSplitMode("extract")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      splitMode === "extract"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">
                      🎯 Extract Pages
                    </div>
                    <div className="text-sm text-gray-600">
                      Extract specific pages only
                    </div>
                  </button>
                  <button
                    onClick={() => setSplitMode("each")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      splitMode === "each"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">
                      🔪 Split Each Page
                    </div>
                    <div className="text-sm text-gray-600">
                      Create one PDF per page
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Page Range Input */}
            {pdfFile && splitMode === "range" && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Page Range
                </label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g., 1-5, 8, 10-15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Enter page numbers or ranges separated by commas. Example:
                  1-5, 8, 10-15
                </p>
              </div>
            )}

            {/* Extract Pages Input */}
            {pdfFile && splitMode === "extract" && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🎯 Pages to Extract
                </label>
                <input
                  type="text"
                  value={extractPages}
                  onChange={(e) => setExtractPages(e.target.value)}
                  placeholder="e.g., 1, 3, 5-7"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Enter the page numbers you want to extract, separated by
                  commas
                </p>
              </div>
            )}

            {/* Split Button */}
            {pdfFile && (
              <div className="mb-8">
                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-[1.02]"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing Your PDF...
                    </div>
                  ) : (
                    "Split PDF Now"
                  )}
                </button>
              </div>
            )}

            {/* Status Message */}
            {splitStatus && (
              <div
                className={`mb-8 p-4 rounded-xl ${
                  splitStatus.includes("Error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {splitStatus.includes("Error") ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="font-medium">{splitStatus}</span>
                </div>
              </div>
            )}

            {/* Download Section */}
            {downloadedFiles.length > 0 && (
              <div className="border-t pt-6 mt-4">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    📥{" "}
                    {downloadedFiles.length === 1
                      ? "Your PDF is Ready"
                      : `Ready to Download (${downloadedFiles.length} files)`}
                  </h3>
                  {downloadedFiles.length > 1 && (
                    <button
                      onClick={handleDownloadAll}
                      className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download All as ZIP ({downloadedFiles.length})
                    </button>
                  )}
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {downloadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <svg
                          className="w-6 h-6 text-red-500 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          {(file.pageNumber || file.pageCount) && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {file.pageNumber
                                ? `Page ${file.pageNumber}`
                                : `${file.pageCount} pages`}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm hover:shadow"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📘</span> How to Use
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span className="text-gray-700">Upload your PDF file</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span className="text-gray-700">
                    Choose split mode and enter pages
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span className="text-gray-700">
                    Click &quot;Split PDF Now&quot; and download
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600 bg-white/50 p-3 rounded-lg">
                <strong>💡 Pro tip:</strong> Use &quot;Page Range&quot; for
                continuous sections, &quot;Extract Pages&quot; for specific
                pages, or &quot;Split Each Page&quot; to separate every page
                into individual PDFs. When splitting multiple pages, use
                &quot;Download All as ZIP&quot; to get all files in a single
                compressed archive.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
