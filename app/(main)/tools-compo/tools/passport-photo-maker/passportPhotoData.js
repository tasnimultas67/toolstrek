// Passport / ID Photo Maker — document presets, crop geometry, image quality
// analysis and human-friendly readiness checks. All maths is deterministic and
// runs in the browser; nothing is uploaded.

export const MM_PER_INCH = 25.4;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_BATCH_COPIES = 40;

export const PHOTO_PRESETS = [
  {
    id: "us-passport",
    label: "US Passport",
    region: "United States",
    widthMm: 51,
    heightMm: 51,
    headMinPct: 50,
    headMaxPct: 69,
    eyeMinPct: 56,
    eyeMaxPct: 69,
    background: "#ffffff",
    note: "2 × 2 in. Plain white background, full face, neutral expression.",
  },
  {
    id: "us-visa",
    label: "US Visa",
    region: "United States",
    widthMm: 51,
    heightMm: 51,
    headMinPct: 50,
    headMaxPct: 69,
    eyeMinPct: 56,
    eyeMaxPct: 69,
    background: "#ffffff",
    note: "2 × 2 in. Same framing as a US passport, plain white or off-white.",
  },
  {
    id: "uk-passport",
    label: "UK Passport",
    region: "United Kingdom",
    widthMm: 35,
    heightMm: 45,
    headMinPct: 64,
    headMaxPct: 76,
    eyeMinPct: 60,
    eyeMaxPct: 72,
    background: "#f4f1ea",
    note: "35 × 45 mm. Plain cream or light grey background, head 29–34 mm.",
  },
  {
    id: "schengen",
    label: "Schengen / EU",
    region: "European Union",
    widthMm: 35,
    heightMm: 45,
    headMinPct: 70,
    headMaxPct: 80,
    eyeMinPct: 60,
    eyeMaxPct: 72,
    background: "#f2f2f2",
    note: "35 × 45 mm. ICAO-style head height 32–36 mm, light plain background.",
  },
  {
    id: "india-passport",
    label: "India Passport",
    region: "India",
    widthMm: 51,
    heightMm: 51,
    headMinPct: 50,
    headMaxPct: 69,
    eyeMinPct: 56,
    eyeMaxPct: 69,
    background: "#ffffff",
    note: "2 × 2 in. White background, both ears visible where possible.",
  },
  {
    id: "bangladesh-passport",
    label: "Bangladesh Passport",
    region: "Bangladesh",
    widthMm: 45,
    heightMm: 55,
    headMinPct: 60,
    headMaxPct: 72,
    eyeMinPct: 58,
    eyeMaxPct: 70,
    background: "#ffffff",
    note: "45 × 55 mm. Plain white background, matte finish recommended.",
  },
  {
    id: "canada-passport",
    label: "Canada Passport",
    region: "Canada",
    widthMm: 50,
    heightMm: 70,
    headMinPct: 44,
    headMaxPct: 52,
    eyeMinPct: 52,
    eyeMaxPct: 62,
    background: "#ffffff",
    note: "50 × 70 mm. Head 31–36 mm from chin to crown.",
  },
  {
    id: "australia-passport",
    label: "Australia Passport",
    region: "Australia",
    widthMm: 35,
    heightMm: 45,
    headMinPct: 71,
    headMaxPct: 80,
    eyeMinPct: 60,
    eyeMaxPct: 72,
    background: "#ffffff",
    note: "35 × 45 mm. Head 32–36 mm, plain white or light grey.",
  },
  {
    id: "china-visa",
    label: "China Visa",
    region: "China",
    widthMm: 33,
    heightMm: 48,
    headMinPct: 58,
    headMaxPct: 69,
    eyeMinPct: 56,
    eyeMaxPct: 68,
    background: "#ffffff",
    note: "33 × 48 mm. White background, head 28–33 mm.",
  },
  {
    id: "japan-passport",
    label: "Japan Passport",
    region: "Japan",
    widthMm: 35,
    heightMm: 45,
    headMinPct: 71,
    headMaxPct: 80,
    eyeMinPct: 60,
    eyeMaxPct: 72,
    background: "#ffffff",
    note: "35 × 45 mm. Head 32–36 mm, plain background.",
  },
  {
    id: "custom",
    label: "Custom size",
    region: "Any document",
    widthMm: 35,
    heightMm: 45,
    headMinPct: 60,
    headMaxPct: 75,
    eyeMinPct: 55,
    eyeMaxPct: 70,
    background: "#ffffff",
    note: "Set your own millimetre dimensions and head-height guidance.",
  },
];

