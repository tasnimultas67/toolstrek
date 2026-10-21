"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowDownToLine,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileLock2,
  FileText,
  Gauge,
  Info,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Unlock,
  UploadCloud,
  X,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import { useRecentTools } from "@/hooks/useRecentTools";

const TOOL_META = {
  title: "PDF Unlocker",
  link: "/tools/pdf-unlocker",
  description:
    "Remove PDF passwords and restrictions locally with a lossless qpdf engine, audit encryption and permissions, or rebuild protected pages when needed.",
  icon: "Unlock",
  keywords: [
    "pdf unlocker",
    "remove pdf password",
    "unlock pdf",
    "pdf restrictions remover",
    "decrypt pdf",
  ],
  categories: ["PDF", "Security"],
};

const DEFAULT_OPTIONS = {
  engine: "lossless",
  optimize: true,
  linearize: false,
  scrubMetadata: false,
  flattenAnnotations: false,
  rasterQuality: "high",
};

const RESTRICTION_LABELS = [
  { key: "extract for accessibility", label: "Accessible text extraction" },
  { key: "extract for any purpose", label: "Copy or extract content" },
  { key: "print low resolution", label: "Low-resolution printing" },
  { key: "print high resolution", label: "High-resolution printing" },
  { key: "modify document assembly", label: "Page assembly and organisation" },
  { key: "modify forms", label: "Form filling" },
  { key: "modify annotations", label: "Comments and annotations" },
  { key: "modify other", label: "Other document edits" },
  { key: "modify anything", label: "Unrestricted editing" },
];

const RASTER_QUALITY = {
  standard: { label: "Standard", scale: 1.5, quality: 0.82, maxSide: 1800 },
  high: { label: "High", scale: 2, quality: 0.9, maxSide: 2600 },
  maximum: { label: "Maximum", scale: 2.5, quality: 0.94, maxSide: 3400 },
};

let qpdfRuntimePromise = null;
const qpdfSink = { lines: [] };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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

function getOutputName(name, rebuilt = false) {
  const base = String(name || "document.pdf").replace(/\.pdf$/i, "");
  return `${base}-${rebuilt ? "rebuilt" : "unlocked"}.pdf`;
}

function isPdf(file) {
  return file && (file.type === "application/pdf" || /\.pdf$/i.test(file.name));
}

async function getQpdfRuntime() {
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only available in the browser.");
  }
  if (!window.crossOriginIsolated) {
    throw new Error(
      "This page is not cross-origin isolated, so the lossless PDF engine cannot start. Reload the page or choose Rebuild pages.",
    );
  }

  if (!qpdfRuntimePromise) {
    qpdfRuntimePromise = (async () => {
      const importer = new Function("url", "return import(url)");
      const qpdfModule = await importer("/qpdf/qpdf.js");
      const init = qpdfModule.default ?? qpdfModule;
      return init({
        locateFile: (file) => `/qpdf/${file}`,
        print: (line) => qpdfSink.lines.push(String(line)),
        printErr: (line) => qpdfSink.lines.push(String(line)),
      });
    })().catch((error) => {
      qpdfRuntimePromise = null;
      throw error;
    });
  }

  return qpdfRuntimePromise;
}

async function runQpdf(args) {
  const runtime = await getQpdfRuntime();
  qpdfSink.lines = [];
  let code = 0;
  let thrown = null;
  try {
    code = runtime.callMain(args) ?? 0;
  } catch (error) {
    thrown = error;
    if (typeof error === "number") code = error;
    else if (Number.isFinite(error?.status)) code = error.status;
    else code = 1;
  }
  return {
    code,
    lines: [...qpdfSink.lines],
    thrown,
  };
}

function writeToQpdf(runtime, path, bytes) {
  try {
    runtime.FS.unlink(path);
  } catch {
    // File does not exist yet.
  }
  runtime.FS.writeFile(path, bytes);
}

function readFromQpdf(runtime, path) {
  const bytes = runtime.FS.readFile(path);
  return bytes.slice ? bytes.slice() : new Uint8Array(bytes);
}

