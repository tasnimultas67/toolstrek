// app/(main)/tools-compo/tools/_shared/chartImport.js
// Shared CSV / TSV / Excel import helpers for every chart generator in the
// Chart Studio family (pie, bar, line, radar, funnel and polar).
//
// Everything here runs in the browser. Delimited text is parsed with a small,
// dependency-free RFC-4180-style state machine and modern Excel .xlsx files are
// read straight out of their ZIP container with JSZip (already a project
// dependency) — no data ever leaves the device.

export const MAX_IMPORT_ROWS = 24;
export const MAX_IMPORT_SERIES = 8;

// react-dropzone expects a MIME → extensions map. Legacy .xls is intentionally
// included so we can show a helpful "re-save as .xlsx" message instead of a
// silent rejection.
export const IMPORT_ACCEPT = {
  "text/csv": [".csv"],
  "text/tab-separated-values": [".tsv"],
  "text/plain": [".txt"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
};

const UNSUPPORTED_LEGACY = new Set(["xls", "xlsm", "ods", "numbers"]);

export function getExtension(name = "") {
  const match = String(name).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

// ─── Value coercion ──────────────────────────────────────────────────────────
// Turns "$1,234.50", "(300)", "45%", "1 200" or real numbers into a finite
// number. Anything that is not genuinely numeric returns null so the caller can
// skip it rather than silently turning it into NaN/0.
export function normalizeNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  let text = String(value).trim();
  if (text === "") return null;

  let negative = false;
  if (/^\(.*\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1);
  }

  const cleaned = text
    .replace(/[$€£¥₹₽₩]/g, "")
    .replace(/%/g, "")
    .replace(/[,\s\u00a0'’]/g, "");

  if (!/^[+-]?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/.test(cleaned)) return null;

  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;
  return negative ? -num : num;
}

export function columnLetter(index) {
  let i = Math.max(0, Math.floor(index));
  let label = "";
  do {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  } while (i >= 0);
  return label;
}

// ─── Delimited text (CSV / TSV / pasted data) ────────────────────────────────
function countOutsideQuotes(line, delimiter) {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') i++;
      else inQuotes = !inQuotes;
    } else if (!inQuotes && ch === delimiter) {
      count++;
    }
  }
  return count;
}

export function detectDelimiter(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .slice(0, 6);
  if (!lines.length) return ",";

  const candidates = [",", "\t", ";", "|"];
  let best = ",";
  let bestScore = 0;
  for (const delimiter of candidates) {
    const counts = lines.map((line) => countOutsideQuotes(line, delimiter));
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    if (min < 1) continue;
    const score = min * 2 - (max - min);
    if (score > bestScore) {
      bestScore = score;
      best = delimiter;
    }
  }
  return best;
}

// RFC-4180-ish parser: understands quoted fields, escaped quotes ("") and
// both \n and \r\n line endings.
export function parseDelimitedText(text, delimiter) {
  const src = String(text ?? "").replace(/^\uFEFF/, "");
  const sep = delimiter || ",";
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === "") {
      // A quote only opens a quoted section at the very start of a field;
      // a stray quote inside an unquoted value is kept literally.
      inQuotes = true;
    } else if (ch === sep) {
      endField();
    } else if (ch === "\n") {
      endRow();
    } else if (ch === "\r") {
      if (src[i + 1] === "\n") i++;
      endRow();
    } else {
      field += ch;
    }
  }
  endRow();

  while (rows.length && rows[rows.length - 1].every((cell) => String(cell).trim() === "")) {
    rows.pop();
  }
  return rows;
}

// ─── Excel (.xlsx) ───────────────────────────────────────────────────────────
function parseXml(text, message) {
  if (typeof DOMParser === "undefined") {
    throw new Error("Spreadsheet parsing is only available in the browser.");
  }
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) {
    throw new Error(message || "That spreadsheet could not be read.");
  }
  return doc;
}

function colRefToIndex(ref) {
  let index = 0;
  for (let i = 0; i < ref.length; i++) {
    const code = ref.charCodeAt(i);
    if (code < 65 || code > 90) break;
    index = index * 26 + (code - 64);
  }
  return index - 1;
}

