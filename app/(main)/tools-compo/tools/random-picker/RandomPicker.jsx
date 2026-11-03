"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  FileJson,
  Hash,
  History,
  Info,
  ListChecks,
  Loader2,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Users,
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
  NumberStepper,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import {
  downloadText,
  randomInt,
  sampleWithReplacement,
  sampleWithoutReplacement,
  shuffleArray,
  toCsv,
  uid,
} from "../_shared/toolkit/random";
import {
  DEFAULT_PICKER_SETTINGS,
  DEMO_ITEMS,
  PICKER_FAQS,
  PICKER_MODES,
  PICKER_STORAGE_KEY,
  buildPool,
  makeTeams,
  parsePoolLines,
} from "./pickerData";

const TOOL_META = {
  title: "Random Picker",
  link: "/tools/random-picker",
  icon: "Shuffle",
};

const MODE_META = {
  single: { label: "Pick one", icon: Target },
  multiple: { label: "Pick N", icon: ListChecks },
  shuffle: { label: "Shuffle", icon: Shuffle },
  teams: { label: "Teams", icon: Users },
  numbers: { label: "Numbers", icon: Hash },
};

const RESULT_COLORS = [
  "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-200",
  "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200",
  "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
  "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200",
  "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200",
];

const MODE_BLURB = {
  single: "Draw one winner from the list with optional weighting.",
  multiple: "Draw several winners at once, with or without repeats.",
  shuffle: "Randomly reorder the entire list and copy the new sequence.",
  teams: "Split the list into balanced teams with a snake draft.",
  numbers: "Generate random whole numbers inside a range.",
};

function normalizeEntry(entry) {
  return {
    id: entry?.id || uid("item"),
    label: String(entry?.label ?? "").slice(0, 160),
    weight: Math.max(0.01, Number(entry?.weight) || 1),
  };
}