function parseEncryption(lines, password) {
  const text = lines.join("\n");
  const unencrypted = /File is not encrypted/i.test(text);
  if (unencrypted) {
    return {
      encrypted: false,
      algorithm: "None",
      securityHandler: null,
      restrictions: [],
      passwordAccepted: false,
      note: "No encryption was found. This PDF can still be optimised or flattened.",
    };
  }

  const algorithmLine =
    lines.find((line) => /stream encryption method:/i.test(line)) ||
    lines.find((line) => /file encryption method:/i.test(line)) ||
    "";
  const algorithmRaw = algorithmLine.split(":").pop()?.trim() || "Encrypted";
  const algorithmMap = {
    AESv3: "AES-256",
    AESv2: "AES-128",
    RC4: "RC4",
    none: "None",
  };
  const algorithm =
    Object.entries(algorithmMap).find(([key]) =>
      algorithmRaw.toLowerCase().includes(key.toLowerCase()),
    )?.[1] || algorithmRaw;

  const handlerLine = lines.find((line) => /^R\s*=/i.test(line.trim())) || "";
  const securityHandler = handlerLine.split("=")[1]?.trim() || null;
  const acceptedLine = lines.find((line) =>
    /Supplied password is (owner|user) password/i.test(line),
  );
  const passwordAccepted = Boolean(acceptedLine);
  const wrongPassword =
    /invalid password/i.test(text) ||
    /password required/i.test(text) ||
    (!passwordAccepted && Boolean(password));

  const restrictions = RESTRICTION_LABELS.map((item) => {
    const line = lines.find((entry) =>
      entry.toLowerCase().startsWith(`${item.key}:`),
    );
    if (!line) return { ...item, status: "unknown" };
    const value = line.split(":").slice(1).join(":").trim().toLowerCase();
    return {
      ...item,
      status: value.startsWith("not allowed")
        ? "restricted"
        : value.startsWith("allowed")
          ? "allowed"
          : "unknown",
    };
  }).filter((item) => item.status !== "unknown");

  return {
    encrypted: true,
    algorithm,
    securityHandler,
    restrictions,
    passwordAccepted,
    wrongPassword,
    passwordType: acceptedLine
      ? /owner/i.test(acceptedLine)
        ? "owner"
        : "user"
      : null,
    note:
      wrongPassword
        ? "The password was not accepted. Try the document's user password or owner password."
        : passwordAccepted
          ? "The password was accepted. The restriction audit below comes from the PDF security dictionary."
          : "This PDF has encryption or permission flags. Enter a password if one is required.",
  };
}

async function inspectPdf(bytes, password) {
  const runtime = await getQpdfRuntime();
  writeToQpdf(runtime, "/input.pdf", bytes);
  const passwordArg = password ? [`--password=${password}`] : [];
  const encryptionRun = await runQpdf([
    "--show-encryption",
    ...passwordArg,
    "/input.pdf",
  ]);
  const encryption = parseEncryption(encryptionRun.lines, password);

  if (encryption.wrongPassword || (/invalid password/i.test(encryptionRun.lines.join("\n")))) {
    return {
      ...encryption,
      pages: null,
      encrypted: true,
      wrongPassword: true,
      passwordRequired: true,
    };
  }

  if (encryptionRun.code !== 0) {
    const firstLine =
      encryptionRun.lines.find((line) => /error|invalid|password/i.test(line)) ||
      "The PDF could not be inspected.";
    throw new Error(firstLine.replace(/^.*?: /, "").trim());
  }

  const pageRun = await runQpdf([
    "--show-npages",
    ...passwordArg,
    "/input.pdf",
  ]);
  const pageLine = pageRun.lines.find((line) => /^\d+\s*$/.test(line.trim()));
  const pages = pageLine ? Number(pageLine.trim()) : null;

  return {
    ...encryption,
    pages,
    passwordRequired: false,
  };
}

async function loadPdfJs() {
  const pdfModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdfjs = pdfModule.default ?? pdfModule;
  if (pdfjs?.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
  }
  return pdfjs;
}

