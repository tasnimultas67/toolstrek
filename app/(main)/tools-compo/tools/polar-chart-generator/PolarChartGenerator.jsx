"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  Orbit,
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
  Circle,
  PieChart,
  BarChart3,
  AlertTriangle,
  Percent,
  Activity,
  Compass,
} from "lucide-react";
import ToolPageShell from "../../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "@/components/BackButton";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  POLAR_MODES,
  VALUE_SCALES,
  SCALE_MODES,
  DIRECTIONS,
  LABEL_FORMATS,
  LABEL_POSITIONS,
  LEGEND_POSITIONS,
  PALETTES,
  POLAR_FAQS,
  SAMPLE_DATASETS,
  DEFAULT_DATASET_ID,
  DEFAULT_PALETTE_ID,
  getPaletteColor,
} from "./polarChartData";
import {
  computePolarMetrics,
  formatValue,
  getSliceLabelText,
  slicesToCsv,
  slicesToJson,
  truncateText,
  DEFAULT_CHART_HEIGHT,
  DEFAULT_CHART_WIDTH,
} from "./polarChartEngine";
import {
  MAX_IMPORT_ROWS,
} from "../_shared/chartImport";
import ChartDataImport from "../_shared/ChartDataImport";
import ChartPreview from "../_shared/charts/ChartPreview";
import PolarChartView from "../_shared/charts/PolarChartView";
import { resolveScale } from "../_shared/charts/chartTheme";
import {
  downloadChartPng,
  downloadChartSvg,
  serializeChartSvg,
} from "../_shared/charts/chartExport";

