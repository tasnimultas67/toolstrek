"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowLeftRight,
  Globe,
  Info,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─── Bangla Braille Map ────────────────────────────────────────────────────────
const BANGLA_BRAILLE_MAP = {
  // ── Independent Vowels (স্বরবর্ণ)
  "অ": "⠁", "আ": "⠜", "ই": "⠔", "ঈ": "⠊", "উ": "⠥", "ঊ": "⠳",
  "ঋ": "⠐", "এ": "⠑", "ঐ": "⠌", "ও": "⠕", "ঔ": "⠪",
  // ── Vowel Signs / Matra (মাত্রা)
  "া": "⠣", "ি": "⠱", "ী": "⠩", "ু": "⠧", "ূ": "⠯",
  "ৃ": "⠈", "ে": "⠢", "ৈ": "⠬", "ো": "⠭", "ৌ": "⠫", "্": "⠄",
  // ── Consonants – Group 1 (ক–ঞ)
  "ক": "⠅", "খ": "⠨", "গ": "⠛", "ঘ": "⠷", "ঙ": "⠒",
  "চ": "⠉", "ছ": "⠡", "জ": "⠚", "ঝ": "⠺", "ঞ": "⠖",
  // ── Consonants – Group 2 (ট–ন)
  "ট": "⠾", "ঠ": "⠟", "ড": "⠮", "ঢ": "⠴", "ণ": "⠸",
  "ত": "⠞", "থ": "⠹", "দ": "⠙", "ধ": "⠰", "ন": "⠝",
  // ── Consonants – Group 3 (প–হ)
  "প": "⠏", "ফ": "⠋", "ব": "⠃", "ভ": "⠿", "ম": "⠍",
  "য": "⠽", "র": "⠗", "ল": "⠇", "শ": "⠆", "ষ": "⠶",
  "স": "⠎", "হ": "⠓",
  // ── Extra Consonants
  "ড়": "⠘", "ঢ়": "⠦", "য়": "⠵", "ৎ": "⠂",
  // ── Special Characters (বিশেষ)
  "ং": "⠻", "ঃ": "⠼", "ঁ": "⠤", "।": "⠲",
  // ── Space
  " ": "⠀",
};

// Build a reverse map that outputs NFC-normalised Bangla
const REVERSE_BANGLA = Object.fromEntries(
  Object.entries(BANGLA_BRAILLE_MAP).map(([k, v]) => [v, k.normalize("NFC")])
);

// NFC-normalised lookup map for the encoder.
// Map keys are normalised so that either form (precomposed U+09DC or
// decomposed ড+়) resolves to the same Braille cell.
const BANGLA_MAP_NFC = Object.fromEntries(
  Object.entries(BANGLA_BRAILLE_MAP).map(([k, v]) => [k.normalize("NFC"), v])
);
// Also register the explicit 2-codepoint decomposed sequences that keyboards
// often produce. NFC may or may not compose these depending on the platform.
BANGLA_MAP_NFC["\u09A1\u09BC"] = "\u2818"; // ড + ় → ড়  ⠘
BANGLA_MAP_NFC["\u09A2\u09BC"] = "\u2826"; // ঢ + ় → ঢ়  ⠦
BANGLA_MAP_NFC["\u09AF\u09BC"] = "\u2835"; // য + ় → য়  ⠵

// ── Bangla number indicator & digit cells ─────────────────────────────────────
// ⠠ (U+2820) is the only unused 6-dot cell in the Bangla map; we use it as the
// Bangla number indicator (distinct from English ⠼ which is ঃ in Bangla mode).
const BANGLA_NUM_IND = "\u2820"; // ⠠

