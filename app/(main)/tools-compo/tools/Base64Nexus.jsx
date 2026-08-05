"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  ArrowLeftRight,
  Settings,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Shield,
  Lock,
  Unlock,
  FileCode,
  FileImage,
  FileText,
  AlertCircle,
  Eye,
  RefreshCw,
  FileArchive,
  FileWarning
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────
const STANDARD_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const URL_SAFE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

// Examples & Use Cases data
const EXAMPLES = [
  {
    id: "data-uri",
    title: "Data URIs (HTML/CSS)",
    desc: "Embed images or resources directly into HTML/CSS files to reduce HTTP requests. The browser decodes and displays the file inline.",
    code: `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA\nAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO\n9TXL0Y4OHwAAAABJRU5ErkJggg==" alt="Red dot" />`,
    loadable: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    loadText: "Load Red Dot SVG/PNG"
  },
  {
    id: "basic-auth",
    title: "Basic Authentication",
    desc: "Send user credentials in HTTP requests. The string is formed by encoding 'username:password' in Base64.",
    code: "Authorization: Basic YWRtaW46c3VwZXJzZWNyZXRwYXNzd29yZDEyMw==",
    loadable: "YWRtaW46c3VwZXJzZWNyZXRwYXNzd29yZDEyMw==",
    loadText: "Load Credentials"
  },
  {
    id: "jwt",
    title: "JSON Web Tokens",
    desc: "JWT Header and Payload are encoded in URL-safe Base64 without padding. They represent raw JSON structure.",
    code: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
    loadable: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    loadText: "Load JWT Header"
  },
  {
    id: "mime",
    title: "MIME Email Attachments",
    desc: "E-mail protocols only transmit plain text. Binary attachments are encoded to Base64 using 76-character line wraps.",
    code: "Content-Transfer-Encoding: base64\nContent-Type: application/pdf\n\nJVBERi0xLjQKJcfsj6IKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAvUGFn\nZXMgMiAwIFIKICA+PgplbmRvYmo...",
    loadable: "JVBERi0xLjQKJcfsj6IKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAvUGFn\nZXMgMiAwIFIKICA+PgplbmRvYmo=",
    loadText: "Load Sample PDF Header"
  }
];

// ─── Encoding/Decoding Core Engines ──────────────────────────────────────────
function bytesToBase64(bytes, alphabet, usePadding = true) {
  let result = "";
  const len = bytes.length;
  let i = 0;

  for (i = 0; i < len - 2; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];

    const c0 = b0 >> 2;
    const c1 = ((b0 & 3) << 4) | (b1 >> 4);
    const c2 = ((b1 & 15) << 2) | (b2 >> 6);
    const c3 = b2 & 63;

    result += alphabet[c0] + alphabet[c1] + alphabet[c2] + alphabet[c3];
  }

  if (i < len) {
    const b0 = bytes[i];
    const c0 = b0 >> 2;
    if (i === len - 1) {
      const c1 = (b0 & 3) << 4;
      result += alphabet[c0] + alphabet[c1];
      if (usePadding) result += "==";
    } else {
      const b1 = bytes[i + 1];
      const c1 = ((b0 & 3) << 4) | (b1 >> 4);
      const c2 = (b1 & 15) << 2;
      result += alphabet[c0] + alphabet[c1] + alphabet[c2];
      if (usePadding) result += "=";
    }
  }

  return result;
}

function base64ToBytes(base64Str, alphabet, strict = false) {
  let cleaned = base64Str.trim();

  // If it's a data URI, extract base64 data section
  if (cleaned.startsWith("data:")) {
    const commaIndex = cleaned.indexOf(",");
    if (commaIndex !== -1) {
      cleaned = cleaned.slice(commaIndex + 1);
    }
  }

  // Remove whitespaces/newlines for parsing
  const noWhitespace = cleaned.replace(/\s+/g, "");

  if (strict) {
    // Validate characters belong exclusively to the chosen alphabet or are padding characters
    const escapedAlphabet = alphabet.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const validCharsRegex = new RegExp(`^[${escapedAlphabet}]+={0,2}$`);
    if (!validCharsRegex.test(noWhitespace)) {
      throw new Error("Invalid Base64 character detected. Strict mode rejects non-alphabet characters.");
    }
    if (noWhitespace.length % 4 !== 0) {
      if (noWhitespace.length % 4 === 1) {
        throw new Error("Invalid Base64 sequence length. Input is corrupted.");
      }
      // Note: Padding might be missing, which we tolerate if not strict, but check length bounds
    }
    cleaned = noWhitespace;
  } else {
    // Lenient: Keep only characters in the alphabet and '='
    const alphabetSet = new Set(alphabet);
    cleaned = noWhitespace.split("").filter(c => alphabetSet.has(c) || c === "=").join("");
  }

  // Handle padding count
  let paddingCount = 0;
  if (cleaned.endsWith("==")) {
    paddingCount = 2;
    cleaned = cleaned.slice(0, -2);
  } else if (cleaned.endsWith("=")) {
    paddingCount = 1;
    cleaned = cleaned.slice(0, -1);
  }

  const charMap = {};
  for (let i = 0; i < alphabet.length; i++) {
    charMap[alphabet[i]] = i;
  }

  const len = cleaned.length;
  const outputLen = Math.floor(len * 3 / 4);
  const result = new Uint8Array(outputLen);
  let outputIdx = 0;

  let i = 0;
  for (i = 0; i < len - 3; i += 4) {
    const c0 = charMap[cleaned[i]];
    const c1 = charMap[cleaned[i + 1]];
    const c2 = charMap[cleaned[i + 2]];
    const c3 = charMap[cleaned[i + 3]];

    if (c0 === undefined || c1 === undefined || c2 === undefined || c3 === undefined) {
      throw new Error("Missing Base64 character reference during decoding.");
    }

    result[outputIdx++] = (c0 << 2) | (c1 >> 4);
    result[outputIdx++] = ((c1 & 15) << 4) | (c2 >> 2);
    result[outputIdx++] = ((c2 & 3) << 6) | c3;
  }

  if (i < len) {
    const c0 = charMap[cleaned[i]];
    const c1 = charMap[cleaned[i + 1]];
    const c2 = charMap[cleaned[i + 2]];

    if (c0 === undefined || c1 === undefined) {
      throw new Error("Truncated Base64 sequence detected.");
    }

    result[outputIdx++] = (c0 << 2) | (c1 >> 4);

    if (i + 2 < len && c2 !== undefined) {
      result[outputIdx++] = ((c1 & 15) << 4) | (c2 >> 2);
    }
  }

  return result;
}

