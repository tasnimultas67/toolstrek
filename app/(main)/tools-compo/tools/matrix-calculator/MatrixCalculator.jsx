"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Braces,
  Calculator,
  CheckCircle2,
  ClipboardPaste,
  Eraser,
  FileJson,
  FileSpreadsheet,
  Grid3x3,
  Info,
  Layers,
  Rows3,
  RotateCcw,
  Shuffle,
  Sigma,
  Sparkles,
  Table2,
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
  FieldError,
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
  DEFAULT_A,
  DEFAULT_B,
  DEFAULT_VECTOR,
  MATRIX_FAQS,
  MAX_DIMENSION,
  OPERATIONS,
  OPERATION_GROUPS,
  addMatrices,
  adjugate,
  cofactorMatrix,
  createGrid,
  determinant,
  formatNumber,
  gridFromMatrix,
  hadamardProduct,
  identityMatrix,
  inverse,
  kroneckerProduct,
  matrixPower,
  matrixProperties,
  matrixRank,
  matrixToCsv,
  matrixToJson,
  matrixToLatex,
  matrixToTsv,
  multiplyMatrices,
  operationMeta,
  parseGrid,
  parseMatrixText,
  parseVector,
  randomGrid,
  resizeGrid,
  rref,
  scalarMultiply,
  solveLinearSystem,
  subtractMatrices,
  transposeMatrix,
} from "./matrixMath";

const TOOL_META = {
  title: "Matrix Calculator",
  link: "/tools/matrix-calculator",
  icon: "Grid3x3",
};

const TONE = "indigo";

const TABS = [
  { value: "calculator", label: "Calculator", icon: Calculator },
  { value: "learn", label: "Learn", icon: BookOpen },
];

const DEFAULT_DISPLAY = {
  precision: 4,
  notation: "auto",
  tolerance: "1e-10",
  showSteps: true,
  showProperties: true,
};

const TOLERANCE_OPTIONS = [
  { value: "1e-6", label: "1e−6 · loose" },
  { value: "1e-9", label: "1e−9 · relaxed" },
  { value: "1e-10", label: "1e−10 · balanced (default)" },
  { value: "1e-12", label: "1e−12 · strict" },
  { value: "1e-14", label: "1e−14 · very strict" },
];

const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

function subscript(value) {
  return String(value)
    .split("")
    .map((digit) => SUBSCRIPT_DIGITS[Number(digit)] ?? digit)
    .join("");
}

function clampDimension(value) {
  const numeric = Math.round(Number(value));
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(MAX_DIMENSION, Math.max(1, numeric));
}

function transposeGrid(grid) {
  const cols = grid[0]?.length || 0;
  return Array.from({ length: cols }, (_, col) =>
    grid.map((row) => String(row[col] ?? "0")),
  );
}

function requirementFor(operation) {
  if (operation.vector) return "A square, b has n entries";
  if (operation.scalar) return "Any dimensions";
  if (operation.power) return "A square";
  if (operation.id === "multiply") return "A columns = B rows";
  if (operation.id === "kron") return "Any dimensions";
  if (operation.binary) return "A and B same size";
  if (["determinant", "inverse", "trace", "adjugate", "cofactor"].includes(operation.id)) {
    return "A square";
  }
  return "Any dimensions";
}

function outputFor(operation) {
  if (operation.result === "scalar") return "Scalar";
  if (operation.result === "vector") return "Vector";
  return "Matrix";
}

function methodNote(operationId, tolerance) {
  const notes = {
    add: "Added matching entries of A and B.",
    subtract: "Subtracted each entry of B from the matching entry of A.",
    multiply: "Each result entry C[i][j] is the dot product of row i of A and column j of B.",
    hadamard: "Multiplied matching entries of A and B (element-wise product).",
    kron: "Expanded every entry a[i][j] into the full block a[i][j] · B.",
    scalar: "Multiplied every entry of A by the scalar k.",
    transpose: "Swapped rows and columns: (Aᵀ)[i][j] = A[j][i].",
    determinant: `Determinant computed with LU decomposition and partial pivoting at tolerance ${tolerance}.`,
    inverse: "Inverse computed with Gauss–Jordan elimination on the augmented matrix [A | I].",
    rank: "Rank is the number of pivot columns found while reducing A to row echelon form.",
    trace: "Trace is the sum of the main diagonal entries of A.",
    adjugate: "Transposed the cofactor matrix to form the adjugate.",
    cofactor: "Each entry is a signed minor of A with alternating +/− signs.",
    rref: "Applied Gauss–Jordan elimination to reach reduced row echelon form.",
    power: "Used binary exponentiation; negative exponents start from A⁻¹.",
    solve: "Reduced the augmented matrix [A | b] to read the unique solution.",
  };
  return notes[operationId] || "Computed with standard matrix arithmetic.";
}

