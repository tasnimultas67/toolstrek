// app/(main)/tools-compo/tools/pie-chart-generator/pieChartEngine.js
// Pure geometry, layout and export helpers for the Pie Chart Generator.
// Everything here is deterministic and side-effect free (except the browser
// download utilities at the bottom, which are guarded for client usage).

// ─── Trigonometry ────────────────────────────────────────────────────────────
// Angle convention: 0° points to the 12 o'clock position and increases
// clockwise, matching how people read a pie chart.
export function polarToCartesian(cx, cy, radius, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(a),
    y: cy + radius * Math.sin(a),
  };
}

// ─── Slice computation ───────────────────────────────────────────────────────
export function computeSlices(slices = [], options = {}) {
  const { startAngle = 0, clockwise = true, gapAngle = 0 } = options;

  const active = slices
    .map((s, index) => ({ ...s, _index: index }))
    .filter((s) => Number(s.value) > 0);

  const total = active.reduce((sum, s) => sum + Number(s.value), 0);

  if (!total) {
    return { slices: [], total: 0 };
  }

  const dir = clockwise ? 1 : -1;
  // Never allow gaps to consume a whole slice.
  const maxGapPerSlice = Math.max(0, 360 / active.length - 1);
  const gap = Math.min(Math.max(0, Number(gapAngle) || 0), maxGapPerSlice);

  let cursor = Number(startAngle) || 0;

  const computed = active.map((slice) => {
    const value = Number(slice.value);
    const fraction = value / total;
    const sweep = fraction * 360;
    const rawStart = cursor;
    const rawEnd = cursor + dir * sweep;
    cursor = rawEnd;

    const isFull = sweep >= 359.999;
    const pad = isFull ? 0 : gap / 2;
    const start = rawStart + dir * pad;
    const end = rawEnd - dir * pad;

    return {
      ...slice,
      value,
      fraction,
      percent: fraction * 100,
      start,
      end,
      mid: (start + end) / 2,
      isFull,
    };
  });

  return { slices: computed, total };
}

// ─── Path builders ───────────────────────────────────────────────────────────
function fullCirclePath(cx, cy, radius) {
  return (
    `M ${cx - radius} ${cy} ` +
    `a ${radius} ${radius} 0 1 0 ${radius * 2} 0 ` +
    `a ${radius} ${radius} 0 1 0 ${-radius * 2} 0 Z`
  );
}

export function buildSlicePath(slice, cx, cy, rOuter, rInner, corner = 0) {
  const rounded = Math.max(0, Math.min(corner, (rOuter - rInner) / 2, 24));
  const outerR = rOuter - rounded;
  const innerR = rInner > 0 ? rInner + rounded : 0;

  if (slice.isFull) {
    if (innerR > 0 && innerR < outerR) {
      // Ring (donut) built from two circles using the even-odd fill rule.
      return `${fullCirclePath(cx, cy, outerR)} ${fullCirclePath(cx, cy, innerR)}`;
    }
    return fullCirclePath(cx, cy, outerR);
  }

  const { start, end } = slice;
  const large = Math.abs(end - start) > 180 ? 1 : 0;
  const sweepOuter = end > start ? 1 : 0;
  const sweepInner = sweepOuter === 1 ? 0 : 1;

  const p1 = polarToCartesian(cx, cy, outerR, start);
  const p2 = polarToCartesian(cx, cy, outerR, end);

  if (innerR <= 0) {
    return (
      `M ${cx} ${cy} ` +
      `L ${p1.x} ${p1.y} ` +
      `A ${outerR} ${outerR} 0 ${large} ${sweepOuter} ${p2.x} ${p2.y} Z`
    );
  }

  const p3 = polarToCartesian(cx, cy, innerR, end);
  const p4 = polarToCartesian(cx, cy, innerR, start);

  return (
    `M ${p1.x} ${p1.y} ` +
    `A ${outerR} ${outerR} 0 ${large} ${sweepOuter} ${p2.x} ${p2.y} ` +
    `L ${p3.x} ${p3.y} ` +
    `A ${innerR} ${innerR} 0 ${large} ${sweepInner} ${p4.x} ${p4.y} Z`
  );
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

// Pick a readable foreground colour for text placed on top of a slice.
export function contrastColor(hex) {
  return relativeLuminance(hex) > 0.55 ? "#0f172a" : "#ffffff";
}

// ─── Formatting ──────────────────────────────────────────────────────────────
export function formatNumber(value, decimals = 0) {
  const num = Number(value) || 0;
  const fixed = Number.isFinite(decimals) ? decimals : 0;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: fixed,
    maximumFractionDigits: fixed,
  });
}

export function formatCompact(value) {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 10_000) return `${(num / 1000).toFixed(1)}K`;
  return formatNumber(num, 0);
}

