"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import JSZip from "jszip";
import ToolPageShell from "../ToolPageShell";
import { toast } from "sonner";
import {
  FolderArchive,
  Archive,
  UploadCloud,
  FolderPlus,
  FilePlus,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FileAudio,
  FileVideo,
  File,
  Trash2,
  Download,
  Sparkles,
  Layers,
  Settings2,
  Sliders,
  Check,
  Copy,
  Eye,
  EyeOff,
  Search,
  ArrowUpDown,
  RefreshCw,
  Folder,
  ChevronRight,
  ChevronDown,
  Info,
  Lock,
  Unlock,
  Share2,
  X,
  Maximize2,
  Minimize2,
  Filter,
  FolderTree,
  CheckCircle2,
  AlertCircle,
  Zap,
  ShieldCheck,
  Clock,
  HardDrive,
  Cpu,
  HelpCircle,
  Edit3,
  ExternalLink
} from "lucide-react";

// Formatting helpers
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 2)} ${units[index]}`;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getFileCategory(filename) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "ico", "avif"].includes(ext)) {
    return { name: "Image", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40", icon: FileImage };
  }
  if (["pdf", "doc", "docx", "txt", "rtf", "odt", "md"].includes(ext)) {
    return { name: "Document", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40", icon: FileText };
  }
  if (["js", "jsx", "ts", "tsx", "html", "css", "json", "py", "java", "cpp", "c", "cs", "php", "rb", "go", "rs", "sql", "sh", "yml", "yaml", "xml"].includes(ext)) {
    return { name: "Code", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40", icon: FileCode };
  }
  if (["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext)) {
    return { name: "Audio", color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40", icon: FileAudio };
  }
  if (["mp4", "webm", "mkv", "mov", "avi", "wmv"].includes(ext)) {
    return { name: "Video", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40", icon: FileVideo };
  }
  if (["csv", "xlsx", "xls", "tsv", "ods"].includes(ext)) {
    return { name: "Spreadsheet", color: "text-teal-500 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/40", icon: FileSpreadsheet };
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return { name: "Archive", color: "text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/40", icon: FolderArchive };
  }
  return { name: "Other", color: "text-slate-500 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/40", icon: File };
}

// Read entry recursively from drag & drop FileSystem API
async function readFileSystemEntry(entry, currentPath = "") {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file(
        (file) => {
          const relativePath = currentPath ? `${currentPath}/${file.name}` : file.name;
          resolve([{ file, path: relativePath, size: file.size, lastModified: file.lastModified }]);
        },
        () => resolve([])
      );
    });
  } else if (entry.isDirectory) {
    const dirReader = entry.createReader();
    const readAllEntries = async () => {
      const all = [];
      let batch = await new Promise((resolve) => dirReader.readEntries(resolve, () => resolve([])));
      while (batch && batch.length > 0) {
        all.push(...batch);
        batch = await new Promise((resolve) => dirReader.readEntries(resolve, () => resolve([])));
      }
      return all;
    };
    const entries = await readAllEntries();
    const subPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
    const nested = await Promise.all(entries.map((e) => readFileSystemEntry(e, subPath)));
    return nested.flat();
  }
  return [];
}

const COMPRESSION_LEVELS = [
  {
    id: "STORE",
    name: "No Compression (Store)",
    level: 0,
    type: "STORE",
    badge: "0% CPU",
    description: "Fastest. Packs files instantly without recompressing. Ideal for already compressed photos, videos & mp3s."
  },
  {
    id: "FAST",
    name: "Fast DEFLATE",
    level: 1,
    type: "DEFLATE",
    badge: "Fast",
    description: "Lightweight compression with minimum CPU processing time. Great for large batches of text and docs."
  },
  {
    id: "BALANCED",
    name: "Standard DEFLATE (Recommended)",
    level: 6,
    type: "DEFLATE",
    badge: "Optimal",
    description: "Balanced setting for excellent compression ratio and fast speed. Recommended for general daily use."
  },
  {
    id: "MAXIMUM",
    name: "Maximum DEFLATE",
    level: 9,
    type: "DEFLATE",
    badge: "Max Save",
    description: "Deepest deflate compression algorithm. Squeezes maximum byte reduction for code, logs, and documents."
  }
];

export default function ZipCreator() {
  const [activeTab, setActiveTab] = useState("create"); // "create" | "extract"
  
  // Create Tab States
  const [filesQueue, setFilesQueue] = useState([]);
  const [zipName, setZipName] = useState("archive");
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [compressionMode, setCompressionMode] = useState("BALANCED");
  const [zipComment, setZipComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  
  // Results & Stats
  const [resultZip, setResultZip] = useState(null); // { blob, url, name, originalSize, compressedSize, savings, durationMs, fileCount }
  const [isDragging, setIsDragging] = useState(false);

  // Search & Filter in Queue
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("default"); // "default", "name", "size-desc", "size-asc", "type"

  // Modals & Inline Tools
  const [editingFileId, setEditingFileId] = useState(null);
  const [editedPath, setEditedPath] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteFilename, setNoteFilename] = useState("README.txt");
  const [noteContent, setNoteContent] = useState("");
  const [previewFile, setPreviewFile] = useState(null); // { name, url, textContent, type }

  // Extract Tab States
  const [extractedZipFile, setExtractedZipFile] = useState(null);
  const [extractedEntries, setExtractedEntries] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSearch, setExtractSearch] = useState("");

  // Refs
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const extractFileInputRef = useRef(null);
  const downloadUrlRef = useRef("");

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  // Total original bytes in queue
  const totalQueueBytes = useMemo(() => {
    return filesQueue.reduce((acc, curr) => acc + curr.size, 0);
  }, [filesQueue]);

  // Unique categories present in queue
  const queueCategories = useMemo(() => {
    const cats = new Set(["ALL"]);
    filesQueue.forEach((item) => {
      const cat = getFileCategory(item.path || item.file.name);
      cats.add(cat.name);
    });
    return Array.from(cats);
  }, [filesQueue]);

  // Filtered & Sorted files in queue
  const processedQueue = useMemo(() => {
    let list = [...filesQueue];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => item.path.toLowerCase().includes(q));
    }
    if (categoryFilter !== "ALL") {
      list = list.filter((item) => {
        const cat = getFileCategory(item.path);
        return cat.name === categoryFilter;
      });
    }
    if (sortBy === "name") {
      list.sort((a, b) => a.path.localeCompare(b.path));
    } else if (sortBy === "size-desc") {
      list.sort((a, b) => b.size - a.size);
    } else if (sortBy === "size-asc") {
      list.sort((a, b) => a.size - b.size);
    } else if (sortBy === "type") {
      list.sort((a, b) => {
        const extA = a.path.split(".").pop() || "";
        const extB = b.path.split(".").pop() || "";
        return extA.localeCompare(extB);
      });
    }
    return list;
  }, [filesQueue, searchQuery, categoryFilter, sortBy]);

  // Helper to add new files to queue
  const addItemsToQueue = useCallback((newItems) => {
    if (!newItems || newItems.length === 0) return;
    
    setFilesQueue((prev) => {
      const existingPaths = new Set(prev.map((i) => i.path));
      const filtered = [];
      
      newItems.forEach((item) => {
        let finalPath = item.path || item.file.name;
        let counter = 1;
        while (existingPaths.has(finalPath)) {
          const parts = item.path.split(".");
          if (parts.length > 1) {
            const ext = parts.pop();
            finalPath = `${parts.join(".")}_(${counter}).${ext}`;
          } else {
            finalPath = `${item.path}_(${counter})`;
          }
          counter++;
        }
        existingPaths.add(finalPath);
        filtered.push({
          id: `${finalPath}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file: item.file,
          path: finalPath,
          size: item.size || item.file.size,
          lastModified: item.lastModified || item.file.lastModified || Date.now(),
          isTextNote: item.isTextNote || false,
          textContent: item.textContent || null
        });
      });

      toast.success(`Added ${filtered.length} file${filtered.length === 1 ? "" : "s"} to queue`);
      return [...prev, ...filtered];
    });

    if (resultZip) {
      setResultZip(null);
    }
  }, [resultZip]);

  // Handle standard file picker
  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const items = files.map((file) => ({
      file,
      path: file.name,
      size: file.size,
      lastModified: file.lastModified
    }));
    addItemsToQueue(items);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle folder picker
  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const items = files.map((file) => ({
      file,
      path: file.webkitRelativePath || file.name,
      size: file.size,
      lastModified: file.lastModified
    }));
    addItemsToQueue(items);
    if (folderInputRef.current) folderInputRef.current.value = "";
  };

  // Handle drag & drop with deep folder inspection
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const allFiles = [];
      const promises = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            promises.push(readFileSystemEntry(entry, ""));
          }
        } else if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            allFiles.push({ file, path: file.name, size: file.size, lastModified: file.lastModified });
          }
        }
      }
      const entryResults = await Promise.all(promises);
      const flattened = entryResults.flat();
      addItemsToQueue([...allFiles, ...flattened]);
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).map((f) => ({
        file: f,
        path: f.name,
        size: f.size,
        lastModified: f.lastModified
      }));
      addItemsToQueue(files);
    }
  };

  // Remove single file
  const removeFile = (id) => {
    setFilesQueue((prev) => prev.filter((item) => item.id !== id));
    toast.info("File removed from queue");
  };

  // Clear all files
  const clearAllFiles = () => {
    if (!filesQueue.length) return;
    setFilesQueue([]);
    setResultZip(null);
    setProgress(0);
    setProgressMessage("");
    toast.info("Cleared all files");
  };

  // Auto organize files into folders by category
  const handleAutoOrganize = () => {
    if (!filesQueue.length) return;
    setFilesQueue((prev) => {
      return prev.map((item) => {
        const cat = getFileCategory(item.path);
        const folderName = cat.name === "Image" ? "Images"
          : cat.name === "Document" ? "Documents"
          : cat.name === "Code" ? "Code"
          : cat.name === "Audio" ? "Audio"
          : cat.name === "Video" ? "Videos"
          : cat.name === "Spreadsheet" ? "Spreadsheets"
          : "Other";
        
        const filename = item.path.split("/").pop();
        return {
          ...item,
          path: `${folderName}/${filename}`
        };
      });
    });
    toast.success("Files organized into category folders!");
  };

  // Inline rename / path edit
  const startEditingPath = (item) => {
    setEditingFileId(item.id);
    setEditedPath(item.path);
  };

  const saveEditedPath = (id) => {
    if (!editedPath.trim()) return;
    let cleanPath = editedPath.trim().replace(/^[\/\\]+/, "").replace(/[\/\\]+/g, "/");
    setFilesQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, path: cleanPath } : item))
    );
    setEditingFileId(null);
    setEditedPath("");
    toast.success("Path updated");
  };

  // Add custom text note
  const handleAddNote = () => {
    if (!noteFilename.trim()) {
      toast.error("Please provide a valid file name");
      return;
    }
    const cleanName = noteFilename.trim().endsWith(".txt") || noteFilename.includes(".") 
      ? noteFilename.trim() 
      : `${noteFilename.trim()}.txt`;
    
    const blob = new Blob([noteContent], { type: "text/plain;charset=utf-8" });
    const file = new window.File([blob], cleanName, { type: "text/plain", lastModified: Date.now() });
    
    addItemsToQueue([{
      file,
      path: cleanName,
      size: blob.size,
      lastModified: Date.now(),
      isTextNote: true,
      textContent: noteContent
    }]);

    setShowNoteModal(false);
    setNoteFilename("README.txt");
    setNoteContent("");
  };

  // Preview file (Image or Text)
  const handlePreview = async (item) => {
    const cat = getFileCategory(item.path);
    if (cat.name === "Image") {
      const url = URL.createObjectURL(item.file);
      setPreviewFile({ name: item.path, url, type: "image" });
    } else if (cat.name === "Document" || cat.name === "Code" || cat.name === "Spreadsheet" || item.isTextNote) {
      try {
        const text = item.textContent || await item.file.text();
        setPreviewFile({ name: item.path, textContent: text.slice(0, 50000), type: "text" });
      } catch (err) {
        toast.error("Could not preview text content");
      }
    } else {
      toast.info("Preview not available for this binary file format");
    }
  };

  // Close preview and revoke object URL
  const closePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  // Create and Compress ZIP Archive
  const handleCreateZip = async () => {
    if (!filesQueue.length) {
      toast.error("Please add at least one file or folder to compress");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage("Initializing ZIP builder...");
    const startTime = performance.now();

    try {
      const zip = new JSZip();
      const selectedLevelConfig = COMPRESSION_LEVELS.find((c) => c.id === compressionMode) || COMPRESSION_LEVELS[2];
      
      // Add all files into zip with their relative paths
      for (let i = 0; i < filesQueue.length; i++) {
        const item = filesQueue[i];
        setProgressMessage(`Adding ${item.path} (${i + 1}/${filesQueue.length})...`);
        
        if (item.isTextNote && item.textContent !== null) {
          zip.file(item.path, item.textContent);
        } else {
          const buffer = await item.file.arrayBuffer();
          zip.file(item.path, buffer, { binary: true });
        }
      }

      setProgressMessage("Compressing & generating archive...");

      // Generate Async with real-time compression metadata
      const zipBlob = await zip.generateAsync(
        {
          type: "blob",
          compression: selectedLevelConfig.type,
          compressionOptions: {
            level: selectedLevelConfig.level
          },
          comment: zipComment.trim() || undefined
        },
        (metadata) => {
          setProgress(Math.round(metadata.percent));
          if (metadata.currentFile) {
            setProgressMessage(`Packing: ${metadata.currentFile} (${Math.round(metadata.percent)}%)`);
          }
        }
      );

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      // Clean up previous URL
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }

      const url = URL.createObjectURL(zipBlob);
      downloadUrlRef.current = url;

      // Construct final archive name
      let baseName = zipName.trim().replace(/\.zip$/i, "") || "archive";
      if (includeTimestamp) {
        const dateStr = new Date().toISOString().slice(0, 10);
        baseName = `${baseName}_${dateStr}`;
      }
      const finalFileName = `${baseName}.zip`;

      const compressedSize = zipBlob.size;
      const originalSize = totalQueueBytes;
      const savingsBytes = Math.max(0, originalSize - compressedSize);
      const savingsPercent = originalSize > 0 ? ((savingsBytes / originalSize) * 100).toFixed(1) : 0;

      setResultZip({
        blob: zipBlob,
        url,
        name: finalFileName,
        originalSize,
        compressedSize,
        savingsBytes,
        savingsPercent,
        durationMs,
        fileCount: filesQueue.length,
        compressionMode: selectedLevelConfig.name
      });

      setProgress(100);
      setProgressMessage("ZIP archive successfully generated!");
      toast.success(`ZIP Archive "${finalFileName}" is ready for download!`);
    } catch (err) {
      console.error("ZIP Generation error:", err);
      toast.error(`Compression failed: ${err?.message || "Unknown error"}`);
      setProgressMessage("Compression failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy Data URL
  const handleCopyDataUrl = async () => {
    if (!resultZip?.blob) return;
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        await navigator.clipboard.writeText(reader.result);
        toast.success("Base64 Data URI copied to clipboard!");
      };
      reader.readAsDataURL(resultZip.blob);
    } catch (err) {
      toast.error("Could not copy Data URI");
    }
  };

  // Mobile Web Share
  const handleShare = async () => {
    if (!resultZip?.blob || !navigator.share) {
      toast.info("Web Share API is not supported on this browser");
      return;
    }
    try {
      const file = new window.File([resultZip.blob], resultZip.name, { type: "application/zip" });
      await navigator.share({
        title: resultZip.name,
        text: "Created with ToolsTrek ZIP Creator",
        files: [file]
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error("Share failed");
      }
    }
  };

  // --- EXTRACT TAB LOGIC ---
  const handleExtractZipUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip") && file.type !== "application/zip" && file.type !== "application/x-zip-compressed") {
      toast.error("Please upload a valid .zip file");
      return;
    }
    
    setIsExtracting(true);
    setExtractedZipFile(file);
    setExtractedEntries([]);

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const entries = [];

      loadedZip.forEach((relativePath, zipEntry) => {
        entries.push({
          name: relativePath,
          isDir: zipEntry.dir,
          comment: zipEntry.comment || "",
          date: zipEntry.date,
          entryRef: zipEntry
        });
      });

      entries.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      });

      setExtractedEntries(entries);
      toast.success(`Loaded ${entries.length} items from ${file.name}`);
    } catch (err) {
      console.error("ZIP read error:", err);
      toast.error("Could not parse ZIP file. It might be password-protected or corrupted.");
    } finally {
      setIsExtracting(false);
      if (extractFileInputRef.current) extractFileInputRef.current.value = "";
    }
  };

  // Download single entry from extracted ZIP
  const handleDownloadExtractedEntry = async (entry) => {
    if (entry.isDir) return;
    try {
      const blob = await entry.entryRef.async("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = entry.name.split("/").pop() || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${entry.name}`);
    } catch (err) {
      toast.error("Failed to extract item");
    }
  };

  // Extract all files at once
  const handleExtractAll = async () => {
    if (!extractedEntries.length) return;
    const fileEntries = extractedEntries.filter((e) => !e.isDir);
    toast.info(`Extracting ${fileEntries.length} files...`);

    for (const entry of fileEntries) {
      try {
        const blob = await entry.entryRef.async("blob");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = entry.name.replace(/\//g, "_");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error("Failed to extract item:", entry.name, err);
      }
    }
    toast.success("Extraction complete!");
  };

  const filteredExtractedEntries = useMemo(() => {
    if (!extractSearch.trim()) return extractedEntries;
    const q = extractSearch.toLowerCase();
    return extractedEntries.filter((e) => e.name.toLowerCase().includes(q));
  }, [extractedEntries, extractSearch]);

  return (
    <ToolPageShell widthClassName="max-w-7xl px-2 sm:px-4 pt-16 pb-16">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-brandColor/15 blur-3xl dark:bg-brandColor/20" />
        <div className="absolute right-0 top-60 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />
      </div>

      {/* Hero Header Section */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brandColor/30 bg-brandColor/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brandColor dark:border-brandColor/40 dark:bg-brandColor/20 dark:text-purple-300">
            <FolderArchive className="h-3.5 w-3.5" />
            <span>Archive &amp; Compressor Tool</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">
            ZIP File <span className="bg-gradient-to-r from-brandColor to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-300">Creator &amp; Compressor</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            Easily bundle unlimited files and entire folders into a fast, compressed <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">.zip</code> archive directly in your browser. Complete privacy, zero server uploads, custom folders, and full compression controls.
          </p>
        </div>

        {/* Feature Pill Stats */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>100%</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Private &amp; Offline</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Instant</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Client Engine</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              <FolderTree className="h-4 w-4 text-brandColor" />
              <span>Folders</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Preserved</div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="mb-6 flex rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "create"
              ? "bg-white text-brandColor shadow-sm dark:bg-slate-800 dark:text-purple-300"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <FolderArchive className="h-4 w-4" />
          <span>Create &amp; Compress ZIP</span>
          {filesQueue.length > 0 && (
            <span className="rounded-full bg-brandColor/15 px-2 py-0.5 text-xs font-bold text-brandColor dark:bg-brandColor/30 dark:text-purple-300">
              {filesQueue.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("extract")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "extract"
              ? "bg-white text-brandColor shadow-sm dark:bg-slate-800 dark:text-purple-300"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <FolderTree className="h-4 w-4" />
          <span>Inspect &amp; Extract ZIP</span>
          {extractedEntries.length > 0 && (
            <span className="rounded-full bg-brandColor/15 px-2 py-0.5 text-xs font-bold text-brandColor dark:bg-brandColor/30 dark:text-purple-300">
              {extractedEntries.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "create" ? (
        /* ================= CREATE ZIP MODE ================= */
        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          {/* LEFT COLUMN: Uploader, Controls, File Queue */}
          <div className="space-y-6">
            {/* Drop Zone Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-brandColor bg-brandColor/10 scale-[0.99] shadow-lg dark:border-purple-400 dark:bg-brandColor/20"
                  : "border-slate-300 bg-white/90 shadow-sm hover:border-brandColor/60 dark:border-slate-700/60 dark:bg-slate-900/60 dark:hover:border-brandColor/60"
              }`}
            >
              {/* Hidden Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFilesSelect}
                className="hidden"
                id="zip-files-input"
              />
              <input
                ref={folderInputRef}
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderSelect}
                className="hidden"
                id="zip-folder-input"
              />

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brandColor/20 to-indigo-500/20 text-brandColor shadow-inner dark:from-brandColor/30 dark:to-indigo-500/30 dark:text-purple-300">
                <UploadCloud className="h-8 w-8 animate-pulse" />
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                Drop your files or folders here
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Drag and drop documents, images, videos, codebases, or full directories. Nested subfolders will automatically be preserved!
              </p>

              {/* Action Buttons inside Dropzone */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brandColor px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-brandColorHover active:scale-95 cursor-pointer"
                >
                  <FilePlus className="h-4 w-4" />
                  <span>Choose Files</span>
                </button>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-400 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 cursor-pointer"
                >
                  <FolderPlus className="h-4 w-4 text-amber-500" />
                  <span>Choose Entire Folder</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-400 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 cursor-pointer"
                  title="Add a text note or README file directly"
                >
                  <Edit3 className="h-4 w-4 text-blue-500" />
                  <span>Add Note</span>
                </button>
              </div>

              {/* Supported formats hint */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">Any file type</span>
                <span>•</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">No file count limits</span>
                <span>•</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">Zero server upload</span>
              </div>
            </div>

            {/* Queue Management Card */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
                      Files Queue
                    </h3>
                    <span className="rounded-full bg-brandColor/15 px-2.5 py-0.5 text-xs font-bold text-brandColor dark:bg-brandColor/25 dark:text-purple-300">
                      {filesQueue.length} {filesQueue.length === 1 ? "file" : "files"}
                    </span>
                    {filesQueue.length > 0 && (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        ({formatBytes(totalQueueBytes)})
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Review and customize target folder hierarchy before archiving
                  </p>
                </div>

                {/* Queue Actions */}
                {filesQueue.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoOrganize}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100 dark:border-purple-800/40 dark:bg-purple-950/30 dark:text-purple-300 cursor-pointer"
                      title="Organize files into Images, Documents, Media, Code folders automatically"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Auto-Categorize</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearAllFiles}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Search, Filter & Sort Toolbar */}
              {filesQueue.length > 0 && (
                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-y border-slate-100 py-3 dark:border-slate-800">
                  {/* Search box */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search queue files..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 transition focus:border-brandColor focus:bg-white focus:outline-hidden dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:bg-slate-800"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Filter & Sort controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Filter */}
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition focus:border-brandColor focus:outline-hidden dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 cursor-pointer"
                    >
                      {queueCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === "ALL" ? "All Types" : cat}
                        </option>
                      ))}
                    </select>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition focus:border-brandColor focus:outline-hidden dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 cursor-pointer"
                    >
                      <option value="default">Upload Order</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="size-desc">Size (Largest first)</option>
                      <option value="size-asc">Size (Smallest first)</option>
                      <option value="type">File Extension</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Queue Items List */}
              <div className="mt-4">
                {filesQueue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-800 dark:bg-slate-900/30">
                    <FolderArchive className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                    <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                      No files selected yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Upload files or whole folders above to start creating your ZIP archive
                    </p>
                  </div>
                ) : processedQueue.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    No files match the search or filter criteria.
                  </div>
                ) : (
                  <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
                    {processedQueue.map((item) => {
                      const category = getFileCategory(item.path);
                      const IconComponent = category.icon;
                      const isFolderNested = item.path.includes("/");

                      return (
                        <div
                          key={item.id}
                          className="group flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 transition hover:border-brandColor/40 hover:bg-white dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:border-brandColor/40 dark:hover:bg-slate-800/80 sm:flex-row sm:items-center sm:justify-between"
                        >
                          {/* File info */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${category.color}`}
                            >
                              <IconComponent className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              {editingFileId === item.id ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={editedPath}
                                    onChange={(e) => setEditedPath(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveEditedPath(item.id);
                                      if (e.key === "Escape") setEditingFileId(null);
                                    }}
                                    autoFocus
                                    className="w-full rounded-lg border border-brandColor bg-white px-2 py-1 text-xs text-slate-900 focus:outline-hidden dark:bg-slate-900 dark:text-slate-100"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => saveEditedPath(item.id)}
                                    className="rounded-md bg-brandColor p-1 text-white hover:bg-brandColorHover"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingFileId(null)}
                                    className="rounded-md bg-slate-200 p-1 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="truncate text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100"
                                    title={item.path}
                                  >
                                    {item.path}
                                  </span>
                                  {isFolderNested && (
                                    <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                      nested
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>{formatBytes(item.size)}</span>
                                <span>•</span>
                                <span>{category.name}</span>
                              </div>
                            </div>
                          </div>

                          {/* Item actions */}
                          <div className="flex items-center justify-end gap-1.5 shrink-0">
                            {/* Preview button */}
                            {(category.name === "Image" || category.name === "Document" || category.name === "Code" || item.isTextNote) && (
                              <button
                                type="button"
                                onClick={() => handlePreview(item)}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 cursor-pointer"
                                title="Quick Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}

                            {/* Rename / Path Edit */}
                            <button
                              type="button"
                              onClick={() => startEditingPath(item)}
                              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 cursor-pointer"
                              title="Edit archive path / rename"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => removeFile(item.id)}
                              className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-100 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings, Compression Controls & Result Box */}
          <aside className="space-y-6">
            {/* Archive Settings Card */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xs backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 sm:p-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Settings2 className="h-5 w-5 text-brandColor" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Archive Configuration
                </h3>
              </div>

              <div className="mt-4 space-y-4">
                {/* Zip Name Input */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ZIP File Name
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-within:border-brandColor focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:focus-within:bg-slate-800">
                    <input
                      type="text"
                      value={zipName}
                      onChange={(e) => setZipName(e.target.value)}
                      placeholder="archive"
                      className="w-full bg-transparent font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden dark:text-slate-100"
                    />
                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                      .zip
                    </span>
                  </div>

                  {/* Timestamp Option */}
                  <label className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTimestamp}
                      onChange={(e) => setIncludeTimestamp(e.target.checked)}
                      className="rounded border-slate-300 text-brandColor focus:ring-brandColor"
                    />
                    <span>Append date timestamp (e.g. _2026-08-21)</span>
                  </label>
                </div>

                {/* Compression Level Selector */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Compression Level
                    </label>
                    <span className="text-[11px] font-medium text-brandColor dark:text-purple-300">
                      Deflate Algorithm
                    </span>
                  </div>

                  <div className="grid gap-2">
                    {COMPRESSION_LEVELS.map((level) => {
                      const isSelected = compressionMode === level.id;
                      return (
                        <div
                          key={level.id}
                          onClick={() => setCompressionMode(level.id)}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all duration-200 ${
                            isSelected
                              ? "border-brandColor bg-brandColor/5 shadow-xs dark:border-purple-400 dark:bg-brandColor/15"
                              : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/80"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-brandColor bg-brandColor text-white"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                            }`}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {level.name}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  isSelected
                                    ? "bg-brandColor/20 text-brandColor dark:bg-brandColor/40 dark:text-purple-200"
                                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {level.badge}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                              {level.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Zip Comment */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ZIP Archive Comment (Optional)
                  </label>
                  <input
                    type="text"
                    value={zipComment}
                    onChange={(e) => setZipComment(e.target.value)}
                    placeholder="e.g. Created with ToolsTrek"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 transition focus:border-brandColor focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Progress Bar & Status Message */}
              {(isProcessing || progress > 0) && (
                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="truncate text-slate-600 dark:text-slate-300">
                      {progressMessage || "Processing..."}
                    </span>
                    <span className="shrink-0 text-brandColor dark:text-purple-300 font-bold ml-2">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brandColor via-indigo-500 to-purple-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Generate Zip Button */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleCreateZip}
                  disabled={filesQueue.length === 0 || isProcessing}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brandColor to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brandColor/25 transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Compressing Files...</span>
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      <span>Create &amp; Compress ZIP</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output & Download Card */}
            {resultZip && (
              <div className="overflow-hidden rounded-3xl border border-emerald-300 bg-gradient-to-b from-emerald-50/90 to-white p-5 shadow-md dark:border-emerald-800/60 dark:from-emerald-950/30 dark:to-slate-900/80 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Archive Ready!
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium truncate max-w-[200px]">
                        {resultZip.name}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {resultZip.fileCount} files
                  </span>
                </div>

                {/* Compression Metrics Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Original Size</div>
                    <div className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                      {formatBytes(resultZip.originalSize)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300">ZIP File Size</div>
                    <div className="mt-0.5 font-bold text-emerald-800 dark:text-emerald-200">
                      {formatBytes(resultZip.compressedSize)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Space Saved</div>
                    <div className="mt-0.5 font-bold text-purple-600 dark:text-purple-300">
                      {resultZip.savingsPercent}% ({formatBytes(resultZip.savingsBytes)})
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Process Time</div>
                    <div className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                      {formatDuration(resultZip.durationMs)}
                    </div>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="mt-4 space-y-2">
                  <a
                    href={resultZip.url}
                    download={resultZip.name}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-98"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {resultZip.name}</span>
                  </a>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyDataUrl}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Base64</span>
                    </button>
                    {typeof navigator !== "undefined" && navigator.share && (
                      <button
                        type="button"
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips Box */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-xs text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                <Info className="h-4 w-4 text-brandColor" />
                <span>Compression Insights</span>
              </div>
              <ul className="mt-3 space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Text &amp; Code:</strong> Compresses up to 70-90% smaller.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Images &amp; Videos:</strong> Already compressed formats (JPG, MP4) compress minimally — use <span className="font-semibold text-brandColor">STORE</span> mode for fastest packing.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Folder Hierarchy:</strong> Preserved seamlessly on all Windows, macOS, Linux, and mobile unpackers.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      ) : (
        /* ================= EXTRACT / INSPECT ZIP MODE ================= */
        <div className="space-y-6">
          {/* Extract Upload Zone */}
          <div
            onClick={() => extractFileInputRef.current?.click()}
            className="cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-white/90 p-8 text-center shadow-xs transition hover:border-brandColor/60 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-brandColor/60"
          >
            <input
              ref={extractFileInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              onChange={handleExtractZipUpload}
              className="hidden"
            />
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-brandColor dark:bg-purple-950/40 dark:text-purple-300">
              <FolderTree className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Select or Drop a .ZIP File to Inspect &amp; Extract
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Read any archive directly in your browser without uploading to any server
            </p>
          </div>

          {/* Extracted Content Viewer */}
          {extractedEntries.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
                      Archive Contents
                    </h3>
                    <span className="rounded-full bg-brandColor/15 px-2.5 py-0.5 text-xs font-bold text-brandColor dark:bg-brandColor/25 dark:text-purple-300">
                      {extractedEntries.length} items
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Source: {extractedZipFile?.name} ({formatBytes(extractedZipFile?.size)})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={extractSearch}
                      onChange={(e) => setExtractSearch(e.target.value)}
                      placeholder="Filter zip contents..."
                      className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brandColor focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleExtractAll}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brandColor px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brandColorHover cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Extract All Files</span>
                  </button>
                </div>
              </div>

              {/* Entries Table / List */}
              <div className="mt-4 max-h-[500px] overflow-y-auto space-y-2">
                {filteredExtractedEntries.map((entry, idx) => {
                  const isDir = entry.isDir;
                  const category = isDir ? null : getFileCategory(entry.name);
                  const IconComp = isDir ? Folder : category.icon;

                  return (
                    <div
                      key={`${entry.name}-${idx}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:bg-slate-100/70 dark:border-slate-800/60 dark:bg-slate-800/30 dark:hover:bg-slate-800/60"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isDir
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : category.color
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {entry.name}
                          </div>
                          {entry.date && (
                            <div className="text-[11px] text-slate-400">
                              {new Date(entry.date).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {!isDir && (
                        <button
                          type="button"
                          onClick={() => handleDownloadExtractedEntry(entry)}
                          className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Extract</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL: Add Text Note --- */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brandColor" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Add Text Note / Readme to Archive
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Filename
                </label>
                <input
                  type="text"
                  value={noteFilename}
                  onChange={(e) => setNoteFilename(e.target.value)}
                  placeholder="README.txt"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-brandColor focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Note Content
                </label>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write documentation, instructions, notes, or code..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:border-brandColor focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNote}
                className="rounded-xl bg-brandColor px-4 py-2 text-xs font-semibold text-white hover:bg-brandColorHover cursor-pointer"
              >
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Quick Preview --- */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="h-5 w-5 text-brandColor shrink-0" />
                <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {previewFile.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto">
              {previewFile.type === "image" ? (
                <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-2 dark:bg-slate-950">
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-h-[60vh] max-w-full rounded-lg object-contain"
                  />
                </div>
              ) : (
                <pre className="max-h-[60vh] overflow-auto rounded-2xl bg-slate-900 p-4 font-mono text-xs text-slate-100">
                  {previewFile.textContent}
                </pre>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={closePreview}
                className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HOW IT WORKS / STEPS GUIDE --- */}
      <section className="mt-16 border-t border-slate-200/80 pt-12 dark:border-slate-800/80">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            How to Create &amp; Compress ZIP Folders
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Three simple steps to combine hundreds of files into one neat archive
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="relative rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brandColor/15 text-sm font-bold text-brandColor dark:bg-brandColor/25 dark:text-purple-300">
              1
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
              Upload Files &amp; Folders
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Drag and drop any combination of files, images, documents, or entire directory trees. You can even write custom notes or README files.
            </p>
          </div>

          <div className="relative rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-sm font-bold text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-300">
              2
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
              Organize &amp; Configure
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Rename files, set custom archive paths, pick your preferred DEFLATE compression level, or 1-click auto-organize items by file category.
            </p>
          </div>

          <div className="relative rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-sm font-bold text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-300">
              3
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
              Download ZIP Instantly
            </h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Click &quot;Create &amp; Compress ZIP&quot; to compile your archive in milliseconds and download your ready-to-share standard <code className="font-mono text-xs">.zip</code> package.
            </p>
          </div>
        </div>
      </section>

      {/* --- FAQ ACCORDION SECTION --- */}
      <section className="mt-16 border-t border-slate-200/80 pt-12 dark:border-slate-800/80">
        <div className="text-center">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brandColor dark:text-purple-300">
            <HelpCircle className="h-4 w-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Everything you need to know about creating and compressing ZIP archives on ToolsTrek
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {[
            {
              q: "Is there any file size limit or file count limit?",
              a: "There are no arbitrary server limits because everything runs client-side inside your browser engine. You can bundle hundreds of files seamlessly. For optimal performance, archiving collections up to several gigabytes is smooth on modern computers."
            },
            {
              q: "Are my files uploaded to any external server?",
              a: "No! 100% of the compression and zip creation is executed directly inside your web browser via JavaScript. Your files never leave your device, ensuring maximum privacy and enterprise-grade data security."
            },
            {
              q: "Can I preserve folder structures when creating a ZIP?",
              a: "Yes. When you drag and drop folders or use the 'Choose Entire Folder' button, the full directory structure with nested subfolders is preserved exactly as it is on your computer."
            },
            {
              q: "What is the difference between Store and Deflate compression levels?",
              a: "STORE (0% compression) simply packs files into the archive container without recalculating bytes, which is fastest for already compressed files like JPEGs, MP4s, or existing archives. DEFLATE (Levels 1-9) applies lossless data compression algorithms to shrink text, source code, JSON, logs, and PDFs to a fraction of their original size."
            },
            {
              q: "Will the generated ZIP file open on Windows, Mac, and Linux?",
              a: "Yes. ToolsTrek generates fully compliant PKZIP-standard .zip archives that are natively compatible with Windows Explorer, macOS Archive Utility, Linux unzip/tar, 7-Zip, WinRAR, iOS Files, and Android."
            },
            {
              q: "Can I inspect and extract existing ZIP files with this tool?",
              a: "Yes! Switch to the 'Inspect & Extract ZIP' tab to preview existing .zip files, view their file lists, read text/code files, preview images, and extract individual files or all files directly in your browser."
            }
          ].map((item, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-4 transition-all duration-200 open:border-brandColor/50 open:bg-brandColor/5 dark:border-slate-800 dark:bg-slate-900/60 dark:open:border-purple-500/40 dark:open:bg-brandColor/10"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-100">
                <span>{item.q}</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </ToolPageShell>
  );
}
