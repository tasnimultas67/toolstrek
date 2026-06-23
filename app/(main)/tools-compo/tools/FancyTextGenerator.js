"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Settings2,
  RotateCcw,
  Info,
  Type,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { motion, AnimatePresence } from "framer-motion";

// Mappings for Tiny Caps / Small Caps
const smallCapsMap = {
  a: "ᴀ",
  b: "ʙ",
  c: "ᴄ",
  d: "ᴅ",
  e: "ᴇ",
  f: "ꜰ",
  g: "ɢ",
  h: "ʜ",
  i: "ɪ",
  j: "ᴊ",
  k: "ᴋ",
  l: "ʟ",
  m: "ᴍ",
  n: "ɴ",
  o: "ᴏ",
  p: "ᴘ",
  q: "ǫ",
  r: "ʀ",
  s: "s",
  t: "ᴛ",
  u: "ᴜ",
  v: "ᴠ",
  w: "ᴡ",
  x: "x",
  y: "ʏ",
  z: "ᴢ",
  A: "ᴀ",
  B: "ʙ",
  C: "ᴄ",
  D: "ᴅ",
  E: "ᴇ",
  F: "ꜰ",
  G: "ɢ",
  H: "ʜ",
  I: "ɪ",
  J: "ᴊ",
  K: "ᴋ",
  L: "ʟ",
  M: "ᴍ",
  N: "ɴ",
  O: "ᴏ",
  P: "ᴘ",
  Q: "ǫ",
  R: "ʀ",
  S: "s",
  T: "ᴛ",
  U: "ᴜ",
  V: "ᴠ",
  W: "ᴡ",
  X: "x",
  Y: "ʏ",
  Z: "ᴢ",
};

// Mappings for Superscript
const superscriptMap = {
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ⁱ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",
  A: "ᴬ",
  B: "ᴮ",
  C: "ᶜ",
  D: "ᴰ",
  E: "ᴱ",
  F: "ᶠ",
  G: "ᴳ",
  H: "ᴴ",
  I: "ᴵ",
  J: "ᴶ",
  K: "ᴷ",
  L: "ᴸ",
  M: "ᴹ",
  N: "ᴺ",
  O: "ᴼ",
  P: "ᴾ",
  Q: "ᴼ",
  R: "ᴿ",
  S: "ˢ",
  T: "ᵀ",
  U: "ᵁ",
  V: "ⱽ",
  W: "ᵂ",
  X: "ˣ",
  Y: "ʸ",
  Z: "ᶻ",
  0: "⁰",
  1: "¹",
  2: "²",
  3: "³",
  4: "⁴",
  5: "⁵",
  6: "⁶",
  7: "⁷",
  8: "⁸",
  9: "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
};

// Mappings for Subscript
const subscriptMap = {
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
  A: "ₐ",
  E: "ₑ",
  H: "ₕ",
  I: "ᵢ",
  J: "ⱼ",
  K: "ₖ",
  L: "ₗ",
  M: "ₘ",
  N: "ₙ",
  O: "ₒ",
  P: "ₚ",
  R: "ᵣ",
  S: "ₛ",
  T: "ₜ",
  U: "ᵤ",
  V: "ᵥ",
  X: "ₓ",
  0: "₀",
  1: "₁",
  2: "₂",
  3: "₃",
  4: "₄",
  5: "₅",
  6: "₆",
  7: "₇",
  8: "₈",
  9: "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
};

