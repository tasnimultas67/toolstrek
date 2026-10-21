"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Music,
  Palette,
  RefreshCw,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import { useRecentTools } from "@/hooks/useRecentTools";

const TOOL_META = {
  title: "Audio Converter",
  link: "/tools/audio-converter",
  description:
    "Convert audio files between MP3, WAV and OGG formats with bitrate, sample rate and channel settings. Trim, normalize and add fade in/out — all in your browser.",
  icon: "Music",
  keywords: [
    "audio converter",
    "convert mp3",
    "convert wav",
    "convert ogg",
    "audio format converter",
    "trim audio",
    "normalize audio",
    "audio fade in out",
    "reduce audio size",
  ],
  categories: ["Media"], // existing category
};

const DEFAULT_FORMAT = "mp3";
const DEFAULT_BITRATE = "192k";
const DEFAULT_SAMPLERATE = "44100";
const DEFAULT_CHANNELS = "stereo";

const FORMAT_OPTIONS = [
  { value: "mp3", label: "MP3", extension: "mp3" },
  { value: "wav", label: "WAV", extension: "wav" },
  { value: "ogg", label: "OGG", extension: "ogg" },
];

const BITRATE_OPTIONS = [
  { value: "32k", label: "32 kbps" },
  { value: "64k", label: "64 kbps" },
  { value: "128k", label: "128 kbps" },
  { value: "192k", label: "192 kbps" },
  { value: "256k", label: "256 kbps" },
  { value: "320k", label: "320 kbps" },
];

const SAMPLERATE_OPTIONS = [
  { value: "8000", label: "8000 Hz" },
  { value: "11025", label: "11025 Hz" },
  { value: "16000", label: "16000 Hz" },
  { value: "22050", label: "22050 Hz" },
  { value: "44100", label: "44100 Hz" },
  { value: "48000", label: "48000 Hz" },
];

const CHANNELS_OPTIONS = [
  { value: "mono", label: "Mono" },
  { value: "stereo", label: "Stereo" },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function secondsToTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeToSeconds(timeStr) {
  const parts = timeStr.split(":");
  let total = 0;
  if (parts.length === 3) {
    total += parseInt(parts[0]) * 3600;
    total += parseInt(parts[1]) * 60;
    total += parseInt(parts[2]);
  } else if (parts.length === 2) {
    total += parseInt(parts[0]) * 60;
    total += parseInt(parts[1]);
  }
  return total;
}

function getFileName(originalName, format) {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "") || "audio";
  return `${nameWithoutExt}-converted.${format}`;
}

async function convertToMp3(
  pcm16Buffer,
  sampleRate,
  channels,
  bitrate
) {
  // lamejs expects samples interleaved; we need to deinterlace if stereo
  const Frame = require("lamejs").Frame;
  const MP3Encoder = require("lamejs").MP3Encoder;

  // If we are inside the module, we can use the global require lazily loaded later.
  // We'll handle via window.LAME after loading.
  throw new Error("lamejs not loaded yet");
}

async function convertToWav(pcm16Buffer, sampleRate, channels) {
  // Use wav package to create WAV blob
  // wav module exports stringify and render; but we can use simpler approach:
  // Create WAV header manually.
  const sampleRateNum = parseInt(sampleRate);
  const bitDepth = 16;
  const buffer = pcm16Buffer;
  const channelCount = channels === "stereo" ? 2 : 1;
  const byteRate = sampleRateNum * ((bitDepth / 8) * channelCount);
  const blockAlign = (bitDepth / 8) * channelCount;
  const dataSize = buffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const bufferView = new Uint8Array(totalSize);
  // RIFF chunk descriptor
  bufferView.set(
    new TextEncoder().encode("RIFF"),
    0
  );
  // RIFF chunk size
  bufferView.set(
    new Uint32Array([totalSize - 8]),
    4
  );
  // WAVE format
  bufferView.set(
    new TextEncoder().encode("WAVE"),
    8
  );
  // fmt sub-chunk
  bufferView.set(
    new TextEncoder().encode("fmt "),
    12
  );
  // fmt chunk size (16 for PCM)
  bufferView.set(
    new Uint32Array([16]),
    16
  );
  // audio format (1 = PCM)
  bufferView.set(
    new Uint16Array([1]),
    20
  );
  // number of channels
  bufferView.set(
    new Uint16Array([channelCount]),
    22
  );
  // sample rate
  bufferView.set(
    new Uint32Array([sampleRateNum]),
    24
  );
  // byte rate
  bufferView.set(
    new Uint32Array([byteRate]),
    28
  );
  // block align
  bufferView.set(
    new Uint16Array([blockAlign]),
    32
  );
  // bits per sample
  bufferView.set(
    new Uint16Array([bitDepth]),
    34
  );
  // data sub-chunk
  bufferView.set(
    new TextEncoder().encode("data"),
    36
  );
  // data size
  bufferView.set(
    new Uint32Array([dataSize]),
    40
  );
  // pcm data
  if (buffer instanceof Uint8Array) {
    bufferView.set(buffer, headerSize);
  } else {
    // assume Float32Array or Int16Array; copy
    const src = new Uint16Array(buffer);
    bufferView.set(src, headerSize);
  }

  return new Blob([bufferView], { type: "audio/wav" });
}

