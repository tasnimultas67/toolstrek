"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Clapperboard,
  Download,
  Film,
  Gauge,
  Image as ImageIcon,
  Layers,
  Loader2,
  Maximize,
  Pause,
  Play,
  RefreshCw,
  Scissors,
  Settings2,
  Sparkles,
  Timer,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  FaqAccordion,
  Hero,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import {
  DEFAULT_GIF_SETTINGS,
  GIF_FAQS,
  GIF_FPS,
  GIF_WIDTHS,
  VIDEO_GIF_STORAGE_KEY,
  buildDemoClip,
  estimateGifSize,
  formatBytes,
  formatTime,
} from "./videoGifData";

const TOOL_META = { title: "Video to GIF", link: "/tools/video-to-gif", icon: "Clapperboard" };

const SPEEDS = [
  { value: "0.5", label: "0.5×" },
  { value: "0.75", label: "0.75×" },
  { value: "1", label: "1×" },
  { value: "1.5", label: "1.5×" },
  { value: "2", label: "2×" },
];

function loadGifEngine() {
  return new Promise((resolve, reject) => {
    if (window.GIF) {
      resolve(window.GIF);
      return;
    }
    const existing = document.querySelector('script[data-gif-engine="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.GIF));
      existing.addEventListener("error", () => reject(new Error("Could not load the GIF encoder.")));
      return;
    }
    const script = document.createElement("script");
    script.src = "/gif.js";
    script.async = true;
    script.dataset.gifEngine = "true";
    script.onload = () => resolve(window.GIF);
    script.onerror = () => reject(new Error("Could not load /gif.js from the public folder."));
    document.body.appendChild(script);
  });
}

function seekVideo(video, time) {
  return new Promise((resolve, reject) => {
    const target = Math.min(Math.max(0, time), Math.max(0, video.duration - 0.02));
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener("seeked", onSeeked);
      window.clearTimeout(timeout);
      resolve();
    };
    const onSeeked = () => finish();
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      video.removeEventListener("seeked", onSeeked);
      reject(new Error("The browser took too long to seek. Try a smaller range."));
    }, 8000);
    video.addEventListener("seeked", onSeeked);
    try {
      video.currentTime = target;
    } catch {
      settled = true;
      video.removeEventListener("seeked", onSeeked);
      window.clearTimeout(timeout);
      reject(new Error("This video cannot be seeked."));
      return;
    }
    if (Math.abs(video.currentTime - target) < 0.004 && video.readyState >= 2) {
      window.requestAnimationFrame(finish);
    }
  });
}

