"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Copy,
  Check,
  Download,
  Trash2,
  BookOpen,
  Info,
  ArrowLeftRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Keyboard,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─── TrekGlyph Secret Cipher — Custom Exclusive Language ──────────────────────
// Base glyph atoms: ◈ ◇ ⬡ ⟁ ⍟ ⎔ ⌬ ⏣ ◉ ⍋
// These glyphs are combined into unique multi-glyph codes nobody has seen before.

const CIPHER_MAP = {
  // ── Letters (a–z) ─────────────────────────────────────────────────────────
  a: "◈⟁",
  b: "⬡◇⬡",
  c: "⌬⏣⌬",
  d: "⍟◈⍟",
  e: "◉",
  f: "⬡⍋⬡",
  g: "⟁⎔⟁",
  h: "◇⌬◇",
  i: "⍋⍋",
  j: "◈⬡⟁",
  k: "⏣◉⏣",
  l: "⎔⌬⎔",
  m: "◇◇",
  n: "⟁◈⟁",
  o: "⬡⬡",
  p: "◈⎔◈",
  q: "⍟⌬⍟",
  r: "◉⟁◉",
  s: "⍋◈⍋",
  t: "⌬⌬",
  u: "⏣⍟⏣",
  v: "◈◈⌬",
  w: "⬡◉⬡",
  x: "⍋⏣⍋",
  y: "◇⟁⏣",
  z: "⎔⍟⎔",
  // ── Numbers (0–9) ─────────────────────────────────────────────────────────
  "0": "⬡⌬⬡⌬",
  "1": "⌬◈⌬",
  "2": "◇⍟◇",
  "3": "⟁⬡⟁",
  "4": "⍋⎔⍋",
  "5": "◈⏣◈",
  "6": "⎔◉⎔",
  "7": "⏣⟁⏣⟁",
  "8": "◉⌬◉",
  "9": "⍟⍋⍟",
  // ── Symbols ───────────────────────────────────────────────────────────────
  " ": "/",
  ".": "◈◈◈",
  ",": "◇◇◇",
  "!": "⬡⍟⬡⍟",
  "?": "⟁⏣⟁⏣",
  "@": "⎔⬡⎔⬡",
  "#": "◈⌬◈⌬",
  $: "⍋⬡⍋⬡",
  "%": "◉⍟◉⍟",
  "&": "⏣⌬⏣⌬",
  "*": "⌬⌬⌬⌬",
  "(": "◇⎔◇",
  ")": "⎔◇⎔",
  "-": "◈⟁⟁◈",
  "+": "⟁⟁⟁",
  "=": "⌬◇⌬◇",
  "/": "⬡◈⬡◈",
  "\\": "◈⬡◈⬡",
  ":": "◉◉◉",
  ";": "◇⌬⌬◇",
  '"': "⍟⍟⍟",
  "'": "⏣⏣",
  "_": "⌬◇⌬",
  "[": "◈◇◈◇",
  "]": "◇◈◇◈",
  "{": "⬡◇⬡◇⬡",
  "}": "◇⬡◇⬡◇",
  "<": "◇◈◇",
  ">": "◈◇◈",
  "|": "⍋⍋⍋⍋",
  "^": "⟁⟁⟁⟁",
  "~": "◉⍋◉⍋",
  "`": "⏣⏣⏣",
};

// ─── Build reverse lookup ──────────────────────────────────────────────────────
const REVERSE_MAP = Object.fromEntries(
  Object.entries(CIPHER_MAP).map(([k, v]) => [v, k])
);

// ─── Reference groups for the dictionary panel ────────────────────────────────
const REFERENCE_GROUPS = [
  {
    label: "Letters",
    emoji: "🔤",
    keys: "abcdefghijklmnopqrstuvwxyz".split(""),
  },
  {
    label: "Numbers",
    emoji: "🔢",
    keys: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  },
  {
    label: "Symbols",
    emoji: "✦",
    keys: [
      " ", ".", ",", "!", "?", "@", "#", "$", "%", "&",
      "*", "(", ")", "-", "+", "=", "/", "\\", ":", ";",
      '"', "'", "_", "[", "]", "{", "}", "<", ">", "|", "^", "~", "`",
    ],
  },
];

// ─── Base symbol atoms for the quick-insert pad ───────────────────────────────
const BASE_GLYPHS = ["◈", "◇", "⬡", "⟁", "⍟", "⎔", "⌬", "⏣", "◉", "⍋", "/"];

