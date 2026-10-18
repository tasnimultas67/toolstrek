// app/(main)/tools-compo/tools/polar-chart-generator/polarChartData.js
// Static reference data, curated palettes and sample datasets for the
// Polar Chart Generator & Rose Chart Studio.

export const POLAR_MODES = [
  {
    id: "area",
    label: "Polar area",
    description: "Rose wedges whose outer edge encodes each value",
  },
  {
    id: "bar",
    label: "Radial bars",
    description: "Separated bars of equal width arranged in a ring",
  },
];

export const VALUE_SCALES = [
  {
    id: "area",
    label: "Area (√)",
    description:
      "Radius grows with the square root of the value so the wedge area stays proportional — the classic Nightingale rose.",
  },
  {
    id: "linear",
    label: "Radius",
    description:
      "Radius grows linearly with the value. Easier to read exact differences but exaggerates area.",
  },
];

export const SCALE_MODES = [
  {
    id: "auto",
    label: "Auto fit",
    description: "Rounds the scale outward to clean, human-friendly values",
  },
  {
    id: "percent",
    label: "0 – 100",
    description: "Fixes the scale to a 0–100 percentage range",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Set your own minimum and maximum values",
  },
];

export const DIRECTIONS = [
  { id: "cw", label: "Clockwise" },
  { id: "ccw", label: "Counter-clockwise" },
];

export const SORT_MODES = [
  { id: "none", label: "Original order" },
  { id: "desc", label: "Highest first" },
  { id: "asc", label: "Lowest first" },
];

export const LABEL_FORMATS = [
  { id: "value", label: "Value" },
  { id: "percent", label: "Percent" },
  { id: "both", label: "Value + %" },
  { id: "label", label: "Category" },
  { id: "none", label: "Hide" },
];

export const LABEL_POSITIONS = [
  { id: "outside", label: "Outside" },
  { id: "inside", label: "Inside" },
];

export const LEGEND_POSITIONS = [
  { id: "right", label: "Right" },
  { id: "bottom", label: "Bottom" },
  { id: "left", label: "Left" },
  { id: "top", label: "Top" },
  { id: "none", label: "Hidden" },
];

