export const MEME_STORAGE_KEY = "toolstrek_meme_generator_v1";

export const MEME_FONTS = [
  { value: "Impact", label: "Impact (classic)", stack: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  { value: "Arial Black", label: "Arial Black", stack: "'Arial Black', 'Arial Bold', Gadget, sans-serif" },
  { value: "Arial", label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { value: "Verdana", label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { value: "Trebuchet", label: "Trebuchet MS", stack: "'Trebuchet MS', Tahoma, sans-serif" },
  { value: "Georgia", label: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  { value: "Courier", label: "Courier New", stack: "'Courier New', Courier, monospace" },
  { value: "Comic", label: "Comic Sans", stack: "'Comic Sans MS', 'Chalkboard SE', cursive" },
];

export const MEME_SIZES = [
  { value: "1080x1080", label: "Square", width: 1080, height: 1080, blurb: "1:1 · social" },
  { value: "1080x1350", label: "Portrait", width: 1080, height: 1350, blurb: "4:5 · feed" },
  { value: "1920x1080", label: "Landscape", width: 1920, height: 1080, blurb: "16:9 · video" },
  { value: "1080x1920", label: "Story", width: 1080, height: 1920, blurb: "9:16 · stories" },
];

export const MEME_BACKGROUNDS = [
  { name: "Midnight", type: "solid", color: "#0f172a" },
  { name: "Paper", type: "solid", color: "#f8fafc" },
  { name: "Sunset", type: "gradient", from: "#f97316", to: "#db2777", angle: 135 },
  { name: "Ocean", type: "gradient", from: "#0ea5e9", to: "#0f766e", angle: 120 },
  { name: "Candy", type: "gradient", from: "#a855f7", to: "#ec4899", angle: 160 },
  { name: "Lime", type: "gradient", from: "#84cc16", to: "#0d9488", angle: 90 },
  { name: "Ember", type: "gradient", from: "#ef4444", to: "#f59e0b", angle: 145 },
  { name: "Mono", type: "gradient", from: "#1e293b", to: "#64748b", angle: 135 },
];

export const MEME_DEFAULT_PROJECT = {
  width: 1080,
  height: 1080,
  background: {
    type: "solid",
    color: "#0f172a",
    from: "#7c3aed",
    to: "#ec4899",
    angle: 135,
    overlay: 0,
  },
  image: "",
  imageFit: "cover",
  imageScale: 1,
  imageX: 0,
  imageY: 0,
  imageOpacity: 1,
  imageBlur: 0,
  watermark: false,
  layers: [],
};

export const MEME_FAQS = [
  {
    question: "How does the Meme Generator work?",
    answer:
      "Upload an image or start with a blank canvas, then add as many text layers as you need. Each layer supports drag positioning, font, size, colour, gradient fill, outline, shadow, highlight box, rotation, opacity, alignment and letter spacing. The canvas is rendered at full resolution in your browser and exported as PNG, JPEG or WebP.",
  },
  {
    question: "Are my images uploaded anywhere?",
    answer:
      "No. Images are read with the File API, drawn onto an HTML canvas and exported locally. Nothing is sent to a server, no account is required, and closing the tab discards the session. The editor also works offline after the page loads.",
  },
  {
    question: "Can I save my meme and come back later?",
    answer:
      "Yes. The project autosaves to this browser's local storage, including text layers and the background image where space allows. You can also export a .json project file and import it later on another device. Export JSON is available in the Export panel.",
  },
  {
    question: "Why does the demo button exist?",
    answer:
      "Every field starts blank so nothing is pre-filled for you. Load demo data to see a complete gradient layout with two styled captions, then edit or delete it. The demo is generated locally and does not use an external image.",
  },
  {
    question: "Which export size should I pick?",
    answer:
      "Use 1x for quick sharing, 2x for crisp social posts and 3x for print or large displays. The canvas base size is shown in the Size panel, so a 1080 × 1080 project at 2x exports a 2160 × 2160 PNG.",
  },
  {
    question: "Can I move text with the keyboard?",
    answer:
      "Yes. Select a text layer and press the arrow keys to nudge it by one pixel, or hold Shift for ten pixels. Delete removes the selected layer and Escape clears the selection. Dragging directly on the canvas also works on touch screens and with a mouse.",
  },
];

export const makeId = () => `layer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function createLayer(project, overrides = {}) {
  return {
    id: makeId(),
    text: "",
    font: "Impact",
    size: Math.round(project.width * 0.09),
    color: "#ffffff",
    fillType: "solid",
    gradientFrom: "#facc15",
    gradientTo: "#f97316",
    strokeColor: "#000000",
    strokeWidth: Math.round(project.width * 0.006),
    shadow: true,
    uppercase: true,
    align: "center",
    rotation: 0,
    opacity: 1,
    lineHeight: 1.08,
    letterSpacing: 0,
    maxWidth: 86,
    highlight: false,
    highlightColor: "#000000",
    x: project.width / 2,
    y: project.height * 0.2,
    visible: true,
    ...overrides,
  };
}

export function cloneProject(project) {
  return {
    ...project,
    background: { ...project.background },
    layers: project.layers.map((layer) => ({ ...layer })),
  };
}

export function fontStack(value) {
  return (MEME_FONTS.find((font) => font.value === value) || MEME_FONTS[0]).stack;
}
