"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  PieChart,
  Donut,
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
  Crosshair,
  FileJson,
  FileSpreadsheet,
  ImageDown,
  Spline,
  ArrowUp,
  ArrowDown,
  Eye,
  Sun,
  Moon,
  BarChart3,
  TrendingUp,
  Hash,
} from "lucide-react";
import ToolPageShell from "../../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "@/components/BackButton";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  CHART_TYPES,
  LABEL_FORMATS,
  LABEL_POSITIONS,
  LEGEND_POSITIONS,
  PALETTES,
  PIE_FAQS,
  SAMPLE_DATASETS,
  DEFAULT_PALETTE_ID,
  getPalette,
  getPaletteColor,
} from "./pieChartData";
import {
  buildSlicePath,
  computeLayout,
  computeSlices,
  contrastColor,
  downloadPng,
  downloadSvgFile,
  formatCompact,
  formatNumber,
  getLabelText,
  polarToCartesian,
  serializeSvg,
  slicesToCsv,
  DEFAULT_CHART_HEIGHT,
  DEFAULT_CHART_WIDTH,
} from "./pieChartEngine";

import ChartDataImport from "../_shared/ChartDataImport";

const FONT_STACK =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

let idCounter = 0;
const createId = () => `slice-${Date.now().toString(36)}-${idCounter++}`;

const makeSlices = (rows = []) =>
  rows.map((row, index) => ({
    id: createId(),
    label: row.label,
    value: row.value,
    color: row.color || getPaletteColor(DEFAULT_PALETTE_ID, index),
    exploded: false,
  }));

const CONTROL_TABS = [
  { id: "data", label: "Data", icon: Table2 },
  { id: "style", label: "Style", icon: SlidersHorizontal },
  { id: "labels", label: "Labels", icon: Tag },
  { id: "legend", label: "Legend", icon: ListTree },
];

