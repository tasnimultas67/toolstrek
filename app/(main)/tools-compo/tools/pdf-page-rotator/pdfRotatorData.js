/* -------------------------------------------------------------------------- */
/*  PDF Page Rotator — selection parsing and pdf-lib export helpers.          */
/*  These helpers only run in the browser, where the file bytes live.         */
/* -------------------------------------------------------------------------- */

export const MAX_PREVIEW_PAGES = 60;
export const MAX_FILE_MB = 150;

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function normalizeRotation(angle) {
  const numeric = Number(angle) || 0;
  return ((numeric % 360) + 360) % 360;
}

export function rotationLabel(angle) {
  return `${normalizeRotation(angle)}°`;
}

export function pageOrientation(width, height, rotation = 0) {
  const turned = normalizeRotation(rotation) % 180 === 90;
  const w = turned ? height : width;
  const h = turned ? width : height;
  if (Math.abs(w - h) < 1) return "Square";
  return w > h ? "Landscape" : "Portrait";
}

/**
 * Parse selections such as "1-3, 5, 8-10" or "all", "odd", "even".
 * Returns a sorted, de-duplicated array of 1-based page numbers.
 */
export function parsePageSelection(input, totalPages) {
  const raw = String(input ?? "").trim().toLowerCase();
  if (!totalPages || totalPages < 1) return { pages: [], error: null };
  if (!raw || raw === "all") {
    return { pages: Array.from({ length: totalPages }, (_, index) => index + 1), error: null };
  }
  if (raw === "odd") {
    return {
      pages: Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => page % 2 === 1),
      error: null,
    };
  }
  if (raw === "even") {
    return {
      pages: Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => page % 2 === 0),
      error: null,
    };
  }

  const pages = new Set();
  const tokens = raw.replace(/;/g, ",").split(",");
  for (const token of tokens) {
    const cleaned = token.trim();
    if (!cleaned) continue;
    const range = cleaned.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (range) {
      const start = Math.min(Number(range[1]), Number(range[2]));
      const end = Math.max(Number(range[1]), Number(range[2]));
      for (let page = start; page <= end; page += 1) {
        if (page >= 1 && page <= totalPages) pages.add(page);
      }
      continue;
    }
    if (/^\d+$/.test(cleaned)) {
      const page = Number(cleaned);
      if (page >= 1 && page <= totalPages) pages.add(page);
      continue;
    }
    return { pages: [], error: `“${cleaned}” is not a page number or range.` };
  }

  if (!pages.size) return { pages: [], error: "No valid pages were found in that selection." };
  return { pages: [...pages].sort((a, b) => a - b), error: null };
}

export function selectionToString(pages) {
  if (!pages.length) return "";
  const sorted = [...pages].sort((a, b) => a - b);
  const parts = [];
  let start = sorted[0];
  let previous = sorted[0];
  for (let index = 1; index <= sorted.length; index += 1) {
    const current = sorted[index];
    if (current === previous + 1) {
      previous = current;
      continue;
    }
    parts.push(start === previous ? `${start}` : `${start}-${previous}`);
    start = current;
    previous = current;
  }
  return parts.join(", ");
}

async function buildRotatedPdf({ bytes, rotations, selectedPages, selectedOnly }) {
  const { PDFDocument, degrees } = await import("pdf-lib");
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const sourceCount = source.getPageCount();
  const keep = selectedOnly
    ? selectedPages.filter((page) => page >= 1 && page <= sourceCount)
    : Array.from({ length: sourceCount }, (_, index) => index + 1);

  if (!keep.length) throw new Error("Select at least one page to export.");

  let target = source;
  if (selectedOnly) {
    target = await PDFDocument.create();
    const copied = await target.copyPages(
      source,
      keep.map((page) => page - 1),
    );
    copied.forEach((page) => target.addPage(page));
  }

  const outputPages = target.getPages();
  outputPages.forEach((page, index) => {
    const sourceIndex = selectedOnly ? keep[index] - 1 : index;
    const delta = Number(rotations[sourceIndex]) || 0;
    const current = page.getRotation().angle || 0;
    page.setRotation(degrees(normalizeRotation(current + delta)));
  });

  return target.save();
}

export async function createRotatedPdf(options) {
  return buildRotatedPdf(options);
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export const PDF_ROTATOR_FAQS = [
  {
    question: "How do I rotate pages in a PDF?",
    answer:
      "Upload a PDF, then use the rotate-left and rotate-right buttons on any page thumbnail. You can also select several pages, type a range such as 1-3,5, and rotate them together. When the preview looks right, download the rotated PDF.",
  },
  {
    question: "Does rotating a page change its quality?",
    answer:
      "No. The tool changes the page rotation flag in the PDF structure; it does not re-render, resample or compress the original content. Text, images and vectors stay exactly as they were.",
  },
  {
    question: "Can I rotate only some pages?",
    answer:
      "Yes. Use the checkboxes on individual thumbnails or type a page range. Rotate the selection with the left or right buttons, then enable “Download selected pages only” if you want a new PDF containing just those pages.",
  },
  {
    question: "What happens to pages that were already rotated?",
    answer:
      "The tool reads each page's existing rotation and adds your new rotation to it. The badge on every thumbnail shows the current total. Reset returns a page to its original orientation before download.",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. The file is read with JavaScript in your browser, thumbnails are rendered locally with PDF.js and the rotated document is rebuilt with pdf-lib. Nothing is transmitted or stored.",
  },
  {
    question: "Why is a page preview not shown?",
    answer:
      "To keep the page responsive, the first 60 pages receive thumbnails. Pages beyond that are still rotated and exported correctly — only the preview image is skipped.",
  },
];