// Curated, designer-grade colour palettes (each comfortably supports 10+ wedges).
export const PALETTES = [
  {
    id: "aurora",
    name: "Aurora",
    colors: ["#7c00fe", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#ec4899", "#8b5cf6", "#14b8a6", "#a3e635"],
  },
  {
    id: "oceanic",
    name: "Oceanic",
    colors: ["#0ea5e9", "#0284c7", "#0369a1", "#06b6d4", "#14b8a6", "#0d9488", "#155e75", "#22d3ee", "#38bdf8", "#0f766e"],
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: ["#f97316", "#fb923c", "#f59e0b", "#ef4444", "#e11d48", "#be123c", "#ec4899", "#d946ef", "#f97316", "#fbbf24"],
  },
  {
    id: "forest",
    name: "Forest",
    colors: ["#16a34a", "#22c55e", "#4ade80", "#65a30d", "#84cc16", "#059669", "#0f766e", "#a3e635", "#15803d", "#4d7c0f"],
  },
  {
    id: "berry",
    name: "Berry",
    colors: ["#be123c", "#db2777", "#a21caf", "#7c3aed", "#6d28d9", "#4f46e5", "#c026d3", "#e11d48", "#9333ea", "#f43f5e"],
  },
  {
    id: "corporate",
    name: "Corporate",
    colors: ["#1e40af", "#0369a1", "#0891b2", "#475569", "#334155", "#64748b", "#0f766e", "#1d4ed8", "#0e7490", "#1e293b"],
  },
  {
    id: "pastel",
    name: "Pastel",
    colors: ["#fca5a5", "#fdba74", "#fde68a", "#bef264", "#a7f3d0", "#a5f3fc", "#bfdbfe", "#ddd6fe", "#fbcfe8", "#c7d2fe"],
  },
  {
    id: "neon",
    name: "Neon",
    colors: ["#22d3ee", "#a3e635", "#facc15", "#fb7185", "#e879f9", "#818cf8", "#34d399", "#f472b6", "#38bdf8", "#facc15"],
  },
  {
    id: "earth",
    name: "Earth",
    colors: ["#7c2d12", "#9a3412", "#a16207", "#4d7c0f", "#166534", "#115e59", "#78350f", "#365314", "#854d0e", "#065f46"],
  },
  {
    id: "monochrome",
    name: "Monochrome",
    colors: ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#1e293b", "#526581", "#7c8aa0"],
  },
];

// Ready-to-use sample datasets so users can start in one click.
export const SAMPLE_DATASETS = [
  {
    id: "traffic",
    name: "Website Traffic",
    unit: "sessions per month",
    slices: [
      { label: "Organic Search", value: 4200 },
      { label: "Direct", value: 2600 },
      { label: "Referral", value: 1500 },
      { label: "Social", value: 1100 },
      { label: "Email", value: 640 },
      { label: "Paid Ads", value: 380 },
    ],
  },
  {
    id: "wind",
    name: "Wind Rose",
    unit: "% of time by direction",
    slices: [
      { label: "North", value: 14 },
      { label: "North-East", value: 9 },
      { label: "East", value: 7 },
      { label: "South-East", value: 11 },
      { label: "South", value: 21 },
      { label: "South-West", value: 17 },
      { label: "West", value: 13 },
      { label: "North-West", value: 8 },
    ],
  },
  {
    id: "sales",
    name: "Sales by Region",
    unit: "revenue in thousands",
    slices: [
      { label: "North America", value: 480 },
      { label: "Europe", value: 360 },
      { label: "Asia Pacific", value: 310 },
      { label: "Latin America", value: 140 },
      { label: "Middle East", value: 90 },
      { label: "Africa", value: 55 },
    ],
  },
  {
    id: "energy",
    name: "Energy Mix",
    unit: "% of generation",
    slices: [
      { label: "Solar", value: 28 },
      { label: "Wind", value: 24 },
      { label: "Hydro", value: 18 },
      { label: "Gas", value: 16 },
      { label: "Nuclear", value: 9 },
      { label: "Coal", value: 5 },
    ],
  },
  {
    id: "activity",
    name: "Activity by Hour Block",
    unit: "tasks completed",
    slices: [
      { label: "06–09", value: 12 },
      { label: "09–12", value: 26 },
      { label: "12–15", value: 19 },
      { label: "15–18", value: 23 },
      { label: "18–21", value: 14 },
      { label: "21–24", value: 6 },
    ],
  },
  {
    id: "budget",
    name: "Monthly Budget",
    unit: "% of income",
    slices: [
      { label: "Housing", value: 32 },
      { label: "Savings", value: 20 },
      { label: "Food", value: 18 },
      { label: "Transport", value: 12 },
      { label: "Leisure", value: 10 },
      { label: "Other", value: 8 },
    ],
  },
  {
    id: "survey",
    name: "Customer Satisfaction",
    unit: "responses count",
    slices: [
      { label: "Very Satisfied", value: 486 },
      { label: "Satisfied", value: 274 },
      { label: "Neutral", value: 152 },
      { label: "Dissatisfied", value: 71 },
      { label: "Very Dissatisfied", value: 28 },
    ],
  },
  {
    id: "skills",
    name: "Time on Skills",
    unit: "hours practised",
    slices: [
      { label: "JavaScript", value: 82 },
      { label: "React", value: 74 },
      { label: "CSS", value: 58 },
      { label: "Node.js", value: 46 },
      { label: "Testing", value: 32 },
      { label: "DevOps", value: 21 },
    ],
  },
];

export const DEFAULT_DATASET_ID = "traffic";
export const DEFAULT_PALETTE_ID = "aurora";

export const PALETTE_BY_ID = PALETTES.reduce((acc, palette) => {
  acc[palette.id] = palette;
  return acc;
}, {});

export function getPalette(paletteId) {
  return PALETTE_BY_ID[paletteId] || PALETTES[0];
}

export function getPaletteColor(paletteId, index) {
  const palette = getPalette(paletteId);
  return palette.colors[index % palette.colors.length];
}

export const POLAR_FAQS = [
  {
    q: "How do I make a polar chart online for free?",
    a: "Type your categories and numbers into the data table on the right — or import a CSV or Excel file, load one of the ready-made sample datasets, and a live SVG preview updates instantly. Pick between polar area (rose) and radial bars, choose the area-accurate square-root scale or a linear radius, fine-tune the ring levels, rotation, gaps, fills, labels and legend, then click Download PNG or Download SVG to save a high-resolution image. No sign-up, watermark or upload is required.",
  },
  {
    q: "Can I import my data from a CSV or Excel file?",
    a: "Yes. Drag and drop (or browse to) a .csv, .tsv or .xlsx file in the Data tab, or paste rows of text directly. The tool reads the file entirely in your browser, auto-detects the delimiter and header row, and then lets you map which column is the category and which holds the numeric value using a live preview. Legacy binary .xls files are not supported, so re-save them as .xlsx or CSV first. Nothing is uploaded, and up to twenty-four categories are imported at a time to keep the rose readable.",
  },
  {
    q: "What is a polar chart and when should I use one?",
    a: "A polar chart plots quantitative values around a circle instead of along a straight axis. Each category owns an equal slice of the circle and its value is encoded by how far the shape reaches out from the centre. The polar area chart (also called a Nightingale rose or rose diagram) is the classic form, and it is ideal for showing how a whole splits across cyclical categories — months of the year, compass directions, hours of the day or budget shares — where the overall pattern matters more than exact values.",
  },
  {
    q: "What is the difference between polar area and radial bars?",
    a: "Both use identical geometry — a wedge or bar growing outwards from a centre point. Polar area keeps the wedges touching so the shape reads as one continuous rose, which is perfect for showing a single whole broken into parts. Radial bars insert a gap between each bar and round the outer caps, which isolates every category and makes side-by-side comparison easier. Switch between them at any time with the Chart shape control; the underlying data is unchanged.",
  },
  {
    q: "What does the Area (√) versus Radius scale mean?",
    a: "In a true polar area chart the value is encoded by the AREA of each wedge, not its radius. Because a circle's area grows with the square of its radius, the tool applies a square root to the value so the wedge area stays proportional — this is the honest, classic Nightingale rose. If you switch to Radius the wedge grows linearly with the value, which makes small differences easier to read but visually exaggerates larger values. Choose Area (√) for proportionate roses and Radius when precise comparisons matter.",
  },
  {
    q: "How does the tool calculate the ring scale?",
    a: "In Auto fit mode the generator scans every visible value, finds the largest, then rounds the outer ring outward to a clean, human-friendly number so the ring labels are tidy values such as 20, 40, 60, 80, 100. Choose the 0–100 mode to fix the scale to a percentage range with no surprises, or Custom to enter your own minimum and maximum — ideal for percentages, survey shares or index scores.",
  },
  {
    q: "Can I export the polar chart as PNG or SVG?",
    a: "Absolutely. Download PNG for a pixel-perfect raster image at up to 4× resolution (ideal for slide decks, reports and social posts) or Download SVG for infinitely scalable vector artwork perfect for print, Figma and the web. You can also copy the raw SVG markup to your clipboard, or export the underlying data as CSV or JSON for reuse in spreadsheets and other tools.",
  },
  {
    q: "Does the Polar Chart Generator keep my data private?",
    a: "Completely. Every calculation and the chart rendering happen 100% client-side in your browser using SVG and the HTML canvas. Your labels and numbers are never uploaded, stored or transmitted to any server, so the tool is safe for confidential business, HR, financial and survey data. Once the page has loaded you can even use it offline.",
  },
  {
    q: "What are the best practices for a readable polar chart?",
    a: "Keep the number of categories between five and twelve so each slice stays wide enough to read, order them logically (chronologically for time-based data, or by size for rankings), and prefer the area-accurate square-root scale so the picture stays honest. Use two or three ring levels so the eye can gauge the radius without clutter, label only what matters, and remember that comparing angles and areas is harder than comparing bar lengths — use a bar chart when exact differences are essential.",
  },
];
