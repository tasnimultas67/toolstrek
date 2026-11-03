"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  AudioWaveform,
  Camera,
  CameraOff,
  Circle,
  Clock,
  Download,
  Gauge,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  MonitorPlay,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Square,
  Timer,
  Trash2,
  Video,
  Volume2,
  Wand2,
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
  Stat,
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import {
  BITRATES,
  CAMERA_RESOLUTIONS,
  DEFAULT_VOICE_SETTINGS,
  RECORD_FORMATS,
  SAMPLE_RATES,
  VOICE_FAQS,
  VOICE_STORAGE_KEY,
  buildDemoRecording,
  downloadBlob,
  encodeWavFromBuffer,
  formatBytes,
  formatDuration,
  pickMime,
  supportedFormats,
} from "./voiceRecorderData";

const TOOL_META = { title: "Voice Recorder & Mic / Camera Test", link: "/tools/voice-recorder", icon: "Mic" };

const TABS = [
  { value: "record", label: "Voice recorder", icon: <Mic className="h-4 w-4" /> },
  { value: "mic", label: "Mic test", icon: <AudioWaveform className="h-4 w-4" /> },
  { value: "camera", label: "Camera test", icon: <Video className="h-4 w-4" /> },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const dbFromRms = (rms) => {
  if (!rms || rms <= 0) return -100;
  return Math.max(-100, 20 * Math.log10(rms));
};

const qualityLabel = (score) => {
  if (score >= 85) return { label: "Excellent", tone: "emerald" };
  if (score >= 65) return { label: "Good", tone: "sky" };
  if (score >= 45) return { label: "Fair", tone: "amber" };
  return { label: "Weak", tone: "rose" };
};

export default function VoiceRecorderStudio() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("record");
  const [settings, setSettings] = useState(DEFAULT_VOICE_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [supported, setSupported] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [status, setStatus] = useState("idle");
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [micRunning, setMicRunning] = useState(false);
  const [micStats, setMicStats] = useState({ rms: -100, peak: -100, floor: -100, clips: 0, score: 0 });
  const [demoMic, setDemoMic] = useState(false);

  const [cameraRunning, setCameraRunning] = useState(false);
  const [demoCamera, setDemoCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraFps, setCameraFps] = useState(0);
  const [cameraSize, setCameraSize] = useState("");
  const [snapshot, setSnapshot] = useState("");

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const micTestStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const rafRef = useRef(0);
  const frameRef = useRef(0);
  const startedAtRef = useRef(0);
  const pausedTotalRef = useRef(0);
  const pausedAtRef = useRef(0);
  const elapsedRef = useRef(0);
  const recordingsRef = useRef([]);
  const countdownRef = useRef(null);
  const timerRef = useRef(null);
  const micSamplesRef = useRef({ sum: 0, count: 0, peak: 0, floor: 0, clips: 0 });
  const recorderWaveRef = useRef(null);
  const micWaveRef = useRef(null);
  const micBarsRef = useRef(null);
  const videoRef = useRef(null);
  const demoCanvasRef = useRef(null);
  const previewWrapRef = useRef(null);
  const fpsRef = useRef({ frames: 0, last: 0, value: 0 });

  const resolvedFormat = useMemo(
    () => RECORD_FORMATS.find((item) => item.value === settings.format) || RECORD_FORMATS[0],
    [settings.format],
  );

  const updateSetting = useCallback((patch) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      setSupported(supportedFormats());
      try {
        const raw = window.localStorage.getItem(VOICE_STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.settings) setSettings((current) => ({ ...current, ...saved.settings }));
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
      window.localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify({ settings }));
    } catch {
      // Private windows may block storage.
    }
  }, [settings, hydrated]);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const audio = deviceList.filter((device) => device.kind === "audioinput");
      const video = deviceList.filter((device) => device.kind === "videoinput");
      setAudioDevices(audio);
      setVideoDevices(video);
    } catch {
      // Device enumeration can fail before permission is granted.
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => refreshDevices(), 0);
    const handler = () => refreshDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", handler);
    return () => {
      window.clearTimeout(timer);
      navigator.mediaDevices?.removeEventListener?.("devicechange", handler);
    };
  }, [refreshDevices]);

  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error("Web Audio is not supported in this browser.");
      audioContextRef.current = new Context();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }
    return audioContextRef.current;
  }, []);

  const createAnalyser = useCallback(
    (stream) => {
      const context = ensureAudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      return analyser;
    },
    [ensureAudioContext],
  );

  const stopStream = useCallback((reference) => {
    reference.current?.getTracks().forEach((track) => track.stop());
    reference.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    window.clearInterval(countdownRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {
        // Ignore races while stopping.
      }
    }
    stopStream(streamRef);
    analyserRef.current = null;
    setStatus("idle");
    setCountdown(0);
    setLevel(0);
    setPeakLevel(0);
  }, [stopStream]);

  useEffect(
    () => () => {
      window.clearInterval(countdownRef.current);
      window.clearInterval(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          // Ignore teardown races.
        }
      }
      stopStream(streamRef);
      stopStream(micTestStreamRef);
      stopStream(cameraStreamRef);
      recordingsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
      audioContextRef.current?.close?.().catch(() => {});
    },
    [stopStream],
  );

  /* ------------------------------------------------------------------ */
  /*  Live level + waveform rendering                                    */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const analyser =
      status === "recording" || status === "paused" ? analyserRef.current : micRunning ? micAnalyserRef.current : null;
    const isDemo = demoMic && !micRunning;
    if (!analyser && !isDemo) return undefined;

    let active = true;
    let lastSample = 0;
    const tick = (time) => {
      if (!active) return;
      rafRef.current = requestAnimationFrame(tick);

      if (analyser) {
        const buffer = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i += 1) {
          const centred = (buffer[i] - 128) / 128;
          sum += centred * centred;
        }
        const rms = Math.sqrt(sum / buffer.length);
        const db = dbFromRms(rms);
        drawWaveform(recorderWaveRef.current, buffer, "#34d399");
        drawWaveform(micWaveRef.current, buffer, "#38bdf8");
        drawBars(micBarsRef.current, analyser);

        if (time - lastSample > 120) {
          lastSample = time;
          const normalised = clamp((db + 60) / 60, 0, 1);
          setLevel(Math.round(normalised * 100));
          setPeakLevel((current) => Math.max(current, Math.round(normalised * 100)));

          if (micRunning && micAnalyserRef.current) {
            const samples = micSamplesRef.current;
            samples.sum += rms;
            samples.count += 1;
            samples.peak = Math.max(samples.peak, rms);
            samples.floor = samples.count === 1 ? rms : Math.min(samples.floor, rms);
            if (rms > 0.98) samples.clips += 1;
            const avgRms = samples.sum / samples.count;
            const averageDb = dbFromRms(avgRms);
            const peakDb = dbFromRms(samples.peak);
            const clipped = samples.clips > 0;
            let score = 100;
            if (averageDb < -40) score -= 40;
            else if (averageDb < -28) score -= 22;
            else if (averageDb > -8) score -= 20;
            if (peakDb > -1) score -= 20;
            if (clipped) score -= 15;
            if (samples.floor > -55) score -= 15;
            setMicStats({
              rms: Math.round(averageDb),
              peak: Math.round(peakDb),
              floor: Math.round(dbFromRms(samples.floor)),
              clips: samples.clips,
              score: clamp(Math.round(score), 0, 100),
            });
          }
        }
      } else if (isDemo) {
        const phase = time / 180;
        drawDemoWave(recorderWaveRef.current, time, "#34d399");
        drawDemoWave(micWaveRef.current, time, "#38bdf8");
        drawDemoBars(micBarsRef.current, time);
        if (time - lastSample > 120) {
          lastSample = time;
          const wave = (Math.sin(phase) + Math.sin(phase * 2.7) * 0.35 + 1) / 2.7;
          const normalised = clamp(0.2 + wave * 0.55 + Math.random() * 0.06, 0, 1);
          setLevel(Math.round(normalised * 100));
          setPeakLevel((current) => Math.max(current, Math.round(normalised * 100)));
          if (micRunning || tab === "mic") {
            setMicStats({
              rms: -22 + Math.round(Math.sin(phase) * 3),
              peak: -6,
              floor: -62,
              clips: 0,
              score: 88,
            });
          }
        }
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [status, micRunning, demoMic, tab]);

  /* ------------------------------------------------------------------ */
  /*  Recording                                                          */
  /* ------------------------------------------------------------------ */

  const finaliseRecording = useCallback(
    async (blob, mime) => {
      let output = blob;
      let outputMime = mime || "audio/webm";
      let outputFormat = resolvedFormat.value;
      if (resolvedFormat.value === "wav") {
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const context = ensureAudioContext();
          const decoded = await context.decodeAudioData(arrayBuffer.slice(0));
          output = encodeWavFromBuffer(decoded);
          outputMime = "audio/wav";
          outputFormat = "wav";
        } catch {
          outputFormat = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
          outputMime = blob.type;
        }
      }
      const item = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: `Recording ${recordingsRef.current.length + 1}`,
        url: URL.createObjectURL(output),
        blob: output,
        size: output.size,
        mime: outputMime,
        ext: outputFormat === "m4a" ? "m4a" : outputFormat,
        duration: elapsedRef.current,
        createdAt: Date.now(),
        demo: false,
      };
      setRecordings((current) => [item, ...current]);
      toast.success("Recording saved to this tab");
    },
    [ensureAudioContext, resolvedFormat.value],
  );

  const beginRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not expose microphone capture. Try Chrome, Edge or Firefox on HTTPS.");
      return;
    }
    setError("");
    setNotice("");
    setStatus("requesting");
    try {
      const constraints = {
        audio: {
          deviceId: settings.deviceId ? { exact: settings.deviceId } : undefined,
          echoCancellation: settings.echoCancellation,
          noiseSuppression: settings.noiseSuppression,
          autoGainControl: settings.autoGainControl,
          channelCount: Number(settings.channelCount),
          sampleRate: Number(settings.sampleRate) || undefined,
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      await refreshDevices();
      const analyser = createAnalyser(stream);
      analyserRef.current = analyser;
      setPeakLevel(0);

      const mime = resolvedFormat.candidates.length ? pickMime(settings.format, supported) : "";
      if (resolvedFormat.candidates.length && !mime) {
        throw new Error("This browser cannot encode the selected format. Pick WAV or another format.");
      }

      const recorder = new MediaRecorder(
        stream,
        mime
          ? { mimeType: mime, audioBitsPerSecond: Number(settings.bitrate) || 128000 }
          : { audioBitsPerSecond: Number(settings.bitrate) || 128000 },
      );
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        window.clearInterval(timerRef.current);
        const chunks = chunksRef.current;
        chunksRef.current = [];
        if (chunks.length) {
          const blob = new Blob(chunks, { type: recorder.mimeType || mime || "audio/webm" });
          await finaliseRecording(blob, recorder.mimeType || mime);
        }
        recorderRef.current = null;
      };
      recorder.onerror = () => {
        setError("The recording engine stopped unexpectedly. Try a different format.");
        stopRecording();
      };

      const start = () => {
        try {
          recorder.start(250);
          startedAtRef.current = Date.now();
          pausedTotalRef.current = 0;
          pausedAtRef.current = 0;
          elapsedRef.current = 0;
          setElapsed(0);
          setStatus("recording");
          timerRef.current = window.setInterval(() => {
            const now = Date.now();
            const value =
              now - startedAtRef.current - pausedTotalRef.current - (pausedAtRef.current ? now - pausedAtRef.current : 0);
            elapsedRef.current = value;
            setElapsed(value);
          }, 200);
          setNotice("Recording is running locally. Nothing is uploaded.");
        } catch (err) {
          setError(err.message || "Could not start recording.");
          stopRecording();
        }
      };

      if (settings.countdown) {
        let next = 3;
        setCountdown(next);
        setStatus("countdown");
        countdownRef.current = window.setInterval(() => {
          next -= 1;
          if (next <= 0) {
            window.clearInterval(countdownRef.current);
            setCountdown(0);
            start();
          } else {
            setCountdown(next);
          }
        }, 800);
      } else {
        start();
      }
    } catch (err) {
      setError(
        err?.name === "NotAllowedError"
          ? "Microphone permission was blocked. Allow access in the browser address bar and try again."
          : err?.message || "Could not open the microphone.",
      );
      setStatus("idle");
      stopStream(streamRef);
    }
  }, [
    createAnalyser,
    finaliseRecording,
    refreshDevices,
    resolvedFormat,
    settings,
    stopRecording,
    stopStream,
    supported,
  ]);

  const togglePause = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === "recording") {
      recorder.pause();
      pausedAtRef.current = Date.now();
      setStatus("paused");
    } else if (recorder.state === "paused") {
      recorder.resume();
      pausedTotalRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = 0;
      setStatus("recording");
    }
  }, []);

  const loadDemoRecording = useCallback(async () => {
    try {
      const blob = await buildDemoRecording();
      const item = {
        id: `demo-${Date.now()}`,
        name: "Demo melody (4 seconds)",
        url: URL.createObjectURL(blob),
        blob,
        size: blob.size,
        mime: "audio/wav",
        ext: "wav",
        duration: 4000,
        createdAt: Date.now(),
        demo: true,
      };
      setRecordings((current) => [item, ...current]);
      toast.success("Demo audio generated on your device");
    } catch (err) {
      toast.error(err.message || "Could not generate demo audio.");
    }
  }, []);

  const deleteRecording = useCallback((id) => {
    setRecordings((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const renameRecording = useCallback((id, name) => {
    setRecordings((current) => current.map((item) => (item.id === id ? { ...item, name } : item)));
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Mic test                                                           */
  /* ------------------------------------------------------------------ */

  const startMicTest = useCallback(async () => {
    setError("");
    setDemoMic(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone capture is unavailable in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: settings.deviceId ? { exact: settings.deviceId } : undefined,
          echoCancellation: settings.echoCancellation,
          noiseSuppression: settings.noiseSuppression,
          autoGainControl: settings.autoGainControl,
          channelCount: Number(settings.channelCount),
        },
      });
      micTestStreamRef.current = stream;
      const analyser = createAnalyser(stream);
      micAnalyserRef.current = analyser;
      micSamplesRef.current = { sum: 0, count: 0, peak: 0, floor: 0, clips: 0 };
      setMicRunning(true);
      setPeakLevel(0);
      await refreshDevices();
      setNotice("Speak normally for ten seconds to get a stable reading.");
    } catch (err) {
      setError(
        err?.name === "NotAllowedError"
          ? "Microphone permission was blocked. Allow access and try again."
          : err?.message || "Could not open the microphone.",
      );
    }
  }, [createAnalyser, refreshDevices, settings]);

  const stopMicTest = useCallback(() => {
    stopStream(micTestStreamRef);
    micAnalyserRef.current = null;
    setMicRunning(false);
    setLevel(0);
  }, [stopStream]);

  /* ------------------------------------------------------------------ */
  /*  Camera test                                                        */
  /* ------------------------------------------------------------------ */

  const startFpsCounter = useCallback(() => {
    fpsRef.current = { frames: 0, last: performance.now(), value: 0 };
    const video = videoRef.current;
    const countFrame = () => {
      fpsRef.current.frames += 1;
      const now = performance.now();
      if (now - fpsRef.current.last >= 1000) {
        setCameraFps(Math.round((fpsRef.current.frames * 1000) / (now - fpsRef.current.last)));
        fpsRef.current.frames = 0;
        fpsRef.current.last = now;
      }
      if (videoRef.current?.srcObject) {
        if (typeof videoRef.current.requestVideoFrameCallback === "function") {
          videoRef.current.requestVideoFrameCallback(countFrame);
        } else {
          requestAnimationFrame(countFrame);
        }
      }
    };
    if (typeof video?.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback(countFrame);
    } else {
      requestAnimationFrame(countFrame);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");
    setDemoCamera(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera capture is unavailable in this browser.");
      return;
    }
    const resolution = CAMERA_RESOLUTIONS.find((item) => item.value === settings.cameraResolution) || CAMERA_RESOLUTIONS[1];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: settings.videoDeviceId ? { exact: settings.videoDeviceId } : undefined,
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
        },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      const track = stream.getVideoTracks()[0];
      const trackSettings = track?.getSettings?.() || {};
      setCameraSize(trackSettings.width && trackSettings.height ? `${trackSettings.width} × ${trackSettings.height}` : "");
      setCameraRunning(true);
      setSnapshot("");
      await refreshDevices();
      startFpsCounter();
    } catch (err) {
      setCameraError(
        err?.name === "NotAllowedError"
          ? "Camera permission was blocked. Allow access in the address bar and try again."
          : err?.name === "NotReadableError"
            ? "The camera is already in use by another application."
            : err?.message || "Could not open the camera.",
      );
    }
  }, [refreshDevices, settings.cameraResolution, settings.videoDeviceId, startFpsCounter]);

  const stopCamera = useCallback(() => {
    stopStream(cameraStreamRef);
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraRunning(false);
    setCameraFps(0);
    setCameraSize("");
  }, [stopStream]);

  const toggleDemoCamera = useCallback(() => {
    if (demoCamera) {
      setDemoCamera(false);
      return;
    }
    stopCamera();
    setCameraError("");
    setSnapshot("");
    setCameraFps(30);
    setCameraSize("1280 × 720 (synthetic)");
    setDemoCamera(true);
  }, [demoCamera, stopCamera]);

  useEffect(() => {
    if (!demoCamera) return undefined;
    let active = true;
    const canvas = demoCanvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    const draw = (time) => {
      if (!active) return;
      drawTestFeed(canvas, context, time);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [demoCamera]);

  const takeSnapshot = useCallback(() => {
    const width = demoCamera ? demoCanvasRef.current?.width : videoRef.current?.videoWidth;
    const height = demoCamera ? demoCanvasRef.current?.height : videoRef.current?.videoHeight;
    if (!width || !height) {
      toast.error("Start the camera or the demo feed first.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (settings.mirrorCamera) {
      context.translate(width, 0);
      context.scale(-1, 1);
    }
    if (demoCamera) {
      drawTestFeed(canvas, context, performance.now());
    } else {
      context.drawImage(videoRef.current, 0, 0, width, height);
    }
    const url = canvas.toDataURL("image/png");
    setSnapshot(url);
    toast.success("Snapshot captured");
  }, [demoCamera, settings.mirrorCamera]);

  const downloadSnapshot = useCallback(() => {
    if (!snapshot) return;
    const anchor = document.createElement("a");
    anchor.href = snapshot;
    anchor.download = `camera-snapshot-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success("Snapshot downloaded");
  }, [snapshot]);

  const openFullscreen = useCallback(() => {
    const element = previewWrapRef.current;
    if (!element?.requestFullscreen) {
      toast.error("Fullscreen is not available in this browser.");
      return;
    }
    element.requestFullscreen().catch(() => toast.error("Could not enter fullscreen."));
  }, []);

  const formatOptions = useMemo(
    () => RECORD_FORMATS.filter((format) => !supported.length || supported.includes(format.value)),
    [supported],
  );

  const recordingBusy = status === "requesting" || status === "countdown" || status === "recording" || status === "paused";
  const quality = qualityLabel(micStats.score);
  const levelPercent = clamp(level, 0, 100);

  return (
    <div className="tool-page-content space-y-5">
      <Hero
        eyebrow="Audio & camera lab"
        icon={Mic}
        title="Voice Recorder, Mic Test & Camera Test"
        description="Record voice notes, inspect your microphone signal and check your webcam — all in one private studio. Every permission is requested only when you press start, and nothing is uploaded."
        badges={["Local recording", "Live dB meter", "Webcam snapshot", "No account"]}
        tone="emerald"
      />

      <Segmented value={tab} onChange={setTab} options={TABS} columns={3} tone="emerald" aria-label="Studio mode" />

      {error && (
        <Callout tone="rose" variant="warning" title="Something needs attention">
          {error}
        </Callout>
      )}

      {tab === "record" && (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <SectionCard
              icon={Mic}
              title="Recording studio"
              description="Press record, speak, then download the result. Recordings live only in this tab."
              tone="emerald"
              actions={
                <>
                  <Chip tone={status === "recording" ? "emerald" : status === "paused" ? "amber" : "sky"}>
                    {status === "recording"
                      ? "Recording"
                      : status === "paused"
                        ? "Paused"
                        : status === "countdown"
                          ? "Starting"
                          : status === "requesting"
                            ? "Waiting"
                            : "Ready"}
                  </Chip>
                  <Chip tone="violet">{resolvedFormat.label}</Chip>
                </>
              }
            >
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-4 dark:border-slate-800 sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_60%)]" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[13px] font-bold text-white/90">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          status === "recording" ? "animate-pulse bg-emerald-400" : status === "paused" ? "bg-amber-400" : "bg-slate-400"
                        }`}
                      />
                      {status === "recording" ? "Live input" : status === "paused" ? "Paused" : "Input monitor"}
                    </span>
                    <span className="font-mono text-xl font-black tabular-nums text-white sm:text-2xl">
                      {formatDuration(elapsed)}
                    </span>
                  </div>

                  <canvas
                    ref={recorderWaveRef}
                    className="mt-3 h-28 w-full rounded-xl bg-slate-900/50 sm:h-36"
                    aria-label="Live microphone waveform"
                  />

                  <div className="mt-3 flex items-center gap-2">
                    <Volume2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-[width] duration-75"
                        style={{ width: `${levelPercent}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-[13px] font-bold tabular-nums text-emerald-200">
                      {levelPercent}%
                    </span>
                  </div>

                  {status === "countdown" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-slate-950/80">
                      <span className="text-6xl font-black tabular-nums text-white">{countdown}</span>
                      <span className="mt-1 text-[13px] font-bold uppercase tracking-[0.2em] text-emerald-200">
                        Get ready
                      </span>
                    </div>
                  )}

                  {!recordingBusy && !elapsed && (
                    <p className="mt-3 text-center text-[13px] leading-relaxed text-slate-400">
                      The waveform stays quiet until you start. Choose a format and press record.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {status === "idle" && (
                  <ActionButton variant="primary" tone="emerald" icon={Circle} onClick={beginRecording}>
                    Start recording
                  </ActionButton>
                )}
                {status === "requesting" && (
                  <ActionButton icon={Loader2} disabled>
                    Waiting for permission…
                  </ActionButton>
                )}
                {status === "countdown" && (
                  <ActionButton icon={Timer} disabled>
                    Recording in {countdown}…
                  </ActionButton>
                )}
                {(status === "recording" || status === "paused") && (
                  <>
                    <ActionButton variant="primary" tone="amber" icon={status === "paused" ? Play : Pause} onClick={togglePause}>
                      {status === "paused" ? "Resume" : "Pause"}
                    </ActionButton>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      <Square className="h-4 w-4 fill-current" />
                      Stop & keep
                    </button>
                  </>
                )}
                <ActionButton
                  icon={Wand2}
                  onClick={loadDemoRecording}
                  disabled={status === "recording" || status === "paused"}
                >
                  Load demo audio
                </ActionButton>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="Duration" value={formatDuration(elapsed)} tone="emerald" icon={Clock} />
                <Stat label="Format" value={resolvedFormat.label} tone="violet" icon={AudioWaveform} />
                <Stat label="Peak" value={`${peakLevel}%`} tone="sky" icon={Gauge} />
                <Stat label="Channels" value={Number(settings.channelCount) === 1 ? "Mono" : "Stereo"} tone="amber" icon={Radio} />
              </div>

              {notice && !error && (
                <div className="mt-3">
                  <Callout tone="emerald" variant="success" title="Studio ready">
                    {notice}
                  </Callout>
                </div>
              )}
            </SectionCard>

            <SectionCard
              icon={Settings2}
              title="Recording options"
              description="Formats and audio processing are saved for your next visit."
              tone="violet"
            >
              <div className="space-y-4">
                <div>
                  <span className={labelClass}>Output format</span>
                  <div className="grid grid-cols-2 gap-2">
                    {formatOptions.map((format) => (
                      <button
                        key={format.value}
                        type="button"
                        onClick={() => updateSetting({ format: format.value })}
                        disabled={status === "recording" || status === "paused"}
                        aria-pressed={settings.format === format.value}
                        className={`rounded-xl border p-2.5 text-left transition disabled:opacity-60 ${
                          settings.format === format.value
                            ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50"
                        }`}
                      >
                        <span className="block text-sm font-black text-slate-900 dark:text-white">{format.label}</span>
                        <span className="block text-[13px] text-slate-500 dark:text-slate-400">{format.blurb}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className={labelClass}>Audio bitrate</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BITRATES.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => updateSetting({ bitrate: item.value })}
                        disabled={status === "recording" || status === "paused"}
                        aria-pressed={Number(settings.bitrate) === item.value}
                        className={`rounded-lg border px-1.5 py-2 text-[13px] font-bold transition disabled:opacity-60 ${
                          Number(settings.bitrate) === item.value
                            ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                            : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className={labelClass}>Sample rate</span>
                  <Segmented
                    value={String(settings.sampleRate)}
                    onChange={(value) => updateSetting({ sampleRate: Number(value) })}
                    options={SAMPLE_RATES.map((item) => ({ value: String(item.value), label: item.label }))}
                    columns={3}
                    tone="violet"
                  />
                </div>

                <div>
                  <span className={labelClass}>Channels</span>
                  <Segmented
                    value={String(settings.channelCount)}
                    onChange={(value) => updateSetting({ channelCount: Number(value) })}
                    options={[
                      { value: "1", label: "Mono" },
                      { value: "2", label: "Stereo" },
                    ]}
                    columns={2}
                    tone="violet"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="voice-input-device">
                    Microphone
                  </label>
                  <select
                    id="voice-input-device"
                    className={fieldClass(false, "violet")}
                    value={settings.deviceId}
                    onChange={(event) => updateSetting({ deviceId: event.target.value })}
                  >
                    <option value="">System default</option>
                    {audioDevices.map((device, index) => (
                      <option key={device.deviceId || index} value={device.deviceId}>
                        {device.label || `Microphone ${index + 1}`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={refreshDevices}
                    className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-violet-600 hover:text-violet-700 dark:text-violet-300"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh device list
                  </button>
                </div>

                <div className="space-y-2">
                  <ToggleRow
                    checked={settings.countdown}
                    onChange={(value) => updateSetting({ countdown: value })}
                    label="3-second countdown"
                    description="Adds a short count-in before the recording begins."
                    tone="violet"
                  />
                  <ToggleRow
                    checked={settings.echoCancellation}
                    onChange={(value) => updateSetting({ echoCancellation: value })}
                    label="Echo cancellation"
                    description="Removes speaker echo picked up by the microphone."
                    tone="violet"
                  />
                  <ToggleRow
                    checked={settings.noiseSuppression}
                    onChange={(value) => updateSetting({ noiseSuppression: value })}
                    label="Noise suppression"
                    description="Reduces fans, hum and steady background noise."
                    tone="violet"
                  />
                  <ToggleRow
                    checked={settings.autoGainControl}
                    onChange={(value) => updateSetting({ autoGainControl: value })}
                    label="Automatic gain"
                    description="Normalises quiet and loud speakers automatically."
                    tone="violet"
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            icon={AudioWaveform}
            title="Your recordings"
            description="Play, rename, download or delete takes. Everything is temporary and private to this tab."
            tone="emerald"
            actions={
              <ActionButton icon={Wand2} onClick={loadDemoRecording}>
                Demo take
              </ActionButton>
            }
          >
            {recordings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-slate-700 dark:bg-slate-800/30">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Mic className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">No recordings yet</p>
                <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Record your own audio or generate a four-second demo melody to explore playback and export controls.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <ActionButton variant="primary" tone="emerald" icon={Mic} onClick={beginRecording}>
                    Start recording
                  </ActionButton>
                  <ActionButton icon={Wand2} onClick={loadDemoRecording}>
                    Load demo data
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recordings.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <AudioWaveform className="h-4 w-4" />
                      </span>
                      <input
                        value={item.name}
                        onChange={(event) => renameRecording(item.id, event.target.value)}
                        aria-label="Recording name"
                        className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-bold text-slate-900 outline-none transition hover:border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 dark:text-white dark:hover:border-slate-700"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.demo && <Chip tone="amber">Demo</Chip>}
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-700">{item.ext.toUpperCase()}</span>
                        <span>{formatDuration(item.duration)}</span>
                        <span>{formatBytes(item.size)}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => downloadBlob(item.blob, `${item.name.replace(/[^\w-]+/g, "-") || "recording"}.${item.ext}`)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400"
                          aria-label={`Download ${item.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRecording(item.id)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <audio src={item.url} controls className="mt-2.5 h-9 w-full" />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {tab === "mic" && (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <SectionCard
              icon={AudioWaveform}
              title="Live microphone monitor"
              description="Watch the waveform and levels, then compare devices before you record."
              tone="sky"
              actions={
                <>
                  <Chip tone={micRunning ? "emerald" : demoMic ? "amber" : "sky"}>
                    {micRunning ? "Listening" : demoMic ? "Demo signal" : "Idle"}
                  </Chip>
                  <Chip tone="violet">{quality.label}</Chip>
                </>
              }
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 dark:border-slate-800 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-sky-300">Input level</p>
                    <p className="mt-1 text-3xl font-black tabular-nums text-white">
                      {micRunning || demoMic ? `${micStats.rms} dB` : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-slate-400">Peak</p>
                    <p className="text-lg font-black tabular-nums text-white">
                      {micRunning || demoMic ? `${micStats.peak} dB` : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 transition-[width] duration-75"
                    style={{ width: `${micRunning || demoMic ? clamp((micStats.rms + 60) / 60, 0, 1) * 100 : 0}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[13px] font-medium text-slate-500">
                  <span>-60 dB</span>
                  <span>-30 dB</span>
                  <span>0 dB</span>
                </div>

                <canvas ref={micWaveRef} className="mt-3 h-24 w-full rounded-xl bg-slate-900/60" aria-label="Mic waveform" />
                <canvas ref={micBarsRef} className="mt-2 h-20 w-full rounded-xl bg-slate-900/60" aria-label="Mic frequency bars" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {!micRunning ? (
                  <ActionButton variant="primary" tone="sky" icon={Mic} onClick={startMicTest}>
                    Start mic test
                  </ActionButton>
                ) : (
                  <ActionButton variant="danger" icon={MicOff} onClick={stopMicTest}>
                    Stop test
                  </ActionButton>
                )}
                <ActionButton
                  icon={Wand2}
                  onClick={() => {
                    if (micRunning) stopMicTest();
                    setDemoMic((current) => !current);
                  }}
                >
                  {demoMic ? "Stop demo signal" : "Load demo signal"}
                </ActionButton>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="Average" value={micRunning || demoMic ? `${micStats.rms} dB` : "—"} tone="sky" icon={Volume2} />
                <Stat label="Peak" value={micRunning || demoMic ? `${micStats.peak} dB` : "—"} tone="emerald" icon={Gauge} />
                <Stat label="Noise floor" value={micRunning || demoMic ? `${micStats.floor} dB` : "—"} tone="violet" icon={AudioWaveform} />
                <Stat label="Clipping" value={micRunning ? `${micStats.clips}` : demoMic ? "0 (demo)" : "—"} tone="rose" icon={AlertTriangle} />
              </div>
            </SectionCard>

            <div className="space-y-5">
              <SectionCard
                icon={Settings2}
                title="Input setup"
                description="Pick the microphone and processing mode you want to test."
                tone="violet"
              >
                <div className="space-y-4">
                  <div>
                    <label className={labelClass} htmlFor="mic-test-device">
                      Microphone
                    </label>
                    <select
                      id="mic-test-device"
                      className={fieldClass(false, "violet")}
                      value={settings.deviceId}
                      onChange={(event) => updateSetting({ deviceId: event.target.value })}
                      disabled={micRunning}
                    >
                      <option value="">System default</option>
                      {audioDevices.map((device, index) => (
                        <option key={device.deviceId || index} value={device.deviceId}>
                          {device.label || `Microphone ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <ToggleRow
                      checked={settings.echoCancellation}
                      onChange={(value) => updateSetting({ echoCancellation: value })}
                      label="Echo cancellation"
                      description="Compare with and without speaker echo removal."
                      tone="violet"
                    />
                    <ToggleRow
                      checked={settings.noiseSuppression}
                      onChange={(value) => updateSetting({ noiseSuppression: value })}
                      label="Noise suppression"
                      description="Toggle to hear how aggressively your browser filters noise."
                      tone="violet"
                    />
                    <ToggleRow
                      checked={settings.autoGainControl}
                      onChange={(value) => updateSetting({ autoGainControl: value })}
                      label="Automatic gain"
                      description="Disable it to reveal your microphone's true dynamics."
                      tone="violet"
                    />
                  </div>

                  <Callout tone="sky" variant="tip" title="How to read the score">
                    Aim for an average between -24 dB and -12 dB with no clipping. A quiet average means the mic is too far
                    away; a noise floor above -50 dB usually points to room noise or aggressive processing.
                  </Callout>
                </div>
              </SectionCard>

              <SectionCard icon={ShieldCheck} title="Signal quality" tone="emerald" description="A quick, private assessment of this input.">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                      {micRunning || demoMic ? micStats.score : "—"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{quality.label}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {!micRunning && !demoMic
                        ? "Start the mic test to calculate a score from level, peak headroom, clipping and noise floor."
                        : micStats.score >= 85
                          ? "Strong, clean signal with healthy headroom."
                          : micStats.score >= 65
                            ? "Usable signal. Move slightly closer for a fuller voice."
                            : "Weak or noisy signal. Try another microphone or reduce room noise."}
                    </p>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {tab === "camera" && (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <SectionCard
              icon={Camera}
              title="Camera preview"
              description="Check framing, lighting and resolution before a call or recording."
              tone="rose"
              actions={
                <>
                  <Chip tone={cameraRunning ? "emerald" : demoCamera ? "amber" : "rose"}>
                    {cameraRunning ? "Live" : demoCamera ? "Demo feed" : "Off"}
                  </Chip>
                  {cameraRunning && <Chip tone="violet">{cameraFps} fps</Chip>}
                </>
              }
            >
              <div
                ref={previewWrapRef}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800"
              >
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className={`aspect-video w-full object-cover ${cameraRunning ? "block" : "hidden"}`}
                  style={{ transform: settings.mirrorCamera ? "scaleX(-1)" : "none" }}
                />
                {demoCamera && (
                  <canvas
                    ref={demoCanvasRef}
                    width={1280}
                    height={720}
                    className="block aspect-video w-full object-cover"
                    aria-label="Synthetic camera test feed"
                  />
                )}
                {!cameraRunning && !demoCamera && (
                  <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 p-6 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white/90">
                      <Camera className="h-7 w-7" />
                    </span>
                    <p className="text-base font-black text-white">Camera is off</p>
                    <p className="max-w-sm text-[13px] leading-relaxed text-slate-400">
                      Press Start camera to check your real webcam, or load the synthetic demo feed — no permission needed.
                    </p>
                  </div>
                )}
                {settings.showGuides && (cameraRunning || demoCamera) && (
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-y-0 left-1/3 w-px bg-white/30" />
                    <div className="absolute inset-y-0 left-2/3 w-px bg-white/30" />
                    <div className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
                    <div className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
                    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
                  </div>
                )}
                {cameraSize && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-[13px] font-bold text-white backdrop-blur">
                    {cameraSize}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {!cameraRunning ? (
                  <ActionButton variant="primary" tone="rose" icon={Camera} onClick={startCamera}>
                    Start camera
                  </ActionButton>
                ) : (
                  <ActionButton variant="danger" icon={CameraOff} onClick={stopCamera}>
                    Stop camera
                  </ActionButton>
                )}
                <ActionButton icon={ImageIcon} onClick={takeSnapshot} disabled={!cameraRunning && !demoCamera}>
                  Take snapshot
                </ActionButton>
                <ActionButton icon={Maximize2} onClick={openFullscreen} disabled={!cameraRunning && !demoCamera}>
                  Fullscreen
                </ActionButton>
                <ActionButton icon={Wand2} onClick={toggleDemoCamera}>
                  {demoCamera ? "Stop demo feed" : "Load demo feed"}
                </ActionButton>
              </div>

              {cameraError && (
                <div className="mt-3">
                  <Callout tone="rose" variant="warning" title="Camera problem">
                    {cameraError}
                  </Callout>
                </div>
              )}

              {snapshot && (
                <div className="mt-4 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Latest snapshot</p>
                    <div className="flex gap-1.5">
                      <ActionButton icon={Download} onClick={downloadSnapshot}>
                        Download PNG
                      </ActionButton>
                      <ActionButton variant="ghost" icon={Trash2} onClick={() => setSnapshot("")}>
                        Clear
                      </ActionButton>
                    </div>
                  </div>
                  <div
                    className="mt-2 aspect-video w-full rounded-xl bg-slate-100 bg-cover bg-center dark:bg-slate-800"
                    style={{ backgroundImage: `url(${snapshot})` }}
                    role="img"
                    aria-label="Captured camera snapshot"
                  />
                </div>
              )}
            </SectionCard>

            <div className="space-y-5">
              <SectionCard
                icon={Settings2}
                title="Camera options"
                description="Resolution is requested from the device; the browser may cap it."
                tone="rose"
              >
                <div className="space-y-4">
                  <div>
                    <label className={labelClass} htmlFor="camera-device">
                      Camera
                    </label>
                    <select
                      id="camera-device"
                      className={fieldClass(false, "rose")}
                      value={settings.videoDeviceId}
                      onChange={(event) => updateSetting({ videoDeviceId: event.target.value })}
                    >
                      <option value="">System default</option>
                      {videoDevices.map((device, index) => (
                        <option key={device.deviceId || index} value={device.deviceId}>
                          {device.label || `Camera ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className={labelClass}>Preferred resolution</span>
                    <div className="grid grid-cols-2 gap-2">
                      {CAMERA_RESOLUTIONS.map((resolution) => (
                        <button
                          key={resolution.value}
                          type="button"
                          onClick={() => updateSetting({ cameraResolution: resolution.value })}
                          aria-pressed={settings.cameraResolution === resolution.value}
                          className={`rounded-xl border p-2.5 text-left transition ${
                            settings.cameraResolution === resolution.value
                              ? "border-rose-400 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/40"
                              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50"
                          }`}
                        >
                          <span className="block text-sm font-black text-slate-900 dark:text-white">{resolution.label}</span>
                          <span className="block text-[13px] text-slate-500 dark:text-slate-400">{resolution.blurb}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <ToggleRow
                    checked={settings.mirrorCamera}
                    onChange={(value) => updateSetting({ mirrorCamera: value })}
                    label="Mirror preview"
                    description="Match the way you see yourself in a mirror. Snapshots follow this setting."
                    tone="rose"
                  />
                  <ToggleRow
                    checked={settings.showGuides}
                    onChange={(value) => updateSetting({ showGuides: value })}
                    label="Rule-of-thirds guides"
                    description="Overlay a framing grid and centre circle."
                    tone="rose"
                  />

                  <Callout tone="amber" variant="info" title="Privacy reminder">
                    Video is decoded and drawn inside this tab. No frame is uploaded, and snapshots are data URLs that only
                    exist in memory until you download them.
                  </Callout>
                </div>
              </SectionCard>

              <SectionCard icon={MonitorPlay} title="What to check" tone="sky" description="A fast pre-call checklist.">
                <ul className="space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                    Face is inside the centre circle with space above the head.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                    Light comes from the front, not from a window behind you.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                    Resolution is at least 720p and the frame rate stays near 30 fps.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                    Background is tidy and does not contain sensitive documents.
                  </li>
                </ul>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      <FaqAccordion items={VOICE_FAQS} tone="emerald" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Canvas helpers                                                            */
/* -------------------------------------------------------------------------- */

function sizeCanvas(canvas) {
  if (!canvas) return null;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return null;
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width, height };
}

function drawWaveform(canvas, buffer, color) {
  const sized = sizeCanvas(canvas);
  if (!sized) return;
  const { context, width, height } = sized;
  context.clearRect(0, 0, width, height);
  context.strokeStyle = "rgba(148,163,184,0.18)";
  context.lineWidth = 1;
  for (let line = 0; line < 4; line += 1) {
    const y = (height / 4) * line + height / 8;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = 2;
  const step = width / buffer.length;
  for (let i = 0; i < buffer.length; i += 1) {
    const value = (buffer[i] - 128) / 128;
    const x = i * step;
    const y = height / 2 + value * (height / 2.4);
    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
}

function drawDemoWave(canvas, time, color) {
  const sized = sizeCanvas(canvas);
  if (!sized) return;
  const { context, width, height } = sized;
  context.clearRect(0, 0, width, height);
  context.strokeStyle = "rgba(148,163,184,0.18)";
  context.lineWidth = 1;
  for (let line = 0; line < 4; line += 1) {
    const y = (height / 4) * line + height / 8;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = 2;
  const phase = time / 260;
  for (let x = 0; x < width; x += 2) {
    const envelope = 0.42 + Math.sin((x / width) * Math.PI * 3 + phase) * 0.18;
    const y =
      height / 2 +
      Math.sin(x / 18 + phase) * height * 0.28 * envelope +
      Math.sin(x / 6 + phase * 1.7) * height * 0.08;
    if (x === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
}

function drawBars(canvas, analyser) {
  const sized = sizeCanvas(canvas);
  if (!sized) return;
  const { context, width, height } = sized;
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  context.clearRect(0, 0, width, height);
  const bars = 48;
  const gap = 2;
  const barWidth = Math.max(1, (width - gap * (bars - 1)) / bars);
  for (let i = 0; i < bars; i += 1) {
    const index = Math.floor((i / bars) * (data.length * 0.55));
    const value = data[index] / 255;
    const barHeight = Math.max(2, value * height);
    const x = i * (barWidth + gap);
    const gradient = context.createLinearGradient(0, height, 0, height - barHeight);
    gradient.addColorStop(0, "#0ea5e9");
    gradient.addColorStop(1, "#34d399");
    context.fillStyle = gradient;
    context.fillRect(x, height - barHeight, barWidth, barHeight);
  }
}

function drawDemoBars(canvas, time) {
  const sized = sizeCanvas(canvas);
  if (!sized) return;
  const { context, width, height } = sized;
  context.clearRect(0, 0, width, height);
  const bars = 48;
  const gap = 2;
  const barWidth = Math.max(1, (width - gap * (bars - 1)) / bars);
  const phase = time / 240;
  for (let i = 0; i < bars; i += 1) {
    const value = (Math.sin(i * 0.42 + phase) + Math.sin(i * 0.17 + phase * 0.7) + 2) / 4;
    const barHeight = Math.max(2, value * height * 0.92);
    const x = i * (barWidth + gap);
    const gradient = context.createLinearGradient(0, height, 0, height - barHeight);
    gradient.addColorStop(0, "#0ea5e9");
    gradient.addColorStop(1, "#34d399");
    context.fillStyle = gradient;
    context.fillRect(x, height - barHeight, barWidth, barHeight);
  }
}

function drawTestFeed(canvas, context, time) {
  const width = canvas.width;
  const height = canvas.height;
  if (!context) return;
  context.save();
  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0f172a");
  gradient.addColorStop(0.55, "#111827");
  gradient.addColorStop(1, "#020617");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const bars = ["#f8fafc", "#facc15", "#22d3ee", "#22c55e", "#ec4899", "#ef4444", "#3b82f6", "#111827"];
  const bandHeight = height * 0.16;
  bars.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect((width / bars.length) * index, 0, width / bars.length + 1, bandHeight);
  });

  context.strokeStyle = "rgba(148,163,184,0.25)";
  context.lineWidth = 2;
  for (let x = 0; x <= width; x += width / 12) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += height / 8) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.strokeStyle = "rgba(226,232,240,0.55)";
  context.lineWidth = 4;
  context.beginPath();
  context.arc(width / 2, height / 2, height * 0.26, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(width / 2 - height * 0.32, height / 2);
  context.lineTo(width / 2 + height * 0.32, height / 2);
  context.moveTo(width / 2, height / 2 - height * 0.32);
  context.lineTo(width / 2, height / 2 + height * 0.32);
  context.stroke();

  const orbit = time / 900;
  const dotX = width / 2 + Math.cos(orbit) * width * 0.28;
  const dotY = height / 2 + Math.sin(orbit * 1.4) * height * 0.22;
  context.beginPath();
  context.arc(dotX, dotY, 26, 0, Math.PI * 2);
  context.fillStyle = "#f43f5e";
  context.fill();

  context.fillStyle = "rgba(15,23,42,0.78)";
  context.fillRect(width * 0.04, height - height * 0.2, width * 0.38, height * 0.12);
  context.fillStyle = "#f8fafc";
  context.font = `700 ${Math.round(height * 0.035)}px ui-sans-serif, system-ui, sans-serif`;
  context.fillText("DEMO FEED · NO CAMERA", width * 0.055, height - height * 0.135);
  context.fillStyle = "#38bdf8";
  context.font = `600 ${Math.round(height * 0.028)}px ui-monospace, monospace`;
  context.fillText(new Date(time).toLocaleTimeString(), width * 0.055, height - height * 0.098);

  context.fillStyle = "rgba(255,255,255,0.85)";
  context.font = `800 ${Math.round(height * 0.07)}px ui-sans-serif, system-ui, sans-serif`;
  context.textAlign = "center";
  context.fillText("CAMERA TEST PATTERN", width / 2, height * 0.24);
  context.font = `500 ${Math.round(height * 0.03)}px ui-sans-serif, system-ui, sans-serif`;
  context.fillStyle = "rgba(226,232,240,0.72)";
  context.fillText("Synthetic feed generated locally on a canvas", width / 2, height * 0.288);
  context.textAlign = "left";

  context.restore();
}