function canvasToJpeg(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not encode a page image."));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function rebuildWithRaster(bytes, password, qualityId, onProgress) {
  const quality = RASTER_QUALITY[qualityId] || RASTER_QUALITY.high;
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({
    data: bytes.slice ? bytes.slice() : new Uint8Array(bytes),
    password: password || undefined,
    useWorkerFetch: false,
    isEvalSupported: false,
  });

  let source;
  try {
    source = await loadingTask.promise;
  } catch (error) {
    if (error?.name === "PasswordException" || /password/i.test(error?.message || "")) {
      throw new Error(
        "The password was not accepted. Try the user password or owner password, then rebuild again.",
      );
    }
    throw error;
  }

  const { PDFDocument } = await import("pdf-lib");
  const output = await PDFDocument.create();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas rendering is not available in this browser.");

  try {
    for (let pageIndex = 1; pageIndex <= source.numPages; pageIndex += 1) {
      const page = await source.getPage(pageIndex);
      const base = page.getViewport({ scale: 1 });
      const scaleCap = quality.maxSide / Math.max(base.width, base.height || 1);
      const scale = Math.max(0.35, Math.min(quality.scale, scaleCap));
      const viewport = page.getViewport({ scale });

      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;

      const jpeg = await canvasToJpeg(canvas, quality.quality);
      const image = await output.embedJpg(new Uint8Array(await jpeg.arrayBuffer()));
      const outputPage = output.addPage([base.width, base.height]);
      outputPage.drawImage(image, {
        x: 0,
        y: 0,
        width: base.width,
        height: base.height,
      });
      page.cleanup?.();
      onProgress?.(15 + Math.round((pageIndex / source.numPages) * 78));
    }
  } finally {
    try {
      source?.destroy?.();
    } catch {
      // Ignore worker cleanup issues.
    }
  }

  output.setTitle("ToolsTrek rebuilt PDF");
  output.setProducer("ToolsTrek PDF Unlocker");
  const result = await output.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
  });
  onProgress?.(100);
  return result;
}

function buildQpdfArgs(options, password) {
  const args = [];
  if (password) args.push(`--password=${password}`);
  args.push("--decrypt");
  if (options.optimize) {
    args.push("--object-streams=generate");
    args.push("--compress-streams=y");
    args.push("--recompress-flate");
    args.push("--compression-level=9");
  }
  if (options.linearize) args.push("--linearize");
  if (options.scrubMetadata) {
    args.push("--remove-info");
    args.push("--remove-metadata");
  }
  if (options.flattenAnnotations) args.push("--flatten-annotations=all");
  args.push("/input.pdf");
  args.push("/output.pdf");
  return args;
}

