"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Captions,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileJson,
  FileText,
  Film,
  Gauge,
  Info,
  Play,
  Plus,
  Replace,
  RotateCcw,
  Sparkles,
  Timer,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  FaqAccordion,
  Field,
  Hero,
  SectionCard,
  Stat,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import {
  copyText,
  downloadText,
  parseJsonFile,
  readStored,
  toNumber,
  writeStored,
} from "../_shared/toolkit/toolUtils";
import {
  FPS_OPTIONS,
  SUBTITLE_FAQS,
  SUBTITLE_STORAGE_KEY,
  convertFps,
  createDemoCues,
  createEmptySubtitleState,
  cueStats,
  formatDuration,
  formatTimestamp,
  makeCue,
  parseSubtitles,
  parseTimestamp,
  replaceInCues,
  scaleCues,
  serializeCsv,
  serializeSrt,
  serializeTranscript,
  serializeVtt,
  shiftCues,
  subtitleSummary,
  validateCues,
} from "./subtitleData";

const TOOL_META = { title: "Subtitle (SRT/VTT) Editor & Sync", link: "/tools/subtitle-editor", icon: "Captions" };
const TONE = "rose";

const DEFAULT_STATE = {
  ...createEmptySubtitleState(),
  syncSeconds: "",
  scaleFactor: "",
  fromFps: "24",
  toFps: "25",
  find: "",
  replace: "",
  matchCase: false,
  maxCps: "25",
  maxLine: "42",
};