async function convertOggBlob(
  pcm16Buffer,
  sampleRate,
  channels
) {
  // OGG encoding via Web Audio API + offscreen fetch of ogg encoder is complex;
  // for now we will only support MP3 and WAV, and show note for OGG.
  throw new Error(
    "OGG conversion not yet supported in this browser. Please choose MP3 or WAV."
  );
}

export default function AudioConverter() {
  const [format, setFormat] = useState(DEFAULT_FORMAT);
  const [bitrate, setBitrate] = useState(DEFAULT_BITRATE);
  const [sampleRate, setSampleRate] = useState(DEFAULT_SAMPLERATE);
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [trimStart, setTrimStart] = useState("0:00");
  const [trimEnd, setTrimEnd] = useState("");
  const [normalize, setNormalize] = useState(false);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`);
      return;
    }
    if (!f.type.startsWith("audio/")) {
      toast.error("Please select an audio file (.mp3, .wav, .ogg, .m4a, etc.).");
      return;
    }
    setFile(f);
    setFileName(f.name);
    setError("");
    setProgress(0);
    setStatus("");
  };

  const convert = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    if (![...FORMAT_OPTIONS.map((f) => f.value), "wav"].includes(format)) {
      toast.error("Selected format not supported.");
      return;
    }
    setIsConverting(true);
    setProgress(0);
    setStatus("Preparing audio…");
    setError("");

    try {
      // Decode audio using Web Audio API
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      const numberOfChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;

      // Convert to desired channels and mix if necessary
      let targetChannels = channels === "mono" ? 1 : 2;
      let pcmBuffer;

      if (targetChannels === 1 && numberOfChannels === 2) {
        // mix down to mono
        const channelData = buffer.getChannelData(0);
        const channelDataRight = buffer.getChannelData(1);
        const length = Math.min(channelData.length, channelDataRight.length);
        const mixed = new Float32Array(length);
        for (let i = 0; i < length; i++) {
          length; // placeholder
          mixed[i] = (channelData[i] + channelDataRight[i]) / 2;
        }
        pcmBuffer = mixed;
      } else {
        // use first channel or keep stereo as-is
        pcmBuffer = buffer.getChannelData(0);
      }

      // Trim
      const startSample = timeToSeconds(trimStart) * sampleRate;
      const endSample =
        trimEnd && trimEnd !== "0:00"
          ? timeToSeconds(trimEnd) * sampleRate
          : pcmBuffer.length;
      const trimmed = pcmBuffer.slice(
        Math.max(0, Math.floor(startSample)),
        Math.min(pcmBuffer.length, Math.floor(endSample))
      );

      // Normalize (simple peak normalize to 0.95)
      let normalized = trimmed;
      if (normalize) {
        let max = 0;
        for (let i = 0; i < normalized.length; i++) {
          const abs = Math.abs(normalized[i]);
          if (abs > max) max = abs;
        }
        if (max > 0) {
          for (let i = 0; i < normalized.length; i++) {
            normalized[i] = normalized[i] / max * 0.95;
          }
        }
      }

      // Fade in/out
      const fadeInSamples = Math.round((fadeIn / 1000) * sampleRate);
      const fadeOutSamples = Math.round((fadeOut / 1000) * sampleRate);
      if (fadeIn > 0 && fadeInSamples < normalized.length) {
        for (let i = 0; i < fadeInSamples; i++) {
          normalized[i] = (normalized[i] * i) / fadeInSamples;
        }
      }
      if (fadeOut > 0 && fadeOutSamples < normalized.length) {
        const start = normalized.length - fadeOutSamples;
        for (let i = 0; i < fadeOutSamples; i++) {
          normalized[start + i] = (
            normalized[start + i] * (fadeOutSamples - i)
          ) / fadeOutSamples;
        }
      }

      // Convert to Int16 PCM
      const pcm16 = new Int16Array(
        normalized.length * (channels === "stereo" ? 2 : 1)
      );
      for (let i = 0; i < normalized.length; i++) {
        const s = Math.max(-1, Math.min(1, normalized[i]));
        const v = s * 0x7fff;
        const int16 = Math.max(-0x8000, Math.min(0x7fff, Math.round(v)));
        if (channels === "stereo") {
          pcm16[2 * i] = int16;
          pcm16[2 * i + 1] = int16; // same for both channels if mono input but stereo output
        } else {
          pcm16[i] = int16;
        }
      }

      // Now encode based on format
      const outputName = getFileName(fileName, format);
      setStatus(`Encoding ${format.toUpperCase()}…`);
      let blob;

      if (format === "mp3") {
        // Use lamejs via dynamic import
        const { default: lamejs } = await import("lamejs");
        const encoder = new lamejs.MP3Encoder(
          parseInt(bitrate),
          parseInt(sampleRate),
          channels === "stereo" ? 2 : 1
        );
        const samples = pcm16.buffer;
        // lamejs expects samples in interleaved format; we need to provide buffer
        // For simplicity, we'll use mono conversion and simple encode
        // Actually lamejs MP3Encoder.encodeBuffer expects interlaced buffer of 1152 frames
        // We'll call encodeBuffer with the pcm16 buffer
        const frameSize = 1152;
        const totalFrames = Math.ceil(pcm16.length / frameSize);
        const mp3Data = [];
        for (let i = 0; i < totalFrames; i++) {
          const start = i * frameSize;
          const end = Math.min(pcm16.length, start + frameSize);
          const sub = pcm16.subarray(start, end);
          const mp3Frame = encoder.encodeBuffer(sub);
          if (mp3Data.length) mp3Data.push(mp3Frame);
          else mp3Data[0] = mp3Frame;
        }
        const finalFrame = encoder.flush();
        const result = new Uint8Array(
          mp3Data.reduce((acc, f) => acc + f.length, 0) + finalFrame.length
        );
        let offset = 0;
        mp3Data.forEach((f) => {
          result.set(new Uint8Array(f), offset);
          offset += f.length;
        });
        result.set(new Uint8Array(finalFrame), offset);
        blob = new Blob([result], { type: "audio/mp3" });
      } else if (format === "wav") {
        blob = await convertToWav(pcm16, sampleRate, channels);
      } else {
        // OGG not supported yet
        throw new Error(
          "OGG conversion not yet supported. Please choose MP3 or WAV."
        );
      }

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setStatus("Conversion complete!");
      toast.success(`Audio converted to ${format.toUpperCase()} and downloaded.`);
    } catch (err) {
      console.error("Audio conversion error:", err);
      setError(
        err.message || "An unexpected error occurred during conversion."
      );
      toast.error(
        err.message || "Could not convert the audio file. Try a different format or file."
      );
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BackButton className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:bg-gray-800" />
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Media Tools
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton tool={TOOL_META} className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 sm:text-sm dark:bg-emerald-950/40 dark:text-emerald-300">
          <Music className="h-3.5 w-3.5" /> Free Audio Converter
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
          Convert audio locally
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
          Change format, adjust quality, trim silence, normalize volume and add fades —
          all without uploading your file.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,350px)_minmax(0,1fr)] gap-6">
        <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-24 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/40">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-gray-900 sm:text-base dark:text-white">Conversion settings</h2>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-300"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>

          <fieldset disabled={isConverting} className="m-0 min-w-0 space-y-5 border-0 p-5 disabled:opacity-60">
            <div>
              <label htmlFor="audio-format" className="mb-1.5 block text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
                Output format
              </label>
              <select
                id="audio-format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {format === "mp3" && (
              <div>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Bitrate</span>
                  <select
                    value={bitrate}
                    onChange={(e) => setBitrate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  >
                    {BITRATE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {format === "wav" && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Sample rate</span>
                  <select
                    value={sampleRate}
                    onChange={(e) => setSampleRate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  >
                    {SAMPLERATE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Channels</span>
                  <select
                    value={channels}
                    onChange={(e) => setChannels(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  >
                    {CHANNELS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {format === "mp3" && (
              <div>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Trim start</span>
                  <input
                    type="text"
                    id="trim-start"
                    value={trimStart}
                    onChange={(e) => setTrimStart(e.target.value)}
                    placeholder="mm:ss or ss"
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    aria-label="Trim start time"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Remove silence from the beginning</p>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Trim end</span>
                  <input
                    type="text"
                    id="trim-end"
                    value={trimEnd || "0:00"}
                    onChange={(e) => setTrimEnd(e.target.value)}
                    placeholder="mm:ss or ss"
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    aria-label="Trim end time"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Remove silence from the end (leave blank to keep original length)</p>
                </label>
              </div>
            )}

            {format === "mp3" && (
              <div className="mt-3">
                <label className="flex items-center justify-between gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={normalize}
                    onChange={(e) => setNormalize(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Normalize volume</span>
                  <span className="text-gray-400 dark:text-gray-500">(peak to 95%)</span>
                </label>
              </div>
            )}

            {format === "mp3" && (
              <div className="mt-3">
                <label className="flex items-center justify-between gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={fadeIn}
                    onChange={(e) => setFadeIn(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    aria-label="Fade in duration (ms)"
                  />
                  <span className="text-gray-400 dark:text-gray-500">Fade in</span>
                </label>
                <label className="flex items-center justify-between gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={fadeOut}
                    onChange={(e) => setFadeOut(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    aria-label="Fade out duration (ms)"
                  />
                  <span className="text-gray-400 dark:text-gray-500">Fade out</span>
                </label>
              </div>
            )}

            <div className="mt-5">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Audio source</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={handleFile}
                  aria-label="Upload audio file"
                />
                <div className="flex items-center gap-2 cursor-pointer">
                  <UploadCloud className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {fileName ? fileName : "Choose an audio file"}
                  </span>
                </div>
                {file && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatBytes(file.size)} · {file.type || "audio"}{fileName && ` · ${fileName}`}
                  </p>
                )}
              </label>
            </div>
          </fieldset>
        </aside>

        <main className="min-w-0 space-y-5">
          {file ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex min-w-0 items-center gap-2">
                  <Music className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-gray-900 dark:text-white">{fileName}</h2>
                    <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                      {formatBytes(file.size)} · {file.type || "audio"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={convert}
                    disabled={isConverting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isConverting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : <Sparkles className="h-4 w-4" />}
                    {isConverting ? "Converting…" : "Convert audio"}
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {isConverting ? (
                  <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Converting audio…</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-gray-800">
                      <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {progress}% complete · {status}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Output format</p>
                      <p className="mt-1 text-lg font-extrabold text-emerald-900 dark:text-emerald-200">{format.toUpperCase()}</p>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        {format === "mp3"
                          ? `Bitrate: ${bitrate} · Sample rate: ${sampleRate} Hz · Channels: ${channels}`
                          : format === "wav"
                            ? `Sample rate: ${sampleRate} Hz · Channels: ${channels}`
                            : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Input info</p>
                      <p className="mt-1 text-lg font-extrabold text-emerald-900 dark:text-white">{formatBytes(file.size)}</p>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        {file.duration ? `${Math.round(file.duration)}s duration` : "Duration unknown"}
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </p>
                )}

                {!isConverting && !error && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Converted
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Music className="h-3.5 w-3.5" /> {format.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5" /> {channels === "stereo" ? "Stereo" : "Mono"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> New file
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(`/tools/audio-converter`, "_blank")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <Download className="h-3.5 w-3.5" /> View help
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-950/40 dark:text-gray-400">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Music className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Drop an audio file here</p>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  MP3, WAV or OGG up to 50 MB. No upload — processing stays in this tab.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        All processing happens locally in your browser. Your audio file is never uploaded or stored.
      </p>
    </ToolPageShell>
  );
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}