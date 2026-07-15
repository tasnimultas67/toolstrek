"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, ShieldCheck, ShieldAlert, ShieldX, Shield,
  Copy, Check, RefreshCw, Info, ChevronDown, ChevronUp,
  Clock, Zap, AlertTriangle, CheckCircle2, XCircle,
  Lock, Unlock, BarChart3, Hash, Key,
} from "lucide-react";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";

const COMMON_PASSWORDS = new Set([
  "password","123456","password1","qwerty","abc123","monkey","1234567",
  "letmein","trustno1","dragon","baseball","iloveyou","master","sunshine",
  "ashley","bailey","passw0rd","shadow","123123","654321","superman","qazwsx",
  "michael","football","password123","welcome","login","admin","password!",
  "123456789","12345678","12345","1234567890","000000","111111","1234","987654321",
  "pass","letmein123","qwertyuiop","zxcvbnm","asdfghjkl",
]);

const KEYBOARD_SEQUENCES = [
  "qwerty","asdfgh","zxcvbn","qwertyuiop","asdfghjkl","zxcvbnm",
  "12345","123456","1234567","12345678","123456789","1234567890",
  "abcdef","abcdefg","abcdefgh",
];

function detectKeyboardPattern(pwd) {
  const p = pwd.toLowerCase();
  return KEYBOARD_SEQUENCES.some((seq) => p.includes(seq));
}

function detectRepeatedChars(pwd) {
  return /(.)\1{2,}/.test(pwd);
}

function detectLeetSpeak(pwd) {
  const leetMap = { "4":"a","3":"e","1":"i","0":"o","5":"s","@":"a","$":"s" };
  let decoded = pwd.toLowerCase();
  for (const [k, v] of Object.entries(leetMap)) decoded = decoded.split(k).join(v);
  return COMMON_PASSWORDS.has(decoded) && decoded !== pwd.toLowerCase();
}

function calcEntropy(pwd) {
  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/[0-9]/.test(pwd)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pwd)) pool += 32;
  return pool > 0 ? Math.log2(pool) * pwd.length : 0;
}

function crackTimeLabel(entropy) {
  const combinations = Math.pow(2, entropy);
  const guessesPerSec = 1e10;
  const seconds = combinations / guessesPerSec;
  if (seconds < 1) return { label: "Instantly", color: "#ef4444" };
  if (seconds < 60) return { label: Math.round(seconds) + " seconds", color: "#f97316" };
  if (seconds < 3600) return { label: Math.round(seconds / 60) + " minutes", color: "#f59e0b" };
  if (seconds < 86400) return { label: Math.round(seconds / 3600) + " hours", color: "#eab308" };
  if (seconds < 2592000) return { label: Math.round(seconds / 86400) + " days", color: "#84cc16" };
  if (seconds < 31536000) return { label: Math.round(seconds / 2592000) + " months", color: "#22c55e" };
  if (seconds < 3153600000) return { label: Math.round(seconds / 31536000) + " years", color: "#10b981" };
  if (seconds < 3.15e13) return { label: Math.round(seconds / 3153600000) + " centuries", color: "#6366f1" };
  return { label: "Millions of years", color: "#8b5cf6" };
}

