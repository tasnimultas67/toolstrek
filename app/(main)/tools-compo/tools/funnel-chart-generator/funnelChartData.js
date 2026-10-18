// app/(main)/tools-compo/tools/funnel-chart-generator/funnelChartData.js
// Static reference data, curated palettes and sample datasets for the
// Funnel Chart Generator & Conversion Studio.

export const CHART_SHAPES = [
  {
    id: "funnel",
    label: "Funnel",
    description: "Classic trapezoids that taper stage to stage",
  },
  {
    id: "bars",
    label: "Bars",
    description: "Centred bars that shrink with the data",
  },
  {
    id: "steps",
    label: "Steps",
    description: "Flush stacked blocks forming a stair-step funnel",
  },
];

export const ORIENTATIONS = [
  { id: "vertical", label: "Vertical" },
  { id: "horizontal", label: "Horizontal" },
];

export const VALUE_SCALES = [
  { id: "linear", label: "Linear" },
  { id: "sqrt", label: "Square root" },
];

export const LABEL_FORMATS = [
  { id: "value", label: "Value" },
  { id: "percent", label: "Percentage" },
  { id: "both", label: "Value + %" },
  { id: "nameValue", label: "Name + value" },
  { id: "name", label: "Stage name" },
  { id: "none", label: "Hidden" },
];

export const LABEL_POSITIONS = [
  { id: "inside", label: "Inside stage" },
  { id: "outside", label: "Outside with leaders" },
];

export const PERCENT_BASES = [
  { id: "first", label: "Of first stage" },
  { id: "previous", label: "Of previous stage" },
  { id: "total", label: "Of total" },
];

export const CONVERSION_FORMATS = [
  { id: "percent", label: "Conversion %" },
  { id: "dropoff", label: "Drop-off" },
  { id: "both", label: "Both" },
];

export const LEGEND_POSITIONS = [
  { id: "right", label: "Right" },
  { id: "bottom", label: "Bottom" },
  { id: "left", label: "Left" },
  { id: "top", label: "Top" },
  { id: "none", label: "Hidden" },
];

// Curated, designer-grade colour palettes (each comfortably supports 8+ stages).
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
    id: "sales",
    name: "Sales Pipeline",
    stages: [
      { label: "Leads", value: 10000 },
      { label: "Qualified", value: 4200 },
      { label: "Proposal Sent", value: 1800 },
      { label: "Negotiation", value: 900 },
      { label: "Closed Won", value: 380 },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Funnel",
    stages: [
      { label: "Visitors", value: 48000 },
      { label: "Sign-ups", value: 7200 },
      { label: "Activated", value: 3100 },
      { label: "Paying", value: 940 },
    ],
  },
  {
    id: "ecommerce",
    name: "Checkout Funnel",
    stages: [
      { label: "Product Views", value: 60000 },
      { label: "Add to Cart", value: 15000 },
      { label: "Checkout", value: 6400 },
      { label: "Payment Info", value: 3800 },
      { label: "Purchased", value: 3100 },
    ],
  },
  {
    id: "recruitment",
    name: "Hiring Funnel",
    stages: [
      { label: "Applications", value: 3200 },
      { label: "Screened", value: 900 },
      { label: "Interviews", value: 340 },
      { label: "Offers", value: 96 },
      { label: "Hires", value: 72 },
    ],
  },
  {
    id: "onboarding",
    name: "App Onboarding",
    stages: [
      { label: "Installs", value: 25000 },
      { label: "Opened", value: 18000 },
      { label: "Setup Complete", value: 11000 },
      { label: "First Session", value: 8500 },
      { label: "Retained (7d)", value: 4200 },
    ],
  },
  {
    id: "support",
    name: "Support Tickets",
    stages: [
      { label: "Opened", value: 5400 },
      { label: "Triaged", value: 5100 },
      { label: "In Progress", value: 4300 },
      { label: "Resolved", value: 3900 },
      { label: "Satisfied", value: 3400 },
    ],
  },
  {
    id: "content",
    name: "Content Funnel",
    stages: [
      { label: "Impressions", value: 250000 },
      { label: "Clicks", value: 18000 },
      { label: "Engaged", value: 6400 },
      { label: "Converted", value: 900 },
    ],
  },
  {
    id: "enrollment",
    name: "Student Enrollment",
    stages: [
      { label: "Enquiries", value: 2400 },
      { label: "Applications", value: 1200 },
      { label: "Accepted", value: 780 },
      { label: "Enrolled", value: 520 },
    ],
  },
];

export const DEFAULT_DATASET_ID = "sales";
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

export const FUNNEL_FAQS = [
  {
    q: "What is a funnel chart and when should I use one?",
    a: "A funnel chart shows a multi-stage process where a starting population shrinks as it moves through each step — sales pipelines, marketing conversions, sign-up flows, hiring stages or support queues. Each stage is drawn as a band whose size is proportional to the number of items that reach it, so the shape instantly reveals where the biggest drop-offs happen. Use a funnel when the order of the stages matters and you want to highlight conversion and attrition; use a bar chart when the order is irrelevant.",
  },
  {
    q: "How do I make a funnel chart online for free?",
    a: "Type your stage names and values into the data table (or load a ready-made sample dataset), pick a palette and shape, fine-tune labels, conversion markers, legend and theme. The live SVG preview updates instantly in your browser. Click Download PNG or Download SVG to save a high-resolution image — no sign-up, watermark or upload required.",
  },
  {
    q: "How is each stage's width and percentage calculated?",
    a: "In Linear mode each stage width is scaled directly against the largest stage, and every stage is scored three ways: as a percentage of the first stage (overall conversion), as a percentage of the previous stage (step conversion) and as a percentage of the grand total. Switch to Square root mode to compress large differences so small lower-funnel stages stay visible, and use the Minimum width slider to keep tiny stages from disappearing.",
  },
  {
    q: "What do the conversion markers between stages mean?",
    a: "The small markers drawn between stages show how many people moved from one step to the next. 'Conversion %' is the share of the previous stage that reached this one (for example 42%), while 'Drop-off' shows the absolute number lost. Switch the marker format to see conversion, drop-off, or both at once — this is the fastest way to spot the step that is leaking the most.",
  },
  {
    q: "What is the difference between the Funnel, Bars and Steps shapes?",
    a: "The Funnel shape draws classic trapezoids that taper continuously from one stage into the next, giving the familiar funnel silhouette. Bars draws each stage as a separate centred bar, which is cleaner when you want to compare stage sizes precisely. Steps stacks flush centred blocks to form a stair-step funnel with no gaps — great for a more architectural, modern look.",
  },
  {
    q: "Can I export the funnel chart as a PNG or SVG image?",
    a: "Yes. Download PNG for a pixel-perfect raster image at up to 4× resolution (perfect for slides, reports and social posts), or Download SVG for infinitely scalable vector artwork ideal for print, Figma and the web. You can also copy the raw SVG markup, and download the underlying data as CSV or JSON.",
  },
  {
    q: "Does this funnel chart generator keep my data private?",
    a: "The entire tool runs 100% client-side using SVG and the HTML canvas. Your labels and numbers never leave your device and are never uploaded or stored, making it safe for confidential sales, revenue, HR and product analytics data. Once the page has loaded you can even use it offline.",
  },
  {
    q: "What are the best practices for designing a readable funnel chart?",
    a: "Keep the number of stages between three and six so the shape stays legible, order them in the true sequence of your process, and label each stage with both its name and value. Always anchor the scale sensibly so widths stay proportional, group tiny tail stages into an 'Other' bucket, and pair the funnel with the conversion percentages so viewers can quantify the drop-off as well as see it.",
  },
];
