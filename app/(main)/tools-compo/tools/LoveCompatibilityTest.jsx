"use client";
import React, { useState, useRef, useEffect } from "react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";

// ─── Constants ────────────────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const LOVE_LANGUAGES = [
  "Words of Affirmation",
  "Acts of Service",
  "Receiving Gifts",
  "Quality Time",
  "Physical Touch",
];

const RELATIONSHIP_GOALS = [
  "Marriage & Family",
  "Long-term Partnership",
  "Casual Dating",
  "Friendship First",
  "Career-Focused Couple",
];

const PERSONALITY_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

// ─── Zodiac compatibility matrix ─────────────────────────────────────────────

const ZODIAC_COMPAT = {
  Aries:       { Aries:72, Taurus:45, Gemini:80, Cancer:50, Leo:92, Virgo:48, Libra:75, Scorpio:60, Sagittarius:88, Capricorn:42, Aquarius:78, Pisces:55 },
  Taurus:      { Aries:45, Taurus:85, Gemini:50, Cancer:90, Leo:60, Virgo:95, Libra:70, Scorpio:88, Sagittarius:42, Capricorn:92, Aquarius:52, Pisces:80 },
  Gemini:      { Aries:80, Taurus:50, Gemini:75, Cancer:55, Leo:85, Virgo:60, Libra:92, Scorpio:48, Sagittarius:82, Capricorn:45, Aquarius:90, Pisces:55 },
  Cancer:      { Aries:50, Taurus:90, Gemini:55, Cancer:80, Leo:62, Virgo:82, Libra:58, Scorpio:95, Sagittarius:45, Capricorn:75, Aquarius:50, Pisces:92 },
  Leo:         { Aries:92, Taurus:60, Gemini:85, Cancer:62, Leo:78, Virgo:52, Libra:88, Scorpio:58, Sagittarius:90, Capricorn:48, Aquarius:72, Pisces:55 },
  Virgo:       { Aries:48, Taurus:95, Gemini:60, Cancer:82, Leo:52, Virgo:85, Libra:65, Scorpio:88, Sagittarius:45, Capricorn:90, Aquarius:55, Pisces:80 },
  Libra:       { Aries:75, Taurus:70, Gemini:92, Cancer:58, Leo:88, Virgo:65, Libra:80, Scorpio:62, Sagittarius:82, Capricorn:55, Aquarius:92, Pisces:65 },
  Scorpio:     { Aries:60, Taurus:88, Gemini:48, Cancer:95, Leo:58, Virgo:88, Libra:62, Scorpio:82, Sagittarius:50, Capricorn:85, Aquarius:55, Pisces:92 },
  Sagittarius: { Aries:88, Taurus:42, Gemini:82, Cancer:45, Leo:90, Virgo:45, Libra:82, Scorpio:50, Sagittarius:80, Capricorn:48, Aquarius:88, Pisces:60 },
  Capricorn:   { Aries:42, Taurus:92, Gemini:45, Cancer:75, Leo:48, Virgo:90, Libra:55, Scorpio:85, Sagittarius:48, Capricorn:88, Aquarius:60, Pisces:75 },
  Aquarius:    { Aries:78, Taurus:52, Gemini:90, Cancer:50, Leo:72, Virgo:55, Libra:92, Scorpio:55, Sagittarius:88, Capricorn:60, Aquarius:82, Pisces:68 },
  Pisces:      { Aries:55, Taurus:80, Gemini:55, Cancer:92, Leo:55, Virgo:80, Libra:65, Scorpio:92, Sagittarius:60, Capricorn:75, Aquarius:68, Pisces:85 },
};

