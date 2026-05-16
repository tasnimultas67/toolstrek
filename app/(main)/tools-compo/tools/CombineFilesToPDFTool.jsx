"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolPageShell from "../ToolPageShell";

const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
];
const MAX_TOTAL_BYTES = 750 * 1024 * 1024;

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

function getOutputName(files) {
  const firstPdf = files.find((item) => item.kind === "pdf");
  const base = firstPdf?.file?.name?.replace(/\.pdf$/i, "") || "combined-files";
  return `${base}-combined.pdf`;
}

function getFileKind(file) {
  const name = file.name.toLowerCase();
  const type = file.type || "";

  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (type === "image/svg+xml" || name.endsWith(".svg")) return "svg";
  if (type.startsWith("image/")) return "image";
  if (SUPPORTED_EXTENSIONS.some((extension) => name.endsWith(extension)))
    return "image";
  return "unsupported";
}

function createQueueItem(file) {
  return {
    id: `${file.name}-${file.lastModified}-${file.size}`,
    file,
    kind: getFileKind(file),
  };
}

function clampIndex(index, length) {
  return Math.max(0, Math.min(index, length - 1));
}

function moveItem(items, fromIndex, toIndex) {
  if (fromIndex === toIndex) return items;
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load an image."));
    img.src = src;
  });
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export the image."));
      },
      mimeType,
      quality,
    );
  });
}

async function loadFileImageInfo(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageElement(url);
    return {
      image,
      width: image.naturalWidth || image.width || 1,
      height: image.naturalHeight || image.height || 1,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function rasterizeToPngBytes(file, image) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, image.naturalWidth || image.width || 1);
  canvas.height = Math.max(1, image.naturalHeight || image.height || 1);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser does not support canvas rendering.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await canvasToBlob(canvas, "image/png");
  return new Uint8Array(await blob.arrayBuffer());
}

async function fileToPdfImage(pdfDoc, file) {
  const kind = getFileKind(file);

  if (kind === "unsupported") {
    throw new Error(`Unsupported file type: ${file.name}`);
  }

  if (kind === "pdf") {
    return null;
  }

  const { image, width, height } = await loadFileImageInfo(file);

  if (kind === "svg") {
    const pngBytes = await rasterizeToPngBytes(file, image);
    const png = await pdfDoc.embedPng(pngBytes);
    return {
      width,
      height,
      embedded: png,
    };
  }

  const lowerName = file.name.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    file.type === "image/jpeg"
  ) {
    const jpg = await pdfDoc.embedJpg(bytes);
    return {
      width,
      height,
      embedded: jpg,
    };
  }

  if (lowerName.endsWith(".png") || file.type === "image/png") {
    const png = await pdfDoc.embedPng(bytes);
    return {
      width,
      height,
      embedded: png,
    };
  }

  const rasterBytes = await rasterizeToPngBytes(file, image);
  const png = await pdfDoc.embedPng(rasterBytes);
  return {
    width,
    height,
    embedded: png,
  };
}

async function combineQueueToPdf(queue, onProgress) {
  const outputDoc = await PDFDocument.create();
  const total = queue.length || 1;

  for (let index = 0; index < queue.length; index += 1) {
    const item = queue[index];

    if (item.kind === "pdf") {
      const sourceDoc = await PDFDocument.load(await item.file.arrayBuffer(), {
        ignoreEncryption: false,
        updateMetadata: true,
      });
      const pages = await outputDoc.copyPages(
        sourceDoc,
        sourceDoc.getPageIndices(),
      );
      pages.forEach((page) => outputDoc.addPage(page));
    } else {
      const imageResult = await fileToPdfImage(outputDoc, item.file);
      const page = outputDoc.addPage([imageResult.width, imageResult.height]);
      page.drawImage(imageResult.embedded, {
        x: 0,
        y: 0,
        width: imageResult.width,
        height: imageResult.height,
      });
    }

    onProgress?.((index + 1) / total);
  }

  return outputDoc.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
  });
}

