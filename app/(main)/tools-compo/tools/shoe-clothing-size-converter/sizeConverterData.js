/* -------------------------------------------------------------------------- */
/*  Shoe & Clothing Size Converter — reference data and pure helpers.         */
/*  Conversions are industry guides, not brand guarantees.                    */
/* -------------------------------------------------------------------------- */

export const SIZE_STORAGE_KEY = "toolstrek_size_converter_v1";

const num = (value) => (value === null || value === undefined || value === "" ? null : Number(value));

/* -------------------------------- Shoes ---------------------------------- */

const MEN_SHOES = [
  [23, 37.5, 5, 4.5, 4.5, 37, 23],
  [23.5, 38, 5.5, 5, 5, 37, 23.5],
  [24, 38.5, 6, 5.5, 5.5, 38, 24],
  [24.5, 39, 6.5, 6, 6, 38, 24.5],
  [25, 40, 7, 6, 6, 39, 25],
  [25.5, 40.5, 7.5, 6.5, 6.5, 39, 25.5],
  [26, 41, 8, 7, 7, 40, 26],
  [26.5, 42, 8.5, 7.5, 7.5, 41, 26.5],
  [27, 42.5, 9, 8, 8, 41, 27],
  [27.5, 43, 9.5, 8.5, 8.5, 42, 27.5],
  [28, 44, 10, 9, 9, 43, 28],
  [28.5, 44.5, 10.5, 9.5, 9.5, 43, 28.5],
  [29, 45, 11, 10, 10, 44, 29],
  [29.5, 45.5, 11.5, 10.5, 10.5, 45, 29.5],
  [30, 46, 12, 11, 11, 45, 30],
  [30.5, 47, 12.5, 11.5, 11.5, 46, 30.5],
  [31, 47.5, 13, 12, 12, 47, 31],
  [31.5, 48, 13.5, 12.5, 12.5, 47, 31.5],
  [32, 48.5, 14, 13, 13, 48, 32],
].map(([cm, eu, us, uk, au, br, jp]) => ({ cm, eu, us, uk, au, br, jp }));

const WOMEN_SHOES = [
  [21.5, 34, 4, 2, 3, 33, 21.5],
  [22, 35, 4.5, 2.5, 3.5, 34, 22],
  [22.5, 35.5, 5, 3, 4, 34, 22.5],
  [23, 36, 5.5, 3.5, 4.5, 35, 23],
  [23.5, 37, 6, 4, 5, 36, 23.5],
  [24, 37.5, 6.5, 4.5, 5.5, 36, 24],
  [24.5, 38, 7, 5, 6, 37, 24.5],
  [25, 38.5, 7.5, 5.5, 6.5, 38, 25],
  [25.5, 39, 8, 6, 7, 38, 25.5],
  [26, 40, 8.5, 6.5, 7.5, 39, 26],
  [26.5, 40.5, 9, 7, 8, 40, 26.5],
  [27, 41, 9.5, 7.5, 8.5, 40, 27],
  [27.5, 42, 10, 8, 9, 41, 27.5],
  [28, 42.5, 10.5, 8.5, 9.5, 42, 28],
  [28.5, 43, 11, 9, 10, 42, 28.5],
  [29, 44, 11.5, 9.5, 10.5, 43, 29],
  [29.5, 44.5, 12, 10, 11, 44, 29.5],
  [30, 45, 12.5, 10.5, 11.5, 44, 30],
].map(([cm, eu, us, uk, au, br, jp]) => ({ cm, eu, us, uk, au, br, jp }));

const KIDS_SHOES = [
  [12, 20, "5C", 4.5, 12],
  [12.5, 21, "5.5C", 5, 12.5],
  [13, 21.5, "6C", 5.5, 13],
  [13.5, 22, "6.5C", 6, 13.5],
  [14, 23, "7C", 6.5, 14],
  [14.5, 23.5, "7.5C", 7, 14.5],
  [15, 24, "8C", 7.5, 15],
  [15.5, 25, "8.5C", 8, 15.5],
  [16, 25.5, "9C", 8.5, 16],
  [16.5, 26, "9.5C", 9, 16.5],
  [17, 27, "10C", 9.5, 17],
  [17.5, 27.5, "10.5C", 10, 17.5],
  [18, 28, "11C", 10.5, 18],
  [18.5, 29, "11.5C", 11, 18.5],
  [19, 29.5, "12C", 11.5, 19],
  [19.5, 30, "12.5C", 12, 19.5],
  [20, 31, "13C", 12.5, 20],
  [20.5, 31.5, "13.5C", 13, 20.5],
  [21, 32, "1Y", 13.5, 21],
  [21.5, 33, "1.5Y", 1, 21.5],
  [22, 33.5, "2Y", 1.5, 22],
  [22.5, 34, "2.5Y", 2, 22.5],
].map(([cm, eu, us, uk, jp]) => ({ cm, eu, us, uk, jp }));

