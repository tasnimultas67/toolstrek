"use client";

import React, { useState, useRef } from "react";
import ToolPageShell from "../ToolPageShell";
import { toast } from "sonner";
import {
  MailWarning,
  Check,
  Copy,
  Upload,
  Activity,
  FileSpreadsheet,
  Play,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Terminal,
  ArrowRight,
  Search,
  Sparkles,
  RefreshCw,
  FileDown,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Database
} from "lucide-react";

export default function DisposableEmailDetector() {
  const [activeTab, setActiveTab] = useState("single");
  
  // Single Checker States
  const [singleEmail, setSingleEmail] = useState("");
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [singleError, setSingleError] = useState("");
  
  // Bulk Checker States
  const [bulkInput, setBulkInput] = useState("");
  const [bulkEmailsList, setBulkEmailsList] = useState([]);
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Sandbox States
  const [sandboxDomain, setSandboxDomain] = useState("");
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResult, setSandboxResult] = useState(null);
  const [sandboxError, setSandboxError] = useState("");



  // --- Utility Functions ---

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case "Safe":
        return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
      case "Warning":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      case "Risky":
        return "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30";
      default:
        return "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800";
    }
  };

  // --- Single Email Logic ---

  const handleSingleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!singleEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setSingleLoading(true);
    setSingleError("");
    setSingleResult(null);

    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: singleEmail.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSingleResult(data);
      if (data.verdict === "Risky") {
        toast.warning("Disposable or invalid email address detected!");
      } else if (data.verdict === "Warning") {
        toast.info("Validation completed with warnings.");
      } else {
        toast.success("Safe email address detected!");
      }
    } catch (err) {
      setSingleError(err.message);
      toast.error(err.message || "Failed to verify email");
    } finally {
      setSingleLoading(false);
    }
  };

  const handleSuggestionClick = (suggestedEmail) => {
    setSingleEmail(suggestedEmail);
    // Autofill and trigger verification immediately
    setTimeout(() => {
      setSingleEmail(suggestedEmail);
      const fakeEvent = { preventDefault: () => {} };
      // React state update requires triggering lookup after DOM changes
      fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: suggestedEmail }),
      })
        .then((res) => res.json())
        .then((data) => {
          setSingleResult(data);
          toast.success("Autocorrected email checked!");
        });
    }, 50);
  };

  // --- Bulk Emails Logic ---

  const processBulkVerification = async (emailsToVerify) => {
    if (emailsToVerify.length === 0) {
      toast.error("No valid emails found to verify");
      return;
    }

    setBulkLoading(true);
    setBulkResults([]);
    setCurrentProgress(0);

    const chunkSize = 10;
    const totalEmails = emailsToVerify.length;
    let accumulatedResults = [];

    toast.info(`Starting batch scan of ${totalEmails} emails...`);

    for (let i = 0; i < totalEmails; i += chunkSize) {
      const chunk = emailsToVerify.slice(i, i + chunkSize);
      try {
        const response = await fetch("/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: chunk }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Bulk process chunk error");
        }

        accumulatedResults = [...accumulatedResults, ...data.results];
        setBulkResults(accumulatedResults);
        setCurrentProgress(Math.min(100, Math.round(((i + chunk.length) / totalEmails) * 100)));
      } catch (error) {
        console.error("Error processing chunk:", error);
        toast.error(`Error in chunk ${Math.floor(i / chunkSize) + 1}`);
      }
    }

    setBulkLoading(false);
    toast.success("Bulk scan completed successfully!");
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const parsed = bulkInput
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@") && e.length > 3);
    
    if (parsed.length === 0) {
      toast.error("No valid email addresses found in text box");
      return;
    }

    setBulkEmailsList(parsed);
    processBulkVerification(parsed);
  };

  // Drag and Drop Handlers
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const parseCsvEmails = (text) => {
    const lines = text.split(/\r?\n/).map(l => l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
    if (lines.length === 0) return [];
    
    let emailColIndex = 0;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Scan columns to auto-detect email field
    for (let col = 0; col < (lines[0] || []).length; col++) {
      let matchCount = 0;
      for (let row = 0; row < Math.min(lines.length, 5); row++) {
        if (lines[row] && lines[row][col] && emailRegex.test(lines[row][col].trim())) {
          matchCount++;
        }
      }
      if (matchCount > 0) {
        emailColIndex = col;
        break;
      }
    }

    const emails = [];
    for (let row = 0; row < lines.length; row++) {
      if (lines[row] && lines[row][emailColIndex]) {
        const val = lines[row][emailColIndex].replace(/^["']|["']$/g, '').trim();
        if (val && val.includes('@')) {
          emails.push(val);
        }
      }
    }
    return emails;
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    reader.onload = (e) => {
      const text = e.target.result;
      let emails = [];

      if (extension === "csv") {
        emails = parseCsvEmails(text);
      } else {
        // Assume text file: line by line
        emails = text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.includes("@") && line.length > 3);
      }

      if (emails.length === 0) {
        toast.error("Could not find any emails in the file. Ensure the structure is correct.");
        return;
      }

      setBulkEmailsList(emails);
      processBulkVerification(emails);
    };

    reader.readAsText(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleExportCSV = () => {
    if (bulkResults.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Email,Username,Domain,Syntax Valid,Disposable,Role Based,Free Provider,Deliverability Score,Verdict,Checks Summary\n";
    
    bulkResults.forEach((res) => {
      const row = [
        `"${res.email}"`,
        `"${res.username}"`,
        `"${res.domain}"`,
        res.isValidSyntax ? "Yes" : "No",
        res.isDisposable ? "Yes" : "No",
        res.isRoleBased ? "Yes" : "No",
        res.isFreeProvider ? "Yes" : "No",
        res.score,
        `"${res.verdict}"`,
        `"${res.details.join('; ')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `verified_emails_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded!");
  };

  // --- Domain Sandbox Logic ---

  const handleSandboxVerify = async (e) => {
    e.preventDefault();
    if (!sandboxDomain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    // Basic domain validation
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(sandboxDomain.trim())) {
      toast.error("Please enter a valid domain format (e.g. example.com)");
      return;
    }

    setSandboxLoading(true);
    setSandboxError("");
    setSandboxResult(null);

    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: sandboxDomain.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sandbox lookup failed");
      }

      setSandboxResult(data);
      toast.success("Domain analysis completed!");
    } catch (err) {
      setSandboxError(err.message);
      toast.error(err.message || "Failed to analyze domain");
    } finally {
      setSandboxLoading(false);
    }
  };



  // --- SVG Charts Calculations for Bulk Tab ---
  
  const getBulkStats = () => {
    if (bulkResults.length === 0) return { safe: 0, warning: 0, risky: 0, total: 0 };
    const safe = bulkResults.filter(r => r.verdict === "Safe").length;
    const warning = bulkResults.filter(r => r.verdict === "Warning").length;
    const risky = bulkResults.filter(r => r.verdict === "Risky").length;
    return { safe, warning, risky, total: bulkResults.length };
  };

  const stats = getBulkStats();

  return (
    <ToolPageShell widthClassName="max-w-7xl px-4 pt-20 pb-10">
      <div className="space-y-8">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brandColor/10 dark:bg-brandColor/20 text-brandColor dark:text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security & Reputation Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-brandColor to-indigo-600 dark:from-brandColor dark:to-purple-400 bg-clip-text text-transparent leading-tight">
            Disposable Email Detector
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
            Protect your database from fake accounts and spam. Verify email validity, lookup live DNS MX servers, detect role accounts, and batch scan lists.
          </p>
        </div>

        {/* Custom Tab Selector */}
        <div className="flex justify-center">
          <div className="flex p-1.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl shadow-inner">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                activeTab === "single"
                  ? "bg-white dark:bg-gray-800 text-brandColor dark:text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Single Check
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                activeTab === "bulk"
                  ? "bg-white dark:bg-gray-800 text-brandColor dark:text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Bulk Scanner
            </button>
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                activeTab === "sandbox"
                  ? "bg-white dark:bg-gray-800 text-brandColor dark:text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <Globe className="w-4 h-4" />
              Domain Sandbox
            </button>

          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: SINGLE EMAIL CHECKER */}
        {/* ---------------------------------------------------- */}
        {activeTab === "single" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Input Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50">
              <form onSubmit={handleSingleVerify} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500">
                    <MailWarning className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    placeholder="Enter email address (e.g. user@mailinator.com or admin@gmail.com)"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-brandColor/50 focus:border-brandColor text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition outline-none"
                    disabled={singleLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={singleLoading}
                  className="px-6 py-3.5 bg-brandColor hover:bg-brandColorHover text-white font-semibold rounded-2xl shadow-lg shadow-brandColor/25 hover:shadow-brandColor/35 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {singleLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  <span>Verify Email</span>
                </button>
              </form>

              {singleError && (
                <div className="mt-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-2xl flex items-start gap-2 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{singleError}</span>
                </div>
              )}
            </div>

            {/* Results Panel */}
            {singleLoading && !singleResult && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-12 h-12 border-4 border-brandColor border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Resolving DNS records and analyzing domain safety...</p>
              </div>
            )}

            {singleResult && !singleLoading && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Score Circular Gauge */}
                <div className="md:col-span-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 flex flex-col items-center justify-center text-center">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-6 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-brandColor" />
                    Deliverability Score
                  </h3>

                  {/* SVG Gauge */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={singleResult.score >= 80 ? "#10b981" : singleResult.score >= 40 ? "#f59e0b" : "#f43f5e"} />
                          <stop offset="100%" stopColor={singleResult.score >= 80 ? "#06b6d4" : singleResult.score >= 40 ? "#ea580c" : "#e11d48"} />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-gray-100 dark:stroke-gray-800/80"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="url(#scoreGrad)"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={377}
                        strokeDashoffset={377 - (singleResult.score / 100) * 377}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-gray-950 dark:text-white">
                        {singleResult.score}
                      </span>
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Quality
                      </span>
                    </div>
                  </div>

                  {/* Verdict Badge */}
                  <div className="mt-6 space-y-2 w-full">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getVerdictBadge(singleResult.verdict)}`}>
                      {singleResult.verdict} Email
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {singleResult.verdict === "Safe" 
                        ? "This email is highly deliverable and safe to add to your user database."
                        : singleResult.verdict === "Warning"
                        ? "Email works, but flags role-based, typo, or personal free usage."
                        : "High chance of delivery failure or temporary throwaway account."}
                    </p>
                  </div>
                </div>

                {/* Checklist & Results */}
                <div className="md:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 space-y-6">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-brandColor" />
                    Verification Breakdown
                  </h3>

                  {/* 5-Point Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Check 1 */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl">
                      {singleResult.isValidSyntax ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase">Syntax Format</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {singleResult.isValidSyntax ? "Valid Syntax" : "Invalid Syntax"}
                        </p>
                      </div>
                    </div>

                    {/* Check 2 */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl">
                      {singleResult.mxCheckStatus === "resolved" ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      ) : singleResult.mxCheckStatus === "skipped" ? (
                        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase">MX Mail Servers</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {singleResult.mxCheckStatus === "resolved" ? "Active DNS MX" : singleResult.mxCheckStatus === "skipped" ? "Skipped Check" : "No MX Found"}
                        </p>
                      </div>
                    </div>

                    {/* Check 3 */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl">
                      {!singleResult.isDisposable ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase">Disposable Check</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {!singleResult.isDisposable ? "Safe Domain" : "Disposable Email"}
                        </p>
                      </div>
                    </div>

                    {/* Check 4 */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl">
                      {!singleResult.isRoleBased ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase">Account Type</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {singleResult.isRoleBased ? "Role Address" : "Personal / User"}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Spelling Typo correction alerts */}
                  {singleResult.typoSuggestion && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm text-amber-800 dark:text-amber-300">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <span>Possible typo. Did you mean <strong>{singleResult.typoSuggestion}</strong>?</span>
                      </div>
                      <button
                        onClick={() => handleSuggestionClick(`${singleResult.username}@${singleResult.typoSuggestion}`)}
                        className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Apply Fix
                      </button>
                    </div>
                  )}

                  {/* Findings Logs */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Analysis Logs</p>
                    <ul className="space-y-1.5">
                      {singleResult.details.map((detail, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-brandColor rounded-full mt-1.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* MX Hostnames details */}
                  {singleResult.mxRecords.length > 0 && (
                    <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-brandColor" />
                        Resolved DNS MX Hostnames
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-3 max-h-28 overflow-y-auto border border-gray-100 dark:border-gray-800">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-900">
                              <th className="pb-1.5 font-semibold">Priority</th>
                              <th className="pb-1.5 font-semibold">Mail Exchanger Hostname</th>
                            </tr>
                          </thead>
                          <tbody>
                            {singleResult.mxRecords.map((rec, i) => (
                              <tr key={i} className="text-gray-600 dark:text-gray-300 font-mono">
                                <td className="py-1.5">{rec.priority}</td>
                                <td className="py-1.5">{rec.exchange}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: BULK SCANS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "bulk" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            
            {/* Split layout: Upload box & text area paste */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Drag and Drop Zone */}
              <div className="md:col-span-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg flex items-center gap-1.5">
                    <Upload className="w-4.5 h-4.5 text-brandColor" />
                    File Upload Check
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upload a raw <code>.csv</code> or <code>.txt</code> file containing email addresses (up to 100 entries per file).
                  </p>
                </div>

                {/* Drop Target Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`mt-4 border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition duration-300 relative ${
                    dragActive
                      ? "border-brandColor bg-brandColor/5"
                      : "border-gray-200 dark:border-gray-800 hover:border-brandColor dark:hover:border-brandColor/50 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="p-4 bg-brandColor/10 dark:bg-brandColor/25 rounded-full mb-3 text-brandColor dark:text-purple-300">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                    Drag and drop file here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supports .CSV (auto-detects columns) or .TXT (one email per line)
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brandColor hover:underline">
                    Browse Files <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Text Area Paste Box */}
              <div className="md:col-span-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4.5 h-4.5 text-brandColor" />
                    Copy-Paste List
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Paste email addresses below, separated by commas, spaces, or newlines (up to 100 entries).
                  </p>
                </div>

                <form onSubmit={handleBulkSubmit} className="mt-4 flex flex-col flex-1 gap-4">
                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="paste emails here... e.g.&#10;test1@gmail.com,&#10;spamuser@yopmail.com,&#10;sales@yourdomain.com"
                    rows="6"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-brandColor/50 focus:border-brandColor text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition outline-none font-mono text-sm resize-none"
                    disabled={bulkLoading}
                  />
                  <button
                    type="submit"
                    disabled={bulkLoading}
                    className="w-full py-3.5 bg-brandColor hover:bg-brandColorHover text-white font-semibold rounded-2xl shadow-lg shadow-brandColor/25 hover:shadow-brandColor/35 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {bulkLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    <span>Process List ({bulkInput.split(/[\n,]/).filter(e => e.trim().includes('@')).length} detected)</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Live Progress Bar */}
            {bulkLoading && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Scanning in batches...</span>
                  <span className="font-bold text-brandColor">{currentProgress}% Done</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brandColor to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Bulk Scan Results Analytics */}
            {bulkResults.length > 0 && (
              <div className="space-y-6">
                
                {/* Visual Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Stats Counter */}
                  <div className="md:col-span-7 grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Scanned</span>
                      <span className="text-3xl font-black text-gray-950 dark:text-white mt-2">{stats.total}</span>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Safe Emails</span>
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{stats.safe}</span>
                    </div>
                    <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Warnings (Typo/Roles)</span>
                      <span className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">{stats.warning}</span>
                    </div>
                    <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Risky / Disposable</span>
                      <span className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">{stats.risky}</span>
                    </div>
                  </div>

                  {/* SVG Animated Donut Chart */}
                  <div className="md:col-span-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-lg flex items-center justify-around">
                    
                    {/* Simple native SVG donut */}
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background */}
                        <circle cx="56" cy="56" r="45" className="stroke-gray-100 dark:stroke-gray-800/80" strokeWidth="12" fill="transparent" />
                        
                        {/* Safe Segment */}
                        {stats.safe > 0 && (
                          <circle
                            cx="56"
                            cy="56"
                            r="45"
                            className="stroke-emerald-500"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={283}
                            strokeDashoffset={283 - (stats.safe / stats.total) * 283}
                            strokeLinecap="round"
                          />
                        )}

                        {/* Warning Segment */}
                        {stats.warning > 0 && (
                          <circle
                            cx="56"
                            cy="56"
                            r="45"
                            className="stroke-amber-500"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={283}
                            strokeDashoffset={283 - ((stats.safe + stats.warning) / stats.total) * 283}
                            strokeLinecap="round"
                          />
                        )}

                        {/* Risky Segment */}
                        {stats.risky > 0 && (
                          <circle
                            cx="56"
                            cy="56"
                            r="45"
                            className="stroke-rose-500"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={283}
                            strokeDashoffset={283 - ((stats.safe + stats.warning + stats.risky) / stats.total) * 283}
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs text-gray-400 font-bold uppercase">Safe</span>
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                          {Math.round((stats.safe / stats.total) * 100) || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Safe: {stats.safe}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 bg-amber-500 rounded-full" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Warning: {stats.warning}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 bg-rose-500 rounded-full" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Risky: {stats.risky}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Scanned Emails Table List */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg flex items-center gap-1.5">
                      <Activity className="w-4.5 h-4.5 text-brandColor" />
                      Verification List
                    </h3>
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 border border-brandColor text-brandColor hover:bg-brandColor hover:text-white dark:hover:bg-brandColor dark:text-purple-300 font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      Export CSV Report
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 border-b border-gray-100 dark:border-gray-800 font-semibold">
                          <th className="p-4">Email Address</th>
                          <th className="p-4">Verdict</th>
                          <th className="p-4 text-center">Quality Score</th>
                          <th className="p-4">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkResults.map((res, i) => (
                          <tr key={i} className="border-b border-gray-100 dark:border-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                            <td className="p-4 font-mono font-semibold text-xs sm:text-sm max-w-xs truncate">{res.email}</td>
                            <td className="p-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getVerdictBadge(res.verdict)}`}>
                                {res.verdict}
                              </span>
                            </td>
                            <td className="p-4 text-center font-black">{res.score}</td>
                            <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                              {res.details.slice(0, 2).join(", ")}
                              {res.details.length > 2 && " ..."}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: DOMAIN PLAYGROUND / SANDBOX */}
        {/* ---------------------------------------------------- */}
        {activeTab === "sandbox" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Input Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg flex items-center gap-1.5">
                  <Globe className="w-4.5 h-4.5 text-brandColor" />
                  Domain Integrity Checker
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lookup domain MX records and spam reputation score. Verify if a domain runs temporary email routing infrastructure.
                </p>
              </div>

              <form onSubmit={handleSandboxVerify} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500">
                    <Globe className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={sandboxDomain}
                    onChange={(e) => setSandboxDomain(e.target.value)}
                    placeholder="Enter domain name (e.g. tempmail.com, mailinator.com, google.com)"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-brandColor/50 focus:border-brandColor text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition outline-none"
                    disabled={sandboxLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sandboxLoading}
                  className="px-6 py-3.5 bg-brandColor hover:bg-brandColorHover text-white font-semibold rounded-2xl shadow-lg shadow-brandColor/25 hover:shadow-brandColor/35 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sandboxLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span>Scan Domain</span>
                </button>
              </form>

              {sandboxError && (
                <div className="mt-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-2xl flex items-start gap-2 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{sandboxError}</span>
                </div>
              )}
            </div>

            {/* Sandbox Loading */}
            {sandboxLoading && !sandboxResult && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-12 h-12 border-4 border-brandColor border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Querying global WHOIS & DNS servers...</p>
              </div>
            )}

            {/* Sandbox Result */}
            {sandboxResult && !sandboxLoading && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Reputation gauge */}
                <div className="md:col-span-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 flex flex-col items-center justify-center text-center">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-6 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-brandColor" />
                    Reputation Score
                  </h3>

                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <defs>
                        <linearGradient id="reputationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={sandboxResult.reputationScore >= 80 ? "#10b981" : sandboxResult.reputationScore >= 40 ? "#f59e0b" : "#f43f5e"} />
                          <stop offset="100%" stopColor={sandboxResult.reputationScore >= 80 ? "#06b6d4" : sandboxResult.reputationScore >= 40 ? "#ea580c" : "#e11d48"} />
                        </linearGradient>
                      </defs>
                      <circle cx="72" cy="72" r="60" className="stroke-gray-100 dark:stroke-gray-800/80" strokeWidth="10" fill="transparent" />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="url(#reputationGrad)"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={377}
                        strokeDashoffset={377 - (sandboxResult.reputationScore / 100) * 377}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-gray-950 dark:text-white">
                        {sandboxResult.reputationScore}
                      </span>
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Health
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 w-full">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getVerdictBadge(sandboxResult.verdict)}`}>
                      {sandboxResult.verdict} Reputation
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sandboxResult.reputationScore >= 80
                        ? "Domain runs healthy, corporate standard email infrastructure."
                        : sandboxResult.reputationScore >= 40
                        ? "Low health score. Review DNS details below."
                        : "Identified as a high-risk throwaway temporary provider."}
                    </p>
                  </div>
                </div>

                {/* DNS details list */}
                <div className="md:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/50 space-y-6">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg border-b border-gray-100 dark:border-gray-800 pb-3">
                    Domain Security Integrity
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="text-gray-500">Domain Checked</span>
                      <span className="font-bold font-mono">{sandboxResult.domain}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="text-gray-500">Listed in Blocklist Database</span>
                      <span className={`font-bold ${sandboxResult.inDatabase ? "text-rose-500" : "text-emerald-500"}`}>
                        {sandboxResult.inDatabase ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="text-gray-500">Known Free/Public Provider</span>
                      <span className="font-bold">
                        {sandboxResult.isFree ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="text-gray-500">MX DNS Resolution Status</span>
                      <span className={`font-bold ${sandboxResult.mxStatus === "resolved" ? "text-emerald-500" : "text-rose-500"}`}>
                        {sandboxResult.mxStatus === "resolved" ? "Active Records" : sandboxResult.mxStatus === "timeout" ? "Timed Out" : "No Records"}
                      </span>
                    </div>
                  </div>

                  {/* MX details */}
                  {sandboxResult.mxRecords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Mail Exchange Servers</p>
                      <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 font-mono text-xs max-h-36 overflow-y-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-900">
                              <th className="pb-1.5 font-semibold">Priority</th>
                              <th className="pb-1.5 font-semibold">Server Hostname</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sandboxResult.mxRecords.map((rec, index) => (
                              <tr key={index} className="text-gray-700 dark:text-gray-300">
                                <td className="py-1">{rec.priority}</td>
                                <td className="py-1 truncate max-w-xs">{rec.exchange}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}
          </div>
        )}



      </div>
    </ToolPageShell>
  );
}
