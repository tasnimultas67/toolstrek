/* -------------------------------------------------------------------------- */
/*  Subtitle Editor & Sync — SRT/VTT parsing, timing maths and validation.    */
/* -------------------------------------------------------------------------- */

export const SUBTITLE_STORAGE_KEY = "toolstrek_subtitle_editor_v1";

export const FPS_OPTIONS = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60];

export const SUBTITLE_FAQS = [
  {
    question: "What is the difference between SRT and VTT?",
    answer:
      "SRT is the older, simpler format: a cue number, a timing line with a comma before milliseconds, and plain text. WebVTT (VTT) starts with WEBVTT, uses a dot before milliseconds, and supports styling, positioning and metadata. VTT is the web standard; SRT is still the most widely accepted subtitle file for video editors.",
  },
  {
    question: "How long should each subtitle cue stay on screen?",
    answer:
      "A comfortable cue runs for 1–6 seconds and carries at most two lines of about 42 characters. Reading speed should stay under roughly 20–25 characters per second. Short cues are harder to read than slightly longer ones, so merge tiny fragments instead of cramming them together.",
  },
  {
    question: "How do I fix subtitles that are out of sync?",
    answer:
      "If every cue is offset by the same amount, use Shift all and add or subtract the delay. If the drift grows over time, the file was probably authored at a different frame rate: use the FPS converter to scale the whole timeline. For a single bad cue, edit its start and end times directly.",
  },
  {
    question: "Why do subtitles drift after converting frame rates?",
    answer:
      "Film is often 23.976 fps while PAL video runs at 25 fps. Playing a 24 fps timeline at 25 fps makes everything finish about 4% sooner. Scaling every cue by the ratio of source to target frame rate — 24/25 here — restores sync across the whole file.",
  },
  {
    question: "What does characters per second mean?",
    answer:
      "CPS is the number of characters a viewer must read each second. Around 15–20 is comfortable, 20–25 is acceptable for short cues, and above 25 becomes tiring. The validator flags cues that exceed your chosen limit so you can shorten the text or extend the timing.",
  },
  {
    question: "Can I edit subtitles without uploading my video?",
    answer:
      "Yes. The editor works on the subtitle file itself. If you add a local video for preview, the browser reads it directly from your device with a temporary object URL. Neither the video nor the subtitle file is sent anywhere.",
  },
  {
    question: "What files can I export?",
    answer:
      "SRT for editors and players, VTT for the web, CSV for spreadsheets and translation workflows, and a plain-text transcript with timecodes. You can also export the whole project as JSON and re-import it later.",
  },
  {
    question: "Does the editor support right-to-left or Unicode subtitles?",
    answer:
      "Yes. Cue text is stored as Unicode and exported as UTF-8, so Arabic, Bengali, Hindi, Chinese, Japanese and emoji all round-trip correctly. VTT can additionally carry direction and alignment settings, which this editor leaves to the player.",
  },
];

export const EMPTY_SUBTITLE_STATE = {
  cues: [],
  sourceName: "",
  lastFind: "",
  lastReplace: "",
};

export function createEmptySubtitleState() {
  return { ...EMPTY_SUBTITLE_STATE, cues: [] };
}

let cueSeed = 0;
function nextId() {
  cueSeed += 1;
  return `cue-${Date.now().toString(36)}-${cueSeed}`;
}

export function makeCue(start = 0, end = 2, text = "") {
  return { id: nextId(), start, end, text };
}

export function createDemoCues() {
  return [
    makeCue(0.5, 3.4, "Good subtitles are invisible: they carry the meaning without pulling attention away from the picture."),
    makeCue(3.9, 7.2, "Start by importing an SRT or VTT file, or paste the text and press Parse."),
    makeCue(7.7, 11.4, "Every cue is editable. Change the timing, rewrite the line, duplicate it or remove it."),
    makeCue(11.9, 15.8, "If the whole file is early or late, shift every cue by the same number of seconds."),
    makeCue(16.2, 20.6, "If the drift grows over time, the source was probably authored at a different frame rate."),
    makeCue(21.1, 25.2, "The FPS converter rescales the timeline so the last cue still lands where it should."),
    makeCue(25.7, 29.9, "The validator flags overlaps, very short cues and lines that are too fast to read comfortably."),
    makeCue(30.4, 34.8, "Export SRT, VTT, CSV or a plain transcript — everything happens in your browser."),
  ];
}

