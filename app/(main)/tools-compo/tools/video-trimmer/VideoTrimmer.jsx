"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Download,
  FileVideo,
  Film,
  HardDrive,
  Info,
  Loader2,
  Music,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
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
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import {
  DEFAULT_TRIM_SETTINGS,
  TRIM_BITRATES,
  TRIM_FAQS,
  TRIM_PRESETS,
  TRIM_RESOLUTIONS,
  TRIM_STORAGE_KEY,
  VIDEO_FORMATS,
  baseNameWithoutExtension,
  buildOutputName,
  defaultFormatForFile,
  formatBytes,
  formatDurationShort,
  formatTimecode,
  parseTimecode,
} from "./videoTrimData";

const TOOL_META = {
  title: "Video Trimmer",
  link: "/tools/video-trimmer",
  icon: "Scissors",
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

const ACCEPTED = "video/*,audio/*,.mp4,.webm,.mkv,.mov,.m4v,.avi,.mp3,.m4a,.wav,.ogg,.flac";

function TimecodeInput({ value, onChange, ariaLabel, disabled }) {
  const [text, setText] = useState(formatTimecode(value));
  const [lastValue, setLastValue] = useState(value);
  if (lastValue !== value) {
    setLastValue(value);
    setText(formatTimecode(value));
  }
  return (
    <input
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => onChange(parseTimecode(text))}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      disabled={disabled}
      className={`${fieldClass(false)} font-mono tabular-nums`}
      aria-label={ariaLabel}
      inputMode="decimal"
    />
  );
}

