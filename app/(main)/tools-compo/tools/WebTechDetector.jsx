"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  Globe,
  Server,
  Code2,
  Shield,
  ShieldCheck,
  ShieldX,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Settings2,
  AlertTriangle,
  Info,
  Cpu,
  LayoutGrid,
  MonitorSmartphone,
  Clock,
  ArrowRight,
  RefreshCw,
  BarChart3,
  FileCode,
  Link2,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

/* ─────────────────────────────────────────────────────────────
   Custom Modern Dropdown
───────────────────────────────────────────────────────────── */
function ModernSelect({ value, onChange, options, icon: Icon, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 tracking-wide">
          {label}
        </label>
      )}
      <button
        type="button"
        id={`select-${label?.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:border-brandColor/60 hover:bg-brandColor/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brandColor/30 shadow-sm"
      >
        {Icon && <Icon size={16} className="text-brandColor flex-shrink-0" />}
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{selected?.label}</div>
          {selected?.description && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-normal">{selected.description}</div>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[100] mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                  opt.value === value
                    ? "bg-brandColor/10 text-brandColor"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {opt.icon && <span className="text-lg leading-none">{opt.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{opt.label}</div>
                  {opt.description && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{opt.description}</div>
                  )}
                </div>
                {opt.value === value && <Check size={14} className="text-brandColor flex-shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Copy Button
───────────────────────────────────────────────────────────── */
function CopyBtn({ text, label = "Value", size = "sm" }) {
  const [copied, setCopied] = useState(false);
  const iconSize = size === "sm" ? 13 : 15;
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${label} copied!`);
        setTimeout(() => setCopied(false), 2000);
      }}
      title={`Copy ${label}`}
      className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {copied
        ? <Check size={iconSize} className="text-emerald-500" />
        : <Copy size={iconSize} />}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Category styling map
