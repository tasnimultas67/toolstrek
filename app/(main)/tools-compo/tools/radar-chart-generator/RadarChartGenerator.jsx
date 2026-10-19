"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  Radar,
  Palette,
  Table2,
  SlidersHorizontal,
  Tag,
  ListTree,
  Plus,
  Trash2,
  RotateCcw,
  RotateCw,
  Dices,
  Download,
  Copy,
  Check,
  Sparkles,
  Info,
  ChevronDown,
  FileJson,
  FileSpreadsheet,
  ImageDown,
  Spline,
  Eye,
  EyeOff,
  Sun,
  Moon,
  TrendingUp,
  Layers,
  Ruler,
  ArrowUpDown,
  Target,
  Hexagon,
  Circle,
  Gauge,
} from "lucide-react";
import ToolPageShell from "../../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "@/components/BackButton";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  GRID_SHAPES,
  SCALE_MODES,
  DIRECTIONS,
  VALUE_LABEL_FORMATS,
  LEGEND_POSITIONS,
  PALETTES,
  RADAR_FAQS,
  SAMPLE_DATASETS,
  DEFAULT_DATASET_ID,
  DEFAULT_PALETTE_ID,
  getPaletteColor,
} from "./radarChartData";
import {
  formatValue,
  getPointLabelText,
  seriesToCsv,
  truncateText,
  DEFAULT_CHART_HEIGHT,
  DEFAULT_CHART_WIDTH,
} from "./radarChartEngine";

import ChartDataImport from "../_shared/ChartDataImport";
import ChartPreview from "../_shared/charts/ChartPreview";
import RadarChartView from "../_shared/charts/RadarChartView";
import {
  downloadChartPng,
  downloadChartSvg,
  serializeChartSvg,
} from "../_shared/charts/chartExport";

