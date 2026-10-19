// Shared visual helpers for the Recharts-powered chart previews.
// Keeping these pure (no DOM access) makes them safe to import from any
// client component and easy to reuse by all six chart generators.

export const CHART_FONT =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const DASH_PATTERNS = {
  solid: undefined,
  dashed: "8 5",
  dotted: "1.5 4",
  dashdot: "10 4 2 4",
  longdash: "16 7",
};

export const GRID_DASH_PATTERNS = {
  solid: undefined,
  dashed: "6 6",
  dotted: "1 5",
};

export function dashArray(style = "solid") {
  return DASH_PATTERNS[style] ?? DASH_PATTERNS.solid;
}

export function gridDashArray(style = "dashed") {
  return GRID_DASH_PATTERNS[style] ?? GRID_DASH_PATTERNS.dashed;
}

export function mutedFromText(textColor) {
  return textColor === "#f8fafc" || textColor === "#ffffff"
    ? "#94a3b8"
    : "#64748b";
}

export function hexToRgb(hex) {
  let value = String(hex || "").replace("#", "").trim();
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (value.length !== 6) return { r: 15, g: 23, b: 42 };
  return {
    r: parseInt(value.substring(0, 2), 16),
    g: parseInt(value.substring(2, 4), 16),
    b: parseInt(value.substring(4, 6), 16),
  };
}

export function lighten(hex, amount = 0.32) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const transform = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

export function contrastColor(hex) {
  return relativeLuminance(hex) > 0.55 ? "#0f172a" : "#ffffff";
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Human friendly outward-rounded maximum used by the polar + radar charts.
export function niceMax(value, steps = 5) {
  const max = Math.max(0, toNumber(value, 0));
  if (max <= 0) return 1;
  const rough = max / steps;
  const magnitude = 10 ** Math.floor(Math.log10(rough || 1));
  const normalised = rough / magnitude;
  const niceStep =
    normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
  return niceStep * magnitude * steps;
}

export function truncateLabel(value, maxChars = 18) {
  const text = String(value ?? "");
  return text.length > maxChars
    ? `${text.slice(0, Math.max(1, maxChars - 1))}…`
    : text;
}

// Builds Recharts-friendly rows. Every series gets a stable string dataKey so
// tooltips, labels and gradients can refer to it safely.
export function buildSeriesRows(categories, series) {
  return categories.map((category, index) => {
    const label =
      typeof category === "string" ? category : category?.label ?? category?.name ?? "";
    const row = { category: label, __index: index };
    series.forEach((s) => {
      row[s.key] = s.values?.[index] ?? null;
    });
    return row;
  });
}

export function seriesConfig(series) {
  return series.reduce((config, s) => {
    config[s.key] = { label: s.name, color: s.color };
    return config;
  }, {});
}

// Same approximation the legacy renderers used, kept for the custom labels.
export function estimateTextWidth(text, fontSize = 12) {
  return String(text ?? "").length * fontSize * 0.56;
}

// ─── Geometry helpers ────────────────────────────────────────────────────────
// Polar helper where 0° points straight up and angles increase clockwise —
// the convention every chart engine in this folder follows.
export function polarPoint(cx, cy, radius, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.sin(rad), y: cy - radius * Math.cos(rad) };
}

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export function polygonPath(points = []) {
  if (!points.length) return "";
  return `${points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${round2(p.x)} ${round2(p.y)}`)
    .join(" ")} Z`;
}

// Rounds every vertex of a polygon with a quadratic curve. Works for both
// trapezoids and rectangles, producing clean, consistent corners.
export function roundedPolygonPath(points = [], radius = 0) {
  const n = points.length;
  if (!n) return "";
  if (!(radius > 0) || n < 3) return polygonPath(points);

  const unit = (from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  };

  let d = "";
  for (let i = 0; i < n; i += 1) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const dirPrev = unit(curr, prev);
    const dirNext = unit(curr, next);
    const lenPrev = Math.hypot(prev.x - curr.x, prev.y - curr.y);
    const lenNext = Math.hypot(next.x - curr.x, next.y - curr.y);
    const r = Math.max(0, Math.min(radius, lenPrev / 2, lenNext / 2));

    const a = { x: curr.x + dirPrev.x * r, y: curr.y + dirPrev.y * r };
    const b = { x: curr.x + dirNext.x * r, y: curr.y + dirNext.y * r };

    d += `${i === 0 ? "M" : "L"} ${round2(a.x)} ${round2(a.y)} `;
    d += `Q ${round2(curr.x)} ${round2(curr.y)} ${round2(b.x)} ${round2(b.y)} `;
  }
  return `${d}Z`;
}

// ─── Radial scales ───────────────────────────────────────────────────────────
// Shared by the polar + radar generators so the rendered rings and the JSON
// metadata always describe the same domain.
export function resolveScale({
  mode = "auto",
  levels = 5,
  customMin = 0,
  customMax = 100,
  maxValue = 0,
} = {}) {
  const count = clamp(Math.round(toNumber(levels, 5)) || 5, 2, 10);
  const makeTicks = (min, max) =>
    Array.from({ length: count + 1 }, (_, i) => min + ((max - min) / count) * i);

  if (mode === "percent") {
    return { min: 0, max: 100, count, ticks: makeTicks(0, 100) };
  }
  if (mode === "custom") {
    const lo = toNumber(customMin, 0);
    let hi = toNumber(customMax, 100);
    if (!(hi > lo)) hi = lo + 1;
    return { min: lo, max: hi, count, ticks: makeTicks(lo, hi) };
  }
  const max = niceMax(toNumber(maxValue, 0), count);
  return { min: 0, max, count, ticks: makeTicks(0, max) };
}

export function ratioForValue(value, scale, useArea = false) {
  const span = scale.max - scale.min || 1;
  const t = clamp((toNumber(value, 0) - scale.min) / span, 0, 1);
  return useArea ? Math.sqrt(t) : t;
}

// ─── Label contrast (used by the funnel band labels) ─────────────────────────
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// Picks the readable ink for text drawn on top of one or more fills. Because
// funnel bands are gradients, the *worst-case* contrast across every supplied
// shade decides the winner.
export function bestTextColor(backgrounds) {
  const list = (Array.isArray(backgrounds) ? backgrounds : [backgrounds]).filter(
    Boolean
  );
  if (!list.length) return "#0f172a";
  const worstContrast = (ink) => Math.min(...list.map((bg) => contrastRatio(ink, bg)));
  return worstContrast("#ffffff") > worstContrast("#0f172a") ? "#ffffff" : "#0f172a";
}

// Resolve the fill and (optional) hairline halo for a label sitting on the
// given band colours. A halo is only added when even the best ink cannot clear
// the WCAG AA threshold on every shade, and it is always the *opposite* ink.
export function labelInkFor(backgrounds, minContrast = 4.5) {
  const list = (Array.isArray(backgrounds) ? backgrounds : [backgrounds]).filter(
    Boolean
  );
  const fill = bestTextColor(list);
  const worst = list.length
    ? Math.min(...list.map((bg) => contrastRatio(fill, bg)))
    : Infinity;
  return {
    fill,
    halo: worst >= minContrast ? null : fill === "#0f172a" ? "#ffffff" : "#0f172a",
  };
}
