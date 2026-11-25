"use client";

import { useRef, useState } from "react";
import { Download, FileSearch, LoaderCircle, ShieldCheck, UploadCloud, X } from "lucide-react";
import ToolPageShell from "../ToolPageShell";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_PAGES = 30;
const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

export default function PdfOcrExtractor() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const cancelledRef = useRef(false);
  const workerRef = useRef(null);

  function selectFile(nextFile) {
    setError("");
    setText("");
    setProgress(0);
    if (!nextFile) return;
    if (nextFile.type !== "application/pdf" && !/\.pdf$/i.test(nextFile.name)) {
      setError("Choose a PDF file.");
      return;
    }
    if (nextFile.size > MAX_FILE_BYTES) {
      setError("This file is larger than 25 MB. Try a smaller PDF.");
      return;
    }
    setFile(nextFile);
  }

  async function extractText() {
    if (!file || processing) return;
    cancelledRef.current = false;
    setProcessing(true);
    setProgress(0);
    setError("");
    setText("");
    setStatus("Opening PDF…");

    let pdf;
    let worker;
    let currentPage = 1;
    try {
      const pdfModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const pdfjs = pdfModule.default ?? pdfModule;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const bytes = new Uint8Array(await file.arrayBuffer());
      const loadingTask = pdfjs.getDocument({ data: bytes, useWorkerFetch: false });
      pdf = await loadingTask.promise;
      if (pdf.numPages > MAX_PAGES) {
        throw new Error(`This file has ${pdf.numPages} pages. The limit is ${MAX_PAGES} pages per run.`);
      }

      const output = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        currentPage = pageNumber;
        if (cancelledRef.current) throw new Error("OCR cancelled.");
        setStatus(`Reading page ${pageNumber} of ${pdf.numPages}…`);
        setProgress(Math.round(((pageNumber - 1) / pdf.numPages) * 100));
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const nativeText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .filter(Boolean)
          .join(" ")
          .trim();

        let pageText = nativeText;
        if (!nativeText) {
          if (!worker) {
            const { createWorker } = await import("tesseract.js");
            worker = await createWorker("eng", 1, {
              logger: (message) => {
                if (cancelledRef.current || message.status !== "recognizing text") return;
                const pageOffset = Math.max(0, Number(message.progress) || 0);
                setStatus(`Recognizing page ${currentPage} of ${pdf.numPages}…`);
                setProgress(Math.min(99, Math.round(((currentPage - 1 + pageOffset) / pdf.numPages) * 100)));
              },
            });
            workerRef.current = worker;
          }
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) throw new Error(`Could not render PDF page ${pageNumber}.`);
          await page.render({ canvasContext: context, viewport }).promise;
          const recognized = await worker.recognize(canvas);
          pageText = recognized.data.text.trim();
          canvas.width = 0;
          canvas.height = 0;
        }

        output.push(`--- Page ${pageNumber} ---\n${pageText || "(No text detected)"}`);
        page.cleanup();
        setProgress(Math.round((pageNumber / pdf.numPages) * 100));
      }

      setText(output.join("\n\n"));
      setStatus("Extraction complete.");
    } catch (processingError) {
      if (!cancelledRef.current) {
        setError(processingError.message || "Could not process this PDF. Try another file.");
        setStatus("");
      }
    } finally {
      workerRef.current = null;
      if (worker) await worker.terminate().catch(() => {});
      await pdf?.destroy().catch(() => {});
      if (cancelledRef.current) setStatus("Extraction cancelled.");
      setProcessing(false);
    }
  }

  async function cancel() {
    cancelledRef.current = true;
    setStatus("Cancelling OCR…");
    await workerRef.current?.terminate().catch(() => {});
    workerRef.current = null;
  }

  function downloadText() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${file?.name.replace(/\.pdf$/i, "") || "pdf-text"}.txt`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <ToolPageShell className="px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-7">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"><FileSearch size={14} /> Document utility</div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">PDF OCR &amp; Text Extractor</h1>
          <p className="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400 md:text-base">Extract selectable text directly and run English OCR on scanned PDF pages, then download the combined text as a TXT file.</p>
        </header>

        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-7">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 px-5 py-10 text-center transition hover:border-indigo-400 dark:border-gray-700 dark:hover:border-indigo-500">
            <UploadCloud size={28} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Choose or drop a PDF</span>
            <span className="text-xs text-gray-500">Up to 25 MB and {MAX_PAGES} pages per run</span>
            <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={processing} onChange={(event) => selectFile(event.target.files?.[0])} />
          </label>
          {file && <p className="truncate text-sm text-gray-700 dark:text-gray-300">Selected: <strong>{file.name}</strong> · {(file.size / 1024 / 1024).toFixed(2)} MB</p>}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={extractText} disabled={!file || processing} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{processing ? <LoaderCircle size={16} className="animate-spin" /> : <FileSearch size={16} />}{processing ? "Processing…" : "Extract text"}</button>
            {processing && <button type="button" onClick={cancel} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"><X size={15} /> Cancel</button>}
            {text && <button type="button" onClick={downloadText} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"><Download size={15} /> Download TXT</button>}
          </div>

          {processing && <div aria-live="polite" className="space-y-2"><div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} /></div><p className="text-xs text-gray-600 dark:text-gray-400">{status} {progress}%</p></div>}
          {status && !processing && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{status}</p>}
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

          <p className="flex items-start gap-2 text-xs leading-5 text-gray-500 dark:text-gray-400"><ShieldCheck size={15} className="mt-0.5 shrink-0" />PDF bytes are processed in your browser and are not uploaded to ToolsTrek. OCR needs the Tesseract engine and English language data, which are loaded on demand. Scanned pages are rasterized in browser memory.</p>
        </section>

        {text && <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><h2 className="text-lg font-bold text-gray-900 dark:text-white">Extracted text</h2><textarea readOnly value={text} className={`${inputClass} min-h-80 resize-y font-mono text-xs leading-5`} /></section>}
      </div>
    </ToolPageShell>
  );
}
