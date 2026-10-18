// app/(main)/tools-compo/tools/radar-chart-generator/radarChartData.js
// Static reference data, curated palettes and sample datasets for the
// Radar Chart Generator & Spider Chart Studio.

export const GRID_SHAPES = [
  {
    id: "polygon",
    label: "Polygon web",
    description: "Angular grid lines that mirror the chart outline",
  },
  {
    id: "circle",
    label: "Circle rings",
    description: "Rounded concentric rings for a softer look",
  },
];

export const SCALE_MODES = [
  {
    id: "auto",
    label: "Auto fit",
    description: "Rounds the axis outward to nice, human-friendly values",
  },
  {
    id: "fixed100",
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

export const VALUE_LABEL_FORMATS = [
  { id: "none", label: "Hide" },
  { id: "value", label: "Value" },
  { id: "percent", label: "Percent" },
  { id: "both", label: "Value + %" },
];

export const LEGEND_POSITIONS = [
  { id: "top", label: "Top" },
  { id: "right", label: "Right" },
  { id: "bottom", label: "Bottom" },
  { id: "left", label: "Left" },
  { id: "none", label: "Hidden" },
];

export const SORT_MODES = [
  { id: "none", label: "Original order" },
  { id: "desc", label: "Highest first" },
  { id: "asc", label: "Lowest first" },
];

// Curated, designer-grade colour palettes (each comfortably supports 6+ series).
export const PALETTES = [
  {
    id: "aurora",
    name: "Aurora",
    colors: ["#7c00fe", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#ec4899", "#8b5cf6"],
  },
  {
    id: "oceanic",
    name: "Oceanic",
    colors: ["#0ea5e9", "#0284c7", "#0369a1", "#06b6d4", "#14b8a6", "#0d9488", "#155e75", "#22d3ee"],
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: ["#f97316", "#fb923c", "#f59e0b", "#ef4444", "#e11d48", "#be123c", "#ec4899", "#d946ef"],
  },
  {
    id: "forest",
    name: "Forest",
    colors: ["#16a34a", "#22c55e", "#4ade80", "#65a30d", "#84cc16", "#059669", "#0f766e", "#a3e635"],
  },
  {
    id: "berry",
    name: "Berry",
    colors: ["#be123c", "#db2777", "#a21caf", "#7c3aed", "#6d28d9", "#4f46e5", "#c026d3", "#e11d48"],
  },
  {
    id: "corporate",
    name: "Corporate",
    colors: ["#1e40af", "#0369a1", "#0891b2", "#475569", "#334155", "#64748b", "#0f766e", "#1d4ed8"],
  },
  {
    id: "pastel",
    name: "Pastel",
    colors: ["#fca5a5", "#fdba74", "#fde68a", "#bef264", "#a7f3d0", "#a5f3fc", "#bfdbfe", "#ddd6fe"],
  },
  {
    id: "neon",
    name: "Neon",
    colors: ["#22d3ee", "#a3e635", "#facc15", "#fb7185", "#e879f9", "#818cf8", "#34d399", "#f472b6"],
  },
  {
    id: "earth",
    name: "Earth",
    colors: ["#7c2d12", "#9a3412", "#a16207", "#4d7c0f", "#166534", "#115e59", "#78350f", "#365314"],
  },
  {
    id: "monochrome",
    name: "Monochrome",
    colors: ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#1e293b"],
  },
];

// Ready-to-use sample datasets (multi-series aware) so users can start in one click.
export const SAMPLE_DATASETS = [
  {
    id: "product",
    name: "Product Comparison",
    unit: "score out of 100",
    axes: ["Performance", "Reliability", "Usability", "Support", "Value", "Features"],
    series: [
      { name: "Product A", values: [88, 72, 90, 65, 78, 84] },
      { name: "Product B", values: [70, 85, 74, 88, 82, 69] },
    ],
  },
  {
    id: "skills",
    name: "Skills Assessment",
    unit: "proficiency out of 100",
    axes: ["JavaScript", "React", "Node.js", "CSS", "Testing", "DevOps"],
    series: [
      { name: "Current", values: [82, 74, 68, 88, 45, 40] },
      { name: "Target", values: [95, 92, 85, 92, 80, 75] },
    ],
  },
  {
    id: "performance",
    name: "Website Health",
    unit: "Lighthouse score",
    axes: ["Performance", "Accessibility", "SEO", "Best Practices", "Security", "Mobile"],
    series: [
      { name: "Desktop", values: [96, 92, 100, 100, 88, 94] },
      { name: "Mobile", values: [72, 92, 100, 96, 88, 90] },
    ],
  },
  {
    id: "review",
    name: "Employee Review",
    unit: "rating out of 100",
    axes: ["Communication", "Teamwork", "Leadership", "Technical", "Initiative", "Delivery"],
    series: [
      { name: "2024", values: [76, 82, 64, 88, 70, 80] },
      { name: "2025", values: [84, 85, 74, 92, 78, 88] },
    ],
  },
  {
    id: "character",
    name: "Character Stats",
    unit: "points out of 100",
    axes: ["Strength", "Agility", "Intelligence", "Stamina", "Luck", "Charisma"],
    series: [
      { name: "Warrior", values: [92, 60, 40, 88, 45, 55] },
      { name: "Mage", values: [35, 55, 96, 50, 70, 74] },
      { name: "Rogue", values: [58, 94, 66, 60, 88, 62] },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Channels",
    unit: "index score out of 100",
    axes: ["Reach", "Engagement", "Conversion", "Retention", "Cost", "ROI"],
    series: [
      { name: "Organic", values: [72, 68, 78, 84, 90, 82] },
      { name: "Paid", values: [92, 74, 70, 52, 40, 60] },
      { name: "Social", values: [84, 92, 58, 62, 72, 66] },
    ],
  },
  {
    id: "scorecard",
    name: "Balanced Scorecard",
    unit: "performance out of 100",
    axes: ["Financial", "Customer", "Internal", "Learning", "Innovation", "Sustainability"],
    series: [{ name: "This Year", values: [78, 84, 70, 66, 74, 60] }],
  },
  {
    id: "nutrition",
    name: "Nutrition Profile",
    unit: "% daily value",
    axes: ["Protein", "Carbs", "Fats", "Fibre", "Vitamins", "Minerals"],
    series: [
      { name: "Meal A", values: [72, 58, 64, 80, 70, 66] },
      { name: "Meal B", values: [54, 88, 46, 60, 82, 74] },
    ],
  },
];

export const DEFAULT_DATASET_ID = "product";
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

export const RADAR_FAQS = [
  {
    q: "How do I make a radar chart online for free?",
    a: "Type your indicators and numbers into the data table on the right — or load one of the ready-made sample datasets — and a live SVG preview updates instantly. Add extra data series to compare several profiles side by side, pick from ten curated colour palettes, fine-tune the grid shape, scale, rotation, points and labels, then click Download PNG or Download SVG to save a high-resolution image. No sign-up, watermark or upload is required.",
  },
  {
    q: "What is a radar chart and when should I use one?",
    a: "A radar chart (also called a spider chart, web chart, polar chart or star plot) plots several quantitative variables on axes that radiate from a central point and joins the values into a polygon. It is ideal for comparing the profile of two or more items across the same set of dimensions — for example product features, player stats, skills assessments or website health scores — where the overall shape and balance matter more than exact values. Use a bar chart instead when you need precise comparisons of a single variable.",
  },
  {
    q: "What is the difference between a radar chart and a spider chart?",
    a: "Nothing — they are two names for the same chart. 'Radar chart' describes the way the grid rings resemble a radar sweep, while 'spider chart' describes the radiating web of axes. You may also hear 'web chart', 'polar chart', 'star plot' or 'Kiviat diagram'. This generator draws the classic polygon web by default, and you can switch the grid to rounded concentric circles with the Grid shape control.",
  },
  {
    q: "How does the tool calculate the value scale?",
    a: "In Auto fit mode the generator scans every visible value, finds the smallest and largest, then rounds them outward to human-friendly 'nice' numbers so the ring labels are clean values like 0, 20, 40, 60, 80, 100. Choose the 0–100 mode to fix the scale to a percentage range with no surprises, or Custom to enter your own minimum and maximum — perfect for index scores or ratings that live between two known bounds.",
  },
  {
    q: "Can I compare multiple series on the same radar chart?",
    a: "Yes — that is the real strength of a radar chart. Add up to six data series and each one is drawn as its own colour-coded polygon, so you can instantly see where one profile is stronger or weaker than another. Overlapping areas use adjustable fill opacity. You can also toggle any series on or off from the data table or by clicking its legend chip, and hidden series are excluded from the automatic scale calculation.",
  },
  {
    q: "Can I export the radar chart as PNG or SVG?",
    a: "Absolutely. Download PNG for a pixel-perfect raster image at up to 4× resolution (ideal for slide decks, reports and social posts) or Download SVG for infinitely scalable vector artwork perfect for print, Figma and the web. You can also copy the raw SVG markup to your clipboard, or export the underlying data as CSV or JSON for reuse in spreadsheets and other tools.",
  },
  {
    q: "Does the Radar Chart Generator keep my data private?",
    a: "Completely. Every calculation and the chart rendering happen 100% client-side in your browser using SVG and the HTML canvas. Your labels and numbers are never uploaded, stored or transmitted to any server, so the tool is safe for confidential business, HR and survey data. Once the page has loaded you can even use it offline.",
  },
  {
    q: "What are the best practices for a readable radar chart?",
    a: "Keep the number of axes between three and eight so the shape stays legible, order the axes logically (group related dimensions together or sort by score), and always anchor the scale at zero so area comparisons stay honest. Limit yourself to two or three overlapping series, keep the fill translucent, and label every axis clearly. Remember that the area of a radar polygon is not proportional to the total, so use it to show balance and shape rather than precise sums.",
  },
];
