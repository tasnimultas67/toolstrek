export const RECORDER_STORAGE_KEY = "toolstrek_screen_recorder_v1";

export const MIME_CANDIDATES = [
  { value: "video/webm;codecs=vp9,opus", label: "WebM · VP9 + Opus", ext: "webm", blurb: "Best compression" },
  { value: "video/webm;codecs=vp8,opus", label: "WebM · VP8 + Opus", ext: "webm", blurb: "Widest support" },
  { value: "video/webm;codecs=h264,opus", label: "WebM · H.264 + Opus", ext: "webm", blurb: "Hardware friendly" },
  { value: "video/mp4;codecs=avc1.42E01E,mp4a.40.2", label: "MP4 · H.264 + AAC", ext: "mp4", blurb: "Editors & macOS" },
  { value: "video/mp4", label: "MP4 · Auto", ext: "mp4", blurb: "Browser defaults" },
  { value: "video/x-matroska;codecs=avc1", label: "MKV · H.264", ext: "mkv", blurb: "Matroska container" },
];

export const RESOLUTIONS = [
  { value: "source", label: "Source", width: 0, height: 0, blurb: "Native capture size" },
  { value: "2160", label: "4K", width: 3840, height: 2160, blurb: "Ultra HD" },
  { value: "1440", label: "1440p", width: 2560, height: 1440, blurb: "QHD" },
  { value: "1080", label: "1080p", width: 1920, height: 1080, blurb: "Full HD" },
  { value: "720", label: "720p", width: 1280, height: 720, blurb: "HD · lighter" },
  { value: "480", label: "480p", width: 854, height: 480, blurb: "Small files" },
];

export const FRAME_RATES = [
  { value: 15, label: "15 fps", blurb: "Slides & docs" },
  { value: 24, label: "24 fps", blurb: "Cinematic" },
  { value: 30, label: "30 fps", blurb: "Balanced" },
  { value: 60, label: "60 fps", blurb: "Smooth motion" },
];

export const BITRATE_OPTIONS = [
  { value: 1000000, label: "1 Mbps", blurb: "Draft" },
  { value: 2500000, label: "2.5 Mbps", blurb: "Light" },
  { value: 5000000, label: "5 Mbps", blurb: "Standard" },
  { value: 8000000, label: "8 Mbps", blurb: "High" },
  { value: 16000000, label: "16 Mbps", blurb: "Maximum" },
];

export const DEFAULT_RECORDER_SETTINGS = {
  mime: "video/webm;codecs=vp9,opus",
  resolution: "1080",
  fps: 30,
  bitrate: 8000000,
  systemAudio: true,
  microphone: false,
  micGain: 100,
  webcam: false,
  webcamSize: 22,
  webcamPosition: "bottom-right",
  webcamMirror: true,
  showClock: false,
  showWatermark: false,
  countdown: 3,
  pauseOnBlur: false,
};

export const RECORDER_FAQS = [
  {
    question: "How does the Screen Recorder work?",
    answer:
      "It uses the browser's native getDisplayMedia API to ask which screen, window or tab you want to share, then records that stream with MediaRecorder. Nothing is uploaded: the finished file is assembled in memory and offered as a local download.",
  },
  {
    question: "Which browsers support screen recording?",
    answer:
      "Chrome, Edge, Opera and other Chromium browsers support screen capture with audio on desktop. Firefox supports screen capture but system audio depends on the operating system. Safari support is limited and usually records video without tab audio. The tool checks available codecs and only offers formats your browser reports as supported.",
  },
  {
    question: "Can I record my microphone and system audio together?",
    answer:
      "Yes. Enable Microphone and keep System audio on. Both audio sources are mixed through a Web Audio graph into a single track, so the final file contains narration and the sound from the shared tab or desktop. Microphone gain can be adjusted before recording.",
  },
  {
    question: "How does the webcam overlay work?",
    answer:
      "When Webcam is enabled, the display stream is painted onto an offscreen canvas at your chosen resolution, and your camera is drawn as a picture-in-picture bubble. The canvas stream is what gets recorded, which also makes the timer and watermark overlays possible.",
  },
  {
    question: "Are my recordings stored anywhere?",
    answer:
      "No. Recordings exist only in this browser tab's memory as temporary blob URLs. They disappear when you reload or close the page. Download anything you want to keep — the tool never sends media to a server or to local storage.",
  },
  {
    question: "Why does recording stop when I close the shared tab?",
    answer:
      "Browsers end a display capture track when the shared surface disappears, and the recorder stops with it to avoid producing a corrupt file. Keep the shared tab or window open while recording, or record the entire screen instead.",
  },
];

export function pickSupportedMime(candidates = MIME_CANDIDATES) {
  if (typeof MediaRecorder === "undefined") return "";
  const found = candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate.value));
  return found ? found.value : "";
}

export function mimeLabel(mime) {
  return MIME_CANDIDATES.find((candidate) => candidate.value === mime)?.label || mime || "Browser default";
}

export function extensionForMime(mime) {
  return MIME_CANDIDATES.find((candidate) => candidate.value === mime)?.ext || "webm";
}

export function formatBytes(bytes = 0) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDuration(ms = 0) {
  const total = Math.max(0, Math.floor(Number(ms) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function buildFileName(prefix = "toolstrek-recording") {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  return `${prefix}-${stamp}`;
}