/* ------------------------------- Clothing -------------------------------- */

const WOMEN_TOPS = [
  ["XXS", "00", "2", "30", "34", "32", "1", 72, 76, 54, 58, 78, 82],
  ["XS", "0-2", "4-6", "32-34", "36-38", "34-36", "3-5", 76, 80, 58, 62, 84, 88],
  ["S", "4-6", "8-10", "36-38", "40-42", "38-40", "7-9", 82, 86, 64, 68, 88, 92],
  ["M", "8-10", "12-14", "40-42", "44-46", "42-44", "11-13", 88, 92, 70, 74, 94, 98],
  ["L", "12-14", "16-18", "44-46", "48-50", "46-48", "15-17", 94, 98, 76, 80, 100, 104],
  ["XL", "16-18", "20-22", "48-50", "52-54", "50-52", "19-21", 100, 104, 82, 86, 106, 110],
  ["XXL", "20-22", "24-26", "52-54", "56-58", "54-56", "23-25", 106, 110, 88, 93, 112, 116],
  ["3XL", "24-26", "28-30", "56-58", "60-62", "58-60", "27-29", 112, 117, 94, 100, 118, 123],
].map(([int, us, uk, eu, it, fr, jp, bustMin, bustMax, waistMin, waistMax, hipMin, hipMax]) => ({
  int,
  us,
  uk,
  eu,
  it,
  fr,
  jp,
  bustMin,
  bustMax,
  waistMin,
  waistMax,
  hipMin,
  hipMax,
}));

const MEN_TOPS = [
  ["XS", "34", "34", "44", "44", "44", "S", 84, 89, 71, 76],
  ["S", "36", "36", "46", "46", "46", "M", 89, 94, 76, 81],
  ["M", "38-40", "38-40", "48-50", "48-50", "48-50", "L", 95, 101, 81, 86],
  ["L", "42", "42", "52", "52", "52", "XL", 102, 107, 86, 91],
  ["XL", "44-46", "44-46", "54-56", "54-56", "54-56", "XXL", 108, 113, 91, 97],
  ["XXL", "48", "48", "58", "58", "58", "3XL", 114, 119, 97, 102],
  ["3XL", "50-52", "50-52", "60-62", "60-62", "60-62", "4XL", 120, 127, 102, 109],
].map(([int, us, uk, eu, it, fr, jp, chestMin, chestMax, waistMin, waistMax]) => ({
  int,
  us,
  uk,
  eu,
  it,
  fr,
  jp,
  chestMin,
  chestMax,
  waistMin,
  waistMax,
}));

const WOMEN_BOTTOMS = [
  ["XXS", "0", "4", "32", "36", "34", "1", 54, 58, 78, 82],
  ["XS", "2-4", "6-8", "34-36", "38-40", "36-38", "3-5", 58, 62, 84, 88],
  ["S", "6-8", "10-12", "38-40", "42-44", "40-42", "7-9", 64, 68, 88, 92],
  ["M", "10-12", "14-16", "42-44", "46-48", "44-46", "11-13", 70, 74, 94, 98],
  ["L", "14-16", "18-20", "46-48", "50-52", "48-50", "15-17", 76, 80, 100, 104],
  ["XL", "18-20", "22-24", "50-52", "54-56", "52-54", "19-21", 82, 86, 106, 110],
  ["XXL", "22-24", "26-28", "54-56", "58-60", "56-58", "23-25", 88, 93, 112, 116],
  ["3XL", "26-28", "30-32", "58-60", "62-64", "60-62", "27-29", 94, 100, 118, 123],
].map(([int, us, uk, eu, it, fr, jp, waistMin, waistMax, hipMin, hipMax]) => ({
  int,
  us,
  uk,
  eu,
  it,
  fr,
  jp,
  waistMin,
  waistMax,
  hipMin,
  hipMax,
}));

