"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Upload, FileText, Download, Check, Eye, Trash2, Settings, 
  CheckCircle, AlertTriangle, FileUp, Paperclip, Layout, Type, Palette,
  Sparkles, RefreshCw, EyeOff
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// RFC 2047 encoded-word decoder: =?charset?Q|B?encoded_text?=
const decodeRfc2047 = (text) => {
  if (!text) return "";
  return text.replace(/=\?([^?]+)\?([QBqb])\?([^?]*)\?=/g, (match, charset, encoding, data) => {
    try {
      let decoded = "";
      if (encoding.toUpperCase() === "B") {
        decoded = atob(data);
      } else if (encoding.toUpperCase() === "Q") {
        // Quoted-Printable within RFC 2047 replacing underscores with spaces
        decoded = decodeQuotedPrintableText(data.replace(/_/g, " "));
      }
      
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
      return new TextDecoder(charset || "utf-8").decode(bytes);
    } catch (e) {
      return match;
    }
  });
};

// Quoted-printable binary-safe decoder
const decodeQuotedPrintableText = (text) => {
  if (!text) return "";
  // 1. Soft line breaks (trailing '=' before newline)
  const cleaned = text.replace(/=\r?\n/g, "");
  // 2. Decode hex values =XX
  const bytes = [];
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === "=" && i + 2 < cleaned.length) {
      const hex = cleaned.substring(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16));
        i += 2;
      } else {
        bytes.push(char.charCodeAt(0));
      }
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }
  return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
};

// Base64 decoder based on content type charset
const decodeBase64ToText = (rawBase64, contentType) => {
  const cleanBase64 = rawBase64.replace(/\s/g, "");
  try {
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const charsetMatch = contentType.match(/charset\s*=\s*([^;\s]+)/i);
    const charset = charsetMatch ? charsetMatch[1].replace(/["']/g, "") : "utf-8";
    return new TextDecoder(charset).decode(bytes);
  } catch (e) {
    return rawBase64;
  }
};

// Parse headers
const parseHeaders = (headersText) => {
  const headers = {};
  const unfolded = headersText.replace(/\r?\n[ \t]+/g, " ");
  const lines = unfolded.split(/\r?\n/);
  
  lines.forEach(line => {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim().toLowerCase();
      const val = line.substring(colonIdx + 1).trim();
      headers[key] = val;
    }
  });
  return headers;
};

// Parse content-type properties
const parseContentType = (headerValue) => {
  if (!headerValue) return { mimeType: "text/plain", params: {} };
  const parts = headerValue.split(";");
  const mimeType = parts[0].trim().toLowerCase();
  const params = {};
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    const equalIdx = part.indexOf("=");
    if (equalIdx !== -1) {
      const key = part.substring(0, equalIdx).trim().toLowerCase();
      const val = part.substring(equalIdx + 1).trim().replace(/^["']|["']$/g, "");
      params[key] = val;
    }
  }
  return { mimeType, params };
};

// Decode date to readable local format
const formatEmailDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
      });
    }
  } catch (e) {}
  return dateStr;
};

