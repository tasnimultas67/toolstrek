"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import {
  ChartSpline,
  ChartNoAxesCombined,
  AreaChart,
  Palette,
  Table2,
  SlidersHorizontal,
  Tag,
  ListTree,
  Plus,
  Trash2,
  RotateCcw,
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
  Hash,
  TrendingUp,
  Layers,
  Ruler,
  Type,
  ArrowUpDown,
  CircleDot,
  Maximize2,
} from "lucide-react";
import ToolPageShell from "../../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "@/components/BackButton";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  LINE_STYLES,
  MARKER_SHAPES,
  DASH_STYLES,
  GRID_STYLES,
  LABEL_FORMATS,
  LABEL_POSITIONS,
  LEGEND_POSITIONS,
  PALETTES,
  LINE_FAQS,
  SAMPLE_DATASETS,
  DEFAULT_DATASET_ID,
  DEFAULT_PALETTE_ID,
  getPaletteColor,
  getDashPattern,
  getGridPattern,
} from "./lineChartData";
import {
  computeLineLayout,
  buildPath,
  buildAreaPath,
  dataToCsv,
  downloadPng,
  downloadSvgFile,
  formatValue,
  getPointLabelText,
  serializeSvg,
  toNum,
  truncateText,
  DEFAULT_CHART_HEIGHT,
  DEFAULT_CHART_WIDTH,
} from "./lineChartEngine";

