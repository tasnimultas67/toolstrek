"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

const MAX_ATTACHMENTS = 50;
const MAX_TOTAL_BYTES = 500 * 1024 * 1024;

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
  const base = fileName?.replace(/\.pdf$/i, "") || "document";
  return `${base}-with-attachments.pdf`;
}

function guessMimeType(file) {
  if (file?.type) return file.type;
  const ext = file?.name?.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "txt":
      return "text/plain";
    case "csv":
      return "text/csv";
    case "json":
      return "application/json";
    case "xml":
      return "application/xml";
    default:
      return "application/octet-stream";
  }
}

function makeAttachmentOptions(file) {
  const lastModified = file?.lastModified
    ? new Date(file.lastModified)
    : new Date();

  return {
    mimeType: guessMimeType(file),
    description: `Attached file: ${file.name}`,
    creationDate: lastModified,
    modificationDate: lastModified,
  };
}

async function readFileBytes(file) {
  return new Uint8Array(await file.arrayBuffer());
}

async function addAttachmentsToPdf(pdfFile, attachmentFiles) {
  const pdfBytes = await readFileBytes(pdfFile);
  const pdfDoc = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: false,
    updateMetadata: true,
  });

  for (const attachment of attachmentFiles) {
    const bytes = await readFileBytes(attachment);
    await pdfDoc.attach(
      bytes,
      attachment.name,
      makeAttachmentOptions(attachment),
    );
  }

  const output = await pdfDoc.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
  });

  return output;
}

function createAttachmentItem(file) {
  return {
    id: `${file.name}-${file.lastModified}-${file.size}`,
    file,
  };
}