// Mappings for Upside Down (Flipped)
const flipMap = {
  a: "ɐ",
  b: "q",
  c: "ɔ",
  d: "p",
  e: "ǝ",
  f: "ɟ",
  g: "ƃ",
  h: "ɥ",
  i: "ı",
  j: "ɾ",
  k: "ʞ",
  l: "լ",
  m: "ɯ",
  n: "u",
  o: "o",
  p: "d",
  q: "b",
  r: "ɹ",
  s: "s",
  t: "ʇ",
  u: "n",
  v: "ʌ",
  w: "ʍ",
  x: "x",
  y: "ʎ",
  z: "z",
  A: "∀",
  B: "ᗺ",
  C: "Ɔ",
  D: "ᗡ",
  E: "Ǝ",
  F: "Ⅎ",
  G: "⅁",
  H: "H",
  I: "I",
  J: "ſ",
  K: "ʞ",
  L: "˥",
  M: "W",
  N: "N",
  O: "O",
  P: "Ԁ",
  Q: "Ὁ",
  R: "ᴚ",
  S: "S",
  T: "⊥",
  U: "∩",
  V: "Λ",
  W: "M",
  X: "X",
  Y: "⅄",
  Z: "Z",
  0: "0",
  1: "Ɩ",
  2: "ᄅ",
  3: "Ɛ",
  4: "ㄣ",
  5: "ϛ",
  6: "9",
  7: "ㄥ",
  8: "8",
  9: "6",
  ".": "˙",
  ",": "'",
  "'": ",",
  '"': "„",
  "?": "¿",
  "!": "¡",
  "(": ")",
  ")": "(",
  "[": "]",
  "]": "[",
  "{": "}",
  "}": "{",
  "<": ">",
  ">": "<",
  _: "‾",
  "&": "⅋",
  ";": "⸮",
};

// Mappings for Mirror / Reversed
const mirrorMap = {
  a: "ɒ",
  b: "d",
  c: "ɔ",
  d: "b",
  e: "ɘ",
  f: "ʇ",
  g: "ʚ",
  h: "ʜ",
  i: "i",
  j: "Ⴑ",
  k: "ʞ",
  l: "l",
  m: "m",
  n: "ᴎ",
  o: "o",
  p: "q",
  q: "p",
  r: "ɿ",
  s: "ƨ",
  t: "ʇ",
  u: "u",
  v: "v",
  w: "w",
  x: "x",
  y: "ʏ",
  z: "z",
  A: "𐌿",
  B: "ᙠ",
  C: "Ɔ",
  D: "ᗡ",
  E: "Ǝ",
  F: "𐌲",
  G: "⅁",
  H: "H",
  I: "I",
  J: "ᒐ",
  K: "𐌱",
  L: "⅃",
  M: "M",
  N: "ᴎ",
  O: "O",
  P: "𐌹",
  Q: "Ọ",
  R: "Я",
  S: "Ƨ",
  T: "T",
  U: "U",
  V: "V",
  W: "W",
  X: "X",
  Y: "Y",
  Z: "Z",
  1: "Ɩ",
  2: "Ѕ",
  3: "Ɛ",
  4: "߈",
  5: " Zag",
  6: "∂",
  7: "ߪ",
  9: "e",
  "?": "⸮",
  "&": "⅋",
  "(": ")",
  ")": "(",
  "[": "]",
  "]": "[",
  "{": "}",
  "}": "{",
  "<": ">",
  ">": "<",
};