function TimeField({ label, value, onCommit }) {
  return (
    <Field label={label}>
      <input
        key={`${label}-${value}`}
        type="text"
        defaultValue={formatTimestamp(value)}
        onBlur={(event) => onCommit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        spellCheck={false}
        className={`${fieldClass(false, TONE)} font-mono text-[13px]`}
      />
    </Field>
  );
}

export default function SubtitleEditor() {
  const { addRecentTool } = useRecentTools();
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [raw, setRaw] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [jsonName, setJsonName] = useState("");

  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const videoInputRef = useRef(null);
  const jsonRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      const saved = readStored(SUBTITLE_STORAGE_KEY, null);
      if (saved && typeof saved === "object") {
        setState((current) => ({
          ...current,
          ...saved,
          cues: Array.isArray(saved.cues)
            ? saved.cues
                .filter((cue) => cue && typeof cue === "object")
                .map((cue) => ({
                  id: cue.id || `cue-${Math.random().toString(36).slice(2)}`,
                  start: Number(cue.start) || 0,
                  end: Number(cue.end) || 0,
                  text: String(cue.text || ""),
                }))
            : [],
        }));
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => writeStored(SUBTITLE_STORAGE_KEY, state), 500);
    return () => window.clearTimeout(timer);
  }, [state, hydrated]);

  useEffect(
    () => () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    },
    [videoUrl],
  );

  const update = (patch) => setState((current) => ({ ...current, ...patch }));
  const cues = state.cues;

  const summary = useMemo(() => subtitleSummary(cues), [cues]);
  const issues = useMemo(
    () =>
      validateCues(cues, {
        maxCps: toNumber(state.maxCps, 25) || 25,
        maxLine: toNumber(state.maxLine, 42) || 42,
      }),
    [cues, state.maxCps, state.maxLine],
  );
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  const updateCue = (id, patch) =>
    setState((current) => ({
      ...current,
      cues: current.cues.map((cue) => (cue.id === id ? { ...cue, ...patch } : cue)),
    }));

  const removeCue = (id) =>
    setState((current) => ({ ...current, cues: current.cues.filter((cue) => cue.id !== id) }));

  const addCue = () => {
    const last = cues[cues.length - 1];
    const start = last ? last.end + 0.4 : 0;
    const cue = makeCue(start, start + 2, "");
    setState((current) => ({ ...current, cues: [...current.cues, cue] }));
    window.setTimeout(() => {
      const node = document.getElementById(`cue-text-${cue.id}`);
      node?.focus();
    }, 0);
  };

  const duplicateCue = (id) => {
    const index = cues.findIndex((cue) => cue.id === id);
    if (index === -1) return;
    const source = cues[index];
    const duration = Math.max(0.3, source.end - source.start);
    const copy = makeCue(source.end + 0.4, source.end + 0.4 + duration, source.text);
    const next = [...cues];
    next.splice(index + 1, 0, copy);
    setState((current) => ({ ...current, cues: next }));
    toast.success("Cue duplicated");
  };

  const mergeWithNext = (id) => {
    const index = cues.findIndex((cue) => cue.id === id);
    if (index === -1 || index >= cues.length - 1) {
      toast.error("There is no next cue to merge.");
      return;
    }
    const current = cues[index];
    const nextCue = cues[index + 1];
    const merged = {
      ...current,
      end: Math.max(current.end, nextCue.end),
      text: [current.text.trim(), nextCue.text.trim()].filter(Boolean).join("\n"),
    };
    const next = cues.filter((_, cueIndex) => cueIndex !== index + 1);
    next[index] = merged;
    setState((currentState) => ({ ...currentState, cues: next }));
    toast.success("Cue merged with the next one");
  };

  const handleImportFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const parsed = parseSubtitles(text);
      if (!parsed.length) {
        toast.error("No subtitle cues were found in that file.");
        return;
      }
      setState((current) => ({ ...current, cues: parsed, sourceName: file.name }));
      setRaw(text);
      toast.success(`${parsed.length} cues imported from ${file.name}`);
    };
    reader.onerror = () => toast.error("Could not read that subtitle file.");
    reader.readAsText(file);
  };

  const parseRaw = () => {
    const parsed = parseSubtitles(raw);
    if (!parsed.length) {
      toast.error("No cues found. Check that the text contains a timing line with -->.");
      return;
    }
    setState((current) => ({ ...current, cues: parsed, sourceName: "Pasted subtitles" }));
    toast.success(`${parsed.length} cues parsed`);
  };

  const loadDemo = () => {
    setState((current) => ({ ...current, cues: createDemoCues(), sourceName: "Demo subtitles" }));
    setRaw("");
    toast.success("Demo subtitles loaded — replace them with your own file");
  };

  const clearAll = () => {
    setState({ ...DEFAULT_STATE, cues: [] });
    setRaw("");
    setVideoName("");
    setCurrentTime(0);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
    toast.success("Editor cleared");
  };

  const handleVideoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Choose an MP4, WebM or other video file.");
      return;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoName(file.name);
    setCurrentTime(0);
    toast.success("Video loaded locally for preview");
  };

  const seekTo = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, seconds);
    const play = videoRef.current.play();
    if (play?.catch) play.catch(() => {});
  };

  const activeCue = cues.find((cue) => currentTime >= cue.start && currentTime <= cue.end);

  const applyShift = () => {
    const seconds = toNumber(state.syncSeconds, null);
    if (!Number.isFinite(seconds) || seconds === 0) {
      toast.error("Enter a non-zero number of seconds to shift.");
      return;
    }
    setState((current) => ({ ...current, cues: shiftCues(current.cues, seconds) }));
    toast.success(`All cues shifted by ${seconds > 0 ? "+" : ""}${seconds}s`);
  };

  const applyScale = () => {
    const factor = toNumber(state.scaleFactor, null);
    if (!Number.isFinite(factor) || factor <= 0) {
      toast.error("Enter a positive scale factor.");
      return;
    }
    setState((current) => ({ ...current, cues: scaleCues(current.cues, factor, current.cues[0]?.start || 0) }));
    toast.success(`Timeline scaled by ${factor}×`);
  };

  const applyFps = () => {
    const from = toNumber(state.fromFps, null);
    const to = toNumber(state.toFps, null);
    if (!from || !to || from === to) {
      toast.error("Choose two different frame rates.");
      return;
    }
    setState((current) => ({ ...current, cues: convertFps(current.cues, from, to) }));
    toast.success(`Retimed from ${from} to ${to} fps`);
  };

  const applyReplace = () => {
    if (!state.find) {
      toast.error("Enter the text you want to find.");
      return;
    }
    const result = replaceInCues(cues, state.find, state.replace, state.matchCase);
    if (!result.count) {
      toast.error("That text was not found in any cue.");
      return;
    }
    setState((current) => ({ ...current, cues: result.cues }));
    toast.success(`Replaced ${result.count} occurrence${result.count === 1 ? "" : "s"}`);
  };

  const downloadSubtitle = (format) => {
    if (!cues.length) {
      toast.error("There are no cues to export.");
      return;
    }
    const base = (state.sourceName || "toolstrek-subtitles").replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-");
    if (format === "srt") {
      downloadText(serializeSrt(cues), `${base}.srt`);
    } else if (format === "vtt") {
      downloadText(serializeVtt(cues), `${base}.vtt`, "text/vtt;charset=utf-8");
    } else if (format === "csv") {
      downloadText(serializeCsv(cues), `${base}.csv`, "text/csv;charset=utf-8");
    } else {
      downloadText(serializeTranscript(cues), `${base}.txt`);
    }
    toast.success(`${format.toUpperCase()} exported`);
  };

  const copySrt = async () => {
    if (!cues.length) {
      toast.error("There are no cues to copy.");
      return;
    }
    const ok = await copyText(serializeSrt(cues));
    if (ok) toast.success("SRT copied to the clipboard");
    else toast.error("Could not copy the subtitles");
  };

  const exportJson = () => {
    if (!cues.length) {
      toast.error("There are no cues to export.");
      return;
    }
    downloadText(
      JSON.stringify(
        { app: "toolstrek-subtitle-editor", version: 1, sourceName: state.sourceName, cues: state.cues },
        null,
        2,
      ),
      "toolstrek-subtitles.json",
      "application/json",
    );
    toast.success("Project JSON downloaded");
  };

  const importJson = async (file) => {
    const parsed = await parseJsonFile(file);
    const imported = Array.isArray(parsed) ? parsed : parsed?.cues;
    if (!Array.isArray(imported) || !imported.length) {
      toast.error("That file does not contain subtitle cues.");
      return;
    }
    const normalised = imported.map((cue) =>
      makeCue(
        Number(cue.start) || 0,
        Number(cue.end) || 0,
        String(cue.text || ""),
      ),
    );
    setState((current) => ({ ...current, cues: normalised, sourceName: parsed?.sourceName || file.name }));
    setJsonName(file.name);
    toast.success(`${normalised.length} cues imported from JSON`);
  };

  const fixShortCue = (cue, index) => {
    updateCue(cue.id, { end: cue.start + 1.2 });
    toast.success(`Cue ${index + 1} extended to 1.2 s`);
  };

  return (
    <div className="subtitle-tool space-y-6 pb-10">
      <style>{`.subtitle-tool .text-xs { font-size: 13px !important; }`}</style>

      <Hero
        tone={TONE}
        eyebrow="Timed text studio"
        icon={Captions}
        title="Subtitle (SRT/VTT) Editor & Sync"
        description="Import, edit, retime and validate SRT or VTT subtitles in your browser. Shift or scale the whole timeline, fix frame-rate drift, replace text across cues, preview against a local video, and export four formats."
        badges={["Blank by default", "SRT & VTT", "Frame-rate sync", "Optional video preview"]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <SectionCard
            icon={Upload}
            tone={TONE}
            title="1 · Import subtitles"
            description="Load an SRT or VTT file, or paste the raw text. Nothing is uploaded."
            actions={<Chip tone={TONE}>{summary.count} cues</Chip>}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <ActionButton tone={TONE} variant="primary" icon={Upload} onClick={() => fileRef.current?.click()}>
                  Choose SRT / VTT file
                </ActionButton>
                <ActionButton tone={TONE} icon={Wand2} onClick={loadDemo}>
                  Load demo data
                </ActionButton>
                <ActionButton tone={TONE} icon={RotateCcw} onClick={clearAll}>
                  Clear editor
                </ActionButton>
                <ActionButton tone={TONE} icon={FileJson} onClick={() => jsonRef.current?.click()}>
                  Import JSON
                </ActionButton>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".srt,.vtt,text/plain"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleImportFile(file);
                    event.target.value = "";
                  }}
                />
                <input
                  ref={jsonRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) importJson(file);
                    event.target.value = "";
                  }}
                />
              </div>

              {state.sourceName && (
                <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                  Source: <span className="text-slate-700 dark:text-slate-200">{state.sourceName}</span>
                  {jsonName ? ` · imported from ${jsonName}` : ""}
                </p>
              )}

              <Field label="Paste subtitle text" hint="SRT or WebVTT. Cue numbers are optional; timing lines with --> are required.">
                <textarea
                  rows={6}
                  value={raw}
                  onChange={(event) => setRaw(event.target.value)}
                  placeholder={"1\n00:00:01,000 --> 00:00:04,000\nYour first subtitle line\n\n2\n00:00:04,500 --> 00:00:07,000\nAnd the next one"}
                  className={`${fieldClass(false, TONE)} font-mono text-[13px]`}
                />
              </Field>

              <div className="flex flex-wrap items-center gap-2">
                <ActionButton tone={TONE} variant="primary" icon={CheckCircle2} onClick={parseRaw} disabled={!raw.trim()}>
                  Parse text
                </ActionButton>
                <span className="text-[13px] font-medium text-slate-400">
                  Parsing replaces the current cue list — export first if you need a backup.
                </span>
              </div>

              <Callout tone={TONE} variant="tip" title="Keep a source file">
                The editor autosaves your cues in this browser, but a JSON project export is the safest backup before a
                large retime.
              </Callout>
            </div>
          </SectionCard>

          <SectionCard
            icon={Timer}
            tone={TONE}
            title="2 · Sync & bulk edits"
            description="Fix a constant offset, a growing drift, a frame-rate mismatch, or text repeated across cues."
            actions={<Chip tone={TONE}>{summary.count ? formatDuration(summary.duration) : "No cues"}</Chip>}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Shift every cue</p>
                  <p className="mb-3 text-[13px] text-slate-500 dark:text-slate-400">
                    Positive values delay the subtitles; negative values make them earlier.
                  </p>
                  <div className="flex items-end gap-2">
                    <Field label="Offset (seconds)" className="flex-1">
                      <input
                        type="number"
                        step="0.1"
                        value={state.syncSeconds}
                        onChange={(event) => update({ syncSeconds: event.target.value })}
                        placeholder="e.g. -1.5"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <ActionButton tone={TONE} icon={ArrowRightLeft} onClick={applyShift} disabled={!cues.length}>
                      Apply
                    </ActionButton>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Scale the timeline</p>
                  <p className="mb-3 text-[13px] text-slate-500 dark:text-slate-400">
                    Multiply all times around the first cue. 1.04 stretches; 0.96 compresses.
                  </p>
                  <div className="flex items-end gap-2">
                    <Field label="Factor" className="flex-1">
                      <input
                        type="number"
                        step="0.001"
                        value={state.scaleFactor}
                        onChange={(event) => update({ scaleFactor: event.target.value })}
                        placeholder="e.g. 0.96"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <ActionButton tone={TONE} icon={Gauge} onClick={applyScale} disabled={!cues.length}>
                      Apply
                    </ActionButton>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Frame-rate conversion</p>
                <p className="mb-3 text-[13px] text-slate-500 dark:text-slate-400">
                  Use when the file was authored at one frame rate and played at another. Times are scaled by
                  source ÷ target.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <Field label="Source FPS" className="flex-1">
                    <select
                      value={state.fromFps}
                      onChange={(event) => update({ fromFps: event.target.value })}
                      className={fieldClass(false, TONE)}
                    >
                      {FPS_OPTIONS.map((fps) => (
                        <option key={fps} value={String(fps)}>
                          {fps} fps
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Target FPS" className="flex-1">
                    <select
                      value={state.toFps}
                      onChange={(event) => update({ toFps: event.target.value })}
                      className={fieldClass(false, TONE)}
                    >
                      {FPS_OPTIONS.map((fps) => (
                        <option key={fps} value={String(fps)}>
                          {fps} fps
                        </option>
                      ))}
                    </select>
                  </Field>
                  <ActionButton tone={TONE} icon={Film} onClick={applyFps} disabled={!cues.length}>
                    Retime
                  </ActionButton>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Find & replace across cues</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Find">
                    <input
                      type="text"
                      value={state.find}
                      onChange={(event) => update({ find: event.target.value })}
                      placeholder="Text to find"
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                  <Field label="Replace with">
                    <input
                      type="text"
                      value={state.replace}
                      onChange={(event) => update({ replace: event.target.value })}
                      placeholder="Replacement text"
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ActionButton tone={TONE} icon={Replace} onClick={applyReplace} disabled={!cues.length || !state.find}>
                    Replace all
                  </ActionButton>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={state.matchCase}
                      onChange={(event) => update({ matchCase: event.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 accent-rose-600"
                    />
                    Match case
                  </label>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={Captions}
            tone={TONE}
            title="3 · Cue editor"
            description="Edit timing and text. Changes are saved locally as you type."
            actions={
              <div className="flex flex-wrap gap-2">
                <ActionButton tone={TONE} variant="primary" icon={Plus} onClick={addCue}>
                  Add cue
                </ActionButton>
              </div>
            }
          >
            {cues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center dark:border-slate-700 dark:bg-slate-800/30">
                <Captions className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No cues yet</p>
                <p className="mx-auto mt-1 max-w-md text-[13px] text-slate-500 dark:text-slate-400">
                  Paste an SRT or VTT file above, import one from your device, add a blank cue, or load the demo to see
                  every editing tool in action.
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <ActionButton tone={TONE} icon={Plus} onClick={addCue}>
                    Add blank cue
                  </ActionButton>
                  <ActionButton tone={TONE} icon={Wand2} onClick={loadDemo}>
                    Load demo
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cues.map((cue, index) => {
                  const stats = cueStats(cue);
                  const cpsTone =
                    stats.cps > (toNumber(state.maxCps, 25) || 25)
                      ? "amber"
                      : stats.cps > 18
                        ? "sky"
                        : "emerald";
                  return (
                    <div
                      key={cue.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/20"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-[13px] font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            {index + 1}
                          </span>
                          <Chip tone={stats.duration < 0.6 ? "amber" : "emerald"}>{formatDuration(stats.duration)}</Chip>
                          <Chip tone={cpsTone}>{stats.cps.toFixed(1)} CPS</Chip>
                          {stats.lineCount > 2 && <Chip tone="amber">{stats.lineCount} lines</Chip>}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!videoUrl) {
                                toast.info("Add a local video to preview this cue.");
                                return;
                              }
                              seekTo(cue.start);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            aria-label={`Play cue ${index + 1}`}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateCue(cue.id)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            aria-label={`Duplicate cue ${index + 1}`}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => mergeWithNext(cue.id)}
                            disabled={index >= cues.length - 1}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-950/40"
                            aria-label={`Merge cue ${index + 1} with the next cue`}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCue(cue.id)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                            aria-label={`Delete cue ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <TimeField
                          label="Start"
                          value={cue.start}
                          onCommit={(value) => {
                            const parsed = parseTimestamp(value);
                            if (parsed === null || parsed < 0) {
                              toast.error("Use a time such as 00:00:01,500.");
                              return;
                            }
                            updateCue(cue.id, { start: parsed });
                          }}
                        />
                        <TimeField
                          label="End"
                          value={cue.end}
                          onCommit={(value) => {
                            const parsed = parseTimestamp(value);
                            if (parsed === null || parsed < 0) {
                              toast.error("Use a time such as 00:00:04,000.");
                              return;
                            }
                            updateCue(cue.id, { end: parsed });
                          }}
                        />
                      </div>

                      <Field label="Text" className="mt-2">
                        <textarea
                          id={`cue-text-${cue.id}`}
                          rows={Math.min(5, Math.max(2, cue.text.split("\n").length + 1))}
                          value={cue.text}
                          onChange={(event) => updateCue(cue.id, { text: event.target.value })}
                          placeholder="Subtitle text for this cue…"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>

                      {stats.duration < 0.6 && (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                          <span>This cue is very short — under 0.6 seconds.</span>
                          <button
                            type="button"
                            onClick={() => fixShortCue(cue, index)}
                            className="rounded-lg bg-amber-600 px-2.5 py-1 text-[13px] font-bold text-white hover:bg-amber-700"
                          >
                            Extend to 1.2 s
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <ActionButton tone={TONE} icon={Plus} onClick={addCue} className="w-full">
                  Add another cue
                </ActionButton>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-24">
            <SectionCard
              icon={Film}
              tone={TONE}
              title="Video preview"
              description="Optional local video. It never leaves your device and is not saved."
              actions={
                <ActionButton tone={TONE} icon={Upload} onClick={() => videoInputRef.current?.click()}>
                  {videoUrl ? "Replace" : "Add video"}
                </ActionButton>
              }
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleVideoFile(file);
                  event.target.value = "";
                }}
              />
              {videoUrl ? (
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-xl bg-black">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                      className="aspect-video w-full"
                    />
                    {activeCue && (
                      <div className="pointer-events-none absolute inset-x-4 bottom-12 text-center">
                        <span className="inline-block max-w-full rounded bg-black/75 px-2 py-1 text-sm font-semibold leading-snug text-white">
                          {activeCue.text}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                    <span className="truncate">{videoName}</span>
                    <span className="font-mono tabular-nums">{formatTimestamp(currentTime).slice(0, 8)}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
                  <Film className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">No video loaded</p>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                    Add a local video to preview the cues in context and jump to any cue.
                  </p>
                </div>
              )}
            </SectionCard>

            <SectionCard icon={Gauge} tone={TONE} title="Subtitle health">
              <div className="grid grid-cols-2 gap-2">
                <Stat tone={TONE} label="Cues" value={summary.count} icon={Captions} />
                <Stat tone={TONE} label="Duration" value={formatDuration(summary.duration)} icon={Clock} />
                <Stat tone={TONE} label="Words" value={summary.words} icon={FileText} />
                <Stat
                  tone={TONE}
                  label="Issues"
                  value={issues.length}
                  icon={issues.length ? AlertTriangle : CheckCircle2}
                  hint={`${errorCount} errors · ${warningCount} warnings`}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Max CPS">
                  <input
                    type="number"
                    min="8"
                    max="60"
                    value={state.maxCps}
                    onChange={(event) => update({ maxCps: event.target.value })}
                    className={fieldClass(false, TONE)}
                  />
                </Field>
                <Field label="Max line length">
                  <input
                    type="number"
                    min="20"
                    max="120"
                    value={state.maxLine}
                    onChange={(event) => update({ maxLine: event.target.value })}
                    className={fieldClass(false, TONE)}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              icon={issues.length ? AlertTriangle : CheckCircle2}
              tone={TONE}
              title="Validation"
              description={`Checked against ${state.maxCps || 25} CPS and ${state.maxLine || 42} characters per line.`}
              actions={<Chip tone={issues.length ? "amber" : "emerald"}>{issues.length ? `${issues.length} findings` : "Clean"}</Chip>}
            >
              {issues.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                  No timing, overlap or reading-speed problems found.
                </div>
              ) : (
                <div className="max-h-72 space-y-2 overflow-auto pr-1">
                  {issues.slice(0, 14).map((issue, index) => (
                    <div
                      key={`${issue.cueIndex}-${index}`}
                      className={`flex items-start gap-2 rounded-xl border p-2.5 text-[13px] leading-relaxed ${
                        issue.severity === "error"
                          ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
                          : issue.severity === "warning"
                            ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
                            : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300"
                      }`}
                    >
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{issue.message}</span>
                    </div>
                  ))}
                  {issues.length > 14 && (
                    <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                      + {issues.length - 14} more findings.
                    </p>
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard icon={Download} tone={TONE} title="Export & backup">
              <div className="flex flex-wrap gap-2">
                <ActionButton tone={TONE} variant="primary" icon={Download} onClick={() => downloadSubtitle("srt")}>
                  SRT
                </ActionButton>
                <ActionButton tone={TONE} icon={Download} onClick={() => downloadSubtitle("vtt")}>
                  VTT
                </ActionButton>
                <ActionButton tone={TONE} icon={Download} onClick={() => downloadSubtitle("csv")}>
                  CSV
                </ActionButton>
                <ActionButton tone={TONE} icon={Download} onClick={() => downloadSubtitle("txt")}>
                  Transcript
                </ActionButton>
                <ActionButton tone={TONE} icon={Copy} onClick={copySrt}>
                  Copy SRT
                </ActionButton>
                <ActionButton tone={TONE} icon={FileJson} onClick={exportJson}>
                  Project JSON
                </ActionButton>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                SRT uses comma milliseconds; VTT uses a dot and a WEBVTT header. Both are UTF-8 and preserve Unicode
                text.
              </p>
            </SectionCard>

            <SectionCard icon={Sparkles} tone={TONE} title="Editing tips">
              <div className="space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Two lines maximum.</strong> Split a long sentence across cues instead of shrinking the font.
                </p>
                <p>
                  <strong>Keep cues apart.</strong> Leave at least 2 frames between consecutive subtitles so the eye can
                  register the change.
                </p>
                <p>
                  <strong>Sync first, translate second.</strong> Fix the timing before replacing text so translations do
                  not inherit a drifting timeline.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <FaqAccordion tone={TONE} items={SUBTITLE_FAQS} title="Subtitle editing questions" />
    </div>
  );
}
