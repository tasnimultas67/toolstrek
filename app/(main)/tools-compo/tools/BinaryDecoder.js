"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Binary,
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Sliders,
  Settings2,
  HelpCircle,
  Database,
  Grid,
  FileText
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRESET_TEXTS = {
  hello: "Hello, World! 👋",
  welcome: "Welcome to ToolsTrek!",
  binary: "01010100 01101111 01101111 01101100 01110011 01010100 01110010 01100101 01101011"
};

// Common characters for quick selection in the bit editor
const BIT_PRESETS = [
  { char: "A", name: "A (Uppercase)" },
  { char: "a", name: "a (Lowercase)" },
  { char: "1", name: "1 (Number)" },
  { char: "?", name: "? (Symbol)" },
  { char: "@", name: "@ (At sign)" },
  { char: "!", name: "! (Exclamation)" },
  { char: " ", name: "Space" }
];

// Helper to determine control characters or readable character labels
function getCharDetails(byteVal) {
  if (byteVal === 32) return { char: "Space", type: "Whitespace", desc: "Word space (0x20)" };
  if (byteVal === 10) return { char: "LF", type: "Control", desc: "Line feed / New Line (0x0A)" };
  if (byteVal === 13) return { char: "CR", type: "Control", desc: "Carriage Return (0x0D)" };
  if (byteVal === 9) return { char: "TAB", type: "Control", desc: "Tabulator (0x09)" };
  if (byteVal === 0) return { char: "NUL", type: "Control", desc: "Null byte (0x00)" };
  
  if (byteVal < 32 || (byteVal >= 127 && byteVal < 160)) {
    return { 
      char: `CTL`, 
      type: "Control", 
      desc: `Control Character (0x${byteVal.toString(16).toUpperCase().padStart(2, "0")})` 
    };
  }
  
  try {
    const char = String.fromCharCode(byteVal);
    return { 
      char: char, 
      type: byteVal > 127 ? "Extended" : "Printable", 
      desc: `Character glyph (0x${byteVal.toString(16).toUpperCase().padStart(2, "0")})` 
    };
  } catch (_) {
    return { char: "?", type: "Unknown", desc: "Non-printable byte" };
  }
}

// Generate ASCII Reference Table items (ASCII 32 to 126)
const REFERENCE_CHART = Array.from({ length: 95 }, (_, i) => {
  const code = i + 32;
  const char = code === 32 ? "Space" : String.fromCharCode(code);
  return {
    code,
    char,
    hex: `0x${code.toString(16).toUpperCase().padStart(2, "0")}`,
    binary: code.toString(2).padStart(8, "0"),
    type: /[a-zA-Z]/.test(char) ? "Letters" : /[0-9]/.test(char) ? "Numbers" : "Symbols"
  };
});

// ─── Encoder & Decoder Functions ─────────────────────────────────────────────
function encodeTextToBinary(text, encoding, delimiter, customDelim) {
  if (!text) return "";

  let tokens = [];

  if (encoding === "utf8") {
    // Standard UTF-8 byte encoding (handles all Unicode, Bengali, Emojis, etc.)
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    tokens = Array.from(bytes).map((b) => b.toString(2).padStart(8, "0"));
  } else if (encoding === "ascii") {
    // 7-bit ASCII representation
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // Mask to 7-bits (0-127)
      tokens.push((code & 0x7f).toString(2).padStart(7, "0"));
    }
  } else if (encoding === "utf16") {
    // 16-bit UTF-16 representation
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      tokens.push(code.toString(2).padStart(16, "0"));
    }
  }

  // Join tokens based on chosen delimiter
  let sep = " ";
  if (delimiter === "none") sep = "";
  else if (delimiter === "comma") sep = ",";
  else if (delimiter === "dash") sep = "-";
  else if (delimiter === "custom") sep = customDelim || " ";

  return tokens.join(sep);
}

