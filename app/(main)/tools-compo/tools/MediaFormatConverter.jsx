"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Film,
  Music,
  Upload,
  X,
  Download,
  Zap,
  Settings2,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  Clock,
  Activity,
  Sliders,
  ArrowRight,
  FileVideo,
  FileAudio,
  Cpu,
  Sparkles,
  Info,
  VolumeX,
  VideoOff,
  Scissors,
  RotateCw,
} from "lucide-react";

/* ─────────────────────────── Format Config ─────────────────────────── */

const VIDEO_FORMATS = [
  {
    id: "mp4",
    label: "MP4",
    mime: "video/mp4",
    ext: "mp4",
    icon: "🎬",
    description: "Universal video format",
    color: "#6366f1",
    outputFormatKey: "Mp4OutputFormat",
  },
  {
    id: "webm",
    label: "WebM",
    mime: "video/webm",
    ext: "webm",
    icon: "🌐",
    description: "Web-optimized video",
    color: "#8b5cf6",
    outputFormatKey: "WebMOutputFormat",
  },
  {
    id: "mkv",
    label: "MKV",
    mime: "video/x-matroska",
    ext: "mkv",
    icon: "📦",
    description: "Matroska container",
    color: "#06b6d4",
    outputFormatKey: "MatroskaOutputFormat",
  },
  {
    id: "mov",
    label: "MOV",
    mime: "video/quicktime",
    ext: "mov",
    icon: "🎞️",
    description: "QuickTime format",
    color: "#f59e0b",
    outputFormatKey: "QtffOutputFormat",
  },
];

const AUDIO_FORMATS = [
  {
    id: "mp3",
    label: "MP3",
    mime: "audio/mpeg",
    ext: "mp3",
    icon: "🎵",
    description: "Compressed audio",
    color: "#ec4899",
    outputFormatKey: "Mp3OutputFormat",
  },
  {
    id: "wav",
    label: "WAV",
    mime: "audio/wav",
    ext: "wav",
    icon: "🎤",
    description: "Lossless audio",
    color: "#14b8a6",
    outputFormatKey: "WaveOutputFormat",
  },
  {
    id: "ogg",
    label: "OGG",
    mime: "audio/ogg",
    ext: "ogg",
    icon: "🔊",
    description: "Open audio format",
    color: "#84cc16",
    outputFormatKey: "OggOutputFormat",
  },
  {
    id: "flac",
    label: "FLAC",
    mime: "audio/flac",
    ext: "flac",
    icon: "💎",
    description: "Lossless compressed",
    color: "#f97316",
    outputFormatKey: "FlacOutputFormat",
  },
];

const ALL_INPUT_EXTS = [
  ".mp4", ".webm", ".mkv", ".mov", ".avi", ".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac",
];

/* ─────────────────────────── Helpers ─────────────────────────── */

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(secs) {
  if (!secs || isNaN(secs)) return "—";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getFileType(file) {
  if (!file) return null;
  const mime = file.type.toLowerCase();
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  const ext = file.name.split(".").pop().toLowerCase();
  if (["mp4", "webm", "mkv", "mov", "avi"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac", "m4a", "aac"].includes(ext)) return "audio";
  return "video";
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function FormatCard({ fmt, selected, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        "--fmt-color": fmt.color,
      }}
      className={`
        relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center
        cursor-pointer select-none
        ${selected
          ? "border-[var(--fmt-color)] bg-[var(--fmt-color)]/5 dark:bg-[var(--fmt-color)]/10 shadow-md shadow-[var(--fmt-color)]/10 dark:shadow-[0_0_16px_0_var(--fmt-color)/30]"
          : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/8 text-gray-800 dark:text-white"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {selected && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--fmt-color)] flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
      <span className="text-2xl">{fmt.icon}</span>
      <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt.label}</span>
      <span className="text-[10px] text-gray-500 dark:text-white/40 leading-tight">{fmt.description}</span>
    </button>
  );
}

function StatBadge({ icon: Icon, label, value, color = "text-gray-600 dark:text-white/60" }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8">
      <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 dark:text-white/40 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xs text-gray-800 dark:text-white/80 font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

function AnimatedProgress({ progress, color = "#6366f1" }) {
  return (
    <div className="relative w-full h-2.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 12px ${color}80`,
        }}
      />
      {/* Shimmer */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: progress > 0 && progress < 100 ? "shimmer 1.5s infinite" : "none",
        }}
      />
    </div>
  );
}