export default function CombineFilesToPDFTool() {
  const inputRef = useRef(null);
  const downloadUrlRef = useRef("");

  const [queue, setQueue] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [status, setStatus] = useState(
    "Add PDFs, images, or SVG files to build one PDF.",
  );
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultNote, setResultNote] = useState("");
  const [outputBytes, setOutputBytes] = useState(0);

  const totalBytes = useMemo(
    () => queue.reduce((sum, item) => sum + item.file.size, 0),
    [queue],
  );
  const supportedCount = queue.filter(
    (item) => item.kind !== "unsupported",
  ).length;
  const pdfCount = queue.filter((item) => item.kind === "pdf").length;

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

  function addFiles(fileList) {
    const nextFiles = Array.from(fileList || []).filter(Boolean);
    if (!nextFiles.length) return;

    const supportedFiles = nextFiles.filter(
      (file) => getFileKind(file) !== "unsupported",
    );
    if (!supportedFiles.length) {
      setError("Please add PDF, image, or SVG files.");
      return;
    }

    const merged = [...queue];
    const seen = new Set(merged.map((item) => item.id));
    let addedCount = 0;

    for (const file of supportedFiles) {
      const item = createQueueItem(file);
      if (seen.has(item.id)) continue;
      merged.push(item);
      seen.add(item.id);
      addedCount += 1;
    }

    setQueue(merged);
    setError("");
    setResultNote("");
    setDownloadUrl("");
    setOutputBytes(0);
    setProgress(null);

    if (!addedCount) {
      setStatus("No new files were added.");
      return;
    }

    setStatus(
      addedCount === 1
        ? "Added 1 file to the queue."
        : `Added ${addedCount} files to the queue.`,
    );
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    addFiles(event.dataTransfer.files);
  }

  function removeItem(id) {
    setQueue((current) => current.filter((item) => item.id !== id));
  }

  function shiftItem(id, delta) {
    setQueue((current) => {
      const fromIndex = current.findIndex((item) => item.id === id);
      if (fromIndex < 0) return current;
      const toIndex = clampIndex(fromIndex + delta, current.length);
      return moveItem(current, fromIndex, toIndex);
    });
  }

  function clearAll() {
    setQueue([]);
    setDownloadUrl("");
    setDownloadName("");
    setStatus("Add PDFs, images, or SVG files to build one PDF.");
    setError("");
    setProgress(null);
    setResultNote("");
    setOutputBytes(0);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleCombine() {
    if (!queue.length) {
      setError("Add at least one file first.");
      return;
    }

    if (totalBytes > MAX_TOTAL_BYTES) {
      setError(
        "The combined input size is too large. Please keep it under 750MB.",
      );
      return;
    }

    const unsupportedItem = queue.find((item) => item.kind === "unsupported");
    if (unsupportedItem) {
      setError(`Unsupported file type: ${unsupportedItem.file.name}`);
      return;
    }

    setIsProcessing(true);
    setError("");
    setResultNote("");
    setOutputBytes(0);
    setProgress(0);
    setStatus("Building one PDF from your selected files...");

    try {
      const pdfBytes = await combineQueueToPdf(queue, (value) => {
        setProgress(Math.max(0, Math.min(1, value)));
      });

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const name = getOutputName(queue);

      setDownloadUrl(url);
      setDownloadName(name);
      setOutputBytes(pdfBytes.length);
      setProgress(1);
      setStatus("Combination complete.");
      setResultNote(
        `${queue.length} file${queue.length === 1 ? "" : "s"} combined into a single PDF.`,
      );
    } catch (combineError) {
      setError(
        combineError?.message ||
          "Something went wrong while combining the files.",
      );
      setStatus("Combination failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  const downloadLabel = "Download PDF";

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 px-3 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-6 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full md:w-11/12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Merge &amp; Convert
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Combine Files to PDF
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Turn PDFs, images, and SVG files into one clean PDF. PDFs keep
              their pages, and image files become visible pages in the final
              document.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-lg font-semibold text-slate-900">100%</div>
              <div className="text-xs text-slate-500">Private</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-lg font-semibold text-slate-900">PDF</div>
              <div className="text-xs text-slate-500">Output</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-lg font-semibold text-slate-900">Drag</div>
              <div className="text-xs text-slate-500">Reorder</div>
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
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-sm font-semibold text-amber-800">
                  FILE
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add files
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Drag and drop PDFs, images, or SVG files here, or click to
                  browse from your device.
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  pdf, png, jpg, jpeg, webp, gif, svg
                </p>
              </div>

              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,application/pdf,image/*,image/svg+xml"
                className="hidden"
                onChange={(event) => addFiles(event.target.files)}
              />

              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Files: {queue.length}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    PDFs: {pdfCount}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Total: {formatBytes(totalBytes)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  {isProcessing ? (
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                      style={{ width: `${Math.round((progress ?? 0) * 100)}%` }}
                    />
                  ) : (
                    <div className="h-full w-0 rounded-full bg-amber-500" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{status}</span>
                  <span>
                    {isProcessing
                      ? `${Math.round((progress ?? 0) * 100)}%`
                      : "-"}
                  </span>
                </div>
              </div>

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
                    Selected files
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Reorder files before combining them into the final PDF.
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {queue.length} items
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {queue.length ? (
                  queue.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {item.file.name}
                            </span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                              {item.kind.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {formatBytes(item.file.size)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => shiftItem(item.id, -1)}
                            disabled={index === 0}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() => shiftItem(item.id, 1)}
                            disabled={index === queue.length - 1}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No files selected yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Ready to combine</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Create one PDF from everything in the queue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCombine}
                  disabled={!queue.length || isProcessing}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessing ? "Combining..." : "Combine to PDF"}
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
                  <span className="text-sm text-slate-600">Input size</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {totalBytes ? formatBytes(totalBytes) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Files</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {supportedCount || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Output size</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {outputBytes ? formatBytes(outputBytes) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {queue.length ? "Ready" : "Empty"}
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
                    The combined PDF is saved locally in your browser until you
                    refresh or clear the tool.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Good to know
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>- PDFs keep their existing pages.</li>
                <li>- Images and SVG files become visible pages in the PDF.</li>
                <li>- You can reorder files before combining them.</li>
                <li>- Everything runs in the browser for privacy.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={clearAll}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
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