function analyzePassword(pwd) {
  if (!pwd) return null;
  const checks = {
    minLength: pwd.length >= 8,
    goodLength: pwd.length >= 12,
    strongLength: pwd.length >= 16,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumbers: /[0-9]/.test(pwd),
    hasSymbols: /[^A-Za-z0-9]/.test(pwd),
    noCommon: !COMMON_PASSWORDS.has(pwd.toLowerCase()),
    noKeyboard: !detectKeyboardPattern(pwd),
    noRepeated: !detectRepeatedChars(pwd),
    noLeet: !detectLeetSpeak(pwd),
    hasUniqueChars: new Set(pwd.toLowerCase()).size >= Math.max(5, pwd.length * 0.5),
  };
  const entropy = calcEntropy(pwd);
  const crackTime = crackTimeLabel(entropy);
  let score = 0;
  if (pwd.length >= 6) score += 10;
  if (pwd.length >= 8) score += 10;
  if (pwd.length >= 12) score += 15;
  if (pwd.length >= 16) score += 10;
  if (pwd.length >= 20) score += 5;
  if (checks.hasLowercase) score += 10;
  if (checks.hasUppercase) score += 10;
  if (checks.hasNumbers) score += 10;
  if (checks.hasSymbols) score += 15;
  if (!checks.noCommon) score -= 30;
  if (!checks.noKeyboard) score -= 15;
  if (!checks.noRepeated) score -= 10;
  if (!checks.noLeet) score -= 10;
  if (!checks.hasUniqueChars) score -= 10;
  score = Math.max(0, Math.min(100, score));
  const strengthLevel =
    score < 20 ? { label: "Very Weak", color: "#ef4444", gradient: "from-red-500 to-red-600", icon: "ShieldX" }
    : score < 40 ? { label: "Weak", color: "#f97316", gradient: "from-orange-500 to-red-500", icon: "ShieldAlert" }
    : score < 60 ? { label: "Fair", color: "#f59e0b", gradient: "from-yellow-400 to-orange-500", icon: "Shield" }
    : score < 75 ? { label: "Good", color: "#22c55e", gradient: "from-green-400 to-emerald-500", icon: "ShieldCheck" }
    : score < 90 ? { label: "Strong", color: "#10b981", gradient: "from-emerald-400 to-teal-500", icon: "ShieldCheck" }
    : { label: "Very Strong", color: "#6366f1", gradient: "from-violet-500 to-indigo-500", icon: "ShieldCheck" };
  const charDist = {
    uppercase: (pwd.match(/[A-Z]/g) || []).length,
    lowercase: (pwd.match(/[a-z]/g) || []).length,
    numbers: (pwd.match(/[0-9]/g) || []).length,
    symbols: (pwd.match(/[^A-Za-z0-9]/g) || []).length,
  };
  const suggestions = [];
  if (!checks.minLength) suggestions.push({ text: "Use at least 8 characters", type: "error" });
  else if (!checks.goodLength) suggestions.push({ text: "Consider using 12+ characters for better security", type: "warning" });
  else if (!checks.strongLength) suggestions.push({ text: "16+ characters would make this very strong", type: "info" });
  if (!checks.hasUppercase) suggestions.push({ text: "Add uppercase letters (A-Z)", type: "error" });
  if (!checks.hasLowercase) suggestions.push({ text: "Add lowercase letters (a-z)", type: "error" });
  if (!checks.hasNumbers) suggestions.push({ text: "Include numbers (0-9)", type: "warning" });
  if (!checks.hasSymbols) suggestions.push({ text: "Add special symbols (!@#$%...)", type: "warning" });
  if (!checks.noCommon) suggestions.push({ text: "This is a commonly used password - avoid it!", type: "error" });
  if (!checks.noKeyboard) suggestions.push({ text: "Avoid keyboard patterns (qwerty, 12345...)", type: "error" });
  if (!checks.noRepeated) suggestions.push({ text: "Avoid repeated characters (aaa, 111...)", type: "warning" });
  if (!checks.hasUniqueChars) suggestions.push({ text: "Use more unique characters", type: "warning" });
  return { score, strengthLevel, entropy, crackTime, checks, charDist, suggestions };
}

function ScoreRing({ score, color }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} strokeWidth="10" fill="none" className="stroke-gray-200 dark:stroke-gray-700" />
        <motion.circle
          cx="70" cy="70" r={radius} strokeWidth="10" fill="none"
          stroke={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span key={score} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-3xl font-black" style={{ color }}>{score}</motion.span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">/ 100</span>
      </div>
    </div>
  );
}

function StrengthBar({ score, gradient }) {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
      <motion.div className={"h-full rounded-full bg-gradient-to-r " + gradient} initial={{ width: 0 }} animate={{ width: score + "%" }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </div>
  );
}