// Zalgo glitch combining marks
const ZALGO_UP = [
  "\u0300",
  "\u0301",
  "\u0302",
  "\u0303",
  "\u0304",
  "\u0305",
  "\u0306",
  "\u0307",
  "\u0308",
  "\u0309",
  "\u030a",
  "\u030b",
  "\u030c",
  "\u030d",
  "\u030e",
  "\u030f",
  "\u0310",
  "\u0311",
  "\u0312",
  "\u0313",
  "\u0314",
  "\u031a",
  "\u033d",
  "\u033e",
  "\u033f",
  "\u0340",
  "\u0341",
  "\u0342",
  "\u0343",
  "\u0344",
  "\u0346",
  "\u034a",
  "\u034b",
  "\u034c",
  "\u0350",
  "\u0351",
  "\u0352",
  "\u0357",
  "\u0358",
  "\u035b",
  "\u035d",
  "\u035e",
  "\u0360",
  "\u0361",
  "\u0362",
  "\u0374",
  "\u037a",
  "\u037e",
  "\u0384",
  "\u0385",
];
const ZALGO_MID = [
  "\u0315",
  "\u031b",
  "\u0320",
  "\u0334",
  "\u0335",
  "\u0336",
  "\u0337",
  "\u0338",
  "\u035c",
  "\u035f",
  "\u0362",
  "\u0488",
  "\u0489",
  "\u20d0",
  "\u20d1",
  "\u20d2",
  "\u20d3",
  "\u20d4",
  "\u20d5",
  "\u20d6",
  "\u20d7",
  "\u20d8",
  "\u20d9",
  "\u20da",
  "\u20db",
  "\u20dc",
  "\u20dd",
  "\u20de",
  "\u20df",
  "\u20e0",
  "\u20e2",
  "\u20e3",
  "\u20e4",
  "\u20e5",
  "\u20e6",
  "\u20e7",
  "\u20e8",
  "\u20e9",
  "\u20ea",
  "\u20eb",
  "\u20ec",
  "\u20ed",
  "\u20ee",
  "\u20ef",
];
const ZALGO_DOWN = [
  "\u0316",
  "\u0317",
  "\u0318",
  "\u0319",
  "\u031c",
  "\u031d",
  "\u031e",
  "\u031f",
  "\u0321",
  "\u0322",
  "\u0323",
  "\u0324",
  "\u0325",
  "\u0326",
  "\u0327",
  "\u0328",
  "\u0329",
  "\u032a",
  "\u032b",
  "\u032c",
  "\u032d",
  "\u032e",
  "\u032f",
  "\u0330",
  "\u0331",
  "\u0332",
  "\u0333",
  "\u0339",
  "\u033a",
  "\u033b",
  "\u033c",
  "\u0345",
  "\u0347",
  "\u0348",
  "\u0349",
  "\u034d",
  "\u034e",
  "\u034f",
  "\u0353",
  "\u0354",
  "\u0355",
  "\u0356",
  "\u0359",
  "\u035a",
  "\u035c",
  "\u035f",
  "\u0362",
];

// Leetspeak translation maps
const leetMaps = {
  1: { A: "4", E: "3", I: "1", O: "0", S: "5", T: "7" },
  2: { A: "4", B: "8", E: "3", G: "6", I: "1", O: "0", S: "5", T: "7", Z: "2" },
  3: {
    A: "@",
    B: "8",
    C: "(",
    D: "|)",
    E: "3",
    F: "|=",
    G: "6",
    H: "#",
    I: "!",
    J: "_|",
    K: "|<",
    L: "1",
    M: "|\\/|",
    N: "|\\|",
    O: "0",
    P: "|*",
    Q: "O_",
    R: "|2",
    S: "$",
    T: "7",
    U: "|_|",
    V: "\\/",
    W: "\\/\\/",
    X: "><",
    Y: "`/",
    Z: "2",
  },
};

// Decorators
const DECORATORS = [
  { id: "none", label: "No Decoration" },
  { id: "stars", label: "Stars (★彡 彡★)", wrap: (t) => `★彡 ${t} 彡★` },
  { id: "wings", label: "Wings (꧁ ꧂)", wrap: (t) => `꧁ ${t} ꧂` },
  { id: "hearts", label: "Hearts (♥ ♥)", wrap: (t) => `(っ◔◡◔)っ ♥ ${t} ♥` },
  { id: "sparkles", label: "Sparkles (✧✧)", wrap: (t) => `✧○ꊞ ${t} ꊞ○✧` },
  { id: "flower", label: "Flower (✿✿)", wrap: (t) => `(✿◠‿◠) ${t} (◡‿◡✿)` },
  { id: "bracket", label: "Brackets (【 】)", wrap: (t) => `【 ${t} 】` },
  {
    id: "double_bracket",
    label: "Double Brackets (『 』)",
    wrap: (t) => `『 ${t} 』`,
  },
  { id: "chevron", label: "Chevrons (➴ ➶)", wrap: (t) => `➴ ${t} ➶` },
  { id: "diamond", label: "Diamonds (◈ ◈)", wrap: (t) => `◈ ${t} ◈` },
  {
    id: "retro",
    label: "Checkered / Retro",
    wrap: (t) =>
      t
        .split("")
        .map((c) => (/\s/.test(c) ? c : `[̲̅${c}]`))
        .join(""),
  },
  { id: "loading", label: "Loading bar", wrap: (t) => `[▓▓▓▓▓] ${t} [▓▓▓▓▓]` },
];

