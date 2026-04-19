"use client";
import React, { useState, useEffect } from "react";
import { Copy, Trash2, Type, Bold, Italic, Hash } from "lucide-react";

const CaseConverter = () => {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [activeType, setActiveType] = useState(null);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleTransform = (type) => {
    setActiveType(type);
    switch (type) {
      case "upper":
        setText(text.toUpperCase());
        break;
      case "lower":
        setText(text.toLowerCase());
        break;
      case "sentence":
        setText(
          text
            .toLowerCase()
            .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
        );
        break;
      case "title":
        setText(text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()));
        break;
      case "slug":
        setText(
          text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        );
        break;
      case "clear":
        setText("");
        setIsBold(false);
        setIsItalic(false);
        setActiveType(null);
        break;
      default:
        break;
    }
  };

  const copyToClipboard = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  // Restored and accurate stats
  const stats = {
    words: text.trim() === "" ? 0 : text.trim().split(/\s+/).length,
    chars: text.length,
    sentences: text.split(/[.!?]+/).filter(Boolean).length,
  };

  const getBtnStyle = (type, activeColor) => {
    const isActive = activeType === type;
    const base =
      "px-5 py-2.5 rounded-xl transition-all duration-300 active:scale-95 text-sm font-bold border ";

    if (isActive) {
      return `${base} ${activeColor} text-white border-transparent shadow-lg scale-105`;
    }
    return `${base} bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Type className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
              Case <span className="text-blue-600">Refine</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`p-2 rounded-xl transition-all ${isBold ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`p-2 rounded-xl transition-all ${isItalic ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Italic size={18} />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="relative group">
            <textarea
              className={`w-full h-72 p-6 text-lg border-none bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none mb-6 
                ${isBold ? "font-bold" : "font-normal"} 
                ${isItalic ? "italic" : ""}`}
              placeholder="Paste your content here..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setActiveType(null);
              }}
            />
            {text && (
              <button
                onClick={() => handleTransform("clear")}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleTransform("upper")}
                className={getBtnStyle(
                  "upper",
                  "bg-indigo-500 shadow-indigo-200",
                )}
              >
                UPPERCASE
              </button>
              <button
                onClick={() => handleTransform("lower")}
                className={getBtnStyle("lower", "bg-sky-500 shadow-sky-200")}
              >
                lowercase
              </button>
              <button
                onClick={() => handleTransform("sentence")}
                className={getBtnStyle(
                  "sentence",
                  "bg-violet-500 shadow-violet-200",
                )}
              >
                Sentence case
              </button>
              <button
                onClick={() => handleTransform("title")}
                className={getBtnStyle(
                  "title",
                  "bg-fuchsia-500 shadow-fuchsia-200",
                )}
              >
                Title Case
              </button>
              <button
                onClick={() => handleTransform("slug")}
                className={getBtnStyle(
                  "slug",
                  "bg-emerald-500 shadow-emerald-200",
                )}
              >
                <span className="flex items-center gap-1">
                  <Hash size={14} /> slug
                </span>
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              disabled={!text}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg min-w-[140px] justify-center
                ${copied ? "bg-green-500 text-white shadow-green-100" : "bg-gray-900 dark:bg-blue-600 text-white shadow-blue-100 hover:bg-black"}`}
            >
              <Copy size={18} />
              {copied ? "Copied!" : "Copy Result"}
            </button>
          </div>
        </div>

        {/* Footer Stats - Sentences Restored */}
        <div className="px-8 py-5 bg-gray-50/80 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="flex gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex flex-col">
              <span>Words</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 font-black">
                {stats.words}
              </span>
            </div>
            <div className="flex flex-col">
              <span>Characters</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 font-black">
                {stats.chars}
              </span>
            </div>
            <div className="flex flex-col border-l border-gray-200 dark:border-gray-700 pl-8">
              <span>Sentences</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 font-black">
                {stats.sentences}
              </span>
            </div>
          </div>

          <div
            className={`hidden sm:block text-xs font-bold px-3 py-1 rounded-full transition-all duration-500 ${copied ? "text-green-500 bg-green-50 opacity-100" : "opacity-0"}`}
          >
            ✓ Perfect format
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseConverter;
