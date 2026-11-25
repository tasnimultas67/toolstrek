"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Download,
  FileText,
  FileUp,
  Gauge,
  Info,
  Layers,
  ListChecks,
  Loader2,
  Lock,
  Maximize2,
  MousePointerClick,
  RotateCcw,
  RotateCw,
  ScanLine,
  ShieldCheck,
  Square,
  Table2,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
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
import { downloadBlob } from "../_shared/toolkit/toolUtils";
import {
  MAX_FILE_MB,
  MAX_PREVIEW_PAGES,
  PDF_ROTATOR_FAQS,
  createRotatedPdf,
  formatBytes,
  normalizeRotation,
  pageOrientation,
  parsePageSelection,
  rotationLabel,
  selectionToString,
} from "./pdfRotatorData";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const TOOL_META = {
  title: "PDF Page Rotator",
  link: "/tools/pdf-page-rotator",
  icon: "RotateCw",
};

const TONE = "sky";

const TABS = [
  { value: "rotate", label: "Rotate pages", icon: RotateCw },
  { value: "pages", label: "Page map", icon: Table2 },
  { value: "learn", label: "Learn", icon: BookOpen },
];

const ANGLE_OPTIONS = [
  { value: -90, label: "90° left", icon: <RotateCcw className="h-4 w-4" /> },
  { value: 90, label: "90° right", icon: <RotateCw className="h-4 w-4" /> },
  { value: 180, label: "180°", icon: <ArrowLeft className="h-4 w-4" /> },
];

const ROTATE_PRESETS = [
  { label: "All", value: "all" },
  { label: "Odd", value: "odd" },
  { label: "Even", value: "even" },
];

function baseName(fileName) {
  return String(fileName || "document").replace(/\.pdf$/i, "");
}

function PageSkeleton() {
  return (
    <div className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800">
      <FileText className="h-7 w-7 text-slate-300 dark:text-slate-600" />
      <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">Rendering…</span>
    </div>
  );
}

