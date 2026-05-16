"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolPageShell from "../ToolPageShell";

const PRESETS = {
  light: {
    id: "light",
    label: "Light",
    badge: "Lossless",
    description: "Keeps text selectable and only re-saves the PDF structure.",
    mode: "lossless",
    renderScale: 1,
    jpegQuality: 0.88,
    maxCanvasSide: 2200,
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    badge: "Recommended",
    description:
      "Best everyday choice for a smaller file and solid readability.",
    mode: "raster",
    renderScale: 0.95,
    jpegQuality: 0.72,
    maxCanvasSide: 1800,
  },
  strong: {
    id: "strong",
    label: "Strong",
    badge: "Smallest",
    description: "Best for scanned or image-heavy PDFs when size matters most.",
    mode: "raster",
    renderScale: 0.75,
    jpegQuality: 0.58,
    maxCanvasSide: 1600,
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

function formatPercent(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

function isPdfFile(file) {
  return file && (file.type === "application/pdf" || /\.pdf$/i.test(file.name));
}

function getOutputName(fileName) {
  const base = fileName?.replace(/\.pdf$/i, "") || "compressed-pdf";
  return `${base}-compressed.pdf`;
}

function clonePdfBytes(bytes) {
  if (!bytes) return bytes;
  return bytes.slice ? bytes.slice() : new Uint8Array(bytes);
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

async function canvasToJpegBytes(canvas, quality) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to encode the page as an image."));
        }
      },
      "image/jpeg",
      quality,
    );
  });

  return new Uint8Array(await blob.arrayBuffer());
}

async function compressPdfBytes(sourceBytes, presetId, onProgress) {
  const preset = PRESETS[presetId] || PRESETS.balanced;

  if (preset.mode === "lossless") {
    const pdf = await PDFDocument.load(sourceBytes);
    const output = await pdf.save({
      useObjectStreams: true,
      updateFieldAppearances: false,
    });

    onProgress?.(1);
    return {
      bytes: output,
      note: "Lossless optimization finished. The PDF was re-saved with a compact object structure.",
    };
  }

  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: clonePdfBytes(sourceBytes),
    useWorkerFetch: false,
  });

  const sourcePdf = await loadingTask.promise;
  const targetPdf = await PDFDocument.create();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Your browser does not support canvas rendering.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  try {
    const totalPages = sourcePdf.numPages;

    for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
      const page = await sourcePdf.getPage(pageIndex);
      const baseViewport = page.getViewport({ scale: 1 });
      const maxSide = Math.max(baseViewport.width, baseViewport.height) || 1;
      const scaleCap = preset.maxCanvasSide / maxSide;
      const renderScale = Math.max(
        0.35,
        Math.min(preset.renderScale, scaleCap),
      );
      const viewport = page.getViewport({ scale: renderScale });

      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const jpegBytes = await canvasToJpegBytes(canvas, preset.jpegQuality);
      const image = await targetPdf.embedJpg(jpegBytes);

      const outputPage = targetPdf.addPage([
        baseViewport.width,
        baseViewport.height,
      ]);
      outputPage.drawImage(image, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height,
      });

      page.cleanup?.();
      onProgress?.(pageIndex / totalPages);
    }
  } finally {
    try {
      sourcePdf?.destroy?.();
    } catch {
      // Ignore cleanup issues.
    }
  }

  const output = await targetPdf.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
  });

  return {
    bytes: output,
    note: "Raster compression finished. This works best for scanned or image-heavy PDFs and may reduce text selectability.",
  };
}

async function buildZipBlob(items) {
  const mod = await import("jszip");
  const JSZip = mod.default ?? mod;
  const zip = new JSZip();

  items.forEach((item) => {
    zip.file(item.name, item.bytes);
  });

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });
}

function createFileEntry(file, bytes, pages) {
  return {
    file,
    bytes,
    pages,
    originalBytes: file.size,
    outputName: getOutputName(file.name),
  };
}

