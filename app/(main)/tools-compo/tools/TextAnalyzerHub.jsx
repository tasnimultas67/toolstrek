"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Copy,
  Trash2,
  FileText,
  Type,
  Sparkles,
  Search,
  Binary,
  Settings2,
  SlidersHorizontal,
  ChevronDown,
  Check,
  ClipboardPaste,
  HelpCircle,
  TrendingUp,
  Info,
  BookOpen,
  Volume2,
  RefreshCw,
  Eye,
  EyeOff,
  Code
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

export default function TextAnalyzerHub() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [activeTab, setActiveTab] = useState("counters"); // counters, converter, cleaner, replace, encoder
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Dropdown states
  const [isCaseDropdownOpen, setIsCaseDropdownOpen] = useState(false);
  const [isCleanerDropdownOpen, setIsCleanerDropdownOpen] = useState(false);
  const [isEncoderDropdownOpen, setIsEncoderDropdownOpen] = useState(false);

  // Selected sub-options for tabs
  const [selectedCaseStyle, setSelectedCaseStyle] = useState("upper");
  const [selectedCleanAction, setSelectedCleanAction] = useState("trim");
  const [selectedEncodeAction, setSelectedEncodeAction] = useState("base64_encode");

  // Advanced configurations
  const [countersConfig, setCountersConfig] = useState({
    readingWpm: 200,
    speakingWpm: 130,
    caseSensitiveFreq: false,
    excludeStopWords: false,
    ignoreNumbers: false,
    ignorePunctuation: false,
  });

  const [converterConfig, setConverterConfig] = useState({
    customDelimiter: "_",
    smartTitleCase: true,
    keepSpecialChars: true,
  });

  const [cleanerConfig, setCleanerConfig] = useState({
    joinSeparator: ", ",
    stripHtmlMode: "all", // all or structural
    customRegexPattern: "",
    customRegexReplacement: "",
  });

  const [replaceConfig, setReplaceConfig] = useState({
    findText: "",
    replaceText: "",
    caseSensitive: false,
    wholeWord: false,
    isRegex: false,
    multiLine: true,
  });

  const [encoderConfig, setEncoderConfig] = useState({
    binarySpacer: "space", // space, none, comma
    htmlEntitiesAll: false,
    base64UrlSafe: false,
  });

  // Reference for dropdown close on click outside
  const caseDropdownRef = useRef(null);
  const cleanerDropdownRef = useRef(null);
  const encoderDropdownRef = useRef(null);

  // Word frequency results calculation helper
  const STOP_WORDS = useMemo(() => new Set([
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "to", "of", "in", 
    "for", "on", "with", "at", "by", "this", "that", "it", "he", "she", "they", "we", 
    "you", "i", "has", "have", "had", "do", "does", "did", "as", "from", "at", "by", "an"
  ]), []);

  // Dropdown lists
  const caseOptions = [
    { value: "upper", label: "UPPERCASE", desc: "ALL CAPITAL LETTERS" },
    { value: "lower", label: "lowercase", desc: "all lowercase letters" },
    { value: "title", label: "Title Case", desc: "Capitalize Important Words" },
    { value: "sentence", label: "Sentence case", desc: "Capitalize first word of sentences" },
    { value: "camel", label: "camelCase", desc: "firstWordLowercaseSubsequentCapital" },
    { value: "pascal", label: "PascalCase", desc: "AllWordsCapitalizedNoSpaces" },
    { value: "snake", label: "snake_case", desc: "lowercase_words_with_underscores" },
    { value: "kebab", label: "kebab-case", desc: "lowercase-words-with-hyphens" },
    { value: "alternating", label: "AlTeRnAtInG CaSe", desc: "aLtErNaTiNg lEtTeRs" },
    { value: "inverse", label: "iNVERSE cASE", desc: "sWAP cASE oF eACH lETTER" },
  ];

  const cleanerOptions = [
    { value: "trim", label: "Trim Whitespace", desc: "Remove leading & trailing space" },
    { value: "remove_empty_lines", label: "Remove Empty Lines", desc: "Delete all blank lines" },
    { value: "remove_duplicate_lines", label: "Remove Duplicate Lines", desc: "Deduplicate unique content lines" },
    { value: "remove_extra_spaces", label: "Remove Extra Spaces", desc: "Collapse multiple spaces into one" },
    { value: "remove_line_breaks", label: "Remove All Line Breaks", desc: "Merge lines into single paragraph" },
    { value: "strip_html", label: "Strip HTML Tags", desc: "Remove HTML tags safely" },
    { value: "remove_punctuation", label: "Remove Punctuation", desc: "Delete commas, periods, etc." },
    { value: "remove_numbers", label: "Remove Numbers", desc: "Delete digit characters (0-9)" },
    { value: "custom_regex", label: "Custom Regex Replace", desc: "Run custom replace patterns" },
  ];

  const encoderOptions = [
    { value: "base64_encode", label: "Base64 Encode", desc: "Binary-to-Text encoding" },
    { value: "base64_decode", label: "Base64 Decode", desc: "Text-to-Binary recovery" },
    { value: "url_encode", label: "URL Encode", desc: "Convert string to percent-encoding" },
    { value: "url_decode", label: "URL Decode", desc: "Restore percent-encoded string" },
    { value: "html_encode", label: "HTML Entities Encode", desc: "Escape characters for HTML markup" },
    { value: "html_decode", label: "HTML Entities Decode", desc: "Restore standard characters" },
    { value: "binary_encode", label: "Binary Encode", desc: "Transform characters to 8-bit bytes" },
    { value: "binary_decode", label: "Binary Decode", desc: "Restore binary bytes to characters" },
    { value: "hex_encode", label: "Hexadecimal Encode", desc: "Convert string to base-16 notation" },
    { value: "hex_decode", label: "Hexadecimal Decode", desc: "Restore base-16 notation to text" },
  ];

  // Clipboard functionality
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      setPasted(true);
      setTimeout(() => setPasted(false), 2000);
    } catch (err) {
      // Fallback if clipboard API permission denied
      alert("Failed to read clipboard automatically. Please press Ctrl+V to paste manually.");
    }
  };

  const handleClear = () => {
    setText("");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (caseDropdownRef.current && !caseDropdownRef.current.contains(event.target)) {
        setIsCaseDropdownOpen(false);
      }
      if (cleanerDropdownRef.current && !cleanerDropdownRef.current.contains(event.target)) {
        setIsCleanerDropdownOpen(false);
      }
      if (encoderDropdownRef.current && !encoderDropdownRef.current.contains(event.target)) {
        setIsEncoderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ────────────────────────────────────────────────────────────────────────
     TAB 1: COUNTERS & STATS
     ──────────────────────────────────────────────────────────────────────── */
  const textStats = useMemo(() => {
    if (!text) {
      return {
        chars: 0,
        charsNoSpaces: 0,
        words: 0,
        lines: 0,
        sentences: 0,
        paragraphs: 0,
        uniqueWords: 0,
        readingTime: "0s",
        speakingTime: "0s",
        wordFreq: [],
        avgWordLength: 0,
        avgSentenceLength: 0,
      };
    }

    // Characters
    let charText = text;
    if (countersConfig.ignoreNumbers) {
      charText = charText.replace(/[0-9]/g, "");
    }
    if (countersConfig.ignorePunctuation) {
      charText = charText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
    }
    const chars = charText.length;
    const charsNoSpaces = charText.replace(/\s/g, "").length;

    // Lines
    const lines = text.split(/\r\n|\r|\n/).filter((l) => l.length > 0).length;

    // Sentences
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

    // Paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

    // Words & Frequency
    const cleanWordText = text
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ")
      .replace(/[0-9]/g, " ");

    const wordsArray = cleanWordText
      .split(/\s+/)
      .filter((w) => w.length > 0);

    const wordsCount = wordsArray.length;

    // Unique words and Frequency map
    const freqMap = {};
    let uniqueCount = 0;

    wordsArray.forEach((rawWord) => {
      let word = countersConfig.caseSensitiveFreq ? rawWord : rawWord.toLowerCase();
      
      // Stop word exclusion
      if (countersConfig.excludeStopWords && STOP_WORDS.has(word.toLowerCase())) {
        return;
      }

      if (!freqMap[word]) {
        freqMap[word] = 0;
        uniqueCount++;
      }
      freqMap[word]++;
    });

    const wordFreq = Object.entries(freqMap)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Reading & Speaking times
    const readWpm = countersConfig.readingWpm || 200;
    const speakWpm = countersConfig.speakingWpm || 130;
    
    const readSecondsTotal = Math.round((wordsCount / readWpm) * 60);
    const speakSecondsTotal = Math.round((wordsCount / speakWpm) * 60);

    const formatDuration = (totalSecs) => {
      if (totalSecs < 60) return `${totalSecs}s`;
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    };

    const readingTime = formatDuration(readSecondsTotal);
    const speakingTime = formatDuration(speakSecondsTotal);

    // Average lengths
    const avgWordLength = wordsCount > 0 ? parseFloat((charsNoSpaces / wordsCount).toFixed(1)) : 0;
    const avgSentenceLength = sentences > 0 ? parseFloat((wordsCount / sentences).toFixed(1)) : 0;

    return {
      chars,
      charsNoSpaces,
      words: wordsCount,
      lines,
      sentences,
      paragraphs,
      uniqueWords: uniqueCount,
      readingTime,
      speakingTime,
      wordFreq,
      avgWordLength,
      avgSentenceLength,
    };
  }, [text, countersConfig, STOP_WORDS]);

  /* ────────────────────────────────────────────────────────────────────────
     TAB 2: CASE CONVERTER LOGIC
     ──────────────────────────────────────────────────────────────────────── */
  const runCaseConversion = (type) => {
    if (!text) return;
    setSelectedCaseStyle(type);
    let output = "";

    const wordsOfText = (str) => {
      return str.trim().split(/\s+/).filter(Boolean);
    };

    switch (type) {
      case "upper":
        output = text.toUpperCase();
        break;
      case "lower":
        output = text.toLowerCase();
        break;
      case "title":
        output = text.toLowerCase().replace(/\b[a-z]/g, (letter, index) => {
          if (converterConfig.smartTitleCase) {
            // Check if it's an article/preposition in intermediate position
            const word = text.slice(index).split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, "");
            const isMinorWord = STOP_WORDS.has(word);
            const isFirst = index === 0;
            if (isMinorWord && !isFirst) {
              return letter;
            }
          }
          return letter.toUpperCase();
        });
        break;
      case "sentence":
        output = text
          .toLowerCase()
          .replace(/(^\s*|[.!?]\s+)([a-z])/g, (match, separator, letter) => {
            return separator + letter.toUpperCase();
          })
          // Auto-capitalize standalone "i"
          .replace(/\b(i)\b/g, "I")
          // Capitalize standard contractions starting with "i'"
          .replace(/\b(i'm)\b/g, "I'm")
          .replace(/\b(i'd)\b/g, "I'd")
          .replace(/\b(i'll)\b/g, "I'll")
          .replace(/\b(i've)\b/g, "I've");
        break;
      case "camel":
        {
          const words = wordsOfText(converterConfig.keepSpecialChars ? text : text.replace(/[^a-zA-Z0-9 ]/g, ""));
          output = words
            .map((word, index) => {
              const cleaned = word.toLowerCase();
              if (index === 0) return cleaned;
              return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            })
            .join("");
        }
        break;
      case "pascal":
        {
          const words = wordsOfText(converterConfig.keepSpecialChars ? text : text.replace(/[^a-zA-Z0-9 ]/g, ""));
          output = words
            .map((word) => {
              const cleaned = word.toLowerCase();
              return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            })
            .join("");
        }
        break;
      case "snake":
        {
          const delim = converterConfig.customDelimiter || "_";
          const words = wordsOfText(converterConfig.keepSpecialChars ? text : text.replace(/[^a-zA-Z0-9 ]/g, ""));
          output = words.map((w) => w.toLowerCase()).join(delim);
        }
        break;
      case "kebab":
        {
          const delim = converterConfig.customDelimiter || "-";
          const words = wordsOfText(converterConfig.keepSpecialChars ? text : text.replace(/[^a-zA-Z0-9 ]/g, ""));
          output = words.map((w) => w.toLowerCase()).join(delim);
        }
        break;
      case "alternating":
        output = text
          .split("")
          .map((char, index) => (index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
          .join("");
        break;
      case "inverse":
        output = text
          .split("")
          .map((char) => {
            if (char === char.toUpperCase()) return char.toLowerCase();
            return char.toUpperCase();
          })
          .join("");
        break;
      default:
        output = text;
    }
    setText(output);
  };

  /* ────────────────────────────────────────────────────────────────────────
     TAB 3: TEXT CLEANER LOGIC
     ──────────────────────────────────────────────────────────────────────── */
  const runTextCleaning = (action) => {
    if (!text) return;
    setSelectedCleanAction(action);
    let output = "";

    switch (action) {
      case "trim":
        output = text
          .split("\n")
          .map((line) => line.trim())
          .join("\n")
          .trim();
        break;
      case "remove_empty_lines":
        output = text
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "")
          .join("\n");
        break;
      case "remove_duplicate_lines":
        {
          const lines = text.split(/\r?\n/);
          const seen = new Set();
          const cleanLines = [];
          lines.forEach((line) => {
            if (!seen.has(line)) {
              seen.add(line);
              cleanLines.push(line);
            }
          });
          output = cleanLines.join("\n");
        }
        break;
      case "remove_extra_spaces":
        output = text.replace(/[ \t]+/g, " ");
        break;
      case "remove_line_breaks":
        output = text.replace(/\r?\n/g, cleanerConfig.joinSeparator || " ");
        break;
      case "strip_html":
        if (cleanerConfig.stripHtmlMode === "structural") {
          output = text.replace(/<\/?[a-zA-Z0-9]+[^>]*>/g, "");
        } else {
          output = text.replace(/<[^>]*>/g, "");
        }
        break;
      case "remove_punctuation":
        output = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
        break;
      case "remove_numbers":
        output = text.replace(/[0-9]/g, "");
        break;
      case "custom_regex":
        if (cleanerConfig.customRegexPattern) {
          try {
            const re = new RegExp(cleanerConfig.customRegexPattern, "g");
            output = text.replace(re, cleanerConfig.customRegexReplacement || "");
          } catch (e) {
            alert("Invalid custom regular expression pattern!");
            output = text;
          }
        } else {
          output = text;
        }
        break;
      default:
        output = text;
    }
    setText(output);
  };

  /* ────────────────────────────────────────────────────────────────────────
     TAB 4: FIND & REPLACE LOGIC
     ──────────────────────────────────────────────────────────────────────── */
  const matchDetails = useMemo(() => {
    const query = replaceConfig.findText;
    if (!query || !text) return { count: 0, htmlPreview: "" };

    try {
      let flags = "g";
      if (!replaceConfig.caseSensitive) flags += "i";
      if (replaceConfig.multiLine) flags += "m";

      let searchPattern = query;
      if (!replaceConfig.isRegex) {
        searchPattern = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      }

      if (replaceConfig.wholeWord) {
        searchPattern = `\\b${searchPattern}\\b`;
      }

      const regex = new RegExp(searchPattern, flags);
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;

      const escapeHtml = (unsafe) => {
        return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      let highlightedHtml = escapeHtml(text);
      const highlightRegex = new RegExp(
        replaceConfig.isRegex ? searchPattern : searchPattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
        flags
      );

      highlightedHtml = highlightedHtml.replace(highlightRegex, (matchedStr) => {
        return `<mark class="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 rounded-sm px-0.5 border-b-2 border-amber-500 font-medium">${matchedStr}</mark>`;
      });

      return { count, htmlPreview: highlightedHtml };
    } catch (e) {
      return { count: 0, htmlPreview: "Invalid Regex Pattern" };
    }
  }, [text, replaceConfig]);

  const runReplace = () => {
    const query = replaceConfig.findText;
    if (!query || !text) return;

    try {
      let flags = "g";
      if (!replaceConfig.caseSensitive) flags += "i";
      if (replaceConfig.multiLine) flags += "m";

      let searchPattern = query;
      if (!replaceConfig.isRegex) {
        searchPattern = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      }

      if (replaceConfig.wholeWord) {
        searchPattern = `\\b${searchPattern}\\b`;
      }

      const regex = new RegExp(searchPattern, flags);
      const replaced = text.replace(regex, replaceConfig.replaceText);
      setText(replaced);
    } catch (e) {
      alert("Error parsing regex. Verify pattern constraints.");
    }
  };

  /* ────────────────────────────────────────────────────────────────────────
     TAB 5: ENCODER & DECODER LOGIC
     ──────────────────────────────────────────────────────────────────────── */
  const runEncodingDecoding = (action) => {
    if (!text) return;
    setSelectedEncodeAction(action);
    let output = "";

    try {
      switch (action) {
        case "base64_encode":
          {
            const bytes = new TextEncoder().encode(text);
            const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
            let b64 = btoa(binString);
            if (encoderConfig.base64UrlSafe) {
              b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
            }
            output = b64;
          }
          break;
        case "base64_decode":
          {
            let cleanB64 = text.trim();
            if (encoderConfig.base64UrlSafe) {
              cleanB64 = cleanB64.replace(/-/g, "+").replace(/_/g, "/");
              while (cleanB64.length % 4) {
                cleanB64 += "=";
              }
            }
            const binString = atob(cleanB64);
            const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
            output = new TextDecoder().decode(bytes);
          }
          break;
        case "url_encode":
          output = encodeURIComponent(text);
          break;
        case "url_decode":
          output = decodeURIComponent(text);
          break;
        case "html_encode":
          {
            if (encoderConfig.htmlEntitiesAll) {
              output = text.split("").map((c) => `&#${c.charCodeAt(0)};`).join("");
            } else {
              output = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
            }
          }
          break;
        case "html_decode":
          {
            const doc = new DOMParser().parseFromString(text, "text/html");
            output = doc.documentElement.textContent || "";
          }
          break;
        case "binary_encode":
          {
            const spacer = encoderConfig.binarySpacer === "space" ? " " : encoderConfig.binarySpacer === "comma" ? "," : "";
            output = text
              .split("")
              .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
              .join(spacer);
          }
          break;
        case "binary_decode":
          {
            const cleanBinary = text.replace(/[\s,]/g, "");
            if (cleanBinary.length % 8 !== 0) {
              throw new Error("Binary representation length must be a multiple of 8.");
            }
            const bytes = [];
            for (let i = 0; i < cleanBinary.length; i += 8) {
              bytes.push(parseInt(cleanBinary.slice(i, i + 8), 2));
            }
            output = new TextDecoder().decode(new Uint8Array(bytes));
          }
          break;
        case "hex_encode":
          {
            output = text
              .split("")
              .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
              .join("");
          }
          break;
        case "hex_decode":
          {
            const cleanHex = text.replace(/[\s:]/g, "");
            if (cleanHex.length % 2 !== 0) {
              throw new Error("Hex representation length must be a multiple of 2.");
            }
            const bytes = [];
            for (let i = 0; i < cleanHex.length; i += 2) {
              bytes.push(parseInt(cleanHex.slice(i, i + 2), 16));
            }
            output = new TextDecoder().decode(new Uint8Array(bytes));
          }
          break;
        default:
          output = text;
      }
      setText(output);
    } catch (err) {
      alert(`Encoding/Decoding failed: ${err.message}. Verify that input data format matches the conversion style.`);
    }
  };

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="flex flex-col gap-6 md:gap-8 pt-8 font-sans w-full selection:bg-brandColor/20 text-[14px]">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 dark:border-gray-800 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brandColor text-white rounded-2xl shadow-lg shadow-brandColor/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
                Text Analyzer <span className="text-brandColor">Hub</span>
              </h1>
              <p className="text-[13px] md:text-[14px] text-gray-400 dark:text-gray-500 mt-0.5">
                The ultimate productivity workspace to count, convert, clean, search, and encode text.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-300 active:scale-95 shadow-sm
                ${
                  showAdvanced
                    ? "bg-brandColor/10 border-brandColor/30 text-brandColor"
                    : "bg-white dark:bg-gray-905 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Advanced Options
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-100/70 dark:bg-gray-900/60 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800/40">
          <button
            onClick={() => setActiveTab("counters")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all ${
              activeTab === "counters"
                ? "bg-white dark:bg-gray-800 text-brandColor dark:text-white shadow-md shadow-black/5"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Counters
          </button>
          <button
            onClick={() => setActiveTab("converter")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all ${
              activeTab === "converter"
                ? "bg-white dark:bg-gray-800 text-brandColor dark:text-white shadow-md shadow-black/5"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <Type className="w-4 h-4" />
            Case Style
          </button>
          <button
            onClick={() => setActiveTab("cleaner")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all ${
              activeTab === "cleaner"
                ? "bg-white dark:bg-gray-800 text-brandColor dark:text-white shadow-md shadow-black/5"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Cleaner
          </button>
          <button
            onClick={() => setActiveTab("replace")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all ${
              activeTab === "replace"
                ? "bg-white dark:bg-gray-800 text-brandColor dark:text-white shadow-md shadow-black/5"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <Search className="w-4 h-4" />
            Find & Replace
          </button>
          <button
            onClick={() => setActiveTab("encoder")}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all ${
              activeTab === "encoder"
                ? "bg-white dark:bg-gray-800 text-brandColor dark:text-white shadow-md shadow-black/5"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <Binary className="w-4 h-4" />
            Encode/Decode
          </button>
        </div>

        {/* Advanced Panel */}
        {showAdvanced && (
          <div className="bg-slate-50 dark:bg-gray-900/40 border border-slate-100 dark:border-gray-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {activeTab === "counters" && (
              <>
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-brandColor" /> Reading speed limits
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="text-[13px] text-gray-500 dark:text-gray-400 w-1/3">Reading WPM:</label>
                    <input
                      type="number"
                      min="50"
                      max="800"
                      value={countersConfig.readingWpm}
                      onChange={(e) => setCountersConfig({ ...countersConfig, readingWpm: parseInt(e.target.value) || 200 })}
                      className="w-24 px-3 py-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg outline-none focus:border-brandColor/50 text-[13px]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[13px] text-gray-500 dark:text-gray-400 w-1/3">Speaking WPM:</label>
                    <input
                      type="number"
                      min="50"
                      max="800"
                      value={countersConfig.speakingWpm}
                      onChange={(e) => setCountersConfig({ ...countersConfig, speakingWpm: parseInt(e.target.value) || 130 })}
                      className="w-24 px-3 py-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg outline-none focus:border-brandColor/50 text-[13px]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3.5">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-brandColor" /> Frequency & Character rules
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={countersConfig.caseSensitiveFreq}
                        onChange={(e) => setCountersConfig({ ...countersConfig, caseSensitiveFreq: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Case Sensitive Freq
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={countersConfig.excludeStopWords}
                        onChange={(e) => setCountersConfig({ ...countersConfig, excludeStopWords: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Exclude Stop Words
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={countersConfig.ignoreNumbers}
                        onChange={(e) => setCountersConfig({ ...countersConfig, ignoreNumbers: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Ignore Numbers
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={countersConfig.ignorePunctuation}
                        onChange={(e) => setCountersConfig({ ...countersConfig, ignorePunctuation: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Ignore Punctuation
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === "converter" && (
              <>
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-brandColor" /> Word joining configuration
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="text-[13px] text-gray-500 dark:text-gray-400">Snake/Kebab Joiner:</label>
                    <input
                      type="text"
                      maxLength="3"
                      value={converterConfig.customDelimiter}
                      onChange={(e) => setConverterConfig({ ...converterConfig, customDelimiter: e.target.value })}
                      className="w-14 px-3 py-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg outline-none focus:border-brandColor/50 text-[13px] text-center"
                    />
                    <span className="text-[11px] text-gray-400">Character used instead of space (default: _ or -)</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3.5">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-brandColor" /> Formatter rules
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={converterConfig.smartTitleCase}
                        onChange={(e) => setConverterConfig({ ...converterConfig, smartTitleCase: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Smart Title Case
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={converterConfig.keepSpecialChars}
                        onChange={(e) => setConverterConfig({ ...converterConfig, keepSpecialChars: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Keep Special Characters
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === "cleaner" && (
              <>
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-brandColor" /> Join & HTML rules
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="text-[13px] text-gray-500 dark:text-gray-400 w-1/3">Join lines with:</label>
                    <input
                      type="text"
                      value={cleanerConfig.joinSeparator}
                      onChange={(e) => setCleanerConfig({ ...cleanerConfig, joinSeparator: e.target.value })}
                      className="w-24 px-3 py-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg outline-none focus:border-brandColor/50 text-[13px]"
                      placeholder="e.g. space, comma"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[13px] text-gray-500 dark:text-gray-400 w-1/3">HTML Strip level:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCleanerConfig({ ...cleanerConfig, stripHtmlMode: "all" })}
                        className={`px-3 py-1 rounded-md text-[12px] font-bold border transition-all ${
                          cleanerConfig.stripHtmlMode === "all"
                            ? "bg-brandColor border-brandColor text-white"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        All tags
                      </button>
                      <button
                        onClick={() => setCleanerConfig({ ...cleanerConfig, stripHtmlMode: "structural" })}
                        className={`px-3 py-1 rounded-md text-[12px] font-bold border transition-all ${
                          cleanerConfig.stripHtmlMode === "structural"
                            ? "bg-brandColor border-brandColor text-white"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Structural only
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-brandColor" /> Custom Regular Expression pattern
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Regex Pattern (e.g. [a-z]+)"
                      value={cleanerConfig.customRegexPattern}
                      onChange={(e) => setCleanerConfig({ ...cleanerConfig, customRegexPattern: e.target.value })}
                      className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg outline-none focus:border-brandColor/50 text-[13px]"
                    />
                    <input
                      type="text"
                      placeholder="Replacement text"
                      value={cleanerConfig.customRegexReplacement}
                      onChange={(e) => setCleanerConfig({ ...cleanerConfig, customRegexReplacement: e.target.value })}
                      className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg outline-none focus:border-brandColor/50 text-[13px]"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "replace" && (
              <>
                <div className="flex flex-col gap-3.5 col-span-1 md:col-span-2">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-brandColor" /> Query modifiers
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={replaceConfig.caseSensitive}
                        onChange={(e) => setReplaceConfig({ ...replaceConfig, caseSensitive: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Case Sensitive
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={replaceConfig.wholeWord}
                        onChange={(e) => setReplaceConfig({ ...replaceConfig, wholeWord: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Match Whole Word
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={replaceConfig.isRegex}
                        onChange={(e) => setReplaceConfig({ ...replaceConfig, isRegex: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Use Regular Expression
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={replaceConfig.multiLine}
                        onChange={(e) => setReplaceConfig({ ...replaceConfig, multiLine: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Multiline matches
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === "encoder" && (
              <>
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Binary className="w-4 h-4 text-brandColor" /> Binary formatting
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="text-[13px] text-gray-500 dark:text-gray-400">Byte separator:</label>
                    <div className="flex gap-1.5">
                      {["space", "comma", "none"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setEncoderConfig({ ...encoderConfig, binarySpacer: mode })}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border capitalize transition-all ${
                            encoderConfig.binarySpacer === mode
                              ? "bg-brandColor border-brandColor text-white"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3.5">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-brandColor" /> Encoding modes
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={encoderConfig.htmlEntitiesAll}
                        onChange={(e) => setEncoderConfig({ ...encoderConfig, htmlEntitiesAll: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Encode All HTML Entities
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={encoderConfig.base64UrlSafe}
                        onChange={(e) => setEncoderConfig({ ...encoderConfig, base64UrlSafe: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-750 text-brandColor focus:ring-brandColor"
                      />
                      Base64 URL-safe Encoding
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Shared Text Input / Preview Workspace */}
        <div className="flex flex-col gap-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-brandColor rounded-full animate-pulse"></span>
              Workspace
            </span>
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/60 p-1 rounded-xl">
              <button
                onClick={handlePaste}
                className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-brandColor rounded-lg text-[13px] font-semibold transition-all hover:bg-white dark:hover:bg-gray-700"
                title="Paste from clipboard"
              >
                {pasted ? <Check className="w-3.5 h-3.5 text-green-500" /> : <ClipboardPaste className="w-3.5 h-3.5" />}
                {pasted ? "Pasted!" : "Paste"}
              </button>
              <button
                onClick={handleCopy}
                disabled={!text}
                className="flex items-center gap-1 px-3 py-1.5 text-gray-500 disabled:opacity-40 disabled:hover:text-gray-500 hover:text-brandColor rounded-lg text-[13px] font-semibold transition-all hover:bg-white dark:hover:bg-gray-700"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleClear}
                disabled={!text}
                className="flex items-center gap-1 px-3 py-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40 disabled:hover:text-gray-400 rounded-lg text-[13px] font-semibold transition-all hover:bg-white dark:hover:bg-gray-700"
                title="Clear content"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          <div className="relative w-full">
            <textarea
              className="w-full h-72 md:h-80 p-5 bg-gray-50/50 dark:bg-gray-850/30 rounded-2xl text-gray-700 dark:text-gray-200 placeholder-gray-400/80 dark:placeholder-gray-600 outline-none border border-transparent focus:border-brandColor/20 focus:ring-4 focus:ring-brandColor/5 transition-all resize-none text-[15px] leading-relaxed"
              placeholder="Start typing, insert, or paste text to begin parsing and transforming..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Quick Counter overview display always shown at the bottom of Workspace */}
          <div className="flex flex-wrap items-center justify-between border-t border-gray-50 dark:border-gray-800/40 pt-4 gap-4 text-[13px]">
            <div className="flex gap-5 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
              <div>
                Characters:{" "}
                <span className="text-gray-800 dark:text-gray-200 font-bold ml-1 text-[13px]">
                  {textStats.chars}
                </span>
              </div>
              <div>
                Words:{" "}
                <span className="text-gray-800 dark:text-gray-200 font-bold ml-1 text-[13px]">
                  {textStats.words}
                </span>
              </div>
              <div>
                Lines:{" "}
                <span className="text-gray-800 dark:text-gray-200 font-bold ml-1 text-[13px]">
                  {textStats.lines}
                </span>
              </div>
            </div>
            {text && (
              <div className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-900/10">
                ✓ Ready for operations
              </div>
            )}
          </div>
        </div>

        {/* Tab specific workspace action panels */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-855 rounded-3xl p-5 md:p-6 shadow-sm">
          {activeTab === "counters" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-[15px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
                <TrendingUp className="w-4 h-4 text-brandColor" /> Detailed Counter Statistics
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800/40">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Words</div>
                  <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">{textStats.words}</div>
                </div>
                <div className="bg-slate-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800/40">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Characters</div>
                  <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">{textStats.chars}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">({textStats.charsNoSpaces} without spaces)</div>
                </div>
                <div className="bg-slate-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800/40">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Lines</div>
                  <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">{textStats.lines}</div>
                </div>
                <div className="bg-slate-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800/40">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Sentences</div>
                  <div className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">{textStats.sentences}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">({textStats.paragraphs} paragraphs)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                {/* Time indicators */}
                <div className="col-span-1 flex flex-col gap-4">
                  <div className="bg-slate-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800/40 flex items-center gap-3">
                    <div className="p-2.5 bg-brandColor/10 text-brandColor rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Reading Time</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{textStats.readingTime}</div>
                      <div className="text-[10px] text-gray-400">Based on {countersConfig.readingWpm} WPM</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800/40 flex items-center gap-3">
                    <div className="p-2.5 bg-brandColor/10 text-brandColor rounded-xl">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Speaking Time</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{textStats.speakingTime}</div>
                      <div className="text-[10px] text-gray-400">Based on {countersConfig.speakingWpm} WPM</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-800/30 p-4 rounded-2xl border border-slate-100/50 dark:border-gray-800/40">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Text Averages</div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Avg. word length:</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{textStats.avgWordLength} chars</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Avg. sentence length:</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{textStats.avgSentenceLength} words</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Unique words count:</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{textStats.uniqueWords}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Word Frequency */}
                <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-gray-800/30 p-5 rounded-2xl border border-slate-100/50 dark:border-gray-800/40">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-250 dark:border-gray-750">
                    <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Top 10 Word Frequency</div>
                    {countersConfig.excludeStopWords && (
                      <span className="text-[10px] bg-brandColor/10 text-brandColor px-2 py-0.5 rounded font-semibold">
                        Stop Words Filtered
                      </span>
                    )}
                  </div>

                  {textStats.wordFreq.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-[13px]">
                      <FileText className="w-8 h-8 opacity-30 mb-2" />
                      Add text to compute word distribution.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-3 overflow-y-auto max-h-48 scrollbar-thin">
                      {textStats.wordFreq.map((item, idx) => {
                        const maxCount = textStats.wordFreq[0]?.count || 1;
                        const pct = Math.round((item.count / maxCount) * 100);
                        return (
                          <div key={idx} className="flex items-center gap-3 text-[13px]">
                            <span className="w-24 text-gray-600 dark:text-gray-300 truncate font-semibold">
                              {item.word}
                            </span>
                            <div className="flex-1 bg-gray-200/60 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-brandColor h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="w-8 text-right text-gray-500 font-bold">{item.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "converter" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-[15px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
                <Type className="w-4 h-4 text-brandColor" /> Case Conversions
              </h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Select Casing Layout</label>
                  
                  {/* Custom Dropdown Container */}
                  <div className="relative" ref={caseDropdownRef}>
                    <button
                      onClick={() => setIsCaseDropdownOpen(!isCaseDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-gray-800/40 hover:bg-slate-100 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-xl transition-all text-left text-gray-700 dark:text-gray-200 focus:outline-none"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-[14px]">
                          {caseOptions.find((o) => o.value === selectedCaseStyle)?.label}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">
                          {caseOptions.find((o) => o.value === selectedCaseStyle)?.desc}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCaseDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Animated Dropdown Menu */}
                    {isCaseDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-55 max-h-64 overflow-y-auto scrollbar-thin py-1 animate-scaleIn">
                        {caseOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSelectedCaseStyle(opt.value);
                              setIsCaseDropdownOpen(false);
                            }}
                            className={`w-full flex flex-col px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors
                              ${selectedCaseStyle === opt.value ? "bg-brandColor/5 dark:bg-brandColor/10" : ""}`}
                          >
                            <span className={`text-[13.5px] font-bold ${selectedCaseStyle === opt.value ? "text-brandColor dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                              {opt.label}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => runCaseConversion(selectedCaseStyle)}
                  disabled={!text}
                  className="sm:self-end px-6 py-3.5 bg-brandColor hover:bg-brandColor/90 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-brandColor/15 transition-all duration-300 active:scale-95 text-[13.5px]"
                >
                  Convert Case
                </button>
              </div>

              {/* Quick Case conversion buttons for faster access */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Quick convert options</span>
                <div className="flex flex-wrap gap-2">
                  {caseOptions.slice(0, 6).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => runCaseConversion(opt.value)}
                      disabled={!text}
                      className="px-3.5 py-2 text-[12.5px] font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-brandColor/30 dark:hover:border-brandColor/30 hover:text-brandColor dark:hover:text-brandColor/80 transition-all active:scale-95 disabled:opacity-40"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "cleaner" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-[15px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
                <Sparkles className="w-4 h-4 text-brandColor" /> Text Cleaner & Formatting Sanitizer
              </h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Sanitize Action</label>

                  {/* Custom Dropdown Container */}
                  <div className="relative" ref={cleanerDropdownRef}>
                    <button
                      onClick={() => setIsCleanerDropdownOpen(!isCleanerDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-gray-800/40 hover:bg-slate-100 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-xl transition-all text-left text-gray-700 dark:text-gray-200 focus:outline-none"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-[14px]">
                          {cleanerOptions.find((o) => o.value === selectedCleanAction)?.label}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">
                          {cleanerOptions.find((o) => o.value === selectedCleanAction)?.desc}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCleanerDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Animated Dropdown Menu */}
                    {isCleanerDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-55 max-h-64 overflow-y-auto scrollbar-thin py-1 animate-scaleIn">
                        {cleanerOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSelectedCleanAction(opt.value);
                              setIsCleanerDropdownOpen(false);
                            }}
                            className={`w-full flex flex-col px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors
                              ${selectedCleanAction === opt.value ? "bg-brandColor/5 dark:bg-brandColor/10" : ""}`}
                          >
                            <span className={`text-[13.5px] font-bold ${selectedCleanAction === opt.value ? "text-brandColor dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                              {opt.label}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => runTextCleaning(selectedCleanAction)}
                  disabled={!text}
                  className="sm:self-end px-6 py-3.5 bg-brandColor hover:bg-brandColor/90 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-brandColor/15 transition-all duration-300 active:scale-95 text-[13.5px]"
                >
                  Run Cleaner
                </button>
              </div>

              {/* Clean shortcuts for high frequency commands */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Quick clean shortcuts</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runTextCleaning("trim")}
                    disabled={!text}
                    className="px-3 py-1.5 text-[12.5px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-brandColor/35 transition-all disabled:opacity-40"
                  >
                    Trim spaces
                  </button>
                  <button
                    onClick={() => runTextCleaning("remove_empty_lines")}
                    disabled={!text}
                    className="px-3 py-1.5 text-[12.5px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-brandColor/35 transition-all disabled:opacity-40"
                  >
                    Remove empty lines
                  </button>
                  <button
                    onClick={() => runTextCleaning("remove_duplicate_lines")}
                    disabled={!text}
                    className="px-3 py-1.5 text-[12.5px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-brandColor/35 transition-all disabled:opacity-40"
                  >
                    Deduplicate lines
                  </button>
                  <button
                    onClick={() => runTextCleaning("remove_extra_spaces")}
                    disabled={!text}
                    className="px-3 py-1.5 text-[12.5px] font-bold rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-brandColor/35 transition-all disabled:opacity-40"
                  >
                    Strip extra spaces
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "replace" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-[15px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
                <Search className="w-4 h-4 text-brandColor" /> Dynamic Find & Replace
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Find text or regex pattern</label>
                  <input
                    type="text"
                    value={replaceConfig.findText}
                    onChange={(e) => setReplaceConfig({ ...replaceConfig, findText: e.target.value })}
                    className="px-4 py-3 border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 rounded-xl outline-none focus:border-brandColor/50 focus:bg-white dark:focus:bg-gray-900 text-[13.5px]"
                    placeholder="Type pattern to match..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Replace with</label>
                  <input
                    type="text"
                    value={replaceConfig.replaceText}
                    onChange={(e) => setReplaceConfig({ ...replaceConfig, replaceText: e.target.value })}
                    className="px-4 py-3 border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 rounded-xl outline-none focus:border-brandColor/50 focus:bg-white dark:focus:bg-gray-900 text-[13.5px]"
                    placeholder="Type replacement text..."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-gray-50 dark:border-gray-800/40 pt-4">
                <div className="text-[13px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-brandColor" />
                  {replaceConfig.findText ? (
                    <span>
                      Found <strong className="text-brandColor dark:text-white font-bold">{matchDetails.count}</strong> occurrences.
                    </span>
                  ) : (
                    <span>Enter search criteria to find matches.</span>
                  )}
                </div>

                <button
                  onClick={runReplace}
                  disabled={!text || !replaceConfig.findText}
                  className="px-6 py-3 bg-brandColor hover:bg-brandColor/90 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-brandColor/15 transition-all duration-300 active:scale-95 text-[13.5px]"
                >
                  Replace All
                </button>
              </div>

              {/* Match Highlights Live Preview Container */}
              {replaceConfig.findText && text && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Highlighted Match Preview
                  </div>
                  <div
                    className="w-full max-h-44 overflow-y-auto p-4 border border-slate-105 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/60 rounded-2xl text-[14px] leading-relaxed break-words whitespace-pre-wrap text-gray-700 dark:text-gray-300 scrollbar-thin"
                    dangerouslySetInnerHTML={{ __html: matchDetails.htmlPreview }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "encoder" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-[15px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
                <Binary className="w-4 h-4 text-brandColor" /> Text Encoding & Decoding Workspace
              </h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Select Codec</label>

                  {/* Custom Dropdown Container */}
                  <div className="relative" ref={encoderDropdownRef}>
                    <button
                      onClick={() => setIsEncoderDropdownOpen(!isEncoderDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-gray-800/40 hover:bg-slate-100 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-800 rounded-xl transition-all text-left text-gray-700 dark:text-gray-200 focus:outline-none"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-[14px]">
                          {encoderOptions.find((o) => o.value === selectedEncodeAction)?.label}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">
                          {encoderOptions.find((o) => o.value === selectedEncodeAction)?.desc}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isEncoderDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Animated Dropdown Menu */}
                    {isEncoderDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-55 max-h-64 overflow-y-auto scrollbar-thin py-1 animate-scaleIn">
                        {encoderOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSelectedEncodeAction(opt.value);
                              setIsEncoderDropdownOpen(false);
                            }}
                            className={`w-full flex flex-col px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors
                              ${selectedEncodeAction === opt.value ? "bg-brandColor/5 dark:bg-brandColor/10" : ""}`}
                          >
                            <span className={`text-[13.5px] font-bold ${selectedEncodeAction === opt.value ? "text-brandColor dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                              {opt.label}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => runEncodingDecoding(selectedEncodeAction)}
                  disabled={!text}
                  className="sm:self-end px-6 py-3.5 bg-brandColor hover:bg-brandColor/90 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-brandColor/15 transition-all duration-300 active:scale-95 text-[13.5px]"
                >
                  Run Conversion
                </button>
              </div>

              {/* Fast switch toggle codecs */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Common quick codecs</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runEncodingDecoding("base64_encode")}
                    disabled={!text}
                    className="px-3.5 py-2 text-[12.5px] font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-350 hover:border-brandColor/35 transition-all disabled:opacity-40"
                  >
                    Base64 Encode
                  </button>
                  <button
                    onClick={() => runEncodingDecoding("base64_decode")}
                    disabled={!text}
                    className="px-3.5 py-2 text-[12.5px] font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-350 hover:border-brandColor/35 transition-all disabled:opacity-40"
                  >
                    Base64 Decode
                  </button>
                  <button
                    onClick={() => runEncodingDecoding("url_encode")}
                    disabled={!text}
                    className="px-3.5 py-2 text-[12.5px] font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-350 hover:border-brandColor/35 transition-all disabled:opacity-40"
                  >
                    URL Encode
                  </button>
                  <button
                    onClick={() => runEncodingDecoding("url_decode")}
                    disabled={!text}
                    className="px-3.5 py-2 text-[12.5px] font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-355 hover:border-brandColor/35 transition-all disabled:opacity-40"
                  >
                    URL Decode
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic bottom information panel matching user requirements */}
        <div className="bg-slate-50/70 dark:bg-gray-900/40 border border-slate-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-gray-800/80 pb-3">
            <HelpCircle className="w-5 h-5 text-brandColor" />
            <h3 className="text-[14px] font-bold text-gray-700 dark:text-gray-300">
              Understanding {activeTab === "counters" && "Stats & Estimation Metrics"}
              {activeTab === "converter" && "Case Styling Schemas"}
              {activeTab === "cleaner" && "Text Sanitation Operations"}
              {activeTab === "replace" && "Pattern Find & Replace Rules"}
              {activeTab === "encoder" && "Standard Encoding Transformations"}
            </h3>
          </div>

          <div className="text-[13.5px] leading-relaxed text-gray-500 dark:text-gray-400 flex flex-col gap-3">
            {activeTab === "counters" && (
              <>
                <p>
                  Our analyzer counts text metrics in real-time as you type, ignoring formatting details to preserve raw totals.
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-1">
                  <li><strong>Words count</strong>: Splits based on whitespace blocks, ignoring numerical digits or punctuation when parsing boundaries.</li>
                  <li><strong>Reading Time estimation</strong>: Derived from a global average adult reading threshold of 200 Words Per Minute (WPM). Adjustable inside the Advanced Options.</li>
                  <li><strong>Speaking Time estimation</strong>: Derived from public speaking thresholds averaging 130 Words Per Minute (WPM).</li>
                  <li><strong>Unique words frequency</strong>: Maps top recurring words to highlight theme prominence. Useful for SEO keyword checking.</li>
                </ul>
              </>
            )}

            {activeTab === "converter" && (
              <>
                <p>
                  Easily normalize or format your strings into coding styles or structured schemas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300 text-[13px]">Coding Formats:</h4>
                    <ul className="list-disc pl-5 mt-1 flex flex-col gap-1 text-[13px]">
                      <li><strong>camelCase</strong>: Removes spaces, lowercases first word, capitalizes others.</li>
                      <li><strong>PascalCase</strong>: Removes spaces, capitalizes every word.</li>
                      <li><strong>snake_case</strong>: Replaces spaces with underscores. Customizable joiners in advanced configurations.</li>
                      <li><strong>kebab-case</strong>: Replaces spaces with dashes/hyphens.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300 text-[13px]">Writing Formats:</h4>
                    <ul className="list-disc pl-5 mt-1 flex flex-col gap-1 text-[13px]">
                      <li><strong>Sentence case</strong>: Capitalizes first character of sentences, keeping the rest lowercase. Auto-corrects personal pronouns (e.g. &apos;I&apos;).</li>
                      <li><strong>Title Case</strong>: Capitalizes all word beginnings. Enable &quot;Smart Title Case&quot; to automatically bypass prepositions.</li>
                      <li><strong>Alternating & Inverse</strong>: Primarily used for artistic stylization or correcting accidental Caps Lock.</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {activeTab === "cleaner" && (
              <>
                <p>
                  Clean text logs, lists, copy documents, or scrapings to eliminate structural formatting noise.
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-1">
                  <li><strong>Trim lines</strong>: Clears spaces at the boundary of line breaks.</li>
                  <li><strong>Remove empty lines</strong>: Completely removes line spaces containing zero alphanumeric entries.</li>
                  <li><strong>Remove duplicate lines</strong>: Removes duplicate lines. Useful to sanitize unique email lists or IDs.</li>
                  <li><strong>Strip HTML Tags</strong>: Removes tag elements (`&lt;div&gt;`, `&lt;a&gt;`) to recover plain copy text. Choose structural vs all in advanced configurations.</li>
                </ul>
              </>
            )}

            {activeTab === "replace" && (
              <>
                <p>
                  Powerful inline search and replace toolkit, incorporating both standard text scanning and Regular Expressions (Regex).
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-1">
                  <li><strong>Case Sensitive</strong>: Toggles whether uppercase and lowercase letters are treated as unique matches.</li>
                  <li><strong>Whole Word</strong>: Employs boundary matching markers (`\b`) to prevent replacing substrings within larger words.</li>
                  <li><strong>Regular Expression</strong>: Standard JS engine parsing. Enables patterns like `\d+` to target numbers or `[a-z]+` to target words.</li>
                </ul>
              </>
            )}

            {activeTab === "encoder" && (
              <>
                <p>
                  Transcribe standard characters into alternative formats for data transfer, developers testing, or encoding parameters.
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-1">
                  <li><strong>Base64</strong>: Encodes binary formats to ascii-safe text schemas. Safe for transmission across networks.</li>
                  <li><strong>URL Percent Encoding</strong>: Escapes structural characters (like `?`, `&`, `=`) to safely pass strings as URL query variables.</li>
                  <li><strong>HTML Entities</strong>: Converts characters to XML-safe entities (`&amp;` for `&`) to prevent code execution in markup.</li>
                  <li><strong>Binary & Hex</strong>: Encodes characters to raw computer representations (8-bit binary strings or base-16 strings).</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
