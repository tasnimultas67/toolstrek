"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import JSZip from "jszip";
import piexif from "piexifjs";
import { PDFDocument } from "pdf-lib";
import ToolPageShell from "../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import BackButton from "@/components/BackButton";
import {
  ShieldOff,
  ShieldCheck,
  Upload,
  Download,
  Trash2,
  MapPin,
  Camera,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Check,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  Lock,
  FileArchive,
  X,
  Sliders,
  Cpu,
} from "lucide-react";

/* ─────────────────────────── Helper Utilities ─────────────────────────── */

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDate(date) {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gpsToDecimal(val, ref) {
  if (!val || !Array.isArray(val) || val.length < 3) return null;
  const [deg, min, sec] = val;
  let decimal = deg + min / 60 + sec / 3600;
  if (ref === "S" || ref === "W") decimal = -decimal;
  return Number(decimal.toFixed(6));
}

/* ─────────────────────────── EXIF & Metadata Parser ─────────────────────────── */

const EXIF_TAGS = {
  0x0100: "ImageWidth",
  0x0101: "ImageLength",
  0x010e: "ImageDescription",
  0x010f: "Make",
  0x0110: "Model",
  0x0112: "Orientation",
  0x0131: "Software",
  0x0132: "DateTime",
  0x013b: "Artist",
  0x8298: "Copyright",
  0x829a: "ExposureTime",
  0x829d: "FNumber",
  0x8769: "ExifIFD",
  0x8825: "GPSIFD",
  0x8827: "ISOSpeedRatings",
  0x9003: "DateTimeOriginal",
  0x9004: "DateTimeDigitized",
  0x920a: "FocalLength",
  0x9286: "UserComment",
  0xa430: "CameraOwnerName",
  0xa431: "BodySerialNumber",
  0xa433: "LensMake",
  0xa434: "LensModel",
  0xa435: "LensSerialNumber",
};

const GPS_TAGS = {
  0: "GPSVersionID",
  1: "GPSLatitudeRef",
  2: "GPSLatitude",
  3: "GPSLongitudeRef",
  4: "GPSLongitude",
  5: "GPSAltitudeRef",
  6: "GPSAltitude",
  7: "GPSTimeStamp",
  29: "GPSDateStamp",
};

function parseTIFF(buffer, start) {
  try {
    const view = new DataView(buffer);
    const le = view.getUint16(start, false) === 0x4949;
    const read16 = (o) => view.getUint16(o, le);
    const read32 = (o) => view.getUint32(o, le);
    const readRat = (o) => {
      const num = read32(o);
      const den = read32(o + 4);
      return den !== 0 ? num / den : 0;
    };

    function readValue(type, count, valueOffset, tagOffset) {
      const sizes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
      const totalSize = (sizes[type] || 1) * count;
      const off = totalSize <= 4 ? tagOffset : start + valueOffset;
      if (off + totalSize > buffer.byteLength) return null;

      if (type === 2) {
        const bytes = new Uint8Array(buffer, off, count);
        return new TextDecoder().decode(bytes).replace(/\0/g, "").trim();
      }
      if (type === 5 || type === 10) {
        const vals = [];
        for (let i = 0; i < count; i++) vals.push(readRat(off + i * 8));
        return count === 1 ? vals[0] : vals;
      }
      if (type === 3 || type === 8) {
        const vals = [];
        for (let i = 0; i < count; i++) vals.push(read16(off + i * 2));
        return count === 1 ? vals[0] : vals;
      }
      if (type === 4 || type === 9) {
        const vals = [];
        for (let i = 0; i < count; i++) vals.push(read32(off + i * 4));
        return count === 1 ? vals[0] : vals;
      }
      return null;
    }

    function parseIFD(ifdOffset, tagDict) {
      const result = {};
      try {
        const count = read16(start + ifdOffset);
        for (let i = 0; i < count; i++) {
          const entryOffset = start + ifdOffset + 2 + i * 12;
          if (entryOffset + 12 > buffer.byteLength) break;
          const tag = read16(entryOffset);
          const type = read16(entryOffset + 2);
          const entryCount = read32(entryOffset + 4);
          const valueOffset = read32(entryOffset + 8);
          const name = tagDict[tag] || `Tag_0x${tag.toString(16).toUpperCase()}`;
          const val = readValue(type, entryCount, valueOffset, entryOffset + 8);
          if (val !== null && val !== undefined && val !== "") result[name] = val;
        }
      } catch { }
      return result;
    }

    const ifdOffset = read32(start + 4);
    const mainTags = parseIFD(ifdOffset, EXIF_TAGS);
    let exifTags = {};
    if (mainTags.ExifIFD) exifTags = parseIFD(mainTags.ExifIFD, EXIF_TAGS);
    let gpsTags = {};
    if (mainTags.GPSIFD) gpsTags = parseIFD(mainTags.GPSIFD, GPS_TAGS);

    return { mainTags, exifTags, gpsTags };
  } catch {
    return null;
  }
}

function parseJpegExif(buffer) {
  try {
    const view = new DataView(buffer);
    if (view.getUint16(0, false) !== 0xffd8) return null;
    let offset = 2;
    while (offset < buffer.byteLength - 2) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        offset += 2; // skip segment length
        const exifHeader = String.fromCharCode(...new Uint8Array(buffer, offset, 4));
        if (exifHeader === "Exif") {
          const tiffStart = offset + 6;
          return parseTIFF(buffer, tiffStart);
        }
      } else if ((marker & 0xff00) === 0xff00 && marker !== 0xffd8 && marker !== 0xffd9) {
        if (offset + 2 > buffer.byteLength) break;
        offset += view.getUint16(offset, false);
      } else {
        break;
      }
    }
  } catch { }
  return null;
}