// Client-only id generator used for rows added after mount. It is never called
// during SSR, so Date.now() here cannot cause a hydration mismatch.
let idCounter = 0;
const createId = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${idCounter++}`;

const DEFAULT_DATASET =
  SAMPLE_DATASETS.find((d) => d.id === DEFAULT_DATASET_ID) || SAMPLE_DATASETS[0];

// Coerce any user input into a safe, finite, non-negative number.
function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, num) : 0;
}

// Deterministic, SSR-safe ids for the *initial* dataset so the server and the
// client render exactly the same markup.
function makeFromDataset(dataset, paletteId = DEFAULT_PALETTE_ID) {
  return dataset.slices.map((slice, index) => ({
    id: `slice-init-${index}`,
    label: slice.label,
    value: toNumber(slice.value),
    color: getPaletteColor(paletteId, index),
    visible: true,
  }));
}

const CONTROL_TABS = [
  { id: "data", label: "Data", icon: Table2 },
  { id: "shape", label: "Shape", icon: Circle },
  { id: "style", label: "Style", icon: SlidersHorizontal },
  { id: "labels", label: "Labels", icon: Tag },
  { id: "legend", label: "Legend", icon: ListTree },
];

const SORT_LABEL = { none: "Original", desc: "Highest", asc: "Lowest" };

export default function PolarChartGenerator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Polar Chart Generator",
      link: "/tools/polar-chart-generator",
      icon: "Orbit",
    });
  }, [addRecentTool]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const initial = useMemo(
    () => makeFromDataset(DEFAULT_DATASET, DEFAULT_PALETTE_ID),
    []
  );
  const [slices, setSlices] = useState(initial);
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);
  const [sortMode, setSortMode] = useState("none");

  // ── Geometry / shape ───────────────────────────────────────────────────────
  const [mode, setMode] = useState("area");
  const [valueScale, setValueScale] = useState("area");
  const [innerRatio, setInnerRatio] = useState(0);
  const [gap, setGap] = useState(2);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [startAngle, setStartAngle] = useState(0);
  const [direction, setDirection] = useState("cw");
  const [levels, setLevels] = useState(5);
  const [scaleMode, setScaleMode] = useState("auto");
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(100);

  // ── Style ──────────────────────────────────────────────────────────────────
  const [fillOpacity, setFillOpacity] = useState(0.92);
  const [gradient, setGradient] = useState(true);
  const [outline, setOutline] = useState(true);
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [shadow, setShadow] = useState(false);
  const [showCenterTotal, setShowCenterTotal] = useState(true);

  // ── Grid toggles ───────────────────────────────────────────────────────────
  const [showGrid, setShowGrid] = useState(true);
  const [showSpokes, setShowSpokes] = useState(true);
  const [showCategoryLabels, setShowCategoryLabels] = useState(true);
  const [showTickLabels, setShowTickLabels] = useState(true);

  // ── Labels / number format ─────────────────────────────────────────────────
  const [showValueLabels, setShowValueLabels] = useState(true);
  const [labelFormat, setLabelFormat] = useState("value");
  const [labelPosition, setLabelPosition] = useState("inside");
  const [decimals, setDecimals] = useState(0);
  const [useThousands, setUseThousands] = useState(true);
  const [compact, setCompact] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  // ── Legend ─────────────────────────────────────────────────────────────────
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] = useState("right");
  const [showLegendValues, setShowLegendValues] = useState(true);

  // ── Title ──────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(DEFAULT_DATASET.name);
  const [subtitle, setSubtitle] = useState(
    `Sessions per month · ${DEFAULT_DATASET.slices.length} channels`
  );

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

  // ── Ordered + visible slices ───────────────────────────────────────────────
  const orderedSlices = useMemo(() => {
    const visible = slices.filter((s) => s.visible !== false);
    const list = [...visible];
    if (sortMode === "desc") list.sort((a, b) => toNumber(b.value) - toNumber(a.value));
    else if (sortMode === "asc") list.sort((a, b) => toNumber(a.value) - toNumber(b.value));
    return list.map((s) => ({ ...s, value: toNumber(s.value) }));
  }, [slices, sortMode]);

  const metrics = useMemo(() => computePolarMetrics(orderedSlices), [orderedSlices]);

  const fmtOptions = useMemo(
    () => ({ thousands: useThousands, compact, prefix, suffix }),
    [useThousands, compact, prefix, suffix]
  );

  // ── Validation + scale metadata (shared with the JSON export) ──────────────
  const warnings = useMemo(() => {
    const list = [];
    if (orderedSlices.length < 2) {
      list.push("Add at least two categories to draw a polar chart.");
    } else if (metrics.total <= 0) {
      list.push("Enter a value greater than zero to draw the chart.");
    }
    return list;
  }, [orderedSlices.length, metrics.total]);

  const exportScale = useMemo(
    () =>
      resolveScale({
        mode: scaleMode,
        levels,
        customMin,
        customMax,
        maxValue: metrics.max,
      }),
    [scaleMode, levels, customMin, customMax, metrics.max]
  );

  const activeMode = POLAR_MODES.find((m) => m.id === mode);
  const activeValueScale = VALUE_SCALES.find((v) => v.id === valueScale);
  const activeScale = SCALE_MODES.find((s) => s.id === scaleMode);

  // ── Data handlers ──────────────────────────────────────────────────────────
  const addSlice = () => {
    if (slices.length >= 24) {
      toast.info("24 categories is the maximum — keep polar charts readable!");
      return;
    }
    const index = slices.length;
    setSlices((prev) => [
      ...prev,
      {
        id: createId("slice"),
        label: `Category ${index + 1}`,
        value: 10,
        color: getPaletteColor(paletteId, index),
        visible: true,
      },
    ]);
    toast.success("Category added");
  };

  const removeSlice = (id) => {
    if (slices.length <= 2) {
      toast.error("A polar chart needs at least two categories.");
      return;
    }
    setSlices((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSliceLabel = (id, label) =>
    setSlices((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)));

  const updateSliceValue = (id, value) =>
    setSlices((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)));

  const updateSliceColor = (id, color) =>
    setSlices((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));

  const toggleSliceVisibility = (id) =>
    setSlices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );

  const applyPalette = useCallback((id) => {
    setPaletteId(id);
    setSlices((prev) =>
      prev.map((s, index) => ({ ...s, color: getPaletteColor(id, index) }))
    );
  }, []);

  const loadDataset = (dataset) => {
    setSlices(makeFromDataset(dataset, paletteId));
    setTitle(dataset.name);
    setSubtitle(
      `${dataset.unit} · ${dataset.slices.length} ${dataset.slices.length === 1 ? "category" : "categories"}`
    );
    setSortMode("none");
    toast.success(`Loaded “${dataset.name}”`);
  };

  // ── File import ────────────────────────────────────────────────────────────
  // Receives already-validated { label, value } rows from the ChartDataImport
  // and swaps them straight into the live chart with freshly assigned colours.
  const handleImportedRows = useCallback(
    ({ rows, fileName }) => {
      const items = rows.slice(0, MAX_IMPORT_ROWS).map((row, index) => ({
        id: createId("slice"),
        label: row.label,
        value: toNumber(row.value),
        color: getPaletteColor(paletteId, index),
        visible: true,
      }));
      setSlices(items);
      const baseName = String(fileName || "").replace(/\.[^.]+$/, "").trim();
      setTitle(baseName || `${items.length} categories`);
      setSubtitle(`${items.length} categories · imported data`);
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
    setSlices(makeFromDataset(DEFAULT_DATASET, DEFAULT_PALETTE_ID));
    setPaletteId(DEFAULT_PALETTE_ID);
    setSortMode("none");
    setMode("area");
    setValueScale("area");
    setInnerRatio(0);
    setGap(2);
    setCornerRadius(0);
    setStartAngle(0);
    setDirection("cw");
    setLevels(5);
    setScaleMode("auto");
    setCustomMin(0);
    setCustomMax(100);
    setFillOpacity(0.92);
    setGradient(true);
    setOutline(true);
    setStrokeWidth(1.5);
    setShadow(false);
    setShowCenterTotal(true);
    setShowGrid(true);
    setShowSpokes(true);
    setShowCategoryLabels(true);
    setShowTickLabels(true);
    setShowValueLabels(true);
    setLabelFormat("value");
    setLabelPosition("inside");
    setDecimals(0);
    setUseThousands(true);
    setCompact(false);
    setPrefix("");
    setSuffix("");
    setShowLegend(true);
    setLegendPosition("right");
    setShowLegendValues(true);
    setTitle(DEFAULT_DATASET.name);
    setSubtitle(
      `Sessions per month · ${DEFAULT_DATASET.slices.length} channels`
    );
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
  const copyToClipboard = async (text) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Fallback for non-secure contexts / older browsers.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    if (!ok) throw new Error("Clipboard unavailable");
  };

  const handleCopySvg = async () => {
    try {
      const markup = serializeChartSvg(getExportOptions());
      await copyToClipboard(markup);
      setCopiedSvg(true);
      toast.success("SVG markup copied to clipboard");
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch {
      toast.error("Could not copy the SVG markup. Try downloading it instead.");
    }
  };

  const handleCopyCsv = async () => {
    try {
      const csv = slicesToCsv(orderedSlices, metrics.total);
      await copyToClipboard(csv);
      setCopiedData(true);
      toast.success("Chart data copied as CSV");
      setTimeout(() => setCopiedData(false), 2000);
    } catch {
      toast.error("Could not copy the chart data.");
    }
  };

  const handleDownloadPng = async () => {
    try {
      await downloadChartPng(getExportOptions(), "polar-chart.png", pngScale);
      toast.success(`PNG downloaded at ${pngScale}× resolution`);
    } catch {
      toast.error("PNG export failed — try the SVG download instead.");
    }
  };

  const handleDownloadSvg = () => {
    try {
      downloadChartSvg(getExportOptions(), "polar-chart.svg");
      toast.success("SVG downloaded");
    } catch {
      toast.error("SVG export failed.");
    }
  };

  const downloadBlobFile = (content, type, filename, message) => {
    try {
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
    } catch {
      toast.error("Download failed. Please try again.");
    }
  };

  const handleDownloadCsv = () => {
    downloadBlobFile(
      slicesToCsv(orderedSlices, metrics.total),
      "text/csv;charset=utf-8",
      "polar-chart-data.csv",
      "CSV downloaded"
    );
  };

  const handleDownloadJson = () => {
    const payload = slicesToJson({
      title,
      subtitle,
      mode,
      valueScale,
      scale: { mode: scaleMode, min: exportScale.min, max: exportScale.max },
      slices: orderedSlices,
      metrics,
    });
    downloadBlobFile(
      JSON.stringify(payload, null, 2),
      "application/json",
      "polar-chart-data.json",
      "JSON downloaded"
    );
  };

  const toolInfo = {
    title: "Polar Chart Generator",
    link: "/tools/polar-chart-generator",
  };

  const darkText = textColor === "#f8fafc";
  const mutedColor = darkText ? "#94a3b8" : "#64748b";
  const hasChartData = orderedSlices.length >= 2 && metrics.total > 0;

  // ── Legend items (shared by the preview and the export helpers) ────────────
  const legendItems = useMemo(
    () =>
      orderedSlices.map((slice) => ({
        id: slice.id,
        label: slice.label,
        color: slice.color,
        value: showLegendValues
          ? formatValue(slice.value, { ...fmtOptions, decimals })
          : undefined,
      })),
    [orderedSlices, showLegendValues, fmtOptions, decimals]
  );

  const formatTick = useCallback(
    (value) => formatValue(value, { ...fmtOptions, decimals }),
    [fmtOptions, decimals]
  );

  const labelTextFor = useCallback(
    (slice) =>
      getSliceLabelText(
        slice.value,
        labelFormat,
        decimals,
        metrics.total,
        fmtOptions
      ),
    [labelFormat, decimals, metrics.total, fmtOptions]
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
              title="Cycle category sort order"
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
            <Orbit className="w-3.5 h-3.5 text-brandColor" />
            <span>Polar &amp; Rose Chart Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Polar Chart Generator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Turn a list of categories into a clean, presentation-ready polar
            area or rose chart. Choose the honest square-root area scale, add a
            centre hole, fine-tune rings, rotation, gaps and labels, then export
            a crisp PNG or scalable SVG — all 100% in your browser.
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
                <span className="ml-auto text-[11px] text-gray-400 truncate">
                  {activeMode?.label} · {activeValueScale?.label} ·{" "}
                  {activeScale?.label}
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
                emptyLabel="Add at least two categories with values to render your polar chart"
                emptyIcon={<Orbit className="h-9 w-9 stroke-1" />}
                className="rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <PolarChartView
                  slices={orderedSlices}
                  metrics={metrics}
                  config={{
                    mode,
                    valueScale,
                    innerRatio,
                    gap,
                    cornerRadius,
                    startAngle,
                    direction,
                    levels,
                    scaleMode,
                    customMin,
                    customMax,
                    fillOpacity,
                    gradient,
                    outline,
                    strokeWidth,
                    shadow,
                    transparentBg,
                    bgColor,
                    showGrid,
                    showSpokes,
                    showCategoryLabels,
                    showTickLabels,
                    showValueLabels,
                    showCenterTotal,
                    labelFormat,
                    labelPosition,
                    textColor,
                    mutedColor,
                    gridColor,
                    axisColor,
                    formatValue: formatTick,
                    formatTooltip: formatTick,
                    formatTick,
                    labelTextFor,
                  }}
                />
              </ChartPreview>
            </div>

            {/* Validation banner */}
            {warnings.length > 0 && (
              <div className="flex items-start gap-2 px-4 py-3 border-t border-amber-200/70 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300 leading-relaxed">
                  {warnings.join(" ")}
                </p>
              </div>
            )}

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 text-center">
              <StatCell
                icon={Layers}
                label="Categories"
                value={String(orderedSlices.length)}
              />
              <StatCell
                icon={TrendingUp}
                label="Largest"
                value={formatValue(metrics.max, { ...fmtOptions, decimals })}
              />
              <StatCell
                icon={Activity}
                label="Total"
                value={formatValue(metrics.total, { ...fmtOptions, decimals })}
              />
              <StatCell
                icon={Target}
                label="Average"
                value={formatValue(metrics.average, { ...fmtOptions, decimals: 1 })}
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
                  slices={slices}
                  paletteId={paletteId}
                  total={metrics.total}
                  addSlice={addSlice}
                  removeSlice={removeSlice}
                  updateSliceLabel={updateSliceLabel}
                  updateSliceValue={updateSliceValue}
                  updateSliceColor={updateSliceColor}
                  toggleSliceVisibility={toggleSliceVisibility}
                  applyPalette={applyPalette}
                  loadDataset={loadDataset}
                  onImport={handleImportedRows}
                />
              )}

              {activeTab === "shape" && (
                <ShapePanel
                  mode={mode}
                  setMode={setMode}
                  valueScale={valueScale}
                  setValueScale={setValueScale}
                  innerRatio={innerRatio}
                  setInnerRatio={setInnerRatio}
                  gap={gap}
                  setGap={setGap}
                  cornerRadius={cornerRadius}
                  setCornerRadius={setCornerRadius}
                  levels={levels}
                  setLevels={setLevels}
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
                  showGrid={showGrid}
                  setShowGrid={setShowGrid}
                  showSpokes={showSpokes}
                  setShowSpokes={setShowSpokes}
                  showCategoryLabels={showCategoryLabels}
                  setShowCategoryLabels={setShowCategoryLabels}
                  showTickLabels={showTickLabels}
                  setShowTickLabels={setShowTickLabels}
                  showCenterTotal={showCenterTotal}
                  setShowCenterTotal={setShowCenterTotal}
                  gridColor={gridColor}
                  setGridColor={setGridColor}
                  axisColor={axisColor}
                  setAxisColor={setAxisColor}
                />
              )}

              {activeTab === "style" && (
                <StylePanel
                  fillOpacity={fillOpacity}
                  setFillOpacity={setFillOpacity}
                  gradient={gradient}
                  setGradient={setGradient}
                  outline={outline}
                  setOutline={setOutline}
                  strokeWidth={strokeWidth}
                  setStrokeWidth={setStrokeWidth}
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

              {activeTab === "labels" && (
                <LabelsPanel
                  showValueLabels={showValueLabels}
                  setShowValueLabels={setShowValueLabels}
                  labelFormat={labelFormat}
                  setLabelFormat={setLabelFormat}
                  labelPosition={labelPosition}
                  setLabelPosition={setLabelPosition}
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
            Rendering a{" "}
            <strong className="text-gray-700 dark:text-gray-200">
              {activeMode?.label.toLowerCase()}
            </strong>{" "}
            chart using the{" "}
            <strong className="text-gray-700 dark:text-gray-200">
              {activeValueScale?.label}
            </strong>{" "}
            scale across {orderedSlices.length}{" "}
            {orderedSlices.length === 1 ? "category" : "categories"}.
          </div>
        </div>
      </div>

      {/* ── Educational guide + FAQ ────────────────────────────────────────── */}
      <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-12">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-brandColor/10 dark:bg-brandColor/20 text-brandColor mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Reading a polar chart</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Designing honest, readable rose charts
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A quick reference on scale, category count and shape so your polar
              charts inform rather than mislead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GuideCard
              accent="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
              badge="5–12"
              title="Keep categories few"
              body="Polar charts read best with five to twelve categories. Beyond that the wedges get too thin to compare, so group minor categories into an “Other” slice or switch to a bar chart."
            />
            <GuideCard
              accent="bg-violet-50 dark:bg-violet-950/60 text-brandColor"
              badge="√"
              title="Encode area, not radius"
              body="The classic Nightingale rose maps value to wedge AREA, so the tool applies a square root to the radius. That keeps the picture proportionate. Switch to radius only when exact differences matter."
            />
            <GuideCard
              accent="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
              badge="⌖"
              title="Order logically"
              body="Use a natural order for cyclical data — months, compass points or hours — and sort by size for rankings. Rotate the start angle to place your most important category at 12 o’clock."
            />
            <GuideCard
              accent="bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400"
              badge="≡"
              title="Bars beat angles"
              body="Reading angles and areas is harder than reading lengths. When readers need precise comparisons, switch the shape to radial bars for a common baseline, or reach for a plain bar chart."
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
              Everything you need to know about creating polar, rose and radial
              bar charts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {POLAR_FAQS.map((faq, index) => {
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

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
              active
                ? "bg-brandColor text-white border-brandColor"
                : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Data panel ──────────────────────────────────────────────────────────────
function DataPanel({
  slices,
  paletteId,
  total,
  addSlice,
  removeSlice,
  updateSliceLabel,
  updateSliceValue,
  updateSliceColor,
  toggleSliceVisibility,
  applyPalette,
  loadDataset,
  onImport,
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* CSV / Excel import */}
      <ChartDataImport
        onImport={onImport}
        mode="single"
        subject="polar chart"
      />

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

      {/* Slice manager */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={Layers}>Categories ({slices.length})</SectionLabel>
          <button
            type="button"
            onClick={addSlice}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brandColor/10 hover:bg-brandColor/20 text-brandColor text-[11px] font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add category
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {slices.map((s, index) => {
            const value = toNumber(s.value);
            const percent = total > 0 ? (value / total) * 100 : 0;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-2 p-2 rounded-xl border bg-gray-50/60 dark:bg-gray-950/50 transition-colors hover:border-gray-300 dark:hover:border-gray-700 ${
                  s.visible === false ? "opacity-55" : ""
                }`}
              >
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => updateSliceColor(s.id, e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 bg-transparent p-0 cursor-pointer shrink-0"
                  title="Category colour"
                />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) => updateSliceLabel(s.id, e.target.value)}
                    placeholder={`Category ${index + 1}`}
                    className="w-full min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                  />
                  <div className="flex items-center gap-1.5 px-1">
                    <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, percent))}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-[10px] font-medium text-gray-400 tabular-nums">
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={s.value}
                  onChange={(e) => updateSliceValue(s.id, e.target.value)}
                  title="Value"
                  className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono text-right text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor shrink-0"
                />
                <button
                  type="button"
                  onClick={() => toggleSliceVisibility(s.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brandColor hover:bg-brandColor/10 transition-all cursor-pointer shrink-0"
                  title={s.visible === false ? "Show category" : "Hide category"}
                >
                  {s.visible === false ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeSlice(s.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer shrink-0"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1">
          <span>{slices.length} categories · {total.toLocaleString("en-US")} total</span>
          <span className="text-gray-400">Values are relative, not required to sum to 100</span>
        </div>
      </div>
    </div>
  );
}

// ─── Shape panel ─────────────────────────────────────────────────────────────
function ShapePanel({
  mode,
  setMode,
  valueScale,
  setValueScale,
  innerRatio,
  setInnerRatio,
  gap,
  setGap,
  cornerRadius,
  setCornerRadius,
  levels,
  setLevels,
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
  showGrid,
  setShowGrid,
  showSpokes,
  setShowSpokes,
  showCategoryLabels,
  setShowCategoryLabels,
  showTickLabels,
  setShowTickLabels,
  showCenterTotal,
  setShowCenterTotal,
  gridColor,
  setGridColor,
  axisColor,
  setAxisColor,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel icon={Orbit}>Chart shape</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {POLAR_MODES.map((m) => {
            const active = mode === m.id;
            const Icon = m.id === "area" ? PieChart : BarChart3;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor shadow-xs"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-bold">{m.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
          {POLAR_MODES.find((m) => m.id === mode)?.description}
        </p>
      </div>

      <div>
        <SectionLabel icon={Percent}>Value scale</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {VALUE_SCALES.map((v) => {
            const active = valueScale === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setValueScale(v.id)}
                className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
          {VALUE_SCALES.find((v) => v.id === valueScale)?.description}
        </p>
      </div>

      <RangeControl
        label="Centre hole"
        hint="Inner radius"
        value={Math.round(innerRatio * 100)}
        min={0}
        max={70}
        step={1}
        suffix="%"
        onChange={(v) => setInnerRatio(v / 100)}
      />

      <RangeControl
        label="Slice gap"
        hint="Space between wedges"
        value={gap}
        min={0}
        max={20}
        step={0.5}
        suffix="°"
        onChange={setGap}
      />

      {mode === "bar" && (
        <RangeControl
          label="Corner radius"
          hint="Rounded bar caps"
          value={cornerRadius}
          min={0}
          max={24}
          step={1}
          suffix="px"
          onChange={setCornerRadius}
        />
      )}

      <RangeControl
        label="Ring levels"
        hint="Concentric grid rings"
        value={levels}
        min={2}
        max={10}
        step={1}
        onChange={setLevels}
      />

      <RangeControl
        label="Rotation"
        hint="Start angle of the first category"
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
        <SectionLabel icon={Ruler}>Ring scale</SectionLabel>
        <ChipGroup options={SCALE_MODES} value={scaleMode} onChange={setScaleMode} />
        {scaleMode === "custom" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
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
        <ToggleRow label="Show grid rings" checked={showGrid} onChange={setShowGrid} />
        <ToggleRow
          label="Show category spokes"
          checked={showSpokes}
          onChange={setShowSpokes}
        />
        <ToggleRow
          label="Show category labels"
          checked={showCategoryLabels}
          onChange={setShowCategoryLabels}
        />
        <ToggleRow
          label="Show radial tick values"
          checked={showTickLabels}
          onChange={setShowTickLabels}
        />
        <ToggleRow
          label="Show total in the centre hole"
          checked={showCenterTotal}
          onChange={setShowCenterTotal}
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
        Auto fit rounds the outer ring to clean values and always begins at zero;
        pick 0–100 for percentage shares or Custom for a fixed index range.
      </div>
    </div>
  );
}

// ─── Style panel ─────────────────────────────────────────────────────────────
function StylePanel({
  fillOpacity,
  setFillOpacity,
  gradient,
  setGradient,
  outline,
  setOutline,
  strokeWidth,
  setStrokeWidth,
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
          label="Radial gradient fill"
          checked={gradient}
          onChange={setGradient}
        />
        <ToggleRow
          label="Outline each wedge"
          checked={outline}
          onChange={setOutline}
        />
        <ToggleRow
          label="Drop shadow on the rose"
          checked={shadow}
          onChange={setShadow}
        />
      </div>

      <RangeControl
        label="Fill opacity"
        hint="Wedge transparency"
        value={Math.round(fillOpacity * 100)}
        min={20}
        max={100}
        step={2}
        suffix="%"
        onChange={(v) => setFillOpacity(v / 100)}
      />

      {outline && (
        <RangeControl
          label="Outline width"
          hint="Wedge border thickness"
          value={strokeWidth}
          min={0.5}
          max={5}
          step={0.5}
          suffix="px"
          onChange={setStrokeWidth}
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
            min={420}
            max={1400}
            step={10}
            suffix="px"
            onChange={setChartWidth}
            compact
          />
          <RangeControl
            label="Height"
            value={chartHeight}
            min={420}
            max={1400}
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

// ─── Labels panel ────────────────────────────────────────────────────────────
function LabelsPanel({
  showValueLabels,
  setShowValueLabels,
  labelFormat,
  setLabelFormat,
  labelPosition,
  setLabelPosition,
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
      <ToggleRow
        label="Show value labels"
        checked={showValueLabels}
        onChange={setShowValueLabels}
      />

      <div className={showValueLabels ? "" : "opacity-50 pointer-events-none"}>
        <div>
          <SectionLabel icon={Tag}>Label content</SectionLabel>
          <ChipGroup
            options={LABEL_FORMATS}
            value={labelFormat}
            onChange={setLabelFormat}
          />
        </div>

        <div className="mt-5">
          <SectionLabel icon={Compass}>Label position</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {LABEL_POSITIONS.map((p) => {
              const active = labelPosition === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLabelPosition(p.id)}
                  className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-brandColor text-white border-brandColor"
                      : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Percent is calculated against the sum of all visible categories.
          </p>
        </div>
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
      <ToggleRow label="Show legend" checked={showLegend} onChange={setShowLegend} />

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
        label="Show each category value in the legend"
        checked={showLegendValues}
        onChange={setShowLegendValues}
      />

      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-brandColor" />
        With many categories the right or left legend keeps the rose large; a top
        or bottom legend suits short labels and fewer slices.
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
