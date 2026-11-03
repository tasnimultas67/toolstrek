"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  Film,
  Gauge,
  HardDrive,
  Info,
  Loader2,
  Mic,
  MicOff,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  ScreenShare,
  Settings2,
  Square,
  Timer,
  Trash2,
  Webcam,
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
  labelClass,
} from "../_shared/toolkit/ToolKit";
import {
  BITRATE_OPTIONS,
  DEFAULT_RECORDER_SETTINGS,
  FRAME_RATES,
  MIME_CANDIDATES,
  RECORDER_FAQS,
  RECORDER_STORAGE_KEY,
  RESOLUTIONS,
  buildFileName,
  extensionForMime,
  formatBytes,
  formatDuration,
  mimeLabel,
  pickSupportedMime,
} from "./recorderData";

const TOOL_META = {
  title: "Screen Recorder",
  link: "/tools/screen-recorder",
  icon: "ScreenShare",
};

const WEBCAM_POSITIONS = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
];

export default function ScreenRecorder() {
  const { addRecentTool } = useRecentTools();

  const [settings, setSettings] = useState(DEFAULT_RECORDER_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState("idle");
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [recordings, setRecordings] = useState([]);
  const [supportedMimes, setSupportedMimes] = useState([]);
  const [micLevel, setMicLevel] = useState(0);

  const displayStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const drawFrameRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const pausedTotalRef = useRef(0);
  const elapsedRef = useRef(0);
  const recordingsRef = useRef([]);
  const screenVideoRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      const supported =
        typeof MediaRecorder !== "undefined"
          ? MIME_CANDIDATES.filter((candidate) => MediaRecorder.isTypeSupported(candidate.value))
          : [];
      let savedSettings = null;
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(RECORDER_STORAGE_KEY) : null;
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.settings) savedSettings = saved.settings;
        }
      } catch {
        // Ignore corrupt settings and use defaults.
      }
      setSupportedMimes(supported.map((candidate) => candidate.value));
      setSettings((current) => {
        const merged = { ...current, ...(savedSettings || {}) };
        if (supported.length && !supported.some((candidate) => candidate.value === merged.mime)) {
          merged.mime = supported[0].value;
        }
        return merged;
      });
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(RECORDER_STORAGE_KEY, JSON.stringify({ settings }));
    } catch {
      // Storage can be unavailable in private windows.
    }
  }, [settings, hydrated]);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  const stopTracks = useCallback(() => {
    [displayStreamRef, micStreamRef, webcamStreamRef].forEach((reference) => {
      reference.current?.getTracks().forEach((track) => track.stop());
      reference.current = null;
    });
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (drawFrameRef.current) {
      cancelAnimationFrame(drawFrameRef.current);
      drawFrameRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      window.clearInterval(countdownTimerRef.current);
      window.clearInterval(elapsedTimerRef.current);
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          // Ignore teardown races.
        }
      }
      stopTracks();
      recordingsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [stopTracks],
  );

  useEffect(() => {
    if (!settings.pauseOnBlur) return undefined;
    const onVisibility = () => {
      if (document.hidden && recorderRef.current?.state === "recording") {
        try {
          recorderRef.current.pause();
          pausedAtRef.current = Date.now();
          setStatus("paused");
        } catch {
          // Pause may not be supported; recording continues.
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [settings.pauseOnBlur]);

  const resolutions = useMemo(
    () => RESOLUTIONS.map((item) => ({ ...item, value: String(item.value) })),
    [],
  );

  const availableMimes = useMemo(
    () => MIME_CANDIDATES.filter((candidate) => supportedMimes.includes(candidate.value)),
    [supportedMimes],
  );

  const resolutionInfo = useMemo(
    () => RESOLUTIONS.find((item) => String(item.value) === String(settings.resolution)) || RESOLUTIONS[0],
    [settings.resolution],
  );

  const estimate = useMemo(() => {
    const bytesPerSecond = (Number(settings.bitrate) || 0) / 8;
    return formatBytes(bytesPerSecond * 60);
  }, [settings.bitrate]);

  const isRecording = status === "recording";
  const isPaused = status === "paused";
  const isBusy = status === "requesting" || status === "countdown" || status === "processing";

  const updateSetting = (patch) => setSettings((current) => ({ ...current, ...patch }));

  const startElapsedTimer = () => {
    window.clearInterval(elapsedTimerRef.current);
    startedAtRef.current = Date.now();
    pausedTotalRef.current = 0;
    pausedAtRef.current = 0;
    elapsedRef.current = 0;
    setElapsed(0);
    elapsedTimerRef.current = window.setInterval(() => {
      const now = Date.now();
      const pausedFor = pausedTotalRef.current + (pausedAtRef.current ? now - pausedAtRef.current : 0);
      const next = Math.max(0, now - startedAtRef.current - pausedFor);
      elapsedRef.current = next;
      setElapsed(next);
    }, 200);
  };

  const mixAudio = useCallback((display, mic) => {
    const displayAudio = display.getAudioTracks();
    const micAudio = mic?.getAudioTracks() || [];
    if (!displayAudio.length && !micAudio.length) return new MediaStream();

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return new MediaStream([...displayAudio, ...micAudio]);
    }
    const context = new AudioCtx();
    audioContextRef.current = context;
    const destination = context.createMediaStreamDestination();

    if (displayAudio.length) {
      const source = context.createMediaStreamSource(new MediaStream(displayAudio));
      source.connect(destination);
    }
    if (micAudio.length) {
      const source = context.createMediaStreamSource(new MediaStream(micAudio));
      const gain = context.createGain();
      gain.gain.value = Math.max(0, Math.min(2, (Number(settings.micGain) || 100) / 100));
      source.connect(gain);
      gain.connect(destination);

      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      gain.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!audioContextRef.current) return;
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        setMicLevel(Math.min(100, Math.round((average / 255) * 180)));
        window.requestAnimationFrame(tick);
      };
      tick();
    }
    return destination.stream;
  }, [settings.micGain]);

  const startCanvasCompositing = useCallback((display) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const sourceTrack = display.getVideoTracks()[0];
    const trackSettings = sourceTrack?.getSettings?.() || {};
    const targetWidth =
      resolutionInfo.width > 0 ? resolutionInfo.width : Math.max(640, Number(trackSettings.width) || 1280);
    const targetHeight =
      resolutionInfo.height > 0 ? resolutionInfo.height : Math.max(360, Number(trackSettings.height) || 720);

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");

    const draw = () => {
      if (!canvasRef.current || !context) return;
      const screen = screenVideoRef.current;
      const camera = webcamVideoRef.current;
      context.fillStyle = "#0f172a";
      context.fillRect(0, 0, targetWidth, targetHeight);

      if (screen && screen.readyState >= 2) {
        const ratio = Math.min(targetWidth / screen.videoWidth, targetHeight / screen.videoHeight);
        const width = screen.videoWidth * ratio;
        const height = screen.videoHeight * ratio;
        context.drawImage(screen, (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
      }

      if (camera && camera.readyState >= 2 && settings.webcam) {
        const bubble = Math.round((Math.min(targetWidth, targetHeight) * Number(settings.webcamSize)) / 100);
        const margin = Math.round(bubble * 0.16);
        const x = settings.webcamPosition.includes("left") ? margin : targetWidth - bubble - margin;
        const y = settings.webcamPosition.includes("top") ? margin : targetHeight - bubble - margin;

        context.save();
        context.beginPath();
        context.arc(x + bubble / 2, y + bubble / 2, bubble / 2, 0, Math.PI * 2);
        context.closePath();
        context.clip();
        if (settings.webcamMirror) {
          context.translate(x + bubble, y);
          context.scale(-1, 1);
          context.drawImage(camera, 0, 0, bubble, bubble);
        } else {
          context.drawImage(camera, x, y, bubble, bubble);
        }
        context.restore();

        context.beginPath();
        context.arc(x + bubble / 2, y + bubble / 2, bubble / 2, 0, Math.PI * 2);
        context.lineWidth = Math.max(3, bubble * 0.03);
        context.strokeStyle = "rgba(255,255,255,0.85)";
        context.stroke();
      }

      if (settings.showClock) {
        const now = new Date();
        const text = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        context.font = `700 ${Math.max(16, Math.round(targetWidth * 0.022))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        const padding = Math.round(targetWidth * 0.012);
        const metrics = context.measureText(text);
        const boxWidth = metrics.width + padding * 2;
        const boxHeight = Math.max(32, Math.round(targetWidth * 0.04));
        context.fillStyle = "rgba(15,23,42,0.72)";
        context.beginPath();
        context.roundRect(
          targetWidth - boxWidth - padding,
          padding,
          boxWidth,
          boxHeight,
          Math.round(boxHeight * 0.28),
        );
        context.fill();
        context.fillStyle = "#ffffff";
        context.textBaseline = "middle";
        context.fillText(text, targetWidth - boxWidth - padding + padding, padding + boxHeight / 2);
      }

      if (settings.showWatermark) {
        const text = "Toolstrek";
        context.font = `800 ${Math.max(14, Math.round(targetWidth * 0.018))}px system-ui, sans-serif`;
        const padding = Math.round(targetWidth * 0.012);
        context.fillStyle = "rgba(15,23,42,0.6)";
        const metrics = context.measureText(text);
        context.beginPath();
        context.roundRect(
          padding,
          targetHeight - Math.round(targetWidth * 0.04) - padding,
          metrics.width + padding * 2,
          Math.max(28, Math.round(targetWidth * 0.036)),
          Math.round(targetWidth * 0.01),
        );
        context.fill();
        context.fillStyle = "rgba(255,255,255,0.92)";
        context.textBaseline = "middle";
        context.fillText(text, padding * 2, targetHeight - Math.round(targetWidth * 0.04) - padding + Math.round(targetWidth * 0.018));
      }

      drawFrameRef.current = requestAnimationFrame(draw);
    };

    drawFrameRef.current = requestAnimationFrame(draw);
    const canvasStream = canvas.captureStream(Math.max(1, Number(settings.fps) || 30));
    return canvasStream.getVideoTracks()[0] || null;
  }, [
    resolutionInfo,
    settings.fps,
    settings.showClock,
    settings.showWatermark,
    settings.webcam,
    settings.webcamMirror,
    settings.webcamPosition,
    settings.webcamSize,
  ]);

  const runCountdown = useCallback(
    () =>
      new Promise((resolve) => {
        const from = Math.max(0, Math.min(10, Number(settings.countdown) || 0));
        if (!from) {
          resolve();
          return;
        }
        setStatus("countdown");
        setCountdown(from);
        let remaining = from;
        countdownTimerRef.current = window.setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            window.clearInterval(countdownTimerRef.current);
            setCountdown(0);
            resolve();
          } else {
            setCountdown(remaining);
          }
        }, 1000);
      }),
    [settings.countdown],
  );

  const finalizeRecording = useCallback(
    (mime) => {
      const blob = new Blob(chunksRef.current, { type: mime || "video/webm" });
      chunksRef.current = [];
      if (!blob.size) {
        setStatus("idle");
        setError("The recorder produced an empty file. Try a different format or browser.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const extension = extensionForMime(mime);
      const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        name: `${buildFileName()}.${extension}`,
        url,
        size: blob.size,
        duration: elapsedRef.current,
        mime: mime || "video/webm",
        createdAt: Date.now(),
      };
      setRecordings((current) => [entry, ...current]);
      setStatus("idle");
      setElapsed(0);
      setNotice("Recording ready. Preview or download it below.");
      toast.success("Recording finished.");
    },
    [],
  );

  const stopRecording = useCallback(() => {
    window.clearInterval(countdownTimerRef.current);
    window.clearInterval(elapsedTimerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      setStatus("processing");
      try {
        recorderRef.current.stop();
      } catch {
        setStatus("idle");
      }
    } else {
      setStatus("idle");
    }
    stopTracks();
    if (previewRef.current) previewRef.current.srcObject = null;
    setMicLevel(0);
  }, [stopTracks]);

  const startRecording = useCallback(async () => {
    setError("");
    setNotice("");

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      setError("This browser does not support screen capture. Use Chrome, Edge or another Chromium browser on desktop.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setError("MediaRecorder is not available in this browser, so recording cannot start.");
      return;
    }

    setStatus("requesting");
    let display = null;
    let mic = null;
    let webcam = null;

    try {
      const resolution = RESOLUTIONS.find((item) => String(item.value) === String(settings.resolution)) || RESOLUTIONS[0];
      const videoConstraints = { frameRate: Math.max(1, Number(settings.fps) || 30) };
      if (resolution.width) {
        videoConstraints.width = { ideal: resolution.width };
        videoConstraints.height = { ideal: resolution.height };
      }

      display = await navigator.mediaDevices.getDisplayMedia({
        video: videoConstraints,
        audio: settings.systemAudio
          ? { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
          : false,
        selfBrowserSurface: "include",
        surfaceSwitching: "include",
      });
      displayStreamRef.current = display;

      const displayTrack = display.getVideoTracks()[0];
      if (displayTrack) {
        displayTrack.addEventListener("ended", () => {
          if (recorderRef.current && recorderRef.current.state !== "inactive") {
            stopRecording();
            toast.info("Screen sharing ended, so the recording was stopped.");
          }
        });
      }

      if (settings.microphone) {
        try {
          mic = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });
          micStreamRef.current = mic;
        } catch {
          setNotice("Microphone permission was denied. Recording continues without narration.");
        }
      }

      const needsWebcam = Boolean(settings.webcam);
      if (needsWebcam) {
        try {
          webcam = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
          });
          webcamStreamRef.current = webcam;
        } catch {
          setNotice("Camera permission was denied. The recording continues without a webcam overlay.");
        }
      }

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = display;
        screenVideoRef.current.play().catch(() => {});
      }
      if (webcamVideoRef.current && webcam) {
        webcamVideoRef.current.srcObject = webcam;
        webcamVideoRef.current.play().catch(() => {});
      }
      if (previewRef.current) {
        previewRef.current.srcObject = display;
        previewRef.current.play().catch(() => {});
      }

      await runCountdown();

      const mixedAudio = mixAudio(display, mic);
      const composite = Boolean(settings.webcam && webcam) || settings.showClock || settings.showWatermark;
      let videoTrack = null;
      if (composite) {
        // Give the hidden video elements a frame to paint before capturing.
        await new Promise((resolve) => window.setTimeout(resolve, 260));
        videoTrack = startCanvasCompositing(display);
      }
      if (!videoTrack) {
        videoTrack = display.getVideoTracks()[0] || null;
      }
      if (!videoTrack) throw new Error("No video track is available from the selected source.");

      const recordStream = new MediaStream([videoTrack, ...mixedAudio.getAudioTracks()]);
      const mime = settings.mime || pickSupportedMime(availableMimes.length ? availableMimes : MIME_CANDIDATES);
      const options = {
        videoBitsPerSecond: Math.max(250000, Number(settings.bitrate) || 5000000),
        audioBitsPerSecond: 128000,
      };
      if (mime) options.mimeType = mime;

      const recorder = new MediaRecorder(recordStream, options);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = (event) => {
        setError(event?.error?.message || "The recorder stopped unexpectedly.");
        stopRecording();
      };
      recorder.onstop = () => finalizeRecording(recorder.mimeType || mime);
      recorder.start(1000);

      startElapsedTimer();
      setStatus("recording");
      setCountdown(0);
      toast.success("Recording started.");
    } catch (caught) {
      window.clearInterval(countdownTimerRef.current);
      stopTracks();
      if (previewRef.current) previewRef.current.srcObject = null;
      setStatus("idle");
      const name = caught?.name || "";
      if (name === "NotAllowedError") {
        setError("Screen sharing was cancelled or blocked. Choose a screen, window or tab to start recording.");
      } else if (name === "NotFoundError") {
        setError("No screen or window was available to record.");
      } else if (name === "NotReadableError") {
        setError("The selected surface could not be captured. Close other capture apps and try again.");
      } else {
        setError(caught?.message || "Recording could not start. Check browser permissions and try again.");
      }
    }
  }, [
    availableMimes,
    finalizeRecording,
    settings.bitrate,
    settings.fps,
    settings.microphone,
    settings.mime,
    settings.resolution,
    settings.showClock,
    settings.showWatermark,
    settings.systemAudio,
    settings.webcam,
    stopRecording,
    stopTracks,
    mixAudio,
    runCountdown,
    startCanvasCompositing,
  ]);

  const togglePause = () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === "recording") {
      recorder.pause();
      pausedAtRef.current = Date.now();
      setStatus("paused");
    } else if (recorder.state === "paused") {
      pausedTotalRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = 0;
      recorder.resume();
      setStatus("recording");
    }
  };

  const deleteRecording = (id) => {
    setRecordings((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  };

  const downloadRecording = (item) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const resetSettings = () => {
    const supported = availableMimes[0]?.value || DEFAULT_RECORDER_SETTINGS.mime;
    setSettings({ ...DEFAULT_RECORDER_SETTINGS, mime: supported });
    toast.success("Recorder settings reset.");
  };

  const lastRecording = recordings[0] || null;

  return (
    <div className="tool-page-content space-y-5">
      <Hero
        eyebrow="Capture studio"
        icon={ScreenShare}
        title="Screen Recorder"
        description="Record your screen, a window or a single tab — with system audio, microphone narration, a webcam bubble, timer and watermark. Everything is captured and encoded locally in your browser, with no uploads and no account."
        badges={["100% local capture", "Mic + system audio", "Webcam overlay", "No time limit"]}
        tone="rose"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-5">
          <SectionCard
            icon={Monitor}
            title="Preview & record"
            description="Choose a source when the browser asks. Keep the shared tab or window open while recording."
            tone="rose"
            actions={
              <>
                <Chip tone={isRecording ? "rose" : isPaused ? "amber" : "emerald"}>
                  {isRecording ? "Recording" : isPaused ? "Paused" : isBusy ? "Starting" : "Ready"}
                </Chip>
                <Chip tone="violet">{resolutionInfo.label}</Chip>
              </>
            }
          >
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800">
              <video
                ref={previewRef}
                muted
                playsInline
                className={`aspect-video w-full object-contain ${status === "idle" && !lastRecording ? "opacity-100" : ""}`}
              />

              {status === "idle" && !lastRecording && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/90 backdrop-blur">
                    <ScreenShare className="h-8 w-8" />
                  </span>
                  <p className="text-base font-black text-white">Nothing captured yet</p>
                  <p className="max-w-xs text-sm leading-relaxed text-slate-300">
                    Press Start recording and pick a screen, window or tab. Your recording never leaves this device.
                  </p>
                </div>
              )}

              {status === "countdown" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm">
                  <span className="text-6xl font-black text-white tabular-nums">{countdown}</span>
                  <span className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-rose-200">Starting soon</span>
                </div>
              )}

              {(isRecording || isPaused) && (
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-1.5 backdrop-blur">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${isPaused ? "bg-amber-400" : "animate-pulse bg-rose-500"}`}
                  />
                  <span className="font-mono text-sm font-bold text-white tabular-nums">{formatDuration(elapsed)}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {isPaused ? "Paused" : "Rec"}
                  </span>
                </div>
              )}

              {status === "processing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                  <p className="text-sm font-bold text-white">Packaging your file…</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {status === "idle" && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 px-6 py-3 text-base font-black text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                >
                  <Circle className="h-4 w-4 fill-current" />
                  Start recording
                </button>
              )}
              {(isRecording || isPaused) && (
                <>
                  <ActionButton
                    variant="primary"
                    tone="amber"
                    icon={isPaused ? Play : Pause}
                    onClick={togglePause}
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </ActionButton>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    Stop & save
                  </button>
                </>
              )}
              {status === "requesting" && (
                <ActionButton icon={Loader2} disabled>
                  Waiting for permission…
                </ActionButton>
              )}
              {status === "processing" && (
                <ActionButton icon={Loader2} disabled>
                  Finalising…
                </ActionButton>
              )}
              {(isRecording || isPaused) && (
                <ActionButton icon={Timer} disabled>
                  {formatDuration(elapsed)}
                </ActionButton>
              )}
            </div>

            {error && (
              <div className="mt-3">
                <Callout tone="rose" variant="warning" title="Recording problem">
                  {error}
                </Callout>
              </div>
            )}
            {notice && !error && (
              <div className="mt-3">
                <Callout tone="amber" variant="info" title="Heads up">
                  {notice}
                </Callout>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Format" value={mimeLabel(settings.mime).split(" · ")[0]} tone="rose" />
              <Stat label="Frame rate" value={`${settings.fps} fps`} tone="violet" />
              <Stat label="Resolution" value={resolutionInfo.label} tone="sky" />
              <Stat label="Per minute" value={`~${estimate}`} tone="emerald" />
            </div>
          </SectionCard>

          {lastRecording && (
            <SectionCard
              icon={Film}
              title="Latest recording"
              description="Preview the file before downloading. It exists only in this tab."
              tone="emerald"
              actions={
                <>
                  <ActionButton variant="primary" tone="emerald" icon={Download} onClick={() => downloadRecording(lastRecording)}>
                    Download
                  </ActionButton>
                  <ActionButton variant="ghost" icon={Trash2} onClick={() => deleteRecording(lastRecording.id)}>
                    Delete
                  </ActionButton>
                </>
              }
            >
              <video
                src={lastRecording.url}
                controls
                playsInline
                className="aspect-video w-full rounded-xl bg-slate-950"
              />
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="File size" value={formatBytes(lastRecording.size)} tone="emerald" icon={HardDrive} />
                <Stat label="Duration" value={formatDuration(lastRecording.duration)} tone="emerald" icon={Clock} />
                <Stat label="Container" value={extensionForMime(lastRecording.mime).toUpperCase()} tone="violet" />
                <Stat
                  label="Created"
                  value={new Date(lastRecording.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  tone="sky"
                />
              </div>
            </SectionCard>
          )}

          <SectionCard
            icon={Settings2}
            title="Capture settings"
            description="Set up sources, quality and overlays before you press record."
            tone="violet"
          >
            <div className="space-y-4">
              <div>
                <span className={labelClass}>Output format</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(availableMimes.length ? availableMimes : MIME_CANDIDATES.slice(0, 1)).map((candidate) => (
                    <button
                      key={candidate.value}
                      type="button"
                      onClick={() => updateSetting({ mime: candidate.value })}
                      disabled={isRecording || isPaused}
                      className={`rounded-xl border p-2.5 text-left transition disabled:opacity-60 ${
                        settings.mime === candidate.value
                          ? "border-violet-400 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/40"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50"
                      }`}
                      aria-pressed={settings.mime === candidate.value}
                    >
                      <span className="block text-sm font-black text-slate-900 dark:text-white">{candidate.label}</span>
                      <span className="block text-sm text-slate-500 dark:text-slate-400">{candidate.blurb}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className={labelClass}>Resolution</span>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                  {resolutions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateSetting({ resolution: item.value })}
                      disabled={isRecording || isPaused}
                      className={`rounded-lg border px-1.5 py-2 text-sm font-black transition disabled:opacity-60 ${
                        String(settings.resolution) === item.value
                          ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                      aria-pressed={String(settings.resolution) === item.value}
                      title={item.blurb}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className={labelClass}>Frame rate</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {FRAME_RATES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateSetting({ fps: item.value })}
                      disabled={isRecording || isPaused}
                      className={`rounded-lg border px-1.5 py-2 text-sm font-black transition disabled:opacity-60 ${
                        Number(settings.fps) === item.value
                          ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                          : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                      aria-pressed={Number(settings.fps) === item.value}
                      title={item.blurb}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className={labelClass}>Video bitrate</span>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                  {BITRATE_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateSetting({ bitrate: item.value })}
                      disabled={isRecording || isPaused}
                      className={`rounded-lg border px-1.5 py-2 text-sm font-bold transition disabled:opacity-60 ${
                        Number(settings.bitrate) === item.value
                          ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
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

              <div className="space-y-2">
                <ToggleRow
                  checked={settings.systemAudio}
                  onChange={(value) => updateSetting({ systemAudio: value })}
                  label="Record system / tab audio"
                  description="Include the sound playing in the shared tab or desktop. Availability depends on the browser and OS."
                  tone="violet"
                />
                <ToggleRow
                  checked={settings.microphone}
                  onChange={(value) => updateSetting({ microphone: value })}
                  label="Record microphone narration"
                  description="Mix your voice into the recording. The browser asks for microphone permission when you start."
                  tone="violet"
                />
                {settings.microphone && (
                  <>
                    <SliderRow
                      label="Microphone gain"
                      value={settings.micGain}
                      min={0}
                      max={200}
                      step={5}
                      onChange={(value) => updateSetting({ micGain: value })}
                      format={(value) => `${value}%`}
                      tone="violet"
                    />
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Input level</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all"
                          style={{ width: `${micLevel}%` }}
                        />
                      </span>
                      {micLevel > 0 ? (
                        <Mic className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <MicOff className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </>
                )}
                <ToggleRow
                  checked={settings.webcam}
                  onChange={(value) => updateSetting({ webcam: value })}
                  label="Webcam overlay"
                  description="Draw your camera as a circular picture-in-picture bubble over the screen."
                  tone="violet"
                />
                {settings.webcam && (
                  <>
                    <SliderRow
                      label="Webcam bubble size"
                      value={settings.webcamSize}
                      min={10}
                      max={40}
                      step={1}
                      onChange={(value) => updateSetting({ webcamSize: value })}
                      format={(value) => `${value}%`}
                      tone="violet"
                    />
                    <Segmented
                      label="Bubble position"
                      value={settings.webcamPosition}
                      onChange={(value) => updateSetting({ webcamPosition: value })}
                      options={WEBCAM_POSITIONS}
                      columns={2}
                      tone="violet"
                    />
                    <ToggleRow
                      checked={settings.webcamMirror}
                      onChange={(value) => updateSetting({ webcamMirror: value })}
                      label="Mirror webcam"
                      description="Flip the camera horizontally, like a selfie view."
                      tone="violet"
                    />
                  </>
                )}
                <ToggleRow
                  checked={settings.showClock}
                  onChange={(value) => updateSetting({ showClock: value })}
                  label="Live clock overlay"
                  description="Burn a running clock into the top-right corner of the recording."
                  tone="violet"
                />
                <ToggleRow
                  checked={settings.showWatermark}
                  onChange={(value) => updateSetting({ showWatermark: value })}
                  label="Toolstrek watermark"
                  description="Add a subtle brand label in the bottom-left corner."
                  tone="violet"
                />
                <ToggleRow
                  checked={settings.pauseOnBlur}
                  onChange={(value) => updateSetting({ pauseOnBlur: value })}
                  label="Pause when tab is hidden"
                  description="Automatically pause if you switch away from this tab while recording."
                  tone="violet"
                />
              </div>

              <SliderRow
                label="Countdown before recording"
                value={settings.countdown}
                min={0}
                max={10}
                step={1}
                onChange={(value) => updateSetting({ countdown: value })}
                format={(value) => (value === 0 ? "Off" : `${value}s`)}
                tone="violet"
                hint="Gives you time to arrange windows after choosing a source."
              />

              <ActionButton icon={RotateCcw} onClick={resetSettings} disabled={isRecording || isPaused}>
                Reset settings
              </ActionButton>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard
            icon={Gauge}
            title="Quick start"
            description="Three steps to a clean local recording."
            tone="amber"
          >
            <ol className="space-y-3">
              {[
                {
                  icon: Monitor,
                  title: "Pick a source",
                  text: "Start recording, then choose Entire screen, Window or Chrome tab in the browser picker.",
                },
                {
                  icon: Mic,
                  title: "Choose your audio",
                  text: "Tick system audio for tab sound and microphone for narration. Both are mixed into one track.",
                },
                {
                  icon: Download,
                  title: "Stop and download",
                  text: "Press Stop & save. The file is packaged locally and listed below for preview and download.",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {index + 1}. {step.title}
                    </p>
                    <p className="text-sm leading-snug text-slate-500 dark:text-slate-400">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              Tip: record a single browser tab to keep notifications and other windows out of the video.
            </div>
          </SectionCard>

          <SectionCard
            icon={Film}
            title={`This session (${recordings.length})`}
            description="Recordings live in memory only. Download anything you want to keep."
            tone="rose"
            actions={
              recordings.length > 0 ? (
                <ActionButton
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => {
                    recordings.forEach((item) => URL.revokeObjectURL(item.url));
                    setRecordings([]);
                    toast.success("All recordings removed from this session.");
                  }}
                >
                  Clear all
                </ActionButton>
              ) : null
            }
          >
            {recordings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No recordings yet. Finished captures will appear here with their size and duration.
              </p>
            ) : (
              <div className="space-y-2">
                {recordings.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900 dark:text-white">{item.name}</p>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                          {formatBytes(item.size)} · {formatDuration(item.duration)} ·{" "}
                          {extensionForMime(item.mime).toUpperCase()}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => downloadRecording(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                          aria-label={`Download ${item.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRecording(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <Callout tone="rose" variant="info" title="Privacy by design">
            <span className="inline-flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Screen frames, microphone audio and camera video are processed with browser APIs only. Nothing is
              uploaded, and recordings can never be recovered after you close this tab.
            </span>
          </Callout>

          <Callout tone="amber" variant="warning" title="Browser support">
            <span className="inline-flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Chromium desktop browsers offer the best experience, including tab audio. On macOS, enable screen
              recording permission for the browser in System Settings before your first capture.
            </span>
          </Callout>

          <Callout tone="violet" variant="tip" title="Performance">
            <span className="inline-flex items-start gap-1.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Webcam overlays, the clock and the watermark are rendered on a canvas, which uses more CPU. For long
              recordings prefer 1080p at 30 fps without overlays.
            </span>
          </Callout>
        </div>
      </div>

      <video ref={screenVideoRef} muted playsInline className="hidden" aria-hidden="true" />
      <video ref={webcamVideoRef} muted playsInline className="hidden" aria-hidden="true" />
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      <FaqAccordion items={RECORDER_FAQS} tone="rose" />
    </div>
  );
}