function MatrixTable({ matrix, format, label = "Result" }) {
  const cols = matrix[0]?.length || 0;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/70">
          <tr>
            <th className="px-2.5 py-2 text-right text-sm font-bold text-slate-400 dark:text-slate-500">
              {label}
            </th>
            {Array.from({ length: cols }, (_, col) => (
              <th
                key={col}
                className="whitespace-nowrap px-3 py-2 text-center text-sm font-bold text-slate-400 dark:text-slate-500"
              >
                C{col + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
              <th className="whitespace-nowrap bg-slate-50/60 px-2.5 py-2 text-right text-sm font-bold text-slate-400 dark:bg-slate-800/40 dark:text-slate-500">
                R{rowIndex + 1}
              </th>
              {row.map((value, colIndex) => (
                <td
                  key={colIndex}
                  className="whitespace-nowrap px-3 py-2 text-center font-mono text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100"
                >
                  {format(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatrixEditorCard({
  symbol,
  description,
  grid,
  setGrid,
  onResize,
  tone = TONE,
  extraActions,
}) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteError, setPasteError] = useState("");
  const rows = grid.length;
  const cols = grid[0]?.length || 1;

  const updateCell = (rowIndex, colIndex, value) => {
    setGrid((current) =>
      current.map((row, r) =>
        r === rowIndex ? row.map((cell, c) => (c === colIndex ? value : cell)) : row,
      ),
    );
  };

  const randomize = () => {
    setGrid(randomGrid(rows, cols));
    toast.success(`Randomized ${symbol} (${rows} × ${cols}).`);
  };

  const clear = () => {
    setGrid(createGrid(rows, cols));
    toast.success(`Cleared ${symbol}.`);
  };

  const makeIdentity = () => {
    if (rows !== cols) {
      toast.error("Identity matrices must be square. Match the rows and columns first.");
      return;
    }
    setGrid(identityMatrix(rows).map((row) => row.map((value) => String(value))));
    toast.success(`Set ${symbol} to the ${rows} × ${rows} identity.`);
  };

  const applyPaste = () => {
    const parsed = parseMatrixText(pasteText);
    if (!parsed.ok) {
      setPasteError(parsed.error);
      return;
    }
    setGrid(parsed.matrix.map((row) => row.map((value) => String(value))));
    setPasteText("");
    setPasteError("");
    setPasteOpen(false);
    toast.success(`Loaded a ${parsed.rows} × ${parsed.cols} matrix into ${symbol}.`);
  };

  return (
    <SectionCard
      tone={tone}
      icon={Grid3x3}
      title={`Matrix ${symbol}`}
      description={description}
      actions={
        <>
          <ActionButton icon={Shuffle} onClick={randomize}>
            Random
          </ActionButton>
          <ActionButton icon={Grid3x3} onClick={makeIdentity} disabled={rows !== cols}>
            Identity
          </ActionButton>
          <ActionButton icon={ArrowLeftRight} onClick={() => setGrid(transposeGrid(grid))}>
            Transpose
          </ActionButton>
          <ActionButton icon={ClipboardPaste} onClick={() => setPasteOpen((open) => !open)}>
            Paste
          </ActionButton>
          <ActionButton icon={Eraser} onClick={clear}>
            Clear
          </ActionButton>
          {extraActions}
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Rows
          </span>
          <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => onResize(clampDimension(rows - 1), cols)}
              className="flex w-10 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
              aria-label={`Remove a row from matrix ${symbol}`}
            >
              −
            </button>
            <div className="flex flex-1 items-center justify-center border-x border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">{rows}</span>
            </div>
            <button
              type="button"
              onClick={() => onResize(clampDimension(rows + 1), cols)}
              className="flex w-10 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
              aria-label={`Add a row to matrix ${symbol}`}
            >
              +
            </button>
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Columns
          </span>
          <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => onResize(rows, clampDimension(cols - 1))}
              className="flex w-10 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
              aria-label={`Remove a column from matrix ${symbol}`}
            >
              −
            </button>
            <div className="flex flex-1 items-center justify-center border-x border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">{cols}</span>
            </div>
            <button
              type="button"
              onClick={() => onResize(rows, clampDimension(cols + 1))}
              className="flex w-10 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
              aria-label={`Add a column to matrix ${symbol}`}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 -mx-1 overflow-x-auto px-1 pb-1">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(68px, 1fr))`,
            minWidth: `${cols * 74}px`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((value, colIndex) => (
              <input
                key={`${rowIndex}-${colIndex}`}
                value={value}
                onChange={(event) => updateCell(rowIndex, colIndex, event.target.value)}
                aria-label={`Matrix ${symbol}, row ${rowIndex + 1}, column ${colIndex + 1}`}
                inputMode="decimal"
                spellCheck={false}
                className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-1.5 py-2 text-center font-mono text-sm font-semibold tabular-nums text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />
            )),
          )}
        </div>
      </div>

      <p className="mt-2 text-sm leading-snug text-slate-500 dark:text-slate-400">
        Enter decimals or negative values. Empty cells are treated as 0.
      </p>

      {pasteOpen && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
          <Field
            label={`Paste matrix ${symbol}`}
            htmlFor={`matrix-${symbol}-paste`}
            hint="One row per line. Separate values with commas, tabs, semicolons or multiple spaces."
          >
            <textarea
              id={`matrix-${symbol}-paste`}
              value={pasteText}
              onChange={(event) => {
                setPasteText(event.target.value);
                setPasteError("");
              }}
              rows={4}
              spellCheck={false}
              placeholder={"1, 2, 3\n4, 5, 6\n7, 8, 9"}
              className={`${fieldClass(Boolean(pasteError), tone)} font-mono`}
            />
          </Field>
          {pasteError && <FieldError>{pasteError}</FieldError>}
          <div className="mt-2 flex flex-wrap gap-2">
            <ActionButton icon={ClipboardPaste} variant="primary" tone={tone} onClick={applyPaste}>
              Load into {symbol}
            </ActionButton>
            <ActionButton
              variant="ghost"
              onClick={() => {
                setPasteOpen(false);
                setPasteError("");
              }}
            >
              Cancel
            </ActionButton>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export default function MatrixCalculator() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("calculator");
  const [operationId, setOperationId] = useState("multiply");
  const [gridA, setGridA] = useState(DEFAULT_A);
  const [gridB, setGridB] = useState(DEFAULT_B);
  const [vector, setVector] = useState(DEFAULT_VECTOR);
  const [scalar, setScalar] = useState("2");
  const [power, setPower] = useState("2");
  const [display, setDisplay] = useState(DEFAULT_DISPLAY);

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  const operation = operationMeta(operationId);
  const needsB = Boolean(operation.binary);
  const needsVector = Boolean(operation.vector);
  const needsScalar = Boolean(operation.scalar);
  const needsPower = Boolean(operation.power);

  const setDisplayOption = (key, value) => setDisplay((current) => ({ ...current, [key]: value }));

  const rowsA = gridA.length;
  const colsA = gridA[0]?.length || 0;
  const rowsB = gridB.length;
  const colsB = gridB[0]?.length || 0;

  const vectorValues = useMemo(
    () => Array.from({ length: rowsA }, (_, index) => vector[index] ?? "0"),
    [vector, rowsA],
  );

  const setVectorValue = (index, value) => {
    setVector((current) => {
      const next = Array.from({ length: rowsA }, (_, position) => current[position] ?? "0");
      next[index] = value;
      return next;
    });
  };

  const resizeA = (rows, cols) => setGridA((current) => resizeGrid(current, rows, cols));
  const resizeB = (rows, cols) => setGridB((current) => resizeGrid(current, rows, cols));

  const result = useMemo(() => {
    const parsedA = parseGrid(gridA, "Matrix A");
    const errors = [...parsedA.errors];
    let parsedB = null;
    let parsedVector = null;
    let scalarValue = null;
    let exponent = null;

    if (needsB) {
      parsedB = parseGrid(gridB, "Matrix B");
      errors.push(...parsedB.errors);
    }

    if (needsVector) {
      parsedVector = parseVector(vectorValues, rowsA, "Vector b");
      errors.push(...parsedVector.errors);
    }

    if (needsScalar) {
      const raw = String(scalar).replace(/,/g, "").trim();
      const value = raw === "" ? Number.NaN : Number(raw);
      if (!Number.isFinite(value)) {
        errors.push("Scalar k must be a finite number.");
      } else {
        scalarValue = value;
      }
    }

    if (needsPower) {
      const value = Number(String(power).trim());
      if (!Number.isInteger(value)) {
        errors.push("Exponent k must be a whole number between −50 and 50.");
      } else {
        exponent = value;
      }
    }

    if (errors.length) {
      return { ok: false, error: errors[0], errors };
    }

    try {
      const A = parsedA.matrix;
      const B = parsedB ? parsedB.matrix : null;
      const tolerance = Number(display.tolerance);
      let kind = "matrix";
      let value;
      let steps = [];

      switch (operationId) {
        case "add":
          value = addMatrices(A, B);
          break;
        case "subtract":
          value = subtractMatrices(A, B);
          break;
        case "multiply":
          value = multiplyMatrices(A, B);
          break;
        case "hadamard":
          value = hadamardProduct(A, B);
          break;
        case "kron":
          value = kroneckerProduct(A, B);
          break;
        case "scalar":
          value = scalarMultiply(A, scalarValue);
          break;
        case "transpose":
          value = transposeMatrix(A);
          break;
        case "determinant":
          kind = "scalar";
          value = determinant(A, tolerance);
          break;
        case "inverse":
          value = inverse(A, tolerance);
          break;
        case "rank":
          kind = "scalar";
          value = matrixRank(A, tolerance);
          break;
        case "trace":
          kind = "scalar";
          value = A.reduce((sum, row, index) => sum + row[index], 0);
          break;
        case "adjugate":
          value = adjugate(A, tolerance);
          break;
        case "cofactor":
          value = cofactorMatrix(A, tolerance);
          break;
        case "rref": {
          const reduced = rref(A, tolerance, display.showSteps);
          value = reduced.matrix;
          steps = reduced.steps;
          break;
        }
        case "power":
          value = matrixPower(A, exponent, tolerance);
          break;
        case "solve": {
          const solved = solveLinearSystem(A, parsedVector.vector, tolerance);
          kind = "vector";
          value = solved.solution;
          steps = solved.steps;
          break;
        }
        default:
          throw new Error("This operation is not supported.");
      }

      let properties = null;
      if (kind === "matrix") {
        try {
          properties = matrixProperties(value, tolerance);
        } catch {
          properties = null;
        }
      }

      if (!steps.length) steps = [methodNote(operationId, display.tolerance)];

      return { ok: true, kind, value, steps, properties };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "The calculation could not be completed.",
        errors: [error?.message || "The calculation could not be completed."],
      };
    }
  }, [
    gridA,
    gridB,
    vectorValues,
    rowsA,
    scalar,
    power,
    operationId,
    needsB,
    needsVector,
    needsScalar,
    needsPower,
    display.tolerance,
    display.showSteps,
  ]);

  const format = useCallback(
    (value) => formatNumber(value, display.precision, display.notation),
    [display.precision, display.notation],
  );

  const resultMatrix = result.ok && result.kind === "matrix" ? result.value : null;
  const resultVector = result.ok && result.kind === "vector" ? result.value : null;
  const resultScalar = result.ok && result.kind === "scalar" ? result.value : null;
  const resultFitsEditor =
    resultMatrix &&
    resultMatrix.length <= MAX_DIMENSION &&
    (resultMatrix[0]?.length || 0) <= MAX_DIMENSION;

  const resultCsv = useMemo(() => {
    if (!result.ok) return "";
    if (result.kind === "matrix") return matrixToCsv(result.value, display.precision, display.notation);
    if (result.kind === "vector") return result.value.map(format).join("\r\n");
    return format(result.value);
  }, [result, format, display.precision, display.notation]);

  const resultTsv = useMemo(() => {
    if (!result.ok) return "";
    if (result.kind === "matrix") return matrixToTsv(result.value, display.precision, display.notation);
    if (result.kind === "vector") return result.value.map(format).join("\t");
    return format(result.value);
  }, [result, format, display.precision, display.notation]);

  const resultLatex = useMemo(() => {
    if (!result.ok) return "";
    if (result.kind === "matrix") return matrixToLatex(result.value, display.precision, display.notation);
    if (result.kind === "vector") {
      const body = result.value.map(format).join(" \\\\ ");
      return `\\begin{bmatrix} ${body} \\end{bmatrix}`;
    }
    return format(result.value);
  }, [result, format, display.precision, display.notation]);

  const resultJson = useMemo(() => {
    if (!result.ok) return "";
    if (result.kind === "matrix") return matrixToJson(result.value, display.precision, display.notation);
    if (result.kind === "vector") {
      return JSON.stringify(result.value.map(format), null, 2);
    }
    return JSON.stringify(format(result.value), null, 2);
  }, [result, format, display.precision, display.notation]);

  const formattedResultForExport = useMemo(() => {
    if (!result.ok) return null;
    if (result.kind === "matrix") return result.value.map((row) => row.map(format));
    if (result.kind === "vector") return result.value.map(format);
    return format(result.value);
  }, [result, format]);

  const swapAB = () => {
    if (!needsB) return;
    setGridA(gridB);
    setGridB(gridA);
    toast.success("Swapped matrices A and B.");
  };

  const matchBToA = () => {
    if (!needsB) return;
    if (["add", "subtract", "hadamard"].includes(operationId)) {
      setGridB((current) => resizeGrid(current, rowsA, colsA));
      toast.success("Resized B to match A.");
      return;
    }
    if (operationId === "multiply") {
      setGridB((current) => resizeGrid(current, colsA, colsB));
      toast.success(`Set B to ${colsA} rows so the product is defined.`);
    }
  };

  const resetAll = () => {
    setOperationId("multiply");
    setGridA(DEFAULT_A);
    setGridB(DEFAULT_B);
    setVector(DEFAULT_VECTOR);
    setScalar("2");
    setPower("2");
    setDisplay(DEFAULT_DISPLAY);
    toast.success("Matrix calculator reset.");
  };

  const downloadCsv = () => {
    if (!result.ok) {
      toast.error("Fix the inputs before downloading.");
      return;
    }
    downloadText(resultCsv, `matrix-${operationId}-result.csv`, "text/csv;charset=utf-8");
    toast.success("Result downloaded as CSV.");
  };

  const downloadJson = () => {
    if (!result.ok) {
      toast.error("Fix the inputs before downloading.");
      return;
    }
    downloadText(
      JSON.stringify(
        {
          tool: "Matrix Calculator",
          generatedAt: new Date().toISOString(),
          operation: {
            id: operationId,
            label: operation.label,
            group: operation.group,
            description: operation.description,
          },
          options: {
            precision: display.precision,
            notation: display.notation,
            tolerance: display.tolerance,
          },
          inputs: {
            A: gridA,
            ...(needsB ? { B: gridB } : {}),
            ...(needsVector ? { b: vectorValues } : {}),
            ...(needsScalar ? { scalar } : {}),
            ...(needsPower ? { power } : {}),
          },
          result: {
            kind: result.kind,
            value: formattedResultForExport,
          },
          steps: result.steps,
          properties: result.properties,
        },
        null,
        2,
      ),
      "matrix-result.json",
      "application/json;charset=utf-8",
    );
    toast.success("Result downloaded as JSON.");
  };

  const copyResultInto = (target) => {
    if (!resultMatrix) return;
    const nextGrid = gridFromMatrix(resultMatrix);
    if (target === "A") setGridA(nextGrid);
    else setGridB(nextGrid);
    toast.success(`Copied the result into matrix ${target}.`);
  };

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Linear algebra studio"
        icon={Grid3x3}
        title="Matrix Calculator"
        description="Add, multiply, invert and decompose matrices up to 8 × 8 with a live result. Choose from 16 operations, control precision and tolerance, inspect rank and determinant, follow row-reduction steps, and export as CSV, TSV, LaTeX or JSON."
        badges={[
          "16 operations",
          "Matrices up to 8 × 8",
          "Live results",
          "RREF steps",
          "Determinant & inverse",
          "LaTeX / CSV / JSON",
        ]}
      />

      <div
        role="tablist"
        aria-label="Matrix calculator sections"
        className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
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
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {tab === "calculator" && (
        <>
          <SectionCard
            tone={TONE}
            icon={Calculator}
            title="Operation"
            description="Pick what to compute. Results update as you type."
            actions={
              <ActionButton icon={RotateCcw} variant="ghost" onClick={resetAll}>
                Reset all
              </ActionButton>
            }
          >
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <Field
                  label="Matrix operation"
                  htmlFor="matrix-operation"
                  hint={operation.description}
                >
                  <select
                    id="matrix-operation"
                    value={operationId}
                    onChange={(event) => setOperationId(event.target.value)}
                    className={fieldClass(false, TONE)}
                  >
                    {OPERATION_GROUPS.map((group) => (
                      <optgroup key={group} label={group}>
                        {OPERATIONS.filter((item) => item.group === group).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>
              </div>

              {needsScalar && (
                <div className="lg:col-span-4">
                  <Field label="Scalar k" htmlFor="matrix-scalar" hint="Any finite number.">
                    <input
                      id="matrix-scalar"
                      value={scalar}
                      onChange={(event) => setScalar(event.target.value)}
                      inputMode="decimal"
                      className={`${fieldClass(false, TONE)} tabular-nums`}
                    />
                  </Field>
                </div>
              )}

              {needsPower && (
                <div className="lg:col-span-4">
                  <Field
                    label="Exponent k"
                    htmlFor="matrix-power"
                    hint="Whole number from −50 to 50."
                  >
                    <input
                      id="matrix-power"
                      value={power}
                      onChange={(event) => setPower(event.target.value)}
                      inputMode="numeric"
                      className={`${fieldClass(false, TONE)} tabular-nums`}
                    />
                  </Field>
                </div>
              )}

              {!needsScalar && !needsPower && (
                <div className="flex flex-wrap items-end gap-2 lg:col-span-4">
                  {needsB && (
                    <>
                      <ActionButton icon={ArrowLeftRight} onClick={swapAB}>
                        Swap A ↔ B
                      </ActionButton>
                      {operationId !== "kron" && (
                        <ActionButton icon={Rows3} onClick={matchBToA}>
                          Match B to A
                        </ActionButton>
                      )}
                    </>
                  )}
                  {!needsB && (
                    <div className="flex flex-wrap gap-2">
                      <Chip tone={TONE}>{outputFor(operation)} result</Chip>
                      <Chip tone="emerald">{requirementFor(operation)}</Chip>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone={TONE}>{operation.group}</Chip>
              <Chip tone="emerald">Requires: {requirementFor(operation)}</Chip>
              <Chip tone="sky">Returns: {outputFor(operation)}</Chip>
              {needsB && (
                <Chip tone={rowsA === rowsB && colsA === colsB ? "emerald" : "amber"}>
                  A {rowsA} × {colsA} · B {rowsB} × {colsB}
                </Chip>
              )}
            </div>

            {needsB && operationId === "multiply" && colsA !== rowsB && (
              <Callout tone="amber" variant="warning" className="mt-3" title="Dimensions do not line up">
                Matrix multiplication needs A&apos;s columns ({colsA}) to equal B&apos;s rows ({rowsB}). Use
                “Match B to A” or adjust the B row count.
              </Callout>
            )}

            {needsB &&
              ["add", "subtract", "hadamard"].includes(operationId) &&
              (rowsA !== rowsB || colsA !== colsB) && (
                <Callout tone="amber" variant="warning" className="mt-3" title="Dimensions do not match">
                  This operation works entry by entry, so A and B must have the same dimensions. A is {rowsA} ×{" "}
                  {colsA} and B is {rowsB} × {colsB}.
                </Callout>
              )}
          </SectionCard>

          <div className={`grid gap-6 ${needsB ? "lg:grid-cols-2" : ""}`}>
            <MatrixEditorCard
              symbol="A"
              description="The primary matrix. Used by every operation."
              grid={gridA}
              setGrid={setGridA}
              onResize={resizeA}
            />
            {needsB && (
              <MatrixEditorCard
                symbol="B"
                description="The second matrix, used by binary operations."
                grid={gridB}
                setGrid={setGridB}
                onResize={resizeB}
              />
            )}
          </div>

          {needsVector && (
            <SectionCard
              tone={TONE}
              icon={Rows3}
              title="Right-hand side vector b"
              description={`One value for each of the ${rowsA} row${rowsA === 1 ? "" : "s"} in A. The solver computes x in A · x = b.`}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {vectorValues.map((value, index) => (
                  <Field key={index} label={`b${subscript(index + 1)}`} htmlFor={`matrix-b-${index}`}>
                    <input
                      id={`matrix-b-${index}`}
                      value={value}
                      onChange={(event) => setVectorValue(index, event.target.value)}
                      inputMode="decimal"
                      className={`${fieldClass(false, TONE)} tabular-nums`}
                    />
                  </Field>
                ))}
              </div>
            </SectionCard>
          )}

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              {!result.ok ? (
                <SectionCard tone={TONE} icon={AlertTriangle} title="Result">
                  <Callout tone="amber" variant="warning" title="Cannot calculate this result">
                    {result.errors?.length > 1 ? (
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {result.errors.slice(0, 6).map((message) => (
                          <li key={message}>{message}</li>
                        ))}
                      </ul>
                    ) : (
                      result.error
                    )}
                  </Callout>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Fix the highlighted inputs above, then the result will update automatically. Dimension
                    mismatches are usually resolved by the “Match B to A” button or by changing the row and
                    column counts.
                  </p>
                </SectionCard>
              ) : (
                <>
                  <SectionCard
                    tone={TONE}
                    icon={result.kind === "matrix" ? Grid3x3 : result.kind === "vector" ? Rows3 : Sigma}
                    title="Result"
                    description={`${operation.label} · ${operation.group}`}
                    actions={
                      <>
                        <CopyButton text={resultCsv} tone={TONE} label="Copy CSV" />
                        <CopyButton text={resultTsv} tone={TONE} label="Copy TSV" />
                        <CopyButton text={resultLatex} tone={TONE} label="Copy LaTeX" />
                        <CopyButton text={resultJson} tone={TONE} label="Copy JSON" />
                        <ActionButton icon={FileSpreadsheet} onClick={downloadCsv}>
                          CSV
                        </ActionButton>
                        <ActionButton icon={FileJson} onClick={downloadJson}>
                          JSON
                        </ActionButton>
                      </>
                    }
                  >
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Chip tone={TONE}>{outputFor(operation)}</Chip>
                      <Chip tone="emerald">{result.kind}</Chip>
                      {result.kind === "matrix" && resultMatrix && (
                        <>
                          <Chip tone="sky">
                            {resultMatrix.length} × {resultMatrix[0]?.length || 0}
                          </Chip>
                          {resultFitsEditor && (
                            <ActionButton variant="ghost" onClick={() => copyResultInto("A")}>
                              Use as A
                            </ActionButton>
                          )}
                          {resultFitsEditor && needsB && (
                            <ActionButton variant="ghost" onClick={() => copyResultInto("B")}>
                              Use as B
                            </ActionButton>
                          )}
                        </>
                      )}
                    </div>

                    {result.kind === "matrix" && resultMatrix && (
                      <MatrixTable matrix={resultMatrix} format={format} />
                    )}

                    {result.kind === "vector" && resultVector && (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full border-collapse text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800/70">
                            <tr>
                              <th className="px-3 py-2 text-left text-sm font-bold text-slate-400 dark:text-slate-500">
                                Variable
                              </th>
                              <th className="px-3 py-2 text-left text-sm font-bold text-slate-400 dark:text-slate-500">
                                Value
                              </th>
                              <th className="px-3 py-2 text-right text-sm font-bold text-slate-400 dark:text-slate-500">
                                Copy
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {resultVector.map((value, index) => (
                              <tr key={index} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                                <td className="px-3 py-2 font-mono text-sm font-bold text-slate-900 dark:text-white">
                                  x{subscript(index + 1)}
                                </td>
                                <td className="px-3 py-2 font-mono text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                                  {format(value)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <CopyButton text={String(value)} tone={TONE} label="Copy" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {result.kind === "scalar" && resultScalar !== null && (
                      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/25">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {operation.label}
                        </p>
                        <p className="mt-1 break-all font-mono text-2xl font-black tabular-nums text-slate-900 dark:text-white sm:text-3xl">
                          {format(resultScalar)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <CopyButton text={String(resultScalar)} tone={TONE} label="Copy scalar" />
                          <Chip tone={TONE}>raw: {String(resultScalar)}</Chip>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip tone={TONE}>precision {display.precision}</Chip>
                      <Chip tone="sky">{display.notation}</Chip>
                      <Chip tone="amber">tolerance {display.tolerance}</Chip>
                    </div>
                  </SectionCard>

                  {display.showProperties && result.properties && (
                    <SectionCard
                      tone={TONE}
                      icon={Table2}
                      title="Result properties"
                      description="Computed from the result matrix, not from the inputs."
                    >
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <Stat
                          tone={TONE}
                          label="Dimensions"
                          value={`${result.properties.rows} × ${result.properties.cols}`}
                          icon={Grid3x3}
                        />
                        <Stat
                          tone={TONE}
                          label="Rank"
                          value={result.properties.rank === null ? "—" : result.properties.rank}
                          icon={Layers}
                        />
                        <Stat
                          tone={TONE}
                          label="Determinant"
                          value={
                            result.properties.determinant === null
                              ? "n/a"
                              : format(result.properties.determinant)
                          }
                          icon={Sigma}
                        />
                        <Stat
                          tone={TONE}
                          label="Trace"
                          value={result.properties.trace === null ? "n/a" : format(result.properties.trace)}
                          icon={Hash}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Chip tone={result.properties.square ? "emerald" : "amber"}>
                          {result.properties.square ? "square" : "not square"}
                        </Chip>
                        {result.properties.symmetric && <Chip tone="violet">symmetric</Chip>}
                        {result.properties.diagonal && <Chip tone="sky">diagonal</Chip>}
                        {result.properties.identity && <Chip tone="emerald">identity</Chip>}
                        {result.properties.zero && <Chip tone="amber">zero matrix</Chip>}
                        {result.properties.singular && <Chip tone="rose">singular</Chip>}
                      </div>
                    </SectionCard>
                  )}

                  {display.showSteps && (
                    <SectionCard
                      tone={TONE}
                      icon={Sparkles}
                      title="Working & method"
                      description="How this result was produced, plus any row operations that were collected."
                      actions={<CopyButton text={result.steps.join("\n")} tone={TONE} label="Copy steps" />}
                    >
                      <ol className="space-y-2">
                        {result.steps.map((step, index) => (
                          <li
                            key={`${index}-${step}`}
                            className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                              {index + 1}
                            </span>
                            <span className="min-w-0 break-words font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </SectionCard>
                  )}
                </>
              )}
            </div>

            <div className="space-y-6 xl:col-span-4">
              <SectionCard
                tone={TONE}
                icon={Braces}
                title="Display & precision"
                description="Controls formatting and the numerical tolerance used for pivots."
              >
                <div className="space-y-4">
                  <SliderRow
                    tone={TONE}
                    label="Decimal places"
                    min={0}
                    max={10}
                    step={1}
                    value={display.precision}
                    onChange={(value) => setDisplayOption("precision", value)}
                    format={(value) => `${value} dp`}
                    hint="Display only. Copy and download use the same precision."
                    onReset={() => setDisplayOption("precision", 4)}
                  />
                  <Segmented
                    label="Notation"
                    tone={TONE}
                    columns={3}
                    value={display.notation}
                    onChange={(value) => setDisplayOption("notation", value)}
                    options={[
                      { value: "auto", label: "Auto" },
                      { value: "decimal", label: "Decimal" },
                      { value: "scientific", label: "Sci" },
                    ]}
                  />
                  <Field
                    label="Pivot tolerance"
                    htmlFor="matrix-tolerance"
                    hint="Values below this are treated as zero during elimination. Raise it for near-singular matrices."
                  >
                    <select
                      id="matrix-tolerance"
                      value={display.tolerance}
                      onChange={(event) => setDisplayOption("tolerance", event.target.value)}
                      className={fieldClass(false, TONE)}
                    >
                      {TOLERANCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="space-y-2.5">
                    <ToggleRow
                      tone={TONE}
                      checked={display.showProperties}
                      onChange={(value) => setDisplayOption("showProperties", value)}
                      label="Show result properties"
                      description="Dimensions, rank, determinant, trace and matrix type."
                    />
                    <ToggleRow
                      tone={TONE}
                      checked={display.showSteps}
                      onChange={(value) => setDisplayOption("showSteps", value)}
                      label="Show working & method"
                      description="Includes collected RREF and solver row operations."
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Info} title="Quick reference">
                <div className="space-y-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  <p>
                    <span className="font-bold text-slate-800 dark:text-slate-200">A × B</span> needs A&apos;s
                    columns to equal B&apos;s rows.
                  </p>
                  <p>
                    <span className="font-bold text-slate-800 dark:text-slate-200">det(A) = 0</span> means A is
                    singular and has no inverse.
                  </p>
                  <p>
                    <span className="font-bold text-slate-800 dark:text-slate-200">A⁻¹</span> only exists for
                    square, non-singular matrices.
                  </p>
                  <p>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Ax = b</span> has a unique
                    solution when rank(A) equals the number of variables.
                  </p>
                  <p>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Aᵀ</span> swaps rows and
                    columns, so an m × n matrix becomes n × m.
                  </p>
                </div>
              </SectionCard>

              <SectionCard tone={TONE} icon={Sparkles} title="Try a preset">
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    onClick={() => {
                      setOperationId("determinant");
                      setGridA([
                        ["4", "7", "2"],
                        ["3", "6", "1"],
                        ["2", "5", "8"],
                      ]);
                      toast.success("Loaded a 3 × 3 determinant example.");
                    }}
                  >
                    Determinant
                  </ActionButton>
                  <ActionButton
                    onClick={() => {
                      setOperationId("inverse");
                      setGridA([
                        ["4", "7"],
                        ["2", "6"],
                      ]);
                      toast.success("Loaded an invertible 2 × 2 matrix.");
                    }}
                  >
                    2 × 2 inverse
                  </ActionButton>
                  <ActionButton
                    onClick={() => {
                      setOperationId("solve");
                      setGridA(DEFAULT_A);
                      setVector(DEFAULT_VECTOR);
                      toast.success("Loaded the default 3 × 3 system.");
                    }}
                  >
                    Solve Ax = b
                  </ActionButton>
                  <ActionButton
                    onClick={() => {
                      setOperationId("power");
                      setPower("4");
                      setGridA([
                        ["1", "1"],
                        ["0", "1"],
                      ]);
                      toast.success("Loaded a matrix power example.");
                    }}
                  >
                    A⁴
                  </ActionButton>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {tab === "learn" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard tone={TONE} icon={Grid3x3} title="Anatomy of a matrix">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-indigo-300 dark:bg-slate-950">
                A = [ a₁₁  a₁₂  a₁₃ ]
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;[ a₂₁  a₂₂  a₂₃ ]
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                The example above is a 2 × 3 matrix: 2 rows and 3 columns. The entry a<sub>ij</sub> sits in row i
                and column j. Dimensions are always written rows × columns.
              </p>
            </SectionCard>

            <SectionCard tone={TONE} icon={Sigma} title="Multiplication rule" className="lg:col-span-2">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-indigo-300 dark:bg-slate-950">
                (m × n) · (n × p) = (m × p)
                <br />
                C[i][j] = Σₖ A[i][k] · B[k][j]
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                The inner dimensions must match. Each entry of the product is the dot product of a row of A with a
                column of B. Matrix multiplication is not commutative: A × B is usually different from B × A, and
                one order may not even be defined.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone={TONE}>(2 × 3) · (3 × 4) = 2 × 4</Chip>
                <Chip tone="amber">not commutative</Chip>
                <Chip tone="emerald">associative</Chip>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard tone={TONE} icon={Sigma} title="Determinant & inverse">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-indigo-300 dark:bg-slate-950">
                det([a b; c d]) = ad − bc
                <br />
                A⁻¹ = (1 / det(A)) · [ d −b; −c a ]
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                The determinant measures how a linear transformation scales area or volume. When det(A) = 0 the
                transformation collapses at least one dimension, the matrix is singular, and no inverse exists.
                This calculator uses LU decomposition with partial pivoting, which is more stable than cofactor
                expansion for larger matrices.
              </p>
            </SectionCard>

            <SectionCard tone={TONE} icon={Rows3} title="Solving Ax = b">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-indigo-300 dark:bg-slate-950">
                [ A | b ] → RREF → [ I | x ]
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Form the augmented matrix, then reduce it with Gauss–Jordan elimination. If every variable column
                becomes a pivot and the final column does not, the system has exactly one solution. If a pivot
                lands in the last column the equations contradict each other. Too few pivots means infinitely many
                solutions.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone="emerald">unique: rank(A) = n</Chip>
                <Chip tone="amber">no solution: pivot in b</Chip>
                <Chip tone="rose">infinite: rank(A) &lt; n</Chip>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard tone={TONE} icon={Layers} title="Hadamard vs Kronecker">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-indigo-300 dark:bg-slate-950">
                (A ⊙ B)[i][j] = A[i][j] · B[i][j]
                <br />
                A ⊗ B = [ a₁₁B  a₁₂B … ]
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                The Hadamard product is a simple element-wise product and needs identical dimensions. The
                Kronecker product replaces every entry of A with a scaled copy of the whole matrix B, so its
                result is much larger: an m × n matrix times a p × q matrix produces an mp × nq matrix.
              </p>
            </SectionCard>

            <SectionCard tone={TONE} icon={BookOpen} title="Powers, transpose & rank">
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-indigo-300 dark:bg-slate-950">
                A⁰ = I, Aᵏ = A · A · … · A
                <br />
                (Aᵀ)[i][j] = A[j][i]
                <br />
                rank(A) = number of pivots
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Only square matrices have powers. Negative powers use the inverse, so the matrix must also be
                invertible. Rank counts linearly independent rows, which equals the number of pivots found during
                row reduction and tells you the true dimension of the output space.
              </p>
            </SectionCard>
          </div>

          <SectionCard
            tone={TONE}
            icon={Table2}
            title="Operation reference"
            description="Every supported operation, its dimension requirement and the type of result it returns."
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Operation</th>
                    <th className="px-3 py-2.5 font-bold">Group</th>
                    <th className="px-3 py-2.5 font-bold">Requirement</th>
                    <th className="px-3 py-2.5 font-bold">Returns</th>
                    <th className="px-3 py-2.5 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {OPERATIONS.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                        {item.label}
                      </td>
                      <td className="px-3 py-2.5">
                        <Chip tone={TONE}>{item.group}</Chip>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                        {requirementFor(item)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{outputFor(item)}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <Callout tone="indigo" variant="tip" title="Numbers are approximate">
              Floating-point arithmetic can produce values such as 1e−16 where zero is expected. Raise the pivot
              tolerance if a near-singular matrix is being reported as singular.
            </Callout>
            <Callout tone="emerald" variant="success" title="Everything stays local">
              Matrices never leave your browser. There is no upload, no account and no server-side calculation.
            </Callout>
            <Callout tone="amber" variant="warning" title="Watch the size cap">
              Each matrix is limited to {MAX_DIMENSION} × {MAX_DIMENSION}. A Kronecker product can therefore grow
              to {(MAX_DIMENSION * MAX_DIMENSION).toLocaleString()} entries per side.
            </Callout>
          </div>

          <FaqAccordion items={MATRIX_FAQS} tone={TONE} title="Matrix questions, answered" />
        </div>
      )}
    </div>
  );
}
