"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { toast } from "sonner";
import {
  AlertCircle,
  Barcode,
  CheckCircle2,
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import { useRecentTools } from "@/hooks/useRecentTools";

const TOOL_META = {
  title: "Barcode Generator",
  link: "/tools/barcode-generator",
  description:
    "Generate print-ready Code 128, EAN-13, UPC, Code 39 and ITF-14 barcodes with scan checks, batch CSV labels and PDF sheets.",
  icon: "Barcode",
  keywords: [
    "barcode generator",
    "ean 13 generator",
    "code 128 barcode",
    "barcode label maker",
    "bulk barcode generator",
  ],
  categories: ["Developer", "Design"],
};

const FORMATS = [
  {
    value: "CODE128",
    label: "Code 128",
    hint: "Any letters, numbers and punctuation. Best all-round choice.",
    sample: "TREK-2026-001",
  },
  {
    value: "EAN13",
    label: "EAN-13",
    hint: "Retail products. Enter 12 digits and we add the check digit.",
    sample: "9780201379624",
    digits: 13,
  },
  {
    value: "EAN8",
    label: "EAN-8",
    hint: "Small retail packages. Enter 7 digits and we add the check digit.",
    sample: "96385074",
    digits: 8,
  },
  {
    value: "UPC",
    label: "UPC-A",
    hint: "North American retail products. Enter 11 digits and we add the check digit.",
    sample: "036000291452",
    digits: 12,
  },
  {
    value: "CODE39",
    label: "Code 39",
    hint: "Uppercase letters, numbers and - . $ / + % and spaces.",
    sample: "TOOLS-TREK",
  },
  {
    value: "ITF14",
    label: "ITF-14",
    hint: "Shipping cartons. Enter 13 digits and we add the check digit.",
    sample: "1540014128876",
    digits: 14,
  },
  {
    value: "MSI",
    label: "MSI",
    hint: "Numeric inventory and library labels.",
    sample: "1234567890",
    digitsOnly: true,
  },
  {
    value: "pharmacode",
    label: "Pharmacode",
    hint: "Pharmaceutical packaging. Use a number from 3 to 131070.",
    sample: "12345",
    digitsOnly: true,
  },
  {
    value: "codabar",
    label: "Codabar",
    hint: "Libraries and blood banks. Start and end with A, B, C or D.",
    sample: "A123456789B",
  },
];

const DEFAULT_OPTIONS = {
  width: 2,
  height: 92,
  margin: 12,
  displayValue: true,
  fontSize: 16,
  textMargin: 4,
  textAlign: "center",
  textPosition: "bottom",
  font: "monospace",
  lineColor: "#111827",
  background: "#ffffff",
  transparent: false,
  rotation: 0,
  autoFix: true,
  printWidth: 55,
  dpi: 300,
};

const BATCH_SAMPLE = `9780201379624,Coffee beans 1 kg
9780201379631,Coffee beans 500 g
036000291452,Mineral water 6-pack
TREK-2026-001,ToolsTrek sample label`;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function slugify(value, fallback = "barcode") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || fallback;
}

function getFormatMeta(format) {
  return FORMATS.find((item) => item.value === format) || FORMATS[0];
}

function calculateCheckDigit(value) {
  const digits = String(value).replace(/\D/g, "");
  let sum = 0;
  for (let index = digits.length - 1, weightIndex = 0; index >= 0; index -= 1) {
    sum += Number(digits[index]) * (weightIndex % 2 === 0 ? 3 : 1);
    weightIndex += 1;
  }
  return String((10 - (sum % 10)) % 10);
}

