export const WHEEL_STORAGE_KEY = "toolstrek_wheel_spinner_v1";

export const PALETTES = {
  vibrant: {
    label: "Vibrant",
    colors: ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#3b82f6"],
  },
  sunset: {
    label: "Sunset",
    colors: ["#f97316", "#ef4444", "#ec4899", "#d946ef", "#f59e0b", "#fb7185", "#c026d3", "#f43f5e"],
  },
  ocean: {
    label: "Ocean",
    colors: ["#0ea5e9", "#06b6d4", "#14b8a6", "#3b82f6", "#22d3ee", "#6366f1", "#0891b2", "#2563eb"],
  },
  forest: {
    label: "Forest",
    colors: ["#059669", "#10b981", "#84cc16", "#65a30d", "#14b8a6", "#22c55e", "#4d7c0f", "#0d9488"],
  },
  pastel: {
    label: "Pastel",
    colors: ["#a78bfa", "#f9a8d4", "#fcd34d", "#6ee7b7", "#67e8f9", "#c4b5fd", "#fca5a5", "#99f6e4"],
  },
  mono: {
    label: "Mono",
    colors: ["#111827", "#1f2937", "#374151", "#4b5563", "#6b7280", "#0f172a", "#334155", "#475569"],
  },
};

export const DEMO_ENTRIES = [
  "Pizza",
  "Sushi",
  "Burgers",
  "Pasta",
  "Salad",
  "Tacos",
  "Curry",
  "Noodles",
];

export const DEFAULT_WHEEL_SETTINGS = {
  duration: 5,
  spins: 6,
  palette: "vibrant",
  sound: true,
  confetti: true,
  removeWinner: false,
  weightMode: "weighted",
  showLabels: true,
};

export function paletteColors(name) {
  return (PALETTES[name] || PALETTES.vibrant).colors;
}

export function colorAt(name, index) {
  const colors = paletteColors(name);
  return colors[index % colors.length];
}

export function textColorFor(hex) {
  const clean = String(hex || "").replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.66 ? "#0f172a" : "#ffffff";
}

export function parseWheelLines(text, paletteName = "vibrant") {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [rawLabel, rawWeight] = line.split("|");
      const label = String(rawLabel || "").trim();
      const weight = Number(String(rawWeight || "").trim());
      return {
        label,
        weight: Number.isFinite(weight) && weight > 0 ? weight : 1,
        color: colorAt(paletteName, index),
      };
    })
    .filter((entry) => entry.label);
}

export function truncateLabel(label, count) {
  const text = String(label || "");
  return text.length > count ? `${text.slice(0, Math.max(1, count - 1))}…` : text;
}

export const WHEEL_FAQS = [
  {
    question: "How does the wheel decide a winner?",
    answer:
      "Every spin uses the Web Crypto API to generate a secure random value. Weighted mode gives each option a probability proportional to its weight, while equal mode ignores weights and treats every option the same. The animation is calculated after the winner is selected, so the pointer always lands on the real result.",
  },
  {
    question: "Why does the wheel start empty?",
    answer:
      "ToolsTrek does not insert sample options into your workspace. Add your own options one at a time, paste a bulk list, or press Load demo data to try the tool. Nothing is saved to a server and an empty wheel stays empty until you add something.",
  },
  {
    question: "Can I use weights and custom colours?",
    answer:
      "Yes. Each option has its own weight and colour. Increase a weight to make an option more likely, or switch to Equal mode for a fair draw. Palettes recolour the wheel instantly, and every row can still override its colour individually.",
  },
  {
    question: "Where is my wheel saved?",
    answer:
      "Your options, settings and spin history are stored in this browser's localStorage. They never leave your device. Clearing site data, using a private window, or pressing Clear all removes them permanently.",
  },
  {
    question: "Can I export the options and results?",
    answer:
      "Yes. Export the wheel as JSON or CSV, import a JSON wheel, and download the spin history as CSV. The winner card also offers a one-click copy action for pasting the result into a chat or document.",
  },
  {
    question: "Does the wheel work on mobile and offline?",
    answer:
      "The wheel is fully responsive, touch friendly and keyboard accessible. Once the page has loaded it runs entirely in your browser, including sound, confetti and local storage, so it keeps working without an internet connection.",
  },
];