function decodeBinaryToText(binaryStr, encoding, delimiter, customDelim) {
  if (!binaryStr.trim()) return "";

  let tokens = [];
  
  if (delimiter === "none") {
    // Strip everything except 0 and 1, then chunk based on encoding width
    const cleanBin = binaryStr.replace(/[^01]/g, "");
    const width = encoding === "ascii" ? 7 : (encoding === "utf16" ? 16 : 8);
    for (let i = 0; i < cleanBin.length; i += width) {
      const chunk = cleanBin.slice(i, i + width);
      if (chunk.length > 0) tokens.push(chunk);
    }
  } else {
    // Determine the separator
    let sep = " ";
    if (delimiter === "comma") sep = ",";
    else if (delimiter === "dash") sep = "-";
    else if (delimiter === "custom") sep = customDelim || " ";

    // Split based on separator, then sanitize each token
    tokens = binaryStr
      .split(sep)
      .map((t) => t.replace(/[^01]/g, ""))
      .filter((t) => t.length > 0);
  }

  if (tokens.length === 0) return "";

  try {
    if (encoding === "utf8") {
      // Decode UTF-8 bytes array
      const byteArray = new Uint8Array(
        tokens.map((t) => {
          const val = parseInt(t, 2);
          return isNaN(val) ? 0 : val;
        })
      );
      const decoder = new TextDecoder("utf-8", { fatal: false });
      return decoder.decode(byteArray);
    } else if (encoding === "ascii") {
      // Decode ASCII 7-bit characters
      return tokens
        .map((t) => {
          const val = parseInt(t, 2);
          return isNaN(val) ? "" : String.fromCharCode(val & 0x7f);
        })
        .join("");
    } else if (encoding === "utf16") {
      // Decode UTF-16 characters
      return tokens
        .map((t) => {
          const val = parseInt(t, 2);
          return isNaN(val) ? "" : String.fromCharCode(val);
        })
        .join("");
    }
  } catch (error) {
    console.error("Decoding error:", error);
    return "Error: Invalid binary sequence for the selected encoding.";
  }

  return "";
}

