// app/(main)/tools-compo/tools/line-chart-generator/lineChartData.js
// Static reference data, curated palettes and sample datasets for the
// Line Chart Generator & Area Chart Studio.

export const LINE_STYLES = [
  {
    id: "straight",
    label: "Straight",
    description: "Direct line between every data point",
  },
  {
    id: "smooth",
    label: "Smooth",
    description: "Gently curved, monotone-safe spline",
  },
  {
    id: "stepAfter",
    label: "Step (after)",
    description: "Hold each value until the next point",
  },
  {
    id: "stepBefore",
    label: "Step (before)",
    description: "Move up just before the next point",
  },
  {
    id: "stepMiddle",
    label: "Step (middle)",
    description: "Step halfway between points",
  },
];

export const MARKER_SHAPES = [
  { id: "none", label: "None" },
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "diamond", label: "Diamond" },
  { id: "triangle", label: "Triangle" },
  { id: "cross", label: "Cross" },
];

export const DASH_STYLES = [
  { id: "solid", label: "Solid", pattern: [] },
  { id: "dashed", label: "Dashed", pattern: [9, 5] },
  { id: "dotted", label: "Dotted", pattern: [1.5, 4] },
  { id: "dashdot", label: "Dash-dot", pattern: [10, 4, 2, 4] },
  { id: "longdash", label: "Long dash", pattern: [16, 7] },
];

export const GRID_STYLES = [
  { id: "solid", label: "Solid", pattern: [] },
  { id: "dashed", label: "Dashed", pattern: [6, 6] },
  { id: "dotted", label: "Dotted", pattern: [1, 5] },
];

export const LABEL_FORMATS = [
  { id: "value", label: "Value" },
  { id: "percent", label: "Percent" },
  { id: "both", label: "Value + %" },
  { id: "none", label: "Hide labels" },
];

