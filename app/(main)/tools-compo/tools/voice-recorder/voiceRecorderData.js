export const VOICE_STORAGE_KEY = "toolstrek_voice_recorder_v1";

export const RECORD_FORMATS = [
  {
    value: "webm",
    label: "WebM",
    blurb: "Opus · smallest files",
    ext: "webm",
    candidates: ["audio/webm;codecs=opus", "audio/webm"],
  },
  {
    value: "ogg",
    label: "OGG",
    blurb: "Opus · open format",
    ext: "ogg",
    candidates: ["audio/ogg;codecs=opus", "audio/ogg"],
  },
  {
    value: "mp4",
    label: "M4A",
    blurb: "AAC · Apple friendly",
    ext: "m4a",
    candidates: ["audio/mp4", "audio/mp4;codecs=mp4a.40.2", "audio/aac"],
  },
  {
    value: "wav",
    label: "WAV",
    blurb: "Lossless PCM · universal",
    ext: "wav",
    candidates: [],
  },
];

export const BITRATES = [
  { value: 64000, label: "64 kbps", blurb: "Voice notes" },
  { value: 96000, label: "96 kbps", blurb: "Podcast mono" },
  { value: 128000, label: "128 kbps", blurb: "Balanced" },
  { value: 192000, label: "192 kbps", blurb: "Music" },
  { value: 256000, label: "256 kbps", blurb: "High fidelity" },
];

export const SAMPLE_RATES = [
  { value: 0, label: "Auto" },
  { value: 44100, label: "44.1 kHz" },
  { value: 48000, label: "48 kHz" },
];

export const CAMERA_RESOLUTIONS = [
  { value: "720", label: "720p", width: 1280, height: 720, blurb: "Light" },
  { value: "1080", label: "1080p", width: 1920, height: 1080, blurb: "Full HD" },
  { value: "1440", label: "1440p", width: 2560, height: 1440, blurb: "Quad HD" },
  { value: "2160", label: "4K", width: 3840, height: 2160, blurb: "Ultra HD" },
];

export const DEFAULT_VOICE_SETTINGS = {
  format: "webm",
  bitrate: 128000,
  sampleRate: 0,
  channelCount: 1,
  deviceId: "",
  videoDeviceId: "",
  cameraResolution: "1080",
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  countdown: true,
  mirrorCamera: true,
  showGuides: true,
};

export function formatBytes(bytes) {
  if (!bytes || Number.isNaN(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatDuration(ms) {
  const total = Math.max(0, Math.round((ms || 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function pickMime(formatValue, supported) {
  const format = RECORD_FORMATS.find((item) => item.value === formatValue) || RECORD_FORMATS[0];
  if (!format.candidates.length) return "";
  return format.candidates.find((candidate) => supported.includes(candidate)) || "";
}

export function supportedFormats() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return [];
  return RECORD_FORMATS.filter(
    (format) => !format.candidates.length || format.candidates.some((mime) => MediaRecorder.isTypeSupported(mime)),
  ).map((format) => format.value);
}

export function encodeWavFromBuffer(buffer) {
  const channels = Math.min(2, buffer.numberOfChannels || 1);
  const sampleRate = buffer.sampleRate;
  const frames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = frames * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const channelData = [];
  for (let channel = 0; channel < channels; channel += 1) {
    channelData.push(buffer.getChannelData(channel));
  }

  let offset = 44;
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][frame] || 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export async function buildDemoRecording() {
  const sampleRate = 44100;
  const duration = 4;
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineContext) throw new Error("This browser cannot synthesise demo audio.");

  const context = new OfflineContext(1, sampleRate * duration, sampleRate);
  const master = context.createGain();
  master.gain.value = 0.5;
  master.connect(context.destination);

  const notes = [
    { start: 0, freq: 392, length: 0.55 },
    { start: 0.5, freq: 523.25, length: 0.55 },
    { start: 1.0, freq: 659.25, length: 0.7 },
    { start: 1.65, freq: 523.25, length: 0.4 },
    { start: 2.05, freq: 587.33, length: 0.5 },
    { start: 2.5, freq: 493.88, length: 0.6 },
    { start: 3.1, freq: 392, length: 0.8 },
  ];

  notes.forEach((note) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = note.freq;
    const attack = 0.04;
    const release = 0.12;
    gain.gain.setValueAtTime(0.0001, note.start);
    gain.gain.exponentialRampToValueAtTime(0.45, note.start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, note.start + note.length - release);
    gain.gain.setValueAtTime(0.0001, note.start + note.length);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(note.start);
    oscillator.stop(note.start + note.length + 0.02);
  });

  const rendered = await context.startRendering();
  return encodeWavFromBuffer(rendered);
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export const VOICE_FAQS = [
  {
    question: "How does the Voice Recorder work?",
    answer:
      "The tool captures your microphone with the browser getUserMedia API and records it using MediaRecorder. Audio stays in memory as a blob URL, so playback and downloads happen entirely on your device. Choose WebM, OGG, M4A or WAV before you start recording.",
  },
  {
    question: "Is anything uploaded to a server?",
    answer:
      "No. Microphone audio, camera frames, snapshots and recordings never leave your device. The page makes no upload request and does not require an account. Closing or reloading the tab permanently discards the session.",
  },
  {
    question: "What can the Mic Test measure?",
    answer:
      "The mic test shows a live oscilloscope, RMS and peak levels in decibels, an approximate noise floor, clipping events and a signal-quality score. It also lets you switch input devices so you can compare headset and built-in microphones before recording.",
  },
  {
    question: "Why does my camera preview stay blank?",
    answer:
      "Browsers only grant camera access on HTTPS or localhost, and the permission must be allowed for this site. If another application is already using the camera, close it and press Start camera again. The demo feed button shows a synthetic test pattern without using your camera.",
  },
  {
    question: "What is the demo data button for?",
    answer:
      "Every field starts empty. Load demo audio to hear a locally synthesised melody and try the playback, rename and download controls. The demo camera feed draws a moving test card on a canvas, so you can explore the layout without granting permissions.",
  },
  {
    question: "Which recording format should I choose?",
    answer:
      "WebM Opus is the smallest and works in Chrome, Edge and Firefox. M4A AAC plays natively on Apple devices. WAV is lossless and accepted everywhere, but files are much larger. The tool only lists formats your browser can encode, and WAV is generated locally from the recorded audio.",
  },
];
