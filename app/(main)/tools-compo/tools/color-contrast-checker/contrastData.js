/* -------------------------------------------------------------------------- */
/*  Color Contrast Checker — WCAG 2.2, APCA, suggestions and color vision.    */
/*  All conversions and scoring are implemented from the published formulas.   */
/* -------------------------------------------------------------------------- */

export const NAMED_COLORS = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  gray: "#808080",
  grey: "#808080",
  transparent: "#ffffff",
};

export const COLOR_VISION_TYPES = [
  { value: "protanopia", label: "Protanopia", detail: "Red-blind · about 1% of men" },
  { value: "deuteranopia", label: "Deuteranopia", detail: "Green-blind · about 1% of men" },
  { value: "tritanopia", label: "Tritanopia", detail: "Blue-blind · rare" },
];

export const PRESET_PAIRS = [
  { label: "Body text", fg: "#334155", bg: "#f8fafc" },
  { label: "Muted text", fg: "#94a3b8", bg: "#ffffff" },
  { label: "Primary button", fg: "#ffffff", bg: "#4f46e5" },
  { label: "Success alert", fg: "#065f46", bg: "#ecfdf5" },
  { label: "Warning alert", fg: "#92400e", bg: "#fffbeb" },
  { label: "Low contrast", fg: "#cbd5e1", bg: "#f1f5f9" },
];

/* -------------------------------------------------------------------------- */
/*  Parsing and conversion                                                    */
/* -------------------------------------------------------------------------- */

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function parseColor(input) {
  if (!input) return null;
  let value = String(input).trim().toLowerCase();
  if (!value) return null;

  if (NAMED_COLORS[value]) value = NAMED_COLORS[value];

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (!/^[0-9a-f]+$/.test(hex)) return null;
    if (hex.length === 3 || hex.length === 4) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1,
      };
    }
    if (hex.length === 6 || hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
      };
    }
    return null;
  }

  const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(/[,/\s]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const channel = (part) => (part.endsWith("%") ? (parseFloat(part) / 100) * 255 : parseFloat(part));
    const [r, g, b, a] = parts;
    if ([r, g, b].some((part) => !Number.isFinite(channel(part)))) return null;
    return {
      r: clampByte(channel(r)),
      g: clampByte(channel(g)),
      b: clampByte(channel(b)),
      a: a === undefined ? 1 : Math.max(0, Math.min(1, parseFloat(a))),
    };
  }

  const hslMatch = value.match(/^hsla?\(([^)]+)\)$/);
  if (hslMatch) {
    const parts = hslMatch[1].split(/[,/\s]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    const l = parseFloat(parts[2]);
    if (![h, s, l].every(Number.isFinite)) return null;
    const rgb = hslToRgb(h, s / 100, l / 100);
    return { ...rgb, a: parts[3] === undefined ? 1 : Math.max(0, Math.min(1, parseFloat(parts[3]))) };
  }

  return null;
}

export function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - chroma / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [chroma, x, 0];
  else if (hue < 120) [r, g, b] = [x, chroma, 0];
  else if (hue < 180) [r, g, b] = [0, chroma, x];
  else if (hue < 240) [r, g, b] = [0, x, chroma];
  else if (hue < 300) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];
  return {
    r: clampByte((r + m) * 255),
    g: clampByte((g + m) * 255),
    b: clampByte((b + m) * 255),
  };
}

export function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }
  if (hue < 0) hue += 360;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return { h: hue, s: saturation * 100, l: lightness * 100 };
}

