// app/(main)/tools-compo/tools/bar-chart-generator/barChartData.js
// Static reference data, curated palettes and sample datasets for the
// Bar Chart Generator & Column Studio.

export const ORIENTATIONS = [
  {
    id: "vertical",
    label: "Vertical",
    description: "Columns rising from a horizontal category axis",
  },
  {
    id: "horizontal",
    label: "Horizontal",
    description: "Bars extending from a vertical category axis",
  },
];

export const BAR_MODES = [
  {
    id: "grouped",
    label: "Grouped",
    description: "Series sit side by side inside each category",
  },
  {
    id: "stacked",
    label: "Stacked",
    description: "Series stack on top of each other per category",
  },
];

export const LABEL_FORMATS = [
  { id: "value", label: "Value" },
  { id: "percent", label: "Percent" },
  { id: "both", label: "Value + %" },
  { id: "none", label: "Hide labels" },
];

export const LABEL_POSITIONS = [
  { id: "outside", label: "Outside bar" },
  { id: "inside", label: "Inside bar" },
  { id: "center", label: "Centre of bar" },
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
  { id: "desc", label: "Largest → smallest" },
  { id: "asc", label: "Smallest → largest" },
];

// Curated, designer-grade colour palettes (each comfortably supports 8+ series).
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
    id: "quarterly",
    name: "Quarterly Revenue",
    unit: "USD (thousands)",
    categories: ["Q1", "Q2", "Q3", "Q4"],
    series: [
      { name: "2024", values: [42, 58, 61, 78] },
      { name: "2025", values: [55, 63, 72, 91] },
    ],
  },
  {
    id: "traffic",
    name: "Website Traffic",
    unit: "sessions (thousands)",
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    series: [{ name: "Sessions", values: [32, 41, 38, 52, 61, 58] }],
  },
  {
    id: "budget",
    name: "Budget vs Actual",
    unit: "USD (hundreds)",
    categories: ["Marketing", "Product", "Sales", "Support", "Ops"],
    series: [
      { name: "Budget", values: [40, 55, 48, 25, 30] },
      { name: "Actual", values: [46, 51, 54, 22, 35] },
    ],
  },
  {
    id: "revenue",
    name: "Revenue by Product",
    unit: "USD (millions)",
    categories: ["Cloud", "Devices", "Ads", "Services"],
    series: [
      { name: "North America", values: [48, 32, 26, 18] },
      { name: "Europe", values: [36, 28, 21, 14] },
      { name: "Asia Pacific", values: [29, 24, 19, 11] },
    ],
  },
  {
    id: "survey",
    name: "Customer Satisfaction",
    unit: "respondents (hundreds)",
    categories: ["Q1", "Q2", "Q3", "Q4"],
    series: [
      { name: "Very satisfied", values: [48, 52, 57, 61] },
      { name: "Satisfied", values: [27, 25, 24, 22] },
      { name: "Neutral", values: [15, 14, 12, 10] },
      { name: "Dissatisfied", values: [10, 9, 7, 7] },
    ],
  },
  {
    id: "energy",
    name: "Energy Mix",
    unit: "% of generation",
    categories: ["Solar", "Wind", "Hydro", "Gas", "Coal", "Nuclear"],
    series: [{ name: "Share", values: [28, 24, 18, 16, 9, 5] }],
  },
  {
    id: "expenses",
    name: "Monthly Expenses",
    unit: "USD (hundreds)",
    categories: ["Housing", "Savings", "Food", "Transport", "Leisure", "Other"],
    series: [{ name: "Spend", values: [32, 20, 18, 12, 10, 8] }],
  },
];

export const DEFAULT_DATASET_ID = "quarterly";
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

export const BAR_FAQS = [
  {
    q: "How do I make a bar chart online for free?",
    a: "Type your categories and numbers into the data table on the right — or load one of the ready-made sample datasets — and a live SVG preview updates instantly. Add extra data series to build grouped or stacked bars, pick from ten curated colour palettes, fine-tune axes, gridlines, labels and legends, then click Download PNG or Download SVG to save a high-resolution image. No sign-up, watermark or upload is required.",
  },
  {
    q: "What is the difference between a bar chart and a column chart?",
    a: "They are the same chart drawn at different angles. A column chart (vertical bars) grows upward from a horizontal category axis and is the default for time-based or ordered categories such as months or quarters. A bar chart (horizontal bars) extends sideways from a vertical category axis and reads better when your category names are long or when you have many categories. Use the Orientation switch to flip between them instantly.",
  },
  {
    q: "What is the difference between grouped and stacked bars?",
    a: "Grouped bars place the series side by side inside every category, which makes it easy to compare individual values across series. Stacked bars place the series on top of one another, which emphasises the category total and each series' share of that total. Switch between the two with the Bar mode toggle — the axis scale and value labels are recalculated automatically.",
  },
  {
    q: "How does the tool calculate the value axis?",
    a: "The generator scans every value (including per-category stacks when you are in stacked mode), finds the minimum and maximum, then rounds them outward to human-friendly 'nice' numbers so the tick labels are clean values like 0, 20, 40, 60. Enable the Zero baseline option to always anchor the axis at zero — the recommended practice for honest bar charts — and use the Tick count slider to control how many gridlines appear.",
  },
  {
    q: "Can I show percentages, currency or custom units on the labels?",
    a: "Yes. Data labels can display the raw value, the percentage of the grand total, or both. You can also add a prefix (such as a currency symbol) and a suffix (such as kg, % or K), choose 0–4 decimal places, switch on thousands separators, and opt into compact notation (1.2K, 3.4M, 5.6B). Every change re-renders the chart immediately.",
  },
  {
    q: "Can I export the bar chart as PNG or SVG?",
    a: "Absolutely. Download PNG for a pixel-perfect raster image at up to 4× resolution (ideal for slide decks, reports and social posts) or Download SVG for infinitely scalable vector artwork perfect for print, Figma and the web. You can also copy the raw SVG markup to your clipboard or export the underlying data as CSV or JSON for reuse in spreadsheets and other tools.",
  },
  {
    q: "Does the Bar Chart Generator keep my data private?",
    a: "Completely. Every calculation and the chart rendering happen 100% client-side in your browser using SVG and the HTML canvas. Your labels and numbers are never uploaded, stored or transmitted to any server, so the tool is safe for confidential business, financial and survey data. Once the page has loaded you can even use it offline.",
  },
  {
    q: "What are the best practices for a readable bar chart?",
    a: "Always start the value axis at zero so bar lengths stay proportional to their values, sort categories (try the Sort control) so the pattern is obvious at a glance, keep the number of series small — grouped bars become hard to read beyond three or four — and label axes clearly with units. Reserve stacked bars for showing parts of a whole, and avoid truncating the axis or adding 3D effects that distort proportions.",
  },
];