/* ------------------------------- Timestamps ------------------------------- */

export function parseTimestamp(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const clean = String(value || "")
    .trim()
    .replace(",", ".");
  if (!clean) return null;
  const parts = clean.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

export function formatTimestamp(seconds, style = "srt") {
  const totalMs = Math.max(0, Math.round((Number(seconds) || 0) * 1000));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const milliseconds = totalMs % 1000;
  const separator = style === "vtt" ? "." : ",";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}${separator}${String(milliseconds).padStart(3, "0")}`;
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "—";
  const total = Math.max(0, seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return minutes ? `${minutes}m ${secs.toFixed(1)}s` : `${secs.toFixed(1)}s`;
}

/* --------------------------------- Parsers -------------------------------- */

export function parseSubtitles(text) {
  const normalised = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalised) return [];
  const blocks = normalised.split(/\n{2,}/);
  const cues = [];

  blocks.forEach((block) => {
    const lines = block.split("\n");
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex === -1) return;
    const timing = lines[timingIndex];
    const [startPart, endPart] = timing.split("-->");
    if (!startPart || !endPart) return;
    const start = parseTimestamp(startPart.trim().split(/\s+/)[0]);
    const end = parseTimestamp(endPart.trim().split(/\s+/)[0]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;
    const textLines = lines
      .slice(timingIndex + 1)
      .join("\n")
      .replace(/\{\\[^}]+\}/g, "")
      .trim();
    cues.push(makeCue(start, end, textLines));
  });

  return cues.sort((a, b) => a.start - b.start);
}

export function serializeSrt(cues) {
  return cues
    .filter((cue) => cue.text.trim() || cue.end > cue.start)
    .map((cue, index) => {
      const text = cue.text.trim() || " ";
      return `${index + 1}\n${formatTimestamp(cue.start, "srt")} --> ${formatTimestamp(cue.end, "srt")}\n${text}`;
    })
    .join("\n\n")
    .concat(cues.length ? "\n" : "");
}

export function serializeVtt(cues) {
  const body = cues
    .filter((cue) => cue.text.trim() || cue.end > cue.start)
    .map((cue, index) => {
      const text = cue.text.trim() || " ";
      return `${index + 1}\n${formatTimestamp(cue.start, "vtt")} --> ${formatTimestamp(cue.end, "vtt")}\n${text}`;
    })
    .join("\n\n");
  return `WEBVTT\n\n${body}${body ? "\n" : ""}`;
}

export function serializeCsv(cues) {
  const rows = [["Index", "Start", "End", "Duration (s)", "Characters", "CPS", "Text"]];
  cues.forEach((cue, index) => {
    const duration = Math.max(0, cue.end - cue.start);
    const characters = cue.text.replace(/\s+/g, " ").trim().length;
    rows.push([
      index + 1,
      formatTimestamp(cue.start, "srt"),
      formatTimestamp(cue.end, "srt"),
      duration.toFixed(2),
      characters,
      duration ? (characters / duration).toFixed(1) : "0",
      cue.text.replace(/\n/g, " / "),
    ]);
  });
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function serializeTranscript(cues) {
  return cues
    .map((cue) => `[${formatTimestamp(cue.start, "srt").slice(0, 8)}] ${cue.text.replace(/\n/g, " ").trim()}`)
    .join("\n");
}

/* ------------------------------- Timing edits ----------------------------- */

export function shiftCues(cues, seconds) {
  if (!Number.isFinite(seconds) || seconds === 0) return cues;
  return cues.map((cue) => {
    const duration = Math.max(0.1, cue.end - cue.start);
    let start = cue.start + seconds;
    if (start < 0) start = 0;
    return { ...cue, start, end: start + duration };
  });
}

export function scaleCues(cues, factor, anchor = 0) {
  if (!Number.isFinite(factor) || factor <= 0 || factor === 1) return cues;
  return cues.map((cue) => ({
    ...cue,
    start: Math.max(0, anchor + (cue.start - anchor) * factor),
    end: Math.max(0.1, anchor + (cue.end - anchor) * factor),
  }));
}

export function convertFps(cues, fromFps, toFps) {
  const from = Number(fromFps);
  const to = Number(toFps);
  if (!from || !to || from === to) return cues;
  return scaleCues(cues, from / to, cues[0]?.start || 0);
}

export function replaceInCues(cues, find, replace, caseSensitive = false) {
  if (!find) return { cues, count: 0 };
  let count = 0;
  const next = cues.map((cue) => {
    if (!cue.text.includes(find) && !caseSensitive) {
      const pattern = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      if (!pattern.test(cue.text)) return cue;
    }
    const matches = caseSensitive
      ? cue.text.split(find).length - 1
      : (cue.text.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length;
    count += matches;
    if (!matches) return cue;
    if (caseSensitive) {
      return { ...cue, text: cue.text.split(find).join(replace) };
    }
    const pattern = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return { ...cue, text: cue.text.replace(pattern, replace) };
  });
  return { cues: next, count };
}

/* -------------------------------- Validation ------------------------------- */

export function cueStats(cue) {
  const duration = Math.max(0, cue.end - cue.start);
  const characters = cue.text.replace(/\s+/g, " ").trim().length;
  const cps = duration ? characters / duration : 0;
  const lines = cue.text.split("\n");
  const longest = lines.reduce((max, line) => Math.max(max, line.length), 0);
  return { duration, characters, cps, lineCount: lines.length, longest };
}

export function validateCues(cues, { maxCps = 25, maxLine = 42 } = {}) {
  const issues = [];
  const sorted = cues
    .map((cue, index) => ({ cue, index }))
    .sort((a, b) => a.cue.start - b.cue.start);

  cues.forEach((cue, index) => {
    const stats = cueStats(cue);
    if (!cue.text.trim()) {
      issues.push({ cueIndex: index, severity: "error", message: `Cue ${index + 1} has no text.` });
    }
    if (cue.end <= cue.start) {
      issues.push({ cueIndex: index, severity: "error", message: `Cue ${index + 1} ends before it starts.` });
    } else if (stats.duration < 0.6) {
      issues.push({ cueIndex: index, severity: "warning", message: `Cue ${index + 1} lasts under 0.6 s — too fast to read.` });
    } else if (stats.duration > 8) {
      issues.push({ cueIndex: index, severity: "info", message: `Cue ${index + 1} stays on screen for ${stats.duration.toFixed(1)} s.` });
    }
    if (stats.cps > maxCps) {
      issues.push({
        cueIndex: index,
        severity: "warning",
        message: `Cue ${index + 1} reads at ${stats.cps.toFixed(1)} CPS — aim for ${maxCps} or less.`,
      });
    }
    if (stats.longest > maxLine) {
      issues.push({
        cueIndex: index,
        severity: "warning",
        message: `Cue ${index + 1} has a ${stats.longest}-character line — aim for ${maxLine}.`,
      });
    }
    if (stats.lineCount > 2) {
      issues.push({ cueIndex: index, severity: "warning", message: `Cue ${index + 1} has ${stats.lineCount} lines — two is the usual maximum.` });
    }
  });

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (current.cue.start < previous.cue.end - 0.001) {
      issues.push({
        cueIndex: current.index,
        severity: "error",
        message: `Cue ${current.index + 1} overlaps cue ${previous.index + 1}.`,
      });
    }
  }

  return issues;
}

export function subtitleSummary(cues) {
  if (!cues.length) {
    return { count: 0, duration: 0, words: 0, characters: 0, issues: 0 };
  }
  const start = Math.min(...cues.map((cue) => cue.start));
  const end = Math.max(...cues.map((cue) => cue.end));
  const words = cues.reduce((total, cue) => total + cue.text.trim().split(/\s+/).filter(Boolean).length, 0);
  const characters = cues.reduce((total, cue) => total + cue.text.replace(/\s+/g, "").length, 0);
  return { count: cues.length, duration: Math.max(0, end - start), words, characters };
}