export function toHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => clampByte(value).toString(16).padStart(2, "0")).join("")}`;
}

export function toRgbString(color) {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function toHslString(color) {
  const hsl = rgbToHsl(color);
  return `hsl(${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}%)`;
}

/* -------------------------------------------------------------------------- */
/*  WCAG 2.2 contrast                                                         */
/* -------------------------------------------------------------------------- */

export function channelLuminance(value) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance({ r, g, b }) {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(foreground, background) {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function formatRatio(ratio) {
  return `${ratio.toFixed(2)}:1`;
}

export function isLargeText(fontSizePx, fontWeight) {
  const size = Number(fontSizePx) || 16;
  const weight = Number(fontWeight) || 400;
  return size >= 24 || (size >= 18.66 && weight >= 700);
}

export function wcagChecklist(ratio, largeText) {
  const normalAA = 4.5;
  const largeAA = 3;
  const normalAAA = 7;
  const largeAAA = 4.5;
  return [
    {
      key: "aa-normal",
      label: "WCAG AA · normal text",
      threshold: normalAA,
      pass: ratio >= normalAA,
      hint: "Body copy, labels and form text",
    },
    {
      key: "aa-large",
      label: "WCAG AA · large text",
      threshold: largeAA,
      pass: ratio >= largeAA,
      hint: "18.66px bold or 24px regular and above",
    },
    {
      key: "aaa-normal",
      label: "WCAG AAA · normal text",
      threshold: normalAAA,
      pass: ratio >= normalAAA,
      hint: "Highest level for body copy",
    },
    {
      key: "aaa-large",
      label: "WCAG AAA · large text",
      threshold: largeAAA,
      pass: ratio >= largeAAA,
      hint: "Highest level for large headings",
    },
    {
      key: "ui",
      label: "WCAG AA · UI components",
      threshold: largeAA,
      pass: ratio >= largeAA,
      hint: "Borders, icons, focus rings and controls",
    },
    {
      key: "selected",
      label: largeText ? "Your text (large)" : "Your text (normal)",
      threshold: largeText ? largeAA : normalAA,
      pass: ratio >= (largeText ? largeAA : normalAA),
      hint: `${largeText ? "Large" : "Normal"} text at the current size and weight`,
    },
  ];
}

export function gradeFor(ratio, largeText = false) {
  const aa = largeText ? 3 : 4.5;
  const aaa = largeText ? 4.5 : 7;
  if (ratio >= aaa) return { label: "AAA", tone: "emerald", detail: "Exceeds the highest WCAG level" };
  if (ratio >= aa) return { label: "AA", tone: "sky", detail: "Meets the standard WCAG level" };
  if (ratio >= 3) return { label: "AA Large", tone: "amber", detail: "Only suitable for large text or UI" };
  return { label: "Fail", tone: "rose", detail: "Below the minimum contrast requirement" };
}

export function readableTextOn(background) {
  const black = contrastRatio({ r: 0, g: 0, b: 0 }, background);
  const white = contrastRatio({ r: 255, g: 255, b: 255 }, background);
  return black >= white ? { hex: "#000000", ratio: black } : { hex: "#ffffff", ratio: white };
}

/* -------------------------------------------------------------------------- */
/*  APCA (WCAG 3 draft)                                                       */
/* -------------------------------------------------------------------------- */

const APCA = {
  mainTRC: 2.4,
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.072175,
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,
  blkThrs: 0.022,
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  deltaYmin: 0.0005,
};

function apcaY({ r, g, b }) {
  const red = (r / 255) ** APCA.mainTRC;
  const green = (g / 255) ** APCA.mainTRC;
  const blue = (b / 255) ** APCA.mainTRC;
  return 0.2126729 * red + 0.7151522 * green + 0.072175 * blue;
}

export function apcaContrast(text, background) {
  let txtY = apcaY(text);
  let bgY = apcaY(background);
  if (Math.min(txtY, bgY) < APCA.blkThrs) {
    txtY += (APCA.blkThrs - txtY) ** APCA.blkClmp;
    bgY += (APCA.blkThrs - bgY) ** APCA.blkClmp;
  }
  if (Math.abs(bgY - txtY) < APCA.deltaYmin) return 0;
  let output;
  if (bgY > txtY) {
    const sapc = (bgY ** APCA.normBG - txtY ** APCA.normTXT) * APCA.scaleBoW;
    output = sapc < APCA.loBoWoffset ? 0 : sapc - APCA.loBoWoffset;
  } else {
    const sapc = (bgY ** APCA.revBG - txtY ** APCA.revTXT) * APCA.scaleWoB;
    output = sapc > -APCA.loWoBoffset ? 0 : sapc + APCA.loWoBoffset;
  }
  return output * 100;
}

export function apcaUsage(lc) {
  const value = Math.abs(lc);
  if (value >= 90) return { label: "Preferred", detail: "Any size, including body text in ideal conditions", tone: "emerald" };
  if (value >= 75) return { label: "Minimum body", detail: "Body text at 16px or larger", tone: "emerald" };
  if (value >= 60) return { label: "Large / bold", detail: "Large or bold text, headlines and labels", tone: "sky" };
  if (value >= 45) return { label: "Headline only", detail: "Large headlines and non-essential display text", tone: "amber" };
  if (value >= 30) return { label: "Spot text", detail: "Logo or decorative text only — not for reading", tone: "amber" };
  return { label: "Insufficient", detail: "Not readable for normal content", tone: "rose" };
}

/* -------------------------------------------------------------------------- */
/*  Accessibility suggestions                                                 */
/* -------------------------------------------------------------------------- */

function withLightness(color, lightness) {
  const hsl = rgbToHsl(color);
  return { ...hslToRgb(hsl.h, hsl.s / 100, lightness / 100), a: 1 };
}

export function suggestForeground(foreground, background, target = 4.5) {
  if (!foreground || !background) return null;
  const base = rgbToHsl(foreground);
  const candidates = [];
  for (let step = 0; step <= 200; step += 1) {
    const lightness = step / 2;
    const candidate = withLightness(foreground, lightness);
    const ratio = contrastRatio(candidate, background);
    if (ratio >= target - 1e-9) {
      candidates.push({
        hex: toHex(candidate),
        ratio,
        lightness,
        distance: Math.abs(lightness - base.l),
      });
    }
  }
  if (!candidates.length) return null;
  const nearest = candidates.reduce((best, item) => (item.distance < best.distance ? item : best), candidates[0]);
  const darker = candidates
    .filter((item) => item.lightness < base.l)
    .sort((a, b) => b.lightness - a.lightness)[0] || null;
  const lighter = candidates
    .filter((item) => item.lightness > base.l)
    .sort((a, b) => a.lightness - b.lightness)[0] || null;
  return { nearest, darker, lighter };
}

export function suggestBackground(foreground, background, target = 4.5) {
  if (!foreground || !background) return null;
  const base = rgbToHsl(background);
  const candidates = [];
  for (let step = 0; step <= 200; step += 1) {
    const lightness = step / 2;
    const candidate = withLightness(background, lightness);
    const ratio = contrastRatio(foreground, candidate);
    if (ratio >= target - 1e-9) {
      candidates.push({
        hex: toHex(candidate),
        ratio,
        lightness,
        distance: Math.abs(lightness - base.l),
      });
    }
  }
  if (!candidates.length) return null;
  return candidates.reduce((best, item) => (item.distance < best.distance ? item : best), candidates[0]);
}

export function fixDirection(foreground, background, target = 4.5) {
  const hsl = rgbToHsl(foreground);
  return hsl.l > 50 ? "darken" : "lighten";
}

/* -------------------------------------------------------------------------- */
/*  Color-vision simulation (Machado 2009, severity 1.0)                      */
/* -------------------------------------------------------------------------- */

const VISION_MATRICES = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

function srgbToLinear(value) {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value) {
  const channel = value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return clampByte(channel * 255);
}

export function simulateColorVision(color, type) {
  const matrix = VISION_MATRICES[type];
  if (!matrix) return color;
  const [r, g, b] = [srgbToLinear(color.r), srgbToLinear(color.g), srgbToLinear(color.b)];
  return {
    r: linearToSrgb(matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b),
    g: linearToSrgb(matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b),
    b: linearToSrgb(matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b),
    a: 1,
  };
}

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

export function copyValuePair(fg, bg) {
  return `--color-text: ${toHex(fg)};\n--color-background: ${toHex(bg)};`;
}

export function luminanceLadder(background) {
  return Array.from({ length: 11 }, (_, index) => {
    const lightness = index * 10;
    return toHex(withLightness(background, lightness));
  });
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export const COLOR_CONTRAST_FAQS = [
  {
    question: "What is color contrast ratio?",
    answer:
      "Contrast ratio compares the relative luminance of two colors on a scale from 1:1 to 21:1. Higher numbers are easier to read. White on black is 21:1, while two identical colors are 1:1. WCAG uses this ratio to define accessibility levels for text and interface components.",
  },
  {
    question: "What is the difference between AA and AAA?",
    answer:
      "WCAG AA requires 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 for normal text and 4.5:1 for large text. AAA is the highest level and is recommended wherever readability is critical, but AA is the common legal and practical baseline.",
  },
  {
    question: "What counts as large text?",
    answer:
      "WCAG treats text as large when it is at least 24px (18pt) regular or at least 18.66px (14pt) bold. Large text has a lower contrast requirement because its size and weight make it easier to read at a distance.",
  },
  {
    question: "What is APCA and why is it different?",
    answer:
      "APCA (Accessible Perceptual Contrast Algorithm) is a draft algorithm for WCAG 3. Instead of a simple ratio, it models perceived lightness contrast with polarity, so dark text on a light background and light text on a dark background are scored differently. Negative Lc values mean light text on a dark background. APCA is informative, not yet a final standard.",
  },
  {
    question: "How do the automatic color suggestions work?",
    answer:
      "The tool scans lightness values while keeping the original hue and saturation, then returns the smallest visual change that reaches your target contrast ratio. It offers a darker and a lighter option so you can preserve your design direction.",
  },
  {
    question: "Why does color-blindness simulation matter?",
    answer:
      "Roughly 1 in 12 men and 1 in 200 women experience some form of color-vision deficiency. Two colors can pass a contrast check and still become indistinguishable under protanopia or deuteranopia. The simulation previews those approximations, though it cannot replace testing with real users.",
  },
];
