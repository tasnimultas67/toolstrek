"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Disc3,
  Download,
  FileJson,
  History,
  Info,
  ListPlus,
  Maximize2,
  Palette,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  CopyButton,
  FaqAccordion,
  Field,
  Hero,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import { downloadText, pickIndex, secureUnit, toCsv, uid } from "../_shared/toolkit/random";
import {
  DEFAULT_WHEEL_SETTINGS,
  DEMO_ENTRIES,
  PALETTES,
  WHEEL_FAQS,
  WHEEL_STORAGE_KEY,
  colorAt,
  paletteColors,
  parseWheelLines,
  textColorFor,
  truncateLabel,
} from "./wheelData";

const TOOL_META = {
  title: "Wheel Spinner",
  link: "/tools/wheel-spinner",
  icon: "Disc3",
};

function normalizeEntry(entry, index, palette) {
  const weight = Number(entry?.weight);
  return {
    id: entry?.id || uid("wheel"),
    label: String(entry?.label ?? "").slice(0, 120),
    weight: Number.isFinite(weight) && weight > 0 ? weight : 1,
    color: entry?.color || colorAt(palette, index),
  };
}

function polar(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function buildSegmentPath(start, end, radius = 192, cx = 200, cy = 200) {
  const from = polar(cx, cy, radius, start);
  const to = polar(cx, cy, radius, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${from.x.toFixed(3)} ${from.y.toFixed(3)} A ${radius} ${radius} 0 ${largeArc} 1 ${to.x.toFixed(3)} ${to.y.toFixed(3)} Z`;
}

export default function WheelSpinner() {
  const { addRecentTool } = useRecentTools();
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_WHEEL_SETTINGS);
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const [bulkText, setBulkText] = useState("");
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const rotationRef = useRef(0);
  const finishTimer = useRef(null);
  const removeTimer = useRef(null);
  const tickTimers = useRef([]);
  const audioRef = useRef(null);
  const stageRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(WHEEL_STORAGE_KEY) : null;
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved.entries)) {
            setEntries(saved.entries.map((entry, index) => normalizeEntry(entry, index, saved.settings?.palette || "vibrant")));
          }
          if (saved.settings) setSettings({ ...DEFAULT_WHEEL_SETTINGS, ...saved.settings });
          if (Array.isArray(saved.history)) setHistory(saved.history.slice(0, 100));
        }
      } catch {
        // Corrupt local data is ignored; the wheel simply starts empty.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        WHEEL_STORAGE_KEY,
        JSON.stringify({ entries, settings, history: history.slice(0, 100) }),
      );
    } catch {
      // Storage can be unavailable in private windows; the tool still works.
    }
  }, [entries, settings, history, hydrated]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(finishTimer.current);
      window.clearTimeout(removeTimer.current);
      tickTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (audioRef.current) {
        audioRef.current.close().catch(() => {});
        audioRef.current = null;
      }
    },
    [],
  );

  const segments = useMemo(() => {
    const safe = entries.map((entry) => ({
      ...entry,
      safeWeight: Math.max(0.01, Number(entry.weight) || 1),
    }));
    const total = safe.reduce((sum, entry) => sum + entry.safeWeight, 0);
    const result = [];
    let cursor = 0;
    for (const entry of safe) {
      const start = total > 0 ? (cursor / total) * 360 : 0;
      cursor += entry.safeWeight;
      const end = total > 0 ? (cursor / total) * 360 : 0;
      result.push({ ...entry, start, end, center: (start + end) / 2, span: end - start });
    }
    return result;
  }, [entries]);

  const totalWeight = useMemo(
    () => segments.reduce((sum, segment) => sum + segment.safeWeight, 0),
    [segments],
  );

  const stats = useMemo(() => {
    const counts = history.reduce((map, item) => {
      map[item.label] = (map[item.label] || 0) + 1;
      return map;
    }, {});
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return {
      spins: history.length,
      unique: Object.keys(counts).length,
      top: top ? `${top[0]} ×${top[1]}` : "—",
    };
  }, [history]);

  const addEntry = (label = "") => {
    setEntries((current) => [
      ...current,
      {
        id: uid("wheel"),
        label,
        weight: 1,
        color: colorAt(settings.palette, current.length),
      },
    ]);
  };

  const updateEntry = (id, patch) => {
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const removeEntry = (id) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    if (winner?.id === id) setWinner(null);
  };

  const loadDemo = () => {
    const demo = DEMO_ENTRIES.map((label, index) => ({
      id: uid("wheel"),
      label,
      weight: 1,
      color: colorAt(settings.palette, index),
    }));
    setEntries(demo);
    setWinner(null);
    toast.success("Demo wheel loaded. Edit or clear it anytime.");
  };

  const clearAll = () => {
    if (!entries.length) return;
    if (!window.confirm("Clear every option from this wheel? This cannot be undone.")) return;
    setEntries([]);
    setWinner(null);
    setIsSpinning(false);
    toast.success("Wheel cleared.");
  };

  const applyPalette = () => {
    setEntries((current) => current.map((entry, index) => ({ ...entry, color: colorAt(settings.palette, index) })));
    toast.success(`${PALETTES[settings.palette].label} palette applied.`);
  };

  const addBulk = (replace = false) => {
    const parsed = parseWheelLines(bulkText, settings.palette);
    if (!parsed.length) {
      toast.error("Add at least one line with an option name.");
      return;
    }
    const next = parsed.map((entry, index) => ({
      id: uid("wheel"),
      label: entry.label,
      weight: entry.weight,
      color: colorAt(settings.palette, index),
    }));
    setEntries((current) => (replace ? next : [...current, ...next]));
    setBulkText("");
    toast.success(`${next.length} option${next.length === 1 ? "" : "s"} ${replace ? "replaced" : "added"}.`);
  };

  const exportJson = () => {
    if (!entries.length) {
      toast.error("Add options before exporting.");
      return;
    }
    downloadText(
      JSON.stringify({ name: "ToolsTrek wheel", settings, entries }, null, 2),
      "toolstrek-wheel.json",
      "application/json",
    );
  };

  const exportCsv = () => {
    if (!entries.length) {
      toast.error("Add options before exporting.");
      return;
    }
    downloadText(
      toCsv([["Option", "Weight", "Color"], ...entries.map((entry) => [entry.label, entry.weight, entry.color])]),
      "toolstrek-wheel.csv",
      "text/csv;charset=utf-8",
    );
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const list = Array.isArray(parsed) ? parsed : parsed.entries;
      if (!Array.isArray(list) || !list.length) throw new Error("No options found");
      setEntries(list.map((entry, index) => normalizeEntry(entry, index, settings.palette)));
      if (parsed.settings) setSettings({ ...DEFAULT_WHEEL_SETTINGS, ...parsed.settings });
      setWinner(null);
      toast.success(`Imported ${list.length} option${list.length === 1 ? "" : "s"}.`);
    } catch {
      toast.error("That file is not a valid ToolsTrek wheel JSON export.");
    }
  };

  const playTone = useCallback(
    (frequency, duration = 0.1, type = "sine", volume = 0.04) => {
      if (!settings.sound || typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioRef.current) audioRef.current = new AudioCtx();
      const context = audioRef.current;
      if (context.state === "suspended") context.resume().catch(() => {});
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration + 0.02);
    },
    [settings.sound],
  );

  const playWinSound = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      window.setTimeout(() => playTone(frequency, 0.28, "triangle", 0.055), index * 105);
    });
  }, [playTone]);

  const clearSpinTimers = () => {
    window.clearTimeout(finishTimer.current);
    tickTimers.current.forEach((timer) => window.clearTimeout(timer));
    tickTimers.current = [];
  };

  const finishSpin = useCallback(
    (entry) => {
      setIsSpinning(false);
      setWinner(entry);
      setHistory((current) =>
        [
          { id: uid("spin"), label: entry.label, weight: entry.weight, at: Date.now() },
          ...current,
        ].slice(0, 100),
      );
      playWinSound();
      if (settings.removeWinner) {
        removeTimer.current = window.setTimeout(() => {
          setEntries((current) => current.filter((item) => item.id !== entry.id));
        }, 1400);
      }
    },
    [settings.removeWinner, playWinSound],
  );

  const spin = useCallback(() => {
    if (isSpinning) return;
    const usable = entries.filter((entry) => String(entry.label).trim());
    if (!usable.length) {
      toast.error("Add at least one option to spin the wheel.");
      return;
    }

    setWinner(null);
    clearSpinTimers();

    const weights = segments.map((segment) =>
      settings.weightMode === "equal" ? 1 : segment.safeWeight,
    );
    const index = pickIndex(weights);
    if (index < 0) return;
    const segment = segments[index];

    const landing = segment.start + Math.max(0.35, segment.span * (0.16 + secureUnit() * 0.68));
    const current = rotationRef.current;
    const base = Math.ceil(current / 360) * 360;
    const target = base + Math.max(2, Number(settings.spins) || 6) * 360 + (360 - landing) + 360;

    setRotation(target);
    rotationRef.current = target;
    setIsSpinning(true);
    setWinner(null);

    const durationMs = Math.max(2, Number(settings.duration) || 5) * 1000;
    let elapsed = 0;
    let gap = 55;
    const tick = () => {
      playTone(760, 0.025, "square", 0.012);
      elapsed += gap;
      gap *= 1.16;
      if (elapsed < durationMs - 140) {
        tickTimers.current.push(window.setTimeout(tick, gap));
      }
    };
    tick();

    finishTimer.current = window.setTimeout(() => {
      finishSpin({ ...segment, index });
    }, durationMs + 120);
  }, [entries, isSpinning, segments, settings.duration, settings.spins, settings.weightMode, finishSpin, playTone]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== "Space") return;
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || event.target?.isContentEditable) return;
      event.preventDefault();
      spin();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [spin]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await stageRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      toast.error("Fullscreen is not available in this browser.");
    }
  };

  const exportHistory = () => {
    if (!history.length) {
      toast.error("Spin the wheel first to build a history.");
      return;
    }
    downloadText(
      toCsv([
        ["Result", "Weight", "Timestamp"],
        ...history.map((item) => [item.label, item.weight, new Date(item.at).toISOString()]),
      ]),
      "toolstrek-wheel-history.csv",
      "text/csv;charset=utf-8",
    );
  };

  const confetti = useMemo(() => {
    const colors = paletteColors(settings.palette);
    return Array.from({ length: 30 }, (_, index) => ({
      left: `${secureUnit() * 100}%`,
      delay: `${secureUnit() * 0.6}s`,
      color: colors[index % colors.length],
      rotate: `${secureUnit() * 360}deg`,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner?.id, settings.palette]);

  const hasEntries = entries.length > 0;

  return (
    <div className="tool-page-content space-y-5">
      <style>{`
        @keyframes wheel-confetti {
          0% { transform: translate3d(0,-12px,0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(0,120px,0) rotate(520deg); opacity: 0; }
        }
        @keyframes winner-pop {
          0% { transform: scale(.86); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .wheel-confetti-piece { animation: wheel-confetti 1.25s ease-out forwards; }
        .winner-pop { animation: winner-pop .28s cubic-bezier(.2,.9,.3,1.2) both; }
      `}</style>

      <Hero
        eyebrow="Decision & raffle studio"
        icon={Disc3}
        title="Wheel Spinner"
        description="Build a weighted wheel from your own options, spin it with cryptographically secure randomness, and keep a transparent result history. Empty by default, fully customizable, and private to your browser."
        badges={["Secure randomness", "Weighted options", "No uploads", "Works offline"]}
        tone="indigo"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <div className="space-y-5">
          <SectionCard
            icon={Disc3}
            title="Your wheel"
            description="Press Spin, the large button, or the Space bar. The pointer always lands on the option selected by the random engine."
            tone="indigo"
            actions={
              <>
                <Chip tone="indigo">{entries.length} options</Chip>
                <Chip tone="emerald">{totalWeight.toFixed(totalWeight % 1 === 0 ? 0 : 1)} weight</Chip>
              </>
            }
          >
            <div
              ref={stageRef}
              className="relative flex flex-col items-center justify-center gap-5 rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-950/40 sm:p-5"
            >
              {hasEntries ? (
                <div className="relative mx-auto aspect-square w-full max-w-[520px]">
                  <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1 drop-shadow-lg">
                    <div className="h-0 w-0 border-x-[13px] border-t-[24px] border-x-transparent border-t-rose-500" />
                  </div>
                  <svg
                    viewBox="0 0 400 400"
                    className="h-full w-full drop-shadow-xl"
                    role="img"
                    aria-label={`Prize wheel with ${entries.length} options`}
                  >
                    <circle cx="200" cy="200" r="196" fill="#0f172a" opacity="0.08" />
                    <g
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: "200px 200px",
                        transition: isSpinning
                          ? `transform ${Math.max(2, Number(settings.duration) || 5)}s cubic-bezier(0.12, 0.72, 0.16, 1)`
                          : "none",
                      }}
                    >
                      {segments.length === 1 ? (
                        <circle cx="200" cy="200" r="192" fill={segments[0].color} />
                      ) : (
                        segments.map((segment) => (
                          <path
                            key={segment.id}
                            d={buildSegmentPath(segment.start, segment.end)}
                            fill={segment.color}
                            stroke="rgba(255,255,255,.65)"
                            strokeWidth="1.4"
                            opacity={winner && !isSpinning && winner.id === segment.id ? 1 : 0.96}
                          />
                        ))
                      )}
                      {settings.showLabels &&
                        segments.map((segment) => (
                          <g key={`label-${segment.id}`} transform={`rotate(${segment.center} 200 200)`}>
                            <g transform={segment.center > 90 && segment.center < 270 ? "rotate(180 200 78)" : undefined}>
                              <text
                                x="200"
                                y="78"
                                textAnchor="middle"
                                fontSize={Math.max(9, Math.min(16, 60 / Math.sqrt(Math.max(entries.length, 1))))}
                                fontWeight="800"
                                fill={textColorFor(segment.color)}
                                style={{ letterSpacing: "0.01em", pointerEvents: "none" }}
                              >
                                {truncateLabel(segment.label, Math.max(8, Math.floor(32 - entries.length / 2)))}
                              </text>
                            </g>
                          </g>
                        ))}
                    </g>
                    <circle cx="200" cy="200" r="48" fill="white" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="200" cy="200" r="36" fill="#f8fafc" />
                    <text x="200" y="195" textAnchor="middle" fontSize="13" fontWeight="900" fill="#0f172a">
                      {entries.length}
                    </text>
                    <text x="200" y="211" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
                      OPTIONS
                    </text>
                  </svg>
                </div>
              ) : (
                <div className="flex aspect-square w-full max-w-[520px] flex-col items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                    <Disc3 className="h-8 w-8" />
                  </span>
                  <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">Your wheel is empty</h3>
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Add your own options, paste a list, or load demo data to try the spinner. Nothing is pre-filled.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <ActionButton icon={Plus} variant="primary" tone="indigo" onClick={() => addEntry("")}>
                      Add option
                    </ActionButton>
                    <ActionButton icon={Sparkles} onClick={loadDemo}>
                      Load demo data
                    </ActionButton>
                  </div>
                </div>
              )}

              <div className="flex w-full flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={spin}
                  disabled={!hasEntries || isSpinning}
                  className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-3 text-base font-black text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 dark:focus-visible:ring-offset-slate-900"
                >
                  <Play className={`h-4 w-4 ${isSpinning ? "animate-pulse" : ""}`} />
                  {isSpinning ? "Spinning…" : "Spin the wheel"}
                </button>
                <ActionButton icon={Maximize2} onClick={toggleFullscreen} aria-label="Toggle fullscreen wheel">
                  {isFullscreen ? "Exit full screen" : "Full screen"}
                </ActionButton>
                <ActionButton
                  icon={settings.sound ? Volume2 : VolumeX}
                  onClick={() => setSettings((current) => ({ ...current, sound: !current.sound }))}
                  aria-label={settings.sound ? "Mute sound" : "Enable sound"}
                >
                  {settings.sound ? "Sound on" : "Sound off"}
                </ActionButton>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {hasEntries
                  ? "Tip: the result is chosen before the animation starts, so weights are always respected."
                  : "Add at least one option to enable the spin button."}
              </p>
              <p aria-live="polite" className="sr-only">
                {winner ? `Winner: ${winner.label}` : isSpinning ? "Spinning" : ""}
              </p>
            </div>

            {winner && !isSpinning && (
              <div className="winner-pop relative mt-4 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 dark:border-emerald-900/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {settings.confetti &&
                    confetti.map((piece, index) => (
                      <span
                        key={index}
                        className="wheel-confetti-piece absolute top-1 block h-2 w-1.5 rounded-sm"
                        style={{
                          left: piece.left,
                          background: piece.color,
                          animationDelay: piece.delay,
                          transform: `rotate(${piece.rotate})`,
                        }}
                      />
                    ))}
                </div>
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                      <Trophy className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                        Winner
                      </p>
                      <p className="text-2xl font-black leading-tight text-slate-900 dark:text-white">{winner.label}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={winner.label} label="Copy result" tone="emerald" />
                    <ActionButton icon={RotateCcw} onClick={spin} disabled={isSpinning}>
                      Spin again
                    </ActionButton>
                    <ActionButton variant="ghost" onClick={() => setWinner(null)}>
                      Dismiss
                    </ActionButton>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={ListPlus}
            title="Wheel options"
            description="Every row is editable. Weight controls probability in weighted mode; colour overrides the active palette."
            tone="indigo"
            actions={
              <>
                <ActionButton icon={Plus} onClick={() => addEntry("")}>
                  Add option
                </ActionButton>
                <ActionButton icon={Sparkles} onClick={loadDemo}>
                  Demo data
                </ActionButton>
              </>
            }
          >
            {entries.length === 0 ? (
              <Callout tone="indigo" variant="tip" title="No options yet">
                Add options manually, paste a bulk list on the right, or load the demo wheel. Your data stays in this
                browser and can be exported at any time.
              </Callout>
            ) : (
              <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-800/30"
                  >
                    <input
                      type="color"
                      value={entry.color}
                      onChange={(event) => updateEntry(entry.id, { color: event.target.value })}
                      className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0.5 dark:border-slate-700"
                      aria-label={`Colour for option ${index + 1}`}
                      title="Choose option colour"
                    />
                    <input
                      value={entry.label}
                      onChange={(event) => updateEntry(entry.id, { label: event.target.value })}
                      placeholder={`Option ${index + 1}`}
                      maxLength={120}
                      className={fieldClass(false)}
                      aria-label={`Option ${index + 1} label`}
                    />
                    <div className="relative w-20 shrink-0">
                      <input
                        type="number"
                        min="0.01"
                        step="1"
                        value={entry.weight}
                        onChange={(event) =>
                          updateEntry(entry.id, {
                            weight: event.target.value === "" ? "" : Number(event.target.value),
                          })
                        }
                        onBlur={(event) =>
                          updateEntry(entry.id, { weight: Math.max(0.01, Number(event.target.value) || 1) })
                        }
                        className={`${fieldClass(false)} pr-7 text-center tabular-nums`}
                        aria-label={`Weight for ${entry.label || `option ${index + 1}`}`}
                        title="Relative weight"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        ×
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                      aria-label={`Remove ${entry.label || `option ${index + 1}`}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton icon={Palette} onClick={applyPalette} disabled={!entries.length}>
                Apply palette
              </ActionButton>
              <ActionButton icon={FileJson} onClick={exportJson} disabled={!entries.length}>
                Export JSON
              </ActionButton>
              <ActionButton icon={Download} onClick={exportCsv} disabled={!entries.length}>
                Export CSV
              </ActionButton>
              <ActionButton icon={Download} onClick={() => importRef.current?.click()}>
                Import JSON
              </ActionButton>
              <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={importJson} />
              <ActionButton variant="danger" icon={Trash2} onClick={clearAll} disabled={!entries.length}>
                Clear all
              </ActionButton>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard icon={Sparkles} title="Spin settings" description="Tune the animation and fairness model." tone="violet">
            <div className="space-y-4">
              <SliderRow
                label="Spin duration"
                value={settings.duration}
                min={2}
                max={12}
                step={1}
                onChange={(value) => setSettings((current) => ({ ...current, duration: value }))}
                format={(value) => `${value}s`}
                tone="violet"
              />
              <SliderRow
                label="Full rotations"
                value={settings.spins}
                min={2}
                max={20}
                step={1}
                onChange={(value) => setSettings((current) => ({ ...current, spins: value }))}
                format={(value) => `${value} turns`}
                tone="violet"
              />
              <Segmented
                label="Probability mode"
                value={settings.weightMode}
                onChange={(value) => setSettings((current) => ({ ...current, weightMode: value }))}
                options={[
                  { value: "weighted", label: "Weighted" },
                  { value: "equal", label: "Equal" },
                ]}
                columns={2}
                tone="violet"
              />
              <Callout tone="violet" variant="info">
                Weighted mode gives each option a chance proportional to its weight. Equal mode ignores weights for a
                fair draw.
              </Callout>

              <div>
                <span className={labelClass}>Colour palette</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {Object.entries(PALETTES).map(([key, palette]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSettings((current) => ({ ...current, palette: key }))}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-bold transition ${
                        settings.palette === key
                          ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                      }`}
                      aria-pressed={settings.palette === key}
                    >
                      <span className="flex -space-x-1">
                        {palette.colors.slice(0, 3).map((color) => (
                          <span
                            key={color}
                            className="h-3.5 w-3.5 rounded-full ring-1 ring-white dark:ring-slate-900"
                            style={{ background: color }}
                          />
                        ))}
                      </span>
                      {palette.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <ToggleRow
                  checked={settings.sound}
                  onChange={(value) => setSettings((current) => ({ ...current, sound: value }))}
                  label="Spin and win sounds"
                  description="Synthesised locally with Web Audio — no audio files are downloaded."
                  tone="violet"
                />
                <ToggleRow
                  checked={settings.confetti}
                  onChange={(value) => setSettings((current) => ({ ...current, confetti: value }))}
                  label="Confetti celebration"
                  description="Show a lightweight confetti burst when a winner is revealed."
                  tone="violet"
                />
                <ToggleRow
                  checked={settings.removeWinner}
                  onChange={(value) => setSettings((current) => ({ ...current, removeWinner: value }))}
                  label="Remove winner after spin"
                  description="Useful for elimination rounds, raffles and draft picks."
                  tone="violet"
                />
                <ToggleRow
                  checked={settings.showLabels}
                  onChange={(value) => setSettings((current) => ({ ...current, showLabels: value }))}
                  label="Show labels on wheel"
                  description="Turn off for a cleaner colour-only wheel. The winner card still shows the name."
                  tone="violet"
                />
              </div>

              <ActionButton
                icon={RotateCcw}
                onClick={() => {
                  setSettings(DEFAULT_WHEEL_SETTINGS);
                  toast.success("Spin settings reset.");
                }}
              >
                Reset settings
              </ActionButton>
            </div>
          </SectionCard>

          <SectionCard
            icon={ListPlus}
            title="Bulk editor"
            description="Paste one option per line. Add an optional weight after a pipe: Pizza | 3."
            tone="sky"
          >
            <Field label="Options" hint="Blank lines are ignored. Labels may contain commas and emoji.">
              <textarea
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                rows={6}
                placeholder={"Pizza | 1\nSushi | 2\nBurgers\nPasta | 1"}
                className={fieldClass(false)}
              />
            </Field>
            {bulkText.trim() && (
              <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {parseWheelLines(bulkText, settings.palette).length} valid line
                {parseWheelLines(bulkText, settings.palette).length === 1 ? "" : "s"} detected
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton variant="primary" tone="sky" icon={Plus} onClick={() => addBulk(false)}>
                Add to wheel
              </ActionButton>
              <ActionButton onClick={() => addBulk(true)} disabled={!bulkText.trim()}>
                Replace wheel
              </ActionButton>
              <ActionButton
                icon={Sparkles}
                onClick={() => {
                  setBulkText(DEMO_ENTRIES.map((label, index) => `${label} | ${index % 3 === 0 ? 2 : 1}`).join("\n"));
                }}
              >
                Fill demo list
              </ActionButton>
              <ActionButton variant="ghost" icon={RotateCcw} onClick={() => setBulkText("")} disabled={!bulkText}>
                Clear
              </ActionButton>
            </div>
          </SectionCard>

          <SectionCard
            icon={History}
            title="Result history"
            description="Every spin is logged locally with its weight and timestamp."
            tone="emerald"
            actions={
              <>
                <ActionButton icon={Download} onClick={exportHistory} disabled={!history.length}>
                  Export CSV
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => {
                    setHistory([]);
                    toast.success("History cleared.");
                  }}
                  disabled={!history.length}
                >
                  Clear
                </ActionButton>
              </>
            }
          >
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Spins" value={stats.spins} tone="emerald" />
              <Stat label="Unique" value={stats.unique} tone="emerald" />
              <Stat label="Top pick" value={stats.top} tone="emerald" />
            </div>
            <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No spins yet. Your results will appear here.
                </p>
              ) : (
                history.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/40"
                  >
                    <span className="truncate font-bold text-slate-800 dark:text-slate-100">{item.label}</span>
                    <span className="shrink-0 font-mono text-slate-500 dark:text-slate-400">
                      {new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              History is stored only in this browser. Export it if you need a permanent record.
            </p>
          </SectionCard>

          <Callout tone="emerald" variant="success" title="Fair by design">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Randomness comes from <code>crypto.getRandomValues</code>,
              not Math.random. Nothing is uploaded or logged on a server.
            </span>
          </Callout>
        </div>
      </div>

      <FaqAccordion items={WHEEL_FAQS} tone="indigo" />
    </div>
  );
}