export default function CompressPDFTool() {
  const inputRef = useRef(null);
  const downloadUrlRef = useRef("");
  const [selectedPreset, setSelectedPreset] = useState("balanced");
  const [entries, setEntries] = useState([]);
  const [results, setResults] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [status, setStatus] = useState("Drop one or more PDFs to get started.");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultNote, setResultNote] = useState("");

  const preset = PRESETS[selectedPreset];
  const fileCount = entries.length;
  const hasBatch = fileCount > 1;

  const totalOriginalBytes = useMemo(
    () => entries.reduce((sum, item) => sum + (item.originalBytes || 0), 0),
    [entries],
  );

  const totalCompressedBytes = useMemo(
    () => results.reduce((sum, item) => sum + (item.compressedBytes || 0), 0),
    [results],
  );

  const savings = useMemo(() => {
    if (!totalOriginalBytes || !totalCompressedBytes) return 0;
    return Math.max(
      0,
      ((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 100,
    );
  }, [totalOriginalBytes, totalCompressedBytes]);

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

  async function inspectFiles(files) {
    if (!files.length) return;

    setIsInspecting(true);
    setStatus(`Analyzing ${files.length} PDF${files.length > 1 ? "s" : ""}...`);

    try {
      const pdfjs = await loadPdfJs();
      const nextEntries = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setStatus(`Analyzing ${index + 1} of ${files.length}: ${file.name}`);

        const bytes = new Uint8Array(await file.arrayBuffer());
        let pages = null;

        try {
          const loadingTask = pdfjs.getDocument({
            data: clonePdfBytes(bytes),
            useWorkerFetch: false,
          });
          const pdf = await loadingTask.promise;
          pages = pdf.numPages;
          pdf.destroy?.();
        } catch {
          pages = null;
        }

        nextEntries.push(createFileEntry(file, bytes, pages));
      }

      setEntries(nextEntries);
      setResults([]);
      setDownloadUrl("");
      setDownloadName("");
      setResultNote("");
      setProgress(null);
      setStatus(
        files.length === 1
          ? `Loaded ${files[0].name}.`
          : `Loaded ${files.length} PDFs.`,
      );
    } catch (inspectError) {
      setError(
        inspectError?.message || "Unable to read one or more PDF files.",
      );
      setEntries([]);
      setStatus("Drop one or more PDFs to get started.");
    } finally {
      setIsInspecting(false);
    }
  }

  async function handleFiles(nextFiles) {
    setError("");

    const files = Array.from(nextFiles || []).filter(isPdfFile);
    if (!files.length) {
      setError("Please choose one or more PDF files.");
      return;
    }

    await inspectFiles(files);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    handleFiles(event.dataTransfer.files);
  }

  async function runCompression() {
    if (!entries.length) {
      setError("Choose at least one PDF before starting compression.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setResultNote("");
    setProgress(0);
    setStatus(
      hasBatch
        ? `Compressing ${entries.length} PDFs...`
        : `Compressing ${entries[0].file.name}...`,
    );

    const compressedItems = [];
    const nextResults = [];

    try {
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        setStatus(
          `Compressing ${index + 1} of ${entries.length}: ${entry.file.name}`,
        );

        const result = await compressPdfBytes(
          entry.bytes,
          selectedPreset,
          (itemProgress) => {
            const overall = (index + itemProgress) / entries.length;
            setProgress(Math.max(0, Math.min(1, overall)));
          },
        );

        compressedItems.push({
          name: entry.outputName,
          bytes: result.bytes,
        });

        nextResults.push({
          name: entry.file.name,
          outputName: entry.outputName,
          originalBytes: entry.originalBytes,
          compressedBytes: result.bytes.length,
          pages: entry.pages,
          note: result.note,
        });
      }

      let blob;
      let name;

      if (entries.length === 1) {
        blob = new Blob([compressedItems[0].bytes], {
          type: "application/pdf",
        });
        name = compressedItems[0].name;
      } else {
        blob = await buildZipBlob(compressedItems);
        name = "compressed-pdfs.zip";
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(name);
      setResults(nextResults);
      setResultNote(
        entries.length === 1
          ? nextResults[0]?.note || "Compression complete."
          : `Batch compression finished. Your ${entries.length} PDFs are packaged into one ZIP file.`,
      );
      setProgress(1);
      setStatus("Compression complete.");
    } catch (runError) {
      setError(
        runError?.message ||
          "Something went wrong while compressing the PDF files.",
      );
      setStatus("Compression failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  function resetTool() {
    setEntries([]);
    setResults([]);
    setDownloadUrl("");
    setDownloadName("");
    setStatus("Drop one or more PDFs to get started.");
    setError("");
    setProgress(null);
    setResultNote("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const downloadLabel = hasBatch ? "Download ZIP" : "Download PDF";
  const summaryOriginal = totalOriginalBytes;
  const summaryCompressed = totalCompressedBytes;

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 px-3 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-6 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full md:w-11/12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Optimize &amp; Repair
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Compress PDF
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Reduce PDF size right inside the browser. Files stay local, the
              interface stays simple, and batch jobs can be downloaded as a
              single ZIP file.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-lg font-semibold text-slate-900">100%</div>
              <div className="text-xs text-slate-500">Private</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-lg font-semibold text-slate-900">3</div>
              <div className="text-xs text-slate-500">Presets</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-lg font-semibold text-slate-900">Batch</div>
              <div className="text-xs text-slate-500">ZIP ready</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-6">
            <div
              className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-10 text-center transition hover:border-amber-300 hover:bg-amber-50/30"
                onClick={openPicker}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openPicker();
                  }
                }}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
                  PDF
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Upload PDF files
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Drag and drop one file or many files here, or click to browse
                  from your device.
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  application/pdf
                </p>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />

              {fileCount ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {fileCount === 1
                          ? entries[0].file.name
                          : `${fileCount} PDF files selected`}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatBytes(summaryOriginal)}
                        {entries.some((item) => item.pages)
                          ? " | page counts loaded"
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetTool}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>{status}</span>
                      <span>
                        {isProcessing
                          ? `${Math.round((progress ?? 0) * 100)}%`
                          : isInspecting
                            ? "Loading..."
                            : "-"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      {isProcessing ? (
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                          style={{
                            width: `${Math.round((progress ?? 0) * 100)}%`,
                          }}
                        />
                      ) : isInspecting ? (
                        <div className="h-full w-1/3 animate-pulse rounded-full bg-amber-400/70" />
                      ) : (
                        <div className="h-full w-0 rounded-full bg-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Compression level
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Pick the balance you want between file size and visual
                    fidelity.
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {preset.badge}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {Object.values(PRESETS).map((item) => {
                  const active = item.id === selectedPreset;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPreset(item.id)}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        active
                          ? "border-amber-300 bg-amber-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {item.label}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                          {item.badge}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {fileCount ? (
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
                <h3 className="text-base font-semibold text-slate-900">
                  Selected files
                </h3>
                <div className="mt-4 space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={`${entry.file.name}-${entry.file.lastModified}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {entry.file.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {formatBytes(entry.originalBytes)}
                            {entry.pages
                              ? ` | ${entry.pages} pages`
                              : " | page count loading"}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          Ready
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Ready to compress</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Compress a single file or many files, then download the
                    result in one step.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={runCompression}
                  disabled={!entries.length || isInspecting || isProcessing}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessing
                    ? "Compressing..."
                    : hasBatch
                      ? "Compress PDFs to ZIP"
                      : "Compress PDF"}
                </button>
              </div>

              {resultNote ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-200">
                  {resultNote}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h3 className="text-base font-semibold text-slate-900">
                Output summary
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Original size</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {summaryOriginal ? formatBytes(summaryOriginal) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">
                    Compressed size
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {summaryCompressed ? formatBytes(summaryCompressed) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Savings</span>
                  <span className="text-sm font-semibold text-emerald-700">
                    {summaryCompressed ? formatPercent(savings) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Files</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {fileCount || "-"}
                  </span>
                </div>
              </div>

              {downloadUrl ? (
                <div className="mt-5 space-y-3">
                  <a
                    href={downloadUrl}
                    download={downloadName}
                    className="flex w-full items-center justify-center rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
                  >
                    {downloadLabel}
                  </a>
                  <p className="text-xs leading-5 text-slate-500">
                    The file is saved locally in your browser. Refreshing the
                    page will clear this link.
                  </p>
                </div>
              ) : null}
            </div>

            {results.length ? (
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  Compressed files
                </h3>
                <div className="mt-4 space-y-3">
                  {results.map((item) => (
                    <div
                      key={`${item.name}-${item.outputName}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {formatBytes(item.originalBytes)} {" -> "}{" "}
                        {formatBytes(item.compressedBytes)}
                        {item.pages ? ` | ${item.pages} pages` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
        </div>
      </section>
    </ToolPageShell>
  );
}
