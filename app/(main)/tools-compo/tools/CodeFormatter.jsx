"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Code2,
  Copy,
  Download,
  Upload,
  Trash2,
  Settings2,
  Check,
  RefreshCw,
  Sparkles,
  FileCode,
  AlertCircle,
  Eye,
  Settings,
  ChevronDown
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

// Sample codes for instant tryout
const SAMPLES = {
  javascript: `function calculateTotal(items, taxRate) {
const subtotal = items.reduce((acc,item)=>{return acc+item.price;},0);
const tax=subtotal*taxRate;
const total=subtotal+tax;
if(total>100){
console.log("Large order discount applied!");
return total*0.95;
}
return total;
}`,
  typescript: `interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}
function greetUser(user:User):string{
const msg = \`Hello \${user.name}, your role is \${user.role}\`;
return msg;
}`,
  html: `<div class="container" id="main-content">
<header className="header"><h1>Welcome to Code Formatter</h1>
<p>Format and beautify your markup instantly.</p></header>
<main class="content"><section><p>Lorem ipsum dolor sit amet.</p>
<img src="banner.jpg" alt="Banner" class="responsive-img"/>
</section></main>
</div>`,
  css: `.card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px; transition: transform 0.2s ease-in-out; }
.card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
.card h3 { color: #7c00fe; font-size: 20px; margin-bottom: 12px; }`,
  json: `{"name":"Code Formatter","version":"1.0.0","active":true,"tags":["developer","utility","prettify"],"config":{"indent":2,"theme":"dark"},"contributors":[{"name":"Developer 1","github":"dev1"}]}`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<bookstore><book category="cooking"><title lang="en">Everyday Italian</title>
<author>Giada De Laurentiis</author><year>2005</year><price>30.00</price></book>
<book category="children"><title lang="en">Harry Potter</title>
<author>J K. Rowling</author><year>2005</year><price>29.99</price></book></bookstore>`,
  sql: `SELECT u.id, u.username, count(o.id) as total_orders, sum(o.amount) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND o.created_at >= '2026-01-01' GROUP BY u.id, u.username HAVING total_spent > 100 ORDER BY total_spent DESC LIMIT 10;`
};

export default function CodeFormatter() {
  const [inputCode, setInputCode] = useState("");
  const [formattedCode, setFormattedCode] = useState("");
  const [language, setLanguage] = useState("javascript");

  // Customization settings
  const [indentSize, setIndentSize] = useState("2");
  const [preserveNewlines, setPreserveNewlines] = useState(true);
  const [braceStyle, setBraceStyle] = useState("collapse");
  const [wrapLength, setWrapLength] = useState("100");
  const [quoteStyle, setQuoteStyle] = useState("none"); // none, single, double
  const [jsSemicolons, setJsSemicolons] = useState("keep"); // keep, strip

  // App states
  const [copied, setCopied] = useState(false);
  const [formattersLoaded, setFormattersLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState("input"); // input, output

  // References to external engines
  const jsBeautifyRef = useRef(null);
  const sqlFormatterRef = useRef(null);

  // DOM Refs for synchronizing scrolls
  const inputGutterRef = useRef(null);
  const inputTextareaRef = useRef(null);

  // Load formatting engines dynamically
  useEffect(() => {
    const initFormatters = async () => {
      try {
        const beautify = await import("js-beautify");
        const sqlFormatter = await import("sql-formatter");

        let bJS = beautify.js || beautify.js_beautify || beautify.default?.js || beautify.default?.js_beautify;
        let bHTML = beautify.html || beautify.html_beautify || beautify.default?.html || beautify.default?.html_beautify;
        let bCSS = beautify.css || beautify.css_beautify || beautify.default?.css || beautify.default?.css_beautify;

        if (!bJS && typeof beautify.default === "function") {
          bJS = beautify.default;
        }

        jsBeautifyRef.current = {
          js: bJS,
          html: bHTML,
          css: bCSS
        };

        sqlFormatterRef.current = sqlFormatter;
        setFormattersLoaded(true);
      } catch (err) {
        console.error("Error loading formatting libraries:", err);
      }
    };
    initFormatters();
  }, []);

  // Pre-populate editor with language sample
  const handleLoadSample = (lang) => {
    const sample = SAMPLES[lang || language] || "";
    setInputCode(sample);
    setError(null);
    setFormattedCode("");

    // Switch active tab back to input on mobile
    setActiveMobileTab("input");
  };

  // Sync sample on language change if textarea is empty or user wants it
  useEffect(() => {
    if (!inputCode.trim()) {
      handleLoadSample(language);
    }
  }, [language]);

  // Synchronize Scroll of Gutter and Textarea
  const handleInputScroll = (e) => {
    if (inputGutterRef.current) {
      inputGutterRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Drag and Drop File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setInputCode(text);
      setError(null);
      setFormattedCode("");

      // Auto-detect language by file extension
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "js" || ext === "jsx") setLanguage("javascript");
      else if (ext === "ts" || ext === "tsx") setLanguage("javascript"); // TS format using JS beautify
      else if (ext === "html" || ext === "htm") setLanguage("html");
      else if (ext === "css") setLanguage("css");
      else if (ext === "json") setLanguage("json");
      else if (ext === "xml" || ext === "svg") setLanguage("xml");
      else if (ext === "sql") setLanguage("sql");
    };
    reader.readAsText(file);
  };

  // Native XML formatter fallback
  const customFormatXml = (xmlStr, indentOption) => {
    const indentChar = indentOption === "tab" ? "\t" : " ".repeat(parseInt(indentOption, 10) || 2);
    let formatted = "";
    let pad = 0;
    // Clean up current white spaces between tags
    let clean = xmlStr.replace(/>\s*</g, "><");
    // Insert newlines between tags
    clean = clean.replace(/(>)(<)(\/*)/g, "$1\r\n$2$3");
    const lines = clean.split("\r\n");

    lines.forEach((line) => {
      let indentLevel = 0;
      if (line.match(/^\s*<!/)) {
        // Comment or doctype
      } else if (line.match(/^\s*<\/\w/)) {
        // Closing tag
        if (pad !== 0) pad -= 1;
      } else if (line.match(/^\s*<\w[^>]*[^\/]>$/)) {
        // Opening tag
        indentLevel = 1;
      }
      formatted += indentChar.repeat(pad) + line.trim() + "\r\n";
      pad += indentLevel;
    });
    return formatted.trim();
  };

  // Run formatting engine
  const handleFormat = () => {
    if (!inputCode.trim()) {
      setError("Please input some code to format.");
      return;
    }
    setError(null);

    try {
      let result = "";
      const numIndent = indentSize === "tab" ? 1 : parseInt(indentSize, 10);
      const isTab = indentSize === "tab";

      // JSON Logic (Native JSON stringify provides precise syntax errors)
      if (language === "json") {
        const parsed = JSON.parse(inputCode);
        result = JSON.stringify(parsed, null, isTab ? "\t" : numIndent);
      }
      // JavaScript / TypeScript
      else if (language === "javascript" || language === "typescript") {
        if (!jsBeautifyRef.current || !jsBeautifyRef.current.js) {
          throw new Error("Formatting engine is loading, please try again in a second.");
        }

        let jsOptions = {
          indent_size: isTab ? 1 : numIndent,
          indent_char: isTab ? "\t" : " ",
          preserve_newlines: preserveNewlines,
          max_preserve_newlines: 2,
          brace_style: braceStyle,
          wrap_line_length: wrapLength === "none" ? 0 : parseInt(wrapLength, 10),
          unescape_strings: true,
          end_with_newline: true
        };

        result = jsBeautifyRef.current.js(inputCode, jsOptions);

        // Post-processing: semicolons removal
        if (jsSemicolons === "strip") {
          result = result.replace(/;(?=\s*$)/gm, "");
        }

        // Post-processing: Quote Style conversion (Single / Double quotes)
        if (quoteStyle === "single") {
          result = result.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (_, str) => {
            return "'" + str.replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
          });
        } else if (quoteStyle === "double") {
          result = result.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, str) => {
            return '"' + str.replace(/"/g, '\\"').replace(/\\'/g, "'") + '"';
          });
        }
      }
      // HTML
      else if (language === "html") {
        if (!jsBeautifyRef.current || !jsBeautifyRef.current.html) {
          throw new Error("Formatting engine is loading, please try again in a second.");
        }

        let htmlOptions = {
          indent_size: isTab ? 1 : numIndent,
          indent_char: isTab ? "\t" : " ",
          preserve_newlines: preserveNewlines,
          max_preserve_newlines: 2,
          wrap_line_length: wrapLength === "none" ? 0 : parseInt(wrapLength, 10),
          indent_inner_html: true,
          indent_scripts: "normal",
          end_with_newline: true
        };

        result = jsBeautifyRef.current.html(inputCode, htmlOptions);
      }
      // CSS
      else if (language === "css") {
        if (!jsBeautifyRef.current || !jsBeautifyRef.current.css) {
          throw new Error("Formatting engine is loading, please try again in a second.");
        }

        let cssOptions = {
          indent_size: isTab ? 1 : numIndent,
          indent_char: isTab ? "\t" : " ",
          preserve_newlines: preserveNewlines,
          wrap_line_length: wrapLength === "none" ? 0 : parseInt(wrapLength, 10),
          newline_between_rules: true,
          end_with_newline: true
        };

        result = jsBeautifyRef.current.css(inputCode, cssOptions);
      }
      // XML / SVG
      else if (language === "xml") {
        result = customFormatXml(inputCode, indentSize);
      }
      // SQL Queries
      else if (language === "sql") {
        if (!sqlFormatterRef.current) {
          throw new Error("SQL formatting engine is loading, please try again.");
        }

        let sqlOptions = {
          language: "sql",
          tabWidth: isTab ? 2 : numIndent,
          useTabs: isTab,
          keywordCase: "upper",
          linesBetweenQueries: 2
        };

        // Use sql-formatter safely
        const sqlFormatFn = sqlFormatterRef.current.format || sqlFormatterRef.current.default?.format;
        if (typeof sqlFormatFn === "function") {
          result = sqlFormatFn(inputCode, sqlOptions);
        } else if (typeof sqlFormatterRef.current === "function") {
          result = sqlFormatterRef.current(inputCode, sqlOptions);
        } else {
          throw new Error("SQL Formatter structure is incompatible.");
        }
      }

      setFormattedCode(result);
      setError(null);

      // Auto toggle to Output tab on mobile for visibility
      setActiveMobileTab("output");
    } catch (err) {
      setError(err.message || "Failed to format code. Please check your syntax.");
    }
  };

  // Minify input code
  const handleMinify = () => {
    if (!inputCode.trim()) {
      setError("Please input some code to minify.");
      return;
    }
    setError(null);

    try {
      let result = "";
      if (language === "json") {
        // Native JSON minify
        result = JSON.stringify(JSON.parse(inputCode));
      } else if (language === "javascript" || language === "typescript") {
        // Basic clean regex minify for Javascript
        result = inputCode
          .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // remove comments
          .replace(/\s+/g, ' ') // collapse whitespaces
          .replace(/\s*([\{\}\(\)\=\+\-\*\/\[\]\,\;\:\?])\s*/g, '$1') // remove spaces around symbols
          .trim();
      } else if (language === "css") {
        // CSS minify
        result = inputCode
          .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
          .replace(/\s+/g, ' ') // collapse whitespaces
          .replace(/\s*([\{\}\:\;\,\>])\s*/g, '$1') // remove spaces around symbols
          .replace(/;}/g, '}') // remove trailing semicolons
          .trim();
      } else if (language === "html" || language === "xml") {
        // HTML / XML minify
        result = inputCode
          .replace(/<!--[\s\S]*?-->/g, '') // remove comments
          .replace(/>\s+</g, '><') // remove spaces between tags
          .replace(/\s+/g, ' ') // collapse whitespaces
          .trim();
      } else if (language === "sql") {
        // SQL minify
        result = inputCode
          .replace(/--.*$/gm, '') // remove inline comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
          .replace(/\s+/g, ' ') // collapse whitespace
          .trim();
      } else {
        result = inputCode.replace(/\s+/g, " ").trim();
      }
      setFormattedCode(result);
      setError(null);
      setActiveMobileTab("output");
    } catch (err) {
      setError("Minification failed: " + (err.message || "Invalid syntax."));
    }
  };

  // Copy output to clipboard
  const handleCopy = () => {
    const codeToCopy = formattedCode || inputCode;
    navigator.clipboard.writeText(codeToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Download formatted code file
  const handleDownload = () => {
    const codeToDownload = formattedCode || inputCode;
    if (!codeToDownload.trim()) return;

    let extension = "txt";
    if (language === "javascript") extension = "js";
    else if (language === "typescript") extension = "ts";
    else if (language === "html") extension = "html";
    else if (language === "css") extension = "css";
    else if (language === "json") extension = "json";
    else if (language === "xml") extension = "xml";
    else if (language === "sql") extension = "sql";

    const blob = new Blob([codeToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted-code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear textareas
  const handleClear = () => {
    setInputCode("");
    setFormattedCode("");
    setError(null);
  };

  // Code input line calculations for IDE gutter display
  const lineCount = inputCode.split("\n").length || 1;

  // React effect to highlight the code whenever the formatted code updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      hljs.highlightAll();
    }
  }, [formattedCode, language]);

  return (
    <ToolPageShell className="px-3 py-6 max-w-7xl mx-auto">
      {/* Premium Dashboard Container */}
      <div className="flex flex-col gap-6 text-[12px] md:text-[14px]">
        {/* Title Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brandColor/15 rounded-xl border border-brandColor/20 text-brandColor">
              <Code2 className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Code Formatter & Beautifier
              </h1>
              <p className="text-[12px] md:text-[14px] text-gray-500 dark:text-gray-400">
                Format, validate, beautify, and minify your programming source code.
              </p>
            </div>
          </div>
        </div>

        {/* Outer Grid Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Settings Sidebar - Left column on Desktop */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-gray-800">
              <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-[12px] md:text-[14px]">
                <Settings2 className="w-4 h-4 text-brandColor" />
                Format Options
              </span>
              {!formattersLoaded && (
                <span className="flex items-center gap-1.5 text-orange-500 dark:text-orange-400 animate-pulse text-[11px] md:text-[12px]">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Loading engines...
                </span>
              )}
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1.5 text-[12px] md:text-[14px]">
                Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                >
                  <option value="javascript">JavaScript (ES6)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="html">HTML5</option>
                  <option value="css">CSS3</option>
                  <option value="json">JSON / JSON5</option>
                  <option value="xml">XML / SVG</option>
                  <option value="sql">SQL Query</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Indentation Configuration */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1.5 text-[12px] md:text-[14px]">
                Indentation Style
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-gray-105 dark:bg-gray-950 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                {["2", "4", "8", "tab"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setIndentSize(style)}
                    className={`py-1.5 rounded-lg text-center font-semibold transition-all text-[12px] md:text-[14px] cursor-pointer ${indentSize === style
                      ? "bg-brandColor text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-905 dark:hover:text-white"
                      }`}
                  >
                    {style === "tab" ? "Tabs" : `${style}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Formatting Settings Toggles */}
            <div className="flex flex-col gap-4 pt-2">
              <label className="block text-gray-700 dark:text-gray-300 font-medium pb-1 border-b border-gray-100 dark:border-gray-800 text-[12px] md:text-[14px]">
                Advanced Settings
              </label>

              {/* Preserve line breaks */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-medium text-gray-800 dark:text-gray-200 text-[12px] md:text-[14px]">
                    Preserve line breaks
                  </span>
                  <span className="text-[11px] md:text-[12px] text-gray-500 dark:text-gray-400">
                    Retain your empty lines
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preserveNewlines}
                  onChange={(e) => setPreserveNewlines(e.target.checked)}
                  className="w-4.5 h-4.5 accent-brandColor cursor-pointer"
                />
              </div>

              {/* JS / CSS Line wrapping */}
              {["javascript", "typescript", "html", "css"].includes(language) && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-[12px] md:text-[14px]">
                    Line Wrapping Limit
                  </label>
                  <div className="relative">
                    <select
                      value={wrapLength}
                      onChange={(e) => setWrapLength(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                    >
                      <option value="none">No Wrap</option>
                      <option value="80">80 characters</option>
                      <option value="100">100 characters</option>
                      <option value="120">120 characters</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Javascript specific settings */}
              {(language === "javascript" || language === "typescript") && (
                <>
                  {/* Brace Style */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-[12px] md:text-[14px]">
                      Brace Style
                    </label>
                    <div className="relative">
                      <select
                        value={braceStyle}
                        onChange={(e) => setBraceStyle(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                      >
                        <option value="collapse">Collapse (Same Line)</option>
                        <option value="expand">Expand (Next Line)</option>
                        <option value="end-expand">End-Expand</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Semicolons */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-[12px] md:text-[14px]">
                      Semicolons
                    </label>
                    <div className="relative">
                      <select
                        value={jsSemicolons}
                        onChange={(e) => setJsSemicolons(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                      >
                        <option value="keep">Keep / Insert Semicolons</option>
                        <option value="strip">Strip Semicolons</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Quotes */}
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-[12px] md:text-[14px]">
                      Quote Character
                    </label>
                    <div className="relative">
                      <select
                        value={quoteStyle}
                        onChange={(e) => setQuoteStyle(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brandColor appearance-none cursor-pointer text-[12px] md:text-[14px]"
                      >
                        <option value="none">Default / Keep Existing</option>
                        <option value="single">Single Quotes (')</option>
                        <option value="double">Double Quotes (")</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar quick actions */}
            <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-gray-150 dark:border-gray-800">
              <button
                onClick={() => handleLoadSample(language)}
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

          {/* Editors Section - 3 columns on Desktop */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Action Bar (Buttons) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                {/* File Upload Trigger */}
                <label className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-205 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium border border-gray-300 dark:border-gray-700 transition-colors cursor-pointer text-[12px] md:text-[14px]">
                  <Upload className="w-4 h-4 text-brandColor" />
                  Upload File
                  <input
                    type="file"
                    accept=".js,.jsx,.ts,.tsx,.html,.css,.json,.xml,.sql"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Format / Minify main triggers */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleMinify}
                  className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-xl font-semibold border border-gray-300 dark:border-gray-700 transition-all cursor-pointer text-[12px] md:text-[14px]"
                >
                  Minify
                </button>
                <button
                  onClick={handleFormat}
                  className="inline-flex items-center gap-1.5 bg-brandColor hover:bg-brandColorHover text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-brandColor/20 transition-all cursor-pointer text-[12px] md:text-[14px]"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  Beautify Code
                </button>
              </div>
            </div>

            {/* Error Message banner */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-[12px] md:text-[14px]">
                  <span className="font-semibold">Parsing Error:</span> {error}
                </div>
              </div>
            )}

            {/* Mobile View Tabs (Input vs Output) */}
            <div className="flex lg:hidden bg-gray-100 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setActiveMobileTab("input")}
                className={`flex-1 py-2 rounded-lg text-center font-semibold transition-all text-[12px] md:text-[14px] cursor-pointer ${activeMobileTab === "input"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                Source Input ({lineCount} lines)
              </button>
              <button
                onClick={() => {
                  setActiveMobileTab("output");
                  // Auto format when clicking formatted if formatted is currently empty
                  if (!formattedCode && inputCode) {
                    handleFormat();
                  }
                }}
                className={`flex-1 py-2 rounded-lg text-center font-semibold transition-all text-[12px] md:text-[14px] cursor-pointer ${activeMobileTab === "output"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                Formatted Output
              </button>
            </div>

            {/* Dual Panel Editor Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[450px] md:h-[550px]">
              {/* Left Panel: Raw Code Input */}
              <div
                className={`flex flex-col bg-[#1e1e1e] rounded-2xl border border-gray-800/80 overflow-hidden h-full ${activeMobileTab !== "input" ? "hidden lg:flex" : "flex"
                  }`}
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#181818] border-b border-gray-800/50 select-none">
                  <span className="font-semibold text-gray-400 flex items-center gap-2 text-[12px] md:text-[14px]">
                    <FileCode className="w-4 h-4 text-brandColor" />
                    Input Code ({language})
                  </span>
                  <span className="text-[11px] md:text-[12px] text-gray-500 font-mono">
                    {inputCode.length} chars
                  </span>
                </div>

                {/* Editor Content Area (Line numbers + Textarea) */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Sync Line Gutter */}
                  <div
                    ref={inputGutterRef}
                    className="select-none text-right pr-3 text-gray-600 font-mono py-4 border-r border-gray-800/40 bg-[#161616] overflow-hidden w-12 text-[12px] md:text-[14px] h-full flex-shrink-0"
                  >
                    {Array.from({ length: lineCount }).map((_, idx) => (
                      <div key={idx} className="h-[21px] leading-[21px]">
                        {idx + 1}
                      </div>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    ref={inputTextareaRef}
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      setError(null);
                    }}
                    onScroll={handleInputScroll}
                    placeholder={`/* Paste or drag your ${language} code here... */`}
                    spellCheck="false"
                    className="flex-1 h-full p-4 bg-transparent text-gray-100 font-mono focus:outline-none resize-none overflow-y-auto leading-[21px] text-[12px] md:text-[14px] border-none outline-none ring-0 shadow-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Right Panel: Beautified / Formatted Output */}
              <div
                className={`flex flex-col bg-[#0d1117] rounded-2xl border border-gray-900 overflow-hidden h-full ${activeMobileTab !== "output" ? "hidden lg:flex" : "flex"
                  }`}
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#090d13] border-b border-gray-900 select-none">
                  <span className="font-semibold text-gray-400 flex items-center gap-2 text-[12px] md:text-[14px]">
                    <Eye className="w-4 h-4 text-emerald-500" />
                    Beautified Code
                  </span>

                  {/* Export Options (Copy & Download) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all cursor-pointer text-[12px] md:text-[14px]"
                      title="Copy formatted code"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all cursor-pointer text-[12px] md:text-[14px]"
                      title="Download as file"
                      disabled={!formattedCode && !inputCode}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Preformatted Code Viewer */}
                <div className="flex-1 overflow-auto p-4 bg-[#0d1117]">
                  {formattedCode ? (
                    <pre className="h-full">
                      <code className={`language-${language} hljs p-0 font-mono text-[12px] md:text-[14px] leading-[21px] bg-transparent`}>
                        {formattedCode}
                      </code>
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 font-mono gap-2 text-[12px] md:text-[14px] text-center p-4">
                      <span>No formatted output yet.</span>
                      <button
                        onClick={handleFormat}
                        className="text-[12px] md:text-[14px] text-brandColor hover:underline font-semibold cursor-pointer"
                      >
                        Click "Beautify Code" to run the formatter
                      </button>
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
}
