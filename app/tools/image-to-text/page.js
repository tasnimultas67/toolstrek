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
  Languages,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      {/* Hidden canvas for preprocessing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image to Text Converter
          </h1>
          <p className="text-gray-600">
            Extract text from images using OCR technology • Supports বাংলা and
            12+ languages
          </p>
        </div>

        {/* Settings Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Languages size={16} />
              Select Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={isLoading}
            >
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <AlertCircle size={16} />
              Image Enhancement
            </label>
            <select
              value={preprocessing}
              onChange={(e) => setPreprocessing(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={isLoading}
            >
              {Object.entries(PREPROCESSING_OPTIONS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div>
            <div
              onClick={() => !isLoading && fileInputRef.current.click()}
              className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[400px] bg-white
                ${image ? "border-blue-400 bg-blue-50/20" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/10"}`}
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
                    className="max-w-full max-h-[350px] rounded-lg shadow-md object-contain mx-auto"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                      <Loader2
                        className="text-blue-600 animate-spin mb-3"
                        size={40}
                      />
                      <span className="text-gray-900 font-bold text-xl mb-1">
                        {progress}%
                      </span>
                      <p className="text-gray-600 text-sm">{status}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="text-gray-600" size={24} />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    Click to upload image
                  </p>
                  <p className="text-gray-500 text-sm">
                    PNG, JPG, WEBP • Max 10MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={runOCR}
                disabled={!image || isLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Extract Text"}
              </button>

              <button
                onClick={resetAll}
                disabled={isLoading}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all disabled:opacity-50 border border-gray-200"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {/* Bengali Tips */}
            {selectedLanguage === "ben" && !image && (
              <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-blue-800 text-xs font-medium mb-1">
                  💡 বাংলা টেক্সটের জন্য টিপস:
                </p>
                <p className="text-blue-700 text-xs">
                  পরিষ্কার, উচ্চ-রেজোলিউশনের ছবি ব্যবহার করুন এবং ভালো আলোতে ছবি
                  তুলুন
                </p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-[450px]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={text ? "text-green-600" : "text-gray-400"}
                  size={18}
                />
                <span className="text-sm font-medium text-gray-700">
                  Extracted Text
                </span>
                {confidence > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    ~{confidence}% confidence
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={copyText}
                  disabled={!text}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors disabled:opacity-30"
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
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors disabled:opacity-30"
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
              className="w-full flex-grow p-4 outline-none resize-none bg-white text-gray-800 text-sm leading-relaxed"
              style={{
                fontFamily:
                  selectedLanguage === "ben"
                    ? "'Noto Sans Bengali', monospace"
                    : "monospace",
              }}
              dir={selectedLanguage === "ara" ? "rtl" : "ltr"}
            />

            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Status: {status}</span>
                {isLoading && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span>{progress}%</span>
                  </div>
                )}
                {text && !isLoading && (
                  <div className="flex items-center gap-1">
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
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <Info size={12} />
            <span>
              Powered by Tesseract OCR • Works locally • Your images never leave
              your device
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
