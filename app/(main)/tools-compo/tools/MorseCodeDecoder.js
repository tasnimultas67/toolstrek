"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Radio,
  ArrowLeftRight,
  Copy,
  Check,
  Volume2,
  Square,
  Download,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─── Morse Code Dictionary ────────────────────────────────────────────────────
const MORSE_MAP = {
  A: ".-",    B: "-...",  C: "-.-.",  D: "-..",   E: ".",
  F: "..-.",  G: "--.",   H: "....",  I: "..",    J: ".---",
  K: "-.-",   L: ".-..",  M: "--",    N: "-.",    O: "---",
  P: ".--.",  Q: "--.-",  R: ".-.",   S: "...",   T: "-",
  U: "..-",   V: "...-",  W: ".--",   X: "-..-",  Y: "-.--",
  Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.",
  "!": "-.-.--", "/": "-..-.",  "(": "-.--.",  ")": "-.--.-",
  "&": ".-...",  ":": "---...",  ";": "-.-.-.",  "=": "-...-",
  "+": ".-.-.",  "-": "-....-",  "_": "..--.-",  '"': ".-..-.",
  "$": "...-..-","@": ".--.-.",  " ": "/",
};

const REVERSE_MORSE = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

// ─── Translation helpers ──────────────────────────────────────────────────────
function textToMorse(text) {
  return text
    .toUpperCase()
    .split("")
    .map((char) => MORSE_MAP[char] || "")
    .filter((c, i, arr) => !(c === "" && arr[i - 1] === ""))
    .join(" ")
    .trim();
}

function morseToText(morse) {
  return morse
    .trim()
    .split("   ")                       // triple-space = word gap
    .map((word) =>
      word
        .split(" ")
        .map((sym) => {
          if (sym === "/") return " ";
          return REVERSE_MORSE[sym] || "?";
        })
        .join("")
    )
    .join(" ");
}

// ─── Audio ────────────────────────────────────────────────────────────────────
function playMorseAudio(morseString, wpm, frequency, onEnd) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const dotDuration = 1.2 / wpm;   // seconds
  const dashDuration = dotDuration * 3;
  const gapSymbol  = dotDuration;
  const gapLetter  = dotDuration * 3;
  const gapWord    = dotDuration * 7;

  let time = ctx.currentTime + 0.05;

  const schedule = (dur) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.6, time + 0.003);
    gain.gain.setValueAtTime(0.6, time + dur - 0.003);
    gain.gain.linearRampToValueAtTime(0, time + dur);
    osc.start(time);
    osc.stop(time + dur);
    time += dur;
  };

  const tokens = morseString.split(" ");
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "/") {
      time += gapWord;
      continue;
    }
    for (let j = 0; j < token.length; j++) {
      if (token[j] === ".") {
        schedule(dotDuration);
      } else if (token[j] === "-") {
        schedule(dashDuration);
      }
      if (j < token.length - 1) time += gapSymbol;
    }
    if (i < tokens.length - 1 && tokens[i + 1] !== "/" && tokens[i] !== "/") {
      time += gapLetter;
    }
  }

  const totalDuration = (time - ctx.currentTime) * 1000;
  const timer = setTimeout(() => {
    ctx.close();
    if (onEnd) onEnd();
  }, totalDuration + 200);

  return { ctx, timer };
}