// MBTI compatibility (simplified element-based)
const MBTI_COMPAT = {
  INTJ:["ENFP","ENTP","INFJ","INTJ"], INTP:["ENTJ","ENTP","INTJ","INTP"],
  ENTJ:["INFP","INTP","INTJ","ENFJ"], ENTP:["INFJ","INTJ","INTP","ENTJ"],
  INFJ:["ENTP","ENFP","INFJ","INTJ"], INFP:["ENTJ","ENFJ","INFP","ENFP"],
  ENFJ:["INFP","ISFP","ENFJ","INFJ"], ENFP:["INTJ","INFJ","ENFP","ENTP"],
  ISTJ:["ESFP","ESTP","ISFJ","ISTJ"], ISFJ:["ESFP","ESTP","ISTJ","ISFJ"],
  ESTJ:["ISFP","ISTP","ESFJ","ESTJ"], ESFJ:["ISFP","ISTP","ESTJ","ESFJ"],
  ISTP:["ESFJ","ESTJ","ISFP","ISTP"], ISFP:["ESFJ","ESTJ","ENFJ","INFJ"],
  ESTP:["ISFJ","ISTJ","ESFP","ESTP"], ESFP:["ISFJ","ISTJ","ESTP","ESFP"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const nameScore = (name) => {
  if (!name) return 0;
  const n = name.trim().toLowerCase();
  let sum = 0;
  for (let c of n) {
    const code = c.charCodeAt(0) - 96;
    if (code > 0 && code <= 26) sum += code;
  }
  while (sum > 9) {
    sum = String(sum).split("").reduce((a, b) => a + Number(b), 0);
  }
  return sum;
};

const numerologyCompat = (a, b) => {
  const s = nameScore(a) + nameScore(b);
  const combo = s > 9 ? String(s).split("").reduce((x, y) => x + Number(y), 0) : s;
  // Map 0-9 → compatibility score
  const table = { 0:60, 1:85, 2:78, 3:90, 4:72, 5:80, 6:92, 7:74, 8:83, 9:88 };
  return table[combo] ?? 70;
};

const loveLanguageCompat = (a, b) => {
  if (!a || !b) return 75;
  if (a === b) return 96;
  const close = {
    "Words of Affirmation": ["Quality Time", "Acts of Service"],
    "Acts of Service":      ["Words of Affirmation", "Quality Time"],
    "Receiving Gifts":      ["Words of Affirmation", "Physical Touch"],
    "Quality Time":         ["Words of Affirmation", "Acts of Service"],
    "Physical Touch":       ["Quality Time", "Receiving Gifts"],
  };
  return (close[a] || []).includes(b) ? 82 : 65;
};

const goalCompat = (a, b) => {
  if (!a || !b) return 75;
  if (a === b) return 98;
  const semi = {
    "Marriage & Family":       ["Long-term Partnership"],
    "Long-term Partnership":   ["Marriage & Family", "Friendship First"],
    "Casual Dating":           ["Career-Focused Couple"],
    "Friendship First":        ["Long-term Partnership"],
    "Career-Focused Couple":   ["Casual Dating", "Long-term Partnership"],
  };
  return (semi[a] || []).includes(b) ? 78 : 48;
};

const mbtiCompat = (a, b) => {
  if (!a || !b) return 75;
  if (a === b) return 70;
  const compat = MBTI_COMPAT[a] || [];
  if (compat.includes(b)) return 92;
  // Same temperament (NF, NT, SP, SJ)
  const temper = (t) => (t[1] === "N" && t[2] === "F") ? "NF"
    : (t[1] === "N" && t[2] === "T") ? "NT"
    : (t[1] === "S" && t[3] === "P") ? "SP" : "SJ";
  return temper(a) === temper(b) ? 80 : 58;
};

const calculate = (form) => {
  const weights = [];
  const scores = [];

  // Name numerology (always)
  weights.push(25);
  scores.push(numerologyCompat(form.name1, form.name2));

  // Zodiac (always)
  weights.push(25);
  const z = ZODIAC_COMPAT[form.zodiac1]?.[form.zodiac2] ?? 70;
  scores.push(z);

  // Age compatibility (always)
  weights.push(10);
  const ageDiff = Math.abs((parseInt(form.age1) || 25) - (parseInt(form.age2) || 25));
  const ageScore = Math.max(40, 100 - ageDiff * 3);
  scores.push(ageScore);

  // Advanced options
  if (form.loveLanguage1 && form.loveLanguage2) {
    weights.push(15);
    scores.push(loveLanguageCompat(form.loveLanguage1, form.loveLanguage2));
  }
  if (form.goal1 && form.goal2) {
    weights.push(15);
    scores.push(goalCompat(form.goal1, form.goal2));
  }
  if (form.mbti1 && form.mbti2) {
    weights.push(10);
    scores.push(mbtiCompat(form.mbti1, form.mbti2));
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weighted = scores.reduce((sum, s, i) => sum + s * weights[i], 0);
  const overall = Math.round(weighted / totalWeight);

  return {
    overall,
    numerology: scores[0],
    zodiac: scores[1],
    age: scores[2],
    loveLanguage: form.loveLanguage1 && form.loveLanguage2 ? scores[3] : null,
    goal: form.goal1 && form.goal2 ? scores[weights.indexOf(15, 4) >= 0 ? 4 : 3] : null,
    mbti: form.mbti1 && form.mbti2 ? scores[scores.length - 1] : null,
  };
};

const getLevel = (score) => {
  if (score >= 90) return { label: "Soulmate ✨", color: "#f43f5e", emoji: "💘", desc: "An extraordinary match — your energies align at the deepest level. This connection is rare and powerful." };
  if (score >= 75) return { label: "Highly Compatible 💖", color: "#ec4899", emoji: "❤️", desc: "A strong and beautiful connection. You complement each other wonderfully with mutual understanding." };
  if (score >= 60) return { label: "Good Match 💕", color: "#a855f7", emoji: "💕", desc: "A promising relationship with a solid foundation. With effort and communication, this can flourish." };
  if (score >= 45) return { label: "Moderate Compatibility 💬", color: "#8b5cf6", emoji: "💬", desc: "You have differences to work through, but shared values can bridge the gap between you." };
  return { label: "Challenging Match 🌱", color: "#6366f1", emoji: "🌱", desc: "Growth comes from challenge. Opposites can attract, but this pairing requires extra patience and understanding." };
};

const ZODIAC_TRAITS = {
  Aries: "Bold, energetic, passionate leader",
  Taurus: "Loyal, sensual, grounded and patient",
  Gemini: "Witty, adaptable, curious communicator",
  Cancer: "Nurturing, intuitive, deeply emotional",
  Leo: "Charismatic, generous, warm-hearted",
  Virgo: "Analytical, devoted, perfectionist",
  Libra: "Charming, diplomatic, romance-seeking",
  Scorpio: "Intense, magnetic, fiercely loyal",
  Sagittarius: "Adventurous, philosophical, free-spirited",
  Capricorn: "Ambitious, reliable, disciplined",
  Aquarius: "Original, intellectual, humanitarian",
  Pisces: "Empathetic, dreamy, deeply romantic",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ScoreBar = ({ label, value, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const color =
    value >= 85 ? "#f43f5e"
    : value >= 70 ? "#ec4899"
    : value >= 55 ? "#a855f7"
    : "#6366f1";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
          }}
        />
      </div>
    </div>
  );
};

const InputField = ({ label, id, value, onChange, type = "text", placeholder, min, max }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400/60 dark:focus:ring-pink-500/60 focus:border-pink-400 dark:focus:border-pink-500 transition-all duration-200 text-sm shadow-sm"
    />
  </div>
);

const SelectField = ({ label, id, value, onChange, options, placeholder }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60 dark:focus:ring-pink-500/60 focus:border-pink-400 dark:focus:border-pink-500 transition-all duration-200 text-sm shadow-sm cursor-pointer appearance-none"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
    >
      <option value="" disabled hidden>{placeholder || "Select..."}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const HeartPulse = ({ score }) => {
  const level = getLevel(score);
  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{ background: `radial-gradient(circle, ${level.color}33 30%, transparent 70%)` }}
      />
      {/* Circular progress */}
      <svg width="180" height="180" className="absolute inset-0 -rotate-90">
        <circle cx="90" cy="90" r="78" fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:opacity-20" />
        <circle
          cx="90" cy="90" r="78"
          fill="none"
          stroke={level.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 78}`}
          strokeDashoffset={`${2 * Math.PI * 78 * (1 - score / 100)}`}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.25,1,0.5,1)", filter: `drop-shadow(0 0 8px ${level.color}80)` }}
        />
      </svg>
      <div className="relative text-center z-10">
        <div className="text-4xl font-black leading-none" style={{ color: level.color }}>{score}%</div>
        <div className="text-2xl mt-1">{level.emoji}</div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const INITIAL_FORM = {
  name1: "", name2: "",
  age1: "", age2: "",
  zodiac1: "", zodiac2: "",
  loveLanguage1: "", loveLanguage2: "",
  goal1: "", goal2: "",
  mbti1: "", mbti2: "",
};

export default function LoveCompatibilityTest() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const resultRef = useRef(null);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name1.trim()) errs.name1 = "Required";
    if (!form.name2.trim()) errs.name2 = "Required";
    if (!form.zodiac1) errs.zodiac1 = "Required";
    if (!form.zodiac2) errs.zodiac2 = "Required";
    if (form.age1 && (isNaN(form.age1) || form.age1 < 13 || form.age1 > 120)) errs.age1 = "13-120";
    if (form.age2 && (isNaN(form.age2) || form.age2 < 13 || form.age2 > 120)) errs.age2 = "13-120";
    return errs;
  };

  const handleCalculate = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsAnimating(true);
    setTimeout(() => {
      setResult(calculate(form));
      setIsAnimating(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 1200);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setErrors({});
    setShowAdvanced(false);
  };

  const level = result ? getLevel(result.overall) : null;

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="tool-page-content px-2 sm:px-4 pb-12">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <BackButton />
          <div className="flex-1" />
          <FavoriteButton toolLink="/tools/love-compatibility-test" />
        </div>

        {/* ── Hero ── */}
        <div className="text-center mb-10 relative">
          {/* Floating hearts decoration */}
          <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
            {["❤️","💕","💖","💗","💓"].map((h, i) => (
              <span
                key={i}
                className="absolute text-2xl opacity-20 dark:opacity-10"
                style={{
                  left: `${10 + i * 20}%`,
                  top: `${Math.sin(i) * 30 + 20}%`,
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}
              >{h}</span>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/40 text-pink-600 dark:text-pink-400 text-sm font-semibold mb-4">
            💘 Powered by Numerology & Astrology
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            Love Compatibility{" "}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Test
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover how compatible you and your partner are using name numerology, zodiac astrology, love languages, personality types, and more.
          </p>
        </div>

        {/* ── Main Card ── */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl shadow-gray-200/60 dark:shadow-black/40 overflow-hidden">

          {/* Pink gradient top strip */}
          <div className="h-1.5 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500" />

          <div className="p-6 md:p-8">

            {/* ── Two-column form ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Person 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-md">1</div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Person 1</h2>
                </div>

                <div>
                  <InputField label="Full Name" id="name1" value={form.name1} onChange={set("name1")} placeholder="e.g. Alice Johnson" />
                  {errors.name1 && <p className="text-xs text-rose-500 mt-1">{errors.name1}</p>}
                </div>

                <InputField label="Age (optional)" id="age1" value={form.age1} onChange={set("age1")} type="number" placeholder="e.g. 24" min={13} max={120} />

                <div>
                  <SelectField label="Zodiac Sign" id="zodiac1" value={form.zodiac1} onChange={set("zodiac1")} options={ZODIAC_SIGNS} placeholder="Select zodiac" />
                  {errors.zodiac1 && <p className="text-xs text-rose-500 mt-1">{errors.zodiac1}</p>}
                </div>

                {form.zodiac1 && (
                  <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30">
                    <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">✨ {form.zodiac1}: <span className="font-normal text-pink-500 dark:text-pink-300">{ZODIAC_TRAITS[form.zodiac1]}</span></p>
                  </div>
                )}
              </div>

              {/* Person 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md">2</div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Person 2</h2>
                </div>

                <div>
                  <InputField label="Full Name" id="name2" value={form.name2} onChange={set("name2")} placeholder="e.g. Bob Smith" />
                  {errors.name2 && <p className="text-xs text-rose-500 mt-1">{errors.name2}</p>}
                </div>

                <InputField label="Age (optional)" id="age2" value={form.age2} onChange={set("age2")} type="number" placeholder="e.g. 27" min={13} max={120} />

                <div>
                  <SelectField label="Zodiac Sign" id="zodiac2" value={form.zodiac2} onChange={set("zodiac2")} options={ZODIAC_SIGNS} placeholder="Select zodiac" />
                  {errors.zodiac2 && <p className="text-xs text-rose-500 mt-1">{errors.zodiac2}</p>}
                </div>

                {form.zodiac2 && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">✨ {form.zodiac2}: <span className="font-normal text-purple-500 dark:text-purple-300">{ZODIAC_TRAITS[form.zodiac2]}</span></p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Advanced Options Toggle ── */}
            <div className="mt-8">
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-pink-400 hover:text-pink-500 dark:hover:border-pink-500 dark:hover:text-pink-400 transition-all duration-200 text-sm font-semibold w-full justify-center"
              >
                <span className="text-base transition-transform duration-300" style={{ transform: showAdvanced ? "rotate(45deg)" : "rotate(0deg)", display:"inline-block" }}>⚙️</span>
                {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400 border border-pink-200 dark:border-pink-800/40 font-medium">
                  Deeper Analysis
                </span>
              </button>

              {/* Advanced Panel */}
              <div
                style={{
                  maxHeight: showAdvanced ? "1000px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 border border-pink-100 dark:border-pink-900/30 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-pink-400 to-purple-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">Advanced Compatibility Factors</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">(optional — improves accuracy)</span>
                  </div>

                  {/* Love Languages */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-pink-500 dark:text-pink-400 mb-3">💌 Love Language</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField label="Person 1's Love Language" id="ll1" value={form.loveLanguage1} onChange={set("loveLanguage1")} options={LOVE_LANGUAGES} placeholder="Select..." />
                      <SelectField label="Person 2's Love Language" id="ll2" value={form.loveLanguage2} onChange={set("loveLanguage2")} options={LOVE_LANGUAGES} placeholder="Select..." />
                    </div>
                    {form.loveLanguage1 && form.loveLanguage2 && form.loveLanguage1 !== form.loveLanguage2 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                        <span>⚠️</span> Different love languages — understanding each other&apos;s needs is key.
                      </p>
                    )}
                  </div>

                  {/* Relationship Goal */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-500 dark:text-purple-400 mb-3">🎯 Relationship Goals</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField label="Person 1's Goal" id="goal1" value={form.goal1} onChange={set("goal1")} options={RELATIONSHIP_GOALS} placeholder="Select..." />
                      <SelectField label="Person 2's Goal" id="goal2" value={form.goal2} onChange={set("goal2")} options={RELATIONSHIP_GOALS} placeholder="Select..." />
                    </div>
                  </div>

                  {/* MBTI */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-3">🧠 Personality Type (MBTI)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField label="Person 1's MBTI" id="mbti1" value={form.mbti1} onChange={set("mbti1")} options={PERSONALITY_TYPES} placeholder="Select..." />
                      <SelectField label="Person 2's MBTI" id="mbti2" value={form.mbti2} onChange={set("mbti2")} options={PERSONALITY_TYPES} placeholder="Select..." />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Don&apos;t know your type? Take a free test at <a href="https://www.16personalities.com" target="_blank" rel="noopener noreferrer" className="text-violet-500 underline">16personalities.com</a></p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCalculate}
                disabled={isAnimating}
                className="flex-1 relative overflow-hidden py-4 px-6 rounded-2xl font-bold text-white text-base shadow-lg shadow-pink-500/30 dark:shadow-pink-600/20 transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899, #a855f7)" }}
              >
                {isAnimating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Calculating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">💘 Calculate Compatibility</span>
                )}
                {/* shimmer */}
                <span className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent translate-x-full hover:translate-x-0 transition-transform duration-700 pointer-events-none" />
              </button>
              {result && (
                <button
                  onClick={handleReset}
                  className="py-4 px-6 rounded-2xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-base"
                >
                  🔄 Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        {result && (
          <div ref={resultRef} className="mt-8 space-y-6" style={{ animation: "fadeSlideUp 0.6s ease both" }}>

            {/* Main Score Card */}
            <div
              className="rounded-2xl overflow-hidden border shadow-xl"
              style={{
                borderColor: level.color + "40",
                background: `linear-gradient(135deg, ${level.color}08, ${level.color}15)`,
                boxShadow: `0 20px 60px ${level.color}20`,
              }}
            >
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${level.color}, ${level.color}80)` }} />
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Circle gauge */}
                  <div className="flex-shrink-0">
                    <HeartPulse score={result.overall} />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ background: level.color + "20", color: level.color }}>
                      Compatibility Result
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2"
                      style={{ textShadow: `0 0 40px ${level.color}40` }}>
                      {level.label}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
                      {level.desc}
                    </p>
                    {/* Names badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{form.name1}</span>
                      <span className="text-pink-500">💝</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{form.name2}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-pink-400 to-purple-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Compatibility Breakdown</h3>
              </div>
              <div className="space-y-4">
                <ScoreBar label="🔮 Name Numerology" value={result.numerology} delay={0} />
                <ScoreBar label="♈ Zodiac Compatibility" value={result.zodiac} delay={100} />
                <ScoreBar label="🎂 Age Compatibility" value={result.age} delay={200} />
                {result.loveLanguage !== null && (
                  <ScoreBar label="💌 Love Language Match" value={result.loveLanguage} delay={300} />
                )}
                {result.goal !== null && (
                  <ScoreBar label="🎯 Relationship Goals" value={result.goal} delay={400} />
                )}
                {result.mbti !== null && (
                  <ScoreBar label="🧠 Personality (MBTI)" value={result.mbti} delay={500} />
                )}
              </div>
            </div>

            {/* Zodiac Insight Card */}
            {form.zodiac1 && form.zodiac2 && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Zodiac Insight</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: form.name1, sign: form.zodiac1, grad: "from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10", border: "border-pink-100 dark:border-pink-900/30", c: "text-pink-600 dark:text-pink-400" },
                    { name: form.name2, sign: form.zodiac2, grad: "from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10", border: "border-purple-100 dark:border-purple-900/30", c: "text-purple-600 dark:text-purple-400" },
                  ].map(({ name, sign, grad, border, c }) => (
                    <div key={sign} className={`p-5 rounded-xl bg-gradient-to-br ${grad} border ${border}`}>
                      <p className={`text-xs font-bold uppercase tracking-widest ${c} mb-1`}>{name || "Person"}</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white mb-2">{sign}</p>
                      <p className={`text-sm ${c} leading-relaxed`}>{ZODIAC_TRAITS[sign]}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <span className="font-bold">{form.zodiac1} × {form.zodiac2}:</span>{" "}
                    {result.zodiac >= 80
                      ? "An astrologically blessed pairing with natural chemistry and deep understanding."
                      : result.zodiac >= 60
                      ? "A complementary match with potential for a harmonious and balanced relationship."
                      : "Contrasting energies that, with patience and openness, can lead to meaningful growth."}
                  </p>
                </div>
              </div>
            )}

            {/* Numerology Insight */}
            {form.name1 && form.name2 && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-400 to-indigo-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Name Numerology</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: form.name1.trim() || "Person 1", value: nameScore(form.name1), sub: "Life Path" },
                    { label: form.name2.trim() || "Person 2", value: nameScore(form.name2), sub: "Life Path" },
                    { label: "Combined", value: (() => { const s = nameScore(form.name1) + nameScore(form.name2); return s > 9 ? String(s).split("").reduce((a, b) => a + Number(b), 0) : s; })(), sub: "Soul Number" },
                    { label: "Match Score", value: result.numerology + "%", sub: "Numerology", isScore: true },
                  ].map(({ label, value, sub, isScore }) => (
                    <div key={label} className="text-center p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30">
                      <p className="text-xs text-violet-500 dark:text-violet-400 font-semibold uppercase tracking-widest mb-1">{label}</p>
                      <p className={`font-black ${isScore ? "text-2xl text-pink-500 dark:text-pink-400" : "text-3xl text-violet-600 dark:text-violet-300"}`}>{value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Card */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">💡 Relationship Tips</h3>
              </div>
              <ul className="space-y-3">
                {[
                  result.overall >= 80
                    ? "Celebrate your natural connection — but never stop nurturing it with small daily acts of love."
                    : result.overall >= 60
                    ? "Build on your strengths and openly discuss differences to create a resilient bond."
                    : "Focus on shared values and be patient. Growth takes time, and challenges can strengthen love.",
                  form.loveLanguage1 && form.loveLanguage2 && form.loveLanguage1 !== form.loveLanguage2
                    ? `Bridge the gap: ${form.name1 || "Person 1"} speaks '${form.loveLanguage1}' while ${form.name2 || "Person 2"} prefers '${form.loveLanguage2}'. Try expressing love in each other's language weekly.`
                    : form.loveLanguage1 === form.loveLanguage2 && form.loveLanguage1
                    ? `You share the same love language (${form.loveLanguage1}) — this is a powerful advantage for mutual fulfilment!`
                    : "Understanding your partner's love language is one of the most powerful relationship tools.",
                  form.goal1 && form.goal2 && form.goal1 !== form.goal2
                    ? `Align your futures: discuss how '${form.goal1}' and '${form.goal2}' can be compatible visions.`
                    : "Set shared goals together — having a common vision creates a lasting sense of purpose.",
                  "Regular honest communication is the foundation of every healthy relationship.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-2">
              ✨ This tool is for entertainment and self-reflection purposes. Real compatibility is built through communication, trust, and shared experiences.
            </p>
          </div>
        )}

        {/* Info Section */}
        {!result && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: "🔮", title: "Name Numerology", desc: "Ancient numerology converts your names into life path numbers and calculates their vibrational harmony." },
              { emoji: "♈", title: "Zodiac Astrology", desc: "Based on traditional astrological compatibility between your sun signs and elemental energies." },
              { emoji: "💌", title: "Love Languages", desc: "Dr. Gary Chapman's 5 Love Languages framework reveals how you give and receive affection." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-2xl mb-3">{emoji}</div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global styles for this page */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToolPageShell>
  );
}