function DropZone({ onFileSelect, fileType }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4 
        min-h-[220px] rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-300 overflow-hidden
        ${dragOver
          ? "border-indigo-450 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]"
          : "border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/3 hover:border-gray-300 dark:hover:border-white/25 hover:bg-gray-100 dark:hover:bg-white/5"
        }
      `}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow orb */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl transition-opacity duration-300 ${dragOver ? "opacity-20" : "opacity-0"}`}
        style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
      />

      <div className={`relative flex flex-col items-center gap-3 transition-transform duration-300 ${dragOver ? "scale-105" : ""}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-gray-200 dark:border-white/10 flex items-center justify-center">
          <Upload className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-800 dark:text-white/80">
            {dragOver ? "Drop your file here" : "Drop media file here"}
          </p>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
            or <span className="text-indigo-500 dark:text-indigo-400 font-medium">browse files</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-white/25 mt-2">
            MP4, WebM, MKV, MOV, MP3, WAV, OGG, FLAC, M4A, AAC
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ALL_INPUT_EXTS.join(",")}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */

export default function MediaFormatConverter() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'video' | 'audio'
  const [fileMeta, setFileMeta] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | converting | done | error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [outputBlob, setOutputBlob] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("video"); // video | audio
  const [conversionTime, setConversionTime] = useState(null);
  const [outputSize, setOutputSize] = useState(null);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [logs, setLogs] = useState([]);

  // Advanced settings state
  const [trimStart, setTrimStart] = useState("");
  const [trimEnd, setTrimEnd] = useState("");
  const [videoResolution, setVideoResolution] = useState("original"); // original | 1080p | 720p | 480p | 360p | custom
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [videoBitrate, setVideoBitrate] = useState("default"); // default | high | medium | low | custom
  const [customVideoBitrate, setCustomVideoBitrate] = useState("2000"); // in kbps
  const [videoFrameRate, setVideoFrameRate] = useState("original"); // original | 60 | 30 | 24
  const [videoRotation, setVideoRotation] = useState("0"); // 0 | 90 | 180 | 270
  const [audioChannels, setAudioChannels] = useState("original"); // original | 2 | 1
  const [audioBitrate, setAudioBitrate] = useState("default"); // default | 320 | 192 | 128 | 64
  const [muteAudio, setMuteAudio] = useState(false);
  const [muteVideo, setMuteVideo] = useState(false);

  const previewPlayerRef = useRef(null);
  const conversionRef = useRef(null);
  const startTimeRef = useRef(null);

  // Check WebCodecs support
  useEffect(() => {
    const supported = typeof window !== "undefined" && "VideoDecoder" in window;
    setIsBrowserSupported(supported);
  }, []);

  const addLog = useCallback((msg, type = "info") => {
    setLogs((prev) => [...prev.slice(-19), { msg, type, ts: Date.now() }]);
  }, []);

  const handleFileSelect = useCallback((f) => {
    const type = getFileType(f);
    setFile(f);
    setFileType(type);
    setActiveTab(type === "audio" ? "audio" : "video");
    setSelectedFormat(null);
    setStatus("idle");
    setProgress(0);
    setOutputBlob(null);
    setOutputSize(null);
    setConversionTime(null);
    setErrorMsg("");
    setLogs([]);

    // Reset advanced options
    setTrimStart("");
    setTrimEnd("");
    setVideoResolution("original");
    setCustomWidth("");
    setCustomHeight("");
    setVideoBitrate("default");
    setVideoFrameRate("original");
    setVideoRotation("0");
    setAudioChannels("original");
    setAudioBitrate("default");
    setMuteAudio(false);
    setMuteVideo(false);

    // Preview URL
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    // Extract basic metadata
    const media = document.createElement(type === "audio" ? "audio" : "video");
    media.src = url;
    media.onloadedmetadata = () => {
      setFileMeta({
        duration: media.duration,
        width: media.videoWidth || null,
        height: media.videoHeight || null,
      });
      setTrimEnd(media.duration.toFixed(2));
    };

    addLog(`📂 File loaded: ${f.name} (${formatBytes(f.size)})`, "info");
  }, [addLog]);

  const captureCurrentTime = useCallback((target) => {
    if (previewPlayerRef.current) {
      const time = previewPlayerRef.current.currentTime.toFixed(2);
      if (target === "start") {
        setTrimStart(time);
        addLog(`⏱️ Captured trim start time: ${time}s`, "info");
      } else {
        setTrimEnd(time);
        addLog(`⏱️ Captured trim end time: ${time}s`, "info");
      }
    }
  }, [addLog]);

  const handleConvert = useCallback(async () => {
    if (!file || !selectedFormat) return;

    setStatus("converting");
    setProgress(0);
    setLogs([]);
    setOutputBlob(null);
    startTimeRef.current = Date.now();

    addLog(`🚀 Starting conversion to ${selectedFormat.label}...`, "info");
    addLog(`⚙️ Using MediaBunny (WebCodecs-accelerated)`, "info");

    try {
      const {
        Input,
        Output,
        Conversion,
        BlobSource,
        BufferTarget,
        ALL_FORMATS,
        canEncodeAudio,
        // Output format classes
        Mp4OutputFormat,
        WebMOutputFormat,
        MatroskaOutputFormat,
        QtffOutputFormat,
        Mp3OutputFormat,
        WaveOutputFormat,
        OggOutputFormat,
        FlacOutputFormat,
      } = await import("mediabunny");

      addLog("📦 MediaBunny loaded", "success");

      // Register WASM-based encoders for formats not natively supported by WebCodecs
      const fmtKey = selectedFormat.outputFormatKey;

      if (fmtKey === "Mp3OutputFormat") {
        // MP3 is never supported by WebCodecs — always use WASM encoder
        const nativeSupport = await canEncodeAudio("mp3").catch(() => false);
        if (!nativeSupport) {
          const { registerMp3Encoder } = await import("@mediabunny/mp3-encoder");
          registerMp3Encoder();
          addLog("🎵 MP3 WASM encoder registered", "info");
        }
      } else if (fmtKey === "FlacOutputFormat") {
        // FLAC is not supported by WebCodecs — always use WASM encoder
        const nativeSupport = await canEncodeAudio("flac").catch(() => false);
        if (!nativeSupport) {
          const { registerFlacEncoder } = await import("@mediabunny/flac-encoder");
          registerFlacEncoder();
          addLog("💎 FLAC WASM encoder registered", "info");
        }
      } else if (fmtKey === "OggOutputFormat") {
        // OGG uses Opus — natively supported in Chrome/Edge via WebCodecs
        // No separate encoder package exists; warn if the browser doesn't support it
        const nativeSupport = await canEncodeAudio("opus").catch(() => false);
        if (!nativeSupport) {
          throw new Error(
            "OGG (Opus) encoding is not supported in this browser. Please use Chrome or Edge for OGG output."
          );
        }
        addLog("🔊 OGG/Opus encoder: native WebCodecs support confirmed", "info");
      }

      const source = new BlobSource(file);
      const input = new Input({ source, formats: ALL_FORMATS });

      // Pick output format
      const formatMap = {
        Mp4OutputFormat,
        WebMOutputFormat,
        MatroskaOutputFormat,
        QtffOutputFormat,
        Mp3OutputFormat,
        WaveOutputFormat,
        OggOutputFormat,
        FlacOutputFormat,
      };

      const FormatClass = formatMap[selectedFormat.outputFormatKey];
      if (!FormatClass) throw new Error("Unsupported output format");

      const target = new BufferTarget();
      const output = new Output({
        format: new FormatClass(),
        target,
      });

      const conversionOptions = {
        input,
        output,
      };

      // Apply trimming
      const tStart = parseFloat(trimStart);
      const tEnd = parseFloat(trimEnd);
      if ((!isNaN(tStart) && tStart > 0) || (!isNaN(tEnd) && tEnd < (fileMeta?.duration || Infinity))) {
        conversionOptions.trim = {};
        if (!isNaN(tStart) && tStart > 0) {
          conversionOptions.trim.start = tStart;
        }
        if (!isNaN(tEnd) && tEnd > 0) {
          conversionOptions.trim.end = tEnd;
        }
        addLog(`✂️ Applied trimming: ${trimStart || "0"}s to ${trimEnd || "end"}s`, "info");
      }

      // Configure video track options
      if (fileType === "video") {
        const videoOpts = {};

        // Mute video / discard video track if audio tab is active or manually checked
        if (muteVideo || selectedFormat.mime.startsWith("audio/")) {
          videoOpts.discard = true;
          addLog("🔇 Discarding video track", "info");
        } else {
          // Resolution/resizing
          if (videoResolution !== "original") {
            if (videoResolution === "1080p") {
              videoOpts.width = 1920;
              videoOpts.height = 1080;
            } else if (videoResolution === "720p") {
              videoOpts.width = 1280;
              videoOpts.height = 720;
            } else if (videoResolution === "480p") {
              videoOpts.width = 854;
              videoOpts.height = 480;
            } else if (videoResolution === "360p") {
              videoOpts.width = 640;
              videoOpts.height = 360;
            } else if (videoResolution === "custom") {
              const w = parseInt(customWidth);
              const h = parseInt(customHeight);
              if (!isNaN(w) && w > 0) videoOpts.width = w;
              if (!isNaN(h) && h > 0) videoOpts.height = h;
            }
            videoOpts.fit = "contain";
            addLog(`📐 Resize video: ${videoOpts.width || "auto"}x${videoOpts.height || "auto"}`, "info");
          }

          // Rotation
          if (videoRotation !== "0") {
            videoOpts.rotate = parseInt(videoRotation);
            addLog(`🔄 Rotate video: ${videoRotation}°`, "info");
          }

          // Frame rate
          if (videoFrameRate !== "original") {
            videoOpts.frameRate = parseInt(videoFrameRate);
            addLog(`🖼️ Set frame rate: ${videoFrameRate} FPS`, "info");
          }

          // Bitrate
          if (videoBitrate !== "default") {
            if (videoBitrate === "high") {
              videoOpts.bitrate = 4000000; // 4 Mbps
            } else if (videoBitrate === "medium") {
              videoOpts.bitrate = 1500000; // 1.5 Mbps
            } else if (videoBitrate === "low") {
              videoOpts.bitrate = 600000; // 600 kbps
            } else if (videoBitrate === "custom") {
              const b = parseInt(customVideoBitrate);
              if (!isNaN(b) && b > 0) {
                videoOpts.bitrate = b * 1000; // kbps to bps
              }
            }
            addLog(`📊 Video bitrate set: ${videoBitrate === "custom" ? customVideoBitrate + " kbps" : videoBitrate}`, "info");
          }
        }

        // Only attach video options if there's something meaningful to configure
        if (Object.keys(videoOpts).length > 0) {
          conversionOptions.video = videoOpts;
        }
      }

      // Configure audio track options
      const audioOpts = {};
      if (muteAudio) {
        audioOpts.discard = true;
        addLog("🔇 Discarding audio track (muted)", "info");
      } else {
        // Channels
        if (audioChannels !== "original") {
          audioOpts.numberOfChannels = parseInt(audioChannels);
          addLog(`🔊 Audio channels: ${audioChannels === "1" ? "Mono" : "Stereo"}`, "info");
        }

        // Bitrate
        if (audioBitrate !== "default") {
          audioOpts.bitrate = parseInt(audioBitrate) * 1000; // kbps to bps
          addLog(`🎵 Audio bitrate set: ${audioBitrate} kbps`, "info");
        }
      }
      // Only attach audio options if there's something meaningful to configure
      if (Object.keys(audioOpts).length > 0) {
        conversionOptions.audio = audioOpts;
      }

      addLog("🔧 Initializing conversion pipeline...", "info");
      const conversion = await Conversion.init(conversionOptions);

      if (!conversion.isValid) {
        const reasons = conversion.discardedTracks
          ?.map((t) => t.reason)
          .filter(Boolean)
          .join("; ");
        throw new Error(
          reasons
            ? `Conversion not supported: ${reasons}`
            : "This conversion configuration is not supported. The input stream layout is incompatible with the options selected."
        );
      }

      conversionRef.current = conversion;
      addLog("✅ Conversion pipeline ready", "success");
      addLog("🎯 Processing media data...", "info");

      // Bind dynamic onProgress handler for live precision feedback
      conversion.onProgress = (p, processedTime) => {
        setProgress(Math.round(p * 100));
        addLog(`⏳ Processing: ${Math.round(p * 100)}% (${processedTime.toFixed(1)}s processed)`, "info");
      };

      await conversion.execute();

      setProgress(100);

      const elapsed = ((Date.now() - startTimeRef.current) / 1000).toFixed(2);
      setConversionTime(elapsed);

      const buffer = target.buffer;
      const blob = new Blob([buffer], { type: selectedFormat.mime });
      setOutputBlob(blob);
      setOutputSize(blob.size);
      setStatus("done");

      addLog(`✅ Conversion complete in ${elapsed}s`, "success");
      addLog(`📁 Output size: ${formatBytes(blob.size)}`, "success");
    } catch (err) {
      console.error("Conversion error:", err);
      const msg = err?.message || "Conversion failed";
      setErrorMsg(msg);
      setStatus("error");
      addLog(`❌ Error: ${msg}`, "error");
    }
  }, [
    file,
    selectedFormat,
    fileType,
    trimStart,
    trimEnd,
    fileMeta,
    videoResolution,
    customWidth,
    customHeight,
    videoRotation,
    videoFrameRate,
    videoBitrate,
    customVideoBitrate,
    muteVideo,
    muteAudio,
    audioChannels,
    audioBitrate,
    addLog,
  ]);

  const handleDownload = useCallback(() => {
    if (!outputBlob || !file) return;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_converted.${selectedFormat.ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`⬇️ Downloaded: ${baseName}_converted.${selectedFormat.ext}`, "info");
  }, [outputBlob, file, selectedFormat, addLog]);

  const handleReset = useCallback(() => {
    setFile(null);
    setFileType(null);
    setFileMeta(null);
    setSelectedFormat(null);
    setStatus("idle");
    setProgress(0);
    setOutputBlob(null);
    setOutputSize(null);
    setConversionTime(null);
    setErrorMsg("");
    setLogs([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  const availableFormats = activeTab === "video" ? VIDEO_FORMATS : AUDIO_FORMATS;
  const isConverting = status === "converting";
  const isDone = status === "done";
  const isError = status === "error";

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-12 text-gray-900 dark:text-white transition-colors duration-200">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .float-anim { animation: float 3s ease-in-out infinite; }
        .spin-slow { animation: spin-slow 3s linear infinite; }
        .log-scroll::-webkit-scrollbar { width: 4px; }
        .log-scroll::-webkit-scrollbar-track { background: transparent; }
        .log-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
        .dark .log-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by MediaBunny · WebCodecs Accelerated
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-white/90 dark:to-white/50 bg-clip-text text-transparent mb-3">
          Media Format Converter
        </h1>
        <p className="text-gray-500 dark:text-white/45 text-base max-w-xl mx-auto">
          Convert, trim, rotate, and scale video & audio files directly in your browser.
          Hardware-accelerated with WebCodecs, 100% private.
        </p>
      </div>

      {/* Browser Support Warning */}
      {!isBrowserSupported && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Limited Browser Support</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">
              WebCodecs API not detected. Some conversions may be limited. Use Chrome/Edge/Opera 94+ for best results.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-3 space-y-5">
          {/* Drop Zone / File Info */}
          {!file ? (
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-white/8 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white/80">Upload Media File</h2>
              </div>
              <div className="p-5">
                <DropZone onFileSelect={handleFileSelect} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {fileType === "video" ? (
                    <FileVideo className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  ) : (
                    <FileAudio className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                  )}
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-white/80">Source File</h2>
                </div>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 text-gray-400 hover:text-gray-600 dark:hover:text-white/70 transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* File name */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${fileType === "video" ? "bg-indigo-500/10 dark:bg-indigo-500/15" : "bg-pink-500/10 dark:bg-pink-500/15"}`}>
                    {fileType === "video" ? (
                      <Film className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    ) : (
                      <Music className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5 font-mono">
                      {file.type || "Unknown MIME type"}
                    </p>
                  </div>
                </div>

                {/* File stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <StatBadge icon={HardDrive} label="File Size" value={formatBytes(file.size)} color="text-indigo-500 dark:text-indigo-400" />
                  {fileMeta?.duration && (
                    <StatBadge icon={Clock} label="Duration" value={formatDuration(fileMeta.duration)} color="text-purple-500 dark:text-purple-400" />
                  )}
                  {fileMeta?.width && fileMeta?.height && (
                    <StatBadge icon={Activity} label="Resolution" value={`${fileMeta.width}×${fileMeta.height}`} color="text-cyan-500 dark:text-cyan-400" />
                  )}
                </div>

                {/* Preview Player */}
                {previewUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-250 dark:border-white/8 bg-gray-950/5 dark:bg-black/40">
                    {fileType === "video" ? (
                      <video
                        ref={previewPlayerRef}
                        src={previewUrl}
                        controls
                        className="w-full max-h-56 object-contain bg-black"
                      />
                    ) : (
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-pink-500/10 dark:bg-pink-500/15 flex items-center justify-center shrink-0 float-anim">
                            <Music className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-white/60 truncate">{file.name}</span>
                        </div>
                        <audio ref={previewPlayerRef} src={previewUrl} controls className="w-full h-8 mt-1" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Output Format Selection */}
          {file && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-white/8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white/80">Output Format</h2>
                  </div>
                  {/* Tab switcher */}
                  <div className="flex p-1 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8">
                    {["video", "audio"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab);
                          setSelectedFormat(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all duration-250 cursor-pointer ${
                          activeTab === tab
                            ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm dark:shadow-none font-semibold"
                            : "text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/60"
                        }`}
                      >
                        {tab === "video" ? <Film className="w-3 h-3" /> : <Music className="w-3 h-3" />}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableFormats.map((fmt) => (
                    <FormatCard
                      key={fmt.id}
                      fmt={fmt}
                      selected={selectedFormat?.id === fmt.id}
                      onClick={() => setSelectedFormat(fmt)}
                      disabled={isConverting}
                    />
                  ))}
                </div>

                {selectedFormat && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--sel-color)]/5 dark:bg-[var(--sel-color)]/8 border border-[var(--sel-color)]/10 dark:border-[var(--sel-color)]/20 text-sm"
                    style={{ "--sel-color": selectedFormat.color }}
                  >
                    <Info className="w-3.5 h-3.5 text-[var(--sel-color)]" />
                    <span className="text-gray-600 dark:text-white/60">
                      Converting to <span className="font-semibold text-gray-900 dark:text-white/90">{selectedFormat.label}</span>
                      {" "}— {selectedFormat.description}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Settings Toggle */}
          {file && selectedFormat && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/80">Advanced Settings & Adjustments</span>
                </div>
                {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-white/40" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/40" />}
              </button>

              {showAdvanced && (
                <div className="p-5 border-t border-gray-200 dark:border-white/8 space-y-6 bg-gray-50/30 dark:bg-white/[0.01]">
                  {/* Trim control */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-white/65">
                      <Scissors className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Trim & Cut Media</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-455 dark:text-white/40 block mb-1">Start Position (seconds)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            max={trimEnd || fileMeta?.duration || 1000}
                            step="0.01"
                            placeholder="0.00"
                            value={trimStart}
                            onChange={(e) => setTrimStart(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => captureCurrentTime("start")}
                            className="px-2.5 py-2 text-xs bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/20 transition-all font-medium cursor-pointer"
                            title="Capture current time of preview video"
                          >
                            Current
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-455 dark:text-white/40 block mb-1">End Position (seconds)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={trimStart || 0}
                            step="0.01"
                            placeholder={fileMeta?.duration?.toFixed(2) || "End"}
                            value={trimEnd}
                            onChange={(e) => setTrimEnd(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => captureCurrentTime("end")}
                            className="px-2.5 py-2 text-xs bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/20 transition-all font-medium cursor-pointer"
                            title="Capture current time of preview video"
                          >
                            Current
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video adjustments */}
                  {fileType === "video" && !selectedFormat.mime.startsWith("audio/") && (
                    <div className="space-y-4 border-t border-gray-200 dark:border-white/5 pt-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-white/65">
                        <Film className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span>Video Processing & Adjustments</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Resolution */}
                        <div>
                          <label className="text-[10px] text-gray-455 dark:text-white/40 block mb-1">Resolution / Scale</label>
                          <select
                            value={videoResolution}
                            onChange={(e) => setVideoResolution(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="original" className="bg-white dark:bg-[#0e0e14]">Original ({fileMeta?.width ? `${fileMeta.width}x${fileMeta.height}` : "Auto"})</option>
                            <option value="1080p" className="bg-white dark:bg-[#0e0e14]">1080p Full HD (1920x1080)</option>
                            <option value="720p" className="bg-white dark:bg-[#0e0e14]">720p HD (1280x720)</option>
                            <option value="480p" className="bg-white dark:bg-[#0e0e14]">480p SD (854x480)</option>
                            <option value="360p" className="bg-white dark:bg-[#0e0e14]">360p Mobile (640x360)</option>
                            <option value="custom" className="bg-white dark:bg-[#0e0e14]">Custom dimensions...</option>
                          </select>

                          {videoResolution === "custom" && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <input
                                type="number"
                                placeholder="Width"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400"
                              />
                              <input
                                type="number"
                                placeholder="Height"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400"
                              />
                            </div>
                          )}
                        </div>

                        {/* Rotation */}
                        <div>
                          <label className="text-[10px] text-gray-455 dark:text-white/40 block mb-1">Rotation</label>
                          <select
                            value={videoRotation}
                            onChange={(e) => setVideoRotation(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="0" className="bg-white dark:bg-[#0e0e14]">No Rotation</option>
                            <option value="90" className="bg-white dark:bg-[#0e0e14]">Rotate 90° Clockwise</option>
                            <option value="180" className="bg-white dark:bg-[#0e0e14]">Rotate 180°</option>
                            <option value="270" className="bg-white dark:bg-[#0e0e14]">Rotate 270° Clockwise (90° CCW)</option>
                          </select>
                        </div>

                        {/* Frame rate */}
                        <div>
                          <label className="text-[10px] text-gray-455 dark:text-white/40 block mb-1">Frame Rate (FPS)</label>
                          <select
                            value={videoFrameRate}
                            onChange={(e) => setVideoFrameRate(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="original" className="bg-white dark:bg-[#0e0e14]">Keep Original FPS</option>
                            <option value="60" className="bg-white dark:bg-[#0e0e14]">60 FPS (Ultra Smooth)</option>
                            <option value="30" className="bg-white dark:bg-[#0e0e14]">30 FPS (Standard)</option>
                            <option value="24" className="bg-white dark:bg-[#0e0e14]">24 FPS (Cinematic)</option>
                          </select>
                        </div>

                        {/* Video Bitrate */}
                        <div>
                          <label className="text-[10px] text-gray-455 dark:text-white/40 block mb-1">Video Bitrate</label>
                          <select
                            value={videoBitrate}
                            onChange={(e) => setVideoBitrate(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="default" className="bg-white dark:bg-[#0e0e14]">Default (Auto Match)</option>
                            <option value="high" className="bg-white dark:bg-[#0e0e14]">High Quality (4 Mbps)</option>
                            <option value="medium" className="bg-white dark:bg-[#0e0e14]">Optimized (1.5 Mbps)</option>
                            <option value="low" className="bg-white dark:bg-[#0e0e14]">Compact Size (600 kbps)</option>
                            <option value="custom" className="bg-white dark:bg-[#0e0e14]">Custom Bitrate...</option>
                          </select>

                          {videoBitrate === "custom" && (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="number"
                                placeholder="Bitrate"
                                value={customVideoBitrate}
                                onChange={(e) => setCustomVideoBitrate(e.target.value)}
                                className="flex-1 px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400"
                              />
                              <span className="text-xs text-gray-500 dark:text-white/40 font-medium">kbps</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mute video switch */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-2">
                          <VideoOff className="w-4 h-4 text-rose-500 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-800 dark:text-white/80">Discard Video Track</p>
                            <p className="text-[10px] text-gray-450 dark:text-white/40">Convert to audio-only container or strip video frames</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={muteVideo}
                          onChange={(e) => setMuteVideo(e.target.checked)}
                          className="w-4 h-4 border-gray-300 dark:border-white/10 rounded bg-gray-50 dark:bg-white/5 checked:bg-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Audio Adjustments */}
                  <div className="space-y-4 border-t border-gray-200 dark:border-white/5 pt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-white/65">
                      <Music className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Audio Processing & Adjustments</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Audio Channels */}
                      <div>
                        <label className="text-[10px] text-gray-455 dark:text-white/40 block mb-1">Audio Channels</label>
                        <select
                          value={audioChannels}
                          disabled={muteAudio}
                          onChange={(e) => setAudioChannels(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="original" className="bg-white dark:bg-[#0e0e14]">Original Layout</option>
                          <option value="2" className="bg-white dark:bg-[#0e0e14]">Stereo (2 channels)</option>
                          <option value="1" className="bg-white dark:bg-[#0e0e14]">Mono (1 channel)</option>
                        </select>
                      </div>

                      {/* Audio Bitrate */}
                      <div>
                        <label className="text-[10px] text-gray-455 dark:text-white/40 block mb-1">Audio Bitrate</label>
                        <select
                          value={audioBitrate}
                          disabled={muteAudio}
                          onChange={(e) => setAudioBitrate(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="default" className="bg-white dark:bg-[#0e0e14]">Default (Auto Match)</option>
                          <option value="320" className="bg-white dark:bg-[#0e0e14]">High Quality (320 kbps)</option>
                          <option value="192" className="bg-white dark:bg-[#0e0e14]">Optimized (192 kbps)</option>
                          <option value="128" className="bg-white dark:bg-[#0e0e14]">Standard (128 kbps)</option>
                          <option value="64" className="bg-white dark:bg-[#0e0e14]">Low Size (64 kbps)</option>
                        </select>
                      </div>
                    </div>

                    {/* Mute audio switch */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 shadow-sm dark:shadow-none">
                      <div className="flex items-center gap-2">
                        <VolumeX className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-white/80">Mute Audio Track</p>
                          <p className="text-[10px] text-gray-450 dark:text-white/40">Convert file with no sound output</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={muteAudio}
                        onChange={(e) => setMuteAudio(e.target.checked)}
                        className="w-4 h-4 border-gray-300 dark:border-white/10 rounded bg-gray-50 dark:bg-white/5 checked:bg-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Convert Button */}
          {file && selectedFormat && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="flex-1 relative flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: isConverting
                    ? "linear-gradient(135deg, #4338ca, #7c3aed)"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: isConverting ? "none" : "0 0 30px rgba(99,102,241,0.25)",
                }}
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4.5 h-4.5" />
                    Convert to {selectedFormat.label}
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>

              {isDone && (
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold text-sm bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200 cursor-pointer shadow-sm dark:shadow-none"
                >
                  <Download className="w-4.5 h-4.5" />
                  Download
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Conversion Status */}
          {status !== "idle" && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-white/8 flex items-center gap-2">
                <Activity className={`w-4 h-4 ${isConverting ? "text-amber-500 spin-slow" : isDone ? "text-emerald-500" : "text-red-500"}`} />
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white/80">
                  {isConverting ? "Converting…" : isDone ? "Conversion Complete" : "Error"}
                </h2>
              </div>

              <div className="p-5 space-y-4">
                {/* Progress */}
                {(isConverting || isDone) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-white/50">
                      <span>Progress</span>
                      <span className="font-mono font-semibold text-gray-700 dark:text-white/70">{progress}%</span>
                    </div>
                    <AnimatedProgress
                      progress={progress}
                      color={isDone ? "#10b981" : selectedFormat?.color || "#6366f1"}
                    />
                  </div>
                )}

                {/* Error */}
                {isError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-550 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{errorMsg}</p>
                  </div>
                )}

                {/* Stats row */}
                {isDone && (
                  <div className="grid grid-cols-2 gap-2">
                    {conversionTime && (
                      <StatBadge icon={Clock} label="Time" value={`${conversionTime}s`} color="text-emerald-550 dark:text-emerald-400" />
                    )}
                    {outputSize && (
                      <StatBadge icon={HardDrive} label="Output" value={formatBytes(outputSize)} color="text-cyan-550 dark:text-cyan-400" />
                    )}
                    {outputSize && file?.size && (
                      <StatBadge
                        icon={Cpu}
                        label="Ratio"
                        value={`${((outputSize / file.size) * 100).toFixed(0)}%`}
                        color="text-purple-550 dark:text-purple-400"
                      />
                    )}
                  </div>
                )}

                {/* Done message */}
                {isDone && (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span className="text-xs font-medium">Ready to download!</span>
                  </div>
                )}

                {/* Reset button */}
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 transition-all border border-gray-200 dark:border-white/8 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Convert Another File
                </button>
              </div>
            </div>
          )}

          {/* Conversion Log */}
          {logs.length > 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-200 dark:border-white/8 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gray-400 dark:text-white/40" />
                <h2 className="text-sm font-semibold text-gray-500 dark:text-white/60">Process Log</h2>
              </div>
              <div className="p-3 max-h-52 overflow-y-auto log-scroll space-y-1 bg-gray-50/50 dark:bg-black/10">
                {logs.map((log, i) => (
                  <div key={i} className={`flex items-start gap-2 text-[10px] rounded-lg px-2 py-1.5 font-mono ${
                    log.type === "error"
                      ? "bg-red-500/5 dark:bg-red-500/8 text-red-650 dark:text-red-400"
                      : log.type === "success"
                        ? "bg-emerald-500/5 dark:bg-emerald-500/8 text-emerald-650 dark:text-emerald-400"
                        : "text-gray-600 dark:text-white/45"
                  }`}>
                    <span className="shrink-0 text-gray-400 dark:text-white/20 text-[9px] mt-0.5">
                      {new Date(log.ts).toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className="leading-relaxed">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Panel (shown when idle) */}
          {status === "idle" && !file && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-white/8">
                <h2 className="text-sm font-semibold text-gray-550 dark:text-white/60">Why MediaBunny?</h2>
              </div>
              <div className="p-5 space-y-3.5">
                {[
                  { icon: "⚡", title: "WebCodecs Powered", desc: "Hardware-accelerated in the browser" },
                  { icon: "🔒", title: "100% Private", desc: "Files never leave your device" },
                  { icon: "🌊", title: "Streaming I/O", desc: "Handles files of any size" },
                  { icon: "🎯", title: "Microsecond Precise", desc: "Frame-accurate operations" },
                  { icon: "📦", title: "No Dependencies", desc: "Zero server-side processing" },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <span className="text-lg shrink-0">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/80">{f.title}</p>
                      <p className="text-xs text-gray-500 dark:text-white/35">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Format Compatibility Matrix */}
          {file && !selectedFormat && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-white/8">
                <h2 className="text-sm font-semibold text-gray-550 dark:text-white/60">Supported Conversions</h2>
              </div>
              <div className="p-5 space-y-2.5">
                {(fileType === "video" ? VIDEO_FORMATS : AUDIO_FORMATS).map((fmt) => (
                  <div key={fmt.id} className="flex items-center gap-3">
                    <span className="text-base w-6 text-center">{fmt.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700 dark:text-white/70">{fmt.label}</span>
                        <span className="text-[10px] text-gray-400 dark:text-white/30">{fmt.description}</span>
                      </div>
                      <div className="h-1 rounded-full bg-gray-200 dark:bg-white/8 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: "85%",
                            background: fmt.color,
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-gray-400 dark:text-white/25 pt-1">
                  Select an output format above to start converting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-400 dark:text-white/20">
          Built with{" "}
          <a
            href="https://mediabunny.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-650 dark:text-indigo-400/60 hover:text-indigo-800 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            MediaBunny
          </a>
          {" "}— FFmpeg for the browser. All processing happens locally on your device.
        </p>
      </div>
    </div>
  );
}
