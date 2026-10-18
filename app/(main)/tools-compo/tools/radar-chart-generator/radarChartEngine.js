// app/(main)/tools-compo/tools/radar-chart-generator/radarChartEngine.js
// Pure geometry, scale, layout and export helpers for the Radar Chart
// Generator & Spider Chart Studio. Everything here is deterministic and
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

export function getPointLabelText(point, format, decimals, axisTotal, fmtOptions) {
  const value = formatValue(point.value, { ...fmtOptions, decimals });
  const percent =
    axisTotal > 0
      ? `${formatNumber((Math.abs(point.value) / axisTotal) * 100, decimals)}%`
      : "0%";
  switch (format) {
    case "percent":
      return percent;
    case "both":
      return `${value} · ${percent}`;
    case "value":
    default:
      return value;
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
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
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

export function computeValueExtent(series = []) {
  let dataMin = Infinity;
  let dataMax = -Infinity;
  for (const s of series) {
    for (const v of s.values || []) {
      const n = Number(v) || 0;
      if (n < dataMin) dataMin = n;
      if (n > dataMax) dataMax = n;
    }
  }
  if (dataMax === -Infinity) {
    dataMin = 0;
    dataMax = 1;
  }
  return { min: dataMin, max: dataMax };
}

// Builds the value scale based on the chosen mode. Always returns an ordered
// list of ring values (used both for the grid rings and the radial tick labels).
export function computeScale({
  series = [],
  mode = "auto",
  levels = 5,
  customMin = 0,
  customMax = 100,
} = {}) {
  const safeLevels = Math.max(2, Math.min(12, Math.round(levels) || 5));

  if (mode === "fixed100") {
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

  // Auto fit — always anchor at zero so area comparisons stay honest.
  const extent = computeValueExtent(series);
  const hi = extent.max > 0 ? extent.max : 1;
  const scale = niceScale(0, hi, safeLevels);
  return { min: scale.min, max: scale.max, step: scale.step, ticks: scale.ticks };
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

// ─── Geometry ────────────────────────────────────────────────────────────────
// Angles are measured in degrees where 0 = 12 o'clock and increase clockwise.
export function polarToCartesian(cx, cy, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export function polygonPath(points = []) {
  if (!points.length) return "";
  return (
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"
  );
}

// Closed Catmull-Rom spline converted to cubic beziers. `tension` controls how
// round the resulting shape is (0 = straight polygon, ~0.3 = gently curved).
export function smoothClosedPath(points = [], tension = 0.32) {
  const n = points.length;
  if (n < 3) return polygonPath(points);
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return `${d} Z`;
}

export function pointsToPath(points, curved) {
  return curved ? smoothClosedPath(points, 0.3) : polygonPath(points);
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

// ─── Layout ──────────────────────────────────────────────────────────────────
export const DEFAULT_CHART_WIDTH = 660;
export const DEFAULT_CHART_HEIGHT = 620;

const PAD = 26;
const TITLE_FS = 20;
const LEGEND_ROW = 22;
const LEGEND_MARKER = 13;
const LEGEND_ITEM_GAP = 20;
const AXIS_LABEL_GAP = 18;

export function computeRadarLayout(config) {
  const {
    width = DEFAULT_CHART_WIDTH,
    height = DEFAULT_CHART_HEIGHT,
    title,
    subtitle,
    axes = [],
    series = [],
    startAngle = 0,
    direction = "cw",
    levels = 5,
    gridShape = "polygon",
    showAxisLabels = true,
    showTickLabels = true,
    legendPosition = "top",
    showLegend = true,
    legendValues = [],
    curved = false,
    valueLabelFormat = "none",
    valueLabelTotal = 0,
    decimals = 0,
    compact = false,
    thousands = true,
    prefix = "",
    suffix = "",
  } = config;

  const n = axes.length;
  const dir = direction === "cw" ? 1 : -1;

  const scale = computeScale({ series, mode: config.scaleMode, levels, customMin: config.customMin, customMax: config.customMax });
  const span = scale.max - scale.min || 1;

  const fmtOptions = { thousands, compact, prefix, suffix };

  // ── Legend sizing ────────────────────────────────────────────────────────
  const legendItems = series.map((s) => ({
    id: s.id,
    label: s.name,
    color: s.color,
    value: (s.values || []).reduce((a, v) => a + (Number(v) || 0), 0),
  }));

  const legendVisible =
    showLegend && legendPosition !== "none" && legendItems.length > 0;
  const legendOnSide = legendPosition === "left" || legendPosition === "right";

  const longestLegend = legendItems.reduce(
    (max, item) => Math.max(max, String(item.label || "").length),
    0
  );
  const legendValueWidth = legendValues.length ? 64 : 0;
  const legendItemWidth = Math.min(
    Math.max(longestLegend * 6.6 + LEGEND_MARKER + 30 + legendValueWidth, 120),
    Math.max(width - PAD * 2, 160)
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
        1,
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
  // Reserve a gutter around the plot for the axis category labels.
  const labelGutter = showAxisLabels ? 30 : 4;

  const left = PAD + labelGutter;
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
    (legendOnSide && legendPosition === "left" ? legendWidth + LEGEND_ITEM_GAP : 0) +
    (!legendOnSide && legendPosition === "bottom" && legendVisible
      ? legendHeight + LEGEND_ITEM_GAP
      : 0);

  const plotW = Math.max(80, width - left - right);
  const plotH = Math.max(80, height - top - bottom);

  const center = { x: left + plotW / 2, y: top + plotH / 2 };
  const radius = Math.max(40, Math.min(plotW, plotH) / 2);

  const valueToRadius = (v) => {
    const t = ((Number(v) || 0) - scale.min) / span;
    return Math.max(0, Math.min(1, t)) * radius;
  };

  // ── Axis geometry ────────────────────────────────────────────────────────
  const stepAngle = n > 0 ? 360 / n : 0;
  const axisList = axes.map((label, i) => {
    const angle = startAngle + dir * stepAngle * i;
    const outer = polarToCartesian(center.x, center.y, radius, angle);
    const labelPos = polarToCartesian(
      center.x,
      center.y,
      radius + AXIS_LABEL_GAP,
      angle
    );
    const dx = labelPos.x - center.x;
    const dy = labelPos.y - center.y;
    let anchor = "middle";
    if (dx > 6) anchor = "start";
    else if (dx < -6) anchor = "end";
    let baseline = "middle";
    if (dy < -6 && Math.abs(dx) <= 6) baseline = "auto";
    else if (dy > 6 && Math.abs(dx) <= 6) baseline = "hanging";
    return {
      index: i,
      label: label?.label ?? label ?? `Axis ${i + 1}`,
      id: label?.id ?? `axis-${i}`,
      angle,
      outer,
      labelX: labelPos.x,
      labelY: labelPos.y,
      anchor,
      baseline,
    };
  });

  // ── Grid rings ───────────────────────────────────────────────────────────
  const rings = scale.ticks.map((value) => {
    const r = valueToRadius(value);
    const points =
      gridShape === "circle"
        ? null
        : axisList.map((ax) => polarToCartesian(center.x, center.y, r, ax.angle));
    return { value, r, points };
  });

  // ── Series polygons ──────────────────────────────────────────────────────
  const seriesList = series.map((s) => {
    const points = axisList.map((ax, i) => {
      const value = Number(s.values?.[i]) || 0;
      const r = valueToRadius(value);
      const pos = polarToCartesian(center.x, center.y, r, ax.angle);
      return {
        x: pos.x,
        y: pos.y,
        value,
        axisIndex: i,
        axisLabel: ax.label,
        angle: ax.angle,
        r,
      };
    });
    return {
      id: s.id,
      name: s.name,
      color: s.color,
      values: points.map((p) => p.value),
      points,
      path: pointsToPath(points, curved),
    };
  });

  // ── Legend positions ─────────────────────────────────────────────────────
  let legendX = 0;
  const legendRowPositions = [];
  if (legendVisible) {
    if (legendOnSide) {
      legendX = legendPosition === "left" ? PAD : width - PAD - legendWidth;
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

  return {
    width,
    height,
    pad: PAD,
    center,
    radius,
    axes: axisList,
    rings,
    gridShape,
    series: seriesList,
    scale: { min: scale.min, max: scale.max, step: scale.step, ticks: scale.ticks },
    valueToRadius,
    valueLabelFormat,
    valueLabelTotal,
    decimals,
    fmtOptions,
    curved,
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
    hasData: seriesList.length > 0 && axisList.length > 2,
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
export function seriesToCsv(axes, series) {
  const header = ["Axis", ...series.map((s) => `"${String(s.name).replace(/"/g, '""')}"`)];
  const rows = axes.map((ax, i) => [
    `"${String(ax.label ?? "").replace(/"/g, '""')}"`,
    ...series.map((s) => String(Number(s.values?.[i]) || 0)),
  ]);
  const totals = [
    "Total",
    ...series.map((s) =>
      String((s.values || []).reduce((a, v) => a + (Number(v) || 0), 0))
    ),
  ];
  const averages = [
    "Average",
    ...series.map((s) => {
      const vals = s.values || [];
      const avg = vals.length
        ? vals.reduce((a, v) => a + (Number(v) || 0), 0) / vals.length
        : 0;
      return avg.toFixed(2);
    }),
  ];
  return [header, ...rows, totals, averages].map((row) => row.join(",")).join("\n");
}