export default function VideoTrimmer() {
  const { addRecentTool } = useRecentTools();

  const [settings, setSettings] = useState(DEFAULT_TRIM_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [meta, setMeta] = useState(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("empty");
  const [progress, setProgress] = useState(0);
  const [processedTime, setProcessedTime] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scrubbing, setScrubbing] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const inputRef = useRef(null);
  const conversionRef = useRef(null);
  const conversionCancelled = useRef(false);
  const fileUrlRef = useRef("");
  const resultUrlRef = useRef("");
  const historyRef = useRef([]);
  const demoRecorderRef = useRef(null);
  const demoStreamRef = useRef(null);
  const demoTimerRef = useRef(null);
  const demoCancelRef = useRef(false);
  const loadTokenRef = useRef(0);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(TRIM_STORAGE_KEY) : null;
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.settings) setSettings({ ...DEFAULT_TRIM_SETTINGS, ...saved.settings, fileName: "" });
        }
      } catch {
        // Ignore corrupt settings.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const { fileName, ...persisted } = settings;
      window.localStorage.setItem(TRIM_STORAGE_KEY, JSON.stringify({ settings: persisted }));
    } catch {
      // Storage can be unavailable in private windows.
    }
  }, [settings, hydrated]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(
    () => () => {
      window.clearTimeout(demoTimerRef.current);
      if (demoRecorderRef.current && demoRecorderRef.current.state !== "inactive") {
        try {
          demoRecorderRef.current.stop();
        } catch {
          // Ignore teardown races.
        }
      }
      demoStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      historyRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [],
  );

  const duration = meta?.duration || 0;
  const selection = Math.max(0, end - start);
  const selectedFormat = VIDEO_FORMATS.find((item) => item.id === settings.format) || VIDEO_FORMATS[0];
  const isAudioSource = Boolean(meta?.isAudio);
  const resolutionInfo = TRIM_RESOLUTIONS.find((item) => item.value === settings.resolution) || TRIM_RESOLUTIONS[0];

  const selectionPercent = useMemo(() => {
    if (!duration) return { left: 0, width: 0 };
    return {
      left: (clamp(start, 0, duration) / duration) * 100,
      width: (clamp(end - start, 0, duration) / duration) * 100,
    };
  }, [duration, start, end]);

  const playheadPercent = duration ? (clamp(current, 0, duration) / duration) * 100 : 0;

  const clearResult = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = "";
    }
    setResult(null);
  }, []);

  const loadFile = useCallback(
    async (nextFile, options = {}) => {
      if (!nextFile) return;
      if (!nextFile.type.startsWith("video/") && !nextFile.type.startsWith("audio/") && !/\.(mp4|webm|mkv|mov|m4v|avi|mp3|m4a|wav|ogg|flac)$/i.test(nextFile.name)) {
        setError("Choose a video or audio file such as MP4, WebM, MKV, MOV, MP3, M4A, WAV or OGG.");
        return;
      }
      if (nextFile.size === 0) {
        setError("That file is empty.");
        return;
      }
      if (!options.fromDemo) demoCancelRef.current = true;

      window.clearTimeout(demoTimerRef.current);
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
      clearResult();
      conversionCancelled.current = false;
      conversionRef.current = null;
      const token = loadTokenRef.current + 1;
      loadTokenRef.current = token;

      const url = URL.createObjectURL(nextFile);
      fileUrlRef.current = url;
      setFile(nextFile);
      setFileUrl(url);
      setMeta(null);
      setStart(0);
      setEnd(0);
      setCurrent(0);
      setPlaying(false);
      setStatus("loading");
      setProgress(0);
      setProcessedTime(0);
      setError("");
      const format = defaultFormatForFile(nextFile);
      setSettings((currentSettings) => ({
        ...currentSettings,
        format,
        fileName: buildOutputName(nextFile.name, format),
      }));

      try {
        const { Input, BlobSource, ALL_FORMATS } = await import("mediabunny");
        const input = new Input({ source: new BlobSource(nextFile), formats: ALL_FORMATS });
        const total = await input.computeDuration();
        const videoTrack = await input.getPrimaryVideoTrack();
        const audioTrack = await input.getPrimaryAudioTrack();
        if (token !== loadTokenRef.current) return;
        if (!videoTrack && !audioTrack) throw new Error("No playable audio or video track was found.");
        if (!total || !Number.isFinite(total) || total <= 0) {
          throw new Error("This file reports no usable duration, so it cannot be trimmed.");
        }
        const width = videoTrack ? await videoTrack.getDisplayWidth() : 0;
        const height = videoTrack ? await videoTrack.getDisplayHeight() : 0;
        if (token !== loadTokenRef.current) return;
        setMeta({
          duration: total,
          width,
          height,
          size: nextFile.size,
          type: nextFile.type || "media",
          name: nextFile.name,
          isAudio: !videoTrack,
        });
        setStart(0);
        setEnd(total);
        setCurrent(0);
        setStatus("ready");
      } catch (caught) {
        if (token !== loadTokenRef.current) return;
        setMeta(null);
        setStatus("empty");
        setError(
          caught?.message ||
            "This file could not be read. Try another container such as MP4, WebM or MKV.",
        );
      }
    },
    [clearResult],
  );

  const seekTo = (seconds) => {
    const target = clamp(seconds, 0, duration);
    const video = videoRef.current;
    if (video) video.currentTime = target;
    setCurrent(target);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (video.currentTime < start || video.currentTime >= end) video.currentTime = start;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const time = video.currentTime;
    setCurrent(time);
    if (!playing || !duration) return;
    if (time >= end - 0.03) {
      if (settings.loopSelection) {
        video.currentTime = start;
      } else {
        video.pause();
        video.currentTime = end;
        setCurrent(end);
        setPlaying(false);
      }
    }
  };

  const setInPoint = () => {
    const next = clamp(current, 0, Math.max(0, end - 0.05));
    setStart(next);
    toast.success(`In point set to ${formatTimecode(next)}`);
  };

  const setOutPoint = () => {
    const next = clamp(current, start + 0.05, duration);
    setEnd(next);
    toast.success(`Out point set to ${formatTimecode(next)}`);
  };

  const nudge = (which, delta) => {
    if (which === "start") {
      const next = clamp(start + delta, 0, Math.max(0, end - 0.05));
      setStart(next);
      seekTo(next);
    } else {
      const next = clamp(end + delta, Math.min(duration, start + 0.05), duration);
      setEnd(next);
      seekTo(next);
    }
  };

  const applyPreset = (preset) => {
    if (!duration) return;
    let nextStart = preset.start;
    let nextEnd = preset.end;
    if (preset.type === "middle") {
      nextStart = duration * 0.25;
      nextEnd = duration * 0.75;
    } else if (preset.end === "last10") {
      nextStart = Math.max(0, duration - 10);
      nextEnd = duration;
    } else if (preset.end === "last30") {
      nextStart = Math.max(0, duration - 30);
      nextEnd = duration;
    }
    setStart(clamp(nextStart, 0, duration));
    setEnd(clamp(nextEnd, 0, duration));
    seekTo(clamp(nextStart, 0, duration));
  };

  const handleTimelinePointer = (event) => {
    const element = timelineRef.current;
    if (!element || !duration) return;
    const rect = element.getBoundingClientRect();
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    seekTo(ratio * duration);
  };

  const onTimelineDown = (event) => {
    setScrubbing(true);
    handleTimelinePointer(event);
  };

  useEffect(() => {
    if (!scrubbing) return undefined;
    const onMove = (event) => handleTimelinePointer(event);
    const onUp = () => setScrubbing(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrubbing, duration]);

  const runTrim = async () => {
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }
    if (!duration) {
      toast.error("Wait for the file to load before trimming.");
      return;
    }
    if (end - start < 0.05) {
      toast.error("Choose a range of at least 0.05 seconds.");
      return;
    }
    if (status === "processing") return;

    setError("");
    clearResult();
    setStatus("processing");
    setProgress(0);
    setProcessedTime(0);
    conversionCancelled.current = false;

    try {
      const mediabunny = await import("mediabunny");
      const { Input, Output, Conversion, BlobSource, BufferTarget, ALL_FORMATS } = mediabunny;

      if (selectedFormat.id === "mp3") {
        const { registerMp3Encoder } = await import("@mediabunny/mp3-encoder");
        registerMp3Encoder();
      }

      const FormatClass = mediabunny[selectedFormat.outputKey];
      if (!FormatClass) throw new Error(`The ${selectedFormat.label} output format is not available.`);

      const source = new BlobSource(file);
      const input = new Input({ source, formats: ALL_FORMATS });
      const target = new BufferTarget();
      const output = new Output({ format: new FormatClass(), target });

      const options = {
        input,
        output,
        trim: { start, end },
      };

      const videoOptions = {};
      if (selectedFormat.kind === "audio") {
        videoOptions.discard = true;
      } else {
        if (resolutionInfo.width && resolutionInfo.height) {
          videoOptions.width = resolutionInfo.width;
          videoOptions.height = resolutionInfo.height;
          videoOptions.fit = "contain";
        }
        if (Number(settings.bitrate) > 0) videoOptions.bitrate = Number(settings.bitrate);
      }
      if (Object.keys(videoOptions).length) options.video = videoOptions;

      if (selectedFormat.kind === "audio") {
        options.video = { discard: true };
      } else if (settings.muteAudio) {
        options.audio = { discard: true };
      }

      const conversion = await Conversion.init(options);
      if (!conversion.isValid) {
        const reasons = conversion.discardedTracks
          ?.map((track) => track.reason)
          .filter(Boolean)
          .join(", ");
        throw new Error(
          reasons
            ? `This range cannot be exported with those settings: ${reasons}. Try MP4 or WebM.`
            : "This file and output combination is not supported by your browser. Try MP4 or WebM.",
        );
      }

      conversionRef.current = conversion;
      conversion.onProgress = (value, time) => {
        setProgress(clamp(value, 0, 1));
        setProcessedTime(Number(time) || 0);
      };

      await conversion.execute();
      if (conversionCancelled.current) {
        setStatus("ready");
        return;
      }

      const buffer = target.buffer;
      if (!buffer || !buffer.byteLength) throw new Error("The export produced an empty file.");
      const blob = new Blob([buffer], { type: selectedFormat.mime });
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      const outputName = settings.fileName?.trim() || buildOutputName(file.name, selectedFormat.id);
      const entry = {
        id: `${Date.now()}`,
        url,
        name: outputName,
        size: blob.size,
        duration: end - start,
        format: selectedFormat.id,
        formatLabel: selectedFormat.label,
        mime: selectedFormat.mime,
        createdAt: Date.now(),
        sourceName: file.name,
      };
      setResult(entry);
      setHistory((currentHistory) => {
        const next = [entry, ...currentHistory];
        // Keep at most 12 in-session exports and release the rest.
        next.slice(12).forEach((item) => URL.revokeObjectURL(item.url));
        return next.slice(0, 12);
      });
      setStatus("done");
      setProgress(1);
      toast.success("Trim complete. Your file is ready to download.");
    } catch (caught) {
      if (conversionCancelled.current) {
        setStatus("ready");
        setError("");
        return;
      }
      setStatus("ready");
      setError(caught?.message || "The trim failed. Try a different output format.");
    } finally {
      conversionRef.current = null;
    }
  };

  const cancelTrim = () => {
    conversionCancelled.current = true;
    try {
      conversionRef.current?.cancel?.();
    } catch {
      // Cancellation is best-effort.
    }
    setStatus("ready");
    setProgress(0);
    setProcessedTime(0);
    toast.info("Export cancelled.");
  };

  const downloadResult = (item) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const deleteHistoryItem = (id) => {
    setHistory((currentHistory) => {
      const target = currentHistory.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return currentHistory.filter((item) => item.id !== id);
    });
    if (result?.id === id) {
      resultUrlRef.current = "";
      setResult(null);
    }
  };

  const resetAll = () => {
    if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    fileUrlRef.current = "";
    clearResult();
    setFile(null);
    setFileUrl("");
    setMeta(null);
    setStart(0);
    setEnd(0);
    setCurrent(0);
    setStatus("empty");
    setError("");
    setProgress(0);
    setHistory((currentHistory) => {
      currentHistory.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    setSettings((currentSettings) => ({ ...currentSettings, fileName: "" }));
  };

  const generateDemo = async () => {
    if (demoLoading) return;
    if (typeof MediaRecorder === "undefined") {
      setError("This browser cannot generate the demo clip. Load a file instead.");
      return;
    }
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    setDemoLoading(true);
    demoCancelRef.current = false;
    setError("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const context = canvas.getContext("2d");
      const stream = canvas.captureStream(30);
      demoStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4000000 });
      demoRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        demoStreamRef.current = null;
        setDemoLoading(false);
        if (demoCancelRef.current) return;
        const blob = new Blob(chunks, { type: mime });
        if (!blob.size) {
          setError("The demo clip could not be generated in this browser.");
          return;
        }
        const demoFile = new File([blob], "toolstrek-demo-clip.webm", { type: "video/webm" });
        loadFile(demoFile, { fromDemo: true });
        toast.success("10-second demo clip generated.");
      };

      recorder.start(250);
      const started = performance.now();
      const total = 10;
      const colors = ["#f43f5e", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

      const draw = () => {
        const elapsed = (performance.now() - started) / 1000;
        if (elapsed >= total) {
          if (recorder.state !== "inactive") recorder.stop();
          return;
        }
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#0f172a");
        gradient.addColorStop(1, "#1e293b");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (let index = 0; index < 5; index += 1) {
          const angle = elapsed * (0.5 + index * 0.12) + index;
          const x = canvas.width / 2 + Math.cos(angle) * (180 + index * 44);
          const y = canvas.height / 2 + Math.sin(angle * 1.2) * (110 + index * 26);
          context.beginPath();
          context.fillStyle = `${colors[index]}33`;
          context.arc(x, y, 70 + index * 18, 0, Math.PI * 2);
          context.fill();
        }

        context.fillStyle = "#ffffff";
        context.textAlign = "center";
        context.font = "900 62px system-ui, -apple-system, Segoe UI, sans-serif";
        context.fillText("ToolsTrek demo clip", canvas.width / 2, canvas.height / 2 - 10);
        context.font = "600 26px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillStyle = "#cbd5e1";
        context.fillText(`${elapsed.toFixed(1)}s / ${total}s`, canvas.width / 2, canvas.height / 2 + 46);

        context.fillStyle = "rgba(255,255,255,0.12)";
        context.fillRect(240, canvas.height - 92, canvas.width - 480, 10);
        context.fillStyle = "#f43f5e";
        context.fillRect(240, canvas.height - 92, ((canvas.width - 480) * elapsed) / total, 10);
        context.fillStyle = "rgba(255,255,255,0.5)";
        context.font = "600 18px system-ui, sans-serif";
        context.fillText("Generated locally · no upload", canvas.width / 2, canvas.height - 44);

        demoTimerRef.current = window.setTimeout(() => requestAnimationFrame(draw), 33);
      };
      draw();
    } catch (caught) {
      setDemoLoading(false);
      setError(caught?.message || "The demo clip could not be generated.");
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDropActive(false);
    const nextFile = event.dataTransfer?.files?.[0];
    if (nextFile) loadFile(nextFile);
  };

  const markInvalidRange = end <= start;

  return (
    <div className="tool-page-content space-y-5">
      <Hero
        eyebrow="Precision cut studio"
        icon={Scissors}
        title="Video Trimmer"
        description="Cut video and audio with frame-accurate in and out points, then export MP4, WebM, MKV, MP3, WAV or OGG. Your media is decoded and encoded locally with WebCodecs — nothing is uploaded, and no watermark is added."
        badges={["Frame-accurate cuts", "Video + audio", "No uploads", "Batch-safe exports"]}
        tone="violet"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-5">
          <SectionCard
            icon={Film}
            title="Source & preview"
            description="Drop a file or choose one from your device. Large files stay in your browser."
            tone="violet"
            actions={
              <>
                {meta && <Chip tone="violet">{formatTimecode(duration, false)}</Chip>}
                {meta && <Chip tone="emerald">{formatBytes(meta.size)}</Chip>}
                {file && (
                  <ActionButton variant="ghost" icon={RotateCcw} onClick={resetAll}>
                    Replace
                  </ActionButton>
                )}
              </>
            }
          >
            {!file ? (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropActive(true);
                }}
                onDragLeave={() => setDropActive(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-10 text-center transition ${
                  dropActive
                    ? "border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950/30"
                    : "border-slate-300 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-800/20"
                }`}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
                  <Upload className="h-8 w-8" />
                </span>
                <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Drop a video or audio file</h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  MP4, WebM, MKV, MOV, MP3, M4A, WAV, OGG and FLAC are supported. Files never leave your device — there
                  is no upload step and no size limit imposed by a server.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <ActionButton variant="primary" tone="violet" icon={Upload} onClick={() => inputRef.current?.click()}>
                    Choose file
                  </ActionButton>
                  <ActionButton icon={Sparkles} onClick={generateDemo} disabled={demoLoading}>
                    {demoLoading ? "Creating demo…" : "Generate demo clip"}
                  </ActionButton>
                </div>
                {demoLoading && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-300">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Rendering a 10-second test card locally…
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800">
                  <video
                    ref={videoRef}
                    src={fileUrl}
                    playsInline
                    onTimeUpdate={onTimeUpdate}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                    className={`aspect-video w-full object-contain ${isAudioSource ? "opacity-0" : ""}`}
                  />
                  {isAudioSource && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-violet-950 via-slate-950 to-fuchsia-950 text-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
                        <Music className="h-8 w-8" />
                      </span>
                      <p className="max-w-xs truncate px-4 text-base font-black text-white">{file?.name}</p>
                      <p className="text-sm font-semibold text-violet-200/80">Audio only · {formatTimecode(duration, false)}</p>
                    </div>
                  )}
                  {status === "loading" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                      <p className="text-sm font-bold text-white">Reading media…</p>
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                      {meta?.width && meta?.height ? `${meta.width}×${meta.height}` : "Audio"}
                    </span>
                    <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                      {meta?.type || file?.type || "media"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <ActionButton icon={ChevronsLeft} onClick={() => seekTo(start)} aria-label="Jump to in point">
                      In
                    </ActionButton>
                    <ActionButton icon={playing ? Pause : Play} variant="primary" tone="violet" onClick={togglePlay}>
                      {playing ? "Pause" : "Play selection"}
                    </ActionButton>
                    <ActionButton icon={ChevronsRight} onClick={() => seekTo(end)} aria-label="Jump to out point">
                      Out
                    </ActionButton>
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">
                    {formatTimecode(current)} / {formatTimecode(duration)}
                  </span>
                </div>

                <div
                  ref={timelineRef}
                  role="slider"
                  tabIndex={0}
                  aria-label="Video timeline"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration)}
                  aria-valuenow={Math.round(current)}
                  onPointerDown={onTimelineDown}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") seekTo(current - (event.shiftKey ? 1 : 0.1));
                    if (event.key === "ArrowRight") seekTo(current + (event.shiftKey ? 1 : 0.1));
                  }}
                  className="relative h-16 w-full cursor-crosshair touch-none select-none overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 24 }, (_, index) => (
                      <span
                        key={index}
                        className={`h-full flex-1 border-r border-white/40 dark:border-slate-900/40 ${
                          index % 6 === 0 ? "bg-slate-300/60 dark:bg-slate-700" : "bg-slate-200/50 dark:bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                  <div
                    className="absolute inset-y-0 border-x-2 border-violet-500 bg-violet-500/25"
                    style={{ left: `${selectionPercent.left}%`, width: `${selectionPercent.width}%` }}
                  />
                  <div
                    className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.6)]"
                    style={{ left: `${playheadPercent}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-1 left-2 rounded bg-slate-950/70 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                    {formatTimecode(start)}
                  </div>
                  <div className="pointer-events-none absolute bottom-1 right-2 rounded bg-slate-950/70 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                    {formatTimecode(end)}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                    <span className={labelClass}>In point</span>
                    <div className="flex items-center gap-1.5">
                      <TimecodeInput
                        value={start}
                        ariaLabel="In point timecode"
                        onChange={(next) => {
                          const safe = clamp(next, 0, Math.max(0, end - 0.05));
                          setStart(safe);
                          seekTo(safe);
                        }}
                      />
                      <ActionButton icon={ChevronsLeft} onClick={() => nudge("start", -0.1)} aria-label="Nudge in point back">
                        −0.1s
                      </ActionButton>
                      <ActionButton icon={ChevronsRight} onClick={() => nudge("start", 0.1)} aria-label="Nudge in point forward">
                        +0.1s
                      </ActionButton>
                    </div>
                    <button
                      type="button"
                      onClick={setInPoint}
                      className="mt-2 w-full rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-violet-700"
                    >
                      Set in at playhead
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                    <span className={labelClass}>Out point</span>
                    <div className="flex items-center gap-1.5">
                      <TimecodeInput
                        value={end}
                        ariaLabel="Out point timecode"
                        onChange={(next) => {
                          const safe = clamp(next, Math.min(duration, start + 0.05), duration);
                          setEnd(safe);
                          seekTo(safe);
                        }}
                      />
                      <ActionButton icon={ChevronsLeft} onClick={() => nudge("end", -0.1)} aria-label="Nudge out point back">
                        −0.1s
                      </ActionButton>
                      <ActionButton icon={ChevronsRight} onClick={() => nudge("end", 0.1)} aria-label="Nudge out point forward">
                        +0.1s
                      </ActionButton>
                    </div>
                    <button
                      type="button"
                      onClick={setOutPoint}
                      className="mt-2 w-full rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-violet-700"
                    >
                      Set out at playhead
                    </button>
                  </div>
                </div>

                <div>
                  <span className={labelClass}>Quick presets</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TRIM_PRESETS.map((preset) => (
                      <ActionButton key={preset.label} onClick={() => applyPreset(preset)}>
                        {preset.label}
                      </ActionButton>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ActionButton icon={Upload} onClick={() => inputRef.current?.click()}>
                    Change file
                  </ActionButton>
                  <ActionButton variant="ghost" icon={Trash2} onClick={resetAll}>
                    Clear file
                  </ActionButton>
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                event.target.value = "";
                if (nextFile) loadFile(nextFile);
              }}
            />
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDropActive(true);
              }}
              onDragLeave={() => setDropActive(false)}
              onDrop={onDrop}
              className={`mt-3 rounded-xl border border-dashed px-3 py-2 text-center text-sm font-semibold transition ${
                dropActive
                  ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-200"
                  : "border-slate-200 text-slate-400 dark:border-slate-700"
              }`}
            >
              Drop another file anywhere here to replace the current one.
            </div>
          </SectionCard>

          {result && (
            <SectionCard
              icon={CheckCircle2}
              title="Export ready"
              description="Preview the cut, then download it. This file lives in memory only."
              tone="emerald"
              actions={
                <>
                  <ActionButton variant="primary" tone="emerald" icon={Download} onClick={() => downloadResult(result)}>
                    Download
                  </ActionButton>
                  <ActionButton variant="ghost" icon={Scissors} onClick={runTrim}>
                    Trim again
                  </ActionButton>
                </>
              }
            >
              <video src={result.url} controls playsInline className="aspect-video w-full rounded-xl bg-slate-950" />
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="Output size" value={formatBytes(result.size)} tone="emerald" icon={HardDrive} />
                <Stat label="Duration" value={formatDurationShort(result.duration)} tone="emerald" icon={Clock} />
                <Stat label="Format" value={result.formatLabel || result.format.toUpperCase()} tone="violet" />
                <Stat
                  label="Saved vs source"
                  value={
                    meta?.size
                      ? `${Math.max(0, 100 - Math.round((result.size / meta.size) * 100))}%`
                      : "—"
                  }
                  tone="sky"
                />
              </div>
              <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-200">{result.name}</span> · {baseNameWithoutExtension(file?.name || "")} cut from {formatTimecode(start)} to {formatTimecode(end)}
              </p>
            </SectionCard>
          )}

          {history.length > 0 && (
            <SectionCard
              icon={Film}
              title="Session exports"
              description="Exports are released when you reload the page, so download the ones you need."
              tone="sky"
            >
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-800/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatBytes(item.size)} · {formatDurationShort(item.duration)} · {item.format.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <ActionButton icon={Download} onClick={() => downloadResult(item)}>
                        Download
                      </ActionButton>
                      <button
                        type="button"
                        onClick={() => deleteHistoryItem(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-5">
          <SectionCard icon={Scissors} title="Trim summary" description="The selected range and output settings." tone="violet">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Selection" value={duration ? formatDurationShort(selection) : "—"} tone="violet" icon={Clock} />
              <Stat label="In → out" value={duration ? `${formatTimecode(start, false)} → ${formatTimecode(end, false)}` : "—"} tone="sky" />
              <Stat label="Source" value={meta ? formatBytes(meta.size) : "—"} tone="emerald" icon={HardDrive} />
              <Stat
                label="Output"
                value={meta?.width && meta?.height ? `${resolutionInfo.label}` : selectedFormat.label}
                tone="amber"
              />
            </div>

            <button
              type="button"
              onClick={runTrim}
              disabled={!file || !duration || status === "processing" || markInvalidRange}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-3 text-base font-black text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 dark:focus-visible:ring-offset-slate-900"
            >
              {status === "processing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
              {status === "processing" ? "Trimming…" : "Trim & export"}
            </button>
            {markInvalidRange && file && (
              <p className="mt-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
                The out point must be later than the in point.
              </p>
            )}

            {status === "processing" && (
              <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-900/60 dark:bg-violet-950/30">
                <div className="flex items-center justify-between gap-2 text-sm font-bold text-violet-800 dark:text-violet-200">
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Encoding {Math.round(progress * 100)}%
                  </span>
                  <span className="font-mono tabular-nums">{formatTimecode(processedTime)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-200 dark:bg-violet-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                    style={{ width: `${Math.max(2, progress * 100)}%` }}
                  />
                </div>
                <ActionButton variant="ghost" icon={Trash2} className="mt-2" onClick={cancelTrim}>
                  Cancel export
                </ActionButton>
              </div>
            )}

            {error && (
              <div className="mt-3">
                <Callout tone="rose" variant="warning" title="Something went wrong">
                  {error}
                </Callout>
              </div>
            )}

            <p className="mt-3 flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Precise trimming re-encodes only the selected range. Keep this tab focused for the fastest export.
            </p>
          </SectionCard>

          <SectionCard icon={Settings2} title="Output settings" description="Everything here applies to the next export." tone="sky">
            <div className="space-y-4">
              <div>
                <span className={labelClass}>Format</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {VIDEO_FORMATS.map((format) => (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => {
                        setSettings((currentSettings) => ({
                          ...currentSettings,
                          format: format.id,
                          fileName: file
                            ? buildOutputName(file.name, format.id)
                            : currentSettings.fileName,
                        }));
                        clearResult();
                      }}
                      disabled={status === "processing"}
                      className={`rounded-xl border p-2 text-left transition disabled:opacity-60 ${
                        settings.format === format.id
                          ? "border-violet-400 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/40"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50"
                      }`}
                      aria-pressed={settings.format === format.id}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                        {format.kind === "audio" ? <Music className="h-3.5 w-3.5" /> : <FileVideo className="h-3.5 w-3.5" />}
                        {format.label}
                      </span>
                      <span className="block text-sm text-slate-500 dark:text-slate-400">{format.blurb}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedFormat.kind === "video" && (
                <>
                  <div>
                    <span className={labelClass}>Resolution</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {TRIM_RESOLUTIONS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setSettings((currentSettings) => ({ ...currentSettings, resolution: item.value }))}
                          disabled={status === "processing"}
                          className={`rounded-lg border px-1.5 py-2 text-sm font-black transition disabled:opacity-60 ${
                            settings.resolution === item.value
                              ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                              : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                          aria-pressed={settings.resolution === item.value}
                          title={item.blurb}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className={labelClass}>Video bitrate</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {TRIM_BITRATES.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setSettings((currentSettings) => ({ ...currentSettings, bitrate: item.value }))}
                          disabled={status === "processing"}
                          className={`rounded-lg border px-1 py-2 text-sm font-bold transition disabled:opacity-60 ${
                            Number(settings.bitrate) === item.value
                              ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                              : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                          aria-pressed={Number(settings.bitrate) === item.value}
                          title={item.blurb}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <ToggleRow
                checked={settings.muteAudio}
                onChange={(value) => {
                  setSettings((currentSettings) => ({ ...currentSettings, muteAudio: value }));
                  clearResult();
                }}
                label="Remove audio track"
                description="Export a silent video. Ignored for audio-only formats."
                tone="sky"
              />
              <ToggleRow
                checked={settings.loopSelection}
                onChange={(value) => setSettings((currentSettings) => ({ ...currentSettings, loopSelection: value }))}
                label="Loop the selection in preview"
                description="Playback jumps back to the in point instead of stopping at the out point."
                tone="sky"
              />

              <Field label="Output file name" hint="The extension is set automatically from the chosen format.">
                <input
                  value={settings.fileName}
                  onChange={(event) => setSettings((currentSettings) => ({ ...currentSettings, fileName: event.target.value }))}
                  placeholder="my-clip-trimmed.mp4"
                  className={fieldClass(false)}
                />
              </Field>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Selection details</p>
                <dl className="mt-1.5 space-y-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Start</dt>
                    <dd className="font-mono font-bold text-slate-800 dark:text-slate-100">{formatTimecode(start)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">End</dt>
                    <dd className="font-mono font-bold text-slate-800 dark:text-slate-100">{formatTimecode(end)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Length</dt>
                    <dd className="font-mono font-bold text-slate-800 dark:text-slate-100">{formatTimecode(selection)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500 dark:text-slate-400">Container</dt>
                    <dd className="font-bold text-slate-800 dark:text-slate-100">{selectedFormat.label}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </SectionCard>

          <Callout tone="violet" variant="success" title="Your file stays here">
            <span className="inline-flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Decoding, trimming and encoding all happen with WebCodecs in this tab. No server, no account, no upload
              and no re-download of your private footage.
            </span>
          </Callout>

          <Callout tone="amber" variant="warning" title="Before you export">
            <span className="inline-flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Keep this tab open and focused while encoding. Very large or 4K files can exceed available memory in
              older browsers; export at 1080p and a moderate bitrate for long recordings.
            </span>
          </Callout>
        </div>
      </div>

      <FaqAccordion items={TRIM_FAQS} tone="violet" />
    </div>
  );
}
