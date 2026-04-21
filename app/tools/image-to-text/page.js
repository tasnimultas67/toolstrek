"use client";

import React, { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import {
  Copy,
  Download,
  Upload,
  Info,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function ImageToText() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Ready to scan");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setText("");
      setProgress(0);
      setStatus("Image uploaded successfully");
    }
  };

  const runOCR = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    setIsLoading(true);
    setStatus("Initializing OCR engine...");

    try {
      // Defaulting to English for best stability as requested
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStatus("Scanning characters...");
            setProgress(Math.floor(m.progress * 100));
          }
        },
      });

      const {
        data: { text },
      } = await worker.recognize(file);
      setText(text);
      setStatus("Extraction complete");
      await worker.terminate();
    } catch (err) {
      console.error("OCR Error:", err);
      setStatus("Extraction failed. Please try a clearer image.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setStatus("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Image to Text Converter
          </h1>
          <p className="text-slate-500 mt-2">
            Extract text from images locally and securely.
          </p>
        </header>

        {/* Disclaimer Banner */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This tool is optimized for{" "}
            <strong>English</strong>. While it supports other languages,
            accuracy may vary, and non-English scripts might not provide 100%
            accurate results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div
              onClick={() => fileInputRef.current.click()}
              className={`group relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[350px]
                ${image ? "border-blue-400 bg-white shadow-sm" : "border-slate-300 hover:border-blue-500 bg-slate-100/50"}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {image ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={image}
                    alt="Preview"
                    className="max-w-full max-h-[300px] rounded-lg shadow-md object-contain"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-lg">
                      <Loader2
                        className="text-blue-600 animate-spin mb-2"
                        size={32}
                      />
                      <span className="text-blue-600 font-bold">
                        {progress}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-blue-600" size={24} />
                  </div>
                  <p className="font-semibold text-slate-700">
                    Click to upload image
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PNG, JPG, WEBP
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={runOCR}
              disabled={!image || isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? "Processing..." : "Extract Text Now"}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[480px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={text ? "text-emerald-500" : "text-slate-300"}
                  size={18}
                />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-tighter">
                  Result
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={copyText}
                  disabled={!text}
                  className="p-2.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors disabled:opacity-20"
                  title="Copy Text"
                >
                  <Copy size={20} />
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "tools-trek-ocr.txt";
                    link.click();
                  }}
                  disabled={!text}
                  className="p-2.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors disabled:opacity-20"
                  title="Download TXT"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>

            <textarea
              readOnly
              placeholder="Your extracted text will appear here..."
              value={text}
              className="w-full flex-grow p-6 outline-none resize-none text-slate-700 text-base leading-relaxed bg-transparent"
            />

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 italic">
                Status: {status}
              </span>
              {isLoading && (
                <div className="w-24 bg-slate-200 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
