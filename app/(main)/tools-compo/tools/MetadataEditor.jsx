"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  FileEdit,
  Upload,
  X,
  Copy,
  Check,
  MapPin,
  Camera,
  FileText,
  Image,
  Clock,
  HardDrive,
  Eye,
  Globe,
  Hash,
  Download,
  Trash2,
  Sliders,
  Compass,
  FileCode,
  ShieldCheck,
  RefreshCcw,
  Plus,
  Trash,
} from "lucide-react";
import piexif from "piexifjs";
import { PDFDocument } from "pdf-lib";

/* ─────────────────────────── EXIF Specification Lookup ─────────────────────────── */

const EXIF_SPEC = {
  "0th": {
    256: { name: "ImageWidth", label: "Image Width", type: "number" },
    257: { name: "ImageLength", label: "Image Height", type: "number" },
    258: { name: "BitsPerSample", label: "Bits Per Sample (Array)", type: "number_array" },
    259: { name: "Compression", label: "Compression Mode", type: "number" },
    270: { name: "ImageDescription", label: "Image Description", type: "string" },
    271: { name: "Make", label: "Camera Manufacturer", type: "string" },
    272: { name: "Model", label: "Camera Model", type: "string" },
    274: { name: "Orientation", label: "Orientation", type: "number", select: { 1: "Normal", 2: "Flip Horizontal", 3: "Rotate 180°", 4: "Flip Vertical", 6: "Rotate 90° CW", 8: "Rotate 90° CCW" } },
    282: { name: "XResolution", label: "Horizontal Resolution", type: "rational" },
    283: { name: "YResolution", label: "Vertical Resolution", type: "rational" },
    296: { name: "ResolutionUnit", label: "Resolution Unit", type: "number", select: { 1: "None", 2: "Inches", 3: "Centimeters" } },
    305: { name: "Software", label: "Processing Software", type: "string" },
    306: { name: "DateTime", label: "Modify Date & Time", type: "date" },
    315: { name: "Artist", label: "Artist / Photographer", type: "string" },
    33432: { name: "Copyright", label: "Copyright Notice", type: "string" },
  },
  "Exif": {
    33434: { name: "ExposureTime", label: "Shutter Speed (sec)", type: "rational_shutter" },
    33437: { name: "FNumber", label: "Aperture (f-stop)", type: "rational" },
    34850: { name: "ExposureProgram", label: "Exposure Program", type: "number", select: { 0: "Manual / Not Defined", 1: "Manual", 2: "Normal Program", 3: "Aperture Priority", 4: "Shutter Priority", 5: "Creative Program", 6: "Action Program", 7: "Portrait Mode", 8: "Landscape Mode" } },
    34855: { name: "ISOSpeedRatings", label: "ISO Speed Rating", type: "number_array" },
    36864: { name: "ExifVersion", label: "EXIF Version", type: "string" },
    36867: { name: "DateTimeOriginal", label: "Date Created", type: "date" },
    36868: { name: "DateTimeDigitized", label: "Date Digitized", type: "date" },
    37377: { name: "ShutterSpeedValue", label: "Shutter Speed Value (APEX)", type: "rational" },
    37378: { name: "ApertureValue", label: "Aperture Value (APEX)", type: "rational" },
    37379: { name: "BrightnessValue", label: "Brightness Value", type: "rational" },
    37380: { name: "ExposureBiasValue", label: "Exposure Bias", type: "rational" },
    37381: { name: "MaxApertureValue", label: "Max Aperture Value", type: "rational" },
    37382: { name: "SubjectDistance", label: "Subject Distance (meters)", type: "rational" },
    37383: { name: "MeteringMode", label: "Metering Mode", type: "number", select: { 0: "Unknown", 1: "Average", 2: "Center Weighted Average", 3: "Spot", 4: "MultiSpot", 5: "Pattern / Matrix", 6: "Partial" } },
    37384: { name: "LightSource", label: "Light Source", type: "number", select: { 0: "Unknown", 1: "Daylight", 2: "Fluorescent", 3: "Tungsten (Incandescent)", 4: "Flash", 9: "Fine Weather", 10: "Cloudy Weather", 11: "Shade" } },
    37385: { name: "Flash", label: "Flash Mode", type: "number", select: { 0: "No Flash", 1: "Flash Fired", 9: "Compulsory Fired", 16: "Compulsory Suppressed", 24: "Auto / No Flash", 25: "Auto / Fired" } },
    37386: { name: "FocalLength", label: "Focal Length (mm)", type: "rational" },
    37510: { name: "UserComment", label: "User Comment Annotation", type: "string_comment" },
    40961: { name: "ColorSpace", label: "Color Space Profile", type: "number", select: { 1: "sRGB", 65535: "Uncalibrated" } },
    40962: { name: "PixelXDimension", label: "EXIF Width", type: "number" },
    40963: { name: "PixelYDimension", label: "EXIF Height", type: "number" },
    41985: { name: "CustomRendered", label: "Custom Rendered", type: "number", select: { 0: "Normal Process", 1: "Custom Process" } },
    41986: { name: "ExposureMode", label: "Exposure Mode", type: "number", select: { 0: "Auto", 1: "Manual", 2: "Auto Bracket" } },
    41987: { name: "WhiteBalance", label: "White Balance Mode", type: "number", select: { 0: "Auto", 1: "Manual" } },
    41988: { name: "DigitalZoomRatio", label: "Digital Zoom Ratio", type: "rational" },
    41989: { name: "FocalLengthIn35mmFilm", label: "Focal Length 35mm Equiv", type: "number" },
    41990: { name: "SceneCaptureType", label: "Scene Capture Type", type: "number", select: { 0: "Standard", 1: "Landscape", 2: "Portrait", 3: "Night Scene" } },
    41991: { name: "GainControl", label: "Gain Control", type: "number", select: { 0: "None", 1: "Low Gain Up", 2: "High Gain Up", 3: "Low Gain Down", 4: "High Gain Down" } },
    41992: { name: "Contrast", label: "Contrast Mode", type: "number", select: { 0: "Normal", 1: "Soft", 2: "Hard" } },
    41993: { name: "Saturation", label: "Saturation Mode", type: "number", select: { 0: "Normal", 1: "Low", 2: "High" } },
    41994: { name: "Sharpness", label: "Sharpness Mode", type: "number", select: { 0: "Normal", 1: "Soft", 2: "Hard" } },
    41996: { name: "SubjectDistanceRange", label: "Subject Distance Range", type: "number", select: { 0: "Unknown", 1: "Macro", 2: "Close View", 3: "Distant View" } },
    42016: { name: "ImageUniqueID", label: "Unique Image ID", type: "string" },
    42032: { name: "CameraOwnerName", label: "Camera Owner Name", type: "string" },
    42033: { name: "BodySerialNumber", label: "Camera Body Serial", type: "string" },
    42034: { name: "LensSpecification", label: "Lens Spec Array", type: "rational_array" },
    42035: { name: "LensMake", label: "Lens Manufacturer", type: "string" },
    42036: { name: "LensModel", label: "Lens Model", type: "string" },
    42037: { name: "LensSerialNumber", label: "Lens Serial Number", type: "string" },
  },
  "GPS": {
    0: { name: "GPSVersionID", label: "GPS Version ID", type: "number_array" },
    1: { name: "GPSLatitudeRef", label: "GPS Latitude Ref", type: "string", select: { "N": "North Latitude", "S": "South Latitude" } },
    2: { name: "GPSLatitude", label: "GPS Latitude Coordinates", type: "gps_coords" },
    3: { name: "GPSLongitudeRef", label: "GPS Longitude Ref", type: "string", select: { "E": "East Longitude", "W": "West Longitude" } },
    4: { name: "GPSLongitude", label: "GPS Longitude Coordinates", type: "gps_coords" },
    5: { name: "GPSAltitudeRef", label: "GPS Altitude Ref", type: "number", select: { 0: "Above Sea Level", 1: "Below Sea Level" } },
    6: { name: "GPSAltitude", label: "GPS Altitude", type: "rational" },
    7: { name: "GPSTimeStamp", label: "GPS Time Stamp Array", type: "rational_array" },
    8: { name: "GPSSatellites", label: "GPS Satellites Tracked", type: "string" },
    9: { name: "GPSStatus", label: "GPS Receiver Status", type: "string", select: { "A": "Measurement Active", "V": "Interoperability / Warning" } },
    10: { name: "GPSMeasureMode", label: "GPS Measurement Mode", type: "string", select: { "2": "2-Dimensional", "3": "3-Dimensional" } },
    11: { name: "GPSDOP", label: "GPS Precision DOP", type: "rational" },
    12: { name: "GPSSpeedRef", label: "GPS Speed Unit", type: "string", select: { "K": "km/h", "M": "mph", "N": "knots" } },
    13: { name: "GPSSpeed", label: "GPS Speed", type: "rational" },
    14: { name: "GPSTrackRef", label: "GPS Track Ref", type: "string", select: { "T": "True Direction", "M": "Magnetic Direction" } },
    15: { name: "GPSTrack", label: "GPS Track Direction", type: "rational" },
    16: { name: "GPSImgDirectionRef", label: "GPS Image Direction Ref", type: "string", select: { "T": "True Direction", "M": "Magnetic Direction" } },
    17: { name: "GPSImgDirection", label: "GPS Image Direction", type: "rational" },
    18: { name: "GPSMapDatum", label: "GPS Map Geodetic Datum", type: "string" },
    29: { name: "GPSDateStamp", label: "GPS Date Stamp", type: "string" },
  }
};

