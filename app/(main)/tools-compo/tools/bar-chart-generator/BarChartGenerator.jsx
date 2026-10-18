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
  BarChart3,
  BarChartHorizontal,
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
  Sun,
  Moon,
  Hash,
  TrendingUp,
  Layers,
  Ruler,
  Type,
  ArrowUpDown,
} from "lucide-react";
import ToolPageShell from "../../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "@/components/BackButton";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ORIENTATIONS,
  BAR_MODES,
  LABEL_FORMATS,
  LABEL_POSITIONS,
  LEGEND_POSITIONS,
  SORT_MODES,
  PALETTES,
  BAR_FAQS,
  SAMPLE_DATASETS,
  DEFAULT_DATASET_ID,
  DEFAULT_PALETTE_ID,
  getPaletteColor,
} from "./barChartData";
import {
  computeBarLayout,
  contrastColor,
  dataToCsv,
  downloadPng,
  downloadSvgFile,
  formatValue,
  getBarLabelText,
  hexToRgb,
  roundedRectPath,
  serializeSvg,
  truncateText,
  DEFAULT_CHART_HEIGHT,
  DEFAULT_CHART_WIDTH,
} from "./barChartEngine";

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
    values: categories.map((_, i) => Number(s.values?.[i]) || 0),
  }));
  return { categories, series };
}

function lighten(hex, amount = 0.32) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

const CONTROL_TABS = [
  { id: "data", label: "Data", icon: Table2 },
  { id: "style", label: "Style", icon: SlidersHorizontal },
  { id: "axes", label: "Axes", icon: Ruler },
  { id: "labels", label: "Labels", icon: Tag },
  { id: "legend", label: "Legend", icon: ListTree },
];

const SORT_LABEL = { none: "Original", desc: "Largest", asc: "Smallest" };