// Helper: Parse attachments filenames from Content-Disposition/Content-Type
const parseFilename = (disposition, contentType) => {
  let filename = "";
  if (disposition) {
    const dispMatch = disposition.match(/filename\*?=(?:([^']*)'[^']*')?([^;\n]+)/i);
    if (dispMatch) {
      if (dispMatch[1]) {
        try {
          filename = decodeURIComponent(dispMatch[2]);
        } catch (e) {
          filename = dispMatch[2];
        }
      } else {
        filename = dispMatch[2].replace(/["']/g, "");
      }
    } else {
      const legacyMatch = disposition.match(/filename\s*=\s*([^;\n]+)/i);
      if (legacyMatch) {
        filename = legacyMatch[1].replace(/["']/g, "");
      }
    }
  }
  
  if (!filename && contentType) {
    const nameMatch = contentType.match(/name\*?=(?:([^']*)'[^']*')?([^;\n]+)/i);
    if (nameMatch) {
      if (nameMatch[1]) {
        try {
          filename = decodeURIComponent(nameMatch[2]);
        } catch (e) {
          filename = nameMatch[2];
        }
      } else {
        filename = nameMatch[2].replace(/["']/g, "");
      }
    } else {
      const legacyNameMatch = contentType.match(/name\s*=\s*([^;\n]+)/i);
      if (legacyNameMatch) {
        filename = legacyNameMatch[1].replace(/["']/g, "");
      }
    }
  }
  
  return filename ? decodeRfc2047(filename.trim()) : "";
};

// Helper: Parse multipart sections recursively
const parseMultipart = (bodyText, boundary) => {
  const parts = [];
  const escapedBoundary = boundary.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`--${escapedBoundary}(?:--)?\\s*`, 'g');
  const rawParts = bodyText.split(regex);
  
  for (let i = 1; i < rawParts.length; i++) {
    const rawPart = rawParts[i].trim();
    if (!rawPart || rawPart === "--") continue; 
    
    const blankMatch = rawPart.match(/\r?\n\r?\n/);
    let headerEndIndex = -1;
    let separatorLength = 0;
    
    if (blankMatch) {
      headerEndIndex = blankMatch.index;
      separatorLength = blankMatch[0].length;
    } else {
      const lfMatch = rawPart.match(/\n\n/);
      if (lfMatch) {
        headerEndIndex = lfMatch.index;
        separatorLength = lfMatch[0].length;
      }
    }
    
    if (headerEndIndex === -1) continue;
    
    const partHeadersRaw = rawPart.substring(0, headerEndIndex);
    const partBodyRaw = rawPart.substring(headerEndIndex + separatorLength);
    
    const partHeaders = parseHeaders(partHeadersRaw);
    const contentTypeHeader = partHeaders["content-type"] || "";
    const contentTransferEncoding = partHeaders["content-transfer-encoding"] || "";
    const contentDisposition = partHeaders["content-disposition"] || "";
    
    let decodedBody = partBodyRaw;
    if (contentTransferEncoding.toLowerCase().trim() === "base64") {
      // Decode only text body. Leave attachments as base64.
      const { mimeType } = parseContentType(contentTypeHeader);
      if (mimeType.startsWith("text/")) {
        decodedBody = decodeBase64ToText(partBodyRaw, contentTypeHeader);
      }
    } else if (contentTransferEncoding.toLowerCase().trim() === "quoted-printable") {
      decodedBody = decodeQuotedPrintableText(partBodyRaw);
    }
    
    const { mimeType, params } = parseContentType(contentTypeHeader);
    
    if (mimeType.startsWith("multipart/")) {
      const subBoundary = params["boundary"];
      if (subBoundary) {
        parts.push(...parseMultipart(partBodyRaw, subBoundary));
      }
    } else {
      parts.push({
        headers: partHeaders,
        mimeType,
        body: decodedBody,
        contentType: contentTypeHeader,
        contentDisposition,
        filename: parseFilename(contentDisposition, contentTypeHeader)
      });
    }
  }
  return parts;
};

// Core EML Parser
const parseEml = (text) => {
  const emptyLineIdx = text.search(/\r?\n\r?\n/);
  if (emptyLineIdx === -1) {
    const lfIdx = text.indexOf("\n\n");
    if (lfIdx === -1) {
      return { 
        headers: { subject: "Unparsable EML File" }, 
        htmlBody: "", 
        textBody: text, 
        attachments: [] 
      };
    }
  }
  
  let headersText = "";
  let bodyText = "";
  
  const match = text.match(/^([\s\S]*?)\r?\n\r?\n([\s\S]*)$/);
  if (match) {
    headersText = match[1];
    bodyText = match[2];
  } else {
    const idx = text.indexOf("\n\n");
    headersText = text.substring(0, idx);
    bodyText = text.substring(idx + 2);
  }
  
  const headers = parseHeaders(headersText);
  const decodedHeaders = {
    subject: decodeRfc2047(headers["subject"] || "(No Subject)"),
    from: decodeRfc2047(headers["from"] || "Unknown Sender"),
    to: decodeRfc2047(headers["to"] || ""),
    cc: decodeRfc2047(headers["cc"] || ""),
    date: formatEmailDate(headers["date"] || ""),
    contentType: headers["content-type"] || "text/plain",
    contentTransferEncoding: headers["content-transfer-encoding"] || ""
  };
  
  const { mimeType, params } = parseContentType(decodedHeaders.contentType);
  
  let htmlBody = "";
  let textBody = "";
  const attachments = [];
  const inlineImages = [];
  
  if (mimeType.startsWith("multipart/")) {
    const boundary = params["boundary"];
    if (boundary) {
      const parts = parseMultipart(bodyText, boundary);
      parts.forEach(part => {
        const isAttachment = part.filename && (part.contentDisposition.includes("attachment") || part.filename);
        const contentId = part.headers["content-id"] ? part.headers["content-id"].replace(/[<>]/g, "").trim() : "";
        
        if (contentId && part.mimeType.startsWith("image/")) {
          // Inline image (must be checked first)
          inlineImages.push({
            cid: contentId,
            contentType: part.mimeType,
            base64Data: part.body
          });
          // Also add to download list for convenience, labeled as inline
          attachments.push({
            filename: part.filename || `inline-${contentId}.${part.mimeType.split("/")[1] || "png"}`,
            contentType: part.mimeType,
            size: Math.round(part.body.replace(/\s/g, "").length * 0.75),
            body: part.body,
            inline: true
          });
        } else if (isAttachment) {
          // Normal attachment
          attachments.push({
            filename: part.filename,
            contentType: part.mimeType,
            size: Math.round(part.body.replace(/\s/g, "").length * 0.75), // approximate size
            body: part.body, // raw base64 body for downloading
          });
        } else {
          if (part.mimeType === "text/html") {
            htmlBody = part.body;
          } else if (part.mimeType === "text/plain") {
            textBody = part.body;
          }
        }
      });
    }
  } else {
    // Single part
    let decodedBody = bodyText;
    if (decodedHeaders.contentTransferEncoding.toLowerCase().trim() === "base64") {
      decodedBody = decodeBase64ToText(bodyText, decodedHeaders.contentType);
    } else if (decodedHeaders.contentTransferEncoding.toLowerCase().trim() === "quoted-printable") {
      decodedBody = decodeQuotedPrintableText(bodyText);
    }
    
    if (mimeType === "text/html") {
      htmlBody = decodedBody;
    } else {
      textBody = decodedBody;
    }
  }
  
  // Resolve inline images in htmlBody
  if (htmlBody) {
    // 1. Resolve by Content-ID (cid:...)
    if (inlineImages.length > 0) {
      inlineImages.forEach(img => {
        const cidEscaped = img.cid.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`cid:<?${cidEscaped}>?`, "gi");
        const base64Data = img.base64Data.replace(/\s/g, "");
        htmlBody = htmlBody.replace(regex, `data:${img.contentType};base64,${base64Data}`);
      });
    }
    
    // 2. Resolve by Filename
    if (attachments.length > 0) {
      attachments.forEach(att => {
        if (att.filename && att.contentType.startsWith("image/")) {
          const filenameEscaped = att.filename.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`src=["'](?:cid:)?${filenameEscaped}["']`, "gi");
          const base64Data = att.body.replace(/\s/g, "");
          htmlBody = htmlBody.replace(regex, `src="data:${att.contentType};base64,${base64Data}"`);
        }
      });
    }
  }
  
  return {
    headers: decodedHeaders,
    htmlBody,
    textBody,
    attachments
  };
};

// Format bytes to readable size
const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const escapeHtml = (unsafe) => {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default function EmailToPDF() {
  const [emlData, setEmlData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "details" | "attachments"

  // Conversion Settings
  const [settings, setSettings] = useState({
    pageSize: "A4", // A4, Letter, A3, Legal, A5, Continuous
    orientation: "portrait", // portrait, landscape
    margins: "normal", // none, narrow, normal, wide
    customMargin: 12, // custom margin in mm
    showHeader: true,
    headersToShow: {
      subject: true,
      from: true,
      to: true,
      cc: true,
      date: true,
      attachments: true
    },
    fontFamily: "sans-serif", // sans-serif, serif, monospace, system-ui
    fontSize: "medium", // small, medium, large
    customFontSize: 15, // custom font size in px
    colorMode: "color", // color, grayscale, high-contrast
    pdfTitle: "",
    pdfAuthor: "",
    pdfSubject: ""
  });

  const previewIframeRef = useRef(null);
  const printableIframeRef = useRef(null);

  // Sync state options with input elements
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleHeaderToggle = (headerKey) => {
    setSettings(prev => ({
      ...prev,
      headersToShow: {
        ...prev.headersToShow,
        [headerKey]: !prev.headersToShow[headerKey]
      }
    }));
  };

  // Build HTML that will render inside the preview / export frame
  const buildIframeHtml = (isForExport = false) => {
    if (!emlData) return "";
    
    // Styles to inject based on user settings
    const marginMap = {
      none: "0mm",
      narrow: "5mm",
      normal: "12mm",
      wide: "20mm",
      custom: `${settings.customMargin || 12}mm`
    };
    const padding = marginMap[settings.margins] || `${settings.customMargin || 12}mm`;
    
    const fontMap = {
      "sans-serif": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "serif": "Georgia, Cambria, 'Times New Roman', Times, serif",
      "monospace": "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
      "system-ui": "system-ui, sans-serif"
    };
    const fontFamily = fontMap[settings.fontFamily] || fontMap["sans-serif"];
    
    const sizeMap = {
      small: "12px",
      medium: "15px",
      large: "18px",
      custom: `${settings.customFontSize || 15}px`
    };
    const fontSize = sizeMap[settings.fontSize] || `${settings.customFontSize || 15}px`;
    
    const colorFilter = settings.colorMode === "grayscale" 
      ? "filter: grayscale(100%); -webkit-filter: grayscale(100%);" 
      : settings.colorMode === "high-contrast" 
        ? "filter: contrast(140%) brightness(105%);" 
        : "";

    let widthStyle = "max-width: 100%; margin: 0 auto;";
    if (settings.pageSize !== "Continuous") {
      const widths = {
        A4: "794px", // A4 Width at 96 DPI
        Letter: "816px",
        A3: "1123px",
        Legal: "816px",
        A5: "559px"
      };
      const targetWidth = widths[settings.pageSize] || "794px";
      widthStyle = `width: ${targetWidth}; box-sizing: border-box;`;
    } else {
      widthStyle = "width: 800px; box-sizing: border-box;";
    }

    const headerHtml = settings.showHeader ? `
      <div class="email-header" style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; font-family: ${fontFamily}; text-align: left;">
        ${settings.headersToShow.subject && emlData.headers.subject ? `
          <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #0f172a; line-height: 1.3;">
            ${escapeHtml(emlData.headers.subject)}
          </h1>
        ` : ""}
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569;">
          ${settings.headersToShow.from && emlData.headers.from ? `
            <tr>
              <td style="width: 60px; font-weight: 600; padding: 3px 0; color: #0f172a; vertical-align: top;">From:</td>
              <td style="padding: 3px 0; vertical-align: top;">${escapeHtml(emlData.headers.from)}</td>
            </tr>
          ` : ""}
          ${settings.headersToShow.to && emlData.headers.to ? `
            <tr>
              <td style="width: 60px; font-weight: 600; padding: 3px 0; color: #0f172a; vertical-align: top;">To:</td>
              <td style="padding: 3px 0; vertical-align: top;">${escapeHtml(emlData.headers.to)}</td>
            </tr>
          ` : ""}
          ${settings.headersToShow.cc && emlData.headers.cc ? `
            <tr>
              <td style="width: 60px; font-weight: 600; padding: 3px 0; color: #0f172a; vertical-align: top;">Cc:</td>
              <td style="padding: 3px 0; vertical-align: top;">${escapeHtml(emlData.headers.cc)}</td>
            </tr>
          ` : ""}
          ${settings.headersToShow.date && emlData.headers.date ? `
            <tr>
              <td style="width: 60px; font-weight: 600; padding: 3px 0; color: #0f172a; vertical-align: top;">Date:</td>
              <td style="padding: 3px 0; vertical-align: top;">${escapeHtml(emlData.headers.date)}</td>
            </tr>
          ` : ""}
        </table>
      </div>
    ` : "";

    const showAttachments = settings.headersToShow.attachments && emlData.attachments && emlData.attachments.length > 0;
    const attachmentsHtml = showAttachments ? `
      <div class="email-attachments" style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-family: ${fontFamily}; font-size: 13px; text-align: left;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">
          Attachments (${emlData.attachments.length}):
        </div>
        <ul style="margin: 0; padding-left: 20px; color: #475569;">
          ${emlData.attachments.map(att => `
            <li style="margin-bottom: 4px;">
              ${escapeHtml(att.filename)} <span style="color: #94a3b8; font-size: 11px;">(${formatBytes(att.size || 0)})</span>
            </li>
          `).join("")}
        </ul>
      </div>
    ` : "";

    let contentHtml = "";
    if (emlData.htmlBody) {
      contentHtml = emlData.htmlBody;
    } else if (emlData.textBody) {
      contentHtml = `<pre style="white-space: pre-wrap; font-family: ${fontFamily}; font-size: ${fontSize}; line-height: 1.6; color: #334155; margin: 0;">${escapeHtml(emlData.textBody)}</pre>`;
    } else {
      contentHtml = `<p style="font-style: italic; color: #94a3b8;">(Empty email body)</p>`;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
            }
            body {
              padding: ${padding};
              font-family: ${fontFamily};
              font-size: ${fontSize};
              line-height: 1.5;
              color: #334155;
              ${colorFilter}
              ${widthStyle}
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            img {
              max-width: 100% !important;
              height: auto !important;
            }
            blockquote {
              border-left: 3px solid #cbd5e1;
              margin-left: 0;
              padding-left: 16px;
              color: #475569;
            }
            table {
              max-width: 100% !important;
            }
            @media print {
              body {
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
              }
              @page {
                size: ${settings.pageSize === "Continuous" ? "auto" : `${settings.pageSize.toLowerCase()} ${settings.orientation}`};
                margin: ${padding};
              }
            }
          </style>
        </head>
        <body>
          ${headerHtml}
          <div class="email-body-content">
            ${contentHtml}
          </div>
          ${attachmentsHtml}
        </body>
      </html>
    `;
  };

  // Sync HTML contents to iframe
  useEffect(() => {
    if (emlData && previewIframeRef.current) {
      const html = buildIframeHtml(false);
      const doc = previewIframeRef.current.contentDocument || previewIframeRef.current.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [emlData, settings]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.name.toLowerCase().endsWith(".eml")) {
      toast.error("Invalid file format. Please upload a .eml file.");
      return;
    }

    setLoading(true);
    setLoadingMessage("Reading file contents...");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setLoadingMessage("Parsing MIME sections...");
        const text = e.target.result;
        const parsed = parseEml(text);
        
        // Pre-fill metadata inputs
        setSettings(prev => ({
          ...prev,
          pdfTitle: parsed.headers.subject || "",
          pdfAuthor: parsed.headers.from || ""
        }));

        setEmlData(parsed);
        setActiveTab("preview");
        toast.success("Email parsed successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse EML. The file may be corrupt or encoded improperly.");
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const downloadAttachmentFile = (att) => {
    try {
      const base64Data = att.body.replace(/\s/g, "");
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: att.contentType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = att.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded: ${att.filename}`);
    } catch (e) {
      console.error(e);
      toast.error("Could not download attachment. Encoding format error.");
    }
  };

  // â”€â”€â”€ Selectable PDF Exporter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Renders email as real vector text (selectable/searchable) + embeds inline
  // images. Proper mm-based line height and correct page-break margins.
  const generateSelectablePdf = async () => {
    if (!emlData) return;
    setLoading(true);
    setLoadingMessage("Generating PDFâ€¦");

    try {
      const { jsPDF } = await import("jspdf");
      
      const formatSizes = {
        A4: { width: 210, height: 297 },
        Letter: { width: 215.9, height: 279.4 },
        A3: { width: 297, height: 420 },
        Legal: { width: 215.9, height: 355.6 },
        A5: { width: 148, height: 210 }
      };
      
      const pageSize = settings.pageSize === "Continuous" ? "A4" : settings.pageSize;
      const sizeInfo = formatSizes[pageSize] || formatSizes.A4;
      const pw = settings.orientation === "portrait" ? sizeInfo.width : sizeInfo.height;
      const ph = settings.orientation === "portrait" ? sizeInfo.height : sizeInfo.width;
      
      const doc = new jsPDF({
        orientation: settings.orientation,
        unit: "mm",
        format: pageSize.toLowerCase()
      });

      doc.setProperties({
        title: settings.pdfTitle || emlData.headers.subject || "",
        author: settings.pdfAuthor || emlData.headers.from || "",
        subject: settings.pdfSubject || "Selectable Email Document",
        creator: "ToolsTrek Email to PDF"
      });

      const marginMap = {
        none: 5,
        narrow: 10,
        normal: 15,
        wide: 25,
        custom: Number(settings.customMargin) || 15
      };
      const margin = marginMap[settings.margins] !== undefined
        ? marginMap[settings.margins]
        : (Number(settings.customMargin) || 15);

      const contentWidth = pw - margin * 2;
      // jsPDF uses mm for positioning but pt for font size.
      // Conversion: 1 pt = 0.352778 mm  â†’  lineHeight = fontSizePt Ã— 0.352778 Ã— lineSpacingFactor
      const PT_TO_MM = 0.352778;
      const LINE_SPACING = 1.45;

      const fontMap = {
        "sans-serif": "helvetica",
        "serif": "times",
        "monospace": "courier",
        "system-ui": "helvetica"
      };
      const pdfFont = fontMap[settings.fontFamily] || "helvetica";

      const fontSizeMap = {
        small: 9,
        medium: 11,
        large: 13,
        custom: Math.max(6, Math.round((settings.customFontSize || 15) * 0.75))
      };
      const bodyFontSizePt = fontSizeMap[settings.fontSize] || 11;
      const bodyLineHeightMm = bodyFontSizePt * PT_TO_MM * LINE_SPACING;

      let yPos = margin;

      // Ensure there is space for `neededMm`; add a new page if not.
      const ensureSpace = (neededMm) => {
        if (yPos + neededMm > ph - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      // â”€â”€ 1. Header card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (settings.showHeader) {
        // Pre-measure how tall the card needs to be
        const FIELD_LINE_PT = 9.5;
        const fieldLineH = FIELD_LINE_PT * PT_TO_MM * LINE_SPACING;
        const subjectLinePt = 14;
        const subjectLineH = subjectLinePt * PT_TO_MM * LINE_SPACING;

        // Temporarily set font so splitTextToSize is accurate
        let cardHeight = 6; // top padding
        if (settings.headersToShow.subject && emlData.headers.subject) {
          doc.setFont(pdfFont, "bold");
          doc.setFontSize(subjectLinePt);
          const subLines = doc.splitTextToSize(emlData.headers.subject, contentWidth - 10);
          cardHeight += subLines.length * subjectLineH + 3;
        }
        const fieldRows = [
          settings.headersToShow.from && emlData.headers.from ? ["From:", emlData.headers.from] : null,
          settings.headersToShow.to   && emlData.headers.to   ? ["To:",   emlData.headers.to]   : null,
          settings.headersToShow.cc   && emlData.headers.cc   ? ["Cc:",   emlData.headers.cc]   : null,
          settings.headersToShow.date && emlData.headers.date ? ["Date:", emlData.headers.date] : null,
        ].filter(Boolean);
        doc.setFontSize(FIELD_LINE_PT);
        fieldRows.forEach(([, val]) => {
          const vLines = doc.splitTextToSize(val, contentWidth - 25);
          cardHeight += vLines.length * fieldLineH + 1;
        });
        cardHeight += 6; // bottom padding

        ensureSpace(cardHeight);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPos, contentWidth, cardHeight, 2, 2, "FD");

        let cy = yPos + 6;

        if (settings.headersToShow.subject && emlData.headers.subject) {
          doc.setFont(pdfFont, "bold");
          doc.setFontSize(subjectLinePt);
          doc.setTextColor(15, 23, 42);
          const subLines = doc.splitTextToSize(emlData.headers.subject, contentWidth - 10);
          subLines.forEach(line => {
            doc.text(line, margin + 5, cy);
            cy += subjectLineH;
          });
          cy += 3;
        }

        doc.setFontSize(FIELD_LINE_PT);
        fieldRows.forEach(([label, val]) => {
          doc.setFont(pdfFont, "bold");
          doc.setTextColor(71, 85, 105);
          doc.text(label, margin + 5, cy);
          doc.setFont(pdfFont, "normal");
          doc.setTextColor(51, 65, 85);
          const valLines = doc.splitTextToSize(val, contentWidth - 25);
          valLines.forEach((vl, vi) => {
            doc.text(vl, margin + 20, cy + vi * fieldLineH);
          });
          cy += valLines.length * fieldLineH + 1;
        });

        yPos += cardHeight + 8;
      }

      // â”€â”€ 2. Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const renderNodes = [];

      if (emlData.htmlBody) {
        // Use the browser's DOMParser so img.src is extracted correctly even
        // when the data-URI is many kilobytes long (regex [^>]* fails there).
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(emlData.htmlBody, "text/html");

        // Remove style/script noise
        htmlDoc.querySelectorAll("style, script, head").forEach(el => el.remove());

        const BLOCK_TAGS = new Set(["P","DIV","TR","LI","H1","H2","H3","H4","H5","H6","TABLE","TBODY","THEAD","SECTION","ARTICLE","BLOCKQUOTE"]);
        const HEADING_TAGS = new Set(["H1","H2","H3","H4","H5","H6"]);

        const walkNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const t = node.textContent
              .replace(/\s+/g, " ")
              .trim();
            if (t) renderNodes.push({ type: "text", value: t });
            return;
          }
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          const tag = node.tagName.toUpperCase();

          if (tag === "IMG") {
            const imgSrc = node.getAttribute("src") || "";
            if (imgSrc.startsWith("data:")) {
              renderNodes.push({ type: "img", src: imgSrc });
            }
            return;
          }

          if (tag === "BR") {
            renderNodes.push({ type: "break", size: 1 });
            return;
          }

          // Walk children first, then emit a block break if needed
          node.childNodes.forEach(walkNode);

          if (BLOCK_TAGS.has(tag)) {
            renderNodes.push({ type: "break", size: HEADING_TAGS.has(tag) ? 2 : 1 });
          }
        };

        walkNode(htmlDoc.body);
      } else if (emlData.textBody) {
        // Plain-text email â€” split on newlines
        emlData.textBody.split(/\n/).forEach(line => {
          const t = line.trim();
          if (t) renderNodes.push({ type: "text", value: t });
          renderNodes.push({ type: "break", size: 1 });
        });
      } else {
        renderNodes.push({ type: "text", value: "(Empty email body)" });
      }

      // Now render the node list into the PDF
      doc.setFont(pdfFont, "normal");
      doc.setFontSize(bodyFontSizePt);
      doc.setTextColor(51, 65, 85);

      let pendingBreaks = 0;
      const MAX_IMG_W = contentWidth;  // images can use full content width
      const MAX_IMG_H = ph * 0.4;      // cap image height at 40% of page

      for (const node of renderNodes) {
        if (node.type === "break") {
          pendingBreaks = Math.max(pendingBreaks, node.size);
        } else if (node.type === "text") {
          if (pendingBreaks > 0) {
            yPos += bodyLineHeightMm * (pendingBreaks === 1 ? 0.5 : 1);
            pendingBreaks = 0;
          }
          if (!node.value) continue;
          const wrapped = doc.splitTextToSize(node.value, contentWidth);
          for (const line of wrapped) {
            ensureSpace(bodyLineHeightMm);
            doc.text(line, margin, yPos);
            yPos += bodyLineHeightMm;
          }
        } else if (node.type === "img") {
          if (pendingBreaks > 0) {
            yPos += bodyLineHeightMm * 0.5;
            pendingBreaks = 0;
          }
          try {
            // Extract format from data URI
            const fmtMatch = node.src.match(/^data:image\/(\w+);base64,/);
            if (fmtMatch) {
              const fmt = fmtMatch[1].toUpperCase().replace("JPG", "JPEG");
              // Create a temp Image to get natural dimensions
              await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                  const ratio = img.naturalWidth / img.naturalHeight;
                  let imgW = Math.min(MAX_IMG_W, img.naturalWidth * 0.264583); // pxâ†’mm
                  let imgH = imgW / ratio;
                  if (imgH > MAX_IMG_H) {
                    imgH = MAX_IMG_H;
                    imgW = imgH * ratio;
                  }
                  ensureSpace(imgH + bodyLineHeightMm);
                  try {
                    doc.addImage(node.src, fmt, margin, yPos, imgW, imgH);
                    yPos += imgH + bodyLineHeightMm * 0.5;
                  } catch (_) { /* skip unrenderable image */ }
                  resolve();
                };
                img.onerror = () => resolve();
                img.src = node.src;
              });
            }
          } catch (_) { /* skip on any error */ }
        }
      }

      // â”€â”€ 3. Attachments list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const showAttachments = settings.headersToShow.attachments
        && emlData.attachments && emlData.attachments.length > 0;
      if (showAttachments) {
        yPos += bodyLineHeightMm * 1.5;
        const attLabelH = 10 * PT_TO_MM * LINE_SPACING;
        const attItemH  = 9  * PT_TO_MM * LINE_SPACING;

        ensureSpace(attLabelH + attItemH);

        // Divider line
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, margin + contentWidth, yPos);
        yPos += 3;

        doc.setFont(pdfFont, "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`Attachments (${emlData.attachments.length})`, margin, yPos);
        yPos += attLabelH;

        doc.setFont(pdfFont, "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        emlData.attachments.forEach(att => {
          ensureSpace(attItemH);
          doc.text(`â€¢ ${att.filename} (${formatBytes(att.size || 0)})`, margin + 3, yPos);
          yPos += attItemH;
        });
      }

      const safeName = (emlData.headers.subject || "email")
        .replace(/[^a-z0-9]/gi, "_").toLowerCase();
      doc.save(`${safeName}.pdf`);
      toast.success("PDF downloaded!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  // PDF Exporter using dynamic iframe extraction
  const generatePdf = async () => {
    if (!emlData) return;
    setLoading(true);
    setLoadingMessage("Preparing render context...");

    try {
      // 1. Create a temporary print iframe inside the document body
      const printFrame = document.createElement("iframe");
      printFrame.style.position = "absolute";
      printFrame.style.left = "-9999px";
      printFrame.style.top = "-9999px";
      printFrame.style.border = "none";
      
      // Determine printing width based on setting
      const paperWidthsDpi = {
        A4: 794,
        Letter: 816,
        A3: 1123,
        Legal: 816,
        A5: 559,
        Continuous: 800
      };
      const widthDpi = paperWidthsDpi[settings.pageSize] || 794;
      printFrame.style.width = `${widthDpi}px`;
      
      document.body.appendChild(printFrame);

      // 2. Inject HTML content
      const exportHtml = buildIframeHtml(true);
      const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
      printDoc.open();
      printDoc.write(exportHtml);
      printDoc.close();

      setLoadingMessage("Importing PDF libraries...");
      // Dynamically load libraries
      const { jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      // Wait a moment for layout reflow and image loads
      setLoadingMessage("Processing graphic layout & images...");
      await new Promise(resolve => setTimeout(resolve, 800));

      const printBody = printDoc.body;
      
      setLoadingMessage("Generating canvas...");
      // Capture the iframe body
      const canvas = await html2canvas(printBody, {
        scale: 2, // High resolution output
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: widthDpi
      });

      setLoadingMessage("Assembling PDF document...");
      
      const fileName = `${(emlData.headers.subject || "Email").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      
      // Document Metadata
      const pdfProps = {
        title: settings.pdfTitle || emlData.headers.subject || "",
        author: settings.pdfAuthor || emlData.headers.from || "",
        subject: settings.pdfSubject || "Converted Email Document",
        creator: "ToolsTrek Email to PDF"
      };

      if (settings.pageSize === "Continuous") {
        // Continuous PDF
        const imgWidth = 210; // width in mm (standard reference)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [imgWidth, imgHeight],
          putOnlyUsedFonts: true
        });

        doc.setProperties(pdfProps);

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        doc.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
        
        doc.save(fileName);
      } else {
        // Multi-page PDF
        const formatSizes = {
          A4: { width: 210, height: 297 },
          Letter: { width: 215.9, height: 279.4 },
          A3: { width: 297, height: 420 },
          Legal: { width: 215.9, height: 355.6 },
          A5: { width: 148, height: 210 }
        };
        
        const sizeInfo = formatSizes[settings.pageSize] || formatSizes.A4;
        const pw = settings.orientation === "portrait" ? sizeInfo.width : sizeInfo.height;
        const ph = settings.orientation === "portrait" ? sizeInfo.height : sizeInfo.width;
        
        const doc = new jsPDF({
          orientation: settings.orientation,
          unit: "mm",
          format: settings.pageSize.toLowerCase(),
          putOnlyUsedFonts: true
        });

        doc.setProperties(pdfProps);

        const marginMap = {
          none: 0,
          narrow: 5,
          normal: 12,
          wide: 20,
          custom: Number(settings.customMargin) || 12
        };
        const margin = marginMap[settings.margins] !== undefined ? marginMap[settings.margins] : (Number(settings.customMargin) || 12);
        
        const imgWidth = pw - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageHeight = ph - (margin * 2);
        
        const imgData = canvas.toDataURL("image/jpeg", 0.90);
        
        let heightLeft = imgHeight;
        let position = margin;
        
        doc.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
        
        while (heightLeft > 0) {
          position = heightLeft - imgHeight + margin;
          doc.addPage();
          doc.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight, undefined, "FAST");
          heightLeft -= pageHeight;
        }
        
        doc.save(fileName);
      }

      // Cleanup
      document.body.removeChild(printFrame);
      toast.success("PDF exported successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF. Check EML data or try decreasing resolution/page settings.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!previewIframeRef.current) {
      toast.error("No email preview available to print.");
      return;
    }
    try {
      const iframe = previewIframeRef.current;
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      toast.success("Opened browser print dialog!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to open print dialog. Try using the Export Image PDF option.");
    }
  };

  const handleClear = () => {
    setEmlData(null);
    setSettings(prev => ({
      ...prev,
      pdfTitle: "",
      pdfAuthor: "",
      pdfSubject: ""
    }));
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl px-4 pt-20 pb-10">
      <div className="flex flex-col gap-6 font-sans min-h-[calc(100vh-140px)]">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brandColor/10 dark:bg-brandColor/20 text-brandColor rounded-xl">
                <Mail className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  Email to PDF Converter
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Convert EML files to custom sized document PDFs safely. Use <strong>Download Selectable PDF</strong> for selectable text.
                </p>
              </div>
            </div>
          </div>
          {emlData && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handleClear} className="gap-2 dark:hover:bg-gray-800">
                <Trash2 className="h-4 w-4" /> Reset
              </Button>
              <Button onClick={generateSelectablePdf} disabled={loading} className="bg-brandColor hover:bg-brandColorHover text-white gap-2 font-bold shadow-md">
                <FileText className="h-4 w-4" /> {loading ? "Generatingâ€¦" : "Download PDF"}
              </Button>
            </div>
          )}
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Display Area (Left 8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-full">
            {!emlData ? (
              // Drag and drop zone
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all duration-300 min-h-[400px] ${
                  dragActive 
                    ? "border-brandColor bg-brandColor/5 scale-[1.01]" 
                    : "border-gray-300 dark:border-gray-700 bg-white/40 dark:bg-gray-900/20 hover:border-brandColor/50 hover:bg-brandColor/2"
                }`}
              >
                <div className="flex flex-col items-center max-w-md text-center">
                  <div className="p-5 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4 border border-gray-200/50 dark:border-gray-700/50">
                    <FileUp className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    Upload your EML file
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                    Drag and drop your <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">.eml</code> file here, or click to browse local files.
                  </p>
                  <label className="cursor-pointer">
                    <span className="bg-brandColor hover:bg-brandColorHover text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-colors text-sm inline-flex items-center gap-2">
                      Select EML File
                    </span>
                    <input
                      type="file"
                      accept=".eml"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-gray-400 mt-4 block">
                    No files are uploaded to any server. All parsing runs 100% locally.
                  </span>
                </div>
              </div>
            ) : (
              // Parsed view tabs
              <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm min-h-[500px]">
                
                {/* Email Client Tabs */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-2 bg-gray-50 dark:bg-gray-950/50">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        activeTab === "preview"
                          ? "bg-brandColor/10 dark:bg-brandColor/20 text-brandColor"
                          : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Live Document Preview
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        activeTab === "details"
                          ? "bg-brandColor/10 dark:bg-brandColor/20 text-brandColor"
                          : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Email Details
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("attachments")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition relative ${
                        activeTab === "attachments"
                          ? "bg-brandColor/10 dark:bg-brandColor/20 text-brandColor"
                          : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" /> Attachments
                        {emlData.attachments.length > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {emlData.attachments.length}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                  
                  {/* File Metadata Info */}
                  <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    Parsed Local EML
                  </div>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/20 min-h-[450px]">
                  <AnimatePresence mode="wait">
                    
                    {/* 1. HTML preview iframe inside an A4 styled frame */}
                    {activeTab === "preview" && (
                      <motion.div
                        key="preview-tab"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex flex-col items-center justify-start h-full"
                      >
                        {/* Page Frame Wrapper representing the PDF format layout */}
                        <div className="w-full max-w-[830px] border border-gray-200 dark:border-gray-800 bg-white shadow-lg rounded-2xl overflow-hidden min-h-[500px]">
                          <iframe
                            ref={previewIframeRef}
                            title="EML HTML preview content"
                            className="w-full min-h-[500px] border-none"
                            sandbox="allow-same-origin"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* 2. EML headers and plaintext body dump */}
                    {activeTab === "details" && (
                      <motion.div
                        key="details-tab"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl space-y-3">
                          <h3 className="text-sm font-bold uppercase text-brandColor tracking-wide mb-1">
                            Parsed Metadata
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-semibold text-gray-500">Subject:</div>
                              <div className="text-gray-950 dark:text-white font-medium mt-0.5">{emlData.headers.subject}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-500">Date:</div>
                              <div className="text-gray-950 dark:text-white font-medium mt-0.5">{emlData.headers.date || "N/A"}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-500">From:</div>
                              <div className="text-gray-950 dark:text-white font-medium mt-0.5 break-all">{emlData.headers.from}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-500">To:</div>
                              <div className="text-gray-950 dark:text-white font-medium mt-0.5 break-all">{emlData.headers.to || "N/A"}</div>
                            </div>
                            {emlData.headers.cc && (
                              <div className="md:col-span-2">
                                <div className="font-semibold text-gray-500">Cc:</div>
                                <div className="text-gray-950 dark:text-white font-medium mt-0.5 break-all">{emlData.headers.cc}</div>
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-500">MIME Content Type:</div>
                              <div className="text-gray-950 dark:text-white font-mono text-xs mt-0.5">{emlData.headers.contentType}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-500">Body Types Detected:</div>
                              <div className="flex gap-2 mt-1">
                                {emlData.htmlBody && (
                                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold">
                                    HTML Body
                                  </span>
                                )}
                                {emlData.textBody && (
                                  <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-bold">
                                    Plain Text Body
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {emlData.textBody && (
                          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl">
                            <h3 className="text-sm font-bold uppercase text-brandColor tracking-wide mb-3">
                              Plain Text Body View
                            </h3>
                            <pre className="text-xs p-4 bg-gray-50 dark:bg-gray-950 rounded-xl overflow-x-auto text-gray-700 dark:text-gray-300 font-mono leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                              {emlData.textBody}
                            </pre>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* 3. Attachments extraction list */}
                    {activeTab === "attachments" && (
                      <motion.div
                        key="attachments-tab"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        {emlData.attachments.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                            <Paperclip className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-sm font-semibold italic">No attachments found in this email file</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {emlData.attachments.map((att, i) => (
                              <div
                                key={i}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xs"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="p-2.5 bg-brandColor/10 text-brandColor rounded-xl shrink-0">
                                    <Paperclip className="h-5 w-5" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                      {att.filename}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                                      <span>{formatBytes(att.size)}</span>
                                      <span>â€¢</span>
                                      <span className="truncate">{att.contentType.split(";")[0]}</span>
                                      {att.inline && (
                                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 font-extrabold px-1 rounded">
                                          Inline
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadAttachmentFile(att)}
                                  className="h-8 rounded-lg dark:hover:bg-gray-800"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Configuration Panel (Right 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Standard Settings Block */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <Layout className="h-4 w-4 text-brandColor" /> Layout Settings
              </h2>
              
              <div className="space-y-4">
                {/* Paper Size */}
                <div className="space-y-1.5">
                  <Label htmlFor="pageSize" className="text-xs font-semibold text-gray-500">Paper Size</Label>
                  <Select
                    value={settings.pageSize}
                    onValueChange={(val) => handleSettingChange("pageSize", val)}
                  >
                    <SelectTrigger className="w-full dark:border-gray-800">
                      <SelectValue placeholder="Select paper size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                      <SelectItem value="Letter">Letter (8.5 x 11 in)</SelectItem>
                      <SelectItem value="A3">A3 (297 x 420 mm)</SelectItem>
                      <SelectItem value="Legal">Legal (8.5 x 14 in)</SelectItem>
                      <SelectItem value="A5">A5 (148 x 210 mm)</SelectItem>
                      <SelectItem value="Continuous">Web Page (Continuous)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Paper Orientation */}
                {settings.pageSize !== "Continuous" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="orientation" className="text-xs font-semibold text-gray-500">Orientation</Label>
                    <Select
                      value={settings.orientation}
                      onValueChange={(val) => handleSettingChange("orientation", val)}
                    >
                      <SelectTrigger className="w-full dark:border-gray-800">
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Page Margins */}
                <div className="space-y-1.5">
                  <Label htmlFor="margins" className="text-xs font-semibold text-gray-500">Page Margins</Label>
                  <Select
                    value={settings.margins}
                    onValueChange={(val) => handleSettingChange("margins", val)}
                  >
                    <SelectTrigger className="w-full dark:border-gray-800">
                      <SelectValue placeholder="Select margin size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (0 mm)</SelectItem>
                      <SelectItem value="narrow">Narrow (5 mm)</SelectItem>
                      <SelectItem value="normal">Normal (12 mm)</SelectItem>
                      <SelectItem value="wide">Wide (20 mm)</SelectItem>
                      <SelectItem value="custom">Custom Margin...</SelectItem>
                    </SelectContent>
                  </Select>
                  {settings.margins === "custom" && (
                    <div className="pt-2 space-y-1">
                      <Label htmlFor="customMargin" className="text-[11px] text-gray-500 font-medium">Margin Width (mm)</Label>
                      <Input
                        id="customMargin"
                        type="number"
                        min="0"
                        max="100"
                        value={settings.customMargin}
                        onChange={(e) => handleSettingChange("customMargin", Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-9 text-xs dark:border-gray-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div className="pt-2 border-t border-gray-150 dark:border-gray-800">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full gap-2 border-dashed dark:hover:bg-gray-800"
                >
                  <Settings className={`h-4 w-4 transition-transform duration-300 ${showAdvanced ? "rotate-90 text-brandColor" : ""}`} />
                  {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
                </Button>
              </div>
            </div>

            {/* Advanced Settings Drawer */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-6"
                >
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-5">
                    
                    {/* Section 1: Font Styling */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                        <Type className="h-3.5 w-3.5 text-brandColor" /> Typography
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Font Family</Label>
                          <Select
                            value={settings.fontFamily}
                            onValueChange={(val) => handleSettingChange("fontFamily", val)}
                          >
                            <SelectTrigger className="w-full text-xs dark:border-gray-800">
                              <SelectValue placeholder="Font family" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sans-serif">Modern Sans-Serif</SelectItem>
                              <SelectItem value="serif">Classic Serif</SelectItem>
                              <SelectItem value="monospace">Developer Mono</SelectItem>
                              <SelectItem value="system-ui">System Default</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Font Size</Label>
                          <Select
                            value={settings.fontSize}
                            onValueChange={(val) => handleSettingChange("fontSize", val)}
                          >
                            <SelectTrigger className="w-full text-xs dark:border-gray-800">
                              <SelectValue placeholder="Font size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small (12px)</SelectItem>
                              <SelectItem value="medium">Medium (15px)</SelectItem>
                              <SelectItem value="large">Large (18px)</SelectItem>
                              <SelectItem value="custom">Custom Size...</SelectItem>
                            </SelectContent>
                          </Select>
                          {settings.fontSize === "custom" && (
                            <div className="pt-1.5 space-y-1">
                              <Label className="text-[11px] text-gray-500 font-medium">Font Size (px)</Label>
                              <Input
                                type="number"
                                min="8"
                                max="72"
                                value={settings.customFontSize}
                                onChange={(e) => handleSettingChange("customFontSize", Math.max(8, parseInt(e.target.value) || 8))}
                                className="h-8 text-xs dark:border-gray-800"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Header Control */}
                    <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-brandColor" /> Header Options
                        </span>
                        <Switch
                          checked={settings.showHeader}
                          onCheckedChange={(val) => handleSettingChange("showHeader", val)}
                        />
                      </h3>
                      
                      {settings.showHeader && (
                        <div className="grid grid-cols-2 gap-3 pl-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={settings.headersToShow.subject}
                              onChange={() => handleHeaderToggle("subject")}
                              className="rounded border-gray-300 accent-brandColor"
                            />
                            Subject
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={settings.headersToShow.from}
                              onChange={() => handleHeaderToggle("from")}
                              className="rounded border-gray-300 accent-brandColor"
                            />
                            From
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={settings.headersToShow.to}
                              onChange={() => handleHeaderToggle("to")}
                              className="rounded border-gray-300 accent-brandColor"
                            />
                            To
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={settings.headersToShow.cc}
                              onChange={() => handleHeaderToggle("cc")}
                              className="rounded border-gray-300 accent-brandColor"
                            />
                            Cc
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={settings.headersToShow.date}
                              onChange={() => handleHeaderToggle("date")}
                              className="rounded border-gray-300 accent-brandColor"
                            />
                            Date
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={settings.headersToShow.attachments}
                              onChange={() => handleHeaderToggle("attachments")}
                              className="rounded border-gray-300 accent-brandColor"
                            />
                            Attachments
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Colors */}
                    <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                        <Palette className="h-3.5 w-3.5 text-brandColor" /> Color Processing
                      </h3>
                      <Select
                        value={settings.colorMode}
                        onValueChange={(val) => handleSettingChange("colorMode", val)}
                      >
                        <SelectTrigger className="w-full text-xs dark:border-gray-800">
                          <SelectValue placeholder="Color mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="color">Full Colors (Default)</SelectItem>
                          <SelectItem value="grayscale">Grayscale (Ink Saver)</SelectItem>
                          <SelectItem value="high-contrast">High Contrast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Section 4: PDF Metadata properties */}
                    <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-brandColor" /> PDF Properties (Metadata)
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PDF Title</Label>
                          <Input
                            type="text"
                            value={settings.pdfTitle}
                            onChange={(e) => handleSettingChange("pdfTitle", e.target.value)}
                            placeholder="Enter document title"
                            className="h-8 text-xs dark:border-gray-800 mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Author</Label>
                          <Input
                            type="text"
                            value={settings.pdfAuthor}
                            onChange={(e) => handleSettingChange("pdfAuthor", e.target.value)}
                            placeholder="Enter author name"
                            className="h-8 text-xs dark:border-gray-800 mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Subject</Label>
                          <Input
                            type="text"
                            value={settings.pdfSubject}
                            onChange={(e) => handleSettingChange("pdfSubject", e.target.value)}
                            placeholder="Enter description"
                            className="h-8 text-xs dark:border-gray-800 mt-0.5"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* Modern Loader Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-3xl max-w-sm w-full border border-gray-250 dark:border-gray-800 shadow-2xl flex flex-col items-center text-center space-y-4"
            >
              <div className="relative">
                <RefreshCw className="h-10 w-10 text-brandColor animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-brandColor" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">Processing Email</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{loadingMessage}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </ToolPageShell>
  );
}