// Sniff file types from binary header bytes
function sniffMimeType(bytes) {
  if (bytes.length >= 4) {
    // PNG
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return { mime: "image/png", ext: "png", type: "Image" };
    }
    // PDF
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { mime: "application/pdf", ext: "pdf", type: "PDF Document" };
    }
    // ZIP
    if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
      return { mime: "application/zip", ext: "zip", type: "ZIP Archive" };
    }
    // GIF
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return { mime: "image/gif", ext: "gif", type: "Image" };
    }
  }
  if (bytes.length >= 3) {
    // JPEG
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { mime: "image/jpeg", ext: "jpg", type: "Image" };
    }
  }
  if (bytes.length >= 12) {
    // WebP
    if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      return { mime: "image/webp", ext: "webp", type: "Image" };
    }
  }
  // SVG Vector sniff
  const textSample = new TextDecoder("utf-8").decode(bytes.subarray(0, Math.min(bytes.length, 256)));
  if (textSample.includes("<svg") || textSample.includes("<?xml") && textSample.includes("<svg")) {
    return { mime: "image/svg+xml", ext: "svg", type: "SVG Vector Image" };
  }

  return { mime: "application/octet-stream", ext: "bin", type: "Binary File" };
}

// Wrap output strings
function wrapString(str, length, lineBreak = "\n") {
  if (!length || str.length <= length) return str;
  const regex = new RegExp(`.{1,${length}}`, "g");
  return str.match(regex).join(lineBreak);
}