// Digit-cell map shared by Bengali (০–৯) and Arabic (0–9) digits.
// The digit cell is the same as English Grade-1 (a=1 … j=0).
const BANGLA_DIGIT_CELLS = {
  "০": "\u281a", "১": "\u2801", "২": "\u2803", "৩": "\u2809", "৪": "\u2819",
  "৫": "\u2811", "৬": "\u280b", "৭": "\u281b", "৮": "\u2813", "৯": "\u280a",
  "0":  "\u281a", "1":  "\u2801", "2":  "\u2803", "3":  "\u2809", "4":  "\u2819",
  "5":  "\u2811", "6":  "\u280b", "7":  "\u281b", "8":  "\u2813", "9":  "\u280a",
};

// Reverse map: digit cell → Bengali digit (used by decoder).
const REV_BANGLA_DIGIT_CELLS = {
  "\u281a": "০", "\u2801": "১", "\u2803": "২", "\u2809": "৩", "\u2819": "৪",
  "\u2811": "৫", "\u280b": "৬", "\u281b": "৭", "\u2813": "৮", "\u280a": "৯",
};

// Register all digit entries into BANGLA_MAP_NFC (indicator + digit cell).
for (const [digit, cell] of Object.entries(BANGLA_DIGIT_CELLS)) {
  BANGLA_MAP_NFC[digit] = BANGLA_NUM_IND + cell;
}

// ─── English Braille Map ───────────────────────────────────────────────────────
const EN_LETTERS = {
  a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑", f: "⠋", g: "⠛",
  h: "⠓", i: "⠊", j: "⠚", k: "⠅", l: "⠇", m: "⠍", n: "⠝",
  o: "⠕", p: "⠏", q: "⠟", r: "⠗", s: "⠎", t: "⠞", u: "⠥",
  v: "⠧", w: "⠺", x: "⠭", y: "⠽", z: "⠵",
};
const EN_DIGITS = {
  "1": "⠁", "2": "⠃", "3": "⠉", "4": "⠙", "5": "⠑",
  "6": "⠋", "7": "⠛", "8": "⠓", "9": "⠊", "0": "⠚",
};
const EN_PUNCT = {
  ".": "⠲", ",": "⠂", "?": "⠦", "!": "⠖",
  "'": "⠄", ":": "⠒", ";": "⠆", "-": "⠤",
};
const NUM_IND     = "⠼";
const CAP_IND     = "⠠";
const BRAILLE_SPC = "⠀";

const REV_EN_LETTERS = Object.fromEntries(Object.entries(EN_LETTERS).map(([k, v]) => [v, k]));
const REV_EN_DIGITS  = Object.fromEntries(Object.entries(EN_DIGITS).map(([k, v]) => [v, k]));
const REV_EN_PUNCT   = Object.fromEntries(Object.entries(EN_PUNCT).map(([k, v]) => [v, k]));

// ─── Translation Helpers ──────────────────────────────────────────────────────
/**
 * Encode Bangla text → Braille.
 * Strategy:
 *   1. NFC-normalise the input so composed forms (ড়, ঢ়, য়) are single codepoints.
 *   2. Iterate character-by-character with a 2-char lookahead to handle any
 *      residual decomposed nukta (়) sequences that NFC did not compose.
 */
function banglaEncode(text) {
  const chars = [...text.normalize("NFC")];
  let result = "";
  let i = 0;
  while (i < chars.length) {
    // Try 2-char combination first (e.g. base consonant + nukta not NFC-composed)
    if (i + 1 < chars.length) {
      const pair = chars[i] + chars[i + 1];
      if (BANGLA_MAP_NFC[pair] !== undefined) {
        result += BANGLA_MAP_NFC[pair];
        i += 2;
        continue;
      }
    }
    result += BANGLA_MAP_NFC[chars[i]] ?? chars[i];
    i++;
  }
  return result;
}

/**
 * Decode Braille → Bangla text.
 * Handles the number-indicator prefix (⠠) so digit sequences like ⠠⠁ → ১.
 */
