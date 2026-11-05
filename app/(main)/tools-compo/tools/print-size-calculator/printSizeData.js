/* -------------------------------------------------------------------------- */
/*  Print Size Calculator — paper standards, units and print maths.           */
/* -------------------------------------------------------------------------- */

export const PRINT_STORAGE_KEY = "toolstrek_print_size_v1";

export const MM_PER_INCH = 25.4;

export const LENGTH_UNITS = [
  { value: "mm", label: "mm", toMm: 1 },
  { value: "cm", label: "cm", toMm: 10 },
  { value: "in", label: "in", toMm: 25.4 },
];

export const PAPER_GROUPS = ["ISO A", "ISO B", "ISO C", "US", "Photo", "Custom"];

export const PAPER_SIZES = [
  { id: "a0", label: "A0", group: "ISO A", width: 841, height: 1189 },
  { id: "a1", label: "A1", group: "ISO A", width: 594, height: 841 },
  { id: "a2", label: "A2", group: "ISO A", width: 420, height: 594 },
  { id: "a3", label: "A3", group: "ISO A", width: 297, height: 420 },
  { id: "a4", label: "A4", group: "ISO A", width: 210, height: 297 },
  { id: "a5", label: "A5", group: "ISO A", width: 148, height: 210 },
  { id: "a6", label: "A6", group: "ISO A", width: 105, height: 148 },
  { id: "a7", label: "A7", group: "ISO A", width: 74, height: 105 },
  { id: "a8", label: "A8", group: "ISO A", width: 52, height: 74 },
  { id: "a9", label: "A9", group: "ISO A", width: 37, height: 52 },
  { id: "a10", label: "A10", group: "ISO A", width: 26, height: 37 },
  { id: "b0", label: "B0", group: "ISO B", width: 1000, height: 1414 },
  { id: "b1", label: "B1", group: "ISO B", width: 707, height: 1000 },
  { id: "b2", label: "B2", group: "ISO B", width: 500, height: 707 },
  { id: "b3", label: "B3", group: "ISO B", width: 353, height: 500 },
  { id: "b4", label: "B4", group: "ISO B", width: 250, height: 353 },
  { id: "b5", label: "B5", group: "ISO B", width: 176, height: 250 },
  { id: "b6", label: "B6", group: "ISO B", width: 125, height: 176 },
  { id: "c4", label: "C4 envelope", group: "ISO C", width: 229, height: 324 },
  { id: "c5", label: "C5 envelope", group: "ISO C", width: 162, height: 229 },
  { id: "c6", label: "C6 envelope", group: "ISO C", width: 114, height: 162 },
  { id: "letter", label: "US Letter", group: "US", width: 215.9, height: 279.4 },
  { id: "legal", label: "US Legal", group: "US", width: 215.9, height: 355.6 },
  { id: "tabloid", label: "Tabloid / Ledger", group: "US", width: 279.4, height: 431.8 },
  { id: "executive", label: "Executive", group: "US", width: 184.15, height: 266.7 },
  { id: "half-letter", label: "Half Letter", group: "US", width: 139.7, height: 215.9 },
  { id: "photo-4x6", label: "4 × 6 in", group: "Photo", width: 101.6, height: 152.4 },
  { id: "photo-5x7", label: "5 × 7 in", group: "Photo", width: 127, height: 177.8 },
  { id: "photo-8x10", label: "8 × 10 in", group: "Photo", width: 203.2, height: 254 },
  { id: "square-6", label: "6 × 6 in square", group: "Photo", width: 152.4, height: 152.4 },
  { id: "business-card-us", label: "US business card", group: "Photo", width: 88.9, height: 50.8 },
  { id: "business-card-eu", label: "EU business card", group: "Photo", width: 85, height: 55 },
];

export const PAPER_BY_ID = Object.fromEntries(PAPER_SIZES.map((paper) => [paper.id, paper]));

export const QUALITY_BANDS = [
  { min: 300, label: "Press quality", tone: "emerald", note: "Fine detail, small text and photographic prints stay crisp." },
  { min: 200, label: "Good quality", tone: "sky", note: "Sharp for posters and everyday photo prints viewed at arm's length." },
  { min: 150, label: "Acceptable", tone: "amber", note: "Fine for large-format viewing, but small text may soften." },
  { min: 100, label: "Low resolution", tone: "rose", note: "Visible pixelation at normal viewing distance." },
  { min: 0, label: "Not print ready", tone: "rose", note: "Far below print resolution — reduce the physical size or use a larger source file." },
];