export default function TrekGlyphEncoderDecoder() {
  const [plainText, setPlainText] = useState("");
  const [trekGlyph, setTrekGlyph] = useState("");
  const [copiedPlain, setCopiedPlain] = useState(false);
  const [copiedGlyph, setCopiedGlyph] = useState(false);
  const [showReference, setShowReference] = useState(true);
  const [activeGroup, setActiveGroup] = useState("Letters");

  const glyphRef = useRef(null);

  // ─── Translation Helpers ──────────────────────────────────────────────────
  const textToTrekGlyph = useCallback((text) => {
    if (!text) return "";
    return text
      .split("")
      .map((char) => {
        const lower = char.toLowerCase();
        if (CIPHER_MAP[lower] !== undefined) return CIPHER_MAP[lower];
        if (CIPHER_MAP[char] !== undefined) return CIPHER_MAP[char];
        return char; // unknown chars pass through
      })
      .join(" ");
  }, []);

  const trekGlyphToText = useCallback((glyph) => {
    if (!glyph) return "";
    return glyph
      .split(" ")
      .map((token) => {
        if (token === "") return "";
        if (REVERSE_MAP[token] !== undefined) return REVERSE_MAP[token];
        return token; // unknown tokens pass through
      })
      .join("");
  }, []);

  // ─── Input Handlers ───────────────────────────────────────────────────────
  const handlePlainChange = (e) => {
    const val = e.target.value;
    setPlainText(val);
    setTrekGlyph(textToTrekGlyph(val));
  };

  const handleTrekChange = (e) => {
    const val = e.target.value;
    setTrekGlyph(val);
    setPlainText(trekGlyphToText(val));
  };

  const handleClearAll = () => {
    setPlainText("");
    setTrekGlyph("");
  };

  const handleSwap = () => {
    const t = plainText;
    setPlainText(trekGlyph);
    setTrekGlyph(t);
  };

  // ─── Utility Operations ────────────────────────────────────────────────────
  const handleCopy = async (text, setCopied) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handleDownload = (text, filename) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Symbol Insertion Pad ─────────────────────────────────────────────────
  const insertGlyph = (sym) => {
    const textarea = glyphRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      trekGlyph.substring(0, start) + sym + trekGlyph.substring(end);
    setTrekGlyph(next);
    setPlainText(trekGlyphToText(next));
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + sym.length;
    }, 0);
  };

  const getWordCount = (text) =>
    text.trim().split(/\s+/).filter(Boolean).length;

  const currentGroup = REFERENCE_GROUPS.find((g) => g.label === activeGroup);

  return (
    <ToolPageShell>
      {/* ── Header ── */}
      <div className="text-center mb-10 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
          <span className="text-base leading-none animate-pulse">◈⟁⬡</span>
          Secret Cipher
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          TrekGlyph{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brandColor to-purple-400">
            Encoder & Decoder
          </span>
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Translate text, numbers & symbols into a completely unique secret
          cipher language — encode & decode in real-time with TrekGlyph's
          exclusive geometric glyph system.
        </p>
      </div>

      {/* ── Actions Bar ── */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <button
          onClick={handleSwap}
          disabled={!plainText && !trekGlyph}
          title="Swap textareas"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brandColor border border-brandColor/30 bg-brandColor/5 hover:bg-brandColor/10 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeftRight size={15} />
          Swap Panels
        </button>
        <button
          onClick={handleClearAll}
          disabled={!plainText && !trekGlyph}
          title="Clear both inputs"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Trash2 size={15} /> Clear All
        </button>
      </div>

      {/* ── Translator Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Plain Text */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              📝 Plain Text
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {plainText.length} chars · {getWordCount(plainText)} words
            </span>
          </div>
          <textarea
            id="plain-input"
            value={plainText}
            onChange={handlePlainChange}
            placeholder={"Type anything here — letters, numbers, symbols!\ne.g.  Hello World! 2025 @ToolsTrek #secret"}
            rows={9}
            className="flex-1 w-full px-5 py-4 text-base text-gray-800 dark:text-gray-100 bg-transparent resize-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed font-sans"
          />
          <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(plainText, setCopiedPlain)}
                disabled={!plainText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {copiedPlain ? (
                  <Check size={13} className="text-green-500" />
                ) : (
                  <Copy size={13} />
                )}
                {copiedPlain ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => handleDownload(plainText, "trekglyph_plain.txt")}
                disabled={!plainText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download size={13} /> Download
              </button>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-wider">
              Human Language
            </span>
          </div>
        </div>

        {/* Right: TrekGlyph Cipher */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              ◈ TrekGlyph (Exclusive Cipher)
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {trekGlyph.length} glyphs
            </span>
          </div>
          <textarea
            id="glyph-input"
            ref={glyphRef}
            value={trekGlyph}
            onChange={handleTrekChange}
            placeholder={"Paste TrekGlyph cipher here to decode...\ne.g.  ◈⟁ ⬡⬡ ◇⌬◇ / ⌬⌬ ◉ ◈◇◈"}
            rows={9}
            className="flex-1 w-full px-5 py-4 text-base text-brandColor dark:text-brandColor/90 bg-transparent resize-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed font-mono font-bold tracking-widest"
          />

          {/* ── Quick Glyph Insertion Pad ── */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/40">
            <div className="flex items-center gap-2 mb-2">
              <Keyboard size={12} className="text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Quick-Insert Base Glyphs
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BASE_GLYPHS.map((sym) => (
                <button
                  key={sym}
                  onClick={() => insertGlyph(sym)}
                  className="px-2.5 py-1 bg-brandColor/10 dark:bg-brandColor/20 text-brandColor hover:bg-brandColor hover:text-white rounded-lg text-sm font-bold transition-all cursor-pointer active:scale-90 leading-none"
                  title={sym === "/" ? "Word Space ( / )" : `Insert ${sym}`}
                >
                  {sym === "/" ? "/ ·space·" : sym}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(trekGlyph, setCopiedGlyph)}
                disabled={!trekGlyph}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {copiedGlyph ? (
                  <Check size={13} className="text-green-500" />
                ) : (
                  <Copy size={13} />
                )}
                {copiedGlyph ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() =>
                  handleDownload(trekGlyph, "trekglyph_encoded.txt")
                }
                disabled={!trekGlyph}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download size={13} /> Download
              </button>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-wider">
              TrekGlyph Cipher
            </span>
          </div>
        </div>
      </div>

      {/* ── Cipher Reference Dictionary ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs mb-6">
        <button
          onClick={() => setShowReference(!showReference)}
          className="w-full flex items-center justify-between font-semibold text-gray-900 dark:text-white hover:text-brandColor transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <BookOpen size={18} className="text-brandColor" />
            TrekGlyph Cipher Reference Dictionary
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {showReference ? (
              <>
                Hide <ChevronUp size={14} />
              </>
            ) : (
              <>
                Show <ChevronDown size={14} />
              </>
            )}
          </span>
        </button>

        {showReference && (
          <div className="mt-5 border-t border-gray-100 dark:border-gray-800 pt-5">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {REFERENCE_GROUPS.map((group) => (
                <button
                  key={group.label}
                  onClick={() => setActiveGroup(group.label)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    activeGroup === group.label
                      ? "bg-brandColor text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {group.emoji} {group.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
              {currentGroup?.keys.map((key) => (
                <div
                  key={key}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30 hover:border-brandColor/40 hover:bg-brandColor/5 dark:hover:bg-brandColor/10 transition-all duration-200 group"
                >
                  <span className="text-base font-extrabold text-gray-800 dark:text-gray-200 group-hover:text-brandColor transition-colors">
                    {key === " " ? "⎵ space" : key}
                  </span>
                  <span className="font-mono text-[11px] text-brandColor dark:text-brandColor/90 font-bold text-center break-all leading-tight px-1.5 py-0.5 rounded-md bg-brandColor/10 dark:bg-brandColor/20">
                    {CIPHER_MAP[key]}
                  </span>
                </div>
              ))}
            </div>

            {/* Hint strip */}
            <div className="mt-5 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2 font-medium">
                <Info size={14} className="text-brandColor shrink-0" />
                Each cipher group is separated by a space. Word boundaries use&nbsp;
                <code className="font-mono font-bold text-brandColor bg-brandColor/10 px-1.5 py-0.5 rounded">
                  /
                </code>
                . Unknown characters pass through unchanged.
              </span>
              <div className="flex gap-2 flex-wrap text-xs font-semibold">
                <span className="px-2 py-1 rounded-md bg-brandColor/10 text-brandColor">
                  Space → /
                </span>
                <span className="px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  26 Letters
                </span>
                <span className="px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  10 Numbers
                </span>
                <span className="px-2 py-1 rounded-md bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                  33 Symbols
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── About TrekGlyph ── */}
      <div className="bg-gradient-to-br from-brandColor/5 via-transparent to-purple-500/5 border border-brandColor/10 dark:border-brandColor/20 rounded-2xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-brandColor/10 dark:bg-brandColor/20 text-brandColor rounded-lg shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
            About the TrekGlyph Secret Language
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            TrekGlyph uses 10 hand-crafted exotic Unicode atoms —{" "}
            <span className="font-mono font-bold text-brandColor">
              ◈ ◇ ⬡ ⟁ ⍟ ⎔ ⌬ ⏣ ◉ ⍋
            </span>{" "}
            — combined into unique multi-glyph patterns. Unlike Morse Code or
            Braille, TrekGlyph is a proprietary, completely original cipher
            covering all 26 English letters, 10 digits (0–9), and 33 common
            punctuation/symbol characters. No existing language, cipher, or
            encoding system shares this mapping. All translation runs
            client-side; nothing is ever uploaded or stored.
          </p>
        </div>
      </div>
    </ToolPageShell>
  );
}