function CheckItem({ label, passed }) {
  return (
    <div className="flex items-center gap-2.5">
      <AnimatePresence mode="wait">
        <motion.div key={passed ? "pass" : "fail"} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
          {passed
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            : <XCircle className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />}
        </motion.div>
      </AnimatePresence>
      <span className={"text-sm font-medium " + (passed ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600")}>{label}</span>
    </div>
  );
}

function SuggestionItem({ text, type }) {
  const styles = {
    error: { icon: XCircle, cls: "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
    warning: { icon: AlertTriangle, cls: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
    info: { icon: Info, cls: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
  };
  const { icon: Icon, cls } = styles[type] || styles.info;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className={"flex items-start gap-2 px-3 py-2 rounded-lg border text-xs font-medium " + cls}>
      <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      <span>{text}</span>
    </motion.div>
  );
}

function CharDistBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <span className="font-bold text-gray-700 dark:text-gray-300">{count}</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ duration: 0.6, ease: "easeOut" }} />
      </div>
    </div>
  );
}

const SHIELD_ICONS = { ShieldX, ShieldAlert, Shield, ShieldCheck };

export default function PasswordStrengthTester() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorOptions, setGeneratorOptions] = useState({
    length: 16, uppercase: true, lowercase: true, numbers: true,
    symbols: true, avoidAmbiguous: false, noRepeating: false,
  });

  useEffect(() => { setAnalysis(analyzePassword(password)); }, [password]);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const generateStrongPassword = useCallback(() => {
    const { length, uppercase, lowercase, numbers, symbols, avoidAmbiguous, noRepeating } = generatorOptions;
    const ambiguous = "iIlL1oO0";
    let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let num = "0123456789";
    let sym = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    if (avoidAmbiguous) {
      for (const ch of ambiguous) { upper = upper.split(ch).join(""); lower = lower.split(ch).join(""); num = num.split(ch).join(""); }
    }
    let pool = [uppercase && upper, lowercase && lower, numbers && num, symbols && sym].filter(Boolean).join("");
    if (!pool) return;
    const arr = new Uint32Array(length * 3);
    crypto.getRandomValues(arr);
    let result = ""; let i = 0;
    while (result.length < length && i < arr.length) {
      const ch = pool[arr[i] % pool.length];
      if (noRepeating && result.endsWith(ch)) { i++; continue; }
      result += ch; i++;
    }
    const requiredSets = [uppercase && upper, lowercase && lower, numbers && num, symbols && sym].filter(Boolean);
    let finalResult = result.split("");
    for (let s = 0; s < requiredSets.length; s++) {
      if (!finalResult.some((c) => requiredSets[s].includes(c))) {
        const rnd = new Uint32Array(1); crypto.getRandomValues(rnd);
        finalResult[s] = requiredSets[s][rnd[0] % requiredSets[s].length];
      }
    }
    for (let k = finalResult.length - 1; k > 0; k--) {
      const rnd = new Uint32Array(1); crypto.getRandomValues(rnd);
      const j = rnd[0] % (k + 1);
      [finalResult[k], finalResult[j]] = [finalResult[j], finalResult[k]];
    }
    setPassword(finalResult.join(""));
  }, [generatorOptions]);

  const ShieldIcon = analysis ? (SHIELD_ICONS[analysis.strengthLevel.icon] || Shield) : Shield;

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Lock className="w-3.5 h-3.5" />
            Security Analysis Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
            Password <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">Strength Tester</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Analyze password strength with entropy calculation, crack time estimation, and advanced security checks.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> Enter Password
              </label>
              <button onClick={() => setShowGenerator(!showGenerator)} className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 transition-colors">
                <RefreshCw className="w-3 h-3" /> Generate one
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type or paste your password here..."
                autoComplete="off" spellCheck={false}
                className="w-full h-14 px-5 pr-28 rounded-xl font-mono text-base sm:text-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button onClick={() => setShowPassword(!showPassword)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={handleCopy} disabled={!password} className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                {password && (
                  <button onClick={() => setPassword("")} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {password && analysis && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                <StrengthBar score={analysis.score} gradient={analysis.strengthLevel.gradient} />
                <div className="flex justify-between text-xs">
                  <span className="font-semibold" style={{ color: analysis.strengthLevel.color }}>{analysis.strengthLevel.label}</span>
                  <span className="text-gray-400 dark:text-gray-500">{password.length} characters</span>
                </div>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {showGenerator && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-t border-gray-100 dark:border-gray-800">
                <div className="p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-800/30 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Password Generator</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-600 dark:text-gray-400">Length</span>
                      <span className="font-black text-violet-600 dark:text-violet-400 tabular-nums w-8 text-right">{generatorOptions.length}</span>
                    </div>
                    <input type="range" min={8} max={64} value={generatorOptions.length} onChange={(e) => setGeneratorOptions(p => ({ ...p, length: +e.target.value }))} className="w-full accent-violet-600 cursor-pointer" />
                    <div className="flex justify-between text-xs text-gray-400"><span>8 chars</span><span>64 chars</span></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "uppercase", label: "Uppercase (A-Z)", activeColor: "#7c3aed" },
                      { key: "lowercase", label: "Lowercase (a-z)", activeColor: "#0ea5e9" },
                      { key: "numbers", label: "Numbers (0-9)", activeColor: "#f59e0b" },
                      { key: "symbols", label: "Symbols (!@#$)", activeColor: "#f43f5e" },
                      { key: "avoidAmbiguous", label: "No Ambiguous (l,1,O,0)", activeColor: "#22c55e" },
                      { key: "noRepeating", label: "No Repeating Chars", activeColor: "#a855f7" },
                    ].map(({ key, label, activeColor }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer select-none group">
                        <button type="button" role="switch" aria-checked={generatorOptions[key]} onClick={() => setGeneratorOptions(p => ({ ...p, [key]: !p[key] }))} className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200" style={{ backgroundColor: generatorOptions[key] ? activeColor : "#d1d5db" }}>
                          <motion.div animate={{ x: generatorOptions[key] ? 16 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                        </button>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={generateStrongPassword} className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-violet-500/20">
                    <Zap className="w-4 h-4" /> Generate Password
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {password && analysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col items-center justify-center gap-3">
                  <ScoreRing score={analysis.score} color={analysis.strengthLevel.color} />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <ShieldIcon className="w-4 h-4" style={{ color: analysis.strengthLevel.color }} />
                      <span className="font-black text-lg" style={{ color: analysis.strengthLevel.color }}>{analysis.strengthLevel.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Security Score</p>
                  </div>
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <Clock className="w-3.5 h-3.5" /> Crack Time
                    </div>
                    <motion.p key={analysis.crackTime.label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xl sm:text-2xl font-black" style={{ color: analysis.crackTime.color }}>
                      {analysis.crackTime.label}
                    </motion.p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">GPU cluster at 10 billion guesses/sec</p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <BarChart3 className="w-3.5 h-3.5" /> Entropy
                    </div>
                    <motion.p key={analysis.entropy.toFixed(1)} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white">
                      {analysis.entropy.toFixed(1)} <span className="text-sm font-semibold text-gray-400">bits</span>
                    </motion.p>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" initial={{ width: 0 }} animate={{ width: Math.min(100, (analysis.entropy / 128) * 100) + "%" }} transition={{ duration: 0.8 }} />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">128 bits+ is cryptographically secure</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Security Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                  <CheckItem label="At least 8 characters" passed={analysis.checks.minLength} />
                  <CheckItem label="At least 12 characters" passed={analysis.checks.goodLength} />
                  <CheckItem label="At least 16 characters" passed={analysis.checks.strongLength} />
                  <CheckItem label="Contains uppercase (A-Z)" passed={analysis.checks.hasUppercase} />
                  <CheckItem label="Contains lowercase (a-z)" passed={analysis.checks.hasLowercase} />
                  <CheckItem label="Contains numbers (0-9)" passed={analysis.checks.hasNumbers} />
                  <CheckItem label="Contains special symbols" passed={analysis.checks.hasSymbols} />
                  <CheckItem label="Not a common password" passed={analysis.checks.noCommon} />
                  <CheckItem label="No keyboard patterns" passed={analysis.checks.noKeyboard} />
                  <CheckItem label="No repeated characters" passed={analysis.checks.noRepeated} />
                  <CheckItem label="Not a leet-speak variant" passed={analysis.checks.noLeet} />
                  <CheckItem label="Diverse unique characters" passed={analysis.checks.hasUniqueChars} />
                </div>
              </div>

              {analysis.suggestions.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Improvement Suggestions
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {analysis.suggestions.map((s) => <SuggestionItem key={s.text} text={s.text} type={s.type} />)}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between px-5 py-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <span className="flex items-center gap-2"><Hash className="w-4 h-4" /> Advanced Analysis</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Character Distribution</h3>
                        <CharDistBar label="Uppercase Letters" count={analysis.charDist.uppercase} total={password.length} color="#818cf8" />
                        <CharDistBar label="Lowercase Letters" count={analysis.charDist.lowercase} total={password.length} color="#38bdf8" />
                        <CharDistBar label="Numbers" count={analysis.charDist.numbers} total={password.length} color="#fbbf24" />
                        <CharDistBar label="Symbols" count={analysis.charDist.symbols} total={password.length} color="#f472b6" />
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Password Statistics</h3>
                        <div className="space-y-3">
                          {(() => {
                            let charPool = 0;
                            if (/[a-z]/.test(password)) charPool += 26;
                            if (/[A-Z]/.test(password)) charPool += 26;
                            if (/[0-9]/.test(password)) charPool += 10;
                            if (/[^A-Za-z0-9]/.test(password)) charPool += 32;
                            const val = Math.pow(2, analysis.entropy);
                            let combos;
                            if (val >= 1e24) combos = (val/1e24).toFixed(1)+" Yotta";
                            else if (val >= 1e21) combos = (val/1e21).toFixed(1)+" Zetta";
                            else if (val >= 1e18) combos = (val/1e18).toFixed(1)+" Exa";
                            else if (val >= 1e15) combos = (val/1e15).toFixed(1)+" Peta";
                            else if (val >= 1e12) combos = (val/1e12).toFixed(1)+"T";
                            else if (val >= 1e9) combos = (val/1e9).toFixed(1)+"B";
                            else if (val >= 1e6) combos = (val/1e6).toFixed(1)+"M";
                            else combos = val.toFixed(0);
                            const rows = [
                              { label: "Total Length", value: password.length, unit: "chars" },
                              { label: "Unique Characters", value: new Set(password).size, unit: "chars" },
                              { label: "Entropy", value: analysis.entropy.toFixed(1), unit: "bits" },
                              { label: "Character Pool", value: charPool, unit: "chars" },
                              { label: "Possible Combos", value: combos, unit: "" },
                            ];
                            return rows.map(({ label, value, unit }) => (
                              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                                <span className="text-xs font-black text-gray-800 dark:text-white tabular-nums">{value}{unit ? <span className="text-gray-400 font-normal ml-1">{unit}</span> : null}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {!password && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center border border-violet-200 dark:border-violet-800">
              <Unlock className="w-9 h-9 text-violet-300 dark:text-violet-700" />
            </div>
            <p className="font-bold text-gray-400 dark:text-gray-600">Type a password to start the analysis</p>
            <p className="text-sm text-gray-300 dark:text-gray-700 max-w-xs">All analysis happens locally in your browser. Your password is never sent anywhere.</p>
          </motion.div>
        )}

        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span><strong>100% Private:</strong> All analysis is performed locally in your browser. Your password is never transmitted or stored.</span>
        </div>

      </div>
    </ToolPageShell>
  );
}
