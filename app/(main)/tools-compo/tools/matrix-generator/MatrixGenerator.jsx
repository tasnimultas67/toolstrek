"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BookOpen,
  Braces,
  CheckCircle2,
  Grid3x3,
  Info,
  Layers,
  Pencil,
  RotateCcw,
  Shuffle,
  Sigma,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Calculator,
  Download,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  CopyButton,
  FaqAccordion,
  Field,
  Hero,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import { downloadText } from "../_shared/toolkit/toolUtils";
import {
  DEFAULT_DISPLAY,
  DEFAULT_SETTINGS,
  FORMAT_META,
  MATRIX_GENERATOR_FAQS,
  MAX_SIZE,
  OUTPUT_FORMATS,
  PRESETS,
  STRUCTURES,
  analyzeMatrix,
  buildMatrixReport,
  formatCell,
  generateMatrix,
  inverseMatrix,
  matrixToString,
  parseGrid,
  randomSeed,
  transposeMatrix,
} from "./matrixGeneratorData";

const TOOL_META = {
  title: "Matrix Generator",
  link: "/tools/matrix-generator",
  icon: "Grid3x3",
};

const TONE = "indigo";

const TABS = [
  { value: "generator", label: "Generator", icon: Sparkles },
  { value: "analyze", label: "Analyze", icon: Sigma },
  { value: "learn", label: "Learn", icon: BookOpen },
];