const FONT_STACK =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Client-only id generator used for rows/series added after mount. It is never
// called during SSR, so Date.now() here cannot cause a hydration mismatch.
let idCounter = 0;
const createId = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${idCounter++}`;

const DEFAULT_DATASET =
  SAMPLE_DATASETS.find((d) => d.id === DEFAULT_DATASET_ID) || SAMPLE_DATASETS[0];

// Deterministic, SSR-safe ids for the *initial* dataset. React must render the
// exact same id on the server and the client or hydration fails, so these are
// derived from stable indices instead of Date.now()/Math.random().
function makeFromDataset(dataset, paletteId = DEFAULT_PALETTE_ID) {
  const categories = dataset.categories.map((label, index) => ({
    id: `cat-init-${index}`,
    label,
  }));
  const series = dataset.series.map((s, index) => ({
    id: `ser-init-${index}`,
    name: s.name,
    color: getPaletteColor(paletteId, index),
    dash: "solid",
    visible: true,
    values: categories.map((_, i) => {
      const v = s.values?.[i];
      return v === null || v === undefined ? "" : v;
    }),
  }));
  return { categories, series };
}

const CONTROL_TABS = [
  { id: "data", label: "Data", icon: Table2 },
  { id: "style", label: "Style", icon: SlidersHorizontal },
  { id: "axes", label: "Axes", icon: Ruler },
  { id: "labels", label: "Labels", icon: Tag },
  { id: "legend", label: "Legend", icon: ListTree },
];

const SORT_LABEL = { none: "Original", desc: "Highest", asc: "Lowest" };
const num = (v) => toNum(v) ?? 0;

export default function LineChartGenerator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Line Chart Generator",
      link: "/tools/line-chart-generator",
      icon: "LineChart",
    });
  }, [addRecentTool]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const initial = useMemo(
    () => makeFromDataset(DEFAULT_DATASET, DEFAULT_PALETTE_ID),
    []
  );
  const [categories, setCategories] = useState(initial.categories);
  const [series, setSeries] = useState(initial.series);
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);
  const [sortMode, setSortMode] = useState("none");

  // ── Line style ─────────────────────────────────────────────────────────────
  const [lineStyle, setLineStyle] = useState("smooth");
  const [curveTension, setCurveTension] = useState(60);
  const [lineWidth, setLineWidth] = useState(2.5);
  const [lineOpacity, setLineOpacity] = useState(1);
  const [globalDash, setGlobalDash] = useState("solid");

  // ── Markers ────────────────────────────────────────────────────────────────
  const [showMarkers, setShowMarkers] = useState(true);
  const [markerShape, setMarkerShape] = useState("circle");
  const [markerSize, setMarkerSize] = useState(4);
  const [markerFilled, setMarkerFilled] = useState(true);
  const [markerBorderWidth, setMarkerBorderWidth] = useState(2);

  // ── Area ───────────────────────────────────────────────────────────────────
  const [showArea, setShowArea] = useState(true);
  const [areaOpacity, setAreaOpacity] = useState(16);
  const [areaGradient, setAreaGradient] = useState(true);
  const [stacked, setStacked] = useState(false);

  // ── Axes ───────────────────────────────────────────────────────────────────
  const [pointPadding, setPointPadding] = useState(5);
  const [showValueAxis, setShowValueAxis] = useState(true);
  const [showCategoryAxis, setShowCategoryAxis] = useState(true);
  const [showGridlines, setShowGridlines] = useState(true);
  const [gridStyle, setGridStyle] = useState("dashed");
  const [zeroBaseline, setZeroBaseline] = useState(true);
  const [tickCount, setTickCount] = useState(5);
  const [autoScale, setAutoScale] = useState(true);
  const [manualMin, setManualMin] = useState(0);
  const [manualMax, setManualMax] = useState(150);
  const [categoryLabelAngle, setCategoryLabelAngle] = useState(0);
  const [axisTitleCategory, setAxisTitleCategory] = useState("Month");
  const [axisTitleValue, setAxisTitleValue] = useState("Sessions (thousands)");

  // ── Labels / number format ─────────────────────────────────────────────────
  const [labelFormat, setLabelFormat] = useState("none");
  const [labelPosition, setLabelPosition] = useState("above");
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
  const [title, setTitle] = useState("Website Traffic");
  const [subtitle, setSubtitle] = useState("Monthly sessions · 2024 vs 2025");

  // ── Canvas / theme ─────────────────────────────────────────────────────────
  const [transparentBg, setTransparentBg] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0f172a");
  const [gridColor, setGridColor] = useState("#e2e8f0");
  const [axisColor, setAxisColor] = useState("#94a3b8");
  const [chartWidth, setChartWidth] = useState(DEFAULT_CHART_WIDTH);
  const [chartHeight, setChartHeight] = useState(DEFAULT_CHART_HEIGHT);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("data");
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [pngScale, setPngScale] = useState(2);
  const [openFaq, setOpenFaq] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);

  const svgRef = useRef(null);

  // ── Ordered data (sort) ────────────────────────────────────────────────────
  const { orderedCategories, orderedSeries } = useMemo(() => {
    const totals = categories.map((_, i) =>
      series.reduce((a, s) => a + num(s.values[i]), 0)
    );
    const indices = categories.map((_, i) => i);
    if (sortMode === "desc") indices.sort((a, b) => totals[b] - totals[a]);
    else if (sortMode === "asc") indices.sort((a, b) => totals[a] - totals[b]);

    const cats = indices.map((i) => categories[i]);
    const sers = series.map((s) => ({
      ...s,
      values: indices.map((i) => s.values[i]),
    }));
    return { orderedCategories: cats, orderedSeries: sers };
  }, [categories, series, sortMode]);

  const visibleSeries = useMemo(
    () => orderedSeries.filter((s) => s.visible !== false),
    [orderedSeries]
  );

  const grandTotal = useMemo(
    () => visibleSeries.reduce((sum, s) => sum + s.values.reduce((a, v) => a + num(v), 0), 0),
    [visibleSeries]
  );

  const peakValue = useMemo(() => {
    let max = -Infinity;
    visibleSeries.forEach((s) =>
      s.values.forEach((v) => {
        const n = toNum(v);
        if (n !== null && n > max) max = n;
      })
    );
    return max === -Infinity ? 0 : max;
  }, [visibleSeries]);

  const averageValue = useMemo(() => {
    let sum = 0;
    let count = 0;
    visibleSeries.forEach((s) =>
      s.values.forEach((v) => {
        const n = toNum(v);
        if (n !== null) {
          sum += n;
          count += 1;
        }
      })
    );
    return count ? sum / count : 0;
  }, [visibleSeries]);

  const seriesTotals = useMemo(
    () => orderedSeries.map((s) => s.values.reduce((a, v) => a + num(v), 0)),
    [orderedSeries]
  );

  const fmtOptions = useMemo(
    () => ({ thousands: useThousands, compact, prefix, suffix }),
    [useThousands, compact, prefix, suffix]
  );

  // ── Layout ─────────────────────────────────────────────────────────────────
  const layout = useMemo(
    () =>
      computeLineLayout({
        width: chartWidth,
        height: chartHeight,
        title,
        subtitle,
        series: orderedSeries,
        categories: orderedCategories,
        stacked,
        pointPadding: pointPadding / 100,
        showValueAxis,
        showCategoryAxis,
        showGridlines,
        zeroBaseline,
        tickCount,
        autoScale,
        manualMin,
        manualMax,
        legendPosition,
        showLegend,
        legendValues: showLegendValues ? seriesTotals : [],
        labelFormat,
        labelPosition,
        decimals,
        compact,
        thousands: useThousands,
        prefix,
        suffix,
        categoryLabelAngle,
        axisTitleX: axisTitleCategory,
        axisTitleY: axisTitleValue,
        markerSize: showMarkers ? markerSize : 0,
      }),
    [
      chartWidth,
      chartHeight,
      title,
      subtitle,
      orderedSeries,
      orderedCategories,
      stacked,
      pointPadding,
      showValueAxis,
      showCategoryAxis,
      showGridlines,
      zeroBaseline,
      tickCount,
      autoScale,
      manualMin,
      manualMax,
      legendPosition,
      showLegend,
      showLegendValues,
      seriesTotals,
      labelFormat,
      labelPosition,
      decimals,
      compact,
      useThousands,
      prefix,
      suffix,
      categoryLabelAngle,
      axisTitleCategory,
      axisTitleValue,
      showMarkers,
      markerSize,
    ]
  );

  // ── Data handlers ──────────────────────────────────────────────────────────
  const addCategory = () => {
    if (categories.length >= 24) {
      toast.info("24 points is the maximum — keep charts readable!");
      return;
    }
    setCategories((prev) => [
      ...prev,
      { id: createId("cat"), label: `Point ${prev.length + 1}` },
    ]);
    setSeries((prev) =>
      prev.map((s) => ({ ...s, values: [...s.values, 10] }))
    );
    toast.success("Data point added");
  };

  const removeCategory = (index) => {
    if (categories.length <= 2) {
      toast.error("A line chart needs at least two points.");
      return;
    }
    setCategories((prev) => prev.filter((_, i) => i !== index));
    setSeries((prev) =>
      prev.map((s) => ({ ...s, values: s.values.filter((_, i) => i !== index) }))
    );
  };

  const updateCategoryLabel = (index, label) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === index ? { ...c, label } : c))
    );
  };

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
        dash: globalDash,
        visible: true,
        values: categories.map(() => 10),
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

  const updateSeriesName = (id, name) =>
    setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));

  const updateSeriesColor = (id, color) =>
    setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));

  const updateSeriesDash = (id, dash) =>
    setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, dash } : s)));

  const toggleSeriesVisible = (id) =>
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: s.visible === false } : s))
    );

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

  const applyGlobalDash = (id) => {
    setGlobalDash(id);
    setSeries((prev) => prev.map((s) => ({ ...s, dash: id })));
  };

  const loadDataset = (dataset) => {
    const next = makeFromDataset(dataset, paletteId);
    setCategories(next.categories);
    setSeries(next.series);
    setTitle(dataset.name);
    setSubtitle(dataset.unit || "");
    setSortMode("none");
    setStacked(false);
    toast.success(`Loaded “${dataset.name}”`);
  };

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
    setCategories(next.categories);
    setSeries(next.series);
    setPaletteId(DEFAULT_PALETTE_ID);
    setSortMode("none");
    setLineStyle("smooth");
    setCurveTension(60);
    setLineWidth(2.5);
    setLineOpacity(1);
    setGlobalDash("solid");
    setShowMarkers(true);
    setMarkerShape("circle");
    setMarkerSize(4);
    setMarkerFilled(true);
    setMarkerBorderWidth(2);
    setShowArea(true);
    setAreaOpacity(16);
    setAreaGradient(true);
    setStacked(false);
    setPointPadding(5);
    setShowValueAxis(true);
    setShowCategoryAxis(true);
    setShowGridlines(true);
    setGridStyle("dashed");
    setZeroBaseline(true);
    setTickCount(5);
    setAutoScale(true);
    setManualMin(0);
    setManualMax(150);
    setCategoryLabelAngle(0);
    setAxisTitleCategory("Month");
    setAxisTitleValue("Sessions (thousands)");
    setLabelFormat("none");
    setLabelPosition("above");
    setDecimals(0);
    setUseThousands(true);
    setCompact(false);
    setPrefix("");
    setSuffix("");
    setShowLegend(true);
    setLegendPosition("top");
    setShowLegendValues(false);
    setTitle("Website Traffic");
    setSubtitle("Monthly sessions · 2024 vs 2025");
    setTransparentBg(false);
    setBgColor("#ffffff");
    setTextColor("#0f172a");
    setGridColor("#e2e8f0");
    setAxisColor("#94a3b8");
    setHoverIndex(null);
    toast.info("Reset to defaults");
  };

  const applyTheme = (theme) => {
    if (theme === "light") {
      setTransparentBg(false);
      setBgColor("#ffffff");
      setTextColor("#0f172a");
      setGridColor("#e2e8f0");
      setAxisColor("#94a3b8");
    } else if (theme === "dark") {
      setTransparentBg(false);
      setBgColor("#0b1220");
      setTextColor("#f8fafc");
      setGridColor("#1e293b");
      setAxisColor("#475569");
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
      const markup = serializeSvg(svgRef.current, chartWidth, chartHeight);
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
      const csv = dataToCsv(orderedCategories, orderedSeries);
      await navigator.clipboard.writeText(csv);
      setCopiedData(true);
      toast.success("Chart data copied as CSV");
      setTimeout(() => setCopiedData(false), 2000);
    } catch {
      toast.error("Could not copy the chart data.");
    }
  };

  const handleDownloadPng = async () => {
    if (!svgRef.current) return;
    try {
      await downloadPng(
        svgRef.current,
        chartWidth,
        chartHeight,
        "line-chart.png",
        pngScale
      );
      toast.success(`PNG downloaded at ${pngScale}× resolution`);
    } catch {
      toast.error("PNG export failed — try the SVG download instead.");
    }
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    try {
      downloadSvgFile(svgRef.current, chartWidth, chartHeight, "line-chart.svg");
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
      dataToCsv(orderedCategories, orderedSeries),
      "text/csv;charset=utf-8",
      "line-chart-data.csv",
      "CSV downloaded"
    );
  };

  const handleDownloadJson = () => {
    const payload = {
      title,
      subtitle,
      lineStyle,
      stacked,
      unit: subtitle,
      categories: orderedCategories.map((c) => c.label),
      series: orderedSeries.map((s) => ({
        name: s.name,
        color: s.color,
        dash: s.dash,
        visible: s.visible !== false,
        values: s.values.map((v) => toNum(v)),
      })),
      total: grandTotal,
    };
    downloadBlobFile(
      JSON.stringify(payload, null, 2),
      "application/json",
      "line-chart-data.json",
      "JSON downloaded"
    );
  };

  const toolInfo = {
    title: "Line Chart Generator",
    link: "/tools/line-chart-generator",
  };

  const activeLineStyle = LINE_STYLES.find((s) => s.id === lineStyle);
  const activeMarker = MARKER_SHAPES.find((s) => s.id === markerShape);
  const mutedColor = textColor === "#f8fafc" ? "#94a3b8" : "#64748b";

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
              onClick={() => setStacked((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                stacked
                  ? "bg-brandColor text-white border-brandColor"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
              title="Toggle stacked area"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{stacked ? "Stacked" : "Overlaid"}</span>
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
            <ChartSpline className="w-3.5 h-3.5 text-brandColor" />
            <span>Line &amp; Area Chart Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Line Chart Generator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Turn plain numbers into clean, presentation-ready line and area
            charts. Add multiple series, switch between straight, smooth and
            step lines, toggle markers and area fills, stack your series,
            fine-tune axes, gridlines, labels and legends, then export a crisp
            PNG or scalable SVG — all 100% in your browser.
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
                  {activeLineStyle?.label} · {stacked ? "Stacked area" : "Overlaid"}{" "}
                  · {visibleSeries.length}{" "}
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
            <div
              className="relative flex items-center justify-center p-4 sm:p-6 transition-colors duration-200"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(148,163,184,0.22) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              <LineChartSvg
                svgRef={svgRef}
                layout={layout}
                series={layout.series}
                hoverIndex={hoverIndex}
                setHoverIndex={setHoverIndex}
                config={{
                  title,
                  subtitle,
                  textColor,
                  mutedColor,
                  gridColor,
                  axisColor,
                  transparentBg,
                  bgColor,
                  lineStyle,
                  curveTension: curveTension / 100,
                  lineWidth,
                  lineOpacity,
                  globalDash,
                  showMarkers,
                  markerShape,
                  markerSize,
                  markerFilled,
                  markerBorderWidth,
                  showArea,
                  areaOpacity: areaOpacity / 100,
                  areaGradient,
                  stacked,
                  labelFormat,
                  labelPosition,
                  decimals,
                  fmtOptions,
                  showValueAxis,
                  showCategoryAxis,
                  showGridlines,
                  gridStyle,
                  showLegendValues,
                  categoryLabelAngle,
                  axisTitleCategory,
                  axisTitleValue,
                }}
                grandTotal={grandTotal}
              />
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 text-center">
              <StatCell
                icon={Hash}
                label="Points"
                value={String(orderedCategories.length)}
              />
              <StatCell
                icon={Layers}
                label="Series"
                value={`${visibleSeries.length}/${orderedSeries.length}`}
              />
              <StatCell
                icon={TrendingUp}
                label="Peak"
                value={formatValue(peakValue, { ...fmtOptions, decimals })}
              />
              <StatCell
                icon={ChartNoAxesCombined}
                label="Average"
                value={formatValue(averageValue, { ...fmtOptions, decimals: 1 })}
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
                  categories={categories}
                  series={series}
                  paletteId={paletteId}
                  addCategory={addCategory}
                  removeCategory={removeCategory}
                  updateCategoryLabel={updateCategoryLabel}
                  addSeries={addSeries}
                  removeSeries={removeSeries}
                  updateSeriesName={updateSeriesName}
                  updateSeriesColor={updateSeriesColor}
                  updateSeriesDash={updateSeriesDash}
                  toggleSeriesVisible={toggleSeriesVisible}
                  updateSeriesValue={updateSeriesValue}
                  applyPalette={applyPalette}
                  loadDataset={loadDataset}
                />
              )}

              {activeTab === "style" && (
                <StylePanel
                  lineStyle={lineStyle}
                  setLineStyle={setLineStyle}
                  curveTension={curveTension}
                  setCurveTension={setCurveTension}
                  lineWidth={lineWidth}
                  setLineWidth={setLineWidth}
                  lineOpacity={lineOpacity}
                  setLineOpacity={setLineOpacity}
                  globalDash={globalDash}
                  applyGlobalDash={applyGlobalDash}
                  showMarkers={showMarkers}
                  setShowMarkers={setShowMarkers}
                  markerShape={markerShape}
                  setMarkerShape={setMarkerShape}
                  markerSize={markerSize}
                  setMarkerSize={setMarkerSize}
                  markerFilled={markerFilled}
                  setMarkerFilled={setMarkerFilled}
                  markerBorderWidth={markerBorderWidth}
                  setMarkerBorderWidth={setMarkerBorderWidth}
                  showArea={showArea}
                  setShowArea={setShowArea}
                  areaOpacity={areaOpacity}
                  setAreaOpacity={setAreaOpacity}
                  areaGradient={areaGradient}
                  setAreaGradient={setAreaGradient}
                  stacked={stacked}
                  setStacked={setStacked}
                  transparentBg={transparentBg}
                  setTransparentBg={setTransparentBg}
                  bgColor={bgColor}
                  setBgColor={setBgColor}
                  textColor={textColor}
                  setTextColor={setTextColor}
                  gridColor={gridColor}
                  setGridColor={setGridColor}
                  axisColor={axisColor}
                  setAxisColor={setAxisColor}
                  applyTheme={applyTheme}
                  chartWidth={chartWidth}
                  setChartWidth={setChartWidth}
                  chartHeight={chartHeight}
                  setChartHeight={setChartHeight}
                />
              )}

              {activeTab === "axes" && (
                <AxesPanel
                  showValueAxis={showValueAxis}
                  setShowValueAxis={setShowValueAxis}
                  showCategoryAxis={showCategoryAxis}
                  setShowCategoryAxis={setShowCategoryAxis}
                  showGridlines={showGridlines}
                  setShowGridlines={setShowGridlines}
                  gridStyle={gridStyle}
                  setGridStyle={setGridStyle}
                  zeroBaseline={zeroBaseline}
                  setZeroBaseline={setZeroBaseline}
                  tickCount={tickCount}
                  setTickCount={setTickCount}
                  autoScale={autoScale}
                  setAutoScale={setAutoScale}
                  manualMin={manualMin}
                  setManualMin={setManualMin}
                  manualMax={manualMax}
                  setManualMax={setManualMax}
                  pointPadding={pointPadding}
                  setPointPadding={setPointPadding}
                  categoryLabelAngle={categoryLabelAngle}
                  setCategoryLabelAngle={setCategoryLabelAngle}
                  axisTitleCategory={axisTitleCategory}
                  setAxisTitleCategory={setAxisTitleCategory}
                  axisTitleValue={axisTitleValue}
                  setAxisTitleValue={setAxisTitleValue}
                />
              )}

              {activeTab === "labels" && (
                <LabelsPanel
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

          {/* Quick legend of current chart type */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-brandColor" />
            Currently rendering a{" "}
            <strong className="text-gray-700 dark:text-gray-200">
              {activeLineStyle?.label.toLowerCase()}
            </strong>{" "}
            {stacked ? "stacked area" : showArea ? "area" : "line"} chart with{" "}
            {orderedCategories.length} points and {visibleSeries.length} series.
          </div>
        </div>
      </div>

      {/* ── Educational guide + FAQ ────────────────────────────────────────── */}
      <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-12">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-brandColor/10 dark:bg-brandColor/20 text-brandColor mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Anatomy of a great line chart</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Reading &amp; designing line charts that work
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A quick reference on trends, scales and fills to build clear,
              honest charts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GuideCard
              accent="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
              badge="↗"
              title="Lines show change"
              body="Line charts are built for trends over time. Put your ordered values on the horizontal axis and let the slope of the line tell the story before you add any decoration."
            />
            <GuideCard
              accent="bg-violet-50 dark:bg-violet-950/60 text-brandColor"
              badge="≈"
              title="Straight vs smooth"
              body="Straight segments are the most honest — every point sits exactly on its value. Smooth curves look softer but can imply data between points, so use the curve only when the trend is genuinely continuous."
            />
            <GuideCard
              accent="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
              badge="▤"
              title="Area vs stacked"
              body="Fill the area when the magnitude matters, and stack series when you want to show how the total is composed over time. Keep overlaid area fills translucent so lines stay visible."
            />
            <GuideCard
              accent="bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400"
              badge="◑"
              title="Separate your series"
              body="Colour is not enough on its own. Give each series a distinct dash pattern or marker shape, keep totals to a handful of lines, and always label the axes with their units."
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
              Everything you need to know about creating line and area charts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {LINE_FAQS.map((faq, index) => {
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

// ─── Marker shape ────────────────────────────────────────────────────────────
function MarkerShape({ shape, cx, cy, size, fill, stroke, strokeWidth }) {
  const s = Math.max(1, size);
  switch (shape) {
    case "square":
      return (
        <rect
          x={cx - s}
          y={cy - s}
          width={s * 2}
          height={s * 2}
          rx={1.5}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case "diamond":
      return (
        <path
          d={`M ${cx} ${cy - s} L ${cx + s} ${cy} L ${cx} ${cy + s} L ${cx - s} ${cy} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case "triangle":
      return (
        <path
          d={`M ${cx} ${cy - s} L ${cx + s * 0.95} ${cy + s * 0.8} L ${
            cx - s * 0.95
          } ${cy + s * 0.8} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case "cross":
      return (
        <g stroke={stroke} strokeWidth={Math.max(1, strokeWidth)} strokeLinecap="round">
          <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} />
          <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} />
        </g>
      );
    case "circle":
    default:
      return (
        <circle
          cx={cx}
          cy={cy}
          r={s}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
  }
}

// ─── Line chart SVG ──────────────────────────────────────────────────────────
function LineChartSvg({
  svgRef,
  layout,
  series,
  config,
  grandTotal,
  hoverIndex,
  setHoverIndex,
}) {
  const {
    title,
    subtitle,
    textColor,
    mutedColor,
    gridColor,
    axisColor,
    transparentBg,
    bgColor,
    lineStyle,
    curveTension,
    lineWidth,
    lineOpacity,
    showMarkers,
    markerShape,
    markerSize,
    markerFilled,
    markerBorderWidth,
    showArea,
    areaOpacity,
    areaGradient,
    stacked,
    labelFormat,
    labelPosition,
    decimals,
    fmtOptions,
    showValueAxis,
    showCategoryAxis,
    showGridlines,
    gridStyle,
    showLegendValues,
    categoryLabelAngle,
    axisTitleCategory,
    axisTitleValue,
  } = config;

  const { width, height, plot, ticks, categories, legend } = layout;

  const gridPattern = getGridPattern(gridStyle);
  const dashArray = (pattern) => (pattern && pattern.length ? pattern.join(" ") : undefined);

  const showSeries = series.length > 0 && categories.length > 0;
  const visibleSeries = series.filter((s) => s.visible !== false);

  const catMaxChars =
    categoryLabelAngle === 0
      ? Math.max(
          3,
          Math.floor((plot.w / Math.max(1, categories.length)) / (12 * 0.56))
        )
      : 24;

  const plotCenterX = plot.x + plot.w / 2;
  const plotCenterY = plot.y + plot.h / 2;

  const handleMove = (e) => {
    if (!setHoverIndex || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const x = ((e.clientX - rect.left) / rect.width) * width;
    let best = null;
    let bestD = Infinity;
    categories.forEach((c, i) => {
      const d = Math.abs(c.x - x);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setHoverIndex(best);
  };

  // ── Hover tooltip geometry ───────────────────────────────────────────────
  let tooltip = null;
  if (showSeries && hoverIndex !== null && hoverIndex >= 0 && hoverIndex < categories.length) {
    const cat = categories[hoverIndex];
    const rows = series.map((s) => {
      const p = s.points[hoverIndex];
      return {
        name: s.name,
        color: s.color,
        dash: s.dash || "solid",
        value: p ? p.value : null,
      };
    });
    const headerW = (String(cat.label || "")?.length || 3) * 6.4 + 24;
    const rowW = rows.reduce(
      (max, r) =>
        Math.max(
          max,
          (String(r.name).length + 12) * 6 + (r.value === null ? 20 : 44)
        ),
      headerW
    );
    const boxW = Math.min(Math.max(rowW, 140), width - 24);
    const rowH = 18;
    const boxH = 26 + rows.length * rowH + 8;
    let bx = cat.x + 16;
    if (bx + boxW > width - 10) bx = cat.x - 16 - boxW;
    if (bx < 10) bx = 10;
    let by = plot.y + 10;
    if (by + boxH > height - 10) by = Math.max(10, height - 10 - boxH);
    tooltip = { cat, rows, boxW, boxH, bx, by, rowH };
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title || "Line chart"}
      className="w-full h-auto"
      style={{ maxWidth: `${width}px`, fontFamily: FONT_STACK }}
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIndex && setHoverIndex(null)}
    >
      <defs>
        <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="4"
            floodColor="#0f172a"
            floodOpacity="0.18"
          />
        </filter>
        {showArea &&
          visibleSeries.map((s) => (
            <linearGradient
              key={s.id}
              id={`area-grad-${s.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={areaOpacity} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
      </defs>

      {!transparentBg && (
        <rect x="0" y="0" width={width} height={height} fill={bgColor} />
      )}

      {title && (
        <text
          x={width / 2}
          y={layout.titleY}
          textAnchor="middle"
          fontSize={20}
          fontWeight={800}
          fill={textColor}
        >
          {title}
        </text>
      )}
      {subtitle && (
        <text
          x={width / 2}
          y={title ? layout.titleY + 21 : layout.titleY}
          textAnchor="middle"
          fontSize={12.5}
          fill={mutedColor}
        >
          {subtitle}
        </text>
      )}

      {/* Gridlines */}
      {showGridlines && (
        <g>
          {ticks.map((tick, index) => (
            <line
              key={index}
              x1={plot.x}
              x2={plot.x + plot.w}
              y1={tick.y}
              y2={tick.y}
              stroke={tick.value === 0 ? "none" : gridColor}
              strokeWidth={1}
              strokeDasharray={dashArray(gridPattern)}
            />
          ))}
        </g>
      )}

      {/* Axis lines */}
      {showValueAxis && (
        <line
          x1={plot.x}
          x2={plot.x}
          y1={plot.y}
          y2={plot.y + plot.h}
          stroke={axisColor}
          strokeWidth={1.4}
        />
      )}
      {showCategoryAxis && (
        <line
          x1={plot.x}
          x2={plot.x + plot.w}
          y1={plot.y + plot.h}
          y2={plot.y + plot.h}
          stroke={axisColor}
          strokeWidth={1.4}
        />
      )}

      {/* Area fills (drawn first, bottom-up for stacking) */}
      {showArea &&
        showSeries &&
        visibleSeries.map((s) => {
          const pts = s.points.map((p) => (p.missing ? null : { x: p.x, y: p.y }));
          const baseYs = s.points.map((p) => p.yBase);
          const d = buildAreaPath(pts, baseYs, lineStyle, curveTension);
          if (!d) return null;
          return (
            <path
              key={`area-${s.id}`}
              d={d}
              fill={areaGradient ? `url(#area-grad-${s.id})` : s.color}
              opacity={areaGradient ? 1 : areaOpacity}
            />
          );
        })}

      {/* Lines */}
      {showSeries &&
        visibleSeries.map((s) => {
          const pts = s.points.map((p) => (p.missing ? null : { x: p.x, y: p.y }));
          const d = buildPath(pts, lineStyle, curveTension);
          if (!d) return null;
          return (
            <g key={`line-${s.id}`} className="line-series">
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={lineWidth}
                strokeOpacity={lineOpacity}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dashArray(getDashPattern(s.dash))}
              />
            </g>
          );
        })}

      {/* Markers */}
      {showMarkers &&
        showSeries &&
        visibleSeries.map((s) =>
          s.points.map((p) => {
            if (p.missing) return null;
            const isHover = hoverIndex === p.index;
            const size = isHover ? markerSize + 1.5 : markerSize;
            const fill = markerFilled ? s.color : bgColor;
            const stroke = markerFilled ? bgColor : s.color;
            return (
              <g key={`marker-${s.id}-${p.index}`} pointerEvents="none">
                {isHover && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={size + 4}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={1.5}
                    opacity={0.45}
                  />
                )}
                <MarkerShape
                  shape={markerShape}
                  cx={p.x}
                  cy={p.y}
                  size={size}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={markerBorderWidth}
                />
              </g>
            );
          })
        )}

      {/* Value axis ticks + labels */}
      {showValueAxis &&
        ticks.map((tick, index) => (
          <text
            key={index}
            x={plot.x - 9}
            y={tick.y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={12}
            fill={mutedColor}
          >
            {formatValue(tick.value, { ...fmtOptions, decimals })}
          </text>
        ))}

      {/* Category labels */}
      {showCategoryAxis &&
        categories.map((cat) => {
          const label = truncateText(cat.label, catMaxChars);
          if (categoryLabelAngle === 0) {
            return (
              <text
                key={cat.id}
                x={cat.x}
                y={plot.y + plot.h + 18}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                fill={textColor}
              >
                {label}
              </text>
            );
          }
          return (
            <text
              key={cat.id}
              x={cat.x}
              y={plot.y + plot.h + 14}
              textAnchor="end"
              fontSize={12}
              fontWeight={600}
              fill={textColor}
              transform={`rotate(-${categoryLabelAngle} ${cat.x} ${
                plot.y + plot.h + 14
              })`}
            >
              {label}
            </text>
          );
        })}

      {/* Axis titles */}
      {axisTitleCategory && (
        <text
          x={plotCenterX}
          y={height - layout.pad + 2}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={mutedColor}
        >
          {axisTitleCategory}
        </text>
      )}
      {axisTitleValue && (
        <text
          x={layout.pad + 12}
          y={plotCenterY}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={mutedColor}
          transform={`rotate(-90 ${layout.pad + 12} ${plotCenterY})`}
        >
          {axisTitleValue}
        </text>
      )}

      {/* Data labels */}
      {labelFormat !== "none" &&
        showSeries &&
        visibleSeries.map((s) =>
          s.points.map((p) => {
            if (p.missing) return null;
            if (hoverIndex !== null && hoverIndex !== p.index) return null;
            const text = getPointLabelText(
              p.value,
              labelFormat,
              decimals,
              grandTotal,
              fmtOptions
            );
            let x = p.x;
            let y = p.y;
            let baseline = "middle";
            if (labelPosition === "above") {
              y = p.y - (markerSize + 8);
              baseline = "auto";
            } else if (labelPosition === "below") {
              y = p.y + (markerSize + 14);
              baseline = "hanging";
            } else {
              y = p.y + 4;
            }
            return (
              <text
                key={`lbl-${s.id}-${p.index}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline={baseline}
                fontSize={11}
                fontWeight={700}
                fill={textColor}
                pointerEvents="none"
              >
                {text}
              </text>
            );
          })
        )}

      {/* Legend */}
      {legend.visible && (
        <g>
          {legend.items.map((item, index) => {
            const pos = legend.positions[index];
            if (!pos) return null;
            const valueText = showLegendValues
              ? formatValue(item.value, { ...fmtOptions, decimals })
              : "";
            const dashPattern = getDashPattern(item.dash);
            return (
              <g key={item.id} opacity={item.visible ? 1 : 0.4}>
                <line
                  x1={pos.x}
                  x2={pos.x + legend.marker}
                  y1={pos.y + 11}
                  y2={pos.y + 11}
                  stroke={item.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={dashArray(dashPattern)}
                />
                <circle cx={pos.x + legend.marker / 2} cy={pos.y + 11} r={2.6} fill={item.color} />
                <text
                  x={pos.x + legend.marker + 8}
                  y={pos.y + 15}
                  fontSize={12.5}
                  fontWeight={600}
                  fill={textColor}
                >
                  {truncateText(
                    item.label,
                    legend.onSide
                      ? 20
                      : Math.max(
                          6,
                          Math.floor(
                            (pos.width - legend.marker - 24) / (12.5 * 0.56)
                          )
                        )
                  )}
                </text>
                {showLegendValues && (
                  <text
                    x={pos.x + pos.width}
                    y={pos.y + 15}
                    textAnchor="end"
                    fontSize={12}
                    fontWeight={700}
                    fill={mutedColor}
                  >
                    {valueText}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* Hover guide + tooltip (stripped from exports) */}
      {tooltip && (
        <g data-export-strip="true" pointerEvents="none">
          <line
            x1={tooltip.cat.x}
            x2={tooltip.cat.x}
            y1={plot.y}
            y2={plot.y + plot.h}
            stroke={axisColor}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          {visibleSeries.map((s) => {
            const p = s.points[hoverIndex];
            if (!p || p.missing) return null;
            return (
              <circle
                key={`hd-${s.id}`}
                cx={p.x}
                cy={p.y}
                r={markerSize + 2}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
              />
            );
          })}
          <g>
            <rect
              x={tooltip.bx}
              y={tooltip.by}
              width={tooltip.boxW}
              height={tooltip.boxH}
              rx={10}
              fill={bgColor}
              stroke={gridColor}
              strokeWidth={1}
              opacity={0.98}
              filter="url(#lineShadow)"
            />
            <text
              x={tooltip.bx + 12}
              y={tooltip.by + 18}
              fontSize={11.5}
              fontWeight={800}
              fill={textColor}
            >
              {truncateText(tooltip.cat.label, 22)}
            </text>
            {tooltip.rows.map((row, i) => {
              const ry = tooltip.by + 32 + i * tooltip.rowH;
              return (
                <g key={`tt-${i}`}>
                  <line
                    x1={tooltip.bx + 12}
                    x2={tooltip.bx + 24}
                    y1={ry + 4}
                    y2={ry + 4}
                    stroke={row.color}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={dashArray(getDashPattern(row.dash))}
                  />
                  <text
                    x={tooltip.bx + 30}
                    y={ry + 8}
                    fontSize={11}
                    fill={mutedColor}
                  >
                    {truncateText(row.name, 16)}
                  </text>
                  <text
                    x={tooltip.bx + tooltip.boxW - 10}
                    y={ry + 8}
                    textAnchor="end"
                    fontSize={11}
                    fontWeight={700}
                    fill={textColor}
                  >
                    {row.value === null
                      ? "—"
                      : formatValue(row.value, { ...fmtOptions, decimals })}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      )}
    </svg>
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
  categories,
  series,
  paletteId,
  addCategory,
  removeCategory,
  updateCategoryLabel,
  addSeries,
  removeSeries,
  updateSeriesName,
  updateSeriesColor,
  updateSeriesDash,
  toggleSeriesVisible,
  updateSeriesValue,
  applyPalette,
  loadDataset,
}) {
  const gridTemplate = `minmax(96px, 1.3fr) repeat(${
    series.length
  }, minmax(56px, 66px)) 28px`;

  return (
    <div className="flex flex-col gap-6">
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
                    active
                      ? "text-brandColor"
                      : "text-gray-600 dark:text-gray-300"
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
                s.visible === false ? "opacity-60" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => toggleSeriesVisible(s.id)}
                className="p-1 rounded-lg text-gray-400 hover:text-brandColor transition-all cursor-pointer shrink-0"
                title={s.visible === false ? "Show series" : "Hide series"}
              >
                {s.visible === false ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
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
              <select
                value={s.dash || "solid"}
                onChange={(e) => updateSeriesDash(s.id, e.target.value)}
                className="w-20 px-1.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-[11px] text-gray-700 dark:text-gray-200 cursor-pointer outline-none"
                title="Line dash pattern"
              >
                {DASH_STYLES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
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

      {/* Category matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={Table2}>Data ({categories.length})</SectionLabel>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brandColor/10 hover:bg-brandColor/20 text-brandColor text-[11px] font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add point
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
                Point
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

            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="grid items-center gap-2 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <input
                  type="text"
                  value={cat.label}
                  onChange={(e) => updateCategoryLabel(i, e.target.value)}
                  placeholder="Label"
                  className="w-full min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                />
                {series.map((s) => (
                  <input
                    key={s.id}
                    type="number"
                    value={s.values[i] ?? ""}
                    onChange={(e) =>
                      updateSeriesValue(s.id, i, e.target.value)
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono text-right text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                    title={`${s.name} · ${cat.label}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => removeCategory(i)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer flex items-center justify-center"
                  title="Delete data point"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1">
          <span>
            {categories.length} points × {series.length}{" "}
            {series.length === 1 ? "series" : "series"}
          </span>
          <span className="text-gray-400">Leave a cell empty to break the line</span>
        </div>
      </div>
    </div>
  );
}

// ─── Style panel ─────────────────────────────────────────────────────────────
function StylePanel({
  lineStyle,
  setLineStyle,
  curveTension,
  setCurveTension,
  lineWidth,
  setLineWidth,
  lineOpacity,
  setLineOpacity,
  globalDash,
  applyGlobalDash,
  showMarkers,
  setShowMarkers,
  markerShape,
  setMarkerShape,
  markerSize,
  setMarkerSize,
  markerFilled,
  setMarkerFilled,
  markerBorderWidth,
  setMarkerBorderWidth,
  showArea,
  setShowArea,
  areaOpacity,
  setAreaOpacity,
  areaGradient,
  setAreaGradient,
  stacked,
  setStacked,
  transparentBg,
  setTransparentBg,
  bgColor,
  setBgColor,
  textColor,
  setTextColor,
  gridColor,
  setGridColor,
  axisColor,
  setAxisColor,
  applyTheme,
  chartWidth,
  setChartWidth,
  chartHeight,
  setChartHeight,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel icon={ChartSpline}>Line style</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {LINE_STYLES.map((s) => {
            const active = lineStyle === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setLineStyle(s.id)}
                className={`flex flex-col items-start gap-0.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor shadow-xs"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                <span className="text-[11px] font-bold">{s.label}</span>
                <span
                  className={`text-[9.5px] leading-tight ${
                    active ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {s.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {lineStyle === "smooth" && (
        <RangeControl
          label="Curve tension"
          hint="0 = straight, 100 = fully rounded"
          value={curveTension}
          min={0}
          max={100}
          step={5}
          suffix="%"
          onChange={setCurveTension}
        />
      )}

      <div>
        <SectionLabel icon={Spline}>Dash pattern</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {DASH_STYLES.map((d) => {
            const active = globalDash === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => applyGlobalDash(d.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                <svg width="34" height="6" viewBox="0 0 34 6">
                  <line
                    x1="1"
                    y1="3"
                    x2="33"
                    y2="3"
                    stroke={active ? "#ffffff" : "currentColor"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={
                      d.pattern.length ? d.pattern.join(" ") : undefined
                    }
                  />
                </svg>
                <span className="text-[10px] font-semibold">{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <RangeControl
        label="Line width"
        hint="Stroke thickness"
        value={lineWidth}
        min={1}
        max={10}
        step={0.5}
        suffix="px"
        onChange={setLineWidth}
      />

      <RangeControl
        label="Line opacity"
        hint="Stroke transparency"
        value={Math.round(lineOpacity * 100)}
        min={20}
        max={100}
        step={5}
        suffix="%"
        onChange={(v) => setLineOpacity(v / 100)}
      />

      <div>
        <SectionLabel icon={CircleDot}>Data point markers</SectionLabel>
        <ToggleRow
          label="Show point markers"
          checked={showMarkers}
          onChange={setShowMarkers}
        />
        {showMarkers && (
          <div className="mt-3 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              {MARKER_SHAPES.filter((m) => m.id !== "none").map((m) => {
                const active = markerShape === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMarkerShape(m.id)}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? "bg-brandColor text-white border-brandColor"
                        : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <MarkerShape
                        shape={m.id}
                        cx={9}
                        cy={9}
                        size={5}
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth={0}
                      />
                    </svg>
                    <span className="text-[10px] font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>
            <RangeControl
              label="Marker size"
              hint="Radius"
              value={markerSize}
              min={1.5}
              max={9}
              step={0.5}
              suffix="px"
              onChange={setMarkerSize}
            />
            <RangeControl
              label="Marker border"
              hint="Outline width"
              value={markerBorderWidth}
              min={0}
              max={5}
              step={0.5}
              suffix="px"
              onChange={setMarkerBorderWidth}
            />
            <ToggleRow
              label="Filled markers (off = hollow)"
              checked={markerFilled}
              onChange={setMarkerFilled}
            />
          </div>
        )}
      </div>

      <div>
        <SectionLabel icon={AreaChart}>Area fill</SectionLabel>
        <ToggleRow
          label="Fill area under each line"
          checked={showArea}
          onChange={setShowArea}
        />
        {showArea && (
          <div className="mt-3 flex flex-col gap-4">
            <RangeControl
              label="Fill opacity"
              value={areaOpacity}
              min={4}
              max={80}
              step={2}
              suffix="%"
              onChange={setAreaOpacity}
            />
            <ToggleRow
              label="Fade fill to transparent (gradient)"
              checked={areaGradient}
              onChange={setAreaGradient}
            />
          </div>
        )}
        <div className="mt-3">
          <ToggleRow
            label="Stack series into a combined area"
            checked={stacked}
            onChange={setStacked}
          />
          {stacked && (
            <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
              Stacking sums the visible series at every point. Turn on the area
              fill to read the total as one shape.
            </p>
          )}
        </div>
      </div>

      <div>
        <SectionLabel icon={Sun}>Canvas theme</SectionLabel>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <ThemeBtn
            label="Light"
            icon={Sun}
            onClick={() => applyTheme("light")}
          />
          <ThemeBtn
            label="Dark"
            icon={Moon}
            onClick={() => applyTheme("dark")}
          />
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
          <ColorField label="Gridlines" value={gridColor} onChange={setGridColor} />
          <ColorField label="Axis" value={axisColor} onChange={setAxisColor} />
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
        <SectionLabel icon={Maximize2}>Export size</SectionLabel>
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
            min={320}
            max={1200}
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

// ─── Axes panel ──────────────────────────────────────────────────────────────
function AxesPanel({
  showValueAxis,
  setShowValueAxis,
  showCategoryAxis,
  setShowCategoryAxis,
  showGridlines,
  setShowGridlines,
  gridStyle,
  setGridStyle,
  zeroBaseline,
  setZeroBaseline,
  tickCount,
  setTickCount,
  autoScale,
  setAutoScale,
  manualMin,
  setManualMin,
  manualMax,
  setManualMax,
  pointPadding,
  setPointPadding,
  categoryLabelAngle,
  setCategoryLabelAngle,
  axisTitleCategory,
  setAxisTitleCategory,
  axisTitleValue,
  setAxisTitleValue,
}) {
  const angles = [
    { id: 0, label: "0°" },
    { id: 45, label: "45°" },
    { id: 90, label: "90°" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ToggleRow
          label="Show value axis & ticks"
          checked={showValueAxis}
          onChange={setShowValueAxis}
        />
        <ToggleRow
          label="Show category axis"
          checked={showCategoryAxis}
          onChange={setShowCategoryAxis}
        />
        <ToggleRow
          label="Show gridlines"
          checked={showGridlines}
          onChange={setShowGridlines}
        />
        <ToggleRow
          label="Always start value axis at zero"
          checked={zeroBaseline}
          onChange={setZeroBaseline}
        />
      </div>

      {showGridlines && (
        <div>
          <SectionLabel icon={Ruler}>Gridline style</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {GRID_STYLES.map((g) => {
              const active = gridStyle === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGridStyle(g.id)}
                  className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-brandColor text-white border-brandColor"
                      : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <RangeControl
        label="Tick count"
        hint="Approximate gridlines"
        value={tickCount}
        min={2}
        max={12}
        step={1}
        onChange={setTickCount}
      />

      <RangeControl
        label="Point spacing"
        hint="Inset from the plot edges"
        value={pointPadding}
        min={0}
        max={20}
        step={1}
        suffix="%"
        onChange={setPointPadding}
      />

      <div>
        <SectionLabel icon={Ruler}>Value scale</SectionLabel>
        <ToggleRow
          label="Auto scale (nice rounded values)"
          checked={autoScale}
          onChange={setAutoScale}
        />
        {!autoScale && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Minimum
              </label>
              <input
                type="number"
                value={manualMin}
                onChange={(e) => setManualMin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Maximum
              </label>
              <input
                type="number"
                value={manualMax}
                onChange={(e) => setManualMax(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <SectionLabel icon={Type}>Axis titles</SectionLabel>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Category axis title
            </label>
            <input
              type="text"
              value={axisTitleCategory}
              onChange={(e) => setAxisTitleCategory(e.target.value)}
              placeholder="e.g. Month"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Value axis title
            </label>
            <input
              type="text"
              value={axisTitleValue}
              onChange={(e) => setAxisTitleValue(e.target.value)}
              placeholder="e.g. Revenue"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
            />
          </div>
        </div>
      </div>

      <div>
        <SectionLabel icon={Type}>Category label angle</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {angles.map((a) => {
            const active = categoryLabelAngle === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setCategoryLabelAngle(a.id)}
                className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          Rotate labels when point names are long and would overlap.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-brandColor" />
        Turning the zero baseline off lets the axis tighten around your data,
        but keep it on for honest, proportional comparisons.
      </div>
    </div>
  );
}

// ─── Labels panel ────────────────────────────────────────────────────────────
function LabelsPanel({
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
      <div>
        <SectionLabel icon={Tag}>Label content</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {LABEL_FORMATS.map((format) => {
            const active = labelFormat === format.id;
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => setLabelFormat(format.id)}
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
        {labelFormat !== "none" && (
          <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
            Tip: value labels can get crowded on dense time series. They show for
            every point, and only the hovered point while you are inspecting the
            chart.
          </p>
        )}
      </div>

      {labelFormat !== "none" && (
        <div>
          <SectionLabel icon={ChartNoAxesCombined}>Label placement</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {LABEL_POSITIONS.map((pos) => {
              const active = labelPosition === pos.id;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setLabelPosition(pos.id)}
                  className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-brandColor text-white border-brandColor"
                      : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                  }`}
                >
                  {pos.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
            placeholder="% / kg / K"
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
        The legend mirrors each series&apos; colour, dash pattern and visibility.
        Place it on the top or bottom for short labels and on the side when names
        are long.
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
