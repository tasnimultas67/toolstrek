"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import ToolPageShell from "../ToolPageShell";

const NUP_OPTIONS = [
  {
    id: "2",
    label: "2-up",
    pagesPerSheet: 2,
    description: "Two pages on each sheet",
  },
  {
    id: "4",
    label: "4-up",
    pagesPerSheet: 4,
    description: "Four pages on each sheet",
  },
  {
    id: "6",
    label: "6-up",
    pagesPerSheet: 6,
    description: "Six pages on each sheet",
  },
  {
    id: "8",
    label: "8-up",
    pagesPerSheet: 8,
    description: "Eight pages on each sheet",
  },
  {
    id: "9",
    label: "9-up",
    pagesPerSheet: 9,
    description: "Nine pages on each sheet",
  },
  {
    id: "12",
    label: "12-up",
    pagesPerSheet: 12,
    description: "Twelve pages on each sheet",
  },
  {
    id: "16",
    label: "16-up",
    pagesPerSheet: 16,
    description: "Sixteen pages on each sheet",
  },
];

const SHEET_SIZES = {
  a4: { label: "A4", width: 595.28, height: 841.89 },
  letter: { label: "Letter", width: 612, height: 792 },
  legal: { label: "Legal", width: 612, height: 1008 },
  tabloid: { label: "Tabloid", width: 792, height: 1224 },
};

