"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  FileSearch,
  Upload,
  X,
  Copy,
  Check,
  MapPin,
  Camera,
  Film,
  Music,
  FileText,
  Image,
  Cpu,
  Clock,
  HardDrive,
  Info,
  ChevronDown,
  ChevronRight,
  Eye,
  Layers,
  Zap,
  Globe,
  Hash,
  BarChart2,
  Download,
} from "lucide-react";

/* ─────────────────────────── helpers ─────────────────────────── */

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
  if (isNaN(d)) return String(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function parseExif(buffer) {
  try {
    const view = new DataView(buffer);
    let offset = 0;
    if (view.getUint16(0, false) !== 0xffd8) return null;
    offset = 2;
    while (offset < buffer.byteLength - 2) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        const segLen = view.getUint16(offset, false);
        offset += 2;
        const exifHeader = String.fromCharCode(...new Uint8Array(buffer, offset, 6));
        if (!exifHeader.startsWith("Exif")) break;
        const tiffStart = offset + 6;
        return parseTIFF(buffer, tiffStart);
      } else if ((marker & 0xff00) === 0xff00) {
        offset += view.getUint16(offset, false);
      } else break;
    }
  } catch {}
  return null;
}

const EXIF_TAGS = {
  0x010e: "ImageDescription", 0x010f: "Make", 0x0110: "Model",
  0x0112: "Orientation", 0x011a: "XResolution", 0x011b: "YResolution",
  0x0128: "ResolutionUnit", 0x0131: "Software", 0x0132: "DateTime",
  0x013b: "Artist", 0x8298: "Copyright", 0x8769: "ExifIFD", 0x8825: "GPSIFD",
  0x9000: "ExifVersion", 0x9003: "DateTimeOriginal", 0x9004: "DateTimeDigitized",
  0x9201: "ShutterSpeedValue", 0x9202: "ApertureValue", 0x9204: "ExposureBiasValue",
  0x9205: "MaxApertureValue", 0x9207: "MeteringMode", 0x9208: "LightSource",
  0x9209: "Flash", 0x920a: "FocalLength", 0xa000: "FlashpixVersion",
  0xa001: "ColorSpace", 0xa002: "PixelXDimension", 0xa003: "PixelYDimension",
  0xa401: "CustomRendered", 0xa402: "ExposureMode", 0xa403: "WhiteBalance",
  0xa404: "DigitalZoomRatio", 0xa405: "FocalLengthIn35mmFilm",
  0xa406: "SceneCaptureType", 0xa408: "Contrast", 0xa409: "Saturation",
  0xa40a: "Sharpness", 0xa420: "ImageUniqueID", 0xa430: "CameraOwnerName",
  0xa431: "BodySerialNumber", 0xa432: "LensSpecification", 0xa433: "LensMake",
  0xa434: "LensModel", 0xa435: "LensSerialNumber", 0x8827: "ISOSpeedRatings",
  0x9286: "UserComment", 0x9290: "SubSecTime", 0x9291: "SubSecTimeOriginal",
};

const GPS_TAGS = {
  0: "GPSVersionID", 1: "GPSLatitudeRef", 2: "GPSLatitude",
  3: "GPSLongitudeRef", 4: "GPSLongitude", 5: "GPSAltitudeRef",
  6: "GPSAltitude", 7: "GPSTimeStamp", 8: "GPSSatellites",
  12: "GPSSpeedRef", 13: "GPSSpeed", 18: "GPSMapDatum",
  27: "GPSProcessingMethod", 29: "GPSDateStamp",
};

