// app/(main)/tools-compo/tools/polar-chart-generator/polarChartEngine.js
// Pure geometry, scale, layout and export helpers for the Polar Chart
// Generator & Rose Chart Studio. Everything here is deterministic and
// side-effect free (except the browser download utilities at the bottom,
// which are guarded for client usage).

// ─── Formatting ──────────────────────────────────────────────────────────────
export function formatNumber(value, decimals = 0) {
  const num = Number(value) || 0;
  const fixed = Number.isFinite(decimals) ? decimals : 0;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: fixed,
    maximumFractionDigits: fixed,
  });
}

export function formatPlain(value, decimals = 0) {
  const num = Number(value) || 0;
  const fixed = Number.isFinite(decimals) ? decimals : 0;
  return num.toFixed(fixed);
}

export function formatCompact(value, decimals = 1) {
  const num = Number(value) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(decimals)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(decimals)}M`;
  if (abs >= 10_000) return `${sign}${(abs / 1000).toFixed(decimals)}K`;
  return formatNumber(num, decimals);
}

// Full value formatter honouring decimals, separators, compact and units.
export function formatValue(value, options = {}) {
  const {
    decimals = 0,
    thousands = true,
    compact = false,
    prefix = "",
    suffix = "",
  } = options;
  const core = compact
    ? formatCompact(value, decimals)
    : thousands
      ? formatNumber(value, decimals)
      : formatPlain(value, decimals);
  return `${prefix}${core}${suffix}`;
}

export function getSliceLabelText(value, format, decimals, total, fmtOptions) {
  const formatted = formatValue(value, { ...fmtOptions, decimals });
  const percent =
    total > 0
      ? `${formatNumber((Math.abs(value) / total) * 100, decimals)}%`
      : "0%";
  switch (format) {
    case "percent":
      return percent;
    case "both":
      return `${formatted} · ${percent}`;
    case "value":
    default:
      return formatted;
  }
}

// ─── Scales ──────────────────────────────────────────────────────────────────
export function niceScale(min, max, tickCount = 5) {
  let lo = Number(min);
  let hi = Number(max);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    lo = 0;
    hi = 1;
  }
  if (lo === hi) {
    if (lo === 0) {
      hi = 1;
    } else {
      const pad = Math.abs(lo) * 0.5 || 1;
      lo -= pad;
      hi += pad;
    }
  }
  const range = hi - lo;
  const rawStep = range / Math.max(1, tickCount);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const norm = rawStep / mag;
  let step;
  if (norm <= 1) step = 1;
  else if (norm <= 2) step = 2;
  else if (norm <= 2.5) step = 2.5;
  else if (norm <= 5) step = 5;
  else step = 10;
  step *= mag;

  const niceMin = Math.floor(lo / step) * step;
  const niceMax = Math.ceil(hi / step) * step;

  const ticks = [];
  const maxTicks = 40;
  let guard = 0;
  for (let v = niceMin; v <= niceMax + step * 1e-6 && guard < maxTicks; v += step) {
    ticks.push(Number(v.toFixed(10)));
    guard += 1;
  }
  return { min: niceMin, max: niceMax, step, ticks };
}

// Builds the value scale based on the chosen mode. Always returns an ordered
// list of ring values (used both for the grid rings and the radial tick labels).
export function computePolarScale({
  slices = [],
  mode = "auto",
  levels = 5,
  customMin = 0,
  customMax = 100,
} = {}) {
  const safeLevels = Math.max(2, Math.min(10, Math.round(levels) || 5));

  if (mode === "percent") {
    const ticks = [];
    for (let i = 0; i <= safeLevels; i++) ticks.push((100 / safeLevels) * i);
    return { min: 0, max: 100, step: 100 / safeLevels, ticks };
  }

  if (mode === "custom") {
    let lo = Number(customMin);
    let hi = Number(customMax);
    if (!Number.isFinite(lo)) lo = 0;
    if (!Number.isFinite(hi)) hi = 100;
    if (hi <= lo) hi = lo + 1;
    const ticks = [];
    for (let i = 0; i <= safeLevels; i++) ticks.push(lo + ((hi - lo) / safeLevels) * i);
    return { min: lo, max: hi, step: (hi - lo) / safeLevels, ticks };
  }

  // Auto fit — always anchor at zero so the rose stays honest.
  const values = slices
    .map((s) => Number(s.value))
    .filter((v) => Number.isFinite(v));
  const maxValue = values.length ? Math.max(...values) : 0;
  const hi = maxValue > 0 ? maxValue : 1;
  return niceScale(0, hi, safeLevels);
}

export function computePolarMetrics(slices = []) {
  const values = slices.map((s) => Math.max(0, Number(s.value) || 0));
  const total = values.reduce((a, v) => a + v, 0);
  const count = values.filter((v) => v > 0).length;
  const max = values.length ? Math.max(...values) : 0;
  const min = values.length ? Math.min(...values) : 0;
  const average = values.length ? total / values.length : 0;
  return { total, count, max, min, average };
}

// ─── Text measurement (approximate, render-independent) ──────────────────────
export function estimateTextWidth(text, fontSize = 12) {
  return String(text ?? "").length * fontSize * 0.56;
}

export function truncateText(text, maxChars) {
  const value = String(text ?? "");
  return value.length > maxChars
    ? `${value.slice(0, Math.max(1, maxChars - 1))}…`
    : value;
}

// ─── Colour helpers ──────────────────────────────────────────────────────────
export function hexToRgb(hex) {
  let value = String(hex || "").replace("#", "").trim();
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (value.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(value.substring(0, 2), 16),
    g: parseInt(value.substring(2, 4), 16),
    b: parseInt(value.substring(4, 6), 16),
  };
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const transform = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

export function contrastColor(hex) {
  return relativeLuminance(hex) > 0.55 ? "#0f172a" : "#ffffff";
}

export function lighten(hex, amount = 0.34) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

// ─── Geometry ────────────────────────────────────────────────────────────────
// Angles are measured in degrees where 0 = 12 o'clock and increase clockwise.
export function polarToCartesian(cx, cy, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

// Annular sector (ring wedge) path with optional rounded outer corners.
// `a0` must be smaller than `a1`; the sweep is clockwise on screen.
export function sectorPath(cx, cy, r0, r1, a0, a1, corner = 0) {
  const span = a1 - a0;
  if (!(span > 0) || !(r1 > 0)) return "";

  const P = (r, a) => polarToCartesian(cx, cy, r, a);
  const large = span > 180 ? 1 : 0;
  const fmt = (p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;

  const ringGap = r1 - r0;
  const rc = Math.max(
    0,
    Math.min(corner, ringGap * 0.5, ((span * Math.PI) / 180) * r1 * 0.5)
  );
  const dAng = r1 > 0 ? (rc / r1) * (180 / Math.PI) : 0;
  const canRound = rc >= 0.5 && dAng * 2 < span;

  if (r0 <= 0.5) {
    // Wedge growing out of the centre point.
    if (!canRound) {
      const o0 = P(r1, a0);
      const o1 = P(r1, a1);
      return `M ${fmt({ x: cx, y: cy })} L ${fmt(o0)} A ${r1} ${r1} 0 ${large} 1 ${fmt(o1)} Z`;
    }
    const i0 = P(r1 - rc, a0);
    const o0 = P(r1, a0);
    const oStart = P(r1, a0 + dAng);
    const oEnd = P(r1, a1 - dAng);
    const o1 = P(r1, a1);
    const i1 = P(r1 - rc, a1);
    return (
      `M ${fmt(i0)} Q ${fmt(o0)} ${fmt(oStart)} ` +
      `A ${r1} ${r1} 0 ${large} 1 ${fmt(oEnd)} ` +
      `Q ${fmt(o1)} ${fmt(i1)} L ${fmt({ x: cx, y: cy })} Z`
    );
  }

  // Annular sector with a centre hole.
  const i0 = P(r0, a0);
  const o0 = P(r1, a0);
  const o1 = P(r1, a1);
  const i1 = P(r0, a1);

  if (!canRound) {
    return (
      `M ${fmt(i0)} L ${fmt(o0)} ` +
      `A ${r1} ${r1} 0 ${large} 1 ${fmt(o1)} ` +
      `L ${fmt(i1)} ` +
      `A ${r0} ${r0} 0 ${large} 0 ${fmt(i0)} Z`
    );
  }

  const radial0 = P(r1 - rc, a0);
  const oStart = P(r1, a0 + dAng);
  const oEnd = P(r1, a1 - dAng);
  const radial1 = P(r1 - rc, a1);
  return (
    `M ${fmt(i0)} L ${fmt(radial0)} Q ${fmt(o0)} ${fmt(oStart)} ` +
    `A ${r1} ${r1} 0 ${large} 1 ${fmt(oEnd)} ` +
    `Q ${fmt(o1)} ${fmt(radial1)} L ${fmt(i1)} ` +
    `A ${r0} ${r0} 0 ${large} 0 ${fmt(i0)} Z`
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────
export const DEFAULT_CHART_WIDTH = 640;
export const DEFAULT_CHART_HEIGHT = 640;

const PAD = 24;
const TITLE_FS = 20;
const LEGEND_ROW = 22;
const LEGEND_MARKER = 13;
const LEGEND_ITEM_GAP = 20;
const CATEGORY_LABEL_GAP = 16;
const VALUE_LABEL_GAP = 14;

export function computePolarLayout(config) {
  const {
    width = DEFAULT_CHART_WIDTH,
    height = DEFAULT_CHART_HEIGHT,
    title,
    subtitle,
    slices = [],
    startAngle = 0,
    direction = "cw",
    levels = 5,
    innerRatio = 0,
    cornerRadius = 0,
    gap = 2,
    showGrid = true,
    showSpokes = true,
    showCategoryLabels = true,
    showTickLabels = true,
    showValueLabels = true,
    labelFormat = "value",
    labelPosition = "outside",
    legendPosition = "right",
    showLegend = true,
    legendValues = [],
    decimals = 0,
    compact = false,
    thousands = true,
    prefix = "",
    suffix = "",
  } = config;

  const n = slices.length;
  const dir = direction === "cw" ? 1 : -1;

  const metrics = computePolarMetrics(slices);
  const scale = computePolarScale({
    slices,
    mode: config.scaleMode,
    levels,
    customMin: config.customMin,
    customMax: config.customMax,
  });
  const span = scale.max - scale.min || 1;
  const fmtOptions = { thousands, compact, prefix, suffix };

  // ── Legend sizing ────────────────────────────────────────────────────────
  const legendItems = slices.map((s) => ({
    id: s.id,
    label: s.label,
    color: s.color,
    value: Number(s.value) || 0,
    percent: metrics.total > 0 ? ((Number(s.value) || 0) / metrics.total) * 100 : 0,
  }));

  const legendVisible =
    showLegend && legendPosition !== "none" && legendItems.length > 0;
  const legendOnSide = legendPosition === "left" || legendPosition === "right";

  const longestLegend = legendItems.reduce(
    (max, item) => Math.max(max, String(item.label || "").length),
    0
  );
  const legendValueWidth = legendValues.length ? 72 : 0;
  const legendItemWidth = Math.min(
    Math.max(longestLegend * 6.6 + LEGEND_MARKER + 34 + legendValueWidth, 150),
    Math.max(width - PAD * 2, 180)
  );

  let legendWidth = 0;
  let legendHeight = 0;
  let legendPerRow = 1;
  let legendItemW = legendItemWidth;

  if (legendVisible) {
    if (legendOnSide) {
      legendWidth = legendItemWidth;
      legendHeight = legendItems.length * LEGEND_ROW;
      legendPerRow = 1;
    } else {
      const available = width - PAD * 2;
      const perRow = Math.max(
        2,
        Math.floor((available + LEGEND_ITEM_GAP) / (legendItemWidth + LEGEND_ITEM_GAP))
      );
      legendItemW = (available - (perRow - 1) * LEGEND_ITEM_GAP) / perRow;
      legendPerRow = perRow;
      const rows = Math.ceil(legendItems.length / perRow);
      legendHeight = rows * LEGEND_ROW;
    }
  }

  let titleHeight = 0;
  if (title) titleHeight += 34;
  if (subtitle) titleHeight += 20;

  // ── Plot rectangle ───────────────────────────────────────────────────────
  const labelGutter = showCategoryLabels ? 46 : 6;

  const left =
    PAD +
    labelGutter +
    (legendOnSide && legendPosition === "left" ? legendWidth + LEGEND_ITEM_GAP : 0);
  const right =
    PAD +
    labelGutter +
    (legendOnSide && legendPosition === "right" ? legendWidth + LEGEND_ITEM_GAP : 0);
  const top =
    PAD +
    titleHeight +
    (!legendOnSide && legendPosition === "top" && legendVisible
      ? legendHeight + LEGEND_ITEM_GAP
      : 0);
  const bottom =
    PAD +
    labelGutter +
    (!legendOnSide && legendPosition === "bottom" && legendVisible
      ? legendHeight + LEGEND_ITEM_GAP
      : 0);

  const plotW = Math.max(80, width - left - right);
  const plotH = Math.max(80, height - top - bottom);

  const center = { x: left + plotW / 2, y: top + plotH / 2 };
  const radius = Math.max(44, Math.min(plotW, plotH) / 2);
  const inner = radius * Math.max(0, Math.min(0.72, innerRatio));

  const valueToRadius = (v) => {
    const clamped = Math.max(scale.min, Math.min(scale.max, Number(v) || 0));
    let t = (clamped - scale.min) / span;
    if (config.valueScale === "area") t = Math.sqrt(Math.max(0, t));
    return Math.max(0, Math.min(1, t));
  };

  const radiusForValue = (v) => inner + (radius - inner) * valueToRadius(v);

  // ── Grid rings ───────────────────────────────────────────────────────────
  const rings = scale.ticks
    .map((value) => ({ value, r: radiusForValue(value) }))
    .filter((ring) => ring.r > inner + 0.5);

  // ── Sectors ──────────────────────────────────────────────────────────────
  const step = n > 0 ? 360 / n : 0;
  const safeGap = Math.max(0, Math.min(step * 0.85, Number(gap) || 0));
  const sliceAngle = Math.max(0.4, step - safeGap);

  const sectorList = slices.map((s, i) => {
    const midAngle = startAngle + dir * step * i;
    const a0 = midAngle - sliceAngle / 2;
    const a1 = midAngle + sliceAngle / 2;
    const value = Math.max(0, Number(s.value) || 0);
    const outer = radiusForValue(value);
    const r = Math.max(inner, outer);
    const corner = config.mode === "bar" ? cornerRadius : 0;
    const path = sectorPath(center.x, center.y, inner, r, a0, a1, corner);

    // Category labels sit in the outer gutter, value labels just outside the
    // wedge tip (or inside it) so the two never collide.
    const catPos = polarToCartesian(
      center.x,
      center.y,
      radius + CATEGORY_LABEL_GAP,
      midAngle
    );
    const outPos = polarToCartesian(
      center.x,
      center.y,
      r + VALUE_LABEL_GAP,
      midAngle
    );
    const inPos = polarToCartesian(
      center.x,
      center.y,
      Math.max(inner + 8, r * 0.68),
      midAngle
    );

    const anchorFor = (p) => {
      const dx = p.x - center.x;
      if (dx > 6) return "start";
      if (dx < -6) return "end";
      return "middle";
    };
    const baselineFor = (p) => {
      const dx = p.x - center.x;
      const dy = p.y - center.y;
      if (Math.abs(dx) <= 6 && dy < -6) return "auto";
      if (Math.abs(dx) <= 6 && dy > 6) return "hanging";
      return "middle";
    };

    return {
      index: i,
      id: s.id,
      label: s.label,
      color: s.color,
      value,
      percent: metrics.total > 0 ? (value / metrics.total) * 100 : 0,
      a0,
      a1,
      midAngle,
      r,
      outer,
      path,
      catX: catPos.x,
      catY: catPos.y,
      catAnchor: anchorFor(catPos),
      catBaseline: baselineFor(catPos),
      outX: outPos.x,
      outY: outPos.y,
      outAnchor: anchorFor(outPos),
      outBaseline: baselineFor(outPos),
      inX: inPos.x,
      inY: inPos.y,
    };
  });

  // ── Spokes (category boundaries) ─────────────────────────────────────────
  const spokes = [];
  if (n > 0) {
    for (let i = 0; i < n; i++) {
      const angle = startAngle + dir * step * i - (dir * step) / 2;
      spokes.push({
        angle,
        from: polarToCartesian(center.x, center.y, inner, angle),
        to: polarToCartesian(center.x, center.y, radius, angle),
      });
    }
  }

  // ── Legend positions ─────────────────────────────────────────────────────
  const legendRowPositions = [];
  if (legendVisible) {
    if (legendOnSide) {
      const legendX = legendPosition === "left" ? PAD : width - PAD - legendWidth;
      const legendY = PAD + titleHeight + 4;
      legendItems.forEach((_, index) => {
        legendRowPositions.push({
          x: legendX,
          y: legendY + index * LEGEND_ROW,
          width: legendWidth,
        });
      });
    } else {
      const startY =
        legendPosition === "top"
          ? PAD + titleHeight + 4
          : height - PAD - legendHeight;
      legendItems.forEach((_, index) => {
        const col = index % legendPerRow;
        const row = Math.floor(index / legendPerRow);
        legendRowPositions.push({
          x: PAD + col * (legendItemW + LEGEND_ITEM_GAP),
          y: startY + row * LEGEND_ROW,
          width: legendItemW,
        });
      });
    }
  }

  const hasData = sectorList.some((s) => s.value > 0) && n >= 2;
  const warnings = [];
  if (n < 2) warnings.push("Add at least two categories to draw a polar chart.");
  else if (!hasData) warnings.push("Enter a value greater than zero to draw the chart.");

  return {
    width,
    height,
    pad: PAD,
    center,
    radius,
    inner,
    sectors: sectorList,
    rings,
    spokes,
    scale,
    valueToRadius,
    radiusForValue,
    labels: { labelFormat, labelPosition, sliceAngle },
    metrics,
    fmtOptions,
    decimals,
    categoryLabelGap: CATEGORY_LABEL_GAP,
    legend: {
      visible: legendVisible,
      onSide: legendOnSide,
      position: legendPosition,
      items: legendItems,
      positions: legendRowPositions,
      rowHeight: LEGEND_ROW,
      marker: LEGEND_MARKER,
      width: legendWidth,
      height: legendHeight,
    },
    titleY: PAD + 22,
    subtitleY: PAD + 22 + (title ? 22 : 0),
    hasData,
    warnings,
  };
}

// ─── Export helpers (browser only) ───────────────────────────────────────────
export function serializeSvg(svgElement, width, height) {
  if (!svgElement) return "";
  const clone = svgElement.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("class");
  clone.querySelectorAll("[data-export-strip]").forEach((node) => node.remove());
  // Drop transient hover-highlight classes so a download never captures the
  // dimmed/active state of whichever wedge the pointer happened to be over.
  clone
    .querySelectorAll(".is-dim, .is-active")
    .forEach((node) => node.classList.remove("is-dim", "is-active"));
  return new XMLSerializer().serializeToString(clone);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadSvgFile(svgElement, width, height, filename) {
  const markup = serializeSvg(svgElement, width, height);
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}

export function downloadPng(svgElement, width, height, filename, scale = 2) {
  return new Promise((resolve, reject) => {
    try {
      const markup = serializeSvg(svgElement, width, height);
      const svgBlob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Canvas export failed"));
            return;
          }
          downloadBlob(blob, filename);
          resolve(true);
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Unable to rasterise SVG"));
      };
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

// ─── Data export ─────────────────────────────────────────────────────────────
export function slicesToCsv(slices, total = 0) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Category", "Value", "Percent"];
  const rows = slices.map((s) => {
    const value = Number(s.value) || 0;
    const percent = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
    return [escape(s.label), String(value), `${percent}%`];
  });
  const footer = [
    ["Total", String(total), total > 0 ? "100.00%" : "0.00%"],
    [
      "Average",
      slices.length ? (total / slices.length).toFixed(2) : "0",
      "",
    ],
  ];
  return [header, ...rows, ...footer].map((row) => row.join(",")).join("\n");
}

export function slicesToJson({ title, subtitle, mode, valueScale, scale, slices, metrics }) {
  return {
    title,
    subtitle,
    chartShape: mode,
    valueScale,
    scale,
    slices: slices.map((s) => ({ label: s.label, value: Number(s.value) || 0 })),
    total: metrics.total,
    max: metrics.max,
    min: metrics.min,
    average: Number(metrics.average.toFixed(2)),
    count: metrics.count,
  };
}
