// app/(main)/tools-compo/tools/funnel-chart-generator/funnelChartEngine.js
// Pure geometry, scale, layout and export helpers for the Funnel Chart
// Generator & Conversion Studio. Everything here is deterministic and
// side-effect free (except the browser download utilities at the bottom,
// which are guarded for client usage).

// ─── Number formatting ───────────────────────────────────────────────────────
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

// Full value formatter honouring decimals, separators, compact mode and units.
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

// ─── Stage metrics ───────────────────────────────────────────────────────────
// Turns the raw stage list into enriched metrics. `norm` is a 0–1 value used by
// the layout to size each stage (the layout applies the minimum-width floor so
// that the slider can be changed without recomputing every percentage).
export function computeFunnelMetrics(stages = [], options = {}) {
  const { valueScale = "linear" } = options;

  const list = stages.map((s, index) => ({ ...s, _index: index }));
  const values = list.map((s) => Math.max(0, Number(s.value) || 0));

  const max = values.length ? Math.max(...values) : 0;
  const total = values.reduce((a, b) => a + b, 0);
  const first = values[0] || 0;
  const last = values.length ? values[values.length - 1] : 0;

  const f = valueScale === "sqrt" ? (v) => Math.sqrt(v) : (v) => v;
  const fMax = f(max) || 1;

  let prev = first;

  const computed = list.map((s, i) => {
    const value = values[i];
    const norm = Math.max(0, Math.min(1, f(value) / fMax));

    const percentTotal = total > 0 ? (value / total) * 100 : 0;
    const percentFirst = first > 0 ? (value / first) * 100 : 0;
    const percentPrev = prev > 0 ? (value / prev) * 100 : 0;
    const dropoff = prev - value;
    const dropoffPercent = prev > 0 ? ((prev - value) / prev) * 100 : 0;

    const stage = {
      ...s,
      value,
      index: i,
      norm,
      percentTotal,
      percentFirst,
      percentPrev,
      conversionPrev: percentPrev,
      dropoff,
      dropoffPercent,
      isFirst: i === 0,
      isLast: i === list.length - 1,
    };

    prev = value;
    return stage;
  });

  return { stages: computed, max, total, first, last };
}

// Builds the human-readable text for a stage's data label.
export function getStageLabelText(stage, format, decimals, fmtOptions, percentBasis) {
  const value = formatValue(stage.value, { ...fmtOptions, decimals });

  let percent = stage.percentFirst;
  if (percentBasis === "previous") percent = stage.percentPrev;
  else if (percentBasis === "total") percent = stage.percentTotal;
  const pct = `${formatNumber(percent, decimals)}%`;

  switch (format) {
    case "percent":
      return pct;
    case "both":
      return `${value} · ${pct}`;
    case "name":
      return stage.label;
    case "nameValue":
      return `${stage.label}: ${value}`;
    case "value":
      return value;
    case "none":
    default:
      return "";
  }
}