export const PRINT_SHEETS = [
  { id: "4x6", label: "Photo 4 × 6 in", widthMm: 152.4, heightMm: 101.6 },
  { id: "a4", label: "A4 (210 × 297 mm)", widthMm: 210, heightMm: 297 },
  { id: "letter", label: "US Letter (8.5 × 11 in)", widthMm: 215.9, heightMm: 279.4 },
  { id: "5x7", label: "Photo 5 × 7 in", widthMm: 177.8, heightMm: 127 },
  { id: "custom-sheet", label: "Custom sheet", widthMm: 200, heightMm: 250 },
];

export const BACKGROUNDS = [
  { id: "white", label: "Studio white", color: "#ffffff" },
  { id: "off-white", label: "Off white", color: "#f6f3ec" },
  { id: "light-grey", label: "Light grey", color: "#eef0f2" },
  { id: "warm-grey", label: "Warm grey", color: "#e9e4dc" },
  { id: "blue", label: "Document blue", color: "#dbeafe" },
  { id: "transparent", label: "Transparent", color: "transparent" },
];

export const DEFAULT_SETTINGS = {
  dpi: 300,
  format: "jpeg",
  quality: 0.92,
  copies: 6,
  sheetId: "4x6",
  customSheetWidth: 200,
  customSheetHeight: 250,
  marginMm: 3,
  gapMm: 2,
  cutLines: true,
  showGuides: true,
  backgroundId: "white",
  brightness: 0,
  contrast: 0,
};

export const FIELD_BASE =
  "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-500/30 dark:bg-slate-800/80 dark:text-white [color-scheme:light] dark:[color-scheme:dark]";

export const STATUS_META = {
  pass: { label: "Looks good", tone: "text-emerald-700 dark:text-emerald-300" },
  warn: { label: "Check this", tone: "text-amber-700 dark:text-amber-300" },
  fail: { label: "Needs work", tone: "text-rose-700 dark:text-rose-300" },
};

export const PASSPORT_FAQS = [
  {
    question: "Is this passport photo maker safe for personal photos?",
    answer:
      "Yes. The photo is decoded, cropped, analysed and exported entirely in your browser using the Canvas API. No image, face data or measurement ever leaves your device, and nothing is stored after you close the page.",
  },
  {
    question: "Does the tool guarantee my photo will be accepted?",
    answer:
      "No tool can guarantee acceptance because the final decision belongs to the passport office or embassy. The readiness score checks what can be measured digitally — resolution, background uniformity, lighting, contrast and framing — and the presets follow published guidance. Always confirm the current rules with the issuing authority before printing.",
  },
  {
    question: "Which file format should I use for printing?",
    answer:
      "JPEG at 300 DPI is the safest choice for photo labs and home printers. PNG is useful when you need a transparent matte, but most passport authorities require a plain background, so a JPEG is usually better. PDF is ideal when you want a correctly sized print sheet with several copies.",
  },
  {
    question: "Why does my background check show a warning?",
    answer:
      "The checker samples the outer edge of your cropped photo. A wall with shadows, a door frame or hair touching the edge can lower the score. Move to even, soft lighting and leave space around your head. The check is a helpful signal, not a judgement by the passport office.",
  },
  {
    question: "Can I use a phone selfie?",
    answer:
      "Often yes, if the photo is sharp, taken from eye level at a neutral distance, and lit evenly from the front. Avoid wide-angle distortion, beauty filters, heavy HDR and flash shadows. A rear camera on a timer usually gives better resolution and less distortion than a front camera.",
  },
  {
    question: "How many copies fit on a print sheet?",
    answer:
      "The tool calculates this automatically from the photo size, paper size, margin and gap. A 4 × 6 inch sheet commonly fits six or more 35 × 45 mm photos, while A4 can fit many more. The maximum printed copies is shown before you download the PDF.",
  },
];

