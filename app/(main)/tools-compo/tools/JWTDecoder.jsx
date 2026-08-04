"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  Settings,
  Play,
  Trash2,
  Copy,
  Check,
  Info,
  Calendar,
  Sparkles,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// ─── Constants & Claims Explanations ──────────────────────────────────────────
const CLAIMS_INFO = {
  iss: { title: "Issuer (iss)", desc: "Identifies the principal that issued the JWT." },
  sub: { title: "Subject (sub)", desc: "Identifies the principal that is the subject of the JWT (e.g., user ID)." },
  aud: { title: "Audience (aud)", desc: "Identifies the recipients that the JWT is intended for." },
  exp: { title: "Expiration Time (exp)", desc: "Identifies the expiration time on or after which the JWT must not be accepted." },
  nbf: { title: "Not Before (nbf)", desc: "Identifies the time before which the JWT must not be accepted." },
  iat: { title: "Issued At (iat)", desc: "Identifies the time at which the JWT was issued." },
  jti: { title: "JWT ID (jti)", desc: "Provides a unique identifier for the JWT." },
  email: { title: "Email (email)", desc: "The user's email address." },
  email_verified: { title: "Email Verified", desc: "True if the email address is verified, false otherwise." },
  name: { title: "Name (name)", desc: "The user's full name." },
  given_name: { title: "Given Name", desc: "The user's first name." },
  family_name: { title: "Family Name", desc: "The user's last name." },
  preferred_username: { title: "Preferred Username", desc: "The username preferred by the user." },
  roles: { title: "Roles (roles)", desc: "The list of security roles assigned to the user." },
  role: { title: "Role (role)", desc: "The security role assigned to the user." },
  scope: { title: "Scope (scope)", desc: "The space-separated list of scopes authorized for the token." },
  acr: { title: "Authentication Context Class Reference", desc: "Identifies the authentication context class reference." },
  auth_time: { title: "Authentication Time", desc: "Time when the user was authenticated." },
  nonce: { title: "Nonce", desc: "Value used to associate a client session with an ID Token, and to mitigate replay attacks." }
};

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTQ4MjcxIiwibmFtZSI6IkphbmUgRGV2ZWxvcGVyIiwiZW1haWwiOiJqYW5lQHRvb2xzdHJlay5jb20iLCJyb2xlIjoiTGVhZCBBcmNoaXRlY3QiLCJpYXQiOjE3ODU5MzEyMDAsImV4cCI6MTgxNzQ2NzIwMCwiaXNzIjoidG9vbHN0cmVrLWF1dGgifQ.vwT-BhvJL7KyANw8OpTwhUzH8LI7mdeMNYVfuhE6b3Q";

const SAMPLE_SECRET = "toolstrek-secret-key-2026";

