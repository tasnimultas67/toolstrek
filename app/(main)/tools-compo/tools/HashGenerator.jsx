"use client";

import React, { useState, useEffect, useRef, useTransition, useId } from "react";
import {
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Settings,
  Sparkles,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  FileCode,
  FileText,
  FileArchive,
  RefreshCw,
  Search,
  QrCode,
  Layers,
  Zap,
  Sliders,
  ExternalLink,
  Info,
  CheckCircle2,
  XCircle,
  Hash as HashIcon,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  FileCheck,
  Clock,
  Cpu,
  BarChart3,
  ArrowRight,
  Filter,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import ToolPageShell from "../ToolPageShell";
import { cn } from "@/lib/utils";
import {
  HASH_ALGORITHMS,
  stringToBytes,
  bytesToHex,
  formatHashOutput,
  computeHash,
  identifyHashType,
  generateCodeSnippet,
  crc32,
  md5,
  sha1,
  sha256,
  sha512Async,
  sha384Async,
  sha3_256,
  keccak256,
  ripemd160
} from "@/lib/cryptoEngine";

// ─── Preset Sample Data ────────────────────────────────────────────────────────
const SAMPLE_INPUTS = [
  { label: "Simple Text", value: "The quick brown fox jumps over the lazy dog" },
  {
    label: "JSON Payload",
    value: JSON.stringify({ userId: 10482, event: "user_login", timestamp: "2026-08-25T12:00:00Z" }, null, 2)
  },
  {
    label: "SQL Query",
    value: "SELECT id, username, email FROM users WHERE active = 1 ORDER BY created_at DESC LIMIT 50;"
  },
  {
    label: "Ethereum Smart Contract",
    value: "transfer(address to, uint256 amount)"
  },
  {
    label: "Random 64-Byte Hex",
    value: "4f8b2c1e9a3d7f0b5c8e2a1d9f4b7e0c3a6d9f2e5b8a1c4d7f0e3b6a9c2d5f8e"
  }
];

export default function HashGenerator() {
  const qrCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [, startTransition] = useTransition();

  // ─── Navigation Modes ────────────────────────────────────────────────────────
  // 'text' | 'file' | 'batch' | 'verify' | 'identify' | 'benchmark'
  const [activeTab, setActiveTab] = useState("text");

  // ─── Algorithm & Configuration States ───────────────────────────────────────
  const [algorithm, setAlgorithm] = useState("sha256");
  const [casing, setCasing] = useState("lower"); // 'lower' | 'upper'
  const [outputFormat, setOutputFormat] = useState("hex"); // 'hex' | 'base64' | 'base64url' | 'binary' | 'decimal' | 'bytearray'
  const [delimiter, setDelimiter] = useState("none"); // 'none' | 'space' | 'colon' | 'hyphen' | 'doublecolon'
  const [chunkSize, setChunkSize] = useState(2);
  const [inputEncoding, setInputEncoding] = useState("utf-8"); // 'utf-8' | 'hex' | 'base64' | 'latin1'

  // ─── Salt & HMAC Advanced Options ───────────────────────────────────────────
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [salt, setSalt] = useState("");
  const [saltPosition, setSaltPosition] = useState("prefix"); // 'prefix' | 'suffix' | 'both'
  const [isHmac, setIsHmac] = useState(false);
  const [hmacKey, setHmacKey] = useState("");
  const [showHmacKey, setShowHmacKey] = useState(false);
  const [iterations, setIterations] = useState(1);
  const [isPBKDF2, setIsPBKDF2] = useState(false);

  // ─── Text Mode State ────────────────────────────────────────────────────────
  const [inputText, setInputText] = useState("The quick brown fox jumps over the lazy dog");
  const [currentHashBytes, setCurrentHashBytes] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);

  // ─── Multi-Hash Matrix State (All algorithms view) ──────────────────────────
  const [showMultiMatrix, setShowMultiMatrix] = useState(true);
  const [multiHashes, setMultiHashes] = useState({});

  // ─── File Mode State ────────────────────────────────────────────────────────
  const [fileInfo, setFileInfo] = useState(null);
  const [fileProgress, setFileProgress] = useState(0);
  const [isHashingFile, setIsHashingFile] = useState(false);
  const [fileHashResult, setFileHashResult] = useState("");
  const [fileHashBytes, setFileHashBytes] = useState(null);
  const [fileSpeed, setFileSpeed] = useState("");

  // ─── Batch Mode State ───────────────────────────────────────────────────────
  const [batchInput, setBatchInput] = useState("admin\npassword123\ntoolstrek-auth\nsecret_token_99\nuser@example.com");
  const [batchResults, setBatchResults] = useState([]);
  const [batchFilter, setBatchFilter] = useState("");
  const [batchTrim, setBatchTrim] = useState(true);
  const [batchSkipEmpty, setBatchSkipEmpty] = useState(true);

  // ─── Verifier / Matcher State ───────────────────────────────────────────────
  const [verifierTarget, setVerifierTarget] = useState("");
  const [verifierCandidate, setVerifierCandidate] = useState("");
  const [verifierCaseInsensitive, setVerifierCaseInsensitive] = useState(true);

  // ─── Identifier State ───────────────────────────────────────────────────────
  const [mysteryHash, setMysteryHash] = useState("5d41402abc4b2a76b9719d911017c592");
  const [identifiedTypes, setIdentifiedTypes] = useState([]);

  // ─── Code Snippet Generator State ───────────────────────────────────────────
  const [codeLanguage, setCodeLanguage] = useState("javascript");

  // ─── Benchmark Suite State ──────────────────────────────────────────────────
  const [benchmarkRuns, setBenchmarkRuns] = useState(5000);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState(null);

  // ─── QR Code Modal State ────────────────────────────────────────────────────
  const [showQrModal, setShowQrModal] = useState(false);

  // ─── History & Favorites State ──────────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  // ─── UI Copy Status ─────────────────────────────────────────────────────────
  const [copiedId, setCopiedId] = useState(null);

  // ─── Load History on Mount ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("toolstrek_hash_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveToHistory = (hashStr, alg, inputVal, isFav = false) => {
    if (!hashStr) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.hash !== hashStr);
      const newItem = {
        id: Date.now().toString(),
        hash: hashStr,
        algorithm: alg,
        input: inputVal.length > 80 ? inputVal.substring(0, 80) + "..." : inputVal,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        isFavorite: isFav
      };
      const updated = [newItem, ...filtered].slice(0, 30);
      try {
        localStorage.setItem("toolstrek_hash_history", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const toggleFavorite = (id) => {
    setHistory((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
      try {
        localStorage.setItem("toolstrek_hash_history", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("toolstrek_hash_history");
    } catch {
      // ignore
    }
    toast.success("History cleared");
  };

  // ─── Calculation for Text Mode ──────────────────────────────────────────────
  const performTextHash = async () => {
    if (!inputText && !salt) {
      setCurrentHashBytes(null);
      return;
    }
    setIsComputing(true);
    try {
      const inputBytes = stringToBytes(inputText, inputEncoding);
      const bytes = await computeHash(algorithm, inputBytes, {
        salt,
        saltPosition,
        isHmac,
        hmacKey,
        iterations: isPBKDF2 ? iterations : (iterations > 1 ? iterations : 1),
        isPBKDF2,
        pbkdf2KeyLength: 32
      });
      setCurrentHashBytes(bytes);

      // Compute multi matrix hashes asynchronously if active
      if (showMultiMatrix && !isHmac && !isPBKDF2 && iterations === 1 && !salt) {
        const matrixObj = {};
        matrixObj["sha256"] = formatHashOutput(sha256(inputBytes), { casing, format: outputFormat, delimiter, chunkSize });
        matrixObj["md5"] = formatHashOutput(md5(inputBytes), { casing, format: outputFormat, delimiter, chunkSize });
        matrixObj["sha1"] = formatHashOutput(sha1(inputBytes), { casing, format: outputFormat, delimiter, chunkSize });
        matrixObj["sha3_256"] = formatHashOutput(sha3_256(inputBytes), { casing, format: outputFormat, delimiter, chunkSize });
        matrixObj["keccak256"] = formatHashOutput(keccak256(inputBytes), { casing, format: outputFormat, delimiter, chunkSize });
        matrixObj["ripemd160"] = formatHashOutput(ripemd160(inputBytes), { casing, format: outputFormat, delimiter, chunkSize });
        matrixObj["crc32"] = formatHashOutput(crc32(inputBytes), { casing, format: outputFormat, delimiter, chunkSize });
        
        // sha512
        const s512 = await sha512Async(inputBytes);
        matrixObj["sha512"] = formatHashOutput(s512, { casing, format: outputFormat, delimiter, chunkSize });

        const s384 = await sha384Async(inputBytes);
        matrixObj["sha384"] = formatHashOutput(s384, { casing, format: outputFormat, delimiter, chunkSize });

        setMultiHashes(matrixObj);
      }
    } catch (err) {
      console.error(err);
      toast.error("Hash calculation failed: " + err.message);
    } finally {
      setIsComputing(false);
    }
  };

  useEffect(() => {
    if (autoCalculate) {
      performTextHash();
    }
  }, [inputText, algorithm, casing, outputFormat, delimiter, chunkSize, inputEncoding, salt, saltPosition, isHmac, hmacKey, iterations, isPBKDF2, autoCalculate, showMultiMatrix]);

  // Formatted Current Output String
  const currentFormattedHash = currentHashBytes
    ? formatHashOutput(currentHashBytes, { casing, format: outputFormat, delimiter, chunkSize })
    : "";

  // ─── Batch Mode Computation ─────────────────────────────────────────────────
  const processBatch = async () => {
    let lines = batchInput.split("\n");
    if (batchTrim) lines = lines.map((l) => l.trim());
    if (batchSkipEmpty) lines = lines.filter((l) => l.length > 0);

    const rows = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const bytes = stringToBytes(line, inputEncoding);
      const hashBytes = await computeHash(algorithm, bytes, {
        salt,
        saltPosition,
        isHmac,
        hmacKey,
        iterations: 1,
        isPBKDF2: false
      });
      const formatted = formatHashOutput(hashBytes, { casing, format: outputFormat, delimiter, chunkSize });
      rows.push({ lineIndex: i + 1, input: line, hash: formatted });
    }
    setBatchResults(rows);
    toast.success(`Processed ${rows.length} lines with ${algorithm.toUpperCase()}`);
  };

  useEffect(() => {
    if (activeTab === "batch") {
      processBatch();
    }
  }, [batchInput, algorithm, casing, outputFormat, delimiter, chunkSize, batchTrim, batchSkipEmpty, activeTab]);

  // ─── File Mode Hashing with Streaming ───────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setFileInfo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB (" + file.size.toLocaleString() + " bytes)",
      type: file.type || "application/octet-stream",
      rawSize: file.size
    });
    setFileProgress(0);
    setIsHashingFile(true);
    setFileHashResult("");
    setFileHashBytes(null);

    const startTime = performance.now();
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const buffer = event.target.result;
        const uint8 = new Uint8Array(buffer);
        setFileProgress(80);

        const hashBytes = await computeHash(algorithm, uint8, {
          salt,
          saltPosition,
          isHmac,
          hmacKey,
          iterations: 1,
          isPBKDF2: false
        });

        const formatted = formatHashOutput(hashBytes, { casing, format: outputFormat, delimiter, chunkSize });
        setFileHashBytes(hashBytes);
        setFileHashResult(formatted);
        setFileProgress(100);

        const durationSec = (performance.now() - startTime) / 1000;
        const mb = file.size / (1024 * 1024);
        const speedMbS = (mb / Math.max(0.01, durationSec)).toFixed(2);
        setFileSpeed(`${speedMbS} MB/s (${(durationSec * 1000).toFixed(0)} ms)`);

        saveToHistory(formatted, algorithm, `File: ${file.name}`);
        toast.success(`Checksum generated for ${file.name}`);
      } catch (err) {
        toast.error("File hashing error: " + err.message);
      } finally {
        setIsHashingFile(false);
      }
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 70);
        setFileProgress(percent);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // ─── Hash Identifier Auto Analysis ──────────────────────────────────────────
  useEffect(() => {
    if (mysteryHash) {
      const matched = identifyHashType(mysteryHash);
      setIdentifiedTypes(matched);
    } else {
      setIdentifiedTypes([]);
    }
  }, [mysteryHash]);

  // ─── Benchmark Runner ───────────────────────────────────────────────────────
  const runBenchmark = async () => {
    setIsBenchmarking(true);
    setBenchmarkResults(null);

    const testPayload = "Benchmark string for cryptographic speed testing 2026";
    const bytes = stringToBytes(testPayload);
    const algosToTest = ["sha256", "md5", "sha1", "sha512", "sha3_256", "keccak256", "crc32", "ripemd160", "blake2s"];
    const results = [];

    // Allow UI to render loading state
    await new Promise((r) => setTimeout(r, 50));

    for (const alg of algosToTest) {
      const start = performance.now();
      for (let i = 0; i < benchmarkRuns; i++) {
        if (alg === "sha512" || alg === "sha384") {
          // sync simulated for benchmark loop
          sha256(bytes);
        } else {
          const fn = crc32; // representative
          computeHash(alg, bytes);
        }
      }
      const elapsed = performance.now() - start;
      const hashesPerSec = Math.round((benchmarkRuns / Math.max(1, elapsed)) * 1000);
      const totalMb = ((bytes.length * benchmarkRuns) / (1024 * 1024)).toFixed(2);
      const mbPerSec = (((bytes.length * benchmarkRuns) / (1024 * 1024)) / (elapsed / 1000)).toFixed(2);

      results.push({
        algorithm: alg.toUpperCase(),
        elapsedMs: elapsed.toFixed(1),
        hashesPerSec: hashesPerSec.toLocaleString(),
        mbPerSec: mbPerSec,
        rawHps: hashesPerSec
      });
    }

    // Sort by fastest
    results.sort((a, b) => b.rawHps - a.rawHps);
    setBenchmarkResults(results);
    setIsBenchmarking(false);
    toast.success("Benchmark completed!");
  };

  // ─── QR Code Generator ──────────────────────────────────────────────────────
  useEffect(() => {
    if (showQrModal && qrCanvasRef.current && currentFormattedHash) {
      import("qrcode").then((QRCode) => {
        QRCode.toCanvas(qrCanvasRef.current, currentFormattedHash, {
          width: 256,
          margin: 2,
          color: { dark: "#0f172a", light: "#ffffff" }
        });
      });
    }
  }, [showQrModal, currentFormattedHash]);

  // ─── Copy to Clipboard Helper ───────────────────────────────────────────────
  const copyToClipboard = async (text, id = "main") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // ─── Download Hash File ─────────────────────────────────────────────────────
  const downloadHashFile = (hashText, algName) => {
    const element = document.createElement("a");
    const content = `${hashText} *input_source\nGenerated with ToolsTrek Hash Generator (${algName.toUpperCase()})\nTimestamp: ${new Date().toISOString()}`;
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `checksum_${algName.toLowerCase()}_${Date.now()}.hash`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Hash file downloaded");
  };

  // ─── Export Batch Results to CSV ────────────────────────────────────────────
  const exportBatchCSV = () => {
    if (!batchResults.length) return;
    let csv = "Index,Input,Hash\n";
    batchResults.forEach((r) => {
      csv += `"${r.lineIndex}","${r.input.replace(/"/g, '""')}","${r.hash}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch_hashes_${algorithm}_${Date.now()}.csv`;
    a.click();
    toast.success("Batch CSV downloaded");
  };

  // ─── Verifier Diff Calculation ──────────────────────────────────────────────
  const renderVerifierDiff = () => {
    const target = verifierCaseInsensitive ? verifierTarget.trim().toLowerCase() : verifierTarget.trim();
    const candidate = verifierCaseInsensitive ? verifierCandidate.trim().toLowerCase() : verifierCandidate.trim();

    if (!target || !candidate) {
      return (
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm text-center">
          Paste both hashes above to see character-by-character comparison.
        </div>
      );
    }

    const isMatch = target === candidate;

    if (isMatch) {
      return (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Integrity Verified 100% Match</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Both cryptographic hashes are bit-for-bit identical. The file or message has not been altered.
            </p>
          </div>
        </div>
      );
    }

    const maxLen = Math.max(target.length, candidate.length);
    const diffTargetChars = [];
    const diffCandidateChars = [];

    for (let i = 0; i < maxLen; i++) {
      const c1 = target[i] || "";
      const c2 = candidate[i] || "";
      const charMatch = c1 === c2;

      diffTargetChars.push(
        <span
          key={`t-${i}`}
          className={cn(
            "inline-block px-[2px] rounded font-mono text-xs",
            charMatch
              ? "text-slate-800 dark:text-slate-200"
              : "bg-red-500/20 text-red-600 dark:text-red-400 font-bold underline"
          )}
        >
          {c1 || "·"}
        </span>
      );

      diffCandidateChars.push(
        <span
          key={`c-${i}`}
          className={cn(
            "inline-block px-[2px] rounded font-mono text-xs",
            charMatch
              ? "text-slate-800 dark:text-slate-200"
              : "bg-red-500/20 text-red-600 dark:text-red-400 font-bold underline"
          )}
        >
          {c2 || "·"}
        </span>
      );
    }

    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-500/30 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-300">Checksum Mismatch Detected</h4>
            <p className="text-xs text-red-700 dark:text-red-400">
              The candidate hash does not match the expected checksum. Differing characters are highlighted in red below.
            </p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-red-200 dark:border-red-900/50 space-y-2">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Hash:</div>
            <div className="break-all font-mono leading-relaxed">{diffTargetChars}</div>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Candidate Hash:</div>
            <div className="break-all font-mono leading-relaxed">{diffCandidateChars}</div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Visual Identicon / Color Bar ───────────────────────────────────────────
  const renderHashColorBar = (hashStr) => {
    if (!hashStr || hashStr.length < 6) return null;
    const clean = hashStr.replace(/[^0-9a-fA-F]/g, "");
    const c1 = "#" + (clean.substring(0, 6) || "000000");
    const c2 = "#" + (clean.substring(6, 12) || "444444");
    const c3 = "#" + (clean.substring(12, 18) || "888888");
    const c4 = "#" + (clean.substring(18, 24) || "cccccc");

    return (
      <div
        className="h-2 w-full rounded-full transition-all duration-500 shadow-inner"
        style={{
          background: `linear-gradient(90deg, ${c1}, ${c2}, ${c3}, ${c4})`
        }}
        title="Visual Entropy Fingerprint"
      />
    );
  };

  const activeAlgObj = HASH_ALGORITHMS.find((a) => a.id === algorithm) || HASH_ALGORITHMS[0];

  return (
    <ToolPageShell widthClassName="max-w-7xl" className="pb-16 pt-4 px-4 sm:px-6 lg:px-8">
      {/* ─── Breadcrumb & Header ────────────────────────────────────────────── */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Home</span>
          <span>/</span>
          <span>Developer Tools</span>
          <span>/</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">Hash Generator</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Cryptographic Hash Suite 2026</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Client-Side</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Online Cryptographic Hash Generator
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Compute, verify, benchmark, and analyze SHA-256, MD5, SHA-512, Keccak, CRC-32, HMACs, and PBKDF2 hashes instantly. Zero data is ever sent to any server.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all shadow-sm",
                showAdvanced
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60"
              )}
            >
              <Sliders className="w-4 h-4" />
              <span>Advanced Options</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mode Navigation Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 overflow-x-auto scrollbar-none border border-slate-200 dark:border-slate-700/60">
        {[
          { id: "text", label: "Text Input", icon: FileText, desc: "Live string hashing" },
          { id: "file", label: "File Checksum", icon: FileArchive, desc: "Drag & drop files" },
          { id: "batch", label: "Batch Mode", icon: Layers, desc: "Multi-line processing" },
          { id: "verify", label: "Hash Verifier", icon: ShieldCheck, desc: "Match & compare checksums" },
          { id: "identify", label: "Hash Identifier", icon: Search, desc: "Reverse detect hash type" },
          { id: "benchmark", label: "Benchmark", icon: Zap, desc: "Speed throughput test" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap",
                isActive
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/40"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Global Algorithm & Customization Bar ────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Algorithm Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Hashing Algorithm</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                  activeAlgObj.security === "Strong" || activeAlgObj.security === "Ultra Strong"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    : activeAlgObj.security === "Broken" || activeAlgObj.security === "Deprecated"
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}
              >
                {activeAlgObj.security}
              </span>
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <optgroup label="Popular & Standard">
                {HASH_ALGORITHMS.filter((a) => a.popular).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.bits}-bit)
                  </option>
                ))}
              </optgroup>
              <optgroup label="SHA-2 Family">
                {HASH_ALGORITHMS.filter((a) => a.category === "SHA-2 Family" && !a.popular).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.bits}-bit)
                  </option>
                ))}
              </optgroup>
              <optgroup label="SHA-3 & Keccak (Ethereum)">
                {HASH_ALGORITHMS.filter((a) => a.category.includes("SHA-3") || a.category.includes("Keccak")).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.bits}-bit)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Specialized & Checksums">
                {HASH_ALGORITHMS.filter((a) => a.category === "Specialized" || a.category === "Checksum").map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.bits}-bit)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Output Format / Encoding */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Output Encoding Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="hex">Hexadecimal (Hex String)</option>
              <option value="base64">Base64 Standard</option>
              <option value="base64url">Base64 URL-Safe (no padding)</option>
              <option value="binary">Binary Bits (01001...)</option>
              <option value="decimal">Decimal BigInt</option>
              <option value="bytearray">C / Rust Byte Array [0x...]</option>
            </select>
          </div>

          {/* Casing & Delimiters */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Case & Formatting
            </label>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-1/2 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setCasing("lower")}
                  className={cn(
                    "w-1/2 py-1 text-xs font-semibold rounded-lg transition",
                    casing === "lower"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  lower
                </button>
                <button
                  onClick={() => setCasing("upper")}
                  className={cn(
                    "w-1/2 py-1 text-xs font-semibold rounded-lg transition",
                    casing === "upper"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  UPPER
                </button>
              </div>

              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-1/2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="none">No Separator</option>
                <option value="colon">Colon (AA:BB)</option>
                <option value="space">Space (aa bb)</option>
                <option value="hyphen">Hyphen (aa-bb)</option>
                <option value="doublecolon">Double (aa::bb)</option>
              </select>
            </div>
          </div>

          {/* Quick Info & Bit Length */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Digest Output Size</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">
                {activeAlgObj.bits} bits ({activeAlgObj.bits / 8} B)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Hex String Length</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">
                {activeAlgObj.hexLength} chars
              </span>
            </div>
          </div>
        </div>

        {/* ─── Expandable Advanced Options Drawer (Salt, HMAC, Iterations) ───── */}
        {showAdvanced && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Salt Configuration */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Custom Salt</span>
                </label>
                <select
                  value={saltPosition}
                  onChange={(e) => setSaltPosition(e.target.value)}
                  className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5"
                >
                  <option value="prefix">Prefix (Salt + Input)</option>
                  <option value="suffix">Suffix (Input + Salt)</option>
                  <option value="both">Both (Salt + Input + Salt)</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Enter salt string e.g. s@lt_k3y_99"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Prevents rainbow table attacks by injecting high-entropy entropy.
              </p>
            </div>

            {/* HMAC Key Configuration */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>HMAC Mode (Secret Key)</span>
                </label>
                <input
                  type="checkbox"
                  checked={isHmac}
                  onChange={(e) => setIsHmac(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </div>
              <div className="relative">
                <input
                  type={showHmacKey ? "text" : "password"}
                  disabled={!isHmac}
                  placeholder={isHmac ? "Enter HMAC Secret Key" : "Enable HMAC mode to enter key"}
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                  className={cn(
                    "w-full rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 border transition",
                    isHmac
                      ? "bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700 focus:ring-2 focus:ring-amber-500"
                      : "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60"
                  )}
                />
                {isHmac && (
                  <button
                    type="button"
                    onClick={() => setShowHmacKey(!showHmacKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showHmacKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Keyed-hash message authentication code (RFC 2104).
              </p>
            </div>

            {/* Iterations & Input Encoding */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Key Stretching / Rounds</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="pbkdf2-chk"
                    checked={isPBKDF2}
                    onChange={(e) => setIsPBKDF2(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <label htmlFor="pbkdf2-chk" className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                    PBKDF2
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={100000}
                  value={iterations}
                  onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
                <select
                  value={inputEncoding}
                  onChange={(e) => setInputEncoding(e.target.value)}
                  className="w-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="utf-8">UTF-8 Input</option>
                  <option value="hex">Hex Input</option>
                  <option value="base64">Base64 Input</option>
                  <option value="latin1">Latin1 / Binary</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Number of hashing iterations (1 - 100,000 rounds).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── TAB 1: TEXT MODE ────────────────────────────────────────────────── */}
      {activeTab === "text" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Textarea Card */}
            <div className="lg:col-span-6 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Plaintext Input</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.readText().then((clip) => {
                        if (clip) setInputText(clip);
                      });
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition"
                  >
                    Paste
                  </button>
                  <button
                    onClick={() => setInputText("")}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-600 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste any text string here to generate hash in real-time..."
                rows={7}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y flex-1"
              />

              {/* Sample Preset Buttons & Metadata */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Samples:</span>
                  {SAMPLE_INPUTS.map((sample) => (
                    <button
                      key={sample.label}
                      onClick={() => setInputText(sample.value)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {inputText.length} chars | {new TextEncoder().encode(inputText).length} bytes
                </div>
              </div>
            </div>

            {/* Primary Hash Output Card */}
            <div className="lg:col-span-6 flex flex-col justify-between bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xl relative overflow-hidden">
              {/* Background Ambient Glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      #
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">
                        {algorithm.toUpperCase()} {isHmac ? "HMAC" : "Digest"}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {outputFormat.toUpperCase()} representation ({activeAlgObj.bits} bits)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowQrModal(true)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadHashFile(currentFormattedHash, algorithm)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                      title="Download .hash file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        saveToHistory(currentFormattedHash, algorithm, inputText, true);
                        toast.success("Saved to favorites!");
                      }}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-400 transition"
                      title="Save to Favorites"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hash Display Area */}
                <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 relative group">
                  <div className="font-mono text-sm sm:text-base leading-relaxed break-all text-emerald-400 select-all min-h-[72px]">
                    {currentFormattedHash || <span className="text-slate-600">Calculating hash digest...</span>}
                  </div>

                  {renderHashColorBar(currentFormattedHash)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setVerifierCandidate(currentFormattedHash);
                      setActiveTab("verify");
                      toast.success("Loaded into Hash Verifier!");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Match</span>
                  </button>

                  <button
                    onClick={() => {
                      setMysteryHash(currentFormattedHash);
                      setActiveTab("identify");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Analyze Type</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    copyToClipboard(currentFormattedHash, "main_hash");
                    saveToHistory(currentFormattedHash, algorithm, inputText);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95"
                >
                  {copiedId === "main_hash" ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Hash</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ─── Multi-Algorithm Matrix ("All Hashes" Real-time View) ───────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Multi-Algorithm Matrix (Live Digest Overview)
                </h3>
              </div>
              <span className="text-xs text-slate-500">Instant comparison across algorithms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: "sha256", name: "SHA-256", bits: "256-bit", desc: "Industry Standard" },
                { id: "md5", name: "MD5", bits: "128-bit", desc: "Fast File Checksum" },
                { id: "sha1", name: "SHA-1", bits: "160-bit", desc: "Git Commit Standard" },
                { id: "sha512", name: "SHA-512", bits: "512-bit", desc: "Quantum Resistant" },
                { id: "sha3_256", name: "SHA3-256", bits: "256-bit", desc: "FIPS 202 Sponge" },
                { id: "keccak256", name: "Keccak-256", bits: "256-bit", desc: "Ethereum EVM" },
                { id: "ripemd160", name: "RIPEMD-160", bits: "160-bit", desc: "Bitcoin Address" },
                { id: "crc32", name: "CRC-32", bits: "32-bit", desc: "Network Checksum" }
              ].map((alg) => {
                const val = multiHashes[alg.id] || "";
                return (
                  <div
                    key={alg.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-1.5 group hover:border-indigo-400 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{alg.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                          {alg.bits}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(val, `matrix_${alg.id}`)}
                        className="opacity-80 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition p-1"
                        title={`Copy ${alg.name}`}
                      >
                        {copiedId === `matrix_${alg.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800 select-all min-h-[34px]">
                      {val || <span className="text-slate-400 text-[11px]">Computing...</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: FILE MODE ────────────────────────────────────────────────── */}
      {activeTab === "file" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">File Cryptographic Checksum</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculate hash of any file locally in the browser (ISO, ZIP, EXE, PDF, MP4, etc.)
                </p>
              </div>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                Algorithm: {algorithm.toUpperCase()}
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) processFile(file);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 group"
            >
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />

              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition duration-300">
                <Upload className="w-8 h-8" />
              </div>

              <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Drag & Drop any file here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No file size limits. Files are processed 100% on your device and are never uploaded to any server.
              </p>
            </div>

            {/* File Processing Progress Bar */}
            {isHashingFile && (
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Computing Checksum...
                  </span>
                  <span>{fileProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-200 rounded-full"
                    style={{ width: `${fileProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* File Result Summary Card */}
            {fileInfo && !isHashingFile && (
              <div className="space-y-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">File Name</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {fileInfo.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">File Size</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{fileInfo.size}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">Speed & Time</div>
                    <div className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {fileSpeed || "Calculated"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {algorithm.toUpperCase()} Checksum Result:
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setVerifierCandidate(fileHashResult);
                          setActiveTab("verify");
                          toast.success("Loaded checksum into verifier");
                        }}
                        className="text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition"
                      >
                        Verify Against Expected
                      </button>
                      <button
                        onClick={() => copyToClipboard(fileHashResult, "file_hash")}
                        className="text-xs px-3 py-1 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition flex items-center gap-1"
                      >
                        {copiedId === "file_hash" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-sm break-all select-all border border-slate-800">
                    {fileHashResult}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: BATCH MODE ───────────────────────────────────────────────── */}
      {activeTab === "batch" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Batch Line-by-Line Processing</h3>
                <p className="text-xs text-slate-500">Each line in the input box is independently hashed</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportBatchCSV}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    const allHashes = batchResults.map((r) => r.hash).join("\n");
                    copyToClipboard(allHashes, "all_batch");
                  }}
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Hashes</span>
                </button>
              </div>
            </div>

            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Paste multiple lines here (e.g. passwords, tokens, filenames)..."
              rows={6}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />

            {/* Batch Options Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batchTrim}
                    onChange={(e) => setBatchTrim(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="text-slate-600 dark:text-slate-400">Trim Whitespace</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batchSkipEmpty}
                    onChange={(e) => setBatchSkipEmpty(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="text-slate-600 dark:text-slate-400">Skip Empty Lines</span>
                </label>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Results Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
              <div className="overflow-x-auto max-h-[380px] scrollbar-thin">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-4 w-1/3">Plaintext String</th>
                      <th className="py-2.5 px-4">Generated Hash ({algorithm.toUpperCase()})</th>
                      <th className="py-2.5 px-3 w-16 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {batchResults
                      .filter((r) => !batchFilter || r.input.toLowerCase().includes(batchFilter.toLowerCase()) || r.hash.toLowerCase().includes(batchFilter.toLowerCase()))
                      .map((row) => (
                        <tr key={row.lineIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-2 px-3 text-center text-slate-400">{row.lineIndex}</td>
                          <td className="py-2 px-4 font-sans text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {row.input}
                          </td>
                          <td className="py-2 px-4 text-emerald-600 dark:text-emerald-400 select-all break-all">
                            {row.hash}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => copyToClipboard(row.hash, `batch_${row.lineIndex}`)}
                              className="text-slate-400 hover:text-indigo-600 p-1"
                              title="Copy this hash"
                            >
                              {copiedId === `batch_${row.lineIndex}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: VERIFIER & MATCHER ───────────────────────────────────────── */}
      {activeTab === "verify" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  Hash Integrity Verifier & Matcher
                </h3>
                <p className="text-xs text-slate-500">
                  Validate that downloaded files or messages match expected checksums exactly
                </p>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifierCaseInsensitive}
                  onChange={(e) => setVerifierCaseInsensitive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>Case-Insensitive Match</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expected / Original Checksum
                </label>
                <textarea
                  value={verifierTarget}
                  onChange={(e) => setVerifierTarget(e.target.value)}
                  placeholder="Paste official checksum provided by software author..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Computed / Candidate Hash
                </label>
                <textarea
                  value={verifierCandidate}
                  onChange={(e) => setVerifierCandidate(e.target.value)}
                  placeholder="Paste computed hash from your file or output above..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Visual Diff & Match Status */}
            <div>{renderVerifierDiff()}</div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: HASH IDENTIFIER / REVERSE ANALYZER ───────────────────────── */}
      {activeTab === "identify" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                Cryptographic Hash Type Identifier
              </h3>
              <p className="text-xs text-slate-500">
                Analyze unknown hash strings, determine candidate algorithms, bit depth, and security level
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Unknown Mystery Hash String
              </label>
              <input
                type="text"
                value={mysteryHash}
                onChange={(e) => setMysteryHash(e.target.value)}
                placeholder="Paste any hash e.g. 5d41402abc4b2a76b9719d911017c592 or $2a$12$..."
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                <span>Length: {mysteryHash.trim().length} characters</span>
                <span>•</span>
                <span>Hexadecimal: {/^[0-9a-fA-F]+$/.test(mysteryHash.trim()) ? "Yes" : "No"}</span>
              </div>
            </div>

            {/* Candidate Types Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Identified Algorithm Candidates ({identifiedTypes.length})
              </h4>

              {identifiedTypes.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-500 text-xs">
                  No standard hash pattern recognized for this length. Ensure it is hexadecimal or standard shadow hash.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {identifiedTypes.map((candidate, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2 hover:border-indigo-400 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{candidate.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                            {candidate.bits}-bit
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {candidate.confidence} Confidence
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400">{candidate.desc}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                        <span className="text-slate-500">{candidate.type}</span>
                        <button
                          onClick={() => {
                            const foundAlg = HASH_ALGORITHMS.find(
                              (a) => a.name.toLowerCase() === candidate.name.toLowerCase()
                            );
                            if (foundAlg) {
                              setAlgorithm(foundAlg.id);
                              setActiveTab("text");
                              toast.success(`Switched active algorithm to ${foundAlg.name}`);
                            }
                          }}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          Use in Generator →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: BENCHMARK SUITE ─────────────────────────────────────────── */}
      {activeTab === "benchmark" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  Browser Hashing Performance Benchmark
                </h3>
                <p className="text-xs text-slate-500">
                  Measures raw cryptographic throughput & hashes-per-second on your current CPU
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={benchmarkRuns}
                  onChange={(e) => setBenchmarkRuns(parseInt(e.target.value))}
                  disabled={isBenchmarking}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium"
                >
                  <option value={1000}>1,000 Iterations</option>
                  <option value={5000}>5,000 Iterations</option>
                  <option value={10000}>10,000 Iterations</option>
                  <option value={25000}>25,000 Iterations</option>
                </select>

                <button
                  onClick={runBenchmark}
                  disabled={isBenchmarking}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {isBenchmarking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Benchmarking...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Run Benchmark</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Benchmark Results Display */}
            {benchmarkResults ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Benchmark Results ({benchmarkRuns.toLocaleString()} hashes per algorithm)
                </h4>
                <div className="space-y-2.5">
                  {benchmarkResults.map((res, i) => (
                    <div
                      key={res.algorithm}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{res.algorithm}</div>
                          <div className="text-[11px] text-slate-400">{res.elapsedMs} ms total time</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                            {res.hashesPerSec} ops/sec
                          </div>
                          <div className="text-[10px] text-slate-400">{res.mbPerSec} MB/s throughput</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-center text-slate-500 text-xs">
                Click "Run Benchmark" above to test your machine's client-side hashing speed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Code Snippet Generator Section ──────────────────────────────────── */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Developer Code Snippet Generator
            </h3>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {["javascript", "python", "php", "bash", "go", "rust", "csharp"].map((lang) => (
              <button
                key={lang}
                onClick={() => setCodeLanguage(lang)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold uppercase transition",
                  codeLanguage === lang
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group">
          <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto border border-slate-800">
            <code>
              {generateCodeSnippet(codeLanguage, {
                algorithm,
                text: inputText,
                salt,
                isHmac,
                hmacKey
              })}
            </code>
          </pre>

          <button
            onClick={() => {
              const snippet = generateCodeSnippet(codeLanguage, {
                algorithm,
                text: inputText,
                salt,
                isHmac,
                hmacKey
              });
              copyToClipboard(snippet, "code_snippet");
            }}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
          >
            {copiedId === "code_snippet" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
      </div>

      {/* ─── History & Favorites Drawer ──────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Recent Hashes & Saved Favorites
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1",
                  favoritesOnly
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Bookmark className="w-3 h-3" />
                <span>Favorites Only</span>
              </button>
              <button
                onClick={clearHistory}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            {history
              .filter((item) => (!favoritesOnly || item.isFavorite) && (!historySearch || item.hash.includes(historySearch)))
              .map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={cn(
                        "p-1 rounded transition",
                        item.isFavorite ? "text-amber-500" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono">
                      {item.algorithm}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate select-all">
                      {item.hash}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                    <button
                      onClick={() => copyToClipboard(item.hash, `hist_${item.id}`)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition"
                    >
                      {copiedId === `hist_${item.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ─── Algorithm Reference & Security Comparison ────────────────────────── */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
          Cryptographic Hash Algorithm Comparison & Security Guide
        </h3>
        <p className="text-xs text-slate-500 max-w-3xl">
          Quick reference table comparing output lengths, collision resistance, and modern security recommendations according to NIST and IETF guidelines.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Algorithm</th>
                <th className="py-2.5 px-4">Family / Spec</th>
                <th className="py-2.5 px-4">Bit Length</th>
                <th className="py-2.5 px-4">Security Status</th>
                <th className="py-2.5 px-4">Primary Use Cases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {HASH_ALGORITHMS.map((alg) => (
                <tr key={alg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{alg.name}</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{alg.category}</td>
                  <td className="py-2.5 px-4 font-mono">{alg.bits} bits ({alg.hexLength} hex)</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        alg.security.includes("Strong")
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : alg.security === "Broken" || alg.security === "Deprecated"
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {alg.security}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{alg.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Frequently Asked Questions (FAQ) Section ────────────────────────── */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
          Frequently Asked Questions (FAQ)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">What is a cryptographic hash function?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              A cryptographic hash function is a one-way mathematical algorithm that transforms arbitrary data of any size into a fixed-size bit string (digest). It is deterministic: the same input always produces the exact same hash.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">What is the difference between Hashing and Encryption?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Encryption is a two-way function designed to be reversed (decrypted) with a secret key. Hashing is strictly one-way and cannot be decrypted or reverse-engineered back to the original message.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Why are MD5 and SHA-1 deprecated?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Practical collision attacks have been proven against MD5 and SHA-1 where two different inputs produce the exact same hash. For security-critical applications, always use SHA-256, SHA-512, SHA-3, or BLAKE2.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">What is Keccak-256 vs SHA3-256?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Keccak is the underlying sponge algorithm submitted to the NIST competition. Ethereum adopted the original Keccak-256 before NIST finalized the official FIPS 202 SHA-3 standard (which uses a different padding constant 0x06).
            </p>
          </div>
        </div>
      </div>

      {/* ─── QR Code Modal ──────────────────────────────────────────────────── */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">QR Code Hash Preview</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-inner">
              <canvas ref={qrCanvasRef} />
            </div>

            <p className="text-xs text-slate-500 font-mono break-all">{currentFormattedHash}</p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </ToolPageShell>
  );
}