function normalizeValue(rawValue, format, autoFix) {
  const formatMeta = getFormatMeta(format);
  let value = String(rawValue ?? "").trim();

  if (!value) {
    return { value, error: "Enter a value to generate a barcode." };
  }

  if (format === "CODE39") {
    value = value.toUpperCase();
    if (!/^[0-9A-Z\-. $/+%]+$/.test(value)) {
      return {
        value,
        error: "Code 39 supports uppercase letters, numbers, spaces and - . $ / + % only.",
      };
    }
    return { value, repaired: value !== rawValue.trim() };
  }

  if (format === "CODE128") {
    if (!/^[\x20-\x7E]+$/.test(value)) {
      return {
        value,
        error: "Code 128 supports printable ASCII characters. Remove emoji or accented symbols.",
      };
    }
    if (value.length > 80) {
      return {
        value,
        error: "Keep Code 128 values at 80 characters or fewer so the bars stay scannable.",
      };
    }
    return { value };
  }

  if (format === "codabar") {
    if (!/^[A-D][0-9\-$:/.+]+[A-D]$/i.test(value)) {
      return {
        value,
        error: "Codabar must start and end with A, B, C or D, for example A123456789B.",
      };
    }
    return { value: value.toUpperCase() };
  }

  if (formatMeta.digitsOnly) {
    if (!/^\d+$/.test(value)) {
      return { value, error: `${formatMeta.label} accepts digits only.` };
    }
    if (format === "pharmacode" && (Number(value) < 3 || Number(value) > 131070)) {
      return { value, error: "Pharmacode values must be between 3 and 131070." };
    }
    return { value };
  }

  if (formatMeta.digits) {
    if (!/^\d+$/.test(value)) {
      return { value, error: `${formatMeta.label} accepts digits only.` };
    }

    const checkDigitLength = formatMeta.digits - 1;
    if (value.length === checkDigitLength) {
      if (!autoFix) {
        return {
          value,
          error: `${formatMeta.label} needs ${formatMeta.digits} digits. Enable check-digit repair or add the final digit.`,
        };
      }
      const withCheck = `${value}${calculateCheckDigit(value)}`;
      return { value: withCheck, repaired: true };
    }

    if (value.length !== formatMeta.digits) {
      return {
        value,
        error: `${formatMeta.label} needs ${checkDigitLength} data digits (or ${formatMeta.digits} with the check digit).`,
      };
    }

    const expected = calculateCheckDigit(value.slice(0, -1));
    if (value.slice(-1) !== expected) {
      if (autoFix) {
        return {
          value: `${value.slice(0, -1)}${expected}`,
          repaired: true,
          originalCheckDigit: value.slice(-1),
        };
      }
      return {
        value,
        error: `The check digit should be ${expected}, not ${value.slice(-1)}. Enable repair or correct the value.`,
      };
    }

    return { value };
  }

  return { value };
}

function buildBarcodeOptions(options) {
  return {
    format: undefined,
    width: clamp(Number(options.width) || 2, 1, 8),
    height: clamp(Number(options.height) || 92, 30, 240),
    margin: clamp(Number(options.margin) || 0, 0, 60),
    displayValue: options.displayValue,
    fontSize: clamp(Number(options.fontSize) || 16, 8, 48),
    textMargin: clamp(Number(options.textMargin) || 0, 0, 20),
    textAlign: options.textAlign,
    textPosition: options.textPosition,
    font: options.font,
    lineColor: options.lineColor,
    background: options.transparent ? "transparent" : options.background,
    backgroundIndex: 0,
  };
}

function createBarcodeSvg(value, format, options) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svg, value, {
    ...buildBarcodeOptions(options),
    format,
    valid: () => {},
  });
  return svg;
}

function getSvgSize(svg) {
  const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number);
  const width =
    Number(svg.getAttribute("width")) ||
    (viewBox && Number.isFinite(viewBox[2]) ? viewBox[2] : 0) ||
    1;
  const height =
    Number(svg.getAttribute("height")) ||
    (viewBox && Number.isFinite(viewBox[3]) ? viewBox[3] : 0) ||
    1;
  return { width, height };
}