export function getLabelText(slice, format, decimals) {
  const value = formatNumber(slice.value, decimals);
  const percent = `${formatNumber(slice.percent, decimals)}%`;
  switch (format) {
    case "value":
      return value;
    case "both":
      return `${value} · ${percent}`;
    case "label":
      return slice.label;
    case "percent":
    default:
      return percent;
  }
}

// ─── Layout ──────────────────────────────────────────────────────────────────
export const DEFAULT_CHART_WIDTH = 720;
export const DEFAULT_CHART_HEIGHT = 520;

const PAD = 26;
const LEGEND_ROW_HEIGHT = 26;
const LEGEND_ITEM_GAP = 18;
const CHAR_WIDTH = 7.3;

export function computeLayout(config) {
  const {
    width = DEFAULT_CHART_WIDTH,
    height = DEFAULT_CHART_HEIGHT,
    title,
    subtitle,
    showLegend = true,
    legendPosition = "right",
    showLegendValues = true,
    legendLabels = [],
    labelPosition = "inside",
    chartType = "pie",
    innerRadius = 58,
    hasOutsideLabels = false,
  } = config;

  const legendOnSide = legendPosition === "left" || legendPosition === "right";
  const legendVisible = showLegend && legendPosition !== "none" && legendLabels.length > 0;

  const longestLabel = legendLabels.reduce(
    (max, label) => Math.max(max, Math.min(String(label || "").length, 18)),
    0
  );
  const valueWidth = showLegendValues ? 76 : 0;
  const itemWidth = Math.min(
    Math.max(longestLabel * CHAR_WIDTH + valueWidth + 46, 132),
    Math.max(width - PAD * 2, 140)
  );

  let titleHeight = 0;
  if (title) titleHeight += 32;
  if (subtitle) titleHeight += 21;
  if (!title && subtitle) titleHeight += 8;

  let legendWidth = 0;
  let legendHeight = 0;
  let legendItemWidth = itemWidth;
  let legendPerRow = 1;

  if (legendVisible) {
    if (legendOnSide) {
      legendWidth = itemWidth + 8;
      legendHeight = legendLabels.length * LEGEND_ROW_HEIGHT;
      legendPerRow = 1;
    } else {
      const available = width - PAD * 2;
      const perRow = Math.max(1, Math.floor(available / itemWidth));
      legendItemWidth = available / perRow;
      legendPerRow = perRow;
      const rows = Math.ceil(legendLabels.length / perRow);
      legendHeight = rows * LEGEND_ROW_HEIGHT + 6;
    }
  }

  const sideLegendSpace = legendOnSide && legendVisible ? legendWidth + LEGEND_ITEM_GAP : 0;
  const stackedLegendSpace =
    !legendOnSide && legendVisible ? legendHeight + LEGEND_ITEM_GAP : 0;

  const areaX = PAD + (legendPosition === "left" ? sideLegendSpace : 0);
  const areaY =
    PAD +
    titleHeight +
    (legendPosition === "top" ? stackedLegendSpace : 0);

  const areaW = width - PAD * 2 - sideLegendSpace;
  const areaH = height - PAD * 2 - titleHeight - stackedLegendSpace;

  const cx = areaX + areaW / 2;
  const cy = areaY + areaH / 2;

  const reservedForLabels = labelPosition === "outside" && hasOutsideLabels ? 60 : 8;
  const maxRadius = Math.max(20, Math.min(areaW, areaH) / 2 - reservedForLabels);
  const rOuter = maxRadius;
  const rInner =
    chartType === "donut"
      ? rOuter * Math.min(Math.max(innerRadius, 0), 85) / 100
      : 0;

  const legendX = legendPosition === "left" ? PAD : width - PAD - legendWidth;
  const legendY = PAD + titleHeight + 6;

  return {
    width,
    height,
    pad: PAD,
    titleHeight,
    titleY: PAD + 22,
    subtitleY: PAD + 22 + (subtitle ? 0 : 0) + (title ? 21 : 14),
    cx,
    cy,
    rOuter,
    rInner,
    legendVisible,
    legendOnSide,
    legendWidth,
    legendHeight,
    legendItemWidth,
    legendPerRow,
    legendX,
    legendY,
    legendRowHeight: LEGEND_ROW_HEIGHT,
    legendItemGap: LEGEND_ITEM_GAP,
    areaX,
    areaY,
    areaW,
    areaH,
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
  // Strip any transient interaction helpers so exports are always clean.
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

export function slicesToCsv(computedSlices, total, decimals = 1) {
  const rows = [
    ["Label", "Value", "Percentage"],
    ...computedSlices.map((slice) => [
      `"${String(slice.label ?? "").replace(/"/g, '""')}"`,
      String(slice.value),
      `${formatNumber(slice.percent, decimals)}%`,
    ]),
    ["Total", String(total), "100%"],
  ];
  return rows.map((row) => row.join(",")).join("\n");
}