export default function PieChartGenerator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Pie Chart Generator",
      link: "/tools/pie-chart-generator",
      icon: "PieChart",
    });
  }, [addRecentTool]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const [slices, setSlices] = useState(() =>
    makeSlices(SAMPLE_DATASETS[0].slices)
  );
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);
  const [sortDescending, setSortDescending] = useState(false);

  // ── Chart style ────────────────────────────────────────────────────────────
  const [chartType, setChartType] = useState("pie");
  const [innerRadius, setInnerRadius] = useState(58);
  const [startAngle, setStartAngle] = useState(0);
  const [clockwise, setClockwise] = useState(true);
  const [gapAngle, setGapAngle] = useState(2);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [explodeDistance, setExplodeDistance] = useState(14);
  const [shadow, setShadow] = useState(true);

  // ── Canvas / theme ─────────────────────────────────────────────────────────
  const [transparentBg, setTransparentBg] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0f172a");
  const [chartWidth, setChartWidth] = useState(DEFAULT_CHART_WIDTH);
  const [chartHeight, setChartHeight] = useState(DEFAULT_CHART_HEIGHT);

  // ── Labels ─────────────────────────────────────────────────────────────────
  const [labelFormat, setLabelFormat] = useState("percent");
  const [labelPosition, setLabelPosition] = useState("inside");
  const [decimals, setDecimals] = useState(1);
  const [centerLabel, setCenterLabel] = useState("Total");
  const [showCenterValue, setShowCenterValue] = useState(true);

  // ── Title ──────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("Website Traffic Sources");
  const [subtitle, setSubtitle] = useState("Share of sessions · last 30 days");

  // ── Legend ─────────────────────────────────────────────────────────────────
  const [legendPosition, setLegendPosition] = useState("right");
  const [showLegendValues, setShowLegendValues] = useState(true);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("data");
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [pngScale, setPngScale] = useState(2);
  const [openFaq, setOpenFaq] = useState(0);

  const svgRef = useRef(null);

  // ── Derived geometry ───────────────────────────────────────────────────────
  const { slices: computedSlices, total } = useMemo(
    () => computeSlices(slices, { startAngle, clockwise, gapAngle }),
    [slices, startAngle, clockwise, gapAngle]
  );

  const layout = useMemo(
    () =>
      computeLayout({
        width: chartWidth,
        height: chartHeight,
        title,
        subtitle,
        showLegend: legendPosition !== "none",
        legendPosition,
        showLegendValues,
        legendLabels: computedSlices.map((s) => s.label),
        labelPosition,
        chartType,
        innerRadius,
        hasOutsideLabels: computedSlices.length > 0,
      }),
    [
      chartWidth,
      chartHeight,
      title,
      subtitle,
      legendPosition,
      showLegendValues,
      computedSlices,
      labelPosition,
      chartType,
      innerRadius,
    ]
  );

  const insideLabelRadius = useMemo(() => {
    if (layout.rInner > 0) return (layout.rOuter + layout.rInner) / 2;
    return layout.rOuter * 0.62;
  }, [layout.rOuter, layout.rInner]);

  const topSlice = computedSlices.reduce(
    (best, s) => (s.value > (best?.value ?? -Infinity) ? s : best),
    null
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const addSlice = () => {
    if (slices.length >= 16) {
      toast.info("16 slices is the maximum — keep charts readable!");
      return;
    }
    setSlices((prev) => [
      ...prev,
      {
        id: createId(),
        label: `Category ${prev.length + 1}`,
        value: 10,
        color: getPaletteColor(paletteId, prev.length),
        exploded: false,
      },
    ]);
    toast.success("Slice added");
  };

  const removeSlice = (id) => {
    if (slices.length <= 1) {
      toast.error("Keep at least one slice in the chart.");
      return;
    }
    setSlices((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSlice = (id, key, value) => {
    setSlices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  const toggleExplode = (id) => {
    setSlices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, exploded: !s.exploded } : s))
    );
  };

  const applyPalette = useCallback((id) => {
    setPaletteId(id);
    setSlices((prev) =>
      prev.map((s, index) => ({ ...s, color: getPaletteColor(id, index) }))
    );
  }, []);

  const loadDataset = (dataset) => {
    setSlices(makeSlices(dataset.slices));
    toast.success(`Loaded “${dataset.name}”`);
  };

  // ── CSV / Excel import ─────────────────────────────────────────────────────
  // One label column + one value column become the slices, coloured from the
  // active palette.
  const handleImportedRows = useCallback(
    ({ rows, fileName }) => {
      setSlices(
        rows.map((row, index) => ({
          id: createId(),
          label: row.label,
          value: row.value,
          color: getPaletteColor(paletteId, index),
          exploded: false,
        }))
      );
      const baseName = String(fileName || "").replace(/\.[^.]+$/, "").trim();
      setTitle(baseName || `${rows.length} slices`);
      setSubtitle(`${rows.length} slices · imported data`);
      setSortDescending(false);
    },
    [paletteId]
  );

  const handleRandomize = () => {
    const randomPalette =
      PALETTES[Math.floor(Math.random() * PALETTES.length)];
    applyPalette(randomPalette.id);
    toast.success(`Random palette: ${randomPalette.name}`);
  };

  const handleToggleSort = () => {
    const next = !sortDescending;
    setSortDescending(next);
    if (next) {
      setSlices((prev) => [...prev].sort((a, b) => b.value - a.value));
    }
  };

  const handleReset = () => {
    setSlices(makeSlices(SAMPLE_DATASETS[0].slices));
    setPaletteId(DEFAULT_PALETTE_ID);
    setChartType("pie");
    setInnerRadius(58);
    setStartAngle(0);
    setClockwise(true);
    setGapAngle(2);
    setCornerRadius(0);
    setExplodeDistance(14);
    setLabelFormat("percent");
    setLabelPosition("inside");
    setLegendPosition("right");
    setShowLegendValues(true);
    setTransparentBg(false);
    setBgColor("#ffffff");
    setTextColor("#0f172a");
    setTitle("Website Traffic Sources");
    setSubtitle("Share of sessions · last 30 days");
    setSortDescending(false);
    toast.info("Reset to defaults");
  };

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
      await navigator.clipboard.writeText(
        slicesToCsv(computedSlices, total, decimals)
      );
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
        "pie-chart.png",
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
      downloadSvgFile(svgRef.current, chartWidth, chartHeight, "pie-chart.svg");
      toast.success("SVG downloaded");
    } catch {
      toast.error("SVG export failed.");
    }
  };

  const handleDownloadCsv = () => {
    const csv = slicesToCsv(computedSlices, total, decimals);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pie-chart-data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast.success("CSV downloaded");
  };

  const handleDownloadJson = () => {
    const payload = {
      title,
      subtitle,
      total,
      chartType,
      slices: computedSlices.map((s) => ({
        label: s.label,
        value: s.value,
        percent: Number(s.percent.toFixed(2)),
        color: s.color,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pie-chart-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast.success("JSON downloaded");
  };

  const applyTheme = (theme) => {
    if (theme === "light") {
      setTransparentBg(false);
      setBgColor("#ffffff");
      setTextColor("#0f172a");
    } else if (theme === "dark") {
      setTransparentBg(false);
      setBgColor("#0b1220");
      setTextColor("#f8fafc");
    } else {
      setTransparentBg(true);
      setTextColor("#0f172a");
    }
  };

  const toolInfo = {
    title: "Pie Chart Generator",
    link: "/tools/pie-chart-generator",
  };

  const hoverCss = `
    .pie-slice { transition: opacity .18s ease, filter .18s ease; cursor: pointer; }
    .pie-chart-root:hover .pie-slice { opacity: .45; }
    .pie-chart-root .pie-slice:hover { opacity: 1; filter: brightness(1.06) saturate(1.06); }
    .pie-legend-item { transition: opacity .18s ease; }
  `;

  const mutedColor = textColor === "#f8fafc" ? "#94a3b8" : "#64748b";

  // ── Legend item positions ──────────────────────────────────────────────────
  const legendItems = useMemo(() => {
    if (!layout.legendVisible) return [];
    return computedSlices.map((slice, index) => {
      const stacked = !layout.legendOnSide;
      const col = stacked ? index % layout.legendPerRow : 0;
      const row = stacked
        ? Math.floor(index / layout.legendPerRow)
        : index;
      return {
        slice,
        x: layout.legendX + col * layout.legendItemWidth,
        y: layout.legendY + row * layout.legendRowHeight,
      };
    });
  }, [computedSlices, layout]);

  const activeChartTab = CHART_TYPES.find((t) => t.id === chartType);

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

          <div className="flex items-center gap-2">
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
              onClick={handleToggleSort}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
                sortDescending
                  ? "bg-brandColor text-white border-brandColor"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
              title="Sort slices from largest to smallest"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Sort Largest</span>
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
            <PieChart className="w-3.5 h-3.5 text-brandColor" />
            <span>Pie &amp; Donut Chart Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Pie Chart Generator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Build clean, presentation-ready pie and donut charts in seconds.
            Enter your data, pick a palette, fine-tune labels and legend, then
            export a crisp PNG or scalable SVG — all 100% in your browser.
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
                  {activeChartTab?.label} · {computedSlices.length} slices
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
                  placeholder="Subtitle (optional)"
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
              {computedSlices.length > 0 ? (
                <ChartSvg
                  svgRef={svgRef}
                  css={hoverCss}
                  layout={layout}
                  slices={computedSlices}
                  total={total}
                  chartType={chartType}
                  cornerRadius={cornerRadius}
                  explodeDistance={explodeDistance}
                  shadow={shadow}
                  transparentBg={transparentBg}
                  bgColor={bgColor}
                  textColor={textColor}
                  mutedColor={mutedColor}
                  title={title}
                  subtitle={subtitle}
                  labelFormat={labelFormat}
                  labelPosition={labelPosition}
                  decimals={decimals}
                  insideLabelRadius={insideLabelRadius}
                  centerLabel={centerLabel}
                  showCenterValue={showCenterValue}
                  showLegendValues={showLegendValues}
                  legendPosition={legendPosition}
                  legendItems={legendItems}
                />
              ) : (
                <div className="w-full h-64 flex flex-col items-center justify-center text-center text-gray-400">
                  <PieChart className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-sm font-medium">
                    Add at least one value to render your chart
                  </p>
                </div>
              )}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 text-center">
              <StatCell
                icon={Hash}
                label="Slices"
                value={String(computedSlices.length)}
              />
              <StatCell
                icon={BarChart3}
                label="Total"
                value={formatNumber(total, total % 1 === 0 ? 0 : decimals)}
              />
              <StatCell
                icon={TrendingUp}
                label="Top slice"
                value={
                  topSlice
                    ? `${formatNumber(topSlice.percent, decimals)}%`
                    : "—"
                }
                hint={topSlice ? topSlice.label : undefined}
              />
              <StatCell
                icon={Sparkles}
                label="Type"
                value={activeChartTab?.label || "Pie"}
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
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 p-1.5 bg-gray-50/70 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800">
              {CONTROL_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  computedSlices={computedSlices}
                  total={total}
                  decimals={decimals}
                  paletteId={paletteId}
                  addSlice={addSlice}
                  removeSlice={removeSlice}
                  updateSlice={updateSlice}
                  toggleExplode={toggleExplode}
                  applyPalette={applyPalette}
                  loadDataset={loadDataset}
                  onImport={handleImportedRows}
                />
              )}

              {activeTab === "style" && (
                <StylePanel
                  chartType={chartType}
                  setChartType={setChartType}
                  innerRadius={innerRadius}
                  setInnerRadius={setInnerRadius}
                  startAngle={startAngle}
                  setStartAngle={setStartAngle}
                  clockwise={clockwise}
                  setClockwise={setClockwise}
                  gapAngle={gapAngle}
                  setGapAngle={setGapAngle}
                  cornerRadius={cornerRadius}
                  setCornerRadius={setCornerRadius}
                  explodeDistance={explodeDistance}
                  setExplodeDistance={setExplodeDistance}
                  shadow={shadow}
                  setShadow={setShadow}
                  chartWidth={chartWidth}
                  setChartWidth={setChartWidth}
                  chartHeight={chartHeight}
                  setChartHeight={setChartHeight}
                  transparentBg={transparentBg}
                  setTransparentBg={setTransparentBg}
                  bgColor={bgColor}
                  setBgColor={setBgColor}
                  textColor={textColor}
                  setTextColor={setTextColor}
                  applyTheme={applyTheme}
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
                  chartType={chartType}
                  showCenterValue={showCenterValue}
                  setShowCenterValue={setShowCenterValue}
                  centerLabel={centerLabel}
                  setCenterLabel={setCenterLabel}
                />
              )}

              {activeTab === "legend" && (
                <LegendPanel
                  legendPosition={legendPosition}
                  setLegendPosition={setLegendPosition}
                  showLegendValues={showLegendValues}
                  setShowLegendValues={setShowLegendValues}
                />
              )}
            </div>
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
              Reading &amp; designing pie charts that work
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A quick reference on how slice angles, percentages and palettes
              add up to a clear, honest chart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GuideCard
              accent="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
              badge="360°"
              title="Angles are proportions"
              body="Every slice's central angle equals its share of the total. A category worth 42 of 100 becomes 151.2° — exactly 42% of the circle."
            />
            <GuideCard
              accent="bg-violet-50 dark:bg-violet-950/60 text-brandColor"
              badge="≤ 5"
              title="Fewer slices, clearer story"
              body="Pie charts read best with five or fewer slices. Group small categories into an “Other” slice, or switch to a bar chart when precision matters."
            />
            <GuideCard
              accent="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
              badge="↕"
              title="Order by size"
              body="Arranging slices from largest to smallest (clockwise from 12 o'clock) helps people compare them quickly and spot your headline number at a glance."
            />
            <GuideCard
              accent="bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400"
              badge="Aa"
              title="Label with intent"
              body="Show percentages when the whole matters, raw values for budgets, or both. Leader lines keep crowded charts tidy when labels live outside the slices."
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
              Everything you need to know about creating pie and donut charts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {PIE_FAQS.map((faq, index) => {
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

// ─── Chart SVG ───────────────────────────────────────────────────────────────
function ChartSvg({
  svgRef,
  css,
  layout,
  slices,
  total,
  chartType,
  cornerRadius,
  explodeDistance,
  shadow,
  transparentBg,
  bgColor,
  textColor,
  mutedColor,
  title,
  subtitle,
  labelFormat,
  labelPosition,
  decimals,
  insideLabelRadius,
  centerLabel,
  showCenterValue,
  showLegendValues,
  legendPosition,
  legendItems,
}) {
  const {
    width,
    height,
    cx,
    cy,
    rOuter,
    rInner,
    legendRowHeight,
    legendItemWidth,
    legendWidth,
  } = layout;

  const labelThreshold = 3; // percent

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title || "Pie chart"}
      className="w-full h-auto"
      style={{ maxWidth: `${width}px`, fontFamily: FONT_STACK }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <defs>
        <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="8"
            floodColor="#0f172a"
            floodOpacity="0.18"
          />
        </filter>
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

      {/* Slices */}
      <g
        className="pie-chart-root"
        filter={shadow ? "url(#pieShadow)" : undefined}
      >
        {slices.map((slice) => {
          const offset = slice.exploded ? explodeDistance : 0;
          const o = polarToCartesian(0, 0, offset, slice.mid);
          const path = buildSlicePath(
            slice,
            cx,
            cy,
            rOuter,
            rInner,
            cornerRadius
          );
          return (
            <g key={slice.id} transform={`translate(${o.x} ${o.y})`}>
              <path
                d={path}
                fill={slice.color}
                fillRule="evenodd"
                stroke={
                  cornerRadius > 0
                    ? slice.color
                    : transparentBg
                    ? "none"
                    : bgColor
                }
                strokeWidth={cornerRadius > 0 ? cornerRadius * 2 : 1.5}
                strokeLinejoin="round"
                className="pie-slice"
              />
            </g>
          );
        })}
      </g>

      {/* Inside labels */}
      {labelPosition === "inside" && labelFormat !== "none" && (
        <g pointerEvents="none">
          {slices.map((slice) => {
            if (slice.percent < labelThreshold) return null;
            const offset = slice.exploded ? explodeDistance : 0;
            const o = polarToCartesian(0, 0, offset, slice.mid);
            const p = polarToCartesian(cx, cy, insideLabelRadius, slice.mid);
            return (
              <text
                key={slice.id}
                x={p.x + o.x}
                y={p.y + o.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12.5}
                fontWeight={700}
                fill={contrastColor(slice.color)}
              >
                {getLabelText(slice, labelFormat, decimals)}
              </text>
            );
          })}
        </g>
      )}

      {/* Outside labels with leader lines */}
      {labelPosition === "outside" && labelFormat !== "none" && (
        <g pointerEvents="none">
          {slices.map((slice) => {
            const offset = slice.exploded ? explodeDistance : 0;
            const o = polarToCartesian(0, 0, offset, slice.mid);
            const base = polarToCartesian(cx, cy, rOuter + 4, slice.mid);
            const elbow = polarToCartesian(cx, cy, rOuter + 22, slice.mid);
            const start = { x: base.x + o.x, y: base.y + o.y };
            const mid = { x: elbow.x + o.x, y: elbow.y + o.y };
            const rightSide = elbow.x >= cx;
            const endX = mid.x + (rightSide ? 14 : -14);
            return (
              <g key={slice.id}>
                <polyline
                  points={`${start.x},${start.y} ${mid.x},${mid.y} ${endX},${mid.y}`}
                  fill="none"
                  stroke={mutedColor}
                  strokeWidth={1.2}
                />
                <circle cx={start.x} cy={start.y} r={2.4} fill={slice.color} />
                <text
                  x={endX + (rightSide ? 5 : -5)}
                  y={mid.y + 4}
                  textAnchor={rightSide ? "start" : "end"}
                  fontSize={12.5}
                  fontWeight={600}
                  fill={textColor}
                >
                  {slice.label} · {getLabelText(slice, labelFormat, decimals)}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Donut centre label */}
      {chartType === "donut" && rInner > 0 && (
        <g pointerEvents="none">
          {showCenterValue && (
            <text
              x={cx}
              y={cy - 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={30}
              fontWeight={800}
              fill={textColor}
            >
              {formatCompact(total)}
            </text>
          )}
          {centerLabel && (
            <text
              x={cx}
              y={cy + (showCenterValue ? 24 : 0)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={600}
              fill={mutedColor}
              letterSpacing="0.6"
            >
              {centerLabel}
            </text>
          )}
        </g>
      )}

      {/* Legend */}
      {layout.legendVisible && (
        <g className="pie-legend">
          {legendItems.map(({ slice, x, y }) => (
            <g key={slice.id} className="pie-legend-item">
              <rect
                x={x}
                y={y + 3}
                width={13}
                height={13}
                rx={3.5}
                fill={slice.color}
              />
              <text
                x={x + 21}
                y={y + 13.5}
                fontSize={12.5}
                fontWeight={600}
                fill={textColor}
              >
                {truncate(slice.label, layout.legendOnSide ? 16 : 14)}
              </text>
              {showLegendValues && (
                <text
                  x={layout.legendOnSide ? x + legendWidth - 6 : x + legendItemWidth - 12}
                  y={y + 13.5}
                  textAnchor="end"
                  fontSize={12}
                  fontWeight={700}
                  fill={mutedColor}
                >
                  {formatNumber(slice.percent, decimals)}%
                </text>
              )}
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

function truncate(text, max) {
  const value = String(text ?? "");
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
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
  slices,
  computedSlices,
  total,
  decimals,
  paletteId,
  addSlice,
  removeSlice,
  updateSlice,
  toggleExplode,
  applyPalette,
  loadDataset,
  onImport,
}) {
  const percentById = useMemo(() => {
    const map = {};
    computedSlices.forEach((s) => {
      map[s.id] = s.percent;
    });
    return map;
  }, [computedSlices]);

  return (
    <div className="flex flex-col gap-6">
      {/* CSV / Excel import */}
      <ChartDataImport onImport={onImport} mode="single" subject="pie chart" />

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

      {/* Data table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionLabel icon={Table2}>Data ({slices.length})</SectionLabel>
          <button
            type="button"
            onClick={addSlice}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brandColor/10 hover:bg-brandColor/20 text-brandColor text-[11px] font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add slice
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {slices.map((slice) => {
            const percent = percentById[slice.id] ?? 0;
            return (
              <div
                key={slice.id}
                className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50"
              >
                <input
                  type="color"
                  value={slice.color}
                  onChange={(e) => updateSlice(slice.id, "color", e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 bg-transparent p-0 cursor-pointer shrink-0"
                  title="Slice colour"
                />
                <input
                  type="text"
                  value={slice.label}
                  onChange={(e) => updateSlice(slice.id, "label", e.target.value)}
                  placeholder="Label"
                  className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                />
                <input
                  type="number"
                  value={slice.value}
                  min={0}
                  onChange={(e) =>
                    updateSlice(slice.id, "value", Number(e.target.value))
                  }
                  className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono text-right text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                  title="Value"
                />
                <span className="w-12 text-right text-[11px] font-semibold text-gray-400 shrink-0">
                  {formatNumber(percent, decimals)}%
                </span>
                <button
                  type="button"
                  onClick={() => toggleExplode(slice.id)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                    slice.exploded
                      ? "bg-brandColor/15 text-brandColor"
                      : "text-gray-400 hover:text-brandColor hover:bg-brandColor/10"
                  }`}
                  title={slice.exploded ? "Pull slice back in" : "Pull slice out"}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSlice(slice.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer shrink-0"
                  title="Delete slice"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-1">
          <span>
            Total:{" "}
            <span className="font-bold text-gray-800 dark:text-gray-100">
              {formatNumber(total, total % 1 === 0 ? 0 : decimals)}
            </span>
          </span>
          <span>{slices.length} categories</span>
        </div>
      </div>
    </div>
  );
}

// ─── Style panel ─────────────────────────────────────────────────────────────
function StylePanel({
  chartType,
  setChartType,
  innerRadius,
  setInnerRadius,
  startAngle,
  setStartAngle,
  clockwise,
  setClockwise,
  gapAngle,
  setGapAngle,
  cornerRadius,
  setCornerRadius,
  explodeDistance,
  setExplodeDistance,
  shadow,
  setShadow,
  chartWidth,
  setChartWidth,
  chartHeight,
  setChartHeight,
  transparentBg,
  setTransparentBg,
  bgColor,
  setBgColor,
  textColor,
  setTextColor,
  applyTheme,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel icon={Donut}>Chart type</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {CHART_TYPES.map((type) => {
            const active = chartType === type.id;
            const Icon = type.id === "donut" ? Donut : PieChart;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setChartType(type.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor shadow-xs"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-bold">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {chartType === "donut" && (
        <RangeControl
          label="Inner radius"
          hint="Ring thickness"
          value={innerRadius}
          min={20}
          max={82}
          step={1}
          suffix="%"
          onChange={setInnerRadius}
        />
      )}

      <RangeControl
        label="Start angle"
        hint="Rotation"
        value={startAngle}
        min={0}
        max={359}
        step={1}
        suffix="°"
        onChange={setStartAngle}
      />

      <div>
        <SectionLabel icon={ArrowUp}>Direction</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setClockwise(true)}
            className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              clockwise
                ? "bg-brandColor text-white border-brandColor"
                : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800"
            }`}
          >
            Clockwise
          </button>
          <button
            type="button"
            onClick={() => setClockwise(false)}
            className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              !clockwise
                ? "bg-brandColor text-white border-brandColor"
                : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800"
            }`}
          >
            Counter-clockwise
          </button>
        </div>
      </div>

      <RangeControl
        label="Slice gap"
        hint="Separation"
        value={gapAngle}
        min={0}
        max={10}
        step={0.5}
        suffix="°"
        onChange={setGapAngle}
      />

      <RangeControl
        label="Corner radius"
        hint="Rounded slice corners"
        value={cornerRadius}
        min={0}
        max={20}
        step={1}
        suffix="px"
        onChange={setCornerRadius}
      />

      <RangeControl
        label="Explode distance"
        hint="Pull-out offset"
        value={explodeDistance}
        min={0}
        max={40}
        step={1}
        suffix="px"
        onChange={setExplodeDistance}
      />

      <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 cursor-pointer">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          Drop shadow on chart
        </span>
        <input
          type="checkbox"
          checked={shadow}
          onChange={(e) => setShadow(e.target.checked)}
          className="w-4 h-4 rounded accent-brandColor cursor-pointer"
        />
      </label>

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
            max={1400}
            step={10}
            suffix="px"
            onChange={setChartWidth}
            compact
          />
          <RangeControl
            label="Height"
            value={chartHeight}
            min={360}
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

// ─── Labels panel ────────────────────────────────────────────────────────────
function LabelsPanel({
  labelFormat,
  setLabelFormat,
  labelPosition,
  setLabelPosition,
  decimals,
  setDecimals,
  chartType,
  showCenterValue,
  setShowCenterValue,
  centerLabel,
  setCenterLabel,
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
        <SectionLabel icon={PieChart}>Label placement</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {LABEL_POSITIONS.map((pos) => {
            const active = labelPosition === pos.id;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => setLabelPosition(pos.id)}
                className={`px-3 py-2.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
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
        <p className="mt-2 text-[11px] text-gray-400">
          Slices smaller than 3% hide their inside label to avoid clutter.
        </p>
      </div>

      <RangeControl
        label="Decimal places"
        hint="Precision"
        value={decimals}
        min={0}
        max={3}
        step={1}
        onChange={setDecimals}
      />

      <div>
        <SectionLabel icon={Donut}>Donut centre label</SectionLabel>
        {chartType !== "donut" ? (
          <p className="text-[11px] text-gray-400">
            Switch to a Donut chart to display a centre total.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 cursor-pointer">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Show total value
              </span>
              <input
                type="checkbox"
                checked={showCenterValue}
                onChange={(e) => setShowCenterValue(e.target.checked)}
                className="w-4 h-4 rounded accent-brandColor cursor-pointer"
              />
            </label>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Centre caption
              </label>
              <input
                type="text"
                value={centerLabel}
                onChange={(e) => setCenterLabel(e.target.value)}
                placeholder="Total"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Legend panel ────────────────────────────────────────────────────────────
function LegendPanel({
  legendPosition,
  setLegendPosition,
  showLegendValues,
  setShowLegendValues,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionLabel icon={ListTree}>Legend position</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {LEGEND_POSITIONS.map((pos) => {
            const active = legendPosition === pos.id;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => setLegendPosition(pos.id)}
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

      <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 cursor-pointer">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          Show percentage next to each entry
        </span>
        <input
          type="checkbox"
          checked={showLegendValues}
          onChange={(e) => setShowLegendValues(e.target.checked)}
          className="w-4 h-4 rounded accent-brandColor cursor-pointer"
        />
      </label>

      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-brandColor" />
        Place the legend on the right or left for tall charts, and on the
        bottom or top for wide, presentation-style slides.
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
          : "p-3 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-850"
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