function readSharedStrings(doc) {
  const out = [];
  const items = doc.getElementsByTagName("si");
  for (let i = 0; i < items.length; i++) {
    const parts = items[i].getElementsByTagName("t");
    let text = "";
    for (let j = 0; j < parts.length; j++) text += parts[j].textContent || "";
    out.push(text);
  }
  return out;
}

async function resolveSheets(zip) {
  const sheets = [];
  const relTargets = {};

  const relsFile = zip.file("xl/_rels/workbook.xml.rels");
  if (relsFile) {
    const relsDoc = parseXml(await relsFile.async("string"));
    const rels = relsDoc.getElementsByTagName("Relationship");
    for (let i = 0; i < rels.length; i++) {
      const id = rels[i].getAttribute("Id");
      let target = (rels[i].getAttribute("Target") || "").replace(/^\//, "");
      if (id && target) {
        if (!target.startsWith("xl/")) target = `xl/${target}`;
        relTargets[id] = target.replace(/\/\.\//g, "/");
      }
    }
  }

  const wbFile = zip.file("xl/workbook.xml");
  if (wbFile) {
    const wbDoc = parseXml(await wbFile.async("string"));
    const sheetEls = wbDoc.getElementsByTagName("sheet");
    for (let i = 0; i < sheetEls.length; i++) {
      const name = sheetEls[i].getAttribute("name") || `Sheet ${i + 1}`;
      const rid =
        sheetEls[i].getAttribute("r:id") ||
        sheetEls[i].getAttributeNS(
          "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
          "id"
        );
      const path = rid ? relTargets[rid] : null;
      if (path && zip.file(path)) sheets.push({ name, path });
    }
  }

  if (!sheets.length) {
    const paths = Object.keys(zip.files)
      .filter((path) => /^xl\/worksheets\/sheet\d+\.xml$/.test(path))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    paths.forEach((path, index) => sheets.push({ name: `Sheet ${index + 1}`, path }));
  }
  return sheets;
}

function readSheetRows(doc, sharedStrings) {
  const rows = [];
  const rowEls = doc.getElementsByTagName("row");
  for (let i = 0; i < rowEls.length; i++) {
    const cells = rowEls[i].getElementsByTagName("c");
    const row = [];
    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      const ref = cell.getAttribute("r") || "";
      const letters = ref.replace(/[^A-Z]/g, "");
      const col = letters ? colRefToIndex(letters) : row.length;
      const type = cell.getAttribute("t");
      let value = "";

      if (type === "s") {
        const v = cell.getElementsByTagName("v")[0];
        const idx = v ? Number(v.textContent) : NaN;
        value = Number.isFinite(idx) ? sharedStrings[idx] ?? "" : "";
      } else if (type === "inlineStr") {
        const is = cell.getElementsByTagName("is")[0];
        value = is ? is.textContent || "" : "";
      } else if (type === "b") {
        const v = cell.getElementsByTagName("v")[0];
        value = v && v.textContent === "1" ? "TRUE" : "FALSE";
      } else {
        const v = cell.getElementsByTagName("v")[0];
        value = v ? v.textContent || "" : "";
      }
      row[Math.max(0, col)] = value;
    }
    rows.push(row);
  }
  return rows;
}

function trimRows(rows) {
  if (!rows.length) return [];
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const filled = rows.map((row) =>
    Array.from({ length: width }, (_, i) => row[i] ?? "")
  );

  let lastCol = width - 1;
  while (
    lastCol >= 0 &&
    filled.every((row) => String(row[lastCol] ?? "").trim() === "")
  ) {
    lastCol--;
  }
  const sliced = filled.map((row) => row.slice(0, lastCol + 1));
  return sliced.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
}

export async function parseXlsxArrayBuffer(buffer) {
  const mod = await import("jszip");
  const JSZip = mod.default ?? mod;

  let zip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw new Error("That file isn't a valid .xlsx workbook.");
  }

  const sheets = await resolveSheets(zip);
  if (!sheets.length) {
    throw new Error("No worksheets were found inside this Excel file.");
  }

  const sharedFile = zip.file("xl/sharedStrings.xml");
  const sharedStrings = sharedFile
    ? readSharedStrings(parseXml(await sharedFile.async("string")))
    : [];

  const sheet = sheets[0];
  const sheetDoc = parseXml(
    await zip.file(sheet.path).async("string"),
    "The first worksheet could not be read."
  );

  return {
    rows: trimRows(readSheetRows(sheetDoc, sharedStrings)),
    sheetName: sheet.name,
    sheetNames: sheets.map((item) => item.name),
  };
}