export default function PDFUnlocker() {
  const [file, setFile] = useState(null);
  const [bytes, setBytes] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [dragActive, setDragActive] = useState(false);
  const [audit, setAudit] = useState(null);
  const [auditStatus, setAuditStatus] = useState("idle");
  const [auditError, setAuditError] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyStage, setBusyStage] = useState("");
  const [busyStartedAt, setBusyStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [qpdfReady, setQpdfReady] = useState(false);
  const [isolation, setIsolation] = useState(true);
  const fileInputRef = useRef(null);
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  useEffect(() => {
    // The route's COOP/COEP headers are only observable after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsolation(typeof window !== "undefined" && window.crossOriginIsolated);
  }, []);

  useEffect(() => {
    if (!bytes) return undefined;
    let cancelled = false;
    inspectPdf(bytes, "")
      .then((nextAudit) => {
        if (cancelled) return;
        setAudit(nextAudit);
        setQpdfReady(true);
        setAuditStatus("success");
      })
      .catch((inspectionError) => {
        if (cancelled) return;
        console.error("PDF audit failed:", inspectionError);
        if (inspectionError?.message?.includes("cross-origin isolated")) {
          setIsolation(false);
        }
        setAuditError(
          inspectionError?.message?.includes("cross-origin isolated")
            ? "This browser session is not cross-origin isolated, so the lossless PDF engine cannot start. Choose Rebuild pages."
            : inspectionError?.message || "The PDF could not be inspected.",
        );
        setAuditStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [bytes]);

  const updateOption = (key, value) => {
    setOptions((current) => ({ ...current, [key]: value }));
    setResult(null);
  };

  const clearFile = () => {
    setFile(null);
    setBytes(null);
    setPassword("");
    setAudit(null);
    setAuditStatus("idle");
    setAuditError("");
    setResult(null);
    setError("");
    setQpdfReady(false);
  };

  const handleFile = useCallback(async (nextFile) => {
    if (!nextFile) return;
    if (!isPdf(nextFile)) {
      toast.error("Choose a PDF file. Other document types are not supported here.");
      return;
    }
    if (nextFile.size > 200 * 1024 * 1024) {
      toast.error("That PDF is larger than 200 MB. Try a smaller file.");
      return;
    }
    setBusy(true);
    setBusyStage("Reading PDF…");
    setProgress(8);
    setError("");
    setResult(null);
    try {
      const nextBytes = new Uint8Array(await nextFile.arrayBuffer());
      setFile(nextFile);
      setBytes(nextBytes);
      setAuditStatus("loading");
      setAudit(null);
      setProgress(100);
      toast.success(`${nextFile.name} loaded. Inspecting permissions locally…`);
    } catch (readError) {
      console.error("PDF read failed:", readError);
      setError("That PDF could not be read. Try downloading it again or choose another file.");
      toast.error("Could not read that PDF.");
    } finally {
      setBusy(false);
      setBusyStage("");
      setProgress(0);
    }
  }, []);

  const handleInput = (event) => {
    const nextFile = event.target.files?.[0];
    event.target.value = "";
    if (nextFile) handleFile(nextFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    if (!busy) handleFile(event.dataTransfer.files?.[0]);
  };

  const inspectCurrent = async () => {
    if (!bytes) return;
    setAuditStatus("loading");
    setAuditError("");
    setError("");
    try {
      const nextAudit = await inspectPdf(bytes, password);
      setAudit(nextAudit);
      setQpdfReady(true);
      setAuditStatus("success");
      if (nextAudit.wrongPassword) {
        toast.error("That password was not accepted. Try the user or owner password.");
      } else if (nextAudit.encrypted) {
        toast.success(
          nextAudit.passwordAccepted
            ? `Password accepted (${nextAudit.passwordType} password).`
            : "Encryption audit updated.",
        );
      } else {
        toast.success("This PDF is not encrypted. You can still optimise or flatten it.");
      }
    } catch (inspectionError) {
      console.error("PDF inspection failed:", inspectionError);
      setAuditError(inspectionError?.message || "The PDF could not be inspected.");
      setAuditStatus("error");
      toast.error(inspectionError?.message || "Could not inspect this PDF.");
    }
  };

  const getFriendlyQpdfError = (lines) => {
    const text = lines.join("\n");
    if (/invalid password/i.test(text)) {
      return "That password was not accepted. Try the user password (to open the PDF) or the owner password (to change permissions).";
    }
    if (/password required/i.test(text)) {
      return "This PDF needs a password. Enter the user or owner password, then unlock again.";
    }
    const first = lines.find(
      (line) =>
        /error/i.test(line) ||
        /warning/i.test(line) ||
        /invalid/i.test(line) ||
        /can't/i.test(line),
    );
    return first
      ? first.replace(/^.*?:\s*/, "").trim()
      : "The lossless engine could not unlock this PDF.";
  };

  const downloadResult = () => {
    if (!result?.blob) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast.success("Unlocked PDF downloaded.");
  };

  const unlock = async () => {
    if (!bytes || !file) {
      toast.error("Choose a PDF before unlocking.");
      return;
    }
    if (audit?.passwordRequired && !password) {
      setError("This PDF is password-protected. Enter a password before unlocking.");
      toast.error("Enter the PDF password first.");
      return;
    }

    setBusy(true);
    setBusyStartedAt(Date.now());
    setElapsed(0);
    setProgress(5);
    setError("");
    setResult(null);

    try {
      if (options.engine === "raster") {
        setBusyStage("Rebuilding pages with a compatible renderer…");
        setProgress(10);
        const output = await rebuildWithRaster(
          bytes,
          password,
          options.rasterQuality,
          (nextProgress) => setProgress(nextProgress),
        );
        const blob = new Blob([output], { type: "application/pdf" });
        setResult({
          blob,
          bytes: output,
          name: getOutputName(file.name, true),
          originalBytes: file.size,
          outputBytes: output.length,
          pages: audit?.pages ?? null,
          engine: "Rebuild pages",
          note: "The rebuilt PDF is image-based, so text may no longer be selectable. The password and restrictions are removed.",
        });
        setProgress(100);
        toast.success("PDF rebuilt and password removed. Download it below.");
        return;
      }

      setBusyStage("Starting the lossless PDF engine…");
      const runtime = await getQpdfRuntime();
      setQpdfReady(true);
      setProgress(22);
      writeToQpdf(runtime, "/input.pdf", bytes);
      try {
        runtime.FS.unlink("/output.pdf");
      } catch {
        // No previous output.
      }

      setBusyStage("Removing encryption and restrictions…");
      const unlockRun = await runQpdf(buildQpdfArgs(options, password));
      setProgress(76);

      if (unlockRun.code !== 0) {
        throw new Error(getFriendlyQpdfError(unlockRun.lines));
      }

      let output;
      try {
        output = readFromQpdf(runtime, "/output.pdf");
      } catch {
        throw new Error("The engine finished but did not produce an output file.");
      }
      if (!output?.length) {
        throw new Error("The engine produced an empty PDF. Try the rebuilt-pages engine.");
      }

      setBusyStage("Verifying the unlocked document…");
      setProgress(88);
      const verifyRun = await runQpdf(["--check", "/output.pdf"]);
      const verifyNotes =
        verifyRun.code === 0
          ? "The output passed qpdf's structural check."
          : "The output was created, but qpdf reported structural warnings. Open it in your PDF reader before relying on it.";

      setProgress(100);
      const blob = new Blob([output], { type: "application/pdf" });
      setResult({
        blob,
        bytes: output,
        name: getOutputName(file.name, false),
        originalBytes: file.size,
        outputBytes: output.length,
        pages: audit?.pages ?? null,
        engine: "Lossless qpdf",
        note: `Encryption and permission restrictions were removed without rasterising the pages. ${verifyNotes}`,
      });
      toast.success("PDF unlocked losslessly. Download it below.");
    } catch (unlockError) {
      console.error("PDF unlock failed:", unlockError);
      const message =
        unlockError?.message ||
        "The PDF could not be unlocked. Check the password and try the rebuilt-pages engine.";
      setError(message);
      if (/cross-origin isolated|SharedArrayBuffer|Worker/i.test(message)) {
        toast.error("The lossless engine is unavailable here. Switch to Rebuild pages and try again.");
      } else {
        toast.error(message);
      }
    } finally {
      setBusy(false);
      setBusyStage("");
      setProgress(0);
    }
  };

  useEffect(() => {
    if (!busy) return undefined;
    const timer = window.setInterval(() => {
      setElapsed(Math.max(0, Math.round((Date.now() - busyStartedAt) / 1000)));
    }, 500);
    return () => window.clearInterval(timer);
  }, [busy, busyStartedAt]);

  const encrypted = audit?.encrypted;
  const restrictions = audit?.restrictions || [];
  const restrictedCount = restrictions.filter((item) => item.status === "restricted").length;
  const allowedCount = restrictions.filter((item) => item.status === "allowed").length;
  const passwordProblem = audit?.wrongPassword;

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BackButton className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:bg-gray-800" />
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            PDF &amp; Security Tools
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Files stay in your browser
          </span>
          <FavoriteButton
            tool={TOOL_META}
            className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 sm:text-sm dark:bg-sky-950/40 dark:text-sky-300">
          <Unlock className="h-3.5 w-3.5" />
          Free PDF Unlocker
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
          Open locked PDFs{" "}
          <span className="text-sky-600 dark:text-sky-400">without a server.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
          Audit encryption, page counts and print/copy permissions, then remove
          password protection with a real lossless qpdf engine. Prefer a universal
          fallback? Rebuild protected pages into a clean, unencrypted PDF.
        </p>
      </div>

      <div className="mx-auto mb-6 max-w-3xl">
        <div className="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-xs leading-relaxed text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Only unlock PDFs you own or have permission to modify. ToolsTrek processes the file locally; it never uploads or stores your document or password.
        </div>
      </div>

      {!file ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`mx-auto mb-6 max-w-3xl rounded-3xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
            dragActive
              ? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/20"
              : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={handleInput}
            aria-label="Upload a PDF to unlock"
          />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Drop a password-protected PDF here
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Up to 200 MB. We read the encryption dictionary, show what is restricted,
            and remove the password locally. Nothing is uploaded.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileLock2 className="h-4 w-4" />}
            {busy ? busyStage : "Choose a PDF"}
          </button>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            AES-256, AES-128, RC4 and owner-password restrictions supported.
          </p>
        </div>
      ) : null}

      {!isolation ? (
        <div className="mx-auto mb-5 flex max-w-3xl items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            This browser session is not cross-origin isolated, so the lossless engine
            cannot start. Rebuild pages works here and still removes the password.
          </span>
        </div>
      ) : null}

      {error ? (
        <div className="mx-auto mb-5 flex max-w-3xl items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,355px)_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-24 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/40">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <h2 className="text-sm font-bold text-gray-900 sm:text-base dark:text-white">
                Unlock settings
              </h2>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              New file
            </button>
          </div>

          <fieldset disabled={busy} className="m-0 min-w-0 space-y-5 border-0 p-5 disabled:opacity-60">
            {file ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
                <div className="flex items-start gap-2">
                  <div className="rounded-lg bg-sky-100 p-2 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{file.name}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                      {formatBytes(file.size)}{audit?.pages ? ` · ${audit.pages} page${audit.pages === 1 ? "" : "s"}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-500 dark:hover:bg-gray-800"
                    aria-label="Remove PDF"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-300"
                >
                  <UploadCloud className="h-3 w-3" />
                  Replace file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={handleInput}
                  aria-label="Upload a PDF to unlock"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Choose a PDF above to begin.
              </div>
            )}

            <div>
              <label htmlFor="pdf-password" className="mb-1.5 block text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
                PDF password <span className="font-normal text-gray-400">(user or owner)</span>
              </label>
              <div className="relative">
                <input
                  id="pdf-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setResult(null);
                  }}
                  autoComplete="off"
                  placeholder={audit?.passwordRequired ? "Password required" : "Leave blank if none"}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={inspectCurrent}
                  disabled={!bytes || auditStatus === "loading"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {auditStatus === "loading" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                  Check &amp; audit
                </button>
                {audit?.passwordAccepted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    {audit.passwordType} password verified
                  </span>
                ) : null}
                {passwordProblem ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    Password not accepted
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                The password is used only for this tab. It is never logged, stored or sent over the network.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Unlock engine
              </span>
              <div className="space-y-2">
                <label className={`flex cursor-pointer gap-2 rounded-xl border p-3 transition-all ${options.engine === "lossless" ? "border-sky-300 bg-sky-50/70 dark:border-sky-800 dark:bg-sky-950/20" : "border-gray-200 dark:border-gray-700"}`}>
                  <input
                    type="radio"
                    name="pdf-engine"
                    value="lossless"
                    checked={options.engine === "lossless"}
                    onChange={() => updateOption("engine", "lossless")}
                    className="mt-0.5 h-4 w-4 accent-sky-600"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                      <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />
                      Lossless qpdf
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Recommended</span>
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                      Keeps text selectable, vector graphics and image quality. Removes AES-256, AES-128 and RC4 encryption.
                    </span>
                  </span>
                </label>
                <label className={`flex cursor-pointer gap-2 rounded-xl border p-3 transition-all ${options.engine === "raster" ? "border-sky-300 bg-sky-50/70 dark:border-sky-800 dark:bg-sky-950/20" : "border-gray-200 dark:border-gray-700"}`}>
                  <input
                    type="radio"
                    name="pdf-engine"
                    value="raster"
                    checked={options.engine === "raster"}
                    onChange={() => updateOption("engine", "raster")}
                    className="mt-0.5 h-4 w-4 accent-sky-600"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                      <Gauge className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />
                      Rebuild pages
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                      Works everywhere by rendering each page to an image. Removes the password but text becomes non-selectable.
                    </span>
                  </span>
                </label>
              </div>
              {options.engine === "lossless" && !isolation ? (
                <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  The lossless engine needs a cross-origin isolated page. Rebuild pages is available here.
                </p>
              ) : null}
              {options.engine === "raster" ? (
                <label className="mt-3 block">
                  <span className="mb-1 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">Rebuild quality</span>
                  <select
                    value={options.rasterQuality}
                    onChange={(event) => updateOption("rasterQuality", event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-xs text-gray-900 outline-none focus:border-sky-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  >
                    {Object.entries(RASTER_QUALITY).map(([key, quality]) => (
                      <option key={key} value={key}>{quality.label} — {quality.scale}× page render</option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>

            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Output options
              </span>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-gray-50 p-2.5 text-xs dark:bg-gray-950">
                  <input type="checkbox" checked={options.optimize} onChange={(event) => updateOption("optimize", event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-sky-600" />
                  <span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Optimise file structure</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">Compress streams and rebuild object tables for a cleaner file.</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-gray-50 p-2.5 text-xs dark:bg-gray-950">
                  <input type="checkbox" checked={options.linearize} onChange={(event) => updateOption("linearize", event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-sky-600" />
                  <span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Linearise for fast web view</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">Optimise byte order so the first page opens before the full download.</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-gray-50 p-2.5 text-xs dark:bg-gray-950">
                  <input type="checkbox" checked={options.scrubMetadata} onChange={(event) => updateOption("scrubMetadata", event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-sky-600" />
                  <span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Scrub document metadata</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">Remove Info dictionary fields and XMP metadata before sharing.</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-gray-50 p-2.5 text-xs dark:bg-gray-950">
                  <input type="checkbox" checked={options.flattenAnnotations} onChange={(event) => updateOption("flattenAnnotations", event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-sky-600" />
                  <span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Flatten annotations &amp; forms</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">Burn comments and form appearances into the page content (qpdf engine only).</span>
                  </span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={unlock}
              disabled={busy || !bytes}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
              {busy ? busyStage || "Unlocking…" : "Unlock PDF"}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
              {options.engine === "lossless"
                ? "Runs qpdf 12.2.0 via WebAssembly in this tab."
                : "Pages are rendered locally and rebuilt into a new PDF."}
            </p>
          </fieldset>
        </aside>

        <main className="min-w-0 space-y-5">
          {file ? (
            <>
              {result ? (
                <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900/60 dark:bg-gray-900">
                  <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50/70 px-4 py-3 sm:px-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <h2 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Your PDF is unlocked</h2>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {result.engine}
                    </span>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Original</p>
                        <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{formatBytes(result.originalBytes)}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Unlocked</p>
                        <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{formatBytes(result.outputBytes)}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pages</p>
                        <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{result.pages ?? "—"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{result.name}</p>
                        <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500 dark:text-gray-400">{result.note}</p>
                      </div>
                      <button
                        type="button"
                        onClick={downloadResult}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {busy ? (
                <div className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm dark:border-sky-900/60 dark:bg-gray-900">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-sky-600 dark:text-sky-400" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{busyStage || "Working on your PDF…"}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${Math.max(3, progress)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {elapsed}s elapsed · all processing stays in this tab
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5 dark:border-gray-800 dark:bg-gray-950/40">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Encryption &amp; permission audit</h2>
                    {auditStatus === "success" ? (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${encrypted ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
                        {encrypted ? audit.algorithm : "Not encrypted"}
                      </span>
                    ) : null}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <LockKeyhole className="h-3 w-3" />
                    {qpdfReady ? "qpdf 12.2.0 · engine ready" : "qpdf 12.2.0"}
                  </span>
                </div>

                <div className="p-4 sm:p-6">
                  {auditStatus === "loading" ? (
                    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-center dark:border-sky-900/50 dark:bg-sky-950/10">
                      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Inspecting the PDF security dictionary</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Reading encryption, permissions and page count locally…</p>
                      </div>
                    </div>
                  ) : auditStatus === "error" ? (
                    <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/40 p-6 text-center dark:border-red-900/50 dark:bg-red-950/10">
                      <ShieldAlert className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="text-sm font-bold text-red-700 dark:text-red-300">The audit could not start</p>
                        <p className="mt-1 max-w-lg text-xs leading-relaxed text-red-600 dark:text-red-400">{auditError}</p>
                        <p className="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                          If the lossless engine is unavailable, choose Rebuild pages and try again. Rebuilding still removes the password.
                        </p>
                      </div>
                    </div>
                  ) : audit ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Encryption</p>
                          <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{audit.encrypted ? audit.algorithm : "None"}</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pages</p>
                          <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{audit.pages ?? "—"}</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Restricted</p>
                          <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{restrictedCount}</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Allowed</p>
                          <p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{allowedCount}</p>
                        </div>
                      </div>

                      <div className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed ${
                        passwordProblem
                          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
                          : audit.passwordAccepted
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300"
                            : "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400"
                      }`}>
                        {passwordProblem ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : audit.passwordAccepted ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
                        <span>{audit.note}</span>
                      </div>

                      {audit.encrypted && restrictions.length ? (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Permission matrix</p>
                          <div className="grid gap-1.5 sm:grid-cols-2">
                            {restrictions.map((item) => (
                              <div key={item.key} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-2.5 py-2 text-xs dark:border-gray-800 dark:bg-gray-950">
                                {item.status === "allowed" ? (
                                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                )}
                                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                                <span className={`ml-auto text-[10px] font-bold uppercase tracking-wide ${item.status === "allowed" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                  {item.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : audit.encrypted ? (
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          No readable permission flags were found. The file is encrypted; the lossless engine can still remove the password.
                        </p>
                      ) : (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-xs leading-relaxed text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          This PDF is not encrypted. You can still use the output options to optimise, linearise, scrub metadata or flatten annotations.
                        </div>
                      )}

                      {audit.securityHandler ? (
                        <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
                          Security handler revision R={audit.securityHandler}. Algorithm detection comes from qpdf&apos;s encryption report.
                        </p>
                      ) : null}

                      {passwordProblem ? (
                        <button
                          type="button"
                          onClick={() => document.getElementById("pdf-password")?.focus()}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-300"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Enter a password and re-check
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose a PDF to see its audit.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">What this tool does — and does not do</h2>
                </div>
                <div className="mt-3 grid gap-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400 sm:grid-cols-2">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    Removes document-open passwords when you know the user or owner password.
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    Removes print, copy and edit restrictions from files you own.
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    Never guesses or cracks a password. You must provide one for protected files.
                  </p>
                  <p className="flex items-start gap-2">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    Do not use it to bypass access controls on documents you do not own.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
              <div className="flex items-center gap-2">
                <FileLock2 className="h-4 w-4 text-sky-500" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">A real PDF security audit, not a fake progress bar</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <Lock className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                  <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Encryption report</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">See AES-256, AES-128, RC4 or unencrypted status before you change anything.</p>
                </div>
                <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
                  <Layers className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                  <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Permission matrix</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">Printing, copying, forms, annotations and editing restrictions are listed explicitly.</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <ArrowDownToLine className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                  <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Verified output</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">The lossless result is structurally checked before download. No watermarks.</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Passwords are kept in the password input only. They are never written to localStorage, analytics or a server.
              </div>
            </div>
          )}
        </main>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        qpdf and pdf.js run locally via WebAssembly. ToolsTrek cannot recover a forgotten password — only remove protection when you know it.
      </p>
    </ToolPageShell>
  );
}