function banglaDecode(braille) {
  const cells = [...braille];
  let result = "";
  let i = 0;
  while (i < cells.length) {
    const ch = cells[i];
    // Number indicator: next cell is a digit
    if (ch === BANGLA_NUM_IND && i + 1 < cells.length) {
      const digit = REV_BANGLA_DIGIT_CELLS[cells[i + 1]];
      if (digit !== undefined) {
        result += digit;
        i += 2;
        continue;
      }
    }
    result += REVERSE_BANGLA[ch] ?? ch;
    i++;
  }
  return result;
}

function englishEncode(text) {
  let out = "";
  for (const ch of text) {
    if (ch === " ")                          out += BRAILLE_SPC;
    else if (ch >= "A" && ch <= "Z")        out += CAP_IND + EN_LETTERS[ch.toLowerCase()];
    else if (EN_LETTERS[ch])                out += EN_LETTERS[ch];
    else if (EN_DIGITS[ch])                 out += NUM_IND + EN_DIGITS[ch];
    else if (EN_PUNCT[ch])                  out += EN_PUNCT[ch];
    else                                    out += ch;
  }
  return out;
}

function englishDecode(braille) {
  const chars = [...braille];
  let out = "";
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    if (ch === BRAILLE_SPC) {
      out += " "; i++;
    } else if (ch === CAP_IND && chars[i + 1]) {
      out += (REV_EN_LETTERS[chars[i + 1]] ?? chars[i + 1]).toUpperCase();
      i += 2;
    } else if (ch === NUM_IND && chars[i + 1]) {
      out += REV_EN_DIGITS[chars[i + 1]] ?? chars[i + 1];
      i += 2;
    } else if (REV_EN_PUNCT[ch]) {
      out += REV_EN_PUNCT[ch]; i++;
    } else if (REV_EN_LETTERS[ch]) {
      out += REV_EN_LETTERS[ch]; i++;
    } else {
      out += ch; i++;
    }
  }
  return out;
}