// ─── Morse Reference Data ─────────────────────────────────────────────────────
const REFERENCE_GROUPS = [
  {
    label: "Letters",
    items: Object.entries(MORSE_MAP).filter(([k]) => /[A-Z]/.test(k)),
  },
  {
    label: "Numbers",
    items: Object.entries(MORSE_MAP).filter(([k]) => /[0-9]/.test(k)),
  },
  {
    label: "Punctuation",
    items: Object.entries(MORSE_MAP).filter(([k]) => !/[A-Z0-9 ]/.test(k)),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MorseCodeDecoder() {
  const [mode, setMode] = useState("encode"); // "encode" | "decode"
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(15);
  const [frequency, setFrequency] = useState(600);
  const [showReference, setShowReference] = useState(false);
  const [activeGroup, setActiveGroup] = useState("Letters");
  const audioRef = useRef(null);

  // Real-time translation
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("");
      return;
    }
    if (mode === "encode") {
      setOutputText(textToMorse(inputText));
    } else {
      setOutputText(morseToText(inputText));
    }
  }, [inputText, mode]);

  const handleSwap = useCallback(() => {
    stopAudio();
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInputText(outputText);
    setOutputText(inputText);
  }, [mode, inputText, outputText]);

  const stopAudio = () => {
    if (audioRef.current) {
      clearTimeout(audioRef.current.timer);
      try { audioRef.current.ctx.close(); } catch (_) {}
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlay = () => {
    if (isPlaying) { stopAudio(); return; }
    const morse = mode === "encode" ? outputText : inputText;
    if (!morse.trim()) return;
    setIsPlaying(true);
    audioRef.current = playMorseAudio(morse, wpm, frequency, () => {
      setIsPlaying(false);
      audioRef.current = null;
    });
  };

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
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "encode" ? "morse_code.txt" : "decoded_text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    stopAudio();
    setInputText("");
    setOutputText("");
  };

  const inputPlaceholder =
    mode === "encode"
      ? "Type your text here… e.g. Hello World"
      : "Enter Morse code here… e.g. .... . .-.. .-.. --- / .-- --- .-. .-.. -..";

  const morseForPlayback = mode === "encode" ? outputText : inputText;
  const canPlay = !!morseForPlayback.trim();

  return (
    <ToolPageShell>
      {/* ── Header ── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
          <Radio size={14} />
          Morse Code
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          Morse Code{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brandColor to-purple-400">
            Decoder & Encoder
          </span>
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Instantly translate text to Morse code or decode Morse signals back to
          readable text — with real-time audio playback.
        </p>
      </div>

      {/* ── Mode Switcher ── */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => { stopAudio(); setMode("encode"); setInputText(""); setOutputText(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "encode"
                ? "bg-brandColor text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Text → Morse
          </button>
          <button
            onClick={() => { stopAudio(); setMode("decode"); setInputText(""); setOutputText(""); }}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "decode"
                ? "bg-brandColor text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Morse → Text
          </button>
        </div>
      </div>

      {/* ── Translator Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Input */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {mode === "encode" ? "📝 Plain Text" : "📡 Morse Code"}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {inputText.length} chars
            </span>
          </div>
          <textarea
            id="morse-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={inputPlaceholder}
            rows={8}
            spellCheck={mode === "encode"}
            className="flex-1 w-full px-5 py-4 text-base text-gray-800 dark:text-gray-100 bg-transparent resize-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 font-mono leading-relaxed"
          />
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleClear}
              disabled={!inputText}
              title="Clear"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        {/* Swap Button (center, hidden on mobile) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        </div>

        {/* Output */}
        <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {mode === "encode" ? "📡 Morse Code" : "📝 Decoded Text"}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {outputText.length} chars
            </span>
          </div>
          <div
            id="morse-output"
            className="flex-1 px-5 py-4 text-base text-gray-800 dark:text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-all min-h-[200px] select-all"
          >
            {outputText || (
              <span className="text-gray-400 dark:text-gray-600">
                Translation will appear here…
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex-wrap">
            <button
              onClick={handleCopy}
              disabled={!outputText}
              title="Copy output"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!outputText}
              title="Download"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download size={13} /> Download
            </button>
          </div>
        </div>
      </div>

      {/* ── Swap + Audio Controls Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        {/* Swap */}
        <button
          onClick={handleSwap}
          disabled={!inputText && !outputText}
          title="Swap input and output"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brandColor border border-brandColor/30 bg-brandColor/5 hover:bg-brandColor/10 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeftRight size={15} />
          Swap
        </button>

        {/* Audio Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* WPM */}
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-brandColor" />
            <label htmlFor="wpm-slider" className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Speed: <span className="text-brandColor font-bold">{wpm} WPM</span>
            </label>
            <input
              id="wpm-slider"
              type="range"
              min={5}
              max={40}
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="w-24 accent-[#7c00fe]"
            />
          </div>

          {/* Frequency */}
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-brandColor" />
            <label htmlFor="freq-slider" className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Tone: <span className="text-brandColor font-bold">{frequency} Hz</span>
            </label>
            <input
              id="freq-slider"
              type="range"
              min={400}
              max={900}
              step={50}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-24 accent-[#7c00fe]"
            />
          </div>

          {/* Play / Stop */}
          <button
            onClick={handlePlay}
            disabled={!canPlay}
            id="morse-play-btn"
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed ${
              isPlaying
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-brandColor hover:bg-brandColorHover text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <Square size={14} fill="white" /> Stop
              </>
            ) : (
              <>
                <Volume2 size={14} /> Play Audio
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Morse Dot/Dash Visual ── */}
      {outputText && mode === "encode" && (
        <div className="mb-6 p-5 bg-gray-950 dark:bg-black rounded-2xl border border-gray-800 overflow-x-auto">
          <p className="text-xs text-gray-500 mb-3 font-mono uppercase tracking-widest">Visual signal</p>
          <div className="flex flex-wrap gap-1 items-center">
            {outputText.split(" ").map((token, i) => {
              if (token === "/") {
                return (
                  <span key={i} className="mx-2 text-gray-600 text-xs font-mono">│</span>
                );
              }
              return (
                <span key={i} className="flex items-center gap-0.5">
                  {token.split("").map((sym, j) => (
                    <span
                      key={j}
                      className={`inline-block rounded-sm bg-brandColor ${
                        sym === "." ? "w-2 h-2" : "w-5 h-2"
                      }`}
                    />
                  ))}
                  <span className="inline-block w-1.5" />
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Reference Chart Toggle ── */}
      <div className="mb-4">
        <button
          onClick={() => setShowReference((p) => !p)}
          id="morse-reference-toggle"
          className="flex items-center gap-2 w-full px-5 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
        >
          <BookOpen size={15} className="text-brandColor" />
          Morse Code Reference Chart
          <span className="ml-auto">{showReference ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
        </button>

        {showReference && (
          <div className="mt-2 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            {/* Group Tabs */}
            <div className="flex gap-2 mb-5">
              {REFERENCE_GROUPS.map((g) => (
                <button
                  key={g.label}
                  onClick={() => setActiveGroup(g.label)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeGroup === g.label
                      ? "bg-brandColor text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {REFERENCE_GROUPS.find((g) => g.label === activeGroup)?.items.map(([char, code]) => (
                <button
                  key={char}
                  onClick={() => {
                    if (mode === "encode") {
                      setInputText((prev) => prev + (char === " " ? " " : char.toLowerCase()));
                    }
                  }}
                  title={mode === "encode" ? `Click to insert "${char}"` : ""}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brandColor/50 hover:bg-brandColor/5 transition-all cursor-pointer group"
                >
                  <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brandColor transition-colors">
                    {char}
                  </span>
                  <span className="text-xs font-mono text-brandColor mt-0.5 tracking-wider">
                    {code}
                  </span>
                </button>
              ))}
            </div>

            {mode === "encode" && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                <Info size={12} /> Click any character card to insert it into your input.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Info Tips ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { title: "Word Separator", desc: "Use   /   (with spaces) to separate words when entering Morse code." },
          { title: "Letter Separator", desc: "Leave a single space between Morse symbols of different letters." },
          { title: "Audio Playback", desc: "Adjust speed (WPM) and tone frequency, then hit Play to hear the Morse signal." },
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