const LAYOUT_MAP = {
  2: {
    portrait: { columns: 1, rows: 2 },
    landscape: { columns: 2, rows: 1 },
  },
  4: {
    portrait: { columns: 2, rows: 2 },
    landscape: { columns: 2, rows: 2 },
  },
  6: {
    portrait: { columns: 2, rows: 3 },
    landscape: { columns: 3, rows: 2 },
  },
  8: {
    portrait: { columns: 2, rows: 4 },
    landscape: { columns: 4, rows: 2 },
  },
  9: {
    portrait: { columns: 3, rows: 3 },
    landscape: { columns: 3, rows: 3 },
  },
  12: {
    portrait: { columns: 3, rows: 4 },
    landscape: { columns: 4, rows: 3 },
  },
  16: {
    portrait: { columns: 4, rows: 4 },
    landscape: { columns: 4, rows: 4 },
  },
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function getOutputName(fileName) {
  const base = fileName?.replace(/\.pdf$/i, "") || "n-up";
  return `${base}-n-up.pdf`;
}

function getGrid(pagesPerSheet, orientation) {
  const config = LAYOUT_MAP[pagesPerSheet] || LAYOUT_MAP[4];
  return config[orientation] || config.portrait;
}

function getSheetSize(sizeId, orientation) {
  const base = SHEET_SIZES[sizeId] || SHEET_SIZES.a4;
  if (orientation === "landscape") {
    return { label: base.label, width: base.height, height: base.width };
  }
  return { label: base.label, width: base.width, height: base.height };
}

function fitIntoBox(pageWidth, pageHeight, boxWidth, boxHeight) {
  const scale = Math.min(boxWidth / pageWidth, boxHeight / pageHeight);
  return {
    width: pageWidth * scale,
    height: pageHeight * scale,
  };
}

function clonePdfBytes(bytes) {
  if (!bytes) return bytes;
  return bytes.slice ? bytes.slice() : new Uint8Array(bytes);
}

function createPreviewSlots(count) {
  return Array.from({ length: count }, (_, index) => index + 1);
}

async function loadPdfJs() {
  const mod = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdfjs = mod.default ?? mod;

  if (pdfjs?.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }

  return pdfjs;
}

async function renderPreviewThumbs(sourceBytes, maxPages) {
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: clonePdfBytes(sourceBytes),
    useWorkerFetch: false,
  });

  const pdf = await loadingTask.promise;
  const thumbs = [];
  const pagesToRender = Math.min(pdf.numPages, maxPages);

  try {
    for (let pageIndex = 1; pageIndex <= pagesToRender; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const viewport = page.getViewport({ scale: 0.22 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const context = canvas.getContext("2d", { alpha: false });

      if (!context) {
        throw new Error("Your browser does not support canvas rendering.");
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      thumbs.push(canvas.toDataURL("image/png"));
      page.cleanup?.();
    }
  } finally {
    try {
      pdf.destroy?.();
    } catch {
      // Ignore cleanup issues.
    }
  }

  return thumbs;
}

async function createNupPdf(sourceBytes, config, onProgress) {
  const sourcePdf = await PDFDocument.load(sourceBytes, {
    ignoreEncryption: false,
    updateMetadata: true,
  });

  const outputPdf = await PDFDocument.create();
  const sourcePageIndices = sourcePdf.getPageIndices();
  const embeddedPages = await outputPdf.embedPdf(
    sourceBytes,
    sourcePageIndices,
  );
  const pagesPerSheet = config.pagesPerSheet;
  const totalPages = embeddedPages.length;
  const outputSheets = Math.max(1, Math.ceil(totalPages / pagesPerSheet));
  const sheet = getSheetSize(config.sheetSizeId, config.orientation);
  const grid = getGrid(pagesPerSheet, config.orientation);
  const borderColor = rgb(0.8, 0.82, 0.86);

  for (let sheetIndex = 0; sheetIndex < outputSheets; sheetIndex += 1) {
    const page = outputPdf.addPage([sheet.width, sheet.height]);
    const usableWidth =
      sheet.width - config.margin * 2 - config.gap * (grid.columns - 1);
    const usableHeight =
      sheet.height - config.margin * 2 - config.gap * (grid.rows - 1);
    const cellWidth = usableWidth / grid.columns;
    const cellHeight = usableHeight / grid.rows;

    for (let slot = 0; slot < pagesPerSheet; slot += 1) {
      const sourceIndex = sheetIndex * pagesPerSheet + slot;
      if (sourceIndex >= totalPages) break;

      const row = Math.floor(slot / grid.columns);
      const column = slot % grid.columns;
      const cellX = config.margin + column * (cellWidth + config.gap);
      const cellY =
        sheet.height -
        config.margin -
        (row + 1) * cellHeight -
        row * config.gap;
      const embeddedPage = embeddedPages[sourceIndex];
      const fitted = fitIntoBox(
        embeddedPage.width,
        embeddedPage.height,
        cellWidth,
        cellHeight,
      );
      const x = cellX + (cellWidth - fitted.width) / 2;
      const y = cellY + (cellHeight - fitted.height) / 2;

      page.drawPage(embeddedPage, {
        x,
        y,
        width: fitted.width,
        height: fitted.height,
      });

      if (config.showBorders) {
        page.drawRectangle({
          x: cellX,
          y: cellY,
          width: cellWidth,
          height: cellHeight,
          borderColor,
          borderWidth: 0.75,
        });
      }
    }

    onProgress?.((sheetIndex + 1) / outputSheets);
  }

  return outputPdf.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
  });
}