export default function BarChartGenerator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Bar Chart Generator",
      link: "/tools/bar-chart-generator",
      icon: "BarChart3",
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

  // ── Chart type ─────────────────────────────────────────────────────────────
  const [orientation, setOrientation] = useState("vertical");
  const [mode, setMode] = useState("grouped");

  // ── Bar style ──────────────────────────────────────────────────────────────
  const [barWidthPct, setBarWidthPct] = useState(66);
  const [groupGap, setGroupGap] = useState(6);
  const [cornerRadius, setCornerRadius] = useState(4);
  const [gradient, setGradient] = useState(true);
  const [barOpacity, setBarOpacity] = useState(1);
  const [shadow, setShadow] = useState(false);

  // ── Axes ───────────────────────────────────────────────────────────────────
  const [showValueAxis, setShowValueAxis] = useState(true);
  const [showCategoryAxis, setShowCategoryAxis] = useState(true);
  const [showGridlines, setShowGridlines] = useState(true);
  const [zeroBaseline, setZeroBaseline] = useState(true);
  const [tickCount, setTickCount] = useState(5);
  const [categoryLabelAngle, setCategoryLabelAngle] = useState(0);
  const [axisTitleCategory, setAxisTitleCategory] = useState("Quarter");
  const [axisTitleValue, setAxisTitleValue] = useState("Revenue");

  // ── Labels / number format ─────────────────────────────────────────────────
  const [labelFormat, setLabelFormat] = useState("value");
  const [labelPosition, setLabelPosition] = useState("outside");
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
  const [title, setTitle] = useState("Quarterly Revenue");
  const [subtitle, setSubtitle] = useState("USD thousands · 2024 vs 2025");

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

  const svgRef = useRef(null);

  // ── Ordered data (sort) ────────────────────────────────────────────────────
  const { orderedCategories, orderedSeries } = useMemo(() => {
    const totals = categories.map((_, i) =>
      series.reduce((a, s) => a + (Number(s.values[i]) || 0), 0)
    );
    const indices = categories.map((_, i) => i);
    if (sortMode === "desc") indices.sort((a, b) => totals[b] - totals[a]);
    else if (sortMode === "asc") indices.sort((a, b) => totals[a] - totals[b]);

    const cats = indices.map((i) => categories[i]);
    const sers = series.map((s) => ({
      ...s,
      values: indices.map((i) => Number(s.values[i]) || 0),
    }));
    return { orderedCategories: cats, orderedSeries: sers };
  }, [categories, series, sortMode]);

  const grandTotal = useMemo(
    () =>
      orderedSeries.reduce(
        (sum, s) => sum + s.values.reduce((a, v) => a + (v || 0), 0),
        0
      ),
    [orderedSeries]
  );

  const maxValue = useMemo(() => {
    let max = 0;
    orderedSeries.forEach((s) =>
      s.values.forEach((v) => {
        if (Math.abs(v) > Math.abs(max)) max = v;
      })
    );
    return max;
  }, [orderedSeries]);

  const seriesTotals = useMemo(
    () =>
      orderedSeries.map((s) =>
        s.values.reduce((a, v) => a + (Number(v) || 0), 0)
      ),
    [orderedSeries]
  );

  const fmtOptions = useMemo(
    () => ({ thousands: useThousands, compact, prefix, suffix }),
    [useThousands, compact, prefix, suffix]
  );

  // ── Layout ─────────────────────────────────────────────────────────────────
  const layout = useMemo(
    () =>
      computeBarLayout({
        width: chartWidth,
        height: chartHeight,
        title,
        subtitle,
        orientation,
        mode,
        series: orderedSeries,
        categories: orderedCategories,
        barWidthPct,
        groupGap,
        cornerRadius,
        showValueAxis,
        showCategoryAxis,
        showGridlines,
        zeroBaseline,
        tickCount,
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
      }),
    [
      chartWidth,
      chartHeight,
      title,
      subtitle,
      orientation,
      mode,
      orderedSeries,
      orderedCategories,
      barWidthPct,
      groupGap,
      cornerRadius,
      showValueAxis,
      showCategoryAxis,
      showGridlines,
      zeroBaseline,
      tickCount,
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
    ]
  );

  // ── Data handlers ──────────────────────────────────────────────────────────
  const addCategory = () => {
    if (categories.length >= 16) {
      toast.info("16 categories is the maximum — keep charts readable!");
      return;
    }
    setCategories((prev) => [
      ...prev,
      { id: createId("cat"), label: `Item ${prev.length + 1}` },
    ]);
    setSeries((prev) =>
      prev.map((s) => ({ ...s, values: [...s.values, 10] }))
    );
    toast.success("Category added");
  };

  const removeCategory = (index) => {
    if (categories.length <= 1) {
      toast.error("Keep at least one category in the chart.");
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
    setCategories(next.categories);
    setSeries(next.series);
    setTitle(dataset.name);
    setSubtitle(dataset.unit || "");
    setSortMode("none");
    toast.success(`Loaded “${dataset.name}”`);
  };

  const handleRandomize = () => {
    const randomPalette =
      PALETTES[Math.floor(Math.random() * PALETTES.length)];
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
    setOrientation("vertical");
    setMode("grouped");
    setBarWidthPct(66);
    setGroupGap(6);
    setCornerRadius(4);
    setGradient(true);
    setBarOpacity(1);
    setShadow(false);
    setShowValueAxis(true);
    setShowCategoryAxis(true);
    setShowGridlines(true);
    setZeroBaseline(true);
    setTickCount(5);
    setCategoryLabelAngle(0);
    setAxisTitleCategory("Quarter");
    setAxisTitleValue("Revenue");
    setLabelFormat("value");
    setLabelPosition("outside");
    setDecimals(0);
    setUseThousands(true);
    setCompact(false);
    setPrefix("");
    setSuffix("");
    setShowLegend(true);
    setLegendPosition("top");
    setShowLegendValues(false);
    setTitle("Quarterly Revenue");
    setSubtitle("USD thousands · 2024 vs 2025");
    setTransparentBg(false);
    setBgColor("#ffffff");
    setTextColor("#0f172a");
    setGridColor("#e2e8f0");
    setAxisColor("#94a3b8");
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
        "bar-chart.png",
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
      downloadSvgFile(svgRef.current, chartWidth, chartHeight, "bar-chart.svg");
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
      "bar-chart-data.csv",
      "CSV downloaded"
    );
  };

  const handleDownloadJson = () => {
    const payload = {
      title,
      subtitle,
      orientation,
      mode,
      unit: subtitle,
      categories: orderedCategories.map((c) => c.label),
      series: orderedSeries.map((s) => ({
        name: s.name,
        color: s.color,
        values: s.values,
      })),
      total: grandTotal,
    };
    downloadBlobFile(
      JSON.stringify(payload, null, 2),
      "application/json",
      "bar-chart-data.json",
      "JSON downloaded"
    );
  };

  const toolInfo = {
    title: "Bar Chart Generator",
    link: "/tools/bar-chart-generator",
  };

  const hoverCss = `
    .bar-rect { transition: opacity .18s ease, filter .18s ease; cursor: pointer; }
    .bar-chart-root:hover .bar-rect { opacity: .45; }
    .bar-chart-root .bar-rect:hover { opacity: 1; filter: brightness(1.06) saturate(1.06); }
  `;

  const mutedColor = textColor === "#f8fafc" ? "#94a3b8" : "#64748b";
  const activeOrientation = ORIENTATIONS.find((o) => o.id === orientation);
  const activeMode = BAR_MODES.find((m) => m.id === mode);

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
            <BarChart3 className="w-3.5 h-3.5 text-brandColor" />
            <span>Bar &amp; Column Chart Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Bar Chart Generator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Turn plain numbers into clean, presentation-ready bar and column
            charts. Add multiple series, switch between grouped and stacked
            bars, fine-tune axes, labels and legends, then export a crisp PNG or
            scalable SVG — all 100% in your browser.
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
                  {activeOrientation?.label} · {activeMode?.label} ·{" "}
                  {orderedSeries.length}{" "}
                  {orderedSeries.length === 1 ? "series" : "series"}
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
              <BarChartSvg
                svgRef={svgRef}
                css={hoverCss}
                layout={layout}
                series={orderedSeries}
                config={{
                  title,
                  subtitle,
                  textColor,
                  mutedColor,
                  gridColor,
                  axisColor,
                  transparentBg,
                  bgColor,
                  labelFormat,
                  labelPosition,
                  decimals,
                  fmtOptions,
                  gradient,
                  barOpacity,
                  shadow,
                  showValueAxis,
                  showCategoryAxis,
                  showGridlines,
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
                label="Categories"
                value={String(orderedCategories.length)}
              />
              <StatCell
                icon={Layers}
                label="Series"
                value={String(orderedSeries.length)}
              />
              <StatCell
                icon={TrendingUp}
                label="Total"
                value={formatValue(grandTotal, { ...fmtOptions, decimals })}
              />
              <StatCell
                icon={BarChart3}
                label="Largest"
                value={formatValue(maxValue, { ...fmtOptions, decimals })}
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
              <ToolBtn
                icon={Spline}
                label="SVG"
                onClick={handleDownloadSvg}
              />
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
                  orderedSeries={orderedSeries}
                  paletteId={paletteId}
                  addCategory={addCategory}
                  removeCategory={removeCategory}
                  updateCategoryLabel={updateCategoryLabel}
                  addSeries={addSeries}
                  removeSeries={removeSeries}
                  updateSeriesName={updateSeriesName}
                  updateSeriesColor={updateSeriesColor}
                  updateSeriesValue={updateSeriesValue}
                  applyPalette={applyPalette}
                  loadDataset={loadDataset}
                />
              )}

              {activeTab === "style" && (
                <StylePanel
                  orientation={orientation}
                  setOrientation={setOrientation}
                  mode={mode}
                  setMode={setMode}
                  barWidthPct={barWidthPct}
                  setBarWidthPct={setBarWidthPct}
                  groupGap={groupGap}
                  setGroupGap={setGroupGap}
                  cornerRadius={cornerRadius}
                  setCornerRadius={setCornerRadius}
                  gradient={gradient}
                  setGradient={setGradient}
                  barOpacity={barOpacity}
                  setBarOpacity={setBarOpacity}
                  shadow={shadow}
                  setShadow={setShadow}
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
                  zeroBaseline={zeroBaseline}
                  setZeroBaseline={setZeroBaseline}
                  tickCount={tickCount}
                  setTickCount={setTickCount}
                  categoryLabelAngle={categoryLabelAngle}
                  setCategoryLabelAngle={setCategoryLabelAngle}
                  orientation={orientation}
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
              {activeMode?.label.toLowerCase()}
            </strong>{" "}
            {orientation === "vertical" ? "column" : "bar"} chart with{" "}
            {orderedCategories.length} categories and {orderedSeries.length}{" "}
            series.
          </div>
        </div>
      </div>

      {/* ── Educational guide + FAQ ────────────────────────────────────────── */}
      <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-12">
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-brandColor/10 dark:bg-brandColor/20 text-brandColor mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Anatomy of a great chart</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Reading &amp; designing bar charts that work
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A quick reference on scales, sorting and bar lengths to build
              clear, honest charts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GuideCard
              accent="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
              badge="0"
              title="Always start at zero"
              body="Bar length encodes value, so the axis must begin at zero. Truncating it exaggerates small differences and misleads your audience. Keep the Zero baseline option on."
            />
            <GuideCard
              accent="bg-violet-50 dark:bg-violet-950/60 text-brandColor"
              badge="▥"
              title="Grouped vs stacked"
              body="Grouped bars compare individual values across series; stacked bars emphasise the category total and each series' share. Use grouping for comparison and stacking for composition."
            />
            <GuideCard
              accent="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
              badge="↕"
              title="Sort for clarity"
              body="Unless your categories have a natural order (like months or quarters), sort bars from largest to smallest so the ranking is obvious at a glance."
            />
            <GuideCard
              accent="bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400"
              badge="Aa"
              title="Label with units"
              body="Add a currency prefix and a unit suffix so each bar reads unambiguously, and prefer horizontal bars when your category names are long."
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
              Everything you need to know about creating bar and column charts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {BAR_FAQS.map((faq, index) => {
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

// ─── Bar chart SVG ───────────────────────────────────────────────────────────
function BarChartSvg({ svgRef, css, layout, series, config, grandTotal }) {
  const {
    title,
    subtitle,
    textColor,
    mutedColor,
    gridColor,
    axisColor,
    transparentBg,
    bgColor,
    labelFormat,
    labelPosition,
    decimals,
    fmtOptions,
    gradient,
    barOpacity,
    shadow,
    showValueAxis,
    showCategoryAxis,
    showGridlines,
    categoryLabelAngle,
    showLegendValues,
    axisTitleCategory,
    axisTitleValue,
  } = config;

  const { width, height, plot, ticks, categories, legend, vertical, total } =
    layout;

  const showBars = series.length > 0 && categories.length > 0;

  const catMaxChars = vertical
    ? Math.max(
        3,
        Math.floor(
          (layout.bandSize * 0.92) / (12 * 0.56)
        )
      )
    : Math.max(3, Math.floor((plot.x - layout.pad - 10) / (12 * 0.56)));

  const plotCenterX = plot.x + plot.w / 2;
  const plotCenterY = plot.y + plot.h / 2;

  const rawZero = layout.valueToPos(0);
  const baselinePos = vertical
    ? Math.max(plot.y, Math.min(plot.y + plot.h, rawZero))
    : Math.max(plot.x, Math.min(plot.x + plot.w, rawZero));

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title || "Bar chart"}
      className="w-full h-auto"
      style={{ maxWidth: `${width}px`, fontFamily: FONT_STACK }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <defs>
        <filter id="barShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="5"
            floodColor="#0f172a"
            floodOpacity="0.2"
          />
        </filter>
        {gradient &&
          series.map((s) => (
            <linearGradient
              key={s.id}
              id={`bar-grad-${s.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={lighten(s.color, 0.34)} />
              <stop offset="100%" stopColor={s.color} />
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
          {ticks.map((tick, index) => {
            if (vertical) {
              return (
                <line
                  key={index}
                  x1={plot.x}
                  x2={plot.x + plot.w}
                  y1={tick.pos}
                  y2={tick.pos}
                  stroke={tick.value === 0 ? "none" : gridColor}
                  strokeWidth={1}
                />
              );
            }
            return (
              <line
                key={index}
                y1={plot.y}
                y2={plot.y + plot.h}
                x1={tick.pos}
                x2={tick.pos}
                stroke={tick.value === 0 ? "none" : gridColor}
                strokeWidth={1}
              />
            );
          })}
        </g>
      )}

      {/* Axis lines */}
      {showValueAxis &&
        (vertical ? (
          <line
            x1={plot.x}
            x2={plot.x}
            y1={plot.y}
            y2={plot.y + plot.h}
            stroke={axisColor}
            strokeWidth={1.4}
          />
        ) : (
          <line
            x1={plot.x}
            x2={plot.x + plot.w}
            y1={plot.y + plot.h}
            y2={plot.y + plot.h}
            stroke={axisColor}
            strokeWidth={1.4}
          />
        ))}
      {showCategoryAxis &&
        (vertical ? (
          <line
            x1={plot.x}
            x2={plot.x + plot.w}
            y1={baselinePos}
            y2={baselinePos}
            stroke={axisColor}
            strokeWidth={1.4}
          />
        ) : (
          <line
            x1={baselinePos}
            x2={baselinePos}
            y1={plot.y}
            y2={plot.y + plot.h}
            stroke={axisColor}
            strokeWidth={1.4}
          />
        ))}

      {/* Bars */}
      {showBars && (
        <g
          className="bar-chart-root"
          filter={shadow ? "url(#barShadow)" : undefined}
        >
          {categories.map((cat) =>
            cat.bars.map((bar, j) => {
              if (bar.w <= 0 || bar.h <= 0) return null;
              const path = roundedRectPath(bar.x, bar.y, bar.w, bar.h, bar.corner);
              return (
                <path
                  key={`${cat.id}-${bar.seriesId}-${j}`}
                  d={path}
                  fill={gradient ? `url(#bar-grad-${bar.seriesId})` : bar.color}
                  opacity={barOpacity}
                  className="bar-rect"
                />
              );
            })
          )}
        </g>
      )}

      {/* Value axis ticks + labels */}
      {showValueAxis &&
        ticks.map((tick, index) => {
          const label = formatValue(tick.value, { ...fmtOptions, decimals });
          if (vertical) {
            return (
              <text
                key={index}
                x={plot.x - 9}
                y={tick.pos}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={12}
                fill={mutedColor}
              >
                {label}
              </text>
            );
          }
          return (
            <text
              key={index}
              x={tick.pos}
              y={plot.y + plot.h + 16}
              textAnchor="middle"
              fontSize={12}
              fill={mutedColor}
            >
              {label}
            </text>
          );
        })}

      {/* Category labels */}
      {showCategoryAxis &&
        categories.map((cat) => {
          const label = truncateText(cat.label, catMaxChars);
          if (vertical) {
            if (categoryLabelAngle === 0) {
              return (
                <text
                  key={cat.id}
                  x={cat.center}
                  y={plot.y + plot.h + 17}
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
                x={cat.center}
                y={plot.y + plot.h + 14}
                textAnchor="end"
                fontSize={12}
                fontWeight={600}
                fill={textColor}
                transform={`rotate(-${categoryLabelAngle} ${cat.center} ${
                  plot.y + plot.h + 14
                })`}
              >
                {label}
              </text>
            );
          }
          return (
            <text
              key={cat.id}
              x={plot.x - 10}
              y={cat.center}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={600}
              fill={textColor}
            >
              {label}
            </text>
          );
        })}

      {/* Axis titles */}
      {axisTitleCategory && vertical && (
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
      {axisTitleCategory && !vertical && (
        <text
          x={layout.pad + 12}
          y={plotCenterY}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={mutedColor}
          transform={`rotate(-90 ${layout.pad + 12} ${plotCenterY})`}
        >
          {axisTitleCategory}
        </text>
      )}
      {axisTitleValue && vertical && (
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
      {axisTitleValue && !vertical && (
        <text
          x={plotCenterX}
          y={height - layout.pad + 2}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={mutedColor}
        >
          {axisTitleValue}
        </text>
      )}

      {/* Data labels */}
      {labelFormat !== "none" && showBars && (
        <g pointerEvents="none">
          {categories.map((cat) =>
            cat.bars.map((bar, j) => {
              if (bar.value === 0) return null;
              const text = getBarLabelText(
                bar,
                labelFormat,
                decimals,
                grandTotal || total,
                fmtOptions
              );

              if (!vertical && bar.w < 26 && labelPosition !== "outside") {
                return null;
              }
              if (vertical && bar.h < 16 && labelPosition !== "outside") {
                return null;
              }

              let x = bar.cx;
              let y = bar.cy;
              let anchor = "middle";
              let baseline = "middle";
              let fill = textColor;

              if (labelPosition === "center") {
                fill = contrastColor(bar.color);
              } else if (labelPosition === "inside") {
                fill = contrastColor(bar.color);
                if (vertical) {
                  y = bar.dir > 0 ? bar.y + 12 : bar.y + bar.h - 12;
                } else {
                  anchor = bar.dir > 0 ? "end" : "start";
                  x = bar.dir > 0 ? bar.x + bar.w - 8 : bar.x + 8;
                }
              } else {
                // outside
                if (vertical) {
                  y = bar.dir > 0 ? bar.y - 6 : bar.y + bar.h + 6;
                  baseline = bar.dir > 0 ? "auto" : "hanging";
                } else {
                  anchor = bar.dir > 0 ? "start" : "end";
                  x = bar.dir > 0 ? bar.x + bar.w + 6 : bar.x - 6;
                }
              }

              return (
                <text
                  key={`${cat.id}-${bar.seriesId}-lbl-${j}`}
                  x={x}
                  y={y}
                  textAnchor={anchor}
                  dominantBaseline={baseline}
                  fontSize={12}
                  fontWeight={700}
                  fill={fill}
                >
                  {text}
                </text>
              );
            })
          )}
        </g>
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
            return (
              <g key={item.id}>
                <rect
                  x={pos.x}
                  y={pos.y + 4}
                  width={legend.marker}
                  height={legend.marker}
                  rx={3.5}
                  fill={item.color}
                />
                <text
                  x={pos.x + legend.marker + 8}
                  y={pos.y + 14.5}
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
                    y={pos.y + 14.5}
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
              className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50"
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
          <SectionLabel icon={Table2}>
            Data ({categories.length})
          </SectionLabel>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brandColor/10 hover:bg-brandColor/20 text-brandColor text-[11px] font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add category
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
                Category
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
                    value={s.values[i] ?? 0}
                    onChange={(e) =>
                      updateSeriesValue(
                        s.id,
                        i,
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono text-right text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                    title={`${s.name} · ${cat.label}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => removeCategory(i)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer flex items-center justify-center"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1">
          <span>
            {categories.length} categories × {series.length}{" "}
            {series.length === 1 ? "series" : "series"}
          </span>
          <span className="text-gray-400">Negative values supported</span>
        </div>
      </div>
    </div>
  );
}

// ─── Style panel ─────────────────────────────────────────────────────────────
function StylePanel({
  orientation,
  setOrientation,
  mode,
  setMode,
  barWidthPct,
  setBarWidthPct,
  groupGap,
  setGroupGap,
  cornerRadius,
  setCornerRadius,
  gradient,
  setGradient,
  barOpacity,
  setBarOpacity,
  shadow,
  setShadow,
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
        <SectionLabel icon={BarChart3}>Orientation</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {ORIENTATIONS.map((o) => {
            const active = orientation === o.id;
            const Icon = o.id === "vertical" ? BarChart3 : BarChartHorizontal;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setOrientation(o.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor shadow-xs"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-bold">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel icon={Layers}>Bar mode</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {BAR_MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor shadow-xs"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                <span className="text-[11px] font-bold">{m.label}</span>
                <span
                  className={`text-[9.5px] leading-tight ${
                    active ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {m.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <RangeControl
        label="Bar width"
        hint="Share of each category band"
        value={barWidthPct}
        min={10}
        max={100}
        step={1}
        suffix="%"
        onChange={setBarWidthPct}
      />

      {mode === "grouped" && (
        <RangeControl
          label="Group gap"
          hint="Space between bars in a group"
          value={groupGap}
          min={0}
          max={24}
          step={1}
          suffix="px"
          onChange={setGroupGap}
        />
      )}

      <RangeControl
        label="Corner radius"
        hint="Rounded bar ends"
        value={cornerRadius}
        min={0}
        max={24}
        step={1}
        suffix="px"
        onChange={setCornerRadius}
      />

      <RangeControl
        label="Bar opacity"
        hint="Fill transparency"
        value={Math.round(barOpacity * 100)}
        min={20}
        max={100}
        step={5}
        suffix="%"
        onChange={(v) => setBarOpacity(v / 100)}
      />

      <div className="flex flex-col gap-2">
        <ToggleRow
          label="Gradient fill"
          checked={gradient}
          onChange={setGradient}
        />
        <ToggleRow
          label="Drop shadow on bars"
          checked={shadow}
          onChange={setShadow}
        />
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
  zeroBaseline,
  setZeroBaseline,
  tickCount,
  setTickCount,
  categoryLabelAngle,
  setCategoryLabelAngle,
  orientation,
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

      <RangeControl
        label="Tick count"
        hint="Approximate gridlines"
        value={tickCount}
        min={2}
        max={12}
        step={1}
        onChange={setTickCount}
      />

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
              placeholder="e.g. Quarter"
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

      {orientation === "vertical" && (
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
            Rotate labels when category names are long and would overlap.
          </p>
        </div>
      )}

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
      </div>

      <div>
        <SectionLabel icon={BarChart3}>Label placement</SectionLabel>
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
        Two or three series read best on top or bottom; place the legend on the
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