export const PASSPORT_FEATURES = [
  "10 international passport, visa and ID photo presets plus custom dimensions",
  "Live crop framing with head-height and eye-line guides",
  "Resolution, background, lighting, contrast and framing checks",
  "300 DPI print-ready JPEG, PNG and PDF export",
  "Multi-copy 4 × 6, A5, A4, Letter and custom print sheets",
  "Cut marks, margins, gutters and transparent matte options",
  "100% client-side processing with no uploads",
];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function toNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mmToPixels(mm, dpi = 300) {
  return Math.max(1, Math.round((Math.max(0, mm) / MM_PER_INCH) * dpi));
}

export function pixelsToMm(pixels, dpi = 300) {
  return (pixels / dpi) * MM_PER_INCH;
}

export function getPreset(presetId) {
  return PHOTO_PRESETS.find((preset) => preset.id === presetId) || PHOTO_PRESETS[0];
}

export function getSheet(sheetId) {
  return PRINT_SHEETS.find((sheet) => sheet.id === sheetId) || PRINT_SHEETS[0];
}

export function getBackground(backgroundId) {
  return BACKGROUNDS.find((item) => item.id === backgroundId) || BACKGROUNDS[0];
}

export function resolvePreset(presetId, custom = {}) {
  const preset = getPreset(presetId);
  if (preset.id !== "custom") return preset;
  return {
    ...preset,
    widthMm: clamp(toNumber(custom.widthMm, 35), 20, 100),
    heightMm: clamp(toNumber(custom.heightMm, 45), 20, 120),
    headMinPct: clamp(toNumber(custom.headMinPct, 60), 30, 90),
    headMaxPct: clamp(toNumber(custom.headMaxPct, 75), 35, 95),
  };
}

/**
 * Work out the source rectangle that fills a target photo aspect at a given
 * zoom and horizontal / vertical framing offset.
 */
export function computeCropRect({
  sourceWidth,
  sourceHeight,
  targetWidthMm,
  targetHeightMm,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
}) {
  if (!sourceWidth || !sourceHeight || !targetWidthMm || !targetHeightMm) {
    return null;
  }

  const targetAspect = targetWidthMm / targetHeightMm;
  const safeZoom = clamp(toNumber(zoom, 1), 1, 3);
  const coverScale = Math.max(sourceWidth / targetAspect, sourceHeight);

  // Crop height = sourceHeight / zoom at zoom 1; keep the target aspect exactly.
  let cropHeight = sourceHeight / safeZoom;
  let cropWidth = cropHeight * targetAspect;

  if (cropWidth > sourceWidth) {
    cropWidth = sourceWidth;
    cropHeight = cropWidth / targetAspect;
  }

  const maxX = Math.max(0, sourceWidth - cropWidth);
  const maxY = Math.max(0, sourceHeight - cropHeight);
  const baseX = maxX / 2;
  const baseY = maxY / 2;
  const x = clamp(baseX + (clamp(offsetX, -100, 100) / 100) * (maxX / 2), 0, maxX);
  const y = clamp(baseY + (clamp(offsetY, -100, 100) / 100) * (maxY / 2), 0, maxY);

  return {
    x,
    y,
    width: cropWidth,
    height: cropHeight,
    aspect: targetAspect,
    coverScale,
  };
}