function drawFrame(context, video, width, height, fit, background) {
  context.save();
  context.fillStyle = background || "#000000";
  context.fillRect(0, 0, width, height);
  const sourceWidth = video.videoWidth || width;
  const sourceHeight = video.videoHeight || height;
  const scale =
    fit === "cover"
      ? Math.max(width / sourceWidth, height / sourceHeight)
      : Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(video, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  context.restore();
}

export default function VideoToGifStudio() {
  const { addRecentTool } = useRecentTools();
  const [settings, setSettings] = useState(DEFAULT_GIF_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [source, setSource] = useState(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [output, setOutput] = useState(null);
  const [loop, setLoop] = useState(0);
  const [previewing, setPreviewing] = useState(false);

  const videoRef = useRef(null);
  const sourceRef = useRef(null);
  const fileInputRef = useRef(null);
  const cancelRef = useRef(false);
  const previewingRef = useRef(false);
  const outputRef = useRef(null);
  const canvasRef = useRef(null);

  const updateSetting = useCallback((patch) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(VIDEO_GIF_STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.settings) setSettings((current) => ({ ...current, ...saved.settings }));
          if (typeof saved.loop === "number") setLoop(saved.loop);
        }
      } catch {
        // Ignore corrupt storage and keep the blank defaults.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(VIDEO_GIF_STORAGE_KEY, JSON.stringify({ settings, loop }));
    } catch {
      // Private windows may block storage.
    }
  }, [settings, loop, hydrated]);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  useEffect(
    () => () => {
      if (sourceRef.current?.url) URL.revokeObjectURL(sourceRef.current.url);
      if (outputRef.current?.url) URL.revokeObjectURL(outputRef.current.url);
    },
    [],
  );

  const replaceSource = useCallback((next) => {
    if (sourceRef.current?.url) URL.revokeObjectURL(sourceRef.current.url);
    if (outputRef.current?.url) {
      URL.revokeObjectURL(outputRef.current.url);
      outputRef.current = null;
    }
    setOutput(null);
    setError("");
    setProgress(0);
    setPreviewing(false);
    previewingRef.current = false;
    sourceRef.current = next;
    setSource(next);
    setStart(0);
    setEnd(0);
    setPlayhead(0);
    setStatus(next ? "loading" : "idle");
  }, []);

  const loadVideoFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type.startsWith("video/")) {
        toast.error("Choose an MP4, WebM, MOV, MKV or OGG video file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024 * 1024) {
        toast.error("Videos up to 2 GB are supported in this browser.");
        return;
      }
      replaceSource({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        duration: 0,
        width: 0,
        height: 0,
        demo: false,
      });
      toast.success("Video loaded locally");
    },
    [replaceSource],
  );

  const loadDemoClip = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const blob = await buildDemoClip();
      replaceSource({
        name: "toolstrek-demo-clip.webm",
        size: blob.size,
        type: blob.type,
        url: URL.createObjectURL(blob),
        duration: 0,
        width: 0,
        height: 0,
        demo: true,
      });
      toast.success("Demo clip generated on your device");
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Could not generate the demo clip.");
      toast.error(err.message || "Could not generate the demo clip.");
    }
  }, [replaceSource]);

  const handleMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const next = {
      ...(sourceRef.current || {}),
      duration,
      width: video.videoWidth,
      height: video.videoHeight,
    };
    sourceRef.current = next;
    setSource(next);
    const defaultEnd = Math.min(duration || 0, 6);
    setStart(0);
    setEnd(defaultEnd);
    setPlayhead(0);
    setStatus("idle");
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setPlayhead(video.currentTime);
    if (previewingRef.current && video.currentTime >= end) {
      video.pause();
      previewingRef.current = false;
      setPreviewing(false);
    }
  };

  const previewRange = () => {
    const video = videoRef.current;
    if (!video || !source) return;
    video.currentTime = start;
    video.play().catch(() => {});
    previewingRef.current = true;
    setPreviewing(true);
  };

  const setStartFromPlayhead = () => {
    const next = Math.min(playhead, Math.max(0, end - 0.1));
    setStart(Math.max(0, Math.round(next * 100) / 100));
    toast.info(`Start set to ${formatTime(next)}`);
  };

  const setEndFromPlayhead = () => {
    const next = Math.max(playhead, Math.min(start + 0.1, source?.duration || playhead));
    setEnd(Math.round(next * 100) / 100);
    toast.info(`End set to ${formatTime(next)}`);
  };

  const extractFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !source) return;
    try {
      video.pause();
      await seekVideo(video, playhead);
      const width = video.videoWidth;
      const height = video.videoHeight;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, width, height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not encode the frame.");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `frame-${playhead.toFixed(2)}s.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1200);
      toast.success("Frame saved as PNG");
    } catch (err) {
      toast.error(err.message || "Could not extract that frame.");
    }
  }, [playhead, source]);

  const generateGif = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !source || status === "generating") return;
    if (!source.duration || end <= start) {
      setError("Choose a valid range with an end point after the start point.");
      return;
    }
    setError("");
    setStatus("generating");
    setProgress(0);
    cancelRef.current = false;
    video.pause();
    previewingRef.current = false;
    setPreviewing(false);
    try {
      const outputWidth = Math.max(120, Math.min(2000, Number(settings.width) || source.width || 640));
      const ratio = (source.height || 9) / (source.width || 16);
      const outputHeight = Math.max(2, Math.round(outputWidth * ratio));
      const step = Number(settings.speed) / Number(settings.fps);
      const forward = [];
      for (let time = start; time < end - 0.001; time += step) {
        forward.push(time);
        if (forward.length > 900) break;
      }
      if (!forward.length) throw new Error("The selected range is too short for this frame rate.");
      const times = settings.pingPong
        ? forward.concat([...forward].reverse().slice(1, -1))
        : forward;
      if (times.length > 900) {
        throw new Error("That range would create more than 900 frames. Shorten the clip, lower the FPS or raise the speed.");
      }

      const GIF = await loadGifEngine();
      if (!GIF) throw new Error("The GIF encoder did not load.");

      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const engine = new GIF({
        workers: 2,
        quality: Number(settings.quality),
        width: outputWidth,
        height: outputHeight,
        workerScript: "/gif.worker.js",
        repeat: Number(loop) || 0,
        background: settings.background,
        dither: settings.dither ? "FloydSteinberg" : false,
        transparent: null,
      });

      const finished = new Promise((resolve, reject) => {
        engine.on("finished", resolve);
        engine.on("abort", () => resolve(null));
        engine.on("error", reject);
      });

      engine.on("progress", (value) => {
        setProgress(80 + Math.round(value * 20));
      });

      const frameDelay = Math.max(20, Math.round(1000 / Number(settings.fps)));
      for (let index = 0; index < times.length; index += 1) {
        if (cancelRef.current) {
          try {
            engine.abort();
          } catch {
            // Ignore abort races.
          }
          setStatus("idle");
          setProgress(0);
          toast.info("GIF generation cancelled");
          return;
        }
        await seekVideo(video, times[index]);
        await new Promise((resolve) => {
          if (typeof video.requestVideoFrameCallback === "function") {
            video.requestVideoFrameCallback(() => resolve());
            window.setTimeout(resolve, 120);
          } else {
            window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
          }
        });
        drawFrame(context, video, outputWidth, outputHeight, settings.fit, settings.background);
        engine.addFrame(canvas, { delay: frameDelay, copy: true });
        if (index % 3 === 0) {
          setProgress(Math.round(((index + 1) / times.length) * 78));
          await new Promise((resolve) => window.setTimeout(resolve, 0));
        }
      }

      setProgress(80);
      engine.render();
      const blob = await finished;
      if (!blob) return;
      if (cancelRef.current) return;
      const url = URL.createObjectURL(blob);
      if (outputRef.current?.url) URL.revokeObjectURL(outputRef.current.url);
      const next = {
        url,
        blob,
        size: blob.size,
        width: outputWidth,
        height: outputHeight,
        frames: times.length,
        fps: Number(settings.fps),
        duration: end - start,
        pingPong: settings.pingPong,
      };
      outputRef.current = next;
      setOutput(next);
      setStatus("done");
      setProgress(100);
      video.currentTime = start;
      toast.success(`GIF ready · ${times.length} frames`);
    } catch (err) {
      setStatus("idle");
      setProgress(0);
      setError(err.message || "Could not generate the GIF.");
      toast.error(err.message || "Could not generate the GIF.");
    }
  }, [end, loop, settings, source, start, status]);

  const cancelGeneration = () => {
    cancelRef.current = true;
    toast.info("Cancelling after the current frame…");
  };

  const downloadGif = () => {
    if (!output) return;
    const anchor = document.createElement("a");
    anchor.href = output.url;
    anchor.download = `${(source?.name || "clip").replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-") || "clip"}-${Date.now()}.gif`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success("GIF downloaded");
  };

  const clearAll = () => {
    replaceSource(null);
    setStart(0);
    setEnd(0);
    setProgress(0);
    setError("");
  };

  const rangeDuration = Math.max(0, end - start);
  const forwardFrames = useMemo(() => {
    if (!settings.fps || !settings.speed) return 0;
    return Math.max(0, Math.floor(rangeDuration / (Number(settings.speed) / Number(settings.fps))));
  }, [rangeDuration, settings.fps, settings.speed]);

  const frameCount = settings.pingPong ? Math.max(0, forwardFrames * 2 - 2) : forwardFrames;
  const outputWidth = Number(settings.width) || source?.width || 0;
  const outputHeight =
    source?.width && source?.height && outputWidth ? Math.round(outputWidth * (source.height / source.width)) : 0;
  const estimatedSize = estimateGifSize({
    width: outputWidth,
    height: outputHeight,
    frames: frameCount,
    quality: Number(settings.quality),
  });
  const busy = status === "generating";

  return (
    <div className="tool-page-content space-y-5">
      <Hero
        eyebrow="Motion lab"
        icon={Clapperboard}
        title="Video to GIF Converter"
        description="Turn any moment from a video into a clean, looping GIF. Trim the range, choose the frame rate and width, then encode locally with no uploads, no watermark and no account."
        badges={["Frame-accurate range", "Ping-pong loops", "Up to 900 frames", "100% local"]}
        tone="violet"
      />

      {error && (
        <Callout tone="rose" variant="warning" title="Conversion problem">
          {error}
        </Callout>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-5">
          <SectionCard
            icon={Film}
            title="Source video"
            description="Load an MP4, WebM, MOV, MKV or OGG file. Nothing is uploaded."
            tone="violet"
            actions={
              source ? (
                <>
                  <Chip tone={source.demo ? "amber" : "violet"}>{source.demo ? "Demo clip" : "Local file"}</Chip>
                  <ActionButton variant="ghost" icon={X} onClick={clearAll}>
                    Clear
                  </ActionButton>
                </>
              ) : (
                <Chip tone="violet">No video</Chip>
              )
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => {
                loadVideoFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            {!source ? (
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  loadVideoFile(event.dataTransfer.files?.[0]);
                }}
                className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-slate-700 dark:bg-slate-800/30"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                  <Upload className="h-7 w-7" />
                </span>
                <p className="mt-3 text-sm font-black text-slate-900 dark:text-white">Drop a video or choose a file</p>
                <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  MP4, WebM, MOV, MKV and OGG up to 2 GB. The demo clip is generated locally and is optional.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <ActionButton variant="primary" tone="violet" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                    Choose video
                  </ActionButton>
                  <ActionButton icon={Wand2} onClick={loadDemoClip}>
                    Load demo clip
                  </ActionButton>
                </div>
              </div>
            ) : (
              <>
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800">
                  <video
                    ref={videoRef}
                    src={source.url}
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={handleMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onError={() => {
                      setStatus("idle");
                      setError("This video could not be decoded. Try MP4 (H.264) or WebM (VP9).");
                    }}
                    className="mx-auto max-h-[48vh] w-full object-contain"
                  />
                  {status === "loading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="truncate text-slate-700 dark:text-slate-200">{source.name}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{formatBytes(source.size)}</span>
                  {source.width > 0 && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                      {source.width} × {source.height}
                    </span>
                  )}
                  {source.duration > 0 && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{formatTime(source.duration)}</span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <ActionButton icon={RefreshCw} onClick={() => fileInputRef.current?.click()}>
                      Replace
                    </ActionButton>
                    <ActionButton icon={Wand2} onClick={loadDemoClip}>
                      Demo
                    </ActionButton>
                  </div>
                </div>
              </>
            )}
          </SectionCard>

          {source && (
            <SectionCard
              icon={Scissors}
              title="Trim & timing"
              description="Choose the exact slice to convert. Preview loops the selection only."
              tone="sky"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Playhead</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[13px] font-bold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {formatTime(playhead)} / {formatTime(source.duration)}
                    </span>
                  </div>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="absolute inset-y-0 bg-violet-500/50"
                        style={{
                          left: `${source.duration ? (start / source.duration) * 100 : 0}%`,
                          width: `${source.duration ? (rangeDuration / source.duration) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0.1, source.duration)}
                      step={0.05}
                      value={Math.min(playhead, source.duration)}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setPlayhead(value);
                        if (videoRef.current) videoRef.current.currentTime = value;
                      }}
                      aria-label="Video playhead"
                      className="relative h-6 w-full cursor-pointer appearance-none bg-transparent accent-violet-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="gif-start">
                      Start (seconds)
                    </label>
                    <input
                      id="gif-start"
                      type="number"
                      min={0}
                      max={Math.max(0, end - 0.1)}
                      step={0.1}
                      value={start}
                      onChange={(event) => {
                        const value = Math.max(0, Math.min(Number(event.target.value) || 0, end - 0.1));
                        setStart(value);
                        if (videoRef.current) videoRef.current.currentTime = value;
                      }}
                      className={fieldClass(false, "sky")}
                    />
                    <button
                      type="button"
                      onClick={setStartFromPlayhead}
                      className="mt-1.5 text-[13px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-300"
                    >
                      Set from playhead
                    </button>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="gif-end">
                      End (seconds)
                    </label>
                    <input
                      id="gif-end"
                      type="number"
                      min={start + 0.1}
                      max={source.duration}
                      step={0.1}
                      value={end}
                      onChange={(event) => {
                        const value = Math.max(start + 0.1, Math.min(Number(event.target.value) || 0, source.duration));
                        setEnd(value);
                      }}
                      className={fieldClass(false, "sky")}
                    />
                    <button
                      type="button"
                      onClick={setEndFromPlayhead}
                      className="mt-1.5 text-[13px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-300"
                    >
                      Set from playhead
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ActionButton icon={previewing ? Pause : Play} onClick={previewRange} disabled={!rangeDuration}>
                    {previewing ? "Previewing…" : "Preview range"}
                  </ActionButton>
                  <ActionButton icon={ImageIcon} onClick={extractFrame} disabled={!source}>
                    Save current frame
                  </ActionButton>
                  <ActionButton
                    icon={Timer}
                    onClick={() => {
                      setStart(0);
                      setEnd(source.duration);
                    }}
                  >
                    Use whole video
                  </ActionButton>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Stat label="Selection" value={formatTime(rangeDuration)} tone="sky" icon={Timer} />
                  <Stat label="Frames" value={frameCount} tone="violet" icon={Layers} />
                  <Stat label="Output" value={outputWidth && outputHeight ? `${outputWidth}×${outputHeight}` : "—"} tone="emerald" icon={Maximize} />
                  <Stat label="Est. size" value={estimatedSize ? `~${formatBytes(estimatedSize)}` : "—"} tone="amber" icon={Gauge} />
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard
            icon={Sparkles}
            title="GIF output"
            description="Preview the finished animation, then download it."
            tone="emerald"
            actions={
              output ? (
                <>
                  <Chip tone="emerald">{formatBytes(output.size)}</Chip>
                  <ActionButton variant="primary" tone="emerald" icon={Download} onClick={downloadGif}>
                    Download GIF
                  </ActionButton>
                </>
              ) : (
                <Chip tone="emerald">{busy ? `${progress}%` : "Not generated"}</Chip>
              )
            }
          >
            {busy ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-700 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                  Encoding {frameCount} frames locally…
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500 transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>{progress}% complete</span>
                  <button type="button" onClick={cancelGeneration} className="font-bold text-rose-600 hover:text-rose-700 dark:text-rose-300">
                    Cancel
                  </button>
                </div>
              </div>
            ) : output ? (
              <>
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#f8fafc_0%_50%)] bg-[length:20px_20px] p-3 dark:border-slate-700 dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={output.url}
                    alt="Generated GIF preview"
                    className="max-h-[420px] w-auto max-w-full rounded-xl shadow-lg"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Stat label="Dimensions" value={`${output.width}×${output.height}`} tone="violet" />
                  <Stat label="Frames" value={output.frames} tone="sky" />
                  <Stat label="Frame rate" value={`${output.fps} fps`} tone="emerald" />
                  <Stat label="File size" value={formatBytes(output.size)} tone="amber" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ActionButton variant="primary" tone="emerald" icon={Download} onClick={downloadGif}>
                    Download GIF
                  </ActionButton>
                  <ActionButton icon={RefreshCw} onClick={generateGif} disabled={!source}>
                    Regenerate
                  </ActionButton>
                  <ActionButton variant="ghost" icon={Trash2} onClick={() => {
                    if (outputRef.current?.url) URL.revokeObjectURL(outputRef.current.url);
                    outputRef.current = null;
                    setOutput(null);
                    setStatus("idle");
                    setProgress(0);
                  }}>
                    Discard
                  </ActionButton>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-slate-700 dark:bg-slate-800/30">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Clapperboard className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">No GIF yet</p>
                <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {source
                    ? "Set a range and press Generate GIF. The animation appears here and never leaves your device."
                    : "Load a video or the demo clip first, then choose a range to convert."}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {!source && (
                    <ActionButton variant="primary" tone="violet" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                      Choose video
                    </ActionButton>
                  )}
                  {!source && (
                    <ActionButton icon={Wand2} onClick={loadDemoClip}>
                      Load demo clip
                    </ActionButton>
                  )}
                  {source && (
                    <ActionButton variant="primary" tone="emerald" icon={Sparkles} onClick={generateGif}>
                      Generate GIF
                    </ActionButton>
                  )}
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard
            icon={Settings2}
            title="Conversion settings"
            description="Lower width and frame rate produce much smaller files."
            tone="violet"
          >
            <div className="space-y-4">
              <div>
                <span className={labelClass}>Output width</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {GIF_WIDTHS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateSetting({ width: item.value })}
                      aria-pressed={Number(settings.width) === item.value}
                      className={`rounded-lg border px-1.5 py-2 text-[13px] font-bold transition ${
                        Number(settings.width) === item.value
                          ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                  Height follows the source aspect ratio automatically.
                </p>
              </div>

              <div>
                <span className={labelClass}>Frame rate</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {GIF_FPS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateSetting({ fps: item.value })}
                      aria-pressed={Number(settings.fps) === item.value}
                      className={`rounded-lg border px-1 py-2 text-[13px] font-bold transition ${
                        Number(settings.fps) === item.value
                          ? "border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {item.value}
                    </button>
                  ))}
                </div>
              </div>

              <SliderRow
                label="Palette quality"
                value={settings.quality}
                min={1}
                max={30}
                step={1}
                onChange={(value) => updateSetting({ quality: value })}
                format={(value) => (value <= 5 ? `${value} · best` : value >= 24 ? `${value} · small` : `${value}`)}
                hint="Lower numbers keep more colours and create larger files."
                tone="violet"
              />

              <div>
                <span className={labelClass}>Playback speed</span>
                <Segmented
                  value={String(settings.speed)}
                  onChange={(value) => updateSetting({ speed: Number(value) })}
                  options={SPEEDS}
                  columns={5}
                  tone="violet"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="gif-loop">
                  Loop count
                </label>
                <input
                  id="gif-loop"
                  type="number"
                  min={0}
                  max={100}
                  value={loop}
                  onChange={(event) => setLoop(Math.max(0, Math.min(100, Number(event.target.value) || 0)))}
                  className={fieldClass(false, "violet")}
                />
                <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">0 means loop forever.</p>
              </div>

              <div>
                <span className={labelClass}>Frame fit</span>
                <Segmented
                  value={settings.fit}
                  onChange={(value) => updateSetting({ fit: value })}
                  options={[
                    { value: "contain", label: "Letterbox" },
                    { value: "cover", label: "Fill frame" },
                  ]}
                  columns={2}
                  tone="violet"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="gif-bg">
                  Letterbox colour
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="gif-bg"
                    value={settings.background}
                    onChange={(event) => updateSetting({ background: event.target.value })}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={settings.background}
                    onChange={(event) => updateSetting({ background: event.target.value })}
                    className={fieldClass(false, "violet")}
                    aria-label="Letterbox colour hex"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <ToggleRow
                  checked={settings.dither}
                  onChange={(value) => updateSetting({ dither: value })}
                  label="Floyd–Steinberg dithering"
                  description="Smooths gradients and reduces visible banding at the cost of a larger file."
                  tone="violet"
                />
                <ToggleRow
                  checked={settings.pingPong}
                  onChange={(value) => updateSetting({ pingPong: value })}
                  label="Ping-pong loop"
                  description="Play forward then backward. Doubles the frame count."
                  tone="violet"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <ActionButton
                  variant="primary"
                  tone="emerald"
                  icon={Sparkles}
                  onClick={generateGif}
                  disabled={!source || busy}
                  className="flex-1"
                >
                  {busy ? "Encoding…" : "Generate GIF"}
                </ActionButton>
                {busy && (
                  <ActionButton variant="danger" icon={X} onClick={cancelGeneration}>
                    Cancel
                  </ActionButton>
                )}
              </div>
            </div>
          </SectionCard>

          <Callout tone="violet" variant="tip" title="Smaller files, fast">
            A 6-second clip at 12 fps and 480 px wide is usually under 3 MB. Drop to 8 fps or trim to 3 seconds when a GIF
            needs to stay light for chat apps and forums.
          </Callout>

          <Callout tone="emerald" variant="success" title="Everything stays local">
            The video is decoded by your browser and the GIF is encoded by a worker on this page. No frame is uploaded and
            the result exists only until you reload the tab.
          </Callout>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      <FaqAccordion items={GIF_FAQS} tone="violet" />
    </div>
  );
}
