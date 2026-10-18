"use client";

// app/(main)/tools-compo/tools/_shared/ChartDataImport.jsx
// A reusable, fully client-side "Import CSV / Excel" panel for the Chart Studio
// tools. It supports two mapping modes:
//
//   • mode="single" — one category column + one value column (pie, funnel, polar)
//   • mode="multi"  — one category column + many numeric series columns
//                     (bar, line, radar)
//
// Files are parsed locally (nothing is uploaded), the header row and columns
// are detected automatically, and the user reviews a live preview before the
// rows are handed back through `onImport`.

import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  FileSpreadsheet,
  FileUp,
  RotateCw,
  UploadCloud,
  X,
} from "lucide-react";
import {
  IMPORT_ACCEPT,
  MAX_IMPORT_ROWS,
  MAX_IMPORT_SERIES,
  analyzeTable,
  buildMultiSeries,
  buildSlices,
  parseDataFile,
  parseDelimitedText,
} from "./chartImport";

function ImportLabel({ children }) {
  return (
    <div className="flex items-center gap-2">
      <UploadCloud className="w-4 h-4 text-brandColor" />
      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
        {children}
      </h3>
    </div>
  );
}

export default function ChartDataImport({
  onImport,
  mode = "single",
  subject = "chart",
  maxRows = MAX_IMPORT_ROWS,
  maxSeries = MAX_IMPORT_SERIES,
  label = "Import CSV / Excel",
}) {
  const isMulti = mode === "multi";

  const [stage, setStage] = useState("idle"); // "idle" | "mapping"
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [rawRows, setRawRows] = useState([]);
  const [hasHeader, setHasHeader] = useState(false);
  const [labelIndex, setLabelIndex] = useState(0);
  const [valueIndex, setValueIndex] = useState(1);
  const [valueIndexes, setValueIndexes] = useState([]);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const table = useMemo(
    () => (rawRows.length ? analyzeTable(rawRows, { hasHeader }) : null),
    [rawRows, hasHeader]
  );

  // Columns that can act as a numeric series, plus their suitability hint.
  const seriesCandidates = useMemo(() => {
    if (!table) return [];
    return table.columns
      .filter((column) => column.index !== labelIndex)
      .map((column) => ({
        ...column,
        numeric: column.numericRatio >= 0.5,
      }));
  }, [table, labelIndex]);

  const preview = useMemo(() => {
    if (!table) return null;
    if (isMulti) {
      return buildMultiSeries(table, labelIndex, valueIndexes, {
        maxCategories: maxRows,
        maxSeries,
      });
    }
    return buildSlices(table, labelIndex, valueIndex, { maxRows });
  }, [table, isMulti, labelIndex, valueIndex, valueIndexes, maxRows, maxSeries]);

  const reset = useCallback(() => {
    setStage("idle");
    setBusy(false);
    setError("");
    setFileName("");
    setSourceLabel("");
    setRawRows([]);
    setValueIndexes([]);
    setShowPaste(false);
    setPasteText("");
  }, []);

  const beginFromRows = useCallback(
    (rows, name, source) => {
      const clean = (rows || []).filter(
        (row) => Array.isArray(row) && row.some((cell) => String(cell ?? "").trim() !== "")
      );
      if (clean.length < 2) {
        setError(
          `We couldn't find enough rows — a ${subject} needs a header and at least two data rows.`
        );
        return;
      }
      if (clean.length === 2 && !clean[1].some((cell) => String(cell).trim() !== "")) {
        setError("That file only contains a header row — add some data below it and try again.");
        return;
      }

      const analysis = analyzeTable(clean, {});
      if (isMulti) {
        if (!analysis.valueIndexes.length) {
          setError(
            "No numeric column was detected. Make sure your value columns contain plain numbers, then try again."
          );
          return;
        }
        setValueIndexes(analysis.valueIndexes.slice(0, maxSeries));
      } else if (analysis.valueIndex === -1) {
        setError(
          "No numeric column was detected. Make sure one column holds plain numbers, then try again."
        );
        return;
      }

      setRawRows(clean);
      setHasHeader(analysis.hasHeader);
      setLabelIndex(analysis.labelIndex);
      setValueIndex(analysis.valueIndex === -1 ? 0 : analysis.valueIndex);
      setFileName(name || "pasted-data.csv");
      setSourceLabel(source || "");
      setError("");
      setStage("mapping");
    },
    [isMulti, maxSeries, subject]
  );

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setBusy(true);
      setError("");
      try {
        const result = await parseDataFile(file);
        if (!result.rows || result.rows.length < 2) {
          throw new Error(
            "This file looks empty. Include a header row and at least two data rows."
          );
        }
        beginFromRows(
          result.rows,
          file.name,
          result.source === "Excel"
            ? `Excel · ${result.sheetName}`
            : `Delimited text · ${
                result.delimiter === "tab" ? "tab-separated" : `${result.delimiter}-separated`
              }`
        );
      } catch (err) {
        setError(err?.message || "That file could not be read. Try a .csv or .xlsx file.");
      } finally {
        setBusy(false);
      }
    },
    [beginFromRows]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: IMPORT_ACCEPT,
    multiple: false,
    maxFiles: 1,
    onDrop: (files) => {
      if (files?.[0]) handleFile(files[0]);
    },
  });

  const handlePasteParse = () => {
    const rows = parseDelimitedText(pasteText);
    if (!rows.length) {
      setError("Paste a couple of rows first, then try again.");
      return;
    }
    beginFromRows(rows, "pasted-data.csv", "Pasted data");
  };

  const toggleSeriesColumn = (index) => {
    setValueIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
  };

  const singleRows = !isMulti ? preview?.slices ?? [] : [];
  const multiCategories = isMulti ? preview?.categories ?? [] : [];
  const multiSeries = isMulti ? preview?.series ?? [] : [];

  const usable = isMulti ? multiCategories.length : singleRows.length;
  const hasPositive = isMulti
    ? multiSeries.some((s) => s.values.some((value) => value > 0))
    : singleRows.some((row) => row.value > 0);
  const enoughSeries = isMulti ? multiSeries.length >= 1 : true;
  const canImport = usable >= 2 && enoughSeries && hasPositive;

  const commit = () => {
    if (!preview || !canImport) {
      toast.error(
        isMulti
          ? "Pick at least two rows and one value column with a number above zero."
          : "You need at least two rows with a value above zero."
      );
      return;
    }
    if (isMulti) {
      onImport({
        mode: "multi",
        fileName,
        categories: multiCategories,
        series: multiSeries,
      });
      toast.success(
        `Imported ${multiCategories.length} categories × ${multiSeries.length} ${
          multiSeries.length === 1 ? "series" : "series"
        } from ${fileName}`
      );
    } else {
      onImport({ mode: "single", fileName, rows: singleRows });
      toast.success(`Imported ${singleRows.length} categories from ${fileName}`);
    }
    reset();
  };

  const previewRows = table ? table.body.slice(0, 40) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <ImportLabel>{label}</ImportLabel>
        {stage === "mapping" && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-brandColor transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        )}
      </div>

      {stage === "idle" && (
        <div className="flex flex-col gap-2">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center gap-1.5 px-4 py-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-brandColor bg-brandColor/5"
                : "border-gray-300 dark:border-gray-700 hover:border-brandColor/60 bg-gray-50/60 dark:bg-gray-950/40"
            }`}
          >
            <input {...getInputProps()} />
            <span className="w-9 h-9 rounded-full bg-brandColor/10 text-brandColor flex items-center justify-center">
              {busy ? <RotateCw className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            </span>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
              {busy
                ? "Reading your file…"
                : isDragActive
                  ? "Drop to import"
                  : "Drop a CSV or Excel file"}
            </span>
            <span className="text-[10px] text-gray-400">
              or click to browse · .csv, .tsv, .xlsx — processed locally
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowPaste((value) => !value)}
            className="self-start inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:text-brandColor transition-colors cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            {showPaste ? "Hide paste box" : "Paste data instead"}
          </button>

          {showPaste && (
            <div className="flex flex-col gap-2">
              <textarea
                value={pasteText}
                onChange={(event) => setPasteText(event.target.value)}
                rows={5}
                spellCheck={false}
                placeholder={
                  isMulti
                    ? "Month,Sales,Cost\nJan,4200,2600\nFeb,5100,2800"
                    : "Category,Value\nOrganic Search,4200\nDirect,2600"
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono text-gray-800 dark:text-gray-100 outline-none focus:border-brandColor resize-y"
              />
              <button
                type="button"
                onClick={handlePasteParse}
                className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-[11px] font-bold transition-all cursor-pointer active:scale-95"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Use pasted data
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-red-600 dark:text-red-300 leading-relaxed">
                {error}
              </p>
            </div>
          )}
        </div>
      )}

      {stage === "mapping" && table && preview && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 p-3 bg-gray-50/40 dark:bg-gray-950/30">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brandColor/10 text-brandColor flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">
                {fileName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {sourceLabel} · {table.body.length} data rows · {table.columns.length} columns
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(event) => setHasHeader(event.target.checked)}
              className="w-3.5 h-3.5 rounded accent-brandColor cursor-pointer"
            />
            First row is a header
          </label>

          <div className={isMulti ? "" : "grid grid-cols-2 gap-2"}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Category column
              </label>
              <select
                value={labelIndex}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setLabelIndex(next);
                  setValueIndexes((prev) => prev.filter((index) => index !== next));
                }}
                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-[11px] font-semibold text-gray-700 dark:text-gray-200 outline-none focus:border-brandColor cursor-pointer"
              >
                {table.header.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {!isMulti && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Value column
                </label>
                <select
                  value={valueIndex}
                  onChange={(event) => setValueIndex(Number(event.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-[11px] font-semibold text-gray-700 dark:text-gray-200 outline-none focus:border-brandColor cursor-pointer"
                >
                  {table.header.map((name, index) => (
                    <option key={index} value={index}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isMulti && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Value columns (series)
              </label>
              {seriesCandidates.length === 0 ? (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  No other columns are available — pick a different category column.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {seriesCandidates.map((column) => {
                    const active = valueIndexes.includes(column.index);
                    return (
                      <button
                        key={column.index}
                        type="button"
                        onClick={() => toggleSeriesColumn(column.index)}
                        title={`${column.numeric ? "Numeric" : "Mostly text"} · ${column.numeric}/${column.nonEmpty} values`}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer ${
                          active
                            ? "border-brandColor bg-brandColor/10 text-brandColor"
                            : "border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-brandColor/40"
                        }`}
                      >
                        {active && <CheckCircle2 className="w-3 h-3" />}
                        {column.name}
                        {!column.numeric && (
                          <span className="text-[9px] text-amber-500">text</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
            <div
              className="grid bg-gray-50 dark:bg-gray-950/60 text-[10px] font-bold uppercase tracking-wider text-gray-400"
              style={{
                gridTemplateColumns: `repeat(${isMulti ? multiSeries.length + 1 : 2}, minmax(0, 1fr))`,
              }}
            >
              <span className="px-2 py-1.5 truncate">{table.header[labelIndex]}</span>
              {isMulti
                ? multiSeries.map((s, index) => (
                    <span
                      key={`${s.name}-${index}`}
                      className="px-2 py-1.5 truncate text-right"
                    >
                      {s.name}
                    </span>
                  ))
                : (
                    <span className="px-2 py-1.5 truncate text-right">
                      {table.header[valueIndex]}
                    </span>
                  )}
            </div>
            <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {previewRows.slice(0, isMulti ? maxRows : 40).map((row, index) => (
                <div
                  key={index}
                  className="grid text-[11px]"
                  style={{
                    gridTemplateColumns: `repeat(${isMulti ? multiSeries.length + 1 : 2}, minmax(0, 1fr))`,
                  }}
                >
                  <span className="px-2 py-1.5 text-gray-700 dark:text-gray-200 truncate">
                    {String(row[labelIndex] ?? "").trim() || (
                      <em className="text-gray-400">untitled</em>
                    )}
                  </span>
                  {isMulti
                    ? valueIndexes.slice(0, maxSeries).map((columnIndex) => (
                        <span
                          key={columnIndex}
                          className="px-2 py-1.5 text-right font-mono text-gray-700 dark:text-gray-200 truncate"
                        >
                          {String(row[columnIndex] ?? "")}
                        </span>
                      ))
                    : (
                        <span className="px-2 py-1.5 text-right font-mono text-gray-700 dark:text-gray-200 truncate">
                          {String(row[valueIndex] ?? "")}
                        </span>
                      )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>
              {isMulti
                ? `${multiCategories.length} ${
                    multiCategories.length === 1 ? "row" : "rows"
                  } × ${multiSeries.length} ${
                    multiSeries.length === 1 ? "series" : "series"
                  }`
                : `${singleRows.length} usable ${
                    singleRows.length === 1 ? "row" : "rows"
                  }${!isMulti && preview.skipped > 0 ? ` · ${preview.skipped} skipped` : ""}`}
            </span>
            {(isMulti ? preview.categoriesTruncated : preview.truncated) && (
              <span className="text-amber-500 font-semibold">
                Only the first {maxRows} rows are used
              </span>
            )}
            {isMulti && preview.seriesTruncated && (
              <span className="text-amber-500 font-semibold">
                Max {maxSeries} series
              </span>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-red-600 dark:text-red-300 leading-relaxed">
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={commit}
            disabled={!canImport}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
              canImport
                ? "bg-brandColor hover:bg-brandColorHover text-white shadow-xs cursor-pointer active:scale-95"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {canImport
              ? isMulti
                ? `Import ${multiCategories.length} × ${multiSeries.length}`
                : `Import ${singleRows.length} categories`
              : isMulti
                ? "Need 2+ rows and 1+ value column"
                : "Need 2+ rows with a value above zero"}
          </button>
        </div>
      )}
    </div>
  );
}