export default function RandomPicker() {
  const { addRecentTool } = useRecentTools();
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_PICKER_SETTINGS);
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const [bulkText, setBulkText] = useState("");
  const [results, setResults] = useState([]);
  const [groups, setGroups] = useState([]);
  const [revealing, setRevealing] = useState(false);
  const [reel, setReel] = useState("");
  const [lastMode, setLastMode] = useState("single");

  const revealTimer = useRef(null);
  const revealInterval = useRef(null);
  const audioRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(PICKER_STORAGE_KEY) : null;
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved.entries)) setEntries(saved.entries.map(normalizeEntry));
          if (saved.settings) setSettings({ ...DEFAULT_PICKER_SETTINGS, ...saved.settings });
          if (Array.isArray(saved.history)) setHistory(saved.history.slice(0, 50));
        }
      } catch {
        // Ignore corrupt local data and start empty.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        PICKER_STORAGE_KEY,
        JSON.stringify({ entries, settings, history: history.slice(0, 50) }),
      );
    } catch {
      // Private windows may block storage; the picker still works.
    }
  }, [entries, settings, history, hydrated]);

  useEffect(
    () => () => {
      window.clearTimeout(revealTimer.current);
      window.clearInterval(revealInterval.current);
      if (audioRef.current) {
        audioRef.current.close().catch(() => {});
        audioRef.current = null;
      }
    },
    [],
  );

  const pool = useMemo(() => buildPool(entries, settings.ignoreDuplicates), [entries, settings.ignoreDuplicates]);
  const poolCount = pool.length;

  const stats = useMemo(() => {
    const all = history.flatMap((item) => item.results || []);
    return {
      sessions: history.length,
      picks: all.length,
      unique: new Set(all).size,
      last: history[0] ? MODE_META[history[0].mode]?.label || history[0].mode : "—",
    };
  }, [history]);

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

  const playWin = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      window.setTimeout(() => playTone(frequency, 0.25, "triangle", 0.05), index * 95);
    });
  }, [playTone]);

  const stopReveal = useCallback(() => {
    window.clearTimeout(revealTimer.current);
    window.clearInterval(revealInterval.current);
    revealTimer.current = null;
    revealInterval.current = null;
  }, []);

  const addItem = (label = "") => {
    setEntries((current) => [...current, { id: uid("item"), label, weight: 1 }]);
  };

  const updateItem = (id, patch) => {
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const removeItem = (id) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const loadDemo = () => {
    setEntries(
      DEMO_ITEMS.map((label) => ({
        id: uid("item"),
        label,
        weight: 1,
      })),
    );
    toast.success("Demo list loaded. Edit it or clear it anytime.");
  };

  const clearPool = () => {
    if (!entries.length) return;
    if (!window.confirm("Remove every item from the pool? This cannot be undone.")) return;
    setEntries([]);
    setResults([]);
    setGroups([]);
    toast.success("Pool cleared.");
  };

  const addBulk = (replace = false) => {
    const parsed = parsePoolLines(bulkText);
    if (!parsed.length) {
      toast.error("Add at least one line with a name or item.");
      return;
    }
    const next = parsed.map((entry) => ({ id: uid("item"), label: entry.label, weight: entry.weight }));
    setEntries((current) => (replace ? next : [...current, ...next]));
    setBulkText("");
    toast.success(`${next.length} item${next.length === 1 ? "" : "s"} ${replace ? "replaced" : "added"}.`);
  };

  const exportPoolJson = () => {
    if (!entries.length) {
      toast.error("Add items before exporting.");
      return;
    }
    downloadText(
      JSON.stringify({ name: "ToolsTrek random picker", settings, entries }, null, 2),
      "toolstrek-random-picker.json",
      "application/json",
    );
  };

  const exportPoolCsv = () => {
    if (!entries.length) {
      toast.error("Add items before exporting.");
      return;
    }
    downloadText(
      toCsv([["Item", "Weight"], ...entries.map((entry) => [entry.label, entry.weight])]),
      "toolstrek-random-picker.csv",
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
      if (!Array.isArray(list) || !list.length) throw new Error("No items");
      setEntries(list.map(normalizeEntry));
      if (parsed.settings) setSettings({ ...DEFAULT_PICKER_SETTINGS, ...parsed.settings });
      setResults([]);
      setGroups([]);
      toast.success(`Imported ${list.length} item${list.length === 1 ? "" : "s"}.`);
    } catch {
      toast.error("That file is not a valid ToolsTrek picker JSON export.");
    }
  };

  const resultText = useMemo(() => {
    if (groups.length) {
      return groups.map((group) => `${group.name}: ${group.items.join(", ")}`).join("\n");
    }
    return results.join("\n");
  }, [groups, results]);

  const commitResult = useCallback(
    (nextResults, nextGroups = []) => {
      setResults(nextResults);
      setGroups(nextGroups);
      setRevealing(false);
      setReel("");
      stopReveal();
      playWin();
      setHistory((current) =>
        [
          {
            id: uid("pick"),
            mode: settings.mode,
            results: nextResults,
            groups: nextGroups,
            at: Date.now(),
          },
          ...current,
        ].slice(0, 50),
      );
    },
    [settings.mode, stopReveal, playWin],
  );

  const runPick = useCallback(() => {
    stopReveal();
    setResults([]);
    setGroups([]);
    setReel("");

    let nextResults = [];
    let nextGroups = [];

    if (settings.mode === "numbers") {
      const min = Math.min(Number(settings.rangeMin) || 0, Number(settings.rangeMax) || 0);
      const max = Math.max(Number(settings.rangeMin) || 0, Number(settings.rangeMax) || 0);
      const count = Math.max(1, Number(settings.rangeCount) || 1);
      const rangeSize = max - min + 1;
      if (settings.rangeUnique && count > rangeSize) {
        toast.error(`A unique range of ${min}–${max} only contains ${rangeSize} number${rangeSize === 1 ? "" : "s"}.`);
        return;
      }
      if (settings.rangeUnique) {
        const picked = new Set();
        while (picked.size < count) picked.add(randomInt(min, max));
        nextResults = [...picked].map(String);
      } else {
        nextResults = Array.from({ length: count }, () => String(randomInt(min, max)));
      }
      if (settings.sortResults) {
        nextResults.sort((a, b) => Number(a) - Number(b));
      }
    } else {
      if (!poolCount) {
        toast.error("Add at least one item to the pool first.");
        return;
      }
      const labels = pool.map((entry) => entry.label);
      const weights = pool.map((entry) => (settings.weighted ? entry.weight : 1));

      if (settings.mode === "single") {
        nextResults = sampleWithoutReplacement(labels, 1, weights);
      } else if (settings.mode === "multiple") {
        const count = Math.max(1, Number(settings.pickCount) || 1);
        if (!settings.allowDuplicates && count > poolCount) {
          toast.error(`Choose ${poolCount} or fewer winners, or enable Allow repeats.`);
          return;
        }
        nextResults = settings.allowDuplicates
          ? sampleWithReplacement(labels, count, weights)
          : sampleWithoutReplacement(labels, count, weights);
        if (settings.sortResults) nextResults.sort((a, b) => a.localeCompare(b));
      } else if (settings.mode === "shuffle") {
        nextResults = shuffleArray(labels);
      } else if (settings.mode === "teams") {
        const teamCount = Math.max(2, Number(settings.teamsCount) || 2);
        if (teamCount > poolCount) {
          toast.error(`Add at least ${teamCount} items or reduce the number of teams.`);
          return;
        }
        nextGroups = makeTeams(shuffleArray(labels), teamCount);
        nextResults = nextGroups.flatMap((group) => group.items);
      }
    }

    if (!nextResults.length) return;

    setLastMode(settings.mode);
    setRevealing(true);

    const duration = Math.max(0, Number(settings.duration) || 0);
    const reelSource =
      settings.mode === "numbers"
        ? nextResults
        : settings.mode === "teams"
          ? ["Building teams…", "Shuffling…", "Balancing…"]
          : pool.map((entry) => entry.label);

    if (duration > 0) {
      let frame = 0;
      revealInterval.current = window.setInterval(() => {
        const poolLength = reelSource.length || 1;
        setReel(reelSource[frame % poolLength]);
        frame += 1;
        playTone(620 + (frame % 5) * 40, 0.02, "square", 0.01);
      }, 65);
    }

    revealTimer.current = window.setTimeout(
      () => commitResult(nextResults, nextGroups),
      Math.max(160, duration),
    );
  }, [commitResult, pool, poolCount, settings, stopReveal, playTone]);

  const clearResult = () => {
    stopReveal();
    setResults([]);
    setGroups([]);
    setRevealing(false);
    setReel("");
  };

  const exportResults = () => {
    if (!resultText) {
      toast.error("Run a draw first.");
      return;
    }
    downloadText(resultText, "toolstrek-random-result.txt");
  };

  const exportResultsCsv = () => {
    if (!resultText) {
      toast.error("Run a draw first.");
      return;
    }
    const rows = groups.length
      ? [["Team", "Item"], ...groups.flatMap((group) => group.items.map((item) => [group.name, item]))]
      : [["Result", "Position"], ...results.map((item, index) => [item, index + 1])];
    downloadText(toCsv(rows), "toolstrek-random-result.csv", "text/csv;charset=utf-8");
  };

  const exportHistory = () => {
    if (!history.length) {
      toast.error("Run a draw first to build a history.");
      return;
    }
    downloadText(
      toCsv([
        ["Mode", "Results", "Timestamp"],
        ...history.map((item) => [
          MODE_META[item.mode]?.label || item.mode,
          item.groups?.length
            ? item.groups.map((group) => `${group.name}: ${group.items.join(" / ")}`).join(" | ")
            : item.results.join(" / "),
          new Date(item.at).toISOString(),
        ]),
      ]),
      "toolstrek-random-history.csv",
      "text/csv;charset=utf-8",
    );
  };

  const isListMode = settings.mode !== "numbers";
  const countLabel = results.length || groups.length;

  return (
    <div className="tool-page-content space-y-5">
      <Hero
        eyebrow="Fair draw studio"
        icon={Shuffle}
        title="Random Picker"
        description="Pick one winner, draw several names, shuffle a list, split people into balanced teams, or generate a random number range. Your pool starts empty, every option is editable, and all randomness comes from the Web Crypto API."
        badges={["Crypto-secure draws", "Weighted or equal", "Team builder", "Local only"]}
        tone="sky"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-5">
          <SectionCard
            icon={ListChecks}
            title="Your pool"
            description="Add names, tickets, tasks or anything else. Blank rows are ignored and duplicates can be filtered in the rules."
            tone="sky"
            actions={
              <>
                <Chip tone="sky">{entries.length} items</Chip>
                <Chip tone="emerald">{poolCount} eligible</Chip>
              </>
            }
          >
            {entries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center dark:border-slate-700 dark:bg-slate-800/20">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
                  <ListChecks className="h-7 w-7" />
                </span>
                <h3 className="mt-3 text-base font-black text-slate-900 dark:text-white">Your pool is empty</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Add your first item, paste a bulk list, or load demo data. Nothing is pre-filled and nothing leaves
                  your browser.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <ActionButton icon={Plus} variant="primary" tone="sky" onClick={() => addItem("")}>
                    Add item
                  </ActionButton>
                  <ActionButton icon={Sparkles} onClick={loadDemo}>
                    Load demo data
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-800/30"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-black text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <input
                      value={entry.label}
                      onChange={(event) => updateItem(entry.id, { label: event.target.value })}
                      placeholder={`Item ${index + 1}`}
                      maxLength={160}
                      className={fieldClass(false)}
                      aria-label={`Item ${index + 1}`}
                    />
                    <div className="relative w-20 shrink-0">
                      <input
                        type="number"
                        min="0.01"
                        step="1"
                        value={entry.weight}
                        onChange={(event) =>
                          updateItem(entry.id, {
                            weight: event.target.value === "" ? "" : Number(event.target.value),
                          })
                        }
                        onBlur={(event) => updateItem(entry.id, { weight: Math.max(0.01, Number(event.target.value) || 1) })}
                        className={`${fieldClass(false)} pr-7 text-center tabular-nums ${
                          settings.weighted ? "" : "opacity-60"
                        }`}
                        aria-label={`Weight for item ${index + 1}`}
                        title={settings.weighted ? "Relative weight" : "Enable weighted mode to use weights"}
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        ×
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(entry.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                      aria-label={`Remove item ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton icon={Plus} onClick={() => addItem("")}>
                Add item
              </ActionButton>
              <ActionButton icon={Sparkles} onClick={loadDemo}>
                Demo data
              </ActionButton>
              <ActionButton icon={FileJson} onClick={exportPoolJson} disabled={!entries.length}>
                Export JSON
              </ActionButton>
              <ActionButton icon={Download} onClick={exportPoolCsv} disabled={!entries.length}>
                Export CSV
              </ActionButton>
              <ActionButton icon={Download} onClick={() => importRef.current?.click()}>
                Import JSON
              </ActionButton>
              <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={importJson} />
              <ActionButton variant="danger" icon={Trash2} onClick={clearPool} disabled={!entries.length}>
                Clear pool
              </ActionButton>
            </div>
          </SectionCard>

          <SectionCard
            icon={Plus}
            title="Bulk editor"
            description="Paste one item per line. Add an optional weight after a pipe: Ava | 2."
            tone="violet"
          >
            <Field label="Items" hint="Commas and emoji are allowed. Blank lines are ignored.">
              <textarea
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                rows={6}
                placeholder={"Ava | 1\nBen | 2\nChloe\nDiego | 1"}
                className={fieldClass(false)}
              />
            </Field>
            {bulkText.trim() && (
              <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {parsePoolLines(bulkText).length} valid item{parsePoolLines(bulkText).length === 1 ? "" : "s"} detected
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton variant="primary" tone="violet" icon={Plus} onClick={() => addBulk(false)}>
                Add to pool
              </ActionButton>
              <ActionButton onClick={() => addBulk(true)} disabled={!bulkText.trim()}>
                Replace pool
              </ActionButton>
              <ActionButton
                icon={Sparkles}
                onClick={() => setBulkText(DEMO_ITEMS.map((item, index) => `${item} | ${index % 4 === 0 ? 2 : 1}`).join("\n"))}
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
            title="Draw history"
            description="Each session is saved locally with its mode and results."
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
              <Stat label="Sessions" value={stats.sessions} tone="emerald" />
              <Stat label="Results" value={stats.picks} tone="emerald" />
              <Stat label="Unique" value={stats.unique} tone="emerald" />
            </div>
            {history.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No draws yet. Your results will be logged here.
              </p>
            ) : (
              <div className="mt-3 max-h-60 space-y-1.5 overflow-y-auto pr-1">
                {history.slice(0, 15).map((item) => (
                  <div key={item.id} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {MODE_META[item.mode]?.label || item.mode}
                      </span>
                      <span className="shrink-0 font-mono text-sm text-slate-500 dark:text-slate-400">
                        {new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                      {item.groups?.length
                        ? item.groups.map((group) => `${group.name} (${group.items.length})`).join(" · ")
                        : item.results.join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard icon={Sparkles} title="Picker mode" description={MODE_BLURB[settings.mode]} tone="sky">
            <Segmented
              label="What do you want to do?"
              value={settings.mode}
              onChange={(value) => {
                setSettings((current) => ({ ...current, mode: value }));
                clearResult();
              }}
              options={PICKER_MODES.map((mode) => ({
                value: mode.value,
                label: mode.label,
                icon: React.createElement(MODE_META[mode.value].icon, { className: "h-3.5 w-3.5" }),
              }))}
              columns={3}
              tone="sky"
            />

            <div className="mt-4 space-y-4">
              {settings.mode === "multiple" && (
                <>
                  <NumberStepper
                    label="Winners to draw"
                    value={settings.pickCount}
                    min={1}
                    max={Math.max(1, poolCount || 50)}
                    onChange={(value) => setSettings((current) => ({ ...current, pickCount: value }))}
                    suffix="items"
                  />
                  <ToggleRow
                    checked={settings.allowDuplicates}
                    onChange={(value) => setSettings((current) => ({ ...current, allowDuplicates: value }))}
                    label="Allow repeats"
                    description="Draw with replacement so the same item can win twice."
                    tone="sky"
                  />
                </>
              )}

              {settings.mode === "teams" && (
                <NumberStepper
                  label="Number of teams"
                  value={settings.teamsCount}
                  min={2}
                  max={Math.max(2, Math.min(12, poolCount || 12))}
                  onChange={(value) => setSettings((current) => ({ ...current, teamsCount: value }))}
                  suffix="teams"
                />
              )}

              {settings.mode === "numbers" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Minimum">
                    <input
                      type="number"
                      value={settings.rangeMin}
                      onChange={(event) => setSettings((current) => ({ ...current, rangeMin: event.target.value }))}
                      className={fieldClass(false)}
                    />
                  </Field>
                  <Field label="Maximum">
                    <input
                      type="number"
                      value={settings.rangeMax}
                      onChange={(event) => setSettings((current) => ({ ...current, rangeMax: event.target.value }))}
                      className={fieldClass(false)}
                    />
                  </Field>
                  <Field label="How many numbers" className="col-span-2">
                    <NumberStepper
                      value={settings.rangeCount}
                      min={1}
                      max={1000}
                      onChange={(value) => setSettings((current) => ({ ...current, rangeCount: value }))}
                      suffix="numbers"
                    />
                  </Field>
                  <div className="col-span-2">
                    <ToggleRow
                      checked={settings.rangeUnique}
                      onChange={(value) => setSettings((current) => ({ ...current, rangeUnique: value }))}
                      label="Unique numbers only"
                      description="Never repeat the same number inside one draw."
                      tone="sky"
                    />
                  </div>
                </div>
              )}

              {isListMode && (
                <div className="space-y-2">
                  <ToggleRow
                    checked={settings.ignoreDuplicates}
                    onChange={(value) => setSettings((current) => ({ ...current, ignoreDuplicates: value }))}
                    label="Ignore duplicate labels"
                    description="Case-insensitive duplicate names are removed from the eligible pool."
                    tone="sky"
                  />
                  {(settings.mode === "single" || settings.mode === "multiple") && (
                    <ToggleRow
                      checked={settings.weighted}
                      onChange={(value) => setSettings((current) => ({ ...current, weighted: value }))}
                      label="Weighted draw"
                      description="Use each item's weight as its relative chance instead of an equal chance."
                      tone="sky"
                    />
                  )}
                  {(settings.mode === "multiple" || settings.mode === "numbers") && (
                    <ToggleRow
                      checked={settings.sortResults}
                      onChange={(value) => setSettings((current) => ({ ...current, sortResults: value }))}
                      label="Sort results"
                      description="Alphabetical for names, ascending for numbers."
                      tone="sky"
                    />
                  )}
                </div>
              )}

              <SliderRow
                label="Reveal animation"
                value={settings.duration}
                min={0}
                max={3000}
                step={100}
                onChange={(value) => setSettings((current) => ({ ...current, duration: value }))}
                format={(value) => (value === 0 ? "Instant" : `${(value / 1000).toFixed(1)}s`)}
                tone="sky"
                hint="Set to Instant for the fastest possible workflow."
              />
              <ToggleRow
                checked={settings.sound}
                onChange={(value) => setSettings((current) => ({ ...current, sound: value }))}
                label="Sound effects"
                description="Subtle locally synthesised ticks and a reveal chime."
                tone="sky"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Trophy}
            title="Result"
            description={revealing ? "Drawing securely…" : resultText ? "Copy, download or clear this draw." : "Run a draw to see the result here."}
            tone="emerald"
            actions={
              <>
                <CopyButton text={resultText} label="Copy" tone="emerald" disabled={!resultText || revealing} />
                <ActionButton icon={Download} onClick={exportResults} disabled={!resultText || revealing}>
                  TXT
                </ActionButton>
                <ActionButton icon={Download} onClick={exportResultsCsv} disabled={!resultText || revealing}>
                  CSV
                </ActionButton>
                <ActionButton variant="ghost" icon={RotateCcw} onClick={clearResult} disabled={!resultText && !revealing}>
                  Clear
                </ActionButton>
              </>
            }
          >
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-sky-950/20">
              {revealing ? (
                <div className="flex min-h-[160px] flex-col items-center justify-center text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-300" />
                  <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{reel || "Drawing…"}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The result is already locked in.</p>
                </div>
              ) : groups.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {groups.map((group, index) => (
                    <div
                      key={group.id}
                      className={`rounded-xl border p-3 ${RESULT_COLORS[index % RESULT_COLORS.length]}`}
                    >
                      <p className="text-sm font-black uppercase tracking-wide">{group.name}</p>
                      <ol className="mt-2 space-y-1">
                        {group.items.map((item, itemIndex) => (
                          <li key={`${item}-${itemIndex}`} className="text-sm font-semibold">
                            {itemIndex + 1}. {item}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              ) : results.length === 1 ? (
                <div className="flex min-h-[160px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <Trophy className="h-7 w-7" />
                  </span>
                  <p className="mt-3 text-sm font-bold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">
                    {settings.mode === "shuffle" ? "Shuffled list" : "Result"}
                  </p>
                  <p className="mt-1 break-words text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl">
                    {results[0]}
                  </p>
                </div>
              ) : results.length > 1 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {results.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${RESULT_COLORS[index % RESULT_COLORS.length]}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-black dark:bg-black/20">
                        {index + 1}
                      </span>
                      <span className="min-w-0 break-words text-sm font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[160px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <Target className="h-7 w-7" />
                  </span>
                  <p className="mt-3 text-base font-bold text-slate-700 dark:text-slate-200">No result yet</p>
                  <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                    {poolCount ? "Ready when you are. Press the draw button below." : "Add items to the pool first."}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={runPick}
              disabled={revealing || (settings.mode === "numbers" ? false : poolCount === 0)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 px-6 py-3 text-base font-black text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 dark:focus-visible:ring-offset-slate-900"
            >
              {revealing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
              {revealing ? "Drawing…" : settings.mode === "shuffle" ? "Shuffle the list" : "Draw now"}
            </button>
            <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              {settings.mode === "numbers"
                ? `Range ${Math.min(Number(settings.rangeMin) || 0, Number(settings.rangeMax) || 0)} – ${Math.max(Number(settings.rangeMin) || 0, Number(settings.rangeMax) || 0)}`
                : `${poolCount} eligible item${poolCount === 1 ? "" : "s"}${settings.weighted && (settings.mode === "single" || settings.mode === "multiple") ? " · weighted" : " · equal chance"}`}
            </p>
            <p aria-live="polite" className="sr-only">
              {revealing ? "Drawing" : resultText ? `Result: ${resultText}` : ""}
            </p>
          </SectionCard>

          <Callout tone="emerald" variant="success" title="Secure and private">
            <span className="inline-flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Every draw uses <code>crypto.getRandomValues</code>. Your pool, results and history stay in this browser
              and can be exported or cleared at any time.
            </span>
          </Callout>

          <Callout tone="sky" variant="info" title="Good to know">
            <span className="inline-flex items-start gap-1.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Pick N draws without replacement by default, so each winner is unique. Teams use a snake draft to keep
              group sizes balanced.
            </span>
          </Callout>
        </div>
      </div>

      <FaqAccordion items={PICKER_FAQS} tone="sky" />
    </div>
  );
}
