"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Radio,
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  Volume2,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─── NATO Phonetic Alphabet Data ──────────────────────────────────────────────
const NATO_MAP = {
  A: { word: "Alpha",    phonetic: "AL-fah"      },
  B: { word: "Bravo",    phonetic: "BRAH-voh"    },
  C: { word: "Charlie",  phonetic: "CHAR-lee"    },
  D: { word: "Delta",    phonetic: "DEL-tah"     },
  E: { word: "Echo",     phonetic: "EK-oh"       },
  F: { word: "Foxtrot",  phonetic: "FOKS-trot"   },
  G: { word: "Golf",     phonetic: "Golf"        },
  H: { word: "Hotel",    phonetic: "hoh-TEL"     },
  I: { word: "India",    phonetic: "IN-dee-ah"   },
  J: { word: "Juliet",   phonetic: "JEW-lee-et"  },
  K: { word: "Kilo",     phonetic: "KEY-loh"     },
  L: { word: "Lima",     phonetic: "LEE-mah"     },
  M: { word: "Mike",     phonetic: "Mike"        },
  N: { word: "November", phonetic: "no-VEM-ber"  },
  O: { word: "Oscar",    phonetic: "OSS-cah"     },
  P: { word: "Papa",     phonetic: "pah-PAH"     },
  Q: { word: "Quebec",   phonetic: "keh-BECK"    },
  R: { word: "Romeo",    phonetic: "ROW-me-oh"   },
  S: { word: "Sierra",   phonetic: "see-AIR-ah"  },
  T: { word: "Tango",    phonetic: "TANG-go"     },
  U: { word: "Uniform",  phonetic: "YOU-nee-form" },
  V: { word: "Victor",   phonetic: "VIK-tah"     },
  W: { word: "Whiskey",  phonetic: "WISS-key"    },
  X: { word: "X-ray",    phonetic: "ECKS-ray"    },
  Y: { word: "Yankee",   phonetic: "YANG-key"    },
  Z: { word: "Zulu",     phonetic: "ZOO-loo"     },
  "0": { word: "Zero",   phonetic: "ZEE-roh"     },
  "1": { word: "One",    phonetic: "WUN"          },
  "2": { word: "Two",    phonetic: "TOO"          },
  "3": { word: "Three",  phonetic: "TREE"         },
  "4": { word: "Four",   phonetic: "FOW-er"       },
  "5": { word: "Five",   phonetic: "FIFE"         },
  "6": { word: "Six",    phonetic: "SIX"          },
  "7": { word: "Seven",  phonetic: "SEV-en"       },
  "8": { word: "Eight",  phonetic: "AIT"          },
  "9": { word: "Nine",   phonetic: "NIN-er"       },
};

// Reverse map: NATO word → char
const REVERSE_NATO = {};
Object.entries(NATO_MAP).forEach(([char, { word }]) => {
  REVERSE_NATO[word.toLowerCase()] = char;
});

// ─── Conversion helpers ───────────────────────────────────────────────────────
function textToNATO(text) {
  return text
    .toUpperCase()
    .split("")
    .map((char) => {
      if (char === " ")  return "[SPACE]";
      if (char === "\n") return "[NEW LINE]";
      if (NATO_MAP[char]) return NATO_MAP[char].word;
      return `[${char}]`;
    })
    .join(" · ");
}

function natoToText(nato) {
  return nato
    .split(/\s*·\s*|\s+/)
    .map((token) => {
      const t = token.trim().toLowerCase();
      if (t === "[space]")    return " ";
      if (t === "[new line]") return "\n";
      if (t.startsWith("[") && t.endsWith("]")) return t.slice(1, -1);
      return REVERSE_NATO[t] || token;
    })
    .join("");
}

// ─── Stats helper ─────────────────────────────────────────────────────────────
function getStats(input) {
  const letters = (input.match(/[a-zA-Z]/g) || []).length;
  const digits  = (input.match(/[0-9]/g) || []).length;
  const spaces  = (input.match(/ /g) || []).length;
  const special = input.length - letters - digits - spaces;
  return { letters, digits, spaces, special };
}

// ─── Reference data ───────────────────────────────────────────────────────────
const REF_LETTERS = Object.entries(NATO_MAP).filter(([k]) => /[A-Z]/.test(k));
const REF_DIGITS  = Object.entries(NATO_MAP).filter(([k]) => /[0-9]/.test(k));