function parseTIFF(buffer, start) {
  const view = new DataView(buffer);
  const le = view.getUint16(start, false) === 0x4949;
  const read16 = (o) => view.getUint16(o, le);
  const read32 = (o) => view.getUint32(o, le);
  const readRat = (o) => { const num = read32(o); const den = read32(o + 4); return den !== 0 ? num / den : 0; };

  function readValue(type, count, valueOffset, tagOffset) {
    const sizes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
    const totalSize = sizes[type] * count;
    const off = totalSize <= 4 ? tagOffset : start + valueOffset;
    if (type === 2) { const bytes = new Uint8Array(buffer, off, count); return new TextDecoder().decode(bytes).replace(/\0/g, "").trim(); }
    if (type === 5 || type === 10) { const vals = []; for (let i = 0; i < count; i++) vals.push(readRat(off + i * 8)); return count === 1 ? vals[0] : vals; }
    if (type === 3 || type === 8) { const vals = []; for (let i = 0; i < count; i++) vals.push(read16(off + i * 2)); return count === 1 ? vals[0] : vals; }
    if (type === 4 || type === 9) { const vals = []; for (let i = 0; i < count; i++) vals.push(read32(off + i * 4)); return count === 1 ? vals[0] : vals; }
    if (type === 7) { return Array.from(new Uint8Array(buffer, off, Math.min(count, 16))).map((b) => b.toString(16).padStart(2, "0")).join(" "); }
    return null;
  }

  function parseIFD(ifdOffset, tagDict) {
    const result = {};
    try {
      const count = read16(start + ifdOffset);
      for (let i = 0; i < count; i++) {
        const entryOffset = start + ifdOffset + 2 + i * 12;
        const tag = read16(entryOffset);
        const type = read16(entryOffset + 2);
        const entryCount = read32(entryOffset + 4);
        const valueOffset = read32(entryOffset + 8);
        const name = tagDict[tag] || `0x${tag.toString(16).toUpperCase()}`;
        const val = readValue(type, entryCount, valueOffset, entryOffset + 8);
        if (val !== null && val !== undefined) result[name] = val;
      }
    } catch {}
    return result;
  }

  const ifdOffset = read32(start + 4);
  const mainTags = parseIFD(ifdOffset, EXIF_TAGS);
  let exifTags = {};
  if (mainTags.ExifIFD) exifTags = parseIFD(mainTags.ExifIFD, EXIF_TAGS);
  let gpsTags = {};
  if (mainTags.GPSIFD) gpsTags = parseIFD(mainTags.GPSIFD, GPS_TAGS);
  return { ...mainTags, ...exifTags, gps: Object.keys(gpsTags).length ? gpsTags : null };
}

function gpsToDecimal(val, ref) {
  if (!val || !Array.isArray(val)) return null;
  const [deg, min, sec] = val;
  let decimal = deg + min / 60 + sec / 3600;
  if (ref === "S" || ref === "W") decimal = -decimal;
  return decimal.toFixed(6);
}