function MatrixTable({
  matrix,
  precision,
  editable,
  onChange,
  label = "Matrix",
  showHeaders = true,
}) {
  const cols = matrix[0]?.length || 0;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full border-collapse text-sm">
        {showHeaders && (
          <thead className="bg-slate-50 dark:bg-slate-800/70">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 text-left text-sm font-bold text-slate-400 dark:text-slate-500">
                {label}
              </th>
              {Array.from({ length: cols }, (_, col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-2 py-2 text-center text-sm font-bold text-slate-400 dark:text-slate-500"
                >
                  C{col + 1}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20">
              {showHeaders && (
                <th className="whitespace-nowrap bg-slate-50/60 px-3 py-1.5 text-left text-sm font-bold text-slate-400 dark:bg-slate-800/40 dark:text-slate-500">
                  R{rowIndex + 1}
                </th>
              )}
              {row.map((value, colIndex) => (
                <td key={colIndex} className="px-1.5 py-1.5 text-center">
                  {editable ? (
                    <input
                      value={value}
                      onChange={(event) => onChange(rowIndex, colIndex, event.target.value)}
                      inputMode="decimal"
                      aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}`}
                      className={`w-16 rounded-lg border border-transparent bg-transparent px-1.5 py-1.5 text-center text-sm font-bold tabular-nums text-slate-800 outline-none transition hover:border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:text-slate-100 dark:hover:border-slate-700 dark:focus:bg-slate-800 ${
                        Number(value) === 0 && value !== "" ? "text-slate-400 dark:text-slate-500" : ""
                      }`}
                    />
                  ) : (
                    <span
                      className={`inline-block px-1.5 py-1.5 text-sm font-bold tabular-nums ${
                        Number(value) === 0 ? "text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {formatCell(value, precision)}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MatrixGenerator() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("generator");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [display, setDisplay] = useState(DEFAULT_DISPLAY);
  const [seed, setSeed] = useState("2026");
  const [editedGrid, setEditedGrid] = useState(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const setOption = (key, value) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const setDisplayOption = (key, value) =>
    setDisplay((current) => ({ ...current, [key]: value }));

  const applySettings = (patch) => {
    setSettings((current) => ({ ...current, ...patch }));
    setEditedGrid(null);
  };

  const generated = useMemo(
    () => generateMatrix(settings, seed || "1"),
    [settings, seed],
  );

  const grid = editedGrid ?? generated;
  const matrix = useMemo(() => parseGrid(grid), [grid]);
  const analysis = useMemo(() => analyzeMatrix(matrix), [matrix]);
  const formatted = useMemo(
    () => matrixToString(matrix, display.format, display.precision),
    [matrix, display.format, display.precision],
  );

  const transpose = useMemo(
    () => (analysis.rows && analysis.cols ? transposeMatrix(matrix) : []),
    [matrix, analysis.rows, analysis.cols],
  );

  const inverse = useMemo(
    () => (analysis.invertible ? inverseMatrix(matrix) : null),
    [matrix, analysis.invertible],
  );

  const rowSums = useMemo(
    () => matrix.map((row) => row.reduce((sum, value) => sum + value, 0)),
    [matrix],
  );

  const columnSums = useMemo(() => {
    if (!matrix.length) return [];
    return matrix[0].map((_, col) =>
      matrix.reduce((sum, row) => sum + (row[col] ?? 0), 0),
    );
  }, [matrix]);

  const shuffle = () => {
    const nextSeed = randomSeed();
    setSeed(String(nextSeed));
    setEditedGrid(null);
    toast.success(`New matrix generated with seed ${nextSeed}.`);
  };

  const regenerate = () => {
    setEditedGrid(null);
    toast.success("Matrix regenerated from the current seed.");
  };

  const applyPreset = (preset) => {
    applySettings({
      rows: preset.rows,
      cols: preset.cols,
      structure: preset.structure,
    });
    toast.success(`${preset.label} preset applied.`);
  };

  const resetAll = () => {
    setSettings(DEFAULT_SETTINGS);
    setDisplay(DEFAULT_DISPLAY);
    setSeed("2026");
    setEditedGrid(null);
    toast.success("All matrix settings reset.");
  };

  const updateCell = (row, col, value) => {
    const base = grid.map((currentRow) => currentRow.map((cell) => String(cell)));
    base[row][col] = value;
    setEditedGrid(base);
  };

  const download = () => {
    const meta = FORMAT_META[display.format] || FORMAT_META.brackets;
    const report = buildMatrixReport(analysis, formatted, settings, display, seed);
    const payload = display.format === "brackets" || display.format === "plain" ? report : formatted;
    downloadText(payload, `matrix-${analysis.rows}x${analysis.cols}.${meta.extension}`, meta.mime);
    toast.success(`Matrix downloaded as ${display.format}.`);
  };

  const propertyChips = [
    { label: "Square", active: analysis.isSquare },
    { label: "Symmetric", active: analysis.symmetric },
    { label: "Skew-symmetric", active: analysis.skewSymmetric },
    { label: "Diagonal", active: analysis.diagonal },
    { label: "Upper triangular", active: analysis.upperTriangular },
    { label: "Lower triangular", active: analysis.lowerTriangular },
    { label: "Identity", active: analysis.identity },
    { label: "Diagonal dominant", active: analysis.diagonalDominant },
    { label: "Positive definite", active: analysis.positiveDefinite },
    { label: "Orthogonal", active: analysis.orthogonal },
    { label: "Invertible", active: analysis.invertible },
  ];

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Linear algebra studio"
        icon={Grid3x3}
        title="Matrix Generator"
        description="Build random, symmetric, triangular, sparse, banded or Toeplitz matrices up to 12 × 12. Edit cells live, inspect determinant, rank, trace, inverse and transpose, then copy the result as CSV, LaTeX, JSON, Python, MATLAB or Markdown."
        badges={[
          "Matrices up to 12 × 12",
          "12 matrix structures",
          "Seed-reproducible",
          "Editable cells",
          "Live determinant & rank",
          "8 export formats",
        ]}
      />

      <div
        role="tablist"
        aria-label="Matrix generator sections"
        className="grid grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-bold transition ${
              tab === value
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <Icon className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {tab === "generator" && (
        <>
          <SectionCard
            tone={TONE}
            icon={SlidersHorizontal}
            title="Matrix settings"
            description="Every change rebuilds the grid instantly with the same seed, so you can compare structures fairly."
            actions={
              <ActionButton icon={RotateCcw} variant="ghost" onClick={resetAll}>
                Reset all
              </ActionButton>
            }
          >
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Rows" htmlFor="matrix-rows" hint={`1 to ${MAX_SIZE}`}>
                <input
                  id="matrix-rows"
                  type="number"
                  min={1}
                  max={MAX_SIZE}
                  value={settings.rows}
                  onChange={(event) => applySettings({ rows: event.target.value })}
                  className={`${fieldClass(false, TONE)} tabular-nums`}
                />
              </Field>
              <Field label="Columns" htmlFor="matrix-cols" hint={`1 to ${MAX_SIZE}`}>
                <input
                  id="matrix-cols"
                  type="number"
                  min={1}
                  max={MAX_SIZE}
                  value={settings.cols}
                  onChange={(event) => applySettings({ cols: event.target.value })}
                  className={`${fieldClass(false, TONE)} tabular-nums`}
                />
              </Field>
              <Field label="Minimum value" htmlFor="matrix-min" hint="Used by random fills">
                <input
                  id="matrix-min"
                  type="number"
                  value={settings.min}
                  onChange={(event) => applySettings({ min: event.target.value })}
                  className={`${fieldClass(false, TONE)} tabular-nums`}
                />
              </Field>
              <Field label="Maximum value" htmlFor="matrix-max">
                <input
                  id="matrix-max"
                  type="number"
                  value={settings.max}
                  onChange={(event) => applySettings({ max: event.target.value })}
                  className={`${fieldClass(false, TONE)} tabular-nums`}
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Structure" htmlFor="matrix-structure" hint="Choose the pattern to generate">
                <select
                  id="matrix-structure"
                  value={settings.structure}
                  onChange={(event) => applySettings({ structure: event.target.value })}
                  className={fieldClass(false, TONE)}
                >
                  {STRUCTURES.map((structure) => (
                    <option key={structure.value} value={structure.value}>
                      {structure.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Decimal places" htmlFor="matrix-decimals" hint="0 produces whole numbers">
                <select
                  id="matrix-decimals"
                  value={settings.decimals}
                  onChange={(event) => applySettings({ decimals: Number(event.target.value) })}
                  className={fieldClass(false, TONE)}
                >
                  {[0, 1, 2, 3, 4].map((value) => (
                    <option key={value} value={value}>
                      {value === 0 ? "0 — integers" : value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Seed" htmlFor="matrix-seed" hint="Same seed = same matrix">
                <div className="flex gap-2">
                  <input
                    id="matrix-seed"
                    value={seed}
                    onChange={(event) => {
                      setSeed(event.target.value.replace(/[^0-9]/g, "").slice(0, 9));
                      setEditedGrid(null);
                    }}
                    inputMode="numeric"
                    className={`${fieldClass(false, TONE)} tabular-nums`}
                  />
                  <ActionButton icon={Shuffle} onClick={shuffle} aria-label="Shuffle seed">
                    New
                  </ActionButton>
                </div>
              </Field>
              <div className="flex items-end">
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{analysis.rows} × {analysis.cols}</span>{" "}
                  matrix with {analysis.nonZero} non-zero{" "}
                  {analysis.nonZero === 1 ? "entry" : "entries"}.
                </div>
              </div>
            </div>

            {settings.structure === "sparse" && (
              <div className="mt-4">
                <SliderRow
                  tone={TONE}
                  label="Sparsity density"
                  min={5}
                  max={100}
                  step={5}
                  value={settings.density}
                  onChange={(value) => applySettings({ density: value })}
                  format={(value) => `${value}%`}
                  hint="Percentage of cells that receive a random value. The rest stay zero."
                  onReset={() => applySettings({ density: 35 })}
                />
              </div>
            )}

            {settings.structure === "banded" && (
              <div className="mt-4">
                <SliderRow
                  tone={TONE}
                  label="Bandwidth"
                  min={0}
                  max={MAX_SIZE - 1}
                  step={1}
                  value={settings.bandwidth}
                  onChange={(value) => applySettings({ bandwidth: value })}
                  format={(value) => `${value}`}
                  hint="Cells further than this many places from the diagonal are set to zero."
                  onReset={() => applySettings({ bandwidth: 1 })}
                />
              </div>
            )}

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <ToggleRow
                tone={TONE}
                checked={settings.diagonalDominance}
                onChange={(value) => applySettings({ diagonalDominance: value })}
                label="Force diagonal dominance (square matrices)"
                description="Scales each diagonal entry above the sum of the other entries in its row."
              />
              <ToggleRow
                tone={TONE}
                checked={display.editable}
                onChange={(value) => setDisplayOption("editable", value)}
                label="Editable cells"
                description="Click any number in the preview to replace it and update the analysis."
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton icon={Sparkles} variant="primary" tone={TONE} onClick={regenerate}>
                Regenerate matrix
              </ActionButton>
              <ActionButton icon={Pencil} onClick={() => setDisplayOption("editable", !display.editable)}>
                {display.editable ? "Lock cells" : "Edit cells"}
              </ActionButton>
              <ActionButton icon={Download} onClick={download}>
                Download {display.format}
              </ActionButton>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <SectionCard
                tone={TONE}
                icon={Grid3x3}
                title="Generated matrix"
                description={`${analysis.rows} rows × ${analysis.cols} columns · seed ${seed || "—"} · ${settings.structure} structure.`}
                actions={
                  <>
                    <CopyButton text={formatted} tone={TONE} label="Copy matrix" />
                    <ActionButton icon={Download} onClick={download}>
                      Download
                    </ActionButton>
                  </>
                }
              >
                <MatrixTable
                  matrix={grid}
                  precision={display.precision}
                  editable={display.editable}
                  showHeaders={display.showHeaders}
                  onChange={updateCell}
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip tone={TONE}>{settings.structure}</Chip>
                  <Chip tone="sky">{analysis.rows} × {analysis.cols}</Chip>
                  <Chip tone="emerald">seed {seed || "—"}</Chip>
                  {analysis.isSquare && <Chip tone="violet">det {formatCell(analysis.det, 2)}</Chip>}
                  {analysis.diagonalDominant && <Chip tone="amber">diagonally dominant</Chip>}
                </div>

                <div className="mt-4">
                  <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Formatted output
                  </p>
                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100">
                    {formatted}
                  </pre>
                </div>
              </SectionCard>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Stat tone={TONE} label="Rows × columns" value={`${analysis.rows} × ${analysis.cols}`} icon={Table2} />
                <Stat
                  tone={TONE}
                  label="Determinant"
                  value={analysis.isSquare ? formatCell(analysis.det, display.precision) : "n/a"}
                  icon={Calculator}
                />
                <Stat tone={TONE} label="Rank" value={analysis.rank} icon={Layers} />
                <Stat
                  tone={TONE}
                  label="Trace"
                  value={analysis.trace === null ? "n/a" : formatCell(analysis.trace, display.precision)}
                  icon={Sigma}
                />
              </div>
            </div>

            <div className="space-y-6 xl:col-span-4">
              <SectionCard tone={TONE} icon={SlidersHorizontal} title="Output options" description="Control the preview and the exported syntax.">
                <div className="space-y-4">
                  <Field label="Output format" htmlFor="matrix-format">
                    <select
                      id="matrix-format"
                      value={display.format}
                      onChange={(event) => setDisplayOption("format", event.target.value)}
                      className={fieldClass(false, TONE)}
                    >
                      {OUTPUT_FORMATS.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <SliderRow
                    tone={TONE}
                    label="Display precision"
                    min={0}
                    max={8}
                    step={1}
                    value={display.precision}
                    onChange={(value) => setDisplayOption("precision", value)}
                    format={(value) => `${value} dp`}
                    hint="Only affects the preview and copied text — the stored values keep full precision."
                    onReset={() => setDisplayOption("precision", 3)}
                  />
                  <ToggleRow
                    tone={TONE}
                    checked={display.showHeaders}
                    onChange={(value) => setDisplayOption("showHeaders", value)}
                    label="Show row and column labels"
                    description="R1, R2… and C1, C2… make large matrices easier to read."
                  />
                  <ToggleRow
                    tone={TONE}
                    checked={display.editable}
                    onChange={(value) => setDisplayOption("editable", value)}
                    label="Editable cells"
                    description="Turn off to protect the generated values from accidental edits."
                  />
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={CheckCircle2} title="Quick properties">
                <div className="flex flex-wrap gap-2">
                  {propertyChips.map((property) => (
                    <Chip key={property.label} tone={property.active ? "emerald" : "indigo"}>
                      {property.active ? "✓" : "—"} {property.label}
                    </Chip>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Open the Analyze tab to see the transpose, inverse, row sums, column sums and a full property report.
                </p>
              </SectionCard>

              <SectionCard tone={TONE} icon={Info} title="Good to know">
                <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  <li>• The seed makes every matrix reproducible.</li>
                  <li>• Sparse matrices use the density slider.</li>
                  <li>• Banded matrices keep values near the diagonal.</li>
                  <li>• Diagonal dominance guarantees invertibility.</li>
                  <li>• All calculations stay in your browser.</li>
                </ul>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {tab === "analyze" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat tone={TONE} label="Determinant" value={analysis.isSquare ? formatCell(analysis.det, display.precision) : "n/a"} icon={Calculator} />
            <Stat tone={TONE} label="Rank" value={`${analysis.rank} of ${Math.min(analysis.rows, analysis.cols)}`} icon={Layers} />
            <Stat tone={TONE} label="Frobenius norm" value={formatCell(analysis.frobenius, display.precision)} icon={Sigma} />
            <Stat tone={TONE} label="Sparsity" value={`${analysis.sparsity.toFixed(1)}%`} icon={Hash} />
            <Stat tone={TONE} label="Trace" value={analysis.trace === null ? "n/a" : formatCell(analysis.trace, display.precision)} icon={SquareStack} />
            <Stat tone={TONE} label="Smallest entry" value={formatCell(analysis.min, display.precision)} icon={ArrowLeftRight} />
            <Stat tone={TONE} label="Largest entry" value={formatCell(analysis.max, display.precision)} icon={ArrowLeftRight} />
            <Stat tone={TONE} label="Zero entries" value={`${analysis.zeroCount} / ${analysis.rows * analysis.cols}`} icon={Hash} />
          </div>

          <SectionCard tone={TONE} icon={CheckCircle2} title="Structure checks" description="Properties are tested with a 10⁻⁹ tolerance so rounded decimals still classify correctly.">
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {propertyChips.map((property) => (
                <div
                  key={property.label}
                  className={`flex items-center justify-between rounded-xl border p-3 text-sm font-semibold ${
                    property.active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400"
                  }`}
                >
                  <span>{property.label}</span>
                  <span>{property.active ? "Yes" : "No"}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              tone={TONE}
              icon={ArrowLeftRight}
              title="Transpose"
              description="Flip the matrix across its main diagonal. This always works for any shape."
              actions={<CopyButton text={matrixToString(transpose, display.format, display.precision)} tone={TONE} label="Copy transpose" />}
            >
              <MatrixTable matrix={transpose} precision={display.precision} label="Aᵀ" />
            </SectionCard>

            <SectionCard
              tone={TONE}
              icon={Calculator}
              title="Inverse"
              description={
                analysis.invertible
                  ? "Computed with Gauss–Jordan elimination on [A | I]."
                  : "An inverse needs a square matrix with a non-zero determinant."
              }
              actions={
                inverse ? (
                  <CopyButton text={matrixToString(inverse, display.format, display.precision)} tone={TONE} label="Copy inverse" />
                ) : null
              }
            >
              {inverse ? (
                <MatrixTable matrix={inverse} precision={display.precision} label="A⁻¹" />
              ) : (
                <Callout tone="amber" variant="warning" title="No inverse available">
                  This matrix is {analysis.isSquare ? "singular (determinant is zero)" : "not square"}. Generate a
                  diagonal-dominant square matrix to explore inversion.
                </Callout>
              )}
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard tone={TONE} icon={Table2} title="Row sums" description="Sum of every row in the current matrix.">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[320px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">Row</th>
                      <th className="px-3 py-2.5 font-bold">Sum</th>
                      <th className="px-3 py-2.5 font-bold">Entries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {matrix.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">R{index + 1}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-200">
                          {formatCell(rowSums[index], display.precision)}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{row.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard tone={TONE} icon={Table2} title="Column sums" description="Sum of every column in the current matrix.">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full min-w-[320px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">Column</th>
                      <th className="px-3 py-2.5 font-bold">Sum</th>
                      <th className="px-3 py-2.5 font-bold">Mean</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {columnSums.map((sum, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">C{index + 1}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-200">
                          {formatCell(sum, display.precision)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                          {formatCell(sum / (matrix.length || 1), display.precision)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          <SectionCard tone={TONE} icon={Info} title="How the analysis is computed">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300">
                <p className="font-bold text-slate-800 dark:text-slate-100">Determinant</p>
                <p className="mt-1">LU decomposition with partial pivoting. A zero pivot means a determinant of zero.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300">
                <p className="font-bold text-slate-800 dark:text-slate-100">Rank</p>
                <p className="mt-1">Gaussian elimination counts pivot columns. Full rank equals the smaller dimension.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300">
                <p className="font-bold text-slate-800 dark:text-slate-100">Inverse</p>
                <p className="mt-1">Augment with the identity matrix, reduce the left side to I and read the right side.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300">
                <p className="font-bold text-slate-800 dark:text-slate-100">Positive definite</p>
                <p className="mt-1">Sylvester&apos;s criterion: every leading principal minor must be positive.</p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "learn" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                title: "Random matrices",
                body: "Every entry is drawn independently from your minimum and maximum values. Random matrices are used to test algorithms, simulate noise and create exercises.",
              },
              {
                title: "Symmetric & skew-symmetric",
                body: "Symmetric matrices equal their transpose and appear in covariance, distance and graph problems. Skew-symmetric matrices have a zero diagonal and opposite mirrored entries; they represent rotations and cross products.",
              },
              {
                title: "Triangular matrices",
                body: "Upper and lower triangular matrices have zeros on one side of the diagonal. Their determinant is simply the product of the diagonal, which makes them fast to solve.",
              },
              {
                title: "Sparse & banded",
                body: "Sparse matrices store mostly zeros to save memory. Banded matrices keep entries close to the diagonal and are common in finite-difference and engineering models.",
              },
              {
                title: "Toeplitz matrices",
                body: "Each descending diagonal is constant, so the matrix is defined by its first row and first column. They model convolution, signal filters and time-series covariance.",
              },
              {
                title: "Diagonal dominance",
                body: "When each diagonal entry outweighs the rest of its row, the matrix is guaranteed to be invertible. This property also guarantees convergence for Jacobi and Gauss–Seidel iterations.",
              },
            ].map((item) => (
              <SectionCard key={item.title} tone={TONE} icon={Braces} title={item.title}>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.body}</p>
              </SectionCard>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Callout tone={TONE} variant="tip" title="Reproducible examples">
              Share the seed along with the settings and anyone can rebuild exactly the same matrix.
            </Callout>
            <Callout tone="amber" variant="warning" title="Watch large sizes">
              Matrices above 8 × 8 still work, but inverse and determinant calculations become heavier on phones.
            </Callout>
            <Callout tone="emerald" variant="success" title="Copy straight into code">
              Use Python, MATLAB, JSON or LaTeX output to paste directly into notebooks, papers and assignments.
            </Callout>
          </div>

          <FaqAccordion items={MATRIX_GENERATOR_FAQS} tone={TONE} title="Matrix generator questions, answered" />
        </div>
      )}
    </div>
  );
}