function PageThumb({ page, delta, selected, onToggle, onRotate }) {
  const finalRotation = normalizeRotation(page.baseRotation + delta);
  const turned = delta % 180 === 90;
  const orientation = pageOrientation(page.width, page.height, finalRotation);

  return (
    <div
      className={`group rounded-2xl border bg-white p-2.5 transition dark:bg-slate-900 ${
        selected
          ? "border-sky-400 ring-2 ring-sky-200 dark:border-sky-500 dark:ring-sky-900/70"
          : "border-slate-200 hover:border-sky-300 dark:border-slate-800 dark:hover:border-sky-800"
      }`}
      style={{ minWidth: 0 }}
    >
      <button
        type="button"
        onClick={() => onToggle(page.pageNumber)}
        aria-pressed={selected}
        aria-label={`Select page ${page.pageNumber}`}
        className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
      >
        {page.thumbnail ? (
          <img
            src={page.thumbnail}
            alt={`Preview of page ${page.pageNumber}`}
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain transition-transform duration-200"
            style={{
              transform: `rotate(${delta}deg) scale(${turned ? 0.7 : 1})`,
            }}
          />
        ) : (
          <PageSkeleton />
        )}

        <span className="absolute left-1.5 top-1.5 rounded-lg bg-slate-900/80 px-2 py-0.5 text-sm font-bold text-white backdrop-blur-sm">
          {page.pageNumber}
        </span>

        {delta !== 0 && (
          <span className="absolute right-1.5 top-1.5 rounded-lg bg-sky-600/90 px-2 py-0.5 text-sm font-bold text-white backdrop-blur-sm">
            {rotationLabel(delta)}
          </span>
        )}

        <span
          className={`absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-sm font-bold backdrop-blur-sm transition ${
            selected
              ? "bg-sky-600 text-white"
              : "bg-white/85 text-slate-600 opacity-0 group-hover:opacity-100 dark:bg-slate-900/85 dark:text-slate-200"
          }`}
        >
          {selected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
          {selected ? "Selected" : "Select"}
        </span>
      </button>

      <div className="mt-2 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => onRotate([page.pageNumber], -90)}
          aria-label={`Rotate page ${page.pageNumber} left`}
          title="Rotate left"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onRotate([page.pageNumber], 90)}
          aria-label={`Rotate page ${page.pageNumber} right`}
          title="Rotate right"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-black tabular-nums text-slate-900 dark:text-white">
            {rotationLabel(finalRotation)}
          </p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{orientation}</p>
        </div>

        <button
          type="button"
          onClick={() => onRotate([page.pageNumber], -delta)}
          disabled={delta === 0}
          aria-label={`Reset rotation for page ${page.pageNumber}`}
          title="Reset page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
        >
          <Undo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function PDFPageRotator() {
  const { addRecentTool } = useRecentTools();
  const [tab, setTab] = useState("rotate");

  const [fileMeta, setFileMeta] = useState(null);
  const [pages, setPages] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectionInput, setSelectionInput] = useState("");
  const [selectionError, setSelectionError] = useState("");
  const [angle, setAngle] = useState(90);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [thumbSize, setThumbSize] = useState(180);
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState("");
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef(null);
  const pdfDocRef = useRef(null);
  const bytesRef = useRef(null);
  const loadTokenRef = useRef(0);

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  useEffect(() => {
    return () => {
      loadTokenRef.current += 1;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy?.();
        pdfDocRef.current = null;
      }
    };
  }, []);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const totalPages = pages.length;
  const rotatedCount = useMemo(
    () => rotations.filter((value) => normalizeRotation(value) !== 0).length,
    [rotations],
  );
  const selectedPages = useMemo(
    () => [...selected].sort((a, b) => a - b),
    [selected],
  );
  const previewCount = Math.min(totalPages, MAX_PREVIEW_PAGES);

  const outputName = useMemo(() => {
    const stem = baseName(fileMeta?.name);
    return selectedOnly ? `${stem}-selected.pdf` : `${stem}-rotated.pdf`;
  }, [fileMeta, selectedOnly]);

  const clearDocument = useCallback(() => {
    loadTokenRef.current += 1;
    if (pdfDocRef.current) {
      pdfDocRef.current.destroy?.();
      pdfDocRef.current = null;
    }
    bytesRef.current = null;
    setFileMeta(null);
    setPages([]);
    setRotations([]);
    setSelected([]);
    setSelectionInput("");
    setSelectionError("");
    setProgress("");
    setLoading(false);
    setRendering(false);
    setSelectedOnly(false);
  }, []);

  const renderThumbnail = async (page, targetWidth = 320) => {
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(2.5, targetWidth / baseViewport.width);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return null;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.82);
  };

  const loadFile = useCallback(
    async (file) => {
      if (!file) return;
      const isPdf =
        file.type === "application/pdf" || /\.pdf$/i.test(file.name);
      if (!isPdf) {
        toast.error("Please choose a PDF file.");
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`That file is larger than ${MAX_FILE_MB} MB.`);
        return;
      }

      if (pdfDocRef.current) {
        pdfDocRef.current.destroy?.();
        pdfDocRef.current = null;
      }

      const token = loadTokenRef.current + 1;
      loadTokenRef.current = token;

      setFileMeta({ name: file.name, size: file.size });
      setPages([]);
      setRotations([]);
      setSelected([]);
      setSelectionInput("");
      setSelectionError("");
      setProgress("Reading the document…");
      setLoading(true);
      setRendering(false);

      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        bytesRef.current = bytes;

        const task = pdfjsLib.getDocument({ data: bytes.slice() });
        const doc = await task.promise;
        if (token !== loadTokenRef.current) {
          doc.destroy?.();
          return;
        }
        pdfDocRef.current = doc;

        const count = doc.numPages;
        const meta = [];
        for (let number = 1; number <= count; number += 1) {
          const page = await doc.getPage(number);
          const viewport = page.getViewport({ scale: 1 });
          meta.push({
            pageNumber: number,
            width: Math.round(viewport.width * 10) / 10,
            height: Math.round(viewport.height * 10) / 10,
            baseRotation: normalizeRotation(page.rotate || 0),
            thumbnail: null,
          });
          page.cleanup();
        }

        if (token !== loadTokenRef.current) return;
        setPages(meta);
        setRotations(new Array(count).fill(0));
        setLoading(false);
        setRendering(true);

        for (let number = 1; number <= Math.min(count, MAX_PREVIEW_PAGES); number += 1) {
          if (token !== loadTokenRef.current) return;
          setProgress(`Rendering preview ${number} of ${Math.min(count, MAX_PREVIEW_PAGES)}…`);
          try {
            const page = await doc.getPage(number);
            const thumbnail = await renderThumbnail(page);
            if (token !== loadTokenRef.current) return;
            setPages((previous) =>
              previous.map((item) =>
                item.pageNumber === number ? { ...item, thumbnail } : item,
              ),
            );
            page.cleanup();
          } catch {
            // A single broken page should not stop the rest of the previews.
          }
        }

        if (token !== loadTokenRef.current) return;
        setProgress("");
        toast.success(`${count} page${count === 1 ? "" : "s"} loaded.`);
      } catch (error) {
        if (token !== loadTokenRef.current) return;
        const passwordProtected =
          error?.name === "PasswordException" ||
          /password/i.test(String(error?.message || ""));
        toast.error(
          passwordProtected
            ? "This PDF is password-protected. Unlock it first, then rotate its pages."
            : "This PDF could not be opened. It may be damaged or use unsupported encryption.",
        );
        setFileMeta(null);
        setPages([]);
        setRotations([]);
        setProgress("");
      } finally {
        if (token === loadTokenRef.current) {
          setLoading(false);
          setRendering(false);
          setProgress("");
        }
      }
    },
    [],
  );

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file) loadFile(file);
  };

  const applyRotation = useCallback(
    (targets, amount) => {
      if (!targets.length) {
        toast.error("Select at least one page first.");
        return;
      }
      if (!amount) return;
      setRotations((previous) => {
        const next = [...previous];
        targets.forEach((number) => {
          const index = number - 1;
          if (index >= 0 && index < next.length) {
            next[index] = normalizeRotation(next[index] + amount);
          }
        });
        return next;
      });
      toast.success(
        `${targets.length} page${targets.length === 1 ? "" : "s"} rotated ${amount > 0 ? "right" : "left"} by ${Math.abs(amount)}°.`,
      );
    },
    [],
  );

  const togglePage = (number) => {
    setSelected((previous) =>
      previous.includes(number)
        ? previous.filter((item) => item !== number)
        : [...previous, number],
    );
  };

  const applyPreset = (preset) => {
    if (!totalPages) return;
    setSelectionInput(preset);
    setSelectionError("");
    const { pages: parsed, error } = parsePageSelection(preset, totalPages);
    if (error) {
      setSelectionError(error);
      return;
    }
    setSelected(parsed);
  };

  const applyTypedSelection = () => {
    if (!totalPages) return;
    const { pages: parsed, error } = parsePageSelection(selectionInput, totalPages);
    if (error) {
      setSelectionError(error);
      return;
    }
    setSelectionError("");
    setSelected(parsed);
    toast.success(
      `${parsed.length} page${parsed.length === 1 ? "" : "s"} selected (${selectionToString(parsed)}).`,
    );
  };

  const rotateSelection = () => applyRotation(selectedPages, angle);
  const rotateAll = () =>
    applyRotation(
      Array.from({ length: totalPages }, (_, index) => index + 1),
      angle,
    );
  const resetAll = () => {
    setRotations(new Array(totalPages).fill(0));
    toast.success("All pages reset to their original orientation.");
  };
  const resetSelection = () => {
    setRotations((previous) => {
      const next = [...previous];
      selectedPages.forEach((number) => {
        next[number - 1] = 0;
      });
      return next;
    });
    toast.success("Selected pages reset to their original orientation.");
  };

  const exportPdf = async () => {
    if (!bytesRef.current || !fileMeta) {
      toast.error("Load a PDF first.");
      return;
    }
    if (selectedOnly && !selectedPages.length) {
      toast.error("Select at least one page, or turn off “selected pages only”.");
      return;
    }
    setExporting(true);
    try {
      const result = await createRotatedPdf({
        bytes: bytesRef.current,
        rotations,
        selectedPages,
        selectedOnly,
      });
      downloadBlob(
        new Blob([result], { type: "application/pdf" }),
        outputName,
      );
      toast.success(`Downloaded ${outputName}.`);
    } catch (error) {
      toast.error(
        error?.message
          ? `Export failed: ${error.message}`
          : "The rotated PDF could not be created.",
      );
    } finally {
      setExporting(false);
    }
  };

  const allSelected = totalPages > 0 && selected.length === totalPages;

  return (
    <div className="mx-auto w-full space-y-6 pb-12 lg:w-11/12">
      <Hero
        tone={TONE}
        eyebrow="Lossless PDF studio"
        icon={RotateCw}
        title="PDF Page Rotator"
        description="Turn individual pages, page ranges or every page in a PDF — left, right or upside down. Content is never re-rendered or recompressed, so text, images and vectors stay pixel-identical. Everything runs locally in your browser."
        badges={[
          "Lossless rotation",
          "Per-page controls",
          "Range selection",
          "Live thumbnails",
          "Selected-pages export",
          "100% private",
        ]}
      />

      <div
        role="tablist"
        aria-label="PDF page rotator sections"
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
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <Icon className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {tab === "rotate" && (
        <div className="space-y-6">
          <SectionCard
            tone={TONE}
            icon={FileUp}
            title="Choose a PDF"
            description={`Drag and drop a file or browse your device. Files up to ${MAX_FILE_MB} MB; previews are generated for the first ${MAX_PREVIEW_PAGES} pages.`}
            actions={
              fileMeta ? (
                <ActionButton icon={Trash2} variant="danger" onClick={clearDocument}>
                  Remove file
                </ActionButton>
              ) : null
            }
          >
            {!fileMeta && !loading && (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  handleFiles(event.dataTransfer.files);
                }}
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
                  dragging
                    ? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/30"
                    : "border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/30"
                }`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  <FileUp className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    Drop your PDF here
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    or choose a file from your device — it never leaves your computer
                  </p>
                </div>
                <ActionButton
                  tone={TONE}
                  variant="primary"
                  icon={FileUp}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse PDF
                </ActionButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-10 text-center dark:border-slate-800 dark:bg-slate-800/30">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {progress || "Opening the PDF…"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Large documents can take a few seconds to preview.
                </p>
              </div>
            )}

            {fileMeta && !loading && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/30">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                      {fileMeta.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatBytes(fileMeta.size)} · {totalPages} page
                      {totalPages === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone={rendering ? "amber" : "emerald"}>
                    {rendering ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> {progress || "Rendering previews"}
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-3.5 w-3.5" /> Ready
                      </>
                    )}
                  </Chip>
                  <ActionButton
                    icon={FileUp}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace
                  </ActionButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(event) => {
                      handleFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                tone={TONE}
                icon={Layers}
                label="Pages"
                value={totalPages || "—"}
                hint="Total pages in the document"
              />
              <Stat
                tone={TONE}
                icon={RotateCw}
                label="Changed"
                value={rotatedCount || 0}
                hint="Pages with a new rotation"
              />
              <Stat
                tone={TONE}
                icon={CheckSquare}
                label="Selected"
                value={selectedPages.length}
                hint="Pages targeted by bulk actions"
              />
              <Stat
                tone={TONE}
                icon={Gauge}
                label="File size"
                value={fileMeta ? formatBytes(fileMeta.size) : "—"}
                hint="Original document size"
              />
            </div>
          </SectionCard>

          {fileMeta && totalPages > 0 && (
            <>
              <SectionCard
                tone={TONE}
                icon={ListChecks}
                title="Rotate a selection"
                description="Type pages and ranges such as “1-3, 5, 8-10”, or use all, odd and even. Then choose an angle and apply it."
              >
                <div className="grid gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-7">
                    <Field
                      label="Page selection"
                      htmlFor="rotator-selection"
                      hint="Separate pages with commas. Ranges can use a hyphen. Leave blank and use the presets to select everything."
                    >
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          id="rotator-selection"
                          value={selectionInput}
                          onChange={(event) => {
                            setSelectionInput(event.target.value);
                            setSelectionError("");
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") applyTypedSelection();
                          }}
                          placeholder="1-3, 5, 8-10"
                          spellCheck={false}
                          className={`${fieldClass(Boolean(selectionError), TONE)} flex-1`}
                        />
                        <ActionButton tone={TONE} variant="primary" icon={MousePointerClick} onClick={applyTypedSelection}>
                          Select pages
                        </ActionButton>
                      </div>
                    </Field>
                    <FieldError>{selectionError}</FieldError>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {ROTATE_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => applyPreset(preset.value)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
                        >
                          {preset.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(allSelected ? [] : pages.map((page) => page.pageNumber));
                          setSelectionInput(allSelected ? "" : "all");
                          setSelectionError("");
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
                      >
                        {allSelected ? "Clear selection" : "Select all"}
                      </button>
                      {selectedPages.length > 0 && (
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {selectionToString(selectedPages)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="xl:col-span-5">
                    <Segmented
                      tone={TONE}
                      label="Rotation angle"
                      value={angle}
                      onChange={setAngle}
                      options={ANGLE_OPTIONS}
                      columns={3}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ActionButton
                        tone={TONE}
                        variant="primary"
                        icon={RotateCw}
                        onClick={rotateSelection}
                        disabled={!selectedPages.length}
                      >
                        Rotate selected ({selectedPages.length})
                      </ActionButton>
                      <ActionButton icon={Maximize2} onClick={rotateAll} disabled={!totalPages}>
                        Rotate all pages
                      </ActionButton>
                      <ActionButton
                        icon={Undo2}
                        variant="ghost"
                        onClick={resetSelection}
                        disabled={!selectedPages.length}
                      >
                        Reset selected
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                tone={TONE}
                icon={Layers}
                title="Page previews"
                description="Click a thumbnail to add or remove it from the selection. Each card shows the final rotation and orientation."
                actions={
                  <>
                    <ActionButton icon={Undo2} variant="ghost" onClick={resetAll} disabled={!rotatedCount}>
                      Reset all
                    </ActionButton>
                    <ActionButton icon={RotateCw} onClick={() => applyRotation(selectedPages, angle)} disabled={!selectedPages.length}>
                      Rotate selected
                    </ActionButton>
                  </>
                }
              >
                <div className="mb-4 max-w-sm">
                  <SliderRow
                    tone={TONE}
                    label="Thumbnail size"
                    min={120}
                    max={260}
                    step={10}
                    value={thumbSize}
                    onChange={setThumbSize}
                    format={(value) => `${value}px`}
                    hint="Adjust the preview grid to inspect page edges and orientation."
                  />
                </div>

                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(auto-fill, minmax(${thumbSize}px, 1fr))`,
                  }}
                >
                  {pages.map((page) => (
                    <PageThumb
                      key={page.pageNumber}
                      page={page}
                      delta={rotations[page.pageNumber - 1] || 0}
                      selected={selectedSet.has(page.pageNumber)}
                      onToggle={togglePage}
                      onRotate={applyRotation}
                    />
                  ))}
                </div>

                {totalPages > previewCount && (
                  <div className="mt-4">
                    <Callout tone="amber" variant="info" title={`${totalPages - previewCount} pages have no preview`}>
                      Thumbnails are generated for the first {previewCount} pages to keep the tool responsive. All other
                      pages can still be selected by number and are rotated and exported normally.
                    </Callout>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                tone={TONE}
                icon={Download}
                title="Download the result"
                description="The original page content is preserved byte for byte; only the rotation value changes."
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <ToggleRow
                      tone={TONE}
                      checked={selectedOnly}
                      onChange={setSelectedOnly}
                      label="Download selected pages only"
                      description="Create a new PDF containing just the selected pages, in their current order, with the new rotations applied."
                    />
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Output file</p>
                      <p className="mt-1 break-all font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {outputName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {selectedOnly
                          ? `${selectedPages.length} selected page${selectedPages.length === 1 ? "" : "s"}`
                          : `${totalPages} page${totalPages === 1 ? "" : "s"} · ${rotatedCount} rotated`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Ready when the preview looks right
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        Rotations are applied on top of each page’s existing orientation. Downloading does not upload,
                        alter or compress the original content.
                      </p>
                    </div>
                    <ActionButton
                      tone={TONE}
                      variant="primary"
                      icon={exporting ? Loader2 : Download}
                      onClick={exportPdf}
                      disabled={exporting || (selectedOnly && !selectedPages.length)}
                      className="w-full"
                    >
                      {exporting ? "Building PDF…" : "Download rotated PDF"}
                    </ActionButton>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {!fileMeta && !loading && (
            <div className="grid gap-6 lg:grid-cols-3">
              <SectionCard tone={TONE} icon={ShieldCheck} title="Private by design">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  The file is read with PDF.js in this tab and rebuilt with pdf-lib. Nothing is transmitted, logged or
                  stored on a server.
                </p>
              </SectionCard>
              <SectionCard tone={TONE} icon={ScanLine} title="Lossless rotation">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Rotation is a page-level attribute. Text stays selectable, images keep their original resolution and
                  vector art stays sharp.
                </p>
              </SectionCard>
              <SectionCard tone={TONE} icon={Lock} title="No account needed">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Open the tool, rotate and leave. There are no watermarks, sign-ups or export limits.
                </p>
              </SectionCard>
            </div>
          )}
        </div>
      )}

      {tab === "pages" && (
        <div className="space-y-6">
          {!fileMeta || totalPages === 0 ? (
            <SectionCard tone={TONE} icon={Table2} title="Page map" description="Load a PDF to inspect every page, its original orientation and the rotation you have applied.">
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800/30">
                <Table2 className="h-8 w-8 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No document loaded</p>
                <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
                  Open the Rotate pages tab, choose a PDF, then come back here for a page-by-page audit.
                </p>
                <ActionButton icon={FileUp} onClick={() => setTab("rotate")}>
                  Choose a PDF
                </ActionButton>
              </div>
            </SectionCard>
          ) : (
            <>
              <SectionCard
                tone={TONE}
                icon={Table2}
                title="Every page at a glance"
                description="Compare the original size and rotation with the final result. Use the row buttons for precise single-page edits."
                actions={
                  <>
                    <ActionButton
                      icon={allSelected ? Square : CheckSquare}
                      onClick={() => {
                        setSelected(allSelected ? [] : pages.map((page) => page.pageNumber));
                        setSelectionInput(allSelected ? "" : "all");
                      }}
                    >
                      {allSelected ? "Clear selection" : "Select all"}
                    </ActionButton>
                    <ActionButton icon={Undo2} variant="ghost" onClick={resetAll} disabled={!rotatedCount}>
                      Reset all
                    </ActionButton>
                  </>
                }
              >
                <div className="max-h-[34rem] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-3.5 py-3 font-bold">Page</th>
                        <th className="px-3.5 py-3 font-bold">Size</th>
                        <th className="px-3.5 py-3 font-bold">Original</th>
                        <th className="px-3.5 py-3 font-bold">Applied</th>
                        <th className="px-3.5 py-3 font-bold">Final</th>
                        <th className="px-3.5 py-3 font-bold">Orientation</th>
                        <th className="px-3.5 py-3 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pages.map((page) => {
                        const delta = rotations[page.pageNumber - 1] || 0;
                        const finalRotation = normalizeRotation(page.baseRotation + delta);
                        return (
                          <tr
                            key={page.pageNumber}
                            className={
                              selectedSet.has(page.pageNumber)
                                ? "bg-sky-50/70 dark:bg-sky-950/20"
                                : "bg-white dark:bg-slate-900"
                            }
                          >
                            <td className="px-3.5 py-2.5">
                              <button
                                type="button"
                                onClick={() => togglePage(page.pageNumber)}
                                className="inline-flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100"
                                aria-pressed={selectedSet.has(page.pageNumber)}
                              >
                                {selectedSet.has(page.pageNumber) ? (
                                  <CheckSquare className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400" />
                                )}
                                {page.pageNumber}
                              </button>
                            </td>
                            <td className="px-3.5 py-2.5 tabular-nums text-slate-500 dark:text-slate-400">
                              {Math.round(page.width)} × {Math.round(page.height)} pt
                            </td>
                            <td className="px-3.5 py-2.5 tabular-nums text-slate-500 dark:text-slate-400">
                              {rotationLabel(page.baseRotation)}
                            </td>
                            <td className="px-3.5 py-2.5">
                              {delta === 0 ? (
                                <span className="text-slate-400 dark:text-slate-500">—</span>
                              ) : (
                                <Chip tone="amber">{rotationLabel(delta)}</Chip>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 font-bold tabular-nums text-slate-900 dark:text-white">
                              {rotationLabel(finalRotation)}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-500 dark:text-slate-400">
                              {pageOrientation(page.width, page.height, finalRotation)}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => applyRotation([page.pageNumber], -90)}
                                  aria-label={`Rotate page ${page.pageNumber} left`}
                                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => applyRotation([page.pageNumber], 90)}
                                  aria-label={`Rotate page ${page.pageNumber} right`}
                                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
                                >
                                  <RotateCw className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => applyRotation([page.pageNumber], -delta)}
                                  aria-label={`Reset page ${page.pageNumber}`}
                                  disabled={delta === 0}
                                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                                >
                                  <Undo2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard
                  tone={TONE}
                  icon={RotateCw}
                  title="Bulk rotate by angle"
                  description="Apply a fixed angle to the current selection, or turn every page at once."
                >
                  <Segmented
                    tone={TONE}
                    label="Angle"
                    value={angle}
                    onChange={setAngle}
                    options={ANGLE_OPTIONS}
                    columns={3}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionButton
                      tone={TONE}
                      variant="primary"
                      icon={RotateCw}
                      onClick={rotateSelection}
                      disabled={!selectedPages.length}
                    >
                      Apply to selected ({selectedPages.length})
                    </ActionButton>
                    <ActionButton icon={Maximize2} onClick={rotateAll}>
                      Apply to all
                    </ActionButton>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    A right rotation adds 90° clockwise. A left rotation subtracts 90°. Angles wrap at 360°, so a page
                    can always be returned to its original orientation.
                  </p>
                </SectionCard>

                <SectionCard
                  tone={TONE}
                  icon={Info}
                  title="Orientation audit"
                  description="A quick summary of how the document will read after export."
                >
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <Stat
                      tone={TONE}
                      label="Original portrait"
                      value={pages.filter((page) => pageOrientation(page.width, page.height, page.baseRotation) === "Portrait").length}
                    />
                    <Stat
                      tone={TONE}
                      label="Original landscape"
                      value={pages.filter((page) => pageOrientation(page.width, page.height, page.baseRotation) === "Landscape").length}
                    />
                    <Stat
                      tone={TONE}
                      label="Final portrait"
                      value={pages.filter((page) => pageOrientation(page.width, page.height, normalizeRotation(page.baseRotation + (rotations[page.pageNumber - 1] || 0))) === "Portrait").length}
                    />
                    <Stat
                      tone={TONE}
                      label="Final landscape"
                      value={pages.filter((page) => pageOrientation(page.width, page.height, normalizeRotation(page.baseRotation + (rotations[page.pageNumber - 1] || 0))) === "Landscape").length}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Mixed orientations are common in scanned documents. Rotating sideways pages to match the rest makes
                    reading and printing far more comfortable.
                  </p>
                </SectionCard>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "learn" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard tone={TONE} icon={MousePointerClick} title="1 · Load">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Choose a PDF from your device. The first {MAX_PREVIEW_PAGES} pages render as thumbnails so you can see
                exactly what will change.
              </p>
            </SectionCard>
            <SectionCard tone={TONE} icon={RotateCw} title="2 · Rotate">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Click a page to select it and use the left or right arrows, or type a range such as 1-3, 5 and rotate
                the whole selection at once.
              </p>
            </SectionCard>
            <SectionCard tone={TONE} icon={Download} title="3 · Export">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Download the full document, or keep only the pages you selected. The output is a standard PDF that opens
                everywhere.
              </p>
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard tone={TONE} icon={ShieldCheck} title="Why rotation is lossless">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                A PDF page stores a rotation value independently of its content stream. Changing that value tells every
                reader to display the page at a new angle. The text, images, fonts and vector graphics are untouched,
                which means there is no re-rendering, no resampling and no quality loss.
              </p>
              <div className="mt-3 rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-sky-300 dark:bg-slate-950">
                page.setRotation(degrees((current + delta) % 360))
              </div>
            </SectionCard>

            <SectionCard tone={TONE} icon={ScanLine} title="Reading a rotation badge">
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <li>• 0° — the page displays in its original orientation.</li>
                <li>• 90° — the top edge moves to the right (clockwise).</li>
                <li>• 180° — the page is upside down.</li>
                <li>• 270° — the top edge moves to the left (counter-clockwise).</li>
                <li>• The badge on each thumbnail shows the rotation you applied, not the page’s original value.</li>
              </ul>
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Callout tone={TONE} variant="tip" title="Scanned documents">
              A scanner may save a sideways page with a 90° rotation flag already set. The preview already includes
              that rotation, so rotate until the text reads normally.
            </Callout>
            <Callout tone="amber" variant="warning" title="Password-protected files">
              Encrypted PDFs must be unlocked before they can be read in the browser. Use the PDF Unlocker first, then
              return here.
            </Callout>
            <Callout tone="emerald" variant="success" title="Check before you print">
              Review the page map, especially for double-sided or mixed-orientation scans, so the printed stack reads in
              the right order.
            </Callout>
          </div>

          <FaqAccordion items={PDF_ROTATOR_FAQS} tone={TONE} title="PDF rotation questions, answered" />
        </div>
      )}
    </div>
  );
}