const MEN_BOTTOMS = [
  ["XS", 28, 28, "44", "44", "36", "S", 71, 76],
  ["S", 30, 30, "46", "46", "38", "M", 76, 81],
  ["M", 32, 32, "48", "48", "40", "L", 81, 86],
  ["L", 34, 34, "50", "50", "42", "LL", 86, 91],
  ["L", 36, 36, "52", "52", "44", "3L", 91, 97],
  ["XL", 38, 38, "54", "54", "46", "4L", 97, 102],
  ["XXL", 40, 40, "56", "56", "48", "5L", 102, 107],
  ["3XL", 42, 42, "58", "58", "50", "6L", 107, 112],
  ["4XL", 44, 44, "60", "60", "52", "7L", 112, 117],
].map(([int, us, uk, eu, it, fr, jp, waistMin, waistMax]) => ({
  int,
  us,
  uk,
  eu,
  it,
  fr,
  jp,
  waistMin,
  waistMax,
}));

const KIDS_CLOTHING = [
  ["0-3M", "3M", "3M", "56", "1", 50, 60],
  ["3-6M", "6M", "6M", "68", "2", 60, 68],
  ["6-9M", "9M", "9M", "74", "3", 68, 74],
  ["9-12M", "12M", "12M", "80", "4", 74, 80],
  ["12-18M", "18M", "18M", "86", "5", 80, 86],
  ["18-24M", "24M", "24M", "92", "6", 86, 92],
  ["2-3Y", "2T", "2-3Y", "98", "7", 92, 98],
  ["3-4Y", "3T", "3-4Y", "104", "8", 98, 104],
  ["4-5Y", "4T", "4-5Y", "110", "9", 104, 110],
  ["5-6Y", "5", "5-6Y", "116", "10", 110, 116],
  ["6-7Y", "6", "6-7Y", "122", "11", 116, 122],
  ["7-8Y", "7", "7-8Y", "128", "12", 122, 128],
  ["8-9Y", "8", "8-9Y", "134", "13", 128, 134],
  ["9-10Y", "10", "9-10Y", "140", "14", 134, 140],
].map(([int, us, uk, eu, jp, heightMin, heightMax]) => ({
  int,
  us,
  uk,
  eu,
  jp,
  heightMin,
  heightMax,
}));

