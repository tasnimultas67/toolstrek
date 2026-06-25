"use client";

import React, { useState, useRef, useCallback } from "react";
import ToolPageShell from "../ToolPageShell";
import { toast } from "sonner";
import {
  Download,
  Link2,
  Clipboard,
  X,
  Loader2,
  Music,
  Video,
  ChevronDown,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Globe,
  Play,
  FileVideo,
  FileAudio,
  Zap,
} from "lucide-react";

// ─── Supported Platforms ────────────────────────────────────────────────────

const PLATFORMS = [
  {
    name: "YouTube",
    pattern: /youtube\.com|youtu\.be/i,
    color: "#FF0000",
    bg: "rgba(255,0,0,0.1)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    pattern: /facebook\.com|fb\.watch/i,
    color: "#1877F2",
    bg: "rgba(24,119,242,0.1)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
        <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    pattern: /instagram\.com/i,
    color: "#E1306C",
    bg: "rgba(225,48,108,0.1)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="url(#igGrad)">
        <defs>
          <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    pattern: /tiktok\.com/i,
    color: "#010101",
    bg: "rgba(1,1,1,0.08)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.94a8.18 8.18 0 0 0 4.78 1.52V7.01a4.85 4.85 0 0 1-1.01-.32z" />
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    pattern: /twitter\.com|x\.com/i,
    color: "#000000",
    bg: "rgba(0,0,0,0.08)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Reddit",
    pattern: /reddit\.com/i,
    color: "#FF4500",
    bg: "rgba(255,69,0,0.1)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF4500">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    name: "Vimeo",
    pattern: /vimeo\.com/i,
    color: "#1AB7EA",
    bg: "rgba(26,183,234,0.1)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1AB7EA">
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.612-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.479 4.807l-.002.006z" />
      </svg>
    ),
  },
  {
    name: "Twitch",
    pattern: /twitch\.tv/i,
    color: "#9146FF",
    bg: "rgba(145,70,255,0.1)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#9146FF">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  {
    name: "SoundCloud",
    pattern: /soundcloud\.com/i,
    color: "#FF5500",
    bg: "rgba(255,85,0,0.1)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF5500">
        <path d="M1.175 12.225c-.017 0-.034.002-.051.004.051-4.27 3.517-7.72 7.8-7.72.936 0 1.84.163 2.676.46l-.002.014c-.007.101-.014.203-.014.307v7.135a2.617 2.617 0 0 1-2.617 2.617 2.617 2.617 0 0 1-2.617-2.617A2.617 2.617 0 0 1 8.965 9.81c.463 0 .9.12 1.276.33V9.06c-.42-.064-.847-.098-1.276-.098-2.51 0-4.79 1.316-6.066 3.421a1.176 1.176 0 0 1-.724-.158zM22.825 12.04c0 .648-.525 1.172-1.175 1.172-.648 0-1.174-.524-1.174-1.172 0-.648.526-1.174 1.174-1.174.65 0 1.175.526 1.175 1.174zm-4.522 0c0 .648-.524 1.172-1.172 1.172-.65 0-1.175-.524-1.175-1.172 0-.648.525-1.174 1.175-1.174.648 0 1.172.526 1.172 1.174zm-4.522 0c0 .648-.525 1.172-1.174 1.172a1.174 1.174 0 0 1-1.175-1.172c0-.648.525-1.174 1.175-1.174.649 0 1.174.526 1.174 1.174z" />
      </svg>
    ),
  },
  {
    name: "Dailymotion",
    pattern: /dailymotion\.com/i,
    color: "#0066DC",
    bg: "rgba(0,102,220,0.1)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0066DC">
        <path d="M0 0v24h24V0zm14.076 16.78c-3.866 0-4.936-2.977-4.936-5.217 0-2.56 1.28-4.987 4.936-4.987 2.239 0 4.588 1.07 4.588 4.987 0 3.706-2.027 5.217-4.588 5.217zm-.03-8.36c-1.975 0-3.046 1.28-3.046 3.153 0 1.843 1.041 3.336 3.046 3.336 1.88 0 2.736-1.4 2.736-3.336 0-2.071-.99-3.153-2.736-3.153z" />
      </svg>
    ),
  },
  {
    name: "Bilibili",
    pattern: /bilibili\.com/i,
    color: "#00A1D6",
    bg: "rgba(0,161,214,0.1)",
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#00A1D6">
        <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
      </svg>
    ),
  },
  {
    name: "Other",
    pattern: null,
    color: "#7c00fe",
    bg: "rgba(124,0,254,0.1)",
    logo: <Globe className="w-5 h-5 text-brandColor" />,
  },
];