// ─── File reading ────────────────────────────────────────────────────────────
function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsText(file);
  });
}

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsArrayBuffer(file);
  });
}

// Single entry point: figure out the format from the extension and return a
// normalised 2-D table of strings plus a little metadata.
export async function parseDataFile(file) {
  if (!file) throw new Error("No file was selected.");

  const ext = getExtension(file.name);
  if (UNSUPPORTED_LEGACY.has(ext)) {
    throw new Error(
      `Legacy .${ext} files aren't supported — please re-save as .xlsx, .csv or .tsv and try again.`
    );
  }

  if (ext === "xlsx") {
    const buffer = await readAsArrayBuffer(file);
    const result = await parseXlsxArrayBuffer(buffer);
    return {
      rows: result.rows,
      source: "Excel",
      sheetName: result.sheetName,
      sheetNames: result.sheetNames,
    };
  }

  if (ext === "csv" || ext === "tsv" || ext === "txt" || ext === "") {
    const text = await readAsText(file);
    // A .tsv is unambiguously tab-separated, but a .csv is not: Excel in many
    // locales exports semicolon- or even pipe-delimited "CSV" files. Rather than
    // assuming a comma we sniff the actual delimiter from the content, which
    // still resolves to a comma for ordinary comma-separated files.
    const delimiter = ext === "tsv" ? "\t" : detectDelimiter(text);
    const rows = parseDelimitedText(text, delimiter);
    return {
      rows,
      source: "text",
      delimiter: delimiter === "\t" ? "tab" : delimiter,
    };
  }

  throw new Error(
    "Unsupported file type. Upload a .csv, .tsv or .xlsx file, or paste your data."
  );
}

// ─── Table analysis & mapping ────────────────────────────────────────────────
export function guessHasHeader(rows) {
  if (!rows.length) return false;
  const first = rows[0];
  const nonEmpty = first.filter((cell) => String(cell ?? "").trim() !== "");
  if (!nonEmpty.length) return false;
  const numeric = nonEmpty.filter((cell) => normalizeNumber(cell) !== null);
  return numeric.length < nonEmpty.length;
}

const VALUE_KEYWORDS =
  /(value|amount|count|total|sales|revenue|qty|quantity|score|number|percent|share|frequency|hours|price|visits|sessions|population|size)/i;
const LABEL_KEYWORDS =
  /(label|name|category|type|group|channel|item|region|country|month|day|hour|direction|segment|department|product|city|source|medium)/i;

