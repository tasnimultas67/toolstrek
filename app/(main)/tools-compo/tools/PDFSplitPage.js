"use client";

import React, { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import ToolPageShell from "../ToolPageShell";

export default function PDFSplitPage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [splitMode, setSplitMode] = useState("range");
  const [pageRange, setPageRange] = useState("");
  const [extractPages, setExtractPages] = useState("");
  const [splitStatus, setSplitStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState([]);

  // Drag and Drop & Customization States
  const [isDragging, setIsDragging] = useState(false);
  const [rangeOutputMode, setRangeOutputMode] = useState("multiple"); // "multiple" or "single"
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filenamePattern, setFilenamePattern] = useState("{filename}_part_{range}");
  const [zipFilenamePattern, setZipFilenamePattern] = useState("{filename}_split_archive");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfAuthor, setPdfAuthor] = useState("");
  const [pdfSubject, setPdfSubject] = useState("");
  const [pdfKeywords, setPdfKeywords] = useState("");
  const [pdfCreator, setPdfCreator] = useState("ToolsTrek");
  const [autoDownload, setAutoDownload] = useState(false);
  const [useObjectStreams, setUseObjectStreams] = useState(true);

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

  const formatFileName = (pattern, data) => {
    let name = pattern;
    for (const key in data) {
      name = name.replaceAll(`{${key}}`, data[key]);
    }
    // Clean name from illegal characters
    return name.replace(/[\\/:*?"<>|]/g, "_") + ".pdf";
  };

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

  const applyMetadataAndSave = async (pdfDoc) => {
    if (pdfTitle.trim()) pdfDoc.setTitle(pdfTitle.trim());
    if (pdfAuthor.trim()) pdfDoc.setAuthor(pdfAuthor.trim());
    if (pdfSubject.trim()) pdfDoc.setSubject(pdfSubject.trim());
    if (pdfKeywords.trim()) {
      pdfDoc.setKeywords(pdfKeywords.split(",").map((k) => k.trim()).filter(Boolean));
    }
    if (pdfCreator.trim()) pdfDoc.setCreator(pdfCreator.trim());
    
    return await pdfDoc.save({ useObjectStreams });
  };

  const downloadZIP = async (filesList, baseName) => {
    setSplitStatus("Creating ZIP archive...");
    try {
      const zip = new JSZip();
      for (const file of filesList) {
        if (file.blob) {
          zip.file(file.name, file.blob);
        } else {
          const response = await fetch(file.url);
          const blob = await response.blob();
          zip.file(file.name, blob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;
      
      const rawZipName = zipFilenamePattern || "{filename}_split_archive";
      const zipNameFormatted = rawZipName.replaceAll("{filename}", baseName) + ".zip";
      
      link.download = zipNameFormatted;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
      setSplitStatus(`Successfully created ZIP archive with ${filesList.length} files!`);
    } catch (error) {
      console.error("Error creating ZIP:", error);
      setSplitStatus(`Error creating ZIP: ${error.message}`);
    }
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

      const files = [];

      if (splitMode === "each") {
        const pagesToExtract = Array.from({ length: totalPages }, (_, i) => i + 1);
        for (let i = 0; i < pagesToExtract.length; i++) {
          const pageNum = pagesToExtract[i];
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await applyMetadataAndSave(newPdf);

          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const formattedName = formatFileName(filenamePattern || "{filename}_page_{page}", {
            filename: fileName,
            range: pageNum.toString(),
            index: (i + 1).toString(),
            page: pageNum.toString(),
            total_pages: totalPages.toString(),
          });
          
          files.push({
            url,
            name: formattedName,
            pageNumber: pageNum,
            blob: blob,
          });
        }
        setDownloadedFiles(files);
        setSplitStatus(
          `Successfully split ${totalPages} pages into ${files.length} separate PDF files.`,
        );
      } else if (splitMode === "range" && rangeOutputMode === "multiple") {
        if (!pageRange.trim()) {
          setSplitStatus("Please enter page range.");
          setIsProcessing(false);
          return;
        }

        const rangeParts = pageRange.split(",").map((p) => p.trim()).filter(Boolean);
        if (rangeParts.length === 0) {
          setSplitStatus("Invalid page range. Please check your input.");
          setIsProcessing(false);
          return;
        }

        for (let i = 0; i < rangeParts.length; i++) {
          const part = rangeParts[i];
          const partPages = processPageRange(part, totalPages);
          if (partPages.length === 0) continue; // Skip invalid parts

          const newPdf = await PDFDocument.create();
          const pagesToCopy = partPages.map((pageNum) => pageNum - 1);
          const copiedPages = await newPdf.copyPages(sourcePdf, pagesToCopy);
          copiedPages.forEach((page) => newPdf.addPage(page));
          const pdfBytes = await applyMetadataAndSave(newPdf);

          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const formattedName = formatFileName(filenamePattern || "{filename}_range_{range}", {
            filename: fileName,
            range: part.replace(/\s+/g, ""),
            index: (i + 1).toString(),
            page: part.replace(/\s+/g, ""),
            total_pages: totalPages.toString(),
          });

          files.push({
            url,
            name: formattedName,
            rangeText: part,
            blob: blob,
          });
        }

        if (files.length === 0) {
          setSplitStatus("No pages matched the specified ranges.");
          setIsProcessing(false);
          return;
        }

        setDownloadedFiles(files);
        setSplitStatus(`Successfully split into ${files.length} PDF files by range.`);
      } else {
        // Single PDF extraction (for single range or extract mode)
        let pagesToExtract = [];
        let rawRangeInput = "";

        if (splitMode === "range") {
          if (!pageRange.trim()) {
            setSplitStatus("Please enter page range.");
            setIsProcessing(false);
            return;
          }
          pagesToExtract = processPageRange(pageRange, totalPages);
          rawRangeInput = pageRange;
        } else if (splitMode === "extract") {
          if (!extractPages.trim()) {
            setSplitStatus("Please enter page numbers to extract.");
            setIsProcessing(false);
            return;
          }
          pagesToExtract = processPageRange(extractPages, totalPages);
          rawRangeInput = extractPages;
        }

        if (pagesToExtract.length === 0) {
          setSplitStatus("Invalid pages. Please check your input.");
          setIsProcessing(false);
          return;
        }

        const newPdf = await PDFDocument.create();
        const pagesToCopy = pagesToExtract.map((pageNum) => pageNum - 1);
        const copiedPages = await newPdf.copyPages(sourcePdf, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const pdfBytes = await applyMetadataAndSave(newPdf);

        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const rangeText = pagesToExtract.length === 1 ? "page" : "pages";
        
        const cleanRangeText = rawRangeInput.replace(/,/g, "_").replace(/\s/g, "");
        const formattedName = formatFileName(filenamePattern || "{filename}_split_{range}", {
          filename: fileName,
          range: cleanRangeText,
          index: "1",
          page: cleanRangeText,
          total_pages: totalPages.toString(),
        });

        const singleFile = {
          url,
          name: formattedName,
          pageCount: pagesToExtract.length,
          blob: blob,
        };

        files.push(singleFile);
        setDownloadedFiles(files);
        setSplitStatus(`Successfully extracted ${pagesToExtract.length} ${rangeText}.`);
      }

      // Auto-download handling
      if (autoDownload && files.length > 0) {
        if (files.length === 1) {
          handleDownload(files[0]);
        } else {
          await downloadZIP(files, fileName);
        }
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

    if (downloadedFiles.length === 1) {
      handleDownload(downloadedFiles[0]);
      return;
    }

    await downloadZIP(downloadedFiles, fileName);
  };

  const clearAll = () => {
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
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="dark:text-slate-100">
        {/* Header with Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 dark:from-blue-400 dark:to-purple-400">
            PDF Split Tool
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto dark:text-gray-400">
            Split your PDF files by page range, extract specific pages, or split
            each page into separate files
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-800 dark:shadow-slate-900/50">
          <div className="p-6 md:p-8">
            {/* File Upload Section */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3 dark:text-slate-300">
                📄 Upload PDF File
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type === "application/pdf") {
                      setPdfFile(file);
                      setFileName(file.name.replace(".pdf", ""));
                      setSplitStatus("");
                      setDownloadedFiles([]);
                    } else {
                      setSplitStatus("Please upload a valid PDF file.");
                      setPdfFile(null);
                    }
                  }}
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                    pdfFile
                      ? "border-green-400 bg-green-50 dark:border-green-500/50 dark:bg-green-950/30"
                      : isDragging
                      ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/40 scale-[1.01] shadow-lg animate-pulse"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-700/50 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {pdfFile ? (
                      <>
                        <svg
                          className="w-12 h-12 mb-3 text-green-500 dark:text-green-400"
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
                        <p className="text-sm text-green-600 font-medium dark:text-green-400">
                          File ready!
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 mb-3 text-gray-400 dark:text-slate-500"
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
                        <p className="mb-2 text-sm text-gray-500 dark:text-slate-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
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
                <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600">
                  <div className="flex items-center flex-1 min-w-0">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2 shrink-0 dark:text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 truncate dark:text-slate-300">
                      {pdfFile.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-400 shrink-0 dark:text-slate-500">
                      ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={clearAll}
                    className="ml-3 text-red-500 hover:text-red-700 text-sm font-medium shrink-0 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Split Mode Selection */}
            {pdfFile && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3 dark:text-slate-300">
                  ⚙️ Select Split Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSplitMode("range")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      splitMode === "range"
                        ? "border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-950/30"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-slate-600 dark:hover:border-slate-500 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1 dark:text-slate-200">
                      📖 Page Range
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      Split by range (e.g., 1-5, 8, 10-15)
                    </div>
                  </button>
                  <button
                    onClick={() => setSplitMode("extract")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      splitMode === "extract"
                        ? "border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-950/30"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-slate-600 dark:hover:border-slate-500 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1 dark:text-slate-200">
                      🎯 Extract Pages
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      Extract specific pages only
                    </div>
                  </button>
                  <button
                    onClick={() => setSplitMode("each")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      splitMode === "each"
                        ? "border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-950/30"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-slate-600 dark:hover:border-slate-500 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1 dark:text-slate-200">
                      🔪 Split Each Page
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      Create one PDF per page
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Page Range Input */}
            {pdfFile && splitMode === "range" && (
              <div className="mb-8 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 dark:text-slate-300">
                    📝 Page Range
                  </label>
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="e.g., 33-35, 36-43, 44-49"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:ring-blue-400"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-gray-500 mt-2 dark:text-slate-400">
                    💡 Enter page numbers or ranges separated by commas. Example: 33-35, 36-43, 44-49
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 dark:text-slate-300">
                    📂 Export Options
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRangeOutputMode("multiple")}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3 ${
                        rangeOutputMode === "multiple"
                          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
                          : "border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <div className="mt-0.5 font-bold">📂</div>
                      <div>
                        <div className="font-semibold text-sm dark:text-slate-200">Split into Multiple PDFs</div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          Creates a separate file for each range (e.g. 33-35.pdf, 36-43.pdf)
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRangeOutputMode("single")}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-3 ${
                        rangeOutputMode === "single"
                          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
                          : "border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <div className="mt-0.5 font-bold">📄</div>
                      <div>
                        <div className="font-semibold text-sm dark:text-slate-200">Merge into Single PDF</div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          Combines all selected ranges into one file containing all pages
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Extract Pages Input */}
            {pdfFile && splitMode === "extract" && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2 dark:text-slate-300">
                  🎯 Pages to Extract
                </label>
                <input
                  type="text"
                  value={extractPages}
                  onChange={(e) => setExtractPages(e.target.value)}
                  placeholder="e.g., 1, 3, 5-7"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:ring-blue-400"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-2 dark:text-slate-400">
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
                      ? "bg-gray-400 cursor-not-allowed dark:bg-slate-600"
                      : "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-[1.02] dark:from-blue-500 dark:to-purple-500"
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

            {/* Advanced Options Section */}
            {pdfFile && (
              <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/10">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-4 font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100/50 dark:hover:bg-slate-800/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span>⚙️</span>
                    <span>Advanced Customization Options</span>
                  </div>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showAdvanced && (
                  <div className="p-5 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 space-y-6">
                    {/* Filename Patterns */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                        <span>📝</span> File Naming Customization
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 dark:text-slate-400">
                            PDF Filename Pattern
                          </label>
                          <input
                            type="text"
                            value={filenamePattern}
                            onChange={(e) => setFilenamePattern(e.target.value)}
                            placeholder="{filename}_part_{range}"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">
                            Available: <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">{"{filename}"}</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">{"{range}"}</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">{"{index}"}</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">{"{page}"}</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">{"{total_pages}"}</code>
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 dark:text-slate-400">
                            ZIP Archive Name Pattern
                          </label>
                          <input
                            type="text"
                            value={zipFilenamePattern}
                            onChange={(e) => setZipFilenamePattern(e.target.value)}
                            placeholder="{filename}_split_archive"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">
                            Available: <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded">{"{filename}"}</code>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PDF Document Metadata */}
                    <div className="border-t pt-4 border-gray-200 dark:border-slate-700">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                        <span>🏷️</span> Output PDF Metadata
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 dark:text-slate-400">
                            Title
                          </label>
                          <input
                            type="text"
                            value={pdfTitle}
                            onChange={(e) => setPdfTitle(e.target.value)}
                            placeholder="e.g. My Document"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 dark:text-slate-400">
                            Author
                          </label>
                          <input
                            type="text"
                            value={pdfAuthor}
                            onChange={(e) => setPdfAuthor(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 dark:text-slate-400">
                            Subject
                          </label>
                          <input
                            type="text"
                            value={pdfSubject}
                            onChange={(e) => setPdfSubject(e.target.value)}
                            placeholder="e.g. Document Chapter"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 dark:text-slate-400">
                            Keywords (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={pdfKeywords}
                            onChange={(e) => setPdfKeywords(e.target.value)}
                            placeholder="e.g. invoice, split, pdf"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 dark:text-slate-400">
                            Creator Application
                          </label>
                          <input
                            type="text"
                            value={pdfCreator}
                            onChange={(e) => setPdfCreator(e.target.value)}
                            placeholder="ToolsTrek"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Behavior and Saving Options */}
                    <div className="border-t pt-4 border-gray-200 dark:border-slate-700">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                        <span>⚙️</span> Processing Options
                      </h4>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoDownload}
                            onChange={(e) => setAutoDownload(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-slate-300">
                            Automatically download files after processing (ZIP for multiple files)
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useObjectStreams}
                            onChange={(e) => setUseObjectStreams(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-slate-300">
                            Enable Object Stream compression (smaller output size)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status Message */}
            {splitStatus && (
              <div
                className={`mb-8 p-4 rounded-xl ${
                  splitStatus.includes("Error")
                    ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/40"
                    : "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800/40"
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
              <div className="border-t pt-6 mt-4 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    📥{" "}
                    {downloadedFiles.length === 1
                      ? "Your PDF is Ready"
                      : `Ready to Download (${downloadedFiles.length} files)`}
                  </h3>
                  {downloadedFiles.length > 1 && (
                    <button
                      onClick={handleDownloadAll}
                      className="px-5 py-2 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2 dark:from-green-500 dark:to-emerald-500"
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
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group dark:bg-slate-700/50 dark:hover:bg-slate-700"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <svg
                          className="w-6 h-6 text-red-500 mr-3 shrink-0 dark:text-red-400"
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
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-slate-200">
                            {file.name}
                          </p>
                          {(file.pageNumber || file.pageCount || file.rangeText) && (
                            <p className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">
                              {file.pageNumber
                                ? `Page ${file.pageNumber}`
                                : file.rangeText
                                ? `Range: ${file.rangeText}`
                                : `${file.pageCount} pages`}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm hover:shadow dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-5 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl dark:from-blue-950/30 dark:to-purple-950/30">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 dark:text-slate-200">
                <span>📘</span> How to Use
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    1.
                  </span>
                  <span className="text-gray-700 dark:text-slate-300">
                    Upload your PDF file (via click or drag & drop)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    2.
                  </span>
                  <span className="text-gray-700 dark:text-slate-300">
                    Choose split mode, enter page range & output type
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    3.
                  </span>
                  <span className="text-gray-700 dark:text-slate-300">
                    Customize Advanced settings if needed & click Split
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600 bg-white/50 p-3 rounded-lg dark:bg-slate-800/50 dark:text-slate-400">
                <strong>💡 Pro tip:</strong> Use &quot;Page Range&quot; to split by range, and select whether to output separate PDF files for each range or merge them. Use the collapsible &quot;Advanced Customization Options&quot; panel to change filename naming pattern templates (e.g. using <code>{"{filename}"}</code>, <code>{"{range}"}</code>, or <code>{"{index}"}</code> placeholders), edit PDF metadata (title, author), or enable automatic downloads.
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