export default function BinaryDecoder() {
  const [mode, setMode] = useState("encode"); // "encode" | "decode"
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Settings States
  const [encoding, setEncoding] = useState("utf8"); // "utf8" | "ascii" | "utf16"
  const [delimiter, setDelimiter] = useState("space"); // "space" | "none" | "comma" | "dash" | "custom"
  const [customDelimiter, setCustomDelimiter] = useState("/");
  
  // Bit-level Editor State (holds 8 booleans representing bits of a single byte)
  const [editorBits, setEditorBits] = useState([0, 1, 0, 0, 1, 0, 0, 0]); // 'H' (72)
  const [activeChipIndex, setActiveChipIndex] = useState(-1);

  // Reference Table State
  const [showReference, setShowReference] = useState(false);
  const [activeGroup, setActiveGroup] = useState("all");
  const [refSearch, setRefSearch] = useState("");

  // Translate in real-time
  useEffect(() => {
    if (!inputText) {
      setOutputText("");
      return;
    }
    if (mode === "encode") {
      setOutputText(encodeTextToBinary(inputText, encoding, delimiter, customDelimiter));
    } else {
      setOutputText(decodeBinaryToText(inputText, encoding, delimiter, customDelimiter));
    }
  }, [inputText, mode, encoding, delimiter, customDelimiter]);

  // Mode Swap
  const handleSwap = useCallback(() => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInputText(outputText);
    setOutputText(inputText);
    setActiveChipIndex(-1);
  }, [mode, inputText, outputText]);

  // Clear Input/Output
  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setActiveChipIndex(-1);
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  // Download Output File
  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === "encode" ? "binary_encoded.txt" : "decoded_text.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Load Preset text
  const loadPreset = (type) => {
    const text = PRESET_TEXTS[type];
    if (type === "binary") {
      setMode("decode");
      setInputText(text);
    } else {
      setMode("encode");
      setInputText(text);
    }
    setActiveChipIndex(-1);
  };

  // ─── Bit Editor Handlers ──────────────────────────────────────────────────
  const editorByteVal = useMemo(() => {
    return editorBits.reduce((acc, bit, idx) => acc + bit * Math.pow(2, 7 - idx), 0);
  }, [editorBits]);

  const editorCharDetails = useMemo(() => {
    return getCharDetails(editorByteVal);
  }, [editorByteVal]);

  const handleBitToggle = (idx) => {
    setEditorBits((prev) => {
      const next = [...prev];
      next[idx] = next[idx] === 1 ? 0 : 1;
      return next;
    });
  };

  const loadCharIntoEditor = (char) => {
    if (!char) return;
    const code = char.charCodeAt(0);
    // Convert to 8-bit binary array
    const binaryStr = (code & 0xff).toString(2).padStart(8, "0");
    const bits = binaryStr.split("").map((b) => parseInt(b, 10));
    setEditorBits(bits);
  };

  const insertEditorChar = (insertMode) => {
    // insertMode: 'char' or 'binary'
    if (insertMode === "char") {
      const charStr = String.fromCharCode(editorByteVal);
      if (mode === "encode") {
        setInputText((prev) => prev + charStr);
      } else {
        setOutputText((prev) => prev + charStr);
      }
    } else {
      const binaryStr = editorBits.join("");
      if (mode === "decode") {
        setInputText((prev) => {
          let sep = " ";
          if (delimiter === "none") sep = "";
          else if (delimiter === "comma") sep = ",";
          else if (delimiter === "dash") sep = "-";
          else if (delimiter === "custom") sep = customDelimiter || " ";
          
          return prev ? prev + sep + binaryStr : binaryStr;
        });
      } else {
        setOutputText((prev) => {
          let sep = " ";
          if (delimiter === "none") sep = "";
          else if (delimiter === "comma") sep = ",";
          else if (delimiter === "dash") sep = "-";
          else if (delimiter === "custom") sep = customDelimiter || " ";
          
          return prev ? prev + sep + binaryStr : binaryStr;
        });
      }
    }
  };

  // Chips under Encode output box representing character list for loading in the Editor
  const encodedCharacterChips = useMemo(() => {
    if (mode !== "encode" || !inputText) return [];
    // Just split individual characters
    return inputText.split("").slice(0, 48); // Limit to first 48 chars to avoid clutter
  }, [mode, inputText]);

  // ─── Statistics Calculations ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const charCount = inputText.length;
    let byteCount = 0;
    let bitsStr = "";

    if (mode === "encode" && outputText) {
      bitsStr = outputText.replace(/[^01]/g, "");
      // UTF-8 bytes can be calculated using TextEncoder
      byteCount = new TextEncoder().encode(inputText).length;
    } else if (mode === "decode" && inputText) {
      bitsStr = inputText.replace(/[^01]/g, "");
      byteCount = Math.ceil(bitsStr.length / 8);
    }

    const totalBits = bitsStr.length;
    const ones = bitsStr.split("").filter((b) => b === "1").length;
    const zeroes = totalBits - ones;

    return {
      chars: charCount,
      bytes: byteCount,
      bits: totalBits,
      ones: ones,
      zeroes: zeroes,
      onesPct: totalBits > 0 ? Math.round((ones / totalBits) * 100) : 0,
      zeroesPct: totalBits > 0 ? Math.round((zeroes / totalBits) * 100) : 0
    };
  }, [inputText, outputText, mode]);

  // Filtered Reference Chart Items
  const filteredRefItems = useMemo(() => {
    return REFERENCE_CHART.filter((item) => {
      const matchesSearch =
        item.char.toLowerCase().includes(refSearch.toLowerCase()) ||
        item.code.toString().includes(refSearch) ||
        item.hex.toLowerCase().includes(refSearch.toLowerCase()) ||
        item.binary.includes(refSearch);
      
      const matchesGroup = activeGroup === "all" || item.type.toLowerCase() === activeGroup.toLowerCase();

      return matchesSearch && matchesGroup;
    });
  }, [refSearch, activeGroup]);

  // Insert value from reference table click
  const handleRefRowClick = (item) => {
    if (mode === "encode") {
      setInputText((prev) => prev + (item.code === 32 ? " " : item.char));
    } else {
      setInputText((prev) => {
        let sep = " ";
        if (delimiter === "none") sep = "";
        else if (delimiter === "comma") sep = ",";
        else if (delimiter === "dash") sep = "-";
        else if (delimiter === "custom") sep = customDelimiter || " ";
        return prev ? prev + sep + item.binary : item.binary;
      });
    }
  };

  return (
    <ToolPageShell>
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
          <Binary size={14} />
          Computer Systems
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          Binary Code{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brandColor to-purple-400">
            Decoder & Encoder
          </span>
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Convert plain text to binary code bytes or decode machine signals back into readable sentences instantly.
        </p>
      </div>

      {/* Preset and Demo Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1 uppercase tracking-wider">Demo Presets:</span>
        <button
          onClick={() => loadPreset("hello")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-800 rounded-lg transition-all"
        >
          <Sparkles size={12} className="text-brandColor" /> Encode Hello
        </button>
        <button
          onClick={() => loadPreset("welcome")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-800 rounded-lg transition-all"
        >
          <Sparkles size={12} className="text-brandColor" /> Encode Welcome
        </button>
        <button
          onClick={() => loadPreset("binary")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-800 rounded-lg transition-all"
        >
          <Database size={12} className="text-brandColor" /> Decode Binary
        </button>
      </div>

      {/* Settings Grid Panel */}
      <div className="p-5 mb-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
          <Settings2 size={16} className="text-brandColor" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
            Decoder Options
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Encoding Choice */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Sliders size={12} /> Character Encoding
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl">
              {[
                { id: "utf8", label: "UTF-8 (8-bit)" },
                { id: "ascii", label: "ASCII (7-bit)" },
                { id: "utf16", label: "UTF-16 (16-bit)" }
              ].map((enc) => (
                <button
                  key={enc.id}
                  onClick={() => setEncoding(enc.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    encoding === enc.id
                      ? "bg-brandColor text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {enc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delimiter Choice */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Sliders size={12} /> Binary Separator
            </label>
            <div className="grid grid-cols-5 gap-1 p-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl">
              {[
                { id: "space", label: "Space" },
                { id: "none", label: "None" },
                { id: "comma", label: "," },
                { id: "dash", label: "-" },
                { id: "custom", label: "Custom" }
              ].map((delim) => (
                <button
                  key={delim.id}
                  onClick={() => setDelimiter(delim.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    delimiter === delim.id
                      ? "bg-brandColor text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {delim.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Delimiter Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Custom Separator String
            </label>
            <input
              type="text"
              disabled={delimiter !== "custom"}
              maxLength={4}
              value={customDelimiter}
              onChange={(e) => setCustomDelimiter(e.target.value)}
              placeholder="e.g. /, \, _"
              className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-brandColor disabled:opacity-40 disabled:cursor-not-allowed font-mono transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Mode Swapper Widget */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setMode("encode");
              setInputText("");
              setOutputText("");
              setActiveChipIndex(-1);
            }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "encode"
                ? "bg-brandColor text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Text → Binary (Encode)
          </button>
          <button
            onClick={() => {
              setMode("decode");
              setInputText("");
              setOutputText("");
              setActiveChipIndex(-1);
            }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "decode"
                ? "bg-brandColor text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Binary → Text (Decode)
          </button>
        </div>
      </div>

      {/* Input / Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Input Card */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {mode === "encode" ? "📝 Plain Text Input" : "💻 Binary Stream Input"}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              {inputText.length} {mode === "encode" ? "characters" : "bits/chars"}
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setActiveChipIndex(-1);
            }}
            placeholder={
              mode === "encode"
                ? "Type message to convert to binary... e.g. Hello!"
                : "Enter binary signals (0s and 1s)... e.g. 01001000 01001001"
            }
            rows={8}
            className="flex-1 w-full px-5 py-4 text-base text-gray-800 dark:text-gray-100 bg-transparent resize-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 font-mono leading-relaxed"
          />
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleClear}
              disabled={!inputText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 size={13} /> Clear Input
            </button>
          </div>
        </div>

        {/* Output Card */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {mode === "encode" ? "💻 Binary Output" : "📝 Decoded Text Output"}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              {outputText.length} {mode === "encode" ? "bits/chars" : "characters"}
            </span>
          </div>
          <div className="flex-1 px-5 py-4 text-base text-gray-800 dark:text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-all min-h-[200px] select-all bg-gray-50/50 dark:bg-gray-950/20">
            {outputText ? (
              outputText
            ) : (
              <span className="text-gray-400 dark:text-gray-600">
                Translation will appear here in real-time...
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy Output"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!outputText}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Download size={13} /> Save File
            </button>
          </div>
        </div>
      </div>

      {/* Swap Button Bar */}
      <div className="flex items-center justify-between gap-4 mb-8 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <button
          onClick={handleSwap}
          disabled={!inputText && !outputText}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-brandColor border border-brandColor/30 bg-brandColor/5 hover:bg-brandColor/10 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeftRight size={15} /> Swap Translator Modes
        </button>
        <div className="text-xs text-gray-500 dark:text-gray-500 font-medium hidden md:block">
          💡 Change options above to format spacing or bits size.
        </div>
      </div>

      {/* Character Board to Feed the Bit Editor (Only shown in Encode mode when text exists) */}
      {mode === "encode" && encodedCharacterChips.length > 0 && (
        <div className="mb-6 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            🔬 Click to inspect bits for a character:
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {encodedCharacterChips.map((char, idx) => {
              const isSelected = activeChipIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveChipIndex(idx);
                    loadCharIntoEditor(char);
                  }}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-mono border font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brandColor text-white border-brandColor scale-105 shadow-sm"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brandColor/50 hover:text-brandColor"
                  }`}
                  title={`Inspect byte values for: "${char}"`}
                >
                  {char === " " ? "␣" : char}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bit-Level Byte Editor Widget */}
      <div className="mb-8 p-6 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-brandColor" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
              Interactive Bit-Level Byte Editor
            </h3>
          </div>
          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mr-1">Load Preset:</span>
            {BIT_PRESETS.map((preset) => (
              <button
                key={preset.char}
                onClick={() => {
                  loadCharIntoEditor(preset.char);
                  setActiveChipIndex(-1);
                }}
                className="px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brandColor/40 hover:bg-brandColor/5 rounded-md transition-all cursor-pointer"
              >
                {preset.char === " " ? "Space" : preset.char}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* 8 Bits row representation */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tweak bits of the byte (MSB on left, LSB on right):
            </span>
            <div className="grid grid-cols-8 gap-2">
              {editorBits.map((bit, idx) => {
                const weight = Math.pow(2, 7 - idx);
                const isActive = bit === 1;
                return (
                  <button
                    key={idx}
                    onClick={() => handleBitToggle(idx)}
                    className={`flex flex-col items-center justify-between p-3.5 border rounded-xl transition-all duration-150 cursor-pointer select-none group ${
                      isActive
                        ? "bg-brandColor/10 border-brandColor shadow-inner scale-[0.98]"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono mb-2">
                      Bit {7 - idx}
                    </span>
                    <span
                      className={`text-2xl font-black font-mono transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-brandColor" : "text-gray-300 dark:text-gray-700"
                      }`}
                    >
                      {bit}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-2 font-bold bg-gray-50 dark:bg-gray-950 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-800/80">
                      {weight}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glyph character representation block */}
          <div className="lg:col-span-4 flex items-stretch gap-4">
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-center shadow-inner">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                Byte Glyph
              </span>
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-brandColor/5 border border-brandColor/20 text-brandColor text-3xl font-black mb-2 select-all font-mono">
                {editorCharDetails.char}
              </div>
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {editorCharDetails.type}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 max-w-[150px] truncate" title={editorCharDetails.desc}>
                {editorCharDetails.desc}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col gap-1 font-mono text-xs text-gray-600 dark:text-gray-400">
                <div>Dec: <span className="font-bold text-gray-900 dark:text-white">{editorByteVal}</span></div>
                <div>Hex: <span className="font-bold text-gray-900 dark:text-white">0x{editorByteVal.toString(16).toUpperCase().padStart(2, "0")}</span></div>
                <div>Bin: <span className="font-bold text-brandColor">{editorBits.join("")}</span></div>
              </div>
              
              <button
                onClick={() => insertEditorChar("char")}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-brandColor hover:bg-brandColor/90 rounded-xl transition-all shadow-sm cursor-pointer text-center"
              >
                Insert Glyph
              </button>
              
              <button
                onClick={() => insertEditorChar("binary")}
                className="w-full py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                Insert Binary
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Details Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Character Length", value: stats.chars, icon: FileText, desc: "Total input characters" },
          { label: "Data Capacity", value: `${stats.bytes} Bytes`, icon: Database, desc: "Size of UTF-8 byte array" },
          { label: "Bit Dimension", value: `${stats.bits} Bits`, icon: Binary, desc: "Total number of binary symbols" },
          { 
            label: "Bit Weight (0s vs 1s)", 
            value: `${stats.zeroes} / ${stats.ones}`, 
            icon: Grid, 
            desc: "Ones vs Zeroes distribution",
            customNode: stats.bits > 0 && (
              <div className="mt-2.5 w-full flex flex-col gap-1 text-[10px]">
                <div className="flex justify-between font-mono text-gray-500">
                  <span>0s: {stats.zeroesPct}%</span>
                  <span>1s: {stats.onesPct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                  <div className="bg-gray-400 dark:bg-gray-600 h-full" style={{ width: `${stats.zeroesPct}%` }} />
                  <div className="bg-brandColor h-full" style={{ width: `${stats.onesPct}%` }} />
                </div>
              </div>
            )
          }
        ].map((item, idx) => (
          <div key={idx} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between gap-2 text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
              <item.icon size={15} className="text-brandColor/80" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {item.value}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
            {item.customNode && item.customNode}
          </div>
        ))}
      </div>

      {/* collapsible Reference Chart Table */}
      <div className="mb-6">
        <button
          onClick={() => setShowReference((p) => !p)}
          className="flex items-center gap-2 w-full px-5 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
        >
          <BookOpen size={15} className="text-brandColor" />
          Printable ASCII Binary Reference Chart
          <span className="ml-auto">{showReference ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
        </button>

        {showReference && (
          <div className="mt-2 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            {/* Search and Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="flex gap-2">
                {[
                  { id: "all", label: "All Characters" },
                  { id: "letters", label: "Letters" },
                  { id: "numbers", label: "Numbers" },
                  { id: "symbols", label: "Symbols" }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeGroup === g.id
                        ? "bg-brandColor text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search character, code, or binary..."
                value={refSearch}
                onChange={(e) => setRefSearch(e.target.value)}
                className="w-full md:w-64 px-4 py-1.5 text-xs text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full focus:outline-none focus:border-brandColor transition-colors"
              />
            </div>

            {/* Table wrapper */}
            <div className="max-h-[300px] overflow-y-auto border border-gray-150 dark:border-gray-800 rounded-xl font-mono text-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-55 dark:bg-gray-950 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-150 dark:border-gray-800 sticky top-0">
                    <th className="p-3">Character</th>
                    <th className="p-3">Decimal</th>
                    <th className="p-3">Hex</th>
                    <th className="p-3">Binary Code (8-bit)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredRefItems.length > 0 ? (
                    filteredRefItems.map((item) => (
                      <tr 
                        key={item.code} 
                        className="hover:bg-brandColor/5 dark:hover:bg-brandColor/10 transition-colors"
                      >
                        <td className="p-3 font-bold text-gray-800 dark:text-gray-200">
                          {item.char}
                        </td>
                        <td className="p-3 text-gray-500">{item.code}</td>
                        <td className="p-3 text-gray-500">{item.hex}</td>
                        <td className="p-3 text-brandColor font-bold">{item.binary}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRefRowClick(item)}
                            className="px-2 py-1 bg-gray-100 hover:bg-brandColor hover:text-white dark:bg-gray-800 dark:hover:bg-brandColor rounded text-[10px] font-semibold transition-all cursor-pointer"
                          >
                            Insert
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400 dark:text-gray-600">
                        No characters match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-500">
              <Info size={12} /> Click "Insert" to add that character or its binary representation into your input box.
            </p>
          </div>
        )}
      </div>

      {/* Info Explanations / Tips card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "ASCII & UTF-8 Encoding",
            desc: "ASCII encodes standard English glyphs using 7 or 8 bits. UTF-8 is a variable-width system covering all languages, symbols, and Emojis by grouping bytes together."
          },
          {
            title: "Byte Delimiters",
            desc: "Separator flags (like spaces or commas) are commonly used to make long lists of 1s and 0s easier for humans to read. You can remove spacing entirely to copy raw streams."
          },
          {
            title: "How to use Bit Editor",
            desc: "Toggle binary switches in the Byte Editor to view how flip-flopping a single bit updates character values. Great for understanding bits, decimal offsets, and byte boundaries."
          }
        ].map((info, idx) => (
          <div key={idx} className="p-4 bg-brandColor/5 border border-brandColor/15 rounded-xl">
            <h4 className="text-xs font-bold text-brandColor mb-1">{info.title}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{info.desc}</p>
          </div>
        ))}
      </div>
    </ToolPageShell>
  );
}