export const SIZE_CHARTS = {
  "men-shoes": {
    label: "Men's shoes",
    group: "shoes",
    audience: "men",
    anchorLabel: "Foot length",
    anchorKey: "cm",
    anchorUnit: "cm",
    systems: [
      { key: "eu", label: "EU" },
      { key: "us", label: "US" },
      { key: "uk", label: "UK" },
      { key: "au", label: "AU" },
      { key: "br", label: "BR" },
      { key: "jp", label: "JP / CM" },
    ],
    fields: [
      { key: "cm", label: "Foot (cm)", type: "number", step: 0.1 },
      { key: "eu", label: "EU", type: "number", step: 0.5 },
      { key: "us", label: "US", type: "number", step: 0.5 },
      { key: "uk", label: "UK", type: "number", step: 0.5 },
      { key: "au", label: "AU", type: "number", step: 0.5 },
      { key: "br", label: "BR", type: "number", step: 1 },
      { key: "jp", label: "JP (cm)", type: "number", step: 0.5 },
    ],
    rows: MEN_SHOES,
  },
  "women-shoes": {
    label: "Women's shoes",
    group: "shoes",
    audience: "women",
    anchorLabel: "Foot length",
    anchorKey: "cm",
    anchorUnit: "cm",
    systems: [
      { key: "eu", label: "EU" },
      { key: "us", label: "US" },
      { key: "uk", label: "UK" },
      { key: "au", label: "AU" },
      { key: "br", label: "BR" },
      { key: "jp", label: "JP / CM" },
    ],
    fields: [
      { key: "cm", label: "Foot (cm)", type: "number", step: 0.1 },
      { key: "eu", label: "EU", type: "number", step: 0.5 },
      { key: "us", label: "US", type: "number", step: 0.5 },
      { key: "uk", label: "UK", type: "number", step: 0.5 },
      { key: "au", label: "AU", type: "number", step: 0.5 },
      { key: "br", label: "BR", type: "number", step: 1 },
      { key: "jp", label: "JP (cm)", type: "number", step: 0.5 },
    ],
    rows: WOMEN_SHOES,
  },
  "kids-shoes": {
    label: "Kids' shoes",
    group: "shoes",
    audience: "kids",
    anchorLabel: "Foot length",
    anchorKey: "cm",
    anchorUnit: "cm",
    systems: [
      { key: "eu", label: "EU" },
      { key: "us", label: "US Kids" },
      { key: "uk", label: "UK Kids" },
      { key: "jp", label: "JP / CM" },
    ],
    fields: [
      { key: "cm", label: "Foot (cm)", type: "number", step: 0.1 },
      { key: "eu", label: "EU", type: "number", step: 0.5 },
      { key: "us", label: "US Kids", type: "text" },
      { key: "uk", label: "UK Kids", type: "number", step: 0.5 },
      { key: "jp", label: "JP (cm)", type: "number", step: 0.5 },
    ],
    rows: KIDS_SHOES,
  },
  "women-tops": {
    label: "Women's tops",
    group: "clothing",
    audience: "women",
    anchorLabel: "Bust",
    anchorKey: "bustMin",
    anchorUnit: "cm",
    systems: [
      { key: "int", label: "Size" },
      { key: "us", label: "US" },
      { key: "uk", label: "UK" },
      { key: "eu", label: "EU" },
      { key: "it", label: "IT" },
      { key: "fr", label: "FR" },
    ],
    fields: [
      { key: "int", label: "Size", type: "text" },
      { key: "us", label: "US", type: "text" },
      { key: "uk", label: "UK", type: "text" },
      { key: "eu", label: "EU", type: "text" },
      { key: "it", label: "IT", type: "text" },
      { key: "fr", label: "FR", type: "text" },
      { key: "jp", label: "JP", type: "text" },
      { key: "bustMin", label: "Bust min (cm)", type: "number", step: 1 },
      { key: "bustMax", label: "Bust max (cm)", type: "number", step: 1 },
      { key: "waistMin", label: "Waist min (cm)", type: "number", step: 1 },
      { key: "waistMax", label: "Waist max (cm)", type: "number", step: 1 },
      { key: "hipMin", label: "Hip min (cm)", type: "number", step: 1 },
      { key: "hipMax", label: "Hip max (cm)", type: "number", step: 1 },
    ],
    rows: WOMEN_TOPS,
  },
  "men-tops": {
    label: "Men's tops",
    group: "clothing",
    audience: "men",
    anchorLabel: "Chest",
    anchorKey: "chestMin",
    anchorUnit: "cm",
    systems: [
      { key: "int", label: "Size" },
      { key: "us", label: "US" },
      { key: "uk", label: "UK" },
      { key: "eu", label: "EU" },
      { key: "it", label: "IT" },
      { key: "fr", label: "FR" },
    ],
    fields: [
      { key: "int", label: "Size", type: "text" },
      { key: "us", label: "US", type: "text" },
      { key: "uk", label: "UK", type: "text" },
      { key: "eu", label: "EU", type: "text" },
      { key: "it", label: "IT", type: "text" },
      { key: "fr", label: "FR", type: "text" },
      { key: "jp", label: "JP", type: "text" },
      { key: "chestMin", label: "Chest min (cm)", type: "number", step: 1 },
      { key: "chestMax", label: "Chest max (cm)", type: "number", step: 1 },
      { key: "waistMin", label: "Waist min (cm)", type: "number", step: 1 },
      { key: "waistMax", label: "Waist max (cm)", type: "number", step: 1 },
    ],
    rows: MEN_TOPS,
  },
  "women-bottoms": {
    label: "Women's bottoms",
    group: "clothing",
    audience: "women",
    anchorLabel: "Waist",
    anchorKey: "waistMin",
    anchorUnit: "cm",
    systems: [
      { key: "int", label: "Size" },
      { key: "us", label: "US" },
      { key: "uk", label: "UK" },
      { key: "eu", label: "EU" },
      { key: "it", label: "IT" },
      { key: "fr", label: "FR" },
    ],
    fields: [
      { key: "int", label: "Size", type: "text" },
      { key: "us", label: "US", type: "text" },
      { key: "uk", label: "UK", type: "text" },
      { key: "eu", label: "EU", type: "text" },
      { key: "it", label: "IT", type: "text" },
      { key: "fr", label: "FR", type: "text" },
      { key: "jp", label: "JP", type: "text" },
      { key: "waistMin", label: "Waist min (cm)", type: "number", step: 1 },
      { key: "waistMax", label: "Waist max (cm)", type: "number", step: 1 },
      { key: "hipMin", label: "Hip min (cm)", type: "number", step: 1 },
      { key: "hipMax", label: "Hip max (cm)", type: "number", step: 1 },
    ],
    rows: WOMEN_BOTTOMS,
  },
  "men-bottoms": {
    label: "Men's bottoms",
    group: "clothing",
    audience: "men",
    anchorLabel: "Waist",
    anchorKey: "waistMin",
    anchorUnit: "cm",
    systems: [
      { key: "int", label: "Size" },
      { key: "us", label: "US / Waist" },
      { key: "uk", label: "UK" },
      { key: "eu", label: "EU" },
      { key: "it", label: "IT" },
      { key: "fr", label: "FR" },
    ],
    fields: [
      { key: "int", label: "Size", type: "text" },
      { key: "us", label: "US waist", type: "number", step: 1 },
      { key: "uk", label: "UK", type: "number", step: 1 },
      { key: "eu", label: "EU", type: "text" },
      { key: "it", label: "IT", type: "text" },
      { key: "fr", label: "FR", type: "text" },
      { key: "jp", label: "JP", type: "text" },
      { key: "waistMin", label: "Waist min (cm)", type: "number", step: 1 },
      { key: "waistMax", label: "Waist max (cm)", type: "number", step: 1 },
    ],
    rows: MEN_BOTTOMS,
  },
  "kids-clothing": {
    label: "Kids' clothing",
    group: "clothing",
    audience: "kids",
    anchorLabel: "Height",
    anchorKey: "heightMin",
    anchorUnit: "cm",
    systems: [
      { key: "int", label: "Age" },
      { key: "us", label: "US" },
      { key: "uk", label: "UK" },
      { key: "eu", label: "EU" },
      { key: "jp", label: "JP" },
    ],
    fields: [
      { key: "int", label: "Age", type: "text" },
      { key: "us", label: "US", type: "text" },
      { key: "uk", label: "UK", type: "text" },
      { key: "eu", label: "EU", type: "text" },
      { key: "jp", label: "JP", type: "text" },
      { key: "heightMin", label: "Height min (cm)", type: "number", step: 1 },
      { key: "heightMax", label: "Height max (cm)", type: "number", step: 1 },
    ],
    rows: KIDS_CLOTHING,
  },
};