function serializeSvg(svg) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svg)}`;
}

function svgToPng(svg, scale = 3, background = null) {
  return new Promise((resolve, reject) => {
    const { width, height } = getSvgSize(svg);
    const canvas = document.createElement("canvas");
    const targetScale = clamp(Number(scale) || 1, 1, 14);
    canvas.width = Math.max(1, Math.round(width * targetScale));
    canvas.height = Math.max(1, Math.round(height * targetScale));
    const context = canvas.getContext("2d");

    if (!context) {
      reject(new Error("Canvas rendering is not available in this browser."));
      return;
    }

    if (background) {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    const image = new Image();
    const url = URL.createObjectURL(
      new Blob([serializeSvg(svg)], { type: "image/svg+xml;charset=utf-8" }),
    );

    image.onload = () => {
      try {
        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The barcode image could not be rendered."));
    };

    image.src = url;
  });
}

function getExportScale(options, svg) {
  const { width } = getSvgSize(svg);
  const dpi = clamp(Number(options.dpi) || 300, 72, 600);
  const printWidth = clamp(Number(options.printWidth) || 55, 10, 300);
  const targetPixels = (printWidth / 25.4) * dpi;
  return clamp(targetPixels / width, 1, 14);
}

function dataUrlToUint8(dataUrl) {
  const base64 = String(dataUrl).split(",")[1] || "";
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function getContrastRatio(foreground, background) {
  const parse = (hex) => {
    const normalized = String(hex).replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(normalized)) return [0, 0, 0];
    return [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16));
  };
  const luminance = (hex) => {
    const channels = parse(hex).map((channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function formatMm(value) {
  return `${Number(value).toFixed(1)} mm`;
}

function buildAudit(svg, options, format, value, normalized, scanResult) {
  const { width: svgWidth, height: svgHeight } = getSvgSize(svg);
  const printWidth = clamp(Number(options.printWidth) || 55, 10, 300);
  const quietModules = (Number(options.margin) || 0) / (Number(options.width) || 1);
  const quietMm = (Number(options.margin) || 0) / (svgWidth || 1) * printWidth;
  const barWidthMm = (Number(options.width) || 1) / (svgWidth || 1) * printWidth;
  const heightMm = (svgHeight / (svgWidth || 1)) * printWidth;
  const bg = options.transparent ? "#ffffff" : options.background;
  const contrast = getContrastRatio(options.lineColor, bg);
  const warnings = [];
  const passes = [];

  if (quietModules >= 10) {
    passes.push(`Quiet zone is ${quietModules.toFixed(0)} modules wide.`);
  } else {
    warnings.push(
      `Quiet zone is only ${quietModules.toFixed(0)} modules. Use 10 or more for reliable scanning.`,
    );
  }

  if (contrast >= 4.5) {
    passes.push(`Contrast ratio is ${contrast.toFixed(1)}:1.`);
  } else {
    warnings.push(`Contrast is ${contrast.toFixed(1)}:1. Use a darker bar colour or lighter background.`);
  }

  if (barWidthMm >= 0.24) {
    passes.push(`Narrow bar prints at about ${barWidthMm.toFixed(2)} mm.`);
  } else {
    warnings.push(
      `Narrow bar prints at ${barWidthMm.toFixed(2)} mm. Increase print width or bar width for a sharper scan.`,
    );
  }

  if (heightMm >= 12) {
    passes.push(`Printed height is about ${heightMm.toFixed(1)} mm.`);
  } else {
    warnings.push(`Printed height is ${heightMm.toFixed(1)} mm. Aim for at least 12 mm.`);
  }

  if (options.transparent) {
    warnings.push("Transparent background: place the barcode on a light, plain surface.");
  } else {
    passes.push("Solid background included for scanner contrast.");
  }

  if (normalized?.repaired) {
    passes.push("The check digit was repaired automatically.");
  }

  if (scanResult?.ok) {
    passes.push(`Scan test passed: ${scanResult.format || "barcode"} decoded as ${scanResult.text}.`);
  } else if (scanResult && !scanResult.ok) {
    warnings.push(scanResult.message);
  }

  const penalty = warnings.length * 14 + (scanResult?.ok ? 0 : 4);
  const score = clamp(100 - penalty, 12, 100);

  return {
    score,
    warnings,
    passes,
    quietModules,
    quietMm,
    barWidthMm,
    heightMm,
    contrast,
    svgWidth,
    svgHeight,
    printWidth,
    value,
    format,
  };
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseBatch(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith("#"));

  if (!lines.length) {
    return { items: [], error: "Add at least one barcode value or upload a CSV file." };
  }

  const rows = lines.map(parseCsvLine);
  const firstRow = rows[0];
  const hasHeader =
    /^(value|barcode|code|sku|data)$/i.test(firstRow[0] || "") ||
    /^(label|name|title|caption)$/i.test(firstRow[1] || "");
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const items = dataRows
    .map((row) => ({
      value: row[0] || "",
      label: row[1] || row[0] || "",
    }))
    .filter((item) => item.value);

  if (!items.length) {
    return { items: [], error: "No barcode values found. Use value,label on each line." };
  }

  return { items, error: null };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function BarcodeGenerator() {
  const [mode, setMode] = useState("single");
  const [format, setFormat] = useState("EAN13");
  const [value, setValue] = useState("9780201379624");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [scanResult, setScanResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [batchText, setBatchText] = useState(BATCH_SAMPLE);
  const [batchItems, setBatchItems] = useState([]);
  const [batchErrors, setBatchErrors] = useState([]);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchExporting, setBatchExporting] = useState("");
  const previewRef = useRef(null);
  const svgRef = useRef(null);
  const { addRecentTool } = useRecentTools();

  const formatMeta = getFormatMeta(format);
  const normalized = useMemo(
    () => normalizeValue(value, format, options.autoFix),
    [value, format, options.autoFix],
  );

  const barcodeSvg = useMemo(() => {
    if (normalized.error) return null;
    try {
      return createBarcodeSvg(normalized.value, format, options);
    } catch {
      return null;
    }
  }, [normalized.value, normalized.error, format, options]);

  const audit = useMemo(
    () =>
      barcodeSvg
        ? buildAudit(
            barcodeSvg,
            options,
            format,
            value,
            normalized,
            scanResult,
          )
        : null,
    [barcodeSvg, options, format, value, normalized, scanResult],
  );

  useEffect(() => {
    addRecentTool(TOOL_META);
  }, [addRecentTool]);

  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;

    if (!barcodeSvg) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = "";
    const clone = barcodeSvg.cloneNode(true);
    clone.removeAttribute("style");
    clone.setAttribute("role", "img");
    clone.setAttribute(
      "aria-label",
      `Barcode preview for ${normalized.value || "your value"}`,
    );
    clone.style.maxWidth = "100%";
    clone.style.height = "auto";
    container.appendChild(clone);
  }, [barcodeSvg, normalized.value]);

  const updateOption = (key, nextValue) => {
    setOptions((current) => ({ ...current, [key]: nextValue }));
    setScanResult(null);
  };

  const handleFormatChange = (nextFormat) => {
    setFormat(nextFormat);
    const meta = getFormatMeta(nextFormat);
    if (!value || value === getFormatMeta(format).sample) {
      setValue(meta.sample);
    }
    setScanResult(null);
  };

  const handleLoadSample = () => {
    setValue(formatMeta.sample);
    setScanResult(null);
  };

  const exportSvg = () => {
    if (!barcodeSvg) {
      toast.error("Generate a valid barcode before downloading.");
      return;
    }
    const cloned = barcodeSvg.cloneNode(true);
    const { width, height } = getSvgSize(cloned);
    const printWidth = clamp(Number(options.printWidth) || 55, 10, 300);
    cloned.setAttribute("width", printWidth);
    cloned.setAttribute("height", Number(((height / width) * printWidth).toFixed(2)));
    cloned.setAttribute("viewBox", cloned.getAttribute("viewBox") || `0 0 ${width} ${height}`);
    if (options.rotation) {
      cloned.setAttribute(
        "style",
        `transform: rotate(${options.rotation}deg); transform-origin: center;`,
      );
    }
    downloadBlob(
      new Blob([serializeSvg(cloned)], { type: "image/svg+xml;charset=utf-8" }),
      `${slugify(normalized.value)}.svg`,
    );
    toast.success("SVG barcode downloaded.");
  };

  const exportPng = async () => {
    if (!barcodeSvg) {
      toast.error("Generate a valid barcode before downloading.");
      return;
    }
    try {
      const scale = getExportScale(options, barcodeSvg);
      let dataUrl = await svgToPng(barcodeSvg, scale);
      if (options.rotation) {
        dataUrl = await rotateDataUrl(dataUrl, options.rotation);
      }
      downloadBlob(
        new Blob([dataUrlToUint8(dataUrl)], { type: "image/png" }),
        `${slugify(normalized.value)}-${options.dpi}dpi.png`,
      );
      toast.success(`PNG downloaded at ${options.dpi} DPI.`);
    } catch (exportError) {
      console.error("Barcode PNG export failed:", exportError);
      toast.error("Could not render the PNG. Try a smaller print width or another format.");
    }
  };

  const exportJpeg = async () => {
    if (!barcodeSvg) {
      toast.error("Generate a valid barcode before downloading.");
      return;
    }
    try {
      const scale = getExportScale(options, barcodeSvg);
      const png = await svgToPng(barcodeSvg, scale, "#ffffff");
      const image = await loadImage(png);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.96);
      downloadBlob(
        new Blob([dataUrlToUint8(dataUrl)], { type: "image/jpeg" }),
        `${slugify(normalized.value)}-${options.dpi}dpi.jpg`,
      );
      toast.success("JPEG downloaded with a white background.");
    } catch (exportError) {
      console.error("Barcode JPEG export failed:", exportError);
      toast.error("Could not render the JPEG. Try again with a solid background.");
    }
  };

  const exportSinglePdf = async () => {
    if (!barcodeSvg) {
      toast.error("Generate a valid barcode before downloading.");
      return;
    }
    try {
      const { jsPDF } = await import("jspdf");
      const scale = getExportScale(options, barcodeSvg);
      const dataUrl = await svgToPng(barcodeSvg, scale, "#ffffff");
      const image = await loadImage(dataUrl);
      const labelWidth = clamp(Number(options.printWidth) + 12, 30, 300);
      const imageHeight =
        labelWidth - 12 > 0
          ? ((labelWidth - 12) * image.naturalHeight) / image.naturalWidth
          : 20;
      const labelHeight = clamp(imageHeight + 14, 20, 300);
      const doc = new jsPDF({
        orientation: labelWidth >= labelHeight ? "landscape" : "portrait",
        unit: "mm",
        format: [labelWidth, labelHeight],
      });
      doc.addImage(
        dataUrl,
        "PNG",
        6,
        4,
        labelWidth - 12,
        Math.min(imageHeight, labelHeight - 12),
        undefined,
        "FAST",
      );
      doc.save(`${slugify(normalized.value)}-label.pdf`);
      toast.success("Print-ready PDF label downloaded.");
    } catch (exportError) {
      console.error("Barcode PDF export failed:", exportError);
      toast.error("Could not build the PDF label. Try PNG or SVG export.");
    }
  };

  const verifyScan = async () => {
    if (!barcodeSvg) {
      toast.error("Generate a valid barcode before running a scan test.");
      return;
    }
    setVerifying(true);
    setScanResult(null);
    try {
      const scale = Math.max(4, getExportScale(options, barcodeSvg));
      const dataUrl = await svgToPng(barcodeSvg, scale, "#ffffff");
      const { BrowserMultiFormatReader } = await import("@zxing/library");
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(dataUrl);
      reader.reset?.();
      setScanResult({
        ok: true,
        text: result.getText(),
        format: String(result.getBarcodeFormat?.() ?? "barcode"),
      });
      toast.success("Scan test passed — the barcode decoded correctly.");
    } catch (scanError) {
      console.warn("Barcode scan test failed:", scanError);
      setScanResult({
        ok: false,
        message:
          "The automated scan test could not read this preview. Increase bar width, height, quiet zone or contrast, then try again.",
      });
      toast.error("Scan test failed. The preview may be too small or low-contrast.");
    } finally {
      setVerifying(false);
    }
  };

  const generateBatch = async () => {
    const parsed = parseBatch(batchText);
    if (parsed.error) {
      setBatchItems([]);
      setBatchErrors([parsed.error]);
      toast.error(parsed.error);
      return;
    }

    setBatchGenerating(true);
    setBatchErrors([]);
    setBatchItems([]);

    const validItems = [];
    const errors = [];

    try {
      for (let index = 0; index < parsed.items.length; index += 1) {
        const item = parsed.items[index];
        const normalizedItem = normalizeValue(item.value, format, options.autoFix);
        if (normalizedItem.error) {
          errors.push(`${item.value}: ${normalizedItem.error}`);
          continue;
        }

        try {
          const svg = createBarcodeSvg(normalizedItem.value, format, options);
          const dataUrl = await svgToPng(svg, 3, "#ffffff");
          validItems.push({
            ...item,
            value: normalizedItem.value,
            dataUrl,
            index,
          });
        } catch {
          errors.push(`${item.value}: could not render this barcode in ${format}.`);
        }
      }

      setBatchItems(validItems);
      setBatchErrors(errors);
      if (validItems.length) {
        toast.success(
          `Generated ${validItems.length} barcode${validItems.length === 1 ? "" : "s"}${errors.length ? `; ${errors.length} skipped` : ""}.`,
        );
      } else {
        toast.error("No barcodes could be generated. Check the values and format.");
      }
    } finally {
      setBatchGenerating(false);
    }
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) {
      toast.error("Choose a .csv or .txt file with one barcode per line.");
      return;
    }
    try {
      const text = await file.text();
      setBatchText(text);
      setBatchItems([]);
      setBatchErrors([]);
      toast.success(`${file.name} loaded. Review the values, then generate labels.`);
    } catch {
      toast.error("Could not read that CSV file. Try saving it as UTF-8 text.");
    }
  };

  const exportBatchZip = async () => {
    if (!batchItems.length) {
      toast.error("Generate batch labels before downloading.");
      return;
    }
    setBatchExporting("zip");
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const manifest = ["value,label,file"];
      const usedNames = new Set();

      for (let index = 0; index < batchItems.length; index += 1) {
        const item = batchItems[index];
        let filename = `${String(index + 1).padStart(3, "0")}-${slugify(item.value)}.png`;
        let suffix = 2;
        while (usedNames.has(filename)) {
          filename = `${String(index + 1).padStart(3, "0")}-${slugify(item.value)}-${suffix}.png`;
          suffix += 1;
        }
        usedNames.add(filename);
        zip.file(filename, dataUrlToUint8(item.dataUrl));
        manifest.push(`"${item.value.replace(/"/g, '""')}","${item.label.replace(/"/g, '""')}",${filename}`);
      }

      zip.file("barcodes.csv", `${manifest.join("\n")}\n`);
      const archive = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      downloadBlob(archive, "toolstrek-barcode-labels.zip");
      toast.success(`ZIP downloaded with ${batchItems.length} PNG barcode${batchItems.length === 1 ? "" : "s"}.`);
    } catch (exportError) {
      console.error("Batch ZIP export failed:", exportError);
      toast.error("Could not create the ZIP archive. Try fewer labels or download the PDF sheet.");
    } finally {
      setBatchExporting("");
    }
  };

  const exportBatchPdf = async () => {
    if (!batchItems.length) {
      toast.error("Generate batch labels before downloading.");
      return;
    }
    setBatchExporting("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const columns = clamp(Number(options.batchColumns) || 3, 1, 4);
      const gap = 4;
      const labelWidth = (pageWidth - margin * 2 - gap * (columns - 1)) / columns;
      const labelHeight = clamp(Number(options.labelHeight) || 34, 22, 70);
      const rows = Math.max(1, Math.floor((pageHeight - margin * 2 + gap) / (labelHeight + gap)));
      const perPage = columns * rows;

      batchItems.forEach((item, index) => {
        const pageIndex = Math.floor(index / perPage);
        if (pageIndex > 0 && index % perPage === 0) doc.addPage();
        const position = index % perPage;
        const column = position % columns;
        const row = Math.floor(position / columns);
        const x = margin + column * (labelWidth + gap);
        const y = margin + row * (labelHeight + gap);
        const padding = 2.5;

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.roundedRect(x, y, labelWidth, labelHeight, 1.2, 1.2, "S");

        const image = new Image();
        image.src = item.dataUrl;
        const imageRatio = image.naturalWidth ? image.naturalHeight / image.naturalWidth : 0.36;
        const maxImageHeight = labelHeight - 10;
        const imageWidth = Math.min(labelWidth - padding * 2, maxImageHeight / imageRatio);
        const imageHeight = imageWidth * imageRatio;
        const imageX = x + (labelWidth - imageWidth) / 2;
        const imageY = y + padding + Math.max(0, (maxImageHeight - imageHeight) / 2);
        doc.addImage(item.dataUrl, "PNG", imageX, imageY, imageWidth, imageHeight, undefined, "FAST");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(55, 65, 81);
        const caption = item.label || item.value;
        const captionLines = doc.splitTextToSize(caption, labelWidth - padding * 2);
        doc.text(captionLines.slice(0, 1), x + labelWidth / 2, y + labelHeight - 3.2, {
          align: "center",
        });
      });

      doc.save("toolstrek-barcode-label-sheet.pdf");
      toast.success(`PDF label sheet downloaded — ${batchItems.length} labels on ${doc.getNumberOfPages()} page${doc.getNumberOfPages() === 1 ? "" : "s"}.`);
    } catch (exportError) {
      console.error("Batch PDF export failed:", exportError);
      toast.error("Could not create the PDF label sheet. Try the ZIP export instead.");
    } finally {
      setBatchExporting("");
    }
  };

  const handleReset = () => {
    setOptions(DEFAULT_OPTIONS);
    setValue(formatMeta.sample);
    setScanResult(null);
    toast.success("Barcode settings reset.");
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BackButton className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:bg-gray-800" />
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
            Developer &amp; Design Tools
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            100% local processing
          </span>
          <FavoriteButton
            tool={TOOL_META}
            className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700 sm:text-sm dark:bg-violet-950/40 dark:text-violet-300">
          <Barcode className="h-3.5 w-3.5" />
          Free Barcode Generator
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
          Barcodes that are{" "}
          <span className="text-violet-600 dark:text-violet-400">ready to scan and print.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
          Create retail, logistics and inventory barcodes in nine formats. Repair check
          digits, audit quiet zones and contrast, verify with a real scanner, then export
          PNG, SVG, JPEG, PDF labels or a batch label sheet — all in your browser.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              mode === "single"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Single barcode
          </button>
          <button
            type="button"
            onClick={() => setMode("batch")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              mode === "batch"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Batch labels
          </button>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Nine symbologies · print DPI control · CSV batches
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,350px)_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-24 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/40">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <h2 className="text-sm font-bold text-gray-900 sm:text-base dark:text-white">
                Barcode settings
              </h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition-colors hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <fieldset className="m-0 min-w-0 space-y-5 border-0 p-5">
            <div>
              <label htmlFor="barcode-format" className="mb-1.5 block text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
                Barcode format
              </label>
              <select
                id="barcode-format"
                value={format}
                onChange={(event) => handleFormatChange(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                {FORMATS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {formatMeta.hint}
              </p>
            </div>

            {mode === "single" ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label htmlFor="barcode-value" className="text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
                    Value to encode
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-300"
                  >
                    Use sample
                  </button>
                </div>
                <textarea
                  id="barcode-value"
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    setScanResult(null);
                  }}
                  rows={3}
                  spellCheck={false}
                  className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2.5 font-mono text-sm font-medium text-gray-900 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  placeholder={formatMeta.sample}
                />
                {normalized.error ? (
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {normalized.error}
                  </p>
                ) : normalized.repaired ? (
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Check digit repaired: use {normalized.value} to scan correctly.
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {normalized.value.length} characters · encoded locally
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label htmlFor="batch-values" className="text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
                    Batch values (value,label)
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-300">
                    <UploadCloud className="h-3.5 w-3.5" />
                    Upload CSV
                    <input
                      type="file"
                      accept=".csv,.txt,text/csv,text/plain"
                      className="sr-only"
                      onChange={handleCsvUpload}
                    />
                  </label>
                </div>
                <textarea
                  id="batch-values"
                  value={batchText}
                  onChange={(event) => {
                    setBatchText(event.target.value);
                    setBatchItems([]);
                    setBatchErrors([]);
                  }}
                  rows={8}
                  spellCheck={false}
                  className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed text-gray-900 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  placeholder={BATCH_SAMPLE}
                />
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  One barcode per line. The first column is the barcode value; the second is an optional label. A header row is detected automatically.
                </p>
                <button
                  type="button"
                  onClick={generateBatch}
                  disabled={batchGenerating}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {batchGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {batchGenerating ? "Generating labels…" : "Generate batch labels"}
                </button>
              </div>
            )}

            <div className="border-t border-gray-100 pt-5 dark:border-gray-800">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Appearance
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Bar width</span>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={options.width}
                    onChange={(event) => updateOption("width", clamp(Number(event.target.value), 1, 8))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Height (px)</span>
                  <input
                    type="number"
                    min="30"
                    max="240"
                    value={options.height}
                    onChange={(event) => updateOption("height", clamp(Number(event.target.value), 30, 240))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Quiet zone</span>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={options.margin}
                    onChange={(event) => updateOption("margin", clamp(Number(event.target.value), 0, 60))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Rotation</span>
                  <select
                    value={options.rotation}
                    onChange={(event) => updateOption("rotation", Number(event.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  >
                    <option value="0">None</option>
                    <option value="90">90°</option>
                    <option value="180">180°</option>
                    <option value="270">270°</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Bar colour</span>
                  <input
                    type="color"
                    value={options.lineColor}
                    onChange={(event) => updateOption("lineColor", event.target.value)}
                    className="h-9 w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-950"
                    aria-label="Barcode bar colour"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Background</span>
                  <input
                    type="color"
                    value={options.background}
                    disabled={options.transparent}
                    onChange={(event) => updateOption("background", event.target.value)}
                    className="h-9 w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-950"
                    aria-label="Barcode background colour"
                  />
                </label>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={options.transparent}
                  onChange={(event) => updateOption("transparent", event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                Transparent background
              </label>
            </div>

            <details className="group border-t border-gray-100 pt-4 dark:border-gray-800">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Typography &amp; print
                <span className="text-violet-500 transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-4 space-y-3">
                <label className="flex items-center justify-between gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  Show value under bars
                  <input
                    type="checkbox"
                    checked={options.displayValue}
                    onChange={(event) => updateOption("displayValue", event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Font size</span>
                    <input
                      type="number"
                      min="8"
                      max="48"
                      value={options.fontSize}
                      onChange={(event) => updateOption("fontSize", clamp(Number(event.target.value), 8, 48))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Text gap</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={options.textMargin}
                      onChange={(event) => updateOption("textMargin", clamp(Number(event.target.value), 0, 20))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Text align</span>
                    <select
                      value={options.textAlign}
                      onChange={(event) => updateOption("textAlign", event.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Text position</span>
                    <select
                      value={options.textPosition}
                      onChange={(event) => updateOption("textPosition", event.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    >
                      <option value="bottom">Below bars</option>
                      <option value="top">Above bars</option>
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Print width</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={options.printWidth}
                        onChange={(event) => updateOption("printWidth", clamp(Number(event.target.value), 10, 300))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 pr-8 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">mm</span>
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">Print DPI</span>
                    <select
                      value={options.dpi}
                      onChange={(event) => updateOption("dpi", Number(event.target.value))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    >
                      <option value="203">203 DPI</option>
                      <option value="300">300 DPI</option>
                      <option value="600">600 DPI</option>
                    </select>
                  </label>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={options.autoFix}
                    onChange={(event) => updateOption("autoFix", event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  Auto-repair GS1 check digits
                </label>
              </div>
            </details>
          </fieldset>
        </aside>

        <main className="min-w-0 space-y-5">
          {mode === "single" ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5 dark:border-gray-800 dark:bg-gray-950/40">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`absolute inline-flex h-full w-full rounded-full ${normalized.error ? "bg-red-400" : "bg-emerald-400"} opacity-75`} />
                      <span className={`relative inline-flex h-2 w-2 rounded-full ${normalized.error ? "bg-red-500" : "bg-emerald-500"}`} />
                    </span>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Live preview</h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      {formatMeta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatMm(options.printWidth)} wide</span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span>{options.dpi} DPI</span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {normalized.error ? (
                    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="text-sm font-bold text-red-700 dark:text-red-300">Barcode needs attention</p>
                        <p className="mt-1 max-w-md text-xs leading-relaxed text-red-600 dark:text-red-400">{normalized.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-56 items-center justify-center overflow-auto rounded-xl border border-gray-100 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px] p-4 sm:p-8 dark:border-gray-800 dark:bg-none dark:bg-gray-950">
                      <div
                        ref={previewRef}
                        className="flex max-w-full items-center justify-center transition-transform duration-300"
                        style={{ transform: `rotate(${options.rotation}deg)` }}
                      />
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={verifyScan}
                        disabled={Boolean(normalized.error) || verifying}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition-all hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300 dark:hover:bg-violet-950/50"
                      >
                        {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
                        {verifying ? "Scanning…" : "Verify scan"}
                      </button>
                      {scanResult?.ok ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4" />
                          Scan verified
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={exportPng} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-violet-700 sm:text-sm">
                        <Download className="h-4 w-4" />
                        PNG
                      </button>
                      <button type="button" onClick={exportSvg} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                        SVG
                      </button>
                      <button type="button" onClick={exportJpeg} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                        JPEG
                      </button>
                      <button type="button" onClick={exportSinglePdf} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                        <Printer className="h-4 w-4" />
                        PDF label
                      </button>
                    </div>
                  </div>
                  {scanResult && !scanResult.ok ? (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
                      {scanResult.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
                  <div className="flex items-center gap-2">
                    <ScanLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Scan safety audit</h2>
                  </div>
                  {audit ? (
                    <>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{audit.score}</span>
                        <span className="pb-1 text-xs font-semibold text-gray-400">/ 100</span>
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${audit.warnings.length ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
                          {audit.warnings.length ? "Review" : "Print ready"}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full transition-all ${audit.score >= 80 ? "bg-emerald-500" : audit.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${audit.score}%` }}
                        />
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-950">
                          <dt className="text-gray-500 dark:text-gray-400">Quiet zone</dt>
                          <dd className="mt-0.5 font-bold text-gray-900 dark:text-white">{audit.quietModules.toFixed(0)} modules</dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-950">
                          <dt className="text-gray-500 dark:text-gray-400">Bar width</dt>
                          <dd className="mt-0.5 font-bold text-gray-900 dark:text-white">{audit.barWidthMm.toFixed(2)} mm</dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-950">
                          <dt className="text-gray-500 dark:text-gray-400">Print height</dt>
                          <dd className="mt-0.5 font-bold text-gray-900 dark:text-white">{audit.heightMm.toFixed(1)} mm</dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-950">
                          <dt className="text-gray-500 dark:text-gray-400">Contrast</dt>
                          <dd className="mt-0.5 font-bold text-gray-900 dark:text-white">{audit.contrast.toFixed(1)}:1</dd>
                        </div>
                      </dl>
                      {audit.warnings.length ? (
                        <ul className="mt-3 space-y-1.5">
                          {audit.warnings.slice(0, 3).map((warning) => (
                            <li key={warning} className="flex items-start gap-1.5 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          Quiet zone, contrast, bar width and print height all pass. This barcode is ready for print.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Fix the value to see the print audit.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Why this barcode works</h2>
                  </div>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {formatMeta.label} is generated locally from your value{normalized.repaired ? " with a repaired check digit" : ""}.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {normalized.value ? `Encoded value: ${normalized.value}` : "Enter a value to encode."}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      Exports are rasterised at {options.dpi} DPI and sized for a {formatMm(options.printWidth)} label.
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      Your data never leaves this browser; no barcode value is uploaded.
                    </li>
                  </ul>
                  <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/70 p-3 dark:border-violet-900/40 dark:bg-violet-950/20">
                    <p className="text-xs font-semibold text-violet-800 dark:text-violet-200">Pro tip</p>
                    <p className="mt-1 text-xs leading-relaxed text-violet-700 dark:text-violet-300">
                      Print a test label at 100% scale and scan it with your actual scanner before ordering a full batch. Screen previews are not a substitute for a physical print check.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Batch label studio</h2>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {batchItems.length} ready
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <span>Columns</span>
                    <select
                      value={options.batchColumns || 3}
                      onChange={(event) => updateOption("batchColumns", Number(event.target.value))}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-violet-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                      aria-label="PDF label columns"
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={exportBatchZip}
                    disabled={!batchItems.length || Boolean(batchExporting)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {batchExporting === "zip" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileArchive className="h-3.5 w-3.5" />}
                    ZIP
                  </button>
                  <button
                    type="button"
                    onClick={exportBatchPdf}
                    disabled={!batchItems.length || Boolean(batchExporting)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    {batchExporting === "pdf" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                    PDF sheet
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {batchItems.length ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {batchItems.slice(0, 24).map((item, index) => (
                        <div key={`${item.value}-${index}`} className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300">{item.value}</span>
                            <span className="shrink-0 rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">{formatMeta.label}</span>
                          </div>
                          <div className="mt-2 flex min-h-24 items-center justify-center rounded-lg bg-white p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.dataUrl} alt={`Barcode for ${item.value}`} className="max-h-24 max-w-full object-contain" />
                          </div>
                          <p className="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">{item.label || item.value}</p>
                        </div>
                      ))}
                    </div>
                    {batchItems.length > 24 ? (
                      <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                        Showing the first 24 previews. All {batchItems.length} labels are included in the ZIP and PDF exports.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-center dark:border-gray-800 dark:bg-gray-950/40">
                    <div className="rounded-2xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
                      <FileSpreadsheet className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Your label sheet starts here</p>
                      <p className="mt-1 max-w-md text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        Paste values in the left panel or upload a CSV, then generate previews. Each label gets its own PNG inside the ZIP, plus a printable A4 PDF sheet.
                      </p>
                    </div>
                  </div>
                )}

                {batchErrors.length ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-200">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {batchErrors.length} value{batchErrors.length === 1 ? "" : "s"} skipped
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {batchErrors.slice(0, 6).map((itemError) => (
                        <li key={itemError} className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">• {itemError}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Printer className="h-3.5 w-3.5" />
                    {options.batchColumns || 3} columns · {(options.labelHeight || 34)} mm labels
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    No upload — labels are generated locally
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        Barcode output uses JsBarcode. Scan verification uses ZXing in your browser. Always test a physical print before a production run.
      </p>
    </ToolPageShell>
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the rendered barcode image."));
    image.src = src;
  });
}

async function rotateDataUrl(dataUrl, degrees) {
  const image = await loadImage(dataUrl);
  const radians = (Number(degrees) * Math.PI) / 180;
  const swap = Math.abs(Number(degrees)) % 180 === 90;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? image.naturalHeight : image.naturalWidth;
  canvas.height = swap ? image.naturalWidth : image.naturalHeight;
  const context = canvas.getContext("2d");
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(radians);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  return canvas.toDataURL("image/png");
}
