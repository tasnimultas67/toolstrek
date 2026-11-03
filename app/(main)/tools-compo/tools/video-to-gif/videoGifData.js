export const VIDEO_GIF_STORAGE_KEY = "toolstrek_video_to_gif_v1";

export const GIF_FPS = [
  { value: 5, label: "5 fps" },
  { value: 8, label: "8 fps" },
  { value: 10, label: "10 fps" },
  { value: 12, label: "12 fps" },
  { value: 15, label: "15 fps" },
  { value: 20, label: "20 fps" },
  { value: 24, label: "24 fps" },
  { value: 30, label: "30 fps" },
];

export const GIF_WIDTHS = [
  { value: 0, label: "Original" },
  { value: 1080, label: "1080" },
  { value: 800, label: "800" },
  { value: 640, label: "640" },
  { value: 480, label: "480" },
  { value: 360, label: "360" },
];

export const GIF_FAQS = [
  {
    question: "How does the Video to GIF converter work?",
    answer:
      "Choose a video, set the start and end points, pick a frame rate and width, then generate. The browser seeks through the selected range, paints each frame to a canvas and hands it to a local GIF encoder. The finished GIF is assembled in memory and downloaded from your device.",
  },
  {
    question: "Is my video uploaded to a server?",
    answer:
      "No. The file is opened with the File API, decoded by the browser's own video element and encoded on your machine. No frame, filename or file size is transmitted. The tool also works offline once the page has loaded.",
  },
  {
    question: "How long can the clip be?",
    answer:
      "There is no fixed time limit, but GIF grows quickly. Keep clips short, lower the frame rate and reduce the width for the smallest file. The tool estimates the frame count and warns you before a very large encode.",
  },
  {
    question: "What frame rate should I choose?",
    answer:
      "10 to 15 fps feels smooth for most memes and reactions while keeping files small. Use 5 to 8 fps for slideshows or subtle motion, and 20 to 30 fps only for short, high-motion clips.",
  },
  {
    question: "What do quality, dithering and ping-pong do?",
    answer:
      "Quality controls the GIF palette search — a lower number means better colours and a larger file. Dithering adds a fine pattern that hides colour banding. Ping-pong plays the clip forward and then backward, which is popular for reaction GIFs.",
  },
  {
    question: "What is the demo clip?",
    answer:
      "Every field starts empty. The demo button draws a three-second animated test card on a canvas, records it with MediaRecorder on your device and loads it as a normal video, so you can try trimming and encoding without picking a file.",
  },
];

export const DEFAULT_GIF_SETTINGS = {
  width: 640,
  fps: 12,
  quality: 10,
  loop: 0,
  speed: 1,
  dither: true,
  pingPong: false,
  fit: "contain",
  background: "#000000",
};

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00.0";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toFixed(1).padStart(4, "0")}`;
}

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

export function estimateGifSize({ width, height, frames, quality }) {
  if (!width || !height || !frames) return 0;
  const pixels = width * height * frames;
  const factor = 0.05 + quality / 420;
  return Math.round(pixels * factor * 0.14);
}

export function pickVideoMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find((mime) => MediaRecorder.isTypeSupported(mime)) || "";
}

export async function buildDemoClip() {
  if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) {
    throw new Error("This browser cannot generate a demo clip. Upload a short video instead.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 540;
  const context = canvas.getContext("2d");
  const stream = canvas.captureStream(30);
  const mimeType = pickVideoMime();
  if (!mimeType) throw new Error("This browser cannot record the demo clip. Upload a video instead.");

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
  const chunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data?.size) chunks.push(event.data);
  };

  const stopped = new Promise((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = () => reject(new Error("The demo clip recorder failed."));
  });

  const started = performance.now();
  const duration = 3000;
  let frame = 0;
  let active = true;

  const paint = () => {
    if (!active) return;
    const elapsed = performance.now() - started;
    if (elapsed >= duration) {
      active = false;
      recorder.stop();
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    drawDemoFrame(context, canvas.width, canvas.height, elapsed);
    frame += 1;
    requestAnimationFrame(paint);
  };

  recorder.start(100);
  requestAnimationFrame(paint);

  const blob = await stopped;
  void frame;
  return blob;
}

function drawDemoFrame(context, width, height, time) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#4c1d95");
  gradient.addColorStop(0.5, "#0f172a");
  gradient.addColorStop(1, "#0e7490");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(148,163,184,0.18)";
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  const orbit = time / 620;
  const cx = width / 2 + Math.cos(orbit) * width * 0.24;
  const cy = height / 2 + Math.sin(orbit * 1.5) * height * 0.2;
  const radius = 64 + Math.sin(orbit * 2) * 14;

  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  const ball = context.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  ball.addColorStop(0, "#f472b6");
  ball.addColorStop(1, "#facc15");
  context.fillStyle = ball;
  context.fill();

  context.beginPath();
  context.arc(width - cx, height - cy, radius * 0.55, 0, Math.PI * 2);
  context.fillStyle = "rgba(56,189,248,0.85)";
  context.fill();

  context.fillStyle = "rgba(15,23,42,0.65)";
  context.fillRect(0, height - 84, width, 84);
  context.fillStyle = "#f8fafc";
  context.font = "700 30px ui-sans-serif, system-ui, sans-serif";
  context.textAlign = "left";
  context.fillText("ToolsTrek demo clip · 3 seconds", 36, height - 44);
  context.fillStyle = "#67e8f9";
  context.font = "600 22px ui-monospace, monospace";
  context.textAlign = "right";
  context.fillText(`${(time / 1000).toFixed(1)}s`, width - 36, height - 44);
}