function parsePngChunks(buffer) {
  try {
    const view = new DataView(buffer);
    const sig = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < 8; i++) {
      if (view.getUint8(i) !== sig[i]) return null;
    }
    const tags = {};
    let offset = 8;
    while (offset < buffer.byteLength - 12) {
      const length = view.getUint32(offset, false);
      const type = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7)
      );
      if (type === "tEXt" || type === "iTXt") {
        const bytes = new Uint8Array(buffer, offset + 8, Math.min(length, 4096));
        const text = new TextDecoder().decode(bytes);
        const [key, ...rest] = text.split("\0");
        if (key) tags[key] = rest.join("").replace(/\0/g, " ").trim();
      } else if (type === "eXIf") {
        tags["EXIF Chunk Detected"] = "Raw EXIF block embedded in PNG";
      }
      offset += 12 + length;
    }
    return Object.keys(tags).length ? tags : null;
  } catch {
    return null;
  }
}

async function analyzeFileMetadata(file) {
  const result = {
    gps: null,
    camera: null,
    dates: null,
    author: null,
    pdfMeta: null,
    totalCount: 0,
    riskLevel: "safe", // safe | low | medium | high
    rawTags: {},
  };

  try {
    const buffer = await file.arrayBuffer();

    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      const exifData = parseJpegExif(buffer);
      if (exifData) {
        const combined = { ...exifData.mainTags, ...exifData.exifTags };
        result.rawTags = { ...combined };

        // GPS
        if (exifData.gpsTags && Object.keys(exifData.gpsTags).length > 0) {
          result.rawTags = { ...result.rawTags, ...exifData.gpsTags };
          const lat = gpsToDecimal(exifData.gpsTags.GPSLatitude, exifData.gpsTags.GPSLatitudeRef);
          const lon = gpsToDecimal(exifData.gpsTags.GPSLongitude, exifData.gpsTags.GPSLongitudeRef);
          const alt = exifData.gpsTags.GPSAltitude;
          if (lat !== null && lon !== null) {
            result.gps = { lat, lon, alt: typeof alt === "number" ? Math.round(alt) : null };
          }
        }

        // Camera
        const make = combined.Make;
        const model = combined.Model;
        const lens = combined.LensModel || combined.LensMake;
        const serial = combined.BodySerialNumber || combined.CameraOwnerName;
        if (make || model || lens || serial) {
          result.camera = { make, model, lens, serial };
        }

        // Dates
        const dateTaken = combined.DateTimeOriginal || combined.DateTimeDigitized;
        const dateModified = combined.DateTime;
        if (dateTaken || dateModified) {
          result.dates = { dateTaken, dateModified };
        }

        // Author / Software
        const artist = combined.Artist;
        const copyright = combined.Copyright;
        const software = combined.Software;
        const comment = combined.UserComment || combined.ImageDescription;
        if (artist || copyright || software || comment) {
          result.author = { artist, copyright, software, comment };
        }

        result.totalCount = Object.keys(result.rawTags).length;
      }
    } else if (file.type === "image/png") {
      const pngTags = parsePngChunks(buffer);
      if (pngTags) {
        result.rawTags = pngTags;
        result.totalCount = Object.keys(pngTags).length;
        result.author = {
          software: pngTags.Software,
          artist: pngTags.Author || pngTags.Artist,
          comment: pngTags.Description || pngTags.Comment,
        };
        if (pngTags["Creation Time"]) {
          result.dates = { dateTaken: pngTags["Creation Time"] };
        }
      }
    } else if (file.type === "application/pdf") {
      try {
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const title = pdfDoc.getTitle();
        const author = pdfDoc.getAuthor();
        const subject = pdfDoc.getSubject();
        const keywords = pdfDoc.getKeywords();
        const creator = pdfDoc.getCreator();
        const producer = pdfDoc.getProducer();
        const creationDate = pdfDoc.getCreationDate();
        const modDate = pdfDoc.getModificationDate();

        const pdfTags = {};
        if (title) pdfTags.Title = title;
        if (author) pdfTags.Author = author;
        if (subject) pdfTags.Subject = subject;
        if (keywords && keywords.length) pdfTags.Keywords = keywords.join(", ");
        if (creator) pdfTags.Creator = creator;
        if (producer) pdfTags.Producer = producer;
        if (creationDate) pdfTags["Creation Date"] = creationDate.toISOString();
        if (modDate) pdfTags["Modification Date"] = modDate.toISOString();

        if (Object.keys(pdfTags).length > 0) {
          result.rawTags = pdfTags;
          result.totalCount = Object.keys(pdfTags).length;
          result.pdfMeta = { title, author, subject, keywords, creator, producer };
          if (author || creator) {
            result.author = { artist: author, software: creator || producer };
          }
          if (creationDate) {
            result.dates = { dateTaken: creationDate.toISOString() };
          }
        }
      } catch { }
    }

    // Determine Risk Level
    if (result.gps) {
      result.riskLevel = "high";
    } else if (result.camera?.serial || result.author?.artist || result.pdfMeta?.author) {
      result.riskLevel = "medium";
    } else if (result.totalCount > 0) {
      result.riskLevel = "low";
    } else {
      result.riskLevel = "safe";
    }
  } catch (err) {
    console.error("Error analyzing metadata:", err);
  }

  return result;
}