/* ─────────────────────────── Formatting Helpers ─────────────────────────── */

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function detectMime(buffer) {
  const b = new Uint8Array(buffer, 0, Math.min(16, buffer.byteLength));
  const hex = Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join(" ");
  if (hex.startsWith("ff d8 ff")) return "image/jpeg";
  if (hex.startsWith("89 50 4e 47")) return "image/png";
  if (hex.startsWith("25 50 44 46")) return "application/pdf";
  return null;
}

function gpsToDecimal(val, ref) {
  if (!val || !Array.isArray(val)) return null;
  try {
    const [deg, min, sec] = val;
    const d = Array.isArray(deg) ? deg[0] / deg[1] : deg;
    const m = Array.isArray(min) ? min[0] / min[1] : min;
    const s = Array.isArray(sec) ? sec[0] / sec[1] : sec;
    let decimal = d + m / 60 + s / 3600;
    if (ref === "S" || ref === "W") decimal = -decimal;
    return parseFloat(decimal.toFixed(6));
  } catch {
    return null;
  }
}

function decimalToGPS(decimal) {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = (minutesNotTruncated - minutes) * 60;
  return [
    [degrees, 1],
    [minutes, 1],
    [Math.round(seconds * 100), 100],
  ];
}

function htmlDateTimeToExif(htmlDate) {
  if (!htmlDate) return "";
  const parts = htmlDate.split("T");
  const datePart = parts[0].replace(/-/g, ":");
  const timePart = parts[1] ? parts[1] + ":00" : "00:00:00";
  return `${datePart} ${timePart}`;
}

