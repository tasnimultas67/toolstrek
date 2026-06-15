"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileText,
  QrCode,
  FileImage,
  Link2,
  Lock,
  Calculator,
  Image,
  ArrowRight,
} from "lucide-react";

const ALL_TOOLS = [
  // Text & Writing
  { name: "Case Converter",     path: "/tools/case-converter",     category: "Text & Writing",   icon: FileText,  keywords: ["text", "case", "upper", "lower", "title"] },
  { name: "Markdown Previewer", path: "/tools/markdown-previewer", category: "Text & Writing",   icon: FileText,  keywords: ["markdown", "preview", "md", "render"] },
  { name: "Text Repeater",      path: "/tools/text-repeater",      category: "Text & Writing",   icon: FileText,  keywords: ["text", "repeat", "duplicate", "copy"] },
  { name: "Numbers to Words",   path: "/tools/numbers-to-words",   category: "Text & Writing",   icon: FileText,  keywords: ["number", "word", "convert", "spell"] },

  // Productivity
  { name: "Age Calculator",      path: "/tools/age-calculate",       category: "Productivity", icon: Calculator, keywords: ["age", "birthday", "date", "born", "calculate"] },
  { name: "BMI Calculator",      path: "/tools/bmi-calculator",      category: "Productivity", icon: Calculator, keywords: ["bmi", "body", "mass", "index", "weight", "height"] },
  { name: "CGPA Calculator",     path: "/tools/cgpa-calculator",     category: "Productivity", icon: Calculator, keywords: ["cgpa", "gpa", "grade", "point", "average", "academic"] },
  { name: "Days Tracker",        path: "/tools/days-tracker",        category: "Productivity", icon: Calculator, keywords: ["days", "tracker", "date", "countdown", "calendar"] },
  { name: "Domain Age Checker",  path: "/tools/domain-age-checker",  category: "Productivity", icon: Calculator, keywords: ["domain", "age", "whois", "website"] },
  { name: "Fake Info Generator", path: "/tools/fake-info-generator", category: "Productivity", icon: Calculator, keywords: ["fake", "info", "generate", "dummy", "data", "random"] },

  // QR & Scanning
  { name: "QR Code Generator", path: "/tools/qr-code-generator", category: "QR & Scanning", icon: QrCode, keywords: ["qr", "code", "generate", "scan", "barcode"] },
  { name: "QR Scanner",        path: "/tools/qr-scanner",        category: "QR & Scanning", icon: QrCode, keywords: ["qr", "scanner", "scan", "read", "decode"] },
  { name: "WiFi QR Generator", path: "/tools/wifi-qr",           category: "QR & Scanning", icon: QrCode, keywords: ["wifi", "qr", "network", "password", "wireless"] },

  // Documents & PDF
  { name: "Add Attachments",      path: "/tools/add-attachments",      category: "Documents & PDF", icon: FileImage, keywords: ["pdf", "attachment", "embed", "add", "file"] },
  { name: "Combine Files to PDF", path: "/tools/combine-files-to-pdf", category: "Documents & PDF", icon: FileImage, keywords: ["combine", "merge", "files", "pdf"] },
  { name: "PDF Compression",      path: "/tools/compress-pdf",         category: "Documents & PDF", icon: FileImage, keywords: ["pdf", "compress", "reduce", "size", "optimize"] },
  { name: "Crop PDF",             path: "/tools/crop-pdf",             category: "Documents & PDF", icon: FileImage, keywords: ["pdf", "crop", "trim", "cut", "margin"] },
  { name: "Image to PDF",         path: "/tools/image-to-pdf",         category: "Documents & PDF", icon: FileImage, keywords: ["image", "pdf", "convert", "jpg", "png"] },
  { name: "N-up PDF",             path: "/tools/n-up-pdf",             category: "Documents & PDF", icon: FileImage, keywords: ["pdf", "nup", "multiple", "pages", "layout", "print"] },
  { name: "PDF Merger",           path: "/tools/pdf-merger",           category: "Documents & PDF", icon: FileImage, keywords: ["pdf", "merge", "combine", "join"] },
  { name: "PDF Reorder",          path: "/tools/pdf-reorder",          category: "Documents & PDF", icon: FileImage, keywords: ["pdf", "reorder", "rearrange", "pages", "sort"] },
  { name: "PDF Split",            path: "/tools/pdf-split",            category: "Documents & PDF", icon: FileImage, keywords: ["pdf", "split", "separate", "divide", "extract"] },
  { name: "PDF to Image",         path: "/tools/pdf-to-image",         category: "Documents & PDF", icon: FileImage, keywords: ["pdf", "image", "convert", "jpg", "png"] },

  // Media & Conversion
  { name: "AVIF Converter", path: "/tools/avif-converter", category: "Media & Conversion", icon: Image, keywords: ["avif", "image", "convert", "format", "webp"] },
  { name: "Image to Text",  path: "/tools/image-to-text",  category: "Media & Conversion", icon: Image, keywords: ["image", "text", "ocr", "extract", "scan", "read"] },

  // Links & Security
  { name: "Link Shortener",     path: "/tools/link-shortner",      category: "Links & Security", icon: Link2, keywords: ["link", "url", "shorten", "short", "redirect"] },
  { name: "Password Generator", path: "/tools/password-generator", category: "Links & Security", icon: Lock,  keywords: ["password", "generate", "secure", "random", "strong"] },
];