export default function AddAttachmentsTool() {
  const pdfInputRef = useRef(null);
  const attachmentsInputRef = useRef(null);
  const downloadUrlRef = useRef("");

  const [pdfFile, setPdfFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [outputName, setOutputName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [status, setStatus] = useState(
    "Select a PDF and one or more attachments.",
  );
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultNote, setResultNote] = useState("");

  const totalAttachmentBytes = useMemo(
    () => attachments.reduce((sum, item) => sum + item.file.size, 0),
    [attachments],
  );

  const combinedBytes = useMemo(
    () =>
      pdfFile ? pdfFile.size + totalAttachmentBytes : totalAttachmentBytes,
    [pdfFile, totalAttachmentBytes],
  );

  const hasAttachments = attachments.length > 0;
  const attachmentCount = attachments.length;

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

  function openPdfPicker() {
    pdfInputRef.current?.click();
  }

  function openAttachmentsPicker() {
    attachmentsInputRef.current?.click();
  }

  function setPdf(nextFile) {
    if (!nextFile) return;

    if (nextFile.type !== "application/pdf" && !/\.pdf$/i.test(nextFile.name)) {
      setError("Please choose a valid PDF file.");
      return;
    }

    setError("");
    setResultNote("");
    setDownloadUrl("");
    setProgress(null);
    setPdfFile(nextFile);
    setOutputName(getOutputName(nextFile.name));
    setStatus(`Loaded ${nextFile.name}.`);
  }

  function setAttachmentFiles(fileList) {
    const nextFiles = Array.from(fileList || []).filter(Boolean);

    if (!nextFiles.length) return;

    setError("");
    setResultNote("");
    setDownloadUrl("");
    setProgress(null);

    let addedCount = 0;
    let hitLimit = false;

    setAttachments((current) => {
      const merged = [...current];
      const seen = new Set(merged.map((item) => item.id));

      for (const file of nextFiles) {
        if (merged.length >= MAX_ATTACHMENTS) {
          hitLimit = true;
          break;
        }

        const item = createAttachmentItem(file);
        if (seen.has(item.id)) continue;

        merged.push(item);
        seen.add(item.id);
        addedCount += 1;
      }

      if (merged.length >= MAX_ATTACHMENTS && nextFiles.length > addedCount) {
        hitLimit = true;
      }

      return merged.slice(0, MAX_ATTACHMENTS);
    });

    if (hitLimit) {
      setError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
    }

    if (addedCount === 0) {
      setStatus("No new attachments were added.");
      return;
    }

    setStatus(
      addedCount === 1
        ? "Added 1 attachment."
        : `Added ${addedCount} attachments.`,
    );
  }

  function removeAttachment(id) {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }

  function clearAll() {
    setPdfFile(null);
    setAttachments([]);
    setOutputName("");
    setDownloadUrl("");
    setError("");
    setProgress(null);
    setStatus("Select a PDF and one or more attachments.");
    setResultNote("");

    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (attachmentsInputRef.current) attachmentsInputRef.current.value = "";
  }

  async function handleProcess() {
    if (!pdfFile) {
      setError("Choose a PDF file first.");
      return;
    }

    if (!attachments.length) {
      setError("Add at least one file to attach.");
      return;
    }

    if (attachments.length > MAX_ATTACHMENTS) {
      setError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
      return;
    }

    if (combinedBytes > MAX_TOTAL_BYTES) {
      setError(
        "The total file size including attachments must stay under 500MB.",
      );
      return;
    }

    setIsProcessing(true);
    setError("");
    setResultNote("");
    setStatus("Embedding attachments into your PDF...");
    setProgress(0);

    try {
      const pdfBytes = await addAttachmentsToPdf(
        pdfFile,
        attachments.map((item) => item.file),
      );
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setProgress(1);
      setStatus("Done. Your PDF is ready.");
      setResultNote(
        `${attachments.length} file${attachments.length === 1 ? "" : "s"} attached successfully.`,
      );
    } catch (processError) {
      setError(
        processError?.message ||
          "Something went wrong while adding attachments.",
      );
      setStatus("Attachment processing failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  const attachButtonLabel = isProcessing
    ? "Adding Attachments..."
    : attachmentCount > 1
      ? "Add Attachments"
      : "Add Attachment";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-amber-50/60 px-2 pb-10 pt-26 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-6 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full md:w-11/12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Organize &amp; Package
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Add Attachments
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Embed files directly inside a PDF so recipients can keep related
              documents together in one package. Processing happens locally in
              the browser.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-lg font-semibold text-slate-900">100%</div>
              <div className="text-xs text-slate-500">Private</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-lg font-semibold text-slate-900">50</div>
              <div className="text-xs text-slate-500">Files max</div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-lg font-semibold text-slate-900">500MB</div>
              <div className="text-xs text-slate-500">Total limit</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={openPdfPicker}
                  className="rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-8 text-left transition hover:border-amber-300 hover:bg-amber-50/30"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-sm font-semibold text-amber-800">
                    PDF
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Select PDF File
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Upload the PDF you want to add attachments to.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={openAttachmentsPicker}
                  className="rounded-3xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-8 text-left transition hover:border-amber-300 hover:bg-amber-50/30"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-800">
                    +F
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Select Files to Attach
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Pick any file types you want to embed inside the PDF.
                  </p>
                </button>
              </div>

              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => setPdf(event.target.files?.[0] || null)}
              />

              <input
                ref={attachmentsInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => setAttachmentFiles(event.target.files)}
              />

              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    PDF: {pdfFile ? pdfFile.name : "not selected"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Attachments: {attachmentCount}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Total: {formatBytes(combinedBytes)}
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
                    Attached files
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    You can add documents, images, spreadsheets, source files,
                    or anything else.
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {attachmentCount}/{MAX_ATTACHMENTS}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {attachments.length ? (
                  attachments.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.file.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatBytes(item.file.size)} |{" "}
                          {guessMimeType(item.file)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(item.id)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No attachments selected yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Ready to save</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Embed the selected files into your PDF and download the
                    updated document.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={!pdfFile || !hasAttachments || isProcessing}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {attachButtonLabel}
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
                Summary
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">PDF size</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {pdfFile ? formatBytes(pdfFile.size) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Attachments</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {attachmentCount ? `${attachmentCount} files` : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Total size</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {combinedBytes ? formatBytes(combinedBytes) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Limit</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatBytes(MAX_TOTAL_BYTES)}
                  </span>
                </div>
              </div>

              {downloadUrl ? (
                <div className="mt-5 space-y-3">
                  <a
                    href={downloadUrl}
                    download={outputName}
                    className="flex w-full items-center justify-center rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
                  >
                    Download PDF
                  </a>
                  <p className="text-xs leading-5 text-slate-500">
                    The generated PDF stays in your browser until you refresh or
                    clear the tool.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Good to know
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>- Any file type can be embedded into the PDF.</li>
                <li>
                  - Recipients can usually extract attachments from their PDF
                  reader.
                </li>
                <li>
                  - The reference tool supports up to 50 attachments and a 500MB
                  total size.
                </li>
                <li>
                  - Processing happens locally in the browser for privacy.
                </li>
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
  );
}
