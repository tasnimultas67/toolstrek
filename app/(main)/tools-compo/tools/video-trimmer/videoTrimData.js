export const TRIM_STORAGE_KEY = "toolstrek_video_trimmer_v1";

export const VIDEO_FORMATS = [
  {
    id: "mp4",
    label: "MP4",
    blurb: "H.264 + AAC · universal",
    ext: "mp4",
    mime: "video/mp4",
    outputKey: "Mp4OutputFormat",
    kind: "video",
  },
  {
    id: "webm",
    label: "WebM",
    blurb: "VP9 + Opus · web native",
    ext: "webm",
    mime: "video/webm",
    outputKey: "WebMOutputFormat",
    kind: "video",
  },
  {
    id: "mkv",
    label: "MKV",
    blurb: "Matroska container",
    ext: "mkv",
    mime: "video/x-matroska",
    outputKey: "MkvOutputFormat",
    kind: "video",
  },
  {
    id: "m4a",
    label: "M4A",
    blurb: "AAC audio only",
    ext: "m4a",
    mime: "audio/mp4",
    outputKey: "Mp4OutputFormat",
    kind: "audio",
  },
  {
    id: "mp3",
    label: "MP3",
    blurb: "Simple, portable audio",
    ext: "mp3",
    mime: "audio/mpeg",
    outputKey: "Mp3OutputFormat",
    kind: "audio",
    encoder: "@mediabunny/mp3-encoder",
  },
  {
    id: "wav",
    label: "WAV",
    blurb: "Lossless PCM audio",
    ext: "wav",
    mime: "audio/wav",
    outputKey: "WavOutputFormat",
    kind: "audio",
  },
  {
    id: "ogg",
    label: "OGG",
    blurb: "Opus in Ogg",
    ext: "ogg",
    mime: "audio/ogg",
    outputKey: "OggOutputFormat",
    kind: "audio",
  },
];

export const TRIM_RESOLUTIONS = [
  { value: "source", label: "Original", width: 0, height: 0, blurb: "No rescaling" },
  { value: "2160", label: "4K", width: 3840, height: 2160, blurb: "Ultra HD" },
  { value: "1080", label: "1080p", width: 1920, height: 1080, blurb: "Full HD" },
  { value: "720", label: "720p", width: 1280, height: 720, blurb: "HD" },
  { value: "480", label: "480p", width: 854, height: 480, blurb: "Compact" },
  { value: "360", label: "360p", width: 640, height: 360, blurb: "Smallest" },
];

export const TRIM_BITRATES = [
  { value: 800000, label: "0.8 Mbps", blurb: "Draft" },
  { value: 1500000, label: "1.5 Mbps", blurb: "Light" },
  { value: 3000000, label: "3 Mbps", blurb: "Standard" },
  { value: 5000000, label: "5 Mbps", blurb: "High" },
  { value: 8000000, label: "8 Mbps", blurb: "Very high" },
  { value: 0, label: "Auto", blurb: "Keep source quality" },
];

export const TRIM_PRESETS = [
  { label: "First 5s", start: 0, end: 5 },
  { label: "First 10s", start: 0, end: 10 },
  { label: "First 30s", start: 0, end: 30 },
  { label: "Middle half", start: null, end: null, type: "middle" },
  { label: "Last 10s", start: null, end: "last10" },
  { label: "Last 30s", start: null, end: "last30" },
];

export const DEFAULT_TRIM_SETTINGS = {
  format: "mp4",
  resolution: "source",
  bitrate: 0,
  muteAudio: false,
  snap: 0.1,
  loopSelection: false,
  fileName: "",
};

export const TRIM_FAQS = [
  {
    question: "Does the Video Trimmer upload my file?",
    answer:
      "Never. The file is read with the File API in your browser, decoded and re-encoded with WebCodecs through MediaBunny, and written to memory as a new blob. At no point is any byte sent over the network. You can even use the tool offline after the page has loaded.",
  },
  {
    question: "Is trimming lossless?",
    answer:
      "Precise trimming re-encodes only the frames inside the selected range so the cut is frame accurate and the output starts exactly where you asked. Re-encoding always introduces a small generation loss, which is why the bitrate control exists. Choose a higher bitrate if you plan to edit the result again.",
  },
  {
    question: "Which formats can I use?",
    answer:
      "You can open MP4, WebM, MKV, MOV and most other common containers, plus audio files such as MP3, M4A, WAV, OGG and FLAC. Export to MP4, WebM or MKV for video, and M4A, MP3, WAV or OGG when you only need the audio.",
  },
  {
    question: "How do I cut out the middle of a clip?",
    answer:
      "Trim the first section you want, download it, then load the original again and export the second section. The two files can be joined in any editor. A single pass keeps one continuous range from start to end, which is what most trims need.",
  },
  {
    question: "Why is my export slower than the preview?",
    answer:
      "Re-encoding is real video work: your browser must decode, process and encode every frame. Short clips finish in seconds; long or 4K clips take longer. Keep the tab focused during export. Hardware acceleration (Chrome or Edge desktop) is significantly faster.",
  },
  {
    question: "How does the demo clip work?",
    answer:
      "The demo button draws a 10-second animated test card on a canvas and records it with MediaRecorder entirely on your device. It is a normal video file, so you can practise setting in and out points and exporting before using your own footage.",
  },
];

export function formatTimecode(seconds = 0, withMs = true) {
  const safe = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const whole = Math.floor(safe % 60);
  const ms = Math.floor((safe % 1) * 100);
  const base = `${hours > 0 ? `${String(hours).padStart(2, "0")}:` : ""}${String(minutes).padStart(2, "0")}:${String(whole).padStart(2, "0")}`;
  return withMs ? `${base}.${String(ms).padStart(2, "0")}` : base;
}

export function parseTimecode(value = "") {
  const text = String(value).trim();
  if (!text) return 0;
  const parts = text.split(":").map((part) => Number(part) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

export function formatBytes(bytes = 0) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDurationShort(seconds = 0) {
  const safe = Math.max(0, Number(seconds) || 0);
  if (safe < 60) return `${safe.toFixed(1)}s`;
  const minutes = Math.floor(safe / 60);
  const rest = Math.round(safe % 60);
  return `${minutes}m ${rest}s`;
}

export function defaultFormatForFile(file) {
  const name = String(file?.name || "").toLowerCase();
  const type = String(file?.type || "").toLowerCase();
  if (name.endsWith(".webm") || type.includes("webm")) return "webm";
  if (name.endsWith(".mkv") || type.includes("matroska")) return "mkv";
  if (name.endsWith(".mp3") || type.includes("mpeg")) return "mp3";
  if (name.endsWith(".wav") || type.includes("wav")) return "wav";
  if (name.endsWith(".ogg") || type.includes("ogg")) return "ogg";
  if (name.endsWith(".m4a") || type.includes("audio/mp4")) return "m4a";
  if (type.startsWith("audio/")) return "m4a";
  return "mp4";
}

export function baseNameWithoutExtension(name = "clip") {
  return String(name).replace(/\.[^./\\]+$/, "") || "clip";
}

export function buildOutputName(base, formatId) {
  const format = VIDEO_FORMATS.find((item) => item.id === formatId) || VIDEO_FORMATS[0];
  return `${baseNameWithoutExtension(base)}-trimmed.${format.ext}`;
}