export const AUDIENCES = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
];

export const GROUPS = [
  { value: "shoes", label: "Shoes" },
  { value: "clothing", label: "Clothing" },
];

export function chartKeyFor(group, audience) {
  return `${audience}-${group}`;
}

/** First number in a label such as "8-10" or "M". */
export function parseSizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const match = String(value).match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function distance(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.POSITIVE_INFINITY;
  return Math.abs(a - b);
}

/**
 * Find rows matching a measurement. Uses the anchor range when available and
 * falls back to the closest row so a result is always offered.
 */
export function findByMeasurement(rows, anchorKey, measurement) {
  if (!Number.isFinite(measurement)) return { row: null, index: -1, exact: false };
  const rangeKey = `${anchorKey.replace(/Min$/, "")}Max`;
  let exactIndex = -1;
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const min = row[anchorKey];
    const max = row[rangeKey];
    if (Number.isFinite(min) && Number.isFinite(max)) {
      if (measurement >= min && measurement <= max) {
        exactIndex = index;
        break;
      }
    } else if (Number.isFinite(min) && distance(measurement, min) <= 1.5) {
      exactIndex = index;
      break;
    }
  }
  if (exactIndex >= 0) return { row: rows[exactIndex], index: exactIndex, exact: true };

  let bestIndex = 0;
  let best = Number.POSITIVE_INFINITY;
  rows.forEach((row, index) => {
    const target = Number.isFinite(row[anchorKey]) ? row[anchorKey] : row[rangeKey];
    const gap = distance(measurement, target);
    if (gap < best) {
      best = gap;
      bestIndex = index;
    }
  });
  return { row: rows[bestIndex] || null, index: bestIndex, exact: false };
}