// Builds the text for the conversion marker drawn between two stages.
export function getConversionText(stage, format, decimals, fmtOptions) {
  const pct = `${formatNumber(stage.percentPrev, decimals)}%`;
  const drop = formatValue(Math.abs(stage.dropoff), { ...fmtOptions, decimals });
  switch (format) {
    case "dropoff":
      return `−${drop}`;
    case "both":
      return `${pct} · −${drop}`;
    case "percent":
    default:
      return pct;
  }
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

// ─── Geometry primitives ─────────────────────────────────────────────────────
const n2 = (v) => Math.round((Number(v) || 0) * 100) / 100;

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function unitVector(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

export function polygonPath(points = []) {
  if (!points.length) return "";
  return (
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${n2(p.x)} ${n2(p.y)}`)
      .join(" ") + " Z"
  );
}

// Rounds every vertex of a polygon with a quadratic curve. Works for both
// trapezoids and rectangles, producing clean, consistent corners.
export function roundedPolygonPath(points = [], radius = 0) {
  const n = points.length;
  if (!n) return "";
  if (!(radius > 0) || n < 3) return polygonPath(points);

  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const dirPrev = unitVector(curr, prev);
    const dirNext = unitVector(curr, next);
    const lenPrev = distance(curr, prev);
    const lenNext = distance(curr, next);
    const r = Math.max(0, Math.min(radius, lenPrev / 2, lenNext / 2));

    const a = { x: curr.x + dirPrev.x * r, y: curr.y + dirPrev.y * r };
    const b = { x: curr.x + dirNext.x * r, y: curr.y + dirNext.y * r };

    d += `${i === 0 ? "M" : "L"} ${n2(a.x)} ${n2(a.y)} `;
    d += `Q ${n2(curr.x)} ${n2(curr.y)} ${n2(b.x)} ${n2(b.y)} `;
  }
  return `${d}Z`;
}

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

// Readable foreground colour for text sitting on top of a given fill.
export function contrastColor(hex) {
  return relativeLuminance(hex) > 0.55 ? "#0f172a" : "#ffffff";
}

export function lighten(hex, amount = 0.28) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

export function withAlpha(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

// ─── Layout ──────────────────────────────────────────────────────────────────
export const DEFAULT_CHART_WIDTH = 760;
export const DEFAULT_CHART_HEIGHT = 560;

const PAD = 26;
const LEGEND_ROW = 24;
const LEGEND_MARKER = 13;
const LEGEND_ITEM_GAP = 20;

export function computeFunnelLayout(config) {
  const {
    width = DEFAULT_CHART_WIDTH,
    height = DEFAULT_CHART_HEIGHT,
    title,
    subtitle,
    stages = [],
    shape = "funnel",
    orientation = "vertical",
    gap = 6,
    cornerRadius = 6,
    minWidthPercent = 12,
    endTaper = 0.6,
    legendPosition = "right",
    showLegend = true,
    showLegendValues = true,
    showLegendPercent = false,
    labelPosition = "inside",
    decimals = 0,
  } = config;

  const horizontal = orientation === "horizontal";
  const effectiveGap = shape === "steps" ? 0 : Math.max(0, gap);
  const n = stages.length;

  // ── Legend sizing ─────────────────────────────────────────────────────────
  const legendVisible =
    showLegend && legendPosition !== "none" && stages.length > 0;
  const legendOnSide = legendPosition === "left" || legendPosition === "right";

  const longestLegend = stages.reduce(
    (max, s) => Math.max(max, String(s.label || "").length),
    0
  );
  const legendValueWidth = showLegendValues ? 66 : 0;
  const legendItemWidth = Math.min(
    Math.max(longestLegend * 6.8 + LEGEND_MARKER + 28 + legendValueWidth, 134),
    Math.max(width - PAD * 2, 160)
  );

  let legendWidth = 0;
  let legendHeight = 0;
  let legendPerRow = 1;
  let legendItemW = legendItemWidth;

  if (legendVisible) {
    if (legendOnSide) {
      legendWidth = legendItemWidth;
      legendHeight = stages.length * LEGEND_ROW;
      legendPerRow = 1;
    } else {
      const available = width - PAD * 2;
      const perRow = Math.max(
        1,
        Math.floor((available + LEGEND_ITEM_GAP) / (legendItemWidth + LEGEND_ITEM_GAP))
      );
      legendItemW = (available - (perRow - 1) * LEGEND_ITEM_GAP) / perRow;
      legendPerRow = perRow;
      const rows = Math.ceil(stages.length / perRow);
      legendHeight = rows * LEGEND_ROW;
    }
  }

  // ── Title block ───────────────────────────────────────────────────────────
  let titleHeight = 0;
  if (title) titleHeight += 32;
  if (subtitle) titleHeight += 20;

  // ── Outside-label gutter ──────────────────────────────────────────────────
  const outside = labelPosition === "outside";
  const longestStageLabel = stages.reduce(
    (max, s) => Math.max(max, String(s.label || "").length + 8),
    0
  );
  const labelGutter = outside
    ? Math.min(210, Math.max(96, longestStageLabel * 6.6))
    : 0;
  const labelGutterSide = outside && !horizontal ? labelGutter : 0;
  const labelGutterBottom = outside && horizontal ? 68 : 0;

  const sideLeftSpace =
    legendOnSide && legendPosition === "left" && legendVisible
      ? legendWidth + LEGEND_ITEM_GAP
      : 0;
  const sideRightSpace =
    legendOnSide && legendPosition === "right" && legendVisible
      ? legendWidth + LEGEND_ITEM_GAP
      : 0;
  const stackedTop =
    !legendOnSide && legendPosition === "top" && legendVisible
      ? legendHeight + LEGEND_ITEM_GAP
      : 0;
  const stackedBottom =
    !legendOnSide && legendPosition === "bottom" && legendVisible
      ? legendHeight + LEGEND_ITEM_GAP
      : 0;

  const plotLeft = PAD + sideLeftSpace;
  const plotTop = PAD + titleHeight + stackedTop;
  const plotWidth = Math.max(
    80,
    width - PAD * 2 - sideLeftSpace - sideRightSpace - labelGutterSide
  );
  const plotHeight = Math.max(
    80,
    height - PAD * 2 - titleHeight - stackedTop - stackedBottom - labelGutterBottom
  );

  // ── Stage sizing ──────────────────────────────────────────────────────────
  const maxAcross = Math.max(60, horizontal ? plotHeight : plotWidth);
  const lengthAvailable = horizontal ? plotWidth : plotHeight;
  const bandLen =
    n > 0 ? Math.max(6, (lengthAvailable - effectiveGap * (n - 1)) / n) : 0;

  const acrossCenter = horizontal
    ? plotTop + plotHeight / 2
    : plotLeft + plotWidth / 2;
  const lengthStart = horizontal ? plotLeft : plotTop;

  const minFrac = Math.max(0, Math.min(0.9, (Number(minWidthPercent) || 0) / 100));
  const sizeOf = (s) => maxAcross * (minFrac + (1 - minFrac) * (s.norm || 0));

  const outsideAcrossLimit = acrossCenter + maxAcross / 2;

  // ── Build segments ────────────────────────────────────────────────────────
  const segments = stages.map((s, i) => {
    const size = sizeOf(s);
    const nextSize =
      i < n - 1
        ? sizeOf(stages[i + 1])
        : size * (shape === "funnel" ? endTaper : 1);

    const startLen = lengthStart + i * (bandLen + effectiveGap);
    const endLen = startLen + bandLen;
    const midLen = (startLen + endLen) / 2;

    let points;
    let startSize;
    let endSize;
    let halfAtMid;

    if (horizontal) {
      startSize = size;
      endSize = shape === "funnel" ? nextSize : size;
      const halfStart = startSize / 2;
      const halfEnd = endSize / 2;
      halfAtMid = (halfStart + halfEnd) / 2;
      points = [
        { x: startLen, y: acrossCenter - halfStart },
        { x: endLen, y: acrossCenter - halfEnd },
        { x: endLen, y: acrossCenter + halfEnd },
        { x: startLen, y: acrossCenter + halfStart },
      ];
    } else {
      startSize = size;
      endSize = shape === "funnel" ? nextSize : size;
      const halfStart = startSize / 2;
      const halfEnd = endSize / 2;
      halfAtMid = (halfStart + halfEnd) / 2;
      points = [
        { x: acrossCenter - halfStart, y: startLen },
        { x: acrossCenter + halfStart, y: startLen },
        { x: acrossCenter + halfEnd, y: endLen },
        { x: acrossCenter - halfEnd, y: endLen },
      ];
    }

    const center = horizontal
      ? { x: midLen, y: acrossCenter }
      : { x: acrossCenter, y: midLen };

    // Inside label sits at the geometric centre of the segment.
    const labelInside = { x: center.x, y: center.y, anchor: "middle" };

    // Outside label is aligned to a common edge so all labels line up neatly.
    let labelOutside;
    if (horizontal) {
      // Two staggered rows stop long labels from colliding side by side.
      const baseY = Math.min(height - PAD - 22, outsideAcrossLimit + 16);
      const labelY = baseY + (i % 2) * 18;
      const edgeY = acrossCenter + halfAtMid;
      labelOutside = {
        x: midLen,
        y: labelY,
        anchor: "middle",
        maxChars: Math.max(10, Math.floor((bandLen * 2 - 8) / 6.3)),
        leader: [
          { x: midLen, y: edgeY },
          { x: midLen, y: labelY - 7 },
        ],
      };
    } else {
      const labelX = Math.min(width - PAD - 4, outsideAcrossLimit + 16);
      const edgeX = acrossCenter + halfAtMid;
      labelOutside = {
        x: labelX,
        y: midLen,
        anchor: "start",
        maxChars: Math.max(8, Math.floor((labelGutter - 8) / 6.6)),
        leader: [
          { x: edgeX, y: midLen },
          { x: labelX - 5, y: midLen },
        ],
      };
    }

    return {
      ...s,
      color: s.color,
      startLen,
      endLen,
      midLen,
      startSize,
      endSize,
      halfAtMid,
      center,
      points,
      path: roundedPolygonPath(points, cornerRadius),
      labelInside,
      labelOutside,
    };
  });

  // ── Conversion markers ────────────────────────────────────────────────────
  const conversions = [];
  for (let i = 0; i < n - 1; i++) {
    const boundary = segments[i].endLen + effectiveGap / 2;
    conversions.push({
      index: i,
      stage: stages[i + 1],
      x: horizontal ? boundary : acrossCenter,
      y: horizontal ? acrossCenter : boundary,
      horizontal,
    });
  }

  // ── Legend positions ──────────────────────────────────────────────────────
  const legendItems = stages.map((s) => ({
    id: s.id,
    label: s.label,
    color: s.color,
    value: s.value,
    percentFirst: s.percentFirst,
    percentTotal: s.percentTotal,
  }));

  const legendPositions = [];
  if (legendVisible) {
    if (legendOnSide) {
      const legendX = legendPosition === "left" ? PAD : width - PAD - legendWidth;
      legendItems.forEach((_, index) => {
        legendPositions.push({
          x: legendX,
          y: PAD + titleHeight + 6 + index * LEGEND_ROW,
          width: legendWidth,
        });
      });
    } else {
      const startY =
        legendPosition === "top"
          ? PAD + titleHeight + 6
          : height - PAD - legendHeight;
      legendItems.forEach((_, index) => {
        const col = index % legendPerRow;
        const row = Math.floor(index / legendPerRow);
        legendPositions.push({
          x: PAD + col * (legendItemW + LEGEND_ITEM_GAP),
          y: startY + row * LEGEND_ROW,
          width: legendItemW,
        });
      });
    }
  }

  return {
    width,
    height,
    pad: PAD,
    horizontal,
    shape,
    decimals,
    titleY: PAD + 22,
    subtitleY: PAD + 22 + (title ? 21 : 0),
    plot: { left: plotLeft, top: plotTop, width: plotWidth, height: plotHeight },
    acrossCenter,
    maxAcross,
    bandLen,
    effectiveGap,
    segments,
    conversions,
    outside,
    legend: {
      visible: legendVisible,
      onSide: legendOnSide,
      position: legendPosition,
      items: legendItems,
      positions: legendPositions,
      rowHeight: LEGEND_ROW,
      marker: LEGEND_MARKER,
      width: legendWidth,
      height: legendHeight,
      itemWidth: legendItemW,
      showValues: showLegendValues,
      showPercent: showLegendPercent,
    },
    hasData: segments.length > 0,
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
export function stagesToCsv(stages, decimals = 1) {
  const header = [
    "Stage",
    "Value",
    "% of first",
    "% of total",
    "% of previous",
    "Drop-off",
  ];
  const rows = stages.map((s) => [
    `"${String(s.label ?? "").replace(/"/g, '""')}"`,
    String(s.value),
    `${formatNumber(s.percentFirst, decimals)}%`,
    `${formatNumber(s.percentTotal, decimals)}%`,
    `${formatNumber(s.percentPrev, decimals)}%`,
    String(s.dropoff),
  ]);
  return [header, ...rows].map((row) => row.join(",")).join("\n");
}