function crc32(buffer) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let c = i; for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[i] = c; }
  let crc = 0xffffffff;
  const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 1024 * 512));
  for (const b of bytes) crc = (crc >>> 8) ^ table[(crc ^ b) & 0xff];
  return ((crc ^ 0xffffffff) >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

async function sha256(buffer) {
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch { return null; }
}

function parsePNG(buffer) {
  const view = new DataView(buffer);
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (view.getUint8(i) !== sig[i]) return null;
  const result = {};
  let offset = 8;
  while (offset < buffer.byteLength - 12) {
    const length = view.getUint32(offset, false);
    const type = String.fromCharCode(view.getUint8(offset + 4), view.getUint8(offset + 5), view.getUint8(offset + 6), view.getUint8(offset + 7));
    if (type === "IHDR") {
      result.Width = view.getUint32(offset + 8, false);
      result.Height = view.getUint32(offset + 12, false);
      result.BitDepth = view.getUint8(offset + 16);
      const colorTypes = { 0: "Grayscale", 2: "RGB", 3: "Indexed", 4: "Grayscale+Alpha", 6: "RGBA" };
      result.ColorType = colorTypes[view.getUint8(offset + 17)] || view.getUint8(offset + 17);
      result.CompressionMethod = view.getUint8(offset + 18) === 0 ? "Deflate" : "Unknown";
      result.FilterMethod = view.getUint8(offset + 19) === 0 ? "Adaptive" : "Unknown";
      result.InterlaceMethod = view.getUint8(offset + 20) === 0 ? "Non-interlaced" : "Adam7 Interlaced";
    }
    if (type === "tEXt" || type === "iTXt") {
      const bytes = new Uint8Array(buffer, offset + 8, length);
      const text = new TextDecoder().decode(bytes);
      const [key, ...rest] = text.split("\0");
      if (key && rest.join("").trim()) result[`Text:${key}`] = rest.join("").replace(/\0/g, " ").trim();
    }
    if (type === "pHYs") {
      const ppu_x = view.getUint32(offset + 8, false);
      const ppu_y = view.getUint32(offset + 12, false);
      const unit = view.getUint8(offset + 16);
      result.PixelAspectRatio = `${ppu_x} × ${ppu_y} ${unit === 1 ? "pixels/meter" : "pixels/unit"}`;
      if (unit === 1) result.DPI = `${Math.round(ppu_x * 0.0254)} × ${Math.round(ppu_y * 0.0254)} DPI`;
    }
    if (type === "IEND") break;
    offset += 12 + length;
  }
  return result;
}

function detectMime(buffer) {
  const b = new Uint8Array(buffer, 0, Math.min(16, buffer.byteLength));
  const hex = Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join(" ");
  if (hex.startsWith("ff d8 ff")) return "image/jpeg";
  if (hex.startsWith("89 50 4e 47")) return "image/png";
  if (hex.startsWith("47 49 46")) return "image/gif";
  if (hex.startsWith("42 4d")) return "image/bmp";
  if (hex.startsWith("52 49 46 46") && hex.slice(24, 29) === "57 41 56 45") return "audio/wav";
  if (hex.startsWith("49 44 33") || hex.startsWith("ff fb") || hex.startsWith("ff f3") || hex.startsWith("ff f2")) return "audio/mpeg";
  if (hex.startsWith("25 50 44 46")) return "application/pdf";
  if (hex.startsWith("50 4b 03 04")) return "application/zip";
  if (hex.startsWith("1a 45 df a3")) return "video/webm";
  if (hex.startsWith("38 42 50 53")) return "image/vnd.adobe.photoshop";
  if (hex.startsWith("00 01 00 00")) return "font/ttf";
  if (hex.startsWith("4f 54 54 4f")) return "font/otf";
  if (hex.startsWith("77 4f 46 46")) return "font/woff";
  if (hex.startsWith("77 4f 46 32")) return "font/woff2";
  if (hex.startsWith("4d 5a")) return "application/exe";
  return null;
}

/* ─────────────────────────── Section config ─────────────────────────── */
const CATEGORY_ICONS = {
  "File Info": HardDrive, "Image Info": Image, "EXIF Camera": Camera,
  "EXIF Settings": Zap, "EXIF Dates": Clock, GPS: MapPin,
  PDF: FileText, Audio: Music, Video: Film, "Text/Code": FileText,
  Font: Layers, Archive: Cpu, "Hash & Integrity": Hash, "PNG Chunks": Image,
};

// Section gradient: light bg / dark bg via Tailwind dark: prefix
const SECTION_STYLES = {
  "File Info":        { light: "bg-violet-50  border-violet-200",   dark: "dark:bg-violet-950/30  dark:border-violet-500/30",  icon: "text-violet-600  dark:text-violet-400",  badge: "bg-violet-100  dark:bg-violet-500/20 text-violet-700  dark:text-violet-300" },
  "Image Info":       { light: "bg-pink-50    border-pink-200",     dark: "dark:bg-pink-950/30    dark:border-pink-500/30",    icon: "text-pink-600    dark:text-pink-400",    badge: "bg-pink-100    dark:bg-pink-500/20   text-pink-700    dark:text-pink-300" },
  "EXIF Camera":      { light: "bg-orange-50  border-orange-200",   dark: "dark:bg-orange-950/30  dark:border-orange-500/30",  icon: "text-orange-600  dark:text-orange-400",  badge: "bg-orange-100  dark:bg-orange-500/20 text-orange-700  dark:text-orange-300" },
  "EXIF Settings":    { light: "bg-yellow-50  border-yellow-200",   dark: "dark:bg-yellow-950/30  dark:border-yellow-500/30",  icon: "text-yellow-600  dark:text-yellow-400",  badge: "bg-yellow-100  dark:bg-yellow-500/20 text-yellow-700  dark:text-yellow-300" },
  "EXIF Dates":       { light: "bg-blue-50    border-blue-200",     dark: "dark:bg-blue-950/30    dark:border-blue-500/30",    icon: "text-blue-600    dark:text-blue-400",    badge: "bg-blue-100    dark:bg-blue-500/20   text-blue-700    dark:text-blue-300" },
  GPS:                { light: "bg-emerald-50 border-emerald-200",  dark: "dark:bg-emerald-950/30 dark:border-emerald-500/30", icon: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
  PDF:                { light: "bg-red-50     border-red-200",      dark: "dark:bg-red-950/30     dark:border-red-500/30",     icon: "text-red-600     dark:text-red-400",     badge: "bg-red-100     dark:bg-red-500/20    text-red-700     dark:text-red-300" },
  Audio:              { light: "bg-purple-50  border-purple-200",   dark: "dark:bg-purple-950/30  dark:border-purple-500/30",  icon: "text-purple-600  dark:text-purple-400",  badge: "bg-purple-100  dark:bg-purple-500/20 text-purple-700  dark:text-purple-300" },
  Video:              { light: "bg-indigo-50  border-indigo-200",   dark: "dark:bg-indigo-950/30  dark:border-indigo-500/30",  icon: "text-indigo-600  dark:text-indigo-400",  badge: "bg-indigo-100  dark:bg-indigo-500/20 text-indigo-700  dark:text-indigo-300" },
  "Text/Code":        { light: "bg-teal-50    border-teal-200",     dark: "dark:bg-teal-950/30    dark:border-teal-500/30",    icon: "text-teal-600    dark:text-teal-400",    badge: "bg-teal-100    dark:bg-teal-500/20   text-teal-700    dark:text-teal-300" },
  "Hash & Integrity": { light: "bg-slate-50   border-slate-200",    dark: "dark:bg-slate-950/30   dark:border-slate-500/30",   icon: "text-slate-600   dark:text-slate-400",   badge: "bg-slate-100   dark:bg-slate-500/20  text-slate-700   dark:text-slate-300" },
  "PNG Chunks":       { light: "bg-fuchsia-50 border-fuchsia-200",  dark: "dark:bg-fuchsia-950/30 dark:border-fuchsia-500/30", icon: "text-fuchsia-600 dark:text-fuchsia-400", badge: "bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300" },
  Archive:            { light: "bg-amber-50   border-amber-200",    dark: "dark:bg-amber-950/30   dark:border-amber-500/30",   icon: "text-amber-600   dark:text-amber-400",   badge: "bg-amber-100   dark:bg-amber-500/20  text-amber-700   dark:text-amber-300" },
};
const DEFAULT_STYLE = {
  light: "bg-gray-50   border-gray-200",
  dark:  "dark:bg-gray-900/30 dark:border-gray-700",
  icon:  "text-gray-600 dark:text-gray-400",
  badge: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
};

/* ─────────────────────────── UI sub-components ─────────────────────────── */

function MetaSection({ title, data, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = CATEGORY_ICONS[title] || Info;
  const style = SECTION_STYLES[title] || DEFAULT_STYLE;
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!entries.length) return null;

  return (
    <div className={`rounded-2xl border ${style.light} ${style.dark} overflow-hidden`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${style.icon}`} />
          </div>
          <span className="font-semibold text-gray-800 dark:text-white text-sm tracking-wide">{title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
            {entries.length} fields
          </span>
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/50" />
          : <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/50" />}
      </button>

      {open && (
        <div className="px-5 pb-4 grid grid-cols-1 gap-1.5">
          {entries.map(([key, value]) => (
            <MetaRow key={key} label={key} value={value} />
          ))}
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const display = Array.isArray(value) ? value.join(", ") : String(value);

  const copy = () => {
    navigator.clipboard.writeText(display).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="group flex items-start gap-3 py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-150">
      <span className="text-xs text-gray-500 dark:text-white/50 font-mono min-w-[140px] shrink-0 pt-0.5 truncate" title={label}>
        {label}
      </span>
      <span className="text-xs text-gray-800 dark:text-white/90 break-all flex-1 leading-relaxed">{display}</span>
      <button
        onClick={copy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
        title="Copy value"
      >
        {copied
          ? <Check className="w-3 h-3 text-emerald-500" />
          : <Copy className="w-3 h-3 text-gray-400 dark:text-white/40" />}
      </button>
    </div>
  );
}

function HexPreview({ buffer }) {
  const bytes = new Uint8Array(buffer, 0, Math.min(256, buffer.byteLength));
  const lines = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const hex = Array.from(chunk).map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
    const ascii = Array.from(chunk).map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : "·")).join("");
    lines.push({ offset: i.toString(16).padStart(8, "0").toUpperCase(), hex, ascii });
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0d0d14] overflow-x-auto">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <Eye className="w-4 h-4 text-purple-500 dark:text-purple-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-white/80">Hex Preview</span>
        <span className="text-xs text-gray-400 dark:text-white/30 ml-auto">First 256 bytes</span>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed">
        <div className="flex gap-6 text-gray-400 dark:text-white/20 mb-2 text-[10px] uppercase tracking-widest">
          <span className="w-20">Offset</span>
          <span className="flex-1">Hex</span>
          <span>ASCII</span>
        </div>
        {lines.map((line) => (
          <div key={line.offset} className="flex gap-6 hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 py-0.5">
            <span className="w-20 text-emerald-600 dark:text-emerald-500/70 shrink-0">{line.offset}</span>
            <span className="text-blue-600 dark:text-blue-300/70 flex-1 whitespace-pre">{line.hex.padEnd(47)}</span>
            <span className="text-amber-600 dark:text-amber-300/60 whitespace-pre">{line.ascii}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value, colorClass }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colorClass} backdrop-blur-sm`}>
      <Icon className="w-5 h-5" />
      <div className="min-w-0">
        <div className="text-xs font-medium opacity-60">{label}</div>
        <div className="text-sm font-bold truncate">{value}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */

export default function MetadataViewer() {
  const [file, setFile] = useState(null);
  const [sections, setSections] = useState([]);
  const [statBadges, setStatBadges] = useState([]);
  const [hexBuffer, setHexBuffer] = useState(null);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [sha, setSha] = useState(null);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setSections([]);
    setStatBadges([]);
    setHexBuffer(null);
    setGpsCoords(null);
    setImagePreview(null);
    setSha(null);
  };

  const processFile = useCallback(async (f) => {
    if (!f) return;
    setLoading(true);
    setFile(f);
    setSections([]);
    setStatBadges([]);
    setGpsCoords(null);
    setSha(null);

    const buffer = await f.arrayBuffer();
    const detectedMime = detectMime(buffer) || f.type || "application/octet-stream";

    const shaHash = await sha256(buffer);
    setSha(shaHash);

    const crc = crc32(buffer);

    const bytes = new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 65536)));
    const freq = new Array(256).fill(0);
    for (const b of bytes) freq[b]++;
    let entropy = 0;
    for (const f2 of freq) {
      if (f2 > 0) { const p = f2 / bytes.length; entropy -= p * Math.log2(p); }
    }

    setHexBuffer(buffer);

    const ext = f.name.includes(".") ? f.name.split(".").pop().toUpperCase() : "Unknown";
    const fileInfo = {
      "File Name": f.name,
      "File Size": `${formatBytes(f.size)} (${f.size.toLocaleString()} bytes)`,
      "MIME Type (Declared)": f.type || "Unknown",
      "MIME Type (Detected)": detectedMime,
      Extension: ext,
      "Last Modified": formatDate(new Date(f.lastModified)),
      "Entropy (bits/byte)": `${entropy.toFixed(4)} / 8.0`,
      "CRC-32": crc,
    };

    const newSections = [{ title: "File Info", data: fileInfo }];

    const isImage = detectedMime.startsWith("image/");
    const isAudio = detectedMime.startsWith("audio/");
    const isVideo = detectedMime.startsWith("video/");
    const isPDF = detectedMime === "application/pdf";
    const isText = detectedMime.startsWith("text/");
    const isFont = detectedMime.startsWith("font/");
    const isZip = detectedMime.includes("zip");

    if (isImage) {
      const url = URL.createObjectURL(f);
      setImagePreview(url);
      await new Promise((res) => {
        const img = new window.Image();
        img.onload = () => {
          const imgMeta = {
            Width: `${img.naturalWidth} px`,
            Height: `${img.naturalHeight} px`,
            "Aspect Ratio": (() => { const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b)); const g = gcd(img.naturalWidth, img.naturalHeight); return `${img.naturalWidth / g}:${img.naturalHeight / g}`; })(),
            "Total Pixels": `${(img.naturalWidth * img.naturalHeight).toLocaleString()} px`,
          };
          newSections.push({ title: "Image Info", data: imgMeta });
          res();
        };
        img.onerror = res;
        img.src = url;
      });

      if (detectedMime === "image/jpeg") {
        const exif = parseExif(buffer);
        if (exif) {
          const camera = {}, settings = {}, dates = {};
          const cameraKeys = ["Make","Model","LensMake","LensModel","LensSerialNumber","BodySerialNumber","CameraOwnerName","Software","Artist","Copyright","ImageDescription","UserComment"];
          const dateKeys = ["DateTime","DateTimeOriginal","DateTimeDigitized","SubSecTime","SubSecTimeOriginal"];

          for (const [k, v] of Object.entries(exif)) {
            if (k === "gps" || k === "ExifIFD" || k === "GPSIFD") continue;
            if (cameraKeys.includes(k)) camera[k] = v;
            else if (dateKeys.includes(k)) dates[k] = v;
            else settings[k] = v;
          }

          if (settings.FocalLength) settings.FocalLength = `${Number(settings.FocalLength).toFixed(1)} mm`;
          if (settings.FocalLengthIn35mmFilm) settings.FocalLengthIn35mmFilm = `${settings.FocalLengthIn35mmFilm} mm`;
          if (settings.ApertureValue) settings.ApertureValue = `f/${Math.sqrt(Math.pow(2, settings.ApertureValue)).toFixed(1)}`;
          if (settings.ShutterSpeedValue) { const sv = settings.ShutterSpeedValue; const secs = 1 / Math.pow(2, sv); settings.ShutterSpeedValue = secs >= 1 ? `${secs.toFixed(2)} s` : `1/${Math.round(1 / secs)} s`; }
          const orientMap = { 1:"Normal",2:"Flip H",3:"Rotate 180°",4:"Flip V",6:"Rotate 90° CW",8:"Rotate 90° CCW" };
          if (settings.Orientation) settings.Orientation = orientMap[settings.Orientation] || settings.Orientation;
          const meteringMap = { 0:"Unknown",1:"Average",2:"Centre-Weighted",3:"Spot",4:"Multi-Spot",5:"Multi-Segment",6:"Partial" };
          if (settings.MeteringMode != null) settings.MeteringMode = meteringMap[settings.MeteringMode] || settings.MeteringMode;
          const flashMap = { 0:"No Flash",1:"Fired",9:"Compulsory/Fired",16:"Off",24:"Off/Auto",25:"Auto/Fired",32:"Not Available" };
          if (settings.Flash != null) settings.Flash = flashMap[settings.Flash] || settings.Flash;
          const wbMap = { 0:"Auto",1:"Manual" };
          if (settings.WhiteBalance != null) settings.WhiteBalance = wbMap[settings.WhiteBalance] || settings.WhiteBalance;
          const colorSpaceMap = { 1:"sRGB",65535:"Uncalibrated" };
          if (settings.ColorSpace != null) settings.ColorSpace = colorSpaceMap[settings.ColorSpace] || settings.ColorSpace;
          if (settings.PixelXDimension) settings.PixelXDimension = `${settings.PixelXDimension} px`;
          if (settings.PixelYDimension) settings.PixelYDimension = `${settings.PixelYDimension} px`;

          if (Object.keys(camera).length) newSections.push({ title: "EXIF Camera", data: camera });
          if (Object.keys(settings).length) newSections.push({ title: "EXIF Settings", data: settings });
          if (Object.keys(dates).length) newSections.push({ title: "EXIF Dates", data: dates });

          if (exif.gps) {
            const g = exif.gps;
            const lat = gpsToDecimal(g.GPSLatitude, g.GPSLatitudeRef);
            const lon = gpsToDecimal(g.GPSLongitude, g.GPSLongitudeRef);
            const gpsData = {};
            for (const [k, v] of Object.entries(g)) {
              gpsData[k] = Array.isArray(v) ? v.map((n) => typeof n === "number" ? n.toFixed(4) : n).join(", ") : v;
            }
            if (lat && lon) { gpsData["Decimal Coordinates"] = `${lat}, ${lon}`; setGpsCoords({ lat, lon }); }
            if (g.GPSAltitude) gpsData.GPSAltitude = `${Number(g.GPSAltitude).toFixed(2)} m ${g.GPSAltitudeRef === 1 ? "below" : "above"} sea level`;
            newSections.push({ title: "GPS", data: gpsData });
          }
        }
      }

      if (detectedMime === "image/png") {
        const pngData = parsePNG(buffer);
        if (pngData) newSections.push({ title: "PNG Chunks", data: pngData });
      }
    }

    if (isPDF) {
      const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer.slice(0, Math.min(buffer.byteLength, 8192)));
      const pdfInfo = {};
      const extract = (key, regex) => { const m = text.match(regex); if (m && m[1]) pdfInfo[key] = m[1].replace(/[()]/g, "").trim(); };
      extract("Title", /\/Title\s*\(([^)]+)\)/);
      extract("Author", /\/Author\s*\(([^)]+)\)/);
      extract("Subject", /\/Subject\s*\(([^)]+)\)/);
      extract("Keywords", /\/Keywords\s*\(([^)]+)\)/);
      extract("Creator", /\/Creator\s*\(([^)]+)\)/);
      extract("Producer", /\/Producer\s*\(([^)]+)\)/);
      extract("CreationDate", /\/CreationDate\s*\(([^)]+)\)/);
      extract("ModDate", /\/ModDate\s*\(([^)]+)\)/);
      const pagesMatch = text.match(/\/Count\s+(\d+)/);
      if (pagesMatch) pdfInfo["Page Count"] = pagesMatch[1];
      const versionMatch = text.match(/%PDF-([\d.]+)/);
      if (versionMatch) pdfInfo["PDF Version"] = versionMatch[1];
      pdfInfo["Encrypted"] = text.includes("/Encrypt") ? "Yes" : "No";
      if (Object.keys(pdfInfo).length) newSections.push({ title: "PDF", data: pdfInfo });
    }

    if (isAudio || isVideo) {
      await new Promise((res) => {
        const url = URL.createObjectURL(f);
        const el = isAudio ? new Audio() : document.createElement("video");
        const mediaMeta = {};
        el.preload = "metadata";
        el.onloadedmetadata = () => {
          if (el.duration) {
            const d = Math.round(el.duration);
            const h = Math.floor(d / 3600);
            const m = Math.floor((d % 3600) / 60);
            const s = d % 60;
            mediaMeta["Duration"] = h ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
            mediaMeta["Duration (seconds)"] = `${el.duration.toFixed(3)} s`;
          }
          if (el.videoWidth) {
            mediaMeta["Video Width"] = `${el.videoWidth} px`;
            mediaMeta["Video Height"] = `${el.videoHeight} px`;
          }
          URL.revokeObjectURL(url);
          newSections.push({ title: isAudio ? "Audio" : "Video", data: mediaMeta });
          res();
        };
        el.onerror = () => { URL.revokeObjectURL(url); res(); };
        el.src = url;
      });
    }

    if (isText || f.name.match(/\.(js|ts|jsx|tsx|py|json|xml|css|html|md|yaml|yml|sh|sql|java|cs|cpp|c|go|rb|php|swift|kt|rs)$/i)) {
      const textContent = new TextDecoder("utf-8", { fatal: false }).decode(buffer.slice(0, 8192));
      const lines = textContent.split("\n");
      const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
      const chars = textContent.length;
      const firstBytes = new Uint8Array(buffer);
      newSections.push({
        title: "Text/Code",
        data: {
          "Line Count": lines.length.toLocaleString(),
          "Word Count": words.toLocaleString(),
          "Character Count": chars.toLocaleString(),
          "Average Line Length": `${(chars / lines.length).toFixed(1)} chars`,
          "Has BOM": (firstBytes[0] === 0xef && firstBytes[1] === 0xbb) ? "Yes (UTF-8 BOM)" : "No",
          "Line Endings": textContent.includes("\r\n") ? "CRLF (Windows)" : textContent.includes("\r") ? "CR (Classic Mac)" : "LF (Unix)",
        },
      });
    }

    if (isFont) newSections.push({ title: "Font", data: { "Font Format": detectedMime, "File Size": formatBytes(f.size) } });

    if (isZip) {
      const zipBytes = new Uint8Array(buffer);
      let fileCount = 0;
      for (let i = 0; i < zipBytes.length - 4; i++) {
        if (zipBytes[i] === 0x50 && zipBytes[i+1] === 0x4b && zipBytes[i+2] === 0x03 && zipBytes[i+3] === 0x04) fileCount++;
      }
      newSections.push({ title: "Archive", data: { "Estimated File Count": fileCount, "ZIP Signature": "PK\\x03\\x04 (Valid)" } });
    }

    newSections.push({
      title: "Hash & Integrity",
      data: {
        "SHA-256": shaHash || "Calculating…",
        "CRC-32": crc,
        "File Size (exact bytes)": f.size.toLocaleString(),
        "Entropy": `${entropy.toFixed(4)} bits/byte`,
        "Magic Bytes": Array.from(new Uint8Array(buffer, 0, Math.min(8, buffer.byteLength))).map((b) => "0x" + b.toString(16).toUpperCase().padStart(2, "0")).join(" "),
      },
    });

    setStatBadges([
      { icon: HardDrive, label: "File Size",      value: formatBytes(f.size),         colorClass: "border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300" },
      { icon: FileSearch, label: "MIME Type",     value: detectedMime,                colorClass: "border-pink-200   dark:border-pink-500/30   bg-pink-50   dark:bg-pink-500/10   text-pink-700   dark:text-pink-300" },
      { icon: Layers,    label: "Sections Found", value: `${newSections.length} sections`, colorClass: "border-blue-200  dark:border-blue-500/30  bg-blue-50  dark:bg-blue-500/10  text-blue-700  dark:text-blue-300" },
      { icon: BarChart2, label: "Entropy",        value: `${entropy.toFixed(2)} bits/byte`, colorClass: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    ]);

    setSections(newSections);
    setLoading(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const exportJSON = () => {
    const obj = {};
    for (const s of sections) obj[s.title] = s.data;
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${file?.name || "metadata"}_metadata.json`;
    a.click();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-4 tracking-widest uppercase">
          <FileSearch className="w-3.5 h-3.5" />
          100% Browser-Based · Zero Upload
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 dark:from-purple-400 dark:via-pink-400 dark:to-amber-400 bg-clip-text text-transparent">
            File Metadata
          </span>{" "}
          Viewer
        </h1>
        <p className="text-gray-500 dark:text-white/50 text-base max-w-xl mx-auto">
          Drop any file — image, PDF, audio, video, document, font, archive — and instantly reveal every hidden metadata field, EXIF data, GPS coordinates, hash values, and more.
        </p>
      </div>

      {/* Drop Zone */}
      {!file && (
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 py-20 px-8 text-center group
            ${dragActive
              ? "border-purple-400 bg-purple-50 dark:bg-purple-500/10 scale-[1.01]"
              : "border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 hover:border-purple-400/70 hover:bg-purple-50/50 dark:hover:bg-white/[0.07]"
            }`}
        >
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragActive ? "bg-purple-100 dark:bg-purple-500/20 scale-110" : "bg-gray-100 dark:bg-white/10 group-hover:bg-purple-50 dark:group-hover:bg-white/15"}`}>
            <Upload className={`w-9 h-9 transition-colors duration-300 ${dragActive ? "text-purple-500" : "text-gray-400 dark:text-white/50 group-hover:text-purple-500 dark:group-hover:text-white/80"}`} />
          </div>
          <div>
            <p className="text-gray-800 dark:text-white font-semibold text-lg">Drop any file here</p>
            <p className="text-gray-400 dark:text-white/40 text-sm mt-1">or click to browse — images, PDFs, audio, video, fonts, archives…</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {["JPEG","PNG","PDF","MP3","MP4","ZIP","SVG","TTF","WEBP","TXT","…"].map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 text-xs font-mono">
                .{t.toLowerCase()}
              </span>
            ))}
          </div>
          <input ref={inputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) processFile(f); }} id="metadata-file-input" />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-purple-300 dark:border-purple-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            <FileSearch className="absolute inset-0 m-auto w-5 h-5 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-gray-500 dark:text-white/50 text-sm animate-pulse">Analyzing file metadata…</p>
        </div>
      )}

      {/* Results */}
      {!loading && file && sections.length > 0 && (
        <div className="space-y-6">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <FileSearch className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[240px]" title={file.name}>{file.name}</p>
                <p className="text-gray-400 dark:text-white/40 text-xs">{formatBytes(file.size)} · {file.type || "Unknown MIME"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportJSON}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium transition-all duration-150 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-all duration-150 cursor-pointer"
              >
                <X className="w-4 h-4" />
                New File
              </button>
            </div>
          </div>

          {/* Stat Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statBadges.map((b, i) => <StatBadge key={i} {...b} />)}
          </div>

          {/* Image Preview + GPS */}
          {(imagePreview || gpsCoords) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imagePreview && (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-white/10">
                    <Image className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-white/80">Image Preview</span>
                  </div>
                  <div className="p-4 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="max-h-60 max-w-full rounded-xl object-contain" />
                  </div>
                </div>
              )}
              {gpsCoords && (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-200 dark:border-emerald-500/20">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-white/80">GPS Location Found</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="text-sm text-gray-700 dark:text-white/70 font-mono bg-black/5 dark:bg-black/20 px-3 py-2 rounded-lg">
                      {gpsCoords.lat}, {gpsCoords.lon}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-white/40">This photo contains embedded GPS coordinates.</p>
                    <a
                      href={`https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors duration-150"
                    >
                      <Globe className="w-4 h-4" />
                      View on Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SHA display */}
          {sha && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-5 py-3 flex items-start gap-3">
              <Hash className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 dark:text-white/40 mb-1 font-medium">SHA-256 Hash</p>
                <p className="text-xs font-mono text-gray-700 dark:text-white/70 break-all">{sha}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(sha)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 shrink-0 transition-colors"
                title="Copy hash"
              >
                <Copy className="w-3.5 h-3.5 text-gray-400 dark:text-white/40" />
              </button>
            </div>
          )}

          {/* Metadata Sections */}
          <div className="space-y-4">
            {sections.map((s, i) => (
              <MetaSection key={s.title + i} title={s.title} data={s.data} defaultOpen={i < 3} />
            ))}
          </div>

          {/* Hex Preview */}
          {hexBuffer && <HexPreview buffer={hexBuffer} />}
        </div>
      )}
    </div>
  );
}