/** Find the row whose given system value is closest to the supplied size. */
export function findBySystem(rows, systemKey, value) {
  const target = parseSizeNumber(value);
  if (!Number.isFinite(target)) return { row: null, index: -1, exact: false };
  let bestIndex = 0;
  let best = Number.POSITIVE_INFINITY;
  let exact = false;
  rows.forEach((row, index) => {
    const candidate = parseSizeNumber(row[systemKey]);
    const gap = distance(target, candidate);
    if (gap < best) {
      best = gap;
      bestIndex = index;
      exact = gap === 0;
    }
  });
  return { row: rows[bestIndex] || null, index: bestIndex, exact };
}

/** Space the size chart plus/minus offsets (in chart steps). */
export function offsetRow(rows, index, offset) {
  if (!Number.isFinite(offset) || offset === 0) return rows[index] || null;
  const base = rows[index];
  if (!base) return null;
  const target = rows[index + offset];
  return target || base;
}

export const SIZE_FAQS = [
  {
    question: "How accurate are shoe and clothing size conversions?",
    answer:
      "The charts follow widely published international conversion guides. Real sizing still varies by brand, last shape, fabric stretch and manufacturing tolerance, so treat the result as a starting point and check the brand's own size chart when you can.",
  },
  {
    question: "Should I measure my foot in the morning or at night?",
    answer:
      "Measure late in the day when your feet are at their largest, stand on a hard floor with your weight on the foot, and measure the distance from the back of the heel to the tip of your longest toe. Measure both feet and use the larger value.",
  },
  {
    question: "Why do EU and US sizes not line up perfectly?",
    answer:
      "EU sizes follow a Paris-point system based on last length, while US sizes use barleycorns and a different zero point. Because each system rounds differently, the same foot can sit between two sizes. The converter therefore also shows the neighbouring size.",
  },
  {
    question: "What is the difference between US and UK sizing?",
    answer:
      "For adults, UK shoe sizes are commonly one size below US sizes for men and roughly two sizes below US sizes for women. Clothing systems diverge further, which is why the converter maps each category separately.",
  },
  {
    question: "How should I measure my chest, waist and hips?",
    answer:
      "Keep the tape level and snug but not tight. Measure the chest at the fullest point, the natural waist at the narrowest point above the navel, and the hips at the fullest point around the seat. Wear light clothing or measure over underwear.",
  },
  {
    question: "Can I create my own brand size chart?",
    answer:
      "Yes. Open the custom chart editor for the active category, edit any row, add new rows or delete the ones you do not need. Your custom chart is saved locally in your browser and can be exported as JSON for reuse.",
  },
  {
    question: "What about wide or narrow feet?",
    answer:
      "Use the width selector to add guidance. A wide fit often needs a half size up or a wide-width shoe, while a narrow foot may need a half size down. Shoe width letters differ between men, women and brands, so always confirm with the brand's width chart.",
  },
  {
    question: "Is my data uploaded anywhere?",
    answer:
      "No. Every measurement, custom chart and saved preference stays in your browser's local storage. ToolsTrek never receives your body measurements.",
  },
];

export function createDemoState(chartKey) {
  const chart = SIZE_CHARTS[chartKey];
  if (!chart) return { mode: "measure", measurement: "", sizeSystem: chart?.systems?.[0]?.key || "eu", sizeValue: "", unit: "cm" };
  if (chart.group === "shoes") {
    return {
      mode: "measure",
      unit: "cm",
      measurement: chart.audience === "kids" ? "16.5" : chart.audience === "women" ? "24.5" : "26.5",
      sizeSystem: "eu",
      sizeValue: chart.audience === "women" ? "8" : chart.audience === "men" ? "9.5" : "9C",
      width: "standard",
      allowance: true,
    };
  }
  if (chartKey === "men-tops") {
    return { mode: "measure", unit: "cm", measurement: "96", sizeSystem: "us", sizeValue: "38-40", width: "standard", allowance: false };
  }
  if (chartKey === "men-bottoms") {
    return { mode: "measure", unit: "cm", measurement: "84", sizeSystem: "us", sizeValue: "32", width: "standard", allowance: false };
  }
  if (chartKey === "kids-clothing") {
    return { mode: "measure", unit: "cm", measurement: "101", sizeSystem: "us", sizeValue: "3T", width: "standard", allowance: false };
  }
  return { mode: "measure", unit: "cm", measurement: "88", sizeSystem: "us", sizeValue: "8-10", width: "standard", allowance: false };
}
