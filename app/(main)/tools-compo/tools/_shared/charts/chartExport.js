// Browser-only export helpers for the Recharts previews.
//
// The live chart is rendered by Recharts into a measured <svg>. To export a
// complete, self-contained image we clone that surface into a fresh SVG and
// add the title, subtitle, background and legend. The resulting document is
// used for SVG download, clipboard copy and rasterisation to PNG.

import { CHART_FONT, dashArray, estimateTextWidth } from "./chartTheme";

const PAD = 26;
const LEGEND_ROW = 24;
const LEGEND_GAP = 18;

export function getChartSurface(container) {
  if (!container) return null;
  if (container.tagName?.toLowerCase() === "svg") return container;
  return container.querySelector?.("svg.recharts-surface") ?? null;
}

function getSurfaceSize(surface) {
  const viewBox = surface.viewBox?.baseVal;
  if (viewBox?.width > 0 && viewBox?.height > 0) {
    return { width: viewBox.width, height: viewBox.height };
  }
  const attrWidth = Number(surface.getAttribute("width"));
  const attrHeight = Number(surface.getAttribute("height"));
  if (attrWidth > 0 && attrHeight > 0) {
    return { width: attrWidth, height: attrHeight };
  }
  const rect = surface.getBoundingClientRect?.();
  return {
    width: Math.max(1, rect?.width || 600),
    height: Math.max(1, rect?.height || 360),
  };
}

function svgEl(name, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value != null) node.setAttribute(key, String(value));
  });
  return node;
}

function legendItemWidth(item, showValues = false) {
  const label = String(item?.label ?? "");
  const value = showValues && item?.value != null ? String(item.value) : "";
  return (
    14 +
    7 +
    estimateTextWidth(label, 12.5) +
    (value ? 14 + estimateTextWidth(value, 11.5) : 0)
  );
}

function wrapLegend(items, showValues, maxWidth) {
  const rows = [];
  let row = [];
  let rowWidth = 0;

  items.forEach((item) => {
    const itemWidth = legendItemWidth(item, showValues);
    if (row.length > 0 && rowWidth + LEGEND_GAP + itemWidth > maxWidth) {
      rows.push(row);
      row = [];
      rowWidth = 0;
    }
    row.push({ item, width: itemWidth });
    rowWidth += itemWidth + (row.length > 1 ? LEGEND_GAP : 0);
  });

  if (row.length) rows.push(row);
  return rows;
}

function drawLegendItem(parent, { item, width }, x, y, showValues, colors) {
  const group = svgEl("g");
  group.setAttribute("transform", `translate(${x}, ${y})`);

  const color = item.color || "#64748b";
  const isLine = item.kind === "line" || (item.dash && item.dash !== "solid");

  if (isLine) {
    const line = svgEl("line", {
      x1: 0,
      y1: 7,
      x2: 13,
      y2: 7,
      stroke: color,
      "stroke-width": 2.4,
      "stroke-linecap": "round",
      "stroke-dasharray": dashArray(item.dash),
    });
    group.appendChild(line);
    if (item.kind === "line") {
      group.appendChild(
        svgEl("circle", { cx: 6.5, cy: 7, r: 2.1, fill: color })
      );
    }
  } else {
    group.appendChild(
      svgEl("rect", {
        x: 0,
        y: 2.8,
        width: 10,
        height: 10,
        rx: 2.5,
        fill: color,
      })
    );
  }

  const label = svgEl("text", {
    x: 19,
    y: 11,
    fill: colors.mutedColor,
    "font-size": 12.5,
    "font-weight": 500,
  });
  label.textContent = String(item.label ?? "");
  group.appendChild(label);

  if (showValues && item.value != null) {
    const value = svgEl("text", {
      x: width,
      y: 11,
      fill: colors.textColor,
      "font-size": 11.5,
      "font-weight": 600,
      "text-anchor": "end",
      "font-family": "ui-monospace, SFMono-Regular, Menlo, monospace",
    });
    value.textContent = String(item.value);
    group.appendChild(value);
  }

  parent.appendChild(group);
}

function drawSideLegend(parent, items, x, startY, width, showValues, colors) {
  items.forEach((item, index) => {
    drawLegendItem(
      parent,
      { item, width },
      x,
      startY + index * LEGEND_ROW,
      showValues,
      colors
    );
  });
}

function drawRowLegend(parent, rows, width, startY, showValues, colors) {
  rows.forEach((row, rowIndex) => {
    const total =
      row.reduce((sum, entry) => sum + entry.width, 0) +
      Math.max(0, row.length - 1) * LEGEND_GAP;
    let x = (width - total) / 2;
    const y = startY + rowIndex * LEGEND_ROW;

    row.forEach((entry) => {
      drawLegendItem(parent, entry, x, y, showValues, colors);
      x += entry.width + LEGEND_GAP;
    });
  });
}