export const PRINT_FAQS = [
  {
    question: "What DPI should I use for printing?",
    answer:
      "300 DPI is the usual target for photos, business cards and anything viewed up close. 150–200 DPI is often acceptable for posters and large-format prints viewed from a distance. Commercial presses sometimes work in PPI rather than DPI; for practical purposes the numbers behave the same here.",
  },
  {
    question: "What is bleed and why do I need it?",
    answer:
      "Bleed is extra artwork beyond the trim line so tiny cutting shifts do not leave white edges. A 3 mm bleed is standard for most commercial printing, while 3.175 mm (0.125 in) is common in the US. Add the bleed to the document size, keep important content inside the safe area, and let backgrounds run to the edge.",
  },
  {
    question: "How do I calculate pixels from print size?",
    answer:
      "Pixels = physical size in inches × DPI. For example, a 6-inch-wide print at 300 DPI needs 1,800 pixels across. The calculator solves this in both directions, so you can also start from a file and discover the largest sharp print it supports.",
  },
  {
    question: "Does a larger DPI always look better?",
    answer:
      "No. Once the output device cannot resolve more detail, extra pixels only increase file size. Match the DPI to the printer and viewing distance: 300 DPI for close work, 150–200 DPI for posters, and 72–150 DPI for screen-only assets.",
  },
  {
    question: "What is the difference between DPI and PPI?",
    answer:
      "PPI describes pixels per inch in the image file; DPI describes ink dots per inch produced by a printer. Marketing materials use them interchangeably. This tool uses DPI as shorthand for the effective pixel density at the chosen print size.",
  },
  {
    question: "How many business cards fit on an A4 sheet?",
    answer:
      "With the standard 85 × 55 mm card, a 3 mm gap and a 5 mm sheet margin, ten cards fit on A4 in a 2 × 5 grid. Use the imposition section to enter your own card size, gap and margins and see the exact count and layout.",
  },
  {
    question: "Should I include crop marks in my PDF?",
    answer:
      "Include them when a print shop will trim the job. Crop marks sit outside the trim area and need enough bleed to be useful. For home printing, leave them off so they do not end up on the finished piece.",
  },
  {
    question: "Why is my photo blurry even at 300 DPI?",
    answer:
      "Resolution is only one factor. Lens softness, motion blur, aggressive compression, upscaling and the paper surface all affect perceived sharpness. Check the source pixel dimensions before printing, and avoid enlarging a small file beyond roughly 120% of its native print size.",
  },
];

export function toMm(value, unit) {
  if (!Number.isFinite(value)) return null;
  const factor = LENGTH_UNITS.find((item) => item.value === unit)?.toMm ?? 1;
  return value * factor;
}

export function fromMm(valueMm, unit) {
  if (!Number.isFinite(valueMm)) return null;
  const factor = LENGTH_UNITS.find((item) => item.value === unit)?.toMm ?? 1;
  return valueMm / factor;
}

export function paperDimensions(paper, orientation) {
  if (!paper) return { width: 0, height: 0 };
  return orientation === "landscape"
    ? { width: paper.height, height: paper.width }
    : { width: paper.width, height: paper.height };
}

export function formatLength(mm, unit, precision = 1) {
  if (!Number.isFinite(mm)) return "—";
  const value = fromMm(mm, unit);
  const digits = unit === "in" ? 2 : precision;
  return `${Number(value.toFixed(digits))} ${unit}`;
}

export function qualityBand(dpi) {
  if (!Number.isFinite(dpi)) return null;
  return QUALITY_BANDS.find((band) => dpi >= band.min) || QUALITY_BANDS[QUALITY_BANDS.length - 1];
}

export function greatestCommonDivisor(a, b) {
  let x = Math.round(Math.abs(a));
  let y = Math.round(Math.abs(b));
  while (y) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

export function aspectRatio(width, height) {
  if (!width || !height) return "—";
  const divisor = greatestCommonDivisor(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

export function imposition({ sheetWidth, sheetHeight, itemWidth, itemHeight, gap, margin }) {
  const usableWidth = Math.max(0, sheetWidth - margin * 2);
  const usableHeight = Math.max(0, sheetHeight - margin * 2);
  if (!itemWidth || !itemHeight || !usableWidth || !usableHeight) {
    return { columns: 0, rows: 0, count: 0, utilisation: 0, positions: [] };
  }
  const columns = Math.max(0, Math.floor((usableWidth + gap) / (itemWidth + gap)));
  const rows = Math.max(0, Math.floor((usableHeight + gap) / (itemHeight + gap)));
  const positions = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      positions.push({
        x: margin + column * (itemWidth + gap),
        y: margin + row * (itemHeight + gap),
      });
    }
  }
  const usedArea = columns * rows * itemWidth * itemHeight;
  return {
    columns,
    rows,
    count: columns * rows,
    utilisation: sheetWidth * sheetHeight ? (usedArea / (sheetWidth * sheetHeight)) * 100 : 0,
    positions,
  };
}

export function createDemoPrintState() {
  return {
    solveFor: "px-dpi",
    widthPx: "3000",
    heightPx: "2000",
    dpi: "300",
    physicalWidth: "25.4",
    physicalHeight: "16.93",
    physicalUnit: "cm",
    paperId: "a4",
    orientation: "portrait",
    bleed: "3",
    safe: "5",
    cropMarks: true,
    customPaperWidth: "210",
    customPaperHeight: "297",
    itemWidth: "85",
    itemHeight: "55",
    itemGap: "3",
    sheetMargin: "5",
    showImage: true,
  };
}

export const DEMO_NOTE = "Demo values only — clear them to start from scratch.";
