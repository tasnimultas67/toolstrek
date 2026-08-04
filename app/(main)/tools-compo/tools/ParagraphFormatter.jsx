"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  Sparkles,
  Copy,
  Download,
  Upload,
  Check,
  Settings2,
  FileText,
  ChevronDown,
  CaseSensitive,
  ArrowUpAZ,
  List,
  FileCode,
  Eye,
  RefreshCw,
  BookOpen,
  ClipboardCheck,
  AlertCircle
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// Pre-defined sample paragraphs for quick check
const SAMPLE_TEXT = `Online utility hubs like ToolsTrek provide developers and content creators with highly efficient tools that save hours of manual styling. This paragraph is designed to test how text alignment and first-line indentation render on both desktop and mobile viewports.

another short paragraph to test sentence case and cleanup. it has multiple spaces   between words and some trailing punctuation. we want to make sure it looks standard and polished after formatting.

A paragraph formatter should allow users to configure alignments (left, center, right, justify) along with line height and spacing options. By adjusting these visual attributes, the text content becomes considerably easier to read and scan. This ultimately results in an enhanced reader experience.`;

export default function ParagraphFormatter() {
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState("preview"); // preview, plain, html
  const [activeMobileTab, setActiveMobileTab] = useState("input"); // input, output

  // Format configurations
  const [alignment, setAlignment] = useState("left"); // left, center, right, justify
  const [lineSpacing, setLineSpacing] = useState("1.5"); // 1.0, 1.15, 1.5, 2.0
  const [paragraphSpacing, setParagraphSpacing] = useState("medium"); // none, small, medium, large
  const [indentStyle, setIndentStyle] = useState("none"); // none, 2-spaces, 4-spaces, tab, 1em, 2em
  const [caseStyle, setCaseStyle] = useState("none"); // none, sentence, title, upper, lower, capitalize
  const [listStyle, setListStyle] = useState("none"); // none, bullet, numbered
  const [sortStyle, setSortStyle] = useState("none"); // none, asc, desc, length-asc, length-desc

  // Cleanups toggles
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [removeBlankLines, setRemoveBlankLines] = useState(false);
  const [mergeLineBreaks, setMergeLineBreaks] = useState(false);

  // Interaction feedback states
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const inputGutterRef = useRef(null);
  const inputTextareaRef = useRef(null);

  // Pre-load sample
  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
    setErrorMsg("");
    setSuccessMsg("Sample paragraphs loaded!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Sync scroll for textarea lines representation
  const handleInputScroll = (e) => {
    if (inputGutterRef.current) {
      inputGutterRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Clean raw file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setInputText(text || "");
      setErrorMsg("");
      setSuccessMsg(`Loaded "${file.name}" successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read the file.");
    };
    reader.readAsText(file);
  };

  // Clear textareas
  const handleClear = () => {
    setInputText("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Case style helper algorithms
  const toSentenceCase = (str) => {
    if (!str) return "";
    return str.split("\n").map(line => {
      if (!line) return "";
      // Matches start of text or any char after sentence delimiters (. ! ?), followed by spaces
      return line.replace(/(?:^|[.!?]\s+)([a-z])/g, (match) => match.toUpperCase());
    }).join("\n");
  };

  const toTitleCase = (str) => {
    if (!str) return "";
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v\.?|via|vs\.?)$/i;
    return str.split("\n").map(line => {
      return line.split(/\s+/).map((word, index, arr) => {
        if (!word) return "";
        const cleanWord = word.replace(/[^a-zA-Z]/g, "");
        if (index > 0 && index < arr.length - 1 && smallWords.test(cleanWord)) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(" ");
    }).join("\n");
  };

  const toCapitalizeEachWord = (str) => {
    if (!str) return "";
    return str.split("\n").map(line => {
      return line.split(/\s+/).map(word => {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(" ");
    }).join("\n");
  };

  // Main Live Formatter Logic
  const formattedText = useMemo(() => {
    if (!inputText) return "";

    let processed = inputText;

    // 1. Merge Line Breaks (Hard Wrap to Soft Wrap)
    if (mergeLineBreaks) {
      processed = processed.replace(/\r\n/g, "\n");
      processed = processed
        .replace(/\n\n+/g, "___PARAGRAPH_BREAK___")
        .replace(/\n/g, " ")
        .replace(/___PARAGRAPH_BREAK___/g, "\n\n");
    }

    // 2. Split into Paragraph segments
    let paragraphs = processed.split(/\n\n+/);

    // 3. Process each Paragraph individually
    paragraphs = paragraphs.map((para) => {
      let pText = para;

      // Trim lines inside the paragraph block
      if (trimLines) {
        pText = pText
          .split("\n")
          .map((line) => line.trim())
          .join("\n");
      }

      // Collapse multiple consecutive spaces and tabs
      if (collapseSpaces) {
        pText = pText.replace(/[ \t]+/g, " ");
      }

      // Apply Case Styling
      if (caseStyle === "upper") {
        pText = pText.toUpperCase();
      } else if (caseStyle === "lower") {
        pText = pText.toLowerCase();
      } else if (caseStyle === "sentence") {
        pText = toSentenceCase(pText);
      } else if (caseStyle === "title") {
        pText = toTitleCase(pText);
      } else if (caseStyle === "capitalize") {
        pText = toCapitalizeEachWord(pText);
      }

      // Prepend string indentation
      if (indentStyle === "2-spaces") {
        pText = "  " + pText;
      } else if (indentStyle === "4-spaces") {
        pText = "    " + pText;
      } else if (indentStyle === "tab") {
        pText = "\t" + pText;
      }

      return pText;
    });

    // 4. Remove empty lines/paragraphs
    if (removeBlankLines) {
      paragraphs = paragraphs.filter((p) => p.replace(/\s/g, "").length > 0);
    }

    // 5. Sort Paragraphs
    if (sortStyle === "asc") {
      paragraphs.sort((a, b) => a.localeCompare(b));
    } else if (sortStyle === "desc") {
      paragraphs.sort((a, b) => b.localeCompare(a));
    } else if (sortStyle === "length-asc") {
      paragraphs.sort((a, b) => a.length - b.length);
    } else if (sortStyle === "length-desc") {
      paragraphs.sort((a, b) => b.length - a.length);
    }

    // 6. Apply bullet / numbered listings
    if (listStyle === "bullet") {
      paragraphs = paragraphs.map((p) => "• " + p);
    } else if (listStyle === "numbered") {
      paragraphs = paragraphs.map((p, idx) => `${idx + 1}. ${p}`);
    }

    // 7. Reassemble
    const separator = paragraphSpacing === "none" ? "\n" : "\n\n";
    return paragraphs.join(separator);
  }, [
    inputText,
    alignment,
    lineSpacing,
    paragraphSpacing,
    indentStyle,
    caseStyle,
    listStyle,
    sortStyle,
    trimLines,
    collapseSpaces,
    removeBlankLines,
    mergeLineBreaks
  ]);

  // Syllables count estimator
  const countSyllables = (word) => {
    let cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
    if (cleanWord.length <= 3) return 1;
    cleanWord = cleanWord.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    cleanWord = cleanWord.replace(/^y/, "");
    const vowels = cleanWord.match(/[aeiouy]{1,2}/g);
    return vowels ? vowels.length : 1;
  };

  // Text Statistics Panel Calculation
  const stats = useMemo(() => {
    if (!inputText.trim()) {
      return {
        charsWithSpaces: 0,
        charsWithoutSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: "0 sec",
        readabilityScore: 100,
        readabilityGrade: "N/A"
      };
    }

    const cleanText = inputText.trim();
    const charsWithSpaces = inputText.length;
    const charsWithoutSpaces = inputText.replace(/\s/g, "").length;
    const words = cleanText.split(/\s+/).length;
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
    const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim().length > 0).length || 1;

    // Reading time (average 200 words per minute)
    const readingTimeSeconds = Math.round((words / 200) * 60);
    const readingTime = readingTimeSeconds < 60 ? `${readingTimeSeconds} sec` : `${Math.ceil(words / 200)} min`;

    // Readability rating
    let totalSyllables = 0;
    cleanText.split(/\s+/).forEach(w => {
      totalSyllables += countSyllables(w);
    });

    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words);
    const readabilityScore = Math.max(0, Math.min(100, Math.round(score)));

    let readabilityGrade = "Standard";
    if (readabilityScore >= 90) readabilityGrade = "Very Easy (5th Grade)";
    else if (readabilityScore >= 80) readabilityGrade = "Easy (6th Grade)";
    else if (readabilityScore >= 70) readabilityGrade = "Fairly Easy (7th Grade)";
    else if (readabilityScore >= 60) readabilityGrade = "Standard (8th-9th Grade)";
    else if (readabilityScore >= 50) readabilityGrade = "Fairly Difficult (High School)";
    else if (readabilityScore >= 30) readabilityGrade = "Difficult (College)";
    else readabilityGrade = "Very Difficult (Graduate)";

    return {
      charsWithSpaces,
      charsWithoutSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      readabilityScore,
      readabilityGrade
    };
  }, [inputText]);

  // Map visual bottom margins
  const spacingStyle = useMemo(() => {
    switch (paragraphSpacing) {
      case "none": return "0px";
      case "small": return "12px";
      case "medium": return "20px";
      case "large": return "32px";
      default: return "20px";
    }
  }, [paragraphSpacing]);

  // CSS Text indent
  const textIndentStyle = useMemo(() => {
    if (indentStyle === "1em") return "1em";
    if (indentStyle === "2em") return "2em";
    return "0px";
  }, [indentStyle]);

  // Output list of paragraphs as string arrays for preview rendering
  const previewParagraphsList = useMemo(() => {
    if (!formattedText) return [];
    return formattedText.split(paragraphSpacing === "none" ? "\n" : "\n\n");
  }, [formattedText, paragraphSpacing]);

  // HTML Markup string builder
  const htmlOutputString = useMemo(() => {
    if (!formattedText) return "";
    let inlineStyle = "";
    if (alignment !== "left") inlineStyle += `text-align: ${alignment}; `;
    if (lineSpacing !== "1.0") inlineStyle += `line-height: ${lineSpacing}; `;
    if (spacingStyle !== "0px") inlineStyle += `margin-bottom: ${spacingStyle}; `;
    if (textIndentStyle !== "0px") inlineStyle += `text-indent: ${textIndentStyle}; `;

    const styleAttr = inlineStyle ? ` style="${inlineStyle.trim()}"` : "";
    const paragraphs = formattedText.split(paragraphSpacing === "none" ? "\n" : "\n\n");

    return paragraphs
      .map((p) => `<p${styleAttr}>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
      .join("\n");
  }, [formattedText, alignment, lineSpacing, spacingStyle, textIndentStyle, paragraphSpacing]);

  // Handle visual, raw text or HTML copies
  const handleCopy = () => {
    const textToCopy = activeTab === "html" ? htmlOutputString : formattedText;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setSuccessMsg("Copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        setSuccessMsg("");
      }, 2000);
    });
  };

  // Download files
  const handleDownload = () => {
    const textToDownload = activeTab === "html" ? htmlOutputString : formattedText;
    if (!textToDownload.trim()) return;

    const fileType = activeTab === "html" ? "text/html" : "text/plain";
    const extension = activeTab === "html" ? "html" : "txt";

    const blob = new Blob([textToDownload], { type: `${fileType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted-paragraphs.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMsg("File downloaded!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Pre-load layout sizing metrics
  const lineCount = inputText.split("\n").length || 1;

  return (
    <ToolPageShell className="px-3 py-6 max-w-7xl mx-auto">
      {/* Container wrapper enforcing minimum responsive font sizes */}
      <div className="flex flex-col gap-6 text-[12px] md:text-[14px]">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brandColor/15 rounded-xl border border-brandColor/20 text-brandColor">
              <AlignLeft className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Paragraph Formatter & Aligner
              </h1>
              <p className="text-[12px] md:text-[14px] text-gray-500 dark:text-gray-400">
                Format, align, clean, indent, and adjust line spacing of text blocks with professional controls.
              </p>
            </div>
          </div>
        </div>

        {/* Outer Grid Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Format Options Sidebar */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col gap-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-gray-800">
              <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-[12px] md:text-[14px]">
                <Settings2 className="w-4 h-4 text-brandColor" />
                Format Options
              </span>
            </div>

            {/* Alignments Button Grid */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-[12px] md:text-[14px]">
                Text Alignment
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-gray-105 dark:bg-gray-950 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                {[
                  { value: "left", icon: AlignLeft, title: "Left" },
                  { value: "center", icon: AlignCenter, title: "Center" },
                  { value: "right", icon: AlignRight, title: "Right" },
                  { value: "justify", icon: AlignJustify, title: "Justify" }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setAlignment(item.value)}
                      title={item.title}
                      className={`py-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        alignment === item.value
                          ? "bg-brandColor text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Line Spacing Selector */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1.5 text-[12px] md:text-[14px]">
                Line Spacing
              </label>
              <div className="relative">
                <select
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                >
                  <option value="1.0">Single (1.0)</option>
                  <option value="1.15">Compact (1.15)</option>
                  <option value="1.5">Standard (1.5)</option>
                  <option value="2.0">Double (2.0)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Paragraph Spacing (Margin Bottom) */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1.5 text-[12px] md:text-[14px]">
                Paragraph Spacing
              </label>
              <div className="relative">
                <select
                  value={paragraphSpacing}
                  onChange={(e) => setParagraphSpacing(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                >
                  <option value="none">None (0px / Single Line Break)</option>
                  <option value="small">Small (12px / Margin)</option>
                  <option value="medium">Medium (20px / Margin)</option>
                  <option value="large">Large (32px / Margin)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Indentation configuration */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1.5 text-[12px] md:text-[14px]">
                First-Line Indentation
              </label>
              <div className="relative">
                <select
                  value={indentStyle}
                  onChange={(e) => setIndentStyle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                >
                  <option value="none">No Indent</option>
                  <option value="2-spaces">Prepend 2 Spaces</option>
                  <option value="4-spaces">Prepend 4 Spaces</option>
                  <option value="tab">Prepend Tab Character</option>
                  <option value="1em">CSS Indentation (1em)</option>
                  <option value="2em">CSS Indentation (2em)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Case conversion */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1.5 text-[12px] md:text-[14px]">
                Case Style
              </label>
              <div className="relative">
                <select
                  value={caseStyle}
                  onChange={(e) => setCaseStyle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                >
                  <option value="none">No Case Change</option>
                  <option value="sentence">Sentence case</option>
                  <option value="title">Title Case</option>
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="capitalize">Capitalize Each Word</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Lists Formatting */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1.5 text-[12px] md:text-[14px]">
                List Prefix
              </label>
              <div className="relative">
                <select
                  value={listStyle}
                  onChange={(e) => setListStyle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                >
                  <option value="none">Plain Paragraphs</option>
                  <option value="bullet">Bulleted List (•)</option>
                  <option value="numbered">Numbered List (1. 2. 3.)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Paragraph Sorting */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1.5 text-[12px] md:text-[14px]">
                Sort Order
              </label>
              <div className="relative">
                <select
                  value={sortStyle}
                  onChange={(e) => setSortStyle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                >
                  <option value="none">No Sorting</option>
                  <option value="asc">Alphabetical (A - Z)</option>
                  <option value="desc">Alphabetical (Z - A)</option>
                  <option value="length-asc">Length (Shortest to Longest)</option>
                  <option value="length-desc">Length (Longest to Shortest)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Cleanup Option Toggles */}
            <div className="flex flex-col gap-3 pt-2">
              <label className="block text-gray-700 dark:text-gray-300 font-medium pb-1 border-b border-gray-150 dark:border-gray-800 text-[12px] md:text-[14px]">
                Cleanup Settings
              </label>

              {/* Trim whitespace */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-medium text-gray-800 dark:text-gray-200 text-[12px] md:text-[14px]">
                    Trim lines
                  </span>
                  <span className="text-[10px] md:text-[12px] text-gray-500 dark:text-gray-400">
                    Remove edge spaces
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={trimLines}
                  onChange={(e) => setTrimLines(e.target.checked)}
                  className="w-4.5 h-4.5 accent-brandColor cursor-pointer"
                />
              </div>

              {/* Collapse spaces */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-medium text-gray-800 dark:text-gray-200 text-[12px] md:text-[14px]">
                    Collapse spaces
                  </span>
                  <span className="text-[10px] md:text-[12px] text-gray-500 dark:text-gray-400">
                    Fix double spaces
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={collapseSpaces}
                  onChange={(e) => setCollapseSpaces(e.target.checked)}
                  className="w-4.5 h-4.5 accent-brandColor cursor-pointer"
                />
              </div>

              {/* Merge single line breaks */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-medium text-gray-800 dark:text-gray-200 text-[12px] md:text-[14px]">
                    Merge line breaks
                  </span>
                  <span className="text-[10px] md:text-[12px] text-gray-500 dark:text-gray-400">
                    Convert hard wraps
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={mergeLineBreaks}
                  onChange={(e) => setMergeLineBreaks(e.target.checked)}
                  className="w-4.5 h-4.5 accent-brandColor cursor-pointer"
                />
              </div>

              {/* Remove blank lines */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-medium text-gray-800 dark:text-gray-200 text-[12px] md:text-[14px]">
                    Remove blank lines
                  </span>
                  <span className="text-[10px] md:text-[12px] text-gray-500 dark:text-gray-400">
                    Delete empty lines
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={removeBlankLines}
                  onChange={(e) => setRemoveBlankLines(e.target.checked)}
                  className="w-4.5 h-4.5 accent-brandColor cursor-pointer"
                />
              </div>
            </div>

            {/* Sidebar bottom actions */}
            <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-gray-150 dark:border-gray-800">
              <button
                onClick={handleLoadSample}
                className="w-full py-2 bg-gray-105 hover:bg-gray-200 dark:bg-gray-950 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-800 font-semibold rounded-xl text-center transition-all cursor-pointer text-[12px] md:text-[14px]"
              >
                Load Sample
              </button>
              <button
                onClick={handleClear}
                className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 font-semibold rounded-xl text-center transition-all cursor-pointer text-[12px] md:text-[14px]"
              >
                Clear All
              </button>
            </div>

          </div>

          {/* Editors Workspace Section */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Top Toolbar panel */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800">
              
              {/* File Upload trigger */}
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium border border-gray-300 dark:border-gray-700 transition-colors cursor-pointer text-[12px] md:text-[14px]">
                  <Upload className="w-4 h-4 text-brandColor" />
                  Upload Text File
                  <input
                    type="file"
                    accept=".txt,.md,.rtf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Status notifications */}
              <div className="flex items-center gap-3">
                {successMsg && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[12px] md:text-[14px] flex items-center gap-1">
                    <Check className="w-4 h-4 animate-bounce" /> {successMsg}
                  </span>
                )}
                {errorMsg && (
                  <span className="text-red-600 dark:text-red-400 font-medium text-[12px] md:text-[14px] flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile View Tab Controls (Input vs Output) */}
            <div className="flex lg:hidden bg-gray-100 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setActiveMobileTab("input")}
                className={`flex-1 py-2 rounded-lg text-center font-semibold transition-all text-[12px] md:text-[14px] cursor-pointer ${
                  activeMobileTab === "input"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Source Input ({lineCount} lines)
              </button>
              <button
                onClick={() => setActiveMobileTab("output")}
                className={`flex-1 py-2 rounded-lg text-center font-semibold transition-all text-[12px] md:text-[14px] cursor-pointer ${
                  activeMobileTab === "output"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Formatted View
              </button>
            </div>

            {/* Dual Panel Editor Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[450px] md:h-[550px]">
              
              {/* Left Panel: Raw text input */}
              <div
                className={`flex flex-col bg-[#1e1e1e] rounded-2xl border border-gray-800/80 overflow-hidden h-full ${
                  activeMobileTab !== "input" ? "hidden lg:flex" : "flex"
                }`}
              >
                {/* Input Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#181818] border-b border-gray-800/50 select-none">
                  <span className="font-semibold text-gray-400 flex items-center gap-2 text-[12px] md:text-[14px]">
                    <FileText className="w-4 h-4 text-brandColor" />
                    Input Paragraphs
                  </span>
                  <span className="text-[11px] md:text-[12px] text-gray-500 font-mono">
                    {inputText.length} chars
                  </span>
                </div>

                {/* Input Body (Gutter + Textarea) */}
                <div className="flex flex-1 overflow-hidden">
                  
                  {/* Dynamic gutter counter */}
                  <div
                    ref={inputGutterRef}
                    className="select-none text-right pr-3 text-gray-600 font-mono py-4 border-r border-gray-800/40 bg-[#161616] overflow-hidden w-12 text-[12px] md:text-[14px] h-full flex-shrink-0"
                  >
                    {Array.from({ length: Math.max(1, lineCount) }).map((_, idx) => (
                      <div key={idx} className="h-[21px] leading-[21px]">
                        {idx + 1}
                      </div>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    ref={inputTextareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onScroll={handleInputScroll}
                    placeholder="Paste your raw paragraphs here or click 'Load Sample' to test..."
                    spellCheck="false"
                    className="flex-1 h-full p-4 bg-transparent text-gray-100 font-sans focus:outline-none resize-none overflow-y-auto leading-[21px] text-[12px] md:text-[14px] border-none outline-none ring-0 shadow-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Right Panel: Formatted Output workspace */}
              <div
                className={`flex flex-col bg-[#ffffff] dark:bg-[#0d1117] rounded-2xl border border-gray-200 dark:border-gray-900 overflow-hidden h-full ${
                  activeMobileTab !== "output" ? "hidden lg:flex" : "flex"
                }`}
              >
                {/* Output Header with tabs */}
                <div className="flex items-center justify-between px-3 py-2 bg-[#f8f9fa] dark:bg-[#090d13] border-b border-gray-200 dark:border-gray-900 select-none">
                  
                  {/* Tab switches */}
                  <div className="flex bg-gray-200/60 dark:bg-gray-950 p-0.5 rounded-lg border border-gray-300 dark:border-gray-800">
                    {[
                      { key: "preview", label: "Visual Preview", icon: Eye },
                      { key: "plain", label: "Plain Text", icon: FileText },
                      { key: "html", label: "HTML Source", icon: FileCode }
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all font-semibold cursor-pointer text-[11px] md:text-[12px] ${
                            activeTab === tab.key
                              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          <TabIcon className="w-3.5 h-3.5 text-brandColor" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions buttons (copy/download) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer text-[12px] md:text-[14px]"
                      title="Copy content"
                      disabled={!formattedText}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500 animate-pulse" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer text-[12px] md:text-[14px]"
                      title="Download file"
                      disabled={!formattedText}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body views */}
                <div className="flex-1 overflow-auto p-5 bg-[#fafafa] dark:bg-[#0b0e14]">
                  {formattedText ? (
                    <>
                      {/* View 1: Visual document preview */}
                      {activeTab === "preview" && (
                        <div className="min-h-full bg-white dark:bg-[#0d1117] p-6 md:p-8 rounded-xl shadow-sm border border-gray-150 dark:border-gray-850">
                          {previewParagraphsList.map((paragraph, index) => (
                            <p
                              key={index}
                              className="text-gray-850 dark:text-gray-200 break-words"
                              style={{
                                textAlign: alignment,
                                lineHeight: parseFloat(lineSpacing),
                                marginBottom: spacingStyle,
                                textIndent: textIndentStyle
                              }}
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* View 2: Plain Text */}
                      {activeTab === "plain" && (
                        <textarea
                          readOnly
                          value={formattedText}
                          className="w-full h-full bg-transparent text-gray-800 dark:text-gray-200 font-sans focus:outline-none resize-none overflow-y-auto leading-[21px] text-[12px] md:text-[14px] border-none outline-none ring-0"
                          onClick={(e) => e.target.select()}
                        />
                      )}

                      {/* View 3: HTML Markup */}
                      {activeTab === "html" && (
                        <textarea
                          readOnly
                          value={htmlOutputString}
                          className="w-full h-full bg-transparent text-gray-800 dark:text-gray-200 font-mono focus:outline-none resize-none overflow-y-auto leading-[21px] text-[12px] md:text-[14px] border-none outline-none ring-0"
                          onClick={(e) => e.target.select()}
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 font-sans gap-2 text-center p-4">
                      <span>No formatted paragraphs yet.</span>
                      <button
                        onClick={handleLoadSample}
                        className="text-[12px] md:text-[14px] text-brandColor hover:underline font-semibold cursor-pointer"
                      >
                        Click "Load Sample" to begin formatting
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Statistics Dashboard Panel */}
            <div className="bg-white dark:bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-150 dark:border-gray-800">
                <BookOpen className="w-4.5 h-4.5 text-brandColor" />
                <span className="font-semibold text-gray-900 dark:text-white text-[12px] md:text-[14px]">
                  Text Statistics
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                
                {[
                  { label: "Words", value: stats.words },
                  { label: "Paragraphs", value: stats.paragraphs },
                  { label: "Sentences", value: stats.sentences },
                  { label: "Characters (all)", value: stats.charsWithSpaces },
                  { label: "Read Time", value: stats.readingTime },
                  { label: "Readability", value: stats.readabilityGrade, isFullWidth: true }
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className={`bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-150 dark:border-gray-850 flex flex-col justify-center ${
                      stat.isFullWidth ? "col-span-2 sm:col-span-1 lg:col-span-2" : ""
                    }`}
                  >
                    <span className="text-gray-400 dark:text-gray-500 text-[10px] md:text-[11px] uppercase tracking-wider font-semibold">
                      {stat.label}
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold text-sm md:text-md truncate mt-0.5">
                      {stat.value}
                    </span>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>

      </div>
    </ToolPageShell>
  );
}