export default function Base64Nexus() {
  const [mode, setMode] = useState("encode"); // encode | decode
  const [inputType, setInputType] = useState("text"); // text | file

  // Text state
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");

  // File state
  const [fileInput, setFileInput] = useState(null);
  const [fileOutputBase64, setFileOutputBase64] = useState("");
  const [fileOutputMetadata, setFileOutputMetadata] = useState(null);
  const [fileOutputBlobUrl, setFileOutputBlobUrl] = useState("");
  const [isDataUriOption, setIsDataUriOption] = useState(true);

  // Settings
  const [variant, setVariant] = useState("standard"); // standard | urlsafe | custom
  const [customAlphabet, setCustomAlphabet] = useState("");
  const [customAlphabetError, setCustomAlphabetError] = useState("");
  const [usePadding, setUsePadding] = useState(true);
  const [wrapLength, setWrapLength] = useState(0); // 0 (none), 64, 76
  const [lineBreakStyle, setLineBreakStyle] = useState("\n"); // \n | \r\n
  const [textEncoding, setTextEncoding] = useState("utf-8"); // utf-8 | ascii | utf-16le | utf-16be | hex | binary
  const [decodeStrict, setDecodeStrict] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // UX triggers
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeExampleTab, setActiveExampleTab] = useState("data-uri");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [charFrequency, setCharFrequency] = useState({});

  const fileInputRef = useRef(null);

  // Get active alphabet
  const getAlphabet = useCallback(() => {
    if (variant === "standard") return STANDARD_ALPHABET;
    if (variant === "urlsafe") return URL_SAFE_ALPHABET;
    if (variant === "custom") {
      if (customAlphabet.length === 64) {
        return customAlphabet;
      }
    }
    return STANDARD_ALPHABET;
  }, [variant, customAlphabet]);

  // Clean up Object URL
  useEffect(() => {
    return () => {
      if (fileOutputBlobUrl) {
        URL.revokeObjectURL(fileOutputBlobUrl);
      }
    };
  }, [fileOutputBlobUrl]);

  // Custom Alphabet validation
  const handleCustomAlphabetChange = (val) => {
    setCustomAlphabet(val);
    if (!val) {
      setCustomAlphabetError("Alphabet cannot be empty.");
      return;
    }
    if (val.length !== 64) {
      setCustomAlphabetError(`Alphabet must be exactly 64 characters (currently: ${val.length}).`);
      return;
    }
    const set = new Set(val);
    if (set.size !== 64) {
      setCustomAlphabetError("All characters in the custom alphabet must be unique.");
      return;
    }
    // ASCII validation
    for (let i = 0; i < val.length; i++) {
      if (val.charCodeAt(i) > 255) {
        setCustomAlphabetError("Only standard ASCII single-byte characters are allowed in the alphabet.");
        return;
      }
    }
    setCustomAlphabetError("");
  };

  // Convert input text to bytes according to selected encoding
  const encodeTextToBytes = useCallback((text, encoding) => {
    if (encoding === "utf-8") {
      return new TextEncoder().encode(text);
    }
    if (encoding === "ascii") {
      const bytes = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code > 127 && decodeStrict) {
          throw new Error(`Non-ASCII character (char code ${code}) detected in strict ASCII mode.`);
        }
        bytes[i] = code & 127;
      }
      return bytes;
    }
    if (encoding === "utf-16le") {
      const buffer = new ArrayBuffer(text.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < text.length; i++) {
        view.setUint16(i * 2, text.charCodeAt(i), true);
      }
      return new Uint8Array(buffer);
    }
    if (encoding === "utf-16be") {
      const buffer = new ArrayBuffer(text.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < text.length; i++) {
        view.setUint16(i * 2, text.charCodeAt(i), false);
      }
      return new Uint8Array(buffer);
    }
    if (encoding === "hex") {
      const clean = text.replace(/[^0-9a-fA-F]/g, "");
      if (clean.length % 2 !== 0 && decodeStrict) {
        throw new Error("Hexadecimal string length must be even in strict mode.");
      }
      const len = Math.floor(clean.length / 2);
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
      }
      return bytes;
    }
    if (encoding === "binary") {
      const clean = text.replace(/[^01]/g, "");
      if (clean.length % 8 !== 0 && decodeStrict) {
        throw new Error("Binary stream bits must be multiples of 8 in strict mode.");
      }
      const len = Math.floor(clean.length / 8);
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = parseInt(clean.slice(i * 8, i * 8 + 8), 2);
      }
      return bytes;
    }
    return new TextEncoder().encode(text);
  }, [decodeStrict]);

  // Convert bytes back to string based on encoding
  const decodeBytesToText = useCallback((bytes, encoding) => {
    if (encoding === "utf-8") {
      try {
        return new TextDecoder("utf-8", { fatal: decodeStrict }).decode(bytes);
      } catch (e) {
        throw new Error("Failed to decode byte array as valid UTF-8.");
      }
    }
    if (encoding === "ascii") {
      let result = "";
      for (let i = 0; i < bytes.length; i++) {
        const val = bytes[i];
        if (val > 127 && decodeStrict) {
          throw new Error(`Byte value 0x${val.toString(16)} is invalid in 7-bit ASCII.`);
        }
        result += String.fromCharCode(val & 127);
      }
      return result;
    }
    if (encoding === "utf-16le") {
      if (bytes.length % 2 !== 0) {
        if (decodeStrict) throw new Error("Invalid odd-numbered byte array size for UTF-16 decoding.");
      }
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      let result = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        result += String.fromCharCode(view.getUint16(i, true));
      }
      return result;
    }
    if (encoding === "utf-16be") {
      if (bytes.length % 2 !== 0) {
        if (decodeStrict) throw new Error("Invalid odd-numbered byte array size for UTF-16 decoding.");
      }
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      let result = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        result += String.fromCharCode(view.getUint16(i, false));
      }
      return result;
    }
    if (encoding === "hex") {
      return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join(" ");
    }
    if (encoding === "binary") {
      return Array.from(bytes).map(b => b.toString(2).padStart(8, "0")).join(" ");
    }
    return new TextDecoder().decode(bytes);
  }, [decodeStrict]);

  // Compute character distribution freq
  const computeFrequency = useCallback((base64String, activeAlphabet) => {
    if (!base64String) {
      setCharFrequency({});
      return;
    }
    const freq = {};
    const noWhitespace = base64String.replace(/\s+/g, "").replace(/=/g, "");
    for (let i = 0; i < noWhitespace.length; i++) {
      const char = noWhitespace[i];
      if (activeAlphabet.includes(char)) {
        freq[char] = (freq[char] || 0) + 1;
      }
    }
    setCharFrequency(freq);
  }, []);

  // Main processing pipeline
  const processInput = useCallback(() => {
    setErrorMsg("");
    const activeAlphabet = getAlphabet();

    if (variant === "custom" && customAlphabet.length !== 64) {
      setErrorMsg("Please supply a valid 64-character custom alphabet.");
      return;
    }

    try {
      if (mode === "encode") {
        if (inputType === "text") {
          if (!textInput) {
            setTextOutput("");
            setCharFrequency({});
            return;
          }
          const bytes = encodeTextToBytes(textInput, textEncoding);
          let rawB64 = bytesToBase64(bytes, activeAlphabet, usePadding);
          let finalB64 = wrapString(rawB64, wrapLength, lineBreakStyle);
          setTextOutput(finalB64);
          computeFrequency(finalB64, activeAlphabet);

          if (autoCopy) {
            navigator.clipboard.writeText(finalB64);
          }
        } else {
          // File input encoding is handled asynchronously in the file input listener
        }
      } else {
        // Mode is DECODE
        if (inputType === "text") {
          if (!textInput) {
            setTextOutput("");
            setFileOutputMetadata(null);
            setFileOutputBlobUrl("");
            setCharFrequency({});
            return;
          }

          // Compute frequency on input string for stats
          computeFrequency(textInput, activeAlphabet);

          // Decode
          const bytes = base64ToBytes(textInput, activeAlphabet, decodeStrict);

          // Sniff file preview properties
          const fileSniff = sniffMimeType(bytes);

          // Determine if text-compatible or media-compatible
          // If the bytes contain PNG, PDF, or if the user select specialized output, display preview metadata
          const isStandardText = textEncoding === "utf-8" || textEncoding === "ascii" || textEncoding === "utf-16le" || textEncoding === "utf-16be";

          if (fileSniff.type === "Image" || fileSniff.type === "SVG Vector Image" || fileSniff.type === "PDF Document") {
            const blob = new Blob([bytes], { type: fileSniff.mime });
            const url = URL.createObjectURL(blob);

            setFileOutputBlobUrl(prev => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
            setFileOutputMetadata({
              name: `decoded_file.${fileSniff.ext}`,
              size: bytes.length,
              mime: fileSniff.mime,
              type: fileSniff.type,
              ext: fileSniff.ext,
              bytes: bytes
            });
          } else {
            setFileOutputMetadata(null);
            setFileOutputBlobUrl("");
          }

          // Display decoded content as text, hex, or binary
          const stringOutput = decodeBytesToText(bytes, textEncoding);
          setTextOutput(stringOutput);

          if (autoCopy) {
            navigator.clipboard.writeText(stringOutput);
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred during processing.");
      setTextOutput("");
      setFileOutputMetadata(null);
      setFileOutputBlobUrl("");
    }
  }, [
    mode,
    inputType,
    textInput,
    variant,
    customAlphabet,
    usePadding,
    wrapLength,
    lineBreakStyle,
    textEncoding,
    decodeStrict,
    autoCopy,
    getAlphabet,
    encodeTextToBytes,
    decodeBytesToText,
    computeFrequency
  ]);

  // Trigger processing on state changes
  useEffect(() => {
    processInput();
  }, [processInput]);

  // Handle file select for Encoding
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileInput(file);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target.result;
        const bytes = new Uint8Array(arrayBuffer);
        const activeAlphabet = getAlphabet();
        let rawB64 = bytesToBase64(bytes, activeAlphabet, usePadding);

        if (isDataUriOption) {
          rawB64 = `data:${file.type || "application/octet-stream"};base64,${rawB64}`;
        }

        const finalB64 = wrapString(rawB64, wrapLength, lineBreakStyle);
        setFileOutputBase64(finalB64);
        computeFrequency(finalB64, activeAlphabet);
      } catch (err) {
        setErrorMsg("Failed to encode uploaded file to Base64.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        handleFileSelect({ target: { files: e.dataTransfer.files } });
      }
    }
  };

  // Helper actions
  const handleCopy = () => {
    const textToCopy = mode === "encode" ? (inputType === "text" ? textOutput : fileOutputBase64) : textOutput;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setTextInput("");
    setTextOutput("");
    setFileInput(null);
    setFileOutputBase64("");
    setFileOutputMetadata(null);
    setFileOutputBlobUrl("");
    setCharFrequency({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrorMsg("");
  };

  const handleSwap = () => {
    if (inputType === "text" && textOutput && !errorMsg) {
      const nextInput = textOutput;
      setMode(prev => (prev === "encode" ? "decode" : "encode"));
      setTextInput(nextInput);
    }
  };

  const handleDownloadFile = () => {
    if (mode === "encode") {
      const txt = inputType === "text" ? textOutput : fileOutputBase64;
      if (!txt) return;
      const blob = new Blob([txt], { type: "text/plain" });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = "encoded_base64.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // Decode
      if (fileOutputMetadata && fileOutputMetadata.bytes) {
        const blob = new Blob([fileOutputMetadata.bytes], { type: fileOutputMetadata.mime });
        const element = document.createElement("a");
        element.href = URL.createObjectURL(blob);
        element.download = fileOutputMetadata.name;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else if (textOutput) {
        const blob = new Blob([textOutput], { type: "text/plain" });
        const element = document.createElement("a");
        element.href = URL.createObjectURL(blob);
        element.download = "decoded_text.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    }
  };

  // Load sample example triggers
  const handleLoadExample = (loadableValue) => {
    setMode("decode");
    setInputType("text");
    setTextInput(loadableValue);
  };

  // Calculate size properties
  const getInputSize = () => {
    if (inputType === "text") {
      return textInput.length; // bytes roughly in UTF8
    }
    return fileInput ? fileInput.size : 0;
  };

  const getOutputSize = () => {
    if (mode === "encode") {
      return inputType === "text" ? textOutput.length : fileOutputBase64.length;
    }
    return textOutput.length;
  };

  return (
    <ToolPageShell className="px-4 py-8">
      {/* ── Outer container with modern glassmorphism ── */}
      <div className="relative w-full max-w-7xl mx-auto flex flex-col gap-6 selection:bg-brandColor/20 text-gray-800 dark:text-gray-200">

        {/* Main Title Banner */}
        <div className="flex flex-col items-center text-center gap-2 md:gap-3 py-6 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brandColor/10 dark:bg-brandColor/20 border border-brandColor/20 hover:scale-105 transition duration-200 shadow-2xs cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-brandColor animate-pulse" />
            <span className="text-[12px] md:text-[14px] font-bold text-brandColor uppercase tracking-wider">Premium Encoding Hub</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-brandColor to-purple-600 dark:to-purple-400">
            Base64 Nexus
          </h1>
          <p className="max-w-2xl text-[14px] md:text-[16px] text-gray-500 dark:text-gray-400 px-4 leading-relaxed font-medium">
            Encode and decode plain text, binary streams, custom alphabets, and files in real-time. Instantly preview media vectors and browse code examples.
          </p>
        </div>

        {/* ── Main Control Panel Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Column 1 & 2: Main Tool Interface (Grid-col-2 on large) */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Nav tabs for Mode and Input Type */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-2 bg-gray-50/80 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-2xl shadow-sm backdrop-blur-md">

              {/* Encode/Decode Tab Triggers */}
              <div className="flex gap-1.5 p-1 bg-gray-200/50 dark:bg-gray-900/60 rounded-xl">
                <button
                  onClick={() => {
                    setMode("encode");
                    handleClear();
                  }}
                  className={cn(
                    "flex-1 sm:flex-initial px-5 py-2 text-[12px] md:text-[14px] font-semibold rounded-lg transition-all duration-200 cursor-pointer",
                    mode === "encode"
                      ? "bg-brandColor text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-300/40 dark:hover:bg-gray-800/40"
                  )}
                >
                  <Lock className="w-3.5 h-3.5 inline mr-1.5" />
                  Encode
                </button>
                <button
                  onClick={() => {
                    setMode("decode");
                    handleClear();
                  }}
                  className={cn(
                    "flex-1 sm:flex-initial px-5 py-2 text-[12px] md:text-[14px] font-semibold rounded-lg transition-all duration-200 cursor-pointer",
                    mode === "decode"
                      ? "bg-brandColor text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-300/40 dark:hover:bg-gray-800/40"
                  )}
                >
                  <Unlock className="w-3.5 h-3.5 inline mr-1.5" />
                  Decode
                </button>
              </div>

              {/* Text/File Input Triggers */}
              <div className="flex gap-1.5 p-1 bg-gray-200/50 dark:bg-gray-900/60 rounded-xl">
                <button
                  onClick={() => {
                    setInputType("text");
                    handleClear();
                  }}
                  className={cn(
                    "flex-1 sm:flex-initial px-4 py-2 text-[12px] md:text-[14px] font-semibold rounded-lg transition-all duration-200 cursor-pointer",
                    inputType === "text"
                      ? "bg-brandColor text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-300/40 dark:hover:bg-gray-800/40"
                  )}
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                  Plain Text
                </button>
                <button
                  onClick={() => {
                    setInputType("file");
                    handleClear();
                  }}
                  className={cn(
                    "flex-1 sm:flex-initial px-4 py-2 text-[12px] md:text-[14px] font-semibold rounded-lg transition-all duration-200 cursor-pointer",
                    inputType === "file"
                      ? "bg-brandColor text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-300/40 dark:hover:bg-gray-800/40"
                  )}
                >
                  <FileCode className="w-3.5 h-3.5 inline mr-1.5" />
                  File Upload
                </button>
              </div>
            </div>

            {/* Input card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs flex flex-col gap-3 relative transition-all duration-300 hover:shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[12px] md:text-[14px] font-bold text-gray-400 uppercase tracking-wider">
                  Input ({inputType === "text" ? "Characters" : "Binary File"})
                </span>

                {inputType === "text" && (
                  <button
                    onClick={handleClear}
                    title="Clear content"
                    className="p-2 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition duration-150 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {inputType === "text" ? (
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={
                    mode === "encode"
                      ? "Type or paste standard text here for Base64 encoding..."
                      : "Paste encoded Base64 string here (with or without data URI headers) to decode..."
                  }
                  className="w-full h-48 md:h-56 bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-[13px] md:text-[15px] font-mono leading-relaxed placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-brandColor/50 focus:border-brandColor transition duration-200 resize-none text-gray-800 dark:text-gray-200"
                />
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 md:h-56 bg-gray-50/30 dark:bg-gray-950/20 border-2 border-dashed border-gray-300 dark:border-gray-800 hover:border-brandColor dark:hover:border-brandColor/70 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 cursor-pointer transition duration-200 group text-center"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="p-3 bg-brandColor/10 rounded-2xl group-hover:scale-110 transition duration-200">
                    <Upload className="w-6 h-6 text-brandColor" />
                  </div>
                  <div>
                    <p className="text-[14px] md:text-[16px] font-semibold text-gray-700 dark:text-gray-300">
                      {fileInput ? fileInput.name : "Select or drag & drop a file"}
                    </p>
                    <p className="text-[12px] md:text-[14px] text-gray-400 mt-1">
                      {fileInput ? `${(fileInput.size / 1024).toFixed(2)} KB` : "Supports image, PDF, zip, text or audio binaries up to 10MB"}
                    </p>
                  </div>
                </div>
              )}

              {/* Data URI wrapper settings for file uploading in Encode mode */}
              {inputType === "file" && mode === "encode" && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950/30 border border-gray-200/50 dark:border-gray-800/50 rounded-xl mt-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300">Data URI Wrap</span>
                    <span className="text-[12px] text-gray-400">Prefix outputs with mime-type headers for HTML use</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDataUriOption}
                      onChange={(e) => {
                        setIsDataUriOption(e.target.checked);
                        // Re-trigger encoding if file loaded
                        if (fileInput) {
                          handleFileSelect({ target: { files: [fileInput] } });
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brandColor" />
                  </label>
                </div>
              )}
            </div>

            {/* Middle Action Bar */}
            {inputType === "text" && (
              <div className="flex justify-center -my-2.5 z-10">
                <button
                  onClick={handleSwap}
                  disabled={!textOutput}
                  title="Swap input and output"
                  className={cn(
                    "p-3 rounded-full border shadow-md bg-white dark:bg-gray-900 transition duration-300 cursor-pointer active:scale-95 flex items-center justify-center",
                    textOutput
                      ? "border-brandColor/30 hover:border-brandColor text-brandColor"
                      : "border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed"
                  )}
                >
                  <ArrowLeftRight className="w-4 h-4 rotate-90 lg:rotate-0" />
                </button>
              </div>
            )}

            {/* Output card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs flex flex-col gap-3 relative transition-all duration-300 hover:shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[12px] md:text-[14px] font-bold text-gray-400 uppercase tracking-wider">
                  Output ({mode === "encode" ? "Base64 String" : "Decoded Text"})
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={mode === "encode" ? (inputType === "text" ? !textOutput : !fileOutputBase64) : !textOutput}
                    className="p-2 rounded-xl text-gray-400 hover:bg-brandColor/10 hover:text-brandColor transition duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Copy output to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleDownloadFile}
                    disabled={mode === "encode" ? (inputType === "text" ? !textOutput : !fileOutputBase64) : (fileOutputMetadata ? !fileOutputMetadata.bytes : !textOutput)}
                    className="p-2 rounded-xl text-gray-400 hover:bg-brandColor/10 hover:text-brandColor transition duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Download output file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[12px] md:text-[14px] font-semibold animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Output textarea display */}
              {inputType === "text" ? (
                <textarea
                  readOnly
                  value={textOutput}
                  placeholder="Processed output will display here automatically..."
                  className="w-full h-48 md:h-56 bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-[13px] md:text-[15px] font-mono leading-relaxed placeholder:text-gray-400 focus:outline-hidden resize-none text-gray-800 dark:text-gray-200"
                />
              ) : (
                <textarea
                  readOnly
                  value={mode === "encode" ? fileOutputBase64 : textOutput}
                  placeholder="Encoded/Decoded file data will display here as Base64 string..."
                  className="w-full h-48 md:h-56 bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-[13px] md:text-[15px] font-mono leading-relaxed placeholder:text-gray-400 focus:outline-hidden resize-none text-gray-800 dark:text-gray-200"
                />
              )}

              {/* Real-time file Sniff & Render Previews */}
              {mode === "decode" && fileOutputMetadata && (
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-850 rounded-2xl flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-brandColor/10 rounded-xl">
                        {fileOutputMetadata.type === "Image" ? (
                          <FileImage className="w-5 h-5 text-brandColor" />
                        ) : fileOutputMetadata.type === "PDF Document" ? (
                          <FileCode className="w-5 h-5 text-brandColor" />
                        ) : (
                          <FileText className="w-5 h-5 text-brandColor" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] md:text-[14px] font-bold text-gray-800 dark:text-gray-200">
                          {fileOutputMetadata.name}
                        </span>
                        <span className="text-[12px] text-gray-400">
                          {fileOutputMetadata.type} • {(fileOutputMetadata.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadFile}
                      className="px-3.5 py-1.5 bg-brandColor text-white text-[12px] md:text-[14px] font-semibold rounded-xl hover:bg-brandColorHover transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save File
                    </button>
                  </div>

                  {/* Render Image Previews */}
                  {fileOutputMetadata.type === "Image" && fileOutputBlobUrl && (
                    <div className="flex justify-center bg-gray-100 dark:bg-gray-950/80 rounded-xl p-4 max-h-64 overflow-auto border border-gray-200/50 dark:border-gray-850/50">
                      <img
                        src={fileOutputBlobUrl}
                        alt="Base64 Decoded Preview"
                        className="max-h-56 object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  {/* Render SVG Previews */}
                  {fileOutputMetadata.type === "SVG Vector Image" && fileOutputBlobUrl && (
                    <div className="flex justify-center bg-white dark:bg-gray-950/80 rounded-xl p-4 max-h-64 overflow-auto border border-gray-200/50 dark:border-gray-850/50">
                      <img
                        src={fileOutputBlobUrl}
                        alt="Base64 Decoded SVG Preview"
                        className="max-h-56 w-auto object-contain rounded-lg"
                      />
                    </div>
                  )}

                  {/* PDF Notification */}
                  {fileOutputMetadata.type === "PDF Document" && (
                    <div className="p-3.5 bg-brandColor/5 rounded-xl border border-brandColor/15 flex items-center gap-2">
                      <Info className="w-4 h-4 text-brandColor shrink-0" />
                      <span className="text-[12px] text-gray-600 dark:text-gray-400 leading-normal">
                        Detected PDF Document binary. You can download and save it on your system by clicking the Save button.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Advanced Options & Interactive Stats Dashboard */}
          <div className="flex flex-col gap-5">

            {/* Quick configurations & variants card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
              <h2 className="text-[14px] md:text-[16px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Settings className="w-4 h-4 text-brandColor" />
                Encoding Scheme Settings
              </h2>

              {/* Variant selection */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="variant-select" className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300">
                  Base64 Variant
                </label>
                <select
                  id="variant-select"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-[12px] md:text-[14px] focus:ring-2 focus:ring-brandColor/50 focus:outline-hidden"
                >
                  <option value="standard">Standard Base64 (RFC 4648)</option>
                  <option value="urlsafe">URL-Safe Base64 (RFC 4648 §5)</option>
                  <option value="custom">Custom Character Alphabet</option>
                </select>
              </div>

              {/* Custom Alphabet Config */}
              {variant === "custom" && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label htmlFor="custom-alphabet-input" className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300">
                    Custom 64-char Alphabet
                  </label>
                  <input
                    id="custom-alphabet-input"
                    type="text"
                    value={customAlphabet}
                    onChange={(e) => handleCustomAlphabetChange(e.target.value)}
                    placeholder="Enter 64 unique characters..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-[12px] md:text-[14px] font-mono focus:ring-2 focus:ring-brandColor/50 focus:outline-hidden"
                  />
                  {customAlphabetError ? (
                    <span className="text-[12px] text-red-500 font-semibold leading-normal">
                      {customAlphabetError}
                    </span>
                  ) : (
                    <span className="text-[12px] text-emerald-500 font-semibold leading-normal flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Valid custom alphabet format
                    </span>
                  )}
                </div>
              )}

              {/* Padding character toggle */}
              <div className="flex items-center justify-between py-1.5 border-t border-gray-50 dark:border-gray-800/40">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300">Include Padding (=)</span>
                  <span className="text-[12px] text-gray-400">Append padding tokens to match 4-char groups</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={usePadding}
                    onChange={(e) => setUsePadding(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brandColor" />
                </label>
              </div>

              {/* Toggle advanced configurations */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between text-left text-[12px] md:text-[14px] font-bold text-brandColor py-2 border-t border-gray-50 dark:border-gray-800/40 cursor-pointer"
              >
                <span>{showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}</span>
                <ChevronDown className={cn("w-4 h-4 transition duration-200", showAdvanced && "rotate-180")} />
              </button>

              {showAdvanced && (
                <div className="flex flex-col gap-4 pt-1 animate-fadeIn border-t border-gray-50 dark:border-gray-800/30">

                  {/* Text character encoding selection */}
                  {inputType === "text" && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="encoding-select" className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300">
                        {mode === "encode" ? "Input Text Format / Encoding" : "Output Text Format / Encoding"}
                      </label>
                      <select
                        id="encoding-select"
                        value={textEncoding}
                        onChange={(e) => setTextEncoding(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-[12px] md:text-[14px] focus:ring-2 focus:ring-brandColor/50 focus:outline-hidden"
                      >
                        <option value="utf-8">UTF-8 Text String</option>
                        <option value="ascii">7-bit ASCII Plaintext</option>
                        <option value="utf-16le">UTF-16 Little Endian</option>
                        <option value="utf-16be">UTF-16 Big Endian</option>
                        <option value="hex">Hexadecimal Stream</option>
                        <option value="binary">Binary Stream (0s & 1s)</option>
                      </select>
                    </div>
                  )}

                  {/* Line Wrapping dropdown */}
                  {mode === "encode" && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="wrap-select" className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300">
                        Line Wrapping
                      </label>
                      <select
                        id="wrap-select"
                        value={wrapLength}
                        onChange={(e) => setWrapLength(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-[12px] md:text-[14px] focus:ring-2 focus:ring-brandColor/50 focus:outline-hidden"
                      >
                        <option value={0}>No Line Wrapping (Unlimited)</option>
                        <option value={64}>64 characters (Standard)</option>
                        <option value={76}>76 characters (MIME standard)</option>
                      </select>
                    </div>
                  )}

                  {/* Line Break Style Selector */}
                  {mode === "encode" && wrapLength > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="linebreak-select" className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300">
                        Line Break Format
                      </label>
                      <select
                        id="linebreak-select"
                        value={lineBreakStyle}
                        onChange={(e) => setLineBreakStyle(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-[12px] md:text-[14px] focus:ring-2 focus:ring-brandColor/50 focus:outline-hidden"
                      >
                        <option value="\n">LF (\\n) - Unix/macOS</option>
                        <option value="\r\n">CRLF (\\r\\n) - Windows MIME</option>
                      </select>
                    </div>
                  )}

                  {/* Strict decoding toggle */}
                  {mode === "decode" && (
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800/40">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300">Strict Validation</span>
                        <span className="text-[12px] text-gray-400">Throw errors on invalid characters or length</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={decodeStrict}
                          onChange={(e) => setDecodeStrict(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brandColor" />
                      </label>
                    </div>
                  )}

                  {/* Auto-copy to Clipboard toggle */}
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300">Auto-Copy Output</span>
                      <span className="text-[12px] text-gray-400">Instantly copy result to clipboard on change</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoCopy}
                        onChange={(e) => setAutoCopy(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brandColor" />
                    </label>
                  </div>

                </div>
              )}
            </div>

            {/* Real-time stats card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
              <h2 className="text-[14px] md:text-[16px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Sparkles className="w-4 h-4 text-brandColor" />
                Data Statistics Dashboard
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-950/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col gap-1 text-center">
                  <span className="text-[12px] text-gray-400 font-medium">Input Size</span>
                  <span className="text-[16px] md:text-[18px] font-black text-gray-800 dark:text-gray-200">
                    {getInputSize()} B
                  </span>
                </div>
                <div className="p-3.5 bg-gray-50 dark:bg-gray-950/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col gap-1 text-center">
                  <span className="text-[12px] text-gray-400 font-medium">Output Size</span>
                  <span className="text-[16px] md:text-[18px] font-black text-gray-800 dark:text-gray-200">
                    {getOutputSize()} B
                  </span>
                </div>
              </div>

              {/* Compression overhead metrics */}
              {getInputSize() > 0 && getOutputSize() > 0 && (
                <div className="p-3.5 bg-brandColor/5 rounded-2xl border border-brandColor/15 flex flex-col gap-1 animate-fadeIn">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-500 font-bold">Data Size Overhead Ratio</span>
                    <span className={cn(
                      "font-black",
                      mode === "encode" ? "text-purple-500" : "text-green-500"
                    )}>
                      {mode === "encode" ? "+33.3% Expansion" : "-25.0% Compression"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div
                      className="bg-brandColor h-2 rounded-full transition-all duration-300"
                      style={{ width: mode === "encode" ? "100%" : "75%" }}
                    />
                  </div>
                  <span className="text-[12px] text-gray-400 mt-1">
                    {mode === "encode"
                      ? "Base64 encodes every 3 binary bytes into 4 text characters, resulting in a 33% metadata overhead."
                      : "Base64 decoding restores data back to raw binary bytes, compacting the text stream by 25%."
                    }
                  </span>
                </div>
              )}

              {/* ── Dynamic Alphabet Character Frequency Density Grid ── */}
              <div>
                <span className="text-[12px] md:text-[14px] font-bold text-gray-700 dark:text-gray-300 block mb-2">
                  Base64 Alphabet Density Grid
                </span>
                <p className="text-[12px] text-gray-400 mb-3">
                  Visual mapping of alphabet frequencies in the Base64 stream. Darker nodes show higher counts.
                </p>

                <div className="grid grid-cols-8 gap-1.5 p-3.5 bg-gray-50 dark:bg-gray-950/40 rounded-2xl border border-gray-150 dark:border-gray-800/80">
                  {getAlphabet().split("").map((char) => {
                    const count = charFrequency[char] || 0;
                    // Determine color density levels
                    let densityClass = "bg-gray-200/50 dark:bg-gray-800/40 border-transparent text-gray-400 dark:text-gray-600";
                    if (count > 0) {
                      if (count < 3) densityClass = "bg-brandColor/15 text-brandColor border-brandColor/20";
                      else if (count < 8) densityClass = "bg-brandColor/35 text-brandColor-dark font-black border-brandColor/40";
                      else densityClass = "bg-brandColor text-white font-black border-brandColor shadow-xs";
                    }

                    return (
                      <div
                        key={char}
                        title={`Character: '${char}' | Count: ${count}`}
                        className={cn(
                          "aspect-square flex items-center justify-center text-[12px] font-mono rounded-md border text-center transition duration-200 cursor-pointer select-none",
                          densityClass
                        )}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Examples & Use Cases Section (New User Requirement) ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs mt-2">
          <div className="flex flex-col gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <h2 className="text-[16px] md:text-[18px] font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brandColor" />
              Base64 Examples & Common Use Cases
            </h2>
            <p className="text-[12px] md:text-[14px] text-gray-400">
              Interactive examples demonstrating how Base64 acts as a standard backbone for embedding resources, authorization, and network protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Left selector sidebar */}
            <div className="flex flex-col gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveExampleTab(ex.id)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-xl text-[12px] md:text-[14px] font-semibold transition cursor-pointer",
                    activeExampleTab === ex.id
                      ? "bg-brandColor/15 border-l-4 border-brandColor text-brandColor"
                      : "bg-gray-50/50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {ex.title}
                </button>
              ))}
            </div>

            {/* Right snippet panel */}
            <div className="md:col-span-3 bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-850 rounded-2xl p-4 flex flex-col justify-between gap-4">
              {EXAMPLES.map((ex) => {
                if (ex.id !== activeExampleTab) return null;
                return (
                  <div key={ex.id} className="flex flex-col gap-3 h-full justify-between animate-fadeIn">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[14px] md:text-[16px] font-bold text-gray-800 dark:text-gray-200">
                        {ex.title}
                      </h3>
                      <p className="text-[12px] md:text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                        {ex.desc}
                      </p>
                    </div>

                    <div className="relative">
                      <pre className="bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl p-3.5 text-[12px] md:text-[14px] font-mono text-gray-800 dark:text-gray-300 overflow-x-auto leading-normal">
                        <code>{ex.code}</code>
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ex.code);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="absolute right-3 top-3 p-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:text-brandColor transition cursor-pointer text-gray-400 shadow-2xs"
                        title="Copy code snippet"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-start">
                      <button
                        onClick={() => handleLoadExample(ex.loadable)}
                        className="px-4 py-2 bg-brandColor/10 dark:bg-brandColor/20 border border-brandColor/25 hover:bg-brandColor hover:text-white text-[12px] md:text-[14px] text-brandColor font-bold rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {ex.loadText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-3xl p-5 shadow-xs mt-2 mb-4">
          <h2 className="text-[16px] md:text-[18px] font-black text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <Info className="w-5 h-5 text-brandColor" />
            Base64 Encoding - Frequently Asked Questions
          </h2>

          <div className="flex flex-col gap-3">
            {[
              {
                q: "What is Base64 encoding?",
                a: "Base64 is a binary-to-text encoding scheme that translates raw bytes into a sequence of 64 standard ASCII characters (A-Z, a-z, 0-9, and two symbols like + and /). It is designed to represent binary data in text-only transmission channels, such as e-mail protocols or JSON APIs."
              },
              {
                q: "Why is there a 33% size overhead when encoding?",
                a: "Base64 represents binary data using 6 bits per character instead of the usual 8 bits in raw bytes. Because 3 bytes (24 bits) map to 4 Base64 characters (24 bits), the output string length is expanded by 4/3, resulting in a 33.3% size overhead compared to the original raw binary data."
              },
              {
                q: "What is the difference between standard and URL-Safe Base64?",
                a: "Standard Base64 contains character codes '+' and '/' which have reserved roles in URL structures. URL-safe Base64 substitutes '+' with '-' and '/' with '_', making the output safe to include in URL search queries and REST parameters. Additionally, padding characters ('=') are often omitted in URL-safe base64."
              },
              {
                q: "Can custom alphabets be used?",
                a: "Yes! Custom alphabets let developers map binary bytes into their own sequence of 64 characters. This is often used as a lightweight cipher, a custom obfuscation scheme, or to adjust symbol usage for specific parser constraints."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-150 dark:border-gray-800/70 rounded-2xl overflow-hidden bg-gray-50/30 dark:bg-gray-950/10"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 font-bold text-gray-800 dark:text-gray-200 hover:text-brandColor transition-colors flex justify-between items-center cursor-pointer text-[13px] md:text-[15px]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-all", openFaqIndex === idx && "rotate-180")} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-4 text-[12px] md:text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium border-t border-gray-150 dark:border-gray-800/40 pt-3.5 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </ToolPageShell>
  );
}
