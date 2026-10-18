// app/(main)/tools-compo/tools/bar-chart-generator/barChartEngine.js
// Pure geometry, scale, layout and export helpers for the Bar Chart Generator.
// Everything here is deterministic and side-effect free (except the browser
// download utilities at the bottom, which are guarded for client usage).

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

export function getBarLabelText(bar, format, decimals, grandTotal, fmtOptions) {
  const value = formatValue(bar.value, { ...fmtOptions, decimals });
  const percent =
    grandTotal > 0
      ? `${formatNumber(Math.abs(bar.value) / grandTotal * 100, decimals)}%`
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

export function computeValueExtent(series = [], mode = "grouped", zeroBaseline = true) {
  const n = series[0]?.values?.length ?? 0;
  let dataMin = Infinity;
  let dataMax = -Infinity;

  if (mode === "stacked") {
    for (let i = 0; i < n; i++) {
      let pos = 0;
      let neg = 0;
      for (const s of series) {
        const v = Number(s.values?.[i]) || 0;
        if (v >= 0) pos += v;
        else neg += v;
      }
      dataMax = Math.max(dataMax, pos);
      dataMin = Math.min(dataMin, neg);
    }
  } else {
    for (const s of series) {
      for (let i = 0; i < n; i++) {
        const v = Number(s.values?.[i]) || 0;
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
export const DEFAULT_CHART_WIDTH = 760;
export const DEFAULT_CHART_HEIGHT = 520;

const PAD = 26;
const TITLE_FS = 20;
const SUBTITLE_FS = 12.5;
const TICK_FS = 12;
const CAT_FS = 12;
const LEGEND_ROW = 22;
const LEGEND_MARKER = 13;
const LEGEND_ITEM_GAP = 20;

export function computeBarLayout(config) {
  const {
    width = DEFAULT_CHART_WIDTH,
    height = DEFAULT_CHART_HEIGHT,
    title,
    subtitle,
    orientation = "vertical",
    mode = "grouped",
    series = [],
    categories = [],
    barWidthPct = 68,
    groupGap = 6,
    cornerRadius = 4,
    showValueAxis = true,
    showCategoryAxis = true,
    showGridlines = true,
    zeroBaseline = true,
    tickCount = 5,
    legendPosition = "top",
    showLegend = true,
    legendValues = [],
    labelFormat = "value",
    labelPosition = "outside",
    decimals = 0,
    compact = false,
    thousands = true,
    prefix = "",
    suffix = "",
    categoryLabelAngle = 0,
    axisTitleX = "",
    axisTitleY = "",
  } = config;

  const vertical = orientation === "vertical";
  const total = series.reduce(
    (sum, s) => sum + s.values.reduce((a, v) => a + (Number(v) || 0), 0),
    0
  );

  // ── Value scale ──────────────────────────────────────────────────────────
  const extent = computeValueExtent(series, mode, zeroBaseline);
  const scale = niceScale(extent.min, extent.max, tickCount);

  const fmtOptions = { thousands, compact, prefix, suffix };

  // ── Legend sizing ────────────────────────────────────────────────────────
  const legendItems = series.map((s) => ({
    id: s.id,
    label: s.name,
    color: s.color,
    value: s.values.reduce((a, v) => a + (Number(v) || 0), 0),
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
      const perRow = Math.max(1, Math.floor((available + LEGEND_ITEM_GAP) / (legendItemWidth + LEGEND_ITEM_GAP)));
      legendItemW = (available - (perRow - 1) * LEGEND_ITEM_GAP) / perRow;
      legendPerRow = perRow;
      const rows = Math.ceil(legendItems.length / perRow);
      legendHeight = rows * LEGEND_ROW;
    }
  }

  // ── Axis space estimation ────────────────────────────────────────────────
  const tickLabels = scale.ticks.map((t) =>
    formatValue(t, { ...fmtOptions, decimals })
  );
  const maxTickWidth = tickLabels.reduce(
    (max, label) => Math.max(max, estimateTextWidth(label, TICK_FS)),
    0
  );

  const longestCat = categories.reduce(
    (max, c) => Math.max(max, String(c.label || "").length),
    0
  );
  const catLabelWidth = estimateTextWidth("x".repeat(longestCat), CAT_FS);

  let valueAxisSpace = 0;
  let categoryAxisSpace = 0;

  if (vertical) {
    valueAxisSpace = showValueAxis ? maxTickWidth + 12 : 0;
    if (axisTitleY) valueAxisSpace += 18;

    if (showCategoryAxis) {
      if (categoryLabelAngle === 0) categoryAxisSpace = 20;
      else if (categoryLabelAngle === 45)
        categoryAxisSpace = Math.min(92, catLabelWidth * 0.71 + 16);
      else categoryAxisSpace = Math.min(170, catLabelWidth + 12);
    }
    if (axisTitleX) categoryAxisSpace += 18;
  } else {
    if (showCategoryAxis) {
      categoryAxisSpace = Math.min(230, catLabelWidth + 12);
    }
    if (axisTitleX) categoryAxisSpace += 18;

    valueAxisSpace = showValueAxis ? 20 : 0;
    if (axisTitleY) valueAxisSpace += 18;
  }

  let titleHeight = 0;
  if (title) titleHeight += 34;
  if (subtitle) titleHeight += 20;

  // Reserve extra space so "outside" value labels never collide with the axis.
  const outsideLabels = labelFormat !== "none" && labelPosition === "outside";
  const topHeadroom = vertical ? (outsideLabels ? 20 : 10) : 0;
  const rightHeadroom = !vertical && outsideLabels ? 26 : 0;

  // ── Plot rectangle ───────────────────────────────────────────────────────
  const left = PAD + (vertical ? valueAxisSpace : categoryAxisSpace);
  const right =
    PAD +
    (!vertical ? valueAxisSpace : 0) +
    rightHeadroom +
    (legendOnSide && legendPosition === "right" ? legendWidth + LEGEND_ITEM_GAP : 0);
  const top =
    PAD +
    titleHeight +
    (!legendOnSide && legendPosition === "top" && legendVisible ? legendHeight + LEGEND_ITEM_GAP : 0);
  const bottom =
    PAD +
    (vertical ? categoryAxisSpace : 0) +
    (legendOnSide && legendPosition === "left" ? legendWidth + LEGEND_ITEM_GAP : 0) +
    (!legendOnSide && legendPosition === "bottom" && legendVisible ? legendHeight + LEGEND_ITEM_GAP : 0);

  const plotRect = {
    x: left,
    y: top + topHeadroom,
    w: Math.max(60, width - left - right),
    h: Math.max(60, height - top - bottom - topHeadroom),
  };

  // ── Position mappers ─────────────────────────────────────────────────────
  const span = scale.max - scale.min || 1;
  const valueToPos = (value) => {
    const t = ((Number(value) || 0) - scale.min) / span;
    return vertical
      ? plotRect.y + plotRect.h - t * plotRect.h
      : plotRect.x + t * plotRect.w;
  };

  const ticks = scale.ticks.map((value) => ({ value, pos: valueToPos(value) }));

  // ── Category bands ───────────────────────────────────────────────────────
  const nCat = categories.length;
  const axisLength = vertical ? plotRect.w : plotRect.h;
  const bandSize = axisLength / Math.max(1, nCat);
  const catCenter = (i) =>
    (vertical ? plotRect.x : plotRect.y) + (i + 0.5) * bandSize;

  const groupBand = Math.max(2, (bandSize * Math.min(Math.max(barWidthPct, 5), 100)) / 100);
  const seriesCount = mode === "stacked" ? 1 : Math.max(1, series.length);
  const barThickness =
    mode === "stacked"
      ? groupBand
      : Math.max(2, (groupBand - groupGap * (seriesCount - 1)) / seriesCount);

  // ── Build bars ───────────────────────────────────────────────────────────
  const catList = [];
  for (let i = 0; i < nCat; i++) {
    const center = catCenter(i);
    const groupStart = center - groupBand / 2;
    const bars = [];

    if (mode === "stacked") {
      let cumPos = 0;
      let cumNeg = 0;
      let lastPosIdx = -1;
      let lastNegIdx = -1;
      const tempBars = [];
      for (let k = 0; k < series.length; k++) {
        const s = series[k];
        const v = Number(s.values?.[i]) || 0;
        let valueStart;
        let valueEnd;
        if (v >= 0) {
          valueStart = cumPos;
          valueEnd = cumPos + v;
          cumPos = valueEnd;
          lastPosIdx = tempBars.length;
        } else {
          valueStart = cumNeg;
          valueEnd = cumNeg + v;
          cumNeg = valueEnd;
          lastNegIdx = tempBars.length;
        }
        tempBars.push({
          seriesId: s.id,
          seriesIndex: k,
          seriesName: s.name,
          color: s.color,
          value: v,
          valueStart,
          valueEnd,
          crossStart: groupStart,
          crossSize: groupBand,
          roundOuter: false,
        });
      }
      if (lastPosIdx >= 0) tempBars[lastPosIdx].roundOuter = true;
      if (lastNegIdx >= 0) tempBars[lastNegIdx].roundOuter = true;
      bars.push(...tempBars);
    } else {
      for (let k = 0; k < series.length; k++) {
        const s = series[k];
        const v = Number(s.values?.[i]) || 0;
        bars.push({
          seriesId: s.id,
          seriesIndex: k,
          seriesName: s.name,
          color: s.color,
          value: v,
          valueStart: 0,
          valueEnd: v,
          crossStart: groupStart + k * (barThickness + groupGap),
          crossSize: barThickness,
          roundOuter: true,
        });
      }
    }

    const catTotal = bars.reduce((a, b) => a + b.value, 0);

    // Convert to pixel rects.
    const pixelBars = bars.map((b) => {
      const va = valueToPos(b.valueStart);
      const vb = valueToPos(b.valueEnd);
      const valueMin = Math.min(va, vb);
      const valueSize = Math.abs(vb - va);
      const dir = b.valueEnd >= b.valueStart ? 1 : -1;

      const rect = vertical
        ? { x: b.crossStart, y: valueMin, w: b.crossSize, h: valueSize }
        : { x: valueMin, y: b.crossStart, w: valueSize, h: b.crossSize };

      const r = b.roundOuter
        ? Math.max(
            0,
            Math.min(cornerRadius, b.crossSize / 2, Math.max(valueSize, 0) / 2 || cornerRadius)
          )
        : 0;

      let corner = { tl: 0, tr: 0, br: 0, bl: 0 };
      if (r > 0) {
        if (vertical) {
          if (dir > 0) corner = { tl: r, tr: r, br: 0, bl: 0 };
          else corner = { tl: 0, tr: 0, br: r, bl: r };
        } else {
          if (dir > 0) corner = { tl: 0, tr: r, br: r, bl: 0 };
          else corner = { tl: r, tr: 0, br: 0, bl: r };
        }
      }

      const anchor = vertical
        ? { x: rect.x + rect.w / 2, y: dir > 0 ? rect.y : rect.y + rect.h }
        : { x: dir > 0 ? rect.x + rect.w : rect.x, y: rect.y + rect.h / 2 };

      return {
        ...b,
        dir,
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: rect.h,
        corner,
        anchor,
        cx: rect.x + rect.w / 2,
        cy: rect.y + rect.h / 2,
      };
    });

    catList.push({
      index: i,
      label: categories[i]?.label ?? `Item ${i + 1}`,
      id: categories[i]?.id ?? `cat-${i}`,
      center,
      groupStart,
      groupBand,
      bars: pixelBars,
      total: catTotal,
    });
  }

  // ── Legend item positions ────────────────────────────────────────────────
  let legendX = 0;
  let legendY = 0;
  const legendRowPositions = [];
  if (legendVisible) {
    if (legendOnSide) {
      legendX = legendPosition === "left" ? PAD : width - PAD - legendWidth;
      legendY = PAD + titleHeight + 4;
      legendItems.forEach((_, index) => {
        legendRowPositions.push({
          x: legendX,
          y: legendY + index * LEGEND_ROW,
          width: legendWidth,
        });
      });
    } else {
      const startY = legendPosition === "top" ? PAD + titleHeight + 4 : height - PAD - legendHeight;
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
    orientation,
    vertical,
    mode,
    plot: plotRect,
    scale: { min: scale.min, max: scale.max, step: scale.step },
    ticks,
    valueToPos,
    categories: catList,
    bandSize,
    total,
    labelFormat,
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
export function roundedRectPath(x, y, w, h, corner) {
  const maxR = Math.min(w, h) / 2;
  const tl = Math.min(Math.max(corner.tl || 0, 0), maxR);
  const tr = Math.min(Math.max(corner.tr || 0, 0), maxR);
  const br = Math.min(Math.max(corner.br || 0, 0), maxR);
  const bl = Math.min(Math.max(corner.bl || 0, 0), maxR);

  return [
    `M ${x + tl} ${y}`,
    `H ${x + w - tr}`,
    tr ? `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr}` : `L ${x + w} ${y}`,
    `V ${y + h - br}`,
    br ? `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h}` : `L ${x + w} ${y + h}`,
    `H ${x + bl}`,
    bl ? `A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl}` : `L ${x} ${y + h}`,
    `V ${y + tl}`,
    tl ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : `L ${x} ${y}`,
    "Z",
  ].join(" ");
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
export function dataToCsv(categories, series, fmtOptions = {}) {
  const header = ["Category", ...series.map((s) => `"${String(s.name).replace(/"/g, '""')}"`)];
  const rows = categories.map((cat, i) => [
    `"${String(cat.label ?? "").replace(/"/g, '""')}"`,
    ...series.map((s) => String(Number(s.values?.[i]) || 0)),
  ]);
  const totals = [
    "Total",
    ...series.map((s) => String(s.values.reduce((a, v) => a + (Number(v) || 0), 0))),
  ];
  return [header, ...rows, totals].map((row) => row.join(",")).join("\n");
}