export function analyzeTable(rows, options = {}) {
  const hasHeader = options.hasHeader ?? guessHasHeader(rows);
  const firstRow = rows[0] || [];
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);

  const header = Array.from({ length: width }, (_, index) => {
    const raw = hasHeader ? String(firstRow[index] ?? "").trim() : "";
    return raw || columnLetter(index);
  });

  const body = (hasHeader ? rows.slice(1) : rows).filter((row) =>
    row.some((cell) => String(cell ?? "").trim() !== "")
  );

  const columns = Array.from({ length: width }, (_, index) => {
    const values = body.map((row) => row[index]);
    const nonEmpty = values.filter((cell) => String(cell ?? "").trim() !== "").length;
    const numeric = values.filter((cell) => normalizeNumber(cell) !== null).length;
    return {
      index,
      name: header[index],
      nonEmpty,
      numeric,
      numericRatio: nonEmpty ? numeric / nonEmpty : 0,
    };
  });

  let valueIndex = -1;
  let bestValue = -1;
  for (const column of columns) {
    if (column.nonEmpty === 0 || column.numericRatio < 0.5) continue;
    let score = column.numericRatio;
    if (VALUE_KEYWORDS.test(column.name)) score += 0.5;
    if (score > bestValue) {
      bestValue = score;
      valueIndex = column.index;
    }
  }
  if (valueIndex === -1) {
    const fallback = columns.find((column) => column.numericRatio >= 0.5);
    valueIndex = fallback ? fallback.index : -1;
  }

  let labelIndex = -1;
  let bestLabel = -1;
  for (const column of columns) {
    if (column.index === valueIndex || column.nonEmpty === 0) continue;
    let score = 1 - column.numericRatio;
    if (LABEL_KEYWORDS.test(column.name)) score += 0.5;
    if (score > bestLabel) {
      bestLabel = score;
      labelIndex = column.index;
    }
  }
  if (labelIndex === -1) {
    const fallback = columns.find((column) => column.index !== valueIndex);
    labelIndex = fallback ? fallback.index : 0;
  }

  // Every plausibly-numeric column except the chosen label column — the default
  // series selection for the multi-series chart tools.
  const valueIndexes = columns
    .filter((column) => column.index !== labelIndex && column.numericRatio >= 0.5)
    .map((column) => column.index);

  return { hasHeader, header, body, columns, labelIndex, valueIndex, valueIndexes };
}

// ─── Row builders ────────────────────────────────────────────────────────────
// Single-series charts (pie, funnel, polar): one label column + one value column.
export function buildSlices(table, labelIndex, valueIndex, options = {}) {
  const maxRows = options.maxRows ?? MAX_IMPORT_ROWS;
  const body = table.body || [];
  const slices = [];
  let skipped = 0;
  let zero = 0;

  const limited = maxRows > 0 ? body.slice(0, maxRows) : body;
  for (let i = 0; i < limited.length; i++) {
    const row = limited[i];
    const rawLabel = String(row[labelIndex] ?? "").trim();
    const rawValue = row[valueIndex];
    const blank = rawLabel === "" && String(rawValue ?? "").trim() === "";
    if (blank) continue;

    const num = normalizeNumber(rawValue);
    if (num === null) {
      skipped++;
      continue;
    }

    const safe = Math.max(0, num);
    if (safe === 0) zero++;
    slices.push({
      label: rawLabel || `Category ${slices.length + 1}`,
      value: safe,
    });
  }

  return {
    slices,
    skipped,
    zero,
    rowsTotal: body.length,
    truncated: body.length > limited.length,
  };
}

// Multi-series charts (bar, line, radar): one label column + N numeric columns.
// Each selected numeric column becomes a series named after its header.
export function buildMultiSeries(table, labelIndex, valueIndexes, options = {}) {
  const maxCategories = options.maxCategories ?? MAX_IMPORT_ROWS;
  const maxSeries = options.maxSeries ?? MAX_IMPORT_SERIES;
  const body = table.body || [];
  const selected = (valueIndexes || []).filter(
    (index) => Number.isInteger(index) && index !== labelIndex
  );
  const usedSeries = selected.slice(0, maxSeries);

  const limited = maxCategories > 0 ? body.slice(0, maxCategories) : body;
  const categories = limited.map(
    (row, index) => String(row[labelIndex] ?? "").trim() || `Category ${index + 1}`
  );

  const series = usedSeries.map((columnIndex) => ({
    name: table.header?.[columnIndex] || `Series ${columnIndex + 1}`,
    values: limited.map((row) => {
      const num = normalizeNumber(row[columnIndex]);
      return num === null ? 0 : num;
    }),
  }));

  const numericRows = limited.filter((row) =>
    usedSeries.some((index) => normalizeNumber(row[index]) !== null)
  ).length;

  return {
    categories,
    series,
    categoriesTotal: body.length,
    categoriesTruncated: body.length > limited.length,
    seriesTotal: selected.length,
    seriesTruncated: selected.length > usedSeries.length,
    numericRows,
  };
}
