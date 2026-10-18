// app/(main)/tools-compo/tools/pie-chart-generator/pieChartData.js
// Static reference data, curated palettes and sample datasets for the
// Pie Chart Generator & Donut Studio.

export const CHART_TYPES = [
  {
    id: "pie",
    label: "Pie",
    description: "Classic full pie with a solid centre",
  },
  {
    id: "donut",
    label: "Donut",
    description: "Ring chart with a centre label area",
  },
];

export const LABEL_FORMATS = [
  { id: "percent", label: "Percentage" },
  { id: "value", label: "Value" },
  { id: "both", label: "Value + %" },
  { id: "label", label: "Category name" },
  { id: "none", label: "Hide labels" },
];

export const LABEL_POSITIONS = [
  { id: "inside", label: "Inside slice" },
  { id: "outside", label: "Outside with leader lines" },
];

export const LEGEND_POSITIONS = [
  { id: "right", label: "Right" },
  { id: "bottom", label: "Bottom" },
  { id: "left", label: "Left" },
  { id: "top", label: "Top" },
  { id: "none", label: "Hidden" },
];

// Curated, designer-grade colour palettes (each comfortably supports 8+ slices).
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

// Ready-to-use sample datasets so users can start in one click.
export const SAMPLE_DATASETS = [
  {
    id: "traffic",
    name: "Traffic Sources",
    slices: [
      { label: "Organic Search", value: 42 },
      { label: "Direct", value: 24 },
      { label: "Referral", value: 16 },
      { label: "Social", value: 12 },
      { label: "Email", value: 6 },
    ],
  },
  {
    id: "market",
    name: "Market Share",
    slices: [
      { label: "Brand A", value: 35 },
      { label: "Brand B", value: 25 },
      { label: "Brand C", value: 18 },
      { label: "Brand D", value: 12 },
      { label: "Others", value: 10 },
    ],
  },
  {
    id: "budget",
    name: "Monthly Budget",
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
    name: "Survey Results",
    slices: [
      { label: "Very Satisfied", value: 48 },
      { label: "Satisfied", value: 27 },
      { label: "Neutral", value: 15 },
      { label: "Dissatisfied", value: 7 },
      { label: "Very Dissatisfied", value: 3 },
    ],
  },
  {
    id: "time",
    name: "Time Allocation",
    slices: [
      { label: "Deep Work", value: 30 },
      { label: "Meetings", value: 22 },
      { label: "Email & Chat", value: 14 },
      { label: "Planning", value: 10 },
      { label: "Breaks", value: 12 },
      { label: "Other", value: 12 },
    ],
  },
  {
    id: "revenue",
    name: "Revenue by Channel",
    slices: [
      { label: "Subscriptions", value: 44 },
      { label: "One-time Sales", value: 21 },
      { label: "Advertising", value: 16 },
      { label: "Affiliate", value: 11 },
      { label: "Marketplace", value: 8 },
    ],
  },
  {
    id: "energy",
    name: "Energy Mix",
    slices: [
      { label: "Solar", value: 28 },
      { label: "Wind", value: 24 },
      { label: "Hydro", value: 18 },
      { label: "Gas", value: 16 },
      { label: "Coal", value: 9 },
      { label: "Nuclear", value: 5 },
    ],
  },
];

export const DEFAULT_SLICES = [
  { label: "Organic Search", value: 42 },
  { label: "Direct", value: 24 },
  { label: "Referral", value: 16 },
  { label: "Social", value: 12 },
  { label: "Email", value: 6 },
];

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

export const PIE_FAQS = [
  {
    q: "How do I make a pie chart online for free?",
    a: "Enter your categories and numeric values in the data table on the right (or load a ready-made sample dataset), then customise colours, labels and legend to taste. The chart updates instantly in your browser. When you are happy with the result, click Download PNG or Download SVG to save a high-resolution, transparent-ready image — no sign-up, watermark or upload required.",
  },
  {
    q: "What is the difference between a pie chart and a donut chart?",
    a: "A pie chart is a full circle divided into slices, where each slice's angle is proportional to its share of the total. A donut (doughnut) chart is the same thing with the centre removed, which creates a hole that can hold a total value, KPI or summary label. Donut charts are generally easier to read because people compare arc lengths rather than angles. Use the Chart Type switch to flip between them instantly, and drag the inner radius slider to control how thick the ring is.",
  },
  {
    q: "How is each slice's angle and percentage calculated?",
    a: "Every slice's share is simply its value divided by the sum of all values. That fraction is multiplied by 360° to get the slice's central angle, and by 100 to get its percentage. For example, if one category is 42 out of a total of 100, it takes 151.2° and displays as 42%. The live totals and percentages are recalculated automatically every time you edit a value.",
  },
  {
    q: "Can I export the chart as a PNG or SVG image?",
    a: "Yes. The export toolbar gives you Download PNG for a pixel-perfect raster image (great for slides, documents and social posts) and Download SVG for infinitely-scalable vector artwork (ideal for print, Figma and web use). You can also copy the raw SVG markup or the underlying data as CSV to drop into another tool.",
  },
  {
    q: "Can I pull out or explode a slice for emphasis?",
    a: "Absolutely. Toggle the explode (target) icon on any row in the data table to push that slice outward, then use the Explode distance slider to control how far every highlighted slice pops out from the centre — a classic way to highlight your headline number.",
  },
  {
    q: "Does this pie chart generator work offline and keep my data private?",
    a: "The entire tool runs 100% client-side in your browser using SVG and the HTML canvas. Your labels and numbers are never uploaded, stored or transmitted to any server, so it is safe for confidential business, financial and survey data. Once the page has loaded you can even use it offline.",
  },
  {
    q: "What should I watch out for when using a pie chart?",
    a: "Pie charts work best with a small number of slices (ideally 5 or fewer) that sum to a meaningful whole. Avoid them when categories overlap, when you have many tiny slices, or when precise comparison matters — a bar chart usually communicates that better. Prefer ordering slices from largest to smallest (use the Sort descending toggle) and always make sure the total adds up to a logical 100%.",
  },
];