/* ─────────────────────────── Strip / Clean Operations ─────────────────────────── */

async function stripJpegLossless(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = async (e) => {
      try {
        const originalDataUrl = e.target.result;
        let cleanedDataUrl;
        try {
          cleanedDataUrl = piexif.remove(originalDataUrl);
        } catch {
          // Fallback to canvas
          return resolve(await stripViaCanvas(file, "image/jpeg"));
        }
        const res = await fetch(cleanedDataUrl);
        const blob = await res.blob();
        resolve(blob);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(file);
  });
}

async function stripViaCanvas(file, mimeType = "image/png") {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load image into canvas for cleaning"));
    };
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const outMime = mimeType === "image/jpeg" ? "image/jpeg" : mimeType === "image/webp" ? "image/webp" : "image/png";
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to export clean canvas blob"));
          },
          outMime,
          outMime === "image/jpeg" ? 0.98 : undefined
        );
      } catch (err) {
        reject(err);
      }
    };
    img.src = url;
  });
}

async function stripPdfMetadata(file) {
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setCreator("");
  pdfDoc.setProducer("");
  pdfDoc.setCreationDate(new Date(0));
  pdfDoc.setModificationDate(new Date(0));
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

/* ─────────────────────────── Component Main ─────────────────────────── */

export default function RemoveMetadata() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCleaningAll, setIsCleaningAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [inspectModalFile, setInspectModalFile] = useState(null);
  const [strippingMode, setStrippingMode] = useState("all"); // 'all' | 'custom'
  const [customOptions, setCustomOptions] = useState({
    stripGps: true,
    stripCamera: true,
    stripAuthor: true,
    stripDates: true,
    stripSoftware: true,
  });

  const fileInputRef = useRef(null);

  // File addition handler
  const handleFilesAdded = useCallback(async (newFileList) => {
    const validFiles = Array.from(newFileList).filter((f) => {
      const t = f.type.toLowerCase();
      const n = f.name.toLowerCase();
      return (
        t.startsWith("image/") ||
        t === "application/pdf" ||
        n.endsWith(".jpg") ||
        n.endsWith(".jpeg") ||
        n.endsWith(".png") ||
        n.endsWith(".webp") ||
        n.endsWith(".pdf")
      );
    });

    if (validFiles.length === 0) {
      toast.error("Please drop or select JPG, PNG, WebP, or PDF files.");
      return;
    }

    const initialEntries = validFiles.map((file) => {
      const isImg = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);
      return {
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        previewUrl: isImg ? URL.createObjectURL(file) : null,
        status: "analyzing",
        detected: null,
        cleanedBlob: null,
        cleanedUrl: null,
        cleanedSize: null,
        verified: false,
      };
    });

    setFiles((prev) => [...prev, ...initialEntries]);

    // Analyze each file asynchronously
    for (const entry of initialEntries) {
      const detected = await analyzeFileMetadata(entry.file);
      setFiles((prev) =>
        prev.map((item) =>
          item.id === entry.id
            ? {
              ...item,
              detected,
              status: "ready",
            }
            : item
        )
      );
    }

    toast.info(`Loaded ${validFiles.length} file${validFiles.length > 1 ? "s" : ""} for metadata inspection.`);
  }, []);

  // Drag & drop handlers
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFilesAdded(e.dataTransfer.files);
      }
    },
    [handleFilesAdded]
  );

  // Single file clean
  const cleanSingleFile = useCallback(
    async (fileId) => {
      const target = files.find((f) => f.id === fileId);
      if (!target) return;

      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "processing" } : f))
      );

      try {
        let cleanedBlob;
        const fileType = target.file.type.toLowerCase();

        if (fileType === "image/jpeg" || fileType === "image/jpg") {
          cleanedBlob = await stripJpegLossless(target.file);
        } else if (fileType === "application/pdf") {
          cleanedBlob = await stripPdfMetadata(target.file);
        } else if (fileType.startsWith("image/")) {
          cleanedBlob = await stripViaCanvas(target.file, target.file.type);
        } else {
          cleanedBlob = target.file;
        }

        const cleanedUrl = URL.createObjectURL(cleanedBlob);
        const postCheck = await analyzeFileMetadata(new File([cleanedBlob], target.name, { type: target.type }));

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                ...f,
                status: "cleaned",
                cleanedBlob,
                cleanedUrl,
                cleanedSize: cleanedBlob.size,
                verified: postCheck.totalCount === 0,
              }
              : f
          )
        );

        toast.success(`Metadata stripped from "${target.name}"!`);
      } catch (err) {
        console.error("Clean error:", err);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: "error", errorMsg: err.message } : f
          )
        );
        toast.error(`Could not clean "${target.name}": ${err.message}`);
      }
    },
    [files]
  );

  // Clean all files
  const cleanAllFiles = useCallback(async () => {
    if (files.length === 0) return;
    setIsCleaningAll(true);
    toast.info("Scrubbing metadata from all files...");

    for (const f of files) {
      if (f.status !== "cleaned") {
        await cleanSingleFile(f.id);
      }
    }

    setIsCleaningAll(false);
    toast.success("All files have been successfully sanitized!");
  }, [files, cleanSingleFile]);

  // Download all as ZIP
  const downloadAllAsZip = useCallback(async () => {
    const cleanedFiles = files.filter((f) => f.status === "cleaned" && f.cleanedBlob);
    if (cleanedFiles.length === 0) {
      toast.error("Please clean at least one file before downloading the ZIP bundle.");
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();
      cleanedFiles.forEach((f) => {
        const cleanName = `clean_${f.name}`;
        zip.file(cleanName, f.cleanedBlob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `sanitized_files_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success(`Downloaded ${cleanedFiles.length} sanitized files in ZIP!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate ZIP archive.");
    } finally {
      setIsZipping(false);
    }
  }, [files]);

  // Remove single file from queue
  const removeFile = useCallback((fileId) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === fileId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.cleanedUrl) URL.revokeObjectURL(target.cleanedUrl);
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  // Clear all files
  const clearAllFiles = useCallback(() => {
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      if (f.cleanedUrl) URL.revokeObjectURL(f.cleanedUrl);
    });
    setFiles([]);
    toast.info("Cleared all files.");
  }, [files]);

  // Load interactive demo file with simulated EXIF/GPS
  const loadDemoFile = useCallback(async () => {
    toast.info("Generating realistic privacy test photo with GPS & EXIF...");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");

      // Draw beautiful gradient scenery
      const grad = ctx.createLinearGradient(0, 0, 0, 420);
      grad.addColorStop(0, "#f97316"); // orange sunrise
      grad.addColorStop(0.5, "#db2777"); // pink
      grad.addColorStop(1, "#3b82f6"); // blue ocean
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 420);

      // Draw sun & mountain silhouette
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(320, 180, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.lineTo(160, 260);
      ctx.lineTo(320, 420);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(220, 420);
      ctx.lineTo(440, 220);
      ctx.lineTo(640, 420);
      ctx.fill();

      // Text label
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ToolsTrek Privacy Demo Scene (Un-sanitized)", 320, 395);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

      // Build mock EXIF with iPhone, GPS, Artist, and Date
      const zeroth = {};
      const exif = {};
      const gps = {};

      zeroth[piexif.ImageIFD.Make] = "Apple";
      zeroth[piexif.ImageIFD.Model] = "iPhone 15 Pro Max";
      zeroth[piexif.ImageIFD.Software] = "iOS 18.2 Camera App";
      zeroth[piexif.ImageIFD.DateTime] = "2026:09:15 17:34:10";
      zeroth[piexif.ImageIFD.Artist] = "Alex Morgan (Traveler)";

      exif[piexif.ExifIFD.DateTimeOriginal] = "2026:09:15 17:34:10";
      exif[piexif.ExifIFD.LensModel] = "iPhone 15 Pro Max back triple camera 24mm f/1.78";
      exif[piexif.ExifIFD.BodySerialNumber] = "DN6X9A770L19";

      // GPS for Golden Gate Bridge, San Francisco (37.8199° N, 122.4783° W)
      gps[piexif.GPSIFD.GPSLatitudeRef] = "N";
      gps[piexif.GPSIFD.GPSLatitude] = [
        [37, 1],
        [49, 1],
        [11, 1],
      ];
      gps[piexif.GPSIFD.GPSLongitudeRef] = "W";
      gps[piexif.GPSIFD.GPSLongitude] = [
        [122, 1],
        [28, 1],
        [42, 1],
      ];
      gps[piexif.GPSIFD.GPSAltitudeRef] = 0;
      gps[piexif.GPSIFD.GPSAltitude] = [67, 1];

      const exifObj = { "0th": zeroth, Exif: exif, GPS: gps };
      const exifBytes = piexif.dump(exifObj);
      const withExifDataUrl = piexif.insert(exifBytes, dataUrl);

      const res = await fetch(withExifDataUrl);
      const blob = await res.blob();
      const demoFile = new File([blob], "vacation_goldengate_photo.jpg", {
        type: "image/jpeg",
      });

      handleFilesAdded([demoFile]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate demo photo.");
    }
  }, [handleFilesAdded]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalTags = 0;
    let gpsCount = 0;
    let cleanedCount = 0;
    files.forEach((f) => {
      if (f.detected?.totalCount) totalTags += f.detected.totalCount;
      if (f.detected?.gps) gpsCount++;
      if (f.status === "cleaned") cleanedCount++;
    });
    return {
      totalFiles: files.length,
      totalTags,
      gpsCount,
      cleanedCount,
    };
  }, [files]);

  return (
    <ToolPageShell widthClassName="max-w-6xl">
      <div className="flex flex-col gap-10 py-6">
        {/* Top Navigation & Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BackButton />
          <div className="flex items-center gap-3">
            <FavoriteButton
              tool={{
                title: "Remove Metadata & EXIF Cleaner",
                link: "/tools/remove-metadata",
              }}
            />
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-brandColor bg-brandColor/10 dark:bg-brandColor/20 mb-4 border border-brandColor/20">
            <ShieldOff className="w-4 h-4 text-brandColor" />
            <span>100% Client-Side Privacy Shield</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Remove Metadata &amp;{" "}
            <span className="bg-linear-to-r from-brandColor via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              EXIF Cleaner
            </span>
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            Instantly wipe hidden GPS location tags, camera device serial numbers, author names, creation timestamps, and tracking footprints from your photos and PDF documents. 100% private in-browser processing.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-medium text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/70 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Lossless JPEG Stripping
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/70 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              Zero Cloud Uploads
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/70 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
              <FileArchive className="w-3.5 h-3.5 text-purple-500" />
              Batch ZIP Export
            </span>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer group ${isDragging
              ? "border-brandColor bg-brandColor/5 dark:bg-brandColor/10 scale-[1.01]"
              : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/60 hover:border-brandColor/60 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFilesAdded(e.target.files);
                e.target.value = "";
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brandColor/10 dark:bg-brandColor/20 text-brandColor flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Drag &amp; drop photos or PDFs here, or{" "}
                <span className="text-brandColor underline decoration-2 underline-offset-4">
                  browse files
                </span>
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Supports JPG, JPEG, PNG, WebP, and PDF files. Processed entirely inside your device.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadDemoFile();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Try Sample Photo with GPS
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area when files exist */}
        {files.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Overview Banner & Master Actions */}
            <div className="p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {stats.totalFiles}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {stats.totalFiles === 1 ? "File Queued" : "Files Queued"}
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />

                <div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {stats.totalTags}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Exposed Tags Found
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />

                <div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    {stats.gpsCount}
                    {stats.gpsCount > 0 && (
                      <MapPin className="w-4 h-4 text-rose-500 animate-bounce" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Location Tags Detected
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />

                <div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {stats.cleanedCount}/{stats.totalFiles}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Sanitized
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={cleanAllFiles}
                  disabled={isCleaningAll || stats.cleanedCount === stats.totalFiles}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <ShieldOff className="w-4 h-4" />
                  {isCleaningAll
                    ? "Sanitizing All..."
                    : stats.cleanedCount === stats.totalFiles
                      ? "All Cleaned"
                      : "Strip All Metadata"}
                </button>

                <button
                  type="button"
                  onClick={downloadAllAsZip}
                  disabled={isZipping || stats.cleanedCount === 0}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
                >
                  <FileArchive className="w-4 h-4" />
                  {isZipping ? "Creating ZIP..." : "Download ZIP"}
                </button>

                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Clear All Files"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom Options Accordion */}
            <details className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs sm:text-sm text-gray-900 dark:text-white select-none">
                <div className="flex items-center gap-2 text-brandColor">
                  <Sliders className="w-4 h-4" />
                  <span>Sanitization Preferences (Mode: {strippingMode === "all" ? "Wipe Everything (Recommended)" : "Custom Selection"})</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
              </summary>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="stripMode"
                      checked={strippingMode === "all"}
                      onChange={() => setStrippingMode("all")}
                      className="text-brandColor focus:ring-brandColor"
                    />
                    <span>Full Purge (Recommended: strips all EXIF, GPS, camera details, timestamps, and author tags)</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="stripMode"
                      checked={strippingMode === "custom"}
                      onChange={() => setStrippingMode("custom")}
                      className="text-brandColor focus:ring-brandColor"
                    />
                    <span>Custom Stripping Toggles</span>
                  </label>
                </div>

                {strippingMode === "custom" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pl-6 pt-2">
                    {[
                      { key: "stripGps", label: "Strip GPS Geolocation", icon: MapPin },
                      { key: "stripCamera", label: "Strip Camera & Device Serials", icon: Camera },
                      { key: "stripAuthor", label: "Strip Author & Copyright", icon: User },
                      { key: "stripDates", label: "Strip Timestamps & Dates", icon: Calendar },
                      { key: "stripSoftware", label: "Strip Software Footprints", icon: Cpu },
                    ].map(({ key, label, icon: Icon }) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={customOptions[key]}
                          onChange={(e) =>
                            setCustomOptions((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                          className="rounded text-brandColor focus:ring-brandColor"
                        />
                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </details>

            {/* File List Grid */}
            <div className="grid grid-cols-1 gap-4">
              {files.map((item) => {
                const isCleaned = item.status === "cleaned";
                const isProcessing = item.status === "processing";
                const hasGps = item.detected?.gps;
                const tagCount = item.detected?.totalCount || 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-gray-300 dark:hover:border-gray-700"
                  >
                    {/* Left: Preview thumbnail and info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                        {item.previewUrl ? (
                          <img
                            src={item.previewUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : item.type === "application/pdf" ? (
                          <FileText className="w-7 h-7 text-rose-500" />
                        ) : (
                          <ImageIcon className="w-7 h-7 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md"
                            title={item.name}
                          >
                            {item.name}
                          </h3>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {item.type.split("/")[1] || "FILE"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{formatBytes(item.size)}</span>
                          {isCleaned && item.cleanedSize && (
                            <>
                              <span>→</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatBytes(item.cleanedSize)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Privacy status badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {isCleaned ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                              Sanitized (0 tags)
                            </span>
                          ) : (
                            <>
                              {hasGps && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/60">
                                  <MapPin className="w-3 h-3 text-rose-500" />
                                  GPS Exposed ({item.detected.gps.lat}°, {item.detected.gps.lon}°)
                                </span>
                              )}
                              {tagCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  {tagCount} tags detected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                  No metadata found
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                      {/* Inspect details button */}
                      <button
                        type="button"
                        onClick={() => setInspectModalFile(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
                        title="Inspect all metadata fields"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {/* Clean / Download button */}
                      {isCleaned ? (
                        <a
                          href={item.cleanedUrl}
                          download={`clean_${item.name}`}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => cleanSingleFile(item.id)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-brandColor hover:bg-brandColorHover text-white transition-colors disabled:opacity-50 shadow-xs"
                        >
                          <ShieldOff className="w-3.5 h-3.5" />
                          <span>{isProcessing ? "Cleaning..." : "Strip"}</span>
                        </button>
                      )}

                      {/* Delete from queue */}
                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Before vs After Privacy Showcase Card */}
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Before vs. After Metadata Sanitization
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              See what modern smartphones and cameras silently attach to your photos versus our sanitized clean output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before (Exposed) */}
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Original Un-sanitized File
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                  Privacy Risk: High
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      GPS Location Coordinates:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      37.7749° N, 122.4194° W (Pinpoints home address or exact location)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Camera className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Camera &amp; Serial ID:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      Apple iPhone 15 Pro Max, Body Serial #DN6X9A770L19
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Exact Timestamp:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      September 15, 2026, 05:34:10 PM GMT+6
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Personal Author:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      Alex Morgan (Photographer Account Name)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* After (Cleaned) */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Cleaned ToolsTrek Output
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  100% Sanitized
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      GPS Location Coordinates:
                    </span>{" "}
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Purged &amp; Non-existent
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Camera &amp; Serial ID:
                    </span>{" "}
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Hardware fingerprint removed
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Exact Timestamp:
                    </span>{" "}
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Stripped
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Personal Author &amp; Software:
                    </span>{" "}
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Pure image pixels only
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards / Why Metadata Stripping Matters */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Why Metadata Removal is Crucial for Modern Privacy
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Every picture you take embeds invisible digital breadcrumbs that can compromise personal safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Stop Geolocation Stalking
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Smartphones record your exact GPS coordinates when taking photos. Stripping EXIF stops strangers from identifying your home, school, or work address.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Hardware Fingerprinting
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Camera serial numbers and lens profiles allow investigators to link multiple photos across separate accounts to a single physical device.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Marketplace &amp; Craigslist Safety
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Before uploading item photos to eBay, Facebook Marketplace, or dating apps, remove metadata so buyers cannot see where high-value items are stored.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                100% In-Browser &amp; Zero Latency
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Unlike online cloud converters that upload your confidential files to remote servers, ToolsTrek scrubs everything in your device&apos;s memory.
              </p>
            </div>
          </div>
        </div>

        {/* Step by Step Guide */}
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            How to Remove Metadata in 3 Quick Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-brandColor/10 text-brandColor flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Select or Drop Files
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Choose single or multiple JPG, PNG, WebP, or PDF files. The tool scans for hidden tags instantly.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-brandColor/10 text-brandColor flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Review &amp; Clean
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Inspect detected GPS or author tags, then click &quot;Strip All Metadata&quot; to purge all headers losslessly.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-brandColor/10 text-brandColor flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Download Clean Files
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Download your sanitized files individually or export all of them bundled in a convenient ZIP archive.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Everything you need to know about metadata removal and image privacy.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                q: "What types of metadata are removed by this tool?",
                a: "The tool strips EXIF metadata (camera make, model, lens details, aperture, shutter speed, ISO), GPS geolocation tags (latitude, longitude, altitude), timestamps (date taken, digitized, modified), author information (artist, copyright, owner name), serial numbers, and PDF document metadata (title, author, creator, keywords).",
              },
              {
                q: "Does removing metadata degrade image visual quality?",
                a: "No! For JPEG files, the tool performs lossless segment removal — it slices out the EXIF/APP1 marker blocks directly from the file header without recompressing or re-encoding the image DCT coefficients. For PNG and WebP, clean pixel-perfect canvas rendering eliminates ancillary chunks while preserving visual fidelity.",
              },
              {
                q: "Can I batch clean multiple photos and download them as a ZIP?",
                a: "Yes. You can drag and drop dozens of photos or PDF documents simultaneously. Click 'Strip All Metadata' to sanitize them in one click, and then click 'Download ZIP' to bundle all cleaned files into a single archive.",
              },
              {
                q: "Are my confidential files uploaded to any server or cloud?",
                a: "Never. The entire inspection and stripping process executes 100% client-side in your web browser's RAM memory using WebAssembly and pure JavaScript. Your files never touch external servers or cloud storage.",
              },
              {
                q: "How can I verify that the metadata is truly gone?",
                a: "After clicking 'Strip', our tool re-analyzes the generated file to ensure 0 tags remain. You can also re-upload the cleaned file into our View Metadata tool (/tools/view-metadata) to independently verify that all EXIF, GPS, and author tags have been completely eliminated.",
              },
              {
                q: "What is the difference between View Metadata, Edit Metadata, and Remove Metadata?",
                a: "View Metadata allows you to inspect and read all hidden tags without changing them. Edit Metadata lets you modify or spoof specific values (like changing GPS coordinates or camera model). Remove Metadata is dedicated to 1-click batch sanitization and wiping all sensitive information for maximum privacy.",
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm text-gray-900 dark:text-white">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Inspect Metadata Modal */}
        {inspectModalFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-brandColor" />
                  <h3 className="font-bold text-base text-gray-900 dark:text-white truncate max-w-xs">
                    {inspectModalFile.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectModalFile(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-4 text-xs">
                {inspectModalFile.status === "cleaned" ? (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>This file has been sanitized. All metadata tags were stripped.</span>
                  </div>
                ) : (
                  <>
                    {inspectModalFile.detected?.gps && (
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300">
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-700 dark:text-rose-400">
                          <MapPin className="w-4 h-4" />
                          GPS Coordinates Detected (High Privacy Risk)
                        </div>
                        <div>Latitude: {inspectModalFile.detected.gps.lat}°</div>
                        <div>Longitude: {inspectModalFile.detected.gps.lon}°</div>
                        {inspectModalFile.detected.gps.alt && (
                          <div>Altitude: {inspectModalFile.detected.gps.alt}m</div>
                        )}
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider text-[11px]">
                        Detected Metadata Tags ({inspectModalFile.detected?.totalCount || 0})
                      </h4>

                      {inspectModalFile.detected && Object.keys(inspectModalFile.detected.rawTags).length > 0 ? (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                          {Object.entries(inspectModalFile.detected.rawTags).map(([key, val]) => (
                            <div
                              key={key}
                              className="px-3 py-2 flex items-start justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/40"
                            >
                              <span className="font-medium text-gray-600 dark:text-gray-400 break-all">
                                {key}
                              </span>
                              <span className="text-right text-gray-900 dark:text-white font-mono break-all max-w-[55%]">
                                {typeof val === "object" ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 rounded-xl bg-gray-50 dark:bg-gray-800">
                          No embedded metadata tags detected in this file.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectModalFile(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
}