function scoreMatch(tool, query) {
  const q   = query.toLowerCase().trim();
  const name = tool.name.toLowerCase();
  const cat  = tool.category.toLowerCase();
  const kws  = tool.keywords;
  if (!q)                                return 0;
  if (name === q)                        return 100;
  if (name.startsWith(q))               return 80;
  if (name.includes(q))                  return 60;
  if (kws.some((k) => k.startsWith(q))) return 50;
  if (cat.includes(q))                   return 40;
  if (kws.some((k) => k.includes(q)))   return 30;
  return 0;
}

const ANIM_STYLES = `
@keyframes tt-backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes tt-modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(-10px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);     }
}
@keyframes tt-modal-out {
  from { opacity: 1; transform: scale(1)    translateY(0);     }
  to   { opacity: 0; transform: scale(0.96) translateY(-10px); }
}
.tt-backdrop     { animation: tt-backdrop-in 180ms ease both; }
.tt-backdrop-out { animation: tt-backdrop-in 140ms ease reverse both; }
.tt-modal        { animation: tt-modal-in    210ms cubic-bezier(0.22,1,0.36,1) both; }
.tt-modal-out    { animation: tt-modal-out   140ms ease both; }
`;

export default function GlobalSearchModal() {
  const [open,        setOpen]        = useState(false);
  const [closing,     setClosing]     = useState(false);
  const [query,       setQuery]       = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef  = useRef(null);
  const router   = useRouter();

  useEffect(() => {
    if (document.getElementById("tt-search-styles")) return;
    const tag = document.createElement("style");
    tag.id = "tt-search-styles";
    tag.textContent = ANIM_STYLES;
    document.head.appendChild(tag);
  }, []);

  const closeModal = useCallback(() => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 140);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) closeModal(); else setOpen(true);
      }
      if (e.key === "Escape" && open) closeModal();
    };
    const onEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("toolstrek:open-search", onEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("toolstrek:open-search", onEvent);
    };
  }, [open, closeModal]);

  useEffect(() => {
    if (open && !closing) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open, closing]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const navigateTo = useCallback((path) => {
    closeModal();
    router.push(path);
  }, [router, closeModal]);

  const results = query.trim()
    ? ALL_TOOLS
        .map((t) => ({ ...t, score: scoreMatch(t, query) }))
        .filter((t) => t.score > 0)
        .sort((a, b) => b.score - a.score)
    : ALL_TOOLS.slice(0, 9);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter")   { e.preventDefault(); if (results[activeIndex]) navigateTo(results[activeIndex].path); }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  if (!open) return null;

  const grouped = results.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${closing ? "tt-backdrop tt-backdrop-out" : "tt-backdrop"}`}
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
    >
      <div
        className={`w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col ${closing ? "tt-modal tt-modal-out" : "tt-modal"}`}
        style={{ maxHeight: "78vh" }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 shrink-0">
          <Search size={17} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools…"
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-[15px] outline-none"
          />
          <button
            onClick={() => setQuery("")}
            aria-label="Clear"
            style={{ opacity: query ? 1 : 0, pointerEvents: query ? "auto" : "none", transition: "opacity 150ms" }}
            className="text-gray-400 hover:text-gray-600 rounded-full p-0.5 cursor-pointer"
          >
            <X size={15} />
          </button>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] text-gray-400 border border-gray-200 rounded-md font-mono leading-none">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto flex-1">
          {results.length === 0 ? (
            <div className="py-14 text-center text-gray-400 text-sm select-none">
              No tools found for &ldquo;{query}&rdquo;
            </div>
          ) : query.trim() ? (
            <ul className="py-1.5">
              {results.map((tool, idx) => (
                <ToolRow
                  key={tool.path}
                  tool={tool}
                  index={idx}
                  active={activeIndex === idx}
                  onSelect={() => navigateTo(tool.path)}
                  onHover={() => setActiveIndex(idx)}
                />
              ))}
            </ul>
          ) : (
            <div className="py-1.5">
              {Object.entries(grouped).map(([category, tools]) => (
                <div key={category}>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-widest select-none">
                    {category}
                  </p>
                  <ul>
                    {tools.map((tool) => {
                      const globalIdx = results.indexOf(tool);
                      return (
                        <ToolRow
                          key={tool.path}
                          tool={tool}
                          index={globalIdx}
                          active={activeIndex === globalIdx}
                          onSelect={() => navigateTo(tool.path)}
                          onHover={() => setActiveIndex(globalIdx)}
                        />
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-3 text-[11px] text-gray-400 bg-gray-50/70 shrink-0 select-none">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
          <span className="flex items-center gap-1 ml-auto"><Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> toggle</span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 font-mono text-[10px] border border-gray-200 rounded bg-white shadow-sm leading-none">
      {children}
    </kbd>
  );
}

function ToolRow({ tool, index, active, onSelect, onHover }) {
  const Icon = tool.icon;
  return (
    <li data-index={index}>
      <button
        onClick={onSelect}
        onMouseEnter={onHover}
        className="w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl cursor-pointer"
        style={{
          width: "calc(100% - 8px)",
          backgroundColor: active ? "rgba(0,0,0,0.055)" : "transparent",
          transition: "background-color 150ms ease",
        }}
      >
        {/* Icon bubble */}
        <span
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg"
          style={{
            backgroundColor: active ? "var(--brand-icon-bg, rgba(99,102,241,0.15))" : "#f3f4f6",
            color: active ? "var(--brandColor, #6366f1)" : "#6b7280",
            transition: "background-color 150ms ease, color 150ms ease",
          }}
        >
          <Icon size={15} />
        </span>

        {/* Tool name */}
        <span
          className="flex-1 text-sm font-medium text-left"
          style={{
            color: active ? "var(--brandColor, #6366f1)" : "#374151",
            transition: "color 150ms ease",
          }}
        >
          {tool.name}
        </span>

        {/* Category — slides left to make room for arrow */}
        <span
          className="hidden sm:block text-[12px] whitespace-nowrap overflow-hidden"
          style={{
            color: active ? "var(--brandColor, #6366f1)" : "#9ca3af",
            opacity: active ? 0.7 : 1,
            transform: active ? "translateX(-4px)" : "translateX(0)",
            transition: "transform 180ms ease, opacity 180ms ease, color 180ms ease",
          }}
        >
          {tool.category}
        </span>

        {/* Arrow — fades + slides in from the right */}
        <ArrowRight
          size={14}
          style={{
            color: "var(--brandColor, #6366f1)",
            opacity: active ? 1 : 0,
            transform: active ? "translateX(0)" : "translateX(6px)",
            transition: "opacity 180ms ease, transform 180ms ease",
            flexShrink: 0,
          }}
        />
      </button>
    </li>
  );
}
