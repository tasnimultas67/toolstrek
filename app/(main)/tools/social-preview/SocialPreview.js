"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, AlertCircle, CheckCircle2, Copy, Check, Eye, Code,
  ShieldCheck, RefreshCw, Smartphone, Monitor, Grid, LayoutList, Settings,
  Sparkles, AlertTriangle, Share2, Compass, Globe, Info,
  ChevronDown, ChevronUp, CheckCircle
} from "lucide-react";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";

// Preset examples
const EXAMPLES = [
  {
    name: "GitHub Repo",
    url: "https://github.com/google/guava",
    title: "google/guava: Google core libraries for Java",
    description: "Google core libraries for Java. Contribute to google/guava development by creating an account on GitHub.",
    image: "https://opengraph.githubassets.com/d5a9d80d22c9535bf408/google/guava",
    siteName: "GitHub", type: "object",
    icon: "https://github.githubassets.com/favicons/favicon.svg",
    canonical: "https://github.com/google/guava"
  },
  {
    name: "Tech News",
    url: "https://techcrunch.com/2026/07/15/ai-agents-evolution-software",
    title: "How Agentic AI Coding Assistants are Rewriting Software Engineering",
    description: "From simple autocomplete to fully autonomous planning and execution, agentic coding tools are transforming developer workflows at lightning speeds.",
    image: "https://techcrunch.com/wp-content/uploads/2026/07/agentic-ai-dev.jpg",
    siteName: "TechCrunch", type: "article",
    icon: "https://techcrunch.com/wp-content/uploads/2015/02/cropped-techcrunch_favicon.png",
    canonical: "https://techcrunch.com/2026/07/15/ai-agents-evolution-software"
  },
  {
    name: "Streaming",
    url: "https://www.netflix.com",
    title: "Netflix — Watch TV Shows Online, Watch Movies Online",
    description: "Watch Netflix movies & TV shows online or stream right to your smart TV, game console, PC, Mac, mobile, tablet and more.",
    image: "https://assets.nflxext.com/ffe/siteui/vlv3/Netflix-OG-image.png",
    siteName: "Netflix", type: "website",
    icon: "https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.ico",
    canonical: "https://www.netflix.com"
  }
];

