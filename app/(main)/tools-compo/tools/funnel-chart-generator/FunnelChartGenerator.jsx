"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  Filter,
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
  Star,
  ImageDown,
  Spline,
  FileJson,
  FileSpreadsheet,
  Eye,
  Sun,
  Moon,
  BarChart3,
  TrendingUp,
  Hash,
  Percent,
  Layers,
  Palette,
  MoveVertical,
  MoveHorizontal,
  Gauge,
  Target,
  ArrowDown,
} from "lucide-react";
import ToolPageShell from "../../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "@/components/BackButton";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  CHART_SHAPES,
  ORIENTATIONS,
  VALUE_SCALES,
  LABEL_FORMATS,
  LABEL_POSITIONS,
  PERCENT_BASES,
  CONVERSION_FORMATS,
  LEGEND_POSITIONS,
  PALETTES,
  FUNNEL_FAQS,
  SAMPLE_DATASETS,
  DEFAULT_DATASET_ID,
  DEFAULT_PALETTE_ID,
  getPaletteColor,
} from "./funnelChartData";
import {
  computeFunnelLayout,
  computeFunnelMetrics,
  contrastColor,
  downloadPng,
  downloadSvgFile,
  formatNumber,
  formatValue,
  getStageLabelText,
  getConversionText,
  lighten,
  serializeSvg,
  stagesToCsv,
  withAlpha,
  DEFAULT_CHART_WIDTH,
  DEFAULT_CHART_HEIGHT,
} from "./funnelChartEngine";

const FONT_STACK =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

let idCounter = 0;
const createId = () => `stage-${Date.now().toString(36)}-${idCounter++}`;

const makeStages = (rows = []) =>
  rows.map((row, index) => ({
    id: createId(),
    label: row.label,
    value: row.value,
    color: row.color || getPaletteColor(DEFAULT_PALETTE_ID, index),
    highlighted: false,
  }));

const CONTROL_TABS = [
  { id: "data", label: "Data", icon: Table2 },
  { id: "style", label: "Shape", icon: SlidersHorizontal },
  { id: "labels", label: "Labels", icon: Tag },
  { id: "legend", label: "Legend", icon: ListTree },
];

const SHAPE_ICONS = { funnel: Filter, bars: BarChart3, steps: Layers };

const getDataset = (id) =>
  SAMPLE_DATASETS.find((d) => d.id === id) || SAMPLE_DATASETS[0];