export default function NUpPDFTool() {
  const inputRef = useRef(null);
  const downloadUrlRef = useRef("");

  const [pdfFile, setPdfFile] = useState(null);
  const [selectedNUp, setSelectedNUp] = useState("4");
  const [sheetSizeId, setSheetSizeId] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [margin, setMargin] = useState(18);
  const [gap, setGap] = useState(12);
  const [showBorders, setShowBorders] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [status, setStatus] = useState(
    "Upload one PDF to build a new N-up layout.",
  );
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultNote, setResultNote] = useState("");
  const [outputBytes, setOutputBytes] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [previewThumbs, setPreviewThumbs] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const preset =
    NUP_OPTIONS.find((item) => item.id === selectedNUp) || NUP_OPTIONS[1];
  const pagesPerSheet = preset.pagesPerSheet;
  const sheet = getSheetSize(sheetSizeId, orientation);
  const grid = getGrid(pagesPerSheet, orientation);
  const workspaceReady = Boolean(pdfFile);
  const previewSlots = useMemo(
    () => createPreviewSlots(pagesPerSheet),
    [pagesPerSheet],
  );
  const outputSheets = useMemo(() => {
    if (!pageCount) return 0;
    return Math.max(1, Math.ceil(pageCount / pagesPerSheet));
  }, [pageCount, pagesPerSheet]);

  useEffect(() => {
    let cancelled = false;

    async function updatePreview() {
      if (!pdfFile?.bytes) {
        setPreviewThumbs([]);
        setPreviewLoading(false);
        return;
      }

      setPreviewLoading(true);

      try {
        const thumbs = await renderPreviewThumbs(pdfFile.bytes, pagesPerSheet);
        if (!cancelled) {
          setPreviewThumbs(thumbs);
        }
      } catch {
        if (!cancelled) {
          setPreviewThumbs([]);
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    }

    updatePreview();

    return () => {
      cancelled = true;
    };
  }, [pdfFile, pagesPerSheet]);

  useEffect(() => {
    return () => {
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
        downloadUrlRef.current = "";
      }
    };
  }, []);

  useEffect(() => {
    if (downloadUrlRef.current && downloadUrlRef.current !== downloadUrl) {
      URL.revokeObjectURL(downloadUrlRef.current);
    }

    if (downloadUrl) {
      downloadUrlRef.current = downloadUrl;
    }
  }, [downloadUrl]);

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFile(file) {
    setError("");
    setResultNote("");
    setDownloadUrl("");
    setOutputBytes(0);
    setProgress(null);

    if (!file) return;

    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      setError("Please choose a PDF file.");
      return;
    }

    setStatus(`Loading ${file.name}...`);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes, {
        ignoreEncryption: false,
        updateMetadata: true,
      });

      setPdfFile({ file, bytes });
      setPageCount(pdf.getPageCount());
      setDownloadName(getOutputName(file.name));
      setStatus(`Loaded ${file.name}.`);
    } catch (loadError) {
      setPdfFile(null);
      setPageCount(0);
      setError(loadError?.message || "Unable to read the PDF.");
      setStatus("Upload one PDF to build a new N-up layout.");
    }
  }

  function clearAll() {
    setPdfFile(null);
    setDownloadUrl("");
    setDownloadName("");
    setStatus("Upload one PDF to build a new N-up layout.");
    setError("");
    setProgress(null);
    setResultNote("");
    setOutputBytes(0);
    setPageCount(0);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleCombine() {
    if (!pdfFile?.bytes) {
      setError("Choose a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setResultNote("");
    setProgress(0);
    setStatus("Building your N-up PDF...");

    try {
      const result = await createNupPdf(
        pdfFile.bytes,
        {
          pagesPerSheet,
          sheetSizeId,
          orientation,
          margin,
          gap,
          showBorders,
        },
        (value) => {
          setProgress(Math.max(0, Math.min(1, value)));
        },
      );

      const blob = new Blob([result], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setOutputBytes(result.length);
      setProgress(1);
      setStatus("Combination complete.");
      setResultNote(
        `${pageCount} page${pageCount === 1 ? "" : "s"} arranged as ${pagesPerSheet}-up across ${outputSheets} sheet${outputSheets === 1 ? "" : "s"}.`,
      );
    } catch (combineError) {
      setError(
        combineError?.message ||
          "Something went wrong while generating the N-up PDF.",
      );
      setStatus("Combination failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  const pagesPerSheetText = `${pagesPerSheet}-up`;

  return (
    <ToolPageShell widthClassName="max-w-7xl px-1 pt-20 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 px-3 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50 dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-6 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/10" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-500/10" />
        </div>

        <div className="relative mx-auto w-full">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
                Organize &amp; Print
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                N-Up PDF
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                Put multiple PDF pages onto a single sheet for compact printing
                and quick review. Upload a PDF to unlock the preview, rules, and
                full control panel.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50">
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  100%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Private
                </div>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50">
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {pagesPerSheetText}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Layout
                </div>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50">
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Local
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Processing
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50">
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-8 text-center transition hover:border-amber-300 hover:bg-amber-50/30 dark:border-slate-700/50 dark:from-slate-800/30 dark:to-slate-800/50 dark:hover:border-amber-500/50 dark:hover:bg-amber-500/10"
                  onClick={openPicker}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleFile(event.dataTransfer.files?.[0] || null);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openPicker();
                    }
                  }}
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    PDF
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Upload PDF
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Drop a single PDF here, or click to browse from your device.
                  </p>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(event) =>
                    handleFile(event.target.files?.[0] || null)
                  }
                />

                <div className="mt-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700/50">
                      Pages: {pageCount || "-"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700/50">
                      Output sheets: {outputSheets || "-"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700/50">
                      Output size:{" "}
                      {outputBytes ? formatBytes(outputBytes) : "-"}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    {isProcessing ? (
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 dark:from-amber-400 dark:to-orange-400"
                        style={{
                          width: `${Math.round((progress ?? 0) * 100)}%`,
                        }}
                      />
                    ) : workspaceReady ? (
                      <div className="h-full w-full rounded-full bg-amber-200 dark:bg-amber-500/20" />
                    ) : (
                      <div className="h-full w-0 rounded-full bg-amber-500 dark:bg-amber-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>{status}</span>
                    <span>
                      {isProcessing
                        ? `${Math.round((progress ?? 0) * 100)}%`
                        : workspaceReady
                          ? "Ready"
                          : "-"}
                    </span>
                  </div>
                </div>

                {error ? (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300">
                    {error}
                  </div>
                ) : null}
              </div>

              {workspaceReady ? (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Preview layout
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Real page thumbnails show how the first output sheet
                        will look.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewLoading ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700/50 dark:text-slate-400">
                          Rendering
                        </span>
                      ) : null}
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        {pagesPerSheetText}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-800/30">
                    <div className="mx-auto flex max-w-[280px] flex-col items-center gap-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        {sheet.label} {orientation}
                      </div>
                      <div
                        className="grid w-full gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
                        }}
                      >
                        {previewSlots.map((slot) => {
                          const hasPage = slot <= pageCount;
                          const thumb = previewThumbs[slot - 1];
                          return (
                            <div
                              key={slot}
                              className={[
                                "aspect-[3/4] rounded-2xl border p-1.5 overflow-hidden",
                                hasPage
                                  ? "border-amber-300 bg-white shadow-sm dark:border-amber-500/50 dark:bg-slate-700"
                                  : "border-dashed border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700/30",
                              ].join(" ")}
                            >
                              {hasPage && thumb ? (
                                <img
                                  src={thumb}
                                  alt={`Preview page ${slot}`}
                                  className="h-full w-full rounded-[0.95rem] object-contain bg-white dark:bg-slate-800"
                                />
                              ) : hasPage && previewLoading ? (
                                <div className="flex h-full items-center justify-center rounded-[0.95rem] bg-white text-[10px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                  Loading...
                                </div>
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                    Blank
                                  </div>
                                  <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                    Unused slot
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Pages are filled left to right, top to bottom, and extra
                        slots stay blank.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Preview layout
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Upload a PDF to unlock the live N-up preview.
                  </p>
                </div>
              )}

              {workspaceReady ? (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Layout
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Choose how many pages should appear on each sheet.
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      {pagesPerSheetText}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {NUP_OPTIONS.map((item) => {
                      const active = item.id === selectedNUp;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedNUp(item.id)}
                          className={[
                            "rounded-2xl border px-3 py-2.5 text-left transition",
                            active
                              ? "border-amber-300 bg-amber-50 shadow-sm dark:border-amber-500/50 dark:bg-amber-950/30"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-700/50",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {item.label}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                              {item.pagesPerSheet}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                            {item.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {workspaceReady ? (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Sheet settings
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Tune the output sheet size and arrangement.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        Sheet size
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(SHEET_SIZES).map(([id, item]) => {
                          const active = id === sheetSizeId;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setSheetSizeId(id)}
                              className={[
                                "rounded-2xl border px-3 py-2.5 text-left transition",
                                active
                                  ? "border-amber-300 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-950/30"
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-700/50",
                              ].join(" ")}
                            >
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {item.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        Orientation
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "portrait", label: "Portrait" },
                          { id: "landscape", label: "Landscape" },
                        ].map((item) => {
                          const active = item.id === orientation;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setOrientation(item.id)}
                              className={[
                                "rounded-2xl border px-4 py-3 text-left transition",
                                active
                                  ? "border-amber-300 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-950/30"
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-700/50",
                              ].join(" ")}
                            >
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {item.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-800/30">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Margin
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {margin} pt
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="1"
                        value={margin}
                        onChange={(event) =>
                          setMargin(Number(event.target.value))
                        }
                        className="mt-3 w-full accent-amber-500 dark:accent-amber-400"
                      />
                    </label>

                    <label className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-800/30">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Spacing
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {gap} pt
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        step="1"
                        value={gap}
                        onChange={(event) => setGap(Number(event.target.value))}
                        className="mt-3 w-full accent-amber-500 dark:accent-amber-400"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700/50 dark:bg-slate-800/30">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Show borders
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Draw outlines around each cell.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBorders((current) => !current)}
                      className={[
                        "relative h-7 w-12 rounded-full transition",
                        showBorders
                          ? "bg-amber-500"
                          : "bg-slate-300 dark:bg-slate-600",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
                          showBorders ? "left-6" : "left-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                </div>
              ) : null}

              {workspaceReady ? (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-950 p-5 text-white shadow-lg dark:bg-slate-900">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold">
                        Ready to build
                      </h3>
                      <p className="mt-1 text-sm text-slate-300">
                        Combine the uploaded PDF into a compact N-up sheet
                        layout.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCombine}
                      disabled={!pdfFile || isProcessing}
                      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
                    >
                      {isProcessing ? "Building..." : "Create N-Up PDF"}
                    </button>
                  </div>

                  {resultNote ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-200">
                      {resultNote}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-950 p-5 text-white shadow-lg dark:bg-slate-900">
                  <h3 className="text-base font-semibold">Ready to build</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Upload a PDF first, then the preview and controls will
                    unlock.
                  </p>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-800/50">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Output summary
                </h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/30">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Input pages
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {pageCount || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/30">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Pages per sheet
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {pagesPerSheetText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/30">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Output sheets
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {outputSheets || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/30">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Sheet size
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {sheet.label}
                    </span>
                  </div>
                </div>

                {workspaceReady ? (
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/30">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Rules
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      <li>
                        - Pages are placed in the order they appear in the
                        source PDF.
                      </li>
                      <li>
                        - Each sheet uses the selected page count, size, and
                        orientation.
                      </li>
                      <li>
                        - Margin controls the outer whitespace around the grid.
                      </li>
                      <li>- Spacing controls the gap between cells.</li>
                      <li>
                        - Borders help separate pages when the grid is dense.
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/30">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      What you will see
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      <li>- A live preview of the first output sheet.</li>
                      <li>- The full layout and sheet settings.</li>
                      <li>- The combine button and download panel.</li>
                    </ul>
                  </div>
                )}

                {downloadUrl ? (
                  <div className="mt-5 space-y-3">
                    <a
                      href={downloadUrl}
                      download={downloadName}
                      className="flex w-full items-center justify-center rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600"
                    >
                      Download PDF
                    </a>
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      The generated PDF stays local in your browser until you
                      refresh or clear the tool.
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm dark:border-slate-700/50 dark:from-slate-800/50 dark:to-slate-800/30">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Good to know
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  <li>
                    - N-up puts multiple pages on one sheet for printing or
                    review.
                  </li>
                  <li>
                    - Landscape works best for 2-up, 6-up, 8-up, and 12-up
                    layouts.
                  </li>
                  <li>
                    - Borders can help separate pages visually when the grid is
                    dense.
                  </li>
                  <li>- Everything happens locally in your browser.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={clearAll}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700/50"
              >
                Clear All
              </button>
            </aside>
          </div>
        </div>
      </section>
    </ToolPageShell>
  );
}