export const LABEL_POSITIONS = [
  { id: "above", label: "Above point" },
  { id: "below", label: "Below point" },
  { id: "center", label: "On the line" },
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
  { id: "desc", label: "Highest → lowest" },
  { id: "asc", label: "Lowest → highest" },
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
    id: "traffic",
    name: "Website Traffic",
    unit: "sessions (thousands)",
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    series: [
      { name: "2024", values: [32, 41, 38, 52, 61, 58, 66, 72, 69, 78, 84, 92] },
      { name: "2025", values: [45, 49, 55, 63, 74, 81, 88, 95, 102, 110, 118, 131] },
    ],
  },
  {
    id: "temperature",
    name: "City Temperatures",
    unit: "average °C",
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    series: [
      { name: "Dubai", values: [19, 21, 24, 29, 33, 36, 38, 38, 35, 31, 26, 21] },
      { name: "London", values: [5, 5, 8, 10, 14, 17, 19, 19, 16, 12, 8, 6] },
      { name: "Reykjavík", values: [0, 0, 1, 3, 6, 9, 11, 10, 8, 5, 2, 0] },
    ],
  },
  {
    id: "sales",
    name: "Sales vs Target",
    unit: "USD (thousands)",
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    series: [
      { name: "Actual", values: [42, 48, 51, 57, 63, 71] },
      { name: "Target", values: [45, 47, 52, 56, 61, 68] },
    ],
  },
  {
    id: "downloads",
    name: "App Downloads",
    unit: "thousands",
    categories: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
    series: [
      { name: "iOS", values: [12, 15, 14, 19, 23, 21, 26, 31] },
      { name: "Android", values: [18, 20, 24, 22, 28, 33, 36, 41] },
    ],
  },
  {
    id: "stock",
    name: "Stock Price",
    unit: "USD",
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    series: [
      { name: "AAPL", values: [185, 178, 192, 188, 205, 214, 208, 224, 219, 233, 241, 252] },
    ],
  },
  {
    id: "signups",
    name: "Signups vs Churn",
    unit: "users",
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    series: [
      { name: "New signups", values: [320, 410, 388, 452, 501, 548] },
      { name: "Churned", values: [96, 88, 102, 91, 84, 79] },
    ],
  },
  {
    id: "energy",
    name: "Energy Prices",
    unit: "index (2019 = 100)",
    categories: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
    series: [
      { name: "Electricity", values: [100, 98, 112, 168, 151, 139, 128] },
      { name: "Natural gas", values: [100, 89, 128, 214, 176, 149, 132] },
    ],
  },
  {
    id: "conversion",
    name: "Conversion Rate",
    unit: "% of visitors",
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    series: [
      { name: "Landing A", values: [2.4, 2.8, 2.6, 3.1, 3.4, 3.9] },
      { name: "Landing B", values: [1.9, 2.2, 2.5, 2.4, 2.9, 3.2] },
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

export function getDashPattern(dashId) {
  const style = DASH_STYLES.find((d) => d.id === dashId);
  return style ? style.pattern : [];
}

export function getGridPattern(gridId) {
  const style = GRID_STYLES.find((d) => d.id === gridId);
  return style ? style.pattern : [];
}

export const LINE_FAQS = [
  {
    q: "Can I import my data from a CSV or Excel file?",
    a: "Yes. Drag and drop a .csv, .tsv or .xlsx file onto the import box in the Data tab, browse for one, or paste rows of text. The file is read entirely inside your browser, the delimiter and header row are detected automatically, and the first column becomes your point labels while each numeric column you tick becomes a series (up to eight). Check the mapping in the live preview, then import. Legacy binary .xls files are not supported, so re-save them as .xlsx or CSV first, and nothing is ever uploaded.",
  },
  {
    q: "How do I make a line chart online for free?",
    a: "Type your category labels and numbers into the data table on the right — or load one of the ready-made sample datasets — and a live SVG preview updates instantly. Add more data series to compare trends, pick from ten curated colour palettes, switch between straight, smooth and step lines, choose markers, area fills or stacked area, fine-tune axes, gridlines, labels and legends, then click Download PNG or Download SVG to save a crisp image. No sign-up, watermark or upload is required.",
  },
  {
    q: "What is the difference between a line chart and an area chart?",
    a: "An area chart is simply a line chart with the space between the line and the baseline filled in. The fill makes the magnitude of each series easier to gauge, which is why area charts suit cumulative volumes such as revenue or traffic. Use the Area fill toggle to switch instantly, and the Stacked toggle to stack multiple series so their combined total is visible.",
  },
  {
    q: "When should I use a smooth curve instead of straight lines?",
    a: "Straight segments are the honest default because every point sits exactly on the value measured. Smooth curves look softer and are great for continuous data such as temperature, but they can imply values that were never measured. This tool uses a monotone-safe spline so the curve never overshoots your real data points, and the Curve tension slider lets you dial the effect from straight to fully rounded.",
  },
  {
    q: "How does the tool calculate the value axis?",
    a: "The generator scans every visible series, finds the smallest and largest value, then rounds the axis outward to human-friendly 'nice' numbers so the gridline labels are clean values like 0, 25, 50, 75, 100. Turn off Auto scale to type an exact minimum and maximum, keep the Zero baseline option on for honest comparisons, and use the Tick count slider to control how many gridlines appear.",
  },
  {
    q: "Can I show percentages, currency or custom units on the labels?",
    a: "Yes. Data labels can display the raw value, the percentage of the grand total, or both. You can also add a prefix (such as a currency symbol) and a suffix (such as kg, °C or %), choose 0–4 decimal places, switch on thousands separators and opt into compact notation (1.2K, 3.4M, 5.6B). Every change re-renders the chart immediately.",
  },
  {
    q: "Can I export the line chart as PNG or SVG?",
    a: "Absolutely. Download PNG for a pixel-perfect raster image at up to 4× resolution (ideal for slide decks, reports and social posts) or Download SVG for infinitely scalable vector artwork perfect for print, Figma and the web. You can also copy the raw SVG markup to your clipboard or export the underlying data as CSV or JSON for reuse in spreadsheets and other tools.",
  },
  {
    q: "Does the Line Chart Generator keep my data private?",
    a: "Completely. Every calculation and the chart rendering happen 100% client-side in your browser using SVG and the HTML canvas. Your labels and numbers are never uploaded, stored or transmitted to any server, so the tool is safe for confidential business, financial and research data. Once the page has loaded you can even use it offline.",
  },
  {
    q: "What are the best practices for a readable line chart?",
    a: "Keep the value axis anchored at zero when comparing magnitudes, limit yourself to about four series before colours become hard to tell apart, give every series a distinct colour, dash pattern or marker shape, label the axes with their units, and avoid smoothing data where the exact values matter. For part-to-whole comparisons over time, switch on Stacked area; for pure trend and comparison, keep the plain lines.",
  },
];