// ─── Quality Options ─────────────────────────────────────────────────────────

const VIDEO_QUALITIES = [
  { value: "max", label: "Best Quality", desc: "Highest available" },
  { value: "4320", label: "8K (4320p)", desc: "8K Ultra HD" },
  { value: "2160", label: "4K (2160p)", desc: "4K Ultra HD" },
  { value: "1440", label: "1440p", desc: "QHD / 2K" },
  { value: "1080", label: "1080p", desc: "Full HD" },
  { value: "720", label: "720p", desc: "HD" },
  { value: "480", label: "480p", desc: "SD" },
  { value: "360", label: "360p", desc: "Low" },
  { value: "240", label: "240p", desc: "Very Low" },
  { value: "144", label: "144p", desc: "Minimum" },
];

const AUDIO_FORMATS = [
  { value: "mp3", label: "MP3" },
  { value: "ogg", label: "OGG" },
  { value: "wav", label: "WAV" },
  { value: "opus", label: "OPUS" },
  { value: "flac", label: "FLAC" },
  { value: "best", label: "Best" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectPlatform(url) {
  if (!url) return null;
  return PLATFORMS.find((p) => p.pattern && p.pattern.test(url)) || PLATFORMS[PLATFORMS.length - 1];
}

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [videoQuality, setVideoQuality] = useState("1080");
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);
  const inputRef = useRef(null);
  const qualityRef = useRef(null);
  const audioRef = useRef(null);

  const detectedPlatform = detectPlatform(url);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handle = (e) => {
      if (qualityRef.current && !qualityRef.current.contains(e.target)) setQualityOpen(false);
      if (audioRef.current && !audioRef.current.contains(e.target)) setAudioOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text.trim());
      setResult(null);
      setError("");
    } catch {
      toast.error("Could not read clipboard. Please paste manually.");
    }
  }, []);

  const handleClear = useCallback(() => {
    setUrl("");
    setResult(null);
    setError("");
    setSetupRequired(false);
    inputRef.current?.focus();
  }, []);

  const handleDownload = useCallback(async () => {
    if (!url.trim()) {
      toast.error("Please enter a video URL first.");
      return;
    }
    if (!isValidUrl(url.trim())) {
      setError("Please enter a valid URL (e.g. https://youtube.com/watch?v=...)");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");
    setSetupRequired(false);

    try {
      const res = await fetch("/api/video-downloader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          videoQuality,
          audioFormat,
          isAudioOnly,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.setupRequired) {
          setSetupRequired(true);
          setError(data.error || "All public download servers are currently unavailable.");
        } else {
          setError(data.error || "Failed to process video.");
        }
        toast.error(data.error || "Failed to process video.");
        return;
      }

      setResult(data);
      toast.success("Video processed successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, videoQuality, audioFormat, isAudioOnly]);

  const selectedQuality = VIDEO_QUALITIES.find((q) => q.value === videoQuality);
  const selectedAudio = AUDIO_FORMATS.find((a) => a.value === audioFormat);

  return (
    <ToolPageShell widthClassName="max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-brandColor/10 border border-brandColor/20 text-brandColor text-sm font-semibold">
          <Sparkles size={14} />
          20+ Supported Platforms
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Video Downloader
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Download videos from YouTube, Facebook, Instagram, TikTok, Twitter and more.
          Paste a link and get your video in seconds — free, fast, no signup.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700/60 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        {/* Input Section */}
        <div className="p-6 md:p-8">
          {/* URL Input */}
          <div className="relative mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Video URL
            </label>
            <div className="flex items-center gap-2 p-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 focus-within:border-brandColor transition-colors duration-200">
              {/* Platform icon or Link icon */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {detectedPlatform && url ? (
                  detectedPlatform.logo
                ) : (
                  <Link2 size={18} className="text-gray-400" />
                )}
              </div>

              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setResult(null);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                placeholder="Paste video URL here (YouTube, Facebook, TikTok…)"
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm md:text-base min-w-0"
              />

              {url ? (
                <button
                  onClick={handleClear}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  title="Clear"
                >
                  <X size={16} />
                </button>
              ) : (
                <button
                  onClick={handlePaste}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brandColor/10 hover:bg-brandColor/20 text-brandColor text-xs font-semibold transition-colors"
                >
                  <Clipboard size={13} />
                  Paste
                </button>
              )}
            </div>

            {/* Platform badge */}
            {detectedPlatform && url && (
              <div
                className="absolute -bottom-3 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                style={{ background: detectedPlatform.bg, borderColor: detectedPlatform.color + "44", color: detectedPlatform.color }}
              >
                {detectedPlatform.name} detected
              </div>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-3 mt-7 mb-5">
            <button
              onClick={() => setIsAudioOnly(false)}
              className={`flex items-center gap-2 flex-1 justify-center py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                !isAudioOnly
                  ? "border-brandColor bg-brandColor/10 text-brandColor"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <FileVideo size={16} />
              Video
            </button>
            <button
              onClick={() => setIsAudioOnly(true)}
              className={`flex items-center gap-2 flex-1 justify-center py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                isAudioOnly
                  ? "border-brandColor bg-brandColor/10 text-brandColor"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <FileAudio size={16} />
              Audio Only
            </button>
          </div>

          {/* Options Row */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Quality selector */}
            {!isAudioOnly && (
              <div className="relative flex-1 min-w-[140px]" ref={qualityRef}>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Quality
                </label>
                <button
                  onClick={() => setQualityOpen(!qualityOpen)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-white hover:border-brandColor/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Video size={14} className="text-brandColor" />
                    {selectedQuality?.label}
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${qualityOpen ? "rotate-180" : ""}`} />
                </button>
                {qualityOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    {VIDEO_QUALITIES.map((q) => (
                      <button
                        key={q.value}
                        onClick={() => { setVideoQuality(q.value); setQualityOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors ${
                          videoQuality === q.value ? "text-brandColor font-semibold bg-brandColor/5" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span>{q.label}</span>
                        <span className="text-xs text-gray-400">{q.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audio format selector */}
            {isAudioOnly && (
              <div className="relative flex-1 min-w-[140px]" ref={audioRef}>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Audio Format
                </label>
                <button
                  onClick={() => setAudioOpen(!audioOpen)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-white hover:border-brandColor/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Music size={14} className="text-brandColor" />
                    {selectedAudio?.label}
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${audioOpen ? "rotate-180" : ""}`} />
                </button>
                {audioOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    {AUDIO_FORMATS.map((a) => (
                      <button
                        key={a.value}
                        onClick={() => { setAudioFormat(a.value); setAudioOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors ${
                          audioFormat === a.value ? "text-brandColor font-semibold bg-brandColor/5" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-brandColor hover:bg-brandColorHover text-white font-bold text-base transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-brandColor/25"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Download size={20} />
                {isAudioOnly ? "Extract Audio" : "Download Video"}
              </>
            )}
          </button>
        </div>

        {/* ─── Error State ──────────────────────────────────────────────────── */}
        {error && !setupRequired && (
          <div className="mx-6 mb-6 md:mx-8 md:mb-8 flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* ─── Setup Required Panel ─────────────────────────────────────────── */}
        {setupRequired && (
          <div className="mx-6 mb-6 md:mx-8 md:mb-8 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 overflow-hidden">
            <div className="flex items-start gap-3 p-4 border-b border-amber-200 dark:border-amber-800/40">
              <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Public servers are currently unavailable</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  All free community video servers are requiring authentication right now. You can set up your own free private server in ~2 minutes.
                </p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quick Fix — Free Private Server on Railway</p>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brandColor text-white text-xs flex items-center justify-center font-bold mt-0.5">1</span>
                  <span>Go to <a href="https://railway.com/new/template?template=https%3A%2F%2Fgithub.com%2Fimputnet%2Fcobalt" target="_blank" rel="noopener noreferrer" className="text-brandColor underline font-semibold">railway.com → Deploy Cobalt</a> (free $5 trial, no card needed)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brandColor text-white text-xs flex items-center justify-center font-bold mt-0.5">2</span>
                  <span>After deploy, copy your Railway URL (e.g. <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">https://xxx.railway.app</code>)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brandColor text-white text-xs flex items-center justify-center font-bold mt-0.5">3</span>
                  <span>Add it to your <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">.env</code> file as <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">COBALT_API_URL=https://xxx.railway.app</code> and restart</span>
                </li>
              </ol>
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/40">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Alternative:</strong> You can also directly use{" "}
                  <a href="https://cobalt.tools" target="_blank" rel="noopener noreferrer" className="text-brandColor underline">cobalt.tools</a>{" "}
                  in your browser — it&apos;s the same technology with a beautiful UI.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Result Section ──────────────────────────────────────────────── */}
        {result && (
          <div className="border-t border-gray-100 dark:border-gray-700/60">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <h2 className="font-bold text-gray-900 dark:text-white">Ready to Download</h2>
              </div>

              <div className="space-y-3">
                {/* Primary download */}
                {result.url && (
                  <ResultItem
                    href={result.url}
                    label={result.filename || "Download Video"}
                    icon={<FileVideo size={16} />}
                    badge={isAudioOnly ? selectedAudio?.label.toUpperCase() : `${selectedQuality?.label} MP4`}
                    primary
                  />
                )}

                {/* Picker / multiple links */}
                {result.picker && Array.isArray(result.picker) && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Available Files
                    </p>
                    {result.picker.map((item, i) => (
                      <ResultItem
                        key={i}
                        href={item.url}
                        label={item.type === "audio" ? `Audio ${i + 1}` : `Video ${i + 1}`}
                        icon={item.type === "audio" ? <FileAudio size={16} /> : <FileVideo size={16} />}
                        badge={item.type?.toUpperCase()}
                      />
                    ))}
                  </div>
                )}

                {/* Audio stream if separate */}
                {result.audio && (
                  <ResultItem
                    href={result.audio}
                    label="Audio Track"
                    icon={<FileAudio size={16} />}
                    badge="AUDIO"
                  />
                )}
              </div>

              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Zap size={11} />
                Direct download link · Opens in a new tab if your browser blocks auto-download
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Supported Platforms Grid ────────────────────────────────────── */}
      <div className="mt-12">
        <h2 className="text-center text-lg font-bold text-gray-800 dark:text-white mb-6">
          Supported Platforms
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {PLATFORMS.slice(0, -1).map((platform) => (
            <div
              key={platform.name}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ background: platform.bg }}
              >
                {platform.logo}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">
                {platform.name}
              </span>
            </div>
          ))}
          {/* +More */}
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brandColor/10">
              <span className="text-brandColor font-bold text-sm">+10</span>
            </div>
            <span className="text-xs font-medium text-gray-400 text-center">& More</span>
          </div>
        </div>
      </div>

      {/* ─── Info Section ─────────────────────────────────────────────────── */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: <Zap size={20} className="text-yellow-500" />,
            bg: "bg-yellow-500/10",
            title: "Lightning Fast",
            desc: "Videos are processed instantly using high-speed servers — no waiting around.",
          },
          {
            icon: <Play size={20} className="text-brandColor" />,
            bg: "bg-brandColor/10",
            title: "Multiple Formats",
            desc: "Choose from various video qualities up to 8K, or extract audio as MP3, WAV, FLAC and more.",
          },
          {
            icon: <CheckCircle2 size={20} className="text-emerald-500" />,
            bg: "bg-emerald-500/10",
            title: "No Registration",
            desc: "100% free with no account needed. Just paste a URL and download.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
              {item.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </ToolPageShell>
  );
}

// ─── ResultItem Sub-Component ─────────────────────────────────────────────────

function ResultItem({ href, label, icon, badge, primary }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 group ${
        primary
          ? "border-brandColor/40 bg-brandColor/5 hover:bg-brandColor/10"
          : "border-gray-200 dark:border-gray-700 hover:border-brandColor/40 hover:bg-gray-50 dark:hover:bg-gray-800/60"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${primary ? "bg-brandColor/15 text-brandColor" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{label}</p>
        {badge && (
          <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${primary ? "bg-brandColor/15 text-brandColor" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
            {badge}
          </span>
        )}
      </div>
      <ExternalLink size={14} className="text-gray-400 group-hover:text-brandColor transition-colors flex-shrink-0" />
    </a>
  );
}