// ─── Inline Braille Dot Cell Renderer ────────────────────────────────────────
// Renders a 2×3 grid of raised/flat dots for a single Braille Unicode character.
function BrailleCell({ cell, dotSize = 8 }) {
  const cp = cell.codePointAt(0);
  if (!cp || cp < 0x2800 || cp > 0x28ff) return null;
  const bits = cp - 0x2800;
  // Render order in a 2-column grid: dot1,dot4,dot2,dot5,dot3,dot6
  const positions = [0, 3, 1, 4, 2, 5];
  return (
    <div className="grid grid-cols-2" style={{ gap: 3, width: dotSize * 2 + 3 }}>
      {positions.map((bit, i) => (
        <div
          key={i}
          style={{ width: dotSize, height: dotSize }}
          className={`rounded-full ${
            bits & (1 << bit)
              ? "bg-brandColor"
              : "bg-gray-300 dark:bg-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Reference Data ────────────────────────────────────────────────────────────
const BANGLA_REF_GROUPS = {
  vowels: {
    label: "স্বরবর্ণ (Vowels)",
    items: ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ"].map(
      (c) => [c, BANGLA_BRAILLE_MAP[c]]
    ),
  },
  matra: {
    label: "মাত্রা (Vowel Signs)",
    items: ["া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ", "্"].map(
      (c) => [c, BANGLA_BRAILLE_MAP[c]]
    ),
  },
  con1: {
    label: "ব্যঞ্জন ক–ঞ",
    items: ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ"].map(
      (c) => [c, BANGLA_BRAILLE_MAP[c]]
    ),
  },
  con2: {
    label: "ব্যঞ্জন ট–ন",
    items: ["ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন"].map(
      (c) => [c, BANGLA_BRAILLE_MAP[c]]
    ),
  },
  con3: {
    label: "ব্যঞ্জন প–হ",
    items: ["প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ", "স", "হ"].map(
      (c) => [c, BANGLA_BRAILLE_MAP[c]]
    ),
  },
  special: {
    label: "বিশেষ (Special)",
    items: [
      ["ড়", BANGLA_BRAILLE_MAP["ড়"]],
      ["ঢ়", BANGLA_BRAILLE_MAP["ঢ়"]],
      ["য়", BANGLA_BRAILLE_MAP["য়"]],
      ["ৎ",  BANGLA_BRAILLE_MAP["ৎ"]],
      ["ং",  BANGLA_BRAILLE_MAP["ং"]],
      ["ঃ",  BANGLA_BRAILLE_MAP["ঃ"]],
      ["ঁ",  BANGLA_BRAILLE_MAP["ঁ"]],
      ["।",  BANGLA_BRAILLE_MAP["।"]],
    ],
  },
  numbers: {
    label: "সংখ্যা (Numbers)",
    items: [
      ["০", BANGLA_NUM_IND + "\u281a"],
      ["১", BANGLA_NUM_IND + "\u2801"],
      ["২", BANGLA_NUM_IND + "\u2803"],
      ["৩", BANGLA_NUM_IND + "\u2809"],
      ["৪", BANGLA_NUM_IND + "\u2819"],
      ["৫", BANGLA_NUM_IND + "\u2811"],
      ["৬", BANGLA_NUM_IND + "\u280b"],
      ["৭", BANGLA_NUM_IND + "\u281b"],
      ["৮", BANGLA_NUM_IND + "\u2813"],
      ["৯", BANGLA_NUM_IND + "\u280a"],
    ],
  },
};

const ENGLISH_REF_GROUPS = {
  letters: {
    label: "Letters (A–Z)",
    items: "abcdefghijklmnopqrstuvwxyz"
      .split("")
      .map((c) => [c.toUpperCase(), EN_LETTERS[c]]),
  },
  numbers: {
    label: "Numbers (0–9)",
    items: "0123456789".split("").map((c) => [c, NUM_IND + EN_DIGITS[c]]),
  },
  punct: {
    label: "Punctuation",
    items: Object.entries(EN_PUNCT),
  },
};

const LANGUAGES = [
  {
    id: "bangla",
    flag: "🇧🇩",
    label: "বাংলা (Bangla)",
    sub: "Bengali Braille Standard",
  },
  {
    id: "english",
    flag: "🇺🇸",
    label: "English (US)",
    sub: "Grade 1 Standard Braille",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BrailleDecoder() {
  const [language, setLanguage] = useState("bangla");
  const [mode, setMode]         = useState("encode");
  const [input, setInput]       = useState("");
  const [output, setOutput]     = useState("");
  const [copied, setCopied]     = useState(false);
  const [showRef, setShowRef]   = useState(false);
  const [activeTab, setActiveTab] = useState("vowels");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  // ── Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Real-time translation
  useEffect(() => {
    if (!input) { setOutput(""); return; }
    if (language === "bangla") {
      setOutput(mode === "encode" ? banglaEncode(input) : banglaDecode(input));
    } else {
      setOutput(mode === "encode" ? englishEncode(input) : englishDecode(input));
    }
  }, [input, mode, language]);

  const handleSwap = useCallback(() => {
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setInput(output);
    setOutput(input);
  }, [input, output]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = mode === "encode" ? "braille_output.txt" : "decoded_text.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleClear = () => { setInput(""); setOutput(""); };

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setDropOpen(false);
    setInput("");
    setOutput("");
    setMode("encode");
    setActiveTab(lang === "bangla" ? "vowels" : "letters");
  };

  const handleModeChange = (m) => {
    setMode(m);
    setInput("");
    setOutput("");
  };

  const curLang   = LANGUAGES.find((l) => l.id === language);
  const refGroups = language === "bangla" ? BANGLA_REF_GROUPS : ENGLISH_REF_GROUPS;
  const tabKeys   = Object.keys(refGroups);

  const inputLabel  =
    mode === "encode"
      ? language === "bangla" ? "📝 বাংলা টেক্সট" : "📝 English Text"
      : "⠿ Braille Code";
  const outputLabel =
    mode === "encode"
      ? "⠿ Braille Output"
      : language === "bangla" ? "📝 ডিকোডেড টেক্সট" : "📝 Decoded Text";
  const inputPlaceholder =
    mode === "encode"
      ? language === "bangla"
        ? "এখানে বাংলা লিখুন… যেমন: আমার সোনার বাংলা"
        : "Type English text here… e.g. Hello World"
      : language === "bangla"
      ? "এখানে ব্রেইল লিখুন… যেমন: ⠁⠍⠣⠗"
      : "Enter Braille here… e.g. ⠠⠓⠑⠇⠇⠕";

  return (
    <ToolPageShell>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
          <span className="text-base leading-none">⠿</span>
          Braille Tool
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          Braille{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brandColor to-purple-400">
            Encoder &amp; Decoder
          </span>
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Instantly convert text to Braille or decode Braille back to readable
          text — supporting{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            বাংলা
          </span>{" "}
          and{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            English
          </span>{" "}
          with a full visual reference chart.
        </p>
      </div>

      {/* ── Controls Bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

        {/* Language Dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            id="braille-lang-dropdown"
            onClick={() => setDropOpen((o) => !o)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-brandColor/60 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-all duration-200 shadow-sm min-w-[220px]"
          >
            <Globe size={14} className="text-brandColor flex-shrink-0" />
            <span className="text-base leading-none">{curLang.flag}</span>
            <span className="flex-1 text-left">{curLang.label}</span>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-300 ${dropOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLangChange(lang.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-all duration-150 ${
                      language === lang.id
                        ? "bg-brandColor/10 text-brandColor"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-2xl leading-none">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {lang.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {lang.sub}
                      </div>
                    </div>
                    {language === lang.id && (
                      <span className="w-2 h-2 rounded-full bg-brandColor flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          {["encode", "decode"].map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === m
                  ? "bg-brandColor text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {m === "encode" ? "Text → Braille" : "Braille → Text"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Translator Panels ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Input Panel */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {inputLabel}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {[...input].length} chars
            </span>
          </div>
          <textarea
            id="braille-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            rows={8}
            spellCheck={mode === "encode" && language === "english"}
            style={{ fontSize: mode === "decode" ? "1.6rem" : "1rem", lineHeight: mode === "decode" ? "2.6rem" : "1.75rem" }}
            className="flex-1 w-full px-5 py-4 text-gray-800 dark:text-gray-100 bg-transparent resize-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 font-mono"
          />
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleClear}
              disabled={!input}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {outputLabel}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {[...output].length} chars
            </span>
          </div>
          <div
            id="braille-output"
            style={{
              fontSize: mode === "encode" ? "2rem" : "1rem",
              lineHeight: mode === "encode" ? "3rem" : "1.75rem",
            }}
            className="flex-1 px-5 py-4 text-gray-800 dark:text-gray-100 font-mono whitespace-pre-wrap break-all min-h-[200px] select-all"
          >
            {output || (
              <span
                className="text-gray-400 dark:text-gray-600"
                style={{ fontSize: "0.875rem", lineHeight: "1.5rem" }}
              >
                Translation will appear here…
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex-wrap">
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {copied ? (
                <Check size={13} className="text-green-500" />
              ) : (
                <Copy size={13} />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download size={13} /> Download
            </button>
          </div>
        </div>
      </div>

      {/* ── Swap Button ──────────────────────────────────────────────────────── */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleSwap}
          disabled={!input && !output}
          id="braille-swap-btn"
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-brandColor border border-brandColor/30 bg-brandColor/5 hover:bg-brandColor/10 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeftRight size={15} />
          Swap Input &amp; Output
        </button>
      </div>

      {/* ── Braille Visual Preview (encode mode) ─────────────────────────────── */}
      {output && mode === "encode" && (
        <div className="mb-6 p-5 bg-gray-950 dark:bg-black rounded-2xl border border-gray-800 overflow-x-auto">
          <p className="text-xs text-gray-500 mb-4 font-mono uppercase tracking-widest">
            Visual Braille Cell Preview
          </p>
          <div className="flex flex-wrap gap-4 items-end">
            {(() => {
              // Pair input chars with output Braille cells (best-effort, character-aligned for Bangla)
              const inputChars  = [...input];
              const outputCells = [...output];
              let oi = 0;
              return inputChars.map((ch, ii) => {
                const brailleChar = outputCells[oi];
                if (!brailleChar) return null;
                const cp = brailleChar.codePointAt(0);
                const isBraille = cp >= 0x2800 && cp <= 0x28ff;
                oi++;
                return (
                  <div
                    key={ii}
                    className="flex flex-col items-center gap-2"
                  >
                    {isBraille ? (
                      <BrailleCell cell={brailleChar} dotSize={10} />
                    ) : (
                      <span className="text-gray-500 text-xs font-mono">{brailleChar}</span>
                    )}
                    <span className="text-gray-400 text-xs font-sans">
                      {ch === " " ? "⎵" : ch}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ── Reference Chart ───────────────────────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => setShowRef((p) => !p)}
          id="braille-reference-toggle"
          className="flex items-center gap-2 w-full px-5 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
        >
          <BookOpen size={15} className="text-brandColor" />
          <span>{curLang.flag}</span>
          Braille Reference Chart
          <span className="ml-auto">
            {showRef ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </button>

        {showRef && (
          <div className="mt-2 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            {/* Group Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {tabKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeTab === key
                      ? "bg-brandColor text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {refGroups[key].label}
                </button>
              ))}
            </div>

            {/* Character Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {refGroups[activeTab]?.items.map(([char, brailleCode]) => (
                <button
                  key={char}
                  onClick={() => {
                    const toInsert =
                      mode === "encode" ? char : brailleCode;
                    setInput((prev) => prev + toInsert);
                  }}
                  title={
                    mode === "encode"
                      ? `Insert "${char}"`
                      : `Insert Braille for "${char}"`
                  }
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brandColor/60 hover:bg-brandColor/5 transition-all duration-150 cursor-pointer group"
                >
                  {/* Character label */}
                  <span className="text-base font-bold text-gray-900 dark:text-white group-hover:text-brandColor transition-colors leading-none">
                    {char}
                  </span>
                  {/* Braille dot visualization */}
                  <div className="flex gap-1.5">
                    {[...brailleCode].map((cell, ci) => {
                      const cp = cell.codePointAt(0);
                      if (!cp || cp < 0x2800 || cp > 0x28ff)
                        return (
                          <span key={ci} className="text-xs text-brandColor font-mono">
                            {cell}
                          </span>
                        );
                      return <BrailleCell key={ci} cell={cell} dotSize={7} />;
                    })}
                  </div>
                  {/* Braille Unicode character */}
                  <span className="text-xs font-mono text-brandColor tracking-wider leading-none">
                    {brailleCode}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
              <Info size={12} />
              Click any card to insert the{" "}
              {mode === "encode" ? "character" : "Braille code"} into your input.
            </p>
          </div>
        )}
      </div>

      {/* ── Info Tips ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            title: "Real-Time Translation",
            desc: "Output updates instantly as you type — no button press needed.",
          },
          {
            title: "Two Languages",
            desc: "Switch between Bengali Braille and English Grade 1 Braille using the language dropdown.",
          },
          {
            title: "Reference Chart",
            desc: "Open the chart above to look up characters and click any card to insert it directly.",
          },
        ].map((tip) => (
          <div
            key={tip.title}
            className="p-4 bg-brandColor/5 border border-brandColor/15 rounded-xl"
          >
            <p className="text-xs font-bold text-brandColor mb-1">{tip.title}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{tip.desc}</p>
          </div>
        ))}
      </div>
    </ToolPageShell>
  );
}