// Client-only id generator used for rows/series added after mount. It is never
// called during SSR, so Date.now() here cannot cause a hydration mismatch.
let idCounter = 0;
const createId = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${idCounter++}`;

const DEFAULT_DATASET =
  SAMPLE_DATASETS.find((d) => d.id === DEFAULT_DATASET_ID) || SAMPLE_DATASETS[0];

// Deterministic, SSR-safe ids for the *initial* dataset so the server and the
// client render exactly the same markup.
function makeFromDataset(dataset, paletteId = DEFAULT_PALETTE_ID) {
  const axes = dataset.axes.map((label, index) => ({
    id: `axis-init-${index}`,
    label,
  }));
  const series = dataset.series.map((s, index) => ({
    id: `ser-init-${index}`,
    name: s.name,
    color: getPaletteColor(paletteId, index),
    visible: true,
    values: axes.map((_, i) => Number(s.values?.[i]) || 0),
  }));
  return { axes, series };
}

const CONTROL_TABS = [
  { id: "data", label: "Data", icon: Table2 },
  { id: "style", label: "Style", icon: SlidersHorizontal },
  { id: "grid", label: "Grid", icon: Hexagon },
  { id: "labels", label: "Labels", icon: Tag },
  { id: "legend", label: "Legend", icon: ListTree },
];

const SORT_LABEL = { none: "Original", desc: "Highest", asc: "Lowest" };

export default function RadarChartGenerator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Radar Chart Generator",
      link: "/tools/radar-chart-generator",
      icon: "Radar",
    });
  }, [addRecentTool]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const initial = useMemo(
    () => makeFromDataset(DEFAULT_DATASET, DEFAULT_PALETTE_ID),
    []
  );
  const [axes, setAxes] = useState(initial.axes);
  const [series, setSeries] = useState(initial.series);
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);
  const [sortMode, setSortMode] = useState("none");

  // ── Chart style ────────────────────────────────────────────────────────────
  const [filled, setFilled] = useState(true);
  const [fillOpacity, setFillOpacity] = useState(0.24);
  const [gradient, setGradient] = useState(true);
  const [strokeWidth, setStrokeWidth] = useState(2.2);
  const [showPoints, setShowPoints] = useState(true);
  const [pointRadius, setPointRadius] = useState(4);
  const [curved, setCurved] = useState(false);
  const [shadow, setShadow] = useState(false);

  // ── Grid / scale ───────────────────────────────────────────────────────────
  const [gridShape, setGridShape] = useState("polygon");
  const [levels, setLevels] = useState(5);
  const [showGrid, setShowGrid] = useState(true);
  const [showOuterRing, setShowOuterRing] = useState(true);
  const [showAxisLines, setShowAxisLines] = useState(true);
  const [showAxisLabels, setShowAxisLabels] = useState(true);
  const [showTickLabels, setShowTickLabels] = useState(true);
  const [startAngle, setStartAngle] = useState(0);
  const [direction, setDirection] = useState("cw");
  const [scaleMode, setScaleMode] = useState("auto");
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(100);

  // ── Labels / number format ─────────────────────────────────────────────────
  const [valueLabelFormat, setValueLabelFormat] = useState("value");
  const [decimals, setDecimals] = useState(0);
  const [useThousands, setUseThousands] = useState(true);
  const [compact, setCompact] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  // ── Legend ─────────────────────────────────────────────────────────────────
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] = useState("top");
  const [showLegendValues, setShowLegendValues] = useState(false);

  // ── Title ──────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("Product Comparison");
  const [subtitle, setSubtitle] = useState("Score out of 100 · A vs B");

  // ── Canvas / theme ─────────────────────────────────────────────────────────
  const [transparentBg, setTransparentBg] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0f172a");
  const [gridColor, setGridColor] = useState("#e2e8f0");
  const [axisColor, setAxisColor] = useState("#cbd5e1");
  const [chartWidth, setChartWidth] = useState(DEFAULT_CHART_WIDTH);
  const [chartHeight, setChartHeight] = useState(DEFAULT_CHART_HEIGHT);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("data");
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [pngScale, setPngScale] = useState(2);
  const [openFaq, setOpenFaq] = useState(0);

  const chartRef = useRef(null);

  // ── Ordered axes (sort) ────────────────────────────────────────────────────
  const { orderedAxes, visibleSeries } = useMemo(() => {
    const visible = series.filter((s) => s.visible !== false);
    const totals = axes.map((_, i) =>
      visible.reduce((a, s) => a + (Number(s.values[i]) || 0), 0)
    );
    const indices = axes.map((_, i) => i);
    if (sortMode === "desc") indices.sort((a, b) => totals[b] - totals[a]);
    else if (sortMode === "asc") indices.sort((a, b) => totals[a] - totals[b]);

    const ordAxes = indices.map((i) => axes[i]);
    const ordSeries = visible.map((s) => ({
      ...s,
      values: indices.map((i) => Number(s.values[i]) || 0),
    }));
    return { orderedAxes: ordAxes, visibleSeries: ordSeries };
  }, [axes, series, sortMode]);

  const allValues = useMemo(
    () => visibleSeries.flatMap((s) => s.values.map((v) => Number(v) || 0)),
    [visibleSeries]
  );
  const maxValue = allValues.length ? Math.max(...allValues) : 0;
  const avgValue = allValues.length
    ? allValues.reduce((a, v) => a + v, 0) / allValues.length
    : 0;

  const fmtOptions = useMemo(
    () => ({ thousands: useThousands, compact, prefix, suffix }),
    [useThousands, compact, prefix, suffix]
  );

  const seriesMeans = useMemo(
    () =>
      visibleSeries.map((s) =>
        s.values.length
          ? s.values.reduce((a, v) => a + (Number(v) || 0), 0) / s.values.length
          : 0
      ),
    [visibleSeries]
  );

  // ── Data handlers ──────────────────────────────────────────────────────────
  const addAxis = () => {
    if (axes.length >= 12) {
      toast.info("12 axes is the maximum — keep radar charts readable!");
      return;
    }
    setAxes((prev) => [
      ...prev,
      { id: createId("axis"), label: `Axis ${prev.length + 1}` },
    ]);
    setSeries((prev) =>
      prev.map((s) => ({ ...s, values: [...s.values, 50] }))
    );
    toast.success("Axis added");
  };

  const removeAxis = (index) => {
    if (axes.length <= 3) {
      toast.error("A radar chart needs at least 3 axes.");
      return;
    }
    setAxes((prev) => prev.filter((_, i) => i !== index));
    setSeries((prev) =>
      prev.map((s) => ({ ...s, values: s.values.filter((_, i) => i !== index) }))
    );
  };

  const updateAxisLabel = (index, label) =>
    setAxes((prev) => prev.map((a, i) => (i === index ? { ...a, label } : a)));

  const addSeries = () => {
    if (series.length >= 6) {
      toast.info("6 series is the maximum for a readable chart.");
      return;
    }
    const index = series.length;
    setSeries((prev) => [
      ...prev,
      {
        id: createId("ser"),
        name: `Series ${index + 1}`,
        color: getPaletteColor(paletteId, index),
        visible: true,
        values: axes.map(() => 50),
      },
    ]);
    toast.success("Series added");
  };

  const removeSeries = (id) => {
    if (series.length <= 1) {
      toast.error("Keep at least one data series.");
      return;
    }
    setSeries((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSeriesVisibility = (id) =>
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );

  const updateSeriesName = (id, name) =>
    setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));

  const updateSeriesColor = (id, color) =>
    setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));

  const updateSeriesValue = (id, index, value) =>
    setSeries((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const values = [...s.values];
        values[index] = value;
        return { ...s, values };
      })
    );

  const applyPalette = useCallback((id) => {
    setPaletteId(id);
    setSeries((prev) =>
      prev.map((s, index) => ({ ...s, color: getPaletteColor(id, index) }))
    );
  }, []);

  const loadDataset = (dataset) => {
    const next = makeFromDataset(dataset, paletteId);
    setAxes(next.axes);
    setSeries(next.series);
    setTitle(dataset.name);
    setSubtitle(dataset.unit || "");
    setSortMode("none");
    toast.success(`Loaded “${dataset.name}”`);
  };

  // ── CSV / Excel import ─────────────────────────────────────────────────────
  // The first column becomes the axes; every chosen numeric column becomes a
  // series, coloured from the active palette.
  const handleImportedData = useCallback(
    ({ categories: labels, series: importedSeries, fileName }) => {
      setAxes(labels.map((label) => ({ id: createId("axis"), label })));
      setSeries(
        importedSeries.map((s, index) => ({
          id: createId("ser"),
          name: s.name,
          color: getPaletteColor(paletteId, index),
          visible: true,
          values: s.values,
        }))
      );
      const baseName = String(fileName || "").replace(/\.[^.]+$/, "").trim();
      setTitle(baseName || `${labels.length} axes`);
      setSubtitle(
        `${labels.length} axes · ${importedSeries.length} series · imported`
      );
      setSortMode("none");
    },
    [paletteId]
  );

  const handleRandomize = () => {
    const randomPalette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    applyPalette(randomPalette.id);
    toast.success(`Random palette: ${randomPalette.name}`);
  };

  const handleCycleSort = () => {
    const order = ["none", "desc", "asc"];
    const next = order[(order.indexOf(sortMode) + 1) % order.length];
    setSortMode(next);
    toast.info(`Sort: ${SORT_LABEL[next]}`);
  };

  const handleReset = () => {
    const next = makeFromDataset(DEFAULT_DATASET, DEFAULT_PALETTE_ID);
    setAxes(next.axes);
    setSeries(next.series);
    setPaletteId(DEFAULT_PALETTE_ID);
    setSortMode("none");
    setFilled(true);
    setFillOpacity(0.24);
    setGradient(true);
    setStrokeWidth(2.2);
    setShowPoints(true);
    setPointRadius(4);
    setCurved(false);
    setShadow(false);
    setGridShape("polygon");
    setLevels(5);
    setShowGrid(true);
    setShowOuterRing(true);
    setShowAxisLines(true);
    setShowAxisLabels(true);
    setShowTickLabels(true);
    setStartAngle(0);
    setDirection("cw");
    setScaleMode("auto");
    setCustomMin(0);
    setCustomMax(100);
    setValueLabelFormat("value");
    setDecimals(0);
    setUseThousands(true);
    setCompact(false);
    setPrefix("");
    setSuffix("");
    setShowLegend(true);
    setLegendPosition("top");
    setShowLegendValues(false);
    setTitle("Product Comparison");
    setSubtitle("Score out of 100 · A vs B");
    setTransparentBg(false);
    setBgColor("#ffffff");
    setTextColor("#0f172a");
    setGridColor("#e2e8f0");
    setAxisColor("#cbd5e1");
    toast.info("Reset to defaults");
  };

  const applyTheme = (theme) => {
    if (theme === "light") {
      setTransparentBg(false);
      setBgColor("#ffffff");
      setTextColor("#0f172a");
      setGridColor("#e2e8f0");
      setAxisColor("#cbd5e1");
    } else if (theme === "dark") {
      setTransparentBg(false);
      setBgColor("#0b1220");
      setTextColor("#f8fafc");
      setGridColor("#1e293b");
      setAxisColor("#334155");
    } else {
      setTransparentBg(true);
      setTextColor("#0f172a");
      setGridColor("#cbd5e1");
      setAxisColor("#94a3b8");
    }
  };

  // ── Export handlers ────────────────────────────────────────────────────────
  const handleCopySvg = async () => {
    try {
      const markup = serializeChartSvg(getExportOptions());
      await navigator.clipboard.writeText(markup);
      setCopiedSvg(true);
      toast.success("SVG markup copied to clipboard");
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch {
      toast.error("Could not copy the SVG markup.");
    }
  };

  const handleCopyCsv = async () => {
    try {
      const csv = seriesToCsv(orderedAxes, visibleSeries);
      await navigator.clipboard.writeText(csv);
      setCopiedData(true);
      toast.success("Chart data copied as CSV");
      setTimeout(() => setCopiedData(false), 2000);
    } catch {
      toast.error("Could not copy the chart data.");
    }
  };

  const handleDownloadPng = async () => {
    try {
      await downloadChartPng(getExportOptions(), "radar-chart.png", pngScale);
      toast.success(`PNG downloaded at ${pngScale}× resolution`);
    } catch {
      toast.error("PNG export failed — try the SVG download instead.");
    }
  };

  const handleDownloadSvg = () => {
    try {
      downloadChartSvg(getExportOptions(), "radar-chart.svg");
      toast.success("SVG downloaded");
    } catch {
      toast.error("SVG export failed.");
    }
  };

  const downloadBlobFile = (content, type, filename, message) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast.success(message);
  };

  const handleDownloadCsv = () => {
    downloadBlobFile(
      seriesToCsv(orderedAxes, visibleSeries),
      "text/csv;charset=utf-8",
      "radar-chart-data.csv",
      "CSV downloaded"
    );
  };

  const handleDownloadJson = () => {
    const payload = {
      title,
      subtitle,
      unit: subtitle,
      scale: scaleMode,
      axes: orderedAxes.map((a) => a.label),
      series: visibleSeries.map((s) => ({
        name: s.name,
        color: s.color,
        values: s.values,
      })),
      max: maxValue,
      average: Number(avgValue.toFixed(2)),
    };
    downloadBlobFile(
      JSON.stringify(payload, null, 2),
      "application/json",
      "radar-chart-data.json",
      "JSON downloaded"
    );
  };

  const toolInfo = {
    title: "Radar Chart Generator",
    link: "/tools/radar-chart-generator",
  };

  const mutedColor = textColor === "#f8fafc" ? "#94a3b8" : "#64748b";
  const hasChartData = orderedAxes.length >= 3 && visibleSeries.length > 0;
  const activeGridShape = GRID_SHAPES.find((g) => g.id === gridShape);
  const activeScale = SCALE_MODES.find((s) => s.id === scaleMode);

  // ── Legend items (mean per series — radar scales are per-axis) ─────────────
  const legendItems = useMemo(
    () =>
      visibleSeries.map((s, index) => ({
        id: s.id,
        label: s.name,
        color: s.color,
        value: showLegendValues
          ? formatValue(seriesMeans[index], { ...fmtOptions, decimals })
          : undefined,
      })),
    [visibleSeries, seriesMeans, showLegendValues, fmtOptions, decimals]
  );

  const formatTick = useCallback(
    (value) => formatValue(value, { ...fmtOptions, decimals }),
    [fmtOptions, decimals]
  );

  const formatLabel = useCallback(
    (value, domainMax) =>
      getPointLabelText(
        { value },
        valueLabelFormat,
        decimals,
        domainMax,
        fmtOptions
      ),
    [valueLabelFormat, decimals, fmtOptions]
  );

  const getExportOptions = useCallback(
    () => ({
      container: chartRef.current,
      width: chartWidth,
      height: chartHeight,
      title,
      subtitle,
      legendItems,
      legendPosition: showLegend ? legendPosition : "none",
      showLegendValues,
      bgColor,
      transparentBg,
      textColor,
      mutedColor,
    }),
    [
      chartWidth,
      chartHeight,
      title,
      subtitle,
      legendItems,
      showLegend,
      legendPosition,
      showLegendValues,
      bgColor,
      transparentBg,
      textColor,
      mutedColor,
    ]
  );

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 w-full mx-auto mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BackButton className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 transition-all cursor-pointer" />
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs font-semibold text-brandColor">
              Design &amp; Data Viz Tools
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Apply a random colour palette"
            >
              <Dices className="w-3.5 h-3.5 text-brandColor" />
              <span>Random Palette</span>
            </button>

            <button
              type="button"
              onClick={handleCycleSort}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                sortMode !== "none"
                  ? "bg-brandColor text-white border-brandColor"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
              title="Cycle axis sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort: {SORT_LABEL[sortMode]}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset</span>
            </button>

            <FavoriteButton
              tool={toolInfo}
              className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            />
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-brandColor/10 dark:bg-brandColor/20 text-brandColor mb-3">
            <Radar className="w-3.5 h-3.5 text-brandColor" />
            <span>Radar &amp; Spider Chart Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Radar Chart Generator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Turn a set of dimensions into a clean, presentation-ready radar or
            spider chart. Compare multiple profiles across the same axes,
            fine-tune the grid, scale, rotation, points and labels, then export a
            crisp PNG or scalable SVG — all 100% in your browser.
          </p>
        </div>
      </div>

      {/* ── Workspace ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left: live chart + export ────────────────────────────────────── */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 flex flex-col gap-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Title / subtitle inputs */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brandColor" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Live Preview
                </span>
                <span className="ml-auto text-[11px] text-gray-400">
                  {activeGridShape?.label} · {activeScale?.label} ·{" "}
                  {visibleSeries.length}{" "}
                  {visibleSeries.length === 1 ? "series" : "series"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Chart title"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brandColor/40 focus:border-brandColor transition-all"
                />
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Subtitle / unit (optional)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-brandColor/40 focus:border-brandColor transition-all"
                />
              </div>
            </div>

            {/* Chart canvas */}
            <div className="p-3 sm:p-4 transition-colors duration-200">
              <ChartPreview
                ref={chartRef}
                title={title}
                subtitle={subtitle}
                legendItems={legendItems}
                legendPosition={showLegend ? legendPosition : "none"}
                showLegendValues={showLegendValues}
                bgColor={bgColor}
                transparentBg={transparentBg}
                textColor={textColor}
                mutedColor={mutedColor}
                width={chartWidth}
                height={chartHeight}
                empty={!hasChartData}
                emptyLabel="Add at least 3 axes and one visible series to render your radar chart"
                emptyIcon={<Radar className="h-9 w-9 stroke-1" />}
                className="rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <RadarChartView
                  axes={orderedAxes}
                  series={visibleSeries}
                  config={{
                    filled,
                    fillOpacity,
                    gradient,
                    strokeWidth,
                    showPoints,
                    pointRadius,
                    curved,
                    shadow,
                    gridShape,
                    levels,
                    showGrid,
                    showOuterRing,
                    showAxisLines,
                    showAxisLabels,
                    showTickLabels,
                    startAngle,
                    direction,
                    scaleMode,
                    customMin,
                    customMax,
                    valueLabelFormat,
                    decimals,
                    textColor,
                    mutedColor,
                    gridColor,
                    axisColor,
                    formatLabel,
                    formatTick,
                    formatTooltip: formatTick,
                  }}
                />
              </ChartPreview>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 text-center">
              <StatCell
                icon={Hexagon}
                label="Axes"
                value={String(orderedAxes.length)}
              />
              <StatCell
                icon={Layers}
                label="Series"
                value={String(visibleSeries.length)}
              />
              <StatCell
                icon={TrendingUp}
                label="Largest"
                value={formatValue(maxValue, { ...fmtOptions, decimals })}
              />
              <StatCell
                icon={Target}
                label="Average"
                value={formatValue(avgValue, { ...fmtOptions, decimals: 1 })}
              />
            </div>
          </div>

          {/* Export toolbar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-brandColor" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Export &amp; Share
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                PNG scale
                <select
                  value={pngScale}
                  onChange={(e) => setPngScale(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-[11px] font-semibold text-gray-700 dark:text-gray-200 cursor-pointer outline-none"
                >
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                  <option value={3}>3×</option>
                  <option value={4}>4×</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <ToolBtn
                icon={ImageDown}
                label="PNG"
                onClick={handleDownloadPng}
                primary
              />
              <ToolBtn icon={Spline} label="SVG" onClick={handleDownloadSvg} />
              <ToolBtn
                icon={copiedSvg ? Check : Copy}
                label={copiedSvg ? "Copied" : "Copy SVG"}
                onClick={handleCopySvg}
              />
              <ToolBtn
                icon={copiedData ? Check : FileSpreadsheet}
                label={copiedData ? "Copied" : "Copy CSV"}
                onClick={handleCopyCsv}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <ToolBtn
                icon={FileSpreadsheet}
                label="Download CSV"
                onClick={handleDownloadCsv}
              />
              <ToolBtn
                icon={FileJson}
                label="Download JSON"
                onClick={handleDownloadJson}
              />
            </div>
          </div>
        </div>

        {/* ── Right: controls ──────────────────────────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 p-1.5 bg-gray-50/70 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
              {CONTROL_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? "bg-brandColor text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-5">
              {activeTab === "data" && (
                <DataPanel
                  axes={axes}
                  series={series}
                  paletteId={paletteId}
                  addAxis={addAxis}
                  removeAxis={removeAxis}
                  updateAxisLabel={updateAxisLabel}
                  addSeries={addSeries}
                  removeSeries={removeSeries}
                  toggleSeriesVisibility={toggleSeriesVisibility}
                  updateSeriesName={updateSeriesName}
                  updateSeriesColor={updateSeriesColor}
                  updateSeriesValue={updateSeriesValue}
                  applyPalette={applyPalette}
                  loadDataset={loadDataset}
                  onImport={handleImportedData}
                />
              )}

              {activeTab === "style" && (
                <StylePanel
                  filled={filled}
                  setFilled={setFilled}
                  fillOpacity={fillOpacity}
                  setFillOpacity={setFillOpacity}
                  gradient={gradient}
                  setGradient={setGradient}
                  strokeWidth={strokeWidth}
                  setStrokeWidth={setStrokeWidth}
                  showPoints={showPoints}
                  setShowPoints={setShowPoints}
                  pointRadius={pointRadius}
                  setPointRadius={setPointRadius}
                  curved={curved}
                  setCurved={setCurved}
                  shadow={shadow}
                  setShadow={setShadow}
                  transparentBg={transparentBg}
                  setTransparentBg={setTransparentBg}
                  bgColor={bgColor}
                  setBgColor={setBgColor}
                  textColor={textColor}
                  setTextColor={setTextColor}
                  applyTheme={applyTheme}
                  chartWidth={chartWidth}
                  setChartWidth={setChartWidth}
                  chartHeight={chartHeight}
                  setChartHeight={setChartHeight}
                />
              )}

              {activeTab === "grid" && (
                <GridPanel
                  gridShape={gridShape}
                  setGridShape={setGridShape}
                  levels={levels}
                  setLevels={setLevels}
                  showGrid={showGrid}
                  setShowGrid={setShowGrid}
                  showOuterRing={showOuterRing}
                  setShowOuterRing={setShowOuterRing}
                  showAxisLines={showAxisLines}
                  setShowAxisLines={setShowAxisLines}
                  showAxisLabels={showAxisLabels}
                  setShowAxisLabels={setShowAxisLabels}
                  showTickLabels={showTickLabels}
                  setShowTickLabels={setShowTickLabels}
                  startAngle={startAngle}
                  setStartAngle={setStartAngle}
                  direction={direction}
                  setDirection={setDirection}
                  scaleMode={scaleMode}
                  setScaleMode={setScaleMode}
                  customMin={customMin}
                  setCustomMin={setCustomMin}
                  customMax={customMax}
                  setCustomMax={setCustomMax}
                  gridColor={gridColor}
                  setGridColor={setGridColor}
                  axisColor={axisColor}
                  setAxisColor={setAxisColor}
                />
              )}

              {activeTab === "labels" && (
                <LabelsPanel
                  valueLabelFormat={valueLabelFormat}
                  setValueLabelFormat={setValueLabelFormat}
                  decimals={decimals}
                  setDecimals={setDecimals}
                  useThousands={useThousands}
                  setUseThousands={setUseThousands}
                  compact={compact}
                  setCompact={setCompact}
                  prefix={prefix}
                  setPrefix={setPrefix}
                  suffix={suffix}
                  setSuffix={setSuffix}
                />
              )}

              {activeTab === "legend" && (
                <LegendPanel
                  showLegend={showLegend}
                  setShowLegend={setShowLegend}
                  legendPosition={legendPosition}
                  setLegendPosition={setLegendPosition}
                  showLegendValues={showLegendValues}
                  setShowLegendValues={setShowLegendValues}
                />
              )}
            </div>
          </div>

          {/* Quick info about the current chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-brandColor" />
            Currently rendering a{" "}
            <strong className="text-gray-700 dark:text-gray-200">
              {activeGridShape?.label.toLowerCase()}
            </strong>{" "}
            radar chart with {orderedAxes.length} axes and{" "}
            {visibleSeries.length} visible series.
          </div>
        </div>
      </div>

      {/* ── Educational guide + FAQ ────────────────────────────────────────── */}
      <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-12">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-brandColor/10 dark:bg-brandColor/20 text-brandColor mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Anatomy of a great radar chart</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Reading &amp; designing radar charts that work
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A quick reference on axes, scale and overlap to build clear,
              honest spider charts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GuideCard
              accent="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
              badge="3–8"
              title="Keep axes few"
              body="Radar charts read best with three to eight axes. Beyond that the polygon becomes spiky and hard to compare — fold minor dimensions together or switch to a bar chart."
            />
            <GuideCard
              accent="bg-violet-50 dark:bg-violet-950/60 text-brandColor"
              badge="⌖"
              title="Anchor at zero"
              body="Always start the scale at zero so the shape stays proportional. Auto fit and the 0–100 mode both guarantee a zero baseline for honest, comparable profiles."
            />
            <GuideCard
              accent="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
              badge="≡"
              title="Order logically"
              body="Group related axes next to each other, or sort them by score so the strongest dimensions cluster together. Rotate the start angle to put the most important axis at 12 o'clock."
            />
            <GuideCard
              accent="bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400"
              badge="◍"
              title="Limit overlap"
              body="Overlay at most two or three series and keep the fill translucent. Remember that polygon area is not proportional to the total, so read shape and balance, not size."
            />
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Everything you need to know about creating radar and spider charts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {RADAR_FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    className="w-full flex items-center justify-between gap-4 text-left px-4 py-4 cursor-pointer"
                  >
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <p className="px-4 pb-4 -mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}

// ─── Small UI atoms ──────────────────────────────────────────────────────────
function StatCell({ icon: Icon, label, value, hint }) {
  return (
    <div className="px-3 py-3">
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
      <div
        className="mt-1 text-base font-extrabold text-gray-900 dark:text-white truncate"
        title={hint || value}
      >
        {value}
      </div>
    </div>
  );
}

function ToolBtn({ icon: Icon, label, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
        primary
          ? "bg-brandColor hover:bg-brandColorHover text-white shadow-xs"
          : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-brandColor" />
      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
        {children}
      </h3>
    </div>
  );
}

function GuideCard({ accent, badge, title, body }) {
  return (
    <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div
        className={`w-10 h-8 rounded-lg flex items-center justify-center font-bold text-xs mb-3 ${accent}`}
      >
        {badge}
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
        {body}
      </p>
    </div>
  );
}

// ─── Data panel ──────────────────────────────────────────────────────────────
function DataPanel({
  axes,
  series,
  paletteId,
  addAxis,
  removeAxis,
  updateAxisLabel,
  addSeries,
  removeSeries,
  toggleSeriesVisibility,
  updateSeriesName,
  updateSeriesColor,
  updateSeriesValue,
  applyPalette,
  loadDataset,
  onImport,
}) {
  const gridTemplate = `minmax(96px, 1.3fr) repeat(${
    series.length
  }, minmax(52px, 62px)) 28px`;

  return (
    <div className="flex flex-col gap-6">
      {/* CSV / Excel import */}
      <ChartDataImport onImport={onImport} mode="multi" subject="radar chart" />

      {/* Sample datasets */}
      <div>
        <SectionLabel icon={Sparkles}>Sample datasets</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_DATASETS.map((dataset) => (
            <button
              key={dataset.id}
              type="button"
              onClick={() => loadDataset(dataset)}
              className="px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:border-brandColor/50 hover:text-brandColor transition-all cursor-pointer"
            >
              {dataset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Palette */}
      <div>
        <SectionLabel icon={Palette}>Colour palette</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {PALETTES.map((palette) => {
            const active = palette.id === paletteId;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => applyPalette(palette.id)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? "border-brandColor bg-brandColor/5"
                    : "border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                <span className="flex -space-x-1">
                  {palette.colors.slice(0, 4).map((color) => (
                    <span
                      key={color}
                      className="w-4 h-4 rounded-full border border-white dark:border-gray-900"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    active ? "text-brandColor" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {palette.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Series manager */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={Layers}>Series ({series.length})</SectionLabel>
          <button
            type="button"
            onClick={addSeries}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brandColor/10 hover:bg-brandColor/20 text-brandColor text-[11px] font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add series
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {series.map((s, index) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 ${
                s.visible === false ? "opacity-55" : ""
              }`}
            >
              <input
                type="color"
                value={s.color}
                onChange={(e) => updateSeriesColor(s.id, e.target.value)}
                className="w-7 h-7 rounded-lg border-0 bg-transparent p-0 cursor-pointer shrink-0"
                title="Series colour"
              />
              <input
                type="text"
                value={s.name}
                onChange={(e) => updateSeriesName(s.id, e.target.value)}
                placeholder={`Series ${index + 1}`}
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
              />
              <button
                type="button"
                onClick={() => toggleSeriesVisibility(s.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-brandColor hover:bg-brandColor/10 transition-all cursor-pointer shrink-0"
                title={s.visible === false ? "Show series" : "Hide series"}
              >
                {s.visible === false ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => removeSeries(s.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer shrink-0"
                title="Delete series"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Axis matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={Hexagon}>Axes ({axes.length})</SectionLabel>
          <button
            type="button"
            onClick={addAxis}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brandColor/10 hover:bg-brandColor/20 text-brandColor text-[11px] font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add axis
          </button>
        </div>

        <div className="overflow-x-auto -mx-1 px-1">
          <div className="min-w-[300px] flex flex-col gap-2">
            {/* Header row */}
            <div
              className="grid items-center gap-2 px-1"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Axis
              </span>
              {series.map((s) => (
                <span
                  key={s.id}
                  className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate text-right"
                  title={s.name}
                >
                  {truncateText(s.name, 6)}
                </span>
              ))}
              <span />
            </div>

            {axes.map((ax, i) => (
              <div
                key={ax.id}
                className="grid items-center gap-2 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <input
                  type="text"
                  value={ax.label}
                  onChange={(e) => updateAxisLabel(i, e.target.value)}
                  placeholder="Label"
                  className="w-full min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                />
                {series.map((s) => (
                  <input
                    key={s.id}
                    type="number"
                    value={s.values[i] ?? 0}
                    onChange={(e) =>
                      updateSeriesValue(
                        s.id,
                        i,
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono text-right text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                    title={`${s.name} · ${ax.label}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => removeAxis(i)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer flex items-center justify-center"
                  title="Delete axis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1">
          <span>
            {axes.length} axes × {series.length}{" "}
            {series.length === 1 ? "series" : "series"}
          </span>
          <span className="text-gray-400">Values scale from the shared axis</span>
        </div>
      </div>
    </div>
  );
}

// ─── Style panel ─────────────────────────────────────────────────────────────
function StylePanel({
  filled,
  setFilled,
  fillOpacity,
  setFillOpacity,
  gradient,
  setGradient,
  strokeWidth,
  setStrokeWidth,
  showPoints,
  setShowPoints,
  pointRadius,
  setPointRadius,
  curved,
  setCurved,
  shadow,
  setShadow,
  transparentBg,
  setTransparentBg,
  bgColor,
  setBgColor,
  textColor,
  setTextColor,
  applyTheme,
  chartWidth,
  setChartWidth,
  chartHeight,
  setChartHeight,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ToggleRow
          label="Fill the area under each series"
          checked={filled}
          onChange={setFilled}
        />
        <ToggleRow
          label="Gradient area fill"
          checked={gradient}
          onChange={setGradient}
        />
        <ToggleRow
          label="Show vertex points"
          checked={showPoints}
          onChange={setShowPoints}
        />
        <ToggleRow
          label="Smooth (curved) outline"
          checked={curved}
          onChange={setCurved}
        />
        <ToggleRow
          label="Drop shadow on series"
          checked={shadow}
          onChange={setShadow}
        />
      </div>

      {filled && (
        <RangeControl
          label="Area opacity"
          hint="Fill transparency"
          value={Math.round(fillOpacity * 100)}
          min={4}
          max={80}
          step={2}
          suffix="%"
          onChange={(v) => setFillOpacity(v / 100)}
        />
      )}

      <RangeControl
        label="Line width"
        hint="Series outline thickness"
        value={strokeWidth}
        min={1}
        max={6}
        step={0.2}
        suffix="px"
        onChange={setStrokeWidth}
      />

      {showPoints && (
        <RangeControl
          label="Point size"
          hint="Vertex marker radius"
          value={pointRadius}
          min={2}
          max={10}
          step={0.5}
          suffix="px"
          onChange={setPointRadius}
        />
      )}

      <div>
        <SectionLabel icon={Sun}>Canvas theme</SectionLabel>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <ThemeBtn label="Light" icon={Sun} onClick={() => applyTheme("light")} />
          <ThemeBtn label="Dark" icon={Moon} onClick={() => applyTheme("dark")} />
          <ThemeBtn
            label="Transparent"
            icon={Eye}
            onClick={() => applyTheme("transparent")}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Background"
            value={bgColor}
            onChange={setBgColor}
            disabled={transparentBg}
          />
          <ColorField label="Text" value={textColor} onChange={setTextColor} />
        </div>
        <label className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={transparentBg}
            onChange={(e) => setTransparentBg(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-brandColor cursor-pointer"
          />
          Transparent background (ideal for slides &amp; dark mode)
        </label>
      </div>

      <div>
        <SectionLabel icon={SlidersHorizontal}>Export size</SectionLabel>
        <div className="grid grid-cols-1 gap-4">
          <RangeControl
            label="Width"
            value={chartWidth}
            min={440}
            max={1600}
            step={10}
            suffix="px"
            onChange={setChartWidth}
            compact
          />
          <RangeControl
            label="Height"
            value={chartHeight}
            min={360}
            max={1600}
            step={10}
            suffix="px"
            onChange={setChartHeight}
            compact
          />
        </div>
      </div>
    </div>
  );
}

// ─── Grid / scale panel ──────────────────────────────────────────────────────
function GridPanel({
  gridShape,
  setGridShape,
  levels,
  setLevels,
  showGrid,
  setShowGrid,
  showOuterRing,
  setShowOuterRing,
  showAxisLines,
  setShowAxisLines,
  showAxisLabels,
  setShowAxisLabels,
  showTickLabels,
  setShowTickLabels,
  startAngle,
  setStartAngle,
  direction,
  setDirection,
  scaleMode,
  setScaleMode,
  customMin,
  setCustomMin,
  customMax,
  setCustomMax,
  gridColor,
  setGridColor,
  axisColor,
  setAxisColor,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel icon={Hexagon}>Grid shape</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {GRID_SHAPES.map((g) => {
            const active = gridShape === g.id;
            const Icon = g.id === "polygon" ? Hexagon : Circle;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGridShape(g.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor shadow-xs"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-bold">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <RangeControl
        label="Grid levels"
        hint="Concentric rings"
        value={levels}
        min={2}
        max={10}
        step={1}
        onChange={setLevels}
      />

      <RangeControl
        label="Rotation"
        hint="Start angle of the first axis"
        value={startAngle}
        min={0}
        max={355}
        step={5}
        suffix="°"
        onChange={setStartAngle}
      />

      <div>
        <SectionLabel icon={RotateCw}>Direction</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {DIRECTIONS.map((d) => {
            const active = direction === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDirection(d.id)}
                className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel icon={Gauge}>Value scale</SectionLabel>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {SCALE_MODES.map((m) => {
            const active = scaleMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setScaleMode(m.id)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        {scaleMode === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Minimum
              </label>
              <input
                type="number"
                value={customMin}
                onChange={(e) => setCustomMin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Maximum
              </label>
              <input
                type="number"
                value={customMax}
                onChange={(e) => setCustomMax(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <ToggleRow
          label="Show grid rings"
          checked={showGrid}
          onChange={setShowGrid}
        />
        <ToggleRow
          label="Emphasise outer ring"
          checked={showOuterRing}
          onChange={setShowOuterRing}
        />
        <ToggleRow
          label="Show axis spokes"
          checked={showAxisLines}
          onChange={setShowAxisLines}
        />
        <ToggleRow
          label="Show axis labels"
          checked={showAxisLabels}
          onChange={setShowAxisLabels}
        />
        <ToggleRow
          label="Show radial tick values"
          checked={showTickLabels}
          onChange={setShowTickLabels}
        />
      </div>

      <div>
        <SectionLabel icon={Ruler}>Grid colours</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Gridlines" value={gridColor} onChange={setGridColor} />
          <ColorField label="Outer ring" value={axisColor} onChange={setAxisColor} />
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-brandColor" />
        Auto fit rounds the axis outward to tidy values and always starts at zero;
        pick 0–100 for percentage scores or Custom for fixed index ranges.
      </div>
    </div>
  );
}

// ─── Labels panel ────────────────────────────────────────────────────────────
function LabelsPanel({
  valueLabelFormat,
  setValueLabelFormat,
  decimals,
  setDecimals,
  useThousands,
  setUseThousands,
  compact,
  setCompact,
  prefix,
  setPrefix,
  suffix,
  setSuffix,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel icon={Tag}>Vertex label content</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {VALUE_LABEL_FORMATS.map((format) => {
            const active = valueLabelFormat === format.id;
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => setValueLabelFormat(format.id)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                {format.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          Percent is calculated against the current axis maximum.
        </p>
      </div>

      <RangeControl
        label="Decimal places"
        hint="Precision"
        value={decimals}
        min={0}
        max={4}
        step={1}
        onChange={setDecimals}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Value prefix
          </label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="$"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Value suffix
          </label>
          <input
            type="text"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            placeholder="% / pts / K"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <ToggleRow
          label="Thousands separators (1,000)"
          checked={useThousands}
          onChange={setUseThousands}
        />
        <ToggleRow
          label="Compact notation (1.2K, 3.4M)"
          checked={compact}
          onChange={setCompact}
        />
      </div>
    </div>
  );
}

// ─── Legend panel ────────────────────────────────────────────────────────────
function LegendPanel({
  showLegend,
  setShowLegend,
  legendPosition,
  setLegendPosition,
  showLegendValues,
  setShowLegendValues,
}) {
  return (
    <div className="flex flex-col gap-6">
      <ToggleRow
        label="Show legend"
        checked={showLegend}
        onChange={setShowLegend}
      />

      <div>
        <SectionLabel icon={ListTree}>Legend position</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {LEGEND_POSITIONS.map((pos) => {
            const active = legendPosition === pos.id;
            const disabled = !showLegend && pos.id !== "none";
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => setLegendPosition(pos.id)}
                className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                } ${disabled ? "opacity-60" : ""}`}
              >
                {pos.label}
              </button>
            );
          })}
        </div>
      </div>

      <ToggleRow
        label="Show series total next to each entry"
        checked={showLegendValues}
        onChange={setShowLegendValues}
      />

      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-brandColor" />
        Two or three series read best on top or bottom; move the legend to the
        right or left when you have several series or long names.
      </div>
    </div>
  );
}

// ─── Reusable form atoms ─────────────────────────────────────────────────────
function RangeControl({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
  compact,
}) {
  return (
    <div
      className={
        compact
          ? ""
          : "p-3 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800"
      }
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
          {label}
          {hint && (
            <span className="ml-1.5 text-[10px] font-medium text-gray-400">
              {hint}
            </span>
          )}
        </span>
        <span className="font-mono text-[11px] font-semibold text-brandColor">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brandColor"
      />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 cursor-pointer">
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-brandColor cursor-pointer"
      />
    </label>
  );
}

function ColorField({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-1.5 bg-white dark:bg-gray-900 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value.toUpperCase()}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-[11px] font-mono uppercase text-gray-800 dark:text-gray-200 bg-transparent outline-none"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function ThemeBtn({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 hover:border-brandColor/40 text-[11px] font-semibold text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