export default function FancyTextGenerator() {
  const [inputText, setInputText] = useState("Hello, ToolsTrek!");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Advanced options state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [excludeNumbers, setExcludeNumbers] = useState(false);
  const [excludePunctuation, setExcludePunctuation] = useState(false);
  const [excludeSpaces, setExcludeSpaces] = useState(false);
  const [casingMode, setCasingMode] = useState("none"); // "none" | "upper" | "lower" | "alternate" | "random"
  const [leetStrength, setLeetStrength] = useState(0); // 0 | 1 | 2 | 3
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [selectedDecorator, setSelectedDecorator] = useState("none");

  // Zalgo configuration
  const [zalgoIntensity, setZalgoIntensity] = useState(4);
  const [zalgoUp, setZalgoUp] = useState(true);
  const [zalgoMid, setZalgoMid] = useState(true);
  const [zalgoDown, setZalgoDown] = useState(true);

  // Helper checking if a character is punctuation
  const isPunct = (char) => {
    return /[\p{P}\p{S}]/u.test(char);
  };

  // Helper checking if a character is a number
  const isNum = (char) => {
    return /\d/.test(char);
  };

  // Main converter logic
  const transformText = useCallback(
    (text, style) => {
      if (!text) return "";

      // 1. Apply casing options
      let processed = text;
      if (casingMode === "upper") {
        processed = processed.toUpperCase();
      } else if (casingMode === "lower") {
        processed = processed.toLowerCase();
      } else if (casingMode === "alternate") {
        processed = processed
          .split("")
          .map((char, index) =>
            index % 2 === 0 ? char.toLowerCase() : char.toUpperCase(),
          )
          .join("");
      } else if (casingMode === "random") {
        processed = processed
          .split("")
          .map((char) =>
            Math.random() > 0.5 ? char.toLowerCase() : char.toUpperCase(),
          )
          .join("");
      }

      // 2. Apply Leetspeak if selected
      if (leetStrength > 0) {
        const leetMap = leetMaps[leetStrength];
        processed = processed
          .split("")
          .map((char) => {
            const upper = char.toUpperCase();
            if (leetMap[upper]) {
              // Keep original case if possible or just output leet char
              return leetMap[upper];
            }
            return char;
          })
          .join("");
      }

      // 3. Perform font mapping on characters
      let output = "";

      if (style.applyAll) {
        // Styles that map complete string block
        // (Strikethrough, Zalgo, Flip, Reversed)
        // We apply exclusions inside the string or skip them
        let filteredText = "";
        for (const char of processed) {
          if (excludeNumbers && isNum(char)) {
            filteredText += char;
          } else if (excludePunctuation && isPunct(char)) {
            filteredText += char;
          } else if (excludeSpaces && /\s/.test(char)) {
            filteredText += char;
          } else {
            filteredText += char;
          }
        }

        if (style.id === "glitch") {
          output = style.applyAll(filteredText, {
            zalgoIntensity,
            zalgoUp,
            zalgoMid,
            zalgoDown,
          });
        } else {
          output = style.applyAll(filteredText);
        }
      } else {
        // Character-by-character mapped styles
        for (let i = 0; i < processed.length; i++) {
          const char = processed[i];

          // Exclusions
          if (excludeNumbers && isNum(char)) {
            output += char;
          } else if (excludePunctuation && isPunct(char)) {
            output += char;
          } else if (excludeSpaces && /\s/.test(char)) {
            output += char;
          } else {
            output += style.map(char);
          }
        }
      }

      // 4. Apply custom delimiter if specified
      if (customDelimiter) {
        output = output.split("").join(customDelimiter);
      }

      // 5. Wrap in selected decorator
      if (selectedDecorator !== "none") {
        const dec = DECORATORS.find((d) => d.id === selectedDecorator);
        if (dec && dec.wrap) {
          output = dec.wrap(output);
        }
      }

      return output;
    },
    [
      casingMode,
      leetStrength,
      excludeNumbers,
      excludePunctuation,
      excludeSpaces,
      customDelimiter,
      selectedDecorator,
      zalgoIntensity,
      zalgoUp,
      zalgoMid,
      zalgoDown,
    ],
  );

  // Style conversion list config
  const STYLES = useMemo(
    () => [
      {
        id: "bold_serif",
        name: "Mathematical Bold Serif",
        category: "Serif",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d3c7);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d3bb);
          if (code >= 48 && code <= 57)
            return String.fromCodePoint(code + 0x1d79e);
          return char;
        },
      },
      {
        id: "italic_serif",
        name: "Mathematical Italic Serif",
        category: "Serif",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d3f3);
          if (code === 104) return "ℎ"; // 'h' gap
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d3ef);
          return char;
        },
      },
      {
        id: "bold_italic_serif",
        name: "Mathematical Bold Italic",
        category: "Serif",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d427);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d421);
          return char;
        },
      },
      {
        id: "sans_normal",
        name: "Sans-Serif Normal",
        category: "Sans-Serif",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d55f);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d559);
          if (code >= 48 && code <= 57)
            return String.fromCodePoint(code + 0x1d7b2);
          return char;
        },
      },
      {
        id: "sans_bold",
        name: "Sans-Serif Bold",
        category: "Sans-Serif",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d593);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d58d);
          if (code >= 48 && code <= 57)
            return String.fromCodePoint(code + 0x1d7bc);
          return char;
        },
      },
      {
        id: "sans_italic",
        name: "Sans-Serif Italic",
        category: "Sans-Serif",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d5c7);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d5c1);
          return char;
        },
      },
      {
        id: "sans_bold_italic",
        name: "Sans-Serif Bold Italic",
        category: "Sans-Serif",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d5fb);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d5f5);
          return char;
        },
      },
      {
        id: "script_normal",
        name: "Cursive / Script",
        category: "Cursive",
        map: (char) => {
          const scriptGaps = {
            B: "ℬ",
            E: "ℰ",
            F: "ℱ",
            H: "ℋ",
            I: "ℐ",
            L: "ℒ",
            M: "ℳ",
            R: "ℛ",
            e: "ℯ",
            g: "ℊ",
            o: "ℴ",
          };
          if (scriptGaps[char]) return scriptGaps[char];
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d45b);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d455);
          return char;
        },
      },
      {
        id: "script_bold",
        name: "Cursive Bold",
        category: "Cursive",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d48f);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d489);
          return char;
        },
      },
      {
        id: "fraktur_normal",
        name: "Gothic / Fraktur",
        category: "Gothic",
        map: (char) => {
          const frakturGaps = {
            C: "ℭ",
            H: "ℌ",
            I: "ℑ",
            R: "ℜ",
            Z: "ℨ",
          };
          if (frakturGaps[char]) return frakturGaps[char];
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d4c3);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d4bd);
          return char;
        },
      },
      {
        id: "fraktur_bold",
        name: "Gothic Bold",
        category: "Gothic",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d52b);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d525);
          return char;
        },
      },
      {
        id: "double_struck",
        name: "Blackboard Bold / Double-Struck",
        category: "Serif",
        map: (char) => {
          const doubleStruckGaps = {
            C: "ℂ",
            H: "ℍ",
            N: "ℕ",
            P: "ℙ",
            Q: "ℚ",
            R: "ℝ",
            Z: "ℤ",
          };
          if (doubleStruckGaps[char]) return doubleStruckGaps[char];
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d4f7);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d4f1);
          if (code >= 48 && code <= 57)
            return String.fromCodePoint(code + 0x1d7a8);
          return char;
        },
      },
      {
        id: "monospace",
        name: "Monospace",
        category: "Serif",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1d62f);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1d629);
          if (code >= 48 && code <= 57)
            return String.fromCodePoint(code + 0x1d7c6);
          return char;
        },
      },
      {
        id: "circled",
        name: "Circled / Bubble",
        category: "Decorated",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x2475);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x246f);
          if (code >= 49 && code <= 57)
            return String.fromCodePoint(code + 0x2417); // ① is 0x2460 (0x2460 - 49 = 0x242F) -> wait, 0x2460 - 49 = 9312 - 49 = 9263 = 0x242F. Let's make sure.
          if (code >= 49 && code <= 57)
            return String.fromCodePoint(code + 9263);
          if (code === 48) return "⓪";
          return char;
        },
      },
      {
        id: "circled_neg",
        name: "Circled Dark / Bubble Filled",
        category: "Decorated",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1f10f); // 🅐 (0x1F150 is A)
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1f10f - 32); // Lower maps to upper dark circle
          if (code >= 49 && code <= 57)
            return String.fromCodePoint(code + 10053); // ❶ is 0x2776
          if (code === 48) return "⓿";
          return char;
        },
      },
      {
        id: "squared",
        name: "Squared",
        category: "Decorated",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1f0ef); // 🄰
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1f0ef - 32);
          return char;
        },
      },
      {
        id: "squared_neg",
        name: "Squared Dark / Filled",
        category: "Decorated",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x1f12f); // 🅰
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x1f12f - 32);
          return char;
        },
      },
      {
        id: "parenthesized",
        name: "Parenthesized",
        category: "Decorated",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code >= 65 && code <= 90)
            return String.fromCodePoint(code + 0x243b + 32);
          if (code >= 97 && code <= 122)
            return String.fromCodePoint(code + 0x243b); // ⒜ is 0x249c
          if (code >= 49 && code <= 57)
            return String.fromCodePoint(code + 0x2443); // ⑴ is 0x2474
          return char;
        },
      },
      {
        id: "small_caps",
        name: "Tiny Caps",
        category: "Decorated",
        map: (char) => smallCapsMap[char] || char,
      },
      {
        id: "wide",
        name: "Wide / Fullwidth",
        category: "Decorated",
        map: (char) => {
          const code = char.codePointAt(0);
          if (code === 32) return "　";
          if (code >= 33 && code <= 126)
            return String.fromCodePoint(code + 0xfee0);
          return char;
        },
      },
      {
        id: "superscript",
        name: "Superscript",
        category: "Decorated",
        map: (char) => superscriptMap[char] || char,
      },
      {
        id: "subscript",
        name: "Subscript",
        category: "Decorated",
        map: (char) => subscriptMap[char] || char,
      },
      {
        id: "strikethrough",
        name: "Strikethrough",
        category: "Decorated",
        applyAll: (text) =>
          text
            .split("")
            .map((c) => c + "\u0336")
            .join(""),
      },
      {
        id: "slashthrough",
        name: "Slashthrough",
        category: "Decorated",
        applyAll: (text) =>
          text
            .split("")
            .map((c) => c + "\u0338")
            .join(""),
      },
      {
        id: "underline",
        name: "Underline",
        category: "Decorated",
        applyAll: (text) =>
          text
            .split("")
            .map((c) => c + "\u0332")
            .join(""),
      },
      {
        id: "double_underline",
        name: "Double Underline",
        category: "Decorated",
        applyAll: (text) =>
          text
            .split("")
            .map((c) => c + "\u0333")
            .join(""),
      },
      {
        id: "overline",
        name: "Overline",
        category: "Decorated",
        applyAll: (text) =>
          text
            .split("")
            .map((c) => c + "\u0305")
            .join(""),
      },
      {
        id: "reversed",
        name: "Mirror / Reversed",
        category: "Decorated",
        applyAll: (text) =>
          text
            .split("")
            .map((c) => mirrorMap[c] || c)
            .join(""),
      },
      {
        id: "flip",
        name: "Upside Down",
        category: "Decorated",
        applyAll: (text) =>
          text
            .split("")
            .map((c) => flipMap[c] || c)
            .reverse()
            .join(""),
      },
      {
        id: "glitch",
        name: "Glitch / Zalgo",
        category: "Glitch",
        applyAll: (text, opts) => {
          const intensity = opts?.zalgoIntensity ?? 4;
          const up = opts?.zalgoUp ?? true;
          const mid = opts?.zalgoMid ?? true;
          const down = opts?.zalgoDown ?? true;

          return text
            .split("")
            .map((c) => {
              if (/\s/.test(c)) return c;
              let res = c;
              const count = Math.floor(Math.random() * intensity) + 1;
              for (let i = 0; i < count; i++) {
                if (up)
                  res += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
                if (mid)
                  res +=
                    ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)];
                if (down)
                  res +=
                    ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)];
              }
              return res;
            })
            .join("");
        },
      },
    ],
    [zalgoIntensity, zalgoUp, zalgoMid, zalgoDown],
  );

  // Handle Copy to clipboard
  const handleCopy = async (styleId, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(styleId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Reset advanced options to default values
  const handleResetSettings = () => {
    setExcludeNumbers(false);
    setExcludePunctuation(false);
    setExcludeSpaces(false);
    setCasingMode("none");
    setLeetStrength(0);
    setCustomDelimiter("");
    setSelectedDecorator("none");
    setZalgoIntensity(4);
    setZalgoUp(true);
    setZalgoMid(true);
    setZalgoDown(true);
  };

  // Filtered Styles list by query
  const filteredStyles = useMemo(() => {
    if (!searchQuery.trim()) return STYLES;
    const q = searchQuery.toLowerCase();
    return STYLES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [searchQuery, STYLES]);

  return (
    <ToolPageShell widthClassName="max-w-7xl px-4 pt-26 pb-10">
      <div className="dark:text-slate-100 font-sans">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-brandColor/10 text-brandColor rounded-full mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3 dark:from-slate-200 dark:to-slate-400">
            Fancy Text Generator
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto dark:text-slate-400">
            Transform plain text into cool Unicode styles, cursive fonts, gothic
            calligraphy, and glitch styles for profiles and social posts.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          {/* Left Column - Input and Options (5 Columns) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Input Panel */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/50 p-6 space-y-4 dark:bg-slate-900/80 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Type className="w-4 h-4 text-brandColor" />
                  Your Input Text
                </label>
                {inputText && (
                  <button
                    onClick={() => setInputText("")}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste your text here..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brandColor/50 focus:border-brandColor transition-all text-slate-800 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-800 dark:focus:ring-brandColor/35 resize-none font-normal"
              />

              <div className="flex justify-between text-xs text-slate-400">
                <span>{inputText.length} characters</span>
                <span>
                  {inputText.trim() === ""
                    ? 0
                    : inputText.trim().split(/\s+/).length}{" "}
                  words
                </span>
              </div>
            </div>

            {/* Advanced Options Accordion */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden dark:bg-slate-900/80 dark:border-slate-800">
              {/* Accordion Header */}
              <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full flex items-center justify-between p-5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4.5 h-4.5 text-brandColor" />
                  <span>Advanced Options</span>
                </div>
                {isAdvancedOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {/* Accordion Content */}
              <AnimatePresence initial={false}>
                {isAdvancedOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-5 bg-slate-50/20 dark:bg-slate-900/30">
                      {/* Character Casing */}
                      <div>
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Text Casing Preprocessor
                        </span>
                        <div className="grid grid-cols-5 gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/20 dark:bg-slate-800/80">
                          {[
                            { id: "none", label: "None" },
                            { id: "upper", label: "A-Z" },
                            { id: "lower", label: "a-z" },
                            { id: "alternate", label: "aLt" },
                            { id: "random", label: "Rnd" },
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setCasingMode(mode.id)}
                              className={`py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
                                casingMode === mode.id
                                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                              }`}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Leetspeak strength */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            LeetSpeak (1337)
                          </span>
                          <span className="text-xs font-bold text-brandColor">
                            {leetStrength === 0
                              ? "Off"
                              : `Level ${leetStrength}`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="3"
                          step="1"
                          value={leetStrength}
                          onChange={(e) =>
                            setLeetStrength(parseInt(e.target.value))
                          }
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brandColor dark:bg-slate-700"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>Off</span>
                          <span>Light</span>
                          <span>Medium</span>
                          <span>Extreme</span>
                        </div>
                      </div>

                      {/* Exclusions toggles */}
                      <div>
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Exclude Elements from Conversion
                        </span>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={excludeNumbers}
                              onChange={(e) =>
                                setExcludeNumbers(e.target.checked)
                              }
                              className="rounded border-slate-300 text-brandColor focus:ring-brandColor/50 h-3.5 w-3.5 cursor-pointer"
                            />
                            <span>Exclude Numbers (0-9 remain unchanged)</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={excludePunctuation}
                              onChange={(e) =>
                                setExcludePunctuation(e.target.checked)
                              }
                              className="rounded border-slate-300 text-brandColor focus:ring-brandColor/50 h-3.5 w-3.5 cursor-pointer"
                            />
                            <span>
                              Exclude Punctuation & Symbols (!, @, #, etc.)
                            </span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={excludeSpaces}
                              onChange={(e) =>
                                setExcludeSpaces(e.target.checked)
                              }
                              className="rounded border-slate-300 text-brandColor focus:ring-brandColor/50 h-3.5 w-3.5 cursor-pointer"
                            />
                            <span>Exclude Spaces (preserve raw spaces)</span>
                          </label>
                        </div>
                      </div>

                      {/* Letter Joins and Decorators */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Custom Letter Joins
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. ∙ or -"
                            maxLength={3}
                            value={customDelimiter}
                            onChange={(e) => setCustomDelimiter(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brandColor/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Decorations Wrapper
                          </span>
                          <select
                            value={selectedDecorator}
                            onChange={(e) =>
                              setSelectedDecorator(e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brandColor/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                          >
                            {DECORATORS.map((dec) => (
                              <option key={dec.id} value={dec.id}>
                                {dec.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Zalgo customization section */}
                      <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 space-y-3">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Zalgo/Glitch Text Options
                        </span>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Glitch Intensity
                              </span>
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                {zalgoIntensity}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="15"
                              step="1"
                              value={zalgoIntensity}
                              onChange={(e) =>
                                setZalgoIntensity(parseInt(e.target.value))
                              }
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brandColor dark:bg-slate-700"
                            />
                          </div>

                          <div className="flex gap-4">
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={zalgoUp}
                                onChange={(e) => setZalgoUp(e.target.checked)}
                                className="rounded border-slate-300 text-brandColor focus:ring-brandColor/50 h-3 w-3 cursor-pointer"
                              />
                              <span>Glitch Up</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={zalgoMid}
                                onChange={(e) => setZalgoMid(e.target.checked)}
                                className="rounded border-slate-300 text-brandColor focus:ring-brandColor/50 h-3 w-3 cursor-pointer"
                              />
                              <span>Glitch Mid</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={zalgoDown}
                                onChange={(e) => setZalgoDown(e.target.checked)}
                                className="rounded border-slate-300 text-brandColor focus:ring-brandColor/50 h-3 w-3 cursor-pointer"
                              />
                              <span>Glitch Down</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Reset Button */}
                      <button
                        onClick={handleResetSettings}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100/50 rounded-lg text-xs font-semibold text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800/40 dark:text-slate-400 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick tips */}
            <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 flex gap-3 text-xs text-blue-700/90 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300/90">
              <Info className="w-4.5 h-4.5 flex-shrink-0 text-blue-500" />
              <div>
                <p className="font-semibold mb-1">How unicode works</p>
                <p>
                  These fonts use special mathematically symbols and alphabetic
                  characters from extended Unicode. Some systems/apps
                  (especially older games or sites) may not render all styles
                  correctly.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Transformed outputs grid (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search and Filters */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search style names (e.g. Cursive, Bold, Bubble)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-brandColor/50 focus:border-brandColor transition-all text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:focus:ring-brandColor/35"
              />
            </div>

            {/* Outputs List */}
            <div className="space-y-3.5">
              {filteredStyles.length > 0 ? (
                filteredStyles.map((style) => {
                  const outputVal = transformText(
                    inputText || "Preview",
                    style,
                  );
                  const isCopied = copiedId === style.id;

                  return (
                    <div
                      key={style.id}
                      className="bg-white border border-slate-200/60 rounded-xl shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 hover:shadow-sm hover:border-slate-300/80 transition-all dark:bg-slate-900 dark:border-slate-800/80 dark:hover:border-slate-700"
                    >
                      <div className="space-y-1 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {style.name}
                          </span>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {style.category}
                          </span>
                        </div>
                        <p suppressHydrationWarning className="text-[15px] font-mono leading-relaxed break-all font-medium text-slate-800 dark:text-slate-100">
                          {outputVal}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopy(style.id, outputVal)}
                        className={`md:self-center flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isCopied
                            ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl dark:bg-slate-900/50">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No matching font styles found for "{searchQuery}".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