// Colour palette cycles for reference cards
const CARD_COLORS = [
  "from-violet-500/20 to-purple-500/10 border-violet-400/30",
  "from-blue-500/20 to-cyan-500/10 border-blue-400/30",
  "from-emerald-500/20 to-teal-500/10 border-emerald-400/30",
  "from-orange-500/20 to-amber-500/10 border-orange-400/30",
  "from-pink-500/20 to-rose-500/10 border-pink-400/30",
  "from-indigo-500/20 to-sky-500/10 border-indigo-400/30",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function NATOPhoneticConverter() {
  const [mode, setMode]             = useState("encode"); // "encode" | "decode"
  const [inputText, setInputText]   = useState("");
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied]         = useState(false);
  const [showRef, setShowRef]       = useState(false);
  const [activeTab, setActiveTab]   = useState("Letters");

  // ── Real-time translation ──────────────────────────────────────────────────
  useEffect(() => {
    if (!inputText.trim()) { setOutputText(""); return; }
    setOutputText(mode === "encode" ? textToNATO(inputText) : natoToText(inputText));
  }, [inputText, mode]);

  const stats = mode === "encode" && inputText ? getStats(inputText) : null;

  // ── Token list for colour-coded display ───────────────────────────────────
  const outputTokens = outputText ? outputText.split(" · ") : [];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSwap = useCallback(() => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInputText(outputText);
    setOutputText(inputText);
  }, [mode, inputText, outputText]);

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = mode === "encode" ? "nato_phonetic.txt" : "decoded_text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => { setInputText(""); setOutputText(""); };

  const handleInsertChar = (char) => {
    if (mode === "encode") setInputText((prev) => prev + char.toLowerCase());
  };

  const inputPlaceholder =
    mode === "encode"
      ? "Type your text here… e.g. SOS, NATO, Hello"
      : "Enter NATO words separated by  ·  e.g. Sierra · Oscar · Sierra";

  return (
    <ToolPageShell>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-[12px] md:text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
          <Radio size={14} />
          Military Communication
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
          NATO Phonetic{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brandColor to-purple-400">
            Alphabet Converter
          </span>
        </h1>
        <p className="mt-3 text-[14px] md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Convert any text to the NATO phonetic alphabet used by military,
          aviation, and emergency services worldwide — instantly and in real-time.
        </p>
      </div>

      {/* ── Mode Switcher ────────────────────────────────────────────────────── */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          {[
            { id: "encode", label: "Text → NATO" },
            { id: "decode", label: "NATO → Text" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setMode(id); setInputText(""); setOutputText(""); }}
              className={`px-6 py-2.5 rounded-lg text-[12px] md:text-sm font-semibold transition-all duration-200 ${
                mode === id
                  ? "bg-brandColor text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Translator Panel ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Input */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-[12px] md:text-sm font-semibold text-gray-700 dark:text-gray-300">
              {mode === "encode" ? "📝 Plain Text" : "📡 NATO Code"}
            </span>
            <span className="text-[11px] md:text-xs text-gray-400 dark:text-gray-500">
              {inputText.length} chars
            </span>
          </div>

          <textarea
            id="nato-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={inputPlaceholder}
            rows={9}
            spellCheck={mode === "encode"}
            className="flex-1 w-full px-5 py-4 bg-transparent resize-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed text-gray-800 dark:text-gray-100 text-[12px] md:text-[14px]"
          />

          {/* Stats bar (encode mode only) */}
          {stats && (
            <div className="flex flex-wrap gap-3 px-5 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {[
                { label: "Letters", value: stats.letters, color: "text-brandColor"  },
                { label: "Digits",  value: stats.digits,  color: "text-blue-500"    },
                { label: "Spaces",  value: stats.spaces,  color: "text-emerald-500" },
                { label: "Special", value: stats.special, color: "text-orange-500"  },
              ].map(({ label, value, color }) => (
                <span key={label} className="flex items-center gap-1 text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                  <span className={`font-bold ${color}`}>{value}</span> {label}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleClear}
              disabled={!inputText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] md:text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-[12px] md:text-sm font-semibold text-gray-700 dark:text-gray-300">
              {mode === "encode" ? "📡 NATO Phonetic Output" : "📝 Decoded Text"}
            </span>
            <span className="text-[11px] md:text-xs text-gray-400 dark:text-gray-500">
              {outputText.length} chars
            </span>
          </div>

          {/* Colour-coded tokens (encode) or plain text (decode) */}
          {mode === "encode" ? (
            <div
              id="nato-output-encode"
              className="flex-1 px-5 py-4 min-h-[220px] overflow-y-auto"
            >
              {outputTokens.length > 0 ? (
                <div className="flex flex-wrap gap-x-2 gap-y-2">
                  {outputTokens.map((token, i) => {
                    const isSpace   = token === "[SPACE]";
                    const isNewLine = token === "[NEW LINE]";
                    const isSpecial = token.startsWith("[") && !isSpace && !isNewLine;
                    if (isNewLine) return <div key={i} className="w-full" />;
                    if (isSpace)
                      return (
                        <span key={i} className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] md:text-[11px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-700">
                          SPACE
                        </span>
                      );
                    if (isSpecial)
                      return (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] md:text-[12px] font-mono bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                          {token}
                        </span>
                      );
                    return (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] md:text-[14px] font-semibold bg-brandColor/10 text-brandColor border border-brandColor/20 hover:bg-brandColor/20 transition-colors cursor-default select-all">
                        {token}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-gray-400 dark:text-gray-600 text-[12px] md:text-[14px]">
                  NATO phonetic output will appear here…
                </span>
              )}
            </div>
          ) : (
            <div
              id="nato-output-decode"
              className="flex-1 px-5 py-4 text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-all min-h-[220px] select-all text-[12px] md:text-[14px]"
            >
              {outputText || (
                <span className="text-gray-400 dark:text-gray-600">
                  Decoded text will appear here…
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex-wrap">
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] md:text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!outputText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] md:text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download size={13} /> Download
            </button>
          </div>
        </div>
      </div>

      {/* ── Swap Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleSwap}
          disabled={!inputText && !outputText}
          className="flex items-center gap-2 px-5 py-2.5 text-[12px] md:text-sm font-semibold text-brandColor border border-brandColor/30 bg-brandColor/5 hover:bg-brandColor/10 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          <ArrowLeftRight size={15} />
          Swap Input &amp; Output
        </button>
      </div>

      {/* ── Character Breakdown (encode mode) ────────────────────────────────── */}
      {mode === "encode" && outputTokens.length > 0 && (
        <div className="mb-6 p-5 bg-gray-950 dark:bg-black rounded-2xl border border-gray-800 overflow-x-auto">
          <p className="text-[10px] md:text-xs text-gray-500 mb-4 font-mono uppercase tracking-widest">
            Character-by-character breakdown
          </p>
          <div className="flex flex-wrap gap-3">
            {inputText
              .toUpperCase()
              .split("")
              .map((char, idx) => {
                if (char === " ")
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 min-w-[2.5rem]">
                      <span className="text-[10px] md:text-[11px] font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-md w-full text-center">SPC</span>
                      <span className="text-[9px] md:text-[10px] text-gray-600">—</span>
                    </div>
                  );
                if (char === "\n")
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 min-w-[2.5rem]">
                      <span className="text-[10px] md:text-[11px] font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-md w-full text-center">↵</span>
                      <span className="text-[9px] md:text-[10px] text-gray-600">—</span>
                    </div>
                  );

                const entry = NATO_MAP[char];
                if (!entry)
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 min-w-[2.5rem]">
                      <span className="text-[10px] md:text-[12px] font-bold text-orange-400 bg-gray-800 px-2 py-1 rounded-md w-full text-center">{char}</span>
                      <span className="text-[9px] md:text-[10px] text-gray-600">—</span>
                    </div>
                  );
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[11px] md:text-[13px] font-bold text-white bg-gray-800 hover:bg-brandColor/30 px-2.5 py-1 rounded-md min-w-[2.5rem] text-center transition-colors">
                      {char}
                    </span>
                    <span className="text-[11px] md:text-[13px] font-semibold text-brandColor whitespace-nowrap">
                      {entry.word}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-gray-500 whitespace-nowrap hidden sm:block font-mono">
                      {entry.phonetic}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Reference Chart ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => setShowRef((p) => !p)}
          id="nato-reference-toggle"
          className="flex items-center gap-2 w-full px-5 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-[12px] md:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
        >
          <BookOpen size={15} className="text-brandColor" />
          NATO Phonetic Alphabet Reference Chart
          <span className="ml-auto">
            {showRef ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </button>

        {showRef && (
          <div className="mt-2 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {["Letters", "Digits"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-[12px] md:text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-brandColor text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {(activeTab === "Letters" ? REF_LETTERS : REF_DIGITS).map(
                ([char, { word, phonetic }], idx) => (
                  <button
                    key={char}
                    onClick={() => handleInsertChar(char)}
                    title={mode === "encode" ? `Click to insert "${char.toLowerCase()}"` : ""}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border bg-linear-to-br transition-all duration-200 group hover:scale-105 hover:shadow-md ${
                      CARD_COLORS[idx % CARD_COLORS.length]
                    } ${mode === "encode" ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <span className="text-xl font-black text-gray-900 dark:text-white group-hover:text-brandColor transition-colors leading-none">
                      {char}
                    </span>
                    <span className="text-[12px] md:text-[13px] font-bold text-gray-800 dark:text-gray-200 mt-1 leading-tight">
                      {word}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                      {phonetic}
                    </span>
                  </button>
                )
              )}
            </div>

            {mode === "encode" && (
              <p className="mt-4 flex items-center gap-1.5 text-[11px] md:text-xs text-gray-500 dark:text-gray-500">
                <Info size={12} /> Click any card to insert that character into your input.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Info Tips ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: "🪖",
            title: "Military Standard",
            desc: "The NATO phonetic alphabet (ICAO) is used worldwide by militaries, air traffic control, and emergency services for clear radio communication.",
          },
          {
            icon: "📡",
            title: "Separator Format",
            desc: 'Each NATO word is separated by " · " (middle dot). When decoding, paste the full NATO sequence separated by dots or spaces.',
          },
          {
            icon: "🔤",
            title: "Pronunciations",
            desc: "Expand the reference chart to see ICAO-standard pronunciation guides for every letter and digit in the NATO alphabet.",
          },
        ].map((tip, i) => (
          <div
            key={i}
            className="p-4 bg-brandColor/5 border border-brandColor/15 rounded-xl"
          >
            <p className="flex items-center gap-1.5 text-[12px] md:text-xs font-bold text-brandColor mb-1">
              {tip.icon} {tip.title}
            </p>
            <p className="text-[12px] md:text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">
              {tip.desc}
            </p>
          </div>
        ))}
      </div>
    </ToolPageShell>
  );
}