function exifDateTimeToHtml(exifDate) {
  if (!exifDate) return "";
  const parts = exifDate.split(" ");
  if (!parts[0]) return "";
  const datePart = parts[0].replace(/:/g, "-");
  const timePart = parts[1] ? parts[1].substring(0, 5) : "00:00";
  return `${datePart}T${timePart}`;
}

const GPS_PRESETS = [
  { name: "Eiffel Tower, Paris", lat: 48.8584, lon: 2.2945 },
  { name: "Tokyo Tower, Japan", lat: 35.6586, lon: 139.7454 },
  { name: "Statue of Liberty, NY", lat: 40.6892, lon: -74.0445 },
  { name: "Bermuda Triangle", lat: 25.0, lon: -71.0 },
  { name: "Colosseum, Rome", lat: 41.8902, lon: 12.4922 },
  { name: "Pyramids of Giza, Egypt", lat: 29.9792, lon: 31.1342 },
];

/* ─────────────────────────── UI Sub-Components ─────────────────────────── */

function DiffRow({ label, original, modified }) {
  const isChanged = original !== modified;
  if (!original && !modified) return null;
  return (
    <div className={`grid grid-cols-3 gap-2 py-2 px-3 rounded-lg border text-xs font-mono transition-all duration-200 ${
      isChanged 
        ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300" 
        : "bg-black/5 dark:bg-white/5 border-transparent text-gray-500 dark:text-white/40"
    }`}>
      <span className="truncate font-semibold">{label}</span>
      <span className="truncate border-r border-dashed border-gray-300 dark:border-white/10 pr-2">{original || "—"}</span>
      <span className="truncate font-bold text-gray-800 dark:text-white pl-2">{modified || "—"}</span>
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
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0d0d14] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <Eye className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-white/80">Header Hex Preview</span>
        <span className="text-xs text-gray-400 dark:text-white/30 ml-auto">First 256 bytes</span>
      </div>
      <div className="p-4 font-mono text-[10px] sm:text-xs leading-relaxed overflow-x-auto">
        <div className="flex gap-6 text-gray-400 dark:text-white/20 mb-2 uppercase tracking-widest text-[9px]">
          <span className="w-16">Offset</span>
          <span className="flex-1">Hex Data</span>
          <span>ASCII</span>
        </div>
        {lines.map((line) => (
          <div key={line.offset} className="flex gap-6 hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 py-0.5">
            <span className="w-16 text-emerald-600 dark:text-emerald-500/70 shrink-0">{line.offset}</span>
            <span className="text-blue-600 dark:text-blue-300/70 flex-1 whitespace-pre">{line.hex.padEnd(47)}</span>
            <span className="text-amber-600 dark:text-amber-300/60 whitespace-pre">{line.ascii}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Editor Component ─────────────────────────── */

export default function MetadataEditor() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [hexBuffer, setHexBuffer] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [copiedHash, setCopiedHash] = useState(false);
  
  // Originals vs Edited state dynamically mapping to all key fields
  const [originalMeta, setOriginalMeta] = useState({});
  const [editedMeta, setEditedMeta] = useState({});
  const [shaHash, setShaHash] = useState("");
  const [showDiff, setShowDiff] = useState(false);

  // Selector controls for Injecting new tags
  const [selectedTagToInject, setSelectedTagToInject] = useState("");
  const [injectGroup, setInjectGroup] = useState("0th");
  const [injectCustomId, setInjectCustomId] = useState("");
  const [injectCustomName, setInjectCustomName] = useState("");
  const [showInjectPanel, setShowInjectPanel] = useState(false);
  
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setFileType("");
    setHexBuffer(null);
    setImagePreview(null);
    setOriginalMeta({});
    setEditedMeta({});
    setShaHash("");
    setShowDiff(false);
    setShowInjectPanel(false);
  };

  const processFile = useCallback(async (f) => {
    if (!f) return;
    setLoading(true);
    setFile(f);
    setActiveTab("general");
    
    const buffer = await f.arrayBuffer();
    setHexBuffer(buffer);
    
    try {
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
      setShaHash(hash);
    } catch {}

    const mime = detectMime(buffer) || f.type || "application/octet-stream";
    setFileType(mime);

    const initial = {
      fileName: f.name,
      fileSize: formatBytes(f.size),
      mimeType: mime,
    };

    if (mime === "image/jpeg") {
      setImagePreview(URL.createObjectURL(f));
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const exif = piexif.load(e.target.result);
          if (exif) {
            for (const group of ["0th", "Exif", "GPS"]) {
              if (exif[group]) {
                for (const tagId of Object.keys(exif[group])) {
                  const spec = EXIF_SPEC[group]?.[tagId];
                  const keyName = spec ? `${group}_${spec.name}` : `${group}_tag_${tagId}`;
                  const rawValue = exif[group][tagId];
                  
                  let displayValue = "";
                  if (spec) {
                    if (spec.type === "date") {
                      displayValue = exifDateTimeToHtml(rawValue);
                    } else if (spec.type === "gps_coords") {
                      const refKey = group === "GPS" ? (tagId === "2" ? "1" : "3") : "";
                      const refVal = exif["GPS"]?.[refKey] || "";
                      displayValue = gpsToDecimal(rawValue, refVal) || "";
                    } else if (spec.type === "rational") {
                      displayValue = Array.isArray(rawValue) ? (rawValue[0] / rawValue[1]).toString() : rawValue.toString();
                    } else if (spec.type === "rational_shutter") {
                      if (Array.isArray(rawValue)) {
                        displayValue = rawValue[0] === 1 && rawValue[1] > 1 ? `1/${rawValue[1]}` : (rawValue[0] / rawValue[1]).toString();
                      } else {
                        displayValue = rawValue.toString();
                      }
                    } else if (spec.type === "rational_array") {
                      displayValue = Array.isArray(rawValue) ? rawValue.map(v => Array.isArray(v) ? (v[0]/v[1]).toFixed(4) : v).join(", ") : rawValue.toString();
                    } else if (spec.type === "number_array") {
                      displayValue = Array.isArray(rawValue) ? rawValue.join(", ") : rawValue.toString();
                    } else if (spec.type === "string_comment") {
                      displayValue = typeof rawValue === "string" && rawValue.startsWith("ASCII\0\0\0") ? rawValue.substring(8) : rawValue;
                    } else {
                      displayValue = rawValue.toString();
                    }
                  } else {
                    displayValue = Array.isArray(rawValue) ? rawValue.join(", ") : rawValue.toString();
                  }
                  
                  initial[keyName] = displayValue;
                }
              }
            }
          }
        } catch (err) {
          console.warn("Failed to load EXIF data", err);
        }
        setOriginalMeta(initial);
        setEditedMeta({ ...initial });
        setLoading(false);
      };
      reader.readAsDataURL(f);
    } else if (mime === "application/pdf") {
      try {
        const pdfDoc = await PDFDocument.load(buffer);
        initial.pdfTitle = pdfDoc.getTitle() || "";
        initial.pdfAuthor = pdfDoc.getAuthor() || "";
        initial.pdfSubject = pdfDoc.getSubject() || "";
        initial.pdfKeywords = pdfDoc.getKeywords() || "";
        initial.pdfCreator = pdfDoc.getCreator() || "";
        initial.pdfProducer = pdfDoc.getProducer() || "";
        
        const cDate = pdfDoc.getCreationDate();
        const mDate = pdfDoc.getModificationDate();
        
        if (cDate && !isNaN(cDate)) initial.pdfCreationDate = cDate.toISOString().slice(0, 16);
        if (mDate && !isNaN(mDate)) initial.pdfModDate = mDate.toISOString().slice(0, 16);
      } catch (err) {
        console.warn("Failed to load PDF properties", err);
      }
      setOriginalMeta(initial);
      setEditedMeta({ ...initial });
      setLoading(false);
    } else {
      if (mime.startsWith("image/")) {
        setImagePreview(URL.createObjectURL(f));
      }
      setOriginalMeta(initial);
      setEditedMeta({ ...initial });
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const updateField = (key, value) => {
    setEditedMeta((prev) => ({ ...prev, [key]: value }));
  };

  const deleteField = (key) => {
    setEditedMeta((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const applyGPSPreset = (preset) => {
    setEditedMeta((prev) => ({
      ...prev,
      GPS_GPSLatitude: preset.lat,
      GPS_GPSLongitude: preset.lon,
    }));
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      if (fileType === "image/jpeg") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const originalDataUrl = e.target.result;
          let exif = { "0th": {}, "Exif": {}, "GPS": {} };
          try {
            exif = piexif.load(originalDataUrl);
          } catch {}

          // Build modified EXIF structure based on state keys
          const newExif = { "0th": {}, "Exif": {}, "GPS": {} };

          for (const key of Object.keys(editedMeta)) {
            if (key === "fileName" || key === "fileSize" || key === "mimeType" || key.startsWith("pdf")) continue;
            
            const parts = key.split("_");
            const group = parts[0]; // "0th", "Exif", "GPS"
            const nameOrTag = parts.slice(1).join("_");
            
            let tagId = null;
            let spec = null;
            
            if (EXIF_SPEC[group]) {
              for (const [tid, s] of Object.entries(EXIF_SPEC[group])) {
                if (s.name === nameOrTag) {
                  tagId = parseInt(tid);
                  spec = s;
                  break;
                }
              }
            }
            
            if (!tagId && nameOrTag.startsWith("tag_")) {
              tagId = parseInt(nameOrTag.substring(4));
            }
            
            if (!tagId) continue;
            
            const rawVal = editedMeta[key];
            if (rawVal === "" || rawVal === undefined || rawVal === null) {
              continue; // If cleared, we don't serialize it
            }
            
            let writeVal = rawVal;
            if (spec) {
              if (spec.type === "date") {
                writeVal = htmlDateTimeToExif(rawVal);
              } else if (spec.type === "gps_coords") {
                const coord = parseFloat(rawVal);
                writeVal = decimalToGPS(coord);
              } else if (spec.type === "rational") {
                const fVal = parseFloat(rawVal);
                writeVal = [Math.round(fVal * 100), 100];
              } else if (spec.type === "rational_shutter") {
                if (rawVal.includes("/")) {
                  const sp = rawVal.split("/");
                  writeVal = [parseInt(sp[0]), parseInt(sp[1])];
                } else {
                  const fVal = parseFloat(rawVal);
                  writeVal = [Math.round(fVal * 1000), 1000];
                }
              } else if (spec.type === "rational_array") {
                writeVal = rawVal.split(",").map(v => {
                  const fVal = parseFloat(v.trim());
                  return [Math.round(fVal * 10000), 10000];
                });
              } else if (spec.type === "number_array") {
                writeVal = rawVal.split(",").map(v => parseInt(v.trim()));
              } else if (spec.type === "string_comment") {
                writeVal = "ASCII\0\0\0" + rawVal;
              } else if (spec.type === "number") {
                writeVal = parseInt(rawVal);
              }
            } else {
              if (!isNaN(rawVal) && rawVal.trim() !== "") {
                writeVal = parseInt(rawVal);
              }
            }
            
            newExif[group][tagId] = writeVal;
          }

          // Inject coordinate direction refs automatically if coords are present
          if (newExif["GPS"][2]) { // GPSLatitude
            const lat = parseFloat(editedMeta["GPS_GPSLatitude"]);
            newExif["GPS"][1] = lat >= 0 ? "N" : "S";
          }
          if (newExif["GPS"][4]) { // GPSLongitude
            const lon = parseFloat(editedMeta["GPS_GPSLongitude"]);
            newExif["GPS"][3] = lon >= 0 ? "E" : "W";
          }
          if (newExif["GPS"][6]) { // GPSAltitude
            const alt = parseFloat(editedMeta["GPS_GPSAltitude"]);
            newExif["GPS"][5] = alt >= 0 ? 0 : 1;
          }

          const exifBytes = piexif.dump(newExif);
          const modifiedDataUrl = piexif.insert(exifBytes, originalDataUrl);
          
          const response = await fetch(modifiedDataUrl);
          const blob = await response.blob();
          triggerDownload(blob, editedMeta.fileName || file.name);
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } else if (fileType === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer);
        
        pdfDoc.setTitle(editedMeta.pdfTitle || "");
        pdfDoc.setAuthor(editedMeta.pdfAuthor || "");
        pdfDoc.setSubject(editedMeta.pdfSubject || "");
        
        const kw = editedMeta.pdfKeywords || "";
        const kwArray = typeof kw === "string" 
          ? kw.split(",").map(k => k.trim()).filter(Boolean) 
          : Array.isArray(kw) 
            ? kw 
            : [];
        pdfDoc.setKeywords(kwArray);
        
        pdfDoc.setCreator(editedMeta.pdfCreator || "ToolsTrek Metadata Editor");
        pdfDoc.setProducer(editedMeta.pdfProducer || "pdf-lib Client");
        
        if (editedMeta.pdfCreationDate) pdfDoc.setCreationDate(new Date(editedMeta.pdfCreationDate));
        if (editedMeta.pdfModDate) pdfDoc.setModificationDate(new Date(editedMeta.pdfModDate));
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        triggerDownload(blob, editedMeta.fileName || file.name);
        setLoading(false);
      } else {
        triggerDownload(file, editedMeta.fileName || file.name);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving metadata. Please try again.");
      setLoading(false);
    }
  };

  const handleStripMetadata = async () => {
    setLoading(true);
    try {
      if (fileType === "image/jpeg") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const cleanedDataUrl = piexif.remove(e.target.result);
          const response = await fetch(cleanedDataUrl);
          const blob = await response.blob();
          triggerDownload(blob, `stripped_${file.name}`);
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } else if (fileType === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer);
        pdfDoc.setTitle("");
        pdfDoc.setAuthor("");
        pdfDoc.setSubject("");
        pdfDoc.setKeywords([]);
        pdfDoc.setCreator("");
        pdfDoc.setProducer("");
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        triggerDownload(blob, `stripped_${file.name}`);
        setLoading(false);
      } else if (fileType.startsWith("image/")) {
        const img = new window.Image();
        img.src = imagePreview;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            triggerDownload(blob, `stripped_${file.name}`);
            setLoading(false);
          }, fileType);
        };
      } else {
        alert("This file type does not support metadata stripping.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to strip metadata.");
      setLoading(false);
    }
  };

  const triggerDownload = (blob, filename) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const hasChanges = () => {
    const editKeys = Object.keys(editedMeta);
    const origKeys = Object.keys(originalMeta);
    if (editKeys.length !== origKeys.length) return true;
    return editKeys.some((k) => editedMeta[k] !== originalMeta[k]);
  };

  // Tag Injection Executor
  const handleInjectTag = () => {
    let finalKey = "";
    if (selectedTagToInject === "custom") {
      if (!injectCustomId) return alert("Please specify a tag ID");
      const name = injectCustomName || `tag_${injectCustomId}`;
      finalKey = `${injectGroup}_${name}`;
    } else if (selectedTagToInject) {
      const spec = EXIF_SPEC[injectGroup]?.[selectedTagToInject];
      if (spec) finalKey = `${injectGroup}_${spec.name}`;
    }

    if (finalKey) {
      updateField(finalKey, "");
      setShowInjectPanel(false);
      setSelectedTagToInject("");
      setInjectCustomId("");
      setInjectCustomName("");
    }
  };

  // Dynamic input renderer for standard and custom keys
  const renderDynamicInput = (key) => {
    if (key === "fileName") {
      return (
        <div key={key} className="mb-4">
          <label className="block text-xs font-bold text-gray-500 dark:text-white/45 mb-1.5 uppercase">File Name</label>
          <input
            type="text"
            value={editedMeta[key] || ""}
            onChange={(e) => updateField(key, e.target.value)}
            className="w-full bg-black/5 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:text-white transition-all duration-200"
          />
        </div>
      );
    }

    const parts = key.split("_");
    const group = parts[0];
    const nameOrTag = parts.slice(1).join("_");

    let spec = null;
    if (EXIF_SPEC[group]) {
      for (const s of Object.values(EXIF_SPEC[group])) {
        if (s.name === nameOrTag) {
          spec = s;
          break;
        }
      }
    }

    const label = spec ? spec.label : `Custom Tag [ID: ${nameOrTag.replace("tag_", "")}]`;
    const type = spec ? spec.type : "string";
    const val = editedMeta[key] || "";

    return (
      <div key={key} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-black/5 dark:bg-white/2 hover:border-violet-500/20 transition-all duration-150 flex flex-col gap-2 relative group/field">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-white/35 font-mono tracking-wider">{label}</span>
          <button
            type="button"
            onClick={() => deleteField(key)}
            className="p-1 text-gray-400 dark:text-white/20 hover:text-red-500 dark:hover:text-rose-400 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Delete this tag"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>

        {spec?.select ? (
          <select
            value={val}
            onChange={(e) => updateField(key, e.target.value)}
            className="w-full bg-white dark:bg-[#0c0c14] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 dark:text-white transition-all duration-200"
          >
            <option value="">-- Clear tag --</option>
            {Object.entries(spec.select).map(([optionKey, optionLabel]) => (
              <option key={optionKey} value={optionKey}>
                {optionLabel} ({optionKey})
              </option>
            ))}
          </select>
        ) : type === "date" ? (
          <input
            type="datetime-local"
            value={val}
            onChange={(e) => updateField(key, e.target.value)}
            className="w-full bg-white dark:bg-[#0c0c14] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 dark:text-white transition-all duration-200"
          />
        ) : type === "rational" || type === "rational_shutter" || type === "number" ? (
          <input
            type="text"
            value={val}
            onChange={(e) => updateField(key, e.target.value)}
            className="w-full bg-white dark:bg-[#0c0c14] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 dark:text-white transition-all duration-200 font-mono"
            placeholder={type === "rational_shutter" ? "1/125 or 0.5" : "Number"}
          />
        ) : (
          <input
            type="text"
            value={val}
            onChange={(e) => updateField(key, e.target.value)}
            className="w-full bg-white dark:bg-[#0c0c14] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 dark:text-white transition-all duration-200"
            placeholder="Type value..."
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative pb-16">
      {/* Background Radial Glow */}
      <div className="absolute top-[-10%] left-[5%] right-[5%] h-[400px] bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Header Info */}
      <div className="relative text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-300 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-4 tracking-widest uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          100% Client-Side Privacy Shield
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 bg-clip-text text-transparent">
            File Metadata
          </span>{" "}
          Editor
        </h1>
        <p className="text-gray-500 dark:text-white/50 text-base max-w-xl mx-auto">
          Securely spoof camera settings, modify dates, inject GPS coordinates, or completely strip hidden parameters from your images and documents instantly.
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
          className={`relative rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-5 py-24 px-8 text-center group overflow-hidden
            ${dragActive
              ? "border-violet-400 bg-violet-50 dark:bg-violet-500/10 scale-[1.01] shadow-2xl shadow-violet-500/5"
              : "border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-violet-500/60 hover:bg-violet-50/50 dark:hover:bg-white/[0.07] hover:shadow-xl hover:shadow-violet-500/2"
            }`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/0 via-fuchsia-500/0 to-cyan-500/0 group-hover:from-violet-500/5 group-hover:via-fuchsia-500/2 group-hover:to-cyan-500/5 transition-all duration-500 pointer-events-none" />

          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragActive ? "bg-violet-100 dark:bg-violet-500/20 scale-110" : "bg-gray-100 dark:bg-white/10 group-hover:bg-violet-500/10 group-hover:scale-105"}`}>
            <Upload className={`w-9 h-9 transition-colors duration-300 ${dragActive ? "text-violet-500" : "text-gray-400 dark:text-white/50 group-hover:text-violet-500"}`} />
          </div>
          <div>
            <p className="text-gray-800 dark:text-white font-bold text-xl">Upload your file to edit</p>
            <p className="text-gray-400 dark:text-white/40 text-sm mt-1 max-w-sm mx-auto">Click to browse or drop JPEGs, PNGs, and PDFs. Edited files download immediately.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {["JPEG", "PNG", "PDF", "WEBP"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 text-xs font-mono font-semibold">
                .{t.toLowerCase()}
              </span>
            ))}
          </div>
          <input ref={inputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) processFile(f); }} id="metadata-editor-file-input" accept=".jpg,.jpeg,.png,.pdf" />
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
            <Compass className="absolute inset-0 m-auto w-7 h-7 text-violet-500 animate-pulse" />
          </div>
          <p className="text-gray-500 dark:text-white/50 text-sm tracking-wide">Processing metadata structures...</p>
        </div>
      )}

      {/* Loaded Content and Forms */}
      {!loading && file && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* File Action Topbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 dark:border-white/15 bg-white/50 dark:bg-[#12121e]/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <FileEdit className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-base truncate max-w-[280px]" title={file.name}>
                  {file.name}
                </p>
                <p className="text-gray-400 dark:text-white/40 text-xs">
                  {formatBytes(file.size)} · {fileType || "Binary Stream"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleStripMetadata}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-600 dark:text-rose-400 text-sm font-semibold transition-all duration-150 cursor-pointer"
                title="Remove all GPS coordinates and camera signatures from the file"
              >
                <Trash2 className="w-4 h-4" />
                Strip Metadata
              </button>
              <button
                onClick={reset}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 text-sm font-semibold transition-all duration-150 cursor-pointer"
              >
                <RefreshCcw className="w-4 h-4" />
                Change File
              </button>
            </div>
          </div>

          {/* Main Dual-Column Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Previews & Info */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* File Preview */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/20 dark:bg-white/5 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/10">
                  <Image className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-bold text-gray-700 dark:text-white/80">File Preview</span>
                </div>
                <div className="p-6 flex justify-center items-center bg-gray-50/30 dark:bg-[#06060c]/30 min-h-[220px]">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl object-contain shadow-md" />
                  ) : fileType === "application/pdf" ? (
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-20 h-20 text-red-500/80 animate-bounce" />
                      <span className="text-sm text-gray-500 dark:text-white/40 font-semibold font-mono">Portable Document Format</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <FileCode className="w-16 h-16 text-cyan-500" />
                      <span className="text-sm text-gray-500 dark:text-white/40 font-mono">Unrecognized Binary</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SHA Hash & Integrity Block */}
              {shaHash && (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/20 dark:bg-white/5 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm font-bold text-gray-800 dark:text-white/95">Integrity & Checksum</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shaHash);
                        setCopiedHash(true);
                        setTimeout(() => setCopiedHash(false), 2000);
                      }}
                      className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedHash ? "Copied" : "Copy SHA"}
                    </button>
                  </div>
                  <div className="bg-black/5 dark:bg-black/25 px-3 py-2 rounded-xl border border-black/5 dark:border-white/5">
                    <p className="text-[10px] font-mono text-gray-400 dark:text-white/30 uppercase tracking-wider mb-0.5">SHA-256 Checksum</p>
                    <p className="text-xs font-mono text-gray-700 dark:text-white/70 break-all">{shaHash}</p>
                  </div>
                </div>
              )}

              {/* Hex Preview */}
              {hexBuffer && <HexPreview buffer={hexBuffer} />}
            </div>

            {/* Right Column: Editing Form */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Form Card Container */}
              <div className="rounded-3xl border border-gray-200 dark:border-white/15 bg-white/60 dark:bg-[#12121e]/75 backdrop-blur-xl shadow-xl overflow-hidden">
                
                {/* Tabs bar */}
                <div className="flex border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0c0c14]/40 p-2 gap-1 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
                      activeTab === "general"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                        : "text-gray-500 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    {fileType === "application/pdf" ? "Document Info" : "General Info (IFD0)"}
                  </button>

                  {fileType === "image/jpeg" && (
                    <>
                      <button
                        onClick={() => setActiveTab("camera")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
                          activeTab === "camera"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                            : "text-gray-500 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        Camera Settings (Exif)
                      </button>
                      <button
                        onClick={() => setActiveTab("gps")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
                          activeTab === "gps"
                            ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                            : "text-gray-500 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                        GPS Spoofing
                      </button>
                    </>
                  )}
                </div>

                {/* Tab Contents */}
                <div className="p-6 space-y-6">
                  
                  {/* General / PDF tab */}
                  {activeTab === "general" && (
                    <div className="space-y-4">
                      {/* Global File Name Edit */}
                      {renderDynamicInput("fileName")}

                      {fileType === "application/pdf" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {["pdfTitle", "pdfAuthor", "pdfSubject", "pdfKeywords", "pdfCreator", "pdfProducer", "pdfCreationDate", "pdfModDate"].map((field) => (
                            <div key={field} className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-gray-500 dark:text-white/45 uppercase">
                                {field.substring(3).replace(/([A-Z])/g, " $1").trim()}
                              </label>
                              <input
                                type={field.endsWith("Date") ? "datetime-local" : "text"}
                                value={editedMeta[field] || ""}
                                onChange={(e) => updateField(field, e.target.value)}
                                className="w-full bg-black/5 dark:bg-[#0c0c14] border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 dark:text-white transition-all duration-200"
                                placeholder={`Edit ${field.substring(3)}`}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Dynamic 0th IFD list
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.keys(editedMeta)
                            .filter((k) => k.startsWith("0th_"))
                            .map((k) => renderDynamicInput(k))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Camera & Lens tab */}
                  {activeTab === "camera" && fileType === "image/jpeg" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.keys(editedMeta)
                          .filter((k) => k.startsWith("Exif_"))
                          .map((k) => renderDynamicInput(k))}
                      </div>
                    </div>
                  )}

                  {/* GPS Spoofing tab */}
                  {activeTab === "gps" && fileType === "image/jpeg" && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Presets Grid */}
                      <div>
                        <span className="block text-xs font-bold text-gray-500 dark:text-white/45 mb-3 uppercase">Quick Location Targets</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {GPS_PRESETS.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => applyGPSPreset(p)}
                              className="px-3 py-2 rounded-xl text-left border border-gray-300 dark:border-white/10 hover:border-violet-500 hover:bg-violet-500/5 transition-all text-xs font-medium text-gray-700 dark:text-white/80 cursor-pointer"
                            >
                              <div className="font-semibold text-gray-900 dark:text-white">{p.name.split(",")[0]}</div>
                              <div className="text-[10px] text-gray-400 dark:text-white/30 truncate">{p.lat}, {p.lon}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* GPS Fields (Dynamic input mapper) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["GPS_GPSLatitude", "GPS_GPSLongitude", "GPS_GPSAltitude"].map((field) => {
                          const val = editedMeta[field] || "";
                          const label = field === "GPS_GPSLatitude" ? "Latitude" : field === "GPS_GPSLongitude" ? "Longitude" : "Altitude (meters)";
                          return (
                            <div key={field} className="flex flex-col gap-1.5 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-black/5 dark:bg-white/2">
                              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-white/35 font-mono">{label}</span>
                              <input
                                type="number"
                                step="any"
                                value={val}
                                onChange={(e) => updateField(field, e.target.value)}
                                className="w-full bg-white dark:bg-[#0c0c14] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 dark:text-white transition-all duration-200 font-mono"
                                placeholder={`Enter ${label.toLowerCase()}`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Render other custom/lesser-used GPS tags */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-gray-300 dark:border-white/10 pt-4">
                        {Object.keys(editedMeta)
                          .filter((k) => k.startsWith("GPS_") && k !== "GPS_GPSLatitude" && k !== "GPS_GPSLongitude" && k !== "GPS_GPSAltitude" && k !== "GPS_GPSLatitudeRef" && k !== "GPS_GPSLongitudeRef" && k !== "GPS_GPSAltitudeRef")
                          .map((k) => renderDynamicInput(k))}
                      </div>

                      {/* Compass status badge */}
                      {editedMeta.GPS_GPSLatitude && editedMeta.GPS_GPSLongitude && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400">
                          <Compass className="w-8 h-8 animate-spin-slow shrink-0" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider">Target Geotag Active</p>
                            <p className="text-xs font-mono">{editedMeta.GPS_GPSLatitude}, {editedMeta.GPS_GPSLongitude}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              deleteField("GPS_GPSLatitude");
                              deleteField("GPS_GPSLongitude");
                              deleteField("GPS_GPSAltitude");
                            }}
                            className="ml-auto p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 cursor-pointer"
                            title="Clear GPS tag"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Add new field Injection panel */}
                {fileType === "image/jpeg" && (
                  <div className="px-6 pb-4">
                    {showInjectPanel ? (
                      <div className="p-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 space-y-4">
                        <div className="flex justify-between items-center border-b border-violet-500/10 pb-2">
                          <span className="text-xs font-bold text-gray-800 dark:text-violet-300 uppercase tracking-wide">Inject Metadata Tag</span>
                          <button
                            type="button"
                            onClick={() => setShowInjectPanel(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase mb-1">Tag Group Namespace</label>
                            <select
                              value={injectGroup}
                              onChange={(e) => {
                                setInjectGroup(e.target.value);
                                setSelectedTagToInject("");
                              }}
                              className="w-full bg-white dark:bg-[#0c0c14] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 dark:text-white"
                            >
                              <option value="0th">0th IFD (General File Tags)</option>
                              <option value="Exif">Exif IFD (Camera & Capture Settings)</option>
                              <option value="GPS">GPS IFD (Geotag Details)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase mb-1">Standard Field Selection</label>
                            <select
                              value={selectedTagToInject}
                              onChange={(e) => setSelectedTagToInject(e.target.value)}
                              className="w-full bg-white dark:bg-[#0c0c14] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 dark:text-white"
                            >
                              <option value="">-- Choose standard field --</option>
                              {EXIF_SPEC[injectGroup] && Object.entries(EXIF_SPEC[injectGroup])
                                .filter(([, s]) => !editedMeta[`${injectGroup}_${s.name}`])
                                .map(([id, s]) => (
                                  <option key={id} value={id}>
                                    {s.label} ({s.name})
                                  </option>
                                ))}
                              <option value="custom">-- Custom tag by numeric ID --</option>
                            </select>
                          </div>
                        </div>

                        {selectedTagToInject === "custom" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-violet-500/10 pt-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase mb-1">Custom Numeric Tag ID</label>
                              <input
                                type="number"
                                value={injectCustomId}
                                onChange={(e) => setInjectCustomId(e.target.value)}
                                className="w-full bg-white dark:bg-[#0c0c14] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 dark:text-white"
                                placeholder="e.g. 270"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase mb-1">Custom Label Name</label>
                              <input
                                type="text"
                                value={injectCustomName}
                                onChange={(e) => setInjectCustomName(e.target.value)}
                                className="w-full bg-white dark:bg-[#0c0c14] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 dark:text-white"
                                placeholder="e.g. VendorSerial"
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleInjectTag}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-md shadow-violet-500/10 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Confirm Tag Inject
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowInjectPanel(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/5 text-xs font-bold transition-all duration-150 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Inject Metadata Field
                      </button>
                    )}
                  </div>
                )}

                {/* Footer details, comparison trigger, and downloads */}
                <div className="border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0c0c14]/40 px-6 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <button
                    onClick={() => setShowDiff(!showDiff)}
                    disabled={!hasChanges()}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                      hasChanges()
                        ? "border-violet-500 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 cursor-pointer"
                        : "border-gray-200 dark:border-white/5 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    Review Changes
                  </button>

                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition-all duration-150 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Apply & Download
                  </button>
                </div>

              </div>

              {/* Comparative Diff Section */}
              {showDiff && hasChanges() && (
                <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4 animate-slideDown">
                  <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
                    <Sliders className="w-4.5 h-4.5 text-amber-500" />
                    <span className="text-sm font-bold text-gray-800 dark:text-amber-200">Comparative Meta Diff</span>
                    <span className="text-xs text-amber-500/60 ml-auto font-mono">Original vs Modified</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {Object.keys(editedMeta).map((key) => (
                      <DiffRow
                        key={key}
                        label={key.includes("_") ? key.split("_").slice(1).join(" ").replace(/([A-Z])/g, " $1").trim() : key}
                        original={originalMeta[key]}
                        modified={editedMeta[key]}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            height: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