// Creates a fully standalone SVG element for the current chart.
export function createChartSvg({
  container,
  width = 760,
  height = 520,
  title,
  subtitle,
  legendItems = [],
  legendPosition = "bottom",
  showLegendValues = false,
  bgColor = "#ffffff",
  transparentBg = false,
  textColor = "#0f172a",
  mutedColor = "#64748b",
  fontFamily = CHART_FONT,
}) {
  const surface = getChartSurface(container);
  if (!surface) {
    throw new Error("Chart surface is not ready yet");
  }

  const surfaceSize = getSurfaceSize(surface);
  const items = legendItems.filter((item) => item?.visible !== false);
  const legendOnSide =
    items.length > 0 &&
    legendPosition !== "none" &&
    (legendPosition === "left" || legendPosition === "right");

  const rowLegend =
    items.length > 0 &&
    (legendPosition === "top" || legendPosition === "bottom")
      ? wrapLegend(items, showLegendValues, width - PAD * 2)
      : [];

  const sideLegendWidth = legendOnSide
    ? Math.min(
        230,
        Math.max(
          140,
          ...items.map((item) => legendItemWidth(item, showLegendValues) + 4)
        )
      )
    : 0;

  const headerHeight = title ? 34 : subtitle ? 24 : 14;
  const titleY = PAD + 4;
  const subtitleY = PAD + 22;

  const topLegendHeight =
    legendPosition === "top" ? rowLegend.length * LEGEND_ROW + 10 : 0;
  const bottomLegendHeight =
    legendPosition === "bottom" ? rowLegend.length * LEGEND_ROW + 8 : 0;

  const plotTop = PAD + headerHeight + topLegendHeight;
  const plotBottom =
    height - PAD - bottomLegendHeight - (legendOnSide ? 0 : 2);

  const leftExtra = legendOnSide && legendPosition === "left" ? sideLegendWidth + 18 : 0;
  const rightExtra = legendOnSide && legendPosition === "right" ? sideLegendWidth + 18 : 0;

  const plotX = PAD + leftExtra;
  const plotY = plotTop;
  const plotWidth = Math.max(40, width - PAD * 2 - leftExtra - rightExtra);
  const plotHeight = Math.max(40, plotBottom - plotTop);

  const root = svgEl("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": title || "Chart",
    "font-family": fontFamily,
  });

  const style = svgEl("style");
  style.textContent = `text { font-family: ${fontFamily}; }`;
  root.appendChild(style);

  if (!transparentBg) {
    root.appendChild(
      svgEl("rect", {
        x: 0,
        y: 0,
        width,
        height,
        fill: bgColor,
      })
    );
  }

  const colors = { textColor, mutedColor };

  if (title) {
    const titleText = svgEl("text", {
      x: width / 2,
      y: titleY + 8,
      "text-anchor": "middle",
      fill: textColor,
      "font-size": 20,
      "font-weight": 700,
      "letter-spacing": "-0.2",
    });
    titleText.textContent = title;
    root.appendChild(titleText);
  }

  if (subtitle) {
    const subtitleText = svgEl("text", {
      x: width / 2,
      y: subtitleY + 8,
      "text-anchor": "middle",
      fill: mutedColor,
      "font-size": 12.5,
      "font-weight": 400,
    });
    subtitleText.textContent = subtitle;
    root.appendChild(subtitleText);
  }

  if (legendPosition === "top" && rowLegend.length) {
    drawRowLegend(
      root,
      rowLegend,
      width,
      PAD + headerHeight + 2,
      showLegendValues,
      colors
    );
  }

  if (legendOnSide) {
    const legendX =
      legendPosition === "left" ? PAD : width - PAD - sideLegendWidth;
    const legendStartY =
      plotTop + Math.max(0, (plotHeight - items.length * LEGEND_ROW) / 2);
    drawSideLegend(
      root,
      items,
      legendX,
      legendStartY,
      sideLegendWidth,
      showLegendValues,
      colors
    );
  }

  // Clone only the chart contents. Recharts has already measured the chart,
  // so scaling it uniformly into the export plot area keeps every axis label
  // and mark intact.
  const clone = surface.cloneNode(true);
  const nested = svgEl("g");
  while (clone.firstChild) {
    nested.appendChild(clone.firstChild);
  }

  const scale = Math.min(
    plotWidth / surfaceSize.width,
    plotHeight / surfaceSize.height
  );
  const tx = plotX + (plotWidth - surfaceSize.width * scale) / 2;
  const ty = plotY + (plotHeight - surfaceSize.height * scale) / 2;

  const chartGroup = svgEl("g", {
    transform: `translate(${tx.toFixed(3)}, ${ty.toFixed(3)}) scale(${scale.toFixed(5)})`,
  });
  chartGroup.appendChild(nested);
  root.appendChild(chartGroup);

  if (legendPosition === "bottom" && rowLegend.length) {
    drawRowLegend(
      root,
      rowLegend,
      width,
      height - PAD - bottomLegendHeight + 8,
      showLegendValues,
      colors
    );
  }

  return root;
}

export function serializeChartSvg(options) {
  const svg = createChartSvg(options);
  const markup = new XMLSerializer().serializeToString(svg);
  return markup.startsWith("<?xml")
    ? markup
    : `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadChartSvg(options, filename = "chart.svg") {
  const markup = serializeChartSvg(options);
  downloadBlob(
    new Blob([markup], { type: "image/svg+xml;charset=utf-8" }),
    filename
  );
}

export function downloadChartPng(options, filename = "chart.png", scale = 2) {
  return new Promise((resolve, reject) => {
    try {
      const { width, height } = options;
      const markup = serializeChartSvg(options);
      const svgBlob = new Blob([markup], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas is unavailable");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("PNG encoding failed"));
              return;
            }
            downloadBlob(blob, filename);
            resolve(true);
          }, "image/png");
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Unable to rasterise the chart"));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}