export function getOutputPixels({ widthMm, heightMm, dpi }) {
  return {
    width: mmToPixels(widthMm, dpi),
    height: mmToPixels(heightMm, dpi),
  };
}

export function getEffectiveDpi({ sourceWidth, sourceHeight, widthMm, heightMm, zoom = 1 }) {
  const crop = computeCropRect({
    sourceWidth,
    sourceHeight,
    targetWidthMm: widthMm,
    targetHeightMm: heightMm,
    zoom,
  });
  if (!crop) return 0;
  return Math.round(crop.width / (widthMm / MM_PER_INCH));
}

export function analyzeRgba(data, width, height) {
  if (!data || !width || !height) {
    return { brightness: 0, contrast: 0, backgroundUniformity: 0, backgroundTint: 0 };
  }

  const pixelCount = width * height;
  let sum = 0;
  let sumSq = 0;
  let edgeSum = 0;
  let edgeSumSq = 0;
  let edgeCount = 0;
  const edgeBand = Math.max(2, Math.round(Math.min(width, height) * 0.09));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const luminance = 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
      sum += luminance;
      sumSq += luminance * luminance;

      const onEdge =
        x < edgeBand ||
        y < edgeBand ||
        x >= width - edgeBand ||
        y >= height - edgeBand;
      if (onEdge) {
        edgeSum += luminance;
        edgeSumSq += luminance * luminance;
        edgeCount += 1;
      }
    }
  }

  const mean = sum / pixelCount;
  const variance = Math.max(0, sumSq / pixelCount - mean * mean);
  const edgeMean = edgeCount ? edgeSum / edgeCount : mean;
  const edgeVariance = edgeCount ? Math.max(0, edgeSumSq / edgeCount - edgeMean * edgeMean) : 0;

  return {
    brightness: Math.round(mean),
    contrast: Math.round(Math.sqrt(variance)),
    backgroundUniformity: Math.round(clamp(100 - Math.sqrt(edgeVariance) * 5, 0, 100)),
    backgroundTint: Math.round(edgeMean),
  };
}

export function evaluateReadiness({
  image,
  preset,
  zoom,
  offsetX,
  offsetY,
  analysis,
  dpi,
}) {
  if (!image?.width || !image?.height) {
    return { score: 0, checks: [], label: "Waiting for a photo", tone: "slate" };
  }

  const effectiveDpi = getEffectiveDpi({
    sourceWidth: image.width,
    sourceHeight: image.height,
    widthMm: preset.widthMm,
    heightMm: preset.heightMm,
    zoom,
  });

  const output = getOutputPixels({ widthMm: preset.widthMm, heightMm: preset.heightMm, dpi });
  const resolutionStatus =
    effectiveDpi >= dpi * 0.95 ? "pass" : effectiveDpi >= dpi * 0.72 ? "warn" : "fail";
  const backgroundStatus =
    analysis.backgroundUniformity >= 70
      ? "pass"
      : analysis.backgroundUniformity >= 45
        ? "warn"
        : "fail";
  const lightingStatus =
    analysis.brightness >= 45 && analysis.brightness <= 215
      ? "pass"
      : analysis.brightness >= 30 && analysis.brightness <= 235
        ? "warn"
        : "fail";
  const contrastStatus =
    analysis.contrast >= 22 ? "pass" : analysis.contrast >= 13 ? "warn" : "fail";
  const framingStatus =
    Math.abs(offsetX) <= 45 && Math.abs(offsetY) <= 45
      ? "pass"
      : Math.abs(offsetX) <= 78 && Math.abs(offsetY) <= 78
        ? "warn"
        : "fail";
  const fileSizeStatus = output.width <= 6000 && output.height <= 6000 ? "pass" : "warn";

  const checks = [
    {
      id: "resolution",
      label: "Print resolution",
      status: resolutionStatus,
      detail:
        resolutionStatus === "pass"
          ? `${effectiveDpi} DPI — enough for a sharp ${dpi} DPI print.`
          : `This crop provides about ${effectiveDpi} DPI. Use a larger photo or zoom out for ${dpi} DPI.`,
    },
    {
      id: "background",
      label: "Background evenness",
      status: backgroundStatus,
      detail:
        backgroundStatus === "pass"
          ? "Edge areas are clean and uniform."
          : "The outer edges vary. Use a plain wall with soft, even lighting and space around the head.",
    },
    {
      id: "lighting",
      label: "Lighting",
      status: lightingStatus,
      detail:
        lightingStatus === "pass"
          ? `Balanced exposure (${analysis.brightness}/255).`
          : "Exposure looks uneven or too dark/bright. Face a soft light source and avoid flash shadows.",
    },
    {
      id: "contrast",
      label: "Subject contrast",
      status: contrastStatus,
      detail:
        contrastStatus === "pass"
          ? "The face separates clearly from the background."
          : "The photo looks flat or hazy. Clean the lens and use soft directional light.",
    },
    {
      id: "framing",
      label: "Centring",
      status: framingStatus,
      detail:
        framingStatus === "pass"
          ? "Framing is balanced inside the crop."
          : "Use the head and eye guides to centre the face and leave even space around it.",
    },
    {
      id: "size",
      label: "Output size",
      status: fileSizeStatus,
      detail:
        fileSizeStatus === "pass"
          ? `${output.width} × ${output.height} px — ready to export.`
          : "This output is very large. Lower the DPI or choose a smaller document size.",
    },
  ];

  const weights = { pass: 100, warn: 55, fail: 0 };
  const score = Math.round(
    checks.reduce((total, check) => total + weights[check.status], 0) / checks.length,
  );

  return {
    score,
    checks,
    label: score >= 85 ? "Print-ready" : score >= 60 ? "Almost there" : "Needs attention",
    tone: score >= 85 ? "emerald" : score >= 60 ? "amber" : "rose",
  };
}

