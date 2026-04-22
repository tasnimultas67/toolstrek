"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const PdfMergeTool = () => {
  const [files, setFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");

  // Add new files
  const onDrop = useCallback((acceptedFiles) => {
    setError("");
    const pdfFiles = acceptedFiles.filter(
      (file) => file.type === "application/pdf",
    );
    if (pdfFiles.length !== acceptedFiles.length) {
      setError("Only PDF files are allowed. Non-PDF files were skipped.");
    }
    if (pdfFiles.length === 0) return;

    setFiles((prev) => [
      ...prev,
      ...pdfFiles.map((file, idx) => ({
        id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        addedAt: new Date(),
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    setMergedPdfUrl(null);
  };

  const moveFile = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setFiles(updated);
    setMergedPdfUrl(null);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }

    setIsMerging(true);
    setError("");

    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();

      for (const fileItem of files) {
        const arrayBuffer = await fileItem.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setMergedPdfUrl(url);
    } catch (err) {
      console.error("Merge error:", err);
      setError(
        "Failed to merge PDFs. Please make sure the files are valid PDFs.",
      );
    } finally {
      setIsMerging(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const resetAll = () => {
    setFiles([]);
    setMergedPdfUrl(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M4 4h16v16H4z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            PDF Merger
          </h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Combine multiple PDF files into one document. Free, fast, and
            private.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Dropzone Area */}
          <div
            {...getRootProps()}
            className={`m-6 p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200
              ${
                isDragActive
                  ? "border-blue-400 bg-blue-50/50 scale-[1.01]"
                  : "border-gray-200 bg-gray-50/30 hover:border-blue-300 hover:bg-blue-50/20"
              }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-200
                ${isDragActive ? "bg-blue-100" : "bg-gray-100"}`}
              >
                <svg
                  className={`w-10 h-10 transition-colors duration-200
                  ${isDragActive ? "text-blue-600" : "text-gray-400"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive
                  ? "Drop PDF files here"
                  : "Drag & drop PDF files here"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or click to browse from your device
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  Multiple files
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  No upload
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  100% private
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {/* File List Section */}
          {files.length > 0 && (
            <div className="px-6 pb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Files to merge
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {files.length} {files.length === 1 ? "file" : "files"}
                  </span>
                </div>
                <button
                  onClick={resetAll}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Clear all
                </button>
              </div>

              <div className="bg-gray-50/80 rounded-xl border border-gray-100 overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-3 transition-colors hover:bg-white/80
                        ${index !== files.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Reorder Controls */}
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            onClick={() => moveFile(index, index - 1)}
                            disabled={index === 0}
                            className={`p-1 rounded transition-all
                              ${
                                index === 0
                                  ? "text-gray-200 cursor-not-allowed"
                                  : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                              }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M5 15l7-7 7 7"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                          <span className="text-xs text-gray-400 w-6 text-center">
                            {index + 1}
                          </span>
                          <button
                            onClick={() => moveFile(index, index + 1)}
                            disabled={index === files.length - 1}
                            className={`p-1 rounded transition-all
                              ${
                                index === files.length - 1
                                  ? "text-gray-200 cursor-not-allowed"
                                  : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                              }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M19 9l-7 7-7-7"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* File Icon */}
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                          aria-label="Remove file"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M6 18L18 6M6 6l12 12"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Merge Button */}
              <button
                onClick={mergePDFs}
                disabled={isMerging || files.length < 2}
                className={`mt-6 w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2
                  ${
                    isMerging || files.length < 2
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  }`}
              >
                {isMerging ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    Merging PDFs...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    Merge {files.length} PDF{files.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Download Section */}
          {mergedPdfUrl && (
            <div className="border-t border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">
                      Merge Complete!
                    </p>
                    <p className="text-sm text-green-600">
                      Your PDF has been successfully merged
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a
                    href={mergedPdfUrl}
                    download="merged_document.pdf"
                    className="px-5 py-2.5 bg-white border-2 border-green-500 text-green-600 rounded-xl font-medium text-sm hover:bg-green-50 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m-4-4l4 4 4-4"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Download
                  </a>
                  <button
                    onClick={() => window.open(mergedPdfUrl, "_blank")}
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        strokeWidth="2"
                      />
                      <path
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        strokeWidth="2"
                      />
                    </svg>
                    Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  strokeWidth="2"
                />
              </svg>
              <span>Your files never leave your device</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" />
              </svg>
              <span>Fast client-side processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfMergeTool;
