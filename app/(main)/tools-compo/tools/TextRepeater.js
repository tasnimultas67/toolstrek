"use client";

import React, { useState } from "react";
import {
  Repeat,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Type,
  Hash,
  SeparatorHorizontal,
  Wand2,
  CheckCircle2,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

const TextRepeater = () => {
  const [inputText, setInputText] = useState("");
  const [repeatCount, setRepeatCount] = useState(10);
  const [separator, setSeparator] = useState("newline");
  const [customSeparator, setCustomSeparator] = useState("");
  const [outputText, setOutputText] = useState("");
  const [addSuffix, setAddSuffix] = useState(false);
  const [suffixText, setSuffixText] = useState("");
  const [addPrefix, setAddPrefix] = useState(false);
  const [prefixText, setPrefixText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!inputText.trim()) {
      setOutputText("✨ Please enter some text to repeat.");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      let finalSeparator = "";
      switch (separator) {
        case "newline":
          finalSeparator = "\n";
          break;
        case "space":
          finalSeparator = " ";
          break;
        case "comma":
          finalSeparator = ", ";
          break;
        case "custom":
          finalSeparator = customSeparator;
          break;
        default:
          finalSeparator = "\n";
      }

      let textToRepeat = inputText;
      if (addPrefix && prefixText) {
        textToRepeat = prefixText + inputText;
      }
      if (addSuffix && suffixText) {
        textToRepeat = inputText + suffixText;
      }
      if (addPrefix && addSuffix && prefixText && suffixText) {
        textToRepeat = prefixText + inputText + suffixText;
      }

      const repeatedArray = Array(repeatCount).fill(textToRepeat);
      setOutputText(repeatedArray.join(finalSeparator));
      setIsGenerating(false);
    }, 100);
  };

  const handleClear = () => {
    setInputText("");
    setRepeatCount(10);
    setSeparator("newline");
    setCustomSeparator("");
    setOutputText("");
    setAddSuffix(false);
    setSuffixText("");
    setAddPrefix(false);
    setPrefixText("");
  };

  const handleCopyToClipboard = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy text.");
    }
  };

  const handleDownloadTxt = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "repeated-text.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl px-1 pt-20 pb-10">
      <div className="dark:text-slate-100">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3 dark:from-slate-200 dark:to-slate-400">
            Text Repeater
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto dark:text-slate-400">
            Create repeated text patterns with custom separators, prefixes, and
            suffixes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Options */}
          <div className="space-y-5">
            {/* Input Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transition-all hover:shadow-2xl dark:bg-slate-800/80 dark:border-slate-700/50 dark:shadow-slate-900/50">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Input Text
                </h2>
              </div>
              <textarea
                rows="4"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:ring-blue-400"
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            {/* Repeat Count Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transition-all hover:shadow-2xl dark:bg-slate-800/80 dark:border-slate-700/50 dark:shadow-slate-900/50">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Repeat Count
                </h2>
              </div>
              <div className="space-y-3">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={repeatCount}
                  onChange={(e) =>
                    setRepeatCount(
                      Math.min(
                        10000,
                        Math.max(1, parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200"
                />
                <p className="text-xs text-slate-500 text-center dark:text-slate-400">
                  Range: 1 to 10,000
                </p>
              </div>
            </div>

            {/* Separator Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transition-all hover:shadow-2xl dark:bg-slate-800/80 dark:border-slate-700/50 dark:shadow-slate-900/50">
              <div className="flex items-center gap-2 mb-4">
                <SeparatorHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Separator
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { value: "newline", label: "New Line", icon: "↵" },
                  { value: "space", label: "Space", icon: "␣" },
                  { value: "comma", label: "Comma", icon: "," },
                  { value: "custom", label: "Custom", icon: "✎" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSeparator(option.value)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      separator === option.value
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md dark:from-blue-500 dark:to-indigo-500"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-600/50"
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
              {separator === "custom" && (
                <input
                  type="text"
                  className="w-full mt-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                  placeholder="Enter custom separator (e.g., ' | ' or ' - ')"
                  value={customSeparator}
                  onChange={(e) => setCustomSeparator(e.target.value)}
                />
              )}
            </div>

            {/* Prefix & Suffix Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transition-all hover:shadow-2xl dark:bg-slate-800/80 dark:border-slate-700/50 dark:shadow-slate-900/50">
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Prefix & Suffix
                </h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addPrefix}
                      onChange={(e) => setAddPrefix(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-blue-400"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Add Prefix
                    </span>
                  </label>
                  {addPrefix && (
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                      placeholder="Prefix text (e.g., 'Hello ')"
                      value={prefixText}
                      onChange={(e) => setPrefixText(e.target.value)}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addSuffix}
                      onChange={(e) => setAddSuffix(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-blue-400"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Add Suffix
                    </span>
                  </label>
                  {addSuffix && (
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                      placeholder="Suffix text (e.g., ' World')"
                      value={suffixText}
                      onChange={(e) => setSuffixText(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Text
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-600/50"
              >
                <Trash2 className="w-5 h-5" />
                Clear
              </button>
            </div>
          </div>

          {/* Right Column - Result Box */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200 overflow-hidden dark:from-slate-800 dark:to-slate-800/50 dark:border-slate-700/50 dark:shadow-slate-900/50">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex justify-between items-center dark:from-slate-700 dark:to-slate-800">
                <h2 className="text-lg font-semibold text-white">Result</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    disabled={!outputText}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    disabled={!outputText}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 rounded-xl p-4 min-h-[400px] max-h-[600px] overflow-auto border border-slate-200 dark:bg-slate-700/50 dark:border-slate-600">
                  {outputText ? (
                    <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed dark:text-slate-300">
                      {outputText}
                    </pre>
                  ) : (
                    <div className="text-slate-400 text-center py-12 dark:text-slate-500">
                      <Repeat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Your repeated text will appear here</p>
                      <p className="text-sm">
                        Click "Generate Text" to see the result
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
};

export default TextRepeater;
