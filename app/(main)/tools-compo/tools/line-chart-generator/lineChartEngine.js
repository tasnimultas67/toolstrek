// app/(main)/tools-compo/tools/line-chart-generator/lineChartEngine.js
// Pure geometry, scale, layout, path-building and export helpers for the
// Line Chart Generator & Area Chart Studio. Everything here is deterministic
// and side-effect free (except the browser download utilities at the bottom,
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

export function getPointLabelText(value, format, decimals, grandTotal, fmtOptions) {
  const valueText = formatValue(value, { ...fmtOptions, decimals });
  const percent =
    grandTotal > 0
      ? `${formatNumber((Math.abs(value) / grandTotal) * 100, decimals)}%`
      : "0%";
  switch (format) {
    case "percent":
      return percent;
    case "both":
      return `${valueText} · ${percent}`;
    case "value":
    default:
      return valueText;
  }
}

// ─── Null-safe numeric coercion ──────────────────────────────────────────────
// Empty strings and null/undefined become gaps (null); everything else is a
// finite number (falling back to 0 for unparseable input).
export function toNum(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

export function buildManualScale(min, max, tickCount = 5) {
  const lo = Number(min);
  const hi = Number(max);
  const step = (hi - lo) / Math.max(1, tickCount);
  const ticks = [];
  for (let i = 0; i <= tickCount; i += 1) ticks.push(Number((lo + step * i).toFixed(10)));
  return { min: lo, max: hi, step, ticks };
}

export function computeValueExtent(series = [], stacked = false, zeroBaseline = true) {
  const n = series[0]?.values?.length ?? 0;
  let dataMin = Infinity;
  let dataMax = -Infinity;

  if (stacked) {
    for (let i = 0; i < n; i++) {
      let pos = 0;
      let neg = 0;
      for (const s of series) {
        const v = toNum(s.values?.[i]) ?? 0;
        if (v >= 0) pos += v;
        else neg += v;
      }
      dataMax = Math.max(dataMax, pos);
      dataMin = Math.min(dataMin, neg);
    }
  } else {
    for (const s of series) {
      for (const raw of s.values || []) {
        const v = toNum(raw);
        if (v === null) continue;
        dataMax = Math.max(dataMax, v);
        dataMin = Math.min(dataMin, v);
      }
    }
  }

  if (dataMax === -Infinity) {
    dataMin = 0;
    dataMax = 1;
  }
  if (zeroBaseline) {
    dataMin = Math.min(dataMin, 0);
    dataMax = Math.max(dataMax, 0);
  }
  return { min: dataMin, max: dataMax };
}

// ─── Text measurement (approximate, render-independent) ──────────────────────
export function estimateTextWidth(text, fontSize = 12) {
  return String(text ?? "").length * fontSize * 0.56;
}

export function truncateText(text, maxChars) {
  const value = String(text ?? "");
  return value.length > maxChars ? `${value.slice(0, Math.max(1, maxChars - 1))}…` : value;
}

// ─── Layout ──────────────────────────────────────────────────────────────────
export const DEFAULT_CHART_WIDTH = 820;
export const DEFAULT_CHART_HEIGHT = 520;

const PAD = 26;
const TITLE_FS = 20;
const TICK_FS = 12;
const CAT_FS = 12;
const LEGEND_ROW = 22;
const LEGEND_MARKER = 13;
const LEGEND_ITEM_GAP = 20;

export function computeLineLayout(config) {
  const {
    width = DEFAULT_CHART_WIDTH,
    height = DEFAULT_CHART_HEIGHT,
    title,
    subtitle,
    series = [],
    categories = [],
    stacked = false,
    pointPadding = 0.05,
    showValueAxis = true,
    showCategoryAxis = true,
    showGridlines = true,
    zeroBaseline = true,
    tickCount = 5,
    autoScale = true,
    manualMin = 0,
    manualMax = 100,
    legendPosition = "top",
    showLegend = true,
    legendValues = [],
    labelFormat = "value",
    labelPosition = "above",
    decimals = 0,
    compact = false,
    thousands = true,
    prefix = "",
    suffix = "",
    categoryLabelAngle = 0,
    axisTitleX = "",
    axisTitleY = "",
    markerSize = 4,
  } = config;

  const visibleSeries = series.filter((s) => s.visible !== false);

  // ── Value scale ──────────────────────────────────────────────────────────
  let extent = { min: 0, max: 1 };
  if (autoScale) {
    extent = computeValueExtent(visibleSeries, stacked, zeroBaseline);
  }
  const scale =
    !autoScale &&
    Number.isFinite(Number(manualMin)) &&
    Number.isFinite(Number(manualMax)) &&
    Number(manualMax) > Number(manualMin)
      ? buildManualScale(Number(manualMin), Number(manualMax), tickCount)
      : niceScale(extent.min, extent.max, tickCount);

  const fmtOptions = { thousands, compact, prefix, suffix };

  // ── Legend sizing ────────────────────────────────────────────────────────
  const legendItems = series.map((s) => ({
    id: s.id,
    label: s.name,
    color: s.color,
    dash: s.dash || "solid",
    visible: s.visible !== false,
    value: (s.values || []).reduce(
      (a, v) => a + (toNum(v) ?? 0),
      0
    ),
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

  // ── Axis space estimation ────────────────────────────────────────────────
  const tickLabels = scale.ticks.map((t) => formatValue(t, { ...fmtOptions, decimals }));
  const maxTickWidth = tickLabels.reduce(
    (max, label) => Math.max(max, estimateTextWidth(label, TICK_FS)),
    0
  );

  const longestCat = categories.reduce(
    (max, c) => Math.max(max, String(c.label || "").length),
    0
  );
  const catLabelWidth = estimateTextWidth("x".repeat(longestCat), CAT_FS);

  let valueAxisSpace = showValueAxis ? maxTickWidth + 12 : 0;
  if (axisTitleY) valueAxisSpace += 18;

  let categoryAxisSpace = 0;
  if (showCategoryAxis) {
    if (categoryLabelAngle === 0) categoryAxisSpace = 22;
    else if (categoryLabelAngle === 45)
      categoryAxisSpace = Math.min(92, catLabelWidth * 0.71 + 18);
    else categoryAxisSpace = Math.min(170, catLabelWidth + 14);
  }
  if (axisTitleX) categoryAxisSpace += 18;

  let titleHeight = 0;
  if (title) titleHeight += 34;
  if (subtitle) titleHeight += 20;

  // Reserve headroom so markers and "above" labels never clip the plot edge.
  const outsideLabels = labelFormat !== "none" && labelPosition !== "center";
  const markerPad = markerSize + 4;
  const topHeadroom =
    (outsideLabels && labelPosition === "above" ? 22 : 8) + markerPad;
  const bottomHeadroom =
    (outsideLabels && labelPosition === "below" ? 22 : 8) + markerPad;

  // ── Plot rectangle ───────────────────────────────────────────────────────
  const left = PAD + valueAxisSpace;
  const right =
    PAD +
    (legendOnSide && legendPosition === "right" ? legendWidth + LEGEND_ITEM_GAP : 0);
  const top =
    PAD +
    titleHeight +
    topHeadroom +
    (!legendOnSide && legendPosition === "top" && legendVisible
      ? legendHeight + LEGEND_ITEM_GAP
      : 0);
  const bottom =
    PAD +
    categoryAxisSpace +
    bottomHeadroom +
    (legendOnSide && legendPosition === "left" ? legendWidth + LEGEND_ITEM_GAP : 0) +
    (!legendOnSide && legendPosition === "bottom" && legendVisible
      ? legendHeight + LEGEND_ITEM_GAP
      : 0);

  const plotRect = {
    x: left,
    y: top,
    w: Math.max(60, width - left - right),
    h: Math.max(60, height - top - bottom),
  };

  // ── Position mappers ─────────────────────────────────────────────────────
  const span = scale.max - scale.min || 1;
  const valueToY = (value) => {
    const t = ((Number(value) || 0) - scale.min) / span;
    return plotRect.y + plotRect.h - t * plotRect.h;
  };

  const ticks = scale.ticks.map((value) => ({ value, y: valueToY(value) }));

  // ── Category x positions ─────────────────────────────────────────────────
  const nCat = categories.length;
  const inset = plotRect.w * Math.min(Math.max(pointPadding, 0), 0.35);
  const xStart = plotRect.x + inset;
  const xEnd = plotRect.x + plotRect.w - inset;
  const usable = Math.max(1, xEnd - xStart);
  const catX = (i) => (nCat <= 1 ? plotRect.x + plotRect.w / 2 : xStart + (i / (nCat - 1)) * usable);

  const catList = categories.map((c, i) => ({
    index: i,
    id: c.id ?? `cat-${i}`,
    label: c.label ?? `Item ${i + 1}`,
    x: catX(i),
  }));

  // Baseline y for area fills (zero when in range, otherwise the nearer edge).
  const baseValue = Math.min(Math.max(0, scale.min), scale.max);
  const baselineY = valueToY(baseValue);

  // ── Series points (with stacking) ────────────────────────────────────────
  const accPos = new Array(nCat).fill(0);
  const accNeg = new Array(nCat).fill(0);

  const computedSeries = series.map((s) => {
    const points = [];
    for (let i = 0; i < nCat; i++) {
      const value = toNum(s.values?.[i]);
      const v = value ?? 0;
      let start = 0;
      let end = v;
      if (stacked) {
        if (v >= 0) {
          start = accPos[i];
          end = start + v;
          accPos[i] = end;
        } else {
          start = accNeg[i];
          end = start + v;
          accNeg[i] = end;
        }
      }
      points.push({
        index: i,
        x: catX(i),
        value,
        missing: value === null,
        y: valueToY(end),
        yStart: valueToY(start),
        yBase: stacked ? valueToY(start) : baselineY,
        seriesId: s.id,
        color: s.color,
      });
    }
    return {
      id: s.id,
      name: s.name,
      color: s.color,
      dash: s.dash || "solid",
      visible: s.visible !== false,
      values: s.values,
      points,
      total: points.reduce((a, p) => a + (p.value ?? 0), 0),
    };
  });

  // ── Legend item positions ────────────────────────────────────────────────
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
        legendPosition === "top" ? PAD + titleHeight + 4 : height - PAD - legendHeight;
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
    stacked,
    plot: plotRect,
    scale: { min: scale.min, max: scale.max, step: scale.step },
    ticks,
    valueToY,
    baselineY,
    categories: catList,
    series: computedSeries,
    visibleCount: visibleSeries.length,
    labelFormat,
    labelPosition,
    decimals,
    fmtOptions,
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
  };
}

// ─── Path builders ───────────────────────────────────────────────────────────
function clampOffset(ox, oy, x, y, max) {
  const dx = x - ox;
  const dy = y - oy;
  const len = Math.hypot(dx, dy);
  if (len <= max || len === 0) return [x, y];
  const s = max / len;
  return [ox + dx * s, oy + dy * s];
}

function runPath(pts, style, tension) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  if (style === "smooth") {
    const k = Math.max(0, Math.min(1, Number(tension)));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i += 1) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || pts[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      const maxOff = dist / 3;
      const c1 = clampOffset(
        p1.x,
        p1.y,
        p1.x + ((p2.x - p0.x) / 6) * k,
        p1.y + ((p2.y - p0.y) / 6) * k,
        maxOff
      );
      const c2 = clampOffset(
        p2.x,
        p2.y,
        p2.x - ((p3.x - p1.x) / 6) * k,
        p2.y - ((p3.y - p1.y) / 6) * k,
        maxOff
      );
      d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2.x} ${p2.y}`;
    }
    return d;
  }

  if (style === "stepAfter" || style === "stepBefore" || style === "stepMiddle") {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i += 1) {
      const prev = pts[i - 1];
      const cur = pts[i];
      if (style === "stepAfter") d += ` H ${cur.x} V ${cur.y}`;
      else if (style === "stepBefore") d += ` V ${cur.y} H ${cur.x}`;
      else {
        const mx = (prev.x + cur.x) / 2;
        d += ` H ${mx} V ${cur.y} H ${cur.x}`;
      }
    }
    return d;
  }

  // straight
  return (
    `M ${pts[0].x} ${pts[0].y} ` +
    pts
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ")
  );
}

// Build a (possibly multi-segment) line path from an array of points, where a
// null entry represents a gap in the data.
export function buildPath(points, style = "straight", tension = 0.6) {
  const runs = [];
  let cur = [];
  for (const p of points) {
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      if (cur.length) {
        runs.push(cur);
        cur = [];
      }
    } else {
      cur.push(p);
    }
  }
  if (cur.length) runs.push(cur);
  return runs
    .map((run) => runPath(run, style, tension))
    .filter(Boolean)
    .join(" ");
}

// Build a closed area path following the top line and a matching baseline.
// `baselineYs` is an array aligned to `points` giving the pixel y of the base.
export function buildAreaPath(points, baselineYs, style = "straight", tension = 0.6) {
  const runs = [];
  let cur = [];
  points.forEach((p, i) => {
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      if (cur.length) {
        runs.push(cur);
        cur = [];
      }
    } else {
      cur.push({ x: p.x, y: p.y, base: baselineYs[i] });
    }
  });
  if (cur.length) runs.push(cur);

  return runs
    .map((run) => {
      if (run.length < 2) return "";
      let d = runPath(run, style, tension);
      const last = run[run.length - 1];
      d += ` L ${last.x} ${last.base}`;
      for (let i = run.length - 1; i >= 0; i -= 1) {
        d += ` L ${run[i].x} ${run[i].base}`;
      }
      d += " Z";
      return d;
    })
    .filter(Boolean)
    .join(" ");
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

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function lighten(hex, amount = 0.32) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
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
      const svgBlob = new Blob([markup], {
        type: "image/svg+xml;charset=utf-8",
      });
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
export function dataToCsv(categories, series) {
  const header = ["Category", ...series.map((s) => `"${String(s.name).replace(/"/g, '""')}"`)];
  const rows = categories.map((cat, i) => [
    `"${String(cat.label ?? "").replace(/"/g, '""')}"`,
    ...series.map((s) => {
      const v = toNum(s.values?.[i]);
      return v === null ? "" : String(v);
    }),
  ]);
  const totals = [
    "Total",
    ...series.map((s) =>
      String((s.values || []).reduce((a, v) => a + (toNum(v) ?? 0), 0))
    ),
  ];
  return [header, ...rows, totals].map((row) => row.join(",")).join("\n");
}
