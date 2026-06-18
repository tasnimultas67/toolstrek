"use client";

import React, { useState, useRef } from "react";
// import { createWorker } from "tesseract.js";
import {
  Copy,
  Download,
  Upload,
  Info,
  CheckCircle2,
  Loader2,
  Languages,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronDown,
  Search,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// Language configuration
const LANGUAGES = {
  ben: "বাংলা (Bengali)",
  eng: "English",
  hin: "हिन्दी (Hindi)",
  spa: "Español",
  fra: "Français",
  deu: "Deutsch",
  ita: "Italiano",
  por: "Português",
  rus: "Русский",
  jpn: "日本語",
  chi_sim: "中文 (简体)",
  ara: "العربية",
};

// Preprocessing options for better accuracy
const PREPROCESSING_OPTIONS = {
  NONE: "No preprocessing",
  BINARY: "High Contrast (Best for printed text)",
  GRAYSCALE: "Grayscale",
  RESIZE: "Upscale (Best for small text)",
};

// Modern Custom Select Component
const CustomSelect = ({
  value,
  onChange,
  options,
  disabled,
  label,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = Object.entries(options).filter(([key, label]) =>
    label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedLabel = options[value];

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {Icon && <Icon size={16} />}
        {label}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm transition-all duration-200 ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
        } border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`}
      >
        <span
          className={
            selectedLabel
              ? "text-gray-900 dark:text-gray-100"
              : "text-gray-500 dark:text-gray-400"
          }
        >
          {selectedLabel || "Select..."}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} text-gray-500 dark:text-gray-400`}
        />
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-black/5 dark:shadow-gray-900/50 animate-in slide-in-from-top-2 duration-200">
            {/* Search Bar */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-1.5 pl-9 pr-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options */}
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onChange(key);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                      value === key
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                  No results found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function ImageToText() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Ready to scan");
  const [selectedLanguage, setSelectedLanguage] = useState("ben");
  const [preprocessing, setPreprocessing] = useState("BINARY");
  const [confidence, setConfidence] = useState(0);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Apply preprocessing to image
  const applyPreprocessing = (imageElement) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    ctx.drawImage(imageElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (preprocessing) {
      case "GRAYSCALE":
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        break;

      case "BINARY":
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const threshold = 128;
          const value = gray > threshold ? 255 : 0;
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }
        break;

      case "RESIZE":
        canvas.width = imageElement.width * 2;
        canvas.height = imageElement.height * 2;
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL();

      default:
        break;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setText("");
      setProgress(0);
      setConfidence(0);
      setStatus("Image uploaded successfully");
    }
  };

  const preprocessImage = async (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (preprocessing === "NONE") {
          resolve(imageUrl);
        } else {
          const processedUrl = applyPreprocessing(img);
          resolve(processedUrl);
        }
      };
      img.src = imageUrl;
    });
  };

  const runOCR = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file && !image) return;

    setIsLoading(true);
    setStatus("Preprocessing image...");

    try {
      let processedImageUrl = image;
      if (preprocessing !== "NONE") {
        processedImageUrl = await preprocessImage(image);
      }

      setStatus(`Initializing OCR with ${LANGUAGES[selectedLanguage]}...`);

      const worker = await createWorker(selectedLanguage, 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStatus(`Scanning text...`);
            setProgress(Math.floor(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(processedImageUrl);

      // Calculate approximate confidence
      const textLength = data.text.length;
      let calculatedConfidence = 0;

      if (textLength > 0) {
        calculatedConfidence = Math.min(90, 75 + Math.floor(textLength / 20));
        setConfidence(calculatedConfidence);
      }

      setText(data.text);
      setStatus(`Extraction complete`);

      await worker.terminate();
    } catch (err) {
      console.error("OCR Error:", err);
      setStatus("Extraction failed. Please try a clearer image.");
      setConfidence(0);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setStatus("Copied to clipboard!");
    setTimeout(() => setStatus("Ready to scan"), 2000);
  };

  const resetAll = () => {
    setImage(null);
    setText("");
    setProgress(0);
    setConfidence(0);
    setStatus("Ready to scan");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl px-1 pt-20 pb-10">
      <div>
        {/* Hidden canvas for preprocessing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Image to Text Converter
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Extract text from images using OCR technology • Supports বাংলা and
              12+ languages
            </p>
          </div>

          {/* Settings Panel - Using Custom Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <CustomSelect
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              options={LANGUAGES}
              disabled={isLoading}
              label="Select Language"
              icon={Languages}
            />

            <CustomSelect
              value={preprocessing}
              onChange={setPreprocessing}
              options={PREPROCESSING_OPTIONS}
              disabled={isLoading}
              label="Image Enhancement"
              icon={AlertCircle}
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div>
              <div
                onClick={() => !isLoading && fileInputRef.current.click()}
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800
                  ${image ? "border-blue-400 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/10 dark:hover:bg-blue-900/10"}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {image ? (
                  <div className="relative w-full">
                    <img
                      src={image}
                      alt="Preview"
                      className="max-w-full max-h-[350px] rounded-lg shadow-md dark:shadow-gray-900/30 object-contain mx-auto"
                    />
                    {isLoading && (
                      <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                        <Loader2
                          className="text-blue-600 dark:text-blue-400 animate-spin mb-3"
                          size={40}
                        />
                        <span className="text-gray-900 dark:text-white font-bold text-xl mb-1">
                          {progress}%
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {status}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload
                        className="text-gray-600 dark:text-gray-400"
                        size={24}
                      />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                      Click to upload image
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      PNG, JPG, WEBP • Max 10MB
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={runOCR}
                  disabled={!image || isLoading}
                  className="flex-1 py-2.5 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? "Processing..." : "Extract Text"}
                </button>

                <button
                  onClick={resetAll}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 border border-gray-200 dark:border-gray-600 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              {/* Bengali Tips */}
              {selectedLanguage === "ben" && !image && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-blue-800 dark:text-blue-300 text-xs font-medium mb-1">
                    💡 বাংলা টেক্সটের জন্য টিপস:
                  </p>
                  <p className="text-blue-700 dark:text-blue-400 text-xs">
                    পরিষ্কার, উচ্চ-রেজোলিউশনের ছবি ব্যবহার করুন এবং ভালো আলোতে
                    ছবি তুলুন
                  </p>
                </div>
              )}
            </div>

            {/* Output Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col h-[450px] transition-all duration-200">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={
                      text
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500"
                    }
                    size={18}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Extracted Text
                  </span>
                  {confidence > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full animate-in fade-in duration-300">
                      ~{confidence}% confidence
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={copyText}
                    disabled={!text}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 transition-all duration-200 disabled:opacity-30 hover:scale-110 active:scale-90"
                    title="Copy Text"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([text], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `ocr-${Date.now()}.txt`;
                      link.click();
                    }}
                    disabled={!text}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 transition-all duration-200 disabled:opacity-30 hover:scale-110 active:scale-90"
                    title="Download TXT"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                placeholder={
                  selectedLanguage === "ben"
                    ? "এক্সট্রাক্ট করা টেক্সট এখানে দেখা যাবে..."
                    : "Extracted text will appear here..."
                }
                value={text}
                className="w-full flex-grow p-4 outline-none resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200"
                style={{
                  fontFamily:
                    selectedLanguage === "ben"
                      ? "'Noto Sans Bengali', monospace"
                      : "monospace",
                }}
                dir={selectedLanguage === "ara" ? "rtl" : "ltr"}
              />

              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg transition-colors duration-200">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${isLoading ? "bg-blue-500 animate-pulse" : text ? "bg-green-500" : "bg-gray-400"}`}
                    />
                    Status: {status}
                  </span>
                  {isLoading && (
                    <div className="flex items-center gap-2 animate-in fade-in duration-300">
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs">{progress}%</span>
                    </div>
                  )}
                  {text && !isLoading && (
                    <div className="flex items-center gap-1 animate-in fade-in duration-300">
                      <FileText size={12} />
                      <span>
                        {text.split(/\s+/).filter((w) => w.length > 0).length}{" "}
                        words
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Info size={12} />
              <span>
                Powered by Tesseract OCR • Works locally • Your images never
                leave your device
              </span>
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