export default function SocialPreview() {
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [metadata, setMetadata] = useState({
    url: "https://example.com/awesome-article",
    domain: "example.com",
    title: "Unlocking the Future of Web Development in 2026",
    description: "Explore the cutting-edge frameworks, server components, edge database innovations, and client design patterns that are shaping the web experiences of tomorrow.",
    image: "",
    siteName: "DevPortal",
    type: "article",
    icon: "https://example.com/favicon.ico",
    canonical: "https://example.com/awesome-article"
  });

  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("facebook");
  const [deviceMode, setDeviceMode] = useState("desktop");
  const [twitterCardType, setTwitterCardType] = useState("summary_large_image");
  const [slackTheme, setSlackTheme] = useState("light");
  const [discordTheme, setDiscordTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedUserAgent, setSelectedUserAgent] = useState("default");
  const [codeTab, setCodeTab] = useState("html");
  const [copiedText, setCopiedText] = useState(false);

  // Auto-generate SVG OG image when no URL is provided
  const customOgImage = useMemo(() => {
    const cleanTitle = metadata.title || "Social Preview Card";
    const cleanSiteName = metadata.siteName || "ToolsTrek";
    const cleanColor = accentColor || "#6366f1";
    const words = cleanTitle.split(" ");
    const lines = [];
    let currentLine = "";
    words.forEach(word => {
      if ((currentLine + " " + word).length > 22) { lines.push(currentLine.trim()); currentLine = word; }
      else { currentLine += " " + word; }
    });
    if (currentLine) lines.push(currentLine.trim());
    const finalLines = lines.slice(0, 3);
    const textElements = finalLines.map((line, idx) =>
      `<text x="80" y="${280 + idx * 56}" fill="#ffffff" font-family="system-ui,sans-serif" font-weight="800" font-size="44">${line}</text>`
    ).join("");
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/><stop offset="50%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#090d16"/>
        </linearGradient>
        <linearGradient id="ac" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${cleanColor}"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <circle cx="1020" cy="180" r="280" fill="${cleanColor}" opacity="0.08" filter="blur(60px)"/>
      <rect x="0" y="618" width="1200" height="12" rx="4" fill="url(#ac)"/>
      <text x="80" y="180" fill="#94a3b8" font-family="system-ui,sans-serif" font-weight="600" font-size="18" letter-spacing="1">LIVE SOCIAL MEDIA PREVIEW</text>
      <text x="80" y="140" fill="url(#ac)" font-family="system-ui,sans-serif" font-weight="900" font-size="30" letter-spacing="3">${cleanSiteName}</text>
      <rect x="80" y="210" width="160" height="6" rx="3" fill="url(#ac)"/>
      ${textElements}
      <text x="80" y="540" fill="#475569" font-family="system-ui,sans-serif" font-size="16">Generated via ToolsTrek · Social Media URL Preview</text>
    </svg>`;
    const base64 = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(svgString))) : "";
    return `data:image/svg+xml;base64,${base64}`;
  }, [metadata.title, metadata.siteName, accentColor]);

  const displayImage = metadata.image || customOgImage;

  const handleScrape = async (e) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;
    setLoading(true); setErrorMsg(""); setWarningMsg(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/url-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, userAgent: selectedUserAgent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch metadata");
      setMetadata({ url: data.url, domain: data.domain, title: data.title || "", description: data.description || "", image: data.image || "", siteName: data.siteName || data.domain || "", type: data.type || "website", icon: data.icon || "", canonical: data.canonical || data.url });
      setSuccessMsg("Metadata scraped successfully!");
    } catch (err) {
      setErrorMsg(err.message || "An unexpected network error occurred.");
      let fallbackDomain = "example.com";
      let cleanedUrl = targetUrl;
      if (!/^https?:\/\//i.test(cleanedUrl)) cleanedUrl = "https://" + cleanedUrl;
      try { fallbackDomain = new URL(cleanedUrl).hostname; } catch (e) {}
      setWarningMsg("Could not fetch page metadata directly (site may block scrapers). You can still edit & simulate below.");
      setMetadata(prev => ({ ...prev, url: cleanedUrl, domain: fallbackDomain, title: prev.title || "Simulation Preview Title", description: prev.description || "Customize this description to simulate card appearances.", siteName: prev.siteName || fallbackDomain.split(".")[0] }));
    } finally { setLoading(false); }
  };

  const loadPreset = (preset) => {
    setErrorMsg(""); setWarningMsg(""); setSuccessMsg("");
    setMetadata({ ...preset }); setTargetUrl(preset.url);
  };

  const handleMetaChange = (field, value) => {
    setMetadata(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "url") {
        try { updated.domain = new URL(value.startsWith("http") ? value : "https://" + value).hostname; }
        catch (e) { updated.domain = value; }
      }
      return updated;
    });
  };

  const seoAudit = useMemo(() => {
    const issues = []; const passes = []; let score = 100;
    if (!metadata.title) { score -= 25; issues.push({ id: "t1", severity: "error", msg: "Missing page title tag." }); }
    else {
      const l = metadata.title.length;
      if (l < 30) { score -= 8; issues.push({ id: "t2", severity: "warning", msg: `Title too short (${l} chars). Target 40–60.` }); }
      else if (l > 60) { score -= 8; issues.push({ id: "t3", severity: "warning", msg: `Title too long (${l} chars). May truncate.` }); }
      else passes.push(`Title length is optimal (${l} chars).`);
    }
    if (!metadata.description) { score -= 25; issues.push({ id: "d1", severity: "error", msg: "Missing description meta tag." }); }
    else {
      const l = metadata.description.length;
      if (l < 50) { score -= 8; issues.push({ id: "d2", severity: "warning", msg: `Description too short (${l} chars). Target 50–160.` }); }
      else if (l > 160) { score -= 8; issues.push({ id: "d3", severity: "warning", msg: `Description too long (${l} chars). Will truncate.` }); }
      else passes.push(`Description length is optimal (${l} chars).`);
    }
    if (!metadata.image) { score -= 20; issues.push({ id: "i1", severity: "warning", msg: "No OG image URL. Using auto-generated fallback." }); }
    else {
      passes.push("Open Graph image tag is specified.");
      if (metadata.image.startsWith("http://")) { score -= 5; issues.push({ id: "i2", severity: "warning", msg: "OG image uses insecure HTTP. Some platforms may reject it." }); }
      else passes.push("Image uses secure HTTPS URL.");
    }
    if (!metadata.siteName) { score -= 5; issues.push({ id: "s1", severity: "info", msg: "Missing og:site_name tag." }); }
    else passes.push(`Site name: "${metadata.siteName}"`);
    if (!metadata.canonical) { score -= 5; issues.push({ id: "c1", severity: "warning", msg: "Missing canonical URL tag." }); }
    else passes.push("Canonical URL tag present.");
    return { score: Math.max(0, score), issues, passes };
  }, [metadata]);

  const generatedCode = useMemo(() => {
    const u = metadata.url || ""; const t = metadata.title || ""; const d = metadata.description || "";
    const img = displayImage.startsWith("data:") ? "https://yourdomain.com/og-image.png" : displayImage;
    const s = metadata.siteName || ""; const tp = metadata.type || "website";
    return {
      html: `<!-- Standard HTML Tags -->\n<title>${t}</title>\n<meta name="description" content="${d}">\n\n<!-- Open Graph / Facebook -->\n<meta property="og:type" content="${tp}">\n<meta property="og:url" content="${u}">\n<meta property="og:title" content="${t}">\n<meta property="og:description" content="${d}">\n<meta property="og:image" content="${img}">${s ? `\n<meta property="og:site_name" content="${s}">` : ""}`,
      twitter: `<!-- Twitter Card Tags -->\n<meta name="twitter:card" content="${twitterCardType}">\n<meta name="twitter:url" content="${u}">\n<meta name="twitter:title" content="${t}">\n<meta name="twitter:description" content="${d}">\n<meta name="twitter:image" content="${img}">`,
      jsonld: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "${metadata.type === "article" ? "NewsArticle" : "WebSite"}",\n  "url": "${u}",\n  "name": "${t}",\n  "description": "${d}",\n  "image": "${img}"\n}\n</script>`
    };
  }, [metadata, displayImage, twitterCardType]);

  const handleCopyCode = () => {
    const map = { html: generatedCode.html, twitter: generatedCode.twitter, jsonld: generatedCode.jsonld };
    navigator.clipboard.writeText(map[codeTab] || "");
    setCopiedText(true); setTimeout(() => setCopiedText(false), 2000);
  };

  // Reusable classes for dual-theme cards/panels
  const card = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm";
  const input = "w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-lg text-slate-800 dark:text-slate-200 outline-none text-xs transition";
  const label = "block text-slate-500 dark:text-slate-400 font-semibold text-xs mb-1.5";
  const sectionLabel = "font-semibold flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 text-slate-700 dark:text-slate-200 text-sm";

  const PLATFORMS = ["facebook", "twitter", "linkedin", "google", "slack", "discord"];

  return (
    <ToolPageShell widthClassName="max-w-7xl pt-24 pb-12">

      {/* ── Hero ── */}
      <div className="text-center mb-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Professional Live Previewer & SEO Audit Suite</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500 bg-clip-text text-transparent mb-3">
          Social Media URL Preview
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
          Paste any URL to fetch its meta tags live, or design and simulate how your link cards look across every major platform.
        </motion.p>
      </div>

      {/* ── URL Input ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className={`${card} p-5 mb-8 relative overflow-hidden`}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-100 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleScrape} className="flex flex-col sm:flex-row gap-3 relative z-10">
          <div className="relative flex-1">
            <Link2 className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
            <input type="text" placeholder="Paste link here (e.g., https://github.com)..."
              value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-100 rounded-xl outline-none transition text-sm" />
          </div>
          <button type="submit" disabled={loading || !targetUrl.trim()}
            className={`px-5 py-2.5 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${loading ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"}`}>
            {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Fetching…</span></> : <><Share2 className="h-4 w-4" /><span>Fetch Preview</span></>}
          </button>
        </form>

        {/* Preset row */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-3.5 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Try a preset:</span>
          {EXAMPLES.map((ex, idx) => (
            <button key={idx} type="button" onClick={() => loadPreset(ex)}
              className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-700 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-medium">
              <Globe className="w-3 h-3" />{ex.name}
            </button>
          ))}
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {errorMsg && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden">
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><div><span className="font-semibold">Scrape error: </span>{errorMsg}</div>
            </div>
          </motion.div>}
          {warningMsg && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><div><span className="font-semibold">Notice: </span>{warningMsg}</div>
            </div>
          </motion.div>}
          {successMsg && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 overflow-hidden">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /><span className="font-semibold">{successMsg}</span>
            </div>
          </motion.div>}
        </AnimatePresence>
      </motion.div>

      {/* ── Main 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">

        {/* Left: Metadata Editor */}
        <div className="lg:col-span-5">
          <div className={`${card} p-5`}>
            <h2 className={sectionLabel}>
              <Settings className="w-4 h-4 text-indigo-500" />Metadata Editor
            </h2>
            <div className="space-y-4">
              <div>
                <label className={label}>Page URL</label>
                <input type="text" value={metadata.url} onChange={e => handleMetaChange("url", e.target.value)} className={input} />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className={label.replace("mb-1.5", "")}>Page Title</label>
                  <span className={`text-xs font-semibold ${metadata.title.length > 60 || metadata.title.length < 30 ? "text-amber-500" : "text-emerald-500"}`}>{metadata.title.length} chars</span>
                </div>
                <input type="text" value={metadata.title} onChange={e => handleMetaChange("title", e.target.value)} className={input} placeholder="Enter page title…" />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className={label.replace("mb-1.5", "")}>Description</label>
                  <span className={`text-xs font-semibold ${metadata.description.length > 160 || metadata.description.length < 50 ? "text-amber-500" : "text-emerald-500"}`}>{metadata.description.length} chars</span>
                </div>
                <textarea rows={3} value={metadata.description} onChange={e => handleMetaChange("description", e.target.value)} className={`${input} resize-none`} placeholder="Enter page description…" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={label.replace("mb-1.5", "")}>OG Cover Image URL</label>
                  {metadata.image && <button type="button" onClick={() => handleMetaChange("image", "")} className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold cursor-pointer">Use Generator</button>}
                </div>
                <input type="text" placeholder="Paste image URL, or leave blank to auto-generate…" value={metadata.image} onChange={e => handleMetaChange("image", e.target.value)} className={input} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Site Name</label>
                  <input type="text" value={metadata.siteName} onChange={e => handleMetaChange("siteName", e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label}>Page Type</label>
                  <select value={metadata.type} onChange={e => handleMetaChange("type", e.target.value)} className={`${input} cursor-pointer`}>
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="profile">Profile</option>
                    <option value="book">Book</option>
                    <option value="video.other">Video</option>
                  </select>
                </div>
              </div>

              {/* OG Image designer */}
              {!metadata.image && (
                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />Dynamic OG Image Designer
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">No image URL detected. A gradient SVG cover is generated automatically. Pick a brand accent:</p>
                  <div className="flex items-center gap-2">
                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent" />
                    <div className="flex gap-1">
                      {["#6366f1", "#0ea5e9", "#10b981", "#ec4899", "#f59e0b", "#a855f7"].map(c => (
                        <button key={c} type="button" onClick={() => setAccentColor(c)}
                          className={`w-4 h-4 rounded-full cursor-pointer border-2 transition ${accentColor === c ? "border-slate-400 dark:border-white scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Previews */}
        <div className="lg:col-span-7">
          <div className={`${card} p-5`}>
            {/* Canvas header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />Live Previews Canvas
              </h2>
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
                {[{ id: "grid", icon: <Grid className="w-3.5 h-3.5" />, label: "Grid" }, { id: "tab", icon: <LayoutList className="w-3.5 h-3.5" />, label: "Focus" }].map(v => (
                  <button key={v.id} type="button" onClick={() => setViewMode(v.id)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${viewMode === v.id ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                    {v.icon}{v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform tabs (Focus mode) */}
            {viewMode === "tab" && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {PLATFORMS.map(tab => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"}`}>
                    {tab}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-8">

              {/* ── FACEBOOK ── */}
              {(viewMode === "grid" || activeTab === "facebook") && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                    <span className="font-semibold flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />Facebook Post Link
                    </span>
                    <div className="flex gap-2 text-slate-400 dark:text-slate-500">
                      {[{ id: "desktop", icon: <Monitor className="w-3 h-3" />, label: "Desktop" }, { id: "mobile", icon: <Smartphone className="w-3 h-3" />, label: "Mobile" }].map(d => (
                        <button key={d.id} type="button" onClick={() => setDeviceMode(d.id)}
                          className={`flex items-center gap-1 text-[11px] font-medium transition cursor-pointer ${deviceMode === d.id ? "text-indigo-500 dark:text-indigo-400" : "hover:text-slate-600 dark:hover:text-slate-300"}`}>
                          {d.icon}{d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`mx-auto bg-white dark:bg-[#18191a] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm ${deviceMode === "mobile" ? "max-w-[380px]" : "w-full"}`}>
                    <div className="p-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-xs">FB</div>
                      <div>
                        <div className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">ToolsTrek User</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">Just now · <Globe className="w-3 h-3" /></div>
                      </div>
                    </div>
                    <div className="px-3 pb-2 text-[13px] text-slate-700 dark:text-slate-300">Check this out! Writing professional links has never been easier.</div>
                    <div className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#242526] cursor-pointer transition">
                      <img src={displayImage} alt="FB preview" className="w-full aspect-[1.91/1] object-cover bg-slate-100 dark:bg-slate-800" onError={e => { e.target.src = customOgImage; }} />
                      <div className="px-3 py-2 bg-slate-50 dark:bg-[#242526]">
                        <div className="text-[11px] uppercase text-slate-400 tracking-wide">{metadata.domain || "EXAMPLE.COM"}</div>
                        <div className="text-[14px] font-bold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-1">{metadata.title || "Preview Title"}</div>
                        <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{metadata.description || "Preview description will appear here."}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── X / TWITTER ── */}
              {(viewMode === "grid" || activeTab === "twitter") && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                    <span className="font-semibold flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />X (Twitter) Card
                    </span>
                    <div className="flex gap-2">
                      {[{ id: "summary_large_image", label: "Large Image" }, { id: "summary", label: "Summary" }].map(c => (
                        <button key={c.id} type="button" onClick={() => setTwitterCardType(c.id)}
                          className={`text-[11px] font-medium cursor-pointer transition ${twitterCardType === c.id ? "text-indigo-500 dark:text-indigo-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"}`}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden max-w-[500px] mx-auto shadow-sm">
                    <div className="p-3 pb-1 flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-xs">X</div>
                      <div className="text-[13px] text-slate-800 dark:text-slate-200">
                        <span className="font-bold">Web Inspector</span> <span className="text-slate-400">@inspector · 1m</span>
                        <div className="mt-1">Take a look at how this URL formats on X:</div>
                      </div>
                    </div>
                    <div className="px-3 pb-3 pl-13">
                      {twitterCardType === "summary_large_image" ? (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                          <img src={displayImage} alt="Twitter large" className="w-full aspect-[1.91/1] object-cover bg-slate-100 dark:bg-slate-800" onError={e => { e.target.src = customOgImage; }} />
                          <div className="p-2.5">
                            <div className="text-[11.5px] text-slate-400 flex items-center gap-1 lowercase"><Globe className="w-3 h-3" />{metadata.domain || "example.com"}</div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-[13.5px] mt-0.5 line-clamp-1">{metadata.title || "Preview Title"}</div>
                            <div className="text-[12.5px] text-slate-500 mt-0.5 line-clamp-2">{metadata.description || "Description preview."}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition h-[110px]">
                          <img src={displayImage} alt="Twitter thumb" className="w-[110px] h-full object-cover shrink-0 bg-slate-100 dark:bg-slate-800" onError={e => { e.target.src = customOgImage; }} />
                          <div className="p-2.5 flex flex-col justify-center min-w-0">
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 lowercase"><Globe className="w-2.5 h-2.5" />{metadata.domain || "example.com"}</div>
                            <div className="font-semibold text-[13px] text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">{metadata.title || "Preview Title"}</div>
                            <div className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-2">{metadata.description || "Description."}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── LINKEDIN ── */}
              {(viewMode === "grid" || activeTab === "linkedin") && (
                <div className="space-y-2">
                  <div className="text-xs border-b border-slate-100 dark:border-slate-800/60 pb-1.5 font-semibold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />LinkedIn Link Attachment
                  </div>
                  <div className="bg-white dark:bg-[#1d2226] rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-sm">IN</div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900 dark:text-white">LinkedIn Professional</div>
                        <div className="text-[11px] text-slate-400">Software Developer · 1h</div>
                      </div>
                    </div>
                    <div className="text-[13px] text-slate-600 dark:text-slate-300 mb-3">Here is the rendering for my latest project URL metadata:</div>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden cursor-pointer hover:bg-slate-50 dark:hover:bg-[#283038] transition">
                      <img src={displayImage} alt="LinkedIn" className="w-full aspect-[1.91/1] object-cover bg-slate-100 dark:bg-slate-800" onError={e => { e.target.src = customOgImage; }} />
                      <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="text-[14px] font-semibold text-slate-900 dark:text-white line-clamp-1">{metadata.title || "Preview Title"}</div>
                        <div className="text-[11.5px] text-slate-400 mt-1">{metadata.domain || "example.com"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── GOOGLE ── */}
              {(viewMode === "grid" || activeTab === "google") && (
                <div className="space-y-2">
                  <div className="text-xs border-b border-slate-100 dark:border-slate-800/60 pb-1.5 font-semibold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Google Search Snippet
                  </div>
                  <div className="bg-white dark:bg-[#202124] rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-[18px] h-[18px] rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <img src={metadata.icon || "https://example.com/favicon.ico"} alt="icon" className="w-3.5 h-3.5 rounded-sm object-contain" onError={e => { e.target.src = "https://www.google.com/s2/favicons?domain=" + metadata.domain; }} />
                      </div>
                      <div className="text-[12px] text-slate-600 dark:text-[#bdc1c6] flex items-center gap-1 lowercase truncate">
                        <span>{metadata.siteName || "Site"}</span>
                        <span className="text-slate-300 dark:text-slate-600">›</span>
                        <span className="text-slate-400 text-[11px] truncate">{metadata.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
                      </div>
                    </div>
                    <div className="text-[19px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-normal line-clamp-1 mb-1.5">{metadata.title || "Preview Title Tag"}</div>
                    <div className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-3">{metadata.description || "Provide an SEO meta description between 50–160 characters."}</div>
                  </div>
                </div>
              )}

              {/* ── SLACK ── */}
              {(viewMode === "grid" || activeTab === "slack") && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                    <span className="font-semibold flex items-center gap-1.5 text-purple-600 dark:text-purple-400"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />Slack Attachment</span>
                    <button type="button" onClick={() => setSlackTheme(p => p === "light" ? "dark" : "light")}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[11px] font-medium cursor-pointer flex items-center gap-1">
                      Theme: <span className="text-indigo-500 capitalize ml-0.5">{slackTheme}</span>
                    </button>
                  </div>
                  <div className={`p-4 rounded-xl border text-left shadow-sm font-sans ${slackTheme === "light" ? "bg-white border-slate-200 text-slate-900" : "bg-[#1a1d21] border-slate-700 text-[#d1d2d3]"}`}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">SL</div>
                      <div className="text-[13.5px]"><span className="font-bold">Bot Inspector</span><span className={`text-[11px] ml-2 ${slackTheme === "light" ? "text-slate-400" : "text-slate-500"}`}>12:30 PM</span></div>
                    </div>
                    <div className="pl-9 flex gap-3">
                      <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                      <div className="min-w-0 space-y-1">
                        <div className={`text-[12px] font-bold flex items-center gap-1.5 cursor-pointer hover:underline ${slackTheme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                          <img src={metadata.icon} alt="" className="w-3 h-3 object-contain" onError={e => { e.target.src = "https://www.google.com/s2/favicons?domain=" + metadata.domain; }} />
                          {metadata.siteName || "Site Name"}
                        </div>
                        <div className="font-bold text-[14px] text-[#1264a3] dark:text-[#36c5f0] hover:underline cursor-pointer line-clamp-1">{metadata.title || "Preview Title"}</div>
                        <div className={`text-[13px] leading-relaxed line-clamp-3 ${slackTheme === "light" ? "text-slate-600" : "text-[#d1d2d3]"}`}>{metadata.description || "Enter a compelling description."}</div>
                        <img src={displayImage} alt="Slack" className="rounded-lg max-w-full max-h-[200px] object-cover mt-1.5 border border-slate-200 dark:border-slate-700" onError={e => { e.target.src = customOgImage; }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── DISCORD ── */}
              {(viewMode === "grid" || activeTab === "discord") && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                    <span className="font-semibold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />Discord Embed Card</span>
                    <button type="button" onClick={() => setDiscordTheme(p => p === "dark" ? "light" : "dark")}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[11px] font-medium cursor-pointer flex items-center gap-1">
                      Theme: <span className="text-indigo-500 capitalize ml-0.5">{discordTheme}</span>
                    </button>
                  </div>
                  <div className={`p-4 rounded-xl border text-left shadow-sm max-w-[500px] mx-auto font-sans ${discordTheme === "light" ? "bg-[#f2f3f5] border-slate-200 text-slate-900" : "bg-[#2f3136] border-slate-700 text-[#dcddde]"}`}>
                    <div className="flex gap-2 mb-2 items-center">
                      <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-[10px]">DI</div>
                      <div className="text-[12px]">
                        <span className={`font-semibold ${discordTheme === "light" ? "text-slate-800" : "text-[#f6f6f7]"}`}>GamerBot</span>
                        <span className="bg-[#5865f2] text-white text-[9px] font-bold px-1 rounded ml-1.5">BOT</span>
                        <span className={`ml-2 text-[11px] ${discordTheme === "light" ? "text-slate-400" : "text-[#a3a6aa]"}`}>Today 12:35 PM</span>
                      </div>
                    </div>
                    <div className="pl-9">
                      <div className={`mb-1.5 text-[13px] ${discordTheme === "light" ? "text-slate-600" : "text-[#dddee0]"}`}>Check out this link preview embed:</div>
                      <div className={`rounded flex gap-3 border-l-4 p-3 ${discordTheme === "light" ? "bg-white" : "bg-[#202225]"}`} style={{ borderLeftColor: accentColor }}>
                        <div className="flex-1 min-w-0 space-y-1">
                          {metadata.siteName && <div className={`text-[11px] font-medium hover:underline cursor-pointer ${discordTheme === "light" ? "text-slate-500" : "text-[#b9bbbe]"}`}>{metadata.siteName}</div>}
                          <div className="text-[14.5px] font-semibold text-[#00aff0] hover:underline cursor-pointer leading-tight">{metadata.title || "Preview Title"}</div>
                          <div className={`text-[12.5px] leading-relaxed line-clamp-3 ${discordTheme === "light" ? "text-slate-600" : "text-[#dcddde]"}`}>{metadata.description || "Description for Discord embed."}</div>
                          <img src={displayImage} alt="Discord" className="rounded max-w-full max-h-[200px] object-cover mt-1" onError={e => { e.target.src = customOgImage; }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Advanced Options Accordion ── */}
      <div className="mb-8">
        <button type="button" onClick={() => setShowAdvanced(p => !p)}
          className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-700 px-5 py-3.5 rounded-xl flex items-center justify-between text-slate-700 dark:text-slate-200 font-bold text-sm transition-all shadow-sm cursor-pointer">
          <div className="flex items-center gap-2">
            <Settings className={`w-4.5 h-4.5 text-indigo-500 transition-transform duration-300 ${showAdvanced ? "rotate-90" : ""}`} />
            Advanced Configuration & SEO Exporters
          </div>
          {showAdvanced ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2">
              <div className={`${card} p-6 space-y-7`}>

                {/* Crawler simulation */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="md:col-span-5">
                    <h3 className={sectionLabel}><Compass className="w-4 h-4 text-indigo-500" />Crawler User-Agent Simulation</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">Simulate fetching the URL as a specific social bot. Some sites serve different meta tags to crawlers like Googlebot or Twitterbot.</p>
                    <label className={label}>Target Scraper Bot</label>
                    <select value={selectedUserAgent} onChange={e => setSelectedUserAgent(e.target.value)} className={`${input} cursor-pointer`}>
                      <option value="default">Standard Web Browser</option>
                      <option value="googlebot">Googlebot (Search Engine)</option>
                      <option value="twitterbot">Twitterbot (X / Twitter)</option>
                      <option value="facebook">facebookexternalhit (Facebook)</option>
                      <option value="discord">Discordbot (Discord)</option>
                    </select>
                  </div>
                  <div className="md:col-span-7 flex flex-col justify-center bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-indigo-500" />Why simulate a crawler?</h4>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Social platforms use custom User-Agents like <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/50 px-1 py-0.5 rounded">facebookexternalhit</code> to crawl pages. Some sites deliver custom meta tags exclusively to these bots. Toggle above to test compliance.
                    </p>
                  </div>
                </div>

                {/* SEO Audit + Code Export */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                  {/* SEO Health Meter */}
                  <div className="md:col-span-6 space-y-3">
                    <h3 className={sectionLabel}><ShieldCheck className="w-4 h-4 text-indigo-500" />SEO Meta Health Audit</h3>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                      <div className="relative w-[72px] h-[72px] shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                          <circle cx="36" cy="36" r="30" className="stroke-slate-200 dark:stroke-slate-800 fill-none" strokeWidth="6" />
                          <circle cx="36" cy="36" r="30" className="stroke-indigo-500 fill-none transition-all duration-500" strokeWidth="6"
                            strokeDasharray="188.4" strokeDashoffset={188.4 - (188.4 * seoAudit.score) / 100} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-slate-800 dark:text-slate-100">{seoAudit.score}%</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Meta Tag Strength</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Evaluates title/description lengths, image presence, SSL safety, and canonical URL setup.</div>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto text-[11.5px]">
                      {seoAudit.issues.map(issue => (
                        <div key={issue.id} className={`p-2.5 rounded-lg border flex gap-2 items-start ${issue.severity === "error" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-300" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-300"}`}>
                          {issue.severity === "error" ? <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                          <span>{issue.msg}</span>
                        </div>
                      ))}
                      {seoAudit.passes.map((pass, idx) => (
                        <div key={idx} className="p-2.5 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg flex gap-2 items-start">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /><span>{pass}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code Exporter */}
                  <div className="md:col-span-6 space-y-3">
                    <h3 className={sectionLabel}><Code className="w-4 h-4 text-indigo-500" />Code Export Center</h3>
                    <div className="flex gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      {[{ id: "html", name: "HTML / OG Tags" }, { id: "twitter", name: "Twitter Card" }, { id: "jsonld", name: "JSON-LD" }].map(item => (
                        <button key={item.id} type="button" onClick={() => setCodeTab(item.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${codeTab === item.id ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                          {item.name}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <pre className="p-3.5 bg-slate-950 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono text-indigo-300 overflow-x-auto whitespace-pre leading-relaxed max-h-[220px] overflow-y-auto">
                        <code>{codeTab === "html" ? generatedCode.html : codeTab === "twitter" ? generatedCode.twitter : generatedCode.jsonld}</code>
                      </pre>
                      <button type="button" onClick={handleCopyCode}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer transition flex items-center gap-1">
                        {copiedText ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[10px] text-emerald-400 font-semibold">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold">Copy</span></>}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                      Paste these tags inside the <code className="bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 px-1 py-0.5 rounded">&lt;head&gt;</code> of your HTML to control how links preview on every platform.
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </ToolPageShell>
  );
}