───────────────────────────────────────────────────────────── */
const categoryMeta = {
  "Web Server":            { icon: Server,        color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/50",     border: "border-blue-200 dark:border-blue-800",    badge: "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300" },
  "CDN / Proxy":           { icon: Globe,         color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/50", border: "border-orange-200 dark:border-orange-800", badge: "bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300" },
  "Hosting":               { icon: Cpu,           color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50", border: "border-violet-200 dark:border-violet-800", badge: "bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300" },
  "Cloud / Hosting":       { icon: Cpu,           color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50", border: "border-violet-200 dark:border-violet-800", badge: "bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300" },
  "CMS":                   { icon: Layers,        color: "text-teal-600 dark:text-teal-400",     bg: "bg-teal-50 dark:bg-teal-950/50",     border: "border-teal-200 dark:border-teal-800",    badge: "bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300" },
  "E-Commerce":            { icon: LayoutGrid,    color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300" },
  "Website Builder":       { icon: Sparkles,      color: "text-pink-600 dark:text-pink-400",     bg: "bg-pink-50 dark:bg-pink-950/50",     border: "border-pink-200 dark:border-pink-800",    badge: "bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300" },
  "JS Framework":          { icon: Code2,         color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/50", border: "border-yellow-200 dark:border-yellow-800", badge: "bg-yellow-100 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-300" },
  "JS Library":            { icon: FileCode,      color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/50",   border: "border-amber-200 dark:border-amber-800",  badge: "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300" },
  "CSS Framework":         { icon: Sparkles,      color: "text-sky-600 dark:text-sky-400",       bg: "bg-sky-50 dark:bg-sky-950/50",       border: "border-sky-200 dark:border-sky-800",      badge: "bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300" },
  "Framework":             { icon: Code2,         color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/50", border: "border-indigo-200 dark:border-indigo-800", badge: "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300" },
  "Static Site Generator": { icon: Zap,           color: "text-cyan-600 dark:text-cyan-400",     bg: "bg-cyan-50 dark:bg-cyan-950/50",     border: "border-cyan-200 dark:border-cyan-800",    badge: "bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300" },
  "Language":              { icon: FileCode,      color: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-50 dark:bg-rose-950/50",     border: "border-rose-200 dark:border-rose-800",    badge: "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300" },
  "Analytics":             { icon: BarChart3,     color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/50", border: "border-purple-200 dark:border-purple-800", badge: "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300" },
  "Marketing":             { icon: Zap,           color: "text-fuchsia-600 dark:text-fuchsia-400", bg: "bg-fuchsia-50 dark:bg-fuchsia-950/50", border: "border-fuchsia-200 dark:border-fuchsia-800", badge: "bg-fuchsia-100 dark:bg-fuchsia-900/60 text-fuchsia-700 dark:text-fuchsia-300" },
  "Support":               { icon: Info,          color: "text-lime-600 dark:text-lime-400",     bg: "bg-lime-50 dark:bg-lime-950/50",     border: "border-lime-200 dark:border-lime-800",    badge: "bg-lime-100 dark:bg-lime-900/60 text-lime-700 dark:text-lime-300" },
};

function getCategoryMeta(cat) {
  return categoryMeta[cat] || {
    icon: Globe,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-900",
    border: "border-gray-200 dark:border-gray-700",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  };
}

/* ─────────────────────────────────────────────────────────────
   Tech Pill
───────────────────────────────────────────────────────────── */
function TechPill({ tech }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group"
    >
      <span className="text-xl leading-none">{tech.icon}</span>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">{tech.name}</span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tech Category Card
───────────────────────────────────────────────────────────── */
function TechCategoryCard({ category, techs, index }) {
  const meta = getCategoryMeta(category);
  const IconComp = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 28 }}
      className={`rounded-2xl border-2 p-5 md:p-6 ${meta.bg} ${meta.border}`}
    >
      {/* Category header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl bg-white dark:bg-gray-900 shadow-sm`}>
          <IconComp size={18} className={meta.color} />
        </div>
        <div>
          <h3 className={`text-base font-bold ${meta.color}`}>{category}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{techs.length} {techs.length === 1 ? "technology" : "technologies"} found</p>
        </div>
      </div>
      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        {techs.map((tech, i) => (
          <TechPill key={i} tech={tech} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Security Header Row
───────────────────────────────────────────────────────────── */
function SecurityHeaderRow({ header, index }) {
  const [showValue, setShowValue] = useState(false);
  const present = header.status === "present";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border-2 p-4 transition-all ${
        present
          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30"
          : "border-red-100 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20"
      }`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {present
          ? <ShieldCheck size={18} className="text-emerald-500 flex-shrink-0" />
          : <ShieldX size={18} className="text-red-400 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold ${present ? "text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-500"}`}>
              {header.name}
            </span>
            <code className="text-xs text-gray-400 dark:text-gray-600 font-mono hidden sm:inline">{header.fullName}</code>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            present
              ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/50"
              : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
          }`}>
            {present ? "✓ Present" : "✗ Missing"}
          </span>
          {present && header.value && (
            <button
              onClick={() => setShowValue((p) => !p)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800 transition-all"
            >
              {showValue ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showValue && header.value && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all leading-relaxed flex-1">
                {header.value}
              </code>
              <CopyBtn text={header.value} label={header.name} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Response Header Row
───────────────────────────────────────────────────────────── */
function HeaderRow({ headerKey, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <code className="text-sm font-bold font-mono text-brandColor sm:min-w-[180px] sm:flex-shrink-0">{headerKey}</code>
      <div className="flex items-start gap-2 min-w-0 flex-1">
        <code className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all flex-1">{value}</code>
        <CopyBtn text={value} label={headerKey} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Security Score Ring (SVG)
───────────────────────────────────────────────────────────── */
function SecurityRing({ score }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90 absolute inset-0">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-gray-200 dark:text-gray-700" />
          <motion.circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="flex flex-col items-center z-10">
          <span className="text-2xl font-black" style={{ color }}>{score}</span>
          <span className="text-[10px] font-bold text-gray-400">/100</span>
        </div>
      </div>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Status Code Badge
───────────────────────────────────────────────────────────── */
function StatusBadge({ code }) {
  let style = "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800";
  if (code >= 400) style = "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/40 border-red-200 dark:border-red-800";
  else if (code >= 300) style = "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800";
  return (
    <span className={`inline-flex items-center text-sm font-bold px-3 py-1 rounded-full border ${style}`}>
      HTTP {code}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-5 px-3">
      <Icon size={20} className={color} />
      <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{value}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skeleton Loader
───────────────────────────────────────────────────────────── */
function SkeletonLoader({ url }) {
  return (
    <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 md:p-8 overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brandColor/15 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse w-2/3" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mt-6 animate-pulse font-medium">
        🔍 Scanning {url}…
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export default function WebTechDetector() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [activeTab, setActiveTab] = useState("technologies");
  const [reportCopied, setReportCopied] = useState(false);

  // Advanced options
  const [followRedirects, setFollowRedirects] = useState(true);
  const [timeout, setTimeout_] = useState("10000");
  const [userAgent, setUserAgent] = useState("default");

  const inputRef = useRef(null);

  const userAgentOptions = [
    { value: "default", label: "Desktop Browser", icon: "🖥️", description: "Chrome on Windows" },
    { value: "mobile",  label: "Mobile Browser",  icon: "📱", description: "Safari on iPhone" },
    { value: "bot",     label: "Googlebot",        icon: "🤖", description: "Google search crawler" },
  ];

  const timeoutOptions = [
    { value: "5000",  label: "5 seconds",  description: "Fast sites only" },
    { value: "10000", label: "10 seconds", description: "Recommended" },
    { value: "20000", label: "20 seconds", description: "For slow sites" },
    { value: "30000", label: "30 seconds", description: "Maximum wait" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { toast.error("Please enter a website URL"); return; }
    setLoading(true);
    setError("");
    setResult(null);
    setActiveTab("technologies");

    try {
      const res = await fetch("/api/detect-tech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, followRedirects, timeout: Number(timeout), userAgent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze website");
      setResult(data);
      toast.success(`✅ Detected ${data.technologies?.length || 0} technologies!`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const lines = [
      `Website Technology Report — ${result.finalUrl}`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `HTTP Status: ${result.statusCode}`,
      `Security Score: ${result.securityScore}/100`,
      "",
      `TECHNOLOGIES DETECTED (${result.technologies?.length}):`,
      ...(result.technologies || []).map((t) => `  • [${t.category}] ${t.name}`),
      "",
      `SECURITY HEADERS:`,
      ...(result.securityHeaders || []).map((h) => `  • ${h.name}: ${h.status.toUpperCase()}`),
    ].join("\n");
    navigator.clipboard.writeText(lines);
    setReportCopied(true);
    toast.success("Report copied to clipboard!");
    setTimeout(() => setReportCopied(false), 2500);
  };

  const categoryOrder = [
    "Web Server", "CDN / Proxy", "Hosting", "Cloud / Hosting",
    "Framework", "CMS", "E-Commerce", "Website Builder",
    "Static Site Generator", "JS Framework", "JS Library",
    "CSS Framework", "Language", "Analytics", "Marketing", "Support",
  ];

  const sortedGroups = result?.grouped
    ? [
        ...categoryOrder.filter((c) => result.grouped[c]).map((c) => ({ category: c, techs: result.grouped[c] })),
        ...Object.keys(result.grouped).filter((c) => !categoryOrder.includes(c)).map((c) => ({ category: c, techs: result.grouped[c] })),
      ]
    : [];

  const tabs = [
    { id: "technologies", label: "Technologies", icon: Layers,   count: result?.technologies?.length },
    { id: "security",     label: "Security",     icon: Shield,   count: result?.securityHeaders?.length },
    { id: "meta",         label: "Page Info",    icon: FileCode, count: null },
  ];

  const pageInfoRows = result
    ? [
        { label: "Page Title",    value: result.meta?.title,       icon: FileCode },
        { label: "Description",   value: result.meta?.description, icon: Info },
        { label: "OG Title",      value: result.meta?.ogTitle,     icon: Globe },
        { label: "Generator",     value: result.meta?.generator,   icon: Cpu },
        { label: "Language",      value: result.meta?.language,    icon: Globe },
        { label: "Charset",       value: result.meta?.charset,     icon: Code2 },
        { label: "Viewport",      value: result.meta?.viewport,    icon: MonitorSmartphone },
        { label: "Content-Type",  value: result.contentType,       icon: FileCode },
        { label: "Cache-Control", value: result.cacheControl,      icon: Zap },
        { label: "Encoding",      value: result.encoding,          icon: Layers },
        { label: "Server",        value: result.serverHeader,      icon: Server },
        { label: "X-Powered-By",  value: result.xPoweredBy,       icon: Cpu },
      ].filter((r) => r.value)
    : [];

  const examples = ["github.com", "vercel.com", "shopify.com", "wordpress.org", "nextjs.org"];

  return (
    <ToolPageShell>
      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div className="text-center mb-10 md:mb-14 px-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2 mb-5 rounded-full bg-brandColor/10 border border-brandColor/20 text-brandColor text-sm font-bold"
        >
          <Globe size={15} />
          Website Analyzer
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 leading-tight"
        >
          Website Technology{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brandColor to-violet-500">
            Detector
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          Reveal the full tech stack behind any website — frameworks, CMS, servers, analytics, CDNs &amp; security headers.
        </motion.p>
      </div>

      {/* ═══════════════════ INPUT FORM ═══════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13 }}
        className="max-w-3xl mx-auto mb-6 px-4"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* URL row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Link2 size={18} />
              </div>
              <input
                ref={inputRef}
                type="text"
                id="website-url-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. github.com or https://shopify.com"
                className="w-full pl-11 pr-10 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brandColor/30 focus:border-brandColor shadow-sm transition-all duration-200"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => { setUrl(""); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <motion.button
              type="submit"
              id="detect-tech-btn"
              disabled={loading}
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-brandColor hover:bg-brandColorHover text-white font-bold text-base transition-all duration-200 shadow-lg shadow-brandColor/30 disabled:opacity-60 disabled:cursor-not-allowed sm:flex-shrink-0"
            >
              {loading ? (
                <><RefreshCw size={17} className="animate-spin" /><span>Scanning…</span></>
              ) : (
                <><Search size={17} /><span>Detect</span></>
              )}
            </motion.button>
          </div>

          {/* Advanced toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => { setUrl(ex); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:border-brandColor/50 hover:text-brandColor hover:bg-brandColor/5 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>

            <button
              type="button"
              id="advanced-options-toggle"
              onClick={() => setShowAdvanced((p) => !p)}
              className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                showAdvanced
                  ? "text-brandColor bg-brandColor/10 border border-brandColor/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-brandColor hover:bg-brandColor/5"
              }`}
            >
              <Settings2 size={14} />
              <span className="hidden sm:inline">Advanced</span>
              <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }} transition={{ duration: 0.22 }}>
                <ChevronDown size={13} />
              </motion.div>
            </button>
          </div>

          {/* Advanced options panel */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border-2 border-brandColor/20 bg-brandColor/5 dark:bg-gray-900/60 p-5 md:p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <Settings2 size={16} className="text-brandColor" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Advanced Scan Settings</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ModernSelect
                      value={userAgent}
                      onChange={setUserAgent}
                      options={userAgentOptions}
                      icon={MonitorSmartphone}
                      label="Scan As"
                    />
                    <ModernSelect
                      value={timeout}
                      onChange={setTimeout_}
                      options={timeoutOptions}
                      icon={Clock}
                      label="Request Timeout"
                    />
                  </div>

                  {/* Follow redirects toggle */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <ArrowRight size={15} className="text-gray-500 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Follow Redirects</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Automatically follow HTTP 3xx redirects</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="follow-redirects-toggle"
                      onClick={() => setFollowRedirects((p) => !p)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brandColor/30 flex-shrink-0 ${
                        followRedirects ? "bg-brandColor" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                        animate={{ x: followRedirects ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <Info size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      Detection is server-side via HTTP headers and HTML analysis. JavaScript-rendered content may not be fully detected.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* ═══════════════════ LOADING ═══════════════════ */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            <SkeletonLoader url={url} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ ERROR ═══════════════════ */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto mx-4 rounded-2xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-5 md:p-6 flex items-start gap-4 px-4"
          >
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50 flex-shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-base font-bold text-red-700 dark:text-red-400 mb-1">Scan Failed</p>
              <p className="text-sm text-red-600 dark:text-red-300 leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ RESULTS ═══════════════════ */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto space-y-5 px-4"
          >
            {/* ── Site overview card ── */}
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
              {/* Browser-like URL bar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 md:px-6 py-3.5 border-b-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 font-mono border border-gray-200 dark:border-gray-700 min-w-0">
                    <Globe size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate flex-1">{result.finalUrl}</span>
                    <a href={result.finalUrl} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-brandColor transition-colors flex-shrink-0">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge code={result.statusCode} />
                  <button
                    id="copy-report-btn"
                    onClick={handleCopyReport}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brandColor hover:bg-brandColor/10 border border-gray-200 dark:border-gray-700 transition-all"
                  >
                    {reportCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{reportCopied ? "Copied!" : "Copy Report"}</span>
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-gray-800">
                <StatCard label="Technologies" value={result.technologies?.length || 0}
                  icon={Layers} color="text-brandColor" />
                <StatCard label="Categories" value={Object.keys(result.grouped || {}).length}
                  icon={LayoutGrid} color="text-violet-500" />
                <StatCard label="Security Score" value={`${result.securityScore}%`}
                  icon={Shield}
                  color={result.securityScore >= 70 ? "text-emerald-500" : result.securityScore >= 40 ? "text-yellow-500" : "text-red-500"} />
                <StatCard label="Redirected" value={result.wasRedirected ? "Yes" : "No"}
                  icon={ArrowRight} color="text-gray-400" />
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1.5 p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <tab.icon size={15} />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                  {tab.count != null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? "bg-brandColor/15 text-brandColor"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ══════════ TECHNOLOGIES TAB ══════════ */}
            {activeTab === "technologies" && (
              <motion.div key="tech-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {sortedGroups.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <Layers size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-base font-semibold text-gray-500 dark:text-gray-400">No technologies detected</p>
                    <p className="text-sm text-gray-400 mt-2">The site may use custom or obfuscated tech, or block scrapers.</p>
                  </div>
                ) : (
                  sortedGroups.map(({ category, techs }, i) => (
                    <TechCategoryCard key={category} category={category} techs={techs} index={i} />
                  ))
                )}
                {result.meta?.generator && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
                  >
                    <Info size={15} className="text-brandColor flex-shrink-0" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Generator tag:{" "}
                      <span className="font-bold text-gray-700 dark:text-gray-200">{result.meta.generator}</span>
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══════════ SECURITY TAB ══════════ */}
            {activeTab === "security" && (
              <motion.div key="sec-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Score overview */}
                <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b-2 border-gray-100 dark:border-gray-800">
                    <SecurityRing score={result.securityScore} />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        Security Header Score
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                        {result.securityScore >= 80
                          ? "🟢 Excellent! This site has strong security headers configured."
                          : result.securityScore >= 50
                          ? "🟡 Decent — a few important headers are missing."
                          : "🔴 Weak security — several critical headers are absent."}
                      </p>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: result.securityScore >= 70
                              ? "linear-gradient(90deg, #10b981, #059669)"
                              : result.securityScore >= 40
                              ? "linear-gradient(90deg, #f59e0b, #d97706)"
                              : "linear-gradient(90deg, #ef4444, #dc2626)",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${result.securityScore}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {result.securityHeaders?.filter((h) => h.status === "present").length} of {result.securityHeaders?.length} headers present
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(result.securityHeaders || []).map((header, i) => (
                      <SecurityHeaderRow key={i} header={header} index={i} />
                    ))}
                  </div>
                </div>

                {/* Raw response headers */}
                <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                  <button
                    id="toggle-raw-headers-btn"
                    onClick={() => setShowHeaders((p) => !p)}
                    className="w-full flex items-center gap-3 px-5 md:px-6 py-4 md:py-5 text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Code2 size={17} className="text-gray-400" />
                    <span>Response Headers</span>
                    <span className="ml-2 text-sm text-gray-400 font-normal">
                      ({Object.keys(result.responseHeaders || {}).length} headers)
                    </span>
                    <motion.div animate={{ rotate: showHeaders ? 180 : 0 }} transition={{ duration: 0.22 }} className="ml-auto">
                      <ChevronDown size={17} className="text-gray-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showHeaders && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 md:px-6 pb-5">
                          {Object.entries(result.responseHeaders || {}).map(([k, v]) => (
                            <HeaderRow key={k} headerKey={k} value={v} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ══════════ PAGE INFO TAB ══════════ */}
            {activeTab === "meta" && (
              <motion.div key="meta-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 md:p-6">
                  {pageInfoRows.length === 0 ? (
                    <div className="text-center py-12">
                      <Info size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-base font-semibold text-gray-500">No page info available.</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {pageInfoRows.map((row, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <div className="flex items-center gap-2 sm:min-w-[150px] sm:flex-shrink-0">
                            <row.icon size={14} className="text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{row.label}</span>
                          </div>
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <span className="text-sm text-gray-800 dark:text-gray-200 font-medium break-words flex-1 leading-relaxed">
                              {row.value}
                            </span>
                            <CopyBtn text={row.value} label={row.label} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ EMPTY STATE ═══════════════════ */}
      {!result && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="max-w-3xl mx-auto px-4"
        >
          <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-10 md:p-14 text-center">
            <div className="w-20 h-20 rounded-2xl bg-brandColor/10 border-2 border-brandColor/20 flex items-center justify-center mx-auto mb-5">
              <Globe size={34} className="text-brandColor" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">
              Enter any website URL to start
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
              Detects CMS, frameworks, servers, analytics tools, CDNs, and security headers. Works on any public URL.
            </p>

            {/* What we detect chips */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto text-left">
              {[
                { icon: "🔵", label: "CMS Detection" },
                { icon: "⚛️", label: "JS Frameworks" },
                { icon: "🖥️", label: "Web Servers" },
                { icon: "🔶", label: "CDN & Proxy" },
                { icon: "📊", label: "Analytics" },
                { icon: "🛡️", label: "Security Headers" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </ToolPageShell>
  );
}
