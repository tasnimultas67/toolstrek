"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import jsQR from "jsqr";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  Copy,
  Upload,
  QrCode,
  Scan,
  XCircle,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ImageIcon,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ToolPageShell from "./ToolPageShell";
import { cn } from "@/lib/utils";

/* ─── decode helpers ──────────────────────────────────────── */

const imageToCanvas = (img, scale = 1) => {
  const canvas = document.createElement("canvas");
  canvas.width = (img.naturalWidth || img.width) * scale;
  canvas.height = (img.naturalHeight || img.height) * scale;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const scanWithFilter = (canvas, contrast = 1, brightness = 1) => {
  const w = canvas.width;
  const h = canvas.height;
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d");
  ctx.filter = `contrast(${contrast}) brightness(${brightness})`;
  ctx.drawImage(canvas, 0, 0);
  const id = ctx.getImageData(0, 0, w, h);
  return jsQR(id.data, id.width, id.height, { inversionAttempts: "attemptBoth" });
};

const tryZXing = async (imgElement) => {
  try {
    const { BrowserQRCodeReader } = await import("@zxing/library");
    const reader = new BrowserQRCodeReader();
    const result = await reader.decodeFromImageElement(imgElement);
    return result?.getText() ?? null;
  } catch {
    return null;
  }
};

/**
 * 5-strategy multi-fallback decoder:
 * 1. jsQR at native size
 * 2. jsQR at 2× upscale (helps low-res images)
 * 3. jsQR with contrast boost
 * 4. jsQR with extreme contrast
 * 5. ZXing decodeFromImageElement
 */
const decodeQR = async (imgElement) => {
  const canvas = imageToCanvas(imgElement);

  // Strategy 1 – native size
  const ctx = canvas.getContext("2d");
  const id1 = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const r1 = jsQR(id1.data, id1.width, id1.height, { inversionAttempts: "attemptBoth" });
  if (r1) return r1.data;

  // Strategy 2 – 2× upscale
  if (canvas.width < 800) {
    const big = imageToCanvas(imgElement, 2);
    const bctx = big.getContext("2d");
    const id2 = bctx.getImageData(0, 0, big.width, big.height);
    const r2 = jsQR(id2.data, id2.width, id2.height, { inversionAttempts: "attemptBoth" });
    if (r2) return r2.data;
  }

  // Strategy 3 – moderate contrast boost
  const r3 = scanWithFilter(canvas, 2, 1.1);
  if (r3) return r3.data;

  // Strategy 4 – high contrast
  const r4 = scanWithFilter(canvas, 4, 1.2);
  if (r4) return r4.data;

  // Strategy 5 – ZXing
  return await tryZXing(imgElement);
};

/* ─── type detection ──────────────────────────────────────── */

const isUrl = (text) => {
  try { new URL(text); return true; } catch { return false; }
};

const detectType = (text) => {
  if (!text) return "text";
  if (isUrl(text)) return "url";
  if (text.startsWith("mailto:")) return "email";
  if (text.startsWith("WIFI:")) return "wifi";
  if (text.startsWith("BEGIN:VCARD")) return "vcard";
  if (text.startsWith("tel:")) return "phone";
  return "text";
};

const TYPE_META = {
  url:   { label: "URL",     icon: Globe,        color: "blue"   },
  email: { label: "Email",   icon: Zap,          color: "purple" },
  wifi:  { label: "Wi-Fi",   icon: Zap,          color: "cyan"   },
  vcard: { label: "vCard",   icon: Shield,        color: "indigo" },
  phone: { label: "Phone",   icon: Shield,        color: "green"  },
  text:  { label: "Text",    icon: QrCode,        color: "gray"   },
};

/* ─── component ───────────────────────────────────────────── */

const QRScanner = () => {
  const [mode, setMode] = useState("upload");
  const videoRef = useRef(null);
  const [result, setResult] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // 'success' | 'error' | null
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("qr-scan-history") || "[]");
      setHistory(saved.slice(0, 5));
    } catch {}
  }, []);

  const saveToHistory = (text) => {
    try {
      const saved = JSON.parse(localStorage.getItem("qr-scan-history") || "[]");
      const updated = [{ text, time: Date.now() }, ...saved.filter((e) => e.text !== text)].slice(0, 5);
      localStorage.setItem("qr-scan-history", JSON.stringify(updated));
      setHistory(updated);
    } catch {}
  };

  const reset = () => {
    setResult("");
    setUploadedFile(null);
    setScanStatus(null);
    setIsScanning(false);
  };

  /* ── webcam capture ── */
  const captureImage = useCallback(async () => {
    if (!videoRef.current) return;
    const imageSrc = videoRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsScanning(true);
    setScanStatus(null);
    setResult("");

    const img = new Image();
    img.src = imageSrc;
    img.onload = async () => {
      const decoded = await decodeQR(img);
      setIsScanning(false);
      if (decoded) {
        setResult(decoded);
        setScanStatus("success");
        saveToHistory(decoded);
        toast.success("QR Code detected!");
      } else {
        setScanStatus("error");
        setResult("No QR Code detected.");
        toast.error("Scan failed", { description: "Try a clearer angle or better lighting." });
      }
    };
  }, []);

  /* ── file upload ── */
  const handleFileUpload = async (file) => {
    const imgUrl = URL.createObjectURL(file);
    setUploadedFile(imgUrl);
    setIsScanning(true);
    setScanStatus(null);
    setResult("");

    const img = new Image();
    img.src = imgUrl;
    img.onload = async () => {
      const decoded = await decodeQR(img);
      setIsScanning(false);
      if (decoded) {
        setResult(decoded);
        setScanStatus("success");
        saveToHistory(decoded);
        toast.success("QR Code scanned!");
      } else {
        setScanStatus("error");
        setResult("No QR Code found in this image.");
        toast.error("Could not detect a QR code", { description: "Try a higher-quality image." });
      }
    };
    img.onerror = () => {
      setIsScanning(false);
      setScanStatus("error");
      setResult("Failed to load image.");
      toast.error("Image load failed");
    };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"] },
    maxSize: 10 * 1024 * 1024,
    onDrop: (accepted) => { if (accepted.length > 0) handleFileUpload(accepted[0]); },
  });

  const copyToClipboard = () => {
    if (!result || scanStatus !== "success") return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const contentType = detectType(result);
  const typeMeta = TYPE_META[contentType];

  /* ─── render ── */
  return (
    <ToolPageShell widthClassName="max-w-5xl mx-auto">
      <div className="space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-semibold mb-2">
            <Scan size={14} />
            QR Code Scanner
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Decode Any{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              QR Code
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">
            Upload an image or use your camera — results appear instantly
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-2xl">
            {[
              { id: "upload", label: "Upload Image", icon: Upload },
              { id: "camera", label: "Camera",       icon: Camera },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setMode(id); reset(); }}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
                  mode === id
                    ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Left: Interaction Panel ── */}
          <div className="lg:col-span-3">
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {mode === "camera" ? (
                    <motion.div key="camera" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-gray-200 dark:border-gray-700">
                        <Webcam
                          ref={videoRef}
                          screenshotFormat="image/png"
                          className="w-full h-full object-cover"
                          videoConstraints={{ facingMode: "environment" }}
                        />
                        <div className="absolute inset-0 pointer-events-none">
                          <motion.div
                            animate={{ top: ["8%", "88%", "8%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            style={{ position: "absolute", left: "1rem", right: "1rem", height: "2px" }}
                            className="bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                          />
                          {["top-3 left-3 border-t-2 border-l-2 rounded-tl-lg", "top-3 right-3 border-t-2 border-r-2 rounded-tr-lg", "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg", "bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg"].map((cls, i) => (
                            <div key={i} className={cn("absolute w-6 h-6 border-violet-500", cls)} />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={captureImage}
                        disabled={isScanning}
                        className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-base transition-all active:scale-95 shadow-lg shadow-violet-200 dark:shadow-violet-900/30 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isScanning ? <><RefreshCw size={18} className="animate-spin" /> Analyzing…</> : <><Scan size={18} /> Capture &amp; Scan</>}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                      {!uploadedFile ? (
                        <div
                          {...getRootProps()}
                          className={cn(
                            "relative cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-200 min-h-[280px] group",
                            isDragActive
                              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600 bg-gray-50/50 dark:bg-gray-800/30"
                          )}
                        >
                          <input {...getInputProps()} />
                          <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }} className="flex flex-col items-center gap-4">
                            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200", isDragActive ? "bg-violet-100 dark:bg-violet-800" : "bg-white dark:bg-gray-800 shadow-md group-hover:shadow-lg")}>
                              <ImageIcon size={36} className={cn("transition-colors", isDragActive ? "text-violet-600" : "text-gray-400 group-hover:text-violet-500")} />
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-gray-700 dark:text-gray-200 text-base">
                                {isDragActive ? "Drop your QR image here" : "Drag & drop your QR image"}
                              </p>
                              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                or <span className="text-violet-600 dark:text-violet-400 font-semibold">browse files</span>
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">
                                PNG, JPG, JPEG, GIF, WebP, BMP · Max 10 MB
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 min-h-[280px] flex items-center justify-center">
                          <img src={uploadedFile} alt="Uploaded QR Code" className="max-h-72 max-w-full object-contain" />
                          {isScanning && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                              <div className="flex flex-col items-center gap-3 text-white">
                                <RefreshCw size={32} className="animate-spin text-violet-400" />
                                <span className="font-semibold text-sm">Scanning…</span>
                              </div>
                            </div>
                          )}
                          <button onClick={reset} className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black text-white rounded-full transition-colors">
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}

                      {uploadedFile && !isScanning && (
                        <button
                          onClick={reset}
                          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 font-semibold text-sm transition-all"
                        >
                          <Upload size={15} /> Upload another image
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tips card */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-start gap-4 shadow-lg shadow-violet-200 dark:shadow-violet-900/20">
              <div className="p-2 bg-white/15 rounded-xl flex-shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">Pro Tips for Better Scans</p>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  The scanner uses 5 automatic strategies including upscaling, contrast enhancement and ZXing fallback — so even low-quality images often work.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: Results Panel ── */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden">
                  {/* Status bar */}
                  <div className={cn("px-6 py-4 flex items-center gap-3 border-b",
                    scanStatus === "success"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30"
                      : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30"
                  )}>
                    {scanStatus === "success"
                      ? <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                      : <AlertCircle size={20} className="text-red-500 flex-shrink-0" />}
                    <span className={cn("font-bold text-sm", scanStatus === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                      {scanStatus === "success" ? "Scan Successful" : "No QR Code Found"}
                    </span>
                    {scanStatus === "success" && (
                      <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        <typeMeta.icon size={11} />
                        {typeMeta.label}
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div className={cn("p-4 rounded-2xl font-mono text-sm break-all leading-relaxed",
                      scanStatus === "success"
                        ? "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700"
                        : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    )}>
                      {result}
                    </div>

                    {scanStatus === "success" && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={copyToClipboard}
                          className={cn("h-11 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm border transition-all",
                            copied
                              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400"
                              : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 bg-white dark:bg-gray-800"
                          )}
                        >
                          {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        {isUrl(result) ? (
                          <button
                            onClick={() => window.open(result, "_blank")}
                            className="h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                          >
                            <ExternalLink size={15} /> Open URL
                          </button>
                        ) : (
                          <button
                            onClick={reset}
                            className="h-11 flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm transition-all"
                          >
                            <RefreshCw size={15} /> Scan Again
                          </button>
                        )}
                      </div>
                    )}

                    {scanStatus === "error" && (
                      <button
                        onClick={reset}
                        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm transition-all"
                      >
                        <RefreshCw size={15} /> Try Again
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-10 flex flex-col items-center justify-center text-center min-h-[220px]">
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <QrCode size={28} className="text-violet-500 animate-pulse" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 dark:text-gray-200">Analyzing image…</p>
                        <p className="text-sm text-gray-400 mt-1">Trying multiple decode strategies</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Scan size={28} className="text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="font-bold text-gray-400 dark:text-gray-500">Result will appear here</p>
                      <p className="text-sm text-gray-400 dark:text-gray-600 mt-1 max-w-[180px]">Upload a QR code image to start scanning</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan History */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">Recent Scans</span>
                  <button onClick={() => { localStorage.removeItem("qr-scan-history"); setHistory([]); }} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                    Clear
                  </button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {history.map((entry, i) => (
                    <button
                      key={i}
                      onClick={() => { setResult(entry.text); setScanStatus("success"); }}
                      className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex-shrink-0 flex items-center justify-center">
                        <QrCode size={13} className="text-violet-500" />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">{entry.text}</span>
                      <Copy size={13} className="text-gray-300 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feature badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Zap,          label: "5 Strategies", sub: "Auto fallback"  },
                { icon: Shield,       label: "Private",      sub: "No uploads"     },
                { icon: CheckCircle2, label: "All Formats",  sub: "URL, WiFi, text"},
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 text-center">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-2">
                    <Icon size={14} className="text-violet-500" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
};

export default QRScanner;