// ─── Helper Functions ────────────────────────────────────────────────────────
function base64UrlDecode(str) {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch (e) {
    return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightJson(jsonObj, indent = 2) {
  const jsonStr = JSON.stringify(jsonObj, null, indent);
  if (!jsonStr) return "";
  
  const escaped = escapeHtml(jsonStr);
  return escaped.replace(
    /(&quot;(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\&quot;])*&quot;(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-600 dark:text-amber-400"; // numbers
      if (match.startsWith("&quot;")) {
        if (match.endsWith(":")) {
          cls = "text-purple-600 dark:text-purple-400 font-semibold"; // key
        } else {
          cls = "text-emerald-600 dark:text-emerald-400 font-mono"; // string value
        }
      } else if (/true|false/.test(match)) {
        cls = "text-blue-600 dark:text-blue-400 font-semibold";
      } else if (/null/.test(match)) {
        cls = "text-gray-500 dark:text-gray-500";
      }
      if (match.endsWith(":")) {
        return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

// Convert signature to hex format for presentation
function signatureToHex(sigB64Url) {
  try {
    let base64 = sigB64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const binary = atob(base64);
    const hexParts = [];
    for (let i = 0; i < Math.min(binary.length, 64); i++) {
      const hex = binary.charCodeAt(i).toString(16).padStart(2, "0");
      hexParts.push(hex.toUpperCase());
    }
    return hexParts.join(" ") + (binary.length > 64 ? " ..." : "");
  } catch (e) {
    return "Invalid signature format";
  }
}

// Helper to convert base64url to ArrayBuffer for Web Crypto API
function base64UrlToArrayBuffer(base64Url) {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes.buffer;
}

export default function JWTDecoder() {
  const [tokenInput, setTokenInput] = useState("");
  const [headerData, setHeaderData] = useState(null);
  const [payloadData, setPayloadData] = useState(null);
  const [signaturePart, setSignaturePart] = useState("");
  const [parseError, setParseError] = useState("");
  
  // Copy statuses
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  
  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enableCryptoVerify, setEnableCryptoVerify] = useState(false);
  const [secretKey, setSecretKey] = useState(SAMPLE_SECRET);
  const [cryptoAlg, setCryptoAlg] = useState("auto"); // "auto" | "HS256" | "HS384" | "HS512"
  const [jsonIndent, setJsonIndent] = useState(2);
  const [timeFormat, setTimeFormat] = useState("local"); // "local" | "utc" | "relative"
  const [colorTheme, setColorTheme] = useState("indigo"); // "indigo" | "emerald" | "rose"
  
  // Signature Verification Results
  const [signatureStatus, setSignatureStatus] = useState("unchecked"); // "unchecked" | "valid" | "invalid" | "unsupported"
  const [activeAlg, setActiveAlg] = useState("");

  // Parse JWT token on change
  useEffect(() => {
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setHeaderData(null);
      setPayloadData(null);
      setSignaturePart("");
      setParseError("");
      setSignatureStatus("unchecked");
      setActiveAlg("");
      return;
    }

    const parts = trimmed.split(".");
    if (parts.length !== 3) {
      setParseError("Invalid JWT: A standard JWT token must consist of exactly 3 parts separated by dots (.)");
      setHeaderData(null);
      setPayloadData(null);
      setSignaturePart("");
      setSignatureStatus("unchecked");
      setActiveAlg("");
      return;
    }

    try {
      // Decode Header
      let decodedHeader;
      try {
        decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      } catch (err) {
        throw new Error("Failed to parse token header: Header is not valid JSON.");
      }

      // Decode Payload
      let decodedPayload;
      try {
        decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
      } catch (err) {
        throw new Error("Failed to parse token payload: Payload is not valid JSON.");
      }

      setHeaderData(decodedHeader);
      setPayloadData(decodedPayload);
      setSignaturePart(parts[2]);
      setParseError("");
      
      const alg = decodedHeader?.alg || "";
      setActiveAlg(alg);
      
    } catch (error) {
      setParseError(error.message || "An error occurred while decoding the JWT.");
      setHeaderData(null);
      setPayloadData(null);
      setSignaturePart("");
      setSignatureStatus("unchecked");
      setActiveAlg("");
    }
  }, [tokenInput]);

  // Crytographic Signature Verification helper
  const verifySignature = useCallback(async () => {
    if (!tokenInput.trim() || !headerData || !payloadData) {
      setSignatureStatus("unchecked");
      return;
    }

    const parts = tokenInput.trim().split(".");
    if (parts.length !== 3) return;

    const alg = headerData?.alg || "";
    
    // Check if algorithm is none
    if (alg.toLowerCase() === "none") {
      setSignatureStatus("invalid");
      return;
    }

    // Determine verification algorithm
    let selectedAlg = cryptoAlg === "auto" ? alg : cryptoAlg;
    
    if (!selectedAlg || !selectedAlg.startsWith("HS")) {
      // Standard asymmetric verification isn't implemented in the quick check, or marked as unsupported
      setSignatureStatus("unsupported");
      return;
    }

    try {
      const hashName = selectedAlg === "HS384" ? "SHA-384" : selectedAlg === "HS512" ? "SHA-512" : "SHA-256";
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secretKey);
      
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: hashName } },
        false,
        ["verify"]
      );

      const headerAndPayloadBytes = encoder.encode(`${parts[0]}.${parts[1]}`);
      const signatureBytes = base64UrlToArrayBuffer(parts[2]);

      const isValid = await window.crypto.subtle.verify(
        "HMAC",
        cryptoKey,
        signatureBytes,
        headerAndPayloadBytes
      );

      setSignatureStatus(isValid ? "valid" : "invalid");
    } catch (e) {
      setSignatureStatus("invalid");
    }
  }, [tokenInput, headerData, payloadData, secretKey, cryptoAlg]);

  // Run signature verification when configurations or input changes
  useEffect(() => {
    if (enableCryptoVerify) {
      verifySignature();
    } else {
      setSignatureStatus("unchecked");
    }
  }, [enableCryptoVerify, verifySignature]);

  // Button actions
  const handleLoadSample = () => {
    setTokenInput(SAMPLE_TOKEN);
    setSecretKey(SAMPLE_SECRET);
    setEnableCryptoVerify(true);
    setParseError("");
  };

  const handleClear = () => {
    setTokenInput("");
    setHeaderData(null);
    setPayloadData(null);
    setSignaturePart("");
    setParseError("");
    setSignatureStatus("unchecked");
    setActiveAlg("");
  };

  const handleCopy = async (text, setter) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch (_) {}
  };

  // Convert claim time to selected representation
  const formatClaimValue = (key, val) => {
    if ((key === "exp" || key === "iat" || key === "nbf" || key === "auth_time") && typeof val === "number") {
      const date = new Date(val * 1000);
      if (isNaN(date.getTime())) return String(val);

      if (timeFormat === "utc") {
        return `${val} (${date.toUTCString()})`;
      } else if (timeFormat === "relative") {
        const diffMs = date.getTime() - Date.now();
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHr = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHr / 24);

        let relativeStr = "";
        if (Math.abs(diffSec) < 60) {
          relativeStr = diffSec >= 0 ? "in a few seconds" : "a few seconds ago";
        } else if (Math.abs(diffMin) < 60) {
          relativeStr = diffMin >= 0 ? `in ${diffMin} min` : `${Math.abs(diffMin)} min ago`;
        } else if (Math.abs(diffHr) < 24) {
          relativeStr = diffHr >= 0 ? `in ${diffHr} hr` : `${Math.abs(diffHr)} hr ago`;
        } else {
          relativeStr = diffDay >= 0 ? `in ${diffDay} days` : `${Math.abs(diffDay)} days ago`;
        }
        return `${val} (${relativeStr})`;
      } else {
        // default local date
        return `${val} (${date.toLocaleString()})`;
      }
    }
    
    if (typeof val === "boolean") {
      return val ? "true" : "false";
    }
    if (typeof val === "object") {
      return JSON.stringify(val);
    }
    return String(val);
  };

  // Check token expiration status for notifications
  const checkTokenExpiryStatus = () => {
    if (!payloadData || typeof payloadData.exp !== "number") return null;
    const expMs = payloadData.exp * 1000;
    const nowMs = Date.now();
    
    if (nowMs > expMs) {
      return { status: "expired", message: "Token has expired!" };
    } else if (expMs - nowMs < 10 * 60 * 1000) {
      // Expiring in less than 10 minutes
      return { status: "expiring", message: "Token is expiring in less than 10 minutes!" };
    }
    return { status: "active", message: "Token is active and valid." };
  };

  const expiryBadge = checkTokenExpiryStatus();

  // Dynamic Theme Styling configuration
  const themeColors = {
    indigo: {
      borderHeader: "border-indigo-400/40 dark:border-indigo-500/20",
      borderPayload: "border-cyan-400/40 dark:border-cyan-500/20",
      borderSignature: "border-rose-400/40 dark:border-rose-500/20",
      bgHeader: "bg-indigo-50/30 dark:bg-indigo-950/10",
      bgPayload: "bg-cyan-50/30 dark:bg-cyan-950/10",
      bgSignature: "bg-rose-50/30 dark:bg-rose-950/10",
      textHeader: "text-indigo-600 dark:text-indigo-400",
      textPayload: "text-cyan-600 dark:text-cyan-400",
      textSignature: "text-rose-600 dark:text-rose-400",
    },
    emerald: {
      borderHeader: "border-emerald-400/40 dark:border-emerald-500/20",
      borderPayload: "border-teal-400/40 dark:border-teal-500/20",
      borderSignature: "border-amber-400/40 dark:border-amber-500/20",
      bgHeader: "bg-emerald-50/30 dark:bg-emerald-950/10",
      bgPayload: "bg-teal-50/30 dark:bg-teal-950/10",
      bgSignature: "bg-amber-50/30 dark:bg-amber-950/10",
      textHeader: "text-emerald-600 dark:text-emerald-400",
      textPayload: "text-teal-600 dark:text-teal-400",
      textSignature: "text-amber-600 dark:text-amber-400",
    },
    rose: {
      borderHeader: "border-pink-400/40 dark:border-pink-500/20",
      borderPayload: "border-violet-400/40 dark:border-violet-500/20",
      borderSignature: "border-orange-400/40 dark:border-orange-500/20",
      bgHeader: "bg-pink-50/30 dark:bg-pink-950/10",
      bgPayload: "bg-violet-50/30 dark:bg-violet-950/10",
      bgSignature: "bg-orange-50/30 dark:bg-orange-950/10",
      textHeader: "text-pink-600 dark:text-pink-400",
      textPayload: "text-violet-600 dark:text-violet-400",
      textSignature: "text-orange-600 dark:text-orange-455",
    }
  }[colorTheme];

  return (
    <ToolPageShell>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="text-center mb-10 animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs md:text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
          <ShieldCheck size={14} />
          Developer & Security Utilities
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          JWT{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandColor to-indigo-500">
            Decoder & Debugger
          </span>
        </h1>
        <p className="mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Paste your JSON Web Token (JWT) to decode header and payload claims. 
          Perform secure, client-side cryptographic verification instantly.
        </p>
      </div>

      {/* ── Toolbar Options ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-2 px-4 py-2 bg-brandColor text-white dark:bg-brandColor dark:hover:bg-brandColorHover hover:bg-brandColorHover transition rounded-xl text-sm font-semibold cursor-pointer shadow-sm hover:shadow-md"
          >
            <Sparkles size={16} />
            Load Sample
          </button>
          
          <button
            onClick={handleClear}
            disabled={!tokenInput}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/20 dark:hover:bg-red-950/10 transition rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
            showAdvanced
              ? "bg-brandColor/10 border-brandColor text-brandColor"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-750 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-705"
          }`}
        >
          <Settings size={16} className={showAdvanced ? "rotate-45 transition duration-200" : "transition duration-200"} />
          Advanced Options
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* ── Advanced Options Panel ────────────────────────────────────────── */}
      {showAdvanced && (
        <div className="mb-6 bg-gray-55/60 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800/80 rounded-2xl p-5 shadow-xs animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Signature verification configurations */}
            <div className="flex flex-col gap-2">
              <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                Cryptographic Signature
              </span>
              <label className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCryptoVerify}
                  onChange={(e) => setEnableCryptoVerify(e.target.checked)}
                  className="w-4 h-4 text-brandColor rounded-sm focus:ring-brandColor border-gray-300 dark:border-gray-700 bg-transparent"
                />
                Enable HMAC Verification
              </label>
              
              {enableCryptoVerify && (
                <div className="mt-2 flex flex-col gap-2 animate-fadeIn">
                  <label htmlFor="secret-input" className="text-[12px] md:text-xs font-semibold text-gray-500">
                    HMAC Secret Key
                  </label>
                  <input
                    id="secret-input"
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter HMAC secret..."
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs md:text-sm font-mono focus:ring-2 focus:ring-brandColor focus:outline-hidden"
                  />
                  
                  <label htmlFor="alg-select" className="text-[12px] md:text-xs font-semibold text-gray-500 mt-1">
                    Verify Algorithm
                  </label>
                  <select
                    id="alg-select"
                    value={cryptoAlg}
                    onChange={(e) => setCryptoAlg(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs md:text-sm focus:ring-2 focus:ring-brandColor focus:outline-hidden"
                  >
                    <option value="auto">Auto-detect from Header</option>
                    <option value="HS256">Force HS256</option>
                    <option value="HS384">Force HS384</option>
                    <option value="HS512">Force HS512</option>
                  </select>
                </div>
              )}
            </div>

            {/* Formatting Spacing */}
            <div className="flex flex-col gap-2">
              <label htmlFor="json-indent-select" className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                JSON Formatting
              </label>
              <select
                id="json-indent-select"
                value={jsonIndent}
                onChange={(e) => setJsonIndent(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs md:text-sm focus:ring-2 focus:ring-brandColor focus:outline-hidden"
              >
                <option value={2}>2 Spaces Indent</option>
                <option value={4}>4 Spaces Indent</option>
              </select>

              <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mt-2">
                Color Claims Accent
              </span>
              <div className="flex gap-2">
                {["indigo", "emerald", "rose"].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setColorTheme(theme)}
                    className={`px-3 py-1 text-xs md:text-sm rounded-lg capitalize border ${
                      colorTheme === theme
                        ? "bg-brandColor/10 border-brandColor text-brandColor font-semibold"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Representation formatting */}
            <div className="flex flex-col gap-2">
              <label htmlFor="time-format-select" className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                Claim Timestamp Format
              </label>
              <select
                id="time-format-select"
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs md:text-sm focus:ring-2 focus:ring-brandColor focus:outline-hidden"
              >
                <option value="local">Local Time Zone</option>
                <option value="utc">UTC (+00:00)</option>
                <option value="relative">Relative Duration Countdown</option>
              </select>
              <p className="text-[12px] md:text-xs text-gray-500 dark:text-gray-400 leading-normal">
                Configures representation format for JWT standard time assertions (`exp`, `iat`, `nbf`).
              </p>
            </div>

            {/* Security Audit quick checks */}
            <div className="flex flex-col gap-2">
              <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                Security Assertions
              </span>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  {headerData?.alg?.toLowerCase() === "none" ? (
                    <span className="text-red-500 flex items-center gap-1.5 font-semibold">
                      <ShieldAlert size={14} /> Alg is 'none' (Vulnerable)
                    </span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={14} /> No 'none' algorithm bypass
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs md:text-sm">
                  {!signaturePart ? (
                    <span className="text-amber-500 flex items-center gap-1.5 font-medium">
                      <ShieldAlert size={14} /> Unsigned Token (No Signature)
                    </span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={14} /> Signature segment present
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs md:text-sm">
                  {payloadData && typeof payloadData.exp !== "number" ? (
                    <span className="text-amber-500 flex items-center gap-1.5 font-medium">
                      <ShieldAlert size={14} /> No 'exp' expiration claim
                    </span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={14} /> Expiration limit configured
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Main Workspace Panel ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-md transition relative overflow-hidden">
            {/* Design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brandColor/5 rounded-full blur-3xl" />
            
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-150 dark:border-gray-800">
              <label htmlFor="token-textarea" className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brandColor animate-pulse" />
                Encoded Token (Paste JWT)
              </label>
              
              {tokenInput && (
                <button
                  onClick={() => handleCopy(tokenInput, setCopiedToken)}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs md:text-sm text-brandColor hover:bg-brandColor/10 rounded-lg transition border-0 cursor-pointer"
                  title="Copy encoded token"
                >
                  {copiedToken ? (
                    <>
                      <Check size={14} className="text-green-500" />
                      <span className="text-green-500 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <textarea
              id="token-textarea"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste your base64-encoded JWT token here... e.g. eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.signature"
              rows={14}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-hidden focus:ring-2 focus:ring-brandColor text-xs md:text-sm font-mono tracking-wide leading-relaxed resize-y min-h-[250px]"
            />

            {/* Error notifications */}
            {parseError && (
              <div className="mt-4 flex items-start gap-2.5 p-3.5 text-xs md:text-sm text-red-700 dark:text-red-300 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 animate-fadeIn">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Struct indicator summary */}
            {!parseError && tokenInput && headerData && payloadData && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 animate-fadeIn">
                <span className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 block mb-2">
                  Token Metadata
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] md:text-xs text-gray-400 dark:text-gray-500">Algorithm</span>
                    <span className="text-xs md:text-sm font-mono font-bold text-gray-800 dark:text-gray-200">
                      {headerData.alg || "none"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] md:text-xs text-gray-400 dark:text-gray-500">Token Type</span>
                    <span className="text-xs md:text-sm font-mono font-bold text-gray-800 dark:text-gray-200">
                      {headerData.typ || "JWT"}
                    </span>
                  </div>
                  <div className="col-span-2 flex flex-col gap-0.5 border-t border-gray-150 dark:border-gray-800 pt-2 mt-1">
                    <span className="text-[12px] md:text-xs text-gray-400 dark:text-gray-500">Validity Clock</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {expiryBadge ? (
                        <>
                          {expiryBadge.status === "expired" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs md:text-sm font-semibold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
                              <ShieldAlert size={12} /> Expired
                            </span>
                          )}
                          {expiryBadge.status === "expiring" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs md:text-sm font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                              <Clock size={12} /> Expiring Soon
                            </span>
                          )}
                          {expiryBadge.status === "active" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs md:text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                              <ShieldCheck size={12} /> Active
                            </span>
                          )}
                          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                            {expiryBadge.message}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs md:text-sm text-gray-500">No expiration (exp) claim specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Output Visualization */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Card 1: HEADER */}
          <div className={`bg-white dark:bg-gray-900 rounded-2xl border ${themeColors.borderHeader} overflow-hidden shadow-sm transition`}>
            <div className={`flex justify-between items-center px-5 py-3.5 border-b ${themeColors.borderHeader} ${themeColors.bgHeader}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full bg-indigo-500`} />
                <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                  HEADER: ALGORITHM & TOKEN TYPE
                </span>
              </div>
              {headerData && (
                <button
                  onClick={() => handleCopy(JSON.stringify(headerData, null, jsonIndent), setCopiedHeader)}
                  className="flex items-center gap-1 text-xs md:text-sm font-semibold text-gray-500 hover:text-brandColor transition cursor-pointer"
                >
                  {copiedHeader ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copiedHeader ? "Copied" : "Copy JSON"}
                </button>
              )}
            </div>
            
            <div className="p-5">
              {headerData ? (
                <div>
                  <pre className="bg-gray-50 dark:bg-gray-950/80 rounded-xl p-4 overflow-x-auto text-xs md:text-sm font-mono border border-gray-150 dark:border-gray-800/80 max-h-[160px] scrollbar-thin">
                    <code dangerouslySetInnerHTML={{ __html: highlightJson(headerData, jsonIndent) }} />
                  </pre>
                  
                  {/* Explanations of header elements */}
                  <div className="mt-4 flex flex-col gap-2">
                    {Object.entries(headerData).map(([key, val]) => (
                      <div key={key} className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 dark:border-gray-850 pb-2 last:border-0 last:pb-0 text-xs md:text-sm">
                        <span className="font-semibold text-indigo-500 dark:text-indigo-400 font-mono">{key}</span>
                        <span className="text-gray-800 dark:text-gray-200 font-semibold">{String(val)}</span>
                        <span className="text-gray-500 dark:text-gray-400 w-full sm:w-auto text-[12px] md:text-xs">
                          {key === "alg" ? "Algorithm used for signing this token." : key === "typ" ? "Type of this cryptographic credential." : "Header claim property."}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs md:text-sm text-gray-400 dark:text-gray-500 leading-normal flex flex-col items-center justify-center gap-2">
                  <Lock size={20} className="text-gray-300 dark:text-gray-700" />
                  <span>No JWT loaded. Paste a token on the left or click 'Load Sample' to populate data.</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: PAYLOAD */}
          <div className={`bg-white dark:bg-gray-900 rounded-2xl border ${themeColors.borderPayload} overflow-hidden shadow-sm transition`}>
            <div className={`flex justify-between items-center px-5 py-3.5 border-b ${themeColors.borderPayload} ${themeColors.bgPayload}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full bg-cyan-500`} />
                <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                  PAYLOAD: DATA / CLAIMS
                </span>
              </div>
              {payloadData && (
                <button
                  onClick={() => handleCopy(JSON.stringify(payloadData, null, jsonIndent), setCopiedPayload)}
                  className="flex items-center gap-1 text-xs md:text-sm font-semibold text-gray-500 hover:text-brandColor transition cursor-pointer"
                >
                  {copiedPayload ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copiedPayload ? "Copied" : "Copy JSON"}
                </button>
              )}
            </div>
            
            <div className="p-5">
              {payloadData ? (
                <div>
                  <pre className="bg-gray-50 dark:bg-gray-950/80 rounded-xl p-4 overflow-x-auto text-xs md:text-sm font-mono border border-gray-150 dark:border-gray-800/80 max-h-[250px] scrollbar-thin">
                    <code dangerouslySetInnerHTML={{ __html: highlightJson(payloadData, jsonIndent) }} />
                  </pre>

                  {/* Claims explanations */}
                  <div className="mt-5 border-t border-gray-150 dark:border-gray-800 pt-4">
                    <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 block mb-3">
                      Claims Explanation Table
                    </span>
                    
                    <div className="flex flex-col gap-3">
                      {Object.entries(payloadData).map(([key, val]) => {
                        const info = CLAIMS_INFO[key] || { title: key, desc: "Custom claim field defined by token issuer." };
                        return (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 pb-3 border-b border-gray-100 dark:border-gray-850/60 last:border-0 last:pb-0 text-xs md:text-sm">
                            <div className="flex flex-col gap-0.5 max-w-sm">
                              <span className="font-semibold text-cyan-600 dark:text-cyan-400 font-mono">
                                {info.title}
                              </span>
                              <span className="text-[12px] md:text-xs text-gray-400 dark:text-gray-500">
                                {info.desc}
                              </span>
                            </div>
                            <div className="sm:text-right shrink-0 mt-1 sm:mt-0">
                              <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 text-xs md:text-sm font-semibold font-mono text-gray-800 dark:text-gray-200">
                                {formatClaimValue(key, val)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs md:text-sm text-gray-400 dark:text-gray-500 leading-normal flex flex-col items-center justify-center gap-2">
                  <Lock size={20} className="text-gray-300 dark:text-gray-700" />
                  <span>No claims payload available. Paste a valid token.</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: SIGNATURE */}
          <div className={`bg-white dark:bg-gray-900 rounded-2xl border ${themeColors.borderSignature} overflow-hidden shadow-sm transition`}>
            <div className={`flex justify-between items-center px-5 py-3.5 border-b ${themeColors.borderSignature} ${themeColors.bgSignature}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full bg-rose-500`} />
                <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                  CRYPTOGRAPHIC SIGNATURE VERIFICATION
                </span>
              </div>
            </div>
            
            <div className="p-5">
              {signaturePart ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-gray-50 dark:bg-gray-950/80 rounded-xl p-4 border border-gray-150 dark:border-gray-800/80 font-mono text-xs md:text-sm break-all leading-normal text-rose-600 dark:text-rose-400/90">
                    <span className="text-gray-400 dark:text-gray-500 text-[12px] md:text-xs block mb-1">Raw Signature Bytes (Hex View)</span>
                    {signatureToHex(signaturePart)}
                  </div>

                  {/* Verification outcome panel */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Verification Mode
                      </span>
                      <span className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200">
                        {enableCryptoVerify ? `HMAC Verification (via Web Crypto API)` : "Syntax checks only"}
                      </span>
                    </div>

                    {!enableCryptoVerify ? (
                      <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10 text-blue-700 dark:text-blue-300 text-xs md:text-sm leading-relaxed flex items-start gap-2.5 animate-fadeIn">
                        <Info size={18} className="shrink-0 mt-0.5 text-blue-500" />
                        <div>
                          <strong>Signature present.</strong> Enable the <strong>HMAC Verification</strong> checkbox in 
                          the <em>Advanced Options</em> panel above and provide your signing secret key to verify the signature cryptographically.
                        </div>
                      </div>
                    ) : (
                      <div className="animate-fadeIn">
                        {signatureStatus === "valid" && (
                          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/15 text-emerald-800 dark:text-emerald-400 text-xs md:text-sm leading-relaxed flex items-start gap-2.5">
                            <ShieldCheck size={20} className="shrink-0 text-emerald-500 mt-0.5" />
                            <div>
                              <strong className="font-bold block mb-0.5 text-emerald-700 dark:text-emerald-300">
                                Signature Verified Successfully!
                              </strong>
                              The cryptographically verified signature matches using algorithm <strong>{activeAlg}</strong> 
                              and the provided secret key. The header and payload data have not been altered.
                            </div>
                          </div>
                        )}

                        {signatureStatus === "invalid" && (
                          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/15 text-red-800 dark:text-red-400 text-xs md:text-sm leading-relaxed flex items-start gap-2.5">
                            <ShieldAlert size={20} className="shrink-0 text-red-500 mt-0.5" />
                            <div>
                              <strong className="font-bold block mb-0.5 text-red-700 dark:text-red-300">
                                Signature Verification Failed!
                              </strong>
                              The signature did not match. Ensure that you are using the correct secret key 
                              for algorithm <strong>{activeAlg}</strong>, and that the payload token has not been tampered with.
                            </div>
                          </div>
                        )}

                        {signatureStatus === "unsupported" && (
                          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/15 text-amber-800 dark:text-amber-450 text-xs md:text-sm leading-relaxed flex items-start gap-2.5">
                            <Info size={20} className="shrink-0 text-amber-500 mt-0.5" />
                            <div>
                              <strong className="font-bold block mb-0.5 text-amber-700 dark:text-amber-400">
                                Unsupported Signature Algorithm
                              </strong>
                              Verification is currently supported for HMAC algorithms (<strong>HS256</strong>, <strong>HS384</strong>, or <strong>HS512</strong>) 
                              using browser Web Crypto APIs. Token specifies <strong>{activeAlg}</strong>.
                            </div>
                          </div>
                        )}
                        
                        {signatureStatus === "unchecked" && (
                          <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 text-xs md:text-sm flex items-center gap-2">
                            <RefreshCw size={16} className="animate-spin text-brandColor" />
                            <span>Verifying cryptographic signature...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs md:text-sm text-gray-400 dark:text-gray-500 leading-normal flex flex-col items-center justify-center gap-2">
                  <Unlock size={20} className="text-gray-300 dark:text-gray-700" />
                  <span>No signature verification possible (token signature missing or invalid).</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </ToolPageShell>
  );
}