export function getSheetLayout({
  sheetWidthMm,
  sheetHeightMm,
  photoWidthMm,
  photoHeightMm,
  marginMm,
  gapMm,
  requestedCopies,
}) {
  const safeMargin = clamp(toNumber(marginMm, 3), 0, 30);
  const safeGap = clamp(toNumber(gapMm, 2), 0, 20);
  const availableWidth = Math.max(0, sheetWidthMm - safeMargin * 2);
  const availableHeight = Math.max(0, sheetHeightMm - safeMargin * 2);
  const columns = Math.max(
    0,
    Math.floor((availableWidth + safeGap) / (photoWidthMm + safeGap)),
  );
  const rows = Math.max(
    0,
    Math.floor((availableHeight + safeGap) / (photoHeightMm + safeGap)),
  );
  const capacity = columns * rows;
  const copies = Math.min(Math.max(1, Math.round(toNumber(requestedCopies, 1))), capacity || 0);

  const gridWidth = columns * photoWidthMm + Math.max(0, columns - 1) * safeGap;
  const gridHeight = rows * photoHeightMm + Math.max(0, rows - 1) * safeGap;
  const startX = (sheetWidthMm - gridWidth) / 2;
  const startY = (sheetHeightMm - gridHeight) / 2;

  const slots = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      if (slots.length >= copies) break;
      slots.push({
        x: startX + col * (photoWidthMm + safeGap),
        y: startY + row * (photoHeightMm + safeGap),
        width: photoWidthMm,
        height: photoHeightMm,
      });
    }
  }

  return {
    columns,
    rows,
    capacity,
    copies,
    slots,
    marginMm: safeMargin,
    gapMm: safeGap,
    fits: capacity > 0,
  };
}

export function getFileError(file) {
  if (!file) return "Choose a photo to continue.";
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return "Please choose a JPEG, PNG or WebP image. HEIC files should be converted first.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "That photo is larger than 25 MB. Please choose a smaller file.";
  }
  if (file.size === 0) return "That file is empty. Please choose another photo.";
  return "";
}
