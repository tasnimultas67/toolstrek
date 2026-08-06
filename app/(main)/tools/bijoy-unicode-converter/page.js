"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Languages,
  RefreshCw,
  Copy,
  Trash2,
  Download,
  Keyboard,
  History,
  Sparkles,
  Check,
  FileText,
  ArrowRightLeft,
  Sliders,
  Info,
  Bookmark,
  Share2
} from "lucide-react";
import { ConvertToUnicode, ConvertToASCII } from "./converter-utils";

export default function BijoyUnicodeConverter() {
  // Core state
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isBijoyToUnicode, setIsBijoyToUnicode] = useState(true);
  const [conversionLayout, setConversionLayout] = useState("bijoy"); // bijoy, somewherein, boisakhi
  const [isLive, setIsLive] = useState(true);
  
  // Font sizes: min mobile is 12px, laptop is 14px
  const [fontSize, setFontSize] = useState(16);
  const [isMobile, setIsMobile] = useState(false);

  // Status states
  const [copied, setCopied] = useState(false);
  const [showKbReference, setShowKbReference] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [previewLegacyFont, setPreviewLegacyFont] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef(null);

  // Detect mobile device to apply minimum font size constraints
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Enforce minimum font sizes
      setFontSize((prev) => {
        if (mobile && prev < 12) return 12;
        if (!mobile && prev < 14) return 14;
        return prev;
      });
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch history on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("toolstrek_bijoy_history");
      if (saved) {
        setHistoryList(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Handle conversion trigger
  const runConversion = (textVal, direct = isBijoyToUnicode, layout = conversionLayout) => {
    if (!textVal) {
      setOutputText("");
      return;
    }
    if (direct) {
      setOutputText(ConvertToUnicode(layout, textVal));
    } else {
      setOutputText(ConvertToASCII(layout, textVal));
    }
  };

  // Convert on text change (if live mode)
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (isLive) {
      runConversion(val, isBijoyToUnicode, conversionLayout);
    }
  };

  // Convert manually
  const triggerManualConvert = () => {
    runConversion(inputText, isBijoyToUnicode, conversionLayout);
  };

  // Toggle conversion direction
  const handleSwapDirection = () => {
    const oldInput = inputText;
    const oldOutput = outputText;
    const newDirection = !isBijoyToUnicode;
    setIsBijoyToUnicode(newDirection);
    setInputText(oldOutput);
    setOutputText(oldInput);
    if (isLive) {
      runConversion(oldOutput, newDirection, conversionLayout);
    }
  };

  // Copy output to clipboard
  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save current conversion to history
  const saveToHistory = () => {
    if (!inputText.trim()) return;
    const newItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: inputText.substring(0, 50) + (inputText.length > 50 ? "..." : ""),
      inputText: inputText,
      outputText: outputText,
      layout: conversionLayout,
      direction: isBijoyToUnicode ? "Bijoy ➔ Unicode" : "Unicode ➔ Bijoy"
    };
    const updated = [newItem, ...historyList.slice(0, 19)];
    setHistoryList(updated);
    localStorage.setItem("toolstrek_bijoy_history", JSON.stringify(updated));
  };

  // Load item from history
  const loadHistoryItem = (item) => {
    setInputText(item.inputText);
    setOutputText(item.outputText);
    const direct = item.direction.includes("Unicode");
    setIsBijoyToUnicode(!direct);
    setConversionLayout(item.layout);
  };

  // Clear history
  const clearAllHistory = () => {
    setHistoryList([]);
    localStorage.removeItem("toolstrek_bijoy_history");
  };

  // Delete single history item
  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    const updated = historyList.filter(item => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem("toolstrek_bijoy_history", JSON.stringify(updated));
  };

  // Import Plain Text file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readFile(file);
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setInputText(text);
      runConversion(text, isBijoyToUnicode, conversionLayout);
    };
    reader.readAsText(file);
  };

  // File Drop handling
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      readFile(file);
    }
  };

  // Download converted text
  const downloadText = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted-${isBijoyToUnicode ? "unicode" : "bijoy"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clean all fields
  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  // Insert virtual keyboard character
  const insertChar = (char) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const val = input.value;
    const newVal = val.substring(0, start) + char + val.substring(end);
    setInputText(newVal);
    runConversion(newVal, isBijoyToUnicode, conversionLayout);
    
    // Focus back and set cursor position
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  // Statistics
  const stats = {
    words: inputText.trim() === "" ? 0 : inputText.trim().split(/\s+/).length,
    chars: inputText.length,
    banglaChars: (inputText.match(/[\u0980-\u09FF]/g) || []).length,
    engChars: (inputText.match(/[a-zA-Z]/g) || []).length,
    lines: inputText.split(/\r\n|\r|\n/).filter(Boolean).length
  };

  // Vowels reference map
  const sworoborno = ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ"];
  const kars = ["া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ"];
  const banjonborno = [
    "ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ",
    "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন",
    "প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ",
    "স", "হ", "ড়", "ঢ়", "য়", "ৎ"
  ];
  const conjunctHelpers = ["ং", "ঃ", "ঁ", "্", "।", "‌", "‍"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-3 md:px-6 pb-12 pt-24 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="relative overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                <Languages size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Bijoy ⇄ Unicode Converter
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Professional Bengali font engine with layout reordering support.
                </p>
              </div>
            </div>

            {/* Quick Layout Controls */}
            <div className="flex flex-wrap gap-2 items-center bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 w-full md:w-auto">
              <button
                id="layout-btn-bijoy"
                onClick={() => { setConversionLayout("bijoy"); if (isLive) runConversion(inputText, isBijoyToUnicode, "bijoy"); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  conversionLayout === "bijoy"
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Bijoy (SutonnyMJ)
              </button>
              <button
                id="layout-btn-somewherein"
                onClick={() => { setConversionLayout("somewherein"); if (isLive) runConversion(inputText, isBijoyToUnicode, "somewherein"); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  conversionLayout === "somewherein"
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Somewherein
              </button>
              <button
                id="layout-btn-boisakhi"
                onClick={() => { setConversionLayout("boisakhi"); if (isLive) runConversion(inputText, isBijoyToUnicode, "boisakhi"); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  conversionLayout === "boisakhi"
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                Boishakhi
              </button>
            </div>
          </div>
        </div>

        {/* Floating Settings/Options Toolbar */}
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-100 dark:border-gray-800/80 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-xs">
          <div className="flex flex-wrap gap-4 items-center">
            
            {/* Live conversion switch */}
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                id="toggle-live-mode"
                type="checkbox"
                checked={isLive}
                onChange={(e) => setIsLive(e.target.checked)}
                className="w-4 h-4 rounded-sm text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <span>Live Conversion</span>
            </label>

            {/* Legacy Preview style switch */}
            {!isBijoyToUnicode && (
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input
                  id="toggle-legacy-preview"
                  type="checkbox"
                  checked={previewLegacyFont}
                  onChange={(e) => setPreviewLegacyFont(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1">
                  Preview in SutonnyMJ Style
                </span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Font size control */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Sliders className="text-gray-400 w-4 h-4 shrink-0" />
              <span className="text-xs text-gray-500 font-semibold shrink-0">
                Size: {fontSize}px
              </span>
              <input
                id="slider-font-size"
                type="range"
                min={isMobile ? 12 : 14}
                max={28}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full sm:w-28 accent-indigo-600 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <button
                id="btn-show-history"
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  showHistory
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border-indigo-200 dark:border-indigo-900"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
                title="History"
              >
                <History size={18} />
              </button>

              <button
                id="btn-show-keyboard"
                onClick={() => setShowKbReference(!showKbReference)}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  showKbReference
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border-indigo-200 dark:border-indigo-900"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
                title="Bangla Keyboard Reference"
              >
                <Keyboard size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar/Collapsible Containers */}
        {showKbReference && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-md transition-all">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                <Keyboard size={20} className="text-indigo-500" />
                <span>Unicode Bangla Keyboard Reference</span>
              </div>
              <button
                onClick={() => setShowKbReference(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 block mb-2 font-bold">Vowels (স্বরবর্ণ):</span>
                <div className="flex flex-wrap gap-1.5">
                  {sworoborno.map((char) => (
                    <button
                      key={char}
                      onClick={() => insertChar(char)}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-indigo-500 hover:text-white dark:bg-gray-800 dark:hover:bg-indigo-600 rounded-md border border-gray-100 dark:border-gray-700 cursor-pointer text-sm transition-all"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 block mb-2 font-bold">Vowel Signs (কার):</span>
                <div className="flex flex-wrap gap-1.5">
                  {kars.map((char) => (
                    <button
                      key={char}
                      onClick={() => insertChar(char)}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-indigo-500 hover:text-white dark:bg-gray-800 dark:hover:bg-indigo-600 rounded-md border border-gray-100 dark:border-gray-700 cursor-pointer text-sm transition-all"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 block mb-2 font-bold">Consonants (ব্যঞ্জনবর্ণ):</span>
                <div className="flex flex-wrap gap-1.5">
                  {banjonborno.map((char) => (
                    <button
                      key={char}
                      onClick={() => insertChar(char)}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-indigo-500 hover:text-white dark:bg-gray-800 dark:hover:bg-indigo-600 rounded-md border border-gray-100 dark:border-gray-700 cursor-pointer text-sm transition-all"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-indigo-600 dark:text-indigo-400 block mb-2 font-bold">Special / Link Vowels:</span>
                <div className="flex flex-wrap gap-1.5">
                  {conjunctHelpers.map((char) => (
                    <button
                      key={char}
                      onClick={() => insertChar(char)}
                      className="px-3 py-1.5 bg-indigo-50/50 hover:bg-indigo-500 hover:text-white dark:bg-gray-850 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-100/50 dark:border-gray-700 cursor-pointer text-sm transition-all"
                    >
                      {char === "‌" ? "Zero Width Non-Joiner" : char === "‍" ? "Zero Width Joiner" : char}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-md transition-all">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                <History size={20} className="text-indigo-500" />
                <span>Conversion History (Saved Locally)</span>
              </div>
              <div className="flex gap-4 items-center">
                {historyList.length > 0 && (
                  <button
                    id="btn-clear-history-all"
                    onClick={clearAllHistory}
                    className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {historyList.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400 font-medium">
                No past conversions found. Use the save button to add records!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-2">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="group flex flex-col justify-between p-4 bg-gray-50 hover:bg-indigo-50/50 dark:bg-gray-800 dark:hover:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-750 transition-all cursor-pointer text-xs"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full text-[10px]">
                        {item.direction} ({item.layout})
                      </span>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 cursor-pointer transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2 font-medium mb-3">
                      {item.source}
                    </p>
                    <span className="text-[10px] text-gray-400 font-bold self-end">
                      {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dual Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Input Panel */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col bg-white dark:bg-gray-900 border rounded-3xl overflow-hidden shadow-xs transition-all relative ${
              dragOver
                ? "border-indigo-500 ring-4 ring-indigo-500/10"
                : "border-gray-150 dark:border-gray-800"
            }`}
          >
            {dragOver && (
              <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-900/10 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none z-10">
                <FileText className="w-12 h-12 text-indigo-500 animate-bounce mb-2" />
                <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  Drop Plain Text File Here
                </span>
              </div>
            )}

            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md text-white bg-linear-to-r from-blue-500 to-indigo-600">
                  Source
                </span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {isBijoyToUnicode
                    ? `Bijoy ANSI Text (${conversionLayout})`
                    : "Unicode Bangla Text"}
                </span>
              </div>
              <div className="flex gap-2">
                <label
                  className="p-2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-white rounded-xl border border-gray-250 dark:border-gray-700 cursor-pointer shadow-2xs transition-all active:scale-95"
                  title="Upload Text File"
                >
                  <FileText size={16} />
                  <input
                    id="input-file-uploader"
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {inputText && (
                  <button
                    id="btn-clear-input"
                    onClick={handleClear}
                    className="p-2 bg-white hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950/20 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-xl border border-gray-250 dark:border-gray-700 cursor-pointer shadow-2xs transition-all active:scale-95"
                    title="Clear"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Input Textarea */}
            <div className="relative flex-1 min-h-[300px] flex">
              <textarea
                id="textarea-source-input"
                ref={inputRef}
                className="w-full min-h-[300px] p-6 border-none outline-hidden resize-y placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-250 focus:ring-0 bg-transparent"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: isBijoyToUnicode ? "Courier New, monospace" : "inherit"
                }}
                placeholder={
                  isBijoyToUnicode
                    ? "SutonnyMJ বা অন্য ANSI ফন্টের টেক্সট এখানে পেস্ট করুন..."
                    : "ইউনিকোড বাংলা টেক্সট এখানে পেস্ট করুন..."
                }
                value={inputText}
                onChange={handleInputChange}
              />
            </div>

            {/* Input Info Footer */}
            <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <div>Chars: <span className="text-gray-700 dark:text-gray-300 text-xs">{stats.chars}</span></div>
              <div>Words: <span className="text-gray-700 dark:text-gray-300 text-xs">{stats.words}</span></div>
              <div>Lines: <span className="text-gray-700 dark:text-gray-300 text-xs">{stats.lines}</span></div>
              <div>Bangla Chars: <span className="text-gray-700 dark:text-gray-300 text-xs">{stats.banglaChars}</span></div>
              {isBijoyToUnicode && (
                <div className="ml-auto text-indigo-500 dark:text-indigo-400 normal-case font-semibold">
                  *Styled as ANSI Courier for formatting safety
                </div>
              )}
            </div>
          </div>

          {/* Action Divider / Swap Button (Visible on Desktop as vertical separator controls, on Mobile as floating separator) */}
          <div className="lg:hidden flex justify-center items-center my-2 gap-4">
            <button
              id="mobile-swap-btn"
              onClick={handleSwapDirection}
              className="p-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
            {!isLive && (
              <button
                id="mobile-convert-btn"
                onClick={triggerManualConvert}
                disabled={!inputText}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 dark:disabled:bg-gray-800 text-white rounded-full font-bold shadow-md cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Convert</span>
              </button>
            )}
          </div>

          {/* Output Panel */}
          <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xs relative">
            
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md text-white bg-linear-to-r from-indigo-500 to-purple-600">
                  Target
                </span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {isBijoyToUnicode
                    ? "Unicode Bangla Text"
                    : `Bijoy ANSI Text (${conversionLayout})`}
                </span>
              </div>
              <div className="flex gap-2">
                {outputText && (
                  <>
                    <button
                      id="btn-save-to-history"
                      onClick={saveToHistory}
                      className="p-2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl border border-gray-250 dark:border-gray-700 cursor-pointer shadow-2xs transition-all active:scale-95"
                      title="Save to History"
                    >
                      <Bookmark size={16} />
                    </button>
                    
                    <button
                      id="btn-download-output"
                      onClick={downloadText}
                      className="p-2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl border border-gray-250 dark:border-gray-700 cursor-pointer shadow-2xs transition-all active:scale-95"
                      title="Download as Text File"
                    >
                      <Download size={16} />
                    </button>
                  </>
                )}
                
                <button
                  id="btn-copy-output"
                  onClick={copyToClipboard}
                  disabled={!outputText}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all text-xs active:scale-95 shadow-2xs cursor-pointer border
                    ${
                      copied
                        ? "bg-green-500 border-green-500 text-white shadow-green-100"
                        : "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 border-gray-250 dark:border-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy Result"}</span>
                </button>
              </div>
            </div>

            {/* Output Textarea / Container */}
            <div className="relative flex-1 min-h-[300px] flex">
              <textarea
                id="textarea-converted-output"
                readOnly
                className={`w-full min-h-[300px] p-6 border-none outline-hidden resize-y text-gray-700 dark:text-gray-200 bg-transparent focus:ring-0
                  ${!isBijoyToUnicode && previewLegacyFont ? "font-sutonny" : ""}`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: (!isBijoyToUnicode && previewLegacyFont) ? "SutonnyMJ, 'SutonnyMJ-Regular', sans-serif" : (isBijoyToUnicode ? "inherit" : "Courier New, monospace")
                }}
                placeholder={
                  isBijoyToUnicode
                    ? "ইউনিকোড কনভার্ট হওয়া টেক্সট এখানে প্রদর্শিত হবে..."
                    : "ANSI/Bijoy কনভার্ট হওয়া টেক্সট এখানে প্রদর্শিত হবে..."
                }
                value={outputText}
              />
            </div>

            {/* Output Info Footer */}
            <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <div>
                Output Length: <span className="text-gray-700 dark:text-gray-300 text-xs">{outputText.length}</span>
              </div>
              
              {!isBijoyToUnicode && previewLegacyFont && (
                <div className="text-indigo-500 dark:text-indigo-400 normal-case font-semibold">
                  *Styled as SutonnyMJ preview layout
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Large Desktop Controls Separator (Arrows & Swap Button) */}
        <div className="hidden lg:flex justify-center items-center gap-4 py-4">
          <div className="h-0.5 bg-gray-200 dark:bg-gray-800 flex-1"></div>
          <button
            id="desktop-swap-btn"
            onClick={handleSwapDirection}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer"
            title="Swap Direction"
          >
            <ArrowRightLeft size={16} />
            <span>Swap Direction</span>
          </button>
          
          {!isLive && (
            <button
              id="desktop-convert-btn"
              onClick={triggerManualConvert}
              disabled={!inputText}
              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 dark:disabled:bg-gray-800 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/15 cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw size={16} className="animate-spin-slow" />
              <span>Convert Now</span>
            </button>
          )}
          <div className="h-0.5 bg-gray-200 dark:bg-gray-800 flex-1"></div>
        </div>

        {/* Info & Guide Card */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-150 dark:border-gray-855 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg">
            <Info size={22} />
            <span>How to use the Bijoy ⇄ Unicode Converter</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">
                1. Bijoy to Unicode Conversion (Legacy to Modern)
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 leading-relaxed pl-2">
                <li>Paste legacy text written using fonts like <span className="font-bold dark:text-white">SutonnyMJ</span> in the input box.</li>
                <li>Make sure the direction matches <span className="font-bold dark:text-white">Bijoy ANSI ➔ Unicode</span>.</li>
                <li>The engine will dynamically fix vowel placements and conjunct layouts to create clean Unicode text.</li>
                <li>You can copy the result and paste it directly on social media, websites, or emails.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">
                2. Unicode to Bijoy Conversion (Modern to Legacy)
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 leading-relaxed pl-2">
                <li>Paste modern Unicode text typed in Avro, Gboard, or standard phonetic layouts.</li>
                <li>Click <span className="font-bold dark:text-white">Swap Direction</span> to change the conversion mode.</li>
                <li>Copy the output and paste it into applications like Adobe Illustrator or MS Word.</li>
                <li>Ensure you style the output text with the <span className="font-bold dark:text-white">SutonnyMJ</span> font inside those programs to render correctly.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
