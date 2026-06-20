"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { Search, X, ArrowRight } from "lucide-react";
import ALL_TOOLS from "../../lib/toolsData.json";

// Dynamic icon getter - no manual imports needed
const getIcon = (iconName) => {
  if (!iconName) return LucideIcons.FileText;
  const Icon = LucideIcons[iconName];
  return Icon || LucideIcons.FileText; // Fallback to FileText if icon not found
};

function scoreMatch(tool, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const title = tool.title.toLowerCase();
  const category = tool.category.toLowerCase();
  const description = tool.description.toLowerCase();
  const keywords = tool.keywords || [];

  // Exact match gets highest score
  if (title === q) return 100;

  // Starts with query
  if (title.startsWith(q)) return 80;

  // Title contains query
  if (title.includes(q)) return 60;

  // Keywords match
  if (keywords.some((k) => k.toLowerCase().startsWith(q))) return 50;
  if (keywords.some((k) => k.toLowerCase().includes(q))) return 40;

  // Category contains query
  if (category.includes(q)) return 30;

  // Description contains query
  if (description.includes(q)) return 20;

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
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (document.getElementById("tt-search-styles")) return;
    const tag = document.createElement("style");
    tag.id = "tt-search-styles";
    tag.textContent = ANIM_STYLES;
    document.head.appendChild(tag);
  }, []);

  const closeModal = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 140);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) closeModal();
        else setOpen(true);
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

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const navigateTo = useCallback(
    (path) => {
      closeModal();
      router.push(path);
    },
    [router, closeModal],
  );

  const results = query.trim()
    ? ALL_TOOLS.map((t) => ({ ...t, score: scoreMatch(t, query) }))
        .filter((t) => t.score > 0)
        .sort((a, b) => b.score - a.score)
    : ALL_TOOLS.slice(0, 9);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) navigateTo(results[activeIndex].link);
    }
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
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        className={`w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col ${closing ? "tt-modal tt-modal-out" : "tt-modal"}`}
        style={{ maxHeight: "78vh" }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <Search size={17} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools…"
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-[15px] outline-none"
          />
          <button
            onClick={() => setQuery("")}
            aria-label="Clear"
            style={{
              opacity: query ? 1 : 0,
              pointerEvents: query ? "auto" : "none",
              transition: "opacity 150ms",
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full p-0.5 cursor-pointer"
          >
            <X size={15} />
          </button>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] text-gray-400 dark:text-gray-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md font-mono leading-none">
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
                  key={tool.link}
                  tool={tool}
                  index={idx}
                  active={activeIndex === idx}
                  onSelect={() => navigateTo(tool.link)}
                  onHover={() => setActiveIndex(idx)}
                />
              ))}
            </ul>
          ) : (
            <div className="py-1.5">
              {Object.entries(grouped).map(([category, tools]) => (
                <div key={category}>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest select-none">
                    {category}
                  </p>
                  <ul>
                    {tools.map((tool) => {
                      const globalIdx = results.indexOf(tool);
                      return (
                        <ToolRow
                          key={tool.link}
                          tool={tool}
                          index={globalIdx}
                          active={activeIndex === globalIdx}
                          onSelect={() => navigateTo(tool.link)}
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
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 flex items-center gap-3 text-[11px] text-gray-400 bg-gray-50/70 dark:bg-gray-950/70 shrink-0 select-none">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd> open
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> toggle
          </span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 font-mono text-[10px] border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 shadow-sm leading-none">
      {children}
    </kbd>
  );
}

function ToolRow({ tool, index, active, onSelect, onHover }) {
  const IconComponent = getIcon(tool.icon);

  return (
    <li data-index={index}>
      <button
        onClick={onSelect}
        onMouseEnter={onHover}
        className="w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl cursor-pointer"
        style={{
          width: "calc(100% - 8px)",
          backgroundColor: active
            ? "var(--search-active-bg, rgba(0,0,0,0.055))"
            : "transparent",
          transition: "background-color 150ms ease",
        }}
      >
        {/* Icon bubble */}
        <span
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg"
          style={{
            backgroundColor: active
              ? "var(--brand-icon-bg, rgba(99,102,241,0.15))"
              : "var(--search-icon-bg, #f3f4f6)",
            color: active
              ? "var(--brandColor, #6366f1)"
              : "var(--search-icon-fg, #6b7280)",
            transition: "background-color 150ms ease, color 150ms ease",
          }}
        >
          <IconComponent size={15} />
        </span>

        {/* Tool title */}
        <span
          className="flex-1 text-sm font-medium text-left"
          style={{
            color: active
              ? "var(--brandColor, #6366f1)"
              : "var(--search-title-fg, #374151)",
            transition: "color 150ms ease",
          }}
        >
          {tool.title}
        </span>

        {/* Category - slides left to make room for arrow */}
        <span
          className="hidden sm:block text-[12px] whitespace-nowrap overflow-hidden"
          style={{
            color: active
              ? "var(--brandColor, #6366f1)"
              : "var(--search-cat-fg, #9ca3af)",
            opacity: active ? 0.7 : 1,
            transform: active ? "translateX(-4px)" : "translateX(0)",
            transition:
              "transform 180ms ease, opacity 180ms ease, color 180ms ease",
          }}
        >
          {tool.category}
        </span>

        {/* Arrow - fades + slides in from the right */}
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