export default function FunnelChartGenerator() {
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool({
      title: "Funnel Chart Generator",
      link: "/tools/funnel-chart-generator",
      icon: "Filter",
    });
  }, [addRecentTool]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const [stages, setStages] = useState(() =>
    makeStages(getDataset(DEFAULT_DATASET_ID).stages)
  );
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);

  // ── Shape ──────────────────────────────────────────────────────────────────
  const [shape, setShape] = useState("funnel");
  const [orientation, setOrientation] = useState("vertical");
  const [valueScale, setValueScale] = useState("linear");
  const [minWidthPercent, setMinWidthPercent] = useState(12);
  const [endTaper, setEndTaper] = useState(60);
  const [gap, setGap] = useState(6);
  const [cornerRadius, setCornerRadius] = useState(6);
  const [stageOpacity, setStageOpacity] = useState(100);
  const [gradient, setGradient] = useState(true);
  const [shadow, setShadow] = useState(true);

  // ── Canvas / theme ─────────────────────────────────────────────────────────
  const [transparentBg, setTransparentBg] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0f172a");
  const [chartWidth, setChartWidth] = useState(DEFAULT_CHART_WIDTH);
  const [chartHeight, setChartHeight] = useState(DEFAULT_CHART_HEIGHT);

  // ── Labels ─────────────────────────────────────────────────────────────────
  const [labelFormat, setLabelFormat] = useState("nameValue");
  const [labelPosition, setLabelPosition] = useState("inside");
  const [percentBasis, setPercentBasis] = useState("first");
  const [decimals, setDecimals] = useState(0);
  const [thousands, setThousands] = useState(true);
  const [compact, setCompact] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [showConversion, setShowConversion] = useState(true);
  const [conversionFormat, setConversionFormat] = useState("percent");

  // ── Title ──────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("Sales Pipeline Conversion Funnel");
  const [subtitle, setSubtitle] = useState("Leads to closed-won · Q3 2026");

  // ── Legend ─────────────────────────────────────────────────────────────────
  const [legendPosition, setLegendPosition] = useState("right");
  const [showLegendValues, setShowLegendValues] = useState(true);
  const [showLegendPercent, setShowLegendPercent] = useState(false);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("data");
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [pngScale, setPngScale] = useState(2);
  const [openFaq, setOpenFaq] = useState(0);

  const svgRef = useRef(null);

  const fmtOptions = useMemo(
    () => ({ thousands, compact, prefix, suffix }),
    [thousands, compact, prefix, suffix]
  );

  // ── Derived data ───────────────────────────────────────────────────────────
  const metrics = useMemo(
    () => computeFunnelMetrics(stages, { valueScale }),
    [stages, valueScale]
  );
  const computedStages = metrics.stages;

  const layout = useMemo(
    () =>
      computeFunnelLayout({
        width: chartWidth,
        height: chartHeight,
        title,
        subtitle,
        stages: computedStages,
        shape,
        orientation,
        gap,
        cornerRadius,
        minWidthPercent,
        endTaper: endTaper / 100,
        legendPosition,
        showLegend: legendPosition !== "none",
        showLegendValues: showLegendValues || showLegendPercent,
        showLegendPercent,
        labelPosition,
        decimals,
      }),
    [
      chartWidth,
      chartHeight,
      title,
      subtitle,
      computedStages,
      shape,
      orientation,
      gap,
      cornerRadius,
      minWidthPercent,
      endTaper,
      legendPosition,
      showLegendValues,
      showLegendPercent,
      labelPosition,
      decimals,
    ]
  );

  const overallConversion =
    metrics.first > 0 ? (metrics.last / metrics.first) * 100 : 0;

  const bestStep = useMemo(
    () =>
      computedStages
        .filter((s) => !s.isFirst)
        .reduce(
          (best, s) => (s.percentPrev > (best?.percentPrev ?? -Infinity) ? s : best),
          null
        ),
    [computedStages]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const addStage = () => {
    if (stages.length >= 12) {
      toast.info("12 stages is the maximum — keep funnels readable!");
      return;
    }
    const lastValue = stages[stages.length - 1]?.value || 100;
    setStages((prev) => [
      ...prev,
      {
        id: createId(),
        label: `Stage ${prev.length + 1}`,
        value: Math.max(1, Math.round(lastValue * 0.6)),
        color: getPaletteColor(paletteId, prev.length),
        highlighted: false,
      },
    ]);
    toast.success("Stage added");
  };

  const removeStage = (id) => {
    if (stages.length <= 2) {
      toast.error("Keep at least two stages in the funnel.");
      return;
    }
    setStages((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStage = (id, key, value) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  const toggleHighlight = (id) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, highlighted: !s.highlighted } : s))
    );
  };

  const applyPalette = useCallback((id) => {
    setPaletteId(id);
    setStages((prev) =>
      prev.map((s, index) => ({ ...s, color: getPaletteColor(id, index) }))
    );
  }, []);

  const loadDataset = (dataset) => {
    setStages(makeStages(dataset.stages));
    toast.success(`Loaded “${dataset.name}”`);
  };

  const handleRandomize = () => {
    const randomPalette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    applyPalette(randomPalette.id);
    toast.success(`Random palette: ${randomPalette.name}`);
  };

  const handleReset = () => {
    setStages(makeStages(getDataset(DEFAULT_DATASET_ID).stages));
    setPaletteId(DEFAULT_PALETTE_ID);
    setShape("funnel");
    setOrientation("vertical");
    setValueScale("linear");
    setMinWidthPercent(12);
    setEndTaper(60);
    setGap(6);
    setCornerRadius(6);
    setStageOpacity(100);
    setGradient(true);
    setShadow(true);
    setLabelFormat("nameValue");
    setLabelPosition("inside");
    setPercentBasis("first");
    setDecimals(0);
    setThousands(true);
    setCompact(false);
    setPrefix("");
    setSuffix("");
    setShowConversion(true);
    setConversionFormat("percent");
    setLegendPosition("right");
    setShowLegendValues(true);
    setShowLegendPercent(false);
    setTransparentBg(false);
    setBgColor("#ffffff");
    setTextColor("#0f172a");
    setTitle("Sales Pipeline Conversion Funnel");
    setSubtitle("Leads to closed-won · Q3 2026");
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
      await navigator.clipboard.writeText(stagesToCsv(computedStages, decimals));
      setCopiedData(true);
      toast.success("Funnel data copied as CSV");
      setTimeout(() => setCopiedData(false), 2000);
    } catch {
      toast.error("Could not copy the funnel data.");
    }
  };

  const handleDownloadPng = async () => {
    if (!svgRef.current) return;
    try {
      await downloadPng(
        svgRef.current,
        chartWidth,
        chartHeight,
        "funnel-chart.png",
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
      downloadSvgFile(svgRef.current, chartWidth, chartHeight, "funnel-chart.svg");
      toast.success("SVG downloaded");
    } catch {
      toast.error("SVG export failed.");
    }
  };

  const downloadText = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const handleDownloadCsv = () => {
    downloadText(
      stagesToCsv(computedStages, decimals),
      "funnel-chart-data.csv",
      "text/csv;charset=utf-8"
    );
    toast.success("CSV downloaded");
  };

  const handleDownloadJson = () => {
    const payload = {
      title,
      subtitle,
      shape,
      orientation,
      valueScale,
      first: metrics.first,
      last: metrics.last,
      total: metrics.total,
      overallConversion: Number(overallConversion.toFixed(2)),
      stages: computedStages.map((s) => ({
        label: s.label,
        value: s.value,
        percentOfFirst: Number(s.percentFirst.toFixed(2)),
        percentOfTotal: Number(s.percentTotal.toFixed(2)),
        percentOfPrevious: Number(s.percentPrev.toFixed(2)),
        dropoff: s.dropoff,
        color: s.color,
      })),
    };
    downloadText(
      JSON.stringify(payload, null, 2),
      "funnel-chart-data.json",
      "application/json"
    );
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
    title: "Funnel Chart Generator",
    link: "/tools/funnel-chart-generator",
  };

  const hoverCss = `
    .funnel-seg { transition: opacity .18s ease, filter .18s ease; cursor: pointer; }
    .funnel-root:hover .funnel-seg { opacity: .5; }
    .funnel-root .funnel-seg:hover { opacity: 1; filter: brightness(1.06) saturate(1.06); }
  `;

  const mutedColor = textColor === "#f8fafc" ? "#94a3b8" : "#64748b";
  const activeShape = CHART_SHAPES.find((s) => s.id === shape);

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
            <Filter className="w-3.5 h-3.5 text-brandColor" />
            <span>Conversion &amp; Funnel Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Funnel Chart Generator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Turn any multi-step process into a clean, presentation-ready funnel
            chart. Enter your stages, choose a shape and palette, dial in
            conversion labels and legend, then export a crisp PNG or scalable
            SVG — all 100% in your browser.
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
                  {activeShape?.label} · {computedStages.length} stages
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
              {computedStages.length > 0 ? (
                <FunnelSvg
                  svgRef={svgRef}
                  css={hoverCss}
                  layout={layout}
                  stages={computedStages}
                  decimals={decimals}
                  fmtOptions={fmtOptions}
                  labelFormat={labelFormat}
                  labelPosition={labelPosition}
                  percentBasis={percentBasis}
                  gradient={gradient}
                  shadow={shadow}
                  stageOpacity={stageOpacity}
                  transparentBg={transparentBg}
                  bgColor={bgColor}
                  textColor={textColor}
                  mutedColor={mutedColor}
                  title={title}
                  subtitle={subtitle}
                  showConversion={showConversion}
                  conversionFormat={conversionFormat}
                />
              ) : (
                <div className="w-full h-64 flex flex-col items-center justify-center text-center text-gray-400">
                  <Filter className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-sm font-medium">
                    Add at least two stages to render your funnel
                  </p>
                </div>
              )}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 text-center">
              <StatCell
                icon={Hash}
                label="Stages"
                value={String(computedStages.length)}
              />
              <StatCell
                icon={Target}
                label="Top of funnel"
                value={formatValue(metrics.first, { ...fmtOptions, decimals })}
              />
              <StatCell
                icon={TrendingUp}
                label="Best step"
                value={bestStep ? `${formatNumber(bestStep.percentPrev, decimals)}%` : "—"}
                hint={bestStep ? bestStep.label : undefined}
              />
              <StatCell
                icon={Percent}
                label="Overall conv."
                value={`${formatNumber(overallConversion, decimals)}%`}
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
                  stages={stages}
                  computedStages={computedStages}
                  decimals={decimals}
                  paletteId={paletteId}
                  addStage={addStage}
                  removeStage={removeStage}
                  updateStage={updateStage}
                  toggleHighlight={toggleHighlight}
                  applyPalette={applyPalette}
                  loadDataset={loadDataset}
                />
              )}

              {activeTab === "style" && (
                <StylePanel
                  shape={shape}
                  setShape={setShape}
                  orientation={orientation}
                  setOrientation={setOrientation}
                  valueScale={valueScale}
                  setValueScale={setValueScale}
                  minWidthPercent={minWidthPercent}
                  setMinWidthPercent={setMinWidthPercent}
                  endTaper={endTaper}
                  setEndTaper={setEndTaper}
                  gap={gap}
                  setGap={setGap}
                  cornerRadius={cornerRadius}
                  setCornerRadius={setCornerRadius}
                  stageOpacity={stageOpacity}
                  setStageOpacity={setStageOpacity}
                  gradient={gradient}
                  setGradient={setGradient}
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
                  percentBasis={percentBasis}
                  setPercentBasis={setPercentBasis}
                  decimals={decimals}
                  setDecimals={setDecimals}
                  thousands={thousands}
                  setThousands={setThousands}
                  compact={compact}
                  setCompact={setCompact}
                  prefix={prefix}
                  setPrefix={setPrefix}
                  suffix={suffix}
                  setSuffix={setSuffix}
                  showConversion={showConversion}
                  setShowConversion={setShowConversion}
                  conversionFormat={conversionFormat}
                  setConversionFormat={setConversionFormat}
                />
              )}

              {activeTab === "legend" && (
                <LegendPanel
                  legendPosition={legendPosition}
                  setLegendPosition={setLegendPosition}
                  showLegendValues={showLegendValues}
                  setShowLegendValues={setShowLegendValues}
                  showLegendPercent={showLegendPercent}
                  setShowLegendPercent={setShowLegendPercent}
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
              <span>Anatomy of a great funnel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Reading &amp; designing funnels that convert
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A quick reference on how stage widths, conversion rates and
              drop-offs tell the story of your process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GuideCard
              accent="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
              badge="∝"
              title="Width equals volume"
              body="Each stage's size is proportional to how many people reach it, so the shape of the funnel is the story: the steeper the taper, the harsher the leak."
            />
            <GuideCard
              accent="bg-violet-50 dark:bg-violet-950/60 text-brandColor"
              badge="%"
              title="Measure every step"
              body="Conversion markers between stages show exactly what share moved on — the fastest way to find the single step that deserves your attention."
            />
            <GuideCard
              accent="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
              badge="3–6"
              title="Keep it short"
              body="Three to six stages read best. Collapse tiny tail steps into a single “Other” band so the headline shape stays clear and honest."
            />
            <GuideCard
              accent="bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400"
              badge="⇅"
              title="Order with intent"
              body="Always follow the true sequence of your process. Reverse or regroup with a click, and pair each stage with its value so no one has to guess."
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
              Everything you need to know about creating funnel charts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {FUNNEL_FAQS.map((faq, index) => {
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
function FunnelSvg({
  svgRef,
  css,
  layout,
  stages,
  decimals,
  fmtOptions,
  labelFormat,
  labelPosition,
  percentBasis,
  gradient,
  shadow,
  stageOpacity,
  transparentBg,
  bgColor,
  textColor,
  mutedColor,
  title,
  subtitle,
  showConversion,
  conversionFormat,
}) {
  const { width, height, legend } = layout;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title || "Funnel chart"}
      className="w-full h-auto"
      style={{ maxWidth: `${width}px`, fontFamily: FONT_STACK }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <defs>
        <filter id="funnelShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="7"
            floodColor="#0f172a"
            floodOpacity="0.16"
          />
        </filter>
        {stages.map((stage, i) => (
          <linearGradient
            key={`grad-${stage.id}`}
            id={`funnelGrad-${i}`}
            x1="0"
            y1="0"
            x2={layout.horizontal ? "1" : "0"}
            y2={layout.horizontal ? "0" : "1"}
          >
            <stop offset="0%" stopColor={stage.color} />
            <stop offset="100%" stopColor={lighten(stage.color, 0.32)} />
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
          y={layout.subtitleY}
          textAnchor="middle"
          fontSize={12.5}
          fill={mutedColor}
        >
          {subtitle}
        </text>
      )}

      {/* Stages */}
      <g
        className="funnel-root"
        filter={shadow ? "url(#funnelShadow)" : undefined}
      >
        {layout.segments.map((seg, i) => (
          <path
            key={seg.id}
            d={seg.path}
            fill={gradient ? `url(#funnelGrad-${i})` : seg.color}
            fillOpacity={Math.max(0, Math.min(1, stageOpacity / 100))}
            stroke={seg.highlighted ? contrastColor(seg.color) : "transparent"}
            strokeWidth={seg.highlighted ? 2.5 : 0}
            strokeLinejoin="round"
            className="funnel-seg"
          />
        ))}
      </g>

      {/* Inside labels */}
      {labelPosition === "inside" && labelFormat !== "none" && (
        <g pointerEvents="none">
          {layout.segments.map((seg) => (
            <text
              key={seg.id}
              x={seg.labelInside.x}
              y={seg.labelInside.y + 4}
              textAnchor="middle"
              fontSize={12.5}
              fontWeight={700}
              fill={contrastColor(seg.color)}
              stroke={transparentBg ? "none" : bgColor}
              strokeWidth={3}
              strokeLinejoin="round"
              style={{ paintOrder: "stroke" }}
            >
              {getStageLabelText(seg, labelFormat, decimals, fmtOptions, percentBasis)}
            </text>
          ))}
        </g>
      )}

      {/* Outside labels with leader lines */}
      {labelPosition === "outside" && labelFormat !== "none" && (
        <g pointerEvents="none">
          {layout.segments.map((seg) => (
            <g key={seg.id}>
              <polyline
                points={seg.labelOutside.leader
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}
                fill="none"
                stroke={mutedColor}
                strokeWidth={1.2}
              />
              <circle
                cx={seg.labelOutside.leader[0].x}
                cy={seg.labelOutside.leader[0].y}
                r={2.4}
                fill={seg.color}
              />
              <text
                x={seg.labelOutside.x}
                y={seg.labelOutside.y + 4}
                textAnchor={seg.labelOutside.anchor}
                fontSize={12.5}
                fontWeight={600}
                fill={textColor}
              >
                {truncate(
                  getStageLabelText(seg, labelFormat, decimals, fmtOptions, percentBasis),
                  seg.labelOutside.maxChars ?? 40
                )}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* Conversion markers */}
      {showConversion && layout.conversions.length > 0 && (
        <g pointerEvents="none">
          {layout.conversions.map((conv) => {
            const text = getConversionText(
              conv.stage,
              conversionFormat,
              decimals,
              fmtOptions
            );
            if (!text) return null;
            const pillW = Math.max(34, text.length * 6.2 + 16);
            const pillH = 17;
            return (
              <g key={`conv-${conv.index}`}>
                <rect
                  x={conv.x - pillW / 2}
                  y={conv.y - pillH / 2}
                  width={pillW}
                  height={pillH}
                  rx={8.5}
                  fill={transparentBg ? withAlpha("#94a3b8", 0.22) : bgColor}
                  stroke={withAlpha(mutedColor, 0.4)}
                  strokeWidth={1}
                />
                <text
                  x={conv.x}
                  y={conv.y + 3.5}
                  textAnchor="middle"
                  fontSize={10.5}
                  fontWeight={700}
                  fill={mutedColor}
                >
                  {text}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Legend */}
      {legend.visible && (
        <g>
          {legend.items.map((item, index) => {
            const pos = legend.positions[index];
            if (!pos) return null;
            return (
              <g key={item.id}>
                <rect
                  x={pos.x}
                  y={pos.y + 3}
                  width={13}
                  height={13}
                  rx={3.5}
                  fill={item.color}
                />
                <text
                  x={pos.x + 21}
                  y={pos.y + 13.5}
                  fontSize={12.5}
                  fontWeight={600}
                  fill={textColor}
                >
                  {truncate(item.label, legend.onSide ? 16 : 14)}
                </text>
                {legend.showValues && (
                  <text
                    x={legend.onSide ? pos.x + legend.width - 4 : pos.x + pos.width - 8}
                    y={pos.y + 13.5}
                    textAnchor="end"
                    fontSize={12}
                    fontWeight={700}
                    fill={mutedColor}
                  >
                    {legend.showPercent
                      ? `${formatNumber(item.percentFirst, decimals)}%`
                      : formatValue(item.value, { ...fmtOptions, decimals })}
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
  stages,
  computedStages,
  decimals,
  paletteId,
  addStage,
  removeStage,
  updateStage,
  toggleHighlight,
  applyPalette,
  loadDataset,
}) {
  const percentById = useMemo(() => {
    const map = {};
    computedStages.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [computedStages]);

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
          <SectionLabel icon={Table2}>Stages ({stages.length})</SectionLabel>
          <button
            type="button"
            onClick={addStage}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brandColor/10 hover:bg-brandColor/20 text-brandColor text-[11px] font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add stage
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {stages.map((stage) => {
            const computed = percentById[stage.id];
            return (
              <div
                key={stage.id}
                className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50"
              >
                <input
                  type="color"
                  value={stage.color}
                  onChange={(e) => updateStage(stage.id, "color", e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 bg-transparent p-0 cursor-pointer shrink-0"
                  title="Stage colour"
                />
                <input
                  type="text"
                  value={stage.label}
                  onChange={(e) => updateStage(stage.id, "label", e.target.value)}
                  placeholder="Stage name"
                  className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                />
                <input
                  type="number"
                  value={stage.value}
                  min={0}
                  onChange={(e) =>
                    updateStage(stage.id, "value", Number(e.target.value))
                  }
                  className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono text-right text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
                  title="Value"
                />
                <span className="w-12 text-right text-[11px] font-semibold text-gray-400 shrink-0">
                  {computed
                    ? `${formatNumber(computed.percentFirst, decimals)}%`
                    : "0%"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleHighlight(stage.id)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                    stage.highlighted
                      ? "bg-brandColor/15 text-brandColor"
                      : "text-gray-400 hover:text-brandColor hover:bg-brandColor/10"
                  }`}
                  title={stage.highlighted ? "Remove highlight" : "Highlight stage"}
                >
                  <Star
                    className="w-3.5 h-3.5"
                    fill={stage.highlighted ? "currentColor" : "none"}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => removeStage(stage.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer shrink-0"
                  title="Delete stage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-3 flex items-center gap-1 text-[11px] text-gray-400 px-1">
          <Info className="w-3 h-3" />
          The percentage shows each stage&apos;s overall conversion from the first
          stage.
        </p>
      </div>
    </div>
  );
}

// ─── Style panel ─────────────────────────────────────────────────────────────
function StylePanel({
  shape,
  setShape,
  orientation,
  setOrientation,
  valueScale,
  setValueScale,
  minWidthPercent,
  setMinWidthPercent,
  endTaper,
  setEndTaper,
  gap,
  setGap,
  cornerRadius,
  setCornerRadius,
  stageOpacity,
  setStageOpacity,
  gradient,
  setGradient,
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
        <SectionLabel icon={Filter}>Shape</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {CHART_SHAPES.map((item) => {
            const active = shape === item.id;
            const Icon = SHAPE_ICONS[item.id] || Filter;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setShape(item.id)}
                title={item.description}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor shadow-xs"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel icon={MoveVertical}>Orientation</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {ORIENTATIONS.map((item) => {
            const active = orientation === item.id;
            const Icon = item.id === "horizontal" ? MoveHorizontal : MoveVertical;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOrientation(item.id)}
                className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel icon={Gauge}>Value scale</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {VALUE_SCALES.map((item) => {
            const active = valueScale === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setValueScale(item.id)}
                className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          Square root compresses big gaps so small lower-funnel stages stay
          visible.
        </p>
      </div>

      <RangeControl
        label="Minimum width"
        hint="Keeps tiny stages visible"
        value={minWidthPercent}
        min={0}
        max={60}
        step={1}
        suffix="%"
        onChange={setMinWidthPercent}
      />

      {shape === "funnel" && (
        <RangeControl
          label="Base taper"
          hint="Narrowing of the last stage"
          value={endTaper}
          min={30}
          max={100}
          step={1}
          suffix="%"
          onChange={setEndTaper}
        />
      )}

      <RangeControl
        label="Gap between stages"
        hint="Separation"
        value={gap}
        min={0}
        max={24}
        step={1}
        suffix="px"
        onChange={setGap}
        disabled={shape === "steps"}
      />

      <RangeControl
        label="Corner radius"
        hint="Rounded stage corners"
        value={cornerRadius}
        min={0}
        max={24}
        step={1}
        suffix="px"
        onChange={setCornerRadius}
      />

      <RangeControl
        label="Stage opacity"
        hint="Fill transparency"
        value={stageOpacity}
        min={20}
        max={100}
        step={1}
        suffix="%"
        onChange={setStageOpacity}
      />

      <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 cursor-pointer">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          Gradient fills
        </span>
        <input
          type="checkbox"
          checked={gradient}
          onChange={(e) => setGradient(e.target.checked)}
          className="w-4 h-4 rounded accent-brandColor cursor-pointer"
        />
      </label>

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
  percentBasis,
  setPercentBasis,
  decimals,
  setDecimals,
  thousands,
  setThousands,
  compact,
  setCompact,
  prefix,
  setPrefix,
  suffix,
  setSuffix,
  showConversion,
  setShowConversion,
  conversionFormat,
  setConversionFormat,
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
        <SectionLabel icon={Filter}>Label placement</SectionLabel>
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
      </div>

      <div>
        <SectionLabel icon={Percent}>Percentage basis</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {PERCENT_BASES.map((basis) => {
            const active = percentBasis === basis.id;
            return (
              <button
                key={basis.id}
                type="button"
                onClick={() => setPercentBasis(basis.id)}
                className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-brandColor text-white border-brandColor"
                    : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                }`}
              >
                {basis.label}
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
        max={3}
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
            placeholder="e.g. $"
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
            placeholder="e.g. K"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 cursor-pointer">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Thousands separators (12,000)
          </span>
          <input
            type="checkbox"
            checked={thousands}
            onChange={(e) => setThousands(e.target.checked)}
            className="w-4 h-4 rounded accent-brandColor cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 cursor-pointer">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Compact numbers (12K, 1.4M)
          </span>
          <input
            type="checkbox"
            checked={compact}
            onChange={(e) => setCompact(e.target.checked)}
            className="w-4 h-4 rounded accent-brandColor cursor-pointer"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 cursor-pointer">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Show conversion between stages
          </span>
          <input
            type="checkbox"
            checked={showConversion}
            onChange={(e) => setShowConversion(e.target.checked)}
            className="w-4 h-4 rounded accent-brandColor cursor-pointer"
          />
        </label>

        {showConversion && (
          <div>
            <SectionLabel icon={ArrowDown}>Conversion marker</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {CONVERSION_FORMATS.map((item) => {
                const active = conversionFormat === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConversionFormat(item.id)}
                    className={`px-2 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-brandColor text-white border-brandColor"
                        : "bg-gray-50 dark:bg-gray-950/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-brandColor/40"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
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
  showLegendPercent,
  setShowLegendPercent,
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
          Show value next to each stage
        </span>
        <input
          type="checkbox"
          checked={showLegendValues}
          onChange={(e) => setShowLegendValues(e.target.checked)}
          className="w-4 h-4 rounded accent-brandColor cursor-pointer"
        />
      </label>

      <label
        className={`flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/50 cursor-pointer ${
          showLegendValues ? "" : "opacity-50"
        }`}
      >
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          Show overall percentage instead of value
        </span>
        <input
          type="checkbox"
          disabled={!showLegendValues}
          checked={showLegendPercent}
          onChange={(e) => setShowLegendPercent(e.target.checked)}
          className="w-4 h-4 rounded accent-brandColor cursor-pointer"
        />
      </label>

      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-brandColor" />
        A side legend suits vertical funnels, while a top or bottom legend keeps
        horizontal funnels tidy on wide, presentation-style slides.
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
  disabled,
}) {
  return (
    <div
      className={`${
        compact
          ? ""
          : "p-3 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-850"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
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
        disabled={disabled}
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
